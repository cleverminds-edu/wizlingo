import { NextRequest, NextResponse } from 'next/server';
import { saveLeaderboardSnapshot } from '@/lib/school-analytics';

/**
 * POST /api/cron/school-leaderboards
 *
 * Triggered by cron job to save monthly leaderboard snapshots
 * This should be called once a day or once a month to track historical rankings
 */
export async function POST(request: NextRequest) {
  try {
    // Verify this is from a trusted cron service
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET;

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Save leaderboard snapshots
    await saveLeaderboardSnapshot();

    return NextResponse.json({
      success: true,
      message: 'Leaderboard snapshots saved successfully',
    });
  } catch (error) {
    console.error('[School Leaderboard Cron Error]', error);
    return NextResponse.json(
      { error: 'Failed to save leaderboard snapshots' },
      { status: 500 }
    );
  }
}
