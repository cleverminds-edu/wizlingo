# 🚀 Railway Setup Guide: Deploy WizLingo in 15 Minutes

**Goal:** Get WizLingo running on Railway with PostgreSQL  
**Time:** ~15 minutes  
**Cost:** Free tier ($5/month credit)  
**Result:** Live app at `https://wizlingo-xxxxx.railway.app`

---

## 📋 Prerequisites

- ✅ GitHub account (to connect repository)
- ✅ Railway account (free signup at https://railway.app)
- ✅ This repository pushed to GitHub
- ✅ Environment variables ready (see `.env.example`)

---

## Step 1: Create Railway Account (2 minutes)

**1. Go to https://railway.app**

**2. Click "Start Free"**
- Sign up with GitHub (recommended)
- Authorize Railway to access your GitHub

**3. You're in! 🎉**

---

## Step 2: Create New Project (1 minute)

**In Railway Dashboard:**

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Click **"Configure GitHub App"**
4. Select your GitHub user/org
5. Select this repository (`reading-app`)
6. Click **"Create"**

**Result:** Railway connects to your repo

---

## Step 3: Add PostgreSQL Database (2 minutes)

**Still in Railway Dashboard:**

1. Click **"Add Service"** (or + icon)
2. Select **"Database"**
3. Choose **"PostgreSQL"**
4. Click **"Create"**

**Result:** PostgreSQL instance created automatically  
**Auto-generated:** `DATABASE_URL` environment variable

---

## Step 4: Configure Environment Variables (3 minutes)

**In Railway:**

1. Click your **"app"** service (the Node.js one)
2. Go to **"Variables"** tab
3. Add these variables:

```
NEXT_PUBLIC_APP_URL=https://wizlingo.edvanta.co.in
JWT_SECRET=<copy from your .env.local>
ANTHROPIC_API_KEY=<copy from your .env.local>
WIZADMIN_SECRET=<copy from your .env.local>
NODE_ENV=production
```

**Note:** `DATABASE_URL` is auto-set by PostgreSQL service

**Reference for values:**
```bash
# Get from your local .env.local:
cat .env.local | grep -E "JWT_SECRET|ANTHROPIC_API_KEY|WIZADMIN_SECRET"
```

---

## Step 5: Configure Build & Start Commands (2 minutes)

**In Railway App Settings:**

1. Click your **"app"** service
2. Go to **"Settings"** tab
3. Scroll to **"Build"** section
4. Set:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Node Version:** `18`

**Result:** Railway knows how to build and run your app

---

## Step 6: Deploy (5 minutes)

**Option A: Auto-Deploy (Recommended)**
```bash
# Just push to GitHub:
git push origin main

# Railway automatically:
# 1. Detects new commit
# 2. Runs build
# 3. Runs migrations
# 4. Deploys to production
# Time: 5-10 minutes
```

**Option B: Manual Deploy**
1. Go to **"Deployments"** tab
2. Click **"New Deployment"**
3. Select **"main"** branch
4. Click **"Deploy"**

---

## Step 7: Run Database Migrations (1 minute)

**After first deploy, migrations auto-run via:**

Create `railway-migrate.json` at root:
```json
{
  "scripts": {
    "postdeploy": "npx prisma migrate deploy"
  }
}
```

Or manually in Railway:
1. Click **"PostgreSQL"** service
2. Go to **"Logs"** to see status
3. Verify migrations completed

**Alternative (Run Locally):**
```bash
# If you prefer to test locally first:
DATABASE_URL=<railway-postgres-url> npx prisma migrate deploy
```

---

## Step 8: Verify Deployment (2 minutes)

**Check Status:**

1. In Railway, click your **"app"** service
2. Copy the **URL** from the top right
3. Open in browser: `https://your-app.railway.app`

**Test These:**

```bash
# API Health Check
curl https://your-app.railway.app/api/health
# Expected: {"status": "healthy"}

# Student Page
https://your-app.railway.app/auth/phone-signup

# Check Logs
# In Railway → Logs tab → see real-time logs
```

**Result:** ✅ WizLingo is live!

---

## ⚙️ Post-Deployment Configuration

### Enable Custom Domain (Optional)

1. In Railway, click your **"app"** service
2. Go to **"Settings"**
3. Find **"Domains"** section
4. Click **"Add Custom Domain"**
5. Enter: `wizlingo.edvanta.co.in`
6. Add CNAME record to your DNS (Railway shows the exact record)

**DNS Record Example:**
```
Name: wizlingo
Type: CNAME
Value: <railway-provided-cname>
TTL: 3600
```

### Enable Auto-Backups

1. Click your **"PostgreSQL"** service
2. Go to **"Backups"** tab
3. Enable **"Automatic backups"** (toggle on)
4. Set retention: **14 days**

### View Logs in Real-Time

```bash
# In Railway Dashboard:
# Click "app" → "Logs" tab → See live logs

# Or via Railway CLI:
railway login
railway link  # Select project
railway logs -s app
```

---

## 🔗 Important URLs After Deployment

| Purpose | URL |
|---------|-----|
| **App** | https://your-app.railway.app |
| **Student Login** | https://your-app.railway.app/auth/phone-signup |
| **Teacher Dashboard** | https://your-app.railway.app/teacher/dashboard |
| **Admin Dashboard** | https://your-app.railway.app/admin/beta-dashboard |
| **Health Check** | https://your-app.railway.app/api/health |
| **Railway Dashboard** | https://railway.app/dashboard |

---

## 🧪 Testing Deployment

### Test Student Flow
```
1. Go to https://your-app.railway.app/auth/phone-signup
2. Enter test phone: 9876543210
3. Click "Send OTP"
4. Check console logs (OTP will print in dev, not in prod)
5. Manually enter OTP from logs
6. Complete profile setup
7. See dashboard
```

### Test Admin Dashboard
```
1. Go to /admin/beta-dashboard (you need WIZADMIN_SECRET)
2. Verify student count = 1
3. Check real-time stats refresh
4. Verify health check working
```

### Monitor Health
```bash
# Continuous health check
while true; do
  curl -s https://your-app.railway.app/api/health | jq .
  sleep 30
done
```

---

## 🔐 Security Checklist

- ✅ All secrets in environment variables (not in code)
- ✅ DATABASE_URL auto-hidden (never logged)
- ✅ HTTPS enabled by default
- ✅ Rate limiting active on OTP/feedback
- ✅ Input validation on all endpoints
- ✅ Health endpoint accessible for monitoring

---

## 💾 Backup & Restore

### View Backups
```
Railway Dashboard → PostgreSQL → Backups tab
```

### Manual Backup
```bash
# Download current database
pg_dump $DATABASE_URL > wizlingo_backup.sql

# List backups
psql $DATABASE_URL -c "SELECT * FROM pg_stat_statements;"
```

### Restore Backup
```bash
# If something goes wrong:
# 1. Go to Railway → PostgreSQL → Backups
# 2. Click backup date
# 3. Click "Restore"
# 4. Confirm (will reset database to that point)
```

---

## 📊 Monitoring

### View Real-Time Logs
```
Railway Dashboard → App → Logs (live stream)
```

### Check Metrics
```
Railway Dashboard → App → Metrics tab
- CPU usage
- Memory usage
- Network I/O
- Request count
```

### Uptime Status
```
Visit: https://status.railway.app
(Railway platform status)
```

---

## 🚨 Troubleshooting

### "Build Failed"
```
Check Logs → see error message
Common issues:
- npm install failed → check package.json
- TypeScript error → npm run build locally first
- Missing env var → add to Variables tab
```

### "Database Connection Error"
```
1. Verify DATABASE_URL exists in Variables
2. Check PostgreSQL service is running
3. Try: psql $DATABASE_URL -c "SELECT 1"
4. If failing, restart PostgreSQL service
```

### "App Won't Start"
```
1. Check Start Command is correct: "npm start"
2. Check build completed successfully
3. Check all env vars present
4. Review logs for error message
5. Try redeploying: Deployments → New Deployment
```

### "Can't Access API"
```
1. Check health endpoint: /api/health
2. Verify app is running (green status)
3. Wait 2-3 minutes after deploy
4. Clear browser cache
5. Try incognito mode
```

### "Slow Performance"
```
1. Check if free tier instance is overloaded
2. Upgrade to paid plan if needed
3. Scale app: Settings → Add more instances
4. Check database for slow queries
```

---

## 📈 Scaling (Later)

**As you grow beyond free tier:**

### Upgrade PostgreSQL
```
Railway Dashboard → PostgreSQL → Settings
- Starter → Growth (10GB, $15/mo)
- Auto-scaling backups included
```

### Scale App Instances
```
Railway Dashboard → App → Settings
- Increase CPU/RAM
- Add load balancer
```

### Add Caching (Redis)
```
Railway Dashboard → Add Service → Redis
Use for:
- Rate limit store (instead of memory)
- Session caching
- API response caching
```

---

## ✅ Deployment Checklist

- [ ] GitHub repository created and pushed
- [ ] Railway account created
- [ ] New Project connected to GitHub repo
- [ ] PostgreSQL database created
- [ ] Environment variables added (6 vars)
- [ ] Build/Start commands configured
- [ ] Deployed successfully
- [ ] Database migrations completed
- [ ] Health check passes
- [ ] Student signup flow works
- [ ] Admin dashboard accessible
- [ ] Custom domain configured (optional)
- [ ] Auto-backups enabled
- [ ] Monitoring set up

---

## 🎉 You're Live!

**Your app is now running on:**
```
https://your-railway-app.railway.app
```

**Next Steps:**

1. **For Pilot Schools:** Share this URL with teachers
2. **Custom Domain:** Add `wizlingo.edvanta.co.in` DNS record
3. **Monitor:** Check logs daily for first week
4. **QR Codes:** Create with this URL
5. **Communication:** Send setup guide to schools

---

## 📞 Railway Support

- **Docs:** https://docs.railway.app
- **Status:** https://status.railway.app
- **Community:** Discord on Railway website
- **Email:** support@railway.app (paid plans)

---

## Next: What to Do After Deployment

Once deployed, follow these in order:

1. **Test Thoroughly** (30 min)
   - Try student signup
   - Try teacher login
   - Check admin dashboard
   - Run health checks

2. **Prepare Schools** (1 day)
   - Create teacher accounts
   - Create sample student accounts
   - Print QR codes
   - Write school communication

3. **Launch Pilot** (June 15)
   - Share link with 100-150 students
   - Monitor daily active users
   - Collect feedback
   - Watch for errors in logs

4. **Iterate** (June 15 - July 15)
   - Fix bugs found
   - Add requested features
   - Scale if needed
   - Plan domain migration

**See:** `BETA_DISTRIBUTION.md` for school onboarding  
**See:** `DOMAIN_MIGRATION_CHECKLIST.md` for July migration to wizlingo.app

---

**Deployment Complete! Ready for Pilot Launch 🚀**

