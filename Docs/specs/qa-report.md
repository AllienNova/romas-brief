---
title: ROMAS Brief — QA Report (Plan-Level)
version: 1.0.0
date: 2026-05-14
commit: pre-/team-build dispatch
qa_lead: team-qa skill (Kimal-invoked)
scope: plan-level QA on code-empty repo; release-readiness gate for /team-build dispatch
---

# ROMAS Brief — QA Report

## Verdict

**GO WITH CONDITIONS** *(verdict post-critic; author's initial NO-GO was downgraded by team-qa-critic per `docs/qa/critic-review.md`)*

The plan is ready for **/team-build dispatch** with the following understanding:
- /team-build starts at **M0 (doc reconciliation)** — which IS exactly the doc-hygiene work the author flagged as "blockers"
- The 11 release-checklist items are **acceptance criteria for M0 close**, NOT gates on M0 start
- The Beehiiv DPA + SCC legal track runs on Kimal's calendar independent of engineering, gated against Day-1 launch (M3), not /team-build dispatch (M0)
- 3 critic-surfaced P0 corrections to close in M0 (see below)

## Critic-surfaced P0 corrections (must close in M0)

1. **C-001** — `docs/qa/test-coverage.md` Table 2 falsely claims all 15 contracts are missing; 16 are on disk. Re-run architecture-reviewer pass on current repo state and refresh the table (~2 hours).
2. **C-002** — `docs/qa/release-checklist.md` row 5 says "bump SSOT to v2.1" but SSOT on disk is v1.0.0. Pick canonical version direction and reconcile across SSOT frontmatter + Master-Strategy + Runbook + Launch Plan (~30 min).
3. **C-003** — Beehiiv DPA fix "execute before EU acquisition begins (Day 1)" is operationally vague. Author the explicit mechanism (geofence EU IPs OR queue-hold EU subscribers) in Master Strategy §13 or SSOT §12.8 (~1 hour).

## Original analysis stands as M0 work

The verdict-level analysis below ("Top 3 risks", "Top 3 wins", "Counts summary", etc.) is preserved as the M0 punch-list. The critic verified all 8 load-bearing claims and added 3 P0 + 5 P1 findings.

The plan is structurally rich (47 artifacts, 38 FRs, 15 contracts, 12 ADRs, 18 locked decisions, 88 risks tracked) and unusually well-cited for a code-empty plan. But the cross-reference Lego-house has **40 unresolved task placeholders, 88 unwritten acceptance tests, 11 hard blockers, 12 high-severity findings, and live banned-source content in the 500-article backlog**. Dispatching /team-build now would push these gaps into implementation, where they cost 10–20× more to resolve.

The fix is **doc-only work** (no code), Test Engineer estimates **~3–5 person-days for items 1–11** + 5–10 days for legal/DPA + 1–2 days for contract revisions + 5–15 days for design specs. The 8-week pre-launch ramp starts 2026-05-19 (W-7); this remediation can fit inside W-7..W-6 if Kimal authorizes parallel doc tracks.

## Executive summary (3 sentences)

ROMAS Brief's cycle-1→cycle-6 planning produced a coherent, locked, audit-friendly product spec, but the plan's traceability fabric — task IDs, acceptance tests, schema columns, decision-log references — has 40 dangling references and 88 missing tests that block /team-build from running deterministically. Five live regressions remain: a `meddeviceguide.com` primary-source citation in the 500-article backlog (Rule 4 violation), on-disk doc-version drift unchecked since cycle-1, inviolable-rule count drift in Master-Strategy/Runbook, ADR-0005 stale wording from cycle-1, and missing `subscribers.region` + `subscribers.beehiiv_subscription_id` schema columns required by FR-033 + FR-023. Of these, items 4–5 above are doc-fixes (M0 work) and items 1–3 are doc fixes already promised in cycle-4/5/6 follow-on but never executed; once these close plus DeepL Pro + Beehiiv SCC + voice-consent registry land, the plan is /team-build-ready.

## Pass / fail per major requirement bucket

| Bucket | FRs | Cleanly TRACED | Partially | Placeholder | Verdict |
|---|---|---|---|---|---|
| Daily editorial loop (FR-001..FR-006) | 6 | 4 | 2 | 0 | YELLOW |
| Audio pipeline (FR-007..FR-012) | 6 | 3 | 2 | 1 | YELLOW |
| Reader surface + RSS (FR-013, FR-019, FR-020) | 3 | 2 | 1 | 0 | YELLOW |
| Email delivery — Beehiiv + Resend (FR-014, FR-014A, FR-023) | 3 | 0 | 0 | 3 | **RED** |
| Friday Read + Conference + openFDA (FR-015..FR-018) | 4 | 4 | 0 | 0 | GREEN |
| Voice consent gate (FR-021) | 1 | 0 | 1 | 0 | YELLOW (no A-NNN) |
| Tier 5 Video Podcast (FR-022) | 1 | 0 | 0 | 1 | **RED** |
| Day-1 launch posture: seed import + 8 modules + regions + audience filters + audio inventory + issues (FR-024..FR-031, FR-038) | 9 | 0 | 0 | 9 | **RED** |
| Worldwide positioning + three-edition + locale + China + regulators + lexicon (FR-032..FR-037) | 6 | 0 | 0 | 6 | **RED** |
| **Total MUSTs** | **38** | **13 (34%)** | **6 (16%)** | **19 (50%)** | **RED overall** |

## Top 3 risks (release-blocking)

1. **B-01 / B-02 — 40 placeholder tasks + 88 unwritten A-NNN tests.** The plan instructs /team-build to execute against T-NEW IDs that don't exist as task rows, and /team-qa cannot verify because the catalog is incomplete. **Fix**: 3-day doc PR adding concrete rows + writing 88 A-NNNs.
2. **B-05 — Live Rule-4 violation in Launch Plan §6 Sample 5.** The 500-article backlog includes a sample article citing `meddeviceguide.com` as primary, violating Rule 4 + SSOT §6. **Fix**: 1-hour doc edit — re-source against EUDAMED official.
3. **B-09 + B-10 — Webhook signatures unverified + Beehiiv DPA + SCC for EU subscribers unconfirmed.** First EU subscriber on Day 1 = GDPR violation; forged Beehiiv/Resend webhook = mass subscriber-list corruption. **Fix**: contract revisions + DPA execution before any subscriber data is collected.

## Top 3 confident wins

1. **SSOT precedence + 18 locked decisions.** SSOT §9 precedence rule is operationally clean. Every contested decision routes through SSOT first, then ADR. 6 of 12 strategic Q-decisions locked by Kimal verbal commitments in this session (Q1–Q3 cycle-3, Q8–Q11 cycle-5/6). Plan has clarity that early-stage docs rarely reach.
2. **Schema-enforced inviolable rules.** `audio_publish_requires_qa` 5-condition CHECK + `articles_primary_source_required` + `articles_embargo_consistency` + `articles_insight_labeled` + `articles_translation_provider_required` (cycle-6) make the 6 inviolable rules **structurally unbypassable** at the DB layer. pgTAP test plan (A-013..A-019) is solid.
3. **Worldwide positioning + three-edition publish architecture.** Cycle-5 rebalance (NA 26% / EU 32% / APAC 26% / LATAM 8%) is a credible global posture; three-edition (APAC 22:00 UTC / EU 06:00 UTC / Americas 11:00 UTC) is operationally clean; China read-only ingest correctly threads PIPL + GFW reality. Strong inflection from a US-default plan to a genuinely worldwide one in one decision cycle.

## Recommended next iteration items

### Now (M0 doc-only, ~3-5 person-days)

1. **Item-1 thru 11 from release-checklist.md** — placeholder tasks defined, A-NNNs written, banned-source scrub, version-header bump, inviolable-rule cascade, ADR-0005 rewrite, architecture.md §7 update, `subscribers.region` + `subscribers.beehiiv_subscription_id` schema additions, `.claude/skills/cms-schema.md` ↔ contract synchronization.

### Pre-M1 (~1-2 weeks alongside W-7 editorial start)

2. **Items 12–17**: DPA inventory + voice-consent registry + DeepL Pro + `.env.example` + `SECRETS.md` + ADR-0012 stub for Video Podcast.

### Pre-M2 (~2-3 days of contract revisions)

3. **Items 18–25**: PlayHT retry, Resend `Idempotency-Key`, Beehiiv DLQ, Supabase timeout standard, Whisper architecture, embargo gate, webhook signature, cross-edition revocation check.

### Pre-M3 (~1-2 weeks alongside M2)

4. **Items 26–32**: Design Spec v1.1 + Audio Architecture v1.0 authored; `/team-design` invocation recommended; lexicon expansion W-7 dispatch; right-to-erasure FR; 8-module LCP optimization plan; three-edition wall-clock budget.

## Counts summary

| Metric | Value |
|---|---|
| Planning artifacts on disk | 53 (47 specs+ADRs+contracts + 6 supporting) |
| Requirements (MUST) | 38 |
| Requirements TRACED (T+A both concrete) | 13 (34%) |
| Implementation tasks (concrete T-NNN rows) | 73 |
| Implementation tasks (placeholder T-NEW + scope-prose) | 40 |
| Acceptance tests written | 59 (cycle-1 catalog A-001..A-060 minus A-009) |
| Acceptance tests promised but unwritten | 88 |
| Contracts authored | 15 (16 if Supabase schema SQL counts) |
| ADRs authored | 12 (0001-0011, 0013; 0012 Q6 deferred) |
| Locked decisions in SSOT | 18 |
| Open Q-decisions tracked | 4 (Q4 voice consent, Q5 EU region, Q6 video vendor, Q7 newsletter ops) |
| Risks in consolidated register | 88 |
| Blockers (B-*) | 11 |
| High-severity (H-*) | 12 |
| Medium (M-*) | 12 |
| Low (L-*) | 5 |
| Live banned-source content | 1 file (`Launch-Plan.md §6 Sample 5`) |
| Live doc-version drifts | 3 files |
| Inviolable-rule count drift | 2 files (Master-Strategy + Runbook) |

## Pre-launch readiness gate (SSOT §12.8) status

Of the 18 launch-readiness items in SSOT §12.8, 16 are OPEN at plan-QA time. Schema-enforced items (rows 7, 9, 11) are GREEN by virtue of contract authoring. All 16 OPEN items are blocked by upstream plan-level remediation (B-01..B-10).

## Recommendations to Kimal

1. **APPROVE a 2-3 week M0-prerequisite remediation cycle starting 2026-05-19 (W-7)** — closes blockers 1–11 + pre-M1 items 12–17. Editorial pre-launch ramp begins in parallel (W-7 = 30 articles).
2. **DELAY /team-build dispatch by 2-3 weeks** to W-5 (2026-06-02). M0 + pre-M1 prerequisites land before code starts.
3. **INVOKE `/team-design`** before M3 reader work begins. Current design artifacts (`.claude/skills/design-tokens.md` v1.1 + `component-library.md`) are operational skills, not wireframe/spec docs. The 12 reader routes + 7 components need 5-state coverage before web-engineer authors components.
4. **ACCEPT that Tier 5 Video Podcast (Day 60) is genuinely deferred**, not just nominally — ADR-0012 + production studio + guest workflow + `video-podcast.xml` + Watch page are M5–M6.5 work, not M3. The cycle-3 lock said Day 60; the plan does not yet make Day 60 feasible without explicit pre-M5 ADR-0012 authoring.
5. **ESCALATE B-10 (Beehiiv DPA + SCC) to Kimal personally** — this is a legal-track item, not a doc-author item. First EU subscriber on Day 1 = GDPR violation without it. Cannot launch.

## Sign-off

- **Plan-QA verdict**: **GO WITH CONDITIONS** (post-critic)
- **Date**: 2026-05-14
- **Reviewer**: team-qa skill (Test Engineer + Security/Reliability Engineer + Architecture Reviewer personas)
- **Critic gate**: **PASSED** — `team-qa-critic` returned GO WITH CONDITIONS with 8 conditions (3 P0 + 5 P1 + 2 P2). All conditions fit inside M0 (delivery-plan §3.1) — no separate pre-M0 phase required. See `docs/qa/critic-review.md`.

## 8 critic conditions for GO (all fit M0)

1. M0 closes release-checklist items 1–11 before M1 starts (already the M0 contract)
2. Re-run architecture-reviewer pass; refresh `docs/qa/test-coverage.md` Tables 1+2 + XR-001..009 (~2 hours)
3. B-05 (Launch Plan §6 Sample 5 `meddeviceguide.com`) scrubbed before any further citation work (~1 hour, do FIRST)
4. ADR-0005 cycle-3 rewrite + ADR-0012 placeholder stub authored before M1
5. `subscribers.region` + `subscribers.beehiiv_subscription_id` schema migration SQL on disk before M1
6. Beehiiv DPA + SCC date in Kimal's calendar with explicit geofence-or-queue-hold mechanism if DPA slips
7. Reconcile SSOT version contradiction (C-002) — 30 min
8. 40-placeholder-task remediation as discrete 0.5d PR within M0 (FIRST PR of M0 so other M0 work references real IDs)

Detailed findings in `docs/qa/`:
- `requirements-trace.md` (391 lines, Test Engineer)
- `security-findings.md` (Security persona — 11 NEW-S findings)
- `reliability-report.md` (Reliability persona — 10 REL findings)
- `test-coverage.md` (Architecture-reviewer — cross-reference integrity)
- `test-results.md` (mechanical consistency checks — 18 items, 7 FAIL)
- `performance-report.md` (NFR audit — YELLOW)
- `ux-validation.md` (design conformance — RED, needs `/team-design`)
- `risk-register.md` (consolidated 88 risks)
- `release-checklist.md` (32-item gate checklist)
