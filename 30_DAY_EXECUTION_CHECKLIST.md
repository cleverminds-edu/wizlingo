# WizLingo: 30-Day Execution Checklist
## Get Stage 1 (100-150 Student Beta) Running by June-July 2026

**Prepared for:** Edvanta Leadership  
**Target Start Date:** June 2026  
**Timeline:** 30 days to launch beta with 100+ students  
**Owner:** Product Lead / CEO  

---

## Week 1: Foundation & Setup (June 1-7)

### **PRIORITY 1: Analytics & Metrics Infrastructure** ⭐
- [ ] **Set up Posthog or Mixpanel**
  - [ ] Create free account (Posthog recommended for India, cheaper)
  - [ ] Link to Next.js app (add instrumentation code)
  - [ ] Document tracking events (use STAGE_GATED_ROADMAP.md as reference)
  - Estimated time: 4-6 hours
  - Owner: Eng Lead
  - Acceptance: Events firing to dashboard, no data loss

- [ ] **Create analytics dashboard (Google Sheets + daily reports)**
  - [ ] Set up daily metrics export (DAU, sessions, accuracy, badge unlock rate)
  - [ ] Create Google Sheet with automated refresh from Posthog API
  - [ ] Share with leadership team (read-only)
  - Estimated time: 2 hours
  - Owner: Data analyst or PM
  - Acceptance: Dashboard updates daily at 7am with yesterday's data

- [ ] **Set up feedback collection form**
  - [ ] Create Google Form for student/teacher feedback (3-5 questions)
  - [ ] Embed in app with "Send Feedback" button
  - [ ] Set up auto-reply to show feedback was received
  - Estimated time: 1 hour
  - Owner: PM
  - Acceptance: First feedback response received by week 1

### **PRIORITY 2: School Recruitment** ⭐
- [ ] **Identify & reach out to 5-7 target schools**
  - [ ] Create target list:
    - [ ] School name, principal name, email, phone, city
    - [ ] Grade range, student count, English HOD name
    - [ ] Selection criteria: 200-1500 students, English-medium, Tier 1-2 cities
  - [ ] Draft recruitment email explaining "free beta test, we'll manage everything"
  - [ ] Send to 5-7 schools (batch outreach)
  - Estimated time: 4 hours
  - Owner: BD Lead / CEO
  - Acceptance: At least 1 principal responds positively

- [ ] **Schedule kickoff calls with responsive schools**
  - [ ] Calendar invites for June 3-5 (this week)
  - [ ] Pitch deck: 5 slides (Problem, Solution, How Beta Works, Timeline, Success Criteria)
  - [ ] Goal: Get 1-2 schools to agree to 100-150 student recruitment by June 10
  - Estimated time: 3 hours
  - Owner: CEO / Product Lead
  - Acceptance: Verbal commitment from at least 1 school

---

### **PRIORITY 3: Product Readiness** ⭐
- [ ] **Audit current app for beta readiness**
  - [ ] Test user signup/login flow (no crashes)
  - [ ] Test reading session end-to-end
  - [ ] Test speech recognition on 5 sample recordings (check accuracy)
  - [ ] Test badge earning flow
  - [ ] Test parent email triggers
  - [ ] Document any bugs found
  - Estimated time: 3 hours
  - Owner: QA + Eng Lead
  - Acceptance: Critical bugs logged, low-severity bugs can wait

- [ ] **Set up staging environment**
  - [ ] Ensure you have test database separate from prod
  - [ ] Create test student accounts (10-20) for manual testing
  - [ ] Document how to test each feature
  - Estimated time: 2 hours
  - Owner: DevOps / Eng Lead
  - Acceptance: Can create test students without production data risk

- [ ] **Prepare beta terms & privacy consent**
  - [ ] Create 1-pager: "WizLingo Beta Terms" (clear language)
  - [ ] Include: data usage, voice recording consent, feedback collection
  - [ ] Get legal review (or use template if no legal team)
  - [ ] Prepare as PDF to send to schools
  - Estimated time: 2 hours
  - Owner: Legal / CEO
  - Acceptance: Schools can print & get parent signatures

---

## Week 2: Student Onboarding Prep (June 8-14)

### **PRIORITY 1: Student Login Credentials & Distribution**
- [ ] **Finalize list of 100-150 students**
  - [ ] Get from schools: student names, grades, emails (if available)
  - [ ] If no emails: use phone numbers or ask schools to distribute links
  - [ ] Create spreadsheet: StudentName | Grade | School | LoginUsername | PIN
  - Estimated time: 2 hours
  - Owner: BD Lead (coordinate with schools)
  - Acceptance: Complete list ready to import

- [ ] **Generate login credentials**
  - [ ] Create script to auto-generate username (FirstName + StudentID) + PIN (4-digit)
  - [ ] Export as CSV
  - [ ] Create simple printed card: "Your WizLingo Login | Username: ___ | PIN: ___"
  - [ ] Print 150 cards (or schools can print)
  - Estimated time: 3 hours
  - Owner: Eng Lead
  - Acceptance: All 150 credentials generated and in spreadsheet

- [ ] **Create student landing page/onboarding flow**
  - [ ] Design simple first-session experience (welcome, tutorial video 30s, first passage)
  - [ ] Test on 3 devices (desktop, tablet, mobile)
  - [ ] Ensure speech recording works without friction
  - [ ] Add "Send Feedback" button prominently
  - Estimated time: 4 hours
  - Owner: Frontend Eng
  - Acceptance: No crashes, smooth onboarding, <2 min to first reading

- [ ] **Create teacher onboarding guide (if applicable)**
  - [ ] 1-page PDF: "How to Use WizLingo in Your Class"
  - [ ] Include: login info, how to monitor student progress, how to share results
  - [ ] Record 3-minute Loom video walkthrough
  - Estimated time: 2 hours
  - Owner: Product Lead
  - Acceptance: Teachers receive guide and can login by June 14

---

### **PRIORITY 2: Parent Email Setup**
- [ ] **Create parent email templates**
  - [ ] Welcome email (when student first logs in)
  - [ ] Badge earned email (with badge image, school name, student name)
  - [ ] Weekly progress email (top performers in their school)
  - [ ] Edit templates to use {placeholders}: {studentName}, {schoolName}, {grade}, {stat}
  - Estimated time: 3 hours
  - Owner: Growth/Content Lead
  - Acceptance: All 3 templates written and branded

- [ ] **Set up email sending infrastructure**
  - [ ] Verify SMTP setup (AWS SES or SendGrid)
  - [ ] Test sending 1 email to yourself
  - [ ] Create email event tracking (opens, clicks)
  - [ ] Document email sending API endpoint
  - Estimated time: 2 hours
  - Owner: Backend Eng
  - Acceptance: Can send test email and track opens

- [ ] **Connect parent emails to student activities**
  - [ ] When student earns badge → send parent email (auto)
  - [ ] When student completes 5 sessions → send progress email (auto)
  - [ ] Test flow: Create student, earn badge, check email
  - Estimated time: 3 hours
  - Owner: Backend Eng
  - Acceptance: Parent receives email 2 minutes after student earns badge

---

### **PRIORITY 3: Dashboard & Reporting**
- [ ] **Create admin dashboard for leadership to monitor beta**
  - [ ] Show: total users, DAU, WAU, avg sessions/day, badge earn rate, accuracy trend
  - [ ] Update automatically from analytics (daily, not real-time)
  - [ ] Add comments section for leadership notes
  - Estimated time: 3 hours
  - Owner: Full-stack Eng or Data analyst
  - Acceptance: Dashboard accessible to CEO, updated by 7am daily

---

## Week 3: Launch & Day 1 (June 15-21)

### **PRIORITY 1: Send Student Credentials**
- [ ] **Distribute login credentials to all 100-150 students**
  - [ ] Schools either:
    - [ ] Print credential cards + distribute in class
    - [ ] Send email links (if emails available)
    - [ ] WhatsApp links (if schools have student phone numbers)
  - [ ] Include: short onboarding video link + login instructions
  - [ ] Follow up with schools to confirm distribution by June 19
  - Estimated time: 2 hours
  - Owner: BD Lead
  - Acceptance: 100+ students have credentials by June 18

- [ ] **Send launch email to schools**
  - [ ] Subject: "WizLingo Beta Launches This Week — Here's How to Get Started"
  - [ ] Include: student login cards, teacher guide, progress link
  - [ ] Personal call from CEO to principal day before launch
  - Estimated time: 1 hour
  - Owner: CEO
  - Acceptance: Calls completed, excitement high

- [ ] **Monitor Day 1 metrics**
  - [ ] Track: signups, first session completions, crashes
  - [ ] Have team on standby for issues
  - [ ] Create Slack channel: #beta-launch for real-time updates
  - [ ] Target: 80+ students login on Day 1
  - Estimated time: 4 hours (active monitoring)
  - Owner: All eng + PM
  - Acceptance: 80+ Day 1 logins, zero critical issues

---

### **PRIORITY 2: Teacher Outreach (If Assigned)**
- [ ] **Brief teachers on beta expectations**
  - [ ] Schedule 30-min calls with 2-3 English teachers from pilot schools
  - [ ] Explain: it's a beta, we need feedback, students may encounter bugs
  - [ ] Ask: Will you assign WizLingo homework? Or just let students play?
  - [ ] Clarify: If assigning, provide assignment template
  - Estimated time: 2 hours
  - Owner: Product Lead
  - Acceptance: Teachers clear on expectations, 1+ agrees to assign content

---

### **PRIORITY 3: Parent Communication**
- [ ] **Send parent welcome email (day of launch)**
  - [ ] Template: "Your child is starting WizLingo, here's what to expect"
  - [ ] Include: What the app does, why we're testing, where to give feedback
  - [ ] Personalized: {studentName} from {schoolName}
  - Estimated time: 1 hour
  - Owner: Growth Lead
  - Acceptance: 100+ parent emails delivered by Day 1 evening

---

## Week 4: Daily Monitoring & Quick Wins (June 22-28)

### **PRIORITY 1: Daily Metrics Review**
- [ ] **Set up 9am daily standup** (15 min, async Slack acceptable)
  - [ ] DAU yesterday? (Target: >70 by week 4)
  - [ ] Sessions completed? (Target: >150)
  - [ ] Any crashes or bugs? (escalate if critical)
  - [ ] Parent email opens? (track %)
  - Owner: PM / Data analyst
  - Acceptance: Daily updates posted to Slack

- [ ] **Weekly leadership review** (Friday, 30 min)
  - [ ] Review full metrics dashboard
  - [ ] Discuss if on track for Stage 1 gates
  - [ ] Any immediate fixes needed? (prioritize for next week)
  - Owner: CEO
  - Acceptance: Meeting notes + action items documented

---

### **PRIORITY 2: Teacher Feedback Loop**
- [ ] **Check in with 3 teachers from schools**
  - [ ] Quick call or message: "Are students using it? Any issues?"
  - [ ] Ask specific: "Did you assign homework? If not, why?"
  - [ ] Offer: "Any features missing? Any bugs?"
  - Estimated time: 2 hours
  - Owner: Product Lead
  - Acceptance: Feedback documented, 1+ quick wins identified

- [ ] **Fix 2-3 quick wins from feedback**
  - [ ] Example: "Students say accuracy feedback is confusing" → reword feedback
  - [ ] Example: "Teachers want to see class results" → add class leaderboard view
  - [ ] Pick highest-impact, fastest fixes only
  - Estimated time: 4-6 hours
  - Owner: Frontend Eng
  - Acceptance: Fixes deployed and tested by week 4 end

---

### **PRIORITY 3: Parent Email Optimization**
- [ ] **A/B test parent email subject line**
  - [ ] Send 2 versions of badge email to different parents (50/50)
  - [ ] Version A: "Aditi earned WORD WIZARD badge! 📚"
  - [ ] Version B: "Your child mastered reading comprehension — AI certified! 🎯"
  - [ ] Track open rates for 3 days
  - [ ] Winner (higher opens) = use for all future badge emails
  - Estimated time: 2 hours
  - Owner: Growth Lead
  - Acceptance: A/B test results documented, winner chosen

---

### **PRIORITY 4: Speech Recognition Validation**
- [ ] **Test accuracy on 20-30 real student recordings**
  - [ ] Download recordings from beta students
  - [ ] Have 2 native English speakers manually rate (accuracy: correct/incorrect)
  - [ ] Compare to WizLingo's speech rec output
  - [ ] Calculate % agreement (target: >90%)
  - Estimated time: 3-4 hours
  - Owner: ML Lead / Audio Specialist
  - Acceptance: Results documented, if <85% flag for Stage 1→2 gate review

---

## Week 4 Gate Review: Stage 1 Checkpoint (June 28-30)

### **GATE DECISION MEETING** (Friday June 28, 1 hour)

**Attendees:** CEO, Product Lead, Eng Lead, Growth Lead, Data Analyst

**Agenda:**

1. **Metric Review** (15 min)
   - [ ] DAU: Are we >70% of active users?
   - [ ] Session completion: >70% finishing full session?
   - [ ] Accuracy: >90% speech rec agreement?
   - [ ] Badge unlock: >30% earned first badge?
   - [ ] Parent email opens: >25%?

2. **Qualitative Feedback** (10 min)
   - [ ] Teacher feedback: Positive? Any blockers?
   - [ ] Student feedback: Fun or boring? Any pain points?
   - [ ] Parent feedback: Engaging? Any concerns?

3. **Decision** (5 min)
   - [ ] **GO → Stage 2 (1-2 schools):** Metrics look good, proceed with paid pilots
   - [ ] **HOLD → Extend Stage 1:** 1-2 metrics below target, needs 2-week extension
   - [ ] **PIVOT:** Multiple metrics failing, product needs rework before schools

4. **Action Items** (if HOLD or PIVOT)
   - [ ] Assign owner for each failing metric fix
   - [ ] Timeline for next gate review (July 12)

---

## Summary: What You'll Have by End of June

| Item | Status | Owner |
|------|--------|-------|
| **Analytics dashboard** | ✅ Live | Eng + Data |
| **100-150 students onboarded** | ✅ Active | BD Lead |
| **Metrics tracked daily** | ✅ Posted to Slack | PM |
| **Teacher feedback** | ✅ Documented | Product Lead |
| **Parent email engagement** | ✅ Measured | Growth Lead |
| **Speech rec validated** | ✅ Quality checked | ML Lead |
| **Stage 1→2 decision** | ✅ Made | CEO |

---

## Critical Path Dependencies

**If any of these slip, the whole timeline slips:**

1. **School recruitment** (Week 1)
   - If not done by June 7: Can't recruit 100+ students by June 15
   - Mitigation: Start outreach by June 1 (NOW)

2. **Student onboarding infrastructure** (Week 2)
   - If not done by June 14: Can't launch by June 20
   - Mitigation: Parallelize credential generation with school recruitment

3. **Analytics setup** (Week 1)
   - If not done by June 7: Can't measure Stage 1 success
   - Mitigation: Use basic Google Analytics as fallback, upgrade to Posthog parallel

4. **Speech recognition validation** (Week 4)
   - If not done by June 21: Can't confidently proceed to Stage 2
   - Mitigation: Parallel validation with ongoing beta (don't wait for Week 4)

---

## Weekly Capacity Plan

### **Engineering Team (assume 3-5 people)**
- **Week 1:** Analytics setup (4 hrs), staging env (2 hrs), bug fixes (2 hrs) = 8 hrs each
- **Week 2:** Onboarding UX (4 hrs), email setup (3 hrs), testing (3 hrs) = 10 hrs each
- **Week 3:** Launch monitoring (4 hrs), quick fixes (6 hrs) = 10 hrs each
- **Week 4:** Bug fixes (4 hrs), quick wins (6 hrs) = 10 hrs each
- **Total per eng:** 38-40 hours out of 40 = Fully allocated

### **Product Lead (1 person)**
- **Week 1:** School recruitment call support, beta terms, product audit = 6 hrs
- **Week 2:** Email templates, teacher guide, dashboard design = 8 hrs
- **Week 3:** Launch coordination, teacher briefings = 4 hrs
- **Week 4:** Daily standup, teacher feedback calls, A/B tests = 6 hrs
- **Total:** 24 hours (60% allocated)

### **BD Lead (1 person, if dedicated)**
- **Week 1:** School outreach, 5 calls = 8 hrs
- **Week 2:** Coordination with schools, credential distribution plan = 4 hrs
- **Week 3:** Ensure credentials distributed, launch coordination = 6 hrs
- **Week 4:** Weekly check-ins with schools, NPS tracking = 4 hrs
- **Total:** 22 hours (55% allocated)

### **Growth/Content Lead (0.5 person)**
- **Week 2:** Email templates, parent communication = 3 hrs
- **Week 3:** Parent email send, tracking setup = 2 hrs
- **Week 4:** Email A/B testing, analytics = 3 hrs
- **Total:** 8 hours (20% allocated)

---

## Risk Mitigation

| Risk | Mitigation | Owner |
|------|-----------|-------|
| **Schools don't recruit 100 students** | Start outreach by June 1, have backup pool of 3 more schools | CEO |
| **Speech rec broken (accuracy <85%)** | Validate on 5 recordings by June 15, don't wait for Week 4 | ML Lead |
| **Parent emails don't send** | Test SMTP on June 10, have SendGrid as backup | Backend Eng |
| **Analytics dashboard wrong data** | Spot-check manual counts vs Posthog by June 20 | Data Analyst |
| **Critical bugs at launch** | Freeze feature work from June 15-21, focus on stability | Eng Lead |
| **Teacher confusion on how to use app** | Send teacher guide by June 13, offer live training call June 17 | Product Lead |

---

## Success Looks Like (June 28-30)

✅ **150 students signed up, 100+ active**  
✅ **DAU >70, avg 1-2 sessions/week per student**  
✅ **30%+ earn SPARK badge**  
✅ **25%+ parent emails opened**  
✅ **Speech rec accuracy validated >90%**  
✅ **Zero critical bugs at launch**  
✅ **Teachers understand how to use it**  
✅ **Parents interested (high email engagement)**  
✅ **Stage 1→2 gate decision = GO**  

---

## Slack Channels to Create

```
#beta-launch — Real-time launch day updates
#metrics-daily — Automated metric posts (9am)
#bugs-found — Any issues from beta students
#teacher-feedback — Feedback from pilot teachers
#parent-feedback — Parent engagement tracking
#stage1-gate — Stage 1→2 decision meeting notes
```

---

**Prepared by:** WizLingo Strategy  
**Distribution:** Leadership team, Eng leads, PM, BD, Growth  
**Questions?** Tag CEO in Slack  
**Next review:** June 21 (Day 7 metrics review)
