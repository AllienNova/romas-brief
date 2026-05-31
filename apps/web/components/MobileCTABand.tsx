"use client";

/**
 * MobileCTABand — Single persistent 48px bottom band on mobile
 * ONE subscribe surface on mobile (not six)
 * Dismissible for 7 days via localStorage
 * Only renders on mobile (hidden on lg+)
 */

import { useState, useEffect } from "react";

const STORAGE_KEY = "romas-mobile-cta-dismissed";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export default function MobileCTABand() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const ts = parseInt(raw, 10);
        if (Date.now() - ts < DISMISS_DURATION_MS) return; // still dismissed
      }
      setVisible(true);
    } catch {
      // localStorage not available
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-3 px-4"
      style={{
        height: "48px",
        background: "var(--rb-accent)",
        boxShadow: "0 -2px 16px rgba(0,0,0,0.18)",
      }}
      role="complementary"
      aria-label="Subscribe to ROMAS Wire"
    >
      <a
        href="https://romasbrief.beehiiv.com/subscribe"
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 text-center text-sm font-semibold text-white truncate"
        aria-label="Subscribe to ROMAS Wire — free for qualified clinicians"
      >
        Subscribe free — clinical intelligence daily
      </a>
      <button
        onClick={dismiss}
        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
        style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
        aria-label="Dismiss subscribe banner for 7 days"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
