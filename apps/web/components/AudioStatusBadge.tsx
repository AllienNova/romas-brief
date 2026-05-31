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
  // Label uses neutral text (AA on both themes); the status color rides the
  // decorative dot. A mid-tone status hue (e.g. #00B4C6) can't hold 4.5:1 as
  // text on white, so it must not carry the textual meaning alone.
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${className ?? ""}`}
      style={{ color: "var(--rb-text-secondary)" }}
      role="status"
      aria-label={`Audio status: ${meta.label}`}
    >
      <span
        aria-hidden="true"
        style={{ width: 6, height: 6, borderRadius: "9999px", backgroundColor: `var(${meta.token})`, display: "inline-block" }}
      />
      {meta.label}
    </span>
  );
}
