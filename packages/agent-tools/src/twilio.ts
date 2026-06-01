// =====================================================================
// packages/agent-tools/src/twilio.ts · ROMAS Wire · ADR-0020 tool 2
// Twilio Messages API client for SMS audio-listen links (decision 21).
// Verified contract (Twilio docs, 2026-06-01):
//   POST https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json
//   Auth: HTTP Basic  base64(AccountSid:AuthToken)
//   Content-Type: application/x-www-form-urlencoded
//   params: To (E.164), From | MessagingServiceSid, Body
//   response: { sid, status, error_code }
// Secrets passed at execute time, never stored in a staged record.
// =====================================================================

export interface SmsPayload {
  to: string; // E.164
  from: string; // Twilio number or MessagingServiceSid
  body: string;
}

export interface SmsResult {
  ok: boolean;
  status: number;
  sid?: string;
  errorCode?: number | null;
}

/** E.164: leading `+`, 1–15 digits, first digit non-zero. */
const E164 = /^\+[1-9]\d{1,14}$/;
export function isE164(value: string): boolean {
  return E164.test(value);
}

export function messagesEndpoint(accountSid: string): string {
  return `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
}

/**
 * Build the form body. If `from` looks like a Messaging Service SID
 * (`MG...`), send it as `MessagingServiceSid`; otherwise as `From`.
 */
export function buildSmsForm(payload: SmsPayload): URLSearchParams {
  const form = new URLSearchParams();
  form.set("To", payload.to);
  if (/^MG[0-9a-fA-F]{32}$/.test(payload.from)) {
    form.set("MessagingServiceSid", payload.from);
  } else {
    form.set("From", payload.from);
  }
  form.set("Body", payload.body);
  return form;
}

/** Send one SMS via Twilio. Returns {ok,status,sid,errorCode}. */
export async function sendSms(
  accountSid: string,
  authToken: string,
  payload: SmsPayload,
): Promise<SmsResult> {
  const basic = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const res = await fetch(messagesEndpoint(accountSid), {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: buildSmsForm(payload).toString(),
  });

  let sid: string | undefined;
  let errorCode: number | null | undefined;
  try {
    const json = (await res.json()) as { sid?: string; error_code?: number | null };
    sid = json.sid;
    errorCode = json.error_code ?? null;
  } catch {
    // non-JSON error body — leave sid/errorCode undefined
  }

  const result: SmsResult = { ok: res.ok, status: res.status };
  if (sid !== undefined) result.sid = sid;
  if (errorCode !== undefined) result.errorCode = errorCode;
  return result;
}
