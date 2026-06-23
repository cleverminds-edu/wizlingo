'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SignupB2CPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [grade, setGrade] = useState('5');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupData, setSignupData] = useState<any>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(value);
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

    if (!name || name.length < 2) {
      setError('Please enter a valid name');
      return;
    }
    if (!dateOfBirth) {
      setError('Please select your date of birth');
      return;
    }
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/signup-b2c', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          grade: parseInt(grade),
          dateOfBirth: new Date(dateOfBirth).toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Signup failed');
        return;
      }

      setSignupSuccess(true);
      setSignupData(data);
    } catch (err) {
      setError('Error creating account. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #1a1a2e 50%, #16213e 75%, #0f172a 100%)" }}>
      {/* Animated background */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-yellow-400/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-400/15 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '0.5s' }}></div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Logo */}
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

        {/* Trust badges */}
        <div className="flex justify-center gap-3 mb-6 text-xs flex-wrap">
          <div className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white font-semibold">🔒 Secure</div>
          <div className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white font-semibold">✅ Verified</div>
          <div className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white font-semibold">⭐ Trusted</div>
        </div>

        {/* Card */}
        <div className="bg-gradient-to-br from-white/95 to-blue-50/95 rounded-3xl shadow-2xl p-8 border-2 border-white/30 backdrop-blur-xl">
          {!signupSuccess ? (
            <>
              <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Join WizLingo 🎓
              </h1>
              <p className="text-center text-gray-600 text-sm mb-6">
                Get your unique UserID and start learning English today!
              </p>

              <form onSubmit={handleSignup} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Aman Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  />
                </div>

                {/* Grade */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Grade / Class *
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                      <option key={g} value={g}>
                        Grade {g}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-3.5 text-gray-700 font-semibold text-base">
                      +91
                    </div>
                    <input
                      type="tel"
                      placeholder="98765 43210"
                      value={formatPhoneDisplay(phone)}
                      onChange={handlePhoneChange}
                      disabled={loading}
                      maxLength={11}
                      className="w-full pl-16 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all font-semibold tracking-wider"
                    />
                    {phone.length === 10 && <span className="absolute right-4 top-3.5 text-green-600 text-lg">✓</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">This will be your default password</p>
                </div>

                {/* Error */}
                {error && (
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                    <p className="text-red-700 text-sm font-medium">⚠️ {error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !name || !dateOfBirth || phone.length !== 10}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 duration-200"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Account...
                    </span>
                  ) : (
                    '✨ Get My UserID'
                  )}
                </button>
              </form>

              {/* Footer */}
              <p className="text-center text-xs text-gray-600 mt-6">
                Already have an account? <a href="/auth/login-password" className="text-orange-600 hover:underline font-semibold">Sign in</a>
              </p>
            </>
          ) : (
            /* Success State */
            <div>
              <h2 className="text-3xl font-bold text-center text-green-600 mb-6">🎉 Account Created!</h2>

              {/* UserID - Most Important */}
              <div className="p-6 bg-gradient-to-r from-orange-100 to-yellow-100 border-3 border-orange-400 rounded-2xl mb-6">
                <p className="text-sm font-semibold text-gray-600 text-center mb-2">YOUR USERID</p>
                <div className="text-center">
                  <div className="inline-block bg-white px-8 py-4 rounded-lg shadow-lg">
                    <p className="text-4xl font-bold text-orange-600 font-mono tracking-wider">{signupData.userId}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 text-center mt-3">💡 Use this ID to login. It's simple & memorable!</p>
              </div>

              {/* Login Details */}
              <div className="p-6 bg-white border-2 border-green-300 rounded-2xl mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">🔐 Login Details</h3>
                <div className="space-y-4">
                  {/* UserID */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Enter this ID to login:</p>
                    <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                      <p className="font-mono font-bold text-xl text-orange-600">{signupData.userId}</p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(signupData.userId);
                          alert('Copied!');
                        }}
                        className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded font-semibold"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* Default Password */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Default Password (use on first login):</p>
                    <div className="flex items-center justify-between bg-yellow-50 px-4 py-3 rounded-lg border border-yellow-300">
                      <p className="font-mono font-bold text-orange-700">{signupData.defaultPassword}</p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(signupData.defaultPassword);
                          alert('Copied!');
                        }}
                        className="text-xs bg-yellow-200 hover:bg-yellow-300 px-2 py-1 rounded font-semibold"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">📱 This is your phone number</p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
                <p className="text-xs text-blue-800 leading-relaxed">
                  <span className="font-semibold">📝 Next Steps:</span><br/>
                  1. Click "Go to Login" below<br/>
                  2. Enter your UserID: <span className="font-mono font-bold text-orange-600">{signupData.userId}</span><br/>
                  3. Enter password: <span className="font-mono font-bold">{signupData.phone}</span><br/>
                  4. System will ask you to set a new password<br/>
                  5. Use your new password for all future logins
                </p>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-6">
                <p className="text-xs text-green-800 leading-relaxed">
                  <span className="font-semibold">💡 Important:</span><br/>
                  • Save your UserID somewhere safe<br/>
                  • You can share your UserID with friends (use different phone numbers)<br/>
                  • Your password is private - never share it<br/>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setName('');
                    setPhone('');
                    setGrade('5');
                    setDateOfBirth('');
                    setSignupSuccess(false);
                    setSignupData(null);
                  }}
                  className="flex-1 py-3 bg-orange-100 text-orange-700 font-semibold rounded-xl hover:bg-orange-200 transition-all"
                >
                  ✨ Create Another
                </button>
                <button
                  onClick={() => router.push('/auth/login-password')}
                  className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all"
                >
                  Go to Login →
                </button>
              </div>
            </div>
          )}

          {/* Legal */}
          <p className="text-center text-xs text-gray-500 mt-6">
            Powered by <span className="font-semibold">Edvanta Intelligence System</span>
          </p>
        </div>
      </div>
    </div>
  );
}
