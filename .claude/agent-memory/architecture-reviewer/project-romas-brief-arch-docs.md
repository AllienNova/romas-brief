---
name: ROMAS Brief architecture docs — cross-ref QA complete 2026-05-14
description: Full plan-QA pass completed; 4 P0 + 6 P1 connection gaps found; output at Docs/qa/test-coverage.md and Docs/qa/risk-register.md
type: project
---

Architecture spec and ADRs 0001-0013 reviewed in plan-QA pass on 2026-05-14. Output files written:
- `Docs/qa/test-coverage.md` — 7 reference tables (ADR coverage, contract coverage, schema column coverage, agent/skill/command coverage, inviolable rules consistency, locked decisions cross-doc, open Q-decisions)
- `Docs/qa/risk-register.md` — existing 88-risk register; cross-ref gaps appended as XR-001 through XR-009

**Why:** Cross-reference integrity review before implementation begins to catch doc-level breaks before they become code-level breaks.

**How to apply:** Before any implementation session on cycle-5/6 features (worldwide, LATAM translate, three-edition), all 4 P0 gaps must be closed first. Check Docs/qa/risk-register.md XR-001 through XR-004 for closure status.

Critical P0 findings:
- ADR-0005 lines 21+49: still says "Day 14 / Day 30-45" — contradicts cycle-2 lock (all 4 tiers Day 1). THREE docs carry stale wording: ADR-0005, AGENT.md line 210, CLAUDE.md §5 audio table.
- cms-schema.md: missing ADR-0013 columns (source_language, translation_provider, translation_verified). Schema skill is stale the day ADR-0013 was signed.
- cms-schema.md: missing subscribers.region column needed for FR-033 three-edition publish.
- product-spec.md FR-024–FR-038: all 15 cycle-5/6 FRs reference T-NEW placeholder IDs not in MASTER_IMPLEMENTATION_PLAN.

Key P1 findings:
- CLAUDE.md §7 says "Resend (or Postmark)" — ADR-0007 locked Resend; Postmark explicitly rejected.
- architecture.md §7 decision log frozen at ADR-0006; ADRs 0007-0013 absent from it.
- physics-reviewer agent has no mapped skill file.
- All 15 planned integration contracts are missing on disk (no Docs/specs/contracts/ directory).
- subscribers.beehiiv_subscription_id column absent; Beehiiv sync (ADR-0007) unimplementable.

Repo path casing: all docs under `Docs/` (capital D), NOT `docs/`. Critical for file writes.

Confirmed resolved (cycles 2-6): Q1 pnpm, Q2 Supabase, Q3 Cloudflare, Q8 Resend+Beehiiv split, Q9 M5 dissolved, Q10 worldwide scope, Q11 LATAM translate.
Still open: Q4 second QA reviewer, Q5 observability stack, Q6 Video Podcast vendor, Q7 voice donor identity.
