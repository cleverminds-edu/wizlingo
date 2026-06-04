# Phase 1 & Phase 2 Local Testing Checklist

## 🚀 Setup
- Dev Server: `http://localhost:3000`
- Database: Connected (check via Prisma Studio)
- Student Test Account: Use existing or create new

---

## Phase 1: Badge System - Core Functionality

### Test 1: Student Login & Dashboard
- [ ] Navigate to login page
- [ ] Login with student credentials
- [ ] Dashboard loads without errors
- [ ] Check badge section visible
- [ ] No console errors

### Test 2: Earning SPARK Badge (First Session)
**Flow:** Complete any reading session → Should earn SPARK badge
- [ ] Start a reading session
- [ ] Complete the session
- [ ] Verify badge earned notification appears
- [ ] Check celebration modal shows
- [ ] Modal displays: badge image, congratulations message, share button
- [ ] Auto-closes after ~8 seconds
- [ ] Dashboard updated with new badge

### Test 3: Celebration Modal Features
- [ ] Badge image displays correctly
- [ ] Confetti animation plays
- [ ] Congratulations message personalized with student name
- [ ] Share button visible with dropdown options
- [ ] Modal closes when clicking X or auto-closes

### Test 4: Share Functionality
- [ ] Click share button → Dropdown appears
- [ ] WhatsApp option → Pre-filled with badge message
- [ ] Copy to Clipboard → Message copied (check clipboard)
- [ ] Native Share (if available on device)
- [ ] Verify message includes badge name and student stats

### Test 5: Badge Progress (Locked Badges)
- [ ] View dashboard → See locked badges
- [ ] Progress bars display for each locked badge
- [ ] Progress updates as sessions are completed
- [ ] Messages change based on progress (0-33%, 33-66%, 66-90%, 90%+)
- [ ] Accuracy percentage shown in progress messages

### Test 6: Earning WORD_WIZARD Badge
**Condition:** 80%+ reading accuracy
- [ ] Complete reading sessions with high accuracy (80%+)
- [ ] Wait for session to process
- [ ] Check if WORD_WIZARD badge earned
- [ ] Verify celebration shows "WORD_WIZARD" message
- [ ] Progress bar updates

### Test 7: Earning VOICE_WIZARD Badge
**Condition:** 75%+ speaking fluency
- [ ] Complete speaking session with good fluency
- [ ] Check avatar fluency score
- [ ] If 75%+, verify VOICE_WIZARD badge earned
- [ ] Celebration displays correct badge
- [ ] Message mentions speaking fluency

### Test 8: Analytics & Messages
- [ ] Open dev console → Check network tab
- [ ] Badge earned triggers analytics event
- [ ] Share action logs event
- [ ] Messages personalized with student name and stats

---

## Phase 2: Advanced Features - New Functionality

### Test 9: Celebration Effects (Particle Burst)
**What to look for:** Enhanced celebration with particles
- [ ] Earn a new badge (if student eligible)
- [ ] Celebration modal appears
- [ ] Particle burst animation plays (75-120 particles)
- [ ] Particles spread in 360° with physics (gravity, rotation)
- [ ] Animation runs smoothly at ~60fps
- [ ] Particles fade out over time
- [ ] Check browser DevTools → No console errors
- [ ] Mobile: Animation still smooth on mobile device

### Test 10: Sound Effects
**Desktop testing** (sound may not work on all environments)
- [ ] Earn a badge on desktop browser
- [ ] Listen for cheerful chime sound
- [ ] Sound plays once at celebration start
- [ ] Volume control works (if muted, no sound)
- [ ] Mobile: Synthesis audio fallback (silent ok)

### Test 11: Certificate Generation & Download
**What to test:** PDF certificate creation
- [ ] Earn a badge (or use dashboard certificate feature)
- [ ] Look for "Download Certificate" button
- [ ] Click to generate certificate
- [ ] PDF downloads to downloads folder
- [ ] Open PDF → Verify:
  - Badge name and icon
  - Student name
  - Issue date
  - QR code present
  - Professional design
  - Print-friendly layout

### Test 12: Certificate Verification
- [ ] Open downloaded certificate PDF
- [ ] Scan or click QR code
- [ ] Browser opens verification page
- [ ] Verification page shows:
  - Student name
  - Badge earned
  - Issue date
  - Verification code
  - Public view (no login required)

### Test 13: Leaderboards
**Navigate to:** `/leaderboards` or dashboard → Leaderboards
- [ ] All 5 leaderboard types load:
  - [ ] Badge Count (who has most badges)
  - [ ] Speed (who earned SPARK fastest)
  - [ ] Consistency (most sessions)
  - [ ] Accuracy (highest reading accuracy %)
  - [ ] Fluency (highest speaking fluency %)
- [ ] Rankings display with:
  - [ ] Student names
  - [ ] Rank (1, 2, 3, etc.)
  - [ ] Medal icons (🥇🥈🥉 for top 3)
  - [ ] Metric value (badges, accuracy %, etc.)
  - [ ] Trend indicator (↑↓→ vs previous day)
- [ ] Scopes work:
  - [ ] Class leaderboard
  - [ ] School leaderboard
  - [ ] All-time rankings
- [ ] Load time < 500ms
- [ ] Mobile responsive

### Test 14: Achievement Timeline
**Navigate to:** Student Dashboard → Journey / Timeline
- [ ] Timeline page loads
- [ ] Shows chronological list of badges earned
- [ ] Each badge shows:
  - [ ] Badge image
  - [ ] Badge name
  - [ ] Date earned
  - [ ] Stats at time of earning
- [ ] Responsive layout (vertical on mobile)
- [ ] Smooth scrolling

### Test 15: Badge Collection Gallery
**On Dashboard or Journey Page**
- [ ] Gallery view shows all badges
- [ ] Earned badges highlighted/full color
- [ ] Locked badges grayscale/dimmed
- [ ] Grid layout responsive
- [ ] Clicking badge shows details
- [ ] Mobile: Single column, full-width

### Test 16: Achievement Statistics
**Dashboard or Journey Page**
- [ ] Shows metrics:
  - [ ] Total badges earned
  - [ ] Days since first badge
  - [ ] Average days between badges
  - [ ] Current streak
  - [ ] Progress toward next badge
- [ ] Stats accurate and real-time
- [ ] Sparkline/trend chart (if included)

### Test 17: Email System (Local Queue)
**Important:** Emails won't actually send locally, but should queue
- [ ] Earn a badge
- [ ] Check database: `SentEmail` table has new entry
- [ ] Verify email record shows:
  - [ ] Type: "badge_earned"
  - [ ] Recipient email (student or parent)
  - [ ] Subject and body populated
  - [ ] Status: "queued" or "sent"
- [ ] Check logs: No email service errors

### Test 18: Notification Preferences
**Navigate to:** Settings → Notification Preferences
- [ ] Can toggle email notifications on/off
- [ ] Can set frequency (immediate, daily, weekly)
- [ ] Preferences save to database
- [ ] Settings respected in email queue

### Test 19: Responsive Design
**Test on multiple screen sizes:**
- [ ] Mobile (375px): 
  - [ ] Celebration modal fits screen
  - [ ] Leaderboard scrolls horizontally if needed
  - [ ] Timeline stacks vertically
  - [ ] Share buttons accessible
- [ ] Tablet (768px):
  - [ ] Layout optimized
  - [ ] Touch targets appropriate size
- [ ] Desktop (1024px+):
  - [ ] Full width utilized
  - [ ] Grid layouts display properly

### Test 20: Performance
- [ ] Dashboard loads in < 2 seconds
- [ ] Leaderboard API response < 500ms
- [ ] Certificate generation < 5 seconds
- [ ] Celebration animation 60fps (no jank)
- [ ] No memory leaks (leave open 5+ minutes)

### Test 21: Browser Console
- [ ] No console errors (red)
- [ ] No critical warnings
- [ ] Network requests successful (200s, not 404/500)
- [ ] No CORS errors
- [ ] TypeScript types correct

### Test 22: Dark Mode (if implemented)
- [ ] Toggle dark mode
- [ ] All components visible and readable
- [ ] Celebration animation visible
- [ ] Leaderboard contrast acceptable
- [ ] No color contrast issues (WCAG AA)

---

## Phase 1 & 2 Integration Test Flow

### Happy Path: Complete Student Journey
1. **Login** as student
2. **Complete reading session** → Earn SPARK
3. **Celebrate** with particle animation + sound
4. **Share** badge to WhatsApp/clipboard
5. **View progress** on dashboard
6. **Complete more sessions** → Earn WORD_WIZARD (80%+ accuracy)
7. **Download certificate** → Verify QR code
8. **Check leaderboards** → See ranking
9. **View timeline** → See all badges
10. **Check email** → Verify email queued (not sent locally)

---

## Critical Issues to Watch For

### 🔴 Blocker Issues
- [ ] Badge not awarded when conditions met
- [ ] Celebration modal doesn't show
- [ ] Certificate fails to generate
- [ ] Leaderboard rankings incorrect
- [ ] Console errors/crashes

### 🟡 Warning Issues
- [ ] Animations not smooth (< 60fps)
- [ ] Page takes > 3 seconds to load
- [ ] Mobile layout broken
- [ ] Share button doesn't work
- [ ] Email doesn't queue

### 🟢 Minor Issues
- [ ] Typos in messages
- [ ] Colors slightly off
- [ ] Animations feel slow (but work)
- [ ] Mobile responsiveness could be better

---

## Testing Notes

**Device/Browser:** [Fill in]
**Date:** [Fill in]
**Tester:** [Fill in]

### Passed Tests: ___/22

### Failed Tests: [List any]

### Issues Found: [Describe]

### Recommendations: [Any improvements]

---

## Next Steps

If all tests pass:
1. ✅ Run full test suite: `npm test`
2. ✅ Check test coverage: `npm run test:coverage`
3. ✅ Build production: `npm run build`
4. ✅ Deploy to staging (if available)
5. ✅ Deploy to production: `git push`

If issues found:
1. ❌ Document in Issues
2. ❌ Fix in code
3. ❌ Re-test locally
4. ❌ Commit fixes
5. ❌ Re-run this checklist

---

## Test Environment Setup

### Pre-Test:
```bash
# Clear browser cache
# Open DevTools → Network tab
# Monitor Console for errors
# Have student test account ready
```

### During Test:
```bash
# Watch server logs: tail -f /tmp/dev-server.log
# Watch database: npx prisma studio
# Monitor performance: DevTools → Performance tab
```

### Post-Test:
```bash
# Document any issues
# Screenshot failed tests
# Note browser/OS version
# Summarize findings
```

---

**Ready to test? Start with Test 1: Student Login & Dashboard**

Good luck! 🚀
