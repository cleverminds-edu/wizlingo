"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogOut } from "lucide-react";
import Image from "next/image";
import { useIsMobile } from "@/hooks/useIsMobile";
import { BadgeCelebration } from "@/components/badges/BadgeCelebration";
import { BadgeType } from "@/app/generated/prisma/client";
import DesktopDashboard from "@/components/dashboard/DesktopDashboard";

interface StudentData {
  id: string;
  name: string;
  class: { grade: number; section: string };
  progress: {
    currentLevel: number;
    avgWpm: number;
    avgAccuracy: number;
    totalSessions: number;
    passedSessions: number;
    gradeBand: string;
  } | null;
  sessions: {
    id: string;
    wpm: number | null;
    accuracy: number | null;
    status: string;
    createdAt: string;
    passage: { title: string; level: number };
  }[];
  badges: { type: string; earnedAt: string }[];
  certificates: { badgeType: string; verifyCode: string; issuedAt: string }[];
}

const BADGE_META: Record<string, { emoji: string; label: string; color: string }> = {
  SPARK:           { emoji: "✨", label: "Spark",           color: "from-yellow-400 to-orange-400" },
  WORD_WIZARD:     { emoji: "📚", label: "Word Wizard",     color: "from-blue-400 to-indigo-500"   },
  VOICE_WIZARD:    { emoji: "🎤", label: "Voice Wizard",    color: "from-purple-400 to-pink-500"   },
  LANGUAGE_WIZARD: { emoji: "🧙", label: "Language Wizard", color: "from-emerald-400 to-teal-500"  },
  GRAND_WIZARD:    { emoji: "👑", label: "Grand Wizard",    color: "from-amber-400 to-yellow-500"  },
};

const LEVEL_INFO = [
  { label: "Beginner",  emoji: "🌱", color: "from-green-400 to-emerald-600"  },
  { label: "Explorer",  emoji: "🚀", color: "from-blue-400 to-indigo-600"    },
  { label: "Champion",  emoji: "🏆", color: "from-yellow-400 to-orange-500"  },
];

const BAND_LABELS: Record<string, string> = {
  BAND_1_2: "Grade 1–2", BAND_3_5: "Grade 3–5",
  BAND_6_8: "Grade 6–8", BAND_9_10: "Grade 9–10",
};

const TOPIC_EMOJI: Record<string, string> = {
  Animals: "🐾", Play: "⚽", Weather: "🌦", "Daily Life": "🏠",
  Stories: "📖", Nature: "🌿", Festivals: "🎉", Science: "🔬",
  History: "🏛", Environment: "🌍", Technology: "💻", Philosophy: "🤔",
};

function Stars({ count, size = "lg" }: { count: number; size?: "sm" | "lg" }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map(i => (
        <span key={i} className={`${size === "lg" ? "text-2xl" : "text-base"} ${i <= count ? "animate-star-burst" : "opacity-20"}`}>⭐</span>
      ))}
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    left: `${(i / 40) * 100}%`,
    delay: `${Math.random() * 0.8}s`,
    color: ["#f59e0b", "#6366f1", "#ec4899", "#10b981", "#f97316"][i % 5],
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

export default function StudentDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [earnedBadge, setEarnedBadge] = useState<BadgeType | null>(null);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(me => fetch(`/api/progress/${me.id}`, { credentials: "include" }))
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setStudent(data); setTimeout(() => setShowWelcome(false), 2500); })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  // Listen for badge earned from URL params
  useEffect(() => {
    const badgeParam = searchParams.get('badgeEarned');
    if (badgeParam && ['SPARK', 'WORD_WIZARD', 'VOICE_WIZARD', 'LANGUAGE_WIZARD', 'GRAND_WIZARD'].includes(badgeParam)) {
      setEarnedBadge(badgeParam as BadgeType);
    }
  }, [searchParams]);

  const handleBadgeCelebrationClose = () => {
    setEarnedBadge(null);
    // Clear the URL param
    window.history.replaceState({}, '', '/student/dashboard');
  };

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6"
        style={{ background: "linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}>
        <div className="text-8xl animate-float">📚</div>
        <p className="text-white font-bold text-2xl">Loading your adventure…</p>
        <div className="flex gap-3 mt-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-3 h-3 rounded-full bg-purple-400 wave-bar"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!student) return null;

  if (!isMobile) {
    return (
      <>
        <DesktopDashboard student={student} onLogout={logout} />
        {earnedBadge && (
          <BadgeCelebration
            badgeType={earnedBadge}
            studentName={student.name}
            isVisible={!!earnedBadge}
            onClose={handleBadgeCelebrationClose}
          />
        )}
      </>
    );
  }

  const level = student.progress?.currentLevel ?? 1;
  const totalSessions = student.progress?.totalSessions ?? 0;
  const passedSessions = student.progress?.passedSessions ?? 0;
  const levelInfo = LEVEL_INFO[level - 1];
  const firstName = student.name.split(" ")[0];
  const PASSES_TO_LEVEL_UP = 3;

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}>

      {/* Badge Celebration Modal */}
      {earnedBadge && (
        <BadgeCelebration
          badgeType={earnedBadge}
          studentName={student.name}
          isVisible={!!earnedBadge}
          onClose={handleBadgeCelebrationClose}
        />
      )}

      {/* Welcome splash */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
          <Confetti />
          <div className="text-center animate-pop-in">
            <div className="text-[120px] leading-none mb-6">{levelInfo.emoji}</div>
            <h1 className="text-6xl font-black text-white">Hi, {firstName}! 👋</h1>
            <p className="text-purple-200 text-2xl mt-3">Ready for your reading adventure?</p>
            <div className="flex justify-center gap-3 mt-6">
              {[1, 2, 3].map(i => (
                <span key={i} className="text-4xl animate-star-burst"
                  style={{ animationDelay: `${i * 0.2}s` }}>⭐</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 border-b border-white/10">
        <Image src="/wiziingo-logo.svg" alt="WizLingo" width={148} height={38}
          />
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
          <span className="text-yellow-400 text-lg">⭐</span>
          <span className="text-white font-bold">Level {level} {levelInfo.label}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-white font-bold">{student.name}</p>
            <p className="text-purple-300 text-sm">Grade {student.class.grade}-{student.class.section}</p>
          </div>
          <button onClick={logout}
            className="text-purple-300 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-8 py-6 max-w-7xl w-full mx-auto">
        <div className="grid grid-cols-3 gap-6 h-full">

          {/* Left column: hero + CTA */}
          <div className="col-span-2 flex flex-col gap-6">

            {/* Hero card */}
            <div className={`relative rounded-3xl p-8 text-white overflow-hidden bg-gradient-to-br ${levelInfo.color} shadow-2xl animate-slide-up`}>
              <div className="absolute -right-10 -top-10 text-[180px] leading-none opacity-15 animate-float select-none">
                {levelInfo.emoji}
              </div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-1">
                    {BAND_LABELS[student.progress?.gradeBand ?? "BAND_3_5"]} · WizLingo
                  </p>
                  <div className="flex items-end gap-4">
                    <span className="text-9xl font-black leading-none">{level}</span>
                    <div className="mb-3">
                      <p className="text-4xl font-bold">{levelInfo.label}</p>
                      <Stars count={level} size="lg" />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/70 text-sm mb-2">
                    {level < 3 ? `Progress to Level ${level + 1}` : "Max Level Reached! 🏆"}
                  </p>
                  <div className="bg-white/20 rounded-full h-4 w-56">
                    <div className="bg-white rounded-full h-4 transition-all duration-700"
                      style={{ width: `${Math.min(passedSessions / PASSES_TO_LEVEL_UP * 100, 100)}%` }} />
                  </div>
                  <p className="text-white/60 text-sm mt-1">
                    {level < 3 ? `${passedSessions}/${PASSES_TO_LEVEL_UP} passes to level up` : "Champion! 🌟"}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              {[
                { icon: "🔥", value: totalSessions, label: "Total Sessions", sub: "completed" },
                { icon: "⚡", value: student.progress?.avgWpm ? Math.round(student.progress.avgWpm) : "--", label: "Avg WPM", sub: "words per minute" },
                { icon: "🎯", value: student.progress?.avgAccuracy ? `${Math.round(student.progress.avgAccuracy)}%` : "--", label: "Accuracy", sub: "reading score" },
              ].map(({ icon, value, label, sub }) => (
                <div key={label}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10 hover:bg-white/15 transition-colors">
                  <div className="text-4xl mb-2">{icon}</div>
                  <p className="text-white font-black text-4xl">{value}</p>
                  <p className="text-white/80 font-semibold mt-1">{label}</p>
                  <p className="text-purple-400 text-sm">{sub}</p>
                </div>
              ))}
            </div>

            {/* Wizard Badges */}
            {student.badges.length > 0 && (
              <div className="animate-slide-up bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10" style={{ animationDelay: "0.15s" }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-purple-300 text-xs font-bold uppercase tracking-widest">🧙 Wizard Badges</p>
                  {student.certificates.length > 0 && (
                    <a
                      href={`/certificate/${student.certificates[0].verifyCode}`}
                      target="_blank"
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2"
                    >
                      View Certificate →
                    </a>
                  )}
                </div>
                <div className="flex gap-3 flex-wrap">
                  {student.badges.map((badge) => {
                    const meta = BADGE_META[badge.type];
                    if (!meta) return null;
                    return (
                      <div key={badge.type}
                        className={`flex items-center gap-2 bg-gradient-to-r ${meta.color} px-3 py-2 rounded-xl shadow-md`}>
                        <span className="text-xl">{meta.emoji}</span>
                        <span className="text-white font-bold text-sm">{meta.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Module CTAs */}
            <div className="animate-slide-up grid grid-cols-2 gap-4" style={{ animationDelay: "0.2s" }}>
              <div className="flex flex-col gap-2">
                <button onClick={() => router.push("/student/session")}
                  className="relative w-full py-6 rounded-3xl font-black text-2xl text-white shadow-2xl overflow-hidden transition-transform hover:scale-[1.02] active:scale-95"
                  style={{ background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)" }}>
                  <span className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity" />
                  <span className="relative flex items-center justify-center gap-3">
                    <span className="text-4xl animate-wiggle">📖</span>
                    Read!
                  </span>
                </button>
                <p className="text-center text-purple-400 text-sm">Read aloud &amp; earn stars ⭐</p>
              </div>

              <div className="flex flex-col gap-2">
                <button onClick={() => router.push("/student/speaking")}
                  className="relative w-full py-6 rounded-3xl font-black text-2xl text-white shadow-2xl overflow-hidden transition-transform hover:scale-[1.02] active:scale-95"
                  style={{ background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" }}>
                  <span className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity" />
                  <span className="relative flex items-center justify-center gap-3">
                    <span className="text-4xl animate-wiggle" style={{ animationDelay: "0.2s" }}>🎤</span>
                    Speak!
                  </span>
                </button>
                <p className="text-center text-purple-400 text-sm">Chat with a friend 💬</p>
              </div>
            </div>
          </div>

          {/* Right column: recent sessions */}
          <div className="flex flex-col gap-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <h3 className="text-purple-300 text-sm font-bold uppercase tracking-widest px-1">
              Recent Adventures
            </h3>

            {student.sessions.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10 bg-white/5 rounded-3xl border border-white/10">
                <div className="text-6xl mb-4 animate-float">🌟</div>
                <p className="text-purple-200 font-semibold text-lg">No adventures yet!</p>
                <p className="text-purple-400 mt-1">Start your first reading session.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {student.sessions.slice(0, 8).map((s, idx) => {
                  const stars = !s.wpm ? 0 : s.accuracy! >= 90 ? 3 : s.accuracy! >= 80 ? 2 : 1;
                  return (
                    <div key={s.id}
                      className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-4 flex items-center justify-between hover:bg-white/15 transition-colors"
                      style={{ animationDelay: `${idx * 0.05}s` }}>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{TOPIC_EMOJI[s.passage?.title] ?? "📖"}</span>
                        <div>
                          <p className="text-white font-semibold">{s.passage.title}</p>
                          <p className="text-purple-400 text-sm">Level {s.passage.level}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {s.wpm ? (
                          <>
                            <Stars count={stars} size="sm" />
                            <p className="text-purple-300 text-sm mt-0.5">{Math.round(s.wpm)} WPM</p>
                          </>
                        ) : (
                          <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full">
                            Review
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
