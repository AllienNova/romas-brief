// =====================================================================
// apps/cms/app/page.tsx · ROMAS Brief · SHIP-10
// Audio QA queue (FR-009 operator surface). Server component: lists
// audio_jobs awaiting review (audio_status='in_review') plus a smaller
// recently-published list. RLS returns empty without an audio_qa
// reviewer session, and the build runs with no DB env — so every query
// path degrades to the graceful empty state and never throws.
// =====================================================================

import Link from "next/link";
import type { Route } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AudioStatusBadge } from "@/components/AudioStatusBadge";

export const dynamic = "force-dynamic";

const TIER_LABELS: Record<string, string> = {
  audio_brief: "Audio Brief",
  daily_brief: "Daily Brief",
  podcast: "Podcast",
  conference_brief: "Conference Brief",
  video_podcast: "Video Podcast",
};

type QueueRow = {
  id: string;
  audio_tier: string;
  audio_status: string;
  articles: { title: string; slug: string; standfirst: string } | null;
};

async function loadJobs(): Promise<{ inReview: QueueRow[]; published: QueueRow[] }> {
  // Never let a missing-env throw or an RLS error bubble to the page —
  // the queue must always render its empty state.
  try {
    const sb = await createServerSupabaseClient();
    const select = "id, audio_tier, audio_status, articles(title, slug, standfirst)";

    const [reviewRes, publishedRes] = await Promise.all([
      sb
        .from("audio_jobs")
        .select(select)
        .eq("audio_status", "in_review")
        .order("created_at", { ascending: true }),
      sb
        .from("audio_jobs")
        .select(select)
        .eq("audio_status", "published")
        .order("qa_reviewed_at", { ascending: false })
        .limit(8),
    ]);

    return {
      inReview: ((reviewRes.data as QueueRow[] | null) ?? []),
      published: ((publishedRes.data as QueueRow[] | null) ?? []),
    };
  } catch {
    return { inReview: [], published: [] };
  }
}

function JobRow({ job }: { job: QueueRow }) {
  const title = job.articles?.title ?? "(untitled article)";
  const tier = TIER_LABELS[job.audio_tier] ?? job.audio_tier;
  return (
    <li>
      <Link
        href={`/audio-qa/${job.id}` as Route}
        className="flex items-center justify-between gap-4 rounded-lg border border-neutral-200 px-4 py-3 transition-colors hover:border-neutral-300 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B7A]"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-neutral-900">{title}</p>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-neutral-500">{tier}</p>
        </div>
        <AudioStatusBadge status={job.audio_status} />
      </Link>
    </li>
  );
}

export default async function CmsHome() {
  const { inReview, published } = await loadJobs();

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Audio QA
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900">
          Review queue
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Audio jobs awaiting editorial QA. No audio goes live until all five publish
          conditions pass.
        </p>
      </header>

      <section aria-labelledby="queue-heading" className="mt-8">
        <h2 id="queue-heading" className="text-sm font-semibold tracking-tight text-neutral-900">
          Awaiting review
        </h2>
        {inReview.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {inReview.map((job) => (
              <JobRow key={job.id} job={job} />
            ))}
          </ul>
        ) : (
          <div className="mt-3 rounded-lg border border-dashed border-neutral-200 px-4 py-8 text-center">
            <p className="text-sm font-medium text-neutral-700">
              No audio jobs awaiting review
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              If you expected jobs here, confirm you are signed in as an audio QA reviewer.
              The queue is gated by Cloudflare Access and Supabase auth.
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="published-heading" className="mt-10">
        <h2
          id="published-heading"
          className="text-sm font-semibold tracking-tight text-neutral-900"
        >
          Recently published
        </h2>
        {published.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {published.map((job) => (
              <JobRow key={job.id} job={job} />
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-neutral-500">No published audio jobs yet.</p>
        )}
      </section>
    </main>
  );
}
