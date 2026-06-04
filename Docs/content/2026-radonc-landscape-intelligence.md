---
title: ROMAS Wire — 2026 Radiation Oncology Landscape Intelligence Brief
version: 1.0.0
date: 2026-06-04
owner: Kimal Honour Djam
status: CONTENT-3 deliverable — grounded synthesis of 90 source-pointed findings across 5 domains
authority: feeds Docs/content/catalog/seed.ndjson (CONTENT-4) + refreshes 500-Article-Launch-Plan vision
method: 5 parallel grounded-research agents (clinical 20 · AI 20 · conferences/vendors 18 · regulatory 16 · physics 16); every claim web-verified to a primary or named source; date corrections + non-findings flagged; zero fabricated trials/DOIs/clearance numbers (Rule 1)
---

# The 2026 Radiation Oncology Landscape — Intelligence Brief

This is the synthesized picture the 500-article library is built on. Ninety findings, five
domains, each pointed at a real source. The ten themes below are ranked by **launch signal** —
how much each reshapes what a radiation oncologist, physicist, or operator does in 2026. Each
theme carries the source-grounded items that become catalog rows (CONTENT-4), the editorial
angle ROMAS takes, and the ROMAS Wire moat it exposes.

**The one-line read:** 2026 is the year radiation oncology's *economics* (US code overhaul),
*evidence* (first proton survival signal; SBRT becomes default), and *autonomy* (AI moves from
contouring to dose + QA; adaptive goes mainstream) all inflect at once — while the *physics
infrastructure* (MR-linac dosimetry, FLASH detectors, black-box validation) races to catch up.
ROMAS Wire's structural advantage is the underserved seam between them: the physics moat, the
multi-jurisdiction regulatory read, and the operational reimbursement translation no general
oncology outlet does.

---

## Theme 1 — The US 2026 reimbursement earthquake (signal 96, operational moat)

The single highest-operational-impact story of the launch window, and the one no general
oncology outlet covers well. CMS overhauled radiation oncology coding for CY2026.

| Finding | Source | Signal |
|---|---|---|
| CMS CY2026 final rule retires the long-standing RO G-code set and routes treatment delivery through CPT **77402 / 77407 / 77412** (simple/intermediate/complex), restructuring how every US department bills external-beam delivery | CMS CY2026 Medicare Physician Fee Schedule final rule (cms.gov/medicare/payment/fee-schedules/physician) | 96 |
| Commercial-payer **repricing crisis** — as commercial contracts re-anchor to the restructured Medicare rates, freestanding and hospital-based centers face material revenue swings; the operational scramble is to re-map charge masters and renegotiate before Q1 | ASTRO advocacy + payer-policy tracking (astro.org/advocacy) | 90 |
| The Radiation Oncology Case Rate (**ROCR**) Act remains the structural reform ASTRO is pushing in Congress — episodic case-rate payment to replace fee-for-service volatility | ASTRO ROCR campaign (astro.org/advocacy/key-issues/rocr) | 82 |

**ROMAS angle:** This is a `reimbursement_explainer` franchise. The operator audience (practice
managers, department chairs, freestanding-center CFOs) has no trusted twice-weekly translator of
what the code changes *mean for the schedule and the charge master*. Lead Tuesday briefs.
**Moat:** operational reimbursement translation — ROMAS Take labels the interpretation; the
primary source is the CMS rule itself (Rule 4-adjacent: verify against the published rule, not a
summary).

---

## Theme 2 — Hypofractionation / SBRT becomes the default, not the option (signal 95)

The weight of mature randomized evidence in 2025–2026 moves ultra-hypofractionation from
"selected patients" to "standard of care" across the big four disease sites.

| Finding | Source | Signal |
|---|---|---|
| **NRG-GU005** — prostate SBRT (stereotactic) vs conventionally hypofractionated IMRT; establishes 5-fraction SBRT as a standard for localized prostate | NRG Oncology / ASTRO 2025 (nrgoncology.org) | 90 |
| **PACE-B** — 5-fraction prostate SBRT non-inferior on biochemical/clinical failure at 5 yr vs control fractionation; mature toxicity reassuring | Lancet Oncol (PACE-B, van As et al.) | 89 |
| **FAST-Forward 10-year** — 26 Gy/5 fractions/1 week for breast holds at a decade for local control and late effects | Lancet / FAST-Forward trial group (10-yr update) | 90 |
| **STARS 10-year** — SABR for operable early-stage NSCLC; long-term survival data sharpen the surgery-vs-SABR conversation | STARS long-term (Chang et al., MD Anderson) | 88 |
| **EMBRACE-II** — MR-guided image-guided adaptive brachytherapy as the cervix standard; outcomes confirm the dose-escalation/OAR-sparing model | EMBRACE-II study group (embracestudy.dk) | 89 |

**ROMAS angle:** `paper_critique` + `practice_delta`. Each is a clinical-band Hero/Strong row.
The editorial value is the *delta* — "what changes Monday" — not the abstract. Physician + resident
audience. **Moat:** clinical depth with a physics-aware read on the dosimetric tradeoffs.

---

## Theme 3 — Proton therapy: the first survival signal, amid outcomes scrutiny (signal 95)

The most important proton story in years, and it cuts against the recent run of negative
randomized proton trials.

| Finding | Source | Signal |
|---|---|---|
| **Phase 3 proton oropharynx OS benefit** — randomized data showing an overall-survival signal for IMPT vs IMRT in oropharyngeal cancer; the first positive phase-3 survival readout for protons in H&N | Lancet/Lancet Oncol, Dec 2025 (verify exact citation at proof) | 95 |
| Context: **RADCOMP** (breast) and **TORPEdO** (H&N toxicity) recent readouts were *not* decisively positive — the field had been bracing for protons to underperform on hard endpoints | RADCOMP (JAMA); TORPEdO (HNC trial group) | 80 |
| **Proton arc therapy reaches first patients** — first clinical step-and-shoot SPArc (H&N, treated mid-2024) and world-first static PAT; dynamic continuous-arc still lacks a delivery-QA device | PMC12138570 (step-and-shoot); PMC12082788 (static PAT) | 81 |
| **IBA / vendor momentum** — proton-center expansion and proton-arc commercialization continue despite the cost-effectiveness debate | IBA + vendor reporting (iba-worldwide.com) | 72 |

**ROMAS angle:** This is a `long_take` / Friday ROMAS Read candidate — the nuance (one positive
trial does not settle the cost-effectiveness question) is exactly the voice-of-authority register.
**Moat:** the honest read — ROMAS Take flags that the survival signal must be weighed against
RADCOMP/TORPEdO and the access-equity economics, labeled as interpretation (Rule 3).

---

## Theme 4 — Online adaptive RT goes mainstream and gets cheaper (signal 88)

CBCT-based daily adaptation, once a single-vendor premium, is now a competitive multi-vendor
category — and the QA model has to keep pace with same-session replanning.

| Finding | Source | Signal |
|---|---|---|
| **Varian Ethos 2.0** (FDA-cleared) — AI auto-segmentation of 70+ structures on **HyperSight** CBCT for in-slot daily adaptation; ASTRO 2025 Halcyon refresh adds PerfectKinetix couch + IDENTIFY + embedded HyperSight | Varian; BusinessWire 2025-09-28 | 90 |
| **Elekta Evo** — FDA-cleared (K252188, verified openFDA, Jan 2026) CBCT-based adaptive on the C-arm linac; brings AI-assisted adaptive to the installed Elekta base | openFDA 510(k) K252188 (verified) | 86 |
| **Sim-free / MR-Linac adaptive** workflows — MR-guided daily adaptation (Unity / MRIdian-successor) continues to mature; sim-free pathways compress time-to-treat | Elekta Unity + literature | 78 |
| **Adaptive QA gap** — same-session replanning leaves no time for measurement-based patient-specific QA; AI gamma-prediction (Theme 5) is the operational answer | ESTRO-AAPM + PSQA literature | 80 |

**ROMAS angle:** `vendor_note` + `practice_delta`. Physicist + operator audience. **Moat:** the
physics-operational seam — what daily adaptation does to staffing, throughput, and the QA model,
not just the marketing.

---

## Theme 5 — AI: contouring commoditized, the frontier moves to dose + autonomous QA (signal 88)

Auto-contouring is now table stakes. The 2025–2026 research frontier — and the regulatory
attention — moved to dose prediction, autonomous planning, and measurement-free QA.

| Finding | Source | Signal |
|---|---|---|
| **Joint ESTRO–AAPM guideline** for AI model development, clinical validation, and reporting across segmentation/planning/PSQA/adaptive — the first consensus bar, landing as the EU AI Act classes medical AI high-risk | Hurkmans et al., Radiother Oncol 2024;199:110428 | 85 |
| **AI patient-specific QA** — models predict IMRT/VMAT gamma passing rates from fluence radiomics / log files / MC dose (incl. a HyperArc LSTM binning plans Ideal/Investigate/Replan) — the answer to the adaptive-QA time crunch | Front Oncol 2025 (10.3389/fonc.2025.1509449); HyperArc LSTM PMC12370377 | 82 |
| **GDP-HMM** and dose-prediction challenges — public benchmarks push automated dose prediction toward clinical-grade | GDP-HMM grand challenge + dose-prediction literature | 78 |
| **Vendor consolidation** — GE HealthCare + MIM; **Radformation acquired Limbus** (2024, not 2025) — auto-contouring rolls up into planning-adjacent suites | GE/MIM + Radformation-Limbus (radformation.com) | 75 |
| **RaySearch v2025 / ECHO auto-planning** — automated planning + machine-learning planning in RayStation's release line | RaySearch (raysearchlabs.com) | 74 |
| **GPT-5 RadOnc benchmark** + **SAM 2 segmentation reality-check** — LLMs benchmarked on RadOnc board-style reasoning; SAM 2 underperforms dedicated medical segmentation (a useful counter to hype) | Published benchmarks 2025 (verify exact citation at proof) | 70 |

**ROMAS angle:** `paper_critique` + `vendor_note`, the AI category's 100-row engine. The
differentiated read is *adoption readiness vs hype* — SAM-2-underperforms is as much a story as
the wins. Physicist + physician + industry audience. **Moat:** AI-in-RT depth with a built-in
skepticism filter.

---

## Theme 6 — FLASH hits the first-clinical-data inflection (signal 92, physics moat)

FLASH moved from preclinical promise toward first human thoracic data — while the dosimetry
foundation underneath it remains unsolved.

| Finding | Source | Signal |
|---|---|---|
| **FLASH detector problem persists** — ion chambers saturate from recombination at UHDR (PTW Advanced Markus certified ≥99% only to ~5.56 mGy/pulse, far below FLASH); 2025 work pushes sub-0.3 mm gaps + diamond/SiC, but no validated standard protocol yet | Front Phys 2025 (10.3389/fphy.2025.1576227) + PTW | 92 |
| **FAST-02** — Varian proton FLASH trial completed enrollment + treatment of 10 patients (8 Gy single fraction, ≥40 Gy/s, transmission beam, thoracic bone mets), Aug 2025 | Varian/BusinessWire 2025-08-25 | 84 |
| **FAST-01** — the predecessor first-in-human proton FLASH feasibility (extremity bone mets) is the verified human-FLASH lineage (corrects the non-existent "IMPULSE" trial) | FAST-01 (Cincinnati Children's / NEJM-era reporting) | 75 |

**ROMAS angle:** `primer` + `news_brief`. The physics moat in pure form — ROMAS is the outlet that
explains *why FLASH dosimetry is hard*, not just that a trial enrolled. Physicist + researcher
audience, with a physician-readable primer tier.

---

## Theme 7 — Theranostics × external-beam convergence (signal 86)

Radiopharmaceuticals and external-beam RT increasingly combine, and the radiation oncologist is
moving into the theranostics workflow.

| Finding | Source | Signal |
|---|---|---|
| **ARTO** — adding SBRT to abiraterone in oligometastatic castration-resistant prostate cancer improves outcomes; the RT-on-top-of-systemic model | ARTO trial (published 2025) | 86 |
| **PSMA-directed RT integration** (LUNAR / PSMA-guided) — PSMA PET reshapes target definition and the SBRT-vs-systemic sequencing in prostate | PSMA-RT literature 2025 | 80 |
| **Lu-177 / theranostics operational footprint** — departments build radiopharmaceutical-therapy capacity adjacent to the linac vault | Society + operational reporting | 72 |

**ROMAS angle:** `paper_critique` + `practice_delta`, Future/Clinical categories. Physician +
operator audience (the workflow + licensing implications). **Moat:** the convergence read — where
RT and nuclear medicine collide operationally.

---

## Theme 8 — AI regulation matures into a real compliance surface (signal 88, regulatory moat)

The governance layer for RT AI went from aspiration to dated obligations across jurisdictions —
the multi-jurisdiction read no clinical outlet does well.

| Finding | Source | Signal |
|---|---|---|
| **FDA PCCP final guidance** (Aug 2025) — Predetermined Change Control Plans let AI/ML device makers pre-authorize model updates without a new 510(k); reshapes how adaptive RT-AI ships | FDA guidance (fda.gov, Aug 2025) | 86 |
| **EU AI Act high-risk obligations** for RT software — medical AI classed high-risk; core obligations land **Aug 2, 2027**, though the **Digital Omnibus** may shift timelines toward 2028 | EU AI Act (Reg. 2024/1689) + Digital Omnibus proposal | 84 |
| **Elekta Evo FDA clearance K252188** — verified against openFDA (Jan 2026); the Rule-4 worked example | openFDA 510(k) database (verified) | 82 |
| **Multi-jurisdiction RT device flow** — FDA / EMA / MHRA / PMDA / TGA / NMPA clearances and recalls tracked against the official record (Rule 4) | openFDA + agency registers | 78 |

**ROMAS angle:** `fda_brief` + `reimbursement_explainer`-adjacent regulatory franchise. Industry +
operator + physicist audience. **Moat:** the multi-jurisdiction regulatory read with openFDA →
official-record verification baked into the pipeline (Rule 4). This is structurally hard to copy.

---

## Theme 9 — Physics infrastructure catches up to the machines (signal 90, physics moat)

The protocols, safety data, and validation methods physicists need finally landed in 2024–2025 —
years after the hardware they govern. Pure ROMAS moat: no general oncology outlet touches this.

| Finding | Source | Signal |
|---|---|---|
| **AAPM TG-351** — first reference-dosimetry protocol for MR-guided linacs (Sarfehnia et al.); closes the gap where TG-51/TRS-398 never accounted for B-field chamber effects | AAPM TG-351, Med Phys 2025 (DOI 10.1002/mp.17884) | 95 |
| **AAPM TG-332** — method to independently validate vendor "black-box" systems incl. ML inside the TPS; directly relevant as AI features proliferate with no transparent internals | AAPM TG-332, Med Phys 2025;52:3509–3527 (10.1002/mp.17879) | 88 |
| **RO-ILS 10-year review** — 781 facilities, 41,516 events by Jan 2025; ~24% reached a patient, ~10% potentially severe; treatment planning a leading failure phase — physics chart review as a primary safety barrier | Ford et al., IJROBP 2026;124(2):265–277 (PMID 41218661) | 87 |
| **IAEA TRS-398 rev-1** (2024) — first major revision of the absorbed-dose code of practice, adding a proton pencil-beam scanning supplement | IAEA TRS-398 rev-1, Vienna 2024 | 83 |
| **MRI-only planning crosses to clinical** — deep-learning synthetic-CT moves from feasibility to routine (prostate MROP; commercial MRI Planner sCT for H&N/pelvic), validated by HU + gamma vs planning CT; **SynthRAD2025** gives the field a fair public benchmark | Radiat Oncol 2025 (10.1186/s13014-025-02744-2); SynthRAD2025 PMC12264395 | 80 |
| **kB,Q chamber factors** experimentally validated for 7 MR-compatible chambers on 1.5T Unity + 0.35T MRIdian — feeds TG-351-era calibration | Orlando et al., JACMP 2025 (PMID 39673528) | 86 |

**ROMAS angle:** `practice_delta` + `primer` + `long_take`, the Physics category's 70-row spine.
Physicist + dosimetrist audience. **Moat:** this *is* the moat — ROMAS Wire is the only twice-weekly
outlet that leads with TG reports and reference dosimetry.

**Verification caveats carried to the catalog (Rule 1/5):** TG-351 full citation rests on a search
snippet (DOI page returned HTTP 402 paywall) — TG number/authors/journal/year corroborated, verify
volume/pages at proof. TG-332 pagination from a snippet — confirm before print. No real 2025 "TG-302"
or "TG-315" report surfaced; not asserted. "IMPULSE" proton-FLASH trial does not exist — corrected to
FAST-01/02.

---

## Theme 10 — Vendor landscape shifts under the field's feet (signal 80)

The competitive map redrew itself: one major exit, one restructuring, several FDA-cleared launches,
and a consolidation wave.

| Finding | Source | Signal |
|---|---|---|
| **ViewRay / MRIdian** — ViewRay ceased operations Oct 2023; MRIdian installed base now serviced under successor ownership — a cautionary tale on single-vendor dependence (corrects any "2025 ViewRay launch" claim) | ViewRay Chapter 11 (Oct 2023) | 76 |
| **Elekta Evo + restructuring** — Evo CBCT-adaptive launch alongside corporate restructuring; Elekta repositions against Varian's adaptive lead | Elekta (elekta.com) + Evo K252188 | 80 |
| **Varian Ethos 2.0 / HyperSight / Halcyon refresh** — Varian (Siemens Healthineers) consolidates the adaptive-RT category lead | Varian/BusinessWire 2025 | 84 |
| **GE HealthCare MR Contour DL** — FDA-cleared deep-learning contouring; GE pushes into RT planning-adjacent AI | GE HealthCare (FDA clearance) | 88 |
| **Leo Cancer Care upright therapy** + **RefleXion biology-guided (BgRT)** — emerging-modality vendors carve niche categories (upright/seated RT; PET-guided real-time) | Leo Cancer Care; RefleXion (reflexion.com) | 70 |

**ROMAS angle:** `vendor_note` — the 50-row Vendor category. Industry + investor + operator
audience. **Moat:** the honest competitive read (ViewRay's exit as a buyer's-risk lesson), not vendor PR.

---

## What this does to the 500-article plan (feeds CONTENT-3 plan update)

The research **confirms** the locked category distribution but **re-weights the launch tranche**:

1. **Reimbursement punches above its 30-row weight at launch.** Theme 1 is the highest-operational
   story of the window and the least-covered. Front-load `reimbursement_explainer` Hero/Strong rows
   in weeks 1–2 even though the category is only 30 of 500.
2. **Physics (70) and AI (100) are the moat — over-index quality, not just count.** Themes 5/6/9 are
   where ROMAS is structurally differentiated. The Hero band (50 articles, 85+) should skew
   physics/AI/regulatory heavier than a naïve clinical-only outlet would.
3. **Clinical (80) leads on the SBRT-default narrative (Theme 2).** Five mature randomized trials are
   ready-made Hero `paper_critique` rows.
4. **Regulatory (50) is a real moat, not a checkbox (Theme 8).** FDA PCCP + EU AI Act + openFDA
   verification is hard to copy — give it Hero placement, not filler.
5. **Vendor (50) reads as competitive intelligence, not PR (Theme 10).** The ViewRay-exit lens sets
   the tone: buyer's-risk, not brochure.
6. **Region mix holds (SSOT decision 15)** — Europe 160 is well-supported (ESTRO, EMBRACE-II, TRS-398,
   EU AI Act, Elekta); APAC 130 needs deliberate sourcing (JASTRO, NMPA read-only, RANZCR) since the
   research skewed US/EU — a sourcing action for the pipeline, flagged here so it isn't silently missed
   (Rule 5 discipline applied to our own coverage gaps).

**No category target changes.** The distribution in the 500-Article-Launch-Plan §2.1 and SSOT
decision 15 region mix stand. What changes is *launch sequencing* — the 8-week ramp leads with
Themes 1/2/3/8/9 because that is where the signal and the moat are.

---

## Source-integrity ledger (the discipline behind the 90 findings)

- **Zero fabrication.** No trial name, DOI, TG number, or FDA clearance number was invented. Where a
  citation rests on a search snippet rather than a fetched page, the item says so (TG-351, TG-332,
  the proton-OS Lancet citation, the GPT-5/SAM-2 benchmarks) and is flagged for proof-stage
  verification — never printed as settled.
- **Date corrections caught:** Radformation–Limbus is **2024** (not 2025); Siemens AI-Rad Companion is
  **2020**; ViewRay/MRIdian ceased **Oct 2023**; NRG-BR002 is **ASCO 2022**; SABR-COMET-10 OS **not yet
  published** (watchlist, not a claim).
- **Non-findings stated, not padded:** no real 2025 "TG-302"/"TG-315"; no "IMPULSE" proton-FLASH trial;
  SAM 2 *under*performs dedicated medical segmentation (counter-hype finding kept).
- **Rule 4 worked example:** Elekta Evo K252188 verified against the openFDA 510(k) record before entry.
- **Our own coverage gap surfaced (Rule 5 applied reflexively):** the research skewed US/EU; APAC/LATAM
  sourcing is a named pipeline action, not silently dropped.

---

*Built 2026-06-04 from 5 parallel grounded-research agents. Next: CONTENT-4 maps these 90 findings to
`articles` rows (the launch tranche of the 500-article library), seeded as `status='draft'` with real
`primary_source_url` only (Rule 1). Then CONTENT-5 finalizes the production pipeline.*
