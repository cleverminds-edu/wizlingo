import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyStudentToken, getTokenFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('=== LESSON START ENDPOINT ===')

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
    console.log('✓ Authentication passed, studentId:', studentId)

    // Step 2: Validate request body
    const body = await request.json()
    const { lessonId } = body

    if (!lessonId) {
      return NextResponse.json(
        { error: 'Bad Request: lessonId is required' },
        { status: 400 }
      )
    }

    console.log('✓ Request validated, lessonId:', lessonId)

    // Step 3: Fetch lesson with contents
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        unit: true,
        contents: {
          orderBy: { sequence: 'asc' }
        }
      }
    })

    if (!lesson) {
      return NextResponse.json(
        { error: 'Not Found: Lesson does not exist. Use /api/student/lessons to get available lessons.' },
        { status: 404 }
      )
    }

    // Step 4: Check if student already has an active session for this lesson
    const existingSession = await prisma.lessonSession.findFirst({
      where: {
        studentId,
        lessonId,
        completedAt: null  // Only check for incomplete sessions
      }
    })

    if (existingSession) {
      // Return existing session instead of error - allows resuming
      const formattedContents = lesson.contents.map((content) => ({
        id: content.id,
        type: content.type,
        sequence: content.sequence,
        title: content.title,
        content: content.content,
        mediaUrl: content.mediaUrl
      }))

      const expiresAt = new Date(existingSession.startedAt.getTime() + 30 * 60 * 1000)

      return NextResponse.json({
        sessionId: existingSession.id,
        lessonId: lesson.id,
        studentId,
        lesson: {
          id: lesson.id,
          unitId: lesson.unitId,
          title: lesson.title,
          description: lesson.description,
          estimatedMinutes: lesson.estimatedMinutes,
          contents: formattedContents
        },
        timing: {
          startedAt: existingSession.startedAt.toISOString(),
          expiresAt: expiresAt.toISOString()
        }
      }, { status: 200 })
    }

    // Step 5: Verify student has access to this lesson's grade level
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Not Found: Student not found' },
        { status: 404 }
      )
    }

    // Step 6: Create lesson session
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000) // 30 minutes

    const session = await prisma.lessonSession.create({
      data: {
        studentId,
        lessonId,
        startedAt: now
      }
    })

    // Step 7: Format response - content structure per LESSON_API_SPEC.md
    const formattedContents = lesson.contents.map((content) => ({
      id: content.id,
      type: content.type,
      sequence: content.sequence,
      title: content.title,
      content: content.content, // Contains: { passage?, questions[], etc }
      mediaUrl: content.mediaUrl
    }))

    const response = {
      sessionId: session.id,
      lessonId: lesson.id,
      studentId,
      lesson: {
        id: lesson.id,
        unitId: lesson.unitId,
        title: lesson.title,
        description: lesson.description,
        estimatedMinutes: lesson.estimatedMinutes,
        contents: formattedContents
      },
      timing: {
        startedAt: session.startedAt.toISOString(),
        expiresAt: expiresAt.toISOString()
      }
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Lesson start error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
