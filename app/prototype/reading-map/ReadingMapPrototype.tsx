"use client";

/**
 * Reading map prototype (Phase 2 task 2.1).
 * The student reads aloud; the browser's speech recognition hears the words; lib/reading-map.ts
 * turns that into a per-word map. Nothing leaves the browser except the audio Chrome sends to its
 * own speech service. Nothing is saved.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildReadingMap,
  mergeSpokenWords,
  mostMissed,
  normalizeWord,
  tokenizePassage,
  type ReadingMap,
  type SpokenWord,
  type WordStatus,
} from "@/lib/reading-map";

const PASSAGE =
  "Ravi went to the market with his mother. It was very busy. He bought fresh vegetables and a big red mango. " +
  "On the way home, they walked through the park and sat under a tall tree. Ravi felt happy and thankful.";

type SRAlternative = { transcript: string; confidence: number };
type SRResult = { isFinal: boolean; 0: SRAlternative; length: number };
type SREvent = { results: { length: number; [i: number]: SRResult } };
type Recognizer = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: SREvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
};

const STYLE: Record<WordStatus, string> = {
  fluent: "bg-emerald-100 text-emerald-900",
  selfCorrected: "bg-emerald-100 text-emerald-900 underline decoration-2 decoration-emerald-600",
  hesitated: "bg-amber-200 text-amber-950",
  misread: "bg-rose-200 text-rose-950",
  skipped: "text-rose-700 ring-2 ring-inset ring-rose-400",
  unclear: "bg-slate-200 text-slate-600",
};
const LABEL: Record<WordStatus, string> = {
  fluent: "Fluent",
  selfCorrected: "Self-corrected",
  hesitated: "Hesitated",
  misread: "Misread",
  skipped: "Skipped",
  unclear: "Unclear (not an error)",
};
const ORDER: WordStatus[] = ["fluent", "selfCorrected", "hesitated", "misread", "skipped", "unclear"];

// Scripted reading for "Demo without microphone": [heard word, ms after previous word]
const DEMO: [string, number][] = [
  ["ravi", 0], ["went", 380], ["to", 300], ["the", 300], ["market", 420], ["with", 350], ["his", 300], ["mother", 420],
  ["it", 900], ["was", 300], ["wery", 380], ["busy", 400],
  ["he", 900], ["boat", 450], ["bought", 500], ["fresh", 400], ["vegetables", 2300], ["and", 350], ["a", 250], ["big", 300], ["red", 300], ["mango", 450],
  ["on", 1000], ["the", 350], ["way", 400], ["home", 450], ["they", 900], ["walked", 600], ["thought", 700], ["the", 600], ["park", 650],
  ["and", 650], ["sat", 700], ["under", 700], ["a", 650], ["tree", 900],
  ["ravi", 1300], ["felt", 800], ["happy", 900], ["and", 800], ["thankful", 1100],
];

type Attempt = { name: string; map: ReadingMap };
type Tab = "student" | "teacher" | "class";

export function ReadingMapPrototype() {
  const passage = useMemo(() => tokenizePassage(PASSAGE), []);
  const [stage, setStage] = useState(3);
  const [name, setName] = useState("Ravi");
  const [phase, setPhase] = useState<"ready" | "reading" | "done">("ready");
  const [spoken, setSpoken] = useState<SpokenWord[]>([]);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("student");
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [overrides, setOverrides] = useState<Record<number, WordStatus>>({});
  const [supported, setSupported] = useState(true);

  const recRef = useRef<Recognizer | null>(null);
  const stoppedRef = useRef(false);
  const startRef = useRef(0);
  const finalsRef = useRef<{ norm: string; confidence?: number }[]>([]);
  const spokenRef = useRef<SpokenWord[]>([]);
  const demoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
    setSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
    return () => {
      stoppedRef.current = true;
      recRef.current?.stop();
      if (demoTimer.current) clearTimeout(demoTimer.current);
    };
  }, []);

  const map = useMemo(() => {
    const m = buildReadingMap(passage, spoken, { stage });
    if (phase !== "done") return m;
    // Teacher corrections (tap a word) override the machine's status
    return { ...m, words: m.words.map((w) => (overrides[w.index] ? { ...w, status: overrides[w.index] } : w)) };
  }, [passage, spoken, stage, overrides, phase]);

  function setTimeline(next: SpokenWord[]) {
    spokenRef.current = next;
    setSpoken(next);
  }

  function reset() {
    setError("");
    setOverrides({});
    finalsRef.current = [];
    setTimeline([]);
    startRef.current = performance.now();
    stoppedRef.current = false;
    setPhase("reading");
  }

  function finish() {
    stoppedRef.current = true;
    recRef.current?.stop();
    if (demoTimer.current) clearTimeout(demoTimer.current);
    setPhase("done");
    setTab("student");
    const finalMap = buildReadingMap(passage, spokenRef.current, { stage });
    if (spokenRef.current.length > 0) {
      setAttempts((a) => [...a, { name: name.trim() || `Reader ${a.length + 1}`, map: finalMap }]);
    }
  }

  function startMic() {
    const w = window as unknown as { SpeechRecognition?: new () => Recognizer; webkitSpeechRecognition?: new () => Recognizer };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      setError("This browser has no speech recognition. Use Chrome (desktop or Android), or try the demo.");
      return;
    }
    reset();
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-IN";
    recRef.current = rec;

    rec.onresult = (event) => {
      // Words from this recognition run: finals carry confidence, interim words don't
      const runWords: { norm: string; confidence?: number }[] = [];
      for (let i = 0; i < event.results.length; i++) {
        const r = event.results[i];
        const conf = r.isFinal && r[0].confidence > 0 ? r[0].confidence : undefined;
        for (const part of r[0].transcript.split(/\s+/)) {
          const norm = normalizeWord(part);
          if (norm) runWords.push({ norm, confidence: conf });
        }
      }
      const all = [...finalsRef.current, ...runWords];
      setTimeline(mergeSpokenWords(spokenRef.current, all, performance.now() - startRef.current));
    };
    rec.onend = () => {
      if (stoppedRef.current) return;
      // Chrome stops after a silence: keep what we have and listen again
      finalsRef.current = spokenRef.current.map((s) => ({ norm: s.norm, confidence: s.confidence }));
      try {
        rec.start();
      } catch {
        /* already started */
      }
    };
    rec.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      stoppedRef.current = true;
      setPhase("ready");
      setError(
        e.error === "not-allowed"
          ? "Microphone permission was blocked. Allow the microphone for this site and try again."
          : `Speech recognition error: ${e.error}`
      );
    };
    rec.start();
  }

  function startDemo() {
    reset();
    let i = 0;
    let t = 0;
    const step = () => {
      if (stoppedRef.current || i >= DEMO.length) {
        if (!stoppedRef.current) finish();
        return;
      }
      t += DEMO[i][1];
      const next: SpokenWord = { norm: DEMO[i][0], t };
      setTimeline([...spokenRef.current, next]);
      i++;
      demoTimer.current = setTimeout(step, DEMO[i]?.[1] ?? 300);
    };
    step();
  }

  function cycleOverride(index: number, current: WordStatus) {
    if (phase !== "done") return;
    const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
    setOverrides((o) => ({ ...o, [index]: next }));
  }

  function speak(word: string) {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(word);
    u.lang = "en-IN";
    u.rate = 0.8;
    window.speechSynthesis.speak(u);
  }

  const s = map.summary;
  const current = phase === "reading" ? s.lastReadIndex + 1 : -1;
  const classMissed = mostMissed(
    attempts.map((a) => a.map),
    passage
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Prototype · task 2.1</p>
          <h1 className="text-2xl font-bold">Reading map</h1>
          <p className="text-sm text-slate-600">
            Read the passage aloud. WizLingo follows along word by word and shows how it was read. Nothing is saved.
          </p>
        </header>

        <section className="flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 shadow-sm">
          <label className="text-sm">
            <span className="block text-slate-600">Reader</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={phase === "reading"}
              className="mt-1 w-36 rounded-md border border-slate-300 px-2 py-1"
            />
          </label>
          <label className="text-sm">
            <span className="block text-slate-600">Stage</span>
            <select
              value={stage}
              onChange={(e) => setStage(Number(e.target.value))}
              disabled={phase === "reading"}
              className="mt-1 rounded-md border border-slate-300 px-2 py-1"
            >
              <option value={2}>2 · Word Wizard (longer pause allowed)</option>
              <option value={3}>3 · Story Wizard</option>
              <option value={4}>4 · Voice Wizard</option>
            </select>
          </label>
          <div className="ml-auto flex gap-2">
            {phase === "reading" ? (
              <button onClick={finish} className="rounded-lg bg-rose-600 px-4 py-2 font-semibold text-white">
                ⏹ I&apos;m done
              </button>
            ) : (
              <>
                <button
                  onClick={startMic}
                  disabled={!supported}
                  className="rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white disabled:opacity-40"
                >
                  🎤 Start reading
                </button>
                <button onClick={startDemo} className="rounded-lg border border-violet-300 px-4 py-2 font-semibold text-violet-700">
                  ▶ Demo without microphone
                </button>
              </>
            )}
          </div>
          {!supported && (
            <p className="w-full text-sm text-amber-700">
              This browser has no speech recognition (works in Chrome desktop and Android). The demo still works.
            </p>
          )}
          {error && <p className="w-full text-sm text-rose-700">{error}</p>}
        </section>

        {/* Passage */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-xl leading-[2.6rem]">
            {map.words.map((w) => {
              const isCurrent = w.index === current;
              const read = phase === "reading" && w.index <= s.lastReadIndex;
              const cls =
                phase === "done"
                  ? w.index <= s.lastReadIndex
                    ? STYLE[w.status]
                    : "text-slate-400"
                  : isCurrent
                    ? "bg-violet-600 text-white"
                    : read
                      ? "text-slate-400"
                      : "";
              const tip =
                phase === "done" && w.index <= s.lastReadIndex
                  ? `${LABEL[w.status]}${w.spoken ? ` · heard "${w.spoken}"` : ""}${
                      w.gapMs !== undefined ? ` · pause ${(w.gapMs / 1000).toFixed(1)}s` : ""
                    } · tap to correct`
                  : undefined;
              return (
                <span key={w.index}>
                  <button
                    type="button"
                    title={tip}
                    onClick={() => cycleOverride(w.index, w.status)}
                    className={`rounded px-1 transition-colors ${cls} ${phase === "done" ? "cursor-pointer" : "cursor-default"}`}
                  >
                    {w.display}
                  </button>{" "}
                </span>
              );
            })}
          </p>
          {phase === "reading" && (
            <p className="mt-4 text-sm text-slate-500">
              Listening… heard {spoken.length} words. The highlighted word is where you are.
            </p>
          )}
        </section>

        {phase === "done" && (
          <section className="rounded-xl bg-white shadow-sm">
            <nav className="flex border-b border-slate-200 text-sm font-semibold">
              {(["student", "teacher", "class"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-3 ${tab === t ? "border-b-2 border-violet-600 text-violet-700" : "text-slate-500"}`}
                >
                  {t === "student" ? "Student sees" : t === "teacher" ? "Teacher sees" : `Class view (${attempts.length})`}
                </button>
              ))}
            </nav>

            <div className="p-6">
              {tab === "student" && (
                <div className="space-y-4">
                  {s.noisy ? (
                    <p className="text-lg">
                      🎧 It was hard to hear you clearly. Find a quieter spot and try again. This doesn&apos;t count
                      against you.
                    </p>
                  ) : (
                    <>
                      <p className="text-2xl font-bold">You read {s.wordsReadSmoothly} words smoothly! 🌟</p>
                      {s.counts.selfCorrected > 0 && (
                        <p className="text-slate-600">
                          You fixed {s.counts.selfCorrected} word{s.counts.selfCorrected > 1 ? "s" : ""} by yourself.
                          That&apos;s what good readers do.
                        </p>
                      )}
                      {s.trickyWords.length > 0 ? (
                        <div>
                          <p className="mb-2 font-semibold">Tricky words to practise:</p>
                          <div className="flex flex-wrap gap-2">
                            {s.trickyWords.slice(0, 3).map((w) => (
                              <button
                                key={w}
                                onClick={() => speak(w)}
                                className="rounded-full bg-violet-100 px-4 py-2 text-lg font-semibold text-violet-800"
                              >
                                🔊 {w}
                              </button>
                            ))}
                          </div>
                          <p className="mt-2 text-xs text-slate-500">These go into your word practice tomorrow.</p>
                        </div>
                      ) : (
                        <p>No tricky words this time. Ready for a harder story?</p>
                      )}
                    </>
                  )}
                </div>
              )}

              {tab === "teacher" && (
                <div className="space-y-5">
                  <div className="flex flex-wrap gap-2 text-xs">
                    {ORDER.map((k) => (
                      <span key={k} className={`rounded px-2 py-1 ${STYLE[k]}`}>
                        {LABEL[k]} · {s.counts[k]}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Stat label="Accuracy (clear words)" value={`${s.accuracyPct}%`} />
                    <Stat label="Words per minute" value={s.wpm ?? "–"} />
                    <Stat
                      label="Stamina"
                      value={s.stamina.dropPct === null ? "–" : s.stamina.dropPct > 15 ? `slows ${s.stamina.dropPct}%` : "steady"}
                    />
                    <Stat label="Words reached" value={`${s.lastReadIndex + 1} / ${s.totalWords}`} />
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-semibold">Speed per sentence</p>
                    <div className="space-y-1">
                      {s.sentencePace.map((p) => {
                        const max = Math.max(...s.sentencePace.map((x) => x.wpm ?? 0), 1);
                        return (
                          <div key={p.sentence} className="flex items-center gap-2 text-xs">
                            <span className="w-20 text-slate-500">Sentence {p.sentence + 1}</span>
                            <div className="h-3 flex-1 rounded bg-slate-100">
                              <div
                                className="h-3 rounded bg-violet-500"
                                style={{ width: `${p.wpm ? (p.wpm / max) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="w-16 text-right">{p.wpm ? `${p.wpm} wpm` : "too short"}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {s.trickyWords.length > 0 && (
                    <p className="text-sm">
                      <span className="font-semibold">Tricky words → vocabulary review:</span> {s.trickyWords.join(", ")}
                    </p>
                  )}
                  {s.noisy && (
                    <p className="text-sm text-amber-700">
                      Many words were unclear: likely a noisy room or a weak microphone. Listen before judging.
                    </p>
                  )}
                  <p className="text-xs text-slate-500">
                    Hover a word for details; tap a word to correct the machine. One reading is not a diagnosis.
                  </p>
                </div>
              )}

              {tab === "class" && (
                <div className="space-y-4">
                  {attempts.length < 2 && (
                    <p className="text-sm text-slate-500">
                      Read it again with a different reader name (or run the demo again) to see the class view build up.
                    </p>
                  )}
                  <div>
                    <p className="mb-2 font-semibold">Most missed words — teach these tomorrow</p>
                    {classMissed.length === 0 ? (
                      <p className="text-sm text-slate-500">None yet.</p>
                    ) : (
                      <ul className="space-y-1 text-sm">
                        {classMissed.map((m) => (
                          <li key={m.word}>
                            <span className="font-semibold">{m.word}</span>{" "}
                            <span className="text-slate-500">
                              · {m.readers} of {attempts.length} reader{attempts.length > 1 ? "s" : ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead className="text-slate-500">
                      <tr>
                        <th className="py-1">Reader</th>
                        <th>Accuracy</th>
                        <th>WPM</th>
                        <th>Needs a listen?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attempts.map((a, i) => (
                        <tr key={i} className="border-t border-slate-100">
                          <td className="py-1">{a.name}</td>
                          <td>{a.map.summary.accuracyPct}%</td>
                          <td>{a.map.summary.wpm ?? "–"}</td>
                          <td>{a.map.summary.noisy ? "Yes, unclear audio" : ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}
