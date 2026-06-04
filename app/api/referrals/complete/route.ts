import { NextRequest, NextResponse } from 'next/server';
import { completeReferral } from '@/lib/referral-service';
import { trackFunnelStep } from '@/lib/conversion-funnel';

/**
 * POST /api/referrals/complete
 * Mark a referral as completed when new student signs up
 */
export async function POST(req: NextRequest) {
  try {
    const { referralCode, newStudentId, newStudentEmail } = await req.json();

    if (!referralCode || !newStudentId) {
      return NextResponse.json(
        { error: 'referralCode and newStudentId required' },
        { status: 400 }
      );
    }

    // Complete the referral
    await completeReferral(referralCode, newStudentId);

    // Track signup completion
    await trackFunnelStep('signup_complete', {
      studentId: newStudentId,
      newStudentEmail,
      referralCode,
      source: 'referral',
    });

    return NextResponse.json({
      success: true,
      message: 'Referral completed successfully',
    });
  } catch (error) {
    console.error('Error completing referral:', error);
    return NextResponse.json(
      { error: 'Failed to complete referral' },
      { status: 500 }
    );
  }
}
