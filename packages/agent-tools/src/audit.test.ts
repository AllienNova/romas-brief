// =====================================================================
// audit.test.ts — redaction + PII masking + line format.
// =====================================================================

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  InMemoryAuditSink,
  audit,
  formatAudit,
  maskEmail,
  maskPhone,
  redact,
} from "./audit.ts";

test("maskEmail: first char + domain", () => {
  assert.equal(maskEmail("doctor@example.com"), "d***@example.com");
  assert.equal(maskEmail("notanemail"), "n***");
});

test("maskPhone: last 4", () => {
  assert.equal(maskPhone("+15551234567"), "***4567");
  assert.equal(maskPhone("123"), "***");
});

test("redact: drops secret-keyed values", () => {
  const out = redact({ apiKey: "sk_live_x", Authorization: "Bearer y", token: "z", keep: "ok" });
  assert.equal(out["apiKey"], "[REDACTED]");
  assert.equal(out["Authorization"], "[REDACTED]");
  assert.equal(out["token"], "[REDACTED]");
  assert.equal(out["keep"], "ok");
});

test("redact: masks email/to/phone PII keys", () => {
  const out = redact({ email: "a@b.com", to: "+15551230000", phone: "+15559998888", subject: "Hello" });
  assert.equal(out["email"], "a***@b.com");
  assert.equal(out["to"], "***0000");
  assert.equal(out["phone"], "***8888");
  assert.equal(out["subject"], "Hello");
});

test("redact: recurses into nested objects and arrays", () => {
  const out = redact({
    nested: { secret: "s", email: "x@y.com" },
    items: [{ token: "t", name: "ok" }],
  });
  assert.deepEqual(out["nested"], { secret: "[REDACTED]", email: "x***@y.com" });
  assert.deepEqual(out["items"], [{ token: "[REDACTED]", name: "ok" }]);
});

test("formatAudit + audit: emits one redacted JSON line", () => {
  const sink = new InMemoryAuditSink();
  audit(sink, {
    ts: "2026-06-01T00:00:00.000Z",
    actor: "agent",
    action: "stage",
    channel: "email",
    detail: { id: "abc", email: "doc@x.com", apiKey: "leak" },
  });
  assert.equal(sink.lines.length, 1);
  const parsed = JSON.parse(sink.lines[0]!) as Record<string, unknown>;
  assert.equal(parsed["actor"], "agent");
  assert.equal(parsed["action"], "stage");
  const detail = parsed["detail"] as Record<string, unknown>;
  assert.equal(detail["email"], "d***@x.com");
  assert.equal(detail["apiKey"], "[REDACTED]");
  assert.equal(detail["id"], "abc");
});
