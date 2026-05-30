# ROMAS Brief — Autonomous Execution Queue

**Owner:** Kimal Honour Djam
**Driven by:** `/autonomous-coding` skill (autonomous-drive mode)
**Canonical spec:** `Docs/specs/ship-execution-plan.md` v1.1.1 (team-plan-critic APPROVE WITH CONDITIONS, gate closed)
**What Kimal must provide:** `Docs/specs/provisioning-checklist.md`
**Baseline:** HEAD=dd7f0e0 · **Last regenerated:** 2026-05-29

> This file is the **work queue the autonomous-coding loop drives top-to-bottom**: pick the top open `AUTO` item whose deps are checked → implement → verify (run the `verify:` command) → commit (selective staging) → check it off → next. Full T-NNN/B-XX/RC-NN traceability is the `Merges` column in `ship-execution-plan.md`.
>
> **Legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` BLOCKED (external).
> **Drivability:** `AUTO` = fully autonomous (implement + verify now/after deps) · `AUTO*` = code + unit-test now, but **live** verification needs a provisioning item (noted) · `BLOCKED` = cannot meaningfully start until the named `P-NN` / content lands. The loop **skips** `[!]`/`BLOCKED` items and continues.

---

## ⛔ Hard external blockers (Kimal — see `provisioning-checklist.md`)

The loop runs everything below to completion EXCEPT the tasks gated on these. Provide 🔴 first.

- **[!] P-01/P-02/P-19** ElevenLabs key + 3 voice IDs + signed consent → unblocks **SHIP-27** (audio runtime) + gates #13/#14
- **[!] P-10/P-11** R2 buckets + access keys → unblocks **SHIP-27**
- **[!] P-13/P-16** Cloudflare token/zone + Vercel rewire → unblocks **SHIP-31** (deploy)
- **[!] P-05/P-06/P-14** Beehiiv + Resend keys + DNS → live verification of **SHIP-11/SHIP-12**
- **[!] P-08** Sentry DSN → live alerting in **SHIP-26**
- **[!] P-21..P-24** 500 articles + 50 audio + podcast ep001 + 5 issues (8-wk ramp) → **SHIP-32** launch gate
- **[!] Q-A..Q-F** six decisions (date, LATAM, NA-only, source-health, Friday Read, **TTS failover provider — PlayHT shut down, ADR-0018**) → see provisioning §D + FOUNDERS-BOARD

---

## WAVE 1 — STABILIZE (CI red → green, doc truth)

- [x] **SHIP-01** `AUTO` — Bump `next` 14.2.35 → 15.5.18 + React 19 in `apps/web` + `apps/cms`; async-request-API codemod; cms Supabase factories → async. _verify:_ `pnpm audit --audit-level=high` exit 0 (0 vulns) ✅ · typecheck 12/12 ✅ · lint ✅ · `pnpm build` 9/9 (76 static pages) ✅ (commit b4146ba). _deps:_ —
- [x] **SHIP-02** `AUTO` — Fix lint: `<img>`→`next/image` at `apps/web/app/academy/page.tsx:196` (sweep all `<img>`). _verify:_ `pnpm turbo run lint` exit 0 ✅ (commit cb3adfc). _deps:_ —
- [~] **SHIP-03** `AUTO` — PARTIAL: CI `build` expanded to full graph (apps + all workers) ✅ `ci.yml`. Remaining (deferred to SHIP-17 — tests don't exist yet): real `lint`/`test` scripts in non-stub packages + wire CI `test` to real suites. _verify (done half):_ ci.yml runs `pnpm turbo run build` (no cron-ingest filter). _deps:_ SHIP-01, SHIP-02
- [x] **SHIP-04** `AUTO` (DOC) — Reconciled docs to HEAD: rewrote `CLAUDE.md §12`; closed risk-register B-17/18/20 + split B-19 (cycle-7); appended `qa-report.md` cycle-7; fixed `architecture.md` (apps/reader→apps/web, dropped packages/db, 10→11). _verify:_ grep clean of stale claims ✅ (commit e5657db). _deps:_ —
- [ ] **SHIP-05** `AUTO` — Repo hygiene: gitignore+remove `*.bundle` (3.4 MB), `_legacy/`, `CLAUDE.md.bak.*`; align dev Node to 20. _verify:_ `git status` clean of bundles/legacy; `node -v`=20.x. _deps:_ —

## WAVE 2 — COMPLETE (data + scorer + QA gate + email + Day-1 modules)

- [x] **SHIP-06** `AUTO` — Synced `apps/cms/lib/supabase/types.ts` to the canonical generated types (web's `database.types.ts`, 777 lines, 11 tables + view). MCP gen-types unavailable (no access token) → synced from in-repo canonical. _verify:_ types non-empty; `tsc --noEmit` exit 0 ✅ (commit 4046bcf). _deps:_ —
- [x] **SHIP-07** `AUTO` — Extracted `apps/web/lib/markdown.ts`: escape-input-first + protocol-allowlist hrefs (zero-dep). _verify:_ `node --test markdown.test.ts` 8/8 pass (script/img-onerror escaped, javascript:/data: dropped) · typecheck/build/lint 0 ✅ (commit 338f5f5). _deps:_ —
- [x] **SHIP-08** `AUTO*` — **DONE** (part 1: e527703 · part 2: e898846). 12 routes wired to `articles.ts` (await), generateStaticParams from `getPublishedSlugs`, body-size cap. Verified: typecheck/lint/build 0, MOCK_ARTICLES in routes = 0, data layer proven against live DB (seed→read→delete). Real data when env+content exist; mock fallback otherwise. audio join → SHIP-23. _(superseded part-1 note: e527703):_ `apps/web/lib/articles.ts` data layer (14 DB-backed fns, MockArticle shape, public_read_published RLS, mock fallback, DB↔reader category map); `public.ts` env-var fix (NEXT_PUBLIC_→unprefixed); supabase-js bump for new publishable keys. **Verified** against live DB: seeded→read via anon RLS→deleted (DB back to 0); lint/typecheck/build 0. **Part 2 PENDING**: wire the 12 route files to `await` articles.ts + `generateStaticParams` from `getPublishedSlugs` + `dynamicParams` + body-size cap in `next.config.mjs`; audio_jobs join (has_audio) → listen/SHIP-23. Full render needs content (P-21). _deps:_ SHIP-06, SHIP-07
- [x] **SHIP-09** `AUTO` — DONE (commit e6ae6a9): six-axis engine in `@romas-brief/shared` (`compositeScore`/`scoreBand`/`isPublishable`/`pickTopN`; weights .30/.25/.15/.15/.10/.05; bands match migration 0001 SQL CASE → gate-#5 computable from DB). 8 node:test pass; lint/typecheck/build/audit 0. Closes B-03. **Write-path** (populate `articles.composite_score` on save, formula-derived not hand-assigned) → **SHIP-10** imports this engine. _deps:_ SHIP-06
- [x] **SHIP-10** `AUTO` — DONE (commit 57b75f8): CMS audio-QA UI. `lib/audio-qa-gate.ts` (pure `evaluatePublishGate`, single source of truth, === DB CHECK: clinical_claims_checked, qa_reviewer, loudness [-18,-14], true_peak<=-1, transcript_url); QA-queue + `audio-qa/[id]` pages; `AudioQAChecklist` + `AudioStatusBadge` (6-state); `api/audio-qa/[id]` POST publish/skip/revoke with server-side gate (422), state-machine guards (409), reason-required (400), RLS/CHECK 403. typecheck/lint/build 0. _Follow-on:_ live publish needs authed audio_qa reviewer session; composite_score write-path is an article-edit flow (separate). _deps:_ SHIP-06
- [x] **SHIP-11** `AUTO*` (live sync needs P-05) — DONE (commit b83a7ca): `beehiiv-webhook` worker — **shared-secret custom-header auth (Beehiiv has no HMAC, ADR-0019)**, subscriber sync (event→status map), idempotent email-upsert via service role, 500-on-failure Beehiiv-retry posture. 29 node:test pass; typecheck/build 0. _Follow-on:_ Cloudflare-Queue DLQ + uid-KV dedup + reconciliation cron (hardening); live needs BEEHIIV_WEBHOOK_SECRET in Beehiiv config + Worker Secret + deployed URL. _deps:_ SHIP-06
- [ ] **SHIP-12** `AUTO*` (live send needs P-06/P-14) — Resend transactional (rename `email-canary`→`email-transactional`): signup/unsub/revocation/reset templates; Svix verify; `Idempotency-Key`. _verify:_ template render + Svix 401 + dedupe tests green. _deps:_ SHIP-06
- [ ] **SHIP-13** `AUTO` — Day-1 homepage data modules: Today's-podcast embed, Trending, Top Papers on real data; Daily Brief roundup worker + `daily-brief.xml`. _verify:_ 3 modules render from DB; daily-brief feed validates. _deps:_ SHIP-08, SHIP-09

## WAVE 3 — HARDEN (correctness FIRST, then tests on corrected code)

- [ ] **SHIP-14** `AUTO` (needs Q-F vendor) — Audio correctness + failover swap (**PlayHT shut down → ADR-0018**): declare `LOUDNORM_ENDPOINT` in `Env`; fail-closed when absent; handle stereo WAV; replace dead PlayHT failover with Q-F provider (Cartesia default); single failover call; retry 1→3 (2s/8s/30s); exhaustion→`skipped`. _verify:_ fail-closed test + single-failover-call test green; `grep -ri playht workers/` = 0. _deps:_ SHIP-08, Q-F
- [ ] **SHIP-15** `AUTO` — Worker fixes: RSS `<enclosure length>`=real R2 byte size; fix `/regenerate` branch; `CDN_BASE_URL` env (drop hardcoded `cdn.romas.brief`); Whisper embargo-gate; NMPA read-only enforce (M-02). _verify:_ Apple Podcasts validator passes; invalid-tier→400; embargo + NMPA tests green. _deps:_ SHIP-08
- [ ] **SHIP-16** `AUTO` — Data-layer hardening: migration 0012 `WITH CHECK` on `editor_publish`+`audio_qa_flip` (+down-migration); audience+region+modality NOT-NULL (gate #8); `AbortSignal.timeout(10000)` on all Supabase calls; cross-edition revocation re-check. _verify:_ pgTAP WITH-CHECK rejects unauthorized writes; 0012 down reverts clean; revoked-never-dispatched test. _deps:_ SHIP-06
- [ ] **SHIP-17** `AUTO` — Test pyramid backfill on corrected code: unit (workers incl. scorer) + integration (CMS QA, Beehiiv, Resend, revocation race) + reader render. Wire CI `test`. _verify:_ `pnpm test` green; coverage ≥60% worker business logic; CI `test` green. _deps:_ SHIP-09, SHIP-10, SHIP-11, SHIP-12, SHIP-14, SHIP-15, SHIP-16
- [ ] **SHIP-18** `AUTO*` (full cascade needs P-05/P-10) — Right-to-erasure endpoint (FR-039): purge subscriber PII across `subscribers` + Beehiiv + R2 (voice-consent→R2 cascade, M-04). _verify:_ erasure test purges PII end-to-end. _deps:_ SHIP-06, SHIP-11
- [ ] **SHIP-19** `AUTO` (Q-D) — source-health decision: fold in cron-ingest (delete stub) or build T-120. _verify:_ decision in architecture.md; stub resolved; path tested. _deps:_ SHIP-04

## WAVE 4 — POLISH (UI/UX, a11y, brand, perf)

- [ ] **SHIP-20** `AUTO` — Token unification: port `--rb-*` tokens (incl audio) to `globals.css`; `dark:` on all inner routes. _verify:_ dark mode correct on all routes (screenshots); one token set. _deps:_ SHIP-08
- [ ] **SHIP-21** `AUTO` — Brand invariants: `SubscriberCount` (hide <2,500); strip emojis from copy; `SponsorBlock` locked labels + 32px firewall. _verify:_ grep: no numeric count, no emoji in copy; `data-firewall=32`. _deps:_ SHIP-08
- [ ] **SHIP-22** `AUTO` — A11y WCAG 2.2 AA: skip link, homepage `<h1>`, `aria-hidden` icons, ≥44px targets, scrubber `aria-valuetext`+keyboard, modal focus trap, reduced-motion on RotatingTopStories. _verify:_ `design:accessibility-review` AA pass; axe 0 criticals. _deps:_ SHIP-20
- [ ] **SHIP-23** `AUTO` — Spec components: `AudioPlayer` Variant A/B with QA-gated status; `AudioStatusBadge` 6-state; real tier/duration; mount/delete `SiteHeader`/`SiteFooter` dead code. _verify:_ player shows 4 statuses; no dead duplicate header. _deps:_ SHIP-10, SHIP-20
- [ ] **SHIP-24** `AUTO` — Performance: AVIF + `srcset` + lazy-load; Web Vitals LCP<2.5s/INP<200ms/CLS<0.1; Plausible events. _verify:_ Lighthouse perf ≥90 on home/article/listen. _deps:_ SHIP-08
- [ ] **SHIP-25** `AUTO` — Reader depth: pgvector search (T-307). _verify:_ search returns ranked DB hits. _deps:_ SHIP-08

## WAVE 5 — SHIP (ops, runtime verify, deploy, launch gate)

- [ ] **SHIP-26** `AUTO*` (live alert needs P-08) — Ops readiness: SLI/SLO per critical surface; wire Sentry + ≥1 alert channel; cold-start runbook; dashboard. _verify:_ forced cron/queue failure fires an alert (test); runbook exists. _deps:_ SHIP-03
- [!] **SHIP-27** `BLOCKED P-01/P-02/P-10/P-11` (+P-03/P-04) — Runtime-verify audio pipeline incl. one full-length Tier-3 episode through the Queue consumer (B-16, gate #14). _verify:_ Audio Brief AND 30–60 min Tier-3 both complete: WAV in archive, MP3 on CDN, transcript, correct LUFS, no sync timeout. _deps:_ SHIP-14, P-01/02/10/11
- [ ] **SHIP-28** `AUTO*` (live kill-switch needs P-12/P-13) — Error/withdrawal pages (404/410-withdrawn/500 `error.tsx`); verify 60s revoke kill-switch. _verify:_ revoke removes article+audio ≤60s (timed test); 410 for revoked slug. _deps:_ SHIP-08
- [ ] **SHIP-29** `AUTO*` (needs infra) — Three-edition publish verify (APAC/EU/Americas UTC); per-region re-rank; wall-clock budget (H-07). _verify:_ each edition fires at correct UTC; re-rank observed; budget model attached. _deps:_ SHIP-13
- [!] **SHIP-30** `AUTO` (after P-01/02) — Lexicon expansion 30→~80. _verify:_ lexicon applied in TTS; pronunciation spot-check. _deps:_ SHIP-27
- [!] **SHIP-31** `BLOCKED P-13/P-16` + all eng — Vercel/Pages rewire to monorepo `apps/web`; migrate env; archive `kimhons/romas-brief-web`. _verify:_ deployed reader serves live DB content from monorepo build. _deps:_ SHIP-08, all KX
- [!] **SHIP-32** `BLOCKED P-21..P-24` (content) + all — Day-1 launch-readiness gate (SSOT §12.8 + ops, 19 rows). _verify:_ all 19 gate rows pass. _deps:_ §5 all
- [ ] **SHIP-33** `AUTO` — Re-run `team-qa` cycle-7 + `/analyze` for GO. _verify:_ verdict GO; `/analyze` health ≥85. _deps:_ SHIP-32

---

## How the autonomous loop should run this

1. **First action:** `TaskCreate` one harness task per `AUTO` item in the current wave (per autonomous-coding mandatory inline task list).
2. Drive **Wave 1 → 2 → 3 → 4** end-to-end — these are almost entirely `AUTO`/`AUTO*` and need **nothing** from Kimal. `AUTO*` items implement + unit-test fully; their live-integration assertion is deferred to when the matching `P-NN` lands (note it, keep moving).
3. At **Wave 5**, drive `SHIP-26/28/29/33` (AUTO) and **stop at the `[!]` blockers** (`SHIP-27/31/32`), reporting which `P-NN` each waits on.
4. Per task: implement → run `verify:` → commit selective paths → check `[x]` here + mark harness task `completed` → next.
5. **Halt only** for the five pause conditions (external dep, irreversible action, real secrets, material fork, queue drains to gated-only). Provisioning blockers are `[!]` skips, not halts.

---

## Appendix — legacy phase tracking

The previous Phase 1–8 / T-NNN checklist (pre-consolidation, cycle-6 framing) is preserved in git history at `HEAD=dd7f0e0:tasks.md`. Every legacy ID maps forward via the **Merges** column in `Docs/specs/ship-execution-plan.md` §2. Do not re-drive the legacy phases — this SHIP-NN queue supersedes them.
