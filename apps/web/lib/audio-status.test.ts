// SHIP-23 — tests for the audio status model (mirrors migration 0002 enum
// + the CLAUDE.md §7 token mapping + Rule-6 playability gate).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AUDIO_STATUS_META,
  isAudioPlayable,
  toAudioStatus,
  type AudioStatus,
} from "./audio-status.ts";

const ALL: AudioStatus[] = ["queued", "generating", "in_review", "published", "skipped", "revoked"];

test("all six DB states are covered (matches migration 0002 enum)", () => {
  assert.equal(Object.keys(AUDIO_STATUS_META).length, 6);
  for (const s of ALL) assert.ok(AUDIO_STATUS_META[s].label.length > 0);
});

test("only 'published' is playable (Rule 6)", () => {
  assert.equal(isAudioPlayable("published"), true);
  for (const s of ALL.filter((x) => x !== "published")) {
    assert.equal(isAudioPlayable(s), false);
  }
});

test("token mapping: published→teal, in-flight→amber, terminal→slate", () => {
  assert.equal(AUDIO_STATUS_META.published.token, "--rb-audio-published");
  for (const s of ["queued", "generating", "in_review"] as AudioStatus[]) {
    assert.equal(AUDIO_STATUS_META[s].token, "--rb-audio-pending");
  }
  for (const s of ["skipped", "revoked"] as AudioStatus[]) {
    assert.equal(AUDIO_STATUS_META[s].token, "--rb-audio-skipped");
  }
});

test("toAudioStatus narrows known values and defaults unknown/null to skipped", () => {
  assert.equal(toAudioStatus("published"), "published");
  assert.equal(toAudioStatus("in_review"), "in_review");
  assert.equal(toAudioStatus("bogus"), "skipped");
  assert.equal(toAudioStatus(null), "skipped");
  assert.equal(toAudioStatus(undefined), "skipped");
});
