-- Add B2C UserID system columns
ALTER TABLE "Student" ADD COLUMN "userId" TEXT;
ALTER TABLE "Student" ADD COLUMN "loginType" TEXT;
ALTER TABLE "Student" ADD COLUMN "passwordChangedAt" TIMESTAMP(3);

-- Add unique constraint for userId
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_key" UNIQUE("userId");

-- Change phone constraint from UNIQUE to INDEX (allow multiple users per phone)
ALTER TABLE "Student" DROP CONSTRAINT "Student_phone_key";
CREATE INDEX "Student_phone_idx" ON "Student"("phone");

-- Add index for userId
CREATE INDEX "Student_userId_idx" ON "Student"("userId");
