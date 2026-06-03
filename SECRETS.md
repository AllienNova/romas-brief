---
title: ROMAS Brief — Secrets Management Runbook
version: 1.0.0
date: 2026-05-22
status: Canonical operational runbook for secret rotation + storage + breach response
owner: Kimal Honour Djam (president@aliennova.com)
authority_chain: ADR-0008 (observability stack) · ADR-0014 (repo separation, independent deploy posture) · ADR-0015 v2 (no Pages Router, no middleware) · R-112 (remediation-plan M1)
applies_to: every secret consumed by ROMAS Brief production (workers + apps + supabase + 3rd-party APIs)
---

# Secrets Management Runbook

## 0. Purpose

This file is the canonical reference for **where every ROMAS Brief secret lives, how it rotates, and what to do when one is exposed**. It is a runbook — read it during onboarding, refer to it at rotation time, follow it during incident response.

**Never commit secret values to git.** `.gitignore` covers `.env`, `.env.*` (with `!.env.example` carve-out), `*.pem`, `*.key`, `*.crt`. Pre-commit hooks (when R-106 CI lands at `gitleaks` integration in M2) scan staged changes for secret-like strings.

The `.env.example` manifest is the canonical name-list — any new secret added to a Worker, app, or migration MUST also be added to `.env.example` (with empty value).

---

## 1. Secret-store map — where each secret lives

Three primary stores by audience + transport security:

| Store | When to use | Access pattern |
|---|---|---|
| **Cloudflare Worker Secrets** (`wrangler secret put NAME --env production`) | Anything a Cloudflare Worker reads at runtime (cron-ingest, audio-producer, rss-publisher, cdn-purge-watchdog, beehiiv-webhook, email-canary) | `env.NAME` inside the Worker handler |
| **GitHub Actions Secrets** (Repo Settings → Secrets and variables → Actions) | Anything a CI/CD workflow needs (Cloudflare API token for deploys, Supabase access token + DB password for `supabase db push`, Supabase project ref) | `${{ secrets.NAME }}` inside `.github/workflows/*.yml` |
| **Cloudflare Pages Environment Variables** (Pages → Project → Settings → Environment variables → Production / Preview) | Server-side env vars that the Next.js apps read at build OR runtime via `process.env.NAME` (Supabase URL + anon key for the CMS Auth Helper, Plausible domain) | `process.env.NAME` inside server components / route handlers |
| **1Password vault `ROMAS legal`** | Human-readable instruments (signed PDFs, voice consent registry signed copies, vendor DPA/SCC executions) | Out-of-band; Kimal-only |

**Never use `.env` in production.** `.env` files exist for local development ONLY. Production reads from the per-environment store above. The `.env.example` manifest is the union of every name across stores so a fresh developer + a fresh CI environment can both populate from one canonical list.

---

## 2. Per-secret inventory

| Env var name | Type | Store | Consumer | Rotation cadence | Last rotated |
|---|---|---|---|---|---|
| `ELEVENLABS_API_KEY` | API key | Worker Secret | audio-producer worker | 90 days | TBD (first set at R-201) |
| `ELEVENLABS_ROMAS_VOICE_ID` | Identifier (not strictly secret but treated as one) | Worker Secret | audio-producer worker | On voice consent withdrawal | TBD |
| `PLAYHT_API_KEY` | API key | Worker Secret | audio-producer worker | 90 days | TBD |
| `PLAYHT_USER_ID` | Account identifier | Worker Secret | audio-producer worker | On account change | TBD |
| `PLAYHT_ROMAS_VOICE_ID` | Identifier | Worker Secret | audio-producer worker | On voice consent withdrawal | TBD |
| `OPENAI_API_KEY` | API key | Worker Secret | audio-producer worker (Whisper transcription) | 90 days | TBD |
| `SUPABASE_URL` | URL (not strictly secret but treated as one) | Cloudflare Pages env var + Worker Secret | apps/cms + every Worker that writes Supabase | On project re-provision | TBD |
| `SUPABASE_ANON_KEY` | Anon key (designed to be public-readable BUT keep out of client bundle per ADR-0015 v2 server-only auth model) | Cloudflare Pages env var (server-only) + Worker Secret | apps/cms server components + route handlers | On Supabase project recycle | TBD |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (FULL DB ACCESS — NEVER to browser) | Worker Secret + GitHub Actions Secret | All Workers that bypass RLS + deploy-migrations workflow | **30 days** (high-blast-radius secret) | TBD |
| `ROMAS_REVALIDATE_SECRET` | Bearer token | Cloudflare Pages env var (server-only) | apps/web `POST /api/internal/revalidate-board` (NoticeBoard cache tag invalidation) | 90 days | TBD |
| `CLOUDFLARE_ZONE_ID` | Zone identifier (not secret) | Worker Secret | cdn-purge-watchdog (purge by tag scoped to zone) | On zone change | TBD |
| `CLOUDFLARE_API_TOKEN` | API token (Zone:Cache Purge + Workers:Edit + Pages:Edit scopes) | Worker Secret + GitHub Actions Secret | cdn-purge-watchdog + deploy-pages + deploy-workers workflows | **30 days** (high-blast-radius) | TBD |
| `CLOUDFLARE_ACCOUNT_ID` | Account identifier (not secret) | GitHub Actions Secret + `.env` (local) | deploy-pages + deploy-workers + deploy-migrations workflows | On account change | set 2026-06-03 |
| `PAGES_PROJECT_WEB` | Pages project name | GitHub Actions Secret | deploy-pages workflow | On project rename | TBD |
| `PAGES_PROJECT_CMS` | Pages project name | GitHub Actions Secret | deploy-pages workflow | On project rename | TBD |
| `R2_ACCOUNT_ID` | Account identifier (not secret) | Worker Secret + `.env` (local) | R2 S3 endpoint derivation | On account change | set 2026-06-03 |
| `R2_S3_ENDPOINT` | S3 endpoint URL (not secret) | Worker Secret + `.env` (local) | audio-producer R2 SDK | On account change | set 2026-06-03 |
| `R2_ACCESS_KEY_ID` | R2 access key | Worker Secret + `.env` (local) | audio-producer (WAV/MP3 upload) | 90 days | 2026-06-03 |
| `R2_SECRET_ACCESS_KEY` | R2 secret | Worker Secret + `.env` (local) | audio-producer | 90 days | 2026-06-03 |
| `R2_API_TOKEN` | R2-scoped Cloudflare API token (bucket mgmt; NOT zone scope) | Worker Secret + `.env` (local) | R2 bucket create/list/manage | 90 days | 2026-06-03 (token "meliora-empire-upload") |
| `R2_ARCHIVE_BUCKET` | Bucket name (not secret) | Worker Secret | audio-producer | On bucket rename | romas-audio-archive |
| `R2_CDN_BUCKET` | Bucket name (not secret) | Worker Secret | audio-producer + rss-publisher | On bucket rename | romas-audio-cdn |
| `BEEHIIV_API_KEY` | API key (Beehiiv newsletter sends) | Worker Secret | rss-publisher OR new beehiiv worker (R-304) | 90 days | TBD |
| `BEEHIIV_PUBLICATION_ID` | Publication identifier | Worker Secret | rss-publisher / beehiiv worker | On publication change | TBD |
| `BEEHIIV_WEBHOOK_SECRET` | HMAC-SHA256 shared secret | Worker Secret | beehiiv-webhook worker (verifies inbound webhooks) | 90 days | TBD |
| `RESEND_API_KEY` | API key | Worker Secret | rss-publisher (transactional) OR new resend worker | 90 days | TBD |
| `RESEND_WEBHOOK_SECRET` | HMAC shared secret (Resend bounce/complaint webhooks) | Worker Secret | resend-webhook worker (M3) | 90 days | TBD |
| `DEEPL_API_KEY` | API key (Pro tier mandatory per ADR-0013) | Worker Secret | cron-ingest worker (LATAM translation) | 90 days | TBD |
| `SENTRY_DSN` | DSN (not strictly secret but treated as one) | Worker Secret + Cloudflare Pages env var | Every Worker + apps for error reporting | On Sentry project recycle | TBD |
| `PLAUSIBLE_DOMAIN` | Domain (not secret) | Cloudflare Pages env var | apps/web client-side analytics script | On domain change | romasbrief.com |
| `SUPABASE_ACCESS_TOKEN` | Personal access token (CI use only) | GitHub Actions Secret | deploy-migrations workflow (supabase CLI authenticate) | **30 days** | TBD |
| `SUPABASE_PROJECT_REF` | Project identifier | GitHub Actions Secret | deploy-migrations workflow | On project re-provision | TBD |
| `SUPABASE_DB_PASSWORD` | Database password (production) | GitHub Actions Secret | deploy-migrations workflow (`supabase db push`) | **30 days** | TBD |

---

## 3. Rotation policy

### 3.1 Routine rotation

- **Default cadence: 90 days** for API keys + HMAC webhook secrets.
- **High-blast-radius cadence: 30 days** for: `SUPABASE_SERVICE_ROLE_KEY` (full DB bypass), `CLOUDFLARE_API_TOKEN` (Workers/Pages/Cache deploy), `SUPABASE_ACCESS_TOKEN` (CI deploy authority), `SUPABASE_DB_PASSWORD` (production DB).
- **On-event rotation** (immediate): personnel change, suspected exposure, vendor breach notification, GitHub repo permissions change, Cloudflare account permissions change.

### 3.2 Calendar reminders

Maintain in your calendar (Google Calendar or equivalent):
- **Quarterly (90-day) rotation block** — first business day of Q1/Q2/Q3/Q4. Rotate every 90-day-cadence secret in §2.
- **Monthly (30-day) rotation block** — first business day of every month. Rotate the four high-blast-radius secrets.
- **Quarterly Cloudflare WAF + Next 14 CVE review** (per ADR-0015 v2) — combine with the routine rotation block.

### 3.3 Per-secret rotation procedure (general pattern)

1. Generate new value at the vendor (rotate at vendor first; the new value coexists with the old briefly).
2. Update the store named in §2 for that secret (`wrangler secret put` for Workers; GitHub repo Settings for Actions; Cloudflare Pages dashboard for Pages env vars).
3. Verify the new value works in production (touch a low-blast-radius surface; e.g. trigger a single test purge for `CLOUDFLARE_API_TOKEN` rotation).
4. Revoke the old value at the vendor.
5. Update the **Last rotated** column in §2 of this file.
6. Note the rotation in your 1Password "ROMAS legal" vault audit log.

### 3.4 Per-secret-specific notes

- **`SUPABASE_SERVICE_ROLE_KEY` rotation requires Worker re-deploy** because Cloudflare Worker Secrets are bound at deploy time, not read at runtime from a live config service. After `wrangler secret put`, run `wrangler deploy` for every affected worker.
- **`CLOUDFLARE_API_TOKEN` rotation procedure**: create a NEW token at Cloudflare dashboard (Profile → API Tokens → Create Token), copy its value, update all stores, **verify a test deploy succeeds**, then revoke the old token. Never delete the old token before verifying the new one.
- **`SUPABASE_ACCESS_TOKEN`** is a personal access token tied to your Supabase account. If you rotate it, the deploy-migrations workflow stops working until you push the new value into GitHub Actions Secrets.
- **`BEEHIIV_WEBHOOK_SECRET` + `RESEND_WEBHOOK_SECRET`** rotation requires coordination: change the secret in the vendor dashboard, push the new value to Worker Secrets, and accept a brief window where in-flight webhooks signed with the old secret will fail HMAC verification. Schedule the rotation during low-webhook hours (e.g. 02:00 UTC).

---

## 4. 1Password rotation runbook

Maintain a 1Password vault named **`ROMAS legal`** with one item per secret in §2. Each item carries:

- **Item name**: matches the env var name (e.g. `SUPABASE_SERVICE_ROLE_KEY`)
- **Current value**: the latest active value
- **Previous value**: the prior value (kept for 30 days for rollback)
- **Last rotated**: ISO 8601 date
- **Next rotation due**: ISO 8601 date (current + 30 or 90 days)
- **Rotation procedure**: copy of the per-secret-specific notes from §3.4 if any
- **Owner**: typically Kimal (sole signer for ROMAS Brief)
- **Notes**: any vendor-specific quirks or links

When rotating, update the 1Password item BEFORE updating the live store — that way the audit log is canonical even if the live update is interrupted.

---

## 5. Breach response (1-2-3)

If a secret is exposed (accidental commit, leaked screenshot, vendor breach notification, suspicious access log):

### 1 — Revoke (within minutes)

- **Vendor side**: log into the vendor dashboard and revoke the exposed value IMMEDIATELY. Do not wait for replacement.
- **For HMAC secrets**: regenerate at the vendor. Any in-flight webhook signatures will fail validation; acceptable for a few seconds.
- **For database passwords (`SUPABASE_DB_PASSWORD`)**: log into the Supabase project dashboard and rotate. CI deploys will fail until §2 is updated.

### 2 — Rotate (within hours)

- Generate a new value at the vendor.
- Update all stores in §2 for that secret.
- Re-deploy any Workers that bind the secret at deploy time (cycle through `wrangler deploy` for affected workers).
- Verify production traffic on the new value (touch a low-blast-radius surface).
- Update §2 **Last rotated** column.

### 3 — Audit (within days)

- Search Cloudflare Workers Analytics + Sentry + vendor audit logs for any activity using the old value between exposure and revocation.
- If unauthorized activity is found:
  - Document in 1Password "ROMAS legal" vault breach log
  - Notify affected subscribers per GDPR/CCPA timelines (if PII access detected — Beehiiv subscriber data is the highest-impact surface)
  - Consider notification to vendor if their system was the source of the breach
- Add a postmortem entry to `Docs/build/decision-log.md` (next available D-NNN) covering: what was exposed, when, scope of access, what was rotated, what was found in audit
- Update this file if the breach reveals a procedural gap (e.g. extend §2 to cover a previously-missing secret type, add a new rotation-cadence row to §3.1)

---

## 6. Never-commit list

The following file patterns MUST NEVER appear in a commit (enforced by `.gitignore` + CI gitleaks scan when R-106 ships):

- `.env` (any environment except `.env.example`)
- `.env.local`, `.env.production`, `.env.development`
- `*.pem`, `*.key`, `*.crt`, `*.p12`, `*.pfx`
- `wrangler.toml.local`
- `.dev.vars` (Wrangler local dev secrets)
- `.supabase/` (Supabase CLI local state — contains DB credentials)
- Any file matching `**/secrets/**`
- Any file matching `**/*secret*` or `**/*credential*` (case-insensitive)
- Backup files from secret editors (`.env~`, `.env.swp`, `*.bak`)

If you discover a secret in git history (even from a deleted file in an old commit): treat as a §5 breach. Revoke + rotate + audit. Git history rewrite (via `git filter-repo` or BFG Repo-Cleaner) is **NOT** sufficient because forks and clones may have cached the exposed value — vendor-side revocation is the only effective remediation.

---

## 7. CI integration (lands at R-106 / M2)

When `.github/workflows/ci.yml` ships (already authored), add a gitleaks step:

```yaml
- name: gitleaks (secret scan)
  uses: gitleaks/gitleaks-action@v2
  with:
    config-path: .gitleaks.toml
  continue-on-error: false  # block PRs on any secret hit
```

Add `.gitleaks.toml` to repo root covering the patterns in §6. Allowlist `.env.example` (it has no real values, only the manifest).

The current `ci.yml` runs `pnpm audit --audit-level=high` as a continue-on-error informational step per D-025; gitleaks should NOT be continue-on-error — it must block.

---

## 8. Cross-references

- `.env.example` — canonical secret-name manifest
- `Docs/specs/contracts/*.yaml` — per-vendor contract definitions (which secrets each vendor needs)
- `Docs/specs/adr/0008-observability-stack.md` — Sentry DSN consumer
- `Docs/voice-consent-registry.md` — voice ID secrets (`ELEVENLABS_ROMAS_VOICE_ID`, `PLAYHT_ROMAS_VOICE_ID`) link to consent records
- `Docs/specs/adr/0015-next-14-cve-accepted-risk.md` v2 — informs apps/cms env var convention (server-only)
- `Docs/build/decision-log.md` — breach postmortems land here as D-NNN entries
- `.github/workflows/deploy-migrations.yml` + `deploy-pages.yml` + `deploy-workers.yml` — consumers of GitHub Actions Secrets

---

## 9. Revision history

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-05-22 | Initial canonical secrets runbook (R-112 close, /team-build M1-closeout cycle). Covers 27 secrets across 4 stores, rotation cadences (90d standard / 30d high-blast-radius), 1Password vault procedure, breach response 1-2-3, never-commit list, CI gitleaks integration plan. |
| 1.1.0 | 2026-06-03 | Added R2 account/endpoint/API-token rows (`R2_ACCOUNT_ID`, `R2_S3_ENDPOINT`, `R2_API_TOKEN`) for the romaswire R2 provisioning; values stored in local `.env` (gitignored) + `.env.example` manifest updated. R2 S3 access keys + account id marked rotated 2026-06-03. Production stores (Worker Secrets / Pages env) still pending `wrangler secret put`. |
