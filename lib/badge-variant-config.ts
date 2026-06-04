/**
 * Badge A/B Testing Configuration
 * Manages badge style variants for A/B testing and user preferences
 */

import { BadgeType } from '@/app/generated/prisma/client';

export type BadgeVariant = 'current' | 'style_a' | 'style_b';

export const BADGE_VARIANTS: Record<BadgeVariant, string> = {
  current: '/badges/', // Original hexagon-shield style
  style_a: '/badges-style-a/', // Game collectible (anime-inspired)
  style_b: '/badges-style-b/', // Minimalist modern (Apple-like)
};

/**
 * Get the badge image path for a specific type and variant
 */
export function getBadgeImagePath(
  badgeType: BadgeType,
  variant?: BadgeVariant
): string {
  const v = variant || getRandomVariant();
  const basePath = BADGE_VARIANTS[v];
  const fileName = getBadgeFileName(badgeType);
  return `${basePath}${fileName}`;
}

/**
 * Get the badge file name for a given badge type
 */
function getBadgeFileName(badgeType: BadgeType): string {
  const fileMap: Record<BadgeType, string> = {
    SPARK: 'spark-badge.svg',
    WORD_WIZARD: 'word-wizard-badge.svg',
    VOICE_WIZARD: 'voice-wizard-badge.svg',
    LANGUAGE_WIZARD: 'language-wizard-badge.svg',
    GRAND_WIZARD: 'grand-wizard-badge.svg',
  };
  return fileMap[badgeType];
}

/**
 * Get or create user's assigned variant (50/50 split: current vs style_a)
 * This creates a consistent experience for the user across sessions
 */
export function getUserBadgeVariant(studentId?: string): BadgeVariant {
  if (typeof window === 'undefined') {
    return 'current'; // Default on server
  }

  const storageKey = `badge-variant-${studentId || 'default'}`;

  // Check if user already has an assigned variant
  const stored = localStorage.getItem(storageKey);
  if (stored && (stored === 'current' || stored === 'style_a' || stored === 'style_b')) {
    return stored as BadgeVariant;
  }

  // Assign new variant (50% current, 50% style_a for A/B testing)
  const variant = Math.random() < 0.5 ? 'current' : 'style_a';
  localStorage.setItem(storageKey, variant);
  return variant;
}

/**
 * Get a random variant (for testing or override)
 */
export function getRandomVariant(): BadgeVariant {
  const rand = Math.random();
  if (rand < 0.333) return 'current';
  if (rand < 0.666) return 'style_a';
  return 'style_b';
}

/**
 * Force set a user's badge variant (for testing or admin purposes)
 */
export function setUserBadgeVariant(variant: BadgeVariant, studentId?: string): void {
  if (typeof window === 'undefined') return;

  const storageKey = `badge-variant-${studentId || 'default'}`;
  localStorage.setItem(storageKey, variant);
}

/**
 * Clear all variant assignments (for testing)
 */
export function clearBadgeVariants(): void {
  if (typeof window === 'undefined') return;

  const keys = Object.keys(localStorage).filter((k) =>
    k.startsWith('badge-variant-')
  );
  keys.forEach((k) => localStorage.removeItem(k));
}
