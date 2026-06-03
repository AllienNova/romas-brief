// =====================================================================
// notice-board/select-board.ts · ROMAS Wire NoticeBoard v2 — selection engine (§8)
// Pure, I/O-free, deterministic. The "board never clutters / featured is
// unique / sponsored never exceeds budget" guarantees all live here, so they
// unit-test in isolation. Inputs are already-fetched rows; output is the
// BoardPayload the API serves.
// =====================================================================

import {
  BOARD_BUDGET,
  NEW_WINDOW_DAYS,
  type BoardPayload,
  type ConferenceContext,
  type EditorialNotice,
  type InventorySlot,
  type InventorySlotState,
  type Notice,
  type SponsoredNotice,
  type Viewer,
} from "./types.ts";

const DAY_MS = 86_400_000;
const PRIORITY_RANK: Record<Notice["priority"], number> = {
  featured: 0,
  high: 1,
  normal: 2,
  low: 3,
};

export interface SelectOptions {
  fullWidth?: boolean;
  rotation?: boolean;
}

/** publishAt within the last NEW_WINDOW_DAYS and not in the future. */
export function deriveIsNew(publishAt: string, now: Date): boolean {
  const t = Date.parse(publishAt);
  if (!Number.isFinite(t)) return false;
  return t <= now.getTime() && now.getTime() - t <= NEW_WINDOW_DAYS * DAY_MS;
}

function withIsNew<T extends Notice>(n: T, now: Date): T {
  // §9: the NEW indicator is editorial-only — never derive isNew=true on sponsored (review arch H-3).
  return { ...n, isNew: n.isSponsored ? false : deriveIsNew(n.publishAt, now) };
}

/** Live = published, publishAt reached, not past expiry. */
export function isLive(n: Notice, now: Date): boolean {
  if (n.status !== "published") return false;
  const pub = Date.parse(n.publishAt);
  if (!Number.isFinite(pub) || pub > now.getTime()) return false;
  if (n.expiresAt) {
    const exp = Date.parse(n.expiresAt);
    if (Number.isFinite(exp) && exp <= now.getTime()) return false;
  }
  return true;
}

/** Tag targeting: empty notice tags → match all; else intersect viewer tags. */
function matchesTags(noticeTags: string[] | undefined, viewerTags: string[] | undefined): boolean {
  if (!noticeTags || noticeTags.length === 0) return true;
  if (!viewerTags || viewerTags.length === 0) return false;
  return noticeTags.some((t) => viewerTags.includes(t));
}

function targeted(n: Notice, viewer: Viewer): boolean {
  return matchesTags(n.audience, viewer.audience) && matchesTags(n.region, viewer.region);
}

function isEditorial(n: Notice): n is EditorialNotice {
  return n.isSponsored === false;
}
function isSponsored(n: Notice): n is SponsoredNotice {
  return n.isSponsored === true;
}

function slotActive(slot: InventorySlot, now: Date): boolean {
  const t = now.getTime();
  if (slot.startsAt) {
    const s = Date.parse(slot.startsAt);
    if (Number.isFinite(s) && s > t) return false;
  }
  if (slot.endsAt) {
    const e = Date.parse(slot.endsAt);
    if (Number.isFinite(e) && e <= t) return false;
  }
  return true;
}

function compareEditorial(a: EditorialNotice, b: EditorialNotice, conferenceKey?: string): number {
  if (conferenceKey) {
    const ac = a.conferenceKey === conferenceKey ? 0 : 1;
    const bc = b.conferenceKey === conferenceKey ? 0 : 1;
    if (ac !== bc) return ac - bc; // conference items first in conference mode
  }
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
  const pr = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  if (pr !== 0) return pr;
  return Date.parse(b.publishAt) - Date.parse(a.publishAt); // newest first
}

function resolveInventory(
  slots: InventorySlot[],
  byId: Map<string, Notice>,
  now: Date,
  viewer: Viewer,
): { state: InventorySlotState; usedNoticeId: string | null } {
  const active = slots.filter((s) => s.kind === "homepage_partner" && slotActive(s, now));
  if (active.length === 0) return { state: { state: "empty" }, usedNoticeId: null };
  const slot = active[0]!;
  if (!slot.noticeId) return { state: { state: "unsold" }, usedNoticeId: null };
  const n = byId.get(slot.noticeId);
  // Targeting (review arch H-2): a slot notice not targeted at this viewer must not
  // render to them — fall back to the unsold/Advertise state instead.
  if (!n || !isLive(n, now) || !targeted(n, viewer)) {
    return { state: { state: "unsold" }, usedNoticeId: null };
  }
  if (isSponsored(n)) return { state: { state: "sold", notice: withIsNew(n, now) }, usedNoticeId: n.id };
  return { state: { state: "internal", notice: withIsNew(n, now) }, usedNoticeId: n.id };
}

/**
 * Build the homepage board from live notices + inventory.
 * Deterministic per §8; no I/O.
 */
export function selectBoard(
  notices: Notice[],
  slots: InventorySlot[],
  now: Date,
  viewer: Viewer = {},
  options: SelectOptions = {},
): BoardPayload {
  const byId = new Map(notices.map((n) => [n.id, n]));

  // 1–2. live + targeted
  const live = notices.filter((n) => isLive(n, now) && targeted(n, viewer));

  // 7. inventory slot first (so we can exclude its notice from other pools)
  const { state: inventory, usedNoticeId } = resolveInventory(slots, byId, now, viewer);

  // 3. conference context (a live conference notice within window)
  const conferenceCandidates = live
    .filter(isEditorial)
    .filter((n) => n.type === "conference" && n.conferenceKey);
  const distinctKeys = new Set(conferenceCandidates.map((n) => n.conferenceKey));
  if (distinctKeys.size > 1) {
    // review qual H-1: don't silently drop a second live conference — surface it.
    console.warn("[selectBoard] multiple active conference keys; using highest-priority/most-recent:", [...distinctKeys]);
  }
  const conferenceNotice = conferenceCandidates.sort((a, b) => compareEditorial(a, b))[0];
  const conferenceKey = conferenceNotice?.conferenceKey;

  let conferenceMode: ConferenceContext | null = null;
  let featured: EditorialNotice | null = null;
  const consumed = new Set<string>();
  if (usedNoticeId) consumed.add(usedNoticeId);

  if (conferenceNotice && conferenceKey && conferenceNotice.timezone) {
    const lead = withIsNew(conferenceNotice, now);
    conferenceMode = {
      key: conferenceKey,
      label: conferenceNotice.title,
      timezone: conferenceNotice.timezone,
      lead,
    };
    featured = lead;
    consumed.add(conferenceNotice.id);
  } else {
    // 4. featured: the unique priority='featured' editorial, else top pinned editorial
    const editorialPool = live.filter(isEditorial).filter((n) => !consumed.has(n.id));
    const explicitFeatured = editorialPool.find((n) => n.priority === "featured");
    const pick =
      explicitFeatured ??
      editorialPool.filter((n) => n.pinned).sort((a, b) => compareEditorial(a, b))[0];
    if (pick) {
      featured = withIsNew(pick, now);
      consumed.add(pick.id);
    }
  }

  // 5. editorial fill (up to budget), conference items boosted in conference mode
  const editorialAll = live
    .filter(isEditorial)
    .filter((n) => !consumed.has(n.id))
    .sort((a, b) => compareEditorial(a, b, conferenceKey));
  const editorial = editorialAll.slice(0, BOARD_BUDGET.editorialMax).map((n) => withIsNew(n, now));
  editorial.forEach((n) => consumed.add(n.id));

  // 6. sponsored fill (up to budget), excluding the inventory-slot notice
  const sponsored = live
    .filter(isSponsored)
    .filter((n) => !consumed.has(n.id))
    .sort((a, b) => Date.parse(b.publishAt) - Date.parse(a.publishAt))
    .slice(0, BOARD_BUDGET.sponsoredMax)
    .map((n) => withIsNew(n, now));
  sponsored.forEach((n) => consumed.add(n.id));

  // 8. overflow editorial → rotating pool (only meaningful if rotation enabled)
  const rotatingSecondary = options.rotation
    ? editorialAll.slice(BOARD_BUDGET.editorialMax).map((n) => withIsNew(n, now))
    : undefined;

  const payload: BoardPayload = {
    featured,
    editorial,
    sponsored,
    inventory,
    conferenceMode,
    fullWidth: options.fullWidth ?? conferenceMode !== null, // conference defaults to full-width (§13)
  };
  if (rotatingSecondary && rotatingSecondary.length > 0) {
    payload.rotatingSecondary = rotatingSecondary;
  }
  return payload;
}
