# WizLingo Badges & Certificates System

## Current Badge System (5 Badges)

### Badge Types & Requirements

```typescript
enum BadgeType {
  SPARK              // ✨ First session
  WORD_WIZARD        // 📚 Reading accuracy mastery
  VOICE_WIZARD       // 🎤 Speaking fluency mastery
  LANGUAGE_WIZARD    // 🧙 Advanced comprehension
  GRAND_WIZARD       // 👑 Overall mastery (all badges earned)
}
```

---

## Badge Earning Logic

### 1️⃣ **SPARK** (✨)
**Requirement:** Complete 1 reading session
```
Reading Session → Completed → Award SPARK
```
**Purpose:** First-time encouragement, onboarding

---

### 2️⃣ **WORD_WIZARD** (📚)
**Requirement:** Maintain 80%+ accuracy in reading
```
Reading Session → accuracy >= 80% → Award WORD_WIZARD
```
**Requirements:**
- Must have at least 1 session with 80%+ accuracy
- Can be earned multiple times, but only one badge (@@unique constraint)

**Examples that earn it:**
- Student: 85% accuracy ✅ → Badge awarded
- Student: 75% accuracy ❌ → No badge

---

### 3️⃣ **VOICE_WIZARD** (🎤)
**Requirement:** Maintain 75%+ fluency in speaking
```
Speaking Session → fluencyScore >= 75 → Award VOICE_WIZARD
```
**What is fluency scored on:**
- Pronunciation clarity
- Speech pacing
- Word stress & intonation
- Confidence level

---

### 4️⃣ **LANGUAGE_WIZARD** (🧙)
**Requirement:** Complete 10 sessions (reading + speaking combined)
```
Total Sessions >= 10 → Award LANGUAGE_WIZARD
```
**Purpose:** Demonstrate commitment & progress

---

### 5️⃣ **GRAND_WIZARD** (👑)
**Requirement:** Earn all 4 badges above
```
SPARK + WORD_WIZARD + VOICE_WIZARD + LANGUAGE_WIZARD → GRAND_WIZARD
```
**Special:** Only unlocked when user has earned the other 4

---

## Badge Database Schema

```typescript
model Badge {
  id        String    @id @default(cuid())
  studentId String
  type      BadgeType
  earnedAt  DateTime  @default(now())
  student   Student   @relation(fields: [studentId], references: [id])

  @@unique([studentId, type])  // Can only earn each badge once
}
```

**Example:**
```
Badge 1: { studentId: "rahul@gmail.com", type: "SPARK", earnedAt: "2026-06-02" }
Badge 2: { studentId: "rahul@gmail.com", type: "WORD_WIZARD", earnedAt: "2026-06-03" }
```

---

## Certificate System

### What is a Certificate?
A **shareable, verifiable proof** that a student earned a specific badge.

**Use cases:**
- Share on WhatsApp/Instagram (image)
- Print for parents
- Share as PDF link
- Verify authenticity via QR code

### Certificate Database Schema

```typescript
model Certificate {
  id         String    @id @default(cuid())
  studentId  String
  badgeType  BadgeType
  verifyCode String    @unique @default(cuid())  // For verification
  issuedAt   DateTime  @default(now())
  student    Student   @relation(fields: [studentId], references: [id])

  @@unique([studentId, badgeType])  // One cert per badge per student
}
```

**Example:**
```
Certificate 1: {
  id: "cert-123",
  studentId: "rahul@gmail.com",
  badgeType: "WORD_WIZARD",
  verifyCode: "VERIFY-ABC-123",  // For verification
  issuedAt: "2026-06-03"
}
```

---

## Certificate Generation (Image + PDF)

### Certificate Image (1080×1080 PNG)
**Use your existing badge-image.ts:**

```typescript
// From lib/badge-image.ts (already have this)
export async function generateBadgeImage(type: BadgeType, studentName: string) {
  // Canvas render
  // - Student name
  // - Badge emoji + name
  // - Date earned
  // - Edvanta + WizLingo logos
  // - Verification QR code
  // Export as PNG
}
```

**Output example:**
```
┌─────────────────────┐
│  🏆 WORD WIZARD 🏆  │
│                     │
│  Certificate of     │
│  Achievement        │
│                     │
│  Presented to:      │
│  Rahul Sharma       │
│                     │
│  Issued: Jun 3 2026 │
│  Verify: VERIFY-ABC │
│  QR: [████████]     │
│                     │
│  Edvanta | WizLingo │
└─────────────────────┘
```

### Certificate PDF (A4 size)
Use **html2pdf** library:

```typescript
import html2pdf from 'html2pdf.js';

export async function generateCertificatePDF(
  type: BadgeType,
  studentName: string,
  verifyCode: string
) {
  const html = `
    <div style="text-align: center; padding: 60px; font-family: Fredoka;">
      <h1>${type.replace('_', ' ')}</h1>
      <p>Certificate of Achievement</p>
      <p>This certifies that <b>${studentName}</b></p>
      <p>has earned the <b>${type}</b> badge</p>
      <p style="margin-top: 40px; font-size: 12px;">
        Verify at: wiziingo.app/verify/${verifyCode}
      </p>
    </div>
  `;
  
  html2pdf().set(options).from(html).save();
}
```

---

## API Endpoints for Badges & Certificates

### 1️⃣ List All Badges (System)
```
GET /api/badges

Response:
[
  {
    "type": "SPARK",
    "name": "Spark",
    "emoji": "✨",
    "requirement": "Complete 1 reading session",
    "description": "Your first step into the world of reading!"
  },
  {
    "type": "WORD_WIZARD",
    "name": "Word Wizard",
    "emoji": "📚",
    "requirement": "Achieve 80%+ accuracy",
    "description": "Master reading comprehension"
  },
  ...
]
```

### 2️⃣ Get Student's Badges
```
GET /api/badges/[studentId]

Response:
{
  "badges": [
    {
      "id": "badge-1",
      "type": "SPARK",
      "earnedAt": "2026-06-02T10:35:00Z"
    },
    {
      "id": "badge-2",
      "type": "WORD_WIZARD",
      "earnedAt": "2026-06-03T14:22:00Z"
    }
  ],
  "totalBadges": 2,
  "nextBadges": ["VOICE_WIZARD", "LANGUAGE_WIZARD"]
}
```

### 3️⃣ Share Badge (Generate Image)
```
POST /api/badges/[studentId]/[badgeType]/share

Response:
{
  "imageUrl": "https://s3.amazonaws.com/badges/spark-rahul.png",
  "whatsappShareUrl": "https://wa.me/?text=I+earned+SPARK+badge...",
  "certificateUrl": "https://wiziingo.app/cert/CERT-123"
}
```

### 4️⃣ Issue Certificate
```
POST /api/certificates

Body:
{
  "studentId": "rahul@gmail.com",
  "badgeType": "WORD_WIZARD"
}

Response:
{
  "certificateId": "cert-123",
  "verifyCode": "VERIFY-ABC-123",
  "certificateImage": "https://s3.../cert-image.png",
  "certificatePDF": "https://s3.../cert-pdf.pdf",
  "verifyLink": "https://wiziingo.app/verify/VERIFY-ABC-123"
}
```

### 5️⃣ Verify Certificate (Public)
```
GET /api/certificates/verify/[verifyCode]

Response:
{
  "valid": true,
  "studentName": "Rahul Sharma",
  "badgeType": "WORD_WIZARD",
  "issuedAt": "2026-06-03T14:22:00Z",
  "certificateImage": "https://s3.../cert-image.png"
}
```

---

## Badge Earning Flow (Code Example)

In `/app/api/sessions/reading/[sessionId]/complete/route.ts`:

```typescript
// After session completion, check badge eligibility
async function checkAndAwardBadges(studentId: string, metrics: any) {
  // SPARK: First session
  const sessionCount = await prisma.readingSession.count({
    where: { studentId }
  });
  if (sessionCount === 1) {
    await awardBadge(studentId, 'SPARK');
  }

  // WORD_WIZARD: 80%+ accuracy
  if (metrics.accuracy >= 80) {
    await awardBadge(studentId, 'WORD_WIZARD');
  }

  // LANGUAGE_WIZARD: 10+ sessions
  if (sessionCount >= 10) {
    await awardBadge(studentId, 'LANGUAGE_WIZARD');
  }

  // GRAND_WIZARD: All 4 badges
  const earnedBadges = await prisma.badge.findMany({
    where: { studentId },
    select: { type: true }
  });
  const badgeTypes = earnedBadges.map(b => b.type);
  
  if (badgeTypes.includes('SPARK') && 
      badgeTypes.includes('WORD_WIZARD') && 
      badgeTypes.includes('VOICE_WIZARD') && 
      badgeTypes.includes('LANGUAGE_WIZARD')) {
    await awardBadge(studentId, 'GRAND_WIZARD');
  }
}

async function awardBadge(studentId: string, type: BadgeType) {
  const existing = await prisma.badge.findUnique({
    where: { studentId_type: { studentId, type } }
  });
  
  if (!existing) {
    await prisma.badge.create({
      data: { studentId, type }
    });
    
    // Auto-issue certificate
    await prisma.certificate.create({
      data: {
        studentId,
        badgeType: type,
        verifyCode: generateVerifyCode()
      }
    });
  }
}
```

---

## Customization Options for 100-User Beta

### Option A: Keep Current 5 Badges
**Pros:**
- Already designed (emojis, colors, names)
- Simple to implement
- Proven engagement mechanic

**Cons:**
- May feel generic

### Option B: Customize Badge Themes
**Ideas:**
1. **Grade-based badges**
   - Grade 1-2: "Letter Legend" (A), "Sound Star" (B), etc.
   - Grade 3-5: "Story Scholar" (A), "Word Warrior" (B)
   - Grade 6-8: "Reader's Rise" (A), "Voice Virtuoso" (B)

2. **Speed-based badges**
   - 50 WPM: "Quick Reader"
   - 100 WPM: "Speed Demon"
   - 150 WPM: "Lightning Reader"

3. **Accuracy-based badges**
   - 70% accuracy: "Good Listener"
   - 85% accuracy: "Precision Pro"
   - 95% accuracy: "Perfect Reader"

4. **Streak-based badges**
   - 7-day streak: "Weekly Warrior"
   - 30-day streak: "Monthly Master"

### Option C: Achievement Milestones
**Examples:**
- 1 session: "Spark"
- 5 sessions: "Reader"
- 10 sessions: "Scholar"
- 25 sessions: "Expert"
- 50 sessions: "Master"

---

## Recommendation for Beta

**For the 100 warm users, I suggest:**

1. ✅ **Keep the 5 WizLingo badges** (Spark, Word Wizard, Voice Wizard, Language Wizard, Grand Wizard)
   - Familiar, already designed
   - Easy to track progress

2. ✅ **Add streak badges** (simple engagement driver)
   - 3-day streak: "Consistency Champion"
   - 7-day streak: "Weekly Wizard"

3. ✅ **Implement certificate sharing** (WhatsApp-first)
   - Students share badges on WhatsApp status
   - Parents see progress
   - Viral growth loop

4. ❌ **Skip PDF certificates for now** (MVP)
   - Add in v2 after beta
   - Focus on image badges (already have code)

---

## Questions for You

Before we build this, please clarify:

1. **Badge design** — Keep current 5, or customize?
2. **Certificate style** — What should it look like?
   - Edvanta branding?
   - School name (if applicable)?
   - QR code for verification?
3. **Sharing priority** — WhatsApp first, or also Instagram/Email?
4. **Streak badges** — Do you want them?
5. **Parent dashboard** — Should parents see badges earned?

Once you confirm, I'll build:
- Badge earning logic (API)
- Certificate generation
- Share buttons (WhatsApp integration)
- Parent dashboard view
