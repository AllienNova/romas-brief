"use client";
import Link from "next/link";
import Image from "next/image";

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

const CONTENT_TYPE_ICONS: Record<string, string> = {
  news_brief: "📰",
  paper_critique: "🔬",
  practice_delta: "⚡",
  fda_brief: "🏛",
  reimbursement_explainer: "💰",
  vendor_intel: "🏢",
  long_take: "📖",
  primer: "🎓",
  conference_brief: "🎤",
};

const CATEGORY_COLORS: Record<string, string> = {
  "AI": "#5E5CE6", "AI & ML": "#5E5CE6", "ai": "#5E5CE6",
  "Clinical RT": "#30D158", "Clinical-RT": "#30D158", "CLINICAL-RT": "#30D158", "clinical-rt": "#30D158",
  "Regulatory": "#FF9F0A", "REGULATORY": "#FF9F0A", "regulatory": "#FF9F0A",
  "Physics": "#0A84FF", "PHYSICS": "#0A84FF", "physics": "#0A84FF",
  "Guidelines": "#32ADE6", "GUIDELINES": "#32ADE6", "guidelines": "#32ADE6",
  "Reimbursement": "#AC8E68", "reimbursement": "#AC8E68",
  "Vendor Intel": "#FF6961", "vendor-intel": "#FF6961",
  "Research": "#BF5AF2", "research": "#BF5AF2",
  "People & Orgs": "#30D158", "Operations": "#FF9F0A",
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
              {article.isRomasInsight && <span className="badge-insight">✦ ROMAS Insight</span>}
              {article.hasAudio && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}>🎧 Audio</span>
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
            {article.isRomasInsight && <span className="badge-insight">✦ RI</span>}
          </div>
          <h3 className="text-[15px] font-semibold leading-snug line-clamp-3 mb-2 flex-1 transition-colors duration-200 group-hover:text-[var(--rb-accent)]"
            style={{ color: "var(--rb-text-primary)", letterSpacing: "-0.015em" }}>{article.title}</h3>
          {article.summary && (
            <p className="text-[13px] line-clamp-2 leading-relaxed mb-3" style={{ color: "var(--rb-text-secondary)" }}>{article.summary}</p>
          )}
          <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: "1px solid var(--rb-border-subtle)" }}>
            <time className="kicker" dateTime={article.publishedAt} style={{ color: "var(--rb-text-tertiary)" }}>{formatDate(article.publishedAt)}</time>
            <div className="flex items-center gap-2">
              {article.hasAudio && <span className="text-xs" style={{ color: "var(--rb-text-tertiary)" }}>🎧</span>}
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
          <h4 className="text-sm font-semibold line-clamp-2 transition-colors duration-150 group-hover:text-[var(--rb-accent)]"
            style={{ color: "var(--rb-text-primary)", letterSpacing: "-0.01em" }}>{article.title}</h4>
          <div className="flex items-center gap-2 mt-1">
            <time className="kicker" dateTime={article.publishedAt} style={{ color: "var(--rb-text-tertiary)" }}>{formatDate(article.publishedAt)}</time>
            {article.region && <span className="kicker" style={{ color: "var(--rb-text-tertiary)" }}>{article.region}</span>}
          </div>
        </div>
        {article.hasAudio && (
          <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs"
            style={{ background: "var(--rb-accent-subtle)", color: "var(--rb-accent)" }}>🎧</span>
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
              {article.isRomasInsight && <span className="badge-insight">✦ RI</span>}
              {article.region && <span className="kicker ml-auto" style={{ color: "var(--rb-text-tertiary)" }}>{article.region}</span>}
            </div>
            <h4 className="text-[13.5px] font-semibold line-clamp-2 transition-colors duration-150 group-hover:text-[var(--rb-accent)]"
              style={{ color: "var(--rb-text-primary)", letterSpacing: "-0.01em" }}>{article.title}</h4>
            {article.summary && (
              <p className="text-xs line-clamp-2 mt-1 leading-relaxed" style={{ color: "var(--rb-text-secondary)" }}>{article.summary}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <time className="kicker" dateTime={article.publishedAt} style={{ color: "var(--rb-text-tertiary)" }}>{formatDate(article.publishedAt)}</time>
              {article.hasAudio && <span className="kicker" style={{ color: "var(--rb-text-tertiary)" }}>🎧 Audio</span>}
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
