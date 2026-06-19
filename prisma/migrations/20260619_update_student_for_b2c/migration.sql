-- Make Student columns optional/add new columns
ALTER TABLE "Student" ALTER COLUMN "admissionNumber" DROP NOT NULL;
ALTER TABLE "Student" ALTER COLUMN "pin" DROP NOT NULL;
ALTER TABLE "Student" ALTER COLUMN "classId" DROP NOT NULL;

-- Add new columns for B2C signup
ALTER TABLE "Student" ADD COLUMN "dateOfBirth" TIMESTAMP(3);
ALTER TABLE "Student" ADD COLUMN "phone" TEXT;
ALTER TABLE "Student" ADD COLUMN "passwordHash" TEXT;
ALTER TABLE "Student" ADD COLUMN "accountType" "AccountType" NOT NULL DEFAULT 'SCHOOL';
ALTER TABLE "Student" ADD COLUMN "gender" "Gender";
ALTER TABLE "Student" ADD COLUMN "hasSeenOnboarding" BOOLEAN NOT NULL DEFAULT false;

-- Add unique constraint for phone
ALTER TABLE "Student" ADD CONSTRAINT "Student_phone_key" UNIQUE("phone");

-- Update class foreign key to allow null
ALTER TABLE "Student" DROP CONSTRAINT "Student_classId_fkey";
ALTER TABLE "Student" ADD CONSTRAINT "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
