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
  const [generatedPassword, setGeneratedPassword] = useState('');
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setGeneratedPassword('');

    // Validate phone
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/signup-auto-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create account');
        return;
      }

      // Show generated password
      setGeneratedPassword(data.password);
    } catch (err) {
      setError('Error creating account. Please try again.');
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

          {/* Password Info */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-6">
            <p className="text-xs text-blue-700">
              <span className="font-semibold">💡 Auto-Generated Password:</span> Your default password will be <span className="font-mono">"Wiz" + last 6 digits of your phone</span>. You can reset it after login.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
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

            {/* Create Account Button */}
            {!generatedPassword && (
              <button
                type="submit"
                disabled={loading || phone.length !== 10}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 duration-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Account...
                  </span>
                ) : phone.length === 10 ? (
                  '✨ Create Account'
                ) : (
                  '📝 Create Account'
                )}
              </button>
            )}

            {/* Generated Password Display */}
            {generatedPassword && (
              <div className="p-5 bg-green-50 border-2 border-green-300 rounded-xl">
                <h3 className="text-green-700 font-bold mb-3">✅ Account Created!</h3>
                <p className="text-gray-600 text-sm mb-4">Share these credentials with the user:</p>
                <div className="bg-white p-4 rounded-lg border border-green-200 space-y-3">
                  <div>
                    <p className="text-gray-500 text-xs">📱 Phone:</p>
                    <p className="text-lg font-mono font-bold text-gray-800">+91{phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">🔐 Default Password:</p>
                    <p className="text-lg font-mono font-bold text-orange-600">{generatedPassword}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-4">
                  💡 User will reset password after first login
                </p>
                <button
                  onClick={() => {
                    setPhone('');
                    setGeneratedPassword('');
                  }}
                  className="w-full mt-4 py-2 bg-orange-100 text-orange-700 font-semibold rounded-lg hover:bg-orange-200 transition-all"
                >
                  ✨ Create Another Account
                </button>
              </div>
            )}
          </form>


          {/* Legal */}
          <p className="text-center text-xs text-gray-500 mt-4">
            By signing up, you agree to our <a href="/terms" className="text-orange-600 hover:underline">Terms</a> and <a href="/privacy" className="text-orange-600 hover:underline">Privacy</a>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-white/70 text-xs mt-4">
          Already have an account? <a href="/auth/login-password" className="text-yellow-300 hover:underline font-semibold">Sign in</a>
        </p>
      </div>
    </div>
  );
}
