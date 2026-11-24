import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as crypto from 'crypto'
import * as jwt from 'jsonwebtoken'

/**
 * Global Manager Login API
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

    // Find manager
    const manager = await prisma.manager.findUnique({
      where: { email }
    })

    // isActive check: deactivated managers/SMEs must not log in through this route either
    if (!manager || !manager.isActive) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const hashedPassword = crypto
      .pbkdf2Sync(password, 'salt-wizlingo', 10000, 64, 'sha512')
      .toString('hex')

    if (hashedPassword !== manager.passwordHash) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { managerId: manager.id, email: manager.email, role: 'manager' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      token,
      manager: {
        id: manager.id,
        email: manager.email,
        name: manager.name,
        organizationName: manager.organization
      }
    }, { status: 200 })
  } catch (error) {
    console.error('Manager login error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
