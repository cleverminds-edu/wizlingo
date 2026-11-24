# WizLingo API Specification

**Version:** 1.0  
**Last Updated:** June 30, 2026  
**Base URL:** `https://api.wizlingo.com`

## Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [Student APIs](#student-apis)
3. [Curriculum APIs](#curriculum-apis)
4. [Lesson APIs](#lesson-apis)
5. [Assessment APIs](#assessment-apis)
6. [Gamification APIs](#gamification-apis)
7. [Admin APIs](#admin-apis)
8. [Error Handling](#error-handling)

---

## Authentication APIs

### 1. POST /api/auth/signup
Register a new student account (B2B email or B2C phone)

**Request Body:**
```json
{
  "name": "string (required, 1-50 chars)",
  "email": "string (optional, email format, B2B only)",
  "password": "string (optional if phone, min 6 chars, B2B only)",
  "phone": "string (optional if email, exactly 10 digits, B2C only)",
  "gradeCategory": "enum (PREPRIMARY|GR_1_3|GR_4_7|GR_8_10|GR_11_12)",
  "dob": "string (ISO 8601 date, optional)"
}
```

**Response (201):**
```json
{
  "studentId": "string (cuid)",
  "userId": "string (WL + 6 digits, B2C only)",
  "token": "string (JWT, 30-day expiry)",
  "signupType": "enum (email|phone)",
  "message": "string"
}
```

**Error Responses:**
- `400` - Validation error (invalid email, phone, password)
- `409` - Account exists (email/phone already registered)
- `500` - Server error

**Example:**
```bash
curl -X POST https://api.wizlingo.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "9876543210",
    "gradeCategory": "GR_4_7"
  }'
```

---

### 2. POST /api/auth/login
Authenticate and get access token

**Request Body:**
```json
{
  "email": "string (optional if phone/userId)",
  "phone": "string (optional if email/userId, 10 digits)",
  "userId": "string (optional if email/phone, WL + 6 digits)",
  "password": "string (required)"
}
```

**Response (200):**
```json
{
  "token": "string (JWT)",
  "student": {
    "id": "string",
    "name": "string",
    "email": "string|null",
    "phone": "string|null",
    "userId": "string|null",
    "currentLevel": "number",
    "gradeCategory": "enum"
  }
}
```

**Error Responses:**
- `400` - Missing credentials
- `401` - Invalid credentials
- `500` - Server error

---

### 3. GET /api/auth/me
Get current authenticated user

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "string",
  "name": "string",
  "email": "string|null",
  "phone": "string|null",
  "userId": "string|null",
  "currentLevel": "number",
  "gradeCategory": "enum",
  "totalXP": "number",
  "streakDays": "number",
  "progress": {
    "id": "string",
    "readingLevel": "number",
    "speakingLevel": "number",
    "writingLevel": "number",
    "listeningLevel": "number",
    "avgReadingScore": "number",
    "avgSpeakingScore": "number",
    "avgWritingScore": "number",
    "avgListeningScore": "number"
  }
}
```

**Error Responses:**
- `401` - Unauthorized (invalid/missing token)
- `500` - Server error

---

## Student APIs

### 4. GET /api/student/journey
Get student's learning journey progress

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:** None

**Response (200):**
```json
{
  "id": "string",
  "studentId": "string",
  "currentPillar": "enum (SOUND_FOUNDATION|LANGUAGE_FOUNDATION|CORE_SKILLS|COMMUNICATION|HIGHER_ORDER_LANGUAGE)",
  "currentStage": "enum (STAGE_1...STAGE_13)",
  "stageProgress": "number (0-100)",
  "soundFoundationScore": "number (0-100)",
  "languageFoundationScore": "number (0-100)",
  "coreSkillsScore": "number (0-100)",
  "communicationScore": "number (0-100)",
  "higherOrderScore": "number (0-100)",
  "masteredStages": ["enum"],
  "completedAt": "string|null (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Journey not found (will auto-create)
- `500` - Server error

---

### 5. POST /api/student/journey/advance
Manually advance to next stage (admin only)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "studentId": "string",
  "nextStage": "enum"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Advances to next stage",
  "journey": { /* updated journey object */ }
}
```

---

## Curriculum APIs

### 6. GET /api/curriculum
List curriculum units for student's grade & stage

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
?gradeCategory=GR_4_7
&stage=STAGE_5
&pillar=CORE_SKILLS
```

**Response (200):**
```json
{
  "units": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "gradeCategory": "enum",
      "pillar": "enum",
      "stage": "enum",
      "skills": ["string"],
      "objectives": ["string"],
      "sequence": "number",
      "lessons": [
        {
          "id": "string",
          "title": "string",
          "description": "string",
          "estimatedMinutes": "number",
          "sequence": "number"
        }
      ]
    }
  ]
}
```

---

### 7. GET /api/curriculum/:unitId
Get detailed curriculum unit

**Response (200):**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "stage": "enum",
  "pillar": "enum",
  "skills": ["string"],
  "objectives": ["string"],
  "lessons": [
    {
      "id": "string",
      "title": "string",
      "sequence": "number",
      "contents": [
        {
          "id": "string",
          "type": "enum (LESSON|EXERCISE|ACTIVITY|ASSESSMENT)",
          "title": "string",
          "sequence": "number",
          "content": "object"
        }
      ]
    }
  ]
}
```

---

## Lesson APIs

### 8. POST /api/lesson/start
Begin a lesson session

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "lessonId": "string"
}
```

**Response (201):**
```json
{
  "sessionId": "string",
  "lessonId": "string",
  "lessonTitle": "string",
  "unitTitle": "string",
  "contents": [
    {
      "id": "string",
      "type": "enum (LESSON|EXERCISE|ACTIVITY|ASSESSMENT)",
      "title": "string",
      "sequence": "number",
      "content": "object"
    }
  ],
  "startedAt": "string (ISO 8601)",
  "estimatedDuration": "number (seconds)"
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Lesson not found
- `409` - Lesson already in progress

---

### 9. POST /api/lesson/:sessionId/submit
Submit lesson completion and responses

**Request Body:**
```json
{
  "responses": {
    "question_id_1": "answer_option_a",
    "question_id_2": "answer_option_c"
  },
  "completionNotes": "string (optional)"
}
```

**Response (200):**
```json
{
  "sessionId": "string",
  "lessonId": "string",
  "completedAt": "string (ISO 8601)",
  "durationSec": "number",
  "score": "number (0-100)",
  "passed": "boolean",
  "xpEarned": "number",
  "feedback": {
    "overall": "string",
    "strengths": ["string"],
    "areasForImprovement": ["string"],
    "nextSteps": ["string"]
  },
  "progressUpdate": {
    "stageProgress": "number",
    "canAdvanceStage": "boolean",
    "masteredStages": ["enum"]
  }
}
```

---

## Assessment APIs

### 10. POST /api/assessment/submit-writing
Submit writing response for AI evaluation

**Request Body:**
```json
{
  "sessionId": "string",
  "contentId": "string",
  "writingContent": "string"
}
```

**Response (200):**
```json
{
  "contentId": "string",
  "score": "number (0-100)",
  "analysis": {
    "grammar": "number (0-100)",
    "vocabulary": "number (0-100)",
    "coherence": "number (0-100)",
    "structure": "number (0-100)",
    "creativity": "number (0-100)"
  },
  "feedback": "string (AI-generated)",
  "corrections": [
    {
      "sentence": "string",
      "issue": "string",
      "suggestion": "string"
    }
  ]
}
```

---

### 11. POST /api/assessment/submit-recording
Submit audio recording for speech assessment

**Request Body (multipart/form-data):**
```
{
  "sessionId": "string",
  "contentId": "string",
  "audio": "binary (audio file)"
}
```

**Response (200):**
```json
{
  "contentId": "string",
  "audioUrl": "string",
  "score": "number (0-100)",
  "metrics": {
    "pronunciation": "number (0-100)",
    "fluency": "number (0-100)",
    "clarity": "number (0-100)",
    "pacing": "number (0-100)"
  },
  "transcript": "string",
  "feedback": "string"
}
```

---

## Gamification APIs

### 12. GET /api/gamification/xp
Get student XP balance

**Response (200):**
```json
{
  "totalXP": "number",
  "currentLevel": "number",
  "xpToNextLevel": "number",
  "progressToNextLevel": "number (0-100)",
  "badges": {
    "earned": "number",
    "total": "number"
  }
}
```

---

### 13. GET /api/gamification/badges
List earned and available badges

**Response (200):**
```json
{
  "earned": [
    {
      "id": "string",
      "type": "string (stage_mastery|streak_7day|etc)",
      "name": "string",
      "description": "string",
      "icon": "string (emoji or URL)",
      "unlockedAt": "string (ISO 8601)"
    }
  ],
  "available": [
    {
      "type": "string",
      "name": "string",
      "description": "string",
      "requirements": "string",
      "progress": "number (0-100)",
      "icon": "string"
    }
  ]
}
```

---

### 14. GET /api/gamification/leaderboard
Get global leaderboard

**Query Parameters:**
```
?limit=100
&offset=0
&period=all_time|monthly|weekly
```

**Response (200):**
```json
{
  "leaderboard": [
    {
      "rank": "number",
      "studentId": "string",
      "name": "string",
      "gradeCategory": "enum",
      "xpTotal": "number",
      "lessonsCompleted": "number",
      "streakDays": "number",
      "badges": "number"
    }
  ],
  "userPosition": {
    "rank": "number",
    "xpTotal": "number"
  },
  "totalParticipants": "number"
}
```

---

### 15. GET /api/gamification/leaderboard/class/:classId
Get class leaderboard (teacher view)

**Response (200):**
```json
{
  "className": "string",
  "leaderboard": [
    {
      "rank": "number",
      "studentName": "string",
      "xpTotal": "number",
      "currentStage": "enum",
      "lessonsCompleted": "number",
      "avgScore": "number"
    }
  ]
}
```

---

## Admin APIs

### 16. POST /api/admin/seed-curriculum
Seed curriculum data

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "message": "Curriculum seeded successfully",
  "created": "number",
  "skipped": "number",
  "total": "number"
}
```

---

### 17. POST /api/admin/seed-content
Seed sample content (passages, topics, prompts, clips)

**Response (200):**
```json
{
  "message": "Content seeded successfully",
  "passages": "number",
  "topics": "number",
  "prompts": "number",
  "clips": "number"
}
```

---

### 18. GET /api/admin/health
Health check endpoint

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "string (ISO 8601)",
  "services": {
    "database": "ok|error",
    "auth": "ok|error",
    "cache": "ok|error"
  }
}
```

---

## Error Handling

### Error Response Format
```json
{
  "error": "string (error message)",
  "statusCode": "number (HTTP status)",
  "timestamp": "string (ISO 8601)",
  "path": "string (API path)",
  "details": "string|object (optional, for debugging)"
}
```

### Common HTTP Status Codes
```
200 OK                    - Success
201 Created               - Resource created successfully
400 Bad Request           - Invalid input
401 Unauthorized          - Missing/invalid authentication
403 Forbidden             - Insufficient permissions
404 Not Found             - Resource not found
409 Conflict              - Resource already exists
422 Unprocessable Entity  - Validation failed
429 Too Many Requests     - Rate limit exceeded
500 Internal Server Error - Server error
503 Service Unavailable   - Maintenance/outage
```

### Validation Error Response
```json
{
  "error": "Validation failed",
  "statusCode": 422,
  "fields": {
    "email": "Invalid email format",
    "password": "Must be at least 6 characters"
  }
}
```

---

## Authentication

### Token Format
```
Authorization: Bearer <JWT_TOKEN>
```

### Token Structure
```json
{
  "studentId": "string",
  "iat": "number (issued at)",
  "exp": "number (expiry)"
}
```

### Token Expiry
- **Duration:** 30 days
- **Algorithm:** HS256
- **Secret:** Environment variable `JWT_SECRET`

---

## Rate Limiting

### Unauthenticated Endpoints
- **Limit:** 100 requests per hour per IP
- **Headers:**
  ```
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 95
  X-RateLimit-Reset: 1234567890
  ```

### Authenticated Endpoints
- **Limit:** 1000 requests per hour per user
- **Special Limits:**
  - Lesson submission: 1 per minute
  - Signup: 5 per minute per IP

---

## Pagination

### Query Parameters
```
?page=1
&limit=20
&sort=created_at:desc
```

### Response Format
```json
{
  "data": [],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "pages": "number"
  }
}
```

---

## Implementation Status

| API | Status | Notes |
|-----|--------|-------|
| Auth Signup | ✅ Complete | B2B & B2C flows working |
| Auth Login | ✅ Complete | Email, phone, UserID support |
| Auth Me | ✅ Complete | User profile retrieval |
| Student Journey | ✅ Complete | JourneyProgress tracking |
| Curriculum | 🟡 Partial | Units created, lessons in progress |
| Lesson Start | 🔴 Pending | Need lesson content player |
| Lesson Submit | 🔴 Pending | Need assessment engine |
| Assessment | 🔴 Pending | Claude API integration |
| Gamification | 🟡 Partial | XP & badges schema ready, logic pending |
| Admin APIs | ✅ Partial | Seeding complete, reporting pending |

---

**Next:** Implement remaining APIs in priority order
