import {
  validateAnswer,
  validateMultipleChoice,
  validateTrueFalse,
  validateTextMatch,
  validateAnswers,
  Question,
  ValidationResult
} from '@/lib/assessment/validator'

describe('Answer Validation Library', () => {
  describe('validateMultipleChoice', () => {
    const question: Question = {
      id: 'q1',
      type: 'multiple_choice',
      question: 'What is the capital of France?',
      correctAnswer: 'b',
      points: 1,
      options: {
        a: 'London',
        b: 'Paris',
        c: 'Berlin',
        d: 'Madrid'
      }
    }

    it('should return correct result for right answer', () => {
      const result = validateMultipleChoice(question, 'b')

      expect(result.questionId).toBe('q1')
      expect(result.isCorrect).toBe(true)
      expect(result.earnedPoints).toBe(1)
      expect(result.maxPoints).toBe(1)
      expect(result.feedback).toContain('Correct')
    })

    it('should return incorrect result for wrong answer', () => {
      const result = validateMultipleChoice(question, 'a')

      expect(result.isCorrect).toBe(false)
      expect(result.earnedPoints).toBe(0)
      expect(result.maxPoints).toBe(1)
      expect(result.feedback).toContain('Incorrect')
      expect(result.feedback).toContain('Paris')
    })

    it('should return 0 points for invalid option', () => {
      const result = validateMultipleChoice(question, 'z')

      expect(result.isCorrect).toBe(false)
      expect(result.earnedPoints).toBe(0)
      expect(result.feedback).toContain('Invalid answer')
    })

    it('should respect custom point values', () => {
      const question2Points: Question = { ...question, points: 2 }
      const result = validateMultipleChoice(question2Points, 'b')

      expect(result.earnedPoints).toBe(2)
      expect(result.maxPoints).toBe(2)
    })
  })

  describe('validateTrueFalse', () => {
    const question: Question = {
      id: 'q2',
      type: 'true_false',
      question: 'The Earth is flat',
      correctAnswer: 'false',
      points: 1
    }

    it('should return correct result for right answer', () => {
      const result = validateTrueFalse(question, 'false')

      expect(result.isCorrect).toBe(true)
      expect(result.earnedPoints).toBe(1)
      expect(result.feedback).toContain('Correct')
    })

    it('should return incorrect result for wrong answer', () => {
      const result = validateTrueFalse(question, 'true')

      expect(result.isCorrect).toBe(false)
      expect(result.earnedPoints).toBe(0)
      expect(result.feedback).toContain('false')
    })

    it('should handle case-insensitive answers', () => {
      const result = validateTrueFalse(question, 'FALSE')

      expect(result.isCorrect).toBe(true)
      expect(result.earnedPoints).toBe(1)
    })

    it('should trim whitespace', () => {
      const result = validateTrueFalse(question, '  false  ')

      expect(result.isCorrect).toBe(true)
      expect(result.earnedPoints).toBe(1)
    })

    it('should reject invalid answers', () => {
      const result = validateTrueFalse(question, 'maybe')

      expect(result.isCorrect).toBe(false)
      expect(result.feedback).toContain('true')
      expect(result.feedback).toContain('false')
    })
  })

  describe('validateTextMatch', () => {
    const question: Question = {
      id: 'q3',
      type: 'text_match',
      question: 'What is the smallest country?',
      correctAnswer: 'Vatican City',
      points: 1
    }

    it('should return correct result for exact match', () => {
      const result = validateTextMatch(question, 'Vatican City')

      expect(result.isCorrect).toBe(true)
      expect(result.earnedPoints).toBe(1)
    })

    it('should handle case-insensitive fuzzy match', () => {
      const result = validateTextMatch(question, 'vatican city', { mode: 'fuzzy' })

      expect(result.isCorrect).toBe(true)
      expect(result.earnedPoints).toBe(1)
    })

    it('should handle extra whitespace', () => {
      const result = validateTextMatch(question, '  Vatican City  ', { mode: 'fuzzy' })

      expect(result.isCorrect).toBe(true)
      expect(result.earnedPoints).toBe(1)
    })

    it('should reject completely wrong answers', () => {
      const result = validateTextMatch(question, 'France', { mode: 'fuzzy' })

      expect(result.isCorrect).toBe(false)
      expect(result.earnedPoints).toBe(0)
    })

    it('should allow small spelling variations in fuzzy mode', () => {
      const result = validateTextMatch(question, 'Vatica City', { mode: 'fuzzy' })

      expect(result.isCorrect).toBe(true) // 1 char difference
      expect(result.earnedPoints).toBe(1)
    })

    it('should use exact mode when specified', () => {
      const result = validateTextMatch(question, 'vatican city', { mode: 'exact' })

      expect(result.isCorrect).toBe(false) // Not exact match (different case)
      expect(result.earnedPoints).toBe(0)
    })
  })

  describe('validateAnswer (main function)', () => {
    it('should route to correct validator for multiple_choice', () => {
      const question: Question = {
        id: 'q1',
        type: 'multiple_choice',
        question: 'What?',
        correctAnswer: 'a',
        options: { a: 'Yes', b: 'No' }
      }

      const result = validateAnswer(question, 'a')

      expect(result.isCorrect).toBe(true)
    })

    it('should route to correct validator for true_false', () => {
      const question: Question = {
        id: 'q2',
        type: 'true_false',
        question: 'Is it true?',
        correctAnswer: 'true'
      }

      const result = validateAnswer(question, 'true')

      expect(result.isCorrect).toBe(true)
    })

    it('should route to correct validator for text_match', () => {
      const question: Question = {
        id: 'q3',
        type: 'text_match',
        question: 'What?',
        correctAnswer: 'Answer'
      }

      const result = validateAnswer(question, 'answer')

      expect(result.isCorrect).toBe(true)
    })

    it('should return not provided feedback for empty answer', () => {
      const question: Question = {
        id: 'q1',
        type: 'multiple_choice',
        question: 'What?',
        correctAnswer: 'a',
        options: { a: 'Yes', b: 'No' }
      }

      const result = validateAnswer(question, '')

      expect(result.isCorrect).toBe(false)
      expect(result.feedback).toContain('No answer')
    })

    it('should throw error for unknown question type', () => {
      const question = {
        id: 'q1',
        type: 'unknown_type',
        question: 'What?',
        correctAnswer: 'a'
      } as Question

      expect(() => validateAnswer(question, 'a')).toThrow('Unknown question type')
    })
  })

  describe('validateAnswers (batch validation)', () => {
    const questions: Question[] = [
      {
        id: 'q1',
        type: 'multiple_choice',
        question: 'Q1',
        correctAnswer: 'a',
        points: 1,
        options: { a: 'Yes', b: 'No' }
      },
      {
        id: 'q2',
        type: 'true_false',
        question: 'Q2',
        correctAnswer: 'true',
        points: 1
      },
      {
        id: 'q3',
        type: 'text_match',
        question: 'Q3',
        correctAnswer: 'Paris',
        points: 2
      }
    ]

    it('should validate all answers correctly', () => {
      const answers = {
        q1: 'a',      // Correct: 1 point
        q2: 'true',   // Correct: 1 point
        q3: 'Paris'   // Correct: 2 points
      }

      const result = validateAnswers(questions, answers)

      expect(result.results).toHaveLength(3)
      expect(result.earnedPoints).toBe(4)
      expect(result.totalPoints).toBe(4)
      expect(result.score).toBe(100)
      expect(result.passed).toBe(true)
    })

    it('should calculate partial score correctly', () => {
      const answers = {
        q1: 'a',      // Correct: 1 point
        q2: 'false',  // Incorrect: 0 points
        q3: 'Paris'   // Correct: 2 points
      }

      const result = validateAnswers(questions, answers)

      expect(result.earnedPoints).toBe(3)
      expect(result.totalPoints).toBe(4)
      expect(result.score).toBe(75)
      expect(result.passed).toBe(false) // < 80%
    })

    it('should mark as passed at 80% threshold', () => {
      const answers = {
        q1: 'a',      // Correct: 1 point
        q2: 'true',   // Correct: 1 point
        q3: 'Paris'   // Correct: 2 points
      }

      const result = validateAnswers(questions, answers)

      expect(result.score).toBe(100)
      expect(result.passed).toBe(true)
    })

    it('should handle missing answers', () => {
      const answers = {
        q1: 'a',    // Correct: 1 point
        q2: '',     // Missing/empty: 0 points
        q3: 'Paris' // Correct: 2 points
      }

      const result = validateAnswers(questions, answers)

      expect(result.earnedPoints).toBe(3)
      expect(result.score).toBe(75)
    })

    it('should handle zero points case', () => {
      const answers = {
        q1: 'b',     // Incorrect: 0 points
        q2: 'false', // Incorrect: 0 points
        q3: 'London' // Incorrect: 0 points
      }

      const result = validateAnswers(questions, answers)

      expect(result.earnedPoints).toBe(0)
      expect(result.score).toBe(0)
      expect(result.passed).toBe(false)
    })

    it('should return results array with all questions', () => {
      const answers = {
        q1: 'a',
        q2: 'true',
        q3: 'Paris'
      }

      const result = validateAnswers(questions, answers)

      expect(result.results).toHaveLength(3)
      expect(result.results[0].questionId).toBe('q1')
      expect(result.results[1].questionId).toBe('q2')
      expect(result.results[2].questionId).toBe('q3')
    })
  })

  describe('Edge Cases', () => {
    it('should handle special characters in answers', () => {
      const question: Question = {
        id: 'q1',
        type: 'text_match',
        question: 'What?',
        correctAnswer: "It's correct!",
        points: 1
      }

      const result = validateTextMatch(question, "it's correct!")

      expect(result.isCorrect).toBe(true)
    })

    it('should handle numeric answers', () => {
      const question: Question = {
        id: 'q1',
        type: 'text_match',
        question: 'What is 2+2?',
        correctAnswer: '4',
        points: 1
      }

      const result = validateAnswer(question, '4')

      expect(result.isCorrect).toBe(true)
    })

    it('should handle very long answers', () => {
      const longAnswer = 'a'.repeat(1000)
      const question: Question = {
        id: 'q1',
        type: 'text_match',
        question: 'Repeat?',
        correctAnswer: longAnswer,
        points: 1
      }

      const result = validateAnswer(question, longAnswer)

      expect(result.isCorrect).toBe(true)
    })

    it('should handle empty options gracefully', () => {
      const question: Question = {
        id: 'q1',
        type: 'multiple_choice',
        question: 'What?',
        correctAnswer: 'a',
        options: {}
      }

      const result = validateMultipleChoice(question, 'a')

      expect(result.isCorrect).toBe(false)
    })
  })
})
