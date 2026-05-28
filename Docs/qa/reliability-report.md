---
title: Reliability Report — ROMAS Brief (Cycle-6 Contract Audit)
version: 1.0.0
date: 2026-05-14
scope: all 16 derived contracts in docs/specs/contracts/
methodology: contract-level reliability audit; retry/timeout/idempotency/observability/circuit-breaker completeness
verdict_scale: GREEN = all 8 columns strong; YELLOW = 1–2 columns weak; RED = 3+ columns weak or missing
---

# Reliability Report — ROMAS Brief (Cycle-6 Contract Audit)

## Reliability audit table

Columns: Retry (with concrete numbers), Timeout (explicit value), Idempotency (mechanism documented), Circuit-breaker / Fallback (defined behavior on sustained failure), Observability metrics (named fields), PII/PHI handling (documented), Failure mode on persistent failure (explicit behavior), Verdict.

A contract that says "retry" without attempt count, backoff values, and retryable status codes is scored WEAK on Retry. A timeout of "long enough" is WEAK. Idempotency that says "stateless" without addressing re-delivery on retry is WEAK.

| Integration | Retry? | Timeout? | Idempotency? | Circuit-breaker / Fallback? | Observability metrics? | PII/PHI handling? | Failure-mode on persistent failure? | Verdict |
|---|---|---|---|---|---|---|---|---|
| Supabase | 3× exp backoff 1/4/16s (integration-review §I-01) | Not specified in contract | UPSERTS on idempotent writes; audio_jobs: (article_id, tier) composite uniqueness implied | None documented beyond retry; no circuit-breaker | Supabase dashboard + Workers Analytics Engine | email PII (subscribers); no PHI | fail-loud on auth errors; article pipeline halts | YELLOW — timeout not specified; no circuit-breaker |
| ElevenLabs TTS | 3× exp backoff 1s/4s/16s; retryable: 429/500/502/503/504 | 60s | Stateless; client tracks request_id for retry de-dup (integration-review §I-05); WAV output is re-generatable | YES — on exhaustion → PlayHT failover; `voice_engine_used` logged | request_id, latency_ms, char_count, voice_engine_used, retry_attempt, status_code | No PII transmitted (script text only) | PlayHT failover triggered; if PlayHT also fails → audio_status='skipped'; article still publishes | GREEN |
| PlayHT TTS | 1 attempt only (x-romas-policy: attempts: 1) | 60s | Stateless | NO further fallback — on failure: mark audio_status='skipped' | request_id, latency_ms, char_count, voice_engine_used, status_code | No PII transmitted | audio_status='skipped', error logged, article publish continues | YELLOW — single attempt; no backoff; no retry numbers beyond "1 attempt" |
| Whisper (OpenAI) | 3× backoff 2s/8s/30s; retryable: 429/500/502/503 | 300s | Stateless; output stored to R2 at deterministic path alongside audio file | YES — on OpenAI exhaust → Replicate Whisper large-v3; on Replicate fail → BLOCK audio publish | request_id, audio_duration_sec, transcription_duration_sec, status_code, retry_attempt, vendor_used | 30-day retention at OpenAI (no training); DPA noted | BLOCK audio publish; transcript_url gate in schema CHECK enforces | GREEN |
| Cloudflare Cache Purge | 3× exp backoff 1s/4s/16s; retryable: 429/500/502/503/504 | 30s | Purge is idempotent (same tags can be purged multiple times safely) | YES — cdn-purge-watchdog cron (*/1) rescans revocations with cdn_purge_at IS NULL AND age > 90s; retries; alerts | request_id, status, latency_ms, retry_attempt, purge_tag, zone_id | No PII | alert via Sentry + email on persistent failure; 60s SLA / 90s watchdog-alert threshold | GREEN |
| Resend | 3× exp backoff 1s/4s/16s (x-romas-policy) | 30s | tag-based dedupe: tag_key=issue_date; Resend does not natively enforce idempotency key on SMTP delivery — tag is for analytics tracking only, not delivery deduplication | NO circuit-breaker; failure mode: queue for next-cycle delivery | send_count, delivered_count, bounce_count, unsubscribe_count, latency_ms | email PII; DPA noted; GDPR consent basis noted | queue for next-cycle; alert via Sentry | YELLOW — tag-based idempotency is weak (analytics tag, not delivery dedup); no native idempotency-key; no circuit-breaker spec |
| Beehiiv | 3× backoff 2s/8s/30s; retryable: 429/500/502/503 | 30s | external_id idempotency: `issue_{YYYY-MM-DD}_{tier}` — 409 on conflict, correctly deduplicated by Beehiiv | NO circuit-breaker documented; fallback: dead-letter queue in workers/issue-publisher | api_call_count, latency_ms, status_code, webhook_lag_ms, sync_drift_count | email + custom_fields PII; DPA + SCC noted | dead-letter queue; non-blocking (article publish never blocked on Beehiiv failure) | YELLOW — no circuit-breaker; dead-letter queue is named but not specified (no TTL, no escalation) |
| openFDA | 3× backoff 1s/4s/16s (x-romas-policy) | 15s | GET requests cached 6h in R2 + Workers KV; cache key is full URL | NO circuit-breaker; source marked in source_health | (not explicitly listed; source_health.status_code + latency_ms implied) | No PII (public API) | log to source_health; retry next cycle; NEVER silent drop (Rule 5) | YELLOW — no explicit metrics list in contract; no circuit-breaker; cache-miss behavior not documented |
| FDA 510(k)/De Novo/PMA | 3× backoff 1s/4s/16s | 30s | GET requests; no explicit cache documented | NO fallback (public HTML/PDF; no alternative) | source_health logging (implied by `log: source_health`) | No PII | log to source_health; block publish of that item; surface next morning brief | YELLOW — no explicit metrics list; no cache strategy; no circuit-breaker; single-point-of-failure with no fallback |
| EMA / EUDAMED | 3× backoff 2s/8s/30s | 30s | GET requests; no explicit cache documented | YES — 3-step fallback: EUDAMED → NB-OG → MDCG PDF | source_health logging (implied) | No PII | all-three-fail → log source_health; block EU regulatory item this cycle | YELLOW — no explicit metrics list; no cache; no alert on all-three-fail (gap documented in security findings NEW-S-004) |
| MHRA | 3× backoff 2s/8s/30s | 30s | GET requests; no cache documented | NO fallback (single source; no alternative) | source_health implied | No PII | log to source_health; retry next cycle | YELLOW — no cache; no explicit metrics; no fallback; timeout is correct |
| PMDA | 3× backoff 2s/8s/30s | 45s (bumped for Japan latency) | GET requests; no cache documented | NO fallback | source_health implied | No PII | log to source_health; retry next cycle | YELLOW — no cache; no explicit metrics; no fallback; single-point-of-failure |
| NMPA | 3× backoff 2s/8s/30s | 60s (bumped for China network variability) | GET requests; no cache documented | NO fallback; `do_not_alert_on_repeat_5xx: true` | source_health implied | No PII (public regulatory records) | log to source_health; retry next cycle | YELLOW — no cache; no explicit metrics; `do_not_alert_on_repeat_5xx` masks repeated failures silently |
| TGA | 3× backoff 2s/8s/30s | 30s | GET requests; no cache documented | NO fallback | source_health implied | No PII | log to source_health; retry next cycle | YELLOW — no cache; no explicit metrics; no fallback |
| Health Canada | 3× backoff 2s/8s/30s | 30s | GET requests; no cache documented | NO fallback | source_health implied | No PII | log to source_health; retry next cycle | YELLOW — no cache; no explicit metrics; no fallback; bilingual note does not affect reliability posture |
| DeepL | 3× backoff 2s/8s/30s; retryable: 429/500/502/503; fallback_status: 456/503 → Claude/GPT-4 | 30s | Stateless; glossary_id provides term consistency; no request-level idempotency key | YES — on 456 (quota) or 503 → Claude 3.5 Sonnet / GPT-4 fallback via llm-orchestrator | request_id, source_lang, char_count, latency_ms, status_code, verification_triggered, verification_outcome | No PII (public regulatory/journal text) | Claude/GPT-4 fallback; on both fail → block LATAM article translation for this cycle | GREEN |

---

## Detailed reliability findings

### REL-001 [P1] PlayHT retry policy is critically weak: single attempt, no backoff

**File**: `docs/specs/contracts/playht-tts.yaml`
**Lines**: 76–83 (`x-romas-policy.retry`)

```yaml
retry:
  attempts: 1
  timeout: 60s
```

PlayHT is the sole fallback for ElevenLabs. The ElevenLabs contract triggers failover to PlayHT on 429/500/503. Once at PlayHT, the contract allows exactly one attempt. If PlayHT returns a transient 503 or a brief 429, the audio job is immediately marked `skipped` with no retry. For a publication with a 07:00 ET hard publish window, losing audio on the sole failover path due to a transient error — when a second attempt after 2 seconds would have succeeded — is a reliability failure.

**Fix**: Change PlayHT retry policy to match ElevenLabs (or at least 2 attempts):
```yaml
retry:
  attempts: 3
  backoff: [2s, 8s, 30s]
  retryable_status: [429, 500, 502, 503, 504]
  timeout: 60s
```
The `on_failure` path (skip audio, continue article publish) is correct; the retry count is not.

---

### REL-002 [P1] Resend tag-based idempotency does not prevent duplicate email delivery

**File**: `docs/specs/contracts/resend.yaml`
**Lines**: 86–92

The contract claims idempotency via `tag_key: issue_date` tagging. Resend's API tags are metadata labels for analytics — they are not a delivery deduplication mechanism. Resend does not use tags to reject duplicate send calls the way Beehiiv uses `external_id` (which returns HTTP 409 on conflict). If `workers/resend-webhook` or `workers/audio-producer` calls `POST /emails` twice with the same payload (e.g., after a Worker retry following a timeout), Resend will deliver the email twice.

**Attack scenarios**:
- Worker sends email; gets a 504 timeout from Resend (Resend queued it); Worker retries; subscriber receives duplicate.
- Cron job fires twice due to CF Workers duplicate invocation bug; both calls succeed; two identical issues delivered.

**Fix**: Replace tag-based with a Resend idempotency key:
```yaml
idempotency:
  method: idempotency-key-header
  header: Idempotency-Key
  key_pattern: "{event_type}_{resource_id}"  # e.g., "signup_confirmation_{subscriber_uuid}"
  ttl: 24h (Resend deduplicates for 24h per key)
```
Resend supports `Idempotency-Key` header. Use it on every send call. Update `workers/resend-webhook` and `workers/audio-producer` implementations accordingly.

---

### REL-003 [P1] Beehiiv dead-letter queue has no specified TTL or escalation path

**File**: `docs/specs/contracts/beehiiv.yaml`
**Lines**: 205–209

The contract says: "Queue the post in workers/issue-publisher with retry + dead-letter. Do NOT block article publish on email send." This is architecturally correct (article publish should not be blocked by email failure), but the dead-letter queue is undefined:

- No TTL (how long before a dead-lettered post is abandoned?).
- No escalation (who is alerted? When?).
- No maximum retry window (a post that keeps failing for 48 hours is indistinguishable from a post that failed once).

If the issue-publisher Worker crashes silently and Beehiiv is down, the daily issue could go undelivered indefinitely with no alert.

**Fix**: Specify the dead-letter queue contract:
```yaml
dead_letter:
  max_retry_window: 6h from scheduled_publish_at
  retry_interval: 15 min after first failure; 30 min after 2 hours
  escalation:
    at_30min: Sentry P2 alert to editorial operations
    at_2h: Sentry P1 + email to Kimal
    at_6h: mark post as dead; Sentry P0; manual intervention required
  recovery: dead-letter posts can be manually retried from CMS
```

---

### REL-004 [P2] Supabase timeout not specified in any contract

**File**: `docs/specs/contracts/supabase-schema.sql` and `docs/specs/integration-review.md` §I-01

No contract documents the timeout for Supabase client calls. The `@supabase/supabase-js` client uses no default timeout on database queries. A slow or pathological query (e.g., a full-table scan on `source_health` due to missing index, or a lock contention during a migration) will block a Worker indefinitely until Cloudflare's 30-second CPU time limit kills it, leaving the operation in an undefined state.

**Fix**: Add to integration-review §I-01 and any code using the Supabase client:
```yaml
supabase_client:
  query_timeout: 10s (set via AbortSignal or postgrest timeout header)
  auth_timeout: 5s
  on_timeout: fail-loud; log error; return HTTP 503 from Worker
```
In practice: `const { data, error } = await supabase.from('articles').select('*').abortSignal(AbortSignal.timeout(10000))`.

---

### REL-005 [P2] Regulatory source contracts have no caching strategy

**File**: `docs/specs/contracts/fda-510k.yaml`, `mhra.yaml`, `pmda.yaml`, `tga.yaml`, `health-canada.yaml`
**Lines**: all x-romas-policy blocks

These five contracts document retry and timeout but none document a caching strategy. openFDA explicitly caches 6h in R2 + Workers KV. The verification-target contracts (FDA 510(k), MHRA, PMDA, TGA, Health Canada) do not. This means:

1. Every editorial-director cycle re-fetches the same HTML/PDF pages that change at most once per business day.
2. If a regulatory site is flaky (PMDA in particular is noted as slow), repeated uncached fetches increase latency and exhaust retry budgets.
3. A Worker retry following a timeout will re-fetch the full document from the government site, adding load to public infrastructure.

**Fix**: Add a caching tier to verification-target contracts:
```yaml
cache:
  ttl: 4h  # regulatory records are updated at most once per business day
  backing: Workers KV (key: sha256(endpoint_url))
  invalidation: on workflow completion (article published or claim verified)
  stale_on_error: serve stale if live fetch fails and cache age < 24h
```

---

### REL-006 [P2] Cross-edition idempotency gap: Americas edition may send after revocation

**File**: `docs/specs/contracts/beehiiv.yaml`, `docs/specs/contracts/supabase-schema.sql`

This is the reliability dimension of security finding NEW-S-010. The Beehiiv external_id pattern is `issue_{YYYY-MM-DD}_{tier}` — a single key per tier per day regardless of edition. If three geographic editions exist (APAC 22:00, EU 06:00, Americas 11:00) and all use the same external_id, Beehiiv's idempotency key prevents re-sending to the same publication — but it also means all three editions are a single Beehiiv post, not three separate posts. If the revocation arrives after APAC, the EU and Americas sends are the same Beehiiv post; canceling it before EU dispatch would cancel Americas as well, which is correct behavior — but only if the Worker checks for revocation before dispatching each edition.

Currently `workers/issue-publisher` is specified to queue the post with retry but no pre-send revocation check is documented.

**Fix**: Add pre-send revocation check to `workers/issue-publisher`:
```yaml
pre_send_gate:
  check: SELECT 1 FROM revocations WHERE article_id = :article_id AND created_at < NOW()
  on_match: skip send; log as 'send_cancelled_due_to_revocation'; alert editorial operations
  implementation: before each Beehiiv /posts or /subscriptions call, check revocations table
```

---

### REL-007 [P2] NMPA `do_not_alert_on_repeat_5xx` masks sustained outages silently

**File**: `docs/specs/contracts/nmpa.yaml`
**Lines**: 42–43

The contract sets `do_not_alert_on_repeat_5xx: true` acknowledging known NMPA unreliability. This is operationally pragmatic (NMPA is unreliable and alerting on every failure would create noise), but it introduces a monitoring blind spot: if NMPA is persistently unreachable for 30 days, no alert fires and no one notices that China regulatory coverage has silently dropped from the editorial pipeline.

**Fix**: Replace the binary suppress-all setting with a threshold:
```yaml
on_failure:
  alert_on_consecutive_failures: 10  # first 9 failures are silent; 10th triggers P3 Sentry alert
  alert_on_sustained_outage_days: 5  # if site unreachable for 5 consecutive cron days → P2 alert
  do_not_alert_on_isolated_5xx: true  # still suppress individual transient errors
```

---

### REL-008 [P3] openFDA cache-miss behavior on KV eviction not documented

**File**: `docs/specs/contracts/openfda.yaml`
**Lines**: 95–99

The contract documents a 6h TTL cache in R2 + Workers KV, but does not specify behavior on cache miss during a cron run when openFDA is also down. The regulatory-analyst workflow that depends on openFDA discovery would silently receive empty results if both the cache is expired and the live fetch fails.

**Fix**: Add cache-miss behavior to `openfda.yaml`:
```yaml
cache:
  ttl: 6h
  backing: R2 + Workers KV
  on_cache_miss_and_fetch_fail:
    behavior: serve most-recent stale cache if age < 24h; else fail-loud to source_health
    alert: Sentry P3 if stale cache served; P2 if no cache available
```

---

### REL-009 [P3] Whisper 300s timeout may exceed Cloudflare Worker CPU time limit

**File**: `docs/specs/contracts/whisper.yaml`
**Lines**: 89–90

Whisper transcription timeout is set to 300 seconds. Cloudflare Workers have a 30-second CPU time limit (not wall-clock, but relevant for synchronous compute). A 10-minute audio brief transcript call (300s wall-clock) is feasible as a streaming/await call, but if the Worker accumulates CPU time waiting for the stream, it may hit the limit. More critically, Cloudflare's default request timeout is 30s for synchronous Workers (Durable Objects and service bindings can extend this, but the contract does not specify).

**Fix**: Document the execution context for Whisper calls:
```yaml
execution_context:
  worker_type: Durable Object or Queued Consumer (NOT synchronous Worker)
  reason: 300s wall-clock exceeds synchronous Worker request timeout
  implementation: workers/audio-producer submits Whisper job to a Queue; consumer Worker
    polls/streams; result stored to R2; audio_jobs.transcript_url updated async
```
This is an architectural note, not just a timeout setting, and needs to be reflected in the audio pipeline implementation plan.

---

### REL-010 [P3] DeepL fallback to Claude/GPT-4 has no specified fallback contract

**File**: `docs/specs/contracts/deepl.yaml`
**Lines**: 136–138

The DeepL contract specifies Claude 3.5 Sonnet via `llm-orchestrator` as fallback on 456 (quota) or 503. The `llm-orchestrator` package is part of the ROMAS main platform (not ROMAS Brief), and its availability for Brief's Cloudflare Worker context is not documented. If the orchestrator is unavailable or the Claude API key is not configured in the Brief Workers environment, the fallback silently fails, and the LATAM article translation is blocked without a clear failure mode.

**Fix**: Add to `deepl.yaml x-romas-policy`:
```yaml
fallback:
  vendor: claude-3.5-sonnet via direct Anthropic API (not via ROMAS llm-orchestrator)
  env_var: ANTHROPIC_API_KEY (separate from ROMAS main platform)
  on_fallback_fail: block LATAM translation; log; do NOT publish untranslated source article
  contract: add contracts/anthropic-translation-fallback.yaml (M1 deliverable)
```
This requires a new derived contract, added to the M1 backlog.

---

## Summary: failure-mode classification

This table shows what happens when each integration fails persistently (all retries exhausted, all fallbacks exhausted).

| Integration | Persistent failure outcome | Blocks article publish? | Blocks audio? | Alert fires? |
|---|---|---|---|---|
| Supabase | All Workers fail; system down | YES — complete outage | YES | Sentry (if configured) |
| ElevenLabs → PlayHT | audio_status='skipped'; article ships | NO | YES (audio skipped) | Workers Analytics |
| Whisper | BLOCK audio publish; audio_status stays in_review | NO (article ships without audio) | YES (audio blocked) | Sentry (if configured) |
| Cloudflare Cache Purge | watchdog retries; Sentry P1 + email if >90s | NO | NO | YES — Sentry + email |
| Resend | queue for next-cycle; Sentry alert | NO | NO | YES — Sentry |
| Beehiiv | dead-letter queue; undocumented escalation | NO | NO | Partial — no TTL spec |
| openFDA | log source_health; retry next cycle | NO | NO | NO (Rule 5: not silent, but no explicit alert) |
| FDA 510(k) | block affected article; surface next morning | YES (that article only) | N/A | source_health log only |
| EMA/EUDAMED | block EU regulatory item; no alert | YES (EU items only) | N/A | NO (gap — NEW-S-004) |
| MHRA / PMDA / TGA / HC | log + retry next cycle | NO | N/A | source_health log only |
| NMPA | log + retry next cycle; no repeat alert | NO | N/A | Suppressed (REL-007) |
| DeepL | Claude/GPT-4 fallback; if both fail → block LATAM | YES (LATAM only) | N/A | Workers Analytics |

---

## Top 5 reliability blockers

### BLOCKER-REL-1: PlayHT single-attempt retry (REL-001, P1)
The sole TTS failover path allows one attempt. A transient error permanently skips audio for that article. Fix: increase to 3 attempts with backoff before marking skipped.

### BLOCKER-REL-2: Resend tag-based idempotency does not prevent duplicate delivery (REL-002, P1)
Subscribers can receive duplicate emails on Worker retry after timeout. Fix: use Resend's `Idempotency-Key` header on every send call.

### BLOCKER-REL-3: Beehiiv dead-letter queue has no escalation or TTL (REL-003, P1)
A silent Beehiiv failure causes an undelivered issue with no alert. Fix: specify dead-letter TTL (6h max), retry cadence, and Sentry escalation thresholds.

### BLOCKER-REL-4: Supabase query timeout unspecified (REL-004, P2)
Slow queries can block Workers indefinitely. Fix: set AbortSignal(10000) on all Supabase client calls before M2 code drop.

### BLOCKER-REL-5: Whisper 300s timeout incompatible with synchronous Worker execution (REL-009, P3 but architectural)
A synchronous Worker cannot hold a 300s connection without hitting Cloudflare's execution limits. Fix: route Whisper through a Queued Consumer or Durable Object before implementing the audio pipeline Worker.

---

## Revision history

| Date | Version | Change |
|---|---|---|
| 2026-05-14 | 1.0.0 | Initial reliability report. 16 integrations audited. 10 reliability findings (REL-001 through REL-010). 5 reliability blockers. |

---

## Cycle-6 cross-reference (2026-05-28)

Cycle-6 surfaced 3 NEW BLOCKERS that supersede the prior cycle's framing for this artifact's scope. Full evidence in `Docs/qa/risk-register.md` cycle-6 section + `Docs/specs/qa-report.md` cycle-6 verdict.

- **B-17** — Doc-vs-reality drift: CLAUDE.md §12 + tasks.md describe a fictional M1+M2+M3 implementation state. Future planning load-bearing on these docs will hallucinate.
- **B-18** — Lockfile drift: `pnpm-lock.yaml` has 0 references to the 3 untracked workers (audio-producer / cdn-purge-watchdog / rss-publisher = 2,317 LOC). Turbo typecheck FAIL + build FAIL gates all M2-B/C verification.
- **B-19** — M3 (reader + Beehiiv webhook + Resend transactional) is NOT STARTED in code; tasks.md Phase 5/6/7 `[x]` claims are false against the working tree. apps/web/app/page.tsx is a 21-line T-101 stub.

Until B-17/18/19 close, this artifact's prior verdict is **superseded** for any Day-1 launch readiness decision. The artifact's M1/M2-A scope remains valid where the underlying code exists in HEAD.
