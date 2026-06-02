import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST() {
  // Only available in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    // Delete all related records for demo student
    const studentId = 'demo-badge-student';

    // Delete badges and certificates
    await prisma.badge.deleteMany({ where: { studentId } });
    await prisma.certificate.deleteMany({ where: { studentId } });

    // Delete sessions
    await prisma.readingSession.deleteMany({ where: { studentId } });
    await prisma.speakingSession.deleteMany({ where: { studentId } });

    // Delete progress
    await prisma.studentProgress.deleteMany({ where: { studentId } });

    // Delete student
    await prisma.student.deleteMany({ where: { id: studentId } });

    return NextResponse.json({
      success: true,
      message: 'Demo account deleted',
    });
  } catch (error) {
    console.error('Error resetting demo:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
