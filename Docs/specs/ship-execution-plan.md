---
title: ROMAS Wire — Consolidated Ship-to-Deployment Execution Plan
version: 1.2.0
date: 2026-05-31
status: ACTIVE — supersedes scattered task tracking for launch sequencing
baseline: HEAD=95f6111 (Wave 1–4 built out; remaining = Wave-5 provisioning/content gated)
critic: team-plan-critic cycle 1 = REVISE REQUIRED (2 P0 / 6 P1) → addressed in v1.1.0; cycle 2 pending
sources_consolidated:
  - ANALYSIS_REPORT.md (RALP audit, 24 tasks / 5 waves)
  - tasks.md (Phases 1–8)
  - Docs/MASTER_IMPLEMENTATION_PLAN.md (M0–M7 T-NNN catalog)
  - Docs/specs/delivery-plan.md
  - Docs/qa/release-checklist.md (32 items)
  - Docs/qa/risk-register.md (B/H/XR/REL)
  - Docs/SSOT.md §12.2–12.8 (Day-1 launch gates + Signal Score distribution)
owner: Kimal Honour Djam
---

# ROMAS Wire — Consolidated Ship-to-Deployment Execution Plan

> **One authoritative ordered backlog.** Every prior task ID (T-NNN, B-XX, RC-NN) maps to a `SHIP-NN` line below or to the deferred list (§6). When `tasks.md`, `MASTER_IMPLEMENTATION_PLAN.md`, or `delivery-plan.md` disagree with this file on launch sequencing, **this file wins**. Status is reconciled against the working tree at `HEAD=95f6111` (refreshed 2026-05-31).

## 0. How to read this

- **Owner codes** — `ENG` engineering (autonomous) · `KX` Kimal-external (credential/legal/infra/decision) · `DOC` documentation · `ED` editorial.
- **Estimate** — rough size: `S` ≤1 day · `M` 2–4 days · `L` 1–2 weeks. Used for the critical-path roll-up (§4c). All estimates are `(hypothesis)` pending eng confirmation.
- **Two tracks run in parallel.** The **engineering critical path** (§4a) is code work. The **content long-pole** (§4b) — 500 articles + ~50 audio over an 8-week ramp — gates the actual Day-1 date.
- **Acceptance** = command output or observable state. No "should work."
- **Definition of public deployment** = SSOT §12.8 18-item gate + ops gate (§5) all green + `team-qa` cycle-7 GO.

## 1. Ground-truth baseline (HEAD=95f6111 · refreshed 2026-05-31)

> **Refreshed after the Wave 1–4 build-out.** The prior baseline (HEAD=dd7f0e0) is obsolete — do not trust earlier "mock only / scorer does not exist / CI RED" claims. Engineering is ~90% done; the launch date is now gated by **non-code** reality (content ramp + provisioning + CI billing), see §4b/§4c.

| Surface | State (HEAD 95f6111) | Implication |
|---|---|---|
| Supabase schema | 11 migrations, RLS deny-by-default, 79 pgTAP; migration 0012 (RLS WITH CHECK) validated via rollback-txn, **apply gated** | ✅ real |
| Signal-scoring engine | **BUILT** — six-axis + composite in `packages/shared/signal-scoring.ts`, 8 unit tests (SHIP-09) | ✅ real |
| `workers/cron-ingest` | 766 LOC; ingest + dedupe + embargo + health | ✅ real; scorer wiring per SHIP-09; runtime-unverified |
| `workers/audio-producer` | 1,214 LOC pipeline; correctness pass (SHIP-14) | ✅ code-complete, **runtime-unverified** (SHIP-27 blocked on P-01/02/10/11) |
| `workers/rss-publisher` · `cdn-purge-watchdog` | 688 / 415 LOC, 4 feeds, 60s SLA | ✅ code-complete |
| `workers/beehiiv-webhook` | **BUILT** (SHIP-11) | ✅ code-complete; live-verify needs P-05 |
| `workers/email-canary` (Resend) | **BUILT** (SHIP-12) | ✅ code-complete; live-verify needs P-06/P-14 |
| `workers/source-health` | decision pending | ❌ SHIP-19 open (Q-D: fold into cron-ingest vs build) |
| `apps/web` reader | 18 routes + components **WIRED TO SUPABASE** (SHIP-08, real data-layer + mock fallback); full WCAG-AA a11y (SHIP-22/22c), `--rb-*` tokens, SVG icon system (SHIP-21), AudioPlayer + AudioStatusBadge (SHIP-23), AVIF/perf/Plausible (SHIP-24) | ✅ launch-grade shell; renders live data when content+env exist |
| `apps/cms` | **audio-QA UI BUILT** (SHIP-10, Rule-6 gate operator) | ✅ Rule-6 surface present |
| `packages/ui` | still a stub (reader components live in `apps/web/components`) | ⚠️ cosmetic — not launch-blocking |
| Tests (JS/TS) | **21+ unit cases** wired to CI `test` (SHIP-17a): markdown-XSS, audio-QA gate, signal-scoring, audio-status + worker suites | ⚠️ unit ✅; integration (17b) blocked on test-DB |
| Ops (SLO/alerting/runbook) | none (Sentry in `.env`, unwired) | ❌ SHIP-26 open (AUTO; live alert needs P-08) |
| CI on `main` (GitHub Actions) | **never executed** — `startup_failure` every run since 2026-05-22. **Confirmed 2026-06-02 (public test, then reverted):** account-level **billing LOCK** on the AllienNova org ("job not started — account locked due to billing"), NOT private-repo minutes; making the repo public does NOT fix it. lint+typecheck+build+audit all **green LOCALLY** via `agent-verify`. | ❌ **#1 launch gate** — clear the org billing lock (P-00) for any GitHub-side verification/deploy |

## 1b. Launch-date reality — Q-A DECIDED 2026-05-31: full launch, target ~2026-07-14

> **DECISION (Kimal, 2026-05-31): Option A — hold the FULL launch.** Original "1 week" (June 7) is dropped; pushed ~1 week beyond the ~July-7 floor → **target ~2026-07-14** (full 500-article scaffold + all editions + 4 audio tiers + SSOT §12.8 gate). The **8-week content ramp is the binding pole** and may extend the date to ~07-21. Product also **renamed from `ROMAS Brief` → ROMAS Wire** (brand/display now; `@romas-brief` package identifiers + `romasbrief.com` domain + repo = gated phase 2). Engineering drains the AUTO queue (SHIP-05/18/19/26/28/29) in parallel; everything else is provisioning/content-gated (§4c).

**Why June 7 was impossible** (retained for the record) — two independent non-code constraints each exceeded one week by 5–7×:

1. **Content scaffold.** SSOT §12 / `500-Article-Launch-Plan.md:42-148` require **500 articles** Day-1; editorial approval throughput is **~10/day (6–14)** and is explicitly "the bottleneck." 500 ÷ 10 ≈ **8 weeks** (mid-July); even at 14/day ≈ 7 weeks. A 5-working-day window yields **~50–70 articles (~10–14%)**. The no-padding rule (`500-plan:204`) forbids faking the count. `ship-execution-plan:§4b` already computed Day-1 ≈ **2026-07-07**; ROMAS Wire ran a **5-week** runway minimum.
2. **Provisioning + dead CI.** Zero production credentials are set; **GitHub Actions has never run** (P-00); the **audio pipeline has never been runtime-verified** (SHIP-27). See §4c critical path.

**Engineering is ~90% done** (Waves 1–4 landed this session). The date is gated by content + provisioning, not code.

**Q-A — Kimal decides (material product fork; do NOT pick autonomously):**
- **Option A — Hold full launch to ~2026-07-07/07-21.** Matches this plan's own arithmetic + FOUNDERS-BOARD Q-A. Full 500-scaffold, all editions, audio. *Recommended.*
- **Option B — Redefine 2026-06-07 as a soft / private, NA-only, descoped launch.** Curated ~50–70 articles (thin category pages accepted), audio best-effort, **EU + LATAM + the 500-scaffold as fast-follows.** Drops Beehiiv DPA (P-17, via Q-C=NA-only) and DeepL (P-07) from the path. This descopes the "comprehensive from Day 1" promise — explicit sign-off required.

Until Q-A is answered, the engineering team drains the **AUTO** queue (§4a): SHIP-05, 18, 19, 26, 28, 29. Everything else is provisioning/content-gated (§4c).

## 2. Engineering backlog (sequential, atomic)

### WAVE 1 — STABILIZE (make CI honest + green, reconcile doc truth)
*Exit gate: `ci.yml` green on a fresh run; status docs match HEAD.*

| ID | Task | Merges | Owner | Est | Deps | Acceptance |
|---|---|---|---|---|---|---|
| SHIP-01 | Bump `next` → ≥15.5.16 in both apps; reconcile `pnpm.overrides`; supersede ADR-0015 | T-P1-01, T-117, B-11 | ENG | M | — | `pnpm audit --audit-level=high` exit 0; `pnpm build` exit 0 |
| SHIP-02 | Lint fix: `<img>`→`next/image` at `academy/page.tsx:196` (sweep all `<img>`) | audit T-1 | ENG | S | — | `pnpm turbo run lint` exit 0 |
| SHIP-03 | Real `lint`/`test` scripts in non-stub packages; expand CI `build` beyond cron-ingest to apps + 4 real workers; wire CI `test` to real tests | T-117, audit T-3 | ENG | M | SHIP-01, SHIP-02 | CI builds apps+workers; no `echo "stub"` in non-stub lint/test |
| SHIP-04 | Doc reconciliation: rewrite `CLAUDE.md §12` to HEAD; flip `tasks.md` Phase 5–8; close `risk-register` B-17/18/20, split B-19; append `qa-report.md` cycle-7; fix `architecture.md` (apps/reader→apps/web, drop packages/db, 10→11) | B-17, T-808/809, audit T-4 | DOC | M | — | grep: no "NOT IN THIS REPO"/"22-line stub"/"UNTRACKED" in §12; architecture.md errors gone |
| SHIP-05 | Repo hygiene: gitignore + remove `*.bundle` (3.4 MB), `_legacy/`, `CLAUDE.md.bak.*`; align dev Node to 20 | audit T-5 | ENG | S | — | `git status` clean of bundles/legacy; `node -v` = 20.x |

### WAVE 2 — COMPLETE (data + scorer + QA gate + email + Day-1 modules)
*Exit gate: a real published article renders at `/article/<real-slug>` ranked by a computed Signal Score; an audio job is QA-flipped to `published` through the CMS; subscriber sync green.*

| ID | Task | Merges | Owner | Est | Deps | Acceptance |
|---|---|---|---|---|---|---|
| SHIP-06 | Regenerate DB types (`supabase gen types typescript --linked`); replace empty `types.ts` + `database.types.ts` | B-SUPABASE follow-on | ENG | S | — | types non-empty; `tsc --noEmit` exit 0 |
| SHIP-07 | Sanitize markdown at `article/[slug]/page.tsx:213` (`rehype-sanitize`/DOMPurify) — lands BEFORE real data | audit #5/T-12 | ENG | S | — | injected `<script>` + `javascript:` URI render inert (unit test) |
| SHIP-08 | Wire reader to Supabase: replace `@/lib/mock-data` with `createPublicSupabaseClient` queries honoring `public_read_published` RLS; `generateStaticParams`→real slugs + `dynamicParams=true` + ISR. **Re-home T-301-B RSC controls: body-size cap in `next.config.mjs` + Zod validation at the public query boundary** | T-301-A/B/C, T-303-A, T-304-A, T-305-A, audit T-6 | ENG | L | SHIP-06, SHIP-07 | `/article/<real-slug>` renders DB content; mock importers = 0; oversized RSC body rejected; Zod rejects malformed query input (tests) |
| SHIP-09 | **Implement six-axis Signal-Scoring engine** (FR-002/FR-003): compute composite per `.claude/skills/signal-scoring` weights; populate `articles.signal_score` in cron-ingest (or dedicated step); unit-test the composite formula; gate-#5 distribution computable from DB | **B-03, FR-002, FR-003** | ENG | L | SHIP-06 | every ingested article gets a score; `SELECT` reproduces §12.2 distribution buckets; composite unit-tested; **closes B-03** |
| SHIP-10 | CMS audio-QA UI (FR-009): article-list, `audio-qa/[id]`, `AudioQAChecklist` (5 conditions), `AudioStatusBadge`, status-flip route validating all 5 before `audio_status='published'` (gated by `audio_qa_flip` RLS) | T-209-A..D, T-210-A/B | ENG | L | SHIP-06 | flip blocked unless all 5 conditions met; integration test proves block + allow |
| SHIP-11 | `beehiiv-webhook`: shared-secret header verify (ADR-0019; Beehiiv has no HMAC), subscriber sync → `subscribers`, idempotency on event id; **DLQ: TTL + retry interval + escalation threshold**; reconciliation worker (>5-row drift alert) | T-310C-A/B/C, T-310/D, RC-20, H-04 | ENG | M | SHIP-06 | bad sig→401; valid event upserts; replay no-op; DLQ holds poisoned event + escalates (tests) |
| SHIP-12 | Resend transactional (rename `email-canary`→`email-transactional` or split): signup/unsub/revocation/reset templates; Svix verify (`RESEND_WEBHOOK_SECRET`); `Idempotency-Key` | T-310A-A..E, T-116, B-09, RC-19, RC-24 | ENG | M | SHIP-06 | each template renders; Svix bad-sig→401; duplicate send deduped (tests) |
| SHIP-13 | **Day-1 homepage data modules (off-Wave-4, now critical path)**: Today's-podcast embed (SSOT §12.3 module 6), Trending (7), Top Papers (8) on real data; Daily Brief roundup worker + `daily-brief.xml` from live issue | T-308, T-309, T-318, T-319, F-008 split | ENG | M | SHIP-08, SHIP-09 | three modules render from DB; daily-brief feed validates against live issue |

### WAVE 3 — HARDEN (correctness FIRST, then tests on corrected code)
*Exit gate: `pnpm test` runs real suites with quantified coverage on corrected code; loudness verified -16 LUFS; integration contracts honored.*

| ID | Task | Merges | Owner | Est | Deps | Acceptance |
|---|---|---|---|---|---|---|
| SHIP-14 | Audio correctness + **failover-provider swap (PlayHT shut down → ADR-0018, pending Q-F)**: declare `LOUDNORM_ENDPOINT` in `Env`; **fail-closed when absent** (no RMS fallback); handle stereo WAV; replace dead PlayHT failover with the Q-F provider (Cartesia default); single failover call; retry 1→3 backoff 2s/8s/30s; exhaustion → `skipped` | audit #8/T-13, RC-18, T-219/220, ADR-0018 | ENG | M | SHIP-08, Q-F | loudness via BS.1770 path or job fails closed; failover calls the chosen provider once on ElevenLabs failure (test); no `playht` references remain |
| SHIP-15 | Worker fixes: RSS `<enclosure length>`=real R2 byte size; fix `/regenerate` branch; `CDN_BASE_URL` env (drop hardcoded `cdn.romas.brief`); Whisper embargo-gate (no audio while `embargoed=true`); **NMPA read-only ingest enforcement (M-02)** | audit T-14, RC-23, M-03, M-02 | ENG | S | SHIP-08 | Apple Podcasts validator passes; invalid tier→400; no audio for embargoed; NMPA source flagged read-only (tests) |
| SHIP-16 | Data-layer hardening: migration 0012 adds `WITH CHECK` to `editor_publish` + `audio_qa_flip` **(+ down-migration)**; audience+region+modality NOT-NULL constraint (gate #8); `AbortSignal.timeout(10000)` on all Supabase calls; cross-edition revocation re-check before each per-region dispatch | audit T-15, RC-21/25, M-01, H-10, gate #8 | ENG | M | SHIP-06 | pgTAP: WITH CHECK rejects unauthorized field writes; 0012 down-migration reverts cleanly; revoked article never dispatched (test) |
| SHIP-17 | **Test pyramid backfill on corrected code**: unit (cron-ingest dedupe/embargo/relevance + scorer; audio-producer TTS/loudnorm/failover; rss-publisher feeds), integration (CMS QA gate, Beehiiv, Resend, revocation race), reader render. Wire CI `test`. **Target ≥60% line coverage on worker business logic + all integration paths above covered** | RC-2, B-02, audit T-11 | ENG | L | SHIP-09..16 | `pnpm test` green on real suites; coverage report ≥60% worker logic; CI `test` green |
| SHIP-18 | **Right-to-erasure endpoint (FR-039, GDPR)**: purge subscriber PII across `subscribers` + Beehiiv + R2 artifacts (**voice-consent revocation→R2 cascade, M-04**) | RC-30, H-08, M-04 | ENG | M | SHIP-06, SHIP-11 | erasure request purges PII end-to-end incl. CDN audio (test); gated on KX-5 DPA scope |
| SHIP-19 | source-health decision (Q-D): keep folded in cron-ingest + delete 35-LOC stub + document, OR build T-120 worker | T-120, Q-D | ENG | S | SHIP-04 | decision recorded in architecture.md; stub resolved; source-health path tested |

### WAVE 4 — POLISH (UI/UX, a11y, brand, perf — deferrable depth)
*Exit gate: dark mode correct on every route; WCAG 2.2 AA pass; zero brand-invariant violations; Web Vitals within budget.*

| ID | Task | Merges | Owner | Est | Deps | Acceptance |
|---|---|---|---|---|---|---|
| SHIP-20 | Token unification: port spec `--rb-*` tokens (incl audio #00B4C6/#F59E0B/#94A3B8) into `globals.css`; `dark:` coverage on all inner routes | T-122, audit T-16 | ENG | M | SHIP-08 | dark mode correct on all routes (screenshots); one token set |
| SHIP-21 | Brand invariants: `SubscriberCount` (hide <2,500 → qualitative); strip emojis from copy; `SponsorBlock` locked labels + 32px firewall | T-311-A, T-312-A, audit T-17 | ENG | M | SHIP-08 | grep: no numeric count, no emoji in copy; `data-firewall=32` enforced |
| SHIP-22 | A11y WCAG 2.2 AA: skip link, homepage `<h1>`, `aria-hidden` decorative icons, ≥44px targets, scrubber `aria-valuetext`+keyboard, modal focus trap/restore, reduced-motion on `RotatingTopStories` | T-315, audit T-18 | ENG | M | SHIP-20 | `design:accessibility-review` AA pass on home/article/listen; axe 0 criticals |
| SHIP-23 | Spec components: `AudioPlayer` Variant A inline + Variant B sticky with QA-gated `audio_status`; `AudioStatusBadge` 6-state; derive real tier/duration; mount or delete `SiteHeader`/`SiteFooter` dead code | T-215-A, T-216-A, T-217, audit T-19 | ENG | M | SHIP-10, SHIP-20 | player shows published/in_review/skipped/revoked; no dead duplicate header |
| SHIP-24 | Performance: AVIF + responsive `srcset` + lazy-load below-fold; Web Vitals LCP<2.5s/INP<200ms/CLS<0.1 on home+article+listen; Plausible events wired | RC-31, T-316/317, H-06, audit T-20 | ENG | M | SHIP-08 | Lighthouse perf ≥90 on home/article/listen; Vitals within budget (report) |
| SHIP-25 | Reader depth (deferrable): pgvector full-text/semantic search (T-307) | T-307 | ENG | M | SHIP-08 | search returns DB hits ranked by relevance |

### WAVE 5 — SHIP (ops, runtime verify, deploy, launch gate)
*Exit gate: SSOT §12.8 18-item gate + ops gate green; `team-qa` cycle-7 GO.*

| ID | Task | Merges | Owner | Est | Deps | Acceptance |
|---|---|---|---|---|---|---|
| SHIP-26 | **Ops readiness**: define SLI/SLO per critical surface (cron success, audio-queue depth, three-edition dispatch completion, reader p95); wire Sentry + ≥1 alert channel; author cold-start incident runbook; status dashboard | F-002, RC-15 (Sentry) | ENG+KX | M | SHIP-03 | a forced cron/queue failure fires an alert (test); runbook exists; SLOs documented |
| SHIP-27 | Runtime-verify audio pipeline end-to-end vs live R2 + ElevenLabs — **incl. one full-length Tier-3 Podcast episode through the Queue consumer** (B-16, gate #14) | T-222, T-202 runtime, B-16, F-007 | ENG | M | SHIP-14, KX-1/2/3 | Audio Brief AND a 30–60 min Tier-3 episode both complete: WAV in archive, MP3 on CDN, transcript, correct LUFS, no sync timeout |
| SHIP-28 | Error/withdrawal pages (404 / **410 "Article withdrawn"** / 500 `error.tsx`); verify 60s revoke kill-switch end-to-end (publish→revoke→CDN withdrawn ≤60s) | audit T-23, T-211/212 | ENG | M | SHIP-08 | revoke removes article+audio from CDN ≤60s (timed test); 410 for revoked slug |
| SHIP-29 | Three-edition publish verify (APAC 22:00 / EU 06:00 / Americas 11:00 UTC); per-region homepage re-rank; wall-clock fits editorial freeze window | T-P1-04 verify, RC-32, H-07 | ENG+KX | M | SHIP-13 | each edition fires at correct UTC; region re-rank observed; wall-clock model attached (H-07) |
| SHIP-30 | Lexicon expansion 30→~80 entries | RC-29, H-11 | ENG+ED | S | SHIP-27 | lexicon applied in TTS; pronunciation spot-check passes |
| SHIP-31 | Vercel/Pages rewire to monorepo `apps/web`; migrate env to consolidated `.env.example`/`SECRETS.md`; archive/freeze `kimhons/romas-brief-web` | T-805/806/807 | ENG+KX | M | SHIP-08, all KX | deployed reader serves live DB content from monorepo build; old repo frozen w/ pointer |
| SHIP-32 | Day-1 launch-readiness gate (SSOT §12.8, 18 checks) + ops gate — final go/no-go | T-314, T-701 protocol | ALL | — | §5 all | all 19 gate rows pass (§5) |
| SHIP-33 | Re-run `team-qa` cycle-7 + `/analyze` for green verdict | T-809 | ENG | M | SHIP-32 | verdict GO; `/analyze` health ≥85 (same scorecard scale as the 55/100 baseline) |

## 3. External / Kimal gate track (parallel — long lead times, start day one)

| ID | Gate | Merges | Blocks | Deadline anchor |
|---|---|---|---|---|
| KX-1 | ElevenLabs Creator key → Worker Secrets | B-EL | SHIP-27, audio | before runtime verify |
| KX-2 | 3 voice IDs + signed `voice-consent-registry.md` | B-VOICE, T-213, RC-13, H-12 | SHIP-27, gate #14 | before runtime verify |
| KX-3 | R2 buckets `romas-audio-archive` + `romas-audio-cdn` | B-R2 | SHIP-27 | before runtime verify |
| KX-4 | Resend DNS DKIM/SPF/DMARC (`brief@romasbrief.com`) | B-RESEND | SHIP-12 prod | before transactional live |
| KX-5 | Beehiiv DPA + SCC (EU) + DPA-inventory (10 processors) | B-10, RC-12 | first EU subscriber, SHIP-18 scope | before EU acquisition |
| KX-6 | DeepL Pro account + **LATAM glossary owner (H-09)** | RC-14, H-01, H-09 | LATAM translate | only if LATAM in Day-1 (Q-B) |
| KX-7 | Rotate local `.env` ElevenLabs key | NFR-012 | — | before Day-1 |
| KX-8 | ADR-0012 video-podcast vendor (Day-30 author) | RC-17, B-04 | Tier 5 (Day 60) | Day 30 — NOT Day-1 |
| KX-9 | Editorial: 500 articles + ~50 audio + podcast ep001 + first 5 issues (8-week ramp, **daily-rate gate 6–14 articles/day per SSOT §12.6**) | gate #1–6,12–14,18 | Day-1 date | the long pole |

## 4. Critical path

### 4a. Engineering critical path
`SHIP-01→02` (CI green) `→ 06` (types) `→ 07→08` (reader on real data + RSC controls) `→ 09` (Signal Score) `→ 10` (QA gate UI) `→ 13` (Day-1 modules) `→ 14/15/16` (correctness) `→ 17` (tests) `→ 26` (ops) `→ 27` (runtime verify) `→ 31` (deploy) `→ 32→33` (launch gate + QA GO).

Off-spine parallel: SHIP-04/05 (docs/hygiene), SHIP-11/12 (email, after 06), SHIP-18/19 (erasure/source-health), Wave 4 polish (after 08), SHIP-28/29/30.

### 4b. Content long-pole (gates the actual date)
`KX-1/2/3 → SHIP-27` and `KX-9` (8-week ramp w/ daily-rate gate) → `SHIP-32`. Day-1 ≈ **2026-07-07 (hypothesis — see Q-A)**.

### 4c. Critical-path duration roll-up (hypothesis — confirm in eng review)
Spine estimates: 01(M)+02(S)+06(S)+07(S)+08(L)+09(L)+10(L)+13(M)+14(M)+15(S)+16(M)+17(L)+26(M)+27(M)+31(M)+33(M). Summing S=0.5d, M=3d, L=10d midpoints = 4×L(08,09,10,17) + 8×M(01,13,14,16,26,27,31,33) + 4×S(02,06,07,15) = 40+24+2 ≈ **~66 working days** of serialized critical-path work if single-threaded. With 2–3 parallel eng streams the wall-clock compresses to **~5–7 weeks** — which **collides with a 2026-07-07 target (~5.5 weeks out)**. **This is tight; Q-A must confirm or move the date.** The content ramp (KX-9) is independently ~8 weeks and may be the true binding constraint.

## 5. Day-1 launch-readiness gate (SSOT §12.8 + ops)

| # | Check | Owner | Closed by |
|---|---|---|---|
| 1 | 500 articles approved + queued | ED | KX-9 |
| 2 | 11 categories ≥ min allocation | ED | KX-9 |
| 3 | 8 regions non-zero | ED | KX-9 |
| 4 | 5+ audience filters ≥30 each | ED | KX-9 |
| 5 | Signal Score dist 50/150/200/80/20 (computed, not hand-assigned) | signal-scorer | **SHIP-09** |
| 6 | "Today's podcast" homepage module live | web-eng | **SHIP-13** |
| 7 | Every article primary-source URL inline | schema | done (CHECK) |
| 8 | audience+region+modality tags present | ENG | **SHIP-16** (NOT-NULL constraint) |
| 9 | Every interpretation labeled | schema | done |
| 10 | Zero `meddeviceguide.com`/`MDCG.eu` primary | regulatory | SHIP-04 (B-05 verify) |
| 11 | Zero embargoed-2026-conference items in queue | conference-op | cron-ingest + SHIP-15 |
| 12 | Editorial correction rate <1% (pilot) | ED | KX-9 pilot week |
| 13 | Top-10 hero stories have audio | audio-producer | SHIP-27 + KX-9 |
| 14 | Tier-3 Podcast episode 001 ready (full-length, queue-verified) | audio+Kimal | KX-9 + **SHIP-27** |
| 15 | 4 audio RSS feeds valid + `video-podcast.xml` skeleton | rss-publisher | SHIP-15 + skeleton |
| 16 | Beehiiv list synced + reconciliation green | web-eng | SHIP-11 |
| 17 | `.env.example` + `SECRETS.md` complete + keys provisioned | DevOps/KX | KX-1..7 |
| 18 | First 5 issues drafted + queued for cron handoff | ED | KX-9 |
| 19 | **Ops: SLOs defined, Sentry + alerting live, cold-start runbook exists** | ENG | **SHIP-26** |

## 6. Deferred — explicitly OUT of Day-1 scope (do not block launch)

| Item | Source | When | Why deferred |
|---|---|---|---|
| Tier 5 Video Podcast | T-651..660, B-04, KX-8 | **Day 60** | Locked Day-60 (SSOT §3 row 6); needs ADR-0012 (Day 30) |
| Friday ROMAS Read full sub-rubric format | T-401..408 (M4) | by 2026-07-31 (see Q-E) | First Fridays run as standard analysis; full format needs Kimal sign-off — **not a bare "fast-follow"** |
| Conference Brief live-mode workflow | T-601..608 (M6) | per-conference | `conference-brief.xml` valid Day-1 (SHIP-15); content activates at next covered conference |
| Auto-publish graduation gate | T-701..705 (M7) | Day ~90 | Manual QA gate (SHIP-10) is the Day-1 control |
| Migration 0013 `correction_log` | T-702 | with M7 / first correction | Not needed pre-launch |
| Second audio_qa reviewer | release-checklist | Day 30 | Kimal solo at launch (D-023); no schema change |
| FR-S-003 / FR-S-005 (B-14) | risk-register B-14 | post-launch | SHOULD-level; no Day-1 dependency |
| pgvector search depth | SHIP-25 | Wave 4 (best-effort Day-1) | Basic browse works without it; search is enhancement |

## 7. Open questions (Kimal decision; defaults proposed)

| # | Question | Proposed default (hypothesis) | Deadline |
|---|---|---|---|
| Q-A | Confirm/move Day-1 date given §4c tightness | Hold 2026-07-07 only if 2–3 parallel eng streams staffed; else move to 2026-07-21 | before Wave 2 |
| Q-B | LATAM in Day-1 scope? (drives KX-6) | No — LATAM fast-follow; drop KX-6 from Day-1 critical path | before Wave 2 |
| Q-C | NA-only launch if Beehiiv DPA (KX-5) slips? | Yes — launch NA-only, gate EU acquisition on DPA | before Wave 5 |
| Q-D | source-health: fold in cron-ingest (delete stub) or build T-120? | Keep folded; delete stub; document | SHIP-19 |
| Q-E | Friday Read on Day-1? (first Friday = 2026-07-10, day 4 of launch) | First 3 Fridays = standard analysis; full sub-rubric format by 2026-07-31 — **needs Kimal sign-off as accepted brand compromise** | before first Friday |
| Q-F | TTS failover provider — PlayHT shut down 2025-12-31 (ADR-0018) | **Cartesia** (recommended) / Fish Audio (≈80% cheaper) / ElevenLabs-only Day-1 (defer failover, accept single-vendor risk) | before SHIP-14 |

## 8. Revision History

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-05-29 | 1.0.0 | Initial consolidation: 29 eng tasks + 9 external gates + 18-item gate + deferred set. | team-planning |
| 2026-05-29 | 1.1.0 | Addressed team-plan-critic cycle 1 (2 P0 / 6 P1 / 4 P2): added SHIP-09 signal scorer (F-001/B-03) + SHIP-26 ops readiness (F-002) to critical path; added Estimate column + §4c duration roll-up (F-003); re-sequenced Wave 3 so tests (SHIP-17) follow correctness fixes (F-004); re-homed T-301-B RSC controls into SHIP-08 (F-005); added Q-E Friday Read sign-off (F-006); SHIP-27 now verifies full Tier-3 episode (F-007); split Day-1 homepage modules to SHIP-13 on critical path (F-008); migration 0012 down-path + DLQ spec + erasure/source-health split (F-009/10/11); mapped M-02/M-04/H-09/B-14 (F-012). Gate now 19 rows incl. ops. | team-planning |
| 2026-05-29 | 1.1.1 | team-plan-critic cycle 2 = **APPROVE WITH CONDITIONS** (0 P0 / 0 P1). Applied both P2 conditions: §4c roll-up corrected ~58→~66 working days (F-201); §1 baseline corrected 84→79 pgTAP assertions (F-202). **Finalization gate CLOSED.** | team-planning |
| 2026-05-30 | 1.1.2 | **PlayHT shut down 2025-12-31** (Meta acquisition) — TTS failover provider dead. Added ADR-0018 (Proposed); reworked SHIP-14 to swap the failover to the Q-F provider (Cartesia default, Fish Audio alt — both API-verified current); added Q-F; updated provisioning P-03 + FOUNDERS-BOARD. ElevenLabs primary unchanged. | team-planning |
