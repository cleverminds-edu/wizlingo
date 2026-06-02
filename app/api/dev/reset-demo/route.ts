import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Only available in development
if (process.env.NODE_ENV === 'production') {
  throw new Error('This endpoint is only available in development');
}

export async function POST() {
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
