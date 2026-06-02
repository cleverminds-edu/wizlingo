import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ═══════════════════════════════════════════════════════════════
// POST: Create a reading session
// ═══════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    const { studentId, passageId } = await req.json();

    if (!studentId || !passageId) {
      return NextResponse.json(
        { error: 'Missing studentId or passageId' },
        { status: 400 }
      );
    }

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Get passage
    const passage = await prisma.readingPassage.findUnique({
      where: { id: passageId },
    });

    if (!passage) {
      return NextResponse.json(
        { error: 'Passage not found' },
        { status: 404 }
      );
    }

    // Create session
    const session = await prisma.readingSession.create({
      data: {
        studentId,
        passageId,
        status: 'IN_PROGRESS',
      },
      include: {
        passage: true,
      },
    });

    return NextResponse.json(
      {
        sessionId: session.id,
        passage: {
          id: session.passage.id,
          title: session.passage.title,
          content: session.passage.content,
          wordCount: session.passage.wordCount,
          gradeBand: session.passage.gradeBand,
          level: session.passage.level,
        },
        startedAt: session.startedAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// GET: Get user's reading sessions
// ═══════════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
  try {
    const studentId = req.nextUrl.searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Missing studentId' },
        { status: 400 }
      );
    }

    const sessions = await prisma.readingSession.findMany({
      where: { studentId },
      include: {
        passage: {
          select: {
            title: true,
            gradeBand: true,
            level: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20, // Last 20 sessions
    });

    return NextResponse.json({ sessions }, { status: 200 });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}
