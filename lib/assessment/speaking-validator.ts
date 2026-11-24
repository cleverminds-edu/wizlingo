/**
 * Speaking Assessment Validator
 * Validates transcribed speech against expected answers
 * Used by speaking lesson submissions
 */

interface SpeakingQuestion {
  id: string
  type: 'speaking'
  question: string
  expectedAnswer: string // What the student should say
  points?: number
}

interface SpeakingValidationResult {
  questionId: string
  isCorrect: boolean
  earnedPoints: number
  maxPoints: number
  feedback: string
  accuracy: number // 0-100
  transcription: string
}

/**
 * Levenshtein distance for fuzzy matching
 * Measures how different two strings are
 */
function levenshteinDistance(str1: string, str2: string): number {
  const track = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(0))

  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i
  }

  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      )
    }
  }

  return track[str2.length][str1.length]
}

/**
 * Calculate similarity percentage between two strings
 * Handles case-insensitivity and trimming
 */
function calculateSimilarity(actual: string, expected: string): number {
  const actualLower = actual.toLowerCase().trim()
  const expectedLower = expected.toLowerCase().trim()

  if (actualLower === expectedLower) {
    return 100
  }

  // For very different lengths, give partial credit
  const lengthDiff = Math.abs(actualLower.length - expectedLower.length)
  const maxLen = Math.max(actualLower.length, expectedLower.length)

  if (lengthDiff > maxLen * 0.5) {
    // More than 50% different in length = very different
    return Math.max(0, 50 - (lengthDiff / maxLen) * 50)
  }

  // Use Levenshtein distance for more accurate matching
  const distance = levenshteinDistance(actualLower, expectedLower)
  const maxLen2 = Math.max(actualLower.length, expectedLower.length)
  const similarity = Math.max(0, 100 - (distance / maxLen2) * 100)

  return Math.round(similarity)
}

/**
 * Validate a speaking answer
 * Compares transcribed speech with expected answer
 * Uses fuzzy matching to account for speech recognition errors
 */
export function validateSpeakingAnswer(
  question: SpeakingQuestion,
  transcription: string
): SpeakingValidationResult {
  const maxPoints = question.points || 10
  const accuracy = calculateSimilarity(transcription, question.expectedAnswer)

  // Threshold: 75% accuracy = correct answer
  // This accounts for speech recognition errors
  const threshold = 75
  const isCorrect = accuracy >= threshold

  let feedback = ''
  if (isCorrect) {
    if (accuracy === 100) {
      feedback = 'Perfect! Excellent pronunciation.'
    } else if (accuracy >= 90) {
      feedback = 'Great! Very close to the expected answer.'
    } else {
      feedback = 'Good! Your speech was understood correctly.'
    }
  } else {
    if (accuracy >= 60) {
      feedback = `Close! You said "${transcription}". Expected: "${question.expectedAnswer}". Try again.`
    } else if (accuracy >= 40) {
      feedback = `Not quite. The system heard: "${transcription}". Try saying: "${question.expectedAnswer}"`
    } else {
      feedback = `Please try again. Speak: "${question.expectedAnswer}"`
    }
  }

  return {
    questionId: question.id,
    isCorrect,
    earnedPoints: isCorrect ? maxPoints : 0,
    maxPoints,
    feedback,
    accuracy,
    transcription
  }
}

/**
 * Validate multiple speaking answers
 * Returns aggregated results
 */
export function validateSpeakingAnswers(
  questions: SpeakingQuestion[],
  responses: Record<string, string>
): {
  results: SpeakingValidationResult[]
  score: number
  passed: boolean
} {
  const results = questions.map(question => {
    const transcription = responses[question.id] || ''

    if (!transcription.trim()) {
      return {
        questionId: question.id,
        isCorrect: false,
        earnedPoints: 0,
        maxPoints: question.points || 10,
        feedback: 'No speech detected. Please try again.',
        accuracy: 0,
        transcription: ''
      }
    }

    return validateSpeakingAnswer(question, transcription)
  })

  const totalPoints = results.reduce((sum, r) => sum + r.maxPoints, 0)
  const earnedPoints = results.reduce((sum, r) => sum + r.earnedPoints, 0)
  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0

  // Pass if 80% or more correct
  const passed = score >= 80

  return { results, score, passed }
}
