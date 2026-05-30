// =====================================================================
// apps/cms/components/AudioStatusBadge.tsx · ROMAS Brief · SHIP-10
// Pill-shaped audio-status indicator. Color is NEVER the sole signal —
// every state ships a text label (Docs/design/components/AudioStatusBadge.md
// v1.2). Labels + AA-verified foreground hexes come straight from the
// component spec State matrix; the decorative dot uses bg-current so it
// tracks the label foreground. No emojis (brand rule, CLAUDE.md §8).
// =====================================================================

export type AudioStatus =
  | "queued"
  | "generating"
  | "in_review"
  | "published"
  | "skipped"
  | "revoked";

type BadgeStyle = {
  label: string;
  // Tailwind background utility (built-in palette) per the spec State matrix.
  bg: string;
  // Foreground hex (AA-verified on its background) as an arbitrary value so
  // we do not depend on design tokens that are not yet wired into Tailwind.
  fg: string;
};

// Source of truth: Docs/design/components/AudioStatusBadge.md §State matrix (v1.2).
const STYLES: Record<AudioStatus, BadgeStyle> = {
  queued: { label: "Audio queued", bg: "bg-amber-50", fg: "text-[#B45309]" },
  generating: { label: "Audio generating", bg: "bg-amber-50", fg: "text-[#B45309]" },
  in_review: { label: "Audio in review", bg: "bg-amber-50", fg: "text-[#B45309]" },
  published: { label: "Listen", bg: "bg-[#D5F2F5]", fg: "text-[#006B7A]" },
  skipped: { label: "No audio for this brief", bg: "bg-slate-100", fg: "text-[#475569]" },
  revoked: { label: "Audio withdrawn", bg: "bg-red-50", fg: "text-[#B91C1C]" },
};

// Fallback for any out-of-enum value arriving from the DB string column.
const UNKNOWN: BadgeStyle = {
  label: "Unknown status",
  bg: "bg-slate-100",
  fg: "text-[#475569]",
};

export function AudioStatusBadge({ status }: { status: string }) {
  const style = STYLES[status as AudioStatus] ?? UNKNOWN;

  return (
    <span
      role="status"
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${style.bg} ${style.fg}`}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {style.label}
    </span>
  );
}

export default AudioStatusBadge;
