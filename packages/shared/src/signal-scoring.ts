// =====================================================================
// packages/shared/src/signal-scoring.ts · ROMAS Brief (SHIP-09 / B-03)
//
// Deterministic six-axis composite signal-scoring engine. Closes the gap
// where nothing computed articles.composite_score — the six axes are
// assigned per the rubric (editorial / signal-scorer agent, 0..100 each),
// and THIS engine turns them into the composite + band deterministically.
//
// Canonical source: .claude/skills/signal-scoring.md (rubric + weights) and
// supabase/migrations/0001_create_articles.sql (band thresholds, used by the
// articles_score_band_idx index → gate-#5 distribution is computable in SQL
// from composite_score and must match scoreBand() here).
// =====================================================================

export interface SignalScores {
  clinical: number; // 0..100
  ai: number;
  physics: number;
  operational: number;
  novelty: number;
  confidence: number;
}

/** Axis weights (sum = 1.00). signal-scoring.md §Formula. */
export const SIGNAL_WEIGHTS: Readonly<Record<keyof SignalScores, number>> = Object.freeze({
  clinical: 0.30,
  ai: 0.25,
  physics: 0.15,
  operational: 0.15,
  novelty: 0.10,
  confidence: 0.05,
});

export type SignalBand = "hero" | "strong" | "standard" | "quick_hit" | "reference";

/** Minimum composite to publish in the daily top-5 (signal-scoring.md §Quality bar). */
export const MIN_PUBLISH_COMPOSITE = 55;

const AXES = Object.keys(SIGNAL_WEIGHTS) as (keyof SignalScores)[];

/**
 * Weighted composite (0..100, 2 decimal places). Throws on any axis that is
 * out of range or non-finite — a published composite must be trustworthy.
 */
export function compositeScore(s: SignalScores): number {
  let total = 0;
  for (const axis of AXES) {
    const v = s[axis];
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 100) {
      throw new Error(`Invalid signal score for "${axis}": ${String(v)} (expected 0..100)`);
    }
    total += v * SIGNAL_WEIGHTS[axis];
  }
  return Number(total.toFixed(2));
}

/**
 * Band for a composite score. Thresholds MUST match the SQL CASE in
 * supabase/migrations/0001 (articles_score_band_idx) so gate-#5 distribution
 * computed in SQL equals what this function would assign.
 */
export function scoreBand(composite: number): SignalBand {
  if (composite >= 85) return "hero";
  if (composite >= 70) return "strong";
  if (composite >= 55) return "standard";
  if (composite >= 40) return "quick_hit";
  return "reference";
}

/** True when the composite clears the top-5 publish bar. */
export function isPublishable(composite: number): boolean {
  return composite >= MIN_PUBLISH_COMPOSITE;
}

/**
 * Rank non-embargoed candidates by composite and return the top N ids
 * (default 5 — the daily top-5). signal-scoring.md §Reference implementation.
 */
export function pickTopN(
  items: ReadonlyArray<{ id: string; embargoed: boolean; scores: SignalScores }>,
  n = 5,
): string[] {
  return items
    .filter((i) => !i.embargoed)
    .map((i) => ({ id: i.id, score: compositeScore(i.scores) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((i) => i.id);
}
