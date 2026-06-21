import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { validateBody } from '@/lib/validation';
import { calculateAgeBand } from '@/lib/age-band';
import { ensureSchema } from '../ensure-schema';
import { z } from 'zod';

const signupDetailedSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  classId: z.string().optional(),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
});

export async function POST(request: NextRequest) {
  try {
    // Ensure database schema exists
    await ensureSchema();
    const validation = await validateBody(request, signupDetailedSchema);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { name, dateOfBirth, classId, phone } = validation.data;

    // Check if phone already exists
    const existingPhone = await prisma.student.findUnique({
      where: { phone },
    });

    if (existingPhone) {
      return NextResponse.json(
        { error: 'Phone number already registered' },
        { status: 409 }
      );
    }

    // For B2C signups, classId is optional and we don't validate it
    // B2C students don't need to be assigned to a class

    // Generate password: first 3 letters of name + YYYY + last 3 digits of phone
    const namePrefix = name.slice(0, 3).toUpperCase();
    const dobYear = new Date(dateOfBirth).getFullYear().toString();
    const phoneSuffix = phone.slice(-3);
    const autoPassword = `${namePrefix}${dobYear}${phoneSuffix}`;

    // Hash password
    const hashedPassword = await hash(autoPassword, 10);

    // Create student
    const dob = new Date(dateOfBirth);
    const student = await prisma.student.create({
      data: {
        name,
        dateOfBirth: dob,
        phone,
        classId: classId || null,
        passwordHash: hashedPassword,
        accountType: 'B2C',
      },
      include: {
        class: true,
      },
    });

    // Calculate age band and create progress record
    const ageBand = calculateAgeBand(dob);
    // Map age band to grade band
    const gradeBandMap: Record<string, any> = {
      '6-8': 'BAND_1_2',
      '9-11': 'BAND_3_5',
      '12-14': 'BAND_6_8',
      '15+': 'BAND_9_10',
    };
    await prisma.studentProgress.create({
      data: {
        studentId: student.id,
        currentLevel: 2,
        gradeBand: gradeBandMap[ageBand] || 'BAND_3_5',
      },
    });

    return NextResponse.json(
      {
        message: 'Account created successfully',
        studentId: student.id,
        password: autoPassword,
        studentData: {
          name: student.name,
          phone: student.phone,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating account:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create account', details: errorMessage },
      { status: 500 }
    );
  }
}
