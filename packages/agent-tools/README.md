# @romas-brief/agent-tools

MCP server exposing the **four approval-gated ROMAS Wire tools** to the OpenClaw marketing/ops
agent layer. Built as a portable [Model Context Protocol](https://modelcontextprotocol.io) server
(not an OpenClaw-native plugin) so the business logic, approval gate, quota, and audit stay under
ROMAS control and survive any OpenClaw stewardship change.

**Design:** `Docs/specs/adr/0020-openclaw-marketing-ops-agent-layer.md` · **Threat model:** `Docs/specs/openclaw-threat-model.md`.

## The four tools

| Tool | Action | Approval? | Provider |
|---|---|---|---|
| `romas_send_email` | stage a transactional email (audio links, lifecycle) | **yes** | Resend |
| `romas_send_sms` | stage an SMS (audio listen link, commute) | **yes** | Twilio |
| `romas_manage_subscriber` | stage a Beehiiv add/reactivate/segment | **yes** | Beehiiv v2 |
| `romas_get_content` | read latest published articles + subscriber count | no (read-only) | Supabase (PostgREST, RO) |

> **Beehiiv has no documented API broadcast-send** (verified 2026-06-01). `romas_manage_subscriber`
> manages subscriber state only; newsletter broadcasts stay Beehiiv-UI/automation-driven. Audio
> delivery to subscribers is email (Resend) + SMS (Twilio).

## The security property

The agent **cannot send**. The three send tools only `stageSend()` a pending record and return its
id. The actual provider call happens only via `approve-cli.ts`, which constant-time-checks the
operator-only `ROMAS_APPROVAL_TOKEN`. A wrong/absent token never calls a provider and never mutates
the staged store (`approval.test.ts` proves this). Staged records carry **no secrets** — credentials
are injected from the operator's env at approval time.

## Layout

```
src/
  index.ts        MCP adapter (the only file that imports the SDK; runs over stdio)
  approve-cli.ts  operator-only approval entry (holds the token; not an agent tool)
  approval.ts     stage / execute / constant-time token gate   (+ .test.ts)
  quota.ts        per-day per-channel send cap                 (+ .test.ts)
  audit.ts        redacted, PII-masked audit lines             (+ .test.ts)
  store-file.ts   cross-process file-backed staged store       (+ .test.ts)
  resend.ts twilio.ts beehiiv.ts supabase.ts   provider clients (+ providers.test.ts)
  tools.ts        the four tool definitions, SDK-free           (+ .test.ts)
```

`tools.ts` + providers + approval/quota/audit are **SDK-free and fully unit-tested**; `index.ts` is a
thin SDK seam. SDK `@modelcontextprotocol/sdk@^1.26.0` (patched for GHSA-345p-7cg4-v4c7); MCP is a
wire protocol, so the server's SDK version need not match the OpenClaw host's client SDK.

## Develop

```bash
pnpm --filter @romas-brief/agent-tools typecheck   # tsc --noEmit
pnpm --filter @romas-brief/agent-tools test        # node --experimental-strip-types --test
pnpm --filter @romas-brief/agent-tools start       # run the MCP server over stdio
```

Runs via `node --experimental-strip-types` (Node 22.19+/24) — no build step. Deployment + the
operator approval flow: `infra/openclaw/README.md`.

## Env

MCP server (read-only): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `ROMAS_AGENT_STATE`,
`ROMAS_QUOTA_{EMAIL,SMS,BEEHIIV}`.
Approval CLI (operator only): `ROMAS_APPROVAL_TOKEN`, `RESEND_API_KEY`, `TWILIO_ACCOUNT_SID`,
`TWILIO_AUTH_TOKEN`, `TWILIO_FROM`, `BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID`.
