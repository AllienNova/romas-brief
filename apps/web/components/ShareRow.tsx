"use client";

/**
 * ShareRow — Web Share API + desktop fallback
 * "Useful / Not useful" feedback widget
 * Audio cross-platform subscribe row
 */

import { useState } from "react";
import { ThumbsUpIcon, ThumbsDownIcon, HeadphonesIcon, MusicNoteIcon, RssIcon, CloudIcon } from "./icons";
import type { FC } from "react";
import type { IconProps } from "./icons";

interface ShareRowProps {
  title: string;
  slug: string;
  showFeedback?: boolean;
  showAudioSubscribe?: boolean;
}

const BASE_URL = "https://romasbrief.vercel.app";

export default function ShareRow({
  title,
  slug,
  showFeedback = true,
  showAudioSubscribe = false,
}: ShareRowProps) {
  const [feedbackGiven, setFeedbackGiven] = useState<"useful" | "not_useful" | null>(null);
  const [copied, setCopied] = useState(false);

  const url = `${BASE_URL}/article/${slug}`;

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url, text: `${title} — ROMAS Brief` });
      } catch {
        // User cancelled or error — fall through silently
      }
    } else {
      // Desktop fallback: copy to clipboard
      await copyLink();
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  }

  function handleFeedback(value: "useful" | "not_useful") {
    setFeedbackGiven(value);
    // In production: POST to /api/feedback with { slug, value }
  }

  return (
    <div className="space-y-4">
      {/* Share row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider mr-1" style={{ color: "var(--rb-text-tertiary)" }}>
          Share
        </span>

        {/* Primary share button (Web Share API or copy) */}
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all hover:bg-[var(--rb-bg-raised)] active:scale-95"
          style={{ borderColor: "var(--rb-border-default)", color: "var(--rb-text-secondary)" }}
          aria-label={`Share article: ${title}`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>

        {/* Copy link */}
        <button
          onClick={copyLink}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all hover:bg-[var(--rb-bg-raised)] active:scale-95"
          style={{ borderColor: "var(--rb-border-default)", color: "var(--rb-text-secondary)" }}
          aria-label="Copy link to clipboard"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy link
            </>
          )}
        </button>

        {/* Twitter / X */}
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}&via=romasbrief`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all hover:bg-[var(--rb-bg-raised)]"
          style={{ borderColor: "var(--rb-border-default)", color: "var(--rb-text-secondary)" }}
          aria-label={`Share on X (Twitter): ${title}`}
        >
          𝕏 Post
        </a>

        {/* LinkedIn */}
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all hover:bg-[var(--rb-bg-raised)]"
          style={{ borderColor: "var(--rb-border-default)", color: "var(--rb-text-secondary)" }}
          aria-label={`Share on LinkedIn: ${title}`}
        >
          in Share
        </a>
      </div>

      {/* Useful / Not useful feedback */}
      {showFeedback && (
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--rb-text-tertiary)" }}>
            Was this useful?
          </span>
          {feedbackGiven ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: "var(--rb-accent)" }}>
              {feedbackGiven === "useful" ? <><ThumbsUpIcon size={13} /> Thanks for the feedback!</> : <><ThumbsDownIcon size={13} /> Noted — we&apos;ll improve.</>}
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFeedback("useful")}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium transition-all hover:bg-[var(--rb-bg-raised)] active:scale-95"
                style={{ borderColor: "var(--rb-border-default)", color: "var(--rb-text-secondary)" }}
                aria-label="Mark as useful"
              >
                <ThumbsUpIcon size={13} /> Useful
              </button>
              <button
                onClick={() => handleFeedback("not_useful")}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium transition-all hover:bg-[var(--rb-bg-raised)] active:scale-95"
                style={{ borderColor: "var(--rb-border-default)", color: "var(--rb-text-secondary)" }}
                aria-label="Mark as not useful"
              >
                <ThumbsDownIcon size={13} /> Not useful
              </button>
            </div>
          )}
        </div>
      )}

      {/* Audio cross-platform subscribe row */}
      {showAudioSubscribe && (
        <div
          className="flex flex-wrap items-center gap-2 pt-3 border-t"
          style={{ borderColor: "var(--rb-border-subtle)" }}
        >
          <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider mr-1" style={{ color: "var(--rb-text-tertiary)" }}>
            <HeadphonesIcon size={13} /> Subscribe on
          </span>
          {([
            { label: "Apple Podcasts", href: "https://podcasts.apple.com/podcast/romas-brief", Icon: MusicNoteIcon },
            { label: "Spotify", href: "https://open.spotify.com/show/romasbrief", Icon: HeadphonesIcon },
            { label: "RSS Feed", href: "/feeds/podcast.xml", Icon: RssIcon },
            { label: "Overcast", href: "https://overcast.fm/itunes/romasbrief", Icon: CloudIcon },
          ] as { label: string; href: string; Icon: FC<IconProps> }[]).map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all hover:bg-[var(--rb-bg-raised)]"
              style={{ borderColor: "var(--rb-border-default)", color: "var(--rb-text-secondary)" }}
              aria-label={`Subscribe on ${label}`}
            >
              <Icon size={14} /> {label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
