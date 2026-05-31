---
adr: 0007
title: Email split — Beehiiv (newsletter) + Resend (transactional)
status: Accepted (locked 2026-05-14 by Kimal)
date: 2026-05-14
confidence: high
supersedes: prior cycle-1 ADR-0007 ("Email delivery via Resend (not Beehiiv, not Postmark)")
superseded_by: none
---

# ADR-0007: Email split — Beehiiv (newsletter) + Resend (transactional)

## Context

ROMAS Wire needs two distinct email surfaces:

1. **Newsletter surface** — daily issue (Mon–Thu Brief, Friday ROMAS Read), Audio Podcast episode notifications, Conference Brief alerts. High-volume, sent to the active subscriber list, requires growth/distribution tooling, public archive at a hosted URL, EU subscriber-list management.
2. **Transactional surface** — signup confirmation, unsubscribe receipt, audio-revocation public notice email (when an audio episode is revoked post-publish), password reset for CMS access, account-related notifications. Low-volume, per-recipient, time-sensitive, integrated with web app server actions.

Three docs disagreed on the platform: `CLAUDE.md §7` (Resend/Postmark), `AGENT.md §15 line 242` (Resend/Postmark), `Docs/ROMAS-Brief-Daily-Production-Runbook.md` lines 67/196 (Beehiiv). Cycle-1 of this ADR resolved to Resend-alone. Kimal (2026-05-14) corrected: **use both, split by function**.

## Decision

**Two-vendor email stack, split by surface:**

| Surface | Vendor | Trigger |
|---|---|---|
| Daily issue Mon–Thu | **Beehiiv** | Publish-time fan-out from `apps/cms` (or `workers/issue-publisher`) |
| Friday ROMAS Read | **Beehiiv** | Friday lock-down hand-off |
| Audio Podcast notification (Tier 3) | **Beehiiv** | On `audio_jobs.audio_status = 'published'` for `tier = 'podcast'` |
| Conference Brief notification (Tier 4) | **Beehiiv** | On conference-mode activation |
| Signup confirmation | **Resend** | Server action on subscribers insert (paired with Beehiiv subscribe API call) |
| Unsubscribe receipt | **Resend** | On `subscribers.status = 'unsubscribed'` |
| Audio-revocation public notice | **Resend** | On `revocations` insert (subset of impacted subscriber segment) |
| Password reset / CMS account | **Resend** | Supabase Auth → custom Resend integration |

**Subscriber list canonical source**: **Beehiiv** (newsletter context wins). Supabase `subscribers` table is a local mirror, kept in sync via Beehiiv webhooks (subscribe / unsubscribe / bounce / complaint).

**Sync direction**:
- New signup via reader form → Resend confirmation + Beehiiv API create-subscriber → Supabase mirror
- Beehiiv webhook on subscribe / unsubscribe / bounce → Supabase `subscribers.status` update
- Reader-driven unsubscribe → Beehiiv API unsubscribe + Supabase mirror

**Pricing alignment**: Beehiiv is free up to **2,500 subscribers** — matches SSOT §3 row 5 (subscriber count hidden until 2,500). Pricing kicks in at the same threshold the public count flips visible.

## Alternatives considered

| Option | Rejection reason |
|---|---|
| **Resend-alone** (cycle-1 of this ADR) | Lacks growth/distribution layer (no recommendation network, no boost-to-other-newsletters, no hosted public archive). Requires building newsletter archive + subscriber-list-management from scratch in `apps/cms`. |
| **Beehiiv-alone** | Awkward for transactional. Beehiiv's API surface is newsletter-centric; sending a one-off password-reset is not a primary use case. React-Email templates not natively supported. |
| **Resend + Postmark** (cycle-1 fallback) | Two transactional vendors — solves no problem. |
| **Beehiiv + AWS SES** | SES requires sender reputation warming + complex deliverability tooling; operational burden too high for a 1-person ops org. |
| **Mirror-send both** | Double-sends to subscribers; deliverability worse, not better. |

## Consequences

**Positive**:
- Beehiiv's recommendation network + boost mechanic offer growth leverage Resend cannot match. Subscriber acquisition is the #1 risk at launch (SSOT §6 KPI 1, 2,500 subscribers at Day 90).
- Beehiiv free tier (≤2,500 subscribers) covers the hidden-count window; pricing kicks in at the same threshold the public count flips visible — symbolic alignment with the locked decisions ledger.
- Resend handles transactional cleanly with React-Email templates; integrates with Cloudflare Workers + `apps/cms` server actions.
- Audio-revocation notice email is transactional and lives on Resend — never blocked by newsletter-API queue depth (audio kill switch is a 60s SLA control).

**Negative**:
- Two-vendor split increases DPA surface (now 9 processors: Supabase + Cloudflare + Resend + Beehiiv + ElevenLabs + PlayHT + Whisper-provider + Plausible + Sentry).
- Subscriber-list sync introduces a consistency risk: Beehiiv as canonical means a Beehiiv outage stalls new-subscriber confirmation. Mitigation: queue Beehiiv API call with retry + dead-letter; allow signup confirmation via Resend to proceed even if Beehiiv API is down (local Supabase row created; Beehiiv subscribe retried by background job).
- Webhook signature verification required for every Beehiiv webhook (HMAC-SHA256 against `BEEHIIV_WEBHOOK_SECRET`).

**Neutral**:
- Beehiiv's hosted issue archive at `<publication>.beehiiv.com` is duplicate, not primary. Canonical issue URL stays at `romasbrief.com/issues/YYYY-MM-DD` on the reader site.

## Revisit triggers

- Subscriber count > 5,000 (Beehiiv pricing tier inflection beyond free; evaluate worth)
- Two consecutive months of >0.5% bounce rate on either surface
- Either vendor introduces a breaking API change without 6-month deprecation notice
- EU regulatory change requiring data residency outside one vendor's regions
- Vendor sustainability event (funding round, acquisition, sunset risk)
- Beehiiv webhook reliability falls below 99.5% delivery (subscriber-sync drift becomes intolerable)

## Action items (this cycle)

- `contracts/beehiiv.yaml` authored
- `contracts/resend.yaml` `x-romas-policy` will be updated to mark transactional-only scope
- `integration-review.md` will narrow I-08 (Resend → transactional) + add I-15 (Beehiiv)
- `MASTER_IMPLEMENTATION_PLAN.md` will add T-NNN tasks for Beehiiv API + webhook + sync job
- `product-spec.md` will split FR-014 into FR-014 (Beehiiv newsletter) + FR-014A (Resend transactional)
- `delivery-plan.md` risk register adds R-17 (Beehiiv-Supabase sync drift); R-15 expands to two-vendor deliverability
- `deployment-plan.md` §5 Secrets adds `BEEHIIV_API_KEY` + `BEEHIIV_WEBHOOK_SECRET`
- `.env.example` (M1 R-111) includes both Beehiiv env vars
- `Docs/DPA-inventory.md` (M1) lists both Beehiiv and Resend

## Cycle-2 → Cycle-3 history

- **Cycle-1** (2026-05-14, prior): Resend-alone, rejecting Beehiiv for transactional-mismatch and reader-URL-canonicalization concerns.
- **Cycle-2** (2026-05-14, Kimal verbal): "both." Standard split-by-function locks — Resend = transactional, Beehiiv = newsletter. Reader URL canonicalization preserved by treating Beehiiv's hosted archive as duplicate not primary.
- This ADR supersedes cycle-1 version. Status: Accepted, confidence High.

*Locked 2026-05-14 by Kimal verbal decision.*
