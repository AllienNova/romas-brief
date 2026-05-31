// =====================================================================
// workers/email-canary/src/templates.test.ts · ROMAS Wire · SHIP-12
// node:test suite for the 4 transactional templates. Run with:
//   node --experimental-strip-types --test src/templates.test.ts
// =====================================================================

import { test } from "node:test";
import assert from "node:assert/strict";

import { renderTemplate } from "./templates.ts";

// Emoji detection: any code point at/above U+1F000 (emoji & pictographs
// blocks) plus the dingbats/symbols ranges commonly used as emoji.
const EMOJI_RE =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}]/u;

function assertNoEmoji(s: string, label: string): void {
  assert.equal(EMOJI_RE.test(s), false, `${label} should contain no emoji`);
}

test("signup_confirm: renders subject/html/text with confirmUrl", () => {
  const url = "https://romasbrief.com/confirm?token=abc123";
  const r = renderTemplate("signup_confirm", { confirmUrl: url });
  assert.ok(r.subject.length > 0 && r.subject.length <= 78);
  assert.ok(r.html.includes(url));
  assert.ok(r.text.includes(url));
  assert.ok(r.html.includes("ROMAS Wire"));
  assert.ok(r.text.includes("— Kimal"));
  assertNoEmoji(r.subject, "signup_confirm subject");
  assertNoEmoji(r.html, "signup_confirm html");
  assertNoEmoji(r.text, "signup_confirm text");
});

test("unsubscribe_receipt: renders + carries resubscribeUrl + unsubscribe line", () => {
  const url = "https://romasbrief.com/resubscribe?token=xyz";
  const r = renderTemplate("unsubscribe_receipt", { resubscribeUrl: url });
  assert.ok(r.subject.length > 0 && r.subject.length <= 78);
  assert.ok(r.html.includes(url));
  assert.ok(r.text.includes(url));
  // Unsubscribe-context line present (resubscribe affordance).
  assert.ok(/resubscribe/i.test(r.html));
  assert.ok(/resubscribe/i.test(r.text));
  assertNoEmoji(r.subject, "unsubscribe subject");
  assertNoEmoji(r.html, "unsubscribe html");
  assertNoEmoji(r.text, "unsubscribe text");
});

test("audio_revocation: renders + interpolates articleTitle", () => {
  const title = "Proton therapy reimbursement shifts in 2026";
  const r = renderTemplate("audio_revocation", { articleTitle: title });
  assert.ok(r.subject.length > 0 && r.subject.length <= 78);
  assert.ok(r.html.includes(title));
  assert.ok(r.text.includes(title));
  assert.ok(/withdrawn/i.test(r.html));
  assertNoEmoji(r.subject, "audio_revocation subject");
  assertNoEmoji(r.html, "audio_revocation html");
  assertNoEmoji(r.text, "audio_revocation text");
});

test("password_reset: renders + carries resetUrl", () => {
  const url = "https://romasbrief.com/reset?token=reset999";
  const r = renderTemplate("password_reset", { resetUrl: url });
  assert.ok(r.subject.length > 0 && r.subject.length <= 78);
  assert.ok(r.html.includes(url));
  assert.ok(r.text.includes(url));
  assert.ok(/reset/i.test(r.subject));
  assertNoEmoji(r.subject, "password_reset subject");
  assertNoEmoji(r.html, "password_reset html");
  assertNoEmoji(r.text, "password_reset text");
});

test("templates: HTML special chars in params are escaped in HTML body", () => {
  const r = renderTemplate("audio_revocation", {
    articleTitle: 'A <script> & "quoted" title',
  });
  // Raw injected markup must not appear unescaped.
  assert.equal(r.html.includes("<script>"), false);
  assert.ok(r.html.includes("&lt;script&gt;"));
  // The plain-text alternative keeps the literal title (no HTML context).
  assert.ok(r.text.includes('A <script> & "quoted" title'));
});

test("templates: all four produce non-empty html and text", () => {
  const cases = [
    renderTemplate("signup_confirm", { confirmUrl: "https://x/1" }),
    renderTemplate("unsubscribe_receipt", { resubscribeUrl: "https://x/2" }),
    renderTemplate("audio_revocation", { articleTitle: "T" }),
    renderTemplate("password_reset", { resetUrl: "https://x/3" }),
  ];
  for (const c of cases) {
    assert.ok(c.html.length > 0);
    assert.ok(c.text.length > 0);
    assert.ok(c.subject.length > 0);
  }
});
