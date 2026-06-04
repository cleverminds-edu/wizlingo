'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SchoolHeroSection } from '@/components/landing/SchoolHeroSection';
import { BadgeSocialProof } from '@/components/landing/BadgeSocialProof';
import { SchoolLeaderboard } from '@/components/landing/SchoolLeaderboard';
import { BadgeType } from '@/app/generated/prisma/client';

interface SchoolData {
  schoolId: string;
  schoolName: string;
  badgeCounts: Record<BadgeType, number>;
  totalStudents: number;
  totalBadgesEarned: number;
  topStudents: Array<{
    id: string;
    name: string;
    badges: BadgeType[];
    badgeCount: number;
  }>;
}

export default function SchoolLandingPage() {
  const router = useRouter();
  const params = useParams();
  const schoolId = params.schoolId as string;

  const [schoolData, setSchoolData] = useState<SchoolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSchoolData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/landing/school?schoolId=${schoolId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch school data');
        }

        const data = await response.json();
        setSchoolData(data);
      } catch (err) {
        console.error('Error fetching school data:', err);
        setError('Failed to load school information');
      } finally {
        setLoading(false);
      }
    }

    if (schoolId) {
      fetchSchoolData();
    }
  }, [schoolId]);

  const handleCta = () => {
    // Redirect to signup or main app
    router.push(`/login?school=${schoolId}&referrer=landing`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading school information...</p>
        </div>
      </div>
    );
  }

  if (error || !schoolData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            School Not Found
          </h1>
          <p className="text-gray-600 mb-6">{error || 'Unable to load school information'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">WizLingo</h1>
          <button
            onClick={handleCta}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <SchoolHeroSection
        schoolName={schoolData.schoolName}
        totalBadgesEarned={schoolData.totalBadgesEarned}
        studentCount={schoolData.totalStudents}
        onCtaClick={handleCta}
      />

      {/* Badge Social Proof */}
      <BadgeSocialProof
        badgeCounts={schoolData.badgeCounts}
        schoolName={schoolData.schoolName}
      />

      {/* Leaderboard */}
      {schoolData.topStudents.length > 0 && (
        <SchoolLeaderboard
          students={schoolData.topStudents}
          schoolName={schoolData.schoolName}
        />
      )}

      {/* Features Section */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              Why Students Love WizLingo
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Gamified learning that actually improves English skills
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🤖',
                title: 'AI-Powered Feedback',
                description: 'Get instant, detailed feedback on reading and speaking skills from advanced AI',
              },
              {
                icon: '🎯',
                title: 'Personalized Learning',
                description: 'Adapt to your learning level and progress at your own pace',
              },
              {
                icon: '🏆',
                title: 'Badge Rewards',
                description: 'Earn badges as you achieve milestones and share your wins',
              },
              {
                icon: '📊',
                title: 'Track Progress',
                description: 'See detailed analytics on your reading speed, accuracy, and fluency',
              },
              {
                icon: '🌐',
                title: 'English Immersion',
                description: 'Practice reading passages and conversational English daily',
              },
              {
                icon: '👥',
                title: 'School Community',
                description: 'Compete on leaderboards and celebrate wins with classmates',
              },
            ].map((feature, idx) => (
              <div key={idx} className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              What Parents & Teachers Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "My daughter's confidence in English has skyrocketed. She uses it daily and loves earning badges!",
                author: 'Parent, Bangalore',
              },
              {
                quote:
                  "The AI feedback is incredibly detailed. Students know exactly what to improve.",
                author: 'English Teacher, Mumbai',
              },
              {
                quote:
                  "My son completed 50+ sessions in 3 months. WizLingo made learning fun!",
                author: 'Parent, Delhi',
              },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 shadow-lg border border-white/80"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-2xl">⭐</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                <p className="text-gray-600 font-semibold">- {testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-black mb-8">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join {schoolData.totalStudents} students from {schoolData.schoolName} who are mastering English with WizLingo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleCta}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-lg hover:shadow-lg transition"
            >
              Start Free Trial Today
            </button>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold text-lg rounded-lg hover:border-gray-400 transition"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 text-center">
          <p className="text-gray-400">
            WizLingo &copy; 2026. AI-Powered English Learning Platform
          </p>
        </div>
      </footer>
    </main>
  );
}
