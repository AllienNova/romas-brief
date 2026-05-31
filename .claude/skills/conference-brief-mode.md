---
name: conference-brief-mode
description: ROMAS Conference Brief tier — activation, embargo-aware live-mode operation during ASTRO, ESTRO, AAPM, JASTRO, RANZCR, ESMO, ASCO. Episode cadence, embargo posture, RSS handling. Load whenever a covered conference is active or imminent.
---

# ROMAS Wire — Conference Brief Mode

## Conferences in scope

Activate Conference Brief tier during:

- **ASTRO Annual Meeting** (US)
- **ESTRO Annual Congress** (Europe)
- **AAPM Annual Meeting** (US, physics)
- **JASTRO Annual Meeting** (Japan)
- **RANZCR Annual Scientific Meeting** (Australia / NZ)
- **ESMO Congress** (Europe, med-onc adjacent)
- **ASCO Annual Meeting** (US, med-onc adjacent)

For other conferences (KOSRO, CSTRO, AROI, DEGRO, SFRO, AIRO, SEOR), default to standard daily coverage; activate Conference Brief mode only if Kimal signals.

---

## Pre-conference setup (T-2 weeks)

1. **Schedule** — `conference-mode-operator` loads the official conference program into `conference_schedule.json` with embargo times per session.
2. **Press credentials** — confirm media access; record press office contact.
3. **Cover art** — generate `conference-brief-cover-3000.png` variant for that conference.
4. **Lexicon** — add any conference-specific terms to lexicon proposals queue (new drug names, new trial acronyms).
5. **Watchlist** — flag top 10 abstracts of interest based on program + investigator priors.
6. **Audio cadence** — define daily Conference Brief audio (15–30 min, daily during the conference).

---

## During-conference daily loop

| Time (local conf TZ) | Action |
|---|---|
| Morning | Ingest overnight published abstracts + press releases. |
| Plenary times | Real-time monitor; do NOT draft during embargo. |
| Embargo lift | Items flow into normal scoring pipeline; sub-set tag = `conference`. |
| Afternoon | Draft Conference Brief episode (script). |
| Late afternoon | Audio production + QA gate. |
| Evening | Publish daily Conference Brief episode + push RSS update. |

Daily issue continues to publish at 07:00 ET; Conference Brief is **additional**, not a replacement.

---

## Embargo posture (sacred)

- **All conference abstracts default to embargoed** until the session's official release time.
- The Conference Brief RSS publisher includes a **pre-publish embargo lint**: block any item with `embargo_until > now()` from entering the feed.
- If a vendor / society press release leaks before its embargo time, **continue to hold** until the official release time. Do not be the first to break.
- Track embargo time **in the conference's local timezone**, not UTC, to avoid an early-release mistake at timezone boundaries.

---

## Conference Brief episode structure

15–30 min target. Cadence: 1 episode per conference day.

```
[Pre-roll]
"From ROMAS Intelligence — clinical intelligence for modern radiation oncology. This is the {Conference} Day {N} Brief."

[Opening — 60s]
What today's program covered, who the key voices were.

[3–6 segment blocks, each 3–6 min:]
  - Title of the abstract / session
  - What was presented
  - Numbers (cohort, endpoint, effect size)
  - Why it matters
  - Limitations
  - ROMAS Take (labeled — interpretation)
  - Primary source citation (abstract URL / DOI when available)

[Closing — 60s]
What to watch tomorrow.

[Sign-off — Kimal]
```

Episode title format: `{Conference} Day {N}: {topic theme}`.

---

## RSS feed

Conference Brief feed: `https://romas.brief/feeds/conference-brief.xml`.

- Episode count cap: last 50 episodes.
- Cover art: conference-specific variant per active conference.
- During the conference: regenerate feed on every published episode.
- After conference ends: feed continues to serve the archive; no new episodes until next conference.

---

## Cross-tier integration

- **Audio Brief tier**: still produces per-article briefings from articles in the daily issue. Conference-tagged articles produce Audio Briefs as normal.
- **Daily Brief tier**: daily roundup episode mentions the day's top conference items.
- **Conference Brief tier**: deeper, conference-focused episode (this skill).
- **Podcast tier**: post-conference wrap-up episode in the Friday after the conference ends.

---

## Conference-mode-operator decision rights

The `conference-mode-operator` subagent owns:

- Daily Conference Brief lineup (which sessions get segment blocks).
- Embargo lift-time validation per session.
- Conference watchlist updates during the conference.

Kimal approves the daily episode lineup before audio QA.

---

## Embargo violation reporting

If a Conference Brief episode is found to have included an embargoed item:

1. Immediately `revoked` the audio episode.
2. CDN purge (60s SLA).
3. Notify the conference press office with apology.
4. Internal post-mortem.
5. Lockdown new episodes for 24h until the gap in detection is fixed.

This is a credibility event. Treat it like a security incident.

---

## Quiet periods

Between covered conferences:

- Conference Brief feed stays online (archive).
- No new episodes are produced.
- The `conference_schedule.json` shows next conference + countdown.

---

*Conference mode is when ROMAS Wire is most exposed. Discipline > speed.*
