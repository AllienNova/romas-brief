// =====================================================================
// workers/beehiiv-webhook/src/sync.test.ts · ROMAS Brief · SHIP-11
// node:test unit suite for the pure sync core. Run with:
//   node --experimental-strip-types --test src/sync.test.ts
// =====================================================================

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  verifySecret,
  mapStatus,
  parseEvent,
  buildSubscriberUpsert,
  type BeehiivEvent,
} from "./sync.ts";

// ---------------------------------------------------------------------
// verifySecret
// ---------------------------------------------------------------------
test("verifySecret: matching Bearer token returns true", () => {
  assert.equal(verifySecret("Bearer s3cr3t", "s3cr3t"), true);
});

test("verifySecret: mismatched token returns false", () => {
  assert.equal(verifySecret("Bearer wrong", "s3cr3t"), false);
});

test("verifySecret: same-length mismatch returns false", () => {
  assert.equal(verifySecret("Bearer aaaaaa", "bbbbbb"), false);
});

test("verifySecret: missing header returns false", () => {
  assert.equal(verifySecret(null, "s3cr3t"), false);
});

test("verifySecret: missing secret returns false", () => {
  assert.equal(verifySecret("Bearer s3cr3t", undefined), false);
});

test("verifySecret: non-Bearer scheme returns false", () => {
  assert.equal(verifySecret("Basic s3cr3t", "s3cr3t"), false);
});

// ---------------------------------------------------------------------
// mapStatus — all six Beehiiv inputs
// ---------------------------------------------------------------------
test("mapStatus: active -> active", () => {
  assert.equal(mapStatus("active"), "active");
});

test("mapStatus: validating -> active", () => {
  assert.equal(mapStatus("validating"), "active");
});

test("mapStatus: pending -> active", () => {
  assert.equal(mapStatus("pending"), "active");
});

test("mapStatus: inactive -> unsubscribed", () => {
  assert.equal(mapStatus("inactive"), "unsubscribed");
});

test("mapStatus: invalid -> unsubscribed", () => {
  assert.equal(mapStatus("invalid"), "unsubscribed");
});

test("mapStatus: needs_attention -> bounced", () => {
  assert.equal(mapStatus("needs_attention"), "bounced");
});

test("mapStatus: undefined -> active (least-destructive default)", () => {
  assert.equal(mapStatus(undefined), "active");
});

// ---------------------------------------------------------------------
// parseEvent
// ---------------------------------------------------------------------
const validBody = {
  uid: "evt_123",
  event_timestamp: 1_700_000_000,
  event_type: "subscription.created",
  data: { id: "sub_abc", email: "doc@example.com", status: "active" },
};

test("parseEvent: valid payload parses and narrows", () => {
  const e = parseEvent(validBody);
  assert.ok(e);
  assert.equal(e.uid, "evt_123");
  assert.equal(e.event_type, "subscription.created");
  assert.equal(e.data.id, "sub_abc");
  assert.equal(e.data.email, "doc@example.com");
  assert.equal(e.data.status, "active");
});

test("parseEvent: optional fields carried through", () => {
  const e = parseEvent({
    ...validBody,
    data: { ...validBody.data, created: 1_699_000_000, subscription_tier: "premium" },
  });
  assert.ok(e);
  assert.equal(e.data.created, 1_699_000_000);
  assert.equal(e.data.subscription_tier, "premium");
});

test("parseEvent: null body rejected", () => {
  assert.equal(parseEvent(null), null);
});

test("parseEvent: non-object body rejected", () => {
  assert.equal(parseEvent("nope"), null);
});

test("parseEvent: missing uid rejected", () => {
  const { uid, ...rest } = validBody;
  void uid;
  assert.equal(parseEvent(rest), null);
});

test("parseEvent: missing event_type rejected", () => {
  const { event_type, ...rest } = validBody;
  void event_type;
  assert.equal(parseEvent(rest), null);
});

test("parseEvent: non-numeric event_timestamp rejected", () => {
  assert.equal(parseEvent({ ...validBody, event_timestamp: "soon" }), null);
});

test("parseEvent: missing data.email rejected", () => {
  assert.equal(
    parseEvent({ ...validBody, data: { id: "sub_abc" } }),
    null,
  );
});

test("parseEvent: missing data.id rejected", () => {
  assert.equal(
    parseEvent({ ...validBody, data: { email: "doc@example.com" } }),
    null,
  );
});

// ---------------------------------------------------------------------
// buildSubscriberUpsert
// ---------------------------------------------------------------------
function evt(event_type: string, status?: string): BeehiivEvent {
  return {
    uid: "evt_x",
    event_timestamp: 1_700_000_000, // -> 2023-11-14T22:13:20.000Z
    event_type,
    data: {
      id: "sub_abc",
      email: "doc@example.com",
      ...(status !== undefined ? { status: status as never } : {}),
    },
  };
}

const EXPECTED_ISO = new Date(1_700_000_000 * 1000).toISOString();

test("buildSubscriberUpsert: created -> mapped status, no timestamps", () => {
  const row = buildSubscriberUpsert(evt("subscription.created", "active"));
  assert.deepEqual(row, {
    email: "doc@example.com",
    beehiiv_subscription_id: "sub_abc",
    status: "active",
  });
});

test("buildSubscriberUpsert: created with inactive status -> unsubscribed", () => {
  const row = buildSubscriberUpsert(evt("subscription.created", "inactive"));
  assert.equal(row.status, "unsubscribed");
});

test("buildSubscriberUpsert: confirmed -> active + confirmed_at ISO", () => {
  const row = buildSubscriberUpsert(evt("subscription.confirmed", "pending"));
  assert.equal(row.status, "active");
  assert.equal(row.confirmed_at, EXPECTED_ISO);
  assert.equal(row.unsubscribed_at, undefined);
});

test("buildSubscriberUpsert: deleted -> unsubscribed + unsubscribed_at ISO", () => {
  const row = buildSubscriberUpsert(evt("subscription.deleted", "inactive"));
  assert.equal(row.status, "unsubscribed");
  assert.equal(row.unsubscribed_at, EXPECTED_ISO);
  assert.equal(row.confirmed_at, undefined);
});

test("buildSubscriberUpsert: paused -> unsubscribed + unsubscribed_at ISO", () => {
  const row = buildSubscriberUpsert(evt("subscription.paused"));
  assert.equal(row.status, "unsubscribed");
  assert.equal(row.unsubscribed_at, EXPECTED_ISO);
});

test("buildSubscriberUpsert: resumed -> mapped status", () => {
  const row = buildSubscriberUpsert(evt("subscription.resumed", "active"));
  assert.equal(row.status, "active");
  assert.equal(row.unsubscribed_at, undefined);
});

test("buildSubscriberUpsert: always carries email + beehiiv id", () => {
  const row = buildSubscriberUpsert(evt("subscription.upgraded", "active"));
  assert.equal(row.email, "doc@example.com");
  assert.equal(row.beehiiv_subscription_id, "sub_abc");
});
