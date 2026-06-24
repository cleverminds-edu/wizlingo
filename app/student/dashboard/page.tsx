"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogOut, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useIsMobile } from "@/hooks/useIsMobile";
import { BadgeCelebration } from "@/components/badges/BadgeCelebration";
import OnboardingCarousel from "@/components/OnboardingCarousel";
import { BadgeType } from "@/app/generated/prisma/client";
import DesktopDashboard from "@/components/dashboard/DesktopDashboard";

interface StudentData {
  id: string;
  name: string;
  class: { grade: number; section: string; school: { name: string } } | null;
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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState<BadgeType | null>(null);
  const [showRecentSessions, setShowRecentSessions] = useState(false);
  const [showOnboardingTour, setShowOnboardingTour] = useState(false);

  useEffect(() => {
    // Get auth headers - try localStorage token first, fall back to cookie-based auth
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    fetch("/api/auth/me", { headers, credentials: 'include' })
      .then(r => {
        if (!r.ok) {
          console.error('auth/me failed:', r.status, r.statusText);
          return Promise.reject(new Error(`auth/me: ${r.status}`));
        }
        return r.json();
      })
      .then(me => {
        console.log('auth/me response:', me);
        if (!me.hasSeenOnboarding) {
          setShowOnboarding(true);
        }
        return fetch(`/api/progress/${me.id}`, { headers, credentials: 'include' });
      })
      .then(async r => {
        if (!r.ok) {
          const errBody = await r.json().catch(() => ({}));
          console.error('progress failed:', r.status, errBody);
          return Promise.reject(new Error(`progress: ${r.status}`));
        }
        return r.json();
      })
      .then(data => {
        console.log('progress response:', data);
        setStudent(data);
        setTimeout(() => setShowWelcome(false), 2500);
        // Show onboarding tour on first visit
        if (!localStorage.getItem('dashboardOnboardingSeen')) {
          setTimeout(() => setShowOnboardingTour(true), 3000);
          localStorage.setItem('dashboardOnboardingSeen', 'true');
        }
      })
      .catch((err) => {
        console.error('Dashboard auth failed:', err);
        localStorage.removeItem("token");
        // Redirect to appropriate login based on auth method used
        const loginPage = token ? "/auth/login-password" : "/login";
        router.push(loginPage);
      })
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

  const handleOnboardingComplete = async () => {
    if (student) {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch("/api/onboarding/complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          credentials: "include",
          body: JSON.stringify({ studentId: student.id }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error(`Onboarding complete failed: ${response.status}`, error);
          return;
        }

        console.log('✅ Onboarding marked complete');
        setShowOnboarding(false);
      } catch (error) {
        console.error('Onboarding complete error:', error);
      }
    }
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
        {showOnboarding && student && (
          <OnboardingCarousel
            studentName={student.name}
            onComplete={handleOnboardingComplete}
          />
        )}
        <DesktopDashboard student={student} onLogout={logout} />
        {earnedBadge && (
          <BadgeCelebration
            badgeType={earnedBadge}
            studentName={student.name}
            studentId={student.id}
            schoolName={student.class?.school.name}
            grade={student.class?.grade}
            section={student.class?.section}
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

      {/* Onboarding Carousel */}
      {showOnboarding && student && (
        <OnboardingCarousel
          studentName={student.name}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* Badge Celebration Modal */}
      {earnedBadge && (
        <BadgeCelebration
          badgeType={earnedBadge}
          studentName={student.name}
          studentId={student.id}
          schoolName={student.class?.school.name}
          grade={student.class?.grade}
          section={student.class?.section}
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
      <main className="flex-1 px-6 py-6 max-w-6xl w-full mx-auto">

        {/* Hero Welcome Section */}
        <div className="mb-6 animate-slide-up">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-white mb-1">
                Hey {firstName}! 👋
              </h1>
              <p className="text-purple-300 text-sm font-semibold">
                {level < 3 ? `You're a ${levelInfo.label}! Keep going! 🚀` : "You're a Champion! Keep it up! 🏆"}
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl p-4 text-center shadow-lg min-w-max">
              <div className="text-xs text-white/80 font-bold uppercase mb-0.5">Streak</div>
              <div className="text-3xl font-black text-white">🔥 {totalSessions}</div>
              <div className="text-xs text-white/90 font-semibold mt-0.5">sessions</div>
            </div>
          </div>
        </div>

        {/* Compact Level Progress Card */}
        <div className={`bg-gradient-to-br ${levelInfo.color} rounded-2xl p-4 mb-6 text-white shadow-lg animate-slide-up`} style={{ animationDelay: "0.05s" }}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-white/80 text-xs font-bold uppercase mb-2">Progress to Next Level</p>
              <div className="bg-white/20 rounded-full h-3 flex-1">
                <div className="bg-white rounded-full h-3 transition-all duration-700"
                  style={{ width: `${Math.min(passedSessions / PASSES_TO_LEVEL_UP * 100, 100)}%` }} />
              </div>
              <p className="text-white/90 text-xs font-semibold mt-2">
                {level < 3 ? `${passedSessions}/${PASSES_TO_LEVEL_UP} passes` : "🌟 Max Level!"}
              </p>
            </div>
            <div className="text-5xl opacity-30">{levelInfo.emoji}</div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-3 gap-2 mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-lg">{levelInfo.emoji}</span>
              <span className="text-white/70 text-xs font-bold">Level</span>
            </div>
            <div className="text-2xl font-black text-white">{level}</div>
            <div className="text-xs text-purple-400">{levelInfo.label}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-lg">⚡</span>
              <span className="text-white/70 text-xs font-bold">WPM</span>
            </div>
            <div className="text-2xl font-black text-white">{student.progress?.avgWpm ? Math.round(student.progress.avgWpm) : "--"}</div>
            <div className="text-xs text-purple-400">avg</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-lg">🎯</span>
              <span className="text-white/70 text-xs font-bold">Acc</span>
            </div>
            <div className="text-2xl font-black text-white">{student.progress?.avgAccuracy ? Math.round(student.progress.avgAccuracy) : "--"}%</div>
            <div className="text-xs text-purple-400">avg</div>
          </div>
        </div>

        {/* Compact Read & Speak CTA */}
        <div className="grid grid-cols-2 gap-3 mb-6 animate-slide-up" style={{ animationDelay: "0.15s" }}>
          <button onClick={() => router.push("/student/session")}
            className="relative group rounded-2xl overflow-hidden shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-95 py-4 px-4"
            style={{ background: "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)" }}>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="text-center text-white relative z-10">
              <div className="text-4xl mb-2 animate-bounce">📖</div>
              <h2 className="text-xl font-black">Read</h2>
              <p className="text-xs font-semibold text-white/90 mt-1">New passages</p>
            </div>
          </button>

          <button onClick={() => router.push("/student/speaking")}
            className="relative group rounded-2xl overflow-hidden shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-95 py-4 px-4"
            style={{ background: "linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)" }}>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="text-center text-white relative z-10">
              <div className="text-4xl mb-2 animate-bounce" style={{ animationDelay: "0.2s" }}>🎤</div>
              <h2 className="text-xl font-black">Speak</h2>
              <p className="text-xs font-semibold text-white/90 mt-1">Chat & practice</p>
            </div>
          </button>
        </div>

        {/* Compact Achievements Section */}
        <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
          {/* Badges - Premium Display */}
          {student.badges.length > 0 && (
            <div className="mb-6">
              <h3 className="text-purple-300 text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="text-lg">🏆</span> Your Badges
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {student.badges.map((badge) => {
                  const meta = BADGE_META[badge.type];
                  if (!meta) return null;
                  return (
                    <div key={badge.type}
                      className={`bg-gradient-to-br ${meta.color} rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all hover:scale-105 border border-white/20 relative overflow-hidden`}
                      title={meta.label}>
                      {/* Shield background effect */}
                      <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-10 transition-opacity" />
                      <div className="relative z-10 text-center">
                        <div className="text-4xl mb-2">{meta.emoji}</div>
                        <p className="text-white font-black text-xs uppercase tracking-wider">{meta.label}</p>
                        <p className="text-white/80 text-xs mt-1">Unlocked! 🌟</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {student.certificates.length > 0 && (
                <a
                  href={`/certificate/${student.certificates[0].verifyCode}`}
                  target="_blank"
                  className="mt-3 inline-flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-lg px-4 py-2 text-emerald-300 text-xs font-bold transition-colors"
                >
                  <span>📜</span> View Certificate
                </a>
              )}
            </div>
          )}

          {/* Next Badge Progress */}
          {(() => {
            const earnedBadgeTypes = student.badges.map(b => b.type);
            const allBadgeTypes = ['SPARK', 'WORD_WIZARD', 'VOICE_WIZARD', 'LANGUAGE_WIZARD', 'GRAND_WIZARD'];
            const nextBadge = allBadgeTypes.find(t => !earnedBadgeTypes.includes(t));

            if (nextBadge) {
              const badgeLabels: Record<string, string> = {
                'SPARK': 'Spark Badge',
                'WORD_WIZARD': 'Word Wizard Badge',
                'VOICE_WIZARD': 'Voice Wizard Badge',
                'LANGUAGE_WIZARD': 'Language Wizard Badge',
                'GRAND_WIZARD': 'Grand Wizard Badge'
              };

              const sessionsNeeded = nextBadge === 'SPARK' ? 3 : nextBadge === 'WORD_WIZARD' ? 10 : 15;
              const sessionsCompleted = student.progress?.totalSessions ?? 0;
              const progress = Math.min(sessionsCompleted, sessionsNeeded);
              const progressPercent = (progress / sessionsNeeded) * 100;

              return (
                <div className="mb-6 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-400/30 rounded-xl p-4">
                  <p className="text-amber-300 text-xs font-black uppercase tracking-widest mb-2">🎯 Next Milestone</p>
                  <p className="text-white font-bold text-sm mb-3">{badgeLabels[nextBadge]}</p>
                  <div className="bg-white/10 rounded-full h-2 mb-2">
                    <div className="bg-gradient-to-r from-amber-400 to-orange-400 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${progressPercent}%` }} />
                  </div>
                  <p className="text-amber-300 text-xs font-semibold">{progress}/{sessionsNeeded} sessions completed</p>
                </div>
              );
            }
            return null;
          })()}


          {/* Recent Sessions Compact Dropdown */}
          <div>
            <button
              onClick={() => setShowRecentSessions(!showRecentSessions)}
              className="w-full flex items-center justify-between text-purple-300 text-xs font-black uppercase tracking-widest hover:text-white transition-colors py-2">
              <span className="flex items-center gap-2">
                <span className="text-lg">📚</span> Recent Adventures
              </span>
              <ChevronDown size={16} className={`transition-transform ${showRecentSessions ? 'rotate-180' : ''}`} />
            </button>

            {showRecentSessions && (
              <div className="mt-2">
                {(() => {
                  const completedSessions = student.sessions.filter((s: any) => s.wpm || s.fluencyScore);
                  return completedSessions.length === 0 ? (
                    <p className="text-purple-400 text-xs text-center py-4">No completed adventures yet</p>
                  ) : (
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {completedSessions.slice(0, 5).map((s: any) => {
                        const isReading = !s.type || s.type === 'READING';
                        const title = isReading ? s.passage?.title : s.topic?.title;
                        const level = isReading ? s.passage?.level : s.topic?.level;
                        const emoji = isReading ? (TOPIC_EMOJI[title] ?? "📖") : "🎤";
                        const stars = s.accuracy! >= 90 ? 3 : s.accuracy! >= 80 ? 2 : 1;
                        const metric = isReading ? `${Math.round(s.wpm)} WPM` : `${Math.round(s.fluencyScore ?? 0)}%`;

                        // Format relative time
                        const sessionDate = new Date(s.createdAt);
                        const now = new Date();
                        const diffMs = now.getTime() - sessionDate.getTime();
                        const diffMins = Math.floor(diffMs / 60000);
                        const diffHours = Math.floor(diffMs / 3600000);
                        const diffDays = Math.floor(diffMs / 86400000);

                        let timeStr = '';
                        if (diffMins < 1) timeStr = 'Just now';
                        else if (diffMins < 60) timeStr = `${diffMins}m ago`;
                        else if (diffHours < 24) timeStr = `${diffHours}h ago`;
                        else if (diffDays === 0) timeStr = 'Today';
                        else if (diffDays === 1) timeStr = 'Yesterday';
                        else timeStr = `${diffDays}d ago`;

                        return (
                          <div key={s.id}
                            className="bg-white/10 backdrop-blur-sm rounded-lg px-2 py-2 border border-white/10 hover:bg-white/15 transition-colors text-xs">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span className="text-lg flex-shrink-0">{emoji}</span>
                                <div className="min-w-0">
                                  <p className="text-white font-semibold text-xs truncate">{title}</p>
                                  <p className="text-purple-400 text-xs">{timeStr}</p>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 flex items-center gap-1">
                                <div className="flex gap-0.5">
                                  {[...Array(3)].map((_, i) => (
                                    <span key={i} className={i < stars ? "text-sm" : "text-sm opacity-30"}>⭐</span>
                                  ))}
                                </div>
                                <span className="text-purple-300 font-semibold text-xs">{metric}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Onboarding Tour Modal */}
      {showOnboardingTour && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-8 max-w-sm w-full border border-purple-400/30 shadow-2xl">
            <div className="text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-2xl font-black text-white mb-3">Welcome to WizLingo!</h2>
              <p className="text-purple-200 text-sm mb-6 leading-relaxed">
                Here's how to get started:
              </p>

              <div className="space-y-4 text-left mb-8">
                <div className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">📖</span>
                  <div>
                    <p className="text-white font-bold text-sm">Tap Read</p>
                    <p className="text-purple-300 text-xs">Practice reading passages</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">🎤</span>
                  <div>
                    <p className="text-white font-bold text-sm">Tap Speak</p>
                    <p className="text-purple-300 text-xs">Have conversations with AI</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">⭐</span>
                  <div>
                    <p className="text-white font-bold text-sm">Earn badges & level up</p>
                    <p className="text-purple-300 text-xs">Complete sessions to unlock rewards</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowOnboardingTour(false)}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all active:scale-95"
              >
                Let's Get Started! 🚀
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
