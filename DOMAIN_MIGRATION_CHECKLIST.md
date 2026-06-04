# 🚀 Domain Migration Checklist: edvanta.co.in → wizlingo.app

**Timeline:** Execute after 4 weeks of pilot success (estimated mid-July 2026)  
**Downtime:** None (301 redirects keep old links working)  
**Steps:** 12 (estimated 2-3 hours including DNS propagation)

---

## ✅ Pre-Migration Checklist (Week Before)

- [ ] **Confirm Success Metrics Met:**
  - [ ] 100+ students actively using app
  - [ ] 80%+ daily active rate
  - [ ] 4.0+ star rating on feedback
  - [ ] Zero critical bugs
  - [ ] Teachers request continuation

- [ ] **Backup Current Data:**
  ```bash
  pg_dump $DATABASE_URL > wizlingo_backup_predomainmigration.sql
  ```

- [ ] **Alert Schools:**
  - [ ] Email: "WizLingo URL changing to wizlingo.app (old URL still works)"
  - [ ] QR codes: Prepare new codes with new domain
  - [ ] Timeline: "Change effective [date], old links redirect automatically"

- [ ] **Prepare Stakeholders:**
  - [ ] Edvanta team: Brief on migration plan
  - [ ] Marketing: Update website with new domain
  - [ ] Support: Prepare FAQ for URL change

---

## 🔧 Technical Migration (Day Of)

### Step 1: Register Domain
```bash
# Cost: $8.88-15/year depending on registrar
# Recommended: Namecheap, GoDaddy, Domain.com

Domain: wizlingo.app
Registrar: [Choose one]
DNS Provider: Railway (auto) or Route 53 (if AWS)
Duration: 2 years (to avoid renewal headaches)
```

**Timeline:** 5 minutes  
**Status:** ☐ Complete

---

### Step 2: Update DNS Records
```bash
# At your registrar (Namecheap, GoDaddy, etc.):

# Primary Record:
wizlingo.app  A         35.201.XXX.XXX  (Railway IP)
              AAAA      2600:1901:...   (Railway IPv6)
              CNAME     app.railway.app (simplest)

# Verify:
nslookup wizlingo.app
dig wizlingo.app

# Wait for propagation:
# Usually 5-30 min, sometimes up to 24h
# Test: curl https://wizlingo.app/api/health
```

**Timeline:** 10 minutes (setup) + 30 min (propagation)  
**Status:** ☐ Complete

---

### Step 3: Update Environment Variables

**Production (Railway):**
```bash
# In Railway Dashboard → Variables:

# OLD
NEXT_PUBLIC_APP_URL=https://wizlingo.edvanta.co.in

# NEW
NEXT_PUBLIC_APP_URL=https://wizlingo.app
```

**Auto-deploy on push:**
```bash
git add .env.production  # if you have separate env file
git commit -m "Update domain to wizlingo.app"
git push origin main
# Railway auto-redeploys (5-10 min)
```

**Timeline:** 5 minutes  
**Status:** ☐ Complete

---

### Step 4: Add 301 Redirect (Subdomain → New Domain)

**Create redirect endpoint in Next.js:**

Create: `app/api/redirect/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Redirect wizlingo.edvanta.co.in to wizlingo.app
  if (request.headers.get('host')?.includes('wizlingo.edvanta.co.in')) {
    const url = new URL(request.url);
    url.hostname = 'wizlingo.app';
    return NextResponse.redirect(url, { status: 301 });
  }
  return NextResponse.next();
}
```

**Or configure at DNS level (simpler):**
```
# At edvanta.co.in DNS:
wizlingo  CNAME  wizlingo.app  (permanent redirect)
```

**Timeline:** 5 minutes  
**Status:** ☐ Complete

---

### Step 5: Update QR Codes
```bash
# Generate new QR codes pointing to:
https://wizlingo.app/auth/phone-signup
https://wizlingo.app/teacher/dashboard
https://wizlingo.app/admin/beta-dashboard

# Tools: https://qr-code-generator.com
# Create: 3 QR codes (student, teacher, admin)
# Print: New posters for schools
```

**Timeline:** 10 minutes  
**Status:** ☐ Complete

---

### Step 6: Update Documentation

**Files to update:**
- [ ] `.env.example` — Update URL
- [ ] `README.md` — Update all URLs
- [ ] `DEPLOYMENT.md` — Update example URLs
- [ ] `BETA_DISTRIBUTION.md` — Update installation links
- [ ] School communication templates — Update links

**Commands:**
```bash
# Find all references
grep -r "wizlingo.edvanta.co.in" --include="*.md" --include="*.ts" --include="*.tsx"

# Replace (with verification)
sed -i 's/wizlingo.edvanta.co.in/wizlingo.app/g' *.md
```

**Timeline:** 15 minutes  
**Status:** ☐ Complete

---

### Step 7: Update Code References

**Check for hardcoded domains:**
```typescript
// Search for any hardcoded URLs in code
grep -r "wizlingo.edvanta.co.in\|https://wiz" app/ lib/

// Should all use NEXT_PUBLIC_APP_URL from env
import { getAppUrl } from '@/lib/app-url';
const url = getAppUrl(); // Always pulls from env
```

**Files to check:**
- [ ] `lib/referral-service.ts`
- [ ] `lib/badge-config.ts`
- [ ] `lib/parent-email-templates.ts`
- [ ] `components/**/*.tsx` (any links)

**Timeline:** 10 minutes  
**Status:** ☐ Complete

---

### Step 8: Update SSL Certificate

**Railway (Auto):**
```bash
# Railway auto-generates SSL for new domain
# No action needed
# Verify: Visit https://wizlingo.app
# Browser should show "secure" lock
```

**AWS (If using):**
```bash
# Request cert in AWS Certificate Manager
aws acm request-certificate \
  --domain-name wizlingo.app \
  --validation-method DNS

# Add CNAME record to verify ownership
# Attach to ALB in Route 53
```

**Timeline:** 5 minutes (Railway) or 30 minutes (AWS)  
**Status:** ☐ Complete

---

### Step 9: Update Email Templates

**Search and update:**
```bash
grep -r "wizlingo.edvanta.co.in" lib/email* components/email*

# Common files:
# - lib/parent-email-templates.ts
# - lib/email-whatsapp-url.ts
# - Any auth emails
```

**Timeline:** 5 minutes  
**Status:** ☐ Complete

---

### Step 10: Test New Domain

**Critical Tests:**
```bash
# 1. API Health
curl https://wizlingo.app/api/health
# Expected: {"status": "healthy"}

# 2. Student Login
# Visit https://wizlingo.app/auth/phone-signup
# Try: Phone signup with test number
# Verify: Can complete flow

# 3. Teacher Dashboard
# Visit https://wizlingo.app/teacher/dashboard
# Verify: Dashboard loads, students visible

# 4. Admin Dashboard
# Visit https://wizlingo.app/admin/beta-dashboard
# Verify: Real-time stats working

# 5. PWA Install
# Visit https://wizlingo.app
# Click "Install app"
# Verify: Installs on home screen

# 6. Old Domain Redirect
# Visit https://wizlingo.edvanta.co.in
# Verify: Redirects to https://wizlingo.app

# 7. Mobile Responsiveness
# Test on Android & iOS Safari
# Verify: All features work
```

**Timeline:** 15 minutes  
**Status:** ☐ Complete

---

### Step 11: Deploy to Production

```bash
# 1. Commit all changes
git add .env.production .env.example *.md app/ lib/
git commit -m "Migrate domain from wizlingo.edvanta.co.in to wizlingo.app

- Update all documentation links
- Add domain migration checklist
- Update env variables
- 301 redirect from old domain
- New QR codes prepared

This enables subscriber phase and independent brand launch.

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"

# 2. Push to main (auto-deploys to production)
git push origin main

# 3. Wait for Railway to deploy
# Check: Railway Dashboard → Deployments
# Expected time: 5-10 minutes

# 4. Verify deployment
curl https://wizlingo.app/api/health
```

**Timeline:** 10 minutes  
**Status:** ☐ Complete

---

### Step 12: Communicate to Users

**Email to Schools:**
```
Subject: Important: WizLingo URL has changed 📱

Hi [School Name],

Great news! WizLingo has graduated from beta and now has its own domain.

**What's changing:**
- OLD: wizlingo.edvanta.co.in
- NEW: wizlingo.app ✨

**For your students:**
- Old links still work (auto-redirect)
- New QR codes attached (print these new ones)
- Update bookmarks to wizlingo.app

**For teachers:**
- Dashboard: https://wizlingo.app/teacher/dashboard
- Admin: https://wizlingo.app/admin/beta-dashboard

**Questions?** Reply to this email or call [support number]

Keep learning! 🚀
WizLingo Team
```

**Social Media (Optional):**
```
🎉 WizLingo is growing up! 🎓

We're excited to announce: WizLingo now has its own domain!

wizlingo.edvanta.co.in → wizlingo.app

Same great learning platform, new independent brand.
Backed by Edvanta, built for schools.

Learn more: wizlingo.app

#EdTech #EnglishLearning #IndianSchools
```

**Timeline:** 10 minutes  
**Status:** ☐ Complete

---

## 📊 Verification Checklist

### Immediate (Day 1)
- [ ] DNS propagated (`nslookup wizlingo.app` resolves)
- [ ] Health check passes (`/api/health` returns 200)
- [ ] Login works with new domain
- [ ] Teacher dashboard loads data
- [ ] Admin dashboard shows stats
- [ ] SSL certificate valid (no browser warnings)
- [ ] Old domain redirects to new domain
- [ ] PWA installs on Android/iOS

### After 24 Hours
- [ ] No error spike in logs
- [ ] Teachers report normal access
- [ ] Students can access without issues
- [ ] No bounce in daily active users
- [ ] Support email has no "can't access" complaints

### After 1 Week
- [ ] Google/Bing indexed new domain
- [ ] Old domain links still work (redirect working)
- [ ] All metrics normal or improved
- [ ] Schools confirm everything working

---

## 🚨 Rollback Plan (If Something Goes Wrong)

**If DNS issues:**
```bash
# Revert CNAME to old subdomain:
wizlingo  CNAME  app.railway.app

# Update env var back:
NEXT_PUBLIC_APP_URL=https://wizlingo.edvanta.co.in

# Wait 30 min for DNS cache to clear
```

**If database issues:**
```bash
# Restore backup
psql $DATABASE_URL < wizlingo_backup_predomainmigration.sql

# No downtime — domain switch is separate from data
```

**Timeline:** 5 minutes to revert  
**Status:** ☐ Ready

---

## 📈 Post-Migration Tasks

### Immediate (Week 1)
- [ ] Monitor error logs daily
- [ ] Check student/teacher feedback
- [ ] Verify daily active users steady or up
- [ ] Confirm no support complaints

### Short-term (Week 2-4)
- [ ] Request Google Search Console verification
- [ ] Decommission old QR codes (optional)
- [ ] Update school materials/signage
- [ ] Plan PR/announcement (optional)

### Long-term (Month 2+)
- [ ] Optional: Add www.wizlingo.app subdomain
- [ ] Optional: Register wizlingo.co.in as backup
- [ ] Plan global expansion (wizlingo.app works globally)
- [ ] Update investor/stakeholder materials

---

## 📞 Support During Migration

**If schools can't access:**
1. Clear browser cache
2. Try incognito mode
3. Test on different device
4. Wait 30 min (DNS propagation)
5. Email support@edvanta.co.in

**If teacher sees different data:**
- Old links redirect → might be cached data
- Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- Clear ServiceWorker cache

**If PWA doesn't update:**
- Uninstall and reinstall
- Clear browser application cache
- ServiceWorker should auto-update in 24h

---

## Summary

| Task | Time | Status |
|------|------|--------|
| Register domain | 5 min | ☐ |
| Update DNS | 10 min + 30 min (prop) | ☐ |
| Update env vars | 5 min | ☐ |
| Add redirect | 5 min | ☐ |
| Update QR codes | 10 min | ☐ |
| Update docs | 15 min | ☐ |
| Update code | 10 min | ☐ |
| Update email templates | 5 min | ☐ |
| Test new domain | 15 min | ☐ |
| Deploy | 10 min | ☐ |
| Communicate | 10 min | ☐ |
| **TOTAL** | **~2-3 hours** | ☐ |

---

**Ready for subscriber phase!** After successful migration, WizLingo becomes an independent brand ready for broader growth.

