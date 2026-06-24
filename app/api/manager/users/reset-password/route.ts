import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  studentId: z.string().min(1, 'Student ID required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

// Verify manager token
function verifyManagerToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    return decoded.managerId ? decoded : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('manager_token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const manager = verifyManagerToken(token);
    if (!manager) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { studentId, newPassword } = validation.data;

    // Find student by ID or userId
    let student = null;
    let searchedById = false;

    // Try by internal ID first
    try {
      student = await prisma.student.findUnique({
        where: { id: studentId }
      });
      searchedById = true;
    } catch (e) {
      // Ignore error, try userId next
    }

    // If not found by ID, try by userId (e.g., WL194299)
    if (!student && !searchedById) {
      try {
        student = await prisma.student.findFirst({
          where: { userId: studentId }
        });
      } catch (e) {
        // Ignore error
      }
    }

    if (!student) {
      return NextResponse.json(
        { error: `Student not found. Please use a valid User ID (e.g., WL194299)` },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10);

    // Update password
    await prisma.student.update({
      where: { id: student.id },
      data: {
        passwordHash: hashedPassword,
        passwordChangedAt: new Date()
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: `✅ Password reset successfully for ${student.userId || student.name || student.id}`
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      {
        error: 'Failed to reset password',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    );
  }
}
