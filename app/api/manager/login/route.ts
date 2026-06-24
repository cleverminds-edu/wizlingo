import { NextRequest, NextResponse } from 'next/server';
import { hash, compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Find manager
    const manager = await prisma.manager.findUnique({
      where: { email }
    });

    if (!manager) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!manager.isActive) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 401 }
      );
    }

    // Compare password
    const passwordMatch = await compare(password, manager.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        managerId: manager.id,
        email: manager.email,
        role: manager.role,
        name: manager.name
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    // Update last login
    await prisma.manager.update({
      where: { id: manager.id },
      data: { lastLogin: new Date() }
    });

    // Set secure cookie
    const response = NextResponse.json(
      {
        success: true,
        manager: {
          id: manager.id,
          name: manager.name,
          email: manager.email,
          role: manager.role
        }
      },
      { status: 200 }
    );

    response.cookies.set({
      name: 'manager_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60
    });

    return response;
  } catch (error: any) {
    console.error('Manager login error:', error);

    // Check if Manager table doesn't exist
    if (error.message?.includes('does not exist') || error.code === 'P1010') {
      return NextResponse.json(
        {
          error: 'Manager service not initialized',
          hint: 'Please visit /api/manager/init to initialize the manager system'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Login failed: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
