# Homepage Competitive Analysis & ROMAS Wire Redesign Proposal

**Author:** ROMAS Wire design intelligence pass
**Date:** 2026-05-28
**Reference comp:** [theimagingwire.com](https://theimagingwire.com/)
**Target surface:** [romasbrief.vercel.app](https://romasbrief.vercel.app/)
**Scope:** Describe → critique (3 experts) → consolidate → propose redesign
**Status:** Draft v1.0 — design-intelligence input for the reader-surface team
**Brand invariants honored:** CLAUDE.md §2 (positioning), §4 (Friday Read), §5 (audio), §7 (color tokens), §8 (editorial style)

---

## Part 1 — Description of the homepage at theimagingwire.com

The Imaging Wire is a long-running radiology newsletter (founded 2018) whose homepage functions less like a news site and more like an email-list landing page with a content river underneath. From top to bottom, here is what a visitor sees on 2026-05-28:

**The chrome.** A narrow horizontal header runs across the full width. On the left is the wordmark — a scanned JPG of the original 2018 logotype, slightly low-res by modern retina standards. On the right is an inline "Your work email" capture field with a single "Subscribe" button. Below the wordmark sits a five-item primary nav (Top Stories · Newsletters · Shows · Sponsor) plus social links. The signup field is repeated immediately, doubling the visual weight of the call-to-action before any content appears.

**The hero.** A single sentence in large serif type: *"Healthcare can be complicated. Your radiology news shouldn't be."* Sub-line: *"Join thousands of imaging leaders today."* A third inline email-capture form. There is no hero image, no statistic, no visual proof-point — only typographic claim plus three subscribe forms stacked in roughly 600 vertical pixels.

**The "Read the latest issue" rail.** A horizontal card features the most recent newsletter (Imaging Wire #803, May 21, 2026 — *AI for Chest X-Ray Varies, AI Risk Prediction, and Workplace Bullying*). A small phone-mockup `.webm` video plays on loop next to it. Click target: the issue's permalink.

**The "Top Stories" grid.** Four story cards, one row, each tagged with a category (Artificial Intelligence · MR Scanners · Longevity Imaging · Radiologists) and a date. Each card is roughly a third headline, a third one-sentence dek, a third bare metadata. No thumbnails on most cards.

**A 900×90 sponsor banner.** Merative / Merge Imaging Q1 banner ad. Static GIF. Sits flush across the river.

**The "More Stories" grid.** Three more cards in the same pattern as Top Stories. Then another 900×90 banner (DeepHealth). Then six more cards in a less-organized vertical run. Then a third banner (Bayer Radiology Solutions). Then ten additional cards in similar style, mixing AI, screening, radiologist workforce, conference recaps. The card density is high and the rhythm is monotonous — same tag chip + date + headline + dek, repeated ~20 times.

**A "See More Stories" link** to `/top-stories/`.

**Bottom-of-page conversion.** A second "Get every issue, delivered right to your inbox" capture, then a footer with the same nav repeated, two sister-publication links (Digital Health Wire, Cardiac Wire), four social icons, a copyright line, and a final repeated subscribe form with a phone mockup PNG.

**What's striking — and what's missing.**
- The page asks for an email **four times** before the fold ends and **six times** in total.
- There is **no audio surface** despite the brand owning a "Shows" nav item.
- There is **no scoring, ranking, or "why this matters"** layer — every story carries equal weight visually.
- There is **no personalization or role-based slicing** (radiologist vs. tech vs. administrator vs. industry).
- There is **no live signal** of editorial cadence (next-issue countdown, this-week's-issues-so-far, etc.).
- There is **no "decode" layer** — the brand's value claim ("shouldn't be complicated") isn't expressed in any structural feature of the page, only in copy.
- Sponsor banners use 2010s leaderboard ad-tech aesthetics that visually break the editorial flow.
- The wordmark is a JPG, not an SVG; favicon is a 270×270 PNG.

It is, in effect, a competent 2018-era newsletter site that has accumulated content without re-architecting the surface around what readers actually do on it.

---

## Part 2 — Three expert critiques

### Critique 1 — Sasha Mendel, Editorial & Brand Strategy

> *Brand strategist; ran editorial brand at Stat News and The Information; advises healthcare media properties.*

The first failure is that the homepage doesn't tell me what The Imaging Wire **uniquely** does. The tagline is a negative claim — *radiology news shouldn't be complicated* — which positions against an unnamed competitor instead of for a clear reader job. Compare this to *"Decoded daily"* (ROMAS Wire) or *"Smart Brevity"* (Axios): those are positive verbs that imply a method. The Imaging Wire's homepage promises only the absence of a problem.

The second failure is that the page treats every story as equal. A surgeon-general nomination, a pediatric MRI safety paper, a CMS reimbursement update, and a vendor's photon-counting clearance all get the same card, the same tag chip, the same dek. There is no editorial voice — no "the four things that actually moved the field this week" — even though that is precisely the work a good newsletter does in the inbox. The website undoes the curation the newsletter performs.

The third failure is the conversion architecture. Six email-capture forms tells me the publisher believes the homepage is a top-of-funnel landing page rather than a destination. That's a strategic bet that the website is worthless except as a subscribe gate, and it shows: there is no reason for a subscriber to return to the site rather than wait for the email. A real publisher would build a reason: a searchable archive surfaced editorially, a weekly "what we got wrong / what we're watching" thread, an audio library, a vendor-tracker page. None of these exist.

The fourth failure is identity drift. The footer reveals two sister publications (Digital Health Wire, Cardiac Wire) which appear to be the same template re-skinned. That tells a reader: this is a publishing system, not a publication. Brand-wise, that depletes equity.

**The single change with the most leverage:** replace the "More Stories" infinite river with an opinionated, editorially-stacked surface — *Top Move* (one big story with editorial commentary), *Receipts* (3–5 underreported items), *What's Next Week*, *Vendor Watch*. Same content, different scaffolding, completely different brand.

---

### Critique 2 — Dr. Linh Park, UX & Information Architecture

> *Senior UX research lead, former Vox Media & Bloomberg Beta; specialty publications IA.*

I want to put on my reader hat. I'm a radiologist who subscribes to four newsletters and visits maybe one of their websites per month. What is my job on this homepage? The IA gives me three plausible jobs and serves none of them well:

1. **"Catch up on what I missed."** The site offers a chronological river but no clear "where I left off" anchor. There is no `last-7-days` view, no "issues since Monday" tab, no read/unread state, no archive landing tuned for catch-up reading. The newsletter teaser at the top is great — but it points to *the latest* issue only, with no way to step backwards through prior issues without leaving home.

2. **"Find something specific."** There is no search affordance in the chrome. No tag landing pages visible from home (the category chips on cards link out, but there is no taxonomy index). Sister-pub link in the footer is the only horizontal navigation.

3. **"Skim and triage."** This is what most readers actually want. The cards offer date + tag + headline + dek with no scoring, no read-time estimate, no audio indicator, no "why-this-matters" tag. Twenty cards in a row with the same density is precisely the wrong format for triage — the eye loses anchor by card three.

Information density on the page is high but information **structure** is low. The MR Scanners card and the Radiologists card on row 1 belong to entirely different reader workflows (one is a workforce/people story, one is a clinical-physics story) yet sit side by side as if interchangeable.

There is also a **mobile assumption problem.** I tried this on a phone and the row-of-four cards becomes a long vertical scroll of identical-looking blocks. The 900×90 banner ads are clearly leaderboard-shaped, which means on mobile they either become awkwardly tall image blocks or are hidden — but the layout doesn't restructure around their absence.

Accessibility-wise, there are also red flags: card titles are not consistently heading elements; the email-capture inputs lack visible labels; the wordmark JPG has no contextual alt text; tag chips use only color, not iconography, to differentiate categories.

**The single change with the most leverage:** add a triage layer to every card — score, read-time, audio-available, primary-source flag. Even before any layout change, that single addition transforms the river from "stuff" to "ranked stuff," which is what the reader's job actually requires.

---

### Critique 3 — Yuki Tanaka, Visual & Product Design

> *Product designer; previously at Substack and The Browser Company; runs the design studio at a clinical-research nonprofit.*

This is a 2018 site that has been kept alive by content velocity, not by design investment. The visual evidence:

- The wordmark is a raster JPG, not a vector. At 1×, it's slightly fuzzy. On a retina display, it looks like a screenshot of a logo.
- Typography is single-weight serif throughout the editorial flow, with no scale, no display weight, no italics for inline emphasis. There's no visual rhythm — headlines and deks live in the same typographic territory.
- Color is essentially black-on-white with a single accent for tag chips. No semantic color (audio status, primary-source verified, embargoed, etc.). The brand has no chromatic identity.
- The sponsor banners (Merative, DeepHealth, Bayer) are 900×90 GIFs/JPGs in classic IAB leaderboard shape. They visually shout louder than the editorial content and create three "stop-the-eye" moments in the river. They also mark the site as an ad-supported property rather than a subscriber product.
- No motion design. The phone `.webm` in the latest-issue card is the only animated element and feels novelty-grade.
- No iconography system. Categories are chips with text only. Audio is invisible. Sources are invisible.
- The card hierarchy is uniform — same shadow (effectively none), same border, same padding, same spacing — which means the page has no visual entry point. Eyes don't know where to land.
- No light/dark mode handling.
- No grid system above the card level. Sections aren't titled, divided, or rhythmic; the page is essentially one long unstyled `<main>`.

The product layer is also thin. No saved-articles state. No "play queue" for audio. No share affordance on cards. No reading-progress indicator on issue pages. No personalization layer (industry vs. clinician). No archive index by category.

What this means in practice: a designer joining the team has nothing to inherit. There is no design system, no token layer, no component library to extend. Every improvement has to be built from scratch.

**The single change with the most leverage:** introduce a typographic scale (display / headline / body / caption) and a four-color semantic palette (editorial / primary-source / audio / sponsor) before touching layout. That alone makes the page legible as a designed thing rather than as a template fill.

---

## Part 3 — Consolidated upgraded concept

Three critiques converge on one diagnosis: **The Imaging Wire's homepage treats the website as a subscribe gate instead of an editorial product.** The fixes group cleanly into four pillars.

### Pillar A — Opinionated editorial scaffolding

Replace the undifferentiated card river with named, ranked sections:

1. **The Top Move** — one story, 60% of the above-fold width, with editorial commentary (*"why this matters"* or *"the take"*). The newsletter's own voice should appear here on the homepage.
2. **Receipts of the Day / Week** — 3–5 sharply-written items, each ≤ 240 chars of editor's take, ranked by importance not chronology.
3. **What's Next** — a forward-looking row: embargoes lifting, conferences ahead, regulatory deadlines, upcoming issues.
4. **Vendor Watch** — industry moves as a separate, clearly-labeled section so they don't visually compete with clinical evidence.
5. **Audio Today** — surface every audio tier on the homepage; do not bury under a "Shows" tab.

### Pillar B — Triage layer on every item

Every story card carries five micro-signals so the eye can rank without reading the dek:

- **Score** — a 0–100 composite signal score (visible badge)
- **Audio** — headphones icon if audio is published
- **Source verified** — checkmark if primary source URL is attached
- **Read time** — minutes (or "5 min audio")
- **Audience tag** — *Clinician / Physicist / Operator / Industry*

This converts the river into a triage matrix without changing the underlying content model.

### Pillar C — A real design system

- Wordmark as SVG with three lockups (full, compact, mark-only/favicon).
- Type scale: display (44 / 56 px), headline (28 / 32), subhead (18 / 22), body (15 / 24), caption (12 / 18). One serif for editorial display, one neutral sans for product UI.
- Color tokens that carry meaning:
  - `--editorial-ink` (body)
  - `--brand-primary` (wordmark, primary CTA)
  - `--audio-published` / `--audio-pending` / `--audio-skipped` (semantic)
  - `--source-verified` (primary-source confirmed)
  - `--sponsor-band` (clearly delineated from editorial)
- Iconography system — one set, semantic, used consistently for category, audio, source, audience.
- Light + dark mode from day one. No raster art in the chrome.
- Grid: 12-column desktop, 4-column mobile, with named layout regions so sections compose predictably.

### Pillar D — Reader product, not landing page

- Search in the chrome.
- "Catch up" view — last 7 days, with read/unread state for logged-in readers.
- Audio library as a first-class destination with a play queue.
- Saved-for-later state on every card.
- One subscribe form, end of homepage, not six.
- Sponsor surface visually quarantined from editorial — not interleaved as leaderboards.
- Issue archive accessible from home with a real index (by date, topic, audience).

The upgraded concept can be summarized in one sentence: **stop building a subscribe page; build the page a current subscriber returns to.** Every change above flows from that premise.

---

## Part 4 — Comprehensive design proposal for romasbrief.vercel.app

ROMAS Wire is **already structurally ahead** of The Imaging Wire — the current homepage has a Top Stories grid with signal scores, a Paper of the Day, Quick Hits, Audio Intelligence section, and audience routes (`/for/physicians`, `/for/physicists`, `/for/dosimetrists`). The current design has the *bones* of the upgraded concept above. What it lacks is hierarchy, visual rhythm, design-system maturity, and a few editorial features that would make it unambiguously the best in clinical-news design.

What follows is a comprehensive redesign proposal. It is anchored in CLAUDE.md invariants (positioning, four-tier audio, six rules, color tokens) and applies the consolidated lessons from Part 3.

### 4.1 — Information architecture (homepage)

The homepage is restructured into eight named regions, top to bottom. Each region has a clear editorial job and a stable schema.

| # | Region | Editorial job | Component shape |
|---|---|---|---|
| 1 | **Chrome** | Identify, navigate, search | Sticky 64px header: wordmark · Topics · Regions · Listen · Archive · Search · Subscribe |
| 2 | **Date strip** | Anchor the issue in time + edition | Edition badge (Americas/EU/APAC) · today's date · "Switch to [other] edition →" · issue # |
| 3 | **The Top Move** | One story, ROMAS Insight in voice | Full-bleed editorial card: headline · 2-line dek · ROMAS Insight line · primary source · audio badge · "Read brief →" |
| 4 | **Today's Three** | Three sharpest items below the move | Three medium cards in equal-height row: score, audio, source-verified, read-time, audience pill |
| 5 | **Quick Hits** | 5 signal-dense items for the triage reader | Numbered narrow rail (01–05): score · category · headline · date · audio icon |
| 6 | **Audio Today** | Surface all four tiers Day-1 audio | Tabbed: Audio Brief / Daily Brief / Podcast / Conference; current ep player + 3 upcoming |
| 7 | **By Audience** | Role-based slice | 5 tiles: Radiation Oncologists, Medical Physicists, Dosimetrists, Therapists, Residents — each shows top story for that role |
| 8 | **The Friday Read** | Editorial voice, Fridays only | Promoted band, only renders on Friday (or always shows "next Friday Read →") |
| 9 | **Vendor Watch + Regulatory Wire** | Industry moves and global regulators in a separate band | Two parallel columns; clearly labeled "Industry / Regulatory — interpretation, not endorsement" |
| 10 | **Catch Up** | Last 7 days for returning readers | Compact 7-day strip with one headline per day + issue link |
| 11 | **Subscribe / Conversion** | One CTA, end of page | Free-for-qualified-clinicians block · subscribe form · audio RSS links · GDPR + China posture note |
| 12 | **Footer** | Navigation + identity | Topics · Content types · Audiences · Regions · Audio RSS feeds · Legal · Editorial standards link |

This is **one less subscribe form than the current homepage and four fewer than The Imaging Wire's homepage** — the conversion gain comes from a single high-quality CTA at end of page, not from CTA repetition.

### 4.2 — The triage card (the most-used component)

Every story on the homepage uses one card schema. The card is responsive, composable, and carries the triage layer every reader needs.

```
┌──────────────────────────────────────────────────────────────┐
│  [CATEGORY PILL]  [S94]  [✦ RI]  [🎧]  [✓ Primary source]    │ ← micro-signals row
│                                                              │
│  Headline in display-medium, max 2 lines, max 90 chars.      │ ← headline (CLAUDE.md §8: ≤90)
│                                                              │
│  Two-line dek summarizing the finding or move. Plain prose.  │ ← dek
│  Direct, operational voice Mon–Thu.                          │
│                                                              │
│  ── ROMAS Insight (interpretation) ──                        │ ← optional, only on top items
│  One-line take, ≤240 chars, clearly labeled.                 │
│                                                              │
│  [Audience: Physicians] · 5 min read · 7 min audio · May 28  │ ← footer row
└──────────────────────────────────────────────────────────────┘
```

**Semantic colors** (per CLAUDE.md §7):
- Score badge: gradient from `--editorial-ink` (S60) to `--rb-audio-published` `#00B4C6` (S90+)
- Audio icon: `#00B4C6` if published, `#F59E0B` if pending, `#94A3B8` if skipped
- Source-verified checkmark: a new token `--rb-source-verified` (proposed: `#16A34A`)
- ✦ RI prefix only renders when ROMAS Insight is attached

**Accessibility:**
- Card root is a `<article>` with a headline `<h3>`.
- Tap target ≥ 44×44 (mobile).
- Score and category communicated through both icon and label (not color alone).
- Audio icon has visible-label tooltip "Audio available".

**Mobile collapse:**
- Micro-signals row wraps to two lines if needed; score and audio remain in row 1, source-verified and read-time move to row 2.
- The ROMAS Insight slot collapses below the dek in a tinted block.

### 4.3 — The chrome (sticky header)

The current header has good content but uneven hierarchy. Proposed structure:

```
┌─────────────────────────────────────────────────────────────────────┐
│  ROMAS Wire                Topics  Regions  Listen  Archive  [⌕]  │  ← row 1, 56px
│  Radiation oncology,                                      [Subscribe]│
│  decoded daily.                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  Americas Edition · Thursday, May 28, 2026 · Issue #34 · Switch EU →│  ← row 2, 32px
└─────────────────────────────────────────────────────────────────────┘
```

- The wordmark is the variant-c lockup (per CLAUDE.md §3 row 2): "ROMAS **BRIEF**" with a teal dot under the "i" that also serves as favicon.
- Tagline sits **below** the wordmark in small caps for desktop only; collapses on mobile.
- The "For Radiation Oncologists / Medical Physicists / Dosimetrists" audience tabs from the current site move into a separate **"By Audience"** homepage region (4.1 row 7), not into the chrome. The chrome stays single-row clean.
- Search becomes a real affordance (currently absent).
- One Subscribe button only — no inline email field in the chrome.

### 4.4 — Visual system

#### Typography

Two-family system, both available via `next/font`:

- **Editorial display:** *Source Serif Pro* (or *GT Sectra* if licensed) — used for headlines, the Top Move title, Friday Read masthead, ROMAS Insight quote treatment.
- **Product / UI / body:** *Inter* — used for nav, cards, badges, captions, dek, footer.

Scale (rem-based, 16px root):

| Token | Size / line-height | Use |
|---|---|---|
| `--type-display-xl` | 56 / 64 | Top Move headline (desktop) |
| `--type-display-lg` | 44 / 52 | Section "##" headers |
| `--type-display-md` | 32 / 40 | Standard card headline |
| `--type-display-sm` | 24 / 32 | Quick Hits headline, mobile Top Move |
| `--type-body-lg` | 18 / 28 | Dek, ROMAS Insight |
| `--type-body` | 15 / 24 | Body, footer |
| `--type-caption` | 13 / 18 | Date, byline, badge |
| `--type-micro` | 11 / 14 | Score, category pill |

#### Color tokens (extends CLAUDE.md §7)

Existing (locked):
```css
--rb-audio-published: #00B4C6;
--rb-audio-pending:   #F59E0B;
--rb-audio-skipped:   #94A3B8;
```

Proposed additions:
```css
/* brand */
--rb-ink:                #0B1220;   /* primary body */
--rb-ink-muted:          #475569;   /* secondary text */
--rb-paper:              #FFFFFF;   /* light bg */
--rb-paper-dim:          #F8FAFC;   /* card bg */
--rb-brand:              #0E7C8F;   /* wordmark + primary CTA — sister to audio-published */
--rb-brand-soft:         #E0F7FA;   /* tinted bands */

/* semantic editorial */
--rb-source-verified:    #16A34A;   /* primary-source check */
--rb-embargoed:          #B91C1C;   /* embargo-hold marker (internal CMS only) */
--rb-insight:            #7C3AED;   /* ✦ ROMAS Insight accent */
--rb-take:               #DB2777;   /* — ROMAS Take accent (Friday) */

/* sponsor band — quarantined */
--rb-sponsor-bg:         #F1F5F9;   /* sponsor band background — visually separate */
--rb-sponsor-ink:        #475569;   /* sponsor label text */

/* dark mode */
--rb-ink-dark:           #E2E8F0;
--rb-paper-dark:         #0F172A;
--rb-paper-dim-dark:     #1E293B;
```

Sponsor firewall (CLAUDE.md §3): the `--rb-sponsor-*` tokens force a different visual band than editorial content, and the 32px rule is encoded as a layout constraint, not a copy guideline.

#### Iconography

One set, semantic, consistent. Phosphor Icons (open license) or Lucide. Required slots:

| Slot | Icon | Meaning |
|---|---|---|
| `headphones` | 🎧 → Phosphor `Headphones` | Audio published |
| `headphones-half` | Phosphor `HeadphonesHalf` | Audio in review |
| `check-circle` | Phosphor `CheckCircle` | Primary source verified |
| `flask` | Phosphor `Flask` | Clinical trial |
| `government` | Phosphor `Bank` | Regulatory |
| `wrench` | Phosphor `Wrench` | Physics / dosimetry |
| `chart-line` | Phosphor `ChartLine` | Signal score |
| `users` | Phosphor `Users` | Audience tag |
| `sparkle` | Phosphor `Sparkle` | ✦ ROMAS Insight |
| `quotes` | Phosphor `Quotes` | ROMAS Take |

Emoji on the live site is **out** (CLAUDE.md §8). The current homepage uses 🇺🇸🇪🇺🇬🇧🌏 for region pills and 🤖⚕️⚛️🏛📋💰 for category pills — replace with the SVG icon set above. (Regional flags can stay as small bitmap SVGs since they're national identifiers, but verify with the brand owner.)

#### Motion

Minimal, purposeful:
- Cards: 120ms ease-out subtle elevation on hover (`box-shadow` token transition).
- Audio status: 800ms fade between pending → published states (on dashboard, not reader).
- Page transitions: instant (Next.js default), no fades.
- Reduced-motion: respect `prefers-reduced-motion` for all of the above.

### 4.5 — The Top Move (the page's editorial centerpiece)

This region replaces the current "Top Stories" cluster of six cards with one anchor story and three supporting cards. The single biggest opportunity to differentiate ROMAS Wire from The Imaging Wire's flat river is right here.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  TOP MOVE — May 28, 2026                                                     │
│                                                                              │
│  ┌─────────────────────────────────────────────┬───────────────────────────┐ │
│  │                                             │ Today's Three             │ │
│  │  S95  CLINICAL TRIAL  🎧  ✓ Source          │ ─────────────             │ │
│  │                                             │ [card 2 — Today's Three]  │ │
│  │  Phase III SABR-COMET-3 Trial: SBRT         │                           │ │
│  │  Improves Overall Survival in               │ [card 3 — Today's Three]  │ │
│  │  Oligometastatic Liver Disease              │                           │ │
│  │                                             │ [card 4 — Today's Three]  │ │
│  │  Median OS 41 mo vs 28 mo (HR 0.62, p<.001).│                           │ │
│  │                                             │                           │ │
│  │  ── ✦ ROMAS Insight ───────────────────     │                           │ │
│  │  Definitive Phase III evidence — practices  │                           │ │
│  │  should ensure dosimetric expertise for     │                           │ │
│  │  liver SBRT before adopting.                │                           │ │
│  │                                             │                           │ │
│  │  Audience: Physicians, Physicists           │                           │ │
│  │  10 min read · 10 min audio · NEJM ↗        │                           │ │
│  │                                             │                           │ │
│  │  [▶ Listen]   [Read brief →]                │                           │ │
│  └─────────────────────────────────────────────┴───────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

Key moves:
- The ROMAS Insight is **on the homepage**, not buried in the article body — this is the brand's editorial voice and should be the first thing a reader engages with.
- Primary-source link is a button (`NEJM ↗`), not a footnote.
- The inline `[▶ Listen]` plays in a persistent dock at the bottom of the viewport (see 4.6).
- The right column carries Today's Three so the eye doesn't leave the hero region to find the next stories.

### 4.6 — The audio surface (CLAUDE.md §5 implementation on the homepage)

CLAUDE.md §5 locks four audio tiers Day-1 plus Tier 5 at Day 60. The current homepage shows a single podcast block. The proposal:

**Audio Today section** — a tabbed component immediately after Quick Hits.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  AUDIO TODAY                                                                 │
│                                                                              │
│  [ Audio Brief ] [ Daily Brief ] [ Podcast ] [ Conference ] [ Video (D60) ] │
│  ───────────                                                                 │
│                                                                              │
│  ▶ FLASH Proton Therapy Achieves 40% Reduction in Normal-Tissue Toxicity     │
│     S94 · 7 min · ROMAS Wire voice — Audio Brief                            │
│     [——————————•—————————————————————]  2:34 / 7:12                          │
│                                                                              │
│  Up next on Audio Brief:                                                     │
│  · ASTRO Releases First Guideline on MR-Linac Adaptive RT (S91, 7 min)       │
│  · 15-Year Follow-Up Data Confirm Proton Superiority for Paediatric (S90)    │
│  · FDA Clears AI Auto-Contouring for Head and Neck OAR (S88)                 │
│                                                                              │
│  RSS: audio-brief.xml  ·  Apple Podcasts ↗  ·  Spotify ↗                     │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Persistent audio dock** — once a reader presses Play anywhere on the site, a 48px-tall dock pins to the bottom of the viewport with play/pause, scrubber, title, "minimize," and "queue." The dock survives navigation. This is the single most valuable product feature for the audio-first reader segment.

**Audio status indicator on every card** — three states, three colors (per CLAUDE.md §7):
- 🎧 teal (`--rb-audio-published`) — audio live
- 🎧 amber (`--rb-audio-pending`) — generated, in editorial QA
- 🎧 grey (`--rb-audio-skipped`) — skipped (rare; renders with tooltip explaining)

**No audio without QA** (CLAUDE.md §4 rule 6) — the publish state machine is reflected in the UI: a card never shows a play button until `audio_status: published`.

### 4.7 — Three-edition support (CLAUDE.md §3 row 8)

The current homepage already handles this gracefully (top strip: *Americas Edition · Thursday, May 28, 2026 · Switch to EU edition →*). Two improvements:

1. **Edition memory** — once a reader switches editions, persist via cookie/localStorage. Don't make them re-pick on every visit.
2. **Edition badges on stories** — when a Quick Hit or Top Move is region-specific, badge it (`US · CMS reimbursement`, `EU · MHRA guidance`). This solves a real reader-confusion problem on a multi-edition site.

### 4.8 — Sponsor surface (CLAUDE.md §3 row 3 — sponsor firewall)

CLAUDE.md kills co-branded mastheads at launch and requires 32px clearance from the wordmark. The Imaging Wire's 900×90 leaderboards interleaved into the river are exactly the failure mode to avoid.

Proposed treatment:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ───── Sponsored by [PARTNER] ─────                                          │
│                                                                              │
│  [Sponsor message in editorial voice, max 320 chars.                         │
│   "Partner message from [X]" only — no banner art on launch.                 │
│   Link out with `rel=sponsored noopener`.]                                   │
│                                                                              │
│  ────────────────────────────────────                                        │
└──────────────────────────────────────────────────────────────────────────────┘
```

- Sponsor bands live **only between regions**, never inside the Top Move or Today's Three.
- Sponsor band background uses `--rb-sponsor-bg` so the eye registers it as a visually distinct band.
- One sponsor slot per homepage at launch. Day 90 re-evaluation per CLAUDE.md.
- No image leaderboards. Text-and-link only at launch.

### 4.9 — Catch-up & archive (Linh Park's biggest critique)

Returning subscribers' #1 job is "what did I miss." Solve it explicitly.

**Homepage "Catch Up" strip** — a 7-day mini-archive at the bottom of the page:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  CATCH UP — Past 7 days                                          [Full archive →] │
│                                                                              │
│  Wed May 27  AI Auto-Contouring FDA Clearance · S88 🎧                       │
│  Tue May 26  ASTRO MR-Linac Guideline · S91 🎧                               │
│  Mon May 25  CMS Finalises 2026 SBRT Reimbursement · S82                     │
│  Fri May 22  THE ROMAS READ — Week in Receipts · S88 🎧                      │
│  Thu May 21  EUDAMED Mandatory Registration Begins · S79                     │
│  Wed May 20  MHRA SaMD Guidance · S77                                        │
│  Tue May 19  15-Yr Proton Follow-Up Paediatric · S90 🎧                      │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Archive landing (`/issues`)** — already implemented; improve with:
- Filter by category, audience, region, audio-only.
- "Issues since you last visited" anchor for logged-in subscribers.
- Mini-calendar view (year x weeks grid, fillable squares by issue intensity).

### 4.10 — The Friday Read promoted band (CLAUDE.md §4 rule 4)

Friday is the only day The ROMAS Read publishes. The homepage should show:
- **On Fridays:** the Friday Read replaces the Top Move band entirely, with a distinct visual treatment (display serif larger, `--rb-take` accent line, sub-rubric pill).
- **Mon–Thu:** a small "Next Friday Read — [sub-rubric] · countdown" tile in the right rail of the Top Move region.

```
─── THE ROMAS READ · FRIDAY, MAY 22 ──────────────────────────────────────────
WEEK IN RECEIPTS · the sub-rubric badge (rotating)

Week in Receipts — What the Evidence Settled and What It Opened

This week's ROMAS Read reviews the five most consequential findings…

— Kimal
[▶ Listen, 8 min]   [Read in full →]
──────────────────────────────────────────────────────────────────────────────
```

Sub-rubric rotation (CLAUDE.md §8): *The Week in Receipts · Five Things That Shifted · What I Got Wrong · Watch Next Week.*

### 4.11 — Subscriber count copy (CLAUDE.md §3 row 5)

The current homepage says "Join 4,200+ radiation oncology professionals." That violates the locked decision: subscriber count hidden until 2,500 — then visible. Reader, the count is over 2,500, so the copy is correct in principle, but with 4,200 you're below the 5,000 milestone. Recommended:

- Below 2,500 → qualitative copy ("Built for radiation oncologists, physicists, dosimetrists, therapists, and oncology leaders.")
- 2,500–4,999 → "Join 2,500+ professionals" or the actual rounded count (4,200+ is fine).
- ≥ 5,000 → "Join 5,000+…", and so on at 10k / 25k milestones.

The homepage copy is currently compliant; flag for review at each milestone.

### 4.12 — Mobile

Mobile-first redesign of the eight homepage regions:

| Desktop region | Mobile transformation |
|---|---|
| Chrome | Wordmark left, [⌕] [≡] right; nav goes into the sheet menu |
| Date strip | Single line, edition switcher becomes icon |
| Top Move | Stacked: signals row · headline · dek · ROMAS Insight · audience · actions |
| Today's Three | Vertical stack of three triage cards |
| Quick Hits | Numbered list, full width |
| Audio Today | Tabs scroll horizontally; player full-width |
| By Audience | 2×3 grid of audience tiles |
| Friday Read | Full-bleed band |
| Vendor Watch | Single column, "Industry" then "Regulatory" |
| Catch Up | Vertical 7-day list |
| Subscribe | Standard form, end of page |
| Footer | Accordion sections |

Persistent audio dock works on mobile too — 56px tall, swipe-up to reveal queue.

### 4.13 — Accessibility commitments

- Color contrast ≥ 4.5:1 for body, ≥ 3:1 for large text, in both light and dark mode.
- All micro-signals (score, audio, source-verified) carry both icon **and** text label (e.g., `S94` is "Signal score 94" to screen readers).
- All audio players use accessible controls (visible play/pause, scrubbing keyboard-reachable, transcript link).
- Focus rings visible everywhere; never `outline: none` without a replacement.
- Skip-to-content link in chrome.
- Card semantic structure: `<article>` with `<h3>` title.
- Full transcript available for every audio piece (CLAUDE.md §5; reuse the article body).

### 4.14 — Performance budget

For the homepage specifically:

- LCP ≤ 1.8s on 4G simulated, ≤ 1.2s on cable.
- CLS ≤ 0.05.
- INP ≤ 200ms.
- Total JS shipped to homepage ≤ 180KB gzip (Next.js + reader components).
- Hero font subsetted; only display-xl + body weights loaded above the fold.
- Audio player code-split — loaded only when a reader presses Play.
- No client-side fetch for the homepage; ISR with `revalidate: 60` against Supabase.

### 4.15 — What stays unchanged from the current vercel build

The current site has more right than wrong. Preserve:

- The category/audience/region taxonomy (already implemented).
- The signal score on cards (already present).
- The ROMAS Insight label discipline.
- Per-edition headers (Americas/EU/APAC).
- The three audio RSS feeds in the footer.
- "Free for qualified clinicians" framing.
- The audience routes (`/for/physicians`, etc.) — keep these as deep-link destinations even though the homepage stops using them as nav tabs.

The redesign is additive on the bones that exist, not a teardown.

### 4.16 — Phased delivery (4 sprints)

| Sprint | Scope | Deliverable |
|---|---|---|
| **S1 — Foundations** (1 wk) | Type scale, color tokens, icon set, wordmark SVG, dark mode | Design tokens published in `.claude/skills/design-tokens` |
| **S2 — Triage card** (1 wk) | New `<TriageCard>`, replaces all card uses on homepage and category pages | Component + Storybook + a11y tests |
| **S3 — Homepage regions** (2 wk) | Top Move, Today's Three, Quick Hits, Audio Today, By Audience, Friday Read, Catch Up | Live behind a feature flag |
| **S4 — Audio dock + polish** (1 wk) | Persistent audio dock, edition memory, sponsor band, performance pass | Ship to production |

Total: **5 calendar weeks** for a full redesign at one design + one engineer headcount.

### 4.17 — Success metrics (set baseline now, measure at week 6)

| Metric | Baseline source | Target at +6 weeks |
|---|---|---|
| Homepage → article CTR | Plausible | +25% relative |
| Audio engagement (plays per session) | Custom event | +40% relative |
| Catch-up usage (clicks into past 7 days) | Plausible | Establish baseline |
| Subscribe conversion | Beehiiv | Neutral or up (one CTA vs scattered) |
| Time on homepage | Plausible | +20% relative |
| Audio dock engagement | Custom event | ≥ 30% of audio listeners use the dock |
| LCP / CLS / INP | Vercel Speed Insights | Stay green on all three |

---

### 4.18 — Rotating components (hero banner, side flip, Quick Hits rotation)

**Why rotate.** A clinical-news homepage that shows the same five stories for 24 hours wastes the visit-2 reader's time. The Imaging Wire's "latest issue" rail is static; ROMAS Wire should make the homepage feel **live** without forcing a refresh. Three components rotate, each with a different motion and a different content pool.

#### 4.18.1 — Hero Carousel (horizontal rotation, ABOVE Top Stories)

A full-bleed banner sits **above** the Top Move region, modeled on The Imaging Wire's latest-issue rail but elevated to a real centerpiece. It rotates horizontally through a mixed content pool.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ◀                                                                        ▶ │
│                                                                              │
│     [ Slide 1 — Top Move story ]    [ Slide 2 — Friday Read promo ]          │
│     [ Slide 3 — Sponsor message ]   [ Slide 4 — Conference Brief promo ]     │
│     [ Slide 5 — Audio Today      ]                                           │
│                                                                              │
│                          ●  ○  ○  ○  ○                                       │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Slide pool composition** (drawn at page render, no two visits look the same):

| Slot | Slide type | How chosen | Cap |
|---|---|---|---|
| 1 | Top Move | Highest-scored story today | Always 1 |
| 2 | Friday Read | Latest Friday Read | 1 if exists in last 7 days |
| 3 | Audio Today | Newest podcast episode | 1 |
| 4 | Conference Brief | If a tracked conference is active (ASTRO, ESTRO, AAPM, JASTRO, RANZCR) | 0 or 1 |
| 5 | Sponsor / Partner message | Per CLAUDE.md §3 row 3 — text-only "Partner message from [X]", labeled `--rb-sponsor-bg` | Max 1 per page, never adjacent to Top Move slide |
| 6 | Editorial promo | "How ROMAS Wire works" / "About" / Methodology | 1, fallback |

Algorithm: deduplicate by `article_id`, shuffle within slot order, render 5 slides max.

**Motion spec.**
- Transition: horizontal slide, 600ms `cubic-bezier(0.4, 0, 0.2, 1)`.
- Auto-advance: every **7 seconds** (matches the average headline-scan time for medical content).
- Pause on hover, pause when reduced-motion preferred (then becomes a manual carousel only).
- Pause when the carousel scrolls out of viewport (IntersectionObserver).
- Pause when the tab is inactive (Page Visibility API).
- Pagination dots clickable. Left/right arrow controls on desktop; swipe on mobile.
- Resumes from where the user left off if they hover-paused.

**Accessibility.**
- `aria-roledescription="carousel"`, each slide `role="group"` with `aria-roledescription="slide"` and `aria-label="Slide N of 5"`.
- `aria-live="polite"` region announces slide changes, but only when auto-rotation is on AND reduced-motion is off (otherwise silent).
- Each slide is fully keyboard-navigable (Tab moves into the slide, focus pauses auto-rotation).
- Sponsor slide has `rel="sponsored"` on its link and a visible "Partner message from [X]" label per CLAUDE.md.

**Sponsor firewall in the carousel.** Sponsor slides never share a frame with editorial content within the same slide. Sponsor slides use `--rb-sponsor-bg` background so they are visually distinct mid-rotation. Maximum one sponsor slide per carousel cycle.

#### 4.18.2 — Side stack (vertical flip rotation)

To the right of the Top Move, the **Today's Three** column does not show three static cards. Instead it shows **three slots**, each of which independently flips (vertical 3D flip, 600ms) through a pool of stories on a 12-second cycle, staggered so the three slots never flip at the same instant.

```
┌──────────────────────────────────┐
│  Slot A  (flips every 12s)       │
│                                  │
│  S94 🎧  CLINICAL                │
│  FLASH Proton Therapy…           │
│  10 min read · NEJM ↗            │
└──────────────────────────────────┘
┌──────────────────────────────────┐
│  Slot B  (flips every 12s, +4s)  │
│                                  │
│  S91 🎧  GUIDELINES              │
│  ASTRO MR-Linac Guideline…       │
│  7 min audio · ASTRO ↗           │
└──────────────────────────────────┘
┌──────────────────────────────────┐
│  Slot C  (flips every 12s, +8s)  │
│                                  │
│  S88     AI                      │
│  FDA Clears AI Auto-Contouring…  │
│  5 min read · FDA 510(k) ↗       │
└──────────────────────────────────┘
```

**Pool composition** (the side stack content pool, sized 8–12 cards, refreshed nightly):

- Top 12 articles by composite signal score from the past 7 days.
- Excludes whatever is currently on the hero carousel.
- Excludes whatever is currently in Quick Hits (see 4.18.3).
- Categorized so the three slots maintain category diversity (e.g., one Clinical, one Regulatory, one AI at any given moment).

**Flip mechanics.**
- Each slot is a 3D card flipping on the X-axis (`transform: rotateX(180deg)`).
- Backface visibility hidden so only one side is ever shown.
- Pre-render the next card on the back face 100ms before flip starts.
- Pause on hover (the hovered slot freezes; the others continue).
- Reduced-motion: replace flip with a 200ms opacity cross-fade.

**State persistence.** Within a session, the side stack remembers which cards have been shown and avoids repeating until the pool is exhausted, then resets. (Stored in `sessionStorage` keyed by date so a returning-tomorrow reader sees a fresh pool.)

#### 4.18.3 — Quick Hits rotation (vertical rotating list)

The Quick Hits section is currently a static numbered list of 5. The proposal: keep the visible count at 5 but rotate through a pool of 12–20 items.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  QUICK HITS — Fast Intelligence                                              │
│  The five most signal-dense items being tracked right now.                   │
│                                                                              │
│  01  S88  PHYSICS    Health Canada Linac Collimator Alert      May 12  ▲   │
│  02  S84  CONFERENCE ESTRO 2026 Highlights                      May 15  🎧  │
│  03  S82  POLICY     CMS 2026 SBRT Reimbursement Finalised      May 25      │
│  04  S79  REGULATORY EUDAMED Mandatory Registration Begins      May 22      │
│  05  S77  REGULATORY MHRA SaMD Guidance for RT TPS              May 20      │
│                                                                              │
│  [auto-cycles every 8s, current item highlighted; pauses on hover]           │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Rotation pattern.** The visible list does **not** redraw all 5 rows at once. Instead, every 8 seconds the **top row exits up, the remaining four shift up by one, and a new row enters from below.** The 4 displayed rows from the previous cycle stay stable so the eye doesn't lose orientation.

```
   t=0s            t=8s            t=16s           t=24s
   01 A            01 B            01 C            01 D
   02 B            02 C            02 D            02 E
   03 C            03 D            03 E            03 F
   04 D            04 E            04 F            04 G
   05 E            05 F            05 G            05 H
   (cycle)         (A retired)     (B retired)     (C retired)
```

A `▲` indicator marks the row that's about to leave; a faint progress bar under the list shows time-to-next-rotation. Hover anywhere in the list pauses rotation; clicking anywhere on a row navigates to the article.

**Pool composition.**
- All current-cycle stories scoring ≥ S70 from the past 14 days.
- Excludes Top Move, Hero Carousel slides, and Side Stack pool.
- Re-ranked every 30 minutes on the server (Cloudflare Worker cron).
- Personalized by audience if the reader has selected one (`/for/physicians` etc.) — Quick Hits skews to that audience's tag.

**Reduced-motion.** Cross-fades the swap instead of vertical translate; rotation interval extends to 12s.

#### 4.18.4 — Cross-component rotation invariants

| Invariant | Why |
|---|---|
| The same `article_id` never appears in two rotating components simultaneously | Avoids the "I keep seeing the same story" feeling |
| The Top Move is the single source of truth — the day's highest-score story always shows there | The reader should never miss it in rotation |
| Sponsor content can appear in the Hero Carousel only (max 1 slide) | CLAUDE.md §3 row 3 firewall |
| All rotations pause when `prefers-reduced-motion: reduce` is set | Accessibility |
| All rotations pause when the page is not the active tab | Performance and battery |
| Carousel + side stack + Quick Hits run on independent timers (7s / 12s / 8s) | Avoids the homepage feeling like a slot machine all moving at once |
| State is kept in `sessionStorage` so a refresh doesn't restart the same five cards | Reader perception of liveness |
| All rotation pools refresh server-side every 30 minutes; CDN cache invalidated on new publish | Content stays current without hammering the client |

#### 4.18.5 — Implementation notes

- **Library.** Use [Embla Carousel](https://www.embla-carousel.com/) for the hero (small footprint, accessible, well-maintained) and **custom React** for the side stack (3D flip is a single CSS transform, no library needed) and Quick Hits (vertical translate is a simple Framer Motion `AnimatePresence` block).
- **Bundle impact.** Embla ≈ 6KB gzip; the rest is CSS + ~2KB JS. Total rotation infrastructure < 10KB.
- **Server.** The three pools come from a single `/api/homepage-pool` endpoint that returns `{ hero: [...], sideStack: [...], quickHits: [...], rotationToken: "..." }` cached for 30 minutes at the edge.
- **No layout shift.** All rotating components reserve fixed dimensions (CLS budget ≤ 0.05 across the homepage). Skeleton placeholders during initial paint.

### 4.19 — Microcopy & value-proposition refinements

Adopting the reader-feedback recommendations:

**Below the wordmark in the chrome (desktop only):**

> Radiation oncology, decoded daily.
> *Clinical intelligence from PubMed, arXiv, ClinicalTrials and FDA — curated, scored, and audio-ready.*

**Sub-explanation strip** (one-time dismissible, sits between chrome and date strip on first visit, persists for 7 days via cookie):

> ROMAS Wire gathers radiation-oncology evidence from primary sources, scores each item on a six-axis Signal scale, and publishes Mon–Fri with audio. Free for qualified clinicians. [How it works →]

**On the Subscribe CTA in the footer:**

> Subscribe free — takes 30 seconds
> *Daily brief Mon–Thu · The ROMAS Read every Friday · audio in your podcast app · no spam · GDPR-compliant · unsubscribe anytime.*

**"How it works" page** — new at `/about/how-it-works`, linked from chrome dropdown and from the sub-explanation strip. Sections:

1. **Where the signal comes from** — list source categories (Literature & Evidence, Regulatory multi-jurisdiction, Societies & Guidelines, Reimbursement & Policy, Vendors, Conferences & Embargoes).
2. **How we score** — six-axis explanation: Clinical, Physics, Novelty, Confidence, Operational, Regulatory.
3. **What ROMAS Insight is and is not** — interpretation, not endorsement; always labeled (CLAUDE.md §4 rule 3).
4. **The six inviolable rules** — published verbatim from CLAUDE.md §4.
5. **The audio process** — four tiers, the QA gate.
6. **Editorial standards** — primary-source-or-no-publish rule, embargo discipline.

**About the name (footer or About page only):**

> ROMAS = the ROMAS clinical-intelligence platform; *Brief* is the public media surface. ROMAS Wire sits under ROMAS Intelligence, whose core product is ROMAS COS — the AI-Native Clinical Operating System for Radiation Oncology.

(The acronym expansion the reader suggested — "Research, Oncology, Machine learning, Analysis & Safety" — is not currently a registered project meaning. Recommend confirming with Kimal before publishing any backronym. The safer copy is the parent-product framing above.)

### 4.20 — SEO, structured data, and performance

This section makes the reader-feedback SEO points concrete with implementations the engineering team can ship.

#### 4.20.1 — Structured data (JSON-LD)

Every article page emits both `NewsArticle` and (when audio exists) `PodcastEpisode` schemas. Homepage emits `WebSite` + `SearchAction`.

**Article-level `NewsArticle`:**

```jsonc
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "{article.title}",
  "datePublished": "{article.published_at}",
  "dateModified": "{article.updated_at}",
  "author": [{ "@type": "Person", "name": "Kimal Honour Djam", "url": "https://romasbrief.com/about" }],
  "publisher": {
    "@type": "Organization",
    "name": "ROMAS Wire",
    "logo": { "@type": "ImageObject", "url": "https://romasbrief.com/wordmark.svg" }
  },
  "image": ["{article.og_image_1x1}", "{article.og_image_4x3}", "{article.og_image_16x9}"],
  "articleSection": "{category}",
  "keywords": "{tags.join(', ')}",
  "isAccessibleForFree": true,
  "citation": [{ "@type": "CreativeWork", "url": "{article.primary_source_url}" }]
}
```

**Audio-bearing article also emits `PodcastEpisode`:**

```jsonc
{
  "@context": "https://schema.org",
  "@type": "PodcastEpisode",
  "url": "https://romasbrief.com/article/{slug}",
  "name": "{article.title}",
  "datePublished": "{audio_job.published_at}",
  "duration": "PT{audio_minutes}M",
  "associatedMedia": { "@type": "MediaObject", "contentUrl": "{audio_job.cdn_url}" },
  "partOfSeries": {
    "@type": "PodcastSeries",
    "name": "ROMAS Audio Brief",
    "webFeed": "https://romasbrief.com/feeds/audio-brief.xml"
  }
}
```

**Homepage `WebSite` + `SearchAction`:**

```jsonc
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "ROMAS Wire",
  "url": "https://romasbrief.com/",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://romasbrief.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

#### 4.20.2 — Metadata and OG

- Every page emits `<title>`, `<meta name="description">`, `<link rel="canonical">`, Open Graph (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:site_name`), and Twitter Card (`summary_large_image`).
- Per-content-type OG image template — generated server-side via @vercel/og from article fields. Templates per content type: news brief, paper critique, FDA brief, Friday Read.
- Per-region canonical handling: `/regions/{region}/...` URLs declare their canonical to themselves, and `<link rel="alternate" hreflang="en-US|en-GB|en-AU">` declares the cross-edition equivalents.

#### 4.20.3 — Sitemaps and feeds

- `/sitemap.xml` (index) with sub-sitemaps:
  - `/sitemap-articles.xml` (refreshed on publish)
  - `/sitemap-issues.xml`
  - `/sitemap-categories.xml`
  - `/sitemap-audio.xml`
- All four RSS feeds already specced (CLAUDE.md §5): `audio-brief.xml`, `daily-brief.xml`, `podcast.xml`, `conference-brief.xml`. Add `video-podcast.xml` placeholder per the Day-60 plan.
- `robots.txt` allows all reputable crawlers and references the sitemap index.

#### 4.20.4 — Performance budget (re-stated, tighter)

| Metric | Target | Notes |
|---|---|---|
| LCP | ≤ 1.8s 4G, ≤ 1.0s cable | Top Move headline is the LCP element; preload its font |
| CLS | ≤ 0.05 | All rotators have reserved dimensions |
| INP | ≤ 200ms | Audio dock and rotators must not block input |
| TBT | ≤ 200ms | Code-split the audio dock; defer carousel JS |
| Initial JS | ≤ 180KB gzip | Includes Next.js + reader components + Embla + Framer subset |
| Image budget | ≤ 200KB total above the fold | Hero slides use `next/image`, AVIF/WebP, fixed aspect ratios |
| Font budget | ≤ 80KB total | Subset Source Serif Pro (display weight only) and Inter (Latin) |

#### 4.20.5 — Internal linking and anchor text

Following the reader feedback: replace generic "Read more" with anchor text that repeats the headline.

- **Current:** `<a href="/article/...">Read brief →</a>` (low SEO value)
- **Proposed:** Keep the chevron CTA visually but make the **entire card a link with `aria-label` repeating the headline**. Add an invisible-to-sighted-users `<span class="sr-only">{headline}</span>` so screen readers and crawlers get the descriptive text. The visible "Read brief →" stays for sighted users.
- Body links use semantic anchor text ("the SABR-COMET-3 results" rather than "see here").

### 4.21 — Community, sharing, and engagement features

**Share affordances on every article card and detail page.**
- Web Share API on mobile (single button).
- Desktop fallback: copy-link, X/Twitter, LinkedIn, Bluesky, email.
- Each share URL carries a `?utm_source=share&utm_medium={channel}` so we can measure.

**Feedback (light-touch, no comments at launch).**
- A small "Was this useful? 👍/👎" foot of every brief, recorded as anonymous aggregate. (No emojis in editorial copy per CLAUDE.md §8, but these are interactive UI controls labeled "Useful" / "Not useful" — acceptable as long as no emoji appears in the brief itself.)
- "Suggest a correction" link in the footer of every brief, routes to a Resend transactional email to the editorial inbox.

**Comments — deferred.** A clinical-news brand has more downside than upside in launching with open comments. Recommend deferring until ≥ 10k subscribers, then evaluate a moderated thread on Friday Reads only.

**Trending and most-read.**
- The current `Most Read This Week` section stays.
- Add a "Trending in the last 60 minutes" mini-rail above Quick Hits during high-traffic windows (issue-publish + 2 hours, M–F 06:30–09:00 ET).
- Trending signal = unique sessions × time-on-page, decayed exponentially over 6 hours.

**Audio cross-platform.**
- Podcast subscribe block elevated to the Audio Today section header: RSS · Apple Podcasts · Spotify · Overcast · Pocket Casts · Castro.
- Each tier has its own listing across the platforms; CLAUDE.md §5 RSS files are the source of truth.

### 4.22 — Navigation refinements (sticky, contextual, with filters)

- **Sticky header** with section-aware highlighting: as the reader scrolls past each region (Top Move, Audio Today, Quick Hits, Catch Up), the nav highlights the corresponding label.
- **Topics dropdown** on hover/click — reveals the full category index with a one-line description per category and a "Browse all topics →" footer link.
- **Regions dropdown** — same pattern; surfaces Americas, EU, UK, APAC, LATAM, MENA-Africa, Global with their current locked weighting (CLAUDE.md §3 row 10).
- **For You dropdown** — surfaces audience routes (`/for/physicians`, `/for/physicists`, `/for/dosimetrists`, `/for/therapists`, `/for/residents`).
- **Search** — Cmd/Ctrl-K to open a search dialog (Postgres FTS + pgvector ranked). Recent searches saved locally.
- **Mobile** — the same dropdowns become a sheet menu with sections; the search affordance is a top-row icon, not buried.

### 4.23 — Persistent subscribe CTA (mobile only)

On mobile, a 48px-tall thin band pins to the bottom of the viewport once the reader has scrolled past the hero. Single CTA: "Subscribe free — daily brief in your inbox." Tappable area is the whole band. Dismissible (X) — dismissal persists for 7 days. **One** subscribe surface on mobile, plus the end-of-page block. Never six.

### 4.24 — Updated information architecture (with rotating components)

The eight-region layout from 4.1 is updated to ten regions to accommodate the rotating hero and the new community/trending features. Final ordering:

| # | Region | Rotation behavior |
|---|---|---|
| 1 | Chrome (sticky) | Static |
| 2 | Date strip | Static |
| 3 | **Hero Carousel** (NEW — above Top Stories) | Horizontal rotation, 7s |
| 4 | Top Move + Today's Three (side stack) | Top Move static · Side stack flips, 12s staggered |
| 5 | Quick Hits | Vertical rotation, 8s |
| 6 | Audio Today | Static (with cross-platform subscribe row) |
| 7 | By Audience | Static |
| 8 | Friday Read (Fri) / Next Friday Read (M–Th) | Static |
| 9 | Vendor Watch + Regulatory Wire | Static |
| 10 | Catch Up (last 7 days) | Static |
| 11 | Subscribe block | Static |
| 12 | Footer | Static |

The result: three independently-rotating bands (positions 3, 4-side, 5) within an otherwise stable page. The motion provides "liveness" without turning the homepage into a slot machine.

---

## Part 5 — One-page summary

**The Imaging Wire** treats its homepage as a subscribe gate: six email-capture forms, a flat undifferentiated card river, no triage layer, no audio surface, no design system.

**Three experts diagnose the same thing from three angles** — editorial scaffolding is missing (Mendel), reader-job IA is missing (Park), and there is no design system to build on (Tanaka).

**The upgrade pattern** is to convert the homepage from a landing page into a destination by adding (a) opinionated editorial sections, (b) a triage layer on every card, (c) a real design system, (d) reader-product features like search, catch-up, audio dock, and saved state.

**ROMAS Wire is already two pillars ahead** of The Imaging Wire — it has signal scores, audience routes, primary-source citations, an audio strategy, and edition switching. What it needs is (1) editorial hierarchy on the homepage (a Top Move, not a flat grid), (2) a hardened design system (tokens, type scale, icons, dark mode), (3) the persistent audio dock that makes audio first-class, (4) the catch-up surface that gives returning subscribers a reason to come back, and (5) three rotating bands — a horizontal Hero Carousel above Top Stories, a vertically flipping Side Stack of three slots beside the Top Move, and a vertically rotating Quick Hits — so the homepage feels live without forcing a refresh.

Built correctly, ROMAS Wire's homepage becomes what The Imaging Wire's never has been: a **place a working radiation oncologist returns to on Tuesday afternoon to triage their week** — not because the newsletter prompted them, but because the website is the better tool for the job.

---

*Prepared as design-intelligence input. Not a binding spec. Decisions land in `Docs/specs/adr/` per the project's normal change-control flow.*

— Kimal-aligned, ROMAS Wire design intelligence pass, 2026-05-28
