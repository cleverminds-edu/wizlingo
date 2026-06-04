'use client';

import React from 'react';
import { BadgeType } from '@/app/generated/prisma/client';
import { getBadgeConfig } from '@/lib/badge-config';
import { CheckCircle } from 'lucide-react';

interface BadgeExplainerProps {
  badgeType: BadgeType;
  earnedCount: number;
  onCtaClick: () => void;
}

export function BadgeExplainer({ badgeType, earnedCount, onCtaClick }: BadgeExplainerProps) {
  const config = getBadgeConfig(badgeType);

  // Get tips based on badge type
  const getTips = () => {
    const tipsMap: Record<BadgeType, string[]> = {
      SPARK: [
        'Complete your first reading session',
        'Read a passage and let the AI assess your fluency',
        'Get instant feedback on your performance',
        'Share your achievement with friends',
      ],
      WORD_WIZARD: [
        'Improve your reading accuracy to 80%+',
        'Practice reading regularly',
        'Learn from mistakes the AI points out',
        'Master word pronunciation and comprehension',
      ],
      VOICE_WIZARD: [
        'Achieve 75%+ fluency in speaking',
        'Practice speaking English out loud',
        'Work with AI conversation partners',
        'Build confidence in your English voice',
      ],
      LANGUAGE_WIZARD: [
        'Complete 10 total reading or speaking sessions',
        'Stay consistent with your learning',
        'Mix reading and speaking practice',
        'Build a strong learning habit',
      ],
      GRAND_WIZARD: [
        'Earn all 4 other badges',
        'Master reading accuracy and fluency',
        'Complete many sessions',
        'Become a true English wizard!',
      ],
    };
    return tipsMap[badgeType] || [];
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Badge info */}
          <div>
            {/* Badge visual */}
            <div className="flex justify-center mb-8">
              <div className="relative w-48 h-48">
                <img
                  src={config.badgeImage}
                  alt={config.name}
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Social proof */}
            <div className="bg-gradient-to-r from-orange-100 to-pink-100 rounded-xl p-6 text-center">
              <div className="text-4xl font-black text-orange-600 mb-2">
                {earnedCount}+
              </div>
              <div className="text-gray-700 font-semibold">
                Students from your school have earned this badge
              </div>
            </div>
          </div>

          {/* Right side - Details */}
          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              {config.name}
            </h2>

            <p className="text-xl text-gray-600 mb-8">
              {config.description}
            </p>

            {/* What you need to do */}
            <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">How to Earn This Badge</h3>
              <p className="text-gray-700 text-lg font-bold">
                {config.requirement}
              </p>
            </div>

            {/* Tips */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Tips to Get There</h3>
              <ul className="space-y-3">
                {getTips().map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <button
              onClick={onCtaClick}
              className="mt-8 w-full px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold text-lg rounded-lg hover:shadow-lg transition"
            >
              Start Learning Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
