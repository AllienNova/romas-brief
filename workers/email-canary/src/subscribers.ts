// =====================================================================
// workers/email-canary/src/subscribers.ts · ROMAS Brief · SHIP-12
// Pure mapping from a Resend delivery event to a Supabase subscriber
// update (or no-op).
//
// Resend webhook event types (official docs, verified 2026-05-30):
//   email.sent, email.delivered, email.delivery_delayed, email.opened,
//   email.clicked, email.bounced, email.complained, email.failed
//
// Policy: only hard signals mutate the subscriber row.
//   email.bounced     -> status 'bounced'  + bounced_at
//   email.complained  -> status 'bounced'  + complained_at  (spam report)
//   everything else   -> null (no subscriber change)
//
// Mirrors beehiiv-webhook's SubscriberStatus (subscribers table enum:
// active | unsubscribed | bounced — 0008_create_subscribers.sql).
// =====================================================================

/** Supabase `subscribers.status` enum. */
export type SubscriberStatus = "active" | "unsubscribed" | "bounced";

/** A PATCH payload for the `subscribers` row, or null for no-op events. */
export interface SubscriberUpdate {
  status: SubscriberStatus;
  bounced_at?: string;
  complained_at?: string;
}

/**
 * Map a Resend delivery event type to a subscriber update. Returns null
 * for soft/positive events (sent, delivered, opened, clicked, delayed,
 * failed) which must NOT change subscriber state. `nowIso` is injectable
 * for deterministic tests.
 *
 *   email.bounced     -> { status: 'bounced', bounced_at }
 *   email.complained  -> { status: 'bounced', complained_at }
 *   (all others)      -> null
 */
export function mapDeliveryEventToUpdate(
  eventType: string,
  nowIso: string = new Date().toISOString(),
): SubscriberUpdate | null {
  switch (eventType) {
    case "email.bounced":
      return { status: "bounced", bounced_at: nowIso };
    case "email.complained":
      return { status: "bounced", complained_at: nowIso };
    default:
      return null;
  }
}
