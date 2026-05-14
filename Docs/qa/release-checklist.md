---
title: Release Checklist — /team-build start readiness
version: 1.0.0
date: 2026-05-14
note: This checklist is the GATE for dispatching /team-build, not the Day-1 launch readiness gate (that lives in SSOT §12.8).
---

# Release Checklist — /team-build Start Readiness

## Hard blockers (must close before /team-build dispatch)

| # | Item | Status | Owner | Risk ref |
|---|---|---|---|---|
| 1 | All 40 placeholder task IDs (T-NEW*, T-225..230, T-310A..D, T-651..660) defined as concrete rows (owner + estimate + depends + accept) in MASTER plan | **OPEN** | Delivery Lead | B-01 |
| 2 | All 88 promised A-NNN acceptance tests (A-101..705 + A-061..075) written into test-qa-plan §6 catalog | **OPEN** | QA Lead | B-02 |
| 3 | FR-002 + FR-003 remapped to signal-scorer tasks (T-117/T-119 wrong) | **OPEN** | Delivery Lead | B-03 |
| 4 | Launch Plan §6 Sample 5 re-sourced from `meddeviceguide.com` to EUDAMED official | **OPEN** | regulatory-analyst | B-05 |
| 5 | Master-Strategy.md, Runbook.md, Launch-Plan.md headers bumped to v2.1/v1.1/v1.1; tagline + Q1/Q2/Q3/Q8/Q9/Q10/Q11 + Beehiiv split + worldwide rebalance + LATAM workflow propagated through CLAUDE.md + AGENT.md + Master Strategy + Runbook + Launch Plan v1.2 | **OPEN** | doc author | B-06 |
| 6 | Inviolable-rule wording aligned: Master-Strategy §6.1 + Runbook §6 list all 6 rules with SSOT §2 canonical wording | **OPEN** | doc author | H-05 |
| 7 | ADR-0005 (4-tier RSS) re-written for cycle-3 lock — Day-1 audio-podcast launch, not Day-14/Day-30-45 staggered | **OPEN** | architect | new (third agent finding) |
| 8 | `architecture.md` §7 decision log updated with ADRs 0007-0011, 0013 | **OPEN** | architect | new (third agent finding) |
| 9 | `subscribers.region` column added to schema (required by three-edition publish FR-033) | **OPEN** | cms-engineer | new (third agent finding) |
| 10 | `subscribers.beehiiv_subscription_id` added to schema (required by FR-023 sync) | **OPEN** | cms-engineer | new (third agent finding) |
| 11 | `.claude/skills/cms-schema.md` updated with cycle-4 + cycle-6 deltas to match canonical `contracts/supabase-schema.sql` | **OPEN** | cms-engineer | new — skill-vs-canonical drift |

## Pre-M1 prerequisites (must close before scaffold + DB work)

| # | Item | Status | Owner | Risk ref |
|---|---|---|---|---|
| 12 | DPA inventory file `Docs/DPA-inventory.md` authored (Supabase + Cloudflare + ElevenLabs + PlayHT + Whisper-provider + Resend + Beehiiv + DeepL + Plausible + Sentry = 10 processors; Beehiiv SCC for EU subscribers specifically resolved) | OPEN | Kimal (legal) | B-10 |
| 13 | Voice consent registry `Docs/voice-consent-registry.md` signed by Kimal | OPEN | Kimal (legal) | H-12 |
| 14 | DeepL Pro account (not Free) provisioned; 30-day retention upgrade confirmed | OPEN | DevOps + Kimal | H-01 |
| 15 | `.env.example` authored with all 16 named env vars (audio: 11; supabase: 2; resend: 1; beehiiv: 2; cloudflare: 2; deepl: 1; sentry: 1; whisper: 1) | OPEN | DevOps | cycle-1 R-111 |
| 16 | `SECRETS.md` rotation policy 90d + per-secret cadence reconciled (cycle-2 F-P1-08 OIDC closure) | OPEN | DevOps | cycle-2 carry |
| 17 | Q6 ADR-0012 Video Podcast hosting vendor — at minimum a placeholder ADR-stub with explicit Day-30 author date and decision criteria | OPEN | video-operations TBD + Kimal | B-04 |

## Contract revisions (must close before M2 audio pipeline)

| # | Item | Status | Owner | Risk ref |
|---|---|---|---|---|
| 18 | PlayHT retry policy: 1→3 attempts with 2s/8s/30s backoff | OPEN | audio-producer | H-02 |
| 19 | Resend swap tag-idempotency → `Idempotency-Key` header | OPEN | web-engineer | H-03 |
| 20 | Beehiiv DLQ TTL + retry interval + escalation threshold specified | OPEN | web-engineer | H-04 |
| 21 | Supabase client global standard: `AbortSignal.timeout(10000)` on every call | OPEN | cms-engineer | M-01 |
| 22 | Whisper architectural decision: Queued Consumer or Durable Object (not synchronous Worker) | OPEN | audio-producer | REL-009 |
| 23 | Whisper embargo-gate: no audio generation while `articles.embargoed = true` | OPEN | audio-producer | M-03 |
| 24 | Resend webhook: Svix signature verification with `RESEND_WEBHOOK_SECRET` | OPEN | web-engineer | B-09 |
| 25 | Three-edition cross-edition revocation check: `workers/issue-publisher` re-validates `articles.status != 'revoked'` immediately before EACH per-region dispatch | OPEN | web-engineer | H-10 |

## Pre-M3 reader-surface prerequisites

| # | Item | Status | Owner | Risk ref |
|---|---|---|---|---|
| 26 | `Docs/ROMAS-Brief-Design-Specification.md v1.1` authored (per CLAUDE.md §6) | OPEN | design-system-keeper + Kimal | B-07 |
| 27 | `Docs/ROMAS-Brief-Audio-Architecture.md v1.0` authored (per CLAUDE.md §6) | OPEN | audio-producer + Kimal | B-07 |
| 28 | `/team-design` invocation to produce concrete wireframes + component specs + 5-state coverage for 12 reader routes + 7 components | RECOMMENDED | design-system-keeper | UX audit |
| 29 | Lexicon expansion 30 → ~80 entries assigned + scheduled W-7 | OPEN | audio-producer | H-11 |
| 30 | Right-to-erasure endpoint FR-039 (or extension to FR-S-004) + task | OPEN | web-engineer | H-08 |
| 31 | 8-module homepage image-optimization plan: AVIF + responsive srcset + lazy-load below-fold | OPEN | web-engineer + design-system-keeper | H-06 |
| 32 | Three-edition publish wall-clock budget modeled with editorial-capacity check | OPEN | editorial-director + Kimal | H-07 |

## Pre-Day-1 launch gates (per SSOT §12.8, 18 items)

Tracked separately; this checklist is for /team-build readiness, not launch readiness.

## Summary

| Bucket | Items | Open |
|---|---|---|
| Hard blockers (gate /team-build dispatch) | 11 | 11 |
| Pre-M1 prerequisites | 6 | 6 |
| Contract revisions pre-M2 | 8 | 8 |
| Pre-M3 reader prerequisites | 7 | 7 |
| **Total** | **32** | **32** |

**Estimated person-days to close items 1-11**: 3–5 days of doc-only work (Test Engineer estimate).
**Estimated person-days to close items 12-17**: 5–10 days, mostly legal/admin (DPA + voice-consent signature path) + DevOps (DeepL Pro + .env.example + SECRETS.md).
**Estimated person-days to close items 18-25**: 1–2 days of contract YAML edits.
**Estimated person-days to close items 26-32**: 5–15 days (Design Spec + Audio Architecture docs are the biggest; potentially `/team-design` invocation).

**Total to /team-build dispatch readiness**: ~2–4 weeks of preparatory work, aligning with the 8-week pre-launch ramp's W-7 start (2026-05-19).
