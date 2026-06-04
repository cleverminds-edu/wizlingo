# ⚡ Quick Start: Railway Deployment (5 Minutes)

**TL;DR:** Deploy WizLingo to Railway in 5 quick steps

---

## 1️⃣ Create Railway Account
```
Visit: https://railway.app
Click: "Start Free"
Auth: Sign in with GitHub
```

---

## 2️⃣ Create Project
```
Click: "New Project"
Select: "Deploy from GitHub repo"
Choose: Your reading-app repository
Wait: 30 seconds
```

---

## 3️⃣ Add PostgreSQL
```
Click: "+ Add Service"
Select: "Database" → "PostgreSQL"
Click: "Create"
Wait: 1 minute (auto-creates DATABASE_URL)
```

---

## 4️⃣ Set Environment Variables

Click your **"app"** service → **"Variables"** tab → Add:

```
NEXT_PUBLIC_APP_URL=https://wizlingo.edvanta.co.in
JWT_SECRET=your-secret-from-env-local
ANTHROPIC_API_KEY=your-api-key
WIZADMIN_SECRET=your-admin-secret
NODE_ENV=production
```

(Copy secrets from your `.env.local`)

---

## 5️⃣ Deploy

**Option A (Auto):**
```bash
git push origin main
# Wait 5-10 minutes (auto-deploys)
```

**Option B (Manual):**
```
Click: "Deployments" → "New Deployment"
Select: "main" branch
Wait: 5-10 minutes
```

---

## ✅ Done!

**Your app is live at:**
```
https://wizlingo-xxxxx.railway.app/api/health
```

**Test:**
```bash
curl https://wizlingo-xxxxx.railway.app/api/health
```

**Next:**
- Share with schools
- Create QR codes
- Monitor logs

---

**Full guide:** See `RAILWAY_SETUP.md`

