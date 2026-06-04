---
title: ROMAS Wire — Corpus Topic-Discovery Backlog (CORPUS-3)
generated: 2026-06-04
generator: tools/content/topic-backlog.mjs
source: Docs/content/corpus/docira-index.ndjson (2,150 unique docs)
status: editorial signal — NOT auto-seeded article rows (Rule 1 needs verified primary URLs per topic)
---

# Corpus Topic-Discovery Backlog

> **What this is / isn't.** The corpus's extracted titles are OCR-noisy and doc-type
> detection is unreliable, so this does **not** auto-create article rows. It is the
> reliable signal — *where the corpus can RAG-ground articles well* (coverage) plus
> *candidate leads* (longest, noise-filtered docs). Turning a lead into an article is a
> Stage-5 pipeline job: find + verify the **primary source URL** (Rule 1), then draft.
> The corpus's main value is **RAG grounding** (CORPUS-2 `reference_chunks`), not a
> publish feed.

## 1. Coverage by ROMAS article category
How deeply the corpus can ground each category (more words = stronger retrieval grounding).

| Article category | Docs | Words | Papers | Textbooks | Manuals | Grounding |
|---|---:|---:|---:|---:|---:|---|
| resident_education | 1715 | 24,535,258 | 213 | 259 | 76 | **deep** |
| clinical_rt | 199 | 2,739,823 | 43 | 15 | 32 | **moderate** |
| physics | 219 | 1,719,886 | 41 | 26 | 26 | **moderate** |
| future_rt | 17 | 178,733 | 2 | 4 | 7 | **thin** |

**Read:** the corpus is **deep on physics + resident_education** — exactly ROMAS Wire's
moat (the landscape brief's Themes 6/9). It grounds clinical_rt moderately. It is thin on
ai / regulatory / reimbursement — those stay sourced from live discovery (cron-ingest),
not this corpus.

## 2. Candidate grounding anchors (leads, by category)
Longest noise-filtered docs per category. **Titles may still be imperfect — verify before
use.** Citability tag: `paper→find DOI` / `TG/AAPM→find URL` = a public primary source
likely exists (pipeline finds + verifies it); `RAG-only` = internal reference, grounds
drafts but is not itself a citable article source.

### resident_education
  - **Compendium to Radiation Physics for Medical Physicists** (365,859 w, textbook) — _RAG-only_ · `02_Textbooks-and-Books/Clinical-RadOnc/3000_problems_in_Medical_Physics_by_Ervin_B_Podgoršak[1]`
  - **Comprehensive Brachytherapy** (345,064 w, textbook) — _RAG-only_ · `10_Education-Training/Residency-Curriculum/Rotation-4-Brachytherapy/(Imaging in medical diagnosis and therapy) Jack Venselaar_ et al - Comprehensive brachytherapy _ physical and clinical aspects-CRC Press (2013)`
  - **Comprehensive Brachytherapy** (336,283 w, textbook) — _RAG-only_ · `02_Textbooks-and-Books/Mixed/(Imaging in medical diagnosis and therapy) Jack Venselaar_ et al - Comprehensive brachytherapy _ physical and clinical aspects-CRC Press (2013)`
  - **Nuclear Medicine Radiation Dosimetry** (334,213 w, textbook) — _RAG-only_ · `10_Education-Training/HFHS-Local-Program/Medical-Physics/2010_Book_NuclearMedicineRadiationDosime`
  - **Sarah M. C. Sittenfeld, MD_ Matthew C. Ward, MD_ Rahul D. Tendulkar, MD_ Gregory** (333,245 w, unknown) — _RAG-only_ · `02_Textbooks-and-Books/Mixed/Sarah M. C. Sittenfeld, MD_ Matthew C. Ward, MD_ Rahul D. Tendulkar, MD_ Gregory M. M. Videtic, MD, CM, FRCPC - Essentials of Clinical Radiation Oncology-Springer Publishing Company (202`
  - **BACKGROUND INFORMATION** (324,386 w, textbook) — _RAG-only_ · `10_Education-Training/Residency-Curriculum/Rotation-7-Imaging/ - Radiobiology/Reading Materials/Supplemental Materials/BEIR VII Phase 2 - Health Risks from Exposure to Low Levels of Ionizing Radiation`
  - **Radiobiology for the Radiologist** (311,830 w, unknown) — _RAG-only_ · `02_Textbooks-and-Books/Clinical-RadOnc/Radiobiology for the Radiologist`
  - **Preface to the First Edition** (306,424 w, textbook) — _RAG-only_ · `10_Education-Training/Residency-Curriculum/Rotation-7-Imaging/ - Radiobiology/Reading Materials/Reading Assignments/Radiobiology for the Radiologist 7th Ed`
  - **Medical Imaging Physics** (267,890 w, textbook) — _RAG-only_ · `10_Education-Training/Residency-Curriculum/Rotation-6-IGRT/ - IGRT/Reading materials/Supplemental materials/Additional Materials/Previous Supplemental Materials/R.Hendee___Medical_Imaging_Physics2`
  - **MEDICAL IMAGING PHYSICS** (266,795 w, textbook) — _RAG-only_ · `10_Education-Training/Residency-Curriculum/Rotation-6-IGRT/ - IGRT/Reading materials/Supplemental materials/Books/_BOOK_Medical Imaging Physics - Hendee and Ritenour - 4th Edition`
  - **MEDICAL IMAGING PHYSICS** (265,922 w, textbook) — _RAG-only_ · `10_Education-Training/ABR-Board-Prep/Residents Only/_Textbooks/William R. Hendee, E. Russell Ritenour-Medical Imaging Physics-Wiley-Liss (2002)`
  - **Physics for Radiation Protection** (259,742 w, textbook) — _RAG-only_ · `03_Lectures-and-Courses/Resident-Physics-Course/Archive/Resident_Physics_2009-2010/VIII. Radiation safety-shielding/Physics_Radiation_Protection`

### clinical_rt
  - **Chapter 1 Imaging Lymph Nodes Using CT and MRI, Imaging Cancer by PET** (305,899 w, textbook) — _RAG-only_ · `07_Clinical-Workflows/Motion-Management/2006_Book_Image-GuidedIMRT`
  - **Intracranial Stereotactic Radiosurgery** (223,351 w, report_manual) — _RAG-only_ · `SRS Rotation/Books/Jason P. Sheehan (editor)_ L. Dade Lunsford (editor) - Intracranial Stereotactic Radiosurgery-CRC Press (2021).pdf.docira`
  - **Controversies in Stereotactic Radiosurgery Best Evidence Recommendations** (185,059 w, report_manual) — _RAG-only_ · `SRS Rotation/Books/Jason P. Sheehan_ Peter Gerszten - Controversies in Stereotactic Radiosurgery_ Best Evidence Recommendations-Thieme (2014).pdf.docira`
  - **Stereotactic Body Radiation Therapy** (180,883 w, report_manual) — _RAG-only_ · `SRS Rotation/Books/(Medical Radiology _ Radiation Oncology) Simon S. Lo_ Bin S. Teh_ Jiade J. Lu_ Tracey E. Schefter - Stereotactic Body Radiation Therapy-Springer (2012).pdf.docira`
  - **PRACTICAL Radiation Oncology Physics** (164,595 w, report_manual) — _RAG-only_ · `Brachytherapy Rotation/Sonja Dieterich PhD_ Eric Ford PhD_ Daniel Pavord BS  MS_ Jing Zeng MD - Practical Radiation Oncology Physics_ A Companion to Gunderson _ Tepper_s Clinical Radiation Oncology_ 1e-Elsevier (2016).pdf.docira`
  - **IMAGE-GUIDED HYPOFRACTIONATED STEREOTACTIC RADIOSURGERY** (156,647 w, report_manual) — _RAG-only_ · `SRS Rotation/Books/Lo_ Simon S._ Ma_ Lijun_ Sahgal_ Arjun_ Sheehan_ Jason P - Image-guided hypofractionated stereotactic radiosurgery _ a practical approach to guide treatment of brain and spine tumors-CRC Press (2016).pdf.docira`
  - **Lecture Notes in Biomathematics** (99,113 w, textbook) — _RAG-only_ · `11_Research-and-Publications/Operational-Research-in-RT/Optimization of Human Cancer Radiotherapy`
  - **Series in Medical Physics and Biomedical Engineering** (98,511 w, textbook) — _RAG-only_ · `11_Research-and-Publications/Operational-Research-in-RT/Radiotherapy and Clinical Radiobiology of Head and Neck Cancer`
  - **Intracranial Stereotactic Radiosurgery** (96,432 w, report_manual) — _RAG-only_ · `SRS Rotation/Books/Lunsford_ L. Dade_ Sheehan_ Jason P - Intracranial Stereotactic Radiosurgery-Thieme (2015)-1.pdf.docira`
  - **Chapter 1: System Overview** (68,515 w, textbook) — _RAG-only_ · `05_Brachytherapy/Procedures-and-Policies/L-0242 Physics Essentials Guide for the MRIdian Linac System_RevA`
  - **MiniMed 530G System User Guide** (68,280 w, textbook) — _RAG-only_ · `07_Clinical-Workflows/EMD/Medtronic MiniMed 530G`
  - **Practical Guides in Radiation Oncology** (51,182 w, unknown) — _RAG-only_ · `11_Research-and-Publications/Operational-Research-in-RT/Intracranial and Spinal Radiotherapy_ A Practical Guide on Treatment Techniques`

### physics
  - **IPEM-IOP Series in Physics and Engineering in Medicine and Biology** (121,029 w, report_manual) — _RAG-only_ · `Advanced Treatment Planning/Intensity Modulated Radiation Therapy_ A Clinical Overview.pdf.docira`
  - **Line containing a comment. These lines are not mandatory, and they can be insert** (98,759 w, textbook) — _RAG-only_ · `06_QA-and-Commissioning/Commissioning/Additional beam modeling info/Eclipse Photon and Electron Algorithms 15.5 Reference Guide`
  - **Related Topics** (87,476 w, unknown) — _RAG-only_ · `04_Treatment-Planning/Modality/RapidPlan/Eclipse Photon and Electron Instructions for Use P1005652-002`
  - **Sources and effects of ionising radiation** (79,890 w, textbook) — _RAG-only_ · `04_Treatment-Planning/Site/Lung/SBRT/radiation biology`
  - **TrueBeam Technical Reference Guide—Volume 2: Imaging** (39,901 w, textbook) — _RAG-only_ · `01_Reference-Reports/AAPM/AAPM-Reports/B501671R01B-Rev_1.0-TrueBeam_Technical_reference_Guide_-_Volume_2_-_Imaging`
  - **New Optimization Graphical User Interface** (36,803 w, textbook) — _RAG-only_ · `04_Treatment-Planning/Modality/RapidPlan/EC v13.5 NewFeaturesWorkbook`
  - **IT'S YOUR TIME BE PRECISE** (30,363 w, textbook) — _RAG-only_ · `06_QA-and-Commissioning/Small-Field-Dosimetry/Medical Physics - 2008 - Das - Accelerator beam data commissioning equipment and procedures  Report of the TG‐106 of the`
  - **QUALITY ASSURANCE OF** (29,808 w, textbook) — _RAG-only_ · `04_Treatment-Planning/Reading-Materials/Supplemental materials/ESTRO Physics for Clinical Radiotherapy Booklet No. 7 - QA of Treatment Planning Systems`
  - **lung cancer NCCN** (29,673 w, unknown) — _RAG-only_ · `04_Treatment-Planning/Site/Lung/General/lung cancer NCCN`
  - **Winston-Lutz test** (29,233 w, textbook) — _RAG-only_ · `06_QA-and-Commissioning/Small-Field-Dosimetry/SRS_SBRT QA Guidelines and Procedures`
  - **IV.B. PHILIPS PINNACLE $^{\circledR}$** (28,669 w, textbook) — _RAG-only_ · `04_Treatment-Planning/Reading-Materials/Reading assignments/TG-166 Biological Modeling in RTPs`
  - **breast-cancer-facts-and-figures-2017-2018** (26,463 w, textbook) — _RAG-only_ · `04_Treatment-Planning/Site/Breast/breast-cancer-facts-and-figures-2017-2018`

### future_rt
  - **CH07_Mageras** (18,109 w, unknown) — _RAG-only_ · `09_Radiobiology/Uncertainties/CH07_Mageras`
  - **Chapter 14 Image Guidance To Reduce Setup Error** (17,499 w, textbook) — _RAG-only_ · `09_Radiobiology/Uncertainties/CH14_Dong`
  - **CH11_Soisson** (16,412 w, textbook) — _RAG-only_ · `09_Radiobiology/Uncertainties/CH11_Soisson`
  - **Chapter 17 Uncertainties in Deformable Registration** (15,613 w, textbook) — _RAG-only_ · `09_Radiobiology/Uncertainties/CH17_Brock`
  - **CH05_Siebers** (11,847 w, unknown) — _RAG-only_ · `09_Radiobiology/Uncertainties/CH05_Siebers`
  - **CH02_Jeraj** (11,824 w, textbook) — _RAG-only_ · `09_Radiobiology/Uncertainties/CH02_Jeraj`
  - **Chapter 16 Dealing with Intrafraction Motion** (11,385 w, report_manual) — _RAG-only_ · `09_Radiobiology/Uncertainties/CH16_Low`
  - **CH18_Langen** (10,601 w, report_manual) — _RAG-only_ · `09_Radiobiology/Uncertainties/CH18_Langen`
  - **CH20_Pawlicki** (9,418 w, report_manual) — _RAG-only_ · `09_Radiobiology/Uncertainties/CH20_Pawlicki`
  - **Chapter 28 Perspectives for Assuring Quality in Therapy Delivery** (9,289 w, report_manual) — _RAG-only_ · `09_Radiobiology/Uncertainties/CH27_Jaffray`
  - **CH09_Bortfeld** (8,623 w, academic_paper) — _paper→find DOI_ · `09_Radiobiology/Uncertainties/CH09_Bortfeld`
  - **CH08_van Herk** (7,959 w, report_manual) — _RAG-only_ · `09_Radiobiology/Uncertainties/CH08_van Herk`

---
*Next: the editorial pipeline (or an agent) picks a lead → finds the verified primary source
→ drafts → fact-checks against both the source and the RAG-grounded `reference_chunks`.
Re-run after each corpus drop: `node tools/content/topic-backlog.mjs`.*
