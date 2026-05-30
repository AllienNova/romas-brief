// SHIP-07 — security tests for the article markdown renderer.
// Runs under Node's built-in test runner; folds into the SHIP-17 suite.
//   node --experimental-strip-types --test apps/web/lib/markdown.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { renderMarkdown, safeHref, escapeHtml } from "./markdown.ts";

test("escapes injected <script> so it renders inert", () => {
  const out = renderMarkdown("Hello <script>alert(1)</script> world");
  assert.ok(!out.includes("<script>"), "raw <script> must not survive");
  assert.ok(out.includes("&lt;script&gt;"), "script must be HTML-escaped");
});

test("escapes <img onerror> HTML injection", () => {
  const out = renderMarkdown('![x](y) <img src=x onerror="alert(1)">');
  assert.ok(!/<img[^>]*onerror/i.test(out), "no live onerror attribute");
  assert.ok(out.includes("&lt;img"), "img tag must be escaped");
});

test("drops javascript: link href, keeps the text", () => {
  const out = renderMarkdown("[click](javascript:alert(1))");
  assert.ok(!out.includes("javascript:"), "javascript: URI must not appear");
  assert.ok(!/href=/.test(out), "no href emitted for disallowed protocol");
  assert.ok(out.includes("click"), "link text is preserved");
});

test("drops data: link href", () => {
  const out = renderMarkdown("[x](data:text/html,<script>alert(1)</script>)");
  assert.ok(!out.includes("data:"), "data: URI must not appear in href");
});

test("allows https/mailto/relative links", () => {
  assert.equal(safeHref("https://example.com"), "https://example.com");
  assert.equal(safeHref("mailto:a@b.com"), "mailto:a@b.com");
  assert.equal(safeHref("/issues/2026-05-30"), "/issues/2026-05-30");
  assert.equal(safeHref("javascript:alert(1)"), null);
  assert.equal(safeHref("data:text/html,x"), null);
});

test("renders normal markdown correctly", () => {
  assert.ok(renderMarkdown("## Heading").includes("<h2>Heading</h2>"));
  assert.ok(renderMarkdown("**bold**").includes("<strong>bold</strong>"));
  const link = renderMarkdown("[ROMAS](https://romasbrief.com)");
  assert.ok(link.includes('href="https://romasbrief.com"'));
  assert.ok(link.includes('rel="noopener noreferrer"'));
});

test("preserves ampersands in URLs as &amp; (valid attribute encoding)", () => {
  const out = renderMarkdown("[q](https://x.com?a=1&b=2)");
  assert.ok(out.includes("href=\"https://x.com?a=1&amp;b=2\""));
});

test("escapeHtml handles the five entities", () => {
  assert.equal(escapeHtml(`&<>"'`), "&amp;&lt;&gt;&quot;&#39;");
});
