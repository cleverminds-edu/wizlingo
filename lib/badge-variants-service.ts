/**
 * Badge Variants Service
 * Client-side service for tracking badge variant interactions
 */

import { BadgeType } from '@/app/generated/prisma/client';
import type { BadgeVariant } from '@/lib/badge-variant-config';

interface VariantLogEvent {
  studentId: string;
  badgeType: BadgeType;
  variant: BadgeVariant;
  action: 'viewed' | 'shared';
  platform?: 'whatsapp' | 'clipboard' | 'native';
  metadata?: Record<string, any>;
}

/**
 * Log a badge variant event
 * Non-blocking async function - does not throw errors
 */
export async function logBadgeVariantEvent(
  event: VariantLogEvent
): Promise<void> {
  try {
    const response = await fetch('/api/badges/variant-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      console.warn(
        `[BadgeVariant] Logging failed: ${event.action} (${response.status})`
      );
    }
  } catch (error) {
    // Silently fail - analytics should not impact user experience
    console.warn(
      `[BadgeVariant] Tracking error for ${event.action}:`,
      error
    );
  }
}

/**
 * Log badge variant viewed event
 */
export async function logBadgeVariantViewed(
  studentId: string,
  badgeType: BadgeType,
  variant: BadgeVariant
): Promise<void> {
  return logBadgeVariantEvent({
    studentId,
    badgeType,
    variant,
    action: 'viewed',
  });
}

/**
 * Log badge variant shared event
 */
export async function logBadgeVariantShared(
  studentId: string,
  badgeType: BadgeType,
  variant: BadgeVariant,
  platform: 'whatsapp' | 'clipboard' | 'native'
): Promise<void> {
  return logBadgeVariantEvent({
    studentId,
    badgeType,
    variant,
    action: 'shared',
    platform,
    metadata: {
      timestamp: new Date().toISOString(),
    },
  });
}
