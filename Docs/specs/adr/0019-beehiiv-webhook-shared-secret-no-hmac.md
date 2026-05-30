# ADR-0019 — Beehiiv webhook auth: shared-secret custom header (no native HMAC)

- **Status:** Accepted
- **Date:** 2026-05-30
- **Supersedes:** the "HMAC-SHA256 with `BEEHIIV_WEBHOOK_SECRET`" wording in CLAUDE.md §7 + the SHIP-11 acceptance criterion
- **Confidence:** high (verified against official Beehiiv developer docs, 2026-05-30)
- **Deciders:** Kimal Honour Djam

## Context

The project contract (CLAUDE.md §7, ADR-0007 cycle-3, FR-023, SHIP-11) assumed the Beehiiv → Supabase subscriber-sync webhook would be authenticated by **HMAC-SHA256 signature verification** over the request body, keyed by `BEEHIIV_WEBHOOK_SECRET`.

Verified against Beehiiv's official developer docs (`developers.beehiiv.com/webhooks` + `llms-full.txt`, 2026-05-30): **Beehiiv does not sign webhook requests.** There is no signature header and no documented HMAC mechanism. The only authentication available is **optional custom headers the publisher configures** when creating the webhook (App → Settings → Integrations → Webhooks, or the `/webhooks` API). Webhooks require a Scale-plan publication.

Event payload (official):
```json
{ "uid": "<prefixed event id>", "event_timestamp": <unix-seconds>, "event_type": "subscription.created", "data": { "id", "email", "status", "created", "subscription_tier", "utm_*", "tags", ... } }
```
`data.status` ∈ `validating | invalid | pending | active | inactive | needs_attention`.
Subscription events: `subscription.created | confirmed | deleted | upgraded | downgraded | paused | resumed | tier-added | tier-paused | tier-resumed`.

## Decision

Authenticate the webhook with a **shared secret in a custom header**, not HMAC:

- ROMAS configures a custom header on the Beehiiv webhook: `Authorization: Bearer <BEEHIIV_WEBHOOK_SECRET>`.
- The `beehiiv-webhook` worker constant-time-compares that header against `BEEHIIV_WEBHOOK_SECRET` (Worker Secret); 401 on mismatch/absence.
- `BEEHIIV_WEBHOOK_SECRET` is now a **shared secret Kimal generates and sets in BOTH** the Beehiiv webhook custom-header config AND the Cloudflare Worker Secret (not a Beehiiv-issued signing key).
- **Idempotency** uses `uid`; the subscriber upsert (on `email`) is naturally idempotent, and stale events are ignored by comparing `event_timestamp`.
- **Transport security** rests on HTTPS + the secret header + the endpoint URL's secrecy.

## Consequences

- **Positive:** matches what Beehiiv actually offers; simpler than HMAC; the worker stays stateless.
- **Negative:** weaker than HMAC (a leaked header secret allows forged events — rotate on suspicion; the secret never appears in client code). No replay-protection beyond `event_timestamp`/idempotent upsert.
- **Doc updates:** CLAUDE.md §7 and the SHIP-11 acceptance must drop "HMAC-SHA256" and say "shared-secret custom header per ADR-0019."

## Revisit triggers

- Beehiiv introduces native webhook signing → switch to HMAC verification.
- A Scale-plan or webhook-availability change.
