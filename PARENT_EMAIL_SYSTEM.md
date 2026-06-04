# Parent Email Distribution System

## Overview

The Parent Email System makes parents THE distribution channel for badge sharing on WizLingo. When parents receive emails about their child's achievements, they can 1-click share to WhatsApp, influencing other families to adopt the platform.

## Architecture

### Core Components

1. **Email Templates** (`/lib/parent-email-templates.ts`)
   - Badge Earned (Celebration)
   - Weekly Progress Report
   - Monthly Achievement Summary
   - Milestone Celebration (5 badges)
   - School Ranking Notification

2. **WhatsApp Integration** (`/lib/email-whatsapp-url.ts`)
   - Pre-filled WhatsApp messages with badge details
   - Unique referral codes for tracking viral sharing
   - Multiple message formats for different email types

3. **Email Timing** (`/lib/email-timing.ts`)
   - Optimal send time calculation (6-8 PM local time)
   - Timezone support (Asia/Kolkata default)
   - Email batching for efficient sending
   - Cron job integration for scheduled delivery

4. **Email Analytics** (`/lib/email-analytics.ts`)
   - Open tracking via pixel
   - Click tracking by link type
   - Parent engagement metrics
   - A/B test analysis
   - Conversion funnel tracking

5. **Database Models** (`/prisma/schema.prisma`)
   - `ParentEmailPreference` - Email subscription settings
   - `EmailLog` - Sent email tracking
   - `EmailClick` - Open/click event logging
   - `EmailSchedule` - Scheduled email queue
   - `EmailVariantTest` - A/B test results

### API Endpoints

#### Parent-Facing
- `GET /api/email/pixel/[emailId]` - Email open tracking (1x1 pixel)
- `GET /api/email/unsubscribe/[token]` - Safe unsubscribe link
- `GET /api/parent/email-preferences/[token]` - Load preferences
- `POST /api/parent/email-preferences/[token]` - Update preferences

#### Admin-Facing
- `POST /api/admin/email-analytics` - Generate analytics report
- `POST /api/cron/email-distribution` - Scheduled email sending

### UI Pages

- `/parent/email-preferences` - Parent preference management
- `/admin/email-analytics` - Analytics dashboard

## Database Schema

### ParentEmailPreference

```prisma
model ParentEmailPreference {
  id                String   @id @default(cuid())
  parentEmail       String   @unique
  frequency         String   @default("immediate")
  badgeEarned       Boolean  @default(true)
  weeklyProgress    Boolean  @default(true)
  monthlyMilestone  Boolean  @default(true)
  schoolRanking     Boolean  @default(true)
  sendTime          String?  // "6pm", "8pm", etc
  timezone          String   @default("Asia/Kolkata")
  unsubscribeToken  String   @unique
  unsubscribedAt    DateTime?
}
```

### EmailLog

```prisma
model EmailLog {
  id              String     @id @default(cuid())
  studentId       String
  parentEmail     String
  type            String     // badge_earned, weekly_summary, etc
  subject         String
  body            String
  referralCode    String?
  sentAt          DateTime
  status          String     // sent, failed, bounced, unsubscribed
  opens           Int        @default(0)
  clicks          Int        @default(0)
  lastOpenedAt    DateTime?
  lastClickedAt   DateTime?
  variant         String?    // A/B test variant
}
```

### EmailClick

```prisma
model EmailClick {
  id        String   @id @default(cuid())
  emailId   String
  eventType String   // open, click
  linkType  String?  // view_cert, share_whatsapp, view_dashboard, signup, pixel
  timestamp DateTime
  userAgent String?
  ipAddress String?
}
```

## Email Templates

### 1. Badge Earned Email

**Subject:** `🎉 {studentName} earned the {BADGE} badge on WizLingo!`

**Key Elements:**
- Hero section with badge emoji and achievement description
- Stats display (accuracy %, fluency %, sessions)
- School ranking (if applicable)
- CTA buttons:
  - View Certificate
  - View Dashboard
  - **Share on WhatsApp** (primary conversion driver)

**WhatsApp Message:**
```
🎉 {studentName} earned the {BADGE_EMOJI} {BADGE_NAME} badge on WizLingo!

{Achievement Description}

📊 Ranked #{rank} in {school}

🧙‍♂️ Join the Wizard's Academy:
{APP_URL}/join?ref={referralCode}

#WizLingo #{BADGE_NAME} #LanguageMastery
```

### 2. Weekly Progress Email

**Subject:** `📊 {studentName}'s learning progress this week`

**Key Elements:**
- Sessions completed count
- Badges earned this week
- Accuracy/fluency improvement (with % change)
- Next challenge/badge target
- CTA: View Full Dashboard

### 3. Monthly Achievement Email

**Subject:** `🌟 {studentName} is a Language Star! See their amazing progress`

**Key Elements:**
- Month overview with badge count
- Rank in school
- Growth % compared to last month
- Success stories
- Top achievements

### 4. Milestone Email (5 badges)

**Subject:** `🏆 {studentName} earned their 5th badge! Major milestone!`

**Key Elements:**
- Milestone announcement (5, 10, 15, etc.)
- All badges earned
- "Joining the Achievements Club" message
- Stories from similar students

### 5. School Ranking Email

**Subject:** `📚 {schoolName} is rising! {studentCount} students achieving`

**Key Elements:**
- School achievement count
- Rank among partner schools
- Success stories
- Call-to-action for teachers to promote

## Sending Flow

### 1. Badge Earned Trigger
```
Student earns badge
  ↓
Badge system triggers email
  ↓
Calculate optimal send time (6-8 PM in parent's timezone)
  ↓
Schedule email in EmailSchedule queue
  ↓
Generate unique referralCode
  ↓
Create WhatsApp share URL
```

### 2. Cron Job Processing
```
Cron runs at 6 PM UTC daily
  ↓
Query emails scheduled for next 60 minutes
  ↓
For each email:
  - Send via email provider (SendGrid/SES)
  - Log to EmailLog
  - Mark as sent in EmailSchedule
  ↓
Track metrics (sent, failed, bounced)
```

### 3. Parent Engagement
```
Parent receives email
  ↓
Opens email (tracked via pixel)
  ↓
Clicks WhatsApp CTA (tracked as link click)
  ↓
Pre-filled message opens in WhatsApp
  ↓
Parent shares with family/school group
  ↓
Referred person signs up
  ↓
Conversion tracked in ConversionFunnel table
```

## Configuration

### Environment Variables

```env
# Email sending
EMAIL_PROVIDER=sendgrid|ses|console
FROM_EMAIL=noreply@wizlingo.com
SENDGRID_API_KEY=sk_test_...
AWS_SES_REGION=ap-south-1

# Cron jobs (Vercel)
CRON_SECRET=your_cron_secret

# App URL
NEXT_PUBLIC_APP_URL=https://wizlingo.com
```

### Email Sending Intervals

- **Badge Earned**: Immediate (batched to 6-8 PM)
- **Weekly Summary**: Every Monday at 6 PM
- **Monthly Summary**: First of month at 6 PM
- **School Rankings**: First of month at 7 PM

### Optimal Send Times

- **Weekday**: 6:00 PM (18:00)
- **Weekend**: 7:00 PM (19:00)
- **Minutes**: Varied (15, 30, 45) to avoid same-second sends

## Metrics & KPIs

### Email Performance

```typescript
interface EmailMetrics {
  sent: number
  opened: number
  openRate: number           // Target: 30%+
  clicked: number
  clickRate: number          // Target: 10%+
  clicksByLink: Record<string, number>
  conversions: number        // Target: 5%+
  uniqueOpeners: number
  uniqueClickers: number
}
```

### Parent Engagement

```typescript
interface ParentEngagement {
  totalEmailsReceived: number
  totalOpens: number
  totalClicks: number
  engagementRate: number     // % of emails opened/clicked
  preferredEmailTypes: Array<{type: string, opens: number}>
  mostClickedLinks: Array<{linkType: string, clicks: number}>
  lastEngagedAt: Date | null
}
```

### Key Metrics to Track

1. **Email Open Rate** (target: 30%+)
   - Tracked via pixel
   - Varies by email type
   - Monitor for subject line effectiveness

2. **WhatsApp Share Click Rate** (target: 10%+)
   - Most important conversion metric
   - Shows parent willingness to advocate
   - Drive through compelling CTAs

3. **Parent Referral Conversion** (target: 5%+)
   - New students from parent shares
   - Tracked via referralCode in URL
   - Highest quality leads

4. **Email Unsubscribe Rate** (target: <2%)
   - Monitor frequency preferences
   - Respect parent preferences
   - Segment by email type effectiveness

5. **Optimal Send Time Insights**
   - When do parents most engage?
   - Varies by timezone and day of week
   - Personalize per parent

## A/B Testing

### Test Variables

1. **Subject Lines**
   - Emoji vs no emoji
   - Achievement language variations
   - Urgency signals

2. **CTA Button Text**
   - "Share Achievement" vs "Share to WhatsApp"
   - Button color and placement
   - Number of CTAs

3. **Email Layout**
   - Badge position/size
   - Stats prominence
   - CTA placement

4. **Send Times**
   - Early evening (6 PM) vs late evening (8 PM)
   - Weekday vs weekend
   - Day of week effects

### Testing Framework

```typescript
export async function sendEmailVariant(
  parentEmail: string,
  variant: 'A' | 'B',
  emailType: string,
  data: any
): Promise<{ emailId: string; variant: string }>
```

## Implementation Checklist

- [ ] Migrate to parent-focused email templates
- [ ] Set up WhatsApp share URLs in emails
- [ ] Implement email timing optimizer
- [ ] Add pixel tracking for opens
- [ ] Create parent preference UI
- [ ] Build analytics dashboard
- [ ] Set up cron job for scheduled sending
- [ ] Implement safe unsubscribe flow
- [ ] Create A/B testing infrastructure
- [ ] Set up email provider (SendGrid/SES)
- [ ] Monitor initial metrics
- [ ] Optimize based on engagement data

## Parent Email Lifecycle

### 1. Subscription
- Parent receives child's first email
- Includes unsubscribe token
- Creates ParentEmailPreference record

### 2. Customization
- Parent can access preferences via token link
- Choose email types and frequency
- Set preferred send time
- Update timezone

### 3. Engagement
- Email arrives at optimal time
- Parent opens (tracked via pixel)
- Clicks WhatsApp CTA (tracked as click)
- Shares to family WhatsApp group
- Referred person signs up

### 4. Optimization
- Analytics show which email types perform best
- Most clicked links (WhatsApp > certificate > dashboard)
- Parent engagement patterns
- Conversion rates by badge type

### 5. Unsubscribe (Optional)
- Safe unsubscribe via token link
- No email address exposed
- Can return to preferences instead of full unsub
- Track unsubscribe reasons

## Security & Privacy

### Data Protection

- **Parent Email Storage**: Minimal, only for delivery
- **Unsubscribe Token**: Unique, secure, one-time-use for links
- **Click Tracking**: Anonymous, no IP logging by default
- **Opt-in/Out**: Full control via preferences page

### Compliance

- **GDPR**: Right to be forgotten, data portability
- **CAN-SPAM**: Clear unsubscribe path on every email
- **Local Laws**: Comply with India email regulations

## Troubleshooting

### Email Not Sending

1. Check EmailSchedule table for errors
2. Verify email provider credentials
3. Check parent preference settings
4. Review cron job logs

### Open Rate Too Low

1. Test different subject lines
2. Optimize send time
3. Improve email preview text
4. Check spam folder delivery

### Low Click Rate

1. Emphasize WhatsApp CTA more
2. Test button placement/color
3. Simplify email content
4. A/B test CTA text

### High Unsubscribe Rate

1. Review email frequency
2. Check segmentation
3. Analyze sentiment of emails
4. Respect parent preferences

## Future Enhancements

1. **SMS Fallback**: Send critical achievements via SMS
2. **Push Notifications**: Real-time alerts for key milestones
3. **Telegram Integration**: Alternative to WhatsApp
4. **Email Personalization**: Dynamic content based on student data
5. **Predictive Optimal Time**: ML-based send time prediction
6. **Dynamic Content**: Student photo/achievement image
7. **Weekly Digest**: Aggregate multiple badges
8. **Referral Rewards**: Thank parents for shares
9. **Social Proof**: "X parents from your school love WizLingo"
10. **Gamification**: Parent engagement badges/streaks

## References

- Email Service: `/lib/email-service.ts`
- Email Templates: `/lib/email-templates.ts` (student)
- WhatsApp Integration: `/lib/email-whatsapp-url.ts`
- Timing Optimizer: `/lib/email-timing.ts`
- Analytics: `/lib/email-analytics.ts`
- Badge System: `/lib/badge-system.ts`
- Referral System: `/lib/referral-service.ts`
