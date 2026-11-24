-- Add parent email to Student
ALTER TABLE "Student" ADD COLUMN "parentEmail" TEXT;

-- Create EmailFrequency enum
CREATE TYPE "EmailFrequency" AS ENUM ('IMMEDIATE', 'DAILY', 'WEEKLY', 'NEVER');

-- Create NotificationPreference table
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL UNIQUE,
    "badgeEarnedStudent" BOOLEAN NOT NULL DEFAULT true,
    "badgeEarnedParent" BOOLEAN NOT NULL DEFAULT true,
    "milestoneEmail" BOOLEAN NOT NULL DEFAULT true,
    "weeklySummary" BOOLEAN NOT NULL DEFAULT true,
    "leaderboardUpdate" BOOLEAN NOT NULL DEFAULT true,
    "emailFrequency" "EmailFrequency" NOT NULL DEFAULT 'WEEKLY',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "NotificationPreference_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create SentEmail table for logging
CREATE TABLE "SentEmail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "error" TEXT,
    CONSTRAINT "SentEmail_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for performance
CREATE INDEX "SentEmail_studentId_idx" ON "SentEmail"("studentId");
CREATE INDEX "SentEmail_sentAt_idx" ON "SentEmail"("sentAt");
