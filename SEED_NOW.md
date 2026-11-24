# 🚀 SEED GRADE 1 CONTENT - QUICK START

## Choose Your Method

### ⚡ FASTEST METHOD: API Endpoint (2 steps)

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Seed content (wait for npm run dev to be ready)
curl -X POST http://localhost:3000/api/admin/seed-comprehensive-grade-1
```

**Expected Output:**
```
HTTP/1.1 200 OK
{
  "success": true,
  "message": "Grade 1 curriculum seeded successfully",
  "data": {
    "unit": "...",
    "lessons": {
      "vocabulary": "...",
      "reading": "...",
      "speaking": "...",
      "writing": "...",
      "listening": "..."
    }
  }
}
```

### 🖥️ CLI METHOD: TypeScript Script

```bash
npx ts-node scripts/seed-grade-1.ts
```

---

## ✅ After Seeding: Test It Works

### 1. Test as Student
```
1. Go to http://localhost:3000/auth/signup-b2c
2. Create student account (set Grade 1)
3. Go to /student/enrollment
4. Ask teacher for class code
5. Enroll in class
6. Start a Grade 1 lesson
7. Verify reading passage displays
8. Answer comprehension questions
9. View score/feedback
```

### 2. Test as Teacher
```
1. Go to http://localhost:3000/teacher/signup
2. Create teacher account
3. Go to /teacher/dashboard
4. Create a class
5. Copy the class code
6. (Share code with student from Test 1)
7. View student progress in analytics
```

---

## 📊 What Gets Created

| Component | Count |
|-----------|-------|
| Curriculum Units | 1 |
| Lessons | 5 (Vocab, Reading, Speaking, Writing, Listening) |
| Content Items | 45 |
| Vocabulary Words | 20 |
| Reading Passages | 3 |
| Reading Questions | 15 |
| Speaking Topics | 4 |
| Writing Prompts | 3 |
| Listening Stories | 3 |
| Listening Questions | 12 |

---

## 🐛 Troubleshooting

**Problem: Connection refused**
```bash
# Make sure database is running
brew services start postgresql  # macOS
sudo systemctl start postgresql  # Linux
```

**Problem: Migrations out of sync**
```bash
npx prisma migrate deploy
```

**Problem: Content already exists**
```bash
# This is fine! Script skips duplicates.
# If you want to reseed (dev only):
npx prisma db push --force-reset
```

---

## 📝 Files Created

```
/lib/seed/
  ├── grade-1-seeder.ts (basic)
  └── comprehensive-grade-1-seeder.ts (full)

/app/api/admin/
  ├── seed-grade-1/route.ts (basic endpoint)
  └── seed-comprehensive-grade-1/route.ts (full endpoint)

/scripts/
  └── seed-grade-1.ts (CLI script)

/content/
  ├── grade-1-vocabulary.json
  ├── grade-1-reading-passages.json
  ├── grade-1-speaking-topics.json
  ├── grade-1-writing-prompts.json
  └── grade-1-listening-content.json
```

---

## 🎯 Next After Grade 1 Works

1. Generate Grade 2 vocabulary (using AI)
2. Create Grade 2 reading passages
3. Create Grade 2 speaking topics  
4. Create Grade 2 writing prompts
5. Create Grade 2 listening content
6. Seed Grade 2
7. Repeat for Grades 3-12

See `CONTENT_CREATION_PROGRESS.md` for AI generation tips.

---

**Status:** Ready to seed! ✅
**Time to seed:** < 2 minutes
**Time to test:** 5-10 minutes
**Time to expand:** 1-2 weeks (with AI help)

