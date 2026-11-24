import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as jwt from 'jsonwebtoken'
import * as crypto from 'crypto'

/**
 * Create Class API
 * Teachers can create new classes
 */

export async function POST(request: NextRequest) {
  try {
    // Verify teacher token
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let decoded: any

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key'
      )
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    if (decoded.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Only teachers can create classes' },
        { status: 403 }
      )
    }

    const { name, gradeLevel } = await request.json()

    if (!name || !gradeLevel) {
      return NextResponse.json(
        { error: 'Class name and grade level are required' },
        { status: 400 }
      )
    }

    // Generate unique class code (6 alphanumeric characters)
    const classCode = crypto
      .randomBytes(4)
      .toString('hex')
      .substring(0, 6)
      .toUpperCase()

    const newClass = await prisma.class.create({
      data: {
        name,
        gradeLevel,
        code: classCode,
        teacherId: decoded.teacherId
      }
    })

    return NextResponse.json({
      class: {
        id: newClass.id,
        name: newClass.name,
        gradeLevel: newClass.gradeLevel,
        code: newClass.code,
        createdAt: newClass.createdAt
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Create class error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
