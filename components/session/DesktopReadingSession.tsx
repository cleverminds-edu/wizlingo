"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GradeBand } from "@/app/generated/prisma/enums";
import { shareBadge } from "@/lib/badge-image";

// ── Types ─────────────────────────────────────────────────────────────────────

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
  aiFeedback?: string; newBadges?: string[]; certificateVerifyCode?: string | null;
}
interface Props {
  passage: Passage; sessionId: string; timeLimitSec: number; studentName: string;
  onComplete: (score: ScoreResult) => void;
  onTryAgain: () => void;
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
  interface Window { SpeechRecognition: new () => SR; webkitSpeechRecognition: new () => SR; }
}

// ── Small pieces ──────────────────────────────────────────────────────────────

function WaveBar({ delay }: { delay: number }) {
  return (
    <div className="wave-bar rounded-full"
      style={{ width: 4, height: 32, animationDelay: `${delay}s`, background: "#818cf8" }} />
  );
}

function WaveAnimation() {
  const delays = [0, 0.09, 0.18, 0.09, 0, 0.14, 0.05, 0.12, 0.03, 0.14, 0.05];
  return (
    <div className="flex items-center gap-1">
      {delays.map((d, i) => <WaveBar key={i} delay={d} />)}
    </div>
  );
}

function CircularTimer({ timeLeft, totalTime }: { timeLeft: number; totalTime: number }) {
  const pct = timeLeft / totalTime;
  const r = 44; const circ = 2 * Math.PI * r;
  const color = pct > 0.5 ? "#22c55e" : pct > 0.25 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative flex items-center justify-center" style={{ width: 112, height: 112 }}>
      <svg style={{ transform: "rotate(-90deg)", position: "absolute" }} width={112} height={112}>
        <circle cx={56} cy={56} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={7} />
        <circle cx={56} cy={56} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s" }} />
      </svg>
      <div className="text-center z-10">
        <span className="text-white font-black text-2xl block leading-none">
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
        </span>
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>left</span>
      </div>
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    left: `${(i / 50) * 100}%`,
    delay: `${(Math.random() * 0.7).toFixed(2)}s`,
    color: ["#f59e0b","#6366f1","#ec4899","#10b981","#f97316","#3b82f6"][i % 6],
    size: `${7 + Math.random() * 8}px`,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {pieces.map((p, i) => (
        <div key={i} className="confetti-piece rounded"
          style={{ left: p.left, top: "-10px", background: p.color, width: p.size, height: p.size, animationDelay: p.delay }} />
      ))}
    </div>
  );
}

const BADGE_LABELS: Record<string, string> = {
  SPARK: "Spark", WORD_WIZARD: "Word Wizard", VOICE_WIZARD: "Voice Wizard",
  LANGUAGE_WIZARD: "Language Wizard", GRAND_WIZARD: "Grand Wizard",
};
const BADGE_EMOJI: Record<string, string> = {
  SPARK: "✨", WORD_WIZARD: "📚", VOICE_WIZARD: "🎤",
  LANGUAGE_WIZARD: "🧙", GRAND_WIZARD: "👑",
};

function BadgeShareButton({ badge, label, studentName }: { badge: string; label: string; studentName: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  async function go() {
    setState("busy");
    try { await shareBadge(badge, studentName, label); setState("done"); }
    catch { setState("idle"); }
    finally { setTimeout(() => setState("idle"), 3000); }
  }
  return (
    <button onClick={go} disabled={state === "busy"}
      className="flex items-center gap-2 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all active:scale-95 disabled:opacity-50"
      style={{ background: "#16a34a" }}>
      {state === "busy" ? "⏳" : state === "done" ? "✓ Done!" : (
        <>
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Share
        </>
      )}
    </button>
  );
}

// ── Result screen ─────────────────────────────────────────────────────────────

function ResultScreen({ score, passage, studentName, onTryAgain, onNext }: {
  score: ScoreResult; passage: Passage; studentName: string;
  onTryAgain: () => void; onNext: () => void;
}) {
  const wpmPct = score.wpm / score.targetWpm;
  const accMet = score.accuracy >= score.minAccuracy;
  const stars = (wpmPct >= 1.0 && score.accuracy >= score.minAccuracy + 5) ? 3
              : (wpmPct >= 0.9 && accMet) ? 2 : 1;

  function Bar({ value, target, unit, label }: { value: number; target: number; unit: string; label: string }) {
    const pct = Math.min((value / target) * 100, 100);
    const met = value >= target;
    return (
      <div>
        <div className="flex justify-between text-sm mb-1.5">
          <span style={{ color: "rgba(255,255,255,0.55)" }}>{label}</span>
          <span className="font-bold" style={{ color: met ? "#34d399" : "#fbbf24" }}>
            {value}{unit} / {target}{unit} {met ? "✓" : ""}
          </span>
        </div>
        <div className="rounded-full h-2.5" style={{ background: "rgba(255,255,255,0.07)" }}>
          <div className="h-2.5 rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: met ? "#10b981" : "#f59e0b" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Result header */}
      <div className="px-10 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-white font-bold text-lg">
          {score.passed ? "🎉 Session Complete" : "📖 Session Complete"}
        </p>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          {passage.title} · Level {passage.level}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-10 grid grid-cols-5 gap-8 min-h-full">
          {/* Left: hero score card */}
          <div className="col-span-2 flex flex-col gap-5">
            <div className="relative rounded-3xl p-8 flex flex-col items-center text-center overflow-hidden shadow-2xl"
              style={{ background: score.passed
                ? "linear-gradient(135deg, #059669, #047857)"
                : "linear-gradient(135deg, #d97706, #b45309)" }}>
              {score.passed && <Confetti />}
              <div className="relative z-10">
                <div className="text-[80px] leading-none mb-3" style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" }}>
                  {score.passed ? "🏆" : "💪"}
                </div>
                <h2 className="text-3xl font-black text-white">
                  {score.passed ? "Level Cleared!" : "Keep Going!"}
                </h2>
                <p className="mt-2 text-base" style={{ color: "rgba(255,255,255,0.75)" }}>
                  {score.passed ? "You nailed it — great reading!" : "Every session makes you better!"}
                </p>
                <div className="flex justify-center gap-3 my-5">
                  {[1, 2, 3].map(i => (
                    <span key={i} className={`text-4xl ${i <= stars ? "animate-star-burst" : "opacity-20"}`}
                      style={{ animationDelay: `${(i - 1) * 0.2}s` }}>⭐</span>
                  ))}
                </div>
                <p className="text-sm px-4" style={{ color: "rgba(255,255,255,0.7)" }}>
                  {stars === 3 ? "Outstanding! Above target on both metrics!"
                   : stars === 2 ? "Well done! You met the reading standard."
                   : score.passed ? "Passed! Keep practising to improve your score."
                   : "Good effort! Aim for the targets on the right."}
                </p>
              </div>
            </div>

            {/* Big stat pair */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Speed", value: score.wpm, unit: "WPM", target: score.targetWpm, met: score.wpm >= score.targetWpm },
                { label: "Accuracy", value: score.accuracy, unit: "%", target: score.minAccuracy, met: accMet },
              ].map(({ label, value, unit, met }) => (
                <div key={label} className="rounded-2xl p-5 text-center"
                  style={{ background: met ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                    border: `1px solid ${met ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.25)"}` }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1"
                    style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
                  <p className="text-4xl font-black text-white">{value}<span className="text-xl">{unit}</span></p>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button onClick={onTryAgain}
                className="flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}>
                🔄 Try Again
              </button>
              {score.passed && (
                <button onClick={onNext}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all hover:opacity-90 active:scale-95 text-white"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                  Next Session →
                </button>
              )}
            </div>
          </div>

          {/* Right: detailed analysis */}
          <div className="col-span-3 flex flex-col gap-5">

            {/* Progress vs target */}
            <div className="rounded-3xl p-6"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-5"
                style={{ color: "rgba(255,255,255,0.35)" }}>Progress vs Target</p>
              <div className="space-y-4">
                <Bar value={score.wpm} target={score.targetWpm} unit=" WPM" label="Reading Speed" />
                <Bar value={score.accuracy} target={score.minAccuracy} unit="%" label="Accuracy" />
              </div>
            </div>

            {/* AI Coach */}
            {score.aiFeedback && (
              <div className="rounded-3xl p-6"
                style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: "#818cf8" }}>🧙 WizLingo Coach</p>
                <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
                  {score.aiFeedback}
                </p>
              </div>
            )}

            {/* Badges earned */}
            {score.newBadges && score.newBadges.length > 0 && (
              <div className="rounded-3xl p-6"
                style={{ background: "rgba(234,179,8,0.07)", border: "1px solid rgba(234,179,8,0.18)" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4"
                  style={{ color: "#fbbf24" }}>
                  🏅 Badge{score.newBadges.length > 1 ? "s" : ""} Earned!
                </p>
                <div className="flex flex-col gap-3">
                  {score.newBadges.map(badge => (
                    <div key={badge} className="flex items-center justify-between rounded-2xl px-4 py-3"
                      style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.15)" }}>
                      <span className="text-white font-bold">
                        {BADGE_EMOJI[badge] ?? "🏅"} {BADGE_LABELS[badge] ?? badge}
                      </span>
                      <BadgeShareButton badge={badge} label={BADGE_LABELS[badge] ?? badge} studentName={studentName} />
                    </div>
                  ))}
                </div>
                {score.certificateVerifyCode && (
                  <a href={`/certificate/${score.certificateVerifyCode}`} target="_blank"
                    className="inline-block mt-4 text-sm font-semibold underline underline-offset-2"
                    style={{ color: "#34d399" }}>
                    🎓 View your Language Wizard Certificate →
                  </a>
                )}
              </div>
            )}

            {/* Missed words */}
            {score.missedWords.length > 0 && (
              <div className="rounded-3xl p-6"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4"
                  style={{ color: "rgba(255,255,255,0.35)" }}>📝 Words to Practise</p>
                <div className="flex flex-wrap gap-2">
                  {score.missedWords.slice(0, 18).map((w, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full text-sm font-medium"
                      style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}>
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Transcript */}
            {score.transcript && (
              <div className="rounded-3xl p-6"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: "rgba(255,255,255,0.35)" }}>🎤 What I Heard</p>
                <p className="text-sm leading-relaxed italic line-clamp-3"
                  style={{ color: "rgba(255,255,255,0.45)" }}>
                  {score.transcript}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DesktopReadingSession({ passage, sessionId, timeLimitSec, studentName, onComplete, onTryAgain }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("ready");
  const [timeLeft, setTimeLeft] = useState(timeLimitSec);
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [error, setError] = useState("");

  const recognitionRef = useRef<SR | null>(null);
  const transcriptRef  = useRef("");
  const accumulatedRef = useRef("");
  const startTimeRef   = useRef(0);
  const durationRef    = useRef(0);
  const timerRef       = useRef<ReturnType<typeof setInterval> | null>(null);
  const stoppedRef     = useRef(false);

  const submitTranscript = useCallback(async (transcript: string, durationSec: number) => {
    setPhase("processing");
    try {
      const res = await fetch("/api/assess", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setPhase("ready");
    }
  }, [sessionId, onComplete]);

  const stopRecording = useCallback(() => {
    if (stoppedRef.current) return;
    stoppedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    durationRef.current = Math.round((Date.now() - startTimeRef.current) / 1000);
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
    if (!SR) { setError("Please use Google Chrome for voice recognition."); return; }
    const rec = new SR();
    rec.continuous = true; rec.interimResults = true; rec.lang = "en-IN";
    recognitionRef.current = rec;
    rec.onresult = (event) => {
      let final = "", interim = "";
      for (let i = 0; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t + " "; else interim += t;
      }
      transcriptRef.current = accumulatedRef.current + final;
      setLiveTranscript(accumulatedRef.current + final + interim);
    };
    rec.onend = () => {
      if (stoppedRef.current) {
        submitTranscript(transcriptRef.current, durationRef.current);
      } else {
        accumulatedRef.current = transcriptRef.current;
        rec.start();
      }
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed") {
        setError("Microphone blocked — click the 🔒 in the address bar and allow microphone access.");
        setPhase("ready"); stoppedRef.current = true;
      }
    };
    rec.start();
    startTimeRef.current = Date.now();
    setPhase("recording");
  }

  const levelLabel = ["Beginner", "Explorer", "Champion"][passage.level - 1] ?? `Level ${passage.level}`;

  // ── Result layout (full width) ─────────────────────────────────────────────
  if (phase === "result" && score) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(160deg, #0f0c29 0%, #16103a 60%, #0f0c29 100%)" }}>
        <ResultScreen score={score} passage={passage} studentName={studentName}
          onTryAgain={onTryAgain} onNext={onTryAgain} />
      </div>
    );
  }

  // ── Session layout (split) ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(160deg, #0f0c29 0%, #16103a 60%, #0f0c29 100%)" }}>

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={() => router.push("/student/dashboard")}
          className="flex items-center gap-2 text-sm font-semibold transition-colors"
          style={{ color: "rgba(255,255,255,0.4)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)"; }}>
          <ArrowLeft size={16} /> Dashboard
        </button>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.25)" }}>
            {levelLabel}
          </span>
          <span className="text-white font-bold">{passage.title}</span>
          <span className="px-2.5 py-1 rounded-full text-xs"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
            {passage.topic}
          </span>
        </div>

        {/* Timer in header during recording */}
        {phase === "recording" ? (
          <CircularTimer timeLeft={timeLeft} totalTime={timeLimitSec} />
        ) : (
          <div style={{ width: 112 }} />
        )}
      </header>

      {/* Body: passage + control panel */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Left: Passage (60%) ── */}
        <div className="flex-[3] overflow-y-auto p-10">
          <div className="max-w-2xl mx-auto">
            {/* Passage card */}
            <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ background: "#ffffff" }}>
              {/* Card header strip */}
              <div className="px-10 pt-8 pb-5"
                style={{ borderBottom: "1px solid #f1f5f9" }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{ background: "#ede9fe", color: "#7c3aed" }}>
                    Level {passage.level}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ background: "#f0fdf4", color: "#16a34a" }}>
                    {passage.topic}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs"
                    style={{ background: "#f8fafc", color: "#94a3b8" }}>
                    {passage.wordCount} words
                  </span>
                </div>
                <h2 className="text-2xl font-black" style={{ color: "#0f172a" }}>
                  {passage.title}
                </h2>
              </div>
              {/* Passage body */}
              <div className="px-10 py-8">
                <p className="text-xl font-normal select-none"
                  style={{ color: "#1e293b", lineHeight: 2.1, letterSpacing: "0.01em" }}>
                  {passage.content}
                </p>
              </div>
            </div>

            {/* Instruction under passage */}
            {phase === "recording" && (
              <p className="text-center mt-6 text-sm font-semibold"
                style={{ color: "rgba(165,180,252,0.7)" }}>
                Read the passage above out loud clearly and steadily
              </p>
            )}
          </div>
        </div>

        {/* ── Right: Control panel (40%) ── */}
        <div className="flex-[2] flex flex-col p-8 gap-5 overflow-y-auto"
          style={{ borderLeft: "1px solid rgba(255,255,255,0.05)" }}>

          {/* Error */}
          {error && (
            <div className="rounded-2xl px-5 py-4 text-sm"
              style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}>
              {error}
            </div>
          )}

          {/* ── READY state ── */}
          {phase === "ready" && (
            <>
              <div className="flex-1 flex flex-col items-center justify-center gap-6 rounded-3xl py-10"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-center font-semibold px-6"
                  style={{ color: "rgba(255,255,255,0.6)" }}>
                  Read the passage on the left out loud.<br />Tap the mic when you're ready to begin.
                </p>
                <button onClick={startRecording}
                  className="relative flex flex-col items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95 shadow-2xl"
                  style={{ width: 160, height: 160, background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                  <span className="absolute inset-0 rounded-full animate-pulse-ring"
                    style={{ background: "rgba(99,102,241,0.35)" }} />
                  <span className="text-6xl relative z-10">🎤</span>
                  <span className="text-white text-xs font-black uppercase tracking-widest mt-2 relative z-10">
                    Tap to Start
                  </span>
                </button>
                <div className="text-center">
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                    {Math.floor(timeLimitSec / 60)}:{String(timeLimitSec % 60).padStart(2, "0")} time limit
                  </p>
                </div>
              </div>

              {/* Tips */}
              <div className="rounded-3xl p-6"
                style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.15)" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4"
                  style={{ color: "#818cf8" }}>💡 Tips for Best Results</p>
                <ul className="space-y-2.5">
                  {[
                    "Read clearly at a steady pace",
                    "Speak loud enough for the mic",
                    "Read the full passage before stopping",
                    "Use Google Chrome for best accuracy",
                  ].map(tip => (
                    <li key={tip} className="flex items-start gap-2.5 text-sm"
                      style={{ color: "rgba(255,255,255,0.5)" }}>
                      <span style={{ color: "#818cf8", marginTop: 2 }}>·</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* ── RECORDING state ── */}
          {phase === "recording" && (
            <>
              {/* Mic indicator card */}
              <div className="rounded-3xl p-6 flex flex-col items-center gap-4"
                style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: "#ef4444" }} />
                  <span className="text-sm font-bold" style={{ color: "#a5b4fc" }}>Recording</span>
                </div>
                <WaveAnimation />
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Keep reading — I'm listening…
                </p>
              </div>

              {/* Live transcript */}
              <div className="flex-1 rounded-3xl p-5 overflow-y-auto min-h-0"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: "rgba(255,255,255,0.25)" }}>Live Transcript</p>
                {liveTranscript ? (
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {liveTranscript}
                  </p>
                ) : (
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.2)" }}>
                    Start speaking — your words will appear here…
                  </p>
                )}
              </div>

              {/* Stop button */}
              <button onClick={stopRecording}
                className="w-full flex items-center justify-center gap-3 font-black py-5 rounded-3xl text-xl text-white transition-all active:scale-95 hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
                ⏹ Done Reading
              </button>
            </>
          )}

          {/* ── PROCESSING state ── */}
          {phase === "processing" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 rounded-3xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="text-7xl" style={{ animation: "float 2s ease-in-out infinite" }}>🔍</div>
              <p className="text-white font-bold text-xl">Scoring your reading…</p>
              <WaveAnimation />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
