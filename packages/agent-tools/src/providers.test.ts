// =====================================================================
// providers.test.ts — Resend / Twilio / Beehiiv / Supabase builders +
// thin send wrappers (mocked fetch). Contracts verified per ADR-0020.
// =====================================================================

import { test } from "node:test";
import assert from "node:assert/strict";

import { DEFAULT_FROM, buildEmail } from "./resend.ts";
import { buildSmsForm, isE164, messagesEndpoint, sendSms } from "./twilio.ts";
import { buildSubscriptionBody, subscriptionsEndpoint } from "./beehiiv.ts";
import { articlesUrl, parseContentRangeTotal } from "./supabase.ts";

// ---- Resend ----------------------------------------------------------

test("buildEmail: defaults from, carries all fields", () => {
  const p = buildEmail({ to: "d@x.com", subject: "S", html: "<p>H</p>", text: "H" });
  assert.equal(p.from, DEFAULT_FROM);
  assert.equal(p.to, "d@x.com");
  assert.deepEqual(Object.keys(p).sort(), ["from", "html", "subject", "text", "to"]);
});

// ---- Twilio ----------------------------------------------------------

test("isE164: accepts +1..., rejects local/zero-lead", () => {
  assert.equal(isE164("+15551234567"), true);
  assert.equal(isE164("5551234567"), false);
  assert.equal(isE164("+0551234567"), false);
});

test("messagesEndpoint: 2010-04-01 Accounts path", () => {
  assert.equal(
    messagesEndpoint("AC123"),
    "https://api.twilio.com/2010-04-01/Accounts/AC123/Messages.json",
  );
});

test("buildSmsForm: From for a number, MessagingServiceSid for MG...", () => {
  const plain = buildSmsForm({ to: "+15551230000", from: "+15559990000", body: "hi" });
  assert.equal(plain.get("To"), "+15551230000");
  assert.equal(plain.get("From"), "+15559990000");
  assert.equal(plain.get("Body"), "hi");
  assert.equal(plain.get("MessagingServiceSid"), null);

  const svc = buildSmsForm({ to: "+15551230000", from: "MG" + "a".repeat(32), body: "hi" });
  assert.equal(svc.get("MessagingServiceSid"), "MG" + "a".repeat(32));
  assert.equal(svc.get("From"), null);
});

test("sendSms: Basic auth + urlencoded, parses sid/error_code", async () => {
  const orig = globalThis.fetch;
  let seen: { url: string; init: RequestInit } | null = null;
  globalThis.fetch = (async (url: string | URL, init?: RequestInit) => {
    seen = { url: String(url), init: init ?? {} };
    return new Response(JSON.stringify({ sid: "SM1", status: "queued", error_code: null }), { status: 201 });
  }) as typeof fetch;
  try {
    const r = await sendSms("ACx", "tok", { to: "+15551230000", from: "+15559990000", body: "hi" });
    assert.equal(r.ok, true);
    assert.equal(r.status, 201);
    assert.equal(r.sid, "SM1");
    assert.equal(r.errorCode, null);
    const headers = seen!.init.headers as Record<string, string>;
    assert.equal(headers["Authorization"], `Basic ${Buffer.from("ACx:tok").toString("base64")}`);
    assert.equal(headers["Content-Type"], "application/x-www-form-urlencoded");
    assert.equal(seen!.url, "https://api.twilio.com/2010-04-01/Accounts/ACx/Messages.json");
  } finally {
    globalThis.fetch = orig;
  }
});

// ---- Beehiiv ---------------------------------------------------------

test("subscriptionsEndpoint: v2 publications path", () => {
  assert.equal(
    subscriptionsEndpoint("pub_1"),
    "https://api.beehiiv.com/v2/publications/pub_1/subscriptions",
  );
});

test("buildSubscriptionBody: emits only provided fields (no undefined)", () => {
  const minimal = buildSubscriptionBody({ email: "a@b.com" });
  assert.deepEqual(minimal, { email: "a@b.com" });

  const full = buildSubscriptionBody({
    email: "a@b.com",
    tier: "premium",
    reactivate_existing: true,
    utm_source: "romas-wire",
  });
  assert.equal(full["email"], "a@b.com");
  assert.equal(full["tier"], "premium");
  assert.equal(full["reactivate_existing"], true);
  assert.equal(full["utm_source"], "romas-wire");
  assert.equal("send_welcome_email" in full, false);
});

// ---- Supabase (read-only) -------------------------------------------

test("articlesUrl: published filter, desc order, clamped limit", () => {
  const url = new URL(articlesUrl("https://db.example", 5));
  assert.equal(url.pathname, "/rest/v1/articles");
  assert.equal(url.searchParams.get("status"), "eq.published");
  assert.equal(url.searchParams.get("order"), "published_at.desc");
  assert.equal(url.searchParams.get("limit"), "5");
  // clamp out-of-range
  assert.equal(new URL(articlesUrl("https://db.example", 99999)).searchParams.get("limit"), "1000");
});

test("parseContentRangeTotal: reads the total after the slash", () => {
  assert.equal(parseContentRangeTotal("0-24/1234"), 1234);
  assert.equal(parseContentRangeTotal("*/0"), 0);
  assert.equal(parseContentRangeTotal(null), 0);
  assert.equal(parseContentRangeTotal("garbage"), 0);
});
