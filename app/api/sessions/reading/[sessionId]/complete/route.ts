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
