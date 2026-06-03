---
title: ROMAS Wire — R2 Storage & Audio CDN Provisioning Runbook
version: 1.0.0
date: 2026-06-03
owner: Kimal Honour Djam (president@aliennova.com)
status: Operational runbook — follow top-to-bottom for a fresh Cloudflare account
authority: CLAUDE.md §7 (tech stack) · SECRETS.md (secret stores) · ADR-0003 (Cloudflare)
applies_to: romas-audio-archive (private WAV) + romas-audio-cdn (public MP3/transcripts)
---

# R2 Storage & Audio CDN — Provisioning Runbook

The audio pipeline writes two R2 buckets. This runbook stands them up **intentionally**
for a production news site: private master archive, public CDN with a custom domain,
CORS for in-browser audio seeking, lifecycle hygiene, least-surprise security posture,
and a clean rollback. Run it once per Cloudflare account, then refer to it at audit time.

> **Credentials are already in `.env` (gitignored)** — account `b5d2…c929`, S3 access
> keys, and the object-scoped `R2_API_TOKEN` ("meliora-empire-upload"). See SECRETS.md §2.

---

## 0. Architecture (what we're building)

```
audio-producer (Worker)                  rss-publisher (Worker)        Reader (apps/web)
   │  env.AUDIO_ARCHIVE.put(WAV)            │ reads CDN_BASE_URL          │ <audio src=CDN…>
   │  env.AUDIO_CDN.put(MP3, transcript)    │                            │  (Range requests)
   ▼                                        ▼                            ▼
┌─────────────────────────┐      ┌──────────────────────────────────────────────┐
│ romas-audio-archive      │      │ romas-audio-cdn                                │
│ PRIVATE · WAV masters    │      │ PUBLIC (custom domain) · MP3 + transcripts     │
│ no public access         │      │ CORS (GET/HEAD + Range) · cache-purgeable      │
│ retained (consent record)│      │ retained · revocation via cdn-purge-watchdog  │
└─────────────────────────┘      └──────────────────────────────────────────────┘
```

**Key design facts:**
- Workers reach R2 through **native bindings** (`[[r2_buckets]]` in `wrangler.toml` →
  `env.AUDIO_ARCHIVE` / `env.AUDIO_CDN`). They do **not** use the S3 access keys.
- The **S3 access keys** (`R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`) are for S3-API
  access — local tooling (`tools/audio/smoke-test.mjs`) and any non-Worker process.
- The archive is **private** (never public). Only the CDN bucket is public.

---

## 1. Authentication (do this first)

Bucket admin — create / CORS / lifecycle / domain — are **account-level R2 admin**
operations. The object-scoped `R2_API_TOKEN` + S3 keys in `.env` are **not** sufficient
for admin. Authenticate with one of:

```bash
npx wrangler login                      # interactive OAuth (recommended)
# — or — an account-scoped token with "Account · R2 Storage · Edit":
export CLOUDFLARE_API_TOKEN=<R2:Edit token>
export CLOUDFLARE_ACCOUNT_ID=$(grep '^CLOUDFLARE_ACCOUNT_ID=' .env | cut -d= -f2)   # from gitignored .env
```

Confirm: `npx wrangler r2 bucket list` returns without an auth error.

---

## 2. Provision the buckets (one command)

```bash
bash scripts/provision-r2.sh
```

Idempotent. It creates both buckets if absent, applies CORS to the CDN bucket
(`infra/r2/cors-cdn.json`), and adds the abort-incomplete-multipart lifecycle rule to
both. Re-runnable safely. See the script header for what each step does.

**Manual equivalent** (if you prefer step-by-step):

```bash
npx wrangler r2 bucket create romas-audio-archive
npx wrangler r2 bucket create romas-audio-cdn
npx wrangler r2 bucket cors set romas-audio-cdn --file infra/r2/cors-cdn.json -y
npx wrangler r2 bucket lifecycle add romas-audio-archive abort-incomplete-mpu "" --abort-multipart-days 7 -y
npx wrangler r2 bucket lifecycle add romas-audio-cdn     abort-incomplete-mpu "" --abort-multipart-days 7 -y
```

---

## 3. Public access for the CDN bucket (custom domain)

Production serves audio from **`https://cdn.<your-domain>`** bound to the CDN bucket.
This is what `CDN_BASE_URL` must equal in every worker.

> **Decide the domain first.** Repo signals point to `romasbrief.com` (PLAUSIBLE_DOMAIN,
> the Beehiiv handle). Use `cdn.romasbrief.com` unless you're standing the site up on a
> different apex — then substitute throughout. Do **not** use the rate-limited `r2.dev`
> URL in production.

```bash
# The zone must already exist in this Cloudflare account (the apex domain is onboarded).
npx wrangler r2 bucket domain add romas-audio-cdn \
  --domain cdn.romasbrief.com \
  --zone-id "$CLOUDFLARE_ZONE_ID"
```

Then set `CDN_BASE_URL=https://cdn.romasbrief.com` in the `[vars]` of every worker that
references it (`rss-publisher`, `cdn-purge-watchdog`, and audio-producer if it builds
absolute URLs). The current placeholder is `https://cdn.romas.brief` — replace it.

Dev/preview only (never prod): `npx wrangler r2 bucket dev-url enable romas-audio-cdn`.

---

## 4. Per-worker secrets matrix

R2 bucket access is via bindings (no secret). These are the OTHER secrets each worker
needs at deploy. Set with `npx wrangler secret put NAME` **inside each worker dir**, then
`npx wrangler deploy`. (Secrets bind at deploy time — re-deploy after any rotation.)

| Worker | Secrets to set |
|---|---|
| `audio-producer` | `ELEVENLABS_API_KEY`, `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (+ TTS failover key) |
| `rss-publisher` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| `cdn-purge-watchdog` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, **`CF_PURGE_API_TOKEN`** (zone · Cache Purge), `CLOUDFLARE_ZONE_ID` |
| `notice-scheduler` | `SUPABASE_SERVICE_ROLE_KEY`, `ROMAS_REVALIDATE_SECRET` (+ `REVALIDATE_BOARD_URL` var) |
| `cron-ingest` | `SUPABASE_*`, source/API keys per its wrangler.toml |

> **`CF_PURGE_API_TOKEN` is NOT the R2 token.** Cache purge needs a **zone-scoped**
> token with "Zone · Cache Purge". The `R2_API_TOKEN` ("meliora-empire-upload") is
> object-scoped and cannot purge cache. Mint the purge token when you onboard the zone.

Account id for deploys: `export CLOUDFLARE_ACCOUNT_ID=$(grep '^CLOUDFLARE_ACCOUNT_ID=' .env | cut -d= -f2)`
(or pin `account_id` in each `wrangler.toml` — it's an identifier, not a secret).

---

## 5. Deploy the workers (binds the buckets)

```bash
for w in audio-producer rss-publisher cdn-purge-watchdog notice-scheduler; do
  ( cd "workers/$w" && npx wrangler deploy )
done
```

The `[[r2_buckets]]` bindings in each `wrangler.toml` attach the live buckets at deploy.

---

## 6. Pages projects (reader + CMS)

Separate from R2. Needs a **Workers/Pages-scoped** token (not the R2 token).

```bash
npx wrangler pages project create romaswire-web --production-branch main
npx wrangler pages project create romaswire-cms --production-branch main
```

Set the GitHub Actions secrets `PAGES_PROJECT_WEB` / `PAGES_PROJECT_CMS` (SECRETS.md §2)
to these names so the deploy workflows target them.

---

## 7. Verification

```bash
npx wrangler r2 bucket list                              # both buckets present
npx wrangler r2 bucket cors list romas-audio-cdn         # GET/HEAD + Range origins
npx wrangler r2 bucket lifecycle list romas-audio-cdn    # abort-incomplete-mpu rule
npx wrangler r2 bucket domain get romas-audio-cdn        # custom domain active
# end-to-end: an audio range request returns 206 with Accept-Ranges
curl -sI -H "Range: bytes=0-1" "https://cdn.romasbrief.com/<a-known-mp3>" | grep -iE 'HTTP|accept-ranges|content-range'
```

Local S3 tooling sanity (uses the `.env` access keys, not the bindings):
`node tools/audio/smoke-test.mjs` (probes ElevenLabs + the R2 S3 endpoint).

---

## 8. Security posture (what makes this professional)

- **Archive is never public** — WAV masters + the voice-consent record stay private.
  Only `romas-audio-cdn` is reachable from the internet.
- **CORS is scoped** to the reader origins + `GET`/`HEAD` only (no write from the browser),
  with `Range`/`Content-Range`/`Accept-Ranges` exposed so the `<audio>` element can seek.
- **No access keys in Workers** — bindings give scoped, key-less access; the S3 keys live
  only in `.env` (gitignored) for local tooling.
- **Least privilege**: the upload token is object-scoped; admin needs a separate session;
  cache purge needs a separate zone token. No single token can do everything.
- **Revocation path**: audio is killed via `cdn-purge-watchdog` (60s SLA), not lifecycle.
- **Rotation**: S3 keys + tokens on the SECRETS.md cadence (90d standard).

---

## 9. Rollback

```bash
# Remove CORS / lifecycle (config only — non-destructive to objects):
npx wrangler r2 bucket cors delete romas-audio-cdn
npx wrangler r2 bucket lifecycle remove romas-audio-cdn --id abort-incomplete-mpu

# Disconnect the custom domain (audio URLs stop resolving — coordinate with the reader):
npx wrangler r2 bucket domain remove romas-audio-cdn --domain cdn.romasbrief.com

# Deleting a bucket requires it be EMPTY and is destructive — never as a rollback step
# for a live bucket. Empty + delete only for a mistaken bucket name:
#   npx wrangler r2 bucket delete <mistaken-name>
```

---

## 10. Cross-references

- `scripts/provision-r2.sh` — the idempotent provisioner this runbook drives.
- `infra/r2/cors-cdn.json` — the CORS rule applied to the CDN bucket.
- `SECRETS.md` §2 — secret inventory + stores + rotation cadence.
- `.env.example` — canonical var-name manifest (CLOUDFLARE_*, R2_*).
- `workers/audio-producer/wrangler.toml` — the `[[r2_buckets]]` bindings.
- CLAUDE.md §7 — tech-stack source of truth (R2 bucket roles).
