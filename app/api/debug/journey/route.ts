import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyStudentToken, getTokenFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    let token = getTokenFromRequest(request)

    // Also check for token in cookies or URL
    if (!token) {
      token = request.cookies.get('token')?.value || request.nextUrl.searchParams.get('token') || ''
    }

    if (!token) {
      return NextResponse.json({ error: 'No token found in headers or cookies' }, { status: 401 })
    }

    const payload = verifyStudentToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const studentId = payload.studentId

    // Get student
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    })

    // Get journey
    const journey = await prisma.journeyProgress.findUnique({
      where: { studentId }
    })

    // Get sessions
    const sessions = await prisma.lessonSession.findMany({
      where: { studentId },
      include: { lesson: true }
    })

    return NextResponse.json({
      student: {
        id: student?.id,
        name: student?.name,
        totalXP: student?.totalXP
      },
      journey: journey,
      sessions: sessions.map(s => ({
        id: s.id,
        lessonId: s.lessonId,
        lessonTitle: s.lesson?.title,
        score: s.score,
        passed: s.passed,
        xpEarned: s.xpEarned,
        completedAt: s.completedAt
      }))
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
