import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const daysParam = req.nextUrl.searchParams.get('days');
    const days = parseInt(daysParam || '30', 10);

    const dailyStats = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      // Count unique students who had any session (reading or speaking) on this day
      const readingSessions = await prisma.readingSession.findMany({
        where: {
          createdAt: { gte: date, lt: nextDate },
          status: 'COMPLETED',
        },
        select: { studentId: true },
        distinct: ['studentId'],
      });

      const speakingSessions = await prisma.speakingSession.findMany({
        where: {
          createdAt: { gte: date, lt: nextDate },
          status: 'COMPLETED',
        },
        select: { studentId: true },
        distinct: ['studentId'],
      });

      const uniqueStudents = new Set([
        ...readingSessions.map(s => s.studentId),
        ...speakingSessions.map(s => s.studentId),
      ]);

      const readingCount = readingSessions.length;
      const speakingCount = speakingSessions.length;

      dailyStats.push({
        date: date.toISOString().split('T')[0],
        activeStudents: uniqueStudents.size,
        readingSessions: readingCount,
        speakingSessions: speakingCount,
        totalSessions: readingCount + speakingCount,
      });
    }

    // Calculate 7-day average
    const last7Days = dailyStats.slice(-7);
    const avg7DayActive = Math.round(
      (last7Days.reduce((sum, day) => sum + day.activeStudents, 0) / last7Days.length) * 10
    ) / 10;

    // Calculate growth rate
    const first7Days = dailyStats.slice(0, 7);
    const growth = last7Days.length > 0 && first7Days.length > 0
      ? Math.round(
          (((last7Days[6]?.activeStudents || 0) - (first7Days[0]?.activeStudents || 1)) / (first7Days[0]?.activeStudents || 1)) * 100
        )
      : 0;

    return NextResponse.json(
      {
        dailyStats,
        avg7DayActive,
        growth,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Daily active error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily active stats' },
      { status: 500 }
    );
  }
}
