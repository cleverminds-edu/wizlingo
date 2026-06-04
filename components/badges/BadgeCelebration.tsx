'use client';

import React, { useEffect, useState } from 'react';
import { BadgeType } from '@/app/generated/prisma/client';
import { getBadgeConfig } from '@/lib/badge-config';
import { useBadgeMessages } from '@/hooks/useBadgeMessages';
import { trackBadgeEvent } from '@/lib/badge-analytics';
import { useCelebrationEffects } from '@/hooks/useCelebrationEffects';
import { ParticleType } from '@/lib/particles';
import { playBadgeEarnedSound } from '@/lib/sound-effects';
import {
  getBadgeImagePath,
  getUserBadgeVariant,
  type BadgeVariant,
} from '@/lib/badge-variant-config';
import { logBadgeVariantViewed, logBadgeVariantShared } from '@/lib/badge-variants-service';

interface BadgeCelebrationProps {
  badgeType: BadgeType;
  studentName: string;
  studentId?: string;
  schoolName?: string;
  grade?: number;
  section?: string;
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
  studentId,
  schoolName,
  grade,
  section,
  isVisible,
  onClose,
  stats,
}: BadgeCelebrationProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [badgeVariant, setBadgeVariant] = useState<BadgeVariant>('current');
  const config = getBadgeConfig(badgeType);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const messages = useBadgeMessages(badgeType, studentName, stats, {
    schoolName,
    grade,
    section,
    appUrl,
  });

  // Map badge type to particle type
  const getParticleType = (badge: BadgeType): ParticleType => {
    switch (badge) {
      case 'SPARK':
        return 'star';
      case 'WORD_WIZARD':
        return 'book';
      case 'VOICE_WIZARD':
        return 'note';
      case 'LANGUAGE_WIZARD':
        return 'sparkle';
      case 'GRAND_WIZARD':
        return 'crown';
      default:
        return 'sparkle';
    }
  };

  const particleType = getParticleType(badgeType);

  // Use celebration effects hook
  const { particles, isRunning } = useCelebrationEffects({
    isActive: isVisible && showConfetti,
    badgeColor: config.color,
    particleType,
    particleCount: badgeType === 'GRAND_WIZARD' ? 120 : 75,
    duration: 1500,
  });

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      setShareSuccess(false);

      // Get user's badge variant and track view
      const variant = getUserBadgeVariant(studentId);
      setBadgeVariant(variant);

      // Track badge earned event
      trackBadgeEvent('badge_earned', {
        badgeType,
        studentName,
      });

      // Log variant view
      if (studentId) {
        logBadgeVariantViewed(studentId, badgeType, variant);
      }

      // Auto-close after 15 seconds (longer celebration)
      const timer = setTimeout(onClose, 15000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, badgeType, studentName, studentId]);

  const handleWhatsAppShare = (shareMsg: string) => {
    try {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMsg)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      // Track share event
      trackBadgeEvent('share_badge', {
        badgeType,
        platform: 'whatsapp',
      });

      // Log variant share
      if (studentId) {
        logBadgeVariantShared(studentId, badgeType, badgeVariant, 'whatsapp');
      }

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

      // Log variant share
      if (studentId) {
        logBadgeVariantShared(studentId, badgeType, badgeVariant, 'clipboard');
      }

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

        // Log variant share
        if (studentId) {
          logBadgeVariantShared(studentId, badgeType, badgeVariant, 'native');
        }

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
      {/* Particle effects are rendered via canvas in useCelebrationEffects hook */}

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
              src={getBadgeImagePath(badgeType, badgeVariant)}
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
            className="text-4xl font-black tracking-tight leading-tight animate-pulse"
            style={{
              background: `linear-gradient(270deg, ${config.color}, #FFD700, ${config.color})`,
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'rainbowGradient 3s ease infinite',
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
          Closes automatically in 15 seconds
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

        @keyframes badgeGlow {
          0% {
            filter: drop-shadow(0 0 20px currentColor);
          }
          50% {
            filter: drop-shadow(0 0 40px currentColor);
          }
          100% {
            filter: drop-shadow(0 0 20px currentColor);
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

        @keyframes rainbowGradient {
          0% {
            background-position: 0% center;
          }
          50% {
            background-position: 100% center;
          }
          100% {
            background-position: 0% center;
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

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
};

