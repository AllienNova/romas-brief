/**
 * AudioPlayer — QA-gated audio surface (SHIP-23, design spec component-library).
 *
 * Rule 6: only QA-passed `published` audio is playable. For any other
 * audio_status — or when no CDN URL is present — the component renders an
 * AudioStatusBadge instead of a player, so a non-listener-ready asset can
 * never be played.
 *
 * Two variants:
 *   - "inline" (A): the compact InlineAudioPlayer, for cards / lists / in-body.
 *   - "banner" (B): a prominent "Listen to this brief" surface for the top of
 *     an article.
 */
import InlineAudioPlayer from "./InlineAudioPlayer";
import { AudioStatusBadge } from "./AudioStatusBadge";
import { HeadphonesIcon } from "./icons";
import { isAudioPlayable, type AudioStatus } from "@/lib/audio-status";

export type AudioPlayerVariant = "inline" | "banner";

interface AudioPlayerProps {
  status: AudioStatus;
  audioUrl?: string | null;
  title?: string;
  /** audio_jobs.audio_tier (audio_brief | daily_brief | podcast | conference_brief). */
  tier?: string;
  durationSec?: number | null;
  transcriptUrl?: string | null;
  variant?: AudioPlayerVariant;
  className?: string;
}

export function AudioPlayer({
  status,
  audioUrl,
  title,
  tier,
  durationSec,
  transcriptUrl,
  variant = "inline",
  className,
}: AudioPlayerProps) {
  if (!isAudioPlayable(status) || !audioUrl) {
    return <AudioStatusBadge status={status} className={className} />;
  }

  const player = (
    <InlineAudioPlayer
      audioUrl={audioUrl}
      title={title}
      tier={tier}
      durationSec={durationSec ?? undefined}
      transcriptUrl={transcriptUrl}
    />
  );

  if (variant === "inline") {
    return <div className={className}>{player}</div>;
  }

  return (
    <div
      className={`rounded-[var(--rb-radius-lg)] border p-4 ${className ?? ""}`}
      style={{ background: "var(--rb-accent-subtle)", borderColor: "var(--rb-border-subtle)" }}
    >
      <p className="kicker mb-2 inline-flex items-center gap-1.5" style={{ color: "var(--rb-accent)" }}>
        <HeadphonesIcon size={13} /> Listen to this brief
      </p>
      {player}
    </div>
  );
}
