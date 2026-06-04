# WizLingo: AI-Powered English Learning Platform for Schools

**An intelligent reading & speaking practice app powered by Anthropic Claude AI**

![WizLingo Badge](public/wiziingo-logo.svg)

---

## 🎯 What is WizLingo?

WizLingo is an adaptive AI-powered platform designed for Indian school students (grades 6-12) to improve English proficiency through:

- **Reading Practice:** AI-generated passages with instant feedback on accuracy & speed
- **Speaking Practice:** Conversations with AI characters with fluency & pronunciation scoring  
- **Adaptive Learning:** Difficulty adjusts based on student performance (3 levels)
- **Gamification:** 5 achievement badges to motivate consistent learning
- **Progress Tracking:** Real-time dashboards for students, teachers, and parents
- **School Integration:** B2B platform for schools to monitor cohorts of 100-150 students

**Live Demo:** https://wizlingo.app  
**Admin Dashboard:** https://wizlingo.app/admin/beta-dashboard  
**Status:** Beta (100-150 students across 1-2 schools)

---

## 📋 Quick Reference

| Aspect | Details |
|--------|---------|
| **Tech Stack** | Next.js 16.2, React 19, TypeScript, Prisma ORM, PostgreSQL |
| **Database** | PostgreSQL 15+ with 32 models |
| **AI Provider** | Anthropic Claude API |
| **Auth** | Phone OTP (Indian phone numbers) |
| **Deployment** | Railway (recommended) or AWS |
| **Build Status** | ✅ Passing (0 errors, 71 pages) |
| **Test Coverage** | 237 test files available |
| **Node Version** | >=18.0.0 |

---

## 🚀 Getting Started

### Prerequisites

```bash
# Check versions
node --version    # >= 18.0.0
npm --version     # >= 9.0.0
postgres --version # >= 15
```

### Local Setup (5 minutes)

**1. Clone Repository**
```bash
git clone https://github.com/edvanta/reading-app.git
cd reading-app
```

**2. Install Dependencies**
```bash
npm install
```

**3. Setup Environment Variables**
```bash
# Copy template
cp .env.local.example .env.local

# Edit .env.local with your values:
# - NEXT_PUBLIC_APP_URL=http://localhost:3000
# - DATABASE_URL=postgresql://user:pass@localhost:5432/wizlingo
# - JWT_SECRET=generate-with: openssl rand -base64 32
# - ANTHROPIC_API_KEY=sk-... (get from https://console.anthropic.com)
# - WIZADMIN_SECRET=any-random-string
```

**4. Setup Database**
```bash
# Create database
createdb wizlingo

# Run migrations
npx prisma migrate deploy

# Seed demo data (optional)
npx prisma db seed
```

**5. Start Development Server**
```bash
npm run dev
```

**6. Open Browser**
- Student App: http://localhost:3000
- Admin: http://localhost:3000/admin/beta-dashboard
- API Health: http://localhost:3000/api/health

---

## 📁 Project Structure

```
reading-app/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes (60+ endpoints)
│   │   ├── auth/                 # Phone OTP authentication
│   │   ├── feedback/             # Beta feedback collection
│   │   ├── health/               # Deployment health checks
│   │   ├── sessions/             # Reading/speaking sessions
│   │   └── admin/                # Admin analytics dashboard
│   ├── student/                  # Student pages (reading, speaking, dashboard)
│   ├── teacher/                  # Teacher pages
│   ├── admin/                    # Admin pages
│   └── auth/                     # Auth pages (login, signup, OTP)
│
├── components/                   # React components
│   ├── FeedbackModal.tsx         # Feedback collection (new)
│   ├── OnboardingCarousel.tsx    # First-time student experience (new)
│   ├── badges/                   # Badge display & celebration
│   └── ...
│
├── lib/                          # Utilities & helpers
│   ├── prisma.ts                 # Prisma client singleton
│   ├── rate-limit.ts             # Rate limiting middleware (new)
│   ├── validation.ts             # Zod validation schemas (new)
│   ├── app-url.ts                # Centralized URL helper (new)
│   ├── ai-feedback.ts            # Claude AI integration
│   └── ...
│
├── prisma/                       # Database schema & migrations
│   ├── schema.prisma             # 32 models, latest migrations
│   └── migrations/               # Database migration history
│
├── public/                       # Static assets
│   ├── wiziingo-logo.svg         # Brand logo
│   └── badges/                   # Badge SVG files
│
├── tests/                        # Test suites
│   └── (237 test files)
│
├── .github/workflows/            # CI/CD pipelines (new)
│   ├── test.yml                  # Run tests on push
│   ├── lint.yml                  # Lint code
│   └── build.yml                 # Verify build
│
├── Dockerfile                    # Container setup (new)
├── .dockerignore                 # Docker build optimization
├── SECURITY_FIXES.md             # Security audit & fixes
├── DEPLOYMENT.md                 # Railway & AWS deployment
├── PRODUCTION_READINESS_AUDIT.md # Full readiness audit
└── README.md                     # This file
```

---

## 🔑 Key Features

### For Students
- ✅ 5-minute daily reading/speaking sessions
- ✅ Adaptive difficulty (3 levels)
- ✅ AI-powered instant feedback
- ✅ 5 badges to earn
- ✅ Personal dashboard with progress
- ✅ WPM & accuracy tracking

### For Teachers
- ✅ Class performance dashboard
- ✅ Student progress tracking
- ✅ Session reports
- ✅ Custom class management

### For Schools
- ✅ Cohort analytics dashboard
- ✅ Behavior learning metrics
- ✅ Parent engagement reports
- ✅ School-wide leaderboards
- ✅ Custom branding options

### For Admins
- ✅ Real-time beta dashboard (`/admin/beta-dashboard`)
- ✅ Feedback analysis
- ✅ Student activity monitoring
- ✅ Issue tracking & resolution

---

## 🧪 Testing

### Run Tests
```bash
# All tests
npm run test

# With coverage
npm run test:coverage

# Watch mode (development)
npm run test:watch

# Specific file
npm run test -- session.test.ts
```

### Test Coverage Target
- **Current:** 237 test files available
- **Target:** >70% code coverage
- **CI/CD:** Tests run on every push via GitHub Actions

---

## 🔐 Security

All critical security issues fixed:

✅ **Rate Limiting**
- OTP: 5 requests / 15 min (prevents brute force)
- Feedback: 50 requests / hour (prevents spam)
- Login: 10 requests / 15 min

✅ **Input Validation**
- All 60+ API endpoints validate request bodies with Zod
- Phone number format validation
- UUID validation for all IDs
- Content length limits

✅ **Authentication**
- Phone OTP flow (Indian format)
- Session-based auth with JWT
- Role-based access control (Student/Teacher/Admin)

✅ **Database**
- Prisma ORM (prevents SQL injection)
- Parameterized queries
- Encrypted sensitive fields

See [SECURITY_FIXES.md](SECURITY_FIXES.md) for full security audit.

---

## 📦 Deployment

### Railway (Recommended for Schools)
```bash
# 1. Push to GitHub
git push origin main

# 2. Railway auto-deploys
# 3. Verify health: curl https://app.railway.app/api/health
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Step-by-step Railway setup
- AWS ECS deployment
- Docker local testing
- Monitoring & logs
- Troubleshooting guide

---

## 🔄 CI/CD Pipeline

Automated workflows run on every push:

| Workflow | Trigger | What it does |
|----------|---------|-------------|
| `test.yml` | push/PR | Runs test suite with coverage |
| `lint.yml` | push/PR | ESLint + TypeScript + security check |
| `build.yml` | push/PR | Builds Next.js app, checks size |

**View Status:** GitHub → Actions tab

---

## 📊 API Documentation

### Key Endpoints

#### Authentication
```
POST /api/auth/send-otp           → Send OTP to phone
POST /api/auth/verify-otp         → Verify OTP, get session
GET  /api/auth/me                 → Current student info
```

#### Sessions
```
POST /api/sessions/reading        → Start reading session
POST /api/sessions/reading/[id]   → Complete reading session
POST /api/sessions/speaking       → Start speaking session
POST /api/sessions/speaking/[id]  → Complete speaking session
```

#### Feedback & Analytics
```
POST /api/feedback                → Submit session feedback
GET  /api/progress/[studentId]    → Student progress
GET  /api/admin/beta/stats        → Real-time beta stats
GET  /api/admin/beta/feedback     → Feedback analysis
GET  /api/admin/beta/daily-active → Daily active users
```

#### Health
```
GET /api/health                   → Server health check
```

Full API documentation: See inline JSDoc comments in `app/api/**/*.ts`

---

## 🛠️ Development Workflow

### Making Changes

**1. Create feature branch**
```bash
git checkout -b feature/your-feature-name
```

**2. Make changes & test**
```bash
npm run dev              # Start dev server
npm run test            # Run tests
npm run lint            # Check code quality
```

**3. Verify build**
```bash
npm run build           # Should complete with 0 errors
```

**4. Commit & push**
```bash
git add .
git commit -m "meaningful message"
git push origin feature/your-feature-name
```

**5. Create pull request**
- GitHub will auto-run CI/CD checks
- Merge when all checks pass

### Code Style
- **Language:** TypeScript strict mode
- **Formatter:** Prettier (auto on save)
- **Linter:** ESLint
- **Naming:** camelCase for variables, PascalCase for components

---

## 🐛 Debugging

### Common Issues

**Port 3000 already in use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

**Database connection failed**
```bash
# Test connection
psql $DATABASE_URL

# Check .env.local has correct URL
# Verify PostgreSQL is running
# Check firewall/security groups
```

**Prisma schema out of sync**
```bash
# Regenerate Prisma client
npx prisma generate

# Reset database (CAREFUL - deletes data)
npx prisma migrate reset
```

**Build fails with TypeScript errors**
```bash
# Run type checker
npx tsc --noEmit

# Fix errors shown, then rebuild
npm run build
```

### Enable Debug Logging

```bash
# Set debug environment variable
DEBUG=* npm run dev

# Or for specific modules
DEBUG=prisma:* npm run dev
```

---

## 📚 Learning Resources

- **Next.js Guide:** See `AGENTS.md` for Next.js 16 breaking changes
- **Prisma ORM:** https://www.prisma.io/docs
- **TypeScript:** https://www.typescriptlang.org/docs
- **React 19:** https://react.dev
- **Anthropic Claude API:** https://docs.anthropic.com

---

## 🤝 Contributing

1. **Read guidelines:** See CLAUDE.md and AGENTS.md
2. **Pick an issue:** GitHub Issues
3. **Create branch:** `git checkout -b feature/your-feature`
4. **Test & lint:** `npm run test && npm run lint`
5. **Push & PR:** Create pull request with clear description

**Code Standards:**
- ✅ TypeScript strict mode required
- ✅ All endpoints must validate input
- ✅ All endpoints must handle errors with try-catch
- ✅ Add JSDoc comments for non-obvious code
- ✅ No console.log in production code (use structured logging)

---

## 📄 License

Proprietary - Edvanta Intelligence System  
All rights reserved ©2026

---

## 📞 Support

- **Email:** support@edvanta.co.in
- **Status Page:** Monitor uptime at dashboard
- **Issue Tracker:** GitHub Issues
- **Deployment Help:** See DEPLOYMENT.md

---

## 🎉 Key Milestones

- ✅ **June 4, 2026:** Security fixes complete
- ✅ **June 7, 2026:** CI/CD pipeline + deployment ready
- 📅 **June 15, 2026:** First school goes live (100-150 students)
- 📅 **July 2026:** Onboard 2nd school, scale to 250 students
- 📅 **September 2026:** Public beta launch, B2C marketing

---

**Built with ❤️ by Edvanta Intelligence System**  
**Powered by Anthropic Claude AI**
