/**
 * Badge Analytics Tracking
 * Tracks badge-related events for analysis and monitoring
 */

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
 * Track a badge-related event
 * Non-blocking async function - does not throw errors
 */
export async function trackBadgeEvent(
  eventName: string,
  data: {
    badgeType?: BadgeType;
    studentId?: string;
    studentName?: string;
    platform?: string;
    progress?: number;
    accuracy?: number;
    fluency?: number;
    sessionCount?: number;
    metadata?: Record<string, any>;
  }
): Promise<void> {
  try {
    const event: BadgeAnalyticsEvent = {
      event: eventName,
      timestamp: new Date().toISOString(),
      ...data,
    };

    // Send analytics event to backend
    const response = await fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      console.warn(
        `Analytics event failed: ${eventName} (${response.status})`
      );
    }
  } catch (error) {
    // Silently fail - analytics should not impact user experience
    console.warn(`Analytics tracking error for ${eventName}:`, error);
  }
}

/**
 * Track badge earned event
 */
export async function trackBadgeEarned(
  badgeType: BadgeType,
  studentId?: string,
  studentName?: string
): Promise<void> {
  return trackBadgeEvent('badge_earned', {
    badgeType,
    studentId,
    studentName,
  });
}

/**
 * Track share action
 */
export async function trackBadgeShared(
  badgeType: BadgeType,
  platform: 'whatsapp' | 'clipboard' | 'native',
  studentId?: string
): Promise<void> {
  return trackBadgeEvent('share_badge', {
    badgeType,
    studentId,
    platform,
  });
}

/**
 * Track progress milestone (25%, 50%, 75%)
 */
export async function trackProgressMilestone(
  badgeType: BadgeType,
  milestone: number,
  studentId?: string
): Promise<void> {
  return trackBadgeEvent('progress_milestone', {
    badgeType,
    studentId,
    progress: milestone,
  });
}

/**
 * Track color variant unlock
 */
export async function trackColorVariantUnlock(
  badgeType: BadgeType,
  variant: string,
  studentId?: string
): Promise<void> {
  return trackBadgeEvent('color_variant_unlocked', {
    badgeType,
    studentId,
    metadata: { variant },
  });
}
