// =====================================================================
// jellypod.ts — Jellypod API client (grounded against jellypod.com/docs/api,
// 2026-06-03). Base https://api.jellypod.com/v1, Bearer sk_ auth. Script-mode
// generation + polling for the rendered MP3. Reusable by the audio-producer
// failover path (ADR-0018) too.
// =====================================================================
import type { JellypodScript } from "./script.ts";

export interface JellypodEnv {
  JELLYPOD_API_KEY: string;
  JELLYPOD_PODCAST_ID: string;
}

const BASE = "https://api.jellypod.com/v1";

function headers(env: JellypodEnv): Record<string, string> {
  return {
    Authorization: `Bearer ${env.JELLYPOD_API_KEY}`,
    "Content-Type": "application/json",
  };
}

/** POST /episodes/generate (script mode) → episode id. */
export async function generateEpisode(env: JellypodEnv, script: JellypodScript): Promise<string> {
  const res = await fetch(`${BASE}/episodes/generate`, {
    method: "POST",
    headers: headers(env),
    body: JSON.stringify({ podcast_id: env.JELLYPOD_PODCAST_ID, script }),
  });
  if (!res.ok) {
    throw new Error(`[jellypod] generate HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const data = (await res.json()) as { id?: string; episode_id?: string };
  const episodeId = data.id ?? data.episode_id;
  if (!episodeId) throw new Error("[jellypod] generate returned no episode id");
  return episodeId;
}

export interface EpisodeStatus {
  ready: boolean;
  downloadUrl: string | undefined;
  durationSec: number | undefined;
}

/**
 * GET /episodes/{id}. The docs state completion is signalled by the response
 * carrying the download URL(s); the exact field name is not pinned in the public
 * reference, so we accept the common shapes defensively (and log if none match).
 */
export async function getEpisode(env: JellypodEnv, episodeId: string): Promise<EpisodeStatus> {
  const res = await fetch(`${BASE}/episodes/${encodeURIComponent(episodeId)}`, {
    headers: headers(env),
  });
  if (!res.ok) {
    throw new Error(`[jellypod] get HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const data = (await res.json()) as Record<string, unknown>;
  const audio = data["audio"] as { url?: string } | undefined;
  const downloadUrls = data["download_urls"];
  const url =
    (data["audio_url"] as string | undefined) ??
    (data["download_url"] as string | undefined) ??
    audio?.url ??
    (Array.isArray(downloadUrls) ? (downloadUrls[0] as string | undefined) : undefined);
  const durationSec =
    (data["duration_sec"] as number | undefined) ?? (data["duration"] as number | undefined);
  return { ready: Boolean(url), downloadUrl: url, durationSec };
}

export interface PollOptions {
  intervalMs?: number;
  timeoutMs?: number;
}

/** Poll GET /episodes/{id} until the download URL appears or timeout. */
export async function pollEpisode(
  env: JellypodEnv,
  episodeId: string,
  opts: PollOptions = {},
): Promise<{ downloadUrl: string; durationSec: number | undefined }> {
  const interval = opts.intervalMs ?? 15_000;
  const timeout = opts.timeoutMs ?? 25 * 60_000;
  const deadline = Date.now() + timeout;
  for (;;) {
    const status = await getEpisode(env, episodeId);
    if (status.ready && status.downloadUrl) {
      return { downloadUrl: status.downloadUrl, durationSec: status.durationSec };
    }
    if (Date.now() >= deadline) {
      throw new Error(`[jellypod] episode ${episodeId} not ready after ${timeout}ms`);
    }
    await new Promise((r) => setTimeout(r, interval));
  }
}

/** Download the rendered MP3 bytes from the episode download URL. */
export async function downloadAudio(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`[jellypod] download HTTP ${res.status}`);
  return res.arrayBuffer();
}
