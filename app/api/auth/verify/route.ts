import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Missing email or verification code' },
        { status: 400 }
      );
    }

    // Find student by email
    const student = await prisma.student.findUnique({
      where: { admissionNumber: email },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find verification code in database
    const verificationRecord = await prisma.verificationCode.findFirst({
      where: {
        email,
        code,
        usedAt: null, // Not yet used
      },
    });

    if (!verificationRecord) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (new Date() > verificationRecord.expiresAt) {
      return NextResponse.json(
        { error: 'Verification code has expired' },
        { status: 400 }
      );
    }

    // Mark code as used
    await prisma.verificationCode.update({
      where: { id: verificationRecord.id },
      data: { usedAt: new Date() },
    });

    return NextResponse.json(
      {
        message: 'Email verified successfully',
        student: {
          id: student.id,
          name: student.name,
          email: email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verification error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
