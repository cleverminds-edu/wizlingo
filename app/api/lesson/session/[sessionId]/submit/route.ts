import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyStudentToken, getTokenFromRequest } from '@/lib/auth'
import { validateAnswers, Question } from '@/lib/assessment/validator'
import { validateSpeakingAnswers } from '@/lib/assessment/speaking-validator'
import { validateWritingAnswers } from '@/lib/assessment/writing-validator'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    // Step 1: Authenticate student
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
    const { sessionId } = await params

    // Step 2: Validate request body
    const body = await request.json()
    const { responses } = body

    if (!responses || typeof responses !== 'object') {
      return NextResponse.json(
        { error: 'Bad Request: responses object is required' },
        { status: 400 }
      )
    }

    // Step 3: Fetch and validate lesson session
    const session = await prisma.lessonSession.findUnique({
      where: { id: sessionId },
      include: {
        lesson: {
          include: {
            contents: {
              orderBy: { sequence: 'asc' }
            }
          }
        },
        student: true
      }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Not Found: Session does not exist' },
        { status: 404 }
      )
    }

    // Step 4: Verify student owns this session
    if (session.studentId !== studentId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this session' },
        { status: 403 }
      )
    }

    // Step 5: Check if session already submitted
    if (session.completedAt) {
      return NextResponse.json(
        {
          error: 'Conflict: This session has already been submitted',
          submittedAt: session.completedAt.toISOString()
        },
        { status: 409 }
      )
    }

    // Step 6: Extract questions from lesson contents
    const questions: Question[] = []
    const speakingQuestions: any[] = []
    const writingQuestions: any[] = []
    const pronunciationQuestions: any[] = []
    const meaningQuestions: Question[] = []

    let vocabularyMetrics: any = {
      isPronunciationLesson: false,
      isMeaningQuiz: false,
      pronunciationScore: 0,
      meaningScore: 0
    }

    for (const content of session.lesson.contents) {
      const contentData = content.content as any

      // Check if this is a vocabulary pronunciation lesson
      if (contentData.type === 'vocabulary_pronunciation' && contentData.questions) {
        vocabularyMetrics.isPronunciationLesson = true
        for (const q of contentData.questions) {
          pronunciationQuestions.push({
            id: q.id,
            type: 'speaking',
            question: q.question,
            expectedAnswer: q.expectedAnswer,
            points: q.points || 10
          })
        }
      }
      // Check if this is a vocabulary meaning quiz
      else if (contentData.type === 'vocabulary_quiz' && contentData.questions) {
        vocabularyMetrics.isMeaningQuiz = true
        for (const q of contentData.questions) {
          meaningQuestions.push({
            id: q.id,
            type: q.type || 'multiple_choice',
            question: q.question,
            correctAnswer: q.correctAnswer,
            points: q.points || 1,
            options: q.options
          })
        }
      }
      // Regular questions
      else if (contentData.questions && Array.isArray(contentData.questions)) {
        for (const q of contentData.questions) {
          if (q.type === 'speaking') {
            speakingQuestions.push({
              id: q.id,
              type: 'speaking',
              question: q.question,
              expectedAnswer: q.expectedAnswer,
              points: q.points || 10
            })
          } else if (q.type === 'writing') {
            writingQuestions.push({
              id: q.id,
              type: 'writing',
              question: q.question,
              prompt: q.prompt || q.question,
              minWords: q.minWords || 30,
              maxWords: q.maxWords || 300,
              points: q.points || 10
            })
          } else {
            questions.push({
              id: q.id,
              type: q.type || 'multiple_choice',
              question: q.question,
              correctAnswer: q.correctAnswer,
              points: q.points || 1,
              options: q.options
            })
          }
        }
      }
    }

    // Check if we have any questions to validate
    const hasRegularQuestions = questions.length > 0 || speakingQuestions.length > 0 || writingQuestions.length > 0
    const hasVocabularyQuestions = pronunciationQuestions.length > 0 || meaningQuestions.length > 0

    if (!hasRegularQuestions && !hasVocabularyQuestions) {
      return NextResponse.json(
        { error: 'Bad Request: No questions found in lesson' },
        { status: 400 }
      )
    }

    // Step 7: Validate answers based on question type
    console.log('=== LESSON SUBMISSION DEBUG ===')
    console.log('Regular questions:', questions.length)
    console.log('Speaking questions:', speakingQuestions.length)
    console.log('Pronunciation questions:', pronunciationQuestions.length)
    console.log('Meaning questions:', meaningQuestions.length)
    console.log('Student responses:', responses)
    console.log('================================')

    let validationResult: any
    let allResults: any[] = []

    // Handle vocabulary lessons (pronunciation + meaning assessment)
    if (vocabularyMetrics.isPronunciationLesson && pronunciationQuestions.length > 0) {
      const pronunciationResult = validateSpeakingAnswers(pronunciationQuestions, responses)
      vocabularyMetrics.pronunciationScore = pronunciationResult.score
      allResults = [...allResults, ...pronunciationResult.results]
    }

    if (vocabularyMetrics.isMeaningQuiz && meaningQuestions.length > 0) {
      const meaningResult = validateAnswers(meaningQuestions, responses, { mode: 'fuzzy' as any })
      vocabularyMetrics.meaningScore = meaningResult.score
      allResults = [...allResults, ...meaningResult.results]
    }

    // If this is a vocabulary lesson, calculate combined score
    if (vocabularyMetrics.isPronunciationLesson || vocabularyMetrics.isMeaningQuiz) {
      const scores = []
      if (vocabularyMetrics.isPronunciationLesson && vocabularyMetrics.pronunciationScore > 0) {
        scores.push(vocabularyMetrics.pronunciationScore)
      }
      if (vocabularyMetrics.isMeaningQuiz && vocabularyMetrics.meaningScore > 0) {
        scores.push(vocabularyMetrics.meaningScore)
      }

      if (scores.length > 0) {
        const vocabularyStrength = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        validationResult = {
          score: vocabularyStrength,
          passed: vocabularyStrength >= 75,
          results: allResults,
          vocabularyMetrics: {
            pronunciationScore: vocabularyMetrics.pronunciationScore,
            meaningScore: vocabularyMetrics.meaningScore,
            overallStrength: vocabularyStrength
          }
        }
      }
    }

    // Validate regular questions if any
    if (questions.length > 0 && !validationResult) {
      // Use 'contains' mode for text_match questions (e.g., reading comprehension)
      // This allows answers like "Alex plays at the park" to match expected "park"
      const validationMode = questions.some(q => q.type === 'text_match')
        ? 'contains'
        : 'fuzzy'
      validationResult = validateAnswers(questions, responses, { mode: validationMode as any })
      allResults = [...validationResult.results]
    }

    // Validate speaking questions if any
    if (speakingQuestions.length > 0 && !validationResult) {
      const speakingResult = validateSpeakingAnswers(speakingQuestions, responses)
      allResults = [...allResults, ...speakingResult.results]

      if (questions.length === 0) {
        validationResult = {
          score: speakingResult.score,
          passed: speakingResult.passed,
          results: speakingResult.results
        }
      }
    }

    // Validate writing questions if any
    if (writingQuestions.length > 0 && !validationResult) {
      const writingResult = validateWritingAnswers(writingQuestions, responses)
      allResults = [...allResults, ...writingResult.results]

      if (questions.length === 0 && speakingQuestions.length === 0) {
        validationResult = {
          score: writingResult.score,
          passed: writingResult.passed,
          results: writingResult.results
        }
      }
    }

    // If we have mixed question types, combine scores
    if (!validationResult) {
      if ((questions.length > 0 || speakingQuestions.length > 0) && writingQuestions.length > 0) {
        const totalPoints = [...questions, ...speakingQuestions, ...writingQuestions].reduce((sum, q) => sum + (q.points || 10), 0)
        const earnedPoints = allResults.reduce((sum, r) => sum + r.earnedPoints, 0)
        validationResult = {
          score: Math.round((earnedPoints / totalPoints) * 100),
          passed: Math.round((earnedPoints / totalPoints) * 100) >= 80,
          results: allResults
        }
      } else if (questions.length > 0 && speakingQuestions.length > 0) {
        // Combine reading and speaking
        const totalPoints = [...questions, ...speakingQuestions].reduce((sum, q) => sum + (q.points || 10), 0)
        const earnedPoints = allResults.reduce((sum, r) => sum + r.earnedPoints, 0)
        validationResult = {
          score: Math.round((earnedPoints / totalPoints) * 100),
          passed: Math.round((earnedPoints / totalPoints) * 100) >= 80,
          results: allResults
        }
      }
    }

    console.log('Validation result:', {
      score: validationResult.score,
      passed: validationResult.passed,
      results: validationResult.results.map((r: any) => ({
        questionId: r.questionId,
        isCorrect: r.isCorrect,
        accuracy: r.accuracy
      }))
    })

    // Step 8: Calculate XP (base 50 + bonus for high scores)
    let xpEarned = 50 // Base XP
    if (validationResult.score >= 90) {
      xpEarned += 50 // Bonus for 90%+
    } else if (validationResult.score >= 80) {
      xpEarned += 30 // Bonus for 80%+
    }

    // Step 9: Update lesson session with results
    const completedSession = await prisma.lessonSession.update({
      where: { id: sessionId },
      data: {
        completedAt: new Date(),
        score: validationResult.score,
        passed: validationResult.passed,
        xpEarned,
        durationSec: Math.floor((new Date().getTime() - session.startedAt.getTime()) / 1000),
        responses: responses // Store original responses
      }
    })

    // Step 10: Award XP to student
    await prisma.student.update({
      where: { id: studentId },
      data: {
        totalXP: { increment: xpEarned }
      }
    })

    // Step 11: Update journey progress if passed
    let progressUpdate = {}
    if (validationResult.passed) {
      // Get current journey
      let journey = await prisma.journeyProgress.findUnique({
        where: { studentId }
      })

      if (!journey) {
        journey = await prisma.journeyProgress.create({
          data: {
            studentId,
            currentPillar: 'SOUND_FOUNDATION',
            currentStage: 'STAGE_1',
            stageProgress: 0,
            soundFoundationScore: 0,
            languageFoundationScore: 0,
            coreSkillsScore: 0,
            communicationScore: 0,
            higherOrderScore: 0,
            masteredStages: []
          }
        })
      }

      // Increment stage progress (50% per pass - allows mastery in 2 lessons)
      const newStageProgress = Math.min(journey.stageProgress + 50, 100)

      // Check if stage is mastered (100% complete = advance after 2 passes)
      const stageMastered = newStageProgress >= 100
      const masteredStages = stageMastered
        ? [...(journey.masteredStages || []), journey.currentStage]
        : journey.masteredStages || []

      // Determine next stage if current is mastered
      const stageSequence = [
        'STAGE_1', 'STAGE_2', 'STAGE_3', 'STAGE_4', 'STAGE_5', 'STAGE_6',
        'STAGE_7', 'STAGE_8', 'STAGE_9', 'STAGE_10', 'STAGE_11', 'STAGE_12', 'STAGE_13'
      ]
      const currentIndex = stageSequence.indexOf(journey.currentStage as string)
      const isLastStage = currentIndex === stageSequence.length - 1

      const nextStage = stageMastered && !isLastStage
        ? stageSequence[currentIndex + 1]
        : journey.currentStage

      progressUpdate = {
        // For last stage (Stage 13), keep progress at 100% when mastered
        stageProgress: stageMastered && isLastStage ? 100 : (stageMastered ? 0 : newStageProgress),
        masteredStages: masteredStages,
        currentStage: nextStage
      }

      // Update journey progress
      await prisma.journeyProgress.update({
        where: { studentId },
        data: progressUpdate
      })
    }

    // Step 12: Format response per API spec
    const detailedResponses: Record<string, any> = {}
    validationResult.results.forEach((result: any) => {
      const question = questions.find((q) => q.id === result.questionId)
      const speakingQuestion = speakingQuestions.find((q) => q.id === result.questionId)

      detailedResponses[result.questionId] = {
        studentAnswer: responses[result.questionId],
        correctAnswer: question?.correctAnswer || speakingQuestion?.expectedAnswer,
        isCorrect: result.isCorrect,
        accuracy: result.accuracy || undefined, // For speaking questions
        points: result.maxPoints,
        earnedPoints: result.earnedPoints,
        feedback: result.feedback,
        transcription: result.transcription || undefined // For speaking questions
      }
    })

    const responseData: any = {
      sessionId: completedSession.id,
      lessonId: session.lesson.id,
      studentId,
      score: validationResult.score,
      maxScore: 100,
      passed: validationResult.passed,
      correctCount: validationResult.results.filter((r) => r.isCorrect).length,
      totalQuestions: validationResult.results.length,
      xpEarned,
      responses: detailedResponses,
      feedback: {
        overall: generateOverallFeedback(validationResult.score, validationResult.results.length, validationResult.vocabularyMetrics),
        encouragement: generateEncouragement(validationResult.score, validationResult.vocabularyMetrics),
        nextSteps: generateNextSteps(validationResult.passed, validationResult.score, validationResult.vocabularyMetrics)
      },
      completion: {
        startedAt: session.startedAt.toISOString(),
        submittedAt: completedSession.completedAt?.toISOString() || new Date().toISOString(),
        durationSeconds: completedSession.durationSec || 0
      },
      progressUpdate: {
        stageProgress: (progressUpdate as any).stageProgress || 0,
        canAdvanceStage: validationResult.passed,
        nextMilestone: calculateNextMilestone(validationResult.results.length)
      }
    }

    // Add vocabulary metrics if available
    if (validationResult.vocabularyMetrics) {
      responseData.vocabularyMetrics = validationResult.vocabularyMetrics

      // Get detailed breakdown of wrong pronunciation and meaning questions
      const pronunciationWrong = validationResult.results
        .filter((r: any) => r.questionId.startsWith('vocab-pron-') && !r.isCorrect)
      const meaningWrong = validationResult.results
        .filter((r: any) => r.questionId.startsWith('vocab-quiz-') && !r.isCorrect)

      // Extract vocabulary words from session contents
      let vocabularyWords: any[] = []
      for (const content of session.lesson.contents) {
        if (content.content.type === 'vocabulary_pronunciation') {
          vocabularyWords = (content.content as any).vocabularyWords || []
          break
        }
      }

      // Map question IDs to actual words
      const wrongPronunciationWords = pronunciationWrong
        .map((r: any) => {
          const idx = parseInt(r.questionId.replace('vocab-pron-', ''))
          return vocabularyWords[idx]?.word || `Word ${idx}`
        })

      if (wrongPronunciationWords.length > 0 || meaningWrong.length > 0) {
        responseData.focusAreas = {
          pronunciation: {
            count: pronunciationWrong.length,
            words: wrongPronunciationWords,
            advice: 'Record yourself slowly and clearly. Compare your pronunciation with the target provided.'
          },
          meaning: {
            count: meaningWrong.length,
            advice: meaningWrong.length > 0 ? 'Review the definitions and example sentences for these words.' : 'Great job on meanings!'
          }
        }
      }
    }

    return NextResponse.json(responseData, { status: 200 })
  } catch (error) {
    console.error('Lesson submit error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * Generate overall feedback message
 */
function generateOverallFeedback(score: number, totalQuestions: number, vocabularyMetrics?: any): string {
  // Special feedback for vocabulary lessons
  if (vocabularyMetrics) {
    const { pronunciationScore, meaningScore } = vocabularyMetrics

    let feedback = `Vocabulary Strength: ${score}% - `

    if (pronunciationScore > 0 && meaningScore > 0) {
      feedback += `Pronunciation: ${pronunciationScore}% | Meaning: ${meaningScore}%`
    } else if (pronunciationScore > 0) {
      feedback += `Pronunciation: ${pronunciationScore}%`
    } else if (meaningScore > 0) {
      feedback += `Meaning Understanding: ${meaningScore}%`
    }

    if (score === 100) {
      return feedback + ` - Perfect! You're a vocabulary master!`
    } else if (score >= 80) {
      return feedback + ` - Excellent! You have strong vocabulary skills.`
    } else if (score >= 70) {
      return feedback + ` - Good job! Keep practicing vocabulary.`
    } else {
      return feedback + ` - Keep working on your vocabulary!`
    }
  }

  // Regular feedback for other lesson types
  const correctCount = Math.round((score / 100) * totalQuestions)

  if (score === 100) {
    return `Perfect score! You got all ${totalQuestions} questions correct. Excellent work!`
  } else if (score >= 80) {
    return `Great job! You got ${correctCount} out of ${totalQuestions} questions correct.`
  } else if (score >= 60) {
    return `Good effort! You got ${correctCount} out of ${totalQuestions} questions correct. Keep practicing!`
  } else {
    return `You got ${correctCount} out of ${totalQuestions} questions correct. Try again to improve!`
  }
}

/**
 * Generate encouragement message with vocabulary-specific insights
 */
function generateEncouragement(score: number, vocabularyMetrics?: any): string {
  // Special encouragement for vocabulary lessons
  if (vocabularyMetrics) {
    const { pronunciationScore, meaningScore } = vocabularyMetrics

    if (score >= 85) {
      return "Outstanding! You're mastering vocabulary - both pronunciation and meaning are strong!"
    } else if (score >= 75) {
      if (pronunciationScore < meaningScore) {
        return `💡 You excel at understanding word meanings (${meaningScore}%)! Focus pronunciation practice on slower, clearer articulation to match your meaning strength.`
      } else if (meaningScore < pronunciationScore) {
        return `🎤 Great pronunciation skills (${pronunciationScore}%)! Review the word meanings to boost your overall vocabulary mastery.`
      } else {
        return "You're building strong vocabulary skills across both areas!"
      }
    } else if (score >= 60) {
      if (pronunciationScore < 50) {
        return `⚠️ Pronunciation needs attention (${pronunciationScore}%). Try recording yourself slowly and comparing with the target pronunciation. Practice daily!`
      } else if (meaningScore < 50) {
        return `📚 Focus on word meanings - use context clues and example sentences to remember definitions better.`
      } else {
        return "Keep practicing daily - vocabulary improves with consistent effort!"
      }
    } else {
      return "This is a great learning opportunity! Review both pronunciation and meanings, then try again soon."
    }
  }

  if (score >= 90) {
    return "You're a star! Keep up this amazing performance."
  } else if (score >= 80) {
    return "Well done! You're making great progress."
  } else if (score >= 70) {
    return "Good effort! Practice makes perfect."
  } else {
    return "Keep trying! Every mistake is a learning opportunity."
  }
}

/**
 * Generate next steps message with vocabulary-specific recommendations
 */
function generateNextSteps(passed: boolean, score: number, vocabularyMetrics?: any): string {
  // Special next steps for vocabulary lessons
  if (vocabularyMetrics) {
    const { pronunciationScore, meaningScore } = vocabularyMetrics

    if (score >= 85) {
      return '🎉 Excellent! Move to the next lesson. Continue practicing vocabulary daily to maintain your skills!'
    } else if (passed) {
      if (pronunciationScore < 60) {
        return '📖 Next: Reading Comprehension. But first, replay Section 2 (Pronunciation Practice) in this lesson to improve accent and clarity.'
      } else if (meaningScore < 80) {
        return '📖 Next: Reading Comprehension. Review word definitions here to strengthen vocabulary retention before moving on.'
      } else {
        return '📖 Ready for the next lesson! You can always revisit this vocabulary lesson for extra practice.'
      }
    } else {
      if (pronunciationScore < 50 && meaningScore < 50) {
        return '🔄 Both pronunciation and meaning need work. Try again focusing on clear articulation and remembering definitions. Daily practice will help!'
      } else if (pronunciationScore < 60) {
        return '🎤 Try again, focusing on pronunciation accuracy. Record yourself slowly and compare with the target pronunciation.'
      } else {
        return '📚 Try again, focusing on understanding word meanings. Use context clues and example sentences provided.'
      }
    }
  }

  if (passed) {
    if (score === 100) {
      return 'You are ready for the next stage! Move on to the next lesson to continue your learning journey.'
    } else {
      return 'You passed! You can move to the next lesson, or review this one to strengthen your understanding.'
    }
  } else {
    return 'Try this lesson again to master the content. Review the questions you missed to understand them better.'
  }
}

/**
 * Calculate next milestone message
 */
function calculateNextMilestone(totalQuestions: number): string {
  if (totalQuestions >= 5) {
    return '5 lessons mastered to unlock next stage'
  }
  return 'Complete more lessons to progress'
}
