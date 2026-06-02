"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { GradeBand } from "@/app/generated/prisma/enums";
import { shareBadge } from "@/lib/badge-image";

interface Passage {
  id: string; title: string; content: string;
  wordCount: number; level: number; topic: string; gradeBand: GradeBand;
}
interface ScoreResult {
  wpm: number; accuracy: number;
  missedWords: string[]; wrongWords: { original: string; spoken: string }[];
  passed: boolean; transcript: string;
  targetWpm: number; minAccuracy: number;
  leveledUp: boolean; newLevel: number; passedSessions: number;
  aiFeedback?: string;
  newBadges?: string[];
  certificateVerifyCode?: string | null;
}
interface Props {
  passage: Passage; sessionId: string; timeLimitSec: number;
  studentName: string;
  onComplete: (score: ScoreResult) => void;
}

type Phase = "ready" | "recording" | "processing" | "result";

type SR = {
  continuous: boolean; interimResults: boolean; lang: string;
  onresult: ((e: any) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: any) => void) | null;
  start: () => void; stop: () => void;
};
declare global {
  interface Window {
    SpeechRecognition: new () => SR;
    webkitSpeechRecognition: new () => SR;
  }
}

function WaveAnimation({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const heights = [0.4, 0.7, 1.0, 0.7, 0.4, 0.9, 0.6, 0.8, 0.5, 0.9, 0.6];
  const barH = size === "lg" ? 48 : size === "md" ? 32 : 20;
  const barW = size === "lg" ? "w-2" : "w-1.5";
  return (
    <div className={`flex items-center justify-center gap-1 ${size === "lg" ? "h-16" : "h-10"}`}>
      {heights.map((h, i) => (
        <div key={i} className={`wave-bar ${barW} rounded-full bg-purple-400`}
          style={{ height: `${h * barH}px`, animationDelay: `${i * 0.09}s` }} />
      ))}
    </div>
  );
}

function CircularTimer({ timeLeft, totalTime }: { timeLeft: number; totalTime: number }) {
  const pct = timeLeft / totalTime;
  const r = 54; const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  const color = pct > 0.5 ? "#22c55e" : pct > 0.25 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="-rotate-90 absolute inset-0" width="144" height="144">
        <circle cx="72" cy="72" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
        <circle cx="72" cy="72" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s" }} />
      </svg>
      <div className="text-center z-10">
        <span className="text-white font-black text-3xl block">
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
        </span>
        <span className="text-white/50 text-xs">remaining</span>
      </div>
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    left: `${(i / 40) * 100}%`,
    delay: `${Math.random() * 0.6}s`,
    color: ["#f59e0b","#6366f1","#ec4899","#10b981","#f97316","#3b82f6"][i % 6],
    size: `${8 + Math.random() * 8}px`,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {pieces.map((p, i) => (
        <div key={i} className="confetti-piece rounded"
          style={{ left: p.left, top: "-10px", background: p.color,
            width: p.size, height: p.size, animationDelay: p.delay }} />
      ))}
    </div>
  );
}

function BadgeShareButton({ badge, label, studentName }: { badge: string; label: string; studentName: string }) {
  const [state, setState] = useState<"idle" | "generating" | "done" | "error">("idle");

  async function handleShare() {
    setState("generating");
    try {
      await shareBadge(badge, studentName, label);
      setState("done");
    } catch {
      setState("error");
    } finally {
      setTimeout(() => setState("idle"), 2500);
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={state === "generating"}
      className="flex items-center gap-2 bg-green-500 hover:bg-green-400 disabled:opacity-60 text-white font-bold text-sm px-4 py-2 rounded-xl transition-all active:scale-95 shrink-0"
    >
      {state === "generating" ? (
        <span className="animate-spin">⏳</span>
      ) : state === "done" ? (
        "✓ Shared!"
      ) : state === "error" ? (
        "Try again"
      ) : (
        <>
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Share
        </>
      )}
    </button>
  );
}

export default function ReadingSession({ passage, sessionId, timeLimitSec, studentName, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [timeLeft, setTimeLeft] = useState(timeLimitSec);
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [error, setError] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");

  const recognitionRef = useRef<SR | null>(null);
  const transcriptRef = useRef("");
  const accumulatedRef = useRef(""); // persists across recognition restarts
  const startTimeRef = useRef<number>(0);
  const durationRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stoppedRef = useRef(false);

  const submitTranscript = useCallback(async (transcript: string, durationSec: number) => {
    setPhase("processing");
    try {
      const res = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sessionId, transcript, durationSec }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error ?? `Error ${res.status}`);
      }
      const result: ScoreResult = await res.json();
      setScore(result);
      setPhase("result");
      onComplete(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setPhase("ready");
    }
  }, [sessionId, onComplete]);

  const stopRecording = useCallback(() => {
    if (stoppedRef.current) return;
    stoppedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    durationRef.current = Math.round((Date.now() - startTimeRef.current) / 1000);
    // Stop recognition — onend fires after the API finalizes any in-progress audio,
    // so submitTranscript is called there to capture the complete transcript.
    recognitionRef.current?.stop();
  }, []);

  useEffect(() => {
    if (phase === "recording") {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => { if (t <= 1) { stopRecording(); return 0; } return t - 1; });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, stopRecording]);

  function startRecording() {
    setError(""); setTimeLeft(timeLimitSec); setLiveTranscript("");
    transcriptRef.current = ""; accumulatedRef.current = ""; stoppedRef.current = false;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setError("Please use Google Chrome for this activity.");
      return;
    }
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      // Rebuild only THIS session's finals + interim (event.results resets on restart)
      let sessionFinal = "", interim = "";
      for (let i = 0; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) sessionFinal += t + " ";
        else interim += t;
      }
      // Prepend what was captured in previous sessions before this restart
      transcriptRef.current = accumulatedRef.current + sessionFinal;
      setLiveTranscript(accumulatedRef.current + sessionFinal + interim);
    };
    recognition.onend = () => {
      if (stoppedRef.current) {
        // All pending audio has been finalized by the speech API — safe to submit now
        submitTranscript(transcriptRef.current, durationRef.current);
      } else {
        // Restart: save finals so far, then continue listening
        accumulatedRef.current = transcriptRef.current;
        recognition.start();
      }
    };
    recognition.onerror = (e) => {
      if (e.error === "not-allowed") {
        setError("Microphone blocked. Click the 🔒 in the address bar and allow microphone.");
        setPhase("ready"); stoppedRef.current = true;
      }
    };

    recognition.start();
    startTimeRef.current = Date.now();
    setPhase("recording");
  }

  // ── Result screen ──
  if (phase === "result" && score) {
    // Stars based on level config thresholds
    const wpmPct = score.wpm / score.targetWpm;
    const accMet = score.accuracy >= score.minAccuracy;
    const stars = (wpmPct >= 1.0 && score.accuracy >= score.minAccuracy + 5) ? 3
                : (wpmPct >= 0.9 && accMet) ? 2
                : 1;
    const passed = score.passed;

    // Progress bar helper
    function ProgressBar({ value, target, unit, label }: { value: number; target: number; unit: string; label: string }) {
      const pct = Math.min((value / target) * 100, 100);
      const met = value >= target;
      return (
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-white/70">{label}</span>
            <span className={`font-bold ${met ? "text-emerald-300" : "text-amber-300"}`}>
              {value}{unit} / {target}{unit} {met ? "✓" : ""}
            </span>
          </div>
          <div className="bg-white/10 rounded-full h-3">
            <div className={`h-3 rounded-full transition-all duration-700 ${met ? "bg-emerald-400" : "bg-amber-400"}`}
              style={{ width: `${pct}%` }} />
          </div>
        </div>
      );
    }

    return (
      <div className="relative grid grid-cols-5 gap-6 animate-pop-in">
        {passed && <Confetti />}

        {/* Left: celebration panel (2/5) */}
        <div className={`col-span-2 rounded-3xl p-10 flex flex-col items-center justify-center text-center
          ${passed ? "bg-gradient-to-br from-green-400 to-emerald-600"
                   : "bg-gradient-to-br from-orange-400 to-amber-600"}`}>

          <div className="text-[100px] leading-none mb-4 animate-float">
            {passed ? "🏆" : "💪"}
          </div>
          <h2 className="text-4xl font-black text-white leading-tight">
            {passed ? "Level Cleared!" : "Keep Going!"}
          </h2>
          <p className="text-white/80 mt-3 text-lg">
            {passed ? "You're amazing! Moving up! 🚀" : "Every great reader practises more!"}
          </p>

          <div className="flex justify-center gap-3 my-6">
            {[1, 2, 3].map(i => (
              <span key={i}
                className={`text-5xl ${i <= stars ? "animate-star-burst" : "opacity-20"}`}
                style={{ animationDelay: `${(i - 1) * 0.2}s` }}>⭐</span>
            ))}
          </div>

          <div className="w-full bg-white/10 rounded-2xl p-4 text-white/80 text-sm">
            {stars === 3 ? "Outstanding! Above target on both speed and accuracy! 🌟"
             : stars === 2 ? "Well done! You met the reading standard! 🎯"
             : passed ? "You passed! Keep practising to improve your score! 📖"
             : "Good try! Aim for the targets below to level up! 💪"}
          </div>
        </div>

        {/* Right: stats + details (3/5) */}
        <div className="col-span-3 flex flex-col gap-5">

          {/* Big WPM + Accuracy numbers */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`rounded-3xl p-6 text-center border
              ${score.wpm >= score.targetWpm ? "bg-emerald-500/20 border-emerald-500/30" : "bg-amber-500/20 border-amber-500/30"}`}>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Words / Minute</p>
              <p className="text-6xl font-black text-white">{score.wpm}</p>
              <p className="text-white/50 text-sm mt-1">target: {score.targetWpm} WPM</p>
            </div>
            <div className={`rounded-3xl p-6 text-center border
              ${score.accuracy >= score.minAccuracy ? "bg-emerald-500/20 border-emerald-500/30" : "bg-amber-500/20 border-amber-500/30"}`}>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Accuracy</p>
              <p className="text-6xl font-black text-white">{score.accuracy}%</p>
              <p className="text-white/50 text-sm mt-1">target: {score.minAccuracy}%</p>
            </div>
          </div>

          {/* Progress bars showing how close to target */}
          <div className="bg-white/10 rounded-2xl p-5 border border-white/10 space-y-4">
            <p className="text-purple-300 font-bold text-sm uppercase tracking-widest">Your progress vs target</p>
            <ProgressBar value={score.wpm} target={score.targetWpm} unit=" WPM" label="Reading speed" />
            <ProgressBar value={score.accuracy} target={score.minAccuracy} unit="%" label="Accuracy" />
          </div>

          {/* Missed words */}
          {score.missedWords.length > 0 && (
            <div className="bg-white/10 rounded-2xl p-5 border border-white/10">
              <p className="text-purple-300 font-bold mb-3 text-sm">📝 Practice these words:</p>
              <div className="flex flex-wrap gap-2">
                {score.missedWords.slice(0, 15).map((w, i) => (
                  <span key={i}
                    className="bg-red-500/20 text-red-200 px-3 py-1.5 rounded-full border border-red-500/30 text-sm font-medium">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Coach Feedback */}
          {score.aiFeedback && (
            <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl p-5 border border-indigo-500/30">
              <p className="text-indigo-300 font-bold mb-2 text-sm">🧙 WizLingo Coach says:</p>
              <p className="text-white text-sm leading-relaxed">{score.aiFeedback}</p>
            </div>
          )}

          {/* New Badges */}
          {score.newBadges && score.newBadges.length > 0 && (
            <div className="bg-yellow-500/10 rounded-2xl p-4 border border-yellow-500/20">
              <p className="text-yellow-300 font-bold mb-3 text-sm">🏅 New Badge{score.newBadges.length > 1 ? "s" : ""} Earned!</p>
              <div className="flex flex-col gap-3">
                {score.newBadges.map((badge) => {
                  const BADGE_LABELS: Record<string, string> = {
                    SPARK: "Spark", WORD_WIZARD: "Word Wizard", VOICE_WIZARD: "Voice Wizard",
                    LANGUAGE_WIZARD: "Language Wizard", GRAND_WIZARD: "Grand Wizard",
                  };
                  const BADGE_EMOJI: Record<string, string> = {
                    SPARK: "✨", WORD_WIZARD: "📚", VOICE_WIZARD: "🎤",
                    LANGUAGE_WIZARD: "🧙", GRAND_WIZARD: "👑",
                  };
                  const label = BADGE_LABELS[badge] ?? badge;
                  const emoji = BADGE_EMOJI[badge] ?? "🏅";
                  return (
                    <div key={badge} className="flex items-center justify-between gap-3 bg-yellow-500/20 px-4 py-3 rounded-2xl border border-yellow-500/30">
                      <span className="text-yellow-100 font-bold text-base">{emoji} {label}</span>
                      <BadgeShareButton badge={badge} label={label} studentName={studentName} />
                    </div>
                  );
                })}
              </div>
              {score.certificateVerifyCode && (
                <a href={`/certificate/${score.certificateVerifyCode}`} target="_blank"
                  className="inline-block mt-3 text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-2 font-semibold">
                  🎓 View your Language Wizard Certificate →
                </a>
              )}
            </div>
          )}

          {/* Transcript */}
          {score.transcript && (
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <p className="text-purple-400 font-semibold mb-2 text-sm">🎤 What I heard:</p>
              <p className="text-purple-200 italic text-sm leading-relaxed line-clamp-3">
                {score.transcript}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Reading screen: two-column desktop layout ──
  return (
    <div className="grid grid-cols-5 gap-6 h-full">

      {/* Left: passage (3/5 width) */}
      <div className="col-span-3 bg-white rounded-3xl p-8 shadow-2xl flex flex-col">
        <div className="mb-6">
          <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest">
            Level {passage.level} · {passage.topic}
          </p>
          <h2 className="text-3xl font-black text-gray-800 mt-1">{passage.title}</h2>
        </div>

        <p className="text-2xl leading-[2.2] text-gray-700 font-medium select-none flex-1">
          {passage.content}
        </p>

        {phase === "recording" && (
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-indigo-400 font-semibold text-sm uppercase tracking-widest">
              Read the passage above out loud
            </p>
          </div>
        )}
      </div>

      {/* Right: controls (2/5 width) */}
      <div className="col-span-2 flex flex-col gap-5">

        {/* Timer + wave (recording state) */}
        {phase === "recording" && (
          <div className="bg-white/10 border border-white/20 rounded-3xl p-6 flex flex-col items-center gap-4">
            <CircularTimer timeLeft={timeLeft} totalTime={timeLimitSec} />
            <WaveAnimation size="lg" />
            <p className="text-purple-300 text-sm font-semibold uppercase tracking-widest">
              Listening…
            </p>
          </div>
        )}

        {/* Processing state */}
        {phase === "processing" && (
          <div className="bg-white/10 border border-white/20 rounded-3xl p-8 flex flex-col items-center gap-4">
            <div className="text-7xl animate-float">🔍</div>
            <p className="text-purple-200 font-bold text-xl">Scoring your reading…</p>
            <WaveAnimation size="md" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/40 text-red-300 rounded-2xl px-5 py-4 text-base">
            {error}
          </div>
        )}

        {/* Mic button */}
        {phase === "ready" && (
          <div className="flex flex-col items-center gap-5 bg-white/5 border border-white/10 rounded-3xl p-8">
            <p className="text-purple-300 text-lg font-semibold text-center">
              When you're ready, tap the mic and start reading!
            </p>
            <button onClick={startRecording}
              className="relative w-40 h-40 rounded-full shadow-2xl flex flex-col items-center justify-center transition-transform hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}>
              <span className="absolute inset-0 rounded-full animate-pulse-ring"
                style={{ background: "rgba(99,102,241,0.4)" }} />
              <span className="text-6xl">🎤</span>
              <span className="text-white text-sm font-black mt-2 uppercase tracking-wider">TAP TO READ</span>
            </button>
            <p className="text-purple-400 text-sm text-center">
              Chrome browser required for voice recognition
            </p>
          </div>
        )}

        {/* Stop button */}
        {phase === "recording" && (
          <button onClick={stopRecording}
            className="w-full flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 text-white font-black py-6 rounded-3xl shadow-lg transition-all active:scale-95 text-2xl">
            ⏹ Done Reading
          </button>
        )}

        {/* Live transcript */}
        {phase === "recording" && liveTranscript && (
          <div className="bg-white/10 rounded-2xl p-5 border border-purple-500/30 flex-1 overflow-y-auto">
            <p className="text-purple-400 text-xs font-semibold uppercase tracking-widest mb-2">
              🎤 Live transcript
            </p>
            <p className="text-purple-100 text-base leading-relaxed">{liveTranscript}</p>
          </div>
        )}

        {/* Tip card (ready state) */}
        {phase === "ready" && (
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5">
            <p className="text-indigo-300 font-bold mb-2">💡 Tips for best results:</p>
            <ul className="text-indigo-200 text-sm space-y-1 list-disc list-inside">
              <li>Read clearly and at a steady pace</li>
              <li>Speak loud enough for the microphone</li>
              <li>Read the full passage before stopping</li>
              <li>Use Google Chrome browser</li>
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}
