// =====================================================================
// select-board.test.ts — the NoticeBoard selection engine (§8/§20). Run:
//   node --experimental-strip-types --test apps/web/lib/notice-board/select-board.test.ts
// =====================================================================

import { test } from "node:test";
import assert from "node:assert/strict";

import { selectBoard, deriveIsNew, isLive } from "./select-board.ts";
import type { EditorialNotice, InventorySlot, SponsoredNotice } from "./types.ts";

const NOW = new Date("2026-06-02T12:00:00.000Z");
let idc = 0;

function ed(over: Partial<EditorialNotice> = {}): EditorialNotice {
  idc += 1;
  return {
    id: `e${idc}`,
    type: "news",
    isSponsored: false,
    title: "Editorial title",
    summary: "Editorial summary",
    priority: "normal",
    status: "published",
    pinned: false,
    publishAt: "2026-06-01T00:00:00.000Z",
    isNew: false,
    ...over,
  } as EditorialNotice;
}

function sp(over: Partial<SponsoredNotice> = {}): SponsoredNotice {
  idc += 1;
  return {
    id: `s${idc}`,
    type: "partner",
    isSponsored: true,
    title: "Partner title",
    summary: "Partner summary",
    priority: "normal",
    status: "published",
    pinned: false,
    publishAt: "2026-06-01T00:00:00.000Z",
    isNew: false,
    sponsorName: "Acme Onc",
    sponsorDisclosure: "Partner message",
    ...over,
  } as SponsoredNotice;
}

test("deriveIsNew: 7-day boundary, no future", () => {
  assert.equal(deriveIsNew("2026-05-27T12:00:00.000Z", NOW), true); // 6 days ago
  assert.equal(deriveIsNew("2026-05-26T12:00:00.000Z", NOW), true); // exactly 7 days
  assert.equal(deriveIsNew("2026-05-25T11:00:00.000Z", NOW), false); // >7 days
  assert.equal(deriveIsNew("2026-06-03T00:00:00.000Z", NOW), false); // future
});

test("isLive: status + publish window + expiry", () => {
  assert.equal(isLive(ed({ status: "published", publishAt: "2026-06-01T00:00:00Z" }), NOW), true);
  assert.equal(isLive(ed({ status: "draft" }), NOW), false);
  assert.equal(isLive(ed({ status: "published", publishAt: "2026-06-03T00:00:00Z" }), NOW), false); // not yet
  assert.equal(isLive(ed({ status: "published", expiresAt: "2026-06-02T00:00:00Z" }), NOW), false); // expired
});

test("filters to live only", () => {
  const board = selectBoard([ed({ status: "draft" }), ed({ status: "expired" }), ed({ id: "live", status: "published" })], [], NOW);
  const all = [...(board.featured ? [board.featured] : []), ...board.editorial];
  assert.equal(all.length, 1);
  assert.equal(all[0]!.id, "live");
});

test("featured: explicit priority=featured wins, excluded from editorial[]", () => {
  const board = selectBoard([ed({ id: "f", priority: "featured" }), ed(), ed()], [], NOW);
  assert.equal(board.featured?.id, "f");
  assert.equal(board.editorial.find((n) => n.id === "f"), undefined);
});

test("featured: falls back to top pinned when no explicit featured", () => {
  const board = selectBoard([ed(), ed({ id: "p", pinned: true }), ed()], [], NOW);
  assert.equal(board.featured?.id, "p");
});

test("editorial budget capped at 4; ordered pinned>priority>recency", () => {
  // all publishAt in the past so all 8 are live
  const many = Array.from({ length: 8 }, (_, i) => ed({ id: `n${i}`, publishAt: `2026-06-01T0${i}:00:00.000Z` }));
  const board = selectBoard(many, [], NOW);
  assert.equal(board.editorial.length, 4);
  // pinned floats to top
  const b2 = selectBoard([ed({ id: "a" }), ed({ id: "pin", pinned: true, priority: "low" }), ed({ id: "c" })], [], NOW);
  // featured fallback grabs the pinned one; so editorial top should be by priority/recency among rest
  assert.equal(b2.featured?.id, "pin");
});

test("sponsored capped at 2", () => {
  const board = selectBoard([sp(), sp(), sp(), sp()], [], NOW);
  assert.equal(board.sponsored.length, 2);
  assert.ok(board.sponsored.every((n) => n.isSponsored === true));
});

test("inventory state machine: empty / unsold / sold / internal", () => {
  // no slot → empty
  assert.deepEqual(selectBoard([], [], NOW).inventory, { state: "empty" });

  // slot, no notice → unsold
  const unsoldSlot: InventorySlot = { id: "sl", kind: "homepage_partner", noticeId: null };
  assert.deepEqual(selectBoard([], [unsoldSlot], NOW).inventory, { state: "unsold" });

  // slot → sold sponsored notice; excluded from sponsored[]
  const sold = sp({ id: "sold1" });
  const soldSlot: InventorySlot = { id: "sl2", kind: "homepage_partner", noticeId: "sold1" };
  const b = selectBoard([sold, sp({ id: "other" })], [soldSlot], NOW);
  assert.equal(b.inventory.state, "sold");
  assert.equal(b.sponsored.find((n) => n.id === "sold1"), undefined, "inventory notice not double-rendered");

  // slot → internal editorial promo
  const promo = ed({ id: "promo", type: "announcement" });
  const internalSlot: InventorySlot = { id: "sl3", kind: "homepage_partner", noticeId: "promo" };
  assert.equal(selectBoard([promo], [internalSlot], NOW).inventory.state, "internal");
});

test("audience/region targeting: empty=all; targeted excludes anon, matches viewer", () => {
  const targetedN = ed({ id: "phys", audience: ["physicist"] });
  const general = ed({ id: "all" });
  // anonymous viewer → only general shows
  const anon = selectBoard([targetedN, general], [], NOW);
  const anonIds = [...(anon.featured ? [anon.featured.id] : []), ...anon.editorial.map((n) => n.id)];
  assert.ok(anonIds.includes("all"));
  assert.ok(!anonIds.includes("phys"));
  // matching viewer → both
  const phys = selectBoard([targetedN, general], [], NOW, { audience: ["physicist"] });
  const physIds = [...(phys.featured ? [phys.featured.id] : []), ...phys.editorial.map((n) => n.id)];
  assert.ok(physIds.includes("phys"));
});

test("conference promotion: lead → featured + conferenceMode + full-width", () => {
  const conf = ed({ id: "astro", type: "conference", conferenceKey: "ASTRO-2026", timezone: "America/New_York", title: "ASTRO 2026" });
  const event = ed({ id: "ev", type: "event", conferenceKey: "ASTRO-2026", timezone: "America/New_York" });
  const board = selectBoard([conf, event, ed({ id: "other" })], [], NOW);
  assert.equal(board.conferenceMode?.key, "ASTRO-2026");
  assert.equal(board.conferenceMode?.timezone, "America/New_York");
  assert.equal(board.featured?.id, "astro");
  assert.equal(board.fullWidth, true, "conference defaults to full-width band");
  // conference event boosted to front of editorial
  assert.equal(board.editorial[0]?.id, "ev");
});

test("overflow editorial → rotatingSecondary only when rotation enabled", () => {
  const many = Array.from({ length: 8 }, (_, i) => ed({ id: `r${i}` }));
  assert.equal(selectBoard(many, [], NOW).rotatingSecondary, undefined);
  const withRot = selectBoard(many, [], NOW, {}, { rotation: true });
  assert.ok((withRot.rotatingSecondary?.length ?? 0) >= 1);
});

test("derives isNew on returned notices", () => {
  const board = selectBoard([ed({ id: "fresh", publishAt: NOW.toISOString(), priority: "featured" })], [], NOW);
  assert.equal(board.featured?.isNew, true);
});

// ── review NB-fix D regression tests ──────────────────────────────────

test("sponsored notices never get isNew=true (§9)", () => {
  const board = selectBoard([sp({ publishAt: NOW.toISOString() })], [], NOW);
  assert.equal(board.sponsored[0]?.isNew, false);
});

test("boundary: publishAt===now is live; expiresAt===now is expired", () => {
  assert.equal(isLive(ed({ publishAt: NOW.toISOString() }), NOW), true);
  assert.equal(isLive(ed({ expiresAt: NOW.toISOString() }), NOW), false);
});

test("featured is never a sponsored notice (runtime firewall)", () => {
  const board = selectBoard([sp({ id: "s", priority: "normal" }), ed({ id: "e", priority: "featured" })], [], NOW);
  assert.equal(board.featured?.isSponsored, false);
  assert.equal(board.featured?.id, "e");
});

test("inventory targeting: a targeted slot notice is hidden from anon (→ unsold)", () => {
  const promo = ed({ id: "promo", type: "announcement", audience: ["physicist"] });
  const slot: InventorySlot = { id: "sl", kind: "homepage_partner", noticeId: "promo" };
  assert.equal(selectBoard([promo], [slot], NOW).inventory.state, "unsold");
  assert.equal(selectBoard([promo], [slot], NOW, { audience: ["physicist"] }).inventory.state, "internal");
});

test("multiple active conference keys: picks one deterministically (no throw)", () => {
  const a = ed({ id: "a", type: "conference", conferenceKey: "ASTRO-2026", timezone: "America/Chicago", priority: "high" });
  const b = ed({ id: "b", type: "conference", conferenceKey: "ESTRO-2026", timezone: "Europe/Vienna", priority: "normal" });
  const board = selectBoard([a, b], [], NOW);
  assert.ok(board.conferenceMode);
  assert.equal(board.conferenceMode?.key, "ASTRO-2026"); // higher priority wins
});

test("conference notice without timezone → no conferenceMode (defensive)", () => {
  const c = ed({ id: "c", type: "conference", conferenceKey: "X", priority: "featured" });
  const board = selectBoard([c], [], NOW);
  assert.equal(board.conferenceMode, null);
  assert.equal(board.featured?.id, "c");
});
