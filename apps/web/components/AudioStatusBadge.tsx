/**
 * AudioStatusBadge — surfaces the audio_jobs.audio_status state machine on
 * the reader. Six DB states → three launch color tokens (CLAUDE.md §7):
 * published → teal, in-flight (queued/generating/in_review) → amber,
 * terminal-without-audio (skipped/revoked) → slate.
 *
 * Status model + mapping live in lib/audio-status.ts (pure, tested).
 */
import { AUDIO_STATUS_META, type AudioStatus } from "@/lib/audio-status";

interface AudioStatusBadgeProps {
  status: AudioStatus;
  className?: string;
}

export function AudioStatusBadge({ status, className }: AudioStatusBadgeProps) {
  const meta = AUDIO_STATUS_META[status];
  const color = `var(${meta.token})`;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${className ?? ""}`}
      style={{ color }}
      role="status"
      aria-label={`Audio status: ${meta.label}`}
    >
      <span
        aria-hidden="true"
        style={{ width: 6, height: 6, borderRadius: "9999px", backgroundColor: color, display: "inline-block" }}
      />
      {meta.label}
    </span>
  );
}
