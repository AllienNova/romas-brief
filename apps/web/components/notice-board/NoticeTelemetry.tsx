"use client";
// =====================================================================
// NoticeTelemetry — client island that captures board impressions + CTA clicks
// (§12). Observes every [data-notice-id] element: an impression fires once per
// page view when the element is ≥50% visible for ≥1s; a click fires on any
// anchor inside a notice. Events batch and flush via navigator.sendBeacon on
// visibility-hidden / pagehide (and immediately on click, since navigation is
// imminent), so telemetry never blocks navigation. Honors Do-Not-Track: if DNT
// is on, the island does nothing. No PII is collected — only the notice id.
// =====================================================================
import { useEffect } from "react";
import {
  IMPRESSION_DWELL_MS,
  IMPRESSION_VISIBLE_RATIO,
  type NoticeEvent,
  type NoticeSurface,
} from "@/lib/notice-board/telemetry";

export function NoticeTelemetry({ surface }: { surface: NoticeSurface }) {
  useEffect(() => {
    // Honor Do-Not-Track (and the legacy vendor flags). Privacy-first (§12).
    const dnt =
      navigator.doNotTrack === "1" ||
      (window as { doNotTrack?: string }).doNotTrack === "1" ||
      (navigator as { msDoNotTrack?: string }).msDoNotTrack === "1";
    if (dnt) return;

    const queue: NoticeEvent[] = [];
    const counted = new Set<string>();
    const timers = new Map<string, number>();

    const flush = () => {
      if (queue.length === 0 || !navigator.sendBeacon) return;
      const batch = queue.splice(0, queue.length);
      navigator.sendBeacon(
        "/api/notices/events",
        new Blob([JSON.stringify(batch)], { type: "application/json" }),
      );
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset["noticeId"];
          if (!id || counted.has(id)) continue;
          const visible = entry.isIntersecting && entry.intersectionRatio >= IMPRESSION_VISIBLE_RATIO;
          if (visible && !timers.has(id)) {
            const t = window.setTimeout(() => {
              counted.add(id);
              queue.push({ noticeId: id, kind: "impression", surface });
              timers.delete(id);
              io.unobserve(entry.target);
            }, IMPRESSION_DWELL_MS);
            timers.set(id, t);
          } else if (!visible && timers.has(id)) {
            clearTimeout(timers.get(id));
            timers.delete(id); // left viewport before dwell elapsed → no impression
          }
        }
      },
      { threshold: [IMPRESSION_VISIBLE_RATIO] },
    );

    document.querySelectorAll<HTMLElement>("[data-notice-id]").forEach((el) => io.observe(el));

    const onClick = (ev: MouseEvent) => {
      const host = (ev.target as HTMLElement).closest<HTMLElement>("[data-notice-id]");
      const id = host?.dataset["noticeId"];
      const isAnchor = (ev.target as HTMLElement).closest("a");
      if (id && isAnchor) {
        queue.push({ noticeId: id, kind: "click", surface });
        flush(); // navigation likely — send now
      }
    };
    const onHidden = () => {
      if (document.visibilityState === "hidden") flush();
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("pagehide", flush);

    return () => {
      io.disconnect();
      timers.forEach((t) => clearTimeout(t));
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [surface]);

  return null;
}
