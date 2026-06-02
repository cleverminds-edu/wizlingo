'use client';

import { useState } from 'react';
import type { LeaderboardType } from '@/app/generated/prisma';
import Leaderboard from '@/components/Leaderboard';
import LeaderboardSelector from '@/components/LeaderboardSelector';

export default function LeaderboardsPage() {
  const [selectedType, setSelectedType] = useState<LeaderboardType>('BADGE_COUNT');
  const [selectedScope, setSelectedScope] = useState('all');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🏆 Leaderboards</h1>
          <p className="text-gray-600">
            See where you rank among your classmates and compete in friendly challenges
          </p>
        </div>

        {/* Motivation Section */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg p-6 mb-8 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-2">🎯 Climb the Rankings!</h2>
          <p className="text-lg opacity-90">
            Earn badges, complete sessions, and master reading & speaking to climb the leaderboard.
            The top 3 spots are waiting for you!
          </p>
        </div>

        {/* Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <LeaderboardSelector
            onTypeChange={setSelectedType}
            onScopeChange={setSelectedScope}
          />
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <Leaderboard
            type={selectedType}
            scope={selectedScope}
            limit={50}
          />
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 mb-3">📚 How Leaderboards Work</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>✓ Badge Collection: Most badges earned</li>
              <li>✓ Speed Champion: Fastest to earn SPARK badge</li>
              <li>✓ Consistency King: Most sessions completed</li>
              <li>✓ Accuracy Master: Highest reading accuracy</li>
              <li>✓ Fluency Pro: Best speaking fluency</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <h3 className="text-lg font-bold text-green-900 mb-3">🎁 Rewards Coming Soon</h3>
            <ul className="text-sm text-green-800 space-y-2">
              <li>✨ Weekly leaderboard winners get recognition</li>
              <li>✨ Monthly champions earn special rewards</li>
              <li>✨ School-wide winners get certificates</li>
              <li>✨ Keep climbing for exclusive badges!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
