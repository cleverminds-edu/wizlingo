# Age Band Leaderboards - Implementation Guide

## Overview

Age band leaderboards ensure **fair competition** by showing students only their peer group:

```
Traditional Leaderboard:        Age Band Leaderboard:
├─ 8-year-old: Rank 500         ├─ 6-8 Age Band
├─ 10-year-old: Rank 50         │  ├─ Aditya (10): Rank 3
├─ 12-year-old: Rank 2          │  ├─ Maya (8): Rank 8
├─ 14-year-old: Rank 1          │  └─ Priya (7): Rank 15
└─ 15-year-old: Rank 1          │
                                 ├─ 9-11 Age Band
   Problem:                      │  ├─ Raj (11): Rank 2
   ❌ 8-year-old feels          │  └─ Zara (9): Rank 4
      hopeless vs 14-year-old    │
                                 ├─ 12-14 Age Band
                                 │  ├─ Arjun (13): Rank 1
                                 │  └─ Neha (12): Rank 5
                                 │
                                 Benefit:
                                 ✅ Fair comparisons
                                 ✅ Age-appropriate competition
                                 ✅ Motivation remains high
```

---

## Leaderboard Types

### 1. **ACCURACY** - Reading Comprehension
```
Shows: Average reading accuracy %
Metric: Math average of all reading session accuracy scores
Top Performers: Students with 85%+ accuracy

Example:
┌─────────────────────────────────────┐
│ 9-11 Age Band - Accuracy Leaderboard│
├─────────────────────────────────────┤
│ Rank │ Name    │ Accuracy │ Level   │
├─────────────────────────────────────┤
│  1   │ Aditya  │  88.5%   │   3     │
│  2   │ Priya   │  85.2%   │   2     │
│  3   │ Rahul   │  82.1%   │   2     │
│  4   │ YOU     │  76.3%   │   2     │
│  5   │ Zara    │  71.8%   │   1     │
└─────────────────────────────────────┘
```

### 2. **CONSISTENCY** - Engagement & Persistence
```
Shows: Total reading + speaking sessions
Metric: Sum of all completed sessions
Top Performers: Most active students

Example:
┌──────────────────────────────────────┐
│ 12-14 Age Band - Consistency         │
├──────────────────────────────────────┤
│ Rank │ Name    │ Sessions │ Level   │
├──────────────────────────────────────┤
│  1   │ Arjun   │    47    │   3     │
│  2   │ Neha    │    42    │   2     │
│  3   │ Vikram  │    38    │   2     │
│  4   │ YOU     │    35    │   2     │
│  5   │ Sunita  │    31    │   1     │
└──────────────────────────────────────┘
```

### 3. **LEVEL** - Current Difficulty
```
Shows: Current performance level (1, 2, or 3)
Metric: Highest level achieved
Top Performers: Advanced learners

Example:
┌──────────────────────────────────────┐
│ 9-11 Age Band - Level Achievement    │
├──────────────────────────────────────┤
│ Rank │ Name    │ Level  │ Sessions │
├──────────────────────────────────────┤
│  1   │ Maya    │   3    │    28    │
│  2   │ Aditya  │   3    │    22    │
│  3   │ YOU     │   3    │    18    │
│  4   │ Priya   │   2    │    35    │
│  5   │ Rahul   │   2    │    31    │
└──────────────────────────────────────┘
```

### 4. **BADGES** - Achievements
```
Shows: Total badges earned
Metric: Count of unique badges
Top Performers: Most achievement-oriented students

Example:
┌──────────────────────────────────────┐
│ 6-8 Age Band - Badge Collection      │
├──────────────────────────────────────┤
│ Rank │ Name    │ Badges │ Earned   │
├──────────────────────────────────────┤
│  1   │ Priya   │   4    │ All 4    │
│  2   │ Maya    │   3    │ Spark,   │
│  2   │ Aditya  │   3    │ Word,    │
│  4   │ YOU     │   2    │ Voice    │
└──────────────────────────────────────┘
```

---

## API Documentation

### Get Age Band Leaderboard (Single Type)

**Request:**
```bash
GET /api/leaderboards/age-band?type=ACCURACY&limit=50
```

**Query Parameters:**
- `type` (required): `ACCURACY` | `CONSISTENCY` | `LEVEL` | `BADGES`
- `limit` (optional): 1-100, default 50
- `all` (optional): `true` to get all 4 leaderboards at once

**Response:**
```json
{
  "leaderboard": {
    "leaderboard": [
      {
        "rank": 1,
        "studentId": "aditya-123",
        "studentName": "Aditya",
        "ageBand": "9-11",
        "currentLevel": 3,
        "value": 88.5,
        "metric": "Reading Accuracy %",
        "trend": "up"
      },
      {
        "rank": 2,
        "studentId": "priya-456",
        "studentName": "Priya",
        "ageBand": "9-11",
        "currentLevel": 2,
        "value": 85.2,
        "metric": "Reading Accuracy %",
        "trend": "same"
      }
    ],
    "currentUserRank": 4,
    "currentUserValue": 76.3,
    "currentUserLevel": 2,
    "type": "ACCURACY",
    "ageBand": "9-11",
    "ageBandLabel": "Ages 9-11"
  },
  "stats": {
    "ageBand": "9-11",
    "totalStudents": 42,
    "avgLevel": 2.1,
    "maxLevel": 3,
    "avgAccuracy": 76.8
  },
  "studentAgeBand": "9-11"
}
```

### Get All Leaderboards

**Request:**
```bash
GET /api/leaderboards/age-band?all=true&limit=50
```

**Response:**
```json
{
  "leaderboards": {
    "accuracy": { /* ACCURACY leaderboard */ },
    "consistency": { /* CONSISTENCY leaderboard */ },
    "level": { /* LEVEL leaderboard */ },
    "badges": { /* BADGES leaderboard */ }
  },
  "stats": { /* Age band stats */ },
  "studentAgeBand": "9-11"
}
```

---

## Frontend Usage

### Using the React Hook

**Get All Leaderboards:**
```typescript
'use client';

import { useAgeBandLeaderboard } from '@/hooks/useAgeBandLeaderboard';

export function LeaderboardsPage() {
  const { accuracy, consistency, level, badges, stats, loading, error } = 
    useAgeBandLeaderboard();

  if (loading) return <div>Loading leaderboards...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Leaderboards - {stats?.ageBand}</h1>
      <p>Competing with {stats?.totalStudents} students</p>

      <div>
        <h2>Accuracy</h2>
        <p>Your rank: {accuracy?.currentUserRank}</p>
        <p>Your accuracy: {accuracy?.currentUserValue}%</p>
      </div>

      <div>
        <h2>Consistency</h2>
        <p>Your rank: {consistency?.currentUserRank}</p>
        <p>Your sessions: {consistency?.currentUserValue}</p>
      </div>

      <div>
        <h2>Level</h2>
        <p>Your rank: {level?.currentUserRank}</p>
        <p>Your level: {level?.currentUserLevel}</p>
      </div>

      <div>
        <h2>Badges</h2>
        <p>Your rank: {badges?.currentUserRank}</p>
        <p>Your badges: {badges?.currentUserValue}</p>
      </div>
    </div>
  );
}
```

**Get Single Leaderboard:**
```typescript
'use client';

import { useSingleAgeBandLeaderboard } from '@/hooks/useAgeBandLeaderboard';

export function AccuracyLeaderboard() {
  const { leaderboard, stats, loading } = 
    useSingleAgeBandLeaderboard('ACCURACY', 10);

  if (loading) return <div>Loading...</div>;

  return (
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Name</th>
          <th>Accuracy</th>
          <th>Level</th>
        </tr>
      </thead>
      <tbody>
        {leaderboard?.leaderboard.map((entry) => (
          <tr key={entry.studentId}>
            <td>{entry.rank}</td>
            <td>{entry.studentName}</td>
            <td>{entry.value}%</td>
            <td>{entry.currentLevel}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## Real-World Examples

### Example 1: Fair Competition Across Ages

**School with mixed ages:**
```
Leaderboard Shows:
├─ For 8-year-olds: Their age band only (6-8)
│  └─ Maya sees herself ranked 1st among 8-year-olds ✅
│
├─ For 10-year-olds: Their age band only (9-11)
│  └─ Aditya sees himself ranked 4th among 10-year-olds ✅
│
└─ For 14-year-olds: Their age band only (12-14)
   └─ Arjun sees himself ranked 2nd among 14-year-olds ✅

Result: All students see meaningful competition at their level
```

### Example 2: Motivation & Achievement

**Student's Leaderboard Journey:**
```
Week 1:
└─ Aditya: Rank 28 out of 42 in 9-11 age band
└─ Feels: "I need to catch up" (reasonable goal)

Week 2:
└─ Aditya: Rank 15 out of 42
└─ Feels: "I'm improving!" (motivation)

Week 3:
└─ Aditya: Rank 8 out of 42
└─ Feels: "I can reach top 5!" (engaged)

Week 4:
└─ Aditya: Rank 3 out of 42
└─ Feels: "I'm in the top tier!" (proud)

vs. With Global Leaderboard:
└─ Would always be rank 250+
└─ Would feel: "I can never win" (demotivated)
```

### Example 3: Age Progression

**When student turns 12:**
```
Before (Age 11):
└─ Age band: 9-11
└─ Leaderboard: Ranked 4th
└─ Feels: "I'm near the top!"

After (Age 12):
└─ Age band: 12-14 (auto-updated)
└─ Leaderboard: Ranked 18th (new peer group)
└─ Feels: "Fresh challenge, new competitors!"

Result: Natural progression to new age band
```

---

## Database Queries

### Get Age Band Statistics

```typescript
import { getAgeBandStats } from '@/lib/age-band-leaderboard';

const stats = await getAgeBandStats('9-11');

// Returns:
{
  ageBand: "9-11",
  totalStudents: 42,
  avgLevel: 2.1,
  maxLevel: 3,
  avgAccuracy: 76.8
}
```

### Get Single Leaderboard

```typescript
import { getAgeBandLeaderboard } from '@/lib/age-band-leaderboard';

const leaderboard = await getAgeBandLeaderboard(
  'ACCURACY',
  '9-11',
  'current-student-id',
  50
);

// Returns:
{
  leaderboard: [...],
  currentUserRank: 4,
  currentUserValue: 76.3,
  currentUserLevel: 2,
  type: 'ACCURACY',
  ageBand: '9-11',
  ageBandLabel: 'Ages 9-11'
}
```

### Get All Leaderboards

```typescript
import { getAllAgeBandLeaderboards } from '@/lib/age-band-leaderboard';

const all = await getAllAgeBandLeaderboards(
  '12-14',
  'current-student-id',
  10
);

// Returns:
{
  accuracy: { /* ACCURACY leaderboard */ },
  consistency: { /* CONSISTENCY leaderboard */ },
  level: { /* LEVEL leaderboard */ },
  badges: { /* BADGES leaderboard */ }
}
```

---

## Performance Considerations

**Database:**
- Uses indexed queries on `StudentProgress.ageBand`
- Efficient aggregations for stats
- 5-minute cache on API responses

**Optimization:**
```typescript
// Efficient: Single query groups by age band
const stats = await prisma.studentProgress.groupBy({
  by: ['ageBand'],
  _avg: { currentLevel: true },
  _count: { studentId: true },
});

// Avoid: Multiple queries for each age band
// for (const band of allBands) {
//   const students = await prisma.student.findMany(...);
// }
```

---

## Privacy & Security

- ✅ Only shows students in same age band
- ✅ Hides full student details (only name + metrics)
- ✅ Student rank visible only to self
- ✅ No cross-age-band comparisons possible
- ✅ No sensitive data in leaderboard

---

## Testing Age Band Leaderboards

### Test Scenario 1: Multiple Age Bands

```bash
# Create test students in different age bands
curl -X POST /api/auth/signup-detailed \
  -d '{"name":"Test6","dateOfBirth":"2018-01-01","phone":"1111111111"}'
  # → Age band: 6-8

curl -X POST /api/auth/signup-detailed \
  -d '{"name":"Test10","dateOfBirth":"2015-01-01","phone":"2222222222"}'
  # → Age band: 9-11

# Log in as 10-year-old, fetch leaderboard
curl /api/leaderboards/age-band?type=ACCURACY
# → Should show only 9-11 age band students
```

### Test Scenario 2: Rank Updates

```bash
# Student improves performance
# Complete 5 high-accuracy sessions → Level up
# Accuracy rank should improve immediately

curl /api/leaderboards/age-band?type=ACCURACY
# → currentUserRank should decrease (improve)
```

---

## Future Enhancements

**Phase 2:**
- Trend indicators (↑ improving, ↓ declining, → stable)
- Weekly/monthly comparison
- Achievement streak tracking

**Phase 3:**
- Age band "challenges" (beat other students)
- Leaderboard rewards (badges for top 3)
- Mentorship program (top performers help others)

**Phase 4:**
- Relative performance (compared to age band average)
- Predictive analytics (on track to reach Level 3?)
- Personalized goals (next target: beat this student)

---

## Summary

Age band leaderboards:
✅ **Fair** - Compare only with peers
✅ **Motivating** - Achievable goals
✅ **Safe** - No cross-age competitions
✅ **Dynamic** - Auto-update on birthday
✅ **Comprehensive** - 4 different metrics

Every student competes fairly and sees meaningful progress! 🏆

---

**Powered by Edvanta Intelligence System**
