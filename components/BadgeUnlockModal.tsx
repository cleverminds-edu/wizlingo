'use client';

import { useEffect, useState } from 'react';

interface BadgeUnlockModalProps {
  badgeType: 'SPARK' | 'WORD_WIZARD' | 'VOICE_WIZARD' | 'LANGUAGE_WIZARD' | 'GRAND_WIZARD';
  studentName: string;
  isVisible: boolean;
  onClose: () => void;
}

const BADGE_CONFIG = {
  SPARK: {
    emoji: '✨',
    name: 'Spark Badge',
    message: 'You earned the Spark Badge! Your first step into the world of reading! 🎉',
    color: 'from-orange-400 to-yellow-500'
  },
  WORD_WIZARD: {
    emoji: '📚',
    name: 'Word Wizard Badge',
    message: 'You earned the Word Wizard Badge! You\'re a master of reading comprehension! 📚✨',
    color: 'from-purple-500 to-indigo-600'
  },
  VOICE_WIZARD: {
    emoji: '🎤',
    name: 'Voice Wizard Badge',
    message: 'You earned the Voice Wizard Badge! Your pronunciation is excellent! 🎤✨',
    color: 'from-pink-500 to-rose-600'
  },
  LANGUAGE_WIZARD: {
    emoji: '🧙',
    name: 'Language Wizard Badge',
    message: 'You earned the Language Wizard Badge! Your dedication is incredible! 🧙✨',
    color: 'from-indigo-500 to-purple-600'
  },
  GRAND_WIZARD: {
    emoji: '👑',
    name: 'Grand Wizard Badge',
    message: 'You earned the Grand Wizard Badge! You\'ve mastered WizLingo! 👑✨',
    color: 'from-yellow-400 via-orange-500 to-red-500'
  },
};

export default function BadgeUnlockModal({
  badgeType,
  studentName,
  isVisible,
  onClose
}: BadgeUnlockModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const config = BADGE_CONFIG[badgeType];

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Confetti animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: Math.random() * 100 + '%',
                top: -10 + 'px',
                animation: `fall ${2 + Math.random() * 1}s linear forwards`,
                fontSize: ['✨', '🎉', '⭐', '🌟'][Math.floor(Math.random() * 4)],
                opacity: Math.random() * 0.7 + 0.3
              }}
            >
              {['✨', '🎉', '⭐', '🌟'][Math.floor(Math.random() * 4)]}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <div className={`
        bg-gradient-to-br ${config.color}
        rounded-3xl p-8 max-w-md w-full
        shadow-2xl border-2 border-white/30
        text-center transform transition-all
        scale-100 animate-pulse
      `}>
        {/* Animated emoji */}
        <div className="text-8xl mb-6 animate-bounce" style={{ animationDelay: '0.1s' }}>
          {config.emoji}
        </div>

        {/* Title */}
        <h2 className="text-3xl font-black text-white mb-2">
          Badge Unlocked! 🎊
        </h2>

        {/* Badge name */}
        <p className="text-white/90 text-lg font-bold mb-4">
          {config.name}
        </p>

        {/* Message */}
        <p className="text-white/80 text-base mb-6 leading-relaxed">
          {config.message}
        </p>

        {/* Student name */}
        <div className="bg-white/20 rounded-2xl px-4 py-3 mb-6 backdrop-blur-sm">
          <p className="text-white font-bold text-sm">
            Congratulations, {studentName}! 🌟
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-white/20 hover:bg-white/30 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Continue
          </button>
          <button
            onClick={() => {
              // Share functionality would go here
              const shareText = `I just earned the ${config.name} on WizLingo! 🎉 ${config.emoji}`;
              if (navigator.share) {
                navigator.share({
                  title: 'WizLingo Badge Unlocked',
                  text: shareText,
                });
              } else {
                // Fallback: copy to clipboard
                navigator.clipboard.writeText(shareText);
                alert('Badge text copied! Share it with your friends 🌟');
              }
            }}
            className="flex-1 bg-white text-orange-600 font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Share 📤
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
