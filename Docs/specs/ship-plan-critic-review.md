---
title: Critic Review — ROMAS Brief ship-execution-plan.md
reviewer: team-plan-critic (Plan Savage)
mode: HYBRID (delivery planning over completed audit)
artifact: Docs/specs/ship-execution-plan.md
---

# Ship-Execution-Plan Critic Review

## Cycle 1 — 2026-05-29 — verdict: REVISE REQUIRED (2 P0 · 6 P1 · 4 P2)

Critic ran fresh code-verification (`git rev-parse`, `wc -l`, `grep`) and confirmed every baseline cell in the plan against HEAD=dd7f0e0. Tally: P0=2, P1=6, P2=4, WARN=9, PASS=4 across the 16-dimension scorecard. Best dimension: reality-check vs codebase (PASS — baseline survives line-by-line). Worst: requirement coverage + operational readiness (FAIL).

### Findings and resolution (cycle 1 → plan v1.1.0)

| ID | Sev | Finding | Resolution in v1.1.0 |
|---|---|---|---|
| F-001 | P0 | Signal-scoring engine (FR-002/3, B-03) unbuilt and unmapped; gate #5 wrongly assigned to content. `grep` confirms cron-ingest sets no `signal_score`. | **Added SHIP-09** (six-axis scorer, critical path); gate #5 re-owned to SHIP-09; B-03 closed. |
| F-002 | P0 | No ops readiness (SLO/SLI, Sentry, alerting, runbook) for a daily-deadline product. | **Added SHIP-26** (ops readiness) + §5 gate row 19. |
| F-003 | P1 | Day-1 date feasibility unsupported; no estimates; W-8 anchor 17d stale. | Added **Estimate (S/M/L) column** to every SHIP-NN + critical-path duration roll-up (§4c); sharpened Q-A. |
| F-004 | P1 | SHIP-12 tests sequenced before the fixes (13/14/15) they must test — circular. | **Re-sequenced Wave 3**: correctness fixes (SHIP-14/15/16) now precede the test backfill (SHIP-17); SHIP-17 tests corrected code. |
| F-005 | P1 | ADR-0015 RSC controls (T-301-B: Zod-at-RSC, body-size cap) dropped on Next bump. | Re-homed into **SHIP-08 acceptance**; note added that next@15 retires the CVE-specific controls. |
| F-006 | P1 | Friday Read (M4) deferral asserted safe with no argument on a Friday-anchored brand. | Added **Q-E** (Kimal sign-off) + sharpened §6 deferral rationale. |
| F-007 | P1 | SHIP-23 runtime-verifies only the short Audio Brief tier; B-16 risk is the long tiers. | **SHIP-27 acceptance extended** to a full-length Tier-3 episode through the Queue consumer (gate #14 evidence). |
| F-008 | P1 | SHIP-22 produces Day-1 homepage modules but sat in Wave 4 POLISH, off critical path. | **Split**: Day-1 modules (Today's podcast / Trending / Top Papers / Daily Brief feed) → **SHIP-13** on critical path; pgvector search → SHIP-25 (Wave 4). |
| F-009 | P2 | No rollback/down-path for migration 0012 (SHIP-16). | Down-migration note added to SHIP-16 acceptance. |
| F-010 | P2 | Beehiiv DLQ (H-04/RC-20) under-specified in SHIP-11. | DLQ TTL/retry/escalation added to SHIP-11 acceptance. |
| F-011 | P2 | Right-to-erasure (FR-039) bundled with source-health decision. | **Split**: SHIP-18 (erasure) + SHIP-19 (source-health). |
| F-012 | P2 | Orphans: M-04, H-09, M-02, B-14 unmapped. | M-04 → SHIP-18/SHIP-28; H-09 → KX-6 note; M-02 → cron-ingest verify in SHIP-15; B-14 → §6 deferred. |

Open questions Q-A..Q-D accepted as-is by critic (defaults + deadlines present). Q-E added.

## Cycle 2 — 2026-05-29 — verdict: APPROVE WITH CONDITIONS (0 P0 · 0 P1 · 2 P2)

Critic re-verified each cycle-1 finding against plan text + fresh code at HEAD=dd7f0e0: **10 CLOSED, 1 PARTIAL (F-003, cosmetic residue only), 0 OPEN.** Both P0s closed. Renumbering 29→33 SHIP IDs verified clean: defined set == referenced set, DAG acyclic, no orphans, migration numbering coherent, split merge-IDs intact.

Two new P2 baseline-accuracy nits — both fixed in-place (not merely accepted):

| ID | Sev | Finding | Resolution |
|---|---|---|---|
| F-201 | P2 | §4c roll-up summed to 66 working days, stated ~58 | Corrected to ~66 (conclusion unchanged — reinforces the date squeeze) |
| F-202 | P2 | §1 baseline said 84 pgTAP assertions; actual = 79 | Corrected to 79 |

**Accepted-with-rationale (carried, per 3-round cap):** §4c single-thread-vs-parallel compression is a hypothesis gated on Q-A staffing decision (deadline before Wave 2); Day-1 date 2026-07-07 unconfirmed, Q-A owns it with fallback 2026-07-21. Both honestly hedged with defaults + deadlines.

**Finalization gate: CLOSED.** Plan v1.1.1 (post-fix) is the authoritative launch backlog.
