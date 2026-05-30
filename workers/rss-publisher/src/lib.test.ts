/**
 * rss-publisher · lib.test.ts (SHIP-15)
 * node:test suite for the pure helpers extracted from index.ts.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  VALID_FEED_TIERS,
  estimateEnclosureBytes,
  regenerateDecision,
} from "./lib.ts";

test("estimateEnclosureBytes: duration → bytes at default 128 kbps", () => {
  // 128 kbps = 16000 bytes/sec
  assert.equal(estimateEnclosureBytes(1), 16000);
  assert.equal(estimateEnclosureBytes(60), 960000);
  // 7 min brief ≈ 420s
  assert.equal(estimateEnclosureBytes(420), 6720000);
});

test("estimateEnclosureBytes: respects a custom bitrate", () => {
  // 64 kbps = 8000 bytes/sec
  assert.equal(estimateEnclosureBytes(10, 64), 80000);
});

test("estimateEnclosureBytes: zero/negative/non-finite → minimal positive (1)", () => {
  assert.equal(estimateEnclosureBytes(0), 1);
  assert.equal(estimateEnclosureBytes(-5), 1);
  assert.equal(estimateEnclosureBytes(Number.NaN), 1);
  assert.equal(estimateEnclosureBytes(Number.POSITIVE_INFINITY), 1);
});

test("estimateEnclosureBytes: never emits a misleading 0", () => {
  assert.ok(estimateEnclosureBytes(0) > 0);
  assert.ok(estimateEnclosureBytes(420) > 0);
});

test("regenerateDecision: missing/empty tier → regenerate ALL", () => {
  assert.deepEqual(regenerateDecision(undefined), {
    action: "all",
    tiers: VALID_FEED_TIERS,
  });
  assert.deepEqual(regenerateDecision(null), {
    action: "all",
    tiers: VALID_FEED_TIERS,
  });
  assert.deepEqual(regenerateDecision(""), {
    action: "all",
    tiers: VALID_FEED_TIERS,
  });
});

test("regenerateDecision: valid tier → regenerate that one", () => {
  assert.deepEqual(regenerateDecision("podcast"), {
    action: "one",
    tier: "podcast",
  });
  assert.deepEqual(regenerateDecision("audio-brief"), {
    action: "one",
    tier: "audio-brief",
  });
  assert.deepEqual(regenerateDecision("conference-brief"), {
    action: "one",
    tier: "conference-brief",
  });
});

test("regenerateDecision: invalid tier → 400 (invalid), not empty-success", () => {
  assert.deepEqual(regenerateDecision("video-podcast"), {
    action: "invalid",
    tier: "video-podcast",
  });
  assert.deepEqual(regenerateDecision("bogus"), {
    action: "invalid",
    tier: "bogus",
  });
  // non-string truthy values are also invalid (not all, not one)
  assert.deepEqual(regenerateDecision(123), { action: "invalid", tier: "123" });
});

test("VALID_FEED_TIERS: the 4 launch tiers, no video-podcast (Day 60)", () => {
  assert.deepEqual([...VALID_FEED_TIERS], [
    "audio-brief",
    "daily-brief",
    "podcast",
    "conference-brief",
  ]);
});
