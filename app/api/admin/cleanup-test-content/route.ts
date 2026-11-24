import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🗑️ Starting cleanup of test content...')

    // Find test units (keeping only Grade 1 seeded content)
    const testUnits = await prisma.curriculumUnit.findMany({
      where: {
        title: {
          in: ['Test Unit', 'Stage 1', 'Stage 1 Lesson']
        }
      }
    })

    // For each test unit, delete its lessons and their sessions
    for (const unit of testUnits) {
      const lessons = await prisma.lesson.findMany({
        where: { unitId: unit.id }
      })

      for (const lesson of lessons) {
        // Delete lesson sessions first (they reference lessons)
        await prisma.lessonSession.deleteMany({
          where: { lessonId: lesson.id }
        })
        // Then delete lesson content
        await prisma.lessonContent.deleteMany({
          where: { lessonId: lesson.id }
        })
      }

      // Delete lessons
      await prisma.lesson.deleteMany({
        where: { unitId: unit.id }
      })
    }

    // Delete test units
    const deleted = await prisma.curriculumUnit.deleteMany({
      where: {
        title: {
          in: ['Test Unit', 'Stage 1', 'Stage 1 Lesson']
        }
      }
    })

    console.log(`✅ Cleaned up test content`)

    return NextResponse.json({
      success: true,
      deleted: {
        units: deleted.count
      }
    }, { status: 200 })
  } catch (error) {
    console.error('❌ Cleanup error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
