import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyStudentToken } from '@/lib/auth'
import { SERVABLE_TOPIC } from '@/lib/content-status'

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    const student = token ? verifyStudentToken(token) : null
    if (!student) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get student's current speaking level
    const progress = await prisma.studentProgress.findUnique({
      where: { studentId: student.studentId }
    })

    const level = progress?.speakingLevel || 2

    // Fetch topics for student's level
    const topics = await prisma.speakingTopic.findMany({
      where: { level, ...SERVABLE_TOPIC },
      orderBy: { createdAt: 'asc' },
      take: 10
    })

    return NextResponse.json(topics)
  } catch (error) {
    console.error('Error fetching topics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
