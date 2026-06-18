'use client';

import { useEffect, useState } from 'react';
import type { AgeBandLeaderboardResponse } from '@/lib/age-band-leaderboard';

interface AgeBandLeaderboardState {
  accuracy: AgeBandLeaderboardResponse | null;
  consistency: AgeBandLeaderboardResponse | null;
  level: AgeBandLeaderboardResponse | null;
  badges: AgeBandLeaderboardResponse | null;
  stats: {
    ageBand: string;
    totalStudents: number;
    avgLevel: number;
    maxLevel: number;
    avgAccuracy: number;
  } | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch age band leaderboards
 * Automatically gets all leaderboards for student's age band
 *
 * Usage:
 * const { accuracy, consistency, level, badges, stats, loading } = useAgeBandLeaderboard();
 * if (loading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error}</div>;
 * return <div>Your rank: {accuracy.currentUserRank}</div>;
 */
export function useAgeBandLeaderboard(): AgeBandLeaderboardState {
  const [state, setState] = useState<AgeBandLeaderboardState>({
    accuracy: null,
    consistency: null,
    level: null,
    badges: null,
    stats: null,
    loading: true,
    error: null,
    refresh: async () => {},
  });

  const fetchLeaderboards = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/leaderboards/age-band?all=true&limit=50');

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboards');
      }

      const data = await response.json();

      setState({
        accuracy: data.leaderboards.accuracy,
        consistency: data.leaderboards.consistency,
        level: data.leaderboards.level,
        badges: data.leaderboards.badges,
        stats: data.stats,
        loading: false,
        error: null,
        refresh: fetchLeaderboards,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
        refresh: fetchLeaderboards,
      }));
    }
  };

  useEffect(() => {
    fetchLeaderboards();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchLeaderboards, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return state;
}

/**
 * Hook to fetch a single leaderboard type
 */
export function useSingleAgeBandLeaderboard(
  type: 'ACCURACY' | 'CONSISTENCY' | 'LEVEL' | 'BADGES',
  limit: number = 50
) {
  const [leaderboard, setLeaderboard] = useState<AgeBandLeaderboardResponse | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/leaderboards/age-band?type=${type}&limit=${limit}`);

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      setLeaderboard(data.leaderboard);
      setStats(data.stats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [type, limit]);

  return { leaderboard, stats, loading, error, refresh: fetch };
}
