# 📋 Railway Variables Quick Reference

## ✅ Auto-Created (Do Nothing)

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `postgres://user:pass@host/db` | Created by PostgreSQL service |

---

## ❌ Don't Add Manually

```
❌ DATABASE_URL - Let Railway create this
❌ PORT - Railway sets automatically
❌ NODE_VERSION - Already configured
```

---

## ✅ YOU MUST ADD (5 Variables)

### **1. NEXT_PUBLIC_APP_URL**
```
Name: NEXT_PUBLIC_APP_URL
Value: https://wizlingo.edvanta.co.in
```
*Pilot domain (change to wizlingo.app in July)*

---

### **2. JWT_SECRET**
```
Name: JWT_SECRET
Value: (copy from your .env.local)
```
*Generate with: `openssl rand -base64 32`*

---

### **3. ANTHROPIC_API_KEY**
```
Name: ANTHROPIC_API_KEY
Value: sk-ant-... (from Anthropic Console)
```
*Get from: https://console.anthropic.com/account/keys*

---

### **4. WIZADMIN_SECRET**
```
Name: WIZADMIN_SECRET
Value: (copy from your .env.local)
```
*Generate with: `openssl rand -base64 32`*

---

### **5. NODE_ENV**
```
Name: NODE_ENV
Value: production
```
*Always "production" for deployed app*

---

## 🎯 How to Add in Railway Dashboard

```
1. Go to https://railway.app/dashboard
2. Click your Project
3. Click "app" service (NOT PostgreSQL)
4. Click "Variables" tab
5. See DATABASE_URL (already there ✅)
6. Click "+ Add Variable"
7. Enter Name: [from above]
   Enter Value: [from above]
8. Click "Save"
9. Repeat for all 5 variables
```

---

## 📋 Checklist

- [ ] PostgreSQL service added (creates DATABASE_URL ✅)
- [ ] `NEXT_PUBLIC_APP_URL` = `https://wizlingo.edvanta.co.in`
- [ ] `JWT_SECRET` = (from .env.local)
- [ ] `ANTHROPIC_API_KEY` = (from Anthropic)
- [ ] `WIZADMIN_SECRET` = (from .env.local)
- [ ] `NODE_ENV` = `production`

**Total: 6 variables (1 auto + 5 manual)**

---

## 🚀 After Adding Variables

```bash
git push origin main
# or Manual Deploy in Railway
# Wait 5-10 minutes for deployment
# Check logs for "Connected to database"
# Test: curl https://your-app.railway.app/api/health
```

---

**Full guide:** `RAILWAY_DATABASE_LINKING.md`  
**Setup guide:** `RAILWAY_SETUP.md`

