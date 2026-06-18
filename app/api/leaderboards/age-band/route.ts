import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  getAgeBandLeaderboard,
  getAllAgeBandLeaderboards,
  getAgeBandStats,
} from '@/lib/age-band-leaderboard';

export const dynamic = 'force-dynamic';

/**
 * GET /api/leaderboards/age-band?type=ACCURACY&limit=50
 *
 * Returns age band leaderboard for current student
 * Auto-detects student's age band from their profile
 *
 * Types: ACCURACY, CONSISTENCY, LEVEL, BADGES
 * Limit: 1-100 (default 50)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as 'ACCURACY' | 'CONSISTENCY' | 'LEVEL' | 'BADGES' || 'ACCURACY';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const getAll = searchParams.get('all') === 'true'; // Get all 4 leaderboards at once

    // Get current student
    const session = await getSession();
    if (!session || session.role !== 'student') {
      return NextResponse.json(
        { error: 'Unauthorized - student login required' },
        { status: 401 }
      );
    }

    // Get student's age band from progress
    const student = await prisma.student.findUnique({
      where: { id: session.id },
      include: { progress: true },
    });

    if (!student || !student.progress) {
      return NextResponse.json(
        { error: 'Student progress not found' },
        { status: 404 }
      );
    }

    const ageBand = student.progress.ageBand as any;

    // Validate type
    const validTypes = ['ACCURACY', 'CONSISTENCY', 'LEVEL', 'BADGES'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid leaderboard type' },
        { status: 400 }
      );
    }

    let result;

    if (getAll) {
      // Return all 4 leaderboards
      result = await getAllAgeBandLeaderboards(ageBand, session.id, limit);

      // Add stats
      const stats = await getAgeBandStats(ageBand);

      return NextResponse.json(
        {
          leaderboards: result,
          stats,
          studentAgeBand: ageBand,
        },
        {
          headers: {
            'Cache-Control': 'public, max-age=300, s-maxage=300', // 5 min cache
          },
        }
      );
    } else {
      // Return single leaderboard
      result = await getAgeBandLeaderboard(type, ageBand, session.id, limit);

      // Add stats
      const stats = await getAgeBandStats(ageBand);

      return NextResponse.json(
        {
          leaderboard: result,
          stats,
          studentAgeBand: ageBand,
        },
        {
          headers: {
            'Cache-Control': 'public, max-age=300, s-maxage=300', // 5 min cache
          },
        }
      );
    }
  } catch (error) {
    console.error('[Age Band Leaderboard API Error]', error);
    return NextResponse.json(
      { error: 'Failed to fetch age band leaderboard' },
      { status: 500 }
    );
  }
}
