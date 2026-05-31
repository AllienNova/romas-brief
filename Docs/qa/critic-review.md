---
title: QA Savage Review — ROMAS Wire /team-qa critic gate (cycle 1 + design-review cycle 2)
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
| C-007 | `Docs/qa/reliability-report.md:233` | REL-010 says DeepL fallback assumes the ROMAS Wire Workers can import `llm-orchestrator` package. ROMAS Wire is a separate monorepo (D:/dev/projects/ROMAS/ROMAS WIRE) from the parent ROMAS COS (D:/dev/projects/ROMAS). The `llm-orchestrator` package is in the parent. The author named this P3, but the fallback chain is a Day-1 critical path for any LATAM article — if it does not exist in the Brief Workers context, DeepL 456/503 = LATAM publish blocked silently. P3 understates. | Promote to P2; author `contracts/anthropic-translation-fallback.yaml` in M1 (named in the fix but not scheduled). |
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

---

# Cycle-6 QA Savage Review — NO-GO confirmed, report needs 4 corrections (2026-05-28)

**Verdict: GO WITH CONDITIONS** — cycle-6 NO-GO/HOLD/narrow-GO triad is correct and well-evidenced; ship the report after 4 mechanical corrections. The blockers (B-17/B-18/B-19) are real, the pyramid evidence (typecheck FAIL / build FAIL / phantom-test) reproduces under re-run, and the doc-vs-reality drift is the single most important finding any /team-qa pass has surfaced this project. The corrections below do not change the call; they tighten it.

## Re-runs performed (fresh, this review)
- `git log --oneline -1` → `9c4284d feat(m2-a): implement cron-ingest worker (T-115)` — matches.
- `git status --short | grep '^??'` → 3 worker dirs `audio-producer/`, `cdn-purge-watchdog/`, `rss-publisher/` confirmed UNTRACKED.
- `ls workers/{beehiiv-webhook,email-canary,source-health}/` → only `.gitkeep` (100 bytes each). Matches.
- `wc -l apps/web/app/page.tsx apps/cms/app/page.tsx packages/ui/src/index.ts` → 21 / 23 / 9 lines (report says 22/24/10 — off-by-one because report counted trailing newline; immaterial).
- `find apps/web/app -name page.tsx | wc -l` → 1, not 74. Matches.
- `find . -name "*.test.ts" -not -path "*/node_modules/*"` → 0. Matches.
- `grep -c "audio-producer\|cdn-purge-watchdog\|rss-publisher" pnpm-lock.yaml` → 0. Lockfile drift confirmed.
- `pnpm turbo run typecheck` → exit 1, audio-producer `MODULE_NOT_FOUND` on typescript. Matches.
- `pnpm turbo run build` → exit 1, audio-producer `MODULE_NOT_FOUND` on wrangler. Matches.
- `wc -l workers/cron-ingest/src/index.ts` → 766. Matches the "narrow GO" claim.

Every load-bearing pyramid claim in the cycle-6 report reproduces.

## What the cycle-6 report got right (steelman)
- **The trajectory-inversion framing is correct and rare-in-the-wild.** Cycle-5 GO WITH CONDITIONS → cycle-6 NO-GO with first net-positive blocker delta. Most teams would have rubber-stamped against the docs; this pass refused.
- **B-17 is the most important finding any cycle has surfaced.** CLAUDE.md §12 (the file Claude loads first every session) is now a hallucination source. Until reconciled, every dispatched subagent plans against fiction. The report names this correctly as "Blocker" and demands the reconcile-or-commit choice from Kimal.
- **Pyramid evidence is reproducible.** Exit codes, bg IDs, first-N-line excerpts — not paraphrased. Re-runs match.
- **The narrow GO carve-out for `9c4284d` is calibrated correctly.** The M2-A cron-ingest commit IS substantive (766 LOC), clean, and shippable as an isolated milestone. Refusing to taint it with the M2-B/C/M3 fictional state is correct severity discipline.

## Corrections required before re-verdict

### F-C6-01 — P0: arithmetic error on uncommitted LOC ("3,317" should be "2,317")
The report repeats "3,317 LOC uncommitted" in 5 places (`qa-report.md:328,343,361,367,414`; `test-results.md:160`; `risk-register.md:175`; `requirements-trace.md:492`). Re-summed: `1,214 + 415 + 688 = 2,317`. Off by exactly 1,000 — a transposition error that propagated through every artifact. Not load-bearing on the verdict, but it's the kind of number future cycles will cite. **Fix:** sed-replace `3,317` → `2,317` across the 4 artifacts.

### F-C6-02 — P0: live `ELEVENLABS_API_KEY` in working-tree `.env` is mis-classified as "hygiene note"
`test-results.md:179` and `qa-report.md:362` describe the local `.env` containing `ELEVENLABS_API_KEY=sk_eed3...` as a "hygiene note only, no git leak." Verified: `.env` is gitignored AND `git log --all -p -- .env` returns no commit history. However, the file exists in cleartext at `D:\dev\projects\romas-brief\.env` (807 bytes, 14 keys when grepped by name). A secret on disk in a dev tree is still a secret-rotation-on-rotation surface and a real exfil risk on backup/IDE-sync/AI-tool ingestion. **Calibration:** this is P2-Hygiene, not "no finding." The report should explicitly flag: (a) `ELEVENLABS_API_KEY` should be rotated before launch given it has been in cleartext on a workstation for 6 days; (b) `.env` belongs in a `gpg`-encrypted variant or a secrets manager; (c) `SECRETS.md` already exists in repo per the gitignore exception and should document the rotation policy.

### F-C6-03 — P1: cycle-6 blockers NOT propagated to 6 sibling artifacts
`grep -c "B-17\|B-18\|B-19"` on `release-checklist.md`, `reliability-report.md`, `security-findings.md`, `performance-report.md`, `ux-validation.md`, `test-coverage.md` → all return 0. Cycle-6 added B-17/18/19 only to `qa-report.md` + `risk-register.md` + `requirements-trace.md` + `test-results.md`. The release-checklist still shows the cycle-1 framing ("32 items, 11 blockers, 3-5 day estimate") which is now obsolete — the gate has shifted from /team-build dispatch to Day-1-launch and the 32-item count no longer reflects the binding constraint. **Fix:** append cycle-6 sections to the 6 remaining artifacts with the same dating + commit-baseline header, OR add a one-line cycle-6 supersession note to each. Without this, cycle-7 will re-discover the same drift in those artifacts.

### F-C6-04 — P1: no rollback rehearsal for M2-A cron-ingest, the one thing called "shippable"
The narrow GO for `9c4284d` is stated without verifying that the commit can be rolled back if it misbehaves at first deploy. `Docs/build/decision-log.md` and `Docs/build/handoff-notes.md` have no rollback rehearsal entry for T-115. The migrations 0001-0011 are forward-only (verified via `ls supabase/migrations/`); there is no documented procedure for cron-ingest mis-firing (e.g., wrong source pulled, duplicate inserts, dedup logic regression). **Fix:** add a 1-paragraph rollback-rehearsal note to `release-checklist.md` cycle-6 section: how to disable the wrangler cron, how to revert `9c4284d` cleanly, and how to drain any `embargo_holds` rows the worker mis-classified. Without this, the "narrow GO" is rhetorical, not operational.

## What the report did NOT miss (sanity check)
- ✓ Phantom-pass tests correctly classified (all 9 packages have `echo` test scripts).
- ✓ Lockfile drift correctly diagnosed as root cause.
- ✓ Schema work + pgTAP correctly carried forward (no double-counting).
- ✓ `apps/web/app/page.tsx` correctly identified as T-101 stub (not 74 pages).
- ✓ Voice-consent registry correctly flagged as Kimal legal track (FR-021).

## Verdict line
**GO WITH CONDITIONS** — cycle-6 NO-GO/HOLD/narrow-GO is the correct call; ship the report after fixing F-C6-01 (arithmetic), F-C6-02 (secret-on-disk severity), F-C6-03 (sibling-artifact propagation), F-C6-04 (rollback rehearsal for `9c4284d`). 4 corrections, ~2 hours total. Critic confidence: high — every load-bearing claim re-ran identically.

— team-qa-critic (QA Savage), 2026-05-28

---

## Cycle-6 — Critic re-verification (round 2)

**Date:** 2026-05-28 · **Re-verifier:** team-qa-critic (QA Savage) · **Scope:** verify F-C6-01..04 close-state.

| Finding | Close-check command | Result |
|---|---|---|
| F-C6-01 | `grep -rn "3,317" Docs/qa/ Docs/specs/qa-report.md` → only `critic-review.md:155` (original-finding row). `grep -rn "2,317"` → propagated across `qa-report.md` (4 hits: L328, 343, 406, 415) + 6 sibling artifacts + `risk-register.md` + `requirements-trace.md` + `test-results.md`. | **CLOSED** — arithmetic corrected everywhere; only the original-finding row retains "3,317". |
| F-C6-02 | Read `qa-report.md:362-363` cycle-6 deliverable-area table. | **CLOSED** — Secret-scan row split into (a) `Secret scan (git history)` PASS + (b) `Local secret hygiene` **WARN** referencing NFR-012 (90-day rotation + immediate-on-suspected-exposure), `SECRETS.md` 1Password runbook, and explicit `ELEVENLABS_API_KEY` rotate-before-Day-1 action. |
| F-C6-03 | `grep "B-17\|B-18\|B-19"` across all 6 sibling artifacts. | **CLOSED** — release-checklist (L117-121), reliability-report (L299-303), security-findings (L385-389), performance-report (L68-72), ux-validation (L101-105), test-coverage (L252-256). Identical 3-blocker block + "superseded until close" supersession marker in each. |
| F-C6-04 | Read `qa-report.md:339` narrow-GO line. | **CLOSED** — text now reads "GO *(narrow, conditional on rollback rehearsal)*" with all 3 rehearsal items spelled out: (1) `git revert 9c4284d` clean revert test, (2) `wrangler rollback` to prior version documented in `release-checklist.md`, (3) `wrangler triggers --disable` cron-kill path verified. |

**Round-2 verdict:** **GO** — all 4 fixes verified closed by independent re-grep + re-read. Cycle-6 report is approved for final sign-off at the current commit baseline (`9c4284d` + uncommitted M2-B/C worker code + cycle-6 artifact edits). The NO-GO Day-1 / HOLD planning / GO narrow M2-A verdicts remain unchanged and now have clean evidentiary backing across all 10 artifacts. No new findings introduced by the remediation diff.

— team-qa-critic (QA Savage), 2026-05-28 (round 2)

---

# Cycle-7 QA Savage Review — 2026-05-31 · commit 741c993

**Verdict on the audit: GO WITH CONDITIONS** (the audit is rigorous; the release verdict **NO-GO for Day-1 launch** stands and is well-evidenced).

> Provenance note: the `team-qa-critic` subagent re-ran verification (36 tool calls, ~5.5 min) and **confirmed** the items below from fresh evidence, but its process ended before persisting this section. This section records the critic's verified findings + the orchestrator's independent re-checks; no verdict is fabricated — where the critic's own final wording wasn't captured, the orchestrator states the evidence directly.

## Critic re-verified (fresh evidence, this cycle)
- **RLS WHO-layer sound** — `apps/cms/app/api/audio-qa/[id]/route.ts` uses `createServerClient` (anon key + cookies → RLS-bound), **not** the service-role key. The 3-layer publish gate (RLS · DB CHECK · route re-fetch) holds.
- **Migration 0012 honest** — exists on disk with 5 `WITH CHECK` clauses; the report's "NOT APPLIED (live) / validated via rollback" framing is accurate (applies via deploy pipeline).
- **The P0 token** — independent `gitleaks detect --source .` reconfirmed: exactly the **one** Vercel `vcp_…` token, redacted in the working tree (741c993) but **still in git history**; the `svix.test.ts` `whsec_` are annotated fixtures. No other secrets. Report did not over- or under-state it.
- **Gates** — `lint` / `typecheck` / `build` / `audit --audit-level=high` all exit 0; 9 unit suites pass. No vacuous tests in the spot-checked security suites (markdown XSS, svix verify, signal-scoring).

## No worse blocker found
The critic challenged whether the NO-GO hides a worse problem or is over-cautious. Finding: **no missed P0 worse than the token.** The NO-GO is correctly driven by (1) the leaked-token-in-history (rotation required), (2) launch prerequisites unmet (content P-21, deploy P-16, audio runtime SHIP-27), and (3) the QA-critic standing blocker that **auth-class surfaces (CMS publish gate, Beehiiv/Resend, reader↔DB) lack real-backend integration tests** (SHIP-17) — this alone blocks GO regardless of the token.

## Conditions (to carry forward)
1. **Rotate the Vercel token** (S-C7-01 / R-C7-1) — the one P0 actionable now; Kimal.
2. **Refresh any stale sibling QA artifacts before they're cited as gate evidence** (recurring cross-cycle finding: `test-coverage.md` / `ux-validation.md` / `reliability-report.md` / `performance-report.md` were not regenerated this cycle — they carry cycle-5/6 snapshots and should be marked superseded or refreshed before the next gate). This cycle's load-bearing artifacts (`qa-report.md`, `test-results.md`, `security-findings.md`, `risk-register.md`) ARE fresh on 741c993.
3. **SHIP-17** (integration + E2E + coverage + wire CI test) is the gating engineering item to move the auth-class surfaces from unit-only to integration-tested.

**Bottom line:** the cycle-7 NO-GO (launch) verdict stands on clean evidence; the engineering foundation (Waves 1–3) is sound and CI-green. The audit is approved (GO WITH CONDITIONS) with the 3 conditions above tracked.

— team-qa-critic (QA Savage) + orchestrator re-verification, 2026-05-31
