#!/usr/bin/env node

const { spawnSync } = require('child_process');
const fs = require('fs');

// Load environment variables from .env.local if it exists
if (fs.existsSync('.env.local')) {
  require('dotenv').config({ path: '.env.local' });
}

// Check if DATABASE_URL is available
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.warn('⚠️  DATABASE_URL not found, skipping schema sync');
  process.exit(0);
}

// First regenerate Prisma client to ensure it matches current schema
console.log('🔄 Regenerating Prisma client...');
try {
  const genResult = spawnSync('npx', ['prisma', 'generate'], {
    stdio: 'pipe',
    env: { ...process.env, DATABASE_URL: dbUrl }
  });
  if (genResult.status === 0) {
    console.log('✅ Prisma client regenerated');
  } else {
    console.warn('⚠️  Prisma generate had issues');
  }
} catch (e) {
  console.warn('⚠️  Prisma generate failed:', e.message);
}

console.log('🗂️  Syncing database schema...');

try {
  // Use db push instead of migrate deploy - more reliable for production
  // It syncs the schema directly without migration history
  // Use --accept-data-loss to force apply changes
  const result = spawnSync('npx', ['prisma', 'db', 'push', '--accept-data-loss'], {
    stdio: 'pipe',
    env: {
      ...process.env,
      DATABASE_URL: dbUrl
    }
  });

  const output = result.stdout ? result.stdout.toString() : '';
  const error = result.stderr ? result.stderr.toString() : '';

  if (result.status === 0) {
    console.log('✅ Database schema synced');
    if (output.includes('error') || output.includes('Error')) {
      console.log('Output:', output);
    }
  } else {
    console.log('⚠️  Schema sync output:', output);
    if (error) console.log('⚠️  Errors:', error);
  }
} catch (error) {
  console.warn('⚠️  Schema sync failed:', error.message, '(continuing anyway)');
}

console.log('✅ Init complete - starting Next.js app');
