/**
 * SponsorBlock — sponsored-content surface with the locked editorial firewall
 * (CLAUDE.md §3 row 3 + sponsor-firewall rule).
 *
 * Only two labels are permitted at launch: "Sponsored by [X]" and "Partner
 * message from [X]" — co-branded mastheads are killed for launch. The
 * 32px firewall (no sponsor logo within 32px of the ROMAS Wire wordmark) is
 * enforced via vertical clearance + a machine-checkable `data-firewall="32"`.
 */

/** Locked firewall distance from the ROMAS Wire wordmark, in px. */
export const SPONSOR_FIREWALL_PX = 32;

export type SponsorVariant = "sponsored_by" | "partner_message";

/** The only sponsor labels allowed at launch. */
export const SPONSOR_LABELS: Record<SponsorVariant, string> = {
  sponsored_by: "Sponsored by",
  partner_message: "Partner message from",
};

interface SponsorBlockProps {
  sponsorName: string;
  variant?: SponsorVariant;
  message?: string;
  href?: string;
  className?: string;
}

export function SponsorBlock({
  sponsorName,
  variant = "sponsored_by",
  message,
  href,
  className,
}: SponsorBlockProps) {
  const label = `${SPONSOR_LABELS[variant]} ${sponsorName}`;
  const body = (
    <aside
      data-firewall={SPONSOR_FIREWALL_PX}
      style={{ marginTop: SPONSOR_FIREWALL_PX, marginBottom: SPONSOR_FIREWALL_PX }}
      className={`rounded-[var(--rb-radius-lg)] border p-5 ${className ?? ""}`}
      // Border + raised surface keep commercial content visually separated
      // from editorial content (the firewall is visual as well as spatial).
    >
      <span
        className="kicker block mb-1"
        style={{ color: "var(--rb-text-tertiary)" }}
      >
        {label}
      </span>
      {message && (
        <p className="text-sm" style={{ color: "var(--rb-text-secondary)" }}>
          {message}
        </p>
      )}
    </aside>
  );

  if (!href) return body;
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer sponsored" : undefined}
      className="block no-underline"
    >
      {body}
    </a>
  );
}
