// =====================================================================
// store-file.test.ts — cross-process staged store round-trip on a tmp file.
// =====================================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { FileStagedStore } from "./store-file.ts";
import type { StagedRecord } from "./approval.ts";

function tmpStore(): { store: FileStagedStore; dir: string } {
  const dir = mkdtempSync(join(tmpdir(), "romas-agent-"));
  return { store: new FileStagedStore(join(dir, "staged.json")), dir };
}

const REC: StagedRecord = {
  id: "id-1",
  channel: "email",
  summary: "email → d@x.com",
  recipientCount: 1,
  createdAt: "2026-06-01T00:00:00.000Z",
  payload: { kind: "email", to: "d@x.com", secret: "must-not-leak-into-list" },
};

test("FileStagedStore: put → get round-trips the full record incl. payload", () => {
  const { store, dir } = tmpStore();
  try {
    assert.equal(store.get("id-1"), undefined);
    store.put(REC);
    assert.deepEqual(store.get("id-1"), REC);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("FileStagedStore: list omits payloads; delete removes", () => {
  const { store, dir } = tmpStore();
  try {
    store.put(REC);
    const list = store.list();
    assert.equal(list.length, 1);
    assert.equal(list[0]!.id, "id-1");
    assert.equal("payload" in list[0]!, false);
    store.delete("id-1");
    assert.equal(store.get("id-1"), undefined);
    assert.equal(store.list().length, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("FileStagedStore: a second instance sees the first's writes (cross-process)", () => {
  const { store, dir } = tmpStore();
  try {
    store.put(REC);
    const reopened = new FileStagedStore(join(dir, "staged.json"));
    assert.deepEqual(reopened.get("id-1"), REC);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
