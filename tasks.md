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
- [ ] **SHIP-03** `AUTO` — Real `lint`/`test` scripts in non-stub packages; CI `build` covers apps + 4 real workers; CI `test` wired (goes green after SHIP-17). _verify:_ no `echo "stub"` in non-stub lint/test; CI yaml builds apps+workers. _deps:_ SHIP-01, SHIP-02
- [ ] **SHIP-04** `AUTO` (DOC) — Reconcile docs to HEAD: rewrite `CLAUDE.md §12`; flip `tasks.md`/Phase claims; close risk-register B-17/18/20, split B-19; append `qa-report.md` cycle-7; fix `architecture.md` (apps/reader→apps/web, drop packages/db, 10→11). _verify:_ grep finds none of "NOT IN THIS REPO"/"22-line stub"/"UNTRACKED" in §12. _deps:_ —
- [ ] **SHIP-05** `AUTO` — Repo hygiene: gitignore+remove `*.bundle` (3.4 MB), `_legacy/`, `CLAUDE.md.bak.*`; align dev Node to 20. _verify:_ `git status` clean of bundles/legacy; `node -v`=20.x. _deps:_ —

## WAVE 2 — COMPLETE (data + scorer + QA gate + email + Day-1 modules)

- [ ] **SHIP-06** `AUTO` — Regenerate DB types (Supabase MCP `generate_typescript_types` / `supabase gen types --linked`); replace empty `apps/cms/lib/supabase/types.ts` + `apps/web/lib/supabase/database.types.ts`. _verify:_ types non-empty; `tsc --noEmit` exit 0. _deps:_ —
- [ ] **SHIP-07** `AUTO` — Sanitize markdown at `apps/web/app/article/[slug]/page.tsx:213` (`rehype-sanitize`/DOMPurify). _verify:_ unit test: injected `<script>` + `javascript:` URI render inert. _deps:_ —
- [ ] **SHIP-08** `AUTO*` (full verify needs seeded/live data) — Wire reader to Supabase (replace `@/lib/mock-data`; honor `public_read_published` RLS; `generateStaticParams`→real slugs + `dynamicParams` + ISR). Re-home T-301-B: body-size cap in `next.config.mjs` + Zod at public query boundary. _verify:_ `/article/<seed-slug>` renders DB content; `grep -rl @/lib/mock-data apps/web` = 0; oversized-body + bad-input tests pass. _deps:_ SHIP-06, SHIP-07
- [ ] **SHIP-09** `AUTO` — Implement six-axis Signal-Scoring engine (FR-002/003) in cron-ingest; populate `articles.signal_score`; unit-test composite. Closes B-03. _verify:_ every ingested row scored; `SELECT` reproduces §12.2 buckets; composite unit test green. _deps:_ SHIP-06
- [ ] **SHIP-10** `AUTO` — CMS audio-QA UI (FR-009): article-list, `audio-qa/[id]`, `AudioQAChecklist` (5 conditions), `AudioStatusBadge`, status-flip route validating all 5 (gated by `audio_qa_flip` RLS). _verify:_ integration test proves flip blocked unless all 5 met, allowed when met. _deps:_ SHIP-06
- [ ] **SHIP-11** `AUTO*` (live sync needs P-05) — `beehiiv-webhook`: HMAC verify, subscriber sync, idempotency, DLQ (TTL+retry+escalation), reconciliation worker. _verify:_ bad-sig→401, replay no-op, DLQ test green. _deps:_ SHIP-06
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
