# 🔗 How Railway Links PostgreSQL to Your Project

**Quick Answer:** Railway auto-links them, you just need to reference the variable.

---

## 🎯 What Happens Automatically

When you add PostgreSQL to a Railway project:

```
┌─────────────────────────────────────┐
│ You click: "+ Add Service"           │
│ Select: "Database" → "PostgreSQL"    │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│ Railway AUTOMATICALLY:                │
│ 1. Creates PostgreSQL instance       │
│ 2. Generates DATABASE_URL            │
│ 3. Makes it accessible to your app   │
│ 4. Sets DATABASE_URL in Variables    │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│ Your App sees: DATABASE_URL          │
│ Example:                              │
│ postgres://user:pass@host:5432/db    │
└─────────────────────────────────────┘
```

---

## 📝 What You Need to Do

### ✅ **You Don't Need to Add DATABASE_URL Manually**

Railway creates it automatically when you add PostgreSQL service.

### ✅ **You Just Reference It in Your Code**

Your `prisma.ts` already does this:

```typescript
// lib/prisma.ts
const prismaClientSingleton = () => {
  return new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL, // Railway sets this
  });
};
```

Your `.env.local` has:
```
DATABASE_URL="postgresql://maddy@localhost:5432/wizlingo"
```

Railway **automatically replaces** this with the production URL.

---

## 🔄 The Flow

### **Step 1: Add PostgreSQL Service**
```
Railway Dashboard
├─ Click "+ Add Service"
├─ Select "Database"
├─ Choose "PostgreSQL"
└─ Click "Create"
```

**Result:** PostgreSQL instance created ✅

---

### **Step 2: Railway Auto-Sets DATABASE_URL**

**In Railway Variables (auto-created):**
```
DATABASE_URL=postgresql://postgres:xxxxx@xxx.railway.app:5432/railway
```

**You see it in:**
- Railway Dashboard → PostgreSQL Service → "Variables" tab
- Shows exactly what your app will use

---

### **Step 3: Your App Uses It**

**In your code (already done):**
```typescript
// lib/prisma.ts
const datasourceUrl = process.env.DATABASE_URL;
// Railway provides: DATABASE_URL=postgres://...

// Your app connects automatically
const prisma = new PrismaClient();
```

**In prisma.ts:**
```typescript
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // ← Reads from env
}
```

---

## 📊 The Variables You NEED to Add Manually

Railway auto-creates ONE variable:
- ✅ `DATABASE_URL` (auto)

You MUST add THESE 5 manually:

| Variable | Value | Where From |
|----------|-------|-----------|
| `NEXT_PUBLIC_APP_URL` | `https://wizlingo.edvanta.co.in` | Your choice |
| `JWT_SECRET` | Random string (32+ chars) | Your `.env.local` |
| `ANTHROPIC_API_KEY` | From Anthropic console | Your `.env.local` |
| `WIZADMIN_SECRET` | Random string | Your `.env.local` |
| `NODE_ENV` | `production` | Your choice |

---

## 🔐 How to Add Variables in Railway

### **Step-by-Step:**

**1. Open Railway Dashboard**
```
https://railway.app/dashboard
```

**2. Click Your Project**
```
Reading App (or whatever you named it)
```

**3. Click "app" Service** (the Node.js one)
```
Not the PostgreSQL service - the Node.js app
```

**4. Go to "Variables" Tab**
```
Railway shows:
├─ DATABASE_URL (already set by PostgreSQL)
├─ [Add new variable...]
```

**5. Click "Add Variable"** (or + icon)

**6. Add These Variables:**

```
Name: NEXT_PUBLIC_APP_URL
Value: https://wizlingo.edvanta.co.in

Name: JWT_SECRET
Value: (copy from your .env.local)

Name: ANTHROPIC_API_KEY
Value: (copy from your .env.local)

Name: WIZADMIN_SECRET
Value: (copy from your .env.local)

Name: NODE_ENV
Value: production
```

---

## ✅ Verification: Is DATABASE_URL Linked?

### **Check in Railway Dashboard:**

**1. Click PostgreSQL Service**
```
You should see:
├─ Status: ✅ Healthy
├─ Variables: DATABASE_URL = postgres://...
```

**2. Click App Service**
```
You should see:
├─ DATABASE_URL (inherited from PostgreSQL)
├─ Variables you added (JWT_SECRET, etc.)
```

**3. View Logs After Deploy**
```
Railway Dashboard → Logs tab
Look for:
├─ "Prisma: Migration success"
├─ "Server running on port 3000"
├─ No "database connection error"
```

---

## 🚨 Common Mistakes

### ❌ **WRONG: Adding DATABASE_URL Manually**
```
DON'T do this:
Click "Add Variable"
Name: DATABASE_URL
Value: postgresql://...
```

**Why?** Railway already creates it. You'll have TWO, which confuses things.

---

### ✅ **RIGHT: Let Railway Create DATABASE_URL**
```
1. Add PostgreSQL service (done)
2. Railway auto-creates DATABASE_URL
3. Just add the other 5 variables
4. That's it!
```

---

## 🔍 Where to Find DATABASE_URL

### **Option 1: In PostgreSQL Service**
```
Railway Dashboard
├─ Click "PostgreSQL" service
├─ Go to "Variables" tab
└─ See DATABASE_URL value
```

### **Option 2: In App Service**
```
Railway Dashboard
├─ Click "app" service
├─ Go to "Variables" tab
└─ DATABASE_URL listed there
```

### **Option 3: In Logs After Deploy**
```
When app starts, it logs:
"Connected to database: postgres://..."
```

---

## 📋 Complete Variables Checklist

### **Auto-Created by PostgreSQL (Do Nothing):**
- [x] `DATABASE_URL` — PostgreSQL connection string

### **You Must Add (5 variables):**
- [ ] `NEXT_PUBLIC_APP_URL` = `https://wizlingo.edvanta.co.in`
- [ ] `JWT_SECRET` = (32+ random chars)
- [ ] `ANTHROPIC_API_KEY` = (from Anthropic)
- [ ] `WIZADMIN_SECRET` = (random secret)
- [ ] `NODE_ENV` = `production`

---

## 🔗 Connection Diagram

```
┌──────────────────────────────────────┐
│ Your Code (lib/prisma.ts)             │
│                                       │
│ const prisma = new PrismaClient()    │
│ datasourceUrl: process.env.DATABASE_URL
└──────────────────┬───────────────────┘
                   │
                   │ Reads from
                   │ env variables
                   ▼
┌──────────────────────────────────────┐
│ Railway Environment (Your Project)    │
│                                       │
│ Variables:                            │
│ ├─ DATABASE_URL=postgres://...  ✅   │
│ ├─ JWT_SECRET=...               ✅   │
│ ├─ ANTHROPIC_API_KEY=...        ✅   │
│ ├─ WIZADMIN_SECRET=...          ✅   │
│ └─ NODE_ENV=production          ✅   │
└──────────────────┬───────────────────┘
                   │
                   │ Connects to
                   │ PostgreSQL
                   ▼
┌──────────────────────────────────────┐
│ PostgreSQL Database (Railway)         │
│                                       │
│ Status: ✅ Running                   │
│ Connection: postgres://...            │
│ Available to: Your app                │
└──────────────────────────────────────┘
```

---

## 🎯 The Actual Steps (In Order)

### **When Setting Up on Railway:**

**1. Create Project + Connect GitHub**
```
Railway Dashboard → New Project → Deploy from GitHub
Result: App service created
```

**2. Add PostgreSQL**
```
Railway Dashboard → + Add Service → Database → PostgreSQL
Result: PostgreSQL created, DATABASE_URL auto-set
```

**3. Add Other Variables**
```
Railway Dashboard → app → Variables → Add Variable
Add: NEXT_PUBLIC_APP_URL, JWT_SECRET, ANTHROPIC_API_KEY, WIZADMIN_SECRET, NODE_ENV
Result: 5 variables added (DATABASE_URL already exists)
```

**4. Deploy**
```
git push origin main
OR
Railway Dashboard → Deployments → New Deployment
Result: App builds, DATABASE_URL is available, app starts
```

**5. Verify Connection**
```
curl https://your-app.railway.app/api/health
Railway logs show: "Connected to database"
Result: ✅ All linked correctly
```

---

## 🆘 If DATABASE_URL is Missing

### **Troubleshooting:**

**Check 1: Is PostgreSQL service running?**
```
Railway Dashboard
├─ Click "PostgreSQL" service
├─ Status should be ✅ (green)
├─ If not: Click "Redeploy"
```

**Check 2: Is DATABASE_URL in Variables?**
```
Railway Dashboard
├─ Click "PostgreSQL" service
├─ Go to "Variables" tab
├─ Should see DATABASE_URL=postgres://...
├─ If not: Restart PostgreSQL service
```

**Check 3: Is App Service Connected?**
```
Railway Dashboard
├─ Click "app" service
├─ Go to "Variables" tab
├─ Should show DATABASE_URL (inherited from PostgreSQL)
├─ If not: Click "Redeploy" app
```

**Check 4: Review Logs**
```
Railway Dashboard
├─ Click "app" service
├─ Go to "Logs" tab
├─ Look for errors like "Cannot connect to database"
├─ Check the specific error message
```

---

## 📚 Summary

| Question | Answer |
|----------|--------|
| **Do I add DATABASE_URL manually?** | ❌ No, Railway creates it automatically |
| **Where does DATABASE_URL come from?** | ✅ PostgreSQL service (auto-created) |
| **How many variables do I add?** | ✅ 5 variables (DATABASE_URL is already there) |
| **How does app connect to DB?** | ✅ Via DATABASE_URL environment variable |
| **Do I need to do anything special?** | ❌ No, just deploy normally |
| **Will it work without configuring?** | ❌ No, you need to add the other 5 variables |

---

## ✅ Final Checklist

- [ ] Created Railway account
- [ ] Connected GitHub repository
- [ ] Added PostgreSQL service
- [ ] PostgreSQL service shows ✅ healthy status
- [ ] DATABASE_URL visible in PostgreSQL Variables
- [ ] Added 5 variables to app service (see above)
- [ ] Deployed app (git push or manual)
- [ ] Deployment logs show "Connected to database"
- [ ] Health check passes: `/api/health` → 200 OK
- [ ] App loads without "database connection error"

**Once all checked: ✅ Your database is linked and ready!**

---

**See:** `RAILWAY_SETUP.md` for complete deployment guide

