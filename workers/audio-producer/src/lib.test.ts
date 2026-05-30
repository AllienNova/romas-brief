/**
 * audio-producer · lib.test.ts (SHIP-14)
 * node:test suite for the pure helpers extracted from index.ts.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  ELEVENLABS_MODEL_ID,
  TTS_MAX_ATTEMPTS,
  TTS_RETRY_BACKOFF_MS,
  formatSrtTime,
  loudnormGateDecision,
  retryBackoffMs,
} from "./lib.ts";

test("retryBackoffMs: 3 attempts with exact 2s / 8s / 30s schedule", () => {
  assert.equal(TTS_MAX_ATTEMPTS, 3);
  assert.equal(retryBackoffMs(0), 2000);
  assert.equal(retryBackoffMs(1), 8000);
  assert.equal(retryBackoffMs(2), 30000);
  assert.deepEqual([...TTS_RETRY_BACKOFF_MS], [2000, 8000, 30000]);
});

test("retryBackoffMs: out-of-range attempt clamps to final backoff", () => {
  assert.equal(retryBackoffMs(3), 30000);
  assert.equal(retryBackoffMs(99), 30000);
  assert.equal(retryBackoffMs(-1), 30000);
});

test("loudnormGateDecision: endpoint set -> use_endpoint", () => {
  assert.equal(
    loudnormGateDecision({ LOUDNORM_ENDPOINT: "https://loudnorm.internal/run" }),
    "use_endpoint",
  );
});

test("loudnormGateDecision: endpoint absent/empty/whitespace -> skip (fail-closed)", () => {
  assert.equal(loudnormGateDecision({}), "skip");
  assert.equal(loudnormGateDecision({ LOUDNORM_ENDPOINT: undefined }), "skip");
  assert.equal(loudnormGateDecision({ LOUDNORM_ENDPOINT: "" }), "skip");
  assert.equal(loudnormGateDecision({ LOUDNORM_ENDPOINT: "   " }), "skip");
});

test("ELEVENLABS_MODEL_ID is the locked multilingual_v2 model", () => {
  assert.equal(ELEVENLABS_MODEL_ID, "eleven_multilingual_v2");
});

test("formatSrtTime: formats hours/minutes/seconds/millis", () => {
  assert.equal(formatSrtTime(0), "00:00:00,000");
  assert.equal(formatSrtTime(1.5), "00:00:01,500");
  assert.equal(formatSrtTime(61.25), "00:01:01,250");
  assert.equal(formatSrtTime(3661.001), "01:01:01,001");
});
