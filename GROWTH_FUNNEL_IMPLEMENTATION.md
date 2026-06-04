# Growth Funnel & Referral System Implementation Guide

## Overview
This document summarizes the complete implementation of the conversion funnel and referral system for WizLingo, enabling students to share badges → parents view landing pages → school enrollment.

## Files Created

### Core Libraries
1. **`lib/referral-service.ts`** - Referral code generation and management
   - `generateReferralCode()` - Create unique referral codes
   - `getReferralCode()` - Get or create existing code
   - `getReferralLink()` - Get shareable referral URL
   - `trackReferralClick()` - Validate referral code
   - `completeReferral()` - Mark referral as completed
   - `getReferralStats()` - Get student's referral metrics
   - `awardReferralReward()` - Award badges/variants for referrals

2. **`lib/conversion-funnel.ts`** - Conversion funnel analytics
   - `trackFunnelStep()` - Track user journey through funnel
   - `getFunnelStats()` - Overall funnel metrics
   - `getFunnelStatsByBadge()` - Conversion by badge type
   - `getFunnelStatsBySchool()` - Conversion by school
   - `getReferralSuccessStats()` - Referral completion rates
   - `getDropOffAnalysis()` - Identify funnel drop-off points

3. **`lib/badge-config.ts`** (UPDATED)
   - `formatShareText()` - New helper to include referral codes in share messages

### Database Models (schema.prisma)
- **Referral** - Tracks individual referral relationships
- **ReferralReward** - Tracks rewards earned by referrer
- **ConversionFunnel** - Logs every step in the conversion journey

### API Routes

#### Referral Management
- **`app/api/referrals/route.ts`**
  - POST: Generate referral code for student
  - GET: Validate referral code and return school info

- **`app/api/referrals/complete/route.ts`**
  - POST: Mark referral as completed when new student signs up

- **`app/api/referrals/stats/route.ts`**
  - GET: Retrieve referral stats for a student

#### Analytics
- **`app/api/analytics/funnel/route.ts`**
  - GET: Comprehensive funnel analytics with date range filtering
  - Supports grouping by badge type or school

#### Landing Pages
- **`app/api/landing/school/route.ts`**
  - GET: School data (badge counts, top students, leaderboard)

### Pages & Components

#### Landing Pages
- **`app/landing/[schoolId]/page.tsx`** - School-specific landing page
  - Shows school name, badge counts, student achievements
  - Displays leaderboard with top students
  - Multiple CTA buttons

- **`app/landing/badge/[badgeType]/page.tsx`** - Badge-specific landing page
  - Explains badge requirements and benefits
  - Shows how to earn the badge
  - Includes student success stories

- **`app/r/[code]/page.tsx`** - Referral link shortener
  - Redirects from short URL to school landing page
  - Tracks landing clicks
  - Validates referral code

#### Landing Components
- **`components/landing/SchoolHeroSection.tsx`** - Hero section with badge/student stats
- **`components/landing/BadgeSocialProof.tsx`** - Display all 5 badges with earning counts
- **`components/landing/SchoolLeaderboard.tsx`** - Top achievers from school
- **`components/landing/BadgeExplainer.tsx`** - Badge details and requirements
- **`components/landing/ReferralRewardPrompt.tsx`** - Share incentives and referral link

#### Admin Dashboard
- **`app/admin/funnel-analytics/page.tsx`** - Conversion funnel analytics dashboard
  - Real-time funnel metrics
  - Conversion rates by stage
  - Referral success tracking
  - Drop-off analysis

## Database Migration

Created: `prisma/migrations/20260604_add_referral_system/migration.sql`

This migration creates three new tables:
- Referral (tracks referral relationships)
- ReferralReward (tracks rewards earned)
- ConversionFunnel (analytics logs)

## Implementation Steps

### 1. Apply Database Migration
```bash
npm run db:migrate
# Or manually:
prisma migrate deploy
```

### 2. Update Badge Share Logic
In your badge celebration component or share modal:

```typescript
import { getReferralCode } from '@/lib/referral-service';
import { formatShareText } from '@/lib/badge-config';

// Get referral code
const referralCode = await getReferralCode(studentId);

// Format share text with referral context
const shareText = formatShareText(badgeConfig.shareText, {
  studentName: student.name,
  schoolName: school.name,
  grade: student.class.grade,
  section: student.class.section,
  stat: '85', // e.g., accuracy percentage
  referralCode,
  schoolId: school.id,
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
});
```

### 3. Track Funnel Steps
When students share badges or parents click landing links:

```typescript
import { trackFunnelStep } from '@/lib/conversion-funnel';

// When badge is shared
await trackFunnelStep('share', {
  studentId,
  source: 'referral',
  badgeType,
  schoolId,
  referralCode,
});

// When parent clicks landing page
await trackFunnelStep('landing_view', {
  studentId: referrerId,
  source: 'referral',
  referralCode,
  schoolId,
});

// When new student starts signup
await trackFunnelStep('signup_start', {
  newStudentEmail: email,
  referralCode,
  source: 'referral',
});
```

### 4. Complete Referral on Signup
When a new student completes signup:

```typescript
import { completeReferral } from '@/lib/referral-service';

// After student account created
if (referralCode) {
  await completeReferral(referralCode, newStudentId);
}
```

### 5. Integrate Landing Pages with Badge Share
Update BadgeShareModal to generate referral links:

```typescript
// In BadgeShareModal or wherever share happens
const referralCode = await getReferralCode(studentId);
const schoolId = student.class.schoolId;
const landingUrl = `${appUrl}/landing/${schoolId}?ref=${referralCode}`;
```

### 6. Add Referral Reward Prompts to Celebration
In BadgeCelebration component:

```tsx
<ReferralRewardPrompt
  studentName={studentName}
  referralLink={`https://wizlingo.app/r/${referralCode}`}
  onShare={handleShare}
/>
```

## Key Routes & URLs

### Public Landing Pages
- `https://wizlingo.app/landing/[schoolId]` - School landing page
- `https://wizlingo.app/landing/badge/[badgeType]` - Badge landing page
- `https://wizlingo.app/r/[code]` - Referral shortener

### API Endpoints
- `POST /api/referrals` - Generate referral code
- `GET /api/referrals?code=xxx` - Validate code
- `POST /api/referrals/complete` - Complete referral
- `GET /api/referrals/stats?studentId=xxx` - Get stats
- `GET /api/landing/school?schoolId=xxx` - Get school data
- `GET /api/analytics/funnel` - Get funnel analytics

### Admin Dashboard
- `https://wizlingo.app/admin/funnel-analytics` - Analytics dashboard

## Funnel Steps Tracked

1. **share** - Student shares badge
2. **landing_click** - Parent clicks share link
3. **landing_view** - Parent views landing page
4. **signup_start** - Parent starts signup process
5. **signup_complete** - New student account created

## Reward Milestones

Students can unlock badge color variants by referring friends:
- 1 friend → Gold variant
- 2 friends → Silver variant
- 3 friends → Rainbow variant
- 5 friends → Glow effect
- 10 friends → Diamond variant

## Environment Variables

No new environment variables required, but ensure these exist:
- `NEXT_PUBLIC_APP_URL` - App base URL (for referral links)
- Database connection string (already configured)

## Testing Checklist

- [ ] Run database migration
- [ ] Test referral code generation
- [ ] Test referral link redirect
- [ ] Test landing page loads with school data
- [ ] Test funnel tracking (check ConversionFunnel table)
- [ ] Test referral completion
- [ ] Test reward unlocking
- [ ] Test admin analytics dashboard
- [ ] Verify badge share includes referral code
- [ ] Test short URL redirect (r/[code])

## Success Metrics to Monitor

### Via `/admin/funnel-analytics`:
- Share to click rate (should be 30-50%+)
- Click to signup rate (should be 20-40%+)
- Overall conversion rate (share → signup)
- Referral completion rate
- Drop-off analysis by stage

### Via Database Queries:
```sql
-- See referral stats
SELECT 
  r.status,
  COUNT(*) as count,
  COUNT(DISTINCT r.referrerId) as unique_referrers
FROM "Referral" r
GROUP BY r.status;

-- See conversion flow
SELECT 
  step,
  COUNT(*) as count
FROM "ConversionFunnel"
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY step
ORDER BY step;
```

## Integration Points

### Must integrate with:
1. **BadgeShareModal** - Add referral code to share text
2. **BadgeCelebration** - Show ReferralRewardPrompt
3. **SignupFlow** - Call completeReferral() on account creation
4. **Login/SignupPage** - Parse ?ref= query param and store in session

### Optional integrations:
1. **StudentDashboard** - Show referral stats and reward progress
2. **Email notifications** - Notify when referral is completed
3. **Leaderboard** - Add referral count as metric
4. **Social sharing** - Deep link to badge+referral

## Notes

- Referral codes are 12-character hex strings for short URLs
- Referral status can be: pending, completed, or expired
- ConversionFunnel table stores all funnel events for analytics
- Each funnel step tracks source (referral/direct/organic)
- School-specific landing pages show real social proof (actual student counts)
- Badge landing pages are generic but show school-specific counts via API

## Future Enhancements

1. **Referral Expiry** - Auto-expire referrals after 90 days
2. **Tiered Rewards** - Different rewards based on referral counts
3. **School Bulk Signups** - Special handling when multiple students from same school
4. **Email Notifications** - Auto-email parents with landing page link
5. **SMS Sharing** - Support WhatsApp/SMS share with tracking
6. **Influencer Tracking** - Identify top referrers for partnerships
7. **A/B Testing** - Different landing page variants
8. **Attribution** - Track which badge type drives best conversions
