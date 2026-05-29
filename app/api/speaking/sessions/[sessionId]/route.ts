import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scoreSpeakingSession } from "@/lib/speaking-score";
import { gradeToBand } from "@/lib/scoring";
import { TurnRecord } from "@/lib/speaking-score";
import { checkAndAwardBadges } from "@/lib/badges";
import { getSpeakingFeedback } from "@/lib/ai-feedback";

const PASSES_TO_LEVEL_UP = 3;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const authSession = await getSession();
  if (!authSession || authSession.role !== "student") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;
  const body = await request.json();
  const { turns, totalWords, durationSec } = body as {
    turns: TurnRecord[];
    totalWords: number;
    durationSec: number;
  };

  const speakingSession = await prisma.speakingSession.findUnique({
    where: { id: sessionId },
    include: {
      student: { include: { class: true, speakingProgress: true } },
    },
  });
  if (!speakingSession) return Response.json({ error: "Session not found" }, { status: 404 });
  if (speakingSession.studentId !== authSession.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const student = speakingSession.student;
  const gradeBand = gradeToBand(student.class.grade);
  const level = student.speakingProgress?.currentLevel ?? 1;

  const score = scoreSpeakingSession(turns, gradeBand, level);

  await prisma.speakingSession.update({
    where: { id: sessionId },
    data: {
      turns: turns as object[],
      totalWords: score.totalWords,
      durationSec: score.durationSec,
      wpm: score.wpm,
      fluencyScore: score.fluencyScore,
      completedAt: new Date(),
      status: "COMPLETED",
    },
  });

  const totalSessions = (student.speakingProgress?.totalSessions ?? 0) + 1;
  const prevPassed = student.speakingProgress?.passedSessions ?? 0;
  const newPassed = score.passed ? prevPassed + 1 : prevPassed;

  const leveledUp = score.passed && newPassed >= PASSES_TO_LEVEL_UP && level < 3;
  const nextLevel = leveledUp ? level + 1 : level;
  const nextPassed = leveledUp ? 0 : newPassed;

  const prevAvgWpm = student.speakingProgress?.avgWpm ?? 0;
  const prevAvgFluency = student.speakingProgress?.avgFluency ?? 0;
  const newAvgWpm = (prevAvgWpm * (totalSessions - 1) + score.wpm) / totalSessions;
  const newAvgFluency = (prevAvgFluency * (totalSessions - 1) + score.fluencyScore) / totalSessions;

  await prisma.speakingProgress.upsert({
    where: { studentId: student.id },
    update: {
      currentLevel: nextLevel,
      passedSessions: nextPassed,
      totalSessions,
      avgWpm: newAvgWpm,
      avgFluency: newAvgFluency,
    },
    create: {
      studentId: student.id,
      currentLevel: nextLevel,
      passedSessions: nextPassed,
      totalSessions: 1,
      avgWpm: score.wpm,
      avgFluency: score.fluencyScore,
    },
  });

  const isFirstEverSession =
    (student.speakingProgress?.totalSessions ?? 0) === 0 &&
    !(await prisma.readingSession.findFirst({
      where: { studentId: student.id, status: { not: "IN_PROGRESS" } },
    }));

  const { newBadges, certificateVerifyCode } = await checkAndAwardBadges(student.id, {
    type: "speaking",
    passed: score.passed,
    leveledUp,
    currentLevelBeforeUpdate: level,
    isFirstEverSession: !!isFirstEverSession,
  });

  let aiFeedback = "";
  try {
    aiFeedback = await getSpeakingFeedback({
      studentName: student.name,
      grade: student.class.grade,
      level,
      wpm: Math.round(score.wpm),
      fluencyScore: Math.round(score.fluencyScore),
      passed: score.passed,
      leveledUp,
    });
  } catch {
    // AI feedback is non-critical
  }

  return Response.json({
    ...score,
    leveledUp,
    newLevel: nextLevel,
    passedSessions: nextPassed,
    newBadges,
    certificateVerifyCode,
    aiFeedback,
  });
}
