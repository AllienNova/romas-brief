"use client";

/**
 * WebVitals — reports Core Web Vitals (LCP/INP/CLS/FCP/TTFB) to Plausible as
 * custom events so field performance is monitored in production (SHIP-24b).
 * Renders nothing.
 */
import { useReportWebVitals } from "next/web-vitals";
import { track } from "@/lib/analytics";

export function WebVitals() {
  useReportWebVitals((metric) => {
    // CLS is unitless (×1000 → integer ms-like); the rest are already ms.
    const value = metric.name === "CLS" ? Math.round(metric.value * 1000) : Math.round(metric.value);
    track(`Web Vitals: ${metric.name}`, { value, rating: metric.rating });
  });
  return null;
}
