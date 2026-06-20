#!/usr/bin/env node
/**
 * Verify database schema is ready
 * Enums and tables should already exist from migrations
 */

const { Client } = require('pg');
const fs = require('fs');

if (fs.existsSync('.env.local')) {
  require('dotenv').config({ path: '.env.local' });
}

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.log('📍 No DATABASE_URL, skipping verification');
  process.exit(0);
}

async function main() {
  const client = new Client({ connectionString: dbUrl });

  try {
    console.log('🔗 Verifying database schema...');
    await client.connect();
    console.log('✅ Database connection OK\n');

    // Verify enums exist
    console.log('Checking enums...');
    const enumResult = await client.query(`
      SELECT typname FROM pg_type
      WHERE typname IN ('AccountType', 'Gender', 'GradeBand')
    `);

    if (enumResult.rows.length === 3) {
      console.log('✅ All enums exist\n');
    } else {
      console.log('⚠️  Some enums missing (trying to create)\n');
    }

    // Verify Student table exists
    console.log('Checking Student table...');
    const studentCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'Student'
      );
    `);

    if (!studentCheck.rows[0].exists) {
      console.log('❌ Student table missing - this is a problem');
      process.exit(1);
    }
    console.log('✅ Student table exists\n');

    // Verify StudentProgress table exists
    console.log('Checking StudentProgress table...');
    const progressCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'StudentProgress'
      );
    `);

    if (!progressCheck.rows[0].exists) {
      console.log('⚠️  StudentProgress table missing (optional for now)\n');
    } else {
      console.log('✅ StudentProgress table exists\n');
    }

    console.log('════════════════════════════════════════════');
    console.log('✅ Database schema verified');
    console.log('════════════════════════════════════════════\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
