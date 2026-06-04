-- Add avgFluency to StudentProgress
ALTER TABLE "StudentProgress" ADD COLUMN "avgFluency" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Create LeaderboardType enum
CREATE TYPE "LeaderboardType" AS ENUM ('BADGE_COUNT', 'SPEED', 'CONSISTENCY', 'ACCURACY', 'FLUENCY');

-- Create Leaderboard table
CREATE TABLE "Leaderboard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" "LeaderboardType" NOT NULL,
    "scope" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Leaderboard_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create unique constraint on Leaderboard
CREATE UNIQUE INDEX "Leaderboard_type_scope_studentId_key" ON "Leaderboard"("type", "scope", "studentId");

-- Create indexes for Leaderboard
CREATE INDEX "Leaderboard_type_scope_rank_idx" ON "Leaderboard"("type", "scope", "rank");
CREATE INDEX "Leaderboard_scope_type_idx" ON "Leaderboard"("scope", "type");

-- Create LeaderboardSnapshot table
CREATE TABLE "LeaderboardSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" "LeaderboardType" NOT NULL,
    "scope" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "trend" TEXT NOT NULL,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeaderboardSnapshot_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create unique constraint on LeaderboardSnapshot
CREATE UNIQUE INDEX "LeaderboardSnapshot_type_scope_studentId_takenAt_key" ON "LeaderboardSnapshot"("type", "scope", "studentId", "takenAt");

-- Create index for LeaderboardSnapshot
CREATE INDEX "LeaderboardSnapshot_takenAt_idx" ON "LeaderboardSnapshot"("takenAt");

-- Create Certificate table
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "badgeType" "BadgeType" NOT NULL,
    "verifyCode" TEXT NOT NULL UNIQUE,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Certificate_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create unique constraint on Certificate
CREATE UNIQUE INDEX "Certificate_studentId_badgeType_key" ON "Certificate"("studentId", "badgeType");
