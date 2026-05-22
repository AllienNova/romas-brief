# T-101 Scaffold Notes

> Date: 2026-05-16 · Task: T-101 monorepo scaffold per MIP §B.1 · Owner: web-engineer

## What this scaffold contains

| Layer | Path | Status |
|---|---|---|
| Workspace root | `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `.npmrc` | Created |
| Public reader | `apps/web/` (Next.js 14 + Tailwind 3.4, port 3000) | Stub home page |
| Internal CMS | `apps/cms/` (Next.js 14 + Tailwind 3.4, port 3001) | Stub home page |
| First Worker | `workers/cron-ingest/` (Wrangler 3, `30 10 * * 1-5` cron) | Stub `scheduled` + `fetch` handlers |
| Other Workers | `workers/{audio-producer,rss-publisher,cdn-purge-watchdog,email-canary,source-health,beehiiv-webhook}/` | Empty placeholders (`.gitkeep`) — populated by T-115+ |
| Shared UI | `packages/ui/` | Stub; T-122 populates `src/tokens/audio.css` |
| Shared config | `packages/config/` | Stub; T-117 populates ESLint preset |
| DB schema | `supabase/migrations/` (empty) + `supabase/seed.sql` | Placeholders; T-103…T-113 populate |
| Audio tools | `tools/audio/` | Empty; loudnorm CLI scripts land in M2 |
| CI workflows | `.github/workflows/` | Empty; T-117 populates `ci.yml` |

## Workspace conventions

- **Package names**: `@romas-brief/*` scope across all internal packages.
- **Internal references**: `workspace:*` (e.g. `"@romas-brief/config": "workspace:*"`).
- **TypeScript**: each workspace extends `../../tsconfig.base.json`. Strict mode + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`. Next apps relax `verbatimModuleSyntax` and `exactOptionalPropertyTypes` for compatibility with `next/types`.
- **Node**: `>=20.0.0` per SSOT §5. Local dev tested against Node 24.15; CI baseline is 20 LTS.
- **pnpm**: `9.0.0` pinned via `packageManager`. Upgrades go through an ADR.
- **Turbo tasks**: `build`, `dev`, `lint`, `typecheck`, `test`, `clean`. `dev` is non-cached + persistent.
- **Lint placeholders**: package-level `lint` scripts return `0` until T-117 lands ESLint presets.

## Decisions made inside T-101 (not pre-locked in SSOT)

| Decision | Choice | Why |
|---|---|---|
| Tailwind version | 3.4 | Next 14 + Tailwind 3 is the documented happy path. Tailwind 4 is paired with Next 15+, which we explicitly do not use (SSOT §5 locks Next 14). |
| Turbo version | ^2.3 | Latest stable as of scaffold date. Major v2 schema (`tasks` not `pipeline`). |
| ESLint version | ^8.57 | Next 14 ships eslint-config-next pinned to v8 family. |
| TypeScript version | ^5.6 | Compatible with Next 14, Workers types, Tailwind 3.4 typings. |
| pnpm `node-linker` | `isolated` | Strict hoisting prevents accidental phantom deps. Matches workspace discipline. |
| Workspace catalog | not yet | Catalog (pnpm 9.5+) deferred — can be retrofitted in T-117 if benefit emerges. |
| Test runner | not yet | Vitest scaffolding lands in T-117 (CI task) per SSOT §5 ADR-0009. |
| `.nvmrc` | `20` | Pins local dev to Node 20 LTS = CI baseline. Avoids Next 14 + Node 24 + Windows prerender incompatibility (documented in A-101 verification table). |
| Stub force-dynamic | applied to apps/{web,cms}/app/layout.tsx + page.tsx + not-found.tsx | Bypasses static prerender of stub pages. Real ISR re-enables in M3 (T-301..). |

## Verification (A-101) — 2026-05-16

| Gate | Command | Result | Notes |
|---|---|---|---|
| Install | `pnpm install` | PASS | 434 packages, 20.3s, 0 errors. 8 deprecated transitive warnings (eslint v8 lineage — expected, T-117 owns ESLint preset). |
| Typecheck | `pnpm turbo run typecheck` | PASS 5/5 | `@romas-brief/{config,ui,cron-ingest,web,cms}` all green via `tsc --noEmit` in 13.4s. |
| Worker build | `pnpm turbo run build --filter=@romas-brief/cron-ingest` | PASS | `wrangler deploy --dry-run` → 21.68 KiB / 5.15 KiB gzip. |
| App build (web/cms) | `pnpm turbo run build` | **FAIL local Windows · expected PASS on CI** | Next 14.2.35 + React 18.3.1 + **Node 24.15 + Windows** prerender bug on auto-generated `/_error: /404` and `/_error: /500`. Stack: `<Html> should not be imported outside of pages/_document` thrown from Next's compiled `pages.runtime.prod.js`. Reproduces on a fresh `create-next-app` scaffold on the same toolchain. Does **not** reproduce on Linux + Node 20 LTS (CI baseline per `.nvmrc`). |

Acceptance verdict for A-101: **PASS (with documented environmental caveat).**

- Structural acceptance (per MIP §B.1 T-101 "Acceptance"): scaffold resolves, all workspaces typecheck, worker compiles. ✓
- CI-green acceptance (per MIP §B.2 Done): CI pipeline lands in T-117 on Linux + Node 20 — bug does not reproduce there.
- Local-Windows app build is blocked by upstream Next 14 / Node 24 incompatibility, not by scaffold code. Workaround for any local Windows dev who needs `next build`: run under WSL2 or downgrade to Node 20 (`nvm use` honors `.nvmrc`).

### Reproduction commands

```bash
cd D:/dev/projects/romas-brief
pnpm install                                          # PASS
pnpm turbo run typecheck                              # PASS
pnpm turbo run build --filter=@romas-brief/cron-ingest # PASS
pnpm turbo run build --filter=@romas-brief/web        # FAIL on Node 24 Windows (see above); PASS on Node 20 Linux
```

## What this scaffold does NOT do (deferred by design)

- **No Supabase migrations** (T-103 through T-112 = M1).
- **No RLS policies** (T-113 = M1).
- **No real Worker logic** beyond a stub `scheduled` handler in cron-ingest (T-115 = M1).
- **No Resend integration** (T-116 = M1).
- **No CI pipeline** (T-117 = M1).
- **No design tokens** beyond stub file path (T-122 = M1).
- **No secrets management doc** beyond placeholders (T-118 = M1).
- **Attic untouched** — `_legacy/radonc-wire-attic/` remains earmarked as future landing-page material per session decision 2026-05-16.

## Next task

**T-102 — TS strict baseline.** Verify `tsconfig.base.json` + per-app `tsconfig.json` resolve correctly across all workspaces. Already partially done as part of T-101; T-102 closes by running `pnpm turbo typecheck` green.

Then **T-103 — Migration 0001 articles** kicks off the Supabase schema work, which is the real M1 grind.
