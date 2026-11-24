import { NextRequest, NextResponse } from 'next/server'
import { generateListeningStory } from '@/lib/content-generation/content-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { theme, grade, difficulty_level, duration_seconds = 180, story_type = 'narrative', vocabulary_set } = body

    if (!theme || !grade || !difficulty_level) {
      return NextResponse.json(
        { error: 'Missing required fields: theme, grade, difficulty_level' },
        { status: 400 }
      )
    }

    console.log(`👂 Generating listening story: ${story_type} for ${theme} (~${duration_seconds}s)`)

    const result = await generateListeningStory({
      theme,
      grade,
      difficulty_level,
      duration_seconds,
      story_type,
      vocabulary_set,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      metadata: { theme, grade, difficulty_level, story_type, duration_seconds, generated_at: new Date().toISOString() },
    })
  } catch (error) {
    console.error('Listening story generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
