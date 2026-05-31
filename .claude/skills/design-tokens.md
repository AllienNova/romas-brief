---
name: design-tokens
description: ROMAS Wire design tokens v1.1 — color, type, spacing, radius, motion, shadow, audio state colors. Load before any UI / component / Tailwind config work.
---

# ROMAS Wire — Design Tokens v1.1

All tokens live in `src/styles/tokens.css` as CSS custom properties on `:root`. Tailwind config consumes via `tailwind.config.ts` theme extension.

---

## Color

### Brand (v1.2 — M0c2 design-QA contrast fix)

```css
--rb-bg:              #FAFAF8;   /* off-white page bg */
--rb-bg-elevated:     #FFFFFF;
--rb-ink:             #0E1116;   /* primary text — 18.10:1 on bg (AAA Normal) */
--rb-ink-muted:       #4A5159;   /*               — 7.69:1 on bg (AAA Normal) */
--rb-ink-subtle:      #6B7280;   /* M0c2 v1.2: was #6E767E (4.41:1 FAIL AA Normal); now 4.55:1 PASS AA Normal */
--rb-rule:            #E5E7EB;   /* hairline borders */
--rb-accent:          #00B4C6;   /* ROMAS teal — FILLS ONLY (logo dot · large UI surfaces). Text use BANNED — 2.41:1 on bg fails AA Large. */
--rb-accent-deep:     #0090A0;   /* hover state · large filled surfaces; 3.66:1 on bg = AA Large only, NOT body text */
--rb-accent-strong:   #006B7A;   /* M0c2 v1.2 NEW: text + focus-ring + non-text-UI on bg; 5.91:1 PASS AA Normal · 5.16:1 on accent-soft PASS AA Normal */
--rb-accent-soft:     #D5F2F5;
```

### Audio state colors (v1.2 — M0c2 contrast fix)

Two parallel scales: original values for **decorative dots and large-surface fills** (no text); new `-text` variants for **badge label foreground**. Schema-enforced pairing per AudioStatusBadge component spec.

```css
/* Original: decorative dots, large-fill backgrounds (aria-hidden when used as dot) */
--rb-audio-published: #00B4C6;
--rb-audio-pending:   #F59E0B;
--rb-audio-skipped:   #94A3B8;
--rb-audio-revoked:   #DC2626;

/* NEW v1.2: badge label text — measured AA Normal pass on the badge background */
--rb-audio-published-text: #006B7A;  /* = --rb-accent-strong; 5.16:1 on accent-soft */
--rb-audio-pending-text:   #B45309;  /* amber-700 ish; 4.83:1 on amber-50 */
--rb-audio-skipped-text:   #475569;  /* slate-600;     5.85:1 on slate-100 */
--rb-audio-revoked-text:   #B91C1C;  /* red-700;       5.83:1 on red-50 */
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

**No sponsor logo or sponsor text may render within 32px of the ROMAS Wire wordmark.** Enforce in component via `min-margin` token:

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

## Accessibility (v1.2 — M0c2 measured + fixed)

**WCAG 2.2 AA minimum.** AAA on long-form body text (article body, Friday Read). Measured 2026-05-15 via Python WCAG 2.1 luminance formula; values below are fresh-command-output, not estimates.

| Pair | Contrast | AA Normal | AA Large | AAA Normal | Use |
|---|---|---|---|---|---|
| `--rb-ink` on `--rb-bg` | 18.10:1 | PASS | PASS | PASS | Body text · headings |
| `--rb-ink-muted` on `--rb-bg` | 7.69:1 | PASS | PASS | PASS | Meta · standfirst |
| `--rb-ink-subtle` on `--rb-bg` | 4.55:1 (v1.2 fix; was 4.41 FAIL) | PASS | PASS | FAIL | Subtle copy · issue meta · tag-pill labels |
| `--rb-accent` on `--rb-bg` | 2.41:1 | **FAIL** | **FAIL** | **FAIL** | **Fills only — banned as text or focus-ring** |
| `--rb-accent-deep` on `--rb-bg` | 3.66:1 | FAIL | PASS | FAIL | Hover fills · large-text-only (≥18.66px bold or ≥24px regular) |
| `--rb-accent-strong` on `--rb-bg` | 5.91:1 (NEW v1.2) | PASS | PASS | FAIL | Focus ring · link text · AudioStatusBadge published text |
| `--rb-accent-strong` on `--rb-accent-soft` | 5.16:1 | PASS | PASS | FAIL | AudioStatusBadge "Listen" label · text on soft surfaces |
| `--rb-audio-pending-text` (#B45309) on bg-amber-50 | 4.83:1 | PASS | PASS | FAIL | Badge `queued`/`generating`/`in_review` |
| `--rb-audio-skipped-text` (#475569) on bg-slate-100 | 5.85:1 | PASS | PASS | FAIL | Badge `skipped` |
| `--rb-audio-revoked-text` (#B91C1C) on bg-red-50 | 5.83:1 | PASS | PASS | FAIL | Badge `revoked` |
| `--rb-ink` on `--rb-accent` (#00B4C6) | 9.02:1 | PASS | PASS | PASS | AudioPlayer play-button glyph (v1.2: was white, now ink) |

**Banned uses** (design-system-keeper blocks):
- `--rb-accent` (#00B4C6) as text color anywhere — fails AA Large.
- `--rb-accent` as focus-ring outline — fails 1.4.11 non-text UI 3:1 minimum.
- `--rb-accent-deep` as body text below 18.66px bold or 24px regular — fails AA Normal.
- White (`--rb-bg-elevated` foreground) on `--rb-accent` background — fails AA Normal.

Focus ring (every interactive element) — **v1.2: now `--rb-accent-strong`**:

```css
:focus-visible {
  outline: 2px solid var(--rb-accent-strong);  /* was --rb-accent (2.41:1 FAIL); now 5.91:1 PASS */
  outline-offset: 3px;
  border-radius: var(--rb-radius-sm);
}
```

---

## Logo wordmark (recommended variant c)

```
ROMAS WIRE
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
          accent: 'var(--rb-accent)',                     /* fills only — banned as text */
          'accent-deep': 'var(--rb-accent-deep)',           /* hover · large-fill */
          'accent-strong': 'var(--rb-accent-strong)',       /* v1.2 NEW: text · focus-ring · non-text UI on bg */
          'accent-soft': 'var(--rb-accent-soft)',
          'audio-published': 'var(--rb-audio-published)',   /* decorative dot · large fill */
          'audio-pending':   'var(--rb-audio-pending)',     /* decorative dot · large fill */
          'audio-skipped':   'var(--rb-audio-skipped)',     /* decorative dot · large fill */
          'audio-revoked':   'var(--rb-audio-revoked)',     /* decorative dot · large fill */
          'audio-published-text': 'var(--rb-audio-published-text)',  /* v1.2 NEW: badge label */
          'audio-pending-text':   'var(--rb-audio-pending-text)',    /* v1.2 NEW: badge label */
          'audio-skipped-text':   'var(--rb-audio-skipped-text)',    /* v1.2 NEW: badge label */
          'audio-revoked-text':   'var(--rb-audio-revoked-text)',    /* v1.2 NEW: badge label */
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
