-- AUTO-GENERATED DIFF (prisma migrate diff, prod HEAD schema -> target). DO NOT RUN AS-IS: see docs/plans/SCHEMA_REPLACEMENT_PLAN.md "S3 result".
◇ injected env (4) from .env.local // tip: ⌘ enable debugging { debug: true }
-- CreateEnum
CREATE TYPE "GradeCategory" AS ENUM ('PREPRIMARY', 'GR_1_3', 'GR_4_7', 'GR_8_10', 'GR_11_12');

-- CreateEnum
CREATE TYPE "LearningPillar" AS ENUM ('SOUND_FOUNDATION', 'LANGUAGE_FOUNDATION', 'CORE_SKILLS', 'COMMUNICATION', 'HIGHER_ORDER_LANGUAGE');

-- CreateEnum
CREATE TYPE "ProgressionStage" AS ENUM ('STAGE_1', 'STAGE_2', 'STAGE_3', 'STAGE_4', 'STAGE_5', 'STAGE_6', 'STAGE_7', 'STAGE_8', 'STAGE_9', 'STAGE_10', 'STAGE_11', 'STAGE_12', 'STAGE_13');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('EXERCISE', 'LESSON', 'ACTIVITY', 'ASSESSMENT', 'INTERACTIVE', 'SPEAKING', 'LISTENING', 'WRITING');

-- CreateEnum
CREATE TYPE "SupportLanguage" AS ENUM ('NONE', 'TE', 'HI');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'NEEDS_CHANGES', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReviewDecision" AS ENUM ('APPROVE', 'NEEDS_CHANGES', 'REJECT');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('VOCAB_REVIEW', 'READING', 'COMPREHENSION', 'SPEAKING', 'SPELLING');

-- CreateEnum
CREATE TYPE "EvidenceFormat" AS ENUM ('RECOGNITION', 'PRODUCTION');

-- CreateEnum
CREATE TYPE "PracticeContext" AS ENUM ('SCHOOL', 'HOME');

-- CreateEnum
CREATE TYPE "PolicyScope" AS ENUM ('GLOBAL', 'SCHOOL', 'CLASS');

-- AlterEnum
ALTER TYPE "BadgeType" ADD VALUE 'STORY_WIZARD';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ManagerRole" ADD VALUE 'LEAD_SME';
ALTER TYPE "ManagerRole" ADD VALUE 'SME';
ALTER TYPE "ManagerRole" ADD VALUE 'LANGUAGE_REVIEWER';

-- DropForeignKey
ALTER TABLE "Teacher" DROP CONSTRAINT "Teacher_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_classId_fkey";

-- DropForeignKey
ALTER TABLE "StudentProgress" DROP CONSTRAINT "StudentProgress_studentId_fkey";

-- DropForeignKey
ALTER TABLE "SpeakingSession" DROP CONSTRAINT "SpeakingSession_studentId_fkey";

-- DropForeignKey
ALTER TABLE "SpeakingSession" DROP CONSTRAINT "SpeakingSession_topicId_fkey";

-- DropForeignKey
ALTER TABLE "SpeakingProgress" DROP CONSTRAINT "SpeakingProgress_studentId_fkey";

-- DropForeignKey
ALTER TABLE "ReadingSession" DROP CONSTRAINT "ReadingSession_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Badge" DROP CONSTRAINT "Badge_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Certificate" DROP CONSTRAINT "Certificate_studentId_fkey";

-- AlterTable
ALTER TABLE "School" ADD COLUMN     "city" TEXT,
ADD COLUMN     "dailyLimitMinutes" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "homePracticeEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "leaderboardsEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "managerId" TEXT,
ADD COLUMN     "principalEmail" TEXT,
ADD COLUMN     "state" TEXT;

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "email" TEXT,
ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "schoolName" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "empCode" DROP NOT NULL,
ALTER COLUMN "pin" DROP NOT NULL,
ALTER COLUMN "schoolId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "code" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dailyLimitMinutes" INTEGER,
ADD COLUMN     "gradeLevel" "GradeCategory",
ADD COLUMN     "medium" "SupportLanguage" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "name" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "grade" DROP NOT NULL,
ALTER COLUMN "section" DROP NOT NULL,
ALTER COLUMN "schoolId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "classId",
ADD COLUMN     "currentLevel" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "gradeCategory" "GradeCategory",
ADD COLUMN     "lastActivityDate" TIMESTAMP(3),
ADD COLUMN     "longestStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "parentDailyLimitMinutes" INTEGER,
ADD COLUMN     "stage" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "stageLevel" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "streakDays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "supportLanguage" "SupportLanguage" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "totalXP" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "StudentProgress" ADD COLUMN     "avgListeningScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "avgReadingScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "avgSpeakingScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "avgWritingScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "listeningLevel" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "readingLevel" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "speakingLevel" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "writingLevel" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "gradeBand" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ReadingPassage" ADD COLUMN     "avgSentenceLen" DOUBLE PRECISION,
ADD COLUMN     "internalLevel" TEXT,
ADD COLUMN     "isControl" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "knownDefect" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedById" TEXT,
ADD COLUMN     "stage" INTEGER,
ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "suggestedLevel" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "gradeBand" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SpeakingSession" ADD COLUMN     "audioUrl" TEXT,
ADD COLUMN     "pronunciationScore" DOUBLE PRECISION,
ADD COLUMN     "transcript" TEXT;

-- AlterTable
ALTER TABLE "ReadingSession" ALTER COLUMN "missedWords" SET DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Badge" ADD COLUMN     "description" TEXT,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "name" TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Manager" ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reviewLanguage" "SupportLanguage";

-- DropTable
DROP TABLE "ConversationTopic";

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AddonPurchase" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "language" "SupportLanguage" NOT NULL,
    "amount" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "paymentRef" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AddonPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyProgress" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "currentPillar" "LearningPillar" NOT NULL DEFAULT 'SOUND_FOUNDATION',
    "currentStage" "ProgressionStage" NOT NULL DEFAULT 'STAGE_1',
    "stageProgress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "soundFoundationScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "languageFoundationScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "coreSkillsScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "communicationScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "higherOrderScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "masteredStages" "ProgressionStage"[] DEFAULT ARRAY[]::"ProgressionStage"[],
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JourneyProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurriculumUnit" (
    "id" TEXT NOT NULL,
    "gradeCategory" "GradeCategory" NOT NULL,
    "pillar" "LearningPillar" NOT NULL,
    "stage" "ProgressionStage" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sequence" INTEGER NOT NULL,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "objectives" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CurriculumUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sequence" INTEGER NOT NULL,
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 15,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonContent" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "type" "ContentType" NOT NULL,
    "sequence" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" JSONB NOT NULL,
    "mediaUrl" TEXT,
    "isGraded" BOOLEAN NOT NULL DEFAULT true,
    "passingScore" DOUBLE PRECISION DEFAULT 80,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonSession" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "durationSec" INTEGER,
    "score" DOUBLE PRECISION,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "responses" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeakingTopic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "prompt" TEXT,
    "topic" TEXT,
    "gradeBand" "GradeBand",
    "level" INTEGER NOT NULL,
    "character" TEXT,
    "characterGender" "Gender",
    "characterRole" TEXT,
    "openingLine" TEXT,
    "mode" "TopicMode" NOT NULL DEFAULT 'SCRIPTED',
    "script" JSONB,
    "stage" INTEGER,
    "internalLevel" TEXT,
    "passageId" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpeakingTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WritingPrompt" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "topic" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WritingPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListeningClip" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "transcript" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "topic" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListeningClip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VocabWord" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "example" TEXT NOT NULL,
    "audioUrl" TEXT,
    "stage" INTEGER NOT NULL,
    "passageId" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "glossTe" TEXT,
    "glossTeStatus" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "glossHi" TEXT,
    "glossHiStatus" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VocabWord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PassageQuestion" (
    "id" TEXT NOT NULL,
    "passageId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "options" JSONB,
    "answer" TEXT NOT NULL,
    "explanation" TEXT,
    "hintTe" TEXT,
    "hintHi" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PassageQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WritingSession" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "wordCount" INTEGER,
    "score" DOUBLE PRECISION,
    "feedback" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WritingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListeningSession" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "clipId" TEXT NOT NULL,
    "responses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "correctCount" INTEGER,
    "totalQuestions" INTEGER,
    "score" DOUBLE PRECISION,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListeningSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailySession" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "lessonsCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalScore" DOUBLE PRECISION,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "practiceSeconds" INTEGER NOT NULL DEFAULT 0,
    "exemptSeconds" INTEGER NOT NULL DEFAULT 0,
    "schoolSeconds" INTEGER NOT NULL DEFAULT 0,
    "homeSeconds" INTEGER NOT NULL DEFAULT 0,
    "limitSeconds" INTEGER,
    "lastHeartbeatAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeGrant" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "extraMinutes" INTEGER NOT NULL,
    "teacherId" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PracticeGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityAttempt" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "activityType" "ActivityType" NOT NULL,
    "itemType" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemVersion" INTEGER NOT NULL DEFAULT 1,
    "competencyTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "questionKind" TEXT,
    "format" "EvidenceFormat" NOT NULL,
    "correct" BOOLEAN,
    "score" DOUBLE PRECISION,
    "durationSec" INTEGER NOT NULL,
    "hintsUsed" INTEGER NOT NULL DEFAULT 0,
    "context" "PracticeContext" NOT NULL,
    "reasonCode" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentWord" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "box" INTEGER NOT NULL DEFAULT 1,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3),
    "timesCorrect" INTEGER NOT NULL DEFAULT 0,
    "timesWrong" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StudentWord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StageDefinition" (
    "stage" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "badgeType" "BadgeType" NOT NULL,
    "description" TEXT,
    "minLegacyLevel" INTEGER,
    "maxLegacyLevel" INTEGER,

    CONSTRAINT "StageDefinition_pkey" PRIMARY KEY ("stage")
);

-- CreateTable
CREATE TABLE "SessionMixPolicy" (
    "id" TEXT NOT NULL,
    "scope" "PolicyScope" NOT NULL,
    "scopeId" TEXT,
    "stage" INTEGER,
    "activityType" "ActivityType" NOT NULL,
    "minShare" DOUBLE PRECISION NOT NULL,
    "maxShare" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,

    CONSTRAINT "SessionMixPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassWeeklyFocus" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "week" TEXT NOT NULL,
    "focus" "ActivityType" NOT NULL,
    "teacherId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassWeeklyFocus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyStudentSummary" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "week" TEXT NOT NULL,
    "daysPractised" INTEGER NOT NULL,
    "schoolMinutes" INTEGER NOT NULL,
    "homeMinutes" INTEGER NOT NULL,
    "newWords" INTEGER NOT NULL,
    "wordsRetained" INTEGER NOT NULL,
    "literalPct" DOUBLE PRECISION,
    "inferencePct" DOUBLE PRECISION,
    "speakingSeconds" INTEGER NOT NULL,
    "stage" INTEGER NOT NULL,
    "stageLevel" INTEGER NOT NULL,
    "flags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyStudentSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentReview" (
    "id" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemVersion" INTEGER NOT NULL,
    "bundleId" TEXT,
    "decision" "ReviewDecision" NOT NULL,
    "reasonCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "comment" TEXT,
    "reviewerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewAudit" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "auditorId" TEXT NOT NULL,
    "agrees" BOOLEAN NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmeActivity" (
    "id" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "itemType" TEXT,
    "itemId" TEXT,
    "durationSec" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmeActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Enrollment_classId_idx" ON "Enrollment"("classId");

-- CreateIndex
CREATE INDEX "Enrollment_studentId_idx" ON "Enrollment"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_classId_studentId_key" ON "Enrollment"("classId", "studentId");

-- CreateIndex
CREATE INDEX "AddonPurchase_studentId_idx" ON "AddonPurchase"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyProgress_studentId_key" ON "JourneyProgress"("studentId");

-- CreateIndex
CREATE INDEX "JourneyProgress_currentPillar_idx" ON "JourneyProgress"("currentPillar");

-- CreateIndex
CREATE INDEX "JourneyProgress_currentStage_idx" ON "JourneyProgress"("currentStage");

-- CreateIndex
CREATE INDEX "CurriculumUnit_gradeCategory_idx" ON "CurriculumUnit"("gradeCategory");

-- CreateIndex
CREATE INDEX "CurriculumUnit_pillar_idx" ON "CurriculumUnit"("pillar");

-- CreateIndex
CREATE INDEX "CurriculumUnit_stage_idx" ON "CurriculumUnit"("stage");

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumUnit_gradeCategory_pillar_stage_sequence_key" ON "CurriculumUnit"("gradeCategory", "pillar", "stage", "sequence");

-- CreateIndex
CREATE INDEX "Lesson_unitId_idx" ON "Lesson"("unitId");

-- CreateIndex
CREATE INDEX "LessonContent_lessonId_idx" ON "LessonContent"("lessonId");

-- CreateIndex
CREATE INDEX "LessonSession_studentId_idx" ON "LessonSession"("studentId");

-- CreateIndex
CREATE INDEX "LessonSession_lessonId_idx" ON "LessonSession"("lessonId");

-- CreateIndex
CREATE INDEX "LessonSession_studentId_completedAt_idx" ON "LessonSession"("studentId", "completedAt");

-- CreateIndex
CREATE INDEX "SpeakingTopic_gradeBand_level_idx" ON "SpeakingTopic"("gradeBand", "level");

-- CreateIndex
CREATE INDEX "SpeakingTopic_status_idx" ON "SpeakingTopic"("status");

-- CreateIndex
CREATE INDEX "VocabWord_stage_idx" ON "VocabWord"("stage");

-- CreateIndex
CREATE INDEX "VocabWord_status_idx" ON "VocabWord"("status");

-- CreateIndex
CREATE UNIQUE INDEX "VocabWord_word_stage_key" ON "VocabWord"("word", "stage");

-- CreateIndex
CREATE INDEX "PassageQuestion_passageId_idx" ON "PassageQuestion"("passageId");

-- CreateIndex
CREATE INDEX "PassageQuestion_status_idx" ON "PassageQuestion"("status");

-- CreateIndex
CREATE INDEX "WritingSession_studentId_idx" ON "WritingSession"("studentId");

-- CreateIndex
CREATE INDEX "WritingSession_promptId_idx" ON "WritingSession"("promptId");

-- CreateIndex
CREATE INDEX "ListeningSession_studentId_idx" ON "ListeningSession"("studentId");

-- CreateIndex
CREATE INDEX "ListeningSession_clipId_idx" ON "ListeningSession"("clipId");

-- CreateIndex
CREATE INDEX "DailySession_studentId_idx" ON "DailySession"("studentId");

-- CreateIndex
CREATE INDEX "DailySession_date_idx" ON "DailySession"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailySession_studentId_date_key" ON "DailySession"("studentId", "date");

-- CreateIndex
CREATE INDEX "PracticeGrant_studentId_date_idx" ON "PracticeGrant"("studentId", "date");

-- CreateIndex
CREATE INDEX "ActivityAttempt_studentId_date_idx" ON "ActivityAttempt"("studentId", "date");

-- CreateIndex
CREATE INDEX "ActivityAttempt_studentId_activityType_createdAt_idx" ON "ActivityAttempt"("studentId", "activityType", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityAttempt_itemType_itemId_idx" ON "ActivityAttempt"("itemType", "itemId");

-- CreateIndex
CREATE INDEX "StudentWord_studentId_dueAt_idx" ON "StudentWord"("studentId", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "StudentWord_studentId_wordId_key" ON "StudentWord"("studentId", "wordId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionMixPolicy_scope_scopeId_stage_activityType_key" ON "SessionMixPolicy"("scope", "scopeId", "stage", "activityType");

-- CreateIndex
CREATE UNIQUE INDEX "ClassWeeklyFocus_classId_week_key" ON "ClassWeeklyFocus"("classId", "week");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyStudentSummary_studentId_week_key" ON "WeeklyStudentSummary"("studentId", "week");

-- CreateIndex
CREATE INDEX "ContentReview_itemType_itemId_idx" ON "ContentReview"("itemType", "itemId");

-- CreateIndex
CREATE INDEX "ContentReview_reviewerId_createdAt_idx" ON "ContentReview"("reviewerId", "createdAt");

-- CreateIndex
CREATE INDEX "ContentReview_bundleId_idx" ON "ContentReview"("bundleId");

-- CreateIndex
CREATE INDEX "ReviewAudit_reviewId_idx" ON "ReviewAudit"("reviewId");

-- CreateIndex
CREATE INDEX "ReviewAudit_auditorId_idx" ON "ReviewAudit"("auditorId");

-- CreateIndex
CREATE INDEX "SmeActivity_managerId_createdAt_idx" ON "SmeActivity"("managerId", "createdAt");

-- CreateIndex
CREATE INDEX "School_managerId_idx" ON "School"("managerId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_email_key" ON "Teacher"("email");

-- CreateIndex
CREATE INDEX "Teacher_schoolId_idx" ON "Teacher"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "Class_code_key" ON "Class"("code");

-- CreateIndex
CREATE INDEX "Class_schoolId_idx" ON "Class"("schoolId");

-- CreateIndex
CREATE INDEX "Class_teacherId_idx" ON "Class"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE INDEX "Student_gradeCategory_idx" ON "Student"("gradeCategory");

-- CreateIndex
CREATE INDEX "ReadingPassage_status_idx" ON "ReadingPassage"("status");

-- CreateIndex
CREATE INDEX "ReadingPassage_stage_internalLevel_idx" ON "ReadingPassage"("stage", "internalLevel");

-- CreateIndex
CREATE INDEX "ReadingPassage_gradeBand_level_idx" ON "ReadingPassage"("gradeBand", "level");

-- CreateIndex
CREATE INDEX "SpeakingSession_studentId_idx" ON "SpeakingSession"("studentId");

-- CreateIndex
CREATE INDEX "SpeakingSession_topicId_idx" ON "SpeakingSession"("topicId");

-- CreateIndex
CREATE INDEX "ReadingSession_studentId_idx" ON "ReadingSession"("studentId");

-- CreateIndex
CREATE INDEX "ReadingSession_passageId_idx" ON "ReadingSession"("passageId");

-- CreateIndex
CREATE INDEX "Badge_studentId_idx" ON "Badge"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_studentId_type_key" ON "Badge"("studentId", "type");

-- CreateIndex
CREATE INDEX "Manager_role_idx" ON "Manager"("role");

-- AddForeignKey
ALTER TABLE "School" ADD CONSTRAINT "School_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Manager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgress" ADD CONSTRAINT "StudentProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingProgress" ADD CONSTRAINT "SpeakingProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddonPurchase" ADD CONSTRAINT "AddonPurchase_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyProgress" ADD CONSTRAINT "JourneyProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "CurriculumUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonContent" ADD CONSTRAINT "LessonContent_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonSession" ADD CONSTRAINT "LessonSession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonSession" ADD CONSTRAINT "LessonSession_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingTopic" ADD CONSTRAINT "SpeakingTopic_passageId_fkey" FOREIGN KEY ("passageId") REFERENCES "ReadingPassage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabWord" ADD CONSTRAINT "VocabWord_passageId_fkey" FOREIGN KEY ("passageId") REFERENCES "ReadingPassage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PassageQuestion" ADD CONSTRAINT "PassageQuestion_passageId_fkey" FOREIGN KEY ("passageId") REFERENCES "ReadingPassage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingSession" ADD CONSTRAINT "ReadingSession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingSession" ADD CONSTRAINT "SpeakingSession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingSession" ADD CONSTRAINT "SpeakingSession_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "SpeakingTopic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WritingSession" ADD CONSTRAINT "WritingSession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WritingSession" ADD CONSTRAINT "WritingSession_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "WritingPrompt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListeningSession" ADD CONSTRAINT "ListeningSession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListeningSession" ADD CONSTRAINT "ListeningSession_clipId_fkey" FOREIGN KEY ("clipId") REFERENCES "ListeningClip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailySession" ADD CONSTRAINT "DailySession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeGrant" ADD CONSTRAINT "PracticeGrant_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeGrant" ADD CONSTRAINT "PracticeGrant_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityAttempt" ADD CONSTRAINT "ActivityAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentWord" ADD CONSTRAINT "StudentWord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentWord" ADD CONSTRAINT "StudentWord_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "VocabWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassWeeklyFocus" ADD CONSTRAINT "ClassWeeklyFocus_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassWeeklyFocus" ADD CONSTRAINT "ClassWeeklyFocus_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyStudentSummary" ADD CONSTRAINT "WeeklyStudentSummary_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentReview" ADD CONSTRAINT "ContentReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "Manager"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewAudit" ADD CONSTRAINT "ReviewAudit_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "ContentReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewAudit" ADD CONSTRAINT "ReviewAudit_auditorId_fkey" FOREIGN KEY ("auditorId") REFERENCES "Manager"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmeActivity" ADD CONSTRAINT "SmeActivity_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Manager"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Badge" ADD CONSTRAINT "Badge_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

