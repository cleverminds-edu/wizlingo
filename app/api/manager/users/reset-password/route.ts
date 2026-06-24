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

    // Try by internal ID first
    try {
      student = await prisma.student.findUnique({
        where: { id: studentId }
      });
    } catch (e) {
      // If not found, try by userId
    }

    // If not found by ID, try by userId (e.g., WL194299)
    if (!student) {
      student = await prisma.student.findUnique({
        where: { userId: studentId }
      });
    }

    if (!student) {
      return NextResponse.json(
        { error: `Student not found. Please use a valid Student ID or User ID (e.g., WL194299)` },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10);

    // Update password
    await prisma.student.update({
      where: { id: studentId },
      data: {
        passwordHash: hashedPassword,
        passwordChangedAt: new Date()
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: `Password reset for user ${student.userId || student.id}`
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
