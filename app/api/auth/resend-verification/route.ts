import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

function generateVerificationCode(): string {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    // Generate new verification code
    const verificationCode = generateVerificationCode();

    // Log it (in production, send via email)
    console.log(`New verification code for ${email}: ${verificationCode}`);

    // TODO: Send verification email with the code

    return NextResponse.json(
      {
        message: 'Verification code sent. Check your email.',
        verificationCodeForDev: verificationCode, // Remove in production
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Failed to resend verification code' },
      { status: 500 }
    );
  }
}
