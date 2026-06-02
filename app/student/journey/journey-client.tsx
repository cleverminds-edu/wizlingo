"use client";

import { useState } from "react";
import { AchievementTimeline } from "@/components/AchievementTimeline";
import { BadgeCollection } from "@/components/BadgeCollection";
import type { AchievementStats } from "@/lib/achievement-stats";

interface JourneyPageClientProps {
  initialStats: AchievementStats;
}

export default function JourneyPageClient({ initialStats }: JourneyPageClientProps) {
  const [view, setView] = useState<"timeline" | "gallery" | "stats">("timeline");

  const earnedBadgeTypes = initialStats.badgesEarned.map((b) => b.type);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            🌟 Your Learning Journey
          </h1>
          <p className="text-gray-600 text-lg">
            Track your achievements and celebrate your progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {/* Total Badges */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
            <div className="text-3xl font-bold text-yellow-600">
              {initialStats.totalBadgesEarned}
            </div>
            <p className="text-gray-600 text-sm mt-2">Total Badges</p>
          </div>

          {/* Days Since First Badge */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-400">
            <div className="text-3xl font-bold text-blue-600">
              {initialStats.daysSinceFirstBadge}
            </div>
            <p className="text-gray-600 text-sm mt-2">Days Learning</p>
          </div>

          {/* Avg Days Per Badge */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-400">
            <div className="text-3xl font-bold text-green-600">
              {initialStats.avgDaysPerBadge}
            </div>
            <p className="text-gray-600 text-sm mt-2">Days Per Badge</p>
          </div>

          {/* Current Streak */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-400">
            <div className="text-3xl font-bold text-purple-600">
              {initialStats.currentStreak}
            </div>
            <p className="text-gray-600 text-sm mt-2">Day Streak 🔥</p>
          </div>
        </div>

        {/* Trend Information */}
        {(initialStats.accuracyTrend || initialStats.fluencyTrend) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {initialStats.accuracyTrend && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-2">📈 Reading Accuracy</h3>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {initialStats.accuracyTrend.avgAccuracy}%
                </div>
                <p className="text-sm text-blue-700">
                  {initialStats.accuracyTrend.improving
                    ? "✓ Improving - Keep it up!"
                    : "Let's work on improvement"}
                </p>
              </div>
            )}

            {initialStats.fluencyTrend && (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
                <h3 className="font-semibold text-purple-900 mb-2">🎤 Speaking Fluency</h3>
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {initialStats.fluencyTrend.avgFluency}%
                </div>
                <p className="text-sm text-purple-700">
                  {initialStats.fluencyTrend.improving
                    ? "✓ Improving - Great work!"
                    : "Let's work on improvement"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Next Badge ETA */}
        {initialStats.nextBadgeEta !== undefined && (
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-lg p-6 mb-12">
            <h3 className="font-semibold text-orange-900 mb-2">🎯 Next Badge Estimate</h3>
            <p className="text-lg text-orange-700">
              {initialStats.nextBadgeEta === 0
                ? "You could earn a badge any day now! Keep practicing!"
                : `Estimated in ${initialStats.nextBadgeEta} days at your current pace`}
            </p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setView("timeline")}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
              view === "timeline"
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            📜 Timeline
          </button>
          <button
            onClick={() => setView("gallery")}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
              view === "gallery"
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            🎨 Gallery
          </button>
          <button
            onClick={() => setView("stats")}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
              view === "stats"
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            📊 Detailed Stats
          </button>
        </div>

        {/* Content Based on View */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          {view === "timeline" && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Achievement Timeline</h2>
              <AchievementTimeline
                badges={initialStats.badgesEarned.map((b) => ({
                  type: b.type,
                  earnedAt: b.earnedAt,
                }))}
              />
            </div>
          )}

          {view === "gallery" && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Badge Collection</h2>
              <BadgeCollection earnedBadges={earnedBadgeTypes} />
            </div>
          )}

          {view === "stats" && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Detailed Statistics</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Progress Overview</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>
                        <strong>Total Badges:</strong> {initialStats.totalBadgesEarned}
                      </li>
                      <li>
                        <strong>Learning Journey:</strong> {initialStats.daysSinceFirstBadge} days
                      </li>
                      <li>
                        <strong>Average Pace:</strong> 1 badge every {initialStats.avgDaysPerBadge}{" "}
                        days
                      </li>
                      <li>
                        <strong>Consistency:</strong> {initialStats.currentStreak} day streak 🔥
                      </li>
                    </ul>
                  </div>

                  {initialStats.accuracyTrend && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">Reading Performance</h3>
                      <ul className="space-y-2 text-sm text-blue-700">
                        <li>
                          <strong>Average Accuracy:</strong> {initialStats.accuracyTrend.avgAccuracy}%
                        </li>
                        <li>
                          <strong>Trend:</strong>{" "}
                          {initialStats.accuracyTrend.improving ? "📈 Improving" : "📉 Needs Work"}
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                {initialStats.fluencyTrend && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-purple-900 mb-2">Speaking Performance</h3>
                    <ul className="space-y-2 text-sm text-purple-700">
                      <li>
                        <strong>Average Fluency:</strong> {initialStats.fluencyTrend.avgFluency}%
                      </li>
                      <li>
                        <strong>Trend:</strong>{" "}
                        {initialStats.fluencyTrend.improving ? "📈 Improving" : "📉 Needs Work"}
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
