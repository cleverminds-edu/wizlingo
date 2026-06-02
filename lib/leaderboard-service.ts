import { prisma } from './prisma';
import type { LeaderboardType } from '@/app/generated/prisma';

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  value: number;
  badges: string[];
  trend: 'up' | 'down' | 'same';
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  currentUserRank: number | null;
  currentUserValue: number | null;
  type: LeaderboardType;
  scope: string;
}

/**
 * Calculate badge count ranking for a given scope
 */
export async function calculateBadgeCountRanking(scope: string) {
  const students = await prisma.student.findMany({
    where: getStudentFilter(scope),
    include: {
      badges: true,
      class: true,
    },
  });

  const rankings = students
    .map((student) => ({
      studentId: student.id,
      studentName: student.name,
      value: student.badges.length,
    }))
    .sort((a, b) => b.value - a.value)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  return rankings;
}

/**
 * Calculate speed ranking (days to earn SPARK badge)
 */
export async function calculateSpeedRanking(scope: string) {
  const students = await prisma.student.findMany({
    where: getStudentFilter(scope),
    include: {
      badges: true,
      sessions: {
        orderBy: { createdAt: 'asc' },
        take: 1,
      },
    },
  });

  const rankings = students
    .map((student) => {
      const sparkBadge = student.badges.find((b) => b.type === 'SPARK');
      const firstSession = student.sessions[0];

      if (!sparkBadge || !firstSession) {
        return {
          studentId: student.id,
          studentName: student.name,
          value: 999999, // Never earned, last place
        };
      }

      const daysTaken = Math.floor(
        (sparkBadge.earnedAt.getTime() - firstSession.createdAt.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      return {
        studentId: student.id,
        studentName: student.name,
        value: daysTaken,
      };
    })
    .sort((a, b) => a.value - b.value) // Lower is better for speed
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  return rankings;
}

/**
 * Calculate consistency ranking (total sessions)
 */
export async function calculateConsistencyRanking(scope: string) {
  const students = await prisma.student.findMany({
    where: getStudentFilter(scope),
    include: {
      sessions: true,
      speakingSessions: true,
    },
  });

  const rankings = students
    .map((student) => ({
      studentId: student.id,
      studentName: student.name,
      value: student.sessions.length + student.speakingSessions.length,
    }))
    .sort((a, b) => b.value - a.value)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  return rankings;
}

/**
 * Calculate accuracy ranking (average reading accuracy)
 */
export async function calculateAccuracyRanking(scope: string) {
  const students = await prisma.student.findMany({
    where: getStudentFilter(scope),
    include: {
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
          studentName: student.name,
          value: 0,
        };
      }

      const avgAccuracy =
        student.sessions.reduce((sum, session) => sum + (session.accuracy || 0), 0) /
        student.sessions.length;

      return {
        studentId: student.id,
        studentName: student.name,
        value: Math.round(avgAccuracy * 100) / 100,
      };
    })
    .sort((a, b) => b.value - a.value)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  return rankings;
}

/**
 * Calculate fluency ranking (average speaking fluency)
 */
export async function calculateFluencyRanking(scope: string) {
  const students = await prisma.student.findMany({
    where: getStudentFilter(scope),
    include: {
      speakingSessions: {
        where: {
          status: 'COMPLETED',
          fluencyScore: { not: null },
        },
      },
    },
  });

  const rankings = students
    .map((student) => {
      if (student.speakingSessions.length === 0) {
        return {
          studentId: student.id,
          studentName: student.name,
          value: 0,
        };
      }

      const avgFluency =
        student.speakingSessions.reduce((sum, session) => sum + (session.fluencyScore || 0), 0) /
        student.speakingSessions.length;

      return {
        studentId: student.id,
        studentName: student.name,
        value: Math.round(avgFluency * 100) / 100,
      };
    })
    .sort((a, b) => b.value - a.value)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  return rankings;
}

/**
 * Calculate trend (comparison with previous day)
 */
async function getTrend(
  type: LeaderboardType,
  scope: string,
  studentId: string
): Promise<'up' | 'down' | 'same'> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todaySnapshot = await prisma.leaderboardSnapshot.findFirst({
    where: {
      type,
      scope,
      studentId,
      takenAt: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    },
  });

  const yesterdaySnapshot = await prisma.leaderboardSnapshot.findFirst({
    where: {
      type,
      scope,
      studentId,
      takenAt: {
        gte: yesterday,
        lt: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000),
      },
    },
  });

  if (!yesterdaySnapshot) return 'same';
  if (!todaySnapshot) return 'same';

  if (todaySnapshot.rank < yesterdaySnapshot.rank) return 'up';
  if (todaySnapshot.rank > yesterdaySnapshot.rank) return 'down';
  return 'same';
}

/**
 * Get badges for a student
 */
async function getStudentBadges(studentId: string): Promise<string[]> {
  const badges = await prisma.badge.findMany({
    where: { studentId },
  });

  return badges.map((b) => {
    const badgeNames: Record<string, string> = {
      SPARK: '⚡ SPARK',
      WORD_WIZARD: '📚 Word Wizard',
      VOICE_WIZARD: '🎤 Voice Wizard',
      LANGUAGE_WIZARD: '🌐 Language Wizard',
      GRAND_WIZARD: '👑 Grand Wizard',
    };
    return badgeNames[b.type] || b.type;
  });
}

/**
 * Update all leaderboards (runs nightly)
 */
export async function updateLeaderboards() {
  const scopes = ['all'];

  // Add class scopes
  const classes = await prisma.class.findMany();
  scopes.push(...classes.map((c) => `class_${c.id}`));

  // Add school scopes
  const schools = await prisma.school.findMany();
  scopes.push(...schools.map((s) => `school_${s.id}`));

  const leaderboardTypes: LeaderboardType[] = [
    'BADGE_COUNT',
    'SPEED',
    'CONSISTENCY',
    'ACCURACY',
    'FLUENCY',
  ];

  for (const type of leaderboardTypes) {
    for (const scope of scopes) {
      let rankings: Array<{
        studentId: string;
        studentName: string;
        value: number;
        rank: number;
      }> = [];

      switch (type) {
        case 'BADGE_COUNT':
          rankings = await calculateBadgeCountRanking(scope);
          break;
        case 'SPEED':
          rankings = await calculateSpeedRanking(scope);
          break;
        case 'CONSISTENCY':
          rankings = await calculateConsistencyRanking(scope);
          break;
        case 'ACCURACY':
          rankings = await calculateAccuracyRanking(scope);
          break;
        case 'FLUENCY':
          rankings = await calculateFluencyRanking(scope);
          break;
      }

      // Store in Leaderboard table
      for (const entry of rankings) {
        // Save current snapshot
        const trend = await getTrend(type, scope, entry.studentId);

        await prisma.leaderboard.upsert({
          where: {
            type_scope_studentId: {
              type,
              scope,
              studentId: entry.studentId,
            },
          },
          create: {
            type,
            scope,
            studentId: entry.studentId,
            rank: entry.rank,
            value: entry.value,
          },
          update: {
            rank: entry.rank,
            value: entry.value,
          },
        });

        // Save snapshot for trend calculation
        await prisma.leaderboardSnapshot.create({
          data: {
            type,
            scope,
            studentId: entry.studentId,
            rank: entry.rank,
            value: entry.value,
            trend,
          },
        });
      }
    }
  }

  console.log(`[${new Date().toISOString()}] Leaderboards updated successfully`);
}

/**
 * Get leaderboard data for display
 */
export async function getLeaderboard(
  type: LeaderboardType,
  scope: string,
  currentUserId?: string,
  limit: number = 100
): Promise<LeaderboardResponse> {
  const entries = await prisma.leaderboard.findMany({
    where: { type, scope },
    orderBy: { rank: 'asc' },
    take: limit,
  });

  const leaderboard: LeaderboardEntry[] = [];

  for (const entry of entries) {
    const student = await prisma.student.findUnique({
      where: { id: entry.studentId },
    });

    if (!student) continue;

    const badges = await getStudentBadges(entry.studentId);
    const trend = await getTrend(type, scope, entry.studentId);

    leaderboard.push({
      rank: entry.rank,
      studentId: entry.studentId,
      studentName: student.name,
      value: entry.value,
      badges,
      trend,
    });
  }

  let currentUserRank: number | null = null;
  let currentUserValue: number | null = null;

  if (currentUserId) {
    const userEntry = await prisma.leaderboard.findUnique({
      where: {
        type_scope_studentId: {
          type,
          scope,
          studentId: currentUserId,
        },
      },
    });

    if (userEntry) {
      currentUserRank = userEntry.rank;
      currentUserValue = userEntry.value;
    }
  }

  return {
    leaderboard,
    currentUserRank,
    currentUserValue,
    type,
    scope,
  };
}

/**
 * Get student filter based on scope
 */
function getStudentFilter(scope: string) {
  if (scope === 'all') {
    return {};
  }

  if (scope.startsWith('class_')) {
    const classId = scope.replace('class_', '');
    return { classId };
  }

  if (scope.startsWith('school_')) {
    const schoolId = scope.replace('school_', '');
    return { class: { schoolId } };
  }

  return {};
}
