'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { BadgeExplainer } from '@/components/landing/BadgeExplainer';
import { BadgeType } from '@/app/generated/prisma/client';

const VALID_BADGE_TYPES = ['SPARK', 'WORD_WIZARD', 'VOICE_WIZARD', 'LANGUAGE_WIZARD', 'GRAND_WIZARD'];

export default function BadgeLandingPage() {
  const router = useRouter();
  const params = useParams();
  const badgeTypeParam = params.badgeType as string;
  const badgeType = badgeTypeParam?.toUpperCase() as BadgeType;

  const [badgeCount, setBadgeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validate badge type
    if (!VALID_BADGE_TYPES.includes(badgeType)) {
      router.push('/');
      return;
    }

    // In a real implementation, you'd fetch badge count from an API
    // For now, we'll use a placeholder
    const counts: Record<string, number> = {
      SPARK: 145,
      WORD_WIZARD: 82,
      VOICE_WIZARD: 67,
      LANGUAGE_WIZARD: 34,
      GRAND_WIZARD: 5,
    };

    setBadgeCount(counts[badgeType] || 0);
    setLoading(false);
  }, [badgeType, router]);

  const handleCta = () => {
    router.push(`/login?badge=${badgeType}&referrer=badge-landing`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading badge information...</p>
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

      {/* Badge Explainer */}
      <BadgeExplainer
        badgeType={badgeType}
        earnedCount={badgeCount}
        onCtaClick={handleCta}
      />

      {/* Requirements Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* How to Practice */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                How to Practice
              </h3>
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: 'Choose Your Level',
                    description: 'Start with passages matched to your English level',
                  },
                  {
                    step: 2,
                    title: 'Read & Record',
                    description: 'Read the passage aloud while our AI listens',
                  },
                  {
                    step: 3,
                    title: 'Get Feedback',
                    description: 'Receive instant feedback on accuracy, speed, and fluency',
                  },
                  {
                    step: 4,
                    title: 'Improve & Repeat',
                    description: 'Practice regularly to build skills and earn badges',
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">
                        {item.title}
                      </h4>
                      <p className="text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Success Stories */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Success Stories
              </h3>
              <div className="space-y-4">
                {[
                  {
                    name: 'Aarav, Grade 5',
                    story:
                      'Earned this badge after just 2 weeks of consistent practice. Now reading at 95% accuracy!',
                  },
                  {
                    name: 'Diya, Grade 6',
                    story:
                      'Went from struggling with English to confidently reading complex passages. The AI feedback changed everything.',
                  },
                  {
                    name: 'Rohan, Grade 4',
                    story:
                      'Started as a shy learner but the AI practice environment gave him confidence. Now leads reading sessions at school!',
                  },
                ].map((story, idx) => (
                  <div key={idx} className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <p className="font-bold text-gray-900 mb-2">
                      {story.name}
                    </p>
                    <p className="text-gray-700 italic">"{story.story}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: 'How long does it take to earn this badge?',
                a: 'It depends on your starting level and how frequently you practice. Most students earn it within 2-4 weeks of daily practice.',
              },
              {
                q: 'Can I practice multiple times a day?',
                a: 'Absolutely! The more you practice, the faster you improve. Many successful students do 2-3 sessions per day.',
              },
              {
                q: 'What if I make mistakes?',
                a: 'Mistakes are learning opportunities! Our AI provides detailed feedback on every mistake so you can improve.',
              },
              {
                q: 'Can I try for free first?',
                a: 'Yes! You can complete your first session completely free. No payment required to get started.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="border-b border-gray-200 pb-6 last:border-b-0">
                <h3 className="font-bold text-gray-900 mb-2 text-lg">
                  {faq.q}
                </h3>
                <p className="text-gray-700">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-8">
            Ready to Earn This Badge?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students who are mastering English with WizLingo
          </p>
          <button
            onClick={handleCta}
            className="px-8 py-4 bg-white text-purple-600 font-bold text-lg rounded-lg hover:shadow-lg transition"
          >
            Start Your Free Trial
          </button>
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
