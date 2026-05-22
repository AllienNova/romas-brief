---
title: ROMAS Brief — Product Spec
version: 1.0.0
date: 2026-05-14
mode: greenfield (planning-rich, code-empty)
owner: Kimal Honour Djam
---

# ROMAS Brief — Product Spec

## 1. Problem

Radiation oncology operates at the intersection of clinical evidence, physics, regulatory clearance, and dense technical workflow. Practitioners need a single daily signal — clinical-grade, fully cited, audio-first — that filters the global noise into 5 items they can act on before their first patient of the day. Current alternatives are general oncology newsletters (too broad), trade press (low rigor), society email lists (lagging, society-bounded), and Twitter/LinkedIn (unreliable). None deliver primary-source-cited intelligence with operational depth (physics, AI, dosimetry, workflow).

ROMAS Brief closes that gap as the public media surface of ROMAS Intelligence, sitting under the ROMAS ecosystem (whose core platform is ROMAS COS — the clinical operating system for the same audience).

## 2. Users

| Persona | Primary need | Behavior |
|---|---|---|
| Practicing radiation oncologist (attending) | Stay current on trial results, dose constraints, new modalities — pre-clinic | Reads in 5 min over coffee or listens during commute |
| Medical physicist | Track QA, commissioning, MR-Linac, FLASH, proton developments | Skims, listens to 7-min Standard episodes |
| Dosimetrist | Workflow + planning system updates, vendor releases | Selective reads, follows DVH-related items |
| RT therapist | Workflow, time-out updates, vendor releases | Lighter touch, mostly audio |
| Radiation oncology resident | Studying-grade signal with primary sources | Reads + listens; uses for journal club |
| Oncology operations / clinic admin | Reimbursement, FDA clearances, vendor launches | Skims reimbursement + vendor sections |
| RT industry (vendor / startup / investor) | Competitive intel + regulatory landscape | Listens to podcast tier, watches conference brief |

Primary launch audience: practicing radiation oncologists in the US, EU, UK, Canada, Japan, Australia. Tier 4 Conference Brief broadens to industry during ASTRO/ESTRO/AAPM windows.

## 3. Use cases

1. **Pre-clinic catch-up** — open the daily issue at 07:00 ET, read 5 items, listen to 7-min daily brief on commute.
2. **Journal club prep** — resident pulls primary source URLs and ROMAS Take to seed discussion.
3. **Conference week** — attend ASTRO, get the daily Conference Brief at end-of-day with embargo-aware coverage.
4. **Friday deep read** — Friday "The ROMAS Read" rotates four sub-rubrics (Week in Receipts, Five Things That Shifted, What I Got Wrong, Watch Next Week).
5. **Audio commute** — subscribe to RSS feed, listen to 5–10 min episodes.
6. **Embed in clinic workflow** — share article URLs in clinic Slack / Teams when a relevant 510(k) or guideline drops.

## 4. Functional requirements (MoSCoW)

IDs are `FR-NNN`. Every MUST traces to ≥1 task in `MASTER_IMPLEMENTATION_PLAN.md`.

### MUST

| ID | Requirement | Maps to |
|---|---|---|
| FR-001 | Daily ingestion runs Mon–Fri 10:30 UTC, fetches from the canonical source list (`.claude/skills/source-ingestion.md`), logs every source to `source_health`. | T-101..T-105, T-115 |
| FR-002 | Six-axis signal scoring (Clinical 0.30 + AI 0.25 + Physics 0.15 + Operational 0.15 + Novelty 0.10 + Confidence 0.05) applied to every candidate. | T-117, T-118 |
| FR-003 | Top-5 selection excludes embargoed items; produces fewer than 5 if fewer qualify (never pad). | T-119 |
| FR-004 | Every article has a non-null `primary_source_url`; schema-enforced. | T-103 (DB constraint) |
| FR-005 | Every clinical claim has a `claims` row linking to a primary source. | T-104, T-216 |
| FR-006 | Embargoed items live in `embargo_holds`, never in `articles` until release; schema-enforced consistency. | T-103, T-119 |
| FR-007 | Audio Brief generated per article, 10-beat structure, ElevenLabs primary + PlayHT failover. | T-201..T-210 |
| FR-008 | Audio mastered to -16 LUFS / -1 dBTP. DB publish gate widened to `[-18, -14]` LUFS per ADR-0016; the tight -16 ±1 LUFS production target is enforced by the audio-qa-reviewer agent. | T-205, T-208 |
| FR-009 | Audio QA gate flip requires **all five** schema-enforced conditions: `clinical_claims_checked = true`, `qa_reviewer IS NOT NULL`, `loudness_lufs BETWEEN -18 AND -14` (ADR-0016), `true_peak_dbtp <= -1`, `transcript_url IS NOT NULL`. See `contracts/supabase-schema.sql` `audio_publish_requires_qa` CHECK. | T-104 constraint, T-209 UI |
| FR-010 | Whisper-generated transcript per audio episode, stored in R2 alongside audio. | T-207 |
| FR-011 | Four per-tier RSS feeds: `audio-brief.xml`, `daily-brief.xml`, `podcast.xml`, `conference-brief.xml`. | T-214, T-309, T-503, T-605 |
| FR-012 | Revoke kill switch: revoke flip → CDN purge by tag → RSS regenerate; 60s SLA; watchdog alerts if `cdn_purge_at` null after 90s. | T-212, T-213, T-219 (watchdog) |
| FR-013 | Reader site (Next.js on Cloudflare Pages) renders article + AudioPlayer Variant A inline + Variant B banner + audio status badge. | T-301..T-308 |
| FR-014 | **Newsletter delivery via Beehiiv** on publish (daily issue Mon–Thu, Friday Read, Audio Podcast notification, Conference Brief notification). Beehiiv is canonical subscriber-list source; Supabase `subscribers` syncs via webhooks. Plausible analytics on reader; no cookies. | T-310, T-312 |
| FR-014A | **Transactional email via Resend**: signup confirmation, unsubscribe receipt, audio-revocation public notice, password reset. React-Email templates; EU region; RFC 8058 one-click unsubscribe. | T-310A, T-311 |
| FR-022 | **Tier 5 Video Podcast with invited human guest** launches Day 60. Video recorded, edited, hosted (vendor TBD ADR-0012), distributed via new `video-podcast.xml` RSS feed (video enclosure type) + reader Watch page. Guest booking + recording workflow + editing + uploading flow owned by new agent role TBD. | T-651..T-660 (new M6.5) |
| FR-023 | **Beehiiv ↔ Supabase subscriber sync**: webhook handler at `workers/beehiiv-webhook` verifies HMAC-SHA256 signature against `BEEHIIV_WEBHOOK_SECRET`, updates Supabase `subscribers.status` on subscribe/unsubscribe/bounce/complaint. Daily reconciliation job alerts on >5 or >0.5% drift (whichever greater). | T-310C, T-310D |
| FR-024 | **500-article pre-launch seed import**. Articles authored in editorial workflow during W-8..W-1; imported into Supabase `articles` table via bulk-insert script. Every article has `primary_source_url`, `audience_tags`, `region`, `modality_tags`, `disease_site_tags`, `signal_scores`, `composite_score`. Distribution matches SSOT §12.2 matrix (11 categories × 8 regions × 8 audiences × 8 content types × 5 freshness bands × 5 signal-score bands). | T-NEW1 (M2 pre-launch seed) |
| FR-025 | **8 region surfaces** at `/regions/{slug}`. Pages: us · europe · uk · apac · canada · latam · mena-africa · global. Each lists articles tagged with that region, sortable by date/signal-score, filterable by category. Per SSOT §12.2 row 2 counts. | T-NEW2 |
| FR-026 | **11 category surfaces** at `/categories/{slug}`. Pages: ai · physics · clinical-rt · regulatory · guidelines · reimbursement · vendor · conferences · resident-education · future-rt · operations. Each has sub-category navigation per Launch Plan §2.1 sub-splits (e.g., AI = auto-contouring / auto-planning / adaptive-AI / outcome-prediction / QA-automation / synthetic-CT-MRI / LLM-copilots / AI-validation). | T-NEW3 |
| FR-027 | **5+ audience-filter surfaces** at `/for/{audience}`. Pages: physicians · physicists · dosimetrists · therapists · residents (industry/investor/researcher optional). Each resolves to ≥30 articles. Per SSOT §12.2 row 3. | T-NEW4 |
| FR-028 | **Homepage = 8 modules** per Launch Plan §4 (canonicalized in SSOT §12.3): Hero · Top Stories grid (6) · Industry moves (3) · Paper of the Day · Quick Hits (5) · Today's podcast · Trending now · Top Papers This Week (5). Each module is its own React server component reading from `articles` with the corresponding filter (signal-score band + freshness band + content-type tag). | T-NEW5 |
| FR-029 | **8 content-type filters**: news_brief · paper_critique · practice_delta · fda_brief · reimbursement_explainer · vendor_intel · long_take · primer. Each has a dedicated archive page + filter chip on category pages. | T-NEW6 |
| FR-030 | **Day-1 audio inventory** (~50 episodes): 30 Tier 1 Audio Briefs (per top-30 articles) + 5 Tier 2 Daily Briefs (rehearsal recordings) + 10 Tier 3 Audio Podcasts (weekly cadence buffer) + 5 Tier 4 Conference Briefs (ASTRO 2025 / ESTRO 2025 / AAPM 2025 + 2 historicals). All pre-mastered to -16 LUFS / -1 dBTP, transcripted, QA'd, uploaded to R2, RSS-indexed before Day 1. *(Exact breakdown pending Kimal confirmation per SSOT §12.5.)* | T-225..T-230 (Podcast 001) + T-NEW7..T-NEW10 |
| FR-031 | **`romasbrief.com/issues/{YYYY-MM-DD}`** canonical issue URLs. Pre-launch issue archive has First 5 issues drafted + queued per Launch Plan §8 row 13. | T-NEW11 |
| FR-032 | **Worldwide positioning (locked SSOT §3 row 15)**. Region distribution: US 110 (22%) / Canada 20 (4%) / Europe 160 (32%) / APAC 130 (26%) / LATAM 40 (8%) / MENA-Africa 20 (4%) / Global 20 (4%). Top Stories grid quota: **max 2 of 6 cards from the same region**. No US-default homepage; region toggle in header (Cloudflare `cf-ipcountry` auto-detect + reader override). | T-NEW12, T-NEW18 |
| FR-033 | **Three-edition publish strategy (locked SSOT §3 row 16)**. APAC edition 22:00 UTC · EU edition 06:00 UTC · Americas edition 11:00 UTC. Same canonical articles; per-edition homepage re-ranks by region tag. Beehiiv segment by `region` custom field → drives delivery time per subscriber. Audio reused across editions (no triple production). | T-NEW13 |
| FR-034 | **Locale-aware formatting**. Dates via `Intl.DateTimeFormat` per reader locale (US "May 7, 2026"; EU "7 May 2026"; APAC "2026-05-07"). Currency in reimbursement articles stated in USD with parallel local currency where economically meaningful (CMS articles → USD; NICE → GBP + USD; CMS / PMDA / NMPA reimbursement → local + USD). | T-NEW14 |
| FR-035 | **China posture (locked SSOT §3 row 17)**. Read-only NMPA + CSCO-RO ingest only. No Chinese subscriber acquisition. No Beehiiv list segment for China. Reader-site availability in China not guaranteed (Cloudflare GFW issues; do not commit). Revisit at 10k global subscribers. | T-NEW15 |
| FR-036 | **6 non-US regulatory contracts at primary-source rigor**: EMA + EUDAMED official fallback chain · MHRA · PMDA · NMPA · TGA · Health Canada. Each carries identical contract semantics to `fda-510k.yaml`. Banned-as-primary sources: `meddeviceguide.com`, `MDCG.eu`, commercial regulatory blogs. | T-NEW16 (M1) |
| FR-037 | **Lexicon expansion to ~80 entries by Day 1**. 30-entry seed (`pronunciation-lexicon` skill) extended to cover: 7 non-US conferences (JASTRO/RANZCR/ESMO-Asia/KOSRO/CSCO-RO/AROI/ALATRO/SASRO) + 25+ non-US institutions (Heidelberg/Karolinska/Aarhus/Tata Memorial/Peking Union/Princess Margaret/Royal Marsden/Peter MacCallum/Sir Charles Gairdner/etc.) + 10+ vendor names with non-English origin (Elekta SE, RaySearch SE, Brainlab DE, Hitachi JP, Mitsubishi JP, SHENZHEN United Imaging CN) + 8 regulators (PMDA, NMPA, EMA, EUDAMED, MHRA, TGA, ANVISA, Health Canada) + key drug names. | T-NEW17 |
| FR-038 | **LATAM LLM-translate pipeline (locked SSOT §3 row 18, ADR-0013)**. Source records in Portuguese (ANVISA, SBR, ALATRO-PT) or Spanish (COFEPRIS, ANMAT, SLAGO, ALATRO-ES) translated via DeepL Pro primary; Claude 3.5 Sonnet verification on articles with `composite_score >= 70`. Article schema delta: `source_language` (default 'en'), `translation_provider` ({deepl\|claude\|gpt4\|human}), `translation_verified` (bool). Article body in English; `primary_source_url` cites original-language record. Mandatory non-removable footer: "Source originally in {Portuguese\|Spanish}; translated with editorial review." Verbatim quotes show original text in italic parens. | T-NEW19, T-NEW20 |
| FR-015 | Friday ROMAS Read with sub-rubric rotation; rotation tracked in `friday_read_history.json` + `friday_read_predictions.json`. | T-401..T-405 |
| FR-016 | Conference Brief tier activatable per supported conference (ASTRO/ESTRO/AAPM/JASTRO/RANZCR); embargo-aware lint on `conference-brief.xml`. | T-601..T-608 |
| FR-017 | openFDA discovery items verified against official FDA 510(k) / De Novo / PMA record before drafting. | T-216 |
| FR-018 | ROMAS Insight / ROMAS Take always labeled as interpretation; schema-enforced (`articles_insight_labeled`). | T-103 |
| FR-019 | Sponsor firewall: ≥32px isolation from wordmark; verified on every reader build. | T-307 |
| FR-020 | Subscriber count hidden until 2,500; reader returns qualitative string at app layer. | T-308 |
| FR-021 | Voice consent registry file present + referenced from audio-production-pipeline; pre-launch gate. | T-213 |

### SHOULD

| ID | Requirement |
|---|---|
| FR-S-001 | Search (Postgres FTS + pgvector) over published articles. |
| FR-S-002 | Issue archive page with month/week navigation. |
| FR-S-003 | Per-author / per-modality / per-disease-site tag pages. |
| FR-S-004 | RSS feed validators run on every publish, fail-loud. |
| FR-S-005 | Source-health dashboard accessible to Kimal. |

### COULD

| ID | Requirement |
|---|---|
| FR-C-001 | Reader bookmarks (auth required — Supabase Auth). |
| FR-C-002 | Per-user audio playback resume. |
| FR-C-003 | Auto-publish graduation for Literature + Guideline after 60d <1% correction rate. |
| FR-C-004 | Multilingual auto-summary (deferred — voice consent + brand drift risk). |

### WON'T (this release)

| ID | Why not |
|---|---|
| FR-W-001 | Patient-facing content. Out of scope. |
| FR-W-002 | Treatment plan / dose recommendation generation. Inviolable boundary. |
| FR-W-003 | EHR integration. Belongs to ROMAS COS, not ROMAS Brief. |
| FR-W-004 | ~~Video studio. Audio-first only at launch.~~ **REVERSED 2026-05-14 by Kimal for Tier 5 only.** See FR-022 — Video Podcast with invited guest at Day 60. Tier 5 is the only video surface; reader site remains text + audio. |

## 5. Non-functional requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-001 | LCP on reader homepage | < 2.5s p75 |
| NFR-002 | INP on reader interactions | < 200ms p75 |
| NFR-003 | CLS on reader article page | < 0.1 |
| NFR-004 | Daily issue publish latency (07:00 ET target) | Within ±5 min |
| NFR-005 | Audio QA → CDN withdrawal on revoke | ≤ 60s p99, alert if >90s |
| NFR-006 | Schema CHECK constraints | 100% covered by pgTAP |
| NFR-007 | Accessibility | WCAG 2.2 AA on every reader route |
| NFR-008 | Mobile breakpoint coverage | 320 / 390 / 768 / 1024 / 1440 |
| NFR-009 | Source ingestion timeout per source | 15s; failure → log to `source_health` not silent drop |
| NFR-010 | RSS feeds | Atom 1.0 valid + iTunes/podcast namespace valid (podcast.xml) |
| NFR-011 | Secrets storage | Cloudflare Secrets + Supabase Vault only; never .env in repo |
| NFR-012 | API key rotation | 90 days routine; immediate on personnel change |
| NFR-013 | Backup | Supabase PITR enabled (7d minimum); R2 archive bucket replication off-region |
| NFR-014 | Cookie posture | Cookieless reader (Plausible); essential cookies only in CMS (auth) |
| NFR-015 | HIPAA | Not applicable. Zero PHI ingest. ToS carries "No PHI" clause. |
| NFR-016 | GDPR | EU subscribers: data minimization (email only), right to erasure honored, DPA with Supabase + Cloudflare + Resend + ElevenLabs + PlayHT. |

## 6. Success metrics (KPIs)

| KPI | Target (Day 30) | Target (Day 90) | Target (Day 365) |
|---|---|---|---|
| Active subscribers | 500 | 2,500 (count flips to public) | 10,000 |
| Daily open rate (email) | 35% | 45% | 50% |
| Audio play-through rate (Tier 1) | 40% | 55% | 60% |
| Correction rate (per published article) | <2% | <1% | <0.5% |
| Audio revocations per month | <2 | <1 | <0.5 |
| Source-health green rate | 90% | 95% | 98% |
| RSS feed validation pass rate | 100% | 100% | 100% |
| Friday Read open rate uplift vs daily | +10% | +15% | +20% |
| Conference week subscriber net-adds (ASTRO) | n/a | +500 in week | +2,000 in week |

## 7. Out of scope (this release)

- Patient-facing surfaces
- Treatment planning, dose calculation, or any clinical decision support
- EHR / FHIR integration (belongs to ROMAS COS)
- Video / livestream
- Native mobile apps (web + RSS only)
- Paid tier / membership (free at launch; revisit at 10k subscribers)
- Multi-language (English at launch)

## 8. Open questions

See `SSOT.md §10`. Material to product: Q1 (tagline wording), Q2 (podcast launch day), Q6 (second reviewer activation), Q7 (auto-publish graduation criteria).

## 9. Revision history

| Date | Version | Change |
|---|---|---|
| 2026-05-14 | 1.0.0 | Initial product spec, written against /team-review's 19 findings and the locked decisions ledger v2.1. |
