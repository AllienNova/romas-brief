// =====================================================================
// ConferenceLeadCard — the featured slot during Conference Mode (§13). Replaces
// FeaturedNoticeCard when selectBoard() returns a conferenceMode context. Carries
// the conference identity (purple, §15), a live "Conference Brief" badge, and the
// session time rendered in the conference's local timezone with a tz label
// ("sessions tracked in conference local time"). EditorialNotice only — the lead
// is always first-party editorial, never sponsored. Single stretched anchor.
// =====================================================================
import type { ConferenceContext, EditorialNotice } from "@/lib/notice-board/types";
import { NewIndicator } from "../primitives/NewIndicator";
import { NoticeCTA } from "../primitives/NoticeCTA";

const CONF_ACCENT = "#7C3AED"; // event/conference purple (§15)

function sessionTime(notice: EditorialNotice, timezone: string): string | null {
  if (!notice.startsAt) return null;
  const d = new Date(notice.startsAt);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
    timeZoneName: "short",
  }).format(d);
}

export function ConferenceLeadCard({
  notice,
  conference,
}: {
  notice: EditorialNotice;
  conference: ConferenceContext;
}) {
  const clickable = Boolean(notice.ctaUrl && notice.ctaLabel);
  const session = sessionTime(notice, conference.timezone);

  return (
    <article
      className="notice-card h-full overflow-hidden rounded-2xl p-7"
      style={{
        background: `linear-gradient(135deg, color-mix(in srgb, ${CONF_ACCENT} 12%, var(--rb-bg-surface)) 0%, var(--rb-bg-surface) 60%)`,
        border: `1px solid color-mix(in srgb, ${CONF_ACCENT} 30%, var(--rb-border-default))`,
      }}
      data-notice-id={notice.id}
    >
      <span className="absolute inset-y-0 left-0 w-1" style={{ background: CONF_ACCENT }} aria-hidden />
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white"
          style={{ background: CONF_ACCENT }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
          Conference Brief
        </span>
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: CONF_ACCENT }}>
          {conference.label}
        </span>
        {notice.isNew && <NewIndicator />}
      </div>
      <h2
        className="mt-3 text-xl font-black leading-tight sm:text-2xl"
        style={{ color: "var(--rb-text-primary)", letterSpacing: "-0.025em" }}
      >
        {notice.title}
      </h2>
      <p className="mt-2.5 max-w-2xl text-[15px] leading-relaxed" style={{ color: "var(--rb-text-secondary)" }}>
        {notice.summary}
      </p>
      {session && (
        <p
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium tabular-nums"
          style={{ background: "var(--rb-bg-raised)", color: "var(--rb-text-secondary)" }}
        >
          {session}
          <span style={{ color: "var(--rb-text-tertiary)" }}>· conference local time</span>
        </p>
      )}
      {clickable && (
        <div className="mt-4">
          <NoticeCTA
            href={notice.ctaUrl!}
            label={notice.ctaLabel!}
            ariaLabel={`${notice.ctaLabel}: ${notice.title}`}
          />
        </div>
      )}
    </article>
  );
}
