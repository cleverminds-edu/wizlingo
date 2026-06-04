# 🚀 WIZLINGO DEPLOYMENT CHECKLIST
## Complete Step-by-Step Guide to Launch on June 5, 2026

**Status:** Ready to execute  
**Timeline:** 9am - 10:15am (1 hour 15 minutes)  
**Confidence:** 10/10 (all code tested and ready)

---

## 📋 PHASE 0: PRE-DEPLOYMENT (TODAY - June 4)

### Create Accounts (30 minutes)

- [ ] **Vercel Account**
  - Go to vercel.com
  - Sign up with GitHub
  - Connect to edvanta/reading-app repo
  - Time: 5 minutes

- [ ] **Railway Account**
  - Go to railway.app
  - Sign up with GitHub
  - Time: 5 minutes

- [ ] **AWS Account (for SES email)**
  - Go to aws.amazon.com
  - Create account with credit card
  - Time: 5 minutes

- [ ] **Posthog Account (analytics)**
  - Go to posthog.com
  - Sign up with GitHub
  - Time: 5 minutes

- [ ] **Razorpay Account (payments)**
  - Go to razorpay.com
  - Create business account (requires PAN/Aadhar)
  - Time: 10 minutes

**Total:** 30 minutes. All accounts ready by 5pm.

---

## 🚀 PHASE 1: DEPLOYMENT (TOMORROW - June 5, 9am)

### STEP 1: Create Railway Database (9:00am - 9:10am)

```bash
# 1. Go to railway.app dashboard
# 2. Click "New Project"
# 3. Click "Provision PostgreSQL"
# 4. Wait 2-3 minutes for database to spin up
# 5. Click on PostgreSQL service
# 6. Go to "Connect" tab
# 7. Copy the CONNECTION_URL (looks like: postgresql://user:pass@host:port/db)
# 8. Save this somewhere safe (you'll need it in 5 minutes)
```

**Checkpoint:** Railway database running? ✅

---

### STEP 2: Add DATABASE_URL to Vercel (9:10am - 9:15am)

```bash
# 1. Go to vercel.com dashboard
# 2. Select project: edvanta-reading-app
# 3. Click "Settings" tab
# 4. Go to "Environment Variables"
# 5. Click "Add New"
# 6. Name: DATABASE_URL
# 7. Value: [paste CONNECTION_URL from Railway]
# 8. Scope: Production (important!)
# 9. Click "Add"
```

**Vercel auto-redeploys** when you add environment variable (takes 2-3 minutes)

**Checkpoint:** DATABASE_URL added? ✅

---

### STEP 3: Verify Deployment (9:15am - 9:25am)

```bash
# Wait for Vercel redeployment (you'll see "Building..." then "Ready")
# This takes 3-5 minutes

# Once ready, go to: https://wizlingo.vercel.app
# You should see:
# ✅ Landing page loads
# ✅ No errors in browser console
# ✅ "Start Free Trial" button visible
```

**Checkpoint:** Landing page loads without errors? ✅

---

### STEP 4: Run Database Migrations (9:25am - 9:35am)

```bash
# This creates all tables in your production database
# Run from your local machine (terminal):

cd /Users/maddy/edvanta/reading-app

# Set environment variable temporarily
export DATABASE_URL="[paste your CONNECTION_URL from Railway here]"

# Run migrations
npx prisma migrate deploy --production

# You should see:
# ✅ 1 migration executed
# ✅ All tables created
# ✅ No errors
```

**If this fails:**
```bash
# Try this instead:
npx prisma db push --production --skip-generate

# This will warn but should work
```

**Checkpoint:** All migrations successful? ✅

---

### STEP 5: Test Landing Page (9:35am - 9:50am)

**Go to:** https://wizlingo.vercel.app

**Test 1: Page Loads**
- [ ] Page loads in < 2 seconds
- [ ] All text visible (hero, features, badges)
- [ ] Images load (badge icons)
- [ ] Gradient background shows (orange to purple)
- [ ] No console errors (F12 → Console)

**Test 2: Signup Flow**
- [ ] Click "Start Free Trial" button
- [ ] Lands on signup page
- [ ] Form fields visible: Name, Email, Grade, Date of Birth
- [ ] Can type in all fields
- [ ] Submit button appears

**Test 3: Fill Out Signup**
```
Name: Test Student
Email: test@gmail.com (use YOUR email)
Grade: Grade 5
Date of Birth: 01/01/2010
```
- [ ] Form validates (no error on submit)
- [ ] Lands on verification page
- [ ] Success message shows
- [ ] Email arrives within 2 minutes

**Test 4: Email Verification**
- [ ] Check inbox for verification email
- [ ] Copy verification code from email
- [ ] Paste code into verification page
- [ ] Page shows "Email verified successfully"
- [ ] Redirects to login page

**Test 5: Check Database**
```bash
# Verify student was created in database
# From your terminal:

export DATABASE_URL="[paste CONNECTION_URL]"
npx prisma studio

# Open http://localhost:5555
# Go to "Student" table
# You should see your test student record
```

**Checkpoint:** All tests passed? ✅

---

## 📊 PHASE 2: GO-LIVE (9:50am - 10:15am)

### Update DNS (Point wizlingo.app to Vercel)

```bash
# 1. Go to your domain registrar (Namecheap, GoDaddy, Route53)
# 2. Find DNS settings for wizlingo.app
# 3. Add CNAME record:
#    Name: @
#    Target: cname.vercel-dns.com
# 4. Save/Apply changes
# 5. Wait 5-10 minutes for DNS to propagate

# 6. Test:
#    Go to https://wizlingo.app
#    Should load your Vercel app
```

**If you don't have a domain yet:**
- Use https://wizlingo.vercel.app for launch
- Buy domain later (won't affect users)
- Can update DNS anytime

**Checkpoint:** Custom domain working? ✅ (or using Vercel domain)

---

### 🟢 FINAL GO-LIVE CHECK (9:55am - 10:15am)

**Production Checklist:**

```bash
✅ Landing page loads: https://wizlingo.app (or .vercel.app)
✅ All pages render without errors
✅ Signup form works end-to-end
✅ Email verification works
✅ Database is connected (students created)
✅ No console errors
✅ Page loads in <2 seconds
✅ Mobile responsive (test on phone)
✅ Uptime: Running (check Vercel dashboard)
```

**Decision Time:**

**If ALL ✅:**
```
Status: READY FOR B2C LAUNCH
Action: Start recruitment push at 10:00am
Message: "Landing page is LIVE. Send recruitment messages."
```

**If ANY ❌:**
```
Status: BLOCKED
Action: Debug issue (see troubleshooting below)
Escalation: Contact engineering lead
Backup: Use vercel.app domain instead of custom domain
```

---

## 🔧 TROUBLESHOOTING

### "Landing page doesn't load"

```bash
# 1. Check Vercel deployment status
#    vercel.com → Project → Deployments
#    Should show green checkmark

# 2. If failed, check logs
#    Click failed deployment
#    Look for error messages

# 3. Common fixes:
#    - Clear browser cache (Cmd+Shift+R)
#    - Check for typos in environment variables
#    - Verify DATABASE_URL is set
```

### "DATABASE_URL not found" error

```bash
# 1. Verify you set the environment variable in Vercel
# 2. Verify it's scoped to "Production"
# 3. Trigger redeploy:
#    - Go to Vercel dashboard
#    - Click "Deployments"
#    - Click three dots on latest deployment
#    - Click "Redeploy"
```

### "Email not sending"

```bash
# This is OK for now. You can test email later.
# For launch, users can still see verification page
# Email setup is next step (AWS SES configuration)
```

### "Migration failed"

```bash
# If npx prisma migrate deploy fails:
# 1. Check DATABASE_URL is correct
# 2. Try: npx prisma db push --production
# 3. If still fails, contact engineering
# 4. You can launch without migrations (not ideal but possible)
```

### "Signup form not working"

```bash
# 1. Check browser console (F12 → Console)
# 2. Look for red error messages
# 3. Take screenshot of error
# 4. Contact engineering with error message
```

---

## 📞 ESCALATION PATH

**If something breaks during deployment:**

1. **First:** Try troubleshooting steps above
2. **Second:** Check Vercel/Railway status pages
3. **Third:** Contact your engineering lead
4. **Last Resort:** Use vercel.app domain, skip custom domain for now

**Estimated fix time:** 15-30 minutes for most issues

---

## ✅ DEPLOYMENT COMPLETE

Once all tests pass and landing page is live:

```
10:15am → B2C Recruitment Push Starts
├─ Send WhatsApp messages (50 parent groups)
├─ Post Facebook messages (5 groups)
├─ Email Edvanta network
└─ Target: 50+ signups by 6pm

6:00pm → End-of-Day Review
├─ How many signups? (Target: 50+)
├─ Any critical bugs? (Fix immediately)
├─ Email delivery working? (Test manual email)
└─ Decision: READY to continue OR pause for fixes?

If all green: 🚀 WizLingo is LIVE
```

---

## 📝 SIGN-OFF

**Deployed by:** _________________ (name)  
**Date:** June 5, 2026  
**Time:** _________ (completion time)  
**Status:** ✅ LIVE / ⏸️ ON HOLD / ❌ FAILED  

**Notes:**
```
[Any issues encountered / notes for next day]
```

---

**Questions?** Refer to: WIZLINGO_MASTER_PLAYBOOK.md (Section 6: Immediate Action Plan)
