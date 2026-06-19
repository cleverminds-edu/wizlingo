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

console.log('🗂️  Syncing database schema...');

try {
  // Use db push instead of migrate deploy - more reliable for production
  // It syncs the schema directly without migration history
  const result = spawnSync('npx', ['prisma', 'db', 'push'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: dbUrl
    }
  });

  if (result.status === 0) {
    console.log('✅ Database schema synced');
  } else {
    console.warn('⚠️  Schema sync had issues (continuing anyway)');
  }
} catch (error) {
  console.warn('⚠️  Schema sync failed:', error.message, '(continuing anyway)');
}

console.log('✅ Init complete - starting Next.js app');
