# ROMAS Wire — Founder's Provisioning Board

**For:** Kimal Honour Djam
**Companion:** `Docs/specs/provisioning-checklist.md` (the index) · `tasks.md` (the eng queue) · `Docs/specs/ship-execution-plan.md` v1.1.1 (the spec)
**Updated:** 2026-05-29

> **How to use this board.** Work **top-down by priority** (🔴 → 🟠 → 🟡). Each item has: what it is, why eng needs it, **numbered steps with links**, **where the resulting secret goes** (env-var name + destination), and a **Done when** check. Engineering needs **nothing here to start Waves 1–4** — these unblock audio runtime (SHIP-27), live email, deploy (SHIP-31), and the Day-1 launch gate (SHIP-32). Start the 🔴 items now; they have the longest lead times (legal + DNS + the 8-week content ramp).

---

## Secret-destination cheat sheet (read once)

Production secrets do **not** go in `.env` (that's local dev only, gitignored). They go in two places:

- **Cloudflare Worker Secrets** — for worker-side keys. From the repo root:
  ```bash
  # run inside the worker dir that uses the secret, e.g. workers/audio-producer
  npx wrangler secret put ELEVENLABS_API_KEY
  # paste the value when prompted
  ```
- **Cloudflare Pages environment variables** — for the reader/CMS (`apps/web`, `apps/cms`): Pages project → **Settings → Environment variables** (set for Production + Preview).
- **GitHub Actions secrets** — for CI/deploy tokens: repo → **Settings → Secrets and variables → Actions**.

Which worker needs which secret is listed per item below. When in doubt, tell me the value is set and I'll wire it.

---

# 🔴 CRITICAL PATH — do these first

## P-00 · Enable GitHub Actions billing for the AllienNova org — *CI is dead until you do*
**Why:** GitHub Actions has **never run** on this repo. Every push/PR since 2026-05-22 fails at `startup_failure`. Diagnosed 2026-05-31 (commit cb5b406): not a code bug — a trivial `echo` workflow also failed. Cause: `AllienNova` is a **GitHub Free-plan org** and `romas-brief` is **private**, so Actions is blocked (exhausted free minutes / no payment method / spending limit at $0). Until fixed, there is **no CI verification** — every merge rests only on the local `agent-verify` gates. Blocks the deploy workflows (`deploy-pages`, `deploy-workers`, `deploy-migrations`) entirely → blocks SHIP-31/SHIP-32 launch.
**Time:** ~5 min.
Pick **one**:
1. **Add billing (recommended):** https://github.com/organizations/AllienNova/settings/billing → add a payment method → set an **Actions spending limit > $0**. Private-repo Actions resume immediately.
2. **Make the repo public:** repo → Settings → General → Danger Zone → *Change visibility → Public*. Actions are free + unlimited for public repos. (Only if the codebase is OK to open-source.)
3. **Self-hosted runner:** repo → Settings → Actions → Runners → *New self-hosted runner*. Free minutes not consumed; you run the compute.
**Done when:** a pushed commit produces a **non-`startup_failure`** run with attributed jobs. Verify: `gh run list --branch main --limit 1` shows a real workflow name + `success`/`failure` (not blank + `startup_failure`).

## P-01 · ElevenLabs Creator API key
**Why:** primary TTS for all audio tiers. Blocks SHIP-27 (audio runtime) + launch gates #13/#14.
**Time:** ~15 min.
1. Create/upgrade an account to the **Creator** plan: https://elevenlabs.io/pricing
2. Generate an API key: https://elevenlabs.io/app/settings/api-keys → **Create API key**. Give it `text_to_speech` + `voices_read` access.
3. Put it in Worker Secrets (used by `audio-producer`):
   ```bash
   cd workers/audio-producer && npx wrangler secret put ELEVENLABS_API_KEY
   ```
**Env var:** `ELEVENLABS_API_KEY` → audio-producer Worker Secret.
**Done when:** key created on Creator tier and stored as a Worker Secret. (Code already targets model `eleven_multilingual_v2`.)

## P-02 · Three ElevenLabs voice IDs (one per tier role)
**Why:** D-032 maps 3 voices to tiers. Blocks SHIP-27 + gate #14.
**Time:** ~30–45 min (auditioning voices).
1. Browse the Voice Library: https://elevenlabs.io/app/voice-library — audition voices that fit a clinical, authoritative read (pace 145–160 wpm target).
2. Pick **three** and add each to your VoiceLab/My Voices. Open each voice → copy its **Voice ID** (a string like `21m00Tcm4TlvDq8ikWAM`).
3. Assign by role:
   - `ELEVENLABS_VOICE_ID_BRIEF` → Audio Brief + Daily Brief (tiers 1+2)
   - `ELEVENLABS_VOICE_ID_PODCAST` → Podcast (tier 3)
   - `ELEVENLABS_VOICE_ID_CONFERENCE` → Conference + Video (tiers 4+5)
4. Store all three as Worker Secrets (audio-producer), same `wrangler secret put` pattern.
**Env vars:** `ELEVENLABS_VOICE_ID_BRIEF`, `ELEVENLABS_VOICE_ID_PODCAST`, `ELEVENLABS_VOICE_ID_CONFERENCE`.
**Done when:** 3 voice IDs chosen, role-assigned, stored. Then complete **P-19** (sign the consent registry with these IDs).

## P-19 · Sign the voice-consent registry
**Why:** compliance gate for using synthetic voices (H-12). Blocks SHIP-27 + gate #14.
**Time:** ~15 min (depends on P-02).
1. Open `Docs/voice-consent-registry.md` in the repo.
2. Fill the `FILL_REQUIRED` fields with the 3 voice IDs from P-02 (provider = ElevenLabs, license terms, consent basis).
3. Add your signature line + date (`— Kimal`, ISO date).
4. Commit the file (I can do this once you give me the values).
**Done when:** registry has no `FILL_REQUIRED` left and is signed.

## P-10 · Create two Cloudflare R2 buckets
**Why:** audio storage. Blocks SHIP-27.
**Time:** ~10 min.
1. Cloudflare dashboard → **R2**: https://dash.cloudflare.com/?to=/:account/r2
2. **Create bucket** ×2 with these exact names:
   - `romas-audio-archive` (private — WAV masters)
   - `romas-audio-cdn` (will get a public custom domain in P-12 — MP3s)
3. R2 docs if needed: https://developers.cloudflare.com/r2/buckets/create-buckets/
**Env vars (already defaulted in `.env.example`):** `R2_ARCHIVE_BUCKET=romas-audio-archive`, `R2_CDN_BUCKET=romas-audio-cdn`.
**Done when:** both buckets exist.

## P-11 · R2 access keys
**Why:** lets workers read/write R2. Blocks SHIP-27.
**Time:** ~5 min.
1. In R2 → **Manage R2 API Tokens**: https://dash.cloudflare.com/?to=/:account/r2/api-tokens → **Create API token** with **Object Read & Write** on the two buckets.
2. Copy the **Access Key ID** + **Secret Access Key** (shown once).
3. Store as Worker Secrets (audio-producer + cdn-purge-watchdog + rss-publisher):
   ```bash
   npx wrangler secret put R2_ACCESS_KEY_ID
   npx wrangler secret put R2_SECRET_ACCESS_KEY
   ```
**Env vars:** `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`.
**Done when:** both keys stored.

## P-17 · Beehiiv DPA + SCC (EU subscribers) — *or* decide Q-C (NA-only)
**Why:** GDPR — required before the first EU subscriber. Longest legal lead time.
**Time:** days–weeks (legal).
1. Request the Data Processing Agreement from Beehiiv: contact support/legal via https://www.beehiiv.com (Help/Support) or your account rep; ask specifically for the **DPA + Standard Contractual Clauses** for EU data transfer.
2. Have it reviewed/countersigned.
3. While that runs, also start **P-18** (DPA inventory of all 10 processors) — see provisioning-checklist §C.
**Decision shortcut:** if this will slip past launch, answer **Q-C = yes (launch NA-only)** and we gate EU acquisition behind the DPA. That removes P-17 from the launch critical path.
**Done when:** DPA+SCC executed, **or** Q-C decided NA-only.

## P-21 → P-24 · Content ramp (the true date-binding constraint) — editorial
**Why:** Day-1 launches with a credibility scaffold; this is **8 weeks of editorial work** that gates the launch date regardless of code speed. Blocks SHIP-32.
**Targets (SSOT §12):**
- **P-21** — 500 pre-published articles: 11 categories × 8 regions × 5 audiences; Signal-Score distribution 50/150/200/80/20; ≥60% within 90 days. **Daily rate 6–14 articles/day.**
- **P-22** — ~50 pre-mastered audio episodes (incl. top-10 hero stories).
- **P-23** — Podcast episode 001: 30–60 min, 4,500–9,000-word script, fact-checked + physics-reviewed, lexicon-applied, mastered to -16 LUFS, transcript.
- **P-24** — first 5 daily issues drafted + queued for live cron handoff.
**Steps:** run the editorial pipeline (the subagents in `.claude/agents/` + the Daily Production Runbook) on the production stack from ~W-2 so real content flows through the real cron + QA gate before launch. The engineering pipeline that produces/QA's this content is what Waves 1–5 build — so eng and content ramp in parallel.
**Done when:** gates #1–6, #12–14, #18 in SSOT §12.8 all pass.

---

# 🟠 INTEGRATIONS — needed for full launch, parallel with eng

## P-03 · TTS failover provider — ⚠️ PlayHT is SHUTDOWN; pick replacement (Q-F)
**Why:** failover when ElevenLabs errors (SHIP-14/27). **PlayHT was shut down 2025-12-31 after Meta's acquisition — its API is gone.** See ADR-0018. **Time:** ~15 min after Q-F decision.
**Recommended: Cartesia** (different vendor than the ElevenLabs primary, API-first, returns WAV the loudnorm path needs).
1. Create account + key: https://play.cartesia.ai/keys → copy key (`sk_car_...`); pick a voice → copy its **Voice ID**.
2. Store (audio-producer): `CARTESIA_API_KEY`, `CARTESIA_VOICE_ID`.
   ```bash
   cd workers/audio-producer && npx wrangler secret put CARTESIA_API_KEY
   ```
**Cheaper alternative — Fish Audio:** https://fish.audio → API key (Bearer) + a `reference_id` voice; env `FISH_AUDIO_API_KEY`, `FISH_AUDIO_REFERENCE_ID`.
**Done when:** Q-F decided and the chosen provider's key + voice id stored. (Old `PLAYHT_*` vars are retired.)

## P-04 · OpenAI key (Whisper transcription)
**Why:** generates transcripts in the audio pipeline (SHIP-27). **Time:** ~5 min.
1. https://platform.openai.com/api-keys → **Create new secret key**.
2. Store (audio-producer): `OPENAI_API_KEY`. (`WHISPER_ENDPOINT` already defaults to the OpenAI transcriptions endpoint.)
**Done when:** key stored.

## P-05 · Beehiiv API key + publication id + webhook secret
**Why:** subscriber sync (SHIP-11) + gate #16. **Time:** ~15 min.
1. API key + publication id: https://app.beehiiv.com → **Settings → Integrations / API** (docs: https://developers.beehiiv.com).
2. Create a webhook → set a signing secret (you choose a strong random string) pointing at the deployed `beehiiv-webhook` worker URL (I'll give you the URL after deploy).
3. Store (beehiiv-webhook): `BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID`, `BEEHIIV_WEBHOOK_SECRET`.
**Status (2026-05-30):** ✅ API key received (⚠️ **rotate before prod** — was exposed in chat; hold securely, never commit) · ✅ Publication ID received (use the V2 `pub_…` form) · ⏳ `BEEHIIV_WEBHOOK_SECRET` pending the deployed worker URL (created after SHIP-11/SHIP-31). Use Beehiiv **API v2**.
**Done when:** all 3 stored as Worker Secrets; webhook created against the deployed worker URL.

## P-06 · Resend API key + webhook (Svix) secret
**Why:** transactional email (SHIP-12). **Time:** ~10 min.
1. API key: https://resend.com/api-keys → **Create API Key**.
2. Webhook signing secret: https://resend.com/webhooks → add endpoint (the deployed `email-transactional` worker URL) → copy the **Svix signing secret**.
3. Store (email-transactional): `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`.
**Done when:** both stored.

## P-14 · Resend DNS (DKIM + SPF + DMARC) for `brief@romasbrief.com`
**Why:** deliverability — without it transactional mail lands in spam. **Time:** ~20 min + DNS propagation.
1. https://resend.com/domains → **Add Domain** `romasbrief.com` → Resend shows the exact DKIM/SPF/DMARC records.
2. Add those records at your DNS provider (the registrar/Cloudflare DNS for `romasbrief.com`).
3. Back in Resend, click **Verify**.
**Done when:** domain shows **Verified** in Resend.

## P-08 · Sentry DSN
**Why:** ops alerting (SHIP-26) + launch gate #19. **Time:** ~10 min.
1. https://sentry.io → create project **romas-brief** (platform: Cloudflare Workers / JavaScript).
2. Copy the **DSN**.
3. Store as Worker Secret (all workers) + Pages env: `SENTRY_DSN`.
**Done when:** DSN stored.

## P-12 · CDN custom domain for the audio bucket
**Why:** public MP3 URLs; the code currently hardcodes a placeholder `cdn.romas.brief` (SHIP-15 replaces it with `CDN_BASE_URL`). **Time:** ~15 min.
1. R2 → bucket `romas-audio-cdn` → **Settings → Custom Domains → Connect Domain** (e.g. `cdn.romasbrief.com`). Docs: https://developers.cloudflare.com/r2/buckets/public-buckets/#custom-domains
2. Tell me the chosen domain → I set `CDN_BASE_URL` in worker config (SHIP-15).
**Done when:** custom domain connected + serving; `CDN_BASE_URL` value decided.

## P-13 · Cloudflare API token + zone id
**Why:** CI deploy of workers + cache purge for the 60s revoke kill-switch (SHIP-28/31). **Time:** ~10 min.
1. API token: https://dash.cloudflare.com/profile/api-tokens → **Create Token** with **Workers Scripts: Edit**, **Cache Purge: Purge**, **Account R2: Edit** (or use the "Edit Cloudflare Workers" template + add cache purge).
2. Zone ID: dashboard → `romasbrief.com` → **Overview** (right sidebar) → copy **Zone ID**.
3. Store as **GitHub Actions secrets** (for deploy workflows): `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`.
**Done when:** both stored in GitHub Actions secrets.

## P-16 · Vercel/Pages rewire to the monorepo
**Why:** the reader now lives in `apps/web/`; the deploy must build from the monorepo (SHIP-31). **Time:** ~20 min.
1. Decide host: **Cloudflare Pages** (per CLAUDE.md §7 tech stack) is the intended target. If currently on Vercel (`romas-brief-web.vercel.app`), either migrate to Pages or point the existing project at the monorepo.
2. For Cloudflare Pages: dashboard → **Workers & Pages → Create → Pages → Connect to Git** → repo `AllienNova/romas-brief`, **root directory** `apps/web`, build `pnpm build`, output `.next` (or the Pages-Next adapter). Docs: https://developers.cloudflare.com/pages/framework-guides/nextjs/
3. Migrate env vars (Supabase, Plausible) into the Pages project env.
4. Tell me the decision (Pages vs Vercel) — I'll align `next.config.mjs` + deploy workflow (SHIP-31).
**Done when:** a deploy from the monorepo `apps/web` serves the reader.

## P-20 · Rotate the local `.env` ElevenLabs key
**Why:** a live key sits in the local `.env` (NFR-012 hygiene). **Time:** ~5 min.
1. At ElevenLabs (P-01 link), **revoke** the old key and create a fresh one.
2. Update the Worker Secret + your local `.env`.
**Done when:** old key revoked, new key in use.

---

# 🟡 CONDITIONAL

## P-07 · DeepL Pro — *only if* LATAM is in Day-1 scope (Q-B)
**Why:** LATAM translation (ADR-0013). Must be **Pro** (Free's 30-day retention violates the workflow). **Time:** ~10 min.
1. https://www.deepl.com/pro-api → subscribe to **API Pro** → copy auth key.
2. Store: `DEEPL_API_KEY`.
**Skip if Q-B = no.** **Done when:** Pro key stored, or Q-B decided "no LATAM Day-1".

## P-15 · Plausible analytics
**Why:** privacy-first analytics (SHIP-24). **Time:** ~10 min.
1. https://plausible.io → add site `romasbrief.com`.
2. `PLAUSIBLE_DOMAIN=romasbrief.com` is already set; add the Plausible script in the reader (I wire it in SHIP-24).
**Done when:** site added.

---

# DECISIONS (answer these to unblock sequencing)

| # | Question | My recommendation | How to record |
|---|---|---|---|
| **Q-A** | ~~Confirm or move the Day-1 date~~ | ✅ **DECIDED 2026-05-31 → full launch, Day-1 ≈ 2026-07-14** (Waves 1–4 done; 8-week content ramp is the binding pole, may slip ~07-21). | Recorded SSOT §12 + ship-plan §1b |
| **Q-B** | LATAM in Day-1 scope? | **No** — launch without LATAM, add it as a fast-follow. Skips P-07. | Reply yes/no |
| **Q-C** | NA-only launch if Beehiiv DPA (P-17) slips? | **Yes** — launch NA-only, gate EU acquisition on the DPA. De-risks the date. | Reply yes/no |
| **Q-D** | source-health: fold into cron-ingest or build a separate worker? | **Fold in** (it already lives in cron-ingest); delete the 501 stub. | Reply; I close SHIP-19 |
| **Q-E** | Friday ROMAS Read on Day-1? (first Friday = day 4 of launch) | First 3 Fridays run as **standard analysis**; full sub-rubric format by **2026-07-31**. Needs your sign-off as an accepted brand compromise. | Reply approve/adjust |
| **Q-F** | TTS failover provider (PlayHT shut down — ADR-0018) | **Cartesia** (best quality/API for a clinical read) · Fish Audio (≈80% cheaper) · ElevenLabs-only for Day-1 (defer failover, accept single-vendor risk) | Reply with the provider; I rework SHIP-14 + flip ADR-0018 → Accepted |
| **Q-G** | Agent framework for the 24/7 marketing / customer-ops layer | ✅ **DECIDED 2026-05-31 → OpenClaw** (security-hardened; 24/7 autonomous marketing+ops team with intelligent multi-LLM routing + cost-opt via Vercel AI Gateway→OpenRouter). Mastra rejected. | Recorded SSOT decision 23 |

### Cycle-7 additions (2026-05-31 — The Imaging Wire template review; see SSOT §3 decisions 20–23)

- **Cadence → twice weekly** (Tue brief + Fri ROMAS Read); launch still ships the 500-article scaffold. *(decision 20)*
- **Audio → email + phone/SMS** for commute listening; SMS is owned by the **OpenClaw** agent layer (NOT a bespoke worker). *(decision 21)*
- **Per-article thumbnail** for all 500 launch articles — content-ramp deliverable (reader + `next/image` ready; DB column added migration 0013). *(decision 22)*
- **New provisioning P-items (Kimal):**
  - **P-25 · Commission OpenClaw** — the security-hardened 24/7 marketing/customer-ops agent layer (LLM routing + cost-opt). Needs its own ADR + threat model before integration (rule 11). Owns SMS + email + marketing + lifecycle; wraps the Beehiiv/Resend transport workers.
  - **P-26 · Google Publisher Center** — register `romaswire.com` (phase-2 domain) / current host; submit `news-sitemap.xml` (built) + `sitemap.xml`. Unblocks Google News indexing (gate §12.8 row 20).
  - SMS provider creds (Twilio-class) flow through **P-25** (OpenClaw), not a standalone item.

---

## Suggested order of attack (this week)

1. **Today:** P-10 + P-11 + P-01 + P-02 (audio path — ~1 hr total) → then P-19 sign-off. Answer **Q-A, Q-B, Q-C, Q-D, Q-E** (10 min).
2. **This week:** kick off **P-17** (legal lead time) and **start the P-21..P-24 editorial ramp** — these are the two longest poles.
3. **As eng reaches Wave 5:** P-13, P-16 (deploy), P-05/P-06/P-14 (live email), P-08 (Sentry), P-12 (CDN domain).
4. **Tell me when a secret is set** (or paste non-secret values like bucket names / domains) and I'll wire each into the workers/config as its SHIP task comes up.

Everything not on this board, engineering drives autonomously starting at SHIP-01.
