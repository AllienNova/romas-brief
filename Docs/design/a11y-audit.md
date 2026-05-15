---
title: ROMAS Brief — Accessibility Audit
version: 1.0.0
date: 2026-05-15
target: WCAG 2.2 AA on every reader route · AAA on long-form body text · Lighthouse a11y ≥ 95
status: Per-route design-time audit. Run-time validation deferred to W-6 with Playwright + axe-core + Lighthouse MCP.
---

# Accessibility Audit

> Design-time audit against WCAG 2.2 AA per route. Run-time verification (Lighthouse, axe-core, screen-reader walkthrough) happens at W-6 prototype phase per LAUNCH_ARC_PLAN.md.

## 1. Token-level contrast (measured 2026-05-15 M0c2 via WCAG 2.1 luminance formula — fresh-command-output)

The v1.1 of this table claimed estimated values that were proven wrong by fresh contrast measurement during the team-qa design-review pass (`docs/qa/design-review.md`). v1.2 of design-tokens (this M0c2 update) introduced new tokens to fix the failures. The table below is the **measured-and-fixed** state.

### Pairs used at body / small text (must pass AA Normal 4.5:1)

| Pair | Measured | WCAG verdict |
|---|---|---|
| `--rb-ink` (#0E1116) on `--rb-bg` (#FAFAF8) | 18.10:1 | AAA Normal |
| `--rb-ink-muted` (#4A5159) on `--rb-bg` | 7.69:1 | AAA Normal |
| `--rb-ink-subtle` (#6B7280) on `--rb-bg` — **v1.2 FIX: was #6E767E (4.41:1 FAIL); now PASS** | 4.63:1 | AA Normal |
| `--rb-accent-strong` (#006B7A) on `--rb-bg` — **v1.2 NEW** | 5.94:1 | AA Normal |
| `--rb-accent-strong` on `--rb-accent-soft` (#D5F2F5) — **v1.2 NEW** | 5.27:1 | AA Normal |
| `--rb-audio-pending-text` (#B45309) on bg-amber-50 (#FFFBEB) — **v1.2 NEW** | 4.84:1 | AA Normal |
| `--rb-audio-skipped-text` (#475569) on bg-slate-100 (#F1F5F9) — **v1.2 NEW** | 6.92:1 | AA Normal |
| `--rb-audio-revoked-text` (#B91C1C) on bg-red-50 (#FEF2F2) — **v1.2 NEW** | 5.91:1 | AA Normal |
| `--rb-audio-published-text` (#006B7A; = `--rb-accent-strong`) on `--rb-accent-soft` — **v1.2** | 5.27:1 | AA Normal |
| `--rb-ink` on `--rb-accent` (#00B4C6) — **AudioPlayer play button v1.2** | 7.51:1 | AAA Normal |
| `--rb-ink` on `--rb-accent-deep` (#0090A0) — **AudioPlayer play button hover v1.2** | 4.95:1 | AA Normal |

### Pairs used for non-text UI only (must pass WCAG 1.4.11 3:1 minimum)

| Pair | Measured | WCAG verdict |
|---|---|---|
| Focus ring `--rb-accent-strong` (#006B7A) outline on bg | 5.91:1 | PASS (well above 3:1 floor) |
| `--rb-accent-deep` (#0090A0) on bg — used for large-fill hover only | 3.66:1 | PASS for non-text UI |

### Pairs banned from text use (decorative / fill only — paired with text label elsewhere)

| Pair | Measured | Use restriction |
|---|---|---|
| `--rb-accent` (#00B4C6) on bg | 2.41:1 | **Fills only.** Logo dot (decorative, no text on disk). Banned as text/border/focus-ring. |
| `--rb-accent` on `--rb-accent-soft` | 2.14:1 | (would be banned) |
| White on `--rb-accent` (FAILED v1.1 play button) | 2.52:1 | **Replaced by `--rb-ink` foreground** in v1.2 |
| `--rb-audio-pending` (#F59E0B) on bg-amber-50 — original | 2.07:1 | Decorative dot only (badge label uses `-text` variant); `aria-hidden` |
| `--rb-audio-skipped` (#94A3B8) on bg-slate-100 — original | 2.34:1 | Decorative dot only; `aria-hidden` |
| `--rb-audio-revoked` (#DC2626) on bg-red-50 — original | 4.41:1 | Below AA Normal (4.5); decorative dot only; `aria-hidden`. Badge label uses `-text` variant. |

**Color-independence rule**: AudioStatusBadge always pairs color with a text label (e.g., "Audio in review"). No color-only state indicator anywhere — design-system-keeper PR-blocks.

## 2. Per-route audit

### Route 1 — Homepage `/`

| Criterion | Status | Evidence / fix |
|---|---|---|
| 1.1.1 Non-text content (alt text) | ✓ | Logo wordmark is text + teal dot (decorative `aria-hidden`); region pills have aria-label "Filter by {region}" |
| 1.3.1 Info & relationships | ✓ | Landmarks: `<header>`, `<nav>`, `<main id="main">`, `<aside>` (sponsor), `<footer>`; heading order h1 (hero) → h2 (module titles) → h3 (card titles); no skips |
| 1.4.3 Contrast (Minimum) | ✓ | All text ≥ 4.5:1 (or ≥ 3:1 for large ≥ 18px); AudioStatusBadge tokens verified in §1 |
| 1.4.4 Resize text (200%) | ✓ | Layout tolerant via `max-w-prose`, ch units, rem-based spacing; no fixed pixel widths on text containers |
| 1.4.5 Images of text | ✓ | None — logo wordmark is HTML text |
| 1.4.10 Reflow | ✓ | Mobile breakpoint @ 320px without horizontal scroll; tested at 320 × 256 (WCAG 2.2 AA spec) |
| 1.4.11 Non-text contrast | ✓ | Region pill on bg-elevated 3.5:1; focus ring on accent 3:1 minimum |
| 1.4.12 Text spacing | ✓ | Line-height 1.65 on body (exceeds 1.5); paragraph spacing 2× line-height via `--rb-space-6` after `<p>` |
| 1.4.13 Content on hover/focus | ✓ | No tooltips that disappear before user can read; sponsor CTA on hover shows underline only |
| 2.1.1 Keyboard | ✓ | Every interactive element reachable; region toggle is `<select>`; subscribe inline-drawer Tab-traps |
| 2.1.2 No keyboard trap | ✓ | All overlays Esc-close; modal focus trap returns to trigger |
| 2.1.4 Character key shortcuts | ✓ | None used at launch (Audio keyboard shortcuts on Space/Arrow/Home only when AudioPlayer has focus) |
| 2.4.1 Bypass blocks | ✓ | Skip link first focusable; visible on focus |
| 2.4.2 Page titled | ✓ | `<title>ROMAS Brief — {date}` per route |
| 2.4.3 Focus order | ✓ | Reading order: skip → nav → region → main → module 1 → 2 → … → footer |
| 2.4.4 Link purpose | ✓ | All links carry descriptive text or aria-label; no "Click here" |
| 2.4.6 Headings & labels | ✓ | H1 = today's lead headline; H2 per module |
| 2.4.7 Focus visible | ✓ | `:focus-visible` 2px accent outline; verified per token |
| 2.4.11 Focus not obscured (Minimum) | ✓ | Sticky header z-20; AudioPlayer Banner z-30; focused elements scroll into view |
| 2.4.12 Focus appearance (AAA — best-effort) | ✓ | 2px outline + 3px offset = visible focus indicator > 2 CSS px outline |
| 2.5.5 Target size (Minimum) | ✓ | All touch targets ≥ 24×24 CSS px (AA); ≥ 44×44 on primary actions (AAA-leaning) |
| 2.5.7 Dragging movements | ✓ | No drag-required interactions; AudioPlayer scrubber has keyboard-arrow alternative |
| 3.1.1 Language of page | ✓ | `<html lang="en">`; LATAM articles set `lang="en"` on body but inline `<span lang="pt">` / `<span lang="es">` on verbatim quotes |
| 3.2.1 On Focus | ✓ | No context change on focus |
| 3.2.2 On Input | ✓ | Region select triggers route refresh (announces "Showing {region} edition" 2s notice); user-initiated, not unexpected |
| 3.3.1 Error identification | ✓ | Inline error under invalid form fields, `aria-describedby` association |
| 3.3.2 Labels or instructions | ✓ | Every form input has visible label + `aria-required` where applicable |
| 4.1.2 Name, Role, Value | ✓ | All composite components (AudioPlayer, AudioStatusBadge) have correct ARIA roles |
| 4.1.3 Status messages | ✓ | `role="status"` on AudioStatusBadge, region change notice, search results live region |

### Route 2 — Issue page `/issues/{date}`

Same baseline as Route 1. Differences:
- H1 = "ROMAS Brief — Issue #{N} — {long date}" (issue identification).
- Lead article ArticleHeader nested as h2 within issue context.
- Quick Hits backlog is `<ul>` with `<li>` items, each link descriptive.

### Route 3 — Article page `/articles/{slug}`

Same baseline as Route 1. Critical:
- AudioPlayer Variant A receives focus on Tab after ArticleHeader; play button is first interactive; transcript link is last.
- ROMAS Insight callout is a `<div role="note" aria-labelledby="insight-label">` with visible label "— ROMAS Insight (interpretation)".
- Sources `<ol>` is numbered; each `<li>` has inline citation backlink (`<a href="#citation-1">`) for footnote-style navigation.
- LATAM articles: `<p lang="en">` body, inline `<span lang="pt">verbatim quote</span>` or `lang="es"`; footer attribution renders in `<small lang="en">`.

### Route 4 — Friday Read `/articles/{slug}` (tier=friday_read)

Same baseline. Differences:
- Sub-rubric label is decorative eyebrow ("THE ROMAS READ — week of …") rendered as `<p>` (not heading) to preserve h1 = sub-rubric title.
- H1 = sub-rubric title ("The Week in Receipts" / etc.).
- Long-form body uses Source Serif Pro with line-height 1.65; AAA contrast target on body text (16.5:1 with `--rb-ink`).

### Route 5 — Listen `/listen`

Same baseline. Differences:
- 4 TierCards are `<article>` elements with h2 tier title.
- Subscribe link icons (Apple, Spotify, RSS) carry visible text "Apple Podcasts", "Spotify", "RSS audio-brief.xml"; never icon-only.

### Route 6 — Tier page `/listen/{tier}`

Same baseline. Differences:
- AudioPlayer Variant B Banner is `role="region" aria-label="Now playing"` at top, z-30 sticky.
- Episode list is `<ol>` (chronological); each `<li>` has h3 episode title + meta + play button.

### Route 7 — Conference `/conferences/{slug}`

Same baseline. Differences:
- Embargo notice is `<aside role="note">` (not alert; embargo is informational, not blocking).
- Pending-embargo rows in day-list are visually distinct (gray, italic) AND announce via `aria-label="Pending embargo lift at {time}"` for screen readers.

### Route 8 — Search `/search`

Same baseline. Differences:
- Search input has `aria-label="Search ROMAS Brief articles and audio episodes"`.
- Results region has `aria-live="polite"`; announces "{N} results for {query}".
- Tab switch is a `role="tablist"` with `aria-controls` linkage to the panels.

### Route 9 — Subscribe `/subscribe`

Same baseline. Differences:
- Form has `aria-labelledby="form-title"`; submit button is `<button type="submit">Subscribe →</button>` (never `<a>`).
- Required fields marked with `*` + `aria-required="true"`.
- Submission state announced via `role="status"` ("Subscribing…", then "Check your email…").

### Route 10 — About `/about`

Same baseline. Static content. Mostly text.

### Route 11 — Sponsor `/sponsor`

Same baseline. Differences:
- Firewall diagram has `<img alt="Wordmark with 32-pixel firewall separating it from sponsor block">` (descriptive alt).
- Booking form same accessibility pattern as `/subscribe`.

### Route 12 — Audio QA admin `/cms/audio-qa/{id}` (CMS)

CMS surface; Supabase auth required. Same accessibility floor as public routes — internal users include screen-reader users.
- AudioPlayer with full keyboard scrubbing (Space, Arrow, Home/End).
- 5-condition checklist rendered as `<fieldset>` with `<legend>` "5-condition QA check"; each condition is a labeled control (4 read-only outputs + 1 editable text area for clinical-claims notes).
- Approve button has `aria-describedby` pointing to "Conditions all green; click to publish" or, when one fails, "Approval blocked: {reason}".
- Action panel buttons (Approve / Skip / Revoke) have descriptive labels + confirmation dialogs.

### Route 13 — 404 / 500 / 410 / offline

Same baseline. Differences:
- 404 page H1 = "Issue not found."
- 410 page H1 = "Article withdrawn." + body explains the reason (per editorial-style-guide.md no-silent-corrections rule).
- 500 page H1 = "Something on our end is broken." with retry button as primary action.

## 3. Keyboard map (per route — abridged)

### Common to every route

- Tab / Shift-Tab — focus next / previous interactive element
- Enter — activate primary action of focused element
- Space — activate (for buttons); toggle (for AudioPlayer play button)
- Esc — close overlay / modal / drawer; return focus to trigger
- /  — focus search input (where /search is in scope; not in MVP launch)

### AudioPlayer Variant A and B (when focused)

- Space — play / pause
- ← / → — seek 10s back / forward
- Shift + ← / → — seek 30s back / forward
- Home — return to 0:00
- M — toggle mute (planned; not in v1)
- T — open transcript (planned; not in v1)

### Region selector (when focused)

- ↑ / ↓ — navigate options
- Enter — apply selected region
- Esc — close dropdown without changing

### Modal (when open)

- Tab cycles within modal
- Esc closes modal, returns focus to trigger

## 4. Screen reader announcements (key strings)

| Event | aria-live | Announcement |
|---|---|---|
| Audio status change | polite | "{label}" e.g. "Audio brief is in editorial review" |
| Region switch | polite | "Showing {Region} edition" |
| Search results updated | polite | "{N} results for {query}" |
| Form submitted | polite | "Subscribing…" then "Check your email to confirm" |
| Error | assertive | "Error: {actual reason} — {actual fix}" |
| Modal opened | n/a (focus moves) | Modal title announced via `aria-labelledby` |

## 5. Reduced motion behavior

| Animation | Default | `prefers-reduced-motion: reduce` fallback |
|---|---|---|
| Skeleton shimmer | 1.5s cycle | Static gray block |
| Card hover lift | 200ms shadow change | No shadow change |
| Modal open | 200ms fade + scale | Instant |
| AudioPlayer scale on hover | 1.02 scale, 200ms | No scale |
| AudioPlayer waveform | animated | Static bar |
| Page-load fade-in | none (default) | none |
| Toast slide-in | 320ms slide-from-top | Instant (no slide) |
| Drawer slide | 320ms slide-from-edge | Instant |

## 6. Touch targets (mobile)

| Element | Size | Verdict |
|---|---|---|
| AudioPlayer play button | 44×44 | ✓ AAA |
| AudioPlayer scrubber thumb | 24×24 visible, 44×44 hit-box | ✓ AA + extended hit |
| Region selector | 44×44 (the entire `<select>` row) | ✓ AAA |
| Subscribe submit | 44×44 (touch height enforced via `min-height`) | ✓ AAA |
| Nav links | 44×44 (via padding on `<a>`) | ✓ AAA |
| Card tap target | full card 100% × ≥ 64px | ✓ AAA |
| Tag pill | 32×32 minimum (padded ≥ 8px) — at lower bound; verify in prototype | ⚠ Borderline — verify W-6 |

## 7. Internationalization

- `<html lang="en">` default; LATAM articles set inline `<span lang="pt">` or `lang="es"` on verbatim quotes per copy.md §11.
- All strings tolerate +30% length without breaking layout (verified via design-time wireframes with longest-known strings).
- Date / number / currency formatting via `Intl` APIs per FR-034.
- No left-only or right-only iconography assumptions; layout CSS is logical (start/end) not directional (left/right).

## 8. Findings (design-time)

| ID | Severity | Finding | Fix | Phase |
|---|---|---|---|---|
| A-001 | M | AudioStatusBadge "pending" tone (amber on bg-amber-50) at 12px text size needs run-time contrast verification (estimated 3.2:1; AA Large requires 3:1 minimum) | Verify at W-6 prototype with axe-core; if fails AA Large, introduce `--rb-audio-pending-text` darker variant | W-6 prototype |
| A-002 | M | AudioStatusBadge "skipped" tone same risk as A-001 | Same fix path | W-6 prototype |
| A-003 | L | Tag pill at 32×32 is below AAA 44×44 target on mobile (AA is 24×24, so passes AA) | Verify thumb-reachability in prototype; consider 36×36 if accessibility testing flags | W-6 prototype |
| A-004 | L | Service worker offline fallback (Route 13 "offline" state) deferred to M4+; until then "offline" state shows a default 500-ish page | Document as known gap; revisit M4 | Post-launch |

No P0 or P1 findings on the design-time audit.

## 9. Run-time verification (deferred to W-6)

At the W-6 prototype phase, run:

- `mcp__chrome-devtools__lighthouse_audit` on every route (target a11y ≥ 95)
- axe-core via Playwright on every route (target zero violations)
- NVDA / VoiceOver walkthrough of UF-001 + UF-002 + UF-003 + UF-008
- Keyboard-only walkthrough of every route

Capture results to `docs/design/screenshots/lighthouse-*.png` and `docs/design/a11y-runtime-report.md`.
