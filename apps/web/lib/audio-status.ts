/**
 * Audio status model — mirrors audio_jobs.audio_status (SSOT §7 / migration
 * 0002) and maps the six DB states onto the three launch color tokens
 * (CLAUDE.md §7). Presentation lives in components/AudioStatusBadge.tsx;
 * this module is pure (no JSX) so it is unit-testable under node:test.
 */

export type AudioStatus =
  | "queued"
  | "generating"
  | "in_review"
  | "published"
  | "skipped"
  | "revoked";

export type AudioToken =
  | "--rb-audio-published"
  | "--rb-audio-pending"
  | "--rb-audio-skipped";

export interface AudioStatusMeta {
  label: string;
  token: AudioToken;
}

export const AUDIO_STATUS_META: Record<AudioStatus, AudioStatusMeta> = {
  queued: { label: "Audio queued", token: "--rb-audio-pending" },
  generating: { label: "Generating audio", token: "--rb-audio-pending" },
  in_review: { label: "Audio in review", token: "--rb-audio-pending" },
  published: { label: "Audio", token: "--rb-audio-published" },
  skipped: { label: "No audio", token: "--rb-audio-skipped" },
  revoked: { label: "Audio withdrawn", token: "--rb-audio-skipped" },
};

/** True only when the audio is QA-passed and listener-ready (Rule 6). */
export function isAudioPlayable(status: AudioStatus): boolean {
  return status === "published";
}

/** Narrow an arbitrary string (e.g. a DB row value) to a known AudioStatus. */
export function toAudioStatus(value: string | null | undefined): AudioStatus {
  return value != null && value in AUDIO_STATUS_META
    ? (value as AudioStatus)
    : "skipped";
}
