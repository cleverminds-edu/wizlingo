/**
 * Badge Color Variants System
 * Manages unlockable color variants for badges
 * Creates progression: share 3 times → unlock gold variant
 *                      refer 2 friends → unlock rainbow variant
 *                      10 total shares → unlock glow variant
 */

import { BadgeType } from '@/app/generated/prisma/client';

export type ColorVariant = 'default' | 'gold' | 'rainbow' | 'glow' | 'shadow';

export interface ColorVariantRequirement {
  id: string;
  name: string;
  description: string;
  condition: 'shares' | 'referrals' | 'sessions';
  threshold: number;
  variant: ColorVariant;
  icon: string;
}

export const COLOR_VARIANT_REQUIREMENTS: ColorVariantRequirement[] = [
  {
    id: 'gold-unlock',
    name: 'Golden Edition',
    description: 'Share this badge 3 times',
    condition: 'shares',
    threshold: 3,
    variant: 'gold',
    icon: '⭐',
  },
  {
    id: 'rainbow-unlock',
    name: 'Rainbow Edition',
    description: 'Refer 2 friends to WizLingo',
    condition: 'referrals',
    threshold: 2,
    variant: 'rainbow',
    icon: '🌈',
  },
  {
    id: 'glow-unlock',
    name: 'Glowing Edition',
    description: 'Get 10 shares across all badges',
    condition: 'shares',
    threshold: 10,
    variant: 'glow',
    icon: '✨',
  },
  {
    id: 'shadow-unlock',
    name: 'Shadow Edition',
    description: 'Earn all 5 badges',
    condition: 'sessions',
    threshold: 999, // Placeholder for "all badges"
    variant: 'shadow',
    icon: '🌑',
  },
];

/**
 * Get color variants unlocked for a specific student and badge
 */
export async function getUnlockedColorVariants(
  studentId: string,
  badgeType: BadgeType
): Promise<ColorVariant[]> {
  try {
    // This would query the database for unlocked variants
    // For now, return default + any unlocked variants
    const variants: ColorVariant[] = ['default'];

    // In a real implementation:
    // const unlockedVariants = await prisma.badgeColorVariant.findMany({
    //   where: { studentId, badgeType },
    //   select: { colorVariant: true },
    // });
    // variants.push(...unlockedVariants.map(v => v.colorVariant as ColorVariant));

    return variants;
  } catch (error) {
    console.error('Error getting color variants:', error);
    return ['default'];
  }
}

/**
 * Check if a color variant is unlocked
 */
export async function isColorVariantUnlocked(
  studentId: string,
  badgeType: BadgeType,
  variant: ColorVariant
): Promise<boolean> {
  if (variant === 'default') return true; // Always unlocked

  const unlocked = await getUnlockedColorVariants(studentId, badgeType);
  return unlocked.includes(variant);
}

/**
 * Unlock a color variant for a student (called when conditions are met)
 */
export async function unlockColorVariant(
  studentId: string,
  badgeType: BadgeType,
  variant: ColorVariant,
  unlockedBy: string
): Promise<void> {
  try {
    // This would save to database:
    // await prisma.badgeColorVariant.create({
    //   data: {
    //     studentId,
    //     badgeType,
    //     colorVariant: variant,
    //     unlockedBy,
    //   },
    // });

    console.log(
      `[BadgeColorVariant] Unlocked ${variant} for ${badgeType} of ${studentId}`
    );
  } catch (error) {
    console.error('Error unlocking color variant:', error);
  }
}

/**
 * Get progress toward unlocking a color variant
 */
export async function getVariantUnlockProgress(
  studentId: string,
  badgeType: BadgeType,
  variant: ColorVariant
): Promise<{
  variant: ColorVariant;
  requirement: ColorVariantRequirement | null;
  progress: number;
  threshold: number;
  isUnlocked: boolean;
}> {
  const requirement = COLOR_VARIANT_REQUIREMENTS.find(
    (r) => r.variant === variant
  );
  const isUnlocked = await isColorVariantUnlocked(
    studentId,
    badgeType,
    variant
  );

  if (!requirement) {
    return {
      variant,
      requirement: null,
      progress: 0,
      threshold: 0,
      isUnlocked: false,
    };
  }

  // In a real implementation, calculate progress based on:
  // - student's share count
  // - student's referral count
  // - etc.

  return {
    variant,
    requirement,
    progress: 0,
    threshold: requirement.threshold,
    isUnlocked,
  };
}

/**
 * Get SVG path override for a color variant
 * Returns CSS class or style override for themed badge
 */
export function getColorVariantStyles(
  variant: ColorVariant
): Record<string, string> {
  const baseStyles: Record<ColorVariant, Record<string, string>> = {
    default: {},
    gold: {
      filter: 'drop-shadow(0 0 10px #FFD700)',
      '--badge-glow': '#FFD700',
    },
    rainbow: {
      animation: 'rainbowShift 3s infinite',
      '--badge-primary': '#FF6B6B',
    },
    glow: {
      animation: 'badgeGlow 2s ease-in-out infinite',
      '--badge-glow': '#C084FC',
    },
    shadow: {
      filter: 'drop-shadow(0 0 15px #000000) saturate(0.8)',
      '--badge-glow': '#1F2937',
    },
  };

  return baseStyles[variant] || baseStyles.default;
}
