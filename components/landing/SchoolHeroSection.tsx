'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface SchoolHeroSectionProps {
  schoolName: string;
  totalBadgesEarned: number;
  studentCount: number;
  onCtaClick: () => void;
}

export function SchoolHeroSection({
  schoolName,
  totalBadgesEarned,
  studentCount,
  onCtaClick,
}: SchoolHeroSectionProps) {
  return (
    <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 text-center">
        {/* Top badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur border border-purple-200 mb-8">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <span className="text-sm font-semibold text-gray-700">
            {studentCount} students learning at {schoolName}
          </span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl sm:text-7xl font-black mb-6 leading-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
            Your child earned
          </span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
            a WizLingo Badge! 🎉
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join {schoolName}'s community of <strong>{totalBadgesEarned}+ badges earned</strong>. AI-powered English learning that actually works.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12 max-w-md mx-auto">
          <div className="bg-white/60 backdrop-blur rounded-xl p-4">
            <div className="text-3xl font-black text-blue-600">{studentCount}</div>
            <div className="text-sm text-gray-600">Active Students</div>
          </div>
          <div className="bg-white/60 backdrop-blur rounded-xl p-4">
            <div className="text-3xl font-black text-purple-600">{totalBadgesEarned}</div>
            <div className="text-sm text-gray-600">Badges Earned</div>
          </div>
          <div className="bg-white/60 backdrop-blur rounded-xl p-4">
            <div className="text-3xl font-black text-pink-600">100%</div>
            <div className="text-sm text-gray-600">AI-Powered</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onCtaClick}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-lg hover:shadow-lg transition transform hover:scale-105"
          >
            Start Free Trial
          </button>
          <button
            onClick={onCtaClick}
            className="px-8 py-4 bg-white text-gray-900 font-bold text-lg rounded-lg border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg transition"
          >
            See How It Works
          </button>
        </div>

        {/* Testimonial */}
        <div className="mt-16 bg-white/60 backdrop-blur rounded-2xl p-8 max-w-2xl mx-auto border border-white/80">
          <p className="text-gray-700 text-lg mb-4">
            "My child has improved so much in just 2 weeks. The AI feedback is incredible!" - Parent from {schoolName}
          </p>
          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-2xl">⭐</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
