# NB-11 — NoticeBoard Gate (a11y + tests + DoD status)

**Date:** 2026-06-03 · **Commit baseline:** `fbe9565` (post NB-7) · **Verdict: PASS (live-buildable scope); E2E tail BLOCKED on infra**

Closing gate for the NoticeBoard v2 epic (NB-1 → NB-10 shipped; NB-5/NB-7
runtime gated on Supabase). Verifies what is exercisable without live Supabase
auth/cron or new test-runner dependencies.

## Unit tests — 39/39 (node --experimental-strip-types --test)

| Suite | Tests | Covers |
|---|---|---|
| `select-board.test.ts` | 18 | featured cardinality, budget, sponsored cap, sponsored-never-isNew, publish/expiry boundaries, inventory targeting, multi-conference guard |
| `archive.test.ts` | 8 | filter taxonomy, search, offset pagination, untrusted-param coercion |
| `telemetry.test.ts` | 9 | event validation, **PII-strip** (only 3 fields persist), batch cap, rollup CTR, fill-rate |
| `rbac.test.ts` | 4 | role hierarchy, capability gates, untrusted-claim guard |

pgTAP (run at migrate time via `supabase test db`, not here):
- `notices_security.sql` — plan(4): sponsor_public column allowlist, cta CHECK, telemetry insert policy, featured/sponsored exclusion.
- `notices_scheduler.sql` — plan(6): scheduler fn exists; promote/expire/featured-handoff transitions.

## Accessibility (Lighthouse, desktop, dev :3000)

| Surface | a11y | Best Practices | SEO |
|---|---|---|---|
| `/notices` archive | **95** | 100 | 100 |

Structural board checks (Playwright, homepage board):
- **≤1 anchor per card** (§16 — no nested `<a>`, hydration-safe): max 1 across all 5 cards (non-clickable cards have 0). PASS.
- **LiveDot not announced**: present + `aria-hidden`. PASS.
- Board section has `aria-label="Notice board"`. PASS.
- 0 console errors.

## Device tests this epic (Playwright, dev :3000)

- NB-8 `/notices`: filter tabs (Events → 2 cards), search, conference-local-time dates, h1 immediate.
- NB-9 ConferenceLeadCard: single anchor, session in conference tz (CDT), 0 errors.
- NB-6 telemetry: ingest route 204 (valid + garbage), 5 `data-notice-id` hooks, sendBeacon available, DNT honored.
- NB-10 RotatingSlot: `data-rotating="true"`, prev/next + 3 dots, auto-advance + manual advance (crossfade).

## Definition of Done (§21) — status

| Item | Status |
|---|---|
| DB schema + CHECK + indexes; firewall un-violable at DB | ✅ 0015 + pgTAP |
| Board RSC + 60s cache + tag revalidation | ✅ NB-4 |
| Scheduler flips statuses on time | ⏸ code shipped (NB-5); runtime BLOCKED on live DB + cron deploy |
| `selectBoard()` pure, unit-tested, budget+targeting+conference | ✅ 18 tests |
| Featured unique-when-live (DB index) + visual lead | ✅ 0015 index + FeaturedNoticeCard |
| Sponsored quarantine DB+API+UI; banned CTA; disclosure; approval | ✅ firewall (3 layers); ⏸ approval runtime BLOCKED on auth (NB-7) |
| Inventory slot state machine (4 states) | ✅ NB-3/NB-fix |
| Telemetry impressions/clicks, CTR+fill-rate, no PII, consent-gated | ✅ NB-6 (runtime insert gated on DB) |
| Conference Mode: lead, conf-local-time, optional full-width, embargo | ✅ NB-9 + full-width flag |
| Archive `/notices` filters + search + pagination | ✅ NB-8 |
| Admin CRUD + RBAC + schedule(tz) + preview + approval | ⏸ RBAC + list + detail + approval gate shipped (NB-7); edit-form/schedule-picker + authed runtime BLOCKED |
| Controlled rotation (§9) | ✅ NB-10 |
| WEB-2 anchor fix; one anchor per card | ✅ verified (≤1) |
| reduced-motion compliance; dark-mode parity | ✅ (primitives + CSS guard) |
| Error boundary + static fallback; no CLS | ✅ NB-fix E + get-board fallback |
| Full-width band behind flag, A/B-ready | ✅ NB-10 |

## BLOCKED (full E2E + automated a11y suite)

Not achievable in this environment; needs provisioning + test-runner deps:
- **Playwright E2E** (publish→appears, expire→disappears, approve gate, conference switch, full-width A/B) — needs live Supabase (NB-5 cron + NB-7 auth) + `@playwright/test` runner.
- **jest-axe automated suite** (light+dark, contained+full-width) — needs `jest-axe` + `jsdom` devDeps (not added — "no new deps without request"). Lighthouse a11y (95) + structural Playwright checks stand in for now.
- **Visual regression** (mobile/tablet/desktop × light/dark × contained/full × normal/conference) — needs a VR harness.

Unblocker: Kimal's Supabase auth/cron provisioning + approval to add the E2E/a11y/VR test dependencies.
