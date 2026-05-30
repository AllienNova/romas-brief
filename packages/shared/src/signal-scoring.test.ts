// SHIP-09 — signal-scoring engine tests (node:test; folds into SHIP-17).
//   node --experimental-strip-types --test packages/shared/src/signal-scoring.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SIGNAL_WEIGHTS,
  compositeScore,
  scoreBand,
  isPublishable,
  pickTopN,
  MIN_PUBLISH_COMPOSITE,
  type SignalScores,
} from "./signal-scoring.ts";

const axes = (v: number): SignalScores => ({
  clinical: v, ai: v, physics: v, operational: v, novelty: v, confidence: v,
});

test("weights sum to exactly 1.00", () => {
  const sum = Object.values(SIGNAL_WEIGHTS).reduce((a, b) => a + b, 0);
  assert.equal(Number(sum.toFixed(10)), 1);
});

test("all-100 composite is 100, all-0 is 0", () => {
  assert.equal(compositeScore(axes(100)), 100);
  assert.equal(compositeScore(axes(0)), 0);
});

test("weighted composite matches the rubric formula", () => {
  // clinical 90, ai 80, physics 60, operational 40, novelty 100, confidence 50
  // = 90*.30 + 80*.25 + 60*.15 + 40*.15 + 100*.10 + 50*.05 = 27+20+9+6+10+2.5 = 74.5
  const c = compositeScore({ clinical: 90, ai: 80, physics: 60, operational: 40, novelty: 100, confidence: 50 });
  assert.equal(c, 74.5);
});

test("composite is rounded to 2 decimals", () => {
  const c = compositeScore({ clinical: 33, ai: 33, physics: 33, operational: 33, novelty: 33, confidence: 33 });
  assert.equal(c, 33); // 33 * sum(weights)=1 → 33
  const c2 = compositeScore({ clinical: 77, ai: 13, physics: 41, operational: 29, novelty: 5, confidence: 88 });
  assert.equal(Number.isFinite(c2), true);
  assert.equal(Math.round(c2 * 100) === c2 * 100, true);
});

test("invalid axis values throw", () => {
  assert.throws(() => compositeScore({ ...axes(50), clinical: -1 }), /Invalid signal score/);
  assert.throws(() => compositeScore({ ...axes(50), ai: 101 }), /Invalid signal score/);
  assert.throws(() => compositeScore({ ...axes(50), physics: NaN }), /Invalid signal score/);
});

test("scoreBand thresholds match the SQL CASE (0001 index)", () => {
  assert.equal(scoreBand(85), "hero");
  assert.equal(scoreBand(84.99), "strong");
  assert.equal(scoreBand(70), "strong");
  assert.equal(scoreBand(69.99), "standard");
  assert.equal(scoreBand(55), "standard");
  assert.equal(scoreBand(54.99), "quick_hit");
  assert.equal(scoreBand(40), "quick_hit");
  assert.equal(scoreBand(39.99), "reference");
  assert.equal(scoreBand(0), "reference");
});

test("isPublishable gates at 55", () => {
  assert.equal(MIN_PUBLISH_COMPOSITE, 55);
  assert.equal(isPublishable(55), true);
  assert.equal(isPublishable(54.99), false);
});

test("pickTopN filters embargoed, sorts by composite, slices N", () => {
  const items = [
    { id: "a", embargoed: false, scores: axes(90) }, // 90
    { id: "b", embargoed: false, scores: axes(40) }, // 40
    { id: "c", embargoed: true, scores: axes(100) }, // excluded
    { id: "d", embargoed: false, scores: axes(70) }, // 70
  ];
  assert.deepEqual(pickTopN(items, 5), ["a", "d", "b"]);
  assert.deepEqual(pickTopN(items, 2), ["a", "d"]);
});
