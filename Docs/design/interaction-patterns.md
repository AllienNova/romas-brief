---
title: ROMAS Brief — Interaction Patterns
version: 1.0.0
date: 2026-05-15
authority: ui-spec.md · web-engineer agent
---

# Interaction Patterns

## 1. Hover

- **Cards** (Top Stories, episode rows): subtle `--rb-shadow-2` lift on hover (desktop pointer only); `prefers-reduced-motion` → no shadow change. Cursor stays default unless the card is fully interactive (Click → article), in which case `cursor: pointer`.
- **Links** (inline + nav): underline appears on hover (`text-decoration-thickness: 1px` for body links, 2px for nav). Underline-offset 2px.
- **Buttons** (primary): `--rb-accent-deep` background on hover. Secondary buttons: `--rb-bg-elevated` → `--rb-rule` tint (subtle).
- **AudioPlayer play button**: scale 1.02 on hover (200ms `--rb-ease`); reduced-motion → no scale.
- **Tag pills**: background `--rb-accent-soft` → `--rb-accent` text color shift (keep contrast ≥ 4.5:1).

## 2. Focus (keyboard)

- **Every interactive element** receives `:focus-visible` with 2px solid `--rb-accent` outline, 3px offset, 4px radius. No focus ring on `:focus` only (so mouse clicks don't show the ring; keyboard activation does).
- **Tab order** follows reading order. Skip link "Skip to main content" is the first focusable element on every route, visible on focus, anchors to `<main id="main">`.
- **Modal trap**: when a modal opens, focus moves to the first focusable element inside; Tab/Shift-Tab cycles within the modal; Esc closes and returns focus to the trigger.
- **Dropdown / select**: arrow keys navigate options; Enter selects; Esc closes without selecting. Region-select dropdown announces "Switch region" on focus.

## 3. Async feedback

- **Within 100ms**: visual change (loading spinner, skeleton appearance).
- **Beyond 300ms**: explicit text label "Loading {what}…" via `role="status" aria-live="polite"`.
- **Beyond 3s**: progress indicator or estimate ("Still loading… large result set").
- **Beyond 10s**: option to cancel/retry surfaced.
- No spinner without a text label. No silent loading.

## 4. Errors

- **Form validation**: inline error under each invalid field, associated with the input via `aria-describedby`, announced on submit.
- **Network error on action**: toast at top-right (mobile bottom) with action verb in error message: "Couldn't subscribe — please retry." [Retry] button in toast.
- **Page-level error**: banner above main content with `role="alert"`, naming the actual issue and the actual fix.
- Banned: "Something went wrong", "Oops!", "Sorry, an error occurred", "Try again later" without specifying when.

## 5. Empty states

- Every collection screen documents an empty state in `wireframes.md`.
- Empty state names the **next action**: "No issues yet for this region — see the global edition" (with link). Not just "No results."
- For first-visit empty states (subscribe success, etc.), the empty state IS the success — frame it as confirmation, not absence.

## 6. Transitions

- Page transitions: instant (Next.js App Router default). No fade between routes.
- Modal open: 200ms fade-in + scale 0.95 → 1; close: 120ms fade-out.
- Dropdown open: 120ms fade-in + translate-y 4 → 0; close: instant.
- Drawer (mobile nav): 320ms slide-from-edge (left for nav, right for region-select).
- All transitions disabled under `prefers-reduced-motion`.

## 7. Gestures (touch)

- **Tap**: standard activation; 44×44 minimum touch target.
- **Swipe**: not used. No swipe-to-dismiss, no swipe-between-articles. Power-user keyboard nav suffices on desktop; touch is link-based.
- **Long press**: not used. Context menus are explicit buttons.
- **Pinch zoom**: never disabled. Mobile viewport allows user scaling.

## 8. AudioPlayer interactions (specific)

- **Play button**: Space toggles, Enter activates. Aria-label switches "Play {episode title}" ↔ "Pause".
- **Seek**: ←/→ skip 10s; Shift+←/→ skip 30s; Home returns to 0:00. Scrubber is draggable with mouse; keyboard arrow seeks the bar.
- **Transcript link**: always visible (web-engineer §Accessibility). Opens transcript URL in new tab; on focus, link aria-label is "Open transcript for {episode title}".
- **Status badge**: live region (`role="status"`) — screen reader announces state changes (`in_review` → `published`).

## 9. Region toggle interaction

- **Dropdown**: `<select>` with `aria-label="Switch region"`. 8 options sorted: detected region first, then alphabetical.
- **On change**: route updates URL parameter (`?region=eu`), persists to localStorage `rb_region`, refetches homepage modules with the new region filter, shows brief inline notice "Showing {region} edition" for 2s then dismisses.
- **No page reload**: client-side React state + Next.js shallow routing.

## 10. Subscribe interaction

- **Inline expand** (homepage): "Subscribe" link in nav opens an inline drawer below the masthead with email + region inputs. Tab order: email → region → submit. Esc closes drawer.
- **Standalone page** (`/subscribe`): full form (UF-001).
- **Success state**: form replaced with confirmation text + countdown to next issue.

## 11. Search interaction

- **Input**: 300ms debounce on keystroke; fires query after pause.
- **Results live update**: results region has `aria-live="polite"`; screen reader announces "X results for {query}".
- **Tab switching**: Articles ↔ Audio Episodes tabs; arrow keys navigate, Enter activates. Active tab visible via underline + `aria-selected="true"`.

## 12. Sponsor block interaction

- **No interaction by default**: sponsor block is static text + logo + CTA link. Hover on CTA link shows underline; no card-level click.
- **CTA link**: opens in new tab (`target="_blank"`, `rel="noopener noreferrer sponsored"`); Plausible event `sponsor_cta_click` fired with sponsor name + page slug.
- **Firewall**: 32px enforced; design-system-keeper PR-blocks any violation.

## 13. Revoke confirmation flow (CMS only)

- Two-step confirmation: click "Revoke" → modal "Type the article slug to confirm" → user types slug → submit. Prevents accidental revokes.
- Public-notice email preview shown before final submit.
- 60s SLA timer surfaced in success state: "Revoke fired. CDN purge in progress (X seconds elapsed)."
