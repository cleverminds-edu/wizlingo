/**
 * T1.7: Integration Tests - Complete Lesson Flow
 * Tests the entire lesson experience from start to results
 */

import { prisma } from '@/lib/prisma'
import { createToken, hashPassword } from '@/lib/auth'

describe('Integration Tests - Complete Lesson Flow (T1.7)', () => {
  let studentId: string
  let token: string
  let lessonId: string
  let sessionId: string

  beforeAll(async () => {
    // Create test student
    const hashedPassword = await hashPassword('testpass123')
    const student = await prisma.student.create({
      data: {
        name: 'Integration Test Student',
        email: 'integration-test@example.com',
        phone: '9876543210',
        userId: 'WL999999',
        passwordHash: hashedPassword,
        gradeCategory: 'GR_1_3',
        currentLevel: 1
      }
    })

    studentId = student.id
    token = createToken(studentId)

    // Create test lesson with content
    const unit = await prisma.curriculumUnit.create({
      data: {
        gradeCategory: 'GR_1_3',
        pillar: 'SOUND_FOUNDATION',
        stage: 'STAGE_1',
        title: 'Integration Test Unit',
        sequence: 1
      }
    })

    const lesson = await prisma.lesson.create({
      data: {
        unitId: unit.id,
        title: 'Integration Test Lesson',
        description: 'Complete lesson for integration testing',
        sequence: 1,
        estimatedMinutes: 15
      }
    })

    lessonId = lesson.id

    // Add lesson content with questions
    await prisma.lessonContent.create({
      data: {
        lessonId,
        type: 'LESSON',
        sequence: 1,
        title: 'Introduction',
        content: {
          text: 'Welcome to the integration test lesson.'
        }
      }
    })

    await prisma.lessonContent.create({
      data: {
        lessonId,
        type: 'EXERCISE',
        sequence: 2,
        title: 'Practice Questions',
        content: {
          passage: 'The quick brown fox jumps over the lazy dog.',
          questions: [
            {
              id: 'q1',
              type: 'multiple_choice',
              question: 'What color is the fox?',
              options: { a: 'Red', b: 'Brown', c: 'White', d: 'Black' },
              correctAnswer: 'b',
              points: 1
            },
            {
              id: 'q2',
              type: 'true_false',
              question: 'The dog is lazy.',
              correctAnswer: 'true',
              points: 1
            },
            {
              id: 'q3',
              type: 'text_match',
              question: 'What animal jumps?',
              correctAnswer: 'fox',
              points: 1
            }
          ]
        }
      }
    })
  })

  afterAll(async () => {
    // Cleanup
    await prisma.student.delete({ where: { id: studentId } })
  })

  describe('Happy Path - All Correct Answers', () => {
    it('should complete full lesson flow with perfect score', async () => {
      // Step 1: Start lesson
      const startResponse = await fetch('http://localhost:3000/api/lesson/session/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lessonId })
      })

      expect(startResponse.status).toBe(201)
      const startData = await startResponse.json()
      sessionId = startData.sessionId

      expect(startData.lesson.contents).toHaveLength(2)
      expect(startData.lesson.title).toBe('Integration Test Lesson')
      expect(startData.timing.expiresAt).toBeDefined()

      // Step 2: Submit answers (all correct)
      const submitResponse = await fetch(
        `http://localhost:3000/api/lesson/session/${sessionId}/submit`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            responses: {
              q1: 'b',      // Correct
              q2: 'true',   // Correct
              q3: 'fox'     // Correct
            }
          })
        }
      )

      expect(submitResponse.status).toBe(200)
      const results = await submitResponse.json()

      // Verify results
      expect(results.score).toBe(100)
      expect(results.passed).toBe(true)
      expect(results.correctCount).toBe(3)
      expect(results.totalQuestions).toBe(3)
      expect(results.xpEarned).toBe(100) // 50 base + 50 bonus for 100%

      // Verify responses detail
      expect(results.responses.q1.isCorrect).toBe(true)
      expect(results.responses.q2.isCorrect).toBe(true)
      expect(results.responses.q3.isCorrect).toBe(true)

      // Verify student XP updated
      const student = await prisma.student.findUnique({
        where: { id: studentId }
      })
      expect(student?.totalXP).toBe(100)
    })
  })

  describe('Partial Answers - Mixed Correct/Incorrect', () => {
    it('should handle partial correct answers and award XP accordingly', async () => {
      // Start lesson
      const startResponse = await fetch('http://localhost:3000/api/lesson/session/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lessonId })
      })

      const startData = await startResponse.json()
      const sessionId = startData.sessionId

      // Submit with partial correct answers
      const submitResponse = await fetch(
        `http://localhost:3000/api/lesson/session/${sessionId}/submit`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            responses: {
              q1: 'b',      // Correct
              q2: 'false',  // Incorrect (should be true)
              q3: 'fox'     // Correct
            }
          })
        }
      )

      const results = await submitResponse.json()

      // Score should be 66% (2 of 3 correct)
      expect(results.score).toBe(66)
      expect(results.passed).toBe(false) // < 80%
      expect(results.correctCount).toBe(2)
      expect(results.xpEarned).toBe(50) // 50 base, no bonus

      // Verify response details
      expect(results.responses.q2.isCorrect).toBe(false)
      expect(results.responses.q2.feedback).toContain('Incorrect')
    })
  })

  describe('All Wrong Answers', () => {
    it('should handle all incorrect answers', async () => {
      const startResponse = await fetch('http://localhost:3000/api/lesson/session/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lessonId })
      })

      const startData = await startResponse.json()

      const submitResponse = await fetch(
        `http://localhost:3000/api/lesson/session/${startData.sessionId}/submit`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            responses: {
              q1: 'a',      // Wrong
              q2: 'false',  // Wrong
              q3: 'dog'     // Wrong
            }
          })
        }
      )

      const results = await submitResponse.json()

      expect(results.score).toBe(0)
      expect(results.passed).toBe(false)
      expect(results.correctCount).toBe(0)
      expect(results.xpEarned).toBe(50) // Base XP only
    })
  })

  describe('Error Scenarios', () => {
    it('should reject submission without token', async () => {
      const startResponse = await fetch('http://localhost:3000/api/lesson/session/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lessonId })
      })

      const startData = await startResponse.json()

      const submitResponse = await fetch(
        `http://localhost:3000/api/lesson/session/${startData.sessionId}/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            responses: { q1: 'a' }
          })
        }
      )

      expect(submitResponse.status).toBe(401)
    })

    it('should reject invalid lesson ID on start', async () => {
      const response = await fetch('http://localhost:3000/api/lesson/session/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lessonId: 'nonexistent' })
      })

      expect(response.status).toBe(404)
    })

    it('should prevent duplicate session submission', async () => {
      // Start lesson
      const startResponse = await fetch('http://localhost:3000/api/lesson/session/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lessonId })
      })

      const startData = await startResponse.json()

      // Submit answers
      const submitResponse1 = await fetch(
        `http://localhost:3000/api/lesson/session/${startData.sessionId}/submit`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            responses: { q1: 'b', q2: 'true', q3: 'fox' }
          })
        }
      )

      expect(submitResponse1.status).toBe(200)

      // Try to submit again
      const submitResponse2 = await fetch(
        `http://localhost:3000/api/lesson/session/${startData.sessionId}/submit`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            responses: { q1: 'a', q2: 'false', q3: 'dog' }
          })
        }
      )

      expect(submitResponse2.status).toBe(409) // Conflict
    })

    it('should prevent starting duplicate active session', async () => {
      // Start lesson
      const startResponse1 = await fetch('http://localhost:3000/api/lesson/session/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lessonId })
      })

      expect(startResponse1.status).toBe(201)

      // Try to start same lesson again
      const startResponse2 = await fetch('http://localhost:3000/api/lesson/session/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lessonId })
      })

      expect(startResponse2.status).toBe(409)
    })
  })

  describe('Data Consistency', () => {
    it('should correctly update student XP in database', async () => {
      const xpBefore = (await prisma.student.findUnique({
        where: { id: studentId }
      }))?.totalXP || 0

      // Complete a lesson
      const startResponse = await fetch('http://localhost:3000/api/lesson/session/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lessonId })
      })

      const startData = await startResponse.json()

      await fetch(
        `http://localhost:3000/api/lesson/session/${startData.sessionId}/submit`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            responses: { q1: 'b', q2: 'true', q3: 'fox' }
          })
        }
      )

      // Verify XP increased
      const xpAfter = (await prisma.student.findUnique({
        where: { id: studentId }
      }))?.totalXP || 0

      expect(xpAfter).toBeGreaterThan(xpBefore)
    })

    it('should create lesson session record in database', async () => {
      const startResponse = await fetch('http://localhost:3000/api/lesson/session/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lessonId })
      })

      const startData = await startResponse.json()

      // Verify session exists in database
      const session = await prisma.lessonSession.findUnique({
        where: { id: startData.sessionId }
      })

      expect(session).toBeDefined()
      expect(session?.studentId).toBe(studentId)
      expect(session?.lessonId).toBe(lessonId)
      expect(session?.completedAt).toBeNull() // Not yet completed
    })

    it('should save responses correctly', async () => {
      const startResponse = await fetch('http://localhost:3000/api/lesson/session/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lessonId })
      })

      const startData = await startResponse.json()
      const testResponses = { q1: 'b', q2: 'true', q3: 'fox' }

      await fetch(
        `http://localhost:3000/api/lesson/session/${startData.sessionId}/submit`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ responses: testResponses })
        }
      )

      // Verify responses saved
      const session = await prisma.lessonSession.findUnique({
        where: { id: startData.sessionId }
      })

      expect(session?.responses).toEqual(testResponses)
    })
  })

  describe('Performance Testing', () => {
    it('should complete lesson start within 500ms', async () => {
      const startTime = Date.now()

      await fetch('http://localhost:3000/api/lesson/session/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lessonId })
      })

      const duration = Date.now() - startTime
      expect(duration).toBeLessThan(500)
    })

    it('should complete lesson submit within 500ms', async () => {
      const startResponse = await fetch('http://localhost:3000/api/lesson/session/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lessonId })
      })

      const startData = await startResponse.json()

      const startTime = Date.now()

      await fetch(
        `http://localhost:3000/api/lesson/session/${startData.sessionId}/submit`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            responses: { q1: 'b', q2: 'true', q3: 'fox' }
          })
        }
      )

      const duration = Date.now() - startTime
      expect(duration).toBeLessThan(500)
    })
  })

  describe('Complete End-to-End Journey', () => {
    it('should handle multiple lessons in sequence', async () => {
      // Complete first lesson
      const start1 = await fetch('http://localhost:3000/api/lesson/session/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lessonId })
      })

      const data1 = await start1.json()

      await fetch(
        `http://localhost:3000/api/lesson/session/${data1.sessionId}/submit`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            responses: { q1: 'b', q2: 'true', q3: 'fox' }
          })
        }
      )

      // Complete second lesson (create another in setup)
      const start2 = await fetch('http://localhost:3000/api/lesson/session/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lessonId })
      })

      expect(start2.status).toBe(409) // Can't start duplicate while previous is active
    })
  })
})
