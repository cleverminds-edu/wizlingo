import { NextRequest, NextResponse } from 'next/server';
import { getReferralStats, getReferralCount } from '@/lib/referral-service';

/**
 * GET /api/referrals/stats?studentId=<id>
 * Get referral stats for a student
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const studentId = url.searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId required' },
        { status: 400 }
      );
    }

    const stats = await getReferralStats(studentId);
    const count = await getReferralCount(studentId);

    return NextResponse.json({
      studentId,
      referralCount: count,
      rewardsEarned: stats.rewardsEarned,
    });
  } catch (error) {
    console.error('Error getting referral stats:', error);
    return NextResponse.json(
      { error: 'Failed to get referral stats' },
      { status: 500 }
    );
  }
}
