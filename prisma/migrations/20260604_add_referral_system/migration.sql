-- Create Referral table for tracking referrals
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referrerId" TEXT NOT NULL,
    "referredId" TEXT,
    "referralCode" TEXT NOT NULL UNIQUE,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "Student" ("id") ON DELETE CASCADE,
    CONSTRAINT "Referral_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES "Student" ("id") ON DELETE SET NULL
);

-- Create ReferralReward table for tracking earned rewards
CREATE TABLE "ReferralReward" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL UNIQUE,
    "referralCount" INTEGER NOT NULL DEFAULT 0,
    "badgeColorVariantsUnlocked" TEXT[],
    "bonusStreakDays" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ReferralReward_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE
);

-- Create ConversionFunnel table for analytics
CREATE TABLE "ConversionFunnel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "step" TEXT NOT NULL,
    "sourceStudentId" TEXT,
    "newStudentEmail" TEXT,
    "referralCode" TEXT,
    "badgeType" TEXT,
    "schoolId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX "Referral_referralCode_idx" ON "Referral"("referralCode");
CREATE INDEX "Referral_referrerId_idx" ON "Referral"("referrerId");
CREATE INDEX "Referral_status_idx" ON "Referral"("status");

CREATE INDEX "ReferralReward_studentId_idx" ON "ReferralReward"("studentId");

CREATE INDEX "ConversionFunnel_sourceStudentId_idx" ON "ConversionFunnel"("sourceStudentId");
CREATE INDEX "ConversionFunnel_referralCode_idx" ON "ConversionFunnel"("referralCode");
CREATE INDEX "ConversionFunnel_timestamp_idx" ON "ConversionFunnel"("timestamp");
CREATE INDEX "ConversionFunnel_schoolId_idx" ON "ConversionFunnel"("schoolId");
