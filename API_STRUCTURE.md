# WizLingo API Structure

## Overview
This is a dual-mode app supporting both **B2B (Schools)** and **B2C (Public)** users.

```
Users
├─ SCHOOL: Via school accounts (teacher/admin login)
└─ PUBLIC: Direct signup (student/parent login) ← For 100-user beta
```

---

## API Routes Structure

```
/app/api/
├── auth/
│   ├── signup/        POST   → Register student or parent
│   ├── login/         POST   → Login with email + password
│   └── profile/       GET    → Get current user info
│
├── sessions/
│   ├── reading/
│   │   ├── route.ts   POST   → Create reading session
│   │   │             GET    → List student's reading sessions
│   │   └── [id]/
│   │       └── complete/  POST → Submit transcript, get metrics
│   │
│   └── speaking/
│       ├── route.ts   POST   → Create speaking session
│       │             PUT    → Submit transcript + audio
│       └── [id]/
│           └── assess/    POST → Get AI assessment
│
├── progress/
│   └── [studentId]/   GET    → Get dashboard (WPM trends, badges, sessions)
│
├── badges/
│   ├── route.ts       GET    → List all available badges
│   └── [studentId]/   GET    → Get student's earned badges
│
├── passages/
│   ├── route.ts       GET    → List passages (filter by grade/difficulty)
│   └── [id]/          GET    → Get passage details
│
└── topics/
    ├── route.ts       GET    → List conversation topics
    └── [id]/          GET    → Get topic details
```

---

## Key Endpoints for 100-User Beta

### 1️⃣ **Auth**

#### POST `/api/auth/signup`
```json
{
  "email": "rahul@gmail.com",
  "password": "secure123",
  "name": "Rahul",
  "grade": 5,
  "accountType": "PUBLIC",  // or "SCHOOL"
  "parentEmail": "parent@gmail.com"
}

Response:
{
  "message": "User created successfully",
  "student": {
    "id": "rahul@gmail.com",
    "name": "Rahul",
    "grade": 5,
    "accountType": "PUBLIC"
  }
}
```

#### POST `/api/auth/login`
```json
{
  "email": "rahul@gmail.com",
  "password": "secure123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "student": {...}
}
```

---

### 2️⃣ **Reading Sessions**

#### POST `/api/sessions/reading`
```json
{
  "studentId": "rahul@gmail.com",
  "passageId": "passage-123"
}

Response:
{
  "sessionId": "session-456",
  "passage": {
    "id": "passage-123",
    "title": "The Lion and the Mouse",
    "content": "Once upon a time...",
    "wordCount": 520,
    "gradeBand": "BAND_3_5",
    "level": 3
  },
  "startedAt": "2026-06-02T10:30:00Z"
}
```

#### POST `/api/sessions/reading/[sessionId]/complete`
```json
{
  "transcript": "Once upon a time there was a lion...",
  "durationSec": 300,
  "wpm": 92,
  "accuracy": 85,
  "missedWords": ["leonine", "slumber"]
}

Response:
{
  "message": "Session completed",
  "session": {
    "id": "session-456",
    "wpm": 92,
    "accuracy": 85,
    "completedAt": "2026-06-02T10:35:00Z"
  },
  "badgesEarned": ["SPARK", "WORD_WIZARD"]
}
```

---

### 3️⃣ **Speaking Sessions**

#### POST `/api/sessions/speaking`
```json
{
  "studentId": "rahul@gmail.com",
  "topicId": "topic-789"
}

Response:
{
  "sessionId": "session-999",
  "topic": {
    "id": "topic-789",
    "title": "Daily Routine Conversation",
    "character": "Alice",
    "openingLine": "Hi! What's your morning routine?",
    "mode": "AI"
  },
  "startedAt": "2026-06-02T10:45:00Z"
}
```

#### PUT `/api/sessions/speaking`
```json
{
  "sessionId": "session-999",
  "transcript": "Good morning. I wake up at 6 AM...",
  "durationSec": 120,
  "wpm": 88,
  "fluencyScore": 82
}

Response:
{
  "message": "Speaking session completed",
  "session": {
    "id": "session-999",
    "wpm": 88,
    "fluencyScore": 82,
    "completedAt": "2026-06-02T10:47:00Z"
  }
}
```

---

### 4️⃣ **Progress Dashboard**

#### GET `/api/progress/[studentId]`
```json
{
  "student": {
    "id": "rahul@gmail.com",
    "name": "Rahul",
    "grade": 5,
    "accountType": "PUBLIC"
  },
  "progress": {
    "totalSessions": 12,
    "passedSessions": 10,
    "avgWpm": 90,
    "avgAccuracy": 82,
    "currentLevel": 3
  },
  "badges": [
    {
      "id": "badge-1",
      "type": "SPARK",
      "earnedAt": "2026-06-02T10:35:00Z"
    },
    {
      "id": "badge-2",
      "type": "WORD_WIZARD",
      "earnedAt": "2026-06-02T10:35:00Z"
    }
  ],
  "readingTrend": [
    { "date": "2026-06-02", "wpm": 92, "accuracy": 85 },
    { "date": "2026-06-01", "wpm": 88, "accuracy": 80 }
  ],
  "speakingTrend": [
    { "date": "2026-06-02", "wpm": 88, "fluency": 82 },
    { "date": "2026-06-01", "wpm": 84, "fluency": 78 }
  ]
}
```

---

### 5️⃣ **Badges**

#### GET `/api/badges`
```json
[
  {
    "id": "badge-spark",
    "name": "Spark",
    "type": "SPARK",
    "emoji": "✨",
    "description": "Complete your first reading session"
  },
  {
    "id": "badge-wiz",
    "name": "Word Wizard",
    "type": "WORD_WIZARD",
    "emoji": "📚",
    "description": "Achieve 80%+ accuracy in a session"
  }
]
```

#### GET `/api/badges/[studentId]`
```json
[
  {
    "id": "earned-1",
    "type": "SPARK",
    "earnedAt": "2026-06-02T10:35:00Z"
  },
  {
    "id": "earned-2",
    "type": "WORD_WIZARD",
    "earnedAt": "2026-06-02T10:35:00Z"
  }
]
```

---

## Local PostgreSQL Setup

### 1. Install PostgreSQL
```bash
# macOS
brew install postgresql@15

# Start service
brew services start postgresql@15
```

### 2. Create Database
```bash
createdb wizlingo_beta
```

### 3. Set Environment Variables
Create `.env.local`:
```
DATABASE_URL="postgresql://username:password@localhost:5432/wizlingo_beta"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Run Migrations
```bash
npx prisma migrate dev --name init
```

### 5. Seed Initial Data (Optional)
Create `/prisma/seed.ts`:
```typescript
import { PrismaClient, GradeBand } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create sample passages
  await prisma.readingPassage.create({
    data: {
      title: "The Lion and the Mouse",
      content: "Once upon a time, a mighty lion...",
      wordCount: 520,
      gradeBand: "BAND_3_5",
      level: 3,
      topic: "Stories",
    },
  });

  // Create sample topics
  await prisma.conversationTopic.create({
    data: {
      title: "Daily Routine",
      gradeBand: "BAND_3_5",
      level: 2,
      character: "Alice",
      openingLine: "Hi! What's your morning routine?",
      mode: "AI",
    },
  });
}

main();
```

Run seed:
```bash
npx prisma db seed
```

---

## Database Queries for Monitoring (100-User Beta)

### Daily Active Users
```sql
SELECT COUNT(DISTINCT "studentId") as daily_active_users
FROM "ReadingSession"
WHERE "createdAt" >= NOW() - INTERVAL '1 day';
```

### Average WPM by Grade
```sql
SELECT 
  s.grade,
  AVG(rs.wpm) as avg_wpm
FROM "Student" s
JOIN "ReadingSession" rs ON s.id = rs."studentId"
GROUP BY s.grade;
```

### Badge Earning Rate
```sql
SELECT 
  type,
  COUNT(*) as count
FROM "Badge"
GROUP BY type;
```

---

## Next Steps

1. ✅ Set up PostgreSQL locally
2. ✅ Run `prisma migrate dev --name init`
3. ✅ Create `/app/api/` routes (provided above)
4. ✅ Implement NextAuth for authentication
5. ✅ Hook frontend to API endpoints
6. ✅ Deploy to Vercel (Week 4 of beta)

**Ready to start?** Run this:
```bash
npm install @prisma/client next-auth bcrypt
npx prisma migrate dev --name init
```
