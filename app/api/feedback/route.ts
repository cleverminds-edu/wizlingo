import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { validateBody, feedbackSchema } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 50 requests per hour per IP
    const clientIp = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
    const rateLimitKey = `feedback:${clientIp}`;
    const rateLimitResult = rateLimit(rateLimitKey, RATE_LIMITS.FEEDBACK.limit, RATE_LIMITS.FEEDBACK.windowMs);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many feedback submissions. Please try again later.' },
        { status: 429, headers: { 'Retry-After': Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000).toString() } }
      );
    }

    // Validate request body
    const validation = await validateBody(req, feedbackSchema);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { studentId, sessionType, rating, selectedIssues, comment } = validation.data;

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
