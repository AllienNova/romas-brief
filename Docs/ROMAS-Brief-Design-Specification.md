---
title: ROMAS Brief — Design Specification
version: 1.1.0
date: 2026-05-22
status: Canonical sibling to Master-Strategy v2.1 + Daily-Production-Runbook v1.1 + Launch-Plan v1.1 + Audio-Architecture v1.0
owner: Kimal Honour Djam (president@aliennova.com)
authority_chain: SSOT v1.2.0 §3 row 8 (sponsor firewall) + §10 (brand application) — verbatim. Detailed per-surface specs canonical in Docs/design/* and .claude/skills/{design-tokens, component-library}. On conflict with this doc, SSOT + the canonical skill files win; flag drift back into this file.
supersedes: implicit reference target in CLAUDE.md §6 + AGENT.md prior to this file existing (R-005 close)
sibling_docs: Docs/ROMAS-Brief-Master-Strategy.md, Docs/ROMAS-Brief-Daily-Production-Runbook.md, Docs/ROMAS-Brief-500-Article-Launch-Plan.md, Docs/ROMAS-Brief-Audio-Architecture.md
---

# ROMAS Brief — Design Specification v1.1

## 0. Purpose

This document is the canonical reference for **how ROMAS Brief looks, reads, and behaves on the reader surface and the internal CMS**. It synthesises the design decisions from `Docs/design/*` (12 wireframes + 8 components + tokens + a11y + brand + copy + interaction patterns + IA + UX principles + user flows + ui-spec) into a single sibling-doc to the Master-Strategy + Runbook + Launch-Plan + Audio-Architecture.

This file does NOT introduce new decisions. Every token, every spacing value, every typography choice is sourced from `.claude/skills/design-tokens.md` v1.2 (the executable design system), `Docs/design/tokens.json` (the JSON mirror for cross-platform consumption), or the per-component spec files. When this doc and a per-component file disagree, the per-component file wins (deeper specificity).

---

## 1. Brand identity

### 1.1 Wordmark + tagline (locked)

- **Primary tagline**: *Radiation oncology, decoded daily.* (SSOT §3 row 1)
- **Secondary tagline**: *Clinical intelligence for modern radiation oncology.*
- **Podcast pre-roll close ONLY**: *Not headlines. Clinical intelligence.* (NEVER used as homepage tagline)
- **Logo**: wordmark only at v1. Chevron-cursor mark deferred to a future cycle. Variant **c** (teal dot under the "i" in BRIEF — doubles as favicon) is the recommended treatment.
- **Sign-off**: `— Kimal` (em-dash + first name only) on every editorial piece.

### 1.2 Tone of voice

Editorial discipline lives in `.claude/skills/editorial-style-guide.md` (canonical). Summary:

- **Mon-Thu**: direct, operational. Inverted-pyramid editorial structure.
- **Friday**: voice-of-authority. ROMAS Read sub-rubric rotation (Week in Receipts / Five Things That Shifted / What I Got Wrong / Watch Next Week).
- **ROMAS Insight / ROMAS Take**: always labeled as interpretation. One line, ≤ 240 chars, prefixed `— ROMAS Insight (interpretation)` or `— ROMAS Take`.
- **Headlines**: ≤ 90 chars (schema-enforced via `articles.title` length CHECK).
- **Banned vocabulary**: "scrape" (use collect / extract / gather / fetch); "revolutionary" / "game-changer" / "groundbreaking" without primary-source backing.
- **No emojis** in published copy.

### 1.3 Sponsor firewall (inviolable)

**No sponsor logo within 32px of the ROMAS Brief wordmark.** (SSOT §3 row 8, locked 2026-05-14 by Kimal.) Enforced by `design-system-keeper` agent via an ESLint rule on the `<SponsorBlock>` component (R-303 / M3). The 32px clearance applies at the **smallest masthead instance** — verified at every breakpoint.

Co-branded mastheads are **killed for launch** (SSOT §3 row 3). For the first 60-90 days only "Sponsored by [X]" or "Partner message from [X]" copy patterns are permitted. Re-evaluate Day 90.

---

## 2. Visual design system

### 2.1 Token authority

The **executable design system** lives in `.claude/skills/design-tokens.md` v1.2 (CSS custom properties for runtime consumption). The cross-platform JSON mirror at `Docs/design/tokens.json` v1.2 exports the same values for Tailwind / iOS / Android consumption. Neither is re-litigated here.

**Critical update history**: v1.2 (2026-05-15, M0c2 design-QA cycle) closed 9 P0 WCAG 2.1 contrast failures (AudioStatusBadge + AudioPlayer play button + focus-ring + `--rb-ink-subtle`). Added `--rb-accent-strong` (#006B7A; AA Normal on bg at 5.91:1) and per-state `--rb-audio-{state}-text` variants. See `Docs/qa/design-review.md` for the audit trail.

### 2.2 Color palette (summary)

| Token | Value | Usage |
|---|---|---|
| `--rb-bg` | `#FAFAF8` | Page background (off-white) |
| `--rb-bg-elevated` | `#FFFFFF` | Card / surface background |
| `--rb-ink` | `#0E1116` | Primary text (18.10:1 contrast — AAA Normal) |
| `--rb-ink-muted` | `#4A5159` | Standfirst / metadata (7.69:1 — AAA Normal) |
| `--rb-ink-subtle` | `#6B7280` | Labels / subtle text (4.55:1 — AA Normal; v1.2 fix from #6E767E FAIL) |
| `--rb-rule` | `#E5E7EB` | Hairline borders |
| `--rb-accent` | `#00B4C6` | ROMAS teal — **FILLS ONLY** (logo dot, large UI surfaces). **BANNED as text or focus-ring** — `design-system-keeper` blocks at PR review. |
| `--rb-accent-deep` | `#0090A0` | Hover / large-fill (≥ 24px regular OR ≥ 18.66px bold) only |
| `--rb-accent-strong` | `#006B7A` | v1.2 NEW: text / focus-ring / non-text UI on bg (5.91:1 AA Normal) |
| `--rb-accent-soft` | `#D5F2F5` | Accent surface tint (ROMAS Insight callout background) |

### 2.3 Audio-state tokens

Per Audio Architecture v1.0 §4.2 state machine. v1.2 introduced separate decorative-fill vs label-text variants so badge text passes AA Normal contrast independent of the decorative dot:

| State | Decorative fill | Label text | Background context |
|---|---|---|---|
| `published` | `--rb-audio-published` `#00B4C6` | `--rb-audio-published-text` `#006B7A` | `--rb-accent-soft` (5.16:1 AA) |
| `pending` (queued/generating/in_review) | `--rb-audio-pending` `#F59E0B` | `--rb-audio-pending-text` `#B45309` | amber-50 (4.83:1 AA) |
| `skipped` | `--rb-audio-skipped` `#94A3B8` | `--rb-audio-skipped-text` `#475569` | slate-100 (5.85:1 AA) |
| `revoked` | `--rb-audio-revoked` `#DC2626` | `--rb-audio-revoked-text` `#B91C1C` | red-50 (5.83:1 AA) |

Every audio-state badge MUST carry a text label alongside the decorative dot (per `label-required: true` in tokens.json) — colour alone never communicates state (WCAG 1.4.1 Use of Color).

### 2.4 Typography

Canonical font-pair locked per ADR-0006 (typography) and `.claude/skills/design-tokens.md` v1.2:

- **Display + body**: Newsreader (variable, serif) — editorial gravitas.
- **UI + labels + metadata**: Inter (variable, sans) — calm operational chrome.

Type scale (per `tokens.json` v1.2 → `type` key): h1 / h2 / h3 / body / standfirst / caption / metadata. Line-height: 1.45 body, 1.2 display. Letter-spacing: −0.01em on display, 0 on body, +0.04em on small-caps metadata.

### 2.5 Spacing + radius + shadow

8-pt rhythm: 4, 8, 12, 16, 24, 32, 48, 64 px. Card radius: 8px standard, 16px hero. Shadow: subtle 0 1px 2px rgba(0,0,0,0.05) on cards; never on text.

### 2.6 Motion

`prefers-reduced-motion` is honoured globally — non-essential animation suppressed via CSS media query. Permitted motion budget on hover: 150ms transform/opacity, 200ms color. Page transitions: no Next.js-managed page transitions in M1; M3 may add a single fade if measured against CLS budget (NFR-003).

---

## 3. Component library

8 components canonical at `Docs/design/components/`. Each file contains: props · states · variants · keyboard interaction · a11y notes · token usage map. The skill at `.claude/skills/component-library.md` carries the TSX implementation.

| Component | Spec file | Used on |
|---|---|---|
| **ArticleHeader** | `Docs/design/components/ArticleHeader.md` | Article route, Friday Read route |
| **AudioPlayer** (Variant A inline + Variant B sticky banner) | `Docs/design/components/AudioPlayer.md` | Article + Friday Read + Listen pages |
| **AudioStatusBadge** | `Docs/design/components/AudioStatusBadge.md` | Every article surface that displays an audio state |
| **IssueHeader** | `Docs/design/components/IssueHeader.md` | Homepage, Issue route, Archive |
| **ListenPage** | `Docs/design/components/ListenPage.md` | `/listen` and per-tier listening surfaces |
| **ROMASRead** | `Docs/design/components/ROMASRead.md` | Friday Read route specifically (taller leading, sub-rubric chrome) |
| **SponsorBlock** | `Docs/design/components/SponsorBlock.md` | Above-the-fold + post-article slots — enforces 32px firewall via build-time lint |
| **SubscriberCount** | `Docs/design/components/SubscriberCount.md` | Footer (qualitative under 2,500 subscribers per R-015 / SSOT §3 row 5) |

Component changes go through `design-system-keeper` review (PR block on token drift, hardcoded colours, missing states, a11y regressions).

---

## 4. Wireframes — 12 routes

Detailed in `Docs/design/wireframes.md` (785 lines, every route × 5 states). Route inventory:

| # | Route | Purpose |
|---|---|---|
| 1 | `/` Homepage | 8 modules per Launch Plan §4 + SSOT §12.3 (Hero · Top Stories grid 6 · Industry moves 3 · Paper of the Day · Quick Hits 5 · Today's podcast · Trending now · Top Papers This Week 5) |
| 2 | `/issue/{date}` | Daily issue archive view; 4 sections in inverted pyramid |
| 3 | `/article/{slug}` | Article reader; AudioPlayer Variant A inline; SponsorBlock post-fold; ROMAS Insight callout |
| 4 | `/friday-read/{slug}` | Friday ROMAS Read; ROMASRead component; sub-rubric chrome |
| 5 | `/listen` | Listen page; per-tier sections; AudioStatusBadge per row |
| 6 | `/regions/{slug}` (8 regions) | Per-region article lists (us / europe / uk / apac / canada / latam / mena-africa / global) |
| 7 | `/categories/{slug}` (11 categories) | Per-category article lists with sub-category nav |
| 8 | `/for/{audience}` (5+ surfaces) | Audience filters (physicians / physicists / dosimetrists / therapists / residents) |
| 9 | `/sponsor` | Sponsorship inquiry surface |
| 10 | `/about` | Editorial team + methodology + corrections policy |
| 11 | `/subscribe` | Beehiiv signup form + transactional follow-up via Resend |
| 12 | `/cms/audio-qa/{audio_job_id}` | Internal Audio QA UI (Cloudflare Access-gated); 5-condition QA checklist |

Five states per route (loading / empty / error / success / partial) are spec'd individually in `wireframes.md`. The Audio QA route's 5 states are also spec'd in `user-flows.md` §"Audio QA flow."

---

## 5. Information architecture

Detailed in `Docs/design/information-architecture.md`. Nav structure:

- **Primary nav**: Home · Listen · Friday Read · Regions ▾ · Categories ▾ · For ▾ · Subscribe
- **Footer nav**: About · Sponsor · Disclosures · Privacy · Terms · Editorial corrections
- **Region nav** (under Regions ▾): 8 regions per SSOT §3 row 15
- **Category nav** (under Categories ▾): 11 categories with sub-splits per Launch Plan §2.1
- **Audience nav** (under For ▾): 5+ audience filters

Per-edition homepage re-rank: APAC 22:00 UTC, EU 06:00 UTC, Americas 11:00 UTC (SSOT §3 row 16). Each edition serves the same canonical article inventory but re-ranks by region tag. Beehiiv subscriber `region` custom field drives delivery time.

---

## 6. Interaction patterns

Detailed in `Docs/design/interaction-patterns.md`. Key patterns:

- **Keyboard nav**: Tab order matches reading order. Esc closes overlays. Enter activates primary action. Space toggles audio play/pause on AudioPlayer.
- **Focus visible**: 2px solid `--rb-accent-strong` outline at 4.55:1 minimum contrast against any background it appears over.
- **Form errors**: inline beneath the field, associated via `aria-describedby`. Error icon decorative (`aria-hidden`); error text carries the meaning.
- **Loading states**: skeleton placeholders for content, never spinners (cognitive load + clinical-tone mismatch).
- **Empty states**: pair an illustration with a concrete CTA. Never "No results" alone.
- **Audio interactions**: per AudioPlayer.md — keyboard-controllable transport (Space/←/→/M); transcript toggle (T); scrub bar with focusable handle.

---

## 7. UX copy

Canonical at `Docs/design/copy.md` (199 lines). Covers:

- **Nav labels** (primary + footer)
- **CTAs**: Listen, Subscribe, Read, Share, Read transcript, Re-master required, Revoke
- **Audio status copy**: per state (matches AudioStatusBadge labels)
- **Errors**: 404 / 500 / offline / loudness out of range / transcript missing / audio file inaccessible
- **Empty**: no audio for this brief / no articles in this region yet / search returned nothing
- **Success**: subscribed (confirmation; Beehiiv) / unsubscribed / revoked (public notice)
- **Footer + legal** copy
- **Locale-aware date formatting** (per `Intl.DateTimeFormat`, edition-driven)

No invented copy in implementation. Strings come from this manifest; UX writes against it.

---

## 8. Accessibility — WCAG 2.2 AA

Canonical at `Docs/design/a11y-audit.md` (261 lines; per-route audit + measured contrast ratios). NFR-007 target: WCAG 2.2 AA on every reader route, axe-core blocking on `serious` + `critical` severity (cycle-1 F-P2-06 close).

| Requirement | How met |
|---|---|
| 1.4.3 Contrast (Minimum) | All text + non-text UI tokens measured AA at v1.2; see tokens.json `contrast-on-bg` annotations |
| 1.4.11 Non-text Contrast | Audio-state dots paired with text labels — colour alone never communicates state |
| 2.1.1 Keyboard | Every interactive element reachable via Tab; documented in interaction-patterns.md |
| 2.4.7 Focus Visible | 2px `--rb-accent-strong` outline; 4.55:1 against any background |
| 2.5.5 Target Size (Enhanced) | 44×44 minimum on touch targets (cycle-1 M0c2 condition); verified per component in a11y-audit.md |
| 3.3.1 Error Identification | Inline beneath field + `aria-describedby` association |
| 3.3.2 Labels or Instructions | Every input carries a visible label; placeholder is never the label |
| 4.1.2 Name, Role, Value | Native `<button>` / `<a>` / `<label>` preferred; ARIA only when there's no native equivalent |

Run-time gates:
- **axe-core** via Playwright on every PR; block on `serious` + `critical`. `moderate` = advisory.
- **Lighthouse a11y** ≥ 95 per key route (Homepage, Article, Listen, CMS Audio QA, Subscribe).
- **prefers-reduced-motion** verified; non-essential motion suppressed.
- **200% text size** verified per route; no layout break.
- **+30% string-length tolerance** for i18n / future LATAM Portuguese / Spanish display strings.

---

## 9. UX principles

Detailed in `Docs/design/ux-principles.md`. 6 principles:

1. **Clinical tone, never marketing tone.** No "blockbuster," no "must-read," no exclamation marks except in direct quotes.
2. **Density over whitespace.** Editorial-grade reading density; readers are oncologists scanning between cases, not consumers scrolling for entertainment.
3. **Sources visible.** Every article surfaces its primary source URL in the masthead, not buried at the end. Inviolable rule 1 is operationally enforced at the layout level.
4. **Audio is optional, never primary.** Audio enhances; text leads. AudioPlayer is part of the article surface, not the surface itself.
5. **State is honest.** Audio in `pending` shows "Audio in production — check back" rather than hiding the row. `skipped` shows "No audio for this brief" rather than absence.
6. **Sponsor is sponsor.** 32px firewall enforced visually + via the build pipeline. Never an integrated unit; always an explicit "Sponsored by" / "Partner message" prefix.

---

## 10. User flows

Detailed in `Docs/design/user-flows.md` (345 lines). 10 top flows with happy + edge + error paths:

1. New visitor → Homepage → Article
2. Subscriber → Beehiiv email → Article
3. Article → Listen → AudioPlayer scrub + transcript
4. Article → ROMAS Insight callout → Source attribution → External primary source
5. Subscribe flow (Beehiiv) → Resend confirmation
6. Unsubscribe flow → Resend unsubscribe receipt
7. CMS sign-in (Cloudflare Access gate → Supabase Auth Helper)
8. CMS Audio QA → 5-condition checklist → Approve / Skip / Revoke
9. CMS revoke flow → 60s CDN withdrawal SLA
10. Reader region picker → APAC/EU/Americas edition

---

## 11. Brand application

Detailed in `Docs/design/brand-application.md` (141 lines). Covers:

- Wordmark sizing per surface (header, footer, podcast cover, email header)
- Favicon discipline (teal dot under "i" in BRIEF)
- Social card templates (1200×630 OG; 1200×675 Twitter)
- Email header (Beehiiv newsletter chrome)
- Podcast cover art (3000×3000 Apple Podcasts spec)
- Audio Brief cover art template
- Sponsor block templates (3 sizes; 32px firewall measured at each)

---

## 12. Asset manifest

Detailed in `Docs/design/assets/manifest.md` (or `assets/` directory listing if manifest file is light). M1 R-001..R-009 doc-only cycle did not produce asset files; M3 R-301..R-308 reader-build cycle imports the assets when the reader surface lands.

Required asset categories:
- Logo SVG (wordmark, favicon, podcast cover, email header)
- 8 audio-tier cover templates (per `audio_jobs.audio_tier` enum)
- Social card templates (OG + Twitter)
- Sponsor block illustration / treatment guides
- Newsreader + Inter font files (variable, self-hosted on Cloudflare Pages — never Google Fonts CDN for privacy)

---

## 13. Design system governance

The `design-system-keeper` agent at `.claude/agents/design-system-keeper.md` enforces design discipline on every PR:

| PR block trigger | Rule | Severity |
|---|---|---|
| Hardcoded colour value in TSX | "Use `--rb-*` tokens; see Docs/design/tokens.json" | P0 |
| `--rb-accent` (#00B4C6) used as text colour or focus-ring | "Use `--rb-accent-strong` instead; ADR-0015 v2 + a11y-audit.md" | P0 |
| `--rb-ink-subtle` (#6B7280) on non-`--rb-bg` background without contrast verification | "Run axe-core; if &lt; 4.5:1, swap to `--rb-ink-muted`" | P0 |
| `<SponsorBlock>` placed within 32px of `<Wordmark>` | "32px firewall — see SSOT §3 row 8" | P0 |
| Audio-state badge missing the text label | "Use `<AudioStatusBadge>` component; never raw dot" | P0 |
| New component not in `Docs/design/components/` registry | "Author a component spec first; do not invent one-offs" | P1 |
| Inline style attribute (not from token map) | "Use Tailwind utilities mapped to tokens" | P1 |
| `<Script strategy="beforeInteractive">` (ADR-0015 v2 closed CVE) | "Use `afterInteractive` or `lazyOnload`" | P0 |
| Raw HTML injection on user-controlled content (e.g. unsafe React HTML-prop usage) | "Route MDX content through `rehype-sanitize`; ADR-0015 v2" | P0 |

The `team-design-critic` agent (separate from `design-system-keeper`) runs at design-cycle finalization — not on every PR — and audits design plans + wireframes against the spec.

---

## 14. Decision lineage

| Source | What it locks |
|---|---|
| SSOT v1.2.0 §3 row 1 | Primary tagline |
| SSOT v1.2.0 §3 row 8 | 32px sponsor firewall |
| SSOT v1.2.0 §3 row 15 | 8-region structure |
| SSOT v1.2.0 §10 | Brand application discipline |
| ADR-0006 | Typography lock (Newsreader + Inter; v1.2 type-scale) |
| ADR-0015 v2 | Closed-CVE constraints (no `Script strategy="beforeInteractive"`; sanitiser pipeline; no Pages Router) |
| `.claude/skills/design-tokens.md` v1.2 | Executable CSS variables |
| `.claude/skills/component-library.md` | TSX implementation patterns |
| `.claude/skills/editorial-style-guide.md` | Voice + banned vocabulary + LATAM footer rule |
| `Docs/design/critic-review.md` | M0c2 design-QA cycle 2 verdict (9 P0 contrast fixes APPROVED) |
| `Docs/qa/design-review.md` | Full M0c2 design-review audit trail (cycle 1 + 2) |

---

## 15. Revision history

| Version | Date | Change |
|---|---|---|
| 1.1.0 | 2026-05-22 | Initial canonical doc (R-005 close, /team-build M1-closeout cycle). Synthesises content from /team-design D1-D12 + D15 cycle (commit `1ed4ff7`) + cycle-2 design-QA fixes (commit `4ac8541`) + design-tokens v1.2 (M0c2 contrast closure). |

---

## Pointers — where to read next

- **Component implementation patterns**: `.claude/skills/component-library.md`
- **Token definitions (CSS variables)**: `.claude/skills/design-tokens.md` v1.2
- **Token JSON mirror (cross-platform)**: `Docs/design/tokens.json` v1.2
- **Per-route wireframes + 5 states**: `Docs/design/wireframes.md`
- **Per-component specs**: `Docs/design/components/`
- **A11y audit + measured contrast**: `Docs/design/a11y-audit.md`
- **User flows + edge/error paths**: `Docs/design/user-flows.md`
- **Copy library**: `Docs/design/copy.md`
- **Information architecture + nav**: `Docs/design/information-architecture.md`
- **UX principles**: `Docs/design/ux-principles.md`
- **Interaction patterns**: `Docs/design/interaction-patterns.md`
- **UI spec (cross-cutting layout)**: `Docs/design/ui-spec.md`
- **Brand application (logo / favicon / social card / podcast cover / email header)**: `Docs/design/brand-application.md`
- **Asset manifest**: `Docs/design/assets/manifest.md`
- **Design-cycle critic verdict + audit trail**: `Docs/design/critic-review.md` + `Docs/design/review-notes.md` + `Docs/qa/design-review.md`
