'use client';

import React from 'react';
import { BadgeType } from '@/app/generated/prisma/client';
import { getBadgeConfig } from '@/lib/badge-config';

interface BadgeSocialProofProps {
  badgeCounts: Record<BadgeType, number>;
  schoolName: string;
}

export function BadgeSocialProof({ badgeCounts, schoolName }: BadgeSocialProofProps) {
  const badgeTypes: BadgeType[] = ['SPARK', 'WORD_WIZARD', 'VOICE_WIZARD', 'LANGUAGE_WIZARD', 'GRAND_WIZARD'];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        {/* Section heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-black mb-4">
            Meet the Badge System
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Students at {schoolName} earn badges for mastering reading and speaking skills. Each badge represents a real achievement.
          </p>
        </div>

        {/* Badge cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {badgeTypes.map((badgeType) => {
            const config = getBadgeConfig(badgeType);
            const count = badgeCounts[badgeType] || 0;

            return (
              <div
                key={badgeType}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition transform hover:scale-105"
              >
                {/* Badge image */}
                <div className="flex justify-center mb-4">
                  <img
                    src={config.badgeImage}
                    alt={config.name}
                    className="w-24 h-24 object-contain drop-shadow-lg"
                  />
                </div>

                {/* Badge name */}
                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                  {config.name}
                </h3>

                {/* Badge description */}
                <p className="text-sm text-gray-600 text-center mb-4">
                  {config.description}
                </p>

                {/* Social proof - count */}
                <div className="bg-gradient-to-r from-orange-100 to-pink-100 rounded-lg p-3 text-center mb-4">
                  <div className="text-2xl font-black text-orange-600">
                    {count}
                  </div>
                  <div className="text-xs text-gray-600">
                    {count === 1 ? 'Student' : 'Students'} earned
                  </div>
                </div>

                {/* Requirement */}
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-xs font-semibold text-gray-700">
                    {config.requirement}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-gray-600 mb-6">
            Help your child earn their first badge today. It only takes one session to start!
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-lg hover:shadow-lg transition">
            Start Your Journey
          </button>
        </div>
      </div>
    </section>
  );
}
