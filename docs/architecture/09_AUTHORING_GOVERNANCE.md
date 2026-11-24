# PHASE 9 — Curriculum Authoring System & Governance

Covers spec §18 (authoring) and §19 (governance).

> **Extended by the Curriculum Operating Model.** Everything in this document remains in force. The
> **seven validation gates (§9.2) are retained unchanged and reused** — [Phase 14
> §14.4](14_AI_GENERATION_GOVERNANCE.md#144-the-10-stage-validation-pipeline) wraps them with three
> additional stages (schema pre-gate, golden comparison, computed risk classification) rather than
> creating a second validation system. Three sections are superseded or extended:
>
> | This document | Extension |
> |---|---|
> | §9.1 Workspaces 1–5 | Gain the Competency Contract editor ([Phase 12](12_COMPETENCY_CONTRACTS.md)), the spec compiler ([Phase 13 §13.3](13_CONTENT_SPECIFICATIONS.md#133-compiling-a-contentspec-from-a-contract)), and the Golden Content workspace ([Phase 13 §13.5](13_CONTENT_SPECIFICATIONS.md#135-golden-content)) |
> | §9.3 Post-hoc monitoring | Becomes the **binding** trust lifecycle — items auto-retire without human approval ([Phase 11 §11.4](11_CURRICULUM_OPERATING_MODEL.md#114-the-trust-lifecycle)) |
> | §9.4 Change classification | Formalised into 5 named classes with the grandfathering rule as stated policy ([Phase 15 §15.3](15_HUMAN_REVIEW_GOVERNANCE.md#153-curriculum-versioning-and-change-classification)) |
> | §9.5 Roles | Extended from 7 to include Safety & Inclusion Reviewer and Psychometrician ([Phase 15 §15.1](15_HUMAN_REVIEW_GOVERNANCE.md#151-governance-roles)) |

**The threat model:** an AI that can write content will, given enough volume, drift — introducing
vocabulary above level, teaching a concept before its prerequisite, contradicting the curated
explanation, or quietly inventing a progression. At 100 lessons a human notices. At 500,000
lessons nobody notices, and the curriculum silently becomes whatever the model's priors are.

Governance exists to make that structurally impossible rather than merely unlikely.

---

## 9.1 The Curriculum Authoring System (CAS)

An internal tool for curriculum experts. Five workspaces.

### Workspace 1 — Concept Graph Editor

The prerequisite DAG as a visual, editable graph.

| Capability | Detail |
|---|---|
| Create / edit concepts | branch, slug, definition, CEFR floor, spiral levels |
| Draw prerequisite edges | HARD or SOFT, with a required justification note |
| Cycle detection | live — the editor refuses to draw an edge that creates a cycle |
| Prerequisite locality check | warns when a HARD edge spans >4 levels (Phase 4 §4.7) |
| Orphan detection | flags concepts with no micro skills, or realised at only one level without `terminal: true` |
| Impact preview | "changing this concept affects 34 competencies, 187 micro skills, 4,200 content items, and 12,400 learner mastery records" — shown *before* saving |
| Diff view | between curriculum releases |

The impact preview is the feature that changes author behaviour. Curriculum experts editing
blind will happily restructure a foundational concept; shown that it touches 12,400 learner
records, they scope the change properly.

### Workspace 2 — Competency & Micro-Skill Builder

| Capability | Detail |
|---|---|
| Author competencies | statement, level, domain, CEFR, Bloom tiers, weight |
| Well-formedness checker | enforces the five competency rules (Phase 4 §4.3) |
| Micro-skill decomposition | with the **single-failure-mode** check: the tool asks "name the one reason a learner fails this" and flags answers containing "or" / "and" |
| Learning outcome editor | Given/When/Then + numeric threshold, both mandatory |
| Mastery criterion editor | accuracy, min attempts/sessions/formats, productive & transfer requirements, retention interval |
| Coverage heatmap | the 120 (level × pillar) grid, coloured by competency count — empty cells are red and block release |
| Format availability check | flags micro skills with <3 available activity formats |

### Workspace 3 — Lesson & Content Studio

| Capability | Detail |
|---|---|
| Curated lesson authoring | teaching moment + activity sequence, bound to outcomes |
| Content bank | search and reuse by curriculum address, topic tag, grade band |
| Linguistic measurement | live vocabulary-ceiling, sentence-length, clause-depth, and readability readouts against the target level's limits, shown as the author types |
| Grade-environment preview | the same content rendered as it would appear to a Grade 3 and a Grade 9 learner at the same level |
| Band preview | the same activity at D1 through D5, so authors can see the scaffold ladder |
| AI-assisted drafting | authors may ask for a draft, but output enters as `DRAFT` and passes the same 7 gates |

The live linguistic readout matters more than it sounds: human authors violate level ceilings
constantly and unknowingly. A Level 2.2 passage written by an expert adult routinely contains
Level 3.1 vocabulary. Measuring it as they type is what keeps curated content honest — the same
standard the AI is held to.

### Workspace 4 — Review Queue

| Capability | Detail |
|---|---|
| Gate report per item | all 7 gate results, pass/fail with specifics |
| Batch review | AI variations grouped by learning outcome; approve/reject in bulk with spot-checks |
| Sampling policy | 100% review for the first 500 items per learning outcome, then risk-based sampling (≥5%, rising if rejection rate rises) |
| Reject with reason codes | feeds back into generation prompts |
| Rater agreement tracking | for the 2% human audit of LLM-scored learner work |
| Escalation | items failing the same gate repeatedly escalate to the concept owner — a pattern of failures usually means the *concept definition* is ambiguous, not that the generator is bad |

### Workspace 5 — Release Manager

| Capability | Detail |
|---|---|
| Invariant report | all nine Phase 4 §4.7 checks; **any failure blocks publish** |
| Version pinning | a release is an immutable snapshot of concepts, competencies, micro skills, outcomes |
| Staged rollout | 1% → 10% → 50% → 100% of learners, with mastery-rate and engagement monitoring at each stage |
| Rollback | one action; learner mastery records pin their earned version, so rollback never destroys progress |
| Retirement workflow | content retired, never deleted; learners mid-quest finish on the old version |
| Change log | auto-generated, human-annotated |

---

## 9.2 The seven validation gates

Every AI-generated item passes all seven, in order. Failure at any gate rejects the item with a
reason code. Gates 1–5 are automated and deterministic. Gate 6 is model + rules. Gate 7 is
automated with human sampling.

```
GENERATION
    ↓
① CURRICULUM VALIDATION      structural — is it correctly addressed?
    ↓
② AGE VALIDATION             is it appropriate for the grade environment?
    ↓
③ DIFFICULTY VALIDATION      is it within the level's linguistic ceilings?
    ↓
④ LANGUAGE ACCURACY          is the English correct?
    ↓
⑤ GRAMMAR / KEY VALIDATION   is the answer key right and unambiguous?
    ↓
⑥ BIAS & SAFETY              is it safe, fair, and culturally appropriate?
    ↓
⑦ LEARNING OBJECTIVE         does it actually measure the intended micro skill?
    ↓
APPROVED → cached → served
```

### Gate 1 — Curriculum Validation

| Check | Reject if |
|---|---|
| Address completeness | any of level / pillar / domain / competency / microSkill / concept / band missing |
| Address existence | any referenced entity does not exist in the current published release |
| Address consistency | the micro skill does not belong to the named competency, or the competency not to the named domain/level |
| Prerequisite integrity | the item requires knowledge from a concept that is not a declared prerequisite of this one |
| Outcome alignment | no `learningOutcomeId`, or the item cannot produce evidence for it |
| Version currency | addresses a retired or draft entity |

**This gate is what makes AI content safe.** It cannot pass unless the item is bound to a
human-authored node that already exists in the approved sequence. An AI cannot invent
progression, because progression is not an input it is allowed to write.

### Gate 2 — Age Validation

| Check | Reject if |
|---|---|
| Topic appropriateness | topic outside the grade's allowlist (violence, romance, substances, politics, religion — thresholds vary by grade) |
| Context plausibility | assumes world knowledge the grade cannot have |
| Register match | addresses a Grade 10 learner as a small child, or a Grade 2 learner as an adult |
| Visual/interaction fit | requires reading instructions below Level 2.1; requires fine motor control below age 5 |
| Reward framing | childish reward language in Group 4–5 content |
| Named-entity fit | characters implausibly young or old for the audience |

The register check runs in both directions. Condescension toward older struggling learners is
the failure mode this gate exists to catch, and it is the one that most damages retention.

### Gate 3 — Difficulty Validation

Deterministic, measured, not judged:

| Measure | Constraint |
|---|---|
| Vocabulary ceiling | every content word within the level's frequency band, or explicitly pre-taught in the item |
| Sentence length | mean within `[sentenceLenMin, sentenceLenMax]` for the level |
| Clause depth | max ≤ `maxClauseDepth` |
| Text length | within `[textLenMin, textLenMax]` |
| Readability | within the level's target band (grade-level formula appropriate to text type) |
| Band consistency | scaffolds present/absent as the declared band requires; distractor similarity matches band |
| Morphological load | derived-word density within level norms |

Every violation is reported with the offending span, so the generator can be re-prompted
precisely rather than re-rolled blindly.

### Gate 4 — Language Accuracy

| Check | Reject if |
|---|---|
| Grammaticality | any ungrammatical sentence (unless the item's purpose is error identification, declared in the address) |
| Spelling & mechanics | any error, checked against the configured variety (Indian/British English by default) |
| Collocation naturalness | statistically implausible collocations |
| Register consistency | mixed register within one item |
| Factual accuracy | verifiable claims checked; unverifiable claims rejected from informational content |
| Variety consistency | no mixing of American and British conventions within a release |

### Gate 5 — Grammar / Answer-Key Validation

The gate that catches the most AI failures in practice.

| Check | Reject if |
|---|---|
| Key correctness | the marked answer is wrong |
| Unique correctness | a distractor is also defensibly correct |
| Distractor plausibility | distractors are absurd (unusable item) or indistinguishable (unfair item) |
| No positional bias | correct answers not evenly distributed across positions in a batch |
| No cueing | the stem's grammar or length gives away the answer |
| Rubric completeness | for constructed responses, the rubric covers the plausible response space |
| Multi-answer handling | open-ended items enumerate the acceptable answer set |

Implemented as: independent re-solve by a second model without seeing the key, plus rule checks.
Disagreement between the generator's key and the solver's answer routes to human review rather
than being auto-resolved — the disagreement itself is the signal.

### Gate 6 — Bias & Safety

| Check | Reject if |
|---|---|
| Protected-characteristic stereotyping | gender, caste, religion, region, disability, body, socioeconomic |
| Representation balance | monitored across a batch, not per item: name diversity, gender balance in roles, urban/rural mix, regional spread across India |
| Cultural appropriateness | content that would embarrass a school or exclude a community |
| Safety | self-harm, unsafe instructions, adult content, contact solicitation |
| Sensitive topics | handled per grade policy; where permitted, must be balanced and non-partisan |
| Accessibility | images have alt text; audio has transcripts; colour is never the sole information channel; no reliance on sound alone |
| Name and context inclusivity | not exclusively Anglophone or exclusively metro-Indian names and settings |

Representation is a **batch-level** property. Per-item checks cannot detect that 90% of the
doctors in a corpus are male and 90% of the teachers female. So Gate 6 runs a corpus audit on
every batch and on a rolling window of served content, and it blocks the batch, not the item.

### Gate 7 — Learning Objective Validation

The subtlest gate: the item may be correct, level-appropriate, and safe, and still not measure
what it claims.

| Check | Reject if |
|---|---|
| Construct validity | the item is solvable without the target micro skill |
| Confound detection | success depends more on an untargeted skill than the target (e.g. a "listening inference" item whose bottleneck is unknown vocabulary) |
| Guess-rate conformance | actual guess rate deviates from the format's declared `P(G)` |
| Single-skill focus | the item mixes multiple micro skills so that failure is not attributable |
| Evidence sufficiency | the item cannot discriminate between `Developing` and `Proficient` |
| Format-appropriateness | the format cannot produce the evidence type the outcome requires (e.g. an MCQ claiming productive evidence) |

Validated two ways: **statically**, by asking a model to solve the item while explicitly denied
the target skill (if it still succeeds, the item is confounded); and **empirically**, by
post-hoc item analysis once ≥100 learners have attempted it — point-biserial correlation with
the micro skill's mastery estimate. Items with correlation below 0.15 are auto-retired regardless
of having passed pre-hoc validation.

---

## 9.3 Post-hoc monitoring

Pre-hoc gates cannot catch everything. Continuous monitoring on served content:

| Metric | Threshold | Action |
|---|---|---|
| Item p-value (population % correct) | outside 0.35–0.90 for its band | recalibrate `eloDifficulty`, or retire |
| Point-biserial discrimination | <0.15 | auto-retire, flag the generation prompt |
| Distractor analysis | a distractor chosen by >40% of high-mastery learners | key is probably wrong → human review |
| Time-on-item | >3× format median | item is unclear → review |
| Abandon rate | >15% | item is discouraging → review |
| Learner/teacher reports | ≥3 reports on one item | immediate quarantine, then review |
| Batch mastery-rate shift | a new release drops population mastery rate >5% | halt rollout, investigate |
| Cross-cohort fairness | differential item functioning across school/region/gender at matched ability | flag for bias review |

The last row matters for a platform selling to schools across India: an item can be perfectly
fair on inspection and still function differently for learners in a Tamil-medium versus a
Hindi-medium background. Only differential-item-functioning analysis at matched ability finds
that, and it can only run post-hoc.

---

## 9.4 Curriculum versioning without breaking learners

The hard requirement from spec §18: *update content without breaking existing student progress.*

### Version pinning

`Mastery.earnedAtVersion` and `Attempt.microSkillVersion` record which curriculum version each
piece of evidence was earned against. Revising a micro skill never invalidates prior mastery.

### Change classification

| Class | Examples | Effect on learners |
|---|---|---|
| **Cosmetic** | wording, illustration, topic swap | none; applies immediately to everyone |
| **Additive** | new content items, new activity formats, new micro skill added to a competency | none for existing masteries; the new micro skill enters as `INTRODUCED`, so the competency's roll-up dips slightly and the planner schedules it. Learners are not stripped of a badge they hold |
| **Refining** | mastery threshold raised, criterion tightened | grandfathered — existing `Mastered` records keep their state but are re-evaluated on their next natural retention check, not immediately downgraded |
| **Structural** | micro skill split or merged, prerequisite added, competency moved between domains | requires an explicit migration script authored alongside the change; release blocked until it exists |
| **Retirement** | concept or competency retired | learners mid-quest finish on the pinned old version; the quest seals normally; no new learners are routed to it |

The grandfathering rule in the "Refining" row is deliberate. Raising a threshold and instantly
demoting thousands of learners from `Mastered` would be technically correct and pedagogically
defensible — and would destroy trust in the badge system overnight. Re-evaluating at the next
natural retention check achieves the same accuracy without a visible mass demotion.

### Split and merge semantics

- **Split** (`A` → `A₁`, `A₂`): learner mastery on `A` is inherited by both children at
  `min(state, PROFICIENT)` and evidence counts are copied. Both children require one fresh piece
  of evidence before either can reach `MASTERED`. Rationale: the split was made because `A` was
  measuring two things, so prior evidence cannot be attributed cleanly to either.
- **Merge** (`A₁`, `A₂` → `A`): the merged record takes `min(state)` and the union of format,
  session, and productive/transfer evidence. Conservative by construction.

### Rebuild guarantee

Because `Attempt` is append-only and complete, `Mastery`, `CompetencyMastery`, `LanguageDNA`, and
`StrandScore` are all fully rebuildable from evidence at any time. `LanguageDNA.schemaVersion`
triggers a rebuild when the inference model itself changes. This is what allows the BKT/Elo
parameters to be improved after launch without corrupting existing learners: recompute, don't
patch.

---

## 9.5 Roles & permissions

| Role | Concepts & DAG | Competencies | Curated lessons | AI content review | Publish release | Mastery rules |
|---|---|---|---|---|---|---|
| Chief Learning Architect | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Curriculum Expert | edit own branch | ✅ | ✅ | ✅ | ❌ | propose |
| Content Author | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Reviewer / Rater | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Linguist / QA | comment | comment | comment | ✅ | ❌ | comment |
| AI System | **read-only** | **read-only** | **read-only** | submit as DRAFT | ❌ | **read-only** |
| Teacher | ❌ | ❌ | ❌ | report items | ❌ | ❌ |

Every write to a curriculum table is audit-logged with actor, timestamp, before/after, and
justification. Curriculum tables have no delete permission for any role — retirement only.

---

## 9.6 The governance invariant

Stated as a single testable property, because governance that cannot be tested is a policy
document rather than a control:

> **No row in `Content`, `Lesson`, or `ActivityInstance` may reference a curriculum address that
> does not exist in a published `CurriculumRelease`, and no AI-originated row may exist with
> `status = PUBLISHED` without a complete `validationReport` recording seven passes.**

Enforced at three layers, deliberately redundant — any single layer can be bypassed by a bug, all
three cannot be bypassed by accident:

1. **Database** — foreign keys on every address field; a `CHECK` constraint requiring
   `validationReport IS NOT NULL` when `tier != CURATED AND status = PUBLISHED`.
2. **Application** — the content service refuses to serve a row failing the invariant, and logs
   the violation as a critical alert.
3. **Continuous audit** — a nightly job scans all published content for orphaned addresses,
   missing validation reports, and version drift, and reports to the Release Manager dashboard.

If this invariant holds, AI cannot corrupt the curriculum — not because the model is
well-behaved, but because the schema will not store the corruption.
