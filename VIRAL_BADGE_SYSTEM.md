# WizLingo Viral Badge System 🚀

Complete implementation of the viral badge & certificate system for the 100-user beta.

---

## System Overview

### Files Created

1. **`lib/badge-system.ts`** (450 lines)
   - Badge configurations & requirements
   - Earning logic (`checkAndAwardBadges()`)
   - Streak tracking system
   - Badge info getters

2. **`lib/certificate-generator.ts`** (280 lines)
   - Certificate image generation (1080×1350 Instagram Stories format)
   - Square badge image generation (1080×1080 for posts)
   - QR code verification
   - S3 upload integration (TODO)

3. **`app/api/badges/[studentId]/[badgeType]/share/route.ts`** (120 lines)
   - POST endpoint to generate shareable content
   - WhatsApp share URL generation
   - Native sharing metadata (Instagram, email)
   - Growth tracking analytics

4. **`components/badges/BadgeShareModal.tsx`** (200 lines)
   - Beautiful share modal UI
   - WhatsApp + Instagram + Email share buttons
   - Certificate preview
   - Verification link copy

5. **`components/badges/ModernBadgeDisplay.tsx`** (350 lines)
   - Modern, Apple Fitness-inspired badge cards
   - Glass-morphism effects
   - Animated emoji icons
   - Progress visualization for next badges
   - Grand Wizard celebration screen

---

## Badge System (5 Core Badges)

### 1. ✨ **SPARK** (Entry Badge)
- **Requirement:** Complete 1 reading session
- **Why:** Onboarding engagement, lowering barrier to entry
- **Viral Loop:** "Just started my reading journey!" → Friends curious → Sign up

### 2. 📚 **WORD WIZARD** (Accuracy Badge)
- **Requirement:** Achieve 80%+ accuracy in reading
- **Why:** Drives precision in comprehension
- **Viral Loop:** "I mastered reading accuracy!" → Competitive peer pressure → Others strive for it

### 3. 🎤 **VOICE WIZARD** (Fluency Badge)
- **Requirement:** Achieve 75%+ fluency in speaking
- **Why:** AI-validated speaking improvement
- **Viral Loop:** "I'm fluent in English!" → Parents proud → Tell relatives → More signups

### 4. 🧙 **LANGUAGE WIZARD** (Commitment Badge)
- **Requirement:** Complete 10+ sessions (reading + speaking)
- **Why:** Sustained engagement, habit formation
- **Viral Loop:** "10 sessions completed!" → Momentum → Friends join to compete

### 5. 👑 **GRAND WIZARD** (Ultimate Badge)
- **Requirement:** Earn all 4 badges above
- **Why:** Ultimate goal, celebration moment
- **Viral Loop:** "I'm a Grand Wizard!" → Bragging rights → Parents share → Extended network joins

---

## Bonus: Streak Badges 🔥

**Not yet implemented, but designed for v1.1:**

- 🔥 **7-Day Warrior** (7 consecutive days of use)
- ⚡ **14-Day Champion** (14 consecutive days)
- 💎 **30-Day Master** (30 consecutive days)

Each drives **daily habit formation** → **sustained engagement** → **increased retention**.

---

## Certificate System

### What Gets Generated

For each badge earned:

1. **Certificate Image** (1080×1350 PNG)
   - Vertical format for Instagram Stories
   - Student name + badge emoji
   - Date earned
   - QR code for verification
   - Edvanta + WizLingo branding
   - Unique verification code

2. **Square Badge Image** (1080×1080 PNG)
   - For Instagram feed posts
   - Student name + badge
   - Shareable social media format

3. **Verification Link**
   - Public verification page: `wiziingo.app/verify/{verifyCode}`
   - Parents can verify badge authenticity
   - Builds trust

### Example Certificate

```
┌──────────────────────────────────────┐
│          ✨ SPARK ✨                  │
│                                       │
│   Certificate of Achievement          │
│                                       │
│   Presented to:                       │
│   Rahul Sharma                        │
│                                       │
│   for earning the SPARK badge         │
│                                       │
│   Issued: June 2, 2026                │
│                                       │
│        [QR CODE HERE]                 │
│   Verify: VERIFY-ABC-123              │
│                                       │
│   WizLingo | Powered by Edvanta      │
└──────────────────────────────────────┘
```

---

## Viral Share Flows

### Flow 1: WhatsApp (Highest Conversion)
```
Student earns badge
  ↓
[🎉 Share Badge] button appears
  ↓
Taps "Share to WhatsApp"
  ↓
Pre-filled message:
  "I just earned the WORD WIZARD badge! 📚
   80%+ reading accuracy unlocked.
   Join WizLingo → https://wiziingo.app/join?ref=rahul"
  ↓
Sent to 10-20 contacts (conservative estimate)
  ↓
Each friend sees message + badge image
  ↓
Click link → Sign up with referrer tracking
```

**Expected Conversion:** 2-5% of friends per badge share = 5-15 new users per badge × 5 badges = 25-75 new users per student

### Flow 2: Instagram Story (Peer Pressure)
```
Student shares to Instagram Story
  ↓
Story includes:
  - Square badge image (1080×1080)
  - Caption: "I'm a WORD WIZARD on WizLingo!"
  ↓
Friends see story
  ↓
Link in story → Sign up
```

**Expected Conversion:** Lower (5-10x less than WhatsApp), but wider reach

### Flow 3: Email (Parents)
```
Student earns badge
  ↓
Parent gets email:
  "Your child earned the WORD WIZARD badge! 🎉
   View certificate: https://wiziingo.app/verify/{code}"
  ↓
Parent clicks → Sees beautiful certificate
  ↓
Parent shares with extended family/WhatsApp groups
  ↓
Extended network signs up
```

**Expected Conversion:** High (parents are proud, share enthusiastically)

---

## Growth Tracking

### Analytics Captured

```typescript
// Each share tracks:
{
  studentId: "rahul@gmail.com",
  event: "badge_shared",
  method: "whatsapp",  // or "instagram", "email", "link"
  platform: "web",
  timestamp: "2026-06-02T14:22:00Z"
}

// Then track conversions:
{
  referrerId: "rahul@gmail.com",
  referrerBadge: "WORD_WIZARD",
  newStudentId: "friend@gmail.com",
  method: "whatsapp",
  conversionTime: "15 min"  // How long after share
}
```

### Metrics Dashboard (Build in Week 5)

```
Total Badges Earned:        342
Total Shares:               218
Share-to-Signup Conversion: 12.4%

By Method:
- WhatsApp:   168 shares → 24 signups (14.3%)
- Instagram:  32 shares → 3 signups (9.4%)
- Email:      18 shares → 3 signups (16.7%)

Top Referrers:
1. Rahul (5 signups from WORD_WIZARD)
2. Priya (3 signups from SPARK)
3. Amit (2 signups from VOICE_WIZARD)
```

---

## Implementation Checklist for Beta

- [x] Badge system logic (5 core badges)
- [x] Certificate image generation (1080×1350 + 1080×1080)
- [x] Share URL generation (WhatsApp + native sharing)
- [x] Modern UI components (Apple Fitness-inspired)
- [ ] S3 image upload integration
- [ ] Email notifications for parents
- [ ] Verification page (`/verify/{code}`)
- [ ] Analytics dashboard
- [ ] Referral tracking (`?ref=studentId`)
- [ ] Leaderboard (top sharers)
- [ ] Streak badges (v1.1)

---

## UI Components (Modern Design)

### Badge Card (Earned)
- Glass-morphism effect (backdrop blur + translucent)
- Large emoji icon (animated on hover)
- Badge name + description
- Share button appears on hover
- Smooth color transitions

### Badge Card (Next)
- Locked appearance (muted colors)
- Dashed border
- Requirement text
- "Keep Going to Unlock" badge

### Grand Wizard Card
- Gold/orange gradient background
- Animated crown emoji
- Celebration message
- Confetti emojis

---

## Expected Growth Impact (100 Students)

### Conservative Estimate
- 100 students × 3 badges earned avg = 300 badge shares
- 300 shares × 5% conversion = **15 new signups**
- 15 new students × 3 badges = 45 more shares
- 45 shares × 5% = **2 more signups**

**Net growth from viral loop:** 15-20 new users

### Optimistic Estimate
- 100 students × 4 badges = 400 badge shares
- 400 shares × 15% conversion (WhatsApp is powerful) = **60 new signups**
- 60 new × 3.5 badges = 210 more shares
- 210 × 15% = **31 more signups**

**Net growth from viral loop:** 60-90 new users (60-90% growth in 8 weeks)

---

## Next Steps (Week 4-5 of Beta)

1. **Deploy certificates to S3** (or use local storage for MVP)
2. **Implement verification page** (`/api/certificates/verify/[code]`)
3. **Add parent email notifications**
4. **Track referrals** (add `?ref=studentId` to signup URL)
5. **Build referral dashboard** (show who referred you)
6. **Monitor metrics daily** during beta

---

## Technical Notes

### Certificate Generation
- Uses `canvas` library for image rendering
- QR code via `qrcode` npm package
- S3 integration TODO (use AWS SDK)
- For MVP: Save to `/public/badges/[studentId]/[badgeType].png`

### Share Flows
- **WhatsApp:** Uses `https://wa.me/?text=` URL (works on mobile + desktop)
- **Instagram:** Uses `navigator.share()` native API (iOS + some Android)
- **Email:** Generated in email notification system

### Growth Tracking
- Log all share events to Analytics table
- Track conversion via referral code in signup
- Dashboard aggregates daily

---

## Design Philosophy

**"Make sharing more rewarding than earning."**

The badges themselves are nice, but sharing them is the viral engine. Every badge earned = 10-20 potential new users if the share experience is smooth, beautiful, and rewarding.

- 🎨 Beautiful certificate images (worth sharing)
- 🚀 One-tap WhatsApp sharing (frictionless)
- 📸 Instagram Stories ready (peer pressure)
- 👨‍👩‍👧‍👦 Parent notifications (family network)
- 🎯 Referral tracking (gamify growth)

---

## Success Criteria

By end of 8-week beta:

- ✅ 80%+ of badge earners share at least 1 badge
- ✅ 10%+ share-to-signup conversion (WhatsApp)
- ✅ 20%+ of new signups come from referrals
- ✅ 50+ cumulative new users from viral loop

If these are hit, the system is working. Ready to scale to 1000+ schools.
