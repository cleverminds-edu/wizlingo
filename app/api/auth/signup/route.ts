// @ts-ignore
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function generateVerificationCode(): string {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

export async function POST(req: NextRequest) {
  try {
    const { email, name, grade, dateOfBirth, accountType } = await req.json();

    // Validate required fields
    if (!email || !name || !grade || !dateOfBirth) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user already exists by admission number (email-based)
    const existingUser = await prisma.student.findUnique({
      where: { admissionNumber: email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered. Please sign in instead.' },
        { status: 409 }
      );
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeHash = await bcrypt.hash(verificationCode, 10);

    // Generate a temporary PIN (can be customized later)
    const tempPin = Math.floor(1000 + Math.random() * 9000).toString();

    // Map grade to gradeBand
    const gradeNum = parseInt(grade);
    let gradeBand = 'BAND_3_5';
    if (gradeNum <= 2) gradeBand = 'BAND_1_2';
    else if (gradeNum <= 5) gradeBand = 'BAND_3_5';
    else if (gradeNum <= 8) gradeBand = 'BAND_6_8';
    else gradeBand = 'BAND_9_10';

    // Get or create a default class for public signups
    let defaultClass = await prisma.class.findFirst({
      where: {
        grade: gradeNum,
        section: 'Public',
      },
    });

    if (!defaultClass) {
      // Create a school for public users if it doesn't exist
      let publicSchool = await prisma.school.findFirst({
        where: { code: 'PUBLIC' },
      });

      if (!publicSchool) {
        publicSchool = await prisma.school.create({
          data: {
            name: 'WizLingo Public',
            code: 'PUBLIC',
          },
        });
      }

      defaultClass = await prisma.class.create({
        data: {
          grade: gradeNum,
          section: 'Public',
          schoolId: publicSchool.id,
        },
      });
    }

    // Create student
    const student = await prisma.student.create({
      data: {
        admissionNumber: email,
        name,
        pin: tempPin,
        classId: defaultClass.id,
        accountType: accountType || 'PUBLIC',
        parentEmail: email, // Use signup email as parent email for public users
      },
    });

    // Create progress record
    await prisma.studentProgress.create({
      data: {
        studentId: student.id,
        gradeBand: gradeBand as any,
      },
    });

    // TODO: Store verification code in a temporary table or use a session
    // For now, we'll log it (in production, send via email)
    console.log(`Verification code for ${email}: ${verificationCode}`);

    // TODO: Send verification email with the code
    // This would typically be done via a service like SendGrid, AWS SES, etc.

    return NextResponse.json(
      {
        message: 'Signup successful. Check your email for verification code.',
        student: {
          id: student.id,
          name: student.name,
          email: email,
          accountType: student.accountType,
        },
        verificationCodeForDev: verificationCode, // Remove in production
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Signup failed. Please try again.' },
      { status: 500 }
    );
  }
}
