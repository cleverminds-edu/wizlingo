# PHASE 13 — Content Specifications & Golden Content

The layer between "what must be learned" and "what the AI generates."

---

## 13.1 Why this layer must exist separately

The hierarchy already runs `Competency → MicroSkill → Concept → LearningOutcome`. It is tempting
to generate directly from a Learning Outcome. That fails, for a specific reason:

> A Learning Outcome states **what evidence is required**.
> A Content Specification states **how to manufacture an instrument that produces that evidence**.

One outcome needs many instruments. Consider `LO-1` from the worked contract:

> *Given a sentence with a highlighted word and 4 true synonyms as options, when asked to choose
> the one that fits, then selects correctly in ≥5/6 items with median latency ≤12 s.*

That single outcome requires materially different generation instructions for:

| Variant | Differs in |
|---|---|
| `context-cloze` at band D1 | 2 options, one obviously wrong, picture support, hint auto-shows at 8 s |
| `context-cloze` at band D3 | 4 options all true synonyms, no support, no hint |
| `context-cloze` at band D5 | no options at all — learner supplies the word, plus justification |
| `error-find` at band D3 | a *wrong* synonym already substituted; learner detects and repairs it |
| `oral-justify` at band D3 | spoken justification, ASR + rubric scored |
| Grade 2 environment | topics: animals, play, family |
| Grade 8 environment (learner at Level 2.2) | topics: sport selection, friendship, school events; peer register; no cartoons |

Seven different generation problems, one outcome. Collapsing them into the outcome would either
(a) make the outcome enormous and unmaintainable, or (b) leave the generator to invent the
differences — which is precisely the drift we are preventing.

So: **`LearningOutcome` is authored by an assessment expert and answers "what counts as evidence."
`ContentSpecification` is compiled from the contract and answers "generate exactly this."**

### Position in the hierarchy

```
PILLAR → DOMAIN → COMPETENCY → MICRO SKILL → CONCEPT → LEARNING OUTCOME
                                                              ↓
                                                  ★ CONTENT SPECIFICATION ★
                                                              ↓
                                                       AI GENERATION
                                                              ↓
                                                      CONTENT INSTANCE
                                                              ↓
                                                        VALIDATION
                                                              ↓
                                                          ACTIVITY
                                                              ↓
                                                        ASSESSMENT
                                                              ↓
                                                          MASTERY
```

Cardinality: **1 LearningOutcome → 4–12 ContentSpecifications** (format × band × grade-environment
combinations that are actually needed). Estimated system total: ~7,000 micro skills × ~2 outcomes
× ~6 specs ≈ **~84,000 specifications** — which sounds unmanageable until you note that they are
**compiled, not authored** (§13.3). Humans author ~19,700 contract decisions; the 84,000 specs are
a deterministic projection of those.

---

## 13.2 Specification fields

```prisma
model ContentSpecification {
  id            String @id @default(cuid())
  specKey       String @unique      // "wl:WORD/vocab-depth/synonym-in-context@2.2
                                    //  /select-fitting-synonym/LO-1/context-cloze/D3/GR_1_3"

  // ── Curriculum address (all mandatory, all FK-enforced) ──
  competencyId      String
  microSkillId      String
  conceptId         String
  learningOutcomeId String
  levelId           String
  pillar            Pillar
  domainId          String

  // ── Delivery coordinates ──
  templateId        String            // ActivityTemplate — the format
  band              DifficultyBand
  gradeCategory     GradeCategory     // the environment axis (orthogonal to band)
  gradeMin          Int?
  gradeMax          Int?
  contentType       String            // reading | listening | speaking | writing | vocabulary
                                      // | grammar | thinking | phonics
  interactionType   String            // select | construct | transform | produce | perform
  itemCount         Int   @default(1)

  // ── Compiled linguistic constraints (from LevelDefaults + contract overrides) ──
  vocabularyConstraints Json  // ceiling, frequency band, allowed affixes, forbidden lexis,
                              // required target words, preTeach allowance
  grammarConstraints    Json  // permitted/forbidden structures, tense set, max clause depth
  sentenceLengthRange   Json  // { min, max, mean }
  textLengthRange       Json? // for passages
  readabilityBand       Json
  phonicsRequirements   Json? // grapheme set, stress rules, ASR confidence floor

  // ── Compiled cognitive & pedagogical constraints ──
  cognitiveDemand   Json      // bloom tier, inference steps, working-memory load
  scaffolding       Json      // which scaffolds present at this band, hint policy, retry policy
  expectedAnswerCharacteristics Json  // shape, length, acceptable variation, what counts as
                                      // correct, what partial credit looks like
  misconceptionTargets Json   // [{ code, role: "distractor"|"probe", minCount }]
  distractorPolicy  Json      // count, similarity, how many must map to a misconception,
                              // how many non-target controls

  // ── Assessment binding ──
  scoringMethod     ScoringMethod
  rubricRef         String?           // rubric id for RUBRIC_* scoring
  guessRate         Float             // inherited from ActivityTemplate — drives BKT
  evidenceType      String[]          // ["receptive"] | ["productive"] | ["productive","transfer"]
  latencyExpectationMs Int?

  // ── Context, culture, safety (from GroupPolicy + GlobalPolicy + contract overrides) ──
  contextRules      Json      // topic allow/deny, register, named-entity age range
  culturalRules     Json
  safetyRules       Json
  accessibilityRules Json

  // ── Generation control ──
  generationTier    ContentTier
  promptTemplateId  String            // versioned prompt template
  goldenExemplarIds String[]          // few-shot anchors AND comparison targets
  negativeExemplarIds String[]        // must-not-resemble set
  targetPoolSize    Int   @default(0) // how many instances to maintain in cache
  maxLiveGeneration Boolean @default(false)

  // ── Lifecycle ──
  version      Int      @default(1)
  status       ContentStatus @default(DRAFT)
  compiledFrom Json              // contract version + LevelDefaults version + policy versions
  compiledAt   DateTime @default(now())
  approvedById String?
  supersedesId String?

  competency      Competency      @relation(fields: [competencyId], references: [id])
  learningOutcome LearningOutcome @relation(fields: [learningOutcomeId], references: [id])
  instances       Content[]

  @@index([microSkillId, band, status])
  @@index([competencyId, templateId])
  @@index([status, generationTier])
}
```

---

## 13.3 Compiling a ContentSpec from a contract

Specifications are **compiled, not authored.** This is the mechanism that makes ~84,000 specs
tractable and — more importantly — makes it impossible for a spec to contradict its contract.

```
compile(competency, microSkill, learningOutcome, templateId, band, gradeCategory) → ContentSpec

  1. RESOLVE BOUNDARIES
       vocabularyConstraints ← competency.vocabularyOverride
                               ?? LevelDefaults[level].vocabularyBoundaries
       grammarConstraints    ← competency.grammarOverride
                               ?? LevelDefaults[level].grammarBoundaries
       contextRules          ← competency.contextOverride
                               ?? GroupPolicy[gradeCategory].contextBoundaries
       safetyRules           ← GlobalPolicy ∪ GroupPolicy[gradeCategory]     # union, never override
       accessibilityRules    ← GlobalPolicy                                  # never overridable

  2. APPLY BAND MODULATION                      # Phase 6 §6.4 parameter table
       scaffolding           ← LevelDefaults[level].difficultyBoundaries[band]
       sentenceLengthRange   ← base × band_factor[band]      # D1 0.6× → D5 1.3×
       textLengthRange       ← base × band_factor[band]
       distractorPolicy      ← similarity[band], count[band]
       retryPolicy, hintPolicy, feedbackTiming ← band definition

  3. BIND FORMAT
       templateId            → guessRate, scoringMethod, inputModality, outputModality
       interactionType       ← template.outputModality
       evidenceType          ← "productive" if template produces speech/writing else "receptive"
       REJECT if band ∉ template.supportedBands
       REJECT if level.ordinal ∉ [template.minLevelOrdinal, template.maxLevelOrdinal]

  4. BIND ASSESSMENT
       expectedAnswerCharacteristics ← learningOutcome.thenClause + threshold
       latencyExpectationMs          ← microSkill.medianLatencyMs × band_factor
       rubricRef                     ← template.rubricSchema
       REJECT if learningOutcome requires productive evidence AND evidenceType = receptive

  5. BIND MISCONCEPTIONS
       misconceptionTargets  ← competency.misconceptions
                                 |> filter(severity ∈ {BLOCKING, PERSISTENT})
                                 |> map(distractorGuidance)
       REJECT if distractorPolicy.count > 0 AND misconceptionTargets = ∅
               AND competency has a BLOCKING misconception
               # an item with distractors must exploit known misconceptions where they exist

  6. BIND GOLDEN CONTENT
       goldenExemplarIds     ← GoldenExemplar where (competency, template, band) matches,
                                 falling back to (competency, template) then (competency)
       negativeExemplarIds   ← ContractExemplar where kind = NON_EXEMPLAR
       WARN if goldenExemplarIds = ∅ AND riskTier ∈ {MEDIUM, HIGH}

  7. STAMP PROVENANCE
       compiledFrom ← { contractVersion, levelDefaultsVersion, groupPolicyVersion,
                        globalPolicyVersion, templateVersion, compilerVersion }
```

### Properties this buys

| Property | Why it holds |
|---|---|
| A spec cannot exceed its level's ceilings | Boundaries are *read* from `LevelDefaults`, never restated |
| A spec cannot claim productive evidence from an MCQ | Step 4 rejects it structurally |
| A spec cannot be un-scaffolded at D1 | Scaffolding is a function of band, not a choice |
| Safety rules cannot be weakened by a competency | Step 1 unions rather than overrides |
| A boundary change propagates everywhere | Bump `LevelDefaults.version`, recompile — 84,000 specs update from one edit |
| Every spec is reproducible | `compiledFrom` + compiler version regenerates it byte-identically |

That fifth row is the operationally decisive one. If a Language Expert decides Level 2.2's
vocabulary ceiling should be 2,300 rather than 2,500, they change **one row**. Recompilation
updates every affected specification, and the next validation pass flags every already-generated
item that now violates the tightened bound. Under a per-competency authoring model that same
change is 1,400 edits and a near-certain inconsistency.

### When a human *does* touch a spec

Compilation is the default; manual specs are the exception, permitted only for:
- **Tier 1 canonical** content, where an expert is specifying a benchmark artefact precisely;
- **capstone and milestone assessments**, which are bespoke by nature;
- **remediation specs for a named misconception**, where the instructional approach is the point
  and cannot be derived from boundaries.

Manual specs are marked `compiledFrom.manual = true` and always carry `riskTier = HIGH`.

---

## 13.4 Worked specification

Compiled from the Phase 12 §12.7 contract. Two variants shown, differing **only** in band and
grade environment, to make the orthogonality concrete.

```yaml
# ══ VARIANT A ══ Level 2.2 / band D3 / Grade 2 learner
specKey: wl:WORD/vocab-depth/synonym-in-context@2.2/select-fitting-synonym/LO-1/context-cloze/D3/GR_1_3
templateId: context-cloze
band: D3_INDEPENDENT
gradeCategory: GR_1_3
gradeMin: 1 ; gradeMax: 3
contentType: vocabulary
interactionType: select
itemCount: 6

vocabularyConstraints:            # ← LevelDefaults["2.2"]
  ceiling: 2500 ; frequencyBandMax: 2500
  allowedAffixes: [un-, re-, dis-, pre-, -ful, -less, -ly, -er, -est, -ing, -ed]
  preTeachAllowance: 1
  requiredTargetWords: null       # generator selects from level word list
grammarConstraints:
  maxSentenceLen: 9 ; maxClauseDepth: 2
  permittedStructures: [simple, compound]
  tenseAspectSet: [simple-present, simple-past, simple-future]
sentenceLengthRange: { min: 6, max: 9, mean: 7.5 }    # base × D3 factor 1.0
readabilityBand: { min: 1.8, max: 2.6, formula: dale-chall }

cognitiveDemand: { bloomPrimary: apply, inferenceSteps: 2, workingMemoryLoad: moderate }
scaffolding:                       # ← D3 definition
  scaffoldCount: 0 ; hintPolicy: on-request-costs-star ; retries: 0
  feedbackTiming: after-submission ; pictureSupport: false

expectedAnswerCharacteristics:
  shape: single-option-selection
  correctness: exactly-one-defensible
  partialCredit: none
distractorPolicy:
  count: 3
  similarity: near-miss
  mustMapToMisconception: 2       # ← from SYN_INTERCHANGEABLE.distractorGuidance
  nonTargetControls: 1
misconceptionTargets:
  - { code: SYN_INTERCHANGEABLE, role: distractor, minCount: 2 }
  - { code: SYN_DEFINITION_MATCHING, role: probe, minCount: 0 }

scoringMethod: EXACT
guessRate: 0.25                   # ← ActivityTemplate; NOTE: cannot alone reach Mastered
evidenceType: [receptive]
latencyExpectationMs: 12000

contextRules:                     # ← GroupPolicy[GR_1_3]
  topicAllowlist: [animals, family, school, food, play, weather, transport, festivals]
  registerRange: [playful, neutral]
  namedEntityAgeRange: [6, 9]
safetyRules: { ... }              # ← GlobalPolicy ∪ GroupPolicy — union, unoverridable
accessibilityRules: { altTextRequired: true, colourNotSoleChannel: true }

generationTier: TIER2_GENERATED
promptTemplateId: pt.context-cloze.v4
goldenExemplarIds: [gx.syn-2.2.d3.001, gx.syn-2.2.d3.002, gx.syn-2.2.d3.003]
negativeExemplarIds: [nx.syn-2.2.multi-defensible, nx.syn-2.2.no-synonym-distractors,
                      nx.syn-2.2.vocab-ceiling]
targetPoolSize: 400
maxLiveGeneration: false

compiledFrom:
  contractVersion: 3 ; levelDefaultsVersion: 2 ; groupPolicyVersion: 1
  globalPolicyVersion: 4 ; templateVersion: 2 ; compilerVersion: 1.2.0


# ══ VARIANT B ══ same competency & band, Grade 9 learner sitting at Level 2.2
#    Only the ENVIRONMENT axis differs. Difficulty is identical.
specKey: .../context-cloze/D3/GR_8_10
gradeCategory: GR_8_10
gradeMin: 8 ; gradeMax: 10

# IDENTICAL: every linguistic constraint, cognitive demand, scaffolding,
#            distractor policy, scoring, guessRate, evidenceType.

# DIFFERENT — and only this:
contextRules:                     # ← GroupPolicy[GR_8_10]
  topicAllowlist: [sport, friendship, school-events, technology, part-time-work,
                   music, current-affairs-neutral, career-interest]
  topicDenylist: [nursery-rhymes, cartoon-characters, toys, baby-animals]
  registerRange: [neutral, peer]
  namedEntityAgeRange: [13, 17]
  visualStyle: editorial-flat        # no mascot, no cartoon
  rewardFraming: analytics           # ← GroupPolicy age rules
goldenExemplarIds: [gx.syn-2.2.d3.g810.001, gx.syn-2.2.d3.g810.002]
promptTemplateId: pt.context-cloze.v4     # same template, different context injection
```

Variant B is the architecture's core promise made concrete: a Grade 9 learner receives *"The team
picked the ___ striker for the final match"* with options `strong / tall / wide / loud` — Level 2.2
language, Grade 9 world, peer register, no condescension. Same micro skill, same band, same
evidence weight, same BKT node. The learner is never shown a baby animal to fix a vocabulary gap.

---

## 13.5 Golden Content

Expert-created or expert-approved reference content. **Not the curriculum** — a quality anchor.

### Scope

Golden Content is authored only where it changes outcomes. Not for all 1,400 competencies.

| Priority | Where | Est. competencies | Golden items each | Total |
|---|---|---|---|---|
| P0 | Conceptual-change competencies (`isConceptualChange = true`) | ~90 | 8 | 720 |
| P0 | CEFR boundary competencies (level transitions) | ~60 | 8 | 480 |
| P0 | Milestone & Level Assessment content | 15 levels × ~6 | — | ~400 |
| P1 | Phonics/pronunciation benchmarks (SOUND, levels 1.1–3.1) | ~70 | 6 | 420 |
| P1 | Rubric anchors for every writing/speaking band | 15 × 5 bands × 2 modes | — | 150 |
| P1 | High-risk competencies by health score | ~80 | 6 | 480 |
| P2 | Capstone tasks (Level 5.3) | ~20 | 4 | 80 |
| | **Total** | **~330 competencies** | | **~2,730 items** |

At ~25 minutes per golden item including two-reviewer approval, that is ~1,140 expert-hours —
roughly **0.75 expert-years**, spread across the build. Tractable, and it covers every place where
AI error would be most costly.

### The three roles of Golden Content

**Role 1 — Few-shot anchor (generation-time).**
Golden exemplars are injected into the generation prompt. This is the weakest of the three roles
and the only one most systems implement. It shapes output but proves nothing.

**Role 2 — Comparison target (validation-time, Stage 9).**
Generated items are compared against the golden set for the same spec, on measurable dimensions —
not on "does it feel similar":

| Dimension | Measure | Tolerance |
|---|---|---|
| Lexical profile | frequency-band distribution divergence (JS divergence) | ≤0.15 |
| Syntactic profile | mean sentence length, clause-depth distribution | within 1σ of golden set |
| Distractor structure | count, misconception-mapping ratio, similarity class | exact match to policy |
| Stem structure | interrogative form, position of blank, cueing indicators | class match |
| Answer characteristics | length, form, uniqueness of defensible answer | class match |
| Topic register | classifier score against `registerRange` | within band |

Divergence beyond tolerance is a Stage 9 rejection with the offending dimension named. This is how
"stylistic drift" becomes a measured quantity rather than something noticed six months later.

**Role 3 — Validator calibration set (the role usually missed).**
Before a validator configuration is trusted to approve content at volume, it must be run against
the golden corpus:

```
For each spec with golden content:
    accept_rate(ACCEPTABLE exemplars)     must be ≥ 0.95
    reject_rate(NON_EXEMPLAR exemplars)   must be ≥ 0.90
    reason_code_accuracy(NON_EXEMPLARs)   must be ≥ 0.80
        # the validator must reject for the RIGHT reason, not by luck
```

A validator that rejects golden content is over-tight (it will reject good generations and starve
the content pool). A validator that accepts non-exemplars is over-loose (it will publish broken
items). Either failure blocks the validator configuration from being promoted — see
[Phase 14 §14.5](14_AI_GENERATION_GOVERNANCE.md#145-calibrating-the-validators).

This role is why non-exemplars are mandatory in every contract (Phase 12 §12.8 check 9). Without
them there is no way to test whether the validation pipeline works, and an untested validator
approving 50,000 items a week is the largest single risk in the whole platform.

### Schema

```prisma
model GoldenExemplar {
  id            String @id                  // "gx.syn-2.2.d3.001"
  competencyId  String
  microSkillId  String?
  specKey       String?                     // most specific binding, if any
  templateId    String
  band          DifficultyBand?
  gradeCategory GradeCategory?

  role          String        // ANCHOR | COMPARISON | RUBRIC_ANCHOR | BENCHMARK
  payload       Json
  rationale     String @db.Text             // why this is exemplary — read by reviewers, not models

  // Measured profile — computed once, used as the comparison target
  measuredProfile Json        // lexical distribution, syntactic stats, distractor structure

  // Rubric anchoring (for RUBRIC_ANCHOR role)
  anchorScore   Float?                      // e.g. this response is exactly a 3/5
  anchorDimension String?

  authoredById  String
  approvals     GoldenApproval[]
  version       Int      @default(1)
  supersedesId  String?
  frozenAt      DateTime?                   // once frozen, immutable — new version required
  status        ContentStatus @default(DRAFT)

  @@index([competencyId, templateId, band])
  @@index([status, role])
}

model GoldenApproval {
  id         String @id @default(cuid())
  exemplarId String
  reviewerId String
  role       String
  decision   String
  notes      String? @db.Text
  decidedAt  DateTime @default(now())
  @@unique([exemplarId, reviewerId])
}
```

### Versioning: golden content never silently changes

Golden Content is the reference against which everything else is measured, so mutation is
prohibited rather than discouraged:

- Approved exemplars are **frozen** (`frozenAt` set). Frozen rows are immutable at the application
  layer and protected by an update trigger.
- Change requires a **new version** with its own approvals, and the old version is retained.
- Superseding a golden exemplar triggers **recompilation** of every dependent `ContentSpecification`
  and **re-validation at Stage 9** of every `TRUSTED` content item generated against the old
  anchor. Items that now fall outside tolerance move to `CALIBRATING`, not straight to retirement —
  the golden set changed, not necessarily the item.
- Golden versions are pinned in `Content.provenance`, so it is always answerable which exemplar a
  given served item was anchored to.

Two reviewers minimum for all golden content, three for P0 (conceptual change, CEFR boundary,
milestone) — see [Phase 15 §15.7](15_HUMAN_REVIEW_GOVERNANCE.md#157-what-expert-validated-means-exactly).

---

## 13.6 Prompt templates are versioned artefacts

`ContentSpecification.promptTemplateId` references a versioned `PromptTemplate`, not an inline
string. This matters because a prompt change alters the behaviour of every item generated
afterwards, which makes it a governed change rather than an engineering detail.

```prisma
model PromptTemplate {
  id          String @id                    // "pt.context-cloze.v4"
  templateId  String                        // ActivityTemplate this serves
  body        String @db.Text               // the prompt, with named slots
  slots       String[]                      // slots the compiler must fill
  version     Int
  changeNote  String @db.Text
  approvedById String?
  goldenCalibration Json?                   // accept/reject rates on the golden corpus
  status      ContentStatus @default(DRAFT)
  createdAt   DateTime @default(now())
  @@index([templateId, status])
}
```

A prompt template may not reach `PUBLISHED` without a passing `goldenCalibration` record. This
closes the loop: prompts are calibrated against expert content before they generate at volume, and
a regression in prompt quality is caught by the same mechanism that catches a regression in
validator quality.
