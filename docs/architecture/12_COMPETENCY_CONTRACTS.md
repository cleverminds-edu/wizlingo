# PHASE 12 — Competency Contracts

**The definition of "human-designed."**

---

## 12.1 What human-designed means

Human-designed does **not** mean humans write every lesson. It means:

> Qualified curriculum experts author an authoritative, complete, versioned specification for
> every competency — the **Competency Contract** — and no content may exist that is not generated
> against one.

The contract is the human artefact. The lesson is the machine artefact. A school buying WizLingo
is buying the contracts; the content is the renderable consequence of them.

### The contract's three functions

1. **Specification** — states what must be learned, precisely enough that two different generators
   would produce pedagogically equivalent content from it.
2. **Boundary** — states what may not happen: vocabulary above ceiling, structures above
   complexity, contexts outside the grade's allowlist, formats that cannot produce the required
   evidence.
3. **Contract, in the software sense** — it is checkable. Every generated item is validated
   *against* it, and any violation is a rejection with a named reason, not a matter of taste.

---

## 12.2 Extending, not duplicating

The existing `Competency` entity (Phase 8 §8.2) already carries `statement`, `pillar`, `domainId`,
`levelId`, `cefr`, `bloom`, `weight`, `masteryCriterion`, `conceptIds`, prerequisites, micro
skills, learning outcomes, and versioning.

**The Competency Contract is not a new entity.** It is `Competency` in a *complete* state, plus
three genuinely multi-row children and one shared defaults table:

| Need | Disposition |
|---|---|
| Most of the 34 fields | **Extend** `Competency` with scalar/JSON columns |
| Misconceptions (many per competency, each with a remediation route) | **New** `Misconception` table |
| Acceptable examples / non-examples (many, typed, versioned) | **New** `ContractExemplar` table |
| Boundaries that are properties of the *level*, not the competency | **New** `LevelDefaults` table — authored **15 times, not 1,400** |
| Contract lifecycle state | **Extend** `Competency` with `contractStatus`, `contractVersion`, approvals |

No competing model. No second source of truth for level ceilings.

---

## 12.3 The 34 fields, tiered

The brief lists 34 fields. Authoring all 34 for 1,400 competencies is 47,600 decisions — which
will not happen, and should not, because roughly a third of them are properties of the **level**
already specified in Phase 2. Restating them per competency duplicates data and creates the worst
drift class in the system: a competency whose stated vocabulary ceiling contradicts its level's.

So fields are tiered by **where the truth lives**.

### CORE — authored per competency (13 fields)

Cannot be inherited or computed. This is the real human work.

| # | Field | Notes |
|---|---|---|
| 3 | `domainId` | which of the 32 domains |
| 6 | `levelId` | which of the 15 levels |
| 8 | `statement` | observable capability, satisfying the 5 well-formedness rules (Phase 4 §4.3) |
| 9 | `microSkills[]` | 3–8, each passing the single-failure-mode test |
| 10 | `learningOutcomes[]` | Given/When/Then + numeric threshold, 1–3 per micro skill |
| 11 | `prerequisites[]` | HARD/SOFT edges with justification |
| 13 | `conceptIds[]` | which DAG concepts this realises |
| 18 | `cognitiveDemand` | Bloom tier(s) — **competency-specific, cannot be inherited** |
| 22 | `misconceptions[]` | the highest-value field in the contract (§12.5) |
| 23 | `acceptableExemplars[]` | 2–5 positive exemplars |
| 24 | `nonExemplars[]` | 2–5 negative exemplars, each with a rejection reason (§12.6) |
| 30 | `remediationRoutes[]` | on failure, which micro skill to drop to — may cross levels |
| 31 | `extensionRoutes[]` | on early mastery, where to go next |

### INHERITED — defaulted from `LevelDefaults` / `GroupPolicy`, override only when justified (13 fields)

Authored **15 times** (per level) or **5 times** (per group), not 1,400 times. A competency may
override, but an override requires a stated reason and is surfaced in review — because an override
is a claim that this competency is genuinely unlike every other competency at its level.

| # | Field | Source | Override frequency (expected) |
|---|---|---|---|
| 2 | `pillar` | derived from `domainId` | never |
| 4 | `gradeCategory` | from level's group | never |
| 5 | `typicalGrades[]` | from level | rare |
| 7 | `cefr` | from level | ~10% (competencies that straddle a CEFR boundary) |
| 14 | `vocabularyBoundaries` | `LevelDefaults` | ~5% (technical vocabulary competencies) |
| 15 | `grammarBoundaries` | `LevelDefaults` | ~8% (SENTENCE-pillar competencies teaching a structure above the general ceiling) |
| 16 | `phonicsRequirements` | `LevelDefaults` | ~15% for SOUND pillar, ~0% elsewhere |
| 17 | `ageAppropriatenessRules` | `GroupPolicy` | ~2% |
| 19 | `difficultyBoundaries` (D1–D5 scaffold definitions) | `LevelDefaults` | ~5% |
| 20 | `contextBoundaries` (topic allow/deny) | `GroupPolicy` | ~12% |
| 21 | `culturalConsiderations` | `GlobalPolicy` + `GroupPolicy` | ~5% |
| 28 | `retentionRequirements` | from level (`retentionDays`) | rare |
| 33 | `contentSafetyConstraints` | `GlobalPolicy` + `GroupPolicy` | ~1% |

### DERIVED — computed, never authored (8 fields)

Authoring these would create a second source of truth for something the system already knows.

| # | Field | Computed from |
|---|---|---|
| 1 | `id` (competency address) | `wl:<pillar>/<domain>/<slug>@<level>` |
| 12 | `dependencies[]` | reverse edges of the prerequisite DAG |
| 25 | `masteryEvidence` | Phase 5 §5.1 gates + level `retentionDays` + `masteryCriterion` |
| 26 | `assessmentRequirements` | format eligibility from micro-skill evidence types × `ActivityTemplate.guessRate` |
| 27 | `productiveEvidenceRequirements` | Phase 5 `Mastered` gate; `true` for all competencies above Level 1.2 |
| 29 | `progressionRules` | Phase 2 §2.3 level-up conditions |
| 32 | `aiGenerationConstraints` | assembled from INHERITED boundaries + CORE cognitive demand + exemplars |
| 34 | `humanReviewRequirements` | risk classification (Phase 15 §15.5) — **dynamic**, recomputed from health score |

Field 32 deserves note: **AI generation constraints are not authored, they are compiled.** The
generation constraint set is a projection of the contract, produced deterministically. This means
an expert cannot accidentally write generation constraints that contradict the boundaries they
also authored — the constraints *are* the boundaries, in machine-readable form. See
[Phase 13 §13.3](13_CONTENT_SPECIFICATIONS.md#133-compiling-a-contentspec-from-a-contract).

Field 34 is dynamic by design: review requirements that are fixed at authoring time cannot
respond to a family that starts producing bad content (Phase 15 §15.5).

### Authoring economics

| | Fields | × instances | = decisions |
|---|---|---|---|
| Naive (brief as written) | 34 | 1,400 | **47,600** |
| CORE | 13 | 1,400 | 18,200 |
| INHERITED (base) | 13 | 15 levels + 5 groups + 1 global | 273 |
| INHERITED (overrides, ~7% avg) | 13 | 1,400 × 0.07 | ~1,270 |
| DERIVED | 8 | 0 | **0** |
| **Tiered total** | | | **~19,700** |

A 59% reduction, and — more importantly — the elimination of an entire class of contradiction.
At a realistic rate of ~6 competencies fully contracted per expert-day, that is ~230 expert-days,
or about **4 experts for 3 months** for the full 1,400. Achievable. The naive version is not.

---

## 12.4 Schema

```prisma
enum ContractStatus {
  SKELETON        // addressed, statement only — not generation-eligible
  DRAFTING        // CORE fields in progress
  COMPLETE        // all CORE present, invariants pass — awaiting approval
  APPROVED        // signed off by required reviewers — generation-eligible
  SUSPENDED       // health score triggered a hold; generation paused
  DEPRECATED
}

enum ExemplarKind {
  ACCEPTABLE          // a good item for this competency
  NON_EXEMPLAR        // superficially plausible, actually wrong — the validator must reject it
  MODEL_ANSWER        // exemplary learner response, for rubric anchoring
  BENCHMARK_STIMULUS  // canonical passage / audio / prompt
}

enum MisconceptionSeverity {
  BLOCKING     // learner cannot progress until resolved
  PERSISTENT   // survives ordinary instruction; needs a specific route
  TRANSIENT    // resolves with normal practice
}

// ─────────────────────────────────────────────────────────────
// The INHERITED layer — authored 15 times, not 1,400
// ─────────────────────────────────────────────────────────────

model LevelDefaults {
  levelId String @id                    // FK to MasteryLevel

  vocabularyBoundaries Json  // { receptiveCeiling, productiveCeiling, frequencyBandMax,
                             //   allowedAffixes[], forbiddenLexis[], preTeachAllowance }
  grammarBoundaries    Json  // { permittedStructures[], forbiddenStructures[],
                             //   maxClauseDepth, tenseAspectSet[], maxSentenceLen }
  phonicsRequirements  Json  // { graphemeSet[], syllablePatterns[], stressRules,
                             //   asrConfidenceFloor, phonemeWeighting }
  difficultyBoundaries Json  // D1..D5 scaffold definitions, option counts, time allowances,
                             //   distractor similarity, retry policy  (Phase 6 §6.4)
  retentionRequirements Json // { intervalDays, expandingSchedule[] }
  readabilityBand      Json  // { min, max, formula }

  version   Int      @default(1)
  updatedAt DateTime @updatedAt
  level     MasteryLevel @relation(fields: [levelId], references: [id])
}

model GroupPolicy {
  gradeCategory GradeCategory @id

  ageAppropriatenessRules Json // { sessionLenMax, segmentLenMax, readingInstructionsAllowed,
                               //   scoreVisibility, rewardStyle, feedbackTone, mascotAllowed }
  contextBoundaries       Json // { topicAllowlist[], topicDenylist[], registerRange,
                               //   namedEntityAgeRange, worldKnowledgeAssumptions[] }
  culturalConsiderations  Json // { regionBalance, nameDiversity, festivalNeutrality,
                               //   urbanRuralMix, languageBackgroundNeutrality }
  contentSafetyConstraints Json // { prohibited[], conditional[], escalationRequired[] }

  version   Int      @default(1)
  updatedAt DateTime @updatedAt
}

model GlobalPolicy {
  id String @id @default("singleton")
  englishVariety      String   @default("en-IN")   // orthography + collocation reference
  prohibitedContent   Json
  accessibilityRules  Json     // alt text, transcripts, colour-independence, no audio-only info
  biasPolicy          Json
  version   Int      @default(1)
  updatedAt DateTime @updatedAt
}

// ─────────────────────────────────────────────────────────────
// Contract extensions to the existing Competency model
// ─────────────────────────────────────────────────────────────

model Competency {
  // ... all existing fields from Phase 8 §8.2 retained unchanged ...

  // ── CORE additions ──
  cognitiveDemand     Json    // { bloomPrimary, bloomSecondary[], workingMemoryLoad,
                              //   abstractionLevel, inferenceSteps }
  learningIntent      Json    // { understand, ableToDo, whyItMatters, comesBefore[], comesAfter[] }
  remediationRoutes   Json    // [{ trigger, targetMicroSkillId, targetLevelId, band, rationale }]
  extensionRoutes     Json    // [{ trigger, targetMicroSkillId, rationale }]
  isConceptualChange  Boolean @default(false)  // contradicts an earlier level's model → HIGH RISK
  conceptualChangeNote String? @db.Text        // required when isConceptualChange = true

  // ── INHERITED overrides (null = inherit from LevelDefaults/GroupPolicy) ──
  vocabularyOverride  Json?
  grammarOverride     Json?
  phonicsOverride     Json?
  contextOverride     Json?
  cefrOverride        String?
  overrideJustification String? @db.Text   // REQUIRED if any override is non-null

  // ── Contract lifecycle ──
  contractStatus   ContractStatus @default(SKELETON)
  contractVersion  Int            @default(1)
  contractHash     String?                  // hash of CORE fields — detects silent change
  completenessReport Json?                  // which CORE fields present, invariant results
  approvals        ContractApproval[]
  misconceptions   Misconception[]
  exemplars        ContractExemplar[]
  contentSpecs     ContentSpecification[]
  healthScore      CurriculumHealthScore?

  @@index([contractStatus])
  @@index([isConceptualChange])
}

model ContractApproval {
  id           String @id @default(cuid())
  competencyId String
  reviewerId   String
  role         String            // CURRICULUM_ARCHITECT | LANGUAGE_EXPERT | PEDAGOGICAL | ASSESSMENT
  decision     String            // approve | reject | revise
  checklistResults Json          // the role's checklist, item by item
  notes        String? @db.Text
  contractVersionReviewed Int
  decidedAt    DateTime @default(now())

  competency Competency @relation(fields: [competencyId], references: [id])
  @@unique([competencyId, reviewerId, contractVersionReviewed])
  @@index([competencyId, decision])
}

model Misconception {
  id           String @id @default(cuid())
  competencyId String
  code         String                       // "SYN_INTERCHANGEABLE"
  description  String @db.Text
  severity     MisconceptionSeverity
  typicalTrigger String @db.Text            // when learners form it
  detectionSignal Json                      // observable pattern: error codes, distractor choice
  remediationRoute Json                     // approach that works, and approaches that don't
  linkedErrorPatternCodes String[]          // ties to Phase 6 ErrorPattern registry
  distractorGuidance String? @db.Text       // how generators should USE this as a distractor

  competency Competency @relation(fields: [competencyId], references: [id])
  @@unique([competencyId, code])
}

model ContractExemplar {
  id           String @id @default(cuid())
  competencyId String
  microSkillId String?
  kind         ExemplarKind
  band         DifficultyBand?
  templateId   String?                      // which activity format
  payload      Json                         // the item itself
  rationale    String @db.Text              // why this is good / why this is wrong
  rejectionReasonCode String?               // REQUIRED for NON_EXEMPLAR — which gate should catch it
  authoredById String
  approvedById String?
  version      Int      @default(1)
  isGolden     Boolean  @default(false)     // promoted to Golden Content (Phase 13 §13.5)
  createdAt    DateTime @default(now())

  competency Competency @relation(fields: [competencyId], references: [id])
  @@index([competencyId, kind])
  @@index([isGolden])
}
```

---

## 12.5 Misconceptions — the highest-value field

Most curriculum specifications describe the target state. Misconceptions describe the **failure
manifold**, and that is what generation and remediation actually need.

A misconception entry does four jobs no other field does:

1. **Distractor design.** A generator told "produce three plausible wrong answers" invents
   arbitrary ones. A generator told "one distractor must exploit `SYN_INTERCHANGEABLE`" produces a
   *diagnostic* item — one whose wrong answer tells you what the learner believes.
2. **Error-pattern linkage.** `linkedErrorPatternCodes` connects the contract to the live
   `ErrorPattern` registry (Phase 6 §6.1), so a recurring learner error resolves to a named
   misconception with a known remediation route rather than to a generic "practise more."
3. **Remediation routing.** The contract states *which* approach works and, critically, which
   approaches don't — so the engine's "try a different instructional route" rule (Phase 6 §6.3
   rule 13) has real alternatives to try instead of re-teaching the same way louder.
4. **Conceptual-change detection.** Where `isConceptualChange = true`, the misconception being
   corrected *is the prior level's taught model*. This is why the field is required there: the
   contract must state what belief it is deliberately breaking.

### Distractor guidance in practice

Without misconception data, a Level 2.2 synonym item's distractors are noise. With it:

```
target: select the contextually correct synonym for "big" in "the big elephant"
key:    large
distractor 1: tall     ← exploits SYN_INTERCHANGEABLE (a real synonym, wrong dimension)
distractor 2: wide     ← exploits SYN_INTERCHANGEABLE (a real synonym, wrong dimension)
distractor 3: loud     ← non-synonym control; if chosen, the learner's problem is
                          vocabulary, not synonymy → routes to a different remediation
```

The item now discriminates between three distinct learner states rather than merely scoring
right/wrong. Gate 7 (learning-objective validation) can check for this: an item whose distractors
carry no misconception mapping is flagged as low-information for competencies that have
`PERSISTENT` or `BLOCKING` misconceptions declared.

---

## 12.6 Non-exemplars — testing the test

`NON_EXEMPLAR` entries are items that look acceptable but are not, each tagged with
`rejectionReasonCode` naming the gate that *should* catch it.

They serve a function no other artefact does: **they are the test suite for the validation
pipeline.** Before a validator is trusted to approve 50,000 items, it must demonstrate that it
accepts the `ACCEPTABLE` exemplars and rejects the `NON_EXEMPLAR`s, with the correct reason code.
A validator that passes a known-bad item is broken, and you want to discover that against 5
authored non-exemplars rather than against a cohort of learners.

Typical non-exemplar classes worth authoring per competency:

| Class | Example (Level 2.2 synonym-in-context) | Should be caught by |
|---|---|---|
| Vocabulary above ceiling | uses `colossal` as a distractor | Gate 3 |
| Two defensible answers | "the ___ elephant" with both `large` and `huge` offered | Gate 5 |
| Cueing | correct option is visibly longer than all distractors | Gate 5 |
| Solvable without the skill | distractors are all non-synonyms, so vocabulary alone solves it | Gate 7 |
| Wrong cognitive tier | asks the learner to *evaluate* an author's synonym choice (Level 3.1 demand) | Gate 3 / Gate 7 |
| Context violation | set in a workplace performance review | Gate 2 |
| Register violation | addresses a 7-year-old as "candidates" | Gate 2 |

See [Phase 14 §14.5](14_AI_GENERATION_GOVERNANCE.md#145-calibrating-the-validators) for how these
drive validator calibration.

---

## 12.7 Worked contract — a HIGH RISK conceptual change

`wl:WORD/vocab-depth/synonym-in-context@2.2` — the competency where the naive "synonyms are
interchangeable" model is deliberately broken (Phase 10, Part A, Level 2.2). Abridged to the
fields that carry information; INHERITED fields shown as resolved values with their source.

```yaml
# ── DERIVED ──
id: wl:WORD/vocab-depth/synonym-in-context@2.2
dependencies: [wl:WORD/vocab-depth/shades-of-meaning@2.3,
               wl:UNDERSTANDING/reading/author-word-choice@3.1]     # reverse DAG edges

# ── CORE ──
domainId: vocab-depth
levelId: "2.2"
statement: >
  Selects the contextually appropriate synonym from a set of true synonyms, and
  states a context-referenced reason for rejecting the others.
isConceptualChange: true
conceptualChangeNote: >
  Contradicts the model taught at Level 1.3 and practised at 2.1, where synonyms are
  presented as interchangeable ("another word for"). This competency establishes that
  no two words are fully interchangeable. The contradiction is intentional and must be
  taught as a discovery ("we learned something new about synonyms"), never as a
  correction of the learner. Instruction MUST surface the prior model explicitly before
  breaking it; generators may not silently present the new model as though it were
  always the rule.

learningIntent:
  understand: "Words that mean nearly the same thing are not always swappable."
  ableToDo:   "Choose the right one for this sentence, and say why the others fail."
  whyItMatters: >
    This is the gateway to all later precision work — shades of meaning (2.3),
    connotation (3.1), register (3.2), and hedging (3.3) are all impossible while the
    learner believes synonyms are equivalent.
  comesBefore: [wl:WORD/vocab-depth/synonym-antonym@2.1]
  comesAfter:  [wl:WORD/vocab-depth/shades-of-meaning@2.3]

cognitiveDemand:
  bloomPrimary: apply
  bloomSecondary: [understand, analyse]
  workingMemoryLoad: moderate      # hold 4 candidates + 1 context simultaneously
  abstractionLevel: low-concrete
  inferenceSteps: 2                # (1) do these mean the same? (2) does this one fit here?

microSkills:
  - slug: select-fitting-synonym      # recognition
  - slug: reject-unfitting-synonym    # requires articulating WHY — the discriminating skill
  - slug: substitute-preserving-meaning
  - slug: use-synonym-in-own-sentence # PRODUCTIVE — required for Mastered

learningOutcomes:
  - code: LO-1
    microSkill: select-fitting-synonym
    given: "a sentence with a highlighted word and 4 true synonyms as options"
    when:  "asked to choose the one that fits this sentence"
    then:  "selects correctly in ≥5/6 items, median latency ≤ 12 s"
  - code: LO-2
    microSkill: reject-unfitting-synonym
    given: "a rejected option"
    when:  "asked why it does not fit"
    then:  "gives a context-referenced reason in ≥4/6 items (rubric ≥2/3)"
  - code: LO-3
    microSkill: use-synonym-in-own-sentence
    given: "a target synonym and a topic"
    when:  "asked to write one sentence using it correctly"
    then:  "≥3/4 on rubric dimensions Task and Accuracy in ≥4/5 attempts"

prerequisites:
  - { id: wl:WORD/vocab-depth/synonym-antonym@2.1, type: HARD,
      justification: "cannot judge fit among synonyms without recognising synonymy" }
  - { id: wl:UNDERSTANDING/reading/context-clues@2.2, type: SOFT,
      justification: "context reading makes fit-judgement easier but is not blocking;
                      below Proficient, band is reduced and the context is shortened" }

conceptIds: [concept:lex.synonymy, concept:lex.context-sensitivity]

misconceptions:
  - code: SYN_INTERCHANGEABLE
    severity: BLOCKING
    description: "Believes any synonym can replace any other without loss."
    typicalTrigger: "Direct consequence of Level 1.3/2.1 instruction. Expected in ~90%
                     of learners entering this competency — it is not a deficit."
    detectionSignal:
      errorCodes: [SYN_WRONG_DIMENSION]
      pattern: "selects a true synonym that is wrong on a different semantic dimension"
    remediationRoute:
      works: >
        Contrastive pairs in which substitution produces an absurd sentence, read
        ALOUD — the absurdity must be heard, not explained. Then learner-generated
        absurd substitutions ("make it silly on purpose"), which converts the rule
        into a game the learner controls.
      doesNotWork: >
        Restating the rule; more matching exercises; definition comparison. All three
        leave the belief intact because none of them makes it FAIL observably.
    linkedErrorPatternCodes: [SYN_WRONG_DIMENSION, LEX_IMPRECISE_CHOICE]
    distractorGuidance: >
      ≥2 of 4 options MUST be true synonyms that fail on a different dimension
      (tall/wide for big). Exactly 1 non-synonym control, so a wrong answer
      distinguishes "doesn't know the words" from "thinks synonyms are swappable".

  - code: SYN_DEFINITION_MATCHING
    severity: PERSISTENT
    description: "Chooses by dictionary-definition overlap rather than by sentence fit."
    detectionSignal: { pattern: "correct on isolated pairs, incorrect in context" }
    remediationRoute:
      works: "Same word pair across two contexts with opposite correct answers."
      doesNotWork: "More isolated pair practice — reinforces the misconception."

exemplars:
  - kind: ACCEPTABLE
    band: D3_INDEPENDENT
    templateId: context-cloze
    payload:
      stem: "The ___ elephant walked slowly to the river."
      options: [large, tall, wide, loud]
      key: large
    rationale: >
      Two true-synonym distractors failing on dimension (tall = vertical only,
      wide = horizontal only), one non-synonym control. All within Level 2.2
      frequency band. Sentence 9 words, clause depth 1.
  - kind: NON_EXEMPLAR
    rejectionReasonCode: GATE5_MULTIPLE_DEFENSIBLE
    payload:
      stem: "The ___ elephant walked slowly to the river."
      options: [large, huge, tall, loud]
      key: large
    rationale: "`huge` is equally defensible. Item is unfair and produces uninterpretable evidence."
  - kind: NON_EXEMPLAR
    rejectionReasonCode: GATE7_SOLVABLE_WITHOUT_SKILL
    payload:
      options: [large, quickly, purple, loud]
      key: large
    rationale: >
      No distractor is a synonym, so the item measures vocabulary, not synonymy.
      Would pass Gates 1–6 and still generate worthless evidence — this is exactly
      the class Gate 7 exists for.
  - kind: NON_EXEMPLAR
    rejectionReasonCode: GATE3_VOCAB_ABOVE_CEILING
    payload: { options: [large, colossal, immense, loud] }
    rationale: "`colossal` and `immense` are above the 2,500-word ceiling for Level 2.2."

remediationRoutes:
  - trigger: "accuracy < 0.5 AND errorCode SYN_WRONG_DIMENSION dominant"
    action: apply misconception SYN_INTERCHANGEABLE route; band → D1; contrastive-absurdity format
  - trigger: "accuracy < 0.5 AND errorCode LEX_UNKNOWN_WORD dominant"
    target: wl:WORD/vocab-breadth/tier1-vocabulary@2.2   # not a synonymy problem at all
    rationale: "cannot judge fit among words not known; treat as a breadth gap"
  - trigger: "correct selection but cannot justify (LO-2 failing while LO-1 passes)"
    action: keep band; switch to justification-required format; do not advance
    rationale: >
      Selection without justification is often pattern-matching. Advancing here
      produces a learner who fails at 2.3 for reasons that look unrelated.

extensionRoutes:
  - trigger: "≥90% accuracy at D4 across 5 attempts AND LO-3 satisfied"
    target: wl:WORD/vocab-depth/shades-of-meaning@2.3
    band: D2

# ── INHERITED (resolved; source shown) ──
pillar: WORD                                    # ← from domain
gradeCategory: GR_1_3                           # ← from level group
typicalGrades: [2]                              # ← from MasteryLevel
cefr: A1.2                                      # ← from MasteryLevel
vocabularyBoundaries:                           # ← LevelDefaults["2.2"]
  receptiveCeiling: 2500
  productiveCeiling: 1400
  allowedAffixes: [un-, re-, dis-, pre-, -ful, -less, -ly, -er, -est, -ing, -ed]
  preTeachAllowance: 1                          # ≤1 above-ceiling word if explicitly pre-taught
grammarBoundaries:                              # ← LevelDefaults["2.2"]
  maxSentenceLen: 9
  maxClauseDepth: 2
  permittedStructures: [simple, compound]
  tenseAspectSet: [simple-present, simple-past, simple-future]
contextBoundaries:                              # ← GroupPolicy[GR_1_3]
  topicAllowlist: [animals, family, school, food, play, weather, transport, festivals]
  registerRange: [playful, neutral]
  namedEntityAgeRange: [6, 9]
retentionRequirements: { intervalDays: 21 }     # ← LevelDefaults["2.2"]
difficultyBoundaries: { ... }                   # ← LevelDefaults["2.2"] D1–D5 definitions
overrideJustification: null                     # no overrides taken

# ── DERIVED ──
masteryEvidence:                                # ← Phase 5 §5.1 + level retention
  pLearnedMin: 0.92
  minAttempts: 5
  minSessions: 3
  minFormats: 3
  minElapsedDays: 7
  requiresProductiveEvidence: true              # satisfied only by LO-3
  requiresTransferEvidence: true
  retentionCheckDays: 21
assessmentRequirements:
  eligibleFormats: [context-cloze, synonym-select, use-in-sentence, error-find, oral-justify]
  ineligibleForMastered: [synonym-select]       # P(G)=0.25 too high to reach 0.92 alone
  mustInclude: [use-in-sentence]                # the only productive format available
humanReviewRequirements:                        # ← DYNAMIC, from risk classification
  riskTier: HIGH                                # because isConceptualChange = true
  reviewers: 2
  requiredRoles: [LANGUAGE_EXPERT, PEDAGOGICAL_REVIEWER]
  samplingRate: 1.0                             # 100% for Tier 1/2 on this competency
  recomputedAt: 2026-08-11
```

Two properties of this contract are worth naming. First, `assessmentRequirements` is **derived and
therefore cannot be wrong**: `synonym-select` is excluded from `Mastered` eligibility not by
editorial choice but because its guess rate mathematically caps the BKT posterior below 0.92
(Phase 5 §5.2). Second, the third `remediationRoute` — "correct selection but cannot justify" —
encodes a real diagnostic insight that no generic engine would produce, and it is exactly the kind
of knowledge that only exists if a human wrote it down.

---

## 12.8 Contract completeness gate

A competency may not be used for generation unless `contractStatus = APPROVED`. Promotion from
`DRAFTING` → `COMPLETE` is automated and requires all of:

| # | Check | Blocks on failure |
|---|---|---|
| 1 | All 13 CORE fields present and non-empty | yes |
| 2 | Statement satisfies the 5 well-formedness rules (Phase 4 §4.3) | yes |
| 3 | 3–8 micro skills, each passing the single-failure-mode check | yes |
| 4 | ≥1 learning outcome per micro skill, each with a numeric threshold | yes |
| 5 | ≥1 micro skill supports productive evidence (above Level 1.2) | yes |
| 6 | ≥3 eligible activity formats, ≥1 with `guessRate ≤ 0.05` | yes |
| 7 | Prerequisite edges valid, acyclic, locality ≤4 levels for HARD | yes |
| 8 | ≥1 misconception with a remediation route | yes |
| 9 | ≥2 `ACCEPTABLE` and ≥2 `NON_EXEMPLAR` exemplars, each reason-coded | yes |
| 10 | `conceptualChangeNote` present if `isConceptualChange` | yes |
| 11 | `overrideJustification` present if any override is non-null | yes |
| 12 | Every INHERITED field resolves (level and group defaults exist) | yes |
| 13 | Derived fields compile without contradiction | yes |
| 14 | ≥1 `ContentSpecification` authored (Phase 13) | warn only |

`COMPLETE` → `APPROVED` requires the reviewer set determined by risk tier
([Phase 15 §15.7](15_HUMAN_REVIEW_GOVERNANCE.md#157-what-expert-validated-means-exactly)).

`contractHash` covers the CORE fields. A change to any CORE field after approval increments
`contractVersion`, resets `contractStatus` to `COMPLETE`, and requires re-approval — silent
post-approval edits are impossible. INHERITED overrides and DERIVED recomputation do not
invalidate approval, since neither can widen a boundary the reviewers accepted.
