"use client";

import { useState } from "react";
import { BadgeType } from "@/app/generated/prisma/client";
import { BADGE_CONFIG } from "@/lib/badge-config";

interface TimelineEntry {
  type: BadgeType;
  earnedAt: Date;
  stats?: {
    accuracy: number;
    wpm: number;
    duration: number;
  };
}

interface AchievementTimelineProps {
  badges: TimelineEntry[];
  loading?: boolean;
}

export function AchievementTimeline({ badges }: AchievementTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!badges || badges.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No badges earned yet</p>
        <p className="text-gray-400">Complete reading sessions to earn your first badge!</p>
      </div>
    );
  }

  // Sort by earned date, newest first
  const sortedBadges = [...badges].sort(
    (a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
  );

  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-indigo-500 opacity-30"></div>

      <div className="space-y-12">
        {sortedBadges.map((badge, index) => {
          const config = BADGE_CONFIG[badge.type];
          const dateStr = new Date(badge.earnedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          const timeStr = new Date(badge.earnedAt).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          });
          const isExpanded = expandedId === badge.type;

          return (
            <div key={badge.type} className="relative ml-0 md:ml-8">
              {/* Timeline dot */}
              <div className="absolute -left-5 md:left-0 top-2 w-10 h-10 rounded-full flex items-center justify-center text-2xl border-4 border-white shadow-lg"
                style={{
                  background: config.bgColor,
                  cursor: "pointer"
                }}
                onClick={() => setExpandedId(isExpanded ? null : badge.type)}
              >
                {config.emoji}
              </div>

              {/* Content card */}
              <div
                className="ml-20 md:ml-0 p-6 rounded-lg border-2 border-gray-100 hover:border-purple-300 transition-all cursor-pointer"
                style={{
                  borderLeftColor: config.color,
                  borderLeftWidth: "4px",
                }}
                onClick={() => setExpandedId(isExpanded ? null : badge.type)}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{config.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {dateStr} at {timeStr}
                    </p>
                  </div>
                  <div className="text-3xl">{config.emoji}</div>
                </div>

                {/* Description */}
                <p className="text-gray-600 mt-3">{config.description}</p>

                {/* Stats (when expanded) */}
                {isExpanded && badge.stats && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">Session Stats</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {badge.stats.accuracy}%
                        </div>
                        <div className="text-xs text-gray-600 mt-1">Reading Accuracy</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {badge.stats.wpm}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">Words Per Min</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {badge.stats.duration}m
                        </div>
                        <div className="text-xs text-gray-600 mt-1">Duration</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Expand hint */}
                <div className="mt-4 text-sm text-purple-600 font-medium">
                  {isExpanded ? "← Click to collapse" : "Click to expand →"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
