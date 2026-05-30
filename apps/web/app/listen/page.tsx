/**
 * ROMAS Brief — Listen Page
 * T-302 Reader app
 *
 * Server component. Shows all published audio jobs grouped by tier.
 * ISR-friendly (revalidate 120s).
 */
import Link from "next/link";
import type { Metadata } from "next";
import { getAudioArticles } from "@/lib/articles";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Listen — ROMAS Brief Audio",
  description:
    "Browse all ROMAS Brief audio briefings. Clinical intelligence for radiation oncology, available as audio.",
};

interface AudioItem {
  id: string;
  audio_tier: string;
  duration_sec: number | null;
  published_at: string | null;
  articles: {
    slug: string;
    title: string;
    standfirst: string | null;
    category: string | null;
  } | null;
}

const TIER_META: Record<string, { label: string; description: string; color: string }> = {
  audio_brief: {
    label: "Audio Brief",
    description: "5–8 min focused summaries of key papers and trials",
    color: "teal",
  },
  daily_brief: {
    label: "Daily Brief",
    description: "10–15 min daily roundup of all new briefings",
    color: "violet",
  },
  podcast: {
    label: "Podcast",
    description: "In-depth analysis and expert commentary",
    color: "blue",
  },
  conference_brief: {
    label: "Conference Brief",
    description: "Live coverage of ASTRO, ESTRO, and ASCO",
    color: "amber",
  },
};

function formatDuration(sec: number | null): string {
  if (!sec) return "";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default async function ListenPage() {
  const audioArticles = await getAudioArticles(50);

  // Map mock articles to AudioItem shape
  const typedJobs: AudioItem[] = audioArticles.map((a) => ({
    id: a.slug,
    audio_tier: "audio_brief",
    duration_sec: 360,
    published_at: a.published_at,
    articles: {
      slug: a.slug,
      title: a.title,
      standfirst: a.standfirst,
      category: a.category,
    },
  }));

  // Group by tier
  const byTier: Record<string, AudioItem[]> = {};
  for (const job of typedJobs) {
    const tier = job.audio_tier;
    if (!byTier[tier]) byTier[tier] = [];
    byTier[tier].push(job);
  }

  const tierOrder = ["audio_brief", "daily_brief", "podcast", "conference_brief"];
  const sortedTiers = [
    ...tierOrder.filter((t) => byTier[t] && byTier[t].length > 0),
    ...Object.keys(byTier).filter((t) => !tierOrder.includes(t) && (byTier[t]?.length ?? 0) > 0),
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Page header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          Listen to ROMAS Brief
        </h1>
        <p className="mt-3 text-neutral-600 max-w-xl">
          Every briefing is available as audio. Subscribe via RSS, Apple Podcasts, or
          Spotify — or listen directly below.
        </p>

        {/* RSS subscription links */}
        <div className="mt-5 flex flex-wrap gap-2">
          {Object.entries(TIER_META).map(([tier, meta]) => (
            <a
              key={tier}
              href={`/feeds/${tier.replace(/_/g, "-")}.xml`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 text-xs font-medium text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 transition-colors"
            >
              <svg className="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M3.75 3a.75.75 0 000 1.5A11.75 11.75 0 0115.5 16.25a.75.75 0 001.5 0A13.25 13.25 0 003.75 3zM3.75 7.5a.75.75 0 000 1.5A7.25 7.25 0 0111 16.25a.75.75 0 001.5 0A8.75 8.75 0 003.75 7.5zM5 14.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
              </svg>
              {meta.label} RSS
            </a>
          ))}
        </div>
      </div>

      {/* No audio yet */}
      {sortedTiers.length === 0 && (
        <div className="text-center py-16 text-neutral-400">
          <p>No audio briefings published yet. Check back soon.</p>
        </div>
      )}

      {/* Tier sections */}
      {sortedTiers.map((tier) => {
        const meta = TIER_META[tier] ?? { label: tier, description: "", color: "neutral" };
        const jobs = byTier[tier] ?? [];

        return (
          <section key={tier} className="mb-12">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">{meta.label}</h2>
                {meta.description && (
                  <p className="text-sm text-neutral-500 mt-0.5">{meta.description}</p>
                )}
              </div>
              <Link
                href={`/listen/${tier}`}
                className="text-sm text-teal-600 hover:underline"
              >
                View all →
              </Link>
            </div>

            <div className="divide-y divide-neutral-100">
              {jobs.slice(0, 5).map((job) => {
                const article = job.articles;
                if (!article) return null;
                return (
                  <div key={job.id} className="py-4 flex items-start gap-4 group">
                    {/* Play button */}
                    <Link
                      href={`/article/${article.slug}`}
                      className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700 transition-colors"
                      aria-label={`Listen to ${article.title}`}
                    >
                      <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </Link>

                    {/* Article info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/article/${article.slug}`} className="block">
                        <h3 className="font-semibold text-neutral-900 group-hover:text-teal-700 transition-colors leading-snug line-clamp-2">
                          {article.title}
                        </h3>
                        {article.standfirst && (
                          <p className="mt-1 text-sm text-neutral-500 line-clamp-1">
                            {article.standfirst}
                          </p>
                        )}
                        <div className="mt-1.5 flex items-center gap-3 text-xs text-neutral-400">
                          {job.published_at && (
                            <time dateTime={job.published_at}>
                              {new Date(job.published_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </time>
                          )}
                          {job.duration_sec && (
                            <span>{formatDuration(job.duration_sec)}</span>
                          )}
                          {article.category && (
                            <span className="uppercase tracking-wide">
                              {article.category.replace(/_/g, " ")}
                            </span>
                          )}
                        </div>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
