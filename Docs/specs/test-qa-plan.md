# ROMAS Wire — Test & QA Plan

**Version**: 1.0.0
**Owner**: QA Lead (this plan) · Kimal final sign-off
**Cited sources**: `CLAUDE.md` v1.1.0 (§4, §5, §7), `AGENT.md` (§3, §11, §12, §15), `.claude/skills/cms-schema.md`, `.claude/skills/audio-production-pipeline.md`, `.claude/skills/audio-qa-checklist.md`, `.claude/skills/rss-feed-spec.md`, `.claude/skills/embargo-handling.md`
**Last updated**: 2026-05-14

---

## 1. Goal & scope

This plan is the verification contract for ROMAS Wire — the public media surface of ROMAS Intelligence. It defines what must be tested, how, at what thresholds, and which gates block merge / deploy / publish. ROMAS Wire sells **clinical intelligence** into a trust market; a single un-cited claim, mispronounced drug, or embargo violation causes irreversible reputational harm. Test discipline is therefore brand discipline.

In scope:

- All packages under `packages/` (signal-scorer, lexicon, audio, rss, schema helpers).
- All apps under `apps/` (reader Next.js surface, internal CMS Next.js surface).
- All Workers under `workers/` (cron-ingest, audio-producer, rss-publisher, cdn-purge-watchdog).
- Supabase migrations under `supabase/migrations/`.
- Schema-enforced constraints (DB level) — treated as load-bearing test surface.

Out of scope:

- PHI handling: **no PHI exists in ROMAS Wire scope**. Patient-identifiable data never enters the pipeline. (Hypothesis: confirmed by `CLAUDE.md` §1 audience and `AGENT.md` §5; the closest data is published clinical-trial results.)
- ROMAS COS clinical platform tests (separate plan).

---

## 2. Test pyramid

| Layer | Share | Tooling | Lives in | What it covers |
|---|---|---|---|---|
| Unit | ~60% | Vitest 2.x | `packages/*/__tests__`, `apps/*/__tests__` | Pure functions — signal-scoring weights, lexicon application, slug generation, RSS XML builders, embargo date logic, BED-style formatters, archetype→audio-length mapping, headline-length guards |
| Integration | ~30% | Vitest + testcontainers-postgres, Supabase local CLI, Cloudflare Workers `unstable_dev` | `packages/*/__tests__/integration`, `workers/*/test` | Supabase queries against a real Postgres instance with full migrations applied, schema-constraint enforcement, Resend test mode, R2 against an S3-compatible mock (Minio or `@miniflare/r2`), Cloudflare cache-purge mock, ffmpeg loudness measurement against fixture WAVs |
| E2E | ~10% | Playwright 1.50+, real Supabase preview branch, real R2 test bucket | `tests/e2e/` | Morning-brief → publish → RSS → revoke → CDN-withdraw flow; audio QA gate happy + soft-reject + skip + revoke paths; reader-surface AudioPlayer state matrix; conference-mode activation |

Tests run in <30s per file locally for the unit + integration layers. E2E budget: <8 min full suite (parallel shards in CI).

---

## 3. Tooling stack

| Concern | Tool | Version anchor |
|---|---|---|
| Unit + integration runner | Vitest | `^2.0.0` |
| Browser E2E | Playwright | `^1.50.0` |
| DB testcontainer | `@testcontainers/postgresql` | `^10` |
| Supabase local | Supabase CLI | `>= 1.180.0` (hypothesis — confirm at scaffold) |
| RSS validation | `xmllint --schema` + Apple `validator.podcasts.apple.com` (CI) + Podcast Index validator | OS-installed |
| Loudness measurement | `ffmpeg` with `loudnorm` filter, two-pass per `.claude/skills/audio-production-pipeline.md` lines 78-86 | `>= 6.0` |
| Accessibility | `pa11y-ci` (every reader route) + `@axe-core/playwright` (in-test assertions) | latest |
| Visual regression | Playwright `toHaveScreenshot()` with masked dynamic regions, Percy optional | built-in |
| Secrets scanning | `gitleaks` (CI) + `trufflehog` (advisory) | latest |
| Static analysis | `semgrep --config=p/owasp-top-ten --config=p/typescript` on staged diff | latest |
| SQL constraint testing | `pg_prove` (pgTAP) for constraint-level assertions | latest |
| Mutation testing | Stryker (advisory, weekly nightly only) | latest |

---

## 4. Coverage thresholds

| Surface | Statements | Branches | Notes |
|---|---|---|---|
| `packages/signal-scorer` | 90% | 85% | Pure math, must be near-total. |
| `packages/lexicon`, `packages/rss`, `packages/audio` | 85% | 80% | Pipeline criticality. |
| Other `packages/*` | 80% | 75% | Default. |
| `apps/reader`, `apps/cms` | 70% | 65% | Heavy UI; coverage supplemented by E2E + visual regression. |
| `workers/*` | 80% | 75% | Cron + queue handlers. |
| `supabase/migrations` constraints | **100%** | n/a | Every CHECK / UNIQUE / FK has a pgTAP test. Schema constraints are the hardest gates per `.claude/skills/cms-schema.md` §"Critical invariants". |

CI fails the PR if any threshold is missed by >2 percentage points. Coverage report uploaded to PR as a comment.

---

## 5. Quality gates (ordered, blocking)

Run in order. Any failure short-circuits the pipeline — fix → restart from G1. No `continue-on-error`. No admin-merging past a red check. Per the user-global "Working Agreements" rule 9: no issues left behind.

| Gate | Command | Pass criterion | Blocking |
|---|---|---|---|
| **G1** Lint | `pnpm lint` (ESLint + Prettier) | Zero warnings, zero errors. `--max-warnings=0`. | Yes |
| **G2** Typecheck | `pnpm typecheck` (tsc `--noEmit --strict`) | Zero errors. No `any` introduced in the diff. | Yes |
| **G3** Unit + integration | `pnpm test` (Vitest) | All green. Coverage at or above §4 thresholds. | Yes |
| **G4** Build | `pnpm turbo build` | All packages + apps build clean. | Yes |
| **G5** Security audit | `pnpm audit --audit-level=high` + `semgrep` on staged diff + `gitleaks detect --staged` | Zero high/critical advisories; zero semgrep findings on the staged diff; zero secrets. | Yes |
| **G6** No TODOs / FIXMEs / placeholders in changed files | `rg -n "TODO\|FIXME\|HACK\|XXX\|<placeholder>" -- <changed-files>` | Zero matches. | Yes |
| **G7** No secrets | `gitleaks detect --staged --redact` | Zero findings. `.env` never staged. | Yes |
| **G8** Device test for UI changes | Playwright launches reader + CMS; screenshots `home`, `article`, `listen`, `cms-issue-editor`, `audioplayer-states` | Screens render, no console errors, axe-core finds zero serious violations on touched routes. | Yes for UI changes; N/A otherwise |
| **G9** Schema-constraint tests pass | `pg_prove supabase/tests/*.sql` against testcontainer Postgres | All constraint negative tests fire as expected (insert that violates → reject). | Yes |
| **G10** RSS lint | `xmllint --noout` per feed + Atom 1.0 schema check + iTunes podcast namespace presence for `podcast.xml` + embargo lint for `conference-brief.xml` | All feeds well-formed, embargo lint reports zero embargoed items in conference feed. | Yes |

**Gate enforcement matrix** (advisory vs blocking by environment):

| Gate | PR | main-merge | staging | production |
|---|---|---|---|---|
| G1–G7 | block | block | block | block |
| G8 (device) | block on UI diff | block | block | block |
| G9 (schema) | block | block | block | block |
| G10 (RSS) | warn if no RSS diff, block if feed changed | block | block | block |
| Visual regression | warn | **block on >5% diff (tracked routes only)** | block on >5% diff | block on >5% diff |
| Lighthouse perf budget | warn | warn | warn | block on regression >10% |

---

## 6. Acceptance test catalog (A-NNN)

Each row maps to a milestone (M0 = doc hygiene baseline; M1 = schema + migrations; M2 = signal-scorer + ingestion; M3 = audio pipeline; M4 = QA gate; M5 = RSS + reader; M6 = conference + Friday Read; M7 = revoke watchdog + observability). Level: U = unit, I = integration, E = E2E.

### 6.1 Doc-hygiene gates (M0)

| ID | Title | Lvl | Given / When / Then | Source |
|---|---|---|---|---|
| A-001 | No v1.0 / v2.0 drift in master strategy refs | U | Given any markdown under `Docs/` or `docs/`; When grep for "v1.0" or "v2.0 (legacy)"; Then zero matches outside `Docs/ARCHIVE/` | `CLAUDE.md` v1.1.0 §3 ledger |
| A-002 | Six inviolable rules listed verbatim | U | Given `CLAUDE.md`; When parse §4; Then exactly 6 numbered rules matching wording in `AGENT.md` §5 | `CLAUDE.md` §4 / `AGENT.md` §5 |
| A-003 | No retired "ROMAS Wire" brand references | U | Given any source file or doc except `Docs/ARCHIVE/`; When grep `\bROMAS Wire\b`; Then zero matches | `CLAUDE.md` §2 (no drift) |
| A-004 | Tagline consistent across surfaces | U | Given homepage component + email template + RSS channel `<itunes:summary>`; When extract tagline string; Then all three equal "Radiation oncology, decoded daily." | `CLAUDE.md` §2; `rss-feed-spec.md` line 55 |
| A-005 | Podcast positioning line scope guard | U | Given any non-podcast surface (homepage, email, AudioPlayer brief banner); When grep "Not headlines. Clinical intelligence."; Then zero matches | `CLAUDE.md` §2 |
| A-006 | No banned vocabulary in copy | U | Given any markdown / .tsx in copy paths; When grep `\b(scrape|revolutionary|groundbreaking|game-changer)\b`; Then zero matches (or quoted-only with surrounding citation) | `CLAUDE.md` §2, `AGENT.md` §14 |
| A-007 | No emojis in copy or metadata | U | Given any prose source; When emoji-regex scan; Then zero matches | `audio-qa-checklist.md` E2 |
| A-008 | Sign-off uses em-dash + first name | U | Given Friday Read template + email footer; When extract sign-off; Then equals `— Kimal` exactly | `CLAUDE.md` §1, §8 |

### 6.2 Schema constraints (M1)

| ID | Title | Lvl | Given / When / Then | Source |
|---|---|---|---|---|
| A-009 | Migrations 0001..0010 apply in order against a fresh Supabase branch with no errors | I (pgTAP) | Given a fresh Supabase project (or local branch); When apply migrations 0001 through 0010 in numeric order via `supabase db push --include-all`; Then exit code is 0 and `set_updated_at()` function exists before migration 0009 creates the `subscribers_set_updated` trigger that references it. Regression test for M0c2 P0 fix (Build Savage BS-1, 2026-05-15) where the original schema had the function defined after migration 0010 RLS policies, causing 0009 to fail with "function set_updated_at() does not exist". | `Docs/specs/contracts/supabase-schema.sql:300-315` + `docs/build/critic-review.md` BS-1 |
| A-010 | `articles.primary_source_url` NOT NULL enforced | I (pgTAP) | Given fresh DB; When `INSERT INTO articles (...) VALUES (..., primary_source_url=NULL, ...)`; Then constraint violation `articles_primary_source_required` | `cms-schema.md` lines 57-58 |
| A-011 | `articles_embargo_consistency` blocks embargoed-without-date | I (pgTAP) | Given fresh DB; When `INSERT` with `embargoed=true, embargo_until=NULL`; Then constraint violation | `cms-schema.md` lines 59-60 |
| A-012 | `articles_insight_labeled` blocks unlabeled insight | I (pgTAP) | Given fresh DB; When `INSERT` with `romas_insight='X', romas_insight_labeled=false`; Then constraint violation | `cms-schema.md` lines 61-62 |
| A-013 | `audio_publish_requires_qa` blocks early publish — qa_reviewer null | I (pgTAP) | Given audio_jobs row in_review with `qa_reviewer=NULL`; When `UPDATE audio_status='published'`; Then constraint violation `audio_publish_requires_qa` | `cms-schema.md` lines 96-103 |
| A-014 | `audio_publish_requires_qa` blocks — clinical_claims_checked false | I (pgTAP) | Given row with claims_checked=false; When publish; Then violation | `cms-schema.md` line 98 |
| A-015 | `audio_publish_requires_qa` blocks — loudness out of band | I (pgTAP) | Given row with `loudness_lufs=-14.0`; When publish; Then violation | `cms-schema.md` line 100 |
| A-016 | `audio_publish_requires_qa` blocks — true_peak too hot | I (pgTAP) | Given row with `true_peak_dbtp=-0.5`; When publish; Then violation | `cms-schema.md` line 101 |
| A-017 | `audio_publish_requires_qa` blocks — transcript_url null | I (pgTAP) | Given row with `transcript_url=NULL`; When publish; Then violation | `cms-schema.md` line 102 |
| A-018 | `audio_revoke_requires_reason` enforced | I (pgTAP) | Given published row; When `UPDATE audio_status='revoked', revoke_reason=NULL`; Then violation | `cms-schema.md` lines 104-106 |
| A-019 | `audio_skip_requires_reason` enforced | I (pgTAP) | Given queued row; When skip with no reason; Then violation | `cms-schema.md` lines 107-109 |

### 6.3 Audio pipeline (M3)

| ID | Title | Lvl | Given / When / Then | Source |
|---|---|---|---|---|
| A-020 | 10-beat structure check — all beats present | U | Given a draft script; When run beat-extractor; Then exactly 10 beats in order 1–10 | `audio-production-pipeline.md` lines 24-39; `AGENT.md` §7 |
| A-021 | 10-beat structure — skip requires override note | U | Given a 9-beat script; When validate; Then fails unless `audio_jobs.notes` contains `override:beat-skip` token | `audio-production-pipeline.md` line 39 |
| A-022 | Lexicon application — drug names | U | Given script containing "Lutathera" and "Pluvicto"; When apply lexicon SSML substitution; Then both terms wrapped per lexicon entries | `pronunciation-lexicon` skill; `audio-qa-checklist.md` B1 |
| A-023 | Lexicon application — vendor names | U | Given script with "Elekta", "Varian", "ViewRay", "RaySearch"; When apply; Then each substituted per lexicon | `audio-qa-checklist.md` B2 |
| A-024 | Loudness measurement on fixture WAV | I | Given a fixture 5-min WAV mastered to -16 LUFS; When run two-pass `ffmpeg loudnorm`; Then parsed `integrated_loudness` in [-18, -14] (ADR-0016 DB gate) AND `true_peak <= -1 dBTP`. Pipeline production-target window [-17, -15] verified by audio-qa-reviewer (soft amber outside target, hard reject outside DB gate). | `audio-production-pipeline.md` lines 78-88 |
| A-025 | Loudness rejection on hot fixture | I | Given a fixture WAV at -12 LUFS; When measure; Then pipeline marks failure (`audio_status = skipped` after 2 retries) | `audio-production-pipeline.md` lines 152-153 |
| A-026 | ElevenLabs → PlayHT failover triggers | I | Given mocked ElevenLabs returning 429 three times; When request audio; Then PlayHT path invoked AND `voice_engine_used='playht'` persisted | `audio-production-pipeline.md` lines 91-98 |
| A-027 | PlayHT also failing → skipped | I | Given both providers returning 5xx; When request audio; Then `audio_status='skipped'`, `error` populated, article still ships | `audio-production-pipeline.md` line 152 |
| A-028 | Transcript present before publish | I | Given audio mastered but `transcript_url=NULL`; When attempt publish; Then blocked by A-017 AND surfaced as `MISSING_TRANSCRIPT` | `audio-production-pipeline.md` line 154 |
| A-029 | R2 upload to private archive + public CDN | I | Given mastered WAV + MP3; When pipeline uploads; Then WAV lands in `romas-audio-archive` (private ACL), MP3 in `romas-audio-cdn` (public via CDN) | `audio-production-pipeline.md` lines 100-116 |

Pre-roll insertion verified by **A-031** below.

### 6.4 Audio QA gate (M4)

| ID | Title | Lvl | Given / When / Then | Source |
|---|---|---|---|---|
| A-030 | QA gate blocks all 4 conditions absent | E | Given new audio_job in `generating`; When pipeline finishes but reviewer has not opened review; Then cannot flip to `published` (DB rejects + UI button disabled) | `audio-qa-checklist.md` §A-D; `AGENT.md` §12 flip conditions |
| A-031 | Pre-roll string present in script | U | Given a built brief script; When extract first beat; Then begins with exact pre-roll: "From ROMAS Intelligence — clinical intelligence for modern radiation oncology." | `audio-production-pipeline.md` line 43; C6 in QA checklist |
| A-032 | Only `audio_qa` role can flip to published | E | Given a `fact_checker`-role JWT; When attempt UPDATE `audio_status='published'`; Then RLS denies | `cms-schema.md` "RLS policies"; `audio-qa-checklist.md` §"Identity & access" |
| A-033 | Revoke requires reason at app layer + DB | E | Given a published audio_job; When call `/revoke` endpoint with empty `reason`; Then 400 from app AND DB constraint A-018 would reject | `audio-qa-checklist.md` "REVOKE"; `AGENT.md` §12 |
| A-034 | Revoke triggers CDN purge within 60s | E | Given publish at T0, revoke at T1; When watcher polls; Then CDN HEAD on MP3 URL returns 404 within 60s of revoke time | `audio-production-pipeline.md` line 118; `CLAUDE.md` §4 inviolable rule 6 (audio QA scope) — 60s SLA confirmed `rss-feed-spec.md` line 161 |
| A-035 | Soft-reject path — stays in_review with qa_notes | I | Given a QA review with `outcome='soft_reject'`; When write outcome; Then `audio_status` remains `in_review` AND `qa_notes` populated AND no publish event | `audio-qa-checklist.md` "SOFT REJECT" |

### 6.5 RSS feeds (M5)

| ID | Title | Lvl | Given / When / Then | Source |
|---|---|---|---|---|
| A-036 | Audio Brief feed well-formed | I | Given seeded published audio_jobs; When `generateFeed('audio-brief')`; Then `xmllint --noout` passes AND `<itunes:summary>` ≤ 240 chars AND ≤ 500 items | `rss-feed-spec.md` lines 13, 167 |
| A-037 | Daily Brief feed well-formed + 100-item cap | I | Same as A-036 for `daily-brief.xml`; Then ≤ 100 items, ordered by `pubDate` desc | `rss-feed-spec.md` line 14 |
| A-038 | Podcast feed includes iTunes podcast namespace | I | Given `podcast.xml`; When parse `<rss>` element; Then namespace `xmlns:podcast="https://podcastindex.org/namespace/1.0"` AND `xmlns:itunes=...` both present | `rss-feed-spec.md` lines 22-29 |
| A-039 | Conference Brief embargo lint | I | Given a `conference-brief` audio_job linked to article with `embargoed=true, embargo_until > now()`; When `generateFeed('conference-brief')`; Then item is dropped AND a `EMBARGO_LINT_BLOCKED` audit row is written | `rss-feed-spec.md` lines 148-152; `embargo-handling.md` lines 105-111 |
| A-040 | Revoke removes item from feed | E | Given published item in feed; When flip to `revoked`; Then next regen within 5s drops the `<item>` entirely (not flagged) | `rss-feed-spec.md` lines 154-161 |
| A-041 | Per-tier isolation | I | Given items across all 4 tiers; When generate each feed; Then no cross-tier leakage (a `podcast` item never appears in `audio-brief.xml`) | `rss-feed-spec.md` line 9 "Never mix tiers in one feed" |
| A-042 | `podcast:transcript` enclosure present | I | Given a published audio_job with `transcript_url`; When render item; Then exactly one `<podcast:transcript type="text/plain">` AND one `type="application/srt"` element emitted | `rss-feed-spec.md` lines 87-92 |

### 6.6 Reader surface (M5)

| ID | Title | Lvl | Given / When / Then | Source |
|---|---|---|---|---|
| A-043 | AudioPlayer Variant A inline renders for published | E (Playwright) | Given published article with `audio_status='published'`; When visit article page; Then `[data-testid="audio-player-variant-a"]` visible, play button enabled | `component-library` skill; `CLAUDE.md` §7 color tokens v1.1 |
| A-044 | AudioPlayer Variant B banner renders on Listen page | E | Given Listen page route; When load; Then Variant B banner visible per design tokens | `component-library` skill |
| A-045 | Status badge color matches DB state | E | For each of `in_review` / `published` / `skipped`; When fetch article; Then badge background equals the matching CSS var (`--rb-audio-pending` / `--rb-audio-published` / `--rb-audio-skipped`) | `CLAUDE.md` §7 color tokens; `design-tokens` skill |
| A-046 | Sponsor firewall 32px enforced | E | Given a sponsored issue; When measure sponsor block bounding box vs ROMAS Wire wordmark bounding box; Then min separation ≥ 32px on both desktop + mobile breakpoints | `CLAUDE.md` §3 ledger row 3 + sponsor-firewall sentence |
| A-047 | Subscriber count hidden until 2,500 | E | Given subscriber_count view returns 1,200; When load homepage; Then no count rendered, qualitative copy shown. Given 2,500+; When load; Then exact count rendered | `CLAUDE.md` §3 row 5, §8; `cms-schema.md` `subscriber_count` view |
| A-048 | No co-branded masthead before Day 90 | E | Given site config flag `launch_day < 90`; When load homepage; Then no partner logo rendered above the fold; only "Sponsored by [X]" or "Partner message from [X]" allowed in body slots | `CLAUDE.md` §3 row 3 |

### 6.7 Regulatory verification chain (cross-cutting)

| ID | Title | Lvl | Given / When / Then | Source |
|---|---|---|---|---|
| A-049 | openFDA discovery → 510(k) official record link required | I | Given a candidate sourced from openFDA; When promote to article; Then `primary_source_url` matches FDA 510(k) DB / De Novo / PMA URL pattern (`accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/`...) | `CLAUDE.md` §4 rule 4; `AGENT.md` §5 rule 4 |
| A-050 | meddeviceguide.com (or similar aggregator) never primary | I | Given candidate with `source_url` matching aggregator allowlist; When evaluate as primary; Then rejected with `INVALID_PRIMARY_SOURCE_AGGREGATOR` | `AGENT.md` §14 anti-pattern "openFDA as primary" extended |
| A-051 | Press release as primary requires `source_type='press'` + traceable URL | I | Given press-release source; When promote; Then `source_type` set to `'press'` AND URL is the publisher's own domain | `claim-verification` skill (referenced from `CLAUDE.md` §10) |
| A-052 | Every clinical claim has a `claims` row | I | Given a published article body containing N clinical-claim markers; When inspect `claims` table; Then N rows linked to the article with `verified_by NOT NULL` | `cms-schema.md` lines 119-134; `AGENT.md` §6 |

### 6.8 Friday Read rotation (M6)

| ID | Title | Lvl | Given / When / Then | Source |
|---|---|---|---|---|
| A-053 | History updates after Friday issue | I | Given Friday issue ships using sub-rubric "The Week in Receipts"; When post-publish hook fires; Then `history.json` appended with date + rubric | `friday-read-format` skill |
| A-054 | Predictions prevent repeat within rotation window | U | Given last 4 Fridays used rubrics [Receipts, Five Things, Receipts, What I Got Wrong]; When request next rubric; Then suggestion ≠ Receipts (within configured 4-week window) | `friday-read-format` skill |
| A-055 | Friday Read deeper-voice copy never appears Mon–Thu | E | Given any non-Friday issue; When scan body for Friday-Read-only sub-rubric tokens; Then zero matches | `CLAUDE.md` §3 row 4; `AGENT.md` §3 phase 6A |

### 6.9 Conference Brief mode (M6)

| ID | Title | Lvl | Given / When / Then | Source |
|---|---|---|---|---|
| A-056 | Activation creates conference tier feed entries | E | Given `conference-mode-operator` activates `ASTRO-2026`; When new article ingested in window; Then `articles.tier='conference'` AND `audio_jobs.audio_tier='conference_brief'` (ADR-0017 column rename) | `conference-brief-mode` skill; `AGENT.md` §3 phase 9 |
| A-057 | Embargo lint blocks live abstracts | I | Repeat of A-039 inside the conference mode workflow (active embargo schedule per day) | `embargo-handling.md` lines 105-111 |
| A-058 | Deactivation closes feed but preserves history | E | Given conference window ends; When operator deactivates; Then no new items accepted into `conference-brief.xml` but existing 50 items remain visible | `rss-feed-spec.md` line 17 cap |

### 6.10 Revoke kill-switch watchdog (M7)

| ID | Title | Lvl | Given / When / Then | Source |
|---|---|---|---|---|
| A-059 | Watchdog alerts when `cdn_purge_at` null >90s after revoke | I | Given `revocations` row created at T0 with `cdn_purge_at=NULL`; When watchdog polls at T0+90s; Then alert fired (Sentry + log to `source_health`) | Derived from `audio-production-pipeline.md` 60s SLA + 30s margin; `cms-schema.md` revocations table |
| A-060 | Watchdog passes when CDN purge stamps within 60s | I | Given normal revoke path; When watcher polls; Then `cdn_purge_at` populated within 60s AND `rss_regenerated_at` within 60s, no alert | `audio-production-pipeline.md` line 129 |

**Total catalog count: 60 acceptance tests** spanning M0–M7.

### 6.11 19-finding coverage matrix (Critical/High → A-NNN)

Each Critical / High finding from upstream review maps to ≥1 acceptance test:

| Finding (severity) | Acceptance test(s) |
|---|---|
| F-01 audio QA gate enforcement (CRITICAL) | A-013–A-017, A-030, A-032 |
| F-02 embargo discipline (CRITICAL) | A-011, A-039, A-057 |
| F-03 primary-source requirement (CRITICAL) | A-010, A-049, A-050, A-051 |
| F-04 insight labeling (CRITICAL) | A-012 |
| F-05 revoke 60s SLA (HIGH) | A-034, A-040, A-059, A-060 |
| F-06 RSS namespace correctness (HIGH) | A-038, A-042 |
| F-07 sponsor firewall (HIGH) | A-046, A-048 |
| F-08 subscriber count gating (HIGH) | A-047 |
| F-09 loudness compliance (HIGH) | A-015, A-016, A-024, A-025 |
| F-10 TTS failover (HIGH) | A-026, A-027 |
| F-11 10-beat structural integrity (HIGH) | A-020, A-021, A-031 |
| F-12 lexicon coverage (HIGH) | A-022, A-023 |
| F-13 transcript mandatory (HIGH) | A-017, A-028, A-042 |
| F-14 banned vocabulary / emojis (HIGH) | A-006, A-007 |
| F-15 brand-line drift (HIGH) | A-004, A-005, A-055 |
| F-16 doc / strategy drift (HIGH) | A-001, A-002, A-003 |
| F-17 RLS scope on publish flip (HIGH) | A-032 |
| F-18 Friday-Read rotation discipline (HIGH) | A-053, A-054, A-055 |
| F-19 audit chain on revoke (HIGH) | A-018, A-019, A-059 |

Every Critical / High finding has at least one blocking acceptance test.

---

## 7. Smoke test reference

Smoke is currently a **no-code checkpoint** — there is no application code in repo as of M0. The smoke suite is populated as M1 lands (schema + minimal CMS). Placeholder location: `tests/smoke/`.

When populated, smoke must run in <60s and exercise:

1. Supabase `select 1` round-trip.
2. R2 archive bucket reachable (HEAD on a known fixture object).
3. CDN bucket reachable (GET on a known public fixture).
4. ElevenLabs API auth check (`/v1/user`).
5. PlayHT auth check.
6. Reader homepage 200 + tagline string present.
7. CMS homepage 200 + auth gate redirect to login.
8. All four RSS feed URLs return 200 + `application/rss+xml`.

---

## 8. Visual regression scope

Captured via Playwright `toHaveScreenshot()` (or Percy if budget approved). Baseline images committed to `tests/visual/__baseline__/`. Diff >5% fails on staging + production, warns on PR.

Routes:

- `/` (homepage — desktop 1920×1080 and mobile 390×844)
- `/article/[slug]` (one canonical golden article seeded in fixtures)
- `/listen` (AudioPlayer Variant B banner)
- `/feeds` (listing page if exists)
- CMS internal: `/admin/issue/[id]` editor (authenticated screenshot via storage-state)
- AudioPlayer states matrix: `audio-pending`, `audio-published`, `audio-skipped`, `audio-revoked`

Dynamic regions (timestamps, counts) are masked.

---

## 9. Accessibility scope

Standard: **WCAG 2.2 AA** per `design-system-keeper`.

- `pa11y-ci` runs on every reader route on every PR. Zero serious or critical issues allowed.
- `@axe-core/playwright` in E2E asserts zero violations on critical pages.
- Color tokens v1.1 audio-status colors (`--rb-audio-published #00B4C6`, `--rb-audio-pending #F59E0B`, `--rb-audio-skipped #94A3B8`) verified against the foreground text they pair with for AA contrast (4.5:1 normal text, 3:1 large text).
- Keyboard navigation: AudioPlayer fully operable without mouse. Focus ring visible. Play / pause via Space, seek via Arrow keys.
- Screen reader: AudioPlayer announces status changes via `aria-live="polite"`.

---

## 10. Test-data strategy

- Factories live under `packages/test-fixtures/`.
- Canonical golden article seeded at `packages/test-fixtures/articles/golden.ts` — used by snapshot tests, visual regression, RSS examples.
- No real PHI ever (none exists in scope). Patient-identifiable data is out of scope.
- Lexicon fixture: the 30-entry seed from `pronunciation-lexicon` skill.
- Audio fixtures: three short WAV files (5/7/10 min) pre-mastered to known LUFS for loudness tests. Stored as Git LFS or fetched from a fixture R2 bucket on CI start.
- DB fixtures: a `seed.sql` script applied after migrations in every test run, plus per-test factories.
- Embargo fixtures: one item with `embargo_until = now() + 1 day`, one with `embargo_until = now() - 1 day` (expired, ready to release).

---

## 11. CI matrix

| Stage | Trigger | Gates | Duration budget |
|---|---|---|---|
| **PR-time** | every push to PR branch | G1, G2, G3 (unit only), G6, G7, G9 | <5 min |
| **PR-full** | label `full-ci` or PR ready-for-review | G1–G10 incl. integration + E2E happy paths | <15 min |
| **main-merge** | merge to `main` | G1–G10 full E2E + visual regression | <25 min |
| **nightly** | cron 09:00 UTC | full suite + mutation testing + dependency drift + pa11y full crawl + Lighthouse | <60 min |
| **pre-prod-deploy** | manual gate | smoke against staging + RSS validator against Apple Podcasts validator endpoint | <10 min |

Failure on any blocking gate posts a check-failure comment with the exact command + first failing line.

---

## 12. Gate enforcement: advisory vs blocking

See §5 matrix. Re-stated for clarity:

- **PRs**: all of G1–G10 are blocking. Visual regression and Lighthouse are advisory (warn).
- **main-merge**: same as PR plus visual regression blocks on >5% diff for tracked routes.
- **staging deploy**: smoke must pass. Apple Podcasts validator must pass for RSS.
- **production deploy**: all the above + Lighthouse perf budget enforced (LCP < 2.5s, INP < 200ms, CLS < 0.1 per the user-global architecture reference).

---

## 13. Open questions / hypotheses

- *Hypothesis*: Vitest 2.x is the chosen runner. Confirmed at scaffold time.
- *Hypothesis*: Apple Podcasts validator exposes an HTTP endpoint we can hit from CI. If not, manual weekly smoke per `rss-feed-spec.md` line 173 remains the fallback.
- *Hypothesis*: Cloudflare cache purge by tag is the chosen invalidation primitive (not by path) — confirm at infra wave. Affects A-034 implementation.
- *Open*: Mutation testing thresholds (Stryker) — start advisory, ratchet to blocking after M5 stabilises.

---

*This plan is the verification contract for ROMAS Wire. When the gates change, this file changes in the same PR.*
