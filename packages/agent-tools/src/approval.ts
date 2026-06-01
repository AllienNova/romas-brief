// =====================================================================
// packages/agent-tools/src/approval.ts · ROMAS Wire · ADR-0020 (S3 / T-2)
// The human-approval gate. THE security property of the agent layer:
//
//   - The agent can only STAGE a send. stageSend() persists a pending
//     record and returns an id. It never contacts a provider.
//   - executeApproved() requires the operator token (ROMAS_APPROVAL_TOKEN),
//     constant-time compared. A wrong/absent token NEVER runs the executor
//     and NEVER mutates the store.
//   - The token lives only in the operator's environment. It is NOT in the
//     agent's env/context (S4), and no MCP tool exposes approval — so the
//     LLM structurally cannot approve its own sends.
//   - Staged payloads carry NO secrets; the executor injects credentials
//     from operator env at approval time.
// Pure + store-injected for full unit testing.
// =====================================================================

import { randomUUID } from "node:crypto";

export type SendChannel = "email" | "sms" | "beehiiv";

/** Public view of a staged send — safe to list/log (no payload, no secrets). */
export interface StagedSend {
  id: string;
  channel: SendChannel;
  summary: string;
  recipientCount: number;
  createdAt: string;
}

/** Internal record: public view + the non-secret payload to execute later. */
export interface StagedRecord<P = unknown> extends StagedSend {
  payload: P;
}

export interface StagedStore {
  put(record: StagedRecord): void;
  get(id: string): StagedRecord | undefined;
  delete(id: string): void;
  list(): StagedSend[];
}

export class InMemoryStagedStore implements StagedStore {
  private readonly records = new Map<string, StagedRecord>();
  put(record: StagedRecord): void {
    this.records.set(record.id, record);
  }
  get(id: string): StagedRecord | undefined {
    return this.records.get(id);
  }
  delete(id: string): void {
    this.records.delete(id);
  }
  list(): StagedSend[] {
    return [...this.records.values()].map(({ payload: _payload, ...view }) => view);
  }
}

/**
 * Constant-time string compare. Returns false if either side is missing or
 * lengths differ (length leak only — acceptable, mirrors the verified
 * pattern in workers/beehiiv-webhook/src/sync.ts).
 */
export function tokensMatch(provided: string | undefined, expected: string | undefined): boolean {
  if (!provided || !expected) return false;
  if (provided.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < provided.length; i++) {
    mismatch |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

export interface StageInput<P> {
  channel: SendChannel;
  summary: string;
  recipientCount: number;
  payload: P;
}

/** Stage a send. Returns the public view; the agent gets the id back. */
export function stageSend<P>(
  store: StagedStore,
  now: Date,
  input: StageInput<P>,
): StagedSend {
  const record: StagedRecord<P> = {
    id: randomUUID(),
    channel: input.channel,
    summary: input.summary,
    recipientCount: input.recipientCount,
    createdAt: now.toISOString(),
    payload: input.payload,
  };
  store.put(record as StagedRecord);
  return {
    id: record.id,
    channel: record.channel,
    summary: record.summary,
    recipientCount: record.recipientCount,
    createdAt: record.createdAt,
  };
}

/** Outcome of an executor (the actual provider call). */
export interface ExecOutcome {
  ok: boolean;
  status: number;
  ref?: string;
}

export type Executor<P> = (payload: P) => Promise<ExecOutcome>;

export type ApprovalReason = "unauthorized" | "not_found" | "executed" | "failed";

export interface ApprovalResult {
  ok: boolean;
  reason: ApprovalReason;
  status?: number;
  ref?: string;
}

/**
 * Approve and execute a staged send. The ONLY path that contacts a provider.
 *   - wrong/absent token  -> { ok:false, reason:"unauthorized" }, executor NOT called, record kept
 *   - unknown id          -> { ok:false, reason:"not_found" }
 *   - executor ok         -> record deleted, { ok:true, reason:"executed" }
 *   - executor !ok        -> record kept (retryable), { ok:false, reason:"failed" }
 */
export async function executeApproved<P>(
  store: StagedStore,
  id: string,
  providedToken: string | undefined,
  expectedToken: string | undefined,
  exec: Executor<P>,
): Promise<ApprovalResult> {
  if (!tokensMatch(providedToken, expectedToken)) {
    return { ok: false, reason: "unauthorized" };
  }
  const record = store.get(id) as StagedRecord<P> | undefined;
  if (!record) return { ok: false, reason: "not_found" };

  const outcome = await exec(record.payload);
  if (!outcome.ok) {
    const failed: ApprovalResult = { ok: false, reason: "failed", status: outcome.status };
    if (outcome.ref !== undefined) failed.ref = outcome.ref;
    return failed;
  }
  store.delete(id);
  const done: ApprovalResult = { ok: true, reason: "executed", status: outcome.status };
  if (outcome.ref !== undefined) done.ref = outcome.ref;
  return done;
}
