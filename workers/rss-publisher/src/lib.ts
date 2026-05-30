/**
 * rss-publisher · pure, testable helpers (SHIP-15)
 *
 * Extracted from index.ts so the correctness-critical logic can be unit-tested
 * without a Workers runtime. No I/O, no env mutation — pure functions only.
 */

export type FeedTier =
  | "audio-brief"
  | "daily-brief"
  | "podcast"
  | "conference-brief";

/** The 4 launch feed tiers (video-podcast is Day 60, no feed yet). */
export const VALID_FEED_TIERS: readonly FeedTier[] = [
  "audio-brief",
  "daily-brief",
  "podcast",
  "conference-brief",
];

/**
 * Estimate the RSS <enclosure> byte length from audio duration (SHIP-15).
 *
 * RSS 2.0 + Apple Podcasts require a non-zero `length` (bytes). We derive it
 * from duration at the encode bitrate instead of issuing a HEAD request to R2
 * per item — the duration-based estimate is the standard deterministic
 * approach (MP3 CBR at `kbps` ≈ kbps*1000/8 bytes per second) and avoids one
 * network round-trip per feed item on every regeneration.
 *
 * @param durationSec episode duration in seconds
 * @param kbps constant bitrate of the encoded MP3 (default 128, matches encodeToMp3)
 */
export function estimateEnclosureBytes(durationSec: number, kbps = 128): number {
  if (!Number.isFinite(durationSec) || durationSec <= 0) {
    // Missing/zero duration: emit a minimal positive length rather than a
    // misleading 0 (which some podcast clients reject). 1 byte is the smallest
    // non-zero, clearly-a-placeholder value.
    return 1;
  }
  return Math.round((durationSec * kbps * 1000) / 8);
}

/** Decision for the POST /regenerate tier param. */
export type RegenerateDecision =
  | { action: "all"; tiers: readonly FeedTier[] }
  | { action: "one"; tier: FeedTier }
  | { action: "invalid"; tier: string };

/**
 * Pure decision for POST /regenerate (SHIP-15).
 *
 * - missing/empty tier  -> regenerate ALL valid tiers
 * - valid tier          -> regenerate just that one
 * - any other value     -> invalid (caller returns 400)
 */
export function regenerateDecision(tier: unknown): RegenerateDecision {
  if (tier === undefined || tier === null || tier === "") {
    return { action: "all", tiers: VALID_FEED_TIERS };
  }
  if (typeof tier === "string" && (VALID_FEED_TIERS as readonly string[]).includes(tier)) {
    return { action: "one", tier: tier as FeedTier };
  }
  return { action: "invalid", tier: String(tier) };
}
