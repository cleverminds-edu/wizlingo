import { NextRequest, NextResponse } from 'next/server'
import { seedComprehensiveGrade1 } from '@/lib/seed/comprehensive-grade-1-seeder'

/**
 * Comprehensive Grade 1 Seeding API
 * POST /api/admin/seed-comprehensive-grade-1
 *
 * This endpoint creates the full curriculum unit structure with all lessons and content
 */

export async function POST(request: NextRequest) {
  try {
    console.log('📚 Starting comprehensive Grade 1 seeding...')

    const result = await seedComprehensiveGrade1()

    console.log('✅ Seeding completed successfully')

    return NextResponse.json({
      success: true,
      message: 'Grade 1 curriculum seeded successfully',
      data: result
    }, { status: 200 })
  } catch (error) {
    console.error('❌ Error seeding:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to seed comprehensive Grade 1 content'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Comprehensive Grade 1 Seeding Endpoint',
    usage: 'POST to this endpoint to seed complete Grade 1 curriculum',
    example: 'curl -X POST http://localhost:3000/api/admin/seed-comprehensive-grade-1',
    includes: [
      'Curriculum unit (STAGE_1: Sound Foundation)',
      '5 lesson modules (Vocabulary, Reading, Speaking, Writing, Listening)',
      'Complete content for all modules',
      'Comprehension questions',
      'Grading rubrics'
    ]
  })
}
