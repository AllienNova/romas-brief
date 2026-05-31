// =====================================================================
// workers/email-canary/src/resend.test.ts · ROMAS Wire · SHIP-12
// node:test suite for the Resend payload builder + send wrapper. Run with:
//   node --experimental-strip-types --test src/resend.test.ts
// =====================================================================

import { test } from "node:test";
import assert from "node:assert/strict";

import { buildResendPayload, sendEmail, DEFAULT_FROM } from "./resend.ts";

test("buildResendPayload: fills from with DEFAULT_FROM when omitted", () => {
  const p = buildResendPayload({
    to: "doc@example.com",
    subject: "Hi",
    html: "<p>Hi</p>",
    text: "Hi",
  });
  assert.equal(p.from, DEFAULT_FROM);
  assert.equal(p.to, "doc@example.com");
  assert.equal(p.subject, "Hi");
  assert.equal(p.html, "<p>Hi</p>");
  assert.equal(p.text, "Hi");
});

test("buildResendPayload: honors explicit from", () => {
  const p = buildResendPayload({
    from: "Custom <c@romasbrief.com>",
    to: "doc@example.com",
    subject: "Hi",
    html: "<p>Hi</p>",
    text: "Hi",
  });
  assert.equal(p.from, "Custom <c@romasbrief.com>");
});

test("buildResendPayload: carries all 5 fields", () => {
  const p = buildResendPayload({
    to: "a@b.com",
    subject: "S",
    html: "H",
    text: "T",
  });
  assert.deepEqual(Object.keys(p).sort(), ["from", "html", "subject", "text", "to"]);
});

test("sendEmail: POSTs to Resend with Bearer auth + Idempotency-Key", async () => {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const orig = globalThis.fetch;
  globalThis.fetch = (async (url: string | URL, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return new Response(JSON.stringify({ id: "re_123" }), { status: 200 });
  }) as typeof fetch;

  try {
    const payload = buildResendPayload({
      to: "doc@example.com",
      subject: "S",
      html: "H",
      text: "T",
    });
    const result = await sendEmail("re_key_abc", payload, "signup_confirm:doc@example.com");

    assert.equal(result.ok, true);
    assert.equal(result.status, 200);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "https://api.resend.com/emails");
    assert.equal(calls[0].init.method, "POST");
    const headers = calls[0].init.headers as Record<string, string>;
    assert.equal(headers["Authorization"], "Bearer re_key_abc");
    assert.equal(headers["Idempotency-Key"], "signup_confirm:doc@example.com");
    assert.equal(headers["Content-Type"], "application/json");
    assert.equal(JSON.parse(calls[0].init.body as string).from, DEFAULT_FROM);
  } finally {
    globalThis.fetch = orig;
  }
});

test("sendEmail: omits Idempotency-Key header when not provided", async () => {
  const orig = globalThis.fetch;
  let seenHeaders: Record<string, string> = {};
  globalThis.fetch = (async (_url: string | URL, init?: RequestInit) => {
    seenHeaders = (init?.headers as Record<string, string>) ?? {};
    return new Response("{}", { status: 200 });
  }) as typeof fetch;

  try {
    const payload = buildResendPayload({ to: "a@b.com", subject: "S", html: "H", text: "T" });
    await sendEmail("k", payload);
    assert.equal("Idempotency-Key" in seenHeaders, false);
  } finally {
    globalThis.fetch = orig;
  }
});

test("sendEmail: truncates Idempotency-Key to 256 chars", async () => {
  const orig = globalThis.fetch;
  let key = "";
  globalThis.fetch = (async (_url: string | URL, init?: RequestInit) => {
    key = (init?.headers as Record<string, string>)["Idempotency-Key"];
    return new Response("{}", { status: 200 });
  }) as typeof fetch;

  try {
    const payload = buildResendPayload({ to: "a@b.com", subject: "S", html: "H", text: "T" });
    await sendEmail("k", payload, "x".repeat(300));
    assert.equal(key.length, 256);
  } finally {
    globalThis.fetch = orig;
  }
});

test("sendEmail: maps non-2xx to ok=false", async () => {
  const orig = globalThis.fetch;
  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ message: "bad" }), { status: 422 })) as typeof fetch;

  try {
    const payload = buildResendPayload({ to: "a@b.com", subject: "S", html: "H", text: "T" });
    const result = await sendEmail("k", payload, "id");
    assert.equal(result.ok, false);
    assert.equal(result.status, 422);
  } finally {
    globalThis.fetch = orig;
  }
});
