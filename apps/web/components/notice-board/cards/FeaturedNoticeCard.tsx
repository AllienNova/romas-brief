// =====================================================================
// FeaturedNoticeCard — the lead. Exactly one per board. EditorialNotice
// only. Stronger hierarchy (larger title, taller, Featured micro-label,
// stronger rail) — premium, not noisy (§15). Single anchor (stretched).
// =====================================================================
import type { EditorialNotice } from "@/lib/notice-board/types";
import { NoticeTypeBadge, TYPE_META } from "../primitives/NoticeTypeBadge";
import { NewIndicator } from "../primitives/NewIndicator";
import { NoticeCTA } from "../primitives/NoticeCTA";

export function FeaturedNoticeCard({ notice }: { notice: EditorialNotice }) {
  const meta = TYPE_META[notice.type];
  const clickable = Boolean(notice.ctaUrl && notice.ctaLabel);

  return (
    <article
      className="notice-card notice-card--editorial h-full overflow-hidden rounded-2xl p-7"
      style={{ background: "var(--rb-bg-surface)", border: "1px solid var(--rb-border-default)" }}
    >
      <span className="absolute inset-y-0 left-0 w-1" style={{ background: meta.color }} aria-hidden />
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--rb-text-tertiary)" }}>
          Featured
        </span>
        <NoticeTypeBadge type={notice.type} />
        {notice.isNew && <NewIndicator />}
        {notice.dateLabel && (
          <span className="ml-auto text-xs font-medium tabular-nums" style={{ color: "var(--rb-text-tertiary)" }}>
            {notice.dateLabel}
          </span>
        )}
      </div>
      <h2 className="mt-3 text-xl font-black leading-tight sm:text-2xl" style={{ color: "var(--rb-text-primary)", letterSpacing: "-0.025em" }}>
        {notice.title}
      </h2>
      <p className="mt-2.5 max-w-2xl text-[15px] leading-relaxed" style={{ color: "var(--rb-text-secondary)" }}>
        {notice.summary}
      </p>
      {clickable && (
        <div className="mt-4">
          <NoticeCTA href={notice.ctaUrl!} label={notice.ctaLabel!} ariaLabel={`${notice.ctaLabel}: ${notice.title}`} />
        </div>
      )}
    </article>
  );
}
