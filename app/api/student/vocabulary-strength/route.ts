import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyStudentToken, getTokenFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      )
    }

    const payload = verifyStudentToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      )
    }

    const studentId = payload.studentId

    // Fetch all completed vocabulary lessons for this student
    const vocabularySessions = await prisma.lessonSession.findMany({
      where: {
        studentId,
        completedAt: { not: null },
        lesson: {
          contents: {
            some: {
              content: {
                path: ['type'],
                equals: 'vocabulary_pronunciation'
              }
            }
          }
        }
      },
      include: {
        lesson: true
      }
    })

    // Calculate vocabulary metrics from responses
    let totalPronunciationScores: number[] = []
    let totalMeaningScores: number[] = []

    for (const session of vocabularySessions) {
      const responses = (session.responses as any) || {}

      // Parse responses to extract pronunciation and meaning scores
      // This would typically come from the submission data
      // For now, we'll calculate based on overall score
      if (session.score) {
        // Assuming vocabulary lessons have equal pronunciation and meaning components
        totalPronunciationScores.push(session.score)
        totalMeaningScores.push(session.score)
      }
    }

    // Calculate averages
    const pronunciationStrength = totalPronunciationScores.length > 0
      ? Math.round(
          totalPronunciationScores.reduce((a, b) => a + b, 0) / totalPronunciationScores.length
        )
      : 0

    const meaningStrength = totalMeaningScores.length > 0
      ? Math.round(
          totalMeaningScores.reduce((a, b) => a + b, 0) / totalMeaningScores.length
        )
      : 0

    const overallVocabularyStrength = totalPronunciationScores.length > 0
      ? Math.round((pronunciationStrength + meaningStrength) / 2)
      : 0

    // Determine proficiency level
    let proficiencyLevel = 'Beginner'
    if (overallVocabularyStrength >= 90) {
      proficiencyLevel = 'Master'
    } else if (overallVocabularyStrength >= 80) {
      proficiencyLevel = 'Advanced'
    } else if (overallVocabularyStrength >= 70) {
      proficiencyLevel = 'Proficient'
    } else if (overallVocabularyStrength >= 60) {
      proficiencyLevel = 'Developing'
    }

    return NextResponse.json({
      studentId,
      vocabularyStrength: {
        overall: overallVocabularyStrength,
        pronunciation: pronunciationStrength,
        meaning: meaningStrength,
        proficiencyLevel,
        lessonsCompleted: vocabularySessions.length
      }
    })
  } catch (error) {
    console.error('Vocabulary strength calculation error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
