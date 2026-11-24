import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyStudentToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    const student = token ? verifyStudentToken(token) : null
    if (!student) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get student's current writing level
    const progress = await prisma.studentProgress.findUnique({
      where: { studentId: student.studentId }
    })

    const level = progress?.writingLevel || 1

    // Fetch prompts for student's level
    const prompts = await prisma.writingPrompt.findMany({
      where: { level },
      orderBy: { createdAt: 'asc' },
      take: 10
    })

    return NextResponse.json(prompts)
  } catch (error) {
    console.error('Error fetching prompts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
