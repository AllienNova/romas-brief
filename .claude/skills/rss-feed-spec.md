---
name: rss-feed-spec
description: Per-tier RSS feed structure for ROMAS Brief — audio-brief.xml, daily-brief.xml, podcast.xml, conference-brief.xml. Apple Podcasts + Spotify compliant. Includes iTunes namespace, podcast:transcript, podcast:funding. Load before generating or modifying any RSS feed.
---

# ROMAS Brief — RSS Feed Spec

## Four feeds, one publisher

Every tier gets its own RSS feed at a fixed URL. **Never mix tiers in one feed.**

| Tier | Feed URL | Apple Podcasts category | Episode count cap |
|---|---|---|---|
| Audio Brief | `https://romas.brief/feeds/audio-brief.xml` | Health & Fitness › Medicine | last 500 episodes |
| Daily Brief | `https://romas.brief/feeds/daily-brief.xml` | News › Daily News | last 100 episodes |
| Podcast | `https://romas.brief/feeds/podcast.xml` | Health & Fitness › Medicine | unlimited |
| Conference Brief | `https://romas.brief/feeds/conference-brief.xml` | Health & Fitness › Medicine | last 50 episodes |

---

## Required namespaces

```xml
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:podcast="https://podcastindex.org/namespace/1.0">
```

Always include all four. Spotify and Apple consume different subsets.

---

## Channel template (Audio Brief example)

```xml
<channel>
  <title>ROMAS Audio Brief</title>
  <link>https://romas.brief/listen/audio-brief</link>
  <description>Per-article audio briefings for radiation oncology professionals — clinical intelligence in 5 to 10 minutes. From ROMAS Intelligence.</description>
  <language>en-us</language>
  <copyright>© ROMAS Intelligence</copyright>
  <itunes:author>ROMAS Intelligence</itunes:author>
  <itunes:owner>
    <itunes:name>Kimal Honour Djam</itunes:name>
    <itunes:email>president@aliennova.com</itunes:email>
  </itunes:owner>
  <itunes:image href="https://romas.brief/static/audio-brief-cover-3000.png"/>
  <itunes:category text="Health &amp; Fitness">
    <itunes:category text="Medicine"/>
  </itunes:category>
  <itunes:explicit>false</itunes:explicit>
  <itunes:type>episodic</itunes:type>
  <itunes:summary>Radiation oncology, decoded daily.</itunes:summary>
  <atom:link href="https://romas.brief/feeds/audio-brief.xml" rel="self" type="application/rss+xml"/>
  <podcast:funding url="https://romas.brief/support">Support ROMAS Brief</podcast:funding>
  <podcast:locked owner="president@aliennova.com">yes</podcast:locked>
  <podcast:guid>...</podcast:guid>

  <!-- items -->
</channel>
```

---

## Item template

```xml
<item>
  <title>{episode_title_max_90_chars}</title>
  <link>https://romas.brief/article/{slug}</link>
  <guid isPermaLink="false">romas-brief:audio:{audio_job_id}</guid>
  <pubDate>{rfc2822_datetime}</pubDate>
  <description><![CDATA[{episode_description}]]></description>
  <content:encoded><![CDATA[{full_episode_show_notes_html}]]></content:encoded>
  <enclosure
    url="https://cdn.romas.brief/audio/brief/{yyyy}/{mm}/{slug}__brief.mp3"
    length="{bytes}"
    type="audio/mpeg"/>
  <itunes:duration>{hh:mm:ss}</itunes:duration>
  <itunes:episodeType>full</itunes:episodeType>
  <itunes:explicit>false</itunes:explicit>
  <itunes:author>ROMAS Intelligence</itunes:author>
  <itunes:summary>{plain_text_summary_max_240}</itunes:summary>
  <itunes:image href="https://romas.brief/static/audio-brief-cover-3000.png"/>
  <podcast:transcript
    url="https://cdn.romas.brief/transcripts/{yyyy}/{mm}/{slug}.txt"
    type="text/plain"/>
  <podcast:transcript
    url="https://cdn.romas.brief/transcripts/{yyyy}/{mm}/{slug}.srt"
    type="application/srt"/>
  <podcast:chapters
    url="https://cdn.romas.brief/chapters/{yyyy}/{mm}/{slug}.json"
    type="application/json+chapters"/>
</item>
```

---

## Episode description rules

- **≤ 240 chars** in `<itunes:summary>` (Apple display).
- **Plain text, no markdown** in `<description>`.
- **HTML allowed** in `<content:encoded>` (full show notes — bulleted, with primary source links).
- **First line of description** is the headline restated for podcast app context.
- **Last line of description** is the canonical article URL.

---

## Show notes HTML template

```html
<p><strong>{Headline}</strong></p>
<p>{Standfirst / dek}</p>

<h3>What happened</h3>
<p>...</p>

<h3>Why it matters</h3>
<p>...</p>

<h3>ROMAS Take <em>(interpretation)</em></h3>
<p>{One line.}</p>

<h3>Primary source</h3>
<p><a href="{primary_url}">{Source name}</a> — {identifier (PMID / DOI / 510k / NCT)}</p>

<p><em>Full article: <a href="https://romas.brief/article/{slug}">romas.brief/article/{slug}</a></em></p>
```

---

## Per-tier specifics

### Daily Brief feed
- Episodes: 10–15 min daily roundups.
- `itunes:type = episodic`.
- Cover: `daily-brief-cover-3000.png`.
- Each episode covers that day's top-5.

### Podcast feed
- Weekly, 30–60 min.
- `itunes:type = serial` if running themed seasons, else `episodic`.
- Post-roll: "Not headlines. Clinical intelligence." (in audio, also referenced in show notes).
- Cover: `podcast-cover-3000.png`.

### Conference Brief feed
- Active only during ASTRO / ESTRO / AAPM / JASTRO / RANZCR / ESMO.
- Episode title format: `{Conference} — Day {N}: {topic}`.
- **Embargo-aware** — no item ships in this feed under active embargo. Block at RSS publisher.

---

## Revocation handling

When an audio item flips to `revoked`:

1. RSS publisher regenerates the affected feed **without the revoked item**.
2. The `<item>` is removed entirely (not flagged) — Apple / Spotify will purge from listener queues on next poll.
3. CDN purge of MP3 + transcript + chapters URLs (60s SLA).
4. If the item was the most recent in the feed, push an updated feed marker to force aggregator refresh.

---

## Validation

Before publishing, every feed must pass:

1. `xmllint --noout` (valid XML).
2. Apple's `validator.podcasts.apple.com` URL check (CI-automated).
3. Podcast Index validator.
4. Manual smoke-test on Apple Podcasts + Spotify subscribe flow weekly.

---

## File generation

```ts
// tools/rss/generate.ts
async function generateFeed(tier: 'audio-brief' | 'daily-brief' | 'podcast' | 'conference-brief') {
  const episodes = await loadPublishedEpisodes(tier);
  const xml = renderTemplate(tier, episodes);
  await validateXml(xml);
  await uploadToCdn(`/feeds/${tier}.xml`, xml, { contentType: 'application/rss+xml' });
  await purgeCdnByPath(`/feeds/${tier}.xml`);
}
```

Regenerate on every `audio_status: published | revoked` event.

---

*Apple Podcasts is unforgiving. Validate before every push.*
