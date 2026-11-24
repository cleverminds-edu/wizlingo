#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

if (fs.existsSync('.env.local')) {
  require('dotenv').config({ path: '.env.local' });
}

const dbUrl = process.env.DATABASE_URL;

console.log('\n════════════════════════════════════════════════════════════');
console.log('🚀 WizLingo Database Initialization');
console.log('════════════════════════════════════════════════════════════\n');

if (!dbUrl) {
  console.log('⚠️  DATABASE_URL not configured');
  console.log('✅ Skipping init, starting app\n');
  process.exit(0);
}

console.log(`📍 Database: ${dbUrl.replace(/:[^@]*@/, ':***@')}\n`);

try {
  console.log('Step 1️⃣  - Creating PostgreSQL enums...');
  execSync('node scripts/sync-db.js', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: dbUrl }
  });

  console.log('\nStep 2️⃣  - Running custom migrations...');
  execSync('node scripts/apply-migration.js', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: dbUrl }
  });

  console.log('\nStep 3️⃣  - Generating Prisma client...');
  try {
    execSync('npx prisma generate', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: dbUrl }
    });
  } catch (e) {
    console.log('⚠️  Prisma generate had issues (continuing anyway)');
  }

  console.log('\n════════════════════════════════════════════════════════════');
  console.log('✅ Database migration steps complete');
  console.log('════════════════════════════════════════════════════════════\n');

} catch (error) {
  // Never fall back to `prisma db push --accept-data-loss`: it applies the schema without the data
  // moves in the migrations and can drop production data (docs/plans/SCHEMA_REPLACEMENT_PLAN.md).
  // Stop instead: `npm start` only starts Next if this script succeeds, so the new deployment
  // fails and the previous one keeps serving.
  console.error('\n❌ Database migration failed. Not starting the app. No schema changes were forced.');
  console.error('   Fix the migration by hand, then redeploy.\n');
  process.exit(1);
}

// Seed content (only reached when migrations succeeded)
try {
  console.log('Step 5️⃣  - Ensuring content is seeded...');
  execSync('node scripts/seed-direct.js', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: dbUrl }
  });
} catch (e) {
  console.error('⚠️  Seeding issue:', e.message);
  console.log('⚠️  App will auto-seed on first request');
}
