---
name: pronunciation-lexicon
description: Pronunciation lexicon for ROMAS Brief audio production — drug names, device / vendor names, modality acronyms, anatomical sites, trial identifiers. 30-entry seed plus expansion rules. Load before every audio script preparation.
---

# ROMAS Brief — Pronunciation Lexicon

## Format

Lexicon is stored as `tools/audio/lexicon.json` with this entry schema:

```json
{
  "term": "Elekta",
  "type": "vendor | drug | device | modality | acronym | person | institution | site",
  "ipa": "ɪˈlɛk.tə",
  "ssml": "<phoneme alphabet=\"ipa\" ph=\"ɪˈlɛk.tə\">Elekta</phoneme>",
  "spoken": "ee-LEK-tah",
  "notes": "Swedish-origin company; stress on second syllable.",
  "added_by": "kimal",
  "added_at": "2026-05-12"
}
```

Producer pipeline rewrites raw script tokens with the SSML form for ElevenLabs and the `spoken` form for PlayHT.

---

## 30-entry launch seed

### Vendors

| Term | Spoken | IPA |
|---|---|---|
| Elekta | ee-LEK-tah | ɪˈlɛk.tə |
| Varian | VAIR-ee-an | ˈvɛəɹ.i.ən |
| Accuray | AK-yoo-ray | ˈæk.jʊ.ɹeɪ |
| ViewRay | VYOO-ray | ˈvjuː.ɹeɪ |
| RaySearch | RAY-surch | ˈɹeɪ.sɜːtʃ |
| Mevion | MEH-vee-on | ˈmɛv.i.ɒn |
| Brainlab | BRAYN-lab | ˈbɹeɪn.læb |
| TheraPanacea | thair-uh-pan-uh-SEE-uh | θɛɹ.ə.pæn.əˈsiː.ə |
| Radformation | rad-for-MAY-shun | ˌɹæd.fɔɹˈmeɪ.ʃən |
| Limbus AI | LIM-bus AY-EYE | ˈlɪm.bəs eɪˈaɪ |

### Devices / platforms

| Term | Spoken | Notes |
|---|---|---|
| Unity (Elekta Unity) | YOO-ni-tee | MR-Linac |
| Ethos (Varian Ethos) | EE-thoss | Online adaptive |
| MRIdian (ViewRay) | em-AR-EYE-dee-an | MR-Linac |
| CyberKnife | SYE-ber-nife | Accuray robotic |
| TomoTherapy | TOH-moh-THAIR-uh-pee | Accuray helical |
| Halcyon (Varian) | HAL-see-on | Ring-gantry linac |

### Modality acronyms

| Term | Spoken |
|---|---|
| SBRT | ess-bee-AR-tee |
| IMRT | eye-em-AR-tee |
| VMAT | VEE-mat |
| MR-Linac | em-AR LIN-ak |
| IGRT | eye-jee-AR-tee |
| FLASH | flash |
| SRS | ess-AR-ess |

### Anatomical / oncology terms

| Term | Spoken |
|---|---|
| Gleason | GLEE-sun |
| oligometastatic | ah-LIG-oh-met-uh-STAT-ik |
| oropharyngeal | or-oh-fair-IN-jee-ul |
| nasopharyngeal | nay-zoh-fair-IN-jee-ul |
| glioblastoma | glee-oh-blas-TOH-mah |
| pancreatic | pan-kree-AT-ik |
| hepatocellular | heh-PAT-oh-SELL-yoo-ler |

---

## Expansion rules

1. **Every new audio script** — producer scans for unknown drugs, devices, vendor names, trials, institutions, or persons.
2. **Unknown term workflow**:
   - Producer drafts an entry → adds to `lexicon_proposals.json`.
   - `audio-qa-reviewer` reviews on next QA cycle.
   - If approved, merge to `lexicon.json` with `added_by` + `added_at`.
3. **Conflict resolution**: prefer the **most common professional pronunciation** as cited in society talks (ASTRO / ESTRO / AAPM keynotes), not Wikipedia.
4. **Trade names with non-obvious pronunciation** (e.g., "Lutathera" → loo-TATH-er-ah): always require lexicon entry before audio ships.
5. **Acronyms**: store both letter-by-letter and word-form if both are common (e.g., "SBRT" letters, "VMAT" word).

---

## Growth targets

| Milestone | Lexicon entries |
|---|---|
| Day 1 (launch) | 30 (this seed) |
| Day 14 | 75 — add vendor breadth + top 20 drug names |
| Day 30 | 120 — add disease-site terms + investigator names recurring in coverage |
| Day 90 | 200 — comprehensive across ASTRO 2024 + ESTRO 2025 vocabulary |
| Day 180 | 350 — depth across all modalities + emerging therapies |

---

## SSML application

Producer's script-to-SSML transformer scans the script for known lexicon terms and substitutes the `ssml` field:

```ts
function applyLexicon(script: string, lexicon: LexiconEntry[]): string {
  let out = script;
  for (const entry of lexicon) {
    const regex = new RegExp(`\\b${escapeRegex(entry.term)}\\b`, "g");
    out = out.replace(regex, entry.ssml);
  }
  return out;
}
```

For PlayHT failover, use the `spoken` field instead (PlayHT prefers grapheme respelling).

---

## Reviewer flag points

QA reviewer flags **soft reject** (B-section fail) if any of:

- A drug / device / vendor name pronounced inconsistently within the same episode.
- An acronym pronounced wrong (e.g., "I-M-R-T" pronounced as "imrt").
- A common modality term clearly garbled (e.g., "stereotactic" mangled).

---

*Lexicon is a living asset. Treat the proposals queue as a real backlog. Aim for net-add of 5–10 entries per week through Day 90.*
