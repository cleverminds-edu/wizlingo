/**
 * Badge A/B Test Debug Utilities
 * Helpers for testing and debugging the badge variant system locally
 */

import {
  setUserBadgeVariant,
  clearBadgeVariants,
  type BadgeVariant,
} from '@/lib/badge-variant-config';

/**
 * Force a specific variant for testing
 * Usage: window.__DEBUG_BADGE_VARIANT('style_a', 'student-123')
 */
export function debugSetVariant(
  variant: BadgeVariant,
  studentId?: string
): void {
  setUserBadgeVariant(variant, studentId);
  console.log(
    `[BADGE-DEBUG] Set variant to ${variant} for ${studentId || 'default'}`
  );

  // Refresh page to apply changes
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
}

/**
 * Clear all variant assignments
 * Usage: window.__DEBUG_CLEAR_VARIANTS()
 */
export function debugClearVariants(): void {
  clearBadgeVariants();
  console.log('[BADGE-DEBUG] Cleared all badge variant assignments');

  // Refresh page
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
}

/**
 * Get all stored variant assignments
 * Usage: window.__DEBUG_GET_VARIANTS()
 */
export function debugGetVariants(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {};
  }

  const variants: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('badge-variant-')) {
      variants[key] = localStorage.getItem(key) || '';
    }
  }

  console.table(variants);
  return variants;
}

/**
 * Simulate variant logging
 * Usage: window.__DEBUG_SIMULATE_SHARE('student-123', 'SPARK', 'style_a', 'whatsapp')
 */
export async function debugSimulateShare(
  studentId: string,
  badgeType: string,
  variant: BadgeVariant,
  platform: 'whatsapp' | 'clipboard' | 'native'
): Promise<void> {
  try {
    const response = await fetch('/api/badges/variant-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId,
        badgeType,
        variant,
        action: 'shared',
        platform,
        metadata: {
          debug: true,
          timestamp: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to log share: ${response.statusText}`);
    }

    console.log(
      `[BADGE-DEBUG] Logged share: ${badgeType} ${variant} via ${platform}`
    );
  } catch (error) {
    console.error('[BADGE-DEBUG] Error logging share:', error);
  }
}

/**
 * Simulate variant view
 * Usage: window.__DEBUG_SIMULATE_VIEW('student-123', 'SPARK', 'style_a')
 */
export async function debugSimulateView(
  studentId: string,
  badgeType: string,
  variant: BadgeVariant
): Promise<void> {
  try {
    const response = await fetch('/api/badges/variant-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId,
        badgeType,
        variant,
        action: 'viewed',
        metadata: {
          debug: true,
          timestamp: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to log view: ${response.statusText}`);
    }

    console.log(`[BADGE-DEBUG] Logged view: ${badgeType} ${variant}`);
  } catch (error) {
    console.error('[BADGE-DEBUG] Error logging view:', error);
  }
}

/**
 * Initialize debug commands on window object
 * Call this in development to expose debug functions
 */
export function initBadgeDebug(): void {
  if (typeof window !== 'undefined') {
    (window as any).__DEBUG_BADGE_VARIANT = debugSetVariant;
    (window as any).__DEBUG_CLEAR_VARIANTS = debugClearVariants;
    (window as any).__DEBUG_GET_VARIANTS = debugGetVariants;
    (window as any).__DEBUG_SIMULATE_SHARE = debugSimulateShare;
    (window as any).__DEBUG_SIMULATE_VIEW = debugSimulateView;

    console.log(
      '[BADGE-DEBUG] Available debug commands:'
    );
    console.log(
      '  __DEBUG_BADGE_VARIANT(variant, studentId) - Set variant for testing'
    );
    console.log(
      '  __DEBUG_CLEAR_VARIANTS() - Clear all variant assignments'
    );
    console.log(
      '  __DEBUG_GET_VARIANTS() - Show all stored variants'
    );
    console.log(
      '  __DEBUG_SIMULATE_SHARE(studentId, badgeType, variant, platform) - Simulate share'
    );
    console.log(
      '  __DEBUG_SIMULATE_VIEW(studentId, badgeType, variant) - Simulate view'
    );
  }
}
