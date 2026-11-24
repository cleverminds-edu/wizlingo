import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as crypto from 'crypto'
import * as jwt from 'jsonwebtoken'

/**
 * Teacher Login API
 */

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find teacher
    const teacher = await prisma.teacher.findUnique({
      where: { email }
    })

    if (!teacher) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const hashedPassword = crypto
      .pbkdf2Sync(password, 'salt-wizlingo', 10000, 64, 'sha512')
      .toString('hex')

    if (hashedPassword !== teacher.passwordHash) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

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
    }, { status: 200 })
  } catch (error) {
    console.error('Teacher login error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
