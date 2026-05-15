---
title: ROMAS Brief — team-design-critic Review
version: 0.1.0 (placeholder)
date: 2026-05-15
status: DEFERRED to W-6 prototype session
verdict: NOT YET RUN
---

# team-design-critic Review

> **This is a placeholder.** The `team-design-critic` 18-dimension scorecard requires the prototype + screenshots + Lighthouse audit + asset manifest to score against. This session (D1-D12 + D15) produced the design **documentation** layer; the prototype + assets + Playwright testing happen at the W-6 session per `LAUNCH_ARC_PLAN.md` and `docs/design/PLAN.md`.

## W-6 dispatch plan

Per `LAUNCH_ARC_PLAN.md` calendar row "W-6 / 2026-05-26..06-01":
- Track A (Build): /team-build M1 completion (CI green, all 10 migrations applied, first cron worker live)
- Track B (Design): Design plan-approve gate · component specs (7) · prototype scaffold

When `/team-design` is dispatched at W-6:

1. **D13 Prototype**: Spin up `apps/reader` Next.js skeleton (or a standalone prototype under `docs/design/prototype/`). Implement the top 3 user flows (UF-002 Read today's issue · UF-003 Listen · UF-001 Subscribe). Wire mocks for backend data.
2. **D14a Asset generation**: Run NanoBanana (Gemini 2.5 Flash Image) to generate logo variants · 18 iOS app icon sizes · adaptive Android icon · OG card 1200×630 · Twitter card · 4 illustrations (empty / 404 / 500 / offline). Use Imagen for hero shots if any. Use Lottie for loading spinner + success checkmark. Write generation metadata to `assets/source/*.json` per asset.
3. **D14b Prototype test**: Use Playwright MCP to navigate the prototype, take screenshots at 390 / 768 / 1440, capture keyboard nav order, run Lighthouse a11y audit (target ≥ 95), run axe-core (target 0 violations).
4. **D16 team-design-critic gate**: Dispatch `team-design-critic` subagent on the full artifact set (this directory + prototype/ + assets/ + screenshots/). Address P0 / P1 findings. Re-invoke up to 3 times. Final verdict APPROVE or APPROVE WITH CONDITIONS lands here.

## Pre-checks (this session's deliverable readiness)

The artifact set this session produced is **ready for critic-time consumption**:

- 12 wireframed routes × 5 states each = 60 state blocks documented
- 7 component specs (defer full TSX to .claude/skills/component-library.md — point-to source-of-truth)
- 22 canonical files under `docs/design/`
- WCAG 2.2 AA documented per route with token-level contrast verified
- All FR-NNN traced to user flows + wireframes + component specs
- No P0 / P1 design-time findings; 2 M findings flagged for W-6 run-time verification (A-001, A-002 — audio-state badge contrast at 12px)

## Run-time findings carried forward (when critic runs at W-6)

| ID | Source | Phase to verify | Pass criterion |
|---|---|---|---|
| A-001 | a11y-audit.md §1 | W-6 axe-core on prototype | Badge "pending" tone passes AA Large (≥ 3:1) at 12px |
| A-002 | a11y-audit.md §1 | W-6 axe-core on prototype | Badge "skipped" tone passes AA Large at 12px |
| A-003 | a11y-audit.md §6 | W-6 Playwright touch-target test | Tag pill reachable at 32×32 on mobile; consider 36×36 if thumb-reach fails |
| Lighthouse a11y | a11y-audit.md §9 | W-6 mcp__chrome-devtools__lighthouse_audit | ≥ 95 on every reader route |
| Sponsor firewall | components/SponsorBlock.md | W-6 layout test | DOM distance ≥ 32px from wordmark at 320/390/768/1024/1440 |

## Revision history

- **2026-05-15** — Placeholder authored at end of D1-D12 + D15 session. Critic gate deferred to W-6 per available-tooling constraints (Playwright + chrome-devtools + image-gen MCPs disconnected this session).
