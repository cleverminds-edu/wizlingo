# Local Testing Guide - Before Staging Deployment

**Purpose:** Verify complete end-to-end system locally before deploying to staging  
**Estimated Time:** 2-3 hours  
**Prerequisites:** Node.js, PostgreSQL (local or Docker), git  

---

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Clone/pull latest code
git checkout develop
git pull origin develop

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << 'EOF'
DATABASE_URL="postgresql://user:password@localhost:5432/wizlingo_local"
JWT_SECRET="local-test-secret-key-change-in-production"
NODE_ENV="development"
API_URL="http://localhost:3000"
ENABLE_DEBUG=true
EOF

# Setup local database
npx prisma migrate deploy

# Seed test data
npx prisma db seed
```

### 2. Start Application
```bash
# Development mode with hot reload
npm run dev

# Opens on http://localhost:3000
# Watch for: "Server running on port 3000"
```

### 3. Run Tests
```bash
# Terminal 2: Run all tests
npm test

# Or specific tests:
npm test -- lesson.test.ts
npm test -- validator.test.ts
npm test -- integration
```

---

## ✅ Complete Local Testing Checklist

### Phase 1: Setup & Configuration (15 min)

```bash
□ Database connection works
  npx prisma db push --skip-generate
  npx prisma studio  # Opens UI at http://localhost:5555

□ Environment variables set correctly
  cat .env.local | grep DATABASE_URL
  
□ Application starts without errors
  npm run dev
  # Look for: "✓ Server running on port 3000"
  
□ Health endpoint responds
  curl http://localhost:3000/api/health
  # Expected: 200 OK
```

### Phase 2: Authentication Tests (20 min)

```bash
□ Create test account
  curl -X POST http://localhost:3000/api/auth/signup \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Test User",
      "email": "test@local.test",
      "password": "TestPass123!",
      "gradeCategory": "GR_1_3"
    }'
  # Expected: 201 Created with token
  # Save: TOKEN=<returned_token>

□ Login works
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@local.test",
      "password": "TestPass123!"
    }'
  # Expected: 200 OK with token

□ Protected endpoint requires token
  curl http://localhost:3000/api/student/journey
  # Expected: 401 Unauthorized
  
  curl -H "Authorization: Bearer $TOKEN" \
    http://localhost:3000/api/student/journey
  # Expected: 200 OK with journey data
```

### Phase 3: Database Tests (10 min)

```bash
□ Test data exists
  npx prisma studio
  # Check tables: Student, Lesson, LessonContent, LessonSession

□ Relationships work
  # Student has JourneyProgress
  # Lesson has LessonContent
  # Student can create LessonSession

□ Indexes work
  npx prisma db push --skip-generate
  # Should show indexes created
```

### Phase 4: T1.2 Tests - Lesson Start (20 min)

```bash
□ Get lesson ID
  npx prisma studio
  # Navigate to Lesson table, copy first lesson ID
  # Save: LESSON_ID=<lesson_id>

□ Start lesson with valid data
  curl -X POST http://localhost:3000/api/lesson/session/start \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"lessonId": "'$LESSON_ID'"}'
  # Expected: 201 Created
  # Save: SESSION_ID=<sessionId>

□ Verify response format
  # Should include: sessionId, lessonId, lesson, timing
  # lesson should have: id, title, contents[]
  # contents should be ordered by sequence

□ Test error cases
  # Without token: expect 401
  curl -X POST http://localhost:3000/api/lesson/session/start \
    -H "Content-Type: application/json" \
    -d '{"lessonId": "'$LESSON_ID'"}'

  # Invalid lesson: expect 404
  curl -X POST http://localhost:3000/api/lesson/session/start \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"lessonId": "invalid"}'

  # Duplicate session: expect 409
  curl -X POST http://localhost:3000/api/lesson/session/start \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"lessonId": "'$LESSON_ID'"}'
  # Run twice
```

### Phase 5: T1.3 & T1.4 Tests - Submit & Validate (30 min)

```bash
□ Submit with all correct answers
  curl -X POST http://localhost:3000/api/lesson/session/$SESSION_ID/submit \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "responses": {
        "q1": "a",
        "q2": "true",
        "q3": "answer"
      }
    }'
  # Expected: 200 OK
  # Check: score=100, passed=true, xpEarned>0

□ Verify scoring logic
  # All correct: score=100
  # 2 of 3 correct: score=66
  # 0 correct: score=0

□ Verify XP calculation
  # 100% score: 50 base + 50 bonus = 100 XP
  # 80-89%: 50 base + 30 bonus = 80 XP
  # <80%: 50 base only = 50 XP

□ Test validation with different question types
  # Multiple choice
  curl ... -d '{"responses": {"q1": "b"}}'
  
  # True/false
  curl ... -d '{"responses": {"q2": "false"}}'
  
  # Text match (case insensitive)
  curl ... -d '{"responses": {"q3": "Answer"}}'

□ Test error cases
  # Invalid answer: expect 400
  curl -X POST http://localhost:3000/api/lesson/session/$SESSION_ID/submit \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"responses": {"q1": "invalid"}}'

  # Session not found: expect 404
  curl -X POST http://localhost:3000/api/lesson/session/fake/submit \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"responses": {"q1": "a"}}'

  # Duplicate submit: expect 409
  # (submit twice to same session)
```

### Phase 6: T1.5 Tests - Lesson Player UI (15 min)

```bash
□ Load lesson page in browser
  # Open: http://localhost:3000/lesson/$SESSION_ID
  # Expected: Page loads, shows lesson content

□ Verify content displays
  # Shows lesson title
  # Shows all content blocks
  # Shows questions with options
  # Shows progress indicator

□ Test answer selection
  # Click multiple choice option: should select
  # Click true/false button: should select
  # Type text answer: should update state

□ Test navigation
  # Previous button disabled on first content
  # Next button enabled
  # Can navigate forward/backward

□ Test submission
  # Submit button appears on last content
  # Submit button disabled if not all answered
  # Submit button enabled when all answered
```

### Phase 7: T1.6 Tests - Results Screen (15 min)

```bash
□ Results page loads
  # After submit, redirects to /lesson/$SESSION_ID/results
  # Page displays results

□ Verify results display
  # Shows score as percentage
  # Shows XP earned
  # Shows correct/total count
  # Shows feedback message

□ Expand question details
  # Click question to expand
  # Shows student answer
  # Shows correct answer (if wrong)
  # Shows feedback

□ Navigation options
  # "Next Lesson" button if passed
  # "Try Again" button if failed
  # "Return to Dashboard" button
```

### Phase 8: Database Persistence Tests (10 min)

```bash
□ Data persists in database
  npx prisma studio
  # Check LessonSession created
  # Check responses saved
  # Check score stored

□ Student XP updated
  npx prisma studio
  # Check Student.totalXP increased

□ Multiple sessions work
  # Start different lessons
  # Submit to different sessions
  # Verify data for each

□ Data consistency
  # All fields populated correctly
  # No null values where not expected
  # Timestamps correct
```

### Phase 9: Unit Test Verification (20 min)

```bash
□ Run all unit tests
  npm test

□ Expected results:
  ✓ 75+ tests pass
  ✓ 0 failures
  ✓ 0 skipped
  ✓ API tests green
  ✓ Component tests green
  ✓ Validator tests green

□ Check coverage
  npm test -- --coverage
  # Look for >80% coverage
```

### Phase 10: Integration Test Verification (20 min)

```bash
□ Run integration tests
  npm test -- --testPathPattern=integration

□ Expected:
  ✓ All 12+ scenarios pass
  ✓ Happy path works
  ✓ Error cases handled
  ✓ Data consistency verified

□ Verify database state after tests
  npx prisma studio
  # Check test data created/cleaned up
```

### Phase 11: Performance Testing (15 min)

```bash
□ Measure response times
  time curl -X POST http://localhost:3000/api/lesson/session/start \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"lessonId": "'$LESSON_ID'"}'
  # Expected: < 500ms

  time curl -X POST http://localhost:3000/api/lesson/session/$SESSION_ID/submit \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"responses": {"q1": "a"}}'
  # Expected: < 500ms

□ Load test (optional)
  # Using Apache Bench or similar
  ab -n 100 -c 10 http://localhost:3000/api/health
  # Expected: >99% success rate
```

### Phase 12: Security Testing (10 min)

```bash
□ JWT validation
  # Invalid token rejected
  curl -H "Authorization: Bearer invalid" \
    http://localhost:3000/api/lesson/session/start
  # Expected: 401

□ Input validation
  # Empty lessonId rejected
  curl -X POST http://localhost:3000/api/lesson/session/start \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"lessonId": ""}'
  # Expected: 400

□ Session isolation
  # Can't access other user's session
  # (Create second user to test)

□ Password hashing
  # Passwords not stored in plain text
  npx prisma studio
  # Check Student.passwordHash is hashed
```

---

## 🧪 Test Scenarios

### Happy Path - All Correct
```bash
# 1. Create account
# 2. Start lesson (201 Created)
# 3. Submit all correct (200 OK, score=100, xp=100)
# 4. View results (page loads, shows 100%)
# 5. Verify DB: session completed, xp awarded
```

### Partial Answers
```bash
# 1-2. Same as happy path
# 3. Submit 2 of 3 correct (200 OK, score=66, xp=50)
# 4. View results (shows 66%)
# 5. Verify DB: correct
```

### Error Scenarios
```bash
# No token: 401
# Invalid lesson: 404
# Duplicate session: 409
# Invalid answer: 400
# Invalid input: 400
```

---

## 📊 Local Testing Results Template

```
LOCAL TESTING RESULTS
═══════════════════════════════════════════════════════════

Date: [date]
Tester: [name]
Branch: develop
Commit: [hash]

SETUP:
  ✓ Database connected
  ✓ Environment variables set
  ✓ Application started
  ✓ Tests passing (75+)

FUNCTIONALITY:
  ✓ Authentication working
  ✓ Lesson start working
  ✓ Lesson submit working
  ✓ Answer validation working
  ✓ Results display working
  ✓ Database persistence working

PERFORMANCE:
  ✓ API responses < 500ms
  ✓ No memory leaks
  ✓ No console errors

SECURITY:
  ✓ JWT validation working
  ✓ Input validation working
  ✓ Password hashing working

OVERALL: ✅ PASS - READY FOR STAGING

Issues Found: [none]
Notes: [any observations]
```

---

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Check connection string
cat .env.local | grep DATABASE_URL

# Start PostgreSQL
# On macOS: brew services start postgresql
# On Linux: sudo systemctl start postgresql
# Or use Docker: docker run -e POSTGRES_PASSWORD=password -p 5432:5432 postgres

# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

### Migrations Failed
```bash
# Check migration status
npx prisma migrate status

# Reset database (careful - data loss!)
npx prisma migrate reset

# Push schema
npx prisma db push --skip-generate
```

### Tests Failing
```bash
# Run with verbose output
npm test -- --verbose

# Run single test file
npm test -- <test-file>

# Check for common issues:
# - Database not seeded
# - Mock data missing
# - Async issues
```

### Application Won't Start
```bash
# Check logs
npm run dev 2>&1 | head -50

# Common issues:
# - Port 3000 in use: lsof -i :3000
# - Missing env vars: cat .env.local
# - Build error: npm run build

# Clear cache and restart
rm -rf .next node_modules
npm install
npm run dev
```

---

## ✅ Go/No-Go Decision

**READY FOR STAGING IF:**
```
✅ All 12 test phases passing
✅ Unit tests: 75+ passing
✅ Integration tests: all passing
✅ No P0/P1 bugs found
✅ Performance: all < 500ms
✅ Security: all checks passing
✅ Database: data persists correctly
✅ UI: all components load/work
```

**HOLD IF:**
```
❌ Any test phase fails
❌ P0 bug found
❌ Performance issues (>500ms)
❌ Security issues
❌ Data consistency problems
```

---

## 📝 Testing Sign-Off

Once complete, create a file:
```bash
cat > LOCAL_TESTING_RESULTS.md << 'EOF'
# Local Testing Results

Date: [today]
Tester: [your name]
Status: PASS ✅

All tests passed. Ready for staging deployment.
EOF
```

---

## 🚀 Next Steps

Once local testing passes:
1. Commit any fixes
2. Push to develop
3. Run `/scripts/deploy-staging.sh`
4. Deploy to Railway staging
5. Follow `DEPLOYMENT_VERIFICATION.md`

---

**Estimated Time:** 2-3 hours  
**Expected Outcome:** Confidence in all systems before staging  
**Success Criteria:** All checks passing, no blockers  

Ready to test? 🧪

