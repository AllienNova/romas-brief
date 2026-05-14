# ADR-0001 — Monorepo with pnpm Workspaces + Turborepo

| Field | Value |
|---|---|
| Status | Accepted (locked in this ADR per critic cycle 1 F-P0-02; supersedes prior "Proposed" status) |
| Date | 2026-05-14 |
| Confidence | High |
| Deciders | Kimal Honour Djam (de facto via CLAUDE.md §7 + tech-stack lock); ratified by team-planning cycle-2 PR |
| Sources | CLAUDE.md §7 (stack defaults); architecture.md module table; critic-review.md F-P0-02 |

---

## Context

ROMAS Brief has two frontend apps (`apps/cms`, `apps/reader`), multiple Cloudflare Workers (`workers/cron-ingest`, `workers/audio-producer`, `workers/rss-publisher`, `workers/cdn-purge-watchdog`), shared packages (`packages/db`, `packages/shared`), and tooling scripts (`tools/audio/`). Without a coordinated build tool:

- Shared TypeScript types drift independently across apps and workers.
- Each module runs its own `tsc`, `eslint`, and test suite with no cache sharing.
- CI build times compound linearly with module count.
- Dependency versions diverge (a common source of runtime bugs in TypeScript monorepos).

The codebase is TypeScript strict throughout (CLAUDE.md §7). A monorepo strategy must work within the Cloudflare Workers deployment model, which does not use Node.js `node_modules` bundling in the same way as a standard Node app.

---

## Decision

Use **pnpm workspaces** for dependency management and **Turborepo** for task orchestration and remote caching.

```
ROMAS BRIEF/
├── apps/
│   ├── cms/          (workspace: @romas-brief/cms)
│   └── reader/       (workspace: @romas-brief/reader)
├── workers/
│   ├── cron-ingest/  (workspace: @romas-brief/worker-cron-ingest)
│   ├── audio-producer/
│   ├── rss-publisher/
│   └── cdn-purge-watchdog/
├── packages/
│   ├── db/           (workspace: @romas-brief/db)
│   └── shared/       (workspace: @romas-brief/shared)
├── tools/
│   └── audio/        (workspace: @romas-brief/tools-audio)
├── pnpm-workspace.yaml
└── turbo.json
```

`turbo.json` defines the task pipeline: `build` depends on `^build` (upstream packages first), `typecheck` and `lint` run in parallel, `test` runs after `build`.

---

## Alternatives Considered

### npm workspaces

Rejected. npm workspaces lack the disk-space and install-time efficiency of pnpm's content-addressable store. No built-in task orchestration; would require a separate tool anyway (Turborepo still applies on top, but pnpm is the better workspace manager).

### Nx

Rejected. Nx is the more capable tool for large-scale monorepos but carries significant configuration overhead and generator friction. ROMAS Brief has 10 modules — Turborepo's simpler `turbo.json` pipeline covers the need without the learning surface or binary dependency. If the repo grows to 20+ packages or requires micro-frontend orchestration, reconsider Nx.

### Single package (no monorepo)

Rejected. A flat single package would co-locate apps and workers into one `src/` tree with no boundary enforcement. TypeScript path aliases could simulate packages but would not enforce public API surfaces or enable per-package versioning. As the repo adds workers (conference mode, future tiers), the absence of workspace boundaries becomes a maintenance liability.

### Yarn workspaces + Turborepo

Viable but not chosen. Yarn Berry's PnP mode has known friction with Cloudflare Workers' esbuild bundler. Yarn classic (`v1`) has no advantage over pnpm. pnpm is the lower-friction choice for Workers builds.

---

## Consequences

**Positive**
- Shared types in `packages/shared` are a single source of truth — articles, audio_jobs, state-machine types are imported by both apps and workers.
- Turborepo remote cache reduces CI build time proportionally to cache hit rate; typical 60–80% hit on unchanged modules.
- pnpm lockfile enforces deterministic installs across machines and CI.
- `turbo run typecheck --filter=@romas-brief/db...` lets any module type-check only its dependency graph.

**Negative**
- Cloudflare Workers require bundling (`wrangler` uses esbuild); workspace `node_modules` symlinks must be handled correctly by `wrangler build`. Requires `node_compat = true` or explicit external declarations per worker.
- Team members unfamiliar with pnpm may hit `pnpm add` vs `pnpm add -w` confusion for root vs workspace installs.
- Turborepo remote cache requires a cache endpoint (Vercel Remote Cache or self-hosted); adds infra to configure.

**Neutral**
- Each worker remains a self-contained `wrangler.toml` with its own `[build]` step. Turborepo orchestrates the order but does not replace `wrangler deploy`.

---

## Revisit Triggers

- Cloudflare Workers runtime changes break pnpm workspace symlink resolution and no workaround exists within two sprints.
- Module count exceeds 25 and Turborebo pipeline configuration becomes unmanageable — evaluate Nx at that point.
- Team size grows to 5+ engineers and tooling friction (pnpm/Turborepo confusion) appears in more than two consecutive retrospectives.

---

## Historical Context

The pnpm + Turborepo choice was de-facto present in the CLAUDE.md §7 tech-stack table from the planning kit's inception (2026-05-12 per AGENT.md §13 line 213). It was not the result of a structured comparison at that moment — CLAUDE.md just listed it. Cycle-1 critic flagged the contradiction of marking ADR-0001 "Proposed" while every CI gate (`pnpm lint`, `pnpm turbo build`) hardcoded the tool choice. Cycle-2 promotes Status to Accepted to remove the contradiction: the tooling IS locked; the ADR now reflects that, with confidence High because the rejected alternatives (npm, Nx, single-package, Yarn) have all been considered above and none threaten ROMAS Brief's deployment shape (Cloudflare Workers + pnpm symlink handling) within the next 12 months. Revisit triggers below remain the only conditions under which this lock would reopen.

---

*Accepted 2026-05-14 (cycle-2 promotion from Proposed).*
