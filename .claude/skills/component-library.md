---
name: component-library
description: Canonical React component specs for ROMAS Wire — AudioPlayer (Variant A inline, Variant B banner), AudioStatusBadge, SponsorBlock, ROMASRead, IssueHeader, ArticleHeader, ListenPage. Load before building or modifying any reader-facing component.
---

# ROMAS Wire — Component Library

All components TypeScript, function components, Tailwind via design-tokens, accessibility-first.

Directory: `src/components/`. Each component has co-located test.

---

## AudioPlayer

Two variants. Both consume the same `audio_jobs` row.

### Variant A — Inline (80px)

Used at top of article body, immediately under standfirst.

```tsx
// src/components/AudioPlayer/Inline.tsx
type Props = {
  audioJob: AudioJob;     // { audio_url_cdn, duration_sec, transcript_url, audio_status }
  articleTitle: string;
};

export function AudioPlayerInline({ audioJob, articleTitle }: Props) {
  if (audioJob.audio_status !== 'published') {
    return <AudioStatusBadge status={audioJob.audio_status} />;
  }
  return (
    <div className="h-20 flex items-center gap-4 rounded-lg border border-rb-rule bg-rb-bg-elevated px-4">
      <PlayButton src={audioJob.audio_url_cdn} title={articleTitle} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-rb-ink truncate">Listen — ROMAS Audio Brief</p>
        <p className="text-xs text-rb-ink-muted">{formatDuration(audioJob.duration_sec)}</p>
      </div>
      <a
        href={audioJob.transcript_url}
        className="text-xs text-rb-accent underline-offset-2 hover:underline"
      >
        Transcript
      </a>
    </div>
  );
}
```

Height: 80px. No autoplay. Keyboard: Space toggles, ←/→ seek 10s.

### Variant B — Banner (56px)

Used as a sticky bar at top of Listen page or Daily Brief detail page.

```tsx
// src/components/AudioPlayer/Banner.tsx
export function AudioPlayerBanner({ audioJob, articleTitle }: Props) {
  return (
    <div className="sticky top-0 z-30 h-14 bg-rb-bg-elevated border-b border-rb-rule px-4 flex items-center gap-3">
      <PlayButton src={audioJob.audio_url_cdn} title={articleTitle} compact />
      <p className="flex-1 text-sm text-rb-ink truncate">{articleTitle}</p>
      <span className="text-xs text-rb-ink-muted">{formatDuration(audioJob.duration_sec)}</span>
    </div>
  );
}
```

Height: 56px. Same keyboard contract.

---

## AudioStatusBadge

```tsx
// src/components/AudioStatusBadge.tsx
type Props = { status: 'queued'|'generating'|'in_review'|'published'|'skipped'|'revoked' };

const COPY: Record<Props['status'], { label: string; tone: string }> = {
  queued:     { label: 'Audio queued',     tone: 'pending' },
  generating: { label: 'Audio generating', tone: 'pending' },
  in_review:  { label: 'Audio in review',  tone: 'pending' },
  published:  { label: 'Listen',           tone: 'published' },
  skipped:    { label: 'No audio for this brief', tone: 'skipped' },
  revoked:    { label: 'Audio withdrawn',  tone: 'revoked' },
};

export function AudioStatusBadge({ status }: Props) {
  const { label, tone } = COPY[status];
  return (
    <span
      role="status"
      className={[
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-pill text-xs font-medium',
        tone === 'published' && 'bg-rb-accent-soft text-rb-accent-deep',
        tone === 'pending'   && 'bg-amber-50 text-rb-audio-pending',
        tone === 'skipped'   && 'bg-slate-100 text-rb-audio-skipped',
        tone === 'revoked'   && 'bg-red-50 text-rb-audio-revoked',
      ].filter(Boolean).join(' ')}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {label}
    </span>
  );
}
```

Never display "published" without an actual playable URL. Schema constraint blocks it; component double-checks.

---

## SponsorBlock

Strict v1.1 spec: no "Together with", 32px firewall, no logo above hero.

```tsx
// src/components/SponsorBlock.tsx
type SponsorMode = 'sponsored_by' | 'partner_message';
type Props = {
  mode: SponsorMode;
  sponsor: { name: string; logoUrl?: string; cta: { label: string; href: string } };
};

export function SponsorBlock({ mode, sponsor }: Props) {
  const intro = mode === 'sponsored_by'
    ? `Sponsored by ${sponsor.name}.`
    : `Partner message from ${sponsor.name}.`;
  return (
    <aside
      data-firewall="32"
      className="my-12 mx-[max(2rem,var(--rb-sponsor-firewall))] rounded-lg border border-rb-rule bg-rb-bg-elevated p-6"
      aria-label="Sponsored content"
    >
      <p className="text-xs uppercase tracking-wide text-rb-ink-subtle mb-2">{intro}</p>
      {/* logo NEVER inside the masthead, never within 32px of wordmark */}
      {sponsor.logoUrl && (
        <img src={sponsor.logoUrl} alt={sponsor.name} className="h-8 mb-3" />
      )}
      <a
        href={sponsor.cta.href}
        className="text-sm font-medium text-rb-accent hover:underline"
      >
        {sponsor.cta.label} →
      </a>
    </aside>
  );
}
```

Layout guard (Storybook test): assert `data-firewall="32"` distance from masthead wordmark in DOM.

---

## ROMASRead (Friday issue)

```tsx
// src/components/ROMASRead.tsx
type Rubric = 'week_in_receipts' | 'five_things_shifted' | 'what_i_got_wrong' | 'watch_next_week';

const RUBRIC_TITLE: Record<Rubric, string> = {
  week_in_receipts:    'The Week in Receipts',
  five_things_shifted: 'Five Things That Shifted',
  what_i_got_wrong:    'What I Got Wrong',
  watch_next_week:     'Watch Next Week',
};

type Props = { rubric: Rubric; weekOf: string; bodyHtml: string; signOff?: string };

export function ROMASRead({ rubric, weekOf, bodyHtml, signOff = '— Kimal' }: Props) {
  return (
    <article className="mx-auto max-w-prose font-serif">
      <header className="mb-8 border-b border-rb-rule pb-6">
        <p className="text-xs uppercase tracking-widest text-rb-accent-deep font-sans mb-2">
          The ROMAS Read — week of {weekOf}
        </p>
        <h1 className="text-3xl font-sans font-bold text-rb-ink">{RUBRIC_TITLE[rubric]}</h1>
      </header>
      <div className="prose prose-rb" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      <footer className="mt-12 text-rb-ink-muted font-sans">{signOff}</footer>
    </article>
  );
}
```

Renders only on `tier = 'friday_read'` articles.

---

## IssueHeader / Masthead

```tsx
// src/components/IssueHeader.tsx
type Props = { issueDate: string; issueNumber: number };
export function IssueHeader({ issueDate, issueNumber }: Props) {
  return (
    <header className="border-b border-rb-rule bg-rb-bg">
      <div className="mx-auto max-w-5xl px-4 py-6 flex items-baseline justify-between">
        <a href="/" className="font-sans text-xl tracking-tight font-bold text-rb-ink">
          {/* variant c — teal dot under "i" in BRIEF */}
          <span>ROMAS BR</span>
          <span className="relative">
            I
            <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 size-1.5 rounded-full bg-rb-accent" aria-hidden />
          </span>
          <span>EF</span>
        </a>
        <p className="text-xs text-rb-ink-subtle font-sans">
          Issue #{issueNumber} · {issueDate}
        </p>
      </div>
      {/* Sponsor firewall — no sponsor logo within 32px below this */}
      <div className="h-8" data-firewall />
    </header>
  );
}
```

---

## ArticleHeader

```tsx
type Props = { title: string; standfirst: string; archetype: string; modalityTags: string[] };
export function ArticleHeader({ title, standfirst, archetype, modalityTags }: Props) {
  return (
    <header className="mx-auto max-w-prose mb-6">
      <div className="flex gap-2 mb-3">
        {modalityTags.map(t => (
          <span key={t} className="text-xs px-2 py-1 rounded bg-rb-accent-soft text-rb-accent-deep font-sans">{t}</span>
        ))}
      </div>
      <h1 className="text-3xl md:text-4xl font-sans font-bold text-rb-ink leading-tight tracking-tight">
        {title}
      </h1>
      <p className="mt-4 text-lg font-serif italic text-rb-ink-muted">{standfirst}</p>
    </header>
  );
}
```

Title char count guarded at write-time via schema (≤ 90).

---

## SubscriberCount

```tsx
type Props = { activeCount: number };
const QUALITATIVE = 'Built for radiation oncologists, physicists, dosimetrists, therapists, and oncology leaders.';

export function SubscriberCount({ activeCount }: Props) {
  if (activeCount < 2500) {
    return <p className="text-sm text-rb-ink-muted">{QUALITATIVE}</p>;
  }
  const band = activeCount >= 25000 ? '25k+' :
               activeCount >= 10000 ? '10k+' :
               activeCount >=  5000 ? '5k+'  :
                                       '2.5k+';
  return (
    <p className="text-sm text-rb-ink-muted">
      Joining <strong className="text-rb-ink">{band}</strong> radiation oncology professionals.
    </p>
  );
}
```

---

## ListenPage

Lists all four audio tiers as cards, each with subscribe links (Apple / Spotify / RSS).

```tsx
// src/app/listen/page.tsx
export default function ListenPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-sans font-bold text-rb-ink mb-2">Listen</h1>
      <p className="text-rb-ink-muted mb-12">
        Radiation oncology, decoded daily — in your ears.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        <TierCard tier="audio_brief"      title="ROMAS Audio Brief"      desc="Per-article briefings, 5 to 10 minutes." feedUrl="/feeds/audio-brief.xml" />
        <TierCard tier="daily_brief"      title="ROMAS Daily Brief"      desc="Daily roundup of the day's top 5."         feedUrl="/feeds/daily-brief.xml" />
        <TierCard tier="podcast"          title="The ROMAS Podcast"      desc="Weekly deep-dives, 30 to 60 minutes."      feedUrl="/feeds/podcast.xml" />
        <TierCard tier="conference_brief" title="ROMAS Conference Brief" desc="Live from ASTRO, ESTRO, AAPM, JASTRO."     feedUrl="/feeds/conference-brief.xml" />
      </div>
    </main>
  );
}
```

---

## Accessibility checklist (every component)

- All interactive elements reachable by keyboard.
- `:focus-visible` ring per design-tokens.
- AudioPlayer has captions / transcript link visible at all times.
- Color is **never** the sole signal — pair with text label.
- No autoplay audio.
- Live regions for status changes (`role="status"` on AudioStatusBadge).

---

*All components are presentational. Data fetching lives in `app/` route handlers / loaders.*
