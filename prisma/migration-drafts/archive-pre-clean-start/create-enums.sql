-- Create PostgreSQL enums if they don't exist
-- This script is idempotent (safe to run multiple times)

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AccountType') THEN
        CREATE TYPE "public"."AccountType" AS ENUM ('SCHOOL', 'B2C');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Gender') THEN
        CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'NEUTRAL', 'PREFER_NOT_SAY');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'GradeBand') THEN
        CREATE TYPE "public"."GradeBand" AS ENUM ('BAND_1_2', 'BAND_3_5', 'BAND_6_8', 'BAND_9_10');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SessionStatus') THEN
        CREATE TYPE "public"."SessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'NEEDS_REVIEW');
    END IF;
END $$;
