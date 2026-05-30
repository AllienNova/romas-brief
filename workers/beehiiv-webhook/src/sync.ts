// =====================================================================
// workers/beehiiv-webhook/src/sync.ts · ROMAS Brief · SHIP-11
// Pure, unit-testable core for the Beehiiv -> Supabase subscriber sync.
//
// Auth model (ADR-0019): Beehiiv has NO native HMAC/signature. The
// publisher configures a custom header on the webhook; we verify
// `Authorization: Bearer <BEEHIIV_WEBHOOK_SECRET>` with a constant-time
// compare. Do NOT implement HMAC-over-body — Beehiiv does not sign.
//
// Event payload (official Beehiiv docs, verified 2026-05-30 per ADR-0019):
//   { uid: string, event_timestamp: number (unix seconds),
//     event_type: string, data: { id, email, status, created?,
//     subscription_tier?, ... } }
//   data.status in validating | invalid | pending | active | inactive
//                | needs_attention
//
// These functions are framework-free so the worker handler stays a thin
// shell over tested logic (mirrors apps/cms/lib/audio-qa-gate.ts).
// =====================================================================

/** Beehiiv subscriber lifecycle status (official enum). */
export type BeehiivStatus =
  | "validating"
  | "invalid"
  | "pending"
  | "active"
  | "inactive"
  | "needs_attention";

/** Supabase `subscribers.status` enum (0008_create_subscribers.sql). */
export type SubscriberStatus = "active" | "unsubscribed" | "bounced";

/** Parsed, validated Beehiiv webhook event (subset we rely on). */
export interface BeehiivEvent {
  uid: string;
  event_timestamp: number;
  event_type: string;
  data: {
    id: string;
    email: string;
    status?: BeehiivStatus;
    created?: number;
    subscription_tier?: string;
  };
}

/** Row shape we upsert into `subscribers` (on_conflict=email). */
export interface SubscriberUpsert {
  email: string;
  beehiiv_subscription_id: string;
  status: SubscriberStatus;
  confirmed_at?: string;
  unsubscribed_at?: string;
}

/**
 * Constant-time compare of `Authorization: Bearer <secret>` against the
 * configured shared secret. Returns false if either side is missing.
 *
 * Constant-time over the compared bytes guards against timing oracles;
 * the early length check leaks only length, which is acceptable here.
 */
export function verifySecret(
  authHeader: string | null,
  secret: string | undefined,
): boolean {
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

/**
 * Map a Beehiiv lifecycle status to the Supabase `subscribers.status`.
 *   active                  -> active
 *   inactive | invalid      -> unsubscribed
 *   needs_attention         -> bounced
 *   validating | pending    -> active (provisional; upgraded on confirm)
 * Unknown/missing defaults to active (least-destructive; an upsert never
 * downgrades a real subscriber on an unrecognized status).
 */
export function mapStatus(beehiivStatus: BeehiivStatus | undefined): SubscriberStatus {
  switch (beehiivStatus) {
    case "active":
    case "validating":
    case "pending":
      return "active";
    case "inactive":
    case "invalid":
      return "unsubscribed";
    case "needs_attention":
      return "bounced";
    default:
      return "active";
  }
}

/** Convert Beehiiv unix-seconds to an ISO 8601 timestamp. */
function iso(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toISOString();
}

/**
 * Validate + narrow an unknown JSON body into a BeehiivEvent.
 * Returns null when the payload is malformed (missing uid, event_type,
 * or data.email). The handler treats null as a 400.
 */
export function parseEvent(body: unknown): BeehiivEvent | null {
  if (typeof body !== "object" || body === null) return null;
  const e = body as Record<string, unknown>;

  if (typeof e.uid !== "string" || e.uid.length === 0) return null;
  if (typeof e.event_type !== "string" || e.event_type.length === 0) return null;
  if (typeof e.event_timestamp !== "number" || !Number.isFinite(e.event_timestamp)) {
    return null;
  }
  if (typeof e.data !== "object" || e.data === null) return null;

  const d = e.data as Record<string, unknown>;
  if (typeof d.id !== "string" || d.id.length === 0) return null;
  if (typeof d.email !== "string" || d.email.length === 0) return null;

  const status = typeof d.status === "string" ? (d.status as BeehiivStatus) : undefined;
  const created = typeof d.created === "number" ? d.created : undefined;
  const subscription_tier =
    typeof d.subscription_tier === "string" ? d.subscription_tier : undefined;

  return {
    uid: e.uid,
    event_timestamp: e.event_timestamp,
    event_type: e.event_type,
    data: {
      id: d.id,
      email: d.email,
      ...(status !== undefined ? { status } : {}),
      ...(created !== undefined ? { created } : {}),
      ...(subscription_tier !== undefined ? { subscription_tier } : {}),
    },
  };
}

/**
 * Build the `subscribers` row to upsert (on_conflict=email) for a given
 * event. Branches on the `subscription.*` event suffix:
 *   created                          -> status = mapStatus(data.status)
 *   confirmed                        -> status active + confirmed_at
 *   deleted | paused | tier-paused   -> status unsubscribed + unsubscribed_at
 *   upgraded | downgraded | resumed
 *     | tier-added | tier-resumed    -> status = mapStatus(data.status)
 *   (anything else)                  -> status = mapStatus(data.status)
 */
export function buildSubscriberUpsert(event: BeehiivEvent): SubscriberUpsert {
  const base = {
    email: event.data.email,
    beehiiv_subscription_id: event.data.id,
  };
  // event_type is "subscription.<action>"; take the action suffix.
  const action = event.event_type.includes(".")
    ? event.event_type.slice(event.event_type.indexOf(".") + 1)
    : event.event_type;

  switch (action) {
    case "confirmed":
      return { ...base, status: "active", confirmed_at: iso(event.event_timestamp) };
    case "deleted":
    case "paused":
    case "tier-paused":
      return {
        ...base,
        status: "unsubscribed",
        unsubscribed_at: iso(event.event_timestamp),
      };
    case "created":
    case "upgraded":
    case "downgraded":
    case "resumed":
    case "tier-added":
    case "tier-resumed":
    default:
      return { ...base, status: mapStatus(event.data.status) };
  }
}
