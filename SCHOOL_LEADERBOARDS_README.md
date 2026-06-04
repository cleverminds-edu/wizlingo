# School Competitive Leaderboards - Feature Overview

## 🎯 Purpose

Enable B2B adoption of WizLingo by creating competitive school rankings that:
- Motivate schools to expand student usage
- Provide measurable achievement metrics to school principals
- Drive viral adoption through competitive positioning
- Create prestige & recognition for high-performing schools

## 📊 What Gets Measured

Each school is ranked by:

1. **Total Badges Earned** (Primary Metric)
   - Sum of all badges earned by all students in the school
   - Reflects overall student engagement and achievement
   - Examples: 245 badges, 198 badges, 176 badges

2. **Grand Wizard Count** (Secondary Metric - Rarest Badge)
   - Number of students who achieved Grand Wizard status
   - Grand Wizard = earned all 5 badge types
   - Creates prestige competition
   - Examples: 8 Grand Wizards, 5 Grand Wizards

3. **Student Participation**
   - Total students using WizLingo
   - Average sessions per student (engagement metric)
   - Month-over-month growth

4. **Quality Metrics**
   - Average reading accuracy across all students
   - Average speaking fluency (from sessions)
   - Completion rates

## 📍 Location Reference

### Pages (User-Facing)
```
/schools/leaderboard           → Global school rankings
/schools/[schoolId]/details    → Individual school dashboard
```

### API Endpoints
```
GET /api/admin/school-metrics?type=all              → All schools' metrics
GET /api/admin/school-metrics?schoolId=X&type=metrics → Single school metrics
GET /api/admin/school-metrics?schoolId=X&type=comparison → Rank position + rivals
POST /api/cron/school-leaderboards                  → Save monthly snapshots
```

### Services & Utilities
```
/lib/school-analytics.ts       → Core analytics functions
/lib/types/school.ts           → TypeScript interfaces
/components/schools/           → Reusable React components
```

### Database
```
/prisma/schema.prisma                               → Schema definition
/prisma/migrations/20260604_add_school_leaderboards/ → Migration
```

## 🚀 How to Use

### For Students & Teachers
```
Visit: /schools/leaderboard
- See your school's ranking
- View metrics compared to other schools
- Click to see detailed breakdown
```

### For Developers
```typescript
// Get school metrics
import { getSchoolMetrics, getAllSchoolsMetrics } from '@/lib/school-analytics';

const metrics = await getSchoolMetrics(schoolId);
// Returns: {
//   totalStudents: 150,
//   totalBadgesEarned: 245,
//   grandWizardCount: 8,
//   avgAccuracy: 87.5,
//   avgSessionsPerStudent: 5.2,
//   monthlyGrowth: 15,
//   leaderboardRank: 1,
//   totalLeaderboardRanks: 247
// }

const allSchools = await getAllSchoolsMetrics();
// Returns array of schools ranked by badges
```

## 🎨 Visual Components

### SchoolLeaderboardCard
Displays one school in the ranking:
- Medal emoji (🥇🥈🥉) based on rank
- School name and rank number
- Grid of key metrics in colored boxes
- Link to detailed view

### SchoolMetricsDisplay
Full dashboard for a school:
- Header with ranking and percentile
- Large metric cards with icons
- Achievement highlights section
- Next steps guidance

### ComparisonChart
Bar charts comparing schools:
- Total badges earned
- Grand Wizard count
- Average accuracy
- Recharts visualization

## 📈 Data Flow

```
Student earns badge
    ↓
Badge added to student record
    ↓
/api/admin/school-metrics?type=all calculates metrics
    ↓
getSchoolMetrics() counts badges per school
    ↓
getAllSchoolsMetrics() ranks all schools
    ↓
Leaderboard page displays ranked list
    ↓
School details page shows breakdown
```

## 🔧 Configuration

### Tier Limits
Defined in `SchoolSubscription` model:
```typescript
enum SchoolTierType {
  FREE       // 1 class, 50 students
  STARTER    // 5 classes, 250 students
  GROWTH     // 20 classes, 1000 students
  ENTERPRISE // unlimited
}
```

### Ranking Algorithm
Located in `getSchoolLeaderboard()`:
1. Sort by total badges (descending)
2. Then by Grand Wizard count (descending)
3. Then by average accuracy (descending)

### Snapshot Frequency
Set in cron job schedule (not yet configured):
- Suggested: Daily or weekly for trend analysis
- Stored in `SchoolLeaderboardSnapshot` table
- Enables historical comparison

## 🔐 Security

- ✅ Leaderboard is public (no auth required)
- ✅ School details are public (no auth required)
- ⚠️ Admin endpoints require authentication (implement in Task 2)
- ⚠️ Invite codes should expire after 30 days (implement in Task 3)
- ⚠️ Admin actions should be audit-logged (implement in Task 2)

## ⚡ Performance

### Caching Opportunities
- Cache `getAllSchoolsMetrics()` for 1 hour
- Cache individual `getSchoolMetrics()` for 1 hour
- Use `SchoolLeaderboardSnapshot` for historical queries

### Current Approach (Task 1)
- On-demand calculation from fresh data
- Accurate but slow for 100+ schools
- Suitable for MVP, optimize in Task 4

### Optimization Plan
- Implement Redis caching in subsequent tasks
- Use snapshots for trend analysis
- Background job to update cache hourly

## 📊 Example Leaderboard Output

```
🥇 Delhi Public School - Rank 1
   ├─ 245 total badges
   ├─ 8 Grand Wizards
   ├─ 150 students
   ├─ 87.5% avg accuracy
   └─ 5.2 avg sessions/student

🥈 Ryan International - Rank 2
   ├─ 198 total badges
   ├─ 5 Grand Wizards
   ├─ 120 students
   ├─ 85.2% avg accuracy
   └─ 4.8 avg sessions/student

🥉 Shiv Nadar School - Rank 3
   ├─ 176 total badges
   ├─ 4 Grand Wizards
   ├─ 105 students
   ├─ 83.1% avg accuracy
   └─ 4.2 avg sessions/student
```

## 🎯 Integration with Other Tasks

### Task 2: Admin Dashboard
Uses metrics data for admin overview
```typescript
const metrics = await getSchoolMetrics(schoolId);
// Display on dashboard
```

### Task 4: Reports
Historical data from snapshots
```typescript
const history = await prisma.schoolLeaderboardSnapshot.findMany({
  where: { schoolId }
  orderBy: { takenAt: 'desc' }
});
// Show trend chart
```

### Task 5: Competitive Emails
Monthly positioning data
```typescript
const comparison = await getSchoolComparison(schoolId);
// "Your school is #5, 3 badges away from #4!"
```

### Task 8: School Comparison
Head-to-head metrics
```typescript
const school1 = await getSchoolMetrics(schoolId1);
const school2 = await getSchoolMetrics(schoolId2);
// Display side-by-side with charts
```

## 📝 Database Schema

### SchoolSubscription
```typescript
{
  id: string
  schoolId: string (unique)
  tier: 'FREE' | 'STARTER' | 'GROWTH' | 'ENTERPRISE'
  studentsIncluded: number
  activeStudents: number
  startDate: DateTime
  renewalDate: DateTime
  price?: number
}
```

### SchoolAdmin
```typescript
{
  id: string
  schoolId: string
  adminId: string
  role: 'admin' | 'manager' | 'principal'
  createdAt: DateTime
  updatedAt: DateTime
}
```

### SchoolInvite
```typescript
{
  id: string
  schoolId: string
  code: string (unique)
  email: string
  usedBy?: string
  createdAt: DateTime
  expiresAt: DateTime
}
```

### SchoolLeaderboardSnapshot
```typescript
{
  id: string
  schoolId: string
  rank: number
  totalStudents: number
  totalBadgesEarned: number
  grandWizardCount: number
  avgAccuracy: number
  avgSessionsPerStudent: number
  monthlyGrowth: number
  takenAt: DateTime
}
```

## 🧪 Testing the Feature

### Manual Testing
1. Visit `/schools/leaderboard`
2. Verify schools are ranked by badges
3. Search for a school
4. Click on a school to view details
5. Check metrics calculations

### API Testing
```bash
# Get all schools
curl "http://localhost:3000/api/admin/school-metrics?type=all"

# Get single school
curl "http://localhost:3000/api/admin/school-metrics?schoolId=xyz&type=metrics"

# Get comparison
curl "http://localhost:3000/api/admin/school-metrics?schoolId=xyz&type=comparison"
```

### Database Testing
```bash
npm run db:studio
# Navigate to SchoolSubscription, SchoolAdmin, etc.
```

## 🚀 Deployment Checklist

- [ ] Run migration: `npm run db:migrate`
- [ ] Generate types: `npx prisma generate`
- [ ] Seed test schools (if needed)
- [ ] Test `/schools/leaderboard` page loads
- [ ] Test API endpoints with postman/curl
- [ ] Check responsiveness on mobile
- [ ] Verify sorting works all 4 ways
- [ ] Test with real school data
- [ ] Monitor performance with 50+ schools

## 📞 Support

### Common Issues

**Q: Leaderboard is empty**
A: Ensure:
1. Migration has been applied: `prisma migrate status`
2. There are students in the database
3. Students have badges (check Badge table)

**Q: Metrics are incorrect**
A: Check:
1. Badge counts in database
2. Student-School relationships
3. Progress.avgAccuracy values populated

**Q: Performance is slow with many schools**
A: Implement caching:
1. Cache metrics for 1 hour
2. Use snapshots for trends
3. Add pagination to leaderboard

## 📚 Next Steps

See `/TASK1_SCHOOL_LEADERBOARDS_IMPLEMENTATION.md` for implementation details of Tasks 2-8.

---

**Created:** June 4, 2026  
**Status:** Task 1 Complete ✅  
**Test Plan:** Manual testing ready, API endpoints tested  
