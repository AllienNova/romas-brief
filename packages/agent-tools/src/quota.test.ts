// =====================================================================
// quota.test.ts — per-day, per-channel runaway guard.
// =====================================================================

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  InMemoryQuotaStore,
  canStage,
  dayKey,
  recordStage,
  remaining,
  type QuotaLimits,
} from "./quota.ts";

const LIMITS: QuotaLimits = { email: 2, sms: 1, beehiiv: 3 };
const DAY1 = new Date("2026-06-01T23:59:00.000Z");
const DAY2 = new Date("2026-06-02T00:01:00.000Z");

test("dayKey: UTC calendar day", () => {
  assert.equal(dayKey(DAY1), "2026-06-01");
  assert.equal(dayKey(DAY2), "2026-06-02");
});

test("canStage/recordStage: enforces the per-channel daily limit", () => {
  const store = new InMemoryQuotaStore();
  assert.equal(canStage(store, LIMITS, DAY1, "email"), true);
  recordStage(store, DAY1, "email");
  assert.equal(remaining(store, LIMITS, DAY1, "email"), 1);
  recordStage(store, DAY1, "email");
  assert.equal(canStage(store, LIMITS, DAY1, "email"), false, "over the limit of 2");
  assert.equal(remaining(store, LIMITS, DAY1, "email"), 0);
});

test("channels are independent", () => {
  const store = new InMemoryQuotaStore();
  recordStage(store, DAY1, "sms"); // sms limit is 1
  assert.equal(canStage(store, LIMITS, DAY1, "sms"), false);
  assert.equal(canStage(store, LIMITS, DAY1, "email"), true);
  assert.equal(canStage(store, LIMITS, DAY1, "beehiiv"), true);
});

test("counter rolls over to a new UTC day", () => {
  const store = new InMemoryQuotaStore();
  recordStage(store, DAY1, "sms");
  assert.equal(canStage(store, LIMITS, DAY1, "sms"), false);
  assert.equal(canStage(store, LIMITS, DAY2, "sms"), true, "fresh day, fresh quota");
});

test("remaining never goes negative", () => {
  const store = new InMemoryQuotaStore();
  recordStage(store, DAY1, "sms");
  recordStage(store, DAY1, "sms"); // pushed past the limit of 1
  assert.equal(remaining(store, LIMITS, DAY1, "sms"), 0);
});
