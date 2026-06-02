"use client";

import { useState } from "react";
import { BadgeType } from "@/app/generated/prisma/client";
import { BADGE_CONFIG } from "@/lib/badge-system";

interface BadgeCollectionProps {
  earnedBadges: BadgeType[];
  loading?: boolean;
  onBadgeClick?: (badge: BadgeType) => void;
}

export function BadgeCollection({
  earnedBadges,
  loading = false,
  onBadgeClick,
}: BadgeCollectionProps) {
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center opacity-50">
            <div className="w-24 h-24 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="mt-4 h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  const allBadges = Object.values(BADGE_CONFIG) as Array<typeof BADGE_CONFIG[BadgeType]>;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-8">
        {allBadges.map((config) => {
          const isEarned = earnedBadges.includes(config.type as BadgeType);
          const isSelected = selectedBadge === config.type;

          return (
            <div
              key={config.type}
              className="flex flex-col items-center cursor-pointer transition-all hover:scale-105"
              onClick={() => {
                setSelectedBadge(isSelected ? null : (config.type as BadgeType));
                onBadgeClick?.(config.type as BadgeType);
              }}
            >
              {/* Badge circle */}
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl border-4 transition-all ${
                  isEarned
                    ? "border-yellow-400 shadow-lg shadow-yellow-400/50"
                    : "border-gray-300 opacity-50 grayscale"
                } ${isSelected ? "ring-2 ring-purple-500 ring-offset-2" : ""}`}
                style={{
                  background: config.bgColor,
                }}
              >
                {config.emoji}
              </div>

              {/* Badge name */}
              <h3 className={`mt-4 font-semibold text-center ${
                isEarned ? "text-gray-900" : "text-gray-500"
              }`}>
                {config.name}
              </h3>

              {/* Earned date or locked indicator */}
              <p className={`text-xs text-center mt-1 ${
                isEarned ? "text-green-600" : "text-gray-400"
              }`}>
                {isEarned ? "✓ Earned" : "🔒 Locked"}
              </p>

              {/* Progress bar for locked badges */}
              {!isEarned && (
                <div className="mt-3 w-full px-2">
                  <div className="text-xs text-gray-500 text-center mb-1">
                    {config.requirement}
                  </div>
                  <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                      style={{ width: "0%" }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail modal for selected badge */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in"
          >
            <button
              className="float-right text-gray-400 hover:text-gray-600 text-2xl"
              onClick={() => setSelectedBadge(null)}
            >
              ✕
            </button>

            <div className="text-center mt-6">
              <div className="text-6xl mb-4">{BADGE_CONFIG[selectedBadge].emoji}</div>
              <h2 className="text-2xl font-bold mb-2">{BADGE_CONFIG[selectedBadge].name}</h2>
              <p className="text-gray-600 mb-4">{BADGE_CONFIG[selectedBadge].description}</p>

              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-gray-700">Requirement:</p>
                <p className="text-gray-600">{BADGE_CONFIG[selectedBadge].requirement}</p>
              </div>

              {earnedBadges.includes(selectedBadge) && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-semibold">✓ You've earned this badge!</p>
                </div>
              )}

              {!earnedBadges.includes(selectedBadge) && (
                <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                  <p className="text-gray-700 font-semibold">Keep practicing to earn this badge!</p>
                </div>
              )}

              <button
                className="mt-6 w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                onClick={() => setSelectedBadge(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
