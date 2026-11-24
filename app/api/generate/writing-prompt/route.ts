import { NextRequest, NextResponse } from 'next/server'
import { generateWritingPrompt } from '@/lib/content-generation/content-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { theme, grade, difficulty_level, writing_type = 'narrative', word_count_min = 50, word_count_max = 200, grammatical_focus } = body

    if (!theme || !grade || !difficulty_level) {
      return NextResponse.json(
        { error: 'Missing required fields: theme, grade, difficulty_level' },
        { status: 400 }
      )
    }

    console.log(`✍️ Generating writing prompt: ${writing_type} for ${theme}`)

    const result = await generateWritingPrompt({
      theme,
      grade,
      difficulty_level,
      writing_type,
      word_count_min,
      word_count_max,
      grammatical_focus,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      metadata: { theme, grade, difficulty_level, writing_type, generated_at: new Date().toISOString() },
    })
  } catch (error) {
    console.error('Writing prompt generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
