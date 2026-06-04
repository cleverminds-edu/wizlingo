import { prisma } from './prisma';
import { randomBytes } from 'crypto';

/**
 * Generate a unique referral code for a student
 */
export async function generateReferralCode(studentId: string): Promise<string> {
  // Generate a short, URL-friendly code
  const code = randomBytes(6).toString('hex').toUpperCase();

  const referral = await prisma.referral.create({
    data: {
      referrerId: studentId,
      referralCode: code,
      status: 'pending',
    },
  });

  return referral.referralCode;
}

/**
 * Get or create referral code for a student
 */
export async function getReferralCode(studentId: string): Promise<string> {
  const existing = await prisma.referral.findFirst({
    where: {
      referrerId: studentId,
      status: { in: ['pending', 'completed'] },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (existing) {
    return existing.referralCode;
  }

  return generateReferralCode(studentId);
}

/**
 * Get full referral link for a student
 */
export async function getReferralLink(studentId: string, appUrl: string = 'https://wizlingo.app'): Promise<string> {
  const code = await getReferralCode(studentId);
  return `${appUrl}/r/${code}`;
}

/**
 * Validate and get info from a referral code
 */
export async function trackReferralClick(code: string): Promise<{
  isValid: boolean;
  schoolId?: string;
  studentId?: string;
  code?: string;
}> {
  const referral = await prisma.referral.findUnique({
    where: { referralCode: code },
    include: {
      referrer: {
        include: { class: true },
      },
    },
  });

  if (!referral || referral.status === 'expired') {
    return { isValid: false };
  }

  return {
    isValid: true,
    schoolId: referral.referrer.class?.schoolId,
    studentId: referral.referrerId,
    code: referral.referralCode,
  };
}

/**
 * Complete a referral when a new student signs up
 */
export async function completeReferral(code: string, newStudentId: string): Promise<void> {
  const referral = await prisma.referral.findUnique({
    where: { referralCode: code },
  });

  if (!referral || referral.status === 'expired') {
    throw new Error('Invalid or expired referral code');
  }

  // Update referral status and link new student
  await prisma.referral.update({
    where: { referralCode: code },
    data: {
      referredId: newStudentId,
      status: 'completed',
      completedAt: new Date(),
    },
  });

  // Award referral reward to the referrer
  await awardReferralReward(referral.referrerId, 1);
}

/**
 * Get referral stats for a student
 */
export async function getReferralStats(
  studentId: string
): Promise<{ count: number; rewardsEarned: string[] }> {
  const reward = await prisma.referralReward.findUnique({
    where: { studentId },
  });

  return {
    count: reward?.referralCount ?? 0,
    rewardsEarned: reward?.badgeColorVariantsUnlocked ?? [],
  };
}

/**
 * Award referral reward to a student
 */
export async function awardReferralReward(
  studentId: string,
  newReferralCount: number
): Promise<void> {
  let reward = await prisma.referralReward.findUnique({
    where: { studentId },
  });

  if (!reward) {
    reward = await prisma.referralReward.create({
      data: {
        studentId,
        referralCount: newReferralCount,
      },
    });
  } else {
    reward = await prisma.referralReward.update({
      where: { studentId },
      data: {
        referralCount: newReferralCount,
      },
    });
  }

  // Determine unlocked variants based on referral count
  const unlockedVariants: string[] = [];

  if (newReferralCount >= 1) {
    unlockedVariants.push('gold');
  }
  if (newReferralCount >= 2) {
    unlockedVariants.push('silver');
  }
  if (newReferralCount >= 3) {
    unlockedVariants.push('rainbow');
  }
  if (newReferralCount >= 5) {
    unlockedVariants.push('glow');
  }
  if (newReferralCount >= 10) {
    unlockedVariants.push('diamond');
  }

  await prisma.referralReward.update({
    where: { studentId },
    data: {
      badgeColorVariantsUnlocked: unlockedVariants,
    },
  });
}

/**
 * Get referral count for a student
 */
export async function getReferralCount(studentId: string): Promise<number> {
  const completedReferrals = await prisma.referral.count({
    where: {
      referrerId: studentId,
      status: 'completed',
    },
  });

  return completedReferrals;
}

/**
 * Get referral link with school context for landing pages
 */
export async function getReferralLinkWithSchool(
  studentId: string,
  appUrl: string = 'https://wizlingo.app'
): Promise<{
  link: string;
  code: string;
  schoolId?: string;
}> {
  const code = await getReferralCode(studentId);

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      class: true,
    },
  });

  return {
    link: `${appUrl}/r/${code}`,
    code,
    schoolId: student?.class?.schoolId,
  };
}
