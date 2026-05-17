import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scoreReading, gradeToBand, getLevelConfig } from "@/lib/scoring";

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
      student: { include: { class: true, progress: true } },
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

  const config = getLevelConfig(gradeBand, level);
  return Response.json({
    ...score,
    transcript,
    targetWpm: config.targetWpm,
    minAccuracy: config.minAccuracy,
    leveledUp,
    newLevel: nextLevel,
    passedSessions: nextPassed,
  });
}
