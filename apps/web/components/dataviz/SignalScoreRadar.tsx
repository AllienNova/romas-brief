"use client";
// =====================================================================
// SignalScoreRadar — animated six-axis radar for the ROMAS signal score.
// WEB-4 data-viz, debuted in the WEB-1 preview. Pure SVG + Motion (`m`).
// The grid is static; the value polygon scales in from center and the
// per-axis dots pop in staggered. Reduced-motion is handled globally by
// MotionConfig (transform animations are suppressed → renders at rest).
// CLS-safe: fixed viewBox, no layout-affecting animation.
// =====================================================================
import * as m from "motion/react-m";
import { EASE } from "@/components/motion/primitives";

export interface RadarAxis {
  /** Short axis label, e.g. "Clinical". */
  label: string;
  /** Normalized 0..1. */
  value: number;
}

interface SignalScoreRadarProps {
  data: RadarAxis[];
  /** SVG square size in px. */
  size?: number;
  /** Accent (defaults to the ROMAS audio-published teal). */
  accent?: string;
}

const VIEW = 100; // viewBox units
const CENTER = VIEW / 2;
const RADIUS = 38; // max spoke length in viewBox units
const RINGS = [0.25, 0.5, 0.75, 1];

/** Point on an axis at angle index i (top-first, clockwise) for radius r. */
function axisPoint(i: number, count: number, r: number): [number, number] {
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / count;
  return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)];
}

function polygonPoints(values: number[]): string {
  return values
    .map((v, i) => axisPoint(i, values.length, RADIUS * Math.max(0, Math.min(1, v))).join(","))
    .join(" ");
}

export function SignalScoreRadar({
  data,
  size = 280,
  accent = "var(--rb-audio-published, #00B4C6)",
}: SignalScoreRadarProps) {
  const n = data.length;
  const values = data.map((d) => d.value);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      role="img"
      aria-label={`Signal score radar: ${data.map((d) => `${d.label} ${Math.round(d.value * 100)}`).join(", ")}`}
      style={{ overflow: "visible" }}
    >
      {/* ── Static grid: concentric rings + axis spokes ── */}
      <g stroke="var(--rb-border-subtle)" strokeWidth={0.4} fill="none" aria-hidden="true">
        {RINGS.map((r) => (
          <polygon
            key={r}
            points={Array.from({ length: n }, (_, i) => axisPoint(i, n, RADIUS * r).join(",")).join(" ")}
          />
        ))}
        {Array.from({ length: n }, (_, i) => {
          const [x, y] = axisPoint(i, n, RADIUS);
          return <line key={i} x1={CENTER} y1={CENTER} x2={x} y2={y} />;
        })}
      </g>

      {/* ── Animated value polygon (scales in from center) ── */}
      <m.g
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <polygon points={polygonPoints(values)} fill={accent} fillOpacity={0.16} stroke={accent} strokeWidth={1} />
      </m.g>

      {/* ── Per-axis value dots (pop in, staggered) ── */}
      {values.map((v, i) => {
        const [x, y] = axisPoint(i, n, RADIUS * Math.max(0, Math.min(1, v)));
        return (
          <m.circle
            key={i}
            cx={x}
            cy={y}
            fill={accent}
            initial={{ r: 0 }}
            whileInView={{ r: 1.8 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.3, ease: EASE, delay: 0.4 + i * 0.07 }}
          />
        );
      })}

      {/* ── Axis labels ── */}
      {data.map((d, i) => {
        const [x, y] = axisPoint(i, n, RADIUS + 9);
        return (
          <text
            key={d.label}
            x={x}
            y={y}
            fontSize={4.2}
            fontWeight={600}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--rb-text-tertiary)"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}
