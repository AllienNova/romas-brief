"use client";
import Link from "next/link";
import Image from "next/image";
import { HeadphonesIcon, ContentTypeIcon, StarMark } from "./icons";

export type ArticleCardVariant = "feature" | "standard" | "compact" | "quick-hit";

export interface ArticleCardProps {
  slug: string;
  title: string;
  summary?: string;
  category: string;
  categoryColor?: string;
  contentType?: string;
  region?: string;
  signalScore?: number;
  publishedAt: string;
  imageUrl?: string;
  hasAudio?: boolean;
  isRomasInsight?: boolean;
  variant?: ArticleCardVariant;
  className?: string;
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
  news_brief: "News Brief",
  paper_critique: "Paper Critique",
  practice_delta: "Practice Delta",
  fda_brief: "FDA Brief",
  reimbursement_explainer: "Reimbursement",
  vendor_intel: "Vendor Intel",
  long_take: "Long Take",
  primer: "Primer",
  conference_brief: "Conference Brief",
};


const CATEGORY_COLORS: Record<string, string> = {
  "AI": "#4F46E5", "AI & ML": "#4F46E5", "ai": "#4F46E5",
  "Clinical RT": "#15803D", "Clinical-RT": "#15803D", "CLINICAL-RT": "#15803D", "clinical-rt": "#15803D",
  "Regulatory": "#B45309", "REGULATORY": "#B45309", "regulatory": "#B45309",
  "Physics": "#0066CC", "PHYSICS": "#0066CC", "physics": "#0066CC",
  "Guidelines": "#0E7490", "GUIDELINES": "#0E7490", "guidelines": "#0E7490",
  "Reimbursement": "#8A6D45", "reimbursement": "#8A6D45",
  "Vendor Intel": "#C1121C", "vendor-intel": "#C1121C",
  "Research": "#9333EA", "research": "#9333EA",
  "People & Orgs": "#15803D", "Operations": "#B45309",
  default: "#0055CC",
};

function SignalBadge({ score }: { score: number }) {
  if (score >= 85) return <span className="badge-signal-green">S{score}</span>;
  if (score >= 70) return <span className="badge-signal-amber">S{score}</span>;
  return <span className="badge-signal-red">S{score}</span>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Feature Card ─────────────────────────────────────────────────
function FeatureCard({ article }: { article: ArticleCardProps }) {
  const color = article.categoryColor || CATEGORY_COLORS[article.category] || CATEGORY_COLORS.default;
  return (
    <Link href={`/article/${article.slug}`} className="block group" aria-label={article.title}>
      <article className="card-feature overflow-hidden">
        {article.imageUrl && (
          <div className="relative w-full overflow-hidden" style={{ height: "clamp(200px,32vw,280px)" }}>
            <Image src={article.imageUrl} alt={article.title} fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              sizes="(max-width:768px) 100vw, 55vw" priority />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.15) 50%,transparent 100%)" }} />
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              {article.isRomasInsight && <span className="badge-insight"><StarMark className="inline-block mr-0.5" /> ROMAS Insight</span>}
              {article.hasAudio && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}><HeadphonesIcon size={12} /> Audio</span>
              )}
            </div>
          </div>
        )}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="kicker font-bold" style={{ color }}>{article.category}</span>
            {article.contentType && (
              <span className="kicker" style={{ color: "var(--rb-text-tertiary)" }}>
                {CONTENT_TYPE_LABELS[article.contentType] || article.contentType}
              </span>
            )}
            {article.signalScore !== undefined && <span className="ml-auto"><SignalBadge score={article.signalScore} /></span>}
          </div>
          <h3 className="text-xl font-bold leading-snug mb-2.5 transition-colors duration-200 group-hover:text-[var(--rb-accent)]"
            style={{ color: "var(--rb-text-primary)", letterSpacing: "-0.02em" }}>{article.title}</h3>
          {article.summary && (
            <p className="text-sm leading-relaxed line-clamp-3 mb-4" style={{ color: "var(--rb-text-secondary)" }}>{article.summary}</p>
          )}
          <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--rb-border-subtle)" }}>
            <time className="kicker" dateTime={article.publishedAt} style={{ color: "var(--rb-text-tertiary)" }}>{formatDate(article.publishedAt)}</time>
            <span className="text-xs font-semibold flex items-center gap-1 transition-all duration-200 group-hover:gap-2" style={{ color: "var(--rb-accent)" }}>
              Read brief <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Standard Card ────────────────────────────────────────────────
function StandardCard({ article }: { article: ArticleCardProps }) {
  const color = article.categoryColor || CATEGORY_COLORS[article.category] || CATEGORY_COLORS.default;
  return (
    <Link href={`/article/${article.slug}`} className="block group" aria-label={article.title}>
      <article className="card h-full flex flex-col">
        {article.imageUrl && (
          <div className="relative w-full overflow-hidden" style={{ height: "180px" }}>
            <Image src={article.imageUrl} alt={article.title} fill
              className="object-cover transition-transform duration-600 group-hover:scale-[1.04]"
              sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(0,0,0,0.28) 0%,transparent 60%)" }} />
          </div>
        )}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="kicker font-bold" style={{ color }}>{article.category}</span>
            {article.signalScore !== undefined && <SignalBadge score={article.signalScore} />}
            {article.isRomasInsight && <span className="badge-insight"><StarMark className="inline-block mr-0.5" /> RI</span>}
          </div>
          <h3 className="text-[15px] font-semibold leading-snug line-clamp-3 mb-2 flex-1 transition-colors duration-200 group-hover:text-[var(--rb-accent)]"
            style={{ color: "var(--rb-text-primary)", letterSpacing: "-0.015em" }}>{article.title}</h3>
          {article.summary && (
            <p className="text-[13px] line-clamp-2 leading-relaxed mb-3" style={{ color: "var(--rb-text-secondary)" }}>{article.summary}</p>
          )}
          <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: "1px solid var(--rb-border-subtle)" }}>
            <time className="kicker" dateTime={article.publishedAt} style={{ color: "var(--rb-text-tertiary)" }}>{formatDate(article.publishedAt)}</time>
            <div className="flex items-center gap-2">
              {article.hasAudio && <span className="flex items-center" style={{ color: "var(--rb-text-tertiary)" }}><HeadphonesIcon size={12} /></span>}
              {article.region && <span className="kicker" style={{ color: "var(--rb-text-tertiary)" }}>{article.region}</span>}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Compact Card ─────────────────────────────────────────────────
function CompactCard({ article }: { article: ArticleCardProps }) {
  const color = article.categoryColor || CATEGORY_COLORS[article.category] || CATEGORY_COLORS.default;
  return (
    <Link href={`/article/${article.slug}`} className="block group" aria-label={article.title}>
      <article className="flex items-start gap-3 py-3.5 hover:bg-[var(--rb-bg-raised)] rounded-xl px-3 -mx-3 transition-colors duration-150"
        style={{ borderBottom: "1px solid var(--rb-border-subtle)" }}>
        <div className="flex-shrink-0 w-[3px] self-stretch rounded-full" style={{ background: color, minHeight: "36px" }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="kicker font-bold" style={{ color }}>{article.category}</span>
            {article.signalScore !== undefined && <SignalBadge score={article.signalScore} />}
          </div>
          <h3 className="text-sm font-semibold line-clamp-2 transition-colors duration-150 group-hover:text-[var(--rb-accent)]"
            style={{ color: "var(--rb-text-primary)", letterSpacing: "-0.01em" }}>{article.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <time className="kicker" dateTime={article.publishedAt} style={{ color: "var(--rb-text-tertiary)" }}>{formatDate(article.publishedAt)}</time>
            {article.region && <span className="kicker" style={{ color: "var(--rb-text-tertiary)" }}>{article.region}</span>}
          </div>
        </div>
        {article.hasAudio && (
          <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "var(--rb-accent-subtle)", color: "var(--rb-accent)" }}><HeadphonesIcon size={14} /></span>
        )}
      </article>
    </Link>
  );
}

// ─── Quick Hit Card ───────────────────────────────────────────────
function QuickHitCard({ article }: { article: ArticleCardProps }) {
  const color = article.categoryColor || CATEGORY_COLORS[article.category] || CATEGORY_COLORS.default;
  return (
    <Link href={`/article/${article.slug}`} className="block group" aria-label={article.title}>
      <article className="p-4 rounded-xl transition-all duration-150 hover:bg-[var(--rb-bg-raised)]"
        style={{ background: "var(--rb-bg-surface)", border: "1px solid var(--rb-border-subtle)" }}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-[3px] rounded-full mt-0.5" style={{ background: color, minHeight: "40px" }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="kicker font-bold" style={{ color }}>{article.category}</span>
              {article.signalScore !== undefined && <SignalBadge score={article.signalScore} />}
              {article.isRomasInsight && <span className="badge-insight"><StarMark className="inline-block mr-0.5" /> RI</span>}
              {article.region && <span className="kicker ml-auto" style={{ color: "var(--rb-text-tertiary)" }}>{article.region}</span>}
            </div>
            <h3 className="text-[13.5px] font-semibold line-clamp-2 transition-colors duration-150 group-hover:text-[var(--rb-accent)]"
              style={{ color: "var(--rb-text-primary)", letterSpacing: "-0.01em" }}>{article.title}</h3>
            {article.summary && (
              <p className="text-xs line-clamp-2 mt-1 leading-relaxed" style={{ color: "var(--rb-text-secondary)" }}>{article.summary}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <time className="kicker" dateTime={article.publishedAt} style={{ color: "var(--rb-text-tertiary)" }}>{formatDate(article.publishedAt)}</time>
              {article.hasAudio && <span className="kicker flex items-center gap-1" style={{ color: "var(--rb-text-tertiary)" }}><HeadphonesIcon size={12} /> Audio</span>}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Main Export ──────────────────────────────────────────────────
export default function ArticleCard({ variant = "standard", ...props }: ArticleCardProps) {
  switch (variant) {
    case "feature":   return <FeatureCard article={{ variant, ...props }} />;
    case "compact":   return <CompactCard article={{ variant, ...props }} />;
    case "quick-hit": return <QuickHitCard article={{ variant, ...props }} />;
    default:          return <StandardCard article={{ variant, ...props }} />;
  }
}
