// =====================================================================
// NoticeCTA — the ONLY anchor in a card (spec §16). Stretched-link pattern:
// one real <a>/<Link> whose ::after covers the whole card, so the entire
// card is clickable WITHOUT nesting a second anchor (no hydration error).
//
// URL safety (review H-01): only https (external, case-insensitive), the
// trusted mailto:/tel: schemes (used by the internal Advertise CTA), or an
// absolute-path internal link render. Anything else (javascript:, data:, …)
// renders NOTHING — defense-in-depth behind the DB cta_url CHECK + safeCta().
// =====================================================================
import Link from "next/link";

export interface NoticeCTAProps {
  href: string;
  label: string;
  ariaLabel?: string;
  /** When true, the link's ::after covers the parent .notice-card. */
  stretch?: boolean;
  /** Quieter styling for sponsored/inventory (no accent color). */
  muted?: boolean;
}

export function NoticeCTA({ href, label, ariaLabel, stretch = true, muted = false }: NoticeCTAProps) {
  const isHttps = /^https:\/\//i.test(href);
  const isMailOrTel = /^(mailto:|tel:)/i.test(href);
  const isInternal = href.startsWith("/");
  // Reject javascript:, data:, http:, protocol-relative, etc.
  if (!isHttps && !isMailOrTel && !isInternal) return null;

  const className = [
    "notice-cta",
    stretch ? "notice-cta--stretched" : "",
    "inline-flex items-center gap-1 text-xs font-semibold transition-all",
  ].join(" ");
  const style = { color: muted ? "var(--rb-text-secondary)" : "var(--rb-accent)" };
  const inner = (
    <>
      {label} <span aria-hidden>→</span>
    </>
  );

  // https/mailto/tel → plain <a> (https opens in a new tab); internal → next/link.
  return isHttps || isMailOrTel ? (
    <a
      href={href}
      aria-label={ariaLabel ?? label}
      className={className}
      style={style}
      {...(isHttps ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {inner}
    </a>
  ) : (
    <Link href={href} aria-label={ariaLabel ?? label} className={className} style={style}>
      {inner}
    </Link>
  );
}
