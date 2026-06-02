// =====================================================================
// NoticeCTA — the ONLY anchor in a card (spec §16). Stretched-link pattern:
// one real <a>/<Link> whose ::after covers the whole card, so the entire
// card is clickable WITHOUT nesting a second anchor (no hydration error).
// Internal hrefs use next/link; external/mailto use a plain <a>.
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
  const isExternal = /^(https?:|mailto:|tel:)/.test(href);

  return isExternal ? (
    <a
      href={href}
      aria-label={ariaLabel ?? label}
      className={className}
      style={style}
      {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {inner}
    </a>
  ) : (
    <Link href={href} aria-label={ariaLabel ?? label} className={className} style={style}>
      {inner}
    </Link>
  );
}
