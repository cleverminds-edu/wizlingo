# WizLingo Beta Launch - Deployment Verification Guide

**Deployment Date:** June 18, 2026  
**Status:** Ready for Production  
**Target:** 100-150 students at 1-2 Indian schools

---

## 🚀 Deployment Steps

### 1. **Trigger Deployment on Railway**

```bash
# Railway auto-deploys on push to main
# If manual trigger needed:
# 1. Go to https://railway.app
# 2. Select "wizlingo-production" project
# 3. Click "Deploy" on the GitHub integration
# 4. Monitor build logs in real-time
```

### 2. **Expected Build Time**
- **Total Duration:** 5-8 minutes
- Build stage (Prisma generate, npm ci): 3-4 min
- Next.js compilation: 2-3 min
- Docker image push: 1-2 min

### 3. **What Gets Deployed**

| Component | Version | Status |
|-----------|---------|--------|
| Node.js | 20.19.0 | ✅ LTS |
| Next.js | 16.2.4 | ✅ Latest |
| Prisma | 7.8.0 | ✅ Ready |
| PostgreSQL | (Railway managed) | ✅ Linked |

---

## ✅ Post-Deployment Verification

### Test #1: Health Check
```bash
curl https://wizlingo.edvanta.co.in/api/health
```
**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-06-18T...",
  "uptime": 123456,
  "environment": "production"
}
```

### Test #2: B2C Signup Form
**URL:** `https://wizlingo.edvanta.co.in/auth/signup`

**Verify:**
- ✅ Form loads with 4 fields: Name, DOB, Class, Phone
- ✅ Password formula shows: "First 3 letters + Year + Last 3 phone digits"
- ✅ Password preview updates as you type
- ✅ "Powered by Edvanta Intelligence System" in footer
- ✅ Animations work smoothly (fade-in-up on load)

**Test Signup:**
```
Name: Aditya
DOB: 2010-05-15
Class: Class V
Phone: 9876543210

Expected Password: ADI20210
```

### Test #3: Login Page
**URL:** `https://wizlingo.edvanta.co.in/auth/login-password`

**Verify:**
- ✅ Page has animated entrance (glow effect)
- ✅ Logo floats smoothly
- ✅ Password reminder shows NEW formula (not old "Wiz+6digits")
- ✅ Form fields have smooth animations
- ✅ "Create Account" button links to `/auth/signup`
- ✅ Branding says "Powered by Edvanta Intelligence System"

### Test #4: Manager Dashboard
**URL:** `https://wizlingo.edvanta.co.in/admin/dashboard`

**Verify:**
- ✅ Page loads with loading spinner
- ✅ Summary cards animate with counters (0 → final value)
- ✅ Cards have glow effect on hover
- ✅ Performance charts slide in from sides
- ✅ Recent signups load and display
- ✅ Top performers table shows (empty initially)
- ✅ Auto-refresh works every 30 seconds
- ✅ Refresh button functional

### Test #5: API Endpoints

**Create Student (B2C Signup):**
```bash
curl -X POST https://wizlingo.edvanta.co.in/api/auth/signup-detailed \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Priya",
    "dateOfBirth": "2012-03-20",
    "classId": "class-id-here",
    "phone": "9123456789"
  }'
```

**Expected Response:**
```json
{
  "message": "Account created successfully",
  "studentId": "...",
  "password": "PRI201289",
  "studentData": { ... }
}
```

**Get Classes:**
```bash
curl https://wizlingo.edvanta.co.in/api/classes
```

**Get Dashboard Stats:**
```bash
curl https://wizlingo.edvanta.co.in/api/admin/dashboard-stats
```

---

## 🎯 Performance Targets

| Metric | Target | Tolerance |
|--------|--------|-----------|
| Page Load Time | < 2s | ± 0.5s |
| API Response | < 500ms | ± 100ms |
| Dashboard Refresh | 30s interval | ± 2s |
| Login Success Rate | 100% | N/A |
| Signup Success Rate | 100% | N/A |

---

## 📊 Monitoring Checklist

### Immediate (First 30 minutes)
- [ ] Build completes successfully on Railway
- [ ] All URLs load without 500 errors
- [ ] Database migrations applied
- [ ] Health endpoint responds
- [ ] Create test account via signup

### Day 1 (First 24 hours)
- [ ] Monitor `/admin/dashboard` for stats
- [ ] Test login with created account
- [ ] Verify password formula works
- [ ] Check PWA installation on mobile
- [ ] Monitor response times

### Week 1 (Ongoing)
- [ ] Daily check of active students
- [ ] Monitor engagement rate
- [ ] Verify database backups run
- [ ] Check error logs for issues
- [ ] Test on different devices

---

## 🚨 Common Issues & Fixes

### Issue: "Database table does not exist"
**Solution:** Migrations didn't run
```bash
# In Railway terminal:
npx prisma migrate deploy
```

### Issue: Old password formula showing
**Solution:** Clear browser cache
```bash
# Hard refresh:
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

### Issue: Classes not loading in dropdown
**Solution:** Seed test classes
```bash
# In Railway terminal or local:
npx tsx scripts/seed-classes.ts
```

### Issue: Dashboard showing 0 students
**Solution:** Normal - no students signed up yet
- Create test account via signup form
- Stats will update in real-time

---

## 📞 Rollback Plan

If critical issues occur:

```bash
# Revert to previous version
git revert HEAD
git push origin main
# Railway auto-deploys immediately
```

**Previous Stable Commit:** `b57c739` (Before branding fixes)

---

## 🎊 Success Criteria

- ✅ All pages load without errors
- ✅ Signup creates accounts with correct password
- ✅ Login works with phone + password
- ✅ Manager dashboard displays real-time stats
- ✅ Animations work smoothly on all pages
- ✅ Branding shows "Powered by Edvanta Intelligence System"
- ✅ PWA installable on mobile
- ✅ API endpoints respond correctly

---

## 📅 Timeline

| Phase | Date | Status |
|-------|------|--------|
| Deploy to Railway | June 18 | ✅ NOW |
| Run verification tests | June 18 | 📋 Next |
| Onboard 10-20 students | June 18-22 | 📅 Week 1 |
| Monitor & optimize | June 23-29 | 📅 Week 2 |
| Scale to 100-150 | June 30-July 15 | 📅 Week 3-4 |

---

## 🎯 Beta Launch Goals

**Participants:** 100-150 students  
**Schools:** 1-2 Indian tier 2/3 schools  
**Features:** Reading + Speaking with adaptive difficulty  
**Duration:** 4 weeks (June 15 - July 15)  
**Success Metric:** 60%+ weekly engagement rate

---

**Questions?** Check `/admin/dashboard` for real-time metrics!

**Powered by Edvanta Intelligence System**
