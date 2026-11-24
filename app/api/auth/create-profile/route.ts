import { NextRequest, NextResponse } from 'next/server';
import { gradeToCategory } from '@/lib/student-class';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { phone, name, grade, dateOfBirth } = await request.json();

    // Validate inputs
    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters' },
        { status: 400 }
      );
    }

    if (!grade || isNaN(parseInt(grade))) {
      return NextResponse.json(
        { error: 'Invalid grade' },
        { status: 400 }
      );
    }

    if (!dateOfBirth) {
      return NextResponse.json(
        { error: 'Date of birth is required' },
        { status: 400 }
      );
    }

    // Check if student already exists with this phone
    const existingStudent = await prisma.student.findFirst({
      where: { phone },
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: 'Account already exists for this phone number' },
        { status: 400 }
      );
    }

    // Create student account
    const student = await prisma.student.create({
      data: {
        name: name.trim(),
        phone,
        // Student has no numeric grade column; store the grade category instead.
        gradeCategory: gradeToCategory(parseInt(grade)),
        dateOfBirth: new Date(dateOfBirth),
        accountType: 'B2C',
        loginType: 'PHONE_ID',
      },
    });

    // Create initial student progress record
    await prisma.studentProgress.create({
      data: {
        studentId: student.id, // all scores start at their schema defaults (0)
      },
    });

    return NextResponse.json(
      {
        message: 'Profile created successfully',
        student: {
          id: student.id,
          name: student.name,
          phone: student.phone,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating profile:', error);
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}
