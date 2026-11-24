import { POST } from '@/app/api/lesson/session/[sessionId]/submit/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    lessonSession: {
      findUnique: jest.fn(),
      update: jest.fn()
    },
    student: {
      update: jest.fn()
    },
    journeyProgress: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn()
    }
  }
}))

// Mock auth utilities
jest.mock('@/lib/auth', () => ({
  verifyStudentToken: jest.fn(),
  getTokenFromRequest: jest.fn()
}))

describe('POST /api/lesson/session/[sessionId]/submit', () => {
  const studentId = 'student_123'
  const sessionId = 'session_789'
  const token = 'valid_token'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should return 401 when no token provided', async () => {
      const { getTokenFromRequest } = require('@/lib/auth')
      getTokenFromRequest.mockReturnValue(null)

      const request = new NextRequest(
        `http://localhost:3000/api/lesson/session/${sessionId}/submit`,
        {
          method: 'POST',
          body: JSON.stringify({ responses: { q1: 'a' } })
        }
      )

      const response = await POST(request, { params: { sessionId } })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('No token provided')
    })

    it('should return 401 when token is invalid', async () => {
      const { getTokenFromRequest, verifyStudentToken } = require('@/lib/auth')
      getTokenFromRequest.mockReturnValue(token)
      verifyStudentToken.mockReturnValue(null)

      const request = new NextRequest(
        `http://localhost:3000/api/lesson/session/${sessionId}/submit`,
        {
          method: 'POST',
          body: JSON.stringify({ responses: { q1: 'a' } })
        }
      )

      const response = await POST(request, { params: { sessionId } })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('Invalid token')
    })
  })

  describe('Request Validation', () => {
    beforeEach(() => {
      const { getTokenFromRequest, verifyStudentToken } = require('@/lib/auth')
      getTokenFromRequest.mockReturnValue(token)
      verifyStudentToken.mockReturnValue({ studentId })
    })

    it('should return 400 when responses is missing', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/lesson/session/${sessionId}/submit`,
        {
          method: 'POST',
          body: JSON.stringify({})
        }
      )

      const response = await POST(request, { params: { sessionId } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('responses')
    })

    it('should return 400 when responses is not an object', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/lesson/session/${sessionId}/submit`,
        {
          method: 'POST',
          body: JSON.stringify({ responses: ['a', 'b'] })
        }
      )

      const response = await POST(request, { params: { sessionId } })
      const data = await response.json()

      expect(response.status).toBe(400)
    })
  })

  describe('Session Validation', () => {
    beforeEach(() => {
      const { getTokenFromRequest, verifyStudentToken } = require('@/lib/auth')
      getTokenFromRequest.mockReturnValue(token)
      verifyStudentToken.mockReturnValue({ studentId })
    })

    it('should return 404 when session does not exist', async () => {
      const { prisma } = require('@/lib/prisma')
      prisma.lessonSession.findUnique.mockResolvedValue(null)

      const request = new NextRequest(
        `http://localhost:3000/api/lesson/session/${sessionId}/submit`,
        {
          method: 'POST',
          body: JSON.stringify({ responses: { q1: 'a' } })
        }
      )

      const response = await POST(request, { params: { sessionId } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('does not exist')
    })

    it('should return 403 when student does not own session', async () => {
      const { prisma } = require('@/lib/prisma')
      const mockSession = {
        id: sessionId,
        studentId: 'different_student',
        lessonId: 'lesson_001',
        startedAt: new Date(),
        completedAt: null,
        lesson: {
          id: 'lesson_001',
          contents: [
            {
              id: 'content_1',
              type: 'EXERCISE',
              sequence: 1,
              content: {
                questions: [{ id: 'q1', type: 'multiple_choice', correctAnswer: 'a' }]
              }
            }
          ]
        }
      }

      prisma.lessonSession.findUnique.mockResolvedValue(mockSession)

      const request = new NextRequest(
        `http://localhost:3000/api/lesson/session/${sessionId}/submit`,
        {
          method: 'POST',
          body: JSON.stringify({ responses: { q1: 'a' } })
        }
      )

      const response = await POST(request, { params: { sessionId } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toContain('do not own')
    })

    it('should return 409 when session already completed', async () => {
      const { prisma } = require('@/lib/prisma')
      const mockSession = {
        id: sessionId,
        studentId,
        lessonId: 'lesson_001',
        startedAt: new Date(),
        completedAt: new Date(), // Already completed
        lesson: {
          id: 'lesson_001',
          contents: []
        }
      }

      prisma.lessonSession.findUnique.mockResolvedValue(mockSession)

      const request = new NextRequest(
        `http://localhost:3000/api/lesson/session/${sessionId}/submit`,
        {
          method: 'POST',
          body: JSON.stringify({ responses: { q1: 'a' } })
        }
      )

      const response = await POST(request, { params: { sessionId } })
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toContain('already been submitted')
    })
  })

  describe('Success Cases - Perfect Score', () => {
    beforeEach(() => {
      const { getTokenFromRequest, verifyStudentToken } = require('@/lib/auth')
      getTokenFromRequest.mockReturnValue(token)
      verifyStudentToken.mockReturnValue({ studentId })
    })

    it('should process submission with all correct answers', async () => {
      const { prisma } = require('@/lib/prisma')

      const mockSession = {
        id: sessionId,
        studentId,
        lessonId: 'lesson_001',
        startedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        completedAt: null,
        score: null,
        passed: false,
        xpEarned: 0,
        durationSec: null,
        responses: {},
        lesson: {
          id: 'lesson_001',
          contents: [
            {
              id: 'content_1',
              type: 'EXERCISE',
              sequence: 1,
              content: {
                questions: [
                  {
                    id: 'q1',
                    type: 'multiple_choice',
                    question: 'What?',
                    correctAnswer: 'a',
                    points: 1,
                    options: { a: 'Yes', b: 'No' }
                  },
                  {
                    id: 'q2',
                    type: 'true_false',
                    question: 'Is it true?',
                    correctAnswer: 'true',
                    points: 1
                  }
                ]
              }
            }
          ]
        }
      }

      prisma.lessonSession.findUnique.mockResolvedValue(mockSession)
      prisma.lessonSession.update.mockResolvedValue({
        ...mockSession,
        completedAt: new Date(),
        score: 100,
        passed: true,
        xpEarned: 100,
        durationSec: 600
      })
      prisma.student.update.mockResolvedValue({})
      prisma.journeyProgress.findUnique.mockResolvedValue(null)
      prisma.journeyProgress.create.mockResolvedValue({})
      prisma.journeyProgress.update.mockResolvedValue({})

      const request = new NextRequest(
        `http://localhost:3000/api/lesson/session/${sessionId}/submit`,
        {
          method: 'POST',
          body: JSON.stringify({
            responses: {
              q1: 'a',
              q2: 'true'
            }
          })
        }
      )

      const response = await POST(request, { params: { sessionId } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.score).toBe(100)
      expect(data.passed).toBe(true)
      expect(data.correctCount).toBe(2)
      expect(data.totalQuestions).toBe(2)
      expect(data.xpEarned).toBe(100) // 50 base + 50 bonus for 100%
      expect(data.feedback.overall).toContain('Perfect')
    })

    it('should award correct XP for different scores', async () => {
      const { prisma } = require('@/lib/prisma')

      const mockSession = {
        id: sessionId,
        studentId,
        lessonId: 'lesson_001',
        startedAt: new Date(),
        completedAt: null,
        lesson: {
          id: 'lesson_001',
          contents: [
            {
              id: 'content_1',
              type: 'EXERCISE',
              sequence: 1,
              content: {
                questions: [
                  { id: 'q1', type: 'multiple_choice', correctAnswer: 'a', points: 1, options: { a: 'A', b: 'B' } },
                  { id: 'q2', type: 'multiple_choice', correctAnswer: 'a', points: 1, options: { a: 'A', b: 'B' } }
                ]
              }
            }
          ]
        }
      }

      // Test 80% score (1 correct, 1 wrong)
      prisma.lessonSession.findUnique.mockResolvedValue(mockSession)
      prisma.lessonSession.update.mockResolvedValue({
        ...mockSession,
        completedAt: new Date(),
        score: 50,
        passed: false,
        xpEarned: 50,
        durationSec: 300
      })
      prisma.student.update.mockResolvedValue({})

      const request = new NextRequest(
        `http://localhost:3000/api/lesson/session/${sessionId}/submit`,
        {
          method: 'POST',
          body: JSON.stringify({
            responses: {
              q1: 'a',
              q2: 'b'
            }
          })
        }
      )

      const response = await POST(request, { params: { sessionId } })
      const data = await response.json()

      expect(data.xpEarned).toBe(50) // 50 base, no bonus for <80%
    })
  })

  describe('Database Operations', () => {
    beforeEach(() => {
      const { getTokenFromRequest, verifyStudentToken } = require('@/lib/auth')
      getTokenFromRequest.mockReturnValue(token)
      verifyStudentToken.mockReturnValue({ studentId })
    })

    it('should update lesson session with results', async () => {
      const { prisma } = require('@/lib/prisma')

      const mockSession = {
        id: sessionId,
        studentId,
        lessonId: 'lesson_001',
        startedAt: new Date(),
        completedAt: null,
        lesson: {
          id: 'lesson_001',
          contents: [
            {
              id: 'content_1',
              type: 'EXERCISE',
              sequence: 1,
              content: {
                questions: [
                  { id: 'q1', type: 'multiple_choice', correctAnswer: 'a', points: 1, options: { a: 'A', b: 'B' } }
                ]
              }
            }
          ]
        }
      }

      prisma.lessonSession.findUnique.mockResolvedValue(mockSession)
      prisma.lessonSession.update.mockResolvedValue({
        ...mockSession,
        completedAt: new Date(),
        score: 100,
        passed: true,
        xpEarned: 100,
        durationSec: 300
      })
      prisma.student.update.mockResolvedValue({})

      const request = new NextRequest(
        `http://localhost:3000/api/lesson/session/${sessionId}/submit`,
        {
          method: 'POST',
          body: JSON.stringify({ responses: { q1: 'a' } })
        }
      )

      await POST(request, { params: { sessionId } })

      expect(prisma.lessonSession.update).toHaveBeenCalledWith({
        where: { id: sessionId },
        data: expect.objectContaining({
          completedAt: expect.any(Date),
          score: 100,
          passed: true,
          xpEarned: 100,
          durationSec: expect.any(Number),
          responses: { q1: 'a' }
        })
      })
    })

    it('should award XP to student', async () => {
      const { prisma } = require('@/lib/prisma')

      const mockSession = {
        id: sessionId,
        studentId,
        lessonId: 'lesson_001',
        startedAt: new Date(),
        completedAt: null,
        lesson: {
          id: 'lesson_001',
          contents: [
            {
              id: 'content_1',
              type: 'EXERCISE',
              sequence: 1,
              content: {
                questions: [
                  { id: 'q1', type: 'multiple_choice', correctAnswer: 'a', points: 1, options: { a: 'A', b: 'B' } }
                ]
              }
            }
          ]
        }
      }

      prisma.lessonSession.findUnique.mockResolvedValue(mockSession)
      prisma.lessonSession.update.mockResolvedValue({
        ...mockSession,
        completedAt: new Date(),
        score: 100,
        passed: true,
        xpEarned: 100,
        durationSec: 300
      })
      prisma.student.update.mockResolvedValue({})

      const request = new NextRequest(
        `http://localhost:3000/api/lesson/session/${sessionId}/submit`,
        {
          method: 'POST',
          body: JSON.stringify({ responses: { q1: 'a' } })
        }
      )

      await POST(request, { params: { sessionId } })

      expect(prisma.student.update).toHaveBeenCalledWith({
        where: { id: studentId },
        data: {
          totalXP: { increment: 100 }
        }
      })
    })
  })

  describe('Response Format', () => {
    beforeEach(() => {
      const { getTokenFromRequest, verifyStudentToken } = require('@/lib/auth')
      getTokenFromRequest.mockReturnValue(token)
      verifyStudentToken.mockReturnValue({ studentId })
    })

    it('should return properly formatted response', async () => {
      const { prisma } = require('@/lib/prisma')

      const mockSession = {
        id: sessionId,
        studentId,
        lessonId: 'lesson_001',
        startedAt: new Date('2026-06-30T10:00:00Z'),
        completedAt: null,
        lesson: {
          id: 'lesson_001',
          contents: [
            {
              id: 'content_1',
              type: 'EXERCISE',
              sequence: 1,
              content: {
                questions: [
                  { id: 'q1', type: 'multiple_choice', question: 'What?', correctAnswer: 'a', points: 1, options: { a: 'A', b: 'B' } }
                ]
              }
            }
          ]
        }
      }

      prisma.lessonSession.findUnique.mockResolvedValue(mockSession)
      prisma.lessonSession.update.mockResolvedValue({
        ...mockSession,
        completedAt: new Date('2026-06-30T10:05:00Z'),
        score: 100,
        passed: true,
        xpEarned: 100,
        durationSec: 300
      })
      prisma.student.update.mockResolvedValue({})

      const request = new NextRequest(
        `http://localhost:3000/api/lesson/session/${sessionId}/submit`,
        {
          method: 'POST',
          body: JSON.stringify({ responses: { q1: 'a' } })
        }
      )

      const response = await POST(request, { params: { sessionId } })
      const data = await response.json()

      expect(data).toHaveProperty('sessionId')
      expect(data).toHaveProperty('lessonId')
      expect(data).toHaveProperty('studentId')
      expect(data).toHaveProperty('score')
      expect(data).toHaveProperty('maxScore')
      expect(data).toHaveProperty('passed')
      expect(data).toHaveProperty('correctCount')
      expect(data).toHaveProperty('totalQuestions')
      expect(data).toHaveProperty('xpEarned')
      expect(data).toHaveProperty('responses')
      expect(data).toHaveProperty('feedback')
      expect(data).toHaveProperty('completion')
      expect(data).toHaveProperty('progressUpdate')
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      const { getTokenFromRequest, verifyStudentToken } = require('@/lib/auth')
      getTokenFromRequest.mockReturnValue(token)
      verifyStudentToken.mockReturnValue({ studentId })
    })

    it('should return 500 on database error', async () => {
      const { prisma } = require('@/lib/prisma')

      prisma.lessonSession.findUnique.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest(
        `http://localhost:3000/api/lesson/session/${sessionId}/submit`,
        {
          method: 'POST',
          body: JSON.stringify({ responses: { q1: 'a' } })
        }
      )

      const response = await POST(request, { params: { sessionId } })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal Server Error')
    })
  })
})
