'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { BadgeType } from '@/app/generated/prisma/client';

export interface BadgeProgressData {
  type: BadgeType;
  earned: boolean;
  progress: number; // 0-100
  requirement: string;
  current: string;
  earnedAt?: string;
}

export interface BadgeProgressResponse {
  studentId: string;
  studentName: string;
  earnedBadges: BadgeProgressData[];
  nextBadges: BadgeProgressData[];
  totalSessions: number;
  readingSessionsCompleted: number;
  speakingSessionsCompleted: number;
  avgAccuracy: number;
  avgFluency: number;
}

interface UseBadgeProgressReturn {
  earned: BadgeProgressData[];
  nextBadges: BadgeProgressData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage badge progress for a student
 * - Auto-refreshes every 5 seconds
 * - Caches data in memory
 * - Provides manual refetch capability
 */
export function useBadgeProgress(studentId: string): UseBadgeProgressReturn {
  const [earned, setEarned] = useState<BadgeProgressData[]>([]);
  const [nextBadges, setNextBadges] = useState<BadgeProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheRef = useRef<{
    data: BadgeProgressResponse | null;
    timestamp: number;
  }>({
    data: null,
    timestamp: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!studentId) {
      setError('Student ID is required');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await fetch(`/api/badges/progress/${studentId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch badge progress: ${response.status}`);
      }

      const data: BadgeProgressResponse = await response.json();

      // Update cache
      cacheRef.current = {
        data,
        timestamp: Date.now(),
      };

      // Update state
      setEarned(data.earnedBadges);
      setNextBadges(data.nextBadges);
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setLoading(false);
    }
  }, [studentId]);

  // Initial fetch and setup auto-refresh
  useEffect(() => {
    // Fetch immediately
    fetchProgress();

    // Setup auto-refresh every 5 seconds
    intervalRef.current = setInterval(() => {
      fetchProgress();
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchProgress]);

  return {
    earned,
    nextBadges,
    loading,
    error,
    refetch: fetchProgress,
  };
}
