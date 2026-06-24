'use client';

import { useState } from 'react';

interface BadgeCardProps {
  type: 'SPARK' | 'WORD_WIZARD' | 'VOICE_WIZARD' | 'LANGUAGE_WIZARD' | 'GRAND_WIZARD' | 'WEEK_WARRIOR' | 'MONTH_MASTER';
  status: 'earned' | 'locked';
  progress?: number;
  maxProgress?: number;
  showProgress?: boolean;
  onClick?: () => void;
}

const BADGE_CONFIG = {
  SPARK: {
    emoji: '✨',
    name: 'Spark',
    rarity: 1,
    gradient: 'from-orange-400 to-yellow-500',
    description: 'First step',
    requirement: 'Complete 1 reading session',
    unlockMessage: 'Your first step into reading!'
  },
  WORD_WIZARD: {
    emoji: '📚',
    name: 'Word Wizard',
    rarity: 3,
    gradient: 'from-purple-500 to-indigo-600',
    description: 'Reading master',
    requirement: 'Achieve 80%+ accuracy in reading',
    unlockMessage: 'You\'re a master of reading comprehension!'
  },
  VOICE_WIZARD: {
    emoji: '🎤',
    name: 'Voice Wizard',
    rarity: 3,
    gradient: 'from-pink-500 to-rose-600',
    description: 'Speaking master',
    requirement: 'Achieve 75%+ fluency in speaking',
    unlockMessage: 'Your pronunciation is excellent!'
  },
  LANGUAGE_WIZARD: {
    emoji: '🧙',
    name: 'Language Wizard',
    rarity: 3,
    gradient: 'from-indigo-500 to-purple-600',
    description: 'Committed learner',
    requirement: 'Complete 10 reading or speaking sessions',
    unlockMessage: 'Your dedication is incredible!'
  },
  GRAND_WIZARD: {
    emoji: '👑',
    name: 'Grand Wizard',
    rarity: 4,
    gradient: 'from-yellow-400 via-orange-500 to-red-500',
    description: 'Ultimate master',
    requirement: 'Earn all 4 badges above',
    unlockMessage: 'You\'ve mastered WizLingo!'
  },
  WEEK_WARRIOR: {
    emoji: '🔥',
    name: 'Week Warrior',
    rarity: 2,
    gradient: 'from-orange-400 to-orange-500',
    description: '7-day streak',
    requirement: 'Practice 7 consecutive days',
    unlockMessage: 'Your consistency is amazing!'
  },
  MONTH_MASTER: {
    emoji: '⚡',
    name: 'Month Master',
    rarity: 2,
    gradient: 'from-yellow-400 to-orange-500',
    description: '30-day streak',
    requirement: 'Practice 30 consecutive days',
    unlockMessage: 'You\'re a learning legend!'
  },
};

export default function BadgeCard({
  type,
  status,
  progress = 0,
  maxProgress = 10,
  showProgress = true,
  onClick
}: BadgeCardProps) {
  const config = BADGE_CONFIG[type];
  const isLocked = status === 'locked';
  const progressPercent = maxProgress ? (progress / maxProgress) * 100 : 0;
  const [showTooltip, setShowTooltip] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `I just earned the ${config.name} badge on WizLingo! 🎉 ${config.emoji}`;
    if (navigator.share) {
      navigator.share({
        title: 'WizLingo Badge Unlocked',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Badge text copied! Share it with your friends 🌟');
    }
  };

  return (
    <div
      className={`
        relative w-full aspect-square max-w-[200px]
        rounded-3xl overflow-hidden
        transition-all duration-300 hover:scale-110
        cursor-pointer group
        ${isLocked ? 'opacity-60' : 'opacity-100'}
      `}
      onClick={onClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs rounded-lg p-3 w-40 shadow-xl">
          <p className="font-bold mb-1">{config.name}</p>
          <p className="text-gray-300 text-xs mb-2">{config.requirement}</p>
          {!isLocked && (
            <button
              onClick={handleShare}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1 rounded mt-2 transition-colors"
            >
              📤 Share
            </button>
          )}
        </div>
      )}
      {/* Badge background with gradient */}
      <div className={`
        absolute inset-0
        bg-gradient-to-br ${config.gradient}
        shadow-xl group-hover:shadow-2xl
        border-2 border-white/20
        group-hover:border-white/40
        transition-all
      `} />

      {/* Glow effect */}
      <div className={`
        absolute inset-0
        bg-white/10 opacity-0 group-hover:opacity-20
        transition-opacity
      `} />

      {/* Lock overlay for locked badges */}
      {isLocked && (
        <div className="absolute inset-0 bg-black/30 z-30 flex items-center justify-center">
          <div className="text-4xl">🔒</div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-between p-4">
        {/* Rarity stars - top right */}
        <div className="absolute top-3 right-3 flex gap-0.5">
          {[...Array(config.rarity)].map((_, i) => (
            <span key={i} className="text-lg">⭐</span>
          ))}
        </div>

        {/* Emoji - center */}
        <div className="flex-1 flex items-center justify-center">
          <span className="text-6xl drop-shadow-lg">{config.emoji}</span>
        </div>

        {/* Badge name and status - bottom */}
        <div className="text-center w-full">
          <h3 className="text-white font-black text-sm uppercase tracking-tight mb-1">
            {config.name}
          </h3>
          <p className="text-white/90 text-xs font-semibold">
            {isLocked ? '🔒 Locked' : '🌟 Unlocked!'}
          </p>

          {/* Progress bar for locked badges */}
          {isLocked && showProgress && (
            <div className="mt-2 w-full">
              <div className="bg-white/20 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-white/80 h-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-white/80 text-xs mt-1">
                {progress}/{maxProgress}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
