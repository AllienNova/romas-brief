---
title: ROMAS Wire — Brand Application
version: 1.0.0
date: 2026-05-15
authority: Master-Strategy v2.1 §1..§3 · CLAUDE.md §1..§2 · design-tokens.md v1.1
---

# Brand Application

> How ROMAS Wire's brand voice + visual identity translates to the reader surface, audio, and operational touchpoints.

## 1. Voice traits (applied)

| Trait | Applied means | Anti-pattern |
|---|---|---|
| **Calm** | Sentence length varies (15–25 words primary). Operative verbs early. Cited evidence as supporting clause. | Marketing energy. ALL CAPS. Exclamation points (forbidden in body copy). |
| **Expert** | Domain terms unwrapped (no "let me explain X" parentheticals). Quantitative claims carry units. Acronyms expand on first use per article (FDA · EMA · MR-Linac on first mention; reused freely thereafter). | Condescension. Pseudo-precision adjectives ("comprehensive", "thorough"). |
| **Never urgent** | Article fold-headlines describe what happened, not "BREAKING:" framing. Friday Read sub-rubric ("Week in Receipts" / "Five Things That Shifted") locks calm cadence. | Urgency-mongering. "Don't miss…" "Last chance…" never used. |
| **Sourced** | Every clinical claim has a primary source URL one click away. ROMAS Insight always labeled as interpretation. | Aggregator-style "as reported by X" where X is another newsletter. |
| **Operational** | Practice-delta articles tell the reader what changes in clinic. Quantify the operational implication ("Adds ~90s per fraction" not "Adds time"). | Abstract takeaways ("It's significant for the field"). |

## 2. Visual identity (per design-tokens.md v1.1)

### Wordmark (logo variant c, locked)

```
ROMAS BR[•]EF
```

- Family: Inter, weight 700, letter-spacing -0.02em.
- "ROMAS" + "BR" + "EF" in `--rb-ink`.
- "I" rendered with the dot replaced by a teal disk (`--rb-accent`, radius 50%).
- The teal disk doubles as favicon glyph (single SVG, scaled).
- Asset variants needed at D14a: full color · mono-ink · mono-white (dark backgrounds); square dot-only (favicon, social profile, app icon).

### Type pairing

- **Inter** (sans) — UI, headlines, nav, metadata. Weights 400, 500, 600, 700.
- **Source Serif Pro** (serif) — article body and standfirst (italic 400). Weights 400 + 600 + 400-italic.
- **JetBrains Mono** — data callouts only (e.g., dose constraints printed as monospace tables).

Rationale: sans for the workflow (fast scan); serif for the read (sustained attention). The pairing signals "operating in two registers" — operational + literary — which matches the dual product surface (daily brief + Friday Read).

### Color story

- **Off-white** (`--rb-bg = #FAFAF8`) — the page background. Not stark white; reduces eye strain on long reading sessions. Reads as "clinical paper" rather than "tech product".
- **Ink** (`--rb-ink = #0E1116`) — body text. Near-black, high contrast (16.5:1). Authoritative, not playful.
- **Teal** (`--rb-accent = #00B4C6`) — the single accent. Used for the wordmark dot, focus rings, interactive icons, AudioStatusBadge "published" tone. ROMAS is a clinical-grade product; teal codes as "clinical / medical / scientific" without leaning into "tech blue" or "pharma green".
- **Audio state palette** (amber pending · slate skipped · red revoked) — paired with text labels always. Color is never the sole signal.

Rejected color directions (documented so future drift doesn't re-litigate):
- Blue primary (too tech / too pharma) — rejected.
- Black-and-white only — rejected (audio status states need color differentiation).
- Multi-accent system — rejected (single accent enforces brand discipline + makes accent meaningful).
- Gradient anywhere — rejected (Web3-coded; contradicts calm voice).

### Iconography

- Lucide-react default set. Stroke width 2. No custom icons at v1.
- Color: `currentColor` (inherits from text token). No icon-only accent colors that violate the single-accent rule.

### Motion personality

- Gentle. 200ms default, 120ms fast, 320ms slow. `cubic-bezier(0.2, 0.6, 0.2, 1)` ease — slight overshoot suppressed.
- No bounce, no elastic, no spring. The brand voice is "expert" not "playful".
- Animation hierarchy: state changes (audio status flip) > content changes (region toggle) > decorative (hover). Decorative animation is the first to suppress under reduced-motion.

## 3. Tagline + positioning line (locked, per slot)

| Slot | String | Authority |
|---|---|---|
| Homepage primary tagline | "Radiation oncology, decoded daily." | Master-Strategy v2.1 §1 + SSOT §3 row 1 |
| About page subhead, footer tagline | "Radiation oncology, decoded daily." | (same) |
| Auxiliary copy (email signature, podcast intro, RSS channel `<itunes:summary>`) | "Clinical intelligence for modern radiation oncology." | Master-Strategy §1 secondary |
| Podcast post-roll close (Tier 3 only) | "Not headlines. Clinical intelligence." | Master-Strategy §1 positioning line |

design-system-keeper blocks if these strings appear outside their locked slots.

## 4. Audio brand application

- **Voice**: ROMAS Clinical Narrator — ElevenLabs primary (env: `ELEVENLABS_ROMAS_VOICE_ID`), PlayHT clone failover.
- **Pace**: 145–160 wpm. Matches calm voice; faster than NPR (130 wpm) but slower than tech podcasts (170+).
- **Loudness**: -16 LUFS / -1 dBTP (broadcast podcast standard).
- **Pre-roll** (Audio Brief): "From ROMAS Intelligence — clinical intelligence for modern radiation oncology."
- **Post-roll** (Podcast Tier 3 only): "Not headlines. Clinical intelligence."
- **10-beat structure** (Audio Brief, mandatory): per CLAUDE.md §5.

## 5. Editorial brand application

- Sign-off `— Kimal` (em-dash + first name only) on every issue email, Friday Read footer, sponsor inquiry response.
- ROMAS Insight callout: ≤ 240 chars, one labeled line per article, accent-soft background, italicized inside the callout.
- ROMAS Take callout: same constraints, Friday Read context only.
- Friday Read sub-rubrics rotate: Week in Receipts · Five Things That Shifted · What I Got Wrong · Watch Next Week. Rotation tracked in `friday_read_history.json`.

## 6. Sponsor brand application

- Sponsor block sits **outside** masthead and **outside** article body.
- Strict 32px firewall from the wordmark — enforced via `data-firewall="32"` attribute + layout test.
- Sponsor logo height capped at 32px (matches body font sizing).
- Label is "Sponsored by {X}." or "Partner message from {X}." (locked verbatim — design-system-keeper blocks "Together with X", "Brought to you by X", etc.).
- Sponsor block uses `--rb-bg-elevated` (slightly lifted from page bg) with hairline `--rb-rule` border. No shadow. No animation. Visually quiet.

## 7. Sponsor-firewall rationale (locked Day 1 → Day 90)

Co-branded mastheads are killed for the first 60–90 days. Rationale (Master-Strategy §3 ledger row 3):
- Masthead = brand authority. Co-branding dilutes it before authority is established.
- Sponsor independence is a trust signal in clinical-intelligence content.
- 32px firewall is the visual equivalent of "we'll take the money, but we won't let it touch the masthead".

Revisit at Day 90.

## 8. Anti-slop discipline (rule 10 propagation)

Banned in any user-facing copy:

- "delve", "tapestry", "stands as", "intricate", "interplay", "pivotal", "foster", "enduring"
- "underscore", "comprehensive", "thorough", "robust" (without quantification)
- "seamless", "delightful", "elegant", "intuitive" (empty-promise adjectives)
- "Studies show" / "research suggests" without inline citation
- Em-dashes outside academic contexts (≤ 1 per paragraph if used in Friday Read)
- "Oops!" / "Sorry, an error occurred" / "Something went wrong"
- Rule-of-three constructions when 2 or 4 items would do
- "It's not just X, it's Y" parallelisms
- Emojis. Anywhere.

design-system-keeper PR-blocks every violation. humanize skill runs at editorial draft time.

## 9. Brand applied to each surface (summary table)

| Surface | Voice | Visual key | Motion |
|---|---|---|---|
| Homepage | Direct, operational | Hero serif headline, sans nav | Gentle hover only |
| Article body | Calm, sourced | Source Serif Pro, 66ch, ROMAS Insight callout | None inside body |
| AudioPlayer | "Listen — ROMAS Audio Brief" | Off-white with hairline border, teal play button | 120ms hover scale 1.02 |
| Friday Read | Voice-of-authority | Serif 2,000–3,500 words, sign-off `— Kimal` | None |
| Listen page | Cataloging | 4 TierCards, 1 per tier, equal weight | Card hover lift |
| Email (Beehiiv) | Workflow-grade | Plain text-first; HTML mirrors web typography | None |
| Audio pre/post-roll | Authoritative narrator | (audio only) | 145–160 wpm pace |
| Sponsor block | Restrained | Bg-elevated, hairline border, 32px firewall | None |
| CMS | Functional | Same tokens, denser layout | Same motion budget |
| 404 / 410 / 500 | Direct, calm | Centered narrow text | None |
