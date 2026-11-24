# PHASE 17 — Learning Outcome Contracts

**The Competency Contract governs what may be *generated*.
The Learning Outcome Contract governs what may be *counted*.**

---

## 17.1 The distinction

| | **Competency** | **Learning Outcome** |
|---|---|---|
| Answers | What should the learner ultimately be capable of? | What observable behaviour should occur after *this particular* learning experience? |
| Scope | Spans many learning experiences, weeks of practice | One interaction, one observation |
| Time | Level-scoped (10–16 weeks of dwell) | 20–90 seconds |
| Verified by | Accumulated evidence across formats, sessions, and time | A single scored observation |
| Owner | Curriculum Architect + Language Expert | **Assessment Expert** |
| Governs | Generation boundaries | **Evidence admissibility** |
| Failure means | The learner lacks a capability | This observation did not occur, or could not be validly interpreted |

The `LearningOutcome` entity already exists (Phase 8 §8.2) as `Given / When / Then` plus a numeric
threshold. That was sufficient while the architecture assumed items were mostly self-scoring. It is
**not** sufficient now, for one reason: the Competency Contract constrains generation with great
precision, and nothing constrains *scoring* with comparable precision. For speaking and writing —
where the `productive_evidence` mastery gate lives — that asymmetry is the weakest point in the
whole design.

The Learning Outcome Contract closes it. It is an **extension of the existing entity**, not a new
one, consistent with the no-duplication discipline of Phase 12 §12.2.

---

## 17.2 Why this matters most for productive skills

For a 4-option selection item, "observable behaviour" is trivially specified: an option was chosen.
The evidence signature is `(optionId, latencyMs)`. Nothing needs to be said in advance.

For a speaking task at Level 4.1, "the learner delivers a 6-minute talk with deliberate delivery
choices," the observable is 6 minutes of audio. Without an advance specification:

- the scorer decides for itself which dimensions matter, and drifts;
- the mastery engine receives a number with no attribution, so it cannot route the evidence to a
  micro skill;
- a partial score of 0.62 means nothing — it is not decomposable into what went well and what did not;
- there is no definition of when the observation is *invalid* (clipped audio, 40 seconds instead of
  6 minutes, the learner read a script aloud), so invalid observations silently become evidence;
- and nothing states which mastery gates this observation may satisfy, so an ASR-scored fluency
  reading could accidentally satisfy `productive_evidence` for a *composition* micro skill.

Every one of those is a real failure and every one is prevented by specifying the observation in
advance. That specification is the Learning Outcome Contract.

---

## 17.3 The chain, with Observation named

Per the refinement to the hierarchy:

```
COMPETENCY               what the learner should ultimately do
      ↓
MICRO SKILL              the smallest teachable, independently assessable unit
      ↓
LEARNING OUTCOME         the observable behaviour expected from one experience   ← Phase 17
      ↓
CONTENT SPECIFICATION    the exact constraints for generating an instrument      ← Phase 13
      ↓
AI CONTENT               the instrument instance
      ↓
OBSERVABLE BEHAVIOUR     what the learner actually did — raw, immutable         ← §17.4
      ↓
EVIDENCE                 the scored interpretation — derived, re-derivable      ← §17.4
      ↓
MASTERY                  the inference across accumulated evidence
```

Naming `OBSERVABLE BEHAVIOUR` as its own step is not decoration. It forces a separation that the
architecture needed and did not have.

---

## 17.4 Observation ≠ Evidence

`Attempt` (Phase 8 §8.4) already stores both halves. They are now named, and the distinction is
made load-bearing:

| | **Observation** | **Evidence** |
|---|---|---|
| Is | What the learner did | What it means for mastery |
| Fields | `rawResponse`, `asrOutput`, audio/text artefact, `latencyMs`, `hintsUsed`, `retryCount` | `score`, `rubricScores`, `errorCodes`, `masteryWeight`, gate eligibility flags |
| Mutability | **Immutable, append-only** | **Derived, re-derivable** |
| Produced by | The learner | A scorer (exact / ASR / rubric / human) |
| Validity | Governed by `observationConditions` (§17.6) | Governed by the scorer + trust state |

### The property this buys: re-scoring

Because Observation is immutable and Evidence is derived, **improving a scorer retroactively
improves every historical judgement.** When the writing rubric scorer is recalibrated, or the ASR
model upgraded, the system can re-score stored observations and recompute mastery from the improved
evidence — without asking learners to redo anything.

This matters more than it sounds. The `productive_evidence` gate depends entirely on rubric and ASR
scoring quality, which is the least mature part of the stack and the part most likely to improve.
Without the split, every improvement leaves a legacy of poorly-scored evidence permanently baked
into learner mastery records. With it, mastery estimates get *better over time* on the same
observations.

Re-scoring is governed: it is a MAJOR revision (Phase 15 §15.3), requires the grandfathering rule,
and must preserve the Phase 15 progress-preservation invariant — a re-score may not reduce a
learner's recorded state at the moment it is applied.

```prisma
model Attempt {
  // ... existing fields ...

  // ── OBSERVATION (immutable) ──
  observationArtefactRef String?   // audio/text blob reference for productive tasks
  observationValid       Boolean @default(true)
  observationInvalidReason String?  // failed an observationCondition — recorded, not scored
  observedAt             DateTime @default(now())

  // ── EVIDENCE (derived; may be recomputed) ──
  scorerId       String            // which scorer produced this evidence
  scorerVersion  String
  scoredAt       DateTime @default(now())
  rescoreOf      String?           // prior Evidence row this supersedes
  evidenceSignature Json           // the LO-declared signature, populated

  @@index([studentId, observationValid, createdAt])
  @@index([scorerId, scorerVersion])
}
```

An invalid observation is **stored and never scored**. It is not a failure and does not count
against the learner — the Phase 6 §6.3 rule for low ASR confidence already works this way, and the
contract now generalises it to every productive format.

---

## 17.5 Contract fields

```prisma
enum BehaviourClass {
  RECOGNISE     // select, match, identify           — low information, high guess rate
  RECALL        // produce from memory, no options
  TRANSFORM     // convert one form to another        — deterministic key possible
  CONSTRUCT     // build a response within constraints
  PRODUCE       // open production: speech or writing — carries productive_evidence
  PERFORM       // sustained production under conditions (timed, audience, unscripted)
  EXPLAIN       // articulate reasoning about language — metalinguistic
  CREATE        // original artefact                  — terminal, human-reviewed
}

model LearningOutcome {
  // ── existing fields retained ──
  id           String @id @default(cuid())
  microSkillId String
  code         String
  givenClause  String @db.Text
  whenClause   String @db.Text
  thenClause   String @db.Text
  threshold    Json

  // ── CONTRACT EXTENSIONS ──

  behaviourClass BehaviourClass
  isCompound     Boolean @default(false)   // must be false to reach APPROVED (§17.8)

  // What the system will actually see. Declared in advance.
  evidenceSignature Json
  // e.g. PRODUCE/writing:
  // { artefact: "text", minLength: 25, maxLength: 120,
  //   dimensions: [
  //     { id: "task",       weight: 0.25, scale: [0,5], mapsTo: "ms.syn.use-in-own-sentence" },
  //     { id: "accuracy",   weight: 0.35, scale: [0,5], mapsTo: "ms.gram.sva-present" },
  //     { id: "lexis",      weight: 0.25, scale: [0,5], mapsTo: "ms.syn.use-in-own-sentence" },
  //     { id: "mechanics",  weight: 0.15, scale: [0,5], mapsTo: "ms.mech.end-punctuation" }
  //   ],
  //   spanAnnotationsRequired: true,
  //   requiredAnnotationTargets: ["ms.syn.use-in-own-sentence"] }

  // When is an observation valid at all?
  observationConditions Json
  // { minResponseLengthChars: 25, maxLatencyMs: 240000,
  //   asrConfidenceFloor: 0.60, minAudioSeconds: 8, maxSilenceRatio: 0.45,
  //   requiresNoHintDisclosure: true, rejectIfCopiedFromPrompt: true,
  //   rejectIfNgramOverlapWithSource: 0.35 }

  // What a partial score means — decomposed, not a single number
  partialCreditModel Json
  // { method: "weighted-dimensions" | "kendall-tau" | "phoneme-coverage" | "binary",
  //   floorForEvidence: 0.30,      // below this, scored but weight → 0.25
  //   dimensionMinima: { accuracy: 2 } }   // a hard floor on one dimension

  // Which wrong behaviours reveal which misconceptions
  diagnosticResponseMap Json
  // [{ responsePattern: "selects a true synonym failing on another dimension",
  //    detector: "option ∈ trueSynonyms ∧ option ∉ key",
  //    revealsMisconception: "SYN_INTERCHANGEABLE",
  //    emitsErrorCode: "SYN_WRONG_DIMENSION" }]

  // ★ What must NOT be counted — see §17.7
  nonEvidence Json
  // { mayNotSatisfyGates: ["productive_evidence", "transfer_evidence"],
  //   mayNotEvidenceMicroSkills: ["ms.syn.use-in-own-sentence"],
  //   rationale: "recognition of a fitting synonym is not production of one" }

  // Evidence strength and gate eligibility
  evidenceWeight    Float   @default(1.0)
  satisfiableGates  String[]   // ["productive_evidence"] | ["transfer_evidence"] | []
  guessRateCeiling  Float?     // max P(G) of any format permitted to serve this outcome

  // Calibration binding — Phase 18
  calibrationPolicyId String?

  // Lifecycle
  contractStatus  ContractStatus @default(SKELETON)
  contractVersion Int @default(1)
  approvals       LearningOutcomeApproval[]

  microSkill MicroSkill @relation(fields: [microSkillId], references: [id])
  specs      ContentSpecification[]

  @@unique([microSkillId, code])
  @@index([behaviourClass, contractStatus])
}

model LearningOutcomeApproval {
  id        String @id @default(cuid())
  outcomeId String
  reviewerId String
  role      String            // ASSESSMENT expert required; LANGUAGE for PRODUCE/PERFORM
  decision  String
  checklistResults Json
  contractVersionReviewed Int
  decidedAt DateTime @default(now())
  @@unique([outcomeId, reviewerId, contractVersionReviewed])
}
```

---

## 17.6 `observationConditions` — validity before scoring

The field that prevents invalid observations becoming evidence. Currently the system handles one
case (ASR confidence <0.6, Phase 6 §6.3). Generalised:

| Condition | Guards against | Applies to |
|---|---|---|
| `minResponseLengthChars` | one-word answers to a paragraph prompt scoring as "weak writing" rather than "not attempted" | CONSTRUCT, PRODUCE |
| `minAudioSeconds`, `maxSilenceRatio` | a 3-second utterance for a 2-minute task; dead air | PRODUCE, PERFORM |
| `asrConfidenceFloor` | noise, clipping, wrong microphone | anything ASR-scored |
| `requiresNoHintDisclosure` | full-hint-then-correct counting as independent performance | all bands ≥D3 |
| `rejectIfCopiedFromPrompt` / `rejectIfNgramOverlapWithSource` | copy-paste writing (Phase 5 §5.8) | PRODUCE |
| `maxLatencyMs` | abandoned-then-resumed sessions scoring as slow performance | all |
| `requiresScriptedReadingCheck` | a "spontaneous talk" that is a script read aloud — detectable from prosody regularity | PERFORM |

The design rule: **an invalid observation is stored, flagged, and excluded — never scored, never
penalised, and never silently treated as a low score.** Conflating "did not validly attempt" with
"attempted badly" is the single most common way productive-skill data gets corrupted, and it biases
against exactly the learners with poor devices and noisy home environments.

---

## 17.7 `nonEvidence` — the field that makes "correct answer isn't enough" machine-readable

Every other field says what *does* count. This one says what does not, and it is the sharpest
expression of the productive-skills problem.

Worked case — the same micro skill, two outcomes:

```yaml
# LO-1 — recognition
behaviourClass: RECOGNISE
evidenceSignature: { artefact: "optionId", dimensions: [] }
evidenceWeight: 1.0
satisfiableGates: []                       # ← satisfies NO gates
guessRateCeiling: 0.25
nonEvidence:
  mayNotSatisfyGates: [productive_evidence, transfer_evidence]
  mayNotEvidenceMicroSkills: [ms.syn.use-in-own-sentence]
  rationale: >
    Selecting the fitting synonym from four options evidences discrimination, not
    production. A learner may reliably recognise the right word and be unable to
    retrieve it unprompted. Counting this toward productive use would let the
    Mastered gate be satisfied without the learner ever having produced the word.

# LO-3 — production, same micro skill family
behaviourClass: PRODUCE
evidenceSignature:
  artefact: text
  minLength: 25
  dimensions:
    - { id: task,     weight: 0.40, mapsTo: ms.syn.use-in-own-sentence }
    - { id: accuracy, weight: 0.35, mapsTo: ms.gram.sva-present }
    - { id: lexis,    weight: 0.25, mapsTo: ms.syn.use-in-own-sentence }
  spanAnnotationsRequired: true
  requiredAnnotationTargets: [ms.syn.use-in-own-sentence]
evidenceWeight: 1.6                        # productive evidence is worth more
satisfiableGates: [productive_evidence]
nonEvidence:
  mayNotSatisfyGates: [transfer_evidence]
  rationale: >
    Written in the taught context on a taught topic. Transfer requires an
    unfamiliar context, which is a separate outcome (LO-4) at band D5.
```

This is enforced structurally: the `Mastered` gate evaluator (Phase 5 §5.1) reads
`satisfiableGates` from the outcome that produced each attempt. An outcome with
`satisfiableGates: []` **cannot** contribute to a gate regardless of score, format, or trust state.
Three independent mechanisms now protect the productive-evidence gate — guess-rate arithmetic
(Phase 5 §5.2), trust state (Phase 14 §14.6), and outcome-declared eligibility.

`requiredAnnotationTargets` is the enforcement of Phase 5 §5.7's rule that unattributed rubric
scores are discarded for mastery. It is now declared per outcome rather than left as a global
convention, so the scorer's obligation is explicit and checkable.

---

## 17.8 Compound outcomes must be split

The most common authoring error, and it silently destroys diagnostic value. Worth working through,
because a well-intentioned compound outcome looks perfectly reasonable:

> *"Given a familiar context, the learner selects an appropriate synonym and uses it correctly in
> an original sentence."*

This is pedagogically sound as a **goal**. As a *Learning Outcome Contract* it fails, because it
bundles two behaviours with incompatible evidence signatures:

| | Selection | Production |
|---|---|---|
| `behaviourClass` | RECOGNISE | PRODUCE |
| Evidence signature | `optionId` | text + 3 rubric dimensions + span annotations |
| Scoring method | `EXACT` | `RUBRIC_LLM` |
| `P(G)` | 0.25 | 0.01 |
| Satisfiable gates | none | `productive_evidence` |
| Observation conditions | latency only | length, copy-detection, annotation targets |

Bundled, three things break:

1. **Failure is unattributable.** A learner scoring 0.5 might have selected correctly and written
   badly, or selected wrongly and written well. The BKT update is a coin flip on which micro skill
   to move.
2. **The gate is corrupted.** If the compound outcome declares `productive_evidence`, then a learner
   who selects correctly and writes a fragment still contributes productive evidence.
3. **Remediation is blind.** The engine cannot tell whether to work on discrimination or retrieval —
   which are different interventions with different content.

Split:

```yaml
LO-1: behaviourClass RECOGNISE  → selects the fitting synonym          (satisfiableGates: [])
LO-2: behaviourClass EXPLAIN    → states why the others fail            (satisfiableGates: [])
LO-3: behaviourClass PRODUCE    → uses it in an original sentence       (satisfiableGates: [productive_evidence])
LO-4: behaviourClass PRODUCE    → uses it in an unfamiliar context      (satisfiableGates: [productive_evidence, transfer_evidence])
```

**The learner experience is unchanged.** A single activity can still present all of this as one
task — select the word, then write a sentence with it. The composite activity is *scored against
four outcomes simultaneously*, each routing its own evidence to its own node. Rich activity, atomic
inference — exactly the pattern Phase 4 §4.4 established for micro skills, now applied to outcomes.

`isCompound` is detected automatically at the completeness gate: an outcome whose `thenClause`
contains a coordinating conjunction joining two verb phrases, or whose `evidenceSignature` declares
dimensions with more than one `scoringMethod`, is flagged and must be split before approval.

---

## 17.9 Worked contracts

### A — Receptive, Level 2.2

```yaml
id: LO-1
microSkillId: wl:WORD/vocab-depth/synonym-in-context@2.2/select-fitting-synonym
code: LO-1
behaviourClass: RECOGNISE
isCompound: false

givenClause: "a 6–9 word sentence with one highlighted word and 4 options, all true synonyms
              of the highlighted word, of which exactly one fits the sentence"
whenClause:  "asked to choose the option that fits this sentence"
thenClause:  "selects the fitting option"
threshold:   { accuracy: 0.83, minItems: 6, medianLatencyMs: 12000 }

evidenceSignature:
  artefact: optionId
  dimensions: []
  captures: [optionId, latencyMs, hintsUsed]

observationConditions:
  maxLatencyMs: 60000
  requiresNoHintDisclosure: true      # at band ≥D3
  minLatencyMs: 800                   # below this = rapid guessing, invalid not wrong

partialCreditModel: { method: binary }

diagnosticResponseMap:
  - detector: "option ∈ trueSynonyms ∧ option ≠ key"
    revealsMisconception: SYN_INTERCHANGEABLE
    emitsErrorCode: SYN_WRONG_DIMENSION
  - detector: "option = nonSynonymControl"
    revealsMisconception: null
    emitsErrorCode: LEX_UNKNOWN_WORD
    routesTo: wl:WORD/vocab-breadth/tier1-vocabulary@2.2   # not a synonymy problem

nonEvidence:
  mayNotSatisfyGates: [productive_evidence, transfer_evidence]
  mayNotEvidenceMicroSkills: [use-synonym-in-own-sentence]
  rationale: "recognition ≠ production; see §17.7"

evidenceWeight: 1.0
satisfiableGates: []
guessRateCeiling: 0.25
calibrationPolicyId: cp.recognise.mcq4.standard
```

The `diagnosticResponseMap` is what makes this item diagnostic rather than merely scored: choosing
`tall` and choosing `loud` are both wrong, and they mean entirely different things. The second
routes the learner out of synonymy work altogether.

### B — Productive, Level 4.1

```yaml
id: LO-2
microSkillId: wl:EXPRESSION/speaking-production/deliberate-delivery@4.1/control-pace-and-emphasis
code: LO-2
behaviourClass: PERFORM
isCompound: false

givenClause: "a prepared 6-minute talk topic at Grade-appropriate context, 10 minutes preparation,
              and a declared delivery intention stated by the learner in advance"
whenClause:  "the learner delivers the talk unscripted with notes permitted"
thenClause:  "sustains deliberate control of pace, pause, and emphasis such that measured delivery
              variation aligns with the stated intention"
threshold:   { rubricMin: 4.0, minDurationSeconds: 300, intentionAlignment: 0.70 }

evidenceSignature:
  artefact: audio
  minAudioSeconds: 300
  captures: [audioRef, asrTranscript, wordTimings, pitchContour, energyContour,
             pauseDistribution, speechRate, disfluencyMarkers]
  dimensions:
    - { id: pace-control,      weight: 0.25, scale: [0,5], mapsTo: control-pace-and-emphasis,
        measure: "speech-rate variance aligned to content structure" }
    - { id: pause-use,         weight: 0.25, scale: [0,5], mapsTo: control-pace-and-emphasis,
        measure: "pause placement at clause and rhetorical boundaries, not at retrieval failures" }
    - { id: emphasis,          weight: 0.20, scale: [0,5], mapsTo: control-pace-and-emphasis,
        measure: "energy/pitch prominence on content-critical words" }
    - { id: fluency,           weight: 0.15, scale: [0,5], mapsTo: ms.fluency.sustained@4.1 }
    - { id: intention-match,   weight: 0.15, scale: [0,5], mapsTo: ms.meta.calibration@4.1,
        measure: "stated intention vs. measured delivery" }
  spanAnnotationsRequired: true
  requiredAnnotationTargets: [control-pace-and-emphasis]

observationConditions:
  minAudioSeconds: 300              # a 90-second attempt is INVALID, not a low score
  maxSilenceRatio: 0.40
  asrConfidenceFloor: 0.55          # lower than word-level tasks; connected speech
  requiresScriptedReadingCheck: true   # prosodic regularity above threshold → invalid
  requiresDeclaredIntention: true      # no intention → intention-match cannot be scored

partialCreditModel:
  method: weighted-dimensions
  floorForEvidence: 0.35
  dimensionMinima: { fluency: 2 }   # below 2 on fluency, delivery scores are uninterpretable

diagnosticResponseMap:
  - detector: "pauseDistribution clusters before content words ∧ disfluency > 0.12"
    revealsMisconception: null
    emitsErrorCode: LEX_RETRIEVAL_BOTTLENECK
    routesTo: wl:WORD/vocab-breadth/productive-retrieval@4.1
    note: "pauses are retrieval failures, not rhetorical choices — a vocabulary problem
           presenting as a delivery problem"
  - detector: "speechRate variance < 0.05 ∧ intention declared 'varied pace'"
    emitsErrorCode: DELIVERY_MONOTONE
  - detector: "intentionAlignment < 0.3 with high absolute rubric scores"
    emitsErrorCode: META_MISCALIBRATION
    note: "delivers well but cannot describe own choices — metacognitive gap, not a delivery gap"

nonEvidence:
  mayNotSatisfyGates: [transfer_evidence]
  mayNotEvidenceMicroSkills: [ms.speaking.impromptu@4.1]
  rationale: >
    10 minutes of preparation on a chosen topic. Impromptu capability is a separate
    micro skill with its own outcome at band D5. A prepared talk must not evidence it.

evidenceWeight: 1.8                 # PERFORM at band D4 — strongest evidence class
satisfiableGates: [productive_evidence]
calibrationPolicyId: cp.perform.speaking-extended.rater-agreement
```

Three properties worth naming. The first `diagnosticResponseMap` entry catches a **misattribution
the system would otherwise make**: a learner pausing because they cannot retrieve a word looks
identical, on a delivery rubric, to a learner pausing for effect — and the remediation is
completely different. The `observationConditions` distinguish "did not attempt a 6-minute talk"
from "gave a poor 6-minute talk." And `calibrationPolicyId` points at a **rater-agreement** route
rather than a statistical one, because extended speaking tasks will never accumulate 100 attempts
per item (Phase 18).

---

## 17.10 Completeness gate

An outcome may not be referenced by a `ContentSpecification` unless `contractStatus = APPROVED`.

| # | Check | Blocks |
|---|---|---|
| 1 | `behaviourClass` declared | yes |
| 2 | `isCompound = false` — no coordinated verb phrases in `thenClause`; single `scoringMethod` across dimensions | yes |
| 3 | `evidenceSignature` present; every dimension has `weight`, `scale`, and `mapsTo` a real micro skill | yes |
| 4 | Dimension weights sum to 1.0 | yes |
| 5 | `observationConditions` present; ≥1 validity condition for CONSTRUCT/PRODUCE/PERFORM/CREATE | yes |
| 6 | `partialCreditModel` present; `method: binary` only permitted for RECOGNISE/TRANSFORM | yes |
| 7 | `diagnosticResponseMap` covers every `BLOCKING` misconception on the parent competency | yes |
| 8 | `nonEvidence.rationale` present whenever `satisfiableGates` is empty or narrower than the behaviour class would suggest | yes |
| 9 | `satisfiableGates` ⊆ what the behaviour class permits — RECOGNISE and RECALL may never declare `productive_evidence` | yes |
| 10 | `guessRateCeiling` ≥ the `P(G)` of every eligible format | yes |
| 11 | `spanAnnotationsRequired = true` for all RUBRIC-scored outcomes, with ≥1 `requiredAnnotationTarget` | yes |
| 12 | `calibrationPolicyId` resolves to an existing policy (Phase 18) | yes |
| 13 | Every micro skill has ≥1 outcome with `satisfiableGates` including `productive_evidence` (above Level 1.2) | warn at outcome level, **block at competency level** |

Check 9 is the structural guarantee: **a recognition outcome cannot declare productive evidence, at
the schema level.** Combined with the guess-rate arithmetic of Phase 5 §5.2 and the trust lifecycle
of Phase 14 §14.6, the productive-evidence gate now has three independent defences, none of which
relies on an author remembering the rule.

Approval requires the **Assessment Expert** (mandatory, veto-bearing) plus, for
PRODUCE/PERFORM/CREATE, a **Language Expert** on the evidence signature — because the dimensions of
a speaking or writing rubric are linguistic claims, not measurement claims.
