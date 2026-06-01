# ADR-0020 — OpenClaw as the 24/7 marketing + customer-ops agent layer

- **Status:** Proposed — **docs-read + threat model DONE 2026-06-01** (`Docs/specs/openclaw-threat-model.md`); pending only Kimal's Q-G authorization to build
- **Date:** 2026-05-31
- **Implements:** SSOT §3 decision 23 (OpenClaw, security-hardened) + decision 21 (audio → email + phone/SMS) + decision 20 (twice-weekly cadence demand profile)
- **Relates to:** ADR-0007 (Beehiiv + Resend email split), ADR-0019 (Beehiiv webhook), `~/.claude/AI-PROVIDERS.md` (multi-LLM routing + 5-tier cost model)
- **Confidence:** high — framework + full security model verified against `docs.openclaw.ai/gateway/security` + `concepts/model-providers` + the repo (2026-06-01). Integration surface confirmed; threat model maps all 10 controls (5 native, 5 ROMAS-build, 0 infeasible).
- **Deciders:** Kimal Honour Djam

## Context

SSOT decision 23 commissions a **24/7 autonomous marketing + customer-ops team** for ROMAS Wire, running **intelligent multi-LLM routing + cost optimization**, owning SMS + email + marketing + subscriber lifecycle, **security-hardened**. Mastra was rejected. This ADR records the architecture, the security model, and the LLM-routing/cost design — and is explicitly **Proposed**, because per rule 11 no integration code is written until the framework's actual API/config surface is read from the official source.

### What ROMAS Wire needs from this layer

| Need | Driver |
|---|---|
| Audio delivery to **email + phone/SMS** for commute listening | decision 21 ("audio is the moat") |
| Marketing campaigns, lifecycle, social, customer replies — autonomously, around the clock | decision 23 |
| **Cost-optimized** LLM use (high volume of classification/drafting/segmentation) | decision 23 + AI-PROVIDERS.md 5-tier model |
| Hard **security boundary** — this layer must never touch PHI, never publish without a human gate, never leak secrets | inviolable rule 6 + HIPAA posture |
| Cadence-aware demand: twice-weekly publish (Tue + Fri) → bursty send windows, not daily | decision 20 |

### What OpenClaw is (verified)

OpenClaw — Peter Steinberger's self-hosted gateway agent framework (renamed Clawdbot → Moltbot → OpenClaw after an Anthropic trademark complaint, Jan 2026; MIT-licensed; TypeScript/Node). Grounded against `docs.openclaw.ai` (2026-05-31):

- **Self-hosted gateway**, single process, `npm install -g openclaw@latest`; daemon via `openclaw onboard --install-daemon`. Gateway listens on `http://127.0.0.1:18789/` by default; optional remote access via Tailscale.
- Config at `~/.openclaw/openclaw.json` with channel **allowlists** (`allowFrom`) and `requireMention` gating.
- **Native channels:** Discord, Google Chat, iMessage, Matrix, Microsoft Teams, Signal, Slack, Telegram, WhatsApp, Zalo, Nostr, Twitch, WebChat. **SMS and email are NOT native channels.**
- LLM: "an API key from your chosen provider"; recommends "the strongest latest-generation model." **No documented multi-provider routing config** on the docs root.
- Dedicated security page at `/gateway/security` ("Tokens, allowlists, and safety controls").

Reported by secondary sources (search, 2026-05-31 — **hypothesis only, must confirm against the repo before integration**): heartbeat daemon (~30-min default) reading a `HEARTBEAT.md` checklist; agent persona via `SOUL.md` (+ `AGENTS.md`, `TOOLS.md`, `~/.openclaw/workspace/skills/`); a YAML workflow engine named **Lobster**; multi-agent routing through one gateway; connectors to Claude/GPT/Gemini/DeepSeek/Ollama. The search also surfaced the security caveat that drove decision 23's "security-hardened": *an agent with shell access, browser control, and the ability to send email on a loop without asking — large attack surface, young project.*

### Two findings that shape the design

1. **SMS + email are not native OpenClaw channels.** Email already has a home: the `workers/resend-transactional` worker (SHIP-12) + Beehiiv for newsletter (ADR-0007). SMS needs a **Twilio-class provider wired as an OpenClaw tool/skill**, not a channel. The agent layer *orchestrates* these transports; it does not replace them.
2. **OpenClaw does not itself do cost-optimized multi-provider routing.** That is exactly what the **Vercel AI Gateway** does (0% markup, unified endpoint) with **OpenRouter** as fallback, per AI-PROVIDERS.md. So the clean design points OpenClaw's single "chosen provider" base URL at the **Vercel AI Gateway**, and the Gateway owns routing + cost-opt + spend caps. OpenClaw stays a thin orchestration brain; the Gateway is the cost-control plane.

## Decision (proposed)

Adopt **OpenClaw, self-hosted, as ROMAS Wire's marketing + customer-ops agent layer**, with this shape:

### 1. Topology

```
                 ┌──────────────────────────────────────────────┐
                 │  OpenClaw Gateway (self-hosted daemon)        │
                 │  isolated host/container · NO PHI · NO prod DB │
                 │                                                │
   channels ───► │  agents (SOUL.md personas):                   │
   (Slack/       │   • marketer   • lifecycle   • support        │
    Telegram     │   • social     • analyst                      │
    for the      │                                                │
    internal     │  LLM base_url ──────────────┐                 │
    team only)   └─────────────────────────────┼─────────────────┘
                                                ▼
                            ┌───────────────────────────────────┐
                            │  Vercel AI Gateway (routing + cost) │
                            │  primary → OpenRouter fallback      │
                            │  5-tier model, ~60–70% Tier-1       │
                            └───────────────────────────────────┘
   tools/skills the agents call (NOT native channels):
     • Resend worker (transactional email)        ← built (SHIP-12)
     • Beehiiv API (newsletter send/segment)      ← ADR-0007
     • Twilio-class SMS provider (audio links)    ← decision 21, NEW (P-25)
     • Supabase READ-ONLY views (public content + subscriber counts only)
     • R2 public CDN audio URLs (read)
     • Plausible (read analytics)
```

### 2. LLM routing + cost-optimization design

OpenClaw points at **one base URL = the Vercel AI Gateway**. The Gateway implements the AI-PROVIDERS.md 5-tier model; the agent layer never holds raw provider keys.

| Agent task | Tier | Target model class (via Gateway) | Why |
|---|---|---|---|
| Classify inbound support msg, intent, sentiment | 1 (cheap) | Gemini Flash Lite / DeepSeek V3 / Llama-Groq | High volume, simple |
| Draft social posts, subject lines, segment copy | 1 → 2 | Cheap draft, escalate on low-confidence | Bulk drafting |
| Summarize an article for a send blurb | 1 | DeepSeek V3 / Flash Lite | Extractive |
| Compose a nuanced customer reply (brand voice) | 2 (default) | Opus 4.x / GPT-5.x | Reader-facing tone |
| Campaign strategy / multi-step reasoning | 3 (heavy) | DeepSeek R1 first, then GPT-5.x Pro | Rare, high-value |

Target: **~60–70% of token volume on Tier-1**, escalate only on low-confidence or reader-facing surfaces. OpenRouter is the Gateway's fallback if the primary path degrades. **Spend cap + per-day budget enforced at the Gateway**, not trusted to the agent.

### 3. Security hardening (the "security-hardened" mandate, decision 23)

OpenClaw ships with shell access, browser control, and send-on-a-loop autonomy. For a HIPAA-adjacent brand, that default is unacceptable. Hardening requirements (all MUST hold before production):

| # | Control | Requirement |
|---|---|---|
| S1 | **PHI isolation** | The agent host has **no path** to any PHI, the prod clinical DB, or Supabase service-role keys. It reads only **public** content + aggregate subscriber counts via dedicated read-only views/RLS roles. |
| S2 | **No raw shell / no broad tools by default** | Disable shell + filesystem + arbitrary-browser tools. Allowlist only the explicit tools in the topology (Resend, Beehiiv, SMS, read-only Supabase, R2 read, Plausible). |
| S3 | **Human-approval gate on every external send** | No campaign, SMS blast, or mass email goes out without an explicit human approve step. Auto-send allowed only for 1:1 support replies under a value/again-confirm threshold (TBD with Kimal). Mirrors inviolable rule 6's QA-gate philosophy. |
| S4 | **Secret handling** | Provider keys live only at the Vercel AI Gateway; transport keys (Resend/Beehiiv/Twilio) injected as host secrets, never in `SOUL.md`/`AGENTS.md`/skills/workspace markdown (those are prompt-injectable). |
| S5 | **Network egress allowlist** | Egress restricted to the Gateway + the named transport/data APIs. No open internet by default. |
| S6 | **Channel allowlist** | `allowFrom` + `requireMention` so only the internal ROMAS team can drive the agents; no public inbound that could prompt-inject. |
| S7 | **Audit + observability** | Every agent action + every send logged immutably with who/what/when/which-model/cost. Langfuse for LLM traces (Helicone is dead per AI-PROVIDERS.md). |
| S8 | **Prompt-injection defense** | Treat all channel content + any fetched web/customer text as untrusted. The AIMDS/`aidefence-guardian` posture applies. SOUL.md persona pinned; tool-use constrained. |
| S9 | **Containment + kill switch** | Run in an isolated container/VM with a documented one-command stop (parallels the audio 60s revoke kill switch). |
| S10 | **Quota / runaway guard** | Per-day token + send budget; auto-halt + alert on breach. |

### 4. Data boundary (non-negotiable)

This layer is **marketing + public-content + ops only**. It never sees patient data, never sees clinical drafts pre-publish, never holds the Supabase service-role key. The only subscriber data it touches is what Beehiiv already canonically holds (email, segment, status) for send orchestration — and even that flows through the existing workers where possible, not raw.

## Alternatives considered

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **OpenClaw (self-hosted, hardened)** | Multi-channel, multi-agent, MIT, local-first (data as markdown on our disk), large skill ecosystem, fits "own your stack" | Young project, large default attack surface, SMS/email not native, routing not built-in | **Chosen** (decision 23) — hardened + Gateway-fronted |
| **Mastra** | TS-native agent framework, typed workflows, good DX | Rejected by Kimal (decision 23). More a library than a 24/7 channel-connected ops gateway | Rejected |
| **`stainlu/openclaw-managed-agents`** (OpenClaw as npm dep + orchestrator/REST/quota/audit layer) | Adds the exact restart-safety + audit + quota + observability primitives S7/S9/S10 want | Third-party managed layer to vet; another supply-chain surface | **Evaluate during the docs-read** as a possible accelerator for the hardening layer |
| **Build bespoke on Vercel AI SDK + workers** | Total control, minimal attack surface | Rebuilds channels + scheduling + multi-agent routing OpenClaw already has; slower to the 24/7 goal | Rejected — reinvents the gateway |
| **No agent layer (manual marketing)** | Zero new risk | Defeats decision 23; no 24/7; no moat leverage | Rejected |

## Consequences

- **Positive:** a 24/7 marketing/ops brain that reuses the transports already built (Resend, Beehiiv), gets cost-optimized LLM routing for free from the Vercel AI Gateway, and keeps clinical data fully out of scope.
- **Negative:** a new, young, high-privilege-by-default dependency to harden and operate. Hardening (S1–S10) is real work and gates production. SMS provider (Twilio-class) is a new credential + cost line (P-25).
- **Operational:** new self-hosted daemon to run, monitor, patch, and back up (its memory is markdown on disk). Needs the kill switch + quota guard before it sends anything real.
- **Provisioning:** Kimal items **P-25** (commission + threat-model OpenClaw, SMS provider creds) and **P-26** (Google Publisher Center) in FOUNDERS-BOARD.

## Verification debt — CLEARED 2026-06-01

The rule-11 docs-read is done. Full results + STRIDE threat model: **`Docs/specs/openclaw-threat-model.md`**. Closure summary:

| # | Item | Result |
|---|---|---|
| 1 | Agent-config surface | ✅ **Corrected** — config is `~/.openclaw/openclaw.json` (JSON5), agents under `agents.list[]`; **not** SOUL.md/TOOLS.md markdown. Skills in `extensions/`. |
| 2 | Custom OpenAI-compatible `base_url` | ✅ Confirmed — `models.providers.<id>.baseUrl` + `api:"openai-completions"`. Vercel AI Gateway fronting design (§2) is valid. |
| 3 | `/gateway/security` full read → S1–S10 map | ✅ Done — 5 controls native, 5 ROMAS-build, 0 infeasible (threat model §6). |
| 4 | Tool scoping / disable shell+browser | ✅ Confirmed — `exec.security:"deny"`, `fs.workspaceOnly`, `browser.enabled:false`, `tools.deny:["group:fs","group:runtime","group:automation",…]`, `sandbox.workspaceAccess:"none"`. |
| 5 | Heartbeat / event-trigger for cadence | ⚠️ Partial — daemon confirmed; exact trigger (`group:automation` cron vs HEARTBEAT) to confirm at build. Not blocking. |
| 6 | Lobster workflow engine for the approval gate | ✅ Negative — unconfirmed in official docs; **do not rely on it**. S3 approval is enforced at the ROMAS send-tool boundary instead. |
| 7 | License + supply-chain | ✅ MIT; large+active repo; plugin supply-chain flagged → audit per `tob-supply-chain-risk-auditor` before loading any skill. |

### Material refinement from the docs-read (propagate to SSOT decision 23)

OpenClaw's security model assumes a **single-operator trust boundary per gateway** — *"not designed for hostile multi-tenant isolation."* So the **customer-ops** scope of decision 23 must be **operator-mediated**: subscribers never DM the gateway; customer inbound flows through a controlled support queue, the agent drafts a reply, a human approves the send. Not a public-facing autonomous bot. (Threat model §1, T-1.)

Two build-time items remain (neither blocks the decision): the exact scheduling trigger (#5) and the per-tool human-approval implementation (S3 / threat-model T-2) — both ROMAS-side, well-scoped.

## Revisit triggers

- OpenClaw renames again / changes stewardship (it has renamed twice + the founder joined OpenAI Feb 2026) — re-confirm the package + license.
- A security incident in OpenClaw core or a surfaced prompt-injection CVE.
- If the docs-read shows no OpenAI-compatible `base_url` → re-decide the routing approach (or wrap with a local proxy).
- If hardening S1–S10 proves infeasible on OpenClaw → fall back to the bespoke-on-AI-SDK option.

## Open question to close this ADR

**Q-G:** Confirm OpenClaw (not a fork / not the managed layer) as the base, and authorize the docs-read + threat-model spike (P-25) that clears the verification debt above. On completion → flip Status to Accepted, attach the threat model, and update FOUNDERS-BOARD P-25 with the concrete credential + host list.
