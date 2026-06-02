"use client";

import { useRouter } from "next/navigation";
import { LogOut, BookOpen, Mic, LayoutDashboard } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import Image from "next/image";
import { ModernBadgeDisplay } from "@/components/badges/ModernBadgeDisplay";
import { BadgeType } from "@/app/generated/prisma/client";
import { getBadgeConfig } from "@/lib/badge-config";
import { useBadgeProgress } from "@/hooks/useBadgeProgress";

// ── Types ────────────────────────────────────────────────────────────────────

interface Session {
  id: string; wpm: number | null; accuracy: number | null;
  status: string; createdAt: string;
  passage: { title: string; level: number };
}
export interface StudentData {
  id: string; name: string;
  class: { grade: number; section: string };
  progress: {
    currentLevel: number; avgWpm: number; avgAccuracy: number;
    totalSessions: number; passedSessions: number; gradeBand: string;
  } | null;
  sessions: Session[];
  badges: { type: string; earnedAt: string }[];
  certificates: { badgeType: string; verifyCode: string; issuedAt: string }[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const LEVEL_META = [
  { label: "Beginner", emoji: "🌱", grad: ["#059669", "#047857"] },
  { label: "Explorer", emoji: "🚀", grad: ["#4f46e5", "#2563eb"] },
  { label: "Champion", emoji: "🏆", grad: ["#d97706", "#ea580c"] },
];

const BAND_LABELS: Record<string, string> = {
  BAND_1_2: "Grade 1–2", BAND_3_5: "Grade 3–5",
  BAND_6_8: "Grade 6–8", BAND_9_10: "Grade 9–10",
};

const BADGE_META: Record<string, { emoji: string; label: string }> = {
  SPARK:           { emoji: "✨", label: "Spark"           },
  WORD_WIZARD:     { emoji: "📚", label: "Word Wizard"     },
  VOICE_WIZARD:    { emoji: "🎤", label: "Voice Wizard"    },
  LANGUAGE_WIZARD: { emoji: "🧙", label: "Language Wizard" },
  GRAND_WIZARD:    { emoji: "👑", label: "Grand Wizard"    },
};

const PASSES_TO_LEVEL_UP = 3;

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function greeting(name: string) {
  const h = new Date().getHours();
  const part = h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
  return `Good ${part}, ${name.split(" ")[0]}`;
}

function coachMessage(student: StudentData): string {
  const withWpm = student.sessions.filter(s => s.wpm);
  if (!withWpm.length) return "Complete your first session to get personalised insights! 🚀";
  const recent = withWpm.slice(0, 3);
  const older  = withWpm.slice(3, 6);
  const recentAvg = recent.reduce((s, r) => s + r.wpm!, 0) / recent.length;
  const olderAvg  = older.length ? older.reduce((s, r) => s + r.wpm!, 0) / older.length : recentAvg;
  const trend = older.length ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
  const passes = student.progress?.passedSessions ?? 0;
  const acc    = student.progress?.avgAccuracy ?? 0;
  if (passes === PASSES_TO_LEVEL_UP - 1) return "One more pass and you level up — give it your best today! ⭐";
  if (trend > 10) return `Reading speed up ${Math.round(trend)}% recently. Momentum is building! 🚀`;
  if (acc < 78)   return "Focus on clarity over speed right now — accurate reading beats fast reading. 🎯";
  if (trend < -10) return "Slow down a little and focus on each word — quality over quantity. 📖";
  return "Consistent work builds great readers. Keep showing up every day! 📚";
}

// ── Recharts custom tooltip ────────────────────────────────────────────────────

function WpmTooltip({ active, payload }: { active?: boolean; payload?: { value: number }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-sm font-bold"
      style={{ background: "#1e1b4b", border: "1px solid rgba(99,102,241,0.4)", color: "#a5b4fc" }}>
      {payload[0].value} WPM
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({ student, onLogout }: { student: StudentData; onLogout: () => void }) {
  const router = useRouter();
  const level = student.progress?.currentLevel ?? 1;

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-screen sticky top-0"
      style={{ background: "#080810", borderRight: "1px solid rgba(255,255,255,0.06)" }}>

      {/* Logo */}
      <div className="px-5 py-5">
        <Image src="/wiziingo-logo.svg" alt="WizLingo" width={148} height={38}
          />
      </div>

      {/* Student card */}
      <div className="mx-4 mb-6 p-4 rounded-2xl"
        style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.18)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}>
            {initials(student.name)}
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm truncate">{student.name}</p>
            <p className="text-xs" style={{ color: "#818cf8" }}>
              Grade {student.class.grade}-{student.class.section}
            </p>
          </div>
        </div>
        <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(99,102,241,0.15)" }}>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            {BAND_LABELS[student.progress?.gradeBand ?? "BAND_3_5"]}
          </p>
          <p className="text-xs font-bold mt-0.5" style={{ color: "#a5b4fc" }}>
            {LEVEL_META[level - 1].emoji} Level {level} · {LEVEL_META[level - 1].label}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {[
          { icon: <LayoutDashboard size={17} />, label: "Dashboard", href: "/student/dashboard", active: true  },
          { icon: <BookOpen size={17} />,        label: "Reading",   href: "/student/session",   active: false },
          { icon: <Mic size={17} />,             label: "Speaking",  href: "/student/speaking",  active: false },
        ].map(item => (
          <button key={item.label} onClick={() => router.push(item.href)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={item.active
              ? { background: "rgba(99,102,241,0.18)", color: "#a5b4fc" }
              : { color: "rgba(255,255,255,0.35)" }}
            onMouseEnter={e => { if (!item.active) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)"; }}
            onMouseLeave={e => { if (!item.active) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)"; }}>
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Badges */}
      {student.badges.length > 0 && (
        <div className="px-5 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "rgba(255,255,255,0.25)" }}>Badges</p>
          <div className="flex flex-wrap gap-2">
            {student.badges.map(b => {
              const meta = BADGE_META[b.type];
              if (!meta) return null;
              return (
                <span key={b.type} title={meta.label} className="text-xl cursor-default"
                  style={{ filter: "drop-shadow(0 0 8px rgba(255,210,0,0.45))" }}>
                  {meta.emoji}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ color: "rgba(255,255,255,0.3)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.3)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function DesktopDashboard({ student, onLogout }: { student: StudentData; onLogout: () => void }) {
  const router = useRouter();
  const level   = student.progress?.currentLevel ?? 1;
  const meta    = LEVEL_META[level - 1];
  const passes  = student.progress?.passedSessions ?? 0;
  const acc     = student.progress?.avgAccuracy ?? 0;

  // Fetch badge progress with hook
  const { earned: earnedBadgeProgress, nextBadges: lockedBadges } = useBadgeProgress(student.id);

  const chartData = student.sessions
    .filter(s => s.wpm)
    .slice(0, 8)
    .reverse()
    .map((s, i) => ({ name: `#${i + 1}`, wpm: Math.round(s.wpm!) }));

  const earnedBadgeTypes = student.badges.map(b => b.type as BadgeType);
  const allBadgeTypes: BadgeType[] = ['SPARK', 'WORD_WIZARD', 'VOICE_WIZARD', 'LANGUAGE_WIZARD', 'GRAND_WIZARD'];

  // Build next badges with progress data
  const nextBadges = allBadgeTypes
    .filter(t => !earnedBadgeTypes.includes(t))
    .map(t => {
      const badgeProgress = lockedBadges.find(b => b.type === t);
      return {
        type: t,
        config: getBadgeConfig(t as BadgeType),
        progress: badgeProgress?.progress ?? 0,
      };
    });

  const circumference = 2 * Math.PI * 32;
  const accOffset = circumference * (1 - acc / 100);

  return (
    <div className="min-h-screen flex" style={{ background: "#080810" }}>
      <Sidebar student={student} onLogout={onLogout} />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto"
        style={{ background: "linear-gradient(160deg, #0f0c29 0%, #16103a 60%, #0f0c29 100%)" }}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-10 py-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">{greeting(student.name)} 👋</h1>
            <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#a5b4fc" }}>
            <span>{meta.emoji}</span>
            <span>Level {level} · {meta.label}</span>
          </div>
        </div>

        <div className="px-10 py-8 space-y-6">

          {/* ── Row 1: Level hero + stat cards ─────────────────────────── */}
          <div className="grid grid-cols-5 gap-5">

            {/* Level hero */}
            <div className="col-span-3 relative rounded-3xl p-8 overflow-hidden shadow-2xl"
              style={{ background: `linear-gradient(135deg, ${meta.grad[0]}, ${meta.grad[1]})` }}>
              <div className="absolute -right-6 -top-6 text-[160px] leading-none opacity-[0.08] select-none pointer-events-none">
                {meta.emoji}
              </div>
              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-widest mb-4"
                  style={{ color: "rgba(255,255,255,0.55)" }}>Current Level</p>
                <div className="flex items-end gap-5 mb-6">
                  <span className="text-[80px] font-black leading-none text-white">{level}</span>
                  <div className="mb-2">
                    <p className="text-3xl font-black text-white">{meta.label}</p>
                    <div className="flex gap-1 mt-1.5">
                      {[1, 2, 3].map(i => (
                        <span key={i} className={`text-lg transition-opacity ${i <= level ? "opacity-100" : "opacity-20"}`}>⭐</span>
                      ))}
                    </div>
                  </div>
                </div>
                {level < 3 ? (
                  <>
                    <div className="flex justify-between text-sm mb-2">
                      <span style={{ color: "rgba(255,255,255,0.6)" }}>Progress to Level {level + 1}</span>
                      <span className="text-white font-bold">{passes} / {PASSES_TO_LEVEL_UP} passes</span>
                    </div>
                    <div className="rounded-full h-2.5" style={{ background: "rgba(0,0,0,0.25)" }}>
                      <div className="h-2.5 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min((passes / PASSES_TO_LEVEL_UP) * 100, 100)}%`, background: "rgba(255,255,255,0.85)" }} />
                    </div>
                  </>
                ) : (
                  <p className="text-white font-bold text-lg">🏆 Maximum level reached!</p>
                )}
              </div>
            </div>

            {/* Stat cards */}
            <div className="col-span-2 flex flex-col gap-4">
              {[
                { emoji: "🔥", value: String(student.progress?.totalSessions ?? 0), label: "Total Sessions", sub: "completed" },
                { emoji: "⚡", value: student.progress?.avgWpm ? `${Math.round(student.progress.avgWpm)}` : "—", label: "Avg Speed", sub: "words / min" },
                { emoji: "🎯", value: student.progress?.avgAccuracy ? `${Math.round(student.progress.avgAccuracy)}%` : "—", label: "Accuracy", sub: "reading score" },
              ].map(({ emoji, value, label, sub }) => (
                <div key={label} className="flex-1 flex items-center gap-4 rounded-2xl px-5 py-4"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-2xl">{emoji}</span>
                  <div>
                    <p className="text-2xl font-black text-white leading-none">{value}</p>
                    <p className="text-xs font-semibold mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>{label}</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Row 2: WPM chart + accuracy ring + coach ───────────────── */}
          <div className="grid grid-cols-5 gap-5">

            {/* WPM line chart */}
            <div className="col-span-3 rounded-3xl p-7"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-white font-bold text-base mb-1">Reading Speed Trend</p>
              <p className="text-xs mb-6" style={{ color: "rgba(255,255,255,0.35)" }}>Words per minute across your last sessions</p>
              {chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height={170}>
                  <LineChart data={chartData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.15)"
                      tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} />
                    <YAxis stroke="rgba(255,255,255,0.15)"
                      tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} />
                    <Tooltip content={<WpmTooltip />} />
                    <Line type="monotone" dataKey="wpm" stroke="#6366f1" strokeWidth={2.5}
                      dot={{ fill: "#6366f1", strokeWidth: 0, r: 4 }}
                      activeDot={{ fill: "#a5b4fc", r: 6, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[170px] flex flex-col items-center justify-center gap-2"
                  style={{ color: "rgba(255,255,255,0.2)" }}>
                  <span className="text-3xl">📊</span>
                  <span className="text-sm">Complete more sessions to see your trend</span>
                </div>
              )}
            </div>

            {/* Accuracy ring + AI coach */}
            <div className="col-span-2 flex flex-col gap-4">

              {/* Accuracy ring */}
              <div className="flex-1 rounded-3xl p-6 flex items-center gap-5"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="relative w-24 h-24 flex-shrink-0">
                  <svg viewBox="0 0 80 80" className="w-24 h-24" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="40" cy="40" r="32" fill="none"
                      stroke="rgba(255,255,255,0.07)" strokeWidth="7" />
                    <circle cx="40" cy="40" r="32" fill="none"
                      stroke={acc >= 85 ? "#10b981" : acc >= 70 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="7" strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={acc ? accOffset : circumference}
                      style={{ transition: "stroke-dashoffset 1.2s ease" }} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-black text-lg">
                      {acc ? `${Math.round(acc)}%` : "—"}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-white font-bold">Accuracy</p>
                  <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>Avg reading score</p>
                  {acc > 0 && (
                    <p className="text-xs font-bold mt-2"
                      style={{ color: acc >= 85 ? "#34d399" : acc >= 70 ? "#fbbf24" : "#f87171" }}>
                      {acc >= 85 ? "Excellent 🌟" : acc >= 70 ? "Good 👍" : "Keep practising 💪"}
                    </p>
                  )}
                </div>
              </div>

              {/* AI Coach */}
              <div className="flex-1 rounded-3xl p-6"
                style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: "#818cf8" }}>🧙 WizLingo Coach</p>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                  {coachMessage(student)}
                </p>
              </div>
            </div>
          </div>

          {/* ── Row 3: CTA cards + recent sessions ─────────────────────── */}
          <div className="grid grid-cols-5 gap-5">

            {/* CTA cards */}
            <div className="col-span-2 flex flex-col gap-4">
              {[
                { label: "Reading",  sub: "Read aloud · earn stars",      emoji: "📖", grad: ["#d97706","#ef4444"], href: "/student/session"  },
                { label: "Speaking", sub: "Chat with AI · build fluency",  emoji: "🎤", grad: ["#6366f1","#a855f7"], href: "/student/speaking" },
              ].map(({ label, sub, emoji, grad, href }) => (
                <button key={label} onClick={() => router.push(href)}
                  className="flex-1 relative rounded-3xl p-7 text-left overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})` }}>
                  <span className="absolute right-4 bottom-2 text-[70px] opacity-[0.15] pointer-events-none select-none">
                    {emoji}
                  </span>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2"
                    style={{ color: "rgba(255,255,255,0.55)" }}>Module</p>
                  <p className="text-white font-black text-2xl">{label}</p>
                  <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>{sub}</p>
                </button>
              ))}
            </div>

            {/* Recent sessions */}
            <div className="col-span-3 rounded-3xl p-7"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-white font-bold text-base mb-5">Recent Sessions</p>
              {student.sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <span className="text-4xl">🌟</span>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No sessions yet — start reading!</p>
                </div>
              ) : (
                <div>
                  {/* Table header */}
                  <div className="grid grid-cols-4 text-xs font-bold uppercase tracking-widest mb-3 px-2"
                    style={{ color: "rgba(255,255,255,0.25)" }}>
                    <span className="col-span-2">Passage</span>
                    <span className="text-center">Speed</span>
                    <span className="text-right">Score</span>
                  </div>
                  <div className="space-y-1">
                    {student.sessions.slice(0, 7).map((s) => {
                      const stars = !s.wpm ? 0 : (s.accuracy ?? 0) >= 90 ? 3 : (s.accuracy ?? 0) >= 80 ? 2 : 1;
                      return (
                        <div key={s.id}
                          className="grid grid-cols-4 items-center px-3 py-3 rounded-xl transition-colors"
                          style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                          <div className="col-span-2 flex items-center gap-3 min-w-0">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0"
                              style={{ background: "rgba(99,102,241,0.2)" }}>
                              {s.passage.level === 1 ? "🌱" : s.passage.level === 2 ? "🚀" : "🏆"}
                            </div>
                            <div className="min-w-0">
                              <p className="text-white text-sm font-medium truncate">{s.passage.title}</p>
                              <p className="text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>Level {s.passage.level}</p>
                            </div>
                          </div>
                          <div className="text-center">
                            {s.wpm
                              ? <span className="text-sm font-bold" style={{ color: "#a5b4fc" }}>{Math.round(s.wpm)} <span className="text-xs font-normal" style={{ color: "rgba(255,255,255,0.3)" }}>wpm</span></span>
                              : <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.15)", color: "#fbbf24" }}>Pending</span>
                            }
                          </div>
                          <div className="flex justify-end gap-0.5">
                            {s.wpm
                              ? [1,2,3].map(i => <span key={i} className={`text-sm ${i <= stars ? "opacity-100" : "opacity-15"}`}>⭐</span>)
                              : null
                            }
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Row 4: Badges & Achievements ─────────────────────── */}
          <div className="mt-8">
            <ModernBadgeDisplay
              studentId={student.id}
              studentName={student.name}
              earnedBadges={earnedBadgeTypes}
              nextBadges={nextBadges}
            />
          </div>

        </div>
      </main>
    </div>
  );
}
