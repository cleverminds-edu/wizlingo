import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    const student = await prisma.student.findFirst({
      where: { phone }
    })

    if (!student) {
      return NextResponse.json({ error: 'Phone not found' }, { status: 404 })
    }

    return NextResponse.json({
      message: 'User found!',
      name: student.name,
      phone: student.phone,
      userId: student.userId,
      loginPassword: student.phone
    })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
