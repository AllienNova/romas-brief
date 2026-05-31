---
name: source-ingestion
description: Daily source ingestion pipeline for ROMAS Wire — global radiation oncology sources across literature, regulatory (multi-jurisdiction), societies, reimbursement, vendors, conferences. Dedupe rules, source-health logging, embargo detection. Load before any ingestion / scanning work.
canonical_status: CANONICAL SOURCE LIST per SSOT §6 and CLAUDE.md §9 (promoted M0 cycle-1 per R-007). When CLAUDE.md §9 instructs to "refer to the active cron task spec", this skill IS that spec.
---

# ROMAS Wire — Source Ingestion (canonical)

**This is the canonical source list for ROMAS Wire** (per SSOT §6, promoted from agent-skill to canonical reference in M0 cycle-1 per R-007). Any conflict between this skill and another doc resolves in favor of this skill UNLESS SSOT §6 explicitly supersedes (e.g., the cycle-2 R-014 ban on `meddeviceguide.com` / `MDCG.eu` as primary sources).

Runs daily Mon–Fri at the three-edition cron times per SSOT §3 row 16: APAC 22:00 UTC (prior-day) · EU 06:00 UTC · Americas 11:00 UTC (cycle-5 lock supersedes cycle-1 single 10:30 UTC). Worldwide RT scope per SSOT §3 row 15 (cycle-5 rebalance: NA 26% / EU 32% / APAC 26% / LATAM 8% / MENA-Africa 4% / Global 4%).

**Banned-as-primary per SSOT §6 + cycle-2 R-014**: `meddeviceguide.com`, `MDCG.eu`, any commercial regulatory-tracking blog, openFDA (discovery only). EU regulatory chain: EUDAMED → NB-OG register → MDCG official PDF (see `contracts/ema.yaml`).

---

## Source catalog (canonical groupings)

### Literature & Evidence (Global)

- **PubMed** — NCBI E-utilities with MeSH `(Radiotherapy[Mesh] OR Radiation Oncology[Mesh])` AND date last 24h, AI/ML filters layered.
- **Red Journal (IJROBP)** — `https://www.redjournal.org/`
- **Practical Radiation Oncology** — `https://www.practicalradonc.org/`
- **Radiotherapy & Oncology (Green Journal / ESTRO)** — `https://www.thegreenjournal.com/`
- **Medical Physics** — AAPM journal
- **JACMP** — Journal of Applied Clinical Medical Physics
- **Clinical & Translational Radiation Oncology** — ESTRO
- **Advances in Radiation Oncology** — ASTRO open access
- **Physics in Medicine & Biology**
- **Physica Medica**
- **British Journal of Radiology** (BJR)
- **Journal of Radiation Research** (JRR, Japan)
- **Strahlentherapie und Onkologie** (Germany)

### Preprints

- **arXiv** — `physics.med-ph`, `eess.IV` (last 24h)
- **medRxiv** — radiation oncology subject filter
- **bioRxiv** — when RT-adjacent

### Trial registries

- **ClinicalTrials.gov** — `radiation OR radiotherapy` + new / status-changed
- **ISRCTN**
- **EU Clinical Trials Register**
- **jRCT** (Japan)

### Regulatory (multi-jurisdiction)

- **US** — openFDA 510(k) + De Novo + PMA endpoints; FDA AI/ML-enabled device list (**always verify openFDA discovery against the official FDA record**)
- **EU** — EUDAMED notices, CE-mark updates, MDCG guidance
- **UK** — MHRA medical device alerts
- **Canada** — Health Canada MDALL
- **Japan** — PMDA SaMD / AI announcements
- **Australia** — TGA ARTG additions
- **China** — NMPA device approvals (English summaries where available)

### Societies & Guidelines

- **North America**: ASTRO, AAPM, ACRO, ACR, NCCN, COMP
- **Europe**: ESTRO, ESMO, IPEM, EFOMP, DEGRO, SFRO, AIRO, SEOR
- **Asia-Pacific**: JASTRO, KOSRO, CSTRO, RANZCR / FROANZCR, AROI
- **Africa & Global**: SASRO, IAEA Human Health, WHO cancer programme
- **Med-onc adjacent**: ASCO, ESMO

### Reimbursement & Policy

- **US** — CMS PFS, Medicare Coverage Database (NCDs / LCDs), MLN Connects, Federal Register API
- **UK** — NICE technology appraisals, NHS England commissioning
- **EU** — HAS France, IQWiG Germany, AIFA Italy
- **Japan** — Chuikyo / MHLW reimbursement

### Vendors (global RT ecosystem)

- **Linac & treatment systems**: Varian (Siemens Healthineers), Elekta, Accuray, ViewRay, Mevion, IBA, Hitachi, Sumitomo, ProTom, Leo Cancer Care
- **Planning & QA software**: RaySearch, Radformation, MIM Software, Limbus AI, Carina Medical, Siris Medical, MVision, ProKnow, Sun Nuclear (Mirion), Standard Imaging, PTW, IBA Dosimetry, ScandiDos, Brainlab
- **Imaging & adaptive**: Philips, GE HealthCare, Canon Medical, Siemens Healthineers, United Imaging
- **Brachytherapy**: Elekta Brachy, Varian Bravos, Eckert & Ziegler
- **Emerging AI**: TheraPanacea, Oncoustics, Doctor Hazim, Quantib RT, AiRTraining, RaySearch DL modules

### Conferences

Active monitoring of ASTRO, ESTRO, AAPM, ASCO, RANZCR, JASTRO, ESMO abstract portals. **EMBARGO-AWARE**: items under active embargo go to embargo hold list, never the publish queue.

---

## Per-source fetcher pattern

```ts
// tools/ingest/fetchers/<source>.ts
export async function fetchSource(): Promise<RawItem[]> {
  const start = Date.now();
  try {
    const items = await doFetch();
    await logSourceHealth({ source_slug, status_code: 200, items_returned: items.length, latency_ms: Date.now()-start });
    return items;
  } catch (err) {
    await logSourceHealth({ source_slug, status_code: err.status ?? 0, error: err.message, latency_ms: Date.now()-start });
    return [];   // Never throw out of the pipeline; surface in source-health report
  }
}
```

**Never silently drop a source failure.** Always log to `source_health` and surface in the morning brief.

---

## Item normalization

Every raw item → `RawItem` shape before dedupe:

```ts
type RawItem = {
  source_slug: string;
  source_url: string;             // primary URL on the publisher
  source_identifier?: string;     // PMID / DOI / 510k / NCT / CE-mark
  title: string;
  published_at: string;           // ISO
  region: 'us'|'eu'|'uk'|'ca'|'jp'|'au'|'cn'|'global';
  abstract?: string;
  raw?: unknown;                  // original payload for debug
};
```

---

## Dedupe

In order:

1. **DOI** match → drop dup (keep earliest fetched).
2. **PMID** match → drop dup.
3. **510(k) number / NCT / EU-CT / CE-mark ID** match → drop dup.
4. **URL hash** match → drop dup.
5. **Title fuzzy match** (cosine similarity ≥ 0.92 with another item in last 7d) → drop dup, log.

Dedupe pass produces the `candidate_pool`. Pool size budget: ≤ 200 items / day. If larger, raise the AI/ML / regulatory filter strictness for that day and re-run.

---

## RT relevance filter

Drop items that fail any of:

- Modality not present (no mention of radiation therapy / radiotherapy / linac / proton / brachy / SBRT / IMRT / VMAT / SRS / etc.) AND
- Disease site not RT-adjacent (no mention of cancer / oncology / tumor / metastases) AND
- AI/imaging/physics not RT-adjacent

Use both keyword and embedding-based filters. Embedding model: `text-embedding-3-small` or local equivalent. Threshold tuned monthly.

---

## Embargo detection

An item is **embargoed** if any of:

- Publisher field `embargo` or `embargoDate` is set in the future.
- Conference portal flags item as embargoed-until-DATE.
- Source URL contains `embargo` parameter or known embargo prefix.
- Manual flag from `editorial-director` or `conference-mode-operator`.

**Embargoed → write to `embargo_holds` table, NOT to `articles`.** Surface in next morning brief's embargo hold section.

---

## openFDA verification rule

openFDA is a discovery layer, **not** the primary citation.

Workflow:

1. openFDA returns candidate 510(k) / De Novo / PMA hit.
2. Fetch the **official FDA record** (510(k) database web page).
3. Compare device name, K-number, decision date, summary.
4. On match → use the FDA record URL as `primary_source_url`.
5. On mismatch → flag, do not draft.

---

## Source health reporting

Every cron run writes a `source_health_summary.json`:

```json
{
  "run_started_at": "...",
  "run_finished_at": "...",
  "sources_attempted": 47,
  "sources_succeeded": 45,
  "sources_failed": 2,
  "failures": [
    { "source_slug": "nice_uk", "status_code": 503, "error": "..." },
    { "source_slug": "pmda_jp", "status_code": 0, "error": "timeout 30s" }
  ],
  "items_after_dedupe": 138,
  "items_after_relevance_filter": 42,
  "embargoed_count": 3,
  "candidate_pool_for_scoring": 39
}
```

Attached to the morning brief.

---

## CLI

```
bash> npx tsx tools/ingest/run.ts --date 2026-05-12
bash> npx tsx tools/ingest/health.ts          # last 7 days health
bash> npx tsx tools/ingest/replay.ts <source> # replay a single source
```

---

*Ingestion is the top of the funnel. A clean funnel beats a noisy one.*
