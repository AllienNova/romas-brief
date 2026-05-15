---
title: M0 cycle-1 + cycle-2 Decision Log
date: 2026-05-14 (cycle-1) · 2026-05-15 (cycle-2 close)
reconstructed: 2026-05-15 (cycle-1 entries recovered from conversation history; cycle-2 entries authored live)
---

# M0 Decision Log

Implementation-time decisions where the spec was silent. Each entry: context · decision · rationale · alternative considered · owner of completion.

## D-001 — Sample 5 primary-source replacement strategy

**Context**: Launch Plan §6 Sample 5 cites `meddeviceguide.com` as primary source — Rule-4 violation per cycle-2 R-014. The official Council of EU press release for the May 7, 2026 AI Act Omnibus provisional agreement requires live URL verification, which the build agent cannot perform without web access.

**Decision**: Cite the European Commission's *Regulatory Framework for AI* page (`digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai`) as the primary source, plus an inline `**fact-check pre-publish**` flag explicitly instructing `regulatory-analyst` to substitute the specific Council press-release URL once located via `consilium.europa.eu/en/press/press-releases/` before this sample article ships.

**Rationale**: Citing the European Commission's official AI Act page satisfies Rule 4 at the body level (EU official source); the fact-check flag makes URL-completion explicit and assignable. Inventing a specific Council press-release URL without web verification would violate "no hallucinated URLs."

**Alternative considered**: Remove Sample 5 from the Launch Plan entirely until the URL is verified. Rejected because Sample 5 demonstrates the EU regulatory pattern; removing it weakens the multi-jurisdiction story.

**Owner of completion**: regulatory-analyst (R-014 close + Sample 5 fact-check pre-Day-1).

---

## D-002 — `subscribers.region` default value

**Context**: Cycle-5 three-edition publish requires every subscriber row to have a `region` value for Beehiiv segment-based delivery. Existing subscribers in any pre-launch migration have no region tag. Schema must specify a default.

**Decision**: `region` defaults to `'americas'`.

**Rationale**: Most launch-window subscribers (W-7 through Day 1) are expected to be US/Canada-anchored (English-language editorial, US-anchored sample articles in current Launch Plan §6, US time-zone owner). Setting default to `'americas'` minimizes the size of post-launch `UPDATE subscribers SET region = ...` reconciliation work. EU/APAC subscribers acquired after Day 1 will have `region` set explicitly by the Beehiiv webhook handler based on the custom field or by Cloudflare `cf-ipcountry` auto-detect at signup.

**Alternative considered**: Default to `'global'`. Rejected because `'global'` is the rarest tag (mostly IAEA / WHO content); using it as default would inflate the `'global'` cohort and skew three-edition delivery targeting.

**Risk**: If Day-1 subscriber composition is more EU/APAC-heavy than expected, the default `'americas'` mis-routes those subscribers to the 11:00 UTC edition instead of their local-morning edition. Mitigation: cf-ipcountry auto-detect on signup form runs BEFORE the Beehiiv subscribe call, so new signups get the correct region at insert time. Default only matters for any pre-cycle-5 subscribers (zero at this writing).

**Owner**: cms-engineer at M3 implementation; flag for /team-qa to verify product-spec FR-033 intent.

---

## D-003 — ADR-0012 deferred-decision pattern

**Context**: QA-critic condition 6b requires ADR-0012 (Video Podcast hosting vendor) authored before M1. The actual vendor decision is deferred to Day 30 per SSOT §10 Q6.

**Decision**: Author a `Placeholder` status ADR with explicit Day-30 author date + decision rubric + 5-vendor candidate comparison table, instead of either (a) leaving ADR-0012 absent or (b) prematurely picking a vendor without sufficient evaluation.

**Rationale**: A placeholder ADR with clear deferral metadata is better than a missing ADR (the Tier-5 video architecture in ADR-0005 references ADR-0012 by number; a missing ADR is a broken cross-reference). The placeholder makes the deferred-decision explicit and assignable.

**Pattern**: Future deferred-decision ADRs follow the same pattern — `Status: Placeholder (deferred-to {date})`, candidate table, decision rubric, pre-decision work list.

---

## D-004 — Six-rule wording: where canonical SSOT §2 conflicts with Master-Strategy §6.1 historical phrasing

**Context**: Master-Strategy §6.1 (pre-edit) phrased rules differently than CLAUDE.md §4 / AGENT.md §5 / SSOT §2. e.g., Rule 4 in Master-Strategy was "No publish without human approval for Literature, Reimbursement, FDA, and Guideline content at launch" — operationally close but not identical to SSOT §2 Rule 4 "Verify openFDA discoveries against the official FDA 510(k) / De Novo / PMA record before drafting. openFDA is discovery only."

**Decision**: Replace Master-Strategy §6.1 + Runbook §6 with **SSOT §2 verbatim canonical wording**, NOT the operational paraphrase.

**Rationale**: SSOT precedence (SSOT §9) dictates that on conflict, SSOT wins. Historical Master-Strategy phrasing was an operational paraphrase that drifted; canonical SSOT wording is the agent-loadable contract. Future agents loading Master-Strategy + Runbook now see the same rules as agents loading CLAUDE.md + AGENT.md.

**Edge case**: The Master-Strategy v2.0 "human approval for Literature/Reimbursement/FDA/Guideline content" rule is operationally separate from cycle-2 "auto-publish graduation after 60d <1% correction rate" (Q7) — the operational rule still applies. It moved out of the inviolable-rule list (where it doesn't belong; it's a category-level approval rule, not an inviolable rule). It now lives in §6.2 "Three-state approval" of Master-Strategy.

---

## D-005 — `.env.example` scope: include or exclude Day-60 video env vars

**Context**: `.env.example` needs to enumerate all Day-1 env vars. Day-60 Tier 5 Video Podcast hosting vendor (ADR-0012) is deferred; vendor-specific env vars are unknown.

**Decision**: Day-1 `.env.example` does NOT include Day-60 video env vars. ADR-0012 author at Day 30 will add the vendor-specific env vars in an `.env.example` cycle-2 PR.

**Rationale**: Don't pre-allocate env-var slots for an undecided vendor. The deployment-plan §5 secrets table will get a new row when ADR-0012 lands.

---

## D-006 — Runbook "Beehiiv publish API fails" failure-mode wording

**Context**: Runbook §7 failure-mode table mentions "Beehiiv publish API fails" with fallback "manual paste from generated drafts." Cycle-3 split made Beehiiv = newsletter only; transactional is Resend. The failure-mode wording predates the split.

**Decision**: Rewrite to "Beehiiv newsletter API fails (newsletter delivery only; transactional is Resend per ADR-0007 cycle-3)." Manual-paste fallback preserved.

**Rationale**: Surface the split explicitly so future operators don't conflate the two surfaces during incident response.

---

## D-007 — Skill-file synchronization deferred to M0 cycle-2

**Context**: `.claude/skills/cms-schema.md` (operational guidance) drifted from `docs/specs/contracts/supabase-schema.sql` (canonical SQL) — cycle-4 and cycle-6 added new columns to the canonical that aren't yet in the skill.

**Decision**: Defer skill-file sync to M0 cycle-2. Canonical SQL is authoritative per SSOT §9 precedence; agents loading the skill file get partial guidance but the canonical SQL wins on conflict.

**Rationale**: Skill files are operational, not authoritative. Authoring the cycle-2 sync PR with full column-by-column reconciliation is ~1 hour of work better batched with the other M0 cycle-2 doc edits.

**Risk**: Until cycle-2 sync, agents loading `cms-schema.md` skill don't see `articles.category`, `articles.content_type`, `articles.source_language`, `articles.translation_provider`, `subscribers.region`, `subscribers.beehiiv_subscription_id`. Mitigation: explicit pointer added to skill frontmatter directing readers to `docs/specs/contracts/supabase-schema.sql`.

---

## Decisions explicitly NOT made in cycle-1

- **CLAUDE.md + AGENT.md structural rewrites** — deferred to M0 cycle-2
- **T-NEW renumbering scheme** — deferred to M0 cycle-2
- **A-NNN catalog expansion** — deferred to M0 cycle-2
- **Beehiiv DPA + SCC mechanism choice (geofence vs queue-hold)** — Kimal-track decision; not /team-build
- **DeepL Pro account provisioning** — Kimal + DevOps track; not /team-build
- **Voice consent registry signing** — Kimal legal track; not /team-build

---

# M0 cycle-2 decisions (2026-05-15)

## D-008 — Repo separation execution via `git clone` instead of `mv`

**Context**: ADR-0014 implementation step 5 specified `mv "D:\dev\projects\ROMAS\ROMAS BRIEF" "D:\dev\projects\romas-brief"`. The `mv` failed with `Device or resource busy` because the active Claude Code session held the source directory as its CWD (Windows file lock).

**Decision**: Execute the separation via `git clone --no-local "ROMAS/ROMAS BRIEF" romas-brief` from the baseline commit `dcc8389`. Functionally equivalent to `mv` (same files, same commit, same content), non-destructive, and works around the Windows CWD lock.

**Rationale**: Cloning produces an identical content + history snapshot at the target path. The old path's `.git/` and contents are abandoned, scheduled for manual `rm -rf` after the session ends. No work is lost because both repos share commit `dcc8389`.

**Trade-off**: Slight inelegance — the documented ADR step says `mv` but execution was `git clone`. ADR-0014 §Implementation step 5 should be updated to read "**Move** — `mv` if possible, else `git clone --no-local` from the baseline commit (recommended pattern when the session's CWD locks the source path)." Tracked as low-priority M0c2 doc edit.

---

## D-009 — GitHub org selection: `AllienNova` over `aliennova`

**Context**: Q13 lock (2026-05-14) named the GitHub identity as `aliennova/romas-brief`. The `aliennova` org does NOT exist on GitHub. Visible orgs in `gh auth status`: `TeamAlienNova`, `AllienNova`. Latter (double-L spelling) carries description "Building Things People Want — AI, Healthcare, Fintech, Education" — matches the AlienNova brand.

**Decision**: Use `AllienNova/romas-brief` (private). Patch SSOT §3 row 19 + ADR-0014 to use the actual org name.

**Rationale**: Q13 lock spelled the org as `aliennova` (lowercase) but the intent was the AlienNova brand org. The double-L is the actual on-disk spelling on GitHub. Acting on intent rather than typo. Patch surfaces the casing drift in SSOT for audit trail.

**Alternative considered**: `kimhons/romas-brief` (personal account, matches existing `kimhons/ROMAS` pattern). Rejected because Q13 explicitly named an org, and the AlienNova brand org exists and is appropriate.

---

## D-010 — Build-log reconstruction policy

**Context**: M0 cycle-1 build artifacts (`build-log.md`, `handoff-notes.md`, `decision-log.md`, `critic-review.md`) were excluded from baseline commit `dcc8389` by the `.gitignore` `build/` pattern. Old disk path emptied between sessions. Original files unrecoverable from disk.

**Decision**: Reconstruct the 4 artifacts from conversation transcript on 2026-05-15. Mark each with a `reconstructed:` frontmatter field naming the date and the recovery source. Preserve substantive content (decisions, file lists, verification tables) over byte-for-byte reproduction.

**Rationale**: The substance (which files were edited, what decisions were made, what conditions were closed) survives in conversation memory. Audit trail integrity matters more than artifact pristineness. Reconstruction note makes the provenance transparent.

**Lesson learned**: `.gitignore` patterns must be **anchored** (use `/build/` for root-only, `apps/*/build/` for workspace builds) when a project also has `docs/build/` for documentation. Generic `build/` is dangerous in monorepos with docs subtrees.

---

*Cycle-1 entries reconstructed 2026-05-15 from conversation history. Cycle-2 entries (D-008..D-010) authored live during M0c2 close.*
