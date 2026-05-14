---
adr: 0009
title: Testing stack — Vitest + Playwright + pgTAP
status: Proposed (hypothesis)
date: 2026-05-14
confidence: high
---

# ADR-0009: Testing stack

## Context

The 5 inviolable-rule schema constraints (`audio_publish_requires_qa`, `articles_primary_source_required`, `articles_embargo_consistency`, `articles_insight_labeled`, `audio_revoke_requires_reason`) MUST be tested against a real Postgres, not a mock. The audio pipeline + reader surface need unit and integration coverage. The full happy path (morning-brief → publish → revoke → CDN withdraw) needs E2E coverage with a real browser.

## Decision

Three layers:
1. **Vitest** — unit (pure functions: signal scoring, lexicon application, slug generation, RSS XML builders) + integration (Supabase queries via testcontainers, R2 emulator, Resend test mode)
2. **Playwright** — E2E (full happy path, audio QA gate UI flows, revoke kill switch) + visual regression on reader + CMS screens
3. **pgTAP** — schema constraint tests inside Postgres; runs via `supabase test db`

ffmpeg `loudnorm` is exercised via integration tests with golden WAV fixtures stored in `packages/test-fixtures`.

## Alternatives considered

| Option | Rejection reason |
|---|---|
| **Jest** | Slower than Vitest; ESM support is bolt-on; Vitest matches Vite-bundled apps natively. |
| **Mocha + Chai** | Manual config; no first-class TS; weaker watch mode. |
| **Cypress** | Strong but heavier than Playwright; Playwright has native multi-browser + better Cloudflare Pages preview integration. |
| **No DB-layer tests, app-layer assertions only** | Loses the schema-enforcement evidence — the most important guarantee in the system (Rule 6). |
| **Mock Supabase entirely** | "Tests pass but prod migration fails" failure mode — explicitly the pattern the feedback rule on this machine bans. |

## Consequences

**Positive**:
- pgTAP runs against actual Postgres syntax — schema CHECK constraints can't drift from tests.
- Playwright supports multi-browser (Chromium, Firefox, WebKit) for visual coverage.
- Vitest is fast (~5× Jest on this codebase shape).
- `supabase test db` integrates into Supabase CLI; runs in CI per migration push.

**Negative**:
- Three test runners to wire (mitigated: each has clear domain boundaries).
- pgTAP syntax is unfamiliar to most TS engineers; mitigated by `tests/pgtap/README.md` with examples.

**Neutral**:
- Visual regression baselines live in `tests/visual/baseline/`; diffs surface in PR.

## Coverage thresholds

| Package | Statements | Branches | Reason |
|---|---|---|---|
| `packages/shared` (pure logic) | 100% | 95% | Signal scoring + slug + embargo logic are deterministic |
| `packages/audio` | 85% | 75% | ffmpeg wrapper has unreachable error paths |
| `packages/db` | 80% | 70% | Generated types limit useful coverage |
| `packages/rss` | 100% | 95% | XML builders are pure |
| `apps/reader` | 70% | 60% | UI tests via Playwright dominate |
| `apps/cms` | 80% | 70% | QA flip UI is high-criticality |
| `workers/*` | 80% | 70% | Cron + queue handlers |

## Revisit triggers

- pgTAP becomes a maintenance burden (e.g., Supabase deprecates `supabase test db`) — fallback: Vitest with testcontainers + raw SQL assertions.
- Vitest+Workers compatibility regression — Wrangler test runner is an alternative.
- Visual regression tooling churn (Percy / Chromatic alternative).
