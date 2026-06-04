import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/landing/school?schoolId=<id>
 * Get school data for landing pages including badge counts and social proof
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const schoolId = url.searchParams.get('schoolId');

    if (!schoolId) {
      return NextResponse.json(
        { error: 'schoolId required' },
        { status: 400 }
      );
    }

    // Get school info
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        classes: {
          include: {
            students: {
              include: {
                badges: true,
              },
            },
          },
        },
      },
    });

    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    // Calculate badge counts
    const allStudents = school.classes.flatMap((c) => c.students);
    const badgeCounts = {
      SPARK: 0,
      WORD_WIZARD: 0,
      VOICE_WIZARD: 0,
      LANGUAGE_WIZARD: 0,
      GRAND_WIZARD: 0,
    };

    allStudents.forEach((student) => {
      student.badges.forEach((badge) => {
        badgeCounts[badge.type as keyof typeof badgeCounts]++;
      });
    });

    // Get top badge earners
    const studentWithBadges = allStudents
      .filter((s) => s.badges.length > 0)
      .map((s) => ({
        id: s.id,
        name: s.name,
        badges: s.badges.map((b) => b.type),
        badgeCount: s.badges.length,
      }))
      .sort((a, b) => b.badgeCount - a.badgeCount)
      .slice(0, 10);

    return NextResponse.json({
      schoolId: school.id,
      schoolName: school.name,
      schoolCode: school.code,
      logoUrl: school.logoUrl,
      badgeCounts,
      totalStudents: allStudents.length,
      totalBadgesEarned: Object.values(badgeCounts).reduce((a, b) => a + b, 0),
      topStudents: studentWithBadges,
      leaderboard: studentWithBadges,
    });
  } catch (error) {
    console.error('Error fetching school landing data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch school data' },
      { status: 500 }
    );
  }
}
