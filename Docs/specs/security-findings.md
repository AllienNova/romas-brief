---
title: Security Findings — ROMAS Brief
version: 1.0.0
date: 2026-05-14
scope: planning kit + target architecture (repo is code-empty)
methodology: documentation review + threat model on the documented contracts
---

# Security Findings — ROMAS Brief

## Scope

No code exists. Findings derive from threat modeling against the documented contracts (CLAUDE.md, AGENT.md, `.claude/skills/cms-schema.md`, `.claude/skills/audio-production-pipeline.md`). Re-run this audit once apps + workers land.

## Threat model summary

- **Assets**: editorial content integrity, audio integrity, subscriber email list, voice clone artifacts (TTS), audit chain (claims → primary source).
- **Adversaries**: opportunistic SEO scrapers, content thieves, competitor agents, voice-clone impersonators, embargo leakers, supply-chain attackers (dep takeover).
- **Out of scope**: PHI / patient data (none ingested per Master Strategy §7.1), payment data (no paid tier at launch).

## Findings

### F-S-001 [P1] Revoke kill-switch has no failure path
- **Category**: Operational integrity
- **Source**: CLAUDE.md §5 + audio-production-pipeline.md:118-129
- **Description**: 60s CDN purge SLA is documented. `revocations.cdn_purge_at` is recorded. No watchdog, no alert, no retry if the Cloudflare API returns non-2xx. A failed purge leaves revoked audio (potentially clinically harmful) live indefinitely.
- **Evidence**: `cms-schema.md:250-260` (table definition); `audio-production-pipeline.md:118-129` (SLA mention); no worker file exists.
- **Recommendation**: Implement `workers/cdn-purge-watchdog` that runs every minute, scans `revocations` rows with `cdn_purge_at IS NULL AND created_at < now() - interval '90 seconds'`, retries the purge, and alerts via Sentry + email on continued failure. Tracked as R-211.
- **Maps to**: G-010 → R-211 → A-059, A-060.

### F-S-002 [P1] RLS bypass for subscriber_count via service-role
- **Category**: Information disclosure / business-rule violation
- **Source**: cms-schema.md:262-279
- **Description**: The hidden-until-2,500 rule (SSOT §3 row 5) is a business invariant. The `subscriber_count` view is queryable; service-role keys bypass RLS by design (Supabase contract). Any Worker carrying the service-role key (Audio producer, RSS publisher) can read the true count and could inadvertently leak it.
- **Evidence**: cms-schema.md:277-279 view definition (no RLS); no app-layer guard documented.
- **Recommendation**: Enforce at app layer in `apps/reader`: a server component reads the view via service-role, but renders count only if `total >= 2500`; otherwise renders the locked qualitative string from SSOT. Code never exposes the raw count to the client. Tracked as R-015 → A-130.
- **Maps to**: G-015.

### F-S-003 [P2] Voice clone consent undocumented
- **Category**: Legal / reputational
- **Source**: audio-production-pipeline.md:10-11
- **Description**: ElevenLabs custom voice ID and PlayHT cloned voice ID are listed in env vars. Voice donor identity, consent scope (commercial, indefinite vs time-bounded), and withdrawal procedure are not documented. For a professional medical audience, publishing audio under a cloned voice whose consent status is unclear is a non-trivial reputational and legal risk. Vendor TOS terms vary (ElevenLabs Voice Library has different licensing than Voice Lab).
- **Recommendation**: Author `Docs/voice-consent-registry.md` with: voice donor name, signed consent document reference, scope (commercial use indefinite), withdrawal procedure, fallback voice. Reference from `audio-production-pipeline.md`. Block M1 close on Kimal sign-off. Tracked as R-110.
- **Maps to**: G-013 → R-110, R-213 → A-124.

### F-S-004 [P2] EUDAMED secondary-source workaround contradicts Rule 4
- **Category**: Editorial integrity / inviolable-rule violation
- **Source**: Launch Plan §7
- **Description**: Source health flags EUDAMED as partial and authorizes `meddeviceguide.com` and `MDCG.eu` as fallback "trusted secondary sources." Rule 4 prohibits secondary sources as primary. The workaround opens a documented exception to an inviolable rule.
- **Recommendation**: Document explicit official EU fallback chain (EUDAMED API → NB-OG register → MDCG official PDF, never `meddeviceguide.com` as primary). Restrict `meddeviceguide.com` to discovery only, never citation. Tracked as R-014 → A-139.
- **Maps to**: G-014.

### F-S-005 [P2] Secrets hygiene not codified
- **Category**: Supply chain / credentials
- **Source**: audio-production-pipeline.md:160-171 (11 env vars listed; no `.env.example`, no `SECRETS.md`)
- **Description**: 11 named env vars are spread across skill files. Without a single `.env.example`, contributors can omit, misname, or hardcode keys. Without `SECRETS.md`, rotation cadence is undefined.
- **Recommendation**: Author `.env.example` (all 11 + Supabase + Resend + Cloudflare + Sentry placeholders) and `SECRETS.md` (rotation policy 90d routine + immediate on personnel change; secret-store assignments). Reject PRs that introduce a secret pattern not in `.env.example`. Tracked as R-111, R-112.
- **Maps to**: G-019.

### F-S-006 [P2] Service-role key blast radius
- **Category**: Privilege management
- **Source**: cms-schema.md:283-307 (RLS examples), no documented isolation strategy
- **Description**: Workers carrying the Supabase service-role key bypass all RLS. If a Worker is compromised (supply-chain attack on a dep, leaked env, prompt-injection in editorial-director), the attacker has the keys to the entire DB.
- **Recommendation**: (a) Only `workers/cms-writer` Worker carries the service-role key, all others use scoped JWTs. (b) Service-role usage is logged via Supabase audit logs (enable in dashboard). (c) Rotate service-role key every 90d. (d) Add `gitleaks` to pre-commit + CI to catch accidental commits. Tracked as R-112.

### F-S-007 [P2] Supply-chain risk on TTS providers
- **Category**: Supply chain
- **Source**: SDK choice for ElevenLabs + PlayHT not yet locked
- **Description**: ElevenLabs and PlayHT SDKs vary in code quality and update cadence. Direct HTTP via `fetch` is preferable (smaller surface, no transitive deps).
- **Recommendation**: Use direct `fetch` calls against documented HTTP endpoints. Document the API version in each contract (`contracts/elevenlabs-tts.yaml`, `contracts/playht-tts.yaml`). Pin version in env (`ELEVENLABS_API_VERSION`).

### F-S-008 [P3] GDPR posture for EU subscribers undocumented
- **Category**: Compliance
- **Source**: Master Strategy §7.1 (says HIPAA not triggered; silent on GDPR)
- **Description**: EU subscribers' emails are personal data under GDPR. Right to erasure, data minimization, DPA with vendors are required.
- **Recommendation**: Document DPA inventory (Supabase, Cloudflare, Resend, ElevenLabs, PlayHT, Plausible). Implement `/unsubscribe` (`subscribers.status='unsubscribed'`) and an erasure endpoint that deletes subscriber rows on request. Cookie posture: Plausible is cookieless; CMS auth uses session cookies (essential, exempt from consent banner). Tracked as part of `deployment-plan.md` compliance section.

### F-S-009 [P3] Embargo-leak surface
- **Category**: Editorial integrity
- **Source**: cms-schema.md:193-211 (embargo_holds table) + embargo-handling skill
- **Description**: `embargo_holds.released_at IS NULL` items are visible to any service-role caller. While the publish-queue is structurally separated, a misrouted query could leak content.
- **Recommendation**: Add RLS policy: `embargo_holds` readable only by `editorial_director` and `regulatory-analyst` roles; CMS UI redacts content until `released_at` is set. Tracked under M6 conference brief readiness.

### F-S-010 [P3] Plain-text body_md in articles
- **Category**: Information classification (low concern; no PHI)
- **Source**: cms-schema.md:24
- **Description**: `articles.body_md` is plaintext. While no PHI is in scope, the data is editorially sensitive pre-publish (draft → ready_to_publish). RLS gates reads to editors only; service-role still has access.
- **Recommendation**: Acceptable for current scope. Re-evaluate if any vendor / patient identifying info enters scope (it should not per Master Strategy §7.1).

## OWASP coverage matrix

| OWASP Top 10 (2021) | Status |
|---|---|
| A01 Broken Access Control | Covered by RLS posture + future app-layer guards |
| A02 Cryptographic Failures | TLS everywhere via Cloudflare; no custom crypto needed |
| A03 Injection | Pydantic-equivalent (Zod) validation at Worker boundaries + parameterized Supabase queries |
| A04 Insecure Design | Audio QA gate is schema-enforced — strong design control |
| A05 Security Misconfiguration | RLS-on-by-default per cms-schema.md:8; secrets store gate via R-111/R-112 |
| A06 Vulnerable Components | `pnpm audit --audit-level=high` in CI; pin TTS SDKs to direct HTTP per F-S-007 |
| A07 Identification & Authentication | Supabase Auth for CMS; Cloudflare Access for /cms route |
| A08 Software & Data Integrity | Hash-chained audit chain on `articles` (deferred — Phase 3 op); Forward-only migrations |
| A09 Logging & Monitoring | Workers Analytics Engine + Sentry hypothesis (ADR-0008); Cloudflare Logpush to R2 |
| A10 SSRF | Outbound calls limited to documented integration list (contracts/) |

## Re-audit triggers

- New external integration added → run F-S-007 check + new contract
- New role in `qa_reviewers.role` → re-derive RLS posture
- Compaction window on audio QA bypass (any UI shortcut) → block release
- Voice consent change → block audio publish
- EU subscriber count >1,000 → full GDPR walkthrough
- Any code in `apps/cms` referencing service-role from a browser bundle → P0 block

## Revision history

| Date | Version | Change |
|---|---|---|
| 2026-05-14 | 1.0.0 | Initial security findings. 10 items; 2 P1, 5 P2, 3 P3. Re-audit M2 (post-code), M3 (post-launch), M5 (post-podcast launch). |
