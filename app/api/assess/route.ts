import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scoreReading, gradeToBand, getLevelConfig } from "@/lib/scoring";
import { checkAndAwardBadges } from "@/lib/badges";
import { getReadingFeedback } from "@/lib/ai-feedback";

const PASSES_TO_LEVEL_UP = 3;

export async function POST(request: Request) {
  const authSession = await getSession();
  if (!authSession || authSession.role !== "student") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId, transcript, durationSec } = await request.json();
  if (!sessionId || !transcript) {
    return Response.json({ error: "sessionId and transcript are required" }, { status: 400 });
  }

  const readingSession = await prisma.readingSession.findUnique({
    where: { id: sessionId },
    include: {
      passage: true,
      student: { include: { class: true, progress: true, speakingProgress: true } },
    },
  });
  if (!readingSession) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  const student = readingSession.student;
  const gradeBand = student.progress?.gradeBand ?? gradeToBand(student.class.grade);
  const level = student.progress?.currentLevel ?? 1;

  const score = scoreReading(
    readingSession.passage.content,
    transcript,
    durationSec ?? 60,
    gradeBand,
    level
  );

  await prisma.readingSession.update({
    where: { id: sessionId },
    data: {
      transcript,
      wpm: score.wpm,
      accuracy: score.accuracy,
      missedWords: score.missedWords,
      wrongWords: score.wrongWords,
      durationSec: durationSec ?? 0,
      completedAt: new Date(),
      status: student.class.grade <= 2 ? "NEEDS_REVIEW" : "COMPLETED",
    },
  });

  const totalSessions = (student.progress?.totalSessions ?? 0) + 1;
  const prevPassed = (student.progress?.passedSessions as number) ?? 0;
  const newPassed = score.passed ? prevPassed + 1 : prevPassed;

  // Level up when student has accumulated PASSES_TO_LEVEL_UP passes at current level
  const leveledUp = score.passed && newPassed >= PASSES_TO_LEVEL_UP && level < 3;
  const nextLevel = leveledUp ? level + 1 : level;
  const nextPassed = leveledUp ? 0 : newPassed; // reset counter for the new level

  const prevAvgWpm = student.progress?.avgWpm ?? 0;
  const prevAvgAcc = student.progress?.avgAccuracy ?? 0;
  const newAvgWpm = (prevAvgWpm * (totalSessions - 1) + score.wpm) / totalSessions;
  const newAvgAcc = (prevAvgAcc * (totalSessions - 1) + score.accuracy) / totalSessions;

  await prisma.studentProgress.upsert({
    where: { studentId: student.id },
    update: {
      currentLevel: nextLevel,
      passedSessions: nextPassed,
      totalSessions,
      avgWpm: newAvgWpm,
      avgAccuracy: newAvgAcc,
    },
    create: {
      studentId: student.id,
      gradeBand,
      currentLevel: nextLevel,
      passedSessions: nextPassed,
      totalSessions: 1,
      avgWpm: score.wpm,
      avgAccuracy: score.accuracy,
    },
  });

  const isFirstEverSession =
    (student.progress?.totalSessions ?? 0) === 0 &&
    (student.speakingProgress?.totalSessions ?? 0) === 0;

  const { newBadges, certificateVerifyCode } = await checkAndAwardBadges(student.id, {
    type: "reading",
    passed: score.passed,
    leveledUp,
    currentLevelBeforeUpdate: level,
    isFirstEverSession,
  });

  const config = getLevelConfig(gradeBand, level);

  let aiFeedback = "";
  try {
    aiFeedback = await getReadingFeedback({
      studentName: student.name,
      grade: student.class.grade,
      level,
      wpm: Math.round(score.wpm),
      targetWpm: config.targetWpm,
      accuracy: Math.round(score.accuracy),
      minAccuracy: config.minAccuracy,
      missedWords: score.missedWords,
      passed: score.passed,
      leveledUp,
    });
  } catch {
    // AI feedback is non-critical — session result still succeeds
  }

  // Build badge info for response
  interface BadgeEarnedInfo {
    isNew: boolean;
    type: string;
    narrative: string;
    message: string;
  }

  let badgeEarnedInfo: BadgeEarnedInfo | null = null;

  if (newBadges.length > 0) {
    const badgeType = newBadges[0]; // Get the first new badge
    const badgeNarratives: Record<string, string> = {
      SPARK: "Every great journey begins with a single spark of courage.",
      WORD_WIZARD:
        "You've developed the ancient art of Word Wizardry. By achieving 80%+ accuracy, you've proven that you don't just read words—you understand them.",
      VOICE_WIZARD:
        "Your voice is powerful. By achieving 75%+ fluency in speaking, you've proven that you can express yourself with clarity and confidence.",
      LANGUAGE_WIZARD:
        "You've completed 10+ sessions. That's not luck—that's dedication. That's the mark of a true wizard.",
      GRAND_WIZARD:
        "You've done it. You've become a GRAND WIZARD. You started with a SPARK, mastered words, found your voice, and showed legendary dedication.",
    };

    const badgeMessages: Record<string, string> = {
      SPARK: "You took the first step. You showed up. You read. That takes courage, and we're proud of you! This spark is just the beginning. Your wizard powers are awakening...",
      WORD_WIZARD: `Outstanding Reading Mastery! You achieved ${Math.round(score.accuracy)}%+ accuracy! That's not just reading—that's comprehension mastery.`,
      VOICE_WIZARD:
        "Your Voice Is Powerful! You achieved 75%+ fluency! You speak with clarity. You communicate with confidence. Your voice matters!",
      LANGUAGE_WIZARD:
        "Your Dedication Is Legendary! You completed 10+ sessions! That's consistency. That's discipline. That's a wizard's oath.",
      GRAND_WIZARD:
        "LEGENDARY. UNSTOPPABLE. EXTRAORDINARY. Congratulations! You've earned ALL FOUR badges. You've mastered reading. You've mastered speaking. You've shown legendary dedication.",
    };

    badgeEarnedInfo = {
      isNew: true,
      type: badgeType,
      narrative: badgeNarratives[badgeType] || "",
      message: badgeMessages[badgeType] || "",
    };
  }

  return Response.json({
    ...score,
    transcript,
    targetWpm: config.targetWpm,
    minAccuracy: config.minAccuracy,
    leveledUp,
    newLevel: nextLevel,
    passedSessions: nextPassed,
    newBadges,
    certificateVerifyCode,
    badgeEarned: badgeEarnedInfo,
    aiFeedback,
  });
}
