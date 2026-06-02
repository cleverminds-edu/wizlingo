'use client';

import { useState } from 'react';
import type { LeaderboardType } from '@/app/generated/prisma';

interface LeaderboardSelectorProps {
  onTypeChange: (type: LeaderboardType) => void;
  onScopeChange: (scope: string) => void;
  classId?: string;
  schoolId?: string;
}

const LEADERBOARD_TYPES = [
  {
    type: 'BADGE_COUNT' as LeaderboardType,
    label: '📚 Badge Collection',
    description: 'Total badges earned',
  },
  {
    type: 'SPEED' as LeaderboardType,
    label: '⚡ Speed Champion',
    description: 'Days to earn SPARK badge',
  },
  {
    type: 'CONSISTENCY' as LeaderboardType,
    label: '🔥 Consistency King',
    description: 'Total sessions completed',
  },
  {
    type: 'ACCURACY' as LeaderboardType,
    label: '🎯 Accuracy Master',
    description: 'Average reading accuracy',
  },
  {
    type: 'FLUENCY' as LeaderboardType,
    label: '🎤 Fluency Pro',
    description: 'Average speaking fluency',
  },
];

const SCOPES = [
  { value: 'all', label: '🌍 School-wide', icon: '🏫' },
  { value: 'class', label: '📖 My Class', icon: '👥' },
];

export default function LeaderboardSelector({
  onTypeChange,
  onScopeChange,
  classId,
  schoolId,
}: LeaderboardSelectorProps) {
  const [selectedType, setSelectedType] = useState<LeaderboardType>('BADGE_COUNT');
  const [selectedScope, setSelectedScope] = useState('all');
  const [view, setView] = useState<'tabs' | 'cards'>('tabs');

  const handleTypeChange = (type: LeaderboardType) => {
    setSelectedType(type);
    onTypeChange(type);
  };

  const handleScopeChange = (scope: string) => {
    setSelectedScope(scope);
    onScopeChange(scope);
  };

  return (
    <div className="w-full space-y-4">
      {/* Scope Selector */}
      <div className="flex gap-2">
        {SCOPES.map((scope) => (
          <button
            key={scope.value}
            onClick={() => handleScopeChange(scope.value)}
            disabled={scope.value === 'class' && !classId}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedScope === scope.value
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${scope.value === 'class' && !classId ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {scope.icon} {scope.label}
          </button>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setView('tabs')}
            className={`px-3 py-1 text-sm rounded ${
              view === 'tabs'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tabs
          </button>
          <button
            onClick={() => setView('cards')}
            className={`px-3 py-1 text-sm rounded ${
              view === 'cards'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Cards
          </button>
        </div>
      </div>

      {/* Type Selector - Tabs View */}
      {view === 'tabs' && (
        <div className="border-b border-gray-200">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {LEADERBOARD_TYPES.map((lb) => (
              <button
                key={lb.type}
                onClick={() => handleTypeChange(lb.type)}
                className={`px-4 py-3 whitespace-nowrap font-medium transition-all border-b-2 ${
                  selectedType === lb.type
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
                title={lb.description}
              >
                {lb.label.split(' ')[0]} {lb.label.split(' ').slice(1).join(' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Type Selector - Cards View */}
      {view === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {LEADERBOARD_TYPES.map((lb) => (
            <button
              key={lb.type}
              onClick={() => handleTypeChange(lb.type)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedType === lb.type
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-400'
              }`}
            >
              <div className="text-2xl mb-2">{lb.label.split(' ')[0]}</div>
              <h3 className="font-semibold text-sm text-gray-900 mb-1">
                {lb.label.split(' ').slice(1).join(' ')}
              </h3>
              <p className="text-xs text-gray-600">{lb.description}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
