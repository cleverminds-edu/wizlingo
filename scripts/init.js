#!/usr/bin/env node

const { spawnSync } = require('child_process');
const fs = require('fs');

// Load environment variables from .env.local if it exists
if (fs.existsSync('.env.local')) {
  require('dotenv').config({ path: '.env.local' });
}

const dbUrl = process.env.DATABASE_URL;

console.log('\n═══════════════════════════════════════════════════════════');
console.log('🚀 WizLingo Database Initialization');
console.log('═══════════════════════════════════════════════════════════\n');

if (!dbUrl) {
  console.log('⚠️  DATABASE_URL not set, skipping initialization\n');
  process.exit(0);
}

const dbDisplay = dbUrl.replace(/:[^@]*@/, ':***@');
console.log(`Database: ${dbDisplay}\n`);

let success = false;

// Step 1: Generate Prisma Client
console.log('1️⃣  Generating Prisma Client...');
try {
  const genResult = spawnSync('npx', ['prisma', 'generate'], {
    stdio: 'pipe',
    env: { ...process.env, DATABASE_URL: dbUrl }
  });

  if (genResult.status === 0) {
    console.log('   ✅ Prisma Client generated\n');
  } else {
    console.log('   ⚠️  Prisma generate had issues\n');
  }
} catch (e) {
  console.log('   ⚠️  Prisma generate error:', e.message, '\n');
}

// Step 2: Sync database with db push (primary method)
console.log('2️⃣  Syncing database schema...');
console.log('   Attempting: prisma db push --accept-data-loss\n');
try {
  const dbPushResult = spawnSync('npx', ['prisma', 'db', 'push', '--accept-data-loss'], {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: dbUrl }
  });

  if (dbPushResult.status === 0) {
    console.log('\n   ✅ Database synced with db push\n');
    success = true;
  }
} catch (e) {
  console.log('\n   ⚠️  db push error:', e.message);
}

// Step 3: Fallback to migrate deploy if db push failed
if (!success) {
  console.log('3️⃣  Fallback: Using prisma migrate deploy...\n');
  try {
    const migrateResult = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: dbUrl }
    });

    if (migrateResult.status === 0) {
      console.log('\n   ✅ Database synced with migrate deploy\n');
      success = true;
    }
  } catch (e) {
    console.log('\n   ⚠️  migrate deploy error:', e.message);
  }
}

if (!success) {
  console.log('⚠️  WARNING: Database sync may have failed');
  console.log('   The app may not work if tables are missing\n');
}

console.log('═══════════════════════════════════════════════════════════');
console.log('✅ Initialization complete - starting Next.js\n');
