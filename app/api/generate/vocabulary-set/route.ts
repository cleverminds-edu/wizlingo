import { NextRequest, NextResponse } from 'next/server'
import { generateVocabularySet } from '@/lib/content-generation/content-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { theme, grade, difficulty_level, word_count = 15, vocabulary_types, include_word_families } = body

    if (!theme || !grade || !difficulty_level || !word_count) {
      return NextResponse.json(
        { error: 'Missing required fields: theme, grade, difficulty_level, word_count' },
        { status: 400 }
      )
    }

    console.log(`📝 Generating vocabulary set: ${word_count} words for ${theme}`)

    const result = await generateVocabularySet({
      theme,
      grade,
      difficulty_level,
      word_count,
      vocabulary_types,
      include_word_families,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      metadata: { theme, grade, difficulty_level, word_count, generated_at: new Date().toISOString() },
    })
  } catch (error) {
    console.error('Vocabulary generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
