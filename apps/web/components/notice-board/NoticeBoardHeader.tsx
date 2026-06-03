// =====================================================================
// NoticeBoardHeader — section label + live dot + taxonomy + Advertise link.
// =====================================================================
import { LiveDot } from "./primitives/LiveDot";
import { ADVERTISE_HREF } from "@/lib/notice-board/types";

export function NoticeBoardHeader() {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rb-text-primary)", letterSpacing: "0.14em" }}>
        <LiveDot />
        Notice Board
      </span>
      <span className="text-xs" style={{ color: "var(--rb-text-tertiary)" }}>
        Announcements · Trials · Events · Partner messages
      </span>
      <a
        href={ADVERTISE_HREF}
        className="ml-auto text-xs font-semibold transition-opacity hover:opacity-80"
        style={{ color: "var(--rb-accent)" }}
      >
        Advertise →
      </a>
    </div>
  );
}
