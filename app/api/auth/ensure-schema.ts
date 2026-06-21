/**
 * Ensure database schema exists before using it
 * Creates missing tables/enums on-demand if migrations haven't run
 */

import { prisma } from '@/lib/prisma';

export async function ensureSchema() {
  try {
    // Try to query a table - if it fails, create the schema
    await prisma.$queryRaw`SELECT 1 FROM "Class" LIMIT 1`;
    return true;
  } catch (error) {
    // Class table doesn't exist, create it along with other essential tables
    console.log('📋 Creating missing schema...');

    try {
      // Create all missing tables
      await prisma.$executeRawUnsafe(`
        -- Create enums if they don't exist
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'GradeBand') THEN
            CREATE TYPE "public"."GradeBand" AS ENUM ('BAND_1_2', 'BAND_3_5', 'BAND_6_8', 'BAND_9_10');
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AccountType') THEN
            CREATE TYPE "public"."AccountType" AS ENUM ('SCHOOL', 'B2C');
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Gender') THEN
            CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'NEUTRAL', 'PREFER_NOT_SAY');
          END IF;
        END $$;

        -- Create School table
        CREATE TABLE IF NOT EXISTS "School" (
          "id" TEXT PRIMARY KEY,
          "name" TEXT NOT NULL,
          "code" TEXT UNIQUE NOT NULL,
          "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
        );

        -- Create Class table
        CREATE TABLE IF NOT EXISTS "Class" (
          "id" TEXT PRIMARY KEY,
          "grade" INTEGER NOT NULL,
          "section" TEXT NOT NULL,
          "schoolId" TEXT NOT NULL,
          "teacherId" TEXT,
          FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT
        );
      `);

      console.log('✅ Schema created');
      return true;
    } catch (schemaError) {
      console.error('❌ Failed to create schema:', schemaError);
      // Continue anyway - might still work if tables exist
      return false;
    }
  }
}
