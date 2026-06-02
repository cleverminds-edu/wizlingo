import { getSession } from "@/lib/auth";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  initializeNotificationPreferences,
} from "@/lib/email-service";

interface UpdatePreferencesBody {
  badgeEarnedStudent?: boolean;
  badgeEarnedParent?: boolean;
  milestoneEmail?: boolean;
  weeklySummary?: boolean;
  leaderboardUpdate?: boolean;
  emailFrequency?: "IMMEDIATE" | "DAILY" | "WEEKLY" | "NEVER";
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const session = await getSession();
    const { studentId } = await params;

    // Allow students to view their own preferences, or admin/teacher to view any student's
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role === "student" && session.id !== studentId) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Initialize if doesn't exist
    await initializeNotificationPreferences(studentId);

    const preferences = await getNotificationPreferences(studentId);

    return Response.json(preferences, { status: 200 });
  } catch (error) {
    console.error("Error getting notification preferences:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const session = await getSession();
    const { studentId } = await params;

    // Allow students to update their own preferences, or admin/teacher to update any student's
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role === "student" && session.id !== studentId) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body: UpdatePreferencesBody = await request.json();

    // Validate input
    const allowedKeys = [
      "badgeEarnedStudent",
      "badgeEarnedParent",
      "milestoneEmail",
      "weeklySummary",
      "leaderboardUpdate",
      "emailFrequency",
    ];

    const invalidKeys = Object.keys(body).filter((key) => !allowedKeys.includes(key));
    if (invalidKeys.length > 0) {
      return Response.json(
        { error: `Invalid keys: ${invalidKeys.join(", ")}` },
        { status: 400 }
      );
    }

    // Update preferences
    await updateNotificationPreferences(studentId, body);

    const updated = await getNotificationPreferences(studentId);

    return Response.json(
      { updated: true, preferences: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
