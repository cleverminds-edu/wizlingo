# 🚀 SPRINT LAUNCH - Week 3-4 (July 1-14)

**Date:** June 30, 2026  
**Status:** 🟢 READY TO EXECUTE  
**Goal:** Beta launch to 50-100 testers by July 14  

---

## 📌 CRITICAL INFO FOR TEAM

### TODAY (Monday, June 30)
- Share this document with your team
- Schedule 9 AM standup for Monday, July 1
- Team members claim their tasks below

### MONDAY, JULY 1 (9:00 AM)
- Team standup (15 min)
- 3 people start coding immediately
- Everyone else on standby for unblocks

### JULY 14 (Beta Launch Day)
- Beta live to 50-100 testers
- All 7 tasks complete
- Staging environment stable

---

## 🎯 YOUR 3 IMMEDIATE ASSIGNMENTS

### **Backend Dev 1** - Task #47
```
TASK: T1.2 - Implement Lesson Start Endpoint
WHAT: Build POST /api/lesson/session/start
WHY: Starts the lesson flow - blocks everything
WHEN: Monday 9 AM → Wednesday noon
HOW: See LESSON_API_SPEC.md for full spec
NEXT: Then start Task #48

START NOW:
  1. Read /LESSON_API_SPEC.md (15 min)
  2. Read /app/api/auth/login/route.ts (see pattern)
  3. Create /app/api/lesson/session/start/route.ts
  4. Implement per spec
  5. Write unit tests
  6. Open PR for code review by Tuesday 3 PM
```

### **Backend Dev 2** - Task #49
```
TASK: T1.4 - Create Answer Validation Logic
WHAT: Build lib/assessment/validator.ts
WHY: Validates student answers - needed by submit endpoint
WHEN: Monday 9 AM → Wednesday noon
HOW: Reusable validation functions for multiple_choice, true_false, text_match
NEXT: Unblocks Backend Dev 1's #48 task

START NOW:
  1. Read /LESSON_API_SPEC.md section "Data Validation Rules"
  2. Create /lib/assessment/validator.ts
  3. Implement 3 validator functions
  4. Write comprehensive unit tests
  5. Open PR for code review by Tuesday 3 PM
```

### **Frontend Dev** - Task #50
```
TASK: T1.5 - Build Interactive Lesson Player Component
WHAT: Create /app/lesson/[sessionId]/page.tsx
WHY: Students interact with lessons - core user experience
WHEN: Monday 9 AM → Thursday EOD
HOW: Design component layout, start building, integrate APIs when #47 ready
NEXT: Then start Task #51

START NOW:
  1. Read /LESSON_API_SPEC.md (request/response examples)
  2. Create /app/lesson/[sessionId]/page.tsx
  3. Build component structure (auth, fetch, display)
  4. Implement progress indicator
  5. On Tuesday: integrate with real #47 API when available
  6. Open PR for code review by Thursday 3 PM
```

---

## 📋 COMPLETE TASK LIST

### **IN PROGRESS (Start Monday)**
```
#47 (Backend Dev 1): T1.2 - Lesson Start Endpoint (5 pts)
   └─ No blockers - START NOW ⚡

#49 (Backend Dev 2): T1.4 - Answer Validation (5 pts)
   └─ No blockers - START NOW ⚡

#50 (Frontend Dev): T1.5 - Lesson Player UI (8 pts)
   └─ No blockers - START NOW ⚡
```

### **PENDING (Unblock as completed)**
```
#48 (Backend Dev 1): T1.3 - Lesson Submit Endpoint (5 pts)
   └─ Waits for #49 (Tue) → Start Tuesday

#51 (Frontend Dev): T1.6 - Results Screen (5 pts)
   └─ Waits for #47, #50 (Thu) → Start Thursday

#52 (QA Lead): T1.7 - Integration Testing (5 pts)
   └─ Waits for #50, #51 (Fri) → Start Friday

#53 (DevOps Lead): T1.8 - Deploy to Staging (3 pts)
   └─ Waits for #52 (Wed) → Start Wed July 10
```

---

## ⚡ DAILY RHYTHM

### **9:00 AM - Daily Standup (15 min)**
Each person (2 min):
1. What did you complete yesterday?
2. What's your focus today?
3. Any blockers?

**Update board after:** `claude task list`

### **3:00 PM - Code Review (30 min)**
- Share PR links in Slack
- Review each other's code
- Feedback same day

### **5:00 PM - Update Tasks**
- Mark tasks completed: `claude task update <id> --status completed`
- Flag any P0 issues: Post to #bugs-critical

---

## 🔗 CRITICAL DEPENDENCIES

```
Monday (Jul 1):
  #47 START → Code for 1 day
  #49 START → Code for 2 days (unblocks #48)
  #50 START → Design for 1 day, code for 2 days

Tuesday (Jul 2):
  #47 DONE → Merge to develop
  #48 START (Backend Dev 1) → Blocked by #49, but can start design
  
Wednesday (Jul 3):
  #49 DONE → Merge to develop
  #48 DONE → Merge to develop
  #50 CONTINUE → API integration starts

Thursday (Jul 4):
  #50 DONE → Merge to develop
  #51 START (Frontend Dev)

Friday (Jul 5):
  #51 DONE → Merge to develop
  #52 START (QA Lead) → Test full flow

Next Week:
  #52 CONTINUE → Finish tests
  #53 START (DevOps) → Deploy to staging
  
July 14:
  ✅ All done → Beta live
```

**If any task slips, beta launch slips.** Stay on track.

---

## 📚 REFERENCE DOCS

**Must Read:**
- `LESSON_API_SPEC.md` - API design (all devs)
- `WEEK3-4_SPRINT_PLAN.md` - Full detailed plan
- `WEEK3-4_KICKOFF_BRIEF.md` - Team context

**Reference:**
- `ARCHITECTURE.md` - System design
- `prisma/schema.prisma` - Database
- `app/api/auth/login/route.ts` - API pattern example
- `app/dashboard/page.tsx` - Frontend pattern example

---

## 🎯 SUCCESS CRITERIA

**By Friday, July 5 (Week 1 end):**
```
✅ #47, #48, #49 merged (all backend APIs working)
✅ #50, #51 merged (full UI working)
✅ All tests passing
✅ No P0 bugs
✅ On track for beta
```

**By Friday, July 12 (Week 2 end):**
```
✅ #52 complete (integration tests passing)
✅ #53 complete (staging deployed)
✅ 24-hour stability test passed
✅ Beta testers ready (50-100)
```

**July 14 (Launch day):**
```
🎉 Beta is LIVE
```

---

## 💬 COMMUNICATION

**Slack Channels:**
```
#week3-4-sprint          ← Main updates (post daily progress)
#backend-apis            ← Backend team chat
#frontend-ui             ← Frontend team chat
#qa-testing              ← QA reports
#bugs-critical           ← P0 issues (ping everyone)
```

**Daily Cadence:**
```
9:00 AM   - Standup in person or Slack
3:00 PM   - Code review session
5:00 PM   - Update task board
```

---

## 🚨 IF YOU GET STUCK

**Problem:** API takes longer than expected
**Solution:** Simplify first version, add features post-beta

**Problem:** Frontend needs API but it's not ready
**Solution:** Use mock API with hardcoded data, swap in real API later

**Problem:** Tests keep failing
**Solution:** Pair with backend dev, debug together

**Problem:** Blocked waiting for code review
**Solution:** Post in Slack immediately, review happens same day

**Problem:** Something's not in the spec
**Solution:** Ask in #week3-4-sprint, update spec, proceed

---

## 📊 TRACKING PROGRESS

**View task status anytime:**
```bash
claude task list
```

**Update when you finish:**
```bash
claude task update 47 --status completed
```

**Check what's blocked:**
```bash
claude task list | grep blocked
```

---

## 🎓 QUICK START

**For Backend Dev 1:**
```bash
# Clone/pull latest code
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/t1-2-lesson-start

# Read the spec
cat LESSON_API_SPEC.md

# See existing API pattern
cat app/api/auth/login/route.ts

# Create your endpoint
touch app/api/lesson/session/start/route.ts

# Code it
# ... implement POST /api/lesson/session/start
# ... write tests
# ... commit & push

# Open PR for review
```

**For Backend Dev 2:**
```bash
# Same as above, but:
# Create validation library instead
touch lib/assessment/validator.ts

# Code the 3 validators
# ... implement multiple_choice validator
# ... implement true_false validator
# ... implement text_match validator
# ... write unit tests
```

**For Frontend Dev:**
```bash
# Same initial steps, but:
touch app/lesson/\[sessionId\]/page.tsx

# Create lesson player component
# ... auth check
# ... fetch lesson
# ... display content
# ... track answers
# ... integrate API Tuesday
```

---

## 🏁 LAUNCH CHECKLIST

Before starting Monday:

**All Team:**
- [ ] Read this document
- [ ] Read LESSON_API_SPEC.md
- [ ] Have Slack open
- [ ] 9 AM standup scheduled

**Backend Dev 1:**
- [ ] Know you're starting #47
- [ ] Read API spec section 2 & 3
- [ ] Have auth/login endpoint open for reference

**Backend Dev 2:**
- [ ] Know you're starting #49
- [ ] Read API spec validation rules section
- [ ] Ready to code validators

**Frontend Dev:**
- [ ] Know you're starting #50
- [ ] Read full API spec
- [ ] Have dashboard component open for reference

**QA Lead:**
- [ ] Know you start Friday (#52)
- [ ] Start preparing test cases
- [ ] Set up test environment

**DevOps Lead:**
- [ ] Know you start Wednesday July 10 (#53)
- [ ] Start preparing staging environment
- [ ] Test CI/CD pipeline locally

---

## 🎉 READY?

**Monday 9 AM Standup to Kickoff**

Share this with your team now.

See you on the other side of beta launch! 🚀

---

**Generated:** June 30, 2026  
**Status:** 🟢 READY TO LAUNCH  
**Next:** Share with team, start Monday 9 AM  
