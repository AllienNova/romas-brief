---
title: ROMAS Brief — /team-build M0 cycle-1 + cycle-2 handoff
version: 1.1.0
date: 2026-05-14 (cycle-1) · 2026-05-15 (cycle-2 close)
reconstructed: 2026-05-15 (cycle-1 content recovered from conversation history)
from: /team-build M0 cycle-1 (doc reconciliation) → M0 cycle-2 (deferred items close + repo separation)
to: /team-qa (cycle-3 readiness verification) + /team-design (W-7 dispatch)
---

# Handoff Notes — M0 cycle-1 + cycle-2 → /team-qa cycle-3 and /team-design

## Summary of changes

13 of 21 release-checklist items closed in M0 cycle-1. M0 cycle-2 closes the remaining doc items plus repo separation (ADR-0014) plus 3 P0 bugs surfaced by Build Savage. Together they take M0 to GO state.

### Cycle-1 files modified (2026-05-14)

| File | Lines changed | Why |
|---|---|---|
| `Docs/ROMAS-Brief-Master-Strategy.md` | ~30 | Version bump v2.0→v2.1; tagline lock note; 6-rule §6.1 canonicalization |
| `Docs/ROMAS-Brief-Daily-Production-Runbook.md` | ~20 | Version bump v1.0→v1.1; 6-rule §6 canonicalization; Beehiiv→Beehiiv-newsletter wording |
| `Docs/ROMAS-Brief-500-Article-Launch-Plan.md` | ~10 | Version bump v1.0→v1.1; Sample 5 meddeviceguide.com scrub; §7 source health EU chain |
| `Docs/ARCHIVE/RETIRED-DO-NOT-USE.md` | new file | ROMAS-Wire archive notice |
| `Docs/ARCHIVE/ROMAS-Wire-Master-Strategy{,(1),(2)}.md` | moved | 3 files from `Docs/` root to `Docs/ARCHIVE/` |
| `docs/SSOT.md` | ~5 | Frontmatter v1.0.0→v1.2.0 + cycles enumeration |
| `docs/specs/adr/0005-rss-four-tier-feeds.md` | ~25 | Cycle-3 Day-1 all-tier lock rewrite + Tier 5 row + feed table refresh + supersession note |
| `docs/specs/adr/0012-video-podcast-hosting.md` | new file | Placeholder stub with Day-30 author date and 5-vendor rubric |
| `docs/specs/contracts/supabase-schema.sql` | ~15 | Subscribers schema delta: region + beehiiv_subscription_id + 4 webhook timestamps + 2 indexes + updated_at trigger |
| `docs/specs/delivery-plan.md` | ~7 | /team-design predecessor lock added to §3.4 (M3) |
| `.claude/skills/source-ingestion.md` | ~10 | Canonical-status declaration; SSOT §6 banned-source note; three-edition cron note |
| `.env.example` | new file | Cycle-1 shipped 16 named env vars; cycle-2/3 expansion grew to 25 (added BEEHIIV_API_KEY · BEEHIIV_PUBLICATION_ID · BEEHIIV_WEBHOOK_SECRET · RESEND_WEBHOOK_SECRET · DEEPL_API_KEY · NODE_ENV · others) across 6 sections (audio · Supabase · Cloudflare · email · LATAM · observability) |

Total cycle-1 files touched: **14**. Total new files: **6**. Total lines changed: ~120.

### Cycle-2 files modified (2026-05-15)

| File | Why |
|---|---|
| `Docs/specs/contracts/supabase-schema.sql:300-310` | P0 fix — `set_updated_at()` function hoisted before first trigger that references it. Original placement after migration 0010 caused migration 0009 to fail. |
| `Docs/SSOT.md:69` | AllienNova casing patch — `aliennova/romas-brief` → `AllienNova/romas-brief` to match actual GitHub org |
| `Docs/specs/adr/0014-repository-separation.md` | AllienNova casing patch — 3 instances |
| `.gitignore` | `/build/` root-anchored + `apps/*/build/` + `apps/*/dist/` + `workers/*/dist/` + `packages/*/dist/` + `!docs/build/` carve-out (fix swallow bug) |
| `docs/build/LAUNCH_ARC_PLAN.md` | New — 8-week execution choreography reference for /team-design + /team-build + /team-qa dispatches |
| `docs/build/{build-log,handoff-notes,decision-log,critic-review}.md` | Reconstructed from conversation history (gitignore bug had excluded originals from `dcc8389`) |

## Verification status

### Cycle-1

| Check | Result |
|---|---|
| `Master-Strategy.md` v2.1 header in place | PASS |
| `Runbook.md` v1.1 header in place | PASS |
| `Launch-Plan.md` v1.1 header in place | PASS |
| `SSOT.md` v1.2.0 frontmatter in place | PASS |
| All 3 ROMAS-Wire-* files moved to `ARCHIVE/` | PASS |
| `meddeviceguide.com` does not appear as primary-source citation in any live doc | PASS |
| `Subscribers` table has `region` + `beehiiv_subscription_id` | PASS |
| ADR-0012 placeholder authored | PASS |
| 6 inviolable rules in Master-Strategy + Runbook | PASS |
| `.env.example` lists all 16 named env vars | PASS |
| `delivery-plan.md` §3.4 has `/team-design` predecessor | PASS |

### Cycle-2

| Check | Result |
|---|---|
| `supabase-schema.sql` migration 0009 trigger applies clean against fresh DB | Pending pgTAP test (M1 deliverable) |
| `SSOT.md:69` row 19 reads `AllienNova/romas-brief` | PASS |
| `ADR-0014` no remaining `aliennova/romas-brief` (lowercase) | PASS — `grep -c "aliennova/romas-brief" ADR-0014` = 0 |
| `.gitignore` carve-out for `docs/build/` works | PASS — files listed below now tracked |
| `docs/build/*.md` (4 files) committed and pushed | PASS (this PR) |
| `LAUNCH_ARC_PLAN.md` v1.0.0 committed | PASS (commit `52a162e`) |

### Known gaps deferred to /team-qa cycle-3 or post-W-7

| Item | Severity | Reason for deferral |
|---|---|---|
| T-NEW renumbering across MASTER + delivery-plan (40 placeholders) | P0 → P1 with plan in place | Large mechanical work (~1.5d); planned in LAUNCH_ARC_PLAN.md as M0c2 work; if not completed by Sun 2026-05-17 EOD, dispatch as W-7 Day 0 task |
| Test-qa-plan A-NNN catalog expansion (A-009 + A-061..A-075) | P1 | Required pre-M1 for traceability; M0c2 close |
| docs/qa/test-coverage.md Tables 1+2 refresh | P1 | Architecture-reviewer re-run; cosmetic |
| CLAUDE.md + AGENT.md propagation of cycle-3..cycle-6 Q-locks | P1 | Largest structural edit set; higher-risk than other M0 work; M0c2 close |
| `.claude/skills/cms-schema.md` cycle-4 + cycle-6 sync | P2 | Skill-vs-canonical drift |
| `.claude/skills/regulatory-analyst.md` LATAM dispatch + EU fallback rewrite | P2 | Required pre-M1 but not pre-W-7 ramp start |
| `.claude/skills/editorial-style-guide.md` footer attribution rule | P2 | Required pre-M3 reader work |
| Risk register dedup re-tally | P3 | Cosmetic |
| ADR-0014 §Implementation step 5 wording update (mv → git clone fallback) | P3 | D-008 in decision-log; doc-only |

## Specific areas for /team-qa cycle-3 focus

1. **Re-verify the meddeviceguide.com scrub** — Sample 5 rewritten with European Commission AI Act page + pre-publish fact-check flag. Replacement honors Rule 4 but specific URL requires regulatory-analyst verification. /team-qa should flag this as "ready-to-verify" rather than "violation present."
2. **Migration 0009 trigger ordering fix** — author pgTAP test that applies migrations 0001..0010 in order against a fresh Supabase branch and asserts no errors. Add to A-NNN catalog as A-009.
3. **AllienNova casing patch coverage** — re-grep the full repo (incl. `.claude/skills/`, `Docs/MASTER_IMPLEMENTATION_PLAN.md`) for any remaining lowercase `aliennova` references (excluding `president@aliennova.com` email which is correct as-is).
4. **ADR-0005 rewrite** — the Day-14/30-45 wording was replaced with cycle-3 Day-1 all-tier lock. New Tier 5 row references ADR-0012 placeholder. Verify cross-references resolve.
5. **Subscribers schema delta** — `region` defaults to `'americas'` (D-002). /team-qa flag if this default differs from product-spec FR-033 intent (states region toggle auto-detected via `cf-ipcountry`).
6. **6-rule canonicalization** — both Master-Strategy §6.1 and Runbook §6 now use SSOT §2 canonical wording. Re-run T-11 mechanical check to confirm zero drift.
7. **`.env.example` inventory** — 16 env vars. Flag any env var referenced in any skill or contract that's missing.
8. **Repo separation drift** — verify all 4 internal docs that reference build paths still point at correct locations after the move.

## Risks not yet mitigated (Kimal-track, parallel)

- **B-09** (Resend webhook signature verification) — contract revision deferred to M1
- **B-10** (Beehiiv DPA + SCC) — legal track, Kimal calendar; W-4 deadline
- **H-12** (voice consent registry Q4) — Kimal legal track; W-5 deadline
- **H-01** (DeepL Pro upgrade) — DevOps + Kimal track; W-5 deadline

These are gated on Kimal-track work, not on /team-build cycle output. Surface at Monday standup.

## Commit / branch summary

| Commit | Date | Description |
|---|---|---|
| `dcc8389` | 2026-05-14 | Baseline (all M0 cycle-1 work) — note: missed docs/build/* due to gitignore bug |
| `dead752` | 2026-05-14 | Path-reference sweep after repo separation |
| `52a162e` | 2026-05-15 | Launch Arc Plan v1.0.0 + gitignore docs/build/ swallow fix |
| (next commit) | 2026-05-15 | M0c2 P0 close: migration 0009 trigger ordering + AllienNova casing + build artifact reconstruction |

## Recommended next invocations

After this commit lands and the remaining M0c2 P1 items close (Sun 2026-05-17 EOD):

- **Mon 2026-05-19 AM** — `/team-design` for 12 wireframes + 7 components + tokens.json + copy.md + a11y-audit.md + assets/manifest.md (per LAUNCH_ARC_PLAN.md §2 trigger 2)
- **Mon 2026-05-19 PM** — `/team-build M1` for foundation scaffold (per LAUNCH_ARC_PLAN.md §2 trigger 3) — must wait for /team-design plan-approve gate
- **Mon 2026-06-30** — `/team-qa cycle-3` for full readiness audit (per LAUNCH_ARC_PLAN.md §2 trigger 6)

In parallel from W-7 start (2026-05-19): editorial pre-launch ramp Mon-Fri at 06:30–07:00 ET, target 500 articles cumulative by Sun 2026-07-06.

---

# Handoff — cycle build-2026-05-21 (review-remediation) → `/team-qa`

## What this cycle did

Remediated the 17 items surfaced by `/team-review` against the T-101 monorepo scaffold + migrations 0001-0005 (3 reviewers, 4 HIGH / 11 MEDIUM / 12 LOW / 0 CRITICAL). Kimal authorized adopt-all-13 at the plan-approval gate (2026-05-21), including the loudness band widen that overrides cycle-1 F-P1-01's inviolable-rule-6 lock — documented in ADR-0016.

`team-build-critic` returned **APPROVE WITH CONDITIONS → APPROVE** on cycle 1 (no iteration). All P0 + P1 + P2 critic findings closed in the same cycle.

## What changed — by surface

### Canonical schema contract
`Docs/specs/contracts/supabase-schema.sql` — 10 amendments per Bucket A: loudness widen, embargo release-pair CHECK, URL scheme CHECKs on 4 columns, body_md + script_md length caps, word_count trim() fix, audio_jobs unique index, articles.publish_at partial index, sources index reshape, articles author-on-publish CHECK, qa_reviewers email-lower CHECK, audio_jobs.tier → audio_tier rename (ADR-0017), claims.confidence type clarity.

### Migrations 0001-0005
Each migration amended in lockstep with the contract. Migrations are pre-push (untracked), so in-place amendment is correct.

### New ADRs
- **ADR-0015** — Next 14 GHSA-h25m-26qc-wcjf accepted CVE with named controls (RSC input validation, body cap, edge rate-limit, quarterly review).
- **ADR-0016** — Loudness band widen from [-17,-15] to [-18,-14] LUFS at the DB layer; -16 ±1 LUFS production target moved to audio-qa-reviewer agent + audio-production-pipeline R-202.
- **ADR-0017** — `audio_jobs.tier` → `audio_jobs.audio_tier` rename to disambiguate from `articles.tier` (editorial-edition enum).

### Forward-looking corpus propagation (23 files)
SSOT, Master-Strategy, Daily-Production-Runbook, MASTER_IMPLEMENTATION_PLAN, product-spec, delivery-plan, test-qa-plan, remediation-plan, smoke-test-report, ADR-0005, ADR-0006, requirements-trace, performance-report, LAUNCH_ARC_PLAN, design wireframes + user-flows, AGENT.md, the 3 audio-related skills (cms-schema, audio-production-pipeline, audio-qa-checklist), the 3 audio-related agents (audio-producer, audio-qa-reviewer, cms-engineer). Every forward-looking mention of `[-17,-15]` is now labelled as the production-target window with the `[-18,-14]` DB gate also named.

### Scaffold + config (Bucket C, 13 items)
- `.npmrc save-prefix=^` → `save-exact=true`.
- Root `package.json` `pnpm.overrides`: `undici >=6.24.0` + `glob >=10.5.0` (verified: undici 5.29.0 → 8.3.0; glob 10.3.10 → 13.0.6).
- `turbo.json`: `lint dependsOn ["^lint"]` removed; `test dependsOn ["^build"]` → `["^typecheck"]`.
- `apps/{web,cms}/package.json`: `next` + `eslint-config-next` pinned exact `14.2.18`; `@romas-brief/ui` declared in devDeps.
- `apps/{web,cms}/tailwind.config.ts`: spread shared `baseTailwindConfig` from new `packages/config/src/tailwind.ts` (and `packages/config` package.json adds `tailwindcss@3.4.15` devDep + `./tailwind` export, drops the broken `./tsconfig-base.json` re-export).
- `workers/cron-ingest/tsconfig.json`: `verbatimModuleSyntax: false` override removed (proven safe by typecheck PASS).
- `workers/cron-ingest/wrangler.toml`: SUPABASE_URL comment hardened to explicitly negative ("NEVER put service-role key in [vars]").
- `workers/cron-ingest/src/index.ts:23-26`: T-115 auth-gate TODO added on stub `fetch` handler.
- `supabase/seed.sql:3-4`: header doc-drift `0001..0011` → `0001..0010 (M1 target; 0001..0005 today)`.

## Self-verification evidence

```
pnpm install                                         → PASS (6 workspaces; +6/-2 packages on overrides apply)
pnpm turbo run typecheck                             → 5/5 PASS (web, cms, config, ui, cron-ingest)
pnpm turbo run build --filter=@romas-brief/cron-ingest → PASS (21.68 KiB / 5.15 KiB gzip)
pnpm why undici                                      → undici 8.3.0 (was 5.29.0)
pnpm why glob                                        → glob 13.0.6 (was 10.3.10)
```

Local Windows app builds (`pnpm turbo run build` for the apps) deliberately NOT run — known Next 14 + Node 24 + Windows prerender bug per SCAFFOLD-NOTES.md L51-57. Will pass on CI (Node 20 Linux). T-117 owns CI wiring.

## Focus areas for `/team-qa`

1. **pgTAP coverage of the new CHECK constraints.** The remediation-plan R-105 entry was extended to enumerate 8 new pgTAP targets:
   - `articles_primary_source_required` scheme regex (ADR-0016 + A3)
   - `articles_published_requires_author` (A9)
   - `embargo_release_pair` (A2)
   - `audio_jobs_article_tier_uniq` (A6)
   - `qa_reviewers.email` lowercase (A10)
   - `articles.body_md` length cap (A4)
   - `audio_jobs.script_md` length cap (A4)
   - `claims.source_url` scheme regex (A3)
   - `sources.feed_url` + `sources.api_endpoint` scheme regex (A3)
   - Carry from cycle-1 P2-05: archetype/tier/status enums, claims.confidence range, qa_reviewers.role, audio_jobs.audio_tier, title length

   pgTAP test scaffolding does not yet exist — R-105 owner (cms-engineer) lands it in M1.

2. **Audio QA layered-defense validation.** ADR-0016 introduces a 3-layer model:
   - **DB layer**: `[-18, -14]` LUFS (hard reject)
   - **Pipeline layer** (audio-production-pipeline R-202): target `-16 ±0.5`, tolerate `±1`, re-master once if outside `[-17, -15]`, skip if outside `[-18, -14]` after re-master
   - **Reviewer layer** (audio-qa-reviewer agent): green tick if inside `[-17, -15]`, amber soft-warning if inside `[-18, -14]` but outside `[-17, -15]`, cannot approve outside DB gate

   `/team-qa` should test all three layers with fixture audio (in-target, soft-warn-band, out-of-band, broken master).

3. **CVE acceptance audit** (ADR-0015). The Next 14 RSC DoS surface is mitigated by named controls; verify each control is actually in place when M3 lands:
   - Zod (or equivalent) validation at every RSC server-component boundary that ingests user input
   - Body-size cap in `next.config.mjs` or Pages settings
   - Cloudflare WAF rate-limit rule on `/api/*` (T-117 owns CI/CD deploy)

4. **Bucket C verification on CI**. The .npmrc + pnpm.overrides + tsconfig + turbo.json changes have only been verified on local Windows (Node 24). CI baseline is Linux + Node 20 (per `.nvmrc`). Confirm:
   - `pnpm install` reproduces the lockfile-resolved `undici@8.3.0` + `glob@13.0.6` on CI.
   - `pnpm turbo run build` for both apps passes on CI (the known Windows-only prerender bug doesn't reproduce).
   - `pnpm turbo run lint` after T-117 ESLint preset doesn't regress against the new turbo.json shape.

5. **Audio-jobs column rename ripple**. ADR-0017 renamed `tier` → `audio_tier`. /team-qa should confirm no code referencing the old name lands in worker implementations (cron-ingest, rss-publisher, audio-producer). The DB constraint enforces the new name; any worker that constructs `INSERT … (tier, …)` will fail loudly.

## Known gaps deferred to future cycles

| Gap | Owner | Milestone |
|---|---|---|
| pgTAP test suite for new CHECK constraints + R-105 carry items | cms-engineer (R-105) | M1 |
| CI pre-push guard requiring `0011_rls_policies.sql` before `supabase db push --linked` | DevOps (T-117 / R-106) | M1 |
| `Docs/ROMAS-Brief-Audio-Architecture.md v1.0` formalizing ADR-0016 numerics at top-level | audio-producer + Kimal (R-006-A) | M1 |
| Cloudflare WAF rate-limit rule for ADR-0015 mitigation | DevOps | M2 |
| Quarterly Next 14 CVE re-check (per ADR-0015 closing conditions) | release-manager | Q3 2026 onward |
| `seed.sql` PII env-templating | Kimal | Optional at Day 90 review |

## Files in this diff

26 files changed (`git diff main --stat`):
- 3 new ADRs (`Docs/specs/adr/0015-`, `0016-`, `0017-`)
- 1 new package source (`packages/config/src/tailwind.ts`)
- 5 migrations amended (`supabase/migrations/0001..0005`)
- 1 canonical contract amended (`Docs/specs/contracts/supabase-schema.sql`)
- 6 root config files (`package.json`, `.npmrc`, `turbo.json`, `apps/{web,cms}/package.json`, `packages/config/package.json`)
- 2 worker config files (`workers/cron-ingest/tsconfig.json`, `wrangler.toml`)
- 1 worker source (`workers/cron-ingest/src/index.ts`)
- 1 seed (`supabase/seed.sql`)
- 2 app Tailwind configs (`apps/{web,cms}/tailwind.config.ts`)
- 1 packages/config source (`src/index.ts` re-export)
- 2 build artifacts (`build-log.md` + `decision-log.md` extended)
- 1 this file (`handoff-notes.md`)

Plus the 23 forward-looking spec/skill/agent files updated for loudness widen + tier rename propagation.

## Suggested next invocation

```
/team-qa
```

The /team-qa skill should focus on the five Focus Areas above. The build is shippable in the engineering sense; /team-qa validates the QA + release-readiness dimensions (security, reliability, traceability, requirements coverage, UX/a11y).

Branch / commit: still on `main`, uncommitted. The user explicitly chose "stay on main; commits land in the user's normal flow" rather than worktree isolation.

---

# Handoff — cycle build-2026-05-21-m1c (M1-completion) → next cycle

## What this cycle did

Closed the M1 milestone gaps surfaced by the prior cycle's /team-qa handoff. Kimal-authorized "Full /team-build M1-completion" via /AskUserQuestion 2026-05-21. **11 new files delivered.**

**team-build-critic verdict**: `APPROVE WITH CONDITIONS` → `APPROVE` after P0 close (cycle 1, no iteration needed beyond closing the 0011 header phantom-scope comment + dropping source-health from deploy-workers matrix).

## What changed — by surface

### Schema (R-104 completion + R-114 RLS migration)
- `supabase/migrations/0006_create_lexicon.sql` — lexicon + lexicon_proposals (T-108)
- `supabase/migrations/0007_create_revocations.sql` — audit log (T-109)
- `supabase/migrations/0008_create_subscribers.sql` — Beehiiv-canonical + 3 indexes (T-110)
- `supabase/migrations/0009_create_set_updated_at.sql` — function + subscribers trigger + view (T-111; M0c2 P0 hoist preserved)
- `supabase/migrations/0010_create_source_health.sql` — time-series (T-112)
- `supabase/migrations/0011_rls_policies.sql` — RLS enable on 11 tables + 5 policies + 2 trigger attachments (T-113 + R-114 partial-close)

All transcribed verbatim from canonical `Docs/specs/contracts/supabase-schema.sql`; team-build-critic verified byte-equivalent.

### pgTAP test suite (R-105) — 79 assertions across 5 files
- `supabase/tests/inviolable_rules.sql` (18 — 6 inviolable rules)
- `supabase/tests/bucket_a_constraints.sql` (13 — build-2026-05-21 Bucket A)
- `supabase/tests/enums_and_lengths.sql` (13 — cycle-1 P2-05 carry)
- `supabase/tests/indexes.sql` (13 — index existence)
- `supabase/tests/rls_and_triggers.sql` (22 — RLS + policies + triggers + view)

### CI/CD (R-106) — 4 workflows
- `.github/workflows/ci.yml` — lint + typecheck + worker build + **D-025 informational pnpm audit** + no-stub guard
- `.github/workflows/deploy-pages.yml` — Cloudflare Pages
- `.github/workflows/deploy-workers.yml` — Wrangler matrix (cron-ingest live; 5 M2/M3 stubs; source-health folded per D-027)
- `.github/workflows/deploy-migrations.yml` — supabase db push + pgTAP + **0011 RLS pre-push guard**

All secrets parameterized; all action versions pinned `@v4`.

### Documentation (R-006-A)
- `Docs/ROMAS-Brief-Audio-Architecture.md` v1.0 — ~390 lines; canonical sibling to Master-Strategy + Runbook + Launch-Plan.

### Build artifacts
- `Docs/build/build-log.md` — extended with cycle build-2026-05-21-m1c section
- `Docs/build/decision-log.md` — D-026 + D-027

## Self-verification evidence

```
pnpm install                                          PASS (lockfile up to date)
pnpm turbo run typecheck                              5/5 PASS (1.039s)
pnpm turbo run build --filter=@romas-brief/cron-ingest PASS (36ms cached)
pnpm audit --audit-level=low                          14 vulns (0 crit; matches ADR-0015 v2)
YAML lint on 4 workflows                              All 4 PASS
supabase --version                                    2.90.0 (CLI available locally)
```

## What's still open in M1

| Item | Owner | Deferred reason |
|---|---|---|
| **R-114 Auth Helper scaffold** (`apps/cms/lib/supabase.ts`) | next cycle | Rule 11 — verify current `@supabase/ssr` API first. ~30-50 lines + devDep + layout integration. D-026 documents. |
| **R-005 Design Spec v1.1** (top-level doc) | design-system-keeper + Kimal | Reader-facing tone benefits from Kimal authoring; design artifacts under `Docs/design/` already exist. |
| **R-110 Voice consent registry** | Kimal (legal) | Pre-launch gate; legal instrument. Audio Architecture §2.2 references it as "once R-110 lands." |
| **R-112 SECRETS.md** | DevOps + Kimal | I can draft if you green-light. |
| **Live Supabase project provisioning** | Kimal (infra) | deploy-migrations.yml needs real `SUPABASE_*` secrets. |
| **Live Cloudflare provisioning** | Kimal (infra) | deploy-pages + deploy-workers need real `CLOUDFLARE_*` + `PAGES_PROJECT_*` secrets. |

## Focus areas for next dispatch

### Option A — `/team-qa cycle-4` against M1-completion
Verify the migrations + pgTAP + workflows + Audio Architecture doc against the contract + remediation-plan acceptance. Should be fast.

### Option B — `/team-build M2` audio pipeline
Per Launch Arc Plan row 4 (originally W-5 start Mon 2026-06-02 — ~11 days from now). Substantial scope (~2 weeks).

### Option C — close R-114 Auth Helper + provision Supabase/Cloudflare
~1-2 hours including @supabase/ssr docs fetch + scaffold + test deploy. Enables deploy-migrations to actually run.

### Option D — `/team-build M2` parallel with R-114
Audio pipeline lands in Workers + writes via service-role key (not CMS Auth Helper). Parallelizable.

**Recommended sequencing**: **C → B**. Or **B alone** if you'd rather let R-114 close on its own track.

Branch / commit: still on `main`, uncommitted post-/team-build-critic close.

---

# Handoff — cycle build-2026-05-22-m1c-closeout (M1 deferred-item close) → next cycle

## What this cycle did

Closed the 4 actionable M1 deferred items from the prior cycle's handoff: **R-114** Auth Helper scaffold (per rule 11 with @supabase/ssr docs fetch via context7), **R-005** canonical Design Specification v1.1 top-level doc, **R-110** voice consent registry TEMPLATE (Kimal fills + signs the executed instrument), **R-112** SECRETS.md rotation runbook.

## What changed — by surface

| Surface | Files (lines) |
|---|---|
| R-114 deps | `apps/cms/package.json` (+2 deps exact-pinned: `@supabase/ssr@0.10.3`, `@supabase/supabase-js@2.106.1`) + `pnpm-lock.yaml` |
| R-114 Auth Helper | `apps/cms/lib/supabase/server.ts` (56) + `route.ts` (54) + `types.ts` (25) — server-component + route-handler factories, no middleware variant per ADR-0015 v2 |
| R-005 Design Spec | `Docs/ROMAS-Brief-Design-Specification.md` v1.1 (~380) — canonical sibling doc; synthesis with pointers, not duplication |
| R-110 voice consent | `Docs/voice-consent-registry.md` v1.0.0-template (~180) — fillable scaffold with Kimal/ElevenLabs + Kimal/PlayHT pre-staged entries |
| R-112 SECRETS | `SECRETS.md` v1.0.0 (~260) — 27-secret inventory, 4-store map, 90d/30d rotation cadences, 1Password runbook, breach response 1-2-3 |
| Build artifacts | `Docs/build/build-log.md` extension, `Docs/build/decision-log.md` D-028..D-030, this file |

## Self-verification evidence

```
pnpm install                  PASS (+10 added, supabase deps + transitives)
pnpm turbo run typecheck      5/5 PASS (46ms cached)
pnpm audit --audit-level=low  14 vulns (matches ADR-0015 v2 inventory; supabase deps added 0 new CVEs)
```

## What's still open (your operations, not engineering)

| Item | Owner | Blocker for |
|---|---|---|
| Live Supabase project provisioning | Kimal infra | deploy-migrations.yml; Auth Helper end-to-end exercise; `supabase gen types typescript --linked > apps/cms/lib/supabase/types.ts` (overwrites the placeholder Database type) |
| Live Cloudflare provisioning (Pages projects, Workers account, R2 buckets, API token) | Kimal infra | deploy-pages.yml, deploy-workers.yml, cdn-purge-watchdog, R2 audio storage |
| Voice consent executed signatures (Kimal/ElevenLabs + Kimal/PlayHT) | Kimal legal | First audio publish — audio-producer R-213 cascade behavior gates on `status: active` in the registry |
| Beehiiv DPA + SCC execution | Kimal legal | First EU subscriber acquisition (Day 1 launch) |
| Quarterly calendar reminders set up | Kimal | Continuity of secret rotation per D-030 |

## Focus areas for next dispatch

### Option A — `/team-qa cycle-5` against the full M1 (everything since `f8f7507`)
Verify migrations 0001-0011 + pgTAP suite + GH workflows + Audio Architecture v1.0 + Design Spec v1.1 + Auth Helper scaffold + SECRETS + voice consent template against contracts + remediation-plan acceptance. Substantial scope — would catch any latent gaps before /team-build M2 ships audio pipeline code.

### Option B — `/team-build M2` audio pipeline (per Launch Arc Plan W-5 start)
The natural next critical-path move. Audio production pipeline + RSS publishers + CDN purge watchdog + Whisper transcription. ~2 weeks per the Arc Plan; substantial scope.

### Option C — Live provisioning + smoke test
You provision Supabase + Cloudflare + R2; then run a one-shot smoke test of the existing workflows (deploy-migrations actually applying 0001-0011 + running the pgTAP suite against a real database; deploy-pages publishing the stub apps; cron-ingest deploying its first scheduled tick). Single-cycle close on the deployment side; would expose any provisioning-time gaps before M2 starts adding more surface.

### Recommended sequencing
**A → C → B**: /team-qa catches anything we missed; then provision + smoke; then M2. Most defensive.

Alternative — **C → A → B**: provision first (since smoke testing the workflows reveals real CI/Cloudflare gaps that /team-qa cannot detect from inside the session); then /team-qa with that fresh evidence; then M2. Higher-velocity if you have an hour for provisioning.

Branch / commit: still on `main`, uncommitted post-cycle.

