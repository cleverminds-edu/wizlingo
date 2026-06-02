import { prisma } from "@/lib/prisma";
import { BadgeType } from "@/app/generated/prisma/client";

export type BadgeEvent = {
  type: "reading" | "speaking";
  passed: boolean;
  leveledUp: boolean;
  currentLevelBeforeUpdate: number;
  isFirstEverSession: boolean;
};

export type BadgeResult = {
  newBadges: BadgeType[];
  certificateVerifyCode: string | null;
};

export async function checkAndAwardBadges(
  studentId: string,
  event: BadgeEvent
): Promise<BadgeResult> {
  const newBadges: BadgeType[] = [];
  let certificateVerifyCode: string | null = null;

  const existing = await prisma.badge.findMany({
    where: { studentId },
    select: { type: true },
  });
  const earned = new Set(existing.map((b) => b.type));

  async function award(type: BadgeType) {
    if (earned.has(type)) return;
    try {
      await prisma.badge.create({ data: { studentId, type } });
      earned.add(type);
      newBadges.push(type);
    } catch {
      // unique constraint — already awarded by concurrent request
    }
  }

  // SPARK — first session ever completed
  if (event.isFirstEverSession) {
    await award(BadgeType.SPARK);
  }

  // WORD_WIZARD — 80%+ accuracy in reading
  if (event.type === "reading" && event.passed) {
    // Check if student achieved 80%+ accuracy on this reading session
    const recentReadingSession = await prisma.readingSession.findFirst({
      where: { studentId, completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
    });
    if (recentReadingSession && (recentReadingSession.accuracy || 0) >= 80) {
      await award(BadgeType.WORD_WIZARD);
    }
  }

  // VOICE_WIZARD — 75%+ fluency in speaking
  if (event.type === "speaking" && event.passed) {
    // Check if student achieved 75%+ fluency on this speaking session
    const recentSpeakingSession = await prisma.speakingSession.findFirst({
      where: { studentId, completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
    });
    if (recentSpeakingSession && (recentSpeakingSession.fluencyScore || 0) >= 75) {
      await award(BadgeType.VOICE_WIZARD);
    }
  }

  // LANGUAGE_WIZARD — 10+ sessions (reading OR speaking combined)
  const readingCount = await prisma.readingSession.count({
    where: { studentId, completedAt: { not: null } },
  });
  const speakingCount = await prisma.speakingSession.count({
    where: { studentId, completedAt: { not: null } },
  });
  if (readingCount + speakingCount >= 10) {
    await award(BadgeType.LANGUAGE_WIZARD);
  }

  // GRAND_WIZARD — All 4 other badges earned
  if (
    earned.has(BadgeType.SPARK) &&
    earned.has(BadgeType.WORD_WIZARD) &&
    earned.has(BadgeType.VOICE_WIZARD) &&
    earned.has(BadgeType.LANGUAGE_WIZARD)
  ) {
    await award(BadgeType.GRAND_WIZARD);

    // Issue certificate
    if (!earned.has(BadgeType.GRAND_WIZARD) || newBadges.includes(BadgeType.GRAND_WIZARD)) {
      try {
        const cert = await prisma.certificate.create({
          data: { studentId, badgeType: BadgeType.GRAND_WIZARD },
        });
        certificateVerifyCode = cert.verifyCode;
      } catch {
        // already exists
        const cert = await prisma.certificate.findUnique({
          where: { studentId_badgeType: { studentId, badgeType: BadgeType.GRAND_WIZARD } },
        });
        certificateVerifyCode = cert?.verifyCode ?? null;
      }
    }
  }

  return { newBadges, certificateVerifyCode };
}

export const BADGE_META: Record<BadgeType, { emoji: string; label: string; description: string; color: string }> = {
  SPARK: {
    emoji: "✨",
    label: "Spark",
    description: "Completed your very first session",
    color: "from-yellow-400 to-orange-400",
  },
  WORD_WIZARD: {
    emoji: "📚",
    label: "Word Wizard",
    description: "Levelled up your reading skills",
    color: "from-blue-400 to-indigo-500",
  },
  VOICE_WIZARD: {
    emoji: "🎤",
    label: "Voice Wizard",
    description: "Levelled up your speaking skills",
    color: "from-purple-400 to-pink-500",
  },
  LANGUAGE_WIZARD: {
    emoji: "🧙",
    label: "Language Wizard",
    description: "Mastered both Reading & Speaking",
    color: "from-emerald-400 to-teal-500",
  },
  GRAND_WIZARD: {
    emoji: "👑",
    label: "Grand Wizard",
    description: "Completed the highest level of your grade",
    color: "from-amber-400 to-yellow-500",
  },
};
