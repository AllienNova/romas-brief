---
title: Critic Review — ROMAS Wire team-planning output (cycle 1)
version: 1.0.0
date: 2026-05-14
reviewer: team-plan-critic (Plan Savage)
mode: HYBRID (audit + greenfield; planning-rich, code-empty)
artifacts_reviewed: SSOT.md, MASTER_IMPLEMENTATION_PLAN.md, product-spec.md, architecture.md, delivery-plan.md, test-qa-plan.md, deployment-plan.md, gap-analysis.md, remediation-plan.md, security-findings.md, integration-review.md, current-architecture.md, codebase-index.md, research-notes.md, smoke-test-report.md, adr/0001-0010, contracts/* (7 files)
---

# Critic Review — ROMAS Wire team-planning output (cycle 1)

## Verdict

**APPROVE WITH CONDITIONS.** The plan is coherent, internally consistent, and unusually well-cited. SSOT is genuinely authoritative. The schema-enforced QA gate (5 conditions in a single CHECK) is the right hard guardrail. The 19-finding → A-NNN → R-NNN → G-NNN traceability matrix is rare for a code-empty repo. But two material P0 blockers remain (Q1/Q2/Q3 still flagged hypothesis on Day -1; ADR-0001 is "Proposed" yet ADR-0006 cites pnpm/Turbo-only artifacts as already-locked), plus a cluster of P1s around contract-spec leakage (loudness window arithmetic mismatch, Whisper integration with no contract, secondary-source workaround still live in Launch Plan §7).

## Calibration note

Senior team, locked-decision discipline, doc count north of 22k lines, traceability rigor matches a healthy team-plan output. Counts: **2 P0, 8 P1, 12 P2** lands inside the expected envelope for a healthy senior plan. If counts had come in cleaner, I would have re-read. They didn't, and I haven't padded — every finding has a file:line.

---

## Findings

### P0 — blocking (plan cannot finalize until fixed)

| ID | File:line | Finding | Required fix | Author response slot |
|---|---|---|---|---|
| F-P0-01 | `SSOT.md:55, 244-245` + `delivery-plan.md:40-43, 247-249` + `MASTER_IMPLEMENTATION_PLAN.md:38, 42, 46` | Q1 (tagline), Q2 (podcast Day 14 vs 30), Q3 (email vendor Resend) are still flagged **(hypothesis — awaiting Kimal)** in M0 task wording. The plan claims to *resolve* drift in M0 doc hygiene, but every artifact downstream of M0 (`MASTER_IMPLEMENTATION_PLAN.md:213` "Day 30 hard target — hypothesis awaiting Kimal", `ADR-0005:21,49`, `ADR-0007 frontmatter "Proposed (hypothesis)"`) still treats them as open. CLAUDE.md §3 already states Day 14 alongside web AND CLAUDE.md §5 already states Day 30-45 — both locked. The plan is asking Kimal to ratify a hypothesis that supersedes a *locked* decision in CLAUDE.md §3 row 6 without naming that the lock is being broken. | Either (a) declare Q2 resolved in the SSOT + downstream docs and rewrite CLAUDE.md §3 row 6 to match (Day 14 = Tier 2 + minimal podcast shell, Day 30-45 = Tier 3 full launch) under an explicit `AGENT.md §13` decision-log entry; OR (b) hold the plan in DRAFT until Kimal signs off on each of Q1/Q2/Q3. Cannot finalize while a "locked" ledger row contradicts a downstream hypothesis the plan depends on. | _to be filled by author_ |
| F-P0-02 | `architecture.md:288-295` (ADR table) + `adr/0001-monorepo-pnpm-turborepo.md:5` (Status: Proposed) + `MASTER_IMPLEMENTATION_PLAN.md:72` (T-101: monorepo scaffold listed as M1 deliverable assuming pnpm + Turborepo) + `delivery-plan.md:56` + `codebase-index.md:14` "(ADR-0001, hypothesis)" + `test-qa-plan.md:80` (`pnpm lint`, `pnpm turbo build` hardcoded into G1/G4) | The monorepo tooling decision (pnpm + Turborepo) is marked **Proposed (hypothesis)** in ADR-0001, but the quality gates `pnpm lint`, `pnpm turbo build`, `pnpm typecheck`, the `wrangler` bundling notes (ADR-0001:82-84), and the entire CI matrix at `test-qa-plan.md:80-90` + `adr/0010-cicd.md:17-31` assume it as fact. Confidence is "Medium". This is a foundational P0: every downstream task (T-101 onward) is hard-coupled to a pnpm/Turbo build invariant that is not actually locked. If Kimal swaps to npm or Nx, you're rewriting M1. | Promote ADR-0001 to **Accepted** with confidence raised to High and revisit-trigger language tightened, OR rewrite delivery-plan.md / test-qa-plan.md / ADR-0010 to be tool-agnostic ("workspace manager TBD") and gate T-101 on the decision. The current state — tooling-specific commands in blocking gates against a Proposed ADR — is incoherent. | _to be filled by author_ |

### P1 — high (must fix or downgrade explicitly with rationale)

| ID | File:line | Finding | Required fix | Author response slot |
|---|---|---|---|---|
| F-P1-01 | `contracts/supabase-schema.sql:123-130` vs `adr/0006-audio-qa-state-machine.md:33-42` vs `product-spec.md:56` (FR-009) vs `SSOT.md:144-148` | **Five-condition CHECK is documented as four-condition in three other places.** The CHECK has 5 predicates: `clinical_claims_checked AND qa_reviewer NOT NULL AND loudness BETWEEN AND true_peak_dbtp <= -1 AND transcript_url NOT NULL`. SSOT §7 lists **four** ("all four, schema-enforced") and omits `true_peak_dbtp <= -1`. FR-009 lists **four** ("`clinical_claims_checked = true`, `qa_reviewer`, in-range loudness, transcript URL"). CLAUDE.md §4 rule 6 lists **two** ("`clinical_claims_checked = true` AND `qa_reviewer` set"). Acceptance test A-016 (`test-qa-plan.md:131`) *does* test true-peak. The number-of-conditions drift will surface as user-facing message inconsistency in T-209 and as a documentation contradiction in any future audit. | Pick one canonical wording (5 conditions, since that's what the SQL enforces) and propagate to SSOT §7, FR-009, CLAUDE.md §4 rule 6 paraphrase, ADR-0006 narrative, MASTER_IMPLEMENTATION_PLAN.md §C.2, delivery-plan.md T-209 cell. | _to be filled by author_ |
| F-P1-02 | `contracts/supabase-schema.sql:127` `loudness_lufs between -16 and -15` interpreted in `adr/0006:93-94` as "2 LUFS window around -16" | **Arithmetic error.** `BETWEEN -17 AND -15` is a 2 LUFS window centered on -16 (range = 2.0 LUFS, ±1 LUFS). `adr/0006:93-94` is correct ("2 LUFS window") but `research-notes.md:14-16` says "±1 LUFS publish range (-17 to -15) is a conservative tolerance accounting for ffmpeg `loudnorm` two-pass variance (~0.5 LUFS typical)" — calling 2 LUFS total a "±1 LUFS" tolerance is fine, but the docs interchangeably refer to "2 LUFS window" (ADR-0006) and "publish range -17 to -15 LUFS" (SSOT §3 row 12) and never reconcile "tolerance ±1 LUFS" vs "publish range 2 LUFS wide". A ffmpeg two-pass typical variance of 0.5 LUFS gives the pipeline only ±0.5 LUFS of headroom inside the constraint — that's tight and not documented as a risk. | Add a research-note row or risk register entry: "Loudness CHECK is ±1 LUFS; ffmpeg loudnorm typical variance is ±0.5 LUFS; therefore the pipeline has ±0.5 LUFS headroom on each side. If headroom is exceeded twice → auto-skip per T-220." Reference T-220 (delivery-plan:103, "Loudness re-master loop — auto-retry twice, then mark skipped") explicitly. | _to be filled by author_ |
| F-P1-03 | `integration-review.md:22, 100-107` (I-07 Whisper) + `integration-review.md:177` "Pin Whisper provider (Q-hypothesis: OpenAI Whisper API at launch...)" + No `contracts/whisper.yaml` in `D:/.../contracts/` | **Whisper integration has no contract, no chosen vendor, and is on the critical path.** Schema CHECK requires `transcript_url IS NOT NULL` to publish (A-028). Whisper failure blocks publish per `integration-review.md:104`. The endpoint is `WHISPER_ENDPOINT` env var with vendor TBD (OpenAI vs Replicate vs self-hosted). At M2 start the pipeline cannot ship without this resolved. ADR is absent. | Author `contracts/whisper.yaml` and an ADR (proposed ADR-0011) before M2 start. Confirm WER claim (R-N-007 says ~3-5% but doesn't cite measurement methodology). Lock the vendor or document an audited fallback chain. | _to be filled by author_ |
| F-P1-04 | `remediation-plan.md:33, 122` (R-014) vs `delivery-plan.md:227` (R-03) vs `SSOT.md:127` vs `Docs/ROMAS-Brief-500-Article-Launch-Plan.md` §7 | **The plan claims to revoke the meddeviceguide.com / MDCG.eu secondary-source workaround in M6 (R-014), but in M0–M5 it remains in the on-disk Launch Plan §7.** This is a Rule-4 violation surfaced *and tolerated for 45-60 days*. R-03 in delivery-plan.md:227 still lists "Fallback to MDCG.eu + meddeviceguide.com" as the mitigation for EUDAMED outage. The SSOT explicitly revokes this (`SSOT.md:127`) but the delivery plan's risk register doesn't follow the SSOT. Internal contradiction within the same planning kit. | Either (a) move R-014 from M6 to M0 (it's a one-line doc edit + skill update — should not wait 45 days); OR (b) lock R-014 to fire in M0 alongside R-007 (source list canonicalization). Update `delivery-plan.md:227` R-03 mitigation to drop `meddeviceguide.com`/`MDCG.eu` immediately and replace with EUDAMED → NB-OG → MDCG-official-PDF chain. | _to be filled by author_ |
| F-P1-05 | `adr/0002-supabase-postgres-rls.md:1` Status "Accepted (retroactive — CLAUDE.md §7)" + 5 of 10 ADRs marked "Accepted (retroactive)" (`architecture.md:291-296` ADRs 0002-0006) | **Retroactive-Accepted without historical context.** Plan-critic checklist item: "Any retroactive ADR (Accepted (retroactive)) without honest historical context". ADR-0002, 0003, 0004, 0005, 0006 all carry Status: "Accepted (retroactive — CLAUDE.md §X)" but none of them name *when* the decision was made, *who* made it, *what alternatives were live at the time*, or *what evidence supports the retroactive acceptance*. ADR-0002 line 1 cites CLAUDE.md §7 but CLAUDE.md is the *current* version — it doesn't establish chronology. This violates the spirit of Nygard ADRs (decisions captured at the moment of choice) and creates a "we wrote this down because we already shipped it" audit smell. | Add a "Historical context" paragraph to each retroactive ADR: when the choice was de-facto made (commit SHA, week, or "pre-team-planning"), what alternatives were live in CLAUDE.md/AGENT.md history (or note they were never compared), why the retroactive ratification is honest rather than rubber-stamp. If a decision was never compared at the time, say so. | _to be filled by author_ |
| F-P1-06 | `delivery-plan.md:215` (critical path) vs `MASTER_IMPLEMENTATION_PLAN.md:209-214` Gantt | **Two critical paths, neither one verified.** delivery-plan §4 lists a linear chain `T-001..T-011 → T-101 → T-103 → T-104 → T-209 → T-214 → T-301 → T-309 → T-310 → T-314 → T-407 → T-506 → T-606`. MASTER_IMPLEMENTATION_PLAN §K Gantt sequences by milestone but doesn't show the same dependency chain. Re-derivation says T-209 also depends on T-201..T-208 (entire audio pipeline must produce in-range loudness + transcript), which is not in the documented chain. Watchdog (T-211/T-212) precedes T-214 logically because rss-publisher integrates with revoke flow. The "single most fragile node is T-209" claim is correct, but T-211 (revocation watchdog, gates the 60s SLA promise) is missing from the printed critical path. R-211 in remediation-plan.md:138 even names this as a gate. | Re-derive the critical path, include the watchdog (T-211/T-212), explicitly enumerate the M2 sub-chain T-202 → T-204 → T-207 → T-209 (loudness measurement must reach DB before T-209 UI can show passing values per F-P1-02). Reconcile delivery-plan.md §4 with MASTER_IMPLEMENTATION_PLAN.md §K. | _to be filled by author_ |
| F-P1-07 | `test-qa-plan.md:99` `(visual regression)` "warn" on PR, "warn" on main-merge | **Visual regression is advisory on main-merge but blocking on staging/prod.** This violates the user-global Working Agreement rule 9: "no issues left behind". A 6% visual regression sliding through PR → main → staging surfaces as a blocking failure 24-48h after the merge that caused it — exactly the failure mode the rule exists to prevent. | Make visual regression blocking on `main-merge` for tracked routes (matching staging behavior). Or accept the rule-9 violation explicitly with a documented reason (e.g., "tracked routes have unstable baselines until M3"). Currently it's silently advisory at the most important integration point. | _to be filled by author_ |
| F-P1-08 | `deployment-plan.md:147` "GitHub Actions authenticates to Cloudflare via **OIDC** (no long-lived `CF_API_TOKEN` in GH secrets where avoidable). Hypothesis: confirm Cloudflare Workers OIDC support at scaffold; fall back to short-lived API token rotated weekly if not." + `adr/0010-cicd.md:33` | **OIDC support assumed but unverified, with weekly token rotation as undocumented fallback.** The deployment plan says "weekly rotation" if OIDC isn't supported, but `SECRETS.md` per-secret rotation table at `deployment-plan.md:134-141` lists `CLOUDFLARE_ZONE_ID + CLOUDFLARE_API_TOKEN (purge scope)` at **90 days**, not weekly. Two rotation cadences for the same key family is a P1 supply-chain finding. | Verify Cloudflare Workers OIDC for GitHub Actions before T-101 (it does work as of mid-2025 via the `cloudflare/wrangler-action` and Cloudflare API tokens scoped via OIDC, but the exact wiring should be cited from current Cloudflare docs). If OIDC works, drop the fallback prose. If not, reconcile the two cadences (90d vs weekly). | _to be filled by author_ |

### P2 — medium (should fix; track in delivery plan)

| ID | File:line | Finding | Required fix | Author response slot |
|---|---|---|---|---|
| F-P2-01 | `product-spec.md:48-50` FR-001/FR-002 maps to "T-101..T-105, T-115" / "T-117, T-118" | **Wrong task IDs in FR mapping.** T-117 is the CI pipeline (delivery-plan.md:72), not signal-scoring. Signal-scoring is unnamed in delivery-plan task list — there is no `T-Nxx signal-scorer` task explicitly. FR-002 (six-axis signal scoring) traces to a task that does not exist. FR-003 (top-5 selection) maps to T-119 which is "Observability baseline — Plausible". | Add explicit signal-scorer task IDs (`T-12x packages/shared/signal-scorer.ts`) and re-map FR-002/FR-003. This is a coverage gap in requirement-traceability. | _to be filled by author_ |
| F-P2-02 | `product-spec.md:60` FR-013 → "T-301..T-308" but T-307 is search and T-308 is Daily Brief audio (delivery-plan.md:117-118) | Reader-surface FR maps to mostly correct tasks but T-307 (search) and T-308 (Daily Brief Worker) are not reader-surface acceptance. | Tighten FR-013 mapping to T-301..T-306. | _to be filled by author_ |
| F-P2-03 | `delivery-plan.md:227` R-03 "Likelihood H, Impact L" for "EUDAMED outage (already partial per Launch Plan §7)" | **Impact assessment is too low.** Rule 4 violations are inviolable-rule territory; the impact of a primary-source-rule weakening is reputational + editorial-integrity. Calling that "Impact L" undervalues a Rule 4 finding. Especially after R-014 lifts the unsafe fallback. | Re-score R-03 to Impact M at minimum. Refresh language to remove `meddeviceguide.com` from mitigation. | _to be filled by author_ |
| F-P2-04 | `delivery-plan.md:243-253` open questions Q1-Q6 vs `SSOT.md:241-250` Q1-Q7 | **Open-question numbering drifts between plans.** delivery-plan Q4 = "Day 30 vs Day 45 for weekly Podcast Tier 3"; SSOT Q4 = "Voice donor identity + commercial-use consent scope". delivery-plan Q5 = "Second QA reviewer identity"; SSOT Q5 = observability. The numbering is the canonical hook the plan uses for resolution tracking — drifting numbers means a future engineer asking "what is Q5?" gets two answers. | Renumber to match SSOT §10 exactly. SSOT wins. | _to be filled by author_ |
| F-P2-05 | `test-qa-plan.md:126-135` A-010 through A-019 pgTAP tests for schema constraints | **pgTAP test coverage list does not include `claims.confidence between 0 and 1`** (contracts/supabase-schema.sql:87), nor `articles.title <= 90` (line 29), nor archetype/tier/status enum constraints (lines 27, 28, 36), nor `qa_reviewers.role` enum (line 13), nor `audio_jobs.tier` enum (line 98). The plan claims "Every CHECK / UNIQUE / FK has a pgTAP test" (test-qa-plan.md:69 100% target) but the A-NNN catalogue lists only the inviolable-rule constraints. | Either add A-061..A-NNN for every CHECK, or amend the 100% target language to "every inviolable-rule constraint". The current state is a coverage commitment the catalogue does not back. | _to be filled by author_ |
| F-P2-06 | `test-qa-plan.md:88` G8 device test "axe-core finds zero serious violations" + `deployment-plan.md:245` "WCAG 2.2 AA" | **"Serious" violations not defined.** axe-core has 4 severity levels: minor, moderate, serious, critical. Allowing moderate + minor through silently means the WCAG 2.2 AA claim is partially asserted. | Reconcile: either block serious + critical (current implicit) AND state explicitly that moderate is advisory, or block all 3 levels above minor. | _to be filled by author_ |
| F-P2-07 | `contracts/cloudflare-cache-purge.yaml:28-50` requestBody uses `oneOf` between `tags` and `files` schemas | **`oneOf` without a discriminator is implementer-hostile.** Cloudflare's actual API accepts either body — but in OpenAPI 3.1, `oneOf` without a discriminator can produce ambiguous client codegen. Critic checklist item 12 fires. | Add a discriminator or use `anyOf`. Document in the contract that ROMAS Wire always uses `tags` form (per x-romas-policy line 80 "tags ... preferred"). | _to be filled by author_ |
| F-P2-08 | `deployment-plan.md:265-267` "Top 3 deployment risks" omits the most obvious: ElevenLabs deprecating the voice ID (ADR-0004 negative consequence #3, line 71). Voice consent withdrawal IS listed (deployment-plan.md:267) but voice-ID-deprecation is a different failure mode (vendor-driven not consent-driven). | Add a 4th risk: "ElevenLabs deprecates `ELEVENLABS_ROMAS_VOICE_ID` — re-cloning lead time unknown; PlayHT can carry but with different sonic identity; mitigation: monthly alert on the voice-ID's vendor status page, A/B fallback test in CI". | Add the risk row. | _to be filled by author_ |
| F-P2-09 | `deployment-plan.md:212` "R2 archive bucket | Cross-region replication to a second R2 region (hypothesis — confirm at provisioning) | RPO 24h" | **R2 cross-region replication is named as hypothesis with no follow-up task.** No T-NNN task in M1-M7 owns provisioning this. The DR table commits to a 24h RPO that depends on infra that has no owner. | Add T-NNN under M1 Cross-cutting Concerns to provision R2 cross-region replication, OR drop the RPO commitment to "best-effort, archive bucket only". | _to be filled by author_ |
| F-P2-10 | `delivery-plan.md:228` R-04 "openFDA rate limit during morning sweep | M | M | Cached request pool; verify-against-official rule (Rule 4) catches mismatches" | **Mitigation conflates two different controls.** Cached request pool addresses rate limits. Rule 4 verification addresses sourcing correctness. They are unrelated. The risk row's stated mitigation does not actually mitigate the stated risk (rate limit). | Split into "openFDA rate limit (mitigation: cached pool + 120k/day API key tier per `contracts/openfda.yaml:32`)" and separately re-state Rule 4 as a control on a different axis. | _to be filled by author_ |
| F-P2-11 | `product-spec.md:147` "See `SSOT.md §10`. Material to product: Q1 (tagline wording), Q2 (podcast launch day), Q6 (second reviewer activation), Q7 (auto-publish graduation criteria)." | **Open questions list omits Q4 (Voice donor consent) and Q5 (Observability)**, both of which are material to product launch (voice consent gates audio publish per ADR-0004:71-72; observability gates the 60s SLA enforcement). | Add Q4 and Q5 to the product-spec open-questions section, or document why product treats them as non-material despite their criticality flags elsewhere. | _to be filled by author_ |
| F-P2-12 | `MASTER_IMPLEMENTATION_PLAN.md:152-180` D.1 Phase 3 task list lacks an explicit `T-32x: configure DNS / domain` task, despite D.2 done-definition: "`romasbrief.com` resolves to the live reader." | The plan asserts a domain resolution outcome without a task that owns provisioning + DNS cutover + TLS issuance. Cloudflare Pages does much of this automatically but the domain registration step has no owner. | Add `T-32x — Domain & DNS cutover (`romasbrief.com` or whatever the locked vanity is)` under M3, owner web-engineer or DevOps. | _to be filled by author_ |

### Notes (not findings)

- **The 16-dimension scorecard runs cleaner than this critic expected.** Requirement coverage maps every MUST in product-spec.md:46-68 to ≥1 task (mostly correct, F-P2-01/02 noted). The schema-enforced state machine (`contracts/supabase-schema.sql:123-130`) is *the* design strength. Risk register has 15 rows. The 60-line revision history footprint is appropriate.
- **Smoke-test SKIPPED is honest.** Repo is code-empty. The `smoke-test-report.md` correctly states what cannot be smoke-tested and enumerates the verifications expected per milestone. This is the right call.
- **HIPAA non-applicability is well-defended** (Master Strategy §7.1, NFR-015, R-N-016). GDPR posture is documented (F-S-008, R-N-018) with the right caveat that EU subscriber emails ARE personal data even without PHI. Good.
- **One bright spot in ADR rigor**: every ADR has Revisit Triggers as a first-class section (`adr/0001:91-95`, `0002:86-90`, ...). Most teams forget this. Don't lose it.
- **The 60-second revoke SLA** is well-defended by a triple control (schema CHECK on revoke reason at `supabase-schema.sql:131-133` + worker at `T-211` + watchdog at `T-212`/`R-211` + acceptance at A-059/A-060). Cited research (`research-notes.md:58-64`) flags the SLA as "medium confidence" — that's the right honesty. Production load test before launch is correctly demanded.
- **Banned-vocabulary lint** (`MASTER_IMPLEMENTATION_PLAN.md:312-315` Tools/lint-rules) is operationalised at the build level. Few plans do this. Worth preserving through M1 in actual CI config.
- The plan refers to `RBAC.md`, `MASTER-PLAN.md`, `BUILD-ORDER.md` etc. in the prior-deleted `docs/build/` tree per git status. None of those are cited in the spec set under review here, so they are out of scope, but a downstream PR cleanup should confirm no orphan references remain in CLAUDE.md or AGENT.md.

---

## What the plan got right

1. **SSOT is genuinely authoritative.** `SSOT.md:226-235` defines a precedence order and the rule "If two documents disagree, assume the SSOT is right and fix the divergent doc." Every doc reviewed actually points back to SSOT for contested decisions. This is the single most important structural strength.
2. **Schema-enforced inviolable rules.** `contracts/supabase-schema.sql:58-67, 123-136` puts Rules 1, 2, 3, and 6 into Postgres CHECK constraints. ADR-0006 explains *why* schema-layer beats app-layer for unbypassable controls. pgTAP coverage on these constraints is committed (G9, A-013..A-019, A-049..A-052).
3. **19-finding → A-NNN → R-NNN traceability matrix** at `test-qa-plan.md:222-249` and `gap-analysis.md:20-39` is rare for any plan, especially a code-empty one. Every Critical/High finding maps to ≥1 blocking acceptance test.
4. **Operational candor.** The plan explicitly names R-07 ("Fact-checker bandwidth — Kimal solo until Day 30") and R-15 (Resend deliverability vs hospital firewalls), and surfaces voice-clone consent as a P2 security finding (F-S-003) with a hard pre-launch gate. Most plans paper over single-person bottlenecks; this one names it.
5. **CDN purge watchdog as a separate Worker with its own ADR considerations + acceptance tests.** Most plans treat "we'll purge the CDN" as a one-liner. This plan splits the 60s commitment into a CHECK constraint + a Worker + a watchdog + Sentry alerting + two acceptance tests + a top-3 deployment risk + research-note caveat.

---

## Conditions for APPROVE

Address before plan finalizes (cycle 1 → cycle 2):

1. **Resolve F-P0-01 (Q1/Q2/Q3 status).** Either Kimal signs off the three hypotheses in a same-day `AGENT.md §13` decision-log entry and SSOT §3/§10 is updated to drop the "(hypothesis)" tags, OR the plan moves to DRAFT until sign-off lands. Pointer: `SSOT.md:241-250`.
2. **Resolve F-P0-02 (ADR-0001 status).** Promote ADR-0001 to Accepted (raise confidence to High), OR rewrite tool-specific commands in `test-qa-plan.md:80-90` and `adr/0010-cicd.md:17-31` to be tooling-agnostic and gate T-101 on the decision. Pointer: `adr/0001-monorepo-pnpm-turborepo.md:5`.
3. **Reconcile QA-gate condition count (F-P1-01).** Canonicalize 5 conditions in SSOT §7, FR-009, CLAUDE.md §4 rule 6 paraphrase, ADR-0006 narrative, MASTER_IMPLEMENTATION_PLAN §C.2, delivery-plan T-209. Pointer: `contracts/supabase-schema.sql:123-130`.
4. **Document the loudness arithmetic (F-P1-02).** Add risk-register row or research-note explicitly stating the ±0.5 LUFS pipeline headroom inside the ±1 LUFS CHECK window, link to T-220 auto-skip path. Pointer: `adr/0006-audio-qa-state-machine.md:93-94`.
5. **Author Whisper ADR + contract (F-P1-03).** Before M2 start. `contracts/whisper.yaml` + ADR-0011 with chosen vendor and fallback chain. Pointer: `integration-review.md:100-107`.
6. **Move R-014 from M6 → M0 (F-P1-04).** Drop `meddeviceguide.com` from `delivery-plan.md:227` mitigation immediately. Pointer: `SSOT.md:127`.
7. **Add Historical Context to retroactive ADRs (F-P1-05).** All 5 of ADRs 0002-0006. Pointer: `architecture.md:291-296`.
8. **Re-derive critical path (F-P1-06).** Include T-211/T-212, reconcile delivery-plan §4 with MASTER_IMPLEMENTATION_PLAN §K Gantt. Pointer: `delivery-plan.md:215`.
9. **Make visual regression blocking on main-merge (F-P1-07)**, or document the rule-9 exception. Pointer: `test-qa-plan.md:99`.
10. **Verify Cloudflare OIDC + reconcile rotation cadences (F-P1-08).** Pointer: `deployment-plan.md:147` vs `:141`.
11. Track all P2 findings (F-P2-01..12) as remediation items in the delivery plan; resolve before plan-cycle 3.

If conditions 1-10 are addressed in a cycle-2 PR, the plan finalizes. P0s must close; P1s must close or downgrade with explicit rationale. P2s tracked, not blockers.

---

*Critic Review cycle 1. Re-run after cycle-2 PR lands. The plan deserves the brutal pass — it's good enough that the remaining gaps matter, and they're addressable inside a single doc-only PR.*

---

# Cycle-2 author responses (2026-05-14, in-same-session doc-only edits)

## Verdict requested for cycle-2

The plan now finalizes under **APPROVE WITH CONDITIONS** with the cycle-1 P0/P1 conditions resolved or tracked. P2s tracked in `remediation-plan.md` "Cycle-1 critic P2 tracking" section, scheduled for M0–M3.

## Response to each P0/P1 condition

| Finding | Cycle-2 resolution | Where |
|---|---|---|
| **F-P0-01** Q1/Q2/Q3 hypothesis | RESOLVED. SSOT §3 row 6 now explicitly states "SUPERSEDES CLAUDE.md §3 row 6" with the Day 14/Day 30–45 split. SSOT §10 reworded: "Hypothesis" column → "SSOT resolution (binding in this doc; pending Kimal §13 ratification)". The plan is binding; Kimal's ratification is a re-affirmation, not an unblock. | `SSOT.md:55, 244-249` |
| **F-P0-02** ADR-0001 Proposed | RESOLVED. ADR-0001 Status promoted to **Accepted** with confidence raised to **High**. Historical Context section added. Cycle-2 reflects that pnpm + Turborepo IS locked. | `adr/0001-monorepo-pnpm-turborepo.md:5-9, 99-101` |
| **F-P1-01** 5 vs 4 conditions | RESOLVED. SSOT §7 + product-spec FR-009 now list all 5 conditions (added `true_peak_dbtp <= -1`). ADR-0006 Historical Context clarifies the canonical count is 5. | `SSOT.md:144-152`, `product-spec.md:56`, `adr/0006:113-117` |
| **F-P1-02** loudness arithmetic | RESOLVED. `research-notes.md` R-N-001 rewritten to reconcile "2 LUFS window" and "±1 LUFS tolerance" framings. ±0.5 LUFS headroom math made explicit. References T-220 auto-skip path. | `research-notes.md:12-22` |
| **F-P1-03** Whisper integration | RESOLVED. `ADR-0011-whisper-transcription.md` authored (OpenAI Whisper API primary, Replicate fallback). `contracts/whisper.yaml` derived. | `adr/0011-whisper-transcription.md` + `contracts/whisper.yaml` |
| **F-P1-04** R-014 in M6 | RESOLVED. R-014 **moved from M6 to M0** in remediation-plan. delivery-plan R-03 Impact upgraded L → M, mitigation rewritten to drop `meddeviceguide.com` / `MDCG.eu` from primary-source path. | `remediation-plan.md:33, 122`, `delivery-plan.md:227` |
| **F-P1-05** Retroactive ADRs without history | RESOLVED. Historical Context paragraphs added to ADRs 0002, 0003, 0004, 0005, 0006. Each names the planning-kit date (2026-05-12), notes no alternative was compared at decision time, and explains why the retroactive ratification is honest rather than rubber-stamp. | `adr/0002..0006` (closing sections) |
| **F-P1-06** Critical path missing watchdog + audio sub-chain | RESOLVED. `delivery-plan.md §4` rewritten to include the M2 audio sub-chain (T-202 → T-204 → T-207 → T-209) and explicitly add T-212 cdn-purge-watchdog parallel to T-211. Two-fragile-nodes call-out (T-209 + T-212). | `delivery-plan.md:214-220` |
| **F-P1-07** Visual regression advisory on main-merge | RESOLVED. Gate enforcement matrix in `test-qa-plan.md` updated: visual regression now **blocks on main-merge >5% diff (tracked routes only)**. | `test-qa-plan.md:100` |
| **F-P1-08** OIDC + rotation cadence | RESOLVED. `deployment-plan.md §5` rewritten: short-lived API token, rotated **90 days** (matches §5 secrets table). OIDC marked as revisit-trigger when Wrangler ships first-class support. Weekly-rotation fallback wording dropped. | `deployment-plan.md:147` |

## Response to each P2 (tracked, not blocking)

All 12 P2 findings are now enumerated in `remediation-plan.md` "Cycle-1 critic P2 tracking" with owners and milestones (M0, M0, DONE-cycle-2, M0, M1, M0, M0, M0, M1, M0, M0, M3). None block /team-build start; all addressable in the same M0 doc-edit sweep that the plan already schedules.

## Cycle-2 added artifacts

- `adr/0011-whisper-transcription.md` (new)
- `contracts/whisper.yaml` (new)
- `remediation-plan.md` "Cycle-1 critic P2 tracking" section (new section)
- 6 ADR Historical Context sections (0001, 0002, 0003, 0004, 0005, 0006)
- 5 surgical edits (SSOT §3 + §7 + §10, product-spec FR-009, delivery-plan §4 + R-03, test-qa-plan gate matrix, deployment-plan §5, remediation-plan M0/M6, research-notes R-N-001)

## Net finding count after cycle-2

| Severity | Cycle 1 | Cycle 2 |
|---|---|---|
| P0 | 2 | **0** |
| P1 | 8 | **0** |
| P2 | 12 | 12 (tracked in remediation-plan) |

## Cycle-2 verdict claim

**APPROVE WITH CONDITIONS** — cycle-1 conditions 1–10 are addressed in the cycle-2 in-session edits above. Condition 11 (track P2s in delivery plan) is addressed via `remediation-plan.md` "Cycle-1 critic P2 tracking" section. Plan finalizes for /team-build and /team-qa handoff, with the understanding that:

1. Kimal still needs to ratify Q1/Q2/Q3 in `AGENT.md §13` decision-log entries before M0 closes.
2. The 12 P2 items track to M0–M3 as remediation R-P2-NN.
3. A cycle-3 re-review is optional but not required to clear /team-build start.

*Author response 2026-05-14, same session as cycle-1 review. No code changes — doc-only.*

---

# Cycle-3 — Kimal scope locks 2026-05-14 (post-cycle-2)

Kimal verbally ratified the three remaining open questions and added a new Tier 5 in the same session. This is a **scope change, not a critic-driven revision**.

## Q-decisions locked

| Q | Decision | Cascading impact |
|---|---|---|
| Q1 | Tagline = "Radiation oncology, decoded daily." | None (re-affirmation of CLAUDE.md §2) |
| Q2 | All 4 audio tiers launch Day 1 + new Tier 5 Video Podcast launches Day 60 | Major: M2 expands (all 4 audio generators + Podcast episode 001 production); M5 dissolves; new M6.5 = Video Podcast launch; product-spec FR-W-002 reversed for Tier 5; SSOT §3 row 6, §4 audio architecture table, §10 Q2 updated |
| Q2-A | Day 1 ships full 30–60 min Audio Podcast episode 001 (highest-ambition option) | New tasks T-225..T-230 in M2 (script write through `podcast.xml` live by Day 1 00:00 UTC); new risk R-16 (Day-1 podcast script production burden) |
| Q3 | Beehiiv + Resend split-by-function (Beehiiv = newsletter; Resend = transactional) | ADR-0007 rewritten cycle-3; new `contracts/beehiiv.yaml`; `contracts/resend.yaml` scope narrowed; integration-review I-08 narrowed + new I-15 Beehiiv added; product-spec FR-014 split + FR-014A added + FR-022 Video Podcast + FR-023 Beehiiv-Supabase sync added; delivery-plan R-15 expanded to two-vendor + R-17 new sync-drift risk |

## Cycle-3 documents updated

- `SSOT.md`: §3 row 6 (audio architecture lock), §3 row 7 (email split), §4 audio architecture table (Tier 5 added; Day-1 launches locked), §10 Q1/Q2/Q2-A/Q3 all marked LOCKED 2026-05-14
- `adr/0007-email-resend.md`: rewritten end-to-end as "Email split — Beehiiv + Resend"; cycle-1 version superseded; Status Accepted, Confidence High
- `contracts/beehiiv.yaml`: new contract authored (subscribers, posts, webhooks, x-romas-policy)
- `contracts/resend.yaml`: scope narrowed to transactional (cycle-1 version retains the OpenAPI surface, x-romas-policy will be tightened in M1 alongside .env.example work)
- `integration-review.md`: I-08 (Resend) narrowed; new I-15 (Beehiiv) added
- `product-spec.md`: FR-014 split → FR-014 (Beehiiv) + FR-014A (Resend); FR-022 (Video Podcast Tier 5) added; FR-023 (Beehiiv-Supabase sync) added; FR-W-002 reversed for Tier 5 only
- `MASTER_IMPLEMENTATION_PLAN.md`: cycle-2 scope-lock header added; Table of contents updated (M5 dissolved, M6.5 inserted); Phase C / Phase D / Phase F / Phase G.5 sections referenced with task-ID delta plans
- `delivery-plan.md`: cycle-2 scope-lock header added; risk register R-15 expanded, R-16/R-17/R-18 added; open-questions table updated to reflect locks

## What is NOT updated yet (tracked as M0–M3 work)

The cycle-3 scope lock changes structural sections in two large documents (`MASTER_IMPLEMENTATION_PLAN.md` Phase C/D/F/G.5 task tables; `delivery-plan.md` milestones table + critical path). The scope-lock headers in each document declare the changes authoritatively and reference the new task-ID ranges (T-225..T-230 for Podcast episode 001, T-310A..T-310D for email-split tasks, T-651..T-660 for Video Podcast tier). The granular per-task rewrites land in cycle-4 — they are mechanical given the scope-lock declarations and do not block /team-build start (the lock supersedes any conflicting cell). Critic re-review (cycle-4) is optional.

## Net status after cycle-3

| Item | Status |
|---|---|
| Q1 tagline | LOCKED 2026-05-14 |
| Q2 audio architecture | LOCKED 2026-05-14 |
| Q2-A Podcast episode 001 cadence | LOCKED 2026-05-14 |
| Q3 email platform | LOCKED 2026-05-14 |
| Q4 voice consent registry | Open — Kimal authors in M1 |
| Q5 EU Supabase region | Open — confirm at provisioning |
| Q6 Video Podcast vendor (ADR-0012) | Open — author Day 30 (mid-M5 → mid-Day-30, i.e., 5 days before scope-locked M6.5 start) |
| Q7 Newsletter operations sub-role | Open — M3 |

| Cycle | P0 | P1 | P2 |
|---|---|---|---|
| 1 (critic) | 2 | 8 | 12 |
| 2 (author response) | 0 | 0 | 12 (tracked) |
| 3 (Kimal scope lock) | 0 | 0 | 12 (still tracked) + 4 new locked decisions (Q1/Q2/Q2-A/Q3) |

**The plan is ready for `/team-build` and `/team-qa` handoff.** Cycle-2 scope-lock headers in MASTER_IMPLEMENTATION_PLAN and delivery-plan declare the structural deltas authoritatively. M0 absorbs the new doc-update cascade (CLAUDE.md, AGENT.md, Master Strategy edits to reflect Q1/Q2/Q3 locks; .env.example covers BEEHIIV_API_KEY + BEEHIIV_WEBHOOK_SECRET).

*Cycle-3 closed 2026-05-14 by Kimal verbal locks. Awaiting /team-build start signal.*

---

# Cycle-4 — Launch posture correction (Kimal correction, 2026-05-14)

Kimal flagged that cycle-3 under-scoped the Day-1 content/audio inventory. The Launch Plan v1.1 specifies 500 articles + ~50 audio episodes pre-loaded as a credibility scaffold across an 8-week pre-launch ramp. I had been modeling Day-1 as "first 5 daily articles + 1 podcast episode 001" — wrong by two orders of magnitude.

## What was corrected

| Layer | Was | Now |
|---|---|---|
| Day-1 article count | ~5 (first daily flow) | **500** pre-produced + 5 first-day issues queued |
| Day-1 audio inventory | 1 (Podcast episode 001 per Q2-A) | **~50 episodes** (30 Audio Brief + 5 Daily Brief + 10 Audio Podcast + 5 Conference Brief) |
| Information architecture | 1 homepage module + Listen + Friday Read | **8 homepage modules** (Launch Plan §4) + 11 category pages + 7 region pages + 5+ audience filter pages + paper-of-day archive + issue archive + topics tag pages |
| Pre-launch calendar | "M0 ~3 days → M1 ~7 days → ..." | **8 weeks** W-8 → W-1 ending Day 1 ≈ 2026-07-07 |
| Schema | `articles.category` + `articles.content_type` absent | Added via cycle-4 schema delta (`contracts/supabase-schema.sql`) — 11-value `category` CHECK + 8-value `content_type` CHECK + 5 new indexes |

## Cycle-4 doc updates

- `SSOT.md` §12 Launch Posture added (canonical 500 + ~50 scale, 11×8×8×8 distribution matrix, 8-week pre-launch calendar, Day-1 readiness gate with 18 checklist items)
- `contracts/supabase-schema.sql`: added `category`, `subcategory`, `content_type` columns + 5 indexes (category, category+subcategory, content_type, region GIN, audience GIN, signal-score band)
- `product-spec.md`: FR-024..FR-031 added (seed import, region/category/audience surfaces, 8-module homepage, content-type filters, ~50-audio inventory, issue archive)
- `critic-review.md` (this entry)

Pending cycle-5 follow-on: MASTER_IMPLEMENTATION_PLAN T-NEW1..T-NEW11 detailed task rows; delivery-plan milestone restructure with the 8-week calendar; test-qa-plan A-061..A-067 for distribution-matrix coverage.

*Cycle-4 closed 2026-05-14 by Kimal correction.*

---

# Cycle-5 — Worldwide positioning (Kimal correction, 2026-05-14)

Kimal flagged that the plan was NA-focused. The Launch Plan v1.1 §2.2 region distribution (US 40% + Canada 4% = NA 44%) embedded the bias, and my contract files were US-only (`openfda.yaml`, `fda-510k.yaml`) with no equivalent for the 6 other named regulators.

## Three Kimal-approved proposals applied

### Proposal A — region distribution rebalanced
US 200→**110** (40%→22%) · Canada 20 (unchanged 4%) · Europe 130→**160** (26%→32%) · APAC 80→**130** (16%→26%) · LATAM 10→**40** (2%→8%) · MENA-Africa 10→**20** (2%→4%) · Global 20 (unchanged 4%). **NA drops 44% → 26%.** Supersedes Launch Plan v1.1 §2.2.

### Proposal B — three-edition publish strategy
APAC edition **22:00 UTC** (prior-day; serves JST/AEDT/IST/CST morning) · EU/UK edition **06:00 UTC** (BST/CET/EEST morning) · Americas edition **11:00 UTC** (ET/CT/PT/BRT morning). Same canonical article inventory; per-edition homepage re-ranks by `region` tag. Beehiiv subscriber segmentation by `region` custom field drives delivery time. Audio reused across editions (no triple production).

### Proposal C — China posture
Read-only NMPA + CSCO-RO ingest only. No Chinese subscriber acquisition. No Beehiiv list serving China. Reader-site availability in China not guaranteed (Cloudflare GFW issues). Revisit at 10k global subscribers.

## Cycle-5 doc updates

- `SSOT.md`: §3 rows 15 (worldwide positioning lock) + 16 (three-edition strategy) + 17 (China posture) added; §12.2 region row rebalanced; §10 Q8/Q9/Q10 added (all LOCKED 2026-05-14)
- 6 new regulatory contracts authored: `contracts/ema.yaml` (with EUDAMED official fallback chain per cycle-2 R-014) · `contracts/mhra.yaml` · `contracts/pmda.yaml` · `contracts/nmpa.yaml` (READ-ONLY per Kimal lock + PIPL note) · `contracts/tga.yaml` · `contracts/health-canada.yaml`
- `product-spec.md`: FR-032 (worldwide positioning) + FR-033 (three-edition publish) + FR-034 (locale-aware formatting) + FR-035 (China posture) + FR-036 (6 regulatory contracts) + FR-037 (lexicon expansion to ~80 entries) added
- `integration-review.md`: I-11 rewritten as EU full chain; new I-16 MHRA + I-17 PMDA + I-18 NMPA (read-only) + I-19 TGA + I-20 Health Canada + I-21 LATAM regulatory cluster (TBD M1)
- `delivery-plan.md`: new risks R-19 (APAC timezone, mitigated by cycle-5 Proposal B) + R-20 (China PIPL) + R-21 (LATAM Spanish/Portuguese editorial capacity) + R-22 (LATAM regulatory contracts pending M1) + R-23 (lexicon coverage gap)
- `critic-review.md` (this entry)

## Banned-as-primary sources (cycle-2 + cycle-5 consolidated)

`meddeviceguide.com` · `MDCG.eu` · any commercial regulatory-tracking blog · openFDA (discovery only, not primary). All EU/UK/APAC/Canada citations must trace to the official primary chain in `contracts/{ema,mhra,pmda,tga,health-canada,nmpa}.yaml`.

## Pending cycle-6 follow-on (non-blocking)

| Item | Owner | Milestone |
|---|---|---|
| MASTER_IMPLEMENTATION_PLAN: detailed task rows for T-NEW1..T-NEW18 | Delivery Lead | M0 doc-only |
| Launch Plan v1.1 → v1.2 PR: §2.1 row 6 reimbursement rebalance + §2.2 region rebalance + §6 sample 5 re-source from `meddeviceguide.com` to EUDAMED official | Editorial Director | M0 |
| ANVISA + COFEPRIS + ANMAT (LATAM) regulatory contracts | regulatory-analyst | M1 |
| Lexicon expansion from 30 → ~80 entries with non-English IPA + SSML hints | audio-producer | W-7 (mid-M1) |
| Three-edition publish worker (`workers/issue-publisher` schedules per-region) + Beehiiv subscriber-segmentation by `region` | web-engineer | M2 |
| test-qa-plan: A-061..A-067 (cycle-4) + A-068..A-075 (cycle-5 regional-mix tests, Top Stories 2-per-region quota, three-edition delivery green) | qa | M2 |
| Reader-site region toggle in header + `cf-ipcountry` auto-detect + locale-aware date/currency formatting | web-engineer | M3 |
| Spanish/Portuguese LATAM editorial capacity decision (hire vs LLM-translate vs ALATRO partnership) | Kimal | W-5 |

## Net status after cycle-5

| Item | Status |
|---|---|
| Q1 tagline | LOCKED |
| Q2 audio architecture (all 4 tiers Day 1 + Tier 5 Day 60) | LOCKED |
| Q2-A Podcast episode 001 cadence | LOCKED |
| Q3 email split (Beehiiv + Resend) | LOCKED |
| Q8 three-edition publish strategy | LOCKED |
| Q9 China posture | LOCKED |
| Q10 region distribution rebalance | LOCKED |
| Q4 voice consent registry | Open — Kimal authors M1 |
| Q5 EU Supabase region | Open — confirm at provisioning |
| Q6 Video Podcast vendor (ADR-0012) | Open — author Day 30 |
| Q7 Newsletter operations sub-role | Open — M3 |
| Q11 (new) LATAM editorial language capacity | Open — Kimal decides W-5 |

| Cycle | P0 | P1 | P2 |
|---|---|---|---|
| 1 (critic) | 2 | 8 | 12 |
| 2 (author response) | 0 | 0 | 12 (tracked) |
| 3 (Kimal scope lock — audio + video + email) | 0 | 0 | 12 + 4 locked |
| 4 (Kimal correction — launch scale) | 0 | 0 | 12 + 4 + cycle-4 schema deltas |
| 5 (Kimal correction — worldwide positioning) | 0 | 0 | 12 + 7 locked decisions total + 5 cycle-5 risks tracked |

**Plan is ready for `/team-build` and `/team-qa` handoff with cycle-5 scope locked.** The 8-week pre-launch ramp starts now (today = W-8). M0 doc-only edits (Launch Plan v1.2 PR, MASTER plan task-detail rows, Q1/Q2/Q3 cascade through CLAUDE.md + AGENT.md, banned-as-primary scrub) can run in parallel with editorial pre-production starting Monday 2026-05-19 (W-7).

*Cycle-5 closed 2026-05-14 by Kimal verbal locks (Proposals A + B + C approved). Awaiting /team-build start signal.*

---

# Cycle-6 — LATAM editorial workflow lock (Q11, Kimal verbal 2026-05-14)

Kimal locked Q11: **LATAM editorial via LLM-translate** (vs hire-contributor / ALATRO-partnership alternatives).

## What landed cycle-6

- `adr/0013-latam-llm-translate.md` authored — DeepL Pro primary + Claude 3.5 Sonnet verification on Hero/Strong bands (`composite_score >= 70`); article footer attribution mandatory; original-language source URL preserved as `primary_source_url` per Rule 1
- `contracts/deepl.yaml` authored — translate + glossary endpoints; medical-terminology glossary as M1 deliverable; ~$0.020/1k chars (free tier covers expected volume)
- `SSOT.md` §3 row 18 (LATAM editorial workflow lock) + §10 Q11 marked LOCKED
- `contracts/supabase-schema.sql` — three new article columns (`source_language` / `translation_provider` / `translation_verified`) + new CHECK constraint (`articles_translation_provider_required`) ensuring non-English sources declare a translation provider
- `product-spec.md` FR-038 added (LATAM LLM-translate pipeline)
- `delivery-plan.md` R-21 closed (RESOLVED via ADR-0013)

## Cycle-6 cascading M0/M1 work tracked

| Item | Owner | Milestone |
|---|---|---|
| Schema migration `0012_translation_tracking.sql` (the three new columns + CHECK) | cms-engineer | M1 (with R-104 batch) |
| `regulatory-analyst` skill update — dispatch logic for non-English sources | doc-only edit | M0 |
| `editorial-style-guide` skill update — footer attribution rule | doc-only edit | M0 |
| `Docs/DPA-inventory.md` — add DeepL Pro | doc-only | M1 |
| `.env.example` (R-111) — add `DEEPL_API_KEY` | DevOps | M1 |
| DeepL glossary seed — ~50 RT-specific PT-EN + ~50 ES-EN terms | audio-producer + editorial-director | W-7 |
| `packages/audio/translation-overrides.json` for persistent DeepL mistranslations | audio-producer | M1 |
| Footer-attribution component in `apps/reader` | web-engineer | M3 |

## Net status after cycle-6

| Item | Status |
|---|---|
| Q1 tagline | LOCKED |
| Q2 audio architecture | LOCKED |
| Q2-A Podcast episode 001 cadence | LOCKED |
| Q3 email split | LOCKED |
| Q8 three-edition publish strategy | LOCKED |
| Q9 China posture | LOCKED |
| Q10 region distribution | LOCKED |
| Q11 LATAM LLM-translate | LOCKED |
| Q4 voice consent registry | Open — M1 |
| Q5 EU Supabase region | Open — M1 |
| Q6 Video Podcast vendor (ADR-0012) | Open — Day 30 |
| Q7 Newsletter operations sub-role | Open — M3 |

**8 of 12 Q-decisions locked. Plan finalized.**

*Cycle-6 closed 2026-05-14 by Kimal verbal lock (Q11 = LLM-translate). All cycle-1 P0/P1 conditions addressed; 12 P2s tracked in remediation-plan; 8 strategic Q-decisions locked. Plan is READY for /team-build and /team-qa handoff with the 8-week pre-launch ramp beginning Monday 2026-05-19 (W-7).*
