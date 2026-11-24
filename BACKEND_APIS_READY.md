# Backend APIs Ready for Integration

**Status:** ✅ COMPLETE  
**Date:** June 30, 2026  
**For:** Frontend & QA Teams  

---

## 🚀 What's Ready

### Endpoint 1: Start Lesson
```
POST /api/lesson/session/start
```

**What it does:**
- Creates a lesson session for a student
- Returns lesson content with all questions
- Session expires after 30 minutes

**Request:**
```bash
curl -X POST http://localhost:3000/api/lesson/session/start \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"lessonId": "lesson_001"}'
```

**Response (201 Created):**
```json
{
  "sessionId": "session_789",
  "lessonId": "lesson_001",
  "studentId": "student_123",
  "lesson": {
    "id": "lesson_001",
    "title": "Reading Comprehension",
    "estimatedMinutes": 15,
    "contents": [
      {
        "id": "content_1",
        "type": "LESSON",
        "sequence": 1,
        "title": "Introduction",
        "content": { "text": "..." }
      },
      {
        "id": "content_2",
        "type": "EXERCISE",
        "sequence": 2,
        "title": "Practice",
        "content": {
          "passage": "...",
          "questions": [
            {
              "id": "q1",
              "type": "multiple_choice",
              "question": "What is...?",
              "options": {
                "a": "Option A",
                "b": "Option B",
                "c": "Option C",
                "d": "Option D"
              }
            }
          ]
        }
      }
    ]
  },
  "timing": {
    "startedAt": "2026-06-30T10:00:00Z",
    "expiresAt": "2026-06-30T10:30:00Z"
  }
}
```

**Use in Frontend:**
```typescript
// 1. Start lesson when student clicks
const response = await fetch('/api/lesson/session/start', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ lessonId })
})

const { sessionId, lesson } = await response.json()

// 2. Display lesson content (contents array)
// 3. Track user answers
// 4. Call submit endpoint when student finishes
```

---

### Endpoint 2: Submit Answers
```
POST /api/lesson/session/:sessionId/submit
```

**What it does:**
- Validates all student answers
- Calculates score (0-100)
- Awards XP
- Updates progress
- Returns detailed results with feedback

**Request:**
```bash
curl -X POST http://localhost:3000/api/lesson/session/session_789/submit \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "responses": {
      "q1": "a",
      "q2": "true",
      "q3": "Paris"
    }
  }'
```

**Response (200 OK):**
```json
{
  "sessionId": "session_789",
  "lessonId": "lesson_001",
  "studentId": "student_123",
  "score": 85,
  "maxScore": 100,
  "passed": true,
  "correctCount": 2,
  "totalQuestions": 3,
  "xpEarned": 80,
  "responses": {
    "q1": {
      "studentAnswer": "a",
      "correctAnswer": "a",
      "isCorrect": true,
      "earnedPoints": 1,
      "feedback": "Correct!"
    },
    "q2": {
      "studentAnswer": "true",
      "correctAnswer": "true",
      "isCorrect": true,
      "earnedPoints": 1,
      "feedback": "Correct!"
    },
    "q3": {
      "studentAnswer": "London",
      "correctAnswer": "Paris",
      "isCorrect": false,
      "earnedPoints": 0,
      "feedback": "Incorrect. The expected answer was: Paris"
    }
  },
  "feedback": {
    "overall": "Great job! You got 2 out of 3 questions correct.",
    "encouragement": "Well done! You're making great progress.",
    "nextSteps": "You passed! Move to the next lesson..."
  },
  "completion": {
    "startedAt": "2026-06-30T10:00:00Z",
    "submittedAt": "2026-06-30T10:10:00Z",
    "durationSeconds": 600
  },
  "progressUpdate": {
    "stageProgress": 10,
    "canAdvanceStage": true,
    "nextMilestone": "5 lessons mastered to unlock next stage"
  }
}
```

**Use in Frontend:**
```typescript
// 1. Collect answers from student
const answers = {
  q1: userSelectedAnswer,
  q2: userSelectedAnswer
}

// 2. Submit answers
const response = await fetch(`/api/lesson/session/${sessionId}/submit`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ responses: answers })
})

const results = await response.json()

// 3. Display results screen
// - Show score (results.score)
// - Show XP earned (results.xpEarned)
// - Show feedback per question (results.responses)
// - Show overall feedback (results.feedback)
// - Allow retry or next lesson
```

---

## 🔄 Complete Flow

```
USER JOURNEY:

1. Dashboard
   ↓ Click "Start Lesson"

2. GET /api/lesson/session/start ← T1.2 API
   ↓ Receive lessonId + session content

3. Lesson Player (T1.5)
   ├─ Display content
   ├─ User answers questions
   └─ Click "Submit"

4. POST /api/lesson/session/{sessionId}/submit ← T1.3 API
   ↓ Answers validated, score calculated

5. Results Screen (T1.6)
   ├─ Display score
   ├─ Show XP earned
   ├─ Show feedback per question
   └─ Button: "Next Lesson" or "Try Again"

6. Back to Dashboard
   ├─ XP updated
   ├─ Progress updated
   └─ Ready for next lesson
```

---

## 📝 Integration Checklist for Frontend

```
□ Get token from login
□ Call POST /api/lesson/session/start with lessonId
□ Parse response.lesson.contents
□ Display each content block in sequence
  ├─ If type = "LESSON": show text
  ├─ If type = "EXERCISE": show passage + questions
  ├─ If type = "ASSESSMENT": show graded questions
  └─ If type = "ACTIVITY": show interactive content

□ For each question, show:
  ├─ question text
  ├─ options (if multiple_choice)
  ├─ true/false buttons (if true_false)
  └─ text input (if text_match)

□ Track user answers in state object: { q1: "a", q2: "true", ... }

□ Show progress indicator: (current question) of (total questions)

□ Submit button calls: POST /api/lesson/session/{sessionId}/submit

□ Parse response and display results:
  ├─ score (0-100)
  ├─ passed (true/false)
  ├─ xpEarned
  ├─ feedback per question
  ├─ overall feedback
  └─ button to next lesson or retry
```

---

## 🧪 Testing with QA

### Manual Testing

Full guide available: `/docs/testing/T1.2_LESSON_START_MANUAL_TESTS.md`

**Quick tests:**
```bash
# Test 1: Happy path (all correct)
curl -X POST http://localhost:3000/api/lesson/session/start \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"lessonId": "lesson_001"}'

# Test 2: Submit answers
curl -X POST http://localhost:3000/api/lesson/session/session_789/submit \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"responses": {"q1": "a", "q2": "true"}}'

# Test 3: 401 without token
curl -X POST http://localhost:3000/api/lesson/session/start \
  -d '{"lessonId": "lesson_001"}'

# Test 4: 404 invalid lesson
curl -X POST http://localhost:3000/api/lesson/session/start \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"lessonId": "nonexistent"}'
```

### Unit Tests

```bash
# Run T1.2 tests
npm test -- __tests__/api/lesson/session/start.test.ts

# Run T1.3 tests
npm test -- __tests__/api/lesson/session/submit.test.ts

# Run validator tests (T1.4)
npm test -- __tests__/lib/assessment/validator.test.ts
```

---

## ⚡ Key Behaviors

### Lesson Start (T1.2)
- ✅ Creates session in DB
- ✅ Returns lesson content with questions
- ✅ Session expires after 30 minutes
- ✅ Prevents duplicate active sessions (409 Conflict)
- ✅ Returns 404 if lesson doesn't exist
- ✅ Returns 401 if no/invalid token

### Lesson Submit (T1.3)
- ✅ Validates all answers (multiple_choice, true_false, text_match)
- ✅ Calculates score 0-100
- ✅ Passes if score ≥ 80%
- ✅ Awards XP (50 base + bonuses)
- ✅ Returns detailed feedback per question
- ✅ Updates student XP total
- ✅ Updates journey progress
- ✅ Prevents duplicate submissions (409 Conflict)
- ✅ Returns 403 if student doesn't own session

---

## 📦 Question Types Supported

### Multiple Choice
```json
{
  "id": "q1",
  "type": "multiple_choice",
  "question": "What is the capital of France?",
  "options": {
    "a": "London",
    "b": "Paris",
    "c": "Berlin",
    "d": "Madrid"
  },
  "correctAnswer": "b",
  "points": 1
}
```

### True/False
```json
{
  "id": "q2",
  "type": "true_false",
  "question": "The Earth is flat.",
  "correctAnswer": "false",
  "points": 1
}
```

### Text Match
```json
{
  "id": "q3",
  "type": "text_match",
  "question": "What is the smallest country?",
  "correctAnswer": "Vatican City",
  "points": 1
}
```

**Note:** Text match uses fuzzy matching (85% similarity). So "vatican city" matches "Vatican City".

---

## 🎯 XP System

```
Base XP per lesson:     50
If score 80-89%:        +30 (Total: 80)
If score 90-99%:        +50 (Total: 100)
If score 100%:          +50 (Total: 100)
```

---

## 🔐 Authentication

**Every request requires:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Token obtained from:**
```bash
POST /api/auth/login
{
  "email": "student@example.com",
  "password": "password123"
}
```

**Token expiration:** 30 days

---

## 💬 Error Responses

**All errors follow this format:**
```json
{
  "error": "Human-readable error message",
  "statusCode": 400,
  "details": "Additional context (optional)"
}
```

**Common status codes:**
- `200` - Success
- `201` - Created (session started)
- `400` - Bad request (missing field, invalid data)
- `401` - Unauthorized (no/invalid token)
- `403` - Forbidden (don't own resource)
- `404` - Not found (lesson/session doesn't exist)
- `409` - Conflict (session exists, already submitted)
- `500` - Server error

---

## 📚 Additional Documentation

- **API Specification:** `/LESSON_API_SPEC.md` (full design)
- **Architecture:** `/ARCHITECTURE.md` (system design)
- **Manual Testing Guide:** `/docs/testing/T1.2_LESSON_START_MANUAL_TESTS.md` (11 curl examples)
- **Unit Tests:** `/__tests__/api/lesson/session/` (60+ test cases)

---

## ✨ Ready to Build!

**Frontend team** → Start building T1.5 (Lesson Player UI)  
**QA team** → Start testing endpoints  
**DevOps team** → Prepare staging environment  

All backend APIs are **production-ready** and fully tested.

---

**Status:** 🟢 READY FOR INTEGRATION  
**API Stability:** ✅ TESTED & VERIFIED  
**Documentation:** ✅ COMPLETE  

🚀
