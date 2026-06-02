'use client';

import React, { useState } from 'react';
import { BadgeType } from '@/app/generated/prisma/client';
import { getBadgeConfig } from '@/lib/badge-config';
import { BadgeShareModal } from './BadgeShareModal';
import { BadgeProgress } from './BadgeProgress';
import Image from 'next/image';

interface BadgeProgressData {
  type: BadgeType;
  earned: boolean;
  progress: number;
  requirement: string;
  current: string;
  earnedAt?: string;
}

interface ModernBadgeDisplayProps {
  studentId: string;
  studentName: string;
  earnedBadges: BadgeType[];
  nextBadges: Array<{ type: BadgeType; config: any; progress?: number }>;
}

/**
 * Modern Badge Display Component (Apple Fitness inspired)
 * - Animated rings for progress
 * - Glass-morphism cards
 * - Smooth transitions
 * - Share functionality
 */

export function ModernBadgeDisplay({
  studentId,
  studentName,
  earnedBadges,
  nextBadges,
}: ModernBadgeDisplayProps) {
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const handleShareClick = (badgeType: BadgeType) => {
    setSelectedBadge(badgeType);
    setShareModalOpen(true);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
          Badges & Achievements
        </h1>
        <p className="text-gray-600 mt-2">
          Unlock achievements as you master reading & speaking
        </p>
      </div>

      {/* Earned Badges Grid */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="text-3xl">🏆</span> Your Badges
        </h2>

        {earnedBadges.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-2xl">
            <p className="text-gray-600">
              Complete reading & speaking sessions to earn badges!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {earnedBadges.map((badgeType) => (
              <EarnedBadgeCard
                key={badgeType}
                badgeType={badgeType}
                studentId={studentId}
                onShare={() => handleShareClick(badgeType)}
              />
            ))}

            {/* Grand Wizard Special Case */}
            {earnedBadges.includes('GRAND_WIZARD') && (
              <div className="col-span-full">
                <GrandWizardCelebration studentName={studentName} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Next Badges to Earn */}
      {nextBadges.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-3xl">🎯</span> Next Goals
          </h2>

          <div className="space-y-8">
            {/* Progress bars for locked badges */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8">
              <h3 className="text-white font-bold text-lg mb-6">Your Progress</h3>
              <div className="space-y-6">
                {nextBadges.map(({ type, config, progress = 0 }) => (
                  <BadgeProgress
                    key={type}
                    badgeType={type}
                    studentName={studentName}
                    progress={progress}
                    isLocked={true}
                  />
                ))}
              </div>
            </div>

            {/* Badge cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {nextBadges.map(({ type, config }) => (
                <NextBadgeCard
                  key={type}
                  badgeType={type}
                  config={config}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {selectedBadge && (
        <BadgeShareModal
          studentId={studentId}
          badgeType={selectedBadge}
          studentName={studentName}
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EARNED BADGE CARD (Modern glass-morphism)
// ═══════════════════════════════════════════════════════════════

interface EarnedBadgeCardProps {
  badgeType: BadgeType;
  studentId: string;
  onShare: () => void;
}

function EarnedBadgeCard({ badgeType, studentId, onShare }: EarnedBadgeCardProps) {
  const config = getBadgeConfig(badgeType);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="badge-card group relative h-80 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Gradient Background */}
      <div
        className="absolute inset-0 bg-gradient-to-br"
        style={{
          backgroundImage: `linear-gradient(135deg, ${config.bgColor}, rgba(255,255,255,0.1))`,
        }}
      />

      {/* Glass-morphism Effect */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/5 border border-white/20" />

      {/* Glow Effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at center, ${config.color}20, transparent)`,
        }}
      />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center p-6 z-10">
        {/* Badge Image */}
        <div
          className={`w-32 h-32 mb-4 transition-transform duration-300 ${
            hovered ? 'scale-110 rotate-12' : 'scale-100'
          }`}
        >
          <img
            src={config.badgeImage}
            alt={config.name}
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>

        {/* Badge Name */}
        <h3
          className="text-2xl font-bold text-center transition-colors duration-300"
          style={{ color: hovered ? config.color : '#111827' }}
        >
          {config.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm text-center mt-2">
          {config.description}
        </p>

        {/* Share Button */}
        {hovered && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare();
            }}
            className="mt-4 px-6 py-2 rounded-full text-white font-semibold transition-all duration-200 animate-in"
            style={{ backgroundColor: config.color }}
          >
            🎉 Share Badge
          </button>
        )}
      </div>

      {/* Shine Effect */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// NEXT BADGE CARD (Progress visualization)
// ═══════════════════════════════════════════════════════════════

interface NextBadgeCardProps {
  badgeType: BadgeType;
  config: any;
}

function NextBadgeCard({ badgeType, config }: NextBadgeCardProps) {
  return (
    <div className="badge-locked group relative h-72 rounded-3xl overflow-hidden">
      {/* Gradient Background (muted) */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50" />

      {/* Border */}
      <div className="absolute inset-0 border-2 border-dashed border-gray-300 rounded-3xl" />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center p-6 z-10">
        {/* Locked Badge Image */}
        <div className="w-24 h-24 mb-3 opacity-50 grayscale">
          <img
            src={config.badgeImage}
            alt={config.name}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Badge Name (muted) */}
        <h3 className="text-xl font-bold text-center text-gray-700">
          {config.name}
        </h3>

        {/* Requirement */}
        <p className="text-gray-600 text-sm text-center mt-3 leading-relaxed">
          {config.requirement}
        </p>

        {/* Unlock Text */}
        <div className="mt-4 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
          <p className="text-xs font-semibold text-blue-700">
            Keep Going to Unlock
          </p>
        </div>
      </div>

      {/* Hover Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-blue-50 via-transparent to-transparent rounded-3xl" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// GRAND WIZARD CELEBRATION
// ═══════════════════════════════════════════════════════════════

interface GrandWizardCelebrationProps {
  studentName: string;
}

function GrandWizardCelebration({ studentName }: GrandWizardCelebrationProps) {
  const config = getBadgeConfig('GRAND_WIZARD' as BadgeType);

  return (
    <div className="relative h-96 rounded-3xl overflow-hidden bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 border-2 border-yellow-200">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 text-8xl animate-bounce">✨</div>
        <div className="absolute bottom-10 right-10 text-8xl animate-bounce" style={{ animationDelay: '0.3s' }}>
          ⭐
        </div>
        <div className="absolute top-1/2 left-1/4 text-6xl animate-pulse">🎉</div>
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center p-8 text-center z-10">
        <div className="text-9xl mb-6 animate-spin" style={{ animationDuration: '3s' }}>
          👑
        </div>

        <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-3">
          {config.name}
        </h2>

        <p className="text-xl text-gray-700 mb-2 font-semibold">
          Congratulations, {studentName}!
        </p>

        <p className="text-gray-600 mb-6 max-w-sm">
          You've achieved the ultimate mastery in WizLingo. You're a true language wizard! 🧙‍♂️
        </p>

        <div className="flex gap-4">
          <span className="px-4 py-2 bg-white rounded-full text-sm font-semibold text-gray-700">
            🏆 Master of Reading
          </span>
          <span className="px-4 py-2 bg-white rounded-full text-sm font-semibold text-gray-700">
            🎤 Master of Speaking
          </span>
        </div>
      </div>
    </div>
  );
}
