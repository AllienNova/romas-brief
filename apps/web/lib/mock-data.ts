/**
 * ROMAS Brief — Mock data layer
 * Used for preview/development when Supabase is not yet provisioned.
 * Replace all imports of this file with real Supabase queries once
 * `supabase gen types typescript --linked` has run.
 */

export type ContentType =
  | "news_brief"
  | "paper_critique"
  | "practice_delta"
  | "fda_brief"
  | "reimbursement_explainer"
  | "vendor_intel"
  | "long_take"
  | "primer";

export type Category =
  | "ai"
  | "physics"
  | "clinical-rt"
  | "regulatory"
  | "guidelines"
  | "reimbursement"
  | "vendor"
  | "conferences"
  | "resident-education"
  | "future-rt"
  | "operations";

export type Region =
  | "us"
  | "europe"
  | "uk"
  | "apac"
  | "canada"
  | "latam"
  | "mena-africa"
  | "global";

export type Audience =
  | "physicians"
  | "physicists"
  | "dosimetrists"
  | "therapists"
  | "residents";

export interface MockArticle {
  slug: string;
  title: string;
  standfirst: string;
  body: string;
  category: Category;
  content_type: ContentType;
  region: Region;
  audience: Audience[];
  primary_source_url: string;
  primary_source_type: string;
  published_at: string;
  issue_date: string;
  has_audio: boolean;
  audio_url?: string;
  composite_score: number;
  signal_scores: {
    clinical: number;
    ai: number;
    physics: number;
    operational: number;
    novelty: number;
    confidence: number;
  };
  romas_insight?: string;
  tags: string[];
  modality_tags: string[];
  disease_site_tags: string[];
  thumbnail_url?: string;
}

export const MOCK_ARTICLES: MockArticle[] = [
  {
    slug: "flash-rt-proton-clinical-trial-2026",
    title: "FLASH Proton Therapy Achieves 40% Reduction in Normal-Tissue Toxicity in Phase II Trial",
    standfirst:
      "A multi-centre Phase II trial reports that ultra-high dose-rate proton FLASH therapy delivered at ≥40 Gy/s reduces grade ≥2 acute toxicity by 40% versus conventional proton therapy in locally advanced NSCLC.",
    body: `A landmark Phase II randomised controlled trial published in *The Lancet Oncology* has demonstrated that FLASH proton therapy — delivered at dose rates exceeding 40 Gy/s — achieves a statistically significant 40% reduction in grade ≥2 acute normal-tissue toxicity compared with conventional proton therapy in patients with locally advanced non-small cell lung cancer (NSCLC).

The trial enrolled 124 patients across six proton centres in the US, Switzerland, and Japan. Primary endpoint was grade ≥2 acute radiation pneumonitis at 12 weeks. Secondary endpoints included local control at 24 months, overall survival, and patient-reported outcomes.

**ROMAS Insight:** This is the first adequately powered randomised evidence for FLASH in a thoracic indication. The 40% toxicity reduction, if confirmed in Phase III, would represent the most significant advance in therapeutic ratio since IMRT. Physics teams should begin commissioning reviews now — the dose-rate monitoring requirements differ substantially from conventional delivery.`,
    category: "clinical-rt",
    content_type: "paper_critique",
    region: "global",
    audience: ["physicians", "physicists", "residents"],
    primary_source_url: "https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(26)00123-4",
    primary_source_type: "clinical_trial",
    published_at: "2026-05-28T07:00:00Z",
    issue_date: "2026-05-28",
    has_audio: true,
    composite_score: 94,
    signal_scores: { clinical: 0.95, ai: 0.0, physics: 0.9, operational: 0.7, novelty: 0.98, confidence: 0.9 },
    romas_insight: "First adequately powered RCT evidence for FLASH. Physics teams should begin commissioning reviews immediately.",
    tags: ["FLASH", "proton therapy", "NSCLC", "toxicity", "Phase II"],
    modality_tags: ["proton", "FLASH"],
    disease_site_tags: ["lung"],
    thumbnail_url: "/thumbnails/flash-rt-proton-clinical-trial-2026.jpg",
  },
  {
    slug: "ai-auto-contouring-head-neck-fda-clearance",
    title: "FDA Clears AI Auto-Contouring System for Head and Neck OAR Delineation",
    standfirst:
      "The FDA has granted 510(k) clearance to an AI-driven organ-at-risk auto-contouring system for head and neck radiation therapy planning, with clinical validation showing mean DSC of 0.89 across 14 OARs.",
    body: `The US Food and Drug Administration has issued 510(k) clearance (K262847) for an AI-powered organ-at-risk (OAR) auto-contouring system specifically validated for head and neck radiation therapy treatment planning. The cleared indication covers delineation of 14 OARs including parotid glands, submandibular glands, spinal cord, brainstem, mandible, and cochleae.

Clinical validation data submitted to the FDA demonstrated a mean Dice Similarity Coefficient (DSC) of 0.89 across all 14 OARs, with the lowest individual OAR performance at 0.82 (cochlea). The system was validated on a multi-institutional dataset of 847 patients from 12 centres.

**ROMAS Insight:** The 0.89 mean DSC is clinically meaningful for most OARs but physics teams should establish local QA thresholds before clinical deployment. The cochlea DSC of 0.82 warrants manual review for every case where cochlear sparing is a planning objective.`,
    category: "ai",
    content_type: "fda_brief",
    region: "us",
    audience: ["physicists", "dosimetrists", "physicians"],
    primary_source_url: "https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm?ID=K262847",
    primary_source_type: "fda_510k",
    published_at: "2026-05-27T07:00:00Z",
    issue_date: "2026-05-27",
    has_audio: true,
    composite_score: 88,
    signal_scores: { clinical: 0.7, ai: 0.95, physics: 0.85, operational: 0.9, novelty: 0.75, confidence: 0.95 },
    romas_insight: "Clinically meaningful DSC but cochlea performance warrants manual QA threshold before deployment.",
    tags: ["auto-contouring", "FDA clearance", "head and neck", "OAR", "AI"],
    modality_tags: ["IMRT", "VMAT"],
    disease_site_tags: ["head-neck"],
    thumbnail_url: "/thumbnails/ai-auto-contouring-head-neck-fda-clearance.jpg",
  },
  {
    slug: "mr-linac-adaptive-rt-prostate-astro-guideline",
    title: "ASTRO Releases First Guideline on MR-Linac Adaptive RT for Prostate Cancer",
    standfirst:
      "The American Society for Radiation Oncology has published its first evidence-based guideline on online adaptive radiation therapy using MR-guided linear accelerators for localised prostate cancer, recommending daily online adaptation for all patients.",
    body: `The American Society for Radiation Oncology (ASTRO) has published the first comprehensive evidence-based guideline on online adaptive radiation therapy (ART) using magnetic resonance-guided linear accelerators (MR-Linac) for localised prostate cancer. The guideline, developed by a multidisciplinary task force, provides 23 recommendations across four domains: patient selection, simulation, treatment planning, and quality assurance.

Key recommendations include: daily online adaptation is recommended for all patients (Grade A, High evidence); a minimum of 5 fractions of stereotactic body radiation therapy (SBRT) is the preferred fractionation scheme (Grade B, Moderate evidence); and a dedicated MR-Linac physics QA programme must be established before clinical implementation (Grade A, Expert consensus).

**ROMAS Insight:** This guideline will accelerate MR-Linac adoption but the QA programme requirement is non-trivial. Centres should budget 6–12 months for physics commissioning and workflow development before treating patients.`,
    category: "guidelines",
    content_type: "practice_delta",
    region: "us",
    audience: ["physicians", "physicists", "dosimetrists"],
    primary_source_url: "https://www.redjournal.org/article/S0360-3016(26)00456-7",
    primary_source_type: "guideline",
    published_at: "2026-05-26T07:00:00Z",
    issue_date: "2026-05-26",
    has_audio: true,
    composite_score: 91,
    signal_scores: { clinical: 0.9, ai: 0.1, physics: 0.85, operational: 0.95, novelty: 0.7, confidence: 0.95 },
    romas_insight: "QA programme requirement is non-trivial — budget 6–12 months for commissioning before treating patients.",
    tags: ["MR-Linac", "adaptive RT", "prostate", "ASTRO", "guideline", "SBRT"],
    modality_tags: ["MR-Linac", "SBRT"],
    disease_site_tags: ["prostate"],
    thumbnail_url: "/thumbnails/mr-linac-adaptive-rt-prostate-astro-guideline.jpg",
  },
  {
    slug: "cms-reimbursement-sbrt-lung-2026",
    title: "CMS Finalises 2026 SBRT Lung Reimbursement: 8% Increase for Stereotactic Ablative Radiotherapy",
    standfirst:
      "The Centers for Medicare and Medicaid Services has finalised an 8% increase in reimbursement for stereotactic ablative radiotherapy (SABR) for early-stage lung cancer in the 2026 Medicare Physician Fee Schedule, effective January 1.",
    body: `The Centers for Medicare and Medicaid Services (CMS) has finalised the 2026 Medicare Physician Fee Schedule (MPFS), which includes an 8% increase in reimbursement for stereotactic ablative radiotherapy (SABR) — also referred to as stereotactic body radiation therapy (SBRT) — for early-stage non-small cell lung cancer. The final rule was published in the Federal Register on November 1, 2025, and took effect January 1, 2026.

The increase applies to CPT codes 77373 (SBRT delivery, per fraction) and 77435 (SBRT planning). The work relative value units (wRVUs) for 77373 increase from 3.42 to 3.69, and for 77435 from 12.50 to 13.50. At the 2026 conversion factor of $32.35, this translates to an increase of approximately $8.70 per fraction for delivery and $32.35 for planning.

**ROMAS Insight:** The 8% increase partially offsets the multi-year decline in radiation oncology reimbursement. Practices should update their charge capture workflows and verify that their billing systems reflect the new RVU values effective January 1.`,
    category: "reimbursement",
    content_type: "reimbursement_explainer",
    region: "us",
    audience: ["physicians", "dosimetrists"],
    primary_source_url: "https://www.federalregister.gov/documents/2025/11/01/2025-23456/medicare-physician-fee-schedule-2026",
    primary_source_type: "regulatory",
    published_at: "2026-05-25T07:00:00Z",
    issue_date: "2026-05-25",
    has_audio: false,
    composite_score: 82,
    signal_scores: { clinical: 0.3, ai: 0.0, physics: 0.1, operational: 0.95, novelty: 0.6, confidence: 0.98 },
    romas_insight: "Update charge capture workflows and verify billing systems reflect new RVU values.",
    tags: ["CMS", "reimbursement", "SBRT", "SABR", "lung", "Medicare"],
    modality_tags: ["SBRT", "SABR"],
    disease_site_tags: ["lung"],
    thumbnail_url: "/thumbnails/cms-reimbursement-sbrt-lung-2026.jpg",
  },
  {
    slug: "elekta-unity-mr-linac-software-update",
    title: "Elekta Unity MR-Linac Receives CE Mark for Monaco 5.51 Adaptive Planning Software",
    standfirst:
      "Elekta has received CE Mark approval for Monaco 5.51, the latest adaptive treatment planning software for the Unity MR-Linac, featuring a 40% reduction in online adaptation time through GPU-accelerated dose calculation.",
    body: `Elekta has announced CE Mark approval for Monaco 5.51, the latest version of its adaptive treatment planning software for the Unity MR-Linac system. The approval covers the full adaptive workflow including online plan adaptation, dose accumulation, and automated plan quality checks.

The key clinical advancement in Monaco 5.51 is a 40% reduction in online adaptation time, achieved through GPU-accelerated Monte Carlo dose calculation. In a multi-centre validation study across 8 Unity centres, the mean online adaptation time decreased from 14.2 minutes to 8.5 minutes, enabling more efficient treatment delivery and reduced patient time on the couch.

**ROMAS Insight:** The 40% time reduction is operationally significant — it brings online adaptation time within the practical window for most fractionation schedules. Centres currently using Monaco 5.40 should plan their upgrade pathway and validate the new dose calculation engine against their existing commissioning data.`,
    category: "vendor",
    content_type: "vendor_intel",
    region: "europe",
    audience: ["physicists", "dosimetrists"],
    primary_source_url: "https://www.elekta.com/media/press-releases/2026/monaco-551-ce-mark",
    primary_source_type: "vendor",
    published_at: "2026-05-24T07:00:00Z",
    issue_date: "2026-05-24",
    has_audio: false,
    composite_score: 76,
    signal_scores: { clinical: 0.4, ai: 0.3, physics: 0.9, operational: 0.85, novelty: 0.65, confidence: 0.9 },
    romas_insight: "Plan upgrade pathway and validate new dose calculation engine against existing commissioning data.",
    tags: ["Elekta", "Unity", "MR-Linac", "Monaco", "adaptive planning", "CE Mark"],
    modality_tags: ["MR-Linac"],
    disease_site_tags: [],
    thumbnail_url: "/thumbnails/elekta-unity-mr-linac-software-update.jpg",
  },
  {
    slug: "deepseek-r2-rt-plan-optimisation",
    title: "DeepSeek-R2 Achieves Near-Expert Performance on Radiation Therapy Treatment Plan Optimisation",
    standfirst:
      "A study published in Nature Medicine demonstrates that DeepSeek-R2, fine-tuned on 12,000 anonymised RT plans, achieves near-expert performance on automated treatment plan optimisation for prostate and head-and-neck cases.",
    body: `A study published in *Nature Medicine* has demonstrated that DeepSeek-R2, a large language model fine-tuned on 12,000 anonymised radiation therapy treatment plans, achieves near-expert performance on automated treatment plan optimisation for prostate and head-and-neck cancer cases.

The model was evaluated on 500 held-out cases across two institutions. For prostate SBRT, the model-generated plans met all RTOG 0938 constraints in 94.2% of cases, compared with 96.8% for expert planners. For head-and-neck IMRT, constraint satisfaction was 89.1% versus 93.4% for experts.

**ROMAS Insight:** The performance gap between AI and expert planners is narrowing rapidly. Dosimetry teams should begin evaluating AI-assisted planning workflows, but the 4–10% constraint satisfaction gap means human review remains essential for all clinical cases.`,
    category: "ai",
    content_type: "paper_critique",
    region: "global",
    audience: ["physicists", "dosimetrists", "residents"],
    primary_source_url: "https://www.nature.com/articles/s41591-026-02345-6",
    primary_source_type: "research",
    published_at: "2026-05-23T07:00:00Z",
    issue_date: "2026-05-23",
    has_audio: true,
    composite_score: 87,
    signal_scores: { clinical: 0.5, ai: 0.98, physics: 0.75, operational: 0.8, novelty: 0.9, confidence: 0.85 },
    romas_insight: "Human review remains essential — 4–10% constraint satisfaction gap persists vs expert planners.",
    tags: ["AI", "treatment planning", "LLM", "DeepSeek", "optimisation"],
    modality_tags: ["IMRT", "SBRT"],
    disease_site_tags: ["prostate", "head-neck"],
    thumbnail_url: "/thumbnails/deepseek-r2-rt-plan-optimisation.jpg",
  },
  {
    slug: "eudamed-radiation-therapy-device-registry-2026",
    title: "EUDAMED Mandatory Registration Begins for All EU Radiation Therapy Devices",
    standfirst:
      "The European Union's EUDAMED medical device database has entered its mandatory phase for all radiation therapy devices, requiring manufacturers to register all Class IIb and Class III RT devices by June 30, 2026.",
    body: `The European Union's EUDAMED (European Database on Medical Devices) has entered its mandatory registration phase for radiation therapy devices. As of May 1, 2026, all manufacturers placing Class IIb and Class III radiation therapy devices on the EU market are required to register their devices in EUDAMED, with a compliance deadline of June 30, 2026.

The mandatory registration covers linear accelerators, treatment planning systems, brachytherapy afterloaders, proton therapy systems, and associated software classified as medical devices under the EU MDR (Regulation 2017/745). Manufacturers who fail to register by the deadline face market withdrawal orders from national competent authorities.

**ROMAS Insight:** EU centres should verify with their vendors that all installed RT devices are EUDAMED-registered before the June 30 deadline. Non-registered devices may face service interruption if vendors are issued market withdrawal orders.`,
    category: "regulatory",
    content_type: "news_brief",
    region: "europe",
    audience: ["physicians", "physicists"],
    primary_source_url: "https://ec.europa.eu/health/medical-devices-sector/new-regulations/eudamed_en",
    primary_source_type: "regulatory",
    published_at: "2026-05-22T07:00:00Z",
    issue_date: "2026-05-22",
    has_audio: false,
    composite_score: 79,
    signal_scores: { clinical: 0.2, ai: 0.0, physics: 0.3, operational: 0.9, novelty: 0.6, confidence: 0.98 },
    romas_insight: "Verify with vendors that all installed RT devices are EUDAMED-registered before June 30 deadline.",
    tags: ["EUDAMED", "EU MDR", "regulatory", "medical devices", "Europe"],
    modality_tags: [],
    disease_site_tags: [],
    thumbnail_url: "/thumbnails/eudamed-radiation-therapy-device-registry-2026.jpg",
  },
  {
    slug: "aapm-tg-302-small-field-dosimetry",
    title: "AAPM Task Group 302 Report: Updated Small-Field Dosimetry Reference Data for SRS/SBRT",
    standfirst:
      "The American Association of Physicists in Medicine has published Task Group Report 302, providing updated reference dosimetry data and correction factors for small-field measurements used in SRS and SBRT quality assurance.",
    body: `The American Association of Physicists in Medicine (AAPM) has published Task Group Report 302 (TG-302), providing updated reference dosimetry data and output correction factors for small-field measurements used in stereotactic radiosurgery (SRS) and stereotactic body radiation therapy (SBRT) quality assurance.

TG-302 supersedes TG-155 for field sizes below 3×3 cm² and provides updated Monte Carlo-calculated output correction factors for 47 detector types across 6 linear accelerator platforms. Key changes include revised correction factors for the IBA CC01 (change of +1.8% at 5mm field), PTW 60019 microDiamond (change of −0.9% at 5mm field), and Sun Nuclear Edge detector (change of +2.1% at 5mm field).

**ROMAS Insight:** Physics teams using SRS/SBRT programmes must review their small-field dosimetry against TG-302 correction factors. The changes for the CC01 and Edge detector are clinically significant and may require output re-measurement.`,
    category: "physics",
    content_type: "practice_delta",
    region: "us",
    audience: ["physicists"],
    primary_source_url: "https://aapm.onlinelibrary.wiley.com/doi/10.1002/mp.17234",
    primary_source_type: "guideline",
    published_at: "2026-05-21T07:00:00Z",
    issue_date: "2026-05-21",
    has_audio: true,
    composite_score: 85,
    signal_scores: { clinical: 0.3, ai: 0.0, physics: 0.98, operational: 0.9, novelty: 0.7, confidence: 0.98 },
    romas_insight: "CC01 and Edge detector changes are clinically significant — may require output re-measurement.",
    tags: ["AAPM", "TG-302", "small field", "dosimetry", "SRS", "SBRT", "QA"],
    modality_tags: ["SRS", "SBRT"],
    disease_site_tags: [],
    thumbnail_url: "/thumbnails/health-canada-mlc-safety-alert.jpg",
  },
  {
    slug: "mhra-linac-software-guidance-uk",
    title: "MHRA Issues New Guidance on Software as a Medical Device for RT Treatment Planning Systems",
    standfirst:
      "The UK Medicines and Healthcare products Regulatory Agency has published updated guidance on the classification and regulation of software as a medical device (SaMD) for radiation therapy treatment planning systems post-Brexit.",
    body: `The UK Medicines and Healthcare products Regulatory Agency (MHRA) has published updated guidance on the classification and regulation of software as a medical device (SaMD) for radiation therapy treatment planning systems under the UK Medical Devices Regulations 2002 (as amended). The guidance takes effect July 1, 2026.

The updated guidance clarifies that treatment planning system software modules that perform dose calculation, plan optimisation, or dose-volume histogram analysis are classified as Class IIb medical devices under UK MDR, regardless of whether they are standalone software or embedded within a hardware system. This classification triggers mandatory UKCA marking requirements for all such software sold in Great Britain.

**ROMAS Insight:** UK centres should request UKCA compliance documentation from their TPS vendors before July 1. Vendors who have not obtained UKCA marking may face market access restrictions in Great Britain.`,
    category: "regulatory",
    content_type: "news_brief",
    region: "uk",
    audience: ["physicians", "physicists"],
    primary_source_url: "https://www.gov.uk/guidance/software-as-a-medical-device-samd",
    primary_source_type: "regulatory",
    published_at: "2026-05-20T07:00:00Z",
    issue_date: "2026-05-20",
    has_audio: false,
    composite_score: 77,
    signal_scores: { clinical: 0.2, ai: 0.1, physics: 0.4, operational: 0.9, novelty: 0.65, confidence: 0.95 },
    romas_insight: "Request UKCA compliance documentation from TPS vendors before July 1.",
    tags: ["MHRA", "UK", "SaMD", "TPS", "regulatory", "UKCA"],
    modality_tags: [],
    disease_site_tags: [],
    thumbnail_url: "/thumbnails/mhra-software-medical-device-rt-guidance.jpg",
  },
  {
    slug: "proton-therapy-paediatric-cns-long-term-outcomes",
    title: "15-Year Follow-Up Data Confirm Proton Therapy Superiority for Paediatric CNS Tumours",
    standfirst:
      "A 15-year follow-up study of 312 paediatric patients treated with proton therapy for CNS tumours demonstrates significantly lower rates of neurocognitive decline and endocrine dysfunction compared with photon radiotherapy.",
    body: `A landmark 15-year follow-up study published in the *Journal of Clinical Oncology* has confirmed the long-term superiority of proton therapy over photon radiotherapy for paediatric central nervous system (CNS) tumours in terms of neurocognitive and endocrine late effects.

The study followed 312 paediatric patients (median age at treatment 7.2 years) treated at three proton centres between 2008 and 2012. At 15-year follow-up, patients treated with proton therapy demonstrated significantly lower rates of clinically significant neurocognitive decline (18.3% vs 34.7%, p<0.001) and growth hormone deficiency (22.1% vs 41.8%, p<0.001) compared with a matched photon cohort.

**ROMAS Insight:** This 15-year dataset provides the strongest long-term evidence to date for proton therapy in paediatric CNS tumours. Paediatric oncology centres without proton access should establish referral pathways to proton centres for eligible patients.`,
    category: "clinical-rt",
    content_type: "paper_critique",
    region: "us",
    audience: ["physicians", "residents"],
    primary_source_url: "https://ascopubs.org/doi/10.1200/JCO.26.00789",
    primary_source_type: "clinical_trial",
    published_at: "2026-05-19T07:00:00Z",
    issue_date: "2026-05-19",
    has_audio: true,
    composite_score: 90,
    signal_scores: { clinical: 0.95, ai: 0.0, physics: 0.5, operational: 0.7, novelty: 0.8, confidence: 0.92 },
    romas_insight: "Establish referral pathways to proton centres for eligible paediatric CNS patients.",
    tags: ["proton therapy", "paediatric", "CNS", "neurocognitive", "long-term outcomes"],
    modality_tags: ["proton"],
    disease_site_tags: ["brain", "CNS"],
    thumbnail_url: "/thumbnails/paediatric-proton-therapy-15-year-followup.jpg",
  },
  {
    slug: "synthetic-ct-mri-only-rt-workflow",
    title: "MRI-Only RT Workflow Using Synthetic CT Achieves Dosimetric Equivalence in Pelvic Cancers",
    standfirst:
      "A prospective multi-centre study demonstrates that an MRI-only radiation therapy workflow using deep learning-generated synthetic CT achieves dosimetric equivalence to conventional CT-based planning for cervical and prostate cancers.",
    body: `A prospective multi-centre study published in *Radiotherapy and Oncology* has demonstrated that an MRI-only radiation therapy workflow using deep learning-generated synthetic CT (sCT) achieves dosimetric equivalence to conventional CT-based planning for cervical and prostate cancers, with mean dose differences of less than 1% for all planning target volume and organ-at-risk metrics.

The study enrolled 186 patients across four European centres. Synthetic CT images were generated from T2-weighted MRI using a U-Net architecture trained on 1,200 paired MRI-CT datasets. Dosimetric comparison showed mean PTV D95 differences of 0.4% (prostate) and 0.7% (cervix), well within the 2% clinical equivalence threshold.

**ROMAS Insight:** MRI-only workflows eliminate the CT simulation step and reduce patient dose from simulation imaging. Physics teams considering implementation should budget 3–6 months for sCT algorithm validation against their local patient population.`,
    category: "physics",
    content_type: "paper_critique",
    region: "europe",
    audience: ["physicists", "dosimetrists"],
    primary_source_url: "https://www.thegreenjournal.com/article/S0167-8140(26)00234-5",
    primary_source_type: "research",
    published_at: "2026-05-18T07:00:00Z",
    issue_date: "2026-05-18",
    has_audio: false,
    composite_score: 83,
    signal_scores: { clinical: 0.6, ai: 0.7, physics: 0.9, operational: 0.8, novelty: 0.75, confidence: 0.88 },
    romas_insight: "Budget 3–6 months for sCT algorithm validation against local patient population before implementation.",
    tags: ["synthetic CT", "MRI-only", "deep learning", "dosimetry", "pelvis"],
    modality_tags: ["IMRT", "VMAT"],
    disease_site_tags: ["prostate", "cervix"],
    thumbnail_url: "/thumbnails/deepseek-r2-rt-plan-optimisation.jpg",
  },
  {
    slug: "tata-memorial-adaptive-rt-cervical-cancer",
    title: "Tata Memorial Centre Reports Adaptive RT Outcomes for Cervical Cancer in Low-Resource Setting",
    standfirst:
      "Tata Memorial Centre Mumbai reports outcomes from a prospective study of online adaptive radiation therapy for locally advanced cervical cancer, demonstrating feasibility and improved dosimetric coverage in a high-volume, resource-constrained environment.",
    body: `Tata Memorial Centre (TMC) Mumbai has published outcomes from a prospective study of online adaptive radiation therapy (ART) for locally advanced cervical cancer, demonstrating feasibility and improved dosimetric coverage in a high-volume, resource-constrained clinical environment. The study represents the first large-scale report of online ART for cervical cancer from a low-to-middle-income country (LMIC) setting.

The study enrolled 145 patients with FIGO Stage IIB–IVA cervical cancer. Online adaptation was performed using a cone-beam CT-guided workflow on a conventional linac with in-house developed automated re-planning software. Mean HR-CTV D90 improved from 78.3 Gy to 84.7 Gy (EQD2) with online adaptation, while bladder V65Gy decreased by 12.3%.

**ROMAS Insight:** This study demonstrates that online ART is achievable without MR-Linac infrastructure. The TMC workflow — using CBCT-guided adaptation on conventional linacs — is directly replicable in most resource-constrained settings globally.`,
    category: "clinical-rt",
    content_type: "paper_critique",
    region: "apac",
    audience: ["physicians", "physicists", "dosimetrists"],
    primary_source_url: "https://www.thegreenjournal.com/article/S0167-8140(26)00312-0",
    primary_source_type: "research",
    published_at: "2026-05-17T07:00:00Z",
    issue_date: "2026-05-17",
    has_audio: true,
    composite_score: 86,
    signal_scores: { clinical: 0.85, ai: 0.1, physics: 0.75, operational: 0.9, novelty: 0.8, confidence: 0.88 },
    romas_insight: "CBCT-guided ART on conventional linacs is replicable in most resource-constrained settings globally.",
    tags: ["adaptive RT", "cervical cancer", "LMIC", "Tata Memorial", "CBCT"],
    modality_tags: ["IMRT", "adaptive"],
    disease_site_tags: ["cervix"],
    thumbnail_url: "/thumbnails/mr-linac-adaptive-rt-prostate-astro-guideline.jpg",
  },
  {
    slug: "brainlab-elements-ai-srs-planning",
    title: "Brainlab Elements 4.0 Introduces AI-Driven Multi-Isocenter SRS Planning for Brain Metastases",
    standfirst:
      "Brainlab has launched Elements 4.0, featuring an AI-driven multi-isocenter SRS planning module that reduces planning time by 60% for patients with 5–20 brain metastases while maintaining plan quality metrics.",
    body: `Brainlab has launched Elements 4.0, its latest stereotactic radiosurgery planning platform, featuring a new AI-driven multi-isocenter planning module specifically designed for patients with 5–20 brain metastases. The module uses a reinforcement learning algorithm trained on 8,500 clinical SRS plans to automatically determine optimal isocenter placement and beam configuration.

In a prospective validation study across 12 SRS centres, the AI-driven module reduced mean planning time from 47 minutes to 19 minutes (60% reduction) for patients with 5–20 metastases, while maintaining equivalent plan quality as measured by conformity index (CI: 1.21 AI vs 1.19 manual, p=0.34) and gradient index (GI: 3.12 AI vs 3.08 manual, p=0.41).

**ROMAS Insight:** The 60% planning time reduction is operationally transformative for high-volume SRS programmes. Physics teams should validate the AI isocenter placement algorithm against their institutional planning standards before clinical deployment.`,
    category: "vendor",
    content_type: "vendor_intel",
    region: "global",
    audience: ["physicists", "dosimetrists"],
    primary_source_url: "https://www.brainlab.com/treatments/radiosurgery/elements-4-0/",
    primary_source_type: "vendor",
    published_at: "2026-05-16T07:00:00Z",
    issue_date: "2026-05-16",
    has_audio: false,
    composite_score: 78,
    signal_scores: { clinical: 0.5, ai: 0.85, physics: 0.8, operational: 0.9, novelty: 0.7, confidence: 0.85 },
    romas_insight: "Validate AI isocenter placement algorithm against institutional planning standards before clinical deployment.",
    tags: ["Brainlab", "SRS", "brain metastases", "AI planning", "multi-isocenter"],
    modality_tags: ["SRS"],
    disease_site_tags: ["brain"],
    thumbnail_url: "/thumbnails/ai-auto-contouring-head-neck-fda-clearance.jpg",
  },
  {
    slug: "estro-2026-highlights-adaptive-rt",
    title: "ESTRO 2026 Highlights: Adaptive RT, AI Contouring, and FLASH Dominate the Programme",
    standfirst:
      "The European Society for Radiotherapy and Oncology annual meeting in Vienna featured landmark presentations on online adaptive RT, AI-driven auto-contouring, and FLASH radiotherapy, with several practice-changing abstracts across all three domains.",
    body: `The European Society for Radiotherapy and Oncology (ESTRO) 2026 annual meeting, held in Vienna from May 10–14, featured a programme dominated by three transformative themes: online adaptive radiation therapy, AI-driven auto-contouring, and FLASH radiotherapy. Over 4,200 attendees from 78 countries attended the meeting.

Key presentations included the MOMENTUM trial 3-year update (MR-Linac adaptive RT for prostate cancer), the CONTOUR-AI Phase III trial (AI auto-contouring vs manual for head and neck), and the FLASH-EU consortium interim analysis (FLASH proton therapy for thoracic tumours). All three presentations generated significant discussion regarding clinical implementation pathways.

**ROMAS Insight:** ESTRO 2026 marks a turning point — adaptive RT, AI contouring, and FLASH are moving from research to implementation. Centres not yet planning for these technologies should begin strategic planning now.`,
    category: "conferences",
    content_type: "news_brief",
    region: "europe",
    audience: ["physicians", "physicists", "dosimetrists", "residents"],
    primary_source_url: "https://www.estro.org/congresses/estro-2026",
    primary_source_type: "conference",
    published_at: "2026-05-15T07:00:00Z",
    issue_date: "2026-05-15",
    has_audio: true,
    composite_score: 84,
    signal_scores: { clinical: 0.7, ai: 0.6, physics: 0.6, operational: 0.7, novelty: 0.75, confidence: 0.88 },
    romas_insight: "Centres not yet planning for adaptive RT, AI contouring, and FLASH should begin strategic planning now.",
    tags: ["ESTRO", "conference", "adaptive RT", "AI", "FLASH", "2026"],
    modality_tags: ["MR-Linac", "FLASH", "IMRT"],
    disease_site_tags: [],
    thumbnail_url: "/thumbnails/estro-2026-conference-highlights.jpg",
  },
  {
    slug: "resident-guide-sbrt-lung-planning",
    title: "Resident's Guide: Step-by-Step SBRT Lung Planning — From Simulation to Plan Approval",
    standfirst:
      "A comprehensive practical guide for radiation oncology residents covering the complete workflow for stereotactic body radiation therapy lung planning, from 4DCT simulation through treatment plan approval and first-fraction QA.",
    body: `This practical guide covers the complete workflow for stereotactic body radiation therapy (SBRT) lung planning, designed for radiation oncology residents and dosimetry trainees. The guide follows a real clinical case — a 68-year-old patient with a 2.1 cm peripheral right upper lobe NSCLC — through each step of the planning process.

**Step 1: 4DCT Simulation.** The patient is simulated with 4DCT to capture respiratory motion. Key considerations include: breath-hold coaching, motion amplitude assessment (>5mm triggers motion management discussion), and generation of the internal target volume (ITV) from all breathing phases.

**Step 2: Target Volume Delineation.** The gross tumour volume (GTV) is delineated on the average CT and maximum intensity projection (MIP) images. The ITV encompasses the GTV across all breathing phases. The planning target volume (PTV) adds a 5mm isotropic margin to the ITV for setup uncertainty.

**ROMAS Insight:** The most common resident error in SBRT lung planning is under-coverage of the ITV on the MIP image. Always verify ITV coverage on each individual breathing phase CT, not just the average CT.`,
    category: "resident-education",
    content_type: "primer",
    region: "us",
    audience: ["residents", "dosimetrists"],
    primary_source_url: "https://www.redjournal.org/article/S0360-3016(26)00567-6",
    primary_source_type: "guideline",
    published_at: "2026-05-14T07:00:00Z",
    issue_date: "2026-05-14",
    has_audio: true,
    composite_score: 80,
    signal_scores: { clinical: 0.6, ai: 0.0, physics: 0.7, operational: 0.8, novelty: 0.5, confidence: 0.95 },
    romas_insight: "Most common resident error: under-coverage of ITV on MIP. Always verify on each breathing phase CT.",
    tags: ["resident", "SBRT", "lung", "planning", "4DCT", "education"],
    modality_tags: ["SBRT"],
    disease_site_tags: ["lung"],
    thumbnail_url: "/thumbnails/cms-reimbursement-sbrt-lung-2026.jpg",
  },
  {
    slug: "pmda-japan-rt-ai-regulatory-framework",
    title: "PMDA Releases Draft Regulatory Framework for AI-Based Radiation Therapy Software in Japan",
    standfirst:
      "Japan's Pharmaceuticals and Medical Devices Agency has released a draft regulatory framework for AI-based radiation therapy software, proposing a new classification pathway for adaptive RT and auto-contouring systems.",
    body: `Japan's Pharmaceuticals and Medical Devices Agency (PMDA) has released a draft regulatory framework for AI-based radiation therapy software, proposing a new classification pathway specifically for adaptive radiation therapy systems and AI-driven auto-contouring software. The draft framework is open for public comment until July 31, 2026.

The proposed framework creates a new Class III medical device category for "AI-driven radiation therapy decision support software" that performs dose calculation, plan optimisation, or target volume delineation. This category would require pre-market approval (Shonin) rather than the existing notification (Todokede) pathway, significantly increasing the regulatory burden for AI RT software vendors seeking market access in Japan.

**ROMAS Insight:** Japanese centres using AI RT software should monitor this framework closely. If finalised, it may affect the regulatory status of currently deployed systems and require re-approval.`,
    category: "regulatory",
    content_type: "news_brief",
    region: "apac",
    audience: ["physicians", "physicists"],
    primary_source_url: "https://www.pmda.go.jp/english/review-services/regulatory-science/0001.html",
    primary_source_type: "regulatory",
    published_at: "2026-05-13T07:00:00Z",
    issue_date: "2026-05-13",
    has_audio: false,
    composite_score: 74,
    signal_scores: { clinical: 0.2, ai: 0.5, physics: 0.2, operational: 0.85, novelty: 0.7, confidence: 0.9 },
    romas_insight: "Monitor this framework — if finalised, may affect regulatory status of currently deployed AI RT systems in Japan.",
    tags: ["PMDA", "Japan", "AI", "regulatory", "SaMD", "auto-contouring"],
    modality_tags: [],
    disease_site_tags: [],
    thumbnail_url: "/thumbnails/pmda-ai-rt-software-regulatory-framework.jpg",
  },
  {
    slug: "health-canada-linac-safety-alert",
    title: "Health Canada Issues Safety Alert for Specific Linac Collimator Leaf Positioning Errors",
    standfirst:
      "Health Canada has issued a medical device safety alert for a specific model of multi-leaf collimator following reports of systematic leaf positioning errors exceeding 2mm in 12 Canadian radiation therapy centres.",
    body: `Health Canada has issued a medical device safety alert (MDA-2026-05-001) for the Varian TrueBeam HD120 multi-leaf collimator (MLC) following reports of systematic leaf positioning errors exceeding 2mm in 12 Canadian radiation therapy centres. The alert affects TrueBeam systems with HD120 MLC serial numbers in the range 2024-001 through 2024-847.

The systematic error was identified during routine MLC QA using the AAPM TG-142 protocol and confirmed by the manufacturer. The error affects leaf pairs 40–60 (the central 2.5mm leaf pairs) and manifests as a consistent 2.1–2.8mm offset in the leaf-closed position. The manufacturer has identified the root cause as a firmware error in MLC controller version 4.2.1.

**ROMAS Insight:** Canadian centres with affected systems should immediately perform MLC QA using TG-142 and contact Varian for the firmware patch. Do not treat until MLC QA confirms leaf positioning is within tolerance.`,
    category: "physics",
    content_type: "news_brief",
    region: "canada",
    audience: ["physicists"],
    primary_source_url: "https://www.canada.ca/en/health-canada/services/drugs-health-products/medeffect-canada/safety-alerts/medical-devices/2026/mda-2026-05-001.html",
    primary_source_type: "regulatory",
    published_at: "2026-05-12T07:00:00Z",
    issue_date: "2026-05-12",
    has_audio: false,
    composite_score: 88,
    signal_scores: { clinical: 0.5, ai: 0.0, physics: 0.98, operational: 0.95, novelty: 0.6, confidence: 0.99 },
    romas_insight: "URGENT: Perform MLC QA immediately. Do not treat until leaf positioning confirmed within tolerance.",
    tags: ["Health Canada", "safety alert", "MLC", "Varian", "TrueBeam", "QA"],
    modality_tags: ["IMRT", "VMAT"],
    disease_site_tags: [],
    thumbnail_url: "/thumbnails/health-canada-mlc-safety-alert.jpg",
  },
  {
    slug: "sbrt-liver-metastases-phase-iii-results",
    title: "Phase III SABR-COMET-3 Trial: SBRT Improves Overall Survival in Oligometastatic Liver Disease",
    standfirst:
      "The Phase III SABR-COMET-3 trial reports that stereotactic ablative radiotherapy for oligometastatic liver disease significantly improves overall survival compared with systemic therapy alone, with a median OS of 41 months versus 28 months.",
    body: `The Phase III SABR-COMET-3 trial, published in the *New England Journal of Medicine*, reports that stereotactic ablative radiotherapy (SABR) for oligometastatic liver disease significantly improves overall survival compared with systemic therapy alone. The trial enrolled 312 patients with 1–5 liver metastases from colorectal, breast, or lung primary tumours.

At a median follow-up of 48 months, the SABR arm demonstrated a median overall survival of 41 months compared with 28 months in the systemic therapy alone arm (HR 0.62, 95% CI 0.48–0.80, p<0.001). The 3-year OS rate was 54% versus 38%. Grade ≥3 adverse events were similar between arms (18% SABR vs 16% systemic).

**ROMAS Insight:** SABR-COMET-3 provides the definitive Phase III evidence for SBRT in oligometastatic liver disease. This will likely change standard of care — practices should ensure they have the dosimetric expertise to treat liver SBRT safely.`,
    category: "clinical-rt",
    content_type: "paper_critique",
    region: "global",
    audience: ["physicians", "residents"],
    primary_source_url: "https://www.nejm.org/doi/10.1056/NEJMoa2601234",
    primary_source_type: "clinical_trial",
    published_at: "2026-05-11T07:00:00Z",
    issue_date: "2026-05-11",
    has_audio: true,
    composite_score: 95,
    signal_scores: { clinical: 0.98, ai: 0.0, physics: 0.5, operational: 0.8, novelty: 0.9, confidence: 0.95 },
    romas_insight: "Definitive Phase III evidence — practices should ensure dosimetric expertise for liver SBRT before adopting.",
    tags: ["SBRT", "liver", "oligometastatic", "SABR-COMET-3", "Phase III", "overall survival"],
    modality_tags: ["SBRT", "SABR"],
    disease_site_tags: ["liver"],
    thumbnail_url: "/thumbnails/sbrt-liver-metastases-phase-iii-results.jpg",
  },
  {
    slug: "future-rt-boron-neutron-capture-therapy",
    title: "Boron Neutron Capture Therapy Achieves First Regulatory Approval in South Korea for Recurrent Head and Neck Cancer",
    standfirst:
      "South Korea's Ministry of Food and Drug Safety has approved boron neutron capture therapy (BNCT) for recurrent head and neck cancer, making South Korea the third country after Japan and Finland to approve BNCT as a clinical treatment.",
    body: `South Korea's Ministry of Food and Drug Safety (MFDS) has approved boron neutron capture therapy (BNCT) for the treatment of recurrent head and neck cancer, making South Korea the third country after Japan and Finland to grant regulatory approval for BNCT as a clinical treatment modality.

The approval is based on a Phase II/III clinical trial conducted at Samsung Medical Centre and Asan Medical Centre, enrolling 87 patients with recurrent head and neck squamous cell carcinoma who had failed at least two prior lines of treatment including radiotherapy. The trial demonstrated an objective response rate of 58% and a median progression-free survival of 7.8 months.

**ROMAS Insight:** BNCT remains a highly specialised modality requiring accelerator-based neutron sources. The South Korean approval will accelerate interest in BNCT globally, but clinical implementation requires significant infrastructure investment.`,
    category: "future-rt",
    content_type: "news_brief",
    region: "apac",
    audience: ["physicians", "physicists", "residents"],
    primary_source_url: "https://www.mfds.go.kr/eng/brd/m_30/view.do?seq=78234",
    primary_source_type: "regulatory",
    published_at: "2026-05-10T07:00:00Z",
    issue_date: "2026-05-10",
    has_audio: false,
    composite_score: 81,
    signal_scores: { clinical: 0.7, ai: 0.0, physics: 0.8, operational: 0.4, novelty: 0.95, confidence: 0.88 },
    romas_insight: "BNCT requires significant infrastructure investment — not a near-term option for most centres.",
    tags: ["BNCT", "boron neutron capture", "South Korea", "head and neck", "regulatory approval"],
    modality_tags: ["BNCT"],
    disease_site_tags: ["head-neck"],
    thumbnail_url: "/thumbnails/future-rt-boron-neutron-capture-therapy.jpg",
  },
  {
    slug: "clinic-operations-rt-scheduling-ai",
    title: "AI-Driven RT Scheduling Reduces Patient Wait Time by 23% in Multi-Centre Study",
    standfirst:
      "A prospective multi-centre study of an AI-driven radiation therapy scheduling system demonstrates a 23% reduction in patient wait time from simulation to first treatment fraction, with no increase in planning errors.",
    body: `A prospective multi-centre study published in the *International Journal of Radiation Oncology, Biology, Physics* has demonstrated that an AI-driven radiation therapy scheduling system reduces patient wait time from simulation to first treatment fraction by 23%, from a mean of 12.4 days to 9.5 days, across six radiation oncology centres.

The AI scheduling system uses a constraint-satisfaction algorithm to optimise the allocation of simulation slots, planning workload, physics QA time, and treatment machine time. The system was trained on 3 years of historical scheduling data from the participating centres and validated prospectively on 1,247 consecutive patients.

**ROMAS Insight:** A 23% reduction in wait time is clinically meaningful — for high-priority cases, this could translate to earlier treatment initiation. Operations teams should evaluate AI scheduling tools as part of their workflow optimisation strategy.`,
    category: "operations",
    content_type: "paper_critique",
    region: "us",
    audience: ["physicians", "physicists", "dosimetrists", "therapists"],
    primary_source_url: "https://www.redjournal.org/article/S0360-3016(26)00678-9",
    primary_source_type: "research",
    published_at: "2026-05-09T07:00:00Z",
    issue_date: "2026-05-09",
    has_audio: false,
    composite_score: 75,
    signal_scores: { clinical: 0.4, ai: 0.7, physics: 0.2, operational: 0.95, novelty: 0.65, confidence: 0.88 },
    romas_insight: "Evaluate AI scheduling tools as part of workflow optimisation — 23% wait time reduction is clinically meaningful.",
    tags: ["operations", "scheduling", "AI", "workflow", "wait time"],
    modality_tags: [],
    disease_site_tags: [],
    thumbnail_url: "/thumbnails/clinic-operations-rt-scheduling-ai.jpg",
  },
  {
    slug: "latam-sbrt-access-brazil-sus",
    title: "Brazil SUS Approves SBRT Reimbursement for Prostate and Lung Cancer in Public Health System",
    standfirst:
      "Brazil's Unified Health System (SUS) has approved reimbursement for stereotactic body radiation therapy for prostate and lung cancer, marking the first SBRT reimbursement in the Brazilian public health system and expanding access to an estimated 45,000 patients annually.",
    body: `Brazil's Unified Health System (SUS — Sistema Único de Saúde) has approved reimbursement for stereotactic body radiation therapy (SBRT) for prostate cancer (T1-T2, Gleason ≤7) and early-stage lung cancer (T1-T2N0M0), marking the first SBRT reimbursement in the Brazilian public health system.

The approval, published in Portaria SAS/MS nº 1.456 on April 28, 2026, establishes reimbursement rates of R$4,200 (approximately USD $840) per SBRT course for prostate and R$3,800 (approximately USD $760) per course for lung. The Ministry of Health estimates this will expand SBRT access to approximately 45,000 patients annually across the 28 SUS-credentialed radiation therapy centres with SBRT capability.

**ROMAS Insight:** This is a landmark decision for SBRT access in Latin America. Brazilian RT centres should begin credentialing processes for SUS SBRT reimbursement immediately — the demand will be substantial.`,
    category: "reimbursement",
    content_type: "reimbursement_explainer",
    region: "latam",
    audience: ["physicians", "physicists"],
    primary_source_url: "https://bvsms.saude.gov.br/bvs/saudelegis/sas/2026/prt1456_28_04_2026.html",
    primary_source_type: "regulatory",
    published_at: "2026-05-08T07:00:00Z",
    issue_date: "2026-05-08",
    has_audio: false,
    composite_score: 80,
    signal_scores: { clinical: 0.5, ai: 0.0, physics: 0.3, operational: 0.9, novelty: 0.75, confidence: 0.92 },
    romas_insight: "Begin SUS SBRT credentialing immediately — demand will be substantial.",
    tags: ["Brazil", "SUS", "SBRT", "reimbursement", "LATAM", "access"],
    modality_tags: ["SBRT"],
    disease_site_tags: ["prostate", "lung"],
    thumbnail_url: "/thumbnails/latam-sbrt-access-brazil-sus.jpg",
  },
  {
    slug: "mena-africa-linac-access-iaea",
    title: "IAEA Report: 60% of MENA-Africa Countries Have Fewer Than 1 Linac Per Million Population",
    standfirst:
      "A new IAEA report on radiation therapy infrastructure in the MENA-Africa region reveals that 60% of countries have fewer than 1 linear accelerator per million population, far below the recommended 3–4 per million.",
    body: `A new report from the International Atomic Energy Agency (IAEA) on radiation therapy infrastructure in the Middle East, North Africa, and sub-Saharan Africa region reveals a severe shortage of radiation therapy capacity, with 60% of countries in the region having fewer than 1 linear accelerator per million population — far below the IAEA-recommended minimum of 3–4 linacs per million.

The report, based on data from 47 countries in the MENA-Africa region, identifies Egypt, Morocco, South Africa, and Saudi Arabia as the countries with the highest absolute RT capacity, while 18 countries have no operational linac at all. The report estimates that the region needs an additional 1,200 linacs to meet current cancer treatment demand.

**ROMAS Insight:** The IAEA report quantifies the scale of the RT access crisis in MENA-Africa. For RT professionals in the region, this data provides the evidence base for national health ministry advocacy for RT infrastructure investment.`,
    category: "operations",
    content_type: "news_brief",
    region: "mena-africa",
    audience: ["physicians", "physicists"],
    primary_source_url: "https://www.iaea.org/publications/15234/radiation-therapy-infrastructure-mena-africa-2026",
    primary_source_type: "research",
    published_at: "2026-05-07T07:00:00Z",
    issue_date: "2026-05-07",
    has_audio: false,
    composite_score: 72,
    signal_scores: { clinical: 0.3, ai: 0.0, physics: 0.2, operational: 0.85, novelty: 0.7, confidence: 0.92 },
    romas_insight: "Use IAEA data as evidence base for national health ministry advocacy for RT infrastructure investment.",
    tags: ["IAEA", "MENA", "Africa", "access", "infrastructure", "linac"],
    modality_tags: [],
    disease_site_tags: [],
    thumbnail_url: "/thumbnails/mena-africa-linac-access-iaea.jpg",
  },
  {
    slug: "varian-ethos-adaptive-rt-workflow-update",
    title: "Varian Ethos Adaptive RT System Receives FDA Clearance for Automated Contour Propagation",
    standfirst:
      "Varian has received FDA 510(k) clearance for an automated contour propagation module for the Ethos adaptive radiation therapy system, enabling fully automated daily adaptive workflows without manual contour editing for prostate and cervical cancer.",
    body: `Varian has received FDA 510(k) clearance (K263012) for an automated contour propagation module for the Ethos adaptive radiation therapy system. The cleared module enables fully automated daily adaptive workflows without manual contour editing for prostate and cervical cancer, using a deep learning algorithm trained on 15,000 adaptive RT fractions.

The automated contour propagation module achieves a mean DSC of 0.91 for prostate and 0.88 for cervical cancer OARs, meeting the pre-specified clinical equivalence threshold of DSC ≥0.85. In a prospective validation study, the module reduced mean online adaptation time from 12.3 minutes to 6.8 minutes for prostate SBRT.

**ROMAS Insight:** Fully automated adaptive workflows without manual contour editing represent a significant operational advance. Physics teams should establish a QA sampling protocol to verify automated contour quality before removing manual review from the clinical workflow.`,
    category: "vendor",
    content_type: "fda_brief",
    region: "us",
    audience: ["physicists", "dosimetrists"],
    primary_source_url: "https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm?ID=K263012",
    primary_source_type: "fda_510k",
    published_at: "2026-05-06T07:00:00Z",
    issue_date: "2026-05-06",
    has_audio: false,
    composite_score: 82,
    signal_scores: { clinical: 0.5, ai: 0.9, physics: 0.85, operational: 0.9, novelty: 0.7, confidence: 0.95 },
    romas_insight: "Establish QA sampling protocol before removing manual contour review from the clinical workflow.",
    tags: ["Varian", "Ethos", "adaptive RT", "FDA clearance", "auto-contouring"],
    modality_tags: ["adaptive", "IMRT"],
    disease_site_tags: ["prostate", "cervix"],
    thumbnail_url: "/thumbnails/varian-ethos-adaptive-rt-workflow-update.jpg",
  },
  {
    slug: "romas-read-week-in-receipts-may-2026",
    title: "The ROMAS Read: Week in Receipts — What the Evidence Settled and What It Opened",
    standfirst:
      "This week's ROMAS Read reviews the five most consequential findings from the past seven days in radiation oncology: SABR-COMET-3, FLASH Phase II, ASTRO MR-Linac guideline, AAPM TG-302, and the Brainlab Elements 4.0 validation data.",
    body: `Welcome to this week's ROMAS Read: Week in Receipts — our Friday synthesis of what the evidence settled, what it opened, and what we got wrong.

**What the evidence settled this week:**

*SABR-COMET-3* closes the debate on SBRT for oligometastatic liver disease. The Phase III data is unambiguous: SBRT improves overall survival. The question is no longer "should we treat?" but "which patients, which fractionation, and who has the dosimetric expertise?"

*FLASH Phase II* is the most significant advance in therapeutic ratio since IMRT. The 40% toxicity reduction in NSCLC is a landmark result. But the physics implementation requirements are substantial — this is not a software update.

**What it opened:**

*AAPM TG-302* updates small-field correction factors that have been in use for a decade. The changes for the CC01 and Edge detector are not trivial. Every SRS/SBRT programme needs to re-examine their small-field dosimetry chain.

**ROMAS Insight:** The week's evidence points in one direction: the therapeutic ratio in radiation oncology is improving faster than our ability to implement the changes safely. The bottleneck is now physics and dosimetry capacity, not clinical evidence.`,
    category: "clinical-rt",
    content_type: "long_take",
    region: "global",
    audience: ["physicians", "physicists", "residents"],
    primary_source_url: "https://romasbrief.com/issues/2026-05-28",
    primary_source_type: "editorial",
    published_at: "2026-05-28T07:00:00Z",
    issue_date: "2026-05-28",
    has_audio: true,
    composite_score: 88,
    signal_scores: { clinical: 0.8, ai: 0.3, physics: 0.7, operational: 0.7, novelty: 0.6, confidence: 0.9 },
    romas_insight: "The bottleneck is now physics and dosimetry capacity, not clinical evidence.",
    tags: ["ROMAS Read", "Friday", "synthesis", "weekly", "editorial"],
    modality_tags: [],
    disease_site_tags: [],
    thumbnail_url: "/thumbnails/romas-read-week-in-receipts-may-2026.jpg",
  },
];

// ── Helper functions ──────────────────────────────────────────────────────────

export function getArticleBySlug(slug: string): MockArticle | undefined {
  return MOCK_ARTICLES.find((a) => a.slug === slug);
}

export function getArticlesByCategory(category: Category, limit = 20): MockArticle[] {
  return MOCK_ARTICLES.filter((a) => a.category === category)
    .sort((a, b) => b.composite_score - a.composite_score)
    .slice(0, limit);
}

export function getArticlesByRegion(region: Region, limit = 20): MockArticle[] {
  return MOCK_ARTICLES.filter((a) => a.region === region || a.region === "global")
    .sort((a, b) => b.composite_score - a.composite_score)
    .slice(0, limit);
}

export function getArticlesByAudience(audience: Audience, limit = 20): MockArticle[] {
  return MOCK_ARTICLES.filter((a) => a.audience.includes(audience))
    .sort((a, b) => b.composite_score - a.composite_score)
    .slice(0, limit);
}

export function getArticlesByContentType(contentType: ContentType, limit = 20): MockArticle[] {
  return MOCK_ARTICLES.filter((a) => a.content_type === contentType)
    .sort((a, b) => b.composite_score - a.composite_score)
    .slice(0, limit);
}

export function getArticlesByIssueDate(issueDate: string): MockArticle[] {
  return MOCK_ARTICLES.filter((a) => a.issue_date === issueDate)
    .sort((a, b) => b.composite_score - a.composite_score);
}

export function getTopStories(limit = 6): MockArticle[] {
  return [...MOCK_ARTICLES]
    .sort((a, b) => b.composite_score - a.composite_score)
    .slice(0, limit);
}

export function getAudioArticles(limit = 20): MockArticle[] {
  return MOCK_ARTICLES.filter((a) => a.has_audio)
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .slice(0, limit);
}

export function getTrendingArticles(limit = 5): MockArticle[] {
  // Simulate trending by recency + score
  return [...MOCK_ARTICLES]
    .sort((a, b) => {
      const recencyA = new Date(a.published_at).getTime();
      const recencyB = new Date(b.published_at).getTime();
      return (recencyB * 0.4 + b.composite_score * 0.6) - (recencyA * 0.4 + a.composite_score * 0.6);
    })
    .slice(0, limit);
}

export function getPaperOfTheDay(): MockArticle {
  // Highest composite score paper-type article
  return MOCK_ARTICLES.filter((a) =>
    a.content_type === "paper_critique" || a.content_type === "practice_delta"
  ).sort((a, b) => b.composite_score - a.composite_score)[0]!;
}

export function getQuickHits(limit = 5): MockArticle[] {
  return MOCK_ARTICLES.filter((a) => a.content_type === "news_brief")
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .slice(0, limit);
}

export function getIndustryMoves(limit = 3): MockArticle[] {
  return MOCK_ARTICLES.filter((a) =>
    a.content_type === "vendor_intel" || a.category === "vendor"
  ).sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .slice(0, limit);
}

export function getTopPapersThisWeek(limit = 5): MockArticle[] {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return MOCK_ARTICLES.filter((a) =>
    new Date(a.published_at) >= oneWeekAgo &&
    (a.content_type === "paper_critique" || a.content_type === "practice_delta")
  ).sort((a, b) => b.composite_score - a.composite_score)
    .slice(0, limit);
}

export function getTodaysPodcast(): MockArticle | undefined {
  return MOCK_ARTICLES.filter((a) => a.has_audio && a.content_type === "long_take")[0] ??
    MOCK_ARTICLES.filter((a) => a.has_audio)[0];
}

export const CATEGORY_META: Record<Category, { label: string; description: string; color: string }> = {
  "ai": { label: "AI & Machine Learning", description: "Artificial intelligence, auto-contouring, treatment planning automation, and outcome prediction in radiation oncology.", color: "bg-pink-100 text-pink-700" },
  "physics": { label: "Medical Physics", description: "Dosimetry, QA protocols, treatment delivery, and physics research in radiation therapy.", color: "bg-indigo-100 text-indigo-700" },
  "clinical-rt": { label: "Clinical RT", description: "Clinical trials, treatment outcomes, fractionation, and evidence-based practice in radiation oncology.", color: "bg-violet-100 text-violet-700" },
  "regulatory": { label: "Regulatory", description: "FDA, EMA, MHRA, PMDA, and other regulatory decisions affecting radiation therapy devices and software.", color: "bg-red-100 text-red-700" },
  "guidelines": { label: "Guidelines", description: "ASTRO, ESTRO, AAPM, and other society guidelines and consensus statements.", color: "bg-emerald-100 text-emerald-700" },
  "reimbursement": { label: "Reimbursement", description: "CMS, NICE, and international reimbursement policy for radiation therapy procedures.", color: "bg-amber-100 text-amber-700" },
  "vendor": { label: "Vendor Intelligence", description: "New products, software updates, regulatory clearances, and strategic moves from RT technology vendors.", color: "bg-blue-100 text-blue-700" },
  "conferences": { label: "Conferences", description: "ASTRO, ESTRO, AAPM, JASTRO, and other major radiation oncology conference coverage.", color: "bg-orange-100 text-orange-700" },
  "resident-education": { label: "Resident Education", description: "Practical guides, primers, and educational content for radiation oncology residents and trainees.", color: "bg-teal-100 text-teal-700" },
  "future-rt": { label: "Future RT", description: "Emerging modalities, early-phase research, and next-generation radiation therapy technologies.", color: "bg-purple-100 text-purple-700" },
  "operations": { label: "Operations", description: "Workflow, scheduling, staffing, and operational management of radiation therapy departments.", color: "bg-neutral-100 text-neutral-700" },
};

export const REGION_META: Record<Region, { label: string; description: string; flag: string }> = {
  "us": { label: "United States", description: "US FDA clearances, CMS reimbursement, ASTRO guidelines, and clinical trials from American centres.", flag: "🇺🇸" },
  "europe": { label: "Europe", description: "EMA, EUDAMED, ESTRO, and clinical research from European radiation oncology centres.", flag: "🇪🇺" },
  "uk": { label: "United Kingdom", description: "MHRA, NHS, RCR, and clinical developments from UK radiation oncology.", flag: "🇬🇧" },
  "apac": { label: "Asia-Pacific", description: "PMDA, TGA, RANZCR, and clinical intelligence from Asia-Pacific radiation oncology.", flag: "🌏" },
  "canada": { label: "Canada", description: "Health Canada, CADTH, and clinical developments from Canadian radiation oncology centres.", flag: "🇨🇦" },
  "latam": { label: "Latin America", description: "ANVISA, SBR, ALATRO, and radiation oncology developments across Latin America.", flag: "🌎" },
  "mena-africa": { label: "MENA & Africa", description: "Radiation oncology access, infrastructure, and clinical developments across the Middle East, North Africa, and sub-Saharan Africa.", flag: "🌍" },
  "global": { label: "Global", description: "International studies, multi-centre trials, and global radiation oncology intelligence.", flag: "🌐" },
};

export const AUDIENCE_META: Record<Audience, { label: string; description: string; icon: string }> = {
  "physicians": { label: "Radiation Oncologists", description: "Clinical intelligence for practicing radiation oncologists — trial results, treatment guidelines, and practice-changing evidence.", icon: "👨‍⚕️" },
  "physicists": { label: "Medical Physicists", description: "Physics-focused briefings covering dosimetry, QA protocols, commissioning, and physics research.", icon: "⚛️" },
  "dosimetrists": { label: "Dosimetrists", description: "Treatment planning, dose calculation, workflow updates, and dosimetry-relevant clinical evidence.", icon: "📐" },
  "therapists": { label: "RT Therapists", description: "Workflow updates, treatment delivery, patient care, and operational developments for radiation therapists.", icon: "🏥" },
  "residents": { label: "Residents & Trainees", description: "Educational content, primers, journal club material, and career-relevant intelligence for radiation oncology residents.", icon: "🎓" },
};

export const CONTENT_TYPE_META: Record<ContentType, { label: string; description: string; color: string }> = {
  "news_brief": { label: "News Brief", description: "Breaking news and regulatory decisions in radiation oncology.", color: "bg-blue-50 text-blue-700 border-blue-200" },
  "paper_critique": { label: "Paper Critique", description: "In-depth analysis of significant research publications with ROMAS Take.", color: "bg-violet-50 text-violet-700 border-violet-200" },
  "practice_delta": { label: "Practice Delta", description: "Evidence or guidance that changes clinical or physics practice.", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "fda_brief": { label: "FDA Brief", description: "510(k) clearances, De Novo decisions, and FDA regulatory actions.", color: "bg-red-50 text-red-700 border-red-200" },
  "reimbursement_explainer": { label: "Reimbursement", description: "CMS, NICE, and international reimbursement policy explained.", color: "bg-amber-50 text-amber-700 border-amber-200" },
  "vendor_intel": { label: "Vendor Intel", description: "New products, software updates, and strategic moves from RT vendors.", color: "bg-neutral-50 text-neutral-700 border-neutral-200" },
  "long_take": { label: "Long Take", description: "Deep-dive analysis and the Friday ROMAS Read.", color: "bg-teal-50 text-teal-700 border-teal-200" },
  "primer": { label: "Primer", description: "Educational explainers for residents and those new to a topic.", color: "bg-pink-50 text-pink-700 border-pink-200" },
};

export const ISSUE_DATES = [
  "2026-05-28",
  "2026-05-27",
  "2026-05-26",
  "2026-05-25",
  "2026-05-24",
  "2026-05-23",
  "2026-05-22",
  "2026-05-21",
  "2026-05-20",
  "2026-05-19",
];
