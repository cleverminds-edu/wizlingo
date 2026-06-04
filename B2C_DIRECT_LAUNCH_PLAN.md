# WizLingo B2C Direct Student Launch Plan
## Skip Schools, Go Straight to Students & Parents

**Strategic Shift:** From B2B school-first → B2C direct individual students  
**Date:** June 4, 2026  
**Impact:** FASTER launch (no school negotiations), SIMPLER onboarding, DIFFERENT metrics  
**Timeline:** Can launch Stage 1 (100-150 students) by **June 10** (not June 6, but without school dependency)

---

## 🎯 THE SHIFT: B2B → B2C

### **What Changes**

| Aspect | B2B (Schools) | B2C (Direct Students) |
|--------|---------------|----------------------|
| **Who signs up** | School decides | Parents/students decide |
| **Recruitment** | School admin provides roster | Individual email/phone signups |
| **Credentialing** | Printed credential cards via school | Email link + password signup |
| **Onboarding time** | 2-3 weeks (coordinate with school) | 2-3 minutes (self-serve) |
| **Pricing model** | ₹200/student/year (bulk) | Freemium or ₹99-299/student/month |
| **CAC (Customer Acquisition Cost)** | ₹15-20K per school | ₹50-200 per student |
| **LTV (Lifetime Value)** | ₹400K per school | ₹2-5K per student |
| **Launch blocker** | School commitment needed | None (direct to users) |
| **Growth** | Slower, predictable | Faster, viral potential |
| **Churn risk** | Low (school commitment) | High (free/low-cost) |

### **What Stays the Same**

- ✅ Product (reading sessions, badges, speech rec)
- ✅ Backend infrastructure (API, database)
- ✅ Email + parent engagement
- ✅ Metrics dashboard (DAU, engagement, accuracy)
- ✅ Speech rec validation
- ✅ Badge system
- ✅ Analytics tracking

---

## 📱 B2C Launch Mechanics (How Students Sign Up)

### **Option 1: Website Signup (Simplest)**
```
User lands on: wizlingo.app
├─ See: Beautiful landing page
├─ Click: "Start Free Trial"
├─ Enter: Name, email, date of birth, grade
├─ Get: Login link via email
├─ Start: First reading session immediately
└─ Monetize: Freemium (3 sessions/week free, unlimited for ₹99/month)
```

### **Option 2: WhatsApp Bot (Fastest)**
```
User WhatsApps: +91-XXXX-XXXXX
├─ Bot: "Hi! Welcome to WizLingo 👋"
├─ Bot: "What's your name?"
├─ User: "Aditya"
├─ Bot: "Welcome Aditya! Click link to start → [wizlingo.app/start/aditya]"
└─ User: Lands in app, starts immediately
```

### **Option 3: App Store (Growth)**
```
User searches: "WizLingo" or "English Reading"
├─ See: App listing (Google Play / App Store)
├─ Install: Takes 30 seconds
├─ Open: Login with email or phone
├─ Start: First session
└─ Note: Publishing takes 3-5 days, not ready for June 6
```

### **Option 4: Social Media (Virality)**
```
TikTok/Instagram ad: "Get smarter at English in 5 min/day"
├─ Click: Lands on wizlingo.app/student
├─ Signup: Email (takes 1 min)
├─ See: Friend's badge (parent shares on WhatsApp)
├─ Click: "Try WizLingo for free"
└─ Viral loop: More friends try → more parent sharing
```

---

## ⚡ 48-HOUR B2C LAUNCH PLAN (June 4-5)

### **TODAY (June 4) - Setup & Validation**

#### **Must Do (4 hours):**

1. **Create landing page** (30 min)
   - Simple one-pager: "Learn English reading in 5 min/day"
   - Call-to-action: "Start Free Trial" button
   - Host on: wizlingo.app or edvanta.com/wizlingo
   - Design: Use existing brand colors + badge designs

2. **Set up email signup flow** (1 hour)
   - Email collection form (name, email, grade)
   - Auto-send welcome email with login link
   - Tool: Use Mailchimp, ConvertKit, or custom API
   - Test: Send yourself a signup email

3. **Configure email-based login** (1 hour)
   - User clicks email link → Generates session token
   - No password needed (simpler for students)
   - Backend: Create `/api/auth/email-login` endpoint
   - Test: Signup → Get email → Click link → Login works

4. **Prepare recruitment channels** (1 hour)
   - WhatsApp broadcast list (your network)
   - Google Docs link to share
   - Social media templates (Facebook, Instagram)
   - Parent group invitations

5. **Validate core systems** (Same as before)
   - ✅ Database migrations
   - ✅ Speech rec on test recordings
   - ✅ Email delivery working
   - ✅ Analytics tracking

**Outcome:** Landing page + signup system ready to collect students

---

### **TOMORROW (June 5) - Go Live**

#### **Morning (9am):**
1. **Launch landing page** (5 min)
   - Share link on WhatsApp, email, social
   - Message: "Help us test WizLingo! Free English reading app, 100 spots available"

2. **Monitor signups** (throughout day)
   - Track: Email signups in real-time
   - Target: 50+ by noon, 100+ by 6pm
   - If slow: Post in parent groups, ask for referrals

3. **Onboard first students** (1 hour)
   - Manually check: First 10 logins work
   - Test: Can they start a reading session?
   - Fix any signup bugs immediately

#### **Evening (6pm):**
1. **Prepare for June 6 launch** (1 hour)
   - Final system checks
   - Ensure analytics tracking DAU/sessions/badges
   - Prepare daily metrics template

---

## 🎯 METRICS: B2C Version (Different from B2B)

### **Stage 1 Success Metrics (By Aug 31)**

**Primary Metrics (4 of 5 must pass):**

| Metric | Target | Why Matters | If Fails |
|--------|--------|------------|----------|
| **DAU (% of signup)** | >50% signup → daily active | Engagement = monetization | <30% = churn too fast |
| **Session completion** | >60% finish reading | Product engagement | <40% = too hard/boring |
| **Speech rec accuracy** | >90% on real voices | Core feature works | <85% = BLOCKER |
| **Badge unlock rate** | >20% earn SPARK | Gamification works | <10% = progression too hard |
| **Parent email opens** | >20% open badge emails | Parent interest signal | <10% = messaging wrong |

**Note:** B2C targets are LOWER than B2B because:
- Free users are less engaged than school users
- No teacher forcing participation
- Mobile is primary device (lower engagement)
- Churn is natural in freemium

---

## 💰 B2C PRICING & MONETIZATION

### **Freemium Model (Recommended for Stage 1)**

```
FREE TIER:
├─ 5 reading sessions/week
├─ 3 speaking sessions/week
├─ View badges
├─ Share on WhatsApp
└─ Limited to 1 month

PAID TIER (₹99-199/month):
├─ Unlimited reading + speaking
├─ All badges + variants
├─ Parent progress reports
├─ No ads
├─ Certificate downloads
└─ Cancel anytime

ANNUAL SUBSCRIPTION (₹999/year = ₹83/month):
├─ Same as monthly
├─ But 20% cheaper
└─ Auto-renew
```

### **B2C Unit Economics**

| Metric | Target | Reality |
|--------|--------|---------|
| **CAC (per student)** | ₹50-200 | Via ads/referrals |
| **Conversion (free → paid)** | 5-10% | Industry standard |
| **LTV (3-year)** | ₹2-5K | If 5% converts @ ₹1200/year |
| **LTV:CAC** | 10-20:1 | Acceptable for D2C |
| **Payback period** | 3-6 months | Typical SaaS |

### **Revenue Projection (B2C vs B2B)**

**If 100 students sign up, 5% convert to paid:**
```
100 students signup (free) → 5 pay ₹99/month
├─ Month 1 revenue: ₹500 (5 × ₹99)
├─ Month 2 revenue: ₹750 (7-8 converting)
├─ Month 3 revenue: ₹1100 (11 converting)
└─ Month 12 revenue: ₹3K+ (30+ customers)
```

**This is MUCH LOWER than B2B**, but:
- No CAC needed (organic growth via referrals)
- Faster validation (days vs months)
- Can reach 1000s of students cheaply
- Better for Series A story: "Viral growth, high engagement"

---

## 📊 B2C RECRUITMENT CHANNELS (Zero CAC)

### **Channel 1: Organic Referrals (Cost: ₹0)**

**How it works:**
- Parent sees child's SPARK badge
- Parent shares on WhatsApp
- Friend clicks link
- Friend signs up (referred)
- You track: Which parent referred

**Virality math:**
- If 10% of parents share → 1 referral per 10 students
- If 30% of referrals convert → 3% viral growth
- 100 students → 3 new via referrals → 3 new → ...
- **Viral coefficient = 0.3 (slow but organic)**

**Improve virality:**
- Add "Refer a friend" button in app
- Unlock colors/badges for referrals
- Send parent emails: "Aditi is learning English! Try free"

### **Channel 2: Parent WhatsApp Groups (Cost: ₹0)**

**How it works:**
- You/Edvanta in parent groups
- Post: "Free English learning app, 100 seats for testing"
- Parents signup themselves
- Track: Which parent group referred

**Expected conversion:**
- 50 parent group messages
- 30% click through
- 15 signups from parent groups
- **Best channel for India**

### **Channel 3: Schools (Hybrid B2B + B2C)**

**How it works:**
- Approach schools: "Can you share WizLingo with parents?"
- Schools don't manage, but promote to parents
- Parents signup directly (B2C)
- You benefit: Cluster effect (same school = leaderboard competition)

**Impact:**
- One school promotion → 50-100 signups from that school
- Creates in-school competitive dynamic
- No B2B contract needed

### **Channel 4: Social Media (Cost: ₹0 organic, ₹1-5K if paid ads)**

**TikTok/Instagram organic:**
- Create 15-second video: Student solves reading, gets badge
- Post: #EnglishLearning #StudyTok #IndianStudents
- Link: "Try free at wizlingo.app"
- Cost: ₹0
- ROI: Unknown (high engagement, low conversion typically)

**Paid ads (Optional):**
- Budget: ₹500-1K for testing
- Target: Parents, ages 25-45, interested in education
- CPC: ₹5-20
- Expected conversion: 2-5%
- Cost per customer: ₹100-500

### **Channel 5: Edvanta Network (Cost: ₹0)**

**Leverage existing Edvanta relationships:**
- Email existing users: "Try WizLingo for free"
- Schools/partnerships: Promote WizLingo to their audiences
- Expected signups: 50-200 from day 1

---

## 🎬 B2C LAUNCH FLOW (June 5-6)

```
DAY 0 (June 4): Setup Complete
├─ Landing page live
├─ Signup form working
├─ Email sending verified
├─ Analytics tracking live
└─ Ready for day 1

DAY 1 (June 5): SOFT LAUNCH
├─ 9am: Share link in WhatsApp groups
│      Message: "Help test WizLingo! Free English app, 100 beta spots"
├─ 12pm: Check analytics
│       └─ How many signups? Is it working?
├─ 3pm: Post on parent Facebook groups
│      Message: "Teachers recommend this for Grade 3-8 English"
├─ 6pm: Email Edvanta network
│      Subject: "Check out WizLingo - Free English learning app"
└─ Evening: First 50-100 users should be signing up

DAY 2 (June 6): MONITOR
├─ 9am: Check overnight signups (target: 100+)
├─ 10am: Email first 10 users
│       "How's your experience? Any bugs?"
├─ 12pm: Post success: "50 students testing WizLingo!"
│       (Creates FOMO, drives more signups)
├─ 3pm: Fix any bugs from user feedback
├─ 6pm: End-of-day metrics review
│       ✅ 100+ signups?
│       ✅ 50+ active sessions today?
│       ✅ No critical bugs?
└─ If YES to all: SUCCESS! Continue growing.
```

---

## 🎯 WEEK 1 GROWTH TARGETS (B2C)

| Day | Signups (Cumulative) | Daily Active | Sessions | Badges Earned |
|-----|----------------------|--------------|----------|---------------|
| Jun 5 (Day 1) | 30 | 20 | 15 | 2 |
| Jun 6 (Day 2) | 80 | 50 | 40 | 8 |
| Jun 7 (Day 3) | 150 | 80 | 70 | 15 |
| Jun 8 (Day 4) | 220 | 120 | 110 | 25 |
| Jun 9 (Day 5) | 280 | 140 | 140 | 35 |
| Jun 10 (Day 6) | 350 | 160 | 180 | 45 |
| Jun 11 (Day 7) | 400 | 180 | 220 | 60 |

**Success = Hit 100+ cumulative by day 3 = Viral word-of-mouth working**

---

## 💡 B2C vs B2B: Timeline Comparison

### **B2B School Model (Original Plan)**
```
Jun 4: Call schools
Jun 5: Get rosters
Jun 6: Launch 100 students
Jun 15: Launch 2000 more (pilot schools)
= 11 days to 2000 students
```

### **B2C Direct Model (New Plan)**
```
Jun 4: Setup landing page
Jun 5: Go live (soft launch)
Jun 6: 100 students organic signup
Jun 13: 500+ students (via referrals + parent groups)
Jun 30: 1000+ students (viral + social + ads)
= 26 days to 1000 students (but ZERO school dependency)
```

**Tradeoff:** B2C is slower to scale but:
- ✅ No school negotiations needed
- ✅ Can launch immediately
- ✅ Better viral potential
- ✅ More exciting for investors ("organic growth")
- ❌ Higher churn (free users)
- ❌ Need to monetize sooner

---

## 📋 B2C ACTION CHECKLIST (48 Hours)

### **TODAY (June 4) - 4 Hours**

- [ ] **Landing page created**
  - [ ] Copy written (headline, CTA, benefits)
  - [ ] Design: Use brand colors + badge images
  - [ ] Host on: wizlingo.app or edvanta.com/wizlingo
  - Time: 30 min

- [ ] **Email signup form ready**
  - [ ] Form collects: Name, email, grade, age
  - [ ] Email trigger: Welcome email + login link
  - [ ] Tool: Mailchimp OR custom API
  - Time: 1 hour

- [ ] **Email login flow tested**
  - [ ] Send test email to yourself
  - [ ] Click link → Login works
  - [ ] Land in app successfully
  - Time: 1 hour

- [ ] **Recruitment channels prepared**
  - [ ] WhatsApp message copied
  - [ ] Parent groups identified (10+)
  - [ ] Social media drafts ready
  - [ ] Edvanta email list prepared
  - Time: 30 min

- [ ] **Systems validated** (same as before)
  - [ ] DB migrations: ✅
  - [ ] Speech rec: ✅
  - [ ] Email sending: ✅
  - [ ] Analytics: ✅
  - Time: 1 hour

### **TOMORROW (June 5) - Soft Launch Day**

- [ ] **9am: Landing page live**
  - [ ] URL shareable
  - [ ] All systems responding
  
- [ ] **10am: First batch of parent messages**
  - [ ] Send WhatsApp to 50 parent groups
  - [ ] Post in Facebook groups (5 major groups)
  - [ ] Email to Edvanta network
  
- [ ] **Noon: Check signup rate**
  - [ ] Analytics showing signup source?
  - [ ] At least 20+ signups?
  - [ ] Emails being sent successfully?
  
- [ ] **3pm: Monitor + fix**
  - [ ] Check for signup bugs
  - [ ] Email first 5 users: "How is it?"
  - [ ] Fix critical issues immediately
  
- [ ] **6pm: End-of-day review**
  - [ ] 50+ signups? ✅
  - [ ] 25+ active users? ✅
  - [ ] Ready for day 2? ✅

---

## 🎬 NEXT MILESTONE: June 15

**Parallel to B2C growth, decide: Pure B2C OR Hybrid?**

### **Option A: Pure B2C**
- Focus entirely on direct students
- 1000+ users by June 30
- Monetize via freemium (₹99/month)
- Go to Series A with "viral growth story"

### **Option B: Hybrid (My Recommendation)**
- 500+ direct students via B2C (June 6-30)
- ALSO pilot 1-2 schools in June (not as main strategy, as expansion)
- Two growth engines: B2C (fast, viral) + B2B (predictable, long-term)
- Series A story: "Dual motion: consumers + schools"

---

## 🎯 B2C SUCCESS METRICS (Different Gates)

### **Week 1 (By June 11)**
- ✅ 100+ signups
- ✅ 50%+ daily active
- ✅ 30%+ completing first session
- ✅ 10%+ earning first badge
- ✅ 0 critical bugs

**Decision:** Viral loop working? YES → Continue growth. NO → Improve onboarding.

### **Week 2-4 (By June 30)**
- ✅ 300-500 signups (cumulative)
- ✅ 40% DAU rate
- ✅ 5% converting to paid (15-25 paying users)
- ✅ Parent sharing tracking shows virality
- ✅ NPS from parents >50

**Decision:** Ready for Series A story? YES → Can raise on growth trajectory. NO → Need to improve retention.

### **Month 2 (By July 30)**
- ✅ 1000+ signups
- ✅ 100+ paid subscribers (₹10K/month MRR)
- ✅ Clear viral coefficient (how many new users each user brings)
- ✅ High engagement (DAU >40%)

**Decision:** Viral growth proven? YES → Scale paid ads, target Series A. NO → Go back to B2B schools.

---

## 💼 PRICING FOR B2C (Refined)

### **Model 1: Freemium (Conservative)**
```
FREE: 5 sessions/week, limited features
PAID (₹99/month): Unlimited, all features
Conversion target: 5-10%
Revenue: 500 users × 5% × ₹99 = ₹2,475/month
```

### **Model 2: Free → Premium Tier (Aggressive)**
```
FREE (Forever): Basic reading, ads, 3 sessions/week
PREMIUM (₹199/month): No ads, unlimited, parent reports
PRO (₹499/month): Everything + tutoring, 1-on-1 calls
Conversion target: 8-12%
Revenue: 500 users × 10% × avg ₹300 = ₹15,000/month
```

### **Model 3: Freemium + Annual Lock (Smart)**
```
FREE: 5 sessions/week, expires after 1 month
MONTHLY (₹99): Unlimited, month-to-month
ANNUAL (₹999): Unlimited, 1-year prepay (20% discount)
Conversion target: 5-8%
Strategy: Free → Monthly → Annual (stickiness ladder)
```

**Recommendation:** Use Model 1 (Freemium) for first month to validate. Then introduce Model 2 upsells.

---

## 🚀 B2C Launch Summary

**Can you launch B2C direct students?**  
✅ **YES — MUCH EASIER than B2B**

**Why?**
- No school negotiations (removes 2-week blocker)
- Self-serve signup (2 minutes vs 2-3 weeks)
- Can launch TODAY (not waiting for schools)
- Better for viral growth

**Timeline:**
- June 4: Setup landing page + signup
- June 5-6: Go live, expect 100+ signups
- June 30: 500-1000+ users
- Aug 31: Metrics show viral growth ready for Series A

**Risk:**
- Higher churn (free users more likely to drop)
- Need to monetize fast (sustainability)
- Requires continuous marketing (growth)

**Reward:**
- Faster to market
- Better growth story for investors
- Can always add B2B schools later (hybrid model)

---

## 📱 Stack You'll Need (B2C Specific)

| Component | Tool | Cost | Setup Time |
|-----------|------|------|-----------|
| Landing page | Webflow / Framer / Custom | ₹0-5K | 1 hour |
| Email signup | Mailchimp / ConvertKit / Custom | ₹0-500/mo | 1 hour |
| Email sending | AWS SES / SendGrid | ₹0-100/mo | 30 min |
| Analytics | Mixpanel / Posthog | ₹0-500/mo | 1 hour |
| Payments | Stripe / Razorpay | ₹0 | 2 hours |
| App store (optional) | Google Play / App Store | ₹0 | 1 week |
| Referral tracking | Custom OR Refersion | ₹100-500/mo | 2 hours |
| Social ads (optional) | Meta Ads / Google Ads | ₹500-5K budget | 2 hours |

---

## ✅ GO/NO-GO Decision: B2C vs B2B

**Choose B2C if:**
- ✅ You want to launch in 2-3 days (not 2-3 weeks)
- ✅ You're confident in product (speech rec, UX, engagement)
- ✅ You want viral growth story for Series A
- ✅ You want independent from school constraints

**Choose B2B if:**
- ✅ You already have school relationships
- ✅ You prefer predictable revenue (school contracts)
- ✅ You want higher LTV per customer
- ✅ You're OK with slower growth

**Recommendation:** **HYBRID** (Do both)
- June 5-6: Launch B2C direct students (fast)
- June 15: Also pitch 1-2 schools (parallel, not dependent)
- By Aug 31: Have both channels running
- Series A story: "Organic B2C growth + B2B pilots"

---

## 📞 Next Steps

1. **Decide:** B2C only OR Hybrid (B2C + B2B)?
2. **If B2C:** Create landing page TODAY
3. **If Hybrid:** Do B2C + in parallel reach out to schools
4. **Timeline:** Can launch June 5-6 either way

**Bottom line:** You're MORE READY for B2C launch than B2B because you don't need school cooperation. Less dependencies = faster execution.

---

**Status:** Ready to pivot  
**Timeline:** 48 hours to B2C launch vs 10-15 days for B2B  
**Recommendation:** Go B2C for Stage 1, add B2B schools in Stage 2
