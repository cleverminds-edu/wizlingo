import { GradeBand } from "@/app/generated/prisma/enums";

export interface SpeakingLevelConfig {
  targetWpm: number;
  minFluency: number;
  turns: number;
  turnTimeSec: number;
}

const LEVEL_CONFIG: Record<GradeBand, Record<number, SpeakingLevelConfig>> = {
  BAND_1_2: {
    1: { targetWpm: 20, minFluency: 55, turns: 4, turnTimeSec: 20 },
    2: { targetWpm: 30, minFluency: 60, turns: 5, turnTimeSec: 25 },
    3: { targetWpm: 40, minFluency: 65, turns: 6, turnTimeSec: 30 },
  },
  BAND_3_5: {
    1: { targetWpm: 40, minFluency: 60, turns: 5, turnTimeSec: 30 },
    2: { targetWpm: 55, minFluency: 65, turns: 6, turnTimeSec: 35 },
    3: { targetWpm: 70, minFluency: 70, turns: 7, turnTimeSec: 40 },
  },
  BAND_6_8: {
    1: { targetWpm: 60, minFluency: 65, turns: 5, turnTimeSec: 35 },
    2: { targetWpm: 75, minFluency: 70, turns: 6, turnTimeSec: 40 },
    3: { targetWpm: 90, minFluency: 75, turns: 7, turnTimeSec: 45 },
  },
  BAND_9_10: {
    1: { targetWpm: 80, minFluency: 70, turns: 6, turnTimeSec: 40 },
    2: { targetWpm: 95, minFluency: 75, turns: 7, turnTimeSec: 45 },
    3: { targetWpm: 110, minFluency: 80, turns: 8, turnTimeSec: 50 },
  },
};

export function getSpeakingLevelConfig(band: GradeBand, level: number): SpeakingLevelConfig {
  return LEVEL_CONFIG[band][level] ?? LEVEL_CONFIG[band][1];
}

const FILLER_WORDS = [
  "um", "uh", "uhh", "umm", "er", "err",
  "like", "basically", "literally", "actually",
  "you know", "kind of", "sort of", "i mean",
];

export interface TurnRecord {
  aiText: string;
  studentText: string;
  durationSec: number;
  wordCount: number;
  wpm: number;
  fillerCount: number;
  longPauses: number;
}

export interface SpeakingScoreResult {
  wpm: number;
  fluencyScore: number;
  totalWords: number;
  durationSec: number;
  passed: boolean;
  targetWpm: number;
  minFluency: number;
}

export function scoreTurn(
  transcript: string,
  durationSec: number
): Pick<TurnRecord, "wordCount" | "wpm" | "fillerCount"> {
  const words = transcript.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const wpm = durationSec > 0 ? (wordCount / durationSec) * 60 : 0;

  const lower = transcript.toLowerCase();
  let fillerCount = 0;
  for (const filler of FILLER_WORDS) {
    const re = new RegExp(`\\b${filler}\\b`, "g");
    const matches = lower.match(re);
    if (matches) fillerCount += matches.length;
  }

  return { wordCount, wpm: Math.round(wpm * 10) / 10, fillerCount };
}

export function scoreSpeakingSession(
  turns: TurnRecord[],
  band: GradeBand,
  level: number
): SpeakingScoreResult {
  const config = getSpeakingLevelConfig(band, level);

  const studentTurns = turns.filter((t) => t.wordCount > 0);
  if (studentTurns.length === 0) {
    return { wpm: 0, fluencyScore: 0, totalWords: 0, durationSec: 0, passed: false, targetWpm: config.targetWpm, minFluency: config.minFluency };
  }

  const totalWords = studentTurns.reduce((s, t) => s + t.wordCount, 0);
  const totalDuration = studentTurns.reduce((s, t) => s + t.durationSec, 0);
  const wpm = totalDuration > 0 ? Math.round((totalWords / totalDuration) * 60 * 10) / 10 : 0;

  // Fluency: start at 100, deduct for fillers and very short responses
  let fluency = 100;
  for (const t of studentTurns) {
    // -3 per filler word, capped at -15 per turn
    fluency -= Math.min(t.fillerCount * 3, 15);
    // -8 if student spoke < 5 words (essentially gave up)
    if (t.wordCount < 5) fluency -= 8;
    // -5 if student spoke < 40% of allotted time
    const allottedSec = config.turnTimeSec;
    if (t.durationSec < allottedSec * 0.4 && t.wordCount < 10) fluency -= 5;
  }
  // bonus for vocabulary diversity
  const allWords = studentTurns.flatMap((t) => t.studentText.toLowerCase().split(/\s+/));
  const uniqueRatio = allWords.length > 0 ? new Set(allWords).size / allWords.length : 0;
  if (uniqueRatio > 0.6) fluency += 5;

  const fluencyScore = Math.max(0, Math.min(100, Math.round(fluency)));
  const passed = wpm >= config.targetWpm * 0.85 && fluencyScore >= config.minFluency;

  return { wpm, fluencyScore, totalWords, durationSec: totalDuration, passed, targetWpm: config.targetWpm, minFluency: config.minFluency };
}
