"use client";

/**
 * QuickHitsRotator — redesigned with rich card treatment
 * Top row rotates every 8s with slide-up animation
 * Rows 2-5 are stable anchors
 * Each row: coloured left accent bar, score ring, category pill, hover lift
 */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { HeadphonesIcon } from "./icons";

export interface QuickHitItem {
  slug: string;
  title: string;
  category: string;
  score: number;
  publishedAt: string;
  hasAudio?: boolean;
  region?: string;
}

interface QuickHitsRotatorProps {
  stableItems: QuickHitItem[];
  rotatingPool: QuickHitItem[];
}

const ROTATE_INTERVAL = 8000;

const CATEGORY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  "clinical-rt":    { color: "#0066CC", bg: "#EBF3FF", label: "Clinical RT" },
  "ai":             { color: "#4F46E5", bg: "#F0EFFF", label: "AI" },
  "physics":        { color: "#0066CC", bg: "#E5F3FF", label: "Physics" },
  "regulatory":     { color: "#B45309", bg: "#FEF3C7", label: "Regulatory" },
  "guidelines":     { color: "#0E7490", bg: "#E0F7FA", label: "Guidelines" },
  "reimbursement":  { color: "#7C3AED", bg: "#F3E8FF", label: "Reimbursement" },
  "vendor":         { color: "#047857", bg: "#D1FAE5", label: "Vendor" },
  "conferences":    { color: "#B91C1C", bg: "#FEE2E2", label: "Conferences" },
  "operations":     { color: "#15803D", bg: "#DCFCE7", label: "Operations" },
};

function getCategoryConfig(cat: string) {
  return CATEGORY_CONFIG[cat] ?? { color: "var(--rb-accent)", bg: "#EBF3FF", label: cat };
}

function getScoreStyle(score: number): { bg: string; ring: string; text: string } {
  if (score >= 85) return { bg: "#DCFCE7", ring: "#15803D", text: "#15803D" };
  if (score >= 70) return { bg: "#FEF9C3", ring: "#CA8A04", text: "#A16207" };
  return { bg: "#FEE2E2", ring: "#B91C1C", text: "#B91C1C" };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function HitRow({
  item,
  rank,
  animState,
  prefersReduced,
  isRotating,
}: {
  item: QuickHitItem;
  rank: number;
  animState: "idle" | "exit" | "enter";
  prefersReduced: boolean;
  isRotating: boolean;
}) {
  const catCfg = getCategoryConfig(item.category);
  const scoreCfg = getScoreStyle(item.score);

  let transform = "translateY(0)";
  let opacity = 1;

  if (isRotating && !prefersReduced) {
    if (animState === "exit") { transform = "translateY(-28px)"; opacity = 0; }
    else if (animState === "enter") { transform = "translateY(28px)"; opacity = 0; }
  }

  return (
    <Link href={`/article/${item.slug}`} className="block group">
      <div
        className="relative flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-200"
        style={{
          background: "var(--rb-bg-surface)",
          border: "1px solid var(--rb-border-subtle)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)";
          (e.currentTarget as HTMLDivElement).style.borderColor = catCfg.color + "60";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--rb-border-subtle)";
        }}
      >
        {/* Left accent bar */}
        <div
          className="absolute left-0 top-3 bottom-3 w-1 rounded-full"
          style={{ background: catCfg.color }}
        />

        {/* Rank number */}
        <span
          className="flex-shrink-0 w-8 text-center text-xl font-black tabular-nums select-none"
          style={{ color: "var(--rb-text-tertiary)", lineHeight: "1" }}
        >
          {String(rank).padStart(2, "0")}
        </span>

        {/* Content — animated for rotating row */}
        <div
          className="flex-1 min-w-0"
          style={{
            transform,
            opacity,
            transition: prefersReduced ? "none" : "transform 0.32s var(--rb-ease-apple), opacity 0.32s ease",
          }}
        >
          {/* Category pill + meta row */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className="inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: catCfg.bg, color: catCfg.color }}
            >
              {catCfg.label.toUpperCase()}
            </span>
            {isRotating && (
              <span
                className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: "#FFF7ED", color: "#C2410C", border: "1px solid #FED7AA" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse inline-block" />
                Live
              </span>
            )}
            {isRotating && (
              <span className="inline-flex items-center" style={{ color: "var(--rb-text-tertiary)" }} aria-hidden title="Rotates next">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 15l6-6 6 6" /></svg>
              </span>
            )}
            <span className="text-xs" style={{ color: "var(--rb-text-tertiary)" }}>
              {formatDate(item.publishedAt)}
            </span>
            {item.region && (
              <span className="text-xs font-medium" style={{ color: "var(--rb-text-tertiary)" }}>
                · {item.region.toUpperCase()}
              </span>
            )}
            {item.hasAudio && (
              <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--rb-text-tertiary)" }}>· <HeadphonesIcon size={12} /></span>
            )}
          </div>

          {/* Title */}
          <h3
            className="text-sm font-semibold leading-snug line-clamp-2 transition-colors duration-150"
            style={{ color: "var(--rb-text-primary)" }}
          >
            {item.title}
          </h3>
        </div>

        {/* Score ring badge */}
        <div
          className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-full font-black text-sm"
          style={{
            background: scoreCfg.bg,
            border: `2px solid ${scoreCfg.ring}`,
            color: scoreCfg.text,
            boxShadow: `0 0 0 3px ${scoreCfg.ring}22`,
          }}
        >
          S{item.score}
        </div>
      </div>
    </Link>
  );
}

export default function QuickHitsRotator({ stableItems, rotatingPool }: QuickHitsRotatorProps) {
  const [prefersReduced, setPrefersReduced] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [rotatingIdx, setRotatingIdx] = useState(0);
  const [animState, setAnimState] = useState<"idle" | "exit" | "enter">("idle");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const h = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  useEffect(() => {
    const onVis = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (rotatingPool.length < 2) return;
    timerRef.current = setInterval(() => {
      if (tabHidden || prefersReduced) return;
      setAnimState("exit");
      setTimeout(() => {
        setRotatingIdx((prev) => (prev + 1) % rotatingPool.length);
        setAnimState("enter");
        setTimeout(() => setAnimState("idle"), 320);
      }, 320);
    }, ROTATE_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [tabHidden, prefersReduced, rotatingPool.length]);

  const displayStable = stableItems.slice(0, 4);
  const rotatingItem = rotatingPool[rotatingIdx];

  if (!rotatingItem) return null;

  return (
    <div
      className="space-y-2"
      aria-label="Quick hits — top item rotates every 8 seconds"
      aria-live="polite"
    >
      {/* Row 1 — rotating, marked Live */}
      <HitRow
        item={rotatingItem}
        rank={1}
        animState={animState}
        prefersReduced={prefersReduced}
        isRotating={true}
      />
      {/* Rows 2-5 — stable */}
      {displayStable.map((item, i) => (
        <HitRow
          key={item.slug}
          item={item}
          rank={i + 2}
          animState="idle"
          prefersReduced={prefersReduced}
          isRotating={false}
        />
      ))}

      {/* Rotation progress — time-to-next-rotation affordance (spec 4.18.3) */}
      {rotatingPool.length >= 2 && (
        <div className="mt-1 h-0.5 overflow-hidden rounded-full" style={{ background: "var(--rb-border-subtle)" }} aria-hidden>
          <div
            key={rotatingIdx}
            className="qh-progress-bar h-full"
            style={{
              background: "var(--rb-accent)",
              transformOrigin: "left",
              animation: tabHidden || prefersReduced ? "none" : `qh-progress ${ROTATE_INTERVAL}ms linear`,
            }}
          />
        </div>
      )}
    </div>
  );
}
