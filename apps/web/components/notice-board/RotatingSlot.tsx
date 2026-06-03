"use client";
// =====================================================================
// RotatingSlot — the ONE controlled-rotation secondary slot (§9). Crossfades
// through the overflow editorial pool. All §9 requirements are mandatory:
//   • 9s interval (8–12s band); AUTO-STOPS after one full cycle.
//   • manual prev/next + dot position indicator; pause on hover AND focus.
//   • never rotates system or pinned notices (filtered out of the pool here).
//   • disabled entirely under prefers-reduced-motion or when pool < 2 →
//     renders the first item static.
//   • crossfade only — opacity, no flip/slide. CLS-safe (no layout animation).
// Renders each item through the shared EditorialNoticeCard (sponsored can never
// reach this slot — the pool is EditorialNotice[]).
// =====================================================================
import { useCallback, useEffect, useRef, useState } from "react";
import type { EditorialNotice } from "@/lib/notice-board/types";
import { EditorialNoticeCard } from "./cards/EditorialNoticeCard";

const ROTATE_MS = 9000; // §9: 8–12s
const FADE_MS = 320;

/** §9: featured/sponsored never reach this pool; also exclude system + pinned. */
function rotatable(n: EditorialNotice): boolean {
  return n.type !== "system" && !n.pinned;
}

export function RotatingSlot({ notices }: { notices: EditorialNotice[] }) {
  const pool = notices.filter(rotatable);
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [stopped, setStopped] = useState(false);
  const advances = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const h = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  const crossfadeTo = useCallback(
    (resolve: (prev: number) => number) => {
      setFade(true);
      window.setTimeout(() => {
        setIdx((prev) => ((resolve(prev) % pool.length) + pool.length) % pool.length);
        setFade(false);
      }, FADE_MS);
    },
    [pool.length],
  );

  const canRotate = pool.length >= 2 && !reduced;

  useEffect(() => {
    if (!canRotate || paused || stopped) return;
    const t = window.setInterval(() => {
      advances.current += 1;
      if (advances.current >= pool.length) {
        // §9: auto-stop after one full cycle — return to the start and rest.
        setStopped(true);
        crossfadeTo(() => 0);
        return;
      }
      crossfadeTo((prev) => prev + 1);
    }, ROTATE_MS);
    return () => window.clearInterval(t);
  }, [canRotate, paused, stopped, pool.length, crossfadeTo]);

  if (pool.length === 0) return null;
  const current = pool[idx] ?? pool[0]!;

  // Static render: reduced-motion or single item → no rotation, no controls.
  if (!canRotate) {
    return (
      <div data-rotating="false">
        <EditorialNoticeCard notice={current} />
      </div>
    );
  }

  const manual = (resolve: (prev: number) => number) => {
    setStopped(true); // manual engagement ends auto-rotation; controls still work
    crossfadeTo(resolve);
  };

  return (
    <div
      className="flex h-full flex-col"
      data-rotating="true"
      aria-roledescription="carousel"
      aria-label="Rotating notice"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        aria-live="polite"
        className="flex-1"
        style={{ opacity: fade ? 0 : 1, transition: `opacity ${FADE_MS}ms ease` }}
      >
        <EditorialNoticeCard notice={current} />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => manual((p) => p - 1)}
            aria-label="Previous notice"
            className="flex h-7 w-7 items-center justify-center rounded-full border text-xs transition-colors hover:bg-[var(--rb-bg-raised)]"
            style={{ borderColor: "var(--rb-border-subtle)", color: "var(--rb-text-secondary)" }}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => manual((p) => p + 1)}
            aria-label="Next notice"
            className="flex h-7 w-7 items-center justify-center rounded-full border text-xs transition-colors hover:bg-[var(--rb-bg-raised)]"
            style={{ borderColor: "var(--rb-border-subtle)", color: "var(--rb-text-secondary)" }}
          >
            ›
          </button>
        </div>
        <div className="flex items-center gap-1.5" aria-hidden>
          {pool.map((n, i) => (
            <span
              key={n.id}
              className="h-1.5 w-1.5 rounded-full transition-colors"
              style={{ background: i === idx ? "var(--rb-accent)" : "var(--rb-border-default)" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
