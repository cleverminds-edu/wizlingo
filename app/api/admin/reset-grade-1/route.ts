import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🗑️ Starting Grade 1 curriculum reset...')

    // Find all Grade 1 curriculum units
    const grade1Units = await prisma.curriculumUnit.findMany({
      where: {
        gradeCategory: 'GR_1_3'
      }
    })

    console.log(`Found ${grade1Units.length} Grade 1 units`)

    // For each unit, delete everything in reverse order
    for (const unit of grade1Units) {
      const lessons = await prisma.lesson.findMany({
        where: { unitId: unit.id }
      })

      for (const lesson of lessons) {
        // Delete lesson sessions
        await prisma.lessonSession.deleteMany({
          where: { lessonId: lesson.id }
        })
        // Delete lesson content
        await prisma.lessonContent.deleteMany({
          where: { lessonId: lesson.id }
        })
      }

      // Delete lessons
      await prisma.lesson.deleteMany({
        where: { unitId: unit.id }
      })

      // Delete curriculum unit
      await prisma.curriculumUnit.delete({
        where: { id: unit.id }
      })
    }

    console.log('✅ Grade 1 curriculum reset complete')

    return NextResponse.json({
      success: true,
      message: 'Grade 1 curriculum reset. You can now reseed with: POST /api/admin/seed-comprehensive-grade-1',
      deletedUnits: grade1Units.length
    })
  } catch (error) {
    console.error('❌ Reset error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
