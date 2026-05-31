# ROMAS Brief — Project Memory & Agent Instructions

> **Last updated:** 2026-05-28
> **Live URL:** https://romas-brief-web.vercel.app
> **GitHub repo (standalone, ARCHIVED):** https://github.com/kimhons/romas-brief-web — archived 2026-05-28; source now in AllienNova/romas-brief apps/web/
> **GitHub monorepo:** https://github.com/AllienNova/romas-brief
> **Vercel project:** `romas-brief-web` (team: `alien-nova`, ID: `prj_U86mInvLI5mRyv6zjPIwh2Aryi`)
> **Vercel token:** stored in env as `***REMOVED-VERCEL-TOKEN***`
> **Team ID:** `team_rt0SMeqUHlkA9Z7kJPmlcpfl`
> **GitHub repo ID (Vercel source):** `1252164491` (kimhons/romas-brief-web — archived; Vercel still linked here)
> **Phase 8 consolidation:** COMPLETE — T-801 through T-809 done

---

## What Is ROMAS Brief?

**ROMAS = Radiation Oncology Multi-Agentic System**

ROMAS Brief is a specialist intelligence platform for radiation oncology professionals — oncologists, physicists, and dosimetrists. It is a daily curated news brief powered by a multi-agentic AI system that ingests, scores, and summarises clinical literature, regulatory updates, conference highlights, and industry news from PubMed, arXiv, ClinicalTrials.gov, and FDA databases.

**Owner:** Honour (Radiation Oncology Physicist)
**Audience:** Radiation oncologists · Medical physicists · Dosimetrists · RT researchers
**Tagline:** "Radiation Oncology Intelligence. Curated. Scored. Audio-ready."
**Social proof:** 4,200+ professionals (mock, to be replaced with real data)

---

## Deployment Workflow

> **IMPORTANT:** GitHub-triggered auto-deploys are BLOCKED on Vercel due to a billing issue on the account. Always deploy manually via the Vercel API.

### Standard deploy command (run from `/tmp/romas-repo`):

```bash
TOKEN="$VERCEL_TOKEN"   # set in your shell/CI; NEVER commit. The previously-committed vcp_… token was leaked and MUST be rotated (team-qa P0).
TEAM="team_rt0SMeqUHlkA9Z7kJPmlcpfl"

RESP=$(curl -s -X POST "https://api.vercel.com/v13/deployments?teamId=$TEAM" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"romas-brief-web","gitSource":{"type":"github","repoId":1252164491,"ref":"main"},"target":"production"}')

DEPLOY_ID=$(echo "$RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id','ERR'))")
echo "Deploy ID: $DEPLOY_ID"

# Poll until READY
for i in $(seq 1 24); do
  sleep 15
  STATUS=$(curl -s "https://api.vercel.com/v13/deployments/$DEPLOY_ID?teamId=$TEAM" \
    -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; print(json.load(sys.stdin).get('readyState','?'))")
  echo "[$i] $STATUS"
  if [ "$STATUS" = "READY" ] || [ "$STATUS" = "ERROR" ] || [ "$STATUS" = "CANCELED" ]; then break; fi
done

# Alias to production domain
curl -s -X POST "https://api.vercel.com/v2/deployments/$DEPLOY_ID/aliases?teamId=$TEAM" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"alias":"romas-brief-web.vercel.app"}'
```

### Build command (always verify before deploying):
```bash
cd /tmp/romas-repo && node_modules/.bin/next build
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + custom CSS tokens in `globals.css` |
| Fonts | Inter (body) + JetBrains Mono (kicker/mono) via next/font |
| Images | Next.js `<Image />` with optimisation |
| Data | `lib/mock-data.ts` (mock; Supabase types generated in `lib/supabase/`) |
| Hosting | Vercel (team: alien-nova) |
| Repo | GitHub (AllienNova/romas-brief, apps/web/) — kimhons/romas-brief-web ARCHIVED |

---

## Design System

### CSS Tokens (defined in `app/globals.css`)

```css
--bg-page          /* #F5F5F7 — page background */
--bg-surface       /* #FFFFFF — card/surface background */
--bg-elevated      /* #FAFAFA — slightly elevated surface */
--text-primary     /* #1D1D1F — main text */
--text-secondary   /* #3D3D3F — body text */
--text-tertiary    /* #6E6E73 — meta/kicker text */
--accent           /* #0066CC — primary blue */
--accent-hover     /* #0055AA */
--border-subtle    /* #E5E5EA — card borders */
--border-strong    /* #C7C7CC — dividers */
--shadow-xs/sm/md/lg/xl  /* shadow scale */
--ease-apple       /* cubic-bezier(0.4,0,0.2,1) */
--ease-spring      /* cubic-bezier(0.34,1.56,0.64,1) */
--radius-sm/md/lg/xl/2xl /* border-radius scale */
```

### Typography Classes
- `.kicker` — JetBrains Mono, 0.6875rem, uppercase, 0.08em tracking
- `.badge-insight` — teal pill for ROMAS Insight articles
- `.badge-signal-green/amber/red` — score badges
- `.card-feature` — large feature article card
- `.btn-primary` / `.btn-secondary` — button variants

### Category Colour Map
| Category | Colour | Bg Tint |
|---|---|---|
| clinical-rt | #0066CC | #EBF3FF |
| ai | #5E5CE6 | #F0EFFF |
| physics | #0A84FF | #E5F3FF |
| regulatory | #D97706 | #FEF3C7 |
| guidelines | #0891B2 | #E0F7FA |
| reimbursement | #7C3AED | #F3E8FF |
| vendor | #059669 | #D1FAE5 |
| conferences | #DC2626 | #FEE2E2 |
| operations | #16A34A | #DCFCE7 |

### Signal Score Colours
- S85+ → green ring (#16A34A)
- S70–84 → amber ring (#CA8A04)
- S<70 → red ring (#DC2626)

---

## Component Registry

| Component | File | Purpose | Notes |
|---|---|---|---|
| `HeroCarousel` | `components/HeroCarousel.tsx` | Top-of-page rotating carousel | 7s auto-advance, 5 slide types, progress bar, dots, arrows, pause-on-hover/tab-blur, reduced-motion |
| `RotatingTopStories` | `components/RotatingTopStories.tsx` | Top Stories section | Hero + 2 secondary cards auto-cycle every 7s through all 24 articles; fade+drift transition; progress bar; dots; pause-on-hover |
| `SideStack` | `components/SideStack.tsx` | Right-column rotating story stack | 3 slots, staggered 3D X-axis flip at 12s/16s/20s, pool of 12 stories |
| `QuickHitsRotator` | `components/QuickHitsRotator.tsx` | Quick Hits numbered list | Row 1 rotates every 8s (slide-up animation + "Live" badge); rows 2–5 stable; card treatment with coloured accent bars, score rings, category pills, hover lift |
| `FromTheEditor` | `components/FromTheEditor.tsx` | Editorial note card | Fills empty space below hero article; editor avatar, italic note, Practice Deltas callout |
| `DismissibleStrip` | `components/DismissibleStrip.tsx` | One-time explanation strip | Dismissed via `localStorage`; explains signal scoring |
| `MobileCTABand` | `components/MobileCTABand.tsx` | Mobile bottom CTA | 48px fixed band, 7-day `localStorage` dismiss |
| `ShareRow` | `components/ShareRow.tsx` | Share + feedback widget | Web Share API + desktop clipboard fallback; Useful/Not useful thumbs |
| `ArticleCard` | `components/ArticleCard.tsx` | Article card (4 variants) | `feature`, `standard`, `compact`, `quick-hit`; hover lift, accent bar, score badge |
| `SiteHeader` | `components/SiteHeader.tsx` | Navigation header | Topics mega-menu (3-col), Regions dropdown, For-You dropdown, Cmd-K search modal, scroll-aware shadow |
| `ConversionWidget` | `components/ConversionWidget.tsx` | Subscribe CTA widget | `inline` and `full` variants |
| `InlineAudioPlayer` | `components/InlineAudioPlayer.tsx` | Audio player | Used on article pages |
| `EditionBanner` | `components/EditionBanner.tsx` | Top edition/date banner | "Americas Edition · Thursday, May 28, 2026" |
| `DarkModeToggle` | `components/DarkModeToggle.tsx` | Dark/light mode toggle | Sun/moon icon in header |
| `ShareButtons` | `components/ShareButtons.tsx` | Share buttons | Used on article pages |
| `SiteFooter` | `components/SiteFooter.tsx` | Footer | 5-column grid: Brand, Topics, Regions, Audiences, Connect |

---

## Page Routes

| Route | File | Description |
|---|---|---|
| `/` | `app/page.tsx` | Homepage — 8 editorial modules |
| `/article/[slug]` | `app/article/[slug]/page.tsx` | Article detail page |
| `/about` | `app/about/page.tsx` | About page — ROMAS acronym, mission, values, CTA |
| `/about/how-it-works` | `app/about/how-it-works/page.tsx` | Methodology — scoring, ingestion, audio pipeline |
| `/academy` | `app/academy/page.tsx` | Academy — courses, CME, resource hub |
| `/issues` | `app/issues/page.tsx` | Archive of past issues |
| `/issues/[date]` | `app/issues/[date]/page.tsx` | Issue by date |
| `/categories` | `app/categories/page.tsx` | All topic categories |
| `/categories/[slug]` | `app/categories/[slug]/page.tsx` | Articles by category |
| `/regions` | `app/regions/page.tsx` | All regions |
| `/regions/[slug]` | `app/regions/[slug]/page.tsx` | Articles by region |
| `/for/[audience]` | `app/for/[audience]/page.tsx` | Audience-filtered view |
| `/listen` | `app/listen/page.tsx` | Audio briefs listing |
| `/listen/[tier]` | `app/listen/[tier]/page.tsx` | Audio by tier |
| `/content-type/[slug]` | `app/content-type/[slug]/page.tsx` | Articles by content type |
| `/sitemap.xml` | `app/sitemap.ts` | Auto-generated sitemap |
| `/robots.txt` | `app/robots.ts` | Robots file |

---

## Homepage Module Map (`app/page.tsx`)

```
[EditionBanner — top bar: "Americas Edition · Thursday, May 28, 2026"]
[SiteHeader — sticky nav with mega-menus + Cmd-K search]
[DismissibleStrip — one-time signal score explainer]

MODULE 0: HeroCarousel
  — 5 slide types: Top Move / Friday Read / Audio Today / Conference Brief / Sponsor
  — 7s auto-advance, progress bar, dots, arrows

MODULE 1: Top Stories (RotatingTopStories)
  — Hero card (left, col-span-7) + 2 secondary cards (right, col-span-5)
  — Auto-cycles every 7s through all 24 articles
  — FromTheEditor card below the grid

MODULE 2: Inline Conversion (ConversionWidget)

MODULE 3: Industry Moves (3-column grid)

MODULE 4: Paper of the Day (full-width feature)

MODULE 5: Quick Hits (QuickHitsRotator)
  — Row 1 rotates every 8s, rows 2–5 stable
  — Card treatment: accent bars, score rings, category pills

MODULE 6: Today's Podcast (audio player)

MODULE 7: Trending This Week (5-item list)

MODULE 8: Top Papers This Week (4-column grid)

MODULE 9: Audio Briefs (4-column grid)

[SiteFooter — 5-column grid]
[MobileCTABand — mobile only, 48px fixed bottom]
```

---

## Data Layer

**Current state:** All data served from `lib/mock-data.ts` (static mock).
**Supabase:** Types generated in `lib/supabase/` — ready to wire when DB is populated.

### Mock data functions:
- `getTopStories(n)` — top N articles by composite_score
- `getIndustryMoves(n)` — vendor/industry articles
- `getPaperOfTheDay()` — highest-score paper_critique
- `getQuickHits(n)` — all articles sorted by score
- `getTodaysPodcast()` — first article with has_audio
- `getTrendingArticles(n)` — by composite_score
- `getTopPapersThisWeek(n)` — by composite_score
- `getAudioArticles(n)` — articles with has_audio

### Article schema (MockArticle):
```typescript
{
  slug: string
  title: string
  standfirst: string
  category: "clinical-rt" | "ai" | "physics" | "regulatory" | "guidelines" | "reimbursement" | "vendor" | "conferences" | "operations"
  content_type: "paper_critique" | "guideline_brief" | "regulatory_update" | "conference_brief" | "vendor_news" | "long_take" | "quick_hit"
  region: "US" | "Europe" | "UK" | "APAC" | "Global" | "MENA-Africa" | "LATAM" | "Canada"
  composite_score: number  // 0-100
  clinical_score: number
  practice_score: number
  novelty_score: number
  published_at: string  // ISO date
  has_audio: boolean
  romas_insight?: string
  disease_site_tags: string[]
  thumbnail_url?: string  // /thumbnails/{slug}.jpg
}
```

---

## Thumbnails

- **Location:** `public/thumbnails/`
- **Count:** 19 photorealistic images generated
- **Format:** JPG, 2560×1440px (auto-optimised by Next.js Image)
- **Naming:** `{article-slug}.jpg`
- **Style:** Photorealistic clinical photography — treatment rooms, linac machines, clinical workstations, patient care

---

## SEO

- **JSON-LD:** `WebSite` + `Organization` structured data in `app/layout.tsx`
- **OG/Twitter:** Full Open Graph and Twitter Card metadata
- **Sitemap:** Auto-generated at `/sitemap.xml` via `app/sitemap.ts`
- **Robots:** `app/robots.ts` — allows all crawlers, points to sitemap
- **Canonical:** `https://romas-brief-web.vercel.app`

---

## Key Design Decisions & Owner Preferences

1. **Layout is sacred** — never change the overall page layout without explicit instruction
2. **No editorial team section on /about** — owner is still building the team; do not add placeholder team members
3. **Editorial independence** — ROMAS Brief accepts sponsorships but they are clearly labelled and never influence scoring. The editorial independence statement reflects this (transparent, not absolute rejection of sponsors)
4. **ROMAS acronym** — always "Radiation Oncology Multi-Agentic System" (not "Multi-Agent" or any other variant)
5. **Audience labels** — "Oncologists · Physicists · Dosimetrists" (not "Radiation / Medical / Dosimetrists")
6. **Score badge format** — always "S{score}" (e.g. S94, S87) — never "Score: 94" or just "94"
7. **Apple-level design** — every component should feel premium, precise, and intentional
8. **Photorealistic images only** — no illustrated or abstract thumbnails; all images must be clinical photography style

---

## Phase 8 Status (COMPLETE as of 2026-05-28)

- [x] T-801: Inspect both repos for version conflicts — DONE
- [x] T-802/T-803: Copy reader source into AllienNova/romas-brief apps/web/ — DONE
- [x] T-804: pnpm install + turbo typecheck + build — DONE (79/79 pages)
- [x] T-805: Vercel rootDirectory/installCommand/buildCommand reset — DONE
- [x] T-806: Verify live site at romas-brief-web.vercel.app — DONE
- [x] T-807: Archive kimhons/romas-brief-web — DONE (2026-05-28)
- [x] T-808: Update architecture.md + flip INTEGRATION-CONTRACT.md to EXECUTED — DONE
- [x] T-809: Re-dispatch /team-qa cycle-7 — DONE (single-scope verdict)

## Pending / Future Work

- [ ] Re-link Vercel project to AllienNova/romas-brief (rootDirectory: apps/web) — requires Vercel dashboard
- [ ] Replace `romasbrief.vercel.app` domain alias (currently points to old project; needs Vercel billing resolved)
- [ ] Wire Supabase — replace mock-data.ts with live DB queries
- [ ] Add editorial team section to `/about` when team is confirmed
- [ ] Build video/podcast stream component (requested — add as new section, do NOT replace Rotating Top Stories)
- [ ] Add Academy course content (currently placeholder)
- [ ] Add real subscriber count (replace "4,200+")
- [ ] Set up real audio pipeline for article audio briefs
- [ ] Add Cmd-K search with real search index (currently UI only)
- [ ] Add "For You" personalisation (currently UI only)
- [ ] Resolve Vercel billing to re-enable GitHub auto-deploys
- [ ] Fix `<img>` → `<Image>` warning (non-blocking)

---

## Commit History

| Commit | Description |
|---|---|
| `f51c1bb` | design: redesign Quick Hits — card treatment, accent bars, score rings, category pills, hover lift |
| `c343d12` | feat: rotating Top Stories — hero + 2 secondary auto-cycle every 7s through all 24 articles |
| `14925a2` | design: comprehensive polish — CSS tokens, typography, card components, header, footer |
| `39447fc` | fix: editorial independence statement updated to allow transparent sponsorships |
| `c340c30` | fix: correct ROMAS acronym to Radiation Oncology Multi-Agentic System |
| `add8e01` | feat: redesign /about — ROMAS acronym reveal, psychology-driven copy, signal funnel, aspirational CTA |
| `6dcf672` | fix: remove editorial team section from /about |
| `b8b3ff2` | feat: FromTheEditor card, Academy page, About Us page, nav fixes |
| `fa4e5e3` | feat: photorealistic thumbnails for all 24 articles |
| `4e4f2c0` | feat: 9-category upgrade — HeroCarousel, SideStack, QuickHitsRotator, DismissibleStrip, MobileCTABand, ShareRow, SiteHeader mega-menu + Cmd-K, JSON-LD SEO, sitemap, robots, /about/how-it-works |
| `4abccf8` | feat: Apple-level redesign — new design system, component library, 8-module homepage |
| `24a9272` | feat: wire live Supabase — generated types + typed client |
| `c20925a` | feat: initial deployment |
