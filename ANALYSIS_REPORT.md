# Project Analysis Report: ROMAS Brief

**Date**: 2026-05-28
**Analyst**: RALP Loop Engine (Review → Analyze → Learn → Plan)
**HEAD**: `dd7f0e0` · **Branch**: `main`
**Project Health Score**: **55 / 100** — strong backend foundation, not launch-ready

---

## Executive Summary

ROMAS Brief has a substantial, well-engineered **backend** (3,083 LOC of real worker code: ingestion, audio pipeline, RSS, CDN watchdog) on a clean Supabase schema (11 migrations, deny-by-default RLS, 84 pgTAP assertions). But the system **cannot serve real editorial content end-to-end today**: the reader renders 100% mock data (no route calls Supabase), the CMS audio-QA UI that enforces inviolable Rule 6 does not exist, three workers (Beehiiv/Resend/source-health) are 501 stubs, and there are **zero real automated tests** in the JS/TS workspace. Most urgent: **CI on `main` is currently RED** — `turbo run lint` (exit 1) and `pnpm audit --audit-level=high` (exit 1) both fail under `continue-on-error: false`, meaning the Phase 8 consolidation merged lint-failing, high-CVE code through hard gates. Recommended action: a STABILIZE wave (fix CI red, doc reconciliation) before any further feature work, then wire the reader to Supabase and build the CMS QA gate.

---

## Scorecard

| Dimension | Score | Evidence Summary |
|---|---|---|
| Implementation Completeness | **52/100** | 4/7 workers real; reader is mock-only; CMS QA UI absent; 3 workers + 2 packages stubbed |
| Code Quality | **61/100** | Strong worker discipline; 1 HIGH XSS, 2 HIGH correctness bugs, several MED |
| Security | **62/100** | RLS deny-by-default ✅, secrets clean ✅; 5 high CVEs (audit-gate red), 1 HIGH XSS |
| API Design | **68/100** | Sensible worker HTTP handlers; `/regenerate` unreachable-branch bug; no formal API spec |
| UI/UX Design | **72/100** | Polished homepage; dark mode broken on inner routes; live brand violations |
| Accessibility | **58/100** | No skip link, no homepage `<h1>`, unlabeled emoji icons, sub-44px targets, ~2:1 contrast |
| Integration & Data Flow | **40/100** | Reader↔Supabase NOT wired; CMS `database.types` empty; workers↔Supabase real |
| Performance | **70/100** | 87.3 kB shared JS (good); `<img>` not `next/image`; no image-opt plan |
| Testing | **22/100** | All JS/TS test scripts are `echo` stubs; only 84 pgTAP DB assertions are real |
| DevOps & Infrastructure | **60/100** | Real CI + 3 deploy workflows + wrangler/worker; **CI currently red**; weak test gate |
| Documentation | **45/100** | Extensive (90+ docs) but 4 primary status surfaces stale post-consolidation |
| **OVERALL** | **55/100** | Weighted toward completeness/security/testing/integration for a pre-launch clinical-adjacent platform |

---

## Verified Build/Verify Gates (fresh evidence)

| Gate | Command | Result | Evidence |
|---|---|---|---|
| Lint | `pnpm turbo run lint` | **FAIL (exit 1)** | `apps/web/app/academy/page.tsx:196` `<img>` under `--max-warnings 0`; workers/packages use stub lint (`echo "(M2 stub)…" && exit 0`) |
| Types | `pnpm typecheck` | **PASS** | 12/12 packages, `tsc --noEmit` exit 0 |
| Tests | `pnpm test` | **STUB** | Every JS/TS `test` is `echo "…stub…" && exit 0`; 13 "successful" tasks test nothing |
| Build | `pnpm build` | **PASS** | web: 87.3 kB First Load shared, SSG + dynamic routes prerendered |
| Security audit | `pnpm audit --audit-level=high` | **FAIL (exit 1)** | 14 vulns: 5 high, 7 moderate, 2 low — all 5 high are `next@14.2.35` |
| Secrets (tracked) | `git ls-files \| grep .env` | **CLEAN** | `.env` untracked; no hardcoded keys in `apps/**`, `workers/**`, `packages/**`, `supabase/**` |

**Net: CI on `main` is currently RED.** `.github/workflows/ci.yml:55-72` runs lint and `pnpm audit --audit-level=high` with `continue-on-error: false`; both fail today. The CI `test` step runs the echo-stub scripts (false green) and the `build` step only builds `cron-ingest` (`ci.yml:63`), so app build breaks are not caught on PR.

---

## Plan vs Implementation Delta

✅ Complete · ⚠️ Partial/Diverged · ❌ Missing/Stub

| Planned feature/task | Plan reference | Implementation | Status |
|---|---|---|---|
| M1 schema (11 migrations + RLS + triggers) | `Docs/SSOT.md §3`; `MASTER…:77` | `supabase/migrations/0001..0011` + 5 pgTAP files (84 assertions) | ✅ |
| cron-ingest worker | `tasks.md` Phase 2 T-115 | `workers/cron-ingest/src/index.ts` (766 LOC) | ✅ |
| audio-producer (4-tier TTS → loudnorm → R2 → Whisper) | `tasks.md` Phase 3 T-202 | `workers/audio-producer/src/index.ts` (1,214 LOC) | ⚠️ runtime-unverified; LUFS approx (see CF-08) |
| cdn-purge-watchdog (60s revoke SLA) | `tasks.md` Phase 4 T-211 | `workers/cdn-purge-watchdog/src/index.ts` (415 LOC) | ✅ (hardcoded CDN domain, CF-06) |
| RSS 4-tier feeds | `tasks.md` Phase 4 T-214 | `workers/rss-publisher/src/index.ts` (688 LOC) | ⚠️ `enclosure length="0"` breaks Apple Podcasts |
| Reader surface (home/article/listen/categories/regions/audience) | `tasks.md` Phase 6; FR-024..038 | `apps/web/` 18 routes + 16 components (~2,400 LOC) | ⚠️ **mock data only — no Supabase wiring** |
| CMS audio-QA UI (FR-009 5-condition gate) | `tasks.md` Phase 5 T-209/T-210 | `apps/cms/` = 3 stub files | ❌ **absent — Rule 6 has no operator UI** |
| Beehiiv webhook (HMAC + subscriber sync) | `tasks.md` Phase 7 T-310C; FR-023 | `workers/beehiiv-webhook/src/index.ts` (35 LOC, 501 stub) | ❌ |
| Resend transactional | `tasks.md` Phase 7 T-310A; FR-014A | `workers/email-canary/src/index.ts` (37 LOC, 501 stub; name mismatch) | ❌ |
| source-health worker | T-120 | `workers/source-health/src/index.ts` (35 LOC, 501 stub; logic lives in cron-ingest) | ⚠️ diverged-by-design |
| `packages/ui` design system (AudioPlayer/SponsorBlock/SubscriberCount) | T-122/T-215/T-216/T-312 | `packages/ui/src/index.ts` = one constant; components live in `apps/web/components/` | ❌ |
| Phase 8 consolidation (T-801..809) | `tasks.md:122`; `INTEGRATION-CONTRACT §8` | Executed (`acf5855`/`bb5f004`/`dd7f0e0`) | ✅ but checkboxes still `[ ]` |

---

## Critical Findings (top 10)

1. **CI RED on `main`** — `turbo run lint` exit 1 + `pnpm audit --audit-level=high` exit 1, both `continue-on-error: false` (`ci.yml:55,70`). Phase 8 merged failing code. Violates the constitution's "no issues left behind" rule. **P0.**

2. **Reader serves 100% mock data** — every route imports from `@/lib/mock-data`; `apps/web/lib/supabase/public.ts:createPublicSupabaseClient()` has **zero callers** (dead code). `generateStaticParams()` at `apps/web/app/article/[slug]/page.tsx:22` returns only 20 mock slugs → real article slugs 404 at build. The product cannot display real content. **P0.**

3. **CMS audio-QA UI absent (FR-009)** — `apps/cms/` is 3 placeholder files. Inviolable Rule 6 (no audio ships without QA pass) is enforced by schema CHECK `audio_publish_requires_qa` + RLS `audio_qa_flip` but has **no operator UI** to perform the 5-condition flip. Audio cannot be reviewed/published. **P0.**

4. **Zero real automated tests** — all JS/TS `test` scripts are `echo "…stub…" && exit 0`; only 84 pgTAP DB assertions exist (`supabase/tests/`). CI `test` gate is theater. 1,214 LOC of audio logic and 766 LOC of ingest logic are untested. **P0.**

5. **XSS via unsanitized HTML** — `apps/web/app/article/[slug]/page.tsx:213` `dangerouslySetInnerHTML` renders output of a hand-rolled regex `renderMarkdown()` with no sanitization; a `javascript:` URI or attacker-controlled `body_md` executes in the reader. Fix: `marked`+`DOMPurify` / `rehype-sanitize`. **P1 (becomes P0 the moment the reader is wired to real data).**

6. **`CLAUDE.md §12` wholesale stale (pessimistic drift)** — claims reader "NOT IN THIS REPO" (`:255`), `apps/web` is a "22-line stub" (`:261`), 3 workers "UNTRACKED" (`:266`), consolidation "PENDING" (`:273`). All false post-`acf5855`. A future session would re-do committed work. Also stale: `tasks.md` Phase 8 checkboxes, `risk-register.md` (B-17/18/20 closed but listed open), `qa-report.md` (NO-GO baseline that no longer exists). **P1.**

7. **5 high Next.js CVEs in-tree** — `next@14.2.35` (SSRF via WebSocket upgrades GHSA-8h8q; middleware/proxy bypass GHSA-36qx). `ADR-0015` "accepted risk" cannot satisfy `pnpm audit --audit-level=high`, which hard-fails. The reader is now in-tree, so the precondition for "no RSC code exists" has flipped. **P1.**

8. **Audio loudness is wrong when endpoint unset** — `workers/audio-producer/src/index.ts:582-668` `loudnormInline` measures RMS, not ITU-R BS.1770 integrated loudness; hardcodes LRA 3.1. Reached via silent fallback when `LOUDNORM_ENDPOINT` is missing — accessed through a type-defeating `(env as unknown as Record<string,string>)` cast at `:1008` (not declared in `Env`). Ships incorrect LUFS metadata; the -16 LUFS spec target is unmet and the gate check passes plausible-but-wrong numbers. **P1.**

9. **Live brand-invariant violations** — `apps/web/app/page.tsx:249,521` displays "Join 4,200+ radiation oncology professionals", violating ledger row 5 / FR-020 (hide count until 2,500). Emojis throughout copy (🎧🔬🏥🎙 in `ArticleCard.tsx`, `SiteHeader.tsx`, `page.tsx`) violate CLAUDE.md §2/§8. Both are live at `https://romas-brief-web.vercel.app/`. **P1.**

10. **Beehiiv + Resend unimplemented** — subscriber sync (HMAC webhook, FR-023) and transactional email (signup/unsub/audio-revocation/reset, FR-014A) are 501 stubs. No subscriber lifecycle, no revocation notice. Directory `email-canary` vs planned `email-transactional` name mismatch. **P1.**

---

## Gap Analysis by Category

### Security [62/100]
- **RLS solid** (`supabase/migrations/0011_rls_policies.sql`): deny-by-default, RLS enabled on all 11 tables, 5 named policies, service-role-only surfaces explicit. **Note:** `editor_publish` (`:97`) and `audio_qa_flip` (`:114`) are UPDATE policies with `USING` but **no `WITH CHECK`** — an authorized role can write arbitrary new values; the `audio_publish_requires_qa` schema CHECK backstops the audio path only. Add `WITH CHECK` for defense-in-depth (LOW).
- **Secrets clean**: `.env` untracked + gitignored (`.gitignore:38-40`); no hardcoded keys in tracked source. `.env.example` complete (16 vars). Action still open: rotate the local `.env` ElevenLabs key before Day-1 (CLAUDE.md §12 / NFR-012).
- **XSS** (HIGH): finding #5 above.
- **CVEs** (HIGH): finding #7 — 5 high `next@14.2.35`.
- **Auth gate**: `workers/cron-ingest/src/index.ts:620` manual-trigger handler behind a shared-secret gate (T-115); CI whitelists one `TODO T-115: gate this handler` marker — verify the handler is fully gated before deploy (MED).

### Code Quality [61/100]
Strong: consistent Supabase REST helper pattern, per-failure-mode error handling, retry logic, inviolable-rule enforcement (no auto-publish, embargo filtering). Weak:
- HIGH: XSS (#5); LUFS approximation (#8); `as unknown as` env access (`audio-producer:1008`).
- MED: stereo WAV mishandled in `loudnormInline` (`audio-producer:583-641`); double PlayHT call on failover (`:978-992`); `enclosure length="0"` (`rss-publisher:381`); hardcoded `https://cdn.romas.brief` (`cdn-purge-watchdog:160`); `generateStaticParams` mock-only (`article/[slug]:22`).
- LOW: `/regenerate` unreachable 400 branch (`rss-publisher:601-618`); hardcoded subscriber count (`page.tsx:249`); placeholder podcast/Spotify URLs (`page.tsx:390`); `void` unused-var suppression (`audio-producer:656`).

### API Design [68/100]
Worker HTTP handlers use sensible verbs and 501-for-unimplemented (honest). Gaps: no OpenAPI/schema for worker endpoints; `/regenerate` logic bug; no rate limiting on public worker triggers beyond shared-secret; RSS enclosure spec violation.

### UI/UX Design [72/100]
Polished, sophisticated homepage (rotating modules, carousels, good empty states, responsive `max-w-7xl` + breakpoint discipline). Capped by: **dark mode broken on all inner routes** (article/categories/for/issues/listen hardcode `neutral/teal/white` with no `dark:` variants); **two parallel token systems** (`globals.css --accent #0055CC` vs spec `--rb-accent #00B4C6`; audio tokens #00B4C6/#F59E0B/#94A3B8 absent from code); fake audio tier grouping (`listen/page.tsx:69` hard-assigns `audio_brief`); dead duplicate header (`SiteHeader.tsx` not mounted; `layout.tsx` inline header is live); missing AudioStatusBadge/SponsorBlock/SubscriberCount components; live brand violations (#9).

### Integration & Data Flow [40/100]
The critical path — reader → Supabase — is **not wired**. `apps/cms/lib/supabase/types.ts` is `Record<string, never>` (empty, awaiting `supabase gen types`). Workers → Supabase is real. Schema↔app type drift unresolved. This is the single biggest blocker to a functioning product after CI health.

### Performance [70/100]
Build healthy (87.3 kB shared First Load). `<img>` instead of `next/image` (`academy/page.tsx:196` — also the lint failure); no AVIF/srcset/lazy-load plan (release-checklist item 31 / H-06). Mock data means N+1/index questions are deferred until DB wiring.

### Testing [22/100]
No TS unit/integration tests anywhere. pgTAP covers schema/RLS/triggers (84 assertions, `supabase/tests/`). The promised 88 A-NNN acceptance tests (release-checklist B-02) are unwritten. CI `test` provides false confidence.

### DevOps [60/100]
Real CI (`ci.yml`) + 3 deploy workflows (migrations/pages/workers), wrangler.toml per worker, complete `.env.example`, `SECRETS.md`. But: CI currently red (#1); CI test/build gates weak; **Node version drift** (local `v24.15.0` vs `.nvmrc` 20 / `engines >=20`); ~3.4 MB of untracked `.bundle` backups + 811 KB `_legacy/` cluttering repo root; `CLAUDE.md.bak.*` artifact in tree.

---

## Pattern Analysis

**Recurring themes**
- **Honest stubs, dishonest status docs.** Code stubs return 501 truthfully; the status *documentation* (§12, tasks.md, risk-register, qa-report) lags reality in the *pessimistic* direction — claiming less is done than is committed. This is the more dangerous drift: it invites redundant work.
- **Gates exist but don't bite.** CI runs lint/audit/test, but test is stubbed, build is filtered to one worker, and lint/audit are currently failing — the green-CI signal does not reflect reality.
- **Backend maturity ≫ frontend integration.** Worker code shows senior discipline; the reader is a high-craft *shell* over mock data with no data layer attached.
- **Spec-rich, conformance-poor.** 90+ docs and detailed component specs exist (`Docs/design/components/*.md`), but the implemented reader diverges from them on a11y, tokens, audio status, and brand invariants.

**Root causes**
- Reader was developed in a separate repo (`kimhons/romas-brief-web`) against mock data, then consolidated structurally (files moved) without wiring the data layer or reconciling status docs — a *move*, not an *integration*.
- Test scaffolding was deferred per-milestone ("tests land in T-117/T-217") and never backfilled.
- `pnpm audit --audit-level=high` as a hard gate is incompatible with ADR-0015's "accept the CVE" stance — a process contradiction nobody reconciled.

**Risk profile of the developer**: strong in backend systems (queues, retries, idempotency, RLS), weaker in test discipline, frontend data-integration, and keeping status docs synchronized.

---

## RALP Execution Plan

### Wave 1: STABILIZE — make CI honest and green (P0)
Skill hooks: `/secure`, `/debug`, `/ship`

- **T-1** Fix lint failure: replace `<img>` with `next/image` at `apps/web/app/academy/page.tsx:196`, or scope-justify a disable. Verify `pnpm turbo run lint` exits 0. (P0)
- **T-2** Resolve audit gate vs ADR-0015 contradiction: either bump `next` to `>=15.5.16` (preferred — kills all 5 high CVEs) or add an explicit `pnpm audit` ignore/allowlist that the CI step honors, and update ADR-0015. Verify `pnpm audit --audit-level=high` exits 0. (P0)
- **T-3** Harden CI: make the `test` step run real tests once they exist; expand `build` filter beyond `cron-ingest` to the apps + all real workers. (P1)
- **T-4** Doc reconciliation pass: re-ground `CLAUDE.md §12`, `tasks.md` Phase 5-8 checkboxes, `risk-register.md` (close B-17/18/20, split B-19), append `qa-report.md` cycle-7; fix `architecture.md` (`apps/reader`→`apps/web`, drop `packages/db`, 10→11 migrations). (P1)
- **T-5** Repo hygiene: gitignore/remove `*.bundle` (3.4 MB), `_legacy/`, `CLAUDE.md.bak.*`; align local Node to 20 (`.nvmrc`). (P2)
- *Acceptance*: `ci.yml` passes end-to-end on a fresh run; status docs match `HEAD`.

### Wave 2: COMPLETE — wire data + close the QA gate (P0/P1)
Skill hooks: `/scaffold`, `/api-gen`, `/build`, `supabase:supabase`

- **T-6** Wire reader to Supabase: replace `@/lib/mock-data` reads with `createPublicSupabaseClient()` queries (respecting `public_read_published` RLS); make `generateStaticParams` return real slugs + `dynamicParams = true` + ISR. (P0)
- **T-7** Generate real DB types: `supabase gen types typescript --linked` → replace the empty `apps/cms/lib/supabase/types.ts` and `apps/web/lib/supabase/database.types.ts`. (P0)
- **T-8** Build CMS audio-QA UI (FR-009): `audio-qa/[id]` route + `AudioQAChecklist` (5 conditions: `clinical_claims_checked`, `qa_reviewer`, loudness, true_peak, transcript_url) + status-flip handler gated by `audio_qa_flip` RLS. (P0)
- **T-9** Implement Beehiiv webhook (HMAC-SHA256 verify, idempotent subscriber sync, FR-023). (P1)
- **T-10** Implement Resend transactional templates (signup/unsub/revocation/reset); rename `email-canary`→`email-transactional` or split canary out. (P1)
- *Acceptance*: a real published article renders at `/article/<real-slug>`; an audio job can be QA'd and flipped to `published` through the CMS.

### Wave 3: HARDEN — tests + correctness + integration (P1)
Skill hooks: `/tdd`, `/test`, `/e2e`, `/debug`

- **T-11** Replace echo-stub `test` scripts with real suites: unit tests for cron-ingest dedupe/embargo/relevance, audio-producer TTS/loudnorm/failover, rss-publisher feed generation. Target the test pyramid (60/30/10). (P1)
- **T-12** Fix XSS (#5): sanitize markdown rendering (`marked`+`DOMPurify` or `rehype-sanitize`). (P1)
- **T-13** Fix audio correctness: declare `LOUDNORM_ENDPOINT` in `Env`; **block** production when endpoint absent rather than RMS-fallback; handle stereo WAV; remove double PlayHT call. (P1)
- **T-14** Fix RSS `enclosure length` (real R2 byte size); fix `/regenerate` branch; replace hardcoded `cdn.romas.brief` with `CDN_BASE_URL` env. (P2)
- **T-15** Add `WITH CHECK` to `editor_publish` + `audio_qa_flip` RLS policies. (P2)
- *Acceptance*: `pnpm test` runs real tests with meaningful coverage; XSS path neutralized; audio loudness verified against -16 LUFS.

### Wave 4: POLISH — UI/UX + a11y + brand (P1/P2)
Skill hooks: `/design`, `design:accessibility-review`, `/perf`, `/refactor`

- **T-16** Port spec `--rb-*` tokens into `globals.css`; add `dark:` coverage to all inner routes (one token set). (P1)
- **T-17** Fix brand invariants: remove "4,200+" count (qualitative copy until 2,500); strip emojis from copy; canonical sponsor labels + 32px firewall via real `SponsorBlock`. (P1)
- **T-18** A11y: add skip link, promote homepage lead to `<h1>`, `aria-hidden` on decorative emoji, ≥44px touch targets, scrubber `aria-valuetext`+keyboard seek, modal focus trap/restore, reduced-motion guard on `RotatingTopStories`. (P1)
- **T-19** Build spec components: `AudioStatusBadge` (6-state), `SubscriberCount`, `AudioPlayer` Variant A/B with QA-gated status. Mount or delete `SiteHeader`/`SiteFooter` dead code; derive real audio tier/duration. (P2)
- **T-20** Image optimization: AVIF + responsive srcset + lazy-load below-fold (H-06). (P2)
- *Acceptance*: dark mode correct on every route; `design:accessibility-review` AA pass; zero brand-invariant violations.

### Wave 5: SHIP — launch readiness (P1/P2)
Skill hooks: `/ci-cd`, `/deploy-check`, `/document-release`

- **T-21** Close release-checklist external gates (Kimal): R2 buckets, ElevenLabs key + 3 voice IDs, Resend DKIM/SPF/DMARC, Beehiiv DPA+SCC (B-10), DeepL Pro, voice-consent registry. (P1, external)
- **T-22** Runtime-verify the audio pipeline end-to-end against live R2 + ElevenLabs (the 1,214 LOC is code-complete but never executed). (P1)
- **T-23** Add 404/410-withdrawn/500 `error.tsx` pages; verify the 60s revoke kill-switch end-to-end. (P2)
- **T-24** Scrub banned-source `meddeviceguide.com` from Launch Plan §6 Sample 5 (B-05); resolve `email-transactional` naming. (P2)
- *Acceptance*: `/deploy-check` clean; all SSOT §12.8 Day-1 gates closed.

---

## Skill Activation Sequence

1. `/ship` — establish the true gate baseline (confirms Wave 1 targets)
2. `/secure` — fix lint/audit red + XSS + CVE bump (T-1, T-2, T-12)
3. `supabase:supabase` + `/scaffold` — wire reader + generate types + CMS QA UI (T-6..T-8)
4. `/api-gen` — Beehiiv + Resend workers (T-9, T-10)
5. `/tdd` + `/test` + `/e2e` — backfill the test pyramid (T-11)
6. `/design` + `design:accessibility-review` — tokens, dark mode, a11y, brand (T-16..T-19)
7. `/perf` — image optimization + bundle (T-20)
8. `/deploy-check` + `/document-release` — launch gates + doc sync (Wave 5)

---

## Risk Register (top 5)

| # | Risk | Prob × Impact | Priority | Mitigation |
|---|---|---|---|---|
| 1 | CI red merged to main becomes normalized; further drift ships | H × H | **P0** | Wave 1 T-1/T-2; block merges on green CI |
| 2 | Reader launches still on mock data (no DB wiring done) | M × H | **P0** | Wave 2 T-6/T-7; gate launch on a real-article render test |
| 3 | Audio published without QA UI → Rule 6 bypassed operationally | M × H | **P0** | Wave 2 T-8; do not enable audio publish until CMS gate exists |
| 4 | XSS exploited once reader serves real editorial content | M × H | **P1** | Wave 3 T-12 before T-6 ships to prod |
| 5 | Incorrect audio loudness ships to subscribers (-16 LUFS unmet) | M × M | **P1** | Wave 3 T-13; block production on missing `LOUDNORM_ENDPOINT` |

---

## Methodology Note

Evidence gathered via fresh command runs (typecheck/lint/test/build/audit captured this session, with real exit codes verified independently of pipe artifacts) and four parallel forensic subagents (security, code-quality+completeness, plan-vs-reality delta, UI/UX+a11y), cross-checked against the RLS migration and CI workflow read directly. Every finding cites `file:line` or a command result; no findings were inferred without evidence. Scores reconcile the subagents' dimension scores against first-hand gate evidence.

*RALP never stops: after Wave 5, re-run `/analyze` to re-baseline against the new `HEAD`.*
