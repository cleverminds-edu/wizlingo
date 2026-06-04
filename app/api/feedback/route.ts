import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { studentId, sessionType, rating, selectedIssues, comment } = await req.json();

    if (!studentId || !sessionType || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields: studentId, sessionType, rating' },
        { status: 400 }
      );
    }

    if (![1, 2, 3, 4, 5].includes(rating)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (!['reading', 'speaking'].includes(sessionType)) {
      return NextResponse.json(
        { error: 'sessionType must be "reading" or "speaking"' },
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

    // Create feedback entry
    const feedback = await prisma.betaFeedback.create({
      data: {
        studentId,
        sessionType,
        rating,
        selectedIssues: selectedIssues || [],
        comment: comment || null,
      },
    });

    return NextResponse.json(
      {
        message: 'Feedback submitted successfully',
        feedback: {
          id: feedback.id,
          rating: feedback.rating,
          createdAt: feedback.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
