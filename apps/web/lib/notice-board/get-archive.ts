// =====================================================================
// get-archive.ts — data layer for the /notices archive (§17). Mirrors
// get-board's resilience: bundled MOCK_NOTICES when no DB env, else queries
// published notices (RLS-scoped) with taxonomy + ILIKE search + offset
// pagination. Reuses get-board's rowToNotice so the sponsor firewall mapping
// is single-sourced. Any DB failure falls back to the mock path.
// =====================================================================
import type { SupabaseClient } from "@supabase/supabase-js";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { MOCK_NOTICES } from "./mock-notices.ts";
import {
  ARCHIVE_PAGE_SIZE,
  filterNotices,
  filterTypes,
  paginate,
  type ArchiveFilter,
  type ArchivePage,
} from "./archive.ts";
import {
  NOTICE_COLUMNS,
  hasDbEnv,
  rowToNotice,
  type NoticeRow,
  type SponsorRow,
} from "./get-board.ts";
import type { Notice } from "./types.ts";

interface ArchiveQuery {
  filter: ArchiveFilter;
  query: string;
  cursor: number;
}

export async function getArchive({ filter, query, cursor }: ArchiveQuery): Promise<ArchivePage> {
  const mock = (): ArchivePage => paginate(filterNotices(MOCK_NOTICES, filter, query), cursor);
  if (!hasDbEnv()) return mock();

  try {
    const sb = createPublicSupabaseClient() as unknown as SupabaseClient;
    const types = filterTypes(filter);
    const term = query.trim();
    const start = Math.max(0, cursor);

    // Build conditionally via const-chaining (no `let` reassignment → no builder type churn).
    const base = sb.from("notices").select(NOTICE_COLUMNS).eq("status", "published");
    const withType = types ? base.in("type", types as string[]) : base;
    // Escape PostgREST or()-delimiter (,) and ILIKE wildcard (%) from user input.
    const esc = term.replace(/[%,]/g, " ");
    const withSearch = term ? withType.or(`title.ilike.%${esc}%,summary.ilike.%${esc}%`) : withType;

    // Fetch PAGE_SIZE+1 to detect a next page without a separate count query.
    const { data, error } = await withSearch
      .order("publish_at", { ascending: false })
      .range(start, start + ARCHIVE_PAGE_SIZE)
      .returns<NoticeRow[]>();
    if (error || !data) return mock();

    const sponsorIds = [...new Set(data.filter((r) => r.sponsor_id).map((r) => r.sponsor_id as string))];
    let sponsorMap = new Map<string, string>();
    if (sponsorIds.length) {
      const { data: sp } = await sb
        .from("sponsor_public")
        .select("id,name")
        .in("id", sponsorIds)
        .returns<SponsorRow[]>();
      sponsorMap = new Map((sp ?? []).map((s) => [s.id, s.name]));
    }

    const mapped = data
      .map((r) => rowToNotice(r, r.sponsor_id ? sponsorMap.get(r.sponsor_id) : undefined))
      .filter((n): n is Notice => n !== null);
    const hasMore = mapped.length > ARCHIVE_PAGE_SIZE;
    return {
      notices: hasMore ? mapped.slice(0, ARCHIVE_PAGE_SIZE) : mapped,
      nextCursor: hasMore ? start + ARCHIVE_PAGE_SIZE : null,
      total: -1, // unknown without a count query; the page paginates via nextCursor
    };
  } catch {
    return mock();
  }
}
