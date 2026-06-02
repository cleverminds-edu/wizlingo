import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { BadgeType } from '@/app/generated/prisma/client';

export interface BadgeAnalyticsEvent {
  event: string;
  badgeType?: BadgeType;
  studentId?: string;
  studentName?: string;
  platform?: string;
  progress?: number;
  accuracy?: number;
  fluency?: number;
  sessionCount?: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * POST /api/analytics
 * Logs badge analytics events
 * Does not require authentication - analytics should be collected even for anonymous users
 */
export async function POST(request: NextRequest) {
  try {
    const event: BadgeAnalyticsEvent = await request.json();

    // Validate required fields
    if (!event.event || !event.timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields: event, timestamp' },
        { status: 400 }
      );
    }

    // Store event data (can be used for later analysis)
    // This is a simple logging implementation
    // In production, you might want to use a dedicated analytics service
    console.log('[ANALYTICS]', {
      timestamp: event.timestamp,
      event: event.event,
      badgeType: event.badgeType,
      studentId: event.studentId,
      studentName: event.studentName,
      platform: event.platform,
      progress: event.progress,
      metadata: event.metadata,
    });

    // Optionally, track specific events in the database
    // For example, track badge shares for metrics
    if (event.event === 'badge_earned' && event.badgeType) {
      // You could store this in a separate BadgeEvent table if needed
      console.log(`[BADGE_EARNED] ${event.studentName || event.studentId} earned ${event.badgeType}`);
    }

    if (event.event === 'share_badge' && event.badgeType) {
      console.log(
        `[BADGE_SHARED] ${event.studentId} shared ${event.badgeType} on ${event.platform}`
      );
    }

    if (event.event === 'progress_milestone' && event.badgeType) {
      console.log(
        `[PROGRESS_MILESTONE] ${event.studentId} reached ${event.progress}% on ${event.badgeType}`
      );
    }

    return NextResponse.json(
      { success: true, message: 'Event logged successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('[ANALYTICS_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to log analytics event' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Analytics API is running',
  });
}
