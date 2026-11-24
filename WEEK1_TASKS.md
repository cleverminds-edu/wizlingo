# Week 1 Task Board - Lesson Player & Content APIs

**Sprint:** Fast-Track Beta (Week 1-2)  
**Goal:** Build functional lesson player with content APIs  
**Target Completion:** End of Week 2  
**Status:** 🔴 Not Started  

---

## Task Summary

| Task | Priority | Points | Assignee | Status |
|------|----------|--------|----------|--------|
| T1.1: Lesson Content API Design | P0 | 3 | Backend | 🔴 |
| T1.2: Create Lesson Start Endpoint | P0 | 5 | Backend | 🔴 |
| T1.3: Create Lesson Submit Endpoint | P0 | 5 | Backend | 🔴 |
| T1.4: Create Answer Validation Logic | P0 | 5 | Backend | 🔴 |
| T1.5: Create Lesson Player Component | P0 | 8 | Frontend | 🔴 |
| T1.6: Create Results/Feedback Screen | P0 | 5 | Frontend | 🔴 |
| T1.7: Integration Testing | P0 | 5 | QA | 🔴 |
| T1.8: Deploy to Staging | P1 | 3 | DevOps | 🔴 |

**Total Story Points:** 39  
**Estimated Days:** 8-10 days  
**Team Capacity:** 3-4 developers

---

## Detailed Tasks

### T1.1: Lesson Content API Design
**Priority:** P0 (Critical)  
**Points:** 3  
**Owner:** Backend Lead  
**Status:** 🔴 Not Started  

**Description:**
Design API contracts for lesson content serving. Define request/response schemas and error handling.

**Acceptance Criteria:**
- [ ] API specification documented (request/response examples)
- [ ] HTTP status codes defined (200, 400, 401, 404, 500)
- [ ] Error response format standardized
- [ ] Rate limiting rules defined
- [ ] Pagination (if applicable) designed
- [ ] Caching strategy documented

**Detailed Design:**

**GET /api/curriculum/lesson/:lessonId**

Request:
```
GET /api/curriculum/lesson/lesson_456
Headers:
  Authorization: Bearer <token>
Query:
  ?includeMetadata=true (optional)
```

Response (200):
```json
{
  "id": "lesson_456",
  "unitId": "unit_123",
  "title": "Reading Passage: The Adventure",
  "description": "Read and answer comprehension questions",
  "estimatedMinutes": 15,
  "difficulty": 2,
  "objectives": ["Read fluently", "Answer comprehension questions"],
  "contents": [
    {
      "id": "content_1",
      "type": "LESSON",
      "sequence": 1,
      "title": "Introduction",
      "content": {
        "text": "In this lesson, you will read a passage..."
      }
    },
    {
      "id": "content_2",
      "type": "EXERCISE",
      "sequence": 2,
      "title": "Read the Passage",
      "content": {
        "passage": "Once upon a time...",
        "questions": [
          {
            "id": "q1",
            "type": "multiple_choice",
            "question": "What is the main character's name?",
            "options": {
              "a": "John",
              "b": "Sarah",
              "c": "Michael",
              "d": "Emma"
            },
            "correctAnswer": "b",
            "explanation": "The passage says..."
          }
        ]
      }
    }
  ]
}
```

**Files Involved:**
- [ ] `LESSON_API_SPEC.md` - Detailed specification
- [ ] `docs/api/lesson-content.md` - Examples

**Dependencies:**
- Database schema finalized
- Prisma models defined

**Notes:**
- Use Prisma queries (don't write raw SQL)
- Include content filtering by student level
- Support partial content retrieval

---

### T1.2: Create Lesson Start Endpoint
**Priority:** P0 (Critical)  
**Points:** 5  
**Owner:** Backend Developer  
**Status:** 🔴 Not Started  
**Depends On:** T1.1

**Description:**
Implement POST /api/lesson/start endpoint that:
1. Validates lesson exists & is accessible to student
2. Creates LessonSession record
3. Returns lesson content with sessionId

**Code Location:** `app/api/lesson/start/route.ts`

**Implementation Checklist:**
- [ ] Create route file
- [ ] Implement auth check (JWT token)
- [ ] Validate lessonId exists
- [ ] Check student grade compatibility
- [ ] Create LessonSession in database
- [ ] Fetch lesson content
- [ ] Return formatted response
- [ ] Error handling (404, 401, 400)
- [ ] Logging for debugging

**Code Template:**

```typescript
// app/api/lesson/start/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyStudentToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'No token' }, { status: 401 })
    }

    const payload = verifyStudentToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // 2. Get request data
    const body = await request.json()
    const { lessonId } = body

    if (!lessonId) {
      return NextResponse.json({ error: 'Missing lessonId' }, { status: 400 })
    }

    // 3. Validate lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        unit: true,
        contents: { orderBy: { sequence: 'asc' } }
      }
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // 4. Get student & check compatibility
    const student = await prisma.student.findUnique({
      where: { id: payload.studentId },
      include: { journeyProgress: true }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // 5. Create session
    const session = await prisma.lessonSession.create({
      data: {
        studentId: student.id,
        lessonId: lessonId,
        startedAt: new Date()
      }
    })

    // 6. Return response
    return NextResponse.json({
      sessionId: session.id,
      lessonId: lesson.id,
      lesson: {
        title: lesson.title,
        description: lesson.description,
        estimatedMinutes: lesson.estimatedMinutes,
        contents: lesson.contents
      },
      startedAt: session.startedAt
    })
  } catch (error) {
    console.error('Error starting lesson:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Acceptance Criteria:**
- [ ] Endpoint callable with valid token
- [ ] Returns 401 without token
- [ ] Returns 404 if lesson doesn't exist
- [ ] Creates LessonSession record
- [ ] Response includes all required fields
- [ ] Error messages are clear
- [ ] Logs all errors for debugging

**Testing Script:**
```bash
# Get token first
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"9908776808","password":"9908776808"}' | jq -r '.token')

# Test lesson start
curl -X POST http://localhost:3000/api/lesson/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"lessonId":"lesson_456"}'
```

**Deployment:**
- [ ] Code review approval
- [ ] Merge to main
- [ ] Deploy to staging
- [ ] Verify in staging

---

### T1.3: Create Lesson Submit Endpoint
**Priority:** P0 (Critical)  
**Points:** 5  
**Owner:** Backend Developer  
**Status:** 🔴 Not Started  
**Depends On:** T1.2

**Description:**
Implement POST /api/lesson/:sessionId/submit endpoint that:
1. Validates session exists & belongs to student
2. Evaluates student answers
3. Calculates score
4. Saves responses & score
5. Awards XP
6. Returns feedback

**Code Location:** `app/api/lesson/[sessionId]/submit/route.ts`

**Implementation Checklist:**
- [ ] Create route file with dynamic segment
- [ ] Validate sessionId & ownership
- [ ] Validate all questions answered
- [ ] Calculate score (correct/total * 100)
- [ ] Save responses to database
- [ ] Save score to database
- [ ] Award XP to student
- [ ] Generate feedback based on score
- [ ] Return detailed response
- [ ] Mark session as completed

**Code Template:**

```typescript
// app/api/lesson/[sessionId]/submit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyStudentToken } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    // 1. Auth check
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyStudentToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    // 2. Get session
    const session = await prisma.lessonSession.findUnique({
      where: { id: params.sessionId },
      include: { lesson: { include: { contents: true } } }
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (session.studentId !== payload.studentId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // 3. Get student answers
    const body = await request.json()
    const { responses } = body

    if (!responses || typeof responses !== 'object') {
      return NextResponse.json({ error: 'Invalid responses format' }, { status: 400 })
    }

    // 4. Calculate score
    let correctCount = 0
    let totalQuestions = 0

    // Get all questions from lesson contents
    for (const content of session.lesson.contents) {
      if (content.type === 'EXERCISE' || content.type === 'ASSESSMENT') {
        const questions = content.content?.questions || []
        totalQuestions += questions.length

        for (const question of questions) {
          const studentAnswer = responses[question.id]
          if (studentAnswer === question.correctAnswer) {
            correctCount++
          }
        }
      }
    }

    const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0
    const xpEarned = score >= 90 ? 150 : score >= 75 ? 100 : 50

    // 5. Update session
    await prisma.lessonSession.update({
      where: { id: session.id },
      data: {
        completedAt: new Date(),
        score: score,
        passed: score >= 60,
        xpEarned: xpEarned,
        responses: JSON.stringify(responses),
        durationSec: Math.floor((new Date().getTime() - session.startedAt.getTime()) / 1000)
      }
    })

    // 6. Award XP
    await prisma.student.update({
      where: { id: payload.studentId },
      data: { totalXP: { increment: xpEarned } }
    })

    // 7. Generate feedback
    const feedback = generateFeedback(score, correctCount, totalQuestions)

    // 8. Return response
    return NextResponse.json({
      sessionId: session.id,
      score: Math.round(score),
      passed: score >= 60,
      correctCount,
      totalQuestions,
      xpEarned,
      feedback,
      completedAt: new Date()
    })
  } catch (error) {
    console.error('Error submitting lesson:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

function generateFeedback(score: number, correct: number, total: number): string {
  if (score >= 90) return `Excellent! You got ${correct}/${total} correct. Great work!`
  if (score >= 75) return `Good job! You got ${correct}/${total} correct. Keep practicing!`
  if (score >= 60) return `Fair attempt. You got ${correct}/${total} correct. Review the material and try again.`
  return `Keep trying. You got ${correct}/${total} correct. Review the content and attempt again.`
}
```

**Acceptance Criteria:**
- [ ] Validates session ownership
- [ ] Calculates score correctly
- [ ] Awards correct XP amount
- [ ] Saves responses & score
- [ ] Marks session completed
- [ ] Returns feedback message
- [ ] Updates student XP in database
- [ ] Error handling for invalid data

**Testing Script:**
```bash
TOKEN="<your_token>"
SESSION_ID="<session_from_start>"

curl -X POST http://localhost:3000/api/lesson/$SESSION_ID/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "responses": {
      "q1": "b",
      "q2": "c",
      "q3": "a"
    }
  }'
```

---

### T1.4: Create Answer Validation Logic
**Priority:** P0 (Critical)  
**Points:** 5  
**Owner:** Backend Developer  
**Status:** 🔴 Not Started  
**Depends On:** T1.1

**Description:**
Create reusable answer validation library that handles different question types.

**Code Location:** `lib/assessment/validator.ts`

**Implementation Checklist:**
- [ ] Create validator file
- [ ] Implement multiple_choice validation
- [ ] Implement text_match validation (future)
- [ ] Implement true_false validation
- [ ] Handle case-insensitive comparisons
- [ ] Return detailed validation results
- [ ] Unit test each validator

**Code Template:**

```typescript
// lib/assessment/validator.ts

export interface ValidationResult {
  isCorrect: boolean
  earnedPoints: number
  maxPoints: number
  feedback: string
}

export function validateAnswer(
  question: any,
  studentAnswer: string
): ValidationResult {
  switch (question.type) {
    case 'multiple_choice':
      return validateMultipleChoice(question, studentAnswer)
    case 'true_false':
      return validateTrueFalse(question, studentAnswer)
    case 'text_match':
      return validateTextMatch(question, studentAnswer)
    default:
      return {
        isCorrect: false,
        earnedPoints: 0,
        maxPoints: question.points || 1,
        feedback: 'Unknown question type'
      }
  }
}

function validateMultipleChoice(
  question: any,
  studentAnswer: string
): ValidationResult {
  const isCorrect = studentAnswer === question.correctAnswer
  
  return {
    isCorrect,
    earnedPoints: isCorrect ? question.points || 1 : 0,
    maxPoints: question.points || 1,
    feedback: isCorrect 
      ? 'Correct!'
      : `Incorrect. The correct answer is ${question.correctAnswer}.`
  }
}

function validateTrueFalse(
  question: any,
  studentAnswer: string
): ValidationResult {
  const normalizedAnswer = studentAnswer.toLowerCase() === 'true'
  const isCorrect = normalizedAnswer === (question.correctAnswer === 'true')
  
  return {
    isCorrect,
    earnedPoints: isCorrect ? question.points || 1 : 0,
    maxPoints: question.points || 1,
    feedback: isCorrect
      ? 'Correct!'
      : `Incorrect. The correct answer is ${question.correctAnswer}.`
  }
}

function validateTextMatch(
  question: any,
  studentAnswer: string
): ValidationResult {
  const normalizedStudent = studentAnswer.trim().toLowerCase()
  const normalizedCorrect = question.correctAnswer.trim().toLowerCase()
  const isCorrect = normalizedStudent === normalizedCorrect
  
  return {
    isCorrect,
    earnedPoints: isCorrect ? question.points || 1 : 0,
    maxPoints: question.points || 1,
    feedback: isCorrect
      ? 'Correct!'
      : `Incorrect. Expected: "${question.correctAnswer}"`
  }
}

// Unit tests
export function runValidatorTests() {
  const tests = [
    {
      name: 'Multiple choice correct',
      question: { type: 'multiple_choice', correctAnswer: 'b', points: 1 },
      answer: 'b',
      expected: true
    },
    {
      name: 'Multiple choice incorrect',
      question: { type: 'multiple_choice', correctAnswer: 'b', points: 1 },
      answer: 'a',
      expected: false
    }
  ]

  tests.forEach(test => {
    const result = validateAnswer(test.question, test.answer)
    const passed = result.isCorrect === test.expected
    console.log(`${passed ? '✓' : '✗'} ${test.name}`)
  })
}
```

**Acceptance Criteria:**
- [ ] Validates multiple choice answers
- [ ] Validates true/false answers
- [ ] Case-insensitive comparison
- [ ] Returns correct feedback
- [ ] Points calculated correctly
- [ ] Unit tests passing
- [ ] Extensible for future question types

---

### T1.5: Create Lesson Player Component
**Priority:** P0 (Critical)  
**Points:** 8  
**Owner:** Frontend Developer  
**Status:** 🔴 Not Started  
**Depends On:** T1.2

**Description:**
Build interactive lesson player component that displays lesson content and captures student answers.

**Code Location:** `app/lesson/[sessionId]/page.tsx`

**Features:**
- Display lesson content sequentially
- Show questions with multiple choice options
- Track student answers
- Show progress indicator
- Disable submit until all questions answered
- Loading states
- Error handling

**Implementation Checklist:**
- [ ] Create page file
- [ ] Add auth check
- [ ] Fetch lesson content on mount
- [ ] Implement content display
- [ ] Add question rendering
- [ ] Implement answer selection
- [ ] Add progress tracking
- [ ] Create submit button
- [ ] Add loading states
- [ ] Error handling & retry
- [ ] Mobile responsive design

**Component Structure:**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface LessonContent {
  id: string
  type: string
  title: string
  sequence: number
  content: any
}

interface Question {
  id: string
  type: string
  question: string
  options: Record<string, string>
  correctAnswer: string
}

export default function LessonPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.sessionId as string

  const [lesson, setLesson] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentContentIndex, setCurrentContentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch lesson content
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    const fetchLesson = async () => {
      try {
        const res = await fetch(`/api/lesson/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!res.ok) throw new Error('Failed to load lesson')

        const data = await res.json()
        setLesson(data)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading lesson')
        setLoading(false)
      }
    }

    fetchLesson()
  }, [sessionId, router])

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleNext = () => {
    if (currentContentIndex < lesson.contents.length - 1) {
      setCurrentContentIndex(currentContentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentContentIndex > 0) {
      setCurrentContentIndex(currentContentIndex - 1)
    }
  }

  const handleSubmit = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/lesson/${sessionId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ responses: answers })
      })

      if (!res.ok) throw new Error('Failed to submit lesson')

      const result = await res.json()
      
      // Store result & redirect to results page
      localStorage.setItem(`lesson_result_${sessionId}`, JSON.stringify(result))
      router.push(`/lesson/${sessionId}/results`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex justify-center p-8">Loading lesson...</div>
  if (error) return <div className="text-red-600 p-4">{error}</div>
  if (!lesson) return <div>Lesson not found</div>

  const currentContent = lesson.contents[currentContentIndex]
  const progress = ((currentContentIndex + 1) / lesson.contents.length) * 100
  const totalQuestions = lesson.contents.reduce(
    (count: number, c: LessonContent) => count + (c.content?.questions?.length || 0),
    0
  )
  const answeredQuestions = Object.keys(answers).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">{lesson.lesson.title}</h1>
            <span className="text-gray-500">{lesson.lesson.estimatedMinutes} min</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-600 mt-2">
            Step {currentContentIndex + 1} of {lesson.contents.length}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-8">
          {/* Title */}
          <h2 className="text-xl font-bold mb-4">{currentContent.title}</h2>

          {/* Lesson Content */}
          {currentContent.type === 'LESSON' && (
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700">{currentContent.content.text}</p>
            </div>
          )}

          {/* Exercise Content */}
          {(currentContent.type === 'EXERCISE' || currentContent.type === 'ASSESSMENT') && (
            <div className="mb-6">
              {currentContent.content.passage && (
                <div className="bg-gray-50 p-4 rounded mb-6 border-l-4 border-blue-500">
                  <p className="text-gray-700 leading-relaxed">
                    {currentContent.content.passage}
                  </p>
                </div>
              )}

              {/* Questions */}
              <div className="space-y-6">
                {currentContent.content.questions?.map((question: Question) => (
                  <div key={question.id} className="border-b pb-6">
                    <h3 className="font-semibold mb-3 text-gray-900">
                      {question.question}
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(question.options).map(([key, value]) => (
                        <label key={key} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name={question.id}
                            value={key}
                            checked={answers[question.id] === key}
                            onChange={() => handleAnswerChange(question.id, key)}
                            className="mr-3"
                          />
                          <span className="text-gray-700">{value}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentContentIndex === 0}
            className="px-6 py-2 bg-gray-300 text-gray-900 rounded-lg disabled:opacity-50"
          >
            ← Previous
          </button>

          <div className="text-gray-600">
            {answeredQuestions}/{totalQuestions} answered
          </div>

          {currentContentIndex === lesson.contents.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting || answeredQuestions < totalQuestions}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : '✓ Submit'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
```

**Acceptance Criteria:**
- [ ] Loads lesson content correctly
- [ ] Displays each content item sequentially
- [ ] Captures answer selections
- [ ] Shows progress indicator
- [ ] Previous/Next navigation works
- [ ] Submit button disabled until all answered
- [ ] Loading state shown
- [ ] Error messages displayed
- [ ] Mobile responsive

**Testing Scenarios:**
- [ ] Can navigate through lesson
- [ ] Answers are captured correctly
- [ ] Submit enabled only when complete
- [ ] Results page shown after submit
- [ ] Error handling works

---

### T1.6: Create Results/Feedback Screen
**Priority:** P0 (Critical)  
**Points:** 5  
**Owner:** Frontend Developer  
**Status:** 🔴 Not Started  
**Depends On:** T1.5, T1.3

**Description:**
Build results screen showing lesson score, XP earned, and feedback.

**Code Location:** `app/lesson/[sessionId]/results/page.tsx`

**Features:**
- Display score (X/Y correct)
- Show percentage
- Display XP earned
- Show feedback message
- Display pass/fail status
- Button to return to dashboard
- Option to retry (if failed)

**Component Structure:**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function ResultsPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.sessionId as string

  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(`lesson_result_${sessionId}`)
    if (stored) {
      setResult(JSON.parse(stored))
      localStorage.removeItem(`lesson_result_${sessionId}`)
    }
    setLoading(false)
  }, [sessionId])

  if (loading) return <div>Loading results...</div>
  if (!result) return <div>No results found</div>

  const statusColor = result.passed ? 'green' : 'red'
  const statusText = result.passed ? '✓ Passed' : '✗ Failed'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        {/* Status Icon */}
        <div className={`text-6xl text-center mb-4 ${result.passed ? 'text-green-500' : 'text-red-500'}`}>
          {result.passed ? '🎉' : '📚'}
        </div>

        {/* Title */}
        <h1 className={`text-3xl font-bold text-center mb-2 text-${statusColor}-600`}>
          {statusText}
        </h1>

        {/* Score */}
        <div className="text-center mb-6">
          <div className="text-5xl font-bold text-gray-900">
            {Math.round(result.score)}%
          </div>
          <div className="text-gray-600">
            {result.correctCount} out of {result.totalQuestions} correct
          </div>
        </div>

        {/* XP Earned */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⭐</span>
            <div>
              <div className="font-semibold">XP Earned</div>
              <div className="text-2xl font-bold text-yellow-600">+{result.xpEarned}</div>
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className="bg-blue-50 p-4 rounded mb-6">
          <p className="text-gray-700">{result.feedback}</p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
          
          {!result.passed && (
            <button
              onClick={() => router.push(`/lesson/${sessionId}`)}
              className="w-full py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
```

**Acceptance Criteria:**
- [ ] Displays score & percentage
- [ ] Shows correct/total count
- [ ] Displays XP earned
- [ ] Shows pass/fail status
- [ ] Displays feedback message
- [ ] Return to dashboard button works
- [ ] Retry button shown if failed
- [ ] Responsive design

---

### T1.7: Integration Testing
**Priority:** P0 (Critical)  
**Points:** 5  
**Owner:** QA Engineer  
**Status:** 🔴 Not Started  
**Depends On:** T1.2, T1.3, T1.5, T1.6

**Description:**
Test complete lesson flow from start to results.

**Test Plan:**

**Test Case 1: Happy Path**
```
1. Login with valid credentials
2. Navigate to lesson player
3. Start a lesson
4. Answer all questions (select correct answers)
5. Submit lesson
6. Verify score shows 100%
7. Verify XP awarded correctly
8. Verify redirect to results page
9. Verify "Return to Dashboard" button works
```

**Test Case 2: Partial Correct**
```
1. Start lesson
2. Answer some questions correctly, some wrong
3. Submit
4. Verify score calculated correctly
5. Verify feedback shown
```

**Test Case 3: All Wrong**
```
1. Start lesson
2. Answer all questions incorrectly
3. Submit
4. Verify score is 0%
5. Verify pass/fail status
6. Verify XP calculated correctly (should be 50)
7. Verify "Try Again" button shown
```

**Test Case 4: Auth Validation**
```
1. Try to access lesson without token
2. Verify redirect to login
3. Try to submit to another user's session
4. Verify 403 error
```

**Test Case 5: Error Handling**
```
1. Test with invalid lessonId
2. Verify 404 error
3. Test with invalid sessionId
4. Verify 404 error
5. Test network failure
6. Verify error message shown
```

**Acceptance Criteria:**
- [ ] All test cases pass
- [ ] No errors in console
- [ ] Database records created correctly
- [ ] XP awarded accurately
- [ ] Score calculation verified
- [ ] Auth checks working
- [ ] Error messages clear
- [ ] Mobile testing passed

**Test Execution:**
```bash
# Create test script: tests/lesson-flow.test.ts
npm test -- lesson-flow.test.ts

# Manual testing checklist:
# [ ] Test on Chrome
# [ ] Test on Firefox
# [ ] Test on Safari
# [ ] Test on mobile Chrome
# [ ] Test on slow network (Chrome DevTools throttling)
```

---

### T1.8: Deploy to Staging
**Priority:** P1 (Important)  
**Points:** 3  
**Owner:** DevOps Engineer  
**Status:** 🔴 Not Started  
**Depends On:** T1.7

**Description:**
Deploy Week 1 code to staging environment for final testing.

**Deployment Checklist:**
- [ ] Code review approved
- [ ] All tests passing
- [ ] Merge to `develop` branch
- [ ] Trigger CI/CD pipeline
- [ ] Verify build successful
- [ ] Run migrations
- [ ] Seed test curriculum & content
- [ ] Verify API endpoints responding
- [ ] Health check passing
- [ ] Performance baseline recorded

**Monitoring:**
- [ ] Error rate < 1%
- [ ] P95 response time < 500ms
- [ ] Database connections healthy
- [ ] No memory leaks

**Approval:**
- [ ] Product owner approves
- [ ] Ready for internal testing

---

## Summary & Metrics

### Week 1 Deliverables
```
✅ Lesson content APIs (start, submit)
✅ Answer validation logic
✅ Lesson player UI component
✅ Results/feedback screen
✅ Integration tests passing
✅ Deployed to staging
```

### Success Metrics
- All test cases passing: ✅
- Code review approved: ✅
- Staging deployment successful: ✅
- Performance meets targets: ✅
- Zero P0 bugs: ✅

### Handoff Criteria (to Week 2)
- [ ] Lesson player works end-to-end
- [ ] All APIs tested
- [ ] Staging stable (24h)
- [ ] Feedback from internal testers collected
- [ ] Ready for frontend integration with other features

---

## Status Tracking

**Update Daily:**
```markdown
## Daily Standup Template

**Date:** [Date]
**Attendees:** [Team members]

### Completed Today
- [ ] Task & what was done

### In Progress
- [ ] Task & blocker (if any)

### Planned Tomorrow
- [ ] Task

### Blockers
- None / [List any blockers]

### Notes
- [Any important notes]
```

---

## Risk & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| API design changes | Medium | High | Finalize T1.1 first, design review |
| Performance issues | Medium | High | Load test early, optimize queries |
| Auth issues | Low | Critical | Thorough testing, code review |
| Frontend complexity | Medium | Medium | Reusable components, testing |

---

## Next Steps

1. **Today:** Review this task board, assign tasks to team
2. **Monday:** Begin T1.1 (API design)
3. **Daily:** Update status, conduct standup
4. **Friday:** Code review all PRs, merge to develop
5. **Next Week:** Move to T1.5+ while T1.1-1.4 in review

---

**Task Board Created:** June 30, 2026  
**Sprint Start:** July 1, 2026  
**Target Completion:** July 12, 2026  
**Status:** 🔴 Ready to Begin
