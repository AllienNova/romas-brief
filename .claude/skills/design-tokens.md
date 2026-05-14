---
name: design-tokens
description: ROMAS Brief design tokens v1.1 — color, type, spacing, radius, motion, shadow, audio state colors. Load before any UI / component / Tailwind config work.
---

# ROMAS Brief — Design Tokens v1.1

All tokens live in `src/styles/tokens.css` as CSS custom properties on `:root`. Tailwind config consumes via `tailwind.config.ts` theme extension.

---

## Color

### Brand

```css
--rb-bg:              #FAFAF8;   /* off-white page bg */
--rb-bg-elevated:     #FFFFFF;
--rb-ink:             #0E1116;   /* primary text */
--rb-ink-muted:       #4A5159;
--rb-ink-subtle:      #6E767E;
--rb-rule:            #E5E7EB;   /* hairline borders */
--rb-accent:          #00B4C6;   /* ROMAS teal — single accent */
--rb-accent-deep:     #0090A0;
--rb-accent-soft:     #D5F2F5;
```

### Audio state (v1.1)

```css
--rb-audio-published: #00B4C6;
--rb-audio-pending:   #F59E0B;
--rb-audio-skipped:   #94A3B8;
--rb-audio-revoked:   #DC2626;
```

### Semantic

```css
--rb-success:         #16A34A;
--rb-warning:         #F59E0B;
--rb-danger:          #DC2626;
--rb-info:            #2563EB;
```

### Dark mode

```css
@media (prefers-color-scheme: dark) {
  :root {
    --rb-bg:           #0B0E12;
    --rb-bg-elevated:  #121620;
    --rb-ink:          #F5F6F7;
    --rb-ink-muted:    #B0B6BD;
    --rb-ink-subtle:   #7C848D;
    --rb-rule:         #1F242B;
    --rb-accent-soft:  #0A2F33;
  }
}
```

---

## Typography

```css
--rb-font-sans:    "Inter", system-ui, -apple-system, sans-serif;
--rb-font-serif:   "Source Serif Pro", Georgia, serif;
--rb-font-mono:    "JetBrains Mono", ui-monospace, monospace;
```

- **Body**: serif at reading length (article body). Sans at UI / nav / metadata.
- **Headlines**: sans, weight 700, tight leading.
- **Standfirst**: serif italic, weight 400.

### Scale

```
--rb-text-xs:    0.75rem   / 1.5
--rb-text-sm:    0.875rem  / 1.5
--rb-text-base:  1rem      / 1.65   (article body baseline)
--rb-text-lg:    1.125rem  / 1.5
--rb-text-xl:    1.25rem   / 1.4
--rb-text-2xl:   1.5rem    / 1.35
--rb-text-3xl:   2rem      / 1.25   (article title)
--rb-text-4xl:   2.5rem    / 1.15
--rb-text-5xl:   3.25rem   / 1.05   (hero only)
```

Article max measure: **66ch**. Never wider on prose blocks.

---

## Spacing

```
--rb-space-1: 0.25rem
--rb-space-2: 0.5rem
--rb-space-3: 0.75rem
--rb-space-4: 1rem
--rb-space-5: 1.25rem
--rb-space-6: 1.5rem
--rb-space-8: 2rem
--rb-space-10: 2.5rem
--rb-space-12: 3rem
--rb-space-16: 4rem
--rb-space-20: 5rem
--rb-space-24: 6rem
```

### Sponsor firewall (locked)

**No sponsor logo or sponsor text may render within 32px of the ROMAS Brief wordmark.** Enforce in component via `min-margin` token:

```css
--rb-sponsor-firewall: 2rem;   /* 32px */
```

---

## Radius

```
--rb-radius-sm:  4px
--rb-radius:     8px
--rb-radius-lg:  12px
--rb-radius-xl:  16px
--rb-radius-pill: 9999px
```

---

## Shadow

```
--rb-shadow-1: 0 1px 2px rgba(14,17,22,0.06);
--rb-shadow-2: 0 4px 12px rgba(14,17,22,0.08);
--rb-shadow-3: 0 12px 32px rgba(14,17,22,0.10);
```

Use shadow-1 for cards, shadow-2 for hover, shadow-3 for modals only.

---

## Motion

```
--rb-ease:       cubic-bezier(0.2, 0.6, 0.2, 1);
--rb-dur-fast:   120ms;
--rb-dur:        200ms;
--rb-dur-slow:   320ms;
```

Respect `prefers-reduced-motion` — disable non-essential animation.

---

## Accessibility

- **WCAG 2.2 AA minimum.** AAA where reasonable on long-form body text.
- `--rb-ink` on `--rb-bg` = 16.5:1 contrast. Pass.
- `--rb-ink-muted` on `--rb-bg` = 7.2:1. Pass.
- `--rb-accent` on `--rb-bg` = 3.4:1 — **do not use teal for body text**, only icons / accents ≥ 18px.

Focus ring (every interactive element):

```css
:focus-visible {
  outline: 2px solid var(--rb-accent);
  outline-offset: 3px;
  border-radius: var(--rb-radius-sm);
}
```

---

## Logo wordmark (recommended variant c)

```
ROMAS BRIEF
```

- Family: `Inter`, weight 700, letter-spacing -0.02em.
- "ROMAS" in `--rb-ink`.
- "BRIEF" in `--rb-ink` with the dot of the "i" replaced by a teal disk (`--rb-accent`), radius 50%.
- The teal dot also serves as the favicon glyph.

Forbidden until Day 90:

- Sponsor logo within 32px of wordmark.
- Co-branded mastheads.
- Any chevron-cursor mark (deferred per v1.1 lock).

---

## Tailwind extension

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        rb: {
          bg: 'var(--rb-bg)',
          'bg-elevated': 'var(--rb-bg-elevated)',
          ink: 'var(--rb-ink)',
          'ink-muted': 'var(--rb-ink-muted)',
          'ink-subtle': 'var(--rb-ink-subtle)',
          rule: 'var(--rb-rule)',
          accent: 'var(--rb-accent)',
          'accent-deep': 'var(--rb-accent-deep)',
          'accent-soft': 'var(--rb-accent-soft)',
          'audio-published': 'var(--rb-audio-published)',
          'audio-pending':   'var(--rb-audio-pending)',
          'audio-skipped':   'var(--rb-audio-skipped)',
          'audio-revoked':   'var(--rb-audio-revoked)',
        },
      },
      fontFamily: {
        sans:  ['var(--rb-font-sans)', 'sans-serif'],
        serif: ['var(--rb-font-serif)', 'serif'],
        mono:  ['var(--rb-font-mono)', 'monospace'],
      },
      maxWidth: { prose: '66ch' },
    },
  },
};
```

---

*Update only by appending — never reuse a token name with a new meaning.*
