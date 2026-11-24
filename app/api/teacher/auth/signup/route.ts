import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as crypto from 'crypto'
import * as jwt from 'jsonwebtoken'

/**
 * Teacher Signup API
 * Creates teacher accounts for school administrators
 */

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, schoolName, phone } = await request.json()

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Check if teacher already exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { email }
    })

    if (existingTeacher) {
      return NextResponse.json(
        { error: 'Teacher account already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = crypto
      .pbkdf2Sync(password, 'salt-wizlingo', 10000, 64, 'sha512')
      .toString('hex')

    // Create teacher account
    const teacher = await prisma.teacher.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name,
        schoolName: schoolName || undefined,
        phone: phone || undefined
      }
    })

    // Generate JWT token
    const token = jwt.sign(
      { teacherId: teacher.id, email: teacher.email, role: 'teacher' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      token,
      teacher: {
        id: teacher.id,
        email: teacher.email,
        name: teacher.name,
        schoolName: teacher.schoolName
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Teacher signup error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
