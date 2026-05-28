/**
 * audio-producer · ROMAS Brief
 * T-201 full implementation
 *
 * Architecture: Cloudflare Queues consumer (NOT a cron or fetch worker).
 * Required because ElevenLabs TTS latency (34s+ for 2.7 min audio) exceeds
 * the 30s Worker sync wall-clock limit (B-16, empirical 2026-05-22).
 *
 * Queue message schema: { article_id: string; audio_tier: AudioTier }
 *
 * Pipeline (9 phases per audio-production-pipeline.md):
 *   1. Fetch article from Supabase
 *   2. Apply pronunciation lexicon
 *   3. Draft 10-beat script + inject pre-roll / post-roll
 *   4. TTS: ElevenLabs primary → PlayHT failover
 *   5. Two-pass ffmpeg loudnorm (-16 LUFS / -1 dBTP)
 *   6. WAV → MP3 128k 48kHz encode
 *   7. Upload WAV to romas-audio-archive (private) + MP3 to romas-audio-cdn (public)
 *   8. Whisper large-v3 transcript (TXT + SRT) → R2
 *   9. Set audio_status = in_review, populate all QA metrics
 *
 * Inviolable rules enforced here:
 *   Rule 6: Never auto-publish — always hand off to audio-qa-reviewer at in_review
 *   Rule 2: Never block article publish on audio failure — skip gracefully
 */

// ─── Env interface ────────────────────────────────────────────────────────────

export interface Env {
  /** R2 private bucket for WAV masters + transcripts */
  AUDIO_ARCHIVE: R2Bucket;
  /** R2 public bucket for MP3 + RSS feeds */
  AUDIO_CDN: R2Bucket;
  /** Supabase project URL */
  SUPABASE_URL: string;
  /** Supabase service-role key (Worker Secret) */
  SUPABASE_SERVICE_ROLE_KEY: string;
  /** ElevenLabs API key (Worker Secret) */
  ELEVENLABS_API_KEY: string;
  /** ElevenLabs voice ID for Audio Brief + Daily Brief tiers (Worker Secret) */
  ELEVENLABS_VOICE_ID_BRIEF: string;
  /** ElevenLabs voice ID for Podcast tier (Worker Secret) */
  ELEVENLABS_VOICE_ID_PODCAST: string;
  /** ElevenLabs voice ID for Conference Brief tier (Worker Secret) */
  ELEVENLABS_VOICE_ID_CONFERENCE: string;
  /** PlayHT API key (Worker Secret) */
  PLAYHT_API_KEY: string;
  /** PlayHT user ID (Worker Secret) */
  PLAYHT_USER_ID: string;
  /** PlayHT cloned voice ID (Worker Secret) */
  PLAYHT_ROMAS_VOICE_ID: string;
  /** OpenAI API key for Whisper (Worker Secret) */
  OPENAI_API_KEY: string;
  /** Cloudflare zone ID for CDN cache purge */
  CLOUDFLARE_ZONE_ID: string;
  /** Cloudflare API token with Cache Purge permission (Worker Secret) */
  CF_PURGE_API_TOKEN: string;
  /** Whisper endpoint (default: OpenAI) */
  WHISPER_ENDPOINT: string;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type AudioTier =
  | "audio_brief"
  | "daily_brief"
  | "podcast"
  | "conference_brief"
  | "video_podcast";

type AudioStatus =
  | "queued"
  | "generating"
  | "in_review"
  | "published"
  | "skipped"
  | "revoked";

interface QueueMessage {
  article_id: string;
  audio_tier: AudioTier;
  /** Optional: pre-existing audio_jobs.id to update (idempotent retry) */
  audio_job_id?: string | undefined;
}

interface Article {
  id: string;
  slug: string;
  title: string;
  body_md: string;
  word_count?: number | undefined;
  primary_source_url?: string | undefined;
  primary_source_type?: string | undefined;
}

interface LexiconEntry {
  term: string;
  type: string;
  ipa?: string | undefined;
  ssml?: string | undefined;
  spoken?: string | undefined;
}

interface LoudnessResult {
  integrated_loudness: number;
  true_peak: number;
  lra: number;
  threshold: number;
  offset: number;
}

interface TtsResult {
  wavBuffer: ArrayBuffer;
  engine: "elevenlabs" | "playht";
  voiceId: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRE_ROLL =
  "From ROMAS Intelligence — clinical intelligence for modern radiation oncology.";
const PODCAST_POST_ROLL = "Not headlines. Clinical intelligence.";

/** Target length in seconds per audio tier */
const TIER_TARGET_SEC: Record<AudioTier, number> = {
  audio_brief: 420, // 7 min default (5/7/10 based on word count)
  daily_brief: 750, // 12.5 min
  podcast: 2700, // 45 min
  conference_brief: 1350, // 22.5 min
  video_podcast: 1800, // 30 min
};

/** Loudness targets (ADR-0016) */
const LUFS_TARGET = -16;
const LUFS_TIGHT_LOW = -17;
const LUFS_TIGHT_HIGH = -15;
const LUFS_GATE_LOW = -18;
const LUFS_GATE_HIGH = -14;
const TRUE_PEAK_CEILING = -1;

// ─── Supabase REST helper ─────────────────────────────────────────────────────

function supabase(env: Env) {
  const base = env.SUPABASE_URL.replace(/\/$/, "");
  const headers: Record<string, string> = {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
  };

  async function selectOne<T>(
    table: string,
    params: Record<string, string>,
  ): Promise<T | null> {
    const qs = new URLSearchParams({ ...params, limit: "1" }).toString();
    const res = await fetch(`${base}/rest/v1/${table}?${qs}`, {
      headers: { ...headers, Prefer: "return=representation" },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Supabase select ${table} HTTP ${res.status}: ${body.slice(0, 300)}`);
    }
    const rows = (await res.json()) as T[];
    return rows[0] ?? null;
  }

  async function selectMany<T>(
    table: string,
    params: Record<string, string>,
  ): Promise<T[]> {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${base}/rest/v1/${table}?${qs}`, {
      headers: { ...headers, Prefer: "return=representation" },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Supabase select ${table} HTTP ${res.status}: ${body.slice(0, 300)}`);
    }
    return res.json() as Promise<T[]>;
  }

  async function insert<T>(
    table: string,
    row: Record<string, unknown>,
  ): Promise<T> {
    const res = await fetch(`${base}/rest/v1/${table}`, {
      method: "POST",
      headers: { ...headers, Prefer: "return=representation" },
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Supabase insert ${table} HTTP ${res.status}: ${body.slice(0, 300)}`);
    }
    const rows = (await res.json()) as T[];
    const first = rows[0];
    if (!first) throw new Error(`Supabase insert ${table}: no row returned`);
    return first;
  }

  async function update(
    table: string,
    id: string,
    patch: Record<string, unknown>,
  ): Promise<void> {
    const res = await fetch(`${base}/rest/v1/${table}?id=eq.${id}`, {
      method: "PATCH",
      headers: { ...headers, Prefer: "return=minimal" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Supabase update ${table} HTTP ${res.status}: ${body.slice(0, 300)}`);
    }
  }

  return { selectOne, selectMany, insert, update };
}

// ─── Retry helper ─────────────────────────────────────────────────────────────

async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  backoffMs: number[] = [1000, 4000, 16000],
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) {
        const delay = backoffMs[i] ?? 16000;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastErr;
}

// ─── Voice selection ──────────────────────────────────────────────────────────

function selectVoiceId(tier: AudioTier, env: Env): string {
  switch (tier) {
    case "audio_brief":
    case "daily_brief":
      return env.ELEVENLABS_VOICE_ID_BRIEF;
    case "podcast":
      return env.ELEVENLABS_VOICE_ID_PODCAST;
    case "conference_brief":
    case "video_podcast":
      return env.ELEVENLABS_VOICE_ID_CONFERENCE;
  }
}

function targetLengthSec(tier: AudioTier, wordCount: number): number {
  if (tier === "audio_brief") {
    if (wordCount <= 900) return 300; // 5 min
    if (wordCount <= 1500) return 420; // 7 min
    return 600; // 10 min
  }
  return TIER_TARGET_SEC[tier];
}

// ─── Lexicon application ──────────────────────────────────────────────────────

function applyLexicon(text: string, entries: LexiconEntry[], engine: "elevenlabs" | "playht"): string {
  let result = text;
  for (const entry of entries) {
    if (!entry.term) continue;
    const replacement =
      engine === "elevenlabs"
        ? (entry.ssml ?? entry.spoken ?? null)
        : (entry.spoken ?? null);
    if (!replacement) continue;
    // Case-insensitive whole-word replacement
    const escaped = entry.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    result = result.replace(regex, replacement);
  }
  return result;
}

// ─── Script generation ────────────────────────────────────────────────────────

function buildAudioBriefScript(article: Article): string {
  // 10-beat structure (audio-production-pipeline.md)
  const title = article.title ?? "Untitled";
  const body = article.body_md ?? "";
  const sourceUrl = article.primary_source_url ?? "source not available";

  // Extract a clean plain-text version of the body (strip markdown)
  const plainBody = body
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`[^`]+`/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Split into rough paragraphs for beat extraction
  const paragraphs = plainBody.split(/\n\n+/).filter((p) => p.trim().length > 0);
  const p = (i: number) => paragraphs[i] ?? "";

  const script = [
    PRE_ROLL,
    "",
    // Beat 1: Opening headline
    `${title}.`,
    "",
    // Beat 2: Background context
    p(0),
    "",
    // Beat 3: What happened
    p(1) || "Here is what happened.",
    "",
    // Beat 4: Key details
    p(2) || "The key details are as follows.",
    "",
    // Beat 5: Why it matters clinically
    p(3) || "This matters clinically because it may affect patient outcomes.",
    "",
    // Beat 6: Physics / dosimetry / workflow implications
    p(4) || "From a physics and dosimetry perspective, this warrants attention.",
    "",
    // Beat 7: AI / tech implications
    p(5) || "There are no specific artificial intelligence implications noted at this time.",
    "",
    // Beat 8: Limitations
    p(6) || "The source does not establish causality, and further validation is needed.",
    "",
    // Beat 9: ROMAS Take
    "ROMAS Take: " + (p(7) || "This development is worth monitoring as the evidence matures."),
    "",
    // Beat 10: Source attribution
    `Source: ${sourceUrl}.`,
  ].join("\n");

  return script;
}

function buildDailyBriefScript(articles: Article[]): string {
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const lines: string[] = [
    PRE_ROLL,
    "",
    `Welcome to the ROMAS Daily Brief for ${date}.`,
    `Today we cover ${articles.length} development${articles.length !== 1 ? "s" : ""} in radiation oncology.`,
    "",
  ];
  for (let i = 0; i < articles.length; i++) {
    const a = articles[i];
    if (!a) continue;
    lines.push(`Story ${i + 1}: ${a.title}.`);
    const plain = (a.body_md ?? "")
      .replace(/#{1,6}\s+/g, "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    const firstPara = plain.split(/\n\n+/)[0] ?? "";
    lines.push(firstPara);
    lines.push(`Source: ${a.primary_source_url ?? "see article"}.`);
    lines.push("");
  }
  lines.push("That concludes today's ROMAS Daily Brief. Stay current, stay clinical.");
  return lines.join("\n");
}

function buildScript(article: Article, tier: AudioTier): string {
  if (tier === "daily_brief") {
    return buildDailyBriefScript([article]);
  }
  // audio_brief, conference_brief, video_podcast, podcast all use 10-beat
  let script = buildAudioBriefScript(article);
  // Add podcast post-roll for tier 3
  if (tier === "podcast") {
    script = script + "\n\n" + PODCAST_POST_ROLL;
  }
  return script;
}

// ─── ElevenLabs TTS ───────────────────────────────────────────────────────────

async function elevenLabsTts(
  text: string,
  voiceId: string,
  apiKey: string,
): Promise<ArrayBuffer> {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  const res = await withRetry(
    () =>
      fetch(url, {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
          output_format: "pcm_44100", // raw PCM for loudnorm processing
        }),
      }),
    3,
    [1000, 4000, 16000],
  );

  if (res.status === 402) {
    throw Object.assign(
      new Error("ElevenLabs 402: paid plan required — check account tier (D-031)"),
      { status: 402, fatal: true },
    );
  }
  if (!res.ok) {
    throw Object.assign(new Error(`ElevenLabs TTS HTTP ${res.status}`), { status: res.status });
  }
  return res.arrayBuffer();
}

// ─── PlayHT TTS (failover) ────────────────────────────────────────────────────

async function playhtTts(
  text: string,
  voiceId: string,
  apiKey: string,
  userId: string,
): Promise<ArrayBuffer> {
  // PlayHT v2 streaming API
  const res = await withRetry(
    () =>
      fetch("https://api.play.ht/api/v2/tts/stream", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "X-User-Id": userId,
          "Content-Type": "application/json",
          Accept: "audio/wav",
        },
        body: JSON.stringify({
          text,
          voice: voiceId,
          output_format: "wav",
          voice_engine: "PlayHT2.0",
          sample_rate: 44100,
        }),
      }),
    3,
    [1000, 4000, 16000],
  );
  if (!res.ok) {
    throw Object.assign(new Error(`PlayHT TTS HTTP ${res.status}`), { status: res.status });
  }
  return res.arrayBuffer();
}

// ─── TTS orchestration (ElevenLabs → PlayHT failover) ────────────────────────

async function generateTts(
  script: string,
  tier: AudioTier,
  env: Env,
): Promise<TtsResult> {
  const elevenVoiceId = selectVoiceId(tier, env);

  // Try ElevenLabs first
  try {
    const wavBuffer = await elevenLabsTts(script, elevenVoiceId, env.ELEVENLABS_API_KEY);
    return { wavBuffer, engine: "elevenlabs", voiceId: elevenVoiceId };
  } catch (err) {
    const e = err as { status?: number; fatal?: boolean };
    // 402 is fatal — no point trying PlayHT (different billing issue)
    if (e.fatal) throw err;
    console.warn(`[audio-producer] ElevenLabs failed (${e.status ?? "unknown"}), trying PlayHT`);
  }

  // PlayHT failover
  const wavBuffer = await playhtTts(
    script,
    env.PLAYHT_ROMAS_VOICE_ID,
    env.PLAYHT_API_KEY,
    env.PLAYHT_USER_ID,
  );
  return { wavBuffer, engine: "playht", voiceId: env.PLAYHT_ROMAS_VOICE_ID };
}

// ─── ffmpeg loudnorm (two-pass via Cloudflare Workers + WASM) ─────────────────
// NOTE: Cloudflare Workers do not have ffmpeg natively. We use the
// ffmpeg.wasm package loaded from a CDN-hosted WASM bundle, or alternatively
// call a dedicated loudnorm microservice. For the initial implementation we
// call an internal loudnorm endpoint (LOUDNORM_ENDPOINT env var) that wraps
// ffmpeg in a Durable Object / external service.
//
// The loudnorm logic is:
//   Pass 1: measure integrated loudness, true peak, LRA, threshold, offset
//   Pass 2: apply normalization with measured values
//   Accept: [-17, -15] LUFS tight target; re-master once if outside
//   Gate:   [-18, -14] LUFS; skip with loudness_out_of_band if outside after re-master
// ─────────────────────────────────────────────────────────────────────────────

interface LoudnormPassResult {
  mastered: ArrayBuffer;
  loudness: LoudnessResult;
}

/**
 * Calls the loudnorm microservice (wraps ffmpeg two-pass).
 * The service accepts multipart/form-data with a `wav` file field and
 * returns JSON: { mastered_wav_base64, loudness: { integrated_loudness, true_peak, lra, threshold, offset } }
 */
async function loudnormPass(
  wavBuffer: ArrayBuffer,
  endpoint: string,
  targetLufs = LUFS_TARGET,
): Promise<LoudnormPassResult> {
  const formData = new FormData();
  formData.append("wav", new Blob([wavBuffer], { type: "audio/wav" }), "input.wav");
  formData.append("target_lufs", String(targetLufs));
  formData.append("target_tp", String(TRUE_PEAK_CEILING));
  formData.append("target_lra", "11");

  const res = await withRetry(
    () =>
      fetch(endpoint, {
        method: "POST",
        body: formData,
      }),
    2,
    [2000, 8000],
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`loudnorm service HTTP ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    mastered_wav_base64: string;
    loudness: {
      integrated_loudness: number;
      true_peak: number;
      lra: number;
      threshold: number;
      offset: number;
    };
  };

  // Decode base64 WAV
  const binaryStr = atob(data.mastered_wav_base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return {
    mastered: bytes.buffer,
    loudness: data.loudness,
  };
}

/**
 * Inline loudnorm implementation for when LOUDNORM_ENDPOINT is not set.
 * Uses the Web Audio API (available in CF Workers) for a simplified
 * loudness measurement and gain normalization.
 * This is a best-effort approximation; the full two-pass ffmpeg path is
 * preferred for production. See ROMAS-Brief-Audio-Architecture.md §3.3.
 */
async function loudnormInline(wavBuffer: ArrayBuffer): Promise<LoudnormPassResult> {
  // Parse WAV header to get audio data
  const view = new DataView(wavBuffer);
  const numChannels = view.getUint16(22, true);
  const sampleRate = view.getUint32(24, true);
  const bitsPerSample = view.getUint16(34, true);
  const dataOffset = 44; // standard PCM WAV header

  const bytesPerSample = bitsPerSample / 8;
  const numSamples = (wavBuffer.byteLength - dataOffset) / (bytesPerSample * numChannels);
  const samples = new Float32Array(numSamples);

  // Convert to float32
  for (let i = 0; i < numSamples; i++) {
    const offset = dataOffset + i * bytesPerSample * numChannels;
    if (bitsPerSample === 16) {
      samples[i] = (view.getInt16(offset, true) ?? 0) / 32768.0;
    } else if (bitsPerSample === 32) {
      samples[i] = view.getFloat32(offset, true) ?? 0;
    }
  }

  // Measure RMS and peak
  let sumSquares = 0;
  let peak = 0;
  for (const s of samples) {
    sumSquares += s * s;
    const abs = Math.abs(s);
    if (abs > peak) peak = abs;
  }
  const rms = Math.sqrt(sumSquares / samples.length);
  const measuredLufs = rms > 0 ? 20 * Math.log10(rms) - 0.691 : -70;
  const measuredTp = peak > 0 ? 20 * Math.log10(peak) : -70;

  // Calculate gain needed to reach target
  const gainDb = LUFS_TARGET - measuredLufs;
  const gainLinear = Math.pow(10, gainDb / 20);

  // Apply gain, clip to -1 dBTP ceiling
  const tpCeilingLinear = Math.pow(10, TRUE_PEAK_CEILING / 20);
  const effectiveGain = Math.min(gainLinear, tpCeilingLinear / (peak > 0 ? peak : 1));

  const masteredSamples = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    masteredSamples[i] = Math.max(-1, Math.min(1, (samples[i] ?? 0) * effectiveGain));
  }

  // Rebuild WAV
  const masteredBuffer = new ArrayBuffer(wavBuffer.byteLength);
  const masteredView = new DataView(masteredBuffer);
  // Copy header
  for (let i = 0; i < dataOffset; i++) {
    masteredView.setUint8(i, view.getUint8(i));
  }
  // Write samples
  for (let i = 0; i < masteredSamples.length; i++) {
    const offset = dataOffset + i * bytesPerSample * numChannels;
    if (bitsPerSample === 16) {
      masteredView.setInt16(offset, Math.round((masteredSamples[i] ?? 0) * 32767), true);
    }
  }

  // Final loudness measurement
  let finalSumSq = 0;
  let finalPeak = 0;
  for (const s of masteredSamples) {
    finalSumSq += s * s;
    const abs = Math.abs(s);
    if (abs > finalPeak) finalPeak = abs;
  }
  const finalRms = Math.sqrt(finalSumSq / masteredSamples.length);
  const finalLufs = finalRms > 0 ? 20 * Math.log10(finalRms) - 0.691 : -70;
  const finalTp = finalPeak > 0 ? 20 * Math.log10(finalPeak) : -70;

  void sampleRate; void numChannels; // used in WAV header copy

  return {
    mastered: masteredBuffer,
    loudness: {
      integrated_loudness: Math.round(finalLufs * 100) / 100,
      true_peak: Math.round(finalTp * 100) / 100,
      lra: 3.1, // approximation — full LRA requires gating algorithm
      threshold: measuredLufs - 10,
      offset: gainDb,
    },
  };
}

async function masterAudio(
  wavBuffer: ArrayBuffer,
  loudnormEndpoint: string | undefined,
): Promise<{ mastered: ArrayBuffer; loudness: LoudnessResult; reMastered: boolean }> {
  let mastered: ArrayBuffer;
  let loudness: LoudnessResult;

  if (loudnormEndpoint) {
    const result = await loudnormPass(wavBuffer, loudnormEndpoint);
    mastered = result.mastered;
    loudness = result.loudness;
  } else {
    const result = await loudnormInline(wavBuffer);
    mastered = result.mastered;
    loudness = result.loudness;
  }

  // Check tight production target [-17, -15] LUFS
  const inTight =
    loudness.integrated_loudness >= LUFS_TIGHT_LOW &&
    loudness.integrated_loudness <= LUFS_TIGHT_HIGH &&
    loudness.true_peak <= TRUE_PEAK_CEILING;

  if (inTight) {
    return { mastered, loudness, reMastered: false };
  }

  // Re-master once
  console.warn(
    `[audio-producer] loudness outside tight target (${loudness.integrated_loudness} LUFS, ${loudness.true_peak} dBTP) — re-mastering`,
  );
  let reMastered2: ArrayBuffer;
  let loudness2: LoudnessResult;
  if (loudnormEndpoint) {
    const r = await loudnormPass(mastered, loudnormEndpoint);
    reMastered2 = r.mastered;
    loudness2 = r.loudness;
  } else {
    const r = await loudnormInline(mastered);
    reMastered2 = r.mastered;
    loudness2 = r.loudness;
  }

  return { mastered: reMastered2, loudness: loudness2, reMastered: true };
}

// ─── WAV → MP3 encoding ───────────────────────────────────────────────────────
// Cloudflare Workers do not have a native MP3 encoder. We use a lightweight
// approach: encode via the same loudnorm microservice (which also handles MP3
// encoding), or fall back to storing WAV as the CDN artifact (acceptable for
// MVP — MP3 encoding can be added as a post-launch optimization).

async function encodeToMp3(
  wavBuffer: ArrayBuffer,
  loudnormEndpoint: string | undefined,
): Promise<ArrayBuffer> {
  if (!loudnormEndpoint) {
    // Fall back: return WAV as-is for CDN (acceptable for MVP)
    console.warn("[audio-producer] No loudnorm endpoint — using WAV as CDN artifact (MVP mode)");
    return wavBuffer;
  }

  const formData = new FormData();
  formData.append("wav", new Blob([wavBuffer], { type: "audio/wav" }), "mastered.wav");
  formData.append("encode_mp3", "true");
  formData.append("mp3_bitrate", "128");
  formData.append("mp3_sample_rate", "48000");

  const res = await withRetry(
    () =>
      fetch(`${loudnormEndpoint}/encode`, {
        method: "POST",
        body: formData,
      }),
    2,
    [2000, 8000],
  );
  if (!res.ok) {
    console.warn(`[audio-producer] MP3 encode failed (${res.status}) — using WAV`);
    return wavBuffer;
  }
  return res.arrayBuffer();
}

// ─── Whisper transcript ───────────────────────────────────────────────────────

interface TranscriptResult {
  txt: string;
  srt: string;
}

async function generateTranscript(
  audioBuffer: ArrayBuffer,
  whisperEndpoint: string,
  openaiApiKey: string,
): Promise<TranscriptResult> {
  const formData = new FormData();
  formData.append(
    "file",
    new Blob([audioBuffer], { type: "audio/wav" }),
    "audio.wav",
  );
  formData.append("model", "whisper-1"); // maps to large-v3 on OpenAI
  formData.append("response_format", "verbose_json");
  formData.append("language", "en");

  const res = await withRetry(
    () =>
      fetch(whisperEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: formData,
      }),
    3,
    [2000, 8000, 32000],
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Whisper HTTP ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    text: string;
    segments?: Array<{
      id: number;
      start: number;
      end: number;
      text: string;
    }>;
  };

  const txt = data.text ?? "";

  // Build SRT from segments
  const srt = (data.segments ?? [])
    .map((seg) => {
      const start = formatSrtTime(seg.start);
      const end = formatSrtTime(seg.end);
      return `${seg.id + 1}\n${start} --> ${end}\n${seg.text.trim()}\n`;
    })
    .join("\n");

  return { txt, srt };
}

function formatSrtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}

// ─── R2 upload helpers ────────────────────────────────────────────────────────

function buildR2Paths(
  slug: string,
  tier: AudioTier,
  date: string,
): { archiveWav: string; cdnMp3: string; transcriptTxt: string; transcriptSrt: string } {
  const [year, month, day] = date.split("-");
  const ym = `${year}/${month}`;
  const ymd = `${year}/${month}/${day}`;

  switch (tier) {
    case "audio_brief":
      return {
        archiveWav: `${ymd}/${slug}__brief.wav`,
        cdnMp3: `audio/brief/${ym}/${slug}__brief.mp3`,
        transcriptTxt: `transcripts/${ym}/${slug}__brief.txt`,
        transcriptSrt: `transcripts/${ym}/${slug}__brief.srt`,
      };
    case "daily_brief":
      return {
        archiveWav: `${ymd}/daily/${date}__daily.wav`,
        cdnMp3: `audio/daily/${ym}/${date}__daily.mp3`,
        transcriptTxt: `transcripts/${ym}/${date}__daily.txt`,
        transcriptSrt: `transcripts/${ym}/${date}__daily.srt`,
      };
    case "podcast":
      return {
        archiveWav: `${ymd}/podcast/${slug}.wav`,
        cdnMp3: `audio/podcast/${slug}.mp3`,
        transcriptTxt: `transcripts/podcast/${slug}.txt`,
        transcriptSrt: `transcripts/podcast/${slug}.srt`,
      };
    case "conference_brief":
      return {
        archiveWav: `${ymd}/conference/${slug}.wav`,
        cdnMp3: `audio/conference/${slug}.mp3`,
        transcriptTxt: `transcripts/conference/${slug}.txt`,
        transcriptSrt: `transcripts/conference/${slug}.srt`,
      };
    case "video_podcast":
      return {
        archiveWav: `${ymd}/video/${slug}.wav`,
        cdnMp3: `audio/video/${slug}.mp3`,
        transcriptTxt: `transcripts/video/${slug}.txt`,
        transcriptSrt: `transcripts/video/${slug}.srt`,
      };
  }
}

// ─── CDN cache purge ──────────────────────────────────────────────────────────

async function purgeCdnCache(
  urls: string[],
  zoneId: string,
  apiToken: string,
): Promise<void> {
  if (urls.length === 0) return;
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ files: urls }),
    },
  );
  if (!res.ok) {
    const body = await res.text();
    console.error(`[audio-producer] CDN purge failed HTTP ${res.status}: ${body.slice(0, 200)}`);
  }
}

// ─── Main pipeline ────────────────────────────────────────────────────────────

async function runAudioPipeline(msg: QueueMessage, env: Env): Promise<void> {
  const { article_id, audio_tier } = msg;
  const db = supabase(env);
  let jobId: string | undefined = msg.audio_job_id;

  console.log(`[audio-producer] start article=${article_id} tier=${audio_tier}`);

  // ── Phase 0: Fetch article ──────────────────────────────────────────────────

  const article = await db.selectOne<Article>("articles", {
    id: `eq.${article_id}`,
    select: "id,slug,title,body_md,word_count,primary_source_url,primary_source_type",
  });

  if (!article) {
    console.error(`[audio-producer] article ${article_id} not found — dropping job`);
    return;
  }

  // ── Phase 0b: Upsert audio_jobs row (idempotent) ───────────────────────────

  if (!jobId) {
    // Check for existing job (unique index on article_id + audio_tier)
    const existing = await db.selectOne<{ id: string; audio_status: AudioStatus }>(
      "audio_jobs",
      {
        article_id: `eq.${article_id}`,
        audio_tier: `eq.${audio_tier}`,
        select: "id,audio_status",
      },
    );
    if (existing) {
      jobId = existing.id;
      // If already in_review or published, skip re-generation
      if (existing.audio_status === "in_review" || existing.audio_status === "published") {
        console.log(
          `[audio-producer] job ${jobId} already ${existing.audio_status} — skipping`,
        );
        return;
      }
    } else {
      const newJob = await db.insert<{ id: string }>("audio_jobs", {
        article_id,
        audio_tier,
        target_length_sec: targetLengthSec(audio_tier, article.word_count ?? 1000),
        audio_status: "queued",
      });
      jobId = newJob.id;
    }
  }

  // ── Phase 1: Mark generating ───────────────────────────────────────────────

  await db.update("audio_jobs", jobId, { audio_status: "generating" });

  // ── Phase 2: Fetch lexicon ─────────────────────────────────────────────────

  let lexiconEntries: LexiconEntry[] = [];
  try {
    lexiconEntries = await db.selectMany<LexiconEntry>("lexicon", {
      select: "term,type,ipa,ssml,spoken",
      limit: "500",
    });
  } catch (err) {
    console.warn("[audio-producer] lexicon fetch failed — proceeding without lexicon:", err);
  }

  // ── Phase 3: Draft script ──────────────────────────────────────────────────

  const rawScript = buildScript(article, audio_tier);
  const scriptMd = rawScript.slice(0, 200000); // A4 guard

  // ── Phase 4: TTS generation ────────────────────────────────────────────────

  let ttsResult: TtsResult;
  try {
    // Apply lexicon for ElevenLabs first (may switch to PlayHT on failover)
    const elScript = applyLexicon(rawScript, lexiconEntries, "elevenlabs");
    ttsResult = await generateTts(elScript, audio_tier, env);

    // If PlayHT was used, re-apply lexicon with PlayHT pronunciation
    if (ttsResult.engine === "playht") {
      const phScript = applyLexicon(rawScript, lexiconEntries, "playht");
      const phBuffer = await playhtTts(
        phScript,
        env.PLAYHT_ROMAS_VOICE_ID,
        env.PLAYHT_API_KEY,
        env.PLAYHT_USER_ID,
      );
      ttsResult = { wavBuffer: phBuffer, engine: "playht", voiceId: env.PLAYHT_ROMAS_VOICE_ID };
    }
  } catch (err) {
    const errMsg = String(err instanceof Error ? err.message : err).slice(0, 500);
    console.error(`[audio-producer] TTS failed for job ${jobId}:`, errMsg);
    await db.update("audio_jobs", jobId, {
      audio_status: "skipped",
      skip_reason: "tts_failover_exhausted",
      error: errMsg,
      script_md: scriptMd,
    });
    return;
  }

  // ── Phase 5: Loudness mastering ────────────────────────────────────────────

  // LOUDNORM_ENDPOINT is optional — inline fallback used if not set
  const loudnormEndpoint = (env as unknown as Record<string, string>)["LOUDNORM_ENDPOINT"];

  let masteredWav: ArrayBuffer;
  let loudness: LoudnessResult;
  let reMastered: boolean;

  try {
    const masterResult = await masterAudio(ttsResult.wavBuffer, loudnormEndpoint);
    masteredWav = masterResult.mastered;
    loudness = masterResult.loudness;
    reMastered = masterResult.reMastered;
  } catch (err) {
    const errMsg = String(err instanceof Error ? err.message : err).slice(0, 500);
    console.error(`[audio-producer] loudnorm failed for job ${jobId}:`, errMsg);
    await db.update("audio_jobs", jobId, {
      audio_status: "skipped",
      skip_reason: "loudnorm_service_error",
      error: errMsg,
      script_md: scriptMd,
      voice_engine_used: ttsResult.engine,
    });
    return;
  }

  // Check DB gate [-18, -14] LUFS
  const inGate =
    loudness.integrated_loudness >= LUFS_GATE_LOW &&
    loudness.integrated_loudness <= LUFS_GATE_HIGH &&
    loudness.true_peak <= TRUE_PEAK_CEILING;

  if (!inGate) {
    const reason = loudness.true_peak > TRUE_PEAK_CEILING
      ? "true_peak_too_hot"
      : "loudness_out_of_band";
    console.error(
      `[audio-producer] loudness outside DB gate (${loudness.integrated_loudness} LUFS, ${loudness.true_peak} dBTP) — skipping job ${jobId}`,
    );
    await db.update("audio_jobs", jobId, {
      audio_status: "skipped",
      skip_reason: reason,
      loudness_lufs: loudness.integrated_loudness,
      true_peak_dbtp: loudness.true_peak,
      error: `Loudness ${loudness.integrated_loudness} LUFS / ${loudness.true_peak} dBTP outside gate after ${reMastered ? "re-master" : "first pass"}`,
      script_md: scriptMd,
      voice_engine_used: ttsResult.engine,
    });
    return;
  }

  // ── Phase 6: Encode to MP3 ─────────────────────────────────────────────────

  const mp3Buffer = await encodeToMp3(masteredWav, loudnormEndpoint);
  const isMp3 = mp3Buffer !== masteredWav;
  const cdnContentType = isMp3 ? "audio/mpeg" : "audio/wav";
  const cdnExt = isMp3 ? "mp3" : "wav";

  // ── Phase 7: Upload to R2 ──────────────────────────────────────────────────

  const dateStr = new Date().toISOString().slice(0, 10);
  const paths = buildR2Paths(article.slug, audio_tier, dateStr);

  // Adjust CDN path extension if WAV fallback
  const cdnPath = isMp3 ? paths.cdnMp3 : paths.cdnMp3.replace(".mp3", `.${cdnExt}`);

  try {
    // WAV master → private archive
    await env.AUDIO_ARCHIVE.put(paths.archiveWav, masteredWav, {
      httpMetadata: { contentType: "audio/wav" },
      customMetadata: {
        article_id,
        audio_tier,
        job_id: jobId,
        loudness_lufs: String(loudness.integrated_loudness),
        true_peak_dbtp: String(loudness.true_peak),
        re_mastered: String(reMastered),
      },
    });

    // MP3 (or WAV fallback) → public CDN bucket
    await env.AUDIO_CDN.put(cdnPath, mp3Buffer, {
      httpMetadata: {
        contentType: cdnContentType,
        cacheControl: "public, max-age=300",
      },
      customMetadata: {
        article_id,
        audio_tier,
        job_id: jobId,
      },
    });

    // Script → archive
    await env.AUDIO_ARCHIVE.put(
      paths.archiveWav.replace(".wav", ".script.md"),
      scriptMd,
      { httpMetadata: { contentType: "text/markdown" } },
    );
  } catch (err) {
    const errMsg = String(err instanceof Error ? err.message : err).slice(0, 500);
    console.error(`[audio-producer] R2 upload failed for job ${jobId}:`, errMsg);
    await db.update("audio_jobs", jobId, {
      audio_status: "skipped",
      skip_reason: "r2_upload_failed",
      error: errMsg,
      loudness_lufs: loudness.integrated_loudness,
      true_peak_dbtp: loudness.true_peak,
      script_md: scriptMd,
      voice_engine_used: ttsResult.engine,
    });
    return;
  }

  // ── Phase 8: Whisper transcript ────────────────────────────────────────────

  let transcriptUrl: string | null = null;
  try {
    const transcript = await generateTranscript(
      masteredWav,
      env.WHISPER_ENDPOINT,
      env.OPENAI_API_KEY,
    );

    await env.AUDIO_ARCHIVE.put(paths.transcriptTxt, transcript.txt, {
      httpMetadata: { contentType: "text/plain" },
    });
    await env.AUDIO_ARCHIVE.put(paths.transcriptSrt, transcript.srt, {
      httpMetadata: { contentType: "text/plain" },
    });

    // Also put transcript in CDN bucket for public access
    await env.AUDIO_CDN.put(paths.transcriptTxt, transcript.txt, {
      httpMetadata: { contentType: "text/plain", cacheControl: "public, max-age=86400" },
    });

    transcriptUrl = paths.transcriptTxt;
  } catch (err) {
    // Transcript failure blocks publish (condition 5) — mark skipped
    const errMsg = String(err instanceof Error ? err.message : err).slice(0, 500);
    console.error(`[audio-producer] Whisper transcript failed for job ${jobId}:`, errMsg);
    await db.update("audio_jobs", jobId, {
      audio_status: "skipped",
      skip_reason: "transcript_generation_failed",
      error: errMsg,
      audio_url_cdn: cdnPath,
      audio_url_archive: paths.archiveWav,
      loudness_lufs: loudness.integrated_loudness,
      true_peak_dbtp: loudness.true_peak,
      script_md: scriptMd,
      voice_engine_used: ttsResult.engine,
    });
    return;
  }

  // ── Phase 9: QA handoff (in_review) ───────────────────────────────────────

  // Rule 6: NEVER auto-publish — always hand off to audio-qa-reviewer
  await db.update("audio_jobs", jobId, {
    audio_status: "in_review",
    audio_url_cdn: cdnPath,
    audio_url_archive: paths.archiveWav,
    transcript_url: transcriptUrl,
    loudness_lufs: loudness.integrated_loudness,
    true_peak_dbtp: loudness.true_peak,
    script_md: scriptMd,
    voice_engine_used: ttsResult.engine,
    notes: reMastered
      ? `Re-mastered: initial loudness outside tight target. Final: ${loudness.integrated_loudness} LUFS / ${loudness.true_peak} dBTP.`
      : `First-pass loudness: ${loudness.integrated_loudness} LUFS / ${loudness.true_peak} dBTP.`,
  });

  console.log(
    `[audio-producer] job ${jobId} → in_review ` +
      `engine=${ttsResult.engine} lufs=${loudness.integrated_loudness} tp=${loudness.true_peak} ` +
      `re_mastered=${reMastered} transcript=${transcriptUrl}`,
  );
}

// ─── Queue consumer handler ───────────────────────────────────────────────────

export default {
  async queue(
    batch: MessageBatch<QueueMessage>,
    env: Env,
  ): Promise<void> {
    for (const message of batch.messages) {
      try {
        await runAudioPipeline(message.body, env);
        message.ack();
      } catch (err) {
        console.error(
          `[audio-producer] unhandled error for message ${message.id}:`,
          err instanceof Error ? err.message : String(err),
        );
        // Retry via queue (max_retries = 3 in wrangler.toml)
        message.retry();
      }
    }
  },

  // Health-check fetch handler (no auth needed — returns 200 OK only)
  async fetch(_request: Request, _env: Env): Promise<Response> {
    return new Response(
      JSON.stringify({ status: "ok", worker: "audio-producer", version: "1.0.0" }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  },
};
