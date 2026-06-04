/**
 * API Route: GET /api/admin/badge-ab-test
 * Returns A/B test statistics for badge variants
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

/**
 * GET /api/admin/badge-ab-test
 * Returns comprehensive A/B test metrics
 */
export async function GET(request: NextRequest) {
  try {
    const range = request.nextUrl.searchParams.get('range') || '7d';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case '1d':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate = new Date('2000-01-01'); // All time
    }

    // Fetch all variant logs in date range
    const logs = await prisma.badgeVariantLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: now,
        },
      },
      select: {
        variant: true,
        action: true,
        badgeType: true,
        platform: true,
      },
    });

    // Calculate variant statistics
    const variantStats = {
      current: { views: 0, shares: 0 },
      style_a: { views: 0, shares: 0 },
      style_b: { views: 0, shares: 0 },
    };

    const badgeTypeViews: Record<string, Record<string, number>> = {};
    const platformShares: Record<string, Record<string, number>> = {
      whatsapp: { current: 0, style_a: 0, style_b: 0 },
      clipboard: { current: 0, style_a: 0, style_b: 0 },
      native: { current: 0, style_a: 0, style_b: 0 },
    };

    // Process logs
    logs.forEach((log) => {
      const variant = log.variant as
        | 'current'
        | 'style_a'
        | 'style_b';

      // Count views and shares
      if (log.action === 'viewed') {
        variantStats[variant].views += 1;

        // Track by badge type
        if (!badgeTypeViews[log.badgeType]) {
          badgeTypeViews[log.badgeType] = {
            current: 0,
            style_a: 0,
            style_b: 0,
          };
        }
        badgeTypeViews[log.badgeType][variant] += 1;
      } else if (log.action === 'shared') {
        variantStats[variant].shares += 1;

        // Track by platform
        if (log.platform && platformShares[log.platform]) {
          platformShares[log.platform][variant] += 1;
        }
      }
    });

    // Calculate share rates and CTR
    const variantStatsSummary = [
      {
        variant: 'Current (Hexagon)',
        views: variantStats.current.views,
        shares: variantStats.current.shares,
        shareRate:
          variantStats.current.views > 0
            ? (variantStats.current.shares /
                variantStats.current.views) *
              100
            : 0,
        ctr:
          variantStats.current.views > 0
            ? (variantStats.current.shares /
                variantStats.current.views) *
              100
            : 0,
      },
      {
        variant: 'Style A (Collectible)',
        views: variantStats.style_a.views,
        shares: variantStats.style_a.shares,
        shareRate:
          variantStats.style_a.views > 0
            ? (variantStats.style_a.shares /
                variantStats.style_a.views) *
              100
            : 0,
        ctr:
          variantStats.style_a.views > 0
            ? (variantStats.style_a.shares /
                variantStats.style_a.views) *
              100
            : 0,
      },
      {
        variant: 'Style B (Minimalist)',
        views: variantStats.style_b.views,
        shares: variantStats.style_b.shares,
        shareRate:
          variantStats.style_b.views > 0
            ? (variantStats.style_b.shares /
                variantStats.style_b.views) *
              100
            : 0,
        ctr:
          variantStats.style_b.views > 0
            ? (variantStats.style_b.shares /
                variantStats.style_b.views) *
              100
            : 0,
      },
    ];

    // Format badge data for chart
    const badgeData = Object.entries(badgeTypeViews).map(
      ([badgeType, variants]) => ({
        badgeType,
        current: variants.current || 0,
        style_a: variants.style_a || 0,
        style_b: variants.style_b || 0,
        totalViews: (variants.current || 0) +
          (variants.style_a || 0) +
          (variants.style_b || 0),
      })
    );

    // Format platform data for chart
    const platformData = Object.entries(platformShares)
      .filter(([_, shares]) => Object.values(shares).some((v) => v > 0))
      .map(([platform, shares]) => ({
        platform:
          platform === 'whatsapp'
            ? 'WhatsApp'
            : platform === 'clipboard'
              ? 'Copy to Clipboard'
              : 'Native Share',
        current: shares.current,
        style_a: shares.style_a,
        style_b: shares.style_b,
      }));

    return NextResponse.json(
      {
        variantStats: variantStatsSummary,
        badgeData,
        platformData,
        dateRange: range,
        totalLogs: logs.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[BadgeABTest] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch A/B test data' },
      { status: 500 }
    );
  }
}
