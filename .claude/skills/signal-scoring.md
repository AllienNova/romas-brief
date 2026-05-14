---
name: signal-scoring
description: Six-axis signal scoring rubric and weighted composite formula for selecting the daily top-5 items. Includes per-axis rubric anchors. Load before scoring any candidate item or building the scoring service.
---

# ROMAS Brief — Signal Scoring

Every candidate item gets scored on six axes (0–100). The composite determines daily top-5.

---

## Formula

```
ClinicalRelevance      × 0.30
AIDisruptionPotential  × 0.25
PhysicsRelevance       × 0.15
OperationalImpact      × 0.15
Novelty                × 0.10
Confidence             × 0.05
────────────────────────────
Composite Signal Score (0–100)
```

Store as `articles.signal_scores` JSONB plus `articles.composite_score` numeric(5,2).

---

## Axis rubrics

### Clinical Relevance (weight 0.30)

| Score | Anchor |
|---|---|
| 90–100 | Changes standard of care or NCCN-pathway logic for a common cancer / RT indication |
| 70–89 | Practice-changing for a sub-population or specific modality |
| 50–69 | Important guideline / NCCN / society update; meaningful trial readout |
| 30–49 | Confirmatory study; incremental finding |
| 10–29 | Pre-clinical, mechanistic, or non-translational |
| 0–9 | Unrelated / not radiation oncology |

### AI Disruption Potential (weight 0.25)

| Score | Anchor |
|---|---|
| 90–100 | New autonomous workflow (e.g., online adaptive, autocontouring with measurable time savings) clears regulatory in a major market |
| 70–89 | Significant AI / ML model published with clinical validation |
| 50–69 | Vendor adds AI-driven feature to existing platform |
| 30–49 | Research-stage model; benchmark publication |
| 10–29 | Conceptual or theoretical AI mention |
| 0–9 | No AI / ML angle |

### Physics Relevance (weight 0.15)

| Score | Anchor |
|---|---|
| 90–100 | New dose calculation algorithm, new commissioning paradigm, or new measurement standard adopted by AAPM / IPEM / EFOMP |
| 70–89 | Significant TPS / QA tool change affecting commissioning or routine QA |
| 50–69 | Useful physics / dosimetry technique paper |
| 30–49 | Incremental dosimetry / QA improvement |
| 10–29 | Tangential physics relevance |
| 0–9 | No physics angle |

### Operational Impact (weight 0.15)

| Score | Anchor |
|---|---|
| 90–100 | Workflow reduction > 30% for a common task, or reimbursement / coverage change affecting clinic economics nationally |
| 70–89 | Workflow change, staffing implication, or coverage decision affecting subset of clinics |
| 50–69 | Notable workflow tool or moderate operational change |
| 30–49 | Marginal operational benefit |
| 10–29 | Theoretical operational implication |
| 0–9 | None |

### Novelty (weight 0.10)

| Score | Anchor |
|---|---|
| 90–100 | First-in-class clearance, first publication of a mechanism, first-mover vendor announcement |
| 70–89 | Substantially novel approach |
| 50–69 | Notably new for the domain |
| 30–49 | Incremental novelty |
| 10–29 | Already widely reported |
| 0–9 | Echo of existing coverage |

### Confidence (weight 0.05)

| Score | Anchor |
|---|---|
| 90–100 | Primary source is FDA / EMA / Apex journal / society guideline |
| 70–89 | Reputable peer-reviewed journal, preprint with strong methodology |
| 50–69 | Preprint, conference abstract |
| 30–49 | Vendor press release with corroborating evidence |
| 10–29 | Vendor press release standalone |
| 0–9 | Rumor / unsourced |

---

## Scoring discipline

- **Independent axis scoring.** Score each axis on its own merits. Don't let a high clinical relevance inflate the physics score.
- **Use the rubric anchors.** Round to nearest 10 when uncertain.
- **One scorer per item at launch.** Spot-check 1 in 10 with a second scorer for calibration drift.
- **Confidence axis is meta**: it weights the others. Low confidence = lower composite even with otherwise high scores.

---

## Reference implementation

```ts
// tools/scoring/composite.ts
export type SignalScores = {
  clinical: number;       // 0..100
  ai: number;
  physics: number;
  operational: number;
  novelty: number;
  confidence: number;
};

const W = {
  clinical: 0.30,
  ai: 0.25,
  physics: 0.15,
  operational: 0.15,
  novelty: 0.10,
  confidence: 0.05,
};

export function compositeScore(s: SignalScores): number {
  for (const k of Object.keys(W) as (keyof SignalScores)[]) {
    const v = s[k];
    if (v < 0 || v > 100 || !Number.isFinite(v)) {
      throw new Error(`Invalid score for ${k}: ${v}`);
    }
  }
  return Number(
    (s.clinical*W.clinical + s.ai*W.ai + s.physics*W.physics
   + s.operational*W.operational + s.novelty*W.novelty + s.confidence*W.confidence)
    .toFixed(2)
  );
}

export function pickTop5(items: Array<{ id: string; embargoed: boolean; scores: SignalScores }>): string[] {
  return items
    .filter(i => !i.embargoed)
    .map(i => ({ id: i.id, score: compositeScore(i.scores) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(i => i.id);
}
```

---

## Quality bar (do not pad)

- **Minimum composite to publish in top-5: 55.**
- If fewer than 5 items clear 55, **ship fewer**. Surface the short list to morning brief.
- Quick-hits backlog: next 10 ranked items (any composite). These go in the issue's Quick Hits section, not the top-5.

---

## Calibration

Weekly: editorial-director reviews previous week's top-5 against engagement (opens, click-through, audio plays).

- If a high-scored item underperformed → re-evaluate the rubric anchor or the source attribution.
- If a low-scored item over-performed → mine for missed signal in the axis breakdown.

---

*Scoring is the brand's editorial spine. Treat the rubric anchors as load-bearing.*
