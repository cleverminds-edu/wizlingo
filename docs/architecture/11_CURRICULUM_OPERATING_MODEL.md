# PHASE 11 — The Curriculum Operating Model

**Human-Designed · AI-Generated · Expert-Governed · Adaptive**

This document establishes the operating model that connects Phases 1–10. It does not replace
them. It defines *who is allowed to do what*, and — more importantly — **what the platform can
and cannot prove about the content it serves.**

---

## 11.1 The core principle

> **Humans design the learning system.**
> **AI generates the learning experience.**
> **Experts govern the quality and integrity of the system.**
> **Student evidence drives adaptation.**

Read carefully, this is *not* "AI writes lessons and humans approve them." That model does not
scale: at 700,000 content items it requires ~62 expert-years of review
([Phase 15 §15.8](15_HUMAN_REVIEW_GOVERNANCE.md#158-does-this-actually-scale)), and it fails
anyway, because human approval of an individual item does not establish that the item *works*.

The model is instead:

| Actor | Owns | Authority |
|---|---|---|
| **HUMAN (curriculum expert)** | The specification of what must be learned, and the boundaries within which it may be expressed | Write access to the curriculum graph. Exclusive. |
| **AI** | Content instances that satisfy an approved specification; selection of what a learner does next | Write access to content. Read-only on curriculum. |
| **EXPERT (governance)** | Standards, approval of high-value content, calibration of the validators, adjudication of change | Approval authority. Cannot be delegated to AI. |
| **STUDENT** | Behavioural and performance evidence | The only source of ground truth about whether any of it worked. |

The fourth row is the one that makes the model honest. Neither humans nor AI can determine
whether a content item is pedagogically effective by inspecting it. Only learner evidence can.
So the architecture must treat every new content item as a **hypothesis**, not a fact — and must
be structurally incapable of letting an unvalidated hypothesis affect a mastery decision.

---

## 11.2 What the platform can prove — and what it cannot

This section is the intellectual centre of the operating model. Everything else follows from it.

The claim we want to make is: *every AI-generated experience is pedagogically appropriate,
traceable to an approved competency, at the right cognitive level, and contributing evidence
toward mastery.*

Four claims. They do not have the same epistemic status, and conflating them produces an
architecture that overclaims and fails audit.

### Claim 1 — Traceability: **PROVABLE**

Every content item resolves to a full curriculum address and a complete provenance chain
([Phase 14 §14.7](14_AI_GENERATION_GOVERNANCE.md#147-provenance)). This is referential
integrity, enforced by foreign keys and a `CHECK` constraint, audited nightly.

**Proof obligation:** for any served item, produce the chain
`CurriculumRelease → Competency@version → MicroSkill → LearningOutcome → ContentSpec@version →
Model+config → ValidationReport → ReviewRecord → PublishedVersion`.
If any link is absent, the item cannot be stored in a published state.

**Status: airtight.** This is a decidable property of the database.

### Claim 2 — Evidence contribution: **PROVABLE**

Every attempt on every item routes to exactly one `MicroSkill` BKT node and one Language DNA
strand, with a declared guess rate and scoring method.

**Proof obligation:** for any attempt, show the mastery node it updated and the weight it carried.
For any mastery state, enumerate the attempts that produced it.

**Status: airtight.** Guaranteed by the append-only `Attempt` table and the derived-cache
property of `Mastery` (Phase 8).

### Claim 3 — Correct cognitive level: **HALF PROVABLE**

This claim decomposes into two very different things, and the architecture must not let them
travel together:

| Sub-claim | Status | Mechanism |
|---|---|---|
| **Linguistic** difficulty is within the level's bounds — vocabulary frequency ceiling, mean sentence length, clause depth, text length, readability, morphological load | **Provable** | Deterministic measurement at Gate 3. Every violation reported with the offending span. Auditable and reproducible. |
| **Cognitive** demand matches the intended Bloom tier — that an item genuinely requires *evaluate* rather than *understand* | **NOT statically provable** | No text-analysis method establishes this. A model's judgement about it is an estimate with unknown error. |

Cognitive demand is therefore handled as an **empirical property, not a declared one**. It is
estimated pre-hoc (recorded as a claim), and then *measured* post-hoc from learner evidence:
item p-value, point-biserial discrimination against the target micro skill, and response-latency
distribution. When measurement contradicts the estimate, the measurement wins and the item is
retired.

**Status: linguistic bounds proven; cognitive demand statistically controlled.**

### Claim 4 — Pedagogical appropriateness: **NOT PROVABLE**

"Appropriate" is a judgement about fit between a learner, a moment, and an intent. It is not a
decidable property of an artefact. Any architecture asserting pre-hoc proof of pedagogical
appropriateness is making a claim it cannot defend, and the first serious school audit or
academic partner will find it.

What *is* achievable, and is what we build:

1. **Bounded** — the item cannot violate any human-authored boundary (Gates 1–3, 6).
2. **Anchored** — the item is measurably similar to expert-approved Golden Content for its
   specification ([Phase 13 §13.5](13_CONTENT_SPECIFICATIONS.md#135-golden-content)).
3. **Sampled** — a statistically meaningful, risk-weighted sample receives expert judgement, with
   a floor that never decays to zero ([Phase 15 §15.6](15_HUMAN_REVIEW_GOVERNANCE.md#156-the-sampling-model)).
4. **Measured** — every item's real behaviour on real learners is tracked, and items that behave
   badly are retired automatically regardless of having passed review.
5. **Reversible** — any item, family, or release can be withdrawn without destroying learner
   progress.

**Status: not proven; controlled, measured, and reversible.**

### The claim the architecture actually makes

> Every AI-generated item served by WizLingo is **provably** traceable to an approved competency,
> **provably** routed to a named mastery node, and **provably** within measured linguistic bounds
> for its level, before it reaches any learner.
>
> Pedagogical appropriateness and cognitive demand are **statistically controlled**: pre-hoc
> estimated, expert-sampled, post-hoc measured against learner evidence, and automatically
> retired when measurement contradicts the specification.
>
> No item may contribute to a mastery decision until it has been empirically calibrated.

That last sentence is the load-bearing one, and it is new to the architecture. It is implemented
by the trust lifecycle (§11.4).

---

## 11.3 The six separated concerns

Phase 1 separated layers. The operating model separates **concerns** — different questions, with
different owners, different change cadences, and different failure modes. Merging any two of
these is the failure mode that makes edtech platforms unmaintainable.

| Concern | Question | Owner | Changes | Failure if merged |
|---|---|---|---|---|
| **CURRICULUM** | What should be learned? | Curriculum experts | Quarterly, versioned | Fuse with Content → "the curriculum is the set of lessons we have" |
| **CONTENT** | How is it taught? | AI, within specs | Continuously | Fuse with Curriculum → cannot add content without renegotiating sequence |
| **ADAPTATION** | What does *this* learner receive next? | AI inference engine | Per activity | Fuse with Content → personalization becomes content authoring |
| **ASSESSMENT** | What evidence has the learner produced? | Mastery engine, from evidence | Per attempt | Fuse with Adaptation → the system grades on what it chose to serve |
| **GOVERNANCE** | Who can change or approve the system? | Named human roles | Per proposal | Fuse with Calibration → measurement becomes negotiable |
| **CALIBRATION** | **Do the system's assumptions actually work in real learners?** | Empirical, automated; owned by the Psychometrician | Nightly / monthly | **Usually missing entirely.** Fuse with Governance → becomes a meeting instead of a mechanism |

**CALIBRATION is the concern that is normally absent**, and its absence is why platforms drift.
Governance answers *who may change things*; calibration answers *whether what we already shipped is
working*. They are not the same question and must not share a mechanism, because a measurement that
can be overruled by an authority is not a measurement.

Note the scope of the calibration question. It is **not** merely "does this content item behave as
specified" — that is only the first of eight assumptions under test. Calibration also asks whether
declared cognitive demand is real, whether prerequisites are real, whether mastery predicts
performance, whether level ceilings are right, whether scorers have drifted, whether grade ⊥ level
separation holds, and whether the system is fair across cohorts. Content trust is the narrowest
case. See [Phase 18 §18.9](18_CALIBRATION_POLICY.md#189-what-calibration-measures-beyond-content).

This sixth concern is what makes the platform a **closed-loop educational measurement system** rather
than an AI content generator with a governance process attached:

```
Design → Generate → Validate → Calibrate → Teach → Observe → Measure → Adapt → Improve
   ↑                                                                            │
   └────────────────────────────────────────────────────────────────────────────┘
```

---

## 11.4 The trust lifecycle

The mechanism that makes Claim 4 controlled rather than asserted. Every content item carries a
`TrustState`, independent of its `ContentStatus`.

```
                    ┌──────────────────────────────────────────┐
                    │                                          │
   generated ──→ validated ──→ QUARANTINED ──→ CALIBRATING ──→ TRUSTED
                     │              │               │              │
                     ↓              ↓               ↓              ↓
                  REJECTED     (retired)       (retired)      DEPRECATED
```

| TrustState | Serving? | Feeds Elo? | Feeds BKT mastery? | Can satisfy `Mastered` gates? | Exit condition |
|---|---|---|---|---|---|
| `QUARANTINED` | Yes, to ≤2% of eligible learners | Yes | **No** | **No** | ≥30 attempts, no red flags |
| `CALIBRATING` | Yes, to ≤20% | Yes | Yes, at 0.5 weight | **No** | ≥100 attempts, discrimination ≥0.15, p-value in band |
| `TRUSTED` | Yes, unrestricted | Yes | Yes, full weight | **Yes** | — |
| `DEPRECATED` | No | — | — | — | terminal |

### Why quarantine and not just "monitor"

The difference is structural rather than procedural. Under "publish then monitor", a bad item can
mark a learner `Mastered` on day one, and monitoring discovers the problem on day thirty — by
which point the mastery record, the badge, the level-up, and the school report have all already
happened, and unwinding them costs trust.

Under the trust lifecycle, an uncalibrated item **cannot** produce a mastery decision. The worst
it can do is waste a learner's ninety seconds and slightly perturb an Elo rating (which is
self-correcting by design). The blast radius of a bad item is bounded by the schema, not by the
attentiveness of a monitoring dashboard.

This is enforced in two places, deliberately redundantly:
1. `Attempt.contentTrustState` is stamped at serve time, and the mastery engine's evidence query
   filters on it. An untrusted attempt sets `excludedFromMastery = true` for the BKT path.
2. The `Mastered` gate evaluation requires that *all* satisfying evidence come from `TRUSTED`
   content. A quarantined item cannot supply the `productive_evidence` or `transfer_evidence`
   gate even accidentally.

### Cohort selection for quarantine

Quarantined content is not served randomly. It is served preferentially to:
- learners whose strand mastery is already `PROFICIENT` or above on the target micro skill —
  they are least harmed by a bad item and most informative about it (a proficient learner failing
  a supposedly easy item is a strong signal the item is broken);
- never to learners in an active Level Assessment, Diagnostic, or Gate Challenge;
- never to learners flagged with high frustration index;
- never as the first or last activity of a session (Phase 6 §6.5 requires those to be likely
  successes).

### Calibration graduation

Automated, nightly, no human in the loop for the pass path:

```
graduate QUARANTINED → CALIBRATING when:
    attempts ≥ 30
    AND abandon_rate < 0.15
    AND mean_latency < 3 × format_median
    AND learner_report_count = 0

graduate CALIBRATING → TRUSTED when:
    attempts ≥ 100
    AND point_biserial_discrimination ≥ 0.15
    AND p_value ∈ [0.35, 0.90] for its declared band
    AND no distractor chosen by > 40% of high-mastery learners
    AND (if RUBRIC_LLM scored) human-audit agreement ≥ 0.75 on sampled items

auto-retire (→ DEPRECATED) at any stage when:
    discrimination < 0.05 with attempts ≥ 100
    OR p_value < 0.20 or > 0.97 with attempts ≥ 100
    OR learner/teacher reports ≥ 3
    OR abandon_rate > 0.30
```

Retirement is automatic and does not require expert sign-off. A human may *reinstate* a retired
item after review, but no human approval is needed to remove one. This asymmetry is intentional:
the cost of removing a decent item is one wasted authoring effort; the cost of retaining a broken
one is corrupted mastery data across a cohort.

---

## 11.5 Responsibility matrix

`A` = accountable (final authority) · `R` = responsible (does the work) · `C` = consulted ·
`I` = informed · `—` = no role · **`✕` = explicitly forbidden**

| Activity | Curriculum Architect | Language Expert | Pedagogical Reviewer | Assessment Expert | AI | Student |
|---|---|---|---|---|---|---|
| Define 8 pillars, 15 levels | **A** | C | C | C | **✕** | — |
| Grade/age & CEFR mapping | **A** | R | C | C | **✕** | — |
| Prerequisite DAG edges | **A** | C | C | — | **✕** (may propose) | — |
| Competency statements | **A** | R | C | C | **✕** | — |
| Micro-skill decomposition | A | R | C | **R** | **✕** | — |
| Vocabulary & grammar boundaries | C | **A** | C | — | **✕** | — |
| Age-appropriateness rules | C | C | **A** | — | **✕** | — |
| Cognitive demand declaration | C | — | **A** | C | **✕** | — |
| Mastery thresholds & evidence rules | C | — | C | **A** | **✕** | — |
| Assessment format eligibility | — | C | C | **A** | **✕** | — |
| Golden Content creation/approval | A | **R** | **R** | **R** | **✕** | — |
| Content Specifications | A | R | R | R | **✕** | — |
| AI generation constraints | **A** | R | R | R | **✕** | — |
| **Content instances (Tier 2/2P/3)** | I | I | I | I | **R** | — |
| **Next-activity selection** | — | — | — | — | **R/A** | C (choice points) |
| **Difficulty band setting** | — | — | — | — | **R/A** | — |
| Scoring of speech/writing | — | C | — | **A** | **R** | — |
| Error-pattern classification | — | C | — | — | **R** | — |
| Mastery state inference | — | — | — | **A** | **R** | — |
| Item retirement on bad statistics | I | I | I | I | **R/A** | I (reports) |
| Curriculum change *proposals* | A | C | C | C | **R** | I (evidence) |
| Curriculum change *approval* | **A** | C | C | C | **✕** | — |
| Language Wizard award | A | C | C | **A** | **✕** (scores only) | — |

Two rows deserve emphasis. **AI is accountable for next-activity selection and difficulty** —
that is real authority, deliberately granted, because no human can make 100 million of those
decisions per day. And **AI is forbidden from every row that defines what learning is** — that is
the boundary that makes granting the first authority safe.

---

## 11.6 End-to-end flow

How a single content item travels from human intent to learner evidence.

```
 HUMAN                                    ①  COMPETENCY CONTRACT              (Phase 12)
 curriculum experts author the                what must be learned + all boundaries
 authoritative specification              ②  CONTENT SPECIFICATION            (Phase 13)
                                              exact constraints for generation
                                          ③  GOLDEN CONTENT                   (Phase 13 §13.5)
                                              expert exemplars + non-examples
      │                                       ── approved & versioned ──
      ↓
 AI                                       ④  GENERATION                       (Phase 14 §14.2)
 generates instances inside                   tier 1/2/2P/3, spec-bound
 the approved sandbox                     ⑤  10-STAGE VALIDATION              (Phase 14 §14.4)
                                              7 existing gates + 3 new stages
      │
      ↓
 GOVERNANCE                               ⑥  RISK CLASSIFICATION (computed)   (Phase 15 §15.5)
 risk-weighted, sampled,                  ⑦  HUMAN REVIEW if required         (Phase 15 §15.7)
 never per-instance for low risk              qualification, count, checklist, threshold
      │
      ↓
 CALIBRATION                              ⑧  QUARANTINED → CALIBRATING → TRUSTED
 empirical, automated, nightly                cannot feed mastery until TRUSTED  (§11.4)
      │
      ↓
 ADAPTATION                               ⑨  SESSION PLANNER selects          (Phase 6 §6.5)
 per-learner, per-activity                ⑩  ACTIVITY served at band D1–D5
      │
      ↓
 ASSESSMENT                               ⑪  ATTEMPT recorded (append-only)   (Phase 8 §8.4)
 evidence → inference                     ⑫  BKT + Elo + decay update         (Phase 5)
                                          ⑬  MASTERY state, gates evaluated
      │
      ↓
 FEEDBACK                                 ⑭  ITEM STATISTICS → calibration    (§11.4)
 two loops, different speeds              ⑮  CURRICULUM HEALTH SCORE          (Phase 15 §15.9)
                                          ⑯  AI CHANGE PROPOSAL → humans      (Phase 15 §15.10)
```

Note the two feedback loops at ⑭–⑯ and their different authorities. Loop one (⑭) is **automatic
and binding**: item statistics retire items with no human involvement. Loop two (⑯) is
**advisory only**: AI may observe that a competency looks mis-sequenced and file a proposal, but
a human decides. Getting these two authorities the wrong way round in either direction is fatal —
automatic curriculum change is uncontrolled drift; manual item retirement does not scale.

---

## 11.7 How curriculum drift is prevented

"Drift" is the curriculum becoming, over time, whatever the generating model's priors are rather
than what the experts specified. Seven independent mechanisms, so that no single failure produces
drift:

| # | Mechanism | Prevents | Enforced at |
|---|---|---|---|
| 1 | AI has no write path to curriculum tables | Direct corruption | DB permissions + application layer + nightly audit (Phase 9 §9.6) |
| 2 | Generation requires a complete curriculum address | Unanchored content | Gate 1; `NOT NULL` FKs |
| 3 | Boundaries are inherited from `LevelDefaults`, not restated per item | Contradictory ceilings | Phase 12 §12.4 field tiering |
| 4 | Linguistic bounds are *measured*, not asserted | Level creep | Gate 3, deterministic |
| 5 | Golden Content comparison | Stylistic and pedagogical drift away from expert intent | Stage 9, Phase 13 §13.5 |
| 6 | Trust lifecycle + auto-retirement on discrimination | Bad items accumulating silently | §11.4, nightly |
| 7 | Sampling floors that never decay to zero | "Zero rejections" becoming "zero review" | Phase 15 §15.6 |

Mechanisms 3, 4, and 7 are the ones most often missing, and each corresponds to a specific
observed failure mode:

- **Without 3**, a competency authored in March says vocab ceiling 5,000 and its level says 3,500;
  generation obeys the competency and the level's integrity is gone.
- **Without 4**, "level-appropriate" is whatever the model believes it means, and it will
  gradually mean "slightly harder," because more sophisticated text reads as better text.
- **Without 7**, a content family with a good record is sampled less and less, until it is not
  sampled at all, at which point its record stops being evidence of anything.

---

## 11.8 What this model does *not* claim

Stated explicitly, because an architecture's honesty is measured by what it declines to promise:

1. **It does not claim AI-generated content equals expert-authored content in quality.** It claims
   AI content is bounded, anchored, sampled, measured, and reversible — and that for the ~95% of
   content that is practice volume rather than foundational instruction, that is sufficient. The
   ~5% where it is not sufficient is Tier 1, and Tier 1 is human.

2. **It does not claim every item is reviewed.** It claims every item is *validated*, and a
   risk-weighted sample is reviewed, and every item is measured on live learners.

3. **It does not claim the pre-hoc validators are reliable.** It calibrates them against Golden
   Content including deliberate negative exemplars, tracks their agreement with human raters, and
   treats validator drift as a monitored failure mode
   ([Phase 14 §14.5](14_AI_GENERATION_GOVERNANCE.md#145-calibrating-the-validators)).

4. **It does not claim cognitive demand is verified before serving.** It is estimated before
   serving and measured after, with retirement on contradiction.

5. **It does not claim mastery is certain.** Mastery is a posterior probability with stated
   confidence, decay-adjusted, and revisable downward.

A school buying WizLingo should be given exactly these five statements alongside the four
provable claims of §11.2. That combination is defensible under scrutiny; a blanket "expert
validated" is not.
