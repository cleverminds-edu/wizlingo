import { prisma } from './prisma';

export interface SchoolMetrics {
  totalStudents: number;
  totalBadgesEarned: number;
  grandWizardCount: number;
  avgAccuracy: number;
  avgSessionsPerStudent: number;
  monthlyGrowth: number;
  leaderboardRank: number;
  totalLeaderboardRanks: number;
}

export interface SchoolComparison {
  rank: number;
  totalSchools: number;
  percentile: number;
  nearestRivals: Array<{
    schoolName: string;
    schoolId: string;
    totalBadgesEarned: number;
    grandWizardCount: number;
    avgAccuracy: number;
  }>;
}

/**
 * Get comprehensive metrics for a specific school
 */
export async function getSchoolMetrics(schoolId: string): Promise<SchoolMetrics> {
  // Get all students in the school
  const students = await prisma.student.findMany({
    where: {
      class: {
        schoolId: schoolId,
      },
    },
    include: {
      badges: true,
      sessions: {
        where: {
          status: 'COMPLETED',
        },
      },
      progress: true,
    },
  });

  const totalStudents = students.length;

  // Count total badges
  const totalBadgesEarned = students.reduce(
    (sum, student) => sum + student.badges.length,
    0
  );

  // Count Grand Wizards
  const grandWizardCount = students.filter((student) =>
    student.badges.some((badge) => badge.type === 'GRAND_WIZARD')
  ).length;

  // Calculate average accuracy
  const studentsWithAccuracy = students.filter(
    (student) => student.progress && student.progress.avgAccuracy > 0
  );
  const avgAccuracy =
    studentsWithAccuracy.length > 0
      ? studentsWithAccuracy.reduce(
          (sum, student) => sum + (student.progress?.avgAccuracy || 0),
          0
        ) / studentsWithAccuracy.length
      : 0;

  // Calculate average sessions per student
  const totalSessions = students.reduce(
    (sum, student) => sum + student.sessions.length,
    0
  );
  const avgSessionsPerStudent = totalStudents > 0 ? totalSessions / totalStudents : 0;

  // Calculate monthly growth (new students this month)
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const newStudentsThisMonth = students.filter(
    (student) => new Date(student.createdAt) > oneMonthAgo
  ).length;

  // Get leaderboard position
  const schoolsMetrics = await getAllSchoolsMetrics();
  const leaderboardRank = schoolsMetrics.findIndex(
    (school) => school.schoolId === schoolId
  ) + 1;

  return {
    totalStudents,
    totalBadgesEarned,
    grandWizardCount,
    avgAccuracy: Math.round(avgAccuracy * 100) / 100,
    avgSessionsPerStudent: Math.round(avgSessionsPerStudent * 100) / 100,
    monthlyGrowth: newStudentsThisMonth,
    leaderboardRank: leaderboardRank || 0,
    totalLeaderboardRanks: schoolsMetrics.length,
  };
}

/**
 * Get all schools ranked by badges earned
 */
export async function getAllSchoolsMetrics(): Promise<
  Array<{
    schoolId: string;
    schoolName: string;
    totalBadgesEarned: number;
    totalStudents: number;
    grandWizardCount: number;
    avgAccuracy: number;
    avgSessionsPerStudent: number;
  }>
> {
  const schools = await prisma.school.findMany({
    include: {
      classes: {
        include: {
          students: {
            include: {
              badges: true,
              sessions: {
                where: {
                  status: 'COMPLETED',
                },
              },
              progress: true,
            },
          },
        },
      },
    },
  });

  const metrics = schools
    .map((school) => {
      const allStudents = school.classes.flatMap((c) => c.students);
      const totalStudents = allStudents.length;
      const totalBadgesEarned = allStudents.reduce(
        (sum, student) => sum + student.badges.length,
        0
      );
      const grandWizardCount = allStudents.filter((student) =>
        student.badges.some((badge) => badge.type === 'GRAND_WIZARD')
      ).length;

      const studentsWithAccuracy = allStudents.filter(
        (student) => student.progress && student.progress.avgAccuracy > 0
      );
      const avgAccuracy =
        studentsWithAccuracy.length > 0
          ? studentsWithAccuracy.reduce(
              (sum, student) => sum + (student.progress?.avgAccuracy || 0),
              0
            ) / studentsWithAccuracy.length
          : 0;

      const totalSessions = allStudents.reduce(
        (sum, student) => sum + student.sessions.length,
        0
      );
      const avgSessionsPerStudent = totalStudents > 0 ? totalSessions / totalStudents : 0;

      return {
        schoolId: school.id,
        schoolName: school.name,
        totalBadgesEarned,
        totalStudents,
        grandWizardCount,
        avgAccuracy: Math.round(avgAccuracy * 100) / 100,
        avgSessionsPerStudent: Math.round(avgSessionsPerStudent * 100) / 100,
      };
    })
    .sort((a, b) => {
      // Sort by total badges earned (primary), then by Grand Wizard count (secondary)
      if (b.totalBadgesEarned !== a.totalBadgesEarned) {
        return b.totalBadgesEarned - a.totalBadgesEarned;
      }
      return b.grandWizardCount - a.grandWizardCount;
    });

  return metrics;
}

/**
 * Get school comparison data
 */
export async function getSchoolComparison(schoolId: string): Promise<SchoolComparison> {
  const schoolsMetrics = await getAllSchoolsMetrics();
  const schoolIndex = schoolsMetrics.findIndex(
    (school) => school.schoolId === schoolId
  );

  const rank = schoolIndex + 1;
  const totalSchools = schoolsMetrics.length;
  const percentile = Math.round(((totalSchools - rank + 1) / totalSchools) * 100);

  // Get 2 schools above and 2 below
  const nearbyIndices = [
    Math.max(0, schoolIndex - 2),
    Math.max(0, schoolIndex - 1),
    Math.min(totalSchools - 1, schoolIndex + 1),
    Math.min(totalSchools - 1, schoolIndex + 2),
  ].filter((idx) => idx !== schoolIndex);

  const nearestRivals = nearbyIndices.map((idx) => ({
    schoolName: schoolsMetrics[idx].schoolName,
    schoolId: schoolsMetrics[idx].schoolId,
    totalBadgesEarned: schoolsMetrics[idx].totalBadgesEarned,
    grandWizardCount: schoolsMetrics[idx].grandWizardCount,
    avgAccuracy: schoolsMetrics[idx].avgAccuracy,
  }));

  return {
    rank,
    totalSchools,
    percentile,
    nearestRivals,
  };
}

/**
 * Get school leaderboard entries with filtering and sorting
 */
export async function getSchoolLeaderboard(options?: {
  sortBy?: 'badges' | 'grandwizards' | 'accuracy' | 'growth';
  limit?: number;
  region?: string;
}) {
  const allMetrics = await getAllSchoolsMetrics();

  let sorted = [...allMetrics];

  // Sort based on criteria
  switch (options?.sortBy) {
    case 'grandwizards':
      sorted.sort((a, b) => {
        if (b.grandWizardCount !== a.grandWizardCount) {
          return b.grandWizardCount - a.grandWizardCount;
        }
        return b.totalBadgesEarned - a.totalBadgesEarned;
      });
      break;
    case 'accuracy':
      sorted.sort((a, b) => b.avgAccuracy - a.avgAccuracy);
      break;
    case 'growth':
      // TODO: Calculate growth from snapshots
      break;
    case 'badges':
    default:
      sorted.sort((a, b) => {
        if (b.totalBadgesEarned !== a.totalBadgesEarned) {
          return b.totalBadgesEarned - a.totalBadgesEarned;
        }
        return b.grandWizardCount - a.grandWizardCount;
      });
  }

  const limit = options?.limit || 50;
  return sorted.slice(0, limit).map((school, index) => ({
    ...school,
    rank: index + 1,
  }));
}

/**
 * Save a leaderboard snapshot for monthly tracking
 */
export async function saveLeaderboardSnapshot(): Promise<void> {
  const allMetrics = await getAllSchoolsMetrics();

  await Promise.all(
    allMetrics.map((school, index) =>
      prisma.schoolLeaderboardSnapshot.create({
        data: {
          schoolId: school.schoolId,
          rank: index + 1,
          totalStudents: school.totalStudents,
          totalBadgesEarned: school.totalBadgesEarned,
          grandWizardCount: school.grandWizardCount,
          avgAccuracy: school.avgAccuracy,
          avgSessionsPerStudent: school.avgSessionsPerStudent,
          monthlyGrowth: 0, // TODO: Calculate based on previous month
          takenAt: new Date(),
        },
      })
    )
  );
}
