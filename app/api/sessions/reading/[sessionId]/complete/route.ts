import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ═══════════════════════════════════════════════════════════════
// POST: Complete reading session (submit transcript + metrics)
// ═══════════════════════════════════════════════════════════════

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const { transcript, durationSec, wpm, accuracy, missedWords } =
      await req.json();

    // Validate
    if (!transcript || !durationSec) {
      return NextResponse.json(
        { error: 'Missing transcript or duration' },
        { status: 400 }
      );
    }

    // Get session
    const session = await prisma.readingSession.findUnique({
      where: { id: sessionId },
      include: { student: true, passage: true },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Update session
    const updatedSession = await prisma.readingSession.update({
      where: { id: sessionId },
      data: {
        transcript,
        durationSec,
        wpm,
        accuracy,
        missedWords: missedWords || [],
        completedAt: new Date(),
        status: 'COMPLETED',
      },
    });

    // Update student progress
    const progress = await prisma.studentProgress.findUnique({
      where: { studentId: session.studentId },
    });

    if (progress) {
      const newAvgWpm = progress.avgWpm
        ? (progress.avgWpm + (wpm || 0)) / 2
        : wpm || 0;
      const newAvgAccuracy = progress.avgAccuracy
        ? (progress.avgAccuracy + (accuracy || 0)) / 2
        : accuracy || 0;

      await prisma.studentProgress.update({
        where: { studentId: session.studentId },
        data: {
          totalSessions: progress.totalSessions + 1,
          avgWpm: newAvgWpm,
          avgAccuracy: newAvgAccuracy,
          passedSessions:
            accuracy && accuracy >= 80
              ? progress.passedSessions + 1
              : progress.passedSessions,
        },
      });
    }

    // ✨ Award badges if thresholds met
    const badges = await checkAndAwardBadges(session.studentId, {
      wpm,
      accuracy,
    });

    // 🎯 ADAPTIVE: Adjust difficulty level based on performance
    const levelAdjustment = await adjustDifficulty(session.studentId);

    return NextResponse.json(
      {
        message: 'Session completed',
        session: {
          id: updatedSession.id,
          wpm: updatedSession.wpm,
          accuracy: updatedSession.accuracy,
          completedAt: updatedSession.completedAt,
        },
        badgesEarned: badges,
        levelAdjustment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Complete session error:', error);
    return NextResponse.json(
      { error: 'Failed to complete session' },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// Helper: Check and award badges
// ═══════════════════════════════════════════════════════════════

async function checkAndAwardBadges(
  studentId: string,
  metrics: { wpm?: number; accuracy?: number }
) {
  const badgesEarned = [];

  // Badge 1: Spark (First session)
  const sessionCount = await prisma.readingSession.count({
    where: { studentId },
  });

  if (sessionCount === 1) {
    const existingBadge = await prisma.badge.findUnique({
      where: { studentId_type: { studentId, type: 'SPARK' } },
    });

    if (!existingBadge) {
      await prisma.badge.create({
        data: {
          studentId,
          type: 'SPARK',
        },
      });
      badgesEarned.push('SPARK');
    }
  }

  // Badge 2: Word Wizard (80%+ accuracy)
  if ((metrics.accuracy || 0) >= 80) {
    const existingBadge = await prisma.badge.findUnique({
      where: { studentId_type: { studentId, type: 'WORD_WIZARD' } },
    });

    if (!existingBadge) {
      await prisma.badge.create({
        data: {
          studentId,
          type: 'WORD_WIZARD',
        },
      });
      badgesEarned.push('WORD_WIZARD');
    }
  }

  // Badge 3: Speed (100+ WPM)
  if ((metrics.wpm || 0) >= 100) {
    const existingBadge = await prisma.badge.findUnique({
      where: { studentId_type: { studentId, type: 'VOICE_WIZARD' } },
    });

    if (!existingBadge) {
      await prisma.badge.create({
        data: {
          studentId,
          type: 'VOICE_WIZARD',
        },
      });
      badgesEarned.push('VOICE_WIZARD');
    }
  }

  return badgesEarned;
}

// ═══════════════════════════════════════════════════════════════
// Helper: Adjust difficulty level based on recent performance
// ═══════════════════════════════════════════════════════════════

async function adjustDifficulty(studentId: string) {
  try {
    const progress = await prisma.studentProgress.findUnique({
      where: { studentId },
    });

    if (!progress) return null;

    // Get last 5 sessions
    const recentSessions = await prisma.readingSession.findMany({
      where: { studentId },
      orderBy: { completedAt: 'desc' },
      take: 5,
      select: { accuracy: true, completedAt: true },
    });

    // Need at least 1 session to evaluate
    if (recentSessions.length === 0) return null;

    let newLevel = progress.currentLevel;
    let reason = '';

    // LEVEL UP: 5 consecutive sessions with >80% accuracy
    if (recentSessions.length >= 5) {
      const last5AllPassing = recentSessions.every(s => (s.accuracy || 0) >= 80);
      if (last5AllPassing && progress.currentLevel < 3) {
        newLevel = progress.currentLevel + 1;
        reason = 'Leveled up: 5 sessions with 80%+ accuracy';
      }
    }

    // LEVEL DOWN: 3 consecutive sessions with <60% accuracy
    if (recentSessions.length >= 3) {
      const last3AllFailing = recentSessions
        .slice(0, 3)
        .every(s => (s.accuracy || 0) < 60);
      if (last3AllFailing && progress.currentLevel > 1) {
        newLevel = progress.currentLevel - 1;
        reason = 'Leveled down: 3 sessions below 60% accuracy';
      }
    }

    // Update if level changed
    if (newLevel !== progress.currentLevel) {
      await prisma.studentProgress.update({
        where: { studentId },
        data: { currentLevel: newLevel },
      });

      return {
        oldLevel: progress.currentLevel,
        newLevel,
        reason,
      };
    }

    return null;
  } catch (error) {
    console.error('Adjust difficulty error:', error);
    return null;
  }
}
