// =====================================================================
// telemetry.ts — privacy-first notice telemetry (§12). Pure helpers shared by
// the ingest route (parseEventPayload) and the admin rollup (rollupEvents /
// fillRate). The PII guarantee is enforced HERE: parseEventPayload reads ONLY
// noticeId / kind / surface — any session, user, or PHI field in an untrusted
// body is silently ignored and never persisted. No identifiers, ever.
// =====================================================================
export const NOTICE_EVENT_KINDS = ["impression", "click"] as const;
export type NoticeEventKind = (typeof NOTICE_EVENT_KINDS)[number];

export const NOTICE_SURFACES = ["homepage", "archive", "conference"] as const;
export type NoticeSurface = (typeof NOTICE_SURFACES)[number];

/** sendBeacon batches; cap to bound a single ingest call. */
export const EVENT_BATCH_MAX = 20;
/** Impression qualifies at ≥50% visible for ≥1s (§12). */
export const IMPRESSION_VISIBLE_RATIO = 0.5;
export const IMPRESSION_DWELL_MS = 1000;

export interface NoticeEvent {
  noticeId: string;
  kind: NoticeEventKind;
  surface: NoticeSurface;
}

function isKind(v: unknown): v is NoticeEventKind {
  return typeof v === "string" && (NOTICE_EVENT_KINDS as readonly string[]).includes(v);
}
function isSurface(v: unknown): v is NoticeSurface {
  return typeof v === "string" && (NOTICE_SURFACES as readonly string[]).includes(v);
}
function isNoticeId(v: unknown): v is string {
  return typeof v === "string" && v.length > 0 && v.length <= 64;
}

/**
 * Validate an untrusted telemetry body (single event or batch). Drops malformed
 * entries, caps the batch, and — critically — reads ONLY the three allowed
 * fields, so no PII/PHI smuggled in the payload can ever be persisted.
 */
export function parseEventPayload(body: unknown): NoticeEvent[] {
  const arr = Array.isArray(body) ? body : [body];
  const out: NoticeEvent[] = [];
  for (const raw of arr.slice(0, EVENT_BATCH_MAX)) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    if (isNoticeId(r["noticeId"]) && isKind(r["kind"]) && isSurface(r["surface"])) {
      out.push({ noticeId: r["noticeId"], kind: r["kind"], surface: r["surface"] });
    }
  }
  return out;
}

export interface NoticeStat {
  noticeId: string;
  impressions: number;
  clicks: number;
  ctr: number;
}

/** Aggregate raw event rows → per-notice impressions/clicks/CTR (admin rollup). Pure. */
export function rollupEvents(rows: { notice_id: string; kind: string }[]): NoticeStat[] {
  const m = new Map<string, { impressions: number; clicks: number }>();
  for (const r of rows) {
    const e = m.get(r.notice_id) ?? { impressions: 0, clicks: 0 };
    if (r.kind === "impression") e.impressions++;
    else if (r.kind === "click") e.clicks++;
    m.set(r.notice_id, e);
  }
  return [...m.entries()]
    .map(([noticeId, { impressions, clicks }]) => ({
      noticeId,
      impressions,
      clicks,
      ctr: impressions > 0 ? clicks / impressions : 0,
    }))
    .sort((a, b) => b.impressions - a.impressions);
}

/** Fill rate = sold slot-days / total slot-days (justifies pricing). Pure. */
export function fillRate(soldSlotDays: number, totalSlotDays: number): number {
  return totalSlotDays > 0 ? soldSlotDays / totalSlotDays : 0;
}
