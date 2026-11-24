/**
 * Answer Validation Library
 * Validates student answers against different question types
 * Used by lesson submission endpoint (T1.3)
 */

export interface Question {
  id: string
  type: 'multiple_choice' | 'true_false' | 'text_match'
  question: string
  correctAnswer: string
  points?: number
  options?: Record<string, string> // For multiple choice
}

export interface ValidationResult {
  questionId: string
  isCorrect: boolean
  earnedPoints: number
  maxPoints: number
  feedback?: string
}

/**
 * Validate a multiple choice answer
 * Answer must match one of the valid options keys (a, b, c, d, etc)
 */
export function validateMultipleChoice(
  question: Question,
  studentAnswer: string
): ValidationResult {
  const maxPoints = question.points || 1

  // Validate answer is in options
  if (!question.options || !question.options[studentAnswer]) {
    return {
      questionId: question.id,
      isCorrect: false,
      earnedPoints: 0,
      maxPoints,
      feedback: `Invalid answer. Valid options are: ${Object.keys(question.options || {}).join(', ')}`
    }
  }

  // Check if correct
  const isCorrect = studentAnswer === question.correctAnswer

  return {
    questionId: question.id,
    isCorrect,
    earnedPoints: isCorrect ? maxPoints : 0,
    maxPoints,
    feedback: isCorrect
      ? 'Correct!'
      : `Incorrect. The correct answer is: ${question.options[question.correctAnswer]}`
  }
}

/**
 * Validate a true/false answer
 * Answer must be exactly 'true' or 'false' (case-insensitive)
 */
export function validateTrueFalse(
  question: Question,
  studentAnswer: string
): ValidationResult {
  const maxPoints = question.points || 1
  const normalizedAnswer = studentAnswer.toLowerCase().trim()

  // Validate answer is true or false
  if (!['true', 'false'].includes(normalizedAnswer)) {
    return {
      questionId: question.id,
      isCorrect: false,
      earnedPoints: 0,
      maxPoints,
      feedback: 'Please answer with "true" or "false"'
    }
  }

  // Check if correct
  const isCorrect = normalizedAnswer === question.correctAnswer.toLowerCase()

  return {
    questionId: question.id,
    isCorrect,
    earnedPoints: isCorrect ? maxPoints : 0,
    maxPoints,
    feedback: isCorrect ? 'Correct!' : `Incorrect. The answer is: ${question.correctAnswer}`
  }
}

/**
 * Validate a text match answer
 * Supports exact match, fuzzy matching, or containment (case-insensitive, trimmed)
 * For reading comprehension, use 'contains' mode to check if answer appears in response
 */
export function validateTextMatch(
  question: Question,
  studentAnswer: string,
  options?: { mode?: 'exact' | 'fuzzy' | 'contains' }
): ValidationResult {
  const maxPoints = question.points || 1
  const mode = options?.mode || 'fuzzy'

  const normalizedStudent = studentAnswer.trim().toLowerCase()
  const normalizedCorrect = question.correctAnswer.trim().toLowerCase()

  let isCorrect = false

  if (mode === 'exact') {
    // Exact match (case-insensitive, trimmed)
    isCorrect = normalizedStudent === normalizedCorrect
  } else if (mode === 'contains') {
    // Containment match: check if expected answer appears in student's response
    // Split both into words to handle variations
    const studentWords = normalizedStudent.split(/\s+/)
    const expectedWords = normalizedCorrect.split(/\s+/)

    // For single word answers, direct containment check
    if (expectedWords.length === 1) {
      isCorrect = studentWords.includes(expectedWords[0])
    } else {
      // For multi-word answers, check if all expected words appear in student answer
      isCorrect = expectedWords.every(word => studentWords.includes(word))
    }
  } else {
    // Fuzzy match: allow small variations
    isCorrect = isFuzzyMatch(normalizedStudent, normalizedCorrect)
  }

  return {
    questionId: question.id,
    isCorrect,
    earnedPoints: isCorrect ? maxPoints : 0,
    maxPoints,
    feedback: isCorrect
      ? 'Correct!'
      : `Incorrect. The expected answer was: ${question.correctAnswer}`
  }
}

/**
 * Fuzzy text matching
 * Handles common variations like:
 * - Extra spaces: "hello  world" vs "hello world"
 * - Spelling variations: "colour" vs "color"
 * - Allows up to 2 character differences
 */
function isFuzzyMatch(str1: string, str2: string): boolean {
  // Exact match
  if (str1 === str2) return true

  // Different lengths - check similarity
  const similarity = calculateSimilarity(str1, str2)
  return similarity >= 0.85 // 85% similarity threshold
}

/**
 * Calculate similarity between two strings (0-1)
 * Uses Levenshtein distance algorithm
 */
function calculateSimilarity(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length)
  if (maxLen === 0) return 1

  const distance = levenshteinDistance(str1, str2)
  return 1 - distance / maxLen
}

/**
 * Levenshtein distance: minimum edits needed to transform one string to another
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        )
      }
    }
  }

  return matrix[str2.length][str1.length]
}

/**
 * Main validation function
 * Routes to correct validator based on question type
 */
export function validateAnswer(
  question: Question,
  studentAnswer: string,
  options?: { mode?: 'exact' | 'fuzzy' }
): ValidationResult {
  // Validate inputs
  if (!question.id || !question.type || !question.correctAnswer) {
    throw new Error('Invalid question object')
  }

  if (!studentAnswer || typeof studentAnswer !== 'string') {
    return {
      questionId: question.id,
      isCorrect: false,
      earnedPoints: 0,
      maxPoints: question.points || 1,
      feedback: 'No answer provided'
    }
  }

  switch (question.type) {
    case 'multiple_choice':
      return validateMultipleChoice(question, studentAnswer)

    case 'true_false':
      return validateTrueFalse(question, studentAnswer)

    case 'text_match':
      return validateTextMatch(question, studentAnswer, options)

    default:
      throw new Error(`Unknown question type: ${question.type}`)
  }
}

/**
 * Batch validate multiple answers
 * Returns array of validation results and aggregate score
 */
export function validateAnswers(
  questions: Question[],
  studentAnswers: Record<string, string>,
  options?: { mode?: 'exact' | 'fuzzy' }
): {
  results: ValidationResult[]
  totalPoints: number
  earnedPoints: number
  score: number // 0-100
  passed: boolean // true if >= 80%
} {
  const results: ValidationResult[] = []
  let totalPoints = 0
  let earnedPoints = 0

  for (const question of questions) {
    const studentAnswer = studentAnswers[question.id]

    try {
      const result = validateAnswer(question, studentAnswer, options)
      results.push(result)
      totalPoints += result.maxPoints
      earnedPoints += result.earnedPoints
    } catch (error) {
      console.error(`Error validating question ${question.id}:`, error)
      // Mark as incorrect if validation fails
      results.push({
        questionId: question.id,
        isCorrect: false,
        earnedPoints: 0,
        maxPoints: question.points || 1,
        feedback: 'Error processing answer'
      })
      totalPoints += question.points || 1
    }
  }

  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
  const passed = score >= 80

  return {
    results,
    totalPoints,
    earnedPoints,
    score,
    passed
  }
}
