import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Teacher Analytics API
 * Gets comprehensive class and student progress analytics
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params

    // Get class with enrollments
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        enrollments: true,
        teacher: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }

    // Get all enrolled students' progress
    const studentIds = classData.enrollments.map(e => e.studentId)

    const studentProgress = await Promise.all(
      studentIds.map(async (studentId) => {
        const student = await prisma.student.findUnique({
          where: { id: studentId },
          select: {
            id: true,
            name: true,
            email: true,
            userId: true,
            totalXP: true,
            createdAt: true
          }
        })

        const progress = await prisma.studentProgress.findUnique({
          where: { studentId }
        })

        const journey = await prisma.journeyProgress.findUnique({
          where: { studentId }
        })

        const sessions = await prisma.lessonSession.findMany({
          where: { studentId },
          select: {
            score: true,
            passed: true,
            createdAt: true
          }
        })

        const avgScore = sessions.length > 0
          ? Math.round(sessions.reduce((sum, s) => sum + (s.score || 0), 0) / sessions.length)
          : 0

        const passRate = sessions.length > 0
          ? Math.round((sessions.filter(s => s.passed).length / sessions.length) * 100)
          : 0

        return {
          id: student?.id,
          name: student?.name,
          email: student?.email,
          userId: student?.userId,
          totalXP: student?.totalXP || 0,
          sessionCount: sessions.length,
          avgScore,
          passRate,
          currentStage: journey?.currentStage || 'STAGE_1',
          stageProgress: journey?.stageProgress || 0,
          readingScore: progress?.avgReadingScore || 0,
          speakingScore: progress?.avgSpeakingScore || 0,
          listeningScore: progress?.avgListeningScore || 0,
          writingScore: progress?.avgWritingScore || 0,
          masteredStages: journey?.masteredStages?.length || 0,
          joinedAt: student?.createdAt
        }
      })
    )

    // Calculate class-wide analytics
    const classStats = {
      totalStudents: studentIds.length,
      activeStudents: studentProgress.filter(s => s.sessionCount > 0).length,
      avgClassScore: studentProgress.length > 0
        ? Math.round(studentProgress.reduce((sum, s) => sum + s.avgScore, 0) / studentProgress.length)
        : 0,
      totalSessions: studentProgress.reduce((sum, s) => sum + s.sessionCount, 0),
      totalXPEarned: studentProgress.reduce((sum, s) => sum + s.totalXP, 0),
      avgPassRate: studentProgress.length > 0
        ? Math.round(studentProgress.reduce((sum, s) => sum + s.passRate, 0) / studentProgress.length)
        : 0,
      skillBreakdown: {
        reading: studentProgress.length > 0
          ? Math.round(studentProgress.reduce((sum, s) => sum + s.readingScore, 0) / studentProgress.length)
          : 0,
        speaking: studentProgress.length > 0
          ? Math.round(studentProgress.reduce((sum, s) => sum + s.speakingScore, 0) / studentProgress.length)
          : 0,
        listening: studentProgress.length > 0
          ? Math.round(studentProgress.reduce((sum, s) => sum + s.listeningScore, 0) / studentProgress.length)
          : 0,
        writing: studentProgress.length > 0
          ? Math.round(studentProgress.reduce((sum, s) => sum + s.writingScore, 0) / studentProgress.length)
          : 0
      }
    }

    return NextResponse.json({
      class: {
        id: classData.id,
        name: classData.name,
        gradeLevel: classData.gradeLevel,
        code: classData.code,
        teacherName: classData.teacher.name,
        createdAt: classData.createdAt
      },
      stats: classStats,
      students: studentProgress.sort((a, b) => (b.totalXP) - (a.totalXP)) // Sort by XP
    }, { status: 200 })
  } catch (error) {
    console.error('Error fetching class analytics:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
