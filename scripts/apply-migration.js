#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const client = new Client({
  connectionString: dbUrl,
});

const migrationSql = `
-- Add B2C UserID system columns
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "loginType" TEXT;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "passwordChangedAt" TIMESTAMP(3);

-- Add unique constraint for userId
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_key" UNIQUE("userId");

-- Change phone constraint from UNIQUE to INDEX (allow multiple users per phone)
ALTER TABLE "Student" DROP CONSTRAINT IF EXISTS "Student_phone_key";
CREATE INDEX IF NOT EXISTS "Student_phone_idx" ON "Student"("phone");

-- Add index for userId
CREATE INDEX IF NOT EXISTS "Student_userId_idx" ON "Student"("userId");
`;

(async () => {
  try {
    console.log('🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Connected\n');

    console.log('📝 Applying migration...');
    await client.query(migrationSql);
    console.log('✅ Migration applied successfully\n');

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    await client.end();
    process.exit(1);
  }
})();
