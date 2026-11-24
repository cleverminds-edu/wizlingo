#!/usr/bin/env node
/**
 * Ensure production database is fully initialized
 * Runs migrations and creates any missing enums
 */

const { spawnSync } = require('child_process');
const { Client } = require('pg');
const fs = require('fs');

if (fs.existsSync('.env.local')) {
  require('dotenv').config({ path: '.env.local' });
}

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.log('📍 No DATABASE_URL, skipping sync');
  process.exit(0);
}

async function verifyTables(client) {
  console.log('Verifying essential tables...');

  const tables = ['Student', 'StudentProgress', 'Class', 'School'];
  let allExist = true;

  for (const tableName of tables) {
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = $1
      );
    `, [tableName]);

    if (result.rows[0].exists) {
      console.log(`  ✅ ${tableName}`);
    } else {
      console.log(`  ❌ ${tableName}`);
      allExist = false;
    }
  }

  return allExist;
}

async function main() {
  const client = new Client({ connectionString: dbUrl });

  try {
    console.log('\n════════════════════════════════════════════');
    console.log('🚀 Database Initialization');
    console.log('════════════════════════════════════════════\n');

    console.log('🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Connected\n');

    // Enums are created by the Prisma migrations. The old pre-step (scripts/create-enums.sql) created
    // them first, with values that don't match the schema, which made a fresh `migrate deploy` fail
    // with "type already exists". Removed for the clean start (2026-11-24).
    await client.end();

    // Now run Prisma migrations (requires DATABASE_URL env var)
    console.log('Step 1️⃣  - Running Prisma migrations...\n');
    const migrateResult = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: dbUrl }
    });

    if (migrateResult.status !== 0) {
      // Never fall back to `prisma db push --accept-data-loss`: it applies the schema without the
      // data moves in the migrations and can drop production data (see
      // docs/plans/SCHEMA_REPLACEMENT_PLAN.md). Fail the deploy instead; fix the migration by hand.
      console.error('\n❌ prisma migrate deploy failed. Not starting. No schema changes were forced.\n');
      process.exit(1);
    }

    // Verify tables exist
    console.log('\nStep 2️⃣  - Verifying schema...\n');
    const client2 = new Client({ connectionString: dbUrl });
    await client2.connect();
    const tablesReady = await verifyTables(client2);
    await client2.end();

    console.log('\n════════════════════════════════════════════');
    if (tablesReady) {
      console.log('✅ Database schema ready');
    } else {
      console.log('⚠️  Some tables missing (migrations may not have run)');
    }
    console.log('════════════════════════════════════════════\n');

    process.exit(tablesReady ? 0 : 1);

  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    process.exit(1);
  }
}

main();
