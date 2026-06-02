// Helper functions to integrate email notifications with badge earning

import { sendBadgeEarnedEmail, sendMilestoneEmail, initializeNotificationPreferences } from "@/lib/email-service";
import { prisma } from "@/lib/prisma";
import { BadgeType } from "@/app/generated/prisma/client";

export interface SessionStats {
  accuracy: number;
  wpm: number;
  duration: number; // in minutes
}

/**
 * Handles badge earning with automatic email notification
 * Call this after a badge is awarded to a student
 */
export async function notifyBadgeEarned(
  studentId: string,
  badgeType: BadgeType,
  stats: SessionStats
): Promise<boolean> {
  try {
    // Initialize notification preferences if not exists
    await initializeNotificationPreferences(studentId);

    // Send badge earned email
    const emailSent = await sendBadgeEarnedEmail(studentId, badgeType, {
      accuracy: Math.round(stats.accuracy),
      wpm: Math.round(stats.wpm),
      duration: stats.duration,
    });

    // Check if student has reached milestone (5, 10, 15, 20 badges)
    const badgeCount = await prisma.badge.count({ where: { studentId } });

    const milestones = [5, 10, 15, 20];
    if (milestones.includes(badgeCount)) {
      await sendMilestoneEmail(studentId, badgeCount);
    }

    return emailSent;
  } catch (error) {
    console.error("Error notifying badge earned:", error);
    return false;
  }
}

/**
 * Helper to get student's current badge count
 */
export async function getStudentBadgeCount(studentId: string): Promise<number> {
  const count = await prisma.badge.count({ where: { studentId } });
  return count;
}

/**
 * Helper to get all badges earned by a student
 */
export async function getStudentBadges(studentId: string) {
  return prisma.badge.findMany({
    where: { studentId },
    orderBy: { earnedAt: "desc" },
  });
}

/**
 * Helper to calculate weekly stats for summary email
 */
export async function calculateWeeklyStats(studentId: string) {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // Get sessions from last week
  const sessions = await prisma.readingSession.findMany({
    where: {
      studentId,
      completedAt: { gte: oneWeekAgo },
      status: "COMPLETED",
    },
  });

  // Get badges earned last week
  const badges = await prisma.badge.findMany({
    where: {
      studentId,
      earnedAt: { gte: oneWeekAgo },
    },
  });

  // Calculate accuracy improvement
  let accuracyFrom = 0;
  let accuracyTo = 0;

  if (sessions.length > 0) {
    const accuracies = sessions.filter((s) => s.accuracy !== null).map((s) => s.accuracy as number);
    if (accuracies.length > 0) {
      accuracyFrom = Math.round(accuracies[0]);
      accuracyTo = Math.round(accuracies[accuracies.length - 1]);
    }
  }

  return {
    sessionsCompleted: sessions.length,
    badgesEarned: badges.map((b) => {
      const config = require("@/lib/badge-system").BADGE_CONFIG[b.type];
      return {
        emoji: config?.emoji || "✨",
        name: config?.name || b.type,
      };
    }),
    accuracyImprovement: {
      from: accuracyFrom,
      to: accuracyTo,
    },
    nextChallenge: getNextBadgeChallenge(badges.map((b) => b.type)),
  };
}

/**
 * Helper to determine next badge challenge based on earned badges
 */
function getNextBadgeChallenge(earnedBadges: BadgeType[]): string {
  const { BADGE_CONFIG } = require("@/lib/badge-system");

  const badgeOrder = ["SPARK", "WORD_WIZARD", "VOICE_WIZARD", "LANGUAGE_WIZARD", "GRAND_WIZARD"];

  for (const badge of badgeOrder) {
    if (!earnedBadges.includes(badge)) {
      const config = BADGE_CONFIG[badge];
      if (config) {
        return `Earn the ${config.emoji} ${config.name} badge: ${config.requirement}`;
      }
    }
  }

  return "You've earned all badges! Keep practicing to maintain your skills!";
}

/**
 * Trigger weekly summary email for a student
 */
export async function sendWeeklySummary(studentId: string): Promise<boolean> {
  try {
    const stats = await calculateWeeklyStats(studentId);
    const { sendWeeklySummaryEmail } = require("@/lib/email-service");
    return await sendWeeklySummaryEmail(studentId, stats);
  } catch (error) {
    console.error("Error sending weekly summary:", error);
    return false;
  }
}
