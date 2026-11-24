# WizLingo Developer Quick Reference

**Last Updated:** June 30, 2026  
**For:** Development Team  

---

## Quick Links

- **Architecture:** `ARCHITECTURE.md` - System design & components
- **API Specs:** `API_SPECIFICATION.md` - Detailed endpoint documentation
- **Learning Engine:** `LEARNING_ENGINE.md` - Pedagogical framework & algorithms
- **Database Schema:** `prisma/schema.prisma` - Data models
- **Frontend Code:** `app/` - Next.js application

---

## Tech Stack Quick Reference

```
Frontend:        Next.js 15 + React + TypeScript + Tailwind CSS
Backend:         Next.js API Routes
Database:        PostgreSQL 18.4 + Prisma ORM
Authentication:  JWT (30-day) + bcryptjs
AI Services:     Claude API (Anthropic)
Deployment:      Railway (multi-region)
```

---

## Project Structure

```
wizlingo-reading-app/
├── app/
│   ├── api/                    # Backend API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── student/           # Student-specific APIs
│   │   ├── content/           # Content delivery
│   │   ├── curriculum/        # Curriculum management
│   │   ├── assessment/        # Assessment APIs
│   │   ├── gamification/      # XP, badges, leaderboard
│   │   └── admin/             # Admin operations
│   ├── auth/                  # Auth UI pages
│   │   ├── signup/page.tsx    # Registration form
│   │   └── login/page.tsx     # Login form
│   ├── dashboard/             # Student dashboard
│   ├── curriculum/            # Curriculum pages
│   ├── lesson/                # Lesson player
│   └── admin/                 # Admin panel (future)
├── lib/
│   ├── auth.ts               # JWT & password utilities
│   ├── prisma.ts             # Prisma client singleton
│   └── utils.ts              # Helper functions
├── prisma/
│   ├── schema.prisma         # Data models
│   └── migrations/           # DB migrations
├── public/                    # Static assets
│   ├── wiziingo-logo.svg
│   └── wiziingo-logo-white.svg
└── docs/
    ├── ARCHITECTURE.md       # System architecture
    ├── API_SPECIFICATION.md  # API reference
    ├── LEARNING_ENGINE.md    # Learning framework
    └── DEVELOPER_GUIDE.md    # This file
```

---

## Core Concepts

### Authentication Flow
```
1. User signs up (email/phone)
2. Password hashed with bcryptjs
3. Student + StudentProgress + JourneyProgress created
4. JWT token generated (30-day expiry)
5. Token stored in localStorage
6. Redirect to dashboard
```

### Learning Journey
```
Student starts at → SOUND_FOUNDATION/STAGE_1
          ↓
   Progress through lessons
          ↓
   Meet mastery criteria (80% on 5 lessons OR 75% avg on 10)
          ↓
   Advance to next stage
          ↓
   Continue through all 13 stages
          ↓
   Complete curriculum
```

### Stage Progression Logic
```
Advancement Criteria (choose ONE):
├─ 5 consecutive lessons with ≥80%
├─ 10 lessons with avg ≥75%
└─ 60 days elapsed (auto-advance)
```

---

## Common Development Tasks

### 1. Add New API Endpoint

**Steps:**
1. Create file: `app/api/[resource]/[action]/route.ts`
2. Import Prisma & auth utilities
3. Implement GET/POST/PUT handler
4. Add error handling
5. Update API_SPECIFICATION.md

**Example:**
```typescript
// app/api/content/lessons/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyStudentToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const payload = verifyStudentToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    
    // Your logic here
    const lessons = await prisma.lesson.findMany({
      where: { /* filters */ }
    })
    
    return NextResponse.json(lessons)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

### 2. Add New Frontend Page

**Steps:**
1. Create file: `app/[feature]/page.tsx`
2. Import useRouter, useState, useEffect
3. Add authentication check
4. Fetch data from APIs
5. Render UI with Tailwind

**Example:**
```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function FeaturePage() {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!mounted) return
    
    const fetchData = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth/login')
        return
      }
      
      const res = await fetch('/api/resource', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (res.ok) {
        setData(await res.json())
      }
      setLoading(false)
    }
    
    fetchData()
  }, [mounted, router])

  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      {/* Your UI */}
    </div>
  )
}
```

### 3. Add Database Migration

**Steps:**
1. Update `prisma/schema.prisma`
2. Run: `npx prisma db push`
3. Prisma client regenerates automatically

**Example:**
```prisma
model YourModel {
  id        String   @id @default(cuid())
  name      String
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 4. Add Gamification Logic

**Where:** Trigger after lesson completion
**What:** Award XP, check badges, update leaderboard

```typescript
// In lesson completion handler
const xpEarned = score >= 90 ? 150 : score >= 75 ? 100 : 50

// Update student XP
await prisma.student.update({
  where: { id: studentId },
  data: { totalXP: { increment: xpEarned } }
})

// Check badge criteria
const badges = await checkBadgeCriteria(studentId)

// Update leaderboard
await updateLeaderboard(studentId)
```

---

## Database Queries

### Get Student's Journey Progress
```typescript
const journey = await prisma.journeyProgress.findUnique({
  where: { studentId: studentId }
})
```

### Get Curriculum for Student's Stage
```typescript
const units = await prisma.curriculumUnit.findMany({
  where: {
    gradeCategory: student.gradeCategory,
    stage: journey.currentStage
  },
  include: { lessons: true }
})
```

### Get Lessons for Student
```typescript
const sessions = await prisma.lessonSession.findMany({
  where: { studentId: studentId },
  orderBy: { completedAt: 'desc' },
  include: { lesson: true }
})
```

### Get Leaderboard
```typescript
const leaderboard = await prisma.leaderboard.findMany({
  where: { student: { gradeCategory: 'GR_4_7' } },
  orderBy: { xpTotal: 'desc' },
  take: 100
})
```

---

## API Request Examples

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "password": "9876543210"
  }'
```

### Get Journey
```bash
TOKEN="your_jwt_token_here"
curl -X GET http://localhost:3000/api/student/journey \
  -H "Authorization: Bearer $TOKEN"
```

### Start Lesson
```bash
curl -X POST http://localhost:3000/api/lesson/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{ "lessonId": "lesson_456" }'
```

### Submit Lesson
```bash
curl -X POST http://localhost:3000/api/lesson/session_789/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "responses": {
      "question_1": "answer_a",
      "question_2": "answer_c"
    }
  }'
```

---

## Debugging Tips

### Enable Debug Logging
```typescript
// At top of file
const DEBUG = process.env.NODE_ENV === 'development'

if (DEBUG) console.log('Debug info:', data)
```

### Check Token Validity
```bash
# Decode JWT (use jwt.io or jq)
TOKEN="your_token"
echo $TOKEN | cut -d. -f2 | base64 -d | jq .
```

### View Database
```bash
# Using Prisma Studio
npx prisma studio

# Via Railway dashboard
# Go to Database tab → Postgres → Connect
```

### Check Server Logs
```bash
# Local development
tail -f /tmp/dev.log

# Railway dashboard
# Go to Service → Logs
```

---

## Performance Checklist

- [ ] Database queries use indexes
- [ ] API responses are paginated (if needed)
- [ ] Images are optimized (Next.js auto-optimizes)
- [ ] Client-side data fetching uses caching
- [ ] Long operations use background jobs (future)

---

## Security Checklist

- [ ] All API routes check authentication token
- [ ] Password hashing uses bcryptjs (10 rounds)
- [ ] JWT signed with strong secret
- [ ] Sensitive data not logged to console
- [ ] HTTPS enforced (Railway does this)
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints

---

## Testing Accounts

**B2C Test Account:**
```
Phone: 9908776808
UserID: WL591399
Password: 9908776808 (phone as password)
```

**B2B Test Account (Future):**
```
Email: test@school.com
Password: TestPass123
```

---

## Common Issues & Solutions

### Issue: "Token is undefined"
**Cause:** localStorage called on server-side  
**Solution:** Use `typeof window !== 'undefined'` check

### Issue: "CORS error"
**Cause:** Frontend & API on different origins  
**Solution:** Already handled by Railway same-origin setup

### Issue: "Database connection refused"
**Cause:** Wrong DATABASE_URL  
**Solution:** Check `.env.local` has correct Railway DB URL

### Issue: "Prisma client generation fails"
**Cause:** Schema syntax error  
**Solution:** Run `npx prisma generate` to see detailed error

---

## Useful Commands

```bash
# Development
npm run dev              # Start local dev server

# Database
npx prisma generate     # Regenerate Prisma client
npx prisma db push      # Push schema changes
npx prisma studio      # Visual database manager

# Deployment
npm run build           # Build for production
npm run start           # Start production server

# Linting (future)
npm run lint            # Check code quality
npm run test            # Run tests
```

---

## Code Style Guide

**File Naming:**
- Components: `PascalCase` (Button.tsx)
- Pages: `kebab-case` (signup.tsx)
- Utilities: `camelCase` (utils.ts)
- Types: `PascalCase` (interfaces.ts)

**Imports:**
```typescript
// 1. External packages
import React from 'react'
import { NextRequest } from 'next/server'

// 2. Internal utilities
import { prisma } from '@/lib/prisma'

// 3. Relative imports
import { MyComponent } from './components/MyComponent'
```

**Components:**
```typescript
'use client'  // Mark client components

export default function ComponentName() {
  return <div>Content</div>
}
```

---

## Resources

- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **TypeScript:** https://www.typescriptlang.org/docs
- **JWT.io:** https://jwt.io

---

## Getting Help

1. **Check docs first:** ARCHITECTURE.md, API_SPECIFICATION.md, LEARNING_ENGINE.md
2. **Review similar code:** Search for similar patterns
3. **Check Railway logs:** Service → Logs
4. **Test API with curl:** Verify endpoint works
5. **Ask team:** Slack or team meeting

---

**Last Updated:** June 30, 2026  
**Maintained By:** Development Team
