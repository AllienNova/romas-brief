# ROMAS Brief — Implementation Task List

**Owner:** Kimal Honour Djam
**Agent:** Manus (autonomous-coding mode)
**Skills applied:** autonomous-coding · explore-first · git-safety · danger-zone · pause-conditions
**Last updated:** 2026-05-28

> This file is the source of truth for all in-flight implementation work.
> Status legend: `[ ]` = todo · `[~]` = in progress · `[x]` = done · `[!]` = BLOCKED

---

## Phase 1 — M1 Pre-Requisites (Days 1–3)

These are the gating items that unlock M2 and M3. All are code/config changes inside the working tree — no external provisioning required from this agent.

- [x] **T-P1-01** Upgrade `pnpm audit` gate from `continue-on-error: true` to a hard fail in `ci.yml`
- [x] **T-P1-02** Scrub `meddeviceguide.com` from all docs (banned primary source per SSOT §6 + R-014)
- [x] **T-P1-03** Add voice registry fill-stubs as typed `FILL_REQUIRED` constants in `Docs/voice-consent-registry.md` (operational placeholder — actual IDs are a Track-D/Kimal action)
- [x] **T-P1-04** Update `wrangler.toml` cron triggers from single `30 10 * * 1-5` to the three-edition schedule (APAC 22:00 UTC · EU 06:00 UTC · Americas 11:00 UTC) per SSOT §3 row 16
- [x] **T-P1-05** Wire R2 + Supabase bindings in `wrangler.toml` (uncomment + add `[vars]` block for `SUPABASE_URL`)
- [x] **T-P1-06** Add `packages/shared` skeleton with `RawItem` type + `SourceHealthEntry` type (needed by cron-ingest and rss-publisher)

---

## Phase 2 — M2-A: cron-ingest worker (Days 4–8)

Implement the real ingestion logic in `workers/cron-ingest/src/index.ts`.

- [x] **T-115-A** Define `Env` interface with real bindings (`RAW: R2Bucket`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, voice env vars)
- [x] **T-115-B** Implement PubMed E-utilities fetcher (MeSH radiation oncology filter, last 24h)
- [x] **T-115-C** Implement arXiv fetcher (physics.med-ph + eess.IV, last 24h)
- [x] **T-115-D** Implement ClinicalTrials.gov fetcher (radiation/radiotherapy, new/updated)
- [x] **T-115-E** Implement FDA 510(k) fetcher (with openFDA discovery → official FDA record verification)
- [x] **T-115-F** Implement ASTRO / ESTRO / AAPM news RSS fetchers (society guidelines)
- [x] **T-115-G** Implement dedupe logic (DOI → PMID → URL hash → title fuzzy, per source-ingestion.md)
- [x] **T-115-H** Implement RT relevance keyword filter
- [x] **T-115-I** Implement embargo detection (write to `embargo_holds`, not `articles`)
- [x] **T-115-J** Write `source_health_summary.json` to R2 after each run
- [x] **T-115-K** Implement auth-gated `fetch()` handler (shared-secret header check)
- [x] **T-115-L** Typecheck + build verify (`pnpm turbo run typecheck build --filter=@romas-brief/cron-ingest`)

---

## Phase 3 — M2-B: audio-producer worker (Days 9–14)

Implement the Cloudflare Queues + Consumer pattern for TTS (mandatory per Audio Architecture §2.1.2 — sync Worker times out).

- [ ] **T-202-A** Scaffold `workers/audio-producer/` with `wrangler.toml` (Queue consumer binding) + `package.json` + `tsconfig.json`
- [ ] **T-202-B** Implement Queue producer: `enqueueAudioJob(articleId, audioTier)` — called by cron-ingest after scoring
- [ ] **T-202-C** Implement Queue consumer worker: read `audio_jobs` row, pick voice by `audio_tier` (D-032 mapping)
- [ ] **T-202-D** Implement ElevenLabs TTS call (lift from `smoke-test.mjs` Step 2 — `eleven_multilingual_v2`, voice settings)
- [ ] **T-202-E** Implement PlayHT failover (3 retries with 1s/4s/16s backoff; on exhaustion → `skipped` + `skip_reason`)
- [ ] **T-202-F** Implement ffmpeg two-pass loudnorm (lift from `smoke-test.mjs` Steps 3–6; target -16 LUFS / -1 dBTP)
- [ ] **T-202-G** Implement R2 upload: WAV → `romas-audio-archive/{slug}-master.wav`; MP3 → `romas-audio-cdn/{slug}.mp3`
- [ ] **T-202-H** Implement Whisper transcript call + store URL in `audio_jobs.transcript_url`
- [ ] **T-202-I** Update `audio_jobs` row: set `loudness_lufs`, `true_peak_dbtp`, `transcript_url`, `audio_status = 'in_review'`
- [ ] **T-202-J** Typecheck + build verify

---

## Phase 4 — M2-C: cdn-purge-watchdog + rss-publisher (Days 15–18)

- [ ] **T-211-A** Scaffold `workers/cdn-purge-watchdog/` — Durable Object or Queue consumer watching `revocations` table
- [ ] **T-211-B** Implement 60s SLA enforcement: purge R2 CDN object; alert at 45s; fail/alert at 60s
- [ ] **T-214-A** Scaffold `workers/rss-publisher/` with `wrangler.toml` + `package.json`
- [ ] **T-214-B** Implement `audio-brief.xml` feed (Tier 1 per-article audio)
- [ ] **T-214-C** Implement `daily-brief.xml` feed (Tier 2 daily roundup)
- [ ] **T-214-D** Implement `podcast.xml` feed (Tier 3 weekly, iTunes namespace, episode enclosures)
- [ ] **T-214-E** Implement `conference-brief.xml` feed (Tier 4, activates per conference)
- [ ] **T-214-F** Typecheck + build verify

---

## Phase 5 — M3-A: CMS Audio QA UI (Days 19–23)

- [ ] **T-209-A** Replace CMS `apps/cms/app/page.tsx` stub with real article list page (Supabase query, `status` filter)
- [ ] **T-209-B** Build `apps/cms/app/audio-qa/[id]/page.tsx` — article detail + audio player + QA checklist
- [ ] **T-210-A** Build `AudioQAChecklist` component — 5-condition gate UI (clinical_claims_checked, qa_reviewer, loudness, true_peak, transcript_url)
- [ ] **T-210-B** Build `AudioStatusBadge` component — maps `audio_status` enum to color chip
- [ ] **T-209-C** Implement status flip handler (route handler in `app/api/audio-qa/[id]/route.ts`) — validates 5 conditions before writing `audio_status = 'published'`
- [ ] **T-209-D** Typecheck + build verify

---

## Phase 6 — M3-B: Reader app (Days 24–30)

- [ ] **T-301-A** Replace `apps/web/app/page.tsx` stub with real Homepage (Top Stories grid, region re-rank, subscriber count hidden until 2,500)
- [ ] **T-303-A** Build `apps/web/app/article/[slug]/page.tsx` (≤90 char headline, ROMAS Insight label, AudioPlayer Variant A inline)
- [ ] **T-304-A** Build `apps/web/app/listen/page.tsx` (4-tier audio grid, AudioPlayer Variant B hero)
- [ ] **T-305-A** Build `apps/web/app/category/[slug]/page.tsx` (11 categories)
- [ ] **T-215-A** Build `packages/ui/src/AudioPlayer/VariantA.tsx` (inline-in-article player)
- [ ] **T-216-A** Build `packages/ui/src/AudioPlayer/VariantB.tsx` (Listen-page hero player)
- [ ] **T-312-A** Build `packages/ui/src/SponsorBlock.tsx` (32px firewall enforced)
- [ ] **T-311-A** Build `SubscriberCount.tsx` (hidden until 2,500 threshold)
- [ ] **T-301-B** Implement ADR-0015 CVE mitigations: Zod boundary validation at RSC inputs, body-size cap in `next.config.mjs`
- [ ] **T-301-C** Typecheck + build verify

---

## Phase 7 — M3-C: Beehiiv webhook + Resend transactional (Days 31–35)

- [ ] **T-310C-A** Scaffold `workers/beehiiv-webhook/` — HMAC-SHA256 verify with `BEEHIIV_WEBHOOK_SECRET`
- [ ] **T-310C-B** Implement subscriber state sync (subscribe/unsubscribe/update → Supabase `subscribers` table)
- [ ] **T-310C-C** Implement idempotency on Beehiiv event ID
- [ ] **T-310A-A** Scaffold `workers/email-transactional/` — Resend API client
- [ ] **T-310A-B** Implement signup confirmation email template
- [ ] **T-310A-C** Implement unsubscribe receipt email template
- [ ] **T-310A-D** Implement audio-revocation notice email template
- [ ] **T-310A-E** Typecheck + build verify

---

## BLOCKED items (require Kimal / external action)

- **[!] B-EL** ElevenLabs paid API key with `voices_read` + `text_to_speech` permissions — required for M2-B. Unblock: provision Creator-tier account + add `ELEVENLABS_API_KEY` to Cloudflare Worker Secrets.
- **[!] B-VOICE** Voice IDs for `ELEVENLABS_VOICE_ID_BRIEF`, `ELEVENLABS_VOICE_ID_PODCAST`, `ELEVENLABS_VOICE_ID_CONFERENCE` — requires Kimal to select from Creator-tier library + run smoke test. Unblock: fill `Docs/voice-consent-registry.md` FILL_REQUIRED fields.
- **[!] B-SUPABASE** Live Supabase project provisioning + `supabase gen types typescript --linked` to replace stub `types.ts`. Unblock: provision project, run type gen, commit result.
- **[!] B-R2** Cloudflare R2 bucket provisioning (`romas-audio-archive` + `romas-audio-cdn`). Unblock: create buckets in Cloudflare dashboard.
- **[!] B-BEEHIIV-DPA** Beehiiv DPA + SCC for EU subscribers — Track D / Kimal legal track. Unblock: execute DPA by W-4 end (2026-06-15) or launch NA-only.
- **[!] B-RESEND** Resend domain DKIM/SPF/DMARC for `brief@romasbrief.com`. Unblock: configure DNS records.
