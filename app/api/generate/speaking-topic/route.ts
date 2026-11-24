import { NextRequest, NextResponse } from 'next/server'
import { generateSpeakingTopic } from '@/lib/content-generation/content-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { theme, grade, difficulty_level, scenario_type = 'dialogue', duration_minutes, vocabulary_set } = body

    if (!theme || !grade || !difficulty_level) {
      return NextResponse.json(
        { error: 'Missing required fields: theme, grade, difficulty_level' },
        { status: 400 }
      )
    }

    console.log(`🎤 Generating speaking topic: ${scenario_type} for ${theme}`)

    const result = await generateSpeakingTopic({
      theme,
      grade,
      difficulty_level,
      scenario_type,
      duration_minutes,
      vocabulary_set,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      metadata: { theme, grade, difficulty_level, scenario_type, generated_at: new Date().toISOString() },
    })
  } catch (error) {
    console.error('Speaking topic generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
