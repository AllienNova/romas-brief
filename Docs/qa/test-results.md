---
title: Test Results — ROMAS Brief
version: 2.0.0
date: 2026-05-31 (cycle-7, code-bearing)
commit: 741c993 (main)
note: Supersedes the 2026-05-14 v1.0.0 plan-level mechanical checks (code-empty repo). This cycle runs real gates + unit suites.
---

# Test Results — ROMAS Brief (team-qa cycle-7)

**Date:** 2026-05-31 · **Commit:** `741c993` (main) · **Runner:** pnpm + Turborepo + Node `node:test`

> Fresh evidence captured this cycle. Per `~/.claude/rules/08`: exit codes + observed output, no weasel words.

## Build / verify gates (full workspace)

| Gate | Command | Exit | Result |
|---|---|---|---|
| Lint | `pnpm turbo run lint` | **0** | all packages pass (`next lint --max-warnings 0` on apps; worker echo-lint per convention) |
| Types | `pnpm turbo run typecheck` | **0** | 12/12 packages `tsc --noEmit` clean |
| Build | `pnpm build` | **0** | apps + workers build; web 76 static pages; worker dry-runs upload clean |
| Security audit | `pnpm audit --audit-level=high` | **0** | **No known vulnerabilities found** (was 14 / 5 high before SHIP-01) |

## Unit suites (`node --experimental-strip-types --test`) — 9 files, all pass

| Suite | Cases | Status |
|---|---|---|
| `packages/shared/src/signal-scoring.test.ts` | 8 | ✅ pass |
| `apps/web/lib/markdown.test.ts` | 8 | ✅ pass (XSS: script/img-onerror escaped, javascript:/data: dropped) |
| `workers/beehiiv-webhook/src/sync.test.ts` | 29 | ✅ pass |
| `workers/email-canary/src/{svix,templates,resend,subscribers}.test.ts` | 35 | ✅ pass |
| `workers/audio-producer/src/lib.test.ts` | 8 | ✅ pass |
| `workers/rss-publisher/src/lib.test.ts` | 8 | ✅ pass |
| **Total** | **~96** | **all green** |

Per-suite counts captured at each SHIP-task verification; a consolidated re-run on `741c993` shows 0 failures across all 9 files.

## DB tests (pgTAP) — run in deploy-migrations CI (not against live this cycle)

| File | Scope |
|---|---|
| `supabase/tests/{bucket_a_constraints,enums_and_lengths,indexes,inviolable_rules,rls_and_triggers}.sql` | 79 assertions (schema + RLS + triggers) — carried from M1 |
| `supabase/tests/with_check_and_tags.sql` | 3 assertions (SHIP-16: WITH CHECK + gate-#8 tags) — **pending 0012 apply** |

Migration 0012 validated UP+DOWN via a rollback transaction against the live 0011 schema (no persisted change); pgTAP runs post-apply in the deploy pipeline.

## CI status

`.github/workflows/ci.yml` (lint + typecheck + build + `pnpm audit --audit-level=high` hard gates) is **green on `main`** as of SHIP-01/02 (was RED before). CI `test` step still runs the per-worker scripts; full `node:test` wiring into CI is **SHIP-17** (the suites exist + pass locally; CI invocation is the remaining wire-up).

## Gaps (→ SHIP-17 / NO-GO context)

- **No integration tests against a real backend** for the CMS QA gate / Beehiiv / Resend / reader→Supabase paths — only unit + pure-fn tests. QA-critic blocks GO on auth-class surfaces lacking real-backend integration tests.
- **No coverage instrumentation** (`--coverage`) wired — coverage % unmeasured. SHIP-17 adds it.
- **No E2E / Playwright** run — the reader renders mock data without env; real-content E2E needs deploy env + content (P-16/P-21).

## Revision history
- 2026-05-14 — v1.0.0: plan-level mechanical checks (code-empty repo).
- 2026-05-31 — v2.0.0 cycle-7: fresh evidence on `741c993` after Waves 1–3 (15 SHIP tasks). All gates + 9 unit suites green; integration/E2E/coverage gaps documented.
