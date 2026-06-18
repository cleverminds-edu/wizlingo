# Gender-Aware Speaking Practice System

## Overview

This system makes speaking conversations feel natural and personal by understanding student gender preferences while gradually introducing diversity. It's built on an educational principle: **comfort first, growth second**.

```
Progressive Exposure Model:
└─ Week 1: Student chooses preferred character gender
   └─ Feel comfortable, build confidence
   
└─ Week 2: Start mixing in variety (70% preferred, 30% other)
   └─ Gentle exposure to diversity
   
└─ Week 3: Balanced mix (50/50)
   └─ Practice with everyone
   
└─ Week 4+: Mostly diverse (30% preferred, 70% other)
   └─ Real-world readiness
```

---

## Phase A: Foundation - Student-Controlled Selection

### What Was Built

**Database Updates:**
```prisma
// 1. ConversationTopic model enhanced
model ConversationTopic {
  characterGender Gender?    // M/F/OTHER/NEUTRAL
  characterRole   String?    // Teacher, Shopkeeper, Friend, etc.
  // ... other fields
}

// 2. New SpeakingPreference model
model SpeakingPreference {
  studentId           String  @unique
  characterGenderPref String  // ANY, SAME, DIFFERENT, MALE, FEMALE, NEUTRAL
  pronouns            String? // he/him, she/her, they/them
  progressionWeek     Int     // Week 1, 2, 3, 4+
  startedAt           DateTime
}
```

**Core Utility (lib/speaking-preference.ts):**
```typescript
// Get student's preference
const pref = await getSpeakingPreference(studentId);

// Update preference
await updateCharacterPreference(studentId, 'SAME');

// Get available genders for preference
const genders = getAvailableCharacterGenders(
  studentGender,  // M/F/OTHER/PREFER_NOT_SAY
  'SAME'          // Preference type
);
// Returns: Array of compatible genders
```

**Updated Speaking Topics API:**
```bash
GET /api/speaking/topics

Response:
{
  "topic": {
    "id": "topic-123",
    "character": "Raj",
    "characterGender": "MALE",
    "characterRole": "Teacher",
    "openingLine": "Hi! How was your day?",
    ...
  },
  "preference": {
    "characterGenderPref": "SAME",
    "progressionWeek": 1,
    "selectedCharacterGender": "MALE",
    "diversityTarget": { "preferred": 100, "diverse": 0 }
  },
  "context": {
    "studentGender": "MALE"
  }
}
```

### Usage - Phase A

**API Endpoints:**
```bash
# Get current preferences
GET /api/speaking/preferences

# Update preferences
POST /api/speaking/preferences
{
  "characterGenderPref": "ANY" | "SAME" | "DIFFERENT" | "MALE" | "FEMALE" | "NEUTRAL",
  "pronouns": "he/him" | "she/her" | "they/them" | "ask me"
}

# Get speaking topic (with gender preference applied)
GET /api/speaking/topics
```

**React Hook:**
```typescript
const { preference, diversity, updatePreference, updatePronouns } = 
  useSpeakingPreferences();

return (
  <div>
    <select value={preference?.preference} onChange={(e) => updatePreference(e.target.value)}>
      <option value="ANY">Any Gender</option>
      <option value="SAME">Same as Me</option>
      <option value="DIFFERENT">Different</option>
    </select>
    
    <select onChange={(e) => updatePronouns(e.target.value)}>
      <option value="he/him">he/him</option>
      <option value="she/her">she/her</option>
      <option value="they/them">they/them</option>
    </select>
  </div>
);
```

---

## Phase B: Progressive Exposure & Analytics

### What Gets Added

**Progressive Exposure Logic:**
```typescript
// Calculate which week student is in
const week = calculateProgressionWeek(startedAt);  // Returns 1, 2, 3, 4+

// Get target diversity for that week
const diversity = getTargetDiversityPercentage(week);
// Week 1: { preferred: 100, diverse: 0 }
// Week 2: { preferred: 70, diverse: 30 }
// Week 3: { preferred: 50, diverse: 50 }
// Week 4+: { preferred: 30, diverse: 70 }

// Smart character selection
const selectedGender = selectCharacterGender(
  allAvailableGenders,
  preferredGenders,
  diversity
);
// Returns: MALE or FEMALE or NEUTRAL based on week + preference
```

**Character Diversity Analytics:**
```typescript
const stats = await getCharacterDiversityStats(studentId);

// Returns:
{
  totalSessions: 15,
  genderCounts: {
    MALE: 10,
    FEMALE: 3,
    NEUTRAL: 2,
    OTHER: 0
  },
  percentages: {
    MALE: "66.7%",
    FEMALE: "20.0%",
    NEUTRAL: "13.3%",
    OTHER: "0.0%"
  },
  diversity: 35.2  // Score 0-100 (higher = more balanced)
}
```

**Teacher Dashboard Endpoint (NEW):**
```bash
GET /api/admin/speaking-diversity

Shows:
├─ Students by progression week
├─ Average diversity score by age band
├─ Character gender usage statistics
└─ Recommendations for students who need exposure
```

**Student Dashboard Component:**
```
Your Speaking Practice Diversity
┌────────────────────────────────┐
│ Week 1 of your learning path   │
│                                │
│ This week: Practice with any   │
│ character you prefer!          │
│                                │
│ Next week: We'll mix in some   │
│ different speakers             │
│                                │
│ Your diversity score: 35/100   │
│ └─ Mostly Male (67%)           │
│    Some Female (20%)           │
│    Some Neutral (13%)          │
│                                │
│ Challenge: Try 3 sessions with │
│ a Female or Neutral character  │
└────────────────────────────────┘
```

### Phase B Implementation

**Progression Week Calculation:**
```
Student signup: June 1, 2026
├─ June 1-7 (Days 0-6): Week 1 → 100% preference
├─ June 8-14 (Days 7-13): Week 2 → 70% preference
├─ June 15-21 (Days 14-20): Week 3 → 50% preference
├─ June 22+ (Days 21+): Week 4+ → 30% preference
```

**Diversity Score Calculation:**
```
Formula: (1 - Σ|count - expectedDistribution| / maxVariance) × 100

Example:
Students with 15 sessions:
├─ Male: 10, Female: 3, Neutral: 2 → Diversity: 35.2
├─ Male: 4, Female: 4, Neutral: 4, Other: 3 → Diversity: 92.0 (balanced!)
```

---

## Phase C: Advanced - Pronouns & Inclusive Language

### What Gets Added

**Pronoun Support:**
```typescript
// Store pronouns
await updatePronouns(studentId, 'they/them');

// Use in dialogue templates
const dialogue = personalizeDialogue(
  template,
  studentName,
  pronouns  // 'he/him' | 'she/her' | 'they/them'
);
// "Hi Aditya! How are you?" 
// → personalized with pronouns in full conversation
```

**Inclusive Language System:**
```typescript
// Personalize conversation based on pronouns
const templateVariants = {
  'he/him': "Hi Aditya! How was your day? Tell me about it.",
  'she/her': "Hi Priya! How was your day? Tell me about it.",
  'they/them': "Hi Zara! How was your day? Tell them about it."
};
```

**Skill Badges for Diversity:**
```
New Badges:
├─ 🌍 Global Speaker
│  └─ Practiced with 3+ different character genders
│
├─ 🗣️ Inclusion Champion  
│  └─ Achieved 80%+ diversity score
│
└─ 🤝 Conversation Master
   └─ 50+ sessions with diverse characters
```

**Teacher Dashboard Enhanced:**
```
Cultural Competency Metrics:
├─ Students by diversity score
├─ Character gender balance recommendations
├─ Inclusive language usage
└─ Skill badge progress (diversity-based)
```

---

## Complete Example: Student Journey

### Student Profile
```
Name: Aditya
Gender: MALE
Age: 10 (Age band: 9-11)
Signup Date: June 1, 2026
```

### Week 1: Comfort Building

**Preference Set:**
- Character Gender: SAME (prefer talking to male characters)

**Sessions:**
```
Session 1: Raj (Male, Teacher)     ✅ "Comfortable!"
Session 2: Mr. Kumar (Male, Shop)  ✅ "Great!"
Session 3: Alex (Male, Friend)     ✅ "Fun!"
Session 4: Rohan (Male, Coach)     ✅ "Good!"
Session 5: Mr. Patel (Male, Principal) ✅ "Easy!"

Analytics:
├─ Total: 5 sessions
├─ Gender breakdown: 100% Male
├─ Diversity score: 0/100
└─ Status: Building confidence ✓
```

### Week 2: Gentle Exposure

**Progressive Mix Kicks In:**
- Preference still: SAME
- But now: 70% male, 30% female/other

**Sessions:**
```
Session 6: Suresh (Male, Coach)    ✅
Session 7: Priya (Female, Teacher) ✅ "First time with female!"
Session 8: Mr. Sharma (Male, Doc)  ✅
Session 9: Neha (Female, Friend)   ✅ "Pretty cool"
Session 10: Ravi (Male, shopkeeper) ✅

Analytics:
├─ Total: 10 sessions
├─ Gender breakdown: 70% Male, 30% Female
├─ Diversity score: 45/100
└─ Status: Trying new voices ✓
```

### Week 3: Balanced Practice

**Mix becomes 50/50:**
- Still respects preference but introduces more variety

**Sessions:**
```
Session 11: Ms. Gupta (Female, Teacher) ✅
Session 12: Vikram (Male, Classmate)    ✅
Session 13: Ananya (Female, Friend)     ✅
Session 14: Mr. Patel (Male, Principal) ✅
Session 15: Sam (Neutral, Tutor)        ✅ "New!"

Analytics:
├─ Total: 15 sessions
├─ Gender breakdown: 47% Male, 40% Female, 13% Neutral
├─ Diversity score: 62/100
└─ Status: Comfortable with everyone! ✓
```

### Week 4+: Real-World Readiness

**Mostly diverse (30% male, 70% other):**

**Sessions:**
```
Session 16: Ms. Sharma (Female, Shopkeeper) ✅
Session 17: Alex (Neutral, Friend)          ✅
Session 18: Priya (Female, Doctor)          ✅
Session 19: Arjun (Male, Neighbor)          ✅ (preferred gender)
Session 20: Casey (Neutral, Coach)          ✅

Analytics:
├─ Total: 20 sessions
├─ Gender breakdown: 20% Male, 40% Female, 40% Neutral
├─ Diversity score: 85/100
├─ Badges earned: 🌍 Global Speaker, 🗣️ Inclusion Champion
└─ Status: Confident speaker for any situation! ✓
```

---

## API Reference - Phase A, B, C

### Get Preferences
```bash
GET /api/speaking/preferences

Response:
{
  "preference": {
    "preference": "SAME",           // or ANY, DIFFERENT, etc.
    "pronouns": "he/him",
    "studentGender": "MALE",
    "progressionWeek": 2,
    "totalSessions": 10,
    "availableCharacterGenders": ["MALE"],
    "startedAt": "2026-06-01T00:00:00Z"
  },
  "diversity": {
    "totalSessions": 10,
    "genderCounts": { "MALE": 7, "FEMALE": 3, "NEUTRAL": 0, "OTHER": 0 },
    "percentages": { "MALE": "70", "FEMALE": "30", "NEUTRAL": "0", "OTHER": "0" },
    "diversity": 45.2
  }
}
```

### Update Preferences
```bash
POST /api/speaking/preferences
Content-Type: application/json

{
  "characterGenderPref": "ANY",
  "pronouns": "they/them"
}
```

### Get Speaking Topic (With Gender Applied)
```bash
GET /api/speaking/topics

Response includes:
{
  "topic": { ... character details ... },
  "preference": {
    "characterGenderPref": "SAME",
    "progressionWeek": 2,
    "selectedCharacterGender": "MALE",  // Intelligently selected
    "diversityTarget": { "preferred": 70, "diverse": 30 }
  }
}
```

---

## Teacher/Admin Dashboard

### Monitor Student Diversity

```bash
GET /api/admin/speaking-diversity

Returns:
{
  "students": [
    {
      "studentId": "aditya-123",
      "name": "Aditya",
      "age": 10,
      "progressionWeek": 2,
      "diversityScore": 45.2,
      "genderCounts": { "MALE": 7, "FEMALE": 3, "NEUTRAL": 0 },
      "recommendation": "Encourage talking to female or neutral characters"
    }
  ],
  "ageBandStats": {
    "9-11": {
      "avgDiversityScore": 52.3,
      "totalStudents": 42,
      "studentsNeedingExposure": 8
    }
  }
}
```

---

## Implementation Checklist

### Phase A ✅ COMPLETE
- [x] Add characterGender to ConversationTopic
- [x] Create SpeakingPreference model
- [x] Build speaking-preference service
- [x] Create /api/speaking/preferences endpoint
- [x] Update /api/speaking/topics with character filtering
- [x] Create React hooks

### Phase B ⏳ READY
- [ ] Create teacher dashboard endpoint
- [ ] Add diversity score calculations
- [ ] Build student progress page showing diversity
- [ ] Create admin reports
- [ ] Add diversity metrics to dashboard

### Phase C ⏳ READY
- [ ] Add pronouns to dialogue system
- [ ] Create inclusive language templates
- [ ] Implement diversity-based badges
- [ ] Build diversity skill tracking
- [ ] Add inclusive language guide for teachers

---

## Why This Matters

### Psychology
```
Before: "You must practice with everyone"
Result: Uncomfortable students → Less practice → Less improvement

After: "Start with what's comfortable, gradually try new voices"
Result: Confident students → More practice → Faster improvement
```

### Real World Skills
```
Week 1: Comfortable with one gender
Week 2: Comfortable with two genders
Week 3: Equally comfortable with all genders
Week 4: Natural, authentic conversation with anyone

By end of week 4:
├─ Job interview preparation: ✓ Can talk to mixed panels
├─ Daily life: ✓ Can order from any shopkeeper
├─ Relationships: ✓ Can have genuine conversations
└─ Travel: ✓ Can meet new people confidently
```

### Inclusion
```
Every student respected:
├─ Cis-gendered students: Gradual exposure works great
├─ Trans students: Can choose preferred character gender
├─ Non-binary students: Can pick NEUTRAL or ANY
├─ All students: Control remains with student
```

---

## Deployment Status

**Phase A: DEPLOYED** ✅
- Character gender preference system
- Progression-based exposure
- Speaking preference API

**Phase B: READY TO BUILD**
- Teacher dashboards
- Analytics
- Progress tracking

**Phase C: READY TO BUILD**
- Inclusive language system
- Diversity badges
- Advanced customization

---

**Powered by Edvanta Intelligence System**

Making speaking practice feel natural, inclusive, and effective. Every student matters. 🌍
