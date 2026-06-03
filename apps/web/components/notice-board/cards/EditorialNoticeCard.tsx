// =====================================================================
// EditorialNoticeCard — announcement / news / trial / system / event /
// conference. Accepts ONLY EditorialNotice (compile-enforced firewall).
// Editorial styling: accent rail + hover lift + NEW pulse. Single anchor
// (stretched NoticeCTA) → whole card clickable, no nested <a>.
// Event/conference dates render in the notice's own timezone (§2).
// =====================================================================
import type { EditorialNotice } from "@/lib/notice-board/types";
import { NoticeTypeBadge, TYPE_META } from "../primitives/NoticeTypeBadge";
import { NewIndicator } from "../primitives/NewIndicator";
import { NoticeCTA } from "../primitives/NoticeCTA";

function displayDate(n: EditorialNotice): string | null {
  if (n.dateLabel) return n.dateLabel;
  const isEvent = n.type === "event" || n.type === "conference";
  // Non-events always show publishAt (review M-5 — a stray startsAt must not override).
  const src = isEvent ? n.startsAt : n.publishAt;
  if (!src) return null;
  const d = new Date(src);
  if (Number.isNaN(d.getTime())) return null;
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    ...(isEvent && n.timezone ? { timeZone: n.timezone, timeZoneName: "short" } : {}),
  };
  return new Intl.DateTimeFormat("en-US", opts).format(d);
}

export function EditorialNoticeCard({ notice }: { notice: EditorialNotice }) {
  const meta = TYPE_META[notice.type];
  const date = displayDate(notice);
  const clickable = Boolean(notice.ctaUrl && notice.ctaLabel);

  return (
    <article
      className="notice-card notice-card--editorial h-full overflow-hidden rounded-xl p-5"
      style={{ background: "var(--rb-bg-surface)", border: "1px solid var(--rb-border-subtle)" }}
      data-notice-id={notice.id}
    >
      <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: meta.color }} aria-hidden />
      <div className="flex items-center gap-2">
        <NoticeTypeBadge type={notice.type} />
        {notice.isNew && <NewIndicator />}
        {date && (
          <span className="ml-auto text-[11px] font-medium tabular-nums" style={{ color: "var(--rb-text-tertiary)" }}>
            {date}
          </span>
        )}
      </div>
      <h3 className="mt-2.5 text-[15px] font-bold leading-snug" style={{ color: "var(--rb-text-primary)", letterSpacing: "-0.015em" }}>
        {notice.title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed line-clamp-3" style={{ color: "var(--rb-text-secondary)" }}>
        {notice.summary}
      </p>
      {clickable && (
        <div className="mt-3">
          <NoticeCTA href={notice.ctaUrl!} label={notice.ctaLabel!} ariaLabel={`${notice.ctaLabel}: ${notice.title}`} />
        </div>
      )}
    </article>
  );
}
