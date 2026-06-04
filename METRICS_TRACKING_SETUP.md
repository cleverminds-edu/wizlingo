# 📊 METRICS TRACKING SETUP
## Daily Dashboard for B2C + B2B Launch Monitoring

**Purpose:** Track key metrics from June 5 onwards  
**Timeline:** 30 minutes to setup  
**Owner:** Analytics Lead  
**Update Frequency:** Daily (9am)  

---

## 🎯 KEY METRICS TO TRACK

### B2C Metrics (Daily)

| Metric | Formula | Target | How to Get |
|--------|---------|--------|-----------|
| **New Signups** | Students who signed up today | 50+ | Posthog event: form_submitted |
| **Cumulative Signups** | Total all-time signups | 300+ by Jun 11 | Posthog: students count |
| **DAU (Daily Active)** | Users who logged in today | 50%+ | Posthog: page_view events |
| **Email Opens** | Signups who opened verification email | 70%+ | Posthog: email_opened events |
| **Email Verified** | Completed verification | 50%+ of DAU | Database: emailVerified = true |
| **Session Starts** | Students who started first session | 30%+ of DAU | Posthog: session_started |
| **Badges Earned** | Students who earned SPARK badge | 10%+ of DAU | Database: StudentProgress |
| **Error Rate** | Failed requests % | <1% | Vercel logs |
| **Uptime** | Site availability | 99.5%+ | Vercel status |

### B2B Metrics (Weekly)

| Metric | Target | How to Get |
|--------|--------|-----------|
| **Schools Contacted** | 5-7 | Your call logs |
| **Schools Interested** | 2-3 | Your notes |
| **Schools Committed** | 1-2 by Jun 15 | Signed contracts |
| **Pilot Students Onboarded** | 1000+ by Jun 15 | Database count |
| **Teacher Activation** | >50% assigned passages | Database query |
| **Student DAU (B2B)** | >70% | Posthog |

---

## 📈 SETUP: GOOGLE SHEETS DASHBOARD

### Step 1: Create Google Sheet

```
1. Go to sheets.google.com
2. Create new spreadsheet: "WizLingo Daily Metrics"
3. Share with team: Editor access for Slack bot, Viewer for team
```

### Step 2: Create Sheets Tabs

Create these tabs in your spreadsheet:

1. **Daily** - Daily metrics snapshot
2. **Weekly** - Weekly summaries
3. **Formulas** - Queries to Posthog/Database
4. **Baseline** - Starting point (Jun 5)

### Step 3: Daily Sheet Template

```
DATE          | SIGNUPS | CUM_SIGNUPS | DAU | EMAIL_OPENS | VERIFIED | SESSIONS | BADGES | ERRORS | NOTES
──────────────────────────────────────────────────────────────────────────────────────────────────────────
Jun 5         | 50      | 50          | 30  | 35          | 25       | 15       | 2      | 0      | Launch day
Jun 6         | 40      | 90          | 55  | 65          | 40       | 30       | 8      | 0      | Strong organic growth
Jun 7         | 50      | 140         | 85  | 80          | 70       | 40       | 15     | 0      | Referrals working
...
```

---

## 🔗 DATA SOURCES

### Source 1: Posthog (Events)

**Best for:** Real-time events, user behavior

```
How to query Posthog:
1. Go to posthog.com → Insights
2. Click "+ New insight"
3. Select "Trend"
4. Event: "form_submitted"
5. Date range: Today
6. Result: Number of signups today
```

**Events to track:**
```
- page_view (landing page visits)
- form_submitted (signup attempts)
- form_error (validation errors)
- email_sent (verification emails)
- email_opened (opened email)
- verification_code_used (verified)
- session_started (started reading/speaking)
- badge_earned (earned any badge)
- button_click (CTA clicks)
```

### Source 2: Database (Students)

**Best for:** Accurate counts of created records

```
How to query database:
export DATABASE_URL="[your_connection]"
npx prisma db execute --stdin

// Count total students
SELECT COUNT(*) FROM "Student";

// Count verified emails
SELECT COUNT(*) FROM "Student" WHERE "emailVerified" = true;

// Count by grade
SELECT "grade", COUNT(*) FROM "Student" GROUP BY "grade";

// Count today's signups
SELECT COUNT(*) FROM "Student" WHERE DATE("createdAt") = TODAY();
```

### Source 3: Vercel Logs

**Best for:** Performance, errors, uptime

```
Go to vercel.com → Project → Logs
Filter by:
- Status: All, 200 OK, 4xx, 5xx
- Time: Last 24 hours
- Path: /api/auth/*, /api/metrics/*

Metrics:
- Total requests
- Failed requests (4xx/5xx)
- Response times
- Uptime %
```

### Source 4: Manual Notes

**Best for:** Qualitative feedback

```
Track in spreadsheet:
- Major bugs discovered
- Marketing wins
- User feedback
- Blockers
- Next actions
```

---

## 📱 AUTOMATED DAILY REPORT (Optional)

### Zapier Integration

```
Trigger: Every day at 9:00am
Action: Send to Slack
Message: 
"📊 Daily Metrics - June 5:
✅ New Signups: 50
✅ Cumulative: 50
✅ DAU: 50%
✅ Email Opens: 70%
✅ Verified: 50%
✅ Sessions: 30%
✅ Badges: 5%
⚠️ Errors: 0
➡️ View full: [Google Sheets link]"
```

**Setup:**
1. Go to zapier.com
2. Create "Zap"
3. Trigger: Schedule (daily 9am)
4. Action: Send Slack message
5. Format message with Google Sheets data

---

## 📊 DAILY REVIEW CHECKLIST (9:00am)

Every morning, update your dashboard:

```
[ ] Count Posthog events (last 24 hours)
[ ] Query database for student counts
[ ] Check Vercel logs for errors
[ ] Check uptime status
[ ] Note any blockers or issues
[ ] Post summary to Slack #metrics-daily
[ ] Flag anything below target
```

**Slack post template:**
```
📊 Daily Metrics - [DATE]

B2C Performance:
✅ New signups: [count]
✅ Cumulative: [count]
✅ DAU: [%]
✅ Email verified: [%]
✅ Badges earned: [count]

B2B Performance:
✅ Schools committed: [count]
✅ Students onboarded: [count]
✅ Teacher activation: [%]

System Health:
✅ Uptime: [%]
✅ Error rate: [%]
✅ Response time: [ms]

⚠️ Issues:
- [Any blockers]

Next actions:
- [What's next]
```

---

## 🎯 WEEKLY REVIEW (Every Sunday 6pm)

Consolidate week's data:

```
Date: June 5-11

Week Summary:
- Total new signups: 300+
- Total DAU: 50%+
- Email verification: 70%+
- Badge unlock rate: 10%+

Trends:
- Growth trend: ↑ [describe]
- Engagement trend: ↑ [describe]
- Error trend: → [describe]

Action Items for Next Week:
1. [Actionable insight]
2. [Actionable insight]
3. [Actionable insight]
```

---

## 🚨 ALERT THRESHOLDS

Set up alerts for when metrics fall below targets:

| Metric | Target | Alert Level |
|--------|--------|-------------|
| DAU % | >50% | Alert if <30% |
| Email opens | >70% | Alert if <50% |
| Signup rate | 50+/day | Alert if <20/day |
| Error rate | <1% | Alert if >5% |
| Uptime | 99.5% | Alert if <99% |

**How to respond to alerts:**
1. Check Vercel logs
2. Check Posthog for event errors
3. Check database for issues
4. Test landing page manually
5. Escalate to engineering if needed

---

## 📈 GOOGLE SHEETS FORMULA EXAMPLES

### Copy daily metrics from Posthog

```
In Google Sheets, you can create formulas to fetch data:

=IMPORTDATA("https://posthog.com/api/events?action=form_submitted&date=2026-06-05")

Note: Requires API key setup (more complex)

Simpler approach: 
- Export CSV from Posthog daily
- Import into Google Sheets
- Formula to sum/calculate
```

### Count verified students (from Database)

```
If you expose an API endpoint:

=IMPORTJSON("https://wizlingo.app/api/metrics/students/verified", "count")

Endpoint returns: { "count": 150 }
```

### Calculate percentages

```
In Google Sheets:
=B2/B1 (DAU % = Active Today / Total Signups)
=C2/B2*100 (Email Open Rate %)
=E2/B2*100 (Verification Rate %)
```

---

## 🔒 SECURITY & ACCESS

**Who has access:**
- ✅ Analytics Lead: Full access (read/write)
- ✅ Growth Lead: View only
- ✅ Engineering: View only
- ✅ CEO: View only
- ❌ Do NOT: Share link publicly
- ❌ Do NOT: Include sensitive data (emails, IPs)

**Share settings:**
```
1. Open Google Sheet
2. Click "Share" (top right)
3. Add emails
4. Set permission: Editor or Viewer
5. Disable "Notify people"
6. Copy shareable link
```

---

## 📋 METRICS CHECKLIST (First Week)

**By June 11, verify you're tracking:**

- [ ] Daily signups (source: Posthog)
- [ ] Cumulative signups (source: Database)
- [ ] DAU % (source: Posthog)
- [ ] Email open rate (source: Posthog)
- [ ] Verification rate (source: Database)
- [ ] Session completion (source: Posthog)
- [ ] Badge unlock rate (source: Database)
- [ ] Error rate (source: Vercel)
- [ ] Uptime (source: Vercel)
- [ ] School commitments (source: Slack notes)

**Update frequency:**
- Daily: 9am each morning
- Weekly: Sunday 6pm summary
- Monthly: End-of-month analysis

---

## 🚀 NEXT STEPS

1. **TODAY (June 4):** Create Google Sheet + share with team
2. **TOMORROW (9am):** First data entry (Day 1 launch metrics)
3. **DAILY:** Update at 9am (takes 10 min)
4. **WEEKLY:** Sunday summary (takes 30 min)

**Sample dashboard link:** [You'll create this]  
**Update frequency:** Daily at 9:00am  
**Slack channel:** #metrics-daily

---

**Questions?** Refer to: WIZLINGO_MASTER_PLAYBOOK.md (Section 8: Success Metrics Framework)
