import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total students
    const totalStudents = await prisma.student.count({
      where: { accountType: 'B2C' },
    });

    // Students signed up today
    const newStudentsToday = await prisma.student.count({
      where: {
        accountType: 'B2C',
        createdAt: { gte: today },
      },
    });

    // Students signed up this week
    const newStudentsThisWeek = await prisma.student.count({
      where: {
        accountType: 'B2C',
        createdAt: { gte: thisWeek },
      },
    });

    // Students with reading sessions
    const studentsWithReadingSessions = await prisma.student.count({
      where: {
        accountType: 'B2C',
        sessions: { some: {} },
      },
    });

    // Students with speaking sessions
    const studentsWithSpeakingSessions = await prisma.student.count({
      where: {
        accountType: 'B2C',
        speakingSessions: { some: {} },
      },
    });

    // Active students (had sessions in last 24 hours)
    const activeStudentsLast24h = await prisma.student.count({
      where: {
        accountType: 'B2C',
        OR: [
          { sessions: { some: { createdAt: { gte: today } } } },
          { speakingSessions: { some: { createdAt: { gte: today } } } },
        ],
      },
    });

    // Active students (this week)
    const activeStudentsThisWeek = await prisma.student.count({
      where: {
        accountType: 'B2C',
        OR: [
          { sessions: { some: { createdAt: { gte: thisWeek } } } },
          { speakingSessions: { some: { createdAt: { gte: thisWeek } } } },
        ],
      },
    });

    // Get average reading level and accuracy
    const readingStats = await prisma.studentProgress.aggregate({
      where: {
        student: { accountType: 'B2C' },
      },
      _avg: {
        currentLevel: true,
        avgAccuracy: true,
      },
    });

    // Get speaking progress
    const speakingStats = await prisma.speakingProgress.aggregate({
      where: {
        student: { accountType: 'B2C' },
      },
      _avg: {
        currentLevel: true,
      },
    });

    // Total sessions
    const totalReadingSessions = await prisma.readingSession.count({
      where: {
        student: { accountType: 'B2C' },
      },
    });

    const totalSpeakingSessions = await prisma.speakingSession.count({
      where: {
        student: { accountType: 'B2C' },
      },
    });

    // Badge stats
    const badgeStats = await prisma.badge.groupBy({
      by: ['type'],
      where: {
        student: { accountType: 'B2C' },
      },
      _count: true,
    });

    // Recent signups (last 10)
    const recentSignups = await prisma.student.findMany({
      where: { accountType: 'B2C' },
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true,
        class: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Top performing students (by accuracy)
    const topPerformers = await prisma.studentProgress.findMany({
      where: {
        student: { accountType: 'B2C' },
        avgAccuracy: { gt: 0 },
      },
      select: {
        student: {
          select: {
            name: true,
            phone: true,
          },
        },
        currentLevel: true,
        avgAccuracy: true,
        totalSessions: true,
      },
      orderBy: { avgAccuracy: 'desc' },
      take: 10,
    });

    // Engagement rate
    const engagementRate = totalStudents > 0
      ? Math.round((studentsWithReadingSessions / totalStudents) * 100)
      : 0;

    return NextResponse.json(
      {
        summary: {
          totalStudents,
          newStudentsToday,
          newStudentsThisWeek,
          activeStudentsLast24h,
          activeStudentsThisWeek,
          engagementRate,
        },
        participation: {
          studentsWithReadingSessions,
          studentsWithSpeakingSessions,
          totalReadingSessions,
          totalSpeakingSessions,
        },
        performance: {
          avgReadingLevel: Math.round((readingStats._avg.currentLevel || 0) * 10) / 10,
          avgReadingAccuracy: Math.round((readingStats._avg.avgAccuracy || 0) * 100) / 100,
          avgSpeakingLevel: Math.round((speakingStats._avg.currentLevel || 0) * 10) / 10,
        },
        badges: badgeStats.map((badge) => ({
          type: badge.type,
          count: badge._count,
        })),
        recentSignups,
        topPerformers: topPerformers.map((p) => ({
          name: p.student.name,
          phone: p.student.phone,
          level: p.currentLevel,
          accuracy: Math.round(p.avgAccuracy * 100) / 100,
          sessions: p.totalSessions,
        })),
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
