import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const changePasswordSchema = z.object({
  studentId: z.string().min(1, 'Student ID required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = changePasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { studentId, newPassword } = validation.data;

    // Find student
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Only allow B2C users to change password
    if (student.accountType !== 'PUBLIC') {
      return NextResponse.json(
        { error: 'Only B2C users can change password this way' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10);

    // Update password and mark as changed
    await prisma.student.update({
      where: { id: studentId },
      data: {
        passwordHash: hashedPassword,
        passwordChangedAt: new Date()
      }
    });

    return NextResponse.json(
      { message: 'Password changed successfully. Please login again.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
