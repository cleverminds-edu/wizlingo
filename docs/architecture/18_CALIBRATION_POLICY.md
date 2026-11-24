# PHASE 18 — Calibration Policy

**Calibration is a first-class system concern:** *does the system's assumptions actually hold for
real learners?* This document makes its thresholds configurable without making them negotiable.

---

## 18.1 The problem with a universal threshold

Phase 14 §14.6 specified `attempts ≥ 100` and `discrimination ≥ 0.15` for `CALIBRATING → TRUSTED`.
The principle is right. The number is a placeholder that would become an architectural dead end,
because content families have radically different statistical characteristics:

| Family | Attempts per item per year (est.) | Score type | Reaches 100? |
|---|---|---|---|
| Level 2.2 vocabulary MCQ | 4,000+ | binary, `P(G)=0.25` | in days |
| Phonics discrimination (T2P template) | 12,000+ pooled | binary | in hours |
| Level 3.2 reading comprehension | 800 | binary | in weeks |
| Level 4.1 extended speaking | 60 | continuous rubric | in ~18 months |
| Level 5.2 professional document | 25 | continuous rubric | **never** |
| Level 5.3 capstone | 3–8 | human-judged | **never** |

Two independent problems. **High-volume binary items** need *more* than 100 attempts, not fewer:
with `P(G)=0.25`, a large fraction of correct responses carry no information, so the standard error
on a discrimination estimate at N=100 is uncomfortably wide. And **low-volume continuous items**
will never reach 100 — under a universal rule they remain `CALIBRATING` forever, permanently
excluded from satisfying `Mastered` gates, which silently makes the `productive_evidence` gate
unsatisfiable at Levels 5.x. That is a catastrophic failure that would surface only after months of
live operation, as senior learners mysteriously unable to master anything.

So: **minimum calibration evidence is policy, not a constant** — and, because volume alone cannot
solve the low-N case, calibration needs **routes**, not merely different numbers.

---

## 18.2 The statistical reasoning behind the numbers

Not arbitrary. Three facts drive the thresholds.

**1. Guess rate inflates the required N.** The information a binary item yields about ability is
reduced by the proportion of correct responses attributable to guessing. Effective sample size is
roughly `N_eff ≈ N · (1 − P(G))²` for discrimination estimation. So to match the precision a
`P(G)=0.05` open-cloze item achieves at N=80, a `P(G)=0.50` two-option item needs
`80 · (0.95/0.50)² ≈ 289`. This is why the high-guess-rate families have the *highest* thresholds —
the opposite of the intuition that easy items need less validation.

**2. Continuous scores stabilise faster than binary ones.** A 0–5 rubric dimension carries far more
information per observation than a right/wrong bit. Correlation estimates on continuous measures
reach comparable standard error at roughly a third the sample size. Hence N=30–40 for rubric-scored
families is *not* a weakened standard; it is the equivalent standard.

**3. Below about N=15, no statistical route exists at all.** The confidence interval on any
correlation estimate is wider than the range of decisions it would inform. For these families the
honest answer is not a lower threshold but a **different kind of evidence** — expert judgement plus
golden-comparison plus mandatory human audit.

---

## 18.3 The four calibration routes

| Route | Applies when | Calibration evidence | Graduation criterion |
|---|---|---|---|
| **A · STATISTICAL** | Item accumulates ≥40 attempts within the staleness window | Item-level p-value, point-biserial discrimination, distractor analysis | Per-family thresholds, §18.5 |
| **B · POOLED** | Individual instances are unique but share a validated structure (T2P templates; large pools of one spec) | Statistics aggregated at **template** or **spec** level | Template graduates; instances inherit |
| **C · RATER-AGREEMENT** | Continuous rubric or ASR scoring; moderate volume | Agreement between the automated scorer and human raters on a sample | κ or r vs. human, §18.6 |
| **D · EXPERT-ANCHORED** | Volume too low for any statistical route (<15 expected attempts/quarter) | Expert review + golden comparison + 100% human audit of learner work | Named reviewers approve; audit sustained |

Route selection is **automatic**, from expected volume and scoring method — an author does not
choose it and cannot choose a weaker one:

```
selectRoute(spec):
    if spec.templateId is a ParameterizedTemplate           → B (pooled)
    elif spec.scoringMethod ∈ {RUBRIC_LLM, RUBRIC_HUMAN, ASR}
         and expectedQuarterlyAttempts ≥ 15                 → C (rater-agreement)
    elif expectedQuarterlyAttempts < 15                     → D (expert-anchored)
    else                                                     → A (statistical)

# expectedQuarterlyAttempts is estimated from active learners at the level ×
# the spec's serving frequency, and is re-estimated monthly from actuals.
```

### Route D is not a loophole

An item on Route D is **not** less controlled than one on Route A — it is controlled differently,
and in some respects more tightly:

| | Route A | Route D |
|---|---|---|
| Reviewers before serving | sampled | **2 mandatory** |
| Golden comparison | Stage 8 tolerance | Stage 8 **tightened** tolerance |
| Human audit of learner work | 2% | **100%** |
| Trust granted by | statistics | named humans, with an audit trail |
| Retirement trigger | discrimination | reviewer finding, or audit disagreement |

Route D is how the Level 5.3 capstone and the Level 5.2 professional documents get trusted at all —
and it is why the Language Wizard award requires two human reviewers (Phase 15 §15.7). That
requirement was always the Route D pattern; it is now named and generalised.

---

## 18.4 Policy resolution

```prisma
model CalibrationPolicy {
  id   String @id                      // "cp.recognise.mcq4.standard"
  name String
  route String                          // A_STATISTICAL | B_POOLED | C_RATER | D_EXPERT

  // ── Scope: most specific match wins (§ resolution order below) ──
  competencyId    String?
  learningOutcomeId String?
  behaviourClass  BehaviourClass?
  contentType     String?
  templateId      String?
  assessmentType  AssessmentType?
  levelOrdinalMin Int?
  levelOrdinalMax Int?
  band            DifficultyBand?
  riskTier        String?
  evidenceType    String?               // receptive | productive | transfer
  guessRateMin    Float?
  guessRateMax    Float?

  // ── Thresholds (configurable, floored) ──
  minAttempts            Int
  minDistinctLearners    Int
  minDiscrimination      Float?
  pValueMin              Float?
  pValueMax              Float?
  maxHighMasteryDistractorRate Float?
  minRaterAgreement      Float?         // κ or r, Route C
  minRaterSampleSize     Int?
  requiredReviewers      Int?           // Route D
  humanAuditRate         Float          // proportion of learner work audited

  // ── Quarantine sub-thresholds ──
  quarantineMinAttempts  Int
  quarantineMaxAbandon   Float
  quarantineCohortCap    Float          // e.g. 0.02
  calibratingCohortCap   Float          // e.g. 0.20
  calibratingMasteryWeight Float        // e.g. 0.5

  // ── Retirement triggers ──
  retireBelowDiscrimination Float?
  retirePValueBelow      Float?
  retirePValueAbove      Float?
  retireReportCount      Int
  retireAbandonRate      Float

  // ── Staleness: what happens if the threshold is never reached ──
  stalenessWindowDays    Int
  onStaleAction          String         // ESCALATE_ROUTE | RETIRE | HOLD_FOR_REVIEW

  // ── Governance ──
  version        Int      @default(1)
  approvedByLevel String                // must be "A"
  approvalRef    String                 // Level A minute reference
  changeReason   String   @db.Text      // REQUIRED — why this differs from the default
  supersedesId   String?
  effectiveFrom  DateTime
  createdAt      DateTime @default(now())

  @@index([route, behaviourClass])
  @@index([contentType, band])
}
```

### Resolution order — most specific wins, fail closed

```
1.  learningOutcomeId              (most specific)
2.  competencyId + templateId
3.  competencyId
4.  behaviourClass + contentType + band
5.  behaviourClass + contentType
6.  contentType + guessRate range
7.  behaviourClass
8.  assessmentType
9.  riskTier
10. GLOBAL DEFAULT                 (most conservative — see below)
```

**Fail-closed rule:** if no policy matches at any level, the **global default** applies, and the
global default is deliberately the *strictest* policy in the system, not a permissive fallback:

```yaml
id: cp.global.default
route: A_STATISTICAL
minAttempts: 200
minDistinctLearners: 150
minDiscrimination: 0.25
pValueMin: 0.35 ; pValueMax: 0.90
humanAuditRate: 0.10
quarantineCohortCap: 0.01
stalenessWindowDays: 90
onStaleAction: HOLD_FOR_REVIEW
changeReason: >
  Deliberately conservative. An unmatched content family is one nobody has
  reasoned about, and it must be harder to trust than one that has been.
```

A new content type therefore enters the system *harder* to trust, not easier — which is the correct
direction and the opposite of what a permissive default produces.

---

## 18.5 Route A & B thresholds by family

Initial values. These are the numbers the pilot (Phase 16 §16.5) will test, and they are policy
precisely because the pilot may contradict them.

| Policy id | Family | Route | min attempts | min learners | min discrim. | p-value band | audit |
|---|---|---|---|---|---|---|---|
| `cp.recognise.select2` | 2-option select, `P(G)=0.50` | A | **280** | 200 | 0.20 | 0.45–0.92 | 2% |
| `cp.recognise.mcq4.standard` | 4-option MCQ, `P(G)=0.25` | A | **150** | 110 | 0.20 | 0.35–0.90 | 2% |
| `cp.recognise.matching` | matching 5 pairs, `P(G)=0.15` | A | 110 | 80 | 0.18 | 0.35–0.90 | 2% |
| `cp.construct.cloze-banked` | cloze with word bank, `P(G)=0.12` | A | 100 | 75 | 0.18 | 0.35–0.90 | 2% |
| `cp.construct.cloze-open` | open cloze, `P(G)=0.05` | A | **80** | 60 | 0.18 | 0.30–0.88 | 2% |
| `cp.transform.deterministic` | transformation, deterministic key | A | 80 | 60 | 0.20 | 0.30–0.90 | 2% |
| `cp.phonics.discrimination.t2p` | phonics minimal-pair template | B | 60 / template | 45 | 0.15 | 0.40–0.92 | 2% |
| `cp.vocab.retrieval.t2p` | vocabulary retrieval template | B | 60 / template | 45 | 0.18 | 0.35–0.90 | 2% |
| `cp.reading.comprehension` | reading comprehension items | A | 100 | 80 | 0.22 | 0.35–0.88 | 3% |
| `cp.reading.inference` | inference items | A | 100 | 80 | **0.25** | 0.30–0.85 | 3% |
| `cp.listening.comprehension` | listening comprehension | A | 100 | 80 | 0.22 | 0.35–0.88 | 3% |
| `cp.thinking.fallacy` | fallacy identification | A | 90 | 70 | 0.25 | 0.30–0.85 | 5% |
| `cp.assessment.milestone` | Level Assessment items | A | **200** | 160 | **0.30** | 0.40–0.85 | 10% |
| `cp.assessment.diagnostic` | Diagnostic items | A | **250** | 200 | **0.30** | 0.30–0.90 | 5% |

Three patterns are deliberate:

- **Guess rate drives N.** `cp.recognise.select2` needs 280 attempts and `cp.construct.cloze-open`
  needs 80, for the same statistical precision (§18.2 fact 1). The two-option items serving
  pre-primary learners are the *slowest* to earn trust.
- **Stakes drive discrimination.** Milestone and diagnostic items require 0.30 rather than 0.20,
  because a weakly discriminating item in a Level Assessment mis-places learners for months.
- **Inference items require higher discrimination than literal ones.** An inference item that
  discriminates at 0.18 is probably measuring vocabulary or background knowledge, not inference —
  the confound Gate 7 is designed to catch, verified empirically here.

---

## 18.6 Route C — rater-agreement thresholds

For rubric- and ASR-scored families, calibration asks a different question: *does the automated
scorer agree with a qualified human?* Discrimination is still tracked, but agreement is the gate.

| Policy id | Family | min attempts | rater sample | agreement metric | threshold | audit |
|---|---|---|---|---|---|---|
| `cp.asr.word` | single-word pronunciation | 50 | 20 | r vs. human phonetic rating | **0.80** | 5% |
| `cp.asr.phrase` | phrase/sentence pronunciation | 50 | 20 | r vs. human | 0.75 | 5% |
| `cp.asr.readaloud` | passage read-aloud (accuracy + rate) | 40 | 20 | r vs. human WCPM + error count | 0.85 | 3% |
| `cp.produce.writing-short` | sentence / paragraph, rubric | **35** | 25 | κ per dimension vs. human | **0.70** | 5% |
| `cp.produce.writing-extended` | essay, rubric | **20** | 20 | κ per dimension | **0.75** | 10% |
| `cp.perform.speaking-short` | ≤2-min talk | 35 | 25 | κ per dimension | 0.70 | 5% |
| `cp.perform.speaking-extended` | ≥5-min talk / presentation | **20** | 20 | κ per dimension | **0.75** | 10% |
| `cp.explain.metalinguistic` | explains a language point | 25 | 20 | κ | 0.75 | 10% |

### Agreement is per dimension, not aggregate

A writing scorer can agree well on Accuracy (largely mechanical) and badly on Organisation (genuinely
judgemental) while showing acceptable aggregate agreement. Since dimensions map to *different micro
skills* via `evidenceSignature.dimensions[].mapsTo` (Phase 17 §17.5), an aggregate figure would let
a badly-scored dimension corrupt a specific mastery node while looking healthy.

So: **every dimension must independently clear the threshold.** A dimension that fails is disabled —
its `mapsTo` micro skill receives no evidence from this outcome — while the rest continue. Partial
calibration is expressed as partial evidence, not as a blocked item.

Audit rates rise with level: 2% at Groups 1–3, **10% at Group 5** (Phase 5 §5.7), because LLM rubric
reliability on genuinely scholarly and professional work is the least established and the hardest to
verify.

---

## 18.7 Hard floors — what policy cannot override

**This is the safeguard that makes configurability safe.** Thresholds are policy; these are not.
They are constants in code, protected by database `CHECK` constraints, and changing them requires a
code change plus a Level A decision — not a policy edit.

```
FLOOR_MIN_ATTEMPTS_ANY_STATISTICAL      = 40      # below this, Route A is not available at all
FLOOR_MIN_DISTINCT_LEARNERS             = 25      # one class cannot calibrate an item
FLOOR_MIN_DISCRIMINATION                = 0.12    # nothing graduates below this, ever
FLOOR_MIN_RATER_AGREEMENT               = 0.65    # κ or r
FLOOR_MIN_RATER_SAMPLE                  = 15
FLOOR_HUMAN_AUDIT_RATE                  = 0.02    # 2% floor for all rubric/ASR scoring
FLOOR_ROUTE_D_REVIEWERS                 = 2
FLOOR_QUARANTINE_MIN_ATTEMPTS           = 15
FLOOR_QUARANTINE_COHORT_CAP             = 0.05    # quarantine may never exceed 5% of learners
FLOOR_CALIBRATING_COHORT_CAP            = 0.35
CEILING_CALIBRATING_MASTERY_WEIGHT      = 0.5     # calibrating evidence never counts at full weight

INVARIANT: no policy, at any specificity, may set a value weaker than its floor.
           A policy row violating a floor is rejected at write time.

INVARIANT: no policy may grant `CALIBRATING` content the ability to satisfy
           `Mastered` gates. This is not a threshold — it is the architecture
           (Phase 11 §11.4) and has no policy expression.
```

The last invariant is the important one. The *quantity* of evidence needed is configurable. The
*rule* that uncalibrated content cannot establish mastery is not, and there is deliberately no
policy field through which it could be relaxed. A team under pressure can make calibration faster;
it cannot make it optional.

### Governance of threshold changes

| Change | Approval | Requires |
|---|---|---|
| Add a policy for a new family | Level A | `changeReason`, expected volume analysis, floor compliance |
| Loosen a threshold | **Level A + Psychometrician assent** | Evidence that the current value is mis-calibrated; the pilot data or equivalent; impact estimate on already-`TRUSTED` items |
| Tighten a threshold | Level A | `changeReason`; already-trusted items are grandfathered per Phase 15 §15.3 |
| Change a hard floor | **Level A + code change** | Written justification retained permanently |
| Change route selection logic | Level A + Psychometrician | — |

Per Phase 15 §15.1, the Psychometrician **sets** thresholds but **may not overrule a measurement**.
That separation is what stops a poorly performing family being made to look healthy by moving the
line — a threshold change is a claim about statistics, not a way to change a result.

---

## 18.8 Staleness — when the threshold is never reached

Previously unhandled, and it would have been a silent failure. An item that never accumulates enough
evidence sits in `CALIBRATING` indefinitely, contributing evidence at half weight and unable to
satisfy gates, with nothing signalling that anything is wrong.

```
nightly, per item:
  if trustState = CALIBRATING and age > policy.stalenessWindowDays:
      switch policy.onStaleAction:

        ESCALATE_ROUTE  →  re-run selectRoute() with ACTUAL observed volume
                           (typically A → C, or C → D)
                           re-evaluate against the new route's criteria

        HOLD_FOR_REVIEW →  flag to Level C; a reviewer decides:
                           promote via Route D, retire, or extend the window

        RETIRE          →  DEPRECATED; the pool is regenerated
                           (appropriate for high-volume families where staleness
                            means the item is simply never being selected)
```

Default windows: 30 days (Route A high-volume), 90 days (Route A standard, Route B), 180 days
(Route C), n/a (Route D — no statistical wait).

**Route escalation is the important path.** A Level 4.1 extended-speaking spec estimated at 60
attempts/quarter that actually receives 12 should not wait forever for Route C's N=20 — it should
escalate to Route D and be trusted on expert judgement with 100% audit. The system notices its own
volume estimate was wrong and changes how it establishes trust, rather than leaving the content in
limbo. Every escalation is logged and surfaced monthly, because a pattern of them means the volume
model is systematically wrong.

---

## 18.9 What calibration measures beyond content

Per the sixth concern — *does the system's assumptions actually hold for real learners?* — content
trust is only the first of five things calibration owns. The others have had no home until now.

| # | Assumption under test | Measure | Cadence | Action on failure |
|---|---|---|---|---|
| 1 | **Content behaves as specified** | item p-value, discrimination, agreement | nightly | trust state, retirement (§18.3) |
| 2 | **Declared cognitive demand is real** | measured difficulty vs. declared Bloom tier, across a competency | monthly | if agreement <70% system-wide, demote cognitive tier to a prior and stop treating it as a claim (Phase 11 §11.2) |
| 3 | **Prerequisites are real** | does mastery of P predict first-attempt success on D, controlling for ability? | monthly | `CurriculumChangeProposal` — `ADD/REMOVE_PREREQUISITE` (Phase 15 §15.10) |
| 4 | **Mastery predicts performance** | do `MASTERED` learners outperform `DEVELOPING` on dependents and on delayed checks? | monthly | recalibrate BKT parameters or gate thresholds; this is the **top-level validity test** |
| 5 | **Level ceilings are right** | attempts-to-mastery vs. the level's expected dwell; ceiling violations found post-hoc | quarterly | `RELEVEL_COMPETENCY` proposal, or revise `LevelDefaults` |
| 6 | **Scorers have not drifted** | validator accept/reject on the fixed golden corpus; rater agreement over time | monthly | block validator promotion; re-calibrate; re-score affected observations (Phase 17 §17.4) |
| 7 | **Grade ⊥ level separation holds** | engagement, abandon, and self-report for learners ≥2 groups above their level vs. matched peers at grade level | monthly | if separation fails, the differentiator is broken — Level A escalation |
| 8 | **The system is fair** | differential item functioning across region, L1, gender, school type at matched ability | quarterly | retire items; Safety & Inclusion review |

Row 4 is the one that matters most and the one most systems never measure. Everything else in this
architecture is instrumental to it:

> **If learners the system marks `MASTERED` do not measurably outperform learners it marks
> `DEVELOPING` — on dependent competencies and on delayed retention — then the mastery engine is
> not measuring mastery, and no amount of content quality or governance rigour compensates.**

Concretely: first-attempt success on dependent competencies should separate by ≥25 percentage points
between `MASTERED` and `DEVELOPING` at matched Elo, and `MASTERED` learners should pass delayed
retention at 2× the interval at ≥85%. Below those, the gates are mis-set. This is a pilot gate
criterion (Phase 16 §16.5) and a permanent monthly measure thereafter.

Row 7 is the commercial one: the grade⊥level claim is the product's differentiator, and it is
falsifiable. If Grade 9 learners at Level 2.2 abandon at materially higher rates than matched Grade
2 learners at Level 2.2, the environment axis is not doing its job — regardless of what expert
review said about the content.

```prisma
model CalibrationRun {
  id        String @id @default(cuid())
  assumption String            // which of the 8 rows
  scope     Json               // competency / level / family / global
  measure   Json               // metric values, CIs, cohort sizes
  verdict   String             // HOLDS | DEGRADED | FAILS
  actionTaken String?
  proposalId String?           // CurriculumChangeProposal, if filed
  runAt     DateTime @default(now())
  @@index([assumption, runAt])
  @@index([verdict, runAt])
}
```

---

## 18.10 Updates to earlier phases

| Phase | Was | Now |
|---|---|---|
| 14 §14.6 | `attempts ≥ 100`, `discrimination ≥ 0.15` hardcoded in the graduation rule | Read from the resolved `CalibrationPolicy`; the quoted values remain as `cp.reading.comprehension`-class defaults and are no longer universal |
| 14 §14.6 | `QUARANTINED → CALIBRATING` at `attempts ≥ 30` | `policy.quarantineMinAttempts`, floored at 15 |
| 14 §14.6 | cohort caps 2% / 20% | `policy.quarantineCohortCap` / `calibratingCohortCap`, floored at 5% / 35% |
| 14 §14.9 | `Attempt.masteryWeight` fixed at 1.0 / 0.5 / 0.0 | `policy.calibratingMasteryWeight`, ceilinged at 0.5 |
| 5 §5.7 | human audit at 2%, 10% at Level 5 | `policy.humanAuditRate`, floored at 2% |
| 11 §11.4 | trust lifecycle with fixed thresholds | thresholds policy-driven; **the lifecycle itself is not policy-driven and has no override** |
| 15 §15.9 | Health Score drives risk | unchanged; now also consumes `CalibrationRun` verdicts for assumptions 2–8 |

No earlier decision is reversed. The numbers became configuration; the rules did not.
