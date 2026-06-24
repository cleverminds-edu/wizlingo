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
  studentName = 'My child',
}: BadgeCardProps) {
  const config = BADGE_CONFIG[type];
  const isLocked = status === 'locked';
  const progressPercent = maxProgress ? (progress / maxProgress) * 100 : 0;
  const [showTooltip, setShowTooltip] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateShareImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Instagram square size (1080x1080)
    canvas.width = 1080;
    canvas.height = 1080;

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 1080, 1080);
    bgGradient.addColorStop(0, '#0f0c29');
    bgGradient.addColorStop(0.5, '#302b63');
    bgGradient.addColorStop(1, '#24243e');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1080, 1080);

    // Badge card area
    const cardX = 100;
    const cardY = 200;
    const cardWidth = 880;
    const cardHeight = 500;
    const cardRadius = 30;

    // Card background with color
    ctx.fillStyle = `${config.lightBg}40`;
    ctx.fillRect(cardX, cardY, cardWidth, cardHeight);

    // Card border
    ctx.strokeStyle = `${config.color}80`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cardRadius);
    ctx.stroke();

    // Left section - Large emoji and day
    const leftX = cardX + 80;
    const centerY = cardY + cardHeight / 2;

    // Day number
    ctx.font = 'bold 200px Arial';
    ctx.fillStyle = config.color;
    ctx.textAlign = 'center';
    ctx.fillText(isLocked ? '?' : dayNumber, leftX + 100, centerY - 50);

    // Day label
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#999';
    ctx.fillText('DAY', leftX + 100, centerY + 80);

    // Right section - Badge info
    const rightX = cardX + 350;

    // Stars
    ctx.font = '36px Arial';
    ctx.textAlign = 'left';
    let starText = '';
    for (let i = 0; i < config.rarity; i++) starText += '⭐ ';
    ctx.fillText(starText, rightX, centerY - 80);

    // Badge name
    ctx.font = 'bold 64px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(config.name, rightX, centerY);

    // Student name or message
    ctx.font = '32px Arial';
    ctx.fillStyle = '#ccc';
    ctx.fillText(`${studentName} unlocked!`, rightX, centerY + 70);

    // Bottom section - WizLingo branding and CTA
    const bottomY = cardY + cardHeight + 80;

    // WizLingo logo text
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#6366F1';
    ctx.textAlign = 'center';
    ctx.fillText('🎓 WizLingo', 540, bottomY);

    // Call to action
    ctx.font = '32px Arial';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('Learning Made Fun & Interactive', 540, bottomY + 60);

    // Join message
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#4ade80';
    ctx.fillText('Join Now & Start Your Learning Journey', 540, bottomY + 130);

    // Download image
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
    const text = `🎉 My child ${studentName} just reached Day ${dayNumber} on ${config.name}! 🏆 ${config.emoji}\n\nJoin WizLingo - Making learning fun with reading & speaking practice.\n\nhttps://wizlingo.app`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const shareToOthers = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `🎉 My child ${studentName} just reached Day ${dayNumber} on ${config.name}! 🏆 ${config.emoji}\n\nWizLingo - Learning Made Fun!\nJoin our community of learning families.`;
    if (navigator.share) {
      navigator.share({
        title: 'WizLingo Achievement',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Copied! Share with family and friends 🌟');
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
      onMouseLeave={() => { setShowTooltip(false); setShowShareMenu(false); }}
    >
      <canvas ref={canvasRef} className="hidden" />

      {/* Share Menu */}
      {showShareMenu && (
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white rounded-xl p-4 w-56 shadow-2xl border border-white/20 backdrop-blur-sm">
          <p className="font-bold mb-4 text-center text-sm">Share Achievement</p>
          <div className="space-y-2">
            <button
              onClick={shareToWhatsApp}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              💬 WhatsApp Status
            </button>
            <button
              onClick={() => generateShareImage()}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              📸 Download Image
            </button>
            <button
              onClick={shareToOthers}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              📤 Share Elsewhere
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-4 text-center">
            Other parents will be curious! 👀
          </p>
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && !isLocked && (
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs rounded-lg p-3 w-48 shadow-2xl border border-white/20">
          <p className="font-bold mb-2">{config.name}</p>
          <p className="text-gray-300 text-xs mb-3">{config.requirement}</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowShareMenu(true);
            }}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs font-bold py-2 rounded transition-colors"
          >
            🚀 Share Achievement
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

        {/* Share Button for Unlocked */}
        {!isLocked && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowShareMenu(!showShareMenu);
            }}
            className="mt-3 w-full py-1.5 text-xs font-bold text-white rounded transition-all"
            style={{
              background: `linear-gradient(135deg, ${config.color}, ${config.color}dd)`,
              opacity: showShareMenu ? 1 : 0.8,
            }}
          >
            🚀 Share
          </button>
        )}
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
