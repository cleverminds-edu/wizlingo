# PHASE 15 — Human Review & Curriculum Governance

Who is authorised to change what, how expert attention is allocated, and how review scales to
700,000 content items without 62 expert-years.

---

## 15.1 Governance roles

Six roles. Four are required by the brief; two are added because the operating model creates
responsibilities that would otherwise be unowned.

### 1. Curriculum Architect

**Owns:** the curriculum graph — pillars, levels, grade/age mapping, competency architecture,
prerequisite DAG, spiral progression, conceptual-change decisions, mastery policy.

**Qualification:** postgraduate qualification in curriculum/education or applied linguistics; ≥8
years designing K–12 language curricula; experience with at least one national or international
framework (CBSE/ICSE/IB/Cambridge) and CEFR.

**Authority:** sole approval on curriculum-graph changes. Casting vote on reviewer disagreement.
Cannot be delegated to AI under any circumstance.

### 2. Subject / Language Expert

**Owns:** linguistic accuracy — grammar, vocabulary, phonics, pronunciation, morphology,
orthography, register, language-development sequencing.

**Qualification:** postgraduate in linguistics, English, or ELT; ≥5 years teaching or materials
development; CELTA/DELTA or equivalent for the phonics/pronunciation specialisation. At least one
expert on the panel must have Indian-English phonology and L1-interference expertise for the
regional languages the platform serves.

**Authority:** binding veto on linguistic accuracy at any tier.

### 3. Pedagogical Reviewer

**Owns:** age appropriateness, cognitive development, instructional design, scaffolding, engagement,
feedback tone, register-toward-learner (including the condescension check that protects older
struggling learners).

**Qualification:** teaching qualification plus ≥5 years classroom experience in the relevant age
band. Reviewers are band-specialised: a pre-primary specialist does not review Grade 11 content.

**Authority:** binding veto on age appropriateness.

### 4. Assessment Expert

**Owns:** mastery evidence definitions, assessment validity, productive-evidence requirements,
retention requirements, scoring principles, rubric design, format eligibility.

**Qualification:** postgraduate in educational measurement, psychometrics, or language testing; ≥5
years in assessment design; working knowledge of IRT, reliability, and validity argumentation.

**Authority:** binding veto on assessment validity and on any mastery-threshold change.

### 5. Safety & Inclusion Reviewer *(added)*

**Owns:** bias, representation, cultural appropriateness, safeguarding, accessibility.

**Why added:** Gate 6 operates at **batch** level (Phase 9 §9.2) — representation imbalance is
invisible per item and only detectable across a corpus. Batch-level judgement is nobody else's job
in the four-role model, and "everyone reviews for bias" reliably means no one does.

**Qualification:** background in inclusive education, child safeguarding, or DEI in educational
publishing; familiarity with Indian regional, linguistic, caste, and religious sensitivities.

**Authority:** binding veto; may halt a batch or a release.

### 6. Psychometrician / Calibration Owner *(added)*

**Owns:** the CALIBRATION concern (Phase 11 §11.3) — item statistics, validator calibration against
golden content, discrimination thresholds, differential item functioning, health-score formula.

**Why added:** calibration is the concern that has no natural owner and therefore silently becomes
governance-by-meeting. It needs someone whose job is the measurement itself, structurally separated
from the people whose content is being measured.

**Qualification:** psychometrics or applied statistics; experience with IRT, DIF analysis, and
rater-agreement methodology.

**Authority:** sets and adjusts thresholds; may not overrule a measurement. Reports thresholds to
Level A governance for approval, and threshold *changes* are governed changes — otherwise a poorly
performing content family could be made to look healthy by moving the line.

---

## 15.2 Three governance levels

### LEVEL A — Strategic Governance

| | |
|---|---|
| **Reviews** | Framework changes · pillar definitions · level definitions & progression · CEFR alignment · mastery policy · AI generation policy · risk-tier policy · calibration thresholds · new language or market |
| **Membership** | Curriculum Architect (chair) · Lead Language Expert · Lead Pedagogical Reviewer · Assessment Expert · Safety & Inclusion Reviewer · Psychometrician · Product owner |
| **Cadence** | Quarterly, plus on-demand for any MAJOR curriculum revision or a halted release |
| **Decision rule** | Consensus; Curriculum Architect holds casting vote. Changes to mastery thresholds additionally require Assessment Expert assent. |
| **Output** | Approved `CurriculumRelease` version, published policy versions, minuted rationale |
| **Escalation from** | Level B, on any change classified MAJOR or above |

### LEVEL B — Curriculum Governance

| | |
|---|---|
| **Reviews** | Competency Contracts · micro-skill decomposition · prerequisites · learning outcomes · Content Specifications · Golden Content · assessment rules · misconception registries · remediation routes |
| **Membership** | Rotating panels drawn by role. Contract approval requires the reviewer set determined by risk tier (§15.7). |
| **Cadence** | Continuous, sprint-based. Target: contract decision within 5 working days of `COMPLETE`. |
| **Decision rule** | All required reviewers must approve. Disagreement → third reviewer → Curriculum Architect. |
| **Output** | `ContractApproval` rows, `GoldenApproval` rows, approved specs |
| **Escalation to** | Level A, when a contract change implies a progression or threshold change |

### LEVEL C — Content Quality Governance

| | |
|---|---|
| **Reviews** | AI-generated content samples · rejection-rate anomalies · learner/teacher reports · item statistics · hallucinations · inappropriate content · difficulty anomalies · drift indicators · validator calibration drift |
| **Membership** | Reviewer pool (band- and domain-specialised) + Psychometrician. Automated monitoring runs continuously; humans review the queue it produces. |
| **Cadence** | Automated: continuous, nightly aggregation. Human: daily triage of flagged items; weekly family-level review; monthly calibration review. |
| **Decision rule** | Reviewers may reject items and suspend content families unilaterally. Reinstating a suspended family requires two reviewers. |
| **Output** | Item decisions, family suspensions, `CurriculumChangeProposal` escalations |
| **Escalation to** | Level B when the root cause is a contract defect rather than a content defect |

The Level C escalation rule encodes an important diagnostic habit: **a content family with a
persistently high rejection rate is usually a symptom of an ambiguous contract, not a bad
generator.** Repeated failures on the same gate for the same competency should route to the
competency owner, not produce another round of prompt tuning.

---

## 15.3 Curriculum versioning and change classification

Extends Phase 9 §9.4 with the five classes the brief requires.

| Class | Definition | Effect on existing learners | Approval |
|---|---|---|---|
| **UNCHANGED** | Cosmetic only: wording of a description, illustration swap, topic set extension | None. Applies immediately. | Author |
| **MINOR REVISION** | Additive or clarifying: new content items, new activity format, clearer statement, new misconception entry, new exemplar, new micro skill **added** to a competency | Existing masteries retained. A new micro skill enters at `INTRODUCED`, so the competency roll-up dips and the planner schedules it. **No badge is withdrawn.** | Level B, 1 reviewer |
| **MAJOR REVISION** | Semantic change: mastery threshold changed, prerequisite added/removed, cognitive demand changed, CEFR remapped, micro skill split or merged, boundary tightened | Grandfathered. Existing `Mastered` records keep their state and are re-evaluated at their **next natural retention check**, not immediately. Split/merge follows the Phase 9 §9.4 conservative semantics. Requires a migration script authored alongside. | Level A |
| **DEPRECATED** | Competency retired, no replacement | Learners mid-quest finish on the pinned old version and seal normally. No new learners routed. Historical mastery retained and reportable, marked `retired-curriculum`. | Level A |
| **REPLACED** | Competency superseded by one or more new competencies | Mastery mapped per an explicit, authored mapping table (never inferred). Where mapping is partial, the learner's state is set to `min(state, PROFICIENT)` on the successor and one fresh piece of evidence is required before `MASTERED`. | Level A |

### The grandfathering rule, and why

Raising a mastery threshold and instantly demoting thousands of learners from `Mastered` would be
technically correct. It would also withdraw badges and level crests that learners, parents, and
schools have already seen — and it would do so for a reason the learner cannot understand, since
nothing about their performance changed.

Re-evaluating at the next natural retention check reaches the same accurate state within one
retention interval (21–90 days depending on level), without a visible mass demotion. Accuracy is
preserved; trust is preserved. This is the correct trade and it is a policy decision, so it is
recorded here rather than left to whoever writes the migration.

### Progress preservation guarantee

Stated as a testable invariant:

> **No curriculum change may reduce a learner's recorded mastery state at the moment the change is
> applied.** State may subsequently decline through the normal decay and retention mechanisms,
> which are learner-evidence-driven, never curriculum-driven.

Enforced by: version pinning (`Mastery.earnedAtVersion`), the append-only `Attempt` log, and the
rebuild guarantee (recomputing mastery from evidence must reproduce the original decision — which is
why `Attempt.masteryWeight` is materialised, Phase 14 §14.9).

---

## 15.4 Risk classes

| Risk | Content classes | Review posture |
|---|---|---|
| **LOW** | Vocabulary retrieval practice · simple sentence variations · repetitive drill · literal comprehension questions on validated passages · slot-filled T2P instances of a `TRUSTED` template | Automated validation + statistical sampling |
| **MEDIUM** | Reading passages · listening scripts · writing prompts · conversations & role-plays · grammar explanations · inference questions · speaking prompts | Automated validation + statistical sampling + periodic expert review of the family |
| **HIGH** | Phonics progression content · new grammar concepts · **conceptual-change competencies** · milestone & Level Assessments · CEFR-boundary content · pronunciation benchmarks · sensitive cultural content · special-needs interventions · board/exam preparation · final mastery assessments · Language Wizard capstones | **Mandatory expert review of every instance**, ≥2 reviewers |

---

## 15.5 Risk is computed, not assigned

**This is a correction to the brief's model.** Risk assigned at authoring time by content type
cannot respond to a family that starts producing bad content. The predictable failure: experts
diligently review phonics (correctly HIGH) while a "LOW risk" vocabulary family with a 30%
rejection rate serves 400,000 learners unexamined.

Risk is therefore a **computed, nightly-refreshed** property:

```
riskTier(contentFamily) = max(
    baseRisk(contentClass),              // the §15.4 table — the floor, never reduced below it
    noveltyRisk,
    healthRisk
)

noveltyRisk =
    HIGH    if spec is new (< 200 items ever generated for it)
            or promptTemplate version changed < 14 days ago
            or generating model changed < 14 days ago
            or golden content for this spec was superseded < 14 days ago
    MEDIUM  if spec has 200–2,000 items generated
    LOW     otherwise

healthRisk =
    HIGH    if healthScore < 0.60
            or rejectionRate30d > 0.20
            or mean discrimination < 0.12
            or learner reports per 1,000 attempts > 2.0
            or human-audit agreement < 0.70
    MEDIUM  if healthScore ∈ [0.60, 0.80)
            or rejectionRate30d ∈ [0.10, 0.20)
    LOW     otherwise
```

Two directional properties, both necessary:

- **Escalation is automatic and fast.** A degrading family raises its own risk tier within a day,
  which raises its sampling rate and — past the threshold in §15.6 — halts auto-publishing.
- **De-escalation is slow and floored.** A family may drop from HIGH to MEDIUM only after 60 days of
  healthy metrics, and never below its `baseRisk`. Conceptual-change content is HIGH forever, no
  matter how good its statistics, because the cost of an error there is a learner carrying a broken
  mental model into three subsequent levels.

---

## 15.6 The sampling model

### Per-family policy

```prisma
model ReviewPolicy {
  id            String @id @default(cuid())
  specKey       String?          // family scope: spec, or...
  competencyId  String?          // ...competency, or...
  contentClass  String?          // ...class-wide default
  riskTier      String

  samplingRate     Float         // proportion of generated items reviewed
  absoluteFloorPerMonth Int      // never fewer than this many, regardless of rate
  reviewerCount    Int
  requiredRoles    String[]
  rejectionThreshold Float       // above this → halt auto-publishing
  escalationThreshold Float      // above this → escalate to Level B (contract defect suspected)
  autoPublishEnabled Boolean @default(true)
  lastRecomputedAt DateTime @default(now())

  @@index([specKey])
  @@index([riskTier, autoPublishEnabled])
}
```

### Rates

| Risk | Sampling rate | Absolute floor | Reviewers | Rejection threshold | Escalation threshold |
|---|---|---|---|---|---|
| LOW | 1.5% | 5 items / month / active family | 1 | 10% | 20% |
| MEDIUM | 5% | 15 items / month / active family | 1 (2 if new) | 8% | 15% |
| HIGH | **100%** | — | 2 | 5% | 10% |

### The floor exists because rates alone decay to zero

A family with a long clean record and modest generation volume samples fewer and fewer items until
it samples none — and at that point its clean record stops being evidence of anything. The absolute
floor guarantees that every actively-generating family receives human eyes every month regardless
of its history. This is one of the seven anti-drift mechanisms (Phase 11 §11.7) and it is the
cheapest of them.

### Sampling is stratified, not random

Random sampling of a healthy family wastes reviewer time on items that are almost certainly fine.
The sample is allocated:

| Stratum | Share of sample | Rationale |
|---|---|---|
| Items that **barely passed** a gate (within 10% of a threshold) | 30% | Highest density of real defects |
| Items with **anomalous statistics** (p-value or discrimination outliers, ≥30 attempts) | 25% | Empirically suspicious |
| Items with the **largest golden divergence** that still passed Stage 8 | 20% | Drift detection |
| **Uniform random** | 25% | Guards against the strata themselves being wrong |

The last row is not decoration: stratification assumes we know where defects are, and the uniform
component is what would reveal that assumption being false.

### Halt behaviour

```
if rejectionRate(family, last 30 days or last 50 reviewed, whichever is larger) > rejectionThreshold:
      autoPublishEnabled ← false
      all QUARANTINED/CALIBRATING items in the family → held (not served)
      TRUSTED items continue serving (they are calibrated; the generator is the problem)
      family → HIGH risk
      Level C notified

if rejectionRate > escalationThreshold:
      escalate to Level B with the gate-failure distribution attached
      # a concentrated failure pattern usually indicates an ambiguous CONTRACT, not a bad generator
```

Note that halting stops *publishing*, not *serving*. Already-calibrated content keeps working, so a
generator problem never produces a content outage for learners.

---

## 15.7 What "expert validated" means exactly

Per content class: reviewer qualification, count, checklist, approval threshold, disagreement
process, escalation, audit trail. No vague usage of the phrase anywhere in the platform.

| Content class | Reviewers | Required roles | Approval threshold | Disagreement | Audit trail |
|---|---|---|---|---|---|
| **Competency Contract — standard** | 2 | Language Expert + Pedagogical Reviewer (band-matched) | Both approve | 3rd reviewer; unresolved → Curriculum Architect decides | `ContractApproval` per reviewer with checklist results |
| **Competency Contract — conceptual change** | 3 | + Curriculum Architect | All three approve | Curriculum Architect decides; rationale minuted to Level A | as above + Level A minute |
| **Competency Contract — assessment-bearing change** | 3 | + Assessment Expert | All three approve | Assessment Expert holds veto on validity | as above |
| **Content Specification (compiled)** | 0 | — | Automated: compiles + validates | n/a — a compiled spec cannot contradict its approved contract | `compiledFrom` provenance |
| **Content Specification (manual)** | 2 | Language Expert + Assessment Expert | Both approve | 3rd reviewer | `ReviewTask` |
| **Golden Content — P1/P2** | 2 | Language Expert + band-matched Pedagogical Reviewer | Both approve | 3rd reviewer | `GoldenApproval` per reviewer |
| **Golden Content — P0** (conceptual change, CEFR boundary, milestone) | 3 | + Assessment Expert | All three approve | Curriculum Architect decides | `GoldenApproval` + minute |
| **Tier 1 Canonical content** | 2 | Language Expert + Pedagogical Reviewer | Both approve | 3rd reviewer | `ReviewTask` |
| **Tier 2/2P — LOW risk** | 1, on sample | any qualified reviewer, band-matched | Reviewer approves | n/a (rejection is final; item discarded) | `ReviewTask` on sampled items |
| **Tier 2/2P — MEDIUM risk** | 1 (2 if novelty HIGH), on sample | band-matched | Approve | 2nd reviewer | `ReviewTask` |
| **Tier 2/2P — HIGH risk** | 2, every instance | Language Expert + band-matched Pedagogical Reviewer | Both approve | 3rd reviewer | `ReviewTask` per reviewer |
| **Tier 3 real-time** | 0 pre-hoc | — | Automated gates only | n/a | `ValidationReport`; post-hoc sampled audit of 0.5% of transcripts |
| **Sensitive cultural content** | +1 | + Safety & Inclusion Reviewer (**binding veto**) | All approve | Safety Reviewer's veto is final | `ReviewTask` + Level A notification |
| **Milestone / Level Assessment** | 3 | Assessment Expert + Language Expert + Pedagogical Reviewer | All approve | Assessment Expert decides | `ReviewTask` + Level B minute |
| **Rubric / scoring change** | 2 | Assessment Expert + Psychometrician | Both approve | Level A | Level A minute |
| **Validator configuration** | 1 + calibration | Psychometrician | Passing golden calibration (Phase 14 §14.5) **and** approval | Level A | calibration record |
| **LANGUAGE WIZARD award** | **≥2 human reviewers + taught explanation** | Assessment Expert + Curriculum Architect or delegate | Both approve capstone at publication standard **and** teaching artefact accurate | 3rd reviewer; Curriculum Architect decides | `BadgeAward.reviewedById` + full evidence pack |

**The Language Wizard rule is unchanged from Phase 7 §7.5 and is not weakened.** Two human
reviewers minimum, plus the taught explanation, plus the quantitative gates (13 strands ≥4.5 with
none below 4.0, 90-day stability, two verified transfer domains). No AI-only path exists.

### Reviewer checklists

Each role reviews against its own checklist, and only its own — a reviewer asked to check
everything checks nothing carefully. Results are stored item-by-item in
`ContractApproval.checklistResults` / `ReviewTask.gateResults`, so an audit can see *what* was
checked, not merely that someone clicked approve.

| Role | Checklist covers |
|---|---|
| Language Expert | grammaticality · vocabulary within ceiling · collocation naturalness · register consistency · phonics/orthographic accuracy · variety consistency (en-IN) · factual accuracy |
| Pedagogical Reviewer | age appropriateness both directions (childish *and* over-demanding) · cognitive tier match · scaffold appropriateness for band · feedback tone · engagement · instructional sequence within the item |
| Assessment Expert | key correctness · unique defensibility · distractor plausibility · misconception mapping · construct validity · evidence type matches the outcome · guess-rate conformance · rubric completeness |
| Safety & Inclusion | stereotyping · representation (batch) · cultural appropriateness · safeguarding · accessibility · name/context inclusivity |
| Curriculum Architect | prerequisite integrity · spiral consistency · conceptual-change handling · CEFR alignment · progression implications |

### Reviewer quality is itself monitored

Reviewers are not assumed reliable. Tracked per reviewer:
- **Agreement with peers** on double-reviewed items (Cohen's κ; below 0.6 triggers recalibration).
- **Downstream validity**: items a reviewer approved that later auto-retired on bad statistics. A
  reviewer whose approvals retire at well above the pool rate is systematically missing something.
- **Golden blind-tests**: known `ACCEPTABLE` and `NON_EXEMPLAR` items injected into review queues at
  ~2%. A reviewer who approves non-exemplars is retrained.
- **Throughput vs. quality**: rapid approvals correlated with downstream retirement indicate
  rubber-stamping.

Without this loop, "expert validated" degrades into "a human clicked approve," which is exactly the
vagueness the brief asked us to eliminate.

---

## 15.8 Does this actually scale?

The question the operating model has to answer numerically, since "sampling scales" is an assertion
until costed.

### Full library at build-out

```
~1,400 competencies × ~5 micro skills             = ~7,000 micro skills
~7,000 micro skills × ~2 outcomes × ~6 specs      = ~84,000 content specifications
~84,000 specs × ~8 pooled instances (avg)         ≈ ~700,000 content items
```

### Cost under 100% human review (the model the brief correctly rejects)

```
700,000 items × 8 min mean review               = 93,300 hours
÷ 1,500 productive hours per expert-year        = 62 expert-years
```

At Indian curriculum-expert market rates this is a multi-million-dollar recurring cost that scales
linearly with content volume, and it still does not establish that any item *works*.

### Cost under the risk-based model

| Tier / risk | Items | Review rate | Reviewers | Min/item | Hours |
|---|---|---|---|---|---|
| T1 Canonical (HIGH) | 4,500 | 100% | 2 | 10 | 1,500 |
| T2/T2P HIGH risk (~8% of volume) | 55,600 | 100% | 2 | 8 | **14,830** |
| T2/T2P MEDIUM (~42%) | 292,000 | 5% + floor | 1 | 6 | 1,460 |
| T2/T2P LOW (~50%) | 348,000 | 1.5% + floor | 1 | 4 | 348 |
| Golden Content | 2,730 | 100% | 2–3 | 25 | 1,140 |
| Competency Contracts | 1,400 | 100% | 2–3 | 45 | 1,750 |
| Validator calibration + audit | — | monthly | 1 | — | 400 |
| Level C triage + family review | — | continuous | pool | — | 1,200 |
| Human audit of LLM-scored learner work (2%, 10% at L5) | — | ongoing | pool | — | 900 |
| **Total** | | | | | **~23,500 hours** |

**≈ 15.7 expert-years**, spread across a ~3-year build — roughly **5–6 FTE reviewers at peak**.
That is a real organisation, but a fundable and hireable one, and it is 4× cheaper than the naive
model while producing *better* guarantees, because the effort is concentrated where error is costly.

### The dominant cost, and the lever

HIGH-risk review is 63% of total hours. The `baseRisk` table (§15.4) is therefore the most
cost-sensitive artefact in the governance model, and it deserves Level A scrutiny — classifying a
content class HIGH that does not need to be adds thousands of hours; classifying one LOW that
needed HIGH puts a broken mental model into three subsequent levels.

Two structural cost reductions are available and both are already designed in:
- **T2P over T2** where possible: one reviewed template serves unlimited instances, so review cost
  is per-template, not per-item. Raising T2P's share of MEDIUM/LOW volume from 38% to 60% removes
  roughly 3,000 hours.
- **De-escalation with a floor**: families that earn LOW status after 60 healthy days drop from 5%
  to 1.5% sampling, which compounds meaningfully across a 3-year build.

### Steady state after build-out

Once the library exists, review load drops to: new/changed families, escalations, floors, calibration,
and learner-work audit — roughly **2–3 FTE**. The cost curve flattens, which is the whole point:
under the naive model, cost scales with content volume forever.

---

## 15.9 Curriculum Health Score

One score per competency, recomputed nightly. Drives risk tier, sampling rate, and expert attention.

```
health(competency) = Σ wᵢ · componentᵢ        ∈ [0, 1]
```

| Component | Weight | Measure | Healthy |
|---|---|---|---|
| **Content quality** | 0.18 | 1 − validation rejection rate (30d) | ≥0.90 |
| **Item discrimination** | 0.20 | mean point-biserial across the family's items | ≥0.25 |
| **Learner performance** | 0.15 | proportion of learners reaching `PROFICIENT` within expected attempts | ≥0.70 |
| **Assessment reliability** | 0.12 | internal consistency across the competency's items; rater agreement where rubric-scored | ≥0.75 |
| **Retention performance** | 0.15 | delayed-retention pass rate at the level's interval | ≥0.70 |
| **Misconception resolution** | 0.10 | proportion of declared misconceptions that decline after remediation | ≥0.60 |
| **Human review findings** | 0.06 | 1 − (severity-weighted findings per reviewed item) | ≥0.90 |
| **Engagement** | 0.04 | 1 − abandon rate on the family's activities | ≥0.90 |

### Automatic flagging

A competency is flagged for expert review when **any** of these fires, independent of the composite —
because a composite can hide a single severe failure behind seven healthy components:

| Signal | Threshold | Likely root cause |
|---|---|---|
| Health score | < 0.60 | multiple |
| Rejection rate | > 20% (30d) | ambiguous contract or bad prompt template |
| Mean discrimination | < 0.12 | items measure something other than the target micro skill |
| Learner confusion | abandon > 25% or latency > 2.5× expected | instruction unclear, or cognitive demand mis-declared |
| Answer distribution | a distractor chosen by >40% of `PROFICIENT`+ learners | key is probably wrong |
| Mastery too fast | median attempts to `MASTERED` < 40% of expected | items too easy, or gates being satisfied by low-guess-rate loopholes |
| Mastery too slow | > 250% of expected, or `PROFICIENT` rate < 40% | prerequisite gap, or cognitive demand above the level |
| Retention failure | delayed pass rate < 50% | taught for recognition, not retention — a contract defect |
| Misconception persistence | a `BLOCKING` misconception flat after 3 remediation routes | remediation routes are wrong; needs human redesign |
| Rater disagreement | human-audit agreement < 0.70 | rubric ambiguous or LLM scorer drifting |
| DIF | differential functioning across region/L1/gender at matched ability | a fairness defect invisible on inspection |

The "mastery too fast" row is worth flagging as counter-intuitive: unusually rapid mastery is a
*defect signal*, not a success signal. It usually means items are easier than their declared band,
or that the format mix is letting learners satisfy gates cheaply. Left unflagged, it produces
learners promoted into a level they cannot handle — which then surfaces as an inexplicable
difficulty spike one level later.

```prisma
model CurriculumHealthScore {
  competencyId String @id
  score        Float
  components   Json              // each component's value and weight
  riskTier     String            // computed, feeds ReviewPolicy
  flags        String[]          // which automatic flags are active
  flaggedForReviewAt DateTime?
  reviewedAt   DateTime?
  trend30d     Float
  computedAt   DateTime @default(now())

  competency Competency @relation(fields: [competencyId], references: [id])
  @@index([score])
  @@index([riskTier, flaggedForReviewAt])
}
```

---

## 15.10 The AI → human feedback loop

AI may propose curriculum changes. It may not make them.

```
AI detects a pattern
      ↓
AI files a CurriculumChangeProposal with evidence
      ↓
Level B reviews the evidence (Level A if the change is MAJOR+)
      ↓
Human decision: accept / modify / reject / defer
      ↓
If accepted → change classified (§15.3) → migration authored if MAJOR+
      ↓
New CurriculumRelease version
      ↓
ContentSpecifications recompiled · generation rules updated · affected content re-validated
```

### What AI is allowed to notice

| Pattern | Proposal type | Typical evidence |
|---|---|---|
| A prerequisite is missing | `ADD_PREREQUISITE` | learners failing competency X are disproportionately non-proficient on Y, controlling for overall ability |
| A prerequisite is spurious | `REMOVE_PREREQUISITE` | mastery of Y shows no relationship to success on X across ≥2,000 learners |
| A competency is mis-levelled | `RELEVEL_COMPETENCY` | attempts-to-mastery is 2.5× the level's norm and matches the norm one level up |
| A micro skill needs splitting | `SPLIT_MICROSKILL` | bimodal performance distribution; two error clusters with no correlation |
| A misconception is undeclared | `ADD_MISCONCEPTION` | recurring error pattern across ≥500 learners with no matching contract entry |
| A remediation route is ineffective | `REVISE_REMEDIATION` | pattern flat after the declared route in ≥300 cases |
| A gap exists in the curriculum | `PROPOSE_COMPETENCY` | a cluster of failures not attributable to any existing micro skill |
| A threshold is mis-set | `REVISE_THRESHOLD` | `PROFICIENT` learners failing delayed retention at >40% |

### What makes a proposal admissible

A proposal without a falsifiable evidence package is discarded automatically — this prevents the
queue filling with low-quality suggestions that consume the scarcest resource in the system, which
is expert attention.

```prisma
model CurriculumChangeProposal {
  id        String @id @default(cuid())
  proposalType String
  proposedBy   String              // "ai:inference-engine" | userId
  targetType   String              // competency | microskill | prerequisite | threshold | concept
  targetId     String

  claim        String @db.Text     // the proposed change, stated falsifiably
  evidence     Json                // cohort size, effect size, confidence interval,
                                   // controls applied, alternative explanations considered
  cohortSize   Int
  effectSize   Float?
  confidence   Float
  affectedLearnerCount Int         // blast radius if accepted

  status       String @default("open")   // open | under_review | accepted | modified | rejected | deferred
  changeClass  String?                   // UNCHANGED..REPLACED, assigned on acceptance
  reviewLevel  String?                   // B | A
  decidedById  String?
  decisionRationale String? @db.Text
  migrationScriptRef String?
  releaseVersion String?

  createdAt  DateTime @default(now())
  decidedAt  DateTime?

  @@index([status, proposalType])
  @@index([targetType, targetId])
}
```

Admissibility thresholds: `cohortSize ≥ 500`, `confidence ≥ 0.95`, alternative explanations
enumerated, and blast radius computed. Below any of these the proposal is held rather than filed.

### Why this loop is advisory and the calibration loop is binding

The system has two feedback loops with deliberately different authorities, and the asymmetry is the
core of the governance design:

| | Item calibration (Phase 14 §14.6) | Curriculum proposals (this section) |
|---|---|---|
| Authority | **Binding and automatic** | **Advisory only** |
| Acts on | Content instances | The curriculum graph |
| Reverses by | Regenerating an item | Re-authoring a progression |
| Cost of a wrong automatic action | One wasted generation | Corrupted progression for every learner who touches it |
| Cost of requiring human approval | Does not scale — 700,000 items | Scales fine — dozens of proposals per quarter |

Getting this asymmetry backwards in either direction is fatal. Automatic curriculum change is
uncontrolled drift wearing the costume of machine learning. Manual item retirement does not scale
and so, in practice, does not happen. The design gives the machine unilateral authority exactly
where the blast radius is bounded and reversible, and gives humans unilateral authority exactly
where it is not.
