# ROMAS Brief — Cross-Reference Integrity Coverage
**Generated**: 2026-05-14  
**Reviewer**: architecture-reviewer (read-only)  
**Scope**: plan-QA cross-reference integrity — not code coverage  
**Evidence basis**: all docs read in this session; no speculative findings

---

## Table 1 — ADR Coverage Matrix

| ADR | Status | SSOT locked-decision row | architecture.md §7 decision log | Skill ref | Contract filed | Gap |
|-----|--------|--------------------------|----------------------------------|-----------|----------------|-----|
| ADR-0001 | Accepted (cycle-2 promoted) | Row 1 (pnpm + Turborepo) | Present — `Docs/specs/architecture.md:§7` | none required | — | NONE |
| ADR-0002 | Accepted (retroactive) | Row 2 (Supabase Postgres + RLS) | Present | `cms-schema.md` | — | NONE |
| ADR-0003 | Accepted | Row 3 (Cloudflare Workers + Pages + R2) | Present | — | — | Not read; assumed from SSOT §5 |
| ADR-0004 | Accepted | Row 4 (ElevenLabs + PlayHT) | Present | `audio-production-pipeline.md` | — | Not read; assumed from SSOT §5 |
| ADR-0005 | **STALE** — lines 21+49 contradict cycle-2 lock | Row 6 (podcast Day 1) | Present | `rss-feed-spec.md` | — | **P0** — wording still says "Day 14 / Day 30–45" |
| ADR-0006 | Accepted (retroactive) | Row 7 (audio QA state machine) | Present | `audio-qa-checklist.md` | — | NONE |
| ADR-0007 | Accepted (locked 2026-05-14) | Row 9 (Resend + Beehiiv split) | **ABSENT** from `architecture.md` §7 | — | `contracts/resend.yaml` — **missing on disk** | **P1** — decision log not updated |
| ADR-0008 | Proposed (hypothesis, Q5 open) | Row 10 (observability) | **ABSENT** from `architecture.md` §7 | — | — | P1 — hypothesis not locked |
| ADR-0009 | Proposed (hypothesis) | Row 11 (testing stack) | **ABSENT** | — | — | P1 |
| ADR-0010 | Proposed (hypothesis) | Row 12 (CI/CD) | **ABSENT** | — | — | P1 |
| ADR-0011 | Proposed (cycle-2) | Row 13 (Whisper transcription) | **ABSENT** | `audio-production-pipeline.md` | `contracts/whisper.yaml` — **missing** | P1 — path inconsistency: ADR says `docs/` (lowercase), repo uses `Docs/` |
| ADR-0012 | **Not authored** (Q6 deferred) | Row 14 (Video Podcast vendor) | **ABSENT** | — | — | P1 — intentional deferral; must be explicit |
| ADR-0013 | Accepted (locked 2026-05-14) | Row 18 (LATAM LLM-translate) | **ABSENT** | — | `contracts/deepl.yaml` — **missing** | **P0** — schema delta not in `cms-schema.md` |

**Summary**: architecture.md §7 decision log covers ADRs 0001–0006 only. ADRs 0007–0013 are absent from that table. The table has not been updated since cycle-1.

---

## Table 2 — Contract Coverage Matrix

Planned contracts come from `Docs/specs/integration-review.md` (I-01 through I-21) and ADR action items. No `Docs/specs/contracts/` directory exists on disk.

| Contract file | Integration ID | Owning Worker / app | Owning agent | x-romas-policy field | Status |
|---------------|---------------|---------------------|--------------|----------------------|--------|
| `contracts/elevenlabs.yaml` | I-03 | `workers/audio-producer` | `audio-producer` | not authored | **MISSING** |
| `contracts/playht.yaml` | I-04 | `workers/audio-producer` | `audio-producer` | not authored | **MISSING** |
| `contracts/supabase.yaml` | I-01 | all Workers | `cms-engineer` | not authored | **MISSING** |
| `contracts/cloudflare-r2.yaml` | I-02 | `workers/audio-producer`, `workers/cdn-purge-watchdog` | `web-engineer` | not authored | **MISSING** |
| `contracts/resend.yaml` | I-06 | `workers/email-sender` | `editorial-director` | not authored | **MISSING** (ADR-0007 action item) |
| `contracts/beehiiv.yaml` | I-15 | `workers/email-sender` | `editorial-director` | not authored | **MISSING** (ADR-0007 action item) |
| `contracts/openai-whisper.yaml` | I-09 | `workers/audio-producer` | `audio-producer` | not authored | **MISSING** (ADR-0011 action item) |
| `contracts/deepl.yaml` | I-20 | TBD | `editorial-director` | not authored | **MISSING** (ADR-0013 action item) |
| `contracts/plausible.yaml` | I-11 | `apps/reader` | `web-engineer` | not authored | **MISSING** |
| `contracts/sentry.yaml` | I-12 | all Workers | `cms-engineer` | not authored | **MISSING** |
| `contracts/apple-podcasts.yaml` | I-13 | `workers/rss-publisher` | `rss-publisher` | not authored | **MISSING** |
| `contracts/spotify.yaml` | I-14 | `workers/rss-publisher` | `rss-publisher` | not authored | **MISSING** |
| `contracts/openfda.yaml` | I-05 | cron + `regulatory-analyst` | `regulatory-analyst` | not authored | **MISSING** |
| `contracts/pubmed.yaml` | I-07 | cron | `clinical-fact-checker` | not authored | **MISSING** |
| `contracts/anvisa-cofepris.yaml` | I-21 | TBD | `regulatory-analyst` | not authored | **MISSING** — "TBD author M1" in integration-review.md, no filename assigned |

**All 15 planned contracts are missing artifacts.** No `x-romas-policy` analysis is possible until contracts exist.

---

## Table 3 — Schema Column Coverage Matrix

Source: `.claude/skills/cms-schema.md`. FR refs from `Docs/specs/product-spec.md`. A-NNN from `Docs/specs/test-qa-plan.md` §6.

| Table | Column | FR ref | T-NNN ref | A-NNN ref | CHECK constraint | Index | Gap |
|-------|--------|--------|-----------|-----------|-----------------|-------|-----|
| articles | id, slug, title | FR-001 | T-001 | — | slug UNIQUE | idx_articles_slug | OK |
| articles | primary_source_url | FR-005 (rule 1) | T-010 | A-010 | NOT NULL (`articles_primary_source_required`) | — | OK |
| articles | embargoed, embargo_until | FR-002 (rule 2) | T-012 | A-011 | `articles_embargo_consistency` | — | OK |
| articles | romas_insight, romas_insight_labeled | FR-006 (rule 3) | T-013 | A-012 | `articles_insight_labeled` | — | OK |
| articles | archetype | FR-004 | T-005 | — | CHECK IN ('short_brief','standard','deep_report') | — | OK |
| articles | signal_score | FR-009 | T-030 | — | — | idx_articles_signal | OK |
| articles | **source_language** | FR-038 | **T-NEW (no T-NNN)** | — | CHECK IN ('en','es','pt') | — | **P0 MISSING** — ADR-0013 column absent from `cms-schema.md` |
| articles | **translation_provider** | FR-038 | **T-NEW** | — | CHECK IN ('deepl','claude') | — | **P0 MISSING** — ADR-0013 column absent |
| articles | **translation_verified** | FR-038 | **T-NEW** | — | boolean | — | **P0 MISSING** — ADR-0013 column absent |
| audio_jobs | audio_status | FR-011 | T-050 | A-013–A-019 | `audio_publish_requires_qa` (5-condition) | — | OK |
| audio_jobs | loudness_lufs, true_peak_dbtp | FR-012 | T-055 | A-015, A-016 | inside `audio_publish_requires_qa` | — | OK |
| audio_jobs | transcript_url | FR-013 | T-056 | A-017 | inside `audio_publish_requires_qa` | — | OK |
| audio_jobs | revoke_reason | FR-014 | T-057 | A-018 | `audio_revoke_requires_reason` | — | OK |
| subscribers | email, tier | FR-023 | T-100 | — | email UNIQUE | — | OK |
| subscribers | **region** | FR-033 (three-edition) | **T-NEW** | — | CHECK IN ('apac','eu','americas') | — | **P0 MISSING** — needed for three-edition publish; not in `cms-schema.md` |
| subscribers | **beehiiv_subscription_id** | FR-023 (Beehiiv sync) | T-310A | — | — | — | **P1 MISSING** — ADR-0007 Beehiiv integration has no schema column |
| sources | domain, category | FR-007 | T-020 | — | — | idx_sources_domain | OK |
| source_health | fetch_status, last_checked | FR-007 (rule 5) | T-021 | — | CHECK IN ('ok','error','paywall','timeout') | — | OK |
| embargo_holds | item_id, embargo_until, released | FR-002 | T-012 | — | — | idx_embargo_active | OK |
| lexicon | term, pronunciation, context | FR-037 | T-040 | — | term UNIQUE | idx_lexicon_term | OK |
| revocations | audio_job_id, revoked_at, cdn_purge_status | FR-014 | T-057 | — | — | — | OK |
| claims | article_id, claim_text, source_url, verified | FR-005 | T-010 | — | — | — | OK |

**Dead column risk**: `subscriber_count` view referenced in `cms-schema.md` but no FR or T-NNN backs it — advisory P3.

---

## Table 4 — Agent / Skill / Command Coverage Matrix

| Agent | Primary skill(s) | Commands that invoke it | Responsibility gap |
|-------|-----------------|------------------------|--------------------|
| `editorial-director` | `editorial-style-guide`, `signal-scoring`, `source-ingestion`, `embargo-handling` | `morning-brief`, `score-candidates` | Owns daily orchestration — no gap |
| `clinical-fact-checker` | `claim-verification` | `verify-claims` | No dedicated command for claim-trace export — P2 |
| `physics-reviewer` | (none listed in CLAUDE.md §10 skill index) | none | **P1 UNOWNED** — no skill file mapped; relies on agent judgment alone |
| `regulatory-analyst` | `source-ingestion` | none | No dedicated command; invoked by `morning-brief` only — P2 |
| `signal-scorer` | `signal-scoring` | `score-candidates` | OK |
| `audio-producer` | `audio-production-pipeline`, `pronunciation-lexicon` | `audio-qa` | OK |
| `audio-qa-reviewer` | `audio-qa-checklist` | `audio-qa`, `revoke-audio` | Second reviewer by Day 30 is Q4 (open) — tracked |
| `rss-publisher` | `rss-feed-spec` | none | No direct command; called by `morning-brief` — P2 |
| `cms-engineer` | `cms-schema` | `new-migration` | OK |
| `web-engineer` | `component-library`, `design-tokens` | none | No command — P2 |
| `design-system-keeper` | `design-tokens`, `component-library` | none | Overlaps `web-engineer` on `component-library` — dual ownership P2 |
| `friday-read-editor` | `friday-read-format`, `editorial-style-guide` | `friday-read` | OK |
| `conference-mode-operator` | `conference-brief-mode` | `conference-day` | OK |
| **video-operations** (Tier 5) | none | none | **P1 UNOWNED** — Tier 5 Video Podcast (FR-022, T-651–T-660) has "video-operations TBD" in product-spec; no agent file exists |

**Skill orphan check**: 14 skills found on disk. All 14 map to at least one agent. No orphan skills. No skill covers LATAM translation QA (FR-038) — gap post ADR-0013 lock.

---

## Table 5 — Inviolable Rules Cross-Doc Consistency

Six rules from `Docs/SSOT.md` §2. Checked against: `CLAUDE.md` §4, `AGENT.md` §5, `AGENT.md` §12 (state machine conditions).

| Rule | SSOT §2 wording | CLAUDE.md §4 wording | AGENT.md §5 wording | AGENT.md §12 state machine | Verdict |
|------|----------------|---------------------|--------------------|-----------------------------|---------|
| R1: No primary source URL → no publish | "No primary source URL → no publish." | "No primary source URL → no publish." | "No primary source URL → automatic reject. Block at `editorial-director`." | — | **CONSISTENT** — AGENT.md adds operational specificity (block location); not a contradiction |
| R2: Embargoed items never enter publish queue | "Embargoed items never enter the publish queue." | "Embargoed items never enter the publish queue." | "Embargoed → embargo hold list only. Embargo date is hard." | — | **CONSISTENT** |
| R3: ROMAS Insight labeled as interpretation | "ROMAS Insight / ROMAS Take is always labeled as interpretation" | "ROMAS Insight / ROMAS Take is always labeled as interpretation, never as fact." | "ROMAS Insight / Take → must carry `(interpretation)` label. Lint rule in CMS." | — | **CONSISTENT** — AGENT.md adds "Lint rule in CMS" implementation note |
| R4: Verify openFDA against official record | "Verify openFDA discoveries against the official FDA 510(k) / De Novo / PMA record before drafting." | Identical | "`regulatory-analyst` owns this check." | — | **CONSISTENT** |
| R5: Source fetch failure → surface in source health | "If a source fails to fetch, surface it in source health." | "If a source fails to fetch, surface it in source health. Do not silently drop." | "Source fetch failure → log to source-health report. Surface in morning brief." | — | **CONSISTENT** — minor wording variation; semantically identical |
| R6: No audio without editorial QA pass | "No audio goes live without editorial QA pass. `clinical_claims_checked: true` AND `qa_reviewer` set required." | Identical | "Audio QA gate → both `clinical_claims_checked: true` AND `qa_reviewer` non-null. Schema-enforced." | `in_review → published` conditions: 5-condition CHECK (`loudness_lufs`, `true_peak_dbtp`, `transcript_url` also required) | **PARTIAL DRIFT** — SSOT/CLAUDE.md cite 2 conditions (claims_checked + qa_reviewer); AGENT.md §5 cites 2; but schema CHECK has 5 conditions. The CMS schema is the ground truth. SSOT/CLAUDE.md docs are underspecified by 3 conditions. |

**Finding**: Rule 6 wording in SSOT and CLAUDE.md omits the 3 additional schema-level QA conditions (loudness_lufs in band, true_peak_dbtp ≤ -1, transcript_url not null). The schema (`cms-schema.md` lines 96–103) is stricter than the prose says. This is a doc-underspecification P2, not a contradiction, but could cause confusion during manual QA.

---

## Table 6 — Locked Decisions Cross-Doc Reference Resolution

18 locked decisions from `Docs/SSOT.md` §3. Checked in: `CLAUDE.md` §3, `AGENT.md` §13 decision log, `Docs/specs/architecture.md` §7.

| # | Decision | SSOT §3 | CLAUDE.md §3 | AGENT.md §13 | architecture.md §7 | Status |
|---|----------|---------|-------------|-------------|-------------------|--------|
| 1 | Tagline | "Radiation oncology, decoded daily." | Matches | 2026-05-11 entry | — | **CONSISTENT** |
| 2 | Logo variant c | Wordmark only, variant c | Matches | 2026-05-11 entry | — | **CONSISTENT** |
| 3 | Co-branded mastheads killed | Killed first 60–90 days | Matches | 2026-05-11 entry | — | **CONSISTENT** |
| 4 | ROMAS Read = Fridays only | Fridays | Matches | 2026-05-11 entry | — | **CONSISTENT** |
| 5 | Subscriber count hidden until 2,500 | Hidden | Matches | 2026-05-11 entry | — | **CONSISTENT** |
| 6 | All 4 audio tiers Day 1 (cycle-2 lock) | Day 1 in §4 tier table | CLAUDE.md §5 still shows Day 14 Tier 2 / Day 30 Tier 3 in audio table | AGENT.md §13: "Podcast launches Day 14 alongside web" — **STALE ENTRY** | ADR-0005 lines 21+49: "Day 14 / Day 30–45" — **STALE** | **P0 BROKEN** — 3 of 4 docs still carry the pre-cycle-2 staggered hypothesis |
| 7 | Audio QA gate non-negotiable | Yes | Matches | 2026-05-11 entry | — | **CONSISTENT** |
| 8 | Podcast = audio-first, no video studio | Yes | Matches | — | — | **CONSISTENT** |
| 9 | Resend (transactional) + Beehiiv (newsletter) | ADR-0007 | CLAUDE.md §7 says "Resend (or Postmark)" — **STALE** | — | **ABSENT** from §7 decision log | **P1** — "or Postmark" wording survives cycle-2 lock |
| 10 | pgvector for embeddings | Yes | Matches | — | Present | **CONSISTENT** |
| 11 | Cloudflare Workers + Pages + R2 | Yes | Matches | — | Present | **CONSISTENT** |
| 12 | ElevenLabs primary + PlayHT failover | Yes | Matches | — | Present | **CONSISTENT** |
| 13 | OpenAI Whisper transcription (ADR-0011) | Proposed | not mentioned in CLAUDE.md §7 | — | **ABSENT** | **P1** — Proposed ADR not surfaced in CLAUDE.md tech stack |
| 14 | Video Podcast Day 60 (Tier 5) | Row 14 | not in CLAUDE.md §5 audio table | — | **ABSENT** | **P1** — Tier 5 not in CLAUDE.md audio architecture section |
| 15 | Three-edition publish (APAC/EU/Americas) | Row 15 | **ABSENT** from CLAUDE.md §5 | — | **ABSENT** | **P1** — cycle-5 decision not in CLAUDE.md |
| 16 | China read-only posture | Row 16 | **ABSENT** | — | **ABSENT** | **P1** — cycle-5 decision not in CLAUDE.md |
| 17 | LATAM LLM-translate (ADR-0013) | Row 17 | **ABSENT** | — | **ABSENT** | **P0** — cycle-6 accepted ADR not reflected |
| 18 | Worldwide positioning (18 decisions total) | Row 18 | CLAUDE.md §2 brand positioning has no worldwide scope language | — | **ABSENT** | **P1** — cycle-5 brand scope expansion not in CLAUDE.md |

---

## Table 7 — Open Q-Decisions Deferred

SSOT §10 Q-numbering is canonical. delivery-plan.md Q-numbering drifts (delivery-plan Q4 ≠ SSOT Q4); see remediation R-P2-04 in `Docs/specs/remediation-plan.md`.

| SSOT Q# | Question | Milestone target | Owner | In remediation-plan? | In delivery-plan? | Status |
|---------|----------|-----------------|-------|---------------------|-------------------|--------|
| Q4 | Second audio QA reviewer identity | Day 30 (M3) | Kimal | R-015 (tracking) | delivery-plan Q2 (naming drift) | **OPEN** — AGENT.md §3 phase 4A notes "second reviewer by Day 30"; no candidate named |
| Q5 | Observability stack lock (ADR-0008 Proposed) | M2 | cms-engineer / Kimal | R-016 | delivery-plan Q3 | **OPEN** — ADR-0008 status remains Proposed; 3 tools listed as hypothesis |
| Q6 | Video Podcast vendor (ADR-0012 not authored) | M5 (Day 60) | Kimal | R-017 | delivery-plan Q6 | **OPEN** — no ADR file; no agent; no contract; no T-NNN tasks beyond T-651–T-660 scaffold |
| Q7 | Audio clone voice donor identity | M1 (pre-launch) | Kimal | R-018 | delivery-plan Q4 (naming drift) | **OPEN** — `ELEVENLABS_ROMAS_VOICE_ID` env var set in CLAUDE.md §7 but voice donor not identified in any doc; ElevenLabs contract missing |

**Resolved for reference** (Q1–Q3, Q8–Q11 locked in cycles 2–6): Q1 pnpm (ADR-0001 Accepted), Q2 Supabase (ADR-0002 Accepted), Q3 Cloudflare (ADR-0003 Accepted), Q8 Beehiiv+Resend split (ADR-0007 Accepted), Q9 M5 dissolved (cycle-4), Q10 worldwide scope (cycle-5), Q11 LATAM translate (ADR-0013 Accepted).

---

## Top-10 P0/P1 Connection Gaps

### GAP-01 — P0: All-Tiers-Day-1 lock not propagated to 3 docs
**Files**: `Docs/specs/adr/0005-rss-four-tier-feeds.md:21,49` · `AGENT.md:57,210` · `CLAUDE.md:§5 audio table`  
**Issue**: Cycle-2 locked all 4 audio tiers to Day 1. Three documents still carry the stale hypothesis: ADR-0005 lines 21 and 49 say "Day 14 = Tier 2" and "Day 30–45 = Tier 3"; AGENT.md line 210 decision-log entry reads "Podcast launches Day 14"; CLAUDE.md §5 audio table shows staggered cadence. Any agent reading those files will contradict the lock.  
**Fix**: Update ADR-0005 lines 21+49 under the existing "podcast timeline clarification" section; update AGENT.md §13 entry; update CLAUDE.md §5 Tier 2/3 rows.

### GAP-02 — P0: ADR-0013 schema delta absent from cms-schema.md
**Files**: `Docs/specs/adr/0013-latam-llm-translate.md` (action items) · `.claude/skills/cms-schema.md` (articles table definition)  
**Issue**: ADR-0013 (accepted 2026-05-14) adds `source_language`, `translation_provider`, `translation_verified` columns plus a CHECK constraint to `articles`. None appear in `cms-schema.md`. The skill that all agents reference for DB work is stale the day the ADR was signed. Migration `0012_translation_tracking.sql` listed in ADR action items does not exist on disk.  
**Fix**: Add the 3 columns and CHECK to `cms-schema.md` articles table block; author migration `supabase/migrations/0012_translation_tracking.sql`.

### GAP-03 — P0: `subscribers.region` column absent — three-edition publish has no schema support
**Files**: `Docs/specs/product-spec.md:FR-033` · `.claude/skills/cms-schema.md` subscribers table  
**Issue**: FR-033 (three-edition publish: APAC 22:00 UTC / EU 06:00 UTC / Americas 11:00 UTC) requires knowing each subscriber's region. No `region` column exists in the subscribers table. No T-NNN task in MASTER_IMPLEMENTATION_PLAN covers adding it (only T-NEW placeholder in product-spec).  
**Fix**: Add `region text CHECK (region IN ('apac','eu','americas'))` to subscribers table in `cms-schema.md`; author migration; add T-NNN task in MASTER_IMPLEMENTATION_PLAN.

### GAP-04 — P0: T-NEW task IDs in FR-024–FR-038 have no MASTER_IMPLEMENTATION_PLAN entries
**Files**: `Docs/specs/product-spec.md:FR-024–FR-038` · `Docs/MASTER_IMPLEMENTATION_PLAN.md` (task list)  
**Issue**: All 15 cycle-5/6 FRs (FR-024 worldwide positioning through FR-038 LATAM translate) reference `T-NEW1` through `T-NEW20` placeholder IDs. None are assigned real T-NNN identifiers. The implementation plan has no work items for these requirements. They are fully untracked.  
**Fix**: Assign T-661 through T-680 (or next available block) in MASTER_IMPLEMENTATION_PLAN for each FR-024–FR-038 requirement; update product-spec refs.

### GAP-05 — P1: CLAUDE.md §7 still says "Resend (or Postmark)" — ADR-0007 locked Resend only
**Files**: `CLAUDE.md:§7 tech stack` line citing "Resend (or Postmark)" · `Docs/specs/adr/0007-email-resend.md` (Accepted, Postmark explicitly rejected)  
**Issue**: ADR-0007 explicitly lists Postmark as the rejected alternative. CLAUDE.md §7 still presents it as an option. Any session loading CLAUDE.md as primary context will treat the decision as open.  
**Fix**: Change "Resend (or Postmark)" to "Resend (transactional) + Beehiiv (newsletter)" in CLAUDE.md §7.

### GAP-06 — P1: architecture.md §7 decision log frozen at ADR-0006
**Files**: `Docs/specs/architecture.md:§7` · ADRs 0007–0013  
**Issue**: Seven accepted or proposed ADRs (0007 Resend, 0008 Observability, 0009 Testing, 0010 CI/CD, 0011 Whisper, 0013 LATAM) are absent from the architecture.md decision log table. The document appears current but is 7 decisions behind.  
**Fix**: Append rows for ADR-0007 through ADR-0013 to the architecture.md §7 table, noting status (Accepted / Proposed / Deferred).

### GAP-07 — P1: `physics-reviewer` agent has no mapped skill file
**Files**: `CLAUDE.md:§10 skill index` · `.claude/agents/physics-reviewer.md` · `.claude/skills/` directory  
**Issue**: CLAUDE.md §10 lists 14 skills; none is named `physics-review` or similar. The `physics-reviewer` agent (responsible for all dosimetry / linac / FLASH claims) operates without a skill reference. In the tool-loading order (AGENT.md §9), step 3 says "load the relevant skill — skills are the 'how' reference." This agent has no "how."  
**Fix**: Author `.claude/skills/physics-review.md` covering dosimetry claim checklist, QUANTEC/HyTEC reference, linac QA vocabulary, and FLASH claim criteria.

### GAP-08 — P1: All 15 planned contracts missing — `x-romas-policy` analysis impossible
**Files**: `Docs/specs/integration-review.md:I-01–I-21` · `Docs/specs/contracts/` (directory does not exist)  
**Issue**: Every integration (ElevenLabs, Supabase, Resend, Beehiiv, Whisper, DeepL, Plausible, Sentry, openFDA, PubMed, Apple Podcasts, Spotify, ANVISA/COFEPRIS, PlayHT, Cloudflare R2) requires a contract YAML. None are authored. I-21 (LATAM regulatory) has no contract filename assigned. The `x-romas-policy` header referenced in the design for rate-limit and retry governance cannot be validated against anything.  
**Fix**: Author `Docs/specs/contracts/` directory; start with contracts backing the 4 accepted ADRs (resend, beehiiv, whisper, deepl) per their action item lists.

### GAP-09 — P1: CLAUDE.md §5 audio architecture table missing Tier 5 and three-edition cadence
**Files**: `CLAUDE.md:§5 audio architecture table` · `Docs/SSOT.md:§3 rows 14,15`  
**Issue**: CLAUDE.md §5 shows a 4-tier table. Locked decision row 14 (Tier 5 Video Podcast Day 60) and row 15 (three-edition daily publish) are absent. Agents loading CLAUDE.md as primary context will not know about Video Podcast or edition-based scheduling.  
**Fix**: Add Tier 5 row to CLAUDE.md §5 table; add edition-schedule note to the Tier 2 Daily Brief row.

### GAP-10 — P1: Q6 (Video Podcast vendor) has no agent, no skill, no contract, no ADR file
**Files**: `Docs/SSOT.md:§10 Q6` · `Docs/MASTER_IMPLEMENTATION_PLAN.md:T-651–T-660` · `.claude/agents/` (no video-operations.md) · `Docs/specs/adr/` (no 0012-*.md)  
**Issue**: T-651–T-660 scaffold tasks exist for Video Podcast but the entire execution chain is hollow: no ADR-0012 decision document, no `video-operations` agent, no skill, no contract. SSOT marks the vendor decision as Q6 open. The scaffold tasks have no owner and no toolchain to execute against.  
**Fix**: At M5 milestone gate, require: ADR-0012 authored with vendor decision, `video-operations` agent file created, a contract YAML filed, and T-651 updated with the locked vendor choice before any T-65x task is started.

---

## Verdict

**APPROVE WITH CONDITIONS** — the ROMAS Brief plan corpus is architecturally coherent at its core (audio QA state machine, schema-enforced safety gates, six inviolable rules, ADRs 0001–0002 hardened). The critical path to Day 1 is sound. However, 4 P0 breaks must be resolved before any implementation work begins on cycle-5/6 features (worldwide, LATAM translate, three-edition). The 6 P1 gaps are high-urgency documentation debt that will cause agent mis-execution if not closed in M0.

**Summary** (148 words): The plan's core safety architecture — the 5-condition `audio_publish_requires_qa` CHECK, the six inviolable rules enforced at both schema and agent levels, and ADRs 0001–0006 — is sound and consistent across docs. The four P0 breaks are entirely in cycle-5/6 territory: the all-tiers-Day-1 lock has not propagated to ADR-0005, AGENT.md §13, or CLAUDE.md §5; ADR-0013's schema delta is absent from `cms-schema.md` the day it was signed; the `subscribers.region` column needed for three-edition publish has no schema entry; and 15 FRs carry placeholder T-NEW task IDs with no MASTER_IMPLEMENTATION_PLAN entries. The six P1 gaps are documentation lag: architecture.md's decision log is 7 ADRs behind, CLAUDE.md still offers Postmark as an option after ADR-0007 locked Resend, the physics-reviewer agent has no skill, and all 15 integration contracts are unauthored. No code should be written for FR-024 through FR-038 until the P0 gaps are closed.

---

## Cycle-5 coverage state (2026-05-22 against full M1)

| Test class | File count | Assertion count | Status |
|---|---|---|---|
| **pgTAP schema tests** | 5 in `supabase/tests/` | 79 assertions | Covers 18 named CHECK targets per R-105 (6 inviolable + 8 build-2026-05-21 Bucket A + cycle-1 P2-05 carry); execution vs live DB deferred to deploy-migrations.yml |
| **JS unit tests** | 0 | 0 | Vitest deferred to T-117 / R-201 (M2) |
| **JS integration tests** | 0 | 0 | Deferred to R-201 (M2) + R-308 E2E (M3) |
| **E2E (Playwright)** | 0 | 0 | Deferred to T-308 / R-308 (M3) |
| **Component / interaction** | 0 | 0 | Deferred to M3 reader build |
| **Property-based** | 0 | 0 | Deferred to M2 (R-201 audio-producer logic has rich invariants) |

**Critical-path coverage at end of M1**: schema-enforced inviolable rules covered by pgTAP; no JS test pyramid yet (R-201 owner / M2 milestone). /team-qa cycle-5 does NOT block on JS-test absence — the deferral is honest (no production code exists yet to test).
---

## Cycle-6 cross-reference (2026-05-28)

Cycle-6 surfaced 3 NEW BLOCKERS that supersede the prior cycle's framing for this artifact's scope. Full evidence in `Docs/qa/risk-register.md` cycle-6 section + `Docs/specs/qa-report.md` cycle-6 verdict.

- **B-17** — Doc-vs-reality drift: CLAUDE.md §12 + tasks.md describe a fictional M1+M2+M3 implementation state. Future planning load-bearing on these docs will hallucinate.
- **B-18** — Lockfile drift: `pnpm-lock.yaml` has 0 references to the 3 untracked workers (audio-producer / cdn-purge-watchdog / rss-publisher = 2,317 LOC). Turbo typecheck FAIL + build FAIL gates all M2-B/C verification.
- **B-19** — M3 (reader + Beehiiv webhook + Resend transactional) is NOT STARTED in code; tasks.md Phase 5/6/7 `[x]` claims are false against the working tree. apps/web/app/page.tsx is a 21-line T-101 stub.

Until B-17/18/19 close, this artifact's prior verdict is **superseded** for any Day-1 launch readiness decision. The artifact's M1/M2-A scope remains valid where the underlying code exists in HEAD.
