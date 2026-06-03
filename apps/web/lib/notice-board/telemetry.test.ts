// node --experimental-strip-types --test telemetry.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseEventPayload, rollupEvents, fillRate, EVENT_BATCH_MAX } from "./telemetry.ts";

test("parseEventPayload accepts a valid single event", () => {
  const r = parseEventPayload({ noticeId: "n1", kind: "impression", surface: "homepage" });
  assert.deepEqual(r, [{ noticeId: "n1", kind: "impression", surface: "homepage" }]);
});

test("parseEventPayload accepts a valid batch", () => {
  const r = parseEventPayload([
    { noticeId: "n1", kind: "impression", surface: "homepage" },
    { noticeId: "n2", kind: "click", surface: "archive" },
  ]);
  assert.equal(r.length, 2);
});

test("parseEventPayload drops invalid kind/surface/id", () => {
  assert.equal(parseEventPayload({ noticeId: "n1", kind: "scroll", surface: "homepage" }).length, 0);
  assert.equal(parseEventPayload({ noticeId: "n1", kind: "click", surface: "mars" }).length, 0);
  assert.equal(parseEventPayload({ noticeId: "", kind: "click", surface: "homepage" }).length, 0);
  assert.equal(parseEventPayload({ kind: "click", surface: "homepage" }).length, 0);
});

test("parseEventPayload strips PII — only the 3 allowed fields persist", () => {
  const r = parseEventPayload({
    noticeId: "n1",
    kind: "click",
    surface: "homepage",
    userId: "patient-123",
    sessionId: "abc",
    ip: "10.0.0.1",
  });
  assert.deepEqual(Object.keys(r[0]!).sort(), ["kind", "noticeId", "surface"]);
});

test("parseEventPayload caps the batch at EVENT_BATCH_MAX", () => {
  const big = Array.from({ length: 50 }, (_, i) => ({ noticeId: `n${i}`, kind: "impression", surface: "homepage" }));
  assert.equal(parseEventPayload(big).length, EVENT_BATCH_MAX);
});

test("parseEventPayload tolerates garbage", () => {
  assert.equal(parseEventPayload(null).length, 0);
  assert.equal(parseEventPayload("nope").length, 0);
  assert.equal(parseEventPayload([null, 5, "x"]).length, 0);
});

test("rollupEvents aggregates impressions/clicks/CTR, sorted by impressions", () => {
  const rows = [
    { notice_id: "a", kind: "impression" },
    { notice_id: "a", kind: "impression" },
    { notice_id: "a", kind: "click" },
    { notice_id: "b", kind: "impression" },
  ];
  const stats = rollupEvents(rows);
  assert.deepEqual(stats[0], { noticeId: "a", impressions: 2, clicks: 1, ctr: 0.5 });
  assert.deepEqual(stats[1], { noticeId: "b", impressions: 1, clicks: 0, ctr: 0 });
});

test("rollupEvents CTR is 0 when no impressions", () => {
  const stats = rollupEvents([{ notice_id: "a", kind: "click" }]);
  assert.equal(stats[0]!.ctr, 0);
});

test("fillRate divides sold by total, guarding zero", () => {
  assert.equal(fillRate(3, 12), 0.25);
  assert.equal(fillRate(0, 0), 0);
});
