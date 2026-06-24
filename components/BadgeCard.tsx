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
    color1: '#FF5722',
    color2: '#FFB74D',
    colorAccent: '#FFD700',
    description: 'First step',
  },
  WORD_WIZARD: {
    emoji: '📚',
    name: 'Word Wizard',
    rarity: 3,
    color1: '#3F51B5',
    color2: '#5C6BC0',
    colorAccent: '#FFD700',
    description: 'Reading master',
  },
  VOICE_WIZARD: {
    emoji: '🎤',
    name: 'Voice Wizard',
    rarity: 3,
    color1: '#7B1FA2',
    color2: '#9C27B0',
    colorAccent: '#FF1493',
    description: 'Speaking master',
  },
  LANGUAGE_WIZARD: {
    emoji: '🧙',
    name: 'Language Wizard',
    rarity: 3,
    color1: '#00796B',
    color2: '#00897B',
    colorAccent: '#FFD700',
    description: 'Committed learner',
  },
  GRAND_WIZARD: {
    emoji: '👑',
    name: 'Grand Wizard',
    rarity: 4,
    color1: '#D84315',
    color2: '#FF6F00',
    colorAccent: '#FFD700',
    description: 'Ultimate master',
  },
  WEEK_WARRIOR: {
    emoji: '🔥',
    name: 'Week Warrior',
    rarity: 2,
    color1: '#C62828',
    color2: '#E53935',
    colorAccent: '#FFD700',
    description: '7-day streak',
  },
  MONTH_MASTER: {
    emoji: '⚡',
    name: 'Month Master',
    rarity: 2,
    color1: '#E65100',
    color2: '#FF6F00',
    colorAccent: '#FFD700',
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

    canvas.width = 1080;
    canvas.height = 1080;

    // Premium gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1080);
    bgGrad.addColorStop(0, '#0F0C29');
    bgGrad.addColorStop(0.5, '#1a1636');
    bgGrad.addColorStop(1, '#0F0C29');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1080);

    // Decorative top element - stars
    ctx.fillStyle = config.colorAccent;
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('✨✨✨', 540, 140);

    // Main shield - 3D effect
    const shieldX = 150;
    const shieldY = 220;
    const shieldW = 780;
    const shieldH = 500;

    // Shadow layer (depth)
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.moveTo(shieldX + 390, shieldY + 20);
    ctx.lineTo(shieldX + shieldW - 30, shieldY + 120);
    ctx.lineTo(shieldX + shieldW - 30, shieldY + 280);
    ctx.quadraticCurveTo(shieldX + 390, shieldY + shieldH + 40, shieldX + 30, shieldY + 280);
    ctx.lineTo(shieldX + 30, shieldY + 120);
    ctx.closePath();
    ctx.fill();

    // Main shield gradient - BOLD & RICH
    const shieldGrad = ctx.createLinearGradient(shieldX, shieldY, shieldX + shieldW, shieldY + shieldH);
    shieldGrad.addColorStop(0, config.color1);
    shieldGrad.addColorStop(0.5, config.color2);
    shieldGrad.addColorStop(1, config.color1);
    ctx.fillStyle = shieldGrad;
    ctx.beginPath();
    ctx.moveTo(shieldX + 390, shieldY);
    ctx.lineTo(shieldX + shieldW, shieldY + 100);
    ctx.lineTo(shieldX + shieldW, shieldY + 280);
    ctx.quadraticCurveTo(shieldX + 390, shieldY + shieldH, shieldX, shieldY + 280);
    ctx.lineTo(shieldX, shieldY + 100);
    ctx.closePath();
    ctx.fill();

    // Gold border - THICK & BOLD
    ctx.strokeStyle = config.colorAccent;
    ctx.lineWidth = 6;
    ctx.stroke();

    // Shine effect (3D top)
    const shineGrad = ctx.createLinearGradient(shieldX, shieldY, shieldX + shieldW, shieldY + 200);
    shineGrad.addColorStop(0, 'rgba(255,255,255,0.35)');
    shineGrad.addColorStop(0.5, 'rgba(255,255,255,0.1)');
    shineGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shineGrad;
    ctx.beginPath();
    ctx.moveTo(shieldX + 390, shieldY + 10);
    ctx.lineTo(shieldX + shieldW - 40, shieldY + 110);
    ctx.lineTo(shieldX + shieldW - 40, shieldY + 250);
    ctx.quadraticCurveTo(shieldX + 390, shieldY + 280, shieldX + 40, shieldY + 250);
    ctx.lineTo(shieldX + 40, shieldY + 110);
    ctx.closePath();
    ctx.fill();

    // DAY SECTION - Large and bold
    ctx.font = 'bold 280px Arial';
    ctx.fillStyle = config.colorAccent;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.fillText(isLocked ? '?' : dayNumber, shieldX + shieldW / 2, shieldY + 180);
    ctx.shadowColor = 'transparent';

    // DAY label
    ctx.font = 'bold 64px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fillText('DAY', shieldX + shieldW / 2, shieldY + 320);

    // Rarity stars - BOLD positioning
    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    const starStartX = shieldX + shieldW / 2 - (config.rarity * 50) / 2;
    for (let i = 0; i < config.rarity; i++) {
      ctx.fillText('⭐', starStartX + i * 55, shieldY + 400);
    }

    // Emoji - LARGE
    ctx.font = '140px Arial';
    ctx.fillText(config.emoji, shieldX + shieldW / 2, shieldY + 500);

    // Bottom branding section - RICH
    const bottomY = shieldY + shieldH + 80;

    // Decorative line
    ctx.strokeStyle = config.colorAccent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(300, bottomY - 20);
    ctx.lineTo(780, bottomY - 20);
    ctx.stroke();

    // Badge name
    ctx.font = 'bold 72px Fredoka, Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.textAlign = 'center';
    ctx.fillText(config.name, 540, bottomY + 30);

    // WizLingo branding - BOLD
    ctx.font = 'bold 56px Arial';
    ctx.fillStyle = config.colorAccent;
    ctx.fillText('🎓 WIZLINGO', 540, bottomY + 110);

    // Achievement message
    ctx.font = 'italic 40px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText(`Achievement Unlocked!`, 540, bottomY + 170);

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
    <div className="relative w-full max-w-[210px] transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer group">
      <canvas ref={canvasRef} className="hidden" />

      {/* Share Menu */}
      {showShareMenu && (
        <div className="absolute -top-56 left-1/2 -translate-x-1/2 z-50 bg-gray-950 text-white rounded-2xl p-4 w-56 shadow-2xl border-2 border-yellow-500/30 backdrop-blur-sm">
          <p className="font-bold mb-4 text-center text-sm uppercase tracking-widest">Share Achievement</p>
          <div className="space-y-3">
            <button
              onClick={shareToWhatsApp}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors text-sm font-fredoka"
            >
              💬 WhatsApp Status
            </button>
            <button
              onClick={() => generateShareImage()}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg transition-colors text-sm font-fredoka"
            >
              📸 Download Image
            </button>
          </div>
        </div>
      )}

      {/* Main Badge - PREMIUM 3D SHIELD */}
      <div className="relative overflow-hidden">
        <svg viewBox="0 0 240 320" className="w-full h-auto drop-shadow-2xl" style={{ filter: isLocked ? 'grayscale(0.8) brightness(0.6)' : 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' }}>
          <defs>
            <linearGradient id={`badge-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={config.color1} stopOpacity="1" />
              <stop offset="50%" stopColor={config.color2} stopOpacity="0.95" />
              <stop offset="100%" stopColor={config.color1} stopOpacity="1" />
            </linearGradient>

            <linearGradient id={`shine-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.4" />
              <stop offset="30%" stopColor="white" stopOpacity="0.1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>

            <filter id={`glow-${type}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <pattern id={`texture-${type}`} patternUnits="userSpaceOnUse" width="4" height="4">
              <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.08)" />
            </pattern>
          </defs>

          {/* Outer glow shadow */}
          <ellipse cx="120" cy="80" rx="95" ry="25" fill={config.color1} opacity="0.3" filter={`url(#glow-${type})`} />

          {/* Main shield - 3D shape */}
          <path
            d="M 120,15 L 190,55 L 190,140 Q 190,240 120,290 Q 50,240 50,140 L 50,55 Z"
            fill={`url(#badge-${type})`}
            stroke={config.colorAccent}
            strokeWidth="3"
          />

          {/* Inner dark shading for 3D */}
          <path
            d="M 120,25 L 180,60 L 180,135 Q 180,235 120,280 Q 60,235 60,135 L 60,60 Z"
            fill="rgba(0,0,0,0.15)"
          />

          {/* Shine overlay for 3D effect */}
          <path
            d="M 120,20 L 175,55 L 175,120 Q 175,210 120,260 Q 65,210 65,120 L 65,55 Z"
            fill={`url(#shine-${type})`}
          />

          {/* Texture pattern */}
          <path
            d="M 120,15 L 190,55 L 190,140 Q 190,240 120,290 Q 50,240 50,140 L 50,55 Z"
            fill={`url(#texture-${type})`}
          />

          {/* Decorative top element */}
          <circle cx="120" cy="25" r="8" fill={config.colorAccent} opacity="0.9" />
          <circle cx="105" cy="35" r="5" fill={config.colorAccent} opacity="0.7" />
          <circle cx="135" cy="35" r="5" fill={config.colorAccent} opacity="0.7" />

          {/* Large day number */}
          <text
            x="120"
            y="115"
            fontSize="90"
            fontWeight="900"
            textAnchor="middle"
            dominantBaseline="middle"
            fill={config.colorAccent}
            style={{
              textShadow: `3px 3px 6px rgba(0,0,0,0.5)`,
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
            }}
          >
            {isLocked ? '?' : dayNumber}
          </text>

          {/* DAY label */}
          <text
            x="120"
            y="165"
            fontSize="20"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.95)"
            letterSpacing="2"
          >
            DAY
          </text>

          {/* Rarity stars */}
          {[...Array(config.rarity)].map((_, i) => (
            <text
              key={i}
              x={95 + i * 25}
              y="195"
              fontSize="18"
              textAnchor="middle"
            >
              ⭐
            </text>
          ))}

          {/* Emoji */}
          <text
            x="120"
            y="245"
            fontSize="50"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {config.emoji}
          </text>
        </svg>

        {/* Lock overlay */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
            <div className="text-6xl">🔒</div>
          </div>
        )}
      </div>

      {/* Bottom info section */}
      <div className="mt-4 text-center">
        <h3 className="font-black text-sm uppercase tracking-tight text-white mb-2" style={{ color: config.color1 }}>
          {config.name}
        </h3>

        <div className="h-1.5 w-10 mx-auto mb-2 rounded-full" style={{ backgroundColor: config.colorAccent }} />

        <p className="text-xs font-bold" style={{ color: config.colorAccent }}>
          {isLocked ? '🔒 Locked' : '✓ Unlocked'}
        </p>

        {!isLocked && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowShareMenu(!showShareMenu);
            }}
            className="w-full mt-3 py-2 text-xs font-black text-white rounded-lg transition-all uppercase tracking-widest"
            style={{
              background: `linear-gradient(135deg, ${config.color1}, ${config.colorAccent})`,
            }}
          >
            🚀 Share
          </button>
        )}
      </div>

      {/* Progress bar */}
      {isLocked && showProgress && (
        <div className="mt-3 px-1">
          <div className="bg-gray-700/50 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%`, backgroundColor: config.colorAccent }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1 text-center">{progress}/{maxProgress}</p>
        </div>
      )}
    </div>
  );
}
