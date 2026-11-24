/**
 * Reading map — how a student read a passage aloud, word by word.
 * Plan: docs/plans/PHASE_1_PILOT_BUILD_PLAN.md, "Phase 2 — Reading map (task 2.1)".
 *
 * Input: the passage, plus the words the browser's speech recognition heard, each with the time
 * it first appeared (≈ ±0.3 s). Output: a status per passage word and a short summary.
 *
 * Fairness rules (from the November records):
 * - A word the machine didn't catch clearly is "unclear" (grey), never the child's error.
 * - Common Indian-English sound pairs (v/w, z/j, th/t …) are not misreadings.
 * - One reading is never a diagnosis; patterns need several readings (not done here).
 *
 * Pure functions, no framework imports.
 */

export type WordStatus =
  | 'fluent'
  | 'hesitated'
  | 'misread'
  | 'skipped'
  | 'selfCorrected'
  | 'unclear';

export interface PassageToken {
  index: number;
  display: string; // as written, with punctuation
  norm: string; // lower-case, letters/digits/apostrophes only
  sentence: number; // 0-based sentence index
  pauseAfter: boolean; // punctuation after the word: a pause here is natural
}

export interface SpokenWord {
  norm: string;
  t: number; // ms since reading started, when the word first appeared
  confidence?: number; // 0–1 if the recogniser reported it
}

export interface WordResult {
  index: number;
  display: string;
  status: WordStatus;
  spoken?: string; // what was heard instead (misread / self-corrected / unclear)
  t?: number; // when it was read
  gapMs?: number; // pause before this word
}

export interface SentencePace {
  sentence: number;
  words: number;
  wpm: number | null; // null if too short to time
}

export interface ReadingMapSummary {
  totalWords: number;
  counts: Record<WordStatus, number>;
  wordsReadSmoothly: number; // fluent + selfCorrected
  accuracyPct: number; // of clear words: not misread/skipped
  wpm: number | null;
  sentencePace: SentencePace[];
  stamina: { firstThirdWpm: number | null; lastThirdWpm: number | null; dropPct: number | null };
  trickyWords: string[]; // misread, hesitated or skipped, most important first
  noisy: boolean; // too many unclear words to trust the result
  lastReadIndex: number; // last passage word reached (for the live highlight)
}

export interface ReadingMap {
  words: WordResult[];
  summary: ReadingMapSummary;
}

export interface ReadingMapOptions {
  stage?: number; // 1–5 (PD-002); Stages 1–2 get a longer pause allowance
  hesitationMs?: number; // override the pause threshold
  minConfidence?: number; // below this a non-matching word is "unclear", not "misread"
  lookahead?: number; // how far ahead to search for a skipped-to word
}

// ---------------------------------------------------------------------------
// Tokenising
// ---------------------------------------------------------------------------

export function normalizeWord(w: string): string {
  return w
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9']/g, '')
    .replace(/^'+|'+$/g, '');
}

export function tokenizePassage(text: string): PassageToken[] {
  const raw = text.split(/\s+/).filter(Boolean);
  const tokens: PassageToken[] = [];
  let sentence = 0;
  for (const display of raw) {
    const norm = normalizeWord(display);
    if (!norm) continue;
    const pauseAfter = /[.,;:!?…—)"”]$/.test(display);
    tokens.push({ index: tokens.length, display, norm, sentence, pauseAfter });
    if (/[.!?…]["”')]*$/.test(display)) sentence++;
  }
  return tokens;
}

export function splitSpoken(transcript: string): string[] {
  return transcript.split(/\s+/).map(normalizeWord).filter(Boolean);
}

// ---------------------------------------------------------------------------
// Word comparison
// ---------------------------------------------------------------------------

/** Fold common Indian-English sound pairs so "wery"/"very", "jero"/"zero", "tink"/"think" match. */
export function accentFold(w: string): string {
  return w
    .replace(/th/g, 't')
    .replace(/w/g, 'v')
    .replace(/z/g, 'j')
    .replace(/ph/g, 'f')
    .replace(/(.)\1+/g, '$1'); // doubled letters
}

function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

type Match = 'exact' | 'accent' | 'none';

function compare(orig: string, spoken: string): Match {
  if (orig === spoken) return 'exact';
  // Recognisers often drop or add a plural / tense ending on long words: not the child's error.
  if (orig.length >= 6 && editDistance(orig, spoken) <= 1) return 'exact';
  if (accentFold(orig) === accentFold(spoken)) return 'accent';
  return 'none';
}

// ---------------------------------------------------------------------------
// Building the map
// ---------------------------------------------------------------------------

export function buildReadingMap(
  passage: PassageToken[],
  spoken: SpokenWord[],
  options: ReadingMapOptions = {}
): ReadingMap {
  const stage = options.stage ?? 3;
  const hesitationMs = options.hesitationMs ?? (stage <= 2 ? 2500 : 1500);
  const minConfidence = options.minConfidence ?? 0.4;
  const lookahead = options.lookahead ?? 6;

  const results: WordResult[] = passage.map((p) => ({ index: p.index, display: p.display, status: 'skipped' }));
  let si = 0; // next spoken word
  let lastRead = -1;
  let prevT: number | undefined;
  let prevIdx = -1; // passage index of the previously read word

  /** Find spoken position (from si) where passage word `oi` appears, within the window. */
  const findAhead = (oi: number): { pos: number; kind: Match } | null => {
    for (let k = si; k < Math.min(spoken.length, si + lookahead); k++) {
      const kind = compare(passage[oi].norm, spoken[k].norm);
      if (kind !== 'none') return { pos: k, kind };
    }
    return null;
  };

  /** Does spoken[k] match any of the next few passage words after oi? (then oi was skipped) */
  const matchesUpcoming = (k: number, oi: number): boolean => {
    for (let j = oi + 1; j < Math.min(passage.length, oi + 1 + lookahead); j++) {
      if (compare(passage[j].norm, spoken[k].norm) !== 'none') return true;
    }
    return false;
  };

  for (let oi = 0; oi < passage.length && si < spoken.length; oi++) {
    const hit = findAhead(oi);

    if (hit) {
      // Spoken words between si and the hit are extras: a wrong attempt before the right word
      // (self-correction) if within 2 words, otherwise just repetition/noise.
      const extras = spoken.slice(si, hit.pos);
      const w = spoken[hit.pos];
      const r = results[oi];
      r.t = w.t;
      if (prevT !== undefined) r.gapMs = Math.max(0, w.t - prevT);

      const afterNaturalPause = prevIdx >= 0 && passage[prevIdx].pauseAfter;
      const paused = r.gapMs !== undefined && r.gapMs >= hesitationMs && !afterNaturalPause;

      if (extras.length > 0 && extras.length <= 2 && extras.every((e) => compare(passage[oi].norm, e.norm) === 'none')) {
        r.status = 'selfCorrected';
        r.spoken = extras.map((e) => e.norm).join(' ');
      } else if (hit.kind === 'accent') {
        r.status = 'unclear';
        r.spoken = w.norm;
      } else {
        r.status = paused ? 'hesitated' : 'fluent';
      }

      si = hit.pos + 1;
      prevT = w.t;
      prevIdx = oi;
      lastRead = oi;
      continue;
    }

    // No match for this passage word. Either it was skipped (the child jumped ahead) or misread.
    const w = spoken[si];
    if (matchesUpcoming(si, oi)) {
      results[oi].status = 'skipped';
      continue; // don't consume: the spoken word belongs to a later passage word
    }
    const r = results[oi];
    r.status = w.confidence !== undefined && w.confidence < minConfidence ? 'unclear' : 'misread';
    r.spoken = w.norm;
    r.t = w.t;
    if (prevT !== undefined) r.gapMs = Math.max(0, w.t - prevT);
    si++;
    prevT = w.t;
    prevIdx = oi;
    lastRead = oi;
  }

  // Words after the last one reached were not reached (reading stopped): leave them out of the
  // error counts by marking them skipped only if the reader clearly went past them.
  const reached = results.slice(0, lastRead + 1);

  return { words: results, summary: summarise(passage, reached, results, lastRead) };
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

function wpmBetween(words: WordResult[]): number | null {
  const timed = words.filter((w) => w.t !== undefined);
  if (timed.length < 4) return null;
  const ms = (timed[timed.length - 1].t as number) - (timed[0].t as number);
  if (ms < 1500) return null;
  return Math.round(((timed.length - 1) / ms) * 60000);
}

function summarise(
  passage: PassageToken[],
  reached: WordResult[],
  all: WordResult[],
  lastRead: number
): ReadingMapSummary {
  const counts: Record<WordStatus, number> = {
    fluent: 0,
    hesitated: 0,
    misread: 0,
    skipped: 0,
    selfCorrected: 0,
    unclear: 0,
  };
  for (const w of reached) counts[w.status]++;

  const clear = reached.length - counts.unclear;
  const errors = counts.misread + counts.skipped;
  const accuracyPct = clear > 0 ? Math.round(((clear - errors) / clear) * 100) : 0;

  const bySentence = new Map<number, WordResult[]>();
  for (const w of reached) {
    const s = passage[w.index].sentence;
    if (!bySentence.has(s)) bySentence.set(s, []);
    (bySentence.get(s) as WordResult[]).push(w);
  }
  const sentencePace: SentencePace[] = [...bySentence.entries()].map(([sentence, ws]) => ({
    sentence,
    words: ws.length,
    wpm: wpmBetween(ws),
  }));

  const third = Math.floor(reached.length / 3);
  const firstThirdWpm = third >= 4 ? wpmBetween(reached.slice(0, third)) : null;
  const lastThirdWpm = third >= 4 ? wpmBetween(reached.slice(reached.length - third)) : null;
  const dropPct =
    firstThirdWpm && lastThirdWpm ? Math.round(((firstThirdWpm - lastThirdWpm) / firstThirdWpm) * 100) : null;

  // Tricky words: misread & skipped first, then hesitated; longer words first (more useful to
  // practise than "a"/"the"); de-duplicated.
  const weight: Partial<Record<WordStatus, number>> = { misread: 3, skipped: 2, hesitated: 1 };
  const tricky = reached
    .filter((w) => weight[w.status])
    .map((w) => ({ word: passage[w.index].norm, score: (weight[w.status] as number) * 10 + passage[w.index].norm.length }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.word)
    .filter((w, i, arr) => w.length > 2 && arr.indexOf(w) === i);

  return {
    totalWords: all.length,
    counts,
    wordsReadSmoothly: counts.fluent + counts.selfCorrected,
    accuracyPct,
    wpm: wpmBetween(reached),
    sentencePace,
    stamina: { firstThirdWpm, lastThirdWpm, dropPct },
    trickyWords: tricky,
    noisy: reached.length >= 8 && counts.unclear / reached.length > 0.25,
    lastReadIndex: lastRead,
  };
}

// ---------------------------------------------------------------------------
// Live capture helper: give each recognised word the time it first appeared.
// ---------------------------------------------------------------------------

/**
 * Call on every speech-recognition result with the full transcript so far.
 * Keeps the first-seen time for each word position; interim revisions keep their original time.
 */
export function updateSpokenTimeline(
  previous: SpokenWord[],
  transcript: string,
  nowMs: number,
  confidenceForNew?: number
): SpokenWord[] {
  const words = splitSpoken(transcript);
  return words.map((norm, i) => {
    const old = previous[i];
    if (old) return { norm, t: old.t, confidence: old.norm === norm ? old.confidence : confidenceForNew };
    return { norm, t: nowMs, confidence: confidenceForNew };
  });
}

// ---------------------------------------------------------------------------
// Class view: most-missed words across several readings of the same passage.
// ---------------------------------------------------------------------------

export function mostMissed(maps: ReadingMap[], passage: PassageToken[], top = 5): { word: string; readers: number }[] {
  const counter = new Map<string, number>();
  for (const m of maps) {
    const seen = new Set<string>();
    for (const w of m.words.slice(0, m.summary.lastReadIndex + 1)) {
      if (w.status === 'misread' || w.status === 'skipped' || w.status === 'hesitated') {
        const word = passage[w.index].norm;
        if (word.length > 2 && !seen.has(word)) {
          seen.add(word);
          counter.set(word, (counter.get(word) ?? 0) + 1);
        }
      }
    }
  }
  return [...counter.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([word, readers]) => ({ word, readers }));
}

/**
 * Like updateSpokenTimeline, but takes words already split per recognition segment, so each word
 * can carry its segment's confidence (browsers report confidence on final segments only).
 */
export function mergeSpokenWords(
  previous: SpokenWord[],
  words: { norm: string; confidence?: number }[],
  nowMs: number
): SpokenWord[] {
  return words.map((w, i) => {
    const old = previous[i];
    return { norm: w.norm, t: old ? old.t : nowMs, confidence: w.confidence };
  });
}
