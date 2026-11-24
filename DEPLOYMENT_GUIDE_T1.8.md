# T1.8 Deployment Guide - Deploy to Staging

**Task:** T1.8 - Deploy Week 3-4 Code to Staging  
**Owner:** DevOps Engineer  
**Status:** Ready to Execute  
**Timeline:** Thursday July 4 - Friday July 5, 2026  
**Duration:** ~3 hours  

---

## 📋 Pre-Deployment Checklist

### Code Quality
```
□ All 5 tasks (T1.2-T1.6) merged to develop
□ All unit tests passing (75+ tests)
□ No console errors/warnings
□ Linting clean (npm run lint)
□ TypeScript compilation successful (npm run build)
□ No merge conflicts
```

### Testing Complete
```
□ Unit tests: npm test (all passing)
□ Integration tests: npm run test:integration (all passing)
□ Manual smoke tests completed
□ No P0 or P1 bugs remaining
```

### Environment Ready
```
□ Railway account configured
□ Database credentials ready
□ Environment variables prepared
□ Backup strategy in place
□ Monitoring configured
```

---

## 🚀 Deployment Steps

### Step 1: Pre-Deployment Preparation (Thursday Afternoon)

#### 1.1 Verify Code Ready
```bash
# Ensure you're on develop branch
git checkout develop
git pull origin develop

# Check build locally
npm run build

# Run all tests one final time
npm test

# Check for any TypeScript errors
npm run type-check

# Lint check
npm run lint
```

#### 1.2 Create Release Branch
```bash
# Create a release branch for staging deployment
git checkout -b release/staging-v0.1.0

# This branch is temporary, for deployment tracking
```

#### 1.3 Verify Database Migrations
```bash
# Check for any pending migrations
npx prisma migrate status

# All migrations should show as "applied"
# If any are pending, they'll be run during deployment
```

#### 1.4 Backup Production Database
```bash
# Even though staging, it's good practice
# Contact DevOps team or Railway for backup
# Ensure rollback is possible
```

---

### Step 2: Environment Configuration (Thursday Afternoon)

#### 2.1 Set Railway Staging Environment Variables

**Create `.env.staging` file locally (don't commit)**
```
# Database
DATABASE_URL=postgresql://user:pass@host:port/db_staging

# Auth
JWT_SECRET=your-staging-secret-key

# API
API_URL=https://staging-wizlingo.railway.app
NODE_ENV=production

# Logging
LOG_LEVEL=info

# Feature Flags
ENABLE_BETA=true
ENABLE_ANALYTICS=true
```

#### 2.2 Verify Environment Variables on Railway
```bash
# Login to Railway
railway login

# Set environment for staging
railway env --environment staging

# Set variables
railway variables add DATABASE_URL postgresql://...
railway variables add JWT_SECRET xxx
# ... repeat for all variables

# Verify they're set
railway variables list
```

---

### Step 3: Database Preparation (Thursday Evening)

#### 3.1 Run Migrations on Staging
```bash
# Connect to staging database
railway env --environment staging

# Run migrations
npx prisma migrate deploy

# Seed initial data (if needed)
npx prisma db seed
```

#### 3.2 Verify Database Schema
```bash
# Check schema is correct
npx prisma db push --skip-generate

# Should show "everything up to date"
```

---

### Step 4: Deploy to Staging (Friday Morning)

#### 4.1 Deploy Application
```bash
# Option 1: Using Railway CLI
railway up

# Option 2: Using Railway Dashboard
# 1. Go to Railway Dashboard
# 2. Select your project
# 3. Click "Deploy"
# 4. Select develop branch
# 5. Click "Deploy"

# Option 3: GitHub Integration
# If configured, commits to develop auto-deploy
```

#### 4.2 Monitor Deployment
```bash
# Watch deployment logs
railway logs --environment staging

# Should see:
# - Build started
# - npm install
# - npm run build
# - Server started on port 3000
# - No errors
```

#### 4.3 Wait for Health Check
```bash
# The application should be accessible at:
# https://staging-wizlingo.railway.app

# Verify it's running by checking health endpoint
curl https://staging-wizlingo.railway.app/api/health

# Should return 200 OK
```

---

### Step 5: Post-Deployment Verification (Friday Morning)

#### 5.1 Smoke Tests
```bash
# Test 1: Login endpoint
curl -X POST https://staging-wizlingo.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Should return 200 with token

# Test 2: Lesson start endpoint
curl -X POST https://staging-wizlingo.railway.app/api/lesson/session/start \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"lessonId": "lesson_001"}'

# Should return 201 with session data

# Test 3: Lesson submit endpoint
curl -X POST https://staging-wizlingo.railway.app/api/lesson/session/$SESSION_ID/submit \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "responses": {
      "q1": "a",
      "q2": "true",
      "q3": "answer"
    }
  }'

# Should return 200 with results
```

#### 5.2 Verify Database Connectivity
```bash
# Check that the application can connect to database
# Look in logs for:
# - "Prisma Client initialized"
# - "Database connection successful"

railway logs --environment staging | grep -i "database\|prisma"
```

#### 5.3 Check Monitoring is Active
```bash
# Verify monitoring/logging is working
# Should see incoming requests in logs
# Should see any errors in error logs

railway logs --environment staging --tail
```

#### 5.4 Verify No Errors in Application
```bash
# Watch logs for any errors in production code
railway logs --environment staging --tail

# Should see:
# ✓ No TypeScript errors
# ✓ No unhandled exceptions
# ✓ No database connection errors
# ✓ Clean startup
```

---

### Step 6: Final Verification (Friday - End of Day)

#### 6.1 24-Hour Stability Test
```
Run for at least 24 hours to ensure:
□ No memory leaks
□ No database connection issues
□ Consistent response times
□ No unexpected errors
□ All features working
```

#### 6.2 Create Deployment Document
```
File: /DEPLOYMENT_RECORD_T1.8.md

Document:
- Deployment timestamp
- Version/commit deployed
- Environment variables set
- Database migrations applied
- Any issues encountered and resolved
- Rollback procedure (in case of emergency)
```

---

## 🔄 Rollback Procedure (If Needed)

### Emergency Rollback
```bash
# If something goes wrong in production, rollback immediately:

# 1. Get previous working version
git log --oneline | head -5

# 2. Deploy previous version
railway deploy <previous-commit>

# 3. Verify rollback successful
curl https://staging-wizlingo.railway.app/api/health

# 4. Investigate what went wrong
# 5. Fix in development
# 6. Test thoroughly
# 7. Re-deploy when ready
```

### Database Rollback (If Migrations Failed)
```bash
# If database migrations caused issues:

# 1. Check migration status
npx prisma migrate status

# 2. Rollback last migration
npx prisma migrate resolve --rolled-back "<migration-name>"

# 3. Fix the migration
# 4. Re-run
npx prisma migrate deploy
```

---

## 📊 Deployment Checklist

### Before Deployment
```
□ All code merged and tested
□ Unit tests passing (75+)
□ Integration tests passing
□ Manual smoke tests done
□ No P0/P1 bugs
□ Environment variables prepared
□ Database backup created
□ Monitoring configured
□ Rollback procedure ready
```

### During Deployment
```
□ Deploy application
□ Monitor build logs
□ Watch for errors
□ Verify health check
□ Confirm database connection
```

### After Deployment
```
□ Run smoke tests
□ Verify endpoints working
□ Check logs for errors
□ Monitor performance
□ Test key features
□ Verify database
□ Create deployment record
```

### For Next 24 Hours
```
□ Monitor logs continuously
□ Watch error rates
□ Check response times
□ Monitor memory/CPU
□ Test all endpoints
□ Verify data consistency
□ Be ready for rollback
```

---

## 🎯 Success Criteria

Deployment is successful when:
```
✅ Application starts without errors
✅ Health endpoint returns 200
✅ Database connection successful
✅ All APIs respond correctly
✅ Tests passing in production
✅ No errors in logs
✅ Response times < 500ms
✅ Memory usage stable
✅ Database consistency verified
✅ 24-hour stability achieved
```

---

## 📞 Support & Escalation

### If Issues Occur

**P0 (Blocker):**
- Immediate rollback
- Notify team immediately
- Post-mortem after rollback

**P1 (Critical):**
- Fix in staging
- Re-test
- Re-deploy

**P2 (Important):**
- Document
- Plan fix
- Deploy next day

---

## 📁 Deployment Resources

**Required:**
- Docker credentials
- Railway API token
- Database credentials
- Environment variables

**Documents:**
- `/ARCHITECTURE.md` - System overview
- `/API_SPECIFICATION.md` - API docs
- `/WEEK3-4_SPRINT_PLAN.md` - What was built
- This guide

**Contacts:**
- DevOps Lead
- Backend Lead (if issues)
- Frontend Lead (if issues)

---

## ⏱️ Timeline

```
Thursday Afternoon (Jul 4):
└─ Prepare environment & run migrations
   Estimated: 2 hours

Friday Morning (Jul 5):
├─ Deploy to staging
│  Estimated: 30 minutes
└─ Smoke tests & verification
   Estimated: 1 hour

Friday Afternoon (Jul 5):
└─ Monitor & stability testing
   Estimated: 8+ hours (continuous)
```

---

## 🎉 Next Steps After Deployment

Once staging is stable:
1. QA team (T1.7) finishes integration tests
2. Team reviews deployment
3. Plan for beta launch (July 14)
4. Prepare production deployment (future)

---

**Status:** Ready to Deploy  
**Date:** June 30, 2026  
**Next:** Execute Thursday/Friday (July 4-5)  

Good luck! 🚀
