---
adr: 0008
title: Observability — Workers Analytics Engine + Sentry
status: Proposed (hypothesis — Q5 in SSOT §10)
date: 2026-05-14
confidence: medium
supersedes: none
---

# ADR-0008: Observability stack

## Context

ROMAS Brief runs 4 Workers + 2 Pages + Supabase + R2 + external TTS/email APIs. Operational signals needed:

1. Cron success rate (Mon-Fri 10:30 UTC ingest)
2. Audio failure counts (ElevenLabs failover, PlayHT skips, loudness rejects)
3. RSS validation pass rates
4. 60s revoke SLA conformance (cdn_purge_at latency)
5. Error tracking (Worker exceptions, Next.js runtime errors)
6. Reader analytics (LCP, INP, CLS, page views)

Kimal is the sole on-call at launch. The stack must be cheap and low-effort.

## Decision

Three layers:
1. **Cloudflare Workers Analytics Engine** — custom metrics from Workers (cron success, latency histograms, source-health counters). Free tier covers ROMAS Brief launch volume.
2. **Sentry** — error tracking + performance traces on Workers + Next.js apps. Free tier (5k errors/mo); revisit pricing at 10k MAU.
3. **Plausible** — reader analytics, cookieless, EU-hostable. $9/mo at 10k MAU.

No APM (Datadog / New Relic) at launch.

## Alternatives considered

| Option | Rejection reason |
|---|---|
| **Workers Analytics Engine only** | No error stack traces; insufficient for triaging 5xx in production. |
| **Sentry only** | Strong on errors, weak on custom application metrics (cron run counts, source-health). |
| **Logflare** (Cloudflare-friendly) | Active product but smaller team; Sentry is more battle-tested for error tracking. |
| **Datadog / New Relic** | Cost prohibitive at launch volume; over-tooled for a 1-person ops org. |
| **Honeycomb** | Excellent for trace-based debugging but pricier; revisit at scale. |
| **Self-hosted Grafana + Loki + Tempo** | Operational burden too high; defeats the "Cloudflare-managed" thesis. |

## Consequences

**Positive**:
- Workers Analytics Engine is native; emits via `env.ANALYTICS.writeDataPoint()` with no extra deps.
- Sentry has Worker SDK + Next.js SDK; integrates with both surfaces.
- Plausible is cookieless; matches "no cookies on reader" SSOT posture.
- All three have free tiers; combined monthly cost <$30 at launch volume.

**Negative**:
- Three tools to manage (one more than ideal).
- Workers Analytics Engine query interface is SQL-like; learning curve for Kimal.
- Sentry's release-tagging requires deploy pipeline integration (added to ADR-0010).

**Neutral**:
- Logpush to R2 enables ad-hoc grepping for incidents (Cloudflare Logpush included in Workers paid tier).

## Revisit triggers

- Free-tier exhaustion on Sentry (5k errors/mo)
- Need for distributed tracing across Workers + Supabase (consider Honeycomb)
- 10k MAU on reader (re-evaluate Plausible pricing tier)
- Any P0 incident where existing tooling failed to surface root cause within 1 hour

## Action items

- Add Sentry DSN to `.env.example` (R-111)
- Add `env.ANALYTICS` binding in `wrangler.toml` per Worker
- Wire Plausible into `apps/reader` layout (R-307)
