# Phase 1 — Clever Minds pilot build plan

**Date:** 2026-11-19 · **Window:** pilot weeks 0–6 · **Status:** Draft for team review

**Source of truth:** the November 2026 records —
`Wizlingo_Tier_II_III_Fit_Gap_Plan.docx`,
`Wizlingo_Indian_Competitive_Analysis_and_BKT_Elo_Discussion_17_Nov_2026.docx` and
`Wizlingo_Revised_Architecture_and_Competitor_Report/`. The August 2026 files in
`docs/architecture/` (incl. `BASELINE_v1.0.md` and its 10I pilot design) are older and superseded
where they conflict.

Decisions this plan depends on:
- [PD-001](../decisions/PD-001-daily-practice-limit.md) — daily practice limit (accepted)
- [PD-002](../decisions/PD-002-five-student-stages.md) — five student-facing stages, 15 levels behind them (accepted)

Scope reminders:
- Pilot segment: **Grades 3–8**, vocabulary + reading comprehension + speaking + spelling.
- Not in Phase 1: in-module spell bee events, group discussions, parent summary in Telugu/Hindi,
  voice clips (Phase 2). Scholarship championship, graduates module and live online GD wait until
  after a successful Clever Minds pilot.
- **Clever Minds is part of the validation pilot** (Tier II/III plan §14, weeks 8–12: Clever Minds
  plus 2–3 outside schools). It validates the measures in "Validation measures" below — confidence,
  capability, adoption and economics. Keep the activity log clean: it is the evidence for the pilot
  and the data for later comparing BKT/Elo against the simple stage-up rule.
- Before writing route or page code, read the relevant guide in `node_modules/next/dist/docs/`
  (Next.js 16 — see `AGENTS.md`).

> **Schema decision (owner, 2026-11-19): the July rewrite replaces the production schema.** The
> rewrite drops production tables the app still uses and deletes the migration history, so the
> replacement is planned in [SCHEMA_REPLACEMENT_PLAN.md](SCHEMA_REPLACEMENT_PLAN.md) and runs as
> **task 1.0** before anything else. The "What already exists" table below describes the rewrite;
> production-only features (school admission number + PIN login, certificates, OTP, emails,
> referrals) are ported into it by task 1.0.

---

## What already exists (build on it, don't rebuild)

| Need | Existing code | Gap |
|---|---|---|
| Student login | `app/api/auth/*`, `lib/auth.ts`, `lib/auth-utils.ts` (cookie + token), B2C `userId` | None for login. Need school-level settings |
| School → teacher → class → student | `School`, `Teacher`, `Class`, `Enrollment` models | No school settings fields |
| Daily record per student | `DailySession` (`@@unique([studentId, date])`) | No time tracking |
| Teacher dashboard | `app/teacher/dashboard/page.tsx`, `app/api/teacher/classes`, `app/api/teacher/class/[classId]/analytics` | No weekly per-student view, no actions |
| Badges / certificates | `lib/badge-system.ts`, `Badge`, `lib/certificate-generator.ts` | No stage badges |
| Reading passages | `ReadingPassage` (`level` Int) | No vocabulary or comprehension questions attached |
| Speaking | `app/student/speaking`, `lib/speaking-score.ts`, Web Speech API | Score penalises beginners (targets 110 wpm, filler words) |
| TTS | `lib/google-tts.ts`, `/api/speaking/synthesize` | Generated on request, not pre-generated |
| Leaderboards | `lib/leaderboard-service.ts`, `lib/age-band-leaderboard.ts` | Need off-switch for school students |
| AI models | `lib/ai-feedback.ts`, `lib/ai-conversation.ts` use `claude-haiku-4-5-20251001`; `lib/content-generation/content-generator.ts` uses `claude-opus-4-8` | No prompt caching; content generated live, not in batch |
| Student audio storage | — | None. Needed for voice clips in Phase 2 |

---

## Phase 0 — prerequisites (weeks 0–2)

| # | Task | Owner | Est. | Done when |
|---|---|---|---|---|
| 0.1 | Confirm PD-002 stage names and badges; map legacy content levels (`ReadingPassage.level`, `Student.currentLevel`) onto the 15 levels / 5 stages | Curriculum lead | — | `StageDefinition` seed data agreed |
| 0.2 | Move live feedback/chat to the current cheapest suitable Haiku model; add prompt caching for the fixed system prompt + rubric. **Verify current model IDs and prices first.** | Eng | 2d | Cost per feedback call and per chat turn measured and written down |
| 0.3 | Move content generation to the Batch API; never generate learner content live | Eng | 2d | Generation script runs as a batch job |
| 0.4 | Add `leaderboardsEnabled` (school setting, default off) and hide public rankings for school students | Eng | 1d | School students see no rankings; B2C unchanged |
| 0.5 | Field interviews in 10–15 schools (incl. spell bee, GD, time-limit questions) | Product | — | Interview notes; segment confirmed |

---

## Phase 1 — tasks (weeks 2–6)

Estimates are developer-days for one developer. **Total ≈ 65 dev-days (incl. the schema
replacement and visuals) → 2 developers for about 6–7 weeks, plus a part-time designer.**

| # | Task | Depends on | Est. |
|---|---|---|---|
| 1.0 | Replace production schema with the July rewrite ([plan](SCHEMA_REPLACEMENT_PLAN.md)) | — | 12–13d |
| 1.1 | Phase 1 schema additions (see appendix), folded into 1.0's target schema | 0.1, 1.0 | 2d |
| 1.2 | Practice budget service + API | 1.1 | 3d |
| 1.3 | Student timer UX | 1.2 | 2d |
| 1.4 | Activity log (immutable) | 1.1 | 2d |
| 1.5 | Pilot content: vocabulary, comprehension questions, spelling audio | 0.3, 1.1 | 4d + review |
| 1.6 | Four daily activities | 1.4, 1.5 | 6d |
| 1.7 | Session planner | 1.2, 1.4, 1.6 | 3d |
| 1.8 | Stages, stage-up rule, badges, certificates | 0.1, 1.4 | 3d |
| 1.9 | Teacher weekly view + actions | 1.4, 1.8 | 5d |
| 1.10 | Weekly summary job + teacher email | 1.9 | 2d |
| 1.11 | Low-end device + smart board QA | all | 2d |
| 1.12 | SME review page + SME accounts | 1.1 | 5d |
| 1.13 | SME monitoring | 1.12 | 4d |
| 1.14 | Graphics and gamification visuals (core set) | 1.6, 1.8 | 7d + designer |

### 1.1 Schema migration
Additive only: new models and new optional/defaulted fields. No existing column is dropped or
renamed, so current B2C users are unaffected. Remember the Railway `postbuild` step runs
`prisma migrate deploy`. Proposed schema is in the appendix.

### 1.2 Practice budget service
`lib/practice-budget.ts` + `POST /api/practice/heartbeat`, `GET /api/practice/budget`.
- Resolve today's limit: admin range → school default → parent override (lower only) → teacher grant
  (extra minutes for the day). B2C: parent setting or default 20.
- Heartbeat every 30 s while the page is visible; server adds `min(elapsed since last beat, 45 s)` so
  a stalled tab or clock skew can't inflate or drain time.
- Heartbeat carries `context` (`SCHOOL`/`HOME`, from school Wi-Fi hours or the teacher's classroom
  mode) and `exempt` (teacher-led, competition) — exempt time is logged but not charged.
- Day boundary: midnight IST.
- Unit tests: limit resolution order, parent can't exceed school, grant adds, exempt not charged,
  heartbeat gap capped, day rollover.

### 1.3 Student timer UX
Minutes left shown on the session screen; gentle warning at 2 min; current item may finish; then
"Great work today — see you tomorrow" with what they did. Never starts an assessment/stage check that
can't finish (planner enforces; UI just respects the plan).

### 1.4 Activity log
`ActivityAttempt` — one row per answered item, never updated or deleted (no update/delete API).
Records activity type, item, correct/score, **format** (recognition vs production), duration,
context, hints used and the planner's reason code. Every activity endpoint writes to it. The teacher
view, stage rule and future engine all read from it.

### 1.5 Pilot content
- For each passage in the pilot stages: 4–6 vocabulary words (meaning, example sentence, Telugu/Hindi
  gloss) and 4–6 questions (literal, inference, word-in-context). Generated via batch, then approved
  by the SME on the SME review page (task 1.12) before release. Only `APPROVED` content is served.
- Level each passage per [PD-003](../decisions/PD-003-stage-names-and-level-mapping.md): label
  mapping first, then a measurement script; disagreements go to the SME.
- Spelling: pre-generate TTS audio for every word once; store it; serve from storage.
- Target: enough for 8 weeks of daily use per stage in use (≈ 40 passages per stage). Confirm count
  of usable existing passages first.

### 1.6 Four daily activities
- **Vocabulary review** — spaced review with simple boxes (1, 2, 4, 7, 14 days). Wrong → back to box 1.
  Formats rotate: pick meaning → use in sentence (typed) → spell it.
- **Reading + comprehension** — passage at the student's stage, then literal and inference questions.
  New vocabulary from the passage enters the review queue.
- **Speaking** — reuse the speaking page; prompt is about today's passage (retell / opinion). Change
  `lib/speaking-score.ts` for this mode: reward talk time, sentence count and turns; no wpm target or
  filler penalty for Stages 1–3.
- **Spelling round** — audio plays, student types; words from their vocabulary queue. No speech
  scoring, so near-zero cost. (Same mechanic becomes the spell bee in Phase 2.)

### 1.7 Session planner
`lib/session-planner.ts` — a pure function, fully unit-tested:
input = minutes left, stage/step, words due, recent results by activity and question type, mix
policy, class weekly focus; output = ordered list of activities with planned minutes and a reason code
(`WORDS_DUE`, `INFERENCE_WEAK`, `NEW_PASSAGE`, `SPEAKING_DUE`, `CLASS_FOCUS`, `STAGE_CHECK`, …).
Shares come from `SessionMixPolicy` (no hard-coded minutes). Re-plans when the student comes back
later the same day with fewer minutes left.

### 1.8 Stages and appreciation
- `StageDefinition` table seeded from the PD-002 table.
- Step-up rule (rule-based, per PD-002): correct in ≥ 2 formats + one delayed check ≥ 3 days later.
- On step-up: celebration screen; on stage-up: stage badge via `lib/badge-system.ts` + certificate via
  `lib/certificate-generator.ts` + parent email via the existing parent email templates.
- Rewards are for progress and effort, never for time alone.

### 1.9 Teacher weekly view
New page under `app/teacher/class/[classId]` + `GET /api/teacher/class/[classId]/weekly?week=YYYY-Www`.
- Per student: days practised, minutes (school / home), new words learned, words retained, comprehension
  (literal vs inference), speaking talk time trend, stage + step.
- Class: "not practised this week" list, "stuck" list (same weak area 2+ weeks) with one suggested
  classroom activity, class-wide weak area.
- Actions: set weekly class focus, grant extra minutes, set class default limit (within school range).
- Must load fast on a low-end phone: precomputed weekly summaries (1.10) + current week computed live.

### 1.10 Weekly summary job
Monday 06:00 IST cron (pattern: existing `app/api/cron/*`) writes `WeeklyStudentSummary` rows and
emails each teacher a one-page summary via `lib/email-service.ts`.

### 1.11 QA
Test on a ₹8–10k Android phone (2 GB RAM) on slow 4G and on a classroom smart board. Pages under
~200 KB; timer correct when the app is backgrounded; works for two siblings sharing one phone
(switch account).

### 1.12 SME review page
One place where an Edvanta subject-matter expert checks **everything** before students see it.
Replaces review by a Clever Minds teacher. Build it early (right after 1.1), because content review
(1.5) depends on it.

- **Who:** recruited by Edvanta (owner decision 2026-11-19). Page under `app/wizadmin/review`.
  Three roles on the Edvanta manager model:

  | Role | Reviews | Hire |
  |---|---|---|
  | `LEAD_SME` | Everything an English SME does, plus the 10% spot-checks, control-item setup and second review when an SME is below target | 1 |
  | `SME` (English) | Passages, words (meaning, example), questions, audio, speaking prompts, level | 1+ |
  | `LANGUAGE_REVIEWER` with a language (`te` or `hi`) | Only the Telugu or Hindi meanings and hints | 1 Telugu + 1 Hindi |

- **Nothing reaches students before final approval** (owner, 2026-11-19).
  - English content is final when the English SME has approved it.
  - Telugu/Hindi support is an **add-on** (see below). A Telugu or Hindi meaning or hint is shown only
    to students who have that add-on, and only after that language's reviewer has approved it. So
    English-medium students are never held up waiting for language review.
  - Language reviewers see the English word, meaning and example next to the field they check,
    nothing else.
- **Telugu/Hindi add-on:** English-medium students don't need it. It is for Telugu/Hindi-medium
  students and is sold to B2C families. It is switched on per school/class (medium of instruction) or
  bought as a B2C add-on, and stored as the student's support language (`none`, `te`, `hi`).
- **Accounts:** an Edvanta admin creates each SME account in wizadmin and shares the login details
  with the SME. Temporary password, forced change at first login (reuse the existing B2C
  forced-password-change flow), and the admin can deactivate it. **One account per SME, never a
  shared login.** Monitoring (1.13) only works if every action belongs to one named person.
- **Access:** SMEs see content only. No student names, phone numbers or results.
- **Review unit = a bundle:** one passage with its vocabulary words, questions, spelling audio and
  speaking prompt, reviewed together on one screen. That is much faster than reviewing item by item.
- **On the screen:**
  - passage text with measured word count and sentence length, the suggested level (label and
    measured) and an SME level picker
  - each word: meaning, example, Telugu/Hindi gloss, ▶ audio
  - each question: answer key highlighted, question type, distractors
  - inline editing of anything
- **Decision per item and per bundle:** Approve · Needs changes · Reject, with reason codes
  (wrong answer, ambiguous, not age-appropriate, level too hard/easy, gloss wrong, audio wrong,
  cultural/safety issue) and a comment.
- **Lifecycle:** `DRAFT` (generated) → `IN_REVIEW` → `APPROVED` / `NEEDS_CHANGES` / `REJECTED`. Only
  `APPROVED` is served. An edit creates a new version; history is kept (who, when, what changed).
- **Filters:** stage/level, content type, grade band, status, "label ≠ measured level", "flagged by
  users".
- **Feedback loop:** items reported by students or teachers ("this answer is wrong"), and items with
  unusual results (e.g. under 20% or over 98% correct after 30+ attempts), go back to the SME queue.
- **Bulk approve** for clean bundles, after the SME has opened them.
- **Schema:** `ContentStatus` enum plus `status`, `version`, `reviewedBy`, `reviewedAt` on each
  content model; a `ContentReview` table (item type, item id, version, decision, reason codes,
  comment, reviewer, time).
- **Workload estimate:** about 40 passage bundles per pilot level band × Stages 2–4 ≈ 120 bundles at
  10–15 min each ≈ **25–30 SME hours** before the pilot, plus about 1–2 hours a week during it.

### 1.13 SME monitoring
An admin-only page in wizadmin (`app/wizadmin/sme`) plus a weekly email scorecard per SME.

| What | Measure | Healthy |
|---|---|---|
| **Activity** | Logins, active review time, bundles reviewed per day, backlog, time from generated → decided | Backlog cleared before each content release |
| **Accuracy: spot-check audit** | The **lead SME** re-reviews a random **10%** of each English SME's approvals; agreement rate | ≥ 90% agreement |
| **Accuracy: control items** | About **5%** of the queue are planted bundles with a known mistake (wrong answer key, wrong gloss, level too hard). Catch rate | ≥ 90% caught |
| **Accuracy: after release** | Approved items later reported by students/teachers or auto-flagged by results; defects per 100 approved | ≤ 2 per 100 |
| **Rubber-stamp warning signs** | Median time per bundle under 2 min; approval rate over 98%; approving without playing the audio or opening the glosses | Any one triggers an admin review |
| **Edits** | What the SME changed and why (from version history) | — |

- Control items are flagged only in the database (`isControl`, `knownDefect`) and look like normal
  bundles to the SME. They are never served to students, whatever the SME decides.
- Records needed: an SME activity log (who, action, item, time spent, audio played, glosses opened)
  and an audit table (review id, auditor, agrees y/n, notes). `ContentReview` (1.12) supplies the
  decisions.
- If an SME's agreement or catch rate falls below target for 2 weeks running, their approvals go
  back to 100% second review by the lead SME until it recovers.
- **Language reviewers:** the lead SME probably can't judge Telugu and Hindi, so their quality is
  measured by planted control items (deliberately wrong meanings), post-release reports, and the
  rubber-stamp signals. Once a quarter, have an outside native speaker check a small sample (about
  50 meanings per language).
- **The lead SME is monitored too.** The admin sees the lead's scorecard: their own approvals are
  covered by control items and post-release defects, and their spot-check decisions are visible.
- **The lead SME's dashboard** shows each SME's scorecard and the spot-check queue. Only the admin sees
  the lead SME's scorecard.

### 1.14 Graphics and gamification visuals (owner request, 2026-11-19)
Make progress feel visible and rewarding, within the rules already agreed: rewards for progress and
effort (never time alone), no public ranking in school mode, nothing that punishes a missed day, and
pages light enough for a ₹8–10k Android phone.

**Phase 1 (core set):**
- **Stage worlds:** one illustrated scene per stage (Spark, Word Wizard, Story Wizard, Voice Wizard,
  Language Wizard) with a 3-step path showing the student's position. Age-neutral art, so a Grade 8
  student in Stage 2 doesn't see a nursery scene.
- **Story Wizard badge** in the same style as the existing five badges.
- **Celebrations:** short level-up animation; a bigger stage-up moment with badge, certificate and
  "share with family" card. Reuse `lib/particles.ts` and `lib/sound-effects.ts`.
- **Daily session screen:** a ring showing minutes left today, activity cards with icons, and an
  end-of-day card ("Today: 6 new words, 2 stories, 90 seconds of speaking").
- **Effort rewards that don't punish:** "practice days this week" (e.g. 4 of 5) instead of a streak
  that resets to zero; XP for completed activities.
- **Teacher charts:** weekly minutes per student (bar), comprehension trend literal vs inference
  (line), and how many students are in each stage (bar).

**Phase 2:**
- **Word book:** every word the student has learned, with a small illustration and audio, growing
  over time.
- **Class goals** for school mode instead of rankings: a shared class progress bar toward a goal
  (e.g. "Class 6B: 500 words this month").
- **Mascot** (e.g. a wizard owl) who greets, gives hints and celebrates.
- **Spell bee visuals:** round countdown, podium for competition events only.
- **Parent weekly card** designed to be shared on WhatsApp.

**Technical rules:** SVG and CSS animation first (small files); Lottie only where it earns its weight;
respect `prefers-reduced-motion`; every animation skippable; total page weight under ~200 KB
excluding cached art.

**Needs:** a designer/illustrator for the 5 stage scenes, the Story Wizard badge and the icon set
(about 2 weeks part-time). Developer time ≈ 7 days.

---

## Phase 2 — Reading map (task 2.1, owner approved 2026-11-24)

When a student reads a passage aloud, show **how** they read it, word by word, using the
microphone (not the camera). Prototype: `/prototype/reading-map`, logic in `lib/reading-map.ts`.

**Status (2026-11-24):** prototype tried by the owner and works; it needs improvement. Improvements
will be made in the production build of this task, not in the prototype. Owner's improvement notes: _to be added_.

**Per word** (timing from when each word first appears in the live speech-recognition results,
roughly ±0.3 s, free):

| Status | Rule | Shown as |
|---|---|---|
| Fluent | Matched at normal pace | green |
| Hesitated | Matched after a pause of 1.5 s or more (2.5 s for Stages 1–2); pauses at . , ! ? don't count | amber |
| Misread | Said a different word | red |
| Skipped | Not said | red outline |
| Self-corrected | Wrong, then right within 2 words | green, underlined (credit) |
| Unclear | Low recognition confidence, or a known Indian-accent sound pair (v/w, z/j, th/t) | grey, **never an error** |

**Insights:** tricky words (misread, hesitated or skipped) go into the student's vocabulary review;
speed per sentence; stamina (last third vs first third); patterns (e.g. "-ed endings") only
after 3 or more readings.

**Who sees what:**
- Student: encouraging summary, at most 3 tricky words to practise.
- Teacher: coloured passage per student, plus a class view of the most-missed words ("teach tomorrow").
- Parent: one line, the tricky words and one tip (Telugu/Hindi with the add-on).

**Safeguards:** many unclear words → "noisy room, try again", not a low score; teacher can tap a word
to correct it (also measures recognition accuracy); no labels or diagnosis from one reading.
**Validation before teachers rely on it:** the Lead SME marks about 50 consented recordings; target
≥ 80% agreement on misread/skipped words; tune the pause thresholds from that.

**Version 1 scope (≈ 6–8 dev-days, no running cost):** live word highlight, per-word status,
tricky words → vocabulary review, student summary, teacher coloured passage and class "most missed".
Stored in `ActivityAttempt.meta` (READING); no new tables.
**Later:** patterns, exact word timing from paid recognition at milestone checks only, play-back of
the child's own reading (needs audio storage), parent card.
**Limits:** browser speech recognition works in Chrome and on Android; limited on iPhone Safari;
not in Firefox. Smart board: one reader at a time.
**Camera:** not in scope. A camera experiment, on-device and consented only, may be considered
after the pilot, subject to legal review under the DPDP Act.

---

## Phase 1 exit criteria

- A Clever Minds student logs in, practises at school and at home, and is stopped at the daily limit
  with time shared across both.
- Each day's session mix differs by student and is explainable from reason codes.
- A teacher sees last week's practice and progress for every student and can set focus / grant time.
- Stage step-ups and stage badges fire from the rule, with certificate and parent email.
- Cost per active student per day measured (AI calls + TTS + hosting).

## Validation measures (what the pilot must report — Tier II/III plan §15)

The Phase 1 build must capture these from day one; the pilot (weeks 8–12) reports them.

| Family | Measure | Captured by |
|---|---|---|
| Confidence | Speaking talk time per child, number of turns/attempts, voluntary attempts | `ActivityAttempt.meta` for SPEAKING |
| Capability | Comprehension on **fresh** passages (literal vs inference); delayed retention checks; teacher-rated before/after speaking clips | `ActivityAttempt`; clips need audio storage (Phase 2) — plan a baseline recording in week 1 of the pilot |
| Adoption | Days practised per week, school vs home minutes, teacher minutes in the dashboard, parent opens | `DailySession`, dashboard usage log, email opens |
| Economics | Cost per active child per month; support tickets per school; renewal intent | AI/TTS usage logs, helpdesk, end-of-pilot interviews |

---

## Appendix — proposed schema changes (Prisma, additive)

```prisma
// ---- settings ----
model School {
  // ...existing fields...
  dailyLimitMinutes     Int      @default(20)
  leaderboardsEnabled   Boolean  @default(false)
  homePracticeEnabled   Boolean  @default(true)
}

model Class {
  // ...existing fields...
  dailyLimitMinutes     Int?     // optional class override within school range
  weeklyFocuses         ClassWeeklyFocus[]
}

model Student {
  // ...existing fields...
  parentDailyLimitMinutes Int?   // can only lower the effective limit
  stage                 Int      @default(1)   // 1–5
  stageStep             Int      @default(1)   // 1–3
  attempts              ActivityAttempt[]
  words                 StudentWord[]
  practiceGrants        PracticeGrant[]
  weeklySummaries       WeeklyStudentSummary[]
}

model DailySession {
  // ...existing fields...
  practiceSeconds       Int       @default(0)  // charged time
  exemptSeconds         Int       @default(0)  // teacher-led / competition time
  schoolSeconds         Int       @default(0)
  homeSeconds           Int       @default(0)
  limitSeconds          Int?                   // snapshot of the limit that applied
  lastHeartbeatAt       DateTime?
}

model PracticeGrant {
  id            String   @id @default(cuid())
  studentId     String
  student       Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  date          String   // YYYY-MM-DD (IST)
  extraMinutes  Int
  grantedBy     String   // teacherId
  reason        String?
  createdAt     DateTime @default(now())
  @@index([studentId, date])
}

// ---- activity log (immutable) ----
enum ActivityType { VOCAB_REVIEW READING COMPREHENSION SPEAKING SPELLING }
enum EvidenceFormat { RECOGNITION PRODUCTION }
enum PracticeContext { SCHOOL HOME }

model ActivityAttempt {
  id            String          @id @default(cuid())
  studentId     String
  student       Student         @relation(fields: [studentId], references: [id], onDelete: Cascade)
  date          String          // YYYY-MM-DD (IST)
  activityType  ActivityType
  itemType      String          // "word", "question", "passage", "speaking_prompt"
  itemId        String
  competencyTags String[]       @default([])  // which skills this item gives evidence for
  questionKind  String?         // LITERAL / INFERENCE / WORD_IN_CONTEXT
  format        EvidenceFormat
  correct       Boolean?
  score         Float?          // 0–100 where applicable
  durationSec   Int
  hintsUsed     Int             @default(0)
  context       PracticeContext
  reasonCode    String?         // why the planner chose this activity
  meta          Json?           // e.g. speaking talk time, word count
  createdAt     DateTime        @default(now())
  @@index([studentId, date])
  @@index([studentId, activityType, createdAt])
}

// ---- content ----
model VocabWord {
  id            String   @id @default(cuid())
  word          String
  meaning       String
  example       String
  glossTe       String?  // Telugu
  glossHi       String?  // Hindi
  audioUrl      String?  // pre-generated TTS
  stage         Int
  passageId     String?
  passage       ReadingPassage? @relation(fields: [passageId], references: [id])
  reviewed      Boolean  @default(false)
  learners      StudentWord[]
  @@unique([word, stage])
  @@index([stage])
}

model PassageQuestion {
  id            String   @id @default(cuid())
  passageId     String
  passage       ReadingPassage @relation(fields: [passageId], references: [id], onDelete: Cascade)
  kind          String   // LITERAL / INFERENCE / WORD_IN_CONTEXT
  prompt        String
  options       Json?    // null = typed answer
  answer        String
  reviewed      Boolean  @default(false)
  @@index([passageId])
}
// ReadingPassage gets: stage Int?, words VocabWord[], questions PassageQuestion[]

// ---- learner state ----
model StudentWord {
  id            String    @id @default(cuid())
  studentId     String
  student       Student   @relation(fields: [studentId], references: [id], onDelete: Cascade)
  wordId        String
  word          VocabWord @relation(fields: [wordId], references: [id], onDelete: Cascade)
  box           Int       @default(1)   // 1,2,4,7,14-day boxes
  dueAt         DateTime
  lastSeenAt    DateTime?
  timesCorrect  Int       @default(0)
  timesWrong    Int       @default(0)
  @@unique([studentId, wordId])
  @@index([studentId, dueAt])
}

// ---- configuration ----
model StageDefinition {
  stage         Int      @id          // 1–5
  name          String
  badgeType     String
  minLegacyLevel Int
  maxLegacyLevel Int
  description   String?
}

enum PolicyScope { GLOBAL SCHOOL CLASS }

model SessionMixPolicy {
  id            String       @id @default(cuid())
  scope         PolicyScope
  scopeId       String?      // schoolId / classId; null for GLOBAL
  stage         Int?         // null = all stages
  activityType  ActivityType
  minShare      Float        // 0–1
  maxShare      Float        // 0–1
  weight        Float        @default(1)
  @@unique([scope, scopeId, stage, activityType])
}

model ClassWeeklyFocus {
  id            String       @id @default(cuid())
  classId       String
  class         Class        @relation(fields: [classId], references: [id], onDelete: Cascade)
  week          String       // ISO week, e.g. 2026-W48
  focus         ActivityType
  setBy         String       // teacherId
  @@unique([classId, week])
}

// ---- reporting ----
model WeeklyStudentSummary {
  id               String   @id @default(cuid())
  studentId        String
  student          Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  week             String   // ISO week
  daysPractised    Int
  schoolMinutes    Int
  homeMinutes      Int
  newWords         Int
  wordsRetained    Int
  literalPct       Float?
  inferencePct     Float?
  speakingSeconds  Int
  stage            Int
  stageStep        Int
  flags            String[] @default([])  // NOT_PRACTISED, STUCK_INFERENCE, ...
  createdAt        DateTime @default(now())
  @@unique([studentId, week])
}
```

Default `SessionMixPolicy` (GLOBAL) rows to seed — from the agreed ranges:

| Activity | minShare | maxShare |
|---|---|---|
| VOCAB_REVIEW | 0.10 | 0.25 |
| READING + COMPREHENSION | 0.30 | 0.50 |
| SPEAKING | 0.20 | 0.35 |
| SPELLING | 0.10 | 0.20 |

---

## Open items

1. **Curriculum lead:** confirm stage names/badges and the legacy-level mapping (blocks 1.1 seed data
   and 1.8).
2. **Product:** the Tier II/III plan recommends classroom "Talk Time" mode on the smart board
   *before* home mode (§1, §8). This plan starts with per-student login and home practice, per the
   owner's direction. Decide whether a simple classroom mode is needed for the pilot or stays in
   Phase 2.
3. **SME recruitment (Edvanta):** 1 lead SME, 1+ English SME, 1 Telugu and 1 Hindi reviewer.
   Hours before the pilot (≈120 bundles): English SME ≈ 25–30 h; each language reviewer ≈ 12 h
   (≈ 720 meanings at about a minute each); lead SME ≈ 6 h (spot-checks + setting up control items).
   During the pilot: about 1–2 h a week each. Recruitment should start now, because content review
   (1.5) cannot finish without them.
4. **Schema replacement (task 1.0):** owner sign-off on the field map in SCHEMA_REPLACEMENT_PLAN.md
   step S2, especially which production-only features to keep.
5. **Staffing:** Phase 1 is now ≈ 65 dev-days (incl. 1.0, 1.12, 1.13, 1.14), so 2 developers for
   about 6–7 weeks, plus a part-time designer for about 2 weeks. The pilot start moves back accordingly unless a third developer joins.
