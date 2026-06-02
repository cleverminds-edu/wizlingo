// @ts-ignore
import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, accountType } = await req.json();

    // Validate
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.student.findUnique({
      where: { id: email }, // Using email as temp ID
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const student = await prisma.student.create({
      data: {
        admissionNumber: email,
        name,
        accountType: accountType || 'PUBLIC', // PUBLIC for beta, SCHOOL for schools
        pin: password, // Store plain for school-based PIN access (TODO: better security)
        classId: 'default', // TODO: Handle proper class assignment
      },
    });

    // Create progress record
    await prisma.studentProgress.create({
      data: {
        studentId: student.id,
        gradeBand: 'BAND_3_5', // Default to middle grades
      },
    });

    // TODO: Create session token (JWT or NextAuth)

    return NextResponse.json(
      {
        message: 'User created successfully',
        student: {
          id: student.id,
          name: student.name,
          accountType: student.accountType,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Signup failed' },
      { status: 500 }
    );
  }
}
