import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { validateBody } from '@/lib/validation';
import { z } from 'zod';

const signupPasswordSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const validation = await validateBody(request, signupPasswordSchema);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { phone, password } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.student.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Phone number already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create student with password
    const student = await prisma.student.create({
      data: {
        phone,
        passwordHash: hashedPassword,
        hasCompletedOnboarding: false,
      },
    });

    return NextResponse.json(
      { message: 'Account created successfully', studentId: student.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
