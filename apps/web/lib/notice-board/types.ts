// =====================================================================
// notice-board/types.ts · ROMAS Wire NoticeBoard v2 — shared contracts (§6)
// Source of truth for the board. The EditorialNotice | SponsoredNotice
// discriminated union is the FRONTEND layer of the sponsor firewall: a
// SponsoredNotice can never be handed to an editorial card (compile error),
// mirroring the DB CHECK constraints (migration 0015) and the API guard.
// =====================================================================

export type NoticeType =
  | "announcement"
  | "news"
  | "event"
  | "partner"
  | "advertise"
  | "system"
  | "trial"
  | "conference";

export type NoticePriority = "featured" | "high" | "normal" | "low";

export type NoticeStatus =
  | "draft"
  | "pending_review"
  | "scheduled"
  | "published"
  | "expired"
  | "archived";

export type EditorialNoticeType =
  | "announcement"
  | "news"
  | "event"
  | "system"
  | "trial"
  | "conference";

interface NoticeBase {
  id: string;
  title: string; // ≤90
  summary: string; // ≤220
  ctaLabel?: string; // ≤24
  ctaUrl?: string;
  dateLabel?: string;
  startsAt?: string; // ISO UTC
  endsAt?: string; // ISO UTC
  timezone?: string; // IANA (required for event/conference)
  publishAt: string; // ISO UTC
  expiresAt?: string; // ISO UTC
  priority: NoticePriority;
  status: NoticeStatus;
  pinned: boolean;
  audience?: string[]; // empty/undefined = all
  region?: string[]; // empty/undefined = global
  conferenceKey?: string;
  isNew: boolean; // DERIVED at render (publishAt within NEW window)
}

export interface EditorialNotice extends NoticeBase {
  type: EditorialNoticeType;
  isSponsored: false;
}

export interface SponsoredNotice extends NoticeBase {
  type: "partner";
  isSponsored: true; // literal — required
  sponsorName: string; // required
  sponsorDisclosure: string; // required
}

export type Notice = EditorialNotice | SponsoredNotice;

export type SlotKind =
  | "homepage_partner"
  | "conference_partner"
  | "newsletter_companion"
  | "workflow_message"
  | "vendor_event";

/** A sellable position on the board (DB: inventory_slots). */
export interface InventorySlot {
  id: string;
  kind: SlotKind;
  noticeId: string | null; // null = unsold
  startsAt?: string; // ISO UTC
  endsAt?: string; // ISO UTC
}

/** Resolved state the board renders for its single inventory position (§11). */
export type InventorySlotState =
  | { state: "unsold" } // "Advertise on the Board →"
  | { state: "internal"; notice: EditorialNotice } // first-party ROMAS promo
  | { state: "sold"; notice: SponsoredNotice } // SponsoredNoticeCard
  | { state: "empty" }; // render null, grid collapses

export interface ConferenceContext {
  key: string; // 'ASTRO-2026'
  label: string; // 'ASTRO 2026'
  timezone: string; // IANA conference local tz
  lead: EditorialNotice; // conference lead card
}

export interface BoardPayload {
  featured: EditorialNotice | null;
  editorial: EditorialNotice[]; // news/announcement/event/trial
  sponsored: SponsoredNotice[];
  inventory: InventorySlotState;
  rotatingSecondary?: EditorialNotice[]; // optional pool for RotatingSlot (§10)
  conferenceMode?: ConferenceContext | null;
  fullWidth: boolean; // feature flag resolved server-side
}

/** Targeting context for selection (§8 step 2). */
export interface Viewer {
  audience?: string[]; // the viewer's roles, e.g. ["physicist"]
  region?: string[]; // the viewer's region(s), e.g. ["EU"]
}

/** Homepage display budget (§3), enforced by the selection engine. */
export const BOARD_BUDGET = {
  featured: 1,
  editorialMax: 4,
  sponsoredMax: 2,
  inventoryMax: 1,
} as const;

/** NEW window: publishAt within the last 7 days (§9). */
export const NEW_WINDOW_DAYS = 7;
