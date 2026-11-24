# WizLingo: Complete Curriculum & Application Architecture
## Comprehensive Specification Document

**Version:** 2.0  
**Date:** July 6, 2026  
**Project:** WizLingo - LSRW-Based K-12 English Learning Platform  
**Organization:** Edvanta  

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Curriculum Framework](#curriculum-framework)
3. [Application Architecture](#application-architecture)
4. [System Design](#system-design)
5. [Database Schema](#database-schema)
6. [API Specifications](#api-specifications)
7. [Frontend Architecture](#frontend-architecture)
8. [Implementation Roadmap](#implementation-roadmap)

---

## Executive Summary

### Vision
WizLingo is a comprehensive, AI-powered English language learning platform designed for K-12 students in Indian schools. The platform combines:
- **LSRW methodology** (Listening, Speaking, Reading, Writing)
- **Adaptive learning** with AI-powered content generation
- **Gamification** with badges, XP, and leaderboards
- **School management** for B2B deployment
- **Individual learning** for B2C users

### Key Features
- ✅ 6-level K-12 curriculum with 20 difficulty levels
- ✅ AI-generated personalized content using Claude API
- ✅ Real-time pronunciation feedback (Whisper API)
- ✅ Adaptive difficulty adjustment (3-5 session triggers)
- ✅ Teacher & principal dashboards for monitoring
- ✅ Multi-tenant school support with credential isolation
- ✅ Parent engagement and progress tracking
- ✅ Comprehensive assessment rubrics

### Target Users
- **Students**: Grades 1-12 (ages 6-18)
- **Teachers**: School staff managing classes
- **Principals**: School administrators overseeing programs
- **Parents**: Monitoring student progress
- **Schools**: B2B institutional adoption
- **Global Learners**: B2C individual users

---

## Curriculum Framework

### 1. LSRW Methodology

**Definition:** LSRW stands for the four foundational English language skills:

| Skill | Focus | Activities | Assessment |
|-------|-------|-----------|------------|
| **Listening** | Comprehension & Phonemic Awareness | Audio stories, dialogues, pronunciation practice | Multiple choice Q&A, fill-in-the-blank |
| **Speaking** | Oral Expression & Pronunciation | Dialogue practice, conversations, presentations | AI pronunciation feedback, fluency scoring |
| **Reading** | Comprehension & Fluency | Stories, passages, informational text | Comprehension Q&A, vocabulary extraction |
| **Writing** | Expression & Grammar | Sentence completion, essays, creative writing | AI rubric evaluation, grammar feedback |

### 2. Age-Grade Mapping (K-12)

```
PREPRIMARY (N-KG)  : Ages 3-5   | CEFR: Pre-A1 | Levels 1-3
GRADE 1-3          : Ages 6-9   | CEFR: A1     | Levels 4-6
GRADE 4-7          : Ages 10-13 | CEFR: A1-A2  | Levels 7-9
GRADE 8-10         : Ages 14-16 | CEFR: B1     | Levels 10-15
GRADE 11-12        : Ages 17-18 | CEFR: B1-B2  | Levels 16-20
```

### 3. Curriculum Structure

#### Grade 1-3 (A1 Beginner Level) - 12 Themes

```
UNIT 1: Personal Identity
├─ Theme: Who Am I?
├─ Theme: My Family
├─ Content: 5 pieces (Vocabulary, Reading, Speaking, Writing, Listening)
└─ Duration: 2-3 weeks

UNIT 2: Daily Life & Routines
├─ Theme: Morning Routines
├─ Theme: School Day
└─ Content: 10 pieces total

UNIT 3: Food & Eating
├─ Theme: Fruits & Vegetables
├─ Theme: Meals & Food Items
└─ Content: 10 pieces total

UNIT 4: Animals & Nature
├─ Theme: Domestic Animals
├─ Theme: Wild Animals
└─ Content: 10 pieces total

UNIT 5: Colors & Numbers
├─ Theme: Colors & Descriptions
├─ Theme: Numbers & Counting
└─ Content: 10 pieces total

UNIT 6: Clothing & Exercise
├─ Theme: Clothing Items
├─ Theme: Sports & Exercise
└─ Content: 10 pieces total
```

### 4. Content Types Per Theme

Each theme generates 5 content pieces:

| Type | Description | Duration | Word Count | Assessment |
|------|-------------|----------|-----------|------------|
| **Vocabulary** | 10-15 words with pronunciation, definitions, examples | 5-10 min | N/A | Word matching, fill-in-blanks |
| **Reading** | Story/passage with comprehension questions | 10-15 min | 100-200 words | Multiple choice, short answers |
| **Speaking** | Dialogue practice with pronunciation feedback | 10-15 min | 50-100 words | AI pronunciation scoring (0-100) |
| **Writing** | Sentence completion or short paragraph | 15-20 min | 30-100 words | AI rubric evaluation + feedback |
| **Listening** | Audio story with comprehension questions | 10-15 min | 2-3 min audio | Multiple choice, sequencing |

### 5. Learning Progression Mechanism

#### Level Advancement Rules
```
After Every Session:
├─ Calculate Performance Score (0-100)
│  ├─ Correct answers: 80%+
│  ├─ Time efficiency: 60%+
│  └─ Engagement: completion time < 20 min
│
├─ Track Consecutive Successes
│  ├─ If score >= 80 for 3-5 consecutive sessions → LEVEL UP
│  ├─ If score < 60 for 3 consecutive sessions → LEVEL DOWN
│  └─ Otherwise → maintain current level
│
└─ Update Student Progress
   ├─ Current Level
   ├─ Stage Completion %
   ├─ Total XP earned
   └─ Streak days
```

#### Gamification Elements
- **XP System**: 10-50 XP per completed session
- **Badges**: Word Wizard, Voice Wizard, Language Wizard (5 levels each)
- **Streaks**: Consecutive daily completions
- **Leaderboards**: School, Grade, Global rankings
- **Level Badges**: Completed level certificates

### 6. Difficulty Levels (1-20)

```
LEVELS 1-3:    Phonemic Awareness (Pre-A1)
LEVELS 4-6:    Beginner Production (A1)
LEVELS 7-9:    Elementary Fluency (A1-A2)
LEVELS 10-12:  Pre-Intermediate (A2)
LEVELS 13-15:  Intermediate (A2-B1)
LEVELS 16-18:  Upper-Intermediate (B1)
LEVELS 19-20:  Advanced/Mastery (B1-B2)
```

---

## Application Architecture

### Technology Stack

#### Frontend
- **Framework**: Next.js 16 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 with PostCSS
- **UI Components**: Lucide React icons
- **State Management**: React Context + hooks
- **Data Visualization**: Recharts
- **QR Codes**: qrcode library

#### Backend
- **Runtime**: Node.js 20+
- **Framework**: Next.js API Routes
- **Language**: TypeScript
- **ORM**: Prisma 7.8.0
- **Database**: PostgreSQL (Neon serverless)
- **Cache**: Redis (optional, for production)

#### AI/ML Services
- **Claude API**: Content generation, writing assessment, feedback
- **Whisper API**: Speech-to-text, pronunciation assessment
- **Text-to-Speech**: Google Cloud Text-to-Speech API
- **Anthropic SDK**: @anthropic-ai/sdk v0.100.1

#### Infrastructure
- **Hosting**: Railway (initial), AWS/GCP (scalable)
- **Database**: Neon PostgreSQL
- **File Storage**: AWS S3
- **Email**: AWS SES / SendGrid
- **Monitoring**: CloudWatch / Sentry
- **CI/CD**: GitHub Actions

### Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT LAYER                      │
├─────────────────┬─────────────────┬─────────────────┤
│  Student Portal │  Teacher Portal │  Admin Portal   │
│  (Dashboard)    │  (Class Mgmt)   │  (School Mgmt)  │
└────────┬────────┴────────┬────────┴────────┬────────┘
         │                 │                  │
         └─────────────────┼──────────────────┘
                           │
        ┌──────────────────▼──────────────────┐
        │     Next.js Frontend (TSX)          │
        │  ├─ Routes (/dashboard, /lesson)   │
        │  ├─ Components (reusable)          │
        │  └─ Hooks (custom logic)           │
        └──────────────────┬──────────────────┘
                           │
        ┌──────────────────▼──────────────────┐
        │   Next.js API Layer (/api/...)     │
        │  ├─ Authentication                 │
        │  ├─ Lesson Management              │
        │  ├─ Content Generation             │
        │  ├─ Student Progress               │
        │  ├─ Assessment & Scoring           │
        │  └─ Admin Operations               │
        └──────────────────┬──────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │        Service Layer                │
        ├─────────────────┬────────────────────┤
        │ Prisma Client   │ Content Generator  │
        │ (Database ORM)  │ (Claude API)       │
        ├─────────────────┼────────────────────┤
        │ Answer Validator│ Pronunciation     │
        │ (Logic Library) │ Checker (Whisper) │
        └────────┬────────┴────────┬──────────┘
                 │                 │
        ┌────────▼─────────────────▼────────┐
        │  External Services / APIs         │
        ├─────────────────┬──────────────────┤
        │ PostgreSQL      │ Anthropic API    │
        │ (Neon)          │ (Content & Eval) │
        ├─────────────────┼──────────────────┤
        │ AWS S3          │ Google TTS       │
        │ (Storage)       │ (Audio)          │
        └─────────────────┴──────────────────┘
```

### Key Services

#### 1. Content Generation Service
```typescript
// Location: lib/content-generation/content-generator.ts
// Purpose: Generate LSRW content using Claude API

Services:
├─ generateVocabularySet()      → 10-15 words with examples
├─ generateReadingPassage()     → 100-200 word story + Q&A
├─ generateSpeakingTopic()      → Dialogue with pronunciation guide
├─ generateWritingPrompt()      → Writing assignment + rubric
└─ generateListeningStory()     → Audio script + comprehension Q&A
```

#### 2. Answer Validation Service
```typescript
// Location: lib/validators/answer-validator.ts
// Purpose: Score student responses across content types

Methods:
├─ validateMultipleChoice()     → Index matching, return boolean
├─ validateTextMatch()          → Substring matching with tolerance
├─ validateFillInBlank()        → Exact or keyword matching
├─ validateSequencing()         → Correct order validation
└─ calculateScore()             → Weighted scoring (0-100)
```

#### 3. Assessment Service
```typescript
// Purpose: Evaluate speaking/writing using AI

Methods:
├─ assessPronunciation()        → Whisper API + scoring
├─ assessWriting()              → Claude API rubric evaluation
├─ evaluateGrammar()            → Grammar error detection
└─ provideFeedback()            → Constructive feedback generation
```

#### 4. Progression Service
```typescript
// Purpose: Manage level advancement and adaptive learning

Methods:
├─ calculateLevelProgression()  → 3-5 session trigger logic
├─ updateStudentLevel()         → Advance/maintain/regress
├─ awardXP()                    → 10-50 per session
└─ updateStreak()               → Daily streak tracking
```

---

## System Design

### Authentication Flow

#### B2B (School) Login
```
School Admin Login
├─ Email + Password
├─ School Code validation
├─ Create Session (JWT)
└─ Access: Class management, teacher oversight

Teacher Login (via School)
├─ School Email
├─ Password
├─ Create Session (JWT)
└─ Access: Class dashboard, student monitoring

Student Login (via Class)
├─ Student ID / Email
├─ Password
├─ Create Session (JWT + Cookie)
└─ Access: Lessons, dashboard
```

#### B2C (Individual) Login
```
Student Self-Registration
├─ Email or Phone
├─ Random UserID (WL + 6 digits)
├─ Password (force change on first login)
├─ Grade selection
└─ Create Session

Parent Login
├─ Email + Password
├─ Link to child account(s)
└─ View-only: Progress reports, streaming data
```

### Lesson Workflow

```
User Dashboard
       │
       ▼
Select Lesson
       │
       ▼
POST /api/lesson/session/start
       ├─ Create LessonSession (started_at)
       ├─ Load lesson content & metadata
       └─ Return sessionId
       │
       ▼
Display Lesson Content
       ├─ Load 3-5 content pieces
       ├─ Display in order
       └─ Record interactions
       │
       ▼
Student Completes Content
       ├─ Multiple choice answers
       ├─ Text input responses
       ├─ Audio recording (speaking)
       └─ Writing submission
       │
       ▼
POST /api/lesson/session/{sessionId}/submit
       ├─ Validate all answers
       ├─ Calculate score (0-100)
       ├─ Award XP
       ├─ Check level progression (3-5 sessions)
       └─ Return results
       │
       ▼
Display Results & Feedback
       ├─ Score breakdown
       ├─ Correct/incorrect items
       ├─ Constructive feedback
       ├─ XP earned
       └─ Level status (if changed)
```

### Data Flow for Content Generation

```
Admin Triggers Generation
       │
       ▼
POST /api/generate/{type}
       ├─ Validate: theme, grade, difficulty_level
       ├─ Construct Claude prompt
       └─ Call Anthropic API
       │
       ▼
Claude API Response
       ├─ Parse JSON response
       ├─ Validate structure
       └─ Extract content pieces
       │
       ▼
Save to Database
       ├─ Create LessonContent record
       ├─ Store JSON (questions, examples, etc.)
       └─ Index for retrieval
       │
       ▼
Return to UI
       ├─ Display generated content
       ├─ Preview before saving
       └─ Option to regenerate
```

---

## Database Schema

### Core Models

#### Student Model
```prisma
model Student {
  id                String @id @default(cuid())
  email             String? @unique
  phone             String? @unique
  userId            String? @unique          // WL + 6 digits (B2C)
  passwordHash      String
  
  // Profile
  name              String
  gradeCategory     GradeCategory @default(GR_1_3)
  dob               DateTime?
  
  // Tracking
  currentLevel      Int @default(2)
  totalXP           Int @default(0)
  streakDays        Int @default(0)
  longestStreak     Int @default(0)
  lastActivityDate  DateTime?
  
  // Relations
  progress          StudentProgress?
  journeyProgress   JourneyProgress?
  lessonSessions    LessonSession[]
  badges            Badge[]
  leaderboardEntry  Leaderboard?
  classEnrollments  Enrollment[]
  readingSessions   ReadingSession[]
  speakingSessions  SpeakingSession[]
  writingSessions   WritingSessions[]
  listeningSessions ListeningSession[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

#### Lesson & Content Models
```prisma
model CurriculumUnit {
  id                String @id @default(cuid())
  gradeCategory     GradeCategory
  pillar            LearningPillar
  stage             ProgressionStage
  title             String
  description       String?
  sequence          Int
  skills            String[]          // ["Phoneme Recognition", ...]
  objectives        String[]
  lessons           Lesson[]
  createdAt         DateTime @default(now())
}

model Lesson {
  id                String @id @default(cuid())
  unitId            String
  unit              CurriculumUnit @relation(fields: [unitId])
  title             String
  description       String?
  sequence          Int
  estimatedMinutes  Int @default(15)
  contents          LessonContent[]
  sessions          LessonSession[]
  createdAt         DateTime @default(now())
}

model LessonContent {
  id                String @id @default(cuid())
  lessonId          String
  lesson            Lesson @relation(fields: [lessonId])
  type              ContentType        // VOCABULARY, READING, SPEAKING, etc.
  sequence          Int
  title             String
  description       String?
  content           Json               // Dynamic content structure
  mediaUrl          String?            // Audio/video URL
  isGraded          Boolean @default(true)
  passingScore      Float? @default(80)
  createdAt         DateTime @default(now())
}
```

#### Student Progress Models
```prisma
model StudentProgress {
  id                String @id @default(cuid())
  studentId         String @unique
  student           Student @relation(fields: [studentId])
  
  // Legacy LSRW tracking
  readingLevel      Int @default(1)
  speakingLevel     Int @default(1)
  writingLevel      Int @default(1)
  listeningLevel    Int @default(1)
  
  avgReadingScore   Float @default(0)
  avgSpeakingScore  Float @default(0)
  avgWritingScore   Float @default(0)
  avgListeningScore Float @default(0)
  
  totalSessions     Int @default(0)
  passedSessions    Int @default(0)
  updatedAt         DateTime @updatedAt
}

model JourneyProgress {
  id                String @id @default(cuid())
  studentId         String @unique
  student           Student @relation(fields: [studentId])
  
  currentPillar     LearningPillar @default(SOUND_FOUNDATION)
  currentStage      ProgressionStage @default(STAGE_1)
  stageProgress     Float @default(0)  // 0-100%
  
  soundFoundationScore    Float @default(0)
  languageFoundationScore Float @default(0)
  coreSkillsScore         Float @default(0)
  communicationScore      Float @default(0)
  higherOrderScore        Float @default(0)
  
  masteredStages    ProgressionStage[]
  completedAt       DateTime?
  updatedAt         DateTime @updatedAt
}

model LessonSession {
  id                String @id @default(cuid())
  studentId         String
  student           Student @relation(fields: [studentId])
  lessonId          String
  lesson            Lesson @relation(fields: [lessonId])
  
  startedAt         DateTime
  completedAt       DateTime?
  durationSec       Int?
  
  score             Float?             // 0-100
  passed            Boolean @default(false)
  xpEarned          Int @default(0)
  
  responses         Json @default("{}")  // Student answers
  createdAt         DateTime @default(now())
}
```

#### School & Teacher Models
```prisma
model School {
  id                String @id @default(cuid())
  name              String
  code              String @unique
  city              String?
  state             String?
  principalEmail    String?
  managerId         String
  manager           GlobalManager @relation(fields: [managerId])
  teachers          Teacher[]
  createdAt         DateTime @default(now())
}

model Teacher {
  id                String @id @default(cuid())
  email             String @unique
  passwordHash      String
  name              String
  phone             String?
  schoolId          String?
  school            School? @relation(fields: [schoolId])
  classes           Class[]
  createdAt         DateTime @default(now())
}

model Class {
  id                String @id @default(cuid())
  name              String
  gradeLevel        GradeCategory
  code              String @unique
  teacherId         String
  teacher           Teacher @relation(fields: [teacherId])
  enrollments       Enrollment[]
  createdAt         DateTime @default(now())
}

model Enrollment {
  id                String @id @default(cuid())
  classId           String
  class             Class @relation(fields: [classId])
  studentId         String
  student           Student @relation(fields: [studentId])
  enrolledAt        DateTime @default(now())
  
  @@unique([classId, studentId])
}
```

---

## API Specifications

### Authentication Endpoints

#### POST /api/auth/signup
```json
Request {
  "email": "student@school.com",
  "password": "securePassword123",
  "name": "John Doe",
  "gradeCategory": "GR_1_3"
}

Response {
  "success": true,
  "user": {
    "id": "cuid123",
    "email": "student@school.com",
    "name": "John Doe",
    "gradeCategory": "GR_1_3"
  },
  "token": "jwt_token_here"
}
```

#### POST /api/auth/login
```json
Request {
  "email": "student@school.com",
  "password": "securePassword123"
}

Response {
  "success": true,
  "token": "jwt_token_here",
  "user": { /* user object */ }
}
```

### Lesson Endpoints

#### GET /api/student/lessons
```json
Response {
  "success": true,
  "data": [
    {
      "id": "lesson_id_1",
      "title": "Vocabulary Mastery - Grade 1",
      "gradeCategory": "GR_1_3",
      "difficulty": 4,
      "estimatedMinutes": 15,
      "contentCount": 5,
      "lastCompleted": "2026-06-30T10:30:00Z"
    }
  ]
}
```

#### POST /api/lesson/session/start
```json
Request {
  "lessonId": "lesson_id_1"
}

Response {
  "success": true,
  "sessionId": "session_uuid",
  "lesson": {
    "title": "Vocabulary Mastery - Grade 1",
    "estimatedMinutes": 15
  },
  "contents": [
    {
      "id": "content_1",
      "type": "VOCABULARY",
      "sequence": 1,
      "title": "Vocabulary Set",
      "data": { /* vocabulary items */ }
    },
    // ... more contents
  ]
}
```

#### POST /api/lesson/session/{sessionId}/submit
```json
Request {
  "responses": {
    "content_1": [
      { "questionId": "q1", "answer": "apple" },
      { "questionId": "q2", "answer": "1" }
    ],
    "content_2": [
      { "questionId": "q3", "answer": "The cat is sleeping" }
    ]
    // ... more responses
  }
}

Response {
  "success": true,
  "sessionId": "session_uuid",
  "score": 85,
  "passed": true,
  "xpEarned": 35,
  "results": [
    {
      "contentId": "content_1",
      "type": "VOCABULARY",
      "score": 90,
      "correct": 9,
      "total": 10
    }
  ],
  "levelChange": {
    "changed": false,
    "currentLevel": 4,
    "reason": "Need 3 consecutive 80+ scores"
  }
}
```

### Content Generation Endpoints

#### POST /api/generate/vocabulary-set
```json
Request {
  "theme": "Who Am I",
  "grade": "Grade1",
  "difficulty_level": 4,
  "word_count": 12
}

Response {
  "success": true,
  "data": {
    "vocabulary_set": [
      {
        "word": "name",
        "pronunciation": "neɪm",
        "definition": "The word used to identify someone or something",
        "example_sentence": "My name is Alex.",
        "related_words": ["person", "identity"]
      },
      // ... more words
    ]
  }
}
```

#### POST /api/generate/reading-passage
```json
Request {
  "theme": "Who Am I",
  "grade": "Grade1",
  "difficulty_level": 4,
  "length": "short"
}

Response {
  "success": true,
  "data": {
    "title": "A Story About Me",
    "passage": "Hi, my name is Raj. I am 7 years old...",
    "vocabulary_words": ["name", "years", "school"],
    "comprehension_questions": [
      {
        "id": "q1",
        "question": "What is the boy's name?",
        "type": "multiple_choice",
        "options": ["Raj", "Ram", "Ravi"],
        "correct_answer": "Raj"
      }
    ],
    "word_count": 145,
    "reading_time_minutes": 5
  }
}
```

### Teacher Dashboard Endpoints

#### GET /api/teacher/classes
```json
Response {
  "success": true,
  "data": [
    {
      "id": "class_id_1",
      "name": "Grade 1-A",
      "gradeLevel": "GR_1_3",
      "studentCount": 28,
      "createdAt": "2026-06-01"
    }
  ]
}
```

#### GET /api/teacher/class/{classId}/analytics
```json
Response {
  "success": true,
  "data": {
    "classId": "class_id_1",
    "totalStudents": 28,
    "averageScore": 78.5,
    "averageXP": 245,
    "skillBreakdown": {
      "reading": 82,
      "speaking": 76,
      "writing": 74,
      "listening": 80
    },
    "topPerformers": [
      {"studentId": "...", "name": "Alice", "score": 95},
      {"studentId": "...", "name": "Bob", "score": 92}
    ],
    "needsSupport": [
      {"studentId": "...", "name": "Charlie", "score": 45}
    ]
  }
}
```

---

## Frontend Architecture

### Page Structure

```
app/
├── layout.tsx                 # Root layout
├── page.tsx                   # Landing page
├── dashboard/
│   ├── page.tsx              # Student dashboard
│   ├── components/
│   │   ├─ LessonCard.tsx
│   │   ├─ ProgressWidget.tsx
│   │   └─ LeaderboardWidget.tsx
│   └── hooks/
│       └─ useLessons.ts
├── lesson/
│   ├── [lessonId]/
│   │   ├── page.tsx          # Lesson player
│   │   └── components/
│   │       ├─ LessonContent.tsx
│   │       ├─ QuestionRenderer.tsx
│   │       └─ ProgressBar.tsx
│   └── [sessionId]/
│       └── results/page.tsx   # Results screen
├── school/
│   └── page.tsx              # Teacher dashboard
├── admin/
│   └── page.tsx              # School admin
└── api/
    ├── auth/
    ├── lesson/
    ├── generate/
    ├── student/
    ├── teacher/
    └── admin/
```

### Key Components

```typescript
// StudentDashboard
├─ LessonGrid
│  └─ LessonCard (interactive, shows progress)
├─ ProgressTracking
│  ├─ XP Display
│  ├─ Level Indicator
│  └─ Streak Counter
├─ BadgeShowcase
│  └─ BadgeCard (5 badge types)
└─ RecentActivity
   └─ SessionHistory

// LessonPlayer
├─ ContentRenderer
│  ├─ VocabularyView
│  ├─ ReadingView
│  ├─ SpeakingView
│  ├─ WritingView
│  └─ ListeningView
├─ AnswerInput
│  ├─ MultipleChoice
│  ├─ TextInput
│  ├─ AudioRecorder
│  └─ TextEditor
├─ ProgressBar
├─ Timer
└─ Navigation (Next/Prev)

// TeacherDashboard
├─ ClassSelector
├─ ClassAnalytics
│  ├─ OverallStats
│  ├─ SkillBreakdown
│  ├─ StudentList
│  └─ PerformanceChart
├─ StudentDetail
│  ├─ ProgressTimeline
│  ├─ ScoreHistory
│  └─ Recommendations
└─ ContentManagement
   ├─ LessonList
   └─ GenerateContent
```

### State Management

```typescript
// AuthContext
├─ currentUser: Student | Teacher | Admin | null
├─ isAuthenticated: boolean
├─ login(credentials)
├─ logout()
└─ updateProfile()

// LessonContext
├─ currentLesson: Lesson | null
├─ currentSession: LessonSession | null
├─ currentContent: LessonContent | null
├─ studentResponses: Record<string, Answer[]>
├─ loadLesson(lessonId)
├─ submitAnswer(contentId, answer)
└─ completeSession()

// StudentProgress Context
├─ currentLevel: number
├─ totalXP: number
├─ streakDays: number
├─ badges: Badge[]
└─ updateProgress()
```

---

## Implementation Roadmap

### Phase 1: Core MVP (Weeks 1-4)
- ✅ Database schema & Prisma setup
- ✅ Authentication (signup/login)
- ✅ Student dashboard
- ✅ Lesson seeding & playback
- ✅ Answer validation
- ⏳ Content generation API integration

### Phase 2: AI Integration (Weeks 5-8)
- ⏳ Claude API for content generation
- ⏳ Whisper API for pronunciation assessment
- ⏳ Text-to-Speech integration
- ⏳ Writing assessment with AI rubric

### Phase 3: Teacher Features (Weeks 9-12)
- ⏳ Teacher authentication
- ⏳ Class management
- ⏳ Student analytics dashboard
- ⏳ Progress tracking & reporting

### Phase 4: Gamification (Weeks 13-16)
- ⏳ Badge system (5 types × 5 levels)
- ⏳ XP & leaderboards
- ⏳ Streak tracking
- ⏳ Achievement notifications

### Phase 5: School Management (Weeks 17-20)
- ⏳ B2B onboarding
- ⏳ Principal dashboard
- ⏳ School-wide analytics
- ⏳ Teacher oversight features

### Phase 6: Parent Features (Weeks 21-24)
- ⏳ Parent account creation
- ⏳ Child account linking
- ⏳ Progress reports
- ⏳ Communication tools

### Phase 7: Scaling & Optimization (Weeks 25+)
- ⏳ Database optimization & caching
- ⏳ Performance tuning
- ⏳ Mobile app (React Native)
- ⏳ Analytics & observability
- ⏳ Multi-language support

---

## Deployment & Operations

### Environment Configuration

```
Development:
├─ DATABASE_URL=postgresql://localhost:5432/wizlingo_dev
├─ ANTHROPIC_API_KEY=sk-ant-...
├─ JWT_SECRET=dev_secret_key
└─ NODE_ENV=development

Production:
├─ DATABASE_URL=postgresql://neon.db/wizlingo_prod
├─ ANTHROPIC_API_KEY=sk-ant-...
├─ JWT_SECRET=production_secret_key
├─ NODE_ENV=production
├─ AWS_REGION=us-east-1
├─ AWS_ACCESS_KEY_ID=...
└─ AWS_SECRET_ACCESS_KEY=...
```

### Deployment Pipeline

```
GitHub Push
    ↓
GitHub Actions CI
├─ npm install
├─ npm run lint
├─ npm run test
└─ npm run build
    ↓
Build Passes?
├─ YES → Deploy to Railway
└─ NO  → Notify developer

Railway Deployment
├─ prisma migrate deploy
├─ npm run build
├─ Start Next.js server
└─ Health check
    ↓
Monitor & Alert
├─ Error tracking (Sentry)
├─ Performance (Datadog)
└─ Logs (CloudWatch)
```

---

## Success Metrics

### Learning Outcomes
- ✅ Average improvement: +25% score over 8 weeks
- ✅ Level progression: 60%+ of students advance 1+ level per term
- ✅ Skill distribution: Balanced reading/speaking/writing/listening (±10%)

### Engagement Metrics
- ✅ Daily active users: 70%+ of enrolled students
- ✅ Session completion: 85%+ lesson completion rate
- ✅ Time on platform: 15-20 min per session (target)

### Adoption Metrics
- ✅ B2B schools: 50+ schools enrolled in Year 1
- ✅ Students: 50,000+ total students
- ✅ B2C users: 10,000+ individual learners

### Technical Metrics
- ✅ API response time: <200ms p95
- ✅ Uptime: 99.9%
- ✅ Generation success rate: 95%+ (content generation)

---

## Support & Resources

### Documentation
- API Documentation: `/docs/api.md`
- Curriculum Guide: `/docs/curriculum.md`
- Developer Setup: `/docs/setup.md`

### Contact
- **Support Email**: support@wizlingo.com
- **Slack Community**: #wizlingo-dev
- **GitHub Issues**: github.com/edvanta/wizlingo/issues

---

**Document Version**: 2.0  
**Last Updated**: July 6, 2026  
**Next Review**: August 6, 2026
