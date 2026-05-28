---
title: Risk Register — Consolidated (plan-level + design-time)
version: 1.1.0
date: 2026-05-14 (v1.0) · 2026-05-15 (v1.1 — M0c2 design-time risks DR-* appended)
sources: delivery-plan.md R-01..R-23 + cycle-1 critic F-* + this QA pass NEW-* + Test Engineer trace gaps G-NN + M0c2 design-review DR-NNN
---

# Risk Register — Consolidated Plan-Level

## Severity scale

- **Blocker** — release-stopping; team-build cannot start, or product cannot ship safely
- **High** — must close before relevant milestone (M0/M1/M2/M3)
- **Medium** — should close; tracked for cycle-7 follow-on
- **Low** — nit; defer-OK with rationale

## Blockers (release does not start)

| ID | Risk | Source | Owner | Mitigation status |
|---|---|---|---|---|
| **B-01** | **40 placeholder task IDs** (T-NEW1..T-NEW20, T-225..T-230, T-310A..T-310D, T-651..T-660) referenced by FRs but **never written as concrete task rows** in MASTER plan or delivery-plan. Cycle-4/5/6 each promised follow-on; none ran. | Test Engineer G-01..G-08 | Delivery Lead + Kimal | **OPEN — must close before /team-build start** (~3 person-days of doc-only work) |
| **B-02** | **88 promised A-NNN acceptance tests unwritten** in test-qa-plan §6 catalog (73 task-cell A-101..A-705 + 15 critic-promised A-061..A-075). /team-qa cannot proceed without acceptance tests. | Test Engineer G-01 | QA Lead | OPEN — must close before /team-build start |
| **B-03** | **FR-002 (signal scoring) + FR-003 (top-5) map to WRONG tasks** (T-117 CI, T-118 secrets, T-119 observability). No signal-scorer task exists. | Test Engineer G-02 | Delivery Lead | OPEN |
| **B-04** | **Tier 5 Video Podcast (FR-022) has no MASTER §G.5 body, no ADR-0012, no concrete tasks**. T-651..T-660 are scope-lock prose only. Day-60 launch un-actionable. | Test Engineer G-04 + cycle-3 lock | video-operations TBD + Kimal | OPEN — ADR-0012 deferred to Day 30 per Q6, but task-row creation must precede |
| **B-05** | **Launch Plan v1.1 §6 Sample 5 cites `meddeviceguide.com` as primary source** — banned per cycle-2 R-014 / SSOT §6. **Live Rule-4 violation in the 500-article launch backlog.** | Mechanical T-02 | regulatory-analyst | OPEN — M0 deliverable |
| **B-06** | **Doc-version drift on disk**: Master-Strategy v2.0 vs SSOT v2.1; Runbook v1.0 vs v1.1; Launch Plan v1.0 vs v1.1. R-001/R-002/R-003 in M0; not yet run. | Cycle-1 G-001/002/017 + mechanical T-12 | doc author | OPEN — M0 deliverable |
| **B-07** | **Design Spec v1.1 + Audio Architecture v1.0 missing**. Block design-system-keeper, web-engineer, audio-producer authoring work. | Cycle-1 G-005 + cycle-3 lock | Kimal + design-system-keeper | OPEN — R-005, R-006-A in M1 |
| **B-08** | **CDN purge watchdog (F-S-001)** must be the first Worker built at M2 — without it the 60s revoke SLA is unenforced. Implementation deferred to M2 R-211. | Cycle-1 + Security carry-forward | DevOps | OPEN — M2 |
| **B-09** | **Resend webhook signature verification absent** — forged `email.complained` mass-unsubscribes subscribers. | NEW-S-001 (Security persona) | web-engineer | OPEN — M3 |
| **B-10** | **Beehiiv DPA + SCC for EU subscribers unconfirmed** — GDPR violation from first EU subscriber. | NEW-S-003 | Kimal (legal) | OPEN — pre-launch gate |
| **B-11** | **Next 14 residual CVE inventory** — 14 next advisories patched only in Next 15.x.y (5 HIGH, 7 MOD, 2 LOW) remain after build-2026-05-21 qa-pass intervention. 9 of the 14 are documented applicable to ROMAS Brief's M3 architecture per ADR-0015 v2. Controls (Zod-at-RSC-boundary, body-size cap, WAF rate-limit, no-`beforeInteractive`, sanitiser pipeline, no-user-URL-driven outbound fetches in RSC, no-cache user-segmented routes) are documented but NOT yet implemented (no live RSC code exists). | ADR-0015 v2 + Docs/qa/security-findings.md build-2026-05-21 qa-pass | web-engineer + DevOps + architecture-reviewer | OPEN — M3 implementation gate. Each control must land alongside its corresponding RSC code. Quarterly re-evaluation per ADR-0015 closing conditions. |

## High (must close before relevant milestone)

| ID | Risk | Severity / Likelihood | Source | Owner | Status |
|---|---|---|---|---|---|
| H-01 | DeepL Free retains text 30 days. Pre-publish editorial content (incl. embargoed) sits in retention. Must upgrade to DeepL Pro before first LATAM article. | H / M | NEW-S-002 | DevOps + Kimal | OPEN — M1 |
| H-02 | PlayHT retry: 1 attempt, no backoff. Sole TTS failover can lose audio on first transient error. | H / M | REL-001 | audio-producer | OPEN — contract revision M1 |
| H-03 | Resend uses tag-idempotency not `Idempotency-Key` header. Worker retry after 504 sends duplicate email. | H / H | REL-002 | web-engineer | OPEN — contract revision M1 |
| H-04 | Beehiiv DLQ unspecified (no TTL, no retry interval, no escalation). Silent failure → undelivered issue indefinitely. | H / M | REL-003 | web-engineer | OPEN — M3 |
| H-05 | Inviolable-rule drift: Master-Strategy §6.1 + Runbook §6 list 5 rules vs CLAUDE.md/AGENT.md/SSOT 6. Agent loading those docs operates under weaker constraint. | H / H | Cycle-1 H-08 + mechanical T-11 | doc author | OPEN — R-004 M0 |
| H-06 | 8-module homepage LCP risk: ~30 images above-the-fold. Mobile slow-3G LCP <2.5s requires aggressive image-optimization plan undefined in spec. | M / H | Performance NFR-001 | web-engineer + design-system-keeper | OPEN — M3 |
| H-07 | Three-edition publish wall-clock budget unmodeled. 3 freeze points/day not 1. Editorial capacity vs sustainability unknown. | M / H | Performance NFR-004 | editorial-director + Kimal | OPEN — pre-M3 |
| H-08 | Right-to-erasure endpoint missing FR despite GDPR commitment in NFR-016. | H / M | Performance audit | web-engineer | OPEN — add FR-039 + task |
| H-09 | LATAM editorial pre-launch capacity in Spanish/Portuguese — locked Q11 LLM-translate (DeepL+Claude) but **glossary seeding (~50 PT-EN + ~50 ES-EN terms) is a W-7 deliverable** with no owner currently assigned. | H / M | ADR-0013 + cycle-6 follow-on | editorial-director | OPEN — W-7 |
| H-10 | Three-edition cross-edition revocation race: article revoked between APAC (22:00 UTC) and EU (06:00 UTC) sends. EU dispatch could still fire. | H / L | REL-006 + NEW-S-010 | web-engineer | OPEN — pre-M3 |
| H-11 | Lexicon expansion 30 → ~80 entries by Day 1 — owner = audio-producer; not yet assigned in calendar. | M / M | FR-037 + cycle-5 follow-on | audio-producer | OPEN — W-7 |
| H-12 | Voice consent registry (Q4) unauthored — pre-launch gate per ADR-0004. | H / M | Cycle-1 F-S-003 carry-forward | Kimal (legal) | OPEN — M1 |

## Medium (track for cycle-7 + later milestones)

| ID | Risk | Source |
|---|---|---|
| M-01 | Supabase query timeout not specified anywhere (REL-004) | Security/Reliability persona |
| M-02 | NMPA read-only posture documented but not technically enforced (NEW-S-007) | Security persona |
| M-03 | Whisper 30-day OpenAI data retention applies to pre-publish audio scripts; embargo gate needed (NEW-S-008) | Security persona |
| M-04 | Voice consent revocation cascade undefined for R2-stored WAV/MP3 artifacts (NEW-S-005) | Security persona |
| M-05 | DeepL Standard/Quick-Hit tier ships without Claude verification (NEW-S-006) | Security persona |
| M-06 | NMPA / TGA / Health Canada / MHRA timeouts (30s) exceed NFR-009 blanket 15s rule | Performance audit |
| M-07 | R2 cross-region replication has no owning task (cycle-1 F-P2-09) | Cycle-1 critic |
| M-08 | Coverage gap on secondary CHECK constraints (claims.confidence, title length, archetype/tier/status enums) — cycle-1 F-P2-05 | Cycle-1 critic |
| M-09 | EMA three-step fallback all-fail = silent dropout (no editorial alert) (NEW-S-004) | Security persona |
| M-10 | Cycle-1 F-P2-01/02/04/10/11/12 — 6 P2s from cycle-1 still tracked in remediation-plan but not closed | Cycle-1 |
| M-11 | A-030 title still reads "4 conditions" should be 5 (cycle-2 partial fix) | Test Engineer |
| M-12 | "scrape" anti-pattern leaked into delivery-plan, MASTER plan, test-qa-plan | Mechanical T-03 |

## Low

| ID | Risk | Source |
|---|---|---|
| L-01 | PlayHT voice clone consent may require separate evidence on file vs ElevenLabs (NEW-S-009) | Security |
| L-02 | NMPA PIPL legal-opinion-on-file pre-citation (NEW-S-011) | Security |
| L-03 | openFDA cache-miss + simultaneous live-fetch fail = empty results vs "fetch failed" indistinguishable (REL-008) | Reliability |
| L-04 | Whisper sync-Worker timeout exceeds CF limit → architecturally must be Queued Consumer or Durable Object (REL-009) | Reliability |
| L-05 | DeepL's Claude/GPT-4 fallback assumes ROMAS Brief Workers can import `llm-orchestrator` package; unconfirmed (REL-010) | Reliability |

## Top 5 release-readiness blockers (the gate items)

1. **B-01 placeholder tasks** — un-actionable T-IDs
2. **B-02 unwritten acceptance tests** — un-testable plan
3. **B-05 banned-source primary citation in Launch Plan §6 Sample 5** — Rule 4 violation in shipped content
4. **B-06 doc-version drift** — agents loading wrong-version docs operate on stale rules
5. **B-10 Beehiiv DPA / SCC** — first EU subscriber = GDPR violation

## Risk-register completeness check

| Source | Count | All risks present? |
|---|---|---|
| delivery-plan.md R-01..R-23 | 23 | Yes — propagated |
| Cycle-1 critic findings P0/P1 (2 P0 + 8 P1) | 10 | Yes — addressed in cycles 2-6 |
| Cycle-1 critic P2s (12) | 12 | Yes — tracked in remediation-plan |
| Security persona NEW-S-* | 11 | Yes — propagated |
| Reliability persona REL-* | 10 | Yes — propagated |
| Test Engineer G-* | 10 | Yes — propagated as B-* |
| Performance audit NFR risks | 6 | Yes |
| UX audit gaps | 6 | Yes — propagated as B-07 + M-* |
| M0c2 design-review DR-* | 7 | Yes — appended as design-time appendix |

**Total tracked: 95 risks** (88 plan-level + 7 design-time). This is consistent with a plan of this scope (47 artifacts, 38 FRs, 15 contracts, 12 ADRs, 8 components).

---

## Appendix: Cross-Reference Integrity Gaps — architecture-reviewer 2026-05-14

Sourced from `Docs/qa/test-coverage.md`. These supplement (do not duplicate) the existing risk rows above.

| ID | Severity | Title | File(s):line | Condition for closure |
|----|----------|-------|-------------|----------------------|
| XR-001 | P0 | All-tiers-Day-1 lock not propagated to ADR-0005, AGENT.md §13, CLAUDE.md §5 | `Docs/specs/adr/0005-rss-four-tier-feeds.md:21,49` · `AGENT.md:57,210` · `CLAUDE.md:§5` | All 3 files updated; Kimal sign-off |
| XR-002 | P0 | ADR-0013 schema delta (source_language, translation_provider, translation_verified) absent from cms-schema.md | `Docs/specs/adr/0013-latam-llm-translate.md` · `.claude/skills/cms-schema.md` | 3 columns + CHECK added; migration 0012_translation_tracking.sql authored |
| XR-003 | P0 | subscribers.region column absent — three-edition publish (FR-033) has no schema support | `Docs/specs/product-spec.md:FR-033` · `.claude/skills/cms-schema.md` | Column added; migration authored; T-NNN task assigned |
| XR-004 | P1 | CLAUDE.md §7 tech stack still says "Resend (or Postmark)" after ADR-0007 locked Resend | `CLAUDE.md:§7` | Updated to "Resend (transactional) + Beehiiv (newsletter)" |
| XR-005 | P1 | architecture.md §7 decision log frozen at ADR-0006; ADRs 0007–0013 absent | `Docs/specs/architecture.md:§7` | Rows appended for ADR-0007 through ADR-0013 |
| XR-006 | P1 | physics-reviewer agent has no mapped skill file | `.claude/agents/physics-reviewer.md` · `.claude/skills/` (no physics-review.md) | `.claude/skills/physics-review.md` authored |
| XR-007 | P1 | subscribers.beehiiv_subscription_id absent — ADR-0007 Beehiiv sync unimplementable | `.claude/skills/cms-schema.md` subscribers table | Column added; migration authored |
| XR-008 | P2 | Rule 6 prose in SSOT/CLAUDE.md cites 2 of 5 QA conditions; schema enforces 5 | `Docs/SSOT.md:§2 R6` · `CLAUDE.md:§4 R6` · `.claude/skills/cms-schema.md:96-103` | Prose updated to cite all 5 conditions |
| XR-009 | P2 | ADR-0011 action items reference `docs/specs/contracts/` (lowercase) — repo uses `Docs/` | `Docs/specs/adr/0011-whisper-transcription.md` | Path corrected in ADR action items |

---

## Appendix: Design-Time Risks — M0c2 /team-qa design-review (2026-05-15)

Sourced from `docs/qa/design-review.md` cycle-2 GO WITH CONDITIONS verdict. These are run-time verification gaps deferred from design-time to W-6 prototype phase, plus a small number of design-time decisions accepted with caveats.

| ID | Severity | Title | File(s) | Condition for closure |
|----|----------|-------|---------|----------------------|
| DR-001 | P1 | **Run-time a11y verification deferred** — measured contrast math passes design-time, but axe-core + Lighthouse a11y ≥95 + screen-reader landmark + keyboard-map + 200% text-size + reduced-motion all require a real DOM. | `Docs/design/a11y-audit.md` §run-time | W-6 prototype + Playwright + axe-core run; Lighthouse ≥95 per route captured to `screenshots/`; failures triaged to component spec |
| DR-002 | M | **Audio production volume scale untested** — 500-article launch needs ~14 hr finished audio at -16 LUFS. Single-narrator ElevenLabs cap + PlayHT failover untested at this volume; lexicon expansion 30→~80 entries also pending. | `Docs/ROMAS-Brief-500-Article-Launch-Plan.md` §6 + `H-02`/`H-11` | W-5 audio dry-run on 10-episode sample; loudness + pace + lexicon coverage measured |
| DR-003 | M | **Dark-mode contrast unconfirmed** — token set v1.2 measured against light surfaces only. Dark-mode token mirror absent from `tokens.json`. | `Docs/design/tokens.json` §3 | W-5 dark-mode token authoring + measured-ratio table per pair; design-system-keeper sign-off |
| DR-004 | L | **AudioStatusBadge per-state hues sit outside single-accent discipline** — pending=amber, skipped=slate, revoked=red, published=teal-deep. Accepted because each is a semantic-state signal (warn/neutral/error/ok), not a brand surface. Risk: if brand later restricts to single-accent, badges need re-design. | `Docs/design/components/AudioStatusBadge.md` | Either (a) lock semantic-state palette as canonical brand exception or (b) re-design to icon-only differentiation |
| DR-005 | L | **Tag pill touch-target 32×32 falls below AAA 44×44 target** — passes AA 24×24 minimum but tighter than recommended on mobile. Accepted for v1; revisit at Tier 5 (Day 60) mobile-first review. | `Docs/design/components/IssueHeader.md` tag spec | Mobile touch-target audit Day 60; either upsize pill or add 12px padding hit-area |
| DR-006 | L | **AudioPlayer Variant B (banner) overlap with iOS safe-area unverified** — Listen page sticky banner overlap with bottom safe-area on notched iPhones documented as design intent but never run on device. | `Docs/design/components/AudioPlayer.md` Variant B | W-5 device test on iPhone 14/15 Pro + Safari mobile |
| DR-007 | L | **prefers-reduced-motion enforcement is design-time spec only** — no eslint rule or runtime guard enforces that motion uses the `motion-safe:` Tailwind variant. Risk of accidental motion in PRs that bypass design review. | `Docs/design/ui-spec.md` §motion | M3 ESLint rule + CI lint gate per cycle-3 R-303 (sponsor firewall rule template) |

**Design-time risks: 7 total** (1 P1 + 2 M + 4 L). Zero P0 — all P0 contrast failures closed in cycle-2 with verified measurements (see `docs/qa/design-review.md` cycle-2 evidence section).

---

## Cycle-5 risk register refresh (2026-05-22 against full M1)

### Blocker carry-forward + status

| ID | Status as of cycle-5 | Notes |
|---|---|---|
| B-01 | OPEN — 40 placeholder T-NEW task IDs un-actionable | Mostly M3 reader + M6.5 video. M0c2 closed the T-225..T-230 + T-310A..D subset. |
| B-02 | OPEN — 88 unwritten A-NNN acceptance tests | Carry-forward; 79 pgTAP assertions added across build-2026-05-21 + M1c cycles. |
| B-03 | OPEN — FR-002/FR-003 task-ID misnumbering | Cosmetic. |
| B-04 | OPEN — Tier 5 Video Podcast un-actionable until ADR-0012 Day 30 | Soft blocker; not on Day 1 critical path. |
| B-05 | OPEN — Launch Plan §6 Sample 5 `meddeviceguide.com` Rule-4 violation | M0 carry-forward; editorial cannot ship Sample 5 until re-sourced. |
| B-06 | OPEN — Doc-version drift on disk | Partially closed cycle-1; full close needs per-doc audit. |
| **B-07** | **CLOSED** in M1-closeout — Design Spec v1.1 (R-005) + Audio Architecture v1.0 (R-006-A) landed |  |
| B-08 | OPEN — CDN purge watchdog deferred to M2 R-211 | Worker stub at `workers/cdn-purge-watchdog/.gitkeep`. |
| B-09 | OPEN — Resend webhook signature verification | Deferred M3. |
| B-10 | OPEN — Beehiiv DPA + SCC for EU subscribers | Kimal legal track. |
| B-11 | OPEN — 14 Next 14 residual CVEs accepted per ADR-0015 v2 | 9 of 14 applicable to M3 reader surface; controls must land alongside RSC code. |

### New cycle-5 findings (minor; not blockers)

| ID | Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|---|
| B-12 | team-build-critic dispatch reliability — 2 of 4 critic dispatches in this session had issues (truncated output, API 529). | M | M | Build Lead inline self-audit as documented fallback. Cycle-5 trace serves as critic-rerun on M1c-closeout. Flag for next cycle to re-run critic with fresh context. |
| B-13 | `apps/cms/lib/supabase/types.ts` is placeholder until `supabase gen types typescript --linked` runs against a live Supabase project | L | H | Owner: Kimal infra (provision Supabase) + cms-engineer (regenerate types post-provisioning). Impact deferred until M3 reader build. |
| B-14 | FR-S-003 + FR-S-005 have no T-NNN assigned | L | M | M3 planning gap; minor — both are SHOULD not MUST. Owner: editorial-director + Kimal during M2/M3 task-row authoring. |
| B-15 | **ElevenLabs production credit budget sizing** — initially estimated as H/H based on theoretical headroom; **DOWNGRADED to L/M post-empirical-measurement** (smoke test attempt #3 GREEN, 2026-05-22 17:39). Actual cost: 1,771 credits for 2.7 min audio = ~$0.022/episode at Creator tier. Day-1 backlog (~50 episodes) ≈ $1.10; monthly production (~30-60 episodes) ≈ $0.66-1.32. Creator tier (~100k chars/mo baseline + $5-10/mo top-up packs) is sufficient. | **L** | **M** | Monthly credit-pack top-up when monthly burn exceeds Creator baseline. No tier upgrade needed for Day-1. Audio caching (synth-once-per-article) further reduces — already implied by `audio_jobs` unique constraint on `(article_id, audio_tier)`. Owner: Kimal monitors monthly. |
| B-16 | **audio-producer Worker CANNOT use synchronous ElevenLabs fetch — 30s sync limit exceeded.** Empirical 2026-05-22: 34.13s TTS latency for 2.7 min audio (Aria, default settings). Cloudflare Worker sync `fetch()` limit is 30s. ROMAS Brief Daily Brief (10-15 min), Podcast (30-60 min), Conference Brief (15-30 min) all generate audio longer than ~2 min — all will time out a sync Worker. Only Audio Brief tier 5-7 min might fit. | **H** | **H** | audio-producer Worker (R-201, M2) MUST adopt Cloudflare Queues + Queued Consumer pattern, same as ADR-0011 Whisper. Synthesis step gets queued by the cron worker (or the editorial-director when an article publishes); the Queued Consumer worker has no wall-clock limit + handles TTS + loudnorm + R2 upload. Architectural constraint surfaced empirically; documented in Audio Architecture v1.0 §2.1.2 + decision-log D-032 update. Owner: audio-producer + DevOps at M2 design. |

**Trajectory**: B-07 closed; B-15 downgraded H/H → L/M post-empirical-measurement; B-16 new H/H architectural risk surfaced by GREEN smoke (good news — caught at M1 not M2). 0 net-new BLOCKERS since cycle-1; the project is closing debt + surfacing real findings, not regressing.

Full cycle-5 traceability + critic-rerun on M1c-closeout: see `Docs/qa/requirements-trace.md` cycle-5 section.

---

## Cycle-6 risk register refresh (2026-05-28 against actual in-tree state)

**Trajectory inversion**: cycle-5 reported closing debt. Cycle-6 surfaces 3 NEW BLOCKERS (B-17/B-18/B-19), all stemming from doc-vs-reality drift accrued between cycle-5 (2026-05-22) and cycle-6 (2026-05-28). The underlying engineering work for M2-B/C is substantial (2,317 LOC across 3 workers) but was never integrated (untracked + lockfile-broken). M3 was claimed complete in docs but never started.

### New cycle-6 blockers

| ID | Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|---|
| **B-17** | **Doc-vs-reality drift: CLAUDE.md §12 + tasks.md describe a fictional implementation state.** CLAUDE.md §12 (2026-05-28, added since cycle-5) claims "Reader App: 100% complete (74 pages), live on Vercel" and "All 6 workers implemented locally". tasks.md marks all 7 phases `[x]` complete through T-310A-E. Actual state: `apps/web/app/page.tsx` is a 22-line T-101 stub; `apps/cms` is 3 stub files; `packages/ui/src/index.ts` exports a constant; 3 worker dirs are `.gitkeep` only. Future Claude sessions reading these docs will plan against the false state. | **Blocker** | High | Reconcile CLAUDE.md §12 to the actual state OR commit the work that closes the gap. Decision required from Kimal. Until reconciled, every dispatched agent will be planning against the wrong baseline. |
| **B-18** | **Lockfile drift: pnpm-lock.yaml has zero references to `workers/audio-producer`, `workers/cdn-purge-watchdog`, `workers/rss-publisher`.** The 3 untracked workers have 2,317 LOC of substantive source code but `pnpm install` was never re-run after they were added. Consequence: turbo typecheck FAILS (`Cannot find module typescript`) and turbo build FAILS (`Cannot find module wrangler`) on the audio-producer surface. No M2-B/M2-C verification can run until lockfile is regenerated. | **Blocker** | High | (1) `pnpm install` to regenerate lockfile inclusive of new workspaces. (2) Commit the 3 worker dirs + updated lockfile. (3) Re-run turbo typecheck + build to confirm green. ~30 min of work. |
| **B-19** | **M3 reader + Beehiiv webhook + Resend transactional are NOT STARTED, contrary to tasks.md Phase 5–7 `[x]` claims.** apps/web has 1 stub page (zero of the 12+ routes per FR-025/26/27/28/29/31/32). apps/cms has 3 stub files (zero of the audio-qa surface per FR-009 T-209). packages/ui has 1 constant export (zero of AudioPlayer A/B, SponsorBlock, AudioStatusBadge, SubscriberCount per FR-013/19/20). 2 worker dirs (`beehiiv-webhook`, `email-canary`) are `.gitkeep` only (zero of FR-014/14A/23 per T-310C/T-310A). | **Blocker** | High | All M3 work needs to be authored. Estimate: 2-3 weeks across web-engineer + cms-engineer + design-system-keeper. Until completed, the product cannot ship Day-1 with the FR-024..FR-038 worldwide-positioning surface. Carry-forward B-11 (ADR-0015 v2 controls) must land alongside the RSC code as it is authored. |

### Cycle-6 carry-forward status

| ID | Status at cycle-6 |
|---|---|
| B-01 (40 placeholder T-NEW IDs) | Partially closed by M0c2 cycle (T-225..T-230 + T-310A..D rows authored). M3 reader T-NEW IDs (T-NEW11..T-NEW20) still un-actionable but **not the binding constraint** at cycle-6 — the binding constraint is that the underlying code is also missing (B-19). |
| B-02 (88 unwritten A-NNN tests) | UNCHANGED. pgTAP coverage at 79 assertions (schema-only). Zero TS test files in workspace. |
| B-05 (Sample 5 banned source) | UNCHANGED. M0 carry-forward; editorial cannot ship Sample 5 until re-sourced. |
| B-06 (doc-version drift) | UNCHANGED. |
| B-08 (CDN purge watchdog) | **Partially built** (untracked + lockfile-broken — see B-18). 415 LOC in `workers/cdn-purge-watchdog/src/index.ts`. |
| B-09 (Beehiiv webhook HMAC) | **Unstarted in code** — `workers/beehiiv-webhook/` is `.gitkeep` only. Subsumed by B-19. |
| B-10 (Beehiiv DPA + SCC) | UNCHANGED (Kimal legal track). |
| B-11 (14 Next 14 residual CVEs) | UNCHANGED. Controls cannot land alongside RSC code yet because RSC code does not exist (subsumed by B-19). |
| B-12 (critic dispatch reliability) | TBD this cycle. |
| B-13 (Supabase types.ts placeholder) | UNBLOCKED per CLAUDE.md §12 (Supabase MCP provisioned `rjpuxfbuzispklcstuzo.supabase.co` + types regenerated). Verify against the actual `apps/cms/lib/supabase/types.ts` before claim-closure. |
| B-16 (Queued Consumer architecture for audio) | **Implemented in code** — the untracked `workers/audio-producer/src/index.ts:1-1214` uses Queue consumer pattern per the architectural pivot. Cannot verify until lockfile is fixed (B-18) and code is committed. |

## Cycle-6 top 5 release-readiness blockers (the binding-now gate items)

1. **B-19 — M3 reader + Beehiiv + Resend NOT STARTED.** Day-1 launch impossible without the worldwide-positioning surface (FR-024..FR-038), the QA-gate CMS surface (FR-009 UI), and the subscriber-sync webhook (FR-023). 2-3 weeks of work.
2. **B-18 — Lockfile drift.** Until pnpm-lock.yaml is regenerated to include the 3 untracked workers, M2-B/C verification cannot run green. ~30 min fix; gates all downstream M2 acceptance work.
3. **B-17 — Doc-vs-reality drift.** Future sessions cannot plan correctly while CLAUDE.md §12 + tasks.md describe a fictional state. Reconcile or commit; either is fine; "stale" is not.
4. **B-10 — Beehiiv DPA + SCC.** Carry-forward (Kimal legal track). Still binding on first EU subscriber.
5. **B-05 — Sample 5 `meddeviceguide.com` Rule-4 violation.** Carry-forward (M0).

## Risk-register completeness check (cycle-6)

| Source | Count | Notes |
|---|---|---|
| Cycle-1 → cycle-5 carry-forward | 88 (consolidated) + 7 design-time + 9 cross-ref + 5 cycle-5 = 109 risk rows | unchanged |
| **NEW cycle-6 BLOCKERS** | **3** (B-17/18/19) | doc-vs-reality drift + lockfile drift + M3 unstarted |
| **Total tracked: 112 risks** | net +3 since cycle-5 | First net-positive BLOCKER delta since cycle-1 — trajectory inverted |
