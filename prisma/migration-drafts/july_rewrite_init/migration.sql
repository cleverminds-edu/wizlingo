-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "currentLevel" INTEGER NOT NULL DEFAULT 2,
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActivityDate" TIMESTAMP(3),
    "totalXP" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProgress" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "readingLevel" INTEGER NOT NULL DEFAULT 2,
    "speakingLevel" INTEGER NOT NULL DEFAULT 2,
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
CREATE TABLE "ReadingSession" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "passageId" TEXT NOT NULL,
    "wpm" DOUBLE PRECISION,
    "accuracy" DOUBLE PRECISION,
    "missedWords" INTEGER,
    "completedAt" TIMESTAMP(3),
    "durationSec" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeakingSession" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "audioUrl" TEXT,
    "transcript" TEXT,
    "fluencyScore" DOUBLE PRECISION,
    "pronunciationScore" DOUBLE PRECISION,
    "completedAt" TIMESTAMP(3),
    "durationSec" INTEGER,
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
    "listeningScore" DOUBLE PRECISION,
    "speakingScore" DOUBLE PRECISION,
    "readingScore" DOUBLE PRECISION,
    "writingScore" DOUBLE PRECISION,
    "dailyScore" DOUBLE PRECISION,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingPassage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "topic" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadingPassage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeakingTopic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "topic" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

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
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leaderboard" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "xpTotal" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_phone_key" ON "Student"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");

-- CreateIndex
CREATE INDEX "Student_email_idx" ON "Student"("email");

-- CreateIndex
CREATE INDEX "Student_phone_idx" ON "Student"("phone");

-- CreateIndex
CREATE INDEX "Student_userId_idx" ON "Student"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProgress_studentId_key" ON "StudentProgress"("studentId");

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
CREATE INDEX "Badge_studentId_idx" ON "Badge"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_studentId_type_key" ON "Badge"("studentId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Leaderboard_studentId_key" ON "Leaderboard"("studentId");

-- AddForeignKey
ALTER TABLE "StudentProgress" ADD CONSTRAINT "StudentProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "Badge" ADD CONSTRAINT "Badge_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leaderboard" ADD CONSTRAINT "Leaderboard_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
