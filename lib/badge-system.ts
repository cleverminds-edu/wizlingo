import { BadgeType } from '@/app/generated/prisma/client';

// ═══════════════════════════════════════════════════════════════
// BADGE CONFIGURATION (Viral Growth Optimized)
// ═══════════════════════════════════════════════════════════════

export const BADGE_CONFIG: Record<BadgeType, BadgeDefinition> = {
  SPARK: {
    type: 'SPARK',
    name: 'Spark',
    emoji: '✨',
    color: '#F97316',
    bgColor: '#FFF7ED',
    description: 'Your first step into the world of reading!',
    requirement: 'Complete 1 reading session',
    message: 'You earned the SPARK badge! 🎉 Join WizLingo and earn more badges.',
    shareText: `I just earned the ✨ SPARK badge on WizLingo!
I'm starting my reading journey with AI-powered sessions.
Join me → [LINK]`,
    order: 1,
  },
  WORD_WIZARD: {
    type: 'WORD_WIZARD',
    name: 'Word Wizard',
    emoji: '📚',
    color: '#4F46E5',
    bgColor: '#EEF2FF',
    description: 'Master of reading comprehension',
    requirement: 'Achieve 80%+ accuracy in reading',
    message: 'Incredible! You\'re a Word Wizard! 📚 Your reading precision is outstanding.',
    shareText: `I just became a 📚 WORD WIZARD on WizLingo!
80%+ reading accuracy unlocked. Can you beat my score?
Join the challenge → [LINK]`,
    order: 2,
  },
  VOICE_WIZARD: {
    type: 'VOICE_WIZARD',
    name: 'Voice Wizard',
    emoji: '🎤',
    color: '#9333EA',
    bgColor: '#FAF5FF',
    description: 'Master of spoken fluency',
    requirement: 'Achieve 75%+ fluency in speaking',
    message: 'Amazing! You\'re a Voice Wizard! 🎤 Your pronunciation is excellent.',
    shareText: `I just became a 🎤 VOICE WIZARD on WizLingo!
My speaking fluency reached 75%+. Try the speaking challenge!
Join → [LINK]`,
    order: 3,
  },
  LANGUAGE_WIZARD: {
    type: 'LANGUAGE_WIZARD',
    name: 'Language Wizard',
    emoji: '🧙',
    color: '#059669',
    bgColor: '#ECFDF5',
    description: 'Committed learner with 10+ sessions',
    requirement: 'Complete 10 reading or speaking sessions',
    message: 'Incredible dedication! You\'re a Language Wizard! 🧙 Keep the momentum going!',
    shareText: `I just became a 🧙 LANGUAGE WIZARD on WizLingo!
10+ sessions completed and my skills are improving daily.
Join me on this journey → [LINK]`,
    order: 4,
  },
  GRAND_WIZARD: {
    type: 'GRAND_WIZARD',
    name: 'Grand Wizard',
    emoji: '👑',
    color: '#D97706',
    bgColor: '#FFFBEB',
    description: 'Ultimate master of reading & speaking',
    requirement: 'Earn all 4 badges above',
    message: 'LEGENDARY! You\'re a Grand Wizard! 👑 You\'ve mastered WizLingo!',
    shareText: `I just became a 👑 GRAND WIZARD on WizLingo!
All badges unlocked! I\'ve mastered reading & speaking fluency.
Can you become a Grand Wizard too? → [LINK]`,
    order: 5,
  },
};

// Streak badges (viral growth)
export const STREAK_BADGES: Record<string, StreakedBadgeDefinition> = {
  STREAK_7: {
    id: 'STREAK_7',
    name: '7-Day Warrior',
    emoji: '🔥',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    description: '7-day learning streak',
    requirement: 'Use WizLingo for 7 consecutive days',
    shareText: `I have a 🔥 7-DAY STREAK on WizLingo!
Learning every day to improve my English skills.
Start your streak → [LINK]`,
  },
  STREAK_14: {
    id: 'STREAK_14',
    name: '14-Day Champion',
    emoji: '⚡',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    description: '14-day learning streak',
    requirement: 'Use WizLingo for 14 consecutive days',
    shareText: `I have a ⚡ 14-DAY STREAK on WizLingo!
Two weeks of consistent learning. Join me!
Start now → [LINK]`,
  },
  STREAK_30: {
    id: 'STREAK_30',
    name: '30-Day Master',
    emoji: '💎',
    color: '#8B5CF6',
    bgColor: '#F3E8FF',
    description: '30-day learning streak',
    requirement: 'Use WizLingo for 30 consecutive days',
    shareText: `I have a 💎 30-DAY STREAK on WizLingo!
One month of daily learning. This is my commitment to fluency.
Join the challenge → [LINK]`,
  },
};

interface BadgeDefinition {
  type: BadgeType;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
  requirement: string;
  message: string;
  shareText: string;
  order: number;
}

interface StreakedBadgeDefinition {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
  requirement: string;
  shareText: string;
}

// ═══════════════════════════════════════════════════════════════
// BADGE EARNING LOGIC
// ═══════════════════════════════════════════════════════════════

export async function checkAndAwardBadges(
  studentId: string,
  sessionType: 'reading' | 'speaking',
  metrics: { wpm?: number; accuracy?: number; fluencyScore?: number }
) {
  const { prisma } = await import('@/lib/prisma');
  const badgesEarned: BadgeType[] = [];

  // 1️⃣ SPARK: First session
  const totalSessions = await prisma.readingSession.count({
    where: { studentId },
  });

  if (totalSessions === 1) {
    const exists = await prisma.badge.findUnique({
      where: { studentId_type: { studentId, type: 'SPARK' } },
    });
    if (!exists) {
      await prisma.badge.create({ data: { studentId, type: 'SPARK' } });
      await prisma.certificate.create({
        data: { studentId, badgeType: 'SPARK' },
      });
      badgesEarned.push('SPARK');
    }
  }

  // 2️⃣ WORD_WIZARD: 80%+ reading accuracy
  if (sessionType === 'reading' && (metrics.accuracy || 0) >= 80) {
    const exists = await prisma.badge.findUnique({
      where: { studentId_type: { studentId, type: 'WORD_WIZARD' } },
    });
    if (!exists) {
      await prisma.badge.create({ data: { studentId, type: 'WORD_WIZARD' } });
      await prisma.certificate.create({
        data: { studentId, badgeType: 'WORD_WIZARD' },
      });
      badgesEarned.push('WORD_WIZARD');
    }
  }

  // 3️⃣ VOICE_WIZARD: 75%+ speaking fluency
  if (sessionType === 'speaking' && (metrics.fluencyScore || 0) >= 75) {
    const exists = await prisma.badge.findUnique({
      where: { studentId_type: { studentId, type: 'VOICE_WIZARD' } },
    });
    if (!exists) {
      await prisma.badge.create({ data: { studentId, type: 'VOICE_WIZARD' } });
      await prisma.certificate.create({
        data: { studentId, badgeType: 'VOICE_WIZARD' },
      });
      badgesEarned.push('VOICE_WIZARD');
    }
  }

  // 4️⃣ LANGUAGE_WIZARD: 10+ sessions
  const speakingSessions = await prisma.speakingSession.count({
    where: { studentId },
  });
  const totalAllSessions = totalSessions + speakingSessions;

  if (totalAllSessions >= 10) {
    const exists = await prisma.badge.findUnique({
      where: { studentId_type: { studentId, type: 'LANGUAGE_WIZARD' } },
    });
    if (!exists) {
      await prisma.badge.create({ data: { studentId, type: 'LANGUAGE_WIZARD' } });
      await prisma.certificate.create({
        data: { studentId, badgeType: 'LANGUAGE_WIZARD' },
      });
      badgesEarned.push('LANGUAGE_WIZARD');
    }
  }

  // 5️⃣ GRAND_WIZARD: All 4 badges
  const allBadges = await prisma.badge.findMany({
    where: { studentId },
    select: { type: true },
  });
  const badgeTypes = allBadges.map((b) => b.type);

  const hasAllBadges =
    badgeTypes.includes('SPARK') &&
    badgeTypes.includes('WORD_WIZARD') &&
    badgeTypes.includes('VOICE_WIZARD') &&
    badgeTypes.includes('LANGUAGE_WIZARD');

  if (hasAllBadges && badgesEarned.length > 0) {
    const exists = await prisma.badge.findUnique({
      where: { studentId_type: { studentId, type: 'GRAND_WIZARD' } },
    });
    if (!exists) {
      await prisma.badge.create({ data: { studentId, type: 'GRAND_WIZARD' } });
      await prisma.certificate.create({
        data: { studentId, badgeType: 'GRAND_WIZARD' },
      });
      badgesEarned.push('GRAND_WIZARD');
    }
  }

  return badgesEarned;
}

// ═══════════════════════════════════════════════════════════════
// STREAK LOGIC (For daily engagement)
// ═══════════════════════════════════════════════════════════════

export async function updateStreak(studentId: string) {
  // TODO: Implement day streak tracking when schema is updated
  // Currently StudentProgress model doesn't have dayStreak or lastActiveDay fields
  return [];
}

async function checkStreakBadges(studentId: string, streak: number) {
  const { prisma } = await import('@/lib/prisma');
  const streaksEarned: string[] = [];

  if (streak >= 7) {
    // Check if already earned (store in metadata or separate table)
    const exists = await prisma.badge.findUnique({
      where: { studentId_type: { studentId, type: 'SPARK' } }, // Use creative check
    });
    // TODO: Implement streak badge storage
    streaksEarned.push('STREAK_7');
  }

  if (streak >= 14) {
    streaksEarned.push('STREAK_14');
  }

  if (streak >= 30) {
    streaksEarned.push('STREAK_30');
  }

  return streaksEarned;
}

// ═══════════════════════════════════════════════════════════════
// GET BADGE INFO FOR DISPLAY/SHARING
// ═══════════════════════════════════════════════════════════════

export function getBadgeConfig(badgeType: BadgeType) {
  return BADGE_CONFIG[badgeType];
}

export function getStreakBadgeConfig(streakId: string) {
  return STREAK_BADGES[streakId];
}

export async function getStudentBadges(studentId: string) {
  const { prisma } = await import('@/lib/prisma');
  const badges = await prisma.badge.findMany({
    where: { studentId },
    include: {
      student: true,
    },
    orderBy: { earnedAt: 'asc' },
  });

  return badges.map((b) => ({
    ...b,
    config: getBadgeConfig(b.type),
  }));
}

export async function getNextBadges(studentId: string) {
  const { prisma } = await import('@/lib/prisma');
  const earned = await prisma.badge.findMany({
    where: { studentId },
    select: { type: true },
  });

  const earnedTypes = earned.map((b) => b.type);
  const allTypes = Object.keys(BADGE_CONFIG) as BadgeType[];

  return allTypes
    .filter((t) => !earnedTypes.includes(t))
    .map((t) => ({
      type: t,
      config: getBadgeConfig(t),
    }));
}
