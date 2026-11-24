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

    // Get student's current listening level
    const progress = await prisma.studentProgress.findUnique({
      where: { studentId: student.studentId }
    })

    const level = progress?.listeningLevel || 1

    // Fetch clips for student's level
    const clips = await prisma.listeningClip.findMany({
      where: { level },
      orderBy: { createdAt: 'asc' },
      take: 10
    })

    return NextResponse.json(clips)
  } catch (error) {
    console.error('Error fetching clips:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
