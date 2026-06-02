"use client";

import { useState, useEffect } from "react";
import { BadgeType } from "@/app/generated/prisma/client";

// Re-export the type from server module for convenience
export type { AchievementStats } from "@/lib/achievement-stats";

export function useAchievementStats(studentId: string) {
  const [stats, setStats] = useState({
    totalBadgesEarned: 0,
    daysSinceFirstBadge: 0,
    avgDaysPerBadge: 0,
    currentStreak: 0,
    badgesEarned: [] as Array<{ type: BadgeType; earnedAt: Date }>,
    loading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/achievement-stats/${studentId}`);
        if (!response.ok) throw new Error("Failed to fetch stats");

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching achievement stats:", error);
        setStats((prev) => ({
          ...prev,
          error: String(error),
          loading: false,
        }));
      }
    };

    if (studentId) {
      fetchStats();
    }
  }, [studentId]);

  return stats;
}
