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

-- Unique userId. Idempotent: Prisma creates this as a unique INDEX named "Student_userId_key";
-- the old "ADD CONSTRAINT" failed on every restart once it existed (which, before the fallback was
-- removed, silently triggered \`prisma db push --accept-data-loss\` on each start).
CREATE UNIQUE INDEX IF NOT EXISTS "Student_userId_key" ON "Student"("userId");

-- Change phone from UNIQUE to a plain INDEX (allow multiple users per phone).
-- It may exist as a constraint or as a unique index depending on how the DB was created.
ALTER TABLE "Student" DROP CONSTRAINT IF EXISTS "Student_phone_key";
DROP INDEX IF EXISTS "Student_phone_key";
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
