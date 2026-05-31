// SHIP-17 — tests for the Rule-6 audio publish gate (the critic flagged this
// surface as untested). Mirrors the DB CHECK audio_publish_requires_qa.
import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluatePublishGate, LUFS_MIN, LUFS_MAX, TRUE_PEAK_MAX } from "./audio-qa-gate.ts";

const pass = {
  clinical_claims_checked: true,
  qa_reviewer: "reviewer-uuid",
  loudness_lufs: -16,
  true_peak_dbtp: -1.5,
  transcript_url: "https://cdn/t.txt",
};

test("all 5 conditions met → allPass, no failures", () => {
  const r = evaluatePublishGate(pass);
  assert.equal(r.allPass, true);
  assert.deepEqual(r.failed, []);
  assert.equal(r.conditions.length, 5);
});

test("each condition fails independently", () => {
  assert.deepEqual(evaluatePublishGate({ ...pass, clinical_claims_checked: false }).failed, ["clinical_claims_checked"]);
  assert.deepEqual(evaluatePublishGate({ ...pass, clinical_claims_checked: null }).failed, ["clinical_claims_checked"]);
  assert.deepEqual(evaluatePublishGate({ ...pass, qa_reviewer: null }).failed, ["qa_reviewer"]);
  assert.deepEqual(evaluatePublishGate({ ...pass, loudness_lufs: null }).failed, ["loudness_lufs"]);
  assert.deepEqual(evaluatePublishGate({ ...pass, true_peak_dbtp: null }).failed, ["true_peak_dbtp"]);
  assert.deepEqual(evaluatePublishGate({ ...pass, transcript_url: null }).failed, ["transcript_url"]);
});

test("loudness band is inclusive [-18, -14] — matches DB CHECK", () => {
  assert.equal(LUFS_MIN, -18);
  assert.equal(LUFS_MAX, -14);
  assert.equal(evaluatePublishGate({ ...pass, loudness_lufs: -18 }).allPass, true);
  assert.equal(evaluatePublishGate({ ...pass, loudness_lufs: -14 }).allPass, true);
  assert.equal(evaluatePublishGate({ ...pass, loudness_lufs: -18.1 }).allPass, false);
  assert.equal(evaluatePublishGate({ ...pass, loudness_lufs: -13.9 }).allPass, false);
});

test("true peak ceiling is <= -1 — matches DB CHECK", () => {
  assert.equal(TRUE_PEAK_MAX, -1);
  assert.equal(evaluatePublishGate({ ...pass, true_peak_dbtp: -1 }).allPass, true);
  assert.equal(evaluatePublishGate({ ...pass, true_peak_dbtp: -0.9 }).allPass, false);
});

test("multiple failures are all reported", () => {
  const r = evaluatePublishGate({ clinical_claims_checked: false, qa_reviewer: null, loudness_lufs: null, true_peak_dbtp: 0, transcript_url: null });
  assert.equal(r.allPass, false);
  assert.equal(r.failed.length, 5);
});
