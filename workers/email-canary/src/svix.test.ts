// =====================================================================
// workers/email-canary/src/svix.test.ts · ROMAS Brief · SHIP-12
// node:test suite for Svix webhook verification. Run with:
//   node --experimental-strip-types --test src/svix.test.ts
//
// Valid signatures are constructed in-test using the same Web Crypto
// scheme the verifier uses, so the test is self-contained (no fixtures).
// =====================================================================

import { test } from "node:test";
import assert from "node:assert/strict";

import { verifySvixSignature, type SvixHeaders } from "./svix.ts";

// A `whsec_<base64>` secret. The key bytes are the base64-decoded suffix.
const SECRET = "whsec_dGhpc2lzYXRlc3RzZWNyZXRrZXkxMjM0NTY3ODkw"; // test fixture, not a real secret — gitleaks:allow
const NOW = 1_700_000_000;

/** Build a valid svix-signature header for the given id/ts/body/secret. */
async function signV1(
  id: string,
  ts: number,
  body: string,
  secret: string,
): Promise<string> {
  const secretB64 = secret.slice("whsec_".length);
  const binary = atob(secretB64);
  const keyBytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) keyBytes[i] = binary.charCodeAt(i);

  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signedContent = `${id}.${ts}.${body}`;
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedContent),
  );
  const bytes = new Uint8Array(mac);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return `v1,${btoa(bin)}`;
}

const ID = "msg_2abc";
const BODY = JSON.stringify({ type: "email.bounced", data: { email: "doc@example.com" } });

test("verifySvixSignature: valid signature passes", async () => {
  const sig = await signV1(ID, NOW, BODY, SECRET);
  const headers: SvixHeaders = { id: ID, timestamp: String(NOW), signature: sig };
  assert.equal(await verifySvixSignature(headers, BODY, SECRET, NOW), true);
});

test("verifySvixSignature: tampered body fails", async () => {
  const sig = await signV1(ID, NOW, BODY, SECRET);
  const headers: SvixHeaders = { id: ID, timestamp: String(NOW), signature: sig };
  const tampered = JSON.stringify({ type: "email.delivered", data: { email: "doc@example.com" } });
  assert.equal(await verifySvixSignature(headers, tampered, SECRET, NOW), false);
});

test("verifySvixSignature: expired timestamp fails (> 300s skew)", async () => {
  const sig = await signV1(ID, NOW, BODY, SECRET);
  const headers: SvixHeaders = { id: ID, timestamp: String(NOW), signature: sig };
  // now is 301s after the signed timestamp -> outside tolerance.
  assert.equal(await verifySvixSignature(headers, BODY, SECRET, NOW + 301), false);
});

test("verifySvixSignature: timestamp at the 300s boundary still passes", async () => {
  const sig = await signV1(ID, NOW, BODY, SECRET);
  const headers: SvixHeaders = { id: ID, timestamp: String(NOW), signature: sig };
  assert.equal(await verifySvixSignature(headers, BODY, SECRET, NOW + 300), true);
});

test("verifySvixSignature: missing svix-id header fails", async () => {
  const sig = await signV1(ID, NOW, BODY, SECRET);
  const headers: SvixHeaders = { id: null, timestamp: String(NOW), signature: sig };
  assert.equal(await verifySvixSignature(headers, BODY, SECRET, NOW), false);
});

test("verifySvixSignature: missing svix-timestamp header fails", async () => {
  const sig = await signV1(ID, NOW, BODY, SECRET);
  const headers: SvixHeaders = { id: ID, timestamp: null, signature: sig };
  assert.equal(await verifySvixSignature(headers, BODY, SECRET, NOW), false);
});

test("verifySvixSignature: missing svix-signature header fails", async () => {
  const headers: SvixHeaders = { id: ID, timestamp: String(NOW), signature: null };
  assert.equal(await verifySvixSignature(headers, BODY, SECRET, NOW), false);
});

test("verifySvixSignature: wrong secret fails", async () => {
  const sig = await signV1(ID, NOW, BODY, SECRET);
  const headers: SvixHeaders = { id: ID, timestamp: String(NOW), signature: sig };
  const otherSecret = "whsec_b3RoZXJzZWNyZXRrZXl2YWx1ZTEyMzQ1Njc4OTA="; // test fixture — gitleaks:allow
  assert.equal(await verifySvixSignature(headers, BODY, otherSecret, NOW), false);
});

test("verifySvixSignature: secret without whsec_ prefix fails", async () => {
  const sig = await signV1(ID, NOW, BODY, SECRET);
  const headers: SvixHeaders = { id: ID, timestamp: String(NOW), signature: sig };
  assert.equal(await verifySvixSignature(headers, BODY, "notaprefixedsecret", NOW), false);
});

test("verifySvixSignature: non-numeric timestamp fails", async () => {
  const sig = await signV1(ID, NOW, BODY, SECRET);
  const headers: SvixHeaders = { id: ID, timestamp: "soon", signature: sig };
  assert.equal(await verifySvixSignature(headers, BODY, SECRET, NOW), false);
});

test("verifySvixSignature: multiple sigs, one valid -> passes", async () => {
  const valid = await signV1(ID, NOW, BODY, SECRET);
  const headers: SvixHeaders = {
    id: ID,
    timestamp: String(NOW),
    signature: `v1,AAAAdeadbeefAAAA= ${valid}`,
  };
  assert.equal(await verifySvixSignature(headers, BODY, SECRET, NOW), true);
});

test("verifySvixSignature: non-v1 version entry ignored", async () => {
  const valid = await signV1(ID, NOW, BODY, SECRET);
  // Re-tag the valid sig as v2 — verifier only accepts v1.
  const v2 = valid.replace("v1,", "v2,");
  const headers: SvixHeaders = { id: ID, timestamp: String(NOW), signature: v2 };
  assert.equal(await verifySvixSignature(headers, BODY, SECRET, NOW), false);
});
