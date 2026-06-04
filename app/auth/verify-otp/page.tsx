'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyOTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Get phone from session storage
    const savedPhone = sessionStorage.getItem('signupPhone');
    if (!savedPhone) {
      router.push('/auth/phone-signup');
      return;
    }
    setPhone(savedPhone);
  }, [router]);

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0 && !canResend) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [resendTimer, canResend]);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);

    // Auto-submit when 6 digits entered
    if (value.length === 6) {
      handleVerifyOTP(value);
    }
  };

  const handleVerifyOTP = async (otpValue: string = otp) => {
    setError('');

    if (otpValue.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: otpValue }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid OTP');
        setOtp('');
        return;
      }

      // Store phone and proceed to profile creation
      sessionStorage.setItem('verifiedPhone', phone);
      router.push('/auth/create-profile');
    } catch (err) {
      setError('Error verifying OTP. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setLoading(true);
    setCanResend(false);
    setResendTimer(60);
    setError('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      if (!response.ok) {
        setError('Failed to resend OTP');
        setCanResend(true);
        return;
      }

      // OTP sent successfully
    } catch (err) {
      setError('Error resending OTP');
      setCanResend(true);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="text-4xl font-bold">
              <span className="text-orange-500">Wiz</span>
              <span className="text-purple-600">Lingo</span>
            </div>
          </div>
          <p className="text-gray-600 text-sm">Verify Your Phone</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-2 text-gray-900">
            Enter OTP
          </h1>
          <p className="text-center text-gray-600 mb-6">
            We've sent a 6-digit code to{' '}
            <span className="font-semibold">+91 {phone}</span>
          </p>

          <div className="space-y-4">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={handleOtpChange}
                disabled={loading}
                maxLength={6}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-center text-3xl font-bold tracking-widest"
              />
              <p className="text-xs text-gray-500 mt-1">
                Auto-submits when you enter 6 digits
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Verify Button */}
            <button
              onClick={() => handleVerifyOTP()}
              disabled={loading || otp.length !== 6}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : (
                'Verify'
              )}
            </button>

            {/* Resend OTP */}
            <div className="text-center">
              <p className="text-sm text-gray-600">Didn't receive code?</p>
              {canResend ? (
                <button
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-orange-500 hover:underline font-medium text-sm mt-1 disabled:opacity-50"
                >
                  Resend OTP
                </button>
              ) : (
                <p className="text-orange-500 font-medium text-sm mt-1">
                  Resend in {resendTimer}s
                </p>
              )}
            </div>
          </div>

          {/* Change Phone */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/auth/phone-signup')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Wrong number? Change phone
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
