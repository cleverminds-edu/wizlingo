import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as jwt from 'jsonwebtoken'

/**
 * Get Teacher's Classes API
 * Fetches all classes for the authenticated teacher
 */

export async function GET(request: NextRequest) {
  try {
    // Verify teacher token
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

    if (decoded.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const teacherId = decoded.teacherId

    // Fetch all classes for this teacher
    const classes = await prisma.class.findMany({
      where: { teacherId },
      include: {
        enrollments: true
      }
    })

    // Enrich with analytics data
    const classesWithStats = await Promise.all(
      classes.map(async (cls) => {
        // Get sessions for all students in class
        const enrollmentIds = cls.enrollments.map(e => e.studentId)

        const sessions = await prisma.lessonSession.findMany({
          where: { studentId: { in: enrollmentIds } }
        })

        const passedSessions = sessions.filter(s => s.passed).length

        return {
          id: cls.id,
          name: cls.name,
          gradeLevel: cls.gradeLevel,
          code: cls.code,
          students: cls.enrollments.length,
          avgScore: sessions.length > 0
            ? sessions.reduce((sum, s) => sum + (s.score || 0), 0) / sessions.length
            : 0,
          passRate: sessions.length > 0
            ? (passedSessions / sessions.length) * 100
            : 0,
          xp: 0 // Will be calculated from student progress
        }
      })
    )

    return NextResponse.json({
      classes: classesWithStats
    }, { status: 200 })
  } catch (error) {
    console.error('Get classes error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
