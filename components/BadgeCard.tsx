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
  motivationalMessage?: string;
}

const BADGE_CONFIG = {
  SPARK: {
    emoji: '✨',
    name: 'Spark',
    rarity: 1,
    primaryColor: '#FF6B6B',
    accentColor: '#FFD700',
    secondaryColor: '#FFA500',
    description: 'First step',
    requirement: 'Complete 1 reading session',
    unlockMessage: 'Your first step into reading!'
  },
  WORD_WIZARD: {
    emoji: '📚',
    name: 'Word Wizard',
    rarity: 3,
    primaryColor: '#8B5CF6',
    accentColor: '#C4B5FD',
    secondaryColor: '#DDD6FE',
    description: 'Reading master',
    requirement: 'Achieve 80%+ accuracy in reading',
    unlockMessage: 'You\'re a master of reading comprehension!'
  },
  VOICE_WIZARD: {
    emoji: '🎤',
    name: 'Voice Wizard',
    rarity: 3,
    primaryColor: '#EC4899',
    accentColor: '#F472B6',
    secondaryColor: '#FBE9F3',
    description: 'Speaking master',
    requirement: 'Achieve 75%+ fluency in speaking',
    unlockMessage: 'Your pronunciation is excellent!'
  },
  LANGUAGE_WIZARD: {
    emoji: '🧙',
    name: 'Language Wizard',
    rarity: 3,
    primaryColor: '#6366F1',
    accentColor: '#818CF8',
    secondaryColor: '#E0E7FF',
    description: 'Committed learner',
    requirement: 'Complete 10 reading or speaking sessions',
    unlockMessage: 'Your dedication is incredible!'
  },
  GRAND_WIZARD: {
    emoji: '👑',
    name: 'Grand Wizard',
    rarity: 4,
    primaryColor: '#D97706',
    accentColor: '#FCD34D',
    secondaryColor: '#FEF3C7',
    description: 'Ultimate master',
    requirement: 'Earn all 4 badges above',
    unlockMessage: 'You\'ve mastered WizLingo!'
  },
  WEEK_WARRIOR: {
    emoji: '🔥',
    name: 'Week Warrior',
    rarity: 2,
    primaryColor: '#FF7F50',
    accentColor: '#FFAD5A',
    secondaryColor: '#FFE0CC',
    description: '7-day streak',
    requirement: 'Practice 7 consecutive days',
    unlockMessage: 'Your consistency is amazing!'
  },
  MONTH_MASTER: {
    emoji: '⚡',
    name: 'Month Master',
    rarity: 2,
    primaryColor: '#FFD700',
    accentColor: '#FFF44F',
    secondaryColor: '#FFFACD',
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
  onClick,
  dayNumber = 10,
  motivationalMessage = "I'm proud of today's commitment"
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
        relative w-full max-w-[220px]
        transition-all duration-300 hover:scale-105
        cursor-pointer group
        ${isLocked ? 'opacity-60' : 'opacity-100'}
      `}
      onClick={onClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs rounded-lg p-3 w-48 shadow-2xl border border-white/20">
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

      {/* Main Badge Container - Shield Shape with SVG */}
      <div className="relative" style={{ perspective: '1200px' }}>
        <svg
          viewBox="0 0 240 280"
          className="w-full drop-shadow-2xl group-hover:drop-shadow-none transition-all"
          style={{
            filter: isLocked ? 'grayscale(80%) brightness(0.7)' : 'drop-shadow(0 12px 24px rgba(0,0,0,0.4))',
          }}
        >
          <defs>
            {/* Main gradient */}
            <linearGradient id={`grad-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={config.primaryColor} stopOpacity="0.95" />
              <stop offset="50%" stopColor={config.primaryColor} stopOpacity="0.85" />
              <stop offset="100%" stopColor={config.secondaryColor} stopOpacity="0.95" />
            </linearGradient>

            {/* Shine/highlight gradient */}
            <linearGradient id={`shine-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.25" />
              <stop offset="50%" stopColor="white" stopOpacity="0" />
              <stop offset="100%" stopColor="black" stopOpacity="0.1" />
            </linearGradient>

            {/* Glow filter */}
            <filter id={`glow-${type}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer glow shadow */}
          <path
            d="M 120,20 L 200,65 L 200,140 Q 200,220 120,270 Q 40,220 40,140 L 40,65 Z"
            fill={config.primaryColor}
            opacity="0.2"
            filter={`url(#glow-${type})`}
          />

          {/* Main shield body */}
          <path
            d="M 120,20 L 200,65 L 200,140 Q 200,220 120,270 Q 40,220 40,140 L 40,65 Z"
            fill={`url(#grad-${type})`}
            stroke={config.accentColor}
            strokeWidth="3"
          />

          {/* Shield shine/inner highlight */}
          <path
            d="M 120,30 L 190,70 L 190,135 Q 190,210 120,260 Q 50,210 50,135 L 50,70 Z"
            fill={`url(#shine-${type})`}
          />

          {/* Inner border (darker) */}
          <path
            d="M 120,35 L 185,72 L 185,130 Q 185,205 120,255 Q 55,205 55,130 L 55,72 Z"
            stroke={config.accentColor}
            strokeWidth="1.5"
            fill="none"
            opacity="0.4"
          />

          {/* Decorative laurel wreaths - left */}
          <g opacity="0.6">
            <path d="M 80,90 Q 75,100 80,110" stroke={config.accentColor} strokeWidth="1.5" fill="none" />
            <circle cx="80" cy="95" r="2" fill={config.accentColor} />
            <circle cx="78" cy="105" r="2" fill={config.accentColor} />
          </g>

          {/* Decorative laurel wreaths - right */}
          <g opacity="0.6">
            <path d="M 160,90 Q 165,100 160,110" stroke={config.accentColor} strokeWidth="1.5" fill="none" />
            <circle cx="160" cy="95" r="2" fill={config.accentColor} />
            <circle cx="162" cy="105" r="2" fill={config.accentColor} />
          </g>

          {/* DAY NUMBER - Large and prominent */}
          <text
            x="120"
            y="95"
            fontSize="52"
            fontWeight="900"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.4))"
          >
            {dayNumber}
          </text>

          {/* "DAY" label */}
          <text
            x="120"
            y="125"
            fontSize="14"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
            fill={config.accentColor}
            letterSpacing="2"
          >
            DAY
          </text>

          {/* Rarity stars - positioned at bottom of shield */}
          <g>
            {[...Array(config.rarity)].map((_, i) => (
              <text
                key={i}
                x={95 + i * 25}
                y="190"
                fontSize="16"
                textAnchor="middle"
                fill={config.accentColor}
              >
                ⭐
              </text>
            ))}
          </g>

          {/* Emoji at very bottom */}
          <text
            x="120"
            y="245"
            fontSize="32"
            textAnchor="middle"
            filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.3))"
          >
            {config.emoji}
          </text>
        </svg>

        {/* Lock overlay for locked badges */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-5xl">🔒</div>
          </div>
        )}
      </div>

      {/* Motivational message below badge */}
      <div className="mt-4 px-2 text-center">
        <p className="text-white/80 text-xs italic leading-snug">
          "{motivationalMessage}"
        </p>
      </div>

      {/* Status indicators row - like reference */}
      {!isLocked && (
        <div className="mt-3 px-2">
          <p className="text-green-400 text-xs font-bold text-center">
            ✓ DAY {dayNumber} COMPLETED
          </p>
        </div>
      )}

      {isLocked && showProgress && (
        <div className="mt-3 px-2">
          <div className="bg-white/10 rounded-full h-1.5 overflow-hidden mb-2">
            <div
              className="bg-white/60 h-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-purple-300 text-xs text-center">
            {progress}/{maxProgress} sessions
          </p>
        </div>
      )}
    </div>
  );
}
