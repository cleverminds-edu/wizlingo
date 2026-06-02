"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ReadingSession from "@/components/ReadingSession";
import DesktopReadingSession from "@/components/session/DesktopReadingSession";
import { useIsMobile } from "@/hooks/useIsMobile";
import { GradeBand } from "@/app/generated/prisma/enums";

interface Passage {
  id: string; title: string; content: string;
  wordCount: number; level: number; topic: string; gradeBand: GradeBand;
}

interface ScoreResult {
  wpm: number; accuracy: number; passed: boolean;
  missedWords: string[]; wrongWords: { original: string; spoken: string }[];
  transcript: string; targetWpm: number; minAccuracy: number;
  leveledUp: boolean; newLevel: number; passedSessions: number;
}

const TIME_LIMITS: Record<string, Record<number, number>> = {
  BAND_1_2:  { 1: 90,  2: 90,  3: 120 },
  BAND_3_5:  { 1: 120, 2: 120, 3: 120 },
  BAND_6_8:  { 1: 120, 2: 120, 3: 120 },
  BAND_9_10: { 1: 120, 2: 120, 3: 120 },
};

const LEVEL_INFO = [
  { label: "Beginner",  emoji: "🌱", color: "from-green-400 to-emerald-600"  },
  { label: "Explorer",  emoji: "🚀", color: "from-blue-400 to-indigo-600"    },
  { label: "Champion",  emoji: "🏆", color: "from-yellow-400 to-orange-500"  },
];

function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    left: `${(i / 60) * 100}%`,
    delay: `${Math.random() * 0.8}s`,
    color: ["#f59e0b","#6366f1","#ec4899","#10b981","#f97316","#3b82f6","#a855f7"][i % 7],
    size: `${6 + Math.random() * 10}px`,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {pieces.map((p, i) => (
        <div key={i} className="confetti-piece rounded"
          style={{ left: p.left, top: "-10px", background: p.color,
            width: p.size, height: p.size, animationDelay: p.delay }} />
      ))}
    </div>
  );
}

function LevelUpOverlay({ newLevel, onContinue }: { newLevel: number; onContinue: () => void }) {
  const info = LEVEL_INFO[newLevel - 1];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)" }}>
      <Confetti />

      <div className={`relative rounded-3xl p-14 text-center animate-pop-in bg-gradient-to-br ${info.color} shadow-2xl max-w-lg w-full mx-6`}>

        {/* Burst ring */}
        <div className="absolute inset-0 rounded-3xl animate-pulse-ring opacity-40 pointer-events-none"
          style={{ background: "rgba(255,255,255,0.3)" }} />

        <div className="text-[110px] leading-none mb-2 animate-float">{info.emoji}</div>

        <p className="text-white/80 text-xl font-bold uppercase tracking-widest mb-1">
          Level Up!
        </p>
        <h2 className="text-6xl font-black text-white mb-2">Level {newLevel}</h2>
        <p className="text-3xl font-bold text-white/90 mb-6">{info.label}</p>

        <div className="flex justify-center gap-3 mb-8">
          {[1, 2, 3].map(i => (
            <span key={i}
              className={`text-4xl ${i <= newLevel ? "animate-star-burst" : "opacity-20"}`}
              style={{ animationDelay: `${(i - 1) * 0.2}s` }}>⭐</span>
          ))}
        </div>

        <p className="text-white/80 text-lg mb-8">
          {newLevel === 2
            ? "You've mastered the basics! Explorer level unlocked! 🚀"
            : "Outstanding! You're a Reading Champion! 🏆"}
        </p>

        <button onClick={onContinue}
          className="bg-white text-gray-800 font-black text-xl px-12 py-4 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-transform">
          See My Score →
        </button>
      </div>
    </div>
  );
}

export default function SessionPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [passage, setPassage] = useState<Passage | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("");
  const [phase, setPhase] = useState<"loading" | "reading" | "done" | "error">("loading");
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [error, setError] = useState("");
  const [showLevelUp, setShowLevelUp] = useState(false);

  async function loadSession() {
    setPhase("loading"); setError(""); setScore(null); setShowLevelUp(false);
    try {
      const [passageRes, meRes] = await Promise.all([
        fetch("/api/passages", { credentials: "include" }),
        fetch("/api/auth/me", { credentials: "include" }),
      ]);
      if (!passageRes.ok) throw new Error("No passage available");
      const p: Passage = await passageRes.json();
      if (meRes.ok) {
        const me = await meRes.json();
        setStudentName(me.name ?? "");
      }

      const sessionRes = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ passageId: p.id }),
      });
      if (!sessionRes.ok) throw new Error("Could not start session");
      const s = await sessionRes.json();

      setPassage(p); setSessionId(s.id); setPhase("reading");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load session");
      setPhase("error");
    }
  }

  useEffect(() => { loadSession(); }, []);

  function handleComplete(result: ScoreResult) {
    setScore(result);
    setPhase("done");
    if (result.leveledUp) {
      // Brief delay so result screen renders first, then overlay pops in
      setTimeout(() => setShowLevelUp(true), 400);
    }
  }

  const timeLimitSec = passage ? (TIME_LIMITS[passage.gradeBand]?.[passage.level] ?? 120) : 120;

  if (phase === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6"
        style={{ background: "linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}>
        <div className="text-9xl animate-float">📖</div>
        <p className="text-purple-200 font-bold text-2xl">Picking a story for you…</p>
        <div className="flex gap-3 mt-2">
          {[0,1,2].map(i => (
            <div key={i} className="w-3 h-3 rounded-full bg-purple-400 wave-bar"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6"
        style={{ background: "linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}>
        <div className="text-8xl">😕</div>
        <p className="text-white font-bold text-2xl">{error}</p>
        <button onClick={loadSession}
          className="bg-purple-500 hover:bg-purple-600 text-white px-12 py-4 rounded-full font-bold text-lg transition-colors">
          Try Again
        </button>
      </div>
    );
  }

  // ── Desktop: full-page session component handles its own layout ──────────────
  if (!isMobile && passage && sessionId) {
    return (
      <>
        {showLevelUp && score && (
          <LevelUpOverlay newLevel={score.newLevel} onContinue={() => setShowLevelUp(false)} />
        )}
        <DesktopReadingSession
          passage={passage}
          sessionId={sessionId}
          timeLimitSec={timeLimitSec}
          studentName={studentName}
          onComplete={handleComplete}
          onTryAgain={loadSession}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}>

      {/* Level-up overlay */}
      {showLevelUp && score && (
        <LevelUpOverlay
          newLevel={score.newLevel}
          onContinue={() => setShowLevelUp(false)}
        />
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-white/10">
        <button onClick={() => router.push("/student/dashboard")}
          className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors">
          <ArrowLeft size={22} />
          <span className="font-medium text-lg">Dashboard</span>
        </button>
        {passage && (
          <div className="flex items-center gap-3 bg-white/10 px-5 py-2 rounded-full border border-white/20">
            <span className="text-yellow-400 text-xl">⭐</span>
            <span className="text-white font-bold text-lg">
              Level {passage.level} · {passage.topic}
            </span>
          </div>
        )}
        <div className="w-32" />
      </header>

      {/* Session area */}
      <div className="flex-1 px-8 py-6 max-w-7xl w-full mx-auto">
        {passage && sessionId && (
          <ReadingSession
            passage={passage}
            sessionId={sessionId}
            studentName={studentName}
            timeLimitSec={timeLimitSec}
            onComplete={handleComplete}
          />
        )}

        {/* Action buttons after result */}
        {phase === "done" && score && !showLevelUp && (
          <div className="mt-8 flex gap-4 max-w-xl mx-auto">
            {!score.passed && (
              <button onClick={loadSession}
                className="flex-1 flex items-center justify-center gap-3 bg-white/10 border border-white/20 text-white font-bold py-5 rounded-2xl hover:bg-white/20 transition-all text-lg">
                🔄 Try Again
              </button>
            )}
            <button onClick={() => router.push("/student/dashboard")}
              className="flex-1 flex items-center justify-center gap-3 text-white font-bold py-5 rounded-2xl transition-all text-lg hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              🏠 {score.passed ? "Back to Home 🎉" : "Home"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
