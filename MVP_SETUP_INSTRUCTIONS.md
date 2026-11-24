# MVP Week 1: Setup Instructions (TODAY)

**Status**: Task #39 IN PROGRESS  
**Time**: 1-2 hours to complete  
**Goal**: Database schema + local PostgreSQL running

---

## ✅ STEP 1: Backup Current Schema (5 min)

```bash
cd /Users/maddy/edvanta/reading-app

# Backup existing schema
cp prisma/schema.prisma prisma/schema.prisma.backup

echo "✅ Backup created: prisma/schema.prisma.backup"
```

---

## ✅ STEP 2: Replace with MVP Schema (1 min)

```bash
# Copy MVP schema over (I just created this above)
cp prisma/schema.prisma.mvp prisma/schema.prisma

echo "✅ Schema updated to MVP version"
```

---

## ✅ STEP 3: Install Required Dependencies (2 min)

```bash
npm install bcryptjs jsonwebtoken dotenv

echo "✅ Dependencies installed"
```

---

## ✅ STEP 4: Setup .env.local (2 min)

Create `.env.local` in project root:

```bash
cat > .env.local << 'EOF'
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/wizlingo_mvp"

# JWT Secret (change this in production!)
JWT_SECRET="your-super-secret-jwt-key-change-in-production-12345"

# Environment
NODE_ENV="development"
EOF

echo "✅ .env.local created"
```

**⚠️ Important**: Change `password` to your actual PostgreSQL password!

---

## ✅ STEP 5: Setup PostgreSQL Locally (5-10 min)

### **If you already have PostgreSQL installed:**

```bash
# Start PostgreSQL service
brew services start postgresql@15

# Create database
createdb wizlingo_mvp

# Verify connection
psql wizlingo_mvp -c "SELECT version();"

echo "✅ PostgreSQL database created"
```

### **If PostgreSQL is NOT installed:**

```bash
# Install PostgreSQL
brew install postgresql@15

# Start service
brew services start postgresql@15

# Wait a few seconds, then create database
sleep 3
createdb wizlingo_mvp

# Test connection
psql wizlingo_mvp -c "SELECT version();"

echo "✅ PostgreSQL installed and database created"
```

---

## ✅ STEP 6: Run Prisma Migration (5 min)

```bash
cd /Users/maddy/edvanta/reading-app

# Generate Prisma client
npx prisma generate

# Run migration
npx prisma migrate dev --name init

# You'll be prompted for a migration name, just press Enter for default

echo "✅ Prisma migration complete"
```

**What this does:**
- Creates all database tables based on schema
- Generates Prisma client
- Ready for queries

---

## ✅ STEP 7: Seed Test Data (2 min)

Create `prisma/seed.ts`:

```bash
cat > prisma/seed.ts << 'EOF'
import { PrismaClient } from './generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding test data...')

  // Create 5 test students
  for (let i = 1; i <= 5; i++) {
    const student = await prisma.student.create({
      data: {
        email: `student${i}@test.com`,
        name: `Test Student ${i}`,
        passwordHash: '$2b$10$test', // dummy hash
        currentLevel: 2,
        totalXP: Math.random() * 1000,
        streakDays: Math.random() * 30,
        progress: {
          create: {}
        }
      }
    })
    console.log(`✅ Created: ${student.name}`)
  }

  // Create 5 reading passages
  for (let i = 1; i <= 5; i++) {
    await prisma.readingPassage.create({
      data: {
        title: `Sample Reading ${i}`,
        content: `This is a test reading passage about topic ${i}. Students will read this and answer comprehension questions.`,
        wordCount: 50,
        level: 2,
        topic: 'Animals'
      }
    })
  }

  console.log('✅ Seeding complete')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
EOF

echo "✅ Seed file created"
```

Now run the seed:

```bash
npx prisma db seed

echo "✅ Test data seeded"
```

---

## ✅ STEP 8: Verify Setup (2 min)

```bash
# Launch Prisma Studio (GUI for database)
npx prisma studio

# This will open http://localhost:5555 in your browser
# You should see your Student table with 5 test records
# Keep this running or close it with Ctrl+C
```

**You should see:**
- ✅ 5 students in the Student table
- ✅ All fields populated (email, name, currentLevel, etc)
- ✅ StudentProgress linked to each student
- ✅ No errors

---

## ✅ STEP 9: Test Database Connection (2 min)

Create `test-db.js` and run it:

```bash
cat > test-db.js << 'EOF'
const { PrismaClient } = require('./app/generated/prisma');
const prisma = new PrismaClient();

async function test() {
  try {
    const students = await prisma.student.findMany();
    console.log('✅ Database connected!');
    console.log(`✅ Found ${students.length} students`);
    students.forEach(s => console.log(`  - ${s.name} (${s.email})`));
    process.exit(0);
  } catch (e) {
    console.error('❌ Database error:', e.message);
    process.exit(1);
  }
}

test();
EOF

node test-db.js
rm test-db.js

echo "✅ Database connection verified"
```

---

## 🎉 WEEK 1 DAY 1 COMPLETE!

If you got here without errors, you have:

✅ MVP Prisma schema  
✅ PostgreSQL database running locally  
✅ 5 test students in database  
✅ Prisma Studio GUI working  
✅ Database connection verified  

---

## 📋 Troubleshooting

### "Error: connect ECONNREFUSED 127.0.0.1:5432"
**Problem**: PostgreSQL not running  
**Fix**: `brew services start postgresql@15`

### "Error: database "wizlingo_mvp" does not exist"
**Problem**: Database wasn't created  
**Fix**: `createdb wizlingo_mvp`

### "Error: password authentication failed"
**Problem**: Wrong password in DATABASE_URL  
**Fix**: Check your PostgreSQL password with: `psql -U postgres`

### "Error: relation "Student" does not exist"
**Problem**: Migration didn't run  
**Fix**: `npx prisma migrate dev --name init`

---

## 🚀 NEXT STEP

Once you confirm this is working, say:

**"Database Ready - Build Auth"**

Then I'll generate the authentication endpoints (signup/login) for Task #40!

---

## 📊 Progress

```
Task #39: ✅ IN PROGRESS
├─ ✅ Backup schema
├─ ✅ Copy MVP schema
├─ ✅ Install dependencies
├─ ✅ Setup .env.local
├─ ✅ PostgreSQL setup
├─ ✅ Prisma migration
├─ ✅ Seed test data
├─ ✅ Verify setup
└─ ⏳ Awaiting confirmation
```

**Estimated Time**: 1-2 hours  
**Effort**: Easy (mostly copy-paste)  
**Difficulty**: Low (straightforward setup)

---

**Let me know when database is ready!** 🚀
