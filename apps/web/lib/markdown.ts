// =====================================================================
// apps/web/lib/markdown.ts · ROMAS Brief reader
// SHIP-07 (ship-execution-plan §Wave 3 → pulled to Wave 2 with reader wiring).
// Minimal, security-first markdown → HTML for article `body_md`.
//
// SECURITY: the input is HTML-escaped BEFORE any markdown transform, so
// author-supplied or DB-sourced HTML (e.g. <script>, <img onerror>) renders
// as inert text — never as live markup. Link hrefs are protocol-allowlisted
// (http/https/mailto/relative only) so `javascript:` / `data:` URIs cannot
// execute. The emitted tag set is fixed (h1-3, strong, em, a, ul, li, p);
// no attributes other than a validated href are produced. This is why the
// output is safe to pass to dangerouslySetInnerHTML for THIS renderer.
// If the renderer ever grows (raw-HTML passthrough, custom attributes),
// replace this with a vetted sanitizer (rehype-sanitize / sanitize-html).
// =====================================================================

const HTML_ESCAPE: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (ch) => HTML_ESCAPE[ch] ?? ch);
}

const SAFE_URL = /^(https?:\/\/|mailto:|\/)/i;

/** Returns the (already HTML-escaped) url if its protocol is allowlisted, else null. */
export function safeHref(url: string): string | null {
  const trimmed = url.trim();
  return SAFE_URL.test(trimmed) ? trimmed : null;
}

/** Minimal markdown→HTML. Input is escaped first; links are protocol-checked. */
export function renderMarkdown(md: string): string {
  return escapeHtml(md)
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text: string, url: string) => {
      const href = safeHref(url);
      // Drop the link (keep the text) when the protocol is not allowlisted.
      return href
        ? `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`
        : text;
    })
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[hul])/gm, "<p>")
    .replace(/(?<![>])$/gm, "</p>")
    .replace(/<p><\/p>/g, "");
}
