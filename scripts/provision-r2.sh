#!/usr/bin/env bash
# =====================================================================
# provision-r2.sh · ROMAS Wire — idempotent R2 bucket provisioning
#
# Stands up the two audio buckets + their professional config:
#   romas-audio-archive  — PRIVATE WAV masters (no public access, retained)
#   romas-audio-cdn      — PUBLIC MP3 + transcripts (CORS + custom domain)
#
# Idempotent: re-running skips buckets that already exist and re-applies CORS
# + lifecycle (declarative). Safe to run repeatedly.
#
# AUTH: bucket create / cors / lifecycle / domain are R2 *admin* operations —
# they need either `wrangler login` (OAuth, recommended) OR an account-scoped
# API token with "Account · R2 Storage · Edit". The S3 access keys + the
# object-scoped R2_API_TOKEN in .env are for object upload (audio-producer +
# local tooling), NOT for bucket admin. Authenticate before running:
#     npx wrangler login            # interactive OAuth (recommended)
#   or
#     export CLOUDFLARE_API_TOKEN=<account R2:Edit token>
#     export CLOUDFLARE_ACCOUNT_ID=<account id>
#
# Custom-domain + dev-url steps are commented (they need your real domain +
# zone id) — uncomment after deciding the CDN hostname. See
# Docs/ops/r2-provisioning.md for the full runbook.
# =====================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# ── Load bucket names from .env (fallback to canonical defaults) ──────────────
ARCHIVE_BUCKET="$(grep -E '^R2_ARCHIVE_BUCKET=' .env 2>/dev/null | head -1 | cut -d= -f2- || true)"
CDN_BUCKET="$(grep -E '^R2_CDN_BUCKET=' .env 2>/dev/null | head -1 | cut -d= -f2- || true)"
ARCHIVE_BUCKET="${ARCHIVE_BUCKET:-romas-audio-archive}"
CDN_BUCKET="${CDN_BUCKET:-romas-audio-cdn}"

WRANGLER="npx wrangler"
CORS_FILE="infra/r2/cors-cdn.json"

echo "▶ ROMAS Wire R2 provisioning"
echo "  archive (private): $ARCHIVE_BUCKET"
echo "  cdn (public):      $CDN_BUCKET"
echo

# ── Helper: create a bucket only if it doesn't already exist ──────────────────
bucket_exists() { $WRANGLER r2 bucket list 2>/dev/null | grep -qiE "(^|[^a-z0-9-])$1([^a-z0-9-]|$)"; }

ensure_bucket() {
  local name="$1"
  if bucket_exists "$name"; then
    echo "  ✓ $name already exists — skipping create"
  else
    echo "  + creating $name"
    $WRANGLER r2 bucket create "$name"
  fi
}

# ── 1. Buckets ────────────────────────────────────────────────────────────────
echo "1) Buckets"
ensure_bucket "$ARCHIVE_BUCKET"
ensure_bucket "$CDN_BUCKET"
echo

# ── 2. CORS — public CDN bucket only (audio seeking via Range requests) ───────
echo "2) CORS (CDN bucket)"
$WRANGLER r2 bucket cors set "$CDN_BUCKET" --file "$CORS_FILE" -y
echo "  ✓ CORS applied from $CORS_FILE"
echo

# ── 3. Lifecycle ──────────────────────────────────────────────────────────────
# Hygiene only — abort orphaned/incomplete multipart uploads after 7 days on
# BOTH buckets. WAV masters in the archive are RETAINED (no expiry — legal /
# voice-consent record). Published MP3s in the CDN are also retained (the board
# references them indefinitely); revocation is handled by the cdn-purge-watchdog,
# not lifecycle.
echo "3) Lifecycle (abort incomplete multipart uploads after 7d)"
$WRANGLER r2 bucket lifecycle add "$ARCHIVE_BUCKET" abort-incomplete-mpu "" --abort-multipart-days 7 -y || \
  echo "  (rule may already exist — ok)"
$WRANGLER r2 bucket lifecycle add "$CDN_BUCKET" abort-incomplete-mpu "" --abort-multipart-days 7 -y || \
  echo "  (rule may already exist — ok)"
echo

# ── 4. Public access for the CDN bucket ──────────────────────────────────────
# PROFESSIONAL: bind a custom domain (https://cdn.<your-domain>) — uncomment and
# set CDN_DOMAIN + CLOUDFLARE_ZONE_ID. This is what CDN_BASE_URL must match in
# every worker (rss-publisher, cdn-purge-watchdog, audio-producer).
#
#   CDN_DOMAIN="cdn.romasbrief.com"
#   $WRANGLER r2 bucket domain add "$CDN_BUCKET" --domain "$CDN_DOMAIN" --zone-id "$CLOUDFLARE_ZONE_ID"
#
# DEV-ONLY alternative (rate-limited r2.dev URL — do NOT use in production):
#   $WRANGLER r2 bucket dev-url enable "$CDN_BUCKET"
echo "4) Public access — see commented custom-domain step (needs your CDN host + zone id)"
echo

echo "✓ Bucket provisioning done. Next:"
echo "  • bind the CDN custom domain (step 4 above) and set CDN_BASE_URL in worker wrangler.toml to match"
echo "  • set per-worker secrets (Docs/ops/r2-provisioning.md §Secrets)"
echo "  • npx wrangler deploy  (per worker — binds the R2 buckets)"
echo "  • verify:  $WRANGLER r2 bucket cors list $CDN_BUCKET  +  $WRANGLER r2 bucket lifecycle list $CDN_BUCKET"
