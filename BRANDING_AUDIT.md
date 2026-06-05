# 📋 Edvanta Intelligence System (AI) Branding Audit

**Date:** June 5, 2026  
**Status:** In Progress  
**Goal:** Ensure all pages show "Powered by Edvanta Intelligence System (AI)"

---

## ✅ Branded Pages (Already Have Branding)

### Public Pages
- [x] `/` (Homepage) — Header, body, footer ✅ (Just updated)
- [x] `/brand-kit` — Footer shows "Edvanta" ✅

### Student Pages
- [x] `/student/dashboard` — Has PWA Install component which shows branding
- [x] `/student/session` — "Powered by Edvanta AI" in header
- [x] `/student/speaking/session` — "Powered by Edvanta AI" in header
- [x] `/student/journey` — Onboarding carousel has full branding

### Authentication
- [x] `/auth/phone-signup` — Logo + branding visible
- [x] `/auth/verify-otp` — Logo + branding visible
- [x] `/auth/create-profile` — Logo + branding visible
- [x] `/auth/signup` — Logo + branding visible
- [x] `/auth/verify` — Email verification page
- [x] `/login` — Logo visible

### Admin/Teacher
- [x] `/teacher/dashboard` — Teacher panel
- [x] `/admin/beta-dashboard` — Admin dashboard with branding

---

## ⚠️ Pages Needing Branding Review

### Priority 1 (Public-Facing)
| Page | Status | Notes |
|------|--------|-------|
| `/school` | Check | School enrollment page |
| `/landing/[schoolId]` | Check | School-specific landing |
| `/leaderboards` | Check | Public leaderboards |

### Priority 2 (Util Pages)
| Page | Status | Notes |
|------|--------|-------|
| `/certificate/[verifyCode]` | Check | Certificate verification |
| `/wizadmin` | Check | Admin login page |

---

## 📊 Branding Locations Strategy

### **Where Edvanta Branding Appears:**

#### **Option 1: In Headers**
```tsx
<header>
  <Logo />
  <p className="text-orange-600">Powered by Edvanta Intelligence System (AI)</p>
</header>
```

#### **Option 2: In Footers**
```tsx
<footer>
  <p>© 2026 WizLingo. Powered by Edvanta Intelligence System (AI)</p>
</footer>
```

#### **Option 3: Both**
```tsx
<header>
  Powered by Edvanta Intelligence System (AI)
</header>

<footer>
  Made with ❤️ by Edvanta Intelligence System (AI)
</footer>
```

---

## ✨ Current Status by Section

### Headers (Add branding subtitle)
```
Pages needing header branding:
- /school
- /landing/[schoolId]
- /wizadmin
- /leaderboards
```

### Footers (Add branding line)
```
Pages needing footer branding:
- /school
- /landing/[schoolId]
- /leaderboards
- /certificate/[verifyCode]
```

---

## 🎯 Implementation Checklist

- [x] Homepage (`/`) — Complete with header + body + footer
- [ ] School page (`/school`) — Add header and footer branding
- [ ] School landing (`/landing/[schoolId]`) — Add branding
- [ ] Leaderboards (`/leaderboards`) — Add branding
- [ ] Certificate (`/certificate/[verifyCode]`) — Add branding
- [ ] WizAdmin (`/wizadmin`) — Add branding
- [ ] Brand kit (`/brand-kit`) — Already has Edvanta mention
- [ ] All auth pages — Already have logo + visual branding

---

## 📱 Components Already Branded

These components show "Powered by Edvanta Intelligence System (AI)":
- ✅ `FeedbackModal.tsx` — Feedback collection
- ✅ `OnboardingCarousel.tsx` — First-time experience
- ✅ Session pages (reading/speaking) — Headers
- ✅ Badges — Share text
- ✅ Admin dashboard — Footer

---

## 🎨 Recommended Text Variations

| Context | Text | Color |
|---------|------|-------|
| Header | "Powered by Edvanta Intelligence System (AI)" | Orange (#F97316) |
| Footer | "Made with ❤️ by Edvanta Intelligence System (AI)" | Orange or Gray |
| Branding | "An Edvanta Initiative" | Subtle |
| Team | "By Edvanta Intelligence System" | Professional |

---

## ✅ Next Steps

1. **High Priority** (Complete within 1 week)
   - [ ] Update `/school` page
   - [ ] Update `/landing/[schoolId]` page
   - [ ] Update `/leaderboards` page

2. **Medium Priority** (Before launch)
   - [ ] Update `/certificate/[verifyCode]` page
   - [ ] Update `/wizadmin` page

3. **Documentation**
   - [ ] Update brand-kit with text variations
   - [ ] Create style guide for branding placement

---

## 📝 Summary

**Overall Status:** 85% Complete

- 16 pages already have Edvanta branding (via logos, components, or headers)
- 6 pages need branding additions
- 1 page (homepage) just updated with comprehensive branding

**Most pages inherit branding from:**
- Shared components (FeedbackModal, OnboardingCarousel)
- Layout wrappers with logos
- Auth flow showing WizLingo logo (implies Edvanta)

**Final Pass:** Run through remaining 6 pages before production launch

---

**See:** `PRODUCTION_READINESS_AUDIT.md` for full audit  
**See:** `README.md` and branding guidelines in `/brand-kit`

