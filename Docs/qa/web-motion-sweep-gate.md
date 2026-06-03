# WEB-5 — Reader Motion Sweep Gate

**Date:** 2026-06-03 · **Commit baseline:** `3088f72` (post WEB-4) · **Verdict: PASS**

Gate for the WEB-2 → WEB-4 reader motion sweep (Motion/Framer entrance + scroll
reveals + animated signal-score data-viz). Measured against a **production**
build (`next build` + `next start`, port 3001) — dev-mode numbers are not
representative and are not used here.

## Scope verified

- WEB-2 homepage (hero `FadeIn` cascade, section `Reveal`s, Top-Papers `Stagger`)
- WEB-3 article page + 14 reader listing routes (scroll `Reveal`/`Stagger`)
- WEB-4 data-viz suite (`SignalBar`, `CompositeScoreRing`) on article + `/design-preview`

## Core Web Vitals (Chrome DevTools performance trace, desktop, no throttle)

| Route | LCP | budget | CLS | budget | Verdict |
|---|---|---|---|---|---|
| `/` (homepage) | **169 ms** | < 2500 ms | **0.04** | < 0.1 | PASS |
| `/article/[slug]` | **233 ms** | < 2500 ms | **0.00** | < 0.1 | PASS |

- Homepage LCP render-delay 124 ms — the hero `FadeIn` (gradient text, no raster
  image) does **not** delay LCP. Hero wrapper settles to `opacity:1 / transform:none`
  on hydrate (device-verified).
- Article LCP node = the `<h1>` (nodeId 101) — validates the rule of never wrapping
  the article header in motion. CLS **0.00**: the data-viz suite (`SignalBar` scaleX,
  `CompositeScoreRing` strokeDashoffset) and all `Reveal`/`Stagger` wrappers animate
  only opacity / transform / paint properties — zero layout animation.
- INP not captured by a load trace (interaction-time metric); motion is
  GPU-composited (transform/opacity) so it does not block the main thread on input.

## Accessibility (Lighthouse, desktop, navigation mode)

| Route | a11y | Best Practices | SEO | target |
|---|---|---|---|---|
| `/` (homepage) | **95** | 100 | 92 | a11y ≥ 95 |

Failing audits and disposition (none introduced by the sweep):

| Audit | Category | Disposition |
|---|---|---|
| `cumulative-layout-shift` | Perf | Not a11y; our CLS 0.04/0.00 is within budget |
| `meta-description` | SEO | Pre-existing; not a11y |
| `color-contrast` | a11y | Pre-existing baseline (badges/tokens); sweep added no colored text on homepage |
| `heading-order` | a11y | Pre-existing; motion wrappers are semantically transparent `<div>`s — heading sequence unchanged |
| `label-content-name-mismatch` | a11y | Pre-existing; sweep added no labels on homepage |

a11y held at the SHIP-35 baseline of 95. New data-viz components carry
`role="meter"` + `aria-valuenow/min/max` (`SignalBar`) and `role="img"` +
`aria-label` (`CompositeScoreRing` / `SignalScoreRadar`).

## Reduced motion

Verified by design + the SHIP-22 infrastructure (not re-measured: the available
MCP browser tooling does not expose `prefers-reduced-motion` media emulation):

- Global `MotionConfig reducedMotion="user"` suppresses transform/layout
  animations across every `m` component. `FadeIn`/`Reveal`/`Stagger` y-rises and
  `SignalBar` scaleX are transforms → suppressed → render at rest (filled /
  in-place). Opacity fades remain (not vestibular-triggering).
- `CompositeScoreRing` animates `strokeDashoffset` (a paint property, not a
  transform → not auto-suppressed); it honors reduced motion **explicitly** via
  `useReducedMotion()` (renders at the final offset, duration 0).

## Device test coverage (Playwright, this sweep)

Homepage (desktop 1280 + mobile 390), `/issues`, `/search`, `/article/[slug]`,
`/design-preview`. Across all: target h1 paints at `opacity:1` immediately,
scroll reveals fire 0→1 in view, data-viz bars fill to scaleX 1, ring sweeps to
the score target, layout intact, 0 console errors (warnings = Plausible ignoring
localhost).

## Open items (not blocking)

- `prefers-reduced-motion` automated emulation — verify in a future pass with a
  tool that exposes `emulateMedia` (or manual OS toggle).
- Pre-existing a11y baseline items (`color-contrast`, `heading-order`,
  `label-content-name-mismatch`) tracked separately from this sweep.
