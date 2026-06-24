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
    metalColor: '#FFD700',
    metalSecondary: '#FFA500',
    description: 'First step',
    requirement: 'Complete 1 reading session',
    unlockMessage: 'Your first step into reading!'
  },
  WORD_WIZARD: {
    emoji: '📚',
    name: 'Word Wizard',
    rarity: 3,
    metalColor: '#9333EA',
    metalSecondary: '#A855F7',
    description: 'Reading master',
    requirement: 'Achieve 80%+ accuracy in reading',
    unlockMessage: 'You\'re a master of reading comprehension!'
  },
  VOICE_WIZARD: {
    emoji: '🎤',
    name: 'Voice Wizard',
    rarity: 3,
    metalColor: '#EC4899',
    metalSecondary: '#F472B6',
    description: 'Speaking master',
    requirement: 'Achieve 75%+ fluency in speaking',
    unlockMessage: 'Your pronunciation is excellent!'
  },
  LANGUAGE_WIZARD: {
    emoji: '🧙',
    name: 'Language Wizard',
    rarity: 3,
    metalColor: '#6366F1',
    metalSecondary: '#818CF8',
    description: 'Committed learner',
    requirement: 'Complete 10 reading or speaking sessions',
    unlockMessage: 'Your dedication is incredible!'
  },
  GRAND_WIZARD: {
    emoji: '👑',
    name: 'Grand Wizard',
    rarity: 4,
    metalColor: '#FFD700',
    metalSecondary: '#FFA500',
    description: 'Ultimate master',
    requirement: 'Earn all 4 badges above',
    unlockMessage: 'You\'ve mastered WizLingo!'
  },
  WEEK_WARRIOR: {
    emoji: '🔥',
    name: 'Week Warrior',
    rarity: 2,
    metalColor: '#E5E4E2',
    metalSecondary: '#C0C0C0',
    description: '7-day streak',
    requirement: 'Practice 7 consecutive days',
    unlockMessage: 'Your consistency is amazing!'
  },
  MONTH_MASTER: {
    emoji: '⚡',
    name: 'Month Master',
    rarity: 2,
    metalColor: '#FFD700',
    metalSecondary: '#FFA500',
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
        relative w-full max-w-[200px] h-[240px]
        transition-all duration-300 hover:scale-110
        cursor-pointer group
        ${isLocked ? 'opacity-70' : 'opacity-100'}
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

      {/* SVG Shield Badge Container */}
      <svg
        viewBox="0 0 200 240"
        className="w-full h-full drop-shadow-2xl group-hover:drop-shadow-none transition-all"
        style={{
          filter: isLocked ? 'grayscale(80%) brightness(0.7)' : 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
        }}
      >
        {/* Shield shape with metallic gradient */}
        <defs>
          <linearGradient id={`shield-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={config.metalColor} stopOpacity="0.9" />
            <stop offset="50%" stopColor={config.metalSecondary} stopOpacity="0.8" />
            <stop offset="100%" stopColor={config.metalColor} stopOpacity="0.95" />
          </linearGradient>
          <filter id={`glow-${type}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer border (metallic gold/silver) */}
        <path
          d="M 100,20 L 160,60 L 160,120 Q 160,180 100,220 Q 40,180 40,120 L 40,60 Z"
          fill={config.metalColor}
          opacity="0.3"
          filter={`url(#glow-${type})`}
        />

        {/* Main shield background */}
        <path
          d="M 100,25 L 155,55 L 155,115 Q 155,175 100,215 Q 45,175 45,115 L 45,55 Z"
          fill={`url(#shield-${type})`}
          stroke={config.metalColor}
          strokeWidth="2"
        />

        {/* Inner highlight for 3D effect */}
        <path
          d="M 100,35 L 145,60 L 145,110 Q 145,165 100,205 Q 55,165 55,110 L 55,60 Z"
          fill="white"
          opacity="0.15"
        />

        {/* Rarity stars - positioned at top */}
        <g>
          {[...Array(config.rarity)].map((_, i) => (
            <text
              key={i}
              x={75 + i * 18}
              y="50"
              fontSize="16"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              ⭐
            </text>
          ))}
        </g>

        {/* Large emoji - center */}
        <text
          x="100"
          y="110"
          fontSize="60"
          textAnchor="middle"
          dominantBaseline="middle"
          className="drop-shadow-lg"
        >
          {config.emoji}
        </text>

        {/* Badge name - bottom */}
        <text
          x="100"
          y="165"
          fontSize="13"
          fontWeight="900"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          textTransform="uppercase"
          letterSpacing="1"
        >
          {config.name}
        </text>

        {/* Status - very bottom */}
        <text
          x="100"
          y="185"
          fontSize="11"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(255,255,255,0.9)"
        >
          {isLocked ? '🔒 Locked' : '🌟 Unlocked'}
        </text>

        {/* Progress bar for locked badges */}
        {isLocked && showProgress && (
          <>
            {/* Progress bar background */}
            <rect
              x="40"
              y="200"
              width="120"
              height="6"
              fill="rgba(255,255,255,0.2)"
              rx="3"
            />
            {/* Progress fill */}
            <rect
              x="40"
              y="200"
              width={120 * (progressPercent / 100)}
              height="6"
              fill="rgba(255,255,255,0.8)"
              rx="3"
              style={{ transition: 'width 0.5s ease' }}
            />
            {/* Progress text */}
            <text
              x="100"
              y="222"
              fontSize="10"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(255,255,255,0.8)"
            >
              {progress}/{maxProgress}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
