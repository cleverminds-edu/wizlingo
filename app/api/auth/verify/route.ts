import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Store verification codes in memory (in production, use a database or session store)
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

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

    // In a real app, you'd check the code against a database
    // For now, accept any non-empty code as valid (dev mode)
    // TODO: Implement proper verification code validation

    // Mark user as verified (if you have a field for that)
    // For now, just return success
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
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
