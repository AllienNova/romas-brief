/**
 * ROMAS Wire Icon System (SHIP-21b)
 *
 * Inline SVG icons — no external package dependency.
 * All icons: viewBox="0 0 24 24", stroke="currentColor", fill="none",
 * strokeWidth={2}, strokeLinecap="round", strokeLinejoin="round".
 * Default size 20px. Pass className to tint via CSS classes.
 *
 * Usage:
 *   <HeadphonesIcon size={16} aria-hidden="true" />
 *   <HeadphonesIcon title="Audio available" />
 */

export interface IconProps {
  size?: number;
  className?: string;
  /** When provided, renders a <title> for accessibility (removes aria-hidden). */
  title?: string;
}

function base(
  size: number,
  className: string | undefined,
  title: string | undefined,
  children: React.ReactNode,
) {
  const decorative = !title;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={decorative ? "true" : undefined}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

// ── Audio / Media ─────────────────────────────────────────────────────────────

export function HeadphonesIcon({ size = 20, className, title }: IconProps) {
  return base(size, className, title, (
    <>
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </>
  ));
}

export function MicrophoneIcon({ size = 20, className, title }: IconProps) {
  return base(size, className, title, (
    <>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </>
  ));
}

export function MusicNoteIcon({ size = 20, className, title }: IconProps) {
  return base(size, className, title, (
    <>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </>
  ));
}

export function RssIcon({ size = 20, className, title }: IconProps) {
  return base(size, className, title, (
    <>
      <path d="M4 11a9 9 0 0 1 9 9" />
      <path d="M4 4a16 16 0 0 1 16 16" />
      <circle cx="5" cy="19" r="1" fill="currentColor" stroke="none" />
    </>
  ));
}

export function CloudIcon({ size = 20, className, title }: IconProps) {
  return base(size, className, title, (
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z" />
  ));
}

export function LinkIcon({ size = 20, className, title }: IconProps) {
  return base(size, className, title, (
    <>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </>
  ));
}

// ── Category icons ────────────────────────────────────────────────────────────

/** AI & Machine Learning */
export function AiIcon({ size = 20, className, title }: IconProps) {
  return base(size, className, title, (
    <>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <circle cx="9" cy="10" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r="1.5" fill="currentColor" stroke="none" />
      <path d="M9 13.5c.83.5 1.67.75 3 .75s2.17-.25 3-.75" />
    </>
  ));
}

/** Clinical RT — cross / medical caduceus simplified */
export function ClinicalRtIcon({ size = 20, className, title }: IconProps) {
  return base(size, className, title, (
    <>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      <circle cx="12" cy="12" r="3" />
    </>
  ));
}

/** Medical Physics — atom */
export function PhysicsIcon({ size = 20, className, title }: IconProps) {
  return base(size, className, title, (
    <>
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </>
  ));
}

/** Regulatory — columns / institution */
export function RegulatoryIcon({ size = 20, className, title }: IconProps) {
  return base(size, className, title, (
    <>
      <path d="M3 22V8l9-6 9 6v14" />
      <rect x="7" y="12" width="3" height="10" />
      <rect x="14" y="12" width="3" height="10" />
      <path d="M3 22h18" />
    </>
  ));
}

/** Guidelines — clipboard / checklist */
export function GuidelinesIcon({ size = 20, className, title }: IconProps) {
  return base(size, className, title, (
    <>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 14l2 2 4-4" />
      <line x1="9" y1="9" x2="15" y2="9" />
    </>
  ));
}

/** Reimbursement — currency / coin */
export function ReimbursementIcon({ size = 20, className, title }: IconProps) {
  return base(size, className, title, (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M14.5 8a3 3 0 0 0-5 2c0 3 5 2 5 5a3 3 0 0 1-5 2" />
      <line x1="12" y1="6" x2="12" y2="8" />
      <line x1="12" y1="17" x2="12" y2="19" />
    </>
  ));
}

/** Vendor News — building / office */
export function VendorIcon({ size = 20, className, title }: IconProps) {
  return base(size, className, title, (
    <>
      <path d="M3 21V9l9-7 9 7v12" />
      <path d="M9 21V15h6v6" />
      <rect x="11" y="9" width="2" height="4" />
      <rect x="7" y="9" width="2" height="4" />
      <rect x="15" y="9" width="2" height="4" />
    </>
  ));
}

/** Conferences — microphone on stage / podium */
export function ConferencesIcon({ size = 20, className, title }: IconProps) {
  return base(size, className, title, (
    <>
      <path d="M12 2a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <path d="M8 22h8" />
    </>
  ));
}

/** Operations — gear */
export function OperationsIcon({ size = 20, className, title }: IconProps) {
  return base(size, className, title, (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>
  ));
}

/** Generic fallback — tag */
export function CategoryFallbackIcon({ size = 20, className, title }: IconProps) {
  return base(size, className, title, (
    <>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth={2.5} />
    </>
  ));
}

// ── Content type icons ────────────────────────────────────────────────────────

/** News Brief — newspaper / document */
export function NewsBriefIcon({ size = 20, className, title }: IconProps) {
  return base(size, className, title, (
    <>
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z" />
      <line x1="9" y1="9" x2="15" y2="9" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="11" y2="17" />
    </>
  ));
}

/** Paper Critique — microscope / beaker simplified */
export function PaperCritiqueIcon({ size = 20, className, title }: IconProps) {
  return base(size, className, title, (
    <>
      <path d="M2 21 12.5 4l3 7-9 10z" />
      <path d="M22 21H2" />
      <path d="M16 7l2-4" />
      <path d="M16 7c1.5 2 2.5 4 2 7" />
    </>
  ));
}

/** Practice Delta — lightning bolt */
export function PracticeDeltaIcon({ size = 20, className, title }: IconProps) {
  return base(size, className, title, (
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
  ));
}

/** Long Take — open book */
export function LongTakeIcon({ size = 20, className, title }: IconProps) {
  return base(size, className, title, (
    <>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </>
  ));
}

/** Primer — graduation cap */
export function PrimerIcon({ size = 20, className, title }: IconProps) {
  return base(size, className, title, (
    <>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </>
  ));
}

/** Long Take / Note */
export function NoteIcon({ size = 20, className, title }: IconProps) {
  return base(size, className, title, (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </>
  ));
}

// ── Audience icons ────────────────────────────────────────────────────────────

/** Physician / Radiation Oncologist — stethoscope */
export function PhysicianIcon({ size = 20, className, title }: IconProps) {
  return base(size, className, title, (
    <>
      <path d="M4 4h4a2 2 0 0 1 2 2v6a4 4 0 0 0 8 0V6" />
      <circle cx="18" cy="6" r="2" />
      <path d="M6 4v4" />
    </>
  ));
}

/** Physicist — atom (same as physics category) */
export { PhysicsIcon as PhysicistIcon };

/** Dosimetrist — ruler / measuring tool */
export function DosimetristIcon({ size = 20, className, title }: IconProps) {
  return base(size, className, title, (
    <>
      <path d="M2 4l20 0" />
      <path d="M2 20l20 0" />
      <path d="M5 4v3" />
      <path d="M9 4v6" />
      <path d="M13 4v3" />
      <path d="M17 4v6" />
      <path d="M21 4v3" />
      <rect x="2" y="7" width="20" height="10" rx="1" />
    </>
  ));
}

/** Therapist / Hospital — cross in circle */
export function TherapistIcon({ size = 20, className, title }: IconProps) {
  return base(size, className, title, (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M9 12h6" />
      <path d="M12 9v6" />
      <path d="M8 4V2M16 4V2" />
    </>
  ));
}

/** Resident / Fellow — graduation cap (same as primer) */
export { PrimerIcon as ResidentIcon };

/** Administrator — bar chart */
export function AdministratorIcon({ size = 20, className, title }: IconProps) {
  return base(size, className, title, (
    <>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </>
  ));
}

// ── Region icon ───────────────────────────────────────────────────────────────

/** Globe — used for all regions */
export function GlobeIcon({ size = 20, className, title }: IconProps) {
  return base(size, className, title, (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </>
  ));
}

// ── Reactions ─────────────────────────────────────────────────────────────────

export function ThumbsUpIcon({ size = 20, className, title }: IconProps) {
  return base(size, className, title, (
    <>
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </>
  ));
}

export function ThumbsDownIcon({ size = 20, className, title }: IconProps) {
  return base(size, className, title, (
    <>
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
      <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
    </>
  ));
}

// ── Decorative marks ──────────────────────────────────────────────────────────

/**
 * StarMark — small 4-point asterisk / sparkle, replacing the diamond star character.
 * Purely decorative — always aria-hidden.
 */
export function StarMark({ size = 12, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M6 0 L6.8 5.2 L12 6 L6.8 6.8 L6 12 L5.2 6.8 L0 6 L5.2 5.2 Z" />
    </svg>
  );
}

/** BoltMark — tiny decorative bolt, replacing the lightning bolt character in Practice Delta label */
export function BoltMark({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

/** ClockMark — tiny clock for time-to-read indicators */
export function ClockMark({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

/** InfoMark — replaces the info glyph in DismissibleStrip */
export function InfoMark({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth={2.5} />
    </svg>
  );
}

// ── Mapping helpers ───────────────────────────────────────────────────────────

/**
 * Category slug → icon component. Returns a rendered element at the given size.
 */
export function CategoryIcon({
  slug,
  size = 20,
  className,
}: {
  slug: string;
  size?: number;
  className?: string;
}) {
  const props: IconProps = { size, className };
  switch (slug) {
    case "ai":
    case "ai-ml":
      return <AiIcon {...props} />;
    case "clinical-rt":
      return <ClinicalRtIcon {...props} />;
    case "physics":
      return <PhysicsIcon {...props} />;
    case "regulatory":
      return <RegulatoryIcon {...props} />;
    case "guidelines":
      return <GuidelinesIcon {...props} />;
    case "reimbursement":
      return <ReimbursementIcon {...props} />;
    case "vendor":
      return <VendorIcon {...props} />;
    case "conferences":
      return <ConferencesIcon {...props} />;
    case "operations":
      return <OperationsIcon {...props} />;
    default:
      return <CategoryFallbackIcon {...props} />;
  }
}

/**
 * Content type key → icon component.
 */
export function ContentTypeIcon({
  type,
  size = 20,
  className,
}: {
  type: string;
  size?: number;
  className?: string;
}) {
  const props: IconProps = { size, className };
  switch (type) {
    case "news_brief":
      return <NewsBriefIcon {...props} />;
    case "paper_critique":
      return <PaperCritiqueIcon {...props} />;
    case "practice_delta":
      return <PracticeDeltaIcon {...props} />;
    case "fda_brief":
      return <RegulatoryIcon {...props} />;
    case "reimbursement_explainer":
      return <ReimbursementIcon {...props} />;
    case "vendor_intel":
      return <VendorIcon {...props} />;
    case "long_take":
      return <LongTakeIcon {...props} />;
    case "primer":
      return <PrimerIcon {...props} />;
    case "conference_brief":
      return <ConferencesIcon {...props} />;
    default:
      return <CategoryFallbackIcon {...props} />;
  }
}

/**
 * Audience slug → icon component.
 */
export function AudienceIcon({
  slug,
  size = 20,
  className,
}: {
  slug: string;
  size?: number;
  className?: string;
}) {
  const props: IconProps = { size, className };
  switch (slug) {
    case "physicians":
      return <PhysicianIcon {...props} />;
    case "physicists":
      return <PhysicsIcon {...props} />;
    case "dosimetrists":
      return <DosimetristIcon {...props} />;
    case "therapists":
      return <TherapistIcon {...props} />;
    case "residents":
      return <PrimerIcon {...props} />;
    case "administrators":
      return <AdministratorIcon {...props} />;
    default:
      return <CategoryFallbackIcon {...props} />;
  }
}
