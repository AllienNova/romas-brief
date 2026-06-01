# ROMAS Wire — OpenClaw agent layer (deployment)

The self-hosted OpenClaw gateway that runs the 24/7 marketing + customer-ops agent team.
**Decision:** SSOT §3 decision 23 · **Design:** `Docs/specs/adr/0020-openclaw-marketing-ops-agent-layer.md` · **Threat model:** `Docs/specs/openclaw-threat-model.md`.

> Status: **config + tools built; not yet provisioned.** Runtime is gated on Kimal's P-25 (host + credentials). Nothing here sends until the operator wires secrets and approves.

## What this is

```
OpenClaw gateway (this config, loopback + Tailscale)
  ├─ LLM base_url ──► Vercel AI Gateway  (routing + cost-opt + spend cap; ADR-0020 §2)
  └─ MCP server ────► @romas-brief/agent-tools  (the 4 approval-gated tools)
                         romas_send_email      → stage → operator approve → Resend
                         romas_send_sms        → stage → operator approve → Twilio
                         romas_manage_subscriber → stage → operator approve → Beehiiv
                         romas_get_content     → read-only Supabase (no approval)
```

The agent can only **stage** sends. A human approves them out-of-band with the operator
approval CLI, which holds the only copy of `ROMAS_APPROVAL_TOKEN`. The LLM has no approval tool.

## Install (operator)

```bash
# 1. Node 22.19+ / 24 (for --experimental-strip-types) + OpenClaw
npm install -g openclaw@latest            # pin to the version you audited

# 2. Gateway config
cp infra/openclaw/openclaw.json ~/.openclaw/openclaw.json
chmod 600 ~/.openclaw/openclaw.json
openclaw doctor --generate-gateway-token  # fill ${ROMAS_OPENCLAW_GW_TOKEN}
# fill the other ${...} placeholders from your secret manager (see below)

# 3. Verify the MCP server is registered + its tools list
openclaw mcp status
openclaw mcp tools romas-agent-tools      # expect the 4 romas_* tools

# 4. Security self-audit (must pass before going live)
openclaw security audit --deep

# 5. Run as a daemon
openclaw onboard --install-daemon
```

## Secrets — two separate trust zones (S4)

| Secret | Where it lives | Why |
|---|---|---|
| `ROMAS_OPENCLAW_GW_TOKEN` | gateway config (600) | gateway auth |
| `VERCEL_AI_GATEWAY_URL` / `_KEY` | gateway config | LLM routing upstream |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY_RO` | MCP server env | **read-only** content + counts (never service-role) |
| `RESEND_API_KEY`, `TWILIO_*`, `BEEHIIV_API_KEY`/`_PUBLICATION_ID` | **operator approval CLI env ONLY** | send secrets never touch the agent process |
| `ROMAS_APPROVAL_TOKEN` | **operator env ONLY** | the approval gate; the agent never sees it |

## Operator approval flow (S3 / threat-model T-2)

The agent stages a send and reports a pending id (`STAGED <id> — …`). To approve and send:

```bash
ROMAS_APPROVAL_TOKEN=<secret> \
RESEND_API_KEY=... TWILIO_ACCOUNT_SID=... TWILIO_AUTH_TOKEN=... TWILIO_FROM=+1... \
BEEHIIV_API_KEY=... BEEHIIV_PUBLICATION_ID=... \
ROMAS_AGENT_STATE=<same path as the gateway> \
pnpm --filter @romas-brief/agent-tools approve <staged-id> <token>
```

- Wrong/absent token → exit 3, **provider never called**, staged record kept.
- Provider failure → exit 2, record kept for retry.
- Success → exit 0, record deleted.

## Security control map (full detail in the threat model)

| Control | Mechanism |
|---|---|
| S1 PHI isolation | host has no route/creds to PHI/prod DB; read-only Supabase views only |
| S2 no shell/fs/browser | `tools.exec.security:"deny"`, `browser.enabled:false`, `tools.deny:[group:fs,…]`, `sandbox.workspaceAccess:"none"` |
| S3 human-approval on every send | staged-only tools + operator approval CLI (token not in agent env) |
| S6 channel allowlist | `dmPolicy:"allowlist"/"pairing"`, `requireMention` — team-only |
| S7 audit | MCP server audits to stderr (OpenClaw captures); `logging.redactSensitive:"tools"` |
| S8 prompt-injection | blast radius limited to the 4 tools; OpenClaw strips token literals |
| S10 quota | per-day per-channel caps in the MCP server + spend cap at the Gateway |

## Open build-time items (do not block the decision)

- **Persistence:** staged store + quota are file/in-memory (single-operator v1). A concurrent
  backend (Redis/Postgres) is a P-25 hardening item.
- **Scheduling trigger** for the Tue/Fri cadence — confirm `group:automation` cron vs HEARTBEAT against the OpenClaw scheduling docs at wiring time.
- **Immutable audit sink** (file/stream) beyond stderr.
