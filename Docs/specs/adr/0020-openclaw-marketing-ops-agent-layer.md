# ADR-0020 — OpenClaw as the 24/7 marketing + customer-ops agent layer

- **Status:** **Accepted** — Q-G authorized by Kimal 2026-06-01 ("we will host OpenClaw"); docs-read + threat model done (`Docs/specs/openclaw-threat-model.md`); the four approval-gated tools + hardened gateway config **built, tested (37/37), and shipped** as `@romas-brief/agent-tools` (commit `198c685`) + `infra/openclaw/`. Runtime is gated on P-25 provisioning only. **Amended 2026-06-02 (Amendment A1):** deployment runtime is **NVIDIA NemoClaw / OpenShell** hosting the OpenClaw gateway — see Amendment A1 at the bottom.
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
| **`stainlu/openclaw-managed-agents`** (OpenClaw as npm dep + orchestrator/REST/quota/audit layer) | Adds restart-safety + audit + quota + observability primitives | Third-party managed layer; another supply-chain surface | **Superseded by NemoClaw** (Amendment A1) — NVIDIA's first-party hardened runtime is the better managed layer |
| **OpenClaw inside NVIDIA NemoClaw / OpenShell** | NVIDIA-maintained hardened runtime that *runs OpenClaw* (the default supported agent): Landlock + seccomp + netns isolation, egress control + operator-approval flow, sensitive-data masking, local-only inference; Apache 2.0; explicitly targets regulated/healthcare data; composes with our MCP server + approval gate + `openclaw.json` unchanged | Newer than OpenClaw (2026, no stability marker); adds NVIDIA OpenShell stack dep; Linux-centric | **CHOSEN deployment runtime — Amendment A1 (2026-06-02)** |
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

## Q-G — RESOLVED (2026-06-01)

Kimal authorized: **"we will host OpenClaw"** + "start the build." Done: docs-read + threat model (`openclaw-threat-model.md`); the four approval-gated tools + hardened gateway config built, tested (37/37), shipped (`@romas-brief/agent-tools`, `infra/openclaw/`, commit `198c685`). Status → **Accepted**. Remaining work is **runtime provisioning only — FOUNDERS-BOARD P-25** (host; `VERCEL_AI_GATEWAY_URL`/`_KEY`; `RESEND_API_KEY`; `TWILIO_ACCOUNT_SID`/`AUTH_TOKEN`/`FROM`; `BEEHIIV_API_KEY`/`PUBLICATION_ID`; read-only `SUPABASE_ANON_KEY`; `ROMAS_APPROVAL_TOKEN`) — see `infra/openclaw/README.md` §Secrets for the per-zone split.

---

## Amendment A1 (2026-06-02) — Deploy runtime: OpenClaw **inside NVIDIA NemoClaw / OpenShell**

- **Status:** Accepted. **Deciders:** Kimal ("yes amend"). **Confidence:** medium-high — NemoClaw verified to be a wrapper-runtime that *runs OpenClaw*, grounded against `github.com/NVIDIA/NemoClaw` + `nvidia.com/en-us/ai/nemoclaw/` (2026-06-02). Apache 2.0.

**Decision.** Host the OpenClaw gateway **inside NVIDIA NemoClaw / OpenShell** rather than as a bare self-hardened daemon. Per the NemoClaw repo, it is *"an open source reference stack for running always-on AI agents more safely inside NVIDIA OpenShell sandboxes"* with **OpenClaw as the default supported agent** — i.e. NemoClaw is **not an alternative to OpenClaw; it is a hardened runtime that runs it.** It explicitly targets **regulated/healthcare data**, which fits ROMAS's HIPAA-adjacent posture.

**Why this is a strict upgrade, not a pivot.** The biggest cost in this ADR was that **5 of 10 controls were "ROMAS-build"** (hand-rolled OS sandbox, egress firewall, containment). NemoClaw/OpenShell provides those as a maintained, security-reviewed layer:

| Control | Before (bare OpenClaw) | After (NemoClaw/OpenShell) |
|---|---|---|
| S1 PHI isolation | infra discipline (ROMAS-build) | **+ Landlock + seccomp + network namespaces + local-only execution** (native) |
| S2 no shell/broad tools | `openclaw.json` deny-lists (native) | unchanged + OS-level capability drops + process limits |
| S5 egress allowlist | host firewall (ROMAS-build) | **native network policy + egress control + operator-approval flow** |
| S8 prompt-injection blast-radius | tool-scoping posture | unchanged + sensitive-data masking |
| S9 containment/kill switch | docker + manual stop (ROMAS-build) | **native OpenShell sandbox lifecycle** |

Net: **~3 of the 5 ROMAS-build controls (S1/S5/S9) shift to NemoClaw-native**; S3 (human-approval), S7 (audit), S10 (quota) stay in our `@romas-brief/agent-tools` package as designed.

**Zero rework to shipped code.** Because the tools are a portable **MCP server** and the approval gate lives in our package (not OpenClaw): `@romas-brief/agent-tools`, the operator approval CLI, and the hardened `openclaw.json` **all carry over unchanged** — NemoClaw runs that same OpenClaw, which loads our MCP server + config. The NeMo Agent Toolkit has full MCP client+server support.

**NemoClaw verification debt — VERIFIED 2026-06-02** (P-25-spike; against `github.com/NVIDIA/NemoClaw/docs/*`):

| # | Item | Result |
|---|---|---|
| 1 | Runs our custom OpenClaw config + plugins | ✅ **Yes** — integration model is a **custom sandbox image**: bake plugins into the OpenClaw `extensions/` dir, then `nemoclaw onboard --from ./Dockerfile`; apply our `openclaw.json` (tool deny-lists, channels) **after** `openclaw doctor --fix`. → deliverable = a ROMAS sandbox `Dockerfile`. |
| 2 | OpenAI-compatible `base_url` for the Vercel Gateway | ✅ **Yes** — NemoClaw has a **`compatible-endpoint`** provider (+ `compatible-anthropic-endpoint`): `nemoclaw inference set --provider compatible-endpoint --model <name>`. Onboard the Vercel AI Gateway as that endpoint. (Ollama-proxy e2e in their CI corroborates OpenAI-compat proxying.) |
| 3 | Host requirements | ✅ **Linux+Docker / macOS Apple-Silicon+Colima / WSL2+Docker Desktop / DGX Spark**; **Node 22.16+**, npm 10+, Docker; **NO GPU required** (GPU only if self-hosting a local NIM — we use the Gateway); min 4 vCPU / 8 GB / 20 GB. **Landlock needs Linux kernel ≥5.13** (`CONFIG_SECURITY_LANDLOCK=y`; `best_effort` degrades gracefully). |
| 4 | Isolation mechanisms | ✅ Landlock (RO system paths), capability drops (`CAP_SYS_ADMIN/PTRACE/NET_RAW/DAC_OVERRIDE/SYS_CHROOT`; `--cap-drop=ALL`), `ulimit -u 512` (fork-bomb), RO root-owned config. **Egress/network policy** lives in `docs/reference/network-policies.mdx` (baseline rules + egress control + operator-approval — confirms S5). |

**Remaining (build-time, non-blocking):** (a) the exact NemoClaw **sandbox base-image name + `extensions/` path** for the ROMAS `Dockerfile` (read at provisioning); (b) confirm OpenClaw's `mcp.servers` (our `@romas-brief/agent-tools`, spawned as a `node` process — allowed under the cap set) loads inside the sandbox; (c) **supply-chain audit** of NemoClaw + OpenShell (`tob-supply-chain-risk-auditor`) + pin a commit (no stability marker yet).

**Supersedes:** the §Consequences "self-hosted daemon I harden" framing and the §6 "5 ROMAS-build" count (now ~2). The `stainlu/openclaw-managed-agents` option is dropped in favor of NVIDIA's first-party runtime.

**Revisit triggers (added):** NemoClaw stability/stewardship change or a discontinuation; if OpenShell cannot run our custom config or blocks the Gateway `base_url` → fall back to bare OpenClaw + the original ROMAS-build hardening (still fully specified above).

## Revision History
- 2026-05-31 — Proposed (OpenClaw, pending docs-read).
- 2026-06-01 — Accepted (Q-G authorized; threat model done; tools + config shipped `198c685`).
- 2026-06-02 — **Amendment A1**: deploy runtime = NVIDIA NemoClaw / OpenShell hosting OpenClaw.
