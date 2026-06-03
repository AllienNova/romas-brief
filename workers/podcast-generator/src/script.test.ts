// node --experimental-strip-types --test script.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildScript,
  chunkText,
  ScriptError,
  SEGMENT_MAX_CHARS,
  MAX_CHAPTERS,
  type EpisodeInput,
} from "./script.ts";

test("chunkText returns single chunk under the limit", () => {
  assert.deepEqual(chunkText("short text"), ["short text"]);
  assert.deepEqual(chunkText(""), []);
});

test("chunkText splits long text on a sentence boundary, never mid-word", () => {
  const a = "A".repeat(3000);
  const b = "B".repeat(3000);
  const chunks = chunkText(`${a}. ${b}.`);
  assert.equal(chunks.length, 2);
  assert.ok(chunks.every((c) => c.length <= SEGMENT_MAX_CHARS));
  assert.ok(!chunks.some((c) => / $/.test(c))); // trimmed
});

test("chunkText hard-cuts when no boundary exists", () => {
  const chunks = chunkText("X".repeat(12000));
  assert.equal(chunks.length, 3); // 5000 + 5000 + 2000
  assert.ok(chunks.every((c) => c.length <= SEGMENT_MAX_CHARS));
});

test("buildScript happy path maps turns to snake_case segments", () => {
  const input: EpisodeInput = {
    chapters: [
      { title: "Opening", turns: [{ hostId: "host_a", text: "Welcome." }, { hostId: "host_b", text: "Glad to be here." }] },
    ],
  };
  const script = buildScript(input);
  assert.equal(script.chapters.length, 1);
  assert.deepEqual(script.chapters[0]!.segments[0], { host_id: "host_a", text: "Welcome." });
  assert.equal(script.chapters[0]!.segments.length, 2);
});

test("buildScript chunks a long turn into multiple segments", () => {
  const input: EpisodeInput = {
    chapters: [{ title: "Deep dive", turns: [{ hostId: "h", text: "Y".repeat(11000) }] }],
  };
  const script = buildScript(input);
  assert.equal(script.chapters[0]!.segments.length, 3); // 11000 → 3 chunks
  assert.ok(script.chapters[0]!.segments.every((s) => s.text.length <= SEGMENT_MAX_CHARS));
});

test("buildScript carries optional speed onto every chunk", () => {
  const script = buildScript({ chapters: [{ title: "c", turns: [{ hostId: "h", text: "hi", speed: 1.2 }] }] });
  assert.equal(script.chapters[0]!.segments[0]!.speed, 1.2);
});

test("buildScript rejects empty episode / missing hostId / bad speed", () => {
  assert.throws(() => buildScript({ chapters: [] }), ScriptError);
  assert.throws(() => buildScript({ chapters: [{ title: "c", turns: [{ hostId: "", text: "x" }] }] }), ScriptError);
  assert.throws(() => buildScript({ chapters: [{ title: "c", turns: [{ hostId: "h", text: "x", speed: 3 }] }] }), ScriptError);
});

test("buildScript enforces the chapter cap", () => {
  const chapters = Array.from({ length: MAX_CHAPTERS + 1 }, (_, i) => ({
    title: `c${i}`,
    turns: [{ hostId: "h", text: "x" }],
  }));
  assert.throws(() => buildScript({ chapters }), ScriptError);
});

test("buildScript enforces the total-character cap", () => {
  // one chapter, one turn of 80k chars → chunks fine but exceeds the 75k total cap
  assert.throws(
    () => buildScript({ chapters: [{ title: "c", turns: [{ hostId: "h", text: "z".repeat(80_000) }] }] }),
    /75,?000 total characters/,
  );
});
