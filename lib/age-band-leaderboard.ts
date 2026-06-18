import { prisma } from './prisma';
import { AgeBand } from './age-band';

export interface AgeBandLeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  ageBand: AgeBand;
  currentLevel: number;
  value: number;
  metric: string;
  trend: 'up' | 'down' | 'same';
}

export interface AgeBandLeaderboardResponse {
  leaderboard: AgeBandLeaderboardEntry[];
  currentUserRank: number | null;
  currentUserValue: number | null;
  currentUserLevel: number | null;
  type: 'ACCURACY' | 'CONSISTENCY' | 'LEVEL' | 'BADGES';
  ageBand: AgeBand;
  ageBandLabel: string;
}

/**
 * Calculate accuracy ranking within an age band
 * Shows top performers by reading accuracy
 */
export async function calculateAgeBandAccuracyRanking(ageBand: AgeBand) {
  const students = await prisma.student.findMany({
    where: {
      progress: {
        ageBand,
      },
    },
    include: {
      progress: true,
      sessions: {
        where: {
          status: 'COMPLETED',
          accuracy: { not: null },
        },
      },
    },
  });

  const rankings = students
    .map((student) => {
      if (student.sessions.length === 0) {
        return {
          studentId: student.id,
          studentName: student.name || 'Unknown',
          currentLevel: student.progress?.currentLevel || 1,
          ageBand,
          value: 0,
        };
      }

      const avgAccuracy =
        student.sessions.reduce((sum, session) => sum + (session.accuracy || 0), 0) /
        student.sessions.length;

      return {
        studentId: student.id,
        studentName: student.name || 'Unknown',
        currentLevel: student.progress?.currentLevel || 1,
        ageBand,
        value: Math.round(avgAccuracy * 100) / 100,
      };
    })
    .filter((entry) => entry.value > 0) // Only students with sessions
    .sort((a, b) => b.value - a.value)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  return rankings;
}

/**
 * Calculate consistency ranking within an age band
 * Shows most engaged students by session count
 */
export async function calculateAgeBandConsistencyRanking(ageBand: AgeBand) {
  const students = await prisma.student.findMany({
    where: {
      progress: {
        ageBand,
      },
    },
    include: {
      progress: true,
      sessions: true,
      speakingSessions: true,
    },
  });

  const rankings = students
    .map((student) => ({
      studentId: student.id,
      studentName: student.name || 'Unknown',
      currentLevel: student.progress?.currentLevel || 1,
      ageBand,
      value: student.sessions.length + student.speakingSessions.length,
    }))
    .filter((entry) => entry.value > 0) // Only students with sessions
    .sort((a, b) => b.value - a.value)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  return rankings;
}

/**
 * Calculate level ranking within an age band
 * Shows highest performers by current level
 */
export async function calculateAgeBandLevelRanking(ageBand: AgeBand) {
  const students = await prisma.student.findMany({
    where: {
      progress: {
        ageBand,
      },
    },
    include: {
      progress: true,
    },
  });

  const rankings = students
    .map((student) => ({
      studentId: student.id,
      studentName: student.name || 'Unknown',
      currentLevel: student.progress?.currentLevel || 1,
      ageBand,
      value: student.progress?.currentLevel || 1,
    }))
    .sort((a, b) => {
      // First by level (desc), then by sessions to break ties
      if (b.value !== a.value) return b.value - a.value;
      return b.studentId.localeCompare(a.studentId);
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  return rankings;
}

/**
 * Calculate badge ranking within an age band
 * Shows most achievement-oriented students
 */
export async function calculateAgeBandBadgeRanking(ageBand: AgeBand) {
  const students = await prisma.student.findMany({
    where: {
      progress: {
        ageBand,
      },
    },
    include: {
      progress: true,
      badges: true,
    },
  });

  const rankings = students
    .map((student) => ({
      studentId: student.id,
      studentName: student.name || 'Unknown',
      currentLevel: student.progress?.currentLevel || 1,
      ageBand,
      value: student.badges.length,
    }))
    .filter((entry) => entry.value > 0) // Only students with badges
    .sort((a, b) => b.value - a.value)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  return rankings;
}

/**
 * Get age band leaderboard for a specific type
 * Filters by age band and returns current user's rank
 */
export async function getAgeBandLeaderboard(
  type: 'ACCURACY' | 'CONSISTENCY' | 'LEVEL' | 'BADGES',
  ageBand: AgeBand,
  currentUserId?: string,
  limit: number = 50
): Promise<AgeBandLeaderboardResponse> {
  let rankings: Array<{
    rank: number;
    studentId: string;
    studentName: string;
    currentLevel: number;
    ageBand: AgeBand;
    value: number;
  }> = [];

  switch (type) {
    case 'ACCURACY':
      rankings = await calculateAgeBandAccuracyRanking(ageBand);
      break;
    case 'CONSISTENCY':
      rankings = await calculateAgeBandConsistencyRanking(ageBand);
      break;
    case 'LEVEL':
      rankings = await calculateAgeBandLevelRanking(ageBand);
      break;
    case 'BADGES':
      rankings = await calculateAgeBandBadgeRanking(ageBand);
      break;
  }

  // Apply limit
  const limitedRankings = rankings.slice(0, limit);

  const leaderboard: AgeBandLeaderboardEntry[] = limitedRankings.map((entry) => ({
    rank: entry.rank,
    studentId: entry.studentId,
    studentName: entry.studentName,
    ageBand: entry.ageBand,
    currentLevel: entry.currentLevel,
    value: entry.value,
    metric: getMetricLabel(type),
    trend: 'same', // Could calculate trend if needed
  }));

  let currentUserRank: number | null = null;
  let currentUserValue: number | null = null;
  let currentUserLevel: number | null = null;

  if (currentUserId) {
    const userRanking = rankings.find((r) => r.studentId === currentUserId);
    if (userRanking) {
      currentUserRank = userRanking.rank;
      currentUserValue = userRanking.value;
      currentUserLevel = userRanking.currentLevel;
    }
  }

  const ageBandLabels: Record<AgeBand, string> = {
    '6-8': 'Ages 6-8',
    '9-11': 'Ages 9-11',
    '12-14': 'Ages 12-14',
    '15+': 'Ages 15+',
  };

  return {
    leaderboard,
    currentUserRank,
    currentUserValue,
    currentUserLevel,
    type,
    ageBand,
    ageBandLabel: ageBandLabels[ageBand],
  };
}

/**
 * Get all leaderboards for a student's age band
 * Returns all 4 types in one request
 */
export async function getAllAgeBandLeaderboards(
  ageBand: AgeBand,
  currentUserId?: string,
  limit: number = 10
) {
  const [accuracy, consistency, level, badges] = await Promise.all([
    getAgeBandLeaderboard('ACCURACY', ageBand, currentUserId, limit),
    getAgeBandLeaderboard('CONSISTENCY', ageBand, currentUserId, limit),
    getAgeBandLeaderboard('LEVEL', ageBand, currentUserId, limit),
    getAgeBandLeaderboard('BADGES', ageBand, currentUserId, limit),
  ]);

  return {
    accuracy,
    consistency,
    level,
    badges,
  };
}

/**
 * Get student count in age band
 * Useful for showing "you're competing with X students"
 */
export async function getAgeBandStats(ageBand: AgeBand) {
  const count = await prisma.student.count({
    where: {
      progress: {
        ageBand,
      },
    },
  });

  const avgLevel = await prisma.studentProgress.aggregate({
    where: { ageBand },
    _avg: { currentLevel: true },
    _max: { currentLevel: true },
  });

  const avgAccuracy = await prisma.readingSession.aggregate({
    where: {
      student: {
        progress: {
          ageBand,
        },
      },
      status: 'COMPLETED',
      accuracy: { not: null },
    },
    _avg: { accuracy: true },
  });

  return {
    ageBand,
    totalStudents: count,
    avgLevel: avgLevel._avg.currentLevel || 1,
    maxLevel: avgLevel._max.currentLevel || 3,
    avgAccuracy: avgAccuracy._avg.accuracy || 0,
  };
}

/**
 * Helper: Get metric label for display
 */
function getMetricLabel(type: string): string {
  const labels: Record<string, string> = {
    ACCURACY: 'Reading Accuracy %',
    CONSISTENCY: 'Total Sessions',
    LEVEL: 'Current Level',
    BADGES: 'Badges Earned',
  };
  return labels[type] || type;
}
