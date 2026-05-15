---
title: ROMAS Brief — UI Specification
version: 1.0.0
date: 2026-05-15
authority: .claude/skills/design-tokens.md v1.1 (executable token set)
---

# UI Specification

> Tokens are canonical in `.claude/skills/design-tokens.md` (CSS custom properties on `:root`) and mirrored to `tokens.json` (this directory). This file documents the **macro layout rules** that consume those tokens.

## 1. Typography scale (from design-tokens.md, locked v1.1)

| Token | Size | Line-height | Use |
|---|---|---|---|
| `--rb-text-xs` | 0.75rem (12px) | 1.5 | Meta lines, tags, AudioStatusBadge |
| `--rb-text-sm` | 0.875rem (14px) | 1.5 | Body small, captions, nav |
| `--rb-text-base` | 1rem (16px) | 1.65 | **Article body baseline** (Source Serif Pro) |
| `--rb-text-lg` | 1.125rem (18px) | 1.5 | Standfirst (italic serif) |
| `--rb-text-xl` | 1.25rem (20px) | 1.4 | H3 |
| `--rb-text-2xl` | 1.5rem (24px) | 1.35 | H2 |
| `--rb-text-3xl` | 2rem (32px) | 1.25 | **Article title** |
| `--rb-text-4xl` | 2.5rem (40px) | 1.15 | Section heading |
| `--rb-text-5xl` | 3.25rem (52px) | 1.05 | **Hero only** |

**Font families**:
- `--rb-font-sans` = "Inter", system-ui, -apple-system, sans-serif — UI, nav, metadata, headlines
- `--rb-font-serif` = "Source Serif Pro", Georgia, serif — article body, standfirst (italic)
- `--rb-font-mono` = "JetBrains Mono", ui-monospace, monospace — code / data callouts only

**Self-hosted woff2**: Inter (4 weights: 400/500/600/700) + Source Serif Pro (3 weights: 400 + 400-italic + 600). Subset to Latin + Latin-extended (sufficient for English + Portuguese + Spanish). Total font payload < 80KB compressed.

**Article max measure**: `max-w-prose` = 66ch. Locked. Never wider on prose blocks. Article max width = 66ch on all viewports; on desktop the article centers within the viewport with generous side margins.

## 2. Spacing scale (from design-tokens.md)

`--rb-space-{1,2,3,4,5,6,8,10,12,16,20,24}` = 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 96px.

**Spacing rhythm rules**:
- Component internal padding: `--rb-space-4` (16px) baseline, `--rb-space-6` (24px) for cards.
- Section break (vertical between modules): `--rb-space-12` (48px) on desktop, `--rb-space-8` (32px) on mobile.
- Card gap in grid: `--rb-space-4` (16px) on mobile, `--rb-space-6` (24px) on desktop.
- Form field gap: `--rb-space-3` (12px) between label and input, `--rb-space-4` (16px) between fields.

**Sponsor firewall**: `--rb-sponsor-firewall = 2rem (32px)`. Locked. Enforced at layout level via `data-firewall="32"` attribute + Storybook layout test asserting DOM distance.

## 3. Color (from design-tokens.md v1.2 — measured M0c2)

Already documented in design-tokens.md v1.2 and tokens.json v1.2.0. Summary for UI consumption (light mode; contrast values measured 2026-05-15 via WCAG 2.1 luminance formula):

| Semantic role | Light mode | Dark mode | Contrast on bg | Use |
|---|---|---|---|---|
| Page bg | `--rb-bg = #FAFAF8` | `#0B0E12` | — | Page background |
| Surface | `--rb-bg-elevated = #FFFFFF` | `#121620` | — | Cards, popovers |
| Body text | `--rb-ink = #0E1116` | `#F5F6F7` | **18.10:1** AAA | Body, headings |
| Muted text | `--rb-ink-muted = #4A5159` | `#B0B6BD` | **7.69:1** AAA | Meta, standfirst |
| Subtle text | `--rb-ink-subtle = #6B7280` (v1.2) | `#9CA3AF` (v1.2) | **4.55:1** AA Normal | Subtle labels, tag pills |
| Rule | `--rb-rule = #E5E7EB` | `#1F242B` | — | Hairline borders |
| Accent (teal) | `--rb-accent = #00B4C6` | (same) | 2.41:1 — **FILLS ONLY · BANNED as text/border** | Logo dot, large-surface fill |
| Accent deep | `--rb-accent-deep = #0090A0` | (same) | 3.66:1 — **AA Large only (≥18.66px bold)** | Hover fills |
| **Accent strong (v1.2)** | `--rb-accent-strong = #006B7A` | (verify W-6) | **5.91:1** AA Normal | Text · focus ring · non-text UI |
| Accent soft | `--rb-accent-soft = #D5F2F5` | `#0A2F33` | — | Soft surfaces, callouts |

Audio-state colors and semantic colors documented in design-tokens.md v1.2 §Color with per-state `-text` variants for badge labels (each pass AA Normal on their respective bg per AudioStatusBadge state matrix).

## 4. Radius (from design-tokens.md)

| Token | px | Use |
|---|---|---|
| `--rb-radius-sm` | 4 | Focus ring radius, small chips |
| `--rb-radius` | 8 | Cards, inputs, buttons |
| `--rb-radius-lg` | 12 | Large cards, modals |
| `--rb-radius-xl` | 16 | Hero card |
| `--rb-radius-pill` | 9999 | AudioStatusBadge, tag pills |

## 5. Shadow

| Token | Use |
|---|---|
| `--rb-shadow-1` | Card resting state (rare — prefer hairline border) |
| `--rb-shadow-2` | Card hover, dropdown open |
| `--rb-shadow-3` | Modal only |

**Discipline**: Cards default to hairline border (`--rb-rule`) without shadow. Shadow-1 reserved for elevation moments; shadow-3 modal-only. No shadows on flat layouts.

## 6. Motion

| Token | Duration | Use |
|---|---|---|
| `--rb-dur-fast` | 120ms | Hover state, button press |
| `--rb-dur` | 200ms | Default transition |
| `--rb-dur-slow` | 320ms | Modal open/close, drawer slide |
| `--rb-ease` | `cubic-bezier(0.2, 0.6, 0.2, 1)` | Default ease |

**`prefers-reduced-motion` fallback**: All non-essential animation suppressed. AudioPlayer waveform animation → static bar. Skeleton shimmer → static gray block. Modal cross-fade → instant. Scroll-triggered animations → none.

## 7. Breakpoints + grid

| Breakpoint | px | Use |
|---|---|---|
| Mobile S | 320 | Smallest supported (older phones) |
| Mobile | 390 | iPhone 13/14/15 |
| Mobile L | 414 | iPhone Plus |
| Tablet | 768 | iPad portrait |
| Laptop | 1024 | iPad landscape, small laptop |
| Desktop | 1440 | Standard MacBook / display |

**Grid**:
- Mobile: 1 column, 16px gutters.
- Tablet: 6 columns, 16px gutters.
- Laptop / Desktop: 12 columns, 24px gutters.
- Max container width: 1280px centered with `--rb-space-8` (32px) side padding.
- Article body always centered with `max-w-prose` (66ch).

## 8. Iconography

Source: **Lucide** (lucide-react). Default size 16px (`size-4` Tailwind), 20px (`size-5`) for nav icons, 24px (`size-6`) for prominent actions. Stroke width 2 (Lucide default). Color: `currentColor` (inherits from text).

No custom icons at launch. If a domain need arises (e.g., dosimetry-specific glyph), the asset goes through D14a asset generation with brand-token color references.

## 9. Z-index scale

| Layer | z |
|---|---|
| Modal | 50 |
| Toast / notification | 40 |
| Sticky AudioPlayer Banner | 30 |
| Sticky header | 20 |
| Dropdown / select panel | 10 |
| Focus ring | always renders on top via outline (no z needed) |

No more z-index values. Anything outside this scale is a finding.

## 10. Performance budgets

| Metric | Target | Source |
|---|---|---|
| LCP | < 2.5s p75 (mobile 4G) | NFR-001 |
| INP | < 200ms p75 | NFR-002 |
| CLS | < 0.1 | NFR-003 |
| Font payload | < 80KB compressed total | UI-spec discipline |
| Hero image | < 200KB (AVIF preferred, JPEG fallback) | UI-spec discipline |
| OG card image | < 300KB | D14a manifest |
| AudioPlayer JS payload | < 8KB (small client component) | web-engineer.md §Performance |

## 11. Component composition rules

- Always prefer reusing a design-system component. Inventing a one-off when a system component fits is a design-system-keeper PR block.
- Components compose left-to-right (logical reading order). No "decorative top-row" of icons that requires reading bottom-up.
- Composite components (AudioPlayer = button + scrubber + transcript link) keep their own internal padding; outer container provides surrounding rhythm via `--rb-space-*`.
