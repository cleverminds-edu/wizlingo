import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyStudentToken, getTokenFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyStudentToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const studentId = payload.studentId

    // Get recent lesson sessions (last 50 to get good data)
    const sessions = await prisma.lessonSession.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    let readingCorrect = 0
    let readingTotal = 0
    let speakingCorrect = 0
    let speakingTotal = 0
    let speakingAccuracySum = 0

    sessions.forEach((session, idx) => {
      if (!session.responses) return

      const responses = session.responses as Record<string, any>

      // Log first session for debugging
      if (idx === 0) {
        console.log('Sample response object:', JSON.stringify(Object.entries(responses)[0], null, 2))
      }

      Object.entries(responses).forEach(([questionId, response]: [string, any]) => {
        if (!response) return

        // Check if it's a speaking question (has accuracy field)
        if (typeof response.accuracy === 'number') {
          // Speaking question
          speakingTotal++
          speakingAccuracySum += response.accuracy
          if (response.isCorrect === true) {
            speakingCorrect++
          }
        } else {
          // Reading question
          readingTotal++
          if (response.isCorrect === true) {
            readingCorrect++
          }
        }
      })
    })

    const readingAccuracy = readingTotal > 0 ? Math.round((readingCorrect / readingTotal) * 100) : 0
    const speakingAccuracy = speakingTotal > 0 ? Math.round(speakingAccuracySum / speakingTotal) : 0

    return NextResponse.json({
      reading: {
        questionsAnswered: readingTotal,
        correctAnswers: readingCorrect,
        accuracy: readingAccuracy,
        successRate: readingAccuracy
      },
      speaking: {
        questionsAnswered: speakingTotal,
        correctAnswers: speakingCorrect,
        accuracy: speakingAccuracy,
        successRate: speakingCorrect > 0 ? Math.round((speakingCorrect / speakingTotal) * 100) : 0
      },
      summary: {
        totalSessions: sessions.length,
        totalQuestionsAnswered: readingTotal + speakingTotal,
        overallAccuracy: (readingTotal + speakingTotal) > 0
          ? Math.round(((readingCorrect + speakingCorrect) / (readingTotal + speakingTotal)) * 100)
          : 0
      }
    }, { status: 200 })
  } catch (error) {
    console.error('Error fetching student stats:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
