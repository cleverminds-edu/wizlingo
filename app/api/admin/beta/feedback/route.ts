import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const daysParam = req.nextUrl.searchParams.get('days');
    const days = parseInt(daysParam || '7', 10);

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    // Get all feedback in period
    const allFeedback = await prisma.betaFeedback.findMany({
      where: {
        createdAt: { gte: sinceDate },
      },
      select: {
        id: true,
        studentId: true,
        sessionType: true,
        rating: true,
        selectedIssues: true,
        comment: true,
        createdAt: true,
        student: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Aggregate issue counts
    const issueCounts: Record<string, number> = {};
    const issues = new Set<string>();

    allFeedback.forEach((fb) => {
      fb.selectedIssues.forEach((issue) => {
        issues.add(issue);
        issueCounts[issue] = (issueCounts[issue] || 0) + 1;
      });
    });

    // Get top complaints (issues with comments)
    const complaintsWithComments = allFeedback
      .filter((fb) => fb.comment && fb.comment.trim().length > 0)
      .slice(0, 5);

    // Calculate average rating
    const avgRating = allFeedback.length > 0
      ? Math.round((allFeedback.reduce((sum, fb) => sum + fb.rating, 0) / allFeedback.length) * 10) / 10
      : 0;

    // Get satisfaction trend (by day)
    const dailyStats: Record<string, { count: number; avgRating: number }> = {};
    allFeedback.forEach((fb) => {
      const dateKey = fb.createdAt.toISOString().split('T')[0];
      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = { count: 0, avgRating: 0 };
      }
      dailyStats[dateKey].count += 1;
      dailyStats[dateKey].avgRating += fb.rating;
    });

    // Convert to array and calculate averages
    const trend = Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      count: stats.count,
      avgRating: Math.round((stats.avgRating / stats.count) * 10) / 10,
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Issue breakdown by session type
    const issuesByType: Record<string, Record<string, number>> = {
      reading: {},
      speaking: {},
    };

    allFeedback.forEach((fb) => {
      fb.selectedIssues.forEach((issue) => {
        const type = fb.sessionType as 'reading' | 'speaking';
        if (!issuesByType[type][issue]) {
          issuesByType[type][issue] = 0;
        }
        issuesByType[type][issue] += 1;
      });
    });

    return NextResponse.json(
      {
        totalFeedback: allFeedback.length,
        avgRating,
        issueCounts: Object.entries(issueCounts)
          .sort(([, a], [, b]) => b - a)
          .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {}),
        topComplaints: complaintsWithComments.map((fb) => ({
          studentName: fb.student.name,
          comment: fb.comment,
          rating: fb.rating,
          sessionType: fb.sessionType,
        })),
        trend,
        issuesByType,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Beta feedback error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}
