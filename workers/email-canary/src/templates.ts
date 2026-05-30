// =====================================================================
// workers/email-canary/src/templates.ts · ROMAS Brief · SHIP-12
// Pure HTML/text templates for the 4 transactional email types.
//
// Brand rules (CLAUDE.md §2, §8): no emojis anywhere; subject lines
// short (<= ~78 chars); accessible plain HTML; every template ships an
// equivalent text alternative. Sign-off `— Kimal`.
//
// Templates are plain HTML strings (no react-email / no MJML dep) so the
// worker carries zero extra dependencies.
// =====================================================================

/** The four transactional email types this worker can send. */
export type TemplateType =
  | "signup_confirm"
  | "unsubscribe_receipt"
  | "audio_revocation"
  | "password_reset";

/** Per-type template parameters. */
export interface TemplateParamsMap {
  signup_confirm: { confirmUrl: string };
  unsubscribe_receipt: { resubscribeUrl: string };
  audio_revocation: { articleTitle: string };
  password_reset: { resetUrl: string };
}

/** The rendered email: subject + HTML body + plain-text alternative. */
export interface RenderedTemplate {
  subject: string;
  html: string;
  text: string;
}

const BRAND = "ROMAS Brief";
const SIGNOFF = "— Kimal";
const FOOTER_NOTE =
  "ROMAS Brief · Radiation oncology, decoded daily · ROMAS Intelligence";

/** HTML-escape interpolated values to keep the templates injection-safe. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Wrap body content in a minimal, accessible HTML document. The layout is
 * deliberately plain (single column, system fonts, inline-safe styles) for
 * broad email-client support. `unsubscribeLine`, when provided, renders a
 * List-Unsubscribe-friendly line in the footer.
 */
function layout(bodyHtml: string, unsubscribeLine?: string): string {
  const unsub = unsubscribeLine
    ? `<p style="margin:8px 0 0;font-size:12px;color:#94A3B8;">${unsubscribeLine}</p>`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${BRAND}</title>
</head>
<body style="margin:0;padding:0;background:#F8FAFC;">
<div role="article" aria-roledescription="email" lang="en" style="max-width:560px;margin:0 auto;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0F172A;line-height:1.5;">
<p style="margin:0 0 16px;font-size:18px;font-weight:600;color:#00B4C6;">${BRAND}</p>
${bodyHtml}
<p style="margin:24px 0 0;">${SIGNOFF}</p>
<hr style="border:none;border-top:1px solid #E2E8F0;margin:24px 0 8px;">
<p style="margin:0;font-size:12px;color:#94A3B8;">${FOOTER_NOTE}</p>
${unsub}
</div>
</body>
</html>`;
}

/**
 * Render a transactional email by type. Params are validated by the
 * compile-time `TemplateParamsMap`; values are HTML-escaped in the HTML
 * body. Returns subject + html + text.
 */
export function renderTemplate<T extends TemplateType>(
  type: T,
  params: TemplateParamsMap[T],
): RenderedTemplate {
  switch (type) {
    case "signup_confirm": {
      const { confirmUrl } = params as TemplateParamsMap["signup_confirm"];
      const subject = "Confirm your ROMAS Brief subscription";
      const html = layout(
        `<p style="margin:0 0 16px;">Welcome to ${BRAND}. Confirm your email to start receiving clinical intelligence for modern radiation oncology, decoded daily.</p>
<p style="margin:0 0 24px;"><a href="${esc(confirmUrl)}" style="display:inline-block;background:#00B4C6;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:600;">Confirm subscription</a></p>
<p style="margin:0;font-size:13px;color:#475569;">If the button does not work, paste this link into your browser:<br><a href="${esc(confirmUrl)}" style="color:#00B4C6;">${esc(confirmUrl)}</a></p>`,
      );
      const text = `${BRAND}

Welcome to ${BRAND}. Confirm your email to start receiving clinical intelligence for modern radiation oncology, decoded daily.

Confirm your subscription:
${confirmUrl}

${SIGNOFF}

${FOOTER_NOTE}`;
      return { subject, html, text };
    }

    case "unsubscribe_receipt": {
      const { resubscribeUrl } =
        params as TemplateParamsMap["unsubscribe_receipt"];
      const subject = "You have been unsubscribed from ROMAS Brief";
      const unsubLine = `Changed your mind? <a href="${esc(resubscribeUrl)}" style="color:#00B4C6;">Resubscribe</a>.`;
      const html = layout(
        `<p style="margin:0 0 16px;">You have been unsubscribed from ${BRAND}. You will no longer receive the daily issue, the Friday Read, or podcast notifications.</p>
<p style="margin:0;font-size:13px;color:#475569;">If this was a mistake, you can resubscribe at any time:<br><a href="${esc(resubscribeUrl)}" style="color:#00B4C6;">${esc(resubscribeUrl)}</a></p>`,
        unsubLine,
      );
      const text = `${BRAND}

You have been unsubscribed from ${BRAND}. You will no longer receive the daily issue, the Friday Read, or podcast notifications.

Changed your mind? Resubscribe at any time:
${resubscribeUrl}

${SIGNOFF}

${FOOTER_NOTE}`;
      return { subject, html, text };
    }

    case "audio_revocation": {
      const { articleTitle } =
        params as TemplateParamsMap["audio_revocation"];
      const subject = "An audio briefing has been withdrawn";
      const html = layout(
        `<p style="margin:0 0 16px;">The audio briefing for the following article has been withdrawn and is no longer available:</p>
<p style="margin:0 0 16px;font-weight:600;">${esc(articleTitle)}</p>
<p style="margin:0;font-size:13px;color:#475569;">This affects the audio version only. The written article remains available. Audio is withdrawn when it fails post-publish editorial review.</p>`,
      );
      const text = `${BRAND}

The audio briefing for the following article has been withdrawn and is no longer available:

${articleTitle}

This affects the audio version only. The written article remains available. Audio is withdrawn when it fails post-publish editorial review.

${SIGNOFF}

${FOOTER_NOTE}`;
      return { subject, html, text };
    }

    case "password_reset": {
      const { resetUrl } = params as TemplateParamsMap["password_reset"];
      const subject = "Reset your ROMAS Brief password";
      const html = layout(
        `<p style="margin:0 0 16px;">We received a request to reset your ${BRAND} password. This link expires shortly. If you did not request this, you can ignore this email.</p>
<p style="margin:0 0 24px;"><a href="${esc(resetUrl)}" style="display:inline-block;background:#00B4C6;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:600;">Reset password</a></p>
<p style="margin:0;font-size:13px;color:#475569;">If the button does not work, paste this link into your browser:<br><a href="${esc(resetUrl)}" style="color:#00B4C6;">${esc(resetUrl)}</a></p>`,
      );
      const text = `${BRAND}

We received a request to reset your ${BRAND} password. This link expires shortly. If you did not request this, you can ignore this email.

Reset your password:
${resetUrl}

${SIGNOFF}

${FOOTER_NOTE}`;
      return { subject, html, text };
    }

    default: {
      // Exhaustiveness guard — unreachable for known TemplateType values.
      const _exhaustive: never = type;
      throw new Error(`unknown template type: ${String(_exhaustive)}`);
    }
  }
}
