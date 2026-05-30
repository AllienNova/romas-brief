// =====================================================================
// apps/cms/lib/audio-qa-gate.ts · ROMAS Brief · SHIP-10
// Single source of truth for the 5-condition audio publish gate
// (inviolable rule 6, CLAUDE.md §4 / §5). This module mirrors the DB
// CHECK `audio_publish_requires_qa` (0002_create_audio_jobs.sql lines
// 89-98) EXACTLY so the checklist UI (AudioQAChecklist.tsx) and the
// route handler (app/api/audio-qa/[id]/route.ts) evaluate identical
// logic. The DB CHECK is the final authority; this is defense-in-depth.
//
// The 5 conditions (must ALL hold to flip in_review -> published):
//   1. clinical_claims_checked === true
//   2. qa_reviewer != null
//   3. loudness_lufs between -18 and -14 (inclusive)
//   4. true_peak_dbtp <= -1
//   5. transcript_url != null
// =====================================================================

import type { Database } from "@/lib/supabase/types";

export type AudioJobRow = Database["public"]["Tables"]["audio_jobs"]["Row"];

// Loudness safe band (ADR-0016): broadcast-speech band widened from -17..-15.
export const LUFS_MIN = -18;
export const LUFS_MAX = -14;
export const TRUE_PEAK_MAX = -1;

export type GateCondition = {
  id:
    | "clinical_claims_checked"
    | "qa_reviewer"
    | "loudness_lufs"
    | "true_peak_dbtp"
    | "transcript_url";
  label: string;
  pass: boolean;
  // Human-readable rendering of the actual value (for the checklist UI).
  detail: string;
};

export type GateResult = {
  conditions: GateCondition[];
  allPass: boolean;
  failed: GateCondition["id"][];
};

function fmtNum(n: number | null): string {
  return n === null ? "not set" : String(n);
}

/**
 * Evaluate the 5-condition publish gate against an audio_jobs row.
 * Pure + deterministic — shared by the checklist UI and the route handler.
 */
export function evaluatePublishGate(job: {
  clinical_claims_checked: boolean | null;
  qa_reviewer: string | null;
  loudness_lufs: number | null;
  true_peak_dbtp: number | null;
  transcript_url: string | null;
}): GateResult {
  const clinicalPass = job.clinical_claims_checked === true;
  const reviewerPass = job.qa_reviewer != null;
  const loudnessPass =
    job.loudness_lufs != null &&
    job.loudness_lufs >= LUFS_MIN &&
    job.loudness_lufs <= LUFS_MAX;
  const peakPass = job.true_peak_dbtp != null && job.true_peak_dbtp <= TRUE_PEAK_MAX;
  const transcriptPass = job.transcript_url != null;

  const conditions: GateCondition[] = [
    {
      id: "clinical_claims_checked",
      label: "Clinical claims checked",
      pass: clinicalPass,
      detail: clinicalPass ? "Verified" : "Not yet verified",
    },
    {
      id: "qa_reviewer",
      label: "QA reviewer assigned",
      pass: reviewerPass,
      detail: reviewerPass ? "Assigned" : "No reviewer set",
    },
    {
      id: "loudness_lufs",
      label: "Loudness in target band",
      pass: loudnessPass,
      detail: `${fmtNum(job.loudness_lufs)} LUFS (target ${LUFS_MIN}..${LUFS_MAX})`,
    },
    {
      id: "true_peak_dbtp",
      label: "True peak within ceiling",
      pass: peakPass,
      detail: `${fmtNum(job.true_peak_dbtp)} dBTP (target <= ${TRUE_PEAK_MAX})`,
    },
    {
      id: "transcript_url",
      label: "Transcript published",
      pass: transcriptPass,
      detail: transcriptPass ? "Present" : "Missing",
    },
  ];

  const failed = conditions.filter((c) => !c.pass).map((c) => c.id);

  return { conditions, allPass: failed.length === 0, failed };
}
