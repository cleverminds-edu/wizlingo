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

  // WORD_WIZARD — first reading level-up
  if (event.type === "reading" && event.leveledUp) {
    await award(BadgeType.WORD_WIZARD);
  }

  // GRAND_WIZARD — passed a session at reading level 3 (grade band mastered)
  if (event.type === "reading" && event.passed && event.currentLevelBeforeUpdate === 3) {
    await award(BadgeType.GRAND_WIZARD);
  }

  // VOICE_WIZARD — first speaking level-up
  if (event.type === "speaking" && event.leveledUp) {
    await award(BadgeType.VOICE_WIZARD);
  }

  // LANGUAGE_WIZARD — student now has both WORD_WIZARD + VOICE_WIZARD
  if (
    !earned.has(BadgeType.LANGUAGE_WIZARD) &&
    earned.has(BadgeType.WORD_WIZARD) &&
    earned.has(BadgeType.VOICE_WIZARD)
  ) {
    await award(BadgeType.LANGUAGE_WIZARD);

    // Issue certificate
    try {
      const cert = await prisma.certificate.create({
        data: { studentId, badgeType: BadgeType.LANGUAGE_WIZARD },
      });
      certificateVerifyCode = cert.verifyCode;
    } catch {
      // already exists
      const cert = await prisma.certificate.findUnique({
        where: { studentId_badgeType: { studentId, badgeType: BadgeType.LANGUAGE_WIZARD } },
      });
      certificateVerifyCode = cert?.verifyCode ?? null;
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
