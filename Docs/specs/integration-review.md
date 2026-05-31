---
title: Integration Review — ROMAS Wire
version: 1.0.0
date: 2026-05-14
scope: every external system referenced in the planning kit
---

# Integration Review — ROMAS Wire

## Inventory

Documented external surfaces, ordered by criticality:

| # | System | Surface | Direction | Criticality | Contract file |
|---|---|---|---|---|---|
| I-01 | Supabase Postgres + Auth | DB + JWT + RLS | bi-di | P0 | `contracts/supabase-schema.sql` (derived from cms-schema) |
| I-02 | Cloudflare R2 | Object storage | bi-di | P0 | `contracts/cloudflare-r2.md` |
| I-03 | Cloudflare Workers + Pages | Compute + static | inbound + cron | P0 | `wrangler.toml` (M1) |
| I-04 | Cloudflare Cache Purge API | Tag-based purge | outbound | P0 (revoke SLA) | `contracts/cloudflare-cache-purge.yaml` |
| I-05 | ElevenLabs TTS | Voice synthesis | outbound | P0 (Tier 1+) | `contracts/elevenlabs-tts.yaml` |
| I-06 | PlayHT TTS | Voice synthesis (failover) | outbound | P0 (resilience) | `contracts/playht-tts.yaml` |
| I-07 | Whisper transcription | ASR | outbound | P1 (gate on transcript URL) | `contracts/whisper.yaml` |
| I-08 | Resend | Transactional email (signup, unsubscribe receipt, audio-revoke notice, password reset) | outbound | P1 (publish-time + revoke notice) | `contracts/resend.yaml` |
| I-15 | Beehiiv | Newsletter delivery + canonical subscriber list | bi-di (API outbound + webhook inbound) | P1 (publish-time) | `contracts/beehiiv.yaml` |
| I-09 | openFDA | Discovery | outbound | P1 (FR-017) | `contracts/openfda.yaml` |
| I-10 | FDA 510(k) / De Novo / PMA | Primary-source verification | outbound | P0 (Rule 4) | `contracts/fda-510k.yaml` |
| I-11 | EMA + EUDAMED + NB-OG + MDCG (EU primary-source chain) | Regulatory | outbound | P0 (Rule 4 — EU) | `contracts/ema.yaml` *(cycle-5)* |
| I-16 | MHRA UK | Regulatory | outbound | P0 (Rule 4 — UK) | `contracts/mhra.yaml` *(cycle-5)* |
| I-17 | PMDA Japan | Regulatory | outbound | P0 (Rule 4 — Japan) | `contracts/pmda.yaml` *(cycle-5)* |
| I-18 | NMPA China (READ-ONLY per SSOT §3 row 17) | Regulatory | outbound only | P0 (Rule 4 — China) | `contracts/nmpa.yaml` *(cycle-5)* |
| I-19 | TGA Australia | Regulatory | outbound | P0 (Rule 4 — AU/NZ) | `contracts/tga.yaml` *(cycle-5)* |
| I-20 | Health Canada MDALL | Regulatory | outbound | P0 (Rule 4 — Canada) | `contracts/health-canada.yaml` *(cycle-5)* |
| I-21 | ANVISA Brazil + COFEPRIS Mexico + ANMAT Argentina (LATAM regulatory) | Regulatory | outbound | P1 (Rule 4 — LATAM, expanded per cycle-5 region rebalance) | TBD — author M1 |
| I-12 | PubMed, ClinicalTrials.gov, medRxiv, arXiv | Literature | outbound | P1 | `contracts/literature.md` |
| I-13 | Plausible | Analytics | outbound | P2 | (vendor docs only; no contract derived) |
| I-14 | Sentry *(hypothesis)* | Error tracking | outbound | P2 | (vendor docs only) |

## Per-integration assessment

### I-01 Supabase Postgres + Auth

- **Where called**: every Worker, CMS app, reader app via `@supabase/supabase-js`
- **Auth**: anon key (public RLS-respecting), service-role key (Workers only, F-S-006)
- **Failure mode**: retry with backoff, fail-loud on auth errors
- **Idempotency**: writes use Postgres UPSERTs where applicable; `audio_jobs` insertion is idempotent on `(article_id, tier)`
- **Observability**: Supabase dashboard + Workers Analytics Engine
- **PII**: subscribers.email (GDPR-relevant); never PHI
- **Risk**: service-role key blast radius (F-S-006); RLS on every table (cms-schema.md:286)
- **Owner**: cms-engineer

### I-02 Cloudflare R2

- **Where called**: `workers/audio-producer` (upload), `apps/reader` via CDN (read)
- **Auth**: `R2_ACCESS_KEY_ID` + `R2_SECRET_ACCESS_KEY` (S3-compatible)
- **Buckets**: `romas-audio-archive` (private WAV) + `romas-audio-cdn` (public MP3)
- **Failure mode**: retry with exponential backoff; persist failure to `audio_jobs.error`
- **Idempotency**: object keys deterministic (`/YYYY/MM/DD/{slug}__brief.{ext}`); writes are idempotent
- **Observability**: R2 usage metrics + Workers Logpush
- **Risk**: bucket misconfiguration (private/public swap); enforce via wrangler config + CI lint
- **Owner**: cms-engineer + web-engineer

### I-03 Cloudflare Workers + Pages

- **Surfaces**: 4 Workers + 2 Pages projects (reader + CMS)
- **Cron triggers**: `30 10 * * 1-5` (cron-ingest), `* * * * *` (cdn-purge-watchdog)
- **Auth**: Cloudflare Access policy for `/cms` route (email allowlist via Kimal)
- **Failure mode**: tail logs via `wrangler tail`; alerts via Sentry
- **Versioning**: wrangler deploys are versioned; rollback via `wrangler rollback`
- **Owner**: DevOps

### I-04 Cloudflare Cache Purge API

- **Endpoint**: `POST https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache`
- **Auth**: API token with `Cache Purge` scope only (least privilege)
- **Used by**: `workers/audio-producer` (post-publish) + `workers/cdn-purge-watchdog` (revoke)
- **Failure mode**: retry 3x; if still failing, alert via Sentry + email; do NOT silently mark `cdn_purge_at`
- **Idempotency**: purge is idempotent
- **SLA**: 60s from `revoked` flip to CDN withdrawal; watchdog enforces (F-S-001)
- **Observability**: log every purge attempt + response code to Workers Analytics Engine
- **Contract**: `contracts/cloudflare-cache-purge.yaml`
- **Owner**: DevOps

### I-05 ElevenLabs TTS

- **Endpoint**: `POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}` (HTTP, not SDK — F-S-007)
- **Auth**: `xi-api-key` header from `ELEVENLABS_API_KEY`
- **Voice**: `ELEVENLABS_ROMAS_VOICE_ID` (consent registry required — F-S-003)
- **Failure mode**: 3 retries with exponential backoff (1s/4s/16s) on 429/5xx/timeout → failover to PlayHT
- **Idempotency**: stateless; client tracks request ID for retry de-dup
- **Rate limit**: per ElevenLabs tier; document in contract + monitor in Workers Analytics Engine
- **Observability**: log `voice_engine_used`, `request_id`, latency, char count
- **Cost control**: monthly char-cap alert at 80% of quota
- **Contract**: `contracts/elevenlabs-tts.yaml`
- **Owner**: audio-producer

### I-06 PlayHT TTS

- **Endpoint**: `POST https://api.play.ht/api/v2/tts/stream` (HTTP)
- **Auth**: `Authorization: Bearer {PLAYHT_API_KEY}` + `X-User-ID: {PLAYHT_USER_ID}`
- **Voice**: `PLAYHT_ROMAS_VOICE_ID` (consent registry required)
- **Failure mode**: on PlayHT failure → `audio_status = skipped`, log to `audio_jobs.error`; **never block article publish on audio failure**
- **Idempotency**: stateless
- **Observability**: same metrics as I-05
- **Contract**: `contracts/playht-tts.yaml`
- **Owner**: audio-producer

### I-07 Whisper transcription

- **Endpoint**: configurable via `WHISPER_ENDPOINT` env (vendor TBD — OpenAI, Replicate, self-hosted)
- **Model**: large-v3
- **Failure mode**: retry 2x; on persistent failure → block audio publish (transcript URL is mandatory per audio-production-pipeline.md:154)
- **Output**: TXT + SRT, uploaded to R2 alongside audio
- **Contract**: `contracts/whisper.yaml` (TBD when vendor confirmed; OpenAI Whisper API as Q-hypothesis)
- **Owner**: audio-producer

### I-08 Resend

- **Endpoint**: `POST https://api.resend.com/emails`
- **Auth**: `Authorization: Bearer {RESEND_API_KEY}`
- **Used by**: `apps/cms` server actions + `workers/audio-producer` (audio-revocation notice)
- **Scope (per ADR-0007 cycle-2)**: Transactional ONLY — signup confirmation, unsubscribe receipt, audio-revocation public notice, password reset. Newsletter delivery moved to Beehiiv (I-15).
- **Failure mode**: retry 3x; on persistent failure, queue for next-cycle delivery; alert via Sentry
- **Idempotency**: dedupe via tag (e.g., `signup_confirmation_{user_id}`, `revocation_notice_{revocation_id}`)
- **Compliance**: unsubscribe link mandatory; one-click unsubscribe per RFC 8058
- **PII**: subscribers.email; DPA with Resend required
- **Contract**: `contracts/resend.yaml`
- **Owner**: web-engineer + audio-producer (revocation notice)

### I-15 Beehiiv (newsletter delivery + canonical subscriber list, per ADR-0007 cycle-2)

- **Endpoints**: `POST /v2/publications/{pid}/subscriptions` (create) · `PATCH /v2/publications/{pid}/subscriptions/{sid}` (unsubscribe/update) · `POST /v2/publications/{pid}/posts` (issue create)
- **Webhooks** (Beehiiv → ROMAS Wire): `subscription.created`, `subscription.confirmed`, `subscription.unsubscribed`, `subscription.bounced`, `subscription.complained`
- **Auth**: `Authorization: Bearer {BEEHIIV_API_KEY}` (outbound); HMAC-SHA256 signature verification on webhooks with `BEEHIIV_WEBHOOK_SECRET`
- **Used by**: `apps/cms` server actions + `workers/issue-publisher` (queued fan-out) + `workers/beehiiv-webhook` (inbound)
- **Scope**: Newsletter ONLY — daily issue Mon–Thu, Friday Read, Audio Podcast notification (Tier 3), Conference Brief notification (Tier 4)
- **Failure mode**: retry 3x exponential; on persistent failure, queue with dead-letter; never block article publish on email send
- **Idempotency**: `external_id = issue_{YYYY-MM-DD}_{tier}`; 409 on re-publish
- **Subscriber list canonical source**: Beehiiv. Supabase `subscribers` is a mirror; reconciliation job runs daily, alerts on >5 or >0.5% drift
- **Pricing alignment**: free tier ≤2,500 subscribers matches SSOT §3 row 5
- **Compliance**: DPA + GDPR consent + SCC for US-hosted Beehiiv → EU subscribers
- **PII**: subscribers.email + custom_fields
- **Contract**: `contracts/beehiiv.yaml`
- **Owner**: web-engineer + new sub-role TBD (newsletter operations)

### I-09 openFDA

- **Endpoint**: `GET https://api.fda.gov/device/510k.json` and similar
- **Auth**: optional API key (rate-limit boost)
- **Used by**: regulatory-analyst (discovery only — Rule 4)
- **Failure mode**: log to `source_health`; retry next cycle
- **Idempotency**: GETs; cache results
- **Inviolable rule**: openFDA hits MUST be verified against the official FDA 510(k) DB before drafting (`AGENT.md:81-82`)
- **Contract**: `contracts/openfda.yaml`
- **Owner**: regulatory-analyst

### I-10 FDA 510(k) / De Novo / PMA

- **Endpoint**: `GET https://www.accessdata.fda.gov/cdrh_docs/...` and similar
- **Auth**: none (public)
- **Used by**: regulatory-analyst (verification step — Rule 4)
- **Failure mode**: cannot publish without; log to `source_health`; surface in next morning brief
- **Owner**: regulatory-analyst

### I-11 EMA, MHRA, PMDA, NMPA, TGA, Health Canada

- **Endpoints**: varied; documented in `.claude/skills/source-ingestion.md` (canonical after R-007)
- **EU primary-source fallback chain** (per R-014): EUDAMED API → NB-OG register → MDCG official PDF. Never `meddeviceguide.com` as primary.
- **Owner**: regulatory-analyst

### I-12 Literature

- **PubMed**: NCBI E-utilities; optional API key
- **ClinicalTrials.gov**: REST API v2
- **medRxiv**: API + RSS
- **arXiv**: API (q-bio.NC, physics.med-ph)
- **Failure mode**: log + retry next cycle
- **Owner**: editorial-director

### I-13 Plausible & I-14 Sentry

- **Plausible**: cookieless analytics on reader only; outbound only
- **Sentry**: hypothesis for error tracking (ADR-0008); revisit at 10k subscribers
- **DPA**: required for both if EU traffic

## Cross-cutting integration concerns

| Concern | Stance |
|---|---|
| Idempotency | Mandatory on every write; idempotency-key header where vendor supports (Resend, Cloudflare) |
| Retry policy | 3 retries with exponential backoff (1s/4s/16s) for transient (429/5xx/timeout); fail-loud for 4xx |
| Timeout | 15s per outbound source-ingest call; 60s per TTS call; 30s per cache-purge call |
| Circuit breaker | After 5 consecutive failures, mark source `active = false` for the cycle; alert |
| Observability | Every outbound call logs: endpoint, status, latency, request_id, retry_attempt |
| Secrets | Cloudflare Secrets (Workers) + Supabase Vault (DB-side) only; `gitleaks` in CI to catch leaks |
| PII handling | Email only (subscribers); never PHI |
| Compliance | DPA inventory required pre-launch (Supabase, Cloudflare, Resend, ElevenLabs, PlayHT, Whisper provider, Plausible, Sentry) |
| Vendor sunset awareness | Pin API versions in `.env` (e.g., `ELEVENLABS_API_VERSION=v1`); test on vendor version bumps |

## Gaps to close before /team-build M2

1. Author all derived contracts (M1): `contracts/elevenlabs-tts.yaml`, `playht-tts.yaml`, `cloudflare-cache-purge.yaml`, `resend.yaml`, `openfda.yaml`, `fda-510k.yaml`
2. Pin Whisper provider (Q-hypothesis: OpenAI Whisper API at launch; revisit if cost > $X/mo)
3. DPA inventory file at `Docs/DPA-inventory.md` (M1)
4. EU fallback chain documented in `regulatory-analyst.md` (R-014)
5. Voice consent registry signed (R-110)

## Revision history

| Date | Version | Change |
|---|---|---|
| 2026-05-14 | 1.0.0 | Initial integration review. 14 integrations inventoried; contracts derivation list. |
