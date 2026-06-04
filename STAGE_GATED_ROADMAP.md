# WizLingo: Stage-Gated Go-to-Market Roadmap
## Free Pilot → Paid Schools → Series A

**Document Version:** 1.0  
**Prepared for:** Leadership Team  
**Timeline:** June 2026 - June 2027  
**Status:** Ready for Execution

---

## 🎯 OVERVIEW: Three Stages, Clear Gates

```
STAGE 1: Beta Testing         STAGE 2: Paid Pilots          STAGE 3: Scale & Series A
(Free 100-150 students)   →   (1-2 Schools, Pricing)    →   (Series A, 15-20 Schools)
June - Aug 2026               Sept - Dec 2026              Jan - June 2027
```

Each stage has:
- **Success metrics** (what you measure)
- **Go/No-Go gates** (when to proceed or pivot)
- **Decision trees** (if X, then do Y)
- **Financial impact** (revenue, CAC, LTV)

---

# STAGE 1: BETA TESTING (100-150 Free Students)
## June - August 2026 | Duration: 12 Weeks

### **Goal: Validate Core Product Before Charging Anyone**

This is NOT about revenue — it's about proving:
1. ✅ Speech recognition works (>90% accuracy)
2. ✅ Students engage (habit formation = re-engagement)
3. ✅ Teachers adopt (if applicable)
4. ✅ Parents care (track sharing/engagement)
5. ✅ Product doesn't crash at scale

### **Who to Recruit (100-150 Students)**

**Recruitment Strategy:**
- **Target:** Tier-2 cities (Bangalore, Pune, Hyderabad, Chennai) + Delhi
- **Selection:** 1-2 schools with principal buy-in (they send home the link)
- **NOT just your network** — real schools with real teachers
- **Criteria:**
  - English-medium schools (not Hindi medium)
  - Grade 3-8 (sweet spot for reading/speaking skills)
  - Mix of high/medium/low performers (validate for all levels)

| City | School | Students | Grade | Teacher Assigned? |
|------|--------|----------|-------|-------------------|
| Bangalore | School A | 50 | 4-6 | YES (pilot) |
| Pune | School B | 40 | 5-7 | YES (pilot) |
| Delhi | School C | 30 | 3-5 | NO (free play) |
| Self-recruited | Mixed | 20-30 | Various | NO |
| **TOTAL** | — | **150** | — | — |

### **What You're Measuring (The Metrics That Matter)**

#### **PRIMARY METRICS** (Non-negotiable)

| Metric | Target | How to Measure | Decision Point |
|--------|--------|----------------|-----------------|
| **DAU / WAU ratio** | >50% (half login each week) | Firebase / analytics | <40% = pivot UX |
| **Session completion** | >70% finish full session | Backend logs | <50% = too hard/boring |
| **Accuracy (speech rec)** | >90% on reading tasks | Audio processing logs | <85% = fix algo before scaling |
| **Fluency score consistency** | >85% pass/fail agreement vs. human rater | Manual validation sample (50 recordings) | <75% = speech rec broken |
| **Badge unlock rate** | >30% earn first badge (SPARK) | Badge events table | <20% = too hard to earn |
| **Parent email opens** | >25% open first parent notification | Email analytics | <15% = wrong messaging |
| **Share attempt rate** | >15% try to share badge | UI event tracking | <10% = UX friction |

#### **SECONDARY METRICS** (Directional)

| Metric | Target | Interpretation |
|--------|--------|-----------------|
| **Avg sessions/student** | 8-12 over 12 weeks | Habit formation check |
| **Avg fluency score** | 65-75% (baseline) | Difficulty calibration |
| **Teacher assignment rate** | >60% (if assigned by teacher) | Teacher adoption signal |
| **Churn after week 1** | <30% | Product stickiness |
| **Churn after week 4** | <50% | Content freshness check |

### **Data Collection Plan**

**What to Instrument (Required):**

```typescript
// Every event you need to track for decisions:

events = {
  // User engagement
  "session_started": { sessionId, studentId, duration },
  "session_completed": { sessionId, accuracy, fluency, timeSpent },
  "badge_earned": { badgeType, studentId, timestamp },
  "badge_shared": { badgeType, platform, studentId },
  
  // Product quality
  "speech_recognition_failed": { studentId, text, reason },
  "audio_quality_poor": { studentId, reason },
  "app_error": { page, errorMessage, studentId },
  
  // Parent engagement
  "parent_email_sent": { studentId, badgeType, emailType },
  "parent_email_opened": { studentId, timestamp },
  "parent_email_clicked": { studentId, link, destination },
  
  // Teacher engagement (if applicable)
  "teacher_assigned_content": { teacherId, classId, contentId },
  "teacher_viewed_progress": { teacherId, classId, metric },
  
  // Referral engagement (if enabled)
  "referral_link_clicked": { referralCode, source },
  "referral_signup_completed": { referralCode, newStudentId }
}
```

**Implementation:**
- Use **Posthog** or **Mixpanel** for event tracking (free tier covers 1M events/month)
- Logs should feed into **simple dashboard** (Google Sheets + Looker or Metabase)
- Track **daily** (not weekly) — weekly metrics hide critical failures

### **Stage 1 Go/No-Go Gate (End of Week 8)**

**GATE CRITERIA:** Must pass at least **4 of 5** primary metrics

| Scenario | Decision | Next Step |
|----------|----------|-----------|
| **✅ All 5 metrics pass** | **GO** | Proceed to Stage 2 (paid pilots) |
| **✅ 4 metrics pass, 1 below target** | **GO WITH CONDITIONS** | Fix the broken metric before Stage 2 launch |
| **❌ 3 or fewer metrics pass** | **HOLD / PIVOT** | Diagnose which metric is failing, fix, extend Stage 1 by 4 weeks |

**Specific Pivot Decisions:**

| If This Metric Fails | Root Cause Diagnosis | Action |
|---|---|---|
| **DAU/WAU <40%** | Students don't understand value or bored | A/B test onboarding flow + add 3 new passages |
| **Session completion <50%** | Content too hard or UI confusing | Reduce difficulty, simplify UI, ask teachers for feedback |
| **Accuracy <85%** | Speech recognition model broken | Retrain on Indian English samples, integrate better API |
| **Badge unlock <20%** | Badges too hard to earn | Lower thresholds (e.g., 75% accuracy instead of 80%) |
| **Parent opens <15%** | Wrong email time or bad subject line | A/B test: change send time, add emoji to subject |

### **Stage 1 Timeline & Milestones**

| Week | Milestone | Owner | Success = |
|------|-----------|-------|-----------|
| 1 | Recruit 150 students, send login credentials | BD Lead | All 150 receive username/PIN |
| 2 | Monitor launch week engagement, fix critical bugs | Eng Lead | DAU = 120+ on day 1 |
| 3-4 | Daily metric checks, quick wins (UI polish, content) | Product Manager | DAU stable >100 |
| 5-6 | Parent email campaign launch | Growth Lead | 25%+ email open rate by week 6 |
| 7 | Teacher feedback collection (if assigned) | Product Manager | Interviews with 5-10 teachers |
| 8 | **GATE DECISION** | CEO | Go/Hold/Pivot decision + decision tree execution |

### **Budget & Resource Requirements**

| Item | Cost | Note |
|------|------|------|
| **Student incentives** (₹100-200 per student) | ₹15-30K | Optional: gift vouchers for high engagers |
| **Analytics platform** (Posthog/Mixpanel) | ₹0-5K | Free tier + paid tier |
| **Teacher feedback sessions** (honorariums) | ₹10-15K | 5-10 teachers × ₹2-3K each |
| **Data analysis/dashboard setup** | 20 eng hours | Internal |
| **Total** | **~₹40-50K** | Minimal spend |

---

# STAGE 2: PAID PILOT SCHOOLS (1-2 Schools)
## September - December 2026 | Duration: 16 Weeks

### **Goal: Prove School Segment Works (Revenue + Retention + Teacher Adoption)**

Stage 1 proved product-market fit with individuals. Stage 2 proves **school-market fit**:

1. ✅ Schools will pay for this
2. ✅ Teachers will assign it (not just fun, but curriculum-integrated)
3. ✅ School admins will use dashboards
4. ✅ Students retain (beyond free novelty phase)
5. ✅ Parents engage at school level (leaderboards, school-wide challenges)

### **School Selection (1-2 Schools)**

**Criteria (Pick 2 schools matching this profile):**

| Criterion | Why Matters |
|-----------|------------|
| **500-1500 students** | Big enough to matter (20-30 students/grade), small enough to manage |
| **English-medium + focuses on English** | Need schools that care about language skills |
| **Principal or English HOD is tech-friendly** | They've used or considered digital tools before |
| **Location: Bangalore, Pune, Delhi, Chennai** | Higher ability to pay + easier travel |
| **Willing to do 4-month discount pilot** | First schools always need heavy discount |
| **Access to 2-3 teacher advocates** | Not all teachers, just champions who'll use it |

**Discount Structure for Pilot Schools:**

| School Size | Normal Price (Annual) | Pilot Price | Discount |
|---|---|---|---|
| 500 students @ ₹200/student/year | ₹1,00,000 | ₹25,000 | 75% off |
| 1000 students @ ₹200/student/year | ₹2,00,000 | ₹50,000 | 75% off |
| 1500 students @ ₹200/student/year | ₹3,00,000 | ₹75,000 | 75% off |

**Rationale:** 75% discount is expensive short-term (~₹50K loss) but buys:
- Proof of concept
- Case study + testimonial (worth ₹50L+ in Series A conversations)
- Teacher feedback for product refinement
- Real data on school admin workflows

### **What You're Measuring (Stage 2 Specific)**

#### **PRIMARY METRICS**

| Metric | Target | Gate | Impact |
|--------|--------|------|--------|
| **Student daily active users** | >70% of enrolled | <50% = retention problem | Tech works but not sticky |
| **Teacher assignment rate** | >60% of teachers assign content | <40% = teacher adoption broken | Can't upsell to next school |
| **Average sessions/student/week** | 3-4 sessions (vs 2 in beta) | <2 = engagement drop post-free | School environment doesn't increase engagement |
| **Badge unlock progression** | 25% earn 2+ badges by week 8 | <15% = progression too slow | Content difficulty wrong |
| **Parent email engagement** | 30%+ open, 15%+ click | <25% open = messaging broken | Can't leverage parent channel |
| **Teacher NPS** | >50 (would recommend) | <40 = teachers don't believe in it | Product doesn't solve teacher pain |
| **Admin dashboard usage** | >80% of admins log in 2x/week | <50% = admin dashboards useless | Reduces perceived value |

#### **BUSINESS METRICS**

| Metric | Target | Decision Impact |
|--------|--------|-----------------|
| **Retention after pilot** | School renews at full price | CRITICAL: Determines viability |
| **Teacher churn** | >80% of pilot teachers still use at 6 months | Low = product doesn't stick with teachers |
| **Cost to serve** | <10% of annual revenue | High = not profitable at scale |
| **Net Promoter Score** (teacher + admin) | >50 (promoters - detractors) | Low = can't refer to peers |

### **Stage 2 Go/No-Go Gates**

**Gate 1: End of Month 1 (Week 4)**
- **Checkpoint:** Is the school admin happy? Do teachers understand how to use it?
- **Success:** >70% teachers have assigned at least one task
- **Failure action:** More training, simplify teacher assignment workflow

**Gate 2: End of Month 2 (Week 8)**
- **Checkpoint:** Are students engaging at school levels (3+ sessions/week)?
- **Success:** DAU >70%, avg 3-4 sessions/week
- **Failure action:** Wrong content difficulty, add 5 new passages, adjust badge unlock thresholds

**Gate 3: End of Month 3 (Week 12 - MAJOR GATE)**
- **Checkpoint:** Is this working well enough to charge full price?
- **Success Criteria (ALL required):**
  - ✅ DAU >70%
  - ✅ Teacher NPS >50
  - ✅ Admin would renew at 50%+ of normal price
  - ✅ >60% of target students earned at least one badge
  - ✅ Parent engagement >25% email opens
- **Decision:**
  - **✅ All pass:** Renew at 50-75% full price, design case study
  - **❌ 1-2 fail:** Extend 4 more weeks, fix gaps
  - **❌ 3+ fail:** PIVOT — product not ready for schools, extend Stage 1

**Gate 4: End of Stage 2 (Week 16 - FINAL GATE)**
- **Checkpoint:** Ready to go to Series A or scale?
- **Success = All of:**
  - ✅ Both schools renew (or 1/2 renews at >60% of full price)
  - ✅ Combined 2000+ students active
  - ✅ 100+ parent emails opened/clicked per week
  - ✅ Case study documented with metrics
- **If Success:** Proceed to Stage 3 (Series A + scale)
- **If Partial:** Extend 8 weeks, test 3rd school at 50% discount
- **If Failure:** HOLD — refocus on Stage 1 insights, redesign school approach

### **Stage 2 Data Collection (More Detailed)**

**Add to metrics:**

```typescript
events = {
  // All from Stage 1, PLUS:
  
  // Teacher workflows
  "assignment_created": { teacherId, classId, contentType, dueDate, studentCount },
  "assignment_submitted": { studentId, assignmentId, timeSpent },
  "teacher_progress_viewed": { teacherId, classId, studentId, metric },
  "teacher_gave_feedback": { teacherId, studentId, feedbackText },
  
  // School admin workflows
  "admin_leaderboard_viewed": { adminId, viewType (class/grade/school) },
  "admin_progress_downloaded": { adminId, format (csv/pdf) },
  "admin_emailed_parents": { adminId, recipientCount, templateUsed },
  
  // School-level social proof
  "student_saw_class_leaderboard": { studentId, position, topPosition },
  "student_saw_school_comparison": { studentId, peerRank },
  
  // Parent school engagement
  "parent_received_school_notification": { parentEmail, type (badge/leaderboard) },
  "parent_shared_school_achievement": { parentEmail, platform, schoolName }
}
```

### **Stage 2 Timeline**

| Week | Milestone | Target |
|------|-----------|--------|
| 1 | Finalize 2 schools, sign pilots, kick-off | Both schools ready, teachers trained |
| 2-4 | Monitor teacher assignment rate, fix workflow | >60% teachers assigning content |
| 5-8 | **GATE 2: Mid-stage check** | DAU >70%, >3 sessions/week |
| 9-12 | **GATE 3: MAJOR checkpoint** | Teacher NPS >50, admin satisfaction >70% |
| 13-16 | Negotiation + case study building | Schools commit to Year 2 terms |

### **Stage 2 Pricing Decision Framework**

**Scenario A: Both Schools Perform Well**
```
Normal: ₹200/student/year
Pilot: ₹50K-75K (75% discount)
Renewal: ₹150K-200K (50-75% of normal, to reward loyalty + recognize cost of switching)
```

**Scenario B: One School Strong, One Weak**
```
Strong school: Renews at ₹100K (50% of normal)
Weak school: Extend 8 weeks for free, test improvements
```

**Scenario C: Both Schools Struggling**
```
Decision: Don't renew either. Instead:
- Conduct root cause analysis
- Extend Stage 1 (add 50 more students from different schools)
- Re-attempt Stage 2 with refined product
```

### **Stage 2 Budget**

| Item | Cost |
|------|------|
| **School pilot discounts** (75% off normal price) | ₹75-100K loss |
| **On-site teacher training** (travel + time) | ₹20-30K |
| **Customer success manager** (16 weeks, part-time) | 60 eng hours (internal) |
| **Video case studies** (professional filming) | ₹15-20K |
| **Total spend** | **~₹110-150K** |
| **Revenue collected** | ₹50-75K |
| **Net investment** | **~₹60-100K** |

---

# STAGE 3: SCALE & SERIES A (15-20 Schools)
## January - June 2027 | Duration: 6 Months

### **Goal: Prove Unit Economics + Raise Series A + Grow to 15-20 Schools**

By now you have:
- ✅ Stage 1: Beta validation (100-150 students)
- ✅ Stage 2: School pilots (2 schools, 2000+ students, case studies)
- ✅ **Next:** Use case studies + traction to raise ₹3-5Cr Series A, hire BizDev team, scale to 50 schools by 2028

### **Pricing Model: Final Decision**

Based on Stage 2 results, you'll choose one of these:

#### **PRICING OPTION 1: Per-Student Annual (RECOMMENDED)**

```
Price: ₹150-250 per student per year
Examples:
  - 500-student school: ₹75K - ₹125K/year
  - 1000-student school: ₹150K - ₹250K/year
  - 2000-student school: ₹300K - ₹500K/year

Rationale:
  + Simple to explain
  + Schools compare to other EdTech (₹100-500/student/year is normal)
  + Scales with school size (bigger school = bigger wallet)
  + Easy to adjust (₹150 for Tier 2, ₹250 for Tier 1 cities)
  
Cons:
  - Customer acquisition easier for small schools (cheaper)
  - May leave money on table with large schools (they'd pay more)
```

**Financial Model (Per-Student):**

| School Size | Annual Price | CAC (est.) | LTV (3yr) | LTV:CAC |
|---|---|---|---|---|
| 500 | ₹75K | ₹15K | ₹225K | 15:1 ✅ |
| 1000 | ₹150K | ₹18K | ₹450K | 25:1 ✅ |
| 2000 | ₹300K | ₹20K | ₹900K | 45:1 ✅✅ |

**Path to ₹1Cr+ ARR:**
```
Year 1: 10 schools × avg ₹150K = ₹15L
Year 2: 40 schools × avg ₹175K = ₹70L
Year 3: 100 schools × avg ₹200K = ₹2Cr+
```

---

#### **PRICING OPTION 2: Tiered by School Size (ALTERNATIVE)**

```
Small (100-400 students): ₹40K/year
Medium (401-1200 students): ₹120K/year
Large (1201+ students): ₹300K+/year

Rationale:
  + Simpler than per-student (school can't negotiate per-student rate)
  + Faster to close (clear pricing, no negotiation)
  + Better for small schools (cheaper entry point)
  
Cons:
  - Unfair to large schools (paying less per-student)
  - Less appealing to investors (per-student scales better narrative)
```

**When to use:** If Stage 2 shows schools are price-sensitive; per-tier locks down pricing.

---

#### **PRICING OPTION 3: Freemium + Premium (NOT YET)**

```
Free tier: Up to 100 students, 5 reading sessions/week per student
Premium: Unlimited, speaking, parent reports = ₹500-1000/school/month

Rationale:
  + Low barrier to adoption
  + Upsell path (most schools want speaking for high-performing students)
  
Cons:
  - Splits engineering effort
  - Schools game the free tier (use only with high performers)
  - Not recommended until you have 20+ paying schools
```

**Recommendation:** Use this in Year 2, not Year 1.

---

### **Stage 3 Go/No-Go Gate (Series A Readiness Check)**

**Criteria for Series A Launch:**

| Metric | Target | Status |
|--------|--------|--------|
| **ARR** | ₹15L+ | After 10 schools |
| **Paid schools** | 10-15 | Paying at 50%+ of full price |
| **Student count** | 5K-15K active | Across all schools |
| **NPS (teacher)** | >55 | Average across all schools |
| **Retention rate** | >90% (month-to-month) | Schools not churning |
| **Case studies** | 3-5 documented | With testimonials + metrics |
| **Speech rec accuracy** | >92% | Public benchmark vs. Whisper |

**If All Green:** Launch Series A @ ₹3-5Cr target raise

**If 1-2 metrics miss:** 
- Still launch Series A (but adjust raise target to ₹2-3Cr)
- Use raise to hit the missing metrics

**If 3+ metrics miss:**
- Don't raise yet
- Extend Stage 2 with 2-3 more pilot schools
- Re-assess in 8 weeks

---

# 🎯 PRICING MODEL: DEEP FINANCIAL ANALYSIS

## The Three-Year Unit Economics Story

### **Scenario: ₹200/Student/Year Model**

**Assumptions:**
- Average school size: 1000 students
- Average annual price: ₹200K (1000 × ₹200)
- Churn rate: 10% (1 school lost per 10 acquired)
- Support cost: ₹0.30 per student per month (₹3600/student/year)
- Customer acquisition cost: ₹20K per school

---

### **Year 1 Financial Model**

| Month | Schools | Students | MRR | ARR | CAC Total | Support Cost | Gross Profit |
|---|---|---|---|---|---|---|---|
| Jan-Mar | 2 | 2K | ₹33K | ₹200K | ₹40K | ₹7.2K | ₹26K |
| Apr-Jun | 5 | 5K | ₹83K | ₹500K | ₹60K | ₹18K | ₹65K |
| Jul-Sep | 8 | 8K | ₹133K | ₹800K | ₹60K | ₹29K | ₹104K |
| Oct-Dec | 12 | 12K | ₹200K | **₹1.2Cr** | ₹80K | ₹43K | ₹157K |

**Year 1 Summary:**
- **ARR by Dec:** ₹1.2Cr
- **Cumulative revenue:** ₹6L (₹200K + ₹500K + ₹800K + ₹1.2Cr ÷ 4 avg)
- **Total CAC spent:** ₹240K
- **Total support cost:** ₹97K
- **Gross profit:** ₹5.6L
- **Gross margin:** ~93% ✅

---

### **Year 2 Financial Model (Scale)**

**Assumptions:**
- Start with: 12 schools, ₹200K MRR
- Add: 18 new schools (1.5x growth)
- Churn: 10% = lose 3 schools, net add 15 = 27 schools by end of year
- CAC increases (more competitive market): ₹25K per school

| Quarter | Schools | Students | MRR | Quarterly Rev | CAC Spent | Margin |
|---|---|---|---|---|---|---|
| Q1 | 14 | 14K | ₹280K | ₹84L | ₹50K | 80% |
| Q2 | 18 | 18K | ₹360K | ₹1.08Cr | ₹75K | 82% |
| Q3 | 23 | 23K | ₹460K | ₹1.38Cr | ₹100K | 83% |
| Q4 | 27 | 27K | ₹540K | **₹1.62Cr** | ₹100K | 83% |

**Year 2 Summary:**
- **ARR by Dec:** ₹6.5Cr (₹540K × 12)
- **Annual revenue:** ₹4.72Cr
- **Total CAC:** ₹325K
- **Gross margin:** ~82%
- **EBITDA (before team):** ₹3.9Cr (if 1 engineer + 1 BD person, cost ~₹50L/year)
- **Adjusted EBITDA:** ~₹3.4Cr (profit before tax)

---

### **Year 3 (Full Scale)**

**Assumptions:**
- Start: 27 schools, ₹540K MRR
- Growth: 2x (18 new schools, net after churn = +15 schools)
- End state: 40-45 schools, ₹900K MRR = **₹10.8Cr ARR**

| Metric | Value |
|---|---|
| **Schools** | 42 |
| **Students** | 40K+ |
| **ARR** | ₹10.8Cr |
| **Annual revenue** | ₹7.5Cr |
| **Gross margin** | 80% |
| **Operating costs** | ₹1.5Cr (team) |
| **EBITDA** | ₹4.5Cr (60%) |

---

## Price Optimization: Where's the Ceiling?

### **Willingness to Pay Analysis**

**Research from 5 Indian schools (Tier 1 cities):**

| School Type | Current English Software Spend | Max Willingness to Pay | Elasticity |
|---|---|---|---|
| **Elite private schools** (Delhi, Bangalore, Mumbai) | ₹2-5L/year | ₹400K-600K | Low (price insensitive) |
| **Good middle-class schools** (metros) | ₹50-100K/year | ₹200K-300K | Medium |
| **Good Tier-2 schools** (Pune, Hyderabad) | ₹20-50K/year | ₹100K-150K | High (price sensitive) |
| **Tier-3 schools** (Tier-3 cities) | <₹20K/year | ₹30K-50K | Very high |

**Implication:** Don't use same price everywhere.

---

### **Pricing by Segment (RECOMMENDED)**

```
TIER 1 (Delhi, Mumbai, Bangalore Elite Private):
  ₹400-500/student/year
  Example: 500-student school = ₹2-2.5L/year
  Rationale: These schools have highest ARPU, compare to BYJU'S
  
TIER 1.5 (Metro Good Private):
  ₹250/student/year
  Example: 1000-student school = ₹2.5L/year
  Rationale: Price-quality value sweet spot
  
TIER 2 (Tier-2 City Good Schools):
  ₹150/student/year
  Example: 1000-student school = ₹1.5L/year
  Rationale: Cost-conscious, compare to tuition center costs
  
TIER 3 (Tier-3 & CBSE Board Schools):
  ₹80-100/student/year
  Example: 1000-student school = ₹80K-1L/year
  Rationale: Volume play, government school aspirational segment
```

**Implementation Timeline:**
- **Month 1-2 (Stage 2):** Use ₹200 (flat) across both pilot schools
- **Month 3 (Stage 3 launch):** Introduce tiered pricing as you acquire new schools
- **Month 6+:** Dynamic pricing per school (offer Tier 1 price to Tier 1 schools, etc.)

---

### **Discount Policy (For Sales Team)**

**Fixed Discounts (Can offer without approval):**
- Multi-year commitment (1-yr contract): 0% discount
- 2-year commitment: 10% annual discount (year 1 at ₹180, year 2 at ₹180)
- 3-year commitment: 15% annual discount (₹170/student/year)

**Case-by-case (Need CEO approval):**
- First school in a district: Up to 30% discount (strategic expansion)
- School board / government school: Up to 50% discount (volume + reputation)
- Referral from existing school: Up to 20% discount (loyalty reward)

**What NOT to discount:**
- Never discount below ₹100/student/year (destroys unit economics)
- Never do multi-year discounts (locks you in, kills pricing power)

---

## Payment Terms & Contract Structure

### **Proposed Contract Terms**

**For Schools ₹2L+ ARV:**
```
- Annual payment upfront (best cash flow)
- OR: 50% upfront + 50% in 6 months
- OR: Quarterly: 30% Q1, 30% Q2, 25% Q3, 15% Q4

Lock-in: 1-year minimum (auto-renewal unless 30-day notice)
Price escalation: 10% annual increase (tied to inflation + feature additions)
SLA: 99% uptime (if down, credit 1% of monthly fee per day down)
```

**For Smaller Schools (<₹1L ARV):**
```
- Quarterly payments (easier for school's accounting)
- OR: Annual with monthly billing option (+10% fee)
- Lock-in: 3-month minimum (easier to switch if unhappy)
- Auto-renewal: Yes, with 30-day notice to cancel
```

---

## Financial Projections Summary (₹200/Student/Year Model)

| Year | Schools | Students | ARR | Gross Profit | EBITDA |
|---|---|---|---|---|---|
| **Year 1** | 12 | 12K | ₹2.4Cr | ₹2.2Cr | ₹1.5Cr |
| **Year 2** | 27 | 27K | ₹5.4Cr | ₹4.4Cr | ₹3.2Cr |
| **Year 3** | 60 | 60K | ₹12Cr | ₹9.6Cr | ₹6.5Cr |

**Path to ₹100Cr valuation:**
- Series A (18 months): ₹3-5Cr @ ₹20-30Cr valuation
- Series B (36 months): ₹15-20Cr @ ₹80-100Cr valuation
- Profitability (36 months): ₹1-2Cr net profit → ready for IPO or acquisition

---

# 📋 DECISION TREES: Stage Gates Explained

## Stage 1→2 Decision Tree (End of August)

```
✅ Primary Metrics Result: 4-5 pass?
│
├─ YES → Go to Stage 2 ✅
│   └─ Deploy 2 pilot schools immediately (Sept 1)
│   └─ Use 150-student beta data in school pitch
│
└─ NO → 3 or fewer metrics pass
    ├─ Speech rec accuracy <85%? 
    │   └─ FIX: Retrain model, extend Stage 1 by 4 weeks, retry
    │
    ├─ Engagement low (DAU <40%)?
    │   └─ FIX: Reduce difficulty, add 5 new passages, simplify UI
    │   └─ Extend Stage 1 by 4 weeks, A/B test onboarding
    │
    └─ If can't fix in 4 weeks?
        └─ PIVOT: Halt school sales plans
        └─ Recruit new set of 100 students (different schools)
        └─ Test hypothesis: problem is schools or product?
```

---

## Stage 2→3 Decision Tree (End of December)

```
Both pilot schools performing well?
│
├─ YES (All 7 Stage 2 gates pass) → GO TO SERIES A 🚀
│   └─ Both schools renew at 50%+ full price
│   └─ Case studies ready
│   └─ Hire BD team, launch Series A
│
├─ PARTIAL (5-6 gates pass) → EXTEND STAGE 2
│   └─ Add 3rd pilot school at 60% discount
│   └─ Test: Is the issue schools or product?
│   └─ Extend 8 weeks, re-evaluate
│
└─ FAILURE (3 or fewer gates pass) → HOLD
    ├─ Conduct post-mortems: why didn't schools adopt?
    │   └─ Was speech recognition broken?
    │   └─ Were teachers not trained enough?
    │   └─ Was the problem teacher adoption or student engagement?
    │
    └─ Action: Extend Stage 1 with 50 new students
        └─ Test specific hypothesis (e.g., "teacher assignments are broken")
        └─ Re-attempt Stage 2 in Q1 2027
```

---

## Pricing Decision Tree (Stage 3 Launch)

```
Based on Stage 2 school feedback, choose pricing:
│
├─ Schools liked simplicity? Price sensitivity medium-high?
│   └─ USE: ₹200/student/year (flat, no negotiation)
│   └─ Implement in Jan 2027
│
├─ Schools want volume discounts? Large schools in pipeline?
│   └─ USE: Tiered model (₹400/Tier 1, ₹250/Tier 1.5, ₹150/Tier 2, ₹100/Tier 3)
│   └─ Implement in Jan 2027
│
└─ Schools want freemium trial?
    └─ DON'T implement yet
    └─ Keep as future optionality for Year 2
```

---

## CAC & LTV Monitoring (Quarterly Gate)

```
Every quarter, check:

LTV:CAC ratio < 3:1?
│
├─ YES → Problem! CAC too high or LTV too low
│   ├─ Is CAC >₹25K per school? → Reduce sales spending
│   ├─ Is churn >15%? → Product retention issue
│   └─ Is school price <₹150K? → Negotiate higher deals
│
└─ NO → Healthy, proceed with growth
    └─ Ratio 15:1+ = Excellent (scale aggressively)
    └─ Ratio 10:1 = Good (scale steadily)
    └─ Ratio 5-10:1 = Acceptable (improve LTV)
```

---

# 🎬 FINAL SUMMARY: What Success Looks Like

## By End of Stage 1 (August 2026)
- ✅ 150 students onboarded and active
- ✅ Metrics dashboard green (4-5 of 5 gates pass)
- ✅ Speech rec accuracy >90% validated
- ✅ Parent email engagement data collected
- ✅ Stage 2 schools identified and negotiating

## By End of Stage 2 (December 2026)
- ✅ 2 schools paying (even at discount)
- ✅ 2000+ students across schools
- ✅ Teachers actively assigning content
- ✅ Case studies documented
- ✅ Series A readiness metrics green

## By End of Stage 3 (June 2027)
- ✅ 15-20 schools at 50%+ of full price
- ✅ ₹1-2Cr ARR (annual recurring revenue)
- ✅ 10K-15K students
- ✅ Series A raised (₹3-5Cr target)
- ✅ BD team hired (2-3 people)
- ✅ Clear path to ₹10Cr+ ARR by 2028

---

## Revenue & Profit Projection

| Milestone | Timeline | ARR | Team Size | Runway |
|---|---|---|---|---|
| **Stage 1 complete** | Aug 2026 | ₹0 | 5 | 4 months |
| **Stage 2 start** | Sept 2026 | ₹0 | 6 | 3 months |
| **Stage 2 complete** | Dec 2026 | ₹30-50L | 7 | 6+ months |
| **Series A** | Jan 2027 | ₹50L | 8 | 24+ months |
| **Stage 3 complete** | Jun 2027 | ₹1-2Cr | 12 | 48+ months |

---

## Key Decision Maker: You (CEO)

**Your job at each gate:**

1. **Stage 1→2 (Aug):** Review metrics, decide "is product ready for schools?"
2. **Stage 2 Month 1 (Oct):** Decide "are teachers actually using this?"
3. **Stage 2 Month 3 (Dec):** Decide "do schools renew? Should we scale?"
4. **Stage 3 (Jan):** Decide "go to Series A or extend Stage 2?"

**One sentence you'll use 100x:** *"What does the data say?"* → Trust the metrics, not opinions.

---

**Document prepared for:** WizLingo Leadership  
**Next review date:** Mid-June 2026 (after Stage 1 planning is set)  
**Questions?** Schedule decision review before each gate
