---
title: Remediation Plan — ROMAS Brief
version: 1.0.0
date: 2026-05-14
input: docs/specs/gap-analysis.md (19 findings)
---

# Remediation Plan — ROMAS Brief

## Effort × Impact matrix

|  | Low effort | Medium effort | High effort |
|---|---|---|---|
| **High impact** | R-001..R-009 (doc hygiene + scaffold prerequisites) | R-101..R-110, R-213, R-216 | R-211 (watchdog), R-310 (Resend), R-401 (rotation tracker) |
| **Med impact** | R-015 (app-layer subscriber guard) | R-014 (EU fallback chain), R-112 (.env.example + SECRETS.md) | R-005, R-006 (companion docs to author) |
| **Low impact** | R-012 (archive Wire dups), R-017 (Launch Plan version) | R-018 (auto-publish protocol M7) | — |

## Milestones

### M0 — Doc reconciliation (Day -3 to Day -1)

Pre-coding hygiene. All low-effort, fixed in editor-only edits.

| ID | Gap | Task | Owner | Est | Acceptance |
|---|---|---|---|---|---|
| R-001 | G-001 | Bump `Docs/ROMAS-Brief-Master-Strategy.md` header to **v2.1**; rewrite §1 tagline row to "Radiation oncology, decoded daily."; add SSOT pointer in §0. | doc author | S | A-001 |
| R-002 | G-002 | Bump `Docs/ROMAS-Brief-Daily-Production-Runbook.md` header to **v1.1**; replace Beehiiv mentions (lines 67, 196) with Resend. | doc author | S | A-002 |
| R-003 | G-017 | Bump `Docs/ROMAS-Brief-500-Article-Launch-Plan.md` header to **v1.1**. | doc author | XS | A-003 |
| R-004 | G-008 | Rewrite `Master-Strategy §6.1` and `Runbook §6` to enumerate **all six** inviolable rules in the canonical wording from `docs/SSOT.md §2`. | doc author | S | A-004 |
| R-005 | G-012 | Move `Docs/ROMAS-Wire-Master-Strategy.md`, ` (1).md`, ` (2).md` into `Docs/ARCHIVE/` with `Docs/ARCHIVE/RETIRED-DO-NOT-USE.md` notice. Reference superseded-by line in each. | doc author | S | A-005 |
| R-006 | G-006 | Lock podcast launch day per SSOT §10 Q2: Day 14 = Daily Brief, Day 30–45 = Podcast. Update CLAUDE.md §3 ledger row 6, CLAUDE.md §5 audio-tier table, AGENT.md §3 Phase 8, AGENT.md §13 line 210, `friday-read-format.md:21`. Await Kimal sign-off; flag as **(hypothesis until confirmed)**. | doc author + Kimal | S | A-006 |
| R-007 | G-007 | Promote `.claude/skills/source-ingestion.md` to **canonical source list**. Update CLAUDE.md §9 to point there. Add canonicalization line to the skill file's frontmatter. | doc author | S | A-007 |
| R-014 | G-014 | **MOVED FROM M6 to M0 per cycle-1 critic F-P1-04.** Ban `meddeviceguide.com` and `MDCG.eu` as primary sources. Document EU official fallback chain (EUDAMED API → NB-OG register → MDCG official PDF only) in `regulatory-analyst` skill and update Launch Plan §7 fallback wording. | regulatory-analyst + doc author | S | A-139 |

**Done definition for M0**: All eight tasks closed. `docs/specs/test-qa-plan.md` A-001 through A-007 pass on a fresh checkout.

### M1 — Foundation (Day -7 to Day 0)

Repo scaffold, DB, secrets, first cron, first deploy pipeline.

| ID | Gap | Task | Owner | Est | Acceptance |
|---|---|---|---|---|---|
| R-101 | G-003 | Create `package.json` (root, private) + `pnpm-workspace.yaml` + `turbo.json` + `tsconfig.base.json` | scaffold | S | A-101 |
| R-102 | G-003 | Create `apps/cms`, `apps/reader`, `workers/cron-ingest` workspace stubs with Next.js + Hono templates | scaffold | M | A-102 |
| R-103 | G-004 | Create `wrangler.toml` with `[[triggers]] crons = ["30 10 * * 1-5"]` for cron-ingest worker + `[env.preview]` + `[env.production]` blocks | scaffold | S | A-103 |
| R-104 | G-003 | Create Supabase project (preview + prod); generate `supabase/migrations/0001_init_articles.sql` through `0010_rls_policies.sql` per `cms-schema.md` lines 332-344 | cms-engineer | L | A-104..A-113 |
| R-105 | G-003 | Add pgTAP schema-constraint tests for `audio_publish_requires_qa`, `articles_primary_source_required`, `articles_embargo_consistency`, `articles_insight_labeled`, `audio_revoke_requires_reason`, `audio_skip_requires_reason` | cms-engineer | M | A-114..A-119 |
| R-106 | G-003 | Create `.github/workflows/ci.yml` (lint + typecheck + test + build), `deploy-pages.yml`, `deploy-workers.yml`, `deploy-migrations.yml` (Supabase CLI) | DevOps | M | A-120..A-123 |
| R-005 | G-005 | Author `Docs/ROMAS-Brief-Design-Specification.md v1.1` (Kimal-authored or design-system-keeper agent drafts) | design-system-keeper + Kimal | L | A-005 |
| R-006-A | G-005 | Author `Docs/ROMAS-Brief-Audio-Architecture.md v1.0` (formalize what's already in audio-production-pipeline + audio-qa-checklist into a top-level doc) | audio-producer + Kimal | M | A-005 |
| R-110 | G-013 | Create `Docs/voice-consent-registry.md` — voice donor identity, commercial-use scope (indefinite or time-bounded), withdrawal procedure, fallback voice ID. Pre-launch gate. | Kimal (legal) | M | A-124 |
| R-111 | G-019 | Create `.env.example` listing all 11 audio env vars + Supabase + Resend + Cloudflare API token + Sentry DSN | DevOps | S | A-125 |
| R-112 | G-019 | Create `SECRETS.md` — rotation policy (90d routine, immediate on personnel change), where each secret lives (Cloudflare Secrets / Supabase Vault / GitHub Actions secrets), 1Password rotation runbook | DevOps + Kimal | S | A-126 |
| R-113 | G-003 | Add `apps/reader/app/page.tsx` placeholder (renders SSOT-locked tagline) + `apps/cms/app/page.tsx` placeholder (Cloudflare Access-gated) | web-engineer | S | A-127 |
| R-114 | G-003 | Wire Supabase Auth + RLS to apps/cms; seed `qa_reviewers` with Kimal | cms-engineer | M | A-128 |

**Done definition for M1**: Repo passes G1 lint, G2 typecheck, G4 build green. Supabase migrations 0001–0010 apply clean. pgTAP schema tests green. Voice consent registry signed by Kimal. `.env.example` + `SECRETS.md` in place. First cron-ingest deploy lands and successfully fetches one source.

### M2 — Audio pipeline + QA gate + Audio Brief tier (Day 0 to Day 7)

| ID | Gap | Task | Owner | Est | Acceptance |
|---|---|---|---|---|---|
| R-201 | — | Build `workers/audio-producer` with ElevenLabs primary + 3-retry exponential backoff (1s/4s/16s) + PlayHT failover; never silently swap voices (audio-production-pipeline.md:91-97) | audio-producer | L | A-020..A-024 |
| R-202 | G-016 | Implement two-pass ffmpeg `loudnorm` measurement; **write `loudness_lufs` + `true_peak_dbtp` to `audio_jobs` table**; reject if outside -17 to -15 LUFS or TP > -1 dBTP | audio-producer | M | A-025, A-216 |
| R-203 | — | Implement Whisper large-v3 transcript step; upload TXT + SRT to R2; set `transcript_url` | audio-producer | M | A-026 |
| R-204 | — | R2 upload to `romas-audio-archive` (WAV master) + `romas-audio-cdn` (MP3 public); confirmed by storage receipt | audio-producer | M | A-027 |
| R-205 | — | Pre-roll insertion ("From ROMAS Intelligence...") on every Audio Brief; post-roll ("Not headlines.") only on Podcast tier | audio-producer | S | A-028 |
| R-206 | — | Lexicon application (`packages/audio` + `pronunciation-lexicon` skill); unknown terms enter `lexicon_proposals` table | audio-producer + cms-engineer | M | A-029 |
| R-207 | — | CMS QA UI: list `audio_status = in_review` jobs; reviewer ticks `clinical_claims_checked`, picks `qa_reviewer = self`, hits Publish; UI blocks if any of 4 conditions missing | cms-engineer + web-engineer | L | A-030..A-034 |
| R-211 | G-010 | **NEW** `workers/cdn-purge-watchdog`: cron every minute, finds `revocations` rows with `cdn_purge_at IS NULL AND created_at < now() - interval '90 seconds'`, retries purge, alerts via Sentry + email if still failing | DevOps | M | A-059, A-060 |
| R-212 | — | `workers/rss-publisher` for `audio-brief.xml` (Tier 1); validates with xmllint; regenerates on every `audio_status = published` flip | rss-publisher | M | A-036, A-037 |
| R-213 | G-013 | `audio-producer` reads voice consent registry; if voice ID disabled (consent withdrawn), fall back to standard ElevenLabs voice + log | audio-producer | S | A-129 |

**Done definition for M2**: Audio QA gate enforced at schema + UI + API. CDN purge watchdog deployed and alerting tested with synthetic null. First Audio Brief publishes end-to-end (article → audio → QA → RSS → CDN). Loudness measurement is a recorded number, not an estimate.

### M3 — Reader + Daily Brief tier + Podcast Day 14 (Day 8 to Day 14)

| ID | Gap | Task | Owner | Est | Acceptance |
|---|---|---|---|---|---|
| R-301 | — | `apps/reader` — homepage, article page, Listen page; AudioPlayer Variant A inline + Variant B banner | web-engineer | L | A-043..A-046 |
| R-302 | — | Audio status badge (token-driven `--rb-audio-published/pending/skipped`) on every article reference | web-engineer | S | A-047 |
| R-303 | — | Sponsor firewall: 32px isolation from wordmark; enforced by ESLint rule on `<SponsorBlock>` component | design-system-keeper | M | A-048 |
| R-015 | G-015 | App-layer guard: subscriber count returns qualitative string until total ≥ 2,500. Server component reads `subscriber_count` view; renders count only above threshold. | web-engineer | S | A-130 |
| R-304 | — | Email issue via Resend on every publish; subject = tagline + date; body = top 5 + 10 quick-hits | rss-publisher (or new email worker) | M | A-014 |
| R-305 | — | `daily-brief.xml` RSS publisher (Tier 2) | rss-publisher | M | A-038 |
| R-306 | — | `podcast.xml` RSS publisher (Tier 3) with iTunes/podcast namespace — launches Day 14 *(hypothesis)* | rss-publisher | M | A-039 |
| R-307 | — | Plausible analytics on reader (cookieless) | web-engineer | XS | A-131 |
| R-308 | — | E2E happy-path test: morning-brief → publish → RSS → email → revoke → CDN withdraw (Playwright) | qa | M | A-132 |

**Done definition for M3**: Reader site live with full happy path. Daily Brief and Podcast tier RSS feeds validate. Email delivery via Resend confirmed in production with a 5-recipient test batch. Revoke kill switch SLA measured at <60s p99.

### M4 — Friday ROMAS Read (Day 15 to Day 21)

| ID | Gap | Task | Owner | Est | Acceptance |
|---|---|---|---|---|---|
| R-401 | G-011 | Implement `friday_read_history.json` + `friday_read_predictions.json` writers in `apps/cms` (or as a Worker on Friday lockdown); rotation logic prevents repeats within 4-rubric window | friday-read-editor + cms-engineer | M | A-053..A-055 |
| R-402 | — | Friday issue template + sign-off renderer (`— Kimal`) | web-engineer | S | A-133 |
| R-403 | — | Friday-specific audio path: choose Audio Brief OR Daily Brief; if word count > 1,500 → 10-min audio | audio-producer | M | A-134 |

**Done definition for M4**: First Friday Read ships. Rotation history reflects the 4 sub-rubrics correctly.

### M5 — Weekly Podcast tier (Day 30 to Day 45)

| ID | Gap | Task | Owner | Est | Acceptance |
|---|---|---|---|---|---|
| R-501 | — | Podcast script template (30–60 min); 5 main beats: intro · this week's signal · deep-dive · "What I Got Wrong" recap · sign-off | friday-read-editor + audio-producer | M | A-135 |
| R-502 | — | Podcast post-roll wording lock: "Not headlines. Clinical intelligence." (`audio-production-pipeline.md:44` reference) | audio-producer | XS | A-136 |
| R-503 | — | `podcast.xml` enriched with episode artwork, chapters, show notes | rss-publisher | M | A-137 |
| R-504 | — | Two-reviewer rule activation per AGENT.md §2 — second `audio_qa` reviewer onboarded (hypothesis: Day 30) | Kimal | S | A-138 |

**Done definition for M5**: First weekly Podcast episode lands. Second audio QA reviewer active. Tier-3 feed passes iTunes podcast namespace validation.

### M6 — Conference Brief readiness (Day 45 to Day 60)

| ID | Gap | Task | Owner | Est | Acceptance |
|---|---|---|---|---|---|
| R-601 | — | Conference activation flag per supported conference; cron-aware (ASTRO Sept, ESTRO May, AAPM Jul, JASTRO Nov, RANZCR Oct) | conference-mode-operator | M | A-056 |
| R-602 | — | Embargo lint on `conference-brief.xml`: every item with `embargo_until > now()` triggers refusal | rss-publisher | M | A-057 |
| R-603 | — | Dry-run against synthetic embargoed item set | qa | S | A-058 |

R-014 was relocated to M0 per cycle-1 critic F-P1-04 — the meddeviceguide.com secondary-source workaround cannot remain live for 45–60 days while being a Rule-4 violation. See M0 above.

**Done definition for M6**: Conference Brief tier ready. Embargo lint blocks every synthetic embargoed item.

### M7 — Auto-publish graduation protocol (Day 60+)

| ID | Gap | Task | Owner | Est | Acceptance |
|---|---|---|---|---|---|
| R-018 | G-018 | Document the auto-publish graduation protocol in `AGENT.md §13` decision log entry: requires (a) 60d consecutive <1% correction rate, (b) limited to Literature + Guideline categories, (c) explicit inviolable-rule update + Kimal sign-off in decision log, (d) daily spot-check process retained, (e) revocable on any single material correction | Kimal + cms-engineer | M | A-140 |

**Done definition for M7**: Protocol locked. No code change until criteria met for 60 consecutive days.

## Critical path

```
M0 (R-001..R-007 doc hygiene, ~3 days)
  ↓
M1 R-103 (wrangler.toml + cron config) → R-104 (Supabase migrations) → R-114 (RLS + seed)
  ↓
M2 R-211 (CDN purge watchdog — gates the revoke SLA promise)
  ↓
M2 R-207 (CMS QA UI — gates ALL audio publish for M2, M3, M5, M6)
  ↓
M3 R-308 (E2E happy path proves system works end-to-end)
  ↓
M3 R-306 (podcast.xml Day 14 hypothesis launch)
  ↓
M4 R-401 (Friday rotation tracker)
  ↓
M5 R-504 (second audio QA reviewer activates)
  ↓
M6 R-601 (Conference Brief readiness, gated on first ASTRO/ESTRO window)
```

**Single most fragile node**: R-207 (CMS QA UI). It gates the inviolable Rule 6 in production. If the UI silently allows publish without all 4 conditions, the schema CHECK constraint will reject but UX will be opaque. Test G9 and A-030..A-034 are the hard guardrails.

## Cycle-1 critic P2 tracking (12 items, all addressable in M0/M1 doc + M1 scaffold)

| ID | From | Owner | Milestone |
|---|---|---|---|
| R-P2-01 | F-P2-01 (FR-002/FR-003 tasks misnumbered to T-117/T-119) | doc author | M0 (delivery-plan + product-spec edit) |
| R-P2-02 | F-P2-02 (FR-013 mapping includes wrong tasks T-307/T-308) | doc author | M0 |
| R-P2-03 | F-P2-03 (R-03 risk Impact L → M; remove meddeviceguide.com from mitigation — closed in cycle-2) | — | DONE cycle-2 |
| R-P2-04 | F-P2-04 (Q1-Q6 numbering drift in delivery-plan vs Q1-Q7 in SSOT) | doc author | M0 |
| R-P2-05 | F-P2-05 (pgTAP coverage list omits secondary CHECK constraints — articles.title<=90, claims.confidence, enums) | qa | M1 (R-105 extension) |
| R-P2-06 | F-P2-06 (axe-core severity-level definition: block serious+critical, document moderate as advisory) | doc author + qa | M0 |
| R-P2-07 | F-P2-07 (Cloudflare cache-purge oneOf without discriminator; document tags-form as ROMAS default) | doc author | M0 |
| R-P2-08 | F-P2-08 (ElevenLabs voice-ID deprecation risk row in deployment-plan) | DevOps | M0 |
| R-P2-09 | F-P2-09 (R2 cross-region replication has no owning task; either provision in M1 or drop the 24h RPO commitment) | DevOps | M1 |
| R-P2-10 | F-P2-10 (R-04 risk mitigation conflates rate-limit + Rule-4 controls; split) | doc author | M0 |
| R-P2-11 | F-P2-11 (product-spec open questions omits Q4 voice consent + Q5 observability) | doc author | M0 |
| R-P2-12 | F-P2-12 (no T-32x DNS/domain task in M3) | DevOps | M3 |

These 12 items are tracked but non-blocking. They land in M0–M1 alongside the eight P0/P1 fixes from cycle-2.

## Tracking

- Each remediation R-NNN closes one G-NNN (or, for M1+, a scaffold task).
- Each R-NNN names ≥1 acceptance test A-NNN in `test-qa-plan.md`.
- Closing all P0 + P1 = "production-readiness candidate". Run audit again to confirm.
- `critic-review.md` records the verdict from `team-plan-critic` on this plan (cycle 1 + cycle 2 response).

## Revision history

| Date | Version | Change |
|---|---|---|
| 2026-05-14 | 1.0.0 | Initial remediation plan. Sequenced across M0–M7. Every gap mapped. |
