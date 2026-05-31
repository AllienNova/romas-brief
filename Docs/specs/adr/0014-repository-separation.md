---
title: ADR-0014 — Repository separation from ROMAS COS monorepo
status: Accepted
date: 2026-05-14
deciders: Kimal Honour Djam
supersedes: cycle-1 implicit assumption that ROMAS Wire lived inside parent ROMAS monorepo
references: SSOT §3 row 19; cycle-6 REL-010; ADR-0001 (monorepo strategy); ADR-0013 (LATAM LLM-translate)
---

# ADR-0014 — Repository separation from ROMAS COS monorepo

## Status

**Accepted** (Kimal verbal 2026-05-14: `yes all`).

## Context

ROMAS Wire was developed in-place inside the parent ROMAS COS monorepo at `D:\dev\projects\ROMAS\ROMAS WIRE\` for cycles 1–6 of /team-plan, /team-qa, and /team-build M0 cycle-1. The parent ROMAS COS monorepo is a 9-service Python/FastAPI + Next.js + Flutter clinical platform (radiobiology, dosimetry constraints, OTR workflows, FHIR integration). ROMAS Wire is an editorial / media surface — Next.js + Cloudflare Workers + Supabase + TTS pipeline. The two systems share branding ("ROMAS") and editorial domain (radiation oncology) but have **zero runtime coupling** in any direction:

- ROMAS Wire never calls ROMAS COS APIs (no clinical data ingestion path).
- ROMAS COS never calls ROMAS Wire APIs (no editorial publication path into clinical workflows).
- The only shared concepts are brand and domain vocabulary, both documented in copy/style guides, not in code.

Cycle-6 surfaced REL-010 — an unverified cross-monorepo import for `llm-orchestrator`. The `packages/llm-orchestrator/` Python package lives in ROMAS COS and is referenced in ADR-0013 as the LATAM translation verification surface. Cross-monorepo imports are fragile (different `pnpm-workspace.yaml`, different lockfiles, different CI environments, different deploy targets, different secret stores).

## Decision

ROMAS Wire becomes a **standalone git repository** with no path dependency on the parent ROMAS COS monorepo.

| Field | Value |
|---|---|
| Local path | `D:\dev\projects\romas-brief\` (lowercase, hyphen, no spaces — matches `romasbrief.com` canonical; avoids tooling issues with spaces in path) |
| GitHub identity | `AllienNova/romas-brief` (private) |
| Branch model | `main` for production, feature branches per CLAUDE.md §10 |
| Tech stack | TypeScript / Node 20+ / Next.js / Cloudflare Workers / Supabase — unchanged from cycle-1 ADR-0001 |
| `llm-orchestrator` resolution (REL-010) | Author fresh `packages/llm-orchestrator/` inside ROMAS Wire monorepo. Do NOT import from parent ROMAS COS. The two packages may share design and vocabulary but are independent codebases on independent deploy cycles. |
| Deploy independence | ROMAS Wire CI/CD (GitHub Actions → Cloudflare Pages + Workers) is fully separate from ROMAS COS CI/CD (Azure / Docker / K8s). No shared build cache, no shared secrets, no shared deployment pipeline. |
| Shared assets | Brand guidelines, source-domain ontology, regulatory glossary — duplicated by copy at audit-time (not by code import). Drift is acceptable; the two systems serve different audiences. |

## Consequences

### Positive
- **No cross-monorepo import fragility.** Each repo has its own `package.json`, `tsconfig.json`, deploy targets.
- **Smaller blast radius.** A ROMAS COS deploy cannot break ROMAS Wire, and vice versa.
- **Independent versioning.** ROMAS Wire at `v1.x` is decoupled from ROMAS COS at any version.
- **Clearer ownership boundary.** Editorial + media changes route to ROMAS Wire; clinical changes route to ROMAS COS.
- **Faster CI.** ROMAS Wire CI does not need to pull or test Python services it doesn't use.
- **PIPL / data-localization separation.** ROMAS Wire subscriber data (Beehiiv-side) is fully separate from any future ROMAS COS PHI / clinical data — clean compliance boundary.

### Negative
- **Some duplication.** Source-domain ontology, regulatory glossary, brand tokens may diverge over time. Mitigation: quarterly drift-audit.
- **Two repos to bootstrap.** Two `.env.example`, two `gh repo create`, two CI configs, two secret-stores. One-time cost.
- **`llm-orchestrator` duplication.** The Python `llm-orchestrator` package in ROMAS COS and the new TypeScript `llm-orchestrator` package in ROMAS Wire share design intent but are independent implementations. Acceptable: Python runtime in COS, Node runtime in Brief — they couldn't share code anyway.

## Alternatives considered

### Alternative A — Keep ROMAS Wire inside parent ROMAS monorepo
**Rejected.** ROMAS COS uses Python + pnpm hybrid; ROMAS Wire is pure TypeScript. Mixed tooling already creates friction. Cross-team commits (clinical PRs touching editorial files, editorial PRs touching clinical files) would muddy `git log` and code review. Parent ROMAS has a service-mesh deploy posture (AKS + Helm); ROMAS Wire deploys to Cloudflare Pages + Workers — different infrastructure entirely.

### Alternative B — Separate repo, but import `llm-orchestrator` from ROMAS COS as a published package
**Rejected.** Requires publishing the Python `llm-orchestrator` to a private package registry, paying for hosting, and locking the cross-repo version. Adds dependency-management overhead with zero benefit since the Brief side is TypeScript anyway (Python package would not be importable). The "shared design intent" rationale evaporates at language boundaries.

### Alternative C — Separate repo, copy `llm-orchestrator` Python source into ROMAS Wire
**Rejected.** Would force ROMAS Wire to run a Python sidecar for translation verification. Adds a runtime, adds a Dockerfile, adds a deployment target. ROMAS Wire is Node-only by ADR-0001; introducing Python contradicts that. Author fresh in TypeScript is cleaner.

## Implementation steps

1. **SSOT §3 row 19** — author the separation lock (this PR).
2. **ADR-0014** — author this file (this PR).
3. **ADR-0013 update** — close REL-010 by pointing `llm-orchestrator` to `packages/llm-orchestrator/` inside ROMAS Wire monorepo (see ADR-0013 revision history).
4. **Baseline commit** — `git init` inside current `D:\dev\projects\ROMAS\ROMAS WIRE\` and create an initial commit with all current work so the move is recoverable.
5. **Move** — `mv "D:\dev\projects\ROMAS\ROMAS WIRE" "D:\dev\projects\romas-brief"` if the source directory is not locked by another process. **Windows CWD-lock fallback** (M0c2 D-008): if `mv` returns `Device or resource busy` because the active session holds the source as its working directory, execute the separation via `git clone --no-local "ROMAS/ROMAS WIRE" romas-brief` from the baseline commit instead. The clone produces an identical content + history snapshot at the target path; the old `.git/` and contents are abandoned and cleaned up after the session ends.
6. **Path-reference sweep** — update internal references in `CLAUDE.md`, `docs/build/build-log.md`, `docs/build/handoff-notes.md`, `docs/build/decision-log.md`, `docs/specs/adr/0013-latam-llm-translate.md` to point at the new repo path.
7. **`.gitignore`** — author `.gitignore` covering `node_modules/`, `.env`, `.next/`, `.wrangler/`, `dist/`, build artifacts, OS files.
8. **GitHub repo** — Kimal runs `gh repo create AllienNova/romas-brief --private --source . --remote origin --push` interactively (SSO required).

## Revision triggers

Revisit this ADR if:
- ROMAS COS and ROMAS Wire begin to share runtime data (e.g., editorial output triggers a clinical-workflow notification). → Revisit cross-boundary contract design.
- A third Brief-adjacent product enters scope (e.g., ROMAS Conference, ROMAS Education). → May warrant a deliberate multi-repo strategy with shared tooling repo.
- `llm-orchestrator` design diverges enough that the two implementations stop sharing vocabulary. → Document and accept divergence formally.
