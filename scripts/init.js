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
console.log('📍 DATABASE_URL:', dbUrl.replace(/:[^@]*@/, ':***@')); // Log URL without password

let success = false;

// Try prisma db push first (simpler, works better for new databases)
try {
  console.log('📌 Attempting: prisma db push --accept-data-loss');
  const result = spawnSync('npx', ['prisma', 'db', 'push', '--accept-data-loss'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: dbUrl
    }
  });

  if (result.status === 0) {
    console.log('✅ Database schema synced with db push');
    success = true;
  }
} catch (error) {
  console.log('⚠️  db push failed:', error.message);
}

// If db push didn't work, try migrate deploy (handles migration history)
if (!success) {
  try {
    console.log('📌 Falling back to: prisma migrate deploy');
    const result = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: dbUrl
      }
    });

    if (result.status === 0) {
      console.log('✅ Database schema synced with migrate deploy');
      success = true;
    }
  } catch (error) {
    console.log('⚠️  migrate deploy failed:', error.message);
  }
}

if (!success) {
  console.warn('⚠️  Schema sync incomplete (app may still work if tables exist)');
}

console.log('✅ Init complete - starting Next.js app');
