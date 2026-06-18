'use client';

import { useEffect, useState } from 'react';

export interface SpeakingPreferenceSummary {
  preference: string;
  pronouns: string | null;
  studentGender: string | null;
  progressionWeek: number;
  totalSessions: number;
  startedAt: Date;
  availableCharacterGenders: string[];
}

export interface CharacterDiversityStats {
  totalSessions: number;
  genderCounts: {
    MALE: number;
    FEMALE: number;
    NEUTRAL: number;
    OTHER: number;
  };
  percentages: {
    MALE: string;
    FEMALE: string;
    NEUTRAL: string;
    OTHER: string;
  };
  diversity: number;
}

interface SpeakingPreferencesState {
  preference: SpeakingPreferenceSummary | null;
  diversity: CharacterDiversityStats | null;
  loading: boolean;
  error: string | null;
  updatePreference: (pref: string) => Promise<void>;
  updatePronouns: (pronouns: string) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook to manage speaking preferences
 */
export function useSpeakingPreferences(): SpeakingPreferencesState {
  const [state, setState] = useState<SpeakingPreferencesState>({
    preference: null,
    diversity: null,
    loading: true,
    error: null,
    updatePreference: async () => {},
    updatePronouns: async () => {},
    refresh: async () => {},
  });

  const fetch = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/speaking/preferences');

      if (!response.ok) {
        throw new Error('Failed to fetch preferences');
      }

      const data = await response.json();

      setState({
        preference: data.preference,
        diversity: data.diversity,
        loading: false,
        error: null,
        updatePreference: updatePreference,
        updatePronouns: updatePronouns,
        refresh: fetch,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
        updatePreference: updatePreference,
        updatePronouns: updatePronouns,
        refresh: fetch,
      }));
    }
  };

  const updatePreference = async (characterGenderPref: string) => {
    try {
      const response = await fetch('/api/speaking/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterGenderPref }),
      });

      if (!response.ok) {
        throw new Error('Failed to update preference');
      }

      const data = await response.json();
      setState((prev) => ({
        ...prev,
        preference: data.preference,
        diversity: data.diversity,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setState((prev) => ({ ...prev, error: errorMessage }));
    }
  };

  const updatePronouns = async (pronouns: string) => {
    try {
      const response = await fetch('/api/speaking/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pronouns }),
      });

      if (!response.ok) {
        throw new Error('Failed to update pronouns');
      }

      const data = await response.json();
      setState((prev) => ({
        ...prev,
        preference: data.preference,
        diversity: data.diversity,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setState((prev) => ({ ...prev, error: errorMessage }));
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return state;
}
