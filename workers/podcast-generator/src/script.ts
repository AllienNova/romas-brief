// =====================================================================
// script.ts — pure builder: ROMAS episode content → Jellypod script payload.
// Grounded against jellypod.com/docs/api (2026-06-03): script = chapters[] →
// segments[] {host_id, text ≤5000, speed 0.5–2}; limits ≤50 chapters,
// ≤200 segments/chapter, ≤600 total segments, ≤75,000 total chars. No I/O —
// the worker submits the result to POST /episodes/generate.
// =====================================================================
export const SEGMENT_MAX_CHARS = 5000;
export const MAX_CHAPTERS = 50;
export const MAX_SEGMENTS_PER_CHAPTER = 200;
export const MAX_TOTAL_SEGMENTS = 600;
export const MAX_TOTAL_CHARS = 75_000;

/** One host turn of ROMAS episode content (pre-chunking). */
export interface Turn {
  hostId: string;
  text: string;
  speed?: number;
}
export interface ChapterInput {
  title: string;
  turns: Turn[];
}
export interface EpisodeInput {
  chapters: ChapterInput[];
}

/** Jellypod wire shape (snake_case per the API). */
export interface JellypodSegment {
  host_id: string;
  text: string;
  speed?: number;
}
export interface JellypodChapter {
  title: string;
  segments: JellypodSegment[];
}
export interface JellypodScript {
  chapters: JellypodChapter[];
}

export class ScriptError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScriptError";
  }
}

/** Split text into ≤max-char chunks on sentence/whitespace boundaries (never mid-word). */
export function chunkText(text: string, max = SEGMENT_MAX_CHARS): string[] {
  const t = text.trim();
  if (t.length <= max) return t ? [t] : [];
  const chunks: string[] = [];
  let rest = t;
  while (rest.length > max) {
    let cut = rest.lastIndexOf(". ", max);
    if (cut < max * 0.6) cut = rest.lastIndexOf(" ", max);
    if (cut <= 0) cut = max; // no boundary in range → hard cut
    else cut += 1; // include the boundary char
    chunks.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) chunks.push(rest);
  return chunks;
}

/**
 * Build + validate the Jellypod script from ROMAS episode input. Long turns are
 * chunked into multiple segments; all Jellypod limits are enforced (throws
 * ScriptError on violation so a bad episode never reaches the paid API).
 */
export function buildScript(input: EpisodeInput): JellypodScript {
  if (!input.chapters || input.chapters.length === 0) {
    throw new ScriptError("episode has no chapters");
  }
  if (input.chapters.length > MAX_CHAPTERS) {
    throw new ScriptError(`episode has >${MAX_CHAPTERS} chapters`);
  }

  let totalSegments = 0;
  let totalChars = 0;

  const chapters: JellypodChapter[] = input.chapters.map((ch) => {
    const segments: JellypodSegment[] = [];
    for (const turn of ch.turns) {
      const hostId = turn.hostId?.trim();
      if (!hostId) throw new ScriptError(`segment missing hostId in chapter "${ch.title}"`);
      if (turn.speed !== undefined && (turn.speed < 0.5 || turn.speed > 2)) {
        throw new ScriptError(`speed ${turn.speed} out of [0.5, 2] in chapter "${ch.title}"`);
      }
      for (const text of chunkText(turn.text)) {
        const seg: JellypodSegment = { host_id: hostId, text };
        if (turn.speed !== undefined) seg.speed = turn.speed;
        segments.push(seg);
        totalChars += text.length;
      }
    }
    if (segments.length > MAX_SEGMENTS_PER_CHAPTER) {
      throw new ScriptError(`chapter "${ch.title}" has >${MAX_SEGMENTS_PER_CHAPTER} segments`);
    }
    totalSegments += segments.length;
    return { title: ch.title.slice(0, 200), segments };
  });

  if (totalSegments > MAX_TOTAL_SEGMENTS) {
    throw new ScriptError(`episode has >${MAX_TOTAL_SEGMENTS} total segments`);
  }
  if (totalChars > MAX_TOTAL_CHARS) {
    throw new ScriptError(`episode has >${MAX_TOTAL_CHARS} total characters`);
  }
  return { chapters };
}
