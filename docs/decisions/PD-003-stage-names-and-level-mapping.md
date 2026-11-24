# PD-003 — Stage names and mapping of today's content onto the 15 levels

| | |
|---|---|
| **Status** | Proposed (2026-11-19), for product owner and SME confirmation |
| **Builds on** | [PD-002](PD-002-five-student-stages.md) — 5 visible stages, 15 levels behind them |

## 1. Stage names: reuse the five WizLingo badges

The app already has exactly five designed, branded badges (`BadgeType` in the production schema:
`SPARK`, `WORD_WIZARD`, `VOICE_WIZARD`, `LANGUAGE_WIZARD`, `GRAND_WIZARD`). They already read as a
ladder, they match the WizLingo name, and the artwork exists. Proposal:

| Stage | Name (student sees) | What the stage is about | Internal levels | Typical grades |
|---|---|---|---|---|
| 1 | **Spark** | Sounds, letters, first words | 1.1 · 1.2 · 1.3 | Nursery–UKG |
| 2 | **Word Wizard** | Phonics, words, simple sentences | 2.1 · 2.2 · 2.3 | 1–3 |
| 3 | **Story Wizard** *(new badge)* | Reading for meaning, inference, retelling | 3.1 · 3.2 · 3.3 | 4–7 |
| 4 | **Voice Wizard** | Expressing ideas, explaining, arguing, presenting | 4.1 · 4.2 · 4.3 | 8–10 |
| 5 | **Language Wizard** | Independent, mature communication | 5.1 · 5.2 · 5.3 | 11–12 |

- **Grand Wizard** is kept as the special award for completing Stage 5. It could later also be the
  spell bee championship title.
- **Story Wizard** is the only new badge to design. Stage 3 needs its own name because it is where
  Grades 4–7 (most of the pilot) will sit.
- The names are **age-neutral**. A Grade 8 student placed in Stage 2 sees "Word Wizard", not a name
  that sounds like a nursery level.
- **Inside a stage**, students see a 3-step path, e.g. "Word Wizard · step 2 of 3". Teachers see the
  level number (2.2). Each level-up gets a celebration; each stage-up gets the badge, a certificate
  and a parent message.

**Existing badges:** today these badges mean other things (e.g. Word Wizard = "80%+ reading
accuracy", Language Wizard = "10+ sessions"). Students who already earned them keep them. For new and
school accounts, the names mean stages only. The old achievement rules are retired, and effort awards
(7-day, 14-day, 30-day streak badges) stay as they are.

## 2. How today's content maps onto the 15 levels

### What exists today (production schema, `git HEAD`)

- `ReadingPassage` and `ConversationTopic` carry a **grade band** (`BAND_1_2`, `BAND_3_5`,
  `BAND_6_8`, `BAND_9_10`) and a **performance level 1–3** inside the band. That makes 12 positions.
- The adaptive system moves students between levels 1–3 within their band (the `level < 3` cap in
  `app/api/assess/route.ts`).
- The passage generator accepts a separate `difficulty_level` of 1–20 (the old 20-level ladder).
- `content/grade-1-*.json` holds the Grade 1 set (e.g. "My Pet Cat": 30 words, A1, with literal,
  inferential and vocabulary questions).

### Starting mapping (by label)

| Today (band · level) | Internal level | Stage |
|---|---|---|
| — (no content) | 1.1 · 1.2 · 1.3 | 1 Spark |
| BAND_1_2 · 1 | 2.1 | 2 Word Wizard |
| BAND_1_2 · 2 | 2.2 | 2 Word Wizard |
| BAND_1_2 · 3 | 2.3 | 2 Word Wizard |
| BAND_3_5 · 1 | 2.3 | 2 Word Wizard |
| BAND_3_5 · 2 | 3.1 | 3 Story Wizard |
| BAND_3_5 · 3 | 3.1 | 3 Story Wizard |
| BAND_6_8 · 1 | 3.2 | 3 Story Wizard |
| BAND_6_8 · 2 | 3.3 | 3 Story Wizard |
| BAND_6_8 · 3 | 4.1 | 4 Voice Wizard |
| BAND_9_10 · 1 | 4.1 | 4 Voice Wizard |
| BAND_9_10 · 2 | 4.2 | 4 Voice Wizard |
| BAND_9_10 · 3 | 4.3 | 4 Voice Wizard |
| — (no content) | 5.1 · 5.2 · 5.3 | 5 Language Wizard |

### Then correct it by measurement, not by label

Labels from different generation runs are not consistent, so the label mapping is only a starting
point. A one-off script should measure every passage and suggest a level from its text:

| Level | Passage length | Avg. sentence length |
|---|---|---|
| 2.1 | 30–60 words | 5–7 words |
| 2.2 | 60–120 | 7–9 |
| 2.3 | 120–200 | 9–12 |
| 3.1 | 200–350 | 12–15 |
| 3.2 | 350–500 | 14–18 |
| 3.3 | 500–650 | 16–20 |
| 4.1 | 650–800 | 18–22 |
| 4.2 | 800–950 | 18–24 |
| 4.3 | 950–1,100 | 20–26 |

(Ranges come from the August level map's cross-cutting scales. They are a working reference until the
SME confirms or adjusts them.)

Where the label and the measurement disagree, the item goes to the SME review page with both
suggestions, and the SME decides. The SME's level is final.

### Gaps this reveals

- **Stage 1 and Stage 5 have no content.** That's fine for the pilot (Grades 3–8 sit in Stages 2–4),
  but it is a gap for the full product.
- **Older students placed low.** A Grade 7–8 student placed at 2.2 must get Grade-7-appropriate topics
  at 2.2 difficulty, not Grade 1 passages. Today's content ties topic to band, so the pilot needs a
  small set of "older reader, simpler text" passages for Stages 2–3. Generate them, then have the
  SME review them.

### Placing existing students

Initial stage and level = the mapping of the student's current band and level. Then the first 2–3
sessions include short placement checks that can move them up or down one level.
