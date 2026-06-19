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
  console.warn('⚠️  DATABASE_URL not found, skipping migrations');
  process.exit(0);
}

console.log('🗂️  Running database migrations...');

try {
  // Pass DATABASE_URL via environment to the spawned process
  const result = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: dbUrl
    }
  });

  if (result.status === 0) {
    console.log('✅ Migrations completed');
  } else {
    console.error('❌ Migrations exited with code:', result.status);
    // Don't exit - let app start anyway
  }
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  // Don't exit with error - let the app start anyway
}
