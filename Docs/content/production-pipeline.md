---
title: ROMAS Wire — Production Pipeline (finalized, end-to-end)
version: 1.0.0
date: 2026-06-04
owner: Kimal Honour Djam
status: CONTENT-5 deliverable — the canonical discovery→publish→audio→revoke pipeline, mapped to real components
authority: CLAUDE.md §4 (six rules) · §5 (audio) · Docs/ROMAS-Brief-Daily-Production-Runbook.md (editorial cadence) · packages/shared/signal-scoring.ts (scoring) · Docs/content/500-catalog-framework.md (catalog)
---

# ROMAS Wire — Production Pipeline (finalized)

This is the single end-to-end map from a raw source to a published, QA-passed, audio-bearing
article — and back out via the revoke kill switch. Every stage names the **real component** that
runs it (worker / package / route / migration), the **article state** it leaves behind, and the
**inviolable rule** it enforces. The Daily-Production-Runbook governs the *human cadence*; this
doc governs the *system contract*.

The 44 source-grounded seed articles (CONTENT-4, live as `status='draft'`) enter at Stage 3 and
flow through Stages 4→8. The cron keeps refilling Stage 1 toward the 500-article target.

---

## 0. The article state machine (the spine)

`articles.status` CHECK enum (verified live 2026-06-04):

```
draft ──► in_review ──► ready_to_publish ──► published ──► revoked
  │                                              │
  └──────────────► corrected ◄───────────────────┘
```

| State | Meaning | Gate to leave it |
|---|---|---|
| `draft` | Topic stub or LLM-drafted body; not fact-checked | Stage 5 fact-check pass |
| `in_review` | Fact-checked, awaiting editorial sign-off | Stage 6 owner approval |
| `ready_to_publish` | Approved, scheduled or queued | Stage 7 publish_at ≤ now |
| `published` | Live on reader + feeds | — (or revoke) |
| `revoked` | Pulled post-publish (kill switch) | Stage 8b 60s CDN withdrawal |
| `corrected` | Re-issued after a correction | back to `published` |

**Audio** rides a *parallel* state machine on `audio_jobs.audio_status` (migration 0002 enum):
`queued → generating → in_review → (published | skipped)`; `published → revoked`. **No audio crosses
to `published` without `clinical_claims_checked=true` AND `qa_reviewer IS NOT NULL`** (Rule 6,
schema-enforced CHECK in 0002 + RLS in 0012). `revoked` requires `revoke_reason`; `skipped` requires `skip_reason`.

---

## 1. Discovery & ingest → `status='draft'`

| | |
|---|---|
| **Component** | `workers/cron-ingest` (766 LOC) — Mon–Fri 10:30 UTC |
| **Does** | Fetch the global RT source list → dedupe (URL + title-similarity) → embargo-hold split → source-health record → INSERT candidate rows |
| **Leaves** | `status='draft'`, `primary_source_url` set, `signal_scores` NOT yet computed |
| **Rules** | **R1** every candidate carries a source URL · **R2** embargoed rows get `embargoed=true`+`embargo_until` and are held OUT of the publish queue · **R5** fetch failures land in source health, never silently dropped |
| **Open** | SHIP-09 wired the scorer but the ingest worker still sets no `signal_score` at insert → scoring runs as Stage 2 (batch), not inline. Acceptable: drafts don't need a score until triage. |

The CONTENT-4 seed bypasses the cron (hand-curated from grounded research) but lands in the **same
`draft` state** with the **same Rule-1 guarantee**, so Stages 2→8 treat seed and crawled rows identically.

---

## 2. Six-axis signal scoring → `composite_score` + `signal_scores`

| | |
|---|---|
| **Component** | `packages/shared/src/signal-scoring.ts` (SHIP-09) — `compositeScore()` / `scoreBand()` / `rankTopN()` |
| **Contract** | Axes are **0..100**. `composite = Σ wᵢ·axisᵢ`, weights **clinical 0.30 · ai 0.25 · physics 0.15 · operational 0.15 · novelty 0.10 · confidence 0.05** (sum 1.00). Throws on any axis ∉ [0,100]. |
| **Bands** | hero ≥85 · strong ≥70 · standard ≥55 · quick_hit ≥40 · reference <40. Thresholds MUST match the SQL CASE in migration 0001 (`articles_score_band_idx`). |
| **Publish bar** | `MIN_PUBLISH_COMPOSITE = 55` — daily top-5 selection ranks non-embargoed candidates by composite. |
| **Verified** | Seed rows store axes 0..100; in-DB the weighted sum reproduces `composite_score` with **max drift 0.00** across all 44 rows (2026-06-04). The homepage badge and the engine agree. |

**Rubric-band reality:** the clinical+AI weighting (0.55 combined) reserves the **Hero band for
AI × clinical convergence**. Single-axis grounded items (pure clinical RCT, pure physics TG report)
top out at Strong (≤76). Hero *placement* on the homepage is editorial curation, separate from the
composite badge. No score is inflated to manufacture a band.

---

## 3. Draft production → body_md (80% machine, human-finished)

| | |
|---|---|
| **Component** | LLM draft (orchestrated; `packages/llm-orchestrator/`) → human edit per Daily-Production-Runbook §3 + House Style §5 |
| **Does** | Expand the stub/standfirst into the archetype length (short_brief 600–900 · standard_analysis 1,000–1,500 · deep_report 2,000–3,500) following the 10-field item card + house voice |
| **Leaves** | `status='draft'` with a full `body_md`; `word_count` set |
| **Rules** | **R3** any ROMAS Insight/Take is one line ≤240 chars, `romas_insight_labeled=true` (schema CHECK: insight present ⇒ labeled) · House style: no emojis, no "scrape", no unbacked hype |

---

## 4. → `in_review`: stage for verification

Editorial moves the drafted row to `in_review` (CMS action). This is the boundary the fact-checker
and reviewers operate on.

---

## 5. Primary-source fact-check (the hard gate) → stays `in_review` until pass

| | |
|---|---|
| **Components** | `clinical-fact-checker` · `physics-reviewer` · `regulatory-analyst` subagents (`.claude/agents/`) |
| **Does** | Trace every clinical/quantitative/attributed claim to the primary source; physics claims get a dosimetry/QA review; regulatory items get **openFDA → official FDA 510(k)/De Novo/PMA verification** |
| **Rules** | **R1** no claim survives without a primary source · **R4** openFDA discoveries verified against the official FDA record BEFORE the row can advance (worked example: Elekta Evo K252188 verified pre-seed) |
| **Fail** | Claim that won't verify → the claim is cut or the row returns to `draft`; never published on a weak source |

---

## 6. Editorial sign-off → `ready_to_publish`

Owner review (Daily-Production-Runbook §2 Phase 2/4). On approval, status → `ready_to_publish` with
`publish_at` set (three-edition timing per locked decision 8: APAC 22:00 UTC · EU 06:00 UTC ·
Americas 11:00 UTC). `published` requires `author_id` (schema CHECK `articles_published_requires_author`).

---

## 7. Publish → `published` + feeds + reader

| | |
|---|---|
| **Trigger** | scheduler promotes `ready_to_publish` → `published` when `publish_at ≤ now` (embargoed rows excluded — **R2**) |
| **Reader** | `apps/web` data layer reads `status='published'` only (drafts/in_review never reach the public reader — that is why the 44 seed drafts are correctly invisible until they pass Stages 5–6) |
| **Feeds** | `workers/rss-publisher` (688 LOC) regenerates the 4 tiers: `audio-brief.xml` · `daily-brief.xml` · `podcast.xml` · `conference-brief.xml` |

---

## 8. Audio (parallel, QA-gated) + revoke kill switch

### 8a. Audio production → `audio_status='in_review'`

| | |
|---|---|
| **Component** | `workers/audio-producer` (1,214 LOC) — 10-beat script → ElevenLabs (tier voice) → loudness -16 LUFS/-1 dBTP → R2 → `audio_jobs` |
| **Failover** | Jellypod (ADR-0018/Q-F closed) replaces the shut-down PlayHT; `workers/podcast-generator` handles Tier-3 full episodes |
| **Tiers** | Brief (5/7/10 min) · Daily Brief · Podcast (30–60) · Conference Brief — voices by `ELEVENLABS_VOICE_ID_{BRIEF,PODCAST,CONFERENCE}` |
| **Leaves** | `audio_status='in_review'` — NOT yet public |

### 8b. Audio QA gate → `published` | `skipped` (Rule 6, never bypassed)

| | |
|---|---|
| **Component** | `apps/cms/app/audio-qa` (SHIP-10, FR-009) operated by the `audio-qa-reviewer` subagent |
| **Gate** | Flip to `audio_status='published'` requires **`clinical_claims_checked=true` AND `qa_reviewer` set** (schema CHECK + RLS deny-by-default). No code path bypasses it. |
| **Pre/post-roll** | Brief pre-roll: "From ROMAS Intelligence — clinical intelligence for modern radiation oncology." · Podcast post-roll: "Not headlines. Clinical intelligence." |

### 8c. Revoke (post-publish kill switch)

| | |
|---|---|
| **Component** | `workers/cdn-purge-watchdog` (415 LOC, 60s SLA) |
| **Does** | `published → revoked` withdraws audio from CDN within 60s; `rss-publisher` regenerates feeds on the revoke event |

---

## 9. The six inviolable rules — where each is enforced in code

| Rule | Enforcement point | Mechanism |
|---|---|---|
| R1 no source → no publish | `articles_primary_source_required` CHECK (`^https?://`) + Stage 5 | schema + fact-check |
| R2 embargoed never queued | `articles_embargo_consistency` CHECK + ingest split + publish filter | schema + worker |
| R3 Insight labeled | `articles_insight_labeled` CHECK (insight ⇒ labeled) | schema |
| R4 openFDA verified | Stage 5 `regulatory-analyst` openFDA→official record | subagent procedure |
| R5 fetch failures surface | `workers/source-health` + cron-ingest health record | worker |
| R6 no audio without QA | `audio_jobs` CHECK + RLS (`clinical_claims_checked` + `qa_reviewer`) | schema + RLS + CMS UI |

---

## 10. End-to-end smoke path (how to prove the pipeline live)

1. Seed/crawl a `draft` with a real source → confirm row + `primary_source_url` (R1). ✅ done (44 rows).
2. Run `compositeScore()` on its axes → `composite_score` matches in-DB (drift 0.00). ✅ verified.
3. Move `draft → in_review` (CMS) → fact-check the claims (Stage 5).
4. Approve → `ready_to_publish` with `author_id` + `publish_at`.
5. Promote at `publish_at` → `published`; confirm it appears on `apps/web` and in `daily-brief.xml`.
6. Produce audio → `audio_status='in_review'`; attempt publish WITHOUT QA → blocked (R6). Set
   `clinical_claims_checked=true`+`qa_reviewer` → `audio_status='published'`; confirm in `audio-brief.xml`.
7. Revoke → `cdn-purge-watchdog` withdraws in ≤60s; feeds regenerate.

**Status (2026-06-04):** Stages 1–2 verified live (seed + scoring drift 0.00). Stages 3–8 are
code-complete; runtime verification of 5–8 is **gated on Kimal-provisioned** ElevenLabs/R2/Beehiiv
credentials + the editorial QA operator — tracked in `Docs/FOUNDERS-BOARD.md`, not a code gap.

---

## 11. Pipeline component inventory (single source)

| Stage | Component | State | LOC/status |
|---|---|---|---|
| 1 ingest | `workers/cron-ingest` | →draft | 766 real |
| 2 score | `packages/shared/signal-scoring.ts` | composite | real + tested |
| 3 draft | `packages/llm-orchestrator` + human | draft body | real |
| 5 fact-check | `clinical-fact-checker`/`physics-reviewer`/`regulatory-analyst` | in_review | subagents |
| 6 QA-UI | `apps/cms/app/audio-qa` + notices admin | ready_to_publish | SHIP-10 real |
| 7 publish/feeds | `workers/rss-publisher` + `apps/web` data layer | published | 688 real |
| 8a audio | `workers/audio-producer` + `workers/podcast-generator` | audio in_review | 1,214 real |
| 8b audio-QA | `apps/cms/app/audio-qa` (`audio-qa-reviewer`) | audio published | SHIP-10 real |
| 8c revoke | `workers/cdn-purge-watchdog` | revoked | 415 real |
| seed tooling | `tools/content/build-seed.mjs` + `seed-to-db.mjs` | draft | CONTENT-4 |

---

*Finalized 2026-06-04. The pipeline is code-complete and verified through Stage 2; Stages 5–8 await
provisioned credentials (Founders Board), not engineering. Companion: Daily-Production-Runbook
(human cadence), 500-catalog-framework (the backlog), 2026-radonc-landscape-intelligence (the seed source).*
