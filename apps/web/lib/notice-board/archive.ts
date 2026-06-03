// =====================================================================
// archive.ts — pure, testable helpers for the /notices archive (§17).
// Filter taxonomy → NoticeType[], case-insensitive title/summary search,
// newest-first sort, and offset-cursor pagination. No I/O — get-archive.ts
// supplies the rows (mock or DB) and runs these.
// =====================================================================
import type { Notice, NoticeType } from "./types.ts";

export const ARCHIVE_PAGE_SIZE = 12;

export type ArchiveFilter = "all" | "announcements" | "news" | "events" | "trials" | "partner";

/** Public filter → the NoticeTypes it includes. `null` = no type restriction. */
const FILTER_TYPES: Record<ArchiveFilter, readonly NoticeType[] | null> = {
  all: null,
  announcements: ["announcement", "system"],
  news: ["news"],
  events: ["event", "conference"],
  trials: ["trial"],
  partner: ["partner", "advertise"],
};

export const ARCHIVE_FILTERS: { key: ArchiveFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "announcements", label: "Announcements" },
  { key: "news", label: "News" },
  { key: "events", label: "Events" },
  { key: "trials", label: "Trials" },
  { key: "partner", label: "Partner Messages" },
];

/** Coerce an untrusted query-string filter to a valid one (defaults to "all"). */
export function parseFilter(raw: string | undefined | null): ArchiveFilter {
  return raw && raw in FILTER_TYPES ? (raw as ArchiveFilter) : "all";
}

/** Coerce an untrusted cursor to a non-negative integer offset (defaults to 0). */
export function parseCursor(raw: string | undefined | null): number {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : 0;
}

/** Filter by taxonomy + search query, then sort newest-first by publishAt. */
export function filterNotices(notices: Notice[], filter: ArchiveFilter, query: string): Notice[] {
  const types = FILTER_TYPES[filter];
  const q = query.trim().toLowerCase();
  return notices
    .filter((n) => (types ? types.includes(n.type) : true))
    .filter((n) =>
      q ? n.title.toLowerCase().includes(q) || n.summary.toLowerCase().includes(q) : true,
    )
    .slice()
    .sort((a, b) => b.publishAt.localeCompare(a.publishAt));
}

export interface ArchivePage {
  notices: Notice[];
  nextCursor: number | null;
  total: number;
}

/** Offset-cursor pagination over an already-filtered list. */
export function paginate(list: Notice[], cursor: number, size = ARCHIVE_PAGE_SIZE): ArchivePage {
  const start = Math.max(0, cursor);
  const notices = list.slice(start, start + size);
  const nextCursor = start + size < list.length ? start + size : null;
  return { notices, nextCursor, total: list.length };
}

/** The NoticeTypes a filter maps to (or null for "all") — for the DB query. */
export function filterTypes(filter: ArchiveFilter): readonly NoticeType[] | null {
  return FILTER_TYPES[filter];
}
