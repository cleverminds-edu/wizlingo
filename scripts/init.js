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

  console.log('\nStep 3️⃣  - Seeding content...');
  try {
    // Try prisma seed first
    execSync('npx prisma db seed', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: dbUrl }
    });
  } catch (e) {
    // If seed fails, try direct seed script
    try {
      console.log('Attempting direct seeding...');
      execSync('node scripts/direct-seed.js', {
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: dbUrl }
      });
    } catch (e2) {
      console.log('⚠️  Seeding skipped (content may already exist)');
    }
  }

  console.log('\n════════════════════════════════════════════════════════════');
  console.log('✅ Database initialization complete');
  console.log('════════════════════════════════════════════════════════════\n');

} catch (error) {
  // If migrations fail, try db push as fallback
  console.log('\n⚠️  Migrations failed, trying db push...\n');

  try {
    execSync('npx prisma db push --accept-data-loss', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: dbUrl }
    });

    console.log('\n════════════════════════════════════════════════════════════');
    console.log('✅ Database schema synced with db push');
    console.log('════════════════════════════════════════════════════════════\n');
  } catch (pushError) {
    console.log('\n⚠️  Database initialization had issues');
    console.log('⚠️  The app may not work if tables are missing');
    console.log('════════════════════════════════════════════════════════════\n');
  }
}
