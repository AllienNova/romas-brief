---
component: ROMASRead
source-of-truth: .claude/skills/component-library.md §ROMASRead
version: 1.0.0
---

# ROMASRead

The Friday issue long-form layout. Renders only on `articles.tier = 'friday_read'`. Sub-rubric rotates weekly.

## Props

```ts
type Rubric = 'week_in_receipts' | 'five_things_shifted' | 'what_i_got_wrong' | 'watch_next_week';

type Props = {
  rubric: Rubric;
  weekOf: string;          // e.g. "July 4, 2026"
  bodyHtml: string;
  signOff?: string;        // defaults to "— Kimal"
};
```

Full TSX in `.claude/skills/component-library.md §ROMASRead`.

## Sub-rubric titles (locked)

| rubric value | Title |
|---|---|
| `week_in_receipts` | "The Week in Receipts" |
| `five_things_shifted` | "Five Things That Shifted" |
| `what_i_got_wrong` | "What I Got Wrong" |
| `watch_next_week` | "Watch Next Week" |

## Layout

- Article max width: `max-w-prose` (66ch).
- Body font: Source Serif Pro 400, line-height 1.65 (article reading baseline).
- Header (eyebrow + title) is sans (Inter); body and standfirst are serif.
- Sub-rubric label uppercase `tracking-widest`, `--rb-accent-deep` color, sans.
- Sign-off `— Kimal` at end, sans, `--rb-ink-muted`.

## States

| State | Render |
|---|---|
| `success` (default) | Eyebrow + sub-rubric title h1 + hairline rule + body (prose) + sign-off |
| `loading` | Eyebrow skeleton + title skeleton + 5 paragraph skeletons |
| `empty` (no Friday Read this week — holiday week) | "No Friday Read this week. The next ROMAS Read drops on {date}." + link |
| `error` (rubric tracker file missing) | Falls back to plain title "The ROMAS Read" with no sub-rubric; logs editorial alert |
| `partial` (audio version pending) | AudioStatusBadge appears in header area instead of AudioPlayer |

## Sub-rubric body templates

Different rubrics expect different body shapes (editorial discipline):

- **Week in Receipts**: bullet list of "received" claims (vendor PR / society statement / regulatory clearance) with editor verdict per claim.
- **Five Things That Shifted**: numbered 1–5 with a one-line delta per item.
- **What I Got Wrong**: list of corrections to prior ROMAS Brief items with source link to the original.
- **Watch Next Week**: 3 forward indicators (regulatory deadline, vendor briefing, conference agenda item).

ROMAS Read body must NOT mix structures across rubrics — editorial-style-guide blocks.

## Accessibility

- H1 = sub-rubric title (eyebrow is decorative `<p>`, not heading).
- Long-form body achieves AAA contrast (16.5:1) on `--rb-ink` × `--rb-bg`.
- Quote callouts (left rule + indent) have `<blockquote>` semantics.
- Sign-off rendered in `<footer>` within `<article>` for semantic grouping.

## Tokens

- Container: `max-w-prose mx-auto`
- Eyebrow: `text-xs uppercase tracking-widest --rb-accent-deep font-sans`
- Title: `text-3xl font-sans font-bold --rb-ink`
- Body: `prose prose-rb` (Tailwind typography plugin with --rb tokens)
- Hairline rule: `border-b --rb-rule pb-6 mb-8`
- Sign-off: `mt-12 --rb-ink-muted font-sans`

## Anti-patterns blocked

- Sub-rubric value not in the 4-rubric enum → BLOCK.
- Body wider than max-w-prose (66ch) → BLOCK by design-system-keeper.
- Mixing serif + sans within the body prose → BLOCK.
- Sign-off other than `— Kimal` (default) → flag (allow override only via explicit prop).
