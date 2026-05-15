---
component: SubscriberCount
source-of-truth: .claude/skills/component-library.md §SubscriberCount
version: 1.0.0
fr-trace: FR-020 (subscriber count hidden until 2,500)
---

# SubscriberCount

Application-layer guard on subscriber-count exposure. Renders qualitative copy when active count < 2,500; renders banded numeric copy at thresholds 2.5k+ / 5k+ / 10k+ / 25k+.

## Props

```ts
type Props = { activeCount: number };
```

Full TSX in `.claude/skills/component-library.md §SubscriberCount`.

## States

| activeCount | Render |
|---|---|
| `< 2500` | "Built for radiation oncologists, physicists, dosimetrists, therapists, and oncology leaders." |
| `2500..4999` | "Joining **2.5k+** radiation oncology professionals." |
| `5000..9999` | "Joining **5k+** radiation oncology professionals." |
| `10000..24999` | "Joining **10k+** radiation oncology professionals." |
| `>= 25000` | "Joining **25k+** radiation oncology professionals." |

## Why thresholds

Master-Strategy §3 ledger row 5 locked: "Subscriber count hidden until 2,500. Milestones: 2.5k / 5k / 10k / 25k."

Rationale: pre-2,500 the count is a credibility risk (audience needs the substantive value before the volume metric). Post-2,500 the count is a credibility asset (social proof). Banded display prevents the count from becoming a vanity-update treadmill.

## Layout

Single `<p>` element. Body small (14px sans). `--rb-ink-muted` color.

Renders in two slots:
1. Homepage inline subscribe section (above email form when present).
2. About page "What we do" paragraph.

## Accessibility

- `<p>` element; not a heading.
- The numeric band (e.g., "2.5k+") wrapped in `<strong>` for emphasis. `aria-label` includes the full count band ("Joining over 2,500 radiation oncology professionals") for screen reader clarity if needed; default rendered text is sufficient.
- Locale-aware number formatting via `Intl.NumberFormat` if expanded to per-locale grouping (currently English-only at launch).

## Anti-patterns blocked

- Displaying `activeCount` exactly (e.g., "847 subscribers") → BLOCK (the qualitative copy or banded copy is mandatory).
- Updating threshold without Master-Strategy ledger update → BLOCK.
- Removing the qualitative-copy branch (showing nothing below 2,500) → BLOCK (the qualitative copy is the substantive sales pitch).
- Banded copy that exposes a different number than the band threshold (e.g., "Joining 3,247 professionals" when band is 2.5k+) → BLOCK.

## Schema relationship

`SubscriberCount` reads from the `subscriber_count` view in Supabase (per `cms-schema.md`). The view returns the count under service-role; the application layer guards exposure per the thresholds above.

Future enhancement (post-launch): move the threshold guard into the view itself (return only the banded string, not the raw count) so the qualitative-display rule survives any application-layer drift.
