// =====================================================================
// workers/email-canary/src/resend.ts · ROMAS Wire · SHIP-12
// Pure builder + thin send wrapper for the Resend email API.
//
// Resend send contract (official docs, verified 2026-05-30):
//   POST https://api.resend.com/emails
//   header Authorization: Bearer <RESEND_API_KEY>
//   header Idempotency-Key: <unique, <= 256 chars>   (optional but used)
//   JSON body: { from, to, subject, html, text }
//   required: from, to, subject + at least one of html | text
//
// No `resend` SDK dependency — plain fetch in the Workers runtime.
// =====================================================================

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/** Default sender per ADR-0007 (Resend = transactional). */
export const DEFAULT_FROM = "ROMAS Wire <brief@romasbrief.com>";

/** The 5-field Resend send payload. */
export interface ResendPayload {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}

/** Inputs to build a payload; `from` defaults to DEFAULT_FROM. */
export interface BuildPayloadInput {
  from?: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}

/** Result of a send attempt — does not echo the Resend body. */
export interface SendResult {
  ok: boolean;
  status: number;
}

/**
 * Build the Resend request body. Fills `from` with DEFAULT_FROM when the
 * caller does not supply one; passes through the other four fields.
 */
export function buildResendPayload(input: BuildPayloadInput): ResendPayload {
  return {
    from: input.from ?? DEFAULT_FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  };
}

/**
 * POST an email to Resend. Sets the Bearer auth header and, when given, an
 * `Idempotency-Key` (truncated to Resend's 256-char limit). Returns only
 * {ok, status} so callers can map to their own response without leaking
 * the upstream body.
 */
export async function sendEmail(
  apiKey: string,
  payload: ResendPayload,
  idempotencyKey?: string,
): Promise<SendResult> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey.slice(0, 256);
  }

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  return { ok: res.ok, status: res.status };
}
