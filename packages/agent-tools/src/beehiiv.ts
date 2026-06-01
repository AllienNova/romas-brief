// =====================================================================
// packages/agent-tools/src/beehiiv.ts · ROMAS Wire · ADR-0020 tool 3
// Beehiiv v2 subscription client (add / reactivate / segment a subscriber).
// Verified contract (developers.beehiiv.com, 2026-06-01):
//   POST https://api.beehiiv.com/v2/publications/{publicationId}/subscriptions
//   Authorization: Bearer <BEEHIIV_API_KEY>; Content-Type: application/json
//   required: email
//   optional: reactivate_existing, send_welcome_email, utm_*, tier,
//             custom_fields:[{name,value}], referring_site, ...
//
// NOTE: Beehiiv exposes NO documented broadcast/email-SEND endpoint
// (verified — the subscriptions/create page documents subscription state
// only). Newsletter *broadcasts* remain Beehiiv-UI/automation-driven. This
// tool therefore manages subscriber state, not blast sends. Audio delivery
// to subscribers uses email (resend.ts) + SMS (twilio.ts).
// =====================================================================

export type BeehiivTier = "free" | "premium";

export interface BeehiivCustomField {
  name: string;
  value: string;
}

export interface SubscriptionInput {
  email: string;
  reactivate_existing?: boolean;
  send_welcome_email?: boolean;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  tier?: BeehiivTier;
  custom_fields?: BeehiivCustomField[];
}

export interface BeehiivResult {
  ok: boolean;
  status: number;
  id?: string;
}

export function subscriptionsEndpoint(publicationId: string): string {
  return `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`;
}

/**
 * Build the request body, emitting only the fields the caller supplied
 * (satisfies exactOptionalPropertyTypes — no `undefined` values sent).
 */
export function buildSubscriptionBody(
  input: SubscriptionInput,
): Record<string, unknown> {
  const body: Record<string, unknown> = { email: input.email };
  if (input.reactivate_existing !== undefined) body["reactivate_existing"] = input.reactivate_existing;
  if (input.send_welcome_email !== undefined) body["send_welcome_email"] = input.send_welcome_email;
  if (input.utm_source !== undefined) body["utm_source"] = input.utm_source;
  if (input.utm_medium !== undefined) body["utm_medium"] = input.utm_medium;
  if (input.utm_campaign !== undefined) body["utm_campaign"] = input.utm_campaign;
  if (input.tier !== undefined) body["tier"] = input.tier;
  if (input.custom_fields !== undefined) body["custom_fields"] = input.custom_fields;
  return body;
}

/** Create/segment one Beehiiv subscription. Returns {ok,status,id}. */
export async function createSubscription(
  apiKey: string,
  publicationId: string,
  input: SubscriptionInput,
): Promise<BeehiivResult> {
  const res = await fetch(subscriptionsEndpoint(publicationId), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildSubscriptionBody(input)),
  });

  let id: string | undefined;
  try {
    const json = (await res.json()) as { data?: { id?: string } };
    id = json.data?.id;
  } catch {
    // ignore non-JSON body
  }

  const result: BeehiivResult = { ok: res.ok, status: res.status };
  if (id !== undefined) result.id = id;
  return result;
}
