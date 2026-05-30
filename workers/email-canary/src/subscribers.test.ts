// =====================================================================
// workers/email-canary/src/subscribers.test.ts · ROMAS Brief · SHIP-12
// node:test suite for the delivery-event -> subscriber-update mapping.
// Run with:
//   node --experimental-strip-types --test src/subscribers.test.ts
// =====================================================================

import { test } from "node:test";
import assert from "node:assert/strict";

import { mapDeliveryEventToUpdate } from "./subscribers.ts";

const NOW_ISO = "2026-05-30T12:00:00.000Z";

test("mapDeliveryEventToUpdate: email.bounced -> bounced + bounced_at", () => {
  const u = mapDeliveryEventToUpdate("email.bounced", NOW_ISO);
  assert.deepEqual(u, { status: "bounced", bounced_at: NOW_ISO });
});

test("mapDeliveryEventToUpdate: email.complained -> bounced + complained_at", () => {
  const u = mapDeliveryEventToUpdate("email.complained", NOW_ISO);
  assert.deepEqual(u, { status: "bounced", complained_at: NOW_ISO });
});

test("mapDeliveryEventToUpdate: email.delivered -> null (no change)", () => {
  assert.equal(mapDeliveryEventToUpdate("email.delivered", NOW_ISO), null);
});

test("mapDeliveryEventToUpdate: email.sent -> null", () => {
  assert.equal(mapDeliveryEventToUpdate("email.sent", NOW_ISO), null);
});

test("mapDeliveryEventToUpdate: email.opened -> null", () => {
  assert.equal(mapDeliveryEventToUpdate("email.opened", NOW_ISO), null);
});

test("mapDeliveryEventToUpdate: email.clicked -> null", () => {
  assert.equal(mapDeliveryEventToUpdate("email.clicked", NOW_ISO), null);
});

test("mapDeliveryEventToUpdate: email.delivery_delayed -> null", () => {
  assert.equal(mapDeliveryEventToUpdate("email.delivery_delayed", NOW_ISO), null);
});

test("mapDeliveryEventToUpdate: email.failed -> null", () => {
  assert.equal(mapDeliveryEventToUpdate("email.failed", NOW_ISO), null);
});

test("mapDeliveryEventToUpdate: unknown type -> null", () => {
  assert.equal(mapDeliveryEventToUpdate("email.somethingnew", NOW_ISO), null);
});

test("mapDeliveryEventToUpdate: defaults timestamp when nowIso omitted", () => {
  const u = mapDeliveryEventToUpdate("email.bounced");
  assert.ok(u);
  assert.equal(u.status, "bounced");
  assert.ok(typeof u.bounced_at === "string" && u.bounced_at.length > 0);
});
