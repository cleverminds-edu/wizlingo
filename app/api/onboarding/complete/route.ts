import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateBody, onboardingCompleteSchema } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    // Validate request body
    const validation = await validateBody(req, onboardingCompleteSchema);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { studentId } = validation.data;

    const student = await prisma.student.update({
      where: { id: studentId },
      data: { hasSeenOnboarding: true },
    });

    return NextResponse.json(
      { message: 'Onboarding marked as complete', student },
      { status: 200 }
    );
  } catch (error) {
    console.error('Onboarding complete error:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
