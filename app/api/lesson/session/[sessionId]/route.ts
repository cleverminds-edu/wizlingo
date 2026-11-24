import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyStudentToken, getTokenFromRequest } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
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
    const { sessionId } = await params

    // Fetch the session with all content
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

    // Verify student owns this session
    if (session.studentId !== studentId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this session' },
        { status: 403 }
      )
    }

    // Format response
    const formattedContents = session.lesson.contents.map((content) => ({
      id: content.id,
      type: content.type,
      sequence: content.sequence,
      title: content.title,
      content: content.content,
      mediaUrl: content.mediaUrl
    }))

    const expiresAt = new Date(session.startedAt.getTime() + 30 * 60 * 1000)

    return NextResponse.json({
      sessionId: session.id,
      lessonId: session.lesson.id,
      studentId: session.studentId,
      lesson: {
        id: session.lesson.id,
        title: session.lesson.title,
        description: session.lesson.description,
        estimatedMinutes: session.lesson.estimatedMinutes,
        contents: formattedContents
      },
      timing: {
        startedAt: session.startedAt.toISOString(),
        expiresAt: expiresAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Session fetch error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
