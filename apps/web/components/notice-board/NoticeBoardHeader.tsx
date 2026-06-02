// =====================================================================
// NoticeBoardHeader — section label + live dot + taxonomy + Advertise link.
// =====================================================================
import Link from "next/link";
import { LiveDot } from "./primitives/LiveDot";

const ADVERTISE_HREF =
  "mailto:president@aliennova.com?subject=Advertise%20on%20the%20ROMAS%20Wire%20Notice%20Board";

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
      <Link
        href={ADVERTISE_HREF}
        className="ml-auto text-xs font-semibold transition-opacity hover:opacity-80"
        style={{ color: "var(--rb-accent)" }}
      >
        Advertise →
      </Link>
    </div>
  );
}
