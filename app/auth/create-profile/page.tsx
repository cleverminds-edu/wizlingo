'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CreateProfilePage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    grade: '5',
    dateOfBirth: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifiedPhone = sessionStorage.getItem('verifiedPhone');
    if (!verifiedPhone) {
      router.push('/auth/phone-signup');
      return;
    }
    setPhone(verifiedPhone);
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    if (!formData.dateOfBirth) {
      setError('Please select your date of birth');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/create-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create profile');
        return;
      }

      // Clear session storage
      sessionStorage.removeItem('signupPhone');
      sessionStorage.removeItem('verifiedPhone');

      // Redirect to dashboard
      router.push('/student/dashboard');
    } catch (err) {
      setError('Error creating profile. Please try again.');
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
          <p className="text-gray-600 text-sm font-medium">One more step to start learning</p>
        </div>

        {/* Card */}
        <div className="bg-gradient-to-br from-white via-blue-50/80 to-white rounded-3xl shadow-2xl p-8 border-2 border-blue-100/60 backdrop-blur-sm">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-center mb-3 bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
              Welcome!
            </h1>
            <p className="text-center text-gray-600 text-sm">
              Tell us a bit about yourself to personalize your learning
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📝 Your Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g., Aditya Kumar"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Grade */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📚 Grade
              </label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-white"
              >
                <option value="1">Grade 1</option>
                <option value="2">Grade 2</option>
                <option value="3">Grade 3</option>
                <option value="4">Grade 4</option>
                <option value="5">Grade 5</option>
                <option value="6">Grade 6</option>
                <option value="7">Grade 7</option>
                <option value="8">Grade 8</option>
                <option value="9">Grade 9</option>
                <option value="10">Grade 10</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                🎂 Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
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
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 duration-200 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Already have account */}
          <p className="text-center text-sm text-gray-600 mt-8 pt-6 border-t border-gray-200">
            Already have an account?{' '}
            <a href="/login" className="text-orange-600 hover:underline font-semibold">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
