import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Get basic stats
    const totalStudents = await prisma.student.count({
      where: { accountType: 'SCHOOL' },
    });

    const activeTodayCount = await prisma.readingSession.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
      select: { studentId: true },
      distinct: ['studentId'],
    });

    const activeTodayStudents = new Set(activeTodayCount.map(s => s.studentId)).size;

    const totalSessions = await prisma.readingSession.count({
      where: { status: 'COMPLETED' },
    });

    const speakingSessions = await prisma.speakingSession.count({
      where: { status: 'COMPLETED' },
    });

    // Get average metrics
    const readingMetrics = await prisma.readingSession.aggregate({
      where: { status: 'COMPLETED' },
      _avg: {
        accuracy: true,
        wpm: true,
      },
    });

    const speakingMetrics = await prisma.speakingSession.aggregate({
      where: { status: 'COMPLETED' },
      _avg: {
        fluencyScore: true,
        wpm: true,
      },
    });

    // Top performer
    const topPerformer = await prisma.student.findFirst({
      where: { accountType: 'SCHOOL' },
      select: {
        id: true,
        name: true,
        progress: {
          select: {
            currentLevel: true,
            avgAccuracy: true,
          },
        },
      },
      orderBy: {
        progress: {
          avgAccuracy: 'desc',
        },
      },
    });

    return NextResponse.json(
      {
        totalStudents,
        activeTodayStudents,
        totalReadingSessions: totalSessions,
        totalSpeakingSessions: speakingSessions,
        avgReadingAccuracy: Math.round((readingMetrics._avg.accuracy || 0) * 10) / 10,
        avgReadingWpm: Math.round((readingMetrics._avg.wpm || 0) * 10) / 10,
        avgSpeakingFluency: Math.round((speakingMetrics._avg.fluencyScore || 0) * 10) / 10,
        avgSpeakingWpm: Math.round((speakingMetrics._avg.wpm || 0) * 10) / 10,
        topPerformer: topPerformer ? {
          name: topPerformer.name,
          level: topPerformer.progress?.currentLevel || 1,
          accuracy: Math.round((topPerformer.progress?.avgAccuracy || 0) * 10) / 10,
        } : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Beta stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
