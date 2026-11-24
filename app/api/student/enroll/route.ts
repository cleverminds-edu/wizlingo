import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyStudentToken, getTokenFromRequest } from '@/lib/auth'

/**
 * Student Enrollment API
 * Students can join a class using class code
 */

export async function POST(request: NextRequest) {
  try {
    // Verify student token
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload = verifyStudentToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const { classCode } = await request.json()

    if (!classCode) {
      return NextResponse.json(
        { error: 'Class code is required' },
        { status: 400 }
      )
    }

    // Find class by code
    const classData = await prisma.class.findUnique({
      where: { code: classCode }
    })

    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found. Check the class code and try again.' },
        { status: 404 }
      )
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        classId_studentId: {
          classId: classData.id,
          studentId: payload.studentId
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this class' },
        { status: 409 }
      )
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        classId: classData.id,
        studentId: payload.studentId
      }
    })

    return NextResponse.json({
      enrollment: {
        id: enrollment.id,
        className: classData.name,
        gradeLevel: classData.gradeLevel,
        enrolledAt: enrollment.enrolledAt
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Enrollment error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
