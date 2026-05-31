// =====================================================================
// workers/email-canary/src/svix.ts · ROMAS Wire · SHIP-12
// Pure, unit-testable Svix webhook signature verification.
//
// Resend signs its webhooks via Svix. Verification scheme (official Svix
// docs, "how-manual", verified 2026-05-30):
//   - headers: svix-id, svix-timestamp, svix-signature
//   - signed content = `${svixId}.${svixTimestamp}.${rawBody}`
//   - secret format `whsec_<base64>`; base64-decode the part AFTER
//     `whsec_` to obtain the raw HMAC key bytes
//   - expected sig = base64( HMAC-SHA256(keyBytes, signedContent) )
//   - svix-signature header = space-delimited `v1,<b64sig>` entries;
//     strip `v1,` from each and constant-time-compare to expected; pass
//     if ANY entry matches
//   - reject if |now - svixTimestamp| > 300s (replay tolerance)
//
// Implemented on Web Crypto (crypto.subtle) — no svix/node deps; runs in
// the Cloudflare Workers runtime.
// =====================================================================

/** The three Svix headers required to verify a webhook. */
export interface SvixHeaders {
  id: string | null;
  timestamp: string | null;
  signature: string | null;
}

/** Svix default replay tolerance, in seconds. */
const REPLAY_TOLERANCE_SEC = 300;

/**
 * Constant-time compare of two equal-or-unequal-length strings. Returns
 * true only when both are non-empty, equal length, and byte-identical.
 * The length branch leaks only length, which is acceptable for a base64
 * signature comparison.
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length === 0 || b.length === 0) return false;
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/** Base64-decode a string into raw bytes. */
function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** Base64-encode raw bytes. */
function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary);
}

/**
 * Verify a Svix-signed webhook. Returns false on ANY of: a missing
 * header, an unparseable/expired timestamp, a malformed secret, or no
 * matching `v1` signature entry.
 *
 * @param headers  the three svix-* headers off the request
 * @param rawBody  the exact, unmodified request body text
 * @param secret   the `whsec_<base64>` signing secret
 * @param nowSec   override for the current time in unix seconds (tests)
 */
export async function verifySvixSignature(
  headers: SvixHeaders,
  rawBody: string,
  secret: string,
  nowSec: number = Math.floor(Date.now() / 1000),
): Promise<boolean> {
  const { id, timestamp, signature } = headers;
  if (!id || !timestamp || !signature || !secret) return false;

  // Timestamp replay window.
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  if (Math.abs(nowSec - ts) > REPLAY_TOLERANCE_SEC) return false;

  // Secret must be `whsec_<base64>`; the HMAC key is the decoded suffix.
  const prefix = "whsec_";
  if (!secret.startsWith(prefix)) return false;
  const secretB64 = secret.slice(prefix.length);
  if (secretB64.length === 0) return false;

  let keyBytes: Uint8Array;
  try {
    keyBytes = base64ToBytes(secretB64);
  } catch {
    return false;
  }
  if (keyBytes.length === 0) return false;

  // signedContent = `${id}.${timestamp}.${rawBody}`
  const signedContent = `${id}.${timestamp}.${rawBody}`;

  let expectedSig: string;
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const mac = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(signedContent),
    );
    expectedSig = bytesToBase64(new Uint8Array(mac));
  } catch {
    return false;
  }

  // svix-signature is a space-delimited list of `v<n>,<b64sig>` entries.
  // We support v1. Pass if any v1 entry constant-time-matches.
  const entries = signature.split(" ");
  for (const entry of entries) {
    const comma = entry.indexOf(",");
    if (comma < 0) continue;
    const version = entry.slice(0, comma);
    if (version !== "v1") continue;
    const providedSig = entry.slice(comma + 1);
    if (constantTimeEqual(providedSig, expectedSig)) return true;
  }

  return false;
}
