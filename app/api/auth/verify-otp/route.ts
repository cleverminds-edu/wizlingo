import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { validateBody, verifyOtpSchema } from '@/lib/validation';
import { getStoredOTP, clearOTP } from '../send-otp/route';

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 failed attempts per 15 minutes per IP
    const clientIp = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
    const rateLimitKey = `otp-verify:${clientIp}`;
    const rateLimitResult = rateLimit(rateLimitKey, RATE_LIMITS.LOGIN.limit, RATE_LIMITS.LOGIN.windowMs);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000).toString() } }
      );
    }

    // Validate request body
    const validation = await validateBody(request, verifyOtpSchema);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { phone, otp } = validation.data;

    // Get stored OTP
    const storedData = getStoredOTP(phone);

    if (!storedData) {
      return NextResponse.json(
        { error: 'No OTP found for this phone number' },
        { status: 400 }
      );
    }

    // Check if OTP expired
    if (Date.now() > storedData.expiresAt) {
      clearOTP(phone);
      return NextResponse.json(
        { error: 'OTP expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check attempts
    if (storedData.attempts >= 3) {
      clearOTP(phone);
      return NextResponse.json(
        { error: 'Too many attempts. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (storedData.code !== otp) {
      storedData.attempts += 1;
      return NextResponse.json(
        { error: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    // OTP verified successfully
    clearOTP(phone);

    return NextResponse.json(
      {
        message: 'OTP verified successfully',
        verified: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
