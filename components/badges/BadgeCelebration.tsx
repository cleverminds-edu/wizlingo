'use client';

import React, { useEffect, useState } from 'react';
import { BadgeType } from '@/app/generated/prisma/client';
import { getBadgeConfig } from '@/lib/badge-config';
import { useBadgeMessages } from '@/hooks/useBadgeMessages';
import { trackBadgeEvent } from '@/lib/badge-analytics';

interface BadgeCelebrationProps {
  badgeType: BadgeType;
  studentName: string;
  isVisible: boolean;
  onClose: () => void;
  stats?: {
    accuracy?: number;
    fluency?: number;
    sessionCount?: number;
    badgeCount?: number;
  };
}

export const BadgeCelebration = ({
  badgeType,
  studentName,
  isVisible,
  onClose,
  stats,
}: BadgeCelebrationProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const config = getBadgeConfig(badgeType);
  const messages = useBadgeMessages(badgeType, studentName, stats);

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      setShareSuccess(false);

      // Track badge earned event
      trackBadgeEvent('badge_earned', {
        badgeType,
        studentName,
      });

      // Auto-close after 8 seconds
      const timer = setTimeout(onClose, 8000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, badgeType, studentName]);

  const handleWhatsAppShare = (shareMsg: string) => {
    try {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMsg)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      // Track share event
      trackBadgeEvent('share_badge', {
        badgeType,
        platform: 'whatsapp',
      });

      setShareSuccess(false);
    } catch (error) {
      console.error('WhatsApp share failed:', error);
    }
  };

  const handleCopyShare = async (shareMsg: string) => {
    try {
      await navigator.clipboard.writeText(shareMsg);

      // Track share event
      trackBadgeEvent('share_badge', {
        badgeType,
        platform: 'clipboard',
      });

      setShareSuccess(false);
      // Show temporary success message
      const originalText = shareSuccess;
      setTimeout(() => setShareSuccess(originalText), 2000);
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
    }
  };

  const handleNativeShare = async (shareMsg: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `I earned the ${config.name} badge on WizLingo!`,
          text: shareMsg,
        });

        // Track share event
        trackBadgeEvent('share_badge', {
          badgeType,
          platform: 'native',
        });

        setShareSuccess(false);
      } else {
        // Fallback to copy
        await handleCopyShare(shareMsg);
      }
    } catch (error) {
      console.error('Native share failed:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[1000] pointer-events-none"
      style={{ background: 'rgba(0, 0, 0, 0.7)' }}
    >
      {/* Confetti container */}
      {showConfetti && <Confetti />}

      {/* Celebration modal */}
      <div
        className="pointer-events-auto bg-gradient-to-br rounded-3xl p-12 max-w-lg mx-4 text-center"
        style={{
          background: `linear-gradient(135deg, ${config.bgColor}, rgba(255,255,255,0.1))`,
          border: `2px solid ${config.color}`,
          boxShadow: `0 0 60px ${config.color}`,
          animation: 'badgePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Badge image */}
        <div
          className="mb-8 inline-block animate-bounce"
          style={{ animation: 'badgeRotate 3s linear infinite' }}
        >
          <div className="w-32 h-32 relative">
            <img
              src={config.badgeImage}
              alt={config.name}
              className="w-full h-full object-contain drop-shadow-2xl"
              style={{
                filter: `drop-shadow(0 0 30px ${config.color})`,
              }}
            />
          </div>
        </div>

        {/* Message */}
        <div className="text-white space-y-6">
          <h2
            className="text-4xl font-black tracking-tight leading-tight"
            style={{
              background: `linear-gradient(135deg, ${config.color}, ${config.bgColor})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {config.name} Earned! 🎉
          </h2>

          <div className="text-base leading-relaxed whitespace-pre-wrap text-white/90">
            {messages.congratulations}
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 mt-8 justify-center flex-wrap">
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-xl font-bold transition-all hover:scale-105"
              style={{
                background: config.color,
                color: '#fff',
              }}
            >
              Continue Learning 📚
            </button>
            <div className="relative">
              <button
                onClick={() => setShareSuccess(!shareSuccess)}
                className="px-8 py-3 rounded-xl font-bold transition-all hover:scale-105"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  border: `2px solid ${config.color}`,
                }}
              >
                Share 🚀
              </button>

              {/* Share options dropdown */}
              {shareSuccess && (
                <div
                  className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-slate-900 rounded-lg shadow-lg border border-white/20 z-10"
                  style={{ minWidth: '200px' }}
                >
                  <button
                    onClick={() => handleWhatsAppShare(messages.shareTemplate)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 rounded-t-lg transition-all"
                    style={{ color: config.color }}
                  >
                    WhatsApp 📱
                  </button>
                  <button
                    onClick={() => handleCopyShare(messages.shareTemplate)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-all border-t border-white/10"
                    style={{ color: config.color }}
                  >
                    Copy Message 📋
                  </button>
                  <button
                    onClick={() => handleNativeShare(messages.shareTemplate)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 rounded-b-lg transition-all border-t border-white/10"
                    style={{ color: config.color }}
                  >
                    More Options 🔗
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Closing hint */}
        <div className="mt-8 text-xs text-white/50 animate-pulse">
          Closes automatically in 8 seconds
        </div>
      </div>

      <style>{`
        @keyframes badgePop {
          0% {
            transform: scale(0.5) rotateZ(-180deg);
            opacity: 0;
          }
          100% {
            transform: scale(1) rotateZ(0deg);
            opacity: 1;
          }
        }

        @keyframes badgeRotate {
          0% {
            transform: rotateY(0deg) rotateZ(0deg);
          }
          100% {
            transform: rotateY(360deg) rotateZ(5deg);
          }
        }

        @keyframes confettiFall {
          0% {
            transform: translateY(-100vh) rotateZ(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotateZ(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Confetti animation component
const Confetti = () => {
  const confetti = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 1,
    color: ['#F43F88', '#7C3AED', '#FFD700', '#F97316', '#10B981'][
      Math.floor(Math.random() * 5)
    ],
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-2 h-2 rounded-full animate-bounce"
          style={{
            left: `${piece.left}%`,
            top: '-10px',
            backgroundColor: piece.color,
            animation: `confettiFall ${piece.duration}s linear ${piece.delay}s forwards`,
            boxShadow: `0 0 10px ${piece.color}`,
          }}
        />
      ))}
    </div>
  );
};
