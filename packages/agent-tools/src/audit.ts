// =====================================================================
// packages/agent-tools/src/audit.ts · ROMAS Wire · ADR-0020 (S7 / T-3)
// Append-only, PII-minimized audit trail for the agent layer.
//
// Every agent action (stage / read / quota-block) and every operator
// action (approve / execute / deny) is recorded as one redacted JSON
// line. Secrets are never written; recipient PII is masked (TCPA/GDPR).
// Pure + sink-injected so it is fully unit-testable.
// =====================================================================

export type AuditChannel = "email" | "sms" | "beehiiv" | "content";
export type AuditAction =
  | "stage"
  | "approve"
  | "execute"
  | "deny"
  | "read"
  | "quota_block";
export type AuditActor = "agent" | "operator";

export interface AuditEvent {
  ts: string; // ISO 8601
  actor: AuditActor;
  action: AuditAction;
  channel: AuditChannel;
  detail: Record<string, unknown>;
}

/** A destination for audit lines. Production: append to a file/stream. */
export interface AuditSink {
  write(line: string): void;
}

/** Collects lines in memory — for tests and ephemeral runs. */
export class InMemoryAuditSink implements AuditSink {
  readonly lines: string[] = [];
  write(line: string): void {
    this.lines.push(line);
  }
}

/** Keys whose values are secrets and must never be persisted. */
const SECRET_KEY = /(token|secret|api[_-]?key|authorization|bearer|password)/i;
const REDACTED = "[REDACTED]";

/**
 * Mask an email to first char + domain: `d***@example.com`.
 * Non-emails pass through to {@link maskShort}.
 */
export function maskEmail(value: string): string {
  const at = value.indexOf("@");
  if (at <= 0) return maskShort(value);
  const first = value.slice(0, 1);
  const domain = value.slice(at);
  return `${first}***${domain}`;
}

/** Mask a phone/identifier to its last 4 chars: `***6789`. */
export function maskPhone(value: string): string {
  if (value.length <= 4) return "***";
  return `***${value.slice(-4)}`;
}

/** Generic short-mask for opaque strings. */
function maskShort(value: string): string {
  if (value.length <= 2) return "**";
  return `${value.slice(0, 1)}***`;
}

/**
 * Recursively redact a detail object: drop secret-keyed values, mask the
 * known PII keys (`email`, `to`, `phone`), and recurse into nested objects.
 * Arrays are mapped; primitives pass through.
 */
export function redact(detail: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(detail)) {
    if (SECRET_KEY.test(key)) {
      out[key] = REDACTED;
      continue;
    }
    if (typeof val === "string") {
      if (key === "email") out[key] = maskEmail(val);
      else if (key === "to" || key === "phone") out[key] = maskPhone(val);
      else out[key] = val;
    } else if (Array.isArray(val)) {
      out[key] = val.map((v) =>
        v !== null && typeof v === "object"
          ? redact(v as Record<string, unknown>)
          : v,
      );
    } else if (val !== null && typeof val === "object") {
      out[key] = redact(val as Record<string, unknown>);
    } else {
      out[key] = val;
    }
  }
  return out;
}

/** Serialize one event to a single redacted JSON line. */
export function formatAudit(event: AuditEvent): string {
  return JSON.stringify({
    ts: event.ts,
    actor: event.actor,
    action: event.action,
    channel: event.channel,
    detail: redact(event.detail),
  });
}

/** Write one event to the sink, redacted. */
export function audit(sink: AuditSink, event: AuditEvent): void {
  sink.write(formatAudit(event));
}
