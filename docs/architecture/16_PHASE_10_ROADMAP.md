# PHASE 16 — Phase 10 Roadmap: From Architecture to Content

Phase 10 is no longer "author 1,400 competencies, then generate lessons." Under the operating
model it becomes ten gated stages, and **the lesson library is not built until the generation
system has been proven on a small representative sample.**

The reason for the restructure: authoring 1,400 competency contracts before validating that
contracts *produce good content* risks discovering a systematic contract-design flaw after 230
expert-days of work. The pilot exists to find that flaw after ~12 expert-days.

---

## 16.1 The ten stages

```
10A  Competency Contracts (pilot subset)         ──┐
10B  Content Specifications (compiler)             │  build the machine
10C  Golden Content (pilot subset)                 │
10D  AI Generation Templates                       │
10E  Validation Rules & validator calibration      │
10F  Human Governance (roles, policies, tooling) ──┘
        ↓
10G  Pilot Content Generation                    ──┐
10H  Expert Review of the pilot                    │  prove the machine
10I  Calibration on real learners                ──┘
        ↓  ← GO / NO-GO GATE
10J  Scale Generation (full contracts + library)
```

Stages 10A–10F are largely parallel after 10A's first tranche. 10G–10I are strictly sequential.
10J does not begin until the 10I gate passes.

---

## 16.2 Stage detail

### 10A — Competency Contracts

| | |
|---|---|
| **Deliverable** | `LevelDefaults` × 15, `GroupPolicy` × 5, `GlobalPolicy` × 1, `CalibrationPolicy` seed set (Phase 18), then **40 pilot contracts** + their **~110 Learning Outcome Contracts** (Phase 17) at `APPROVED` |
| **Owner** | Curriculum Architect + Language Experts + Pedagogical Reviewers |
| **Entry** | Phases 1–18 approved and frozen at Baseline v1.0 |
| **Exit** | 21 policy/defaults rows + calibration policies published; 40 competency contracts pass all 14 checks (Phase 12 §12.8); every outcome passes all 13 checks (Phase 17 §17.10) with `isCompound = false`; required approvals held |
| **Effort** | ~8 days for defaults/policies; ~7 days for 40 competency contracts; ~5 days for ~110 outcome contracts (4 experts) |
| **Critical** | **Author the 21 INHERITED rows first.** Every contract reads from them; authoring contracts first guarantees rework and drift. |

The 40 pilot contracts are deliberately *not* the easiest 40 — see §16.4 for selection.

### 10B — Content Specifications

| | |
|---|---|
| **Deliverable** | The **spec compiler** (Phase 13 §13.3) + ~240 compiled specs for the pilot contracts |
| **Owner** | Engineering + Assessment Expert (compiler rules) |
| **Exit** | Compiler produces byte-identical output on re-run; all 7 compile steps enforce their rejections; ~240 specs compile with zero contradictions; ≥1 manual spec authored and reviewed to prove that path |
| **Effort** | ~3 engineering weeks |
| **Critical** | The compiler's **rejection** rules matter more than its generation rules. A compiler that silently accepts a productive-evidence outcome bound to an MCQ format defeats the mastery guarantee at its root. |

### 10C — Golden Content

| | |
|---|---|
| **Deliverable** | ~320 golden items for the pilot competencies (8 per competency), **including ≥3 non-exemplars each**, all frozen |
| **Owner** | Language Experts + Pedagogical Reviewers; Assessment Expert on P0 |
| **Exit** | Every pilot competency has ≥2 `ACCEPTABLE` + ≥3 `NON_EXEMPLAR` with reason codes; `measuredProfile` computed for all; approvals per Phase 15 §15.7 |
| **Effort** | ~320 items × 25 min × 2 reviewers ≈ 270 expert-hours |
| **Critical** | Non-exemplars are the deliverable that makes 10E possible. A pilot without them cannot test its own validators, and will report a false pass. |

### 10D — AI Generation Templates

| | |
|---|---|
| **Deliverable** | `PromptTemplate` per (format × tier) for the pilot's ~12 formats; T2P `ParameterizedTemplate` definitions with typed slot lexicons |
| **Owner** | Engineering + Language Expert (slot lexicons) |
| **Exit** | Every template passes golden calibration; slot lexicons frequency-checked against `LevelDefaults`; duplicate detection working |
| **Effort** | ~3 engineering weeks |
| **Critical** | Slot lexicons must be **level-frequency-checked and policy-filtered at fill time**, not at authoring time — otherwise a T2P instance can exceed its level's vocabulary ceiling with a legal-looking fill. |

### 10E — Validation Rules

| | |
|---|---|
| **Deliverable** | All 10 stages implemented (Phase 14 §14.4); independent solver for Gates 5 and 7; Stage 8 golden comparison; Stage 9 risk computation |
| **Owner** | Engineering + Psychometrician |
| **Exit** | **Golden calibration passes**: accept ≥0.95 on `ACCEPTABLE`, reject ≥0.90 on `NON_EXEMPLAR`, reason-code accuracy ≥0.80, per-gate false-positive ≤0.05 |
| **Effort** | ~5 engineering weeks |
| **Critical** | This is the stage that must not be rushed. An uncalibrated validator approving at volume is the largest single risk in the platform. If calibration fails, fix the validator — do not lower the thresholds. |

### 10F — Human Governance

| | |
|---|---|
| **Deliverable** | 6 roles staffed; Level A/B/C constituted with cadence; `ReviewPolicy` rows; reviewer checklists in tooling; reviewer-quality tracking incl. golden blind-tests; Level C triage queue |
| **Owner** | Curriculum Architect + Product |
| **Exit** | ≥2 reviewers per role per age band hired/contracted and calibrated (κ ≥0.6 on a 30-item shared set); review tooling functional; audit trail verified end-to-end on one item |
| **Effort** | Hiring lead time ~8 weeks — **start in parallel with 10A** |
| **Critical** | Reviewer calibration before the pilot, not during it. Uncalibrated reviewers produce an expert-agreement metric in 10H that measures nothing. |

### 10G — Pilot Content Generation

| | |
|---|---|
| **Deliverable** | ~4,800 pilot items across the 40 competencies, ~240 specs, all four tiers, all three risk classes |
| **Owner** | Engineering |
| **Exit** | ≥95% of generated items pass stages 0–8; per-gate rejection distribution recorded; cost and latency per item measured against the Phase 6 §6.7 budget |
| **Effort** | ~1 week compute + iteration |
| **Critical** | Record the **gate-failure distribution**, not just the pass rate. A concentrated failure (e.g. 60% of rejections at Gate 5) points at a specific fixable cause; a flat distribution points at a contract or spec problem. |

### 10H — Expert Review

| | |
|---|---|
| **Deliverable** | 100% review of HIGH-risk pilot items; stratified sample of MEDIUM/LOW; **blind expert-agreement study** |
| **Owner** | Reviewer panel + Psychometrician |
| **Exit** | See §16.6 gate criteria |
| **Effort** | ~200 expert-hours |
| **Critical** | The agreement study must be **blind to provenance**: reviewers must not know whether an item is AI-generated, human-authored golden, or a deliberate non-exemplar. Non-blind review measures reviewer priors about AI, not item quality. |

### 10I — Calibration on real learners

| | |
|---|---|
| **Deliverable** | Pilot items served to a consented cohort of ~2,000 learners across the pilot levels and grade bands; ~60,000 attempts; full `ItemStatistics` |
| **Owner** | Engineering + Psychometrician |
| **Exit** | See §16.6 gate criteria |
| **Effort** | ~6 weeks of live serving |
| **Critical** | Pilot items serve at `QUARANTINED` → `CALIBRATING` only. **No pilot item may satisfy a `Mastered` gate.** The pilot must not be able to award a badge or a level-up. |

### 10J — Scale Generation

| | |
|---|---|
| **Deliverable** | Remaining ~1,360 contracts → ~84,000 specs → ~700,000 items, staged 1% → 10% → 50% → 100% by curriculum release |
| **Owner** | All |
| **Entry** | **The 10I gate has passed** |
| **Effort** | ~3 years, ~5–6 FTE reviewers at peak (Phase 15 §15.8) |
| **Sequencing** | By level, lowest first (2.1 → 2.2 → 2.3 → 1.3 → 3.1 …), because prerequisites must exist before dependents can be validated. Within a level, HIGH-risk competencies first, while reviewer attention is freshest and the cost of rework is lowest. |

---

## 16.3 What to implement first

Concretely, the next five work items in order:

| # | Item | Why first | Effort |
|---|---|---|---|
| 1 | `LevelDefaults` (15) + `GroupPolicy` (5) + `GlobalPolicy` (1) | Every contract and every spec reads from these. Authoring anything else first guarantees rework. 21 rows replace ~19,000 duplicated field values. | ~8 expert-days |
| 2 | Contract schema migration + completeness checker | Contracts cannot be authored until the 14 checks exist; otherwise the first 40 are inconsistent and must be redone. | ~2 eng-weeks |
| 3 | The 40 pilot contracts | The pilot's input. Selected per §16.4. | ~7 expert-days |
| 4 | Golden Content for the 40, **non-exemplars included** | Without non-exemplars, validators cannot be calibrated, and the pilot cannot report a trustworthy result. | ~270 expert-hours |
| 5 | Spec compiler + validator calibration harness | These two together are the "machine." Everything after is running it. | ~5 eng-weeks |

**Not first:** the 1,400 competency cells. That was the correct answer under the previous
architecture and is the wrong answer now. Authoring 1,400 contracts before proving that contracts
produce good content risks 230 expert-days against an unvalidated contract design.

**Also not first:** any lesson content. Phase 10J is three stages and one gate away.

---

## 16.4 Pilot selection

The pilot must be *representative*, not convenient. Deliberately spans age groups, levels, pillars,
content types, and risk classes — and deliberately includes the two hardest cases in the platform.

### Age groups and levels — 3 groups, 4 levels

| Group | Level | Why chosen |
|---|---|---|
| `GR_1_3` | **2.2** | Densest foundational content; the conceptual-change case (synonymy) lives here; phonics still active |
| `GR_1_3` | **2.3** | Tests spiral continuity from 2.2 and the closing of the phonics branch |
| `GR_4_7` | **3.2** | Mid-ladder; genre writing, register, multi-paragraph production; heaviest rubric-scoring load |
| `GR_8_10` | **4.2** | Adult-register content; argumentation; **and the condescension test** — the pilot must include a Grade 9 cohort placed at a low level (see below) |

### The two hardest cases, both included on purpose

**1. Cross-level remediation without condescension.** A cohort of Grade 8–9 learners sitting at
Level 2.2 receives Grade-8-environment content at Level-2.2 difficulty (Phase 13 §13.4 Variant B).
This is the platform's central claim and its most likely failure mode. If AI-generated Grade 9
content at Level 2.2 reads as babyish, the orthogonality claim fails and it must be discovered in
the pilot, not after 700,000 items exist.

**2. A conceptual change.** `wl:WORD/vocab-depth/synonym-in-context@2.2` — where the Level 1.3 model
is deliberately broken. AI generating instruction that must *surface and then contradict* a prior
taught belief is the hardest generation task in the curriculum, and the one most likely to be
silently botched (the generator will tend to present the new rule as though it had always been the
rule, which destroys the pedagogical event).

### Pillars — all 8

| Pillar | Pilot competencies | Notes |
|---|---|---|
| SOUND | 5 | incl. pronunciation with ASR; incl. Level 2.2 phonics (HIGH risk) |
| WORD | 6 | incl. the conceptual change |
| SENTENCE | 5 | incl. clause combining at 3.2 |
| UNDERSTANDING | 6 | reading + listening, incl. inference at 4.2 |
| EXPRESSION | 6 | speaking (ASR) + writing (rubric) — the expensive scoring paths |
| COMMUNICATION | 4 | incl. a T3 conversation case |
| THINKING | 4 | incl. fallacy identification at 4.2 |
| MASTERY | 4 | retention and transfer activities — **the pillar with no legacy content, so entirely new** |
| **Total** | **40** | |

MASTERY inclusion is non-negotiable: it is the only pillar with zero existing content in the
codebase, so the pilot is the first evidence that its activity types can be generated at all.

### Content types and tiers

| Dimension | Pilot coverage |
|---|---|
| Content types | reading · listening · speaking · writing · vocabulary · grammar · phonics · thinking (all 8) |
| Tiers | T1 (~200 items) · T2 (~3,000) · T2P (~120 templates) · T3 (~1,000 live turns) |
| Risk classes | HIGH ~900 items · MEDIUM ~2,100 · LOW ~1,800 |
| Bands | all five, D1–D5 |
| Scoring methods | `EXACT` · `PARTIAL` · `ASR` · `RUBRIC_LLM` (all four) |

---

## 16.5 The pilot is a product validation milestone

Not Phase 10A engineering work. The 40-contract pilot is the point at which the architecture earns —
or fails to earn — the right to scale. It answers nine questions, and a pass on engineering metrics
with a fail on any of these is a fail.

| # | Question | Measured by | Where |
|---|---|---|---|
| 1 | Did **predicted difficulty** match reality? | p-value within declared band; measured vs. declared band correlation | §16.6 learner table |
| 2 | Did content **discriminate between mastery states**? | point-biserial vs. micro-skill mastery | §16.6 |
| 3 | Did the AI **classify errors correctly**? | error-code precision/recall vs. human coding of the same responses | §16.6 — **new** |
| 4 | Did **linguistic complexity** match the intended level? | post-hoc re-measurement of served items vs. `LevelDefaults` | §16.6 — **new** |
| 5 | Did **grade ⊥ mastery separation** work? | learner-side engagement/abandon for Grade 8–9 @ Level 2.2 vs. matched Grade 2 @ Level 2.2 | §16.6 — strengthened to a learner measure, not only expert review |
| 6 | Did **remediation feel age-appropriate**? | expert condescension review + learner self-report | §16.6 |
| 7 | Did AI content produce **unintended misconceptions**? | emergent error patterns with no matching contract entry | §16.6 — **new** |
| 8 | Did **trusted content predict later performance**? | success on dependent competencies, by trust state of the evidence that produced mastery | §16.6 — **new, and the strongest test** |
| 9 | Did the mastery engine make **fewer false positives**? | delayed-retention failure rate among `MASTERED`, vs. the legacy 5-session rule run in shadow mode | §16.6 — **new** |

### Questions 8 and 9 are the ones that matter most

Everything else measures whether the *machine* works. These two measure whether the machine's output
*means anything*.

**Q8 — predictive validity.** If mastery established on `TRUSTED` content predicts success on
dependent competencies no better than mastery established on `QUARANTINED` content, then the entire
trust lifecycle is ceremony. This is the test that justifies Phase 11 §11.4's existence, and it is
falsifiable.

**Q9 — false-positive reduction.** The legacy adaptive engine (5-session / 3-session rule) runs in
**shadow mode** on the pilot cohort: it computes what it *would* have decided, without acting. We
then compare how often each engine marks a learner ready when they are not, using delayed retention
at 2× the interval as ground truth. If the BKT/Elo/gates engine does not beat a five-session
counting rule, the architecture's central claim — that mastery is an inference, not a counter — is
unsupported, and we should say so rather than ship it.

Shadow-mode comparison is cheap (it is a parallel computation over the same evidence) and it is the
only way to establish that the sophistication earns its cost.

---

## 16.6 Pilot gate criteria — GO / NO-GO

The 10I gate. All criteria must pass. **Any red is a NO-GO**; scaling does not proceed on a partial
pass, because every deficiency multiplies by 175× at full volume.

### From 10H — expert review (blind)

| Metric | Target | NO-GO |
|---|---|---|
| Expert acceptance rate, AI items, HIGH risk | ≥90% | <80% |
| Expert acceptance rate, AI items, MEDIUM/LOW | ≥95% | <88% |
| **Blind distinguishability**: experts identifying AI vs. golden above chance | ≤60% accuracy | >75% |
| Non-exemplar rejection by experts | ≥95% | <90% |
| Inter-reviewer agreement (κ) | ≥0.70 | <0.60 |
| Age-appropriateness failures | <2% | ≥5% |
| **Condescension failures on the Grade 8–9 @ Level 2.2 cohort** | **0%** | **any** |
| Linguistic accuracy failures | <1% | ≥3% |
| Conceptual-change items correctly surfacing the prior model | ≥95% | <85% |
| Safety / bias findings | 0 severe | any severe |

Two of these are zero-tolerance. **Condescension failures**, because the cross-level remediation
claim is the product's differentiator and a single reproducible failure means the grade-environment
axis does not work. **Severe safety findings**, for the obvious reason.

The blind-distinguishability criterion is inverted from intuition on purpose: we want experts
*unable* to reliably tell AI items from expert-authored golden items. Above 75% accuracy means AI
items have a detectable quality signature, and a detectable signature will be noticed by teachers.

### From 10I — learner calibration

| Metric | Target | NO-GO |
|---|---|---|
| Items reaching `TRUSTED` within 6 weeks | ≥80% | <65% |
| Mean point-biserial discrimination | ≥0.25 | <0.18 |
| Items auto-retiring on bad statistics | <8% | >15% |
| p-value within declared band | ≥85% of items | <75% |
| Declared vs. measured cognitive tier agreement | ≥80% | <70% |
| ASR scoring reliability (vs. human phonetic rating) | r ≥0.80 | <0.70 |
| Rubric scoring agreement (LLM vs. human, 2% audit) | κ ≥0.75 | <0.65 |
| Learner-reported item problems | <1.5 per 1,000 attempts | >4 |
| Abandon rate | <12% | >20% |
| Engagement: pilot cohort session completion | ≥85% | <70% |
| Mastery-rate plausibility (no "too fast" flags) | 0 competencies flagged | ≥3 flagged |
| DIF across region / L1 / gender at matched ability | 0 significant | any significant |

### From 10I — the five validation questions (Q3–Q9)

These are new criteria, added when the pilot was reframed as a validation milestone. Each maps to a
`CalibrationRun` assumption in [Phase 18 §18.9](18_CALIBRATION_POLICY.md#189-what-calibration-measures-beyond-content).

| # | Metric | Target | NO-GO |
|---|---|---|---|
| **Q3** | Error-code **precision** vs. human coding of the same 400 responses | ≥0.80 | <0.65 |
| **Q3** | Error-code **recall** vs. human coding | ≥0.70 | <0.55 |
| **Q3** | Misattribution rate on the two known confusable pairs (retrieval-pause vs. rhetorical-pause; decoding-gap vs. comprehension-gap) | <15% | >30% |
| **Q4** | Served items re-measured post-hoc as within `LevelDefaults` ceilings | ≥99% | <96% |
| **Q4** | T2P **slot-filled instances** within ceilings (fills are the risk, not the templates) | ≥99% | <97% |
| **Q5** | Abandon-rate gap: Grade 8–9 @ L2.2 vs. matched Grade 2 @ L2.2 | ≤3 pp | >10 pp |
| **Q5** | Session-completion gap, same comparison | ≤3 pp | >10 pp |
| **Q5** | Grade 8–9 @ L2.2 self-report "this felt made for someone my age" | ≥80% agree | <60% |
| **Q6** | Expert condescension findings (Grade 8–9 @ L2.2) | **0** | any |
| **Q7** | **Emergent** error patterns (≥3% incidence) with no matching contract misconception | ≤2 across 40 competencies | ≥6 |
| **Q7** | Emergent patterns attributable to the AI content itself rather than to the learner | **0** | ≥2 |
| **Q8** | First-attempt success on dependent competencies: `MASTERED` vs. `DEVELOPING`, at matched Elo | **≥25 pp separation** | <12 pp |
| **Q8** | Same separation, mastery from `TRUSTED` evidence vs. from `CALIBRATING` evidence | TRUSTED ≥8 pp better | TRUSTED not better |
| **Q8** | Delayed retention at 2× interval among `MASTERED` | ≥85% pass | <70% |
| **Q9** | False-positive rate (marked ready, fails 2× delayed retention) — this engine | ≤10% | >20% |
| **Q9** | False-positive rate — legacy 5-session rule, shadow mode, same cohort | — | **this engine not better than legacy** |
| **Q9** | Reduction vs. legacy | ≥40% relative | <15% relative |

**Q7's second row is zero-tolerance.** An emergent misconception traceable to the AI content —
learners consistently forming a wrong belief *because of how a generated item was phrased* — is the
one failure mode that scales into real educational harm. One reproducible instance at 4,800 items
implies roughly 175 at full volume.

**Q9's second row is the honest-comparison row.** If the legacy five-session counting rule performs
as well as BKT + Elo + evidence gates on false positives, the sophisticated engine has not earned
its complexity, and the correct response is to report that rather than to ship it and hope. Running
the comparison costs almost nothing; not running it means never knowing.

The "declared vs. measured cognitive tier agreement" row is the empirical test of Phase 11 §11.2's
half-provable Claim 3. If declared Bloom tiers agree with measured item behaviour only 55% of the
time, the honest response is to stop declaring cognitive tier as though it were meaningful and
treat it purely as a prior — a finding worth having before 700,000 items carry the claim.

### From 10E — validator calibration (re-verified at the gate)

| Metric | Target | NO-GO |
|---|---|---|
| Accept rate on `ACCEPTABLE` golden | ≥0.95 | <0.90 |
| Reject rate on `NON_EXEMPLAR` | ≥0.90 | <0.85 |
| Reason-code accuracy on rejections | ≥0.80 | <0.70 |
| Gate 5 solver/generator disagreement rate | <5% | >12% |

### Cost and throughput

| Metric | Target | NO-GO |
|---|---|---|
| Cost per validated item (generation + validation) | within budget | >2× budget |
| Live generation share of served activities (T3) | ≤8% | >15% |
| Live generation p95 latency | <3 s | >6 s |
| Expert-hours per 1,000 validated items | ≤34 (per Phase 15 §15.8) | >60 |

The last row is the scaling test in its most direct form. At >60 expert-hours per 1,000 items, the
full library costs >28 expert-years and the risk-based model has not achieved its purpose — the
correct response is to raise the T2P share and revisit the `baseRisk` table, not to proceed and
hope.

---

## 16.7 Partial-pass and failure handling

A NO-GO is not a project failure; it is the pilot working. Diagnostic routing:

| Failure signature | Root cause | Response | Cost |
|---|---|---|---|
| Low expert acceptance, concentrated on one gate | Prompt template or validator threshold | Fix template/threshold; regenerate; re-review that stratum only | ~1 week |
| Low expert acceptance, spread across gates for specific competencies | **Ambiguous contracts** | Revise those contracts; re-derive specs; regenerate | ~2 weeks |
| Low expert acceptance across all competencies | Contract *schema* is insufficient — fields are missing that generation needs | Revise Phase 12 field set; **this is exactly what the pilot exists to find** | ~4 weeks |
| High distinguishability | Golden content too thin, or too few anchors per spec | Expand golden content; raise anchor count; re-run Stage 8 tolerances | ~3 weeks |
| Poor discrimination despite expert approval | Items are pedagogically plausible but psychometrically inert | Revise `distractorPolicy` and misconception mapping; Gate 7 is under-powered | ~3 weeks |
| Declared/measured cognitive tier disagreement | Cognitive demand is not reliably declarable | Demote it to a prior; rely on empirical banding; **document the honest limit** | ~1 week |
| Condescension failure | Grade environment axis not actually independent in generation | Fix `GroupPolicy` context injection; this is architectural and must be fixed before scaling | ~2 weeks |
| Cost or expert-hours over budget | Risk table too conservative, or T2P share too low | Raise T2P share; revisit `baseRisk` at Level A | ~2 weeks |

Re-running the pilot after a fix costs 2–6 weeks. Discovering any of these after 10J has produced
400,000 items costs a re-generation of the library and, if learners have already been served, a
mastery-data integrity problem. **The pilot is the cheapest insurance in the programme.**

---

## 16.8 Revised Phase 10 readiness

Supersedes the readiness table at the end of `10_CONCEPT_WALKTHROUGHS.md`.

| Prerequisite | Stage | Status |
|---|---|---|
| 15 `MasteryLevel` rows with ceilings | — | ✅ specified (Phase 2) |
| 32 `Domain` rows | — | ✅ specified (Phase 4) |
| 8-pillar × 15-level matrix | — | ✅ specified (Phase 3) |
| Mastery / assessment engine design | — | ✅ specified (Phase 5) |
| AI adaptation rules | — | ✅ specified (Phase 6) |
| Operating model & provability analysis | — | ✅ specified (Phase 11) |
| Competency Contract schema | — | ✅ specified (Phase 12) |
| Content Specification schema + compiler design | — | ✅ specified (Phase 13) |
| Generation tiers, 10-stage pipeline, trust lifecycle | — | ✅ specified (Phase 14) |
| Governance roles, risk, sampling, health score | — | ✅ specified (Phase 15) |
| — | | |
| `LevelDefaults` × 15, `GroupPolicy` × 5, `GlobalPolicy` × 1 | 10A | ⬜ **NEXT — blocking everything** |
| Contract schema migration + completeness checker | 10A | ⬜ engineering |
| 40 pilot Competency Contracts `APPROVED` | 10A | ⬜ authoring |
| Spec compiler | 10B | ⬜ engineering |
| ~240 pilot specs compiled | 10B | ⬜ automated once compiler exists |
| ~320 golden items incl. ≥120 non-exemplars | 10C | ⬜ **authoring — gates 10E** |
| Prompt templates + T2P slot lexicons | 10D | ⬜ engineering |
| 10-stage validation pipeline | 10E | ⬜ engineering |
| **Validator golden calibration passing** | 10E | ⬜ **hard gate** |
| 6 governance roles staffed + reviewer calibration | 10F | ⬜ hiring — start now, 8-week lead |
| BKT + Elo + decay engines | 10F | ⬜ engineering (needed for 10I discrimination) |
| Trust lifecycle enforcement (both mechanisms) | 10F | ⬜ engineering — **hard gate for 10I** |
| ~4,800 pilot items generated | 10G | ⬜ |
| Blind expert review + agreement study | 10H | ⬜ |
| 2,000-learner calibration cohort, ~60k attempts | 10I | ⬜ |
| **GO/NO-GO gate passed** | 10I | ⬜ **hard gate for 10J** |
| Remaining 1,360 contracts | 10J | ⬜ |
| ~700,000 content items | 10J | ⬜ |

### The one-sentence answer to "what next"

> Author the 21 `LevelDefaults` / `GroupPolicy` / `GlobalPolicy` rows, build the contract
> completeness checker, and start hiring the reviewer panel — in parallel, this week. Everything
> else in Phase 10 reads from those 21 rows, and the panel has an 8-week lead time.
