import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BadgeType } from "@/app/generated/prisma/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const authSession = await getSession();
  if (!authSession) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { studentId } = await params;

  // Authorization: only the student themselves or a teacher/admin can view
  if (authSession.role === "student" && authSession.id !== studentId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Get student data
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        progress: true,
        speakingProgress: true,
      },
    });

    if (!student) {
      return Response.json({ error: "Student not found" }, { status: 404 });
    }

    // Get earned badges
    const earnedBadges = await prisma.badge.findMany({
      where: { studentId },
      select: { type: true, earnedAt: true },
    });
    const earnedBadgeTypes = new Set(
      earnedBadges.map((b) => b.type)
    );

    // Count sessions
    const readingCount = await prisma.readingSession.count({
      where: { studentId, completedAt: { not: null } },
    });
    const speakingCount = await prisma.speakingSession.count({
      where: { studentId, completedAt: { not: null } },
    });
    const totalSessions = readingCount + speakingCount;

    // Get average metrics
    const avgAccuracy = student.progress?.avgAccuracy ?? 0;
    const avgFluency = student.speakingProgress?.avgFluency ?? 0;

    // Build progress for each badge
    interface BadgeProgress {
      type: BadgeType;
      earned: boolean;
      progress: number; // 0-100
      requirement: string;
      current: string;
      earnedAt?: string;
    }

    const badgeProgresses: BadgeProgress[] = [];

    // SPARK progress
    const sparkEarned = earnedBadgeTypes.has("SPARK");
    const sparkBadge = earnedBadges.find((b) => b.type === "SPARK");
    badgeProgresses.push({
      type: "SPARK",
      earned: sparkEarned,
      progress: sparkEarned ? 100 : totalSessions > 0 ? 100 : 0,
      requirement: "Complete 1 session",
      current: `${totalSessions} / 1 session`,
      earnedAt: sparkBadge?.earnedAt?.toISOString(),
    });

    // WORD_WIZARD progress
    const wordWizardEarned = earnedBadgeTypes.has("WORD_WIZARD");
    const wordWizardProgress = Math.min(avgAccuracy, 100);
    const wordWizardBadge = earnedBadges.find((b) => b.type === "WORD_WIZARD");
    badgeProgresses.push({
      type: "WORD_WIZARD",
      earned: wordWizardEarned,
      progress: wordWizardProgress,
      requirement: "Achieve 80%+ accuracy in reading",
      current: `${Math.round(avgAccuracy)}% accuracy`,
      earnedAt: wordWizardBadge?.earnedAt?.toISOString(),
    });

    // VOICE_WIZARD progress
    const voiceWizardEarned = earnedBadgeTypes.has("VOICE_WIZARD");
    const voiceWizardProgress = Math.min(avgFluency, 100);
    const voiceWizardBadge = earnedBadges.find((b) => b.type === "VOICE_WIZARD");
    badgeProgresses.push({
      type: "VOICE_WIZARD",
      earned: voiceWizardEarned,
      progress: voiceWizardProgress,
      requirement: "Achieve 75%+ fluency in speaking",
      current: `${Math.round(avgFluency)}% fluency`,
      earnedAt: voiceWizardBadge?.earnedAt?.toISOString(),
    });

    // LANGUAGE_WIZARD progress
    const languageWizardEarned = earnedBadgeTypes.has("LANGUAGE_WIZARD");
    const languageWizardProgress = (totalSessions / 10) * 100;
    const languageWizardBadge = earnedBadges.find((b) => b.type === "LANGUAGE_WIZARD");
    badgeProgresses.push({
      type: "LANGUAGE_WIZARD",
      earned: languageWizardEarned,
      progress: Math.min(languageWizardProgress, 100),
      requirement: "Complete 10+ reading or speaking sessions",
      current: `${totalSessions} / 10 sessions`,
      earnedAt: languageWizardBadge?.earnedAt?.toISOString(),
    });

    // GRAND_WIZARD progress
    const grandWizardEarned = earnedBadgeTypes.has("GRAND_WIZARD");
    const requiredBadgesEarned = [
      "SPARK",
      "WORD_WIZARD",
      "VOICE_WIZARD",
      "LANGUAGE_WIZARD",
    ].filter((type) => earnedBadgeTypes.has(type as BadgeType)).length;
    const grandWizardProgress = (requiredBadgesEarned / 4) * 100;
    const grandWizardBadge = earnedBadges.find((b) => b.type === "GRAND_WIZARD");
    badgeProgresses.push({
      type: "GRAND_WIZARD",
      earned: grandWizardEarned,
      progress: Math.min(grandWizardProgress, 100),
      requirement: "Earn all 4 badges: SPARK, WORD_WIZARD, VOICE_WIZARD, LANGUAGE_WIZARD",
      current: `${requiredBadgesEarned} / 4 badges earned`,
      earnedAt: grandWizardBadge?.earnedAt?.toISOString(),
    });

    // Separate earned and locked badges
    const earned = badgeProgresses.filter((b) => b.earned);
    const locked = badgeProgresses.filter((b) => !b.earned);

    return Response.json({
      studentId,
      studentName: student.name,
      earnedBadges: earned,
      nextBadges: locked,
      totalSessions,
      readingSessionsCompleted: readingCount,
      speakingSessionsCompleted: speakingCount,
      avgAccuracy: Math.round(avgAccuracy),
      avgFluency: Math.round(avgFluency),
    });
  } catch (error) {
    console.error("Error fetching badge progress:", error);
    return Response.json(
      { error: "Failed to fetch badge progress" },
      { status: 500 }
    );
  }
}
