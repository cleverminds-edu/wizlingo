import { GradeBand } from "@/app/generated/prisma/enums";

export interface LevelConfig {
  targetWpm: number;
  minAccuracy: number;
  wordCount: number;
  timeLimitSec: number;
}

const LEVEL_CONFIG: Record<GradeBand, Record<number, LevelConfig>> = {
  BAND_1_2: {
    1: { targetWpm: 30,  minAccuracy: 70, wordCount: 40,  timeLimitSec: 90  },
    2: { targetWpm: 50,  minAccuracy: 75, wordCount: 60,  timeLimitSec: 90  },
    3: { targetWpm: 70,  minAccuracy: 80, wordCount: 75,  timeLimitSec: 120 },
  },
  BAND_3_5: {
    1: { targetWpm: 65,  minAccuracy: 75, wordCount: 80,  timeLimitSec: 120 },
    2: { targetWpm: 85,  minAccuracy: 80, wordCount: 100, timeLimitSec: 120 },
    3: { targetWpm: 105, minAccuracy: 85, wordCount: 120, timeLimitSec: 120 },
  },
  BAND_6_8: {
    1: { targetWpm: 95,  minAccuracy: 82, wordCount: 120, timeLimitSec: 120 },
    2: { targetWpm: 115, minAccuracy: 85, wordCount: 140, timeLimitSec: 120 },
    3: { targetWpm: 135, minAccuracy: 88, wordCount: 155, timeLimitSec: 120 },
  },
  BAND_9_10: {
    1: { targetWpm: 115, minAccuracy: 84, wordCount: 150, timeLimitSec: 120 },
    2: { targetWpm: 135, minAccuracy: 87, wordCount: 170, timeLimitSec: 120 },
    3: { targetWpm: 155, minAccuracy: 90, wordCount: 185, timeLimitSec: 120 },
  },
};

export function getLevelConfig(band: GradeBand, level: number): LevelConfig {
  return LEVEL_CONFIG[band][level];
}

export function gradeToBand(grade: number): GradeBand {
  if (grade <= 2) return "BAND_1_2";
  if (grade <= 5) return "BAND_3_5";
  if (grade <= 8) return "BAND_6_8";
  return "BAND_9_10";
}

export interface ScoreResult {
  wpm: number;
  accuracy: number;
  missedWords: string[];
  wrongWords: { original: string; spoken: string }[];
  passed: boolean;
}

export function scoreReading(
  originalText: string,
  transcript: string,
  durationSec: number,
  band: GradeBand,
  level: number
): ScoreResult {
  const config = getLevelConfig(band, level);
  const originalWords = tokenize(originalText);
  const spokenWords = tokenize(transcript);

  const { missedWords, wrongWords, matchedCount } = alignWords(
    originalWords,
    spokenWords
  );

  const accuracy = (matchedCount / originalWords.length) * 100;
  const wpm = durationSec > 0 ? (matchedCount / durationSec) * 60 : 0;

  const passed =
    wpm >= config.targetWpm * 0.9 && accuracy >= config.minAccuracy;

  return {
    wpm: Math.round(wpm * 10) / 10,
    accuracy: Math.round(accuracy * 10) / 10,
    missedWords,
    wrongWords,
    passed,
  };
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

function alignWords(
  original: string[],
  spoken: string[]
): {
  missedWords: string[];
  wrongWords: { original: string; spoken: string }[];
  matchedCount: number;
} {
  const missedWords: string[] = [];
  const wrongWords: { original: string; spoken: string }[] = [];
  let matchedCount = 0;

  let si = 0;
  for (let oi = 0; oi < original.length; oi++) {
    const orig = original[oi];
    // Wider window so skipped words don't break alignment of later words
    const lookahead = spoken.slice(si, si + 8);

    const exactIdx = lookahead.indexOf(orig);
    if (exactIdx !== -1) {
      si += exactIdx + 1;
      matchedCount++;
      continue;
    }

    // Fuzzy match only for words long enough that edit-distance-2 is meaningful.
    // Short words (≤5 chars) like "the/a", "sat/mat", "on/in" are too similar by
    // edit distance — false matches cascade and break all subsequent alignment.
    const allowFuzzy = orig.length >= 6;
    if (allowFuzzy) {
      const closestIdx = lookahead.findIndex((w) => editDistance(orig, w) <= 2);
      if (closestIdx !== -1) {
        // Count as correct — minor pronunciation/inflection variation (e.g. "raining"→"rain")
        wrongWords.push({ original: orig, spoken: lookahead[closestIdx] });
        matchedCount++;
        si += closestIdx + 1;
        continue;
      }
    }

    missedWords.push(orig);
  }

  return { missedWords, wrongWords, matchedCount };
}

function editDistance(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}
