'use client';

import React from 'react';
import { BadgeType } from '@/app/generated/prisma/client';
import { getBadgeConfig } from '@/lib/badge-config';
import { useBadgeMessages } from '@/hooks/useBadgeMessages';

interface BadgeProgressProps {
  badgeType: BadgeType;
  studentName: string;
  progress: number; // 0-100
  isLocked: boolean;
  stats?: {
    accuracy?: number;
    fluency?: number;
    sessionCount?: number;
    badgeCount?: number;
  };
}

export const BadgeProgress = ({
  badgeType,
  studentName,
  progress,
  isLocked,
  stats,
}: BadgeProgressProps) => {
  const config = getBadgeConfig(badgeType);
  const messages = useBadgeMessages(badgeType, studentName, stats);
  const motivationalMsg = messages.progress(progress);

  if (!isLocked) return null;

  const getProgressColor = () => {
    if (progress < 33) return '#EF4444';
    if (progress < 66) return '#F59E0B';
    return '#10B981';
  };

  return (
    <div className="space-y-3">
      {/* Badge name and progress % */}
      <div className="flex justify-between items-center">
        <span className="font-bold text-white">{config.name}</span>
        <span className="text-sm font-semibold" style={{ color: getProgressColor() }}>
          {Math.round(progress)}%
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="h-3 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out relative"
          style={{
            width: `${Math.min(progress, 100)}%`,
            background: `linear-gradient(90deg, ${getProgressColor()}, ${config.color})`,
            boxShadow: `0 0 10px ${getProgressColor()}`,
          }}
        >
          {/* Shine effect */}
          <div
            className="absolute inset-0 opacity-50"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              animation: 'shine 2s infinite',
            }}
          />
        </div>
      </div>

      {/* Motivational message */}
      <div
        className="text-xs leading-relaxed p-3 rounded-lg mt-2"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid ${config.color}40`,
          color: 'rgba(255,255,255,0.8)',
        }}
      >
        {motivationalMsg}
      </div>

      {/* Milestone badges */}
      <div className="flex gap-2 mt-3 text-xs">
        {[25, 50, 75, 100].map((milestone) => (
          <div
            key={milestone}
            className={`flex-1 py-2 rounded text-center font-bold transition-all ${
              progress >= milestone
                ? 'opacity-100 scale-100'
                : 'opacity-50 scale-95'
            }`}
            style={{
              background:
                progress >= milestone
                  ? `${config.color}40`
                  : 'rgba(255,255,255,0.05)',
              color:
                progress >= milestone ? config.color : 'rgba(255,255,255,0.4)',
            }}
          >
            {milestone}%
          </div>
        ))}
      </div>

      <style>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};
