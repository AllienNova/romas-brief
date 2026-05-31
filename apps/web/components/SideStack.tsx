"use client";

/**
 * SideStack — Three vertically-stacked story slots that flip independently
 * Each slot rotates on a staggered cycle: slot 0 = 12s, slot 1 = 16s, slot 2 = 20s
 * 3D X-axis rotation (card flips top-to-bottom)
 * Slots never flip simultaneously (staggered intervals)
 * Pool of top 12 stories — avoids repeating same content twice in a session
 * Pauses on tab blur, respects prefers-reduced-motion
 */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { StarMark, HeadphonesIcon } from "./icons";

export interface SideStackItem {
  slug: string;
  title: string;
  category: string;
  score: number;
  publishedAt: string;
  hasAudio?: boolean;
  isRomasInsight?: boolean;
  region?: string;
}

interface SlotState {
  current: number;
  flipping: boolean;
}

// Stagger intervals per slot (ms)
const SLOT_INTERVALS = [12000, 16000, 20000];

interface SideStackProps {
  items: SideStackItem[];
}

function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    "clinical-rt": "#0066CC",
    "ai": "#5E5CE6",
    "physics": "#0A84FF",
    "regulatory": "#FF9F0A",
    "guidelines": "#32ADE6",
    "reimbursement": "#AC8E68",
    "vendor": "#30D158",
    "conferences": "#FF6961",
    "operations": "#30D158",
  };
  return map[category] ?? "var(--rb-accent)";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function SlotCard({ item }: { item: SideStackItem }) {
  return (
    <div className="p-4 h-full flex flex-col justify-between" style={{ backfaceVisibility: "hidden" }}>
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span
            className="kicker"
            style={{ color: getCategoryColor(item.category) }}
          >
            {item.category.replace(/-/g, " ").toUpperCase()}
          </span>
          {item.isRomasInsight && (
            <span className="badge-insight text-xs"><StarMark size={9} /> RI</span>
          )}
          <span
            className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded"
            style={{
              background: item.score >= 80 ? "#1A7F37" : item.score >= 60 ? "#9A6700" : "#CF222E",
              color: "white",
            }}
          >
            S{item.score}
          </span>
        </div>
        <h4
          className="text-sm font-semibold line-clamp-2 leading-snug"
          style={{ color: "var(--rb-text-primary)" }}
        >
          {item.title}
        </h4>
      </div>
      <div className="flex items-center gap-2 mt-2">
        {item.hasAudio && <span style={{ color: "var(--rb-text-tertiary)" }}><HeadphonesIcon size={12} /></span>}
        <time className="kicker text-xs" style={{ color: "var(--rb-text-tertiary)" }}>
          {formatDate(item.publishedAt)}
        </time>
        {item.region && (
          <span className="kicker text-xs ml-auto" style={{ color: "var(--rb-text-tertiary)" }}>
            {item.region.toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}

export default function SideStack({ items }: SideStackProps) {
  const pool = items.slice(0, 12);
  const [prefersReduced, setPrefersReduced] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);

  // Each slot tracks its current item index and flip state
  const [slots, setSlots] = useState<SlotState[]>([
    { current: 0, flipping: false },
    { current: Math.min(1, pool.length - 1), flipping: false },
    { current: Math.min(2, pool.length - 1), flipping: false },
  ]);

  // Track which items each slot has shown to avoid repeats
  const shownRef = useRef<Set<number>[]>([
    new Set([0]),
    new Set([Math.min(1, pool.length - 1)]),
    new Set([Math.min(2, pool.length - 1)]),
  ]);

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

  // Set up independent timers per slot
  useEffect(() => {
    if (pool.length < 4) return; // not enough items to rotate

    const timers: ReturnType<typeof setInterval>[] = [];

    SLOT_INTERVALS.forEach((interval, slotIdx) => {
      const timer = setInterval(() => {
        if (tabHidden || prefersReduced) return;

        // Find next item not currently shown in any slot and not recently shown in this slot
        const currentlyShown = new Set(slots.map((s) => s.current));
        const candidates = pool
          .map((_, i) => i)
          .filter((i) => !currentlyShown.has(i) && !shownRef.current[slotIdx].has(i));

        let nextIdx: number;
        if (candidates.length === 0) {
          // Reset shown history for this slot, just avoid current slot items
          shownRef.current[slotIdx] = new Set(slots.map((s) => s.current));
          const fallback = pool
            .map((_, i) => i)
            .filter((i) => !currentlyShown.has(i));
          nextIdx = fallback[Math.floor(Math.random() * fallback.length)] ?? slots[slotIdx].current;
        } else {
          nextIdx = candidates[Math.floor(Math.random() * candidates.length)];
        }

        shownRef.current[slotIdx].add(nextIdx);

        // Trigger flip animation
        setSlots((prev) => {
          const next = [...prev];
          next[slotIdx] = { ...next[slotIdx], flipping: true };
          return next;
        });

        setTimeout(() => {
          setSlots((prev) => {
            const next = [...prev];
            next[slotIdx] = { current: nextIdx, flipping: false };
            return next;
          });
        }, prefersReduced ? 0 : 350);
      }, interval);

      timers.push(timer);
    });

    return () => timers.forEach(clearInterval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabHidden, prefersReduced, pool.length]);

  if (!pool.length) return null;

  return (
    <div className="flex flex-col gap-3" aria-label="Rotating story stack">
      {slots.map((slot, slotIdx) => {
        const item = pool[slot.current];
        if (!item) return null;
        return (
          <Link
            key={`slot-${slotIdx}`}
            href={`/article/${item.slug}`}
            className="block group"
            aria-label={`Story ${slotIdx + 1}: ${item.title}`}
          >
            <article
              className="card overflow-hidden"
              style={{
                minHeight: "100px",
                perspective: "600px",
                transition: prefersReduced ? "none" : undefined,
              }}
            >
              <div
                style={{
                  transformOrigin: "center top",
                  transform: slot.flipping && !prefersReduced ? "rotateX(-90deg)" : "rotateX(0deg)",
                  transition: prefersReduced ? "none" : "transform 0.35s ease-in",
                  opacity: slot.flipping && !prefersReduced ? 0 : 1,
                }}
                className="group-hover:bg-[var(--rb-bg-raised)] transition-colors"
              >
                <SlotCard item={item} />
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  );
}
