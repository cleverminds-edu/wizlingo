"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { CHARACTER_INFO } from "@/lib/speaking-topics";
import { TurnRecord, scoreTurn } from "@/lib/speaking-score";
import { ConversationTurn } from "@/lib/ai-conversation";

interface ConversationSessionProps {
  sessionId: string;
  character: string;
  openingLine: string;
  topicTitle: string;
  gradeBand: string;
  maxTurns: number;
  turnTimeSec: number;
  onComplete: (result: { turns: TurnRecord[]; totalWords: number; durationSec: number }) => void;
}

type Phase = "intro" | "ai-speaking" | "ai-thinking" | "student-speaking" | "between-turns" | "done";

interface SpeechRecognitionInstance {
  continuous: boolean; interimResults: boolean; lang: string;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  start(): void; stop(): void; abort(): void;
}
interface SpeechRecognitionEvent extends Event { resultIndex: number; results: SpeechRecognitionResultList; }
interface SpeechRecognitionResultList { length: number; [i: number]: SpeechRecognitionResult; }
interface SpeechRecognitionResult { isFinal: boolean; [i: number]: { transcript: string }; }
interface SpeechRecognitionErrorEvent extends Event { error: string; }

function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const FEMALE_CHARACTERS = ["Meera", "Priya"];

// Voice pitch and rate matched to grade band and character gender
const VOICE_SETTINGS: Record<string, { pitchF: number; pitchM: number; rate: number }> = {
  BAND_1_2:  { pitchF: 1.5, pitchM: 1.2, rate: 0.82 },
  BAND_3_5:  { pitchF: 1.3, pitchM: 1.05, rate: 0.88 },
  BAND_6_8:  { pitchF: 1.1, pitchM: 0.95, rate: 0.95 },
  BAND_9_10: { pitchF: 1.0, pitchM: 0.88, rate: 1.0  },
};

function pickVoice(character: string, gradeBand: string): { voice: SpeechSynthesisVoice | null; pitch: number; rate: number } {
  const isFemale = FEMALE_CHARACTERS.includes(character);
  const settings = VOICE_SETTINGS[gradeBand] ?? VOICE_SETTINGS.BAND_3_5;
  const pitch = isFemale ? settings.pitchF : settings.pitchM;
  const rate  = settings.rate;

  const voices = window.speechSynthesis.getVoices();
  const local  = voices.filter(v => v.localService);
  const pool   = local.length > 0 ? local : voices;

  // Female name hints for voice matching
  const femaleHints = ["samantha", "victoria", "karen", "moira", "veena", "zira", "female", "woman", "girl"];
  const maleHints   = ["daniel", "alex", "tom", "fred", "rishi", "male", "man", "guy"];
  const hints = isFemale ? femaleHints : maleHints;

  let voice: SpeechSynthesisVoice | null = null;

  // Try en-IN first, then en-GB, then any English
  for (const lang of ["en-IN", "en-GB", "en-US", "en"]) {
    const langPool = pool.filter(v => v.lang.startsWith(lang.replace("-", "")));
    voice = langPool.find(v => hints.some(h => v.name.toLowerCase().includes(h))) ?? null;
    if (voice) break;
  }
  // Fallback: any English voice
  if (!voice) voice = pool.find(v => v.lang.startsWith("en")) ?? null;

  return { voice, pitch, rate };
}

export default function ConversationSession({
  sessionId: _sessionId,
  character,
  openingLine,
  topicTitle,
  gradeBand,
  maxTurns,
  turnTimeSec,
  onComplete,
}: ConversationSessionProps) {
  const charInfo = CHARACTER_INFO[character] ?? { emoji: "🤖", from: "", tagline: "" };

  const [phase, setPhase]             = useState<Phase>("intro");
  const [studentTurnCount, setStudentTurnCount] = useState(0);
  const [transcript, setTranscript]   = useState("");
  const [interimText, setInterimText] = useState("");
  const [timeLeft, setTimeLeft]       = useState(turnTimeSec);
  const [recordedTurns, setRecordedTurns] = useState<TurnRecord[]>([]);
  const [browserOk, setBrowserOk]     = useState(true);
  const [micError, setMicError]       = useState("");
  const [micReady, setMicReady]       = useState(false);
  const [currentAiText, setCurrentAiText] = useState(openingLine);
  const [history, setHistory]         = useState<ConversationTurn[]>([
    { role: "ai", text: openingLine },
  ]);

  const timerRef          = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef    = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef("");
  const startTimeRef      = useRef(0);
  const committedRef      = useRef(false);
  const recordedTurnsRef  = useRef<TurnRecord[]>([]);
  const historyRef        = useRef<ConversationTurn[]>([{ role: "ai", text: openingLine }]);
  const studentTurnRef    = useRef(0);
  const finishSpeakRef    = useRef<(() => void) | null>(null);
  const startStudentTurnRef = useRef<() => void>(null!);

  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
  };

  const speakText = useCallback((text: string, onEnd?: () => void) => {
    if (typeof window === "undefined" || !window.speechSynthesis) { onEnd?.(); return; }
    const synth = window.speechSynthesis;
    if (synth.speaking || synth.pending) synth.cancel();

    const makeUtter = (withVoice = true) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-IN";
      const { voice, pitch, rate } = pickVoice(character, gradeBand);
      u.pitch = pitch;
      u.rate  = rate;
      if (withVoice && voice) u.voice = voice;
      return u;
    };

    if (!onEnd) { synth.pause(); synth.speak(makeUtter()); synth.resume(); return; }

    let done = false;
    let fallbackId: ReturnType<typeof setTimeout> | null = null;

    const finish = () => {
      if (done) return;
      done = true;
      if (fallbackId) { clearTimeout(fallbackId); fallbackId = null; }
      finishSpeakRef.current = null;
      onEnd();
    };

    finishSpeakRef.current = finish;
    const words = text.trim().split(/\s+/).length;
    const estimatedMs = Math.min((words / 120) * 60_000 + 2000, 30_000);

    const trySpeak = (attempt: number) => {
      if (done) return;
      const utter = makeUtter(attempt === 1);
      let utterDone = false;

      utter.onend = () => {
        if (utterDone || done) return;
        utterDone = true;
        if (fallbackId) { clearTimeout(fallbackId); fallbackId = null; }
        finish();
      };

      utter.onerror = (e) => {
        if (utterDone || done) return;
        utterDone = true;
        if (fallbackId) { clearTimeout(fallbackId); fallbackId = null; }
        if ((e.error === "canceled" || e.error === "interrupted") && attempt < 2) {
          setTimeout(() => trySpeak(2), 300);
        } else {
          finish();
        }
      };

      synth.pause();
      synth.speak(utter);
      synth.resume();

      if (fallbackId) clearTimeout(fallbackId);
      fallbackId = setTimeout(() => { synth.cancel(); finish(); }, estimatedMs);
    };

    trySpeak(1);
  }, [character, gradeBand]);

  // After student turn: call AI or end session
  const commitTurn = useCallback(() => {
    committedRef.current = true;
    setMicReady(false);
    stopTimer();
    stopRecognition();
    window.speechSynthesis?.cancel();

    const text       = finalTranscriptRef.current.trim();
    const durationSec = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const { wordCount, wpm, fillerCount } = scoreTurn(text, durationSec);

    const record: TurnRecord = {
      aiText: currentAiText,
      studentText: text,
      durationSec,
      wordCount,
      wpm,
      fillerCount,
      longPauses: 0,
    };

    const updatedTurns = [...recordedTurnsRef.current, record];
    recordedTurnsRef.current = updatedTurns;
    setRecordedTurns(updatedTurns);

    // Update history with student response
    const updatedHistory: ConversationTurn[] = [
      ...historyRef.current,
      { role: "student", text: text || "..." },
    ];
    historyRef.current = updatedHistory;
    setHistory(updatedHistory);

    const nextTurnCount = studentTurnRef.current + 1;
    studentTurnRef.current = nextTurnCount;
    setStudentTurnCount(nextTurnCount);

    if (nextTurnCount >= maxTurns) {
      const totalWords    = updatedTurns.reduce((s, t) => s + t.wordCount, 0);
      const totalDuration = updatedTurns.reduce((s, t) => s + t.durationSec, 0);
      setPhase("done");
      onComplete({ turns: updatedTurns, totalWords, durationSec: totalDuration });
      return;
    }

    // Fetch next AI response
    setPhase("between-turns");
    const isLastTurn = nextTurnCount >= maxTurns - 1;

    fetch("/api/speaking/ai-turn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        character,
        topicTitle,
        gradeBand,
        history: updatedHistory,
        isLastTurn,
      }),
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(({ text: aiResponse }: { text: string }) => {
        const newHistory: ConversationTurn[] = [
          ...historyRef.current,
          { role: "ai", text: aiResponse },
        ];
        historyRef.current = newHistory;
        setHistory(newHistory);
        setCurrentAiText(aiResponse);
        setTranscript("");
        setInterimText("");
        setPhase("ai-speaking");
        speakText(aiResponse, () => startStudentTurnRef.current());
      })
      .catch(() => {
        // Fallback: skip AI response and go straight to next student turn
        setTranscript("");
        setInterimText("");
        setPhase("student-speaking");
        startStudentTurnRef.current();
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character, topicTitle, gradeBand, maxTurns, onComplete, currentAiText, speakText]);

  const startStudentTurn = useCallback(() => {
    committedRef.current = false;
    finalTranscriptRef.current = "";
    startTimeRef.current = Date.now();
    setTranscript("");
    setInterimText("");
    setTimeLeft(turnTimeSec);
    setElapsed(0);
    setMicError("");
    setMicReady(false);
    setPhase("student-speaking");

    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) return;

    function startRec() {
      const rec = new SpeechRecognitionCtor!();
      rec.continuous     = true;
      rec.interimResults = true;
      rec.lang           = "en-IN";

      rec.onresult = (e: SpeechRecognitionEvent) => {
        let finals = "";
        let interim = "";
        for (let i = 0; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) finals += t + " ";
          else interim = t;
        }
        if (finals) finalTranscriptRef.current = finals;
        setTranscript(finalTranscriptRef.current);
        setInterimText(interim);
      };

      rec.onerror = (e: SpeechRecognitionErrorEvent) => {
        if (e.error === "not-allowed") setMicError("Mic access denied. Please allow microphone.");
        else if (e.error === "no-speech") startRec();
        else if (e.error !== "aborted") setMicError(`Mic error: ${e.error}`);
      };

      rec.onend = () => {
        if (!committedRef.current) {
          try { rec.start(); } catch { /* ignore restart errors */ }
        }
      };

      try {
        rec.start();
        recognitionRef.current = rec;
        setTimeout(() => setMicReady(true), 600);
      } catch {
        setMicError("Could not start microphone.");
      }
    }

    startRec();

    // Countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          stopTimer();
          if (!committedRef.current) commitTurn();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnTimeSec, commitTurn]);

  // Keep ref in sync with latest startStudentTurn
  useEffect(() => { startStudentTurnRef.current = startStudentTurn; }, [startStudentTurn]);

  // elapsed state (separate from countdown timer)
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (phase !== "student-speaking") return;
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (!getSpeechRecognition()) setBrowserOk(false);
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.addEventListener("voiceschanged", () => window.speechSynthesis.getVoices());
    }
    const keepAlive = setInterval(() => {
      if (window.speechSynthesis && !window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10_000);
    return () => {
      clearInterval(keepAlive);
      stopTimer();
      stopRecognition();
      window.speechSynthesis?.cancel();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDone() {
    if (!committedRef.current) commitTurn();
  }

  if (!browserOk) {
    return (
      <div className="text-center py-10">
        <p className="text-4xl mb-4">🌐</p>
        <p className="text-white font-bold text-xl mb-2">Chrome Required</p>
        <p className="text-purple-300">Please open this page in Google Chrome for the speaking feature.</p>
      </div>
    );
  }

  const progressPct = Math.round((studentTurnCount / maxTurns) * 100);

  return (
    <div className="flex flex-col gap-6">

      {/* Character card */}
      <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-3xl p-5 border border-white/20">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl bg-white/10 border border-white/20 shrink-0">
          {charInfo.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-black text-lg">{character}</p>
          <p className="text-purple-300 text-sm">{charInfo.from}</p>
          <p className="text-purple-400 text-xs mt-0.5 italic">{charInfo.tagline}</p>
        </div>
        {/* Turn progress */}
        <div className="text-right shrink-0">
          <p className="text-white/60 text-xs mb-1">Turn {Math.min(studentTurnCount + 1, maxTurns)} of {maxTurns}</p>
          <div className="w-24 bg-white/10 rounded-full h-2">
            <div className="bg-purple-400 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      {/* Intro — start button */}
      {phase === "intro" && (
        <div className="text-center py-6">
          <p className="text-purple-200 text-lg mb-6">
            {character} wants to chat with you about <span className="text-white font-bold">"{topicTitle}"</span>!
          </p>
          <button
            onClick={() => {
              setPhase("ai-speaking");
              speakText(openingLine, () => startStudentTurnRef.current());
            }}
            className="px-10 py-4 rounded-2xl font-black text-white text-xl shadow-2xl transition-transform hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
          >
            Start Talking! 🎤
          </button>
        </div>
      )}

      {/* AI speaking */}
      {(phase === "ai-speaking" || phase === "between-turns") && (
        <div className="bg-white/10 rounded-3xl p-6 border border-white/20">
          <div className="flex items-start gap-3">
            <span className="text-3xl shrink-0">{charInfo.emoji}</span>
            <div className="flex-1">
              <p className="text-purple-300 text-xs font-semibold uppercase tracking-wider mb-2">{character} says</p>
              <p className="text-white text-lg leading-relaxed">{currentAiText}</p>
            </div>
          </div>
          {phase === "ai-speaking" && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-purple-400 wave-bar" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
                <span className="text-purple-400 text-sm ml-2">Speaking…</span>
              </div>
              <button onClick={() => { window.speechSynthesis?.cancel(); finishSpeakRef.current?.(); }}
                className="text-xs text-purple-500 hover:text-purple-300 underline transition-colors">
                Skip →
              </button>
            </div>
          )}
        </div>
      )}

      {/* AI thinking */}
      {phase === "between-turns" && (
        <div className="flex items-center gap-3 text-purple-400 text-sm">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2.5 h-2.5 rounded-full bg-purple-400 wave-bar" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
          {character} is thinking…
        </div>
      )}

      {/* Student speaking */}
      {phase === "student-speaking" && (
        <div className="flex flex-col gap-4">
          {/* What the character said (context reminder) */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <p className="text-purple-400 text-xs font-semibold mb-1">{character} asked:</p>
            <p className="text-purple-200 text-sm italic">{currentAiText}</p>
          </div>

          {/* Live transcript */}
          <div className="bg-black/30 rounded-2xl p-4 min-h-[90px] border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              {micReady
                ? <><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /><span className="text-green-400 text-xs font-medium">Mic active — speak now</span></>
                : <><span className="w-2 h-2 rounded-full bg-yellow-400" /><span className="text-yellow-400 text-xs">Starting mic…</span></>
              }
            </div>
            <p className="text-white/90 text-base leading-relaxed">
              {transcript}
              <span className="text-purple-400/70 italic">{interimText}</span>
              {!transcript && !interimText && micReady && (
                <span className="text-purple-500">Start speaking…</span>
              )}
            </p>
          </div>

          {micError && <p className="text-red-400 text-sm text-center">{micError}</p>}

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-red-500/20 border border-red-500/40 px-4 py-3 rounded-2xl">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-300 font-mono font-bold text-lg">{timeLeft}s</span>
            </div>
            <button onClick={handleDone}
              className="flex-1 py-3 rounded-2xl font-bold text-white text-lg transition-all hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}>
              Done ✓
            </button>
          </div>
        </div>
      )}

      {/* Completed turns mini log */}
      {recordedTurns.length > 0 && phase !== "done" && (
        <div className="flex gap-2 flex-wrap">
          {recordedTurns.map((t, i) => (
            <div key={i} className="bg-white/10 rounded-xl px-3 py-2 text-xs text-purple-300 flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Turn {i + 1} · {t.wordCount}w · {Math.round(t.wpm)} WPM
            </div>
          ))}
        </div>
      )}

      {/* Suppressed unused variable warning */}
      {elapsed > 0 && null}
    </div>
  );
}
