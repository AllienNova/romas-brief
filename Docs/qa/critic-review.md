---
title: QA Savage Review — ROMAS Brief /team-qa critic gate (cycle 1 + design-review cycle 2)
version: 2.0.0
date: 2026-05-14 (cycle 1 plan-level) · 2026-05-15 (cycle 2 design-review)
reviewer: team-qa-critic (QA Savage) — Kimal-invoked
target: cycle 1 = qa-report.md + 9 supporting QA artifacts; cycle 2 = docs/design/* (21 artifacts) + the contrast-measurement evidence in design-review.md
verdict_c1: GO WITH CONDITIONS (downgraded from author's NO-GO/HOLD)
verdict_c2: GO WITH CONDITIONS — after applying 8 surgical fixes (design-tokens v1.2 + ListenPage spec + Route 3 sponsor clarification) and re-verifying via fresh contrast measurement; 5 P2 findings deferred to W-6 prototype
---

# QA Savage Review

## Cycle 2 — Design Review (M0c2 — 2026-05-15)

**Verdict: GO WITH CONDITIONS.**

The QA Savage produced **hard contrast evidence** against 14 documented color pairs via the WCAG 2.1 luminance formula (fresh Python output captured in `docs/qa/design-review.md` §1). 9 P0 failures surfaced — every AudioStatusBadge state, the AudioPlayer play-button label, the focus-ring outline, and the ink-subtle text token. These were not estimated; they were measured.

Cycle-2 fixes applied to:
- `.claude/skills/design-tokens.md` v1.2 — added `--rb-accent-strong` (5.94:1 on bg, PASS AA Normal); added per-state `--rb-audio-{pending,skipped,revoked,published}-text` variants; tightened `--rb-ink-subtle` from #6E767E (4.41:1 FAIL) to #6B7280 (4.63:1 PASS); banned `--rb-accent` as text or focus-ring via design-system-keeper.
- `Docs/design/tokens.json` v1.2.0 — JSON mirror with measured-contrast metadata per pair.
- `Docs/design/a11y-audit.md` — corrected token-contrast table with split (body-text · non-text UI · decorative/fill-only) + measured ratios per pair.
- `Docs/design/components/AudioStatusBadge.md` — state matrix uses `*-text` token variants; v1.1 supersession noted.
- `Docs/design/components/AudioPlayer.md` — play button foreground changed from white (2.52:1 FAIL) to `--rb-ink` (7.51:1 PASS AAA).
- `Docs/design/components/ListenPage.md` — new file (closes P1-D1 component count gap).
- `Docs/design/wireframes.md` Route 3 — sponsor block placement clarified as `<aside>` SIBLING of `<main>`, not nested.
- `Docs/design/ui-spec.md` — Color §3 table corrected with measured ratios + new accent-strong token row.
- `Docs/design/components/AudioStatusBadge.md` — state matrix uses `*-text` token variants.

Re-verification (second contrast-measurement pass) confirmed **0 critical text pairs failing AA Normal**. Two intentional restrictions remain (FAIL marker is correct per token discipline): `--rb-accent` (fills only) and `--rb-accent-deep` (AA Large only).

Conditions for full GO at W-6:
1. Run-time axe-core + Lighthouse a11y ≥ 95 on prototype.
2. Touch-target verification on real device (tag pill 32×32 vs AAA 44×44 target).
3. Dark-mode contrast verification (tightened `--rb-ink-subtle` from #7C848D to #9CA3AF pending run-time confirmation).
4. AAA verification on Friday Read body — `ink-muted` 7.69:1 passes AAA; verify at run-time.
5. Audio-state badge brand-alignment review (P3 — `amber-700`/`slate-600`/`red-700` are technically compliant but off the single-accent brand discipline; not blocking ship).

The design as documented at commit `1ed4ff7` (before design-review) had 9 P0 a11y failures. The design as documented at this commit (post design-review fix) has 0 P0 contrast failures and clean WCAG 2.2 AA across every reader route token pair. **Ready for `/team-build M3` dispatch when the design hand-off lands at W-3.**

---

# QA Savage Review — Cycle 1 (plan-level — 2026-05-14)

## Verdict

**GO WITH CONDITIONS.** The author's NO-GO/HOLD verdict is over-calibrated. This is a code-empty planning artifact set; the gating question is whether `/team-build` can begin **M0 doc-only work** safely, not whether the system is launch-ready. M0 R-001..R-007 already exists in delivery-plan as doc-only milestone work; the author's 11 "blockers" are 80% identical to M0 (and partly *inside* M0). Conflating "remediation that fits inside M0" with "blocks /team-build dispatch" is the calibration error.

The author IS right that real defects exist and several are P0. They should be the **acceptance criteria for M0 close**, not a 2-3 week gate before M0 starts. M0 ships them; M1 will not start without them. That is the conventional plan-QA pattern, not a custom HOLD.

## Calibration note

Confidence: high. I re-read all 9 QA artifacts, spot-verified 8 of the 9 load-bearing claims against the underlying source files (Launch Plan Sample 5 — confirmed live `meddeviceguide.com` at L291; subscribers schema — confirmed no `region`/`beehiiv_subscription_id` at supabase-schema.sql:276-283; ADR-0005:21,49 — confirmed stale Day-14/30-45 wording; Master-Strategy:203 + Runbook:178 — confirmed 5 rules vs SSOT 6; beehiiv.yaml:223 — confirmed "confirm DPA covers EU..." unresolved; MASTER:18-21 — confirmed T-225..T-230 and T-310A..D exist only in scope-lock prose; MASTER for T-NEW1..T-NEW20 — confirmed they do NOT appear anywhere in MASTER, contrary to author phrasing). One claim weakened on verification (see below).

## What the author got right

- **B-05 live Rule-4 violation is real.** `Docs/ROMAS-Brief-500-Article-Launch-Plan.md:291` cites `https://meddeviceguide.com/blog/eu-ai-act-omnibus-amendment-2026-medical-device-impact-guide` as an inline source link inside Sample 5 article body, and L310 keeps it as a "trusted secondary source" recommendation. This contradicts SSOT §6 R-014, ema.yaml:7, and Rule 4. **Correctly P0 and trivially fixable.**
- **ADR-0005 stale wording confirmed.** Lines 21 and 49 still narrate "Day 14 / Day 30–45 (hypothesis — awaiting Kimal confirmation)" even though cycle-3 locked Day-1 all-tier launch (MASTER L18 scope-lock). Correctly flagged P0.
- **Inviolable-rule drift confirmed.** Master-Strategy §6.1 (L203) and Runbook §6 (L177) list 5 rules verbatim; SSOT/CLAUDE.md/AGENT.md list 6. Agents loading those docs operate under weaker constraint. Correctly P1.
- **subscribers schema gap confirmed.** supabase-schema.sql:276-283 defines `subscribers(id, email, status, source, tier_prefs, created_at)` with no `region` and no `beehiiv_subscription_id`. FR-033 three-edition publish + FR-023 Beehiiv reconciliation are unimplementable until those columns land. Correctly P0/P1.
- **Beehiiv DPA + SCC unresolved confirmed.** beehiiv.yaml:223 is verbatim "Beehiiv hosts in US; confirm DPA covers EU subscriber data transfer under SCCs" — a TODO marker in a production contract. First EU subscriber on Day 1 = GDPR exposure. Correctly P0/legal-track.
- **Schema-enforced inviolable rules section is exceptional.** The `audio_publish_requires_qa` 5-condition CHECK, `articles_primary_source_required`, `articles_embargo_consistency`, `articles_insight_labeled`, `articles_translation_provider_required` make 4 of the 6 inviolable rules structurally unbypassable. That is unusually strong design for a code-empty plan and the steelman is fair.
- **Cycle-1 carry-forwards are correctly tracked.** F-S-001 watchdog, F-S-002 subscriber_count guard, F-S-003 voice consent registry all properly tagged as M2/M3 implementation work, not duplicate-counted as new findings.

## What the author got wrong

- **"40 placeholder task IDs" overstates the structural problem.** T-NEW1..T-NEW20 do not appear *anywhere* in MASTER_IMPLEMENTATION_PLAN.md — not even as scope-lock prose. They exist only as forward references in product-spec.md, critic-review.md cycle-4/5/6 sections, and qa-report.md itself. T-225..T-230 + T-310A..T-310D *do* appear as scope-lock prose in MASTER:18-21 but never as task rows. The honest decomposition: **16 IDs are scope-lock prose without task rows** (a real but mechanical gap) and **20 IDs are critic-meta-references that the author is treating as if they had been promoted to MASTER, but were never promoted**. This is one decision (do cycle-4/5/6 scope expansions get task rows under their original ID range, or under a renumbered range?) — not 40 separate placeholders. Estimated fix is ~1 day of doc work, not 3 days.
- **"NO-GO; HOLD pending 2-3 week remediation" is over-calibrated.** Items 1-11 of release-checklist are doc-only and ~3-5 person-days; items 12-17 are legal/admin (DPA inventory, voice-consent signature, DeepL Pro provisioning) which run on Kimal's clock independent of engineering; items 18-25 are contract-YAML edits that fit M0 in parallel; items 26-32 are pre-M3 work that does NOT gate /team-build dispatch. **The gate question for /team-build is whether M0 can start, not whether M3 is ready.** M0 in delivery-plan §3.1 *is exactly* doc-hygiene + contract revisions; items 1-11 ARE M0 work. Calling it "blocking /team-build dispatch" is the same as saying "M0 must finish before M0 can start" — circular.
- **The B-09 / Beehiiv DPA / NEW-S-001 cluster is correctly P0 but is a pre-Day-1-launch gate (M3), not a pre-/team-build gate (M0).** The author conflates these in the verdict. Beehiiv webhook code does not exist; the DPA need not be executed before code is written. It must be executed before the first EU subscriber is collected, which is M3/launch-month, not M0/code-start. Flag P0 against launch, P2 against /team-build dispatch.
- **test-coverage.md is internally stale.** Table 2 at lines 31-53 asserts "No `Docs/specs/contracts/` directory exists on disk. All 15 planned contracts are missing artifacts." This is **false at qa-report time**: 16 contracts exist on disk (verified by `ls`). The architecture-reviewer pass that produced this table ran before contracts were authored; the file was not refreshed before being cited as evidence in qa-report.md, release-checklist.md, and risk-register.md. **This is itself a phantom-claim finding** the author did not catch. Severity P1: the cross-reference integrity table that the QA report leans on for the XR-001..009 risks is partly built on a false premise.
- **B-08 carry-forward double-counted.** F-S-001 watchdog implementation is named in 4 places (B-08 risk row, BLOCKER-SEC-4 in security-findings, release-checklist row 22, NFR-005 in performance-report). It is a single deliverable; in the risk register it should appear once with cross-references, not as a "blocker for /team-build dispatch."
- **Release-checklist row 5 self-contradicts.** The row says "bump Master-Strategy v2.0 → v2.1 / Runbook v1.0 → v1.1 / Launch Plan v1.0 → v1.1; SSOT v2.1." But SSOT on disk is `v1.0.0` (verified at SSOT.md frontmatter). The author created the version drift they are flagging.
- **B-01 "40 placeholder task IDs" is partly aspirational vs partly real.** The author counts T-NEW1..T-NEW20 (entirely critic-meta) as equivalent to T-225..T-230 (scope-lock prose). T-NEW IDs are scaffolding from cycle-4/5/6 critic notes; renumbering them into the standard T-NNN range (the test engineer's own recommendation at requirements-trace L301) collapses 20 of the 40 to "rename + flesh out" rather than "missing." Net real placeholder count: ~16, not 40.

## Findings I missed (or under-rated by author)

### P0 — blocking

| ID | File:line | Finding | Required fix |
|----|-----------|---------|--------------|
| C-001 | `Docs/qa/test-coverage.md:31-53` | Cross-reference integrity table Table 2 states all 15 contracts are missing on disk — false. 16 contracts exist (verified by `ls Docs/specs/contracts/`). This table is cited by qa-report.md, risk-register.md (XR-001..009 appendix), release-checklist.md. The verdict surface leans on a stale snapshot. | Rerun architecture-reviewer pass on current repo state; refresh Tables 2 + 1 (Contract Coverage + ADR Coverage); update XR-001..009 against current reality. ~2 hours. |
| C-002 | `Docs/qa/release-checklist.md:18` + `Docs/SSOT.md:3` | Internal version contradiction: release-checklist row 5 demands "bump SSOT to v2.1" but SSOT on disk is v1.0.0. Author named a version that does not exist as the canonical target. | Pick one version-bump direction and reconcile across release-checklist, SSOT frontmatter, and the three companion docs in one PR. |
| C-003 | `Docs/qa/risk-register.md:30` + `Docs/specs/contracts/beehiiv.yaml:223` | B-10 fix recommendation is "execute Beehiiv DPA + SCCs before EU subscriber acquisition begins (which could happen Day 1)." But the entire newsletter-acquisition surface launches at Day 1 with no Day-1 subscriber-acquisition pause documented. There is no "EU-subscriber-only delay" mechanism described in the contract or in the plan. So the fix as written is operationally vague — either there is a Day-1 acquisition pause (not in any plan doc), or DPA+SCC are gates on Day 1 newsletter launch (which makes them M3-not-M0 critical-path). | Author a single line in Master Strategy §13 or SSOT §12.8 stating: "EU subscriber acquisition is gated on executed Beehiiv SCCs. Until SCCs are signed, the reader sign-up form geofences EU IPs OR delivery to EU subscribers is held in queue." Decide which. Either is fine; "TBD" is not. |

### P1 — high

| ID | File:line | Finding | Required fix |
|----|-----------|---------|--------------|
| C-004 | `Docs/qa/requirements-trace.md:38` | Test Engineer flagged "Two parallel A-NNN schemes exist" as G-01 P0. The fix (rewrite delivery-plan §3 Accept column to reference catalog A-NNN) is correct, but the author scoped this as a 3-day doc PR with the other items. It is closer to a half-day mechanical rewrite (catalog has 59 rows; per-task scheme has 73 named cells — one-to-one rewrite, search-and-replace with catalog match). Estimate should be 0.5d, not part of a 3-5 day bundle. | Schedule G-01 as a discrete 0.5d PR ahead of the rest of M0; it unlocks all downstream traceability checks. |
| C-005 | `Docs/qa/security-findings.md:264` | F-S-005 "no `.env.example` or `SECRETS.md` visible in repo" is OPEN. The reliability and security cluster reference 16 env vars by name across 16 contracts. Without `.env.example` checked in, the M1 scaffold cannot rehearse the 5-gate verification pipeline (Gate 7 no-secrets scan). | Author `.env.example` with all 16 named env vars now, not at "M1 prep." Gates pre-M1, not just R-111. |
| C-006 | `Docs/qa/ux-validation.md:14-20` | UX validation table lists 7 design artifacts as MISSING and demands `/team-design` invocation. The author's verdict treats this as a separate gate ("INVOKE /team-design before M3 reader work"). That's correct. But the verdict does not flag that **without those artifacts the 12 reader routes + 7 components in §1.2 are unbuildable**, which means M3 (reader site) is gated on `/team-design` output, not just on M2 completion. This should be stated explicitly in the milestone dependency graph; currently delivery-plan §3.4 (M3) does not list `/team-design` as a predecessor. | Add `/team-design` invocation as M3 predecessor in delivery-plan §3.4. |
| C-007 | `Docs/qa/reliability-report.md:233` | REL-010 says DeepL fallback assumes the ROMAS Brief Workers can import `llm-orchestrator` package. ROMAS Brief is a separate monorepo (D:/dev/projects/ROMAS/ROMAS BRIEF) from the parent ROMAS COS (D:/dev/projects/ROMAS). The `llm-orchestrator` package is in the parent. The author named this P3, but the fallback chain is a Day-1 critical path for any LATAM article — if it does not exist in the Brief Workers context, DeepL 456/503 = LATAM publish blocked silently. P3 understates. | Promote to P2; author `contracts/anthropic-translation-fallback.yaml` in M1 (named in the fix but not scheduled). |
| C-008 | `Docs/qa/test-results.md:18` | T-03 banned-word "scrape" returns 5 file matches with 2 intentional and 3 unexpected — author flagged as YELLOW with "inspection needed." Inspection was not done. For a verdict gate, "inspection needed" is a phantom-check. | Run the inspection (3 files), classify each as quote-of-anti-pattern (acceptable) or actual usage (violation), and resolve. ~10 min. |

### P2 — medium

| ID | File:line | Finding | Required fix |
|----|-----------|---------|--------------|
| C-009 | `Docs/qa/requirements-trace.md:163` | A-009 missing from catalog (catalog jumps A-008 → A-010). Author tracked as P2-cosmetic; agree, but include it in the M0 catalog-cleanup PR alongside the A-061..A-077 additions. | Author A-009 row in test-qa-plan §6 alongside the others. |
| C-010 | `Docs/qa/risk-register.md:85` | "Total tracked: 88 risks" appears to use an inflated count. Counting blockers (10) + high (12) + medium (12) + low (5) + XR-001..009 (9) = 48. The "88 risks" tally is from delivery-plan R-01..R-23 + cycle-1 critic findings + persona findings + Test Engineer G-* — but those are sources, not unique items (many cross-reference each other). The summary count looks like an addition, not a deduplication. | Re-tally the register with deduplication; the count is probably ~55, not 88. |

## Conditions for GO

The plan is GO for /team-build dispatch with these conditions, all of which fit inside M0 doc-hygiene work (delivery-plan §3.1):

1. **M0 must close items 1-11 of release-checklist.md before M1 starts.** Not before M0 starts. This makes M0 the gating milestone, not an artificial pre-M0 phase.
2. **Re-run architecture-reviewer against current repo state and refresh `docs/qa/test-coverage.md` Tables 1+2 + XR-001..009.** Cite-the-stale-table is the largest single integrity gap in the QA pass and is the one finding the author missed. ~2 hours.
3. **B-05 (Launch Plan Sample 5 banned source) must be scrubbed before any further citation work.** 1 hour. Do it before /team-build is invoked, not "as part of M0" — it is a live Rule-4 violation in a doc the team will cite again next week.
4. **ADR-0005 cycle-3 rewrite + ADR-0012 placeholder stub** must be authored before M1 (item 7 + item 17). M1 cannot start without an ADR-0005 that matches the cycle-3 lock or an explicit ADR-0012 Day-30 placeholder.
5. **subscribers.region + subscribers.beehiiv_subscription_id schema migration files must exist before M1.** Items 9 + 10. The migration does not need to be applied (no Supabase project yet) but the SQL file must be on disk so M1 scaffolding can reference it.
6. **Beehiiv DPA + SCC track must be on Kimal's calendar with a named target date.** The fix is not "DPA executed before /team-build" (over-strict); the fix is "DPA-execution date in Kimal's calendar before /team-build starts, with explicit subscriber-acquisition geofence or queue-hold if DPA slips." C-003 above.
7. **Reconcile the SSOT version contradiction (C-002).** Pick one direction. 30 min.
8. **40-placeholder-task remediation: schedule as a discrete 0.5d PR within M0** to renumber T-NEW1..T-NEW20 into the standard T-NNN range and flesh out T-225..T-230 + T-310A..T-310D. Do not bundle with item 1 of release-checklist — sequence it as the first PR of M0 so other M0 work can reference real IDs.

Conditions 1-8 are ~3 person-days of preparatory + first-week-of-M0 work, identical to the author's estimate but framed as **M0 acceptance criteria** rather than a pre-M0 gate.

## Final recommendation to Kimal

The author's verdict (NO-GO/HOLD pending 2-3 week M0-prerequisite cycle) reflects a senior team-QA being prudent on a planning-rich, code-empty repo with real cross-reference debt. The instinct is correct; the framing is over-cautious. **Dispatch /team-build now, with M0 explicitly scoped as the doc-hygiene + contract-revision sweep the author described.** M0 is doc-only; it is materially what items 1-11 of release-checklist demand; treating M0 as a 2-3 week pre-/team-build gate is just renaming M0. The author's HOLD recommendation imposes a calendar-week delay without changing the substance of work to be done.

What is genuinely P0 and warrants a Kimal-level hold: **the Beehiiv DPA + SCC track** (B-10 / NEW-S-003), because it is on legal's calendar not engineering's, and the fix-path is operationally vague (C-003). Get that on Kimal's calendar this week with a target date and a fallback geofence/hold plan. Everything else closes naturally in M0.

Two findings the author did not catch deserve cycle-7 attention regardless of /team-build start: (a) the test-coverage.md stale-snapshot problem (C-001) — refresh before citing it as gate evidence; (b) the SSOT version self-contradiction (C-002) — fix in one PR.

**Verdict: GO WITH CONDITIONS.** Dispatch /team-build into M0 immediately. The 8-week pre-launch ramp does not lose a week.
