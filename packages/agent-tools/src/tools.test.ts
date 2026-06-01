// =====================================================================
// tools.test.ts — the four tool definitions wired over the primitives.
// Asserts: send tools only STAGE (never call a provider); quota blocks;
// the read tool reads (mocked fetch) and never writes.
// =====================================================================

import { test } from "node:test";
import assert from "node:assert/strict";

import { buildTools, type ToolDeps, type ToolDef } from "./tools.ts";
import { InMemoryStagedStore } from "./approval.ts";
import { InMemoryQuotaStore } from "./quota.ts";
import { InMemoryAuditSink } from "./audit.ts";

function deps(over: Partial<ToolDeps> = {}): ToolDeps {
  return {
    staged: new InMemoryStagedStore(),
    quota: new InMemoryQuotaStore(),
    limits: { email: 1, sms: 2, beehiiv: 2 },
    audit: new InMemoryAuditSink(),
    now: () => new Date("2026-06-01T08:00:00.000Z"),
    env: { supabaseUrl: "https://db.example", supabaseAnonKey: "anon_ro" },
    ...over,
  };
}

function byName(tools: ToolDef[], name: string): ToolDef {
  const t = tools.find((x) => x.name === name);
  assert.ok(t, `tool ${name} exists`);
  return t;
}

test("buildTools: exposes exactly the four ROMAS tools", () => {
  const names = buildTools(deps()).map((t) => t.name).sort();
  assert.deepEqual(names, [
    "romas_get_content",
    "romas_manage_subscriber",
    "romas_send_email",
    "romas_send_sms",
  ]);
});

test("romas_send_email: stages (no send), records quota + audit", async () => {
  const d = deps();
  const tools = buildTools(d);
  const res = await byName(tools, "romas_send_email").handler({
    to: "doc@example.com",
    subject: "Your ROMAS Wire audio",
    html: "<p>Listen</p>",
    text: "Listen",
  });
  assert.match(res.content[0]!.text, /^STAGED /);
  assert.equal(res.isError, undefined);
  assert.equal(d.staged.list().length, 1, "exactly one staged send");
  assert.equal(d.staged.list()[0]!.channel, "email");
  const sink = d.audit as InMemoryAuditSink;
  assert.equal(sink.lines.length, 1);
  assert.match(sink.lines[0]!, /"action":"stage"/);
});

test("romas_send_email: blocks when the daily quota is exhausted", async () => {
  const d = deps(); // email limit = 1
  const tools = buildTools(d);
  const email = byName(tools, "romas_send_email");
  const args = { to: "a@b.com", subject: "S", html: "<p>H</p>", text: "H" };
  await email.handler(args);
  const blocked = await email.handler({ ...args, to: "c@d.com" });
  assert.equal(blocked.isError, true);
  assert.match(blocked.content[0]!.text, /quota reached/i);
  assert.equal(d.staged.list().length, 1, "the blocked send is NOT staged");
});

test("romas_send_sms: rejects a non-E.164 number at the schema boundary", async () => {
  const tools = buildTools(deps());
  await assert.rejects(
    () => byName(tools, "romas_send_sms").handler({ to: "5551234567", body: "hi" }),
    /E\.164|invalid/i,
  );
});

test("romas_get_content: reads published articles + subscriber count (mocked)", async () => {
  const orig = globalThis.fetch;
  globalThis.fetch = (async (_url: string | URL, init?: RequestInit) => {
    if (init?.method === "HEAD") {
      return new Response(null, { status: 200, headers: { "content-range": "0-0/4242" } });
    }
    return new Response(
      JSON.stringify([{ title: "FLASH RT update", slug: "flash-rt", published_at: "2026-06-01T00:00:00Z", thumbnail_url: null }]),
      { status: 200 },
    );
  }) as typeof fetch;
  try {
    const d = deps();
    const res = await byName(buildTools(d), "romas_get_content").handler({ limit: 5 });
    assert.equal(res.isError, undefined);
    assert.match(res.content[0]!.text, /Active subscribers: 4242/);
    assert.match(res.content[0]!.text, /FLASH RT update \(\/flash-rt\)/);
    assert.equal(d.staged.list().length, 0, "read tool never stages anything");
  } finally {
    globalThis.fetch = orig;
  }
});

test("romas_get_content: errors cleanly when Supabase env is absent", async () => {
  const res = await byName(buildTools(deps({ env: {} })), "romas_get_content").handler({});
  assert.equal(res.isError, true);
  assert.match(res.content[0]!.text, /not configured/i);
});
