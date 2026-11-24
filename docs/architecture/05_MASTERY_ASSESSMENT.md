# PHASE 5 — Mastery & Assessment Engine

Covers spec §13 (mastery states) and §14 (the 7 assessment types).

**The governing rule:** *completion is not evidence.* A learner who finishes 40 activities on
relative clauses and gets them right by pattern-matching the activity format has demonstrated
nothing. Mastery is an inference from evidence that is **distributed across formats, sessions,
and time**, and it decays if unused.

---

## 5.1 The five mastery states

| State | Meaning | Entry condition | What the AI does next |
|---|---|---|---|
| **Introduced** | Has met it; cannot yet do it | ≥1 exposure, `P(L) < 0.35` | Teach again with a different explanation; heavy scaffolding at band D1 |
| **Practicing** | Can do it with support | `0.35 ≤ P(L) < 0.60` | High-frequency practice, scaffolds fading, band D1→D2 |
| **Developing** | Inconsistent without support | `0.60 ≤ P(L) < 0.80` | Interleave with related skills; remove scaffolds; band D2→D3 |
| **Proficient** | Reliable in familiar contexts | `P(L) ≥ 0.80` **and** gates below | Reduce frequency; enter retention schedule; band D3→D4 |
| **Mastered** | Reliable, durable, transferable | `P(L) ≥ 0.92` **and** gates below | Retention-only; becomes a prerequisite; unlock dependents; band D4→D5 |

### Proficient gates (all required)

```
P(L) ≥ 0.80
attempts ≥ 3
distinct_sessions ≥ 2
distinct_formats ≥ 2
no active error-pattern flag on this micro skill
```

### Mastered gates (all required)

```
P(L) ≥ 0.92
attempts ≥ 5
distinct_sessions ≥ 3
elapsed_days(first_attempt → now) ≥ 7
distinct_formats ≥ 3
productive_evidence ≥ 1          # appeared in the learner's own speech or writing,
                                 # not only in recognition/selection items
delayed_retention_check: PASSED  # at ≥ level's retention interval (Phase 3 §3.9)
transfer_evidence ≥ 1            # correct in a context/topic unlike the teaching context
no active error-pattern flag
```

Two of these gates carry most of the weight and are the ones commonly missing from
"mastery-based" systems:

- **`productive_evidence`** — recognising the right relative clause in a multiple-choice item is
  not the same capability as producing one. Multiple-choice alone can never yield `Mastered`.
- **`delayed_retention_check`** — mastery claimed without a delayed check is a claim about
  short-term memory. This gate is why the MASTERY pillar exists as a real pillar with real
  activities (Phase 3 §3.9).

States may **regress**. Decay (§5.4) can push a `Mastered` skill back to `Proficient` or
`Developing`, which re-enrols it in active practice. Regression is silent to the learner — the
skill simply reappears in a session.

---

## 5.2 Mastery estimation — Bayesian Knowledge Tracing

Per `(learner, microSkill)`, maintain `P(L)` = probability the skill is learned.

**Parameters** (per micro skill, calibrated from population data, seeded from defaults by format
and level):

| Param | Meaning | Default | Range |
|---|---|---|---|
| `P(L₀)` | prior probability learned before instruction | 0.15 | 0.05–0.40 |
| `P(T)` | probability of learning on an attempt | 0.20 | 0.08–0.35 |
| `P(S)` | slip: knows it, answers wrong | 0.10 | 0.05–0.25 |
| `P(G)` | guess: doesn't know it, answers right | format-dependent | see below |

**`P(G)` by format** — this is why format diversity is a mastery gate:

| Format | `P(G)` |
|---|---|
| 2-option select | 0.50 |
| 4-option multiple choice | 0.25 |
| matching (5 pairs) | 0.15 |
| cloze with word bank | 0.12 |
| open cloze (typed) | 0.05 |
| constructed response / short answer | 0.03 |
| speaking (ASR-scored) | 0.02 |
| extended writing (rubric-scored) | 0.01 |

A learner who only ever does 4-option MCQs is capped by their guess rate: the BKT posterior
asymptotes below 0.92, so `Mastered` is mathematically unreachable without low-guess evidence.
The gate is enforced by the math, not just by policy.

**Update on evidence** (correct / incorrect):

```
                        P(Lₙ) · (1 − P(S))
P(Lₙ | correct)  = ───────────────────────────────────────
                   P(Lₙ)·(1 − P(S)) + (1 − P(Lₙ))·P(G)

                        P(Lₙ) · P(S)
P(Lₙ | wrong)    = ───────────────────────────────────────
                   P(Lₙ)·P(S) + (1 − P(Lₙ))·(1 − P(G))

P(Lₙ₊₁) = P(Lₙ | evidence) + (1 − P(Lₙ | evidence)) · P(T)
```

**Partial credit** (rubric and ASR scores are continuous, not binary). For a score `s ∈ [0,1]`,
interpolate in log-odds space rather than treating `s ≥ 0.5` as correct:

```
logit(P') = s · logit(P(L | correct)) + (1 − s) · logit(P(L | wrong))
```

This preserves the information in "scored 0.7 on pronunciation", which a binary threshold
discards.

**Difficulty adjustment.** An item at difficulty band `b` relative to the learner's expected
band `b*` scales the evidence weight:

```
w = clamp(1 + 0.25·(b − b*), 0.5, 1.5)
```

Succeeding on a harder-than-expected item is stronger evidence; succeeding on an easier one is
weaker. Applied to `P(T)` and to the slip/guess terms.

---

## 5.3 Ability estimation — Elo per strand

BKT answers "does this learner know micro skill X?" It does not answer "how hard should the next
item be?" — that needs a continuous ability estimate that generalises across skills. So each of
the 13 Language DNA strands carries an Elo rating.

```
Learner strand rating:  θ ∈ [0, 3000]     (start: 1200 at diagnostic placement)
Item difficulty:        b ∈ [0, 3000]     (authored estimate, then population-calibrated)

Expected score:   E = 1 / (1 + 10^((b − θ)/400))
Update:           θ' = θ + K · (actual − E)
                  b' = b − K_item · (actual − E)      # item calibration, K_item = 4
```

**Adaptive K-factor** — high early volatility for fast placement, low later for stability:

```
K = 40                      if strand_attempts < 30
K = 24                      if 30 ≤ strand_attempts < 100
K = 12                      if strand_attempts ≥ 100
K = K · 1.5                 if |actual − E| > 0.5 for 3 consecutive attempts   (regime change)
```

**Rating → difficulty band** — the mapping from continuous ability to the visible 75-state grid:

```
level_floor  = level_ordinal · 100 + 600        # Level 1.1 → 700, Level 5.3 → 2100
band = clamp(ceil((θ − level_floor) / 60) , 1, 5)
```

Target: serve items where `E ≈ 0.75`. That is the empirical sweet spot — high enough to sustain
motivation, low enough to generate information. Below `E ≈ 0.6` learners disengage; above
`E ≈ 0.85` the item teaches nothing and wastes session time.

**Why both models.** BKT is per-skill, sample-hungry, and gives the mastery *decision*. Elo is
cross-skill, sample-efficient, and gives the difficulty *setting*. Using Elo for mastery would
let a strong learner be credited with skills never practised; using BKT for difficulty would
leave new skills with no difficulty prior. They are complementary, and both are needed.

---

## 5.4 Retention & decay

Mastery estimates decay unless refreshed. Half-life regression, per `(learner, microSkill)`:

```
m(t) = m₀ · 2^(−t / h)

h = h₀ · Π(successful_retrievals) · spacing_bonus · strength_factor
```

| Term | Value |
|---|---|
| `h₀` | 7 days (initial half-life after first success) |
| per successful retrieval | `× 1.9` |
| per failed retrieval | `× 0.55` |
| spacing bonus | `× 1.25` if the retrieval occurred at ≥80% of the current half-life (spaced, not massed) |
| strength factor | `× 1.3` if evidence included productive use; `× 1.15` if it included transfer |

So a skill mastered with 5 well-spaced successful retrievals including productive evidence
reaches a half-life of roughly `7 × 1.9⁵ × 1.25 × 1.3 ≈ 280 days` — it effectively stops needing
review, which is the correct outcome and the reason the retention queue does not grow without
bound.

**Retention scheduling.** A skill enters the queue when `m(t)` is projected to cross **0.85**.
The Session Planner is obliged to serve due retention items before new material (Phase 6 §6.5).

**Decay-adjusted state.** All reporting and all prerequisite checks use `m(t)`, never the stored
peak `m₀`. A skill mastered in April and untouched since is not reported as mastered in August.
This is the single most important honesty property in the system, and it is what makes the school
progress report trustworthy.

---

## 5.5 Competency and level roll-up

```
competency_mastery = Σ(microSkill_mᵢ(t) · wᵢ) / Σ wᵢ
```
where `wᵢ` is the micro skill's authored weight (default 1.0; core micro skills up to 2.0).
A competency's state is the lowest state satisfied by its weighted mean **and** by the constraint
that no micro skill weighted ≥1.5 is below `Developing` — one broken core sub-skill blocks
competency proficiency regardless of the average.

```
strand_score  = weighted mean of competency masteries mapped to that DNA strand
level_progress = |{competencies at ≥ Proficient}| / |{competencies at level}|
```

Level-up requires the five conditions in [Phase 2 §2.3](02_LEVEL_MAP.md#23-placement-and-movement),
including the anti-lopsidedness rule (no pillar below 70% proficient) — which prevents a learner
from being promoted on the strength of strong reading while speaking lags two levels behind.

---

## 5.6 The seven assessment types

| # | Type | When | Duration | Visible? | Produces |
|---|---|---|---|---|---|
| 1 | **Diagnostic** | Once, at onboarding | 12–20 min | Yes — framed as "Discovery Quest" | Initial level placement, initial 13-strand DNA, initial Elo per strand |
| 2 | **Baseline** | Start of each level | 6–8 min | Partly | Per-competency starting estimates for the new level; BKT priors |
| 3 | **Daily** | Embedded, every session | ~2 min of a 15-min session | **No** | Continuous BKT + Elo updates; the bulk of all evidence |
| 4 | **Micro-skill** | Triggered on ambiguity | 60–90 s | **No** | Targeted disambiguation of a single uncertain micro skill |
| 5 | **Weekly** | Weekly | 5 min | Yes — framed as "Weekly Challenge" | Consolidated evidence, retention checks, pacing calibration |
| 6 | **Level** | At level-up candidacy | 20–25 min | Yes — framed as "Gate Challenge" | Level-up decision; must include productive tasks |
| 7 | **Mastery** | At `Mastered` candidacy per competency | Embedded + delayed | **No** | The delayed retention and transfer gates |

**~85% of all evidence comes from type 3** — ordinary practice activities that the learner
experiences as gameplay. The visible assessments (1, 5, 6) exist for three reasons: schools need
legible checkpoints, learners need a sense of milestone, and productive/timed tasks are hard to
embed invisibly. Everything else is silent.

### 1 — Diagnostic Assessment

Adaptive, branching, ~18 items, 12–20 minutes. Never feels like a test: presented as an
exploration of a world map.

```
Stage 1  Grade-anchored entry     Start at the modal level for the learner's grade, band D3.
Stage 2  Coarse binary search     6 items across SOUND/WORD/SENTENCE/UNDERSTANDING.
                                  Each response moves ±1 level. Converges within ~3 levels.
Stage 3  Productive probe         2 speaking (ASR) + 1 writing item at the candidate level.
                                  Non-negotiable — receptive-only placement systematically
                                  over-places learners with strong reading and weak production.
Stage 4  Strand differentiation   6 items targeting the strands with the widest posterior
                                  variance, to shape the initial DNA rather than flatten it.
Stage 5  Confirm                  3 items at the candidate level, band D2.
```

Output: `level` (placed at band D2), `θ` per strand, `P(L₀)` adjustments, and a
`placement_confidence`. Confidence below 0.7 schedules a re-diagnostic after 10 sessions rather
than trusting a noisy placement.

Guardrails: never place more than 2 groups below the grade's typical group (floor + teacher
flag); may place above without limit; never place at band D1 or D5.

### 2 — Baseline Assessment

On entering a new level, 6–8 minutes across that level's competencies. Purpose is to avoid
teaching what the learner already knows — a learner promoted into Level 3.2 often already holds
several of its competencies. Sets BKT priors per competency so the first fortnight is not wasted.

### 3 — Daily Assessment (embedded)

Every activity is an assessment. Each attempt records: correctness/score, latency, hint usage,
retry count, and (for speech/writing) the full rubric or ASR breakdown. The learner sees stars
and XP; the engine sees a scored, timestamped, format-tagged evidence record. This is the
substrate everything else runs on.

### 4 — Micro-skill Assessment (triggered)

Fires when the engine cannot distinguish between competing explanations for a failure. Example:
a learner fails "identify the main idea." Is that a comprehension problem, a vocabulary problem,
or a decoding problem? Three 20-second probes resolve it, and remediation goes to the actual
cause rather than the symptom. This is the mechanism that lets a Level 4.2 learner be
remediated on a Level 2.2 syllable-stress skill without their visible level changing.

Trigger conditions: posterior variance above threshold, or a failure whose prerequisites are all
nominally `Proficient` (a contradiction the engine must resolve), or an error-pattern flag with
ambiguous attribution.

### 5 — Weekly Assessment

5 minutes, framed as the Weekly Challenge with its own reward. Composition: 40% retention items
due this week, 40% current-level consolidation, 20% stretch items one band above. Also
recalibrates pacing — if a learner cleared the stretch items easily three weeks running, the
outer loop advances them faster.

### 6 — Level Assessment (the gate)

20–25 minutes, only offered when the five level-up conditions are already met — so it confirms
rather than decides, and pass rates should be high (~85%). A gate that fails learners frequently
is mis-calibrated upstream.

Mandatory composition:
- ≥1 speaking task, ASR + rubric scored
- ≥1 extended writing task, rubric scored
- ≥1 listening comprehension task
- ≥1 reading comprehension task at the level's full text length
- ≥1 transfer task in an unfamiliar context
- coverage of ≥1 competency from all 8 pillars

Failure is never framed as failure: "three more quests before the gate opens." The learner
returns to targeted practice on exactly the competencies that fell short.

### 7 — Mastery Assessment (delayed & displaced)

Not a sitting. It is the set of delayed retention probes and transfer items that satisfy the
`Mastered` gates. Scheduled by the decay model, delivered invisibly inside normal sessions,
spread over weeks. This is the assessment type that makes mastery a claim about durable
capability rather than about last Tuesday.

---

## 5.7 Scoring the productive modes

Recognition items score themselves. Speaking and writing need explicit rubrics, and they carry
the `productive_evidence` gate, so their scoring quality determines whether mastery claims are
sound.

### Speaking — ASR + rubric

| Sub-score | Source | Weight by level |
|---|---|---|
| Pronunciation accuracy (phoneme-level) | ASR confidence + forced alignment | 1.x–2.x: 40% → 5.x: 15% |
| Fluency (rate, pauses, fillers, repairs) | ASR timing | 20% → 25% |
| Prosody (stress, intonation contour) | pitch/energy contour vs. reference | 10% → 20% |
| Content & task completion | LLM rubric | 20% → 25% |
| Language range & accuracy | LLM rubric | 10% → 15% |

The weight shift is the point: at Level 1.2 pronunciation *is* the skill; at Level 5.2 a slight
accent is irrelevant and content, prosody, and register are what matter. A fixed weighting would
either fail young learners on content or fail seniors on accent — both wrong.

ASR outputs are stored with confidence bounds. Attempts with ASR confidence below 0.6 (noise,
clipping) are recorded but excluded from mastery inference, and the learner is prompted to retry
without being penalised.

### Writing — analytic rubric, LLM-scored, human-audited

Five dimensions, each 0–5, weighted by level:

| Dimension | Covers | Weight 1.x–2.x | Weight 5.x |
|---|---|---|---|
| Task & content | addresses the prompt, sufficient development | 25% | 25% |
| Organisation | structure, cohesion, paragraphing | 15% | 25% |
| Language range | vocabulary and syntactic variety appropriate to level | 15% | 25% |
| Accuracy | grammar, spelling, mechanics | 35% | 15% |
| Voice & register | audience-appropriateness, style control | 10% | 10% |

Each rubric score must be returned with **span-level annotations** tied to micro-skill
addresses — the scorer must say *which* micro skill the deduction belongs to. A rubric score
without addressed annotations produces feedback but is discarded for mastery inference, because
unattributed evidence cannot update a specific BKT node.

**Human audit loop:** 2% of LLM-scored writing samples are routed to human raters. Agreement is
tracked per level and per rubric dimension; drift beyond a threshold triggers re-prompting or
re-calibration of the scorer. Without this loop the entire mastery claim rests on an unaudited
model.

---

## 5.8 Anti-gaming

Every mastery-based system is attacked by learners optimising for the reward rather than the
learning. Detected and handled:

| Pattern | Detection | Response |
|---|---|---|
| Rapid guessing | latency < 25% of level-normed median with accuracy near chance | Attempt flagged `low_effort`; excluded from mastery; session pivots to a different format |
| Format farming | ≥80% of a micro skill's evidence from one format | Format diversity gate already blocks `Mastered`; planner forces alternate formats |
| Hint mining | correct only after full hint disclosure | Scored at 0.3 weight; hint usage recorded as a separate signal |
| Retry until correct | correctness on attempt N>1 | Only the **first** attempt updates BKT; later attempts are practice, not evidence |
| Copy-paste writing | n-gram overlap with the source or prompt above threshold | Zero on Language Range and Task; flagged for teacher review; no productive credit |
| Streak-only engagement | logs in, completes minimum, exits | Streak requires ≥1 activity at band ≥D3; minimum-effort sessions do not extend it |
| Answer sharing (school) | identical wrong answers across a class within a short window | Item retired from the pool; cohort flagged for the teacher |
