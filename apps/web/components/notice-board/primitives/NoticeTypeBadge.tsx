// =====================================================================
// NoticeTypeBadge — type label + small inline-SVG glyph (no emoji, §15).
// Color logic per spec §15. Sponsored uses a muted neutral (quarantine).
// =====================================================================
import type { NoticeType } from "@/lib/notice-board/types";

export const TYPE_META: Record<NoticeType, { label: string; color: string }> = {
  announcement: { label: "Announcement", color: "var(--rb-accent)" },
  news: { label: "News", color: "#0066CC" },
  event: { label: "Event", color: "#9333EA" },
  conference: { label: "Conference", color: "#9333EA" },
  trial: { label: "Trial", color: "#0F766E" },
  system: { label: "Notice", color: "#B45309" },
  advertise: { label: "Advertise", color: "var(--rb-text-tertiary)" },
  partner: { label: "Partner message", color: "var(--rb-text-tertiary)" },
};

function Glyph({ type, color }: { type: NoticeType; color: string }) {
  const c = { width: 13, height: 13, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (type) {
    case "announcement":
      return <svg {...c}><path d="M3 11l18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></svg>;
    case "event":
    case "conference":
      return <svg {...c}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
    case "trial":
      return <svg {...c}><path d="M9 2h6M10 2v6l-4 9a2 2 0 0 0 1.8 3h8.4a2 2 0 0 0 1.8-3l-4-9V2" /></svg>;
    case "partner":
    case "advertise":
      return <svg {...c}><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 3 12V5a2 2 0 0 1 2-2h7a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.6z" /><circle cx="7.5" cy="7.5" r="1" fill={color} /></svg>;
    case "system":
      return <svg {...c}><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>;
    case "news":
    default:
      return <svg {...c}><path d="M4 4h16v16H4z" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>;
  }
}

export function NoticeTypeBadge({ type, sponsorName }: { type: NoticeType; sponsorName?: string }) {
  const meta = TYPE_META[type];
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: meta.color, letterSpacing: "0.08em" }}>
      <Glyph type={type} color={meta.color} />
      {sponsorName ? `${meta.label} · ${sponsorName}` : meta.label}
    </span>
  );
}
