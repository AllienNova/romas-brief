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

---

# Cycle build-2026-05-21 (review-remediation) — D-011..D-024

Implementation-time decisions made during the /team-build cycle that remediated the 17 items from the `/team-review` synthesis (3 reviewers, 4 HIGH / 11 MEDIUM / 12 LOW).

Note on numbering: cycle-2 close used D-008..D-010 (cf. previous section). This cycle continues sequentially at D-011 to avoid collisions.

## D-011 — Re-classify reviewer recommendations against the canonical contract

**Context**: The three /team-review reviewers (security, architecture, code-quality) audited migrations 0001-0005 in isolation, without reading `Docs/specs/contracts/supabase-schema.sql`. Their HIGH recommendations (loudness widen, embargo CHECK, URL format CHECK) read as "the migration is wrong" — but the migrations cite the contract as their source-of-truth, and the contract specifies the prior values verbatim.

**Decision**: At the /team-build plan-approval gate, surface the contract-vs-recommendation conflict per item and require Kimal adjudication before unilateral migration edits. Classify each item as (A) contract-drift requiring spec amendment, (B) additive contract extension, or (C) scaffold/config only.

**Rationale**: A migration edit that diverges from the canonical contract is a P0 spec/impl drift — exactly the failure mode `team-build-critic` blocks on. The reviewers' recommendations were valid as proposed amendments; treating them as such instead of as unilateral fixes preserves the contract-as-truth discipline established in cycle-1 (and reinforced by ADR-0014's repository-separation insistence on single sources of truth).

**Alternative considered**: Apply reviewer recommendations directly to migrations. Rejected — would have introduced silent contract drift, would have been caught by the critic anyway, would have wasted a cycle.

**Owner of completion**: Build Lead (this cycle).

---

## D-012 — A1 loudness band widen `[-17,-15]` → `[-18,-14]` LUFS

**Context**: Cycle-1 critic finding F-P1-01 upgraded the `audio_publish_requires_qa` CHECK from 4 to 5 conditions and fixed the loudness band at `[-17, -15]` LUFS. Cycle build-2026-05-21 quality reviewer flagged the band as too tight: ElevenLabs/PlayHT output normalize-lands at `-17.5` to `-14.5` LUFS, and a strict DB band blocks legitimate near-target masters.

**Decision**: Adopt the reviewer's recommendation. Widen the DB-layer CHECK to `[-18, -14]` LUFS (broadcast speech safe band). Move the tight `-16 ±1 LUFS` production target out of the DB layer into the audio-qa-reviewer agent + audio-production-pipeline R-202 two-pass loudnorm step.

**Rationale**: Layered defense. The DB is the floor (broken masters fail), the pipeline is the production target with re-master semantics, the reviewer is the human judgment layer. Hard-rejecting episodes at `-16.9 LUFS` is operationally undesirable for a daily-cadence editorial product. The 5-condition shape from F-P1-01 is preserved; only the band tolerance changes.

**Alternative considered**: Keep `[-17, -15]` and engineer the pipeline to hit it on first pass ≥99.5% of the time. Rejected — the engineering effort is significant and the false-positive rejection cost falls on legitimate publishes daily.

**Counter-argument acknowledged**: This partially reverses cycle-1 F-P1-01's tightening. The reversal is documented in ADR-0016 with a closing condition (re-tighten if the pipeline can land inside `[-17, -15]` ≥99.5% reliably).

**Owner**: ADR-0016 author (this cycle); audio-qa-reviewer agent definition (this cycle); audio-production-pipeline skill update (this cycle).

**Anchored in**: ADR-0016, SSOT §3 row 12 + §7 rule 6, 19 forward-looking files updated in this cycle (see build-log "Bucket A propagation").

---

## D-013 — A2 embargo release-pair CHECK (convergent finding 3-of-3)

**Context**: All three /team-review reviewers flagged the `(released_at IS NOT NULL) ↔ (released_to_article_id IS NOT NULL)` invariant as comment-only enforcement. The contract authors had documented the invariant as "by workflow convention; not constraint-enforced because the release worker writes both in a single update."

**Decision**: Add the explicit `CHECK ((released_at is null) = (released_to_article_id is null))` constraint to `embargo_holds`. Amend the canonical contract + migration 0005.

**Rationale**: A worker crash mid-update (or any future raw UPDATE setting only one column) would leave the row silently half-released, undetectable by inviolable rule 2. One-line CHECK eliminates the corruption class at zero cost. The "single atomic update" workflow assumption is correct for the happy path but fragile against operational failures.

**Owner**: This cycle.

---

## D-014 — A3 URL scheme CHECKs (convergent 2-of-3)

**Context**: Reviewers flagged that the `length > 0` CHECK on `primary_source_url` accepts `.`, ` `, and `javascript:` payloads. Same lack of scheme validation on `sources.feed_url`, `sources.api_endpoint`, `claims.source_url`.

**Decision**: Tighten the rule-1 CHECK on `articles.primary_source_url` to `length > 0 AND col ~* '^https?://'`. Add equivalent scheme regex to `claims.source_url` (CHECK NOT NULL), `sources.feed_url` (nullable), `sources.api_endpoint` (nullable). Amend canonical contract + migrations 0001, 0003, 0004 in lockstep. R-105 extends pgTAP coverage to include these regex constraints.

**Rationale**: Defense-in-depth for inviolable rule 1 (primary source) and SSRF prevention for the T-115 cron-ingest fetch path. Single-line additions per column; no behavioral impact on legitimate URLs.

**Owner**: This cycle.

---

## D-015 — A4 `body_md` + `script_md` length cap (200 KB)

**Context**: Reviewer flagged that uncapped `body_md` length turns the `word_count` generated column's `regexp_split_to_array` into a DoS vector. 200 KB ≈ 32k words covers the deepest 3,500-word "deep_report" archetype with ample headroom.

**Decision**: Add `CHECK (length(body_md) <= 200000)` to `articles.body_md`; equivalent guard on `audio_jobs.script_md` (nullable). Amend contract + migrations 0001, 0002.

**Rationale**: Cheap DoS guard. Editorial archetype caps documented in CLAUDE.md §1 stop well below 200 KB. R-105 extension covers pgTAP.

---

## D-016 — A5 `word_count` trim() bugfix

**Context**: `regexp_split_to_array(body_md, '\s+')` returns `{'', 'text'}` on leading-whitespace bodies, inflating `word_count` by 1.

**Decision**: Change the generated column expression to `regexp_split_to_array(trim(body_md), '\s+')`. Amend contract + migration 0001.

**Rationale**: Off-by-one bug; trivial fix. Existing word-count assertions in R-105 will pick up the corrected behavior.

---

## D-017 — A6 `(article_id, audio_tier)` unique on audio_jobs

**Context**: Reviewer flagged a race condition: the audio-producer agent retries on failure (audio-production-pipeline §3-retry backoff). Without a unique constraint, retries can create duplicate audio_jobs rows for the same (article, tier).

**Decision**: Add `CREATE UNIQUE INDEX audio_jobs_article_tier_uniq ON audio_jobs(article_id, audio_tier);` to canonical contract + migration 0002.

**Rationale**: Makes retries idempotent at the DB layer. The audio-producer can safely `INSERT … ON CONFLICT (article_id, audio_tier) DO NOTHING` (or `UPDATE`) without race semantics.

---

## D-018 — A7 `articles.publish_at` partial index

**Context**: SSOT §3 row 8 locks the 3-edition publish scheduler (APAC 22:00 / EU 06:00 / Americas 11:00 UTC). The scheduler's hot-path query is `WHERE status = 'ready_to_publish' AND publish_at <= now()`. The pre-existing `articles_status_idx` doesn't accelerate the publish_at range scan.

**Decision**: Add `CREATE INDEX articles_publish_at_idx ON articles(publish_at) WHERE status = 'ready_to_publish';`. Partial keeps the index tight as the article catalog grows.

---

## D-019 — A8 `sources_active_idx` replaced with partial on `last_fetched_at`

**Context**: Original `CREATE INDEX sources_active_idx ON sources(active);` is a btree on a boolean column (~50% selectivity) — a planner no-op. The actual cron query is "oldest active sources first" for round-robin freshness.

**Decision**: Drop the old index name `sources_active_idx`. Add `CREATE INDEX sources_active_last_fetched_idx ON sources(last_fetched_at) WHERE active = true;`.

**Rationale**: Replacement, not addition. Aligns the index shape with the cron's actual query.

---

## D-020 — A9 + A10 misc CHECK constraints

**A9**: `articles.author_id` is nullable but published articles must have an author. Add `CHECK (status <> 'published' OR author_id IS NOT NULL)`.

**A10**: `qa_reviewers.email` is `UNIQUE` but case-sensitive. Add `CHECK (email = lower(email))`; application layer is required to lowercase before insert.

**Decision**: Both adopted in canonical contract + migration 0001. R-105 extension picks up pgTAP for both.

---

## D-021 — A11 `audio_jobs.tier` → `audio_jobs.audio_tier` rename

**Context**: `articles.tier` (editorial-edition enum: `daily / friday_read / conference`) and `audio_jobs.tier` (audio product enum: `audio_brief / daily_brief / podcast / conference_brief / video_podcast`) share a column name but carry entirely different enumerations.

**Decision**: Rename `audio_jobs.tier` to `audio_jobs.audio_tier`. Keep `articles.tier` unchanged (it has wider surface area). Amend canonical contract + migration 0002 + 4 propagation files (ADR-0005, test-qa-plan A-056, performance-report NFR-006, `.claude/skills/cms-schema.md` line 141). ADR-0017 documents.

**Rationale**: Joins become self-documenting. Onboarding cost lower. Aligns with SSOT §4 vocabulary which consistently says "audio tier" for the audio enum.

**Index name kept** as `audio_jobs_tier_published` (internal-only; not worth the churn).

---

## D-022 — A12 `claims.confidence` type clarity

**Decision**: `numeric(3,2)` (allows storage to 9.99 before CHECK fires) → `numeric(4,3)` (allows storage 0.000-9.999; still bounded by CHECK between 0 and 1). Cosmetic; CHECK is the real guard.

**Rationale**: Better expresses a probability. Low impact; reviewer flagged as clarity not correctness.

---

## D-023 — A13 Seed PII — keep as-is

**Context**: `supabase/seed.sql` inserts `('president@aliennova.com', 'Kimal Honour Djam', 'audio_qa')`. Reviewer flagged as a generic PII concern.

**Decision**: Keep as-is.

**Rationale**: Kimal authored the data, the data is Kimal's, the repo is private, and remediation-plan M1 R-114 explicitly mandates "seed `qa_reviewers` with Kimal." Env-templating the row adds operational friction without security benefit at this scale. If subscriber base or compliance posture changes, env-template becomes appropriate; flag for re-evaluation at Day 90.

**Owner**: Kimal (explicit /AskUserQuestion answer 2026-05-21).

---

## D-024 — Bucket C non-contract scaffolding decisions

| ID | Decision | Rationale |
|---|---|---|
| C2 | Hoist `baseTailwindConfig` to `packages/config/src/tailwind.ts`; add `tailwindcss@3.4.15` to packages/config devDeps | Under `node-linker=isolated`, a package that type-imports `tailwindcss` must declare it. Typecheck caught the missing dep on first run; this is a real diagnostic, not a placeholder. |
| C3 | Drop `./tsconfig-base.json` re-export from `packages/config/package.json`; the workspace-root `tsconfig.base.json` is the single canonical source. | Two sources of truth (root file + package re-export) would silently drift. Workspaces extend the root file directly. |
| C4 | Remove `verbatimModuleSyntax: false` override from `workers/cron-ingest/tsconfig.json` | Confirmed by typecheck PASS. The reviewer's claim that Wrangler 3 + esbuild are compatible with `verbatimModuleSyntax: true` is empirically validated. |
| C5 | Drop `lint dependsOn ["^lint"]`; switch `test dependsOn` to `["^typecheck"]` | Lint is workspace-local. Test depending on `^build` was forcing `next build` on every test run; `^typecheck` is the right shape. |
| C6 | `.npmrc save-prefix=^` → `save-exact=true` | An editorial platform needs reproducible builds. Carets in package.json from prior `pnpm add` calls survive (manual exact-pin where required, e.g., C11 `next`). |
| C7 | `pnpm.overrides` for `undici >=6.24.0` + `glob >=10.5.0` | Verified by `pnpm why` post-install: undici 5.29.0 → 8.3.0; glob 10.3.10 → 13.0.6. CVE GHSA-vrm6-* + GHSA-h25m-26qc-wcjf + GHSA-5j98-mcp5-4vw2 closed. |
| C10 | Reviewer's `compatibility_date` "future-dated" claim is stale — date `2026-05-01` is 3 weeks in the past relative to today (2026-05-21). NO CHANGE. | Reviewer was operating from out-of-date today-date assumption. |
| C13 | ADR-0015 — Next 14 GHSA-h25m-26qc-wcjf accepted CVE | Per SSOT §5 Next 14 lock. Accept residual risk with named controls (RSC input validation, body cap, edge rate-limit, quarterly review). Closes when Next 14.x patch backport ships OR ADR-0001 is amended for Next 15. |

---

## D-024-followup — team-build-critic gate findings closed

**Context**: `team-build-critic` returned `APPROVE WITH CONDITIONS` with 1 P0 + 2 P1 findings. P2 findings deferred per critic explicit allowance.

**Findings closed**:

1. **P0 — `.claude/skills/cms-schema.md:98`** — DDL example still used old `tier` column name AND was missing `video_podcast` from the enum (4 of 5 values). **Fix**: renamed column to `audio_tier`, added `video_podcast`, inline comment cites ADR-0017 + M0c2 + ADR-0005 cycle-3 provenance. Verified by grep: pattern `tier text not null check` no longer matches any forward-looking file.
2. **P1 — `.claude/agents/audio-producer.md:23`** — target-tier list missing `video_podcast`. **Fix**: added Tier 5 value with ADR-0005 + ADR-0012 launch-date reference. Column name also clarified as `audio_jobs.audio_tier` per ADR-0017.
3. **P1 — `Docs/build/build-log.md:200-212` Bucket A table** — D-NNN cross-references were off-by-N (used D-008..D-018 which collide with cycle-2 entries). **Fix**: rewrote every "Other propagation" cell to use the correct D-012..D-023 mapping for this cycle. Also added line 58 attribution to A1 row for audio-qa-checklist.

**P2 also closed (cheap fixes)**:

- **P2.1 — `.claude/agents/cms-engineer.md:115`** — generic `tier` reference now disambiguated to `articles.tier (editorial)` + `audio_jobs.audio_tier (audio product, ADR-0017 rename)` + `articles.publish_at` partial index.
- **P2.2 — `Docs/specs/contracts/supabase-schema.sql:148`** — inline history comment now carries `A11 (build-2026-05-21): column renamed tier → audio_tier per ADR-0017` alongside the prior M0c2 + ADR-0005 cycle-3 attribution.
- **P2.3 — `Docs/build/build-log.md:200`** — A1 row's audio-qa-checklist entry now names line 58 explicitly.

**Verification grep**:
- `audio_jobs\.tier` forward-looking — 0 matches (residual matches are all in documentation-of-the-rename: ADR-0017 self-reference, build-log A11 row, decision-log D-021, historical cycle-1 critic-review).
- `tier text not null check` — 0 matches (no remaining DDL using `tier` as column name anywhere).
- `video_podcast` in cms-schema.md + audio-producer.md — confirmed present (lines 99 + 23 respectively).

**Verdict downgrade**: `APPROVE WITH CONDITIONS` → `APPROVE`. Cycle build-2026-05-21 is ready to hand off to `/team-qa`.

**Owner**: This cycle, completing within the 3-cycle critic budget on cycle 1 (no iteration required).

---

## D-025 — /team-qa pass corrects Bucket C C11 next version pin (14.2.18 → 14.2.35) + 3 transitive overrides

**Context**: /team-qa cycle build-2026-05-21 ran fresh `pnpm audit` against the post-/team-build state and found **26 vulnerabilities** in `next@14.2.18` (1 critical, 7 high, 14 moderate, 4 low). The CRITICAL was `GHSA-f82v-jwr5-mffw` (Authorization Bypass in Next.js Middleware) — patched in `next 14.2.25`. Bucket C C11 had pinned exact to `14.2.18` per the literal reviewer text ("Pin to the exact version used in development: 14.2.18") but the reviewer's actual development version was `14.2.35` (resolved from the prior `^14.2.18` caret). The literal pin regressed 9 already-fixed advisories — exactly the kind of self-inflicted version drift the team-qa-critic explicitly blocks on.

**Decision**: Bump exact pin to `14.2.35` (latest 14.x) in both `apps/web/package.json` and `apps/cms/package.json` for both `next` and `eslint-config-next`. Add three `pnpm.overrides` to close transitive devDep CVEs: `postcss >=8.5.10` (XSS), `ws@>=8.0.0 <8.20.1` → `>=8.20.1` (uninitialized memory disclosure), `esbuild@<=0.24.2` → `>=0.25.0` (dev-server CORS).

**Rationale**: 
- Closes 9 Next 14 CVEs without violating SSOT §5 Next 14 lock.
- Closes 3 transitive devDep CVEs that pnpm.overrides can resolve.
- Honors the spirit of the reviewer's C11 recommendation (exact-pin for reproducibility) while correcting the version-number literal error.
- Reduces vulnerability count from 26 → 14, and 1 critical → 0 critical.

**Residual**: 14 Next CVEs remain, all patched only in Next 15.x.y. ADR-0015 was rewritten from v1 (single CVE accepted) to v2 (14 CVEs accepted with applicability assessment per advisory + mitigation control mapping). 5 of the 14 are documented NOT applicable to ROMAS Brief's architecture (App Router only, no i18n, no Pages Router, no `Script strategy="beforeInteractive"`); the other 9 carry named controls assigned to web-engineer + DevOps + architecture-reviewer for M3+ enforcement.

**Alternative considered**: Migrate to Next 15 now. Rejected — Tailwind 4 pairing requirement + App Router cache behaviour change + no live RSC code yet make the migration cost disproportionate to the residual risk after the 14.2.35 bump.

**Verification** (fresh evidence captured in `Docs/qa/test-results.md` build-2026-05-21 qa-pass section):
- `pnpm audit --audit-level=low`: 26 → 14 vulnerabilities (1 critical → 0 critical)
- `pnpm turbo run typecheck`: 5 successful / 5 total (1.375s)
- `pnpm turbo run build --filter=@romas-brief/cron-ingest`: PASS (2.889s, 21.68 KiB / 5.15 KiB gzip)

**Owner**: QA Lead (this cycle). Future /team-build cycles should run `pnpm audit` as a verification step alongside typecheck + build, not defer it to the /team-qa gate. Adding this to the standing /team-build skill discipline would have caught this within the cycle that introduced it.

---

# Cycle build-2026-05-21-m1c (M1-completion) — D-026..D-027

## D-026 — R-114 Auth Helper scaffold deferred per rule 11

**Context**: team-build-critic flagged a P0 phantom-scope claim in `supabase/migrations/0011_rls_policies.sql` header. The header said "`apps/cms/lib/supabase.ts` + server-component-side Auth Helper ... Lands in this cycle as scaffold code" — but the file was never created. The critic gave a binary choice: (a) write the scaffold or (b) amend the comment to "deferred."

**Decision**: Chose (b) — amend the comment to mark the Auth Helper scaffold as deferred to the next cycle. Rationale: CLAUDE.md rule 11 ("Read official sources before implementing") forbids writing third-party SDK integration code without first reading current docs. `@supabase/ssr` has had API churn across versions (server-component vs middleware patterns, cookie helpers), and writing the scaffold without first verifying the current API would be exactly the recall-as-evidence anti-pattern rule 11 exists to prevent.

**Alternative considered**: Write the scaffold against best-guess API. Rejected per rule 11.

**Owner of completion**: next cycle. Estimated work: 30-50 lines of code in `apps/cms/lib/supabase.ts` + `@supabase/ssr` devDep addition + `app/layout.tsx` integration. Per ADR-0015 v2: Auth runs at the Server Component layer, NOT middleware.

---

## D-027 — `source-health` worker folded into `cron-ingest`, dropped from CI matrix

**Context**: Original Worker inventory in `delivery-plan.md` enumerated `workers/source-health` as a separate worker. Audio Architecture v1.0 §9.2 (authored this cycle) says "T-115 / M1 (folded into cron-ingest)" because writing to the `source_health` table is a natural side effect of cron-ingest's per-source fetch loop. team-build-critic flagged the deploy-workers.yml matrix vs Audio Architecture §9.2 drift as P1.

**Decision**: Drop `source-health` from the deploy-workers.yml matrix. Keep Audio Architecture §9.2's folded statement.

**Rationale**: Eliminates doc/workflow drift without losing functionality — source_health table is still written, just by cron-ingest. Reversible if a future cycle needs source-health on a different cadence.

**Alternative considered**: Keep source-health in matrix as a separate worker stub. Rejected — no M2 R-NNN allocates work to a separate source-health worker.

**Owner of completion**: this cycle (immediate edit to deploy-workers.yml).

---

# Cycle build-2026-05-22-m1c-closeout — D-028..D-030

Decisions made during the M1-completion-closeout cycle (Kimal-authorized close of the 4 actionable deferred items from M1-completion handoff).

## D-028 — apps/cms Auth Helper env var convention: SUPABASE_URL (no NEXT_PUBLIC_ prefix)

**Context**: @supabase/ssr official docs (fetched 2026-05-22 via context7 `/supabase/ssr`) use `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` env var convention. The `NEXT_PUBLIC_` prefix exposes a variable to the Next.js client bundle (browser-readable). The current `.env.example` uses unprefixed `SUPABASE_URL` + `SUPABASE_ANON_KEY` — designed for server-side Worker consumption.

**Decision**: Keep the unprefixed convention (`SUPABASE_URL` + `SUPABASE_ANON_KEY`) in the Auth Helper scaffold. Reference them from the server-component factory + route-handler factory via `process.env["SUPABASE_URL"]` etc.

**Rationale**:
- ADR-0015 v2 mandates server-only Auth flows for ROMAS Brief (no Pages Router, no middleware). The anon key never reaches the browser bundle — there is no browser-side sign-in form that needs `NEXT_PUBLIC_*` exposure.
- Sign-in flow is server-rendered form POST → `app/api/auth/sign-in/route.ts` Route Handler that calls `supabase.auth.signInWithPassword({ ... })` server-side; cookies are set in the response.
- Keeping the unprefixed name means apps/cms + Workers share the exact same env-var name (one source of truth in Cloudflare Worker Secrets + Cloudflare Pages env vars).

**Alternative considered**: Add `NEXT_PUBLIC_*` duplicates of the existing names. Rejected — operationally creates two-name drift risk for zero functional benefit at this Auth posture.

**Reversal trigger**: If a future cycle introduces client-side auth UI (browser-side `useUser()` hooks, optimistic UI on auth state), add the `NEXT_PUBLIC_*` duplicates then; both names can coexist. Update this ADR + the scaffold imports.

**Owner**: this cycle. Documented in `apps/cms/lib/supabase/server.ts` header comment + `Docs/SECRETS.md` §2.

---

## D-029 — R-110 deliverable: template only, not executed instrument

**Context**: Kimal /AskUserQuestion 2026-05-22 explicitly chose "Template only — you fill and sign" for R-110 voice consent registry. The actionable interpretation: deliver a fillable scaffold that the audio-producer agent can read for cascade-on-withdrawal behavior, with placeholders for the donor identity + recording session + commercial scope + signatures that Kimal fills offline.

**Decision**: Author `Docs/voice-consent-registry.md` as a v1.0.0-template document. Pre-stage §2 (Kimal/ElevenLabs entry) + §3 (Kimal/PlayHT entry) with all field names present but values marked `# FILL:`. Document the operational checklist (§5) that gates `status: active` flip — 9 items including signed-PDF storage in 1Password "ROMAS legal" vault.

**Rationale**:
- The audio-producer agent (per R-213, M2) reads this file at start-of-pipeline; the cascade behavior on withdrawal must be deterministic. The template structure delivers that operational contract independent of when the legal instrument is executed.
- Executing the legal instrument requires Kimal-only authority (donor + AllienNova signer + optional witness). I cannot fabricate signatures.
- Pre-staging Kimal's two expected entries (ElevenLabs + PlayHT — both his own voice clones per CLAUDE.md §6) means Kimal just fills the per-vendor identifiers + dates + signs, rather than designing the entry from scratch.

**Alternative considered**: Skip the file entirely and surface R-110 as Kimal's authoring track. Rejected — leaving the file absent means the audio-producer agent's R-213 cascade behavior has no concrete reference; the template lands the operational contract.

**Owner of completion**: Kimal fills + signs the executed copies before first audio publish (M2 R-201 prerequisite).

---

## D-030 — SECRETS.md rotation cadences: 90d standard, 30d high-blast-radius

**Context**: SECRETS.md needs an explicit rotation policy. Industry standard for API keys ranges from "never" (bad) to "weekly" (operationally excessive for a 1-person editorial platform). The right cadence trades off rotation operational cost against blast-radius-on-leak.

**Decision**: Two-tier rotation:
- **90 days standard** for: API keys (ElevenLabs, PlayHT, OpenAI, Beehiiv, Resend, DeepL), R2 keys, HMAC webhook secrets, Sentry DSN.
- **30 days high-blast-radius** for: `SUPABASE_SERVICE_ROLE_KEY` (full DB bypass), `CLOUDFLARE_API_TOKEN` (Workers/Pages/Cache deploy authority), `SUPABASE_ACCESS_TOKEN` (CI deploy), `SUPABASE_DB_PASSWORD` (production DB).
- **On-event immediate** for: personnel change, suspected exposure, vendor breach notification, GitHub repo permissions change, Cloudflare account permissions change.

Calendar reminders: quarterly block for 90d secrets (first business day Q1/Q2/Q3/Q4); monthly block for the 4 high-blast secrets (first business day each month). Aligned with the quarterly Cloudflare WAF + Next 14 CVE review per ADR-0015 v2.

**Rationale**:
- 90 days is the most common operationally-sustainable cadence for solo or small-team ops; quarterly is a calendar discipline Kimal can keep.
- 30 days for the 4 high-blast secrets reflects their disproportionate damage potential: a leaked service-role key bypasses every RLS policy + every CHECK constraint at the DB layer.
- "On-event immediate" overrides cadence whenever the specific events fire — never wait for the next scheduled block.

**Alternative considered**: Uniform 90-day cadence for all secrets. Rejected — the service-role key + Cloudflare API token blast radius warrants tighter discipline; the 30-day cost is one calendar event per month vs the cost of an undetected leaked DB key persisting for up to 3 months.

**Owner**: Kimal owns the calendar discipline. 1Password vault "ROMAS legal" maintains per-item audit log of every rotation (current value + previous value + last rotated + next due).
