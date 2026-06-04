import { prisma } from './prisma';

export type FunnelStep = 'share' | 'landing_click' | 'landing_view' | 'signup_start' | 'signup_complete';

interface FunnelMetadata {
  studentId?: string;
  source: string; // referral, direct, organic
  badgeType?: string;
  schoolId?: string;
  referralCode?: string;
  newStudentEmail?: string;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Track a step in the conversion funnel
 */
export async function trackFunnelStep(
  step: FunnelStep,
  metadata: FunnelMetadata
): Promise<void> {
  try {
    await prisma.conversionFunnel.create({
      data: {
        step,
        sourceStudentId: metadata.studentId,
        newStudentEmail: metadata.newStudentEmail,
        referralCode: metadata.referralCode,
        badgeType: metadata.badgeType,
        schoolId: metadata.schoolId,
      },
    });
  } catch (error) {
    // Log but don't throw - we don't want analytics errors to break the app
    console.error('Failed to track funnel step:', error);
  }
}

/**
 * Get funnel stats for a date range
 */
export async function getFunnelStats(startDate?: Date, endDate?: Date) {
  const where = startDate || endDate ? { timestamp: {} } : undefined;

  if (startDate && where) {
    (where.timestamp as any)['gte'] = startDate;
  }
  if (endDate && where) {
    (where.timestamp as any)['lte'] = endDate;
  }

  const funnelData = await prisma.conversionFunnel.findMany({
    where,
  });

  // Calculate conversion rates
  const share = funnelData.filter((f) => f.step === 'share').length;
  const landingClick = funnelData.filter((f) => f.step === 'landing_click').length;
  const landingView = funnelData.filter((f) => f.step === 'landing_view').length;
  const signupStart = funnelData.filter((f) => f.step === 'signup_start').length;
  const signupComplete = funnelData.filter((f) => f.step === 'signup_complete').length;

  return {
    share,
    landingClick,
    landingView,
    signupStart,
    signupComplete,
    shareToClickRate: share > 0 ? ((landingClick / share) * 100).toFixed(2) : 0,
    clickToSignupRate: landingClick > 0 ? ((signupStart / landingClick) * 100).toFixed(2) : 0,
    signupStartToCompleteRate: signupStart > 0 ? ((signupComplete / signupStart) * 100).toFixed(2) : 0,
    overallConversionRate: share > 0 ? ((signupComplete / share) * 100).toFixed(2) : 0,
  };
}

/**
 * Get funnel stats by badge type
 */
export async function getFunnelStatsByBadge(badgeType: string, startDate?: Date, endDate?: Date) {
  const where: any = { badgeType };

  if (startDate) {
    where.timestamp = { gte: startDate };
  }
  if (endDate) {
    where.timestamp = { ...where.timestamp, lte: endDate };
  }

  const funnelData = await prisma.conversionFunnel.findMany({
    where,
  });

  const share = funnelData.filter((f) => f.step === 'share').length;
  const landingClick = funnelData.filter((f) => f.step === 'landing_click').length;
  const signupComplete = funnelData.filter((f) => f.step === 'signup_complete').length;

  return {
    badgeType,
    share,
    landingClick,
    signupComplete,
    shareToClickRate: share > 0 ? ((landingClick / share) * 100).toFixed(2) : 0,
    overallConversionRate: share > 0 ? ((signupComplete / share) * 100).toFixed(2) : 0,
  };
}

/**
 * Get funnel stats by school
 */
export async function getFunnelStatsBySchool(schoolId: string, startDate?: Date, endDate?: Date) {
  const where: any = { schoolId };

  if (startDate) {
    where.timestamp = { gte: startDate };
  }
  if (endDate) {
    where.timestamp = { ...where.timestamp, lte: endDate };
  }

  const funnelData = await prisma.conversionFunnel.findMany({
    where,
  });

  const share = funnelData.filter((f) => f.step === 'share').length;
  const landingClick = funnelData.filter((f) => f.step === 'landing_click').length;
  const signupComplete = funnelData.filter((f) => f.step === 'signup_complete').length;

  return {
    schoolId,
    share,
    landingClick,
    signupComplete,
    shareToClickRate: share > 0 ? ((landingClick / share) * 100).toFixed(2) : 0,
    overallConversionRate: share > 0 ? ((signupComplete / share) * 100).toFixed(2) : 0,
  };
}

/**
 * Get referral success rates
 */
export async function getReferralSuccessStats() {
  const referrals = await prisma.referral.findMany({
    select: {
      referralCode: true,
      status: true,
      createdAt: true,
    },
  });

  const completed = referrals.filter((r) => r.status === 'completed').length;
  const pending = referrals.filter((r) => r.status === 'pending').length;
  const total = referrals.length;

  return {
    totalReferrals: total,
    completedReferrals: completed,
    pendingReferrals: pending,
    completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0,
  };
}

/**
 * Get drop-off analysis by step
 */
export async function getDropOffAnalysis(startDate?: Date, endDate?: Date) {
  const stats = await getFunnelStats(startDate, endDate);

  return {
    shareDropoff: 100, // baseline
    clickDropoff: parseFloat(stats.shareToClickRate as string) || 0,
    signupStartDropoff: parseFloat(stats.clickToSignupRate as string) || 0,
    signupCompleteDropoff: parseFloat(stats.signupStartToCompleteRate as string) || 0,
    overallConversion: parseFloat(stats.overallConversionRate as string) || 0,
  };
}
