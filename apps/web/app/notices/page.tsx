/**
 * ROMAS Wire — Notice Archive (/notices · NB-8 / spec §17)
 * Server component. Filter tabs + GET search + cursor pagination over published
 * notices. Reuses the board card components; sponsor quarantine preserved via
 * the discriminated-union dispatch (SponsoredNotice → SponsoredNoticeCard).
 * h1 + form paint immediately (LCP); only the results grid scroll-staggers.
 */
import Link from "next/link";
import type { Metadata } from "next";
import { getArchive } from "@/lib/notice-board/get-archive";
import { ARCHIVE_FILTERS, parseFilter, parseCursor } from "@/lib/notice-board/archive";
import { Stagger, StaggerItem } from "@/components/motion/primitives";
import { EditorialNoticeCard } from "@/components/notice-board/cards/EditorialNoticeCard";
import { SponsoredNoticeCard } from "@/components/notice-board/cards/SponsoredNoticeCard";

export const metadata: Metadata = {
  title: "Notice Archive — ROMAS Wire",
  description:
    "Browse the ROMAS Wire notice board — announcements, news, events, trials, and partner messages.",
};
export const dynamic = "force-dynamic";

function qs(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "" && v !== 0) sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export default async function NoticesArchivePage(props: {
  searchParams: Promise<{ filter?: string; q?: string; cursor?: string }>;
}) {
  const sp = await props.searchParams;
  const filter = parseFilter(sp.filter);
  const query = (sp.q ?? "").trim();
  const cursor = parseCursor(sp.cursor);
  const { notices, nextCursor } = await getArchive({ filter, query, cursor });
  const filterParam = filter === "all" ? undefined : filter;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <nav className="mb-8 flex items-center gap-2 text-xs" style={{ color: "var(--rb-text-tertiary)" }}>
        <Link href="/" className="transition-colors hover:text-[var(--rb-text-secondary)]">Home</Link>
        <span>/</span>
        <span style={{ color: "var(--rb-text-secondary)" }}>Notices</span>
      </nav>

      <h1 className="mb-2 text-3xl font-black tracking-tight" style={{ color: "var(--rb-text-primary)" }}>
        Notice Archive
      </h1>
      <p className="mb-8 text-sm" style={{ color: "var(--rb-text-secondary)" }}>
        Announcements, news, events, trials, and partner messages — the board history.
      </p>

      <form action="/notices" method="get" role="search" className="mb-6 flex gap-2">
        {filterParam && <input type="hidden" name="filter" value={filterParam} />}
        <label htmlFor="q" className="sr-only">Search notices</label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Search notices — e.g. ASTRO, FLASH, trial"
          autoComplete="off"
          className="flex-1 rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          style={{
            background: "var(--rb-bg-surface)",
            borderColor: "var(--rb-border-subtle)",
            color: "var(--rb-text-primary)",
          }}
        />
        <button
          type="submit"
          className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
        >
          Search
        </button>
      </form>

      <div className="mb-8 flex flex-wrap gap-2">
        {ARCHIVE_FILTERS.map(({ key, label }) => {
          const active = key === filter;
          return (
            <Link
              key={key}
              href={`/notices${qs({ filter: key === "all" ? undefined : key, q: query })}`}
              className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
              style={
                active
                  ? { background: "var(--rb-accent)", color: "white", borderColor: "var(--rb-accent)" }
                  : { color: "var(--rb-text-secondary)", borderColor: "var(--rb-border-subtle)" }
              }
              aria-current={active ? "page" : undefined}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {notices.length === 0 ? (
        <p className="py-16 text-center text-sm" style={{ color: "var(--rb-text-tertiary)" }}>
          No notices{query ? ` for “${query}”` : ""} in this category.
        </p>
      ) : (
        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notices.map((n) => (
            <StaggerItem key={n.id} className="h-full">
              {n.isSponsored ? (
                <SponsoredNoticeCard notice={n} />
              ) : (
                <EditorialNoticeCard notice={n} />
              )}
            </StaggerItem>
          ))}
        </Stagger>
      )}

      {nextCursor !== null && (
        <div className="mt-10 flex justify-center">
          <Link
            href={`/notices${qs({ filter: filterParam, q: query, cursor: nextCursor })}`}
            className="rounded-full border px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--rb-bg-raised)]"
            style={{ color: "var(--rb-text-primary)", borderColor: "var(--rb-border-default)" }}
          >
            Next page →
          </Link>
        </div>
      )}
    </div>
  );
}
