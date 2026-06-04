# 🧪 QA & TESTING CHECKLIST
## Pre-Launch Testing Guide (June 5, 2026)

**Purpose:** Verify all systems working before B2C launch  
**Timeline:** 30 minutes (parallel testing)  
**Tester:** QA Engineer  
**Date:** June 5, 2026  

---

## ✅ ENVIRONMENT SETUP

- [ ] All environment variables set in .env.production? ✅
- [ ] DATABASE_URL working (Prisma migrations successful)?
- [ ] Vercel deployment complete (no build errors)?
- [ ] All services connected (Railway, AWS SES, Posthog, Razorpay)?
- [ ] .gitignore includes .env.production?
- [ ] No credentials in code or logs?

---

## 🌐 WEBSITE TESTS

### Landing Page Load Tests

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| **Page loads** | <2 seconds | ___ sec | ✅/❌ |
| **No 404 errors** | All assets load | ___ | ✅/❌ |
| **Hero text visible** | "Learn English in 5 min/day" | ___ | ✅/❌ |
| **Feature cards show** | 3 cards (Reading, Speaking, Badges) | ___ | ✅/❌ |
| **Badges display** | 5 badge images visible | ___ | ✅/❌ |
| **Social proof visible** | "Join 100+ beta testers" | ___ | ✅/❌ |
| **CTA button visible** | "Start Free Trial" button | ___ | ✅/❌ |
| **Footer loads** | Links, copyright visible | ___ | ✅/❌ |
| **No console errors** | F12 → Console is clean | ___ errors | ✅/❌ |
| **No network errors** | All requests 200 OK | ___ failed | ✅/❌ |

### Responsive Design Tests

| Viewport | Status | Notes |
|----------|--------|-------|
| **Mobile (320px)** | ✅/❌ | Stack vertically? |
| **Tablet (768px)** | ✅/❌ | 2-column layout? |
| **Desktop (1440px)** | ✅/❌ | Full width? |

**How to test:**
```
1. Open DevTools (F12)
2. Click device toggle (top left)
3. Test each breakpoint
4. Verify no overflow, text readable
```

### Performance Tests

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| **Page load time** | <2 sec | ___ sec | ✅/❌ |
| **First paint** | <1 sec | ___ sec | ✅/❌ |
| **Lighthouse score** | >85 | ___ | ✅/❌ |

**How to test:**
```
1. DevTools → Performance tab
2. Click record
3. Reload page
4. Stop recording
5. Check metrics in summary
```

---

## 📝 SIGNUP FLOW TESTS

### Test 1: Form Validation

```
Test Case: Submit empty form
Expected: Error message "All fields required"
Result: ✅/❌

Test Case: Submit with invalid email (abc@def)
Expected: Error message "Invalid email format"
Result: ✅/❌

Test Case: Submit with valid data
Expected: Form accepts, proceeds to verification
Result: ✅/❌
```

**Form Validation Checklist:**
- [ ] Name field: min 2 chars, max 50 chars
- [ ] Email field: valid email format required
- [ ] Grade field: dropdown with valid options
- [ ] Date of Birth: valid date required
- [ ] No XSS injection (test with: `<script>alert('xss')</script>`)
- [ ] No SQL injection (test with: `'; DROP TABLE--`)
- [ ] Trimming whitespace from inputs

### Test 2: Email Verification Flow

```
Step 1: Signup with test email (your@email.com)
- [ ] Form submits successfully
- [ ] Redirects to verification page
- [ ] Message: "Check your email for verification code"

Step 2: Check email inbox
- [ ] Email arrives within 2 minutes
- [ ] Email from: noreply@wizlingo.app
- [ ] Email contains: Verification code (6 digits)
- [ ] Email has unsubscribe link
- [ ] Email is not in spam folder

Step 3: Enter verification code
- [ ] Copy code from email
- [ ] Paste into verification page
- [ ] Code field accepts only digits
- [ ] Submit button enabled
- [ ] Page shows "Email verified!"
- [ ] Redirects to login page

Step 4: Try invalid code
- [ ] Try random 6-digit code
- [ ] Expected: Error "Invalid code"
- [ ] Code limit: 3 attempts max
- [ ] After 3 fails: "Code expired, request new one"
```

### Test 3: Resend Verification

```
Scenario: User doesn't receive first email

- [ ] Click "Resend Code" button
- [ ] Expected: "Code sent. Check email in 60 seconds"
- [ ] Resend button disabled for 60 seconds (countdown shown)
- [ ] New code arrives in email
- [ ] New code works for verification
- [ ] Old code no longer works
- [ ] Rate limiting: Max 3 resends per hour
```

---

## 🔐 AUTHENTICATION TESTS

### Test 1: Student Creation

```bash
Database test:
1. After successful signup, check student in database:

export DATABASE_URL="[your_connection_url]"
npx prisma studio

2. Go to "Student" table
3. Should see new student:
   - name: Your Name
   - email: your@email.com
   - grade: (your selected grade)
   - dateOfBirth: (your DOB)
   - emailVerified: true
   - createdAt: today's date
```

- [ ] Student record created?
- [ ] All fields populated correctly?
- [ ] Grade is stored as integer?
- [ ] Email verified flag is true?

### Test 2: Login (if implemented)

```
Test: Login with email + code
- [ ] Request login link
- [ ] Email arrives with code
- [ ] Code is single-use (can't reuse)
- [ ] Code expires after 10 minutes
- [ ] Login redirects to dashboard
```

---

## 💾 DATABASE TESTS

### Verify All Tables Created

```bash
npx prisma studio

Check these tables exist:
- [ ] Student
- [ ] Class
- [ ] School
- [ ] ReadingSession
- [ ] SpeakingSession
- [ ] Badge
- [ ] StudentProgress
- [ ] Certificate
- [ ] VerificationToken
- [ ] EmailLog
```

### Test Database Constraints

```
Insert invalid data (should fail):
- [ ] Try insert Student with duplicate email (should fail)
- [ ] Try insert with NULL email (should fail)
- [ ] Try insert with invalid grade (should fail)
```

---

## 📧 EMAIL TESTS

### Test 1: Welcome Email

```
Trigger: User signs up with email test@example.com
Expected email:
- [ ] Sender: noreply@wizlingo.app
- [ ] Subject: Contains "WizLingo"
- [ ] Contains verification code (6 digits)
- [ ] Contains link back to verification page
- [ ] HTML formatted (not plain text)
- [ ] Arrives in inbox within 2 minutes
- [ ] NOT in spam folder
```

### Test 2: Email Rendering

```
Open email and verify:
- [ ] WizLingo logo visible
- [ ] Verification code clearly displayed
- [ ] Colors match brand (orange/purple)
- [ ] Links are clickable
- [ ] Mobile responsive (readable on phone)
- [ ] No broken images
```

### Test 3: Email Tracking

```
After sending email:
- [ ] Check Posthog → Email events
- [ ] Event: "email_sent" logged?
- [ ] Event: "email_opened" tracked?
- [ ] Open tracking works (pixel/image loads)
```

---

## 📊 ANALYTICS TESTS

### Posthog Events

```
Action: Visit landing page
Expected Posthog events:
- [ ] page_view recorded
- [ ] session created
- [ ] props: page = "landing"
- [ ] props: device = "desktop"

Action: Click "Start Free Trial" button
Expected:
- [ ] button_click recorded
- [ ] props: button_id = "start_trial_cta"

Action: Complete signup form
Expected:
- [ ] form_submitted recorded
- [ ] props: form_name = "signup"
- [ ] props: grade = (user's selected grade)
```

**How to verify:**
```
1. Open posthog.com dashboard
2. Go to "Events" tab
3. Filter by date (today)
4. Should see events from your test user
5. Check event count and properties
```

---

## 🔗 NAVIGATION & LINKS

### Test All Links Work

- [ ] Logo links to homepage
- [ ] "Start Free Trial" → signup page
- [ ] "Sign Up" links in footer → signup page
- [ ] Footer "Privacy" link → privacy page (if exists)
- [ ] Footer "Terms" link → terms page (if exists)
- [ ] Footer "Contact" link → contact form (if exists)
- [ ] Verification page "Resend Code" works
- [ ] All buttons have hover state (visual feedback)

### Test No Broken Links

```bash
Browser DevTools → Network tab
Reload page
Check for:
- [ ] 404 errors (red status)
- [ ] Timeout errors
- [ ] CORS errors
All should be green (200 OK)
```

---

## 🔒 SECURITY TESTS

### XSS (Cross-Site Scripting) Prevention

```
In signup form, try entering:
Name field: <script>alert('xss')</script>
Email field: test@example.com"><script>alert('xss')</script>

Expected: Script doesn't execute, text stored as-is
Result: ✅/❌
```

### SQL Injection Prevention

```
In signup form, try entering:
Email field: test@example.com'; DROP TABLE Student;--

Expected: Input sanitized, no table dropped
Result: ✅/❌
```

### HTTPS/SSL

```
Check:
- [ ] Site loads over HTTPS (lock icon in address bar)
- [ ] No mixed content (not loading HTTP assets on HTTPS page)
- [ ] Certificate valid (click lock → "Connection secure")
- [ ] Redirect HTTP → HTTPS (try http://wizlingo.app → redirects to https)
```

### Environment Variables

```
Check:
- [ ] No credentials visible in browser DevTools
- [ ] No credentials logged to console
- [ ] Database URL not exposed to client
- [ ] API keys not in request payloads (network tab)
```

---

## 🌍 BROWSER COMPATIBILITY

Test on:

| Browser | Version | Result |
|---------|---------|--------|
| **Chrome** | Latest | ✅/❌ |
| **Firefox** | Latest | ✅/❌ |
| **Safari** | Latest | ✅/❌ |
| **Edge** | Latest | ✅/❌ |
| **Mobile Safari** | iOS latest | ✅/❌ |
| **Mobile Chrome** | Android latest | ✅/❌ |

**Test checklist for each browser:**
- [ ] Page loads without errors
- [ ] Form submission works
- [ ] Email verification works
- [ ] No console errors (F12)

---

## 📱 MOBILE TESTING

### iOS (iPhone/iPad)

```
Device: iPhone 12/13
Browser: Safari
Tests:
- [ ] Page loads
- [ ] Signup form visible and usable
- [ ] Touch targets are >44x44px (easy to tap)
- [ ] Keyboard doesn't cover form fields
- [ ] Submit button is accessible
- [ ] No horizontal scroll needed
```

### Android

```
Device: Android phone (Samsung, Pixel, etc.)
Browser: Chrome
Tests:
- [ ] Page loads
- [ ] Signup form visible and usable
- [ ] Touch targets are >48x48px
- [ ] Keyboard works properly
- [ ] No layout issues
- [ ] Viewport meta tag working (page zooms correctly)
```

---

## 📈 METRICS BASELINE

After launch, record these baseline metrics:

| Metric | Target | Actual | Date |
|--------|--------|--------|------|
| **Page load time** | <2 sec | ___ | Jun 5 |
| **Signup completion rate** | >30% | ___ | Jun 5 |
| **Email verification rate** | >70% | ___ | Jun 5 |
| **Uptime** | 99.5%+ | ___ | Jun 5 |
| **Error rate** | <1% | ___ | Jun 5 |

---

## 🐛 KNOWN ISSUES & WORKAROUNDS

**Issue 1: Email not arriving**
- Workaround: Check spam folder
- Fix: Verify AWS SES domain in console
- Timeline: 15 min

**Issue 2: Verification code expired**
- Workaround: Request new code (Resend button)
- Fix: Increase token expiry if needed
- Timeline: 5 min

**Issue 3: Form validation not working**
- Workaround: Manually enter data carefully
- Fix: Check browser console for JS errors
- Timeline: 15 min

---

## ✅ FINAL GO/NO-GO DECISION

### All Tests Passing? ✅ GO

```
Status: READY FOR B2C LAUNCH
Action: Proceed with recruitment push at 10:00am
Confidence: HIGH
Risk: LOW
```

### Some Tests Failing? ⏸️ ON HOLD

```
Status: BLOCKED
Failing tests:
1. [List failing tests]
2. [Priority for fix]
3. [Estimated fix time]

Decision: Fix issues OR launch with limited features?
```

### Critical Failure? ❌ NO-GO

```
Status: DELAY LAUNCH
Reason: [Describe blocker]
Actions: [What needs to be fixed]
New timeline: [Revised launch time]
```

---

## 📝 TEST SUMMARY

**Date:** June 5, 2026  
**Tester:** ________________  
**Status:** ✅ PASS / ⏸️ HOLD / ❌ FAIL  

**Passing tests:** ___ / 60+  
**Failing tests:** ___  
**Critical issues:** ___  

**Notes:**
```
[Any issues, workarounds, or observations]
```

**Sign-off:** ________________ (Signature)  
**Time:** _________  

---

**Questions?** Refer to: WIZLINGO_MASTER_PLAYBOOK.md (Section 6: Immediate Action Plan)
