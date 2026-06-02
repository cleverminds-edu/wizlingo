import { getSession } from "@/lib/auth";
import {
  sendBadgeEarnedEmail,
  sendMilestoneEmail,
  sendWeeklySummaryEmail,
  sendLeaderboardEmail,
  initializeNotificationPreferences,
} from "@/lib/email-service";
import { BadgeType } from "@/app/generated/prisma/client";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    // Allow admin or teacher to send emails on behalf of students
    if (!session || !["admin", "teacher"].includes(session.role)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, studentId, badgeType, stats, milestoneCount, summaryData, leaderboardData } = body;

    // Validate input
    if (!type || !studentId) {
      return Response.json({ error: "type and studentId are required" }, { status: 400 });
    }

    // Initialize preferences if not exists
    await initializeNotificationPreferences(studentId);

    let success = false;
    let messageId: string | null = null;

    switch (type) {
      case "badge_earned":
        if (!badgeType || !stats) {
          return Response.json(
            { error: "badge_earned requires badgeType and stats" },
            { status: 400 }
          );
        }
        success = await sendBadgeEarnedEmail(studentId, badgeType as BadgeType, stats);
        messageId = `badge_${studentId}_${Date.now()}`;
        break;

      case "milestone":
        if (!milestoneCount) {
          return Response.json(
            { error: "milestone requires milestoneCount" },
            { status: 400 }
          );
        }
        success = await sendMilestoneEmail(studentId, milestoneCount);
        messageId = `milestone_${studentId}_${Date.now()}`;
        break;

      case "weekly_summary":
        if (!summaryData) {
          return Response.json(
            { error: "weekly_summary requires summaryData" },
            { status: 400 }
          );
        }
        success = await sendWeeklySummaryEmail(studentId, summaryData);
        messageId = `summary_${studentId}_${Date.now()}`;
        break;

      case "leaderboard":
        if (!leaderboardData) {
          return Response.json(
            { error: "leaderboard requires leaderboardData" },
            { status: 400 }
          );
        }
        success = await sendLeaderboardEmail(studentId, leaderboardData);
        messageId = `leaderboard_${studentId}_${Date.now()}`;
        break;

      default:
        return Response.json({ error: "Invalid email type" }, { status: 400 });
    }

    if (!success) {
      return Response.json(
        { error: "Failed to send email. Check notification preferences." },
        { status: 400 }
      );
    }

    return Response.json(
      { sent: true, messageId, type },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in send notification endpoint:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
