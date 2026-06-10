import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { validateBody, sendOtpSchema } from '@/lib/validation';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

// In-memory storage for OTPs (use Redis in production)
const otpStore: Record<string, { code: string; expiresAt: number; attempts: number }> = {};

// Initialize AWS SNS client
const snsClient = new SNSClient({
  region: process.env.AWS_SNS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Generate random 4-digit OTP (matching frontend validation)
function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 requests per 15 minutes per phone number
    const clientIp = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
    const rateLimitKey = `otp:${clientIp}`;
    const rateLimitResult = rateLimit(rateLimitKey, RATE_LIMITS.OTP.limit, RATE_LIMITS.OTP.windowMs);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many OTP requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000).toString() } }
      );
    }

    // Validate request body
    const validation = await validateBody(request, sendOtpSchema);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { phone } = validation.data;

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStore[phone] = {
      code: otp,
      expiresAt,
      attempts: 0,
    };

    // Send OTP via SMS
    try {
      // Format phone number for AWS SNS (must include country code)
      const phoneNumber = phone.startsWith('+') ? phone : `+91${phone}`;

      const command = new PublishCommand({
        Message: `Your WizLingo OTP is: ${otp}. Valid for 10 minutes. Powered by Edvanta Intelligence System.`,
        PhoneNumber: phoneNumber,
      });

      await snsClient.send(command);
      console.log(`[SMS] OTP sent to ${phoneNumber}`);
    } catch (smsError) {
      // Log SMS error but don't fail the request
      console.error('[SMS Error]', smsError);
      // For development, log to console
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV Fallback] OTP for ${phone}: ${otp}`);
      }
    }

    return NextResponse.json(
      { message: 'OTP sent successfully', otp: process.env.NODE_ENV === 'development' ? otp : undefined },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}

// Export for use in verify-otp endpoint
export function getStoredOTP(phone: string) {
  return otpStore[phone];
}

export function clearOTP(phone: string) {
  delete otpStore[phone];
}
