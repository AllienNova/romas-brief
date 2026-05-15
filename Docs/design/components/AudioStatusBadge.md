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

## State matrix (v1.2 — M0c2 contrast fix per docs/qa/design-review.md)

The label foreground uses the new `*-text` token variants (each measured AA Normal pass on its bg). The decorative dot prefix uses `bg-current` so it tracks the label foreground automatically.

| status | Label | Tone | Background | Foreground (label) | Contrast |
|---|---|---|---|---|---|
| `queued` | "Audio queued" | pending | `bg-amber-50` (#FFFBEB) | `--rb-audio-pending-text` (#B45309) | 4.84:1 PASS AA Normal |
| `generating` | "Audio generating" | pending | `bg-amber-50` | `--rb-audio-pending-text` | 4.84:1 PASS AA Normal |
| `in_review` | "Audio in review" | pending | `bg-amber-50` | `--rb-audio-pending-text` | 4.84:1 PASS AA Normal |
| `published` | "Listen" | published | `--rb-accent-soft` (#D5F2F5) | `--rb-audio-published-text` (#006B7A; = `--rb-accent-strong`) | 5.27:1 PASS AA Normal |
| `skipped` | "No audio for this brief" | skipped | `bg-slate-100` (#F1F5F9) | `--rb-audio-skipped-text` (#475569) | 6.92:1 PASS AA Normal |
| `revoked` | "Audio withdrawn" | revoked | `bg-red-50` (#FEF2F2) | `--rb-audio-revoked-text` (#B91C1C) | 5.91:1 PASS AA Normal |

**v1.1 → v1.2 supersession**: in v1.1 the foreground used `--rb-audio-pending` (#F59E0B) etc., which measured 2.07:1 on amber-50 — FAIL AA Normal AND AA Large. v1.2 splits the token into a decorative scale (for dots and fills) and a `-text` scale (for badge labels, AA-compliant on their respective backgrounds). See `docs/qa/design-review.md` P0-D1 through P0-D4.

## Accessibility (v1.2 — M0c2 verified)

- `role="status"` (live region) — screen reader announces state changes.
- Small dot prefix (`size-1.5 rounded-full bg-current`) is `aria-hidden` (color-only is OK because the text label follows immediately).
- 12px sans 500 text (`--rb-text-xs`).
- All 6 state pairs verified ≥ 4.83:1 contrast (above AA Normal 4.5:1) per the State matrix table.

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
