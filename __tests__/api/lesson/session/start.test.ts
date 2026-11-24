import { POST } from '@/app/api/lesson/session/start/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createToken } from '@/lib/auth'

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    lesson: {
      findUnique: jest.fn()
    },
    lessonSession: {
      findFirst: jest.fn(),
      create: jest.fn()
    },
    student: {
      findUnique: jest.fn()
    }
  }
}))

// Mock auth utilities
jest.mock('@/lib/auth', () => ({
  verifyStudentToken: jest.fn(),
  getTokenFromRequest: jest.fn(),
  createToken: jest.fn()
}))

describe('POST /api/lesson/session/start', () => {
  const studentId = 'student_123'
  const lessonId = 'lesson_456'
  const token = 'valid_token'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should return 401 when no token provided', async () => {
      const { getTokenFromRequest } = require('@/lib/auth')
      getTokenFromRequest.mockReturnValue(null)

      const request = new NextRequest('http://localhost:3000/api/lesson/session/start', {
        method: 'POST',
        body: JSON.stringify({ lessonId })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('No token provided')
    })

    it('should return 401 when token is invalid', async () => {
      const { getTokenFromRequest, verifyStudentToken } = require('@/lib/auth')
      getTokenFromRequest.mockReturnValue(token)
      verifyStudentToken.mockReturnValue(null)

      const request = new NextRequest('http://localhost:3000/api/lesson/session/start', {
        method: 'POST',
        body: JSON.stringify({ lessonId })
      })

      const response = await POST(request)
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

    it('should return 400 when lessonId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/lesson/session/start', {
        method: 'POST',
        body: JSON.stringify({})
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('lessonId is required')
    })

    it('should return 400 when body is empty', async () => {
      const request = new NextRequest('http://localhost:3000/api/lesson/session/start', {
        method: 'POST',
        body: JSON.stringify({})
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })
  })

  describe('Lesson Validation', () => {
    beforeEach(() => {
      const { getTokenFromRequest, verifyStudentToken } = require('@/lib/auth')
      getTokenFromRequest.mockReturnValue(token)
      verifyStudentToken.mockReturnValue({ studentId })
    })

    it('should return 404 when lesson does not exist', async () => {
      const { prisma } = require('@/lib/prisma')
      prisma.lesson.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/lesson/session/start', {
        method: 'POST',
        body: JSON.stringify({ lessonId })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('Lesson does not exist')
    })

    it('should return 409 when session already exists for lesson', async () => {
      const { prisma } = require('@/lib/prisma')
      const mockLesson = {
        id: lessonId,
        title: 'Test Lesson',
        unitId: 'unit_123',
        contents: []
      }

      prisma.lesson.findUnique.mockResolvedValue(mockLesson)
      prisma.lessonSession.findFirst.mockResolvedValue({ id: 'session_exists' })

      const request = new NextRequest('http://localhost:3000/api/lesson/session/start', {
        method: 'POST',
        body: JSON.stringify({ lessonId })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toContain('Active session already exists')
    })
  })

  describe('Success Cases', () => {
    beforeEach(() => {
      const { getTokenFromRequest, verifyStudentToken } = require('@/lib/auth')
      getTokenFromRequest.mockReturnValue(token)
      verifyStudentToken.mockReturnValue({ studentId })
    })

    it('should create session and return 201 with valid request', async () => {
      const { prisma } = require('@/lib/prisma')

      const mockLesson = {
        id: lessonId,
        unitId: 'unit_123',
        title: 'Reading Comprehension: The Adventure',
        description: 'Read a passage and answer questions',
        estimatedMinutes: 15,
        unit: { gradeCategory: 'GR_1_3' },
        contents: [
          {
            id: 'content_1',
            type: 'LESSON',
            sequence: 1,
            title: 'Introduction',
            content: { text: 'Welcome to the lesson...' },
            mediaUrl: null
          },
          {
            id: 'content_2',
            type: 'EXERCISE',
            sequence: 2,
            title: 'Practice',
            content: {
              passage: 'Once upon a time...',
              questions: [
                {
                  id: 'q1',
                  type: 'multiple_choice',
                  question: 'What is the main character?',
                  options: { a: 'John', b: 'Sarah', c: 'Michael', d: 'Emma' },
                  correctAnswer: 'b'
                }
              ]
            },
            mediaUrl: null
          }
        ]
      }

      prisma.lesson.findUnique.mockResolvedValue(mockLesson)
      prisma.lessonSession.findFirst.mockResolvedValue(null) // No existing session
      prisma.student.findUnique.mockResolvedValue({
        id: studentId,
        gradeCategory: 'GR_1_3'
      })

      const mockSession = {
        id: 'session_789',
        studentId,
        lessonId,
        startedAt: new Date(),
        completedAt: null
      }

      prisma.lessonSession.create.mockResolvedValue(mockSession)

      const request = new NextRequest('http://localhost:3000/api/lesson/session/start', {
        method: 'POST',
        body: JSON.stringify({ lessonId })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.sessionId).toBe(mockSession.id)
      expect(data.lessonId).toBe(lessonId)
      expect(data.studentId).toBe(studentId)
      expect(data.lesson.title).toBe(mockLesson.title)
      expect(data.lesson.contents).toHaveLength(2)
      expect(data.timing.startedAt).toBeDefined()
      expect(data.timing.expiresAt).toBeDefined()
    })

    it('should include all lesson contents in correct format', async () => {
      const { prisma } = require('@/lib/prisma')

      const mockLesson = {
        id: lessonId,
        unitId: 'unit_123',
        title: 'Test Lesson',
        description: null,
        estimatedMinutes: 15,
        unit: { gradeCategory: 'GR_1_3' },
        contents: [
          {
            id: 'content_1',
            type: 'EXERCISE',
            sequence: 1,
            title: 'Practice Questions',
            content: {
              questions: [
                {
                  id: 'q1',
                  type: 'multiple_choice',
                  question: 'Which is correct?',
                  options: { a: 'Option A', b: 'Option B' },
                  correctAnswer: 'a'
                }
              ]
            },
            mediaUrl: 'https://example.com/image.png'
          }
        ]
      }

      prisma.lesson.findUnique.mockResolvedValue(mockLesson)
      prisma.lessonSession.findFirst.mockResolvedValue(null)
      prisma.student.findUnique.mockResolvedValue({ id: studentId })
      prisma.lessonSession.create.mockResolvedValue({
        id: 'session_123',
        startedAt: new Date()
      })

      const request = new NextRequest('http://localhost:3000/api/lesson/session/start', {
        method: 'POST',
        body: JSON.stringify({ lessonId })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.lesson.contents[0]).toEqual({
        id: 'content_1',
        type: 'EXERCISE',
        sequence: 1,
        title: 'Practice Questions',
        content: mockLesson.contents[0].content,
        mediaUrl: 'https://example.com/image.png'
      })
    })
  })

  describe('Database Operations', () => {
    beforeEach(() => {
      const { getTokenFromRequest, verifyStudentToken } = require('@/lib/auth')
      getTokenFromRequest.mockReturnValue(token)
      verifyStudentToken.mockReturnValue({ studentId })
    })

    it('should call prisma.lesson.findUnique with correct lessonId', async () => {
      const { prisma } = require('@/lib/prisma')

      prisma.lesson.findUnique.mockResolvedValue({
        id: lessonId,
        unitId: 'unit_123',
        title: 'Test',
        contents: []
      })
      prisma.lessonSession.findFirst.mockResolvedValue(null)
      prisma.student.findUnique.mockResolvedValue({ id: studentId })
      prisma.lessonSession.create.mockResolvedValue({
        id: 'session_123',
        startedAt: new Date()
      })

      const request = new NextRequest('http://localhost:3000/api/lesson/session/start', {
        method: 'POST',
        body: JSON.stringify({ lessonId })
      })

      await POST(request)

      expect(prisma.lesson.findUnique).toHaveBeenCalledWith({
        where: { id: lessonId },
        include: {
          unit: true,
          contents: { orderBy: { sequence: 'asc' } }
        }
      })
    })

    it('should create LessonSession with studentId and lessonId', async () => {
      const { prisma } = require('@/lib/prisma')

      prisma.lesson.findUnique.mockResolvedValue({
        id: lessonId,
        unitId: 'unit_123',
        title: 'Test',
        contents: []
      })
      prisma.lessonSession.findFirst.mockResolvedValue(null)
      prisma.student.findUnique.mockResolvedValue({ id: studentId })
      prisma.lessonSession.create.mockResolvedValue({
        id: 'session_123',
        startedAt: new Date()
      })

      const request = new NextRequest('http://localhost:3000/api/lesson/session/start', {
        method: 'POST',
        body: JSON.stringify({ lessonId })
      })

      await POST(request)

      expect(prisma.lessonSession.create).toHaveBeenCalledWith({
        data: {
          studentId,
          lessonId,
          startedAt: expect.any(Date)
        }
      })
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

      prisma.lesson.findUnique.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/lesson/session/start', {
        method: 'POST',
        body: JSON.stringify({ lessonId })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal Server Error')
    })

    it('should return 404 when student not found', async () => {
      const { prisma } = require('@/lib/prisma')

      prisma.lesson.findUnique.mockResolvedValue({
        id: lessonId,
        unitId: 'unit_123',
        title: 'Test',
        contents: []
      })
      prisma.lessonSession.findFirst.mockResolvedValue(null)
      prisma.student.findUnique.mockResolvedValue(null) // Student not found

      const request = new NextRequest('http://localhost:3000/api/lesson/session/start', {
        method: 'POST',
        body: JSON.stringify({ lessonId })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('Student not found')
    })
  })
})
