import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as jwt from 'jsonwebtoken'

/**
 * Global Manager Analytics API
 * Provides comprehensive statistics across all schools managed by the manager
 */

export async function GET(request: NextRequest) {
  try {
    // Verify manager token
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let decoded: any

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key'
      )
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    if (decoded.role !== 'manager') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const managerId = decoded.managerId

    // Fetch all schools for this manager
    const schools = await prisma.school.findMany({
      where: { managerId },
      include: {
        teachers: true
      }
    })

    // Calculate aggregate statistics
    let totalStudents = 0
    let totalTeachers = schools.reduce((sum, school) => sum + school.teachers.length, 0)
    let totalSessions = 0
    let totalXP = 0
    let totalPassedSessions = 0
    let avgScore = 0
    let avgReadingScore = 0
    let avgSpeakingScore = 0
    let avgWritingScore = 0
    let avgListeningScore = 0

    // Fetch detailed stats for each school
    const schoolStats = await Promise.all(
      schools.map(async (school) => {
        // Get all classes in school
        const classes = await prisma.class.findMany({
          where: { teacherId: { in: school.teachers.map(t => t.id) } },
          include: { enrollments: true }
        })

        const schoolStudents = classes.reduce((sum, cls) => sum + cls.enrollments.length, 0)
        totalStudents += schoolStudents

        // Get sessions for all students in classes
        const enrollmentIds = classes.flatMap(cls => cls.enrollments.map(e => e.studentId))

        const sessions = await prisma.lessonSession.findMany({
          where: { studentId: { in: enrollmentIds } }
        })

        const passedSessions = sessions.filter(s => s.passed).length
        totalSessions += sessions.length
        totalPassedSessions += passedSessions

        // Get progress for all students
        const studentProgress = await prisma.studentProgress.findMany({
          where: { studentId: { in: enrollmentIds } }
        })

        // XP lives on Student (not StudentProgress)
        const studentXp = await prisma.student.findMany({
          where: { id: { in: enrollmentIds } },
          select: { totalXP: true },
        })
        const schoolXP = studentXp.reduce((sum, st) => sum + (st.totalXP || 0), 0)
        const schoolAvgReading = studentProgress.reduce((sum, p) => sum + (p.avgReadingScore || 0), 0) / (studentProgress.length || 1)
        const schoolAvgSpeaking = studentProgress.reduce((sum, p) => sum + (p.avgSpeakingScore || 0), 0) / (studentProgress.length || 1)
        const schoolAvgWriting = studentProgress.reduce((sum, p) => sum + (p.avgWritingScore || 0), 0) / (studentProgress.length || 1)
        const schoolAvgListening = studentProgress.reduce((sum, p) => sum + (p.avgListeningScore || 0), 0) / (studentProgress.length || 1)

        totalXP += schoolXP

        // Get top performers
        const topStudents = await Promise.all(
          enrollmentIds.slice(0, 5).map(async (studentId) => {
            const student = await prisma.student.findUnique({
              where: { id: studentId }
            })
            return {
              studentId,
              name: student?.name || 'Unknown',
              xp: student?.totalXP || 0
            }
          })
        )

        return {
          schoolId: school.id,
          schoolName: school.name,
          city: school.city,
          students: schoolStudents,
          teachers: school.teachers.length,
          classes: classes.length,
          sessions: sessions.length,
          avgScore: sessions.length > 0
            ? (sessions.reduce((sum, s) => sum + (s.score || 0), 0) / sessions.length)
            : 0,
          passRate: sessions.length > 0
            ? (passedSessions / sessions.length) * 100
            : 0,
          xp: schoolXP,
          avgReadingScore: schoolAvgReading,
          avgSpeakingScore: schoolAvgSpeaking,
          avgWritingScore: schoolAvgWriting,
          avgListeningScore: schoolAvgListening,
          topStudents
        }
      })
    )

    const overallAvgScore = totalSessions > 0
      ? totalSessions / totalSessions
      : 0

    return NextResponse.json({
      manager: {
        id: managerId,
        name: decoded.email
      },
      stats: {
        totalSchools: schools.length,
        totalTeachers,
        totalStudents,
        totalSessions,
        totalXP,
        avgScore: overallAvgScore,
        passRate: totalSessions > 0 ? (totalPassedSessions / totalSessions) * 100 : 0,
        avgReadingScore,
        avgSpeakingScore,
        avgWritingScore,
        avgListeningScore
      },
      schools: schoolStats.sort((a, b) => b.xp - a.xp) // Sort by XP
    }, { status: 200 })
  } catch (error) {
    console.error('Manager analytics error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
