import { NextRequest, NextResponse } from 'next/server';

/**
 * Vercel Cron Job: Nightly Leaderboard Update
 *
 * Runs every night at 11 PM UTC (0 23 * * *)
 * Updates all leaderboard rankings for the school
 *
 * Requires:
 * - CRON_SECRET environment variable set in Vercel
 * - vercel.json with cron schedule configured
 *
 * Security:
 * - Only accepts requests from Vercel (checks authorization header)
 * - Can only be triggered by Vercel cron or with CRON_SECRET token
 */

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Verify request is from Vercel
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('❌ CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Cron secret not configured' },
        { status: 500 }
      );
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('⚠️ Unauthorized cron request (missing authorization header)');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix
    if (token !== cronSecret) {
      console.warn('⚠️ Unauthorized cron request (invalid token)');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if leaderboard updates are enabled
    if (process.env.LEADERBOARD_UPDATE_ENABLED !== 'true') {
      console.log('⏭️ Leaderboard updates disabled (LEADERBOARD_UPDATE_ENABLED=false)');
      return NextResponse.json({
        success: false,
        message: 'Leaderboard updates are disabled',
      });
    }

    // Import and run the leaderboard update service
    console.log(`[${new Date().toISOString()}] Starting nightly leaderboard update...`);

    const { updateLeaderboards } = await import('@/lib/leaderboard-service');

    const startTime = Date.now();
    const result = await updateLeaderboards();
    const duration = Date.now() - startTime;

    console.log(`[${new Date().toISOString()}] Leaderboard update completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: 'Leaderboard update completed',
      timestamp: new Date().toISOString(),
      durationMs: duration,
      result,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      `[${new Date().toISOString()}] ❌ Leaderboard update failed:`,
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: 'Leaderboard update failed',
        message: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * HEAD request handler (Vercel sometimes sends HEAD requests to check endpoint)
 */
export async function HEAD(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
