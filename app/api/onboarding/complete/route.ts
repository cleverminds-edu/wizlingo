import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { studentId } = await req.json();

    if (!studentId) {
      return NextResponse.json(
        { error: 'Missing studentId' },
        { status: 400 }
      );
    }

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
