import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyStudentToken, getTokenFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const payload = verifyStudentToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get or create journey progress
    let journey = await prisma.journeyProgress.findUnique({
      where: { studentId: payload.studentId }
    })

    if (!journey) {
      // Create initial journey progress if it doesn't exist
      journey = await prisma.journeyProgress.create({
        data: {
          studentId: payload.studentId,
          currentPillar: 'SOUND_FOUNDATION',
          currentStage: 'STAGE_1',
          stageProgress: 0,
          soundFoundationScore: 0,
          languageFoundationScore: 0,
          coreSkillsScore: 0,
          communicationScore: 0,
          higherOrderScore: 0,
          masteredStages: [],
        }
      })
    }

    return NextResponse.json(journey)
  } catch (error) {
    console.error('Error fetching journey:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
