# OpenClaw Marketing/Ops Agent Layer — Threat Model

- **Status:** Complete — clears the rule-11 verification debt in ADR-0020
- **Date:** 2026-06-01
- **Method:** STRIDE per trust boundary, mapped to OpenClaw's verified native controls
- **Sources read (primary):** `docs.openclaw.ai/gateway/security` · `docs.openclaw.ai/concepts/model-providers` · `github.com/openclaw/openclaw` (repo + AGENTS.md + LICENSE) — all 2026-06-01
- **Decision context:** SSOT decision 23 + ADR-0020
- **Author:** Claude (verification spike P-25 phase 1)

> Every config key, CLI command, and default in this document is quoted from the OpenClaw official docs/repo read on 2026-06-01. Where a fact is from a secondary source or unconfirmed, it is marked **(unconfirmed)**.

---

## 0. Corrections to ADR-0020's secondary-sourced assumptions

The docs-read overturned three claims ADR-0020 carried from search summaries. Recording them so the ADR can be updated:

| ADR-0020 said (secondary) | Verified reality (primary) | Impact |
|---|---|---|
| Agents configured via `SOUL.md` / `AGENTS.md` / `TOOLS.md` markdown | Config is **`~/.openclaw/openclaw.json`** (JSON5). Agents under `agents.list[]`; defaults under `agents.defaults`. (`AGENTS.md` in the repo is OpenClaw's *own* dev-policy file, not the user config surface.) | Persona/policy is JSON, not markdown. Skills live in `extensions/`. |
| Heartbeat daemon reads `HEARTBEAT.md` (~30 min) | **Unconfirmed** in official docs. `openclaw onboard --install-daemon` creates a launchd/systemd service; scheduling is the `group:automation` (cron) tool group. The `HEARTBEAT.md` mechanism is secondary-source only. | Event/trigger wiring for the Tue/Fri cadence must be confirmed against the scheduling docs at build time; not a threat-model blocker. |
| "Lobster" YAML workflow engine encodes the approval gate | **Unconfirmed** in official docs — "Lobster" appears only in a third-party blog. Official docs say *"Skills own workflows."* | The S3 human-approval gate cannot be assumed from a workflow engine; it must be enforced at the ROMAS tool boundary (see T-2). |
| Custom OpenAI-compatible `base_url` "may be available" | **CONFIRMED.** `models.providers.<id>` accepts `baseUrl` + `api: "openai-completions"` + `apiKey` + `models[]`. | The Vercel AI Gateway fronting design (ADR-0020 §2) is valid as specified. |

---

## 1. Scope & the load-bearing trust-boundary finding

OpenClaw's security doc is explicit:

> "OpenClaw security model assumes **single-operator ('personal assistant') trust boundary per gateway. Not designed for hostile multi-tenant isolation on one shared gateway.**" … "approval gates are guardrails for **operator intent**, not hostile multi-tenant isolation." … Default trusted-operator model is `security="full"`, `ask="off"` unless tightened.

**Consequence for ROMAS (architectural constraint, P0):** the gateway is driven by the **ROMAS internal team only**. Subscribers/customers MUST NOT be able to DM the gateway or appear in any channel the agent treats as operator input. The "customer-ops" half of decision 23 is therefore **operator-mediated**: customer inbound arrives via a controlled queue (support inbox / ticketing), the agent *drafts* replies, a human *approves* the send. No public-facing autonomous bot that arbitrary subscribers can message. This is a refinement of decision 23, not a contradiction — record it in SSOT.

**In scope:** the self-hosted OpenClaw gateway, its agents, its tools (Resend, Beehiiv, SMS, read-only Supabase, R2 read, Plausible), its LLM path (→ Vercel AI Gateway), and the host it runs on.

**Out of scope (hard boundary):** all PHI, the clinical/prod ROMAS COS DB, Supabase service-role keys, pre-publish clinical drafts, the reader/CMS apps. The agent layer touches **public content + Beehiiv-canonical subscriber contact data only**.

---

## 2. Assets

| ID | Asset | Sensitivity |
|---|---|---|
| A1 | Subscriber contact data (email, phone, segment, status) | High — PII; TCPA/CAN-SPAM/GDPR scope |
| A2 | Transport credentials (Resend, Beehiiv, Twilio-class SMS) | High — abuse = spam/$ /reputation |
| A3 | LLM access (via Vercel AI Gateway key) | Medium — abuse = $ runaway |
| A4 | Brand voice / send authority (ability to email/SMS as ROMAS) | High — reputation, deliverability |
| A5 | Gateway auth token + host | High — full control of the above |
| A6 | Public content + analytics (read) | Low |
| — | PHI / clinical DB / service-role keys | **Not present** by design (S1) |

---

## 3. Threat actors

| Actor | Capability | Motivation |
|---|---|---|
| External attacker (network) | Probe the gateway endpoint, attempt auth bypass | Hijack send authority (A4), exfil A1/A2 |
| Prompt-injection content | Malicious text in a fetched article, customer message, or web page the agent reads | Make the agent send/leak/act outside intent |
| Compromised dependency | Malicious OpenClaw plugin/skill or transitive npm dep | Code exec on the host, secret exfil |
| Malicious/careless insider | An operator with channel access | Mis-send, data export |
| The agent itself (runaway) | LLM error, loop, hallucinated action | Cost runaway (A3), bad sends (A4) |

---

## 4. STRIDE threats → verified OpenClaw control → ROMAS action

| # | Threat (STRIDE) | OpenClaw native control (verified key) | Residual gap → ROMAS action |
|---|---|---|---|
| T-1 | **S**poofing: a non-operator messages the bot and it obeys ("someone messaged the bot and it did what they asked" — the doc's stated core risk) | `channels.<ch>.dmPolicy: "pairing"`/`"allowlist"`; `allowFrom`; `groupPolicy: "allowlist"`; `requireMention: true`; `session.dmScope: "per-channel-peer"` | Set every channel to `pairing`/`allowlist` with only team senders. **No subscriber-facing channel.** Customer inbound via separate queue (§1). |
| T-2 | **T**ampering / unauthorized action: agent sends a campaign/SMS/email without human intent | `tools.exec.ask: "always"` + `tools.exec.security: "deny"` cover *exec*; native per-tool "ask" for **custom** send-tools is **not** guaranteed | **Build the S3 approval gate into the ROMAS send-tools themselves**: Resend/Beehiiv/SMS tools require a signed operator confirmation token per send batch; tool returns "pending approval" otherwise. Do NOT rely on a workflow engine. |
| T-3 | **R**epudiation: who sent what, with which model, at what cost | `logging.redactSensitive: "tools"` (default); `logging.redactPatterns`; `openclaw security audit --json` | Ship immutable audit: every agent action + send + model + token cost to an append-only log; Langfuse for LLM traces (Helicone dead per AI-PROVIDERS.md). |
| T-4 | **I**nfo disclosure: secrets leak into prompt/context | Workspace `.env` blocks provider keys + all `OPENCLAW_*`; special-token literals stripped from untrusted content; `~/.openclaw/openclaw.json` mode 600, `~/.openclaw` mode 700; SecretRef (`env`/`file`/`exec`) | Use **SecretRef**, never inline keys in `openclaw.json`/agents. Provider keys live only at the Vercel AI Gateway. `contextVisibility: "allowlist"`. |
| T-5 | **I**nfo disclosure: agent reads PHI / prod DB | none native — this is a deployment boundary | **S1:** host has no network route + no credentials to PHI/prod DB/service-role. Only read-only Supabase views (public content + aggregate counts) + R2 public read. Enforce at infra (egress allowlist + DB role), not in the agent. |
| T-6 | **D**enial / cost runaway: agent loops, burns tokens/sends | none native for $ | **Spend cap + per-day token budget at the Vercel AI Gateway**; per-day send quota at the ROMAS send-tools; auto-halt + alert on breach (S10). |
| T-7 | **E**levation via prompt injection: fetched article / customer text hijacks tools | Doc is candid: *"prompt injection alone does not prove auth bypass"*; defense = **limit blast radius**. `allowUnsafeExternalContent: false` (default); token-literal stripping | Posture = **least tools**: `tools.profile: "messaging"`, deny `group:fs`/`group:runtime`/`group:automation`, `exec.security: "deny"`, `browser.enabled: false`, `sandbox.mode: "docker"` `workspaceAccess: "none"`. Even a successful injection can only call the 4 approval-gated send/read tools. |
| T-8 | **E**levation via SSRF (agent browses internal network) | `browser.ssrfPolicy.dangerouslyAllowPrivateNetwork: false` (default); private/internal blocked pre+post navigation | Keep browser **disabled** entirely (`tools.browser.enabled: false`). ROMAS agents have no need to browse. |
| T-9 | **T**ampering via supply chain: malicious plugin/skill or npm dep | Audit finding "Plugin supply chain → only load trusted packages"; MIT core | Vet every plugin/skill with `tob-supply-chain-risk-auditor`; pin versions; no auto-update; load only first-party + audited skills. |
| T-10 | **S**poofing the gateway endpoint / remote access | `gateway.bind: "loopback"` (default); `gateway.auth.mode: "token"`; Tailscale identity via `tailscale whois`; `OPENCLAW_ALLOW_INSECURE_PRIVATE_WS` break-glass only | Bind loopback; reach it only over **Tailscale tailnet**; never public-expose the control UI (`/`) or Canvas (`/__openclaw__/canvas/`). Long random `gateway.auth.token` via `openclaw doctor --generate-gateway-token`. |

---

## 5. ROMAS hardened `openclaw.json` baseline (grounded in verified keys)

Derived from the docs' "Hardened Baseline" plus ROMAS-specific tightening. Every key verified against `docs.openclaw.ai/gateway/security` 2026-06-01.

```json5
{
  gateway: {
    mode: "local",
    bind: "loopback",                         // never lan/public
    auth: { mode: "token", token: "${ROMAS_OPENCLAW_GW_TOKEN}", allowTailscale: true },
    nodes: { pairing: { autoApproveCidrs: [] } },   // no auto node pairing
  },
  session: { dmScope: "per-channel-peer", contextVisibility: "allowlist" },
  agents: {
    defaults: {
      sandbox: { mode: "docker", scope: "agent", workspaceAccess: "none" },
    },
  },
  tools: {
    profile: "messaging",
    deny: ["group:automation", "group:runtime", "group:fs", "sessions_spawn", "sessions_send", "gateway", "cron"],
    fs: { workspaceOnly: true },
    exec: { security: "deny", ask: "always" },
    browser: { enabled: false },
    elevated: { enabled: false },
  },
  channels: {
    // team-only channels; subscribers never appear here
    slack:    { dmPolicy: "allowlist", allowFrom: ["<team-only>"], channels: { /* team ops channel */ } },
    telegram: { dmPolicy: "pairing", groups: { "*": { requireMention: true } } },
  },
  models: {
    mode: "merge",
    providers: {
      // OpenClaw → Vercel AI Gateway (routing + cost-opt + spend cap upstream)
      "romas-gateway": {
        baseUrl: "${VERCEL_AI_GATEWAY_URL}",
        apiKey: "${VERCEL_AI_GATEWAY_KEY}",   // via SecretRef, never inline
        api: "openai-completions",
        models: [ /* tier aliases resolved at the gateway */ ],
      },
    },
  },
  logging: { redactSensitive: "tools" },
}
```

Secrets via **SecretRef** (`env`/`file`/`exec`), never literals. The four ROMAS send/read tools (Resend, Beehiiv, SMS, Supabase-RO) are added as first-party plugins, each wrapping its own per-send approval gate (T-2) and quota (T-6).

---

## 6. Control map: ROMAS S1–S10 (ADR-0020) → verified mechanism

| ROMAS control | Satisfied by | Native / build |
|---|---|---|
| S1 PHI isolation | Infra: no route + no creds to PHI/prod; read-only Supabase views | **Build** (infra/DB roles) |
| S2 No shell/broad tools | `exec.security:"deny"`, `fs.workspaceOnly`, `browser.enabled:false`, `tools.deny group:*`, `sandbox.workspaceAccess:"none"` | **Native** ✅ |
| S3 Human-approval on every send | exec-`ask` is native for exec only; **custom send-tools must implement their own approval** | **Build** (tool boundary) |
| S4 Secret handling | SecretRef, `.env` block, mode 600/700, keys only at Gateway | **Native** ✅ (+ discipline) |
| S5 Egress allowlist | Host firewall + `browser.ssrfPolicy` | **Build** (host) + Native |
| S6 Channel allowlist | `dmPolicy`, `allowFrom`, `requireMention`, `groupPolicy` | **Native** ✅ |
| S7 Audit/observability | `logging.redactSensitive`, `security audit --json`, + Langfuse | **Native + build** |
| S8 Prompt-injection defense | Token-literal stripping, `allowUnsafeExternalContent:false`, **blast-radius limit via S2** | **Native** (posture) ✅ |
| S9 Containment/kill switch | `sandbox docker`, loopback bind, daemon stop | **Native + build** (one-command stop) |
| S10 Quota/runaway guard | Spend cap at Gateway + send quota at tools | **Build** |

**Verdict:** 5 of 10 controls are natively satisfiable by OpenClaw config; 5 require ROMAS-side build (all at the infra/tool boundary, none requiring OpenClaw core changes). No control is *infeasible* — ADR-0020's revisit trigger "if S1–S10 prove infeasible → fall back to bespoke" is **not** triggered.

---

## 7. Residual risks (accept or mitigate before production)

| ID | Residual risk | Severity | Disposition |
|---|---|---|---|
| RR-1 | Single-operator trust model — any operator-channel compromise = send authority | High | Mitigate: minimal operator set, Tailscale-only, MFA on the channel accounts; accept residual |
| RR-2 | Prompt injection cannot be *prevented*, only contained | Medium | Accept — blast radius limited to 4 approval-gated tools (T-7) |
| RR-3 | Young, fast-moving project; renamed twice; founder joined OpenAI (Feb 2026) | Medium | Pin version; no auto-update; watch for stewardship/CVE (ADR-0020 revisit trigger) |
| RR-4 | Supply-chain via plugins/skills | Medium | Mitigate: audit + pin + first-party-only (T-9) |
| RR-5 | Self-hosted daemon ops burden (patch/monitor/backup markdown state) | Low-Med | Accept; document runbook |

---

## 8. Verification-debt closure (ADR-0020 list)

| # | Debt item | Status |
|---|---|---|
| 1 | Agent-config surface | ✅ Cleared — `openclaw.json`/`agents.list[]`; **corrected** (not SOUL.md) |
| 2 | Custom OpenAI-compatible `base_url` for Gateway fronting | ✅ Cleared — confirmed (`models.providers.<id>.baseUrl` + `api:"openai-completions"`) |
| 3 | `/gateway/security` full read → map S1–S10 | ✅ Cleared — §4 + §6 |
| 4 | Tool/skill permission scoping + can shell/browser be hard-disabled | ✅ Cleared — yes (`exec.security:"deny"`, `browser.enabled:false`, `tools.deny`) |
| 5 | Heartbeat / event-trigger for Tue/Fri cadence | ⚠️ Partial — daemon confirmed; exact trigger (`group:automation` cron vs HEARTBEAT) **confirm at build** |
| 6 | Lobster workflow engine for approval gate | ✅ Cleared (negative) — unconfirmed in official docs; **do not rely on it**; approval at tool boundary (T-2) |
| 7 | License + supply-chain | ✅ Cleared — MIT; large+active repo (376k★ per GitHub page 2026-06-01); plugin supply-chain flagged → audit (T-9) |

**Two items remain for build-time, neither blocking the decision:** the exact scheduling trigger (#5) and the per-tool approval implementation (T-2/S3). Both are ROMAS-side and well-scoped.

---

## 9. Recommendation

The decision in ADR-0020 holds. OpenClaw can be hardened to ROMAS's bar using **native config for 5 of 10 controls** and **well-scoped ROMAS-side build for the other 5**, with **no OpenClaw core changes required**. The one material refinement is the **single-operator trust boundary** (§1): customer-ops must be operator-mediated, not a public bot. Recommend flipping ADR-0020 to **Accepted** on Kimal's Q-G confirmation, with this threat model attached and the §1 refinement propagated to SSOT decision 23.
