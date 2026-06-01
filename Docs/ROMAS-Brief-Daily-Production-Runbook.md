# ROMAS Wire — Daily Production Runbook

> **⚠️ Cadence updated 2026-05-31 (SSOT decision 20): publishing is now TWICE WEEKLY — Tuesday (operational brief) + Friday (The ROMAS Read).** Source *ingestion* may still run daily; the *publish* rhythm is 2×/week. This runbook's "weekday" framing below predates that change — production work concentrates on the two publish days. SSOT §3 d20 wins on any conflict.

**My standing production mandate (twice weekly — see banner above).**
**Owner of approvals: Kimal Honour Djam (president@aliennova.com)**
**Companion document to:** `ROMAS-Brief-Master-Strategy.md`
**Version 1.1 · 2026-05-14 (M0 doc reconciliation: header bump per cycle-1 R-002; Beehiiv references corrected to Resend/Beehiiv split per ADR-0007 cycle-3)**

---

## 1. The Mandate

Every weekday I produce **approval-ready article drafts for ROMAS Wire** — the daily intelligence brief that is the media product of ROMAS Intelligence, the front door to ROMAS COS, and the audience-acquisition engine for the ROMAS ecosystem.

I do not produce hot takes. I do not aggregate. I produce **publication-ready clinical intelligence drafts**, sourced to primary records, scored on six axes, and packaged into the ROMAS Wire house format so Kimal can review, approve, and ship.

---

## 2. The Daily Production Schedule

All times America/New_York. Anchored to the 06:30 ET morning brief delivery and the ROMAS Wire publish window.

### Phase 1 — Discovery & Triage (automated, 04:00–06:30 ET)

| Time | Action |
|---|---|
| 04:00 | Ingestion workers wake. Pull net-new items from the last 24h across all worldwide sources (see §3). |
| 04:30 | Normalize → Content Objects. Deduplicate by DOI / PMID / 510(k) / CE-mark / NCT / press-URL hash. |
| 05:00 | Filter for RT relevance (modality, disease site, or RT-adjacent AI/imaging/physics signal). |
| 05:30 | Score each item on the six axes. Compute composite Signal Score (Clinical 0.30 + AI 0.25 + Physics 0.15 + Operational 0.15 + Novelty 0.10 + Confidence 0.05). |
| 06:00 | Select top 5 publishable items (embargoed items excluded from queue, surfaced in embargo hold list). |
| 06:15 | Generate the 10-field card per top-5 item + 10-item quick-hits backlog + embargo hold + source health report. |
| **06:30** | **Morning Brief email lands in Kimal's inbox.** Triggered by the recurring task `ROMAS Wire — Global Morning Brief` (cron `10688a27`). |

### Phase 2 — Owner Review (06:30–07:30 ET)

| Time | Owner action |
|---|---|
| 06:30–07:30 | Kimal reviews the brief. Replies: `APPROVE 1-5`, `EDIT [n]`, `REJECT [n]`. EDIT replies include the requested change. |

### Phase 3 — Final Draft Production (07:30–09:00 ET)

For each approved item, I produce the **complete publication asset bundle**:

| Asset | Length | House style |
|---|---|---|
| **Hero article** (if it's #1) | 200–300 words | Headline ≤90 chars · 4-question frame · inline primary-source links · ROMAS Insight signed |
| **Supporting article** (#2–4) | 80–120 words each | Tight, skim-optimized, one source per claim |
| **Paper of the Day** card | 200 words | Journal · study design · key findings · limitations · "what it means clinically" |
| **Quick Hits** | 5 × 20-word bullets | Headline + source + one-clause framing |
| **ROMAS Insight** | 80–120 words | Signed, labeled, one analytical thread |
| **Podcast script** | 5–10 min spoken (≈800–1500 words) | Same content set, conversational register, audio-formatted (no markdown, spelled-out numbers, pronunciation guides for acronyms on first use) |
| **LinkedIn carousel** | 6–8 slides | Hero item only · slide 1 headline · slides 2–6 key beats · slide 7 ROMAS Insight · slide 8 CTA |
| **X/Twitter thread** | 3–5 posts | Lead with the hook · primary source URL in post 2 · ROMAS Insight in final post |
| **Issue subject line + preview text** | ≤60 / ≤90 chars | Lead with the hero headline; preview teases the ROMAS Insight |

**Quality bar:**
- Zero claims without a primary-source URL inline.
- Every interpretation labeled "— ROMAS Insight (interpretation)" or equivalent.
- Every region/jurisdiction tag present where the source is non-US.
- Embargo status verified on every conference-sourced item.
- Hero word count obeyed (no overshoot).

### Phase 4 — Spot Check & Queue (09:00–10:00 ET)

| Time | Owner action |
|---|---|
| 09:00–10:00 | Kimal spot-checks final drafts. Final approve → I queue in Beehiiv with podcast attached, social posts scheduled, web archive auto-published at delivery time. |
| 10:00 | **Issue locked for next-day 06:30 delivery.** Social posts auto-publish on issue go-live. |

### Phase 5 — End-of-Day Sweep (17:00 ET)

| Time | Action |
|---|---|
| 17:00 | Sweep for late-breaking items: FDA late-Friday releases, US-evening vendor PRs, Asia-morning announcements (Tokyo/Beijing/Seoul). |
| 17:30 | Items above signal threshold (Composite ≥75 + Novelty ≥80) → push notification candidate. Below threshold → roll into tomorrow's hero queue. |
| 18:00 | Kimal: glance, decide push vs. queue. |

### Phase 6 — Friday Rollup (18:00 ET)

| Time | Action |
|---|---|
| Fri 18:00 | Generate **ROMAS Weekly** draft for Sunday 19:00 ET delivery: Top 5 Papers (full structured critique), Practice Delta, Long Take essay outline (600–900 words), conference watch if active. |
| Sat–Sun | Kimal reviews over the weekend. |
| Sun 19:00 | ROMAS Weekly ships. |

---

## 3. Worldwide Source List

Same as the scheduled task `ROMAS Wire — Global Morning Brief`. Full coverage:

**Literature & evidence:** PubMed E-utils · Crossref · arXiv (physics.med-ph, eess.IV) · medRxiv · bioRxiv · Semantic Scholar · Red Journal (IJROBP) · PRO · Radiotherapy & Oncology (Green Journal/ESTRO) · Medical Physics · JACMP · Clinical & Translational RO · Advances in RO · PMB · Physica Medica · BJR · JRR (Japan) · Strahlentherapie und Onkologie (Germany)

**Trial registries:** ClinicalTrials.gov · ISRCTN · EU CTR · jRCT (Japan)

**Regulatory:**
- US: openFDA 510(k) + De Novo + PMA + AI/ML-enabled device list
- EU: EUDAMED · CE-mark · MDCG guidance
- UK: MHRA
- Canada: Health Canada MDALL
- Japan: PMDA SaMD/AI
- Australia: TGA ARTG
- China: NMPA

**Societies & guidelines:**
- NA: ASTRO · AAPM · ACRO · ACR · NCCN · COMP
- Europe: ESTRO · ESMO · IPEM · EFOMP · DEGRO · SFRO · AIRO · SEOR
- APAC: JASTRO · KOSRO · CSTRO · RANZCR/FROANZCR · AROI
- Africa & Global: SASRO · IAEA · WHO cancer programme

**Reimbursement & policy:**
- US: CMS PFS · MCD (NCDs/LCDs) · MLN · Federal Register
- UK: NICE · NHS England
- EU: HAS (France) · IQWiG (Germany) · AIFA (Italy)
- Japan: Chuikyo / MHLW

**Vendors:**
- Linacs: Varian (Siemens Healthineers) · Elekta · Accuray · ViewRay · Mevion · IBA · Hitachi · Sumitomo · ProTom · Leo Cancer Care
- Planning/QA: RaySearch · Radformation · MIM · Limbus AI · Carina Medical · Siris Medical · MVision · ProKnow · Sun Nuclear (Mirion) · Standard Imaging · PTW · IBA Dosimetry · ScandiDos · Brainlab
- Imaging/adaptive: Philips · GE HealthCare · Canon Medical · Siemens Healthineers · United Imaging
- Brachy: Elekta Brachy · Varian Bravos · Eckert & Ziegler
- Emerging AI: TheraPanacea · Oncoustics · Doctor Hazim · Quantib RT · AiRTraining

**Conferences:** ASTRO · AAPM · ESTRO · ASCO · RANZCR · JASTRO · ESMO — embargo-aware.

---

## 4. The 10-Field Item Card (Morning Brief)

Every top-5 item ships with all ten fields populated:

1. **Headline** (≤90 chars)
2. **Source** (publication / agency / vendor) + primary URL + identifier (PMID / DOI / 510(k) / NCT / CE-mark / press)
3. **Region & jurisdiction** (US / EU / UK / Canada / Japan / Australia / China / Global)
4. **Audience tags** (Physicist / Physician / Dosimetrist / Therapist / Resident / Industry)
5. **Modality & disease site tags** (e.g., Adaptive RT, MR-Linac, SBRT, Proton, FLASH, Brachy / Prostate, H&N, Lung, Breast, CNS)
6. **What happened** (2 sentences, factual only)
7. **Why it matters** (2 sentences — clinical, operational, or economic stakes)
8. **ROMAS Insight** (one line, labeled "— ROMAS Insight (interpretation)")
9. **Signal scores**: Clinical / AI / Physics / Operational / Novelty / Confidence / **Composite**
10. **Embargo status**: Clear OR Embargoed-until-[DATE]

---

## 5. House Style Guide (Drafts)

### Voice
- Confident but never glib.
- Specialty-fluent: assume the reader knows what SBRT, MR-Linac, GTV, OAR mean. Spell out acronyms only on first use of less-common ones (FROANZCR, IQWiG, MDCG).
- Active voice. Strong verbs.
- No filler ("Notably," "Interestingly," "It is worth mentioning").
- No journalese ("In a stunning development," "Game-changer," "Breakthrough" unless quoting).

### Sentence patterns
- Lead with the news, not the setup. *Not*: "Researchers at MGH announced today that…" → *Yes*: "MGH's online adaptive prostate workflow cut planning time 62%, per a new IJROBP study."
- One-sentence paragraphs are allowed and encouraged for emphasis.
- Cap most paragraphs at 3 sentences.

### Citations
- Inline, markdown-link style, anchor text = source name. *Not*: "(source)." → *Yes*: "([IJROBP](https://doi.org/...))"
- Multiple sources in one sentence: cite each naturally.
- Never raw URLs in body.

### ROMAS Insight
- Always labeled.
- One analytical thread per Insight, not three.
- Quantified where possible ("in 3–5 years," "in centers with >300 patients/year").
- Signed at the end: "— ROMAS Insight."

### Numbers & units
- SI units where conventional in the field (Gy, MV, cm).
- Currency: USD with explicit conversion if source is non-USD ("€2.4M / ~$2.6M").
- Dates: "May 12, 2026" in body, ISO 8601 in metadata.

---

## 6. The Six Inviolable Rules (canonical per SSOT §2, propagated 2026-05-14 M0 cycle-1 per R-004)

> Cycle-1 critic H-08 / G-008: this section previously listed FIVE rules, omitting the audio QA gate. The canonical six (per CLAUDE.md §4, AGENT.md §5, SSOT §2) are restated below.

1. **No primary source URL → no publish.** Every clinical claim traces to a primary source. No "recent studies show."
2. **Embargoed items never enter the publish queue.** Surface in the embargo hold list only. ASTRO/ESTRO/AAPM/JASTRO/RANZCR/ASCO violations end careers, not just stories.
3. **ROMAS Insight / ROMAS Take is always labeled as interpretation**, never as fact.
4. **Verify openFDA discoveries against the official FDA 510(k) / De Novo / PMA record before drafting.** openFDA is discovery only. EU regulatory chain per `contracts/ema.yaml`: EUDAMED → NB-OG → MDCG official PDF; `meddeviceguide.com` + `MDCG.eu` are BANNED as primary per SSOT §6.
5. **If a source fails to fetch, surface it in source health.** Do not silently drop.
6. **No audio goes live without editorial QA pass.** Requires all 5 schema-enforced conditions (`clinical_claims_checked` + `qa_reviewer` + `loudness_lufs` in -18..-14 (ADR-0016) + `true_peak_dbtp <= -1` + `transcript_url`) per `contracts/supabase-schema.sql:audio_publish_requires_qa` CHECK. The -16 ±1 LUFS production target is enforced by the audio-qa-reviewer agent, not at the DB.

---

## 7. Failure Modes & Recovery

| Failure | Detection | Response |
|---|---|---|
| Source fetch fails (timeout / 4xx / 5xx) | Source health report at top of brief | Retry once at +30 min; if still failing, flag in next day's brief; never silently drop |
| <5 publishable items qualify | Composite Signal Score threshold check | Surface fewer items. Never pad. |
| Embargo detected mid-draft | Embargo-aware Content Object flag | Move to embargo hold list; remove from publish queue; alert Kimal |
| Hallucination caught in spot-check | Owner flags during 09:00 review | Item killed. Source agent flagged. Correction logged. Weekly correction-rate review. |
| Hallucination caught post-publish | Reader email, internal audit, or follow-up source | Issue correction within 4 hours: web update + dedicated correction notice in next day's brief + email to affected segment |
| Beehiiv newsletter API fails (newsletter delivery only; transactional is Resend per ADR-0007 cycle-3) | Queue status check at 10:00 ET | Fall back to manual paste from generated drafts; do not skip the issue |
| Podcast generation fails (ElevenLabs / OpenAI TTS) | Audio file size = 0 or quality check fails | Fall back to second TTS provider; if both fail, ship text-only issue with "podcast back tomorrow" note |
| Late-breaking story after 10:00 lock | EOD sweep at 17:00 OR ad-hoc detection | Push-notification candidate if Composite ≥75 + Novelty ≥80; otherwise hero queue for next day |

---

## 8. Weekly Metrics I Track for the Owner

Reported every Friday with ROMAS Weekly:

- **Items scanned / week** (worldwide source firehose volume)
- **Items qualified** (passed RT-relevance filter)
- **Items published** (Mon–Fri × 5 + quick hits + weekly papers)
- **Editorial correction rate** (corrections / published items) — target <1%, hard floor <2%
- **Open rate, CTR, unsubscribe rate, spam complaint rate** (per issue and rolling 7-day)
- **Podcast listens per episode** (rolling 7-day)
- **SMS Q&A volume** (when live, Week 3+)
- **ROMAS COS beta signups attributed to Brief** (when live, Week 5+)
- **Subscriber regional distribution** (US / EU / UK / CA / JP / AU / other)
- **Source health summary** (which sources failed how often)
- **Signal score distribution** (so we can tune weights)

---

## 9. Escalation Triggers

I escalate immediately (push notification + email, not in the morning brief) if:

- A retracted paper is detected in any prior published issue.
- A vendor announces a safety advisory, recall, or significant adverse event in any covered system.
- A regulatory body issues an enforcement action against a vendor we've covered.
- An ASTRO / AAPM / ESTRO embargo break is detected externally (so we know not to be late or duplicative).
- Our own deliverability drops: open rate falls below 25% for two consecutive issues, OR spam complaint rate crosses 0.10% on any send.

---

## 10. What I Do Not Do Without Explicit Permission

- Publish without owner approval (launch phase).
- Cover ROMAS / ROMAS COS more favorably than competitors.
- Run sponsored content blended with editorial.
- Email anyone not on the re-permissioned, warmed list.
- Use openFDA, Federal Register API, Crunchbase, or Semantic Scholar as the *sole* source for a publish-queue item — those are discovery layers, not verification layers.
- Ship a paper summary without abstract + (ideally) full-text access.
- Repurpose an issue from another publication without independent verification and re-sourcing.

---

## 11. Companion Files & Tooling

- `ROMAS-Brief-Master-Strategy.md` — strategic context for this runbook
- Recurring task: `ROMAS Wire — Global Morning Brief` (cron `10688a27`, session `559a263d`) — fires Mon–Fri 06:30 ET
- Editorial admin: Next.js dashboard on Supabase (to be built Week 1)
- Distribution: Beehiiv Max (Week 1) + Transistor fallback for podcast
- LLM stack: Claude Sonnet 4.6 (primary), GPT-5 (fallback)
- TTS stack: ElevenLabs (primary), OpenAI TTS (fallback)

---

## 12. The One-Line Promise

> Every weekday by 06:30 ET, Kimal opens his inbox to five approval-ready radiation oncology stories drawn from a worldwide source firehose, scored on six axes, sourced to primary records, embargo-clean, and packaged into the ROMAS Wire house format. By 10:00 ET, the next day's issue is queued — podcast, social, and web archive included.

---

*Living document. Version 1.0, May 12, 2026. Updated whenever editorial standards, source list, schedule, or owner workflow changes.*
