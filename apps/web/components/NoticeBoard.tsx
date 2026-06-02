"use client";
// =====================================================================
// NoticeBoard — the ROMAS Wire "billboard": a modern, tech-savvy board for
// announcements, news, events, and PAID partner placements. Replaces the
// old FromTheEditor card below the hero grid. WEB-NB.
//
// Monetization-ready: `sponsored` notices + a live "Advertise on the Board"
// open slot. Sponsored items honor the sponsor firewall (CLAUDE.md §3) —
// labeled "Partner message", visually quarantined (tinted bg, dashed border,
// no editorial accent rail, no motion emphasis), never look like editorial.
//
// Motion via the WEB-0 primitives (reduced-motion + CLS safe). Notices are a
// typed mock today; a `notices` DB table is the eventual source (FR-future).
// =====================================================================
import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";

type NoticeType = "announcement" | "news" | "event" | "sponsored";

interface Notice {
  id: string;
  type: NoticeType;
  title: string;
  body: string;
  href?: string;
  cta?: string;
  date?: string;
  isNew?: boolean;
  /** sponsored only — the paying partner. */
  sponsorName?: string;
  /** spans two columns on desktop. */
  featured?: boolean;
}

// Mock board content (DB-backed later). Sponsored item is illustrative.
const NOTICES: Notice[] = [
  {
    id: "cadence",
    type: "announcement",
    title: "ROMAS Wire is now twice weekly",
    body: "Tuesday operational brief + Friday's ROMAS Read. Same signal, sharper rhythm — built around how the clinic actually reads.",
    href: "/about/how-it-works",
    cta: "What changed",
    date: "Jun 2",
    isNew: true,
    featured: true,
  },
  {
    id: "astro",
    type: "event",
    title: "ASTRO 2026 — Conference Brief mode",
    body: "Daily embargo-aware briefs during the meeting. Sessions tracked in conference local time.",
    href: "/listen",
    cta: "Preview",
    date: "Sep 27–30",
  },
  {
    id: "estro",
    type: "event",
    title: "ESTRO 2026 · Vienna",
    body: "Live Conference Brief coverage. MR-Linac, FLASH, and adaptive RT tracks in focus.",
    date: "May 3–7",
  },
  {
    id: "trials",
    type: "news",
    title: "SABR-COMET-3 reaches Level I",
    body: "Oligometastatic liver SBRT now carries OS-benefit evidence — the most practice-changing SBRT result in three years.",
    href: "/article/sbrt-liver-metastases-phase-iii-results",
    cta: "Read the brief",
    date: "May 28",
    isNew: true,
  },
  {
    id: "sponsor",
    type: "sponsored",
    title: "Adaptive planning, 40% faster contouring",
    body: "A partner message on AI-assisted OAR delineation for head-and-neck. Independently labeled; not ROMAS editorial.",
    href: "#",
    cta: "Learn more",
    sponsorName: "Partner",
  },
  {
    id: "advertise",
    type: "sponsored",
    title: "Your message on the Board",
    body: "Reach radiation oncologists, physicists, dosimetrists, and oncology leaders. Sponsored placements are clearly labeled and firewalled from editorial.",
    href: "mailto:president@aliennova.com?subject=Advertise%20on%20the%20ROMAS%20Wire%20Notice%20Board",
    cta: "Advertise on the Board",
  },
];

const TYPE_META: Record<NoticeType, { label: string; color: string }> = {
  announcement: { label: "Announcement", color: "var(--rb-accent)" },
  news: { label: "News", color: "#0066CC" },
  event: { label: "Event", color: "#9333EA" },
  sponsored: { label: "Partner message", color: "var(--rb-text-tertiary)" },
};

function TypeGlyph({ type, color }: { type: NoticeType; color: string }) {
  const common = { width: 13, height: 13, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (type) {
    case "announcement":
      return <svg {...common}><path d="M3 11l18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></svg>;
    case "event":
      return <svg {...common}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
    case "sponsored":
      return <svg {...common}><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 3 12V5a2 2 0 0 1 2-2h7a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.6z" /><circle cx="7.5" cy="7.5" r="1" fill={color} /></svg>;
    case "news":
    default:
      return <svg {...common}><path d="M4 4h16v16H4z" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>;
  }
}

function NoticeCard({ n }: { n: Notice }) {
  const meta = TYPE_META[n.type];
  const sponsored = n.type === "sponsored";
  const inner = (
    <div
      className={`group relative h-full overflow-hidden rounded-xl p-5 transition-all duration-300 ${n.href ? "hover:-translate-y-1" : ""}`}
      style={{
        background: sponsored ? "var(--rb-sponsor-bg, var(--rb-bg-raised))" : "var(--rb-bg-surface)",
        border: sponsored ? "1px dashed var(--rb-border-default)" : "1px solid var(--rb-border-subtle)",
      }}
    >
      {/* editorial accent rail — NOT on sponsored (firewall: must not mimic editorial) */}
      {!sponsored && (
        <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: meta.color }} aria-hidden />
      )}
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider"
          style={{ color: meta.color, letterSpacing: "0.08em" }}
        >
          <TypeGlyph type={n.type} color={meta.color} />
          {sponsored && n.sponsorName ? `${meta.label} · ${n.sponsorName}` : meta.label}
        </span>
        {n.isNew && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--rb-accent)" }}>
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--rb-accent)", animation: "pulse-dot 2s ease-in-out infinite" }} aria-hidden />
            New
          </span>
        )}
        {n.date && (
          <span className="ml-auto text-[11px] font-medium tabular-nums" style={{ color: "var(--rb-text-tertiary)" }}>
            {n.date}
          </span>
        )}
      </div>
      <h3
        className={`mt-2.5 font-bold leading-snug ${n.featured ? "text-lg" : "text-[15px]"} ${n.href && !sponsored ? "group-hover:text-[var(--rb-accent)] transition-colors" : ""}`}
        style={{ color: "var(--rb-text-primary)", letterSpacing: "-0.015em" }}
      >
        {n.title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed line-clamp-3" style={{ color: "var(--rb-text-secondary)" }}>
        {n.body}
      </p>
      {n.cta && (
        <span
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold transition-all group-hover:gap-2"
          style={{ color: sponsored ? "var(--rb-text-secondary)" : "var(--rb-accent)" }}
        >
          {n.cta} <span aria-hidden>→</span>
        </span>
      )}
    </div>
  );

  return n.href ? (
    <Link href={n.href} className="block h-full" aria-label={`${meta.label}: ${n.title}`}>
      {inner}
    </Link>
  ) : (
    inner
  );
}

export default function NoticeBoard() {
  return (
    <section aria-label="Notice board" className="rounded-2xl border p-6 sm:p-7" style={{ background: "var(--rb-bg-page)", borderColor: "var(--rb-border-subtle)" }}>
      <Reveal>
        <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rb-text-primary)", letterSpacing: "0.14em" }}>
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: "var(--rb-accent)", animation: "pulse-dot 2s ease-in-out infinite" }} aria-hidden />
            Notice Board
          </span>
          <span className="text-xs" style={{ color: "var(--rb-text-tertiary)" }}>
            Announcements · Trials · Events · Partner messages
          </span>
          <Link href="mailto:president@aliennova.com?subject=Advertise%20on%20the%20ROMAS%20Wire%20Notice%20Board" className="ml-auto text-xs font-semibold transition-opacity hover:opacity-80" style={{ color: "var(--rb-accent)" }}>
            Advertise →
          </Link>
        </div>
      </Reveal>

      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {NOTICES.map((n) => (
          <StaggerItem key={n.id} className={n.featured ? "sm:col-span-2 lg:col-span-2" : ""}>
            <NoticeCard n={n} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
