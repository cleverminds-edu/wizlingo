import { NextRequest, NextResponse } from 'next/server';

// In production, use Twilio or another SMS service
// For now, this is a mock implementation
// Install: npm install twilio
// Then uncomment the Twilio code below

/*
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
const client = twilio(accountSid, authToken);
*/

// In-memory storage for OTPs (use Redis in production)
const otpStore: Record<string, { code: string; expiresAt: number; attempts: number }> = {};

// Generate random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    // Validate phone
    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStore[phone] = {
      code: otp,
      expiresAt,
      attempts: 0,
    };

    // In production, send via Twilio:
    /*
    await client.messages.create({
      body: `Your WizLingo verification code is: ${otp}. Valid for 10 minutes.`,
      from: twilioPhone,
      to: `+91${phone}`,
    });
    */

    // For development, log the OTP (remove in production)
    console.log(`[DEV] OTP for ${phone}: ${otp}`);

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
