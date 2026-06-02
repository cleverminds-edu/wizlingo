import { getSession } from "@/lib/auth";
import { calculateAchievementStats } from "@/lib/achievement-stats";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const session = await getSession();
    const { studentId } = await params;

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Allow students to view their own stats, or admin/teacher to view any student's
    if (session.role === "student" && session.id !== studentId) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const stats = await calculateAchievementStats(studentId);

    return Response.json(stats, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("Error fetching achievement stats:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
