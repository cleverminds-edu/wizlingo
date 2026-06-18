# WizLingo Age Band System

## Overview

**Age bands** are independent from **performance levels**. This ensures fair comparisons and appropriate content while maintaining personalized difficulty adjustments.

```
Performance Level (1-3)    Age Band (6-8, 9-11, 12-14, 15+)
↓                          ↓
Based on: Accuracy         Based on: dateOfBirth
Adjusts: Every session     Static: Once at signup
Affects: Difficulty        Affects: Content, Leaderboards
```

---

## Age Band Definition

| Age Band | Age Range | Target Grade | Content Focus |
|----------|-----------|--------------|---------------|
| **6-8** | 6-8 years old | Grade I-II | Simple words, basic sentences, everyday topics |
| **9-11** | 9-11 years old | Grade III-V | Intermediate vocabulary, varied sentences, stories |
| **12-14** | 12-14 years old | Grade VI-VIII | Advanced vocabulary, complex sentences, diverse topics |
| **15+** | 15+ years old | Grade IX+ | Native-level content, news, literary texts |

---

## How It Works

### At Signup

```
Student signs up with dateOfBirth: 2010-05-15
                                  ↓
System calculates: Age = 14 years old
                                  ↓
Assigned age band: 12-14
Assigned performance level: 2 (middle ground)
                                  ↓
StudentProgress created:
  - currentLevel: 2
  - ageBand: "12-14"
  - gradeBand: GRADE_III_V
```

### During Reading Sessions

```
Content Selection Algorithm:

1. Filter passages by age band (HARD constraint)
   - Get all passages for age 12-14
   
2. Filter by performance level
   - Get Level 2 passages (Medium difficulty)
   
3. Select passage → Present to student

Performance → Level Adjustment:
   - 5 sessions ≥80% → Level 3
   - 3 sessions <60% → Level 1
   
Age Band → NO CHANGE
   - Stays "12-14" forever
```

### In Leaderboards

```
Leaderboard Filtering:

Student is in age band 9-11
                     ↓
Show leaderboard for only 9-11 students
                     ↓
Fair comparison with peers
(not competing with younger 6-8 or older 15+ students)
```

---

## Implementation Details

### Utility Functions (lib/age-band.ts)

```typescript
calculateAgeBand(dateOfBirth): AgeBand
  // Converts dateOfBirth to "6-8" | "9-11" | "12-14" | "15+"

getAgeBandLabel(ageBand): string
  // Returns: "Ages 6-8", "Ages 9-11", etc.

getAgeBandColor(ageBand): string
  // Returns CSS class for UI display
```

### StudentProgress Schema

```prisma
model StudentProgress {
  id           String   @id @default(cuid())
  studentId    String   @unique
  currentLevel Int      @default(2)        // Changes: Performance-based
  ageBand      String   @default("9-11")   // Fixed: Age-based
  gradeBand    GradeBand
}
```

---

## Use Cases

### 1. Content Selection

**Scenario:** 10-year-old student (age band 9-11) at performance level 2

```typescript
// Get reading passages
const passages = await prisma.readingPassage.findMany({
  where: {
    gradeBand: "GRADE_III_V",    // Age band 9-11
    level: 2,                     // Performance level
  },
});

// Result: Medium difficulty passages suitable for Grade III-V
```

### 2. Leaderboard Filtering

**Scenario:** Show top performers in student's age band

```typescript
// Get top performers in age band 9-11
const topPerformers = await prisma.studentProgress.findMany({
  where: {
    ageBand: "9-11",
  },
  orderBy: {
    avgAccuracy: 'desc',
  },
  take: 10,
});

// Result: Fair comparison within peer group
```

### 3. Dashboard Analytics

**Scenario:** Show performance breakdown by age band

```
Performance by Age Band:
├─ 6-8 years: 5 students, 68% avg accuracy
├─ 9-11 years: 42 students, 78% avg accuracy ← Most students here
├─ 12-14 years: 23 students, 82% avg accuracy
└─ 15+ years: 8 students, 85% avg accuracy
```

---

## Student Journey Example

### Aditya (Born 2010-05-15)

**At Signup (Age 14):**
```
Age band: 12-14
Performance level: 2
Passages: Grade VI-VIII with medium complexity
Leaderboard: Competes with 12-14 year olds only
```

**After 5 Sessions at 85% Accuracy:**
```
Age band: 12-14 (unchanged)
Performance level: 3 (upgraded!)
Passages: Grade VI-VIII with hard complexity
Leaderboard: Still competes with 12-14 year olds
```

**Two Years Later (Age 16):**
```
Automatic age band progression: 12-14 → 15+
Performance level: 3 (maintained if still performing well)
Passages: Grade IX+ with hard complexity
Leaderboard: Now competes with 15+ year olds (more challenging)
```

---

## Database Queries

### Get students by age band

```typescript
const students = await prisma.studentProgress.groupBy({
  by: ['ageBand'],
  _count: {
    studentId: true,
  },
  _avg: {
    currentLevel: true,
    avgAccuracy: true,
  },
});

// Result:
// [
//   { ageBand: "9-11", _count: { studentId: 42 }, _avg: { currentLevel: 2.1, avgAccuracy: 78 } },
//   { ageBand: "12-14", _count: { studentId: 23 }, _avg: { currentLevel: 2.3, avgAccuracy: 82 } },
// ]
```

### Get students advancing in their age band

```typescript
const advancing = await prisma.studentProgress.findMany({
  where: {
    ageBand: "9-11",
    currentLevel: { gte: 2 },
    avgAccuracy: { gte: 75 },
  },
});

// Result: High performers in age band 9-11
```

---

## Benefits

✅ **Fair Comparisons**
- Leaderboards compare within peer age groups
- Prevents 15-year-olds dominating leaderboards

✅ **Appropriate Content**
- Age band → Reading material complexity
- 6-8 year olds get simple stories
- 15+ get news articles and literature

✅ **Performance Independence**
- Levels adjust based on actual ability
- A gifted 8-year-old can reach Level 3
- A struggling 14-year-old can stay at Level 1

✅ **Motivation**
- Students compete fairly with peers
- Achievement feels earned and meaningful
- No discouragement from older kids excelling

---

## Future Enhancements

**Phase 2:**
- Add automatic age band progression when student turns older
- Create age-band-specific challenges (birthday milestones)
- Show peers at same age band on dashboard

**Phase 3:**
- Weighted recommendations: Passages you like from 9-11 age band
- Age band badges: "Master of 9-11 Reading", "Rising Star 12-14"
- Cross-age-band: Optional "Challenge Mode" to compete with older students

---

## Technical Notes

### Age Calculation

- Calculated at signup from dateOfBirth
- Stays fixed in database (no automatic age progression yet)
- Re-calculated for leaderboards if needed (query-time)
- Future: Add auto-update trigger when student's birthday passes

### gradeBand Field

- Separate from ageBand (don't confuse them)
- `ageBand` = age-based (6-8, 9-11, etc.)
- `gradeBand` = curriculum-based (GRADE_III_V, GRADE_VI_VIII, etc.)
- Both used together for content filtering

### Backwards Compatibility

- Old students without ageBand default to "9-11"
- Can migrate historical data in batch job
- New signups always get correct ageBand

---

## API Examples

### Calculate age band

```bash
curl -X POST /api/age-band \
  -H "Content-Type: application/json" \
  -d '{"dateOfBirth": "2010-05-15"}'

# Response: { "ageBand": "12-14", "age": 14 }
```

### Get leaderboard for age band

```bash
curl /api/leaderboard?ageBand=9-11&limit=10

# Response: Top 10 performers in 9-11 age band
```

---

**Powered by Edvanta Intelligence System**

This age band system ensures every student learns at the right pace with age-appropriate content while maintaining fair competition with their peers. 🎯
