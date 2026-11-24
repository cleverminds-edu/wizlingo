import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const studentId = (payload as any).studentId || (payload as any).userId
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Fetch curriculum units for this student's grade category
    const units = await prisma.curriculumUnit.findMany({
      where: {
        gradeCategory: student.gradeCategory
      },
      include: {
        lessons: {
          include: {
            contents: true
          },
          orderBy: { sequence: 'asc' }
        }
      },
      orderBy: [
        { pillar: 'asc' },
        { stage: 'asc' },
        { sequence: 'asc' }
      ]
    })

    // Flatten to get all lessons
    const lessons = units.flatMap(unit =>
      unit.lessons.map(lesson => ({
        id: lesson.id,
        unitId: unit.id,
        title: lesson.title,
        description: lesson.description,
        estimatedMinutes: lesson.estimatedMinutes,
        sequence: lesson.sequence,
        contentCount: lesson.contents.length,
        unit: {
          id: unit.id,
          title: unit.title,
          pillar: unit.pillar,
          stage: unit.stage
        }
      }))
    )

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        gradeCategory: student.gradeCategory
      },
      units: units.length,
      lessons: lessons.length,
      data: lessons
    })
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
