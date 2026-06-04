import { NextRequest, NextResponse } from 'next/server';
import {
  getFunnelStats,
  getFunnelStatsByBadge,
  getFunnelStatsBySchool,
  getReferralSuccessStats,
  getDropOffAnalysis,
} from '@/lib/conversion-funnel';

/**
 * GET /api/analytics/funnel
 * Get overall conversion funnel stats
 *
 * Query params:
 * - startDate: ISO date string
 * - endDate: ISO date string
 * - groupBy: 'badge' | 'school'
 * - groupId: badge type or school ID
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const startDateStr = url.searchParams.get('startDate');
    const endDateStr = url.searchParams.get('endDate');
    const groupBy = url.searchParams.get('groupBy');
    const groupId = url.searchParams.get('groupId');

    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    let funnelStats;
    let referralStats;
    let dropOffAnalysis;

    if (groupBy === 'badge' && groupId) {
      funnelStats = await getFunnelStatsByBadge(groupId, startDate, endDate);
    } else if (groupBy === 'school' && groupId) {
      funnelStats = await getFunnelStatsBySchool(groupId, startDate, endDate);
    } else {
      funnelStats = await getFunnelStats(startDate, endDate);
      referralStats = await getReferralSuccessStats();
      dropOffAnalysis = await getDropOffAnalysis(startDate, endDate);
    }

    return NextResponse.json({
      funnel: funnelStats,
      referrals: referralStats,
      dropoff: dropOffAnalysis,
      dateRange: {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching funnel analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch funnel analytics' },
      { status: 500 }
    );
  }
}
