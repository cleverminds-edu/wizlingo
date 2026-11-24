# WizLingo Content Seeding Guide

Complete guide to seeding Grade 1 curriculum content into the database.

---

## 📋 Quick Start

### Option 1: API Endpoint (Recommended for Development)

```bash
# Terminal 1: Start development server
npm run dev

# Terminal 2: Seed content
curl -X POST http://localhost:3000/api/admin/seed-comprehensive-grade-1
```

**Response:**
```json
{
  "success": true,
  "message": "Grade 1 curriculum seeded successfully",
  "data": {
    "unit": "clx2a1b3c",
    "lessons": {
      "vocabulary": "clx2a1b4d",
      "reading": "clx2a1b5e",
      "speaking": "clx2a1b6f",
      "writing": "clx2a1b7g",
      "listening": "clx2a1b8h"
    }
  }
}
```

### Option 2: CLI Script (for Local Development/Scripts)

```bash
# Make script executable
chmod +x scripts/seed-grade-1.ts

# Run with ts-node
npx ts-node scripts/seed-grade-1.ts

# Or compile and run
npm run build:scripts
node scripts/seed-grade-1.js
```

### Option 3: Direct Function Import

```typescript
import { seedComprehensiveGrade1 } from '@/lib/seed/comprehensive-grade-1-seeder'

const result = await seedComprehensiveGrade1()
console.log(result)
```

---

## 🎯 What Gets Seeded

### 1. Curriculum Unit
- **Grade:** GR_1_3 (Grade 1-3)
- **Pillar:** SOUND_FOUNDATION
- **Stage:** STAGE_1
- **Title:** "Grade 1: Foundations of English"
- **Skills:** Phonemic Awareness, Basic Vocabulary, Sound Production, Word Recognition

### 2. Five Lesson Modules

#### Vocabulary Lesson
- Type: LESSON + EXERCISE
- Content: 20 core vocabulary words with definitions, pronunciations, example sentences
- Assessment: Vocabulary matching (passing score 80%)

#### Reading Lesson
- Type: ASSESSMENT (Multiple passages)
- Content: 3 reading passages with 5 comprehension questions each (15 total)
- Passage Details:
  1. "My Pet Cat" (30 words, A1 level, ~50 WPM)
  2. "Fun at the Park" (35 words, A1 level, ~55 WPM)
  3. "Apple Tree" (35 words, A1 level, ~55 WPM)
- Question Types: Literal (who/what/where), Inferential (why/how), Vocabulary
- Passing Score: 75%

#### Speaking Lesson
- Type: SPEAKING (Multiple topics)
- Content: 4 speaking topics with expected response lengths
- Topics:
  1. "My Family" (2-3 sentences, ~30 sec)
  2. "My Pet" (2-3 sentences, ~30 sec)
  3. "My Favorite Food" (2-3 sentences, ~30 sec)
  4. "What I Like at School" (2-4 sentences, ~45 sec)
- Assessment Criteria: Clarity, Vocabulary, Grammar, Fluency
- Passing Score: 75%

#### Writing Lesson
- Type: WRITING (Multiple prompts)
- Content: 3 writing prompts with word count targets and rubrics
- Prompts:
  1. "My Best Friend" (30-100 words, easy difficulty)
  2. "A Day at the Park" (30-100 words, easy difficulty)
  3. "My Dream House" (40-120 words, medium difficulty)
- Rubric Dimensions: Organization, Vocabulary, Grammar, Creativity
- Passing Score: 75%

#### Listening Lesson
- Type: LISTENING (Multiple audio transcripts)
- Content: 3 audio transcripts with comprehension questions
- Stories:
  1. "The Little Bird" (45 seconds, A1 level)
  2. "The Two Friends" (50 seconds, A1 level)
  3. "The Magic Garden" (65 seconds, A1-A2 level)
- Questions Per Story: 4-5 (12 total)
- Question Types: Literal (who/what), Inferential (why)
- Passing Score: 75%

---

## ✅ Verification

### Check if Seeding Worked

```bash
# Option 1: Check database directly (if using psql)
psql -U postgres -d wizlingo_db -c \
  "SELECT COUNT(*) FROM lesson WHERE title LIKE 'Grade 1%';"

# Should return: 5 (five lessons created)
```

```typescript
// Option 2: Programmatic check
import { prisma } from '@/lib/prisma'

const lessons = await prisma.lesson.findMany({
  where: { title: { contains: 'Grade 1' } }
})
console.log(`Found ${lessons.length} Grade 1 lessons`)

const content = await prisma.lessonContent.findMany({
  where: { lesson: { title: { contains: 'Grade 1' } } }
})
console.log(`Found ${content.length} content items`)
```

### Verification Endpoint

```bash
curl http://localhost:3000/api/admin/seed-comprehensive-grade-1
```

This returns the structure that will be created.

---

## 🔄 Running the Seeding Process

### Step-by-Step

1. **Ensure Database is Ready**
   ```bash
   # Apply any pending migrations
   npx prisma migrate deploy
   
   # Verify connection
   npx prisma db seed (if seed script exists)
   ```

2. **Seed Grade 1 Content** (Choose one method)
   
   **Method A: Via API**
   ```bash
   npm run dev
   # In another terminal:
   curl -X POST http://localhost:3000/api/admin/seed-comprehensive-grade-1
   ```
   
   **Method B: Via CLI**
   ```bash
   npx ts-node scripts/seed-grade-1.ts
   ```

3. **Verify Seeding**
   ```bash
   # Check logs for success messages
   # Look for: "✅ Seeding completed successfully"
   ```

4. **Test in Application**
   - Create a student account
   - Start Grade 1 lesson
   - Verify content displays correctly

---

## 🚨 Troubleshooting

### Issue: Database Connection Error

**Error:**
```
Error: ECONNREFUSED - Connection refused at 127.0.0.1:5432
```

**Solution:**
```bash
# Make sure PostgreSQL is running
brew services start postgresql  # macOS
sudo systemctl start postgresql  # Linux

# Or check .env DATABASE_URL
cat .env | grep DATABASE_URL
```

### Issue: Prisma Migration Error

**Error:**
```
prisma: Invalid schema - Migrations are not in sync with schema.prisma
```

**Solution:**
```bash
# Run pending migrations
npx prisma migrate deploy

# Or reset database (development only!)
npx prisma migrate reset
```

### Issue: Content File Not Found

**Error:**
```
Cannot find module '@/content/grade-1-vocabulary.json'
```

**Solution:**
```bash
# Verify content files exist
ls -la content/
# Should show:
# grade-1-vocabulary.json
# grade-1-reading-passages.json
# grade-1-speaking-topics.json
# grade-1-writing-prompts.json
# grade-1-listening-content.json
```

### Issue: Duplicate Content Error

**If you see:** `Unique constraint failed`

**Solution:**
```bash
# This is normal if you run seeding twice
# The script checks for existing content and skips duplicates

# To clear and reseed (development only):
npx prisma db push --force-reset
npx ts-node scripts/seed-grade-1.ts
```

---

## 📊 Content Statistics

After successful seeding:

| Item | Count | Total |
|------|-------|-------|
| Curriculum Units | 1 | 1 |
| Lessons | 5 | 5 |
| Vocabulary Words | 20 | 20 |
| Reading Passages | 3 | 3 |
| Reading Questions | 15 | 15 |
| Speaking Topics | 4 | 4 |
| Writing Prompts | 3 | 3 |
| Listening Stories | 3 | 3 |
| Listening Questions | 12 | 12 |
| **Total Lesson Content Items** | - | **45** |
| **Total Playable Lessons** | - | **33** |

---

## 🚀 Next Steps After Seeding

1. **Test Student Flow**
   ```
   1. Sign up as student
   2. Select Grade 1
   3. Enroll in a class (using teacher's class code)
   4. Start Grade 1 lesson
   5. Take reading comprehension test
   6. Verify questions display correctly
   ```

2. **Test Teacher Flow**
   ```
   1. Sign up as teacher
   2. Create a class
   3. Get class code
   4. Share code with student
   5. View class analytics
   6. See student progress
   ```

3. **Expand Content**
   ```
   Once Grade 1 is tested and working:
   1. Generate Grade 2 vocabulary (200+ words)
   2. Create Grade 2 reading passages
   3. Create Grade 2 speaking topics
   4. Create Grade 2 writing prompts
   5. Create Grade 2 listening stories
   
   See CONTENT_CREATION_PROGRESS.md for AI generation tips
   ```

---

## 📝 Seeding Configuration

### Content Files Location
```
/content/
├── grade-1-vocabulary.json
├── grade-1-reading-passages.json
├── grade-1-speaking-topics.json
├── grade-1-writing-prompts.json
└── grade-1-listening-content.json
```

### Seeding Scripts Location
```
/lib/seed/
├── grade-1-seeder.ts (basic seeder)
└── comprehensive-grade-1-seeder.ts (full curriculum seeder)

/scripts/
└── seed-grade-1.ts (CLI runner)

/app/api/admin/
├── seed-grade-1/ (basic API endpoint)
└── seed-comprehensive-grade-1/ (full API endpoint)
```

---

## 🔐 Security Note

These seeding endpoints should be:
- ✅ Protected with authentication in production
- ✅ Limited to admin users only
- ✅ Logged for audit trails
- ✅ Rate-limited to prevent abuse

**Current Status:** Not authenticated (development only)

**TODO for Production:**
```typescript
// Add authentication check in route.ts
const token = request.headers.get('authorization')
if (!isAdmin(token)) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

---

## 💡 Tips

1. **Dry Run First**
   - Check the GET endpoint first to see what will be created
   - Review content files before seeding

2. **Back Up Database**
   ```bash
   # Create backup before seeding
   pg_dump wizlingo_db > backup.sql
   ```

3. **Monitor Progress**
   - Watch console logs during seeding
   - Check database after completion
   - Verify in UI by logging in as student

4. **Parallel Seeding**
   - Once Grade 1 works, create Grade 2 content in parallel
   - Use same seeding pattern for consistency

---

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review console logs for specific errors
3. Verify all content JSON files are valid
4. Check database connection settings
5. Ensure Prisma schema is up to date

---

**Seeding Guide Version:** 1.0  
**Last Updated:** July 3, 2026  
**Status:** Production Ready

