---
component: ArticleHeader
source-of-truth: .claude/skills/component-library.md §ArticleHeader
version: 1.0.0
---

# ArticleHeader

Top of article page. Renders modality / region / content-type pills, H1 title, standfirst (italic serif), and connects to the AudioPlayer Variant A below.

## Props

```ts
type Props = {
  title: string;          // ≤ 90 chars (schema-enforced via articles.title_length CHECK)
  standfirst: string;     // editorial summary, italic
  archetype: 'short_brief' | 'standard_analysis' | 'deep_report';
  modalityTags: string[]; // e.g. ['Photon', 'MR-Linac']
  regionTag?: string;     // e.g. 'Europe', 'APAC'
  contentTypeTag?: string;
};
```

Full TSX in `.claude/skills/component-library.md §ArticleHeader`.

## Layout

```
+------------------------------------------------------------+
|                  (max-w-prose 66ch centered)               |
|                                                            |
| [Europe pill] [Photon pill] [MR-Linac pill] [Vendor intel] |
|                                                            |
| H1 title (Inter 700 32px desktop / 28px mobile, leading 1.15)|
|                                                            |
| Standfirst (Source Serif Pro italic 400 18px, ink-muted)   |
+------------------------------------------------------------+
```

## States

| State | Render |
|---|---|
| `success` (default) | Pills + title + standfirst |
| `loading` | 3 pill skeletons + title skeleton (2 lines) + standfirst skeleton (1 line) |
| `empty` | N/A (article either exists or 404) |
| `error` | N/A (article either exists or 410/500) |
| `partial` (modality tags missing) | Pills row hidden cleanly; title + standfirst render |

## Pills

- Tag pills are clickable links to `/regions/{slug}` or `/categories/{slug}` or `/categories/{modality-slug}`.
- Pill background: `--rb-accent-soft`; pill text: `--rb-accent-deep`; AA contrast verified.
- 12px sans 500 text; pill padding `px-2 py-1`; radius `--rb-radius-sm` (4px square pill, not full pill — to differentiate from AudioStatusBadge).

## Title

- Char count ≤ 90 — schema-enforced via `articles.title_length` CHECK constraint.
- H1, Inter 700, leading 1.15. Tracking -0.02em.
- Desktop: 32px (`--rb-text-3xl`). Mobile: 28px (between `text-2xl` and `text-3xl`).
- No widow-orphan handling at v1 (deferred to UI polish).

## Standfirst

- Source Serif Pro italic 400.
- 18px (`--rb-text-lg`).
- `--rb-ink-muted` color.
- Margin-top from title: `--rb-space-4` (16px).
- Editorial editorial-style-guide enforces standfirst length per archetype (40–80 words).

## Accessibility

- H1 = article title.
- Pills are `<a>` elements with `aria-label="Filter by {Tag}"`.
- Standfirst is `<p>` (not heading; not the same as a subtitle).

## LATAM article variant

When `source_language != 'en'`, ArticleHeader still renders in English. The original-language footer attribution (per copy.md §11) renders **after** the byline + source-attribution block, not in the header. Verbatim quotes in body use `<span lang="pt|es">` inline.

## Tokens

- Container: `max-w-prose mx-auto mb-6`
- Pills container: `flex gap-2 mb-3`
- Title: `text-3xl md:text-4xl font-sans font-bold --rb-ink leading-tight tracking-tight`
- Standfirst: `mt-4 text-lg font-serif italic --rb-ink-muted`

## Anti-patterns blocked

- Title > 90 chars → BLOCK at schema level.
- H2 used in header where H1 is expected → BLOCK.
- Standfirst in sans (instead of italic serif) → BLOCK.
- Pills rendered as buttons (instead of links) — they navigate, they're links → BLOCK.
- Pill color violating token allowlist → BLOCK.
