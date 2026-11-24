# WizLingo Language Mastery Engine — Architecture Index

**Status:** 🔒 **FROZEN at [Baseline v1.0](BASELINE_v1.0.md)** — Phases 1–9 and 11–18 complete.
Phase 10 (lesson generation) intentionally NOT started; it is gated behind a pilot
([Phase 16](16_PHASE_10_ROADMAP.md)). No decision may change until the pilot GO/NO-GO.
**Owner:** Chief Learning Architect
**Date:** 2026-08-11 — Phases 1–10, then Phases 11–16 (Operating Model), then Phases 17–18 and freeze

---

## What this is

This document set converts the **WizLingo Language Mastery Framework** (8 pillars,
`Competency → Micro Skill → Learning Outcome → Activity → Assessment → AI Rules → Mastery Badge`)
into an implementable platform architecture.

The framework is **not replaced**. It is preserved as the pedagogical core and wrapped in:

- a **grade-independent mastery ladder** (15 visible levels)
- a **difficulty engine** (75 adaptive states)
- a **mastery engine** (evidence-based, not completion-based)
- an **AI adaptation loop** (14 monitored signals → deterministic actions)
- a **game layer** that hides the curriculum from the learner
- a **governance layer** that prevents AI from corrupting curriculum

### The definition, in one sentence

> **WizLingo is a human-designed, AI-generated, expert-governed, empirically calibrated adaptive
> language mastery system.**

Every adjective has a mechanism behind it and is falsifiable by the pilot — see the claim table in
[Baseline v1.0](BASELINE_v1.0.md#the-definition-this-baseline-establishes).

### The one-line design principle

> WizLingo is not a content library that serves lessons.
> It is an inference engine whose only job is to answer:
> **"What language skill should this specific learner practise in the next 15 minutes?"**
>
> Content is the *output* of that answer, never the input to it.

### And the strategic consequence

> **Curriculum is finite. Learning experience is infinite.**
>
> ~1,400 competencies and ~7,000 micro skills are human-authored, once. Against that fixed,
> controlled graph, AI generates effectively unlimited distinct learning experiences — different
> for every learner, in every mode, at every difficulty — all routing evidence back to the same
> nodes. The moat is not the lessons. It is the closed loop.

```
                        COMPETENCY  (human-authored, finite)
                             │
                        MICRO SKILL
                             │
                      LEARNING OUTCOME     ← what may be counted
                             │
                     CONTENT SPECIFICATION ← what may be generated
                             │
            ┌────────────────┼────────────────┐
            ↓                ↓                ↓
         Reading          Speaking          Writing
            ↓                ↓                ↓
        Student A        Student B        Student C
            ↓                ↓                ↓
        AI content       AI content       AI content   (infinite)
            │                │                │
            └────────────────┼────────────────┘
                             ↓
                     OBSERVABLE BEHAVIOUR
                             ↓
                          EVIDENCE
                             ↓
                        CALIBRATION          ← does the assumption hold?
                             ↓
                          MASTERY
```

---

## Read in this order

| Phase | Document | Answers |
|---|---|---|
| 1 | [01_LEARNING_ARCHITECTURE.md](01_LEARNING_ARCHITECTURE.md) | What are the layers, entities, and the 14-entity curriculum hierarchy? |
| 2 | [02_LEVEL_MAP.md](02_LEVEL_MAP.md) | The 15 mastery levels in full detail (5 groups × 3 levels) |
| 3 | [03_PILLAR_MATRIX.md](03_PILLAR_MATRIX.md) | How all 8 pillars progress across all 15 levels, with prerequisites |
| 4 | [04_TAXONOMY.md](04_TAXONOMY.md) | Domain → Competency → Micro Skill → Concept taxonomy + 18-branch content taxonomy |
| 5 | [05_MASTERY_ASSESSMENT.md](05_MASTERY_ASSESSMENT.md) | The mastery engine (BKT + Elo + decay) and the 7 assessment types |
| 6 | [06_AI_ADAPTATION.md](06_AI_ADAPTATION.md) | Language DNA, the 8-step AI loop, signal→action rules, difficulty engine, daily session |
| 7 | [07_GAME_ARCHITECTURE.md](07_GAME_ARCHITECTURE.md) | World → Level → Journey → Quest → Challenge → Mastery, XP/badge economy |
| 8 | [08_DATA_MODEL.md](08_DATA_MODEL.md) | Prisma schema, migration from the legacy 5-pillar / 20-level model |
| 9 | [09_AUTHORING_GOVERNANCE.md](09_AUTHORING_GOVERNANCE.md) | Curriculum Authoring System + the 7-gate AI validation pipeline |
| 16 | [10_CONCEPT_WALKTHROUGHS.md](10_CONCEPT_WALKTHROUGHS.md) | Synonyms + 8 more concepts traced across all 15 levels |

### The Curriculum Operating Model (Phases 11–18)

*Human-Designed · AI-Generated · Expert-Governed · Calibrated · Adaptive.* These extend Phases 1–10;
they do not replace anything in them.

| Phase | Document | Answers |
|---|---|---|
| 11 | [11_CURRICULUM_OPERATING_MODEL.md](11_CURRICULUM_OPERATING_MODEL.md) | Who may do what · **what the platform can and cannot prove** · the six separated concerns · the trust lifecycle · how drift is prevented |
| 12 | [12_COMPETENCY_CONTRACTS.md](12_COMPETENCY_CONTRACTS.md) | What "human-designed" means precisely: the Competency Contract, its 34 fields tiered into authored/inherited/derived, and the completeness gate |
| 13 | [13_CONTENT_SPECIFICATIONS.md](13_CONTENT_SPECIFICATIONS.md) | The compiled layer between curriculum and generation · Golden Content and its three roles |
| 14 | [14_AI_GENERATION_GOVERNANCE.md](14_AI_GENERATION_GOVERNANCE.md) | The four generation tiers · the 10-stage validation pipeline (7 existing gates + 3) · trust lifecycle mechanics · provenance and telemetry |
| 15 | [15_HUMAN_REVIEW_GOVERNANCE.md](15_HUMAN_REVIEW_GOVERNANCE.md) | 6 governance roles · 3 governance levels · **computed** risk · the sampling model and its costed scaling · what "expert validated" means exactly · Curriculum Health Score · the AI→human proposal loop |
| 16 | [16_PHASE_10_ROADMAP.md](16_PHASE_10_ROADMAP.md) | Phase 10A–10J · pilot design · the 9 validation questions · GO/NO-GO gate criteria · what to implement first |
| 17 | [17_LEARNING_OUTCOME_CONTRACTS.md](17_LEARNING_OUTCOME_CONTRACTS.md) | Competency vs. Learning Outcome · observable behaviour · evidence signature · **non-evidence** · Observation ≠ Evidence · why compound outcomes must be split |
| 18 | [18_CALIBRATION_POLICY.md](18_CALIBRATION_POLICY.md) | Calibration as a first-class concern · 4 calibration routes · thresholds as policy with **hard floors** · staleness handling · the 8 assumptions under test |

### Governance artefact

| Document | Purpose |
|---|---|
| 🔒 [**BASELINE_v1.0.md**](BASELINE_v1.0.md) | The architecture freeze: frozen scope · **decision register (D1–D16)** · **open questions (O1–O14)** · change control · path out of freeze · immediate next actions |

---

## The operating model, in one line

> **Humans design the learning system. AI generates the learning experience. Experts govern quality
> and integrity. Student evidence drives adaptation.**

And the claim this architecture is built to make true — stated with its limits, because the version
without limits does not survive an audit ([Phase 11 §11.2](11_CURRICULUM_OPERATING_MODEL.md#112-what-the-platform-can-prove--and-what-it-cannot)):

> Every AI-generated item is **provably** traceable to an approved competency, **provably** routed
> to a named mastery node, and **provably** within measured linguistic bounds for its level, before
> it reaches any learner.
>
> Pedagogical appropriateness and cognitive demand are **statistically controlled** — estimated
> pre-hoc, expert-sampled, measured post-hoc against learner evidence, and auto-retired on
> contradiction.
>
> **No item may contribute to a mastery decision until it has been empirically calibrated.**

---

## The ten structural decisions

Everything downstream depends on these. Change one and the architecture must be revisited.
Decisions 1–5 come from Phases 1–10; 6–7 and 10 from the operating model (Phases 11–16); 8–9 from
Phases 17–18. All ten are registered as D1–D16 in [Baseline v1.0](BASELINE_v1.0.md#decision-register)
with what would overturn each.

**1. Grade and mastery level are orthogonal.**
Grade selects the *content environment* (themes, contexts, register, visual skin).
Mastery level selects the *linguistic difficulty*. A Grade 5 student can sit at Level 2.1
and receive Grade-5-appropriate topics at Level-2.1 language complexity. This is the single
most important decision in the system: it is what lets one platform serve a struggling
Grade 8 and a gifted Grade 3 without either feeling condescended to or drowned.

**2. Mastery is an inference, not a counter.**
`P(mastered)` is estimated from evidence across formats, sessions, and time. Finishing an
activity never unlocks anything by itself. See [Phase 5](05_MASTERY_ASSESSMENT.md).

**3. The learner has 13 scores, never 1.**
Language DNA is a vector. The AI's edge comes from acting on the *shape* of that vector
(strong decoding + weak prosody is a different intervention from the reverse), which a single
composite score destroys. See [Phase 6](06_AI_ADAPTATION.md).

**4. AI generates content, never curriculum.**
Concepts, prerequisites, sequence, and mastery rules are human-authored and versioned. AI
only produces *variations and challenges* bound to an approved concept node. Every generation
request carries the full curriculum address. See [Phase 9](09_AUTHORING_GOVERNANCE.md) and
[Phase 14 §14.1](14_AI_GENERATION_GOVERNANCE.md#141-the-hard-rule).

**5. Difficulty is continuous underneath, discrete on the surface.**
The learner sees 15 levels. The engine operates 75 states (15 × 5 bands) and an underlying
continuous Elo rating. Learners get smooth adaptation; schools get a legible ladder.

**6. Human authorship lives in the Competency Contract, not in lessons.**
Experts author ~19,700 contract decisions across 1,400 competencies. Boundaries that belong to a
*level* are authored once (15 `LevelDefaults` rows), never restated per competency — which removes
the largest class of curriculum contradiction. Content Specifications are then *compiled*, not
authored, so a spec can never contradict its contract.
See [Phase 12](12_COMPETENCY_CONTRACTS.md), [Phase 13 §13.3](13_CONTENT_SPECIFICATIONS.md#133-compiling-a-contentspec-from-a-contract).

**7. Untrusted content cannot make a mastery decision.**
Every item carries a `TrustState` (`QUARANTINED → CALIBRATING → TRUSTED`). Uncalibrated content
serves a ≤2% cohort and is *structurally* barred from BKT updates and `Mastered` gates. The blast
radius of a bad item is bounded by the schema, not by the attentiveness of a dashboard.
See [Phase 11 §11.4](11_CURRICULUM_OPERATING_MODEL.md#114-the-trust-lifecycle).

**8. Competency ≠ Learning Outcome — and what may be *counted* is contracted separately.**
The Competency Contract governs what may be **generated**; the Learning Outcome Contract governs
what may be **counted**. Outcomes declare their observable behaviour, evidence signature, validity
conditions, and — critically — their **non-evidence**: a recognition item may not satisfy the
productive-evidence gate, enforced at the schema level. Observation (immutable) is separated from
Evidence (re-derivable), so improving a scorer retroactively improves historical judgements.
See [Phase 17](17_LEARNING_OUTCOME_CONTRACTS.md).

**9. Calibration thresholds are policy; the calibration rule is not.**
`min_attempts` varies by content family, behaviour class, guess rate, and risk — via four
calibration **routes**, because low-volume content (a Grade 12 capstone) can never reach a
statistical N and must be trusted by expert-anchoring instead of a lowered bar. Hard floors live in
code and cannot be overridden by policy, and there is deliberately **no policy field** through which
"uncalibrated content cannot establish mastery" could be relaxed.
See [Phase 18](18_CALIBRATION_POLICY.md).

**10. Two feedback loops with deliberately different authority.**
Item calibration is **binding and automatic** — AI retires bad content with no human approval,
because the blast radius is one wasted generation. Curriculum change is **advisory only** — AI
files an evidence-backed proposal and a human decides, because the blast radius is every learner
who touches the node. Reversing this asymmetry in either direction is fatal.
See [Phase 15 §15.10](15_HUMAN_REVIEW_GOVERNANCE.md#1510-the-ai--human-feedback-loop).

---

## The six separated concerns

| Concern | Question |
|---|---|
| **CURRICULUM** | What should be learned |
| **CONTENT** | How it is taught |
| **ADAPTATION** | What this learner receives next |
| **ASSESSMENT** | What evidence the learner produces |
| **GOVERNANCE** | Who can change / approve the system |
| **CALIBRATION** | **Whether the system's assumptions actually work in real learners** |

Different owners, cadences, and failure modes. They must not be merged.

**CALIBRATION is the one normally absent**, and its absence is why platforms drift. Governance
answers *who may change things*; calibration answers *whether what we shipped is working*. A
measurement that can be overruled by an authority is not a measurement — which is why the
Psychometrician sets thresholds but may never overrule a result.

That sixth concern is what makes this a **closed-loop educational measurement system** rather than
an AI content generator with governance attached:

```
Design → Generate → Validate → Calibrate → Teach → Observe → Measure → Adapt → Improve
   ↑                                                                            │
   └────────────────────────────────────────────────────────────────────────────┘
```

Calibration tests **eight** assumptions, of which content behaviour is only the narrowest: declared
cognitive demand · prerequisite reality · **whether mastery predicts performance** · level ceilings ·
scorer drift · grade ⊥ level separation · cross-cohort fairness.
See [Phase 11 §11.3](11_CURRICULUM_OPERATING_MODEL.md#113-the-six-separated-concerns) and
[Phase 18 §18.9](18_CALIBRATION_POLICY.md#189-what-calibration-measures-beyond-content).

---

## Relationship to existing WizLingo assets

| Existing asset | Disposition |
|---|---|
| `CURRICULUM_FRAMEWORK.md` — 20-level ladder | **Superseded.** Remap table in [08_DATA_MODEL.md](08_DATA_MODEL.md#89-legacy-migration). Themes and vocabulary lists remain valid content inputs. |
| `schema.prisma` — `LearningPillar` (5 values) | **Extended to 8.** Mapping table in [08_DATA_MODEL.md](08_DATA_MODEL.md#89-legacy-migration). Legacy enum retained as a view for one release. |
| `schema.prisma` — `GradeCategory` (5 values) | **Kept as-is.** Already matches the 5 learning groups exactly. |
| `schema.prisma` — `ProgressionStage` (13 stages) | **Retired.** Replaced by `MasteryLevel` × `Pillar`, which is strictly more expressive. |
| Badge system (Word/Voice/Language Wizard) | **Kept and extended.** Becomes the top of the badge hierarchy in [Phase 7](07_GAME_ARCHITECTURE.md). |
| Adaptive level up/down engine (5-session / 3-session rule) | **Absorbed** as the coarse outer loop; the BKT/Elo engine becomes the inner loop. |
| LSRW modules (Reading/Speaking/Writing/Listening sessions) | **Kept as delivery surfaces.** They become `Activity` renderers, not curriculum owners. |

### Changed by the operating model (Phases 11–16)

| Earlier artefact | Disposition |
|---|---|
| Phase 9's **7 validation gates** | **Retained unchanged and reused.** Phase 14 wraps them with 3 new stages (schema pre-gate, golden comparison, risk classification). No duplicate validation system exists. |
| Phase 8 `ContentTier` (3 values) | **Extended to 4** — `TIER2P_PARAMETERIZED` added to close the accountability hole in real-time personalization. Mapping in [Phase 14 §14.9](14_AI_GENERATION_GOVERNANCE.md#149-data-model-additions). |
| Phase 8 `Competency` | **Extended** with contract fields. Not duplicated — the Competency Contract *is* `Competency` in a complete, approved state. |
| Phase 9 §9.4 change classification | **Extended** to the 5 named classes (`UNCHANGED`…`REPLACED`) with the grandfathering rule stated as policy. [Phase 15 §15.3](15_HUMAN_REVIEW_GOVERNANCE.md#153-curriculum-versioning-and-change-classification). |
| Phase 10's readiness table | **Superseded** by [Phase 16 §16.8](16_PHASE_10_ROADMAP.md#168-revised-phase-10-readiness). |
| "Author the 120 level × pillar cells first" | **Superseded.** The critical path is now 21 `LevelDefaults`/`GroupPolicy`/`GlobalPolicy` rows → 40 pilot contracts → pilot. [Phase 16 §16.3](16_PHASE_10_ROADMAP.md#163-what-to-implement-first). |
| Phase 7 §7.5 Language Wizard human-review rule | **Unchanged and explicitly not weakened** ([Phase 15 §15.7](15_HUMAN_REVIEW_GOVERNANCE.md#157-what-expert-validated-means-exactly)). |

---

## Implementation note

Per `AGENTS.md`, this repo runs a Next.js version with breaking changes from common
knowledge. **No application code is written in this document set** — only schema and
architecture. Before implementing any route, server action, or data-fetching layer described
here, read the relevant guide in `node_modules/next/dist/docs/` first.
