"use client";
// =====================================================================
// SignalBar — a single animated horizontal signal-score bar. WEB-4.
// The track reserves full width always; the colored fill is positioned at
// its final width and scales in on scroll (transformOrigin left), so there
// is zero layout shift (CLS-safe — scaleX is a transform, never width).
// scaleX is a transform, so MotionConfig reducedMotion="user" suppresses it
// globally → under reduced motion the bar renders filled at rest.
// =====================================================================
import * as m from "motion/react-m";
import { EASE } from "@/components/motion/primitives";

interface SignalBarProps {
  label: string;
  /** Normalized 0..1. */
  value: number;
  /** Fill color (defaults to the ROMAS accent). */
  color?: string;
  /** Stagger delay in seconds. */
  delay?: number;
}

export function SignalBar({ label, value, color = "var(--rb-accent)", delay = 0 }: SignalBarProps) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 flex-shrink-0 text-xs" style={{ color: "var(--rb-text-tertiary)" }}>
        {label}
      </span>
      <div
        className="relative h-1.5 flex-1 overflow-hidden rounded-full"
        style={{ background: "var(--rb-bg-raised)" }}
        role="meter"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${pct} of 100`}
      >
        <m.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${pct}%`, background: color, transformOrigin: "left center" }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7, ease: EASE, delay }}
        />
      </div>
      <span
        className="w-7 flex-shrink-0 text-right text-xs tabular-nums"
        style={{ color: "var(--rb-text-tertiary)" }}
      >
        {pct}
      </span>
    </div>
  );
}
