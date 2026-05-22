---
title: ROMAS Brief — Wireframes
version: 1.0.0
date: 2026-05-15
authority: information-architecture.md §3 routes inventory · web-engineer agent surfaces · component-library skill
---

# Wireframes — 12 routes (+ Route 6 tier-page variant, + Route 13 errors), 5 states each

> Per LAUNCH_ARC_PLAN.md §2 trigger 2, the 12 canonical routes are: Homepage · Issue · Article · Friday Read · Listen · Conference · Search · Subscribe · About · Sponsor · Audio QA admin · 404. **Route 6 (Tier-specific Listen page)** is a variant of Route 5 (Listen index) — same template applied per tier — not a separate canonical wireframe; documented here for /team-build implementation reference. **Route 13 (404/500/410/offline)** is documented under "Route 12 / 404" in the LAUNCH_ARC_PLAN.md count but split out here for state coverage.


> Format per route: primary (success) state rendered as ASCII layout for mobile (390×844) and desktop (1440×900); other 4 states summarized with what changes. Token references use the v1.1 design-tokens. All measurements in CSS pixels.

Common header on every route (described once, referenced as `[HEADER]` in route layouts):

```
+---------------------------------------------------------------+  ← --rb-bg
|  ROMAS BR[•]EF      Today  Listen  Read▼  Search  [Region▼] [Subscribe→] |   h=64 desktop, 56 mobile
+---------------------------------------------------------------+
|                       ↕ 32px sponsor firewall ↕                |
+---------------------------------------------------------------+
```

Common footer on every route (described once, referenced as `[FOOTER]`):

```
+---------------------------------------------------------------+
| ROMAS Brief — Radiation oncology, decoded daily.              |
|                                                                 |
| Listen · Subscribe · About · Sponsor program · RSS feeds       |
| © 2026 ROMAS Intelligence · AlienNova                          |
| Privacy · Terms · Editorial policy · brief@romasbrief.com      |
|                                                                 |
| — Kimal                                                         |
+---------------------------------------------------------------+
```

---

## Route 1 — Homepage `/` (FR-013, FR-028, FR-032)

### Desktop 1440×900 — success state

```
[HEADER]

+----------------------+ +-----------------------------------------+
| HERO                 | | RIGHT RAIL                              |
| (today's lead)       | |                                         |
|                      | | Today is Wed 2026-07-08 · Issue #8     |
| [tag pills]          | |                                         |
| H1 headline          | | --- Today's podcast --------            |
| (max 90 chars)       | | [Variant B mini AudioPlayer]            |
|                      | | "ROMAS Podcast Episode 008"             |
| Standfirst (italic)  | | 42 min · [Listen]                       |
|                      | |                                         |
| [Variant A inline    | | --- Trending now ---------              |
|  AudioPlayer 80px]   | | 1. {article}                            |
|                      | | 2. {article}                            |
| — ROMAS Insight      | | 3. {article}                            |
|   (interpretation)   | | 4. {article}                            |
|                      | | 5. {article}                            |
| [Read full article →]| |                                         |
+----------------------+ +-----------------------------------------+

+----------------------------------------------------------------+
| TOP STORIES (6 cards, max 2 from any single region)            |
|                                                                 |
| [Card 1]  [Card 2]  [Card 3]                                   |
| [Card 4]  [Card 5]  [Card 6]                                   |
| Each card: [region pill] H2 title · standfirst · AudioStatus   |
+----------------------------------------------------------------+

+----------------------------------------------------------------+
| INDUSTRY MOVES (3 cards horizontal)                            |
| [Card 1]  [Card 2]  [Card 3]                                   |
+----------------------------------------------------------------+

+----------------------------------------------------------------+
| PAPER OF THE DAY (single wide card)                            |
| Tag: paper_critique · standfirst · 5-min read · [Read]         |
+----------------------------------------------------------------+

+----------------------------------------------------------------+
| QUICK HITS (5 compact rows)                                    |
| → {short headline} · {region pill} · {modality pill}           |
| → ...                                                           |
+----------------------------------------------------------------+

+----------------------------------------------------------------+
| TOP PAPERS THIS WEEK (5 cards)                                 |
| [Card]  [Card]  [Card]  [Card]  [Card]                         |
+----------------------------------------------------------------+

+----------------------------------------------------------------+
| INLINE SUBSCRIBE (only when SubscriberCount qualitative copy)  |
| "Built for radiation oncologists, physicists, dosimetrists,    |
|  therapists, and oncology leaders."                            |
| [email field] [Region select] [Subscribe →]                    |
+----------------------------------------------------------------+

[FOOTER]
```

### Mobile 390×844 — success state

```
[HEADER mobile - 56h, hamburger]

+--------------------------------+
| HERO (full-width)              |
| [region pill]                  |
| H1 title (4 lines max)         |
| Standfirst                     |
| [AudioPlayer Variant A 80px]   |
| — ROMAS Insight                |
| [Read full article →]          |
+--------------------------------+

[Top Stories — vertically stacked 6 cards, full-width]
[Industry Moves — horizontally scrollable carousel]
[Paper of the Day — full-width card]
[Quick Hits — 5 stacked rows]
[Today's podcast — Variant B-style banner inline]
[Trending — 5 stacked rows]
[Top Papers This Week — horizontally scrollable]
[Inline Subscribe — full-width]
[FOOTER mobile]
```

### Other states

- **Loading**: 8 module skeletons rendered with shimmer (respecting prefers-reduced-motion → static gray blocks). `role="status"` + `aria-label="Loading today's issue"`.
- **Empty (no issue today — e.g., holiday)**: Hero replaced with "No issue today. The last issue was Friday 2026-12-23. [See Friday's issue →]". Modules 2-7 hidden. Listen and footer remain.
- **Error (edge worker timeout)**: Banner at top "You're seeing yesterday's issue while we restore today's edition." + yesterday's snapshot rendered from R2 fallback. No JS errors thrown.
- **Partial (some modules failed to load — e.g., Trending API miss)**: Failed module shows inline retry: "Trending didn't load — [retry]". Other modules render normally.

---

## Route 2 — Issue page `/issues/{YYYY-MM-DD}` (FR-031)

### Desktop — success state

```
[HEADER]

+----------------------------------------------------------------+
| ISSUE HEADER                                                    |
| ROMAS BR[•]EF  ·  Issue #142  ·  Wednesday, July 8, 2026       |
| Edition: Americas 11:00 UTC                                    |
+----------------------------------------------------------------+

+----------------------------------------------------------------+
| LEAD ARTICLE (full ArticleHeader + standfirst + Variant A      |
|  AudioPlayer + first 3 paragraphs + [Continue reading →])     |
+----------------------------------------------------------------+

+----------------------------------------------------------------+
| TOP-4 SECONDARY ARTICLES (2x2 grid)                            |
| [Card][Card]                                                   |
| [Card][Card]                                                   |
+----------------------------------------------------------------+

+----------------------------------------------------------------+
| QUICK HITS BACKLOG (10 rows; date-anchored)                    |
| → {headline} · {region} · {modality}                           |
| ...                                                             |
+----------------------------------------------------------------+

+----------------------------------------------------------------+
| Friday Read pointer (Mon-Thu issues only)                       |
| "Friday's ROMAS Read drops {date} — {hypothesis: this week's    |
|  rubric} this week. [Subscribe →]"                              |
+----------------------------------------------------------------+

[FOOTER]
```

### Mobile — success state

Same content stacked: Issue header → Lead article (full ArticleHeader + AudioPlayer A) → 4 secondaries (vertically stacked cards) → Quick Hits (stacked rows) → Friday Read pointer → FOOTER.

### Other states

- **Loading**: ArticleHeader skeleton + AudioPlayer skeleton; reduces to plain "Loading Issue #142…" if JS is off.
- **Empty (issue date in future)**: "Issue #143 will publish on {date} at 11:00 UTC (Americas edition). [Subscribe to receive it →]".
- **Error (issue date invalid format)**: 404 page (Route 12) rendering with "Issue not found — try /issues/2026-07-08".
- **Partial (audio_status pending on lead article)**: Lead AudioPlayer shows AudioStatusBadge "Audio in review" instead of play button; rest renders normally.

---

## Route 3 — Article page `/articles/{slug}` (FR-013, FR-004, FR-018)

### Desktop — success state

```
[HEADER]
[breadcrumb: Today · Article tag · slug]

+----------------------------------------------------------------+
|                  (max-w-prose: 66ch centered)                  |
|                                                                 |
| [region pill] [modality pills] [content-type pill]             |
| H1 title (Inter sans 700, 2.5rem, leading 1.15)                |
| Standfirst (Source Serif Pro italic 400, 1.125rem, ink-muted)  |
|                                                                 |
| +--------------------------------------------------------------+
| | [AudioPlayer Variant A inline — 80px]                       |
| | [▶] Listen — ROMAS Audio Brief · 7:23 · [Transcript →]      |
| +--------------------------------------------------------------+
|                                                                 |
| Body (Source Serif Pro 400, 1rem, line-height 1.65)            |
| - paragraph 1                                                   |
| - paragraph 2 with inline citation footnote [1]                |
| - paragraph 3                                                   |
|                                                                 |
| > Quote block (left rule, indent)                              |
|                                                                 |
| ## H2 subhead                                                   |
| - paragraph                                                     |
|                                                                 |
| +-- ROMAS Insight (interpretation) ----------------------------+
| | One labeled line (italicized, ≤ 240 chars, accent-soft bg). |
| +--------------------------------------------------------------+
|                                                                 |
| ## Sources                                                      |
| 1. [FDA 510(k) K262XXX](https://accessdata.fda.gov/...)        |
|    Decision date: 2026-06-30 · Verified: 2026-07-08             |
| 2. ...                                                          |
|                                                                 |
| ## Related                                                      |
| → {article}                                                     |
| → {article}                                                     |
|                                                                 |
| Footer attribution (renders only when source_language != 'en'): |
| "Source originally in Portuguese; translated with editorial    |
|  review."                                                       |
+----------------------------------------------------------------+

⟨end of <main> element⟩
(Sponsor block — if any — renders here AS A SIBLING OF <main>,
 not nested inside <main>. DOM structure: <main>...</main><aside
 class="sponsor-block" data-firewall="32">...</aside><footer>...</footer>.
 design-system-keeper PR-blocks sponsor block placement inside <main>
 per SponsorBlock.md anti-patterns. Sponsor outer margin ≥ 32px from
 the masthead wordmark; layout test asserts DOM distance.)

[FOOTER]
```

### Mobile — success state

Same content; max-w-prose is full-width with 16px gutters. AudioPlayer stays as Variant A inline. ROMAS Insight callout retains accent-soft background.

### Other states

- **Loading**: ArticleHeader skeleton + AudioPlayer skeleton; first paragraph of body fades in as it arrives.
- **Empty (article slug not found)**: → 404 (Route 12).
- **Error (audio file 404 from R2)**: AudioPlayer renders the error inline: "Audio is temporarily unavailable. The transcript is available below." Body renders normally; transcript link surfaces in place of player.
- **Partial (audio_status != published)**: AudioPlayer slot shows AudioStatusBadge instead of player. Body + Sources + Related render fully.

---

## Route 4 — Friday Read `/articles/{slug}` (tier=friday_read) (FR-015)

### Desktop — success state

```
[HEADER]

+----------------------------------------------------------------+
|                  (max-w-prose: 66ch centered)                  |
|                                                                 |
| THE ROMAS READ — week of 2026-07-04                            |
| (sub-rubric label in uppercase tracking, accent-deep)          |
|                                                                 |
| H1 sub-rubric title (Inter sans 700, 2rem)                     |
| (e.g., "The Week in Receipts" | "Five Things That Shifted"     |
|  | "What I Got Wrong" | "Watch Next Week")                     |
|                                                                 |
| -------- (hairline rule) --------                              |
|                                                                 |
| Body (Source Serif Pro, longer-form, 2,000–3,500 words)        |
| - reading rhythm: ~2 paragraphs per H2 subhead                 |
| - inline citations as in Route 3                               |
| - one ROMAS Take callout per Friday Read                       |
|                                                                 |
| ## Sub-rubric specific structure                                |
| (Receipts → bullet list of "received" claims with verdict)     |
| (Five Things → numbered 1-5 with delta line per item)          |
| (What I Got Wrong → list of corrections with source link)      |
| (Watch Next Week → 3 forward indicators)                       |
|                                                                 |
| ## Sources (full list, deeper bibliography)                    |
|                                                                 |
| — Kimal                                                         |
+----------------------------------------------------------------+

[FOOTER]
```

### Mobile — success state

Same content; full-width max-w-prose with 16px gutters. Sub-rubric label stays prominent. Sign-off "— Kimal" anchored at end.

### Other states

- **Loading**: Issue header skeleton + first paragraph skeleton.
- **Empty (no Friday Read this week — e.g., holiday week)**: "No Friday Read this week. The next ROMAS Read drops on {date}." + link to last week's.
- **Error (rubric tracker file missing)**: Renders without rubric subtitle. Inline warning to editorial team in DOM comment; reader sees clean fallback title "The ROMAS Read".
- **Partial (audio version not yet published — Friday Read carries a longer audio)**: AudioStatusBadge "Audio in review · check back at 09:00 ET" + text-only Read continues.

---

## Route 5 — Listen `/listen` (FR-011, web-engineer surface §Listen)

### Desktop — success state

```
[HEADER]

+----------------------------------------------------------------+
| Listen                                                          |
| Radiation oncology, decoded daily — in your ears.              |
+----------------------------------------------------------------+

+----------------------------------------------------------------+
| TIER CARDS (2x2 grid on desktop, 1-column on mobile)           |
|                                                                 |
| +---------------------+   +---------------------+              |
| | ROMAS Audio Brief   |   | ROMAS Daily Brief   |              |
| | Per-article         |   | Daily roundup       |              |
| | 5-10 min            |   | 10-15 min           |              |
| | Latest: {episode}   |   | Latest: {episode}   |              |
| | [Apple] [Spotify]   |   | [Apple] [Spotify]   |              |
| | [RSS link]          |   | [RSS link]          |              |
| +---------------------+   +---------------------+              |
|                                                                 |
| +---------------------+   +---------------------+              |
| | The ROMAS Podcast   |   | ROMAS Conference Brief|            |
| | Weekly deep-dive    |   | During ASTRO/ESTRO  |              |
| | 30-60 min           |   | 15-30 min           |              |
| | Latest: Episode 008 |   | Latest: ASTRO Day 3 |              |
| | [Apple] [Spotify]   |   | [Apple] [Spotify]   |              |
| | [RSS link]          |   | [RSS link]          |              |
| +---------------------+   +---------------------+              |
|                                                                 |
| Tier 5 Video Podcast: "Launches Day 60 with invited guest.    |
|  Subscribe to be notified."                                    |
+----------------------------------------------------------------+

[FOOTER]
```

### Other states

- **Loading**: 4 TierCard skeletons.
- **Empty (no episodes yet for a tier — pre-launch only)**: TierCard shows "First episode drops Day 1 — subscribe to be notified."
- **Error (one tier card fails to fetch latest episode)**: That card shows "Latest episode info unavailable — [retry]". Other cards render.
- **Partial (Conference Brief tier inactive currently — outside conference window)**: Conference Brief card shows last conference covered + "Next conference: ESTRO 2026 ({date})".

---

## Route 6 — Tier-specific Listen page `/listen/{tier}` (FR-007, FR-011)

### Desktop — success state (Audio Brief example)

```
[HEADER]
+----------------------------------------------------------------+
| AudioPlayer Variant B (sticky banner 56px)                     |
| [▶] {latest episode title} · {duration} · {Transcript →}      |
+----------------------------------------------------------------+

+----------------------------------------------------------------+
| ROMAS Audio Brief                                              |
| Per-article briefings, 5 to 10 minutes.                        |
|                                                                 |
| Subscribe: [Apple Podcasts] [Spotify] [RSS audio-brief.xml]    |
+----------------------------------------------------------------+

+----------------------------------------------------------------+
| EPISODE LIST                                                    |
|                                                                 |
| → 2026-07-08 · {article title} · 7:23 · [Listen]               |
|   {one-line standfirst} · [Read article]                       |
| → 2026-07-07 · {article title} · 5:14 · [Listen]               |
| → 2026-07-04 · {article title} · 8:01 · [Listen]               |
| ...                                                             |
| [Load earlier →]                                                |
+----------------------------------------------------------------+

[FOOTER]
```

### Other states

- **Loading**: Banner skeleton + 10 row skeletons.
- **Empty (no episodes yet)**: "First episode drops on Day 1. Subscribe to the RSS feed."
- **Error (R2 CDN miss on latest)**: Banner shows "Audio temporarily unavailable" + transcript link. Episode list renders.
- **Partial (some episodes have transcript_url=null — edge case)**: Per-row "Transcript pending" instead of [Transcript →] link.

---

## Route 7 — Conference landing `/conferences/{slug}` (FR-016)

### Desktop — success state (ASTRO 2026, Day 3 active)

```
[HEADER]

+----------------------------------------------------------------+
| Banner: ASTRO 2026 — Day 3 of 4 (Sep 21–24)                    |
| Conference Brief active. Embargo posture: 12 plenary items     |
| under embargo until {date}.                                    |
+----------------------------------------------------------------+

+----------------------------------------------------------------+
| TODAY'S CONFERENCE BRIEF                                       |
| [AudioPlayer Variant B 56px sticky]                            |
| [▶] ASTRO 2026 Day 3 — {title} · 18:42                         |
+----------------------------------------------------------------+

+----------------------------------------------------------------+
| DAY-BY-DAY LIST                                                |
|                                                                 |
| Day 1 — Sun 2026-09-21                                          |
| → {article} · {article} · {article}                             |
|                                                                 |
| Day 2 — Mon 2026-09-22                                          |
| → ...                                                           |
|                                                                 |
| Day 3 — Tue 2026-09-23 · CURRENT                               |
| → (recently published) · (pending embargo lift at 16:00 UTC)  |
+----------------------------------------------------------------+

[FOOTER]
```

### Other states

- **Loading**: Banner skeleton + AudioPlayer skeleton + day list skeleton.
- **Empty (no covered conference active right now)**: Conference page redirects to /listen/conference-brief archive view with banner "ASTRO 2026 concluded {date}. Next: ESTRO 2026 ({date})."
- **Error (conference activation skill failed)**: 404 with "Conference coverage not yet active for {slug}."
- **Partial (some Day-3 articles still under embargo)**: List shows them as "Pending embargo lift" rows (greyed); they reveal automatically when embargo_until passes.

---

## Route 8 — Search `/search` (FR-S-001)

### Desktop — success state

```
[HEADER]

+----------------------------------------------------------------+
| [_____________________________________________________] [×]   |
| ↑ search input, autofocus, debounced 300ms                     |
|                                                                 |
| Trending searches: zap-x · ethos · mr-linac · flash · cmv      |
+----------------------------------------------------------------+

+----------------------------------------------------------------+
| RESULTS — query "MR-Linac" (43 results)                        |
|                                                                 |
| Tabs: [Articles (38)]  [Audio episodes (5)]                   |
|                                                                 |
| → {article title} · {date} · {region pill} · {modality pill}  |
|   {one-line excerpt with query highlighted}                    |
|   [Read] · [Listen (if audio_status=published)]               |
| → ...                                                           |
|                                                                 |
| [Load more →]                                                   |
+----------------------------------------------------------------+

[FOOTER]
```

### Other states

- **Loading (query in flight)**: 5 result skeletons with shimmer (respects prefers-reduced-motion → static).
- **Empty (no results)**: "No articles match 'foobar'. Try /categories/vendor or browse /today." + link.
- **Error (pgvector index unhealthy)**: Banner "Search results limited while we tune the index. Falling back to text-only search." + FTS-only results.
- **Partial (audio tab failed but articles loaded)**: Audio tab shows "Audio results unavailable. [Retry]." Articles tab renders normally.

---

## Route 9 — Subscribe `/subscribe` (FR-014, FR-014A, FR-023)

### Desktop — success state

```
[HEADER]

+----------------------------------------------------------------+
| Subscribe to ROMAS Brief                                       |
| Daily clinical intelligence for radiation oncology — free.     |
+----------------------------------------------------------------+

+----------------------------------------------------------------+
| FORM                                                           |
|                                                                 |
| Email address *                                                 |
| [_____________________________________________________]       |
|                                                                 |
| Your role (optional)                                            |
| [Select ▼] (physician · physicist · dosimetrist · therapist ·  |
|             resident · industry/researcher · other)            |
|                                                                 |
| Region *                                                        |
| [Select ▼] (detected: Europe; change if incorrect)             |
|                                                                 |
| [Subscribe →]                                                   |
|                                                                 |
| By subscribing you agree to receive Mon-Fri emails. Unsubscribe |
| one click. We never share your email. Read privacy policy.     |
+----------------------------------------------------------------+

+----------------------------------------------------------------+
| Why subscribe (3 bullets)                                       |
| - Radiation oncology, decoded daily — top 5 items by 07:00 ET. |
| - Audio-first: 5–10 min episodes on your podcast app.           |
| - Primary source on every clinical claim. No padding.           |
+----------------------------------------------------------------+

[FOOTER]
```

### Other states

- **Loading (form submitting)**: Submit button disabled with spinner; "Subscribing…" label.
- **Empty / initial state**: Form prefilled with region from cf-ipcountry.
- **Error (Beehiiv API failure)**: Inline error above form "Subscribe service is taking longer than usual. Please retry in a moment." + retry button.
- **Partial / success state**: Form replaced with "Check your email. Confirm in 24 hours to start receiving issues." + link to /listen.

---

## Route 10 — About `/about`

### Desktop — success state

```
[HEADER]

+----------------------------------------------------------------+
| About ROMAS Brief                                              |
| Radiation oncology, decoded daily.                             |
+----------------------------------------------------------------+

+----------------------------------------------------------------+
| What we do                                                      |
| Built for radiation oncologists, physicists, dosimetrists,     |
| therapists, and oncology leaders. We turn the global signal    |
| in radiation oncology into 5 items you can act on before clinic.|
|                                                                 |
| ## How we work                                                  |
| - Daily Mon-Fri ingestion at 10:30 UTC from canonical sources. |
| - Six-axis scoring (Clinical · AI · Physics · Operational ·    |
|   Novelty · Confidence).                                        |
| - Every claim traces to a primary source URL.                  |
| - Audio brief generated per article; published only after      |
|   editorial QA passes (5-condition check).                     |
| - Three editions daily: APAC · EU · Americas.                  |
|                                                                 |
| ## Editorial standards                                          |
| - No primary source URL → no publish.                           |
| - Embargoed items never enter the queue.                       |
| - ROMAS Insight / ROMAS Take always labeled as interpretation. |
| - openFDA discoveries verified against the official FDA record.|
| - No audio without editorial QA pass.                          |
| - Source health surfaced — we don't silently drop sources.     |
|                                                                 |
| ## Sponsorship                                                  |
| Sponsor block only · 32px firewall from wordmark · No co-     |
| branded mastheads (Day 1 through Day 90). [See sponsor →]      |
|                                                                 |
| ## Privacy                                                      |
| Cookieless reader (Plausible analytics). Email-only at signup. |
| Right to erasure honored. EU DPA in place. No PHI ingest.      |
|                                                                 |
| ## Editor                                                       |
| — Kimal                                                         |
| president@aliennova.com                                         |
+----------------------------------------------------------------+

[FOOTER]
```

### Other states

- **Loading / Empty / Partial**: N/A — static content; renders or 500s. Error state = 500 page (sibling of 404).

---

## Route 11 — Sponsor `/sponsor`

### Desktop — success state

```
[HEADER]

+----------------------------------------------------------------+
| Sponsor ROMAS Brief                                            |
+----------------------------------------------------------------+

+----------------------------------------------------------------+
| FIREWALL DIAGRAM (illustration)                                |
|                                                                 |
|   ROMAS BR[•]EF       ← wordmark                              |
|                                                                 |
|   ↕ 32px minimum ↕    ← firewall                              |
|                                                                 |
|   [Sponsor block]     ← sponsor surface                       |
|                                                                 |
| "Sponsor block only · 32px firewall · No co-branded mastheads." |
+----------------------------------------------------------------+

+----------------------------------------------------------------+
| RATE CARD SNAPSHOT                                             |
| - Audio Brief sponsorship: per-episode pre-roll OR sponsor     |
|   block on article page. Rates available on request.           |
| - Daily Brief sponsorship: per-issue sponsor block in email +  |
|   web issue page.                                              |
| - ROMAS Read partner message: Friday issue dedicated partner   |
|   block (still 32px firewall, still labeled "Partner message  |
|   from X").                                                    |
| - Conference Brief sponsorship: per-conference dedicated       |
|   sponsor block on /conferences/{slug}.                        |
|                                                                 |
| What we DON'T offer (locked Day 1 — Day 90):                   |
| - Co-branded mastheads                                          |
| - Sponsor logo above the hero or in the masthead               |
| - "Together with X" labeling                                    |
| - Any chevron / cursor mark beyond the wordmark                |
+----------------------------------------------------------------+

+----------------------------------------------------------------+
| BOOKING FORM                                                   |
|                                                                 |
| Company *                                                       |
| [_____________________________________________________]        |
|                                                                 |
| Contact email *                                                 |
| [_____________________________________________________]        |
|                                                                 |
| Interested in                                                   |
| [Audio Brief sponsorship  ▼]                                   |
|                                                                 |
| Message                                                         |
| [_____________________________________________________]        |
| [_____________________________________________________]        |
|                                                                 |
| [Submit inquiry →]                                              |
+----------------------------------------------------------------+

[FOOTER]
```

### Other states

- **Loading (form submitting)**: Submit disabled with spinner.
- **Empty / initial**: Form blank with placeholder text.
- **Error (Resend transactional fails)**: "Submission delayed — please retry in a moment." + retry; form state preserved.
- **Partial / success**: Form replaced with "Thank you — we'll be in touch within 2 business days. — Kimal"

---

## Route 12 — Audio QA admin `/cms/audio-qa/{audio_job_id}` (CMS, behind auth — FR-009)

### Desktop — success state

```
[CMS HEADER — not the public reader header]
+----------------------------------------------------------------+
| ROMAS Brief CMS · Audio QA · Job #{audio_job_id}              |
+----------------------------------------------------------------+

+----------------------------------------------------------------+
| AUDIO PREVIEW (scrub-enabled, full quality)                    |
| [▶] {episode title} · 7:23 · [Open in new tab]                |
| [waveform with chapter markers]                                |
| [Transcript ↓ collapsible]                                     |
+----------------------------------------------------------------+

+----------------------------------------------------------------+
| 5-CONDITION CHECKLIST                                          |
|                                                                 |
| [×] clinical_claims_checked                                     |
|     Notes: All 4 inline claims verified against primary sources. |
|     [Edit]                                                       |
|                                                                 |
| [×] qa_reviewer = Kimal Honour Djam (you)                       |
|     [Reassign to ▼]                                              |
|                                                                 |
| [×] loudness_lufs = -16.2  (DB gate -18 to -14; target -17 to -15) ✓ |
|     true_peak_dbtp = -1.4  (max -1.0)  ✓                        |
|                                                                 |
| [×] transcript_url = present (Whisper large-v3)                 |
|     [View transcript]                                            |
|                                                                 |
| LEXICON VALIDATION                                              |
| - 0 unknown pronunciations                                       |
| - 0 ambiguous abbreviations                                      |
|                                                                 |
| 10-BEAT STRUCTURE                                                |
| 1. Opening headline ✓                                            |
| 2. Background context ✓                                          |
| 3. What happened ✓                                               |
| 4. Key details ✓                                                 |
| 5. Why it matters clinically ✓                                   |
| 6. Physics / dosimetry / workflow implications ✓                 |
| 7. AI / tech implications ✓                                      |
| 8. Limitations ✓                                                 |
| 9. ROMAS Take ✓                                                  |
| 10. Source attribution ✓                                         |
+----------------------------------------------------------------+

+----------------------------------------------------------------+
| ACTIONS                                                        |
| [Approve and publish]   [Skip with reason]   [Re-master]      |
+----------------------------------------------------------------+
```

### Other states

- **Loading**: Audio preview skeleton + checklist skeleton.
- **Empty (no job by that ID)**: 404 in CMS context — "Audio job not found".
- **Error (audio preview fails to load)**: "Audio preview unavailable. Check R2 archive bucket." + retry. Approve button disabled until preview loads.
- **Partial (one of 5 conditions fails)**: Approve button disabled with inline message naming the failure (e.g., "Loudness out of DB gate (-13.5 LUFS, gate [-18, -14] per ADR-0016). Re-master required."). Soft amber warning (Approve still enabled) when LUFS is inside the DB gate but outside the production target `[-17, -15]`.
- **Revoke flow (post-publish)**: Separate /cms/revoke/{article_id} route — modal confirms 60s SLA + public notice email + RSS update.

---

## Route 13 — 404 / 500 / Offline (errors)

### Desktop — 404 success state

```
[HEADER]

+----------------------------------------------------------------+
|                                                                 |
|              Issue not found.                                   |
|                                                                 |
|              The page you're looking for is gone, was never     |
|              there, or has been withdrawn.                      |
|                                                                 |
|              [Today's issue →]                                  |
|              [Search →]                                         |
|              [Listen index →]                                   |
|                                                                 |
+----------------------------------------------------------------+

[FOOTER]
```

### Other states

- **500 (server error)**: "Something on our end is broken. The page should be back soon — try again in a minute." + retry + status page link (if any).
- **410 Gone (revoked article)**: "This article was withdrawn on {date} because {reason}. We don't quietly delete corrections. [Today's issue →]" — distinct from 404; SEO noindex + 410 status code.
- **Offline (service worker fallback)**: "You're offline. The last issue you read is cached: [Continue reading →]" (if service worker enabled in M4+).
- **Loading**: N/A — 404/500 are terminal.

---

## Wireframe coverage check

| Route | Loading | Empty | Error | Success | Partial |
|---|---|---|---|---|---|
| 1 / Homepage | ✓ skeleton | ✓ holiday | ✓ edge timeout | ✓ ASCII | ✓ module miss |
| 2 / Issue page | ✓ skeleton | ✓ future date | ✓ 404 link | ✓ ASCII | ✓ audio pending |
| 3 / Article | ✓ skeleton | ✓ → 404 | ✓ audio 404 | ✓ ASCII | ✓ audio not published |
| 4 / Friday Read | ✓ skeleton | ✓ no Friday | ✓ rubric missing | ✓ ASCII | ✓ audio pending |
| 5 / Listen | ✓ skeletons | ✓ no episodes | ✓ tier card fail | ✓ ASCII | ✓ conference inactive |
| 6 / Tier page | ✓ skeleton | ✓ no episodes | ✓ R2 miss | ✓ ASCII | ✓ transcript pending |
| 7 / Conference | ✓ skeleton | ✓ no conf active | ✓ skill fail | ✓ ASCII | ✓ embargo pending |
| 8 / Search | ✓ skeleton | ✓ no results | ✓ pgvector | ✓ ASCII | ✓ audio tab fail |
| 9 / Subscribe | ✓ submitting | ✓ initial | ✓ Beehiiv fail | ✓ ASCII | ✓ confirmation |
| 10 / About | n/a | n/a | ✓ 500 | ✓ ASCII | n/a |
| 11 / Sponsor | ✓ submitting | ✓ initial | ✓ Resend fail | ✓ ASCII | ✓ confirmation |
| 12 / Audio QA admin | ✓ skeleton | ✓ no job | ✓ preview fail | ✓ ASCII | ✓ condition fail |
| 13 / 404 / 500 / 410 / offline | n/a | n/a | (this IS the error) | ✓ ASCII | n/a |

All 12 user-facing routes + 1 admin route document all 5 states.
