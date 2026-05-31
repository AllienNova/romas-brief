---
title: Gap Analysis — ROMAS Wire
version: 1.0.0
date: 2026-05-14
sources: /team-review synthesis (19 findings) + team-planning audit
---

# Gap Analysis — ROMAS Wire

## Severity scale

- **P0 — blocking**: must fix before /team-build can start (or before any production traffic)
- **P1 — high**: must fix before /team-build M2 ships
- **P2 — medium**: must fix before /team-build M3 ships
- **P3 — low**: polish / hygiene; defer-OK with rationale

## Findings (merged + canonicalized)

| ID | Severity | Category | Description | Evidence | Source | Maps to remediation |
|---|---|---|---|---|---|---|
| G-001 | P0 | Doc-version drift | `Docs/ROMAS-Brief-Master-Strategy.md` header says v2.0; CLAUDE.md §6, AGENT.md §13, README all require v2.1. v2.0 also lists tagline as "Clinical Intelligence for Modern Radiation Oncology" (contradicts locked tagline). | `Docs/ROMAS-Brief-Master-Strategy.md` line 1, `CLAUDE.md` line 96 | review-arch + review-editorial | R-001 |
| G-002 | P0 | Doc-version drift | `Docs/ROMAS-Brief-Daily-Production-Runbook.md` header says v1.0; CLAUDE.md §6 + AGENT.md §13 reference v1.1. | `Docs/ROMAS-Brief-Daily-Production-Runbook.md` line 1 | review-arch + review-security | R-002 |
| G-003 | P0 | Scaffold absent | No `package.json`, `pnpm-workspace.yaml`, `wrangler.toml`, `supabase/migrations/`, `.env.example`, or CI workflow. `cms-schema.md` names 10 migration files; none exist. Dev team cannot start. | Repo root file list | review-arch | R-101 through R-110 (M1) |
| G-004 | P0 | Infrastructure undefined | AGENT.md §3 and Runbook reference cron `10688a27` / session `559a263d` as already-external. No `wrangler.toml`, no GitHub Actions, no runner config exists. Where does the cron run? | `AGENT.md:48`, `Docs/ROMAS-Brief-Daily-Production-Runbook.md:32` | review-arch | R-103 (wrangler.toml with [[triggers]] crons in M1) |
| G-005 | P0 | Companion docs absent | CLAUDE.md §6 + README list `ROMAS-Brief-Design-Specification.md` v1.1 and `ROMAS-Brief-Audio-Architecture.md` v1.0 as required reading. Neither exists. Blocks `design-system-keeper`, `web-engineer`, `audio-producer`. | `Docs/` listing, `CLAUDE.md:107-113` | review-arch + review-editorial | R-005, R-006 (M1) |
| G-006 | P0 | Doc contradiction | Podcast launch day: CLAUDE.md §5 locked ledger says **Day 14**; CLAUDE.md §5 audio-tier table says **Day 30–45**; AGENT.md §3 Phase 8 says **Day 30–45+**; `friday-read-format.md:21` says **Day 14+**. Four inconsistent statements. | `CLAUDE.md:96, 84-92`, `AGENT.md:57, 210`, `friday-read-format.md:21` | review-editorial | R-006 (SSOT §10 hypothesis Q2; Kimal sign-off pending) |
| G-007 | P0 | Source list absent | CLAUDE.md §9 tells agents to "refer to the active cron task spec" for source domains. No such file exists. Agents have no canonical list to operate against. | `CLAUDE.md:188-195` | review-editorial | R-007 (promote `.claude/skills/source-ingestion.md` to canonical via SSOT §6) |
| G-008 | P1 | Inviolable-rule drift | Master Strategy §6.1 and Runbook §6 list **five** inviolable rules (omit audio QA gate Rule 6). CLAUDE.md, AGENT.md, README list **six**. Agent loading only the Docs files operates under weaker constraints. | `Master-Strategy §6.1`, `Runbook §6`, `CLAUDE.md §4`, `AGENT.md §5` | review-security H-01 + review-editorial | R-008 (canonical wording per SSOT §2) |
| G-009 | P1 | Doc contradiction | Email platform: Runbook lines 67, 196 name Beehiiv. CLAUDE.md §7 + AGENT.md §15 line 242 name Resend (or Postmark). | `Docs/ROMAS-Brief-Daily-Production-Runbook.md:67, 196`, `CLAUDE.md:157`, `AGENT.md:242` | review-arch | R-009 (Resend wins, hypothesis Q3) |
| G-010 | P1 | Revoke watchdog absent | CLAUDE.md §5 + audio-production-pipeline.md:129 state a 60s CDN purge SLA on revoke. `revocations.cdn_purge_at` is recorded but no watchdog / alert / retry exists if the purge job fails silently. SLA is meaningless without enforcement. | `cms-schema.md:250-260`, `audio-production-pipeline.md:118-129` | review-security H-02 | R-211 (new `workers/cdn-purge-watchdog` in M2) |
| G-011 | P1 | Rotation state absent | `friday-read-format.md` references `friday_read_history.json` + `friday_read_predictions.json` for sub-rubric rotation. Neither file exists; no agent owns creation. Rotation will drift or repeat. | `friday-read-format.md` (rotation section) | review-editorial | R-401 (assigned to `friday-read-editor` in M4) |
| G-012 | P2 | Doc duplication | `Docs/ROMAS-Wire-Master-Strategy.md` exists in 3 byte-identical copies (`.md`, ` (1).md`, ` (2).md`). All carry retired brand. Master Strategy v2.0 §1 explicitly retires "ROMAS Wire". | `Docs/` listing | all three reviewers | R-005 (archive into `Docs/ARCHIVE/` in M0) |
| G-013 | P2 | Compliance unspoken | ElevenLabs + PlayHT custom/cloned voices: no donor consent file, no commercial-use scope, no fallback voice if consent revoked. Reputational + legal risk for a professional medical product. | `audio-production-pipeline.md:10-11, 160-164` | review-security M-03 | R-213 (voice-consent-registry.md in M1) |
| G-014 | P2 | Primary-source rule violation | Launch Plan §7 lists `meddeviceguide.com` and `MDCG.eu` as fallback "trusted secondary sources" when EUDAMED is partial. Rule 4 requires primary sources only. | `Docs/ROMAS-Brief-500-Article-Launch-Plan.md` §7 | review-security M-04 | R-014 (ban secondary as primary; document official EU fallback chain in regulatory-analyst) |
| G-015 | P2 | RLS posture gap | `subscriber_count` view (`cms-schema.md:277-279`) has no RLS policy. Service-role bypasses RLS by design. Hidden-until-2,500 rule relies on application layer only. | `cms-schema.md:277-279` | review-security L-01 | R-015 (app-layer guard in `apps/reader`) |
| G-016 | P2 | Loudness measurement is estimate | -16 LUFS gate is currently a reviewer manual estimate, not a number measured by `audio-producer` and stored in `audio_jobs.loudness_lufs`. QA judgment can drift. | `audio-qa-checklist.md` C1; `audio-production-pipeline.md:76-88` (measurement defined but value flow to DB undocumented) | review-editorial | R-216 (audio-producer writes `loudness_lufs` + `true_peak_dbtp` to `audio_jobs` in M2) |
| G-017 | P3 | Doc-version drift | `Docs/ROMAS-Brief-500-Article-Launch-Plan.md` header v1.0; CLAUDE.md §6 + README reference v1.1. | `Docs/ROMAS-Brief-500-Article-Launch-Plan.md` line 1 | review-arch | R-003 |
| G-018 | P3 | Decision boundary unclear | Master Strategy §6.2 allows category graduation to auto-publish after 60d <1% correction rate. Not reflected in CLAUDE.md, AGENT.md inviolable rules, or any operational doc. Could silently weaken Rule 6. | `Master-Strategy §6.2` | review-security L-03 | R-701 (M7 decision protocol; explicit inviolable-rule update required) |
| G-019 | P3 | Secrets hygiene | 11 env vars named across skills. No `.env.example`, no `SECRETS.md`, no rotation policy, no secret-store pointer. | `audio-production-pipeline.md:160-171` | review-security L-02 + review-arch | R-112 (.env.example + SECRETS.md in M1) |

## Architectural drift (target vs current)

| Target (per `architecture.md` + SSOT) | Current (per `current-architecture.md`) | Gap |
|---|---|---|
| Monorepo with pnpm + Turborepo | No monorepo | G-003 — M1 |
| Supabase project with 10 migrations | No Supabase project | G-003 — M1 |
| Cloudflare Workers with cron trigger | No workers | G-003, G-004 — M1 |
| 4 RSS feeds in R2 CDN | No feeds | G-003 — M2/M3 |
| Audio QA UI in CMS | No UI | G-003 — M2 |
| CDN purge watchdog | No watchdog | G-010 — M2 |
| Voice consent registry | Not authored | G-013 — M1 |
| Design Spec v1.1 + Audio Architecture v1.0 docs | Absent | G-005 — M1 |

## Missing contracts

The following external integrations have no OpenAPI / JSON Schema / contract file. Derived contracts are written to `docs/specs/contracts/` (see `integration-review.md` for the full set):

- ElevenLabs TTS — `contracts/elevenlabs-tts.yaml` (NEW)
- PlayHT TTS — `contracts/playht-tts.yaml` (NEW)
- Cloudflare cache-purge — `contracts/cloudflare-cache-purge.yaml` (NEW)
- Resend transactional — `contracts/resend.yaml` (NEW)
- openFDA discovery — `contracts/openfda.yaml` (NEW)
- FDA 510(k) DB read — `contracts/fda-510k.yaml` (NEW)
- RSS feed structure per tier — `contracts/rss-audio-brief.xsd`, `contracts/rss-podcast.xsd`, etc. (NEW)
- Supabase database schema — `contracts/supabase-schema.sql` (DERIVED from cms-schema.md)

## Missing ADRs

Decisions visible in CLAUDE.md / AGENT.md / skills but never written as ADRs:

| Decision | ADR proposed |
|---|---|
| pnpm + Turborepo monorepo | ADR-0001 (written) |
| Supabase + Postgres + RLS | ADR-0002 (written) |
| Cloudflare Workers + Pages + R2 | ADR-0003 (written) |
| ElevenLabs primary + PlayHT failover | ADR-0004 (written) |
| Four-tier RSS feeds | ADR-0005 (written) |
| Schema-enforced audio QA state machine | ADR-0006 (written) |
| Resend email (vs Beehiiv vs Postmark) | ADR-0007 (this session) |
| Observability stack (Workers Analytics Engine + Sentry hypothesis) | ADR-0008 (this session) |
| Testing stack (Vitest + Playwright + pgTAP) | ADR-0009 (this session) |
| CI/CD (GitHub Actions + Wrangler + Supabase CLI) | ADR-0010 (this session) |

## Summary by severity

| Severity | Count |
|---|---|
| P0 | 7 |
| P1 | 4 |
| P2 | 5 |
| P3 | 3 |
| **Total** | **19** |

All are addressed in `remediation-plan.md` with explicit milestones (M0–M7) and acceptance-test IDs (A-NNN).

## Revision history

| Date | Version | Change |
|---|---|---|
| 2026-05-14 | 1.0.0 | Initial gap analysis. Merges /team-review's 19 findings into the canonical G-NNN registry, links each to a remediation R-NNN and acceptance A-NNN. |
