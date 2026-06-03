// node --experimental-strip-types --test archive.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { filterNotices, paginate, parseFilter, parseCursor } from "./archive.ts";
import type { Notice } from "./types.ts";

function ed(id: string, type: Notice["type"], title: string, summary: string, publishAt: string): Notice {
  return {
    id,
    type: type as never,
    isSponsored: false,
    title,
    summary,
    publishAt,
    priority: "normal",
    status: "published",
    pinned: false,
    isNew: false,
  } as Notice;
}

const FIXTURE: Notice[] = [
  ed("a", "announcement", "Cadence change", "twice weekly now", "2026-06-01T00:00:00Z"),
  ed("b", "news", "SABR-COMET-3", "oligometastatic liver SBRT", "2026-06-03T00:00:00Z"),
  ed("c", "event", "ASTRO 2026", "conference brief mode", "2026-06-02T00:00:00Z"),
  ed("d", "trial", "FLASH trial opens", "ultra-high dose rate", "2026-05-30T00:00:00Z"),
];

test("parseFilter coerces unknown to all", () => {
  assert.equal(parseFilter("news"), "news");
  assert.equal(parseFilter("bogus"), "all");
  assert.equal(parseFilter(undefined), "all");
});

test("parseCursor coerces to non-negative integer", () => {
  assert.equal(parseCursor("24"), 24);
  assert.equal(parseCursor("-5"), 0);
  assert.equal(parseCursor("abc"), 0);
  assert.equal(parseCursor(undefined), 0);
});

test("filter=all returns all, sorted newest-first", () => {
  const r = filterNotices(FIXTURE, "all", "");
  assert.equal(r.length, 4);
  assert.deepEqual(r.map((n) => n.id), ["b", "c", "a", "d"]); // by publishAt desc
});

test("filter by taxonomy (events includes event+conference)", () => {
  assert.deepEqual(filterNotices(FIXTURE, "news", "").map((n) => n.id), ["b"]);
  assert.deepEqual(filterNotices(FIXTURE, "events", "").map((n) => n.id), ["c"]);
});

test("search matches title and summary, case-insensitive", () => {
  assert.deepEqual(filterNotices(FIXTURE, "all", "SBRT").map((n) => n.id), ["b"]);
  assert.deepEqual(filterNotices(FIXTURE, "all", "dose rate").map((n) => n.id), ["d"]);
  assert.equal(filterNotices(FIXTURE, "all", "nonexistent").length, 0);
});

test("filter + search compose", () => {
  assert.equal(filterNotices(FIXTURE, "news", "FLASH").length, 0); // FLASH is a trial
  assert.deepEqual(filterNotices(FIXTURE, "trials", "FLASH").map((n) => n.id), ["d"]);
});

test("paginate slices and computes nextCursor", () => {
  const list = filterNotices(FIXTURE, "all", "");
  const p1 = paginate(list, 0, 2);
  assert.deepEqual(p1.notices.map((n) => n.id), ["b", "c"]);
  assert.equal(p1.nextCursor, 2);
  assert.equal(p1.total, 4);
  const p2 = paginate(list, 2, 2);
  assert.deepEqual(p2.notices.map((n) => n.id), ["a", "d"]);
  assert.equal(p2.nextCursor, null); // last page
});

test("paginate clamps negative cursor and overflow", () => {
  const list = filterNotices(FIXTURE, "all", "");
  assert.equal(paginate(list, -3, 2).notices[0].id, "b");
  assert.equal(paginate(list, 99, 2).notices.length, 0);
  assert.equal(paginate(list, 99, 2).nextCursor, null);
});
