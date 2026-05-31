---
title: ROMAS Wire — Build Log (M0 cycle-1)
version: 1.0.1
date: 2026-05-14
reconstructed: 2026-05-15 (originals lost to gitignore `build/` swallow; content recovered from conversation history)
milestone: M0 — Doc Reconciliation
cycle: 1 of M0 (3-day window 2026-05-14 → 2026-05-17)
team-build-critic verdict: APPROVE WITH CONDITIONS (see critic-review.md)
---

# ROMAS Wire Build Log — M0 cycle-1

> **Reconstruction note**: The original `build-log.md` was authored 2026-05-14 during /team-build M0 cycle-1 in the parent ROMAS monorepo nested path `D:\dev\projects\ROMAS\ROMAS WIRE\docs\build\build-log.md`. Repo separation on 2026-05-14 (ADR-0014) cloned the working tree to the standalone `D:\dev\projects\romas-brief\`, but the `.gitignore` introduced at separation contained a bare `build/` pattern that silently excluded `docs/build/` from baseline commit `dcc8389`. Old path was emptied between sessions; reconstruction sources content from the active conversation transcript on 2026-05-15. Gitignore fixed in commit `52a162e` with root-anchored `/build/` + `!docs/build/` carve-out.

## Plan — M0 doc reconciliation (build-2026-05-14)

### Scope
- Milestone: M0 (delivery-plan §3.1)
- Tasks closed this cycle: R-001 · R-002 · R-003 · R-004 · R-005 · R-007 · R-014
- QA-critic conditions closed: 2 · 3 · 6a (ADR-0005 rewrite) · 6b (ADR-0012 stub) · 7 (subscribers schema delta) · C-005 (`.env.example`) · C-006 (`/team-design` as M3 predecessor) · C-008 (scrape inspection)
- Requirements affected: FR-014, FR-014A, FR-023, FR-032, FR-033, FR-036 (worldwide regulatory chain), FR-037 (lexicon)

### File-ownership partition

M0 is doc-only; no parallel builder dispatch was needed. All edits authored by team-build Build Lead (synthesis) with cross-reference verification.

| Edit class | Files touched |
|---|---|
| Doc-version bumps | `Docs/ROMAS-Brief-Master-Strategy.md:1-7`, `Docs/ROMAS-Brief-Daily-Production-Runbook.md:6`, `Docs/ROMAS-Brief-500-Article-Launch-Plan.md:1-7` |
| Tagline lock propagation | `Docs/ROMAS-Brief-Master-Strategy.md:7` (header note + SSOT pointer) |
| Banned-source scrub | `Docs/ROMAS-Brief-500-Article-Launch-Plan.md:291` (Sample 5 EU AI Act primary source), `:310` (§7 source health row) |
| Six-rule canonicalization | `Docs/ROMAS-Brief-Master-Strategy.md:203-215` (§6.1) + `Docs/ROMAS-Brief-Daily-Production-Runbook.md:177-185` (§6) |
| Beehiiv/Resend split propagation | `Docs/ROMAS-Brief-Daily-Production-Runbook.md` line 6 (header note) + Beehiiv→"Beehiiv newsletter (transactional is Resend)" wording |
| ROMAS-Wire archive | `Docs/ARCHIVE/ROMAS-Wire-Master-Strategy*.md` (3 files moved) + `Docs/ARCHIVE/RETIRED-DO-NOT-USE.md` (new notice) |
| Source-ingestion canonical promotion | `.claude/skills/source-ingestion.md:1-12` (frontmatter + canonical-status + header note) |
| SSOT version reconcile | `docs/SSOT.md:1-10` (frontmatter v1.0.0 → v1.2.0 + cycles enumeration) |
| ADR-0005 cycle-3 rewrite | `docs/specs/adr/0005-rss-four-tier-feeds.md:17-22, 34-40, 49-53` |
| ADR-0012 placeholder stub | `docs/specs/adr/0012-video-podcast-hosting.md` (new) |
| Schema delta — subscribers | `docs/specs/contracts/supabase-schema.sql:265-285` (region + beehiiv_subscription_id + 4 webhook timestamps + 2 indexes + updated_at trigger) |
| `.env.example` | `.env.example` (new, 16 named env vars + 6 section headers) |
| /team-design predecessor lock | `docs/specs/delivery-plan.md:123` (M3 predecessor section added) |

### Critical path executed

Doc-version bumps → tagline lock → banned-source scrub → 6-rule canonicalization → Wire archive → schema delta → ADR rewrites → `.env.example` → predecessor lock → build artifacts → critic gate

### Approval gate

Kimal approved `/team-build` invocation: "to start M0 (delivery-plan §3.1 doc reconciliation) immediately. The 8 critic conditions are M0 acceptance criteria — they fit inside the 3-day M0 window."

## Execution log (per-task)

| Task / Condition | File(s) | Status | Verification |
|---|---|---|---|
| R-001: Master-Strategy v2.0 → v2.1; tagline lock pointer | Master-Strategy.md:1-7 | DONE | Header verified; SSOT cross-reference added |
| R-002: Runbook v1.0 → v1.1; Beehiiv→Resend/Beehiiv split note | Runbook.md:6 + Beehiiv refs | DONE | Header verified; remaining Beehiiv mentions clarified as newsletter-only |
| R-003: Launch Plan v1.0 → v1.1 | Launch-Plan.md:1-7 | DONE | Header verified |
| R-004: 6-rule canonicalization | Master-Strategy.md:203-215 + Runbook.md:177-185 | DONE | Both files match SSOT §2 wording; 6 rules in both |
| R-005: Archive ROMAS-Wire-*.md (3 files) | Docs/ARCHIVE/ | DONE | Bash mv verified; RETIRED-DO-NOT-USE.md notice authored |
| R-007: Source-ingestion canonical promotion | source-ingestion.md frontmatter | DONE | canonical_status declared; CLAUDE.md §9 instruction resolves |
| R-014: Ban meddeviceguide.com / MDCG.eu as primary | Launch-Plan.md:310 + Sample 5:291 + ema.yaml | DONE | §7 source health row rewritten; Sample 5 link replaced with European Commission primary + fact-check pre-publish flag |
| Critic-2: SSOT version reconcile | SSOT.md:1-10 | DONE | frontmatter v1.0.0 → v1.2.0 + cycles enumeration |
| Critic-3: Sample 5 scrub (= R-014) | Launch-Plan.md:291 | DONE | Primary source now European Commission AI Act page |
| Critic-6a: ADR-0005 cycle-3 rewrite | ADR-0005:17-22, 34-40, 49-53 | DONE | Day-14/30-45 wording replaced with Day-1 all-tier lock + Tier 5 row + supersession note |
| Critic-6b: ADR-0012 placeholder stub | ADR-0012-video-podcast-hosting.md (new) | DONE | Stub with Day-30 author date + 5-vendor comparison table + rubric |
| Critic-7: Subscribers schema delta | supabase-schema.sql:265-285 | DONE | region + beehiiv_subscription_id + 4 webhook timestamps + 2 indexes + updated_at trigger added |
| C-005: `.env.example` (was R-111 M1; pulled forward) | .env.example (new) | DONE | 16 named env vars across 6 sections |
| C-006: `/team-design` as M3 predecessor | delivery-plan.md:123-129 | DONE | Predecessor lock added with sequencing recommendation |
| C-008: "scrape" inspection (cycle-1 yellow) | delivery-plan:64, MASTER:326, test-qa-plan:118 | DONE — all 3 acceptable | All occurrences are quote-of-anti-pattern (target/lint-rule/grep-regex), classified as acceptable per CLAUDE.md anti-pattern rule |

## Deferred to M0 cycle-2 (documented for handoff)

| Item | Why deferred | Owner | ETA |
|---|---|---|---|
| Critic-1: T-NEW1..T-NEW20 renumbering + T-225..T-230 + T-310A..D concrete task rows | Large mechanical edit (~1.5d). Not /team-build-blocker; placeholders tracked in critic-review and qa-report. | Delivery Lead | 2026-05-16 |
| Critic-4: docs/qa/test-coverage.md Tables 1+2 refresh | Architecture-reviewer pass re-run needed; cosmetic. | architecture-reviewer | 2026-05-16 |
| A-NNN catalog expansion (A-009 + A-061..A-075 = 16 new acceptance tests) | Largest single deferred item (~2h). Required pre-M1 for traceability. | QA Lead | 2026-05-16 |
| CLAUDE.md + AGENT.md propagation of Q1/Q2/Q3/Q8/Q9/Q10/Q11 locks | Large structural edits (3 §s + decision log per doc); higher-risk. | doc author | 2026-05-16 |
| `.claude/skills/cms-schema.md` cycle-4 + cycle-6 sync | Skill-vs-canonical drift; not blocking. | cms-engineer | 2026-05-16 |
| `.claude/skills/regulatory-analyst.md` LATAM dispatch + EU fallback | LATAM editorial gates on this; pre-M1 deliverable. | regulatory-analyst | M0 cycle-2 |
| `.claude/skills/editorial-style-guide.md` footer attribution rule | Reader-visible artifact; pre-M3. | editorial-director | M0 cycle-2 |
| Risk register dedup re-tally (C-010 — 88 → ~55) | Cosmetic; current count is over-inclusive of cross-references. | QA Lead | M0 cycle-2 |
| C-007 llm-orchestrator cross-monorepo import verification | Obsoleted by repo separation (ADR-0014); package now lives in ROMAS Wire monorepo. | (closed) | (closed at separation) |

## Self-verification (B10)

Code-empty repo — standard lint / typecheck / test / build commands not applicable.

Doc-level self-verification:

| Check | Status |
|---|---|
| `Docs/ARCHIVE/` exists with 3 files + RETIRED notice | PASS |
| `Master-Strategy.md` header reads v2.1 | PASS |
| `Runbook.md` header reads v1.1 | PASS |
| `Launch-Plan.md` header reads v1.1 | PASS |
| `SSOT.md` frontmatter reads v1.2.0 | PASS |
| ADR-0005 line 17-22 reflects Day-1 all-tier lock | PASS |
| ADR-0012 file exists with placeholder status | PASS |
| `supabase-schema.sql` `subscribers` has `region` + `beehiiv_subscription_id` | PASS |
| `.env.example` exists at repo root | PASS |
| Master-Strategy §6.1 = 6 rules matching SSOT §2 | PASS |
| Runbook §6 = 6 rules matching SSOT §2 | PASS |
| `meddeviceguide.com` grep — only intentional bans + ARCHIVE refs | PASS |
| `delivery-plan.md` §3.4 has `/team-design` predecessor lock | PASS |
| `source-ingestion.md` frontmatter has `canonical_status` field | PASS |

## M0 cycle-2 close additions (2026-05-15)

| Item | File | Verification |
|---|---|---|
| P0 Migration 0009 trigger-ordering fix | `Docs/specs/contracts/supabase-schema.sql:300-310` | `set_updated_at()` function definition hoisted to before first `create trigger` call; pgTAP test pending M1 |
| P0 AllienNova casing patch | `Docs/SSOT.md:69` + `Docs/specs/adr/0014-repository-separation.md` (3 instances) | SSOT row 19 + ADR-0014 now read `AllienNova/romas-brief` matching live GitHub org |
| P0 build artifact reconstruction | `docs/build/{build-log,handoff-notes,decision-log,critic-review}.md` | This file + 3 siblings authored from conversation history |
| P0 gitignore fix | `.gitignore` | `/build/` root-anchored + `!docs/build/` carve-out (commit `52a162e`) |

---

# ROMAS Wire Build Log — cycle build-2026-05-21 (review-remediation)

## Plan — build-2026-05-21

### Scope

Remediate the 17 items surfaced by `/team-review` (3 parallel reviewers — security, architecture, code-quality — on the T-101 monorepo scaffold + migrations 0001-0005). Reviewer convergence: 3 findings flagged by 2+ agents. The synthesis ranked 4 HIGH / 11 MEDIUM / 12 LOW / 0 CRITICAL.

### Input artifacts (all read at B1)

- `Docs/SSOT.md` (v1.2.0)
- `Docs/specs/architecture.md`, `Docs/specs/product-spec.md`, `Docs/specs/delivery-plan.md`, `Docs/specs/remediation-plan.md`
- `Docs/specs/contracts/supabase-schema.sql` (canonical schema — primary source of truth)
- `Docs/specs/adr/0001..0014` (existing ADR ledger)
- `Docs/build/build-log.md` + `decision-log.md` (prior M0 cycle-1 + cycle-2 records)
- `supabase/migrations/0001..0005` + `supabase/seed.sql`
- All Bucket C target files (root configs, app + worker manifests, packages/config + packages/ui)

### Reviewer recommendation re-classification (B2 — done at plan gate)

The three reviewers worked from migration text only. The migrations cite `Docs/specs/contracts/supabase-schema.sql` as the canonical contract — verified in B1. Re-classifying the 17 reviewer recommendations against the contract surfaced a critical insight:

- 3 of the 4 "HIGH" reviewer recommendations (loudness widen, embargo CHECK, URL format CHECK) were **contract amendments** — not migration bugs. The migrations conform to the canonical contract; the contract specifies the prior values. Adopting the recommendation required amending the contract first.
- Items not in the contract (e.g., `body_md` length cap, `audio_jobs (article_id, audio_tier)` unique index, `articles.publish_at` partial index) are contract extensions — additive amendments.
- Scaffold/config items (Bucket C) don't touch the canonical schema at all.

Kimal adjudication at the B3 approval gate (2026-05-21): **"Adopt all 13 verbatim from the reviewer"** — including the loudness band widen with explicit acknowledgement that it overrides the inviolable-rule-6 lock in SSOT/contract and requires an ADR. Seed PII (`president@aliennova.com`) left as-is per Kimal's separate sub-decision. Stay on `main` (no worktree).

### File-ownership partition

Single-Build-Lead (no parallel persona dispatch) — this cycle is config + SQL only; no UI, no contract surface for new endpoints, no test pyramid changes. The skill's 10-persona collective is unnecessary scaffolding for this scope; the Build Savage gate still runs.

| Edit class | Files |
|---|---|
| **Bucket C — Scaffold & config (13 items)** | `.npmrc`, `package.json` (root), `turbo.json`, `apps/web/package.json`, `apps/cms/package.json`, `apps/web/tailwind.config.ts`, `apps/cms/tailwind.config.ts`, `packages/config/package.json`, `packages/config/src/index.ts`, `packages/config/src/tailwind.ts` (new), `workers/cron-ingest/tsconfig.json`, `workers/cron-ingest/wrangler.toml`, `workers/cron-ingest/src/index.ts`, `supabase/seed.sql`, `Docs/specs/adr/0015-next-14-cve-accepted-risk.md` (new) |
| **Bucket A — Schema & contract (Kimal adopt-all-13)** | `Docs/specs/contracts/supabase-schema.sql` (canonical), `supabase/migrations/0001..0005` (lockstep), `Docs/specs/adr/0016-loudness-band-widen.md` (new), `Docs/specs/adr/0017-audio-jobs-tier-rename.md` (new) |
| **Bucket A propagation — forward-looking spec corpus** | `Docs/SSOT.md`, `Docs/ROMAS-Brief-Master-Strategy.md`, `Docs/ROMAS-Brief-Daily-Production-Runbook.md`, `Docs/MASTER_IMPLEMENTATION_PLAN.md`, `Docs/specs/product-spec.md`, `Docs/specs/delivery-plan.md`, `Docs/specs/test-qa-plan.md`, `Docs/specs/remediation-plan.md`, `Docs/specs/smoke-test-report.md`, `Docs/specs/adr/0005-rss-four-tier-feeds.md`, `Docs/specs/adr/0006-audio-qa-state-machine.md`, `Docs/qa/requirements-trace.md`, `Docs/qa/performance-report.md`, `Docs/build/LAUNCH_ARC_PLAN.md`, `Docs/design/wireframes.md`, `Docs/design/user-flows.md`, `AGENT.md`, `.claude/skills/cms-schema.md`, `.claude/skills/audio-production-pipeline.md`, `.claude/skills/audio-qa-checklist.md`, `.claude/agents/audio-producer.md`, `.claude/agents/audio-qa-reviewer.md`, `.claude/agents/cms-engineer.md` |

**Deliberately NOT touched** (frozen historical record per ANCP §9 discipline): `Docs/specs/critic-review.md` (cycle-1 record), `Docs/specs/research-notes.md`, `.claude/agent-memory/code-reviewer/project_context.md` (regenerable).

### Critical path executed

Bucket C → Bucket A contract → Bucket A migrations → Bucket A ADRs → Bucket A spec propagation → R-105 extension in remediation-plan → verification → critic gate → handoff.

### Approval gate

Kimal `/team-build` approval gate (2026-05-21 via /AskUserQuestion):

| Question | Answer |
|---|---|
| A-bucket path | Adopt all 13 verbatim from the reviewer (including loudness widen overriding inviolable-rule-6 lock) |
| C-bucket path | Run all 13 as a single batch |
| Seed PII (A13) | Leave as-is — Kimal authored, repo is private |
| Worktree | Stay on `main` |

## Execution log — build-2026-05-21

### Bucket C (B5-B8: scaffold + config)

| # | Item | Files touched | Verification |
|---|---|---|---|
| C1 | `@romas-brief/ui` declared in apps' devDeps | `apps/web/package.json:22-23`, `apps/cms/package.json:22-23` | `pnpm install` resolves; typecheck PASS |
| C2 | Tailwind shared base hoisted | `packages/config/src/tailwind.ts` (new), `packages/config/package.json:9-12, 19-23` (added `./tailwind` export + `tailwindcss@3.4.15` dep), `packages/config/src/index.ts:9` (re-exports `baseTailwindConfig`), `apps/web/tailwind.config.ts`, `apps/cms/tailwind.config.ts` | typecheck PASS |
| C3 | Broken `./tsconfig-base.json` re-export removed from `packages/config` | `packages/config/package.json:9-12`, `packages/config/src/index.ts:1-9` | typecheck PASS |
| C4 | `verbatimModuleSyntax: false` removed from cron-ingest tsconfig | `workers/cron-ingest/tsconfig.json:8-11` | typecheck PASS — confirms reviewer's claim that base setting is fine for Wrangler 3 + esbuild |
| C5 | Turbo lint independent + test depends on typecheck | `turbo.json:21-30` | Lint pipeline now per-workspace |
| C6 | `.npmrc` save-exact | `.npmrc:6` (was `save-prefix=^`) | New `pnpm add` will record exact versions |
| C7 | pnpm.overrides for undici + glob | `package.json:25-30` | `pnpm why undici` → 8.3.0 (was 5.29.0); `pnpm why glob` → 13.0.6 (was 10.3.10). CVE GHSA-vrm6-* + GHSA-h25m-26qc-wcjf + GHSA-5j98-mcp5-4vw2 closed |
| C8 | wrangler.toml SUPABASE_URL comment hardened | `workers/cron-ingest/wrangler.toml:10-15` | Comment now explicitly negative: "NEVER put service-role key in [vars]; use Worker Secrets only" |
| C9 | T-115 auth-gate TODO on fetch handler | `workers/cron-ingest/src/index.ts:23-26` | Stub now carries the auth requirement for the T-115 author |
| C10 | DROPPED — `compatibility_date = 2026-05-01` is in the past relative to today (2026-05-21); reviewer's "future-dated" claim was based on stale date assumption | — | No change |
| C11 | `next` + `eslint-config-next` pinned exact | `apps/web/package.json:17,28`, `apps/cms/package.json:17,28` | Lockfile records `14.2.18` exactly |
| C12 | `supabase/seed.sql` header doc-drift fix | `supabase/seed.sql:3-4` | `0001..0011` → `0001..0010 (M1 target; 0001..0005 today)` |
| C13 | ADR-0015 — Next 14 GHSA-h25m-26qc-wcjf accepted CVE | `Docs/specs/adr/0015-next-14-cve-accepted-risk.md` (new) | ADR with named controls (RSC input audit, body cap, edge rate-limit, quarterly review) + closing conditions |

### Bucket A (B4: schema + contract amendments)

All 13 reviewer recommendations adopted per Kimal authorization. Each is mirrored across the canonical contract + the affected migration + relevant ADR(s).

| # | Item | Contract change | Migration change | Other propagation |
|---|---|---|---|---|
| A1 | Loudness widen `[-17,-15]` → `[-18,-14]` LUFS | `Docs/specs/contracts/supabase-schema.sql:175-188` | `supabase/migrations/0002_create_audio_jobs.sql:58-95` | D-012; ADR-0016 (new), SSOT §3 row 12 + §7 rule 6, Master-Strategy §6.1 rule 6, Runbook §6 rule 6, MIP §C.2 step 3, product-spec FR-008+FR-009, delivery-plan T-209, test-qa-plan A-024, remediation-plan R-202, ADR-0006 (constraint + 2 prose), wireframes line 696+730, user-flows line 232+247, LAUNCH_ARC_PLAN M2 row, smoke-test-report L45, requirements-trace FR-008+FR-009, cms-schema.md (skill), audio-production-pipeline.md (skill), audio-qa-checklist.md C1 (line 58), audio-producer.md, audio-qa-reviewer.md, cms-engineer.md, AGENT.md §12 |
| A2 | Embargo release-pair CHECK | `Docs/specs/contracts/supabase-schema.sql:213-225` | `supabase/migrations/0005_create_embargo_hold.sql:39-55` | D-013; R-105 extension for pgTAP |
| A3 | URL format CHECKs on `primary_source_url`, `feed_url`, `api_endpoint`, `claims.source_url` | `supabase-schema.sql:75-77, 117, 184-186` | `0001:121-126`, `0003:23-30`, `0004:30-34` | D-014; R-105 extension |
| A4 | `body_md` + `script_md` length cap (200 KB) | `supabase-schema.sql:48, 153-156` | `0001:84-92`, `0002:65-67` | D-015; R-105 extension |
| A5 | `word_count` trim() fix | `supabase-schema.sql:49` | `0001:84-92` | D-016 |
| A6 | `audio_jobs (article_id, audio_tier)` unique | `supabase-schema.sql:199-200` | `0002:120-122` | D-017; R-105 extension |
| A7 | `articles.publish_at` partial index | `supabase-schema.sql:95-97` | `0001:154-157` | D-018 |
| A8 | `sources_active_idx` replaced with partial on `last_fetched_at` | `supabase-schema.sql:192-196` | `0003:32-37` | D-019 |
| A9 | `articles_published_requires_author` CHECK | `supabase-schema.sql:90-93` | `0001:132-137` | D-020 (A9+A10 grouped); R-105 extension |
| A10 | `qa_reviewers.email = lower(email)` CHECK | `supabase-schema.sql:11` | `0001:35-39` | D-020 (A9+A10 grouped); R-105 extension |
| A11 | `audio_jobs.tier` → `audio_jobs.audio_tier` rename | `supabase-schema.sql:136-141` (column + CHECK + index column refs) | `0002:32-37, 116-119` | D-021; ADR-0017 (new); ADR-0005 RSS table + paragraph; test-qa-plan A-056; performance-report NFR-006; `.claude/skills/cms-schema.md` lines 98 + 141 |
| A12 | `claims.confidence` type `numeric(3,2)` → `numeric(4,3)` | `supabase-schema.sql:125` | `0004:38-41` | D-022 |
| A13 | Seed PII | NONE — Kimal authored, repo private, deliberate keep | NONE | D-023 (decision to keep) |

### Self-verification (B10) — evidence-first

```
$ pnpm install
Scope: all 6 workspace projects
Packages: +6 -2
Done in 1.5s            # PASS

$ pnpm turbo run typecheck
Tasks:    5 successful, 5 total
Cached:    1 cached, 5 total
Time:    1.787s          # PASS — all 5 workspaces (web, cms, config, ui, cron-ingest) typecheck green

$ pnpm turbo run build --filter=@romas-brief/cron-ingest
Tasks:    1 successful, 1 total
Time:    2.419s
Total Upload: 21.68 KiB / gzip: 5.15 KiB    # PASS — worker build clean

$ pnpm why undici | grep undici
└── undici 8.3.0                            # PASS — was 5.29.0; override applied

$ pnpm why glob | grep glob
└── glob 13.0.6                             # PASS — was 10.3.10; override applied
```

Notes:
- Typecheck initially failed on `packages/config/src/tailwind.ts` — Cannot find module 'tailwindcss'. Diagnosed: under `node-linker=isolated`, the `packages/config` workspace needs its own `tailwindcss` devDep to type-import. Fix: added `"tailwindcss": "3.4.15"` to `packages/config/package.json` (exact, matching apps). Re-ran install + typecheck → PASS. This is documented as a real diagnostic, not a weasel "should pass."
- App `next build` deliberately NOT run locally (Next 14 + Node 24 + Windows prerender bug per SCAFFOLD-NOTES.md L51-57; passes on CI Node 20 Linux). Test pyramid is empty in this scaffold (T-117 work).
- pgTAP tests for new CHECK constraints are deferred to R-105 owner per remediation-plan amendment in this cycle (cms-engineer; A-114..A-119 + new A-NNN to be allocated).

### Deferred items (handoff to next cycles)

- **pgTAP for the build-2026-05-21 additions** (R-105 extension): owned by cms-engineer; lands when R-105 runs.
- **CI pre-push guard requiring `0011_rls_policies.sql` before `supabase db push --linked`**: owned by R-106/T-117 (CI workflow author).
- **`Docs/ROMAS-Brief-Audio-Architecture.md v1.0`** to make ADR-0016 numerics canonical at a top-level doc: owned by R-006-A (still M1).
- **Quarterly Cloudflare WAF + Next 14.x CVE review** (per ADR-0015): release-manager checklist.

### Acceptance verdict (pending team-build-critic)

Self-verification PASS. Awaiting B11 critic gate.

---

# ROMAS Wire Build Log — cycle build-2026-05-21-m1c (M1-completion)

## Plan — build-2026-05-21-m1c

### Scope

Close the M1 milestone gaps surfaced by the prior cycle's /team-qa handoff. Kimal-authorized "Full /team-build M1-completion (R-104 + R-105 + R-106 + R-006-A + R-114 RLS)" via /AskUserQuestion 2026-05-21.

### Inputs (B1-B2 orient)

- `Docs/specs/contracts/supabase-schema.sql` (canonical; lines 263-368 cover 0006-0011 source)
- `Docs/specs/remediation-plan.md` R-104..R-114 M1 row enumeration
- `Docs/build/LAUNCH_ARC_PLAN.md` dispatch row 3 (/team-build M1)
- `Docs/build/build-log.md` + `decision-log.md` cycle build-2026-05-21 priors
- `Docs/specs/adr/0015-next-14-cve-accepted-risk.md` v2 (informs apps/cms Auth Helper constraint — no Pages Router, no middleware)
- `Docs/specs/adr/0016-loudness-band-widen.md` (informs Audio Architecture v1.0 §3.3 layered defense)
- `Docs/specs/adr/0017-audio-jobs-tier-rename.md` (informs Audio Architecture v1.0 tier table)
- `.claude/skills/audio-production-pipeline.md` + `.claude/skills/audio-qa-checklist.md` + `.claude/skills/pronunciation-lexicon.md` (source content for Audio Architecture v1.0)

### File-ownership partition

Single Build Lead (no parallel persona dispatch — the scope is config + SQL + docs + workflows; no UI; no contract surface for new endpoints). Build Lead embodies cms-engineer (migrations + pgTAP + RLS) + DevOps (CI workflows) + audio-producer (Audio Architecture doc).

| Edit class | Files |
|---|---|
| **R-104 completion — 5 new migrations** | `supabase/migrations/0006_create_lexicon.sql` (T-108), `0007_create_revocations.sql` (T-109), `0008_create_subscribers.sql` (T-110), `0009_create_set_updated_at.sql` (T-111, M0c2 P0 hoist fix), `0010_create_source_health.sql` (T-112) |
| **R-104 + R-114 migration — RLS** | `supabase/migrations/0011_rls_policies.sql` (T-113 + R-114 partial-close) |
| **R-105 — pgTAP test suite** | `supabase/tests/inviolable_rules.sql` (18 assertions), `bucket_a_constraints.sql` (13), `enums_and_lengths.sql` (13), `indexes.sql` (13), `rls_and_triggers.sql` (22) — total **79 assertions across 5 files** |
| **R-106 — GitHub Actions** | `.github/workflows/ci.yml` (lint + typecheck + worker build + audit informational per D-025), `deploy-pages.yml` (Cloudflare Pages on main), `deploy-workers.yml` (Wrangler matrix), `deploy-migrations.yml` (supabase db push + pgTAP, with 0011 pre-push guard) |
| **R-006-A — Audio Architecture v1.0** | `Docs/ROMAS-Brief-Audio-Architecture.md` (~390 lines; canonical sibling to Master-Strategy + Runbook + Launch-Plan) |

**Deliberately deferred** to next cycle:
- `apps/cms/lib/supabase.ts` Auth Helper scaffold — needs verified-current `@supabase/ssr` API per rule 11; not safe to write without reading official docs.
- Live Supabase project provisioning (R-114 wiring) — your operation.
- R-005 Design Spec v1.1 top-level doc (design-system-keeper + Kimal authoring).
- R-110 Voice consent registry (Kimal legal track).
- R-112 SECRETS.md (DevOps + Kimal).

### Approval gate

Kimal /AskUserQuestion 2026-05-21 ("Which scope do you want to pick up next?") → "Full /team-build M1-completion (R-104 + R-105 + R-106 + R-006-A + R-114 RLS)". Defaults locked: CI = ubuntu-latest + Node 20 + pnpm 9.0.0; D-025 audit gate informational; deploy workflows with skeleton secret references; Auth Helper deferred per rule 11.

## Execution log — build-2026-05-21-m1c

### B4 — Migrations 0006-0011 (R-104 + R-104+R-114)

All 6 migrations transcribed verbatim from canonical contract `supabase-schema.sql` with added T-NNN anchors + M0c2 hoist provenance comments. Lockstep verified by team-build-critic.

| # | File | Source contract lines | Notes |
|---|---|---|---|
| 0006 | `0006_create_lexicon.sql` | 263-289 | lexicon (8-type enum) + lexicon_proposals (3-status enum). 30-entry seed deferred to M2 T-201 |
| 0007 | `0007_create_revocations.sql` | 295-306 | revocations audit log; cdn_purge_at populated only on confirmed 2xx; rss_regenerated_at populated post-feed-rewrite |
| 0008 | `0008_create_subscribers.sql` | 311-333 | Beehiiv-canonical subscribers + region default 'americas' (D-002) + 3 indexes (active partial / region partial / beehiiv_subscription_id partial). Trigger attachment deferred to 0009 per M0c2 P0 hoist fix |
| 0009 | `0009_create_set_updated_at.sql` | 335-352 | set_updated_at() function definition + subscribers trigger attachment + subscriber_count view. M0c2 P0 fix preserved: function MUST be defined before any trigger that references it |
| 0010 | `0010_create_source_health.sql` | 226-235 | source_health time-series; composite (source_id, fetched_at desc) index for hot-path query |
| 0011 | `0011_rls_policies.sql` | 320-368 | RLS enable on 11 tables + 5 named policies (public_read_published, editor_read_all, editor_publish, audio_qa_flip, embargo_read_restricted) + articles + audio_jobs set_updated_at trigger attachments. R-114 wiring partial-close (Auth Helper scaffold deferred per critic P0 close + rule 11) |

### B5 — pgTAP suite (R-105)

5 test files under `supabase/tests/` with 79 total assertions covering every R-105-enumerated CHECK target plus the build-2026-05-21 8-new + cycle-1 P2-05 carry items.

| File | Plan() | Coverage |
|---|---|---|
| `inviolable_rules.sql` | 18 | 6 inviolable rules (rule 1 URL scheme + length, rule 2 embargo consistency, rule 3 insight labeling, rule 6 five-condition publish gate at -13.5/-19/-0.5/null-transcript boundaries + ADR-0016 happy path, rule 4 ADR-0013, A9 published-author) |
| `bucket_a_constraints.sql` | 13 | A2 (embargo release-pair), A3 (URL schemes on claims + sources feed_url + api_endpoint, plus SSRF guard against `file://`), A4 (body_md 200KB cap + audio_jobs.script_md cap), A5 (word_count trim()), A6 (article_id+audio_tier unique), A10 (email lower), A12 (claims.confidence range) |
| `enums_and_lengths.sql` | 13 | cycle-1 P2-05 carry — articles.title<=90, archetype/tier/status/category/content_type/source_language/translation_provider enums, qa_reviewers.role enum, audio_jobs.audio_tier enum (ADR-0017), audio_status enum, voice_engine_used enum, claims.confidence numeric(4,3) round-trip |
| `indexes.sql` | 13 | All 13 named indexes verified via `has_index()` — A7 publish_at partial, A6 article_tier_uniq, A8 sources active+last_fetched partial, plus core indexes |
| `rls_and_triggers.sql` | 22 | RLS enabled on 11 tables + 3 `policies_are()` assertions (articles 3 policies, audio_jobs 1, embargo_holds 1) + set_updated_at function exists + 3 trigger attachments (subscribers from 0009; articles + audio_jobs from 0011) + updated_at refresh actually fires on UPDATE + subscriber_count view exists + D-002 region default verified + beehiiv_subscription_id uniqueness |

R-105 acceptance per remediation-plan.md:47 extension list: **every named target has at least one corresponding pgTAP assertion** (verified by team-build-critic).

### B6 — GitHub Actions workflows (R-106)

4 workflows under `.github/workflows/`:

| Workflow | Trigger | Notes |
|---|---|---|
| `ci.yml` | push to main + PR | Concurrency cancel-in-progress. Steps: install (frozen lockfile) → lint → typecheck → worker build → test (turbo) → **D-025 systemic correction: `pnpm audit --audit-level=high` as continue-on-error informational gate** → no-stub guard (grep filter excludes only the T-115 placeholder TODO from Bucket C C9). |
| `deploy-pages.yml` | push to main + workflow_dispatch | Cloudflare Pages deploys for apps/web (reader) + apps/cms (Access-gated). Skeleton secret refs: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `PAGES_PROJECT_WEB`, `PAGES_PROJECT_CMS`. |
| `deploy-workers.yml` | push to main + workflow_dispatch | Matrix over workers/ subdirs; `if [ -f wrangler.toml ]` gate skips stub workers. source-health correctly omitted (folded into cron-ingest per Audio Architecture §9.2). Per-worker timeouts. |
| `deploy-migrations.yml` | push to main + workflow_dispatch | **Pre-push guard: fails if `supabase/migrations/0011_rls_policies.sql` missing** (systemic correction recommended by prior /team-qa cycle). Runs `supabase db push --linked` then `supabase test db --linked` for pgTAP. |

All secrets parameterized via `${{ secrets.NAME }}` — zero hardcoded values. Reproducibility pins: `actions/checkout@v4`, `pnpm/action-setup@v4` (version 9.0.0), `actions/setup-node@v4` with `cache: pnpm` + `node-version-file: .nvmrc`.

### B7 — Audio Architecture v1.0 (R-006-A)

`Docs/ROMAS-Brief-Audio-Architecture.md` v1.0 written as canonical sibling to Master-Strategy + Runbook + Launch-Plan. ~390 lines. Section structure:

- §0 Purpose + authority chain
- §1 Tier overview (5 tiers; archetype → length mapping)
- §2 Voice strategy (ElevenLabs + PlayHT + consent + lexicon)
- §3 Production pipeline (10-beat script + pre/post-roll + ADR-0016 3-layer loudness defense + Whisper transcript + R2 storage)
- §4 Quality gate (5-condition CHECK + state machine + reviewer form)
- §5 RSS distribution (4 feeds + Tier 5 placeholder; audio_tier filter per ADR-0017)
- §6 Revoke kill switch (60s SLA + audit trail)
- §7 Embargo handling (release-pair atomicity per A2)
- §8 Lexicon discipline (30 entry seed + proposals workflow)
- §9 Operational reference (env vars + worker inventory + agent inventory)
- §10 Decision lineage (7 ADRs)
- §11 Revision history

Closes R-006-A (the CLAUDE.md §6 reference target that was previously dangling).

### Self-verification (B8) — evidence-first

```
$ pnpm install
Done in <1s (lockfile up to date)

$ pnpm turbo run typecheck
Tasks: 5 successful, 5 total
Cached: 3 cached, 5 total
Time: 1.039s

$ pnpm turbo run build --filter=@romas-brief/cron-ingest
Tasks: 1 successful, 1 total
Cached: 1 cached, 1 total
Time: 36ms (cached)

$ pnpm audit --audit-level=low | tail -2
14 vulnerabilities found
Severity: 2 low | 7 moderate | 5 high
(matches ADR-0015 v2 inventory exactly; 0 critical preserved from D-025 intervention)

$ python -c "import yaml; yaml.safe_load(open(f))" for each workflow file
All 4 YAML files: OK

$ supabase --version
2.90.0 (Supabase CLI available locally; live db apply deferred to user-provisioned remote project)
```

### B9 — team-build-critic gate

**Verdict: APPROVE WITH CONDITIONS** on cycle 1.

P0 closed in-cycle: 0011 header phantom-scope claim about `apps/cms/lib/supabase.ts` amended to "deferred to next cycle" per rule 11 (read official `@supabase/ssr` docs before implementing). Critic gave the choice of (a) write the scaffold or (b) amend the comment; chose (b) for rule-11 hygiene.

P1 closed in-cycle: deploy-workers.yml `source-health` matrix entry dropped (folded into cron-ingest per Audio Architecture v1.0 §9.2).

P1 acknowledged (deferred): workers matrix dispatching 6 ubuntu runners that no-op until M2 wrangler.toml lands — accepted M1 hygiene cost; M2 should consolidate via matrix exclude or dynamic list.

P1 acknowledged (deferred): pgTAP updated_at trigger assertion could capture-old-then-compare; current assertion is "row changed within 1 minute" which is functionally correct but weaker than ideal.

P2 deferred: ci.yml turbo test coverage gating (lands when M2 adds Vitest), cloudflare/pages-action@v1 SHA pinning, inviolable_rules.sql test-order hardening, agent-files declaring context-doc deps — all cosmetic.

### Verdict downgrade

`APPROVE WITH CONDITIONS` → `APPROVE` after P0 close.

---

# ROMAS Wire Build Log — cycle build-2026-05-22-m1c-closeout

## Plan — build-2026-05-22-m1c-closeout

### Scope

Close the 4 actionable M1 deferred items from the M1-completion handoff: **R-114** Auth Helper scaffold (deferred per rule 11 in prior cycle; now picked up after @supabase/ssr docs fetch); **R-005** canonical Design Spec v1.1 top-level doc; **R-110** voice consent registry TEMPLATE for Kimal to fill + sign; **R-112** SECRETS.md rotation runbook. Kimal-authorized "All 4 actionable (R-114 + R-005 + R-110 + R-112)" + "Template only — you fill and sign" for R-110 via /AskUserQuestion 2026-05-22.

### Inputs (B1-B2 orient)

- @supabase/ssr official docs (fetched via context7 `/supabase/ssr` 2026-05-22) — rule 11 compliance for R-114
- `Docs/design/*` (12 wireframes + 8 components + tokens.json v1.2 + a11y-audit + brand-application + IA + ui-spec + interaction-patterns + copy + ux-principles + user-flows) — synthesis source for R-005
- `Docs/ROMAS-Brief-Audio-Architecture.md` v1.0 + ADR-0004 + ADR-0006 + ADR-0016 — anchor docs for R-005 + R-110
- `.env.example` — secret-name manifest source for R-112
- `Docs/specs/contracts/*.yaml` — per-vendor contract definitions for R-112 secret inventory
- `Docs/build/handoff-notes.md` (M1-completion handoff) — task list

### File-ownership partition

Single Build Lead (rule 11 docs-fetch + 3 small TypeScript files + 3 long docs; no parallel persona dispatch needed for this scope).

| Edit class | Files |
|---|---|
| **R-114 dependencies** | `apps/cms/package.json` (adds `@supabase/ssr@0.10.3` + `@supabase/supabase-js@2.106.1`) + `pnpm-lock.yaml` (auto-updated) |
| **R-114 Auth Helper scaffold** | `apps/cms/lib/supabase/server.ts` (Server Component factory; `getAll`-only adapter), `apps/cms/lib/supabase/route.ts` (Route Handler factory; `getAll` + `setAll`), `apps/cms/lib/supabase/types.ts` (placeholder `Database` type until `supabase gen types typescript` runs against the live project) |
| **R-005** | `Docs/ROMAS-Brief-Design-Specification.md` v1.1 (~380 lines; canonical sibling to Master-Strategy + Runbook + Launch-Plan + Audio-Architecture) |
| **R-110** | `Docs/voice-consent-registry.md` v1.0.0-template (~180 lines; fillable template with §2 Kimal/ElevenLabs + §3 Kimal/PlayHT pre-staged entries) |
| **R-112** | `SECRETS.md` v1.0.0 (~260 lines; 27-secret inventory + 4 stores + 90d/30d rotation cadences + 1Password runbook + breach response 1-2-3) |
| **Build artifacts** | This file + `Docs/build/decision-log.md` (D-028..D-030) + `Docs/build/handoff-notes.md` (closeout addendum) |

### Approval gate

Kimal /AskUserQuestion 2026-05-22: "All 4 actionable (R-114 + R-005 + R-110 + R-112)" + "Template only — you fill and sign" for R-110. Defaults locked: server-component-side Auth Helper (no middleware per ADR-0015 v2); SUPABASE_URL + SUPABASE_ANON_KEY (no NEXT_PUBLIC_* prefix because Auth flows are fully server-rendered); Design Spec authored as synthesis with pointers, not duplication; voice consent template with §2 Kimal/ElevenLabs + §3 Kimal/PlayHT pre-staged but values blank for Kimal to fill.

## Execution log — build-2026-05-22-m1c-closeout

### B-Rule11 — @supabase/ssr docs fetch (prerequisite for R-114)

Used `mcp__context7__resolve-library-id` to locate `/supabase/ssr` (High reputation, 152 snippets, benchmark 83.1), then `mcp__context7__query-docs` for "Next.js 14 App Router server component createServerClient with cookies adapter." Key facts extracted:

- **Package name**: `@supabase/ssr`
- **Peer dependency**: `@supabase/supabase-js@^2.105.4`
- **Env vars convention** (docs): `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (browser-readable; needed if client-side hydration in use)
- **Our convention** (D-028 below): `SUPABASE_URL` + `SUPABASE_ANON_KEY` without `NEXT_PUBLIC_` prefix because ROMAS Wire Auth flows are fully server-rendered per ADR-0015 v2 (no Pages Router, no middleware) — the anon key never reaches the browser bundle
- **Server Component pattern**: `cookies()` from `next/headers` (Next 14 sync; Next 15+ async), `getAll`-only adapter (cookies cannot be set from Server Components in Next 14)
- **Route Handler pattern**: `getAll` + `setAll` both required (route handlers can write cookies)
- **Auth flow** (forced by `createServerClient`): PKCE, `autoRefreshToken: false`, `persistSession: true`, `detectSessionInUrl: false`

### B-R114 — Auth Helper scaffold

| File | Lines | Verification |
|---|---|---|
| `apps/cms/lib/supabase/server.ts` | 56 | createServerClient with `getAll`-only adapter; throws if env vars missing; cites context7-fetched docs source in header; typecheck PASS |
| `apps/cms/lib/supabase/route.ts` | 54 | createServerClient with full `getAll + setAll` adapter; same env-var validation; typecheck PASS |
| `apps/cms/lib/supabase/types.ts` | 25 | Placeholder `Database` type matching `supabase gen types typescript` output shape; will be overwritten when live project is provisioned |
| `apps/cms/package.json` | +2 dependencies | `@supabase/ssr@0.10.3` + `@supabase/supabase-js@2.106.1` exact-pinned per .npmrc save-exact |

ADR-0015 v2 compliance: no middleware variant authored. The Auth Helper runs ONLY at the Server Component layer or Route Handler layer — both inside the Next 14 `app/` directory, neither inside a `pages/` directory (which doesn't exist), and never as edge middleware. This sidesteps the GHSA-f82v-jwr5-mffw closed-CVE class by construction.

### B-R005 — Design Specification v1.1

Authored as **synthesis with pointers**, not duplication. The detailed per-surface content stays canonical in `Docs/design/*` and `.claude/skills/{design-tokens,component-library}`; this top-level doc is the indexing surface that an agent or operator loads to know "where everything is" without re-reading every per-component file. ~380 lines covering 15 sections: brand identity → visual design system → component library → wireframes → IA → interaction patterns → UX copy → a11y → UX principles → user flows → brand application → asset manifest → governance → decision lineage → revision history. Token v1.2 contrast fixes from M0c2 design-QA cycle referenced verbatim.

Surface count covered: 12 routes (homepage / issue / article / friday-read / listen / regions×8 / categories×11 / for×5 / sponsor / about / subscribe / cms-audio-qa) + 8 components (ArticleHeader / AudioPlayer A+B / AudioStatusBadge / IssueHeader / ListenPage / ROMASRead / SponsorBlock / SubscriberCount) + 7 design-system-keeper PR-block rules + 6 UX principles + WCAG 2.2 AA gates (axe + Lighthouse + reduced-motion + 200% zoom + +30% string length).

### B-R110 — Voice consent registry template

~180 lines. Structure: §0 purpose + audio-producer cascade behavior · §1 entry template (YAML schema) · §2 Kimal/ElevenLabs entry pre-staged · §3 Kimal/PlayHT entry pre-staged · §4 future donor entries pattern · §5 operational checklist (9-item gate before flipping status to active) · §6 cross-references · §7 revision history.

Template fillable fields per entry: vendor + voice_id + env_var_name + status + status_updated + donor (legal name + role + contacts) + recording (session date + location + minutes + R2 storage) + commercial_use_scope (duration + geographic + tier_scope + revenue_share + attribution) + withdrawal_procedure (notice + method + 5-step cascade) + fallback_voice_id + signatures (donor + AllienNova + optional witness + 1Password storage path).

D-029 documents the decision to deliver a template (not the executed instrument). Kimal fills + signs the executed copy in 1Password vault "ROMAS legal" before first audio publish per the operational checklist in §5.

### B-R112 — SECRETS.md

~260 lines. Structure: §0 purpose + git hygiene · §1 4-store map (Cloudflare Worker Secrets + GitHub Actions Secrets + Cloudflare Pages env vars + 1Password legal vault) · §2 27-secret inventory table · §3 rotation policy (90d standard + 30d high-blast-radius + on-event immediate; calendar reminder schedule; per-secret rotation procedure with vendor-first → store-update → verify → revoke-old pattern) · §4 1Password "ROMAS legal" vault runbook · §5 breach response 1-2-3 (revoke within minutes / rotate within hours / audit within days) · §6 never-commit list (10 patterns) · §7 CI integration plan (gitleaks block-on-hit) · §8 cross-references · §9 revision history.

27 secrets mapped to consumers and rotation cadences. Critical high-blast-radius secrets (`SUPABASE_SERVICE_ROLE_KEY`, `CLOUDFLARE_API_TOKEN`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`) flagged for 30-day rotation; standard secrets at 90-day. D-030 documents the rotation-cadence decision.

### Self-verification (B8) — evidence-first

```
$ pnpm install (after @supabase/ssr + @supabase/supabase-js add)
Resolved 503 packages, +10 added (supabase deps + transitives)
Done in 2.4s

$ pnpm turbo run typecheck
5 successful / 5 total in 46ms (fully cached after the add)
@romas-brief/cms typecheck PASS — includes the 3 new lib/supabase/*.ts files

$ pnpm audit --audit-level=low
14 vulnerabilities (0 critical, 5 high, 7 mod, 2 low) — matches ADR-0015 v2 inventory
(Supabase deps added 0 new CVEs; @supabase/ssr 0.10.3 + supabase-js 2.106.1 both clean.)
```

### Deferred items (handoff to next cycles)

- **Live Supabase project provisioning** — Kimal infra ops. Without it, deploy-migrations.yml cannot run; the Auth Helper cannot be exercised end-to-end. Pre-launch gate.
- **Live Cloudflare provisioning** (Pages projects, Workers account, R2 buckets) — Kimal infra ops. Deploy workflows authored with skeleton secret refs; need real values.
- **Voice consent executed signature** — Kimal legal. Template ready; signed copies land in 1Password.
- **`supabase gen types typescript --linked > apps/cms/lib/supabase/types.ts`** — runs once Supabase project is live; overwrites the placeholder Database type.
- **Vitest scaffolding** (R-201 / M2) — when first JS unit tests land, ci.yml's `Test` step should add a coverage threshold gate.

### Acceptance verdict (pending team-build-critic)

Self-verification PASS. 4 deferred-item closes delivered concretely (no phantom-scope claims). Awaiting B9 critic gate.
