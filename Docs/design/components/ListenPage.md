---
component: ListenPage
source-of-truth: .claude/skills/component-library.md §ListenPage
version: 1.0.0
authored: 2026-05-15 (M0c2 design-QA — closes design-review.md P1-D1 component count gap)
---

# ListenPage

The `/listen` route component. Renders an index of all four audio tiers as cards with subscribe links (Apple Podcasts / Spotify / RSS). Page-level component (not embeddable elsewhere); composes `TierCard` per tier.

## Composition

```
ListenPage
├── PageHeader ("Listen" + tagline)
├── TierCard × 4 (audio_brief · daily_brief · podcast · conference_brief)
└── Tier5Preview (Video Podcast preview — "Launches Day 60 with invited guest")
```

## Props

```ts
type Tier = 'audio_brief' | 'daily_brief' | 'podcast' | 'conference_brief';

type TierCardProps = {
  tier:    Tier;
  title:   string;
  desc:    string;
  feedUrl: string;
  latestEpisode?: {
    title:        string;
    durationSec:  number;
    publishedAt:  string;
  };
  subscribeUrls: {
    apple:   string;
    spotify: string;
    rss:     string;
  };
};
```

Full TSX in `.claude/skills/component-library.md §ListenPage`.

## Layout

### Desktop 1440×900 — success state

```
+----------------------------------------------------------------+
| Listen                                                          |
| Radiation oncology, decoded daily — in your ears.              |
+----------------------------------------------------------------+

+----------------------------+ +----------------------------+
| ROMAS Audio Brief          | | ROMAS Daily Brief          |
| Per-article briefings,     | | Daily roundup of the day's |
| 5 to 10 minutes.           | | top 5, 10 to 15 minutes.   |
|                            | |                            |
| Latest:                    | | Latest:                    |
| → "Daily Brief 2026-07-08" | | → "Audio Brief — ZAP-X"    |
|   7:23 · Wed 2026-07-08    | |   12:14 · Wed 2026-07-08   |
|                            | |                            |
| [Apple Podcasts]           | | [Apple Podcasts]           |
| [Spotify]                  | | [Spotify]                  |
| [RSS audio-brief.xml]      | | [RSS daily-brief.xml]      |
+----------------------------+ +----------------------------+

+----------------------------+ +----------------------------+
| The ROMAS Podcast          | | ROMAS Conference Brief     |
| Weekly deep-dives, 30 to   | | Live from ASTRO, ESTRO,    |
| 60 minutes.                | | AAPM, JASTRO, RANZCR.      |
|                            | |                            |
| Latest: Episode 008        | | Latest: ASTRO 2026 Day 3   |
| 47:14 · Wed 2026-07-08     | | 18:42 · Tue 2026-09-23     |
|                            | |                            |
| [Apple Podcasts]           | | [Apple Podcasts]           |
| [Spotify]                  | | [Spotify]                  |
| [RSS podcast.xml]          | | [RSS conference-brief.xml] |
+----------------------------+ +----------------------------+

+----------------------------------------------------------------+
| Tier 5 Video Podcast                                           |
| "With invited guests. Launches Day 60."                        |
| [Subscribe to be notified]                                     |
+----------------------------------------------------------------+
```

### Mobile 390×844 — success state

TierCards stack vertically (1 column). Otherwise identical content.

## States

| State | Render |
|---|---|
| `success` (default) | Page header + 4 TierCards + Tier 5 preview |
| `loading` | Page header + 4 TierCard skeletons (~3 lines each) |
| `empty` (pre-launch, no episodes for any tier) | TierCards show "First episode drops on Day 1 — subscribe to the RSS feed" instead of latest-episode meta |
| `error` (one tier card fails latest-episode fetch) | That card shows "Latest episode info unavailable — [Retry]". Other cards render normally. |
| `partial` (Conference Brief tier inactive — outside conference window) | Conference Brief card shows last conference covered + "Next conference: ESTRO 2026 ({date})" |

## Accessibility

- H1 = "Listen" (page heading)
- Each TierCard is an `<article>` element with H2 tier title.
- Subscribe link buttons carry visible text ("Apple Podcasts", "Spotify", "RSS audio-brief.xml") — never icon-only.
- RSS link is selectable text + a copy button (`aria-label="Copy RSS URL to clipboard"`) for power users.
- All buttons / links keyboard-reachable; focus order = page header → each card top-to-bottom → Tier 5 preview.
- `prefers-reduced-motion` suppresses card hover lift.

## Tokens

- Page container: `max-w-5xl mx-auto px-4 py-12`
- Card surface: `--rb-bg-elevated`, hairline border `--rb-rule`, `--rb-radius-lg` (12px), `--rb-shadow-1` on hover only
- Card padding: `--rb-space-6` (24px)
- Card gap: `--rb-space-6` (24px) on desktop, `--rb-space-4` (16px) on mobile
- Card grid: 2-column desktop, 1-column mobile (no fancy responsive — just `md:grid-cols-2`)
- Tier name h2: `--rb-text-2xl --rb-ink font-sans font-bold`
- Tier description: `--rb-text-sm --rb-ink-muted`
- "Latest:" eyebrow: `--rb-text-xs uppercase tracking-wide --rb-ink-subtle`
- Episode title: `--rb-text-sm --rb-ink font-medium`
- Episode meta: `--rb-text-xs --rb-ink-subtle`
- Subscribe links: `--rb-text-sm --rb-accent-strong` (v1.2 — for AA Normal contrast on bg-elevated; was `--rb-accent`)

## Behavior

- Latest-episode meta fetched server-side at render (Next.js SSR); cached at edge for 5 min.
- Apple Podcasts link uses `https://podcasts.apple.com/podcast/id{podcast_id}` deep-link.
- Spotify link uses `https://open.spotify.com/show/{show_id}`.
- RSS link is the public R2 / Cloudflare Pages URL of the per-tier `*.xml` feed.
- Tier 5 Video Podcast row links to `/subscribe?notify=tier5_launch` (capture notification opt-in).

## Per-tier subscribe taglines (locked from copy.md §14)

| Tier | Tagline |
|---|---|
| `audio_brief` | "Per-article briefings, 5 to 10 minutes." |
| `daily_brief` | "Daily roundup of the day's top 5, 10 to 15 minutes." |
| `podcast` | "Weekly deep-dives, 30 to 60 minutes." |
| `conference_brief` | "Live from ASTRO, ESTRO, AAPM, JASTRO, RANZCR." |

## Anti-patterns blocked

- Tier card without subscribe links → BLOCK (RSS is the entire point of the audio surface).
- Auto-play any audio on this page → BLOCK.
- Banner advertising / sponsor block inside TierCard → BLOCK (sponsor block has its own surface, 32px firewall).
- Conditional "Subscribe" text that vanishes when subscriber is already logged in → BLOCK (anonymous reader, no auth at launch).
- Hardcoded podcast IDs in JSX → BLOCK; use env vars or CMS-defined subscribe URLs.
