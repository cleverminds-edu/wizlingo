'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function PhoneSignupPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(value);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate phone
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send OTP');
        return;
      }

      // Store phone in session storage temporarily
      sessionStorage.setItem('signupPhone', phone);

      // Redirect to OTP verification page
      router.push('/auth/verify-otp');
    } catch (err) {
      setError('Error sending OTP. Please try again.');
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
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Image
                src="/wiziingo-logo.svg"
                alt="WizLingo"
                width={100}
                height={50}
                className="h-12 w-auto drop-shadow-md"
              />
              <span className="absolute -top-2 -right-2 text-xl animate-bounce">✨</span>
            </div>
          </div>
          <p className="text-gray-600 text-sm font-medium">Start your English learning journey</p>
        </div>

        {/* Card */}
        <div className="bg-gradient-to-br from-white via-blue-50/80 to-white rounded-3xl shadow-2xl p-8 border-2 border-blue-100/60 backdrop-blur-sm">
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-1 h-6 bg-gradient-to-b from-yellow-400 to-orange-400 rounded-full"></div>
              <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                Get Started
              </h1>
              <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-cyan-400 rounded-full"></div>
            </div>
            <p className="text-center text-gray-600 text-sm">
              Enter your phone number to begin your 5-minute daily learning sessions
            </p>
          </div>

          <form onSubmit={handleSendOTP} className="space-y-6">
            {/* Phone Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute left-4 top-4 text-gray-700 font-semibold text-lg">
                  +91
                </div>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={handlePhoneChange}
                  disabled={loading}
                  maxLength={10}
                  className="w-full pl-16 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg tracking-wider font-semibold transition-all placeholder:text-gray-400"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                10-digit Indian mobile number
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <p className="text-red-700 text-sm font-medium">⚠️ {error}</p>
              </div>
            )}

            {/* Send OTP Button */}
            <button
              type="submit"
              disabled={loading || phone.length !== 10}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 duration-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending OTP...
                </span>
              ) : (
                '📱 Send OTP'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">or continue with</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          {/* Email Fallback */}
          <button
            onClick={() => router.push('/auth/signup')}
            className="w-full py-3 border-2 border-purple-200 text-purple-700 font-semibold rounded-xl hover:bg-purple-50 transition-all duration-200 flex items-center justify-center gap-2"
          >
            ✉️ Email
          </button>

          {/* Terms */}
          <p className="text-center text-xs text-gray-600 mt-8 leading-relaxed">
            By signing up, you agree to our{' '}
            <a href="/terms" className="text-orange-600 hover:underline font-semibold">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-orange-600 hover:underline font-semibold">
              Privacy Policy
            </a>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-8">
          Already have an account?{' '}
          <a href="/login" className="text-orange-600 hover:underline font-semibold">
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
}
