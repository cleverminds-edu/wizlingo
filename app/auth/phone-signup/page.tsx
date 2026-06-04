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
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 30%, #f0f4ff 60%, #e0e7ff 100%)" }}>
      {/* Animated background shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/15 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-cyan-400/15 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md relative z-10">
        {/* Progress Indicator */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">1</div>
            <div className="w-12 h-1 bg-gray-300"></div>
            <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-xs font-bold">2</div>
            <div className="w-12 h-1 bg-gray-300"></div>
            <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-xs font-bold">3</div>
          </div>
          <p className="text-xs text-gray-500 font-medium">Phone → OTP → Profile</p>
        </div>

        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
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

        {/* Trust & Social Proof Section */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 text-center border border-green-100">
            <p className="text-xs text-green-700 font-semibold">🔒 Encrypted</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 text-center border border-blue-100">
            <p className="text-xs text-blue-700 font-semibold">✅ No Password</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-3 text-center border border-purple-100">
            <p className="text-xs text-purple-700 font-semibold">⚡ 2 Minutes</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-3 text-center border border-yellow-100">
            <p className="text-xs text-orange-700 font-semibold">⭐ 4.8 Rating</p>
          </div>
        </div>

        {/* Social Proof Banner */}
        <div className="bg-gradient-to-r from-orange-100 to-purple-100 rounded-lg p-3 text-center mb-6 border border-orange-200">
          <p className="text-xs text-gray-700"><span className="font-bold">✅ Join 1000+ students</span> already learning daily</p>
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
          </div>

          {/* Benefit Bullets */}
          <div className="space-y-2 mb-6 bg-gradient-to-r from-orange-50 to-purple-50 p-4 rounded-xl border border-orange-100">
            <p className="text-xs text-gray-700"><span className="text-orange-600 font-bold">✓</span> 7-day free trial, no card needed</p>
            <p className="text-xs text-gray-700"><span className="text-orange-600 font-bold">✓</span> Start learning in 5 minutes</p>
            <p className="text-xs text-gray-700"><span className="text-orange-600 font-bold">✓</span> AI adapts to your learning level</p>
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
                <p className="text-xs text-green-700 font-semibold">✅ Ready to send! You'll receive OTP in 30 seconds</p>
              </div>
            )}
          </form>

          {/* FAQ Section */}
          <div className="mt-8 pt-6 border-t border-gray-200 space-y-2">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Common questions</p>

            {[
              {
                q: "Why do you need my phone number?",
                a: "For secure account access and daily learning reminders via SMS."
              },
              {
                q: "Is my data safe?",
                a: "Yes! Your data is encrypted and protected. We never share your info with third parties."
              },
              {
                q: "Can I cancel anytime?",
                a: "Absolutely! No lock-in contracts. Cancel in one click from your account."
              }
            ].map((item, idx) => (
              <details key={idx} className="group rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all">
                <summary className="flex cursor-pointer items-center justify-between p-3 font-medium text-gray-900 text-sm hover:text-orange-600">
                  {item.q}
                  <span className="transition group-open:rotate-180">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </span>
                </summary>
                <div className="border-t border-gray-200 px-3 py-3 text-xs text-gray-600 bg-white">
                  {item.a}
                </div>
              </details>
            ))}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6 pt-2">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">or</span>
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
          <p className="text-center text-xs text-gray-600 mt-6 leading-relaxed">
            By signing up, you agree to our{' '}
            <a href="/terms" className="text-orange-600 hover:underline font-semibold">
              Terms
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-orange-600 hover:underline font-semibold">
              Privacy Policy
            </a>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-orange-600 hover:underline font-semibold">
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
}
