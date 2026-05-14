---
title: Test Results — Mechanical consistency checks
version: 1.0.0
date: 2026-05-14
scope: Plan-level QA on code-empty repo. "Tests" here = doc-cross-reference + banned-pattern + count-integrity grep passes.
---

# Test Results — Plan-Level Mechanical Checks

Repo is code-empty. Standard test pyramid commands (lint / typecheck / unit / build / E2E) are not yet applicable. The mechanical checks below substitute for that pyramid at plan-QA time and will be re-run after M1 lands.

## Verdict per check

| # | Check | Command | Result | Verdict |
|---|---|---|---|---|
| T-01 | All planning artifacts present | `find docs -type f \( -name "*.md" -o -name "*.yaml" -o -name "*.sql" \) \| wc -l` | **53** files | PASS |
| T-02 | `meddeviceguide.com` / `MDCG.eu` banned-source scan | `Grep "meddeviceguide\\.com\|MDCG\\.eu"` | 11 files match. **5 intentional** (security-findings, gap-analysis, remediation-plan, SSOT §6, integration-review — all citing the ban). **5 contract-level** (ema.yaml + critic-review + test-qa-plan + delivery-plan — referenced in ban-as-primary lists). **1 unscrubbed P0**: `Docs/ROMAS-Brief-500-Article-Launch-Plan.md` §6 Sample 5 still cites `meddeviceguide.com` as the linked source URL. | **FAIL — P0** |
| T-03 | Banned word "scrape" | `Grep "\\bscrape\\b"` | 5 files. **2 intentional** (CLAUDE.md anti-pattern section; AGENT.md §14). **3 unexpected**: `docs/specs/delivery-plan.md`, `docs/MASTER_IMPLEMENTATION_PLAN.md`, `docs/specs/test-qa-plan.md`. Inspection needed; likely false positives in quoted anti-pattern wording. | YELLOW |
| T-04 | FR count in product-spec | `Grep "\\bFR-\\d{3}[A-Z]?"` | **40 unique** (FR-001..FR-038 + FR-014A + FR-S-001..FR-W-004 variants) | PASS |
| T-05 | A-NNN count in test-qa-plan catalog | `Grep "\\bA-\\d{3}"` | **80** raw matches in test-qa-plan; **59 unique catalog rows** A-001..A-060 (A-009 missing per Test Engineer audit) | PARTIAL — 1 gap |
| T-06 | T-NNN files referencing tasks | `Grep "\\bT-\\d{3}[A-Z]?"` | 8 files (delivery-plan, MASTER plan, test-qa-plan, codebase-index, research-notes, SSOT, remediation-plan, critic-review). Cross-ref integrity check moved to T-08. | PASS |
| T-07 | All contracts referenced in integration-review | inspect | 15 contracts on disk; 14 explicitly referenced in `integration-review.md` (I-01..I-21 minus deferred I-21 LATAM regulatory cluster). beehiiv.yaml and deepl.yaml added cycle-3/6 — confirmed referenced. | PASS |
| T-08 | T-NEW placeholder resolution | `Grep "T-NEW\\d+"` | T-NEW1 through T-NEW20 are **declared but undefined as task rows** in `MASTER_IMPLEMENTATION_PLAN.md`. Cycle-4 promise to cycle-5 follow-on; cycle-5 promise to cycle-6 follow-on; cycle-6 closed without writing them. | **FAIL — P0** |
| T-09 | A-061..A-075 in test-qa-plan catalog | inspect catalog | A-061..A-067 promised cycle-4; A-068..A-075 promised cycle-5; **all 15 unwritten** in test-qa-plan §6 catalog. | **FAIL — P0** |
| T-10 | Audio publish-gate condition count consistency | inspect | SSOT §7 = 5 conditions ✓. product-spec FR-009 = 5 ✓. ADR-0006 narrative = 5 ✓. CLAUDE.md §4 rule 6 paraphrase = "clinical_claims_checked + qa_reviewer" (2-element paraphrase, narrows what schema enforces). | YELLOW — cycle-2 F-P1-01 partially closed |
| T-11 | Six inviolable rules consistency | Read `CLAUDE.md §4`, `AGENT.md §5`, `SSOT.md §2`, `Master-Strategy §6.1`, `Runbook §6` | CLAUDE/AGENT/SSOT = 6 rules ✓. Master-Strategy §6.1 + Runbook §6 = **5 rules each** (cycle-1 H-08 / G-008 finding). R-004 in M0 was to fix; M0 has not run. | **FAIL — P1** *(pre-known, M0 deliverable)* |
| T-12 | Doc-version drift | inspect headers | Master-Strategy on-disk v2.0 vs SSOT v2.1; Runbook v1.0 vs SSOT v1.1; Launch Plan v1.0 vs SSOT v1.1. R-001/R-002/R-003 in M0. | **FAIL — P0** *(pre-known, M0 deliverable)* |
| T-13 | ADR completeness | inspect 12 ADRs | 0001 cycle-2 promoted to Accepted ✓. 0002-0006 cycle-2 Historical Context added ✓. 0007 cycle-3 rewritten ✓. 0008-0010 ✓. 0011 cycle-3 Whisper ✓. **0012 Video Podcast vendor MISSING** (Q6 deferred to Day 30, but referenced by FR-022, T-651..T-660, delivery-plan R-18). 0013 cycle-6 ✓. | **FAIL — P1** *(pre-known, Day 30 deferred)* |
| T-14 | Contracts retry+timeout+observability completeness | sample audit | Per Security/Reliability persona: 6 P1 + 4 P2 + 3 P3 reliability gaps across contracts. PlayHT retry: 1 attempt with no backoff (REL-001 P1). Resend uses tag-based idempotency not `Idempotency-Key` header (REL-002 P1). Beehiiv DLQ unspecified (REL-003 P1). Supabase query timeout not specified anywhere (REL-004 P2). Whisper 300s timeout exceeds CF Worker sync limit (REL-009 P3 — architectural). | **FAIL — multiple** |
| T-15 | Locked decisions ledger length | count rows in SSOT §3 | 18 rows (cycles 1–6: 14 cycle-1 + cycle-3 row 7 + cycle-5 rows 15/16/17 + cycle-6 row 18). 16 marked LOCKED; 2 still flag (rows 6 podcast lock + 7 email split cite "(LOCKED 2026-05-14 by Kimal)" in body). All cited via §10 Q-table. | PASS |
| T-16 | Schema CHECK constraint count | Grep CHECK in supabase-schema.sql | 13 explicit CHECKs incl. `articles_primary_source_required`, `articles_embargo_consistency`, `articles_insight_labeled`, `audio_publish_requires_qa` (5-condition), `audio_revoke_requires_reason`, `audio_skip_requires_reason`, `articles_translation_provider_required` (cycle-6). All test-able via pgTAP per ADR-0009. | PASS |
| T-17 | Banned anti-slop patterns in canonical docs | Grep "delve\|tapestry\|stands as\|serves as\|Great question" | Zero hits. | PASS |
| T-18 | Cycle-5/6 worldwide-positioning operationalization | inspect | SSOT §3 rows 15-18 locked ✓. 6 regulatory contracts authored ✓. DeepL contract ✓. FR-032..FR-038 added ✓. **Task IDs T-NEW12..T-NEW20 remain placeholders** (re-flagged from T-08). 7-region distribution applied to SSOT §12.2 ✓; not yet to Launch Plan v1.1 §2.2 on disk (M0 deliverable). | YELLOW *(M0)* |

## Summary

| Verdict | Count |
|---|---|
| PASS | 6 |
| YELLOW (partial) | 3 |
| FAIL (P0) | 4 |
| FAIL (P1) | 2 |
| FAIL (architectural / multiple) | 1 |

## Banned-content live violations

1. **`Docs/ROMAS-Brief-500-Article-Launch-Plan.md` §6 Sample 5** — cites `meddeviceguide.com` as the primary-source URL for the EU AI Act Omnibus article. Cycle-2 R-014 moved the ban into M0; the scrub has not run. This sample article is part of the 500-article launch backlog. **Cannot ship.**

## Plan-level gates not yet runnable

| Gate | Why deferred |
|---|---|
| G1 Lint (ESLint + Prettier) | No code |
| G2 Typecheck (`tsc --noEmit`) | No code |
| G3 Unit + Integration tests | No tests |
| G4 Build (turbo build) | No build target |
| G5 Security audit (`pnpm audit`) | No package.json |
| G6 No-TODO scan | Code-empty (markdown TODOs counted separately) |
| G7 No-secrets scan | Code-empty; `.env.example` not yet authored (R-111 M1) |
| G8 Device test | No UI |
| G9 Schema-constraint pgTAP | No Supabase project, no migrations applied |
| G10 RSS lint | No feeds |

These gates run after M1 (migrations + scaffold) and M2 (audio pipeline) land. They are not blocking plan-QA verdict but they are blocking ship-readiness — surfaced in `release-checklist.md`.

## Re-run plan

This document re-runs after every milestone landing:
- End of M1: T-08 must turn GREEN (T-NEW placeholders resolved) before M2 starts
- End of M2: all 10 plan-level gates above become runnable
- End of M3: Lighthouse + axe-core + visual regression added
