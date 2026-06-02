import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ═══════════════════════════════════════════════════════════════
// POST: Create speaking session
// ═══════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    const { studentId, topicId } = await req.json();

    if (!studentId || !topicId) {
      return NextResponse.json(
        { error: 'Missing studentId or topicId' },
        { status: 400 }
      );
    }

    // Verify student
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Get topic
    const topic = await prisma.conversationTopic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    // Create session
    const session = await prisma.speakingSession.create({
      data: {
        studentId,
        topicId,
        status: 'IN_PROGRESS',
      },
      include: {
        topic: true,
      },
    });

    return NextResponse.json(
      {
        sessionId: session.id,
        topic: {
          id: session.topic.id,
          title: session.topic.title,
          character: session.topic.character,
          openingLine: session.topic.openingLine,
          mode: session.topic.mode,
        },
        startedAt: session.startedAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create speaking session error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// POST: Submit transcript + audio for speaking session
// ═══════════════════════════════════════════════════════════════

export async function PUT(req: NextRequest) {
  try {
    const {
      sessionId,
      transcript,
      audioUrl,
      durationSec,
      wpm,
      fluencyScore,
    } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 }
      );
    }

    // Get session
    const session = await prisma.speakingSession.findUnique({
      where: { id: sessionId },
      include: { student: true },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Update session
    const updatedSession = await prisma.speakingSession.update({
      where: { id: sessionId },
      data: {
        turns: transcript ? [{ text: transcript }] : undefined,
        totalWords: transcript?.split(' ').length || 0,
        durationSec,
        wpm,
        fluencyScore,
        completedAt: new Date(),
        status: 'COMPLETED',
      },
    });

    // Update student progress
    const progress = await prisma.speakingProgress.findUnique({
      where: { studentId: session.studentId },
    });

    if (progress) {
      const newAvgWpm = progress.avgWpm
        ? (progress.avgWpm + (wpm || 0)) / 2
        : wpm || 0;
      const newAvgFluency = progress.avgFluency
        ? (progress.avgFluency + (fluencyScore || 0)) / 2
        : fluencyScore || 0;

      await prisma.speakingProgress.update({
        where: { studentId: session.studentId },
        data: {
          totalSessions: progress.totalSessions + 1,
          avgWpm: newAvgWpm,
          avgFluency: newAvgFluency,
          passedSessions:
            fluencyScore && fluencyScore >= 75
              ? progress.passedSessions + 1
              : progress.passedSessions,
        },
      });
    }

    return NextResponse.json(
      {
        message: 'Speaking session completed',
        session: {
          id: updatedSession.id,
          wpm: updatedSession.wpm,
          fluencyScore: updatedSession.fluencyScore,
          completedAt: updatedSession.completedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Complete speaking session error:', error);
    return NextResponse.json(
      { error: 'Failed to complete session' },
      { status: 500 }
    );
  }
}
