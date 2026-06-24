import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const resetSchema = z.object({
  userId: z.string().min(1, 'User ID required (e.g., WL194299)'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

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
    const token = request.cookies.get('manager_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const manager = verifyManagerToken(token);
    if (!manager) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const validation = resetSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { userId, newPassword } = validation.data;

    // Find student by userId
    const student = await prisma.student.findUnique({
      where: { userId }
    });

    if (!student) {
      return NextResponse.json(
        { error: `User ${userId} not found in system` },
        { status: 404 }
      );
    }

    // Hash password
    const hashedPassword = await hash(newPassword, 10);

    // Update student password
    await prisma.student.update({
      where: { id: student.id },
      data: {
        passwordHash: hashedPassword,
        passwordChangedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: `✅ Password reset successfully for ${student.name || student.userId}`,
      user: {
        userId: student.userId,
        name: student.name,
        phone: student.phone
      }
    });
  } catch (error: any) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password: ' + error.message },
      { status: 500 }
    );
  }
}
