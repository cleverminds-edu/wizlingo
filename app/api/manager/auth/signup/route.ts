import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as crypto from 'crypto'
import * as jwt from 'jsonwebtoken'

/**
 * Global Manager Signup API
 * Creates accounts for organization managers
 */

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, organizationName, phone } = await request.json()

    // Manager accounts now live in the production Manager table (schema replacement, row 3).
    // Public self-signup would give anyone a manager-portal account, so it is off unless
    // explicitly enabled. Edvanta admins create managers/SMEs instead.
    if (process.env.ALLOW_MANAGER_SIGNUP !== 'true') {
      return NextResponse.json(
        { error: 'Manager self-signup is disabled. Ask an Edvanta admin for an account.' },
        { status: 403 }
      )
    }

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Check if manager already exists
    const existingManager = await prisma.manager.findUnique({
      where: { email }
    })

    if (existingManager) {
      return NextResponse.json(
        { error: 'Manager account already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = crypto
      .pbkdf2Sync(password, 'salt-wizlingo', 10000, 64, 'sha512')
      .toString('hex')

    // Create manager account
    const manager = await prisma.manager.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name,
        organization: organizationName || undefined,
        phone: phone || undefined,
        role: 'MANAGER'
      }
    })

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
    }, { status: 201 })
  } catch (error) {
    console.error('Manager signup error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
