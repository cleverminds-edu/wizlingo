import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { validateBody } from '@/lib/validation';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const loginPasswordSchema = z.object({
  username: z.string().min(2, 'UserID or phone required'), // Either UserID (WL001) or phone
  password: z.string().min(1, 'Password required'),
});

export async function POST(request: NextRequest) {
  try {
    const validation = await validateBody(request, loginPasswordSchema);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { username, password } = validation.data;

    let student = null;

    try {
      // Check if it's a UserID (starts with WL) or phone number
      if (username.startsWith('WL') || username.startsWith('wl')) {
        // B2C login with UserID
        student = await prisma.student.findUnique({
          where: { userId: username.toUpperCase() }
        });

        if (!student) {
          return NextResponse.json(
            { error: 'UserID not found' },
            { status: 401 }
          );
        }
      } else if (/^\d{10}$/.test(username)) {
        // School login with phone
        student = await prisma.student.findUnique({
          where: { phone: username }
        });

        if (!student) {
          return NextResponse.json(
            { error: 'Phone number not found' },
            { status: 401 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Invalid UserID or phone format' },
          { status: 400 }
        );
      }
    } catch (dbError) {
      console.error('Database error finding student:', dbError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    // Check password
    if (!student.passwordHash) {
      return NextResponse.json(
        { error: 'Account uses OTP login' },
        { status: 401 }
      );
    }

    const isPasswordValid = await compare(password, student.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Force password change on first login for B2C users (PHONE_ID)
    if (student.loginType === 'PHONE_ID' && !student.passwordChangedAt) {
      return NextResponse.json(
        {
          status: 'FORCE_PASSWORD_CHANGE',
          studentId: student.id,
          message: 'Please set a new password before accessing the app'
        },
        { status: 200 }
      );
    }

    // Create JWT token with role for auth checks
    const secret = process.env.JWT_SECRET || 'secret';
    const token = jwt.sign(
      { studentId: student.id, phone: student.phone, role: 'student' },
      secret,
      { expiresIn: '30d' }
    );

    return NextResponse.json(
      { message: 'Login successful', token, studentId: student.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}
