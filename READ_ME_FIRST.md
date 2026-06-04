# WizLingo: Complete Go-to-Market Package
## Read This First — Then Follow the Execution Plan

**Created:** June 2026  
**For:** Leadership Team, Product, Engineering, Business Development  
**Timeline:** 30 days to launch Stage 1 beta

---

## 📚 What You Have (4 Strategic Documents)

### **1️⃣ STAGE_GATED_ROADMAP.md** (The Bible)
**What:** Complete 3-stage framework (Beta → Pilots → Scale)  
**Length:** 8,000+ words  
**Read this if:** You want the full strategy with all gates, decision trees, and financial models  
**Key sections:**
- Stage 1: Beta Testing (June-Aug) — 100-150 free students, validate metrics
- Stage 2: Paid Pilots (Sept-Dec) — 2 schools at 75% discount, prove school-market fit  
- Stage 3: Scale (Jan-June) — 15-20 schools, raise Series A
- Pricing deep dive: Three models analyzed (per-student recommended)
- Decision trees: Exactly what to do if metrics fail

**Action:** Bookmark this. Share with board. Reference during gate reviews.

---

### **2️⃣ PRICING_DECISION_SHEET.md** (The Choice)
**What:** Pricing model comparison + recommendation  
**Length:** 2,000 words  
**Read this if:** You're deciding between 3 pricing models  
**Key sections:**
- Model 1: Per-Student Annual (₹150-250/student) — **RECOMMENDED**
- Model 2: Tiered by School Size (₹40K-350K/year)
- Model 3: Freemium (not yet recommended)
- Unit economics for each model
- Discount policy (hard rules for sales team)
- Stage 2 pilot pricing: 75% discount = ₹50K schools

**Action:** CEO decides by August 31. Share final decision with sales team.

---

### **3️⃣ 30_DAY_EXECUTION_CHECKLIST.md** (The Playbook)
**What:** Week-by-week tasks to launch Stage 1 (June-July)  
**Length:** 3,000 words  
**Read this if:** You're starting Stage 1 THIS MONTH  
**Key sections:**
- **Week 1:** Analytics setup, school recruitment, product audit
- **Week 2:** Student onboarding prep, credential generation, email templates
- **Week 3:** Launch day (distribute credentials, monitor metrics)
- **Week 4:** Daily monitoring, bug fixes, gate review

**Action:** Print this. Assign owners to each task. Track in Slack.

---

### **4️⃣ METRICS_DASHBOARD_TEMPLATE.md** (The Scoreboard)
**What:** Daily metrics to track for Stage 1  
**Length:** 2,000 words  
**Read this if:** You're setting up analytics  
**Key sections:**
- 5 primary metrics (DAU, session completion, speech rec, badges, parent emails)
- Daily tracking template (copy into Google Sheets)
- Weekly summaries (auto-generate for leadership)
- Gate criteria (what = GO, what = HOLD/PIVOT)
- Alert thresholds (when to notify CEO immediately)

**Action:** Set up Google Sheet based on template. Automate daily updates.

---

### **BONUS: GO_TO_MARKET_SUMMARY.md** (The Pitch)
**What:** 1-page executive summary for board/investors  
**Length:** 1,500 words  
**Read this if:** You need to pitch this to investors or board  
**Key sections:**
- 3-stage plan compressed to essentials
- Revenue projections: ₹0 → ₹2.4Cr → ₹6Cr → ₹14Cr (3 years)
- Unit economics: LTV:CAC targets of 20+:1
- Risk mitigation: What could go wrong + how we handle it
- Capital requirements: Bootstrapped Stage 1, ₹3-5Cr Series A in Jan 2027

**Action:** Print this as 1-pager. Use in Series A conversations.

---

## 🎯 How to Use These Documents

### **For the CEO:**

**Now (June 1-7):**
1. [ ] Read STAGE_GATED_ROADMAP.md (focus on Stage 1 section)
2. [ ] Read PRICING_DECISION_SHEET.md (make pricing choice by June 5)
3. [ ] Read 30_DAY_EXECUTION_CHECKLIST.md (assign owners by June 3)
4. [ ] Approve ₹50K Stage 1 budget
5. [ ] Commit 5 hrs/week to this project

**Week 1 (School Recruitment):**
- Schedule calls with 5 principals (goal: 1-2 verbal commitments for 100+ students)
- Brief eng team on analytics requirements
- Approve product audit checklist

**Week 3 (Launch Day):**
- Monitor Slack #beta-launch for issues
- Be available for critical escalations (only)
- Stay hands-off (trust your team)

**Week 4 (Gate Review - June 28):**
- Review METRICS_DASHBOARD_TEMPLATE with full team
- Make Stage 1→2 decision (GO/HOLD/PIVOT) based on 5 metrics
- If GO: Approve Series A prep

---

### **For the Product Lead:**

**Now (June 1-7):**
1. [ ] Read 30_DAY_EXECUTION_CHECKLIST (entire document)
2. [ ] Audit product readiness (use Week 1 checklist)
3. [ ] Create teacher onboarding guide (1-pager)
4. [ ] Prepare beta terms & consent forms

**Week 1-2:**
- Test onboarding flow on 5 devices
- Create email templates (welcome, badge earned, weekly progress)
- Brief eng on email integration requirements

**Week 3:**
- Conduct 3 teacher briefing calls (60 min each)
- Gather feedback on UX friction
- Identify 2-3 quick wins for week 4 fixes

**Week 4:**
- Finalize teacher NPS survey (send week 3, analyze week 4)
- Plan badge unlock optimization (if <30%)
- Document all feedback for Stage 2 improvements

---

### **For Engineering:**

**Now (June 1-3):**
1. [ ] Read 30_DAY_EXECUTION_CHECKLIST (Week 1 section)
2. [ ] Set up Posthog or Mixpanel analytics
3. [ ] Create analytics dashboard (Google Sheets auto-refresh)
4. [ ] Document tracking events required (use STAGE_GATED_ROADMAP.md event list)

**Week 1-2:**
- ✅ Instrument all tracking events (DAU, session completion, badge earned, etc.)
- ✅ Set up email sending (AWS SES or SendGrid)
- ✅ Test speech recognition on 5 sample recordings
- ✅ Prepare staging environment with 20 test accounts

**Week 3:**
- ✅ Deploy production, monitor logs
- ✅ Be on-call for issues (24 hrs before + 24 hrs after launch)
- ✅ Fix any critical bugs within 4 hours

**Week 4:**
- ✅ Continue daily monitoring (DAU tracking)
- ✅ Validate speech rec accuracy (20-30 manual tests)
- ✅ Implement 2-3 quick fixes based on teacher feedback

---

### **For Business Development:**

**Now (June 1-5):**
1. [ ] Read 30_DAY_EXECUTION_CHECKLIST (Week 1 school recruitment section)
2. [ ] Create target school list (5-7 schools in Tier 1-2 cities)
3. [ ] Draft recruitment email + pitch deck

**Week 1:**
- [ ] Personalized outreach to 7 principals (phone + email)
- [ ] Schedule 5 kickoff calls (goal: 1-2 commitments)
- [ ] Prepare beta terms document (legal reviewed)

**Week 2:**
- [ ] Finalize student roster with schools (name, grade, contact info)
- [ ] Coordinate credential generation with eng
- [ ] Prepare printed credential cards (if schools prefer)
- [ ] Send launch email with onboarding guide

**Week 3:**
- [ ] Ensure credentials distributed to 100+ students by day of launch
- [ ] Follow up with schools to confirm launch
- [ ] Be available for first week issues

**Week 4:**
- [ ] Weekly check-in calls with school principals
- [ ] Gather early feedback from schools (teachers, students)
- [ ] Prepare data for Series A case studies

---

### **For Growth/Content:**

**Now (June 1-5):**
1. [ ] Read 30_DAY_EXECUTION_CHECKLIST (Week 2 email section)
2. [ ] Write 3 email templates (welcome, badge, progress)
3. [ ] Set up email delivery tracking

**Week 2:**
- [ ] Finalize parent email templates with CEO approval
- [ ] Prepare email send timing (badge earned = immediate, weekly progress = Monday 8am)
- [ ] Set up email tracking (opens, clicks)

**Week 3:**
- [ ] Send welcome email on day of student signup
- [ ] Send badge emails when students earn (automated trigger)
- [ ] Monitor email open rates daily (target: >25%)

**Week 4:**
- [ ] Design A/B test for email subject lines
- [ ] Implement test (2 variants sent to first 50 badge emails)
- [ ] Analyze results by week 4 end

---

## 📋 Quick Checklist: Before You Start

**Print and check these off:**

### **Legal & Admin**
- [ ] Beta terms of service drafted (use template if no legal team)
- [ ] Parent consent form for voice recording (compliant with GDPR/India privacy)
- [ ] Data retention policy documented (how long do we store voice files?)
- [ ] Budget approval: ₹50K for Stage 1 spend

### **Product & Tech**
- [ ] Posthog/Mixpanel account created + integrated
- [ ] Email sending (SMTP) tested and working
- [ ] Speech recognition validated on 5+ test recordings
- [ ] App tested on mobile, tablet, desktop (no crashes)
- [ ] Staging environment set up (separate from production)
- [ ] GitHub issue tracker ready (bug tracking)

### **Team & Process**
- [ ] Slack channels created (#beta-launch, #metrics-daily, #bugs-found, #stage1-gate)
- [ ] Daily standup scheduled (9:15am, 15 min, async Slack acceptable)
- [ ] Weekly leadership review scheduled (Friday 4pm)
- [ ] Decision-maker assigned to each task (no ambiguity)
- [ ] Escalation path defined (if critical issue, who do you call?)

### **Sales & Outreach**
- [ ] Target schools identified (5-7 schools, detailed list)
- [ ] Recruitment email drafted
- [ ] Pitch deck created (5 slides: Problem, Solution, Beta mechanics, Timeline, Success)
- [ ] Kickoff call script prepared
- [ ] Sign-up deadline: June 10 (schools must commit)

### **Analytics & Reporting**
- [ ] Google Sheet template created (use METRICS_DASHBOARD_TEMPLATE.md)
- [ ] Daily metrics export configured (automation or manual)
- [ ] Leadership dashboard shared (read-only access)
- [ ] Alert thresholds defined (when does CEO get notified?)

---

## ⏰ The 30-Day Timeline (At a Glance)

```
WEEK 1 (June 1-7): Foundation
  ├─ Analytics setup
  ├─ School recruitment (5-7 outreach)
  ├─ Product audit
  └─ Approval: Budget + team commitment

WEEK 2 (June 8-14): Onboarding Prep
  ├─ Student credentials generated
  ├─ Email templates created
  ├─ Teacher guides written
  └─ Approval: All systems ready

WEEK 3 (June 15-21): Launch
  ├─ 100+ students get credentials
  ├─ Distribute via schools/email/WhatsApp
  ├─ Launch day metrics tracking (24/7 monitoring)
  └─ Decision: Launch successful (no critical bugs)

WEEK 4 (June 22-28): Monitor & Optimize
  ├─ Daily metrics check (9am Slack post)
  ├─ Teacher feedback loop (3 teachers interviewed)
  ├─ Quick wins implemented (2-3 features)
  ├─ Email A/B test analysis
  └─ Decision: Stage 1→2 gate review (June 28)

GATE DECISION (June 28): 5 metrics pass → GO to Stage 2
```

---

## 💰 Money & Runway

**Stage 1 costs:** ~₹50K total
- Analytics tools: ₹5K
- Student incentives: ₹20K
- Teacher honorariums: ₹10K
- Testing/tools/misc: ₹15K

**Stage 1 runway:** 30 days (bootstrapped)

**Stage 2 costs:** ₹75-100K (75% discount for 2 pilot schools)
- Revenue collected: ₹50-75K
- Net investment: ₹25-50K
- Runway: 60 days (use Stage 1 profit + new revenue)

**Runway until Series A:** 6 months comfortable (if raising by Jan 2027)

---

## 🎯 The North Star: Metrics That Matter

**By August 31, 2026 (Stage 1 complete), you MUST know:**

1. ✅ **Can we build a product people engage with?** (DAU >70%, engagement >70%)
2. ✅ **Does speech recognition actually work?** (Accuracy >90%)
3. ✅ **Will parents care?** (Email opens >25%, shares >15%)
4. ✅ **Are teachers interested?** (NPS >50 if assigned)
5. ✅ **Can we do this at scale without breaking?** (Zero critical bugs in 30 days)

If all 5 are YES = Green light to Stage 2 + Series A conversations.

---

## 📞 Support & Questions

**If you're unclear about:**
- **Strategy:** Refer to STAGE_GATED_ROADMAP.md
- **Pricing:** Refer to PRICING_DECISION_SHEET.md  
- **Week-by-week tasks:** Refer to 30_DAY_EXECUTION_CHECKLIST.md
- **Which metrics to track:** Refer to METRICS_DASHBOARD_TEMPLATE.md
- **Investor pitch:** Refer to GO_TO_MARKET_SUMMARY.md

**For quick decisions:**
- **"Should we pivot the model?"** — Check STAGE_GATED_ROADMAP.md decision trees
- **"What do we do if X metric fails?"** — Check STAGE_GATED_ROADMAP.md Stage 1→2 gate
- **"Is our price right?"** — Check PRICING_DECISION_SHEET.md unit economics

---

## 🚀 The Next 3 Hours

**Do this right now:**

1. [ ] CEO: Read STAGE_GATED_ROADMAP.md (1 hour)
2. [ ] Product Lead: Read 30_DAY_EXECUTION_CHECKLIST.md (45 min)
3. [ ] Engineering Lead: Read 30_DAY_EXECUTION_CHECKLIST.md Week 1 section (30 min)
4. [ ] BD Lead: Read 30_DAY_EXECUTION_CHECKLIST.md Week 1 school recruitment (30 min)
5. [ ] Team meeting (15 min): Confirm who owns what + timeline (use checklist above)

**By end of day:**
- [ ] Budget approved (₹50K for Stage 1)
- [ ] Team commitment: 80% eng capacity, 50-60% PM, 50% BD, 20% growth
- [ ] Slack channels created
- [ ] First milestone (June 3): 5 schools contacted

---

## Final Thought

**This is not a technology problem — this is an execution problem.**

You have a beautiful product (hexagon badges, speech rec, gamification). Stage 1 proves it works. Stage 2 proves schools will pay. Stage 3 proves you can scale it.

The 4 documents above tell you exactly how to do all three, what to measure, and when to make decisions.

**Your job is not to build perfect; it's to learn fast.**

Get 100-150 students. Measure 5 metrics. Make a binary decision (GO/HOLD). Move on.

Everything else is noise.

---

**Document:** READ_ME_FIRST.md  
**Version:** 1.0  
**Last updated:** June 2026  
**Status:** Ready for execution  

🚀 **Let's go.**
