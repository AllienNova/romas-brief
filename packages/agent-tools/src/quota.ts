// =====================================================================
// packages/agent-tools/src/quota.ts · ROMAS Wire · ADR-0020 (S10 / T-6)
// Per-day, per-channel send quota. A runaway guard: the agent can stage
// at most `limits[channel]` sends per UTC day. LLM token spend is capped
// separately at the Vercel AI Gateway (ADR-0020 §2). Pure + store-injected.
// =====================================================================

export type QuotaChannel = "email" | "sms" | "beehiiv";

export interface QuotaLimits {
  email: number;
  sms: number;
  beehiiv: number;
}

/** Conservative launch defaults; override via env in the server entry. */
export const DEFAULT_LIMITS: QuotaLimits = { email: 50, sms: 50, beehiiv: 25 };

/** Counter store keyed by `${dayKey}:${channel}`. */
export interface QuotaStore {
  get(key: string): number;
  incr(key: string): void;
}

export class InMemoryQuotaStore implements QuotaStore {
  private readonly counts = new Map<string, number>();
  get(key: string): number {
    return this.counts.get(key) ?? 0;
  }
  incr(key: string): void {
    this.counts.set(key, this.get(key) + 1);
  }
}

/** UTC calendar day, `YYYY-MM-DD`. Caller passes the clock for testability. */
export function dayKey(now: Date): string {
  return now.toISOString().slice(0, 10);
}

function counterKey(now: Date, channel: QuotaChannel): string {
  return `${dayKey(now)}:${channel}`;
}

/** True if a new stage for `channel` is within today's limit. */
export function canStage(
  store: QuotaStore,
  limits: QuotaLimits,
  now: Date,
  channel: QuotaChannel,
): boolean {
  return store.get(counterKey(now, channel)) < limits[channel];
}

/** Record one staged send against today's counter. */
export function recordStage(
  store: QuotaStore,
  now: Date,
  channel: QuotaChannel,
): void {
  store.incr(counterKey(now, channel));
}

/** Remaining stages allowed for `channel` today (never negative). */
export function remaining(
  store: QuotaStore,
  limits: QuotaLimits,
  now: Date,
  channel: QuotaChannel,
): number {
  return Math.max(0, limits[channel] - store.get(counterKey(now, channel)));
}
