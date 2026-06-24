import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

function verifyManagerToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    return decoded.managerId ? decoded : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('manager_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const manager = verifyManagerToken(token);
    if (!manager) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get all stats
    const [
      totalStudents,
      totalSchools,
      studentsLast30Days,
      studentsLast7Days,
      studentsLast24h,
      totalReadingSessions,
      totalSpeakingSessions,
      activeStudents,
      studentsByType,
      topPerformers
    ] = await Promise.all([
      prisma.student.count(),
      prisma.school.count(),
      prisma.student.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      prisma.student.count({
        where: { createdAt: { gte: sevenDaysAgo } }
      }),
      prisma.student.count({
        where: { createdAt: { gte: oneDayAgo } }
      }),
      prisma.readingSession.count(),
      prisma.speakingSession.count(),
      prisma.student.count({
        where: {
          OR: [
            { sessions: { some: { completedAt: { gte: sevenDaysAgo } } } },
            { speakingSessions: { some: { completedAt: { gte: sevenDaysAgo } } } }
          ]
        }
      }),
      prisma.student.groupBy({
        by: ['accountType'],
        _count: true
      }),
      prisma.student.findMany({
        take: 10,
        orderBy: { progress: { totalSessions: 'desc' } },
        select: {
          id: true,
          userId: true,
          name: true,
          phone: true,
          accountType: true,
          progress: {
            select: {
              currentLevel: true,
              totalSessions: true,
              avgAccuracy: true
            }
          }
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      summary: {
        totalStudents,
        totalSchools,
        studentsLast30Days,
        studentsLast7Days,
        studentsLast24h,
        activeStudentsLast7Days: activeStudents,
        engagementRate: totalStudents > 0 ? ((activeStudents / totalStudents) * 100).toFixed(1) : '0'
      },
      sessions: {
        totalReadingSessions,
        totalSpeakingSessions
      },
      studentsByType: studentsByType.map(s => ({
        type: s.accountType,
        count: s._count
      })),
      topPerformers: topPerformers.map(s => ({
        id: s.id,
        userId: s.userId,
        name: s.name,
        phone: s.phone,
        type: s.accountType,
        level: s.progress?.currentLevel || 0,
        sessions: s.progress?.totalSessions || 0,
        accuracy: s.progress?.avgAccuracy || 0
      }))
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard' },
      { status: 500 }
    );
  }
}
