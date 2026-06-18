# Content Selection System - Implementation Guide

## Overview

The content selection system ensures each student gets:
1. **Age-appropriate content** (hard constraint via age band)
2. **Personalized difficulty** (soft constraint via performance level)

```
Age Band (Fixed)          Performance Level (Dynamic)
    ↓                            ↓
Grade Band Filter         Difficulty Filter
    ↓                            ↓
Available Passages/Topics
    ↓
Random Selection (avoid recent)
    ↓
Deliver Content
```

---

## How It Works

### Reading Content Selection

**Student Profile:**
```
Name: Aditya
Age: 14 years old
Age band: 12-14 (FIXED)
Performance level: 2 (DYNAMIC)
```

**Content Selection Algorithm:**

```
1. Map age band → grade band
   12-14 → GRADE_VI_VIII

2. Filter passages
   WHERE gradeBand = GRADE_VI_VIII
   AND level = 2

3. Exclude recent passages
   - Get passages used in last 20 sessions
   - Remove from pool

4. Random select
   - Choose random passage from remaining pool
   - If all used, allow repeats

5. Return passage with metadata
```

**Result:**
- ✅ Passage is Grade VI-VIII (age-appropriate)
- ✅ Passage is Level 2 (medium difficulty)
- ✅ Passage was not used recently
- ✅ Student gets personalized challenge

### Speaking Content Selection

Same algorithm, but for conversation topics:

```
1. Map age band → grade band
   9-11 → GRADE_III_V

2. Filter topics
   WHERE gradeBand = GRADE_III_V
   AND level = 2

3. Random select
   (no recent filter for speaking topics)

4. Return topic with metadata
```

---

## Age Band to Grade Band Mapping

| Age Band | Grade Band | Curriculum | Example Topics |
|----------|-----------|------------|-----------------|
| **6-8** | GRADE_I_II | Grade I-II | Colors, Animals, Family, School |
| **9-11** | GRADE_III_V | Grade III-V | Stories, Nature, Communities, Culture |
| **12-14** | GRADE_VI_VIII | Grade VI-VIII | History, Science, Social Issues, Literature |
| **15+** | GRADE_IX_PLUS | Grade IX+ | Advanced Topics, News, Philosophy, Poetry |

---

## Implementation

### Files Created

1. **lib/age-band-mapping.ts**
   - `ageBandToGradeBand()` - Maps age band to grade band
   - `getAgeBandDescription()` - Human-readable description
   - `isValidGradeBandForAgeBand()` - Validation helper

2. **lib/content-selection.ts**
   - `selectReadingPassage()` - Select next reading content
   - `selectSpeakingTopic()` - Select next speaking content
   - `getContentRecommendations()` - Show available content at all levels

3. **Updated API Endpoints**
   - `/api/passages` - Returns age band-filtered reading passage
   - `/api/speaking/topics` - Returns age band-filtered speaking topic

### API Responses

**GET /api/passages**
```json
{
  "id": "passage-123",
  "title": "The Great Wall of China",
  "content": "...",
  "wordCount": 245,
  "gradeBand": "GRADE_VI_VIII",
  "level": 2,
  "topic": "History",
  "_contentMetadata": {
    "ageBand": "12-14",
    "level": 2,
    "gradeBand": "GRADE_VI_VIII",
    "reason": "Age band 12-14 (Grade GRADE_VI_VIII) at performance level 2"
  }
}
```

**GET /api/speaking/topics**
```json
{
  "topic": {
    "id": "topic-456",
    "title": "Ordering Food at a Restaurant",
    "character": "Waiter",
    "openingLine": "Good evening! What would you like to order?",
    "level": 2,
    "gradeBand": "GRADE_III_V"
  },
  "metadata": {
    "ageBand": "9-11",
    "level": 2,
    "gradeBand": "GRADE_III_V",
    "reason": "Age band 9-11 (Grade GRADE_III_V) at performance level 2"
  }
}
```

---

## Real-World Examples

### Example 1: Young Gifted Student

**Student Profile:**
```
Name: Maya
Age: 8 years old (age band 6-8)
Performance level: 3 (advanced!)
```

**Content Selection:**
```
Age band 6-8 → GRADE_I_II
Performance level 3 → Hard passages

Result: 
  - GRADE_I_II passages (age-appropriate)
  - Level 3 difficulty (challenging)
  - Example: "The Story of the Clever Mouse" (Grade I-II, complex vocabulary)
```

✅ **Benefit:** Maya stays challenged without getting content too mature for her age

### Example 2: Older Struggling Student

**Student Profile:**
```
Name: Raj
Age: 14 years old (age band 12-14)
Performance level: 1 (struggling)
```

**Content Selection:**
```
Age band 12-14 → GRADE_VI_VIII
Performance level 1 → Easy passages

Result:
  - GRADE_VI_VIII passages (grade-level)
  - Level 1 difficulty (supportive)
  - Example: "Introduction to Climate" (Grade VI-VIII, simple language)
```

✅ **Benefit:** Raj gets accessible content at his grade level without feeling babyish

### Example 3: Age Band Progression

**When Student's Birthday Passes:**
```
Original (13 years old):
  Age band: 9-11 → GRADE_III_V
  Performance level: 2

After 14th Birthday:
  Age band: 12-14 → GRADE_VI_VIII (auto-updated)
  Performance level: 2 (maintained)
  
New content:
  - More mature topics (history, science)
  - Grade VI-VIII complexity
  - Same difficulty challenge continues
```

---

## Database Queries

### Get content availability by age band

```typescript
import { getContentRecommendations } from '@/lib/content-selection';

const recommendations = await getContentRecommendations('12-14', 2);

// Result:
{
  ageBand: "12-14",
  currentLevel: 2,
  gradeBand: "GRADE_VI_VIII",
  reading: [
    { level: 1, count: 15, available: true, isCurrent: false },
    { level: 2, count: 28, available: true, isCurrent: true },
    { level: 3, count: 12, available: true, isCurrent: false },
  ],
  speaking: [
    { level: 1, count: 8, available: true, isCurrent: false },
    { level: 2, count: 14, available: true, isCurrent: true },
    { level: 3, count: 6, available: true, isCurrent: false },
  ]
}
```

### Get students by age band performance

```typescript
const statistics = await prisma.studentProgress.groupBy({
  by: ['ageBand'],
  _count: { studentId: true },
  _avg: { currentLevel: true, avgAccuracy: true },
  orderBy: { ageBand: 'asc' },
});

// Result:
[
  {
    ageBand: "6-8",
    _count: { studentId: 5 },
    _avg: { currentLevel: 1.8, avgAccuracy: 71 }
  },
  {
    ageBand: "9-11",
    _count: { studentId: 42 },
    _avg: { currentLevel: 2.1, avgAccuracy: 78 }
  },
  {
    ageBand: "12-14",
    _count: { studentId: 23 },
    _avg: { currentLevel: 2.3, avgAccuracy: 82 }
  },
  {
    ageBand: "15+",
    _count: { studentId: 8 },
    _avg: { currentLevel: 2.5, avgAccuracy: 85 }
  }
]
```

---

## Error Handling

### No Content Available

If a student reaches a level where no content exists for their age band:

```typescript
try {
  const passage = await selectReadingPassage({
    studentId: "student-123",
    ageBand: "6-8",
    performanceLevel: 3,
  });
} catch (error) {
  // Error: "No reading passages available for age band 6-8 (GRADE_I_II) at level 3"
  // Action: Level down student or create more Level 3 GRADE_I_II passages
}
```

**Recovery Strategy:**
1. If student is at Level 3 and no content exists:
   - Auto-suggest level down to Level 2
   - Or create Level 3 content for that age band
   - Or recommend challenge mode (cross-age content)

---

## Testing Content Selection

### Local Testing

```typescript
import { selectReadingPassage, selectSpeakingTopic } from '@/lib/content-selection';

// Test 1: Select reading for 10-year-old at level 2
const reading = await selectReadingPassage({
  studentId: 'test-student-1',
  ageBand: '9-11',
  performanceLevel: 2,
});

console.log(reading.metadata);
// Output: Age band 9-11 (Grade GRADE_III_V) at performance level 2

// Test 2: Select speaking for 13-year-old at level 1
const speaking = await selectSpeakingTopic({
  studentId: 'test-student-2',
  ageBand: '12-14',
  performanceLevel: 1,
});

console.log(speaking.metadata);
// Output: Age band 12-14 (Grade GRADE_VI_VIII) at performance level 1
```

### Verify Age Band Mapping

```typescript
import { ageBandToGradeBand } from '@/lib/age-band-mapping';

console.log(ageBandToGradeBand('6-8'));    // GRADE_I_II
console.log(ageBandToGradeBand('9-11'));   // GRADE_III_V
console.log(ageBandToGradeBand('12-14'));  // GRADE_VI_VIII
console.log(ageBandToGradeBand('15+'));    // GRADE_IX_PLUS
```

---

## Performance Considerations

- **Age band to grade band mapping:** O(1) lookup, cached
- **Content filtering:** Indexed on `gradeBand + level`
- **Recent passages exclusion:** Fetches last 20 sessions (fast)
- **Random selection:** In-memory, O(1)

### Optimization Tips

1. **Create indices on ReadingPassage**
   ```sql
   CREATE INDEX idx_reading_passage_band_level 
   ON ReadingPassage(gradeBand, level);
   ```

2. **Create indices on ConversationTopic**
   ```sql
   CREATE INDEX idx_conversation_topic_band_level 
   ON ConversationTopic(gradeBand, level);
   ```

3. **Cache content counts** at startup (optional)

---

## Future Enhancements

**Phase 2: Advanced Selection**
- Content recommendations based on topics student likes
- Adaptive content: If student excels in science, show more science
- Cross-age "challenge mode" for gifted students

**Phase 3: Sophisticated Filtering**
- Learning style detection (visual, auditory, kinesthetic)
- Interest-based content (sports, science, arts)
- Difficulty micro-adjustments between levels

**Phase 4: Content Generation**
- AI-generated passages matching age band + level + interest
- Personalized stories with student's name
- Real-time difficulty adjustment mid-session

---

## Summary

The content selection system ensures:
✅ **Fair, age-appropriate content** for all students
✅ **Personalized difficulty** based on performance
✅ **No repetition** of recent passages (reading)
✅ **Smooth progression** as students grow and improve
✅ **Equity** - struggling 14-year-olds don't get "baby" content
✅ **Challenge** - gifted 8-year-olds can reach Level 3

---

**Powered by Edvanta Intelligence System**

Every student learns at the right pace with content that respects both their age and ability. 🎯
