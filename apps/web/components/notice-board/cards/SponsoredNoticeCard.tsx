// =====================================================================
// SponsoredNoticeCard — paid partner inventory. Accepts ONLY SponsoredNotice
// (compile error otherwise — the frontend firewall). QUARANTINE styling,
// inline + self-contained: muted background, dashed border, NO accent rail,
// NO hover-lift (no .notice-card--editorial), NO NEW pulse. A developer
// cannot give this editorial styling — it imports none (spec §4 hard rule).
// =====================================================================
import type { SponsoredNotice } from "@/lib/notice-board/types";
import { NoticeTypeBadge } from "../primitives/NoticeTypeBadge";
import { NoticeCTA } from "../primitives/NoticeCTA";

export function SponsoredNoticeCard({ notice }: { notice: SponsoredNotice }) {
  const clickable = Boolean(notice.ctaUrl && notice.ctaLabel);

  return (
    <article
      className="notice-card h-full overflow-hidden rounded-xl p-5"
      style={{
        background: "var(--rb-sponsor-bg, var(--rb-bg-raised))",
        border: "1px dashed var(--rb-border-default)",
      }}
      data-sponsored="true"
    >
      <NoticeTypeBadge type="partner" sponsorName={notice.sponsorName} />
      <h3 className="mt-2.5 text-[15px] font-bold leading-snug" style={{ color: "var(--rb-text-primary)", letterSpacing: "-0.015em" }}>
        {notice.title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed line-clamp-3" style={{ color: "var(--rb-text-secondary)" }}>
        {notice.summary}
      </p>
      <p className="mt-2 text-[11px]" style={{ color: "var(--rb-text-tertiary)" }}>
        {notice.sponsorDisclosure}
      </p>
      {clickable && (
        <div className="mt-3">
          <NoticeCTA href={notice.ctaUrl!} label={notice.ctaLabel!} ariaLabel={`${notice.ctaLabel}: ${notice.title}`} muted />
        </div>
      )}
    </article>
  );
}
