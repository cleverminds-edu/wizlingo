#!/usr/bin/env node

const { spawnSync } = require('child_process');
const fs = require('fs');

if (fs.existsSync('.env.local')) {
  require('dotenv').config({ path: '.env.local' });
}

const dbUrl = process.env.DATABASE_URL;

console.log('\n════════════════════════════════════════════════════════════');
console.log('🚀 WizLingo Database & App Initialization');
console.log('════════════════════════════════════════════════════════════\n');

if (!dbUrl) {
  console.log('⚠️  DATABASE_URL not configured');
  console.log('✅ Starting app (may fail if database is not set up)\n');
  process.exit(0);
}

const dbDisplay = dbUrl.replace(/:[^@]*@/, ':***@');
console.log(`📍 Database URL: ${dbDisplay}\n`);

// PRIMARY: Use raw SQL sync (most reliable)
console.log('Step 1️⃣  - Synchronizing database schema with raw SQL');
console.log('         (using direct database connection)\n');

const syncResult = spawnSync('node', ['scripts/sync-db.js'], {
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URL: dbUrl }
});

let dbReady = syncResult.status === 0;

// FALLBACK: If raw SQL fails, try Prisma
if (!dbReady) {
  console.log('\n⚠️  Raw SQL sync had issues, trying Prisma...\n');
  console.log('Step 2️⃣  - Attempting Prisma schema sync');
  console.log('         prisma db push --accept-data-loss\n');

  const dbPushResult = spawnSync('npx', ['prisma', 'db', 'push', '--accept-data-loss'], {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: dbUrl }
  });

  dbReady = dbPushResult.status === 0;

  if (!dbReady) {
    console.log('\n⚠️  Prisma also failed, trying migrations...\n');
    console.log('Step 3️⃣  - Attempting Prisma migrations');
    console.log('         prisma migrate deploy\n');

    const migrateResult = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: dbUrl }
    });

    dbReady = migrateResult.status === 0;
  }
}

console.log('\n════════════════════════════════════════════════════════════');

if (!dbReady) {
  console.log('⚠️  WARNING: Database synchronization may have failed');
  console.log('    The app may not work properly if Student table is missing');
  console.log('    Check logs above for specific database errors');
} else {
  console.log('✅ Database synchronized successfully');
}

console.log('✅ Initialization complete - starting Next.js app');
console.log('════════════════════════════════════════════════════════════\n');
