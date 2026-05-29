"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, CartesianGrid, Legend,
} from "recharts";
import { LogOut, AlertTriangle, TrendingUp, Users, Activity, Clock } from "lucide-react";
import Image from "next/image";

interface StuckStudent {
  id: string; name: string; admissionNumber: string;
  level: number; totalSessions: number; passedSessions: number;
  avgWpm: number; avgAccuracy: number; daysSince: number | null;
}
interface AtRiskStudent {
  id: string; name: string; admissionNumber: string;
  avgWpm: number; avgAccuracy: number;
}
interface ClassStat {
  classId: string; grade: number; section: string;
  totalStudents: number; activeStudents: number;
  avgWpm: number; avgAccuracy: number;
  levelDist: { level: number; count: number }[];
  atRiskCount: number; atRiskStudents: AtRiskStudent[];
  stuckStudents: StuckStudent[];
}
interface WeekDay {
  date: string; label: string; sessions: number; students: number;
  avgWpm: number; avgAccuracy: number;
}
interface WeekSummary {
  sessions: number; students: number; avgWpm: number;
  avgAccuracy: number; vsLastWeek: number | null;
}
interface Stats {
  classStats: ClassStat[];
  totalStudents: number; totalActive: number; totalAtRisk: number; totalStuck: number;
  weeklyTrend: WeekDay[]; weekSummary: WeekSummary;
}

const LEVEL_COLORS = ["#6366f1", "#22c55e", "#f59e0b"];
const LEVEL_LABELS = ["Beginner", "Explorer", "Champion"];

function TrendBadge({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-xs text-gray-400">first week</span>;
  const up = pct >= 0;
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${up ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
      {up ? "↑" : "↓"} {Math.abs(pct)}% vs last week
    </span>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [weekChart, setWeekChart] = useState<"sessions" | "wpm">("sessions");

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .catch(() => router.push("/login"));

    fetch("/api/admin/stats", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setStats)
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!stats) return null;

  const schoolAvgWpm = stats.classStats.length
    ? Math.round(stats.classStats.reduce((s, c) => s + c.avgWpm, 0) / stats.classStats.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image src="/edvanta-logo1.png" alt="Edvanta" width={100} height={28} />
            <div className="border-l pl-3">
              <p className="text-sm font-bold text-gray-800">WizLingo</p>
              <p className="text-xs text-gray-500">Principal / Admin Dashboard</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-8">

        {/* ── School-wide summary ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Students",  value: stats.totalStudents, icon: Users,         color: "text-indigo-600", bg: "bg-indigo-50"  },
            { label: "Active",          value: stats.totalActive,   icon: Activity,      color: "text-green-600",  bg: "bg-green-50"   },
            { label: "Need Attention",  value: stats.totalAtRisk,   icon: AlertTriangle, color: "text-red-600",    bg: "bg-red-50"     },
            { label: "Stuck Students",  value: stats.totalStuck,    icon: Clock,         color: "text-orange-600", bg: "bg-orange-50"  },
            { label: "School Avg WPM",  value: schoolAvgWpm,        icon: TrendingUp,    color: "text-amber-600",  bg: "bg-amber-50"   },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-5 shadow-sm`}>
              <Icon size={20} className={`${color} mb-2`} />
              <p className={`text-3xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Weekly progress ─────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-800">Weekly Progress</h2>
              <p className="text-xs text-gray-400 mt-0.5">Last 7 days school-wide activity</p>
            </div>
            <TrendBadge pct={stats.weekSummary.vsLastWeek} />
          </div>

          {/* This-week summary pills */}
          <div className="grid grid-cols-4 divide-x border-b">
            {[
              { label: "Sessions",    value: stats.weekSummary.sessions },
              { label: "Students",    value: stats.weekSummary.students },
              { label: "Avg WPM",     value: stats.weekSummary.avgWpm   },
              { label: "Avg Accuracy",value: `${stats.weekSummary.avgAccuracy}%` },
            ].map(({ label, value }) => (
              <div key={label} className="px-6 py-4 text-center">
                <p className="text-2xl font-black text-indigo-600">{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Chart toggle */}
          <div className="px-6 pt-4 flex gap-2">
            {(["sessions", "wpm"] as const).map((k) => (
              <button key={k} onClick={() => setWeekChart(k)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  weekChart === k ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                {k === "sessions" ? "Sessions / day" : "Avg WPM / day"}
              </button>
            ))}
          </div>

          <div className="px-6 pb-6 pt-4">
            <ResponsiveContainer width="100%" height={240}>
              {weekChart === "sessions" ? (
                <BarChart data={stats.weeklyTrend} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip formatter={(v) => [`${v} sessions`, "Sessions"]} />
                  <Bar dataKey="sessions" radius={[6, 6, 0, 0]}>
                    {stats.weeklyTrend.map((_, i) => (
                      <Cell key={i} fill={i === 6 ? "#6366f1" : "#c7d2fe"} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <LineChart data={stats.weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v, name) => [
                    name === "avgWpm" ? `${v} WPM` : `${v}%`,
                    name === "avgWpm" ? "Avg WPM" : "Avg Accuracy",
                  ]} />
                  <Legend formatter={(v) => (v === "avgWpm" ? "Avg WPM" : "Avg Accuracy")} />
                  <Line type="monotone" dataKey="avgWpm" stroke="#6366f1" strokeWidth={2.5}
                    dot={{ r: 4, fill: "#6366f1" }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="avgAccuracy" stroke="#22c55e" strokeWidth={2.5}
                    dot={{ r: 4, fill: "#22c55e" }} activeDot={{ r: 6 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </section>

        {/* ── Class-wise breakdown ─────────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
            Class-wise Breakdown
          </h2>
          <div className="space-y-3">
            {stats.classStats.map((cls) => (
              <div key={cls.classId} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedClass(expandedClass === cls.classId ? null : cls.classId)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-100 text-indigo-700 font-black rounded-xl w-12 h-12 flex items-center justify-center text-sm">
                      {cls.grade}{cls.section}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-800">Grade {cls.grade} – Section {cls.section}</p>
                      <p className="text-xs text-gray-400">{cls.activeStudents}/{cls.totalStudents} active</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-indigo-600">{cls.avgWpm} WPM</p>
                      <p className="text-xs text-gray-400">{cls.avgAccuracy}% accuracy</p>
                    </div>
                    {cls.atRiskCount > 0 && (
                      <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                        {cls.atRiskCount} at risk
                      </span>
                    )}
                    {cls.stuckStudents.length > 0 && (
                      <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-full">
                        {cls.stuckStudents.length} stuck
                      </span>
                    )}
                    <span className="text-gray-400 text-xl font-light">
                      {expandedClass === cls.classId ? "−" : "+"}
                    </span>
                  </div>
                </button>

                {expandedClass === cls.classId && (
                  <div className="border-t px-6 py-5 space-y-6 bg-gray-50/50">

                    {/* Level distribution */}
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                        Level Distribution
                      </p>
                      <div className="flex gap-3">
                        {cls.levelDist.map((ld, i) => (
                          <div key={ld.level} className="flex-1 rounded-xl p-4 text-center"
                            style={{ background: `${LEVEL_COLORS[i]}18`, border: `1px solid ${LEVEL_COLORS[i]}40` }}>
                            <p className="text-2xl font-black" style={{ color: LEVEL_COLORS[i] }}>{ld.count}</p>
                            <p className="text-xs font-semibold text-gray-500 mt-0.5">
                              Level {ld.level} · {LEVEL_LABELS[i]}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stuck students */}
                    {cls.stuckStudents.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-3 flex items-center gap-1">
                          <Clock size={13} /> Students stuck at current level
                        </p>
                        <div className="overflow-x-auto rounded-xl border border-orange-200">
                          <table className="w-full text-sm">
                            <thead className="bg-orange-50">
                              <tr>
                                {["Student", "Adm. No", "Level", "Sessions", "Passes", "Avg WPM", "Avg Acc", "Weeks at Level"].map((h) => (
                                  <th key={h} className="text-left px-4 py-2.5 text-xs font-bold text-orange-700">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-orange-100">
                              {cls.stuckStudents.map((s) => (
                                <tr key={s.id} className="bg-white hover:bg-orange-50/40">
                                  <td className="px-4 py-3 font-semibold text-gray-800">{s.name}</td>
                                  <td className="px-4 py-3 text-gray-500">{s.admissionNumber}</td>
                                  <td className="px-4 py-3">
                                    <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-bold">
                                      L{s.level}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-gray-700">{s.totalSessions}</td>
                                  <td className="px-4 py-3">
                                    <span className="text-orange-600 font-bold">{s.passedSessions}/3</span>
                                  </td>
                                  <td className="px-4 py-3 text-gray-700">{s.avgWpm}</td>
                                  <td className="px-4 py-3 text-gray-700">{s.avgAccuracy}%</td>
                                  <td className="px-4 py-3 text-gray-500">
                                    {s.daysSince !== null ? `~${Math.ceil(s.daysSince / 7)}w` : "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* At-risk students */}
                    {cls.atRiskStudents.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-3 flex items-center gap-1">
                          <AlertTriangle size={13} /> Students needing support
                        </p>
                        <div className="space-y-2">
                          {cls.atRiskStudents.map((s) => (
                            <div key={s.id} className="flex justify-between items-center bg-red-50 rounded-xl px-4 py-3 border border-red-100">
                              <div>
                                <p className="text-sm font-semibold text-gray-800">{s.name}</p>
                                <p className="text-xs text-gray-400">{s.admissionNumber}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-red-600 font-bold">{Math.round(s.avgWpm)} WPM</p>
                                <p className="text-xs text-gray-400">{Math.round(s.avgAccuracy)}% acc</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
