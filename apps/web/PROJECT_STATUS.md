# ROMAS Brief — Project Status Tracker

> **Date:** 2026-05-28
> **Status:** Active Development — Phase 8 (Monorepo Consolidation) COMPLETE
> **Live URL:** https://romas-brief-web.vercel.app
> **Monorepo:** https://github.com/AllienNova/romas-brief (apps/web/ is the reader source)
> **Archived standalone repo:** https://github.com/kimhons/romas-brief-web (archived 2026-05-28)

---

## Current State Summary

ROMAS Brief is a fully functional specialist intelligence platform for radiation oncology professionals. The site is live on Vercel with a complete design system, 8-module homepage, rotating editorial components, photorealistic article thumbnails, SEO infrastructure, and dedicated pages for About, Academy, and How It Works.

**Phase 8 (Monorepo Consolidation) is complete as of 2026-05-28.** The reader source has been consolidated from the standalone `kimhons/romas-brief-web` repo into `apps/web/` of the `AllienNova/romas-brief` monorepo. The standalone repo has been archived. QA blockers B-17, B-18, and B-20 are all closed.

The data layer currently runs on static mock data (`lib/mock-data.ts`) with 26 articles across 9 categories. Supabase types are generated and ready; the live database connection is the primary next milestone.

---

## Completed Work

| Area | Status | Notes |
|---|---|---|
| Initial deployment | ✅ Done | Next.js 14 App Router on Vercel |
| Design system | ✅ Done | CSS tokens, typography, component variants |
| Homepage (8 modules) | ✅ Done | All modules built and styled |
| HeroCarousel | ✅ Done | 5 slide types, 7s auto-advance |
| Rotating Top Stories | ✅ Done | Full 24-article pool, 7s cycle |
| SideStack | ✅ Done | 3 slots, staggered 3D flip |
| Quick Hits Rotator | ✅ Done | Card treatment, accent bars, score rings |
| From the Editor card | ✅ Done | Practice Deltas callout |
| Photorealistic thumbnails | ✅ Done | 19 images, all articles covered |
| SiteHeader upgrade | ✅ Done | Mega-menus, Cmd-K search modal |
| SEO (JSON-LD, OG, sitemap) | ✅ Done | Full metadata suite |
| /about page | ✅ Done | ROMAS acronym reveal, psychology-driven copy |
| /academy page | ✅ Done | Placeholder content |
| /about/how-it-works | ✅ Done | Full methodology page |
| Mobile CTA band | ✅ Done | 48px, 7-day dismiss |
| Share / feedback widget | ✅ Done | Web Share API + thumbs |
| Editorial independence policy | ✅ Done | Transparent sponsorship model |
| ROMAS acronym defined | ✅ Done | Radiation Oncology Multi-Agentic System |
| Phase 8 monorepo consolidation | ✅ Done | T-801–T-809 complete; kimhons/romas-brief-web archived |
| Architecture docs updated | ✅ Done | architecture.md v2.0.0; INTEGRATION-CONTRACT.md EXECUTED |

---

## In Progress

Nothing currently in progress. Phase 8 complete.

---

## Pending / Next Steps

| Priority | Item | Notes |
|---|---|---|
| HIGH | Re-link Vercel to AllienNova/romas-brief | Go to Vercel dashboard → romas-brief-web → Settings → Git → change repo to AllienNova/romas-brief, rootDirectory: apps/web |
| HIGH | Resolve Vercel billing | Account has overdue invoice; GitHub auto-deploys blocked. Pay at https://vercel.com/alien-nova/~/settings/invoices |
| HIGH | Wire Supabase live data | Replace mock-data.ts with real DB queries; types already generated in `lib/supabase/` |
| HIGH | Point `romasbrief.vercel.app` to new project | Currently points to old project; needs billing resolved first |
| MEDIUM | Video/podcast stream section | Add as new homepage section (do NOT replace Rotating Top Stories) |
| MEDIUM | Editorial team section on /about | Owner building team; add when confirmed with real names/bios |
| MEDIUM | Real subscriber count | Replace "4,200+" with actual Supabase count |
| MEDIUM | Academy course content | Currently placeholder; needs real curriculum |
| LOW | Cmd-K search with real index | Currently UI only; needs search backend |
| LOW | For-You personalisation | Currently UI only; needs user preference storage |
| LOW | Real audio pipeline | Articles have `has_audio` flag; need actual audio files |
| LOW | Fix `<img>` → `<Image>` warning | Non-blocking Next.js warning in some components |

---

## Known Issues

| Issue | Severity | Workaround |
|---|---|---|
| GitHub auto-deploys blocked on Vercel | High | Deploy manually via Vercel API (see AGENTS.md for command) |
| Vercel still linked to archived kimhons/romas-brief-web | Medium | Re-link to AllienNova/romas-brief in Vercel dashboard (30-second click) |
| `romasbrief.vercel.app` points to old project | Medium | Use `romas-brief-web.vercel.app` for now |
| Mock data only (no live DB) | Medium | All content is static; no real-time updates |
| Cmd-K search is UI-only | Low | Displays results from mock data only |

---

## Design Principles (do not violate)

The overall page layout must never be changed without explicit instruction from the owner. Every component should meet an Apple-level standard of visual precision — clean spacing, consistent tokens, smooth animations, and purposeful colour use. The ROMAS Brief brand voice is authoritative, precise, and trusted — never sensationalist or vague.

Photorealistic clinical photography is the only acceptable image style for article thumbnails. Illustrated, abstract, or AI-generated non-photorealistic images are not appropriate for this publication.

The editorial independence model is transparent sponsorship: sponsors are clearly labelled, scoring is never influenced by commercial relationships, and readers always know which content is editorial versus sponsored.

---

## Owner Notes

- Owner: **Honour** (Radiation Oncology Physicist)
- Editorial team: **not yet confirmed** — do not add placeholder team members to /about
- Sponsorship model: **open to seeking sponsors** — editorial content and sponsored content are clearly separated
- ROMAS acronym: always **"Radiation Oncology Multi-Agentic System"**
- Audience labels: **"Oncologists · Physicists · Dosimetrists"**
