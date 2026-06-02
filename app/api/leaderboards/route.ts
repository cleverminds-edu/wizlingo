import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/leaderboard-service';
import type { LeaderboardType } from '@/app/generated/prisma/client';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/leaderboards?type=BADGE_COUNT&scope=class&classId=123&limit=50
 *
 * Returns leaderboard data with current user's rank
 * Caches response for 1 hour
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as LeaderboardType;
    const scope = searchParams.get('scope') || 'all';
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 100);

    // Validate leaderboard type
    const validTypes = ['BADGE_COUNT', 'SPEED', 'CONSISTENCY', 'ACCURACY', 'FLUENCY'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid leaderboard type' },
        { status: 400 }
      );
    }

    // Build scope string based on parameters
    let scopeString = scope;

    if (scope === 'class') {
      const classId = searchParams.get('classId');
      if (!classId) {
        return NextResponse.json(
          { error: 'classId required for class scope' },
          { status: 400 }
        );
      }
      scopeString = `class_${classId}`;
    } else if (scope === 'school') {
      const schoolId = searchParams.get('schoolId');
      if (!schoolId) {
        return NextResponse.json(
          { error: 'schoolId required for school scope' },
          { status: 400 }
        );
      }
      scopeString = `school_${schoolId}`;
    }

    // Get current user
    const session = await getSession();
    const currentUserId = session?.id;

    // Get leaderboard data
    const leaderboard = await getLeaderboard(
      type,
      scopeString,
      currentUserId,
      limit
    );

    // Set cache headers (1 hour)
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    };

    return NextResponse.json(leaderboard, { headers });
  } catch (error) {
    console.error('[Leaderboard API Error]', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
