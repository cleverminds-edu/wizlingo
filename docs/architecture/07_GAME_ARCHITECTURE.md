# PHASE 7 — Game & Journey Architecture

The learner never sees the curriculum. They see a journey. Every game entity maps 1:1 onto a
curriculum entity, which is what allows the surface to be playful while the substrate stays
rigorous.

---

## 7.1 The mapping

This table is the whole design. Nothing in the game layer exists without a curriculum referent,
and nothing in the curriculum is unreachable through the game layer.

| Game entity | Curriculum entity | Count | What the learner sees |
|---|---|---|---|
| **WORLD** | Age Group | 5 | A themed region on the map with its own art, music, and mascot/host |
| **LEVEL** | Mastery Level | 15 (3 per world) | A zone within the world, unlocked in sequence |
| **JOURNEY** | Pillar @ Level | 120 (8 per level) | A path through the zone — "The Sound Trail", "The Meaning Bridge" |
| **QUEST** | Competency | ~1,400 | A named objective on the path, 3–8 challenges long |
| **CHALLENGE** | Activity (targeting a Micro Skill) | ~7,000 micro skills × formats | A single interaction |
| **MASTERY** | Mastery state | derived | A sealed quest, a lit-up node, a badge |

```
WORLD  Meaning Realms  (Age Group: GR_4_7)
 └── LEVEL  3.2 Story Weaver  (Mastery Level 3.2)
      ├── JOURNEY  The Sound Trail        (Pillar: SOUND @ 3.2)
      ├── JOURNEY  The Word Foundry       (Pillar: WORD @ 3.2)
      ├── JOURNEY  The Sentence Workshop  (Pillar: SENTENCE @ 3.2)
      │    ├── QUEST  Join the Clauses    (Competency: clause-combining@3.2)
      │    │    ├── CHALLENGE  combine with a relative pronoun   (micro skill)
      │    │    ├── CHALLENGE  reduce to a participial phrase    (micro skill)
      │    │    ├── CHALLENGE  embed without ambiguity           (micro skill)
      │    │    └── MASTERY GATE  → seals the quest, awards a skill badge
      │    └── QUEST  Shape the Sentence  (Competency: sentence-style@3.2)
      ├── JOURNEY  The Meaning Bridge     (Pillar: UNDERSTANDING @ 3.2)
      ├── JOURNEY  The Expression Stage   (Pillar: EXPRESSION @ 3.2)
      ├── JOURNEY  The Speaker's Circle   (Pillar: COMMUNICATION @ 3.2)
      ├── JOURNEY  The Thinker's Path     (Pillar: THINKING @ 3.2)
      └── JOURNEY  The Proving Ground     (Pillar: MASTERY @ 3.2)
```

### Journey names by pillar

Stable across all 15 levels so learners build a mental model, but re-skinned per world.

| Pillar | Groups 1–2 | Groups 3–4 | Group 5 |
|---|---|---|---|
| SOUND | The Sound Trail | The Sound Trail | Voice & Articulation |
| WORD | The Word Forge | The Word Foundry | Lexical Precision |
| SENTENCE | The Sentence Builder | The Sentence Workshop | Syntax & Style |
| UNDERSTANDING | The Meaning Path | The Meaning Bridge | Critical Reading |
| EXPRESSION | The Telling Place | The Expression Stage | Composition & Delivery |
| COMMUNICATION | The Talking Circle | The Speaker's Circle | Professional Communication |
| THINKING | The Puzzle Path | The Thinker's Path | Reasoning & Analysis |
| MASTERY | The Proving Ground | The Proving Ground | Mastery & Transfer |

---

## 7.2 Progression mechanics

### Non-linear within a level, linear across levels

Within a level, all 8 journeys are open simultaneously. The learner *appears* to choose where to
go; in practice the Session Planner ranks the next quests and surfaces 2–3 recommended entry
points prominently while leaving the others reachable. This produces genuine agency (Groups 3–5
care about this a great deal) without letting a learner spend twelve weeks avoiding speaking.

The **breadth constraint** (Phase 6 §6.5) is what prevents avoidance: if a journey has been
neglected, its quests rise in the ranking and its activities are inserted into sessions
regardless of learner selection. Avoidance is visible to the engine as `breadth_debt`.

### Quests seal, they don't just complete

A quest shows one of four states:

| State | Visual | Meaning |
|---|---|---|
| Locked | grey, chain icon | HARD prerequisites unmet |
| Open | lit, pulsing | available now |
| Cleared | filled, but hollow centre | all challenges done, mastery not yet proven |
| **Sealed** | filled, glowing, badge attached | `Mastered` — including the delayed retention gate |

**The gap between Cleared and Sealed is the honest part of the game.** A learner finishes the
challenges and gets "Cleared" — real, satisfying, rewarded. Days later, having passed a delayed
retention check they did not know was a check, the quest seals with a distinct animation and a
badge. This teaches the learner, experientially, that WizLingo rewards *keeping* skills, not
touching them. It is the game-layer expression of Phase 5's mastery gates.

### Level completion

When level-up conditions are met, the **Gate Challenge** appears as a landmark on the map (a
bridge, a summit, a gate). Passing it:
- seals the level, awarding a Level Crest
- unlocks the next zone with a map-reveal animation
- for level 3 of a world, unlocks the next **World** with a full transition sequence

---

## 7.3 XP

XP measures **effort and engagement**, deliberately not mastery. Mastery has its own currency
(stars and badges). Separating them prevents the most corrosive gamification failure: learners
grinding easy content for points.

```
XP = base(format) × band_multiplier × quality_multiplier × first_time_bonus
```

| Term | Value |
|---|---|
| `base` | 5 (recognition) · 10 (constructed) · 20 (speaking) · 30 (extended writing) |
| `band_multiplier` | D1 ×0.6 · D2 ×0.8 · D3 ×1.0 · D4 ×1.3 · D5 ×1.6 |
| `quality_multiplier` | 0.5 (incorrect, genuine attempt) · 1.0 (correct) · 1.2 (correct, no hints, fast) |
| `first_time_bonus` | ×1.5 on first encounter with a micro skill |

Deliberate properties:
- **A genuine wrong answer still earns XP** (0.5×). Effort is rewarded; the learner is never
  punished for attempting hard things. This is what keeps learners willing to sit at band D4.
- **Repeating easy content earns almost nothing.** D1 recognition already-seen = 5 × 0.6 = 3 XP.
  Grinding is not viable.
- **Flagged `low_effort` attempts earn 0 XP.** Rapid guessing pays nothing.
- **Daily XP soft cap** at ~3× a typical session, so binge sessions don't distort streak/league
  fairness and don't encourage unhealthy use for young learners.

XP drives: learner level (a cosmetic "Rank" number, separate from mastery level), unlockables,
and league placement.

---

## 7.4 Stars

Stars measure **mastery** and are awarded per quest, not per activity.

| Stars | Criterion |
|---|---|
| ★ | Quest cleared — all challenges attempted and passed |
| ★★ | All micro skills at `Proficient` |
| ★★★ | Quest **sealed** — all micro skills `Mastered`, retention gate passed |

Third stars can therefore only arrive with time elapsed. A learner cannot three-star a quest on
the day they open it, no matter how well they perform. Stars are the visible face of the decay
model.

Stars are the currency for level-up eligibility display ("32/48 stars to the Gate") and are what
schools see on progress reports.

---

## 7.5 Badges

Four tiers, extending the existing WizLingo badge line rather than replacing it.

### Tier 1 — Skill Badges (~1,400, one per competency)

Awarded on quest seal. Named after the capability, illustrated per pillar.
Examples: *Clause Joiner* (3.2 syntax), *Shade Reader* (2.3 vocab-depth), *Fallacy Hunter* (3.3
reasoning), *Sound Splitter* (1.3 phonemic awareness).

### Tier 2 — Journey Badges (120, one per pillar per level)

Awarded when all quests in a journey are sealed. Three ranks by completion quality:
Bronze (all cleared) · Silver (all proficient) · Gold (all sealed).

### Tier 3 — Level Crests (15)

One per mastery level, awarded on Gate Challenge pass. Carries the level's rank name — a learner
who passes Level 3.2 holds the **Story Weaver** crest. These are the credential-grade badges that
appear on school reports and parent emails.

### Tier 4 — Wizard Titles (the existing line, now the apex)

| Title | Earned by |
|---|---|
| **Word Wizard** | Gold Journey Badge on WORD at ≥3 consecutive levels |
| **Voice Wizard** | Gold Journey Badges on SOUND + EXPRESSION + COMMUNICATION at the same level |
| **Story Wizard** | Gold on UNDERSTANDING + EXPRESSION + THINKING at the same level |
| **Mind Wizard** | Gold on THINKING at ≥3 consecutive levels |
| **LANGUAGE WIZARD** | Level 5.3 mastery criteria, including mandatory human review of the capstone portfolio |

**Language Wizard is the terminal status of the entire platform** and is deliberately hard: it
requires all 13 strands ≥4.5/5 with none below 4.0, a capstone portfolio, verified transfer to
two unfamiliar domains, 90 days of stability, and a taught explanation judged by human reviewers.
No AI-only path exists to it. That constraint is what will make it worth putting on a CV.

### Cross-cutting badges (~40)

Behaviour and habit, not skill: *Consistent* (14-day streak), *Brave* (20 D4+ attempts),
*Honest Critic* (calibration within ±10% for 20 predictions), *Returner* (came back after a
30-day gap — deliberately celebrated), *Teacher* (helped a peer), *Deep Diver* (a single 25-min
self-extended session).

---

## 7.6 Streaks, daily quests, weekly challenges

### Streaks

A day counts when the learner completes a session containing **≥1 activity at band ≥D3**. This
prevents the streak from being maintained by trivial tapping.

Protections, because streak anxiety is a real harm with children:
- **Rest day:** 1 missed day per 7 does not break a streak (Groups 1–3 only).
- **Streak freeze:** earnable with XP, up to 2 held.
- **Repair:** a broken streak of ≥7 days can be restored once by completing a double session
  within 48 hours.
- Streak loss is never framed as failure. Copy: "Let's start a new one" — never "you lost".

### Daily Quests (3 per day)

Generated by the Session Planner and framed as objectives the learner chooses to accept:

1. **Core Quest** — the day's planned 15-minute session. Full XP.
2. **Skill Quest** — 2–3 minutes targeting the current weakest micro skill. Bonus XP. Framed as
   "sharpen something", never "fix your weakness".
3. **Spark Quest** — a short, high-interest, low-stakes activity using the learner's declared
   interests. Exists for engagement, and its content is chosen for enjoyment first.

### Weekly Challenges

One per week, 5 minutes, doubling as the Weekly Assessment (Phase 5 §5.6 type 5). Composition:
40% retention items, 40% consolidation, 20% stretch. Rewards a Weekly Crest and league points.
Learners experience an assessment as the week's headline event — which is exactly the framing
inversion the architecture is aiming for.

### Mastery Milestones

Celebration moments tied to real evidence, not arbitrary counts:
first sealed quest · first Gold journey · 10 sealed quests · a Level Crest · a Wizard Title ·
first retention check passed at 60+ days (framed as "you still had it") · World completion.

---

## 7.7 Age-appropriate evolution of the game layer

**This is the requirement most gamified platforms fail.** A Grade 10 learner shown a dancing
cartoon owl will disengage permanently, and no amount of pedagogical quality will recover them.
The motivational architecture must mature with the learner.

| | **Groups 1–2** (Nursery–Gr 3) | **Group 3** (Gr 4–7) | **Group 4** (Gr 8–10) | **Group 5** (Gr 11–12) |
|---|---|---|---|---|
| **Visual language** | Cartoon, saturated, rounded, mascot-led | Flat-illustrative, adventure map, stylised characters | Editorial, dark-mode default, geometric, no characters | Minimal, typographic, professional dashboard |
| **Metaphor** | Playground / friendly creatures | Expedition / world map | Training & performance analytics | Portfolio & professional development |
| **Host/guide** | Animated mascot with voice | Stylised guide, text + occasional voice | AI coach — text only, peer-adult tone | AI advisor — concise, analytical, no persona |
| **Primary motivator** | Immediate delight, collection | Progress, discovery, unlocking | Competence, measurable improvement, autonomy | Mastery, credential, real-world outcome |
| **Reward feel** | Stickers, sounds, confetti, animations | Stars, badges, map reveals, chests | Skill radars, percentile deltas, credential badges | Portfolio artefacts, CEFR/exam readiness, certificates |
| **Feedback tone** | "You did it!" | "Nice — that inference was strong." | "Organisation improved 12% this week. Accuracy is now the limiter." | "This paragraph would not survive peer review. Here's why." |
| **Failure framing** | Invisible; retry immediately | "Not yet — try the hint" | "Missed 3/5. Pattern: dangling modifiers." | Full diagnostic, no softening |
| **Social layer** | None | Class leaderboard (opt-in), avatar showcase | Cohort percentiles, age-band leaderboards, team debates | Peer review, published portfolio, mentoring juniors |
| **Sound design** | Musical, celebratory | Ambient, thematic | Minimal, tactile clicks | Silent by default |
| **Streaks** | Prominent, protected | Prominent | Present, understated | Optional, off by default |
| **Explicit analytics** | None shown to learner | Simple strand bars | Full strand radar, trends, gate progress | Complete data access, exportable, self-directed |

### The transition at Level 4.1

The shift from Group 3 to Group 4 presentation is the sharpest in the product and is handled as
a deliberate rite of passage rather than a silent restyle: on entering Level 4.1 the learner is
shown a "the training gets serious" transition, the interface changes visibly, and the mascot is
retired with an explicit send-off. Learners are told they have graduated out of it. Framing the
loss of the childish layer as a promotion converts what could feel like a downgrade into a
status gain.

### Terminology shifts with age

| Concept | Groups 1–3 | Groups 4–5 |
|---|---|---|
| Challenge | "challenge" | "task" |
| Quest | "quest" | "module" |
| Journey | "trail / path" | "strand" |
| Gate Challenge | "the big gate" | "level assessment" |
| Weakest skill | "something to sharpen" | "current limiter" |
| Stars | "stars" | "mastery rating" |

Same entities, same database rows, different labels resolved at render time from the learner's
age group. The game layer is a presentation concern, exactly as Phase 1 §1.1 requires.

---

## 7.8 Unlockables & the economy

Unlockables must never gate learning. Everything cosmetic; nothing pedagogical behind a reward
wall.

| Unlockable | Cost | Ages |
|---|---|---|
| Avatar items, mascot outfits | XP | 1–3 |
| Map themes, world skins | XP | all |
| Story/library content (extra reading, no assessment) | Stars | all |
| Interest packs (football, space, mythology topic sets) | XP | all |
| Streak freezes | XP | all |
| Dashboard themes, dark-mode variants | XP | 4–5 |
| Certificate templates for portfolio export | Level Crests | 4–5 |
| "Challenge a friend" debate/quiz rooms | Stars | 3–5 |

Anti-pattern explicitly avoided: **no lives, no hearts, no energy meters, no pay-to-continue.**
Those mechanics work by manufacturing frustration and then selling relief. In a school product
sold to parents and institutions on learning outcomes, they are both ethically wrong and
commercially self-defeating.

---

## 7.9 Social & school layer

| Feature | Scope | Notes |
|---|---|---|
| Class leaderboard | Within class, opt-in, teacher-toggled | Ranked by **XP** (effort), never by mastery level — ranking by ability publicly shames the learners who need the platform most |
| Age-band leaderboard | Across schools, within age band | Extends the existing age-band leaderboard system |
| Team challenges | Class vs. class, weekly | Aggregate XP — makes strong and weak learners equally valuable to their team |
| Peer review | Groups 4–5 | Structured rubric-guided review of writing; earns the *Honest Critic* badge |
| Mentoring | Group 5 → Groups 2–3 | Senior learners record explanations; feeds the Level 5.3 "teach it back" mastery evidence |
| Parent view | All | Level Crest, strand summary, streak, time-on-task. **Never raw scores or class rank.** |
| Teacher view | All | Full DNA, error patterns, flags requiring human intervention, class-level pattern aggregation |

The ranking rule is load-bearing: **public rankings use XP; private reports use mastery.** Effort
is fair to rank publicly because every learner can control it. Ability is not.
