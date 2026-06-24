'use client';

import { useState } from 'react';

interface BadgeCardProps {
  type: 'SPARK' | 'WORD_WIZARD' | 'VOICE_WIZARD' | 'LANGUAGE_WIZARD' | 'GRAND_WIZARD' | 'WEEK_WARRIOR' | 'MONTH_MASTER';
  status: 'earned' | 'locked';
  progress?: number;
  maxProgress?: number;
  showProgress?: boolean;
  onClick?: () => void;
  dayNumber?: number;
}

const BADGE_CONFIG = {
  SPARK: {
    emoji: '✨',
    name: 'Spark',
    rarity: 1,
    color: '#FF6B6B',
    lightBg: '#FFE8E8',
    description: 'First step',
    requirement: 'Complete 1 reading session',
  },
  WORD_WIZARD: {
    emoji: '📚',
    name: 'Word Wizard',
    rarity: 3,
    color: '#8B5CF6',
    lightBg: '#F3E8FF',
    description: 'Reading master',
    requirement: 'Achieve 80%+ accuracy in reading',
  },
  VOICE_WIZARD: {
    emoji: '🎤',
    name: 'Voice Wizard',
    rarity: 3,
    color: '#EC4899',
    lightBg: '#FCE7F3',
    description: 'Speaking master',
    requirement: 'Achieve 75%+ fluency in speaking',
  },
  LANGUAGE_WIZARD: {
    emoji: '🧙',
    name: 'Language Wizard',
    rarity: 3,
    color: '#6366F1',
    lightBg: '#E0E7FF',
    description: 'Committed learner',
    requirement: 'Complete 10 reading or speaking sessions',
  },
  GRAND_WIZARD: {
    emoji: '👑',
    name: 'Grand Wizard',
    rarity: 4,
    color: '#F59E0B',
    lightBg: '#FEF3C7',
    description: 'Ultimate master',
    requirement: 'Earn all 4 badges above',
  },
  WEEK_WARRIOR: {
    emoji: '🔥',
    name: 'Week Warrior',
    rarity: 2,
    color: '#FF7F50',
    lightBg: '#FFE0CC',
    description: '7-day streak',
    requirement: 'Practice 7 consecutive days',
  },
  MONTH_MASTER: {
    emoji: '⚡',
    name: 'Month Master',
    rarity: 2,
    color: '#FFD700',
    lightBg: '#FFFACD',
    description: '30-day streak',
    requirement: 'Practice 30 consecutive days',
  },
};

export default function BadgeCard({
  type,
  status,
  progress = 0,
  maxProgress = 10,
  showProgress = true,
  onClick,
  dayNumber = 10,
}: BadgeCardProps) {
  const config = BADGE_CONFIG[type];
  const isLocked = status === 'locked';
  const progressPercent = maxProgress ? (progress / maxProgress) * 100 : 0;
  const [showTooltip, setShowTooltip] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `I've reached Day ${dayNumber} in my ${config.name} learning streak! 🎉 ${config.emoji}`;
    if (navigator.share) {
      navigator.share({
        title: 'WizLingo Achievement',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Badge achievement copied! Share it with friends 🌟');
    }
  };

  return (
    <div
      className={`
        relative w-full max-w-[180px]
        transition-all duration-300 hover:scale-105 active:scale-95
        cursor-pointer group
      `}
      onClick={onClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip */}
      {showTooltip && !isLocked && (
        <div className="absolute -top-36 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs rounded-lg p-3 w-44 shadow-2xl border border-white/20">
          <p className="font-bold mb-2">{config.name}</p>
          <p className="text-gray-300 text-xs mb-3">{config.requirement}</p>
          <button
            onClick={handleShare}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-2 rounded transition-colors"
          >
            📤 Share Achievement
          </button>
        </div>
      )}

      {/* Main Card Container */}
      <div
        className={`
          relative rounded-2xl p-6 text-center transition-all
          border-2 backdrop-blur-sm
          ${isLocked
            ? `bg-gray-500/10 border-gray-500/30 opacity-60`
            : `bg-white/5 border-${config.color === '#FF6B6B' ? 'red' : config.color === '#8B5CF6' ? 'purple' : config.color === '#EC4899' ? 'pink' : config.color === '#6366F1' ? 'indigo' : config.color === '#F59E0B' ? 'amber' : config.color === '#FF7F50' ? 'orange' : 'yellow'}-500/20`
        }`}
        style={!isLocked ? {
          backgroundColor: `${config.lightBg}20`,
          borderColor: `${config.color}40`,
        } : {}}
      >
        {/* Lock Icon */}
        {isLocked && (
          <div className="absolute -top-3 -right-3 bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg">
            🔒
          </div>
        )}

        {/* Top: Rarity Stars */}
        <div className="flex justify-center gap-1 mb-3">
          {[...Array(config.rarity)].map((_, i) => (
            <span key={i} className="text-sm">⭐</span>
          ))}
        </div>

        {/* Day Number - Hero Element */}
        <div className="mb-2">
          <div className="text-5xl font-black" style={{ color: config.color }}>
            {isLocked ? '?' : dayNumber}
          </div>
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mt-1">Day</p>
        </div>

        {/* Emoji */}
        <div className="text-5xl mb-4 drop-shadow-lg">{config.emoji}</div>

        {/* Badge Name */}
        <h3 className="font-black text-sm uppercase tracking-tight text-white mb-2">
          {config.name}
        </h3>

        {/* Status - Animated accent line */}
        <div
          className="h-1 w-12 mx-auto mb-3 rounded-full transition-all"
          style={{ backgroundColor: config.color }}
        />

        {/* Status Text */}
        <p className="text-xs font-semibold" style={{ color: config.color }}>
          {isLocked ? '🔒 Locked' : '✓ Unlocked'}
        </p>
      </div>

      {/* Progress Bar - Locked Only */}
      {isLocked && showProgress && (
        <div className="mt-4 px-1">
          <div className="bg-gray-600/30 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: config.color,
              }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            {progress}/{maxProgress} sessions
          </p>
        </div>
      )}
    </div>
  );
}
