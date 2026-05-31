# ADR-0002 — Supabase + Postgres 15 + Row-Level Security

| Field | Value |
|---|---|
| Status | Accepted (retroactive — CLAUDE.md §7) |
| Date | 2026-05-14 |
| Confidence | High |
| Deciders | Kimal Honour Djam |
| Sources | CLAUDE.md §7; `.claude/skills/cms-schema.md` (full schema, 10 migrations); AGENT.md §12 (state machines) |

---

## Context

ROMAS Wire requires a persistent store for:

- Articles with multi-status lifecycle (`draft → published → revoked`).
- Audio jobs with a publish-gated state machine (`queued → in_review → published | skipped`).
- Clinical claims requiring verified citation trails per article.
- Subscribers with tier preferences for email delivery.
- Embargo holds, lexicon entries, source health logs, revocation audit trail.

The store must enforce the six inviolable rules at the schema layer — not just in application code — because application code can be bypassed by direct DB access, migrations, or future agents. The two most critical schema constraints are:

1. `articles.primary_source_url NOT NULL` — enforces Rule 1 (no source, no publish).
2. `audio_jobs` constraint `audio_publish_requires_qa` — enforces Rule 6 (no audio without QA pass); see `.claude/skills/cms-schema.md:96-103`.

The system will also need full-text search and vector similarity search (for deduplication of ingested items). Authentication for the CMS must be tied to the same user identity that owns `qa_reviewers` rows.

---

## Decision

Use **Supabase** as the managed Postgres 15 host, with:

- **Row-Level Security (RLS) on by default** for every table (`.claude/skills/cms-schema.md` line 8).
- **Supabase Auth** for CMS user identity — `auth.uid()` used in RLS policies.
- **pgvector** extension for semantic deduplication embeddings.
- **Postgres full-text search** (tsvector) for article and source search.
- **Migrations** in `supabase/migrations/` with numbered SQL files — 10 migrations defined in order (cms-schema.md, migration order section).
- **Supabase Vault** for application-level secrets that require rotation without redeployment.

RLS policies enforce role separation: public read only `published` articles; `editor_in_chief` can flip `ready_to_publish → published`; only `audio_qa` reviewers can flip `audio_status = published`.

---

## Alternatives Considered

### Neon + Drizzle ORM

Rejected. Neon provides serverless Postgres with a good TypeScript story via Drizzle. However, it does not include Auth or Storage, requiring additional vendors for both. Supabase bundles Auth, Storage (though R2 is used for audio), and Realtime in one platform — reducing the vendor surface at this stage. RLS in Neon requires the same Postgres policies, so there is no schema-layer advantage.

### Firebase (Firestore)

Rejected. Firestore's document model does not map cleanly to the relational constraints required (foreign keys, CHECK constraints, generated columns). Schema-enforced invariants like `audio_publish_requires_qa` are Postgres CHECK constraints — they cannot be replicated in Firestore without application-layer workarounds that can be bypassed. Full-text and vector search would require additional tooling.

### Raw Postgres (self-managed, e.g., on Fly.io)

Rejected. Supabase provides Auth, RLS tooling, the Supabase client SDK, and the migration CLI at no configuration overhead compared to a self-managed Postgres. Self-managing Postgres adds operational burden (backups, HA, connection pooling via pgBouncer) that is not justified at ROMAS Wire's current scale. Supabase already handles pgBouncer in session mode for Workers.

### PlanetScale (MySQL)

Rejected. MySQL does not support CHECK constraints with subqueries, does not have pgvector, and has weaker RLS primitives. The `audio_publish_requires_qa` constraint depends on multi-column CHECK semantics available in Postgres.

---

## Consequences

**Positive**
- Schema-layer enforcement of the six inviolable rules. No application code path can publish audio without `clinical_claims_checked = true` and `qa_reviewer IS NOT NULL` (cms-schema.md:96-103).
- `articles.primary_source_url NOT NULL` at the Postgres layer — no migration or INSERT can produce a sourceless article.
- Auth and RLS share the same `auth.uid()` context — no separate identity mapping layer.
- pgvector deduplication available without additional service.
- Supabase Realtime enables future live-update of audio status in the CMS AudioPlayer without polling.

**Negative**
- Supabase managed platform introduces vendor lock-in on the hosted layer (though the underlying Postgres schema is portable).
- Connection pooling must be configured correctly for Cloudflare Workers (session mode, not transaction mode, to support `auth.uid()` in RLS).
- RLS policies add query plan complexity; EXPLAIN ANALYZE required for queries on large tables as article count grows.

**Neutral**
- `subscriber_count` view (cms-schema.md:276-278) returns zero-safe count; homepage hides it below 2,500 (CLAUDE.md §3, locked decision 5) — application logic, not schema logic.

---

## Revisit Triggers

- Supabase connection limits become a ceiling with scaled Worker concurrency and pgBouncer session mode cannot bridge the gap — evaluate Neon's serverless driver (HTTP-based, no persistent connections) at that point.
- Supabase pricing crosses a threshold that makes self-managed Postgres cost-competitive at scale.
- A compliance requirement (e.g., HIPAA BAA) demands a deployment region not supported by Supabase's managed offering.

---

## Historical Context

The Supabase + Postgres + RLS choice was de-facto present in the ROMAS Wire planning kit from inception (CLAUDE.md §7 + the full `cms-schema.md` skill specifying 10 migrations + RLS policies + schema CHECK constraints, all dated 2026-05-12 per AGENT.md §13 line 213). No structured alternative comparison was documented at the time — the choice was made implicitly because Supabase bundles the four things ROMAS Wire needs (managed Postgres + RLS + Auth + pgvector) at the lowest operational overhead for a 1-person ops org. The retroactive ratification here is honest: had the comparison happened up-front against Neon/Firebase/raw-Postgres/PlanetScale, this ADR believes Supabase still wins for the specific reason that schema-layer CHECK constraints carry inviolable rules, and only managed Postgres makes that cheap. The alternatives section above documents the comparison post-hoc, not the original decision flow.

*Accepted retroactively 2026-05-14 per CLAUDE.md §7 and cms-schema.md full schema spec; Historical Context added cycle-2 per critic F-P1-05.*
