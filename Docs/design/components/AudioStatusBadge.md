---
component: AudioStatusBadge
source-of-truth: .claude/skills/component-library.md §AudioStatusBadge
version: 1.0.0
---

# AudioStatusBadge

Pill-shaped status indicator for per-article audio state. Always paired with a text label — color is never the sole signal.

## Props

```ts
type Props = { status: 'queued' | 'generating' | 'in_review' | 'published' | 'skipped' | 'revoked' };
```

Full TSX in `.claude/skills/component-library.md §AudioStatusBadge`.

## State matrix

| status | Label | Tone | Background | Foreground |
|---|---|---|---|---|
| `queued` | "Audio queued" | pending | `bg-amber-50` (#FFFBEB) | `--rb-audio-pending` (#F59E0B) |
| `generating` | "Audio generating" | pending | `bg-amber-50` | `--rb-audio-pending` |
| `in_review` | "Audio in review" | pending | `bg-amber-50` | `--rb-audio-pending` |
| `published` | "Listen" | published | `--rb-accent-soft` (#D5F2F5) | `--rb-accent-deep` (#0090A0) |
| `skipped` | "No audio for this brief" | skipped | `bg-slate-100` (#F1F5F9) | `--rb-audio-skipped` (#94A3B8) |
| `revoked` | "Audio withdrawn" | revoked | `bg-red-50` (#FEF2F2) | `--rb-audio-revoked` (#DC2626) |

## Accessibility

- `role="status"` (live region) — screen reader announces state changes.
- Small dot prefix (`size-1.5 rounded-full bg-current`) is `aria-hidden` (color-only is OK because the text label follows immediately).
- 12px sans 500 text (`--rb-text-xs`).
- Contrast verified on text foreground / background pair at 12px — `pending` and `skipped` flagged as Finding A-001 / A-002 in `a11y-audit.md`. Run-time verification at W-6.

## Behavior

- Renders inline on:
  - Top-Stories grid card (per article)
  - Quick Hits row (per article)
  - Article page header (when audio_status != 'published'; replaces AudioPlayer Variant A)
  - Listen episode list (per episode)
- Never displays "Listen" label without an actual published-and-CDN-cached audio URL — design-system-keeper PR-block + schema CHECK.

## Tokens

- Radius: `--rb-radius-pill`
- Padding: `px-3 py-1.5` (12px horizontal, 6px vertical)
- Font: 12px sans 500
- Gap: `gap-2` (8px between dot and label)

## Anti-patterns blocked

- Color-only badge (no label) → blocked.
- Custom status not in the 6-state enum → blocked.
- "Listen" label paired with status != `published` → blocked.
- Removing the dot prefix → blocked (visual consistency).
