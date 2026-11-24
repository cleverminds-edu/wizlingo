import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyStudentToken } from '@/lib/auth'
import { SERVABLE_PASSAGE } from '@/lib/content-status'

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    const student = token ? verifyStudentToken(token) : null
    if (!student) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get student's current reading level
    const progress = await prisma.studentProgress.findUnique({
      where: { studentId: student.studentId }
    })

    const level = progress?.readingLevel || 2

    // Fetch passages for student's level
    const passages = await prisma.readingPassage.findMany({
      where: { level, ...SERVABLE_PASSAGE },
      orderBy: { createdAt: 'asc' },
      take: 10
    })

    return NextResponse.json(passages)
  } catch (error) {
    console.error('Error fetching passages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
