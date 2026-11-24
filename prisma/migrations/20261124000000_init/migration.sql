-- WizLingo initial schema (clean start, owner decision 2026-11-24).
-- Production data was trial-only and is discarded: the database is wiped once and this creates
-- everything from scratch. Generated with `prisma migrate diff --from-empty --to-schema`.
-- Earlier history (incl. the data-preserving migration) is archived in
-- prisma/migration-drafts/archive-pre-clean-start/ for reference only.

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('SCHOOL', 'PUBLIC', 'B2C');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "BadgeType" AS ENUM ('SPARK', 'WORD_WIZARD', 'STORY_WIZARD', 'VOICE_WIZARD', 'LANGUAGE_WIZARD', 'GRAND_WIZARD');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('PRINCIPAL', 'ACADEMIC_INCHARGE');

-- CreateEnum
CREATE TYPE "GradeBand" AS ENUM ('BAND_1_2', 'BAND_3_5', 'BAND_6_8', 'BAND_9_10');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "TopicMode" AS ENUM ('AI', 'SCRIPTED');

-- CreateEnum
CREATE TYPE "LeaderboardType" AS ENUM ('BADGE_COUNT', 'SPEED', 'CONSISTENCY', 'ACCURACY', 'FLUENCY');

-- CreateEnum
CREATE TYPE "EmailFrequency" AS ENUM ('IMMEDIATE', 'DAILY', 'WEEKLY', 'NEVER');

-- CreateEnum
CREATE TYPE "SchoolTierType" AS ENUM ('FREE', 'STARTER', 'GROWTH', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "ManagerRole" AS ENUM ('MANAGER', 'ADMIN', 'SUPER_ADMIN', 'LEAD_SME', 'SME', 'LANGUAGE_REVIEWER');

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

-- CreateTable
CREATE TABLE "Manager" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "ManagerRole" NOT NULL DEFAULT 'MANAGER',
    "organization" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "reviewLanguage" "SupportLanguage",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Manager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "logoUrl" TEXT,
    "city" TEXT,
    "state" TEXT,
    "principalEmail" TEXT,
    "dailyLimitMinutes" INTEGER NOT NULL DEFAULT 20,
    "leaderboardsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "homePracticeEnabled" BOOLEAN NOT NULL DEFAULT true,
    "managerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "empCode" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "empCode" TEXT,
    "pin" TEXT,
    "email" TEXT,
    "passwordHash" TEXT,
    "phone" TEXT,
    "schoolName" TEXT,
    "schoolId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL,
    "grade" INTEGER,
    "section" TEXT,
    "name" TEXT,
    "gradeLevel" "GradeCategory",
    "code" TEXT,
    "medium" "SupportLanguage" NOT NULL DEFAULT 'NONE',
    "dailyLimitMinutes" INTEGER,
    "schoolId" TEXT,
    "teacherId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "admissionNumber" TEXT,
    "pin" TEXT,
    "userId" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT,
    "accountType" "AccountType" NOT NULL DEFAULT 'SCHOOL',
    "loginType" TEXT,
    "passwordChangedAt" TIMESTAMP(3),
    "name" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" "Gender",
    "gradeCategory" "GradeCategory",
    "parentEmail" TEXT,
    "hasSeenOnboarding" BOOLEAN NOT NULL DEFAULT false,
    "currentLevel" INTEGER NOT NULL DEFAULT 2,
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActivityDate" TIMESTAMP(3),
    "totalXP" INTEGER NOT NULL DEFAULT 0,
    "stage" INTEGER NOT NULL DEFAULT 1,
    "stageLevel" INTEGER NOT NULL DEFAULT 1,
    "supportLanguage" "SupportLanguage" NOT NULL DEFAULT 'NONE',
    "parentDailyLimitMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProgress" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "currentLevel" INTEGER NOT NULL DEFAULT 2,
    "ageBand" TEXT NOT NULL DEFAULT '9-11',
    "gradeBand" "GradeBand",
    "avgWpm" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgAccuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgFluency" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "readingLevel" INTEGER NOT NULL DEFAULT 1,
    "speakingLevel" INTEGER NOT NULL DEFAULT 1,
    "writingLevel" INTEGER NOT NULL DEFAULT 1,
    "listeningLevel" INTEGER NOT NULL DEFAULT 1,
    "avgReadingScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgSpeakingScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgWritingScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgListeningScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "passedSessions" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeakingProgress" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "currentLevel" INTEGER NOT NULL DEFAULT 1,
    "passedSessions" INTEGER NOT NULL DEFAULT 0,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "avgWpm" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgFluency" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpeakingProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeakingPreference" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "characterGenderPref" TEXT NOT NULL DEFAULT 'ANY',
    "pronouns" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progressionWeek" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpeakingPreference_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "ReadingPassage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "gradeBand" "GradeBand",
    "level" INTEGER NOT NULL,
    "topic" TEXT NOT NULL,
    "stage" INTEGER,
    "internalLevel" TEXT,
    "suggestedLevel" TEXT,
    "avgSentenceLen" DOUBLE PRECISION,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "isControl" BOOLEAN NOT NULL DEFAULT false,
    "knownDefect" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadingPassage_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "ReadingSession" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "passageId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationSec" INTEGER,
    "transcript" TEXT,
    "wpm" DOUBLE PRECISION,
    "accuracy" DOUBLE PRECISION,
    "missedWords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "wrongWords" JSONB,
    "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "teacherNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeakingSession" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "turns" JSONB,
    "totalWords" INTEGER,
    "durationSec" INTEGER,
    "wpm" DOUBLE PRECISION,
    "fluencyScore" DOUBLE PRECISION,
    "pronunciationScore" DOUBLE PRECISION,
    "audioUrl" TEXT,
    "transcript" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpeakingSession_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "icon" TEXT,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "badgeType" "BadgeType" NOT NULL,
    "verifyCode" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BadgeVariantLog" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "badgeType" "BadgeType" NOT NULL,
    "variant" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "platform" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BadgeVariantLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BadgeColorVariant" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "badgeType" "BadgeType" NOT NULL,
    "colorVariant" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unlockedBy" TEXT NOT NULL,

    CONSTRAINT "BadgeColorVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leaderboard" (
    "id" TEXT NOT NULL,
    "type" "LeaderboardType" NOT NULL,
    "scope" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderboardSnapshot" (
    "id" TEXT NOT NULL,
    "type" "LeaderboardType" NOT NULL,
    "scope" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "trend" TEXT NOT NULL,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaderboardSnapshot_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "badgeEarnedStudent" BOOLEAN NOT NULL DEFAULT true,
    "badgeEarnedParent" BOOLEAN NOT NULL DEFAULT true,
    "milestoneEmail" BOOLEAN NOT NULL DEFAULT true,
    "weeklySummary" BOOLEAN NOT NULL DEFAULT true,
    "leaderboardUpdate" BOOLEAN NOT NULL DEFAULT true,
    "emailFrequency" "EmailFrequency" NOT NULL DEFAULT 'WEEKLY',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SentEmail" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "error" TEXT,

    CONSTRAINT "SentEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "referredId" TEXT,
    "referralCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralReward" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "referralCount" INTEGER NOT NULL DEFAULT 0,
    "badgeColorVariantsUnlocked" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bonusStreakDays" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferralReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversionFunnel" (
    "id" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "sourceStudentId" TEXT,
    "newStudentEmail" TEXT,
    "referralCode" TEXT,
    "badgeType" TEXT,
    "schoolId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversionFunnel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentEmailPreference" (
    "id" TEXT NOT NULL,
    "parentEmail" TEXT NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'immediate',
    "badgeEarned" BOOLEAN NOT NULL DEFAULT true,
    "weeklyProgress" BOOLEAN NOT NULL DEFAULT true,
    "monthlyMilestone" BOOLEAN NOT NULL DEFAULT true,
    "schoolRanking" BOOLEAN NOT NULL DEFAULT true,
    "sendTime" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "unsubscribeToken" TEXT NOT NULL,
    "unsubscribedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParentEmailPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "parentEmail" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "referralCode" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "opens" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "lastOpenedAt" TIMESTAMP(3),
    "lastClickedAt" TIMESTAMP(3),
    "variant" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailClick" (
    "id" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "linkType" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailSchedule" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "parentEmail" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVariantTest" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "subject" TEXT,
    "ctaText" TEXT,
    "layoutType" TEXT,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailVariantTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BetaFeedback" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "sessionType" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "selectedIssues" TEXT[],
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BetaFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationCode" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Manager_email_key" ON "Manager"("email");

-- CreateIndex
CREATE INDEX "Manager_email_idx" ON "Manager"("email");

-- CreateIndex
CREATE INDEX "Manager_isActive_idx" ON "Manager"("isActive");

-- CreateIndex
CREATE INDEX "Manager_role_idx" ON "Manager"("role");

-- CreateIndex
CREATE UNIQUE INDEX "School_code_key" ON "School"("code");

-- CreateIndex
CREATE INDEX "School_managerId_idx" ON "School"("managerId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_empCode_key" ON "Admin"("empCode");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_empCode_key" ON "Teacher"("empCode");

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
CREATE INDEX "Enrollment_classId_idx" ON "Enrollment"("classId");

-- CreateIndex
CREATE INDEX "Enrollment_studentId_idx" ON "Enrollment"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_classId_studentId_key" ON "Enrollment"("classId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_admissionNumber_key" ON "Student"("admissionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE INDEX "Student_userId_idx" ON "Student"("userId");

-- CreateIndex
CREATE INDEX "Student_phone_idx" ON "Student"("phone");

-- CreateIndex
CREATE INDEX "Student_gradeCategory_idx" ON "Student"("gradeCategory");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProgress_studentId_key" ON "StudentProgress"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "SpeakingProgress_studentId_key" ON "SpeakingProgress"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "SpeakingPreference_studentId_key" ON "SpeakingPreference"("studentId");

-- CreateIndex
CREATE INDEX "SpeakingPreference_studentId_idx" ON "SpeakingPreference"("studentId");

-- CreateIndex
CREATE INDEX "SpeakingPreference_characterGenderPref_idx" ON "SpeakingPreference"("characterGenderPref");

-- CreateIndex
CREATE INDEX "SpeakingPreference_progressionWeek_idx" ON "SpeakingPreference"("progressionWeek");

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
CREATE INDEX "ReadingPassage_status_idx" ON "ReadingPassage"("status");

-- CreateIndex
CREATE INDEX "ReadingPassage_stage_internalLevel_idx" ON "ReadingPassage"("stage", "internalLevel");

-- CreateIndex
CREATE INDEX "ReadingPassage_gradeBand_level_idx" ON "ReadingPassage"("gradeBand", "level");

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
CREATE INDEX "ReadingSession_studentId_idx" ON "ReadingSession"("studentId");

-- CreateIndex
CREATE INDEX "ReadingSession_passageId_idx" ON "ReadingSession"("passageId");

-- CreateIndex
CREATE INDEX "SpeakingSession_studentId_idx" ON "SpeakingSession"("studentId");

-- CreateIndex
CREATE INDEX "SpeakingSession_topicId_idx" ON "SpeakingSession"("topicId");

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
CREATE INDEX "Badge_studentId_idx" ON "Badge"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_studentId_type_key" ON "Badge"("studentId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_verifyCode_key" ON "Certificate"("verifyCode");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_studentId_badgeType_key" ON "Certificate"("studentId", "badgeType");

-- CreateIndex
CREATE INDEX "BadgeVariantLog_studentId_idx" ON "BadgeVariantLog"("studentId");

-- CreateIndex
CREATE INDEX "BadgeVariantLog_badgeType_idx" ON "BadgeVariantLog"("badgeType");

-- CreateIndex
CREATE INDEX "BadgeVariantLog_variant_idx" ON "BadgeVariantLog"("variant");

-- CreateIndex
CREATE INDEX "BadgeVariantLog_action_idx" ON "BadgeVariantLog"("action");

-- CreateIndex
CREATE INDEX "BadgeVariantLog_createdAt_idx" ON "BadgeVariantLog"("createdAt");

-- CreateIndex
CREATE INDEX "BadgeColorVariant_studentId_idx" ON "BadgeColorVariant"("studentId");

-- CreateIndex
CREATE INDEX "BadgeColorVariant_badgeType_idx" ON "BadgeColorVariant"("badgeType");

-- CreateIndex
CREATE UNIQUE INDEX "BadgeColorVariant_studentId_badgeType_colorVariant_key" ON "BadgeColorVariant"("studentId", "badgeType", "colorVariant");

-- CreateIndex
CREATE INDEX "Leaderboard_type_scope_rank_idx" ON "Leaderboard"("type", "scope", "rank");

-- CreateIndex
CREATE INDEX "Leaderboard_scope_type_idx" ON "Leaderboard"("scope", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Leaderboard_type_scope_studentId_key" ON "Leaderboard"("type", "scope", "studentId");

-- CreateIndex
CREATE INDEX "LeaderboardSnapshot_takenAt_idx" ON "LeaderboardSnapshot"("takenAt");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardSnapshot_type_scope_studentId_takenAt_key" ON "LeaderboardSnapshot"("type", "scope", "studentId", "takenAt");

-- CreateIndex
CREATE INDEX "SchoolLeaderboardSnapshot_schoolId_idx" ON "SchoolLeaderboardSnapshot"("schoolId");

-- CreateIndex
CREATE INDEX "SchoolLeaderboardSnapshot_takenAt_idx" ON "SchoolLeaderboardSnapshot"("takenAt");

-- CreateIndex
CREATE INDEX "SchoolLeaderboardSnapshot_rank_idx" ON "SchoolLeaderboardSnapshot"("rank");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolLeaderboardSnapshot_schoolId_takenAt_key" ON "SchoolLeaderboardSnapshot"("schoolId", "takenAt");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolSubscription_schoolId_key" ON "SchoolSubscription"("schoolId");

-- CreateIndex
CREATE INDEX "SchoolSubscription_schoolId_idx" ON "SchoolSubscription"("schoolId");

-- CreateIndex
CREATE INDEX "SchoolSubscription_tier_idx" ON "SchoolSubscription"("tier");

-- CreateIndex
CREATE INDEX "SchoolSubscription_renewalDate_idx" ON "SchoolSubscription"("renewalDate");

-- CreateIndex
CREATE INDEX "SchoolAdmin_schoolId_idx" ON "SchoolAdmin"("schoolId");

-- CreateIndex
CREATE INDEX "SchoolAdmin_adminId_idx" ON "SchoolAdmin"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolAdmin_schoolId_adminId_key" ON "SchoolAdmin"("schoolId", "adminId");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolInvite_code_key" ON "SchoolInvite"("code");

-- CreateIndex
CREATE INDEX "SchoolInvite_schoolId_idx" ON "SchoolInvite"("schoolId");

-- CreateIndex
CREATE INDEX "SchoolInvite_code_idx" ON "SchoolInvite"("code");

-- CreateIndex
CREATE INDEX "SchoolInvite_expiresAt_idx" ON "SchoolInvite"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_studentId_key" ON "NotificationPreference"("studentId");

-- CreateIndex
CREATE INDEX "SentEmail_studentId_idx" ON "SentEmail"("studentId");

-- CreateIndex
CREATE INDEX "SentEmail_sentAt_idx" ON "SentEmail"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_referralCode_key" ON "Referral"("referralCode");

-- CreateIndex
CREATE INDEX "Referral_referralCode_idx" ON "Referral"("referralCode");

-- CreateIndex
CREATE INDEX "Referral_referrerId_idx" ON "Referral"("referrerId");

-- CreateIndex
CREATE INDEX "Referral_status_idx" ON "Referral"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralReward_studentId_key" ON "ReferralReward"("studentId");

-- CreateIndex
CREATE INDEX "ReferralReward_studentId_idx" ON "ReferralReward"("studentId");

-- CreateIndex
CREATE INDEX "ConversionFunnel_sourceStudentId_idx" ON "ConversionFunnel"("sourceStudentId");

-- CreateIndex
CREATE INDEX "ConversionFunnel_referralCode_idx" ON "ConversionFunnel"("referralCode");

-- CreateIndex
CREATE INDEX "ConversionFunnel_timestamp_idx" ON "ConversionFunnel"("timestamp");

-- CreateIndex
CREATE INDEX "ConversionFunnel_schoolId_idx" ON "ConversionFunnel"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "ParentEmailPreference_parentEmail_key" ON "ParentEmailPreference"("parentEmail");

-- CreateIndex
CREATE UNIQUE INDEX "ParentEmailPreference_unsubscribeToken_key" ON "ParentEmailPreference"("unsubscribeToken");

-- CreateIndex
CREATE INDEX "ParentEmailPreference_parentEmail_idx" ON "ParentEmailPreference"("parentEmail");

-- CreateIndex
CREATE INDEX "ParentEmailPreference_unsubscribeToken_idx" ON "ParentEmailPreference"("unsubscribeToken");

-- CreateIndex
CREATE INDEX "EmailLog_studentId_idx" ON "EmailLog"("studentId");

-- CreateIndex
CREATE INDEX "EmailLog_parentEmail_idx" ON "EmailLog"("parentEmail");

-- CreateIndex
CREATE INDEX "EmailLog_sentAt_idx" ON "EmailLog"("sentAt");

-- CreateIndex
CREATE INDEX "EmailLog_type_idx" ON "EmailLog"("type");

-- CreateIndex
CREATE INDEX "EmailLog_status_idx" ON "EmailLog"("status");

-- CreateIndex
CREATE INDEX "EmailClick_emailId_idx" ON "EmailClick"("emailId");

-- CreateIndex
CREATE INDEX "EmailClick_eventType_idx" ON "EmailClick"("eventType");

-- CreateIndex
CREATE INDEX "EmailClick_linkType_idx" ON "EmailClick"("linkType");

-- CreateIndex
CREATE INDEX "EmailClick_timestamp_idx" ON "EmailClick"("timestamp");

-- CreateIndex
CREATE INDEX "EmailSchedule_parentEmail_idx" ON "EmailSchedule"("parentEmail");

-- CreateIndex
CREATE INDEX "EmailSchedule_scheduledFor_idx" ON "EmailSchedule"("scheduledFor");

-- CreateIndex
CREATE INDEX "EmailSchedule_sent_idx" ON "EmailSchedule"("sent");

-- CreateIndex
CREATE INDEX "EmailSchedule_createdAt_idx" ON "EmailSchedule"("createdAt");

-- CreateIndex
CREATE INDEX "EmailVariantTest_type_idx" ON "EmailVariantTest"("type");

-- CreateIndex
CREATE INDEX "EmailVariantTest_createdAt_idx" ON "EmailVariantTest"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVariantTest_type_variant_key" ON "EmailVariantTest"("type", "variant");

-- CreateIndex
CREATE INDEX "BetaFeedback_studentId_idx" ON "BetaFeedback"("studentId");

-- CreateIndex
CREATE INDEX "BetaFeedback_sessionType_idx" ON "BetaFeedback"("sessionType");

-- CreateIndex
CREATE INDEX "BetaFeedback_createdAt_idx" ON "BetaFeedback"("createdAt");

-- CreateIndex
CREATE INDEX "BetaFeedback_rating_idx" ON "BetaFeedback"("rating");

-- CreateIndex
CREATE INDEX "VerificationCode_email_idx" ON "VerificationCode"("email");

-- CreateIndex
CREATE INDEX "VerificationCode_expiresAt_idx" ON "VerificationCode"("expiresAt");

-- CreateIndex
CREATE INDEX "VerificationCode_usedAt_idx" ON "VerificationCode"("usedAt");

-- AddForeignKey
ALTER TABLE "School" ADD CONSTRAINT "School_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Manager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgress" ADD CONSTRAINT "StudentProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingProgress" ADD CONSTRAINT "SpeakingProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingPreference" ADD CONSTRAINT "SpeakingPreference_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "ReadingSession" ADD CONSTRAINT "ReadingSession_passageId_fkey" FOREIGN KEY ("passageId") REFERENCES "ReadingPassage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "SchoolLeaderboardSnapshot" ADD CONSTRAINT "SchoolLeaderboardSnapshot_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolSubscription" ADD CONSTRAINT "SchoolSubscription_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolAdmin" ADD CONSTRAINT "SchoolAdmin_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolAdmin" ADD CONSTRAINT "SchoolAdmin_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolInvite" ADD CONSTRAINT "SchoolInvite_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentEmail" ADD CONSTRAINT "SentEmail_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralReward" ADD CONSTRAINT "ReferralReward_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailClick" ADD CONSTRAINT "EmailClick_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "EmailLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BetaFeedback" ADD CONSTRAINT "BetaFeedback_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

