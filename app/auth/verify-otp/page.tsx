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
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 30%, #f0f4ff 60%, #e0e7ff 100%)" }}>
      {/* Animated background shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/15 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-cyan-400/15 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center gap-2 mb-6 p-3 bg-gradient-to-r from-orange-100 to-purple-100 rounded-full">
            <span className="text-3xl">✨</span>
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
              WizLingo
            </div>
          </div>
          <p className="text-gray-600 text-sm font-medium">Verify your phone number</p>
        </div>

        {/* Card */}
        <div className="bg-gradient-to-br from-white via-blue-50/80 to-white rounded-3xl shadow-2xl p-8 border-2 border-blue-100/60 backdrop-blur-sm">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-center mb-3 bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
              Verify OTP
            </h1>
            <p className="text-center text-gray-600 text-sm">
              We've sent a 6-digit code to <br />
              <span className="font-semibold text-gray-900">+91 {phone}</span>
            </p>
          </div>

          <div className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                6-Digit Code
              </label>
              <input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={handleOtpChange}
                disabled={loading}
                maxLength={6}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-4xl font-bold tracking-widest transition-all"
              />
              <p className="text-xs text-gray-500 mt-2">
                Auto-submits when complete
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <p className="text-red-700 text-sm font-medium">⚠️ {error}</p>
              </div>
            )}

            {/* Verify Button */}
            <button
              onClick={() => handleVerifyOTP()}
              disabled={loading || otp.length !== 6}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 duration-200"
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
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">Didn't receive code?</p>
              {canResend ? (
                <button
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-orange-600 hover:underline font-semibold text-sm disabled:opacity-50"
                >
                  🔄 Resend OTP
                </button>
              ) : (
                <p className="text-orange-600 font-semibold text-sm">
                  Resend in {resendTimer}s
                </p>
              )}
            </div>
          </div>

          {/* Change Phone */}
          <div className="text-center pt-6">
            <button
              onClick={() => router.push('/auth/phone-signup')}
              className="text-sm text-gray-600 hover:text-orange-600 font-medium transition-colors"
            >
              ↩️ Wrong number? Change phone
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
