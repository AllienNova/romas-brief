// =====================================================================
// get-board.ts · NoticeBoard v2 (NB-4) — server-only board fetcher.
// Single source for the homepage RSC AND GET /api/notices/board:
//   Supabase published notices + inventory slots + sponsor names → selectBoard.
// Cached 60s with the `notices-board` tag (on-demand revalidation via the
// scheduler/admin → /api/internal/revalidate-board). RESILIENCE (§2): no DB
// env, a query error, or an empty result → a curated STATIC FALLBACK board
// (bundled MOCK_NOTICES). The board never renders broken or empty.
//
// Notices table (migration 0015) is apply-gated, so the DB path is dormant
// until applied — the fallback runs in the meantime. Queries are typed via a
// localized cast + .returns<T>() (the table isn't in the generated Database
// type yet), avoiding `any`.
// =====================================================================
import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { selectBoard } from "./select-board.ts";
import { MOCK_NOTICES, MOCK_SLOTS } from "./mock-notices.ts";
import type {
  BoardPayload,
  EditorialNotice,
  InventorySlot,
  Notice,
  SponsoredNotice,
} from "./types.ts";

const QUERY_TIMEOUT_MS = 10_000;
export const NOTICE_COLUMNS =
  "id,type,title,summary,cta_label,cta_url,date_label,starts_at,ends_at,timezone,publish_at,expires_at,priority,status,pinned,audience,region,conference_key,is_sponsored,sponsor_id,sponsor_disclosure";

export interface NoticeRow {
  id: string;
  type: string;
  title: string;
  summary: string;
  cta_label: string | null;
  cta_url: string | null;
  date_label: string | null;
  starts_at: string | null;
  ends_at: string | null;
  timezone: string | null;
  publish_at: string;
  expires_at: string | null;
  priority: string;
  status: string;
  pinned: boolean;
  audience: string[] | null;
  region: string[] | null;
  conference_key: string | null;
  is_sponsored: boolean;
  sponsor_id: string | null;
  sponsor_disclosure: string | null;
}
interface SlotRow {
  id: string;
  kind: string;
  notice_id: string | null;
  starts_at: string | null;
  ends_at: string | null;
}
export interface SponsorRow {
  id: string;
  name: string;
}

export function hasDbEnv(): boolean {
  return Boolean(process.env["SUPABASE_URL"] && process.env["SUPABASE_ANON_KEY"]);
}
function opt(v: string | null | undefined): string | undefined {
  return v ?? undefined;
}

/** cta_url allowlist (review H-01): https-only external OR absolute-path internal; else dropped. */
function safeCta(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  const t = raw.trim();
  return /^https:\/\//i.test(t) || t.startsWith("/") ? t : undefined;
}

const VALID_PRIORITY = new Set<string>(["featured", "high", "normal", "low"]);
const VALID_STATUS = new Set<string>(["draft", "pending_review", "scheduled", "published", "expired", "archived"]);

export function rowToNotice(r: NoticeRow, sponsorName: string | undefined): Notice | null {
  // Firewall defense vs schema/enum drift (review M-01): a non-boolean is_sponsored
  // (e.g. a column rename surfacing undefined) or an unknown enum drops the row
  // rather than silently mis-routing a sponsored notice into an editorial card.
  if (typeof r.is_sponsored !== "boolean") return null;
  if (!VALID_PRIORITY.has(r.priority) || !VALID_STATUS.has(r.status)) return null;
  const base = {
    id: r.id,
    title: r.title,
    summary: r.summary,
    ctaLabel: opt(r.cta_label),
    ctaUrl: safeCta(r.cta_url),
    dateLabel: opt(r.date_label),
    startsAt: opt(r.starts_at),
    endsAt: opt(r.ends_at),
    timezone: opt(r.timezone),
    publishAt: r.publish_at,
    expiresAt: opt(r.expires_at),
    priority: r.priority as Notice["priority"],
    status: r.status as Notice["status"],
    pinned: r.pinned,
    audience: r.audience ?? undefined,
    region: r.region ?? undefined,
    conferenceKey: opt(r.conference_key),
    isNew: false,
  };
  if (r.is_sponsored) {
    // firewall: a sponsored row missing its sponsor/disclosure is dropped, never editorialized.
    if (!sponsorName || !r.sponsor_disclosure) return null;
    const sponsored: SponsoredNotice = {
      ...base,
      type: "partner",
      isSponsored: true,
      sponsorName,
      sponsorDisclosure: r.sponsor_disclosure,
    };
    return sponsored;
  }
  const editorial: EditorialNotice = {
    ...base,
    type: r.type as EditorialNotice["type"],
    isSponsored: false,
  };
  return editorial;
}

async function fetchBoard(): Promise<BoardPayload> {
  const now = new Date(); // single clock for the live + fallback paths (review M-2)
  const fallback = (): BoardPayload => selectBoard(MOCK_NOTICES, MOCK_SLOTS, now);
  if (!hasDbEnv()) return fallback();

  try {
    // TODO(NB-0015): drop this cast once `supabase gen types` adds notices/
    // inventory_slots/sponsor_public to database.types.ts (review M-01).
    const sb = createPublicSupabaseClient() as unknown as SupabaseClient;
    const signal = AbortSignal.timeout(QUERY_TIMEOUT_MS);
    const [noticeRes, slotRes, sponsorRes] = await Promise.all([
      sb.from("notices").select(NOTICE_COLUMNS).eq("status", "published").abortSignal(signal).returns<NoticeRow[]>(),
      sb.from("inventory_slots").select("id,kind,notice_id,starts_at,ends_at").abortSignal(signal).returns<SlotRow[]>(),
      sb.from("sponsor_public").select("id,name").abortSignal(signal).returns<SponsorRow[]>(),
    ]);

    if (noticeRes.error || !noticeRes.data) return fallback();
    // A sponsor-name lookup failure would silently drop sold inventory + sponsored
    // cards (lost revenue) — treat as a hard fallback (review qual H-2).
    if (sponsorRes.error) return fallback();
    if (slotRes.error) console.error("[getBoard] inventory_slots query failed:", slotRes.error.message);

    const sponsorMap = new Map((sponsorRes.data ?? []).map((s) => [s.id, s.name] as const));
    const notices = noticeRes.data
      .map((r) => rowToNotice(r, r.sponsor_id ? sponsorMap.get(r.sponsor_id) : undefined))
      .filter((n): n is Notice => n !== null);
    const slots: InventorySlot[] = (slotRes.data ?? []).map((s) => ({
      id: s.id,
      kind: s.kind as InventorySlot["kind"],
      noticeId: s.notice_id,
      startsAt: opt(s.starts_at),
      endsAt: opt(s.ends_at),
    }));

    // Anonymous viewer — the board is cached public (no per-viewer targeting). If
    // audience/region targeting is wired to real auth, this must become per-segment
    // caching + the route Cache-Control private (review M-3).
    const board = selectBoard(notices, slots, now, {});
    if (!board.featured && board.editorial.length === 0 && board.sponsored.length === 0) {
      return fallback();
    }
    return board;
  } catch {
    return fallback();
  }
}

/** Cached homepage board (anonymous viewer). 60s TTL + `notices-board` tag. */
export const getBoard = unstable_cache(fetchBoard, ["notices-board"], {
  revalidate: 60,
  tags: ["notices-board"],
});
