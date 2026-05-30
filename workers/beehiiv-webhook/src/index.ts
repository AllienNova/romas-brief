/**
 * beehiiv-webhook · ROMAS Brief · SHIP-11
 *
 * Beehiiv -> Supabase subscriber-sync webhook (FR-014 / FR-023, ADR-0007
 * cycle-3). Beehiiv is the canonical subscriber list; this worker mirrors
 * lifecycle events into the Supabase `subscribers` table for query-side
 * use (subscriber-count view, three-edition delivery segmentation, drift
 * reconciliation).
 *
 * Auth (ADR-0019): Beehiiv has NO native HMAC/signature. We verify a
 * shared secret in a custom header — `Authorization: Bearer
 * <BEEHIIV_WEBHOOK_SECRET>` — with a constant-time compare. The same
 * secret is set in the Beehiiv webhook config and the Cloudflare Worker
 * Secret. Do NOT add HMAC-over-body; Beehiiv does not sign.
 *
 * Supabase writes use the SERVICE ROLE key (no anon-write RLS) via
 * PostgREST upsert on `email` (Prefer: resolution=merge-duplicates,
 * on_conflict=email). The project uses the NEW Supabase key format
 * (`sb_secret_...`); it is sent as the `apikey` header (and as a Bearer).
 *
 * Retry / DLQ posture: on a Supabase non-2xx we return 500 so Beehiiv
 * retries delivery (Beehiiv re-sends failed webhooks). A Cloudflare
 * Queue dead-letter is a documented follow-on for poison events; v1
 * relies on Beehiiv retry + the idempotent email-upsert.
 *
 * Idempotency: the upsert on `email` is naturally idempotent, so replays
 * converge. uid-based dedup via Workers KV is the hardening path.
 */

import {
  verifySecret,
  parseEvent,
  buildSubscriberUpsert,
} from "./sync.ts";

export interface Env {
  BEEHIIV_WEBHOOK_SECRET?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return json({ error: "method_not_allowed" }, 405);
    }

    if (!verifySecret(request.headers.get("Authorization"), env.BEEHIIV_WEBHOOK_SECRET)) {
      return json({ error: "unauthorized" }, 401);
    }

    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return json({ error: "invalid_json" }, 400);
    }

    const event = parseEvent(raw);
    if (!event) {
      return json({ error: "malformed_event" }, 400);
    }

    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return json({ error: "misconfigured" }, 500);
    }

    const row = buildSubscriberUpsert(event);
    const base = env.SUPABASE_URL.replace(/\/$/, "");

    const res = await fetch(`${base}/rest/v1/subscribers?on_conflict=email`, {
      method: "POST",
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(row),
    });

    if (!res.ok) {
      // Non-2xx from Supabase -> 500 so Beehiiv retries. Surface the
      // upstream status for log correlation; do not echo the body.
      return json({ error: "supabase_write_failed", upstream: res.status }, 500);
    }

    return json({ ok: true, event: event.uid }, 200);
  },
};
