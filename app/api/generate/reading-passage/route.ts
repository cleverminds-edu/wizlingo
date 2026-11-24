import { NextRequest, NextResponse } from 'next/server'
import { generateReadingPassage } from '@/lib/content-generation/content-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      theme,
      grade,
      difficulty_level,
      length = 'medium',
      topics_focus,
      reading_level,
    } = body

    // Validate inputs
    if (!theme || !grade || !difficulty_level) {
      return NextResponse.json(
        {
          error: 'Missing required fields: theme, grade, difficulty_level',
        },
        { status: 400 }
      )
    }

    if (difficulty_level < 1 || difficulty_level > 20) {
      return NextResponse.json(
        { error: 'Difficulty level must be between 1 and 20' },
        { status: 400 }
      )
    }

    console.log('📖 Generating reading passage...')
    console.log(`   Theme: ${theme}, Grade: ${grade}, Difficulty: ${difficulty_level}`)

    const result = await generateReadingPassage({
      theme,
      grade,
      difficulty_level,
      length,
      topics_focus,
      reading_level,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate reading passage' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      metadata: {
        theme,
        grade,
        difficulty_level,
        generated_at: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Reading passage generation endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
