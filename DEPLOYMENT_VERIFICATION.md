# Deployment Verification Checklist - T1.8

**Status:** Ready to Verify  
**Environment:** Staging (Railway)  
**Date:** Post-Deployment (July 5, 2026)  

---

## 🎯 Verification Process

Run these checks immediately after deployment to verify everything is working.

---

## ✅ Deployment Health Checks

### 1. Application Is Running
```bash
# Check if application is accessible
curl https://staging-wizlingo.railway.app/

# Expected: HTTP 200 (or redirect to dashboard)
```

### 2. Health Endpoint
```bash
# Check health endpoint (create this if needed)
curl https://staging-wizlingo.railway.app/api/health

# Expected Response:
# {
#   "status": "healthy",
#   "timestamp": "2026-07-05T10:00:00Z",
#   "version": "0.1.0"
# }
```

### 3. Database Connection
```bash
# Verify database is connected by trying to get student data
curl -X GET https://staging-wizlingo.railway.app/api/student/journey \
  -H "Authorization: Bearer $TEST_TOKEN"

# Expected: 200 with journey data (or 401 if no valid token)
```

---

## 🔐 Authentication Tests

### Test Token Generation
```bash
# Create test user and get token
curl -X POST https://staging-wizlingo.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Expected: 200 with token
# Save token: TOKEN=eyJhbGc...
```

---

## 🎯 API Endpoint Tests

### Test T1.2: Lesson Start
```bash
curl -X POST https://staging-wizlingo.railway.app/api/lesson/session/start \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lessonId": "lesson_001"}'

# Expected: 201 with sessionId and lesson content
# Save: SESSION_ID=session_789
```

### Test T1.3: Lesson Submit
```bash
curl -X POST https://staging-wizlingo.railway.app/api/lesson/session/$SESSION_ID/submit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "responses": {
      "q1": "a",
      "q2": "true",
      "q3": "answer"
    }
  }'

# Expected: 200 with results including score, XP, feedback
```

---

## 📊 Performance Tests

### Response Time Check
```bash
# Measure lesson start response time
time curl -X POST https://staging-wizlingo.railway.app/api/lesson/session/start \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"lessonId": "lesson_001"}' \
  > /dev/null

# Expected: < 500ms real time
```

### Load Test (Optional)
```bash
# Using Apache Bench (if installed)
ab -n 100 -c 10 https://staging-wizlingo.railway.app/api/health

# Expected: >99% success rate
```

---

## 🗄️ Database Verification

### Check Data Persistence
```bash
# After submitting answers, verify in database:
# 1. LessonSession record created
# 2. Student XP updated
# 3. Responses saved

# If you have database access:
psql $DATABASE_URL -c "SELECT * FROM \"LessonSession\" ORDER BY \"createdAt\" DESC LIMIT 1;"
```

---

## 📝 Logging & Monitoring

### Check Application Logs
```bash
# View Rails logs
railway logs --environment staging --tail

# Look for:
# ✅ Application started
# ✅ Database connection successful
# ✅ Prisma Client initialized
# ❌ Any ERROR or FATAL messages
```

### Check Error Logs
```bash
# Filter for errors only
railway logs --environment staging --tail | grep -i error

# Expected: No errors (or only expected errors from test failures)
```

### Check Request Logs
```bash
# View incoming requests
railway logs --environment staging --tail | grep -i "POST\|GET"

# Expected: All API endpoints are being called
```

---

## 🔒 Security Verification

### Verify JWT Authentication
```bash
# Test without token (should fail)
curl -X POST https://staging-wizlingo.railway.app/api/lesson/session/start \
  -d '{"lessonId": "lesson_001"}'

# Expected: 401 Unauthorized
```

### Verify Input Validation
```bash
# Test with invalid data
curl -X POST https://staging-wizlingo.railway.app/api/lesson/session/start \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"lessonId": ""}'

# Expected: 400 Bad Request
```

### Verify Session Isolation
```bash
# Test that student can't access other student's session
# (requires creating another student account first)
```

---

## 🧪 Feature Verification

### Complete Learning Journey
```
1. ✅ Login and get token
2. ✅ Start lesson (T1.2 endpoint)
3. ✅ View lesson content (returned from start)
4. ✅ Submit answers (T1.3 endpoint)
5. ✅ Receive results with feedback
6. ✅ Verify XP awarded
7. ✅ Verify progress updated
```

### All Question Types
```
1. ✅ Multiple choice questions work
2. ✅ True/false questions work
3. ✅ Text match questions work
```

---

## 📋 Quick Verification Checklist

```
IMMEDIATE (First 30 minutes after deploy):
  □ Application loads (curl homepage)
  □ Health endpoint responds (HTTP 200)
  □ Database connected (query database)
  □ Authentication works (login returns token)
  □ Lesson start endpoint works (201 response)
  □ Lesson submit endpoint works (200 response)
  □ No errors in logs

FIRST HOUR:
  □ Performance metrics acceptable (<500ms)
  □ All endpoints responding
  □ Database records created
  □ XP awarded correctly
  □ Progress updated

FIRST 24 HOURS:
  □ No memory leaks
  □ No database connection drops
  □ Consistent response times
  □ No unexpected errors
  □ All features working
```

---

## 🚨 If Issues Occur

### Issue: Application Won't Start
```bash
# Check logs
railway logs --environment staging

# Common causes:
# 1. DATABASE_URL not set
# 2. Migrations failed
# 3. Missing environment variables
# 4. Port already in use
```

### Issue: Database Connection Failed
```bash
# Check connection string
railway variables list | grep DATABASE_URL

# Verify database is accessible
psql $DATABASE_URL -c "SELECT 1;"

# Check Prisma setup
npx prisma db push --skip-generate
```

### Issue: 5xx Server Errors
```bash
# Check logs for stack traces
railway logs --environment staging --tail

# Look for:
# - Unhandled exceptions
# - Missing dependencies
# - Configuration issues
# - Database errors
```

### Issue: Slow Response Times
```bash
# Check database query performance
# Check application memory usage
# Check CPU utilization
# Scale up if needed
```

---

## 📊 Monitoring Setup

### Set Up Alerts (Railway Dashboard)
```
1. Go to Railway Dashboard
2. Select your project
3. Go to Monitoring
4. Set alerts for:
   - CPU > 80%
   - Memory > 80%
   - Error rate > 1%
   - Response time > 1s
```

### Set Up Log Notifications
```
Configure to get notified of:
- ERROR and FATAL level logs
- Unhandled exceptions
- Database connection failures
```

---

## ✅ Success Criteria

Deployment is successful when:
```
✅ Application starts without errors
✅ All endpoints respond correctly
✅ Database is connected and queryable
✅ Authentication works (JWT valid)
✅ Lesson flow works end-to-end
✅ Performance is acceptable (<500ms)
✅ No errors in logs
✅ Data is persisted correctly
✅ XP is awarded correctly
✅ Progress is updated correctly
✅ 24-hour stability test passes
```

---

## 📈 Performance Baseline

Expected metrics after deployment:
```
Response Times:
  - Lesson Start:     100-200ms
  - Lesson Submit:    150-300ms
  - Database Query:   50-100ms

Error Rates:
  - 4xx Errors:       < 1% (mostly 401 for missing auth)
  - 5xx Errors:       0% (any indicates issue)

Availability:
  - Uptime:           99.9%+
  - Health Check:     100% successful
```

---

## 🎉 Deployment Complete Checklist

Once all verifications pass:
```
□ Document deployment details
□ Create deployment record with timestamp
□ Notify team of successful deployment
□ Update deployment status in system
□ Start 24-hour monitoring
□ Prepare for beta launch
□ Document any issues for post-mortems
```

---

## 📞 Support Contacts

If issues occur:
- **DevOps Lead:** Deployment issues, scaling, infrastructure
- **Backend Lead:** API errors, database issues, logic problems
- **Frontend Lead:** UI issues, integration problems
- **QA Lead:** Testing issues, verification problems

---

**Verification Status:** Ready to Execute  
**Expected Duration:** 30 minutes for full verification  
**Timeline:** July 5, 2026 morning  

✅ **LET'S VERIFY!**
