/**
 * Plausible analytics helper (cookieless, privacy-first — CLAUDE.md §7).
 * The script is loaded in app/layout.tsx; this is a typed, safe wrapper that
 * no-ops when the script hasn't loaded (SSR, ad-blockers, dev).
 */

type PlausibleProps = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: PlausibleProps }) => void;
  }
}

/** Fire a custom Plausible goal. Safe no-op if Plausible isn't present. */
export function track(event: string, props?: PlausibleProps): void {
  if (typeof window === "undefined" || typeof window.plausible !== "function") return;
  window.plausible(event, props ? { props } : undefined);
}

/** Named events — central registry so goal names stay consistent. */
export const Events = {
  newsletterSubscribe: "Newsletter: Subscribe",
  audioPlay: "Audio: Play",
} as const;
