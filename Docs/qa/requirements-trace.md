# ROMAS Brief — Requirements Traceability Matrix

**Version:** 1.0.0
**Date:** 2026-05-14
**Persona:** Test Engineer (/team-qa, plan-QA cycle)
**Scope:** FR-001..FR-038 (product-spec.md) × T-NNN (MASTER_IMPLEMENTATION_PLAN.md + delivery-plan.md) × A-NNN (test-qa-plan.md §6 catalog) across cycles 1–6
**Repo state:** Planning-rich, code-empty. All findings are doc-level traceability gaps, not runtime defects.

---

## 0. How to read this file

Inputs read (path, line count, version):

| Doc | Path | Lines | Version |
|---|---|---|---|
| Product spec | `docs/specs/product-spec.md` | 169 | 1.0.0 |
| Master plan | `docs/MASTER_IMPLEMENTATION_PLAN.md` | 358 | 1.1.0 (cycle-2 scope lock) |
| Delivery plan | `docs/specs/delivery-plan.md` | 314 | 1.1.0 (cycle-2 scope lock) |
| Test/QA plan | `docs/specs/test-qa-plan.md` | 344 | 1.0.0 |
| Critic review | `docs/specs/critic-review.md` | 357 | cycles 1–6 |

**Status values used in the FR matrix (§1):**

| Status | Meaning |
|---|---|
| `TRACED` | FR has at least one concrete task row (owner + estimate + depends + accept) AND at least one matching A-NNN row in the test-qa-plan catalog. |
| `T-PLACEHOLDER` | FR cites a T-NNN that exists only as a prose reference in a cycle scope-lock or cycle-deltas section — no concrete row with owner / estimate / depends / accept exists in MASTER §B–H or delivery-plan §3. |
| `A-MISSING` | FR has a concrete T-NNN row but no corresponding A-NNN row exists in `test-qa-plan.md §6` (sections 6.1–6.10). |
| `A-PROMISED-UNWRITTEN` | An A-NNN id is named in `critic-review.md` cycle-4/5 "pending follow-on" tables (A-061..A-075) but no row exists in §6 yet. |
| `BOTH-MISSING` | Neither concrete T-NNN row nor A-NNN row exists. |
| `SPEC-AMBIGUOUS` | FR cell maps to multiple T-NNN ids of mixed status, or the FR text itself has known internal ambiguity (e.g., F-P1-01 5-vs-4 condition history on FR-009). |

**Two parallel A-NNN schemes exist** (this is itself finding G-01):
- **Catalog scheme** (`test-qa-plan.md §6`): A-001..A-060 — the 60-row acceptance catalog with Given/When/Then, level (U/I/E), and source citation.
- **Task-cell scheme** (`delivery-plan.md §3` and `MASTER_IMPLEMENTATION_PLAN.md §B–H` "Accept" column): A-101..A-705 — numbered by task (T-101 → A-101), no Given/When/Then, no §6 catalog entry.

Wherever a row below cites an A-NNN from the task-cell scheme without a parenthetical "(catalog: A-XXX)", that A-NNN is **not** a real acceptance test — it is a placeholder pointer to a row that has never been written. See finding **G-01**.

---

## 1. FR coverage matrix (FR-001..FR-038)

### 1.1 MUST requirements

| FR ID | Title (verbatim §4 product-spec) | Status | Implementation task(s) | Acceptance test(s) — catalog scheme | Issues |
|---|---|---|---|---|---|
| FR-001 | Daily ingestion Mon–Fri 10:30 UTC + `source_health` log (product-spec L48) | **TRACED (partial)** | T-101..T-105 (monorepo + migrations 0001..0003, MASTER L86-90), T-115 (ingestion Worker, MASTER L100, delivery L86), T-114 (wrangler cron `30 10 * * 1-5`, MASTER L99), T-120 (source-health report, MASTER L105) | Catalog: **no direct A-NNN.** Closest = A-049 (openFDA→510(k) link req, test-qa L192), A-050 (aggregator-as-primary rejected, L193). Task-cell scheme cites A-101..A-105, A-115, A-120 — none in §6. | Cron schedule itself is not asserted by any §6 test. No A-NNN validates that 10:30 UTC fires Mon–Fri exclusively, or that source_health receives a row per source per run. Recommend new A-061-style row "Cron timestamp + source_health row count per run". |
| FR-002 | Six-axis signal scoring 0.30/0.25/0.15/0.15/0.10/0.05 (L49) | **T-MISSING** | Product-spec maps to "T-117, T-118". T-117 = CI pipeline (MASTER L102, delivery L88) — wrong. T-118 = secrets policy (MASTER L103, delivery L89) — wrong. There is **no `T-12x signal-scorer` row** in either MASTER §B or delivery §3.2. | Catalog: **none.** Six-axis weight math (clinical 0.30 etc.) is never asserted. | **P0 — already flagged by critic F-P2-01.** Signal-scoring is the central editorial primitive; six axis weights are unprotected. Add `T-124 — signal-scorer package` under M1 and `A-061` row pinning weight constants. |
| FR-003 | Top-5 selection + embargo exclusion + never-pad (L50) | **T-MISSING** | Product-spec maps to "T-119" (observability baseline, MASTER L104, delivery L90) — **wrong**. No "top-5 selector" task exists. | Catalog: A-011 (`articles_embargo_consistency`, test-qa L127), A-039 (Conference Brief embargo lint, L172), A-057 (embargo lint in conference mode, L210). None test the top-5 selection logic or the never-pad rule. | **P0.** Twin of F-P2-01. Never-pad rule (FR-003 last clause) is the one inviolable rule that prevents editorial-quality drift under volume pressure; no test enforces it. Add `T-125 — top-5 selector` + A-062 "never-pad asserts < 5 when < 5 candidates". |
| FR-004 | `articles.primary_source_url` NOT NULL — schema-enforced (L51) | **TRACED** | T-103 (migration 0001 articles + DB constraint, MASTER L88) | Catalog: **A-010** "`articles.primary_source_url` NOT NULL enforced" (test-qa L126). | Clean trace. Cited correctly at `contracts/supabase-schema.sql:57-58`. |
| FR-005 | Every clinical claim → `claims` row (L52) | **TRACED** | T-104 (audio_jobs incl. claims, MASTER L89), T-216 maps in product-spec but actual claim-trace migration is **T-106 (`claim_trace` table, MASTER L91)** — product-spec cell is wrong. | Catalog: **A-052** "Every clinical claim has a `claims` row" (test-qa L195). | **P2.** Product-spec cell cites T-216 (AudioPlayer Variant B, MASTER L140); should cite T-106. Cosmetic doc bug. |
| FR-006 | `embargo_holds` schema-enforced consistency (L53) | **TRACED** | T-103 (migration 0001 — articles has `embargoed` + `embargo_until`), T-107 (migration 0005 — `embargo_hold` table, MASTER L92), T-119 in product-spec is wrong (observability) — should be T-121 (embargo bootstrap, MASTER L106). | Catalog: **A-011** `articles_embargo_consistency` (test-qa L127), **A-039**, **A-057**. | **P2.** Product-spec cites T-103, T-119 — the T-119 cite is wrong, should be T-107 + T-121. |
| FR-007 | Audio Brief 10-beat + ElevenLabs + PlayHT failover (L54) | **TRACED** | T-201 lexicon (MASTER L125), T-202 ElevenLabs (L126), T-203 PlayHT failover (L127), T-204 loudness (L128), T-205 10-beat script (L129), T-206 pre-roll (L130), T-207 archive (L131), T-208 CDN (L132), T-209 QA UI (L133), T-210 checklist (L134). | Catalog: **A-020** 10-beat order (test-qa L141), **A-021** beat-skip override (L142), **A-026** ElevenLabs→PlayHT failover (L147), **A-027** both providers failing → skipped (L148), **A-031** pre-roll string (L159). | Clean trace. |
| FR-008 | -16 LUFS / -1 dBTP, DB gate -18..-14 (ADR-0016) enforced at publish; production target -17..-15 enforced by audio-qa-reviewer (L55) | **TRACED** | T-205 (10-beat script, MASTER L129) — product-spec cell wrong (should be T-204 loudness), T-208 — also wrong (should be T-204 + T-209 + T-220). | Catalog: **A-015** loudness out of band (test-qa L131), **A-016** true_peak too hot (L132), **A-024** loudness fixture WAV in [-18,-14] DB gate / [-17,-15] target (L145, build-2026-05-21 updated), **A-025** loudness rejection on hot fixture (L146). | **P2 doc.** Product-spec maps FR-008 to "T-205, T-208" — both wrong. Should be T-204 + T-209 + T-220 (retry cap). |
| FR-009 | **Five-condition** QA gate flip: `clinical_claims_checked=true` AND `qa_reviewer NOT NULL` AND `loudness_lufs BETWEEN -18 AND -14` (ADR-0016 widen) AND `true_peak_dbtp <= -1` AND `transcript_url NOT NULL` (L56, cites `contracts/supabase-schema.sql` audio_publish_requires_qa) | **TRACED** | T-104 (audio_jobs CHECK, MASTER L89), T-209 (QA UI enforces all 5 incl. amber soft-warning for the production target window, MASTER L133, delivery L108). | Catalog covers **all 5 conditions**: **A-013** qa_reviewer null (test-qa L129), **A-014** clinical_claims_checked false (L130), **A-015** loudness OOB (L131), **A-016** true_peak too hot (L132), **A-017** transcript_url null (L133). Plus **A-030** "all 4 conditions absent" (L158). | **Cycle-2 fix verified + cycle build-2026-05-21 widen.** Critic F-P1-01 (5-vs-4 drift) cleanly resolved: product-spec FR-009 lists all 5 conditions including `true_peak_dbtp <= -1`. ADR-0016 widens the loudness band at the DB layer only; the 5-condition shape is unchanged. **One residual P2:** A-030 title still says "blocks all 4 conditions absent" (test-qa L158) — should be "all 5". Cosmetic. |
| FR-010 | Whisper transcript per audio, R2-co-located (L57) | **TRACED** | T-207 (WAV archive, MASTER L131) — should be **T-221** (transcript generator, MASTER L145, delivery L120). Product-spec cell wrong. | Catalog: **A-017** transcript_url null (test-qa L133), **A-028** transcript present before publish (L149), **A-042** `podcast:transcript` enclosure (L175). | **P2 doc.** Product-spec FR-010 cites T-207 — should be T-221. Cycle-2 added `ADR-0011-whisper-transcription.md` + `contracts/whisper.yaml` (critic L121) — the integration is no longer at-risk per F-P1-03 close. |
| FR-011 | Four per-tier RSS feeds (audio-brief / daily-brief / podcast / conference-brief) (L58) | **TRACED** | T-214 audio-brief (MASTER L138, delivery L113), T-309 daily-brief (MASTER L184, delivery L135), T-503 podcast full (MASTER L235, delivery L166), T-313 podcast shell (MASTER L188, delivery L139), T-604 conference-brief (MASTER L258, delivery L179). | Catalog: **A-036** audio-brief well-formed (test-qa L169), **A-037** daily-brief well-formed + 100-item cap (L170), **A-038** podcast itunes namespace (L171), **A-039** conference-brief embargo lint (L172), **A-040** revoke removes from feed (L173), **A-041** per-tier isolation (L174), **A-042** transcript enclosure (L175). | Clean trace. The strongest-tested FR in the entire spec. |
| FR-012 | Revoke kill switch — purge ≤60s, watchdog alerts if `cdn_purge_at` null after 90s (L59) | **TRACED** | T-211 revoke worker (MASTER L135), T-212 watchdog (MASTER L136) — product-spec cell cites "T-212, T-213, T-219 (watchdog)" — **T-213 is voice consent registry (MASTER L137) and T-219 is audio-skip escape hatch (L143)**; neither is the watchdog. Watchdog is T-212. | Catalog: **A-033** revoke requires reason (test-qa L161), **A-034** CDN purge within 60s (L162), **A-040** revoke removes from feed (L173), **A-059** watchdog alerts >90s null (L217), **A-060** watchdog passes within 60s (L218). | **P2 doc.** Product-spec cites wrong T-NNN ids for the watchdog. Should be T-211 + T-212 only. |
| FR-013 | Reader site (Next.js / Cloudflare Pages) + AudioPlayer A inline + AudioPlayer B banner + AudioStatus badge (L60) | **TRACED (partial — see critic F-P2-02)** | T-301..T-306 reader scaffold + homepage + article + listen + categories + filters (MASTER L176-181). Product-spec cites "T-301..T-308" — but T-307 = search (MASTER L182), T-308 = Daily Brief Worker (MASTER L183). Critic F-P2-02 already flagged this. | Catalog: **A-043** Variant A inline (test-qa L181), **A-044** Variant B banner (L182), **A-045** badge color matches state (L183), **A-047** subscriber count (L185), **A-048** no co-branded masthead before Day 90 (L186). | **P2 cosmetic.** FR-013 should cite T-301..T-306 + T-215 + T-216 + T-217 (the AudioPlayer + AudioStatus components, MASTER L139–141). |
| FR-014 | **Newsletter delivery via Beehiiv** (cycle-3 split, L61) | **SPEC-AMBIGUOUS** | Product-spec maps to "T-310, T-312". MASTER L185 T-310 still reads "Email issue (Resend)" — has **not** been rewritten to Beehiiv. delivery L136 T-310 same. **MASTER §D was not updated in cycle-3** (critic L186 explicitly notes "what is NOT updated yet — cycle-3 only rewrote the scope-lock header"). | Catalog: **none.** No A-NNN tests Beehiiv issue send, segment-by-region delivery time, webhook auth (FR-023), or HMAC verification. | **P0.** The single largest open work item: FR-014 + FR-014A + FR-023 all reference Beehiiv tasks (T-310C / T-310D for webhook + reconciliation) that exist **only as cycle-2 scope-lock prose** in MASTER L21 and delivery L21 — no concrete task rows. Plus no A-NNN coverage. See cycle-5 pending follow-on (critic L277) which lists "A-068..A-075 cycle-5 regional-mix tests" but those are also unwritten. |
| FR-014A | **Transactional email via Resend** (cycle-3 split, L62) | **T-PLACEHOLDER** | Product-spec maps to "T-310A, T-311". T-310A is named in MASTER scope-lock header (L21) and delivery header (L21) but has **no concrete row**. T-311 = subscriber count display (MASTER L186, delivery L137) — **wrong**, that is FR-020. | Catalog: **none.** No A-NNN tests Resend transactional flows (signup confirmation, unsubscribe receipt, audio-revocation public notice, password reset). RFC 8058 one-click unsubscribe not tested. | **P1.** T-310A needs a concrete row in MASTER §D.1 / delivery §3.4 with owner / estimate / depends / accept. Plus A-061-range row for each of the 4 transactional flows. |
| FR-015 | Friday ROMAS Read sub-rubric rotation, history.json + predictions.json (L80) | **TRACED** | T-401 subagent (MASTER L210, delivery L151), T-402 history.json (MASTER L211), T-403 predictions.json (MASTER L212), T-404 rotation logic (MASTER L213), T-405 ROMAS Read component (MASTER L214). | Catalog: **A-053** history updates after Friday issue (test-qa L201), **A-054** predictions prevent repeat in 4-week window (L202), **A-055** Friday-only copy never appears Mon–Thu (L203). | Clean trace. |
| FR-016 | Conference Brief tier activatable (ASTRO/ESTRO/AAPM/JASTRO/RANZCR); embargo-aware lint (L81) | **TRACED** | T-601..T-608 (MASTER L255-262, delivery L176-183). | Catalog: **A-039** conference embargo lint (test-qa L172), **A-056** activation creates conference tier (L209), **A-057** embargo lint blocks live abstracts (L210), **A-058** deactivation closes feed preserves history (L211). | Clean trace. |
| FR-017 | openFDA discovery → verified against FDA 510(k)/De Novo/PMA before drafting (L82) | **TRACED** | T-216 in product-spec but MASTER L140 T-216 = AudioPlayer Variant B — **wrong**. The actual implementation is in the ingestion + claim-verification skill chain — no explicit T-NNN. | Catalog: **A-049** openFDA→510(k) link required (test-qa L192), **A-050** aggregator never primary (L193), **A-051** press release primary needs source_type='press' (L194). | **P2.** Product-spec FR-017 cites T-216 (wrong task). Should reference T-115 ingestion + a new task `T-126 — claim-verification worker` not yet defined. Critic noted no claim-verification task in F-P2-01 cluster. |
| FR-018 | ROMAS Insight / Take always labeled `(interpretation)`; schema-enforced (`articles_insight_labeled`) (L83) | **TRACED** | T-103 (migration 0001 — articles CHECK, MASTER L88). | Catalog: **A-012** `articles_insight_labeled` blocks unlabeled insight (test-qa L128). | Clean trace. |
| FR-019 | Sponsor firewall ≥32px from wordmark, verified on every reader build (L84) | **TRACED** | T-307 in product-spec — **wrong** (T-307 = search, MASTER L182). Actual mapping = T-005 (M0 design-spec rule, MASTER L67, delivery L60) + T-312 (SponsorBlock with 32px firewall, MASTER L187, delivery L138). | Catalog: **A-005** podcast positioning line scope guard (test-qa L117) — **wrong A-NNN**; should be **A-046** sponsor firewall 32px enforced (L184), **A-048** no co-branded masthead before Day 90 (L186). | **P2 doc.** Both T-NNN and A-NNN columns in product-spec FR-019 are wrong. |
| FR-020 | Subscriber count hidden until 2,500; qualitative copy at app layer (L85) | **TRACED** | T-308 in product-spec — **wrong** (T-308 = Daily Brief Worker). Actual = **T-311** (Subscriber count display, MASTER L186, delivery L137). | Catalog: **A-047** subscriber count hidden until 2,500 (test-qa L185). | **P2 doc.** Product-spec cites T-308; correct is T-311. |
| FR-021 | Voice consent registry file present + referenced from audio-production-pipeline; pre-launch gate (L86) | **TRACED** | T-213 (MASTER L137, delivery L112) — product-spec cell correct. | Catalog: **none direct.** No A-NNN explicitly asserts the registry file exists or that audio publish blocks when consent is absent. Closest = A-013 (qa_reviewer required), but that's not the same control. | **P1 — gap.** Voice consent is a hard pre-launch gate (ADR-0004:71 cited in critic F-P2-08). Add `A-061-range — A-076 candidate` "publish blocks when `voice_consent_registry.consent_expires_at < now()`". |
| FR-022 | **Tier 5 Video Podcast Day 60** — guest workflow + `video-podcast.xml` + Watch page + new agent role TBD (L63, cycle-3 lock) | **T-PLACEHOLDER** | Product-spec cites "T-651..T-660 (new M6.5)". MASTER ToC L34 names "Phase G.5 (M6.5)" and L20 scope-lock header references "T-651..T-660" but **no concrete task table exists** in MASTER §G.5 or delivery §3.x. Critic L186 explicitly notes "the cycle-3 scope lock changes structural sections... the granular per-task rewrites land in cycle-4 — they are mechanical given the scope-lock declarations". As of cycle-6 close, those tables still do not exist. | Catalog: **none.** No A-NNN covers video-podcast feed validity, video enclosure type, Watch page rendering, guest booking workflow, or recording → editing → upload flow. | **P0.** Tier 5 is a Day-60 launch dependency for the entire FR-022 surface. Ten task IDs (T-651..T-660) are referenced but never defined. ADR-0012 (vendor pick) is also still open per cycle-3 lock status (critic L294 / delivery Q6). |
| FR-023 | **Beehiiv ↔ Supabase webhook sync** — HMAC-SHA256 verify, daily reconciliation, >5 or >0.5% drift alert (L64) | **T-PLACEHOLDER** | Product-spec maps to "T-310C, T-310D". Both IDs exist only in scope-lock prose (MASTER L21, delivery L21). No concrete rows. | Catalog: **none.** HMAC verification, idempotency by Beehiiv subscription_id, dead-letter queue (delivery R-17 mitigation L274) — all unwritten. | **P0.** Pairs with FR-014. The full Beehiiv chain (FR-014 + FR-014A + FR-023) has zero concrete tasks and zero acceptance tests. |
| FR-024 | **500-article pre-launch seed import** + 11×8×8×8 distribution per SSOT §12.2 (L65, cycle-4) | **T-PLACEHOLDER** | Product-spec cites "T-NEW1 (M2 pre-launch seed)". T-NEW1 is named in critic-review cycle-4 L234 "MASTER_IMPLEMENTATION_PLAN T-NEW1..T-NEW11 detailed task rows" — **pending cycle-5/6 follow-on, never landed**. Cycle-5 critic L272 still lists this as pending. | Catalog: **none.** Critic L234 promises "A-061..A-067 for distribution-matrix coverage" — **never written.** | **P0.** Highest-impact gap: 500-article seed import is the credibility scaffold for Day 1; zero coverage of import script correctness, schema-tag completeness, or matrix shape. |
| FR-025 | 8 region surfaces `/regions/{slug}` (L66) | **T-PLACEHOLDER + A-PROMISED-UNWRITTEN** | T-NEW2 — placeholder. | Catalog: **none.** A-068..A-075 cycle-5 regional-mix tests promised (critic L277) — unwritten. | **P0.** |
| FR-026 | 11 category surfaces `/categories/{slug}` + sub-category nav (L67) | **T-PLACEHOLDER + A-PROMISED-UNWRITTEN** | T-NEW3 — placeholder. | Catalog: **none.** | **P0.** |
| FR-027 | 5+ audience-filter surfaces `/for/{audience}` — each resolves to ≥30 articles (L68) | **T-PLACEHOLDER + A-PROMISED-UNWRITTEN** | T-NEW4 — placeholder. | Catalog: **none.** The "≥30 articles per audience" assertion is itself untested. | **P0.** |
| FR-028 | Homepage = 8 modules per Launch Plan §4 / SSOT §12.3 (L69) | **T-PLACEHOLDER + A-PROMISED-UNWRITTEN** | T-NEW5 — placeholder. T-302 (homepage layout, MASTER L177) describes the 8 modules in delivery L128 but the cycle-4 lock added FR-028 as a separate, more specific constraint with the 8 named modules. | Catalog: **none.** | **P0.** Reader homepage is Day-1 critical. Recommend folding T-NEW5 into a renamed T-302 with the 8 module enumeration. |
| FR-029 | 8 content-type filters + per-type archive pages (L70) | **T-PLACEHOLDER + A-PROMISED-UNWRITTEN** | T-NEW6 — placeholder. | Catalog: **none.** | **P0.** |
| FR-030 | **Day-1 audio inventory ~50 episodes** — 30 Brief + 5 Daily + 10 Podcast + 5 Conference (L71) | **T-PARTIAL + A-MISSING** | Product-spec cites "T-225..T-230 (Podcast 001) + T-NEW7..T-NEW10". T-225..T-230 exist only in cycle-2 scope-lock prose (MASTER L19, delivery L19) — no concrete rows. T-NEW7..T-NEW10 are pure placeholders (critic L234). | Catalog: **none.** No A-NNN asserts the inventory count (30/5/10/5) or that all 50 are mastered + transcripted + QA'd + R2-uploaded + RSS-indexed before Day 1. | **P0.** This is the largest content-debt risk on the entire plan (delivery R-16 H/H, L273). |
| FR-031 | `romasbrief.com/issues/{YYYY-MM-DD}` canonical issue URLs + first-5 pre-launch issues queued (L72) | **T-PLACEHOLDER** | T-NEW11 placeholder. | Catalog: **none.** Plus the URL-pattern enforcement is not tested. Critic F-P2-12 (L59) separately flagged missing T-32x DNS/domain task. | **P1.** |
| FR-032 | **Worldwide positioning** — region distribution 22/4/32/26/8/4/4; max 2-of-6 same-region in Top Stories; `cf-ipcountry` auto-detect + reader override (L73, cycle-5 lock) | **T-PLACEHOLDER + A-PROMISED-UNWRITTEN** | Product-spec cites "T-NEW12, T-NEW18". Both placeholders. Cycle-5 critic L276 schedules "Three-edition publish worker" at M2, "Reader-site region toggle in header" at M3 — neither has a T-NNN row. | Catalog: **none.** A-068..A-075 cycle-5 regional-mix tests (Top Stories 2-per-region quota named explicitly L277) promised — unwritten. | **P0.** The 2-of-6 quota is a deterministic homepage invariant; trivially unit-testable but currently untested. |
| FR-033 | **Three-edition publish strategy** — APAC 22:00 UTC / EU 06:00 UTC / Americas 11:00 UTC; same canonical articles, per-edition homepage re-rank, Beehiiv segment-by-region (L74) | **T-PLACEHOLDER + A-PROMISED-UNWRITTEN** | T-NEW13 placeholder. | Catalog: **none.** Critic L277 names "three-edition delivery green" as part of the unwritten A-068..A-075 batch. | **P0.** |
| FR-034 | **Locale-aware formatting** — dates via `Intl.DateTimeFormat`, currency USD + parallel local (L75) | **T-PLACEHOLDER + A-PROMISED-UNWRITTEN** | T-NEW14 placeholder. | Catalog: **none.** | **P1.** |
| FR-035 | **China posture** — read-only NMPA + CSCO-RO ingest only; no Chinese subscriber acquisition; reader site availability not guaranteed (L76) | **T-PLACEHOLDER** | T-NEW15 placeholder. | Catalog: **none.** No A-NNN asserts that NMPA ingest is read-only (no write path), or that the Beehiiv list has no China segment. | **P1.** Risk is bounded by delivery R-20 (L/L L277) but the "no China list segment" invariant is untested. |
| FR-036 | **6 non-US regulatory contracts at primary-source rigor** — EMA+EUDAMED / MHRA / PMDA / NMPA / TGA / Health Canada; banned-as-primary sources listed (L77) | **TRACED (contracts) / T-PLACEHOLDER (workers)** | Cycle-5 critic L258 confirms `contracts/ema.yaml`, `contracts/mhra.yaml`, `contracts/pmda.yaml`, `contracts/nmpa.yaml`, `contracts/tga.yaml`, `contracts/health-canada.yaml` authored. **But:** no T-NNN owns the ingestion-worker implementation per regulator. T-NEW16 placeholder. ANVISA + COFEPRIS + ANMAT (LATAM) still TBD per cycle-5 R-22 (delivery L279). | Catalog: **A-050** aggregator never primary (test-qa L193) covers part of it. No per-regulator A-NNN. | **P1.** Contracts exist; workers + per-regulator A-NNN tests do not. |
| FR-037 | **Lexicon expansion to ~80 entries by Day 1** — 7 non-US conferences + 25+ institutions + 10+ non-English vendor names + 8 regulators + drug names (L78) | **T-PLACEHOLDER** | T-NEW17 placeholder. Cycle-5 R-23 (delivery L280) names "expand lexicon to 80 during W-7". | Catalog: **A-022** drug name lexicon (test-qa L143), **A-023** vendor name lexicon (L144). Neither asserts the 80-entry coverage or the non-English subsets. | **P1.** Existing A-022/A-023 cover the *application* of lexicon but not the *coverage* gate (≥80 entries before Day 1). |
| FR-038 | **LATAM LLM-translate pipeline** — DeepL Pro primary + Claude verification on `composite_score ≥ 70`; new article columns `source_language` / `translation_provider` / `translation_verified`; mandatory footer attribution (L79, cycle-6 lock) | **T-PLACEHOLDER** | Product-spec cites "T-NEW19, T-NEW20" — both placeholders. Cycle-6 critic L329 tracks new schema migration `0012_translation_tracking.sql` to M1 (R-104 batch) and reader footer to M3 — but no T-NNN id is assigned. ADR-0013 + `contracts/deepl.yaml` authored. | Catalog: **none.** No A-NNN asserts `articles_translation_provider_required` CHECK constraint (cycle-6 critic L321), translation verification at score ≥ 70, footer attribution presence, or original-language quote preservation. | **P1.** Schema CHECK exists (cycle-6) but is not in §6.2 pgTAP coverage — critic F-P2-05 already flagged the broader pattern (pgTAP catalog incomplete). |

### 1.2 SHOULD requirements (FR-S-001..FR-S-005)

| FR ID | Title | Status | T-NNN | A-NNN | Issues |
|---|---|---|---|---|---|
| FR-S-001 | Postgres FTS + pgvector search | TRACED | T-307 (search migration, MASTER L182, delivery L133) | none in §6 | A-MISSING. No test for relevance ordering or pgvector index health. |
| FR-S-002 | Issue archive page with month/week nav | T-MISSING | implicit in T-302 / T-NEW11 | none | Distinct from FR-031 issue URL pattern; needs its own task. |
| FR-S-003 | Per-author / per-modality / per-disease-site tag pages | T-MISSING | none | none | No task row. SHOULD-tier but uncovered. |
| FR-S-004 | RSS validators run on every publish, fail-loud | TRACED | T-214 / T-309 / T-503 / T-604 (per-feed generators with validator pass per their delivery rows) | catalog A-036..A-042 plus G10 gate | Clean trace via G10 (test-qa L90). |
| FR-S-005 | Source-health dashboard for Kimal | TRACED | T-120 (MASTER L105, delivery L91), but no dashboard UI task — only the report generator | none | A-MISSING. No test for dashboard route render or RBAC. |

### 1.3 COULD requirements

| FR ID | Title | Status |
|---|---|---|
| FR-C-001 | Reader bookmarks (Supabase Auth) | T-MISSING (expected — COULD tier) |
| FR-C-002 | Per-user audio playback resume | T-MISSING (expected) |
| FR-C-003 | Auto-publish graduation after 60d <1% correction rate | TRACED — T-701..T-705 (MASTER L279-283), no A-NNN catalog entry (A-701..A-705 are task-cell scheme placeholders) |
| FR-C-004 | Multilingual auto-summary (deferred) | Explicitly deferred — no trace required |

### 1.4 WON'T (FR-W-001..FR-W-004) — verified

| FR ID | Title | Reverse-trace check |
|---|---|---|
| FR-W-001 | Patient-facing content. Out of scope. | No FR / task / test introduces patient surfaces — clean. |
| FR-W-002 | Treatment plan / dose generation. | Inviolable. **Cycle-3 reversed for Tier 5 only via FR-022** (product-spec L114). FR-W-002 main bound holds (no treatment plan generation); Tier 5 carve-out is a *video format*, not a clinical-decision-support feature. Verified — no contradiction. |
| FR-W-003 | EHR integration. Belongs to ROMAS COS. | No FR / task touches FHIR. Clean. |
| FR-W-004 | Video studio at launch. | **Cycle-3 reversed for Tier 5 only.** Same FR-022 carve-out. Verified — Tier 5 is the only video surface. Reader site remains text + audio. |

---

## 2. Orphan tasks (T-NNN with no FR)

Per Karpathy rule 3 (surgical changes) and Working Agreement 9 (no issues left behind), every concrete T-NNN must trace to an FR. Inventory:

| T-NNN | Title | FR linkage | Orphan? |
|---|---|---|---|
| T-001..T-011 | M0 doc hygiene (tagline, podcast day, email vendor, audio_status enum, sponsor firewall, voice consent, CDN SLA, GDPR note, no-scrape, no-emoji, primary-source field) | M0 prep; traces to FR-001 (T-001), FR-019 (T-005), FR-021 (T-006), FR-012 (T-007). **T-008 (GDPR note) traces to NFR-016, not a FR.** **T-009/T-010 (no-scrape, no-emoji) trace to CLAUDE.md §2 anti-pattern lint, not FR.** | Borderline — doc-hygiene tasks are by nature non-FR. Acceptable as **M0 cleanup**, not orphan. |
| T-101 | Monorepo scaffold | FR-001 (cited) — but also foundation for every FR | OK |
| T-102 | TS strict baseline | NFR-006 strict-mode adjacent | Acceptable infra |
| T-103..T-112 | Migrations 0001..0010 | FR-004 (T-103), FR-009 (T-104), FR-001 (T-105 sources), FR-005 (T-106 claim_trace), FR-006 (T-107 embargo_hold), **FR-002 should-cite T-108 (signal_scores) but doesn't**, FR-007/FR-037 (T-109 lexicon), FR-021 (T-110 voice consent), FR-014 (T-111 subscribers), FR-001 (T-112 source_health) | OK |
| T-113 | RLS policies | NFR-011 + FR-009 (publish flip RLS, see catalog A-032) | OK |
| T-117 | CI pipeline | NFR-006 + Quality Gates §5 | OK — but product-spec FR-002 wrongly cites this |
| T-118 | Secrets policy | NFR-011, NFR-012 | OK — but product-spec FR-002 wrongly cites this |
| T-119 | Observability baseline | NFR-005 (revoke watchdog needs metrics), NFR-014 cookie posture (Plausible) | OK — but product-spec FR-003 wrongly cites this |
| T-122 | Color tokens v1.1 | FR-013 (AudioStatus chip styling) | OK |
| T-123 / T-222 / T-314 / T-408 / T-606 / T-608 / T-705 | Sign-offs / retros / decision-log entries | Process tasks, not FR | Acceptable — sign-off discipline |
| T-204 | Loudness master | FR-008 — product-spec wrongly cites T-205 + T-208 instead | OK (target of mis-citation) |
| T-205 / T-206 / T-207 / T-208 / T-217 / T-218 / T-219 / T-220 | 10-beat script / pre-roll / WAV archive / MP3 CDN / AudioStatus chip / second-reviewer playbook / audio-skip escape hatch / loudness retry | FR-007 (T-205 / T-206), FR-008 (T-220), FR-013 (T-217). T-218 = ops doc, T-219 = AGENT.md §11 escape hatch, neither directly tied to an FR. | T-218 + T-219 are operational; acceptable. |
| T-221 | Transcript generator | FR-010 — product-spec wrongly cites T-207 | OK (target of mis-citation) |
| T-308 | Daily Brief Worker | FR-011 (daily-brief.xml) + FR-007 audio pipeline | OK — but product-spec FR-020 wrongly cites this |
| T-315 / T-316 | WCAG audit + perf budget | NFR-001..NFR-003, NFR-007 | OK |
| T-317 | Plausible events | NFR-014 + observability | OK |
| T-318 | Trending feed | FR-S-001-adjacent; arguably FR-028 (homepage 8 modules — "Trending now") | Borderline — should be cited by FR-028 |
| T-319 | Top Papers This Week | FR-028 ("Top Papers This Week (5)" module) | Should be cited by FR-028 |
| T-501..T-507 | M5 weekly podcast (dissolved cycle-2, retained for ID stability) | FR-011 (T-503 podcast feed full), FR-007 audio chain (T-501 long-form script) | OK — note F section in MASTER L225 marked DISSOLVED with content folded into M2 |
| T-602 / T-605 | Embargo-aware path + leak detector | FR-006 + FR-016 | OK |

**Verdict:** **No true orphan T-NNN.** Every concrete task either traces to an FR/NFR/process need or is a doc-hygiene/sign-off task by design. Several tasks (T-318, T-319) should be added to FR-028's reference set when the cycle-4 follow-on lands.

---

## 3. Orphan acceptance tests (A-NNN with no T-NNN)

Inventory of the 60-test catalog from `test-qa-plan.md §6`:

| A-NNN | Source-task linkage | Orphan? |
|---|---|---|
| A-001 No v1.0/v2.0 drift | M0 doc hygiene (T-001 cluster) | OK |
| A-002 Six inviolable rules verbatim | M0 / CLAUDE.md §4 | OK — but no specific T-NNN; would map to T-001 cluster |
| A-003 No "ROMAS Wire" brand refs | M0 cleanup | OK — no T-NNN |
| A-004 Tagline consistency | T-001 | OK |
| A-005 Podcast positioning scope guard | T-001 | OK |
| A-006 No banned vocab | T-009 + T-010 | OK |
| A-007 No emojis | T-010 | OK |
| A-008 Sign-off `— Kimal` | M0 / style guide | OK — no T-NNN but acceptable |
| **A-009 missing** (catalog jumps A-008 → A-010) | T-009 cites A-009 (delivery L64) | **ORPHAN-OF-MISSING.** Test-cell-scheme A-009 is named by T-009 but the catalog does not include an A-009 row. P2 doc bug. |
| A-010..A-019 | T-103 / T-104 (schema CHECK constraints) | OK |
| A-020..A-029 | T-205 / T-201 / T-204 / T-202 / T-203 / T-221 / T-207 / T-208 | OK |
| A-030..A-035 | T-209 / T-205 / T-113 (RLS) / T-211 / T-209 | OK |
| A-036..A-042 | T-214 / T-309 / T-313 / T-604 / T-211 / T-221 | OK |
| A-043..A-048 | T-215 / T-216 / T-217 / T-312 / T-311 / strategy lock | OK |
| A-049..A-052 | T-115 / T-106 / claim-verification (no T-NNN) | A-049/A-050/A-051 lack an explicit T-NNN target → **soft orphans** (the implementation lives in the cron + claim-verification skill chain that has no task). |
| A-053..A-055 | T-404 / T-406 / T-405 | OK |
| A-056..A-058 | T-601 / T-602 / T-605 / T-607 | OK |
| A-059..A-060 | T-212 watchdog | OK |

**Verdict:** Only one true orphan-of-missing: **A-009** (referenced by T-009 in delivery-plan L64 but absent from the test-qa-plan §6 catalog). A-049/A-050/A-051 are "soft orphans" — the claim-verification implementation has no dedicated T-NNN.

---

## 4. Counts summary

### 4.1 FR counts (product-spec.md §4)

| Tier | Count | IDs |
|---|---|---|
| **MUST** | 25 | FR-001..FR-021 (21) + FR-022 + FR-023 (cycle-3 adds) + FR-014A (cycle-3 split) + the 11-ID range FR-024..FR-038 totals to: 22 cycle-1 MUSTs + FR-014A + FR-022 + FR-023 (cycle-3) + FR-024..FR-031 (cycle-4, 8 FRs) + FR-032..FR-037 (cycle-5, 6 FRs) + FR-038 (cycle-6) = **38 total** |
| **SHOULD** | 5 | FR-S-001..FR-S-005 |
| **COULD** | 4 | FR-C-001..FR-C-004 |
| **WON'T** | 4 | FR-W-001..FR-W-004 |
| **Total FRs in scope** | **51** | |

(The matrix above traces 38 MUSTs + 5 SHOULDs + 4 COULDs + 4 WON'Ts = 51 rows.)

### 4.2 Task counts

| Source | Concrete rows (owner + estimate + depends + accept) | Placeholder IDs (prose only) |
|---|---|---|
| MASTER §A–H (T-001..T-705) | 73 concrete (T-001..T-011, T-101..T-123, T-201..T-222, T-301..T-319, T-401..T-408, T-501..T-507, T-601..T-608, T-701..T-705) | T-225..T-230 (Podcast 001), T-310A..T-310D (Beehiiv split), T-651..T-660 (Tier 5 Video) = **20 placeholders** |
| Cycle-4/5/6 NEW IDs | 0 concrete | T-NEW1..T-NEW20 = **20 placeholders** |
| **Total** | **73 concrete** | **40 placeholders** |

### 4.3 Acceptance test counts

| Source | Count |
|---|---|
| `test-qa-plan.md §6` catalog (real Given/When/Then rows) | **59** (A-001..A-060 minus the missing A-009; per `test-qa-plan.md L220` "Total catalog count: 60" — actual catalog has 59 due to A-009 gap) |
| Task-cell scheme A-NNN (delivery-plan §3 "Accept test" column, A-101..A-705) | **73** named (one per concrete T-NNN), **0 written** |
| Critic cycle-4 promised A-061..A-067 | 7 named, 0 written |
| Critic cycle-5 promised A-068..A-075 | 8 named, 0 written |
| **Catalog tests actually written** | **59** |
| **Tests named but unwritten** | **88** |

### 4.4 Orphan + missing-trace counts

| Category | Count |
|---|---|
| Orphan T-NNN (concrete task, no FR) | 0 (T-218, T-219 borderline — operational) |
| Orphan A-NNN (test, no T-NNN) | 1 hard (**A-009** referenced by T-009, never written) + 3 soft (A-049/A-050/A-051 lack explicit T-NNN host) |
| FR with `BOTH-MISSING` | 0 |
| FR with `T-PLACEHOLDER` | **15** (FR-014 partial, FR-014A, FR-022, FR-023, FR-024..FR-031 = 8, FR-032..FR-037 = 6, FR-038) — actual tally: FR-014A + FR-022 + FR-023 + FR-024 + FR-025 + FR-026 + FR-027 + FR-028 + FR-029 + FR-030 + FR-031 + FR-032 + FR-033 + FR-034 + FR-035 + FR-036 + FR-037 + FR-038 = **18 FRs** with placeholder T-NNN |
| FR with `A-MISSING` (concrete T but no §6 A-NNN) | FR-001 (cron + source_health), FR-S-001 (search relevance), FR-S-005 (source-health dashboard UI), FR-021 (voice consent gate) = **4 FRs** |
| FR with `A-PROMISED-UNWRITTEN` (cycle-4/5 A-061..A-075 named but unwritten) | FR-024..FR-038 cluster = **15 FRs** |
| FR with `SPEC-AMBIGUOUS` | FR-014 (cycle-3 split incomplete in MASTER §D) = **1** |
| FR with `TRACED` (clean) | FR-004, FR-007, FR-009, FR-011, FR-015, FR-016, FR-018 = **7 FRs cleanly traced** |
| FR with `TRACED (partial)` (right A-NNN exists, T-NNN citation in product-spec wrong) | FR-005, FR-006, FR-008, FR-010, FR-012, FR-013, FR-017, FR-019, FR-020 = **9 FRs** with cosmetic T-NNN cite bugs |

---

## 5. Top 10 P0/P1 traceability gaps with fix recommendation

Ranked by launch-impact × ease-of-fix.

### **G-01 (P0) — Two parallel A-NNN schemes; task-cell A-101..A-705 are not real tests**

**Evidence:** `delivery-plan.md §3` per-task "Accept test" columns name A-101..A-123 (M1), A-201..A-222 (M2), A-301..A-319 (M3), A-401..A-408 (M4), A-501..A-507 (M5), A-601..A-608 (M6), A-701..A-705 (M7). `test-qa-plan.md §6` catalog covers only A-001..A-060 (different numbering). 73 task-cell A-NNN ids point at rows that **do not exist**.

**Why P0:** Every "done definition" in delivery-plan §7 ("A-101..A-123 green", "A-201..A-222 green", etc.) is unverifiable because those A-NNN ids resolve to nothing.

**Fix:**
1. Rewrite delivery-plan §3 "Accept test" column to reference the **catalog** A-NNN ids. For each T-NNN, identify which §6 row asserts the deliverable and cite that. Where no §6 row exists, leave the cell empty and add a §6 row in the same PR.
2. Add a §6.11 cross-map: "For each T-NNN, the catalog A-NNN that asserts it."
3. Update delivery-plan §7 done-definition lines to reference catalog A-NNN.

### **G-02 (P0) — FR-002 + FR-003 (signal scoring + top-5 selection) have no task and no test**

**Evidence:** product-spec L49 cites T-117 (CI pipeline) and T-118 (secrets policy) for FR-002. product-spec L50 cites T-119 (observability) for FR-003. Critic F-P2-01 (L48) already flagged this. No `T-12x signal-scorer` row exists. No A-NNN tests the 0.30/0.25/0.15/0.15/0.10/0.05 weight constants or the "never-pad if < 5 candidates" rule.

**Why P0:** Signal scoring is the editorial primitive that selects the daily top-5. The never-pad rule is the brand-quality guardrail. Both unprotected.

**Fix:**
1. Add `T-124 — packages/signal-scorer` and `T-125 — top-5 selector worker` under M1 in MASTER §B.1 and delivery §3.2 with concrete owner/estimate/depends/accept.
2. Add catalog rows:
   - A-061 "Six-axis weight sum = 1.0 + each weight pinned"
   - A-062 "Top-5 returns < 5 when < 5 candidates pass scoring threshold (no padding)"
   - A-063 "Embargo'd items excluded from top-5 even if score-eligible"

### **G-03 (P0) — Beehiiv chain (FR-014 + FR-014A + FR-023) has zero concrete tasks and zero A-NNN coverage**

**Evidence:** product-spec L61-64 references T-310, T-310A, T-310C, T-310D, T-312. MASTER L185 T-310 still reads "Resend" (cycle-3 lock not propagated). T-310A/C/D exist only in cycle-2 scope-lock prose (MASTER L21, delivery L21). Critic L186 acknowledged this as "cycle-3 scope-lock header declared changes... granular per-task rewrites land in cycle-4" — but cycle-4 and cycle-5 closed without it.

**Why P0:** Beehiiv is the canonical subscriber-list source per FR-014 + FR-023; HMAC-verified webhook is a security boundary. Two-vendor deliverability (R-15) is M3 critical path.

**Fix:**
1. Rewrite MASTER §D.1 T-310 row to "Beehiiv issue send" and add **concrete** T-310A (Resend transactional), T-310B (Beehiiv subscriber-segmentation by region), T-310C (workers/beehiiv-webhook HMAC verify), T-310D (daily reconciliation > 5 or > 0.5% drift) rows with owner/estimate/depends/accept.
2. Add catalog rows:
   - A-064 "Beehiiv webhook rejects invalid HMAC-SHA256 signature"
   - A-065 "Webhook idempotency keyed on subscription_id"
   - A-066 "Reconciliation job alerts when |Beehiiv − Supabase| > max(5, 0.5%)"
   - A-067 "Resend one-click unsubscribe (RFC 8058) header present on every transactional"

### **G-04 (P0) — Tier 5 Video Podcast (FR-022, T-651..T-660) has zero concrete tasks**

**Evidence:** product-spec L63. MASTER ToC L34 names "Phase G.5 (M6.5)" but §G.5 body **does not exist** — only the scope-lock header. ADR-0012 (vendor pick) still open per critic L294 / delivery Q6.

**Why P0:** Day-60 launch dependency. Vendor pick has a 30-day lead time per delivery R-18 (L275).

**Fix:**
1. Add `MASTER_IMPLEMENTATION_PLAN.md §G.5` body with the 10 tasks T-651..T-660 (vendor pick / studio / guest workflow / recording / editing / `video-podcast.xml` feed / Watch page / RBAC / new agent role / first episode shoot).
2. Author ADR-0012 (vendor: Cloudflare Stream vs YouTube unlisted vs Vimeo OTT vs dedicated podcast host) by Day 30 (mid-M5 per Kimal lock).
3. Add catalog rows A-076..A-080 for video feed validity, video enclosure type, Watch page render, guest booking RBAC, transcripted-video accessibility.

### **G-05 (P0) — 500-article pre-launch seed (FR-024) has no task and no test**

**Evidence:** product-spec L65. T-NEW1 is pure placeholder; critic L234 promised cycle-5 follow-on, cycle-5 critic L272 still lists it pending; cycle-6 did not add it.

**Why P0:** Without 500 articles imported, distribution matrix invariants (FR-025..FR-029) cannot be validated, and the "credibility scaffold for Day 1" premise of cycle-4 disappears.

**Fix:**
1. Add `T-501-NEW — bulk-import script + matrix validator` (re-using available range; the M5 IDs T-501..T-507 are dissolved-but-retained, so re-use is fine if clearly numbered). Owner: cms-engineer + editorial-director. Est: L. Depends: T-103 + cycle-4 schema delta (category/subcategory/content_type columns).
2. Add catalog rows:
   - A-068 "Seed import: 500 articles total, each row has `primary_source_url`, `category`, `content_type`, `region`, `audience_tags`, `composite_score`"
   - A-069 "Matrix shape: 11 categories × 8 regions × 8 audiences × 8 content-types — counts within ±5% of SSOT §12.2 targets"
   - A-070 "Hero band (composite_score ≥ 80) count ≥ 50 per Launch Plan §5"

### **G-06 (P0) — FR-025..FR-029 (8 regions / 11 categories / 5 audience / 8 modules / 8 content-types) all T-PLACEHOLDER + A-PROMISED-UNWRITTEN**

**Evidence:** product-spec L66-70 cites T-NEW2..T-NEW6 — all placeholders. Critic L234 promised "A-061..A-067 for distribution-matrix coverage" — unwritten.

**Why P0:** These are the reader-site surface area. Without them, the Day-1 reader is a homepage only.

**Fix:**
1. Add concrete task rows under MASTER §D.1 for `T-320..T-324` (region / category / audience / 8-module homepage / content-type filter) — adjacent to T-301..T-319.
2. Promote critic-promised A-061..A-067 into the `test-qa-plan.md §6.6` reader-surface section. Each FR gets at least one E2E Playwright row.

### **G-07 (P0) — FR-030 (~50 audio inventory Day 1) split between T-225..T-230 (placeholder) and T-NEW7..T-NEW10 (placeholder)**

**Evidence:** product-spec L71. MASTER L19 scope-lock declares T-225..T-230 for "Podcast episode 001" — six tasks. T-NEW7..T-NEW10 promised the broader 50-episode inventory. Cycle-6 close: zero concrete rows.

**Why P0:** Day-1 audio inventory IS the brand promise. Per delivery R-16 (H/H, L273), the production burden is "Highest single risk" — needs explicit task budgeting now.

**Fix:**
1. Add concrete rows T-225..T-230 under MASTER §C.1 with owner: audio-producer + Kimal, estimates: L+L+M+L+S+S, depends on T-201..T-208 (audio pipeline) and T-501 (long-form script generator).
2. Add T-NEW7 (30 Audio Briefs), T-NEW8 (5 Daily Brief rehearsals), T-NEW9 (10 Audio Podcast buffer), T-NEW10 (5 Conference Brief historical re-cuts) as concrete rows under M2/M3.
3. Add catalog row A-071 "Pre-Day-1 audio inventory: 30+5+10+5 episodes, each `audio_status = 'published'`, each has `transcript_url`, each in matching RSS feed".

### **G-08 (P1) — FR-032 + FR-033 (worldwide positioning + three-edition publish) all placeholder; Top Stories 2-of-6 quota and timezone delivery untested**

**Evidence:** product-spec L73-74. T-NEW12/T-NEW13/T-NEW18 placeholders. Cycle-5 critic L277 promised A-068..A-075 — unwritten.

**Why P1:** Editorial brand identity is "worldwide RT signal, not US-default." The 2-of-6 same-region cap is a deterministic homepage invariant that's trivially unit-testable.

**Fix:**
1. Add concrete rows for `T-326 — three-edition publish worker` (M2 per cycle-5 critic L276), `T-327 — region toggle + cf-ipcountry auto-detect` (M3).
2. Add catalog rows:
   - A-072 "Top Stories grid: SELECT 6 → no `region` appears more than twice"
   - A-073 "APAC edition publishes at 22:00 UTC; EU at 06:00 UTC; Americas at 11:00 UTC (within ±5 min per NFR-004)"
   - A-074 "Beehiiv `region` segment drives delivery time (smoke: subscriber.region='APAC' → email sent T_apac)"

### **G-09 (P1) — FR-038 (LATAM LLM-translate) — schema CHECK exists (cycle-6) but no pgTAP test; footer attribution untested**

**Evidence:** product-spec L79; cycle-6 critic L321 adds `articles_translation_provider_required` CHECK; critic F-P2-05 already noted the pgTAP catalogue is incomplete relative to the "100% target" claim (test-qa L69).

**Why P1:** Cycle-6 lock is the freshest decision; the CHECK exists but no §6.2 row validates it. Footer attribution is a brand-trust requirement (FR-038 "mandatory non-removable footer").

**Fix:**
1. Add to `test-qa-plan.md §6.2`:
   - A-075 "`articles_translation_provider_required`: INSERT with source_language='pt', translation_provider=NULL → constraint violation"
   - A-076 "Footer attribution: rendered article body for source_language≠'en' contains the exact attribution string"
2. Add concrete task `T-NEW19 → T-328` (translation worker — DeepL Pro + Claude verify on composite_score ≥ 70) and `T-NEW20 → T-329` (footer-attribution component, reader app) under M2/M3.

### **G-10 (P1) — FR-021 (voice consent gate) is a "pre-launch gate" with no acceptance test**

**Evidence:** product-spec L86. T-213 is the registry-populate task (MASTER L137). Critic F-P2-08 (L55) named the voice-ID-deprecation failure mode. No A-NNN asserts "publish is blocked when consent expired or absent."

**Why P1:** Voice consent is the legal-risk floor for audio. ADR-0004:71 (per critic L55) and the user-global anti-pattern rules together imply this is a load-bearing gate.

**Fix:**
1. Add catalog row:
   - A-077 "audio publish blocks when `voice_consent_registry.consent_expires_at < now()` OR consent record absent for the voice_engine_used"
2. Tie this to the `audio_publish_requires_qa` CHECK by adding `voice_consent_registry` join or RLS check; document as constraint extension in cycle-7.

---

## 6. Coverage scorecard

| Tier | Trace strength |
|---|---|
| **MUST FR cleanly traced** (T-NNN concrete + A-NNN catalog) | **7 of 38 = 18%** |
| **MUST FR partially traced** (T-NNN concrete, but doc cite errors) | 9 of 38 = 24% |
| **MUST FR placeholder T** (no concrete task) | 18 of 38 = 47% |
| **MUST FR with no A-NNN catalog coverage** (catalog or promised-unwritten) | 26 of 38 = 68% |
| **Schema CHECK constraints with pgTAP catalog row** | 10 of "~16" actual CHECK constraints per critic F-P2-05 = ~63% (target was 100% per test-qa L69) |

Headline reading: **less than 1 in 5 MUST requirements is cleanly traced both directions.** The cycle-3/4/5/6 scope expansions added 17 MUST FRs (FR-014A, FR-022..FR-038) without adding a single concrete task row or catalog test. That is a single in-session correction PR's worth of mechanical work and a known-named follow-on; the plan does not need a new architecture round, only the **mechanical task-detail and test-row write-down** that successive cycle-deltas explicitly deferred.

---

## 7. Recommendation to /team-build

**Do not start /team-build on FR-022..FR-038 until the placeholder cleanup PR lands.** The cycle-1..cycle-3 MUSTs (FR-001..FR-021) are well-traced enough to start M0..M2 work today — the doc-cite errors (G-listed P2s) are recoverable in-flight.

**Order of doc-only PR work (single sweep, ~3 days):**

1. **Rewrite MASTER §D.1** T-310 → Beehiiv; add concrete T-310A..T-310D rows. (G-03, G-08)
2. **Add MASTER §G.5 body** with T-651..T-660 concrete rows + ADR-0012 placeholder ticket. (G-04)
3. **Add T-NEW1..T-NEW20 concrete rows** under existing milestones (M2 for seed import, M2/M3 for surfaces, M3 for translation), renumbered into the standard range (T-320..T-329 etc.) so they stop being "NEW" placeholders. (G-05, G-06, G-07, G-09)
4. **Add catalog rows A-061..A-077** in `test-qa-plan.md §6` for the gaps named above. (Every G-NN finding above lists the specific A-NNN to add.)
5. **Fix product-spec.md §4 T-NNN cite errors** for FR-005, FR-006, FR-008, FR-010, FR-012, FR-013, FR-017, FR-019, FR-020. (P2 cluster, ~1 hour of doc edits)
6. **Replace task-cell A-NNN scheme** in delivery-plan §3 + MASTER §B–H with catalog A-NNN cites. (G-01 — largest doc-edit, ~half a day)

Total estimated work: ~3 person-days of editorial-director + delivery-lead doc time. No code changes. The plan finalizes cleanly only after this sweep.

---

## 8. Revision history

| Date | Version | Change |
|---|---|---|
| 2026-05-14 | 1.0.0 | Initial trace matrix authored by Test Engineer persona for /team-qa plan-QA pass against cycles 1–6 deltas. |

---

*Trace matrix is binding for /team-qa sign-off. Every G-NN gap above ties to a concrete fix in §5; every fix lists the A-NNN and T-NNN to add. Re-run this matrix after the doc-cleanup PR lands to confirm placeholder count drops from 40 → 0 and catalog count rises from 59 → 77.*
