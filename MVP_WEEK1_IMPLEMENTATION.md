# MVP Build: Week 1-2 Implementation Guide

**Status**: Starting NOW  
**Goal**: Database + Auth + Basic Dashboard (deployed to Railway by end of Week 2)  
**Effort**: 40-60 hrs/week (solo development)  
**Claude's Role**: Generate 95% of code, you review/test/deploy

---

## 🎯 WEEK 1-2 OBJECTIVES

### **By End of Week 1:**
- ✅ Database schema finalized
- ✅ Prisma models created
- ✅ PostgreSQL running locally
- ✅ Database migrations working

### **By End of Week 2:**
- ✅ Auth system complete (signup + login)
- ✅ Basic student dashboard live
- ✅ Deployed to Railway
- ✅ Can sign up new users and see dashboard

---

## 📋 MVP FEATURE CHECKLIST

### **What's IN (MVP Core)**
```
✅ LSRW Sessions (core)
  ├─ Reading: passage + WPM + accuracy
  ├─ Speaking: Whisper transcription + fluency score
  ├─ Writing: prompt + simple Claude assessment
  └─ Listening: audio + 3 MCQ comprehension

✅ Authentication
  ├─ Email signup
  ├─ Email login
  ├─ Password reset via email
  └─ Session management (JWT cookies)

✅ Student Dashboard
  ├─ Current level display
  ├─ Daily streak counter
  ├─ "Start Today's Lesson" button
  ├─ Recent sessions list
  └─ Simple stats

✅ Gamification (MVP)
  ├─ Daily streak tracking
  ├─ XP accumulation
  ├─ One badge: "Streak Master" (7-day)
  └─ Simple leaderboard (top 10)

✅ Daily Lesson Flow
  ├─ 15-minute structure
  ├─ Listening (3 min)
  ├─ Speaking (3 min)
  ├─ Reading (4 min)
  ├─ Writing (2 min)
  └─ Summary (1 min)

✅ Content (Seeded)
  ├─ 20 reading passages (pre-written)
  ├─ 10 speaking topics (pre-written)
  ├─ 10 writing prompts (pre-written)
  └─ 10 listening audios (pre-recorded)
```

### **What's OUT (Add in Phase 2)**
```
❌ B2B School Management (Phase 2)
❌ Teacher/Principal Dashboards (Phase 2)
❌ Multi-school Isolation (Phase 2)
❌ Parent Dashboard (Phase 2)
❌ Advanced Gamification (Phase 2)
❌ AI Content Generation (Phase 2 - use Claude API only for assessment)
❌ Live Tutoring (Phase 3)
❌ Certification Pathways (Phase 3)
❌ 6 full levels (use Levels 2-3 only, ~30 students)
❌ Advanced Analytics (Phase 2)
```

---

## 💾 DATABASE SCHEMA (Simplified for MVP)

### **Prisma Schema Structure**

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ===== CORE MODELS =====

model Student {
  id              String    @id @default(cuid())
  email           String    @unique
  name            String
  passwordHash    String
  
  // Current proficiency
  currentLevel    Int       @default(2)  // 1-6, use 2-3 for MVP
  
  // Progress tracking
  progress        StudentProgress?
  
  // Sessions
  readingSessions    ReadingSession[]
  speakingSessions   SpeakingSession[]
  writingSessions    WritingSession[]
  listeningSessions  ListeningSession[]
  
  // Achievements
  streakDays      Int       @default(0)
  longestStreak   Int       @default(0)
  lastActivityDate DateTime?
  totalXP         Int       @default(0)
  
  badges          Badge[]
  leaderboardEntry Leaderboard?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([email])
}

model StudentProgress {
  id              String    @id @default(cuid())
  studentId       String    @unique
  student         Student   @relation(fields: [studentId], references: [id], onDelete: Cascade)
  
  // LSRW levels (independent)
  readingLevel    Int       @default(2)
  speakingLevel   Int       @default(2)
  writingLevel    Int       @default(1)
  listeningLevel  Int       @default(1)
  
  // Scores (0-100)
  avgReadingScore Float     @default(0)
  avgSpeakingScore Float    @default(0)
  avgWritingScore Float     @default(0)
  avgListeningScore Float   @default(0)
  
  // Totals
  totalSessions   Int       @default(0)
  passedSessions  Int       @default(0)
  
  updatedAt       DateTime  @updatedAt
}

// ===== SESSIONS =====

model ReadingSession {
  id              String    @id @default(cuid())
  studentId       String
  student         Student   @relation(fields: [studentId], references: [id], onDelete: Cascade)
  
  passageId       String
  passage         ReadingPassage @relation(fields: [passageId], references: [id])
  
  // Metrics
  wpm             Float?
  accuracy        Float?    // 0-100
  missedWords     Int?
  
  completedAt     DateTime?
  durationSec     Int?
  
  createdAt       DateTime  @default(now())
  
  @@index([studentId])
}

model SpeakingSession {
  id              String    @id @default(cuid())
  studentId       String
  student         Student   @relation(fields: [studentId], references: [id], onDelete: Cascade)
  
  topicId         String
  topic           SpeakingTopic @relation(fields: [topicId], references: [id])
  
  // Student's response
  audioUrl        String?
  transcript      String?
  
  // Metrics
  fluencyScore    Float?    // 0-100
  pronunciationScore Float?
  
  completedAt     DateTime?
  durationSec     Int?
  
  createdAt       DateTime  @default(now())
  
  @@index([studentId])
}

model WritingSession {
  id              String    @id @default(cuid())
  studentId       String
  student         Student   @relation(fields: [studentId], references: [id], onDelete: Cascade)
  
  promptId        String
  prompt          WritingPrompt @relation(fields: [promptId], references: [id])
  
  // Student's response
  content         String    @db.Text
  wordCount       Int?
  
  // Assessment
  score           Float?    // 0-100
  feedback        String?   @db.Text
  
  completedAt     DateTime?
  
  createdAt       DateTime  @default(now())
  
  @@index([studentId])
}

model ListeningSession {
  id              String    @id @default(cuid())
  studentId       String
  student         Student   @relation(fields: [studentId], references: [id], onDelete: Cascade)
  
  clipId          String
  clip            ListeningClip @relation(fields: [clipId], references: [id])
  
  // Responses to MCQ questions
  responses       String[]  // JSON array of student answers
  correctCount    Int?
  totalQuestions  Int?
  score           Float?    // 0-100
  
  completedAt     DateTime?
  
  createdAt       DateTime  @default(now())
  
  @@index([studentId])
}

// ===== CONTENT =====

model ReadingPassage {
  id              String    @id @default(cuid())
  title           String
  content         String    @db.Text
  wordCount       Int
  level           Int       // 1-6
  topic           String    // e.g., "Animals", "Food"
  
  sessions        ReadingSession[]
  
  createdAt       DateTime  @default(now())
}

model SpeakingTopic {
  id              String    @id @default(cuid())
  title           String
  prompt          String
  level           Int       // 1-6
  topic           String
  
  sessions        SpeakingSession[]
  
  createdAt       DateTime  @default(now())
}

model WritingPrompt {
  id              String    @id @default(cuid())
  title           String
  prompt          String    @db.Text
  level           Int       // 1-6
  topic           String
  
  sessions        WritingSession[]
  
  createdAt       DateTime  @default(now())
}

model ListeningClip {
  id              String    @id @default(cuid())
  title           String
  audioUrl        String    // S3 path
  transcript      String    @db.Text
  level           Int       // 1-6
  topic           String
  
  // MCQ Questions
  questions       Json      // Array: [{ question, options: [a,b,c], correct: "a" }]
  
  sessions        ListeningSession[]
  
  createdAt       DateTime  @default(now())
}

// ===== GAMIFICATION =====

model Badge {
  id              String    @id @default(cuid())
  studentId       String
  student         Student   @relation(fields: [studentId], references: [id], onDelete: Cascade)
  
  type            String    // "streak_7day"
  name            String    // "Streak Master"
  
  unlockedAt      DateTime  @default(now())
  
  @@unique([studentId, type])
  @@index([studentId])
}

model Leaderboard {
  id              String    @id @default(cuid())
  studentId       String    @unique
  student         Student   @relation(fields: [studentId], references: [id], onDelete: Cascade)
  
  rank            Int
  xpTotal         Int
  
  updatedAt       DateTime  @updatedAt
}

// ===== SESSIONS TRACKING =====

model DailySession {
  id              String    @id @default(cuid())
  studentId       String
  date            String    // YYYY-MM-DD
  
  listeningScore  Float?
  speakingScore   Float?
  readingScore    Float?
  writingScore    Float?
  
  dailyScore      Float?    // Average of above
  completed       Boolean   @default(false)
  
  createdAt       DateTime  @default(now())
  
  @@unique([studentId, date])
  @@index([studentId])
}
```

---

## 🔐 AUTHENTICATION SYSTEM

### **API Endpoints (Week 1-2)**

```typescript
// app/api/auth/signup
POST /api/auth/signup
Request: {
  email: string
  password: string
  name: string
}
Response: {
  studentId: string
  token: string
  message: "Welcome to WizLingo!"
}

// app/api/auth/login
POST /api/auth/login
Request: {
  email: string
  password: string
}
Response: {
  token: string
  student: { id, name, email }
}

// app/api/auth/me
GET /api/auth/me
Headers: { Authorization: "Bearer <token>" }
Response: {
  id: string
  name: string
  email: string
  currentLevel: number
  streakDays: number
  totalXP: number
}

// app/api/auth/logout
POST /api/auth/logout
Response: { message: "Logged out" }
```

### **Implementation (Claude Generates This)**

```typescript
// lib/auth.ts
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function createToken(studentId: string) {
  return jwt.sign(
    { studentId },
    process.env.JWT_SECRET!,
    { expiresIn: '30d' }
  )
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { studentId: string }
  } catch {
    return null
  }
}

// app/api/auth/signup/route.ts
import { prisma } from '@/lib/db'
import { hashPassword, createToken } from '@/lib/auth'

export async function POST(req: Request) {
  const { email, password, name } = await req.json()
  
  // Validate
  if (!email || !password || !name) {
    return Response.json({ error: 'Missing fields' }, { status: 400 })
  }
  
  if (password.length < 6) {
    return Response.json({ error: 'Password too short' }, { status: 400 })
  }
  
  // Check if exists
  const existing = await prisma.student.findUnique({ where: { email } })
  if (existing) {
    return Response.json({ error: 'Email already exists' }, { status: 409 })
  }
  
  // Create student
  const passwordHash = await hashPassword(password)
  const student = await prisma.student.create({
    data: {
      email,
      name,
      passwordHash,
      progress: { create: {} }
    }
  })
  
  const token = createToken(student.id)
  
  return Response.json({
    studentId: student.id,
    token,
    message: 'Welcome to WizLingo!'
  })
}

// app/api/auth/login/route.ts
export async function POST(req: Request) {
  const { email, password } = await req.json()
  
  const student = await prisma.student.findUnique({ where: { email } })
  if (!student) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 })
  }
  
  const valid = await verifyPassword(password, student.passwordHash)
  if (!valid) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 })
  }
  
  const token = createToken(student.id)
  
  return Response.json({
    token,
    student: { id: student.id, name: student.name, email: student.email }
  })
}
```

---

## 📊 BASIC DASHBOARD

### **Student Dashboard Component**

```typescript
// app/dashboard/page.tsx

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Dashboard() {
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = '/login'
      return
    }
    
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          localStorage.removeItem('token')
          window.location.href = '/login'
        } else {
          setStudent(data)
        }
      })
      .finally(() => setLoading(false))
  }, [])
  
  if (loading) return <div>Loading...</div>
  if (!student) return null
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Welcome, {student.name}! 👋
            </h1>
            <p className="text-gray-600 mt-2">Time to practice English</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('token')
              window.location.href = '/login'
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
        
        {/* Streak Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">CURRENT STREAK</p>
              <p className="text-5xl font-bold text-orange-500 mt-2">
                {student.streakDays}
              </p>
              <p className="text-gray-600 mt-2">days in a row 🔥</p>
            </div>
            <div className="text-6xl">🔥</div>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Level</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {student.currentLevel}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Total XP</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {student.totalXP}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Sessions</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {student.sessionCount || 0}
            </p>
          </div>
        </div>
        
        {/* CTA */}
        <Link
          href="/lesson/start"
          className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white 
                     text-center py-6 rounded-xl font-bold text-xl hover:shadow-lg transition"
        >
          ▶️ Start Today's Lesson (15 min)
        </Link>
        
      </div>
    </div>
  )
}
```

---

## 🚀 WEEK 1-2 DAILY BREAKDOWN

### **WEEK 1: Database + Auth**

**Monday (Day 1):**
- [ ] Clone repo locally
- [ ] Create `.env.local` with DATABASE_URL
- [ ] Run `npm install` + dependencies
- [ ] Read existing Prisma schema
- [ ] Plan simplified schema changes

**Tuesday-Wednesday (Days 2-3):**
- [ ] Update Prisma schema (as above)
- [ ] Run `npx prisma migrate dev --name init`
- [ ] Test locally with PostgreSQL
- [ ] Seed sample data (5 students)

**Thursday-Friday (Days 4-5):**
- [ ] Build `/api/auth/signup` endpoint
- [ ] Build `/api/auth/login` endpoint
- [ ] Build `/api/auth/me` endpoint
- [ ] Test with Postman (signup → login → me)
- [ ] Fix errors

**Saturday-Sunday (Days 6-7):**
- [ ] Build login UI (`/pages/login.tsx`)
- [ ] Build signup UI (`/pages/signup.tsx`)
- [ ] Add JWT handling to frontend
- [ ] Test full auth flow
- [ ] Deploy to Railway (test)

---

### **WEEK 2: Dashboard + Polish**

**Monday-Tuesday (Days 1-2):**
- [ ] Build basic dashboard (`/app/dashboard/page.tsx`)
- [ ] Connect to `/api/auth/me`
- [ ] Display student stats
- [ ] Add logout button
- [ ] Style with Tailwind

**Wednesday (Day 3):**
- [ ] Add email verification (optional for MVP)
- [ ] Add password reset flow (basic email)
- [ ] Test all auth flows end-to-end

**Thursday-Friday (Days 4-5):**
- [ ] Create seeding script for content
- [ ] Add 20 reading passages to database
- [ ] Add 10 speaking topics
- [ ] Add 10 writing prompts
- [ ] Add 10 listening audios

**Saturday-Sunday (Days 6-7):**
- [ ] Final testing of auth + dashboard
- [ ] Deploy to Railway (permanent)
- [ ] Setup custom domain (optional)
- [ ] Create marketing landing page
- [ ] Celebrate Week 1-2 completion! 🎉

---

## 💻 SETUP INSTRUCTIONS

### **Local Setup (Monday Morning)**

```bash
# 1. Clone repo (already exists)
cd /Users/maddy/edvanta/reading-app

# 2. Install dependencies
npm install bcryptjs jsonwebtoken

# 3. Setup .env.local
cat > .env.local << 'EOF'
DATABASE_URL="postgresql://user:password@localhost:5432/wizlingo_mvp"
JWT_SECRET="your-secret-key-here-change-in-production"
NODE_ENV="development"
EOF

# 4. Create PostgreSQL database locally
createdb wizlingo_mvp

# 5. Run Prisma migration
npx prisma migrate dev --name init

# 6. Seed initial data
npx prisma db seed

# 7. Start dev server
npm run dev

# 8. Test at http://localhost:3000
```

### **Railway Deployment (Friday of Week 2)**

```bash
# 1. Create Railway project
# - Go to railway.app
# - Connect GitHub repo
# - Create PostgreSQL database
# - Copy DATABASE_URL

# 2. Set environment variables in Railway
DATABASE_URL = (from Railway PostgreSQL)
JWT_SECRET = (generate new secure secret)
NODE_ENV = production

# 3. Deploy
# - Push code to GitHub
# - Railway auto-deploys
# - Done! ✅

# 4. Run migrations on Railway
# - Railway Console → run: npx prisma migrate deploy
# - Done!

# Result: https://wizlingo-mvp.railway.app ✅
```

---

## 📝 CODE GENERATION PROMPTS (For Claude)

When you're ready to build, use these prompts:

### **Prompt 1: Auth System**
```
Build complete authentication system for WizLingo MVP:

Requirements:
- Email + password signup/login
- JWT tokens (30-day expiry)
- Password hashing with bcrypt
- Protected routes middleware
- Logout functionality

Deliverables:
- /app/api/auth/signup/route.ts
- /app/api/auth/login/route.ts
- /app/api/auth/logout/route.ts
- /app/api/auth/me/route.ts
- /lib/auth.ts (helper functions)
- /app/login/page.tsx (UI)
- /app/signup/page.tsx (UI)

Use TypeScript + Next.js 14 + Prisma
```

### **Prompt 2: Dashboard**
```
Build student dashboard for WizLingo MVP:

Display:
- Student name + greeting
- Current level (1-6)
- Daily streak (days in a row)
- Total XP
- Number of sessions completed
- "Start Today's Lesson" CTA button

UI Requirements:
- Responsive (mobile + desktop)
- Tailwind CSS styling
- Gradient background
- Card components for stats
- Logout button

Use TypeScript + React 19 + Tailwind
```

### **Prompt 3: Daily Lesson Component**
```
Build 15-minute daily lesson component:

Structure:
1. Warm-up (1 min): Show streak + goal
2. Listening (3 min): Audio + 3 MCQs
3. Speaking (3 min): Prompt + voice recording
4. Reading (4 min): Passage + questions
5. Writing (2 min): Prompt + text input
6. Summary (1 min): Score + XP + streak

Features:
- Timer for each segment
- Progress bar
- Skip buttons (optional)
- Adaptive branching (if weak, easier next)
- Submit & score display

Use TypeScript + React 19
```

---

## ✅ WEEK 1-2 TESTING CHECKLIST

### **Functional Tests**
- [ ] Signup with new email works
- [ ] Login with correct password works
- [ ] Login fails with wrong password
- [ ] JWT token stored in localStorage
- [ ] Dashboard loads after login
- [ ] Can see student stats
- [ ] Logout clears token
- [ ] Can't access dashboard without token

### **Database Tests**
- [ ] Student created in DB on signup
- [ ] StudentProgress created on signup
- [ ] Password hashed (not plaintext)
- [ ] Sessions can be created
- [ ] Leaderboard updated

### **Deployment Tests**
- [ ] App runs on Railway
- [ ] Database connects on Railway
- [ ] Can signup on Railway app
- [ ] Can login on Railway app
- [ ] Custom domain works

---

## 📱 DEPLOYMENT CHECKLIST (End of Week 2)

- [ ] Database schema finalized
- [ ] Auth system working locally
- [ ] Dashboard displaying correctly
- [ ] All tests passing
- [ ] PostgreSQL on Railway setup
- [ ] App deployed to Railway
- [ ] Environment variables configured
- [ ] Domain pointing to Railway
- [ ] Can signup/login on production
- [ ] No sensitive data in code
- [ ] Error handling for edge cases

---

## 🎯 SUCCESS CRITERIA (End of Week 2)

**You're done when:**
```
✅ User can sign up at https://wizlingo-mvp.app/signup
✅ User can login at https://wizlingo-mvp.app/login
✅ Dashboard shows after login
✅ Can see streak + XP + level
✅ "Start Today's Lesson" button is clickable (doesn't break)
✅ Logout works
✅ No errors in console
✅ App is live and stable on Railway
```

---

## 🔧 YOUR TASKS (Start Monday)

1. **Setup PostgreSQL locally** (1 hour)
2. **Update Prisma schema** (2 hours - I'll generate)
3. **Build auth endpoints** (4 hours - I'll generate)
4. **Test auth locally** (2 hours)
5. **Build dashboard UI** (4 hours - I'll generate)
6. **Seed content** (2 hours)
7. **Deploy to Railway** (3 hours)
8. **Production testing** (2 hours)

**Total: ~20 hours for Weeks 1-2**

---

## 📞 I'M HERE TO HELP

When you're ready:
1. **Say "Start Week 1 Database"** → I generate full Prisma schema
2. **Say "Build Auth"** → I generate signup/login/me endpoints
3. **Say "Build Dashboard"** → I generate dashboard component
4. **Say "Help Deploy"** → I help Railway setup

**Let's ship this MVP!** 🚀

---

**Ready? Let's go to Week 1 Day 1.** 

Next message: "Start Week 1 Database" and we're building!

