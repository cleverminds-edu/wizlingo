-- CreateEnum
CREATE TYPE "SchoolTierType" AS ENUM ('FREE', 'STARTER', 'GROWTH', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "School" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "SchoolSubscription" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "tier" "SchoolTierType" NOT NULL DEFAULT 'FREE',
    "studentsIncluded" INTEGER NOT NULL DEFAULT 50,
    "activeStudents" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "renewalDate" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolAdmin" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolInvite" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "usedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolLeaderboardSnapshot" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "totalStudents" INTEGER NOT NULL,
    "totalBadgesEarned" INTEGER NOT NULL,
    "grandWizardCount" INTEGER NOT NULL,
    "avgAccuracy" DOUBLE PRECISION NOT NULL,
    "avgSessionsPerStudent" DOUBLE PRECISION NOT NULL,
    "monthlyGrowth" INTEGER NOT NULL,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchoolLeaderboardSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SchoolSubscription_schoolId_key" ON "SchoolSubscription"("schoolId");

-- CreateIndex
CREATE INDEX "SchoolSubscription_schoolId_idx" ON "SchoolSubscription"("schoolId");

-- CreateIndex
CREATE INDEX "SchoolSubscription_tier_idx" ON "SchoolSubscription"("tier");

-- CreateIndex
CREATE INDEX "SchoolSubscription_renewalDate_idx" ON "SchoolSubscription"("renewalDate");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolAdmin_schoolId_adminId_key" ON "SchoolAdmin"("schoolId", "adminId");

-- CreateIndex
CREATE INDEX "SchoolAdmin_schoolId_idx" ON "SchoolAdmin"("schoolId");

-- CreateIndex
CREATE INDEX "SchoolAdmin_adminId_idx" ON "SchoolAdmin"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolInvite_code_key" ON "SchoolInvite"("code");

-- CreateIndex
CREATE INDEX "SchoolInvite_schoolId_idx" ON "SchoolInvite"("schoolId");

-- CreateIndex
CREATE INDEX "SchoolInvite_code_idx" ON "SchoolInvite"("code");

-- CreateIndex
CREATE INDEX "SchoolInvite_expiresAt_idx" ON "SchoolInvite"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolLeaderboardSnapshot_schoolId_takenAt_key" ON "SchoolLeaderboardSnapshot"("schoolId", "takenAt");

-- CreateIndex
CREATE INDEX "SchoolLeaderboardSnapshot_schoolId_idx" ON "SchoolLeaderboardSnapshot"("schoolId");

-- CreateIndex
CREATE INDEX "SchoolLeaderboardSnapshot_takenAt_idx" ON "SchoolLeaderboardSnapshot"("takenAt");

-- CreateIndex
CREATE INDEX "SchoolLeaderboardSnapshot_rank_idx" ON "SchoolLeaderboardSnapshot"("rank");

-- AddForeignKey
ALTER TABLE "SchoolSubscription" ADD CONSTRAINT "SchoolSubscription_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolAdmin" ADD CONSTRAINT "SchoolAdmin_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolAdmin" ADD CONSTRAINT "SchoolAdmin_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolInvite" ADD CONSTRAINT "SchoolInvite_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolLeaderboardSnapshot" ADD CONSTRAINT "SchoolLeaderboardSnapshot_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE;
