import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { validateBody } from '@/lib/validation';
import { z } from 'zod';

const signupAutoPasswordSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
});

export async function POST(request: NextRequest) {
  try {
    const validation = await validateBody(request, signupAutoPasswordSchema);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { phone } = validation.data;

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

    // Generate auto password: "Wiz" + last 6 digits of phone
    const autoPassword = `Wiz${phone.slice(-6)}`;

    // Hash password
    const hashedPassword = await hash(autoPassword, 10);

    // Create student with auto-generated password
    const student = await prisma.student.create({
      data: {
        phone,
        passwordHash: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        message: 'Account created successfully',
        studentId: student.id,
        password: autoPassword,
      },
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
