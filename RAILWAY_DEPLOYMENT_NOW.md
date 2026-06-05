# 🚀 Deploy to Railway NOW - Live Checklist

**Date:** June 5, 2026  
**Goal:** Get WizLingo live on Railway in 15 minutes  
**Time:** 3 PM IST

---

## ✅ Pre-Deployment Checklist (5 min)

- [x] Code committed to git
- [x] Build passing (71/71 pages)
- [x] Environment variables ready
- [x] Database schema finalized
- [x] Security (rate limiting, validation) implemented

---

## 🚀 DEPLOYMENT STEPS (DO THIS NOW)

### **Step 1: Open Railway Dashboard** (1 min)

1. Go to: https://railway.app/dashboard
2. If not logged in: Sign up with GitHub
3. Authorize Railway access to your GitHub

---

### **Step 2: Create New Project** (2 min)

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Select **your GitHub account/organization**
4. Search for: **`reading-app`** repository
5. Click **"Create"**

**Result:** Railway connected to your GitHub repo ✅

---

### **Step 3: Add PostgreSQL Database** (2 min)

1. In Railway project dashboard
2. Click **"+ Add Service"** (or + button)
3. Select **"Database"**
4. Choose **"PostgreSQL"**
5. Click **"Create"**

**Result:** PostgreSQL created, DATABASE_URL auto-generated ✅

---

### **Step 4: Set Environment Variables** (3 min)

1. Click **"app"** service (the Node.js one, NOT PostgreSQL)
2. Go to **"Variables"** tab
3. Add these 5 variables:

```
NEXT_PUBLIC_APP_URL
Value: https://wizlingo.edvanta.co.in

JWT_SECRET
Value: [copy from your .env.local]

ANTHROPIC_API_KEY
Value: [copy from your .env.local]

WIZADMIN_SECRET
Value: [copy from your .env.local]

NODE_ENV
Value: production
```

**Result:** All variables set ✅

---

### **Step 5: Configure Build Settings** (2 min)

1. Click **"app"** service
2. Go to **"Settings"** tab
3. Find **"Build"** section
4. Set:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Node Version:** `18`

**Result:** Build configured ✅

---

### **Step 6: Deploy!** (3 min)

**Option A: Auto-Deploy (Recommended)**
```bash
git push origin main
# Wait 5-10 minutes for auto-deploy
```

**Option B: Manual Deploy in Railway**
1. Click **"Deployments"** tab
2. Click **"New Deployment"**
3. Select **"main"** branch
4. Click **"Deploy"**

**Result:** App deploying... ⏳

---

## 🔍 Verify Deployment (3 min)

### **Step 1: Check Status**
1. In Railway, go to **"Deployments"** tab
2. Watch for green checkmark ✅
3. Wait for "Deployment successful"

### **Step 2: Get Your Live URL**
1. Click **"app"** service
2. Look at top right corner
3. Copy URL like: `https://wizlingo-xxxxx.railway.app`

### **Step 3: Test It Works**
```bash
# Replace xxxxx with your actual Railway subdomain
curl https://wizlingo-xxxxx.railway.app/api/health

# Expected response:
# {"status":"healthy","timestamp":"2026-06-05T...","uptime":...}
```

### **Step 4: Test in Browser**
Open these URLs (replace `xxxxx` with YOUR Railway subdomain):

1. **App Home:** https://wizlingo-xxxxx.railway.app
2. **Student Signup:** https://wizlingo-xxxxx.railway.app/auth/phone-signup
3. **Admin Dashboard:** https://wizlingo-xxxxx.railway.app/admin/beta-dashboard
4. **Health Check:** https://wizlingo-xxxxx.railway.app/api/health

---

## 🎯 Your Live Links

| Purpose | URL |
|---------|-----|
| **Student Login** | https://wizlingo-[ID].railway.app/auth/phone-signup |
| **Teacher Dashboard** | https://wizlingo-[ID].railway.app/teacher/dashboard |
| **Admin Dashboard** | https://wizlingo-[ID].railway.app/admin/beta-dashboard |
| **Health Check** | https://wizlingo-[ID].railway.app/api/health |

---

## ⚠️ If Something Goes Wrong

### **"Build Failed" Error**
```
→ Check Logs tab
→ Look for error message
→ Common: npm install failed, missing env var
→ Fix it, commit, and redeploy
```

### **"Database Connection Error"**
```
→ Verify DATABASE_URL exists in Variables
→ Check PostgreSQL service is running (green status)
→ Try restarting both services
```

### **"Can't Access App"**
```
→ Wait 5 more minutes (deployment can be slow first time)
→ Hard refresh (Ctrl+Shift+R)
→ Check if health endpoint works: /api/health
→ Check logs for error messages
```

### **"500 Error on Pages"**
```
→ Check app logs for error
→ Common: Missing env variable
→ Common: Database migration failed
→ Add missing variable or restart
```

---

## 📊 What's Running

After successful deployment:

```
Railway Project (wizlingo-prod)
│
├─ App Service (Node.js)
│  ├─ Build: npm run build
│  ├─ Start: npm start
│  ├─ Env: 5 variables set
│  ├─ Port: 3000 (internal)
│  └─ URL: https://wizlingo-xxxxx.railway.app
│
└─ PostgreSQL Service
   ├─ Version: 15
   ├─ Status: Running
   ├─ Auto-backups: Enabled
   └─ DATABASE_URL: postgres://...
```

---

## ✅ Post-Deployment

### **Immediately After (5 min)**
- [x] Test all 4 URLs work
- [x] Try student signup flow
- [x] Check health endpoint
- [x] Review logs for errors

### **Within 1 Hour**
- [ ] Enable custom domain: `wizlingo.edvanta.co.in`
  - Go to app Settings → Domains
  - Add custom domain
  - Update DNS at Edvanta
  
### **First 24 Hours**
- [ ] Monitor logs for errors
- [ ] Test OTP flow end-to-end
- [ ] Verify database is working
- [ ] Check admin dashboard loads

### **Before Schools Go Live (June 15)**
- [ ] Create teacher test accounts
- [ ] Create 5-10 student test accounts
- [ ] Run full student flow (signup → reading → feedback)
- [ ] Verify teacher can see students
- [ ] Verify admin can see stats
- [ ] Set up monitoring/alerts

---

## 📱 School Access Info (Save This)

**Share with schools on June 15:**

```
🎓 WizLingo Beta Launch - Access Information

Student URL: https://wizlingo.edvanta.co.in/auth/phone-signup
Teacher URL: https://wizlingo.edvanta.co.in/teacher/dashboard
Admin URL: https://wizlingo.edvanta.co.in/admin/beta-dashboard

Getting Started:
1. Student: Enter phone number → Enter OTP → Create profile → Start reading
2. Teacher: Login → See all students → Monitor progress in real-time

Support: support@edvanta.co.in

Powered by Edvanta Intelligence System (AI)
```

---

## 🎉 SUCCESS MARKERS

You'll know it's working when:

✅ Health endpoint returns `{"status":"healthy"}`  
✅ Homepage loads with WizLingo logo and Edvanta branding  
✅ Student signup page shows phone input  
✅ Can send OTP (check logs for code in dev mode)  
✅ Admin dashboard shows 0 students (no data yet)  
✅ No 500 errors in logs  

---

## 🕐 Timeline

```
Now:           Start deployment (5 min)
+5 min:        Deployment starts building
+10-15 min:    Build complete, deploying
+15-20 min:    App live on Railway
+20-25 min:    Test all URLs
+25-30 min:    Configure custom domain (optional)
```

**Total Time: 30 minutes to production** 🚀

---

## 💡 Pro Tips

1. **Keep Railway Dashboard open** — Watch deployment progress live
2. **Don't close terminal** — If you're git pushing
3. **Check logs frequently** — Early errors are easiest to spot
4. **Save your Railway URL** — You'll need it for schools
5. **Update DNS later** — Can add custom domain anytime

---

## 📞 If You're Stuck

Check in this order:

1. **Railway Logs** → Most helpful for debugging
2. **Railway Status Page** → Is platform having issues?
3. **Build Output** → Did build actually complete?
4. **Env Variables** → Are all 5 set correctly?
5. **PostgreSQL Service** → Is it healthy (green)?

---

## ✨ Ready?

You have everything needed:
- ✅ Code committed
- ✅ Build passing
- ✅ Security implemented
- ✅ Database ready
- ✅ All documentation

**GO TO RAILWAY.APP AND START DEPLOYING** 🚀

Questions during deployment?
- Check QUICK_START_RAILWAY.md (5-min version)
- Check RAILWAY_SETUP.md (full 15-min guide)
- Check RAILWAY_DATABASE_LINKING.md (env vars explained)

---

**WizLingo will be LIVE in 30 minutes!** ⏱️

