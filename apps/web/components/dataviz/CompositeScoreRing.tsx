"use client";
// =====================================================================
// CompositeScoreRing — animated radial gauge for the composite signal score
// (0–100). WEB-4. Pure SVG + Motion: the arc sweeps from empty to the score
// via strokeDashoffset (a paint property → CLS-safe, no layout animation).
// The numeric value is rendered statically (SSR-correct, never blocks paint);
// only the arc animates. strokeDashoffset is NOT a transform, so MotionConfig
// does not auto-suppress it — reduced motion is honored explicitly via
// useReducedMotion (renders at the final offset, no sweep).
// =====================================================================
import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";
import { EASE } from "@/components/motion/primitives";

interface CompositeScoreRingProps {
  /** Composite score 0..100. */
  score: number;
  /** SVG square size in px. */
  size?: number;
  /** Arc color (defaults to the ROMAS accent). */
  accent?: string;
  /** Caption under the number. */
  label?: string;
}

const STROKE = 8;
const R = (100 - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

export function CompositeScoreRing({
  score,
  size = 96,
  accent = "var(--rb-accent)",
  label = "Signal",
}: CompositeScoreRingProps) {
  const s = Math.max(0, Math.min(100, Math.round(score)));
  const target = CIRC * (1 - s / 100);
  const reduce = useReducedMotion();

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`${label} score ${s} of 100`}>
        <circle cx="50" cy="50" r={R} fill="none" stroke="var(--rb-bg-raised)" strokeWidth={STROKE} />
        <m.circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke={accent}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          transform="rotate(-90 50 50)"
          initial={{ strokeDashoffset: reduce ? target : CIRC }}
          whileInView={{ strokeDashoffset: target }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: reduce ? 0 : 1, ease: EASE }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
        <span className="text-xl font-black tabular-nums" style={{ color: "var(--rb-text-primary)" }}>
          {s}
        </span>
        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--rb-text-tertiary)" }}>
          {label}
        </span>
      </div>
    </div>
  );
}
