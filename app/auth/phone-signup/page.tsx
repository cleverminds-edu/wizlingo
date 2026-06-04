'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function PhoneSignupPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits, max 10
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(value);
    // Validate phone number
    setIsValid(value.length === 10);
  };

  const formatPhoneDisplay = (value: string) => {
    if (!value) return '';
    if (value.length <= 5) return value;
    if (value.length <= 9) return `${value.slice(0, 5)} ${value.slice(5)}`;
    return `${value.slice(0, 5)} ${value.slice(5, 10)}`;
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
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #1a1a2e 50%, #16213e 75%, #0f172a 100%)" }}>
      {/* Animated background shapes - more vibrant */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-yellow-400/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-400/15 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-400/15 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1.5s' }}></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="relative">
              <Image
                src="/wiziingo-logo.svg"
                alt="WizLingo"
                width={100}
                height={50}
                className="h-12 w-auto drop-shadow-lg"
              />
              <span className="absolute -top-2 -right-2 text-xl animate-bounce">✨</span>
            </div>
          </div>
          <p className="text-white text-xs font-semibold uppercase tracking-widest">AI English Learning Platform</p>
        </div>

        {/* Trust & Social Proof - Compact Row */}
        <div className="flex justify-center gap-3 mb-6 text-xs">
          <div className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white font-semibold">🔒 Encrypted</div>
          <div className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white font-semibold">✅ 1000+ Students</div>
          <div className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white font-semibold">⭐ 4.8</div>
        </div>

        {/* Card */}
        <div className="bg-gradient-to-br from-white/95 to-blue-50/95 rounded-3xl shadow-2xl p-8 border-2 border-white/30 backdrop-blur-xl">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Get Started
          </h1>
          <p className="text-center text-gray-600 text-sm mb-6">
            Master English in just 5 minutes daily
          </p>

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
                  value={formatPhoneDisplay(phone)}
                  onChange={handlePhoneChange}
                  disabled={loading}
                  maxLength={11}
                  className={`w-full pl-16 pr-12 py-4 border-2 rounded-xl focus:outline-none focus:border-transparent text-lg tracking-wider font-semibold transition-all placeholder:text-gray-400 ${
                    isValid ? 'border-green-400 focus:ring-2 focus:ring-green-500' : 'border-gray-200 focus:ring-2 focus:ring-orange-500'
                  }`}
                />
                {isValid && <span className="absolute right-4 top-4 text-green-600 text-xl">✓</span>}
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
                  Sending OTP to +91 {phone}...
                </span>
              ) : isValid ? (
                '✨ Send OTP'
              ) : (
                '📱 Send OTP'
              )}
            </button>

            {/* Ready indicator */}
            {isValid && !loading && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-xs text-green-700 font-semibold">✅ Ready to send!</p>
              </div>
            )}
          </form>

          {/* Divider & Email */}
          <div className="flex items-center gap-2 my-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-400 text-xs">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <button
            onClick={() => router.push('/auth/signup')}
            className="w-full py-2.5 border-2 border-purple-200 text-purple-700 font-semibold rounded-xl hover:bg-purple-50 text-sm transition-all"
          >
            ✉️ Email
          </button>

          {/* Legal */}
          <p className="text-center text-xs text-gray-500 mt-4">
            By signing up, you agree to our <a href="/terms" className="text-orange-600 hover:underline">Terms</a> and <a href="/privacy" className="text-orange-600 hover:underline">Privacy</a>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-white/70 text-xs mt-4">
          Already have an account? <a href="/login" className="text-yellow-300 hover:underline font-semibold">Sign in</a>
        </p>
      </div>
    </div>
  );
}
