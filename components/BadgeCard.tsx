'use client';

import { useState, useRef } from 'react';

interface BadgeCardProps {
  type: 'SPARK' | 'WORD_WIZARD' | 'VOICE_WIZARD' | 'LANGUAGE_WIZARD' | 'GRAND_WIZARD' | 'WEEK_WARRIOR' | 'MONTH_MASTER';
  status: 'earned' | 'locked';
  progress?: number;
  maxProgress?: number;
  showProgress?: boolean;
  onClick?: () => void;
  dayNumber?: number;
  studentName?: string;
}

const BADGE_CONFIG = {
  SPARK: {
    emoji: '✨',
    name: 'Spark',
    rarity: 1,
    primaryColor: '#F97316',
    accentColor: '#FFD700',
    bgLight: '#FFF7ED',
    description: 'First step',
  },
  WORD_WIZARD: {
    emoji: '📚',
    name: 'Word Wizard',
    rarity: 3,
    primaryColor: '#4F46E5',
    accentColor: '#FFD700',
    bgLight: '#EEF2FF',
    description: 'Reading master',
  },
  VOICE_WIZARD: {
    emoji: '🎤',
    name: 'Voice Wizard',
    rarity: 3,
    primaryColor: '#9333EA',
    accentColor: '#F43F88',
    bgLight: '#FAF5FF',
    description: 'Speaking master',
  },
  LANGUAGE_WIZARD: {
    emoji: '🧙',
    name: 'Language Wizard',
    rarity: 3,
    primaryColor: '#059669',
    accentColor: '#FFD700',
    bgLight: '#ECFDF5',
    description: 'Committed learner',
  },
  GRAND_WIZARD: {
    emoji: '👑',
    name: 'Grand Wizard',
    rarity: 4,
    primaryColor: '#D97706',
    accentColor: '#FFD700',
    bgLight: '#FFFBEB',
    description: 'Ultimate master',
  },
  WEEK_WARRIOR: {
    emoji: '🔥',
    name: 'Week Warrior',
    rarity: 2,
    primaryColor: '#DC2626',
    accentColor: '#FFD700',
    bgLight: '#FEE2E2',
    description: '7-day streak',
  },
  MONTH_MASTER: {
    emoji: '⚡',
    name: 'Month Master',
    rarity: 2,
    primaryColor: '#F59E0B',
    accentColor: '#FFD700',
    bgLight: '#FFFBEB',
    description: '30-day streak',
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
  studentName = 'My child',
}: BadgeCardProps) {
  const config = BADGE_CONFIG[type];
  const isLocked = status === 'locked';
  const progressPercent = maxProgress ? (progress / maxProgress) * 100 : 0;
  const [showShareMenu, setShowShareMenu] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateShareImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Instagram square size
    canvas.width = 1080;
    canvas.height = 1080;

    // Gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 1080, 1080);
    bgGradient.addColorStop(0, '#0F0C29');
    bgGradient.addColorStop(0.5, '#302b63');
    bgGradient.addColorStop(1, '#24243e');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1080, 1080);

    // Shield background
    const shieldX = 200;
    const shieldY = 250;
    const shieldW = 680;
    const shieldH = 520;

    // Shield outer glow
    ctx.fillStyle = `${config.primaryColor}30`;
    ctx.beginPath();
    ctx.roundRect(shieldX - 40, shieldY - 40, shieldW + 80, shieldH + 80, 50);
    ctx.fill();

    // Main shield gradient
    const shieldGrad = ctx.createLinearGradient(shieldX, shieldY, shieldX + shieldW, shieldY + shieldH);
    shieldGrad.addColorStop(0, config.primaryColor);
    shieldGrad.addColorStop(1, config.bgLight);
    ctx.fillStyle = shieldGrad;
    ctx.beginPath();
    ctx.roundRect(shieldX, shieldY, shieldW, shieldH, 40);
    ctx.fill();

    // Shield border
    ctx.strokeStyle = config.accentColor;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Inner highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.roundRect(shieldX + 10, shieldY + 10, shieldW - 20, shieldH / 2, 30);
    ctx.fill();

    // Day number - large and gold
    ctx.font = 'bold 240px Fredoka, Arial';
    ctx.fillStyle = config.accentColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isLocked ? '?' : dayNumber, shieldX + shieldW / 2, shieldY + 180);

    // "DAY" label
    ctx.font = 'bold 50px Fredoka, Arial';
    ctx.fillStyle = config.primaryColor;
    ctx.fillText('DAY', shieldX + shieldW / 2, shieldY + 280);

    // Rarity stars
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    let starX = shieldX + shieldW / 2 - (config.rarity * 40) / 2;
    for (let i = 0; i < config.rarity; i++) {
      ctx.fillText('⭐', starX + i * 50, shieldY + 360);
    }

    // Badge emoji
    ctx.font = '120px Arial';
    ctx.fillText(config.emoji, shieldX + shieldW / 2, shieldY + 470);

    // Badge name
    ctx.font = 'bold 60px Fredoka, Arial';
    ctx.fillStyle = config.primaryColor;
    ctx.fillText(config.name, shieldX + shieldW / 2, shieldY + 580);

    // Bottom section - WizLingo branding
    const bottomY = shieldY + shieldH + 100;

    // Motivational message
    ctx.font = 'italic 36px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(`"${studentName} unlocked achievement!"`, 540, bottomY + 50);

    // WizLingo branding
    ctx.font = 'bold 48px Fredoka, Arial';
    ctx.fillStyle = '#9333EA';
    ctx.fillText('🎓 WizLingo', 540, bottomY + 120);

    // Tagline
    ctx.font = '32px Arial';
    ctx.fillStyle = '#ccc';
    ctx.fillText('Learning Made Fun & Interactive', 540, bottomY + 170);

    // CTA
    ctx.font = 'bold 36px Fredoka, Arial';
    ctx.fillStyle = '#4ade80';
    ctx.fillText('Join Now →', 540, bottomY + 230);

    // Download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${config.name}-day-${dayNumber}-wizlingo.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  const shareToWhatsApp = () => {
    const text = `🎉 My child ${studentName} just reached Day ${dayNumber} on ${config.name}! 🏆 ${config.emoji}\n\nJoin WizLingo - Making learning fun!\nhttps://wizlingo.edvanta.co.in/login`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="relative w-full max-w-[200px] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer group">
      <canvas ref={canvasRef} className="hidden" />

      {/* Share Menu */}
      {showShareMenu && (
        <div className="absolute -top-52 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white rounded-xl p-4 w-56 shadow-2xl border border-white/20 backdrop-blur-sm">
          <p className="font-bold mb-4 text-center text-sm">Share Achievement</p>
          <div className="space-y-2">
            <button
              onClick={shareToWhatsApp}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-lg transition-colors"
            >
              💬 WhatsApp
            </button>
            <button
              onClick={() => generateShareImage()}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2.5 rounded-lg transition-colors"
            >
              📸 Download
            </button>
          </div>
        </div>
      )}

      {/* Main Badge Container */}
      <div
        className="relative rounded-3xl p-8 text-center transition-all border-4 backdrop-blur-sm shadow-2xl"
        style={{
          backgroundColor: config.bgLight,
          borderColor: config.primaryColor,
          background: `linear-gradient(135deg, ${config.bgLight} 0%, rgba(255,255,255,0.5) 100%)`,
        }}
      >
        {/* Lock Icon */}
        {isLocked && (
          <div className="absolute -top-4 -right-4 bg-gray-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-lg">
            🔒
          </div>
        )}

        {/* Shield Background SVG */}
        <svg viewBox="0 0 200 220" className="w-full h-auto mb-3" style={{ maxHeight: '120px' }}>
          <defs>
            <linearGradient id={`shield-grad-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={config.primaryColor} stopOpacity="1" />
              <stop offset="100%" stopColor={config.primaryColor} stopOpacity="0.7" />
            </linearGradient>
            <filter id={`shadow-${type}`} x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Shield shape */}
          <path
            d="M 100,10 L 160,40 L 160,100 Q 160,160 100,200 Q 40,160 40,100 L 40,40 Z"
            fill={`url(#shield-grad-${type})`}
            stroke={config.accentColor}
            strokeWidth="2"
            filter={`url(#shadow-${type})`}
          />

          {/* Shield highlight */}
          <path
            d="M 100,15 L 155,43 L 155,95 Q 155,155 100,195 Q 45,155 45,95 L 45,43 Z"
            fill="white"
            opacity="0.2"
          />

          {/* Day number in shield */}
          <text x="100" y="85" fontSize="60" fontWeight="900" textAnchor="middle" fill={config.accentColor}>
            {isLocked ? '?' : dayNumber}
          </text>

          {/* Stars */}
          {[...Array(config.rarity)].map((_, i) => (
            <text key={i} x={80 + i * 20} y="120" fontSize="14" textAnchor="middle">
              ⭐
            </text>
          ))}

          {/* Emoji at bottom */}
          <text x="100" y="175" fontSize="40" textAnchor="middle">
            {config.emoji}
          </text>
        </svg>

        {/* Badge Name */}
        <h3 className="font-black text-base uppercase tracking-tight mb-2" style={{ color: config.primaryColor }}>
          {config.name}
        </h3>

        {/* Divider */}
        <div className="h-1 w-12 mx-auto mb-3 rounded-full" style={{ backgroundColor: config.accentColor }} />

        {/* Status */}
        <p className="text-xs font-bold mb-3" style={{ color: config.primaryColor }}>
          {isLocked ? '🔒 Locked' : '✓ Unlocked'}
        </p>

        {/* Share Button */}
        {!isLocked && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowShareMenu(!showShareMenu);
            }}
            className="w-full py-2 text-xs font-bold text-white rounded-lg transition-all"
            style={{
              background: `linear-gradient(135deg, ${config.primaryColor}, ${config.accentColor})`,
            }}
          >
            🚀 Share
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {isLocked && showProgress && (
        <div className="mt-4 px-1">
          <div className="bg-gray-600/30 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%`, backgroundColor: config.primaryColor }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            {progress}/{maxProgress}
          </p>
        </div>
      )}
    </div>
  );
}
