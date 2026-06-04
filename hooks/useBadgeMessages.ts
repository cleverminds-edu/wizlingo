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
 * Supported variables: {StudentName}, {Accuracy}, {Fluency}, {SessionCount}, {BadgeCount}, {SchoolName}, {Grade}, {Section}, {Stat}, {appUrl}
 */
interface SubstitutionContext {
  studentName?: string;
  schoolName?: string;
  grade?: number;
  section?: string;
  stat?: string;
  appUrl?: string;
  stats?: {
    accuracy?: number;
    fluency?: number;
    sessionCount?: number;
    badgeCount?: number;
  };
}

function substituteMessageVariables(
  message: string,
  context: SubstitutionContext
): string {
  let result = message;

  if (context.studentName) {
    result = result.replace(/{StudentName}/g, context.studentName);
    result = result.replace(/{studentName}/g, context.studentName);
  }

  if (context.schoolName) {
    result = result.replace(/{SchoolName}/g, context.schoolName);
    result = result.replace(/{schoolName}/g, context.schoolName);
  }

  if (context.grade !== undefined) {
    result = result.replace(/{Grade}/g, context.grade.toString());
    result = result.replace(/{grade}/g, context.grade.toString());
  }

  if (context.section) {
    result = result.replace(/{Section}/g, context.section);
    result = result.replace(/{section}/g, context.section);
  }

  if (context.stat) {
    result = result.replace(/{Stat}/g, context.stat);
    result = result.replace(/{stat}/g, context.stat);
  }

  if (context.appUrl) {
    result = result.replace(/{appUrl}/g, context.appUrl);
    result = result.replace(/\[LINK\]/g, context.appUrl);
  }

  const stats = context.stats;
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
  },
  extras?: {
    schoolName?: string;
    grade?: number;
    section?: string;
    appUrl?: string;
  }
): UseBadgeMessagesReturn {
  return useMemo(() => {
    const messages = BADGE_MESSAGES[badgeType];

    const context: SubstitutionContext = {
      studentName,
      schoolName: extras?.schoolName,
      grade: extras?.grade,
      section: extras?.section,
      appUrl: extras?.appUrl,
      stats,
    };

    return {
      congratulations: substituteMessageVariables(
        messages.congratulations,
        context
      ),
      narrative: substituteMessageVariables(
        messages.narrative,
        context
      ),
      shareTemplate: substituteMessageVariables(
        messages.shareTemplate,
        context
      ),
      locked: substituteMessageVariables(messages.locked, context),
      progress: (current: number) =>
        substituteMessageVariables(messages.inProgress(current), context),
    };
  }, [badgeType, studentName, stats, extras?.schoolName, extras?.grade, extras?.section, extras?.appUrl]);
}
