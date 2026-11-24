# PHASE 14 — AI Generation Governance

How AI produces content, how it is validated, and how the system guarantees that unvalidated
content cannot corrupt a mastery decision.

---

## 14.1 The hard rule

> **AI may not modify the curriculum graph. Ever.**

| AI **may** | AI **may not** |
|---|---|
| Generate content instances against an approved `ContentSpecification` | Create a competency |
| Personalise, remediate, extend within a spec | Delete or retire a competency |
| Select the next activity and difficulty band | Reorder or add prerequisite edges |
| Score responses (ASR, rubric) with confidence bounds | Change a mastery threshold |
| Classify error patterns | Change a CEFR alignment |
| Retire content on bad statistics | Change a level or pillar definition |
| **Propose** a curriculum change with evidence | **Approve** a curriculum change |

Enforced at three redundant layers (Phase 9 §9.6): database permissions on curriculum tables,
application-layer refusal, and a nightly audit that alerts on any orphaned address or
missing validation report. Any single layer can fail to a bug; all three cannot fail silently.

Note the asymmetry in row 7 of the left column versus row 7 of the right: **AI has unilateral
authority to remove content and no authority to add curriculum.** The cost of wrongly removing an
item is one wasted generation; the cost of wrongly adding a curriculum node is a corrupted
progression affecting every learner who touches it.

---

## 14.2 The four generation tiers

The brief specifies three. Three has a hole: Tier 3 content is generated once and seen once, so it
can never accumulate the ≥100 attempts required for empirical calibration (§14.6) — which means by
the logic of Phase 11 §11.2 it can *never* be trusted for mastery inference. Splitting Tier 2
resolves this.

| Tier | Name | Who authors | Uniqueness | Calibratable? | May feed BKT mastery? | May satisfy `Mastered` gates? |
|---|---|---|---|---|---|---|
| **T1** | Canonical | Human expert | Fixed instance | Yes | **Yes**, full weight | **Yes** |
| **T2** | Curriculum-Generated | AI, batch, spec-bound | Fixed instance, pooled | Yes | **Yes**, after `TRUSTED` | **Yes** |
| **T2P** | Parameterized-Personalized | AI, from a validated template with slot substitution | Unique per learner; **template** is fixed | Yes — at template level | **Yes**, after template `TRUSTED` | **Yes** |
| **T3** | Real-Time Free-Form | AI, live, spec-bound | Unique, ephemeral | **No** | **No** | **No** |

### T1 — Canonical

Expert-created or expert-approved. Used for: foundational instruction, conceptual-change lessons
(`isConceptualChange = true`), milestone and Level Assessments, CEFR-boundary content, pronunciation
benchmarks, rubric anchors, capstones.

Volume: ~4,500 items (~0.6% of the library). Always `riskTier = HIGH`, always ≥2 reviewers, enters
at `TrustState = TRUSTED` on approval — expert authorship substitutes for empirical calibration
here, and this is the only place that substitution is permitted.

### T2 — Curriculum-Generated

AI generates a **pool** of fixed instances per `ContentSpecification`, pre-generated in batch and
cached. Each instance has a stable identity, is served to many learners, and therefore accumulates
statistics. This is where content *volume* lives.

Volume: ~600,000 items (~85%). Target pool size 200–500 per spec, which is what makes practice
non-repetitive across a 12-week level dwell.

### T2P — Parameterized-Personalized (new)

The resolution of the Tier 3 hole. A validated **template** with typed slots; the slots are filled
per learner from their Language DNA (interests, error patterns, recently-seen items).

```
Template  (validated, calibrated, statistics accumulate HERE)
   "The {TEAM} picked the ___ {ROLE} for the {EVENT}."
   slots:  TEAM  ∈ interest-bound noun set, level-frequency-checked
           ROLE  ∈ interest-bound noun set
           EVENT ∈ context-allowlist noun set
   options: generated from the level's synonym set per distractorPolicy

Instance  (unique per learner, ephemeral identity, inherits the template's trust state)
   "The team picked the ___ striker for the final match."
```

Why this works: the *linguistic and pedagogical structure* — which is what validation and
calibration actually assess — is fixed and shared. Only the topical surface varies, and every slot
value is drawn from a pre-validated, frequency-checked, policy-filtered set. So a T2P instance
inherits its template's `TrustState`, and the template earns that state from the pooled statistics
of all its instances.

Volume: ~80,000 templates serving effectively unlimited instances (~13% of served activities).

Slot-fill constraints, enforced at fill time not generation time:
- every slot value drawn from a pre-approved, level-frequency-checked lexicon
- slot values may not alter sentence length beyond the spec's range
- slot values may not introduce above-ceiling vocabulary
- slot values pass the topic allow/deny and safety filters
- the filled instance is re-measured for readability; out-of-band fills are discarded and refilled

### T3 — Real-Time Free-Form

Genuinely novel generation for one learner: conversation turns, personalised speaking prompts,
personalised writing prompts, contextual worked examples, remediation explanations.

**Constraint: T3 content is evidence-light by construction.** It updates Elo (ability — cheap to be
slightly wrong about, self-correcting) and it updates engagement and fluency signals. It does
**not** update BKT mastery posteriors, and it can **never** satisfy a `Mastered` gate — not
`productive_evidence`, not `transfer_evidence`, not the format-diversity count.

This is not a limitation being apologised for; it is the correct treatment. T3's value is
engagement, fluency practice, and conversational volume — none of which require a mastery claim.
The moment something needs to *count*, it must come from T1, T2, or T2P.

Volume: ~7% of served activities, matching the Phase 6 §6.7 live-generation budget.

### Serving mix and its consequence

| Tier | Share of served activities | Share of mastery-bearing evidence |
|---|---|---|
| T1 | ~3% | ~8% (over-weighted: assessments and milestones) |
| T2 | ~52% | ~62% |
| T2P | ~38% | ~30% |
| T3 | ~7% | **0%** |

93% of served activities can bear mastery evidence, and 100% of mastery evidence comes from
calibrated sources. That is the quantitative form of the Phase 11 §11.2 claim.

---

## 14.3 The generation request

Every generation call carries the complete address. No field is optional.

```jsonc
{
  "tier": "TIER2_GENERATED",
  "specKey": "wl:WORD/vocab-depth/synonym-in-context@2.2/select-fitting-synonym/LO-1/context-cloze/D3/GR_1_3",
  "specVersion": 3,

  // Curriculum address — FK-validated before the model is called
  "competencyId": "wl:WORD/vocab-depth/synonym-in-context@2.2",
  "competencyVersion": 3,
  "microSkillId": "...select-fitting-synonym",
  "conceptId": "concept:lex.synonymy",
  "learningOutcomeId": "LO-1",
  "levelId": "2.2",
  "pillar": "WORD",
  "band": "D3_INDEPENDENT",
  "gradeCategory": "GR_1_3",

  // Compiled constraints — copied verbatim from the spec, not restated by the caller
  "vocabularyConstraints": { "ceiling": 2500, "...": "..." },
  "grammarConstraints":    { "maxSentenceLen": 9, "maxClauseDepth": 2, "...": "..." },
  "cognitiveDemand":       { "bloomPrimary": "apply", "inferenceSteps": 2 },
  "scaffolding":           { "scaffoldCount": 0, "hintPolicy": "on-request" },
  "distractorPolicy":      { "count": 3, "mustMapToMisconception": 2, "nonTargetControls": 1 },
  "misconceptionTargets":  [{ "code": "SYN_INTERCHANGEABLE", "role": "distractor", "minCount": 2 }],
  "contextRules":          { "topicAllowlist": ["animals","family","school","..."] },
  "safetyRules":           { "...": "..." },
  "expectedAnswerCharacteristics": { "correctness": "exactly-one-defensible" },

  // Anchoring
  "promptTemplateId": "pt.context-cloze.v4",
  "goldenExemplars":   [ /* full payloads, few-shot */ ],
  "negativeExemplars": [ /* full payloads, "do not produce anything like these" */ ],

  // Personalisation (T2P / T3 only)
  "learnerInterests": ["football", "space"],
  "targetErrorPatterns": ["SYN_WRONG_DIMENSION"],
  "avoidContentHashes": [ /* recently seen */ ],

  // Bookkeeping
  "itemCount": 8,
  "model": "claude-opus-5",
  "requestId": "..."
}
```

**The model is never asked what comes next.** It is asked to instantiate a node that already
exists. This single property is the whole safety argument for AI content in WizLingo: the generator
is a renderer, not a planner, and a renderer cannot drift the curriculum because it never sees the
curriculum's shape.

---

## 14.4 The 10-stage validation pipeline

The existing **seven gates** (Phase 9 §9.2) are retained unchanged. Three stages are added around
them. No duplicate validation system is created.

```
AI GENERATES
     ↓
 ⓪  SCHEMA VALIDATION            ← NEW (pre-gate, cheap, fails fast)
     ↓
 ①  CURRICULUM VALIDATION        ← existing Gate 1
     ↓
 ②  AGE VALIDATION               ← existing Gate 2
     ↓
 ③  DIFFICULTY VALIDATION        ← existing Gate 3   (vocabulary + grammar + readability)
     ↓
 ④  LANGUAGE ACCURACY            ← existing Gate 4
     ↓
 ⑤  ANSWER-KEY VALIDATION        ← existing Gate 5
     ↓
 ⑥  BIAS & SAFETY                ← existing Gate 6   (batch-level for representation)
     ↓
 ⑦  LEARNING-OBJECTIVE VALIDITY  ← existing Gate 7
     ↓
 ⑧  GOLDEN COMPARISON            ← NEW  (Phase 13 §13.5 Role 2)
     ↓
 ⑨  RISK CLASSIFICATION          ← NEW  (computed, Phase 15 §15.5)
     ↓
 HUMAN REVIEW if risk requires
     ↓
 APPROVED → TrustState = QUARANTINED
     ↓
 CALIBRATING → TRUSTED           (§14.6, automated)
     ↓
 MONITORED continuously
```

### Mapping the brief's requested stages onto the existing gates

The brief lists vocabulary and grammar validation as separate stages. They are already inside
Gate 3, which is deterministic measurement — splitting them would create two systems measuring the
same thing with a risk of divergence. Explicit mapping:

| Brief's stage | Implemented as |
|---|---|
| Schema Validation | **Stage 0 (new)** |
| Curriculum Alignment | Gate 1 |
| Age Validation | Gate 2 |
| Difficulty Validation | Gate 3 (band consistency, cognitive-tier estimate, text length) |
| Language Accuracy | Gate 4 |
| Grammar Validation | Gate 3 (structural bounds) + Gate 4 (grammaticality) |
| Vocabulary Validation | Gate 3 (frequency ceiling, affix allowlist, morphological load) |
| Safety / Bias | Gate 6 |
| Assessment Validity | Gate 5 (key correctness) + Gate 7 (construct validity) |
| Golden Content Comparison | **Stage 8 (new)** |
| Risk Classification | **Stage 9 (new)** |
| Human Review if required | Phase 15 §15.7 |

### Stage 0 — Schema Validation (new)

Cheapest gate, runs first, catches the majority of malformed generations before any model call:

| Check | Reject if |
|---|---|
| Parseability | output is not valid JSON matching the template's item schema |
| Required fields | any field required by `ActivityTemplate` is absent |
| Cardinality | option count ≠ `distractorPolicy.count + 1`; item count ≠ requested |
| Type conformance | key is not one of the options; audio ref malformed; span offsets invalid |
| Slot completeness (T2P) | any declared slot unfilled or filled with an out-of-lexicon value |
| Duplicate detection | `contentHash` already exists, or ≥0.9 similarity to an existing pool item |

The duplicate check matters more than it looks: an uncontrolled generator asked for 400 synonym
items will produce substantial near-duplication, which silently destroys the format-diversity and
transfer gates by making "different items" effectively the same item.

### Stage 8 — Golden Comparison (new)

Measured divergence from the expert-approved golden set for this spec, on the six dimensions in
Phase 13 §13.5 Role 2. Reject when any dimension exceeds tolerance, naming the dimension.

Falls back gracefully: if no golden content exists for this exact `(competency, template, band)`,
compare against `(competency, template)`, then `(competency)`. If none exists at all, the stage is
skipped and the item's risk tier is raised one level — an item with no anchor is inherently less
trustworthy, and the pipeline should say so rather than pretending the stage passed.

### Stage 9 — Risk Classification (new)

Computes `riskTier ∈ {LOW, MEDIUM, HIGH}` from content class, novelty, and the live health score.
This determines whether human review is required. Fully specified in
[Phase 15 §15.5](15_HUMAN_REVIEW_GOVERNANCE.md#155-risk-is-computed-not-assigned).

---

## 14.5 Calibrating the validators

A validation pipeline that has never been tested is not a control. Before any validator
configuration — model, prompt, threshold set — is promoted to production, it runs against the
golden corpus:

```
CALIBRATION RUN
  inputs:  all GoldenExemplar(role = ANCHOR|COMPARISON) as expected-ACCEPT
           all ContractExemplar(kind = NON_EXEMPLAR)    as expected-REJECT

  required:
    accept_rate(expected-ACCEPT)      ≥ 0.95
    reject_rate(expected-REJECT)      ≥ 0.90
    reason_code_accuracy(rejects)     ≥ 0.80
    per-gate false-positive rate      ≤ 0.05
```

| Failure mode | Symptom | Consequence if shipped |
|---|---|---|
| Over-tight | rejects golden content | Content pool starves; generation cost multiplies; specs go unfilled and learners see repeats |
| Over-loose | accepts non-exemplars | Broken items reach learners; mastery data corrupts |
| Right verdict, wrong reason | rejects correctly but mis-attributes the gate | Generator is re-prompted for the wrong problem; rejection rate stays high and nobody knows why |

The third failure mode is the subtle one, and it is why `reason_code_accuracy` is a separate
threshold. A pipeline that rejects the right items for the wrong reasons produces an endless
re-prompting loop that looks like a model quality problem and is actually a validator problem.

Calibration is re-run on: any validator model change, any prompt template version bump, any
threshold change, any golden content version bump, and on a monthly schedule regardless. Results
are stored per run and drift is tracked — a validator whose accept rate on golden content declines
over time is degrading, and that is detectable only because the golden corpus is fixed.

**Gate 5 and Gate 7 use an independent solver.** A second model attempts each item without seeing
the key (Gate 5) and while explicitly denied the target skill (Gate 7). Disagreement between
generator and solver routes to human review rather than being auto-resolved — the disagreement is
itself the signal, and auto-resolving it would discard the most informative event in the pipeline.

---

## 14.6 The trust lifecycle in operation

Specified in Phase 11 §11.4. Implementation detail here.

### State transitions

```prisma
enum TrustState {
  QUARANTINED    // serving to ≤2% cohort; NO mastery contribution
  CALIBRATING    // serving to ≤20%; mastery at 0.5 weight; cannot satisfy Mastered gates
  TRUSTED        // unrestricted; full mastery weight
  DEPRECATED     // withdrawn
}
```

Nightly job, per content item (or per T2P template):

```
QUARANTINED → CALIBRATING
    attempts ≥ 30 AND abandon_rate < 0.15
    AND mean_latency < 3 × format_median AND learner_reports = 0

CALIBRATING → TRUSTED
    attempts ≥ 100
    AND point_biserial(item_correct, microskill_mastery) ≥ 0.15
    AND p_value ∈ [0.35, 0.90] for declared band
    AND no distractor chosen by > 40% of learners with mastery ≥ PROFICIENT
    AND (if RUBRIC_LLM) human_audit_agreement ≥ 0.75 on ≥5 sampled items

any → DEPRECATED  (automatic, no approval needed)
    discrimination < 0.05 with attempts ≥ 100
    OR p_value < 0.20 or > 0.97 with attempts ≥ 100
    OR learner/teacher reports ≥ 3
    OR abandon_rate > 0.30
    OR its ContentSpecification version was superseded with a boundary tightening
```

T1 canonical content enters at `TRUSTED` (expert authorship substitutes for calibration) but is
**still measured**, and still auto-retires on the DEPRECATED conditions. An expert-authored item
with 0.02 discrimination is a broken item regardless of who wrote it, and the pipeline says so.

### Enforcement in the mastery engine

Two independent mechanisms, so a bug in one does not defeat the guarantee:

1. `Attempt.contentTrustState` is stamped at **serve time**, not read at inference time. The BKT
   update path filters `contentTrustState = TRUSTED` (full weight) or `CALIBRATING` (0.5 weight),
   and sets `excludedFromMastery = true` for `QUARANTINED` and for all T3.
2. The `Mastered` gate evaluator independently requires that every gate-satisfying attempt —
   `productive_evidence`, `transfer_evidence`, each of the ≥3 distinct formats — come from
   `TRUSTED` content. A quarantined attempt cannot accidentally satisfy a gate even if mechanism 1
   mis-weighted it.

### Blast radius

| Scenario | Bounded consequence |
|---|---|
| A broken item passes all 10 stages | Reaches ≤2% of eligible learners; cannot alter any mastery state; retires within ~30 attempts |
| An entire spec's pool is bad | Health score drops; family escalates to HIGH risk; auto-publishing halts (Phase 15 §15.6) |
| A prompt regression ships | Golden calibration catches it pre-production; if it slips, per-item statistics catch it within a day |
| A validator degrades | Monthly golden re-calibration catches it; rejection-rate anomaly alerts sooner |
| A boundary is tightened retroactively | Recompilation flags every violating item; they move to `CALIBRATING`, not deleted; learner history preserved |

---

## 14.7 Provenance

Every content instance is traceable through the full chain. This is not a debugging convenience —
it is an educational accountability requirement. A school, a board, or an academic partner must be
able to ask "on what authority was my child shown this?" and receive a complete answer.

```
CurriculumRelease  v2026.09.1
   └─ Competency    wl:WORD/vocab-depth/synonym-in-context@2.2  v3
        └─ MicroSkill     select-fitting-synonym                v3
             └─ LearningOutcome  LO-1
                  └─ ContentSpecification  <specKey>            v3
                       ├─ compiledFrom: LevelDefaults v2, GroupPolicy v1,
                       │                GlobalPolicy v4, template v2, compiler 1.2.0
                       ├─ PromptTemplate  pt.context-cloze.v4
                       ├─ GoldenExemplars gx.syn-2.2.d3.{001,002,003} v1
                       └─ GenerationRequest  <requestId>
                            ├─ model: claude-opus-5
                            ├─ config: { temperature, seed, maxTokens }
                            ├─ ValidationReport: 10 stages, per-stage verdict + measurements
                            ├─ ReviewRecord: reviewers, roles, checklist results, decision
                            └─ Content  <contentHash>  v1
                                 ├─ TrustState history with timestamps
                                 ├─ ItemStatistics: p-value, discrimination, latency, abandon
                                 └─ Attempts (append-only)
```

```prisma
model ContentProvenance {
  id        String @id @default(cuid())
  contentId String @unique

  curriculumReleaseVersion String
  competencyId      String
  competencyVersion Int
  microSkillId      String
  microSkillVersion Int
  learningOutcomeId String
  specKey           String
  specVersion       Int
  compiledFrom      Json          // all upstream versions
  promptTemplateId  String
  promptTemplateVersion Int
  goldenExemplarIds String[]
  goldenExemplarVersions Int[]

  generationRequestId String?
  model             String?
  modelVersion      String?
  generationConfig  Json?

  validationReportId String
  reviewRecordIds   String[]

  publishedAt   DateTime?
  publishedVersion Int

  @@index([competencyId, competencyVersion])
  @@index([specKey, specVersion])
  @@index([model, modelVersion])
}

model ValidationReport {
  id        String @id @default(cuid())
  contentId String?
  generationRequestId String?
  stageResults Json      // [{ stage: 0..9, verdict, measurements, violations[], reasonCodes[] }]
  overallVerdict String  // APPROVED | REJECTED | NEEDS_REVIEW
  rejectionReasonCodes String[]
  riskTier  String
  validatorConfigId String            // which validator configuration ran
  durationMs Int
  createdAt DateTime @default(now())
  @@index([overallVerdict, createdAt])
  @@index([validatorConfigId])
}

model ItemStatistics {
  contentId String @id
  templateId String
  specKey    String
  attempts   Int    @default(0)
  correctCount Int  @default(0)
  pValue     Float?
  discrimination Float?              // point-biserial vs. micro-skill mastery
  meanLatencyMs Int?
  abandonRate Float?
  distractorDistribution Json?
  highMasteryDistractorRate Float?   // key-error detector
  reportCount Int    @default(0)
  humanAuditAgreement Float?
  lastRecomputedAt DateTime @default(now())
  @@index([specKey, discrimination])
  @@index([templateId, pValue])
}
```

---

## 14.8 Telemetry

Every published item emits the following, per the brief's §18 requirement. Assembled from
`ContentProvenance`, `ValidationReport`, `ItemStatistics`, and `Attempt` — no new store.

| Field | Source |
|---|---|
| generation model + version | `ContentProvenance.model`, `.modelVersion` |
| prompt template + version | `.promptTemplateId`, `.promptTemplateVersion` |
| spec version | `.specKey`, `.specVersion` |
| competency + version | `.competencyId`, `.competencyVersion` |
| micro-skill id | `.microSkillId` |
| difficulty band | `Content.band` |
| learner cohort | aggregated from `Attempt` (grade category, level, region — never individuals) |
| validation results | `ValidationReport.stageResults` |
| human review status | `.reviewRecordIds` → `ReviewTask.decision` |
| trust state history | `Content.trustStateHistory` |
| student performance | `ItemStatistics` |
| rejection / report status | `ItemStatistics.reportCount`, `ValidationReport.rejectionReasonCodes` |

### What the telemetry is used for

Not dashboards for their own sake. Four specific decisions:

1. **Item retirement** — automatic, from `ItemStatistics` (§14.6).
2. **Generator selection** — rejection rate and downstream discrimination by `(model, promptTemplate)`
   determines which configuration generates which content class. A prompt template whose items
   average 0.09 discrimination is replaced regardless of how well it passes validation.
3. **Curriculum health** — aggregated to competency level (Phase 15 §15.9), which drives risk tier,
   sampling rate, and expert attention.
4. **Change proposals** — anomaly patterns become `CurriculumChangeProposal` rows for human
   adjudication (Phase 15 §15.10).

The second use is worth naming explicitly: **validation pass rate is a weak quality signal;
downstream item discrimination is a strong one.** A generator configuration can be tuned to pass
gates while producing pedagogically inert items. Only learner evidence separates the two, which is
why the calibration loop and not the validation loop is the ultimate arbiter of generator quality.

---

## 14.9 Data model additions

```prisma
// Revised — maps the legacy 3 values onto the 4 tiers
enum ContentTier {
  TIER1_CANONICAL          // was CURATED
  TIER2_GENERATED          // was AI_VARIATION
  TIER2P_PARAMETERIZED     // NEW
  TIER3_REALTIME           // was AI_PERSONALIZED
}

model Content {
  // ... existing Phase 8 §8.3 fields retained ...

  trustState        TrustState @default(QUARANTINED)
  trustStateHistory Json       // [{ state, at, reason, attemptsAtTransition }]
  specKey           String
  specVersion       Int
  riskTier          String     // LOW | MEDIUM | HIGH — computed at Stage 9, recomputed nightly
  parentTemplateId  String?    // T2P: which validated template produced this instance
  slotValues        Json?      // T2P: the fill, for audit and duplicate detection

  provenance     ContentProvenance?
  statistics     ItemStatistics?
  specification  ContentSpecification @relation(fields: [specKey], references: [specKey])

  @@index([specKey, trustState])
  @@index([trustState, riskTier])
}

model ParameterizedTemplate {
  id         String @id
  specKey    String
  body       Json               // stem with typed slots
  slotDefs   Json               // [{ name, lexiconId, posConstraint, maxLenDelta }]
  trustState TrustState @default(QUARANTINED)
  statistics Json               // pooled across all instances — this is what calibrates
  version    Int    @default(1)
  status     ContentStatus @default(DRAFT)
  @@index([specKey, trustState])
}

model Attempt {
  // ... existing Phase 8 §8.4 fields retained ...
  contentTrustState TrustState        // stamped at SERVE time, not read at inference time
  contentTier       ContentTier
  specKey           String?
  masteryWeight     Float   @default(1.0)   // 1.0 TRUSTED · 0.5 CALIBRATING · 0.0 otherwise
  @@index([studentId, contentTrustState, createdAt])
}
```

`Attempt.masteryWeight` being materialised rather than computed at read time is deliberate: it
makes the mastery engine's behaviour reproducible from the historical record even after an item's
trust state later changes. Recomputing mastery from `Attempt` (the Phase 9 §9.4 rebuild guarantee)
must reproduce the *original* decision, not a retroactively different one.
