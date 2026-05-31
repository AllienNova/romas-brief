// =====================================================================
// apps/cms/app/api/audio-qa/[id]/route.ts · ROMAS Wire · SHIP-10
// QA state-transition endpoint (FR-009, inviolable rule 6). Three layers
// of defense gate WHETHER an audio job may publish:
//   1. RLS policy audio_qa_flip — gates WHO (role audio_qa).
//   2. DB CHECK audio_publish_requires_qa — final authority on the 5 conds.
//   3. THIS handler — re-fetches the row and re-validates the 5 conditions
//      server-side before issuing the UPDATE (fail fast with 422, and do
//      not rely on the client's view of the gate).
//
// Body: { action: 'publish' | 'skip' | 'revoke', reason?: string }
//   publish  -> in_review  -> published  (all 5 gate conditions required)
//   skip     -> in_review  -> skipped    (skip_reason required)
//   revoke   -> published  -> revoked    (revoke_reason required)
// =====================================================================

import { NextResponse } from "next/server";
import { createRouteSupabaseClient } from "@/lib/supabase/route";
import { evaluatePublishGate } from "@/lib/audio-qa-gate";

export const dynamic = "force-dynamic";

const ACTIONS = ["publish", "skip", "revoke"] as const;
type Action = (typeof ACTIONS)[number];

function isAction(value: unknown): value is Action {
  return typeof value === "string" && (ACTIONS as readonly string[]).includes(value);
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  // ---- Parse + validate the request body -----------------------------
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const action = (body as { action?: unknown })?.action;
  if (!isAction(action)) {
    return NextResponse.json(
      { ok: false, error: "action must be one of: publish, skip, revoke" },
      { status: 400 },
    );
  }

  const rawReason = (body as { reason?: unknown })?.reason;
  const reason = typeof rawReason === "string" ? rawReason.trim() : "";

  if ((action === "skip" || action === "revoke") && reason.length === 0) {
    return NextResponse.json(
      { ok: false, error: `${action} requires a non-empty reason` },
      { status: 400 },
    );
  }

  const sb = await createRouteSupabaseClient();

  // ---- Re-fetch the row (do not trust the client's gate view) ---------
  const { data: job, error: fetchError } = await sb
    .from("audio_jobs")
    .select(
      "id, audio_status, clinical_claims_checked, qa_reviewer, loudness_lufs, true_peak_dbtp, transcript_url",
    )
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ ok: false, error: fetchError.message }, { status: 500 });
  }
  if (!job) {
    return NextResponse.json({ ok: false, error: "Audio job not found" }, { status: 404 });
  }

  const now = new Date().toISOString();

  if (action === "publish") {
    if (job.audio_status !== "in_review") {
      return NextResponse.json(
        { ok: false, error: "Only in_review jobs can be published" },
        { status: 409 },
      );
    }
    // Defense-in-depth: re-evaluate the 5-condition gate server-side.
    const gate = evaluatePublishGate(job);
    if (!gate.allPass) {
      return NextResponse.json({ ok: false, failed: gate.failed }, { status: 422 });
    }
    const { error } = await sb
      .from("audio_jobs")
      .update({ audio_status: "published", qa_reviewed_at: now })
      .eq("id", id);
    // RLS / DB CHECK rejection surfaces here.
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 403 });
    }
    return NextResponse.json({ ok: true, status: "published" });
  }

  if (action === "skip") {
    if (job.audio_status !== "in_review") {
      return NextResponse.json(
        { ok: false, error: "Only in_review jobs can be skipped" },
        { status: 409 },
      );
    }
    const { error } = await sb
      .from("audio_jobs")
      .update({ audio_status: "skipped", skip_reason: reason, qa_reviewed_at: now })
      .eq("id", id);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 403 });
    }
    return NextResponse.json({ ok: true, status: "skipped" });
  }

  // action === "revoke"
  if (job.audio_status !== "published") {
    return NextResponse.json(
      { ok: false, error: "Only published jobs can be revoked" },
      { status: 409 },
    );
  }
  const { error } = await sb
    .from("audio_jobs")
    .update({ audio_status: "revoked", revoke_reason: reason })
    .eq("id", id);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 403 });
  }
  return NextResponse.json({ ok: true, status: "revoked" });
}
