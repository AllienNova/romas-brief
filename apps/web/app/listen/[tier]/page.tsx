/**
 * ROMAS Wire — Listen Tier Page
 * T-302 Reader app
 *
 * Server component. Shows all published audio jobs for a single tier.
 * ISR-friendly (revalidate 120s).
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getAudioArticles } from "@/lib/articles";

export const dynamic = "force-dynamic";

const VALID_TIERS = ["audio_brief", "daily_brief", "podcast", "conference_brief"] as const;
type AudioTier = (typeof VALID_TIERS)[number];

const TIER_META: Record<AudioTier, { label: string; description: string }> = {
  audio_brief: {
    label: "Audio Brief",
    description: "5–8 min focused summaries of key papers and trials",
  },
  daily_brief: {
    label: "Daily Brief",
    description: "10–15 min daily roundup of all new briefings",
  },
  podcast: {
    label: "Podcast",
    description: "In-depth analysis and expert commentary",
  },
  conference_brief: {
    label: "Conference Brief",
    description: "Live coverage of ASTRO, ESTRO, and ASCO",
  },
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

function formatDuration(sec: number | null): string {
  if (!sec) return "";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export async function generateMetadata(
  props: {
    params: Promise<{ tier: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const tier = params.tier as AudioTier;
  if (!VALID_TIERS.includes(tier)) return { title: "Not found" };
  const meta = TIER_META[tier];
  return {
    title: `${meta.label} — ROMAS Wire`,
    description: meta.description,
  };
}

export default async function ListenTierPage(
  props: {
    params: Promise<{ tier: string }>;
  }
) {
  const params = await props.params;
  const tier = params.tier as AudioTier;
  if (!VALID_TIERS.includes(tier)) notFound();

  const meta = TIER_META[tier];
  const allAudio = await getAudioArticles(100);
  const typedJobs: AudioItem[] = allAudio.map((a) => ({
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-[var(--rb-text-tertiary)]">
        <Link href="/" className="hover:text-[var(--rb-text-secondary)] transition-colors">
          ROMAS Wire
        </Link>
        <span className="mx-2">/</span>
        <Link href="/listen" className="hover:text-[var(--rb-text-secondary)] transition-colors">
          Listen
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--rb-text-secondary)]">{meta.label}</span>
      </nav>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--rb-text-primary)]">{meta.label}</h1>
          <p className="mt-2 text-[var(--rb-text-secondary)]">{meta.description}</p>
        </div>
        <a
          href={`/feeds/${tier.replace(/_/g, "-")}.xml`}
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--rb-border-default)] text-xs font-medium text-[var(--rb-text-secondary)] hover:border-[var(--rb-border-strong)] hover:bg-[var(--rb-bg-raised)] transition-colors"
        >
          <svg className="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M3.75 3a.75.75 0 000 1.5A11.75 11.75 0 0115.5 16.25a.75.75 0 001.5 0A13.25 13.25 0 003.75 3zM3.75 7.5a.75.75 0 000 1.5A7.25 7.25 0 0111 16.25a.75.75 0 001.5 0A8.75 8.75 0 003.75 7.5zM5 14.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
          </svg>
          RSS Feed
        </a>
      </div>
      {/* Episode count */}
      <p className="text-sm text-[var(--rb-text-tertiary)] mb-6">
        {typedJobs.length} episode{typedJobs.length !== 1 ? "s" : ""}
      </p>
      {/* Episode list */}
      {typedJobs.length === 0 ? (
        <div className="text-center py-16 text-[var(--rb-text-tertiary)]">
          <p>No episodes published yet. Check back soon.</p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--rb-border-subtle)]">
          {typedJobs.map((job, index) => {
            const article = job.articles;
            if (!article) return null;
            return (
              <div key={job.id} className="py-5 flex items-start gap-4 group">
                {/* Episode number */}
                <div className="flex-shrink-0 w-8 text-right text-sm text-[var(--rb-text-tertiary)] font-mono pt-0.5">
                  {typedJobs.length - index}
                </div>
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
                {/* Episode info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/article/${article.slug}`} className="block">
                    <h2 className="font-semibold text-[var(--rb-text-primary)] group-hover:text-teal-700 transition-colors leading-snug">
                      {article.title}
                    </h2>
                    {article.standfirst && (
                      <p className="mt-1 text-sm text-[var(--rb-text-tertiary)] line-clamp-2">
                        {article.standfirst}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-xs text-[var(--rb-text-tertiary)]">
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
      )}
    </div>
  );
}
