// =====================================================================
// apps/cms/app/audio-qa/[id]/page.tsx · ROMAS Brief · SHIP-10
// Audio QA detail surface. Fetches one audio_jobs row (+ its article),
// renders the player, the 5-condition checklist, qa_notes, and the
// action bar. params is an async Promise in Next 15 — await it.
// notFound() when the row is absent (missing, RLS-hidden, or no DB env).
// =====================================================================

import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AudioStatusBadge } from "@/components/AudioStatusBadge";
import { AudioQAChecklist } from "@/components/AudioQAChecklist";
import { AudioQAActions } from "@/components/AudioQAActions";
import { evaluatePublishGate, type AudioJobRow } from "@/lib/audio-qa-gate";

export const dynamic = "force-dynamic";

const TIER_LABELS: Record<string, string> = {
  audio_brief: "Audio Brief",
  daily_brief: "Daily Brief",
  podcast: "Podcast",
  conference_brief: "Conference Brief",
  video_podcast: "Video Podcast",
};

type ArticleSummary = { title: string; slug: string; standfirst: string } | null;
type DetailRow = AudioJobRow & { articles: ArticleSummary };

async function loadJob(id: string): Promise<DetailRow | null> {
  try {
    const sb = await createServerSupabaseClient();
    const { data, error } = await sb
      .from("audio_jobs")
      .select("*, articles(title, slug, standfirst)")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return data as unknown as DetailRow;
  } catch {
    return null;
  }
}

export default async function AudioQADetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await loadJob(id);
  if (!job) notFound();

  const article = job.articles;
  const tier = TIER_LABELS[job.audio_tier] ?? job.audio_tier;
  const { allPass } = evaluatePublishGate(job);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <Link
        href="/"
        className="text-xs font-medium text-neutral-500 hover:text-neutral-700 focus:outline-none focus-visible:underline"
      >
        ← Back to queue
      </Link>

      <header className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-widest text-neutral-500">{tier}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">
            {article?.title ?? "(untitled article)"}
          </h1>
          {article?.standfirst && (
            <p className="mt-2 text-sm text-neutral-600">{article.standfirst}</p>
          )}
        </div>
        <AudioStatusBadge status={job.audio_status} />
      </header>

      <section aria-label="Audio preview" className="mt-8">
        <h2 className="text-sm font-semibold tracking-tight text-neutral-900">Audio</h2>
        {job.audio_url_cdn ? (
          <audio controls preload="none" src={job.audio_url_cdn} className="mt-3 w-full">
            Your browser does not support the audio element.
          </audio>
        ) : (
          <p className="mt-3 rounded-md border border-dashed border-neutral-200 px-4 py-6 text-center text-sm text-neutral-500">
            No audio generated yet.
          </p>
        )}
      </section>

      <div className="mt-8">
        <AudioQAChecklist job={job} />
      </div>

      {job.qa_notes && (
        <section aria-label="QA notes" className="mt-8">
          <h2 className="text-sm font-semibold tracking-tight text-neutral-900">QA notes</h2>
          <p className="mt-2 whitespace-pre-wrap rounded-md border border-neutral-200 px-4 py-3 text-sm text-neutral-700">
            {job.qa_notes}
          </p>
        </section>
      )}

      <section aria-label="Actions" className="mt-8">
        <h2 className="text-sm font-semibold tracking-tight text-neutral-900">Actions</h2>
        <div className="mt-3">
          <AudioQAActions jobId={job.id} canPublish={allPass} status={job.audio_status} />
        </div>
      </section>
    </main>
  );
}
