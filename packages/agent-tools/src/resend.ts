// =====================================================================
// packages/agent-tools/src/resend.ts · ROMAS Wire · ADR-0020 tool 1
// Resend transactional-email client. Same contract as the verified
// workers/email-canary/src/resend.ts (Resend docs, 2026-05-30):
//   POST https://api.resend.com/emails
//   Authorization: Bearer <RESEND_API_KEY>
//   Idempotency-Key: <= 256 chars (optional)
//   body { from, to, subject, html, text }; required from,to,subject + html|text
// Plain fetch — no SDK. Secrets are passed at execute time, never stored.
// =====================================================================

export const RESEND_ENDPOINT = "https://api.resend.com/emails";

/** Default sender per ADR-0007 (Resend = transactional). */
export const DEFAULT_FROM = "ROMAS Wire <brief@romasbrief.com>";

export interface EmailPayload {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface BuildEmailInput {
  from?: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface SendResult {
  ok: boolean;
  status: number;
}

/** Build the Resend body; `from` defaults to {@link DEFAULT_FROM}. */
export function buildEmail(input: BuildEmailInput): EmailPayload {
  return {
    from: input.from ?? DEFAULT_FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  };
}

/** POST one email to Resend. Returns only {ok,status} (no upstream body). */
export async function sendEmail(
  apiKey: string,
  payload: EmailPayload,
  idempotencyKey?: string,
): Promise<SendResult> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey.slice(0, 256);

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  return { ok: res.ok, status: res.status };
}
