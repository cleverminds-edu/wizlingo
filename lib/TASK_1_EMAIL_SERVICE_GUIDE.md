# Task 1: Email Service - Implementation Guide

## Overview
Complete email notification system for WizLingo with templates, queue management, and API endpoints.

## Files Created

### Core Email Infrastructure

#### 1. `lib/email-templates.ts`
Beautiful HTML email templates for:
- **Badge Earned (Student)** - Congratulations + stats + next challenge
- **Badge Earned (Parent)** - Achievement + how to celebrate + progress link
- **Milestone Email** - 5/10/15/20 badge celebrations
- **Weekly Summary** - Sessions + badges + progress trends
- **Leaderboard Update** - Student rank + top performers

Features:
- Responsive mobile-friendly HTML
- Gradient backgrounds and colors matched to badge themes
- Inline CSS for email client compatibility
- Clear call-to-action buttons

#### 2. `lib/email-service.ts`
Main email service with functions:
- `sendBadgeEarnedEmail()` - Send to student + parent
- `sendMilestoneEmail()` - Send milestone celebrations
- `sendWeeklySummaryEmail()` - Send weekly progress report
- `sendLeaderboardEmail()` - Send leaderboard updates
- `initializeNotificationPreferences()` - Set up defaults
- `updateNotificationPreferences()` - Allow parents to change preferences
- `getNotificationPreferences()` - Retrieve settings

Features:
- Async queue system (non-blocking)
- Respects notification preferences
- Integrates with Prisma database
- Ready for SendGrid/AWS SES integration

#### 3. `lib/email-queue.ts`
Advanced email queue management:
- In-memory queue for development
- Job tracking and status management
- Automatic retry (max 3 attempts)
- Queue statistics and monitoring
- Can be replaced with Redis/Bull for production

#### 4. `lib/badge-notification-helper.ts`
Integration helpers:
- `notifyBadgeEarned()` - Unified badge notification
- `getStudentBadgeCount()` - Get badge count
- `calculateWeeklyStats()` - Prepare weekly summary data
- `sendWeeklySummary()` - Trigger weekly email

### API Endpoints

#### 5. `app/api/notifications/send/route.ts`
POST endpoint to send emails:
```json
{
  "type": "badge_earned|milestone|weekly_summary|leaderboard",
  "studentId": "...",
  "badgeType": "SPARK|WORD_WIZARD|...",
  "stats": { "accuracy": 78, "wpm": 65, "duration": 12 },
  "milestoneCount": 5,
  "summaryData": {...},
  "leaderboardData": {...}
}
```

Response: `{ "sent": true, "messageId": "...", "type": "..." }`

#### 6. `app/api/notifications/preferences/[studentId]/route.ts`
GET/PUT endpoint for notification preferences:
- GET: Retrieve student's email preferences
- PUT: Update preferences (enable/disable email types)

### Database Changes

#### 7. `prisma/schema.prisma`
New models and fields:
- Added `parentEmail` to Student model
- New `NotificationPreference` model (one per student)
- New `SentEmail` model (audit log)
- New `EmailFrequency` enum (IMMEDIATE, DAILY, WEEKLY, NEVER)

#### 8. `prisma/migrations/20260602_add_email_notifications/migration.sql`
SQL migration that:
- Adds `parentEmail` column to Student
- Creates EmailFrequency enum
- Creates NotificationPreference table with indexes
- Creates SentEmail table with indexes

## Integration Points

### When a Badge is Earned

1. After badge is awarded in your badge system:
```typescript
import { notifyBadgeEarned } from "@/lib/badge-notification-helper";

await notifyBadgeEarned(studentId, badgeType, {
  accuracy: 78,
  wpm: 65,
  duration: 12
});
```

2. This automatically:
   - Sends badge earned email to student
   - Sends badge earned email to parent (if parent email exists)
   - Checks for milestone (5, 10, 15, 20) and sends milestone email

### Weekly Email Trigger

For cron job or background task:
```typescript
import { sendWeeklySummary } from "@/lib/badge-notification-helper";

// Send to specific student
await sendWeeklySummary(studentId);

// Or trigger from admin dashboard
```

### Email Provider Setup

Currently using console logging. To enable real emails:

1. **SendGrid** (Recommended):
```bash
npm install @sendgrid/mail
```

Then update `lib/email-service.ts`:
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmailActual(email: EmailData) {
  await sgMail.send({
    to: email.to,
    from: FROM_EMAIL,
    subject: email.subject,
    html: email.html,
  });
}
```

2. **AWS SES**:
```bash
npm install aws-sdk
```

3. **Other providers**: Follow similar pattern

## Environment Variables Needed

```env
# Email provider
EMAIL_PROVIDER=sendgrid  # or: console (default), aws-ses
FROM_EMAIL=noreply@wizlingo.com
SENDGRID_API_KEY=...  # if using SendGrid

# App URLs (for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Testing

### Test Badge Earned Email
```bash
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "type": "badge_earned",
    "studentId": "student123",
    "badgeType": "SPARK",
    "stats": { "accuracy": 78, "wpm": 65, "duration": 12 }
  }'
```

### Check Email Queue
```typescript
import { getEmailQueueStats } from "@/lib/email-queue";

const stats = getEmailQueueStats();
console.log(stats);
// { total: 5, pending: 2, sent: 3, failed: 0 }
```

### View Sent Emails in Database
```typescript
import { prisma } from "@/lib/prisma";

const emails = await prisma.sentEmail.findMany({
  where: { studentId: "..." },
  orderBy: { sentAt: "desc" },
});
```

## Database Migration

Before using the system:

```bash
# Apply migrations to database
npx prisma migrate deploy

# Or for development
npm run db:migrate
```

## Features & Benefits

✅ **Non-blocking** - Emails queued asynchronously
✅ **Respects Preferences** - Parents can opt-out
✅ **Audit Trail** - All emails logged to database
✅ **Beautiful Design** - Mobile-responsive HTML templates
✅ **Easy Integration** - Simple helper functions
✅ **Retry Logic** - Automatic retries on failure
✅ **Stats Tracking** - Get email queue statistics
✅ **Flexible** - Works with any email provider

## Next Steps

1. Configure email provider (SendGrid recommended)
2. Set environment variables
3. Run database migration: `npm run db:migrate`
4. Integrate `notifyBadgeEarned()` into badge earning logic
5. Test with sample emails
6. Set up cron job for weekly summaries
7. Update parent dashboard to manage preferences

## Success Criteria ✅

- [x] Email templates created (all 5 types)
- [x] Email service with send functions
- [x] Email queue system
- [x] API endpoints for sending
- [x] API endpoints for preferences
- [x] Database models and migration
- [x] Integration helper functions
- [x] Ready for email provider setup
- [x] Non-blocking async queue
- [x] Error handling and logging
