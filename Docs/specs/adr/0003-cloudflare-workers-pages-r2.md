# ADR-0003 — Cloudflare Workers + Pages + R2

| Field | Value |
|---|---|
| Status | Accepted (retroactive — CLAUDE.md §7) |
| Date | 2026-05-14 |
| Confidence | High |
| Deciders | Kimal Honour Djam |
| Sources | CLAUDE.md §7; `.claude/skills/audio-production-pipeline.md` (R2 layout, CDN TTLs, purge SLA) |

---

## Context

ROMAS Brief has three distinct compute needs:

1. **Scheduled background work** — source ingestion (cron 10:30 UTC daily), audio production, RSS regeneration. These are latency-tolerant but must execute reliably on a schedule.
2. **Edge-served web surfaces** — reader app and CMS app. Both are Next.js 14+ App Router. Both serve a globally distributed clinical audience; CDN-edge rendering minimizes latency.
3. **Binary asset storage + delivery** — WAV master files (private archive) and MP3 CDN files (public, tag-purgeable within 60s on revoke). Storage must be tightly coupled to the CDN to make tag-based cache purge feasible.

The audio revoke SLA is 60 seconds from revoke command to CDN withdrawal (audio-production-pipeline.md:118). This requires CDN cache invalidation by tag, not by URL, because the same audio file may be referenced in multiple RSS feeds and on the article page simultaneously.

---

## Decision

Use the **Cloudflare** platform across all three compute needs:

| Need | Cloudflare product |
|---|---|
| Scheduled background workers | Cloudflare Workers (Cron Triggers) |
| Event-driven workers (audio produce, RSS, purge) | Cloudflare Workers (Queue consumers or fetch handlers) |
| Reader app | Cloudflare Pages (Next.js via `@cloudflare/next-on-pages`) |
| CMS app | Cloudflare Pages (Next.js via `@cloudflare/next-on-pages`) |
| Private WAV archive | R2 bucket `romas-audio-archive` (no public access) |
| Public MP3 CDN | R2 bucket `romas-audio-cdn` (public, CDN-fronted, tag-purgeable) |

R2 CDN TTL: 300s for active episodes (< 24h), 86400s for archived episodes (≥ 24h). Cache headers set by `audio-producer` worker at upload time based on `published_at` delta.

Tag-based purge (`CLOUDFLARE_ZONE_ID` + article slug tag) enables the 60s revoke SLA without URL enumeration.

---

## Alternatives Considered

### Vercel + AWS S3

Rejected. Vercel is the natural deployment target for Next.js and would handle the reader and CMS apps well. However, S3 cache invalidation requires CloudFront distribution management (separate from S3) and tag-based purge is not native to CloudFront without Lambda@Edge. The 60s revoke SLA is achievable on CloudFront but requires additional Lambda infrastructure. Keeping storage and CDN on Cloudflare R2 eliminates this complexity. Scheduled background jobs on Vercel require Vercel Cron (rate-limited on hobby tier) or an external scheduler.

### Netlify + R2

Rejected. Netlify supports Next.js but its edge functions runtime is less mature than Cloudflare Workers for complex scheduled tasks. Netlify's native storage is Netlify Blobs, not R2 — cross-vendor R2 access from Netlify functions adds latency and credential surface. Staying within Cloudflare keeps storage, CDN, and compute in one control plane.

### Fly.io + Tigris (S3-compatible)

Rejected. Fly.io provides long-running containers — appropriate for persistent workers but over-engineered for the stateless cron + event-driven pattern ROMAS Brief uses. Tigris (S3-compatible, built on Fly) is not CDN-native; a separate CDN layer would be required for the public MP3 bucket, complicating the tag-based purge path.

### Self-hosted VPS (e.g., Hetzner) + nginx + CDN (Bunny.net)

Rejected. Operational overhead of VPS management, SSL renewal, and CDN configuration is not justified at this stage. The Cloudflare platform provides the full stack under one billing relationship and one control plane.

---

## Consequences

**Positive**
- Single vendor for Workers, Pages, R2, and CDN — one `wrangler.toml` per worker, one Cloudflare API token for all purge operations.
- Tag-based purge (`cf-cache-tag: article-{slug}`) satisfies the 60s revoke SLA without URL enumeration.
- Workers Cron Triggers replace an external scheduler (no additional service for `cron-ingest`).
- R2 egress is free from Cloudflare's network — audio delivery at scale does not incur per-GB egress fees.
- Workers Analytics Engine provides per-worker observability without a separate APM service.

**Negative**
- `@cloudflare/next-on-pages` adapts Next.js App Router for the Workers runtime but does not support all Next.js features (e.g., incremental static regeneration behaves differently). CMS and reader must be tested against the Pages runtime, not just local `next dev`.
- Workers have a 128MB memory limit per request and a 30s CPU time limit. Audio processing (loudness normalization) must be delegated to `tools/audio/` scripts running on a Node 20+ process (CI or a Durable Object), not directly inside a Worker invocation.
- R2 does not support server-side encryption with customer-managed keys at the bucket level (as of 2026-05). WAV masters contain no PHI but the limitation should be verified if the content posture changes.

**Neutral**
- The two-bucket layout (`romas-audio-archive` private, `romas-audio-cdn` public) is a deliberate boundary: WAV masters never reach the CDN. The audio-producer worker writes to archive, then separately uploads the encoded MP3 to the CDN bucket.

---

## Revisit Triggers

- `@cloudflare/next-on-pages` drops support for a Next.js App Router feature required by the CMS or reader — evaluate self-hosting the Next.js app on Fly.io at that point.
- Audio episode count exceeds R2's practical limits (unlikely in the 3-year horizon, but flag if Cloudflare changes R2 pricing on operations).
- A compliance requirement demands data residency in a specific jurisdiction not served by Cloudflare's R2 regional buckets.

---

## Historical Context

Cloudflare (Workers + Pages + R2) was named as the edge / CDN / storage stack in CLAUDE.md §7 from planning-kit inception (2026-05-12). The audio-production-pipeline skill already specified two R2 buckets (`romas-audio-archive` private + `romas-audio-cdn` public) by name in lines 100-115. No alternative was compared at decision time — the choice was a coherent single-vendor preference: Workers for cron + compute, Pages for static + Next.js SSR, R2 for audio, Cloudflare's cache-purge-by-tag API for the inviolable 60s revoke SLA. The retroactive ratification here is honest: a Vercel + S3 split would have introduced two billing relationships, two CDN strategies, and an awkward cross-cloud cache invalidation story — the 60s SLA in particular benefits from staying inside one vendor's purge primitive. The alternatives section was filled in post-hoc.

*Accepted retroactively 2026-05-14 per CLAUDE.md §7 and audio-production-pipeline.md; Historical Context added cycle-2 per critic F-P1-05.*
