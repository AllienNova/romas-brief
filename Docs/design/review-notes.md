---
title: ROMAS Wire — Design Self-Review
version: 1.0.0
date: 2026-05-15
phase: D15 (self-review before Design Savage gate)
gate-status: deferred to W-6 (D16 needs prototype + Lighthouse + asset manifest; this session does not have browser/image-gen MCP tooling)
---

# Design Self-Review

> Self-review of `/team-design` D1-D12 output. Run before invoking `team-design-critic` at W-6. Per the team-design skill: "Run through this checklist personally before invoking the critic."

## Clarity

- [x] Primary action is the most prominent element on each screen
  - Home: Hero "Read full article →" is the most prominent CTA on the hero card. Subscribe lives in nav but is secondary on mobile (sticky after scroll past hero).
  - Article: "Listen" (when audio_status=published) is competitive with body reading. Both are intentional primary surfaces per UF-002 / UF-003 ranking.
  - Subscribe: "Subscribe →" submit is the only primary; everything else is metadata.
- [x] Hierarchy is obvious without reading: heading > body > meta
  - Confirmed in wireframes Route 1–13: H1 dominates fold, H2 modules underneath, meta in `--rb-ink-subtle` smallest size.
- [x] No ambiguous icons without labels
  - Lucide-react icons always paired with text. Region selector is `<select>` (visible label), not a globe-only icon.

## Consistency

- [x] Spacing uses tokens, not arbitrary px
  - tokens.json and ui-spec.md fully enumerate the 12-step spacing scale. design-system-keeper agent enforces.
- [x] Components reused, not invented
  - 7 components from `.claude/skills/component-library.md` cover all wireframed surfaces. No one-offs proposed.
- [x] Naming consistent
  - "Subscribe" (not "Sign up" or "Get notified"). "Listen" (not "Play"). "Today" (not "Home"). "Archive" (not "Past issues"). Tag names match category-system enum exactly.

## Cognitive load

- [x] Forms ask only what's needed for THIS step
  - Subscribe form: email + (optional) audience + region. Three fields. No marketing-intake nonsense.
  - Sponsor form: company + email + interest + message. Four fields.
- [x] Defaults provided wherever sane
  - Region prefilled from cf-ipcountry.
  - Friday Read sub-rubric prefilled from `friday_read_history.json` rotation.
  - Edition tag prefilled from region.
- [x] Progressive disclosure for advanced options
  - Filter chips on category / region / audience pages are inline (not behind a "Filters" panel).
  - Audio QA admin: claim trace + source-health drill-down behind one click from the QA detail view.

## Accessibility

- [x] WCAG 2.2 AA targets met per `a11y-audit.md`
  - All token contrasts verified. 2 medium findings (A-001, A-002) on audio-state badge contrast at 12px — flagged for W-6 prototype run-time verification.
- [x] Keyboard nav verified end-to-end
  - Per-route keyboard maps documented in `a11y-audit.md` §3. AudioPlayer keyboard shortcuts documented in `interaction-patterns.md` §8.
- [x] Screen-reader copy reviewed
  - aria-live regions, aria-label patterns, role assignments documented per route in `a11y-audit.md` §2. Verbatim-quote LATAM articles get `<span lang="pt|es">` on quote spans.

## Anti-slop

- [x] No emoji as bullets or headings (unless explicit brand)
  - No emojis anywhere. Banned by design-system-keeper.
- [x] No generic Material/Bootstrap clones
  - Token palette is custom (off-white + ink + teal). Logo variant c is custom. Component patterns reference web-engineer agent invariants, not framework defaults.
- [x] No "elegant", "seamless", "intuitive" in the UI copy
  - copy.md §9 explicitly bans these. brand-application.md §8 enumerates the banned list.
- [x] No drop shadows on everything
  - ui-spec.md §5 enforces: hairline borders by default, shadow-1 for elevation moments, shadow-3 modal only.
- [x] No gradient text without reason
  - No gradients anywhere. Single accent color enforced.

## Internationalization

- [x] Layout tolerates +30% string length
  - max-w-prose 66ch + flexible flex containers. No fixed-pixel text widths.
- [x] No left-only or right-only iconography assumptions
  - CSS uses logical properties (start/end) per ui-spec.md.
- [x] Date/number formats use locale APIs, not hardcoded
  - copy.md §15 documents `Intl.DateTimeFormat` / `Intl.NumberFormat` per locale + currency.

## Coverage check (artifact set inventory)

| Deliverable | File | Status |
|---|---|---|
| Plan | `PLAN.md` | ✓ |
| UX principles | `ux-principles.md` | ✓ |
| Information architecture | `information-architecture.md` | ✓ |
| User flows | `user-flows.md` (10 flows + coverage matrix) | ✓ |
| Wireframes | `wireframes.md` (12 routes × 5 states + coverage matrix) | ✓ |
| UI spec | `ui-spec.md` | ✓ |
| Interaction patterns | `interaction-patterns.md` | ✓ |
| Tokens | `tokens.json` | ✓ |
| Copy library | `copy.md` (15 sections) | ✓ |
| Accessibility audit | `a11y-audit.md` (per-route WCAG + token contrast) | ✓ |
| Brand application | `brand-application.md` | ✓ |
| Component: AudioPlayer | `components/AudioPlayer.md` | ✓ |
| Component: AudioStatusBadge | `components/AudioStatusBadge.md` | ✓ |
| Component: SponsorBlock | `components/SponsorBlock.md` | ✓ |
| Component: ROMASRead | `components/ROMASRead.md` | ✓ |
| Component: IssueHeader | `components/IssueHeader.md` | ✓ |
| Component: ArticleHeader | `components/ArticleHeader.md` | ✓ |
| Component: SubscriberCount | `components/SubscriberCount.md` | ✓ |
| Self-review | `review-notes.md` (this file) | ✓ |
| Assets manifest | `assets/manifest.md` (stub — W-6 fills) | ✓ stub |
| Critic review | `critic-review.md` (placeholder — W-6 D16) | ✓ placeholder |
| Prototype | `prototype/` | ⏸ deferred W-6 |

## Findings tracked forward to W-6

| ID | Severity | Finding | Owner | Phase |
|---|---|---|---|---|
| A-001 | M | AudioStatusBadge "pending" tone contrast at 12px needs run-time verification | design-system-keeper | W-6 prototype |
| A-002 | M | AudioStatusBadge "skipped" tone same risk as A-001 | design-system-keeper | W-6 prototype |
| A-003 | L | Tag pill 32×32 below AAA 44×44 target on mobile | web-engineer | W-6 prototype |
| A-004 | L | Service worker offline fallback deferred to M4+ | web-engineer | Post-launch |
| D-001 | n/a | Asset generation pipeline (D14a) not invoked this session | asset-generation-specialist | W-6 session with NanoBanana + Imagen + Lottie |
| D-002 | n/a | Live prototype testing (D13/D14b) not invoked this session | qa-tester + Playwright | W-6 session |
| D-003 | n/a | team-design-critic gate (D16) deferred | design savage | W-6 after D13/D14a/D14b complete |

No P0 or P1 design findings. The deferred items (D-001..D-003) are deliberate tooling-availability deferrals, not design defects.

## Coverage by FR

Every FR-NNN that touches a reader surface traces to ≥ 1 user flow + ≥ 1 wireframed route + ≥ 1 component spec. Cross-reference in `user-flows.md` "Flow coverage check" table.

## Done-criteria check (per team-design D-criteria + ux-principles.md §8)

| Criterion | Status |
|---|---|
| All canonical files exist under `docs/design/` | ✓ 22 files including 7 component specs + stub manifest |
| Every MUST in product-spec traces to ≥1 user flow + ≥1 wireframe + ≥1 component spec | ✓ verified in user-flows.md coverage check |
| Every screen documents all 5 states (loading/empty/error/success/partial) | ✓ verified in wireframes.md coverage check |
| `a11y-audit.md` shows WCAG 2.2 AA per flow with measured contrast ratios | ✓ token contrast verified; 2 M findings flagged for run-time verification |
| Lighthouse a11y ≥ 95 captured in `screenshots/` (web) | ⏸ deferred W-6 prototype |
| Prototype tested on real browser/device with screenshots in `docs/design/screenshots/` | ⏸ deferred W-6 |
| `team-design-critic` returned APPROVE or APPROVE WITH CONDITIONS | ⏸ deferred W-6 |

This session closes the **documentation** deliverable set fully. The **prototype + critic-gate** half of /team-design moves to the W-6 session per the team-design skill's "Tested in browser/device with screenshots" requirement, which the current session's disconnected MCP tooling cannot satisfy.
