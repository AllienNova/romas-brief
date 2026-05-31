# ROMAS Wire — Master Implementation Plan

**Version:** 1.1.0 (cycle-2 scope lock)
**Date:** 2026-05-14
**Owner:** Kimal Honour Djam (president@aliennova.com)
**Status:** Canonical executable plan — `/team-build` runs against this file
**Supersedes / merges:** `Docs/ROMAS-Brief-500-Article-Launch-Plan.md` v1.1 (prior content distribution plan); `Docs/ROMAS-Brief-Daily-Production-Runbook.md` v1.1 (runtime loop); `Docs/ROMAS-Brief-Master-Strategy.md` v2.1 (locked decisions); `Docs/ROMAS-Brief-Audio-Architecture.md` v1.0 (4-tier audio)
**Companion:** `docs/specs/delivery-plan.md` (milestone narrative + risk register), `docs/specs/test-qa-plan.md` (A-NNN acceptance tests)

---

## CYCLE-2 SCOPE LOCK (2026-05-14, Kimal verbal)

Kimal locked an audio-launch-everything-Day-1 + Day-60-video-podcast posture on 2026-05-14, superseding cycle-1's staggered phasing. This plan retains all cycle-1 task IDs (referenced by `test-qa-plan.md` A-NNN catalog and `remediation-plan.md` R-NNN) and adds the cycle-2 deltas as new IDs in unused ranges.

| Lock | Impact on phase structure below |
|---|---|
| **All 4 audio tiers launch Day 1** (Audio Brief + Daily Brief + Audio Podcast + Conference Brief) | **Phase C (M2)** expands scope from "Audio Brief + QA gate" to "all 4 audio generators + QA gate + all 4 RSS feeds + Podcast episode 001 production" (new T-225..T-230). **Phase F (M5)** "Weekly Podcast tier launch" is **DISSOLVED** — its content folds into Phase C. M5 retained as a placeholder section noting the dissolution. |
| **Q2-A: Day 1 ships full 30–60 min Audio Podcast episode 001** | New T-225 (script write), T-226 (script lock + QA), T-227 (lexicon + TTS), T-228 (master + transcript), T-229 (audio QA flip), T-230 (`podcast.xml` validates with iTunes namespace, episode 001 live by Day 1 00:00 UTC). |
| **Tier 5 Video Podcast launches Day 60** | New **Phase G.5 (M6.5)** between Phase G (M6 Conference Brief) and Phase H (M7 Auto-publish). Tasks T-651..T-660: video studio (Cloudflare Stream or vendor TBD via ADR-0012), guest booking workflow, recording, editing, `video-podcast.xml` feed (video enclosure type), reader Watch page, new agent role for video-operations TBD. FR-W-002 in product-spec reversed for Tier 5 only. |
| **Email split: Beehiiv + Resend** | Phase D (M3) T-310 splits into T-310 (Beehiiv issue send), T-310A (Resend transactional), T-310C (`workers/beehiiv-webhook` HMAC-verify + Supabase sync), T-310D (daily Beehiiv↔Supabase reconciliation job alerts on >5 or >0.5% drift). |

The Table of contents below reflects the cycle-1 section letters (preserved) plus the new G.5.

## Table of contents

- A. Phase 0 — Doc Reconciliation (M0) — *unchanged + R-014 moved here per cycle-1 critic + Q1/Q2/Q3 cascade per cycle-2 lock*
- B. Phase 1 — Foundation (M1)
- C. Phase 2 — Audio Pipeline (M2) — **expanded cycle-2: all 4 audio tier generators + Podcast episode 001 Day 1**
- D. Phase 3 — Web reader + Beehiiv newsletter + Resend transactional + Day-1 launch (M3) — *cycle-2 narrowed: audio removed; Beehiiv/Resend split added*
- E. Phase 4 — Friday Read (M4)
- F. Phase 5 — *DISSOLVED cycle-2 — content folded into Phase C (M2)*
- G. Phase 6 — Conference Brief readiness operations (M6)
- **G.5. Phase 6.5 — Video Podcast Tier 5 launch (M6.5) — NEW cycle-2** *(Day 60)*
- H. Phase 7 — Auto-publish graduation gate (M7)
- I. Cross-cutting concerns
- J. Glossary
- K. Revision history

---

## A. Phase 0 — Doc Reconciliation (M0)

**Window:** Day -3 → Day -1
**Goal:** Close the 7 Critical + 4 High audit findings from /team-review before any code lands. Doc-level only — no production code touches in this phase.
**Inputs:** 19 audit findings; CLAUDE.md §3 locked decisions ledger.

### A.1 Tasks

1. **T-001 — Confirm tagline everywhere.**
   - Doc edits: `Docs/ROMAS-Brief-Master-Strategy.md` §3 row 1, `Docs/ROMAS-Brief-Design-Specification.md` §masthead, `CLAUDE.md` §2.
   - Exact change: collapse all primary-tagline references to "Radiation oncology, decoded daily." (hypothesis — awaiting Kimal). Move "Clinical intelligence for modern radiation oncology" to secondary slot. "Not headlines. Clinical intelligence." remains podcast-pre-roll-close only.
   - Owner: editorial-director. Accept: **A-001**.
2. **T-002 — Lock podcast Day-14 vs Day-30 decision.**
   - Doc edits: `AGENT.md §13` append decision row; `Docs/ROMAS-Brief-500-Article-Launch-Plan.md` §8 last bullet.
   - Exact change: Day 14 = `podcast.xml` minimal feed-shell launches alongside reader; Day 30 = Tier 3 full-fat weekly podcast launches (hypothesis — awaiting Kimal).
   - Owner: editorial-director. Accept: **A-002**.
3. **T-003 — Strike Beehiiv, set Resend canonical.**
   - Doc edits: `Docs/ROMAS-Brief-500-Article-Launch-Plan.md` §8 checklist item 1; `Docs/ROMAS-Brief-Daily-Production-Runbook.md` Phase 7.
   - Exact change: replace "Beehiiv" with "Resend" everywhere (hypothesis — awaiting Kimal).
   - Owner: editorial-director. Accept: **A-003**.
4. **T-004 — Normalise audio_status enum.**
   - Doc edits: `Docs/ROMAS-Brief-Audio-Architecture.md` §state-machine; `AGENT.md §12`; `CLAUDE.md §5`.
   - Exact change: canonical enum `{queued, generating, in_review, published, skipped, revoked}` only; strike legacy variants.
   - Owner: design-system-keeper. Accept: **A-004**.
5. **T-005 — Sponsor firewall measurement.**
   - Doc edits: `Docs/ROMAS-Brief-Design-Specification.md` §sponsor-block.
   - Exact change: add "32px minimum clearance from ROMAS Wire wordmark — measured at smallest masthead instance" with figure callout.
   - Owner: design-system-keeper. Accept: **A-005**.

### A.2 Done definition

A-001..A-011 in `test-qa-plan.md` pass. No internal contradiction across CLAUDE.md, AGENT.md, Master Strategy, Audio Architecture, Runbook, Design Spec, Launch Plan.

---

## B. Phase 1 — Foundation (M1) [COMPLETED 2026-05-28]

**Window:** Day -7 → Day 0
**Goal:** Production-grade monorepo, full Supabase schema, first ingestion Worker green, Resend canary delivered, CI green.

### B.1 Tasks

| ID | Title | Deliverable file(s) | Owner | Est | Depends | Accept |
|---|---|---|---|---|---|---|
| T-101 | Monorepo scaffold | `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `apps/web/`, `apps/cms/`, `workers/`, `packages/ui/`, `packages/config/` | web-engineer | M | M0 done | A-101 |
| T-102 | TS strict baseline | `tsconfig.base.json`, `tsconfig.json` per app | web-engineer | S | T-101 | A-102 |
| T-103 | Migration 0001 — articles | `supabase/migrations/0001_create_articles.sql` | cms-engineer | M | T-101 | A-103 |
| T-104 | Migration 0002 — audio_jobs | `supabase/migrations/0002_create_audio_jobs.sql` | cms-engineer | M | T-103 | A-104 |
| T-105 | Migration 0003 — sources | `supabase/migrations/0003_create_sources.sql` | cms-engineer | S | T-103 | A-105 |
| T-106 | Migration 0004 — claim_trace | `supabase/migrations/0004_create_claim_trace.sql` | cms-engineer | S | T-103 | A-106 |
| T-107 | Migration 0005 — embargo_hold | `supabase/migrations/0005_create_embargo_hold.sql` | cms-engineer | S | T-103 | A-107 |
| T-108 | Migration 0006 — signal_scores | `supabase/migrations/0006_create_signal_scores.sql` | cms-engineer | S | T-103 | A-108 |
| T-109 | Migration 0007 — pronunciation_lexicon | `supabase/migrations/0007_create_pronunciation_lexicon.sql` | cms-engineer | S | T-103 | A-109 |
| T-110 | Migration 0008 — voice_consent_registry | `supabase/migrations/0008_create_voice_consent_registry.sql` | cms-engineer | S | T-103 | A-110 |
| T-111 | Migration 0009 — subscribers | `supabase/migrations/0009_create_subscribers.sql` | cms-engineer | S | T-103 | A-111 |
| T-112 | Migration 0010 — source_health | `supabase/migrations/0010_create_source_health.sql` | cms-engineer | S | T-103 | A-112 |
| T-113 | RLS policies | `supabase/migrations/0011_rls_policies.sql` | cms-engineer | M | T-104..T-111 | A-113 |
| T-114 | Wrangler config | `workers/ingestion-cron/wrangler.toml` (cron `30 10 * * 1-5`) | web-engineer | S | T-101 | A-114 |
| T-115 | First ingestion Worker | `workers/ingestion-cron/src/index.ts` | web-engineer | L | T-114,T-105,T-112 | A-115 |
| T-116 | Resend canary | `workers/email-canary/src/index.ts` | web-engineer | S | T-101 | A-116 |
| T-117 | CI pipeline | `.github/workflows/ci.yml` (lint, typecheck, test, build) | web-engineer | M | T-101..T-116 | A-117 |
| T-118 | Secrets policy | `docs/secrets-management.md` + Cloudflare Workers secret setup | cms-engineer | S | T-101 | A-118 |
| T-119 | Observability baseline | Plausible site + Worker log shipping to Axiom/Logflare | web-engineer | S | T-115 | A-119 |
| T-120 | Source-health report | `workers/source-health/src/index.ts` writes to `source_health` | regulatory-analyst | M | T-115,T-112 | A-120 |
| T-121 | Embargo hold bootstrap | `workers/ingestion-cron/src/embargo.ts` reject path | regulatory-analyst | S | T-107 | A-121 |
| T-122 | Color tokens v1.1 | `packages/ui/src/tokens/audio.css` (`--rb-audio-published/-pending/-skipped`) | design-system-keeper | S | T-101 | A-122 |
| T-123 | M1 review | `docs/sign-offs/m1-signoff.md` | editorial-director | S | T-101..T-122 | A-123 |

### B.2 Done definition

CI green. `pnpm install && pnpm turbo build && pnpm turbo test && pnpm turbo lint && pnpm turbo typecheck` exits 0. `supabase db push` applies migrations 0001..0011 with zero errors. Cron run at 10:30 UTC writes ≥ 50 raw items JSON to `r2://romas-raw/<YYYY-MM-DD>/`. Resend canary sends to internal address.

---

## C. Phase 2 — Audio Pipeline (M2)

**Window:** Day 0 → Day 7
**Goal:** Audio Brief tier (Tier 1) live end-to-end. QA gate enforced. 60-second revocation tested.

### C.1 Tasks

| ID | Title | Deliverable file(s) | Owner | Est | Depends | Accept |
|---|---|---|---|---|---|---|
| T-201 | Lexicon seed | `supabase/seed/pronunciation_lexicon_seed.sql` (30 entries) | audio-producer | S | T-109 | A-201 |
| T-202 | ElevenLabs TTS Worker | `workers/tts-elevenlabs/src/index.ts` | audio-producer | L | T-104,T-201 | A-202 |
| T-203 | PlayHT failover | `workers/tts-playht/src/index.ts` | audio-producer | M | T-202 | A-203 |
| T-204 | Loudness master | `workers/audio-loudness/src/index.ts` (ffmpeg loudnorm -16 LUFS / -1 dBTP) | audio-producer | M | T-202 | A-204 |
| T-205 | 10-beat script | `packages/audio-pipeline/src/script-generator.ts` | audio-producer | M | T-202 | A-205 |
| T-206 | Pre-roll | `packages/audio-pipeline/src/preroll.ts` | audio-producer | S | T-204 | A-206 |
| T-207 | WAV archive | `workers/audio-archive/src/index.ts` → `r2://romas-audio-archive` | audio-producer | S | T-204 | A-207 |
| T-208 | MP3 CDN | `workers/audio-publish/src/index.ts` → `r2://romas-audio-cdn` | audio-producer | S | T-207 | A-208 |
| T-209 | CMS Audio QA UI | `apps/cms/src/pages/audio-qa/[id].tsx` | cms-engineer | L | T-104,T-204 | A-209 |
| T-210 | QA checklist component | `apps/cms/src/components/AudioQAChecklist.tsx` | cms-engineer | M | T-209 | A-210 |
| T-211 | Revocation kill switch | `workers/audio-revoke/src/index.ts` (purge ≤ 60s) | audio-producer | M | T-208,T-209 | A-211 |
| T-212 | Revocation watchdog | `workers/audio-revoke-watchdog/src/index.ts` (alert@45s, fail@60s) | audio-producer | S | T-211 | A-212 |
| T-213 | Voice consent registry | `supabase/seed/voice_consent_seed.sql` + admin UI form | audio-producer | S | T-110 | A-213 |
| T-214 | `audio-brief.xml` RSS | `workers/rss-audio-brief/src/index.ts` | rss-publisher | M | T-208,T-209 | A-214 |
| T-215 | AudioPlayer Variant A | `packages/ui/src/AudioPlayer/VariantA.tsx` (inline-in-article) | web-engineer | M | T-122 | A-215 |
| T-216 | AudioPlayer Variant B | `packages/ui/src/AudioPlayer/VariantB.tsx` (Listen-page hero) | web-engineer | M | T-215 | A-216 |
| T-217 | AudioStatus chip | `packages/ui/src/AudioStatus.tsx` | design-system-keeper | S | T-122,T-209 | A-217 |
| T-218 | Second-reviewer playbook | `docs/operations/second-reviewer-onboarding.md` | editorial-director | S | T-209 | A-218 |
| T-219 | Audio-skip escape hatch | `workers/audio-publish/src/skip.ts` | audio-producer | S | T-209 | A-219 |
| T-220 | Loudness retry cap | `workers/audio-loudness/src/retry.ts` (max 2, then skip) | audio-producer | S | T-204 | A-220 |
| T-221 | Transcript generator | `workers/audio-transcript/src/index.ts` | audio-producer | M | T-205 | A-221 |
| T-222 | M2 dry run | `docs/sign-offs/m2-dryrun.md` (5 sample articles from Launch Plan §6) | editorial-director | S | T-201..T-221 | A-222 |
| T-225 | Audio Podcast episode 001 — long-form script (4,500–9,000 spoken words; 30–60 min) | `editorial/podcast/episode-001/script.md` + draft state in `articles` | editorial-director + audio-producer | L | T-205 | A-225 |
| T-226 | Episode 001 script lock + 3-reviewer sign-off | `editorial/podcast/episode-001/script-locked.md` + `claims` table populated + `qa_reviewer` recorded | editorial-director | M | T-225 | A-226 |
| T-227 | Episode 001 TTS — ElevenLabs primary + PlayHT failover tested | `audio_jobs` row, `processing` state; lexicon applied | audio-producer | M | T-202,T-203,T-226 | A-227 |
| T-228 | Episode 001 master + transcript + chapter markers | `r2:romas-audio-archive/podcast-ep001-master.wav` + `r2:romas-audio-cdn/podcast-ep001.mp3` + transcript JSON | audio-producer | M | T-204,T-221,T-227 | A-228 |
| T-229 | Episode 001 audio-QA approve | `audio_jobs.audio_status = 'published'` via 5-condition CHECK | audio-qa-reviewer | S | T-209,T-228 | A-229 |
| T-230 | `podcast.xml` validates with iTunes namespace + episode 001 enclosure | `workers/rss-podcast/src/index.ts` validated against Apple Podcasts; first-fetch before Day 1 00:00 UTC | rss-publisher | M | T-214,T-229,T-313 | A-230 |

### C.2 Required flip conditions (schema-enforced via T-209)

`audio_status: in_review → published` requires all of:
1. `clinical_claims_checked = true`
2. `qa_reviewer IS NOT NULL`
3. `loudness_lufs BETWEEN -18 AND -14` (ADR-0016; -16 ±1 LUFS production target in audio-qa-reviewer agent)
4. `transcript_url IS NOT NULL`

`audio_status: published → revoked` requires:
1. `revoke_reason IS NOT NULL`
2. CDN purge job queued
3. Watchdog confirms purge complete ≤ 60s

### C.3 Done definition

5 sample articles from Launch Plan §6 each traverse: `draft → audio script (10 beats) → TTS → loudness master → QA UI flip → `audio-brief.xml` updated → MP3 served from CDN → revoke test ≤ 60s`. A-201..A-222 green.

---

## D. Phase 3 — Web reader + Daily Brief + Podcast Day 14 (M3)

**Window:** Day 8 → Day 14
**Goal:** Public reader live; Daily Brief tier live; minimal `podcast.xml` feed-shell live; first daily email dispatched via Resend.

### D.1 Tasks

| ID | Title | Deliverable file(s) | Owner | Est | Depends | Accept |
|---|---|---|---|---|---|---|
| T-301 | Public reader scaffold | `apps/web/` (Next.js 14+ App Router, Cloudflare Pages target) | web-engineer | L | T-101,T-122 | A-301 |
| T-302 | Homepage | `apps/web/src/app/page.tsx` | web-engineer | L | T-301 | A-302 |
| T-303 | Article template | `apps/web/src/app/article/[slug]/page.tsx` (≤90 char headlines enforced) | web-engineer | M | T-301 | A-303 |
| T-304 | Listen page | `apps/web/src/app/listen/page.tsx` (4-tier grid) | web-engineer | M | T-215,T-216 | A-304 |
| T-305 | Category index | `apps/web/src/app/category/[slug]/page.tsx` (11 categories) | web-engineer | M | T-302 | A-305 |
| T-306 | Filter UI | `apps/web/src/components/Filters.tsx` (region + audience) | web-engineer | M | T-302 | A-306 |
| T-307 | Search | `supabase/migrations/0012_pgvector_search.sql` + `apps/web/src/app/search/page.tsx` | cms-engineer | L | T-103 | A-307 |
| T-308 | Daily Brief Worker | `workers/audio-daily-brief/src/index.ts` (10–15 min roundup) | audio-producer | M | T-202,T-204 | A-308 |
| T-309 | `daily-brief.xml` RSS | `workers/rss-daily-brief/src/index.ts` | rss-publisher | M | T-214,T-308 | A-309 |
| T-310 | Email issue — Beehiiv newsletter (canonical per ADR-0007 cycle-3) | `workers/email-issue/src/index.ts` (Beehiiv API); transactional via T-310A `workers/email-transactional/` (Resend); webhook via T-310C `workers/beehiiv-webhook/`; reconciliation via T-310D | web-engineer | M | T-111,T-116,T-303 | A-310 |
| T-310A | Resend transactional flow | `workers/email-transactional/src/index.ts` — signup confirm + unsubscribe receipt + audio-revocation notice + password reset; DKIM/SPF/DMARC on brief@romasbrief.com | web-engineer | M | T-310 | A-310A |
| T-310B | (reserved — pre-launch Beehiiv→Supabase migration; no work unless Kimal provisions pre-existing list) | — | web-engineer | S | T-310 | A-310B |
| T-310C | Beehiiv webhook handler | `workers/beehiiv-webhook/src/index.ts` — HMAC-SHA256 verify with BEEHIIV_WEBHOOK_SECRET; sync subscriber state transitions; idempotent on Beehiiv event ID | cms-engineer | M | T-310 | A-310C |
| T-310D | Daily Beehiiv↔Supabase reconciliation | `workers/beehiiv-reconcile/src/index.ts` — 03:00 UTC daily; Slack + email alert at drift > 5 rows or > 0.5% delta; logs to subscriber_health table | cms-engineer | M | T-310C | A-310D |
| T-311 | Subscriber count display | `apps/web/src/components/SubscriberCount.tsx` | web-engineer | S | T-302 | A-311 |
| T-312 | Sponsor block | `packages/ui/src/SponsorBlock.tsx` (32px firewall) | design-system-keeper | S | T-302 | A-312 |
| T-313 | `podcast.xml` **full Tier-3** (Day 1 per cycle-3 Q2/Q2-A; iTunes namespace; episode 001 live by Day 1 00:00 UTC) | `workers/rss-podcast/src/index.ts` | rss-publisher | M | T-214,T-230 | A-313 |
| T-314 | **Day-1 launch checklist** (was Day-14; superseded cycle-3) | `docs/sign-offs/day1-launch-checklist.md` mirrors LAUNCH_ARC_PLAN.md §5 18-item gate | editorial-director | S | T-301..T-313 | A-314 |
| T-315 | WCAG 2.2 AA pass | `docs/accessibility/m3-audit.md` | design-system-keeper | M | T-301..T-306 | A-315 |
| T-316 | Web perf budget | LCP < 2.5s, INP < 200ms, CLS < 0.1 (Lighthouse CI) | web-engineer | M | T-301..T-306 | A-316 |
| T-317 | Plausible events | `packages/ui/src/analytics.ts` | web-engineer | S | T-119 | A-317 |
| T-318 | Trending feed | `apps/web/src/app/api/trending/route.ts` | cms-engineer | M | T-108 | A-318 |
| T-319 | Top Papers This Week | `apps/web/src/components/TopPapersWeek.tsx` | web-engineer | S | T-302 | A-319 |

### D.2 Done definition

`romasbrief.com` resolves to the live reader. Day-14 launch checklist (Launch Plan §8) green. First daily issue lands in subscribers' inboxes Mon–Fri morning at 07:00 ET (publish window per Runbook Phase 7).

---

## E. Phase 4 — Friday Read (M4)

**Window:** Day 15 → Day 21

### E.1 Tasks

| ID | Title | Deliverable file(s) | Owner | Est | Depends | Accept |
|---|---|---|---|---|---|---|
| T-401 | Subagent wired | `.claude/agents/friday-read-editor.md` updates + orchestration glue | editorial-director | S | T-314 | A-401 |
| T-402 | History scaffold | `data/friday_read_history.json` schema + first entry | editorial-director | S | T-401 | A-402 |
| T-403 | Predictions scaffold | `data/friday_read_predictions.json` schema | editorial-director | S | T-401 | A-403 |
| T-404 | Sub-rubric rotation | `packages/editorial/src/friday-rotation.ts` | friday-read-editor | M | T-402 | A-404 |
| T-405 | ROMAS Read component | `packages/ui/src/RomasRead.tsx` | web-engineer | M | T-303 | A-405 |
| T-406 | Thu/Fri lock automation | `workers/friday-lock/src/index.ts` | editorial-director | S | T-401 | A-406 |
| T-407 | First Friday issue | n/a — content artifact | editorial-director | S | T-401..T-406 | A-407 |
| T-408 | Retro + decision log | `AGENT.md §13` append | editorial-director | S | T-407 | A-408 |

### E.2 Done definition

Friday issue ships with one of the four sub-rubrics (Week in Receipts / Five Things / What I Got Wrong / Watch Next Week), rotation tracker updated, post-mortem decision logged.

---

## F. Phase 5 — Weekly Podcast tier (M5)

**Window:** Day 30 → Day 45 (Day 30 hard target — hypothesis awaiting Kimal)

### F.1 Tasks

| ID | Title | Deliverable file(s) | Owner | Est | Depends | Accept |
|---|---|---|---|---|---|---|
| T-501 | Long-form script generator | `packages/audio-pipeline/src/podcast-script.ts` (30–60 min, 4k–8k words) | audio-producer | L | T-205 | A-501 |
| T-502 | Chapter markers + show notes | `workers/podcast-chapters/src/index.ts` | audio-producer | M | T-501 | A-502 |
| T-503 | **DISSOLVED** — full Tier-3 RSS now ships at T-313 on Day 1 per cycle-3 Q2/Q2-A. M5 weekly-podcast launch milestone dissolved into M2 (see cycle-2 scope-lock row at top of this doc). | (closed) | rss-publisher | (closed) | T-313,T-501 | (deprecated) |
| T-504 | Apple + Spotify submission | `docs/operations/podcast-directory-submission.md` | audio-producer | S | T-503 | A-504 |
| T-505 | Post-roll injection | `packages/audio-pipeline/src/postroll.ts` | audio-producer | S | T-501 | A-505 |
| T-506 | First episode ships | n/a — content artifact | audio-producer | S | T-501..T-505 | A-506 |
| T-507 | Listener telemetry | `apps/web/src/analytics/podcast.ts` | web-engineer | S | T-317,T-503 | A-507 |

### F.2 Done definition

Episode 1 live in Apple Podcasts and Spotify directories. Chapter markers present. Show notes attached. Post-roll matches "Not headlines. Clinical intelligence."

---

## G. Phase 6 — Conference Brief (M6)

**Window:** Day 45 → Day 60

### G.1 Tasks

| ID | Title | Deliverable file(s) | Owner | Est | Depends | Accept |
|---|---|---|---|---|---|---|
| T-601 | Subagent wired | `.claude/agents/conference-mode-operator.md` updates + glue | editorial-director | S | T-408 | A-601 |
| T-602 | Embargo-aware path | `workers/ingestion-cron/src/embargo-release.ts` | regulatory-analyst | M | T-107,T-121 | A-602 |
| T-603 | 15–30 min script template | `packages/audio-pipeline/src/conference-script.ts` | audio-producer | M | T-501 | A-603 |
| T-604 | `conference-brief.xml` RSS | `workers/rss-conference-brief/src/index.ts` | rss-publisher | M | T-503 | A-604 |
| T-605 | Embargo-leak detector | `workers/embargo-leak-detector/src/index.ts` | regulatory-analyst | M | T-602 | A-605 |
| T-606 | Dry run | `docs/sign-offs/m6-dryrun.md` (against next ASTRO/ESTRO/AAPM date in calendar) | conference-mode-operator | M | T-601..T-605 | A-606 |
| T-607 | Live-mode flip in CMS | `apps/cms/src/pages/conference-mode.tsx` | cms-engineer | S | T-606 | A-607 |
| T-608 | M6 retro | `docs/sign-offs/m6-retro.md` | editorial-director | S | T-606,T-607 | A-608 |

### G.2 Done definition

Conference Brief dry-run completes with zero embargo leaks. Live-mode flip surfaces in CMS. Conference Brief tier ready to activate during next on-calendar conference.

---

## H. Phase 7 — Auto-publish graduation gate (M7)

**Window:** Day 60 → ongoing
**Note:** Protocol gate. Not an implementation phase. No auto-publish bit flips here.

### H.1 Tasks

| ID | Title | Deliverable file(s) | Owner | Est | Depends | Accept |
|---|---|---|---|---|---|---|
| T-701 | Define graduation criteria | `docs/operations/auto-publish-graduation.md` (correction rate <1% sustained ≥60 days) | editorial-director | S | T-408 | A-701 |
| T-702 | Correction-rate tracker | `supabase/migrations/0013_correction_log.sql` + tracker job | cms-engineer | M | T-103 | A-702 |
| T-703 | Daily metric | `apps/cms/src/pages/metrics/correction-rate.tsx` | cms-engineer | S | T-702 | A-703 |
| T-704 | Decision-log template | `docs/templates/decision-log-entry.md` | editorial-director | S | T-701 | A-704 |
| T-705 | Kimal sign-off requirement | `AGENT.md §4` decision-rights row appended | editorial-director | S | T-701..T-704 | A-705 |

### H.2 Done definition

Graduation criteria documented and tracked. No code path can flip auto-publish without an `AGENT.md §13` decision-log entry signed by Kimal.

---

## I. Cross-cutting concerns

### I.1 Secrets management

- Cloudflare Workers secrets store: `ELEVENLABS_API_KEY`, `ELEVENLABS_ROMAS_VOICE_ID`, `PLAYHT_API_KEY`, `PLAYHT_VOICE_ID`, `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`.
- Service-role keys never reach `apps/web/`. Reader uses Supabase anon key + RLS only.
- Rotation: 90-day cadence for vendor keys; immediate rotation on suspected leak; documented in `docs/secrets-management.md`.

### I.2 Observability

- **Metrics:** Plausible (privacy-first, no PII). Worker logs to Axiom or Logflare.
- **Alerts:** Revocation watchdog (T-212) → email Kimal at 45s; PagerDuty-equivalent at 60s. Source-health daily report (T-120) → Slack/email to editorial-director.
- **Dashboards:** Daily publish counter, correction counter, audio-status distribution, source-fetch success rate.

### I.3 Accessibility

- WCAG 2.2 AA baseline. AudioPlayer keyboard-navigable. Transcripts attached for every Audio Brief, Daily Brief, Podcast, Conference Brief. AudioStatus chip carries `aria-label`.
- M3 audit (T-315) blocks reader-surface ship.

### I.4 Performance

- LCP < 2.5s, INP < 200ms, CLS < 0.1 on article + homepage (T-316).
- AudioPlayer lazy-loads MP3; initial article render does not fetch audio binary.
- RSS feeds cached via Cloudflare for 5 minutes; revoke-invalidates via R2 cache-purge.

### I.5 Compliance

- **HIPAA non-applicability:** ROMAS Wire does not handle PHI. Articles cover regulatory + research + vendor news. No patient data flows.
- **Voice consent:** ElevenLabs and PlayHT cloned-voice consent recorded in `voice_consent_registry` (T-110, T-213). Vendor licence terms attached.
- **EU subscriber GDPR:** subscriber emails + listening telemetry are personal data under GDPR. Supabase project provisioned in EU region (Q6 hypothesis: `eu-west-1`). Plausible analytics is cookie-less. DPA documented.
- **Embargo discipline:** schema-enforced via `embargo_hold` (T-107) + Worker reject path (T-121) + leak detector (T-605). Zero-tolerance.
- **Audio QA gate:** schema constraint on `audio_jobs` state machine (T-104, T-209). Cannot bypass.

### I.6 Anti-patterns (lint-enforced)

- `tools/lint-rules/no-scrape.ts` — fails build on any "scrape" string in code, copy, commits.
- `tools/lint-rules/no-emoji.ts` — fails on emoji in `apps/web/`, `apps/cms/`, copy files.
- `tools/lint-rules/no-hype.ts` — flags "revolutionary", "game-changer", "groundbreaking" outside primary-source quotes.
- `tools/lint-rules/interpretation-label.ts` — any string matching `ROMAS (Insight|Take)` must carry `(interpretation)` label.

---

## J. Glossary

| Term | Meaning |
|---|---|
| Tier 1 | ROMAS Audio Brief — 5/7/10 min per-article |
| Tier 2 | ROMAS Daily Brief — 10–15 min daily roundup (launches Day 14) |
| Tier 3 | The ROMAS Podcast — 30–60 min weekly (launches Day 30 hypothesis) |
| Tier 4 | ROMAS Conference Brief — 15–30 min during conferences |
| QA gate | Inviolable editorial review step; `clinical_claims_checked = true` AND `qa_reviewer IS NOT NULL` AND loudness in band AND transcript present |
| 10-beat structure | Mandatory order for every Audio Brief: opening → background → what → details → why-clinical → physics/dosimetry → AI/tech → limitations → ROMAS Take → source |
| Primary source | The authoritative origin record (FDA 510(k), journal DOI, society guideline, vendor PR). openFDA is discovery, not primary |
| Embargo hold | An item known but locked until release date; never enters publish queue |
| ROMAS Insight | One-line interpretation labeled `(interpretation)` |
| Sponsor firewall | 32px minimum clearance between sponsor block and ROMAS Wire wordmark |

---

## K. Revision history

| Date | Version | Author | Change |
|---|---|---|---|
| 2026-05-14 | 1.0.0 | Delivery Lead persona (/team-plan) | Initial canonical plan merging Launch Plan v1.1 + Runbook v1.1 + Master Strategy v2.1 + Audio Architecture v1.0; 19 audit findings absorbed into M0; Q1/Q2/Q3 hypotheses noted |

---

*Canonical executable plan. `/team-build` runs against this file. Update in same PR as any scope change.*
