import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const units = await prisma.curriculumUnit.count()
    const lessons = await prisma.lesson.count()
    const content = await prisma.lessonContent.count()

    const grade1Unit = await prisma.curriculumUnit.findFirst({
      where: {
        gradeCategory: 'GR_1_3'
      },
      include: {
        lessons: {
          include: {
            contents: true
          }
        }
      }
    })

    return NextResponse.json({
      summary: {
        totalUnits: units,
        totalLessons: lessons,
        totalContent: content
      },
      grade1: grade1Unit ? {
        unitId: grade1Unit.id,
        title: grade1Unit.title,
        lessonsCount: grade1Unit.lessons.length,
        lessons: grade1Unit.lessons.map(l => ({
          id: l.id,
          title: l.title,
          contentCount: l.contents.length
        })),
        totalContentItems: grade1Unit.lessons.reduce((sum, l) => sum + l.contents.length, 0)
      } : null
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
