'use client';

import { useState, useEffect } from 'react';
import type { LeaderboardType } from '@/app/generated/prisma/client';

interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  value: number;
  badges: string[];
  trend: 'up' | 'down' | 'same';
}

interface LeaderboardProps {
  type: LeaderboardType;
  scope: string;
  classId?: string;
  schoolId?: string;
  currentUserId?: string;
  limit?: number;
  title?: string;
}

const MEDAL_EMOJIS = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

const TREND_INDICATORS = {
  up: '↑',
  down: '↓',
  same: '→',
};

const TREND_COLORS = {
  up: 'text-green-600',
  down: 'text-red-600',
  same: 'text-gray-400',
};

export default function Leaderboard({
  type,
  scope,
  classId,
  schoolId,
  currentUserId,
  limit = 100,
  title,
}: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [currentUserValue, setCurrentUserValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    // Get student ID from localStorage if available
    const storedStudentId = typeof window !== 'undefined' ? localStorage.getItem('studentId') : null;
    if (storedStudentId) {
      setStudentId(storedStudentId);
    }
    fetchLeaderboard();
  }, [type, scope, classId, schoolId]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        type,
        scope,
        limit: limit.toString(),
      });

      if (scope === 'class' && classId) {
        params.append('classId', classId);
      } else if (scope === 'school' && schoolId) {
        params.append('schoolId', schoolId);
      }

      const response = await fetch(`/api/leaderboards?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
      setCurrentUserRank(data.currentUserRank);
      setCurrentUserValue(data.currentUserValue);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getValueLabel = (): string => {
    switch (type) {
      case 'BADGE_COUNT':
        return 'Badges';
      case 'SPEED':
        return 'Days';
      case 'CONSISTENCY':
        return 'Sessions';
      case 'ACCURACY':
        return 'Accuracy %';
      case 'FLUENCY':
        return 'Fluency %';
      default:
        return 'Value';
    }
  };

  const getTypeLabel = (): string => {
    switch (type) {
      case 'BADGE_COUNT':
        return '📚 Badge Collection';
      case 'SPEED':
        return '⚡ Speed Champion';
      case 'CONSISTENCY':
        return '🔥 Consistency King';
      case 'ACCURACY':
        return '🎯 Accuracy Master';
      case 'FLUENCY':
        return '🎤 Fluency Pro';
      default:
        return 'Leaderboard';
    }
  };

  if (loading) {
    return (
      <div className="w-full p-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 text-sm">{error}</p>
        <button
          onClick={fetchLeaderboard}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="w-full p-8 text-center bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-sm">No leaderboard data yet</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && <h2 className="text-lg font-bold mb-4">{title}</h2>}

      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <h3 className="text-md font-semibold">{getTypeLabel()}</h3>
        {currentUserRank && (
          <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            Your Rank: #{currentUserRank}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {leaderboard.map((entry) => (
          <div
            key={entry.studentId}
            className={`p-4 rounded-lg border transition-colors ${
              studentId === entry.studentId
                ? 'bg-blue-50 border-blue-300 shadow-md'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center justify-center w-8 h-8 font-bold">
                  {entry.rank <= 3 ? (
                    <span className="text-xl">
                      {MEDAL_EMOJIS[entry.rank as keyof typeof MEDAL_EMOJIS]}
                    </span>
                  ) : (
                    <span className="text-gray-600">{entry.rank}</span>
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{entry.studentName}</p>
                  {entry.badges.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-1">
                      {entry.badges.map((badge, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{entry.value}</p>
                  <p className="text-xs text-gray-500">{getValueLabel()}</p>
                </div>

                <div
                  className={`text-lg font-bold ${
                    TREND_COLORS[entry.trend as keyof typeof TREND_COLORS]
                  }`}
                >
                  {TREND_INDICATORS[entry.trend as keyof typeof TREND_INDICATORS]}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {leaderboard.length === limit && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">Showing top {limit} rankings</p>
        </div>
      )}
    </div>
  );
}
