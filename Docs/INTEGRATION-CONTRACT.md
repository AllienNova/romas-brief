---
title: ROMAS Brief — Split-Repo Integration Contract
version: 1.1.0
date: 2026-05-28
status: ACCEPTED-CONSOLIDATE — Kimal selected Option A (consolidate) on 2026-05-28. This contract becomes obsolete on consolidation-sprint completion. Until then, §3-§7 govern any inter-repo work.
owner: Kimal Honour Djam
trigger: /team-qa cycle-6 surfaced B-20 (split-repo architecture undocumented). This doc closes B-20 at the contract level. Architecture decision (§8) resolved 2026-05-28 → consolidate.
---

# ROMAS Brief — Split-Repo Integration Contract

ROMAS Brief production lives across two GitHub repositories. This contract documents how they coordinate so:

- Schema changes in one repo do not silently break the other.
- Types are kept in sync without manual copy-paste drift.
- Environment variables are managed consistently.
- Deploys happen in the right order.
- /team-qa cycles can audit the full product.

## 1. Repo inventory

| Repo | URL | Role | Source on disk |
|---|---|---|---|
| **Platform** | `AllienNova/romas-brief` (private) | Schema (Supabase migrations), workers (cron-ingest, audio-producer, cdn-purge-watchdog, rss-publisher, beehiiv-webhook, email-canary, source-health), CMS scaffold (`apps/cms`), reader scaffold (`apps/web`), design specs, planning docs. | `D:\dev\projects\romas-brief\` |
| **Reader** | `kimhons/romas-brief-web` (per CLAUDE.md §12) | Public-facing Next.js reader site deployed at `https://romas-brief-web.vercel.app/`. Homepage, article pages, listen page, region/category/audience routes. | Not in this monorepo — separate clone. |

**State at cycle-6 sign-off:** Platform repo HEAD = `9c4284d` (M2-A cron-ingest committed; M2-B/C audio workers untracked + lockfile drift per B-18). Reader repo state = unaudited by /team-qa cycles 1-6.

## 2. Ownership matrix — which repo owns what

| Surface | Owning repo | Reason |
|---|---|---|
| Supabase migrations (`supabase/migrations/0001*..0011*`) | Platform | Single source of truth for schema; reader reads the resulting types. |
| pgTAP tests (`supabase/tests/`) | Platform | Schema invariant verification belongs with schema. |
| Workers (`workers/*`) | Platform | All cron + audio + RSS + email surfaces. |
| Shared TS types (`packages/shared/`) | Platform | Generated/curated from schema; consumed by both repos. |
| Design tokens (`Docs/design/tokens.json`, `Docs/design/components/*.md`) | Platform | Token/component specs travel with the design system docs. |
| UI primitives (`packages/ui/`) | **DECISION PENDING — see §8** | Currently a stub in Platform; reader uses its own components in `kimhons/romas-brief-web`. Consolidation would centralize them here. |
| Reader pages + components (homepage, article, listen, regions, categories, /for/{audience}) | Reader (`kimhons/romas-brief-web`) | Currently deployed; source not in Platform repo. |
| CMS audio QA UI | Platform (`apps/cms/`) | Editorial console is internal; gates publish; reads schema directly with service-role auth. |
| Beehiiv webhook handler | Platform (`workers/beehiiv-webhook/`) | Worker is deploy-time-bound to Cloudflare; Beehiiv calls a Worker URL. |
| Resend transactional sends | Platform (`workers/email-canary/`) | Worker reads Supabase events → sends. |
| Reader signup form + Beehiiv frontend integration | Reader (`kimhons/romas-brief-web`) | Lives on the public-facing surface. |

## 3. Type propagation strategy

**Single source of truth:** `packages/shared/src/index.ts` in Platform — the canonical TypeScript surface for `RawItem`, `SourceHealthEntry`, `Region`, and any future schema-derived types.

**Propagation to Reader (`kimhons/romas-brief-web`):**

Choose ONE of:

| Option | How | Drift risk | Effort |
|---|---|---|---|
| **A. npm/JSR publish** | `packages/shared` publishes as `@romas-brief/shared` (private npm or JSR scope). Reader `package.json` consumes versioned dep. | Lowest — explicit version bumps; lockfile in reader pins it. | One-time publish setup + per-release version bump. |
| **B. Git submodule** | Reader includes Platform as a `git submodule` at known path; imports types via relative path. | Medium — must remember to update submodule pointer. | One-time submodule init. |
| **C. Codegen mirror** | A CI job in Platform pushes a copy of `packages/shared/dist/` to a Reader repo branch; Reader consumes it. | Medium-high — CI maintenance + lag between push and consume. | One-time CI setup; per-change push. |
| **D. Manual copy-paste with drift detector** | Reader copies types into its own `lib/shared-types.ts`; a CI job in both repos compares hashes and fails on drift. | Highest at steady state but transparent. | Per-change manual sync + recurring CI alarms. |

**Recommended:** Option A (npm/JSR) if Platform repo stays private — npm scoped private packages are cheap. Option D if speed matters more than discipline at this stage.

**For schema-derived types (Supabase):** Reader runs `supabase gen types typescript --linked --project-id rjpuxfbuzispklcstuzo > types/supabase.ts` directly against the live project. Platform does the same for the CMS. Both repos point at the same Supabase project so the types are always consistent.

## 4. Environment variable manifest

Each repo maintains its own `.env.example`. **The union of both must equal the SECRETS.md inventory.** Drift between them = configuration bug.

### Platform (`.env.example` in `D:\dev\projects\romas-brief\.env.example`)

Owns: TTS keys (ElevenLabs, PlayHT), Whisper, Supabase service-role, Cloudflare (R2, Zone), Beehiiv webhook secret, Resend API key, INGEST_TRIGGER_SECRET.

### Reader (`.env.example` in `kimhons/romas-brief-web`)

Owns (minimum): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `PLAUSIBLE_DOMAIN`, `BEEHIIV_PUBLIC_KEY` (signup widget, if used). **Never** holds service-role keys.

**Coordination rule:** Any new secret introduced in Platform that crosses the network boundary (e.g., webhook URL the Reader form posts to) must be added to BOTH `.env.example` files in the same PR cycle, with cross-references.

**Verification:** A monthly reconciliation check compares both `.env.example` files against `SECRETS.md` — any unreferenced or undocumented secret is a finding.

## 5. Deploy coordination

| Change type | Deploy order | Why |
|---|---|---|
| **Additive schema migration** (new column with default, new table) | Platform migration applied first → Platform workers redeploy → Reader can deploy at any time. | Reader queries are backward-compatible; new column ignored until Reader code updates. |
| **Destructive schema migration** (drop column, rename) | Platform migration applied first → BOTH Platform workers AND Reader must redeploy in lockstep. Schedule maintenance window. | Reader queries break the moment the column is gone if Reader code still selects it. |
| **New worker** | Platform deploys worker (`wrangler deploy`) → Reader updates webhook URL / form action if needed → Reader redeploys. | Worker URL must exist before Reader points at it. |
| **Reader-only UI change** | Reader deploys via Vercel auto-deploy. Platform unaffected. | No coordination needed. |
| **Token / design-system change** | Platform updates `Docs/design/tokens.json` + `packages/ui` → published to Reader (per §3 type-propagation) → Reader redeploys. | Tokens are source-of-truth in Platform. |

**Runbook:** Author a `Docs/specs/deploy-runbook.md` (TBD) that codifies the above into a checklist. Currently `Docs/specs/deployment-plan.md` exists but predates the split-repo discovery.

## 6. /team-qa scope rules

**Cycle 1-6 were implicitly scoped to the Platform repo working tree.** This created a B-17/B-20 blind spot.

Going forward:

| Cycle type | Scope | Trigger |
|---|---|---|
| **Platform-only cycle** | `D:\dev\projects\romas-brief\` working tree only. Verdict applies to schema, workers, CMS, design specs. | When changes are confined to Platform. |
| **Reader-only cycle** | `kimhons/romas-brief-web` clone. Verdict applies to reader UI surface. | When changes are confined to Reader. |
| **Full-product cycle** | Both repos pulled into a sibling-clone path. Verdict applies to Day-1 launch readiness. | Before any release that affects user-visible end-to-end behavior. |

**Q0 pre-flight (proposed `/team-qa` skill update):** scan `CLAUDE.md` + `Docs/SSOT.md` for external-repo references; if found, fail-loud and refuse to verdict the product until external repos are pulled into the audit scope.

## 7. Drift detection

| Drift type | Detector | Cadence |
|---|---|---|
| Type drift between Platform `packages/shared` and Reader equivalent | Per §3 chosen option (A=lockfile, D=CI hash compare) | Per commit |
| `.env.example` drift between Platform + Reader | Manual reconciliation against `SECRETS.md` | Monthly |
| Schema drift between live Supabase + Platform migrations | `supabase db diff` in Platform CI | Per PR |
| Schema drift between live Supabase + Reader generated types | Reader CI re-runs `supabase gen types` and diffs | Per PR |
| Doc drift (CLAUDE.md §12 vs working tree) | Pre-cycle /team-qa Q0 pre-flight | Per /team-qa cycle |

## 8. Consolidation vs split — the decision

**The architecture is not decided.** Two valid options. **Both are open until Kimal picks one.**

### Option A: Consolidate into the monorepo

- Move `kimhons/romas-brief-web` source into `apps/web/` of this Platform repo.
- Single CI/CD, single deploy pipeline, single lockfile, single dependency tree.
- `packages/ui` becomes load-bearing; reader consumes it directly.
- Vercel project rewired to point at Platform repo's `apps/web` path.
- One-time migration cost: ~1-2 days (git history merge or re-import, Vercel reconfig, env-var migration, CI rewire).
- Steady-state cost: zero coordination overhead.
- /team-qa cycles return to single-scope verdicts.

### Option B: Keep separate, formalize the split

- Implement §3 type-propagation (recommend Option A: npm/JSR publish).
- Implement §4 env-var coordination discipline.
- Implement §5 deploy-runbook formally.
- Implement §6 full-product /team-qa cycle by adding `kimhons/romas-brief-web` as a sibling clone path.
- One-time setup cost: ~3-5 days (publish pipeline + CI cross-checks + runbook authoring).
- Steady-state cost: ongoing coordination overhead; higher drift surface; team must internalize the boundaries.
- /team-qa needs Q0 pre-flight discipline.

### Tradeoffs

| Factor | Consolidate (A) | Separate (B) |
|---|---|---|
| Cognitive overhead per session | Lower | Higher |
| /team-qa audit completeness | Naturally one-scope | Requires Q0 discipline |
| Type-drift risk | Eliminated | Managed (not eliminated) |
| Independent deploy velocity (Reader can ship without touching Platform) | Lost (acceptable tradeoff) | Preserved |
| Repo-level access control (e.g., open-sourcing Reader later) | Harder to split if needed | Native |
| Build-time CI cost | Higher (Platform CI runs everything) | Lower (each repo's CI runs its own) |

### Recommendation to Kimal

**Consolidate (Option A)** unless there is a concrete reason to preserve repo-level independence (open-sourcing Reader, separate compliance scopes, separate team ownership). The current state — split-without-contract — is the worst of both worlds. Doing nothing is the worst option.

If you choose A: schedule a 1-2 day consolidation sprint as the next milestone.
If you choose B: schedule a 3-5 day formalization sprint to implement §3, §4, §5, §6 above.

### Decision recorded — 2026-05-28

**Kimal selected Option A — Consolidate.** Consolidation sprint scheduled as `tasks.md` Phase 8 (M2-D / consolidation). Sprint scope:

1. `gh repo clone kimhons/romas-brief-web` into a sibling workspace.
2. Move reader source into `apps/web/` of this monorepo. Preserve git history if feasible (`git filter-repo` to graft subtree, or a clean re-import with a noted handoff commit).
3. Rename reader package to `@romas-brief/web`. Reconcile `package.json` deps with monorepo overrides (Next 14.2.35 pin, undici/glob/postcss/ws/esbuild overrides). Reuse `packages/shared`, `packages/ui`, `packages/config` where the reader currently has duplicates.
4. Regenerate `pnpm-lock.yaml`. Run `pnpm turbo run typecheck build` — expect green.
5. Rewire Vercel project to point at the monorepo path (root `D:\dev\projects\romas-brief\`, build target `apps/web/`).
6. Migrate Vercel env vars to the consolidated `.env.example` + `SECRETS.md`. Confirm `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set on the new project.
7. Verify `https://romas-brief-web.vercel.app/` (or new canonical URL) still serves the same 8-module homepage.
8. Archive `kimhons/romas-brief-web` repo (or freeze with a README pointing to the monorepo).
9. Update `Docs/specs/architecture.md` to remove the split-repo section. Mark INTEGRATION-CONTRACT.md status: EXECUTED.
10. Re-run /team-qa cycle-7 with full single-scope verdict.

Estimated effort: 1-2 days. Blocking until done: any /team-qa cycle-7 Day-1 launch verdict.

## 9. State machine

Initial states (resolved):

- ~~PROPOSED~~ (2026-05-28, transient)
- **ACCEPTED-CONSOLIDATE** ← current (2026-05-28). Kimal selected Option A. Consolidation sprint scheduled as `tasks.md` Phase 8. This contract becomes obsolete on sprint completion.

Possible future transitions:

- **EXECUTED** — Consolidation sprint complete; `kimhons/romas-brief-web` source merged into `apps/web/`; Vercel project rewired to monorepo path; INTEGRATION-CONTRACT.md retired. Replaced by canonical `Docs/specs/architecture.md` § single-repo arc.
- **AMENDED** — Mid-sprint reversal or scope change; revise + re-issue.

## 10. References

- `/team-qa cycle-6` verdict + ADDENDUM: `Docs/specs/qa-report.md`
- `B-17/B-18/B-19/B-20` evidence: `Docs/qa/risk-register.md`
- Implementation state ground truth: `CLAUDE.md §12`
- Open task backlog: `tasks.md` (Phase 5/6/7 un-checked post cycle-6 reconciliation)
- Architecture diagram (pre-split): `Docs/specs/architecture.md` §1 — needs amendment under either A or B above.

---

*Authored to close cycle-6 B-20. State: PROPOSED. Awaiting Kimal decision per §8.*
