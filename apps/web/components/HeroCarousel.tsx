"use client";

/**
 * HeroCarousel — Rotating hero above Top Stories
 * 7s horizontal slide, mixed pool (Top Move + Friday Read + Audio Today + Conference Brief + Sponsor)
 * Pagination dots + arrows + progress bar
 * Pause-on-hover, pause-on-tab-blur, prefers-reduced-motion fallback
 */

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

export type SlideType = "top_move" | "friday_read" | "audio_today" | "conference_brief" | "sponsor";

export interface HeroSlide {
  id: string;
  type: SlideType;
  label: string;
  kicker: string;
  title: string;
  summary: string;
  href: string;
  cta: string;
  /** Gradient CSS string for the visual background */
  gradient: string;
  /** Optional signal score */
  score?: number;
  /** Optional sponsor flag — renders with firewall badge */
  isSponsor?: boolean;
  /** Optional audio flag */
  hasAudio?: boolean;
}

const SLIDE_DURATION = 7000; // 7 seconds

const TYPE_STYLES: Record<SlideType, { accent: string; badge: string }> = {
  top_move:        { accent: "#0066CC", badge: "TOP MOVE" },
  friday_read:     { accent: "#0F766E", badge: "FRIDAY READ" },
  audio_today:     { accent: "#BF5AF2", badge: "AUDIO TODAY" },
  conference_brief:{ accent: "#FF9F0A", badge: "CONFERENCE" },
  sponsor:         { accent: "#6B7280", badge: "PARTNER" },
};

interface HeroCarouselProps {
  slides: HeroSlide[];
}

export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [prefersReduced, setPrefersReduced] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);

  const total = slides.length;

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Pause on tab blur
  useEffect(() => {
    const onBlur = () => setPaused(true);
    const onFocus = () => setPaused(false);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) setPaused(true);
      else setPaused(false);
    });
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // Progress bar animation using rAF
  const animateProgress = useCallback(() => {
    if (paused || prefersReduced) return;
    const now = performance.now();
    const elapsed = elapsedRef.current + (now - startTimeRef.current);
    const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
    setProgress(pct);
    if (pct < 100) {
      rafRef.current = requestAnimationFrame(animateProgress);
    }
  }, [paused, prefersReduced]);

  const goTo = useCallback((index: number, dir: "next" | "prev" = "next") => {
    if (isAnimating) return;
    setDirection(dir);
    setIsAnimating(true);
    setCurrent(index);
    setProgress(0);
    elapsedRef.current = 0;
    startTimeRef.current = performance.now();
    setTimeout(() => setIsAnimating(false), prefersReduced ? 0 : 400);
  }, [isAnimating, prefersReduced]);

  const goNext = useCallback(() => {
    goTo((current + 1) % total, "next");
  }, [current, total, goTo]);

  const goPrev = useCallback(() => {
    goTo((current - 1 + total) % total, "prev");
  }, [current, total, goTo]);

  // Auto-advance
  useEffect(() => {
    if (paused || prefersReduced) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      // Accumulate elapsed time when pausing
      elapsedRef.current += performance.now() - startTimeRef.current;
      return;
    }
    startTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(animateProgress);
    intervalRef.current = setInterval(goNext, SLIDE_DURATION - elapsedRef.current);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [paused, prefersReduced, current, goNext, animateProgress]);

  if (!slides.length) return null;

  const slide = slides[current];
  const style = TYPE_STYLES[slide.type];

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: slide.gradient,
        minHeight: "220px",
        boxShadow: "var(--rb-shadow-md)",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Featured stories carousel"
      aria-roledescription="carousel"
    >
      {/* Slide content */}
      <div
        className="relative z-10 px-6 py-7 sm:px-8 sm:py-8"
        style={{
          transition: prefersReduced ? "none" : "opacity 0.4s ease",
          opacity: isAnimating ? 0.7 : 1,
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        {/* Badges row */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase"
            style={{ background: style.accent, color: "white" }}
          >
            {style.badge}
          </span>
          {slide.isSponsor && (
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.8)" }}
            >
              Sponsored · Editorial firewall applies
            </span>
          )}
          {slide.score !== undefined && (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold"
              style={{
                background: slide.score >= 80 ? "#1A7F37" : "#9A6700",
                color: "white",
              }}
            >
              S{slide.score}
            </span>
          )}
          {slide.hasAudio && (
            <span className="text-white/80 text-xs">🎧</span>
          )}
        </div>

        {/* Kicker */}
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.65)" }}>
          {slide.kicker}
        </p>

        {/* Title */}
        <h2
          className="text-xl sm:text-2xl font-bold text-white mb-2 text-balance"
          style={{ letterSpacing: "-0.025em", lineHeight: "1.25", maxWidth: "600px" }}
        >
          {slide.title}
        </h2>

        {/* Summary */}
        <p className="text-sm text-white/75 leading-relaxed mb-5 line-clamp-2" style={{ maxWidth: "560px" }}>
          {slide.summary}
        </p>

        {/* CTA */}
        <Link
          href={slide.href}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95"
          style={{ background: "rgba(255,255,255,0.95)", color: style.accent }}
          aria-label={`${slide.cta}: ${slide.title}`}
        >
          {slide.cta} →
        </Link>
      </div>

      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5"
        style={{ background: "rgba(255,255,255,0.15)" }}
        aria-hidden="true"
      >
        <div
          className="h-full"
          style={{
            width: prefersReduced ? "100%" : `${progress}%`,
            background: "rgba(255,255,255,0.7)",
            transition: prefersReduced ? "none" : "width 0.1s linear",
          }}
        />
      </div>

      {/* Arrow controls */}
      {total > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{ background: "rgba(0,0,0,0.25)", color: "white" }}
            aria-label="Previous slide"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{ background: "rgba(0,0,0,0.25)", color: "white" }}
            aria-label="Next slide"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Pagination dots */}
      {total > 1 && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5"
          role="tablist"
          aria-label="Carousel slides"
        >
          {slides.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={i === current}
              aria-label={`Slide ${i + 1}: ${s.title}`}
              onClick={() => goTo(i, i > current ? "next" : "prev")}
              className="transition-all"
              style={{
                width: i === current ? "20px" : "6px",
                height: "6px",
                borderRadius: "3px",
                background: i === current ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.4)",
                transition: prefersReduced ? "none" : "width 0.3s ease, background 0.3s ease",
              }}
            />
          ))}
        </div>
      )}

      {/* Pause indicator */}
      {paused && !prefersReduced && (
        <div
          className="absolute top-3 right-3 z-20 px-2 py-1 rounded-full text-xs font-medium"
          style={{ background: "rgba(0,0,0,0.35)", color: "rgba(255,255,255,0.7)" }}
          aria-live="polite"
        >
          ⏸ Paused
        </div>
      )}
    </div>
  );
}
