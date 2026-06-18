# WizLingo Beta Launch - Quick Start Guide

**Go Live:** June 18, 2026 | **Target:** 100-150 Students | **Schools:** 1-2 (Tier 2/3)

---

## 🚀 Live Now!

**App URL:** `https://wizlingo.edvanta.co.in`

---

## 📱 For Students

### How to Sign Up

1. **Go to:** `https://wizlingo.edvanta.co.in/auth/signup`
2. **Fill form:**
   - Name: `Aditya`
   - Date of Birth: `2010-05-15`
   - Class: `Class V`
   - Phone: `9876543210`
3. **System generates password:** `ADI20210`
   - Format: [First 3 name letters] + [birth year] + [last 3 phone digits]
4. **Share credentials via WhatsApp/SMS**
5. **Student logs in at:** `/auth/login-password`
6. **Reset password after first login** (optional)

### Multi-Phone Support ✅
Multiple students can use the SAME phone!
- Each gets unique name-based password
- Independent logins & progress tracking
- Perfect for tier 2/3 schools

---

## 👨‍💼 For Managers

### Monitor Beta in Real-Time

**Dashboard:** `https://wizlingo.edvanta.co.in/admin/dashboard`

**See:**
- Total students signed up
- Active users (last 24h, this week)
- Reading & speaking performance
- Engagement rate %
- Badges earned
- Recent signups list
- Top performers leaderboard

**Auto-refreshes every 30 seconds**

---

## 🎯 Day-1 Checklist

### Morning (9 AM)
- [ ] Verify site is live: `https://wizlingo.edvanta.co.in`
- [ ] Test health check: `/api/health` returns `{"status":"healthy"}`
- [ ] Create 5 test accounts for QA

### Midday (12 PM)
- [ ] Onboard first batch of students (20-30)
- [ ] Share signup link + branding materials
- [ ] Test signup form works end-to-end
- [ ] Verify password generation is correct

### Evening (5 PM)
- [ ] Check dashboard: `/admin/dashboard`
- [ ] Review first student metrics
- [ ] Test login with created accounts
- [ ] Verify animations work on mobile

### Night (8 PM)
- [ ] Monitor for any error logs
- [ ] Confirm database is healthy
- [ ] Prepare for Day 2 onboarding

---

## 📊 Student Onboarding Script

**Share with school coordinators:**

```
Hi [School Name],

WizLingo is now live! Here's how to get your students started:

🎯 SIGN UP (takes 2 minutes per student)
1. Go to: https://wizlingo.edvanta.co.in/auth/signup
2. Enter: Name, Birthday, Class, Phone
3. Copy the auto-generated password
4. Share password with student

✅ GREAT FOR YOUR SCHOOL
- Multiple students can use one phone
- AI adapts to each student's level
- Reading + Speaking practice daily
- Leaderboards & badges motivate

🎓 STUDENT FIRST LOGIN
- Phone: 9876543210
- Password: (given at signup)
- Reset password (optional)
- Start learning!

📱 OFFLINE MODE
- Works without internet (after first load)
- Practice anytime, anywhere
- Syncs when online

Questions? Contact: info@clevermindsglobalschool.com
```

---

## 🔄 Daily Operations

### Morning Check
```bash
# Test health
curl https://wizlingo.edvanta.co.in/api/health

# View dashboard
https://wizlingo.edvanta.co.in/admin/dashboard
```

### Create New Student
```bash
# Via signup form at:
https://wizlingo.edvanta.co.in/auth/signup

# Or via API:
curl -X POST https://wizlingo.edvanta.co.in/api/auth/signup-detailed \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Priya",
    "dateOfBirth": "2012-03-20",
    "classId": "optional-class-id",
    "phone": "9123456789"
  }'
```

### Monitor Engagement
- Check `/admin/dashboard` 
- Look for: Active (24h), Active (Week), Engagement %
- Goal: 60%+ weekly engagement

---

## 📈 Success Metrics (Week 1)

| Metric | Target | Check |
|--------|--------|-------|
| Students Onboarded | 20-50 | Dashboard → Total Students |
| Active Daily | 10-20 | Dashboard → Active (24h) |
| Engagement Rate | 40%+ | Dashboard → Overall Engagement % |
| Password Success | 100% | /api/auth/signup-detailed response |
| Zero Errors | 0 errors | Monitor Railway logs |

---

## 🎨 Features Deployed

### ✅ B2C Signup System
- Phone-based signup
- Auto-password: Name + Year + Phone
- Class assignment (optional)
- Works on shared phones

### ✅ Animated Login
- Floating logo
- Glow effect
- Smooth form animations
- Password formula reminder

### ✅ Real-Time Dashboard
- Animated stat counters
- Performance metrics
- Badges & achievements
- Recent signups & top performers

### ✅ PWA Support
- Offline reading sessions
- Install to home screen
- Works on Android/iOS/web

### ✅ Adaptive AI
- Level adjustment based on performance
- Reading: 5 sessions ≥80% → level up
- Speaking: 5 sessions ≥75% → level up

---

## 🚨 Troubleshooting

### "Password formula is wrong"
- Check signup page at `/auth/signup`
- Should show: "First 3 name + Year + Last 3 phone"
- Clear browser cache if old message appears

### "Classes not showing in dropdown"
- Classes dropdown is OPTIONAL
- If needed, contact: info@clevermindsglobalschool.com
- Will seed test classes on request

### "Can't login with password"
- Verify password format: `[3letters][YYYY][3digits]`
- Example: Aditya + 2010 + 210 = `ADI20210`
- Check phone number is correct

### "Dashboard shows 0 students"
- Normal if just launched
- Create test account to populate
- Will show within 30 seconds

---

## 📞 Support Contacts

| Issue | Contact |
|-------|---------|
| Technical Questions | info@clevermindsglobalschool.com |
| Student Onboarding | School Coordinator |
| Performance Issues | Monitor /admin/dashboard |
| Database Issues | Railway Dashboard |

---

## 🎊 Launch Timeline

```
June 18 (Today)
├─ ✅ Deploy to Railway
├─ ✅ Run verification tests
└─ ✅ Ready for students

June 18-22 (Week 1)
├─ Onboard 20-50 students
├─ Monitor engagement
└─ Optimize based on feedback

June 23-29 (Week 2)
├─ Onboard 50-100 students
├─ Refine AI difficulty
└─ Add school-specific features

June 30 - July 15 (Week 3-4)
├─ Target 100-150 students
├─ Analyze learning patterns
└─ Prepare for paid pilot phase
```

---

## ✨ What Makes WizLingo Special

✅ **No app download** - just visit URL  
✅ **Works offline** - practice anywhere  
✅ **Multi-user phones** - perfect for tier 2/3  
✅ **Adaptive AI** - adjusts to each student  
✅ **Gamified** - badges + leaderboards  
✅ **Real-time monitoring** - see progress instantly  

---

**Powered by Edvanta Intelligence System**

🚀 **Let's make English learning accessible to 100+ students!**
