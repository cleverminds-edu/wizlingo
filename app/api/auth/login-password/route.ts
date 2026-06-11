import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import prisma from '@/lib/prisma';
import { validateBody } from '@/lib/validation';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const loginPasswordSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  password: z.string().min(6, 'Password required'),
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

    const { phone, password } = validation.data;

    // Find student by phone
    const student = await prisma.student.findUnique({
      where: { phone },
      select: { id: true, phone: true, passwordHash: true },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Phone number not found' },
        { status: 401 }
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
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { studentId: student.id, phone: student.phone },
      process.env.JWT_SECRET || 'secret',
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
