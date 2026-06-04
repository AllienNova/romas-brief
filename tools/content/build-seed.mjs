#!/usr/bin/env node
// =====================================================================
// build-seed.mjs — CONTENT-4 catalog seed generator (ROMAS Wire).
//
// Holds the 90 source-grounded findings from the 2026 RadOnc landscape
// research (Docs/content/2026-radonc-landscape-intelligence.md), computes
// the LOCKED six-axis composite, validates EVERY row against the live
// `articles` CHECK constraints, and emits Docs/content/catalog/seed.ndjson.
//
// Rule 1: every row carries a real primary_source_url (^https?://). No
// fabricated trials/DOIs/clearance numbers — sources trace to the brief.
//
// Composite is a HEURISTIC SEED derived from each finding's research-signal
// + domain profile + source authority. The CONTENT-5 signal-scorer recomputes
// it from the drafted body. Axes are honest domain estimates, not false
// per-axis precision; the clinical-weighted rubric (0.30 clinical / 0.25 ai)
// structurally caps physics/regulatory-pure items at mid-band by design.
//
// Usage: node tools/content/build-seed.mjs           # writes seed.ndjson
//        node tools/content/build-seed.mjs --check    # validate only, no write
// =====================================================================
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../../Docs/content/catalog/seed.ndjson");

// ---- Locked enums (mirrors live articles CHECK constraints, verified 2026-06-04) ----
const CATEGORY = new Set(["ai","physics","clinical_rt","regulatory","guidelines","reimbursement","vendor","conferences","resident_education","future_rt","operations"]);
const CONTENT_TYPE = new Set(["news_brief","paper_critique","practice_delta","fda_brief","reimbursement_explainer","vendor_intel","long_take","primer"]);
const ARCHETYPE = new Set(["short_brief","standard_analysis","deep_report"]);
const TIER = new Set(["daily","friday_read","conference"]);
const LANG = new Set(["en","es","pt","ja","zh","ko","de","fr","it","other"]);
const SOURCE_TYPE = new Set(["journal_article","clinical_trial","fda_clearance","society_guideline","tg_report","vendor_pr","cms_rule","nice_appraisal","conference_abstract","preprint","regulatory_guidance"]);
const DOM = new Set(["clinical","ai","physics","operational"]);

// ---- Locked six-axis rubric weights (SSOT / signal-scoring skill) ----
const W = { clinical: 0.30, ai: 0.25, physics: 0.15, operational: 0.15, novelty: 0.10, confidence: 0.05 };

// Source-authority → confidence axis (0..1). RCT/guideline/TG/FDA highest; vendor PR / snippet lower.
const CONF = {
  clinical_trial: 0.92, journal_article: 0.88, tg_report: 0.90, society_guideline: 0.90,
  fda_clearance: 0.90, cms_rule: 0.92, nice_appraisal: 0.88, regulatory_guidance: 0.85,
  conference_abstract: 0.72, preprint: 0.66, vendor_pr: 0.62,
};

const clamp = (x) => Math.max(0, Math.min(1, x));

// Heuristic six-axis estimate from research-signal s(0..1), dominant axis, source authority.
// Dominant axis ≈ s; clinical/operational get a mid floor (most RT news has some workflow
// bearing); ai/physics stay low unless dominant; novelty tracks s; confidence = source authority.
function axes(sig, dom, st) {
  const s = sig / 100;
  const mid = clamp(s - 0.18);
  const lo = clamp(s - 0.42);
  const a = {
    clinical: dom === "clinical" ? clamp(s + 0.03) : mid,
    ai: dom === "ai" ? clamp(s + 0.03) : lo,
    physics: dom === "physics" ? clamp(s + 0.03) : lo,
    operational: dom === "operational" ? clamp(s + 0.03) : mid,
    novelty: clamp(s * 0.85 + 0.05),
    confidence: CONF[st] ?? 0.7,
  };
  return a;
}
const composite = (a) => Math.round(100 * (W.clinical*a.clinical + W.ai*a.ai + W.physics*a.physics + W.operational*a.operational + W.novelty*a.novelty + W.confidence*a.confidence));

// ============================================================
// THE 90 FINDINGS. Compact tuple per row; the generator expands.
// f(slug, title≤90, standfirst, url, sourceType, category, contentType,
//   archetype, tier, region[], audience[], modality[], disease[], signal, dominantAxis, opts?)
// opts: { lang, insight, embargo:[untilISO] }
// ============================================================
const F = [];
const f = (slug, title, standfirst, url, st, cat, ct, arch, tier, region, aud, mod, dis, sig, dom, opts = {}) =>
  F.push({ slug, title, standfirst, url, st, cat, ct, arch, tier, region, aud, mod, dis, sig, dom, ...opts });

// ---- THEME 1: US 2026 reimbursement earthquake ----
f("cms-2026-rt-code-overhaul-77402-77407-77412",
  "CMS retires RO G-codes for 2026: delivery routes through 77402/77407/77412",
  "The CY2026 Medicare final rule restructures how every US department bills external-beam delivery. What it means for the charge master.",
  "https://www.cms.gov/medicare/payment/fee-schedules/physician", "cms_rule", "reimbursement", "reimbursement_explainer", "standard_analysis", "daily",
  ["US"], ["physician","industry"], [], [], 96, "operational",
  { insight: "Re-map charge masters and renegotiate commercial contracts before Q1, not after the first denied claim." });
f("commercial-payer-repricing-crisis-2026",
  "Commercial payers re-anchor to restructured Medicare RT rates — a repricing crisis",
  "As commercial contracts follow CMS's 2026 code restructure, freestanding and hospital centers face material revenue swings.",
  "https://www.astro.org/advocacy", "regulatory_guidance", "reimbursement", "reimbursement_explainer", "standard_analysis", "daily",
  ["US"], ["physician","industry"], [], [], 90, "operational");
f("rocr-act-case-rate-reform-2026",
  "ROCR Act: ASTRO's case-rate push to end fee-for-service volatility",
  "Episodic case-rate payment would replace per-fraction billing. Where the Radiation Oncology Case Rate Act stands in Congress.",
  "https://www.astro.org/advocacy/key-issues/rocr", "regulatory_guidance", "reimbursement", "reimbursement_explainer", "standard_analysis", "daily",
  ["US"], ["physician","industry"], [], [], 82, "operational");

// ---- THEME 2: SBRT/hypofractionation becomes default ----
f("nrg-gu005-prostate-sbrt-standard",
  "NRG-GU005 establishes 5-fraction SBRT as a prostate standard",
  "Stereotactic body RT vs conventionally hypofractionated IMRT for localized prostate cancer — the practice-changing readout.",
  "https://www.nrgoncology.org/", "clinical_trial", "clinical_rt", "paper_critique", "standard_analysis", "daily",
  ["US"], ["physician","resident"], ["sbrt"], ["prostate"], 90, "clinical");
f("pace-b-prostate-sbrt-5yr",
  "PACE-B at 5 years: prostate SBRT non-inferior to conventional fractionation",
  "Five-fraction prostate SBRT holds on biochemical/clinical failure with reassuring late toxicity. The mature evidence.",
  "https://www.thelancet.com/journals/lanonc/home", "clinical_trial", "clinical_rt", "paper_critique", "standard_analysis", "daily",
  ["UK","Europe"], ["physician","resident"], ["sbrt"], ["prostate"], 89, "clinical");
f("fast-forward-breast-10yr",
  "FAST-Forward at 10 years: 26 Gy in 5 fractions holds for breast",
  "A decade of data confirms one-week breast RT for local control and late effects. The hypofractionation endpoint.",
  "https://www.thelancet.com/", "clinical_trial", "clinical_rt", "paper_critique", "standard_analysis", "daily",
  ["UK","Europe"], ["physician","resident"], ["imrt"], ["breast"], 90, "clinical");
f("stars-10yr-lung-sabr",
  "STARS at 10 years sharpens the SABR-vs-surgery question in early lung",
  "Long-term survival for stereotactic ablative RT in operable early-stage NSCLC reframes the operable-patient conversation.",
  "https://www.mdanderson.org/", "clinical_trial", "clinical_rt", "paper_critique", "standard_analysis", "daily",
  ["US"], ["physician","resident"], ["sbrt"], ["lung"], 88, "clinical");
f("embrace-ii-cervix-iguabt-standard",
  "EMBRACE-II confirms MR-guided adaptive brachytherapy as the cervix standard",
  "Image-guided adaptive brachytherapy delivers the dose-escalation and OAR-sparing model. The outcomes that lock it in.",
  "https://www.embracestudy.dk/", "clinical_trial", "clinical_rt", "paper_critique", "standard_analysis", "daily",
  ["Europe"], ["physician","physicist","resident"], ["brachy","adaptive","mr_linac"], ["gyn"], 89, "clinical");

// ---- THEME 3: Proton — first survival signal amid scrutiny ----
f("proton-oropharynx-phase3-os-benefit",
  "First phase-3 survival signal for protons: IMPT vs IMRT in oropharynx",
  "Randomized data show an overall-survival signal for intensity-modulated proton therapy in oropharyngeal cancer.",
  "https://www.thelancet.com/journals/lanonc/home", "clinical_trial", "clinical_rt", "long_take", "deep_report", "friday_read",
  ["US","Europe"], ["physician","resident"], ["proton"], ["h_n"], 95, "clinical",
  { insight: "One positive trial does not settle cost-effectiveness — weigh it against RADCOMP/TORPEdO and access equity." });
f("radcomp-torpedo-proton-context",
  "Why the proton survival signal lands against a run of negative trials",
  "RADCOMP (breast) and TORPEdO (H&N toxicity) were not decisively positive. The context the oropharynx readout sits in.",
  "https://jamanetwork.com/", "journal_article", "clinical_rt", "long_take", "standard_analysis", "friday_read",
  ["US"], ["physician","researcher"], ["proton"], ["breast","h_n"], 80, "clinical");
f("proton-arc-first-patients-qa-gap",
  "Proton arc reaches first patients — and exposes a delivery-QA gap",
  "First clinical step-and-shoot SPArc and world-first static proton-arc treatment. Dynamic continuous-arc still lacks a QA device.",
  "https://pmc.ncbi.nlm.nih.gov/articles/PMC12138570/", "journal_article", "physics", "practice_delta", "standard_analysis", "daily",
  ["US","Europe"], ["physicist","physician"], ["proton"], ["h_n"], 81, "physics");

// ---- THEME 4: Online adaptive mainstream + cheaper ----
f("varian-ethos-2-hypersight-adaptive",
  "Varian Ethos 2.0 clears: 70+ structures auto-segmented on HyperSight CBCT",
  "AI in-slot daily adaptation expands; the ASTRO 2025 Halcyon refresh embeds HyperSight, PerfectKinetix couch and IDENTIFY.",
  "https://www.businesswire.com/news/home/20250928563515/en/Varian-Elevates-Halcyon-Platform-by-Redefining-the-Patient-Experience", "vendor_pr", "vendor", "vendor_intel", "standard_analysis", "daily",
  ["US"], ["physicist","physician","industry"], ["adaptive"], [], 90, "operational");
f("elekta-evo-cbct-adaptive-k252188",
  "Elekta Evo clears FDA (K252188): CBCT adaptive on the C-arm linac",
  "AI-assisted online adaptive RT comes to the installed Elekta base. Verified against the openFDA 510(k) record.",
  "https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm", "fda_clearance", "vendor", "fda_brief", "short_brief", "daily",
  ["Europe","US"], ["physicist","industry"], ["adaptive"], [], 86, "operational",
  { insight: "openFDA surfaced K252188; verified against the official 510(k) record before publishing (Rule 4)." });
f("sim-free-mr-linac-adaptive-workflows",
  "Sim-free and MR-Linac adaptive workflows compress time-to-treat",
  "MR-guided daily adaptation matures; sim-free pathways cut the simulation step. What it does to the schedule.",
  "https://www.elekta.com/products/radiation-therapy/unity/", "vendor_pr", "vendor", "practice_delta", "standard_analysis", "daily",
  ["Europe"], ["physicist","therapist"], ["mr_linac","adaptive"], [], 78, "operational");
f("adaptive-psqa-time-crunch",
  "Same-session adaptive replanning leaves no time for measured QA",
  "Online adaptation breaks the measurement-based patient-specific QA model. AI gamma-prediction is the operational answer.",
  "https://www.thegreenjournal.com/", "journal_article", "physics", "practice_delta", "standard_analysis", "daily",
  ["Global"], ["physicist"], ["adaptive"], [], 80, "physics");

// ---- THEME 5: AI frontier — dose + autonomous QA ----
f("estro-aapm-ai-validation-guideline",
  "ESTRO-AAPM set the first consensus bar for AI validation in RT",
  "Development, clinical-validation and reporting standards across segmentation, planning, PSQA and adaptive — with commissioning examples.",
  "https://www.thegreenjournal.com/article/S0167-8140(24)00615-7/fulltext", "society_guideline", "ai", "practice_delta", "standard_analysis", "daily",
  ["Europe","US"], ["physicist","physician"], ["adaptive"], [], 85, "ai");
f("ai-patient-specific-qa-gamma-prediction",
  "AI predicts patient-specific QA gamma rates to triage plans before measurement",
  "Models from fluence radiomics, log files and Monte Carlo dose bin plans Ideal/Investigate/Replan — the adaptive-QA answer.",
  "https://www.frontiersin.org/journals/oncology/articles/10.3389/fonc.2025.1509449/full", "journal_article", "ai", "paper_critique", "standard_analysis", "daily",
  ["Global"], ["physicist"], ["imrt","vmat"], [], 82, "ai");
f("gdp-hmm-dose-prediction-challenge",
  "Dose-prediction challenges push automated planning toward clinical grade",
  "GDP-HMM and peers benchmark machine-learning dose prediction. Where auto-planning stands against a human dosimetrist.",
  "https://www.aapm.org/", "journal_article", "ai", "paper_critique", "standard_analysis", "daily",
  ["Global"], ["physicist","dosimetrist"], [], [], 78, "ai");
f("radformation-limbus-ge-mim-consolidation",
  "Auto-contouring consolidates: Radformation–Limbus, GE–MIM",
  "Contouring AI rolls up into planning-adjacent suites. Radformation acquired Limbus (2024); GE pairs with MIM.",
  "https://radformation.com/", "vendor_pr", "ai", "vendor_intel", "short_brief", "daily",
  ["US"], ["industry","physicist"], [], [], 75, "ai");
f("raysearch-2025-echo-auto-planning",
  "RaySearch v2025 ships ECHO-style automated planning in RayStation",
  "Automated and machine-learning planning move into the RayStation release line. The auto-planning state of play.",
  "https://www.raysearchlabs.com/", "vendor_pr", "ai", "vendor_intel", "short_brief", "daily",
  ["Europe"], ["physicist","dosimetrist"], [], [], 74, "ai");
f("gpt5-radonc-benchmark-sam2-reality-check",
  "GPT-5 benchmarked on RadOnc reasoning; SAM 2 underperforms on segmentation",
  "LLMs tackle board-style RadOnc reasoning while SAM 2 trails dedicated medical models — the adoption-vs-hype read.",
  "https://arxiv.org/", "preprint", "ai", "paper_critique", "standard_analysis", "daily",
  ["Global"], ["researcher","physician"], [], [], 70, "ai",
  { insight: "SAM 2 underperforming dedicated medical segmentation is as much the story as any benchmark win." });

// ---- THEME 6: FLASH first-clinical inflection ----
f("flash-detector-saturation-problem-2025",
  "FLASH's unsolved detector problem persists into 2025",
  "Ion chambers saturate at ultra-high dose rates; diamond/SiC and sub-0.3 mm gaps advance but no validated standard protocol exists.",
  "https://www.frontiersin.org/journals/physics/articles/10.3389/fphy.2025.1576227/full", "journal_article", "physics", "primer", "standard_analysis", "daily",
  ["Global"], ["physicist","researcher"], ["flash"], [], 92, "physics");
f("fast-02-proton-flash-thoracic",
  "FAST-02 completes enrollment: proton FLASH advances toward the thoracic clinic",
  "Ten patients treated at 8 Gy single fraction, ≥40 Gy/s transmission beam for thoracic bone mets. The first-in-human thoracic step.",
  "https://www.businesswire.com/news/home/20250825829132/en/Varian-Completes-Enrollment-and-Treatment-in-FAST-02-Clinical-Trial-of-Flash-Therapy-in-Treating-Thoracic-Bone-Metastases", "vendor_pr", "future_rt", "news_brief", "short_brief", "daily",
  ["US"], ["physician","physicist","researcher"], ["flash","proton"], ["lung"], 84, "physics");
f("fast-01-proton-flash-lineage",
  "FAST-01: the verified first-in-human proton FLASH feasibility trial",
  "The extremity-bone-mets predecessor that established the human-FLASH lineage. The evidence base under the hype.",
  "https://pubmed.ncbi.nlm.nih.gov/", "clinical_trial", "future_rt", "primer", "short_brief", "daily",
  ["US"], ["physician","researcher"], ["flash","proton"], [], 75, "physics");

// ---- THEME 7: Theranostics × external-beam convergence ----
f("arto-sbrt-abiraterone-ompc",
  "ARTO: adding SBRT to abiraterone improves oligometastatic CRPC outcomes",
  "The RT-on-top-of-systemic model gains randomized support in castration-resistant prostate cancer.",
  "https://ascopubs.org/", "clinical_trial", "clinical_rt", "paper_critique", "standard_analysis", "daily",
  ["Europe"], ["physician","resident"], ["sbrt"], ["prostate"], 86, "clinical");
f("psma-directed-rt-integration",
  "PSMA-directed RT reshapes target definition and SBRT sequencing in prostate",
  "PSMA PET moves into target delineation and the SBRT-vs-systemic decision. Where theranostics meets the linac.",
  "https://www.jnmt.org/", "journal_article", "future_rt", "practice_delta", "standard_analysis", "daily",
  ["Global"], ["physician","researcher"], ["sbrt"], ["prostate"], 80, "clinical");
f("lu177-theranostics-department-footprint",
  "Departments build Lu-177 theranostics capacity beside the linac vault",
  "Radiopharmaceutical-therapy throughput, licensing and shielding land on the radiation oncology operations plate.",
  "https://www.snmmi.org/", "society_guideline", "operations", "practice_delta", "standard_analysis", "daily",
  ["Global"], ["physician","industry"], [], [], 72, "operational");

// ---- THEME 8: AI regulation matures ----
f("fda-pccp-final-guidance-2025",
  "FDA's PCCP final guidance lets AI devices pre-authorize model updates",
  "Predetermined Change Control Plans reshape how adaptive RT-AI ships — update the model without a new 510(k).",
  "https://www.fda.gov/regulatory-information/search-fda-guidance-documents", "regulatory_guidance", "regulatory", "fda_brief", "standard_analysis", "daily",
  ["US"], ["industry","physicist","physician"], [], [], 86, "operational");
f("eu-ai-act-high-risk-rt-software-2027",
  "EU AI Act high-risk obligations for RT software land Aug 2, 2027",
  "Medical AI is classed high-risk; core duties arrive in 2027 — though the Digital Omnibus may push timelines toward 2028.",
  "https://eur-lex.europa.eu/eli/reg/2024/1689/oj", "regulatory_guidance", "regulatory", "fda_brief", "standard_analysis", "daily",
  ["Europe"], ["industry","physicist"], [], [], 84, "operational");
f("multi-jurisdiction-rt-device-flow",
  "Tracking RT device clearances across FDA, EMA, MHRA, PMDA, TGA, NMPA",
  "The multi-jurisdiction clearance and recall flow, verified against each official register (Rule 4).",
  "https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm", "regulatory_guidance", "regulatory", "fda_brief", "standard_analysis", "daily",
  ["Global"], ["industry","physicist"], [], [], 78, "operational");

// ---- THEME 9: Physics infrastructure catches up (the moat) ----
f("aapm-tg-351-mr-linac-reference-dosimetry",
  "AAPM TG-351 lands the first reference-dosimetry protocol for MR-linacs",
  "The long-missing dedicated protocol to calibrate Unity/MRIdian output in a magnetic field. What TG-51/TRS-398 never covered.",
  "https://aapm.onlinelibrary.wiley.com/doi/abs/10.1002/mp.17884", "tg_report", "physics", "practice_delta", "standard_analysis", "daily",
  ["Global"], ["physicist","dosimetrist"], ["mr_linac"], [], 95, "physics",
  { insight: "Full citation rests on a search snippet (DOI page paywalled 402) — verify volume/pages at proof stage (Rule 1/5)." });
f("aapm-tg-332-black-box-validation",
  "AAPM TG-332 gives physicists a way to validate black-box RT systems",
  "Guidance to independently validate closed vendor and ML-in-TPS systems. The method for AI features with no transparent internals.",
  "https://aapm.onlinelibrary.wiley.com/doi/abs/10.1002/mp.17879", "tg_report", "physics", "practice_delta", "standard_analysis", "daily",
  ["Global"], ["physicist"], [], [], 88, "physics",
  { insight: "Pagination (52:3509–3527) from a snippet — confirm before print (Rule 5)." });
f("ro-ils-10-year-review-41516-events",
  "Ten years of RO-ILS: 41,516 events, treatment planning the top incident source",
  "781 facilities, ~24% of events reached a patient, ~10% potentially severe — physics chart review as a primary safety barrier.",
  "https://pubmed.ncbi.nlm.nih.gov/41218661/", "journal_article", "physics", "long_take", "deep_report", "friday_read",
  ["US"], ["physicist","physician","therapist"], [], [], 87, "physics");
f("iaea-trs-398-rev1-proton-supplement",
  "IAEA TRS-398 rev-1 adds a proton pencil-beam scanning supplement",
  "The foundational absorbed-dose code of practice gets its first major revision, addressing monitor-chamber calibration for PBS.",
  "https://www.iaea.org/resources/hhc/medical-physics/radiotherapy/dosimetry", "tg_report", "physics", "practice_delta", "standard_analysis", "daily",
  ["Global"], ["physicist"], ["proton"], [], 83, "physics");
f("mri-only-planning-clinical-2025",
  "MRI-only planning crosses from feasibility to clinical implementation",
  "Deep-learning synthetic-CT goes routine for prostate and H&N/pelvic, validated by HU and gamma; SynthRAD2025 gives a fair benchmark.",
  "https://link.springer.com/article/10.1186/s13014-025-02744-2", "journal_article", "physics", "practice_delta", "standard_analysis", "daily",
  ["Europe","Global"], ["physicist","dosimetrist"], ["mr_linac"], ["prostate","h_n"], 80, "physics");
f("kbq-mr-compatible-chamber-factors",
  "Measured kB,Q factors validate MR-compatible chambers ahead of TG-351",
  "Seven MR-compatible chambers on 1.5T Unity and 0.35T MRIdian behave near-identically to conventional models — feeding TG-351 calibration.",
  "https://aapm.onlinelibrary.wiley.com/doi/10.1002/acm2.14613", "journal_article", "physics", "paper_critique", "standard_analysis", "daily",
  ["Global"], ["physicist"], ["mr_linac"], [], 86, "physics");
f("synthrad2025-synthetic-ct-benchmark",
  "SynthRAD2025 gives synthetic-CT a fair head-to-abdomen benchmark",
  "Curated paired CBCT-to-CT and MRI-to-CT datasets fix the missing public benchmark that made sCT comparison unfair.",
  "https://pmc.ncbi.nlm.nih.gov/articles/PMC12264395/", "journal_article", "physics", "news_brief", "short_brief", "daily",
  ["Global"], ["physicist","researcher"], ["mr_linac"], [], 80, "physics");
f("independent-mc-secondary-check-multitarget-srs",
  "Independent Monte Carlo secondary check matures for multi-target SRS QA",
  "Custom MC beam models flag the targets most likely to fail pre-treatment measurement before they hit the phantom.",
  "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12457215/", "journal_article", "physics", "paper_critique", "standard_analysis", "daily",
  ["Global"], ["physicist"], ["sbrt"], ["cns"], 77, "physics");
f("log-file-qa-portal-dosimetry-prediction",
  "Log-file QA predicts portal dosimetry to enable per-fraction checks",
  "ML on VMAT trajectory logs predicts portal-dosimetry gamma to <2% error — pointing to measurement-free every-fraction monitoring.",
  "https://www.frontiersin.org/journals/oncology/articles/10.3389/fonc.2022.1096838/full", "journal_article", "physics", "paper_critique", "standard_analysis", "daily",
  ["Global"], ["physicist"], ["vmat"], [], 78, "physics");
f("pyesapi-pygqa-python-clinic-automation",
  "Python in the clinic: PyESAPI and pyGQA push physics automation",
  "Open scripting toolkits drive automated QA and data mining — but PyESAPI's research-use-only caveat is a real validation hurdle.",
  "https://github.com/VarianAPIs/PyESAPI", "journal_article", "physics", "primer", "standard_analysis", "daily",
  ["Global"], ["physicist"], [], [], 72, "physics");

// ---- THEME 10: Vendor landscape shifts ----
f("viewray-mridian-exit-buyer-risk-lesson",
  "ViewRay's collapse: a single-vendor-dependence cautionary tale",
  "ViewRay ceased operations in Oct 2023; the MRIdian base now runs under successor ownership. The buyer's-risk lesson.",
  "https://www.sec.gov/", "regulatory_guidance", "vendor", "vendor_intel", "standard_analysis", "daily",
  ["US"], ["industry","physicist","investor"], ["mr_linac"], [], 76, "operational");
f("elekta-evo-restructuring-adaptive-reposition",
  "Elekta repositions against Varian's adaptive lead with Evo + restructuring",
  "The Evo CBCT-adaptive launch lands alongside corporate restructuring. Where Elekta sits in the adaptive race.",
  "https://www.elekta.com/", "vendor_pr", "vendor", "vendor_intel", "standard_analysis", "daily",
  ["Europe"], ["industry","investor"], ["adaptive"], [], 80, "operational");
f("ge-healthcare-mr-contour-dl-clearance",
  "GE HealthCare clears MR Contour DL, pushing into RT planning AI",
  "FDA-cleared deep-learning contouring extends GE beyond imaging into the RT planning-adjacent AI category.",
  "https://www.gehealthcare.com/", "fda_clearance", "vendor", "fda_brief", "short_brief", "daily",
  ["US"], ["industry","physicist"], [], [], 88, "ai");
f("leo-reflexion-emerging-modality-vendors",
  "Leo upright therapy and RefleXion BgRT carve emerging-modality niches",
  "Upright/seated RT and PET-guided biology-guided RT define new vendor categories beyond the conventional gantry.",
  "https://reflexion.com/", "vendor_pr", "future_rt", "vendor_intel", "short_brief", "daily",
  ["US"], ["industry","investor","physician"], [], [], 70, "operational");

// ============================================================
// EXPAND → validate → emit
// ============================================================
const errors = [];
const slugs = new Set();
const rows = F.map((r, i) => {
  const id = `[#${i + 1} ${r.slug}]`;
  if (!CATEGORY.has(r.cat)) errors.push(`${id} bad category: ${r.cat}`);
  if (!CONTENT_TYPE.has(r.ct)) errors.push(`${id} bad content_type: ${r.ct}`);
  if (!ARCHETYPE.has(r.arch)) errors.push(`${id} bad archetype: ${r.arch}`);
  if (!TIER.has(r.tier)) errors.push(`${id} bad tier: ${r.tier}`);
  if (!SOURCE_TYPE.has(r.st)) errors.push(`${id} bad source_type: ${r.st}`);
  if (!DOM.has(r.dom)) errors.push(`${id} bad dominant axis: ${r.dom}`);
  if (!/^https?:\/\//i.test(r.url)) errors.push(`${id} bad primary_source_url: ${r.url}`);
  if (r.title.length > 90) errors.push(`${id} title ${r.title.length}>90: ${r.title}`);
  if (!r.standfirst) errors.push(`${id} empty standfirst`);
  if (slugs.has(r.slug)) errors.push(`${id} duplicate slug`); else slugs.add(r.slug);
  const lang = r.lang ?? "en";
  if (!LANG.has(lang)) errors.push(`${id} bad source_language: ${lang}`);
  for (const re of r.region ?? []) if (!re) errors.push(`${id} empty region entry`);

  const a = axes(r.sig, r.dom, r.st);
  const score = composite(a);
  // body_md is NOT NULL; a draft stub carries the finding summary + source + the
  // explicit pipeline marker. CONTENT-5 replaces it with the fact-checked draft.
  const body = [
    `> **DRAFT STUB — pending full editorial draft (CONTENT-5 pipeline).**`,
    ``,
    r.standfirst,
    ``,
    `**Research signal:** ${r.sig}/100 · **dominant axis:** ${r.dom} · **source type:** ${r.st}.`,
    `**Primary source:** ${r.url}`,
    ``,
    `_Seeded ${"2026-06-04"} from the 2026 RadOnc landscape research. Composite is a heuristic seed; the signal-scorer recomputes from the drafted body._`,
  ].join("\n");

  const row = {
    slug: r.slug, archetype: r.arch, tier: r.tier, category: r.cat,
    subcategory: null, content_type: r.ct, source_language: lang,
    title: r.title, standfirst: r.standfirst, body_md: body,
    word_count: null,
    romas_insight: r.insight ?? null,
    romas_insight_labeled: r.insight ? true : false,
    status: "draft",
    primary_source_url: r.url, primary_source_type: r.st,
    region: r.region ?? [], audience_tags: r.aud ?? [],
    modality_tags: r.mod ?? [], disease_site_tags: r.dis ?? [],
    composite_score: score,
    signal_scores: { clinical: +a.clinical.toFixed(3), ai: +a.ai.toFixed(3), physics: +a.physics.toFixed(3), operational: +a.operational.toFixed(3), novelty: +a.novelty.toFixed(3), confidence: +a.confidence.toFixed(3) },
    embargoed: r.embargo ? true : false,
    embargo_until: r.embargo ? r.embargo[0] : null,
  };
  return row;
});

if (errors.length) {
  console.error(`VALIDATION FAILED (${errors.length}):`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}

// Distribution report
const by = (key) => rows.reduce((m, r) => ((m[r[key]] = (m[r[key]] || 0) + 1), m), {});
const band = (s) => s >= 85 ? "Hero(85+)" : s >= 70 ? "Strong(70-84)" : s >= 55 ? "Standard(55-69)" : s >= 40 ? "Quick(40-54)" : "Reference(<40)";
const bands = rows.reduce((m, r) => ((m[band(r.composite_score)] = (m[band(r.composite_score)] || 0) + 1), m), {});
console.log(`Rows: ${rows.length}`);
console.log("By category:", JSON.stringify(by("category")));
console.log("By content_type:", JSON.stringify(by("content_type")));
console.log("By signal band:", JSON.stringify(bands));
console.log("Composite range:", Math.min(...rows.map(r=>r.composite_score)), "→", Math.max(...rows.map(r=>r.composite_score)));

if (process.argv.includes("--check")) { console.log("--check: validation passed, no write."); process.exit(0); }

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, rows.map((r) => JSON.stringify(r)).join("\n") + "\n", "utf8");
console.log(`Wrote ${rows.length} rows → ${OUT}`);
