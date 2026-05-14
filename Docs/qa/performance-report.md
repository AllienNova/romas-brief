---
title: Performance Report — NFR review (plan-level)
version: 1.0.0
date: 2026-05-14
scope: NFR auditability + ownership for the 500-article + ~50-audio launch + three-edition delivery. No code → no Lighthouse / load-test / EXPLAIN ANALYZE runs yet.
---

# Performance Report — Plan-Level NFR Review

## NFRs declared in product-spec.md

| NFR ID | Target | Owner agent / module | Testable plan present? | Risk |
|---|---|---|---|---|
| NFR-001 | LCP < 2.5s p75 on reader homepage | web-engineer · `apps/reader` | YES — Lighthouse via Chrome DevTools MCP; `test-qa-plan` G8 device test + Lighthouse perf budget warn-only at PR (P2 finding T-15 to make blocking at staging) | **Risk: 8-module homepage** (SSOT §12.3). Hero photo + 6 Top Stories thumbnails + 3 Industry Moves + 1 Paper of Day + 5 Quick Hits + Today's Podcast embed + 10 Trending + 5 Top Papers = ~30 images above the fold. LCP target requires aggressive image optimization (AVIF + responsive srcset + CDN), lazy-load below-fold, and server-render-first. Untested. |
| NFR-002 | INP < 200ms p75 | web-engineer | YES — Chrome DevTools MCP | Acceptable risk |
| NFR-003 | CLS < 0.1 | web-engineer + design-system-keeper | YES — Chrome DevTools MCP | Risk: AudioPlayer Variant B sticky banner mounting can shift layout if not reserved-space |
| NFR-004 | Daily issue publish latency ±5 min of target | Cron + workers/cron-ingest | Partially — depends on three-edition implementation (cycle-5 lock). No A-NNN written for three-edition timing. | **P1 risk** — three-edition wall-clock budget undefined. APAC edition 22:00 UTC means content authored by ~20:00 UTC. EU edition 06:00 UTC means content frozen ~04:00 UTC. Americas edition 11:00 UTC means content frozen ~09:00 UTC. Editorial workflow has 3 freeze points/day not 1. Capacity unmodeled. |
| NFR-005 | Revoke → CDN withdrawal ≤60s p99 | workers/cdn-purge-watchdog + workers/audio-producer | YES — A-059, A-060 cover watchdog. F-S-001 cycle-1 still requires implementation in M2. | F-S-001 carry-forward |
| NFR-006 | Schema CHECK constraints 100% covered by pgTAP | cms-engineer | YES — A-013..A-019. But cycle-1 critic F-P2-05 flagged enum-CHECK coverage missing (archetype/tier/status enums, claims.confidence, qa_reviewers.role, audio_jobs.tier, title length). | **P2 — coverage gap from cycle-1 unfixed** |
| NFR-007 | WCAG 2.2 AA on every reader route | design-system-keeper + web-engineer | Partially — G8 device test mentions axe-core. axe severity threshold ambiguous (cycle-1 F-P2-06). | P2 |
| NFR-008 | Mobile breakpoint coverage 320/390/768/1024/1440 | web-engineer | YES — Playwright multi-viewport | Acceptable |
| NFR-009 | Source-ingest timeout 15s per source; log to source_health on failure | regulatory-analyst + workers/cron-ingest | Partially — per-contract timeouts vary: openFDA 15s, FDA 510k 30s, PMDA 45s, NMPA 60s, EU contracts 30s. **MHRA/TGA/Health Canada documented as 30s exceeds the stated 15s blanket NFR.** | **P2 — NFR vs contract drift** |
| NFR-010 | RSS feeds valid (Atom 1.0 + iTunes podcast namespace) | rss-publisher | YES — A-036..A-042 | OK |
| NFR-011 | Secrets storage CF Secrets + Supabase Vault only | DevOps | YES — gitleaks G7 + R-111 M1 | OK |
| NFR-012 | API key rotation 90d | DevOps | YES — SECRETS.md M1 deliverable; deployment-plan §5 | Cycle-2 F-P1-08 closed |
| NFR-013 | Supabase PITR ≥7d; R2 archive replication | cms-engineer + DevOps | Partially — cycle-1 F-P2-09 flagged R2 cross-region replication has no owning task. | P2 — track per F-P2-09 |
| NFR-014 | Cookieless reader (Plausible) | web-engineer | YES — ADR-0008 + FR-014 | OK |
| NFR-015 | HIPAA not applicable | Documented | YES — Master Strategy §7.1 | OK |
| NFR-016 | GDPR DPA inventory + erasure endpoint | Kimal + web-engineer | Partially — DPA inventory M1; right-to-erasure endpoint not in FRs. | **P1 — missing FR for erasure endpoint** |

## Day-1 scale capacity targets (added cycle-4, not in cycle-1 NFRs)

| Surface | Day-1 target | Capacity plan present? |
|---|---|---|
| Reader site | ~500 articles indexed, browse + filter + search live | Partial — pgvector + Postgres FTS planned (FR-S-001 SHOULD); 500-article seed import script not detailed (T-NEW1 placeholder) |
| Beehiiv | 500-article archive + first subscriber acquisition; pricing free until 2,500 | Partial — Beehiiv archive seed plan absent |
| R2 audio | ~50 audio episodes × avg ~30 MB MP3 = ~1.5 GB. Free tier covers; egress depends on play count | OK |
| Supabase | 500 article rows + ~50 audio_jobs + ~50 transcripts + ~80 lexicon entries + initial subscribers. Trivial DB load. | OK |
| Cloudflare cache | 4-5 RSS feeds + 500 article URLs + 8 module endpoints + 11 category pages + 8 region pages + 5+ audience pages = ~530 cacheable URLs at launch | TTL 300s active / 86400s cold per cycle-1 R-N-006; reasonable |
| Three-edition publish wall-clock | APAC 22:00 UTC → ~10 min wall-clock; EU 06:00 UTC → ~10 min; Americas 11:00 UTC → ~10 min. Beehiiv segment by `region` drives timing. | **P1 risk** — three-edition wall-clock budget not modeled |

## DB query-plan estimates (no code yet; estimates from index plan)

| Query | Index plan | Estimate Day 1 (500 articles) | Estimate Day 365 (~1,800 articles) | Verdict |
|---|---|---|---|---|
| Homepage Hero | `articles_score_band_idx` WHERE band='hero' ORDER BY published_at DESC LIMIT 1 | <1ms | <1ms | OK |
| Top Stories grid | `articles_score_band_idx` WHERE band='strong' AND published_at > now()-7d LIMIT 6 | <2ms | <5ms | OK |
| Category page | `articles_category_idx` WHERE category=X ORDER BY published_at DESC LIMIT 20 OFFSET N | <5ms | <10ms | OK |
| Region page | `articles_region_gin` GIN index on `region` text[] | <10ms | <20ms | OK |
| Audience filter | `articles_audience_gin` GIN | <10ms | <20ms | OK |
| Search FTS+pgvector | tsvector + pgvector cosine similarity | <50ms | <100ms | OK Day 1; revisit at 10k articles |
| Three-edition fan-out subscriber select | `subscribers_active` WHERE region IN (...) | <50ms at 2,500; <500ms at 50k | At 50k requires batching | OK Day 1 |

## Load tests planned

None defined yet. Expected pre-launch: synthetic load test of three-edition publish flow at 2,500-subscriber scale (Beehiiv free tier cap) — M2 deliverable not yet tasked.

## Performance verdict

**YELLOW.** NFR targets are reasonable and mostly testable, but **three-edition publish wall-clock budget is unmodeled** and the **right-to-erasure FR is missing** despite GDPR commitment. Eight-module homepage LCP is the largest concrete risk and only verifiable post-M3. No production performance evidence exists yet (code-empty).
