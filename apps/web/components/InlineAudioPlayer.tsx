"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { HeadphonesIcon } from "./icons";

interface InlineAudioPlayerProps {
  src?: string;
  audioUrl?: string;
  title?: string;
  transcriptUrl?: string | null;
  durationSec?: number | null;
  duration?: number;
  tier?: string;
  className?: string;
}

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 2] as const;
type Speed = (typeof SPEED_OPTIONS)[number];

const TIER_LABELS: Record<string, string> = {
  audio_brief: "Audio Brief",
  daily_brief: "Daily Brief",
  podcast: "Podcast",
  conference_brief: "Conference Brief",
};

function formatTime(sec: number): string {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function InlineAudioPlayer({
  src,
  audioUrl,
  title,
  transcriptUrl,
  durationSec,
  duration: durationProp,
  tier,
  className = "",
}: InlineAudioPlayerProps) {
  const resolvedSrc = src ?? audioUrl ?? "";
  const resolvedDuration = durationSec ?? durationProp ?? 0;

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(resolvedDuration);
  const [speed, setSpeed] = useState<Speed>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => { if (isFinite(audio.duration)) setDuration(audio.duration); };
    const onPlay = () => { setIsPlaying(true); setIsLoading(false); };
    const onPause = () => setIsPlaying(false);
    const onEnded = () => { setIsPlaying(false); setCurrentTime(0); };
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onError = () => { setIsPlaying(false); setIsLoading(false); setError("Audio unavailable."); };
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("error", onError);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { audio.pause(); }
    else { setIsLoading(true); void audio.play().catch(() => { setIsLoading(false); setError("Playback failed."); }); }
  }, [isPlaying]);

  const handleScrub = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = parseFloat(e.target.value);
    audio.currentTime = t;
    setCurrentTime(t);
  }, []);

  const handleSpeedChange = useCallback((s: Speed) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = s;
    setSpeed(s);
  }, []);

  const skip = useCallback((secs: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.currentTime + secs, audio.duration || 0));
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`audio-player flex-col gap-3 ${className}`}>
      <audio ref={audioRef} src={resolvedSrc} preload="metadata" />

      {/* Top row */}
      <div className="flex items-center justify-between w-full">
        {tier && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--rb-accent-subtle)] text-[var(--rb-accent)] text-xs font-medium">
            <HeadphonesIcon size={13} /> {TIER_LABELS[tier] ?? tier}
          </span>
        )}
        {title && <p className="text-xs font-medium text-[var(--rb-text-primary)] truncate flex-1 mx-3">{title}</p>}
        {duration > 0 && <span className="kicker text-[var(--rb-text-tertiary)]">{formatTime(duration)}</span>}
      </div>

      {error && <p className="text-xs text-red-500 w-full">{error}</p>}

      {/* Controls */}
      <div className="flex items-center gap-3 w-full">
        <button onClick={() => skip(-15)} className="text-[var(--rb-text-tertiary)] hover:text-[var(--rb-text-secondary)] transition-colors" aria-label="Back 15s">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
        </button>

        <button
          onClick={togglePlay}
          disabled={!!error}
          className="w-9 h-9 rounded-full bg-[var(--rb-accent)] text-white flex items-center justify-center hover:bg-[var(--rb-accent-hover)] disabled:opacity-40 transition-colors shadow-apple-sm flex-shrink-0"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isLoading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <rect x="5" y="3" width="4" height="14" rx="1" /><rect x="11" y="3" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          )}
        </button>

        <button onClick={() => skip(30)} className="text-[var(--rb-text-tertiary)] hover:text-[var(--rb-text-secondary)] transition-colors" aria-label="Forward 30s">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
          </svg>
        </button>

        {/* Scrubber */}
        <div className="flex-1 flex items-center gap-2">
          <span className="kicker w-8 text-right flex-shrink-0">{formatTime(currentTime)}</span>
          <div className="flex-1 relative h-1.5 bg-[var(--rb-bg-sunken)] rounded-full overflow-hidden">
            <div className="absolute left-0 top-0 h-full bg-[var(--rb-accent)] rounded-full" style={{ width: `${progress}%` }} />
            <input
              type="range" min={0} max={duration || 100} step={0.1} value={currentTime}
              onChange={handleScrub}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Audio scrubber"
            />
          </div>
          <span className="kicker w-8 flex-shrink-0">{formatTime(duration)}</span>
        </div>

        {/* Speed */}
        <div className="flex items-center gap-0.5">
          {SPEED_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSpeedChange(s)}
              className={`px-1.5 py-0.5 rounded text-xs font-mono font-semibold transition-colors ${
                speed === s ? "bg-[var(--rb-accent)] text-white" : "text-[var(--rb-text-tertiary)] hover:text-[var(--rb-text-secondary)] hover:bg-[var(--rb-bg-sunken)]"
              }`}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

      {transcriptUrl && (
        <a href={transcriptUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--rb-accent)] hover:underline w-full">
          View transcript →
        </a>
      )}
    </div>
  );
}

export default InlineAudioPlayer;
