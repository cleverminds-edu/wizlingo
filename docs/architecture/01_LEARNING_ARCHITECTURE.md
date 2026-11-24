# PHASE 1 — WizLingo Learning Architecture

---

## 1.1 System layers

WizLingo is seven layers. Each layer may only call downward. This is what allows the
curriculum to grow to millions of nodes without restructuring anything above it.

```
┌────────────────────────────────────────────────────────────────┐
│ L7  EXPERIENCE LAYER                                            │
│     World map, quests, XP, streaks, avatars, age-tuned skins    │
│     Knows nothing about pedagogy. Renders whatever L6 selects.  │
├────────────────────────────────────────────────────────────────┤
│ L6  ORCHESTRATION LAYER   ← "the coach"                         │
│     Session Planner · Next-Best-Activity selector · Pacing      │
│     Answers: what are the next 15 minutes made of?              │
├────────────────────────────────────────────────────────────────┤
│ L5  INFERENCE LAYER                                             │
│     Language DNA · Mastery Engine (BKT) · Ability Engine (Elo)  │
│     Retention model · Error-pattern classifier · Affect monitor │
├────────────────────────────────────────────────────────────────┤
│ L4  EVIDENCE LAYER                                              │
│     Attempts · Scored responses · ASR output · Writing rubrics  │
│     Immutable, append-only. The system's memory of the learner. │
├────────────────────────────────────────────────────────────────┤
│ L3  DELIVERY LAYER                                              │
│     Activity renderers, ASR/TTS, item bank, media CDN           │
├────────────────────────────────────────────────────────────────┤
│ L2  CONTENT LAYER                                               │
│     Curated lessons · AI variations · Personalized challenges   │
│     Every item is addressed to exactly one Concept node.        │
├────────────────────────────────────────────────────────────────┤
│ L1  CURRICULUM LAYER   ← human-authored, versioned, immutable   │
│     The 14-entity hierarchy. Prerequisite DAG. Mastery rules.   │
└────────────────────────────────────────────────────────────────┘
```

### Why this split matters

The failure mode of every edtech platform is **L1 and L2 fusing**: the curriculum becomes
"the set of lessons we have." Once fused, you cannot add content without renegotiating
sequence, you cannot let AI generate anything safely, and you cannot reason about mastery
because mastery is defined by which lessons exist.

WizLingo keeps them separate by making L1 a **graph of claims about language** and L2 a
**pool of evidence-gathering instruments** that point at that graph. Deleting every lesson in
the platform would leave the curriculum intact. That is the test.

---

## 1.2 The three loops

The system runs three nested control loops at different time constants.

| Loop | Period | Owner | Decides | Mechanism |
|---|---|---|---|---|
| **Inner** | Per activity (~20–90 s) | Difficulty Engine | Next item's difficulty band, scaffold level, hint release | Elo update + slip/guess-aware BKT posterior |
| **Middle** | Per session (daily) | Session Planner | The 15-minute composition: which pillars, which micro-skills, review vs. new | Retention decay + weakest-link + interleaving policy |
| **Outer** | Per 2–6 weeks | Progression Engine | Visible mastery level up/down, level assessment trigger | Aggregate strand mastery + breadth coverage + stability |

The learner perceives only the outer loop ("I levelled up"). The inner loop is invisible by
design — if a learner can feel the difficulty adjusting, it reads as the system doubting them.

---

## 1.3 The curriculum hierarchy (14 entities)

```
AGE GROUP  ──┐
GRADE      ──┼─→  ENVIRONMENT  (context, theme, register, visual skin)
             │
MASTERY LEVEL ─→  DIFFICULTY   (linguistic complexity)
      ↓
    PILLAR
      ↓
    DOMAIN
      ↓
  COMPETENCY
      ↓
  MICRO SKILL
      ↓
   CONCEPT  ←──────── the atomic unit of the prerequisite DAG
      ↓
LEARNING OUTCOME
      ↓
   CONTENT
      ↓
   LESSON
      ↓
  ACTIVITY
      ↓
 ASSESSMENT
      ↓
   MASTERY
```

### Entity definitions

Each definition states: what it *is*, its **cardinality**, its **identity rule** (what makes two
instances different), and whether it is **human-authored** or **derived**.

---

**1. AGE GROUP** — *authored, fixed*
A developmental band sharing cognitive capacity, attention span, motivational drivers, and
socially acceptable presentation. Determines session length, UI density, reward style, and
error-feedback tone.
Cardinality: exactly **5**. `PREPRIMARY | GR_1_3 | GR_4_7 | GR_8_10 | GR_11_12`
Identity: fixed enum. Never extended without a product decision.

**2. GRADE** — *authored, fixed*
The learner's school class. Selects **context, not difficulty**: themes, topic domains,
register, named entities, and what a learner is assumed to already know about the *world*
(not about language).
Cardinality: **15** (Nursery, LKG, UKG, 1–12).
Identity: grade code. Belongs to exactly one Age Group.

**3. MASTERY LEVEL** — *authored, fixed*
A visible rung on the language ladder, determined by diagnostic assessment and evidence —
never by grade. Defines vocabulary ceiling, syntactic complexity, text length, and cognitive
demand.
Cardinality: exactly **15** (5 groups × 3). Addressed as `G.L` (e.g. `3.2`).
Identity: `(group, ordinal)`.

**4. PILLAR** — *authored, fixed*
One of the eight organising strands of language capability. A pillar is a **lens**, not a
syllabus section: the same lesson usually generates evidence for 2–4 pillars.
Cardinality: exactly **8**. `SOUND | WORD | SENTENCE | UNDERSTANDING | EXPRESSION | COMMUNICATION | THINKING | MASTERY`
Identity: fixed enum. **Every one of the 15 levels contains all 8.**

**5. DOMAIN** — *authored*
A coherent sub-area within a pillar, stable across all 15 levels. Domains are the vertical
"rails" of the spiral: the same domain reappears at every level with rising demand.
Cardinality: **3–5 per pillar**, ~32 total.
Example: `SOUND → { Phonemic Awareness, Phonics & Decoding, Pronunciation, Prosody }`
Identity: `(pillar, slug)`.

**6. COMPETENCY** — *authored*
A meaningful, assessable capability a learner either has or does not have, phrased as
observable performance. Level-scoped: the same competency slug exists at multiple levels with
different criteria.
Cardinality: **2–4 per (domain, level)**, ~1,400 total across the system.
Example: `SOUND / Phonics & Decoding / Level 2.2 → "Decodes two-syllable words with common vowel teams"`
Identity: `(domain, level, slug)`.

**7. MICRO SKILL** — *authored*
The smallest **teachable** unit — the grain at which the AI reasons about strength and
weakness. Must be practisable in under 90 seconds and independently assessable.
Cardinality: **3–8 per competency**, ~7,000 total.
Example: `"Decodes /ea/ as long-e in medial position"`
Identity: `(competency, slug)`. **This is the resolution of Language DNA.**

**8. CONCEPT** — *authored*
The **node of the prerequisite DAG** and the unit of curriculum versioning. A concept is a
level-independent claim about language ("synonyms exist and are context-sensitive"); micro
skills are the level-specific ways of exercising it.
Cardinality: ~**1,200** concepts, each realised across 3–15 levels.
Identity: global slug, e.g. `lex.synonymy`.
Critical distinction: **Micro Skill is per-level; Concept is cross-level.** The spiral is
implemented as *one concept, many micro skills across many levels*. This is the mechanism by
which nothing is "taught once and forgotten."

**9. LEARNING OUTCOME** — *authored*
A single testable statement in `Given / When / Then` form that binds a micro skill to
observable evidence, plus its acceptance threshold. This is the contract the assessment must
satisfy.
Cardinality: **1–3 per micro skill**.
Example: `Given 8 spoken CVC words, when asked to isolate the medial vowel, then ≥7/8 correct within 4 s median.`

**10. CONTENT** — *authored or AI-generated*
A raw, reusable linguistic asset with no pedagogical intent of its own: a passage, an audio
clip, a word list, an image, a video, a prompt stem. Contents are shared freely across
lessons and levels.
Cardinality: unbounded. This is the only layer AI is allowed to write into at volume.
Identity: content hash + provenance record.

**11. LESSON** — *authored (curated) or assembled (adaptive)*
An ordered arrangement of activities pursuing 1–3 learning outcomes, with a teaching moment
(explicit instruction) at its head. Two kinds:
- **Curated** — expert-designed, versioned, the canonical teaching of a concept.
- **Assembled** — generated per learner at request time by the Session Planner from an
  activity pool. Has no persistent identity; only its attempts are stored.

**12. ACTIVITY** — *authored (as template) + instantiated (per learner)*
A single interaction that produces exactly one scoreable Attempt. An `ActivityTemplate`
declares its format, the micro skill it targets, its difficulty band, its scaffolds, and its
scoring rubric. An `Activity` is a template bound to specific Content for a specific learner.
Cardinality: ~**60 formats** × content = unbounded instances.

**13. ASSESSMENT** — *derived*
A scoring judgement over one or more Attempts, carrying a confidence value. Assessment is
**mostly invisible**: ~85% of all evidence comes from ordinary practice activities, not from
tests. Seven explicit assessment types exist (Phase 5) but six of them are embedded.

**14. MASTERY** — *derived, never authored*
The inferred state of a (learner, micro skill) pair on the 5-point scale
`Introduced → Practicing → Developing → Proficient → Mastered`, with a posterior probability,
an evidence ledger, and a decay-adjusted current estimate.
Cardinality: learners × micro skills touched. **Nothing in the system may write Mastery
directly; it is only ever recomputed from the Evidence Layer.**

---

## 1.4 Orthogonality: the (Grade × Level) matrix

This is the architectural claim that most distinguishes WizLingo. Grade and Level vary
independently, and the two axes control different generation parameters:

| | **Grade controls** | **Mastery Level controls** |
|---|---|---|
| Topic | school bus, cricket team, career choice | — |
| Named entities | age-appropriate characters | — |
| Register & tone | playful → peer → professional | — |
| Reward style | stickers → streaks → analytics | — |
| Visual skin | cartoon → flat-illustrative → editorial | — |
| Vocabulary ceiling | — | 300 → 24,000 words |
| Sentence complexity | — | 3-word → multi-clause subordination |
| Text length | — | 1 word → 1,200 words |
| Cognitive demand | — | recall → evaluate → create |
| Scaffold density | — | continuous → none |
| Independence | — | fully guided → self-directed |

A concrete consequence: **a Grade 9 learner at Level 2.3** receives a passage about
inter-school football selection (Grade 9 context, peer register, no cartoons) written with
Level 2.3 vocabulary and sentence length. The learner is never made to feel like a child, and
never made to fail. The alternative — putting that learner in Grade-2 content — is the single
biggest cause of disengagement in remedial language software, and it is designed out here.

Generation constraint: `Activity = f(grade_env, level_difficulty, micro_skill, learner_DNA)`.
All four arguments are mandatory. See [Phase 9](09_AUTHORING_GOVERNANCE.md).

---

## 1.5 Where the AI sits

The AI is **not** a feature bolted to the side. It occupies L5 and L6 entirely, and is
*banned* from L1.

| Layer | AI role | AI authority |
|---|---|---|
| L1 Curriculum | none | **Read-only. Absolute.** |
| L2 Content | generates variations & challenges | Write, behind 7 validation gates |
| L3 Delivery | ASR scoring, writing rubric scoring | Score, with confidence bounds |
| L4 Evidence | error-pattern classification | Annotate |
| L5 Inference | owns Language DNA, mastery posteriors | **Full authority** |
| L6 Orchestration | owns next-best-activity selection | **Full authority, within curriculum DAG constraints** |
| L7 Experience | tone of feedback copy | Write, behind safety gate |

The one-sentence governance rule:

> **AI decides what to practise and how hard. Humans decide what exists and in what order.**

---

## 1.6 Scale posture

| Concern | Design response |
|---|---|
| Millions of learners | Language DNA is a bounded-size row (~13 strands + ~7k sparse micro-skill records); all inference is O(1) per attempt. No cross-learner joins on the hot path. |
| Curriculum growth | Adding concepts adds DAG nodes. No level, pillar, or schema change required. The 15 levels and 8 pillars are *fixed axes*; growth happens in Domain→Concept, which is unbounded. |
| Content growth | Content is addressed by curriculum coordinate, so new content is discoverable by the planner the moment it is approved. No re-sequencing. |
| Curriculum revision | Concepts are versioned; learner mastery records pin the version they were earned against. Revising a concept never invalidates prior progress ([Phase 9](09_AUTHORING_GOVERNANCE.md)). |
| Cost of AI | 3-tier generation: pre-generated cache (majority of traffic) → nightly batch personalisation → live generation only for true novelty. Target: <8% of activities require a live model call. |
| New language (Hindi, etc.) | Pillars, levels, difficulty bands, mastery engine, and game layer are language-agnostic. Only Domain→Concept content and the SOUND pillar's phoneme inventory are language-specific. |
