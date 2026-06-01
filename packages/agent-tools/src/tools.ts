// =====================================================================
// packages/agent-tools/src/tools.ts · ROMAS Wire · ADR-0020
// The four ROMAS tools, defined independently of the MCP SDK so they are
// fully unit-testable. src/index.ts maps these onto McpServer.registerTool.
//
//   romas_send_email          stage → operator-approved Resend send
//   romas_send_sms            stage → operator-approved Twilio SMS
//   romas_manage_subscriber   stage → operator-approved Beehiiv subscription
//   romas_get_content         READ-ONLY published content + subscriber count
//
// The three send tools NEVER contact a provider — they only stage (S3/T-2).
// The read tool is the only one that touches the network here, and only
// the read-only Supabase surface (S1).
// =====================================================================

import { z } from "zod";

import { audit, type AuditSink } from "./audit.ts";
import {
  canStage,
  recordStage,
  remaining,
  type QuotaLimits,
  type QuotaStore,
} from "./quota.ts";
import { stageSend, type StagedStore } from "./approval.ts";
import type { SubscriptionInput } from "./beehiiv.ts";
import { getActiveSubscriberCount, getPublishedArticles } from "./supabase.ts";

/** Non-secret payloads persisted in a staged record (consumed by approve-cli). */
export interface EmailJob {
  kind: "email";
  to: string;
  subject: string;
  html: string;
  text: string;
}
export interface SmsJob {
  kind: "sms";
  to: string;
  body: string;
}
export interface BeehiivJob {
  kind: "beehiiv";
  input: SubscriptionInput;
}
export type SendJob = EmailJob | SmsJob | BeehiivJob;

export interface ToolEnv {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

export interface ToolDeps {
  staged: StagedStore;
  quota: QuotaStore;
  limits: QuotaLimits;
  audit: AuditSink;
  now: () => Date;
  env: ToolEnv;
}

export interface ToolTextResult {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

export interface ToolDef {
  name: string;
  description: string;
  inputSchema: z.ZodRawShape;
  handler: (args: Record<string, unknown>) => Promise<ToolTextResult>;
}

function text(body: string, isError = false): ToolTextResult {
  return isError ? { content: [{ type: "text", text: body }], isError: true } : { content: [{ type: "text", text: body }] };
}

// ---- input schemas ---------------------------------------------------

const emailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(200),
  html: z.string().min(1),
  text: z.string().min(1),
});

const smsSchema = z.object({
  to: z.string().regex(/^\+[1-9]\d{1,14}$/, "E.164 phone, e.g. +15551234567"),
  body: z.string().min(1).max(1600),
});

const subscriberSchema = z.object({
  email: z.string().email(),
  tier: z.enum(["free", "premium"]).optional(),
  reactivate_existing: z.boolean().optional(),
  send_welcome_email: z.boolean().optional(),
  utm_source: z.string().max(120).optional(),
  utm_campaign: z.string().max(120).optional(),
});

const contentSchema = z.object({
  limit: z.number().int().min(1).max(100).optional(),
});

// ---- builder ---------------------------------------------------------

export function buildTools(deps: ToolDeps): ToolDef[] {
  const sendEmailTool: ToolDef = {
    name: "romas_send_email",
    description:
      "Stage a transactional email (Resend) to ONE recipient for operator approval. Does NOT send — returns a pending id that a human must approve. Use for audio-listen links and lifecycle email.",
    inputSchema: emailSchema.shape,
    handler: async (args) => {
      const p = emailSchema.parse(args);
      const now = deps.now();
      if (!canStage(deps.quota, deps.limits, now, "email")) {
        audit(deps.audit, { ts: now.toISOString(), actor: "agent", action: "quota_block", channel: "email", detail: { email: p.to } });
        return text(`Daily email quota reached (${deps.limits.email}/day). Try tomorrow or raise the limit.`, true);
      }
      const job: EmailJob = { kind: "email", to: p.to, subject: p.subject, html: p.html, text: p.text };
      const staged = stageSend(deps.staged, now, {
        channel: "email",
        summary: `email "${p.subject}" → ${p.to}`,
        recipientCount: 1,
        payload: job,
      });
      recordStage(deps.quota, now, "email");
      audit(deps.audit, { ts: now.toISOString(), actor: "agent", action: "stage", channel: "email", detail: { id: staged.id, email: p.to, subject: p.subject } });
      return text(
        `STAGED ${staged.id} — ${staged.summary}. Requires operator approval before send (${remaining(deps.quota, deps.limits, now, "email")} email stages left today).`,
      );
    },
  };

  const sendSmsTool: ToolDef = {
    name: "romas_send_sms",
    description:
      "Stage an SMS (Twilio) to ONE E.164 number for operator approval. Does NOT send — returns a pending id. Use to deliver audio-listen links for commute listening.",
    inputSchema: smsSchema.shape,
    handler: async (args) => {
      const p = smsSchema.parse(args);
      const now = deps.now();
      if (!canStage(deps.quota, deps.limits, now, "sms")) {
        audit(deps.audit, { ts: now.toISOString(), actor: "agent", action: "quota_block", channel: "sms", detail: { to: p.to } });
        return text(`Daily SMS quota reached (${deps.limits.sms}/day).`, true);
      }
      const job: SmsJob = { kind: "sms", to: p.to, body: p.body };
      const staged = stageSend(deps.staged, now, {
        channel: "sms",
        summary: `sms → ${p.to} (${p.body.length} chars)`,
        recipientCount: 1,
        payload: job,
      });
      recordStage(deps.quota, now, "sms");
      audit(deps.audit, { ts: now.toISOString(), actor: "agent", action: "stage", channel: "sms", detail: { id: staged.id, to: p.to } });
      return text(
        `STAGED ${staged.id} — ${staged.summary}. Requires operator approval before send (${remaining(deps.quota, deps.limits, now, "sms")} SMS stages left today).`,
      );
    },
  };

  const manageSubscriberTool: ToolDef = {
    name: "romas_manage_subscriber",
    description:
      "Stage a Beehiiv subscriber add/reactivate/segment for operator approval. Does NOT mutate until approved. NOTE: Beehiiv has no API broadcast-send; this manages subscriber state only, not blast email.",
    inputSchema: subscriberSchema.shape,
    handler: async (args) => {
      const p = subscriberSchema.parse(args);
      const now = deps.now();
      if (!canStage(deps.quota, deps.limits, now, "beehiiv")) {
        audit(deps.audit, { ts: now.toISOString(), actor: "agent", action: "quota_block", channel: "beehiiv", detail: { email: p.email } });
        return text(`Daily Beehiiv quota reached (${deps.limits.beehiiv}/day).`, true);
      }
      const input: SubscriptionInput = { email: p.email };
      if (p.tier !== undefined) input.tier = p.tier;
      if (p.reactivate_existing !== undefined) input.reactivate_existing = p.reactivate_existing;
      if (p.send_welcome_email !== undefined) input.send_welcome_email = p.send_welcome_email;
      if (p.utm_source !== undefined) input.utm_source = p.utm_source;
      if (p.utm_campaign !== undefined) input.utm_campaign = p.utm_campaign;
      const job: BeehiivJob = { kind: "beehiiv", input };
      const staged = stageSend(deps.staged, now, {
        channel: "beehiiv",
        summary: `beehiiv subscriber ${p.email}${p.tier ? ` (tier=${p.tier})` : ""}`,
        recipientCount: 1,
        payload: job,
      });
      recordStage(deps.quota, now, "beehiiv");
      audit(deps.audit, { ts: now.toISOString(), actor: "agent", action: "stage", channel: "beehiiv", detail: { id: staged.id, email: p.email } });
      return text(`STAGED ${staged.id} — ${staged.summary}. Requires operator approval before it mutates Beehiiv.`);
    },
  };

  const getContentTool: ToolDef = {
    name: "romas_get_content",
    description:
      "Read-only: the most recent PUBLISHED ROMAS Wire articles (title, slug, published_at, thumbnail_url) plus the active subscriber count. No approval needed; this tool cannot write anything.",
    inputSchema: contentSchema.shape,
    handler: async (args) => {
      const p = contentSchema.parse(args);
      const now = deps.now();
      const { supabaseUrl, supabaseAnonKey } = deps.env;
      if (!supabaseUrl || !supabaseAnonKey) {
        return text("Content source not configured (SUPABASE_URL / SUPABASE_ANON_KEY missing).", true);
      }
      const limit = p.limit ?? 20;
      const [articles, subscribers] = await Promise.all([
        getPublishedArticles(supabaseUrl, supabaseAnonKey, limit),
        getActiveSubscriberCount(supabaseUrl, supabaseAnonKey),
      ]);
      audit(deps.audit, { ts: now.toISOString(), actor: "agent", action: "read", channel: "content", detail: { count: articles.length } });
      const lines = articles.map((a) => `- ${a.title} (/${a.slug})${a.published_at ? ` — ${a.published_at.slice(0, 10)}` : ""}`);
      return text(
        `Active subscribers: ${subscribers}\nLatest ${articles.length} published:\n${lines.join("\n")}`,
      );
    },
  };

  return [sendEmailTool, sendSmsTool, manageSubscriberTool, getContentTool];
}
