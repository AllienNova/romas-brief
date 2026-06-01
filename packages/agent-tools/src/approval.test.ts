// =====================================================================
// approval.test.ts — the security gate. Run:
//   node --experimental-strip-types --test src/approval.test.ts
// =====================================================================

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  InMemoryStagedStore,
  executeApproved,
  stageSend,
  tokensMatch,
  type Executor,
} from "./approval.ts";

const NOW = new Date("2026-06-01T08:00:00.000Z");

test("tokensMatch: equal tokens match; mismatch/empty/length-diff fail", () => {
  assert.equal(tokensMatch("abc123", "abc123"), true);
  assert.equal(tokensMatch("abc123", "abc124"), false);
  assert.equal(tokensMatch("abc", "abcd"), false);
  assert.equal(tokensMatch("", "abc"), false);
  assert.equal(tokensMatch(undefined, "abc"), false);
  assert.equal(tokensMatch("abc", undefined), false);
});

test("stageSend: returns a public view with an id and no payload field", () => {
  const store = new InMemoryStagedStore();
  const view = stageSend(store, NOW, {
    channel: "email",
    summary: 'email "Hi" → d@x.com',
    recipientCount: 1,
    payload: { kind: "email", to: "d@x.com" },
  });
  assert.ok(view.id.length > 0);
  assert.equal(view.channel, "email");
  assert.equal(view.recipientCount, 1);
  assert.equal(view.createdAt, NOW.toISOString());
  assert.equal("payload" in view, false);
  // stored record retains the payload internally
  assert.deepEqual(store.get(view.id)?.payload, { kind: "email", to: "d@x.com" });
});

test("InMemoryStagedStore.list: omits payloads", () => {
  const store = new InMemoryStagedStore();
  stageSend(store, NOW, { channel: "sms", summary: "s", recipientCount: 1, payload: { secret: 1 } });
  const list = store.list();
  assert.equal(list.length, 1);
  assert.equal("payload" in list[0]!, false);
});

test("executeApproved: WRONG token never calls executor and keeps the record", async () => {
  const store = new InMemoryStagedStore();
  const view = stageSend(store, NOW, { channel: "email", summary: "e", recipientCount: 1, payload: { kind: "email" } });
  let called = false;
  const exec: Executor<unknown> = async () => {
    called = true;
    return { ok: true, status: 200 };
  };

  const res = await executeApproved(store, view.id, "wrong", "right", exec);

  assert.equal(res.ok, false);
  assert.equal(res.reason, "unauthorized");
  assert.equal(called, false, "executor MUST NOT run on bad token");
  assert.ok(store.get(view.id), "record MUST remain after a rejected approval");
});

test("executeApproved: absent token is unauthorized (no execution)", async () => {
  const store = new InMemoryStagedStore();
  const view = stageSend(store, NOW, { channel: "sms", summary: "s", recipientCount: 1, payload: {} });
  let called = false;
  const res = await executeApproved(store, view.id, undefined, "right", async () => {
    called = true;
    return { ok: true, status: 200 };
  });
  assert.equal(res.reason, "unauthorized");
  assert.equal(called, false);
});

test("executeApproved: correct token executes, then deletes the record", async () => {
  const store = new InMemoryStagedStore();
  const view = stageSend(store, NOW, { channel: "email", summary: "e", recipientCount: 1, payload: { kind: "email", to: "d@x.com" } });
  const seen: unknown[] = [];
  const res = await executeApproved(store, view.id, "right", "right", async (payload) => {
    seen.push(payload);
    return { ok: true, status: 202, ref: "re_1" };
  });
  assert.equal(res.ok, true);
  assert.equal(res.reason, "executed");
  assert.equal(res.status, 202);
  assert.equal(res.ref, "re_1");
  assert.deepEqual(seen, [{ kind: "email", to: "d@x.com" }]);
  assert.equal(store.get(view.id), undefined, "executed record is removed");
});

test("executeApproved: unknown id is not_found", async () => {
  const store = new InMemoryStagedStore();
  const res = await executeApproved(store, "nope", "right", "right", async () => ({ ok: true, status: 200 }));
  assert.equal(res.reason, "not_found");
});

test("executeApproved: failed provider keeps the record for retry", async () => {
  const store = new InMemoryStagedStore();
  const view = stageSend(store, NOW, { channel: "email", summary: "e", recipientCount: 1, payload: {} });
  const res = await executeApproved(store, view.id, "t", "t", async () => ({ ok: false, status: 500 }));
  assert.equal(res.ok, false);
  assert.equal(res.reason, "failed");
  assert.equal(res.status, 500);
  assert.ok(store.get(view.id), "failed send remains staged for retry");
});
