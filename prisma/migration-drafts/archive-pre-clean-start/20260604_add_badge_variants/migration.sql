-- Create BadgeVariantLog table for A/B testing
CREATE TABLE "BadgeVariantLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "badgeType" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "platform" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create BadgeColorVariant table for color variant unlocks
CREATE TABLE "BadgeColorVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "badgeType" TEXT NOT NULL,
    "colorVariant" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unlockedBy" TEXT NOT NULL,
    CONSTRAINT "BadgeColorVariant_studentId_badgeType_colorVariant_key" UNIQUE("studentId", "badgeType", "colorVariant")
);

-- Create indexes for performance
CREATE INDEX "BadgeVariantLog_studentId_idx" ON "BadgeVariantLog"("studentId");
CREATE INDEX "BadgeVariantLog_badgeType_idx" ON "BadgeVariantLog"("badgeType");
CREATE INDEX "BadgeVariantLog_variant_idx" ON "BadgeVariantLog"("variant");
CREATE INDEX "BadgeVariantLog_action_idx" ON "BadgeVariantLog"("action");
CREATE INDEX "BadgeVariantLog_createdAt_idx" ON "BadgeVariantLog"("createdAt");

CREATE INDEX "BadgeColorVariant_studentId_idx" ON "BadgeColorVariant"("studentId");
CREATE INDEX "BadgeColorVariant_badgeType_idx" ON "BadgeColorVariant"("badgeType");
