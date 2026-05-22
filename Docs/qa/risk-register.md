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

**Trajectory**: B-07 closed; 0 net-new blockers from cycles since cycle-1; the project is closing debt, not adding it.

Full cycle-5 traceability + critic-rerun on M1c-closeout: see `Docs/qa/requirements-trace.md` cycle-5 section.
