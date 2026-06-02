# Integration Checklist for Email Notifications

## Phase 2 Task 1: Email System Integration

This document provides step-by-step instructions to integrate the new email notification system into your existing badge and leaderboard system.

## Pre-Integration Checklist

- [ ] All Task 1 files created (see TASK_1_COMPLETE.md)
- [ ] Database migration ready
- [ ] Environment variables planned
- [ ] Parent email field ready to be populated

## Step 1: Database Migration

### Run Migration
```bash
npm run db:migrate
# or
npx prisma migrate deploy
```

### Verify Migration
```bash
npx prisma studio
# Check that NotificationPreference and SentEmail tables exist
```

**Files involved:**
- `prisma/schema.prisma` - Schema updated ✅
- `prisma/migrations/20260602_add_email_notifications/migration.sql` - Migration SQL ✅

## Step 2: Configure Email Provider

### Option A: SendGrid (Recommended)

1. Install package:
```bash
npm install @sendgrid/mail
```

2. Get API key from https://sendgrid.com

3. Add to environment:
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
```

4. Update `lib/email-service.ts` - Replace `sendEmailActual()` function:
```typescript
import sgMail from '@sendgrid/mail';

async function sendEmailActual(email: EmailData) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  
  try {
    await sgMail.send({
      to: email.to,
      from: process.env.FROM_EMAIL!,
      subject: email.subject,
      html: email.html,
    });
    
    // Log to database
    await prisma.sentEmail.create({
      data: {
        studentId: email.studentId,
        type: email.type,
        recipientEmail: email.to,
        subject: email.subject,
        body: email.html,
        status: "sent",
      },
    });
  } catch (error) {
    // Handle error...
  }
}
```

### Option B: AWS SES

1. Install package:
```bash
npm install aws-sdk
```

2. Configure AWS credentials (via environment or credentials file)

3. Update `lib/email-service.ts` - Replace `sendEmailActual()` function:
```typescript
import AWS from 'aws-sdk';

const ses = new AWS.SES({ region: 'us-east-1' });

async function sendEmailActual(email: EmailData) {
  const params = {
    Source: process.env.FROM_EMAIL!,
    Destination: { ToAddresses: [email.to] },
    Message: {
      Subject: { Data: email.subject },
      Body: { Html: { Data: email.html } },
    },
  };
  
  try {
    await ses.sendEmail(params).promise();
    
    // Log to database
    await prisma.sentEmail.create({
      data: {
        studentId: email.studentId,
        type: email.type,
        recipientEmail: email.to,
        subject: email.subject,
        body: email.html,
        status: "sent",
      },
    });
  } catch (error) {
    // Handle error...
  }
}
```

### Environment Variables

Add to `.env` and `.env.local`:
```env
# Email Configuration
EMAIL_PROVIDER=sendgrid
FROM_EMAIL=noreply@wizlingo.com
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx

# App URLs (for email links)
NEXT_PUBLIC_APP_URL=https://wizlingo.com
```

## Step 3: Integration Points

### 3A: When Badge is Earned

Find where badges are currently awarded in your code and add email notification:

```typescript
// After creating badge in your badge system
import { notifyBadgeEarned } from "@/lib/badge-notification-helper";

// Example: In your badge earning logic
const badge = await prisma.badge.create({
  data: {
    studentId,
    type: badgeType,
  },
});

// ADD THIS LINE:
await notifyBadgeEarned(studentId, badgeType, {
  accuracy: sessionStats.accuracy,
  wpm: sessionStats.wpm,
  duration: Math.round(sessionStats.durationSec / 60),
});
```

**Locations to check:**
- Badge system award logic
- Reading session completion handlers
- Speaking session completion handlers
- Any place where badges are created

### 3B: Student Signup/Creation

When new student is created, initialize notification preferences:

```typescript
import { initializeNotificationPreferences } from "@/lib/email-service";

// After creating student
const student = await prisma.student.create({
  data: {
    name,
    admissionNumber,
    pin,
    classId,
  },
});

// ADD THIS LINE:
await initializeNotificationPreferences(student.id);
```

**Locations to check:**
- Admin dashboard student creation
- Batch import/upload
- Student self-signup

### 3C: Parent Email Collection

When parent email is provided, store it:

```typescript
// When parent sets up account or updates profile
await prisma.student.update({
  where: { id: studentId },
  data: {
    parentEmail: parentEmailInput,
  },
});
```

**Locations to check:**
- Parent dashboard
- Student profile settings
- Admin student management

## Step 4: Setup Weekly Email Cron Job

Create a scheduled task for weekly summaries:

### Option A: Using Next.js API Routes + External Scheduler

1. Create endpoint: `app/api/cron/send-weekly-summaries/route.ts`

```typescript
import { prisma } from "@/lib/prisma";
import { sendWeeklySummaryEmail } from "@/lib/email-service";
import { calculateWeeklyStats } from "@/lib/badge-notification-helper";

export async function GET(request: Request) {
  // Verify this is a cron request
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all students with parent emails
    const students = await prisma.student.findMany({
      where: { parentEmail: { not: null } },
    });

    let sent = 0;
    let failed = 0;

    for (const student of students) {
      try {
        const stats = await calculateWeeklyStats(student.id);
        await sendWeeklySummaryEmail(student.id, stats);
        sent++;
      } catch (error) {
        console.error(`Failed to send weekly summary to ${student.id}:`, error);
        failed++;
      }
    }

    return Response.json({
      message: "Weekly summaries sent",
      sent,
      failed,
      total: students.length,
    });
  } catch (error) {
    console.error("Error in weekly summary cron:", error);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
```

2. Set up cron scheduler:
   - **Vercel Cron** (if using Vercel): Configure in `vercel.json`
   - **External service** (AWS Lambda, Render, etc.): Call endpoint weekly
   - **Local cron** (development): Use node-cron package

### Option B: Using node-cron

1. Install:
```bash
npm install node-cron
```

2. Create `scripts/start-scheduler.ts`:
```typescript
import cron from "node-cron";
import { prisma } from "@/lib/prisma";
import { calculateWeeklyStats, sendWeeklySummaryEmail } from "@/lib/badge-notification-helper";

// Run every Monday at 9 AM
cron.schedule("0 9 * * 1", async () => {
  console.log("Running weekly email summary job...");
  
  const students = await prisma.student.findMany({
    where: { parentEmail: { not: null } },
  });

  for (const student of students) {
    try {
      const stats = await calculateWeeklyStats(student.id);
      await sendWeeklySummaryEmail(student.id, stats);
      console.log(`Weekly summary sent to ${student.id}`);
    } catch (error) {
      console.error(`Failed to send to ${student.id}:`, error);
    }
  }
  
  console.log("Weekly email job complete!");
});

console.log("Scheduler started");
```

3. Start scheduler in your app initialization

## Step 5: Populate Parent Emails

### For Existing Students

If you have existing students without parent emails:

1. Admin interface to add parent emails
2. Bulk import from spreadsheet
3. Parent self-service registration

Example update script:
```typescript
// scripts/add-parent-emails.ts
import { prisma } from "@/lib/prisma";

const parentEmails = {
  "admission_number_1": "parent1@email.com",
  "admission_number_2": "parent2@email.com",
  // ... etc
};

async function updateParentEmails() {
  for (const [admissionNumber, email] of Object.entries(parentEmails)) {
    await prisma.student.updateMany({
      where: { admissionNumber },
      data: { parentEmail: email },
    });
    console.log(`Updated ${admissionNumber} with email ${email}`);
  }
}

updateParentEmails();
```

Run with:
```bash
npx tsx scripts/add-parent-emails.ts
```

## Step 6: Dashboard Integration

### Add Parent Email Management

Create admin page: `app/admin/parent-emails/page.tsx`

```typescript
// Allow admins to:
// - View student's parent email
// - Add/edit parent email
// - Test send email
// - View sent email history
```

### Add Student Journey Page

Already created! Located at: `app/student/journey/page.tsx`

Features:
- Stats cards (badges, days, streak)
- Timeline view
- Gallery view
- Detailed stats view

## Step 7: Testing

### Test Email Sending

```bash
# Test via API
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "type": "badge_earned",
    "studentId": "demo123",
    "badgeType": "SPARK",
    "stats": { "accuracy": 78, "wpm": 65, "duration": 12 }
  }'
```

### Test Preferences API

```bash
# Get preferences
curl http://localhost:3000/api/notifications/preferences/demo123

# Update preferences
curl -X PUT http://localhost:3000/api/notifications/preferences/demo123 \
  -H "Content-Type: application/json" \
  -d '{
    "badgeEarnedParent": false,
    "emailFrequency": "DAILY"
  }'
```

### Test Queue Status

```typescript
import { getEmailQueueStats } from "@/lib/email-queue";

console.log(getEmailQueueStats());
// { total: 5, pending: 2, sent: 3, failed: 0 }
```

### View Sent Emails in Database

```bash
npx prisma studio

# Navigate to SentEmail table and view records
```

## Step 8: Monitoring & Logging

### View Email Queue
```typescript
import { getAllEmailJobs } from "@/lib/email-queue";

const jobs = await getAllEmailJobs();
console.log(jobs);
```

### Monitor Failed Emails
```typescript
import { prisma } from "@/lib/prisma";

// Get failed emails
const failed = await prisma.sentEmail.findMany({
  where: { status: "failed" },
  orderBy: { sentAt: "desc" },
});

console.log(failed);
```

### Email Statistics
```typescript
import { prisma } from "@/lib/prisma";

const stats = await prisma.sentEmail.groupBy({
  by: ["type", "status"],
  _count: true,
});

console.log(stats);
// [
//   { type: "badge_earned", status: "sent", _count: 145 },
//   { type: "milestone", status: "sent", _count: 12 },
//   ...
// ]
```

## Step 9: Production Deployment

### Pre-Deployment Checklist
- [ ] Database migration ran successfully
- [ ] Email provider configured and tested
- [ ] Environment variables set
- [ ] Parent emails populated
- [ ] Weekly email cron job scheduled
- [ ] Email queue implementation chosen (in-memory for small scale, Redis/Bull for large)
- [ ] Error monitoring setup (Sentry, etc.)
- [ ] Email deliverability tested with real parent email

### Deployment Steps

1. **Staging Environment:**
   - Run migration on staging database
   - Deploy code to staging
   - Test email sending with staging parent emails
   - Monitor email queue

2. **Production Deployment:**
   - Backup production database
   - Run migration on production
   - Deploy code to production
   - Test with select parent email addresses
   - Monitor for errors and queue health

3. **Monitoring:**
   - Set up alerts for email failures
   - Track email queue depth
   - Monitor email delivery rates
   - Review email bounces

## Troubleshooting

### Emails not sending?
1. Check EMAIL_PROVIDER environment variable
2. Verify email provider API key/credentials
3. Check email queue: `getEmailQueueStats()`
4. View sent emails in database for errors
5. Check logs for error messages

### Queue building up?
1. Check `getEmailQueueStats()` for queue depth
2. Verify email provider is not rate-limited
3. Check for network/connectivity issues
4. Review error messages in SentEmail table

### Parent not receiving emails?
1. Verify parentEmail field is populated
2. Check notification preferences are enabled
3. Check email landed in spam folder
4. View SentEmail record to confirm send attempt

## Files Modified/Created

### Created Files
- `lib/email-templates.ts` ✅
- `lib/email-service.ts` ✅
- `lib/email-queue.ts` ✅
- `lib/badge-notification-helper.ts` ✅
- `lib/export-journey.ts` ✅
- `hooks/useAchievementStats.ts` ✅
- `components/AchievementTimeline.tsx` ✅
- `components/BadgeCollection.tsx` ✅
- `app/api/notifications/send/route.ts` ✅
- `app/api/notifications/preferences/[studentId]/route.ts` ✅
- `app/api/achievement-stats/[studentId]/route.ts` ✅
- `app/student/journey/page.tsx` ✅
- `prisma/migrations/20260602_add_email_notifications/migration.sql` ✅

### Modified Files
- `prisma/schema.prisma` ✅

## Support Resources

- **Email Templates Guide:** `lib/TASK_1_EMAIL_SERVICE_GUIDE.md`
- **Task 1 Complete Summary:** `TASK_1_COMPLETE.md`
- **API Documentation:** See individual route.ts files
- **Database Schema:** `prisma/schema.prisma`

---

**Ready to integrate?** Start with Step 1 and follow sequentially!

**Questions?** Review the specific implementation files and comments for guidance.
