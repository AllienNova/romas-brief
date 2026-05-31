"use client";

/**
 * DismissibleStrip — One-time dismissible sub-explanation strip
 * Shown once per browser session, dismissed via localStorage
 * Explains what ROMAS Wire is and how it works
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { InfoMark } from "./icons";

const STORAGE_KEY = "romas-strip-dismissed";

export default function DismissibleStrip() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (!dismissed) setVisible(true);
    } catch {
      // localStorage not available
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="relative border-b"
      style={{
        background: "var(--rb-accent-subtle)",
        borderColor: "var(--rb-border-subtle)",
      }}
      role="complementary"
      aria-label="How ROMAS Wire works"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
          <InfoMark size={18} className="flex-shrink-0" />
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--rb-text-secondary)" }}>
            <strong style={{ color: "var(--rb-text-primary)" }}>How this works:</strong>{" "}
            Every briefing is ingested from PubMed, arXiv, ClinicalTrials, and FDA, then scored by clinical relevance,
            physics impact, and novelty. Only items above signal threshold S70 reach the brief.{" "}
            <Link
              href="/about/how-it-works"
              className="font-semibold underline underline-offset-2 hover:no-underline transition-colors"
              style={{ color: "var(--rb-accent)" }}
              onClick={dismiss}
            >
              Learn more →
            </Link>
          </p>
        </div>
        <button
          onClick={dismiss}
          className="flex-shrink-0 p-1.5 rounded-full transition-colors hover:bg-[var(--rb-bg-raised)]"
          style={{ color: "var(--rb-text-tertiary)" }}
          aria-label="Dismiss explanation strip"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
