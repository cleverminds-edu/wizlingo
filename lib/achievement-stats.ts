// Server-side achievement stats calculation
import { prisma } from "@/lib/prisma";
import { BadgeType } from "@/app/generated/prisma/client";

export interface AchievementStats {
  totalBadgesEarned: number;
  daysSinceFirstBadge: number;
  avgDaysPerBadge: number;
  currentStreak: number;
  nextBadgeEta?: number;
  badgesEarned: Array<{
    type: BadgeType;
    earnedAt: Date;
  }>;
  accuracyTrend?: {
    improving: boolean;
    avgAccuracy: number;
  };
  fluencyTrend?: {
    improving: boolean;
    avgFluency: number;
  };
  loading: boolean;
  error?: string;
}

/**
 * Server-side function to calculate achievement stats
 */
export async function calculateAchievementStats(
  studentId: string
): Promise<AchievementStats> {
  try {
    // Get all badges for student, ordered by earned date
    const badges = await prisma.badge.findMany({
      where: { studentId },
      orderBy: { earnedAt: "asc" },
    });

    const totalBadgesEarned = badges.length;

    if (totalBadgesEarned === 0) {
      return {
        totalBadgesEarned: 0,
        daysSinceFirstBadge: 0,
        avgDaysPerBadge: 0,
        currentStreak: 0,
        badgesEarned: [],
        loading: false,
      };
    }

    // Calculate days since first badge
    const firstBadgeDate = badges[0].earnedAt;
    const today = new Date();
    const daysSinceFirstBadge = Math.floor(
      (today.getTime() - firstBadgeDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate avg days per badge
    const avgDaysPerBadge =
      totalBadgesEarned > 1
        ? Math.floor(daysSinceFirstBadge / (totalBadgesEarned - 1))
        : daysSinceFirstBadge;

    // Calculate current streak (consecutive days with sessions)
    const sessions = await prisma.readingSession.findMany({
      where: { studentId, status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      select: { completedAt: true },
    });

    let currentStreak = 0;
    if (sessions.length > 0) {
      let checkDate = new Date(today);
      checkDate.setHours(0, 0, 0, 0);

      for (const session of sessions) {
        if (!session.completedAt) continue;

        const sessionDate = new Date(session.completedAt);
        sessionDate.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor(
          (checkDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff === 0 || daysDiff === 1) {
          currentStreak++;
          checkDate = sessionDate;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Get accuracy and fluency trends
    const allSessions = await prisma.readingSession.findMany({
      where: { studentId },
      orderBy: { completedAt: "asc" },
      select: { accuracy: true, completedAt: true },
    });

    let accuracyTrend: { improving: boolean; avgAccuracy: number } | undefined;
    if (allSessions.length >= 2) {
      const accuracies = allSessions
        .filter((s) => s.accuracy !== null)
        .map((s) => s.accuracy as number);

      if (accuracies.length >= 2) {
        const avgAccuracy = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
        const firstHalf = accuracies.slice(0, Math.floor(accuracies.length / 2));
        const secondHalf = accuracies.slice(Math.floor(accuracies.length / 2));

        const avgFirstHalf = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const avgSecondHalf = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

        accuracyTrend = {
          improving: avgSecondHalf > avgFirstHalf,
          avgAccuracy: Math.round(avgAccuracy),
        };
      }
    }

    // Get fluency trends from speaking sessions
    const speakingSessions = await prisma.speakingSession.findMany({
      where: { studentId },
      orderBy: { completedAt: "asc" },
      select: { fluencyScore: true, completedAt: true },
    });

    let fluencyTrend: { improving: boolean; avgFluency: number } | undefined;
    if (speakingSessions.length >= 2) {
      const fluencies = speakingSessions
        .filter((s) => s.fluencyScore !== null)
        .map((s) => s.fluencyScore as number);

      if (fluencies.length >= 2) {
        const avgFluency = fluencies.reduce((a, b) => a + b, 0) / fluencies.length;
        const firstHalf = fluencies.slice(0, Math.floor(fluencies.length / 2));
        const secondHalf = fluencies.slice(Math.floor(fluencies.length / 2));

        const avgFirstHalf = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const avgSecondHalf = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

        fluencyTrend = {
          improving: avgSecondHalf > avgFirstHalf,
          avgFluency: Math.round(avgFluency),
        };
      }
    }

    // Estimate next badge ETA (in days, assuming current pace)
    let nextBadgeEta: number | undefined;
    if (avgDaysPerBadge > 0) {
      const lastBadgeDate = badges[badges.length - 1].earnedAt;
      const daysToNextBadge = avgDaysPerBadge;
      const nextBadgeDate = new Date(lastBadgeDate);
      nextBadgeDate.setDate(nextBadgeDate.getDate() + daysToNextBadge);

      const daysUntilNext = Math.max(
        0,
        Math.floor((nextBadgeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      );
      nextBadgeEta = daysUntilNext;
    }

    return {
      totalBadgesEarned,
      daysSinceFirstBadge,
      avgDaysPerBadge,
      currentStreak,
      nextBadgeEta,
      badgesEarned: badges,
      accuracyTrend,
      fluencyTrend,
      loading: false,
    };
  } catch (error) {
    console.error("Error calculating achievement stats:", error);
    return {
      totalBadgesEarned: 0,
      daysSinceFirstBadge: 0,
      avgDaysPerBadge: 0,
      currentStreak: 0,
      badgesEarned: [],
      loading: false,
      error: String(error),
    };
  }
}
