# Lesson Content API Specification

**Task:** T1.1 - Lesson Content API Design  
**Status:** 🔄 In Progress  
**Owner:** Backend Lead  
**Points:** 3  
**Priority:** P0  

---

## Overview

This document defines the API contracts for serving lesson content. These APIs are the foundation for:
- T1.2: Lesson Start (creates session, returns content)
- T1.3: Lesson Submit (evaluates answers, saves responses)
- T1.5: Lesson Player (consumes these endpoints)

---

## API Endpoints Design

### 1. GET /api/curriculum/lessons/:lessonId

**Purpose:** Fetch lesson content for display in lesson player

**Request:**
```http
GET /api/curriculum/lessons/lesson_456
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**URL Parameters:**
```
lessonId (string, required) - UUID of lesson to retrieve
```

**Query Parameters (optional):**
```
?includeMetadata=true    - Include learning objectives
?includeAnswerKey=false  - Don't return correct answers (client-side security)
```

**Response (200 OK):**
```json
{
  "id": "lesson_456",
  "unitId": "unit_123",
  "title": "Reading Comprehension: The Adventure",
  "description": "Read a passage and answer comprehension questions",
  "estimatedMinutes": 15,
  "difficulty": 2,
  "topic": "Reading Fluency",
  "objectives": [
    "Read passages with fluency",
    "Answer comprehension questions",
    "Identify main ideas"
  ],
  "contents": [
    {
      "id": "content_1",
      "type": "LESSON",
      "sequence": 1,
      "title": "Introduction to Reading",
      "content": {
        "text": "In this lesson, you will read a short story...",
        "metadata": {
          "estimatedMinutes": 3,
          "hasAudio": false
        }
      }
    },
    {
      "id": "content_2",
      "type": "EXERCISE",
      "sequence": 2,
      "title": "Read & Comprehend",
      "content": {
        "passage": "Once upon a time, in a small village...",
        "passageMetadata": {
          "wordCount": 250,
          "readingLevel": 2,
          "estimatedReadTime": 6
        },
        "questions": [
          {
            "id": "q1",
            "type": "multiple_choice",
            "sequence": 1,
            "question": "What is the main character's name?",
            "options": {
              "a": "John",
              "b": "Sarah",
              "c": "Michael",
              "d": "Emma"
            },
            "points": 1,
            "explanation": "The passage says 'Sarah walked through the forest...'",
            "correctAnswer": "b"
          },
          {
            "id": "q2",
            "type": "multiple_choice",
            "sequence": 2,
            "question": "Why did the character go to the forest?",
            "options": {
              "a": "To find treasure",
              "b": "To escape the village",
              "c": "To gather berries",
              "d": "To meet a friend"
            },
            "points": 1,
            "explanation": "According to the passage...",
            "correctAnswer": "c"
          }
        ]
      }
    },
    {
      "id": "content_3",
      "type": "ASSESSMENT",
      "sequence": 3,
      "title": "Final Check",
      "content": {
        "questions": [
          {
            "id": "q3",
            "type": "multiple_choice",
            "question": "What is the main idea of this passage?",
            "options": {
              "a": "Adventure and discovery",
              "b": "Friendship and trust",
              "c": "Overcoming fears",
              "d": "Finding home"
            },
            "points": 2,
            "correctAnswer": "a"
          }
        ]
      }
    }
  ],
  "metadata": {
    "createdAt": "2026-06-30T10:00:00Z",
    "updatedAt": "2026-06-30T10:00:00Z",
    "version": "1.0"
  }
}
```

**Error Responses:**

```http
401 Unauthorized
{
  "error": "Invalid or missing token",
  "statusCode": 401
}
```

```http
404 Not Found
{
  "error": "Lesson not found",
  "statusCode": 404,
  "lessonId": "lesson_456"
}
```

```http
403 Forbidden
{
  "error": "Student does not have access to this lesson",
  "statusCode": 403,
  "reason": "Student grade category does not match lesson requirement"
}
```

---

### 2. POST /api/lesson/session/start

**Purpose:** Initialize a lesson session and return lesson content

**Request:**
```http
POST /api/lesson/session/start
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "lessonId": "lesson_456"
}
```

**Request Body:**
```json
{
  "lessonId": "string (required) - UUID of lesson",
  "attemptNumber": "number (optional, default 1) - For retry tracking"
}
```

**Response (201 Created):**
```json
{
  "sessionId": "session_789",
  "lessonId": "lesson_456",
  "studentId": "student_123",
  "lesson": {
    "title": "Reading Comprehension: The Adventure",
    "estimatedMinutes": 15,
    "contents": [
      {
        "id": "content_1",
        "type": "LESSON",
        "sequence": 1,
        "title": "Introduction to Reading",
        "content": { /* ... */ }
      }
      /* ... other contents ... */
    ]
  },
  "startedAt": "2026-06-30T10:00:00Z",
  "expiresAt": "2026-06-30T10:30:00Z"
}
```

**Error Responses:**
```http
400 Bad Request
{
  "error": "Missing required field: lessonId",
  "statusCode": 400
}
```

```http
404 Not Found
{
  "error": "Lesson not found",
  "statusCode": 404
}
```

```http
409 Conflict
{
  "error": "Session already exists for this lesson",
  "statusCode": 409,
  "existingSessionId": "session_789"
}
```

---

### 3. POST /api/lesson/session/:sessionId/submit

**Purpose:** Submit lesson responses and get evaluation

**Request:**
```http
POST /api/lesson/session/session_789/submit
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "responses": {
    "q1": "b",
    "q2": "c",
    "q3": "a"
  }
}
```

**Request Body:**
```json
{
  "responses": {
    "questionId": "answer"
  },
  "completionNotes": "string (optional) - Student notes"
}
```

**Response (200 OK):**
```json
{
  "sessionId": "session_789",
  "lessonId": "lesson_456",
  "studentId": "student_123",
  "score": 85,
  "maxScore": 100,
  "passed": true,
  "correctCount": 2,
  "totalQuestions": 3,
  "xpEarned": 100,
  "responses": {
    "q1": {
      "studentAnswer": "b",
      "correctAnswer": "b",
      "isCorrect": true,
      "points": 1,
      "earnedPoints": 1
    },
    "q2": {
      "studentAnswer": "c",
      "correctAnswer": "c",
      "isCorrect": true,
      "points": 1,
      "earnedPoints": 1
    },
    "q3": {
      "studentAnswer": "d",
      "correctAnswer": "a",
      "isCorrect": false,
      "points": 2,
      "earnedPoints": 0
    }
  },
  "feedback": {
    "overall": "Great job! You got 2 out of 3 questions correct.",
    "encouragement": "You're doing well with reading comprehension!",
    "nextSteps": "Review the main idea identification technique for the next lesson."
  },
  "completion": {
    "startedAt": "2026-06-30T10:00:00Z",
    "submittedAt": "2026-06-30T10:10:00Z",
    "durationSeconds": 600
  },
  "progressUpdate": {
    "stageProgress": 45,
    "canAdvanceStage": false,
    "nextMilestone": "5 lessons mastered (currently 2/5)"
  }
}
```

**Error Responses:**
```http
400 Bad Request
{
  "error": "Invalid response format",
  "statusCode": 400,
  "details": "Question 'q1' has invalid answer 'x' (valid: a, b, c, d)"
}
```

```http
404 Not Found
{
  "error": "Session not found or expired",
  "statusCode": 404
}
```

```http
409 Conflict
{
  "error": "Session already submitted",
  "statusCode": 409,
  "submittedAt": "2026-06-30T10:05:00Z"
}
```

---

## HTTP Status Codes

| Code | Meaning | When to Use |
|------|---------|------------|
| **2xx Success** | | |
| 200 | OK | Successful GET or POST (general) |
| 201 | Created | Successful POST creating resource |
| 204 | No Content | Successful DELETE |
| **4xx Client Error** | | |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Authenticated but no access |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation failed |
| **5xx Server Error** | | |
| 500 | Internal Server Error | Unhandled server error |
| 503 | Service Unavailable | Maintenance/overload |

---

## Error Response Format

**Standard error response** (all endpoints):
```json
{
  "error": "string - Human-readable error message",
  "statusCode": "number - HTTP status code",
  "timestamp": "ISO 8601 - When error occurred",
  "path": "string - API path that errored",
  "requestId": "string - For debugging",
  "details": "object (optional) - Additional error context"
}
```

---

## Authentication

### JWT Token Requirements
```
Header: Authorization: Bearer <token>
Token: JWT (HS256 signed)
Expiry: 30 days
Issued by: POST /api/auth/login
```

### Token Validation
- Check token present in Authorization header
- Validate JWT signature
- Check expiry (if expired, return 401)
- Extract studentId from token claims
- Verify student exists in database

---

## Rate Limiting

```
Unauthenticated Requests:
  ├─ Limit: 100 requests/hour per IP
  └─ Headers:
     ├─ X-RateLimit-Limit: 100
     ├─ X-RateLimit-Remaining: 95
     └─ X-RateLimit-Reset: <unix_timestamp>

Authenticated Requests:
  ├─ Limit: 1000 requests/hour per user
  ├─ Lesson Start: 1 per minute per session
  └─ Lesson Submit: 1 per minute per session
```

**Rate Limit Headers (all responses):**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1625097600
X-RateLimit-Retry-After: 60 (if rate limited)
```

---

## Caching Strategy

### Client-Side Caching
```
GET /api/curriculum/lessons/:lessonId
├─ Cache-Control: max-age=3600 (1 hour)
├─ ETag: <hash_of_content>
└─ Last-Modified: <timestamp>

Caching scenarios:
├─ First load: Fetch fresh
├─ Within 1 hour: Return cached
└─ After 1 hour: Revalidate with ETag
```

### Server-Side Caching (Future)
```
Redis cache:
├─ Lesson content: 24 hours TTL
├─ User progress: 5 minutes TTL
└─ Leaderboard: 1 hour TTL
```

---

## Pagination (Future Enhancement)

```json
GET /api/curriculum/lessons?page=1&limit=20

Response:
{
  "data": [ /* array of lessons */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "hasNextPage": true
  }
}
```

---

## Content Type Handling

**Supported Content Types:**

| Type | Description | Structure |
|------|-------------|-----------|
| LESSON | Instructional content | `{ text: string }` |
| EXERCISE | Practice problems | `{ passage?, questions[] }` |
| ACTIVITY | Interactive activity | `{ instructions, assets[] }` |
| ASSESSMENT | Graded assessment | `{ questions[], passingScore }` |

---

## Data Validation Rules

### Question Validation
```
- id: required, UUID format
- type: required, one of [multiple_choice, true_false, text_match]
- question: required, non-empty string
- options: required for multiple_choice
- correctAnswer: required, must match available options
- points: optional, default 1
```

### Response Validation
```
- questionId: must match existing question
- answer: must be valid for question type
- answer length: max 1000 characters
- response time: min 1 second, max session duration
```

---

## Examples

### Example 1: Simple Reading Lesson
```json
{
  "id": "lesson_001",
  "title": "Reading: The Ant and the Grasshopper",
  "difficulty": 1,
  "estimatedMinutes": 12,
  "contents": [
    {
      "type": "LESSON",
      "title": "Meet the Characters",
      "content": {
        "text": "Today we'll read about an ant and a grasshopper..."
      }
    },
    {
      "type": "EXERCISE",
      "title": "Read and Comprehend",
      "content": {
        "passage": "An ant and a grasshopper...",
        "questions": [
          {
            "id": "q1",
            "type": "multiple_choice",
            "question": "What is the ant doing?",
            "options": {
              "a": "Playing music",
              "b": "Gathering food",
              "c": "Sleeping",
              "d": "Dancing"
            },
            "correctAnswer": "b"
          }
        ]
      }
    }
  ]
}
```

---

## Design Decisions

### 1. Why Session-Based?
**Decision:** Each lesson start creates a session  
**Reason:** Allows tracking of multiple attempts, completion time, and revision history

### 2. Why Separate Answer Keys?
**Decision:** `correctAnswer` not sent to client by default  
**Reason:** Prevents cheating in browser DevTools; returned only in submission response

### 3. Why JSON Responses?
**Decision:** All responses are JSON (not HTML, XML, etc.)  
**Reason:** Consistent format, easy parsing, works with mobile & web

### 4. Why Points per Question?
**Decision:** Questions can have different point values  
**Reason:** Allows weighting harder questions higher (e.g., main idea = 2 pts, detail = 1 pt)

---

## Security Considerations

1. **Token Validation:** Always validate JWT before returning any data
2. **Student Isolation:** Verify student owns session before submission
3. **Answer Concealment:** Don't return correct answers until after submission
4. **Rate Limiting:** Prevent brute-force attempts
5. **Input Validation:** Sanitize all user inputs
6. **Timeout:** Lesson sessions expire after 30 minutes

---

## Acceptance Criteria Checklist

- [x] API specification documented
- [x] HTTP status codes defined
- [x] Error response format standardized
- [x] Rate limiting rules defined
- [x] Pagination (future) designed
- [x] Caching strategy documented

---

## Next Steps

✅ **T1.1 Complete** - API design finalized  
→ **T1.2** - Implement GET /api/curriculum/lessons/:lessonId  
→ **T1.3** - Implement POST /api/lesson/session/:sessionId/submit  

---

**Spec Version:** 1.0  
**Last Updated:** June 30, 2026  
**Status:** Ready for Implementation
