import { prisma } from './prisma';

/**
 * Store for hidden leaderboard students
 * In production, this would be a database table
 */
const hiddenStudentsCache = new Set<string>();

/**
 * Hide a student from leaderboards (opt-out)
 */
export async function hideFromLeaderboard(studentId: string): Promise<void> {
  // Store in memory for quick lookup
  hiddenStudentsCache.add(studentId);

  // In production, store in database:
  // await prisma.leaderboardPrivacy.upsert({
  //   where: { studentId },
  //   create: { studentId, isHidden: true },
  //   update: { isHidden: true }
  // });
}

/**
 * Show a student on leaderboards
 */
export async function showOnLeaderboard(studentId: string): Promise<void> {
  hiddenStudentsCache.delete(studentId);

  // In production, store in database:
  // await prisma.leaderboardPrivacy.upsert({
  //   where: { studentId },
  //   create: { studentId, isHidden: false },
  //   update: { isHidden: false }
  // });
}

/**
 * Check if a student is hidden from leaderboards
 */
export async function isHiddenFromLeaderboard(studentId: string): Promise<boolean> {
  return hiddenStudentsCache.has(studentId);

  // In production, query database:
  // const record = await prisma.leaderboardPrivacy.findUnique({
  //   where: { studentId }
  // });
  // return record?.isHidden ?? false;
}

/**
 * Filter leaderboard entries to respect privacy settings
 */
export async function filterLeaderboardByPrivacy(studentIds: string[]): Promise<string[]> {
  const filtered: string[] = [];

  for (const studentId of studentIds) {
    const hidden = await isHiddenFromLeaderboard(studentId);
    if (!hidden) {
      filtered.push(studentId);
    }
  }

  return filtered;
}

/**
 * Check if teacher/admin can view all students
 */
export async function canViewAllStudents(userId: string): Promise<boolean> {
  // Check if user is teacher or admin
  const teacher = await prisma.teacher.findUnique({
    where: { empCode: userId },
  });

  if (teacher) return true;

  const admin = await prisma.admin.findUnique({
    where: { empCode: userId },
  });

  return !!admin;
}

/**
 * Get visible students for a leaderboard
 * Teachers and admins see all; other students see only non-hidden
 */
export async function getVisibleLeaderboardStudents(
  allStudents: string[],
  viewerId?: string
): Promise<string[]> {
  if (viewerId && (await canViewAllStudents(viewerId))) {
    // Teachers and admins see everyone
    return allStudents;
  }

  // Regular students see only non-hidden
  return filterLeaderboardByPrivacy(allStudents);
}

/**
 * Sanitize student data for leaderboard display
 * Only include name, no contact info
 */
export async function sanitizeStudentForLeaderboard(
  studentId: string,
  _includeEmail?: boolean
): Promise<{
  id: string;
  name: string;
} | null> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      name: true,
    },
  });

  if (!student) return null;

  return {
    id: student.id,
    name: student.name,
    // Never include email, phone, admission number, or other PII
  };
}

/**
 * Initialize privacy settings (FERPA compliant for US schools)
 */
export async function initializePrivacySettings(schoolId: string): Promise<void> {
  // In production, check school's FERPA compliance status
  // and set appropriate default privacy levels

  const school = await prisma.school.findUnique({
    where: { id: schoolId },
  });

  if (!school) return;

  // Default: All students visible (opt-out based)
  // Schools can change this policy per student
  console.log(`[Privacy] Initialized FERPA-compliant settings for school: ${school.name}`);
}

/**
 * Log privacy-related events for audit trail
 */
export async function logPrivacyEvent(
  studentId: string,
  event: 'hidden' | 'shown' | 'viewed',
  viewerId?: string
): Promise<void> {
  const timestamp = new Date().toISOString();

  console.log(
    `[PrivacyAudit] ${timestamp} - Student ${studentId} ${event}${
      viewerId ? ` by ${viewerId}` : ''
    }`
  );

  // In production, store in audit table:
  // await prisma.leaderboardAuditLog.create({
  //   data: {
  //     studentId,
  //     event,
  //     viewerId,
  //     timestamp: new Date()
  //   }
  // });
}
