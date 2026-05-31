---
title: Security Findings — ROMAS Wire (Cycle-6 Contract Audit + build-2026-05-21 qa-pass dependency audit)
version: 2.1.0
date: 2026-05-14 (v2.0) · 2026-05-21 (v2.1 build-2026-05-21 qa-pass section appended)
scope: all 16 derived contracts in docs/specs/contracts/ + cycle-1 baseline (docs/specs/security-findings.md) + post-build-2026-05-21 dependency audit
methodology: contract-level threat modeling + fresh pnpm audit on the M1 scaffold; re-audit mandatory post-M2 code drop
baseline: docs/specs/security-findings.md v1.0.0 (10 findings F-S-001 through F-S-010)
---

# Security Findings — ROMAS Wire (Cycle-6 Contract Audit + build-2026-05-21 qa-pass)

## build-2026-05-21 qa-pass dependency audit (added 2026-05-21)

Fresh `pnpm audit --audit-level=low` run against the post-/team-build state:

### Before qa-pass intervention (next pinned 14.2.18, no postcss/ws/esbuild overrides)
- **26 vulnerabilities total**: 1 critical, 7 high, 14 moderate, 4 low
- CRITICAL: `GHSA-f82v-jwr5-mffw` — Authorization Bypass in Next.js Middleware (patched in `next 14.2.25`)
- Bucket C C11 had pinned `next` to exact `14.2.18`, which actively regressed 9 already-fixed advisories from the previous `^14.2.18 → 14.2.35` resolution.

### qa-pass interventions (D-025 in decision-log)

1. **Bump `next` and `eslint-config-next` exact pin from `14.2.18` to `14.2.35`** (latest 14.x; D-025).
2. **Add `pnpm.overrides`**:
   - `postcss >=8.5.10` (closes `GHSA-qx2v-qp2m-jg93` XSS)
   - `ws@>=8.0.0 <8.20.1` → `>=8.20.1` (closes `GHSA-58qx-3vcg-4xpx` uninitialized memory)
   - `esbuild@<=0.24.2` → `>=0.25.0` (closes `GHSA-67mh-4wv8-2f99` dev-server CORS)

### After qa-pass intervention
- **14 vulnerabilities total**: 0 critical, 5 high, 7 moderate, 2 low
- All 14 are `next` advisories patched only in Next 15.x.y
- Documented and accepted under **ADR-0015 v2** with per-advisory applicability assessment + control mapping
- 5 of 14 documented NOT applicable to ROMAS Wire's architecture (App Router only, no i18n, no Pages Router, no `Script strategy="beforeInteractive"`)

### Residual CVE summary table

| Severity | Count after qa-pass | Trend vs pre-qa-pass | ADR-0015 v2 disposition |
|---|---|---|---|
| Critical | 0 | ↓ 1 (closed by 14.2.35) | — |
| High | 5 | ↓ 2 (closed by 14.2.34 + 14.2.35) | Accepted with control mapping; 1 of 5 (i18n Pages Router) marked NOT applicable |
| Moderate | 7 | ↓ 7 (4 closed by Next 14, 3 closed by transitive overrides) | Accepted with control mapping; 1 of 7 (`beforeInteractive` script) marked NOT applicable |
| Low | 2 | ↓ 2 (closed by 14.2.30 + 14.2.24) | Accepted with cache-control mitigations |

### Fresh secret-scan grep (build-2026-05-21 qa-pass)

```
grep -i 'password|api[_-]?key|secret|token|bearer|JWT|cookie' (excluding _legacy/)
```
20 files matched. **All are name-references**, not committed secret values. Examined samples:
- `workers/cron-ingest/wrangler.toml` — comments referencing SUPABASE_SERVICE_ROLE_KEY as a variable name (D-014 hardened the comment to explicitly negative wording)
- `workers/cron-ingest/src/index.ts` — Env interface declaring optional `SUPABASE_SERVICE_ROLE_KEY?: string` (type-only, no value)
- Specs / docs — env var names, control documentation, no values
- `pnpm-lock.yaml` — package metadata references, no secret values

Verdict: **CLEAN** — no committed secret values. `.env.example` (not yet authored per R-111 M1) will continue this discipline.

### PII assessment

`supabase/seed.sql` inserts `(president@aliennova.com, Kimal Honour Djam, audio_qa)`. D-023 (Kimal explicit decision via /AskUserQuestion 2026-05-21) leaves this as-is: Kimal authored the data, the data is Kimal's, the repo is private. Re-evaluate at Day 90 review per the D-023 mitigation note.

### Cycle build-2026-05-21 audit verdict

**GREEN** for the dependency surface — assuming ADR-0015 v2 controls are wired up at M3 (RSC input validation + body cap + edge rate-limit + image-opt rate-limit + no-cache on user-segmented routes + no-`beforeInteractive` ESLint rule + sanitiser pipeline). Until M3, the 9 applicable residual CVEs have NO live attack surface (no RSC code exists yet); the 5 not-applicable CVEs are documented exempt.

**Owner of M3 enforcement**: web-engineer + DevOps + architecture-reviewer per ADR-0015 v2 Control column.

---

# Security Findings — ROMAS Wire (Cycle-6 Contract Audit) — preserved baseline below

## Scope and methodology

Findings are derived entirely from plan-level review of the 16 contracts in `docs/specs/contracts/`, the cycle-1 baseline at `docs/specs/security-findings.md`, and the integration review at `docs/specs/integration-review.md`. No code has been written. Every finding below is a contract gap, an undocumented threat surface, or an ambiguity that, if left unresolved, becomes a real vulnerability at M2 code-drop.

Assets under review: editorial integrity, audio artifacts, subscriber PII (email only; no PHI), voice-clone consent, regulatory citation chain, CDN revocation SLA.

---

## Security posture table — all 16 integrations

| Integration | Auth method | Least-privilege scope? | Secret in CF Workers? | Webhook signature verification? | Rate-limit handling? | DPA required? | Observability of failures? | Verdict |
|---|---|---|---|---|---|---|---|---|
| Supabase (schema) | anon key (RLS) + service-role key | PARTIAL — service-role blast radius (F-S-006) | service-role key only in cms-writer Worker | N/A (no inbound webhook) | N/A (internal DB) | YES (Supabase DPA) | Supabase dashboard + Workers Analytics | YELLOW |
| ElevenLabs TTS | `xi-api-key` header | YES — API key scope is TTS only | YES — `ELEVENLABS_API_KEY` in Worker secrets | N/A (outbound only) | YES — 80% monthly char cap alert | YES — DPA with ElevenLabs | YES — Workers Analytics Engine | GREEN |
| PlayHT TTS | Bearer + `X-User-ID` header | PARTIAL — `X-User-ID` is account-wide; no sub-scope documented | YES — Bearer + User-ID in Worker secrets | N/A (outbound only) | YES — rate-limit on 429; no numeric cap alert | YES — DPA required (undocumented) | YES — Workers Analytics Engine | YELLOW |
| Whisper (OpenAI) | Bearer (OpenAI API key) | NO — OpenAI key grants full API access, not Whisper-scoped | YES — `OPENAI_API_KEY` in Worker secrets | N/A (outbound only) | YES — retry + Replicate failover | YES — DPA required; noted in contract | YES — Workers Analytics Engine | YELLOW |
| Cloudflare Cache Purge | API token (Bearer) | YES — `Zone.Cache Purge` scope only; explicitly documented | YES — `CLOUDFLARE_API_TOKEN` in Worker secrets | N/A | YES — 429 retry documented | Cloudflare sub-processor (same vendor) | YES — every purge logged to revocations | GREEN |
| Resend | Bearer | PARTIAL — Resend API key is domain-scoped but grants all send operations | YES — `RESEND_API_KEY` in Worker secrets | NO for inbound webhooks (resend-webhook worker) — signature NOT documented in resend.yaml | YES — 429 in retry policy | YES — noted in contract | YES — metrics listed | YELLOW |
| Beehiiv | Bearer (outbound) + HMAC-SHA256 (webhook) | PARTIAL — API key is publication-scoped; no fine-grained operation scope | YES — `BEEHIIV_API_KEY` in Worker secrets | YES — HMAC-SHA256 documented in contract; enforcement requirement noted | YES — retry 3x on 429/5xx | YES — DPA + SCC noted, but not confirmed | YES — Workers Analytics Engine + Sentry | YELLOW |
| openFDA | Optional API key (query param) | YES — public API; key only for rate-lift | NO — API key in query param if used | N/A | YES — 429 handled; dual cache (R2 + KV) | NO — public API, no DPA | YES — source_health logging | GREEN |
| FDA 510(k)/De Novo/PMA | None (public) | YES — public read-only | N/A | N/A | YES — timeout + retry | NO — public, no DPA | YES — source_health logging | GREEN |
| EMA / EUDAMED | None (public) | YES — public read-only | N/A | N/A | YES — 3-step fallback chain | NO — public, no DPA | YES — source_health logging | YELLOW (all-three-fail ambiguity — see NEW-S-004) |
| MHRA | None (public) | YES — public read-only | N/A | N/A | YES — retry documented | NO — public, no DPA | YES — source_health logging | GREEN |
| PMDA | None (public) | YES — public read-only | N/A | N/A | YES — retry documented | NO — public, no DPA | YES — source_health logging | GREEN |
| NMPA | None (public, READ-ONLY) | YES — public read-only | N/A | N/A | YES — do_not_alert_on_repeat_5xx | NO — public, no DPA | YES — source_health logging | YELLOW (enforcement posture undocumented — see NEW-S-007) |
| TGA | None (public) | YES — public read-only | N/A | N/A | YES — retry documented | NO — public, no DPA | YES — source_health logging | GREEN |
| Health Canada | None (public) | YES — public read-only | N/A | N/A | YES — retry documented | NO — public, no DPA | YES — source_health logging | GREEN |
| DeepL | `DeepL-Auth-Key` header | PARTIAL — key grants full DeepL Pro account access | YES — `DEEPL_API_KEY` in Worker secrets | N/A (outbound only) | YES — 429/456/503 documented with Claude/GPT-4 fallback | YES — DPA critical (Free vs Pro data retention gap) | YES — Workers Analytics Engine | YELLOW |

Verdict scale: GREEN = all 8 columns answered and strong; YELLOW = 1–2 columns weak or carrying open questions; RED = 3+ columns weak (none at RED, but several YELLOW items have P0/P1 sub-findings below).

---

## New findings (cycle-6, beyond F-S-001 through F-S-010)

### NEW-S-001 [P1] Resend inbound webhook has no documented signature verification

**File**: `docs/specs/contracts/resend.yaml`
**Lines**: 96–104 (webhooks block)

The `resend.yaml` contract documents inbound webhook events (`email.bounced`, `email.complained`, `email.unsubscribed`) that mutate `subscribers.status` directly in Supabase. The contract names a handler (`workers/resend-webhook`) but does not document how that handler authenticates inbound calls from Resend. Resend supports Svix-based webhook signatures (`Svix-Signature`, `Svix-Id`, `Svix-Timestamp` headers); without verification, any caller who knows the endpoint URL can forge bounce or unsubscribe events, letting an adversary silently unsubscribe arbitrary subscribers.

**Attack vector**: adversary POSTs a forged `email.complained` event to `https://api.romasbrief.com/webhooks/resend`; worker trusts it; subscriber is silently unsubscribed.

**Fix**: Add to `resend.yaml x-romas-policy`:
```yaml
webhook_signature:
  mechanism: svix
  header_set: [Svix-Id, Svix-Timestamp, Svix-Signature]
  secret_env: RESEND_WEBHOOK_SECRET
  tolerance_sec: 300
  verification: required — reject any request missing or failing sig check with HTTP 401
```
The handler must call Svix SDK's `wh.verify(body, headers)` before processing any event. Tracked as NEW-R-001 in reliability report.

---

### NEW-S-002 [P1] DeepL Free tier data retention leaks pre-publish editorial content

**File**: `docs/specs/contracts/deepl.yaml`
**Lines**: 149–152

The contract explicitly acknowledges: "DeepL Pro retains 0 days; DeepL Free retains 30 days (DPA requires Pro for production)." Launch plan uses DeepL Free for initial volume. Any LATAM article body (potentially embargoed, pre-publish editorial content) sent through DeepL Free is retained by DeepL for 30 days with no DPA constraint on use. This is not PHI but is editorially sensitive (embargo-risk) and conflicts with the DPA requirement stated in the same contract.

**Attack vector**: internal — pre-publish editorial content from an embargoed trial enters DeepL's 30-day retention window; early-disclosure risk if DeepL infrastructure is breached.

**Fix**:
1. Block DeepL Free use for any article where `embargoed = true` at the time of translation.
2. Require DeepL Pro before the first LATAM article enters the pipeline (not at $2,500 subscriber threshold — at first ES/PT article, which could happen M1).
3. Add gate to `deepl.yaml x-romas-policy`: `production_tier: pro_required_before_first_latam_publish`.

---

### NEW-S-003 [P1] Beehiiv US-hosted + EU subscribers: SCC gate not confirmed pre-launch

**File**: `docs/specs/contracts/beehiiv.yaml`
**Lines**: 222–224

The contract notes: "Beehiiv hosts in US; confirm DPA covers EU subscriber data transfer under SCCs." This is flagged but not closed — the contract leaves it as a future confirmation. EU subscriber emails are personal data under GDPR Article 46; transfer to a US-hosted processor requires either SCCs (Standard Contractual Clauses) or adequacy decision. The EU adequacy decision does not cover Beehiiv's jurisdiction. Without executed SCCs, sending EU subscriber data to Beehiiv is a GDPR violation from the first EU subscriber.

**Attack vector**: regulatory — DPA authority (e.g., Ireland DPC) finds EU email data transferred to US Beehiiv without SCCs; fine exposure up to 4% of global turnover.

**Fix**: Confirm Beehiiv has a current DPA + SCCs. Add to pre-launch checklist: "Beehiiv DPA with SCCs signed — BLOCKING." If Beehiiv cannot produce SCCs, gate EU subscriber acquisition behind an alternative delivery path (Resend + Supabase direct, with explicit EU region constraint) or use EU-hosted competitor. Document in `Docs/DPA-inventory.md`.

---

### NEW-S-004 [P2] EMA three-step fallback all-fail leaves ambiguity

**File**: `docs/specs/contracts/ema.yaml`
**Lines**: 69–73

The contract states: "all_three_fail: log to source_health; do NOT publish EU regulatory item this cycle." The wording is correct as a publish-block directive, but it leaves two gaps:

1. There is no alert on all-three-fail. A silent no-publish is operationally invisible — editorial-director and regulatory-analyst receive no notification that an EU regulatory item was dropped.
2. "This cycle" is undefined in terms of retry cadence. If EUDAMED, NB-OG, and MDCG all fail Monday, does the item retry Tuesday automatically, or does it require manual requeue?

**Fix**: Add to `ema.yaml x-romas-policy`:
```yaml
all_three_fail:
  log: source_health
  alert: Sentry P2 + email to regulatory-analyst within 5 minutes
  publish_block: true
  retry_cadence: next cron cycle (next business day 10:30 UTC)
  manual_requeue: not required; item remains in queue until primary_source_url verified
```

---

### NEW-S-005 [P2] Voice consent revocation cascade undocumented for R2 archive

**File**: `docs/specs/contracts/elevenlabs-tts.yaml`
**Lines**: 100–103 (`x-romas-policy.consent`)

The contract references `Docs/voice-consent-registry.md` and gates publish on `pre_publish_gate: true`, but does not define what happens if Kimal revokes voice consent post-launch. Specifically: the WAV master files in `romas-audio-archive` (private R2 bucket) and the MP3 files served from `romas-audio-cdn` (public R2 bucket via CDN) were generated under the consented voice. Post-revocation, do those artifacts need to be:
(a) purged from R2 and CDN (treatment: same as article revocation), or
(b) left in place (past publications under consented period remain valid)?

This is a legal question with an operational implementation path. Neither is documented.

**Fix**: Document in `Docs/voice-consent-registry.md` (F-S-003 deliverable):
```
revocation_procedure:
  future_audio: stop all new generation immediately; switch to PlayHT clone or text-only
  past_audio_r2_archive: retain under consented-period defense (legal sign-off required)
  past_audio_cdn: if legal advises purge — trigger full revocations workflow for all audio_jobs
    with voice_engine_used='elevenlabs'; run cdn-purge-watchdog against all published audio URLs
  timeline: revocation decision → execution < 24 hours
  responsible: Kimal (decision) + cms-engineer (execution)
```

---

### NEW-S-006 [P2] DeepL translation verification gap: Rule 1 risk on Quick-Hit clinical claims

**File**: `docs/specs/contracts/deepl.yaml`
**Lines**: 118–125

ADR-0013 defines a two-stage pipeline: DeepL primary + Claude 3.5 Sonnet verification pass. The verification pass fires only for `composite_score >= 70` (Strong + Hero bands). Standard, Quick-Hit, and Reference articles ship with DeepL output alone. The contract acknowledges this but does not flag the Rule 1 implication.

Rule 1 states: "No primary source URL → no publish." Rule 1 does not mention translation quality, but a mis-translated clinical claim that cites the original-language source as primary source technically satisfies Rule 1 while violating editorial integrity (the English body contains a materially wrong claim).

**Attack vector**: LATAM article in Quick-Hit band cites ANVISA primary source URL (satisfies Rule 1) but DeepL renders a dosimetric value incorrectly (e.g., "28 Gy" translated as "28 cGy" due to unit ambiguity in Portuguese). Published without verification pass.

**Fix**: Add a minimum safeguard for clinical-claim verification regardless of score band:
```yaml
verification_policy:
  hero_strong:  claude_verification_pass: required
  standard:     glossary_match_check: required  # glossary terms must appear correctly
  quick_hit:    glossary_match_check: required
  reference:    glossary_match_check: required
  all_bands:    clinical_units_regex_check: required
    # regex: values adjacent to Gy, cGy, fractions, dose-rate must be reviewed
    # implementation: add to deepl stage-2 as a lightweight validator (no LLM call)
```
This is not a Rule 1 violation today; it is a proactive editorial integrity hardening. Flag severity P2 because the risk materializes only with LATAM clinical content, which is Day 30+ volume.

---

### NEW-S-007 [P2] NMPA read-only posture has no technical enforcement

**File**: `docs/specs/contracts/nmpa.yaml`
**Lines**: 31–52

The contract correctly documents READ-ONLY ingest only and prohibits Chinese subscriber hosting. The posture is policy-only: there is no documented technical mechanism that enforces this (e.g., firewall rules, IP egress allowlist, Cloudflare Worker route restrictions, or monitoring that fires if a write is attempted against an NMPA endpoint). "Documentation says read-only" is not equivalent to "system cannot write."

For NMPA specifically the risk is low (public regulatory records; no authentication; no write API surface), but the subscriber prohibition has no technical guard either — nothing prevents a future Worker from creating a Beehiiv segment for Chinese email addresses.

**Fix**:
1. Add a CI/CD lint rule: any Worker that calls `nmpa.gov.cn` must be tagged `read_only: true` in `wrangler.toml`; CI fails if a tagged Worker makes a non-GET HTTP call.
2. Add a Supabase row-level guard or application-layer check: if a new subscriber's country-code resolves to CN, reject the subscription with a logged reason (not a public-facing error) until the 10k revisit gate is reached.
3. Document these guards in `nmpa.yaml x-romas-policy`.

---

### NEW-S-008 [P2] OpenAI Whisper 30-day data retention on pre-publish audio scripts

**File**: `docs/specs/contracts/whisper.yaml`
**Lines**: 100–103

The contract documents `data_retention: 30 days at OpenAI (no training)` and flags `dpa_required: true`. What the contract does not resolve: ROMAS Wire audio scripts (`audio_jobs.script_md`) are pre-publish editorial content. When sent to Whisper for transcription, the full article script is transmitted to OpenAI and retained for 30 days under OpenAI's standard retention terms. For most articles this is low-risk (public-domain clinical news), but for any embargoed article whose audio is generated before the embargo lifts, the audio script sits in OpenAI's infrastructure for up to 30 days with no guarantee of early deletion.

**Fix**:
1. Hard rule: embargoed articles (`articles.embargoed = true`) do not have audio generated until `embargo_until < now()`. This should be a schema-enforced gate (add to audio pipeline pre-check, not schema CHECK because the pipeline runs post-embargo).
2. For non-embargoed articles, OpenAI's 30-day retention with no-training is acceptable for public editorial content; document this explicitly in `whisper.yaml` so future reviewers understand the decision was deliberate.
3. Evaluate Zero Data Retention (ZDR) agreement with OpenAI — available on Enterprise tier. Add to `Docs/DPA-inventory.md` as a revisit item at launch (not a blocker for Day 1 with zero embargoed audio).

---

### NEW-S-009 [P3] PlayHT DPA gap: voice consent registry references ElevenLabs only

**File**: `docs/specs/contracts/playht-tts.yaml`
**Lines**: 84–87

The contract references `voice_consent_registry: Docs/voice-consent-registry.md` (mirroring ElevenLabs contract) but the consent registry deliverable (F-S-003, R-110) was scoped primarily around ElevenLabs. PlayHT clone voices have separate consent mechanics (PlayHT Voice Cloning Terms require the voice donor to consent via PlayHT's own flow, not just a ROMAS internal document). If ROMAS Wire relies on a custom PlayHT clone, the consent path may be different and must be separately documented.

**Fix**: Ensure `Docs/voice-consent-registry.md` covers both vendors with their vendor-specific consent evidence (ElevenLabs: Voice Lab consent confirmation link + date; PlayHT: cloning consent confirmation + PlayHT account ID).

---

### NEW-S-010 [P3] Three-edition publish race: cross-edition revocation has no idempotency story

**File**: `docs/specs/contracts/supabase-schema.sql`
**Lines**: 262–272 (revocations table)

ROMAS Wire publishes three geographically timed editions (implied by APAC/EU/Americas cadence). An article can be published to APAC at 22:00 UTC, then revoked at 02:00 UTC before EU (06:00 UTC) or Americas (11:00 UTC) editions send. The `revocations` table records `audio_job_id`, `article_id`, and `cdn_purge_at`, but the schema does not track which Beehiiv post sends correspond to which edition. When Beehiiv's `external_id` idempotency key is `issue_{YYYY-MM-DD}_{tier}`, a revocation issued after APAC send but before EU send would need to:

1. Prevent the EU and Americas Beehiiv sends from dispatching.
2. Optionally send a revocation/correction notice to APAC subscribers who already received the issue.

Neither behavior is documented in the contracts.

**Fix**: Add to Beehiiv contract and revocations schema:
```yaml
# beehiiv.yaml
revocation_handling:
  before_send: if revocations table has a row for article_id with created_at < publish_at → cancel send
  after_send: revocation notice is a separate Resend transactional email to affected-edition subscribers
  implementation: workers/issue-publisher checks for revocation before each edition send
```
Add `edition` column to `revocations` (nullable; set when a partial revocation occurs mid-multi-edition run).

---

### NEW-S-011 [P3] PIPL posture for NMPA ingest needs legal sign-off documentation

**File**: `docs/specs/contracts/nmpa.yaml`
**Lines**: 44–52

The contract reasons: "Read-only ingest of public NMPA records does NOT trigger PIPL data-export restrictions (we are not transferring Chinese personal data out of China). We are reading public regulatory records — same legal posture as any external journalist or analyst."

This reasoning is defensible but needs to be on record as a legal opinion, not an engineering conclusion. PIPL (Personal Information Protection Law) restricts transfer of personal information of Chinese nationals. NMPA regulatory records contain device names and manufacturer names, not personal information of individuals, so the reasoning is likely correct. However, PIPL's scope continues to be interpreted broadly by Chinese authorities.

**Fix**: Add a comment to `nmpa.yaml` requiring:
```yaml
pipl_legal_review:
  status: required before first NMPA citation is published
  opinion_required_from: ROMAS legal counsel or outside counsel with China regulatory expertise
  opinion_format: written memo in Docs/legal/pipl-nmpa-opinion.md
  blocking: yes — no NMPA citation in a published article until opinion is on file
```
This is P3 because NMPA content is editorial discovery (no Chinese subscribers; the article itself is EN-language content about Chinese regulatory approvals of RT devices, which is legitimate journalism), but "I think it's fine" is not adequate at an institutional level.

---

## Cycle-1 finding status review

| Finding | Original severity | Status in cycle-6 contracts | Notes |
|---|---|---|---|
| F-S-001 Revoke kill-switch no watchdog | P1 | RESOLVED in contract — `cloudflare-cache-purge.yaml` x-romas-policy documents cdn-purge-watchdog with 90s alert threshold; `revocations.cdn_purge_at` audit column exists | Watchdog cron `*/1` documented in `integration-review.md:66`. Implementation required at M2. |
| F-S-002 RLS bypass for subscriber_count via service-role | P1 | PARTIALLY RESOLVED — beehiiv.yaml adds `subscriber_sync.webhook_handler` that writes to `subscribers.status` via service-role; RLS policies in supabase-schema.sql do not cover `subscriber_count` view; view has no RLS | The app-layer guard (render only if `>= 2500`) is still a plan-level recommendation, not implemented. The beehiiv-webhook worker's service-role write surface is now bounded (subscription status only) but not constrained by RLS. |
| F-S-003 Voice clone consent undocumented | P2 | PARTIAL — both TTS contracts reference `Docs/voice-consent-registry.md`; file not yet authored | R-110 open. Now widened by NEW-S-005 (post-revocation archive behavior) and NEW-S-009 (PlayHT-specific consent). |
| F-S-004 EUDAMED secondary-source workaround | P2 | RESOLVED — `ema.yaml` explicitly bans `meddeviceguide.com` as primary; three-step official fallback documented | Residual gap: no alert on all-three-fail (NEW-S-004, P2). |
| F-S-005 Secrets hygiene not codified | P2 | OPEN — no `.env.example` or `SECRETS.md` visible in repo | Still P2; all 16 contracts now name their env var; codification of inventory needed. |
| F-S-006 Service-role key blast radius | P2 | PARTIALLY MITIGATED — integration-review §I-01 scopes service-role to `workers/cms-writer` only | Beehiiv-webhook worker also needs service-role for `subscribers` writes; blast radius is now two Workers, not one. |
| F-S-007 Supply-chain risk on TTS SDK | P2 | RESOLVED — both TTS contracts mandate direct HTTP, no SDK; `api_version_pinned` documented | |
| F-S-008 GDPR posture undocumented | P3 | PARTIALLY RESOLVED — DPA documented in Resend, Beehiiv, DeepL, Whisper contracts | Beehiiv SCC gap (NEW-S-003, P1) is new. DPA inventory file not yet authored. |
| F-S-009 Embargo-leak surface | P3 | OPEN — `embargo_holds` RLS policy `embargo_read_restricted` exists in schema; Worker service-role still bypasses | Low risk; bounded by `editorial_director` + `fact_checker` role gate. |
| F-S-010 Plain-text body_md | P3 | ACCEPTED — no PHI in scope; RLS gates reads | No change. |

---

## OWASP Top 10 (2021) re-mapping for cycle-6

| OWASP category | Contract evidence | Gap / verdict |
|---|---|---|
| A01 Broken Access Control | RLS on all 11 tables; `editor_publish` policy; `audio_qa_flip` policy; `embargo_read_restricted` | PARTIAL — `subscriber_count` view has no RLS; service-role bypasses RLS in two Workers (cms-writer + beehiiv-webhook). App-layer guard not yet implemented (F-S-002 open). |
| A02 Cryptographic Failures | TLS everywhere (Cloudflare terminates); Supabase encrypts at rest; no custom crypto | PASS — no custom cryptography in scope; voice archive in private R2 bucket. |
| A03 Injection | Supabase client parameterizes queries by default; no raw SQL construction in contracts; Beehiiv/Resend inputs are typed (Pydantic/Zod equivalent via schema definitions) | PASS at plan level — enforce Zod validation at every Worker boundary at M2. |
| A04 Insecure Design | Audio QA gate is schema-enforced (`audio_publish_requires_qa` CHECK constraint); embargo consistency enforced by CHECK constraint; `audio_revoke_requires_reason` enforced | PASS — design controls are strong. Cross-edition revocation story (NEW-S-010) is a design gap. |
| A05 Security Misconfiguration | R2 bucket split (private WAV / public MP3) documented; CF API token scoped to `Zone.Cache Purge` only; RLS enabled on all tables | YELLOW — PlayHT sub-scope not narrowed (NEW table row YELLOW); NMPA read-only not technically enforced (NEW-S-007). |
| A06 Vulnerable Components | Direct HTTP instead of SDKs for TTS (F-S-007 resolved); `pnpm audit --audit-level=high` in CI plan (ADR-0010) | OPEN — no CI exists yet; audit gate is planned not implemented. |
| A07 Identification & Authentication | Supabase Auth for CMS; Cloudflare Access for `/cms` route (email allowlist); service-role for Workers only | YELLOW — Beehiiv webhook HMAC noted as required but not yet implementation-proven; Resend webhook has no signature verification documented (NEW-S-001). |
| A08 Software & Data Integrity | Forward-only migrations; `external_id` idempotency in Beehiiv; `issue_date` tag idempotency in Resend | PARTIAL — hash-chained audit trail deferred to Phase 3; cross-edition revocation idempotency gap (NEW-S-010). |
| A09 Logging & Monitoring | Every contract specifies metrics + sink (Workers Analytics Engine + Sentry); `source_health` table tracks fetch failures | YELLOW — EMA all-three-fail has no alert (NEW-S-004); Resend webhook failures have no documented alert path. |
| A10 SSRF | Outbound calls limited to 16 documented integration endpoints; Cloudflare Workers do not serve as a general-purpose proxy | PASS at plan level — enforce egress allowlist in `wrangler.toml` at M2. |

---

## Top 5 security blockers (P0/P1)

These must be resolved before any subscriber data is collected or any article publishes to a real audience.

### BLOCKER-SEC-1: Resend webhook has no signature verification (NEW-S-001, P1)
A forged webhook can mass-unsubscribe any subscriber. Fix: implement Svix signature check in `workers/resend-webhook`; add spec to `resend.yaml`. No code exists yet — add to M2 acceptance criteria.

### BLOCKER-SEC-2: DeepL Free 30-day retention on pre-publish editorial content (NEW-S-002, P1)
Embargoed content would enter DeepL's 30-day retention window. Fix: require DeepL Pro before first LATAM article; add embargo guard in pipeline. This is a Day-1 risk if any LATAM article is prepared before the Free → Pro upgrade.

### BLOCKER-SEC-3: Beehiiv SCC gap for EU subscribers (NEW-S-003, P1)
GDPR transfer mechanism is unconfirmed. Fix: execute Beehiiv DPA + SCCs before EU subscriber acquisition begins (which could happen Day 1 if the newsletter is publicly accessible). Legal sign-off required.

### BLOCKER-SEC-4: F-S-001 watchdog implementation at M2 (cycle-1 carry-forward, P1)
The CDN purge watchdog is fully specified in the contract (`cloudflare-cache-purge.yaml`) but no code exists. If a revoked article's CDN purge silently fails, the audio remains live indefinitely. This is a patient-safety-adjacent risk for a radiation oncology publication. Must be the first Worker implemented at M2.

### BLOCKER-SEC-5: F-S-002 subscriber_count app-layer guard (cycle-1 carry-forward, P1)
Business invariant: subscriber count hidden until 2,500. `subscriber_count` view has no RLS. Any Worker with service-role can read it and expose it. App-layer guard must be implemented in `apps/reader` as a server component gate before the reader site goes public.

---

## Revision history

| Date | Version | Change |
|---|---|---|
| 2026-05-14 | 1.0.0 | Cycle-1 baseline (docs/specs/security-findings.md). 10 findings. |
| 2026-05-14 | 2.0.0 | Cycle-6 contract audit. 11 new findings (NEW-S-001 through NEW-S-011). Cycle-1 status review. OWASP re-mapping. 5 security blockers identified. |
| 2026-05-21 | 2.1.0 | build-2026-05-21 qa-pass: 26 → 14 vulns (0 critical) via D-025 next 14.2.35 bump + 3 transitive overrides. ADR-0015 v2 acceptance. |
| 2026-05-22 | 2.2.0 | /team-qa cycle-5: ADR-0015 v2 14-CVE inventory still matches; @supabase/ssr 0.10.3 + supabase-js 2.106.1 added 0 new CVEs; SECRETS.md v1.0.0 lands 27-secret inventory + rotation policy; voice consent template covers donor cascade. No new P0/P1 security findings introduced by M1-completion or M1c-closeout. |
| 2026-05-31 | 3.0.0 | /team-qa cycle-7 (code-bearing, commit 741c993). See section below. |

---

## Cycle-7 security findings (2026-05-31 · commit 741c993 · post Waves 1–3)

### Findings

| ID | Severity | OWASP | Finding | Evidence | Status / fix |
|---|---|---|---|---|---|
| **S-C7-01** | **P0** | A07 / secrets mgmt | **Live Vercel API deploy token (`vcp_…`) + team id committed in plaintext** in a working `curl` deploy command | `Docs/specs/architecture.md:314` + `apps/web/AGENTS.md:35` (history); `gitleaks detect` flags both | Working tree **redacted** (commit 741c993 → `$VERCEL_TOKEN`/`$VERCEL_TEAM_ID`). **Token still in git history → MUST be rotated at vercel.com (revoke + reissue).** History-scrub (force-push) is gated + secondary to rotation. **Blocks GO.** |
| S-C7-02 | RESOLVED | A06 | 5 high Next.js CVEs (14.2.35) | prior cycle | Closed — SHIP-01 bumped to 15.5.18; `pnpm audit --audit-level=high` = 0. |
| S-C7-03 | RESOLVED | A03 | Reader markdown XSS (`dangerouslySetInnerHTML` on unsanitized hand-rolled renderer) | `apps/web/app/article/[slug]/page.tsx:213` | Closed — SHIP-07 `apps/web/lib/markdown.ts` escapes input first + protocol-allowlists hrefs; 8 tests (script/img-onerror inert, javascript:/data: dropped). |
| S-C7-04 | INFO (sound) | A01 | RLS UPDATE policies lacked WITH CHECK | `0011_rls_policies.sql` | SHIP-16 migration 0012 adds WITH CHECK to editor_publish + audio_qa_flip (validated via rollback txn; pending live apply). |
| S-C7-05 | INFO (sound) | A07 | Beehiiv webhook auth = shared-secret custom header (Beehiiv has no HMAC) | `workers/beehiiv-webhook/src/sync.ts` | Constant-time `verifySecret`; ADR-0019. Acceptable per Beehiiv's capabilities. |
| S-C7-06 | INFO (sound) | A07 | Resend webhook = Svix signature verify | `workers/email-canary/src/svix.ts` | Per-spec HMAC-SHA256 + 300s replay tolerance + constant-time compare; 35 tests. |
| S-C7-07 | INFO (sound) | A01 | CMS audio-QA publish gate | `apps/cms/app/api/audio-qa/[id]/route.ts` + `lib/audio-qa-gate.ts` | 3-layer defense (RLS who · DB CHECK whether · route-handler re-fetch+gate); state-machine guards. |
| S-C7-08 | P2 | A09 | Audio worker `LOUDNORM_ENDPOINT` fail-closed now correct | SHIP-14 | Closed — skips rather than ship wrong loudness. |

### Independent verification (this cycle)
- `gitleaks detect --source .` (full history): exactly **2** findings, both the **same** S-C7-01 Vercel token (architecture.md + AGENTS.md). No other secrets in history. `svix.test.ts` `whsec_` fixtures correctly annotated `gitleaks:allow`.
- Working-tree secret scan (`gitleaks protect --staged`, the pre-commit gate): **CLEAN** after redaction.
- `.env` untracked + gitignored; no hardcoded keys in `apps/**` / `workers/**` / `packages/**` source.
- `pnpm audit --audit-level=high`: **0** high/critical.

### Verdict
**Secret scan: working tree CLEAN · git history NOT CLEAN (the Vercel token).** One P0 (S-C7-01) — rotation required. All other this-session surfaces (XSS, RLS, webhook auth, QA gate) reviewed and sound. **Counts: P0×1 · P1×0 · P2×1 · INFO×5.**

---

## Cycle-6 cross-reference (2026-05-28)

Cycle-6 surfaced 3 NEW BLOCKERS that supersede the prior cycle's framing for this artifact's scope. Full evidence in `Docs/qa/risk-register.md` cycle-6 section + `Docs/specs/qa-report.md` cycle-6 verdict.

- **B-17** — Doc-vs-reality drift: CLAUDE.md §12 + tasks.md describe a fictional M1+M2+M3 implementation state. Future planning load-bearing on these docs will hallucinate.
- **B-18** — Lockfile drift: `pnpm-lock.yaml` has 0 references to the 3 untracked workers (audio-producer / cdn-purge-watchdog / rss-publisher = 2,317 LOC). Turbo typecheck FAIL + build FAIL gates all M2-B/C verification.
- **B-19** — M3 (reader + Beehiiv webhook + Resend transactional) is NOT STARTED in code; tasks.md Phase 5/6/7 `[x]` claims are false against the working tree. apps/web/app/page.tsx is a 21-line T-101 stub.

Until B-17/18/19 close, this artifact's prior verdict is **superseded** for any Day-1 launch readiness decision. The artifact's M1/M2-A scope remains valid where the underlying code exists in HEAD.
