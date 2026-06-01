// =====================================================================
// packages/agent-tools/src/index.ts · ROMAS Wire · ADR-0020
// MCP server entry — the thin SDK adapter. The ONLY file that imports the
// MCP SDK; all logic lives in the SDK-free modules it composes.
//
// OpenClaw spawns this over stdio (mcp.servers in openclaw.json):
//   command: "node"
//   args: ["--experimental-strip-types", "<abs>/packages/agent-tools/src/index.ts"]
//
// IMPORTANT: stdout is the MCP JSON-RPC channel. Audit + diagnostics go to
// STDERR only — writing to stdout would corrupt the protocol.
// SDK ^1.26.0 (patched for GHSA-345p-7cg4-v4c7). MCP is a wire protocol, so
// this server's SDK version need not match the OpenClaw host's client SDK.
// =====================================================================

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

import type { AuditSink } from "./audit.ts";
import { DEFAULT_LIMITS, InMemoryQuotaStore, type QuotaLimits } from "./quota.ts";
import { FileStagedStore } from "./store-file.ts";
import { buildTools, type ToolEnv } from "./tools.ts";

/** Audit to stderr — never stdout (which carries the MCP protocol). */
class StderrAuditSink implements AuditSink {
  write(line: string): void {
    process.stderr.write(`${line}\n`);
  }
}

function intEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

const limits: QuotaLimits = {
  email: intEnv("ROMAS_QUOTA_EMAIL", DEFAULT_LIMITS.email),
  sms: intEnv("ROMAS_QUOTA_SMS", DEFAULT_LIMITS.sms),
  beehiiv: intEnv("ROMAS_QUOTA_BEEHIIV", DEFAULT_LIMITS.beehiiv),
};

const env: ToolEnv = {};
if (process.env["SUPABASE_URL"]) env.supabaseUrl = process.env["SUPABASE_URL"];
if (process.env["SUPABASE_ANON_KEY"]) env.supabaseAnonKey = process.env["SUPABASE_ANON_KEY"];

const statePath = process.env["ROMAS_AGENT_STATE"] ?? "./.romas-agent/staged.json";

const tools = buildTools({
  staged: new FileStagedStore(statePath),
  quota: new InMemoryQuotaStore(),
  limits,
  audit: new StderrAuditSink(),
  now: () => new Date(),
  env,
});

const server = new McpServer({ name: "romas-agent-tools", version: "0.1.0" });

for (const tool of tools) {
  server.registerTool(
    tool.name,
    { description: tool.description, inputSchema: tool.inputSchema },
    async (args: Record<string, unknown>): Promise<CallToolResult> => {
      const result = await tool.handler(args);
      return result.isError
        ? { content: result.content, isError: true }
        : { content: result.content };
    },
  );
}

await server.connect(new StdioServerTransport());
process.stderr.write(`romas-agent-tools MCP server ready (${tools.length} tools, state=${statePath})\n`);
