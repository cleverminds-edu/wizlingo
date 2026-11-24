# WizLingo Learning Engine Design

**Version:** 1.0  
**Last Updated:** June 30, 2026  
**Framework:** Jolly Phonics + Science of Reading + Structured Literacy

---

## 1. Pedagogical Foundation

### Learning Pillars (5 Levels)

#### Pillar 1: Sound Foundation
**Grade:** Pre-Primary → Gr 1-3  
**Stages:** 1-2  
**Duration:** 6-9 months  
**Focus:** Phonemic awareness, letter recognition, phonics

**Competencies:**
- Recognize letters A-Z
- Identify letter sounds
- Blend sounds into words
- Segment words into sounds
- Read simple CVC words

**Content Types:**
- Letter tracing exercises
- Sound matching activities
- Blending practice
- Phonics worksheets

---

#### Pillar 2: Language Foundation
**Grade:** Gr 1-3 → Gr 4-7  
**Stages:** 3-4  
**Duration:** 6-9 months  
**Focus:** Vocabulary, grammar, sentence structure

**Competencies:**
- Use vocabulary in context
- Form simple sentences
- Understand basic grammar (nouns, verbs, adjectives)
- Recognize sentence boundaries
- Use proper capitalization & punctuation

**Content Types:**
- Vocabulary flashcards
- Grammar exercises
- Sentence construction
- Story writing

---

#### Pillar 3: Core Skills (LSRW)
**Grade:** Gr 4-7 → Gr 8-10  
**Stages:** 5-8  
**Duration:** 12-15 months  
**Focus:** Listening, Speaking, Reading, Writing integration

**Competencies:**
- Read fluently with comprehension
- Listen and understand spoken English
- Speak clearly with proper pronunciation
- Write coherent paragraphs

**Content Types:**
- Reading passages
- Audio comprehension
- Speaking prompts
- Writing assignments

---

#### Pillar 4: Communication
**Grade:** Gr 8-10 → Gr 11-12  
**Stages:** 9-10  
**Duration:** 9-12 months  
**Focus:** Real-world communication, presentation, debate

**Competencies:**
- Conduct conversations
- Present ideas clearly
- Debate & argue points
- Write formal letters & emails
- Tell stories effectively

**Content Types:**
- Conversation scenarios
- Presentation templates
- Debate topics
- Professional communication models

---

#### Pillar 5: Higher-Order Language
**Grade:** Gr 11-12  
**Stages:** 11-13  
**Duration:** 9-12 months  
**Focus:** Critical thinking, academic writing, professional communication

**Competencies:**
- Analyze texts critically
- Write academic essays
- Conduct research
- Write persuasive arguments
- Professional communication

**Content Types:**
- Literary analysis
- Research papers
- Essay templates
- Business communication

---

## 2. Stage Progression System

### 13-Stage Curriculum Map

```
SOUND FOUNDATION
├─ Stage 1 (Pre-Primary): Letters & Alphabet
│  └─ Objectives:
│     ├─ Recognize uppercase & lowercase letters
│     ├─ Identify letter sounds
│     └─ Blend & segment simple sounds
│
└─ Stage 2 (Gr 1-3): Phonics & Blending
   └─ Objectives:
      ├─ Apply phonics rules
      ├─ Blend sounds into words
      ├─ Read CVC & CVCC words
      └─ Identify digraphs (ch, sh, th)

LANGUAGE FOUNDATION
├─ Stage 3 (Gr 1-3): Words & Vocabulary
│  └─ Objectives:
│     ├─ Learn 200 sight words
│     ├─ Use vocabulary in sentences
│     ├─ Understand word families
│     └─ Recognize word categories
│
└─ Stage 4 (Gr 1-3): Sentences & Grammar
   └─ Objectives:
      ├─ Form simple sentences
      ├─ Use nouns & verbs correctly
      ├─ Apply basic punctuation
      └─ Understand subject-verb agreement

CORE SKILLS
├─ Stage 5 (Gr 4-7): Reading Fluency
│  └─ Objectives:
│     ├─ Read 150+ WPM with expression
│     ├─ Comprehend longer passages
│     ├─ Answer inferential questions
│     └─ Identify main ideas & details
│
├─ Stage 6 (Gr 4-7): Listening Comprehension
│  └─ Objectives:
│     ├─ Understand audio narratives
│     ├─ Answer listening questions
│     ├─ Identify key information
│     └─ Follow multi-step directions
│
├─ Stage 7 (Gr 4-7): Speaking & Oral Expression
│  └─ Objectives:
│     ├─ Speak with clear pronunciation
│     ├─ Maintain fluency in conversation
│     ├─ Use appropriate intonation
│     └─ Express ideas confidently
│
└─ Stage 8 (Gr 4-7): Writing Fundamentals
   └─ Objectives:
      ├─ Write coherent paragraphs
      ├─ Use proper grammar & punctuation
      ├─ Organize thoughts logically
      └─ Write for different purposes

COMMUNICATION
├─ Stage 9 (Gr 8-10): Advanced Grammar
│  └─ Objectives:
│     ├─ Master complex sentence structures
│     ├─ Use advanced tenses correctly
│     ├─ Apply modifiers accurately
│     └─ Understand voice & mood
│
└─ Stage 10 (Gr 8-10): Communication Skills
   └─ Objectives:
      ├─ Conduct formal presentations
      ├─ Participate in debates
      ├─ Write professional emails
      └─ Communicate in groups

HIGHER-ORDER LANGUAGE
├─ Stage 11 (Gr 8-10): Critical Thinking
│  └─ Objectives:
│     ├─ Analyze literary texts
│     ├─ Identify themes & symbolism
│     ├─ Evaluate arguments
│     └─ Write critical analysis essays
│
├─ Stage 12 (Gr 11-12): Academic Writing
│  └─ Objectives:
│     ├─ Write research papers
│     ├─ Use academic citations
│     ├─ Develop thesis-driven arguments
│     └─ Synthesize multiple sources
│
└─ Stage 13 (Gr 11-12): Professional Communication
   └─ Objectives:
      ├─ Write business documents
      ├─ Present professionally
      ├─ Interview effectively
      └─ Network professionally
```

---

## 3. Stage Advancement Algorithm

### Mastery Evaluation

A student advances to the next stage when they meet **ONE** of the following criteria:

#### Criterion 1: Consecutive Mastery (Preferred)
```
Pass 5 Consecutive Lessons with Score ≥ 80%
├─ Demonstrates consistent understanding
├─ Recommended pathway
└─ Typical timeline: 2-4 weeks per stage
```

**Algorithm:**
```
IF last_5_lessons_score = [≥80, ≥80, ≥80, ≥80, ≥80]
THEN
  ├─ Mark stage as mastered
  ├─ Award stage completion badge
  ├─ Advance to next stage
  └─ Record mastery timestamp
```

#### Criterion 2: Aggregate Performance
```
Complete 10 Lessons with Average Score ≥ 75%
├─ More flexible pathway
├─ Accounts for learning variability
└─ Typical timeline: 3-5 weeks per stage
```

**Algorithm:**
```
IF count(lessons_completed) ≥ 10 AND average_score(last_10) ≥ 75%
THEN
  ├─ Mark stage as mastered
  ├─ Award stage completion badge
  ├─ Advance to next stage
  └─ Record mastery timestamp
```

#### Criterion 3: Time-Based Progression
```
Automatic Advancement After 60 Days
├─ Prevents stalling/frustration
├─ Student forced to progress
└─ For students struggling with typical criteria
```

**Algorithm:**
```
IF days_in_current_stage > 60
THEN
  ├─ Log struggling student (flag for teacher)
  ├─ Advance to next stage anyway
  ├─ Recommend intervention/tutoring
  └─ Reset stageProgress to 0
```

### Stage Progress Calculation

**Progress = (Lessons Completed / Total Lessons) × 100**

```
Example:
├─ Stage 5 has 12 lessons
├─ Student completed 6 lessons
├─ Progress = (6/12) × 100 = 50%
└─ Displayed on dashboard as "50% Complete"
```

---

## 4. Adaptive Learning System

### Difficulty Adjustment

The system adapts lesson difficulty based on student performance:

#### Performance Categories
```
Score 90-100:  ⬆️  Very Strong   → Increase difficulty next lesson
Score 75-89:   ➡️  Appropriate  → Continue at current difficulty
Score 60-74:   ⬇️  Struggling   → Repeat similar difficulty
Score <60:     ⬇️⬇️ Failed       → Review prerequisites
```

#### Difficulty Adaptation Algorithm
```
AFTER Each Lesson Submission:
  1. Calculate student_score
  2. Compare to baseline (75)
  3. Determine adjustment:
     
     IF score ≥ 90:
        ├─ next_lesson_difficulty = current + 1
        ├─ skip_easier_exercises = true
        └─ recommend_enrichment = true
     
     ELSE IF score >= 75:
        ├─ next_lesson_difficulty = current
        ├─ sequence_normally = true
        └─ no_changes = true
     
     ELSE IF score >= 60:
        ├─ next_lesson_difficulty = current  (same)
        ├─ repeat_similar_content = true
        ├─ add_practice_exercises = true
        └─ send_reminder_to_teacher = true
     
     ELSE (score < 60):
        ├─ next_lesson_difficulty = current - 1  (easier)
        ├─ review_prerequisites = true
        ├─ flag_struggling_student = true
        ├─ send_alert_to_parent = true
        └─ recommend_one_on_one_session = true
  
  4. Update StudentProgress with new settings
```

### Personalized Learning Paths

Each student gets a personalized curriculum based on:

1. **Grade Category** - Age-appropriate content
2. **Current Stage** - Sequential progression
3. **Learning Velocity** - How fast they progress
4. **Weakness Areas** - Extra practice on weak skills
5. **Strength Areas** - Enrichment & challenge content

**Learning Path Example:**
```
Student: John (Gr 4, Currently Stage 5)
├─ Base pathway: Standard Reading Fluency
├─ Personalization:
│  ├─ Reading comprehension is strong → Add inference tasks
│  ├─ Vocabulary is weak → Add 5 extra vocab exercises
│  ├─ Learning pace is fast → Accelerated progression timeline
│  └─ Motivation is low → Gamification & rewards focus
└─ Expected completion: 3 weeks (vs normal 4)
```

---

## 5. Performance Metrics

### Student Performance Tracking

#### Per-Lesson Metrics
```json
{
  "lessonId": "lesson_456",
  "sessionId": "session_789",
  "startedAt": "2026-06-30T10:00:00Z",
  "completedAt": "2026-06-30T10:15:00Z",
  "durationSeconds": 900,
  "score": 85,
  "passed": true,
  "questions": {
    "total": 10,
    "correct": 8,
    "wrong": 2,
    "skipped": 0
  },
  "xpEarned": 100,
  "feedback": "Great job! You got 8 out of 10..."
}
```

#### Stage-Level Metrics
```
Stage 5 Performance:
├─ Lessons completed: 6/12
├─ Average score: 78.5%
├─ Mastery progress: 50%
├─ Time in stage: 14 days
├─ Attempts per question: 1.2
└─ Areas of strength/weakness:
   ├─ Main idea identification: 92%
   ├─ Inference questions: 65%
   └─ Vocabulary retention: 81%
```

#### Student-Level Metrics
```
Overall Performance:
├─ Current stage: STAGE_5 (Reading Fluency)
├─ Stages mastered: 4/13 (31%)
├─ Cumulative average: 76.3%
├─ Total XP: 1,500
├─ Days active: 35
├─ Streak: 5 days
├─ Lessons completed: 42
├─ Proficiency trajectory: On track
└─ Estimated completion: 18 months
```

---

## 6. Gamification Integration

### XP Earning Rules

```
Lesson Completion:
├─ Pass (≥60%): 50 XP
├─ Good (≥75%): 100 XP
├─ Excellent (≥90%): 150 XP
└─ Perfect (100%): 200 XP

Stage Advancement:
├─ First-time mastery: 500 XP
└─ Difficulty bonus: +100 XP (if advanced pathway)

Streak Bonuses:
├─ 7-day streak: 200 XP + Badge
├─ 30-day streak: 500 XP + Badge
└─ 100-day streak: 1000 XP + Badge

Daily Bonuses:
├─ First lesson of day: +25 XP
└─ Complete 3+ lessons in day: +50 XP
```

### Badge System

#### Achievement Badges
```
STAGE MASTERY BADGES
├─ Sound Master: Master Sound Foundation pillar
├─ Language Master: Master Language Foundation pillar
├─ Skills Master: Master Core Skills pillar
├─ Communication Expert: Master Communication pillar
└─ Language Wizard: Complete all 13 stages

STREAK BADGES
├─ Week Warrior: 7-day streak
├─ Month Master: 30-day streak
└─ Century Champion: 100-day streak

PERFORMANCE BADGES
├─ Perfect Lesson: Score 100% on lesson
├─ Quick Learner: Master stage in <2 weeks
└─ Comeback King: Raise score by 30+ points

ENGAGEMENT BADGES
├─ Early Bird: First lesson of the day for 5 days
├─ Night Owl: Complete lessons after 8pm for 5 days
└─ Marathon Runner: Complete 50 lessons in month
```

### Leaderboard Ranking

**Global Leaderboard:**
```
Rank = Function(
  primary: total_xp,
  secondary: days_active,
  tertiary: streak_days,
  filters: grade_category
)
```

**Calculation:**
```
score = (total_xp × 0.6) + (lessons_completed × 0.2) + (streak_days × 0.2)
rank = RANK_DENSE(score, grade_category, period)
```

---

## 7. Assessment & Feedback

### Assessment Types

#### 1. Formative Assessment (During Learning)
```
Purpose: Ongoing feedback during lessons
Type: Embedded quizzes, exercises, activities
Scoring: Immediate feedback
Impact: Guides difficulty adjustment
```

#### 2. Summative Assessment (End of Stage)
```
Purpose: Evaluate overall stage mastery
Type: Comprehensive stage test
Scoring: Determines advancement
Impact: Gates progression to next stage
```

#### 3. Adaptive Assessment
```
Purpose: Personalized difficulty
Type: Dynamic question selection
Scoring: Based on individual responses
Impact: Optimal challenge level
```

### AI-Powered Feedback

**Claude Integration for Writing:**
```
Student Submits Writing
    ↓
Send to Claude API with Prompt:
"Evaluate this [Grade X] writing:
 - Grammar & syntax (score 0-100)
 - Vocabulary usage (score 0-100)
 - Coherence & structure (score 0-100)
 - Creativity (score 0-100)
 Generate constructive feedback & suggestions"
    ↓
Claude Returns:
├─ Overall score
├─ Breakdown by criteria
├─ Specific corrections
├─ Suggestions for improvement
└─ Examples of better phrasing
    ↓
Store Feedback & Display to Student
```

---

## 8. Teacher Insights

### Dashboard Metrics (For Teachers)

```
Class Overview:
├─ Total students: 35
├─ Average stage: STAGE_5
├─ Class mastery rate: 67%
├─ Average XP: 1,200
└─ Overall engagement: 85%

Individual Student:
├─ Current stage: STAGE_6
├─ Mastery progress: 65%
├─ Recent scores: [92%, 78%, 85%, 88%]
├─ Weak areas: Listening comprehension
├─ Strong areas: Reading fluency
├─ Recommended action: Listening practice sessions
└─ Performance trend: ↗️ Improving
```

### Intervention Recommendations

```
System Flags:
├─ Struggling (<60% average):
│  └─ Recommend: 1-on-1 session, curriculum review
├─ Disengaged (no activity >7 days):
│  └─ Recommend: Motivation boost, parents contact
├─ Fast tracker (>90% average):
│  └─ Recommend: Enrichment, advanced content
└─ Irregular pattern (inconsistent scores):
   └─ Recommend: Focus session, strategy discussion
```

---

## 9. Implementation Checklist

- [ ] **Curriculum Seeding**
  - [ ] 13 stages × content created
  - [ ] Grade mappings configured
  - [ ] Learning objectives defined

- [ ] **Stage Progression Engine**
  - [ ] Mastery criteria logic
  - [ ] Progress tracking
  - [ ] Advancement notifications

- [ ] **Adaptive System**
  - [ ] Difficulty adjustment algorithm
  - [ ] Performance tracking
  - [ ] Personalization rules

- [ ] **Assessment System**
  - [ ] Formative assessments
  - [ ] Summative assessments
  - [ ] AI feedback integration

- [ ] **Gamification**
  - [ ] XP calculations
  - [ ] Badge logic
  - [ ] Leaderboard ranking

- [ ] **Reporting**
  - [ ] Student progress reports
  - [ ] Teacher dashboards
  - [ ] Parent notifications

---

## 10. Future Enhancements

1. **ML-Powered Prediction**
   - Predict which students will struggle
   - Personalized intervention recommendations

2. **Adaptive Content Generation**
   - Generate personalized practice content
   - Adapt examples to student interests

3. **Peer Learning**
   - Collaborative lessons
   - Peer feedback & review

4. **Multi-language Support**
   - Regional language variants
   - Translation of content

5. **Advanced Analytics**
   - Learning pattern analysis
   - Predictive modeling
   - Cohort comparisons

---

**Status:** Framework complete, ready for implementation
**Next Phase:** Integrate assessment engine & AI feedback
