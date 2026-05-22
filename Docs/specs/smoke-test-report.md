---
title: Smoke Test Report — ROMAS Brief
version: 1.0.0
date: 2026-05-14
status: SKIPPED — no code to smoke test
---

# Smoke Test Report — ROMAS Brief

## Verdict

**SKIPPED.** Repo is code-empty at planning time. No `package.json`, no `supabase/migrations/`, no `wrangler.toml`, no app source. Standard smoke-test commands have nothing to operate on.

## Commands attempted

| Command | Expected | Result |
|---|---|---|
| `pnpm install` | install workspace deps | n/a — no `pnpm-workspace.yaml` |
| `pnpm typecheck` | tsc --noEmit | n/a — no `tsconfig.base.json` |
| `pnpm lint` | eslint + prettier | n/a — no ESLint config |
| `pnpm test` | vitest run | n/a — no test framework wired |
| `pnpm build` | turbo run build | n/a — no Turborepo config |
| `supabase db lint` | schema lint | n/a — no Supabase project |
| `xmllint --noout` on RSS | XML validity | n/a — no RSS feed files |
| `wrangler deploy --dry-run` | Worker package | n/a — no Workers |

## What WAS verified (read-only checks against planning kit)

| Check | Result | Evidence |
|---|---|---|
| File count agreement: 13 agents · 14 skills · 8 commands matches CLAUDE.md §10 | PASS | `Glob` on `.claude/agents/*.md` (13), `.claude/skills/*.md` (14), `.claude/commands/*.md` (8) |
| Six inviolable rules listed in CLAUDE.md §4 | PASS | 6 numbered items present |
| Locked decisions ledger v2.1 has 6 entries in CLAUDE.md §3 | PASS | rows 1-6 present |
| `cms-schema.md` defines 10 migrations in order | PASS | lines 332-344 |
| `audio_publish_requires_qa` CHECK constraint present | PASS | cms-schema.md:96-103 |
| `articles_primary_source_required` CHECK present | PASS | cms-schema.md:57-58 |
| `articles_embargo_consistency` CHECK present | PASS | cms-schema.md:59-60 |
| `articles_insight_labeled` CHECK present | PASS | cms-schema.md:61-62 |
| Audio production pipeline pre-roll + post-roll wording | PASS | audio-production-pipeline.md:43-44 |
| 10-beat structure mandated | PASS | audio-production-pipeline.md:24-39 |

## What CANNOT be verified pre-code

- TTS failover actually fires on ElevenLabs 5xx
- Loudness `loudnorm` two-pass produces values in -17 to -15 range (production target window; DB gate per ADR-0016 is -18 to -14)
- Schema CHECK constraints reject invalid inserts in a live DB
- RSS feeds pass xmllint with iTunes/podcast namespace
- Audio QA flip enforces all 4 conditions (only DB will tell us)
- CDN purge by tag completes within 60s
- Watchdog alerts fire when `cdn_purge_at` null >90s
- Reader page renders correctly (no UI yet)
- Email issue delivers via Resend test mode

These move from "cannot verify" to "PASS / FAIL" as M1–M3 land. The `test-qa-plan.md` A-NNN catalog enumerates the verifications expected per milestone.

## Re-run plan

Re-execute this report after each milestone:

- **End of M1** (foundation): typecheck, lint, build pass; migrations 0001–0010 apply clean; first cron ingest hits at least one source successfully.
- **End of M2** (audio pipeline): audio QA gate enforced; loudness reject paths tested; ElevenLabs→PlayHT failover dry-run; CDN purge by tag works on a test asset.
- **End of M3** (reader + Day-14): full happy path morning-brief → publish → RSS → email; revoke kill switch wall-clock SLA measured.
- **End of M4** (Friday Read): rotation history JSON updates correctly; sub-rubric prediction prevents repeats within window.
- **End of M5** (Podcast tier launch): first weekly podcast episode lands; `podcast.xml` validates against iTunes podcast namespace.
- **End of M6** (Conference Brief readiness): embargo lint trips on a synthetic embargoed item; activation/deactivation flips correctly per conference window.

## Notes

This report is intentionally short because the only verifiable surface at planning time is the documentation kit. The real smoke tests start at M1.

## Revision history

| Date | Version | Change |
|---|---|---|
| 2026-05-14 | 1.0.0 | Initial smoke test report; SKIPPED due to code-empty repo. Re-run plan documented per milestone. |
