/**
 * email-canary · ROMAS Brief · SHIP-12
 *
 * Resend transactional-email + delivery-webhook worker (the
 * "email-transactional" role per ADR-0007 cycle-3). The on-disk dir name
 * stays `email-canary` to avoid lockfile churn — the rename is cosmetic.
 *
 * Two routes, POST-only:
 *
 *   POST /webhook  — Resend delivery events (signed via Svix). Verify the
 *     svix-* headers against RESEND_WEBHOOK_SECRET; on a hard signal
 *     (bounce / complaint) PATCH the matching subscriber row in Supabase
 *     to status 'bounced'. Soft/positive events are acknowledged with no
 *     write. See subscribers.ts for the event->update mapping.
 *
 *   POST /send  — internal transactional send. Authenticated with a
 *     shared bearer (INTERNAL_SEND_SECRET, constant-time). Renders one of
 *     the 4 templates (signup_confirm, unsubscribe_receipt,
 *     audio_revocation, password_reset) and forwards to Resend with an
 *     Idempotency-Key.
 *
 * Contracts verified against official Resend + Svix docs (2026-05-30) —
 * see svix.ts / resend.ts headers. Zero extra deps: Web Crypto + fetch +
 * HTML-string templates only.
 */

import { verifySvixSignature } from "./svix.ts";
import { renderTemplate, type TemplateType, type TemplateParamsMap } from "./templates.ts";
import { buildResendPayload, sendEmail } from "./resend.ts";
import { mapDeliveryEventToUpdate } from "./subscribers.ts";

export interface Env {
  RESEND_API_KEY?: string;
  RESEND_WEBHOOK_SECRET?: string;
  INTERNAL_SEND_SECRET?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/**
 * Constant-time compare of `Authorization: Bearer <secret>` against the
 * configured shared secret. Returns false if either side is missing or
 * the scheme is not Bearer. The length branch leaks only length.
 */
function verifyBearer(authHeader: string | null, secret: string | undefined): boolean {
  if (!authHeader || !secret) return false;
  const prefix = "Bearer ";
  if (!authHeader.startsWith(prefix)) return false;
  const token = authHeader.slice(prefix.length);
  if (token.length !== secret.length) return false;
  let mismatch = 0;
  for (let i = 0; i < token.length; i++) {
    mismatch |= token.charCodeAt(i) ^ secret.charCodeAt(i);
  }
  return mismatch === 0;
}

/** POST /webhook — verify Svix signature, mirror bounce/complaint to Supabase. */
async function handleWebhook(request: Request, env: Env): Promise<Response> {
  if (!env.RESEND_WEBHOOK_SECRET) {
    return json({ error: "misconfigured" }, 500);
  }

  // Read the RAW body text — the signed content is over the exact bytes.
  const rawBody = await request.text();

  const ok = await verifySvixSignature(
    {
      id: request.headers.get("svix-id"),
      timestamp: request.headers.get("svix-timestamp"),
      signature: request.headers.get("svix-signature"),
    },
    rawBody,
    env.RESEND_WEBHOOK_SECRET,
  );
  if (!ok) {
    return json({ error: "unauthorized" }, 401);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  if (typeof parsed !== "object" || parsed === null) {
    return json({ error: "malformed_event" }, 400);
  }
  const event = parsed as { type?: unknown; data?: { email?: unknown } };
  if (typeof event.type !== "string") {
    return json({ error: "malformed_event" }, 400);
  }

  const update = mapDeliveryEventToUpdate(event.type);
  if (!update) {
    // Soft/positive event — acknowledge, no subscriber change.
    return json({ ok: true, applied: false }, 200);
  }

  const email = event.data?.email;
  if (typeof email !== "string" || email.length === 0) {
    // Hard signal but no email to key on — acknowledge to stop retries.
    return json({ ok: true, applied: false }, 200);
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return json({ error: "misconfigured" }, 500);
  }

  const base = env.SUPABASE_URL.replace(/\/$/, "");
  const res = await fetch(
    `${base}/rest/v1/subscribers?email=eq.${encodeURIComponent(email)}`,
    {
      method: "PATCH",
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(update),
    },
  );

  if (!res.ok) {
    // Non-2xx from Supabase -> 500 so Resend retries delivery.
    return json({ error: "supabase_write_failed", upstream: res.status }, 500);
  }

  return json({ ok: true, applied: true }, 200);
}

/** POST /send — internal transactional send via Resend. */
async function handleSend(request: Request, env: Env): Promise<Response> {
  if (!verifyBearer(request.headers.get("Authorization"), env.INTERNAL_SEND_SECRET)) {
    return json({ error: "unauthorized" }, 401);
  }
  if (!env.RESEND_API_KEY) {
    return json({ error: "misconfigured" }, 500);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  if (typeof body !== "object" || body === null) {
    return json({ error: "invalid_request" }, 400);
  }

  const req = body as {
    template?: unknown;
    to?: unknown;
    params?: unknown;
    idempotencyKey?: unknown;
  };

  const validTemplates: TemplateType[] = [
    "signup_confirm",
    "unsubscribe_receipt",
    "audio_revocation",
    "password_reset",
  ];
  if (typeof req.template !== "string" || !validTemplates.includes(req.template as TemplateType)) {
    return json({ error: "invalid_template" }, 400);
  }
  if (typeof req.to !== "string" || req.to.length === 0) {
    return json({ error: "invalid_recipient" }, 400);
  }
  if (typeof req.params !== "object" || req.params === null) {
    return json({ error: "invalid_params" }, 400);
  }

  const template = req.template as TemplateType;
  const to = req.to;
  // Params are validated by renderTemplate's compile-time contract; the
  // runtime shape is the caller's responsibility (internal trusted route).
  const rendered = renderTemplate(
    template,
    req.params as TemplateParamsMap[typeof template],
  );

  const payload = buildResendPayload({
    to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  });

  // Idempotency key: caller-supplied wins; else a stable `${template}:${to}`.
  const idempotencyKey =
    typeof req.idempotencyKey === "string" && req.idempotencyKey.length > 0
      ? req.idempotencyKey
      : `${template}:${to}`;

  const result = await sendEmail(env.RESEND_API_KEY, payload, idempotencyKey);
  if (!result.ok) {
    return json({ error: "send_failed", upstream: result.status }, 502);
  }
  return json({ ok: true, status: result.status }, 200);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return json({ error: "method_not_allowed" }, 405);
    }

    const { pathname } = new URL(request.url);
    if (pathname === "/webhook") {
      return handleWebhook(request, env);
    }
    if (pathname === "/send") {
      return handleSend(request, env);
    }
    return json({ error: "not_found" }, 404);
  },
};
