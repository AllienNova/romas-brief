"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

export interface TopStoryItem {
  slug: string;
  title: string;
  standfirst: string;
  category: string;
  content_type: string;
  composite_score: number;
  published_at: string;
  thumbnail_url?: string;
  has_audio?: boolean;
  romas_insight?: boolean | string;
  region?: string;
}

interface Props {
  articles: TopStoryItem[];
  /** seconds between auto-advance; default 7 */
  interval?: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  "AI": "#5E5CE6", "AI & ML": "#5E5CE6", "ai": "#5E5CE6",
  "Clinical RT": "#30D158", "Clinical-RT": "#30D158", "CLINICAL-RT": "#30D158", "clinical-rt": "#30D158",
  "Regulatory": "#FF9F0A", "REGULATORY": "#FF9F0A", "regulatory": "#FF9F0A",
  "Physics": "#0A84FF", "PHYSICS": "#0A84FF", "physics": "#0A84FF",
  "Guidelines": "#32ADE6", "GUIDELINES": "#32ADE6", "guidelines": "#32ADE6",
  "Reimbursement": "#AC8E68", "reimbursement": "#AC8E68",
  "Vendor Intel": "#FF6961", "vendor-intel": "#FF6961",
  "Research": "#BF5AF2", "research": "#BF5AF2",
  default: "#0055CC",
};

function SignalBadge({ score }: { score: number }) {
  const cls = score >= 85 ? "badge-signal-green" : score >= 70 ? "badge-signal-amber" : "badge-signal-red";
  return <span className={cls}>S{score}</span>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function RotatingTopStories({ articles, interval = 7 }: Props) {
  // We show 1 hero + 2 secondary at a time, cycling through all articles
  const total = articles.length;
  const [page, setPage] = useState(0); // page * 3 = start index
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pageCount = Math.ceil(total / 3);

  const goTo = useCallback((nextPage: number, dir: "next" | "prev" = "next") => {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setPage(nextPage);
      setAnimating(false);
    }, 380);
  }, [animating]);

  const advance = useCallback(() => {
    goTo((page + 1) % pageCount, "next");
  }, [page, pageCount, goTo]);

  const retreat = useCallback(() => {
    goTo((page - 1 + pageCount) % pageCount, "prev");
  }, [page, pageCount, goTo]);

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(advance, interval * 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [advance, interval, paused]);

  // Pause on tab blur
  useEffect(() => {
    const onBlur = () => setPaused(true);
    const onFocus = () => setPaused(false);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    return () => { window.removeEventListener("blur", onBlur); window.removeEventListener("focus", onFocus); };
  }, []);

  const startIdx = page * 3;
  const heroArticle = articles[startIdx % total];
  const secondaryArticles = [
    articles[(startIdx + 1) % total],
    articles[(startIdx + 2) % total],
  ];

  const catColor = CATEGORY_COLORS[heroArticle.category] || CATEGORY_COLORS.default;

  // Progress bar width
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    setProgress(0);
    if (paused) return;
    const step = 100 / (interval * 20); // update every 50ms
    const prog = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(prog); return 100; }
        return p + step;
      });
    }, 50);
    return () => clearInterval(prog);
  }, [page, interval, paused]);

  const slideStyle: React.CSSProperties = {
    transition: animating ? "opacity 0.38s ease, transform 0.38s ease" : "none",
    opacity: animating ? 0 : 1,
    transform: animating
      ? direction === "next" ? "translateX(-18px)" : "translateX(18px)"
      : "translateX(0)",
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Progress bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] z-10 rounded-full overflow-hidden"
        style={{ background: "var(--border-subtle)" }}
      >
        <div
          className="h-full rounded-full transition-none"
          style={{
            width: `${progress}%`,
            background: catColor,
            transition: paused ? "none" : "width 50ms linear",
          }}
        />
      </div>

      {/* Navigation controls */}
      <div className="absolute top-3 right-0 flex items-center gap-1.5 z-10">
        {/* Page dots */}
        <div className="flex items-center gap-1 mr-2">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > page ? "next" : "prev")}
              aria-label={`Go to page ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === page ? "16px" : "6px",
                height: "6px",
                background: i === page ? catColor : "var(--border-default)",
              }}
            />
          ))}
        </div>
        <button
          onClick={retreat}
          aria-label="Previous stories"
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-95"
          style={{ background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}
        >
          ‹
        </button>
        <button
          onClick={advance}
          aria-label="Next stories"
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-95"
          style={{ background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}
        >
          ›
        </button>
        {paused && (
          <span className="kicker ml-1" style={{ color: "var(--text-tertiary)" }}>Paused</span>
        )}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-6" style={slideStyle}>
        {/* Hero article — left column */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <Link href={`/article/${heroArticle.slug}`} className="block group" aria-label={heroArticle.title}>
            <article
              className="overflow-hidden rounded-2xl transition-all duration-300"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--shadow-sm)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-lg)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              {/* Image */}
              <div className="relative w-full overflow-hidden" style={{ height: "clamp(200px, 30vw, 280px)" }}>
                {heroArticle.thumbnail_url ? (
                  <Image
                    src={heroArticle.thumbnail_url}
                    alt={heroArticle.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    sizes="(max-width: 768px) 100vw, 55vw"
                    priority
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(135deg, ${catColor}22 0%, ${catColor}11 100%)` }}
                  />
                )}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)" }}
                />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  {heroArticle.romas_insight && <span className="badge-insight">✦ ROMAS Insight</span>}
                  {heroArticle.has_audio && (
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
                    >
                      🎧 Audio
                    </span>
                  )}
                </div>
              </div>

              {/* Text */}
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="kicker font-bold" style={{ color: catColor }}>{heroArticle.category}</span>
                  <span className="kicker" style={{ color: "var(--text-tertiary)" }}>
                    {heroArticle.content_type.replace(/_/g, " ")}
                  </span>
                  <SignalBadge score={heroArticle.composite_score} />
                </div>
                <h2
                  className="text-2xl sm:text-3xl font-bold mb-3 group-hover:text-[var(--accent)] transition-colors duration-200"
                  style={{ color: "var(--text-primary)", letterSpacing: "-0.025em", lineHeight: "1.2" }}
                >
                  {heroArticle.title}
                </h2>
                <p className="text-base leading-relaxed mb-5" style={{ color: "var(--text-secondary)" }}>
                  {heroArticle.standfirst}
                </p>
                <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  <time className="kicker" dateTime={heroArticle.published_at} style={{ color: "var(--text-tertiary)" }}>
                    {formatDate(heroArticle.published_at)}
                  </time>
                  <span
                    className="text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all duration-200"
                    style={{ color: "var(--accent)" }}
                  >
                    Read brief <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                  </span>
                </div>
              </div>
            </article>
          </Link>
        </div>

        {/* Right column — 2 secondary cards */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {secondaryArticles.map((article) => {
            const color = CATEGORY_COLORS[article.category] || CATEGORY_COLORS.default;
            return (
              <Link key={article.slug} href={`/article/${article.slug}`} className="block group" aria-label={article.title}>
                <article
                  className="overflow-hidden rounded-xl flex flex-col transition-all duration-250"
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    boxShadow: "var(--shadow-xs)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-xs)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
                  }}
                >
                  {article.thumbnail_url && (
                    <div className="relative w-full overflow-hidden" style={{ height: "160px" }}>
                      <Image
                        src={article.thumbnail_url}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-600 group-hover:scale-[1.04]"
                        sizes="(max-width: 640px) 100vw, 40vw"
                      />
                      <div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.28) 0%, transparent 60%)" }}
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="kicker font-bold" style={{ color }}>{article.category}</span>
                      <SignalBadge score={article.composite_score} />
                      {article.romas_insight && <span className="badge-insight">✦ RI</span>}
                    </div>
                    <h3
                      className="text-[15px] font-semibold leading-snug line-clamp-3 mb-2 transition-colors duration-200 group-hover:text-[var(--accent)]"
                      style={{ color: "var(--text-primary)", letterSpacing: "-0.015em" }}
                    >
                      {article.title}
                    </h3>
                    <p
                      className="text-[13px] line-clamp-2 leading-relaxed mb-3"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {article.standfirst}
                    </p>
                    <div
                      className="flex items-center justify-between pt-3"
                      style={{ borderTop: "1px solid var(--border-subtle)" }}
                    >
                      <time
                        className="kicker"
                        dateTime={article.published_at}
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {new Date(article.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </time>
                      <div className="flex items-center gap-2">
                        {article.has_audio && <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>🎧</span>}
                        {article.region && <span className="kicker" style={{ color: "var(--text-tertiary)" }}>{article.region}</span>}
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
