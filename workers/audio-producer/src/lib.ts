/**
 * audio-producer · pure, testable helpers (SHIP-14)
 *
 * Extracted from index.ts so the correctness-critical logic can be unit-tested
 * without a Workers runtime. No I/O, no env mutation — pure functions only.
 */

/** Default ElevenLabs model for all tiers (SHIP-14: was a magic string in index.ts). */
export const ELEVENLABS_MODEL_ID = "eleven_multilingual_v2";

/**
 * ElevenLabs retry backoff schedule (SHIP-14): 3 attempts, 2s / 8s / 30s.
 * `attempt` is 0-indexed (0 = first retry wait, 1 = second, 2 = third).
 * Replaces the dead PlayHT failover — no cross-vendor failover until Q-F (ADR-0018).
 */
export function retryBackoffMs(attempt: number): number {
  const schedule = [2000, 8000, 30000];
  return schedule[attempt] ?? 30000;
}

/** Full backoff schedule as an array (for the withRetry call site + tests). */
export const TTS_RETRY_BACKOFF_MS: readonly number[] = [2000, 8000, 30000];

/** Number of ElevenLabs attempts before giving up (SHIP-14). */
export const TTS_MAX_ATTEMPTS = 3;

/**
 * Fail-closed loudnorm gate decision (SHIP-14).
 *
 * The inline RMS approximation is NOT ITU-R BS.1770 and yields wrong LUFS that
 * still passes the [-18, -14] DB gate. So we never derive a published loudness
 * from it. If no real two-pass loudnorm endpoint is configured, the job is
 * skipped rather than published with a bogus measurement.
 *
 * @returns 'use_endpoint' when LOUDNORM_ENDPOINT is set; 'skip' otherwise.
 */
export function loudnormGateDecision(env: {
  LOUDNORM_ENDPOINT?: string | undefined;
}): "use_endpoint" | "skip" {
  const endpoint = env.LOUDNORM_ENDPOINT;
  if (typeof endpoint === "string" && endpoint.trim().length > 0) {
    return "use_endpoint";
  }
  return "skip";
}

/**
 * Embargo gate decision (SHIP-15, inviolable rule 2 defense-in-depth).
 *
 * cron-ingest already routes embargoed candidates to embargo_holds before they
 * become articles, but an article can be flagged embargoed AFTER its audio job
 * is enqueued. Before generating/publishing audio we re-check the live article
 * flag: if embargoed, skip the job with skip_reason='article_embargoed'.
 *
 * @returns 'skip' when the article is embargoed; 'proceed' otherwise.
 */
export function embargoGateDecision(article: {
  embargoed?: boolean | undefined;
}): "skip" | "proceed" {
  return article.embargoed === true ? "skip" : "proceed";
}

/** Format seconds as an SRT timestamp (HH:MM:SS,mmm). */
export function formatSrtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}
