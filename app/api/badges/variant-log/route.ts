/**
 * API Route: POST /api/badges/variant-log
 * Logs badge variant views and share events for A/B testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BadgeType } from '@/app/generated/prisma/client';

export const runtime = 'nodejs';

interface BadgeVariantLogRequest {
  studentId: string;
  badgeType: BadgeType;
  variant: 'current' | 'style_a' | 'style_b';
  action: 'viewed' | 'shared';
  platform?: 'whatsapp' | 'clipboard' | 'native';
  metadata?: Record<string, any>;
}

/**
 * POST /api/badges/variant-log
 * Log badge variant events for A/B testing analytics
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BadgeVariantLogRequest;
    const {
      studentId,
      badgeType,
      variant,
      action,
      platform,
      metadata,
    } = body;

    // Validate required fields
    if (!studentId || !badgeType || !variant || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create variant log entry in database
    const log = await prisma.badgeVariantLog.create({
      data: {
        studentId,
        badgeType: badgeType as BadgeType,
        variant: variant as 'current' | 'style_a' | 'style_b',
        action: action as 'viewed' | 'shared',
        platform: platform as 'whatsapp' | 'clipboard' | 'native' | null,
        metadata: metadata || {},
      },
    });

    return NextResponse.json(
      { success: true, logId: log.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('[BadgeVariantLog] Error:', error);
    return NextResponse.json(
      { error: 'Failed to log badge variant event' },
      { status: 500 }
    );
  }
}
