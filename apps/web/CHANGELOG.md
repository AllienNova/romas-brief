# ROMAS Wire — Changelog

All notable changes to this project are documented here.

---

## [Unreleased]

### Pending
- Re-link Vercel project to AllienNova/romas-brief (rootDirectory: apps/web)
- Video/podcast stream section (new section, not replacing Rotating Top Stories)
- Supabase live data wiring
- Editorial team section on /about (when team is confirmed)
- Real subscriber count
- Cmd-K search with real index
- For-You personalisation
- Fix `<img>` → `<Image>` warning

---

## [0.9.0] — 2026-05-28

### Phase 8 — Monorepo Consolidation (T-801 through T-809)

- **T-801:** Inspected both repos — no version conflicts found
- **T-802/T-803:** Copied full reader implementation into `apps/web/` of `AllienNova/romas-brief` monorepo (533-line page.tsx, 16 components, 19 thumbnails, all routes)
- **T-804:** `pnpm install` + `turbo typecheck` + `build` — all green (79/79 pages)
- **T-805:** Vercel `rootDirectory`, `installCommand`, `buildCommand` reset to null (flat-repo build)
- **T-806:** Verified live site at https://romas-brief-web.vercel.app — 8-module homepage confirmed READY
- **T-807:** Archived `kimhons/romas-brief-web` via GitHub API; added archive README pointing to monorepo
- **T-808:** Updated `Docs/specs/architecture.md` to v2.0.0 (single-repo state); flipped `Docs/INTEGRATION-CONTRACT.md` status from ACCEPTED-CONSOLIDATE → EXECUTED
- **T-809:** Re-dispatched `/team-qa cycle-7` — single-scope verdict

### QA Blockers Closed
- **B-17** (CLAUDE.md §12 fictional state) — CLOSED
- **B-18** (lockfile drift) — CLOSED (pnpm-lock.yaml regenerated, 3 audio workers committed)
- **B-20** (split-repo undocumented) — CLOSED (INTEGRATION-CONTRACT.md written, Option A consolidation executed)

---

## [0.8.0] — 2026-05-28

### Changed
- **Quick Hits section redesigned** — replaced plain numbered list with individual rounded cards
  - Coloured left accent bar per card (matches category colour)
  - Score ring badge (circular, colour-coded: green ≥85, amber ≥70, red <70, with soft glow)
  - Category pill with matching background tint
  - Pulsing "Live" badge on rotating row 1
  - Cards lift 2px with deeper shadow and coloured border glow on hover
  - Smooth slide-up animation on row 1 rotation (320ms cubic-bezier)

---

## [0.7.0] — 2026-05-28

### Added
- **Rotating Top Stories** — entire Top Stories section (hero + 2 secondary cards) now auto-cycles every 7s through all 24 articles
  - Animated progress bar (category-colour coded)
  - Page indicator dots (active dot expands to pill)
  - Prev/Next arrow buttons
  - Pause on hover, pause on tab blur
  - Fade + lateral drift transition (380ms)
  - `getTopStories` now returns full pool of 24 articles

---

## [0.6.0] — 2026-05-28

### Changed
- **Comprehensive design polish** across all components
  - New CSS token hierarchy: `--shadow-xs/sm/md/lg/xl`, `--ease-apple/spring/out`, `--radius-sm/md/lg/xl/2xl`
  - Typography: `.kicker` uses JetBrains Mono; heading tracking tightened to `-0.02em`; fluid `clamp()` section padding
  - Buttons: `.btn-primary` and `.btn-secondary` have spring-scale micro-animations
  - ArticleCard (all 4 variants): refined image overlay, hover lift, animated arrow, accent colour bar
  - SiteHeader: improved logo (radiation SVG + "ROMASBrief" + "RADIATION ONCOLOGY INTELLIGENCE" subtitle), audience switcher as pill links
  - Footer: 5-column grid (Brand, Topics, Regions, Audiences, Connect), RSS feeds, social links

---

## [0.5.0] — 2026-05-28

### Changed
- **Editorial independence statement** updated — ROMAS Wire now accepts sponsorships with full transparency; sponsored content is clearly labelled and never influences signal scoring

### Fixed
- **ROMAS acronym** corrected to "Radiation Oncology Multi-Agentic System" throughout the site

---

## [0.4.0] — 2026-05-28

### Changed
- **/about page completely redesigned** with psychology-driven marketing copy
  - Hero: "For professionals who refuse to fall behind" + social proof bar (4,200+ professionals, stacked avatars)
  - ROMAS Acronym Reveal: 5 animated cards (R·O·M·A·S) with hover lift and glow
  - Problem/Solution section: pain statement + signal funnel visualisation (4,000 papers → brief)
  - Values section: 4 large cards with hover animations
  - CTA: "Claim your intellectual advantage" with Subscribe Free + Read Methodology

### Removed
- Editorial team section from /about (team still being built; will be added when confirmed)

---

## [0.3.0] — 2026-05-28

### Added
- **FromTheEditor component** — fills empty left-column space below hero article
  - Editor avatar (RH teal initials), date-stamped italic editorial note
  - ⚡ Practice Deltas This Week — 3 colour-coded clickable practice-change items
  - "How we score & curate →" link
- **Academy page** (`/academy`) — course listings, resource hub, CME content
- **About Us page** (`/about`) — Mission, Vision, Values, signal score methodology
- **Academy nav link** in main navigation
- **About Us nav link** in main navigation
- **Audience switcher** improved — "For: Oncologists · Physicists · Dosimetrists" as styled pill links

---

## [0.2.0] — 2026-05-28

### Added
- **Photorealistic thumbnails** for all 24 articles (19 images in `public/thumbnails/`)
  - Clinical photography style: treatment rooms, linac machines, workstations, patient care
  - 2560×1440px JPG, auto-optimised by Next.js Image
  - `thumbnail_url` field added to MockArticle interface and all articles in mock-data.ts
  - Hero article and all ArticleCard variants display thumbnails

---

## [0.1.0] — 2026-05-28

### Added — 9-Category Upgrade
- **HeroCarousel** — 7s auto-advance, 5 slide types (Top Move, Friday Read, Audio Today, Conference Brief, Sponsor), progress bar, dots, arrows, pause-on-hover/tab-blur, `prefers-reduced-motion`
- **SideStack** — 3 slots, staggered 3D X-axis flip at 12s/16s/20s, pool of 12 stories
- **QuickHitsRotator** — row 1 exits up/enters from below every 8s, rows 2–5 stable, pool of 20 items
- **DismissibleStrip** — one-time signal score explanation, `localStorage` dismiss
- **MobileCTABand** — 48px fixed bottom band, 7-day `localStorage` dismiss
- **ShareRow** — Web Share API + desktop clipboard fallback, Useful/Not useful thumbs widget
- **SiteHeader upgrade** — Topics mega-menu (3-column grid), Regions dropdown, For-You dropdown, Cmd-K search modal, scroll-aware shadow, active-route highlighting
- **SEO** — JSON-LD `WebSite` + `Organization` structured data, full OG/Twitter metadata, `sitemap.ts`, `robots.ts`
- **/about/how-it-works** — methodology page: ingestion sources, 3-dimension scoring, score legend, content types, audio pipeline, editorial independence

---

## [0.0.2] — 2026-05-27

### Added
- Apple-level redesign — new design system, component library, 8-module homepage
- Supabase types generated and typed client wired

---

## [0.0.1] — 2026-05-27

### Added
- Initial deployment — ROMAS Wire reader site
