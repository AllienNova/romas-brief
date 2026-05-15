---
component: AudioPlayer
variants: ["A — Inline (80px)", "B — Banner (56px sticky)"]
source-of-truth: .claude/skills/component-library.md §AudioPlayer
version: 1.0.0
---

# AudioPlayer

Two variants sharing one underlying audio engine + state. Both consume the same `audio_jobs` row.

## Props

```ts
type Props = {
  audioJob: AudioJob;     // { audio_url_cdn, duration_sec, transcript_url, audio_status }
  articleTitle: string;
};
```

Full TSX in `.claude/skills/component-library.md §AudioPlayer`.

## Variants

| Variant | Height | Sticky? | Use |
|---|---|---|---|
| A — Inline | 80px | No | Article page, immediately under standfirst |
| B — Banner | 56px | Yes (top:0, z-30) | Listen tier page, sticky across navigation |

## States (matrix)

| State | Variant A (inline) | Variant B (banner) |
|---|---|---|
| audio_status = `published` | Renders full player: play button + title + duration + transcript link | Renders banner: play button + title + duration |
| audio_status ∈ {`queued`,`generating`,`in_review`} | Replaced by AudioStatusBadge ("Audio in review" etc.) | Banner hidden (not rendered at all) |
| audio_status = `skipped` | Replaced by AudioStatusBadge ("No audio for this brief") | Banner hidden |
| audio_status = `revoked` | Replaced by 410 notice (Route 13) — article body is also revoked | Banner shows "Audio withdrawn — read article for corrected information" |
| audio file 404 at runtime | Inline error: "Audio is temporarily unavailable. The transcript is available below." + transcript link | Banner: "Audio temporarily unavailable. [Transcript →]" |
| Audio buffering (slow network) | Spinner + "Buffering… {N}%" | Same |
| Reduced motion | Waveform animation suppressed; static bar | Same |

## Accessibility

- Play button: 44×44 minimum touch target. Aria-label switches "Play {episode title}" ↔ "Pause".
- Space toggles play/pause when focused; ←/→ seek 10s; Shift+←/→ seek 30s; Home returns to 0:00.
- Scrubber is a `<input type="range">` with `aria-valuetext` announcing the current position ("2 minutes 14 seconds of 7 minutes 23 seconds").
- Transcript link always visible. Aria-label "Open transcript for {episode title}".
- `role="status"` on the player wrapper announces state changes.
- No autoplay anywhere. Ever. The play button must be user-activated.

## Tokens

- Surface: `--rb-bg-elevated`
- Border: `1px solid --rb-rule`
- Radius: `--rb-radius-lg` (12px) on Variant A; `0` on Variant B (sticky banner is full-bleed)
- Play button: `--rb-accent` background, **`--rb-ink` foreground** (v1.2 fix — was `--rb-bg-elevated`/white which measured 2.52:1 FAIL; now ink-on-accent = 7.51:1 PASS AAA Normal per docs/qa/design-review.md P0-D7). Hover state: bg → `--rb-accent-deep`; foreground stays `--rb-ink` (ink on accent-deep = 4.95:1 PASS AA Normal).
- Timestamp text: `--rb-ink-muted` 14px sans
- Transcript link: `--rb-accent` underlined-on-hover

## Behavior

- Polls `audio_status` every 30s during playback. On revoke detection → pause + show modal "This audio has been withdrawn. Read the article for the corrected information."
- Plausible event `audio_play` fired on play; `audio_complete_50` fired at 50% playthrough; `audio_complete` at 100%.
- Audio source uses `<audio>` element with `preload="metadata"` (no full preload). Range requests handled by R2 CDN.

## Anti-patterns blocked

- Variant A height ≠ 80px → blocked by design-system-keeper.
- Variant B height ≠ 56px → blocked.
- "Listen" CTA shown when `audio_status != 'published'` → blocked (schema + component double-check).
- Autoplay enabled → blocked.
- Transcript link hidden under "..." menu → blocked (must be always visible).
