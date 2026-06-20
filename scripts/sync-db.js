#!/usr/bin/env node
/**
 * Direct database synchronization using raw SQL
 * This bypasses Prisma CLI and directly creates tables
 * Used when prisma db push fails silently
 */

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

async function main() {
  const client = new Client({ connectionString: dbUrl });

  try {
    console.log('🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Connected\n');

    // Check if Student table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'Student'
      );
    `);

    if (tableCheck.rows[0].exists) {
      console.log('✅ Student table already exists');
      await client.end();
      process.exit(0);
    }

    console.log('📋 Student table not found, creating schema...\n');

    // Create essential tables with minimal schema
    console.log('Creating Student table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Student" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "name" TEXT NOT NULL,
        "dateOfBirth" TIMESTAMP(3),
        "phone" TEXT UNIQUE,
        "passwordHash" TEXT,
        "classId" TEXT,
        "accountType" TEXT DEFAULT 'B2C',
        "gender" TEXT,
        "parentEmail" TEXT,
        "admissionNumber" TEXT,
        "pin" TEXT,
        "hasSeenOnboarding" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Student table created');

    console.log('Creating StudentProgress table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "StudentProgress" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "studentId" TEXT UNIQUE NOT NULL,
        "currentLevel" INTEGER DEFAULT 2,
        "ageBand" TEXT DEFAULT '9-11',
        "gradeBand" TEXT NOT NULL,
        "totalSessions" INTEGER DEFAULT 0,
        "passedSessions" INTEGER DEFAULT 0,
        "avgWpm" DOUBLE PRECISION DEFAULT 0,
        "avgAccuracy" DOUBLE PRECISION DEFAULT 0,
        "avgFluency" DOUBLE PRECISION DEFAULT 0,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT
      );
    `);
    console.log('✅ StudentProgress table created');

    // Create indexes
    console.log('Creating indexes...');
    await client.query(`CREATE INDEX IF NOT EXISTS "Student_phone_key" ON "Student"("phone");`);
    await client.query(`CREATE INDEX IF NOT EXISTS "StudentProgress_studentId_key" ON "StudentProgress"("studentId");`);
    console.log('✅ Indexes created\n');

    console.log('═══════════════════════════════════════════');
    console.log('✅ Database schema synchronized successfully');
    console.log('═══════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Database sync failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
