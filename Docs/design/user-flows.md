---
title: ROMAS Brief — User Flows
version: 1.0.0
date: 2026-05-15
authority: product-spec FR-001..FR-038 use cases · web-engineer.md surfaces
---

# User Flows

Each flow names the trigger, walks the happy path, then enumerates at least 2 edge paths and 1 error path. Flows trace to FR-NNN requirements they serve.

---

## UF-001 — Subscribe to ROMAS Brief (serves FR-014, FR-014A, FR-023, FR-027)

**Trigger**: Anonymous reader on `/` or `/about` or `/articles/{slug}` clicks "Subscribe" CTA in nav, footer, or inline block.

```
Anonymous reader on /
  → [click Subscribe (header or inline)]
  → /subscribe (region auto-detected via cf-ipcountry, prefilled)
  → Email form: email + (optional) audience-tag select + region (prefilled, editable)
  → [submit valid email]
    → Beehiiv API subscribe call (audience custom field + region custom field)
    → On success: Subscribe → confirmation screen ("Check your email. Confirm in 24h.")
      → Resend transactional confirmation email sent (T-310A)
      → User clicks link → Beehiiv confirms → webhook fires → workers/beehiiv-webhook updates Supabase subscribers.confirmed_at (T-310C)
      → Welcome screen on /subscribe/welcome?region=eu (next issue countdown + RSS feed links)
    → On Beehiiv API failure: Subscribe → error state "Subscribe service is taking longer than usual; please retry in a moment." + retry button
  → [submit invalid email]
    → Inline error under field: "Please enter a valid email address." Stay on /subscribe.
  → [user closes tab mid-flow]
    → No persistence; on return user must re-enter email.
  → [user already subscribed]
    → Beehiiv returns 409; flow shows "You're already on the list — thank you." with link to /listen
```

**Edge paths**:
- **Region differs from cf-ipcountry**: User on a VPN; region defaults from header but user can change before submit. Saved to localStorage `rb_region` and to Beehiiv subscriber custom field.
- **Audience tag empty**: Allowed. Subscriber receives all-audience issues. Optional field.
- **EU subscriber pre-Beehiiv-SCC**: If Beehiiv DPA + SCC not yet signed (Kimal-track R-L03 in LAUNCH_ARC_PLAN.md), EU subscriber form returns "EU subscriber acquisition will open shortly — we're finalizing your data-protection paperwork." with email-capture fallback to a Supabase `eu_waitlist` table.

**Error path**:
- Beehiiv API hard failure → log to Sentry → Supabase `eu_waitlist`/`subscribe_failures` fallback table → user shown polite error with retry.

---

## UF-002 — Read today's issue (serves FR-013, FR-028, FR-032, FR-033)

**Trigger**: Subscriber opens email (07:00 ET for Americas / 06:00 UTC for EU / 22:00 UTC prior-day for APAC) and taps "Read on web", OR direct visit to `/`.

```
Reader arrives at /
  → cf-ipcountry detected → region cookie set (US/EU/APAC/etc.)
  → Home renders 8 modules in region-specific order:
     1. Hero (today's lead article — region-filtered if applicable)
     2. Top Stories grid (6 cards; max 2/region per FR-032)
     3. Industry moves (3 cards)
     4. Paper of the Day
     5. Quick Hits (5 short items)
     6. Today's podcast (latest Audio Podcast episode + Audio Brief carousel)
     7. Trending now (live signal-scored top-10)
     8. Top Papers This Week (5)
  → [click any Top Story card]
     → /articles/{slug} loads with ArticleHeader + AudioPlayer Variant A + body
  → [scroll past hero on mobile]
     → AudioPlayer collapses to a 56px sticky banner (Variant B) showing today's lead audio
  → [click region toggle in nav]
     → Home re-renders with that region's filter applied (URL becomes /?region=eu)
     → localStorage rb_region updated
```

**Edge paths**:
- **First-visit subscriber on cold cache**: Edge cache miss; Cloudflare Worker SSRs home in <300ms. Skeleton shows 8 module placeholders for the first paint.
- **Reader switches region after reading 3 articles**: Region toggle changes home but does NOT affect already-open article tabs.
- **Reader visits on a holiday with no published issue (e.g., Christmas Day)**: Empty state on home — "No issue today — the last issue was Friday 2026-12-23. See the archive." + link to /issues/2026-12-23 + /listen.

**Error path**:
- Edge worker timeout (>5s) → fallback: serve the static "yesterday's issue" snapshot from R2; banner notes "You're seeing yesterday's issue while we restore today's edition."

---

## UF-003 — Listen to today's Audio Brief on mobile (serves FR-007, FR-011, FR-013)

**Trigger**: Subscriber on commute opens email on phone, taps "Listen" or visits `/listen/audio-brief`.

```
Reader on /listen/audio-brief
  → AudioPlayer Variant B (sticky banner) at top — shows latest Audio Brief episode (today's lead article)
  → Episode list below with per-episode AudioStatusBadge
  → [tap play on top banner]
     → Audio streams from R2 CDN via Range requests
     → Banner expands inline to show transcript link + chapter markers (where present)
  → [tap "Add to Apple Podcasts" link]
     → opens podcasts:// deep link with audio-brief.xml RSS feed URL
  → [reader continues listening; navigates to home]
     → Banner remains sticky across navigation (client-side audio state preserved)
  → [reader plays past 50% of episode]
     → Plausible analytics event: audio_complete_50 fired
```

**Edge paths**:
- **Audio in_review (not yet published)**: AudioStatusBadge shows "Audio in review" (pending tone, amber). Play button disabled. Aria-label: "Audio brief is in review; check back shortly."
- **Audio skipped for this article**: AudioStatusBadge shows "No audio for this brief" (skipped tone, slate). No play button rendered. User can still read article.
- **Reader on slow 3G**: Audio buffers; loading state shows "Buffering…" with progress %. No autoplay.
- **Reader has prefers-reduced-motion**: AudioPlayer waveform animation suppressed; static bar shown.

**Error path**:
- **Audio file 404 (R2 CDN miss)**: Player shows "Audio is temporarily unavailable. We've alerted the team. The transcript is available below." + transcript link rendered inline. Sentry alert fired.
- **Audio revoked mid-listen**: Player polls audio_status every 30s; on revoke, playback pauses + dialog: "This audio has been withdrawn. Read the article for the corrected information." + link.

---

## UF-004 — Trace a primary source (serves FR-004, FR-005, FR-017, Rule 1)

**Trigger**: Resident or attending wants to verify a claim before journal club.

```
Reader on /articles/{slug}
  → Reads body; encounters claim cited inline with footnote-style superscript ([1], [2], ...)
  → [click superscript] or [scroll to "Sources" section]
     → Sources section lists every primary source URL with source-type label (FDA 510(k) / EMA / Pubmed / etc.)
     → [click primary source URL]
        → opens in new tab (target="_blank", rel="noopener noreferrer")
        → Plausible event: outbound_primary_source_click (type, region, article slug)
  → [click "Claim trace" link]
     → opens /articles/{slug}/claims (or modal) with full claims-table rows: claim text + primary source URL + verifier (clinical-fact-checker | physics-reviewer | regulatory-analyst) + verification timestamp
```

**Edge paths**:
- **openFDA item with no official FDA record yet**: Article body notes "openFDA discovery; official FDA record pending" — the openFDA URL is shown but labeled "Discovery only (Rule 4: verify against official record)". The claim is held in `articles.status = 'on_hold'` and not visible to readers until official record exists.
- **EU regulatory item using fallback chain**: Source attribution shows EUDAMED-attempted → NB-OG fallback → MDCG PDF (whichever resolved). Each step is shown so reader can audit which fallback applied (per regulatory-analyst agent EU fallback chain section).
- **LATAM article (source_language != 'en')**: Source attribution shows original-language URL + label "Source in {Portuguese|Spanish}; verbatim quotes shown in italic parentheses inline." Footer attribution rule renders the non-removable line.

**Error path**:
- **Primary source URL 404 at click time** (source taken down): Outbound click counted; on user-visible side, target page is whatever the source returns. ROMAS Brief does NOT proxy or cache primary sources. Source-health log captures the 404 next ingestion run.

---

## UF-005 — Friday ROMAS Read (serves FR-015, FR-S-002)

**Trigger**: Subscriber receives Friday issue email; opens "The ROMAS Read".

```
Reader arrives at /articles/{friday-read-slug}
  → Issue header shows date + "The ROMAS Read — week of 2026-07-04"
  → Sub-rubric (Week in Receipts | Five Things That Shifted | What I Got Wrong | Watch Next Week) displayed in title position
  → ROMASRead component renders long-form serif layout, 66ch max-width
  → Sign-off: "— Kimal"
  → [scroll to end]
     → Inline subscribe block (if non-subscriber) OR "Forward to a colleague" CTA (if subscriber)
     → Related: previous 4 ROMAS Reads
  → [scroll past 80% of body]
     → Plausible event: friday_read_complete fired
```

**Edge paths**:
- **First-time visitor lands on Friday Read URL**: Top of page shows "Built for radiation oncologists, physicists, dosimetrists, therapists, and oncology leaders." (SubscriberCount qualitative copy < 2,500). Inline subscribe block placed below first 3 paragraphs (above-the-fold on desktop).
- **Reader uses prefers-reduced-motion**: No scroll-triggered animations on body. Quote callouts render statically (no fade-in).
- **Sub-rubric rotation broken** (`friday_read_history.json` missing): Default to "The ROMAS Read" with no sub-rubric. Editorial slack alert fired; design-system-keeper does not block (rotation tracker is editorial concern).

**Error path**:
- Article not found (slug typo) → /404 with "Issue not found — see this week's Friday Read at /listen/friday-read"

---

## UF-006 — Search for an article by drug or device name (serves FR-S-001)

**Trigger**: Reader searches "ZAP-X" or "Ethos" or "MR-Linac".

```
Reader on /
  → [click Search in nav]
  → /search (input focused, cursor in field)
  → Reader types "ZAP-X"
  → debounced query (300ms) → Postgres FTS + pgvector hybrid
  → Results render in 2 tabs: Articles (top relevance) · Audio Episodes (transcript match)
  → [click result]
     → /articles/{slug} or /listen/{tier}/{episode}
```

**Edge paths**:
- **Empty query**: Show recent searches (localStorage) + 5 trending queries (server-side ranked).
- **Query with no results**: Empty state "No articles match 'ZAP-X' yet. We watch the field — try /categories/vendor or browse Today." + link.
- **Query exact-matches a banned vocabulary term ('scrape')**: Show normal results; do NOT moralize. Editorial banned vocab only applies to authoring, not reader queries.

**Error path**:
- pgvector index unhealthy → fall back to FTS-only with a banner "Search results are limited while we tune the index. Falling back to text-only search."

---

## UF-007 — Conference Brief mode during ASTRO (serves FR-016)

**Trigger**: Conference-mode-operator activates ASTRO 2026 mode at conference start (Sun before ASTRO Sep 21).

```
Reader arrives at /conferences/astro-2026 during Sep 21–24
  → Conference landing banner: "ASTRO 2026 — Day {1|2|3|4}"
  → Today's Conference Brief at top (Variant B AudioPlayer banner if audio published)
  → Day-by-day list of Conference Briefs already shipped this week
  → Embargo notice: "Some plenary findings remain embargoed until {date}. Conference Brief covers only released content."
  → [click episode]
     → /articles/{slug} (Conference Brief article)
  → [conference ends]
     → Banner switches to "ASTRO 2026 has concluded. Recap in the Friday Read on {date}." + link
     → Conference Brief tier remains in /listen archive; new posts cease until next supported conference
```

**Edge paths**:
- **Conference embargo lift mid-day**: Conference Brief updates within next ingestion cycle (15min during active conference). Reader refresh shows new article appearing in day list.
- **Conference Brief skipped for a day** (no qualifying items): Day shows "No qualifying announcements today" + link to ASTRO official agenda.
- **Reader visits outside conference window**: `/conferences/astro-2026` shows the post-conference archive view; banner reads "ASTRO 2026 concluded {date}." Past Conference Briefs remain readable.

**Error path**:
- Conference activation skill failure → conference page returns 404 with "Conference coverage not yet active for {slug}." + /listen/conference-brief link to archive.

---

## UF-008 — Editor audio QA flip on /cms (CMS — internal — serves FR-009)

**Trigger**: Audio-producer flips an audio_jobs row to `in_review` after master + transcript. Notification sent to QA reviewer (Kimal at launch).

```
Kimal logs into /cms (Supabase auth)
  → /cms/audio-qa (queue of audio_status=in_review rows)
  → [select an audio job row]
  → /cms/audio-qa/{audio_job_id}
     → AudioPlayer (full-quality, scrub-enabled) at top
     → 5-condition QA checklist below:
        [ ] clinical_claims_checked (true | false toggle, with reviewer notes)
        [ ] qa_reviewer (auto-populated from session; manually settable if delegating)
        [ ] loudness_lufs (read-only, populated by ffmpeg ebur128 → must be in [-18, -14] per ADR-0016 DB gate; amber soft-warn if outside production target [-17, -15])
        [ ] true_peak_dbtp (read-only, must be ≤ -1)
        [ ] transcript_url (auto-populated from Whisper job; must be non-null)
     → Pronunciation issues list (from lexicon validation)
     → 10-beat structure validation (audio-producer reports per-beat detection)
     → [click "Approve"]
        → DB CHECK constraint validates all 5; on pass: audio_status flips to 'published'
        → CDN populates from R2; RSS feeds regenerate; reader UI now shows "Listen" CTA
     → [click "Skip" + reason]
        → audio_status flips to 'skipped'; reason recorded in audio_jobs.skip_reason; reader sees "No audio for this brief"
     → [click "Revoke"] (only after publish)
        → modal warns of 60s SLA + public notice; on confirm: audio_status flips to 'revoked'; cdn-purge-watchdog fires; public revoke email queued in Resend
```

**Edge paths**:
- **One condition fails** (e.g., loudness measured at -13.5 LUFS, outside the DB gate): "Approve" button is disabled with inline message "Loudness is out of DB gate (-13.5 LUFS, gate [-18, -14] per ADR-0016). Re-master required." Link to audio-producer re-master job. Soft amber warn (Approve still enabled) for LUFS in `[-18, -17] ∪ [-15, -14]` — inside DB gate but outside production target `[-17, -15]`.
- **Reviewer delegates to second reviewer (Day 30+)**: qa_reviewer field shows current session's user, with "Reassign to…" dropdown of other audio_qa role members.
- **Audio file fails to load in /cms preview**: Show "Audio file not accessible — check R2 archive. Audio QA cannot proceed until preview loads." with retry button.

**Error path**:
- **DB CHECK constraint refuses flip** (race condition): Show server error "Approval blocked: one of the 5 conditions changed. Refresh and re-check." Audit log captures the attempt.

---

## UF-009 — Sponsor inquiry (serves FR-019 + Master-Strategy §3 ledger row 3)

**Trigger**: Industry / vendor visits `/sponsor` to learn about sponsorship.

```
Visitor on /sponsor
  → Top of page: rate card snapshot + sponsor firewall diagram (32px illustrated)
  → Below: detailed terms (no co-branded mastheads · 32px firewall · "Sponsored by X" or "Partner message from X" labels only · no logo above hero)
  → Booking form at bottom: company + contact email + interest dropdown (Audio Brief sponsorship · Daily Brief sponsorship · ROMAS Read partner message · Conference Brief sponsorship) + message
  → [submit form]
     → Resend transactional email to brief@romasbrief.com + auto-reply to inquirer
     → Confirmation screen: "Thank you — we'll be in touch within 2 business days."
```

**Edge paths**:
- **Spam submission (no message or repeated submits)**: rate-limited by IP (3/min); CAPTCHA on 4th submit.
- **Sponsor inquires about co-branded masthead**: Form does not offer this option; FAQ entry explicitly says "Co-branded mastheads are not offered until Day 90+. Sponsorship is sponsor block only, with 32px firewall from the wordmark."

**Error path**:
- Resend transactional API fails → form preserves data in form state with "Submission delayed — please retry in a moment." + retry button. No data lost.

---

## UF-010 — Read revoked article (negative-path UX) (serves FR-012)

**Trigger**: Reader has a deep link to an article that was later revoked.

```
Reader hits /articles/{slug} where audio_status=revoked or article.status=revoked
  → Edge worker returns HTTP 410 Gone
  → Page renders revoke notice:
     "This article was withdrawn on {date} because {reason}."
     "We don't quietly delete corrections. The original content is no longer available."
     "Read the {corrected article link, if any} or browse {today's issue link}."
  → No body content rendered.
  → Audio (if was published) returns 410 from CDN; subscribed podcast apps see the episode disappear from the next feed refresh.
```

**Edge paths**:
- **Audio revoked but article body still valid**: Article renders normally with AudioStatusBadge showing "Audio withdrawn" + link to corrected audio if available.
- **Reader's RSS app still has cached audio**: Cannot prevent past download; RSS feed marks the episode as `<itunes:block>Yes</itunes:block>` going forward.

**Error path**:
- Edge worker fails to set 410 status → still serves the revoke notice page (200 OK) but with `<meta name="robots" content="noindex,nofollow">` to prevent search-engine re-indexing.

---

## Flow coverage check

| FR | Covered by |
|---|---|
| FR-001 ingestion | (backend, no user flow) |
| FR-002 scoring | (backend) |
| FR-003 top-5 | UF-002 |
| FR-004 primary URL | UF-004 |
| FR-005 claims | UF-004 |
| FR-006 embargo | (backend; embargo never enters reader UI) |
| FR-007 Audio Brief | UF-003 |
| FR-008 loudness | UF-008 |
| FR-009 QA gate | UF-008 |
| FR-010 transcript | UF-003, UF-004 |
| FR-011 RSS | UF-003 |
| FR-012 revoke | UF-010 |
| FR-013 reader site | UF-002 (all reader flows touch this) |
| FR-014 Beehiiv newsletter | UF-001 |
| FR-014A Resend transactional | UF-001 |
| FR-015 Friday Read | UF-005 |
| FR-016 Conference Brief | UF-007 |
| FR-017 openFDA verify | UF-004 |
| FR-018 ROMAS Insight labeled | UF-004 (visible in article body) |
| FR-019 sponsor firewall | UF-009 |
| FR-020 subscriber count hidden | UF-002 (homepage) + UF-005 (Friday Read footer) |
| FR-022 Video Podcast Day 60 | (not Day-1 flow; deferred) |
| FR-023 Beehiiv↔Supabase sync | UF-001 (webhook ack) |
| FR-024 500-article seed | (backend) |
| FR-025 region surfaces | UF-002 (region toggle) |
| FR-026 category surfaces | (browse path; same template as region) |
| FR-027 audience surfaces | UF-001 (audience tag at signup) |
| FR-028 8 homepage modules | UF-002 |
| FR-029 8 content-type filters | (filter chip on home + categories) |
| FR-030 Day-1 audio inventory | (editorial pre-launch; reader transparent) |
| FR-031 issue URLs | UF-002 (deep link) |
| FR-032 worldwide positioning | UF-002 (region toggle, max-2-per-region quota) |
| FR-033 three-edition publish | UF-002 (email arrives in local-morning window) |
| FR-034 locale formatting | UF-002 (date/currency rendered locale-aware) |
| FR-035 China posture | (no Chinese subscribe flow; UF-001 returns "not available in your region" for China-routed IPs) |
| FR-036 6 non-US regulatory | UF-004 (EU fallback shown in source attribution) |
| FR-037 lexicon | UF-008 (audio QA lexicon validation) |
| FR-038 LATAM LLM-translate | UF-004 (footer attribution rendered on translated articles) |
| FR-S-001 search | UF-006 |
