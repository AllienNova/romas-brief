# ROMAS Wire — Claude Code Agent Kit

This kit gives Claude Code everything it needs to build, operate, and ship ROMAS Wire — the public media surface of ROMAS Intelligence (clinical intelligence for modern radiation oncology).

> Tagline: **Radiation oncology, decoded daily.**

---

## What's in this kit

```
romas-brief-agent-kit/
├── CLAUDE.md                          ← Project context (loaded every session)
├── AGENT.md                           ← Operating manual (orchestration, invariants, escalation)
├── README.md                          ← You are here
└── .claude/
    ├── skills/                        ← 14 skills (the "how to" reference)
    │   ├── editorial-style-guide.md
    │   ├── audio-production-pipeline.md
    │   ├── audio-qa-checklist.md
    │   ├── pronunciation-lexicon.md
    │   ├── rss-feed-spec.md
    │   ├── cms-schema.md
    │   ├── design-tokens.md
    │   ├── component-library.md
    │   ├── signal-scoring.md
    │   ├── source-ingestion.md
    │   ├── embargo-handling.md
    │   ├── friday-read-format.md
    │   ├── conference-brief-mode.md
    │   └── claim-verification.md
    ├── agents/                        ← 13 specialist subagents
    │   ├── editorial-director.md      (orchestrator)
    │   ├── clinical-fact-checker.md
    │   ├── physics-reviewer.md
    │   ├── regulatory-analyst.md
    │   ├── signal-scorer.md
    │   ├── audio-producer.md
    │   ├── audio-qa-reviewer.md       (the gate — flips audio_status to published)
    │   ├── rss-publisher.md
    │   ├── cms-engineer.md
    │   ├── web-engineer.md
    │   ├── design-system-keeper.md
    │   ├── friday-read-editor.md
    │   └── conference-mode-operator.md
    └── commands/                      ← 7 slash commands
        ├── morning-brief.md           (/morning-brief)
        ├── friday-read.md             (/friday-read)
        ├── conference-day.md          (/conference-day)
        ├── audio-qa.md                (/audio-qa <id>)
        ├── revoke-audio.md            (/revoke-audio <id>)
        ├── score-candidates.md        (/score-candidates <file>)
        ├── verify-claims.md           (/verify-claims <slug>)
        └── new-migration.md           (/new-migration <intent>)
```

---

## How Claude Code uses it

1. **Open the repo in Claude Code.** `CLAUDE.md` loads automatically — that's the project context.
2. **`AGENT.md` is read at session start** — that's how the agent knows what role to play.
3. **Skills load on demand.** When a task matches a skill (audio, RSS, schema, etc.), Claude pulls in the skill file.
4. **Subagents are invoked** by name (`editorial-director`, `audio-qa-reviewer`, etc.) or via slash commands.
5. **Slash commands** in `.claude/commands/` are entry points for the most common operations.

---

## Install into your repo

Drop the contents into the root of your ROMAS Wire repo:

```bash
# Copy in
cp /path/to/romas-brief-agent-kit/CLAUDE.md ./
cp /path/to/romas-brief-agent-kit/AGENT.md ./
cp /path/to/romas-brief-agent-kit/README.md ./AGENT-KIT-README.md   # keep your own README
cp -r /path/to/romas-brief-agent-kit/.claude ./

# Verify
ls -la .claude/skills .claude/agents .claude/commands
```

Claude Code will pick up:

- `CLAUDE.md` at project root (always loaded).
- `.claude/agents/*.md` as available subagents.
- `.claude/skills/*.md` as on-demand skills.
- `.claude/commands/*.md` as slash commands.

---

## The six inviolable rules (you cannot bypass these)

1. **No primary source URL → no publish.** Schema-enforced.
2. **Embargoed items never enter the publish queue.**
3. **ROMAS Insight / Take is always labeled as interpretation.**
4. **openFDA discoveries verified against the official FDA record before drafting.**
5. **Source failures logged to source-health — never silently dropped.**
6. **No audio publishes without editorial QA pass.** Schema-enforced (`clinical_claims_checked = true` AND `qa_reviewer IS NOT NULL`).

---

## The four audio tiers

| Tier | Length | Cadence | Feed |
|---|---|---|---|
| Audio Brief | 5 / 7 / 10 min | Per article | `audio-brief.xml` |
| Daily Brief | 10–15 min | Daily roundup (Day 14+) | `daily-brief.xml` |
| Podcast | 30–60 min | Weekly (Day 30–45+) | `podcast.xml` |
| Conference Brief | 15–30 min | During ASTRO/ESTRO/AAPM/JASTRO/RANZCR | `conference-brief.xml` |

Every Audio Brief opens with: *"From ROMAS Intelligence — clinical intelligence for modern radiation oncology."*

Podcast (tier 3) is the only place that closes with: *"Not headlines. Clinical intelligence."*

---

## Daily operating cadence

| Time (ET) | What happens |
|---|---|
| 06:30 | Cron `ROMAS Wire — Global Morning Brief` fires. |
| 06:30–06:45 | `editorial-director` + `signal-scorer` rank candidate pool. |
| 06:50–08:30 | Article drafting (top-5). |
| 08:30–09:30 | `clinical-fact-checker` + `physics-reviewer` review. |
| 09:45–10:30 | `audio-producer` → **`audio-qa-reviewer` gate**. |
| 10:30–11:00 | `rss-publisher` + `web-engineer` ship the issue. |
| Friday | `friday-read-editor` runs Thu 17:00 → Fri 06:00. |
| Conference weeks | `conference-mode-operator` activates Conference Brief tier. |

---

## Companion documents (live alongside this kit)

- `ROMAS-Brief-Design-Specification.md` (v1.1) — UI / component / token spec
- `ROMAS-Brief-Audio-Architecture.md` (v1.0) — full audio system spec
- `ROMAS-Brief-Daily-Production-Runbook.md` (v1.1) — editorial workflow
- `ROMAS-Brief-500-Article-Launch-Plan.md` (v1.1) — audio ramp + launch
- `ROMAS-Brief-Master-Strategy.md` (v2.1) — strategy + locked decisions ledger

Copy these alongside `CLAUDE.md` so the agent can read them as referenced.

---

## Tech stack defaults

- TypeScript (strict) / Node 20+
- Supabase (Postgres + RLS + Auth)
- Cloudflare Pages + Workers + R2
- ElevenLabs (TTS primary) + PlayHT (failover)
- Next.js + Tailwind for reader surface
- Resend / Postmark for email
- Plausible for analytics

---

## Style invariants (Kimal's voice)

- Direct, no fluff.
- No emojis. Ever.
- Never the word "scrape" — use collect / extract / gather / fetch.
- No hype words ("revolutionary", "groundbreaking") unless quoting a primary source.
- Sign-off on Friday Read: `— Kimal`.

---

## Updating the kit

- **Skill update**: edit the file in `.claude/skills/`. Bump version in the file footer.
- **Subagent update**: edit the file in `.claude/agents/`. Keep frontmatter `description` accurate (Claude uses it for routing).
- **New locked decision**: log it in `AGENT.md` §13 decision log.
- **Never edit a shipped Supabase migration.** Always append a new one.

---

*Last updated: 2026-05-12. Kit version 1.0.0. Aligns to: Design Spec v1.1, Audio Architecture v1.0, Runbook v1.1, Launch Plan v1.1, Master Strategy v2.1.*
