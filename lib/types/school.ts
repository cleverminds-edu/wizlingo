/**
 * School-related type definitions for B2B competitive features
 */

export type SchoolTier = 'FREE' | 'STARTER' | 'GROWTH' | 'ENTERPRISE';

export interface SchoolLeaderboardEntry {
  schoolId: string;
  schoolName: string;
  totalBadgesEarned: number;
  totalStudents: number;
  grandWizardCount: number;
  avgAccuracy: number;
  avgSessionsPerStudent: number;
  rank: number;
}

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

export interface SchoolAdminRequest {
  schoolId: string;
  adminId: string;
  role: 'admin' | 'manager' | 'principal';
}

export interface SchoolInviteRequest {
  schoolId: string;
  email: string;
  role: 'teacher' | 'principal';
}

export interface SchoolReportData {
  schoolName: string;
  generatedAt: Date;
  period: {
    startDate: Date;
    endDate: Date;
  };
  metrics: SchoolMetrics;
  studentList: Array<{
    studentId: string;
    studentName: string;
    badgeCount: number;
    avgAccuracy: number;
    sessionsCompleted: number;
  }>;
  leaderboardPosition: SchoolComparison;
}
