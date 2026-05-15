---
title: ROMAS Brief — UX Copy Library
version: 1.0.0
date: 2026-05-15
authority: editorial-style-guide.md · CLAUDE.md §8 voice rules · banned vocabulary list · LATAM footer rule
voice: calm, expert, never urgent. Cite, never moralize. No empty-promise adjectives.
---

# UX Copy Library

> Every string that renders to a reader. Banned vocabulary (`scrape`, `revolutionary`, `groundbreaking`, `game-changer`, `delve`, `tapestry`, `seamless`, `delightful`, `elegant`, `Oops`, `Sorry`) is enforced by design-system-keeper PR-blocks; this file demonstrates the substitute phrasing.

## 1. Navigation

| Slot | Copy | Notes |
|---|---|---|
| Logo wordmark | `ROMAS BRIEF` (with teal dot under "i" per variant c) | Locked design-tokens.md |
| Nav: Today | "Today" | Goes to `/` |
| Nav: Listen | "Listen" | Goes to `/listen` |
| Nav: Read | "Read" | Opens dropdown / drawer |
| Nav: Search | "Search" | Goes to `/search` |
| Nav: Subscribe (primary CTA) | "Subscribe" | Inline expand on `/`, standalone `/subscribe` |
| Region selector (label) | "Region" | aria-label="Switch region" |
| Region option labels | "US · Europe · UK · APAC · Canada · LATAM · MENA-Africa · Global" | 8 options per FR-025 |
| Mobile menu trigger | "Menu" | aria-label="Open navigation"; no hamburger-only |
| Skip link | "Skip to main content" | First focusable on every route |

## 2. Footer

| Slot | Copy |
|---|---|
| Tagline | "Radiation oncology, decoded daily." |
| Listen links | "Listen · Audio Brief · Daily Brief · Podcast · Conference Brief" |
| Read links | "Subscribe · About · Sponsor program · RSS feeds · Friday Read · Archive" |
| Legal | "© 2026 ROMAS Intelligence · AlienNova · All rights reserved" |
| Policy links | "Privacy · Terms · Editorial policy" |
| Contact | "brief@romasbrief.com" |
| Sign-off | "— Kimal" |

## 3. Audio status labels (mirrors AudioStatusBadge component states)

| Status | Label | Tone token | aria-live announcement |
|---|---|---|---|
| `queued` | "Audio queued" | pending | "Audio brief is queued for production" |
| `generating` | "Audio generating" | pending | "Audio brief is generating" |
| `in_review` | "Audio in review" | pending | "Audio brief is in editorial review" |
| `published` | "Listen" | published | "Audio brief is ready to listen" |
| `skipped` | "No audio for this brief" | skipped | "No audio version is available for this brief" |
| `revoked` | "Audio withdrawn" | revoked | "Audio for this article has been withdrawn" |

Never display "Listen" when `audio_status != 'published'` — schema CHECK + component double-check.

## 4. Primary CTAs

| Action | Copy | Where |
|---|---|---|
| Subscribe (primary) | "Subscribe" | Nav, footer |
| Subscribe (inline submit) | "Subscribe →" | Inline form |
| Subscribe (submitting) | "Subscribing…" | Form state |
| Subscribe (success) | "Check your email to confirm. Confirmation is one click." | Form replacement |
| Listen (Audio Brief published) | "Listen" | AudioStatusBadge + play button |
| Read full article | "Read full article →" | Homepage hero, issue page lead |
| Continue reading | "Continue reading →" | Article body fold |
| Transcript | "Transcript →" | AudioPlayer Variant A + B |
| Open primary source | "Source →" | Inline citation; opens in new tab |
| Region toggle (current) | "Showing {Region} edition" | After region change, 2s inline notice |
| Load earlier | "Load earlier →" | Episode list, archive pagination |
| Submit inquiry | "Submit inquiry →" | Sponsor form |

## 5. Microcopy: tags, pills, labels

| Slot | Copy pattern |
|---|---|
| Region pill | "{Region}" e.g. "Europe", "APAC" — never country codes |
| Modality pill | "{Modality}" e.g. "Photon", "Proton", "MR-Linac", "FLASH" |
| Disease-site pill | "{Site}" e.g. "Prostate", "GBM", "Lung" |
| Content-type chip | "News brief" · "Paper critique" · "Practice delta" · "FDA brief" · "Reimbursement explainer" · "Vendor intel" · "Long take" · "Primer" |
| Reading time | "{N} min read" / "{N} min listen" |
| ROMAS Insight callout label | "— ROMAS Insight (interpretation)" |
| ROMAS Take callout label | "— ROMAS Take" |
| Friday Read header eyebrow | "The ROMAS Read — week of {date}" |
| Issue meta | "Issue #{N} · {weekday}, {long date} · {edition} edition" |
| Source attribution row | "{Source type} {identifier} · Decision date: {date} · Verified: {date}" |
| Sponsor block intro (sponsored_by) | "Sponsored by {Company}." |
| Sponsor block intro (partner_message) | "Partner message from {Company}." |
| Sponsor block CTA | "{label} →" (label defined per sponsor) |

## 6. Empty states

| Surface | Copy |
|---|---|
| Home (holiday — no issue today) | "No issue today. The last issue was {weekday}, {date}. See {previous-issue-link}." |
| Issue page (future date) | "Issue #{N} will publish on {date} at {edition time}. Subscribe to receive it." |
| Listen tier (no episodes yet) | "First episode drops on Day 1. Subscribe to the RSS feed." |
| Conference inactive | "ASTRO 2026 concluded {date}. Next conference: ESTRO 2026 ({date})." |
| Search (no results) | "No articles match '{query}' yet. We watch the field — try Categories or browse Today." |
| Archive / region (no articles yet) | "No articles tagged {region/category} yet. See the global edition." |

## 7. Loading states

| Surface | Copy |
|---|---|
| Homepage (long load) | "Loading today's issue…" (role="status") |
| Article (loading) | "Loading article…" |
| Audio (buffering) | "Buffering…" with progress % |
| Search (querying) | "Searching {query}…" |
| Form (submitting) | "{Action verb}ing…" e.g. "Subscribing…", "Submitting…" |

## 8. Success states

| Action | Copy |
|---|---|
| Subscribe submitted | "Check your email. Confirm in 24 hours to start receiving issues." |
| Email confirmed (welcome page) | "Welcome. Your next issue arrives {date} at {time} {edition}." |
| Sponsor inquiry submitted | "Thank you — we'll be in touch within 2 business days. — Kimal" |
| Audio QA approved (CMS) | "Approved. CDN propagating; expect Listen CTA live in under 60 seconds." |
| Audio revoke fired (CMS) | "Revoke fired. CDN purge in progress ({elapsed}s elapsed; target ≤ 60s)." |

## 9. Error states

| Cause | Copy | Recovery |
|---|---|---|
| Subscribe — invalid email | "Please enter a valid email address." | Inline under field |
| Subscribe — Beehiiv API down | "Subscribe service is taking longer than usual. Please retry in a moment." | Retry button |
| Subscribe — already subscribed | "You're already on the list — thank you." | Link to /listen |
| Subscribe — EU pre-SCC | "EU subscriber acquisition will open shortly — we're finalizing your data-protection paperwork." | EU waitlist capture |
| Form — server error | "Submission delayed — please retry in a moment." | Retry; form state preserved |
| Article 404 | "Issue not found. The page you're looking for is gone, was never there, or has been withdrawn." | Links to Today / Search / Listen |
| Article 410 (revoked) | "This article was withdrawn on {date} because {reason}. We don't quietly delete corrections." | Link to corrected article (if any) + Today |
| Audio file 404 | "Audio is temporarily unavailable. The transcript is available below." | Transcript link inline |
| Audio mid-listen revoke | "This audio has been withdrawn. Read the article for the corrected information." | Article link |
| Search — pgvector unhealthy | "Search results are limited while we tune the index. Falling back to text-only search." | Banner; results continue |
| Region toggle — China detected | "ROMAS Brief reader access from China is not guaranteed (Cloudflare GFW). Reader site may be unavailable; RSS feeds are accessible globally." | RSS link |
| Generic 500 | "Something on our end is broken. The page should be back soon — try again in a minute." | Retry + status page link |

**Banned in error states**: "Something went wrong", "Oops!", "Sorry, an error occurred", "Try again later" (without specifying), "Our team has been notified" (without naming the recourse), `delve`, `tapestry`, `seamless`, `elegant`.

## 10. Subscriber-count copy (FR-020)

| Active count | Copy |
|---|---|
| < 2,500 | "Built for radiation oncologists, physicists, dosimetrists, therapists, and oncology leaders." |
| ≥ 2,500, < 5,000 | "Joining **2.5k+** radiation oncology professionals." |
| ≥ 5,000, < 10,000 | "Joining **5k+** radiation oncology professionals." |
| ≥ 10,000, < 25,000 | "Joining **10k+** radiation oncology professionals." |
| ≥ 25,000 | "Joining **25k+** radiation oncology professionals." |

## 11. LATAM footer attribution (FR-038)

Mandatory line on every article where `source_language != 'en'`:

> "Source originally in {Portuguese|Spanish|{other}}; translated with editorial review."

Rendered by article template after byline / source-attribution block and before AudioPlayer. Non-removable. Provider name (`translation_provider`) NOT exposed to readers in v1; lives in `articles.translation_provider` for internal audit only.

Verbatim quote pattern (within article body):

> "The 30-day adverse event rate was 4.2%" *(Spanish: "La tasa de eventos adversos a 30 días fue del 4,2%")*

## 12. About page copy (Route 10 success state)

Locked content in `wireframes.md` Route 10. Key strings:

- Headline: "About ROMAS Brief"
- Subheadline: "Radiation oncology, decoded daily."
- "What we do" paragraph: "Built for radiation oncologists, physicists, dosimetrists, therapists, and oncology leaders. We turn the global signal in radiation oncology into 5 items you can act on before clinic."
- Editorial standards = six inviolable rules (verbatim from SSOT §2).
- Sponsorship paragraph: "Sponsor block only · 32px firewall from wordmark · No co-branded mastheads (Day 1 through Day 90)."
- Privacy paragraph: "Cookieless reader (Plausible analytics). Email-only at signup. Right to erasure honored. EU DPA in place. No PHI ingest."

## 13. Sponsor page copy (Route 11 success state)

Locked content in `wireframes.md` Route 11. Key strings:

- Headline: "Sponsor ROMAS Brief"
- Firewall diagram label: "Sponsor block only · 32px firewall · No co-branded mastheads."
- "What we DON'T offer" list: locked items from Master-Strategy §3 ledger row 3.

## 14. Per-tier subscribe copy (Listen page)

| Tier | Tagline |
|---|---|
| Audio Brief | "Per-article briefings, 5 to 10 minutes." |
| Daily Brief | "Daily roundup of the day's top 5, 10 to 15 minutes." |
| Podcast | "Weekly deep-dives, 30 to 60 minutes." |
| Conference Brief | "Live from ASTRO, ESTRO, AAPM, JASTRO, RANZCR." |
| Video Podcast (preview only — launches Day 60) | "With invited guests. Launches Day 60." |

## 15. Locale-aware formatting (FR-034)

- Dates rendered via `Intl.DateTimeFormat(locale, {dateStyle: 'medium'})`:
  - en-US: "May 7, 2026"
  - en-GB / en-EU: "7 May 2026"
  - ja-JP / ko-KR: "2026年5月7日" (when locale supported in future; Day-1 launch English-only)
  - APAC ISO fallback: "2026-05-07"
- Currency rendered via `Intl.NumberFormat(locale, {style: 'currency', currency: 'USD'})`:
  - Reimbursement articles: USD anchor + parallel local currency (GBP for NICE, EUR for EMA, JPY for PMDA, etc.).
- Numbers grouped via `Intl.NumberFormat` (en-US uses comma, EU uses period, APAC varies).
- Time durations: "{N} min" / "{N}:{SS}" mm:ss; no "{N} mins" or "{N}m".
