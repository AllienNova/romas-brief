# ADR-0006 — Audio QA State Machine with Schema-Enforced Publish Gate

| Field | Value |
|---|---|
| Status | Accepted (retroactive — CLAUDE.md §4 rule 6, §5) |
| Date | 2026-05-14 |
| Confidence | High |
| Deciders | Kimal Honour Djam |
| Sources | CLAUDE.md §4 (rule 6), §5 (state machine); AGENT.md §12 (state machines, flip conditions); `.claude/skills/cms-schema.md:96-103` (publish constraint); `.claude/skills/audio-production-pipeline.md:63-73` (pipeline, state machine) |

---

## Context

Inviolable Rule 6 (CLAUDE.md §4): **No audio goes live without editorial QA pass.** Specifically: `clinical_claims_checked: true` AND `qa_reviewer` set are required to flip `audio_status` from `in_review` → `published`.

This rule exists because:

1. ROMAS Wire operates in a clinical domain where a mispronounced drug, an incorrect dose in the audio script, or an unchecked claim causes compounding trust damage that text corrections alone cannot repair — the audio episode may already be in subscriber libraries.
2. Audio is harder to correct post-publish than text: existing downloads are unaffected by server-side changes; RSS feed updates require listeners to re-sync.
3. The revoke path exists (60s CDN purge) but is a break-glass mechanism, not a routine correction tool.

The question this ADR addresses: **where** is the gate enforced — in the application layer, in the schema, or both?

---

## Decision

Enforce the audio publish gate **at the Postgres schema layer** via a CHECK constraint, backed by application-layer enforcement in the CMS and `audio-qa-reviewer` subagent.

The schema constraint (`cms-schema.md:96-103`):

```sql
constraint audio_publish_requires_qa check (
  audio_status <> 'published'
  or (clinical_claims_checked = true
      and qa_reviewer is not null
      and loudness_lufs between -18 and -14  -- ADR-0016 widen; -16 ±1 target in audio-qa-reviewer agent
      and true_peak_dbtp <= -1
      and transcript_url is not null)
)
```

Five conditions must all hold for `audio_status = 'published'` to be accepted by Postgres. Any `UPDATE` that sets `audio_status = 'published'` without satisfying all five is rejected at the DB layer — not by application code.

State machine (AGENT.md §12):

```
queued → generating → in_review → (published | skipped)
published → revoked   (post-publish kill switch only)
```

Application-layer enforcement: `audio-qa-reviewer` subagent owns the `in_review → published` flip. RLS policy restricts this UPDATE to `audio_qa` role users only (cms-schema.md, RLS section). No other role can write `audio_status = 'published'`.

Revoke path: `published → revoked` requires `revoke_reason IS NOT NULL` (separate CHECK constraint, cms-schema.md:104-106). CDN purge is triggered by `cdn-purge-watchdog` worker on status change.

---

## Alternatives Considered

### Application-layer-only enforcement (no schema constraint)

Rejected. Application-layer enforcement can be bypassed by:
- A future agent or script that writes directly to the DB.
- A migration that bulk-updates rows.
- A developer running `psql` in production under time pressure.

Schema constraints are the last line of defense. They cannot be bypassed without altering the table definition — a deliberate, auditable action. For a clinical-domain publish gate, application-layer-only enforcement is not sufficient.

### Manual publish (no automated pipeline, Kimal reviews and publishes by hand)

Rejected for audio production, acceptable for QA gate. Manual production of audio (recording, editing, loudness mastering) does not scale to Mon–Fri daily cadence. The automated pipeline (ElevenLabs → loudnorm → R2 → transcript) is required to produce the audio artifact. The QA gate is manual by design — Kimal reviews and approves — but the enforcement mechanism is automated (schema constraint blocks auto-flip).

### Two-person rule from day 1

Rejected at launch. CLAUDE.md §3 locked decision 5 (subscriber count hidden until 2,500) and AGENT.md §2 (`audio-qa-reviewer` is Kimal solo at launch; second reviewer by Day 30) establish that a solo reviewer is the Day 1 posture. Requiring two reviewers before launch creates an organizational dependency that blocks the Day 1 timeline. The schema constraint allows the second-reviewer requirement to be added as an additional RLS policy without altering the CHECK constraint.

### Separate QA service (microservice, not schema constraint)

Rejected. Introducing a dedicated QA microservice would add a network hop on every audio status read, a new deployment unit to maintain, and a potential single point of failure. The Postgres CHECK constraint achieves the same guarantee within the existing Supabase deployment with zero additional infrastructure.

---

## Consequences

**Positive**
- The publish gate is unbypassable without a table ALTER — any attempt to auto-flip `audio_status = 'published'` without QA fields set produces a Postgres constraint violation, not a silent success.
- All five conditions are auditable from the `audio_jobs` row: `clinical_claims_checked`, `qa_reviewer`, `loudness_lufs`, `true_peak_dbtp`, `transcript_url` are first-class columns, not metadata in a separate audit table.
- Adding a second reviewer requirement (Day 30 target per AGENT.md §2) requires only a new RLS policy or application check — the schema constraint does not need to change.
- Revoke path is equally constrained: `revoke_reason IS NOT NULL` is schema-enforced, preventing silent revocations.

**Negative**
- Constraint violations surface as Postgres errors in the application layer. The CMS must translate these into user-facing messages ("Audio cannot be published: transcript URL missing") rather than displaying a raw constraint name.
- Loudness tolerance is `BETWEEN -18 AND -14` (ADR-0016 widen from cycle-1 F-P1-01's `[-17, -15]`). This is a 4 LUFS broadcast speech safe band centred on the -16 LUFS production target. Episodes mastered to anywhere in `[-18, -14]` pass the DB gate; episodes at -18.01 LUFS or -13.99 LUFS fail. The tight `-16 ±1` production target is enforced by the audio-qa-reviewer agent (soft amber warning outside `[-17, -15]`, hard reject only outside `[-18, -14]`). The audio-producer pipeline's two-pass loudnorm (audio-production-pipeline.md:79-88) targets `-16` with enough precision to land inside the tight window on first pass; misses re-master once and accept inside the broader DB gate.
- `true_peak_dbtp <= -1` is checked at the DB layer but measured by ffmpeg. If the loudnorm pipeline produces a file with true peak of -0.9 dBTP, the constraint blocks publish. The pipeline must measure and store `true_peak_dbtp` accurately before attempting the status flip.

**Neutral**
- `skipped` status requires `skip_reason IS NOT NULL` (cms-schema.md:107-109) — symmetric enforcement for the non-publish outcome.
- Article publish (`articles.status`) has its own state machine (`draft → in_review → ready_to_publish → published → revoked | corrected`) and is independent of `audio_jobs.audio_status`. An article can ship `published` with all audio jobs in `skipped` — this is the intended fallback when audio production fails.

---

## Revisit Triggers

- ~~Loudness tolerance window (`-17 to -15 LUFS`) is too narrow for a specific audio archetype (e.g., Conference Brief recorded in ambient environments) — widen the constraint via migration and update the audio production pipeline accordingly.~~ **Triggered cycle build-2026-05-21 → ADR-0016 widened DB gate to `[-18, -14]`; tight `[-17, -15]` production target moved to the audio-qa-reviewer agent layer.**
- A second reviewer requirement is added at Day 30 — implement as a new RLS policy or application check; this ADR does not need to change.
- An automated QA agent (not Kimal) is trusted to flip the publish gate — requires a deliberate policy decision and a new QA reviewer row seeded with the agent's identity. Document in AGENT.md §13.

---

## Historical Context

The schema-enforced QA gate was specified in `.claude/skills/cms-schema.md:96-103` from planning-kit inception (2026-05-12) as a single Postgres CHECK constraint binding **five** conditions together: `clinical_claims_checked = true`, `qa_reviewer IS NOT NULL`, `loudness_lufs BETWEEN -17 AND -15`, `true_peak_dbtp <= -1`, `transcript_url IS NOT NULL`. The five-condition count is canonical and matches `contracts/supabase-schema.sql:123-130`. Cycle-1 critic flagged (F-P1-01) that downstream docs had drifted to four conditions (SSOT §7, FR-009, ADR-0006 narrative, CLAUDE.md §4 rule 6 paraphrase); cycle-2 propagates the canonical five everywhere. No alternative was compared at decision time — the schema-layer enforcement was chosen because it's the only place an inviolable rule survives bypass attempts by any application code path, future agent, or accidental migration. App-layer-only enforcement would have left the rule one bug away from being violated.

*Accepted retroactively 2026-05-14 per CLAUDE.md §4 rule 6. Constraint text at cms-schema.md:96-103 + contracts/supabase-schema.sql:123-130 is authoritative. Historical Context added cycle-2 per critic F-P1-05.*
