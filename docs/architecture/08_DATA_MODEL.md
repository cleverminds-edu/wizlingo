# PHASE 8 — Content & Learning Data Model

Prisma schema for the architecture. Extends the existing `prisma/schema.prisma` rather than
replacing it: `School`, `Teacher`, `Class`, `Enrollment`, `Student`, `Badge`, `Leaderboard` and
the four LSRW session models are retained.

**Design rules enforced by this schema:**
1. Curriculum tables are **immutable once published** — revision creates a new version row.
2. `Attempt` is **append-only**. It is the system of record; everything else is derived.
3. `Mastery` and `LanguageDNA` are **derived caches**, fully rebuildable from `Attempt`.
4. Every content row carries a **full curriculum address**.
5. Learner-facing hot paths never join more than 3 tables.

---

## 8.1 Enums

```prisma
enum Pillar {
  SOUND
  WORD
  SENTENCE
  UNDERSTANDING
  EXPRESSION
  COMMUNICATION
  THINKING
  MASTERY
}

// Retained from existing schema — already correct.
enum GradeCategory {
  PREPRIMARY      // Ages 3-5   · Levels 1.1-1.3
  GR_1_3          // Ages 6-9   · Levels 2.1-2.3
  GR_4_7          // Ages 10-13 · Levels 3.1-3.3
  GR_8_10         // Ages 14-16 · Levels 4.1-4.3
  GR_11_12        // Ages 17-18 · Levels 5.1-5.3
}

enum DifficultyBand {
  D1_GUIDED
  D2_SUPPORTED
  D3_INDEPENDENT
  D4_ADVANCED
  D5_MASTERY
}

enum MasteryState {
  INTRODUCED
  PRACTICING
  DEVELOPING
  PROFICIENT
  MASTERED
}

enum PrerequisiteType {
  HARD    // blocks scheduling until PROFICIENT
  SOFT    // permits scheduling with reduced band + scaffolds
}

enum AssessmentType {
  DIAGNOSTIC
  BASELINE
  DAILY
  MICRO_SKILL
  WEEKLY
  LEVEL
  MASTERY
}

enum ScoringMethod {
  EXACT
  PARTIAL
  RUBRIC_LLM
  RUBRIC_HUMAN
  ASR
  HYBRID
}

enum ContentTier {
  CURATED           // Tier A — human authored, AI may not touch
  AI_VARIATION      // Tier B — AI generated around an approved outcome
  AI_PERSONALIZED   // Tier C — AI generated for one learner
}

enum ContentStatus {
  DRAFT
  IN_REVIEW
  APPROVED
  PUBLISHED
  RETIRED
  REJECTED
}

enum StrandKey {
  SOUND
  VOCABULARY
  GRAMMAR
  SENTENCE_CONSTRUCTION
  LISTENING
  SPEAKING
  READING
  WRITING
  COMPREHENSION
  COMMUNICATION
  THINKING
  FLUENCY
  PRONUNCIATION
}
```

---

## 8.2 Curriculum layer (L1) — human-authored, versioned, immutable

```prisma
model MasteryLevel {
  id              String        @id            // "3.2"
  ordinal         Int           @unique        // 1..15 — drives GDI arithmetic
  groupOrdinal    Int                          // 1..5
  levelInGroup    Int                          // 1..3
  gradeCategory   GradeCategory
  rankName        String                       // "Story Weaver"
  worldName       String                       // "Meaning Realms"
  identity        String                       // "I can build a whole piece that holds together"
  overallOutcome  String       @db.Text
  cefr            String                       // "B1.1"
  ageMin          Float
  ageMax          Float
  typicalGrades   Int[]

  // Difficulty ceilings — the generation constraints for this level
  vocabReceptive     Int
  vocabProductive    Int
  sentenceLenMin     Int
  sentenceLenMax     Int
  maxClauseDepth     Int
  textLenMin         Int
  textLenMax         Int
  wcpmTarget         Int?
  bloomTiers         String[]
  retentionDays      Int                       // MASTERY pillar interval for this level
  eloFloor           Int                       // ordinal * 100 + 600

  expectations    Json                         // the 15 dimension expectations from Phase 2
  masteryCriteria Json                         // level-up thresholds

  competencies    Competency[]
  journeys        Journey[]
  @@index([ordinal])
}

model Domain {
  id        String  @id            // "syntax"
  pillar    Pillar
  name      String
  description String @db.Text
  sortOrder Int

  competencies Competency[]
  @@unique([pillar, id])
}

model Concept {
  id           String   @id        // "concept:syn.participial-phrase"
  branch       String              // "syn"
  slug         String
  name         String
  definition   String   @db.Text
  cefrMin      String?
  terminal     Boolean  @default(false)   // exempt from the ≥2-level spiral invariant
  spiralLevels String[]                    // ["3.2","3.3","4.1"]

  version      Int      @default(1)
  status       ContentStatus @default(DRAFT)
  supersedesId String?
  supersedes   Concept? @relation("ConceptVersion", fields: [supersedesId], references: [id])
  versions     Concept[] @relation("ConceptVersion")

  microSkills      MicroSkill[]
  prerequisitesOut ConceptPrerequisite[] @relation("fromConcept")
  prerequisitesIn  ConceptPrerequisite[] @relation("toConcept")

  @@unique([branch, slug, version])
  @@index([branch])
}

model ConceptPrerequisite {
  id           String           @id @default(cuid())
  fromConceptId String                          // the dependent
  toConceptId   String                          // the prerequisite
  type          PrerequisiteType
  from          Concept @relation("fromConcept", fields: [fromConceptId], references: [id])
  to            Concept @relation("toConcept",   fields: [toConceptId],   references: [id])

  @@unique([fromConceptId, toConceptId])
}

model Competency {
  id          String  @id                  // "wl:SENTENCE/syntax/clause-combining@3.2"
  pillar      Pillar
  domainId    String
  levelId     String
  slug        String
  statement   String  @db.Text
  cefr        String?
  bloom       String[]
  weight      Float   @default(1.0)

  masteryCriterion Json                    // accuracy, minAttempts, minSessions, minFormats, ...
  conceptIds       String[]

  version     Int           @default(1)
  status      ContentStatus @default(DRAFT)
  publishedAt DateTime?
  retiredAt   DateTime?

  domain      Domain       @relation(fields: [domainId], references: [id])
  level       MasteryLevel @relation(fields: [levelId],  references: [id])
  microSkills MicroSkill[]
  quests      Quest[]
  prerequisites CompetencyPrerequisite[] @relation("fromCompetency")
  dependents    CompetencyPrerequisite[] @relation("toCompetency")

  @@unique([domainId, levelId, slug, version])
  @@index([levelId, pillar])
  @@index([pillar, status])
}

model CompetencyPrerequisite {
  id     String @id @default(cuid())
  fromId String
  toId   String
  type   PrerequisiteType
  from   Competency @relation("fromCompetency", fields: [fromId], references: [id])
  to     Competency @relation("toCompetency",   fields: [toId],   references: [id])
  @@unique([fromId, toId])
}

model MicroSkill {
  id           String  @id      // "wl:SENTENCE/syntax/clause-combining@3.2/reduce-relative-to-participial"
  competencyId String
  conceptId    String
  slug         String
  name         String
  description  String  @db.Text
  strand       StrandKey        // which Language DNA strand this feeds
  weight       Float   @default(1.0)
  sortOrder    Int

  // BKT parameters — seeded from defaults, population-calibrated
  bktPriorL0 Float @default(0.15)
  bktLearnT  Float @default(0.20)
  bktSlipS   Float @default(0.10)

  medianLatencyMs Int?          // population median, per level, for latency normalisation

  version Int           @default(1)
  status  ContentStatus @default(DRAFT)

  competency       Competency        @relation(fields: [competencyId], references: [id])
  concept          Concept           @relation(fields: [conceptId],    references: [id])
  learningOutcomes LearningOutcome[]
  activities       ActivityInstance[]
  masteryRecords   Mastery[]
  attempts         Attempt[]

  @@unique([competencyId, slug, version])
  @@index([strand])
  @@index([conceptId])
}

model LearningOutcome {
  id           String @id @default(cuid())
  microSkillId String
  code         String            // "LO-1"
  givenClause  String @db.Text
  whenClause   String @db.Text
  thenClause   String @db.Text
  threshold    Json              // { accuracy: 0.85, medianLatencyMs: 4000 }

  microSkill MicroSkill @relation(fields: [microSkillId], references: [id])
  contents   Content[]
  @@unique([microSkillId, code])
}
```

---

## 8.3 Content & delivery layer (L2/L3)

```prisma
model ActivityTemplate {
  id            String        @id       // "sentence-combine"
  name          String
  taxonomyBranch String                 // one of the 18 content-taxonomy branches
  inputModality  String[]               // ["text","audio"]
  outputModality String[]               // ["text"]
  scoringMethod  ScoringMethod
  guessRate      Float                  // P(G) — drives BKT; see Phase 5 §5.2
  supportedBands DifficultyBand[]
  scaffoldSlots  Json                   // which scaffolds exist and at which bands
  rubricSchema   Json?                  // for RUBRIC_* scoring
  minLevelOrdinal Int
  maxLevelOrdinal Int

  instances ActivityInstance[]
  @@index([taxonomyBranch])
}

model Content {
  id         String      @id @default(cuid())
  tier       ContentTier
  status     ContentStatus @default(DRAFT)

  // Full curriculum address — every field mandatory for AI-generated rows
  levelId          String
  pillar           Pillar
  domainId         String
  competencyId     String
  microSkillId     String
  conceptId        String
  learningOutcomeId String?
  band             DifficultyBand

  // Grade environment (orthogonal to level — Phase 1 §1.4)
  gradeCategory GradeCategory
  gradeMin      Int?
  gradeMax      Int?
  topicTags     String[]

  body      Json                        // stems, options, passage, audio refs, answer key
  mediaRefs String[]

  // Linguistic measurements — validated against the level's ceilings
  measuredVocabCeiling Int?
  measuredSentenceLen  Float?
  measuredClauseDepth  Int?
  readabilityScore     Float?

  // Provenance & governance
  generatedBy      String?              // model id, null for CURATED
  generationPrompt Json?
  validationReport Json?                // 7-gate results — see Phase 9
  reviewedById     String?
  reviewedAt       DateTime?
  contentHash      String  @unique

  // Population calibration
  eloDifficulty  Int      @default(1200)
  timesServed    Int      @default(0)
  populationPCorrect Float?

  version   Int      @default(1)
  createdAt DateTime @default(now())
  retiredAt DateTime?

  learningOutcome LearningOutcome? @relation(fields: [learningOutcomeId], references: [id])
  instances       ActivityInstance[]

  @@index([microSkillId, band, status])
  @@index([levelId, pillar, status])
  @@index([tier, status])
}

model Lesson {
  id          String        @id @default(cuid())
  tier        ContentTier
  levelId     String
  pillar      Pillar
  competencyId String
  title       String
  teachingBody Json                     // the explicit-instruction moment
  outcomeIds  String[]
  sortOrder   Int
  status      ContentStatus @default(DRAFT)
  version     Int           @default(1)

  @@index([competencyId, status])
}

model ActivityInstance {
  id         String @id @default(cuid())
  templateId String
  contentId  String
  microSkillId String
  studentId  String
  sessionId  String?
  band       DifficultyBand
  scaffoldsShown String[]
  servedAt   DateTime @default(now())

  template   ActivityTemplate @relation(fields: [templateId],   references: [id])
  content    Content          @relation(fields: [contentId],    references: [id])
  microSkill MicroSkill       @relation(fields: [microSkillId], references: [id])
  student    Student          @relation(fields: [studentId],    references: [id])
  session    LearningSession? @relation(fields: [sessionId],    references: [id])
  attempts   Attempt[]

  @@index([studentId, servedAt])
  @@index([sessionId])
}
```

---

## 8.4 Evidence layer (L4) — append-only, the system of record

```prisma
model Attempt {
  id                 String @id @default(cuid())
  studentId          String
  activityInstanceId String
  microSkillId       String
  competencyId       String
  levelId            String
  pillar             Pillar
  strand             StrandKey
  band               DifficultyBand
  templateId         String            // format — needed for the format-diversity gate
  assessmentType     AssessmentType

  attemptOrdinal Int                   // 1 = first; only ordinal 1 updates BKT
  score          Float                 // 0..1
  isCorrect      Boolean?
  latencyMs      Int
  hintsUsed      Int      @default(0)
  retryCount     Int      @default(0)

  rawResponse Json
  rubricScores Json?                   // per-dimension, with span annotations
  asrOutput    Json?                   // phoneme scores, timing, confidence
  asrConfidence Float?

  // Evidence quality flags — control whether this row feeds mastery inference
  lowEffort         Boolean @default(false)
  excludedFromMastery Boolean @default(false)
  exclusionReason   String?
  isProductive      Boolean @default(false)   // speech/writing → productive_evidence gate
  isTransfer        Boolean @default(false)   // novel context → transfer_evidence gate
  isRetentionCheck  Boolean @default(false)
  daysSinceLastEncounter Int?

  errorCodes String[]                  // detected error-pattern codes

  contentVersion    Int                // pin the version this was earned against
  microSkillVersion Int

  createdAt DateTime @default(now())

  student          Student          @relation(fields: [studentId],          references: [id])
  activityInstance ActivityInstance @relation(fields: [activityInstanceId], references: [id])
  microSkill       MicroSkill       @relation(fields: [microSkillId],       references: [id])

  @@index([studentId, microSkillId, createdAt])
  @@index([studentId, createdAt])
  @@index([studentId, strand, createdAt])
  @@index([microSkillId, createdAt])          // for item calibration jobs
}

model LearningSession {
  id        String   @id @default(cuid())
  studentId String
  startedAt DateTime @default(now())
  endedAt   DateTime?
  plannedComposition Json              // what the planner intended
  actualComposition  Json
  levelId   String
  meanBand  Float?
  xpEarned  Int      @default(0)
  completed Boolean  @default(false)
  abortReason String?                  // "frustration" | "timeout" | "user"
  frustrationIndex Float?

  student    Student            @relation(fields: [studentId], references: [id])
  activities ActivityInstance[]

  @@index([studentId, startedAt])
}
```

---

## 8.5 Inference layer (L5) — derived, rebuildable

```prisma
model LanguageDNA {
  id        String @id @default(cuid())
  studentId String @unique

  currentLevelId String
  currentBandDefault DifficultyBand @default(D2_SUPPORTED)
  placementConfidence Float?

  // Behavioural & affective
  engagementScore    Float @default(0.5)
  frustrationIndex   Float @default(0.0)
  confidenceCalibration Float?          // predicted − actual, signed
  consistencyScore   Float @default(0.0)
  attentionSpanEstMs Int?
  optimalTimeOfDay   Int?

  interests      String[]
  l1Background   String?
  accessibility  Json?

  lastRecomputedAt DateTime @default(now())
  schemaVersion    Int      @default(1)   // bump to force a full rebuild

  student Student       @relation(fields: [studentId], references: [id])
  strands StrandScore[]
  errorPatterns ErrorPattern[]

  @@index([currentLevelId])
}

model StrandScore {
  id       String    @id @default(cuid())
  dnaId    String
  strand   StrandKey

  score       Float                     // 0..1000, decay-adjusted — the reportable value
  elo         Int    @default(1200)
  confidence  Float  @default(0.0)
  trend       Float  @default(0.0)
  volatility  Float  @default(0.0)
  ceiling     Float  @default(0.0)
  evidenceCount Int  @default(0)
  lastEvidenceAt DateTime?

  dna LanguageDNA @relation(fields: [dnaId], references: [id], onDelete: Cascade)
  @@unique([dnaId, strand])
}

model Mastery {
  id           String @id @default(cuid())
  studentId    String
  microSkillId String

  state MasteryState @default(INTRODUCED)
  pLearned Float     @default(0.15)      // BKT posterior
  currentEstimate Float                  // m(t) — decay-adjusted
  peakEstimate    Float

  // Gate counters — Phase 5 §5.1
  attemptCount     Int @default(0)
  sessionCount     Int @default(0)
  distinctFormats  Int @default(0)
  formatIds        String[]
  hasProductiveEvidence Boolean @default(false)
  hasTransferEvidence   Boolean @default(false)
  retentionChecksPassed Int @default(0)
  retentionChecksFailed Int @default(0)

  // Decay model — Phase 5 §5.4
  halfLifeDays  Float    @default(7.0)
  lastSuccessAt DateTime?
  nextReviewDue DateTime?

  firstAttemptAt DateTime?
  masteredAt     DateTime?
  earnedAtVersion Int?                   // curriculum version pinning

  student    Student    @relation(fields: [studentId],    references: [id])
  microSkill MicroSkill @relation(fields: [microSkillId], references: [id])

  @@unique([studentId, microSkillId])
  @@index([studentId, state])
  @@index([studentId, nextReviewDue])    // the retention queue — hot path
}

model CompetencyMastery {
  id           String @id @default(cuid())
  studentId    String
  competencyId String
  state        MasteryState @default(INTRODUCED)
  weightedScore Float @default(0.0)
  sealedAt     DateTime?

  @@unique([studentId, competencyId])
  @@index([studentId, state])
}

model ErrorPattern {
  id       String @id @default(cuid())
  dnaId    String
  code     String                        // "SVA_THIRD_PERSON_S"
  strand   StrandKey
  count    Int    @default(0)
  opportunities Int @default(0)
  trend    String @default("new")        // new | rising | flat | declining | resolved
  firstSeenAt DateTime @default(now())
  lastSeenAt  DateTime @default(now())
  remediationAttempts Int @default(0)
  remediationApproaches String[]
  escalatedToTeacher Boolean @default(false)
  examples Json

  dna LanguageDNA @relation(fields: [dnaId], references: [id], onDelete: Cascade)
  @@unique([dnaId, code])
  @@index([dnaId, trend])
}

model AIRecommendation {
  id        String @id @default(cuid())
  studentId String
  generatedAt DateTime @default(now())
  horizon   String                       // "next_activity" | "next_session" | "next_week"

  microSkillId String?
  band         DifficultyBand?
  templateId   String?
  rationale    Json                      // which signal rules fired — auditable
  signalSnapshot Json
  priority     Float

  servedAt   DateTime?
  outcome    String?                     // accepted | overridden | expired
  @@index([studentId, generatedAt])
  @@index([studentId, servedAt])
}
```

`AIRecommendation.rationale` is required, not optional: every adaptive decision must be
explainable after the fact. Without it, a teacher asking "why did it give my student this?"
has no answer, and the system cannot be debugged when it misbehaves.

---

## 8.6 Game layer (L7)

```prisma
model Journey {
  id      String @id             // "journey:3.2:SENTENCE"
  levelId String
  pillar  Pillar
  name    String                 // "The Sentence Workshop"
  nameByGroup Json               // age-appropriate label variants
  sortOrder Int

  level  MasteryLevel @relation(fields: [levelId], references: [id])
  quests Quest[]
  @@unique([levelId, pillar])
}

model Quest {
  id           String @id @default(cuid())
  journeyId    String
  competencyId String @unique    // 1:1 with Competency
  name         String            // "Join the Clauses"
  narrativeIntro String? @db.Text
  sortOrder    Int
  skillBadgeId String?

  journey    Journey    @relation(fields: [journeyId],    references: [id])
  competency Competency @relation(fields: [competencyId], references: [id])
  progress   QuestProgress[]
  @@index([journeyId])
}

model QuestProgress {
  id        String @id @default(cuid())
  studentId String
  questId   String
  state     String @default("locked")   // locked | open | cleared | sealed
  stars     Int    @default(0)
  clearedAt DateTime?
  sealedAt  DateTime?

  quest   Quest   @relation(fields: [questId],   references: [id])
  student Student @relation(fields: [studentId], references: [id])
  @@unique([studentId, questId])
  @@index([studentId, state])
}

model BadgeDefinition {
  id       String @id
  tier     Int                   // 1 skill · 2 journey · 3 crest · 4 wizard · 5 cross-cutting
  name     String
  description String
  criteria Json
  assetRef String
  competencyId String?
  journeyId    String?
  levelId      String?
  requiresHumanReview Boolean @default(false)   // true for LANGUAGE_WIZARD

  awards BadgeAward[]
}

model BadgeAward {
  id        String @id @default(cuid())
  studentId String
  badgeId   String
  rank      String?              // bronze | silver | gold
  awardedAt DateTime @default(now())
  evidenceRef Json
  reviewedById String?

  badge   BadgeDefinition @relation(fields: [badgeId],   references: [id])
  student Student         @relation(fields: [studentId], references: [id])
  @@unique([studentId, badgeId, rank])
}

model XPLedger {
  id        String @id @default(cuid())
  studentId String
  amount    Int
  reason    String
  attemptId String?
  awardedAt DateTime @default(now())
  @@index([studentId, awardedAt])
}

model Streak {
  id        String @id @default(cuid())
  studentId String @unique
  current   Int    @default(0)
  longest   Int    @default(0)
  lastQualifyingDay DateTime?
  freezesHeld Int  @default(0)
  restDaysUsedThisWeek Int @default(0)
}

model DailyQuest {
  id        String @id @default(cuid())
  studentId String
  forDate   DateTime @db.Date
  kind      String             // core | skill | spark
  payload   Json
  completedAt DateTime?
  @@unique([studentId, forDate, kind])
}

model LevelProgression {
  id        String @id @default(cuid())
  studentId String
  levelId   String
  enteredAt DateTime @default(now())
  exitedAt  DateTime?
  direction String?            // up | down | initial_placement
  gateAttempts Int @default(0)
  gatePassedAt DateTime?
  reason    Json               // which conditions were met — auditable
  @@index([studentId, enteredAt])
}
```

---

## 8.7 Authoring & governance

```prisma
model CurriculumRelease {
  id          String @id @default(cuid())
  version     String @unique      // "2026.09.1"
  publishedAt DateTime?
  publishedById String?
  invariantReport Json            // the Phase 4 §4.7 coverage checks
  changeLog   Json
  status      ContentStatus @default(DRAFT)
}

model ReviewTask {
  id        String @id @default(cuid())
  targetType String               // content | lesson | concept | competency
  targetId   String
  assignedToId String?
  gateResults Json                // the 7-gate report
  decision   String?              // approve | reject | revise
  notes      String? @db.Text
  createdAt  DateTime @default(now())
  decidedAt  DateTime?
  @@index([assignedToId, decision])
  @@index([targetType, decision])
}

model GenerationRequest {
  id        String @id @default(cuid())
  tier      ContentTier
  address   Json                  // the full mandatory address payload
  model     String
  promptHash String
  responseRaw Json
  gateResults Json
  accepted  Boolean @default(false)
  rejectionReasons String[]
  costTokens Int?
  latencyMs  Int?
  createdAt DateTime @default(now())
  @@index([createdAt, accepted])
}

model HumanAuditSample {
  id        String @id @default(cuid())
  attemptId String                // 2% sample of LLM-scored writing/speech
  llmScores Json
  humanScores Json
  agreement Float?
  raterId   String?
  createdAt DateTime @default(now())
  @@index([createdAt])
}
```

---

## 8.8 Relationship summary

```
School ──< Class ──< Enrollment >── Student
                                      │
                                      ├──1:1── LanguageDNA ──< StrandScore (13)
                                      │                     └──< ErrorPattern
                                      ├──<  Mastery >── MicroSkill
                                      ├──<  CompetencyMastery >── Competency
                                      ├──<  Attempt >── ActivityInstance >── Content
                                      ├──<  LearningSession ──< ActivityInstance
                                      ├──<  QuestProgress >── Quest ──1:1── Competency
                                      ├──<  BadgeAward >── BadgeDefinition
                                      ├──<  XPLedger
                                      ├──1:1─ Streak
                                      ├──<  LevelProgression >── MasteryLevel
                                      └──<  AIRecommendation

MasteryLevel ──< Competency ──< MicroSkill ──< LearningOutcome ──< Content
     │               │              │
     └──< Journey    │              └── Concept ──< ConceptPrerequisite (DAG)
                     └──< CompetencyPrerequisite (DAG)

Domain ──< Competency          ActivityTemplate ──< ActivityInstance
```

### The three cardinality facts that define the system

```
15 levels × 8 pillars                = 120 journeys        (all non-empty — invariant)
120 journeys × ~12 competencies      = ~1,400 quests
~1,400 competencies × ~5 micro skills = ~7,000 mastery nodes
15 levels × 5 bands                  = 75 difficulty states
```

---

## 8.9 Legacy migration

### Pillar mapping (5 → 8)

| Legacy `LearningPillar` | New `Pillar` | Split rule |
|---|---|---|
| `SOUND_FOUNDATION` | `SOUND` | direct |
| `LANGUAGE_FOUNDATION` | `WORD` + `SENTENCE` | vocabulary/spelling/morphology → WORD; grammar/structure → SENTENCE |
| `CORE_SKILLS` | `UNDERSTANDING` + `EXPRESSION` | listening/reading → UNDERSTANDING; speaking/writing → EXPRESSION |
| `COMMUNICATION` | `COMMUNICATION` | direct |
| `HIGHER_ORDER_LANGUAGE` | `THINKING` | direct |
| *(none)* | `MASTERY` | **new** — no legacy content; retention/transfer activities must be authored |

Two legacy values fan out to two pillars each. The split is decidable from each content row's
`ContentType` and its `ProgressionStage`, so migration is mechanical for the majority of rows;
ambiguous rows (roughly the `LANGUAGE_FOUNDATION` items tagged `INTERACTIVE`) route to a review
queue rather than being guessed.

### Level mapping (20 → 15)

| Legacy | New | | Legacy | New |
|---|---|---|---|---|
| 1 | 1.1 | | 11 | 3.1 |
| 2 | 1.2 | | 12 | 3.2 |
| 3 | 1.3 | | 13 | 3.2 |
| 4 | 2.1 | | 14 | 3.3 |
| 5 | 2.1 | | 15 | 4.1 |
| 6 | 2.2 | | 16 | 4.1 |
| 7 | 2.2 | | 17 | 4.2 |
| 8 | 2.3 | | 18 | 4.3 |
| 9 | 2.3 | | 19 | 5.1 |
| 10 | 3.1 | | 20 | 5.2 |

Level 5.3 (Language Wizard) has **no legacy equivalent** — it is a new terminal level and its
content must be authored from scratch.

### Migration sequence

1. Seed `MasteryLevel` (15), `Domain` (32), `Pillar`, and the `ActivityTemplate` inventory.
2. Author `Concept` and `Competency` for the 120 (level, pillar) cells. **Blocking for launch** —
   the invariant checker will not pass a release with empty cells.
3. Map legacy `CurriculumUnit` / `Lesson` / `LessonContent` into `Content` with full addresses.
   Unmappable rows → `ReviewTask`, not silently dropped.
4. Backfill `LanguageDNA` + `StrandScore` for existing students from `StudentProgress`,
   `ReadingSession`, `SpeakingSession`, `WritingSession`, `ListeningSession`. Set
   `placementConfidence` low so the engine re-diagnoses early rather than trusting derived
   estimates.
5. Map legacy `StudentProgress.level` → new level via the table above. Existing badges are
   preserved as `BadgeAward` rows against Tier 1/4 definitions.
6. Retire `ProgressionStage`; keep the `LearningPillar` enum as a database view for one release
   so existing queries and dashboards do not break during rollout.
7. Recompute all `Mastery` from `Attempt` history where attempts exist; where they do not, mark
   micro skills `INTRODUCED` with low confidence rather than inferring mastery from completion
   records — inheriting completion-based mastery would poison the new engine's core claim.

Step 7's constraint is the important one: **legacy completion data must not be imported as
mastery.** It is imported as *exposure*. Learners will re-prove skills quickly if they have them,
and the engine's estimates stay honest.

> **Implementation note:** per `AGENTS.md`, this repo's Next.js version differs from common
> knowledge. Read `node_modules/next/dist/docs/` before writing any route, server action, or
> data-access code against this schema.
