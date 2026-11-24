import { NextRequest, NextResponse } from 'next/server'
import { seedGrade1Content } from '@/lib/seed/grade-1-seeder'

/**
 * Admin API to seed Grade 1 content
 * POST /api/admin/seed-grade-1
 *
 * Requires admin authentication (in production)
 */

export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check for admin role
    // const token = request.headers.get('authorization')
    // if (!isAdmin(token)) return 401

    console.log('🌱 Seeding Grade 1 content...')
    const result = await seedGrade1Content()

    return NextResponse.json({
      success: true,
      message: 'Grade 1 content seeded successfully',
      data: result.summary
    }, { status: 200 })
  } catch (error) {
    console.error('Error seeding content:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to seed Grade 1 content'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'POST to this endpoint to seed Grade 1 content',
    example: 'curl -X POST http://localhost:3000/api/admin/seed-grade-1'
  })
}
