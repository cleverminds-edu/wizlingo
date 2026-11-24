# PHASE 6 — AI Language Coach, Language DNA & Adaptation Rules

Covers spec §8 (AI loop), §9 (Language DNA), §10 (daily 15 minutes), §11 (content generation),
§12 (difficulty engine).

---

## 6.1 Language DNA

The persistent learner model. **Never reduced to a single score** — the AI's entire advantage
comes from acting on the *shape* of the vector.

### The 13 strands

| # | Strand | Fed by | Primary evidence |
|---|---|---|---|
| 1 | `sound` | SOUND · phonemic-awareness, phonics | decoding, segmentation, sound discrimination |
| 2 | `vocabulary` | WORD · vocab-breadth, vocab-depth | recognition, production, contextual inference |
| 3 | `grammar` | SENTENCE · grammar-accuracy, msyn | accuracy in constrained and free production |
| 4 | `sentenceConstruction` | SENTENCE · syntax, sentence-style | combining, transforming, varying |
| 5 | `listening` | UNDERSTANDING · listening | comprehension questions, note-taking, dictation |
| 6 | `speaking` | EXPRESSION · speaking-production | ASR-scored tasks, open response, presentation |
| 7 | `reading` | UNDERSTANDING · reading | accuracy, rate, comprehension |
| 8 | `writing` | EXPRESSION · writing-production | rubric-scored production |
| 9 | `comprehension` | UNDERSTANDING · inference, critical-evaluation | inferential and evaluative items |
| 10 | `communication` | COMMUNICATION (all domains) | interaction, presentation, pragmatics |
| 11 | `thinking` | THINKING (all domains) | reasoning, analysis, fallacy, synthesis |
| 12 | `fluency` | EXPRESSION · fluency | rate + smoothness in speech and reading |
| 13 | `pronunciation` | SOUND · pronunciation, prosody | phoneme accuracy, stress, intonation |

### What each strand stores

```ts
type Strand = {
  score: number            // 0–1000, decay-adjusted, the reportable value
  elo: number              // 0–3000, ability rating driving difficulty selection
  confidence: number       // 0–1, inverse of posterior variance
  trend: number            // slope over last 20 sessions, per-session delta
  volatility: number       // stddev of recent deltas — high = unstable, needs consolidation
  lastEvidenceAt: Date
  evidenceCount: number
  ceiling: number          // highest reliably demonstrated — used to detect regression
}
```

### Beyond the strands

Language DNA also carries:

**Micro-skill mastery map** — sparse, ~200–900 active records per learner, each with `P(L)`,
`m(t)`, state, evidence ledger. This is the resolution the AI actually reasons at; the 13 strands
are the *reporting* layer.

**Error pattern registry** — recurring, named, diagnosable error types with occurrence counts
and trend, e.g.:
```
{ code: "L1_INTERFERENCE_V_W", strand: "pronunciation", count: 23, trend: "declining",
  firstSeen: "2026-05-02", remediationAttempts: 3, examples: [...] }
{ code: "SVA_THIRD_PERSON_S", strand: "grammar", count: 41, trend: "flat", ... }
{ code: "ARTICLE_OMISSION",   strand: "grammar", count: 67, trend: "flat", ... }
```
Error patterns are the highest-value signal in the system: they turn "grammar is 620/1000" into
"drops third-person -s under production load, 41 times, not improving." One is a number; the
other is an intervention. The registry is seeded with ~90 named patterns, weighted toward known
L1-interference patterns for Indian language backgrounds (article use, progressive aspect
over-extension, /v/–/w/, /θ/–/t/, retroflex substitution, tag-question formation, count/mass
noun distinctions).

**Affective & behavioural state** — engagement, frustration index, confidence calibration,
consistency, optimal session time-of-day, attention span estimate.

**Preference & context** — interests (used for content topic selection), grade, age group,
school/class, L1 background, accessibility needs.

### The shape principle

Two learners with identical mean scores get entirely different sessions:

| | Learner A | Learner B |
|---|---|---|
| reading | 780 | 520 |
| listening | 760 | 540 |
| speaking | 410 | 790 |
| pronunciation | 380 | 810 |
| grammar | 640 | 600 |
| **mean** | **594** | **592** |

A is a **silent decoder** — strong receptive skills, blocked production. Almost certainly a
confidence and articulation problem, not a knowledge problem. Intervention: low-stakes private
speaking with no scoring shown, minimal-pair work, gradual audience exposure.

B is an **oral learner** — fluent speech, weak print. Likely a decoding gap masked by strong oral
vocabulary. Intervention: diagnostic drop to phonics micro skills regardless of visible level,
plus reading-while-listening scaffolds.

A single composite score of ~593 would send both learners the same session. That failure is
exactly what the 13-strand model exists to prevent.

---

## 6.2 The AI learning loop

```
        ┌──────────────────────────────────────────────────┐
        │                                                  │
   ┌─ OBSERVE ─→ DIAGNOSE ─→ TEACH ─→ PRACTICE ─→ ASSESS ─┤
   │                ↑                                      │
   │                │                                      ↓
   └── MASTER ←─ REINFORCE ←──────────────────────────── ADAPT
```

| Step | Trigger | Owner | Reads | Writes | Latency |
|---|---|---|---|---|---|
| **OBSERVE** | every interaction | Evidence Layer | raw interaction | `Attempt` | real-time |
| **DIAGNOSE** | every attempt + nightly | Inference Layer | attempts, DNA | BKT posteriors, Elo, error patterns | <100 ms hot path |
| **TEACH** | new/failed micro skill | Orchestration | DNA, curriculum DAG | selected teaching activity | per activity |
| **PRACTICE** | after teaching | Orchestration | DNA, item pool | activity sequence | per activity |
| **ASSESS** | continuous | Inference | attempts | mastery states | per attempt |
| **ADAPT** | every attempt | Difficulty Engine | Elo, latency, affect | next difficulty band, scaffolds | <50 ms |
| **REINFORCE** | decay schedule | Session Planner | decay model | retention queue | nightly |
| **MASTER** | gate evaluation | Mastery Engine | evidence ledger | state transitions, unlocks | nightly + on-gate |

The loop runs at three time constants simultaneously (Phase 1 §1.2): ADAPT every activity,
TEACH/PRACTICE/REINFORCE every session, MASTER every night and at gates.

---

## 6.3 Signal → action rules

The 14 monitored signals, each with its measurement, thresholds, and the **exact** effect on the
next activity. This table is the specification the orchestration layer implements.

Rules are evaluated in the listed priority order; the first matching rule in each category wins,
and safety/affect rules (13, 14) override everything.

---

### 1. Accuracy — *rolling, current micro skill*

| Condition | Action |
|---|---|
| ≥90% over last 5 attempts | `band += 1`; skip remaining scheduled practice on this micro skill; advance to next in sequence |
| 70–89% | Hold band; continue planned sequence |
| 50–69% | Hold band; insert 2 additional practice items at same band; enable one scaffold |
| 30–49% | `band −= 1`; re-teach with a *different* explanation modality (visual → verbal → worked example) |
| <30% over 3 attempts | **Halt sequence.** Fire Micro-skill Assessment (§5.6 type 4) on prerequisites. Reschedule this skill only after the actual gap is found and remediated |

### 2. Response time — *normalised to level and format median*

Latency is interpreted **jointly with accuracy** — alone it is ambiguous.

| Latency | Accuracy | Interpretation | Action |
|---|---|---|---|
| <40% of median | high | Automatic — mastered | `band += 1`; mark automaticity evidence; reduce this skill's frequency |
| <25% of median | ~chance | Rapid guessing | Flag `low_effort`; exclude from mastery; switch format; if repeated, end session early with a neutral message |
| 40–150% of median | high | Healthy | Continue |
| 150–250% of median | high | Effortful but correct — **not** automatic | Hold band. Do **not** promote. Schedule more practice at same band; automaticity is the missing piece |
| >250% of median | any | Struggling / disengaged | `band −= 1`; offer a hint proactively; shorten remaining segment |
| >400% of median | any | Abandoned or distracted | Pause activity; offer break or switch; do not score |

The 150–250% row is the one most systems get wrong: they promote on accuracy alone and the
learner's fluency never develops. Slow-and-correct means *keep practising at this difficulty*.

### 3. Pronunciation — *ASR phoneme scores*

| Condition | Action |
|---|---|
| Phoneme accuracy ≥0.85 | Continue; advance to longer utterance |
| Specific phoneme <0.6 across ≥5 occurrences | Register error pattern; insert minimal-pair discrimination (perception before production) then targeted production drill |
| Same phoneme error persists after 3 remediation cycles | Check L1-interference table; if known pattern, switch to contrastive L1-aware instruction; if not, flag for human/teacher review |
| Word stress error ≥40% on multi-syllable words | Insert syllable-stress micro skill from Level 2.2 (diagnostic drop-down, visible level unchanged) |
| ASR confidence <0.6 | Discard for mastery; prompt re-record; check mic/environment; never penalise |

### 4. Fluency — *rate + smoothness, speech and reading*

| Condition | Action |
|---|---|
| Rate ≥ level target, disfluencies <5% | Advance text length or reduce preparation time |
| Rate ≥ target but disfluencies >15% | Prioritise repeated-reading and rehearsal formats over new content |
| Rate <70% of target with high accuracy | Decoding/retrieval is effortful. Hold difficulty; increase repeated-exposure practice; do **not** add new vocabulary this week |
| Rate <70% and accuracy <80% | Drop band; run decoding diagnostic; suspect a foundational gap regardless of visible level |
| Long pauses before content words | Vocabulary retrieval bottleneck → shift weight to WORD strand production practice |

### 5. Vocabulary — *breadth and depth*

| Condition | Action |
|---|---|
| Receptive ≥ level target, productive <60% of receptive | **Comprehension–production gap.** Shift from recognition to production formats: use-in-sentence, speaking with target words, cloze without a bank |
| New-word retention <50% at 7 days | Reduce new words per session by 40%; increase spaced encounters per word from 4 → 7; add morphology and mnemonic routes |
| Context-inference accuracy <60% | Insert morphological-analysis micro skills; teach the strategy explicitly rather than adding more words |
| Both receptive and productive ≥ target | Raise the word-frequency band of introduced vocabulary; add nuance/connotation work |

### 6. Grammar — *accuracy by structure*

| Condition | Action |
|---|---|
| Accuracy ≥85% in constrained items but <60% in free production | Classic **transfer gap**. Stop drilling. Move entirely to production-embedded practice with post-hoc correction |
| Specific structure <50% across ≥8 attempts | Register error pattern; re-teach the rule with contrast against the learner's actual error, not the textbook example |
| Error rate rising while text length rises | Working-memory limit, not knowledge loss. Reduce production length, keep structure; rebuild length gradually |
| ≥3 error patterns flat for >30 days | Escalate to teacher dashboard with the specific pattern list — this signals something adaptive practice alone is not fixing |

### 7. Reading — *accuracy, rate, comprehension*

| Condition | Action |
|---|---|
| Accuracy ≥97%, comprehension ≥80% | Advance text length one step, then complexity |
| Accuracy ≥97%, comprehension <70% | Decoding is fine; comprehension is the gap. Shift to inference and text-structure work; do not increase text length |
| Accuracy <95%, comprehension <70% | Decoding is consuming capacity. Drop text complexity; run phonics/morphology diagnostic; add reading-while-listening support |
| Comprehension high, rate low | Add timed and repeated reading; keep complexity fixed |
| Literal ≥85%, inferential <60% | Target `UNDERSTANDING/inference` micro skills specifically; teach evidence-citing explicitly |

### 8. Listening — *comprehension by demand type*

| Condition | Action |
|---|---|
| ≥80% at current audio length and speed | Increase length, then speed, then accent variety (in that order — never two at once) |
| Detail questions high, gist questions low | Learner is over-focusing on words. Insert prediction and global-listening tasks with no note-taking allowed |
| Gist high, detail low | Add note-taking scaffolds and structured listening grids |
| Drops sharply with unfamiliar accent | Add graded accent exposure; do not reduce other dimensions simultaneously |
| Listening ≫ reading on the same content | Confirms a print-access problem → decoding diagnostic |

### 9. Speaking — *production under demand*

| Condition | Action |
|---|---|
| Rubric ≥4/5 on content and delivery | Reduce preparation time, then increase length, then increase audience formality |
| Content strong, delivery weak | Focus prosody and delivery micro skills; keep content demand constant |
| Delivery strong, content weak | Reduce delivery demand; strengthen planning and idea-generation (THINKING pillar) before speaking |
| Utterance length well below level target | Scaffold with sentence frames and a visible plan; expand incrementally rather than demanding length |
| Avoidance behaviour (skips, minimal responses, low volume) | **Affect-first response.** Switch to private no-score recording; remove timer; remove visible scoring; rebuild over ≥5 sessions before re-scoring |

### 10. Writing — *rubric dimensions*

| Condition | Action |
|---|---|
| All dimensions ≥4/5 | Increase length, then genre difficulty, then reduce planning support |
| Accuracy high, organisation low | Target structure micro skills: topic sentences, transitions, paragraph planning. Do not correct grammar this cycle — one target at a time |
| Organisation high, accuracy low | Introduce a targeted editing stage against the learner's own top-3 error patterns |
| Language range below level | Pre-teach target vocabulary and structures immediately before the writing task; require their use |
| Long gaps / abandonment mid-task | Task too large. Decompose into staged sub-tasks (plan → one paragraph → extend) |

### 11. Comprehension — *inference depth*

| Condition | Action |
|---|---|
| Literal ✓ / inferential ✗ | Explicit inference instruction: "what does the text let you conclude?" with evidence-citing required |
| Inferential ✓ / evaluative ✗ | Move to THINKING-pillar criteria-based evaluation; supply evaluation frameworks |
| Cannot cite evidence for a correct answer | Guessing or intuition. Require justification on every item until justification accuracy ≥70% |
| Accurate on familiar topics only | Background-knowledge dependency. Add pre-reading knowledge activation; vary topics deliberately |

### 12. Confidence & calibration — *predicted vs. actual*

Learners are asked to predict their own accuracy on ~15% of activities.

| Condition | Action |
|---|---|
| Well calibrated (±15%) | Continue; increase learner choice and self-direction |
| Overconfident (predicts ≫ actual) | Serve items at the current band without warning; show the gap gently after; add self-check routines before submitting |
| Underconfident (predicts ≪ actual) | Serve items slightly *below* current band to build evidence of success; surface a "you got these right" summary; delay band increases briefly |
| Refuses to predict / high variance | Reduce evaluative framing; increase low-stakes practice |

### 13. Error patterns — *cross-signal, highest priority*

| Condition | Action |
|---|---|
| New pattern detected (≥3 occurrences, same code) | Register it; schedule targeted remediation within 2 sessions |
| Pattern count rising | Escalate remediation intensity; try a different instructional route (the current one is not working) |
| Pattern declining | Continue current remediation; move to spaced maintenance once <1 occurrence per 20 opportunities |
| Pattern flat after 3 distinct remediation approaches | **Stop retrying automatically.** Escalate to teacher with evidence samples. Some patterns need a human |
| ≥4 active patterns concentrated in one strand | Suspend new content in that strand; consolidate until pattern count ≤2 |

### 14. Retention & consistency — *cross-session*

| Condition | Action |
|---|---|
| Retention check passed at interval | Extend half-life (×1.9); reduce review frequency |
| Retention check failed | Halve half-life; return skill to `Developing`; re-enter active practice |
| Session gap >7 days | Insert a re-entry session: 70% review of decayed items, 30% new. Never resume mid-sequence after a long gap |
| Session gap >30 days | Run an abbreviated re-diagnostic (6 items) before resuming; decay estimates are unreliable at that range |
| Streak ≥14 days, high accuracy | Increase new-content ratio; offer stretch challenges; the learner has capacity |
| Frustration index high (retries + abandons + latency + low accuracy) | **Overrides all promotion rules.** Drop band, shorten session, switch to a strength area, end on a success |

---

## 6.4 The difficulty engine — 75 states

**15 visible levels × 5 internal bands = 75 adaptive difficulty states.**
The learner sees the level. The bands are invisible.

```
GDI (Global Difficulty Index) = (level_ordinal − 1) × 5 + band      → 1 … 75
```

### The 5 bands

| Band | Name | Scaffolding | Learner experience |
|---|---|---|---|
| **D1** | Guided | Worked example first, model answer visible, hints automatic, unlimited retries, choices reduced to 2, immediate correction | "I'm being shown how" |
| **D2** | Supported | Partial scaffold, hints on request, 3–4 choices, one retry, correction after attempt | "I'm getting help when I need it" |
| **D3** | Independent | No scaffold, hints cost a star, full choice set, no retry, feedback after submission | "I'm doing this myself" |
| **D4** | Advanced | Longer/denser input, time pressure, distractors near-miss, multi-step, no hints | "This is a real challenge" |
| **D5** | Mastery | Transfer context, unfamiliar topic, extended production, delayed feedback, self-assessment required first | "I'm proving I own this" |

### What varies per band (held level-constant)

| Parameter | D1 → D5 |
|---|---|
| Scaffold count | 3 → 0 |
| Hint availability | automatic → none |
| Distractor similarity | obvious → near-miss |
| Input length | 60% of level norm → 130% |
| Time allowance | unlimited → level norm × 0.8 |
| Response type | select → construct → extend |
| Context familiarity | taught context → novel context |
| Retries | unlimited → none |
| Feedback timing | immediate → delayed |
| Multi-step chaining | 1 step → 3+ steps |

### Band selection

```
target_band = f(elo_strand, level_floor)          # Phase 5 §5.3
adjustments:
  −1  if frustration_index > 0.7
  −1  if session is the first after a >7 day gap
  −1  if error patterns active in this strand ≥ 3
  +1  if last 5 attempts ≥ 90% accurate at low latency
  +1  if this is a retention check on a Mastered skill
  clamp to [1, 5]
```

Band changes are **capped at ±1 per activity** and at **±2 per session** — an engine that swings
wildly reads as broken to the learner and produces noisy evidence.

### Cross-level reach (the important property)

Band and level are addressed independently, so the engine can serve a **Level 2.2 micro skill at
band D3** to a learner whose visible level is 4.2 — as a diagnostic or remediation item — without
changing their level, their world, or their self-image. The item is dressed in Grade-appropriate
context (Phase 1 §1.4). This is the single mechanism that makes remediation possible for older
learners without humiliation, and it is why grade/level orthogonality is load-bearing rather than
decorative.

---

## 6.5 The Session Planner

The middle loop. Composes each 15-minute session.

### Hard constraints (evaluated in order — earlier constraints win)

1. **Retention debt first.** If retention items are due, they occupy 20–40% of the session. A
   session may never be 100% new content while items are due. *This is the enforcement of the
   spiral.*
2. **Prerequisite integrity.** No micro skill is scheduled whose HARD prerequisites are below
   `Proficient`.
3. **Pillar breadth.** Every session touches ≥3 pillars. Every rolling 5-session window touches
   all 8.
4. **Mode breadth.** Every rolling 3-session window includes ≥1 speaking and ≥1 writing activity.
   Receptive-only weeks are forbidden — they are how production silently falls behind.
5. **Interleaving.** No more than 2 consecutive activities on the same micro skill; no more than
   4 on the same domain. Blocked practice inflates within-session performance and destroys
   retention.
6. **Affect budget.** ≥60% of activities should be at `E ≈ 0.75` or easier. Sessions open and
   close on a likely success.
7. **Attention budget.** Total session length and per-activity length are capped by age group
   (§6.6).

### Selection objective

Within those constraints, pick the activity set maximising:

```
value(activity) = w₁ · learning_gain          # expected ΔP(L), highest near E ≈ 0.75
                + w₂ · retention_urgency      # how close m(t) is to falling below 0.85
                + w₃ · weakness_priority      # strand deficit vs. level target
                + w₄ · breadth_debt           # pillars/modes under-served recently
                + w₅ · engagement_fit         # topic interest, format preference, novelty
                − w₆ · fatigue_cost           # cognitive load already spent this session
                − w₇ · frustration_risk       # P(failure) × current frustration index
```

Weights are tuned per age group: `w₅` (engagement) is highest for Groups 1–2, `w₃` (weakness
targeting) highest for Groups 4–5, who tolerate and expect explicit deficit work.

---

## 6.6 The daily 15-minute experience

Age-differentiated. Same engine, different session grammar — because a 4-year-old and a
17-year-old differ in attention span, tolerance for difficulty, and what they find motivating.

### Group 1 · Pre-Primary — **10–12 minutes actual**, 4 segments

Short segments, audio-first, no reading instructions, one concept per session, a physical
movement break, ending on certain success.

| Time | Segment | Content |
|---|---|---|
| 0:00–1:30 | **Hello** | Mascot greeting, audio-only. Names one thing they did last time. Zero difficulty — pure re-entry. |
| 1:30–4:30 | **Sound Play** | 3 retrieval items on previously taught sounds/words. Band D1–D2. Touch/tap/point responses. |
| 4:30–7:30 | **New Thing** | ONE new concept, one format, heavily modelled. Adult voice models, child imitates. |
| 7:30–9:30 | **Say It** | Speaking with ASR. No visible score — only a smiling/neutral mascot reaction. Retry freely. |
| 9:30–11:30 | **Story Moment** | 90 s story, 2 comprehension taps. Passive-friendly. |
| 11:30–12:00 | **Stars** | 1–3 stars, a sticker, a "see you tomorrow". |

Constraints: no segment >3 min; no text-only instruction; max 1 new concept; max 8 total
interactions; always ends at band ≤D2.

### Group 2 · Foundation (Gr 1–3) — **15 minutes**, 6 segments

Introduces explicit practice and a visible "boss" moment. Reading and writing become real.

| Time | Segment | Content |
|---|---|---|
| 0:00–2:00 | **Warm-Up** | 2 retrieval items (retention queue). Band D2. Fast, confident start. |
| 2:00–5:00 | **Sound & Word Lab** | Phonics/vocabulary. 3–4 items. Band D2–D3. |
| 5:00–8:00 | **New Quest** | New concept: teach → model → guided practice. Band D1→D2. |
| 8:00–10:30 | **Read or Listen** | Short passage read-aloud (ASR) or listening task with 2–3 questions. Band D3. |
| 10:30–12:30 | **Speak & Write** | One speaking task OR one sentence/paragraph write. Alternates daily. |
| 12:30–14:00 | **Challenge** | 2 items at band D4. Explicitly framed as "the hard one" — optional, extra XP. |
| 14:00–15:00 | **Rewards** | Stars, XP, streak, badge progress, one specific praise line. |

Constraints: ≥1 speaking or writing every session; max 2 new concepts; ends on the reward, not on
a failure.

### Group 3 · Developing (Gr 4–7) — **15 minutes**, 5 segments

Longer segments, real texts, learner gets some choice, analytics become visible.

| Time | Segment | Content |
|---|---|---|
| 0:00–2:00 | **Recall Sprint** | 3–4 rapid retention items, timed, scored. Band D3. |
| 2:00–5:00 | **Learn** | New concept with a worked example, then 2 guided items. Band D2→D3. |
| 5:00–9:00 | **Deep Practice** | Reading or listening at full level length with inference questions. Band D3–D4. |
| 9:00–13:00 | **Produce** | Speaking (3-min talk / role-play) or writing (paragraph / short piece). Rotates on a 2-day cycle. Rubric shown after. |
| 13:00–15:00 | **Coach Debrief** | Specific feedback on one thing done well, one target. Strand radar update. Tomorrow's preview. Learner picks one of 2 topics. |

Constraints: ≥1 extended production per session; learner choice ≥1 point; feedback names a
specific micro skill, never "good job".

### Group 4 · Advanced (Gr 8–10) — **15 minutes**, 4 segments

No mascots, no confetti. Analytics-forward. Learner sees their own data and sets targets.

| Time | Segment | Content |
|---|---|---|
| 0:00–1:30 | **Diagnostic Warm** | 3 items, mixed strands, band D3–D4. Framed as calibration, not warm-up. |
| 1:30–4:30 | **Concept / Craft** | Targeted skill work on the current weakest competency. Explicit, adult-toned instruction. Band D3. |
| 4:30–9:30 | **Applied Task** | Extended reading with critical questions, argument reconstruction, or rhetorical analysis. Band D4. |
| 9:30–13:30 | **Performance** | Speaking (debate turn / presentation segment / impromptu) or writing (essay paragraph / register transformation). Full rubric returned. |
| 13:30–15:00 | **Analytics** | Strand radar, delta since last week, mastery % to next gate, named target for tomorrow. Learner may override tomorrow's focus. |

Constraints: rubric transparency mandatory — learners at this level disengage from opaque
scoring; ≥1 performance task per session; learner may override the planner's focus once per day.

### Group 5 · Senior (Gr 11–12) — **15 minutes**, 3 segments

Fewest, longest segments. Professional framing. Near-full learner autonomy over focus.

| Time | Segment | Content |
|---|---|---|
| 0:00–1:00 | **Brief** | Today's objective, why it was selected, what it feeds. One screen. |
| 1:00–9:00 | **Deep Work** | One substantial task: multi-source reading, discourse analysis, academic paraphrase set, or professional document analysis. Band D4–D5. |
| 9:00–13:30 | **Performance** | Extended speaking (10-min presentation segment, negotiation simulation, expert Q&A) or writing (essay section, professional document). Detailed rubric + span annotations. |
| 13:30–15:00 | **Review & Direct** | Rubric walkthrough, portfolio progress, self-assessment calibration check. **Learner selects tomorrow's focus** from a ranked list of their own deficits. |

Constraints: self-assessment required *before* seeing the score (calibration evidence); learner
selects focus by default and the planner only advises; sessions may extend to 25 min by learner
choice — Group 5 learners working toward board exams and portfolios routinely want more, and
capping them at 15 minutes is an artificial constraint.

### Cross-group session rules

| Rule | Value |
|---|---|
| Sequence is never identical two days running | Enforced by the interleaving constraint |
| Ends on likely success | Final activity `E ≥ 0.8` for Groups 1–3 |
| Re-entry after a gap | >7 days → 70% review; >30 days → abbreviated re-diagnostic |
| Frustration abort | Frustration index >0.85 → session ends early on a strength item, full credit given |
| Streak protection | One "rest day" per week does not break a streak (Groups 1–3), reducing the anxiety that streaks otherwise create |

---

## 6.7 AI content generation — three tiers

### Tier A — Curated Curriculum (human-authored)

The canonical teaching of every concept. Expert-designed, reviewed, versioned. Covers all ~1,200
concepts at every level where they are realised. **AI cannot create, modify, reorder, or retire
Tier A.**

Volume target: ~4,500 curated lessons at full build-out (one per concept-level realisation).
This is the platform's spine and the thing schools are actually buying.

### Tier B — AI Content Variations

AI generates alternative content for an **approved** learning outcome: new passages on the same
structure, new word sets in the same frequency band, new sentence sets exercising the same
transformation, new topics for the same speaking task.

Bounded strictly:
- must reference an existing `(concept, level, microSkill, learningOutcome)` address
- may not introduce vocabulary above the level's frequency ceiling
- may not introduce structures above the level's complexity ceiling
- may not alter the learning outcome or its criterion
- passes all 7 validation gates ([Phase 9](09_AUTHORING_GOVERNANCE.md))
- pre-generated in batch, cached, sampled by human reviewers

This tier carries most of the *volume*: ~50–200 variations per learning outcome, which is what
makes practice non-repetitive across a 12-week level dwell without 200× the authoring cost.

### Tier C — Personalized AI Challenges

Generated for one learner's specific weakness profile. The only tier that may be produced live.

```jsonc
// Generation request — every field mandatory
{
  "learnerId": "...",
  "ageGroup": "GR_4_7",
  "grade": 6,                             // context selection
  "level": "3.2",                         // difficulty ceiling
  "band": 3,                              // scaffolding level
  "pillar": "SENTENCE",
  "domain": "syntax",
  "competency": "wl:SENTENCE/syntax/clause-combining@3.2",
  "microSkill": "reduce-relative-to-participial",
  "concept": "concept:syn.participial-phrase",
  "learningOutcome": "LO-2",
  "prerequisitesVerified": ["concept:syn.relative-clause"],
  "targetErrorPatterns": ["COMMA_SPLICE", "DANGLING_MODIFIER"],
  "vocabularyCeiling": 7000,
  "maxSentenceLength": 18,
  "maxClauseDepth": 3,
  "learnerInterests": ["football", "space"],
  "avoidContent": [...],                  // recently seen items
  "format": "sentence-combine",
  "itemCount": 4
}
```

The model receives the full curriculum address and hard linguistic constraints. It cannot invent
progression because it is never asked what comes next — only asked to instantiate a node that
already exists. **This is the entire safety argument for AI content in WizLingo:** the model is a
renderer, never a planner.

### Cost & latency management

| Path | Share of traffic | Latency | Source |
|---|---|---|---|
| Curated (Tier A) | ~35% | <50 ms | database |
| Cached variation (Tier B) | ~50% | <50 ms | pre-generated pool, batch-refilled nightly |
| Nightly personalised (Tier C batch) | ~8% | <50 ms at serve | generated overnight from the day's DNA deltas |
| Live generation (Tier C live) | ~7% | 1–3 s | model call, only for genuine novelty |

Target: **<8% of served activities require a live model call.** Live generation is masked behind
a loading transition and is never on the critical path of a session's first activity.
