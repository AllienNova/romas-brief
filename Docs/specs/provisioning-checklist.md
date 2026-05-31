---
title: ROMAS Wire — Provisioning Checklist (what Kimal must provide)
version: 1.0.0
date: 2026-05-29
status: ACTIVE
companion: Docs/specs/ship-execution-plan.md v1.1.1
purpose: The complete list of credentials, accounts, secrets, legal artifacts, and content that engineering CANNOT produce. Until each is supplied, the SHIP-NN task(s) in the "Unblocks" column stay BLOCKED.
---

# What You Need to Provide

Engineering can implement, unit-test, and typecheck almost the entire backlog **without any of these**. They become hard blockers only at the points noted — chiefly **audio runtime verification (SHIP-27), live email (SHIP-12), deploy (SHIP-31), and the Day-1 content gate (SHIP-32)**. Provide the **🔴 Critical-path** items first; they have the longest lead times (legal + DNS + content production).

> **Secret destination rule** (per `.env.example` + ADR-0002/0003): production secrets live in **Cloudflare Worker Secrets** (`wrangler secret put <NAME>`) and the **Cloudflare Pages env**, NOT in `.env`. The local `.env` is for development only and is gitignored.

---

## A. Credentials & API keys

| # | What to provide | Env var(s) | Destination | Unblocks | Priority |
|---|---|---|---|---|---|
| P-01 | **ElevenLabs Creator-tier API key** (`voices_read` + `text_to_speech` scopes) | `ELEVENLABS_API_KEY` | Worker Secrets (audio-producer) | SHIP-27 runtime audio, gate #13/#14 | 🔴 |
| P-02 | **3 ElevenLabs voice IDs** — select from Creator library, one per tier role; run a smoke test; then sign `Docs/voice-consent-registry.md` | `ELEVENLABS_VOICE_ID_BRIEF`, `..._PODCAST`, `..._CONFERENCE` | Worker Secrets | SHIP-27, gate #14 | 🔴 |
| P-03 | **TTS failover provider** — ⚠️ PlayHT shut down 2025-12-31 (ADR-0018). Pick replacement via **Q-F**: Cartesia (recommended) / Fish Audio / defer | Cartesia: `CARTESIA_API_KEY`, `CARTESIA_VOICE_ID` · Fish: `FISH_AUDIO_API_KEY`, `FISH_AUDIO_REFERENCE_ID` | Worker Secrets | SHIP-14/27 failover path | 🟠 |
| P-04 | **OpenAI key** for Whisper transcription (or confirm `WHISPER_ENDPOINT`) | `OPENAI_API_KEY` | Worker Secrets | SHIP-27 transcript step | 🟠 |
| P-05 | **Beehiiv API key + publication id + webhook signing secret** | `BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID`, `BEEHIIV_WEBHOOK_SECRET` | Worker Secrets (beehiiv-webhook) | SHIP-11 live sync, gate #16 | 🟠 |
| P-06 | **Resend API key + webhook (Svix) secret** | `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET` | Worker Secrets (email-transactional) | SHIP-12 live send | 🟠 |
| P-07 | **DeepL Pro key** (Pro tier — Free's 30-day retention violates workflow) | `DEEPL_API_KEY` | Worker Secrets | LATAM translate — **only if Q-B = yes** | 🟡 |
| P-08 | **Sentry DSN** (new project "romas-brief") | `SENTRY_DSN` | Worker Secrets + Pages env | SHIP-26 ops alerting, gate #19 | 🟠 |
| P-09 | Confirm Supabase keys are current (project provisioned ✅) | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Worker Secrets + Pages env | SHIP-06/08 (mostly done) | 🟢 done |

## B. Infrastructure

| # | What to provide | Detail | Unblocks | Priority |
|---|---|---|---|---|
| P-10 | **Create 2 R2 buckets** | `romas-audio-archive` (private WAV master) + `romas-audio-cdn` (public MP3 via CDN custom domain) | SHIP-27 audio upload | 🔴 |
| P-11 | **R2 access keys** for the buckets | `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` → Worker Secrets | SHIP-27 | 🔴 |
| P-12 | **CDN custom domain** for `romas-audio-cdn` (the code currently hardcodes a placeholder `cdn.romas.brief` — SHIP-15 moves it to `CDN_BASE_URL`; you must point a real domain) | DNS CNAME → R2 public bucket; set `CDN_BASE_URL` | SHIP-15/27/28 | 🟠 |
| P-13 | **Cloudflare API token + zone id** (Workers/Pages/R2/cache-purge scopes) | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID` → CI deploy secrets | SHIP-28 revoke purge, SHIP-31 deploy | 🟠 |
| P-14 | **Resend DNS records** — DKIM + SPF + DMARC for `brief@romasbrief.com` | DNS at registrar | SHIP-12 live send (deliverability) | 🟠 |
| P-15 | **Plausible** site for `romasbrief.com` | `PLAUSIBLE_DOMAIN` (set) | SHIP-24 analytics | 🟡 |
| P-16 | **Vercel/Pages project** rewired to monorepo root, build target `apps/web/` | migrate env vars to consolidated `.env.example`/`SECRETS.md` | SHIP-31 deploy | 🟠 |

## C. Legal / compliance (longest lead — start now)

| # | What to provide | Detail | Unblocks | Priority |
|---|---|---|---|---|
| P-17 | **Beehiiv DPA + SCC** for EU subscribers (GDPR) | execute before first EU subscriber; or launch NA-only (Q-C) | EU acquisition; SHIP-18 erasure scope | 🔴 |
| P-18 | **DPA inventory** — `Docs/DPA-inventory.md` covering all 10 processors (Supabase, Cloudflare, ElevenLabs, PlayHT, Whisper provider, Resend, Beehiiv, DeepL, Plausible, Sentry) | author + countersign | gate #17 readiness | 🟠 |
| P-19 | **Voice consent registry signed** — `Docs/voice-consent-registry.md` (depends on P-02) | Kimal signature | SHIP-27, gate #14 | 🔴 |
| P-20 | **Rotate the local `.env` ElevenLabs key** (NFR-012 — a live key was committed locally) | rotate at ElevenLabs, update Worker Secret | pre-Day-1 hygiene | 🟠 |

## D. Decisions (the 5 open questions — answer to unblock sequencing)

| # | Question | Default if you don't answer | Blocks |
|---|---|---|---|
| Q-A | Confirm or move Day-1 date | Hold 2026-07-07 only with 2–3 parallel eng streams; else 2026-07-21 | Wave 2 start, staffing |
| Q-B | LATAM in Day-1 scope? | No → skip P-07 DeepL from critical path | SHIP scope, P-07 |
| Q-C | NA-only launch if Beehiiv DPA (P-17) slips? | Yes → launch NA-only | SHIP-31/32, P-17 timing |
| Q-D | source-health: fold in cron-ingest or build worker? | Keep folded, delete stub | SHIP-19 |
| Q-E | Friday ROMAS Read on Day-1? (first Friday = day 4) | First 3 Fridays = standard analysis; full format by 2026-07-31 — **needs your sign-off** | Friday Read scope |
| Q-F | TTS failover provider (PlayHT shut down — ADR-0018) | **Cartesia** (recommended) / Fish Audio (cheaper) / ElevenLabs-only Day-1 (defer failover) | SHIP-14, P-03 |

## E. Content (the binding long-pole — KX-9 / editorial)

This is **8 weeks of editorial production**, not an engineering task — it gates the actual launch date regardless of code velocity.

| # | What to provide | Target | Unblocks |
|---|---|---|---|
| P-21 | **500 pre-published articles** across 11 categories × 8 regions × 5 audiences, Signal-Score distribution 50/150/200/80/20, ≥60% within 90 days | daily-rate gate 6–14/day (SSOT §12.6) | gates #1–6, #12 |
| P-22 | **~50 pre-mastered audio episodes** incl. top-10 hero stories | per ramp | gate #13 |
| P-23 | **Tier-3 Podcast episode 001** (30–60 min, 4,500–9,000-word script, fact-checked, physics-reviewed, lexicon-applied, -16 LUFS, transcript) | Day-1 mandatory | gate #14 |
| P-24 | **First 5 daily issues** drafted + queued for live cron handoff | Day-1 | gate #18 |

---

## Fastest-unblock ordering (do these first)

1. **🔴 P-10 + P-11 + P-01 + P-02 + P-19** — R2 buckets + ElevenLabs key + voices + signed consent. Unblocks the entire audio runtime-verify path (SHIP-27) and gate #13/#14.
2. **🔴 P-17** — Beehiiv DPA/SCC (legal lead time); or decide Q-C (NA-only).
3. **🔴 P-21..P-24** — start the 8-week editorial ramp **immediately**; it is the true date-binding constraint.
4. **🟠** everything else can land in parallel with engineering Waves 1–4.

**Engineering needs NOTHING from this list to start.** Waves 1–4 (SHIP-01 through SHIP-25, plus SHIP-28) are fully autonomous-drivable now; the queue only stalls at SHIP-27 (audio runtime, needs P-01/02/10/11), SHIP-31 (deploy, needs P-13/16), and SHIP-32 (launch gate, needs content P-21..24).
