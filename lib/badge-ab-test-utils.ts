/**
 * A/B Test Utilities for Badge Variants
 * Helper functions for displaying and analyzing badge variants
 */

import { BadgeType } from '@/app/generated/prisma/client';

export interface BadgeVariantMetrics {
  variant: string;
  displayName: string;
  description: string;
  style: string;
  viewCount: number;
  shareCount: number;
  shareRate: number;
  ctr: number;
  recommendation?: string;
}

/**
 * Get variant display information
 */
export function getVariantDisplayInfo(variant: 'current' | 'style_a' | 'style_b') {
  const info: Record<string, { name: string; description: string; style: string }> = {
    current: {
      name: 'Current (Hexagon Shield)',
      description: 'Original professional hexagon-shield badge design',
      style: 'Classic, professional, gradient-based',
    },
    style_a: {
      name: 'Style A (Game Collectible)',
      description: 'Anime-inspired cute characters with glowing effects',
      style: 'Playful, collectible, character-focused',
    },
    style_b: {
      name: 'Style B (Minimalist Modern)',
      description: 'Clean, bold circles with simple icons (Apple-like)',
      style: 'Minimal, modern, icon-focused',
    },
  };

  return info[variant] || info.current;
}

/**
 * Compare share rates and determine winner
 */
export function determineVariantWinner(
  metrics: BadgeVariantMetrics[]
): {
  winner: string;
  confidence: 'high' | 'medium' | 'low';
  insight: string;
} {
  if (metrics.length === 0) {
    return {
      winner: 'insufficient_data',
      confidence: 'low',
      insight: 'Not enough data to determine winner',
    };
  }

  const bestMetrics = metrics.reduce((prev, current) =>
    current.shareRate > prev.shareRate ? current : prev
  );

  const secondBest = metrics
    .filter((m) => m.variant !== bestMetrics.variant)
    .reduce((prev, current) =>
      current.shareRate > prev.shareRate ? current : prev
    );

  const improvement =
    ((bestMetrics.shareRate - secondBest.shareRate) /
      secondBest.shareRate) *
    100;

  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (improvement > 30) confidence = 'high';
  else if (improvement > 10) confidence = 'medium';
  else confidence = 'low';

  const insight =
    improvement > 20
      ? `${bestMetrics.variant} shows ${improvement.toFixed(1)}% higher share rate`
      : improvement > 0
        ? `${bestMetrics.variant} slightly outperforms others`
        : 'Variants perform similarly';

  return {
    winner: bestMetrics.variant,
    confidence,
    insight,
  };
}

/**
 * Calculate statistical significance
 * Simple Chi-square test for A/B test
 */
export function calculateSignificance(
  variant1: { shares: number; views: number },
  variant2: { shares: number; views: number }
): {
  isSignificant: boolean;
  pValue: number;
  confidence: number;
} {
  // Simple contingency calculation
  const total = variant1.views + variant2.views;
  if (variant1.views === 0 || variant2.views === 0) {
    return {
      isSignificant: false,
      pValue: 1,
      confidence: 0,
    };
  }

  const variant1Rate = variant1.shares / variant1.views;
  const variant2Rate = variant2.shares / variant2.views;
  const pooledRate = (variant1.shares + variant2.shares) / total;

  const chi2 =
    Math.pow(variant1.shares - variant1.views * pooledRate, 2) /
      (variant1.views * pooledRate) +
    Math.pow(variant2.shares - variant2.views * pooledRate, 2) /
      (variant2.views * pooledRate);

  // Approximate p-value (simplified)
  const isSignificant = chi2 > 3.841; // 95% confidence threshold
  const pValue = isSignificant ? 0.05 : 0.2;

  return {
    isSignificant,
    pValue,
    confidence: isSignificant ? 95 : 50,
  };
}

/**
 * Get badge variant recommendation based on metrics
 */
export function getVariantRecommendation(
  metrics: BadgeVariantMetrics[]
): string {
  const winner = determineVariantWinner(metrics);

  if (winner.confidence === 'high') {
    return `Recommend ${winner.winner}: ${winner.insight}`;
  } else if (winner.confidence === 'medium') {
    return `Consider ${winner.winner}, but needs more data`;
  } else {
    return 'Run test longer to determine clear winner';
  }
}

/**
 * Format metrics for display
 */
export function formatMetricsForDisplay(
  metrics: BadgeVariantMetrics[]
): BadgeVariantMetrics[] {
  return metrics.map((m) => ({
    ...m,
    displayName: getVariantDisplayInfo(m.variant as any).name,
    shareRate: parseFloat(m.shareRate.toFixed(2)),
    ctr: parseFloat(m.ctr.toFixed(2)),
  }));
}

/**
 * Get variant colors for charts
 */
export function getVariantColors(): Record<string, string> {
  return {
    current: '#F97316',
    style_a: '#9333EA',
    style_b: '#3B82F6',
  };
}
