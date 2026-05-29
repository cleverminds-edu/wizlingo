"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ConversationSession from "@/components/ConversationSession";
import { CHARACTER_INFO } from "@/lib/speaking-topics";
import { TurnRecord, getSpeakingLevelConfig } from "@/lib/speaking-score";
import { GradeBand } from "@/app/generated/prisma/client";

interface TopicData {
  id: string;
  title: string;
  character: string;
  openingLine: string;
  level: number;
  gradeBand: string;
}

interface SessionResult {
  wpm: number;
  fluencyScore: number;
  totalWords: number;
  durationSec: number;
  passed: boolean;
  targetWpm: number;
  minFluency: number;
  leveledUp: boolean;
  newLevel: number;
  passedSessions: number;
  aiFeedback?: string;
  newBadges?: string[];
  certificateVerifyCode?: string | null;
}

const LEVEL_INFO = [
  { label: "Starter",  emoji: "🌱", color: "from-green-400 to-emerald-600" },
  { label: "Explorer", emoji: "🚀", color: "from-blue-400 to-indigo-600"   },
  { label: "Fluent",   emoji: "🏆", color: "from-yellow-400 to-orange-500" },
];

function Confetti() {
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    left: `${(i / 50) * 100}%`,
    delay: `${Math.random() * 0.8}s`,
    color: ["#f59e0b","#6366f1","#ec4899","#10b981","#f97316"][i % 5],
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {pieces.map((p, i) => (
        <div key={i} className="confetti-piece"
          style={{ left: p.left, top: "-10px", background: p.color, animationDelay: p.delay }} />
      ))}
    </div>
  );
}

function SessionPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const topicId = searchParams.get("topicId");

  const [topic, setTopic] = useState<TopicData | null>(null);
  const [phase, setPhase] = useState<"loading" | "conversation" | "saving" | "done" | "error">("loading");
  const [result, setResult] = useState<SessionResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!topicId || !sessionId) { setPhase("error"); setError("Missing session info."); return; }

    fetch(`/api/speaking/topics`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data: { topics: TopicData[] }) => {
        const t = data.topics.find((t: TopicData) => t.id === topicId);
        if (!t) throw new Error("Topic not found");
        setTopic(t);
        setPhase("conversation");
      })
      .catch(() => { setPhase("error"); setError("Could not load topic."); });
  }, [topicId, sessionId]);

  async function handleComplete({ turns, totalWords, durationSec }: { turns: TurnRecord[]; totalWords: number; durationSec: number }) {
    if (!sessionId) return;
    setPhase("saving");

    try {
      const res = await fetch(`/api/speaking/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ turns, totalWords, durationSec }),
      });
      if (!res.ok) throw new Error("Save failed");
      const r: SessionResult = await res.json();
      setResult(r);
      setPhase("done");
    } catch {
      setPhase("error");
      setError("Could not save your session. Please try again.");
    }
  }

  const char = topic ? (CHARACTER_INFO[topic.character] ?? { emoji: "🤖", from: "" }) : null;

  if (phase === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}>
        <div className="text-center">
          <div className="text-7xl animate-float mb-4">🎤</div>
          <p className="text-purple-200 font-bold text-xl">Getting ready…</p>
        </div>
      </div>
    );
  }

  if (phase === "saving") {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}>
        <div className="text-center">
          <div className="text-7xl animate-float mb-4">⏳</div>
          <p className="text-purple-200 font-bold text-xl">Saving your conversation…</p>
        </div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6"
        style={{ background: "linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}>
        <div className="text-7xl">😕</div>
        <p className="text-white font-bold text-xl">{error}</p>
        <button onClick={() => router.push("/student/speaking")}
          className="bg-purple-600 hover:bg-purple-500 text-white px-10 py-3 rounded-full font-bold">
          Back to Topics
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}>

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-white/10">
        <button onClick={() => router.push("/student/speaking")}
          className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors">
          <ArrowLeft size={22} />
          <span className="font-medium">Topics</span>
        </button>
        {topic && (
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
            <span>{char?.emoji}</span>
            <span className="text-white font-bold text-sm">{topic.title}</span>
          </div>
        )}
        <div className="w-24" />
      </header>

      <div className="flex-1 px-8 py-6 max-w-3xl w-full mx-auto">

        {/* Score card after done */}
        {phase === "done" && result && topic && (
          <div className="flex flex-col gap-6 animate-slide-up">
            {result.leveledUp && <Confetti />}

            {/* Result hero */}
            <div className={`rounded-3xl p-8 text-white relative overflow-hidden bg-gradient-to-br ${result.passed ? "from-green-500 to-emerald-700" : "from-slate-600 to-slate-800"} shadow-2xl`}>
              <div className="absolute -right-8 -top-8 text-[130px] leading-none opacity-10 select-none">
                {result.passed ? "🏆" : "💬"}
              </div>
              <div className="relative z-10">
                <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-2">
                  {topic.title}
                </p>
                <h2 className="text-4xl font-black mb-1">
                  {result.passed ? "Great conversation! 🎉" : "Good effort! Keep practising"}
                </h2>
                {result.leveledUp && (
                  <div className="mt-3 bg-yellow-400/20 border border-yellow-400/40 rounded-xl px-4 py-2 inline-block">
                    <span className="text-yellow-300 font-bold">
                      {LEVEL_INFO[result.newLevel - 1].emoji} Level Up! → {LEVEL_INFO[result.newLevel - 1].label}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "⚡", label: "Speaking Speed", value: `${Math.round(result.wpm)} WPM`, sub: `Target: ${result.targetWpm} WPM`, ok: result.wpm >= result.targetWpm * 0.85 },
                { icon: "🎯", label: "Fluency Score", value: `${result.fluencyScore}%`, sub: `Target: ${result.minFluency}%`, ok: result.fluencyScore >= result.minFluency },
                { icon: "📝", label: "Words Spoken", value: result.totalWords.toString(), sub: "total across all turns", ok: true },
                { icon: "⏱️", label: "Time Speaking", value: `${Math.round(result.durationSec)}s`, sub: "active speaking time", ok: true },
              ].map(({ icon, label, value, sub, ok }) => (
                <div key={label} className={`rounded-2xl p-5 text-center border ${ok ? "bg-white/10 border-white/10" : "bg-red-900/20 border-red-500/20"}`}>
                  <div className="text-3xl mb-2">{icon}</div>
                  <p className="text-white font-black text-2xl">{value}</p>
                  <p className="text-white/80 font-semibold text-sm mt-1">{label}</p>
                  <p className="text-purple-400 text-xs mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            {/* AI Coach Feedback */}
            {result.aiFeedback && (
              <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl p-5 border border-indigo-500/30">
                <p className="text-indigo-300 font-bold mb-2 text-sm">🧙 WizLingo Coach says:</p>
                <p className="text-white text-sm leading-relaxed">{result.aiFeedback}</p>
              </div>
            )}

            {/* New Badges */}
            {result.newBadges && result.newBadges.length > 0 && (
              <div className="bg-yellow-500/10 rounded-2xl p-4 border border-yellow-500/20">
                <p className="text-yellow-300 font-bold mb-3 text-sm">
                  🏅 New Badge{result.newBadges.length > 1 ? "s" : ""} Earned!
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.newBadges.map((badge) => (
                    <span key={badge}
                      className="bg-yellow-500/20 text-yellow-200 px-3 py-1.5 rounded-full border border-yellow-500/30 text-sm font-bold">
                      {{
                        SPARK: "✨ Spark",
                        WORD_WIZARD: "📚 Word Wizard",
                        VOICE_WIZARD: "🎤 Voice Wizard",
                        LANGUAGE_WIZARD: "🧙 Language Wizard",
                        GRAND_WIZARD: "👑 Grand Wizard",
                      }[badge] ?? badge}
                    </span>
                  ))}
                </div>
                {result.certificateVerifyCode && (
                  <a href={`/certificate/${result.certificateVerifyCode}`} target="_blank"
                    className="inline-block mt-3 text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-2 font-semibold">
                    🎓 View your Language Wizard Certificate →
                  </a>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <button onClick={() => router.push("/student/speaking")}
                className="flex-1 py-4 rounded-2xl font-bold text-white border border-white/20 bg-white/10 hover:bg-white/20 transition-all">
                Try Another Topic
              </button>
              <button onClick={() => router.push("/student/dashboard")}
                className="flex-1 py-4 rounded-2xl font-bold text-white transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}>
                🏠 Home
              </button>
            </div>
          </div>
        )}

        {/* Live conversation */}
        {phase === "conversation" && topic && sessionId && (() => {
          const cfg = getSpeakingLevelConfig(topic.gradeBand as GradeBand, topic.level);
          return (
            <ConversationSession
              sessionId={sessionId}
              character={topic.character}
              openingLine={topic.openingLine}
              topicTitle={topic.title}
              gradeBand={topic.gradeBand}
              maxTurns={cfg.turns}
              turnTimeSec={cfg.turnTimeSec}
              onComplete={handleComplete}
            />
          );
        })()}
      </div>
    </div>
  );
}

export default function SpeakingSessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}>
        <div className="text-7xl animate-float">🎤</div>
      </div>
    }>
      <SessionPageInner />
    </Suspense>
  );
}
