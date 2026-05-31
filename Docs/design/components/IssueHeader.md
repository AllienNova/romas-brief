---
component: IssueHeader
source-of-truth: .claude/skills/component-library.md §IssueHeader
version: 1.0.0
---

# IssueHeader

Masthead. Used on Homepage, Issue page, and Article page. Renders wordmark variant c (teal dot under "i" in BRIEF) + issue meta.

## Props

```ts
type Props = { issueDate: string; issueNumber: number; edition?: 'apac' | 'eu' | 'americas' };
```

Full TSX in `.claude/skills/component-library.md §IssueHeader`.

## Layout

```
+-------------------------------------------------------------------------+
| ROMAS BR[•]EF                          Issue #142 · Wed, July 8, 2026  |
|                                        Americas edition                 |
+-------------------------------------------------------------------------+
| (32px sponsor firewall — data-firewall attribute on inner div)         |
+-------------------------------------------------------------------------+
```

- Logo on left (variant c — teal dot under "i" in BRIEF, doubles as favicon).
- Issue meta on right: `Issue #{N} · {weekday}, {long date} · {edition} edition`.
- 32px firewall below masthead — `<div className="h-8" data-firewall />`.

## States

| State | Render |
|---|---|
| `success` (default) | Wordmark + meta as above |
| `loading` | Wordmark renders; meta replaced by skeleton |
| `Homepage` (no specific issue) | Wordmark + tagline "Radiation oncology, decoded daily." (Today is the focus, no issue meta) |
| `404 / 500 / offline` | Wordmark only, no meta |

## Edition tag

Edition value drives the meta line per the three-edition publish (FR-033):

- `apac` → "APAC edition · 22:00 UTC (prior-day)"
- `eu` → "EU edition · 06:00 UTC"
- `americas` → "Americas edition · 11:00 UTC"

Default: detected via `cf-ipcountry` → `region` cookie → edition map.

## Accessibility

- Logo `<a href="/">` is the first focusable interactive element (after skip-link).
- Wordmark is HTML text (no image); teal dot is `<span aria-hidden>` decorative span.
- Issue meta is `<p>` (not heading); H1 lives in the article or page content area, not the masthead.

## Tokens

- Bg: `--rb-bg`
- Bottom border: `1px solid --rb-rule`
- Container max-w: `1280px` centered
- Padding: `px-4 py-6` (16px h, 24px v); `max-w-5xl mx-auto`
- Wordmark font: Inter 700, `--rb-text-xl tracking-tight`
- Wordmark dot: `size-1.5 rounded-full bg-rb-accent absolute -top-0.5 left-1/2 -translate-x-1/2` over the "I" in BRIEF
- Meta text: `--rb-text-xs --rb-ink-subtle font-sans`

## Anti-patterns blocked

- Logo variant other than c → flag (allow override only via explicit prop with rationale).
- Sponsor logo inside this header → BLOCK (firewall violation).
- Co-branded masthead (sponsor name + ROMAS WIRE together) → BLOCK Day 1–90.
- Issue meta in larger font than wordmark → flag.
- Wordmark color other than `--rb-ink` → BLOCK.
