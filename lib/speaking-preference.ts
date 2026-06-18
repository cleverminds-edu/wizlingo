import { prisma } from './prisma';
import type { Gender } from '@/app/generated/prisma/client';

export type CharacterGenderPref = 'ANY' | 'SAME' | 'DIFFERENT' | 'MALE' | 'FEMALE' | 'NEUTRAL';

/**
 * Get or create student's speaking preference
 */
export async function getSpeakingPreference(studentId: string) {
  let pref = await prisma.speakingPreference.findUnique({
    where: { studentId },
  });

  if (!pref) {
    // Create default preference
    pref = await prisma.speakingPreference.create({
      data: {
        studentId,
        characterGenderPref: 'ANY',
        pronouns: null,
      },
    });
  }

  return pref;
}

/**
 * Update student's character gender preference
 */
export async function updateCharacterPreference(
  studentId: string,
  pref: CharacterGenderPref
) {
  return await prisma.speakingPreference.upsert({
    where: { studentId },
    create: {
      studentId,
      characterGenderPref: pref,
    },
    update: {
      characterGenderPref: pref,
    },
  });
}

/**
 * Update student's pronouns
 */
export async function updatePronouns(studentId: string, pronouns: string) {
  return await prisma.speakingPreference.upsert({
    where: { studentId },
    create: {
      studentId,
      pronouns,
    },
    update: {
      pronouns,
    },
  });
}

/**
 * Get available character genders for filtering
 */
export function getAvailableCharacterGenders(
  studentGender: Gender | null,
  preferenceType: CharacterGenderPref
): Gender[] {
  switch (preferenceType) {
    case 'SAME':
      return studentGender ? [studentGender] : ['MALE', 'FEMALE'];
    case 'DIFFERENT':
      if (studentGender === 'MALE') return ['FEMALE', 'OTHER', 'NEUTRAL'];
      if (studentGender === 'FEMALE') return ['MALE', 'OTHER', 'NEUTRAL'];
      return ['MALE', 'FEMALE', 'NEUTRAL'];
    case 'MALE':
      return ['MALE'];
    case 'FEMALE':
      return ['FEMALE'];
    case 'NEUTRAL':
      return ['NEUTRAL', 'OTHER'];
    case 'ANY':
    default:
      return ['MALE', 'FEMALE', 'NEUTRAL', 'OTHER'];
  }
}

/**
 * Get progression week number based on signup date
 * Week 1: Student has choice of character gender
 * Week 2+: Gradually mix in more variety
 */
export function calculateProgressionWeek(startedAt: Date): number {
  const now = new Date();
  const daysElapsed = Math.floor((now.getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24));
  const weekNumber = Math.floor(daysElapsed / 7) + 1;
  return Math.max(1, weekNumber);
}

/**
 * Get target character diversity percentage based on progression
 * Week 1: 100% preferred choice
 * Week 2: 70% preferred, 30% variety
 * Week 3: 50% preferred, 50% variety
 * Week 4+: 30% preferred, 70% variety (mostly diverse)
 */
export function getTargetDiversityPercentage(progressionWeek: number): {
  preferred: number;
  diverse: number;
} {
  if (progressionWeek === 1) return { preferred: 100, diverse: 0 };
  if (progressionWeek === 2) return { preferred: 70, diverse: 30 };
  if (progressionWeek === 3) return { preferred: 50, diverse: 50 };
  return { preferred: 30, diverse: 70 };
}

/**
 * Build filter for character selection based on preference and progression
 */
export async function buildCharacterFilter(
  studentId: string,
  studentGender: Gender | null,
  ageBand: string,
  level: number
) {
  const pref = await getSpeakingPreference(studentId);
  const progressionWeek = calculateProgressionWeek(pref.startedAt);
  const diversity = getTargetDiversityPercentage(progressionWeek);

  const preferredGenders = getAvailableCharacterGenders(
    studentGender,
    pref.characterGenderPref as CharacterGenderPref
  );

  return {
    pref,
    progressionWeek,
    diversity,
    preferredGenders,
  };
}

/**
 * Select character gender based on progression and preference
 * Intelligently mixes preferred characters with diverse ones as student progresses
 */
export function selectCharacterGender(
  allGenders: string[],
  preferredGenders: Gender[] | string[],
  diversityPercent: { preferred: number; diverse: number }
): Gender {
  const random = Math.random() * 100;

  if (random < diversityPercent.preferred) {
    // Pick from preferred genders
    const preferred = preferredGenders.length > 0 ? preferredGenders : ['MALE', 'FEMALE', 'NEUTRAL'];
    return preferred[Math.floor(Math.random() * preferred.length)] as Gender;
  } else {
    // Pick from all available genders
    return allGenders[Math.floor(Math.random() * allGenders.length)] as Gender;
  }
}

/**
 * Get speaking preference summary for dashboard
 */
export async function getSpeakingPreferenceSummary(studentId: string) {
  const pref = await getSpeakingPreference(studentId);
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { gender: true },
  });

  const conversationStats = await prisma.speakingSession.aggregate({
    where: { studentId, status: 'COMPLETED' },
    _count: true,
  });

  const genderStats = await prisma.speakingSession.groupBy({
    by: ['topicId'],
    where: { studentId, status: 'COMPLETED' },
  });

  return {
    preference: pref.characterGenderPref,
    pronouns: pref.pronouns,
    studentGender: student?.gender,
    progressionWeek: calculateProgressionWeek(pref.startedAt),
    totalSessions: conversationStats._count,
    startedAt: pref.startedAt,
    availableCharacterGenders: getAvailableCharacterGenders(
      student?.gender || null,
      pref.characterGenderPref as CharacterGenderPref
    ),
  };
}

/**
 * Track character gender diversity for analytics
 */
export async function getCharacterDiversityStats(studentId: string) {
  const sessions = await prisma.speakingSession.findMany({
    where: { studentId, status: 'COMPLETED' },
    include: {
      topic: {
        select: { character: true, characterGender: true },
      },
    },
  });

  const genderCounts = {
    MALE: 0,
    FEMALE: 0,
    NEUTRAL: 0,
    OTHER: 0,
  };

  sessions.forEach((session) => {
    if (session.topic?.characterGender) {
      genderCounts[session.topic.characterGender as keyof typeof genderCounts]++;
    }
  });

  const total = sessions.length;
  const percentages = {
    MALE: total > 0 ? ((genderCounts.MALE / total) * 100).toFixed(1) : '0',
    FEMALE: total > 0 ? ((genderCounts.FEMALE / total) * 100).toFixed(1) : '0',
    NEUTRAL: total > 0 ? ((genderCounts.NEUTRAL / total) * 100).toFixed(1) : '0',
    OTHER: total > 0 ? ((genderCounts.OTHER / total) * 100).toFixed(1) : '0',
  };

  return {
    totalSessions: total,
    genderCounts,
    percentages,
    diversity: calculateDiversityScore(genderCounts, total),
  };
}

/**
 * Calculate diversity score (0-100)
 * 100 = perfectly balanced across all genders
 * 0 = only one gender used
 */
function calculateDiversityScore(
  genderCounts: Record<string, number>,
  total: number
): number {
  if (total < 4) return 0; // Not enough data

  const usedGenders = Object.values(genderCounts).filter((count) => count > 0).length;
  const expectedDistribution = total / 4; // Ideal: 25% each

  const varianceFromIdeal = Object.values(genderCounts).reduce(
    (sum, count) => sum + Math.abs(count - expectedDistribution),
    0
  );

  const maxVariance = total; // Worst case
  const normalizedVariance = varianceFromIdeal / maxVariance;
  const diversityScore = (1 - normalizedVariance) * 100;

  return Math.max(0, Math.min(100, diversityScore));
}
