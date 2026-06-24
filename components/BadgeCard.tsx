'use client';

import { useState, useRef } from 'react';

interface BadgeCardProps {
  type: 'SPARK' | 'WORD_WIZARD' | 'VOICE_WIZARD' | 'LANGUAGE_WIZARD' | 'GRAND_WIZARD' | 'WEEK_WARRIOR' | 'MONTH_MASTER';
  status: 'earned' | 'locked';
  progress?: number;
  maxProgress?: number;
  showProgress?: boolean;
  onClick?: () => void;
  studentName?: string;
}

const BADGE_CONFIG = {
  SPARK: {
    emoji: '✨',
    name: 'Spark',
    rarity: 1,
    color: '#FF6B6B',
    gradientStart: '#FFE66D',
    gradientEnd: '#FF6B6B',
    description: 'First step',
    requirement: 'Complete 1 reading session',
    unlockMessage: 'Your first step into reading!'
  },
  WORD_WIZARD: {
    emoji: '📚',
    name: 'Word Wizard',
    rarity: 3,
    color: '#9333EA',
    gradientStart: '#C084FC',
    gradientEnd: '#9333EA',
    description: 'Reading master',
    requirement: 'Achieve 80%+ accuracy in reading',
    unlockMessage: 'You\'re a master of reading comprehension!'
  },
  VOICE_WIZARD: {
    emoji: '🎤',
    name: 'Voice Wizard',
    rarity: 3,
    color: '#EC4899',
    gradientStart: '#F472B6',
    gradientEnd: '#EC4899',
    description: 'Speaking master',
    requirement: 'Achieve 75%+ fluency in speaking',
    unlockMessage: 'Your pronunciation is excellent!'
  },
  LANGUAGE_WIZARD: {
    emoji: '🧙',
    name: 'Language Wizard',
    rarity: 3,
    color: '#6366F1',
    gradientStart: '#818CF8',
    gradientEnd: '#6366F1',
    description: 'Committed learner',
    requirement: 'Complete 10 reading or speaking sessions',
    unlockMessage: 'Your dedication is incredible!'
  },
  GRAND_WIZARD: {
    emoji: '👑',
    name: 'Grand Wizard',
    rarity: 4,
    color: '#FCD34D',
    gradientStart: '#FEF3C7',
    gradientEnd: '#FCD34D',
    description: 'Ultimate master',
    requirement: 'Earn all 4 badges above',
    unlockMessage: 'You\'ve mastered WizLingo!'
  },
  WEEK_WARRIOR: {
    emoji: '🔥',
    name: 'Week Warrior',
    rarity: 2,
    color: '#FF7F50',
    gradientStart: '#FFAD5A',
    gradientEnd: '#FF7F50',
    description: '7-day streak',
    requirement: 'Practice 7 consecutive days',
    unlockMessage: 'Your consistency is amazing!'
  },
  MONTH_MASTER: {
    emoji: '⚡',
    name: 'Month Master',
    rarity: 2,
    color: '#FFD700',
    gradientStart: '#FFF44F',
    gradientEnd: '#FFD700',
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
  studentName = 'Friend'
}: BadgeCardProps) {
  const config = BADGE_CONFIG[type];
  const isLocked = status === 'locked';
  const progressPercent = maxProgress ? (progress / maxProgress) * 100 : 0;
  const [showTooltip, setShowTooltip] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareCanvasRef = useRef<HTMLCanvasElement>(null);

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

  const generateShareImage = async () => {
    const canvas = shareCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size (Instagram square)
    canvas.width = 1080;
    canvas.height = 1080;

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
    gradient.addColorStop(0, '#0f0c29');
    gradient.addColorStop(0.5, '#302b63');
    gradient.addColorStop(1, '#24243e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);

    // Badge circle
    const centerX = 540;
    const centerY = 420;
    const radius = 200;

    // Outer glow
    ctx.fillStyle = `${config.color}40`;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 40, 0, Math.PI * 2);
    ctx.fill();

    // Badge gradient circle
    const badgeGradient = ctx.createRadialGradient(centerX - 50, centerY - 50, 0, centerX, centerY, radius);
    badgeGradient.addColorStop(0, config.gradientStart);
    badgeGradient.addColorStop(1, config.gradientEnd);
    ctx.fillStyle = badgeGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Shine effect
    const shineGradient = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
    shineGradient.addColorStop(0, 'rgba(255,255,255,0.4)');
    shineGradient.addColorStop(0.5, 'rgba(255,255,255,0)');
    shineGradient.addColorStop(1, 'rgba(255,255,255,0.1)');
    ctx.fillStyle = shineGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Emoji
    ctx.font = 'bold 180px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.filter = 'drop-shadow(0px 4px 8px rgba(0,0,0,0.5))';
    ctx.fillText(config.emoji, centerX, centerY - 30);

    // Reset filter
    ctx.filter = 'none';

    // Badge name
    ctx.font = 'bold 72px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(config.name, centerX, centerY + 120);

    // Stars
    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    let starX = centerX - (config.rarity * 35);
    for (let i = 0; i < config.rarity; i++) {
      ctx.fillText('⭐', starX + i * 70, centerY + 220);
    }

    // WizLingo text
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('WizLingo', centerX, 950);

    // Download image
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${config.name}-badge-${studentName}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  return (
    <div className="relative">
      <canvas ref={shareCanvasRef} className="hidden" />

      <div
        className={`
          relative w-full aspect-square max-w-[160px] sm:max-w-[180px]
          transition-all duration-300 hover:scale-105 active:scale-95
          cursor-pointer group
          ${isLocked ? 'opacity-60' : 'opacity-100'}
        `}
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => { setShowTooltip(false); setShowShareMenu(false); }}
      >
        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs rounded-xl p-4 w-48 shadow-2xl border border-white/20">
            <p className="font-bold mb-1 text-sm">{config.name}</p>
            <p className="text-gray-300 text-xs mb-3">{config.requirement}</p>
            <div className="flex gap-2">
              {!isLocked && (
                <>
                  <button
                    onClick={handleShare}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1.5 rounded-lg transition-colors"
                  >
                    📤 Share
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      generateShareImage();
                    }}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold py-1.5 rounded-lg transition-colors"
                  >
                    🖼️ Image
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Main badge circle */}
        <div
          className="relative w-full h-full rounded-full shadow-2xl transition-all group-hover:shadow-2xl group-hover:drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
          style={{
            background: `linear-gradient(135deg, ${config.gradientStart}, ${config.gradientEnd})`,
            filter: isLocked ? 'grayscale(80%) brightness(0.6)' : 'drop-shadow(0 8px 20px rgba(0,0,0,0.3))',
          }}
        >
          {/* Shine/gloss overlay */}
          <div className="absolute inset-0 rounded-full opacity-30 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 100%)'
            }}
          />

          {/* Lock overlay */}
          {isLocked && (
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center z-10">
              <div className="text-5xl">🔒</div>
            </div>
          )}

          {/* Content */}
          <div className="relative z-5 w-full h-full flex flex-col items-center justify-center p-3">
            {/* Rarity stars - top */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1">
              {[...Array(config.rarity)].map((_, i) => (
                <span key={i} className="text-xs">⭐</span>
              ))}
            </div>

            {/* Main emoji */}
            <span className="text-5xl sm:text-6xl drop-shadow-lg leading-none">
              {config.emoji}
            </span>

            {/* Badge name */}
            <p className="text-white font-black text-xs sm:text-sm uppercase tracking-tight mt-2 text-center line-clamp-2">
              {config.name}
            </p>
          </div>
        </div>

        {/* Status badge bottom */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white/95 text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          {isLocked ? '🔒 Locked' : '✨ Unlocked'}
        </div>

        {/* Progress bar for locked */}
        {isLocked && showProgress && (
          <div className="absolute -bottom-8 left-0 right-0 px-2">
            <div className="bg-white/20 rounded-full h-1 overflow-hidden">
              <div
                className="bg-white h-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-white/70 text-xs text-center mt-1">
              {progress}/{maxProgress}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
