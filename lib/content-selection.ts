import { prisma } from '@/lib/prisma';
import { ageBandToGradeBand } from './age-band-mapping';
import { AgeBand } from './age-band';

/**
 * Content selection algorithm for WizLingo
 *
 * Two-level filtering:
 * 1. Age band → Grade band (hard constraint, age-appropriate content)
 * 2. Performance level → Difficulty (soft constraint, personalized challenge)
 *
 * Example:
 * - Student age band: 9-11 → Only Grade III-V passages
 * - Student level: 2 → Medium difficulty within Grade III-V
 * - Result: Medium Grade III-V passage
 */

export interface ContentSelectionParams {
  studentId: string;
  ageBand: AgeBand;
  performanceLevel: number;
  excludeRecentCount?: number;
}

export interface ReadingContentResult {
  passage: {
    id: string;
    title: string;
    content: string;
    wordCount: number;
    gradeBand: string;
    level: number;
    topic: string;
  };
  metadata: {
    ageBand: AgeBand;
    level: number;
    gradeBand: string;
    reason: string;
  };
}

export interface SpeakingContentResult {
  topic: {
    id: string;
    title: string;
    character: string;
    openingLine: string;
    level: number;
    gradeBand: string;
    script?: any;
  };
  metadata: {
    ageBand: AgeBand;
    level: number;
    gradeBand: string;
    reason: string;
  };
}

/**
 * Select next reading passage for student
 *
 * Algorithm:
 * 1. Filter by age band → grade band
 * 2. Filter by performance level
 * 3. Exclude recent passages (avoid repetition)
 * 4. Randomly select from remaining pool
 */
export async function selectReadingPassage(
  params: ContentSelectionParams
): Promise<ReadingContentResult> {
  const { studentId, ageBand, performanceLevel, excludeRecentCount = 20 } = params;

  // Step 1: Map age band to grade band
  const gradeBand = ageBandToGradeBand(ageBand);

  // Step 2: Get all passages for this age band + level
  const availablePassages = await prisma.readingPassage.findMany({
    where: {
      gradeBand,
      level: performanceLevel,
    },
    select: { id: true },
  });

  if (availablePassages.length === 0) {
    throw new Error(
      `No reading passages available for age band ${ageBand} (${gradeBand}) at level ${performanceLevel}`
    );
  }

  // Step 3: Get recently used passages
  const recentSessions = await prisma.readingSession.findMany({
    where: { studentId },
    select: { passageId: true },
    orderBy: { createdAt: 'desc' },
    take: excludeRecentCount,
  });
  const recentIds = new Set(
    (recentSessions as { passageId: string }[]).map((r) => r.passageId)
  );

  // Step 4: Filter to passages not recently used
  let pool = availablePassages.filter((p) => !recentIds.has(p.id));

  // Step 5: If all passages have been used, allow repeats
  if (pool.length === 0) {
    pool = availablePassages;
  }

  // Step 6: Random selection
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  const passage = await prisma.readingPassage.findUniqueOrThrow({
    where: { id: chosen.id },
  });

  return {
    passage,
    metadata: {
      ageBand,
      level: performanceLevel,
      gradeBand,
      reason: `Age band ${ageBand} (Grade ${gradeBand}) at performance level ${performanceLevel}`,
    },
  };
}

/**
 * Select next speaking topic for student
 *
 * Algorithm:
 * 1. Filter by age band → grade band
 * 2. Filter by performance level
 * 3. Randomly select from pool
 */
export async function selectSpeakingTopic(
  params: ContentSelectionParams
): Promise<SpeakingContentResult> {
  const { ageBand, performanceLevel } = params;

  // Step 1: Map age band to grade band
  const gradeBand = ageBandToGradeBand(ageBand);

  // Step 2: Get all topics for this age band + level
  const availableTopics = await prisma.conversationTopic.findMany({
    where: {
      gradeBand,
      level: performanceLevel,
    },
    select: {
      id: true,
      title: true,
      character: true,
      openingLine: true,
      level: true,
      gradeBand: true,
      script: true,
    },
  });

  if (availableTopics.length === 0) {
    throw new Error(
      `No speaking topics available for age band ${ageBand} (${gradeBand}) at level ${performanceLevel}`
    );
  }

  // Step 3: Random selection (no recent filter for speaking)
  const chosen = availableTopics[Math.floor(Math.random() * availableTopics.length)];

  return {
    topic: chosen,
    metadata: {
      ageBand,
      level: performanceLevel,
      gradeBand,
      reason: `Age band ${ageBand} (Grade ${gradeBand}) at performance level ${performanceLevel}`,
    },
  };
}

/**
 * Get content recommendations for student
 * Shows what content is available at current and adjacent levels
 */
export async function getContentRecommendations(ageBand: AgeBand, currentLevel: number) {
  const gradeBand = ageBandToGradeBand(ageBand);

  // Get counts of available content at different levels
  const readingCounts = await prisma.readingPassage.groupBy({
    by: ['level'],
    where: { gradeBand },
    _count: true,
  });

  const speakingCounts = await prisma.conversationTopic.groupBy({
    by: ['level'],
    where: { gradeBand },
    _count: true,
  });

  return {
    ageBand,
    currentLevel,
    gradeBand,
    reading: readingCounts.map((r) => ({
      level: r.level,
      count: r._count,
      available: r._count > 0,
      isCurrent: r.level === currentLevel,
    })),
    speaking: speakingCounts.map((s) => ({
      level: s.level,
      count: s._count,
      available: s._count > 0,
      isCurrent: s.level === currentLevel,
    })),
  };
}
