'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPasswordPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [forcePasswordChange, setForcePasswordChange] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setUsername(value);
    const isValidUserID = /^WL\d{6}$/i.test(value);
    const isValidPhone = /^\d{10}$/.test(value);
    setIsValid((isValidUserID || isValidPhone) && password.length >= 6);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username) {
      setError('Please enter your UserID or phone number');
      return;
    }

    if (password.length < 6) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // Check if password change is required
      if (data.status === 'FORCE_PASSWORD_CHANGE') {
        setForcePasswordChange(true);
        setStudentId(data.studentId);
        setPassword('');
        return;
      }

      // Store token and redirect
      localStorage.setItem('token', data.token);
      router.push('/student/dashboard');
    } catch (err) {
      setError('Error logging in. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to change password');
        return;
      }

      alert('Password changed successfully! Please login with your new password.');
      setForcePasswordChange(false);
      setUsername('');
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('Error changing password. Please try again.');
      console.error(err);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #1a1a2e 50%, #16213e 75%, #0f172a 100%)" }}>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(249, 115, 22, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(249, 115, 22, 0.6);
          }
        }
        .fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .fade-in-up-delay-1 { animation-delay: 0.1s; }
        .fade-in-up-delay-2 { animation-delay: 0.2s; }
        .fade-in-up-delay-3 { animation-delay: 0.3s; }
        .fade-in-up-delay-4 { animation-delay: 0.4s; }
        .float {
          animation: float 3s ease-in-out infinite;
        }
        .glow-effect {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>

      {/* Animated background shapes */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-yellow-400/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-6 fade-in-up">
          <div className="flex justify-center mb-3">
            <div className="float">
              <Image
                src="/wiziingo-logo.svg"
                alt="WizLingo"
                width={100}
                height={50}
                className="h-12 w-auto drop-shadow-lg"
              />
            </div>
          </div>
          <p className="text-white text-xs font-semibold uppercase tracking-widest">AI English Learning Platform</p>
        </div>

        {/* Card */}
        <div className="bg-gradient-to-br from-white/95 to-blue-50/95 rounded-3xl shadow-2xl p-8 border-2 border-white/30 backdrop-blur-xl fade-in-up fade-in-up-delay-1 glow-effect">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent mb-2 fade-in-up fade-in-up-delay-2">
            Sign In
          </h1>
          <p className="text-center text-gray-600 text-sm mb-6 fade-in-up fade-in-up-delay-2">
            Welcome back to WizLingo
          </p>

          {!forcePasswordChange ? (
            <form onSubmit={handleLogin} className="space-y-6 fade-in-up fade-in-up-delay-3">
              {/* Username Input (UserID or Phone) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  🆔 UserID or Phone
                </label>
                <input
                  type="text"
                  placeholder="e.g., WL001 or 98765 43210"
                  value={username}
                  onChange={handleUsernameChange}
                  disabled={loading}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-transparent focus:ring-2 focus:ring-orange-500 text-lg transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  🔐 Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    const isValidUserID = /^WL\d{6}$/i.test(username);
                    const isValidPhone = /^\d{10}$/.test(username);
                    setIsValid((isValidUserID || isValidPhone) && e.target.value.length >= 6);
                  }}
                  disabled={loading}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-transparent focus:ring-2 focus:ring-orange-500 text-lg transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <p className="text-red-700 text-sm font-medium">⚠️ {error}</p>
                </div>
              )}

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading || !isValid}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 duration-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  '🔓 Sign In'
                )}
              </button>
            </form>
          ) : (
            /* Force Password Change Form */
            <form onSubmit={handleChangePassword} className="space-y-6 fade-in-up fade-in-up-delay-3">
              <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
                <p className="text-yellow-800 text-sm font-semibold">⚠️ First Login: Change Your Password</p>
                <p className="text-yellow-700 text-xs mt-2">For security, you must set a new password before accessing the app.</p>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={changingPassword}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-transparent focus:ring-2 focus:ring-orange-500 text-lg transition-all placeholder:text-gray-400"
                />
                <p className="text-xs text-gray-500 mt-1">Min 8 characters, mix of uppercase, lowercase, numbers</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={changingPassword}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-transparent focus:ring-2 focus:ring-orange-500 text-lg transition-all placeholder:text-gray-400"
                />
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
                disabled={changingPassword || newPassword.length < 8 || newPassword !== confirmPassword}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 duration-200"
              >
                {changingPassword ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Setting Password...
                  </span>
                ) : (
                  '✅ Set Password & Login'
                )}
              </button>
            </form>
          )}

          {/* Password Info - After Form */}
          {!forcePasswordChange && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mt-6 mb-6 fade-in-up fade-in-up-delay-3">
              <p className="text-xs text-blue-800 leading-relaxed">
                <span className="font-semibold">💡 First Time?</span><br/>
                If this is your first login with B2C (WL001 etc), your default password is your phone number.
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-2 my-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-400 text-xs">new here?</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Sign Up Link */}
          {!forcePasswordChange && (
            <button
              onClick={() => router.push('/auth/signup-b2c')}
              className="w-full py-3 border-2 border-purple-200 text-purple-700 font-semibold rounded-xl hover:bg-purple-50 text-sm transition-all"
            >
              ✨ Create Account
            </button>
          )}

          {/* Legal */}
          <p className="text-center text-xs text-gray-500 mt-4 fade-in-up fade-in-up-delay-4">
            By signing in, you agree to our <a href="/terms" className="text-orange-600 hover:underline">Terms</a>
          </p>
          <p className="text-center text-xs text-gray-500 mt-2 fade-in-up fade-in-up-delay-4">
            Powered by <span className="font-semibold">Edvanta Intelligence System</span>
          </p>
        </div>
      </div>
    </div>
  );
}
