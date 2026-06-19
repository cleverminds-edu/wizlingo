#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('✅ Migrations completed');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
