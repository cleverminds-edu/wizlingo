'use client';

import React from 'react';
import { BadgeType } from '@/app/generated/prisma/client';
import { getBadgeConfig } from '@/lib/badge-config';

interface StudentWithBadges {
  id: string;
  name: string;
  badges: BadgeType[];
  badgeCount: number;
}

interface SchoolLeaderboardProps {
  students: StudentWithBadges[];
  schoolName: string;
}

export function SchoolLeaderboard({ students, schoolName }: SchoolLeaderboardProps) {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        {/* Section heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-black mb-4">
            Top Achievers at {schoolName}
          </h2>
          <p className="text-xl text-gray-600">
            Meet the students who are mastering WizLingo
          </p>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white font-bold">
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-5">Student Name</div>
            <div className="col-span-3 text-center">Badges</div>
            <div className="col-span-3 text-center">Achievement</div>
          </div>

          {/* Leaderboard rows */}
          <div>
            {students.map((student, index) => (
              <div
                key={student.id}
                className={`grid grid-cols-12 gap-4 p-6 border-b border-gray-100 hover:bg-gray-50 transition ${
                  index < 3 ? 'bg-yellow-50/30' : ''
                }`}
              >
                {/* Rank */}
                <div className="col-span-1 flex items-center justify-center">
                  <div className="text-2xl font-black">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </div>
                </div>

                {/* Student name */}
                <div className="col-span-5 flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold mr-3">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-gray-900">{student.name}</span>
                </div>

                {/* Badge count */}
                <div className="col-span-3 flex items-center justify-center">
                  <span className="text-2xl font-black text-purple-600">{student.badgeCount}</span>
                </div>

                {/* Badge icons */}
                <div className="col-span-3 flex items-center justify-center gap-2">
                  {student.badges.slice(0, 4).map((badgeType) => {
                    const config = getBadgeConfig(badgeType);
                    return (
                      <div
                        key={badgeType}
                        title={config.name}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-lg hover:scale-125 transition"
                      >
                        {config.emoji}
                      </div>
                    );
                  })}
                  {student.badges.length > 4 && (
                    <div className="text-sm font-bold text-gray-500">
                      +{student.badges.length - 4}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Motivational message */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
          <p className="text-center text-lg text-gray-700">
            <strong>Your child</strong> can join this leaderboard! Every reading and speaking session brings them closer to their first badge.
          </p>
        </div>
      </div>
    </section>
  );
}
