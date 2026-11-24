# WizLingo Architecture & System Design

**Document Version:** 1.0  
**Last Updated:** June 30, 2026  
**Status:** Active Development  

## Table of Contents
1. [System Overview](#system-overview)
2. [Technical Architecture](#technical-architecture)
3. [Learning Engine](#learning-engine)
4. [Database Design](#database-design)
5. [API Design](#api-design)
6. [User Flows](#user-flows)
7. [Integration Points](#integration-points)
8. [Security & Compliance](#security--compliance)
9. [Scalability & Performance](#scalability--performance)
10. [Deployment Architecture](#deployment-architecture)

---

## System Overview

### Vision
WizLingo is an AI-powered language learning platform for K-12 students in India, built on a comprehensive pedagogical framework combining Jolly Phonics, Science of Reading, and Structured Literacy principles.

### Core Features
- **5 Learning Pillars:** Sound Foundation → Language Foundation → Core Skills → Communication → Higher-Order Language
- **13 Progressive Stages:** Linear progression from letter recognition to professional communication
- **5 Grade Categories:** Pre-Primary, Gr 1-3, Gr 4-7, Gr 8-10, Gr 11-12
- **Dual Signup:** B2B (schools) + B2C (individuals)
- **Adaptive Learning:** AI-driven stage progression based on performance
- **Gamification:** XP, streaks, badges, leaderboards

### Target Users
- **Students:** K-12 learners in India
- **Schools:** Educational institutions (B2B)
- **Parents:** Home learning support
- **Teachers:** Class monitoring & assessment
- **Admins:** System management

---

## Technical Architecture

### Stack
```
Frontend:          Next.js 15 (React) + TypeScript + Tailwind CSS
Backend:           Next.js API Routes + TypeScript
Database:          PostgreSQL 18.4 (with Prisma ORM)
Authentication:    JWT (30-day expiry)
Password Hashing:  bcryptjs (10 rounds)
Deployment:        Railway (multi-region support)
AI Services:       Claude API (Anthropic)
```

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer (Next.js)                 │
├─────────────┬──────────────┬──────────────┬────────────────┤
│   Auth UI   │  Dashboard   │   Lessons    │   Admin Panel  │
└─────────────┴──────────────┴──────────────┴────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js Routes)               │
├──────────────┬──────────────┬──────────┬─────────────────────┤
│  Auth APIs   │ Student APIs │ Content  │ Curriculum APIs    │
│              │              │ APIs     │                    │
└──────────────┴──────────────┴──────────┴─────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────┐
│                  Business Logic Layer                        │
├──────────┬─────────────┬──────────────┬─────────────────────┤
│  Auth    │   Learning  │  Assessment  │  Gamification       │
│  Engine  │   Engine    │  Engine      │  Engine             │
└──────────┴─────────────┴──────────────┴─────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────┐
│               Data Access Layer (Prisma ORM)                │
└─────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────┐
│            PostgreSQL Database (Railway Postgres)           │
└─────────────────────────────────────────────────────────────┘
```

### Key Services

#### 1. Authentication Service
**Location:** `/app/api/auth/`

**Endpoints:**
- `POST /api/auth/signup` - User registration (B2B email, B2C phone)
- `POST /api/auth/login` - Authentication (email/phone/UserID)
- `GET /api/auth/me` - Current user profile
- `POST /api/auth/logout` - Session termination

**Flow:**
```
1. User provides credentials
2. Validation (password strength, phone format, duplicate check)
3. Hash password with bcryptjs (10 rounds)
4. Create Student record + StudentProgress + JourneyProgress
5. Generate JWT token (30-day expiry)
6. Store token in localStorage (client-side)
7. Redirect to dashboard
```

#### 2. Learning Engine Service
**Location:** `/app/api/student/`

**Endpoints:**
- `GET /api/student/journey` - Get journey progress
- `POST /api/student/journey/advance` - Advance stage
- `GET /api/curriculum` - Get available lessons
- `POST /api/lesson/start` - Begin lesson session
- `POST /api/lesson/complete` - Submit lesson completion

**Responsibilities:**
- Track student position in learning journey
- Manage stage progression based on performance
- Calculate adaptive difficulty
- Track mastery of stages
- Update pillar-based scores

#### 3. Content Management Service
**Location:** `/app/api/content/`

**Endpoints:**
- `GET /api/content/curriculum-units` - List curriculum units
- `GET /api/content/lessons` - Get lessons for stage
- `GET /api/content/reading-passages` - Reading content
- `GET /api/content/speaking-topics` - Speaking prompts
- `GET /api/content/writing-prompts` - Writing exercises
- `GET /api/content/listening-clips` - Audio content

**Responsibilities:**
- Serve curriculum content based on grade & stage
- Filter content by proficiency level
- Track content views & engagement
- Manage content versioning

#### 4. Assessment Service
**Location:** `/app/api/assessment/`

**Endpoints:**
- `POST /api/assessment/submit` - Submit answers
- `GET /api/assessment/feedback` - Get AI feedback
- `POST /api/assessment/score` - Calculate score

**Responsibilities:**
- Validate student responses
- Score assessments
- Generate AI feedback (Claude API)
- Update performance metrics
- Determine pass/fail/mastery

#### 5. Gamification Service
**Location:** `/app/api/gamification/`

**Endpoints:**
- `GET /api/gamification/xp` - Get XP balance
- `POST /api/gamification/award-xp` - Award points
- `GET /api/gamification/badges` - List badges
- `POST /api/gamification/check-badges` - Evaluate badge criteria
- `GET /api/gamification/leaderboard` - Get rankings

**Responsibilities:**
- Award XP for lesson completion
- Track streak days
- Issue badges for milestones
- Calculate leaderboard rankings
- Track cumulative progress

---

## Learning Engine

### Pedagogical Framework

**13-Stage Progression:**
```
SOUND FOUNDATION (Stages 1-2)
├─ Stage 1: Letters & Alphabet Recognition
└─ Stage 2: Phonics & Blending

LANGUAGE FOUNDATION (Stages 3-4)
├─ Stage 3: Words & Vocabulary
└─ Stage 4: Sentences & Basic Grammar

CORE SKILLS (Stages 5-8)
├─ Stage 5: Reading Fluency
├─ Stage 6: Listening Comprehension
├─ Stage 7: Speaking & Oral Expression
└─ Stage 8: Writing Fundamentals

COMMUNICATION (Stages 9-10)
├─ Stage 9: Advanced Grammar
└─ Stage 10: Communication Skills (Presentation, Debate)

HIGHER-ORDER LANGUAGE (Stages 11-13)
├─ Stage 11: Critical Thinking & Analysis
├─ Stage 12: Advanced Academic Writing
└─ Stage 13: Professional Communication
```

### Grade-to-Stage Mapping

| Grade Category | Starting Stage | Focus | Duration |
|---|---|---|---|
| Pre-Primary (3-5y) | Stage 1 | Sound Foundation | 6-9 months |
| Gr 1-3 (6-9y) | Stage 2-4 | Sound + Language | 9-12 months |
| Gr 4-7 (10-13y) | Stage 5-8 | Core Skills | 12-15 months |
| Gr 8-10 (14-16y) | Stage 9-11 | Communication + Analysis | 12-18 months |
| Gr 11-12 (17-18y) | Stage 12-13 | Academic + Professional | 9-12 months |

### Stage Progression Logic

**Criteria for Advancement:**
```
1. Mastery Threshold Met
   - Pass 5 consecutive lessons with ≥80% score
   - OR Complete 10 lessons with avg score ≥75%

2. Time-Based Progression
   - Minimum 3 days in current stage
   - Maximum 60 days (auto-advance to prevent stalling)

3. Adaptive Assessment
   - AI-driven difficulty adjustment
   - Performance-based pacing
   - Individual learning velocity

4. Prerequisite Completion
   - All mandatory lessons in stage completed
   - Foundational skills demonstrated
```

**Advancement Event:**
```
ON Stage Mastery:
  ├─ Update JourneyProgress.currentStage → next stage
  ├─ Update JourneyProgress.stageProgress → 0
  ├─ Award XP (500 points per stage)
  ├─ Check badge criteria
  ├─ Update leaderboard
  └─ Send celebration notification
```

### Performance Tracking

**Student Progress Schema:**
```
{
  currentStage: "STAGE_5",
  currentPillar: "CORE_SKILLS",
  stageProgress: 45,  // 0-100
  
  // Pillar scores (0-100)
  soundFoundationScore: 85,
  languageFoundationScore: 82,
  coreSkillsScore: 45,
  communicationScore: 0,
  higherOrderScore: 0,
  
  // Session tracking
  totalSessions: 23,
  passedSessions: 19,
  avgSessionScore: 78.5,
  
  // Mastery tracking
  masteredStages: ["STAGE_1", "STAGE_2", "STAGE_3", "STAGE_4"],
  
  // Timestamps
  completedAt: null,
  updatedAt: "2026-06-30T10:46:45.794Z"
}
```

---

## Database Design

### Core Models

**Student**
```prisma
model Student {
  id                String         @id @default(cuid())
  
  // Auth
  email             String?        @unique
  phone             String?        @unique
  userId            String?        @unique
  passwordHash      String
  
  // Profile
  name              String
  gradeCategory     GradeCategory
  dob               DateTime?
  
  // Metrics
  currentLevel      Int            @default(2)
  totalXP           Int            @default(0)
  streakDays        Int            @default(0)
  longestStreak     Int            @default(0)
  lastActivityDate  DateTime?
  
  // Relations
  progress          StudentProgress?
  journeyProgress   JourneyProgress?
  lessonSessions    LessonSession[]
  badges            Badge[]
  leaderboardEntry  Leaderboard?
  
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
}
```

**JourneyProgress**
```prisma
model JourneyProgress {
  id                    String           @id @default(cuid())
  studentId             String           @unique
  student               Student          @relation(fields: [studentId], references: [id])
  
  // Current position
  currentPillar         LearningPillar
  currentStage          ProgressionStage
  stageProgress         Float            // 0-100
  
  // Pillar scores
  soundFoundationScore     Float
  languageFoundationScore  Float
  coreSkillsScore          Float
  communicationScore       Float
  higherOrderScore         Float
  
  // Mastery tracking
  masteredStages        ProgressionStage[]
  completedAt           DateTime?
  
  updatedAt             DateTime         @updatedAt
}
```

**CurriculumUnit**
```prisma
model CurriculumUnit {
  id                String          @id @default(cuid())
  
  // Positioning
  gradeCategory     GradeCategory
  pillar            LearningPillar
  stage             ProgressionStage
  
  // Metadata
  title             String
  description       String
  skills            String[]
  objectives        String[]
  sequence          Int
  
  // Content
  lessons           Lesson[]
  
  createdAt         DateTime        @default(now())
}
```

**Lesson**
```prisma
model Lesson {
  id                String        @id @default(cuid())
  unitId            String
  unit              CurriculumUnit @relation(fields: [unitId], references: [id])
  
  title             String
  description       String
  sequence          Int
  estimatedMinutes  Int
  
  contents          LessonContent[]
  sessions          LessonSession[]
  
  createdAt         DateTime      @default(now())
}
```

**LessonSession** (Tracks Student Progress)
```prisma
model LessonSession {
  id                String        @id @default(cuid())
  studentId         String
  student           Student       @relation(fields: [studentId], references: [id])
  
  lessonId          String
  lesson            Lesson        @relation(fields: [lessonId], references: [id])
  
  // Session tracking
  startedAt         DateTime
  completedAt       DateTime?
  durationSec       Int?
  
  // Performance
  score             Float?        // 0-100
  passed            Boolean       @default(false)
  xpEarned          Int           @default(0)
  
  // Responses
  responses         Json          @default("{}")
  
  createdAt         DateTime      @default(now())
}
```

### Relationships
```
Student (1) ──→ (1) JourneyProgress
Student (1) ──→ (many) LessonSession
Student (1) ──→ (many) Badge
Student (1) ──→ (1) Leaderboard

CurriculumUnit (1) ──→ (many) Lesson
Lesson (1) ──→ (many) LessonContent
Lesson (1) ──→ (many) LessonSession

LessonSession ←── Student
LessonSession ←── Lesson
```

---

## API Design

### Authentication APIs

#### POST /api/auth/signup
**Request:**
```json
{
  "name": "John Doe",
  "email": "john@school.com",      // B2B only
  "password": "SecurePass123",      // B2B only
  "phone": "9876543210",            // B2C only
  "gradeCategory": "GR_4_7",
  "dob": "2015-03-15"
}
```

**Response (Success - 201):**
```json
{
  "studentId": "cmr0b1jrv000c1wrdo5axn27g",
  "userId": "WL591399",             // B2C only
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "signupType": "email|phone",
  "message": "Welcome to WizLingo!"
}
```

#### POST /api/auth/login
**Request:**
```json
{
  "email": "john@school.com",       // Email login
  "password": "SecurePass123"
}
// OR
{
  "phone": "9876543210",            // Phone login
  "password": "9876543210"
}
// OR
{
  "userId": "WL591399",             // UserID login
  "password": "9876543210"
}
```

**Response (Success - 200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "student": {
    "id": "cmr0b1jrv000c1wrdo5axn27g",
    "name": "John Doe",
    "email": "john@school.com",
    "phone": "9876543210",
    "userId": "WL591399",
    "currentLevel": 2,
    "gradeCategory": "GR_4_7"
  }
}
```

#### GET /api/auth/me
**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "cmr0b1jrv000c1wrdo5axn27g",
  "name": "John Doe",
  "email": "john@school.com",
  "phone": "9876543210",
  "currentLevel": 2,
  "gradeCategory": "GR_4_7",
  "totalXP": 1500,
  "streakDays": 5,
  "progress": {
    "readingLevel": 3,
    "speakingLevel": 2,
    "writingLevel": 2,
    "listeningLevel": 2,
    "avgReadingScore": 78.5
  }
}
```

### Learning APIs

#### GET /api/student/journey
**Response (200):**
```json
{
  "id": "cmr0iuuqq000dsnrdw3tzn9n2",
  "studentId": "cmr0b1jrv000c1wrdo5axn27g",
  "currentPillar": "CORE_SKILLS",
  "currentStage": "STAGE_5",
  "stageProgress": 45,
  
  "soundFoundationScore": 85,
  "languageFoundationScore": 82,
  "coreSkillsScore": 45,
  "communicationScore": 0,
  "higherOrderScore": 0,
  
  "masteredStages": ["STAGE_1", "STAGE_2", "STAGE_3", "STAGE_4"]
}
```

#### GET /api/curriculum
**Query:** `?gradeCategory=GR_4_7&stage=STAGE_5`

**Response (200):**
```json
{
  "curriculumUnits": [
    {
      "id": "unit_123",
      "title": "Reading Fluency",
      "description": "Read longer texts with understanding",
      "stage": "STAGE_5",
      "pillar": "CORE_SKILLS",
      "lessons": [
        {
          "id": "lesson_456",
          "title": "Guided Reading: Fairy Tales",
          "estimatedMinutes": 15,
          "sequence": 1
        }
      ]
    }
  ]
}
```

#### POST /api/lesson/start
**Request:**
```json
{
  "lessonId": "lesson_456"
}
```

**Response (201):**
```json
{
  "sessionId": "session_789",
  "lessonId": "lesson_456",
  "lessonContent": [
    {
      "type": "LESSON",
      "title": "Introduction to Fairy Tales",
      "content": "..."
    },
    {
      "type": "EXERCISE",
      "title": "Read Passage",
      "content": "..."
    }
  ],
  "startedAt": "2026-06-30T10:46:45.794Z"
}
```

#### POST /api/lesson/complete
**Request:**
```json
{
  "sessionId": "session_789",
  "responses": {
    "question_1": "answer_a",
    "question_2": "answer_c"
  }
}
```

**Response (200):**
```json
{
  "sessionId": "session_789",
  "score": 85,
  "passed": true,
  "xpEarned": 100,
  "feedback": "Great job! You understood the main idea...",
  "nextActions": {
    "canAdvanceStage": false,
    "stageProgress": 45,
    "recommendations": ["Review vocabulary"]
  }
}
```

---

## User Flows

### Student Learning Flow
```
Login/Signup
    ↓
View Dashboard
    ├─ See Learning Journey
    ├─ Check Current Stage
    └─ View Stats (XP, Streak, etc.)
    ↓
Curriculum
    ├─ Browse Units for Current Stage
    └─ Select Lesson
    ↓
Lesson Session
    ├─ Read Lesson Content
    ├─ Complete Exercises
    └─ Submit Assessment
    ↓
Assessment
    ├─ Get Score & Feedback
    ├─ Check Mastery Status
    └─ Award XP
    ↓
Stage Progress
    ├─ Is Mastery Met? (≥80% on 5 lessons)
    │   ├─ Yes → Advance to Next Stage
    │   └─ No → Continue Current Stage
    └─ Update Dashboard

REPEAT
```

### Teacher Monitoring Flow
```
Teacher Login
    ↓
Class Dashboard
    ├─ View All Students
    ├─ Check Individual Progress
    │   ├─ Current Stage
    │   ├─ Lesson Completion
    │   └─ Assessment Scores
    └─ Generate Reports
    ↓
Analytics
    ├─ Class Performance Overview
    ├─ Individual Strength/Weakness
    └─ Recommendations
```

---

## Integration Points

### Claude AI Integration (Assessment & Feedback)
```
1. Student submits essay/writing
2. Send to Claude API for evaluation
3. Claude analyzes:
   - Grammar & syntax
   - Vocabulary usage
   - Coherence & structure
   - Creativity
4. Generate personalized feedback
5. Award points based on quality
6. Store feedback in database
```

### Content Seeding & Management
```
New Content Creation
    ↓
API: POST /api/admin/seed-content
    ├─ Create CurriculumUnit
    ├─ Create Lessons
    ├─ Create LessonContent
    └─ Link to Assessments
    ↓
Content Ready for Students
```

### Gamification Triggers
```
ON Lesson Completion:
  ├─ Award XP (100-200 points)
  ├─ Update streak
  └─ Check badge criteria

ON Stage Advancement:
  ├─ Award Milestone Badge
  ├─ Award 500 XP
  ├─ Notify student
  └─ Update leaderboard

Daily Login Streak:
  ├─ +1 day on login
  ├─ Reset if missed day
  └─ Award bonus XP on milestones (7, 30, 100 days)
```

---

## Security & Compliance

### Authentication Security
- **JWT Tokens:** 30-day expiry, signed with HS256
- **Password Hashing:** bcryptjs with 10 rounds
- **Token Storage:** localStorage (client) - consider secure HTTP-only cookies for future
- **HTTPS:** All communication encrypted (Railway enforces)

### Data Privacy
- **PII Storage:** Email, phone, DOB encrypted at rest
- **Student Data Isolation:** Each student sees only their data
- **Audit Logging:** Track data access & modifications
- **GDPR/Local Compliance:** Data deletion on request

### Authorization
```
Student:
  ├─ Read: Own profile, own journey, own lessons
  ├─ Write: Own progress, responses, feedback
  └─ Cannot: Access other students' data

Teacher:
  ├─ Read: Class students' data
  ├─ Write: Class assignments, feedback
  └─ Cannot: Delete student data

Admin:
  ├─ Full access to system
  ├─ Manage users & content
  └─ System configuration
```

---

## Scalability & Performance

### Database Optimization
```
Indexes:
  - Student: (email), (phone), (userId), (gradeCategory)
  - JourneyProgress: (studentId), (currentStage)
  - LessonSession: (studentId), (lessonId), (studentId, completedAt)
  - CurriculumUnit: (gradeCategory, pillar, stage)

Query Patterns:
  - Frequent: Get student journey (indexed)
  - Frequent: Get lessons for stage (indexed)
  - Frequent: Get lesson sessions (indexed)
  - Periodic: Leaderboard aggregation (materialized view)
```

### Caching Strategy
```
Client-Side (localStorage):
  - User token (30 days)
  - User profile (5 min)
  - Dashboard data (2 min)

Server-Side (Redis - future):
  - Leaderboard (1 hour)
  - Curriculum cache (24 hours)
  - Session cache (session duration)
```

### API Rate Limiting
```
Unauthenticated:
  - 100 requests/hour
  - Signup/Login: 5 attempts/min

Authenticated:
  - 1000 requests/hour per user
  - Lesson submission: 1 per minute
```

---

## Deployment Architecture

### Railway Deployment
```
┌─────────────────────────────────────────┐
│          Railway Project                │
├─────────────────────────────────────────┤
│  Service: wizlingo-web                  │
│  ├─ Build: Next.js                      │
│  ├─ Environment: Production/Staging      │
│  └─ Region: India (ap-south-1)          │
├─────────────────────────────────────────┤
│  Service: wizlingo-db                   │
│  ├─ Type: PostgreSQL 18.4               │
│  ├─ Backups: Daily                      │
│  └─ Region: Same as app                 │
└─────────────────────────────────────────┘
```

### Build & Deploy Process
```
1. Code Push to Main
2. GitHub Actions Trigger
3. Run Tests & Linting
4. Build Docker Image
5. Push to Railway
6. Run Migrations (prisma migrate deploy)
7. Seed Initial Content (if needed)
8. Health Check
9. Deploy Complete
```

### Environment Variables
```
DATABASE_URL=postgres://...
JWT_SECRET=<random_32_char_secret>
ANTHROPIC_API_KEY=<claude_api_key>
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.wizlingo.com
```

---

## Next Steps

1. **API Implementation** - Build all remaining endpoints
2. **Lesson Player** - Create interactive lesson interface
3. **Assessment Engine** - Integrate Claude for feedback
4. **Mobile Support** - PWA or native apps
5. **Teacher Dashboard** - Class monitoring
6. **Analytics** - Performance insights

---

**Architecture Review:** Review with team for feedback & adjustments
**Status:** Ready for implementation sprint
