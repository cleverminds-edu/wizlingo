'use client';

import { useMemo } from 'react';
import type { BadgeType } from '@/app/generated/prisma/client';
import { BADGE_MESSAGES } from '@/lib/badge-messages';

/**
 * Hook to get dynamic badge messages with personalization
 * Handles message substitution for student name and stats
 */
export interface UseBadgeMessagesReturn {
  congratulations: string;
  narrative: string;
  shareTemplate: string;
  progress: (current: number) => string;
  locked: string;
}

/**
 * Replaces template variables in message strings
 * Supported variables: {StudentName}, {Accuracy}, {Fluency}, {SessionCount}, {BadgeCount}
 */
function substituteMessageVariables(
  message: string,
  studentName?: string,
  stats?: {
    accuracy?: number;
    fluency?: number;
    sessionCount?: number;
    badgeCount?: number;
  }
): string {
  let result = message;

  if (studentName) {
    result = result.replace(/{StudentName}/g, studentName);
  }

  if (stats?.accuracy !== undefined) {
    result = result.replace(/{Accuracy}/g, Math.round(stats.accuracy).toString());
  }

  if (stats?.fluency !== undefined) {
    result = result.replace(/{Fluency}/g, Math.round(stats.fluency).toString());
  }

  if (stats?.sessionCount !== undefined) {
    result = result.replace(/{SessionCount}/g, stats.sessionCount.toString());
  }

  if (stats?.badgeCount !== undefined) {
    result = result.replace(/{BadgeCount}/g, stats.badgeCount.toString());
  }

  return result;
}

export function useBadgeMessages(
  badgeType: BadgeType,
  studentName?: string,
  stats?: {
    accuracy?: number;
    fluency?: number;
    sessionCount?: number;
    badgeCount?: number;
  }
): UseBadgeMessagesReturn {
  return useMemo(() => {
    const messages = BADGE_MESSAGES[badgeType];

    return {
      congratulations: substituteMessageVariables(
        messages.congratulations,
        studentName,
        stats
      ),
      narrative: substituteMessageVariables(
        messages.narrative,
        studentName,
        stats
      ),
      shareTemplate: substituteMessageVariables(
        messages.shareTemplate,
        studentName,
        stats
      ),
      locked: substituteMessageVariables(messages.locked, studentName, stats),
      progress: (current: number) =>
        substituteMessageVariables(messages.inProgress(current), studentName, stats),
    };
  }, [badgeType, studentName, stats]);
}
