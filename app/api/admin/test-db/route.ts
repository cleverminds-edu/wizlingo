import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const unitCount = await prisma.curriculumUnit.count()
    const students = await prisma.student.count()

    return NextResponse.json({
      curriculumUnits: unitCount,
      students,
      databaseStatus: 'connected'
    })
  } catch (error) {
    return NextResponse.json({
      error: String(error),
      databaseStatus: 'error'
    }, { status: 500 })
  }
}
