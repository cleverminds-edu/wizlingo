import { NextRequest, NextResponse } from 'next/server';
import { generateReferralCode, getReferralCode, trackReferralClick, completeReferral, getReferralStats } from '@/lib/referral-service';
import { trackFunnelStep } from '@/lib/conversion-funnel';

/**
 * POST /api/referrals/generate
 * Generate or get referral code for a student
 */
export async function POST(req: NextRequest) {
  try {
    const { studentId } = await req.json();

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId required' },
        { status: 400 }
      );
    }

    const code = await getReferralCode(studentId);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://wizlingo.app';
    const referralLink = `${appUrl}/r/${code}`;

    // Track the share action
    await trackFunnelStep('share', {
      studentId,
      source: 'referral',
      referralCode: code,
    });

    return NextResponse.json({
      referralCode: code,
      referralLink,
      shortLink: `${appUrl}/r/${code}`,
    });
  } catch (error) {
    console.error('Error generating referral code:', error);
    return NextResponse.json(
      { error: 'Failed to generate referral code' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/referrals/[code]
 * Validate referral code and return school info
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'code required' },
        { status: 400 }
      );
    }

    const result = await trackReferralClick(code);

    if (!result.isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired referral code' },
        { status: 404 }
      );
    }

    // Track landing click
    await trackFunnelStep('landing_click', {
      studentId: result.studentId,
      source: 'referral',
      referralCode: code,
      schoolId: result.schoolId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error validating referral code:', error);
    return NextResponse.json(
      { error: 'Failed to validate referral code' },
      { status: 500 }
    );
  }
}
