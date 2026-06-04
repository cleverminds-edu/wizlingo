# 🚀 Beta Distribution Strategy for Pilot Schools

**For 100-150 Students at 1-2 Schools**

---

## 🎯 Recommended Approach: PWA + Play Store Beta

| Method | Setup Time | Approval | Users | Best For |
|--------|-----------|----------|-------|----------|
| **PWA (Web App)** | 2 hours | None | All students | 🥇 Primary - Launch today |
| **Google Play Beta** | 4 hours | 1-3 days | Android students | Secondary - Week 2 |
| **iOS Web Clip** | 1 hour | None | iPad users | Fallback for iOS |
| **Direct Web Link** | 30 min | None | Teachers/Parents | Admin access |

---

## 🥇 Phase 1: PWA (Progressive Web App) - LAUNCH NOW

### What is PWA?

App-like experience without app stores:
- ✅ Install on home screen (looks like native app)
- ✅ Works offline (caching)
- ✅ Push notifications (optional)
- ✅ Fast loading
- ✅ Zero approval time
- ✅ Instant updates (no app store waiting)

### Perfect for Indian Schools Because:
- ✅ Works on Android phones + tablets + computers
- ✅ Works on low-end devices (uses less data)
- ✅ No need to convince parents to use Play Store
- ✅ Can update instantly without student reinstalling
- ✅ Works on iOS Safari (no App Store needed)

---

## Setup PWA (2 hours)

### Step 1: Create Web App Manifest

Create `public/manifest.json`:

```json
{
  "name": "WizLingo - English Learning Platform",
  "short_name": "WizLingo",
  "description": "AI-powered English reading & speaking practice for schools",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#ffffff",
  "theme_color": "#F97316",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-192x192-maskable.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-512x512-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/screenshot-540x720.png",
      "sizes": "540x720",
      "type": "image/png",
      "form_factor": "narrow"
    },
    {
      "src": "/screenshots/screenshot-1280x720.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    }
  ],
  "categories": ["education", "productivity"],
  "shortcuts": [
    {
      "name": "Reading Session",
      "short_name": "Read",
      "description": "Start a reading practice session",
      "url": "/student/session?mode=reading",
      "icons": [
        {
          "src": "/icons/reading-96x96.png",
          "sizes": "96x96",
          "type": "image/png"
        }
      ]
    },
    {
      "name": "Speaking Session",
      "short_name": "Speak",
      "description": "Start a speaking practice session",
      "url": "/student/session?mode=speaking",
      "icons": [
        {
          "src": "/icons/speaking-96x96.png",
          "sizes": "96x96",
          "type": "image/png"
        }
      ]
    },
    {
      "name": "Dashboard",
      "short_name": "Dashboard",
      "description": "View your progress",
      "url": "/student/dashboard",
      "icons": [
        {
          "src": "/icons/dashboard-96x96.png",
          "sizes": "96x96",
          "type": "image/png"
        }
      ]
    }
  ]
}
```

### Step 2: Update HTML Head

Add to `app/layout.tsx` or page header:

```tsx
<head>
  {/* PWA Meta Tags */}
  <meta name="theme-color" content="#F97316" />
  <meta name="description" content="AI-powered English learning platform for schools" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  
  {/* PWA Manifest */}
  <link rel="manifest" href="/manifest.json" />
  
  {/* Apple PWA (iOS) */}
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="WizLingo" />
  <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
  
  {/* Favicon */}
  <link rel="icon" type="image/svg+xml" href="/wiziingo-logo.svg" />
  <link rel="icon" type="image/png" href="/icons/icon-192x192.png" />
  
  {/* Status Bar */}
  <meta name="msapplication-TileColor" content="#F97316" />
  <meta name="msapplication-config" content="/browserconfig.xml" />
</head>
```

### Step 3: Register Service Worker

Create `public/sw.js`:

```javascript
const CACHE_NAME = 'wizlingo-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/wiziingo-logo.svg',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const cache = caches.open(CACHE_NAME);
        cache.then((c) => c.put(event.request, response.clone()));
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((response) => {
          return response || caches.match('/offline.html');
        });
      })
  );
});
```

Register in `app/layout.tsx`:

```tsx
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
}, []);
```

### Step 4: Create Icons

Generate PWA icons at these sizes:
- 192x192 (Android home screen)
- 512x512 (Splash screens)
- 192x192 maskable (for adaptive icons)
- 512x512 maskable

**Tools:**
- https://www.favicon-generator.org/
- https://pwabuilder.com/
- Figma (design + export)

### Step 5: Deploy

```bash
# Build
npm run build

# Deploy to Railway (from Phase 2)
git push origin main

# Test on phone
# 1. Open https://your-app.railway.app
# 2. Click menu → "Install app" (Android) or share → "Add to Home Screen" (iOS)
```

---

## 🥈 Phase 2: Google Play Store Beta (Week 2)

### Prerequisites

1. **Google Play Developer Account**
   - Cost: $25 (one-time)
   - Signup: https://play.google.com/console
   - Takes 24 hours to activate

2. **App Signing Certificate**
   - Generate: `keytool -genkey -v -keystore wizlingo.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias wizlingo`
   - **BACKUP THIS FILE** - Cannot regenerate

3. **App Bundle (AAB)**
   - Build from Next.js with EAS or Expo
   - Or use Capacitor: https://capacitorjs.com/

### Option A: Capacitor (Recommended)

**Install Capacitor:**
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init
```

**Build for Android:**
```bash
npm run build
npx cap add android
npx cap sync
npx cap open android
```

**In Android Studio:**
1. Build → Generate Signed Bundle/APK
2. Select Android App Bundle (AAB)
3. Choose wizlingo.keystore
4. Build

### Upload to Play Console

1. **Create App in Play Console:**
   - App name: WizLingo
   - Default language: English
   - App category: Education

2. **Setup Release Channel:**
   - Internal Testing (only team)
   - Closed Testing (specific testers)
   - Open Testing (public beta)
   - Production (live)

3. **For Beta Schools:**
   - Use "Closed Testing" track
   - Add teacher/admin emails
   - Creates Google Group link
   - Share link with schools

4. **Upload AAB:**
   - Content rating form (5 min)
   - Privacy policy (required)
   - Screenshots & description
   - Submit for review (1-3 days)

**Sample Store Listing:**
```
Title: WizLingo - English Learning
Short Description: AI-powered English reading & speaking practice

Full Description:
WizLingo is an intelligent learning platform that helps students master English through:
- Interactive reading sessions with AI feedback
- Real-time speaking practice with character conversations
- Adaptive difficulty that adjusts to your level
- Achievement badges to stay motivated
- Real-time progress tracking for teachers

Features:
✓ 5-minute daily sessions
✓ 3 difficulty levels (Beginner, Explorer, Champion)
✓ 5 achievement badges
✓ AI-powered feedback from Anthropic Claude
✓ Works offline
✓ Teacher dashboard
✓ Parent notifications

Perfect for schools looking to improve student English proficiency.

Beta Status: Limited availability for pilot schools
```

---

## 🍎 Phase 3: iOS App Store (Optional - After Android Success)

**Note:** iOS requires native Swift code. Two options:

### Option A: Capacitor + Swift UI
- Use Capacitor iOS
- Extend with native Swift if needed
- Same codebase for Android

### Option B: React Native
- Complete rewrite (not recommended for MVP)
- Better performance on iOS
- More native features

**For MVP:** Use Capacitor + PWA for iOS (users install from Safari).

---

## 📱 Distribution Methods Summary

### For Students
```
┌─────────────────────────────────────────┐
│  Student Receives Invite from School    │
└─────────────────────────────────────────┘
              ↓
    ┌─────────────────────┐
    │ Android (90% of     │
    │ Indian students)    │
    └─────────────────────┘
    ┌──────────┬──────────┐
    ↓          ↓          ↓
  Play Store  PWA    Web Link
  (Week 2)    (NOW)  (NOW)
    
    ┌─────────────────────┐
    │ iOS (10%, iPads)    │
    └─────────────────────┘
         ↓              ↓
       PWA         Web Link
       (NOW)        (NOW)
```

### For Teachers/Admins
```
Direct web link: https://wizlingo.app/admin/beta-dashboard
No app needed - just browser
```

---

## 🎯 Beta Testing Checklist

### Before Opening to Pilot Schools

- [ ] PWA works on Android phone
- [ ] PWA works on iPad/Safari
- [ ] Can install from home screen
- [ ] Offline mode works
- [ ] All features functional
- [ ] No console errors
- [ ] Database backups enabled
- [ ] Monitoring (Sentry) setup
- [ ] Error handling tested
- [ ] Rate limiting tested (don't break legitimate use)

### Pilot School Onboarding

**Week 1: 100-150 Students at School 1**
- [ ] Teachers trained on admin dashboard
- [ ] Sample students created
- [ ] Login test with OTP
- [ ] Feedback form tested
- [ ] Progress dashboard reviewed

**Week 2: Monitor & Iterate**
- [ ] Daily check of /admin/beta-dashboard
- [ ] Review student feedback
- [ ] Fix any bugs found
- [ ] Add to Play Store closed beta

**Week 3: School 2 Onboarding**
- [ ] Replicate setup for second school
- [ ] Monitor both schools
- [ ] Plan Play Store public beta

---

## 📊 Beta Metrics to Track

```
Daily Dashboard:
├─ Active students today
├─ Reading sessions completed
├─ Speaking sessions completed
├─ Average feedback rating
├─ Bugs reported
└─ Server uptime (should be 99.5%+)
```

---

## 🚨 Common Beta Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "App not installed" | APK missing sign | Use keystore for signing |
| Offline mode fails | SW cache expired | Clear browser cache |
| Can't login | Database offline | Check Railway dashboard |
| Slow performance | Too many students | Scale database tier |
| Rate limit errors | Testing rate limits | Whitelist school IPs |

---

## 📅 Timeline

| Date | Task | Owner | Status |
|------|------|-------|--------|
| Jun 7 | PWA launch | Dev | Start today ✅ |
| Jun 15 | School 1 pilot (100 students) | School | 📅 |
| Jun 21 | Play Store beta upload | Dev | 📅 |
| Jun 28 | School 2 pilot (50 students) | School | 📅 |
| Jul 5 | Play Store public beta | Dev | 📅 |
| Jul 15 | Production launch | Dev | 📅 |

---

## 💡 Recommendation

**For Maximum Impact with Pilot Schools:**

1. **Days 1-7:** PWA only
   - No approval delays
   - Easy to update
   - All features available
   - Can scale instantly

2. **Week 2:** Add Play Store closed beta
   - For students who prefer app store
   - Keep PWA as primary
   - No conflicts

3. **After Beta Success:** Public Play Store release
   - Proven user feedback
   - Stable platform
   - Ready for scale

---

## 📝 School Communication Template

```
Subject: WizLingo Beta Launch - Ready to Go Live 🚀

Hi [Principal Name],

Great news! WizLingo is ready for your students. Here's how to get started:

📱 Installation (2 min per student):

Android:
1. Google Play Store → Search "WizLingo"
2. Tap Install
3. Or: Open https://wizlingo.app and tap "Install app"

iOS/iPad:
1. Open https://wizlingo.app in Safari
2. Tap Share → Add to Home Screen
3. Tap Add

👨‍🏫 Teacher Dashboard:
- Login: https://wizlingo.app/teacher/dashboard
- Email: teacher@school.edu
- Password: [will be sent separately]

📊 Monitor Progress:
- See student sessions, accuracy, and engagement
- Real-time feedback from students
- Weekly progress reports

Questions? Reply to this email or call [phone]

Let's help your students master English! 🎓

Best regards,
WizLingo Team
```

---

**Ready to launch beta? Let's go!** 🚀

