---
title: ROMAS Wire — Applied UX Principles
version: 1.0.0
date: 2026-05-15
authority: product-spec FR-001..FR-038 · Master-Strategy §3..§6 · CLAUDE.md §1..§4
---

# Applied UX Principles

> Norman / Nielsen at the abstract layer; this document applies them to **this specific product**: a daily clinical-intelligence brief for radiation oncology professionals, audio-first, primary-source-cited, sponsor-firewalled, three-edition globally distributed.

## 1. Primary tasks (ranked by frequency)

| # | Task | Success metric (KPI) | UI weight |
|---|---|---|---|
| 1 | **Pre-clinic catch-up** — open today's issue, read 5 items, listen on commute | Daily open rate 45% by Day 90 | Highest |
| 2 | **Audio commute** — subscribe to RSS, listen to 5–10 min episode without opening site | Audio play-through 55% Tier 1 | High |
| 3 | **Source-trace** — click primary source URL to verify claim | Outbound clicks to primary sources tracked | Medium |
| 4 | **Friday deep-read** — read the ROMAS Read with sub-rubric | Friday open uplift +15% vs daily | Medium |
| 5 | **Conference week** — daily Conference Brief during ASTRO/ESTRO/AAPM | +500 subscribers in conference week | Time-bound |
| 6 | **Journal club prep** (resident) — pull primary URLs + ROMAS Take | Outbound clicks per resident session | Long-tail |
| 7 | **Region toggle** — switch homepage to local-region edition | Region toggle usage telemetry | Long-tail |
| 8 | **Search** — find an article by drug / device / institution name | Search-result CTR | Long-tail |

## 2. Mental model

The reader's mental model is **"radiation oncology literature is dense, scattered, and time-poor to navigate"**. ROMAS Wire stands in for the 7-minute window a clinician has between arriving at the hospital and the first patient. Every interaction either:
- Saves them a search → primary source URL one click away.
- Saves them a translation → ROMAS Insight states the clinical implication in one labelled line.
- Saves them a queue → audio version playable from any RSS app, no site visit needed.

We do **not** fight this model. We do not pretend to replace primary literature; we route to it. We do not pretend to be exhaustive; we deliver top-5 and the source-health log for what we held back. Every page makes the source path obvious.

## 3. Applied principles

### Feedback

- Audio state is always visible (queued / generating / in_review / published / skipped / revoked) via `AudioStatusBadge` per design-tokens.md. Color is **paired with a label** — never color-only.
- Async ops (search, region switch, subscribe) show a loading state within 100ms.
- After publish: the issue page renders the new article within the cron's edition window (22:00 UTC APAC · 06:00 UTC EU · 11:00 UTC Americas). Cache headers respect edition boundaries.
- After revoke: CDN purge propagates within 60s; the article URL returns a `410 Gone` with a public-notice email sent via Resend (T-310A) within the same window.

### Affordances

- Primary action on every screen is **textual + interactive**: "Listen", "Read full article", "Subscribe to RSS". Never an icon-only button without a tooltip + aria-label.
- AudioPlayer Variant A is 80px, never collapsed: the play button is always visible (44×44 minimum touch target). Variant B (sticky banner) is 56px with a 44×44 play button.
- Article tags (modality, disease site, region) are pill-shaped + clickable + aria-label `Filter by {tag}` — they look interactive, they are interactive.
- Sponsor block is visually quiet (no shadow, no animation, `--rb-bg-elevated` background, hairline border) and does **not** look like primary content. Reader's attention path: masthead → issue lead → ROMAS Insight → primary source → audio → secondary articles. Sponsor sits **outside** that path.

### Constraints

- Embargoed items **cannot** be rendered to readers — schema-enforced (`articles_embargo_consistency` CHECK constraint) + reader query filters. The UI never has to handle "embargoed article rendered" because the database refuses to return one.
- Subscriber count under 2,500 is **hidden** — replaced with qualitative copy ("Built for radiation oncologists, physicists, dosimetrists, therapists, and oncology leaders.") via `SubscriberCount` component. Forces UI not to leak premature scale.
- Sponsor logo cannot render within 32px of the ROMAS Wire wordmark — `data-firewall="32"` attribute + layout test asserting DOM distance. Forces UI to maintain sponsor independence.
- Audio "Listen" CTA cannot appear when `audio_status != 'published'` — component double-checks even though schema CHECK enforces it.

### Mapping (structure mirrors task)

- Homepage = 8 modules in **task order**: Hero (today's lead) → Top Stories (the 5–6 you came for) → Industry moves → Paper of the Day → Quick Hits → Today's podcast → Trending → Top Papers This Week.
- Article page = **read order**: tags → headline → standfirst → AudioPlayer A inline (so listen-instead is a one-click decision) → body → ROMAS Insight → primary source attribution → related.
- Listen page = **format order**: 4 tier cards (Audio Brief · Daily Brief · Podcast · Conference Brief) each with their RSS + Apple + Spotify subscribe links. No autoplay anywhere.
- Issue archive = **time order**: chronological by issue date, with current week's issues prominent.

### Progressive disclosure

- **Surfaced upfront**: today's top 5, primary source URL, audio status, region toggle, subscribe.
- **One click behind**: full article body, full transcript, claim trace, source health, archive.
- **Two clicks behind**: per-author / per-modality / per-institution tag pages, search, about, sponsor program.
- **Editorial-only (CMS, behind auth)**: signal-score breakdown, claims table, audio QA gate, embargo holds, revoke kill switch.

### Recognition over recall

- Audio status surfaces as a labelled pill (recognition) rather than expecting readers to remember status conventions.
- Region toggle shows the **current** region (cf-ipcountry default), not a blank "select your region" dropdown.
- Past issues are date-anchored (e.g., `/issues/2026-07-08`) — readers recognize "yesterday's issue" by date, not by issue-number recall.
- Friday Read sub-rubric appears in the issue header (recognition: "this is The Week in Receipts week"), not behind a menu.

## 4. Anti-patterns we will NOT use

- ❌ Modal overlays for subscribe / paywall / cookie / consent on first paint. Inline subscribe block at the bottom of the homepage hero only.
- ❌ Infinite scroll on any reading surface. Pagination by issue date or category, with anchored URLs.
- ❌ Auto-playing audio anywhere. Ever. Even on the Listen page.
- ❌ Notification permission requests on first visit. Not at any time pre-launch — there is no notification feature shipping Day 1.
- ❌ "We use cookies" banners. Reader is **cookieless** (Plausible analytics). CMS auth uses essential cookies only and is behind auth, so no consent banner needed.
- ❌ Onboarding tours. The product is a daily issue; readers learn it in one minute on first visit.
- ❌ Personalization that requires login. Region toggle uses cf-ipcountry + URL parameter (no auth). Bookmarks are FR-C-001 (COULD, deferred).
- ❌ Skeleton-only loading states without a label. Skeletons that exceed 300ms include the text "Loading {what}…" via `role="status"` for screen-reader announcement.
- ❌ Empty states without a primary action. Every empty state names the next move ("No issues yet for this region — see the global edition" + link).
- ❌ Error states without the actual error or the actual fix. "Something went wrong" is banned.
- ❌ Drop shadows on everything. Cards use hairline borders (`--rb-rule`); shadow-1 reserved for elevation moments (modal, hover on interactive cards), shadow-3 modal-only.
- ❌ Gradient text. The brand voice is calm and authoritative, not Web3.
- ❌ Emoji as bullets, in headings, or as button labels. (Reflects CLAUDE.md §8 + design-system-keeper agent block rule.)
- ❌ "Delve" / "tapestry" / "stands as" / "intricate" / "seamless" / "delightful" / "elegant" anywhere in user-facing copy. (Reflects rule 10 anti-slop discipline.)

## 5. Tradeoffs we own

These are deliberate constraints the design accepts, documented so future drift doesn't re-litigate them:

- **No native mobile apps at launch.** Reader is a Next.js web app on Cloudflare Pages. Touch targets sized for mobile, but the platform is web-only until 10k subscribers (FR-W out-of-scope). Audio reaches mobile through native podcast apps via RSS.
- **No login at launch.** Reader is fully anonymous; subscribe = email-only via Beehiiv (FR-014). No user accounts. No bookmarks (FR-C-001 deferred). No comments. Auth surface exists only in CMS for editorial team.
- **No video at launch.** Tier 5 Video Podcast launches Day 60 (FR-022). Reader surface is text + audio until then.
- **No payment at launch.** Free tier; paid tier deferred to 10k subscribers per Master-Strategy.
- **English only at launch.** LATAM articles translated via DeepL Pro + Claude verification with mandatory footer (FR-038). No multi-language site shell.
- **Sponsor block sits outside the masthead and outside the article body.** This is a brand-line locked decision (Master-Strategy §3 ledger row 3). UI cannot put sponsors above the hero, in-line with article body, or within 32px of the wordmark.

## 6. Accessibility floor

WCAG 2.2 AA on every reader route (FR NFR-007). AAA target on long-form body text (article body, ROMAS Read). Verified per route in `a11y-audit.md`. Token-level contrast ratios documented in `design-tokens.md`:

- `--rb-ink` on `--rb-bg` = **16.5:1** (AAA)
- `--rb-ink-muted` on `--rb-bg` = **7.2:1** (AAA on normal text)
- `--rb-accent` on `--rb-bg` = **3.4:1** (AA Large only — icons ≥ 18px / non-text UI components, never body text)

Focus ring is mandatory on every interactive element per design-tokens v1.1 (2px solid `--rb-accent`, 3px offset, 4px radius).

## 7. Internationalization stance

- Layout tolerates +30% string length without breaking (German / Portuguese tend to be the worst-case for English-baseline UIs).
- No left-only or right-only iconography assumptions. The product ships English RTL-flip-tolerant CSS even though the launch is English-only; FR-W-001 says multi-language is out-of-scope, but the LATAM articles (FR-038) carry verbatim Portuguese / Spanish quotes in italic parens — the layout MUST tolerate mixed-script lines on every reader surface.
- Dates: `Intl.DateTimeFormat` per reader locale (FR-034). US "May 7, 2026" · EU "7 May 2026" · APAC "2026-05-07".
- Numbers: locale grouping separators via `Intl.NumberFormat`. Subscriber-count bands (2.5k+ / 5k+ / 10k+ / 25k+) localize the digit grouping; band thresholds are not localized.
- Currency in reimbursement articles: USD anchor with parallel local currency (FR-034) — GBP for NICE articles, EUR for EMA articles, JPY for PMDA, etc.

## 8. Done-criteria for design

A reader route is "done" when:
1. All 5 states render correctly (loading · empty · error · success · partial).
2. WCAG 2.2 AA passes (per `a11y-audit.md`).
3. Lighthouse a11y ≥ 95 (verified at W-6 prototype phase).
4. Web Vitals pass: LCP < 2.5s · INP < 200ms · CLS < 0.1 (NFR-001..NFR-003).
5. Keyboard nav reaches every interactive element; focus order is reading order.
6. No banned vocabulary in any rendered copy (design-system-keeper blocks).
7. Sponsor firewall verified (≥ 32px from wordmark; DOM test passes).
8. AudioStatusBadge shows the right state — never "Listen" when `audio_status != 'published'`.
