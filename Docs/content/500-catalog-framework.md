---
title: ROMAS Wire — 500-Article Launch Catalog Framework
version: 1.0.0
date: 2026-06-04
owner: Kimal Honour Djam
status: Build framework — the structure the landscape research populates and the pipeline produces
authority: ROMAS-Brief-500-Article-Launch-Plan.md (distribution) · SSOT (locked decisions) · signal-scoring skill
---

# 500-Article Launch Catalog — Build Framework

The catalog is the editorial backlog that the production pipeline drafts into the live
`articles` table. Each catalog entry is one future `articles` row. **No entry is fabricated:
every row carries a real `primary_source_url` (Rule 1) before it can leave `draft`.** The
catalog is built from the grounded landscape research (CONTENT-2) and filled over the 8-week
ramp by the pipeline (CONTENT-5).

## 1. Catalog entry → `articles` column mapping

The live `articles` table (verified 2026-06-04, project `rjpuxf…`) is the schema. Each
catalog row maps 1:1:

| Catalog field | `articles` column | Notes |
|---|---|---|
| slug | `slug` | kebab, unique |
| archetype | `archetype` | **short_brief** (600–900) · **standard_analysis** (1000–1500) · **deep_report** (2000–3500) |
| tier | `tier` | daily · friday_read · conference (editorial edition) |
| category | `category` | **ai · physics · clinical_rt · regulatory · guidelines · reimbursement · vendor · conferences · resident_education · future_rt · operations** (the live enum) |
| subcategory | `subcategory` | per §2.1 split |
| content_type | `content_type` | news_brief · paper_critique · practice_delta · fda_brief · reimbursement_explainer · **vendor_intel** · long_take · primer |
| title | `title` | ≤90 chars, no hype words |
| standfirst | `standfirst` | the deck |
| primary_source_url | `primary_source_url` | **REQUIRED before non-draft (Rule 1)** |
| primary_source_type | `primary_source_type` | journal_article · clinical_trial · fda_clearance · society_guideline · tg_report · vendor_pr · cms_rule · nice_appraisal · conference_abstract · preprint · regulatory_guidance |
| region | `region` | US · Europe · UK · APAC(+country) · Canada · LATAM · MENA-Africa · Global |
| audience_tags | `audience_tags` | physician · physicist · dosimetrist · therapist · resident · industry · investor · researcher |
| modality_tags | `modality_tags` | imrt · vmat · sbrt · proton · mr_linac · flash · brachy · adaptive … |
| disease_site_tags | `disease_site_tags` | lung · prostate · breast · h_n · cns · gi · gyn · pediatric … |
| source_language | `source_language` | en default; pt/es for LATAM (SSOT 18 → translate + footer) |
| signal axes | `signal_scores` (jsonb) | {clinical, ai, physics, operational, novelty, confidence} each 0–1 |
| composite | `composite_score` | computed (rubric §3) 0–100 |
| status | `status` | starts `draft`; → `in_review` → `published` only after fact-check (Rule 4) |
| embargo | `embargoed` / `embargo_until` | embargoed items NEVER enter the publish queue (Rule 2) |

## 2. Distribution targets (the catalog must satisfy all five simultaneously)

- **Category** (§2.1): AI 100 · Physics 70 · Clinical 80 · Regulatory 50 · Guidelines 40 · Reimbursement 30 · Vendor 50 · Conference 30 · Resident 20 · Future 15 · Ops 15.
- **Region** (SSOT 15): US 110 · Europe 160 · APAC 130 · LATAM 40 · Canada 20 · MENA-Africa 20 · Global 20. Max 2/6 same-region on the Top-Stories grid.
- **Content type** (§2.4): news_brief 250 · paper_critique 100 · practice_delta 40 · fda_brief 35 · reimbursement_explainer 25 · vendor_note 25 · long_take 15 · primer 10.
- **Signal band** (§2.6): Hero 85–100 ×50 · Strong 70–84 ×150 · Standard 55–69 ×200 · Quick 40–54 ×80 · Reference 25–39 ×20.
- **Freshness** (§2.5): ≤30d ×150 · 31–90d ×150 · 91–180d ×100 · 181–365d ×70 · evergreen ×30.
- **Audience** (§2.3): physician 175 · physicist 140 · dosimetrist 65 · therapist 35 · resident 30 · industry 35 · investor 10 · researcher 10.

## 3. Six-axis signal rubric (composite = weighted sum × 100)

Weights (locked): **Clinical 0.30 · AI 0.25 · Physics 0.15 · Operational 0.15 · Novelty 0.10 · Confidence 0.05.** Each axis scored 0–1:

- **Clinical** — does it change how a clinician treats *today*? (RCT > cohort > case series; practice impact)
- **AI** — AI/ML relevance + adoption readiness
- **Physics** — effect on QA, planning, dosimetry, commissioning
- **Operational** — workflow, staffing, throughput, reimbursement weight
- **Novelty** — genuinely new vs incremental
- **Confidence** — evidence strength + source authority

`composite_score = round(100 × (0.30·clin + 0.25·ai + 0.15·phys + 0.15·op + 0.10·nov + 0.05·conf))`.
This is the same formula the `signal-scoring` engine + the homepage badge use.

## 4. Seed format + bulk load

Catalog rows live as **NDJSON** at `Docs/content/catalog/seed.ndjson` (one JSON object per
line, fields = §1). Populated from the CONTENT-2 research findings. Load path:

1. Validate each row: required fields present; `primary_source_url` non-empty for any row
   intended to publish; signal axes ∈ [0,1]; category/region/content_type ∈ the enums.
2. Compute `composite_score` from the axes (rubric §3).
3. Bulk insert into `articles` at `status='draft'` (Management API `database/query` INSERT,
   or `supabase` CLI). Rule 1 enforced: a row with no `primary_source_url` stays a topic
   stub, not a publishable article.
4. The pipeline (CONTENT-5) drafts the body, fact-checks against the primary source, scores,
   and moves `draft → in_review → published` per the editorial gates.

## 5. Inviolable constraints carried into every entry

1. **No `primary_source_url` → no publish** (Rule 1). Topic stubs allowed in `draft` only.
2. **Embargoed items never enter the publish queue** (Rule 2) — `embargoed=true` + `embargo_until`.
3. **ROMAS Insight is labeled interpretation** (Rule 3) — `romas_insight_labeled=true`.
4. **openFDA discoveries verified against the official FDA record before drafting** (Rule 4).
5. **Source-fetch failures surface in source health** (Rule 5) — never silently dropped.
6. **LATAM rows** (SSOT 18): `source_language` pt/es, original URL preserved, mandatory
   translated-with-review footer, DeepL Pro + Claude verification on Hero/Strong bands.

## 6. Build order

1. CONTENT-2 research → structured findings (5 domains).
2. Map findings → catalog rows (this framework), distributing to hit §2 targets.
3. Seed `draft` rows into `articles` (Rule 1: real sources only).
4. CONTENT-5 pipeline drafts/fact-checks/scores → `in_review` → `published` over the 8-week ramp.

## 7. Seed status (CONTENT-4, applied 2026-06-04)

The grounded launch tranche is **live**: 44 source-verified `draft` rows seeded into `articles`
on project `rjpuxfbuzispklcstuzo` from `Docs/content/2026-radonc-landscape-intelligence.md`.

- **Generator:** `tools/content/build-seed.mjs` (findings + locked rubric + enum validation → `catalog/seed.ndjson`).
- **Loader:** `tools/content/seed-to-db.mjs` (dollar-quoted `jsonb_to_recordset` INSERT, `ON CONFLICT (slug) DO NOTHING`, idempotent).
- **Verified:** 44/44 carry a valid `primary_source_url` (Rule 1, enforced by `articles_primary_source_required` CHECK). Composite 47→76.
- **Remaining ~456** are produced by the CONTENT-5 pipeline over the 8-week ramp from ongoing cron discovery — not hand-seeded (no fabrication).

### Rubric-band note (why no seed row is "Hero")

The locked composite weights **clinical 0.30 + ai 0.25 = 0.55** of the score. The grounded tranche is
mostly *single-axis-dominant* (a pure clinical RCT, a pure physics TG report, a pure regulatory
guidance), so the highest seed composite is **76** — top of the **Strong** band. The **Hero band
(85–100)** is structurally reserved for **AI × clinical convergence** stories (an AI tool that
*changes how a clinician treats*), which is the rubric's deliberate AI-native intent. **No seed row
was inflated to manufacture a Hero score.** Homepage "Hero" *placement* is an editorial-curation
decision separate from the composite badge — a Strong-scored flagship RCT can still be featured.
