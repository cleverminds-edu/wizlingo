"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, AlertTriangle } from "lucide-react";
import Image from "next/image";

interface ClassData {
  id: string;
  grade: number;
  section: string;
  students: {
    id: string;
    name: string;
    rollNumber: string;
    progress: {
      currentLevel: number;
      avgWpm: number;
      avgAccuracy: number;
      totalSessions: number;
    } | null;
    speakingProgress: {
      currentLevel: number;
      avgWpm: number;
      avgFluency: number;
      totalSessions: number;
    } | null;
    sessions: { id: string; status: string; wpm: number | null; accuracy: number | null }[];
  }[];
}

type Tab = "reading" | "speaking";

export default function TeacherDashboard() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selected, setSelected] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("reading");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(async (me) => {
        const results = await Promise.all(
          me.classes.map((c: { id: string }) =>
            fetch(`/api/teacher/class/${c.id}`).then((r) => r.json())
          )
        );
        setClasses(results);
        if (results.length > 0) setSelected(results[0]);
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const atRisk = (selected?.students ?? []).filter(
    (s) => !s.progress || s.progress.avgAccuracy < 70
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image src="/edvanta-logo1.png" alt="Edvanta" width={90} height={24} />
            <span className="text-xs text-gray-400 border-l pl-2">Teacher Portal</span>
          </div>
          <button onClick={logout} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Class tabs */}
        {classes.length > 1 && (
          <div className="flex gap-2 mb-6">
            {classes.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selected?.id === c.id
                    ? "bg-indigo-600 text-white"
                    : "bg-white border text-gray-600 hover:bg-gray-50"
                }`}
              >
                Grade {c.grade}-{c.section}
              </button>
            ))}
          </div>
        )}

        {selected && (
          <>
            {/* Module tabs */}
            <div className="flex gap-2 mb-6">
              {(["reading", "speaking"] as Tab[]).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                    tab === t ? "bg-indigo-600 text-white" : "bg-white border text-gray-600 hover:bg-gray-50"
                  }`}>
                  {t === "reading" ? "📖 Reading" : "🎤 Speaking"}
                </button>
              ))}
            </div>

            {/* Summary row */}
            {tab === "reading" && (
              <>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                    <p className="text-2xl font-bold text-indigo-700">{selected.students.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Students</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {selected.students.filter((s) => s.progress && s.progress.totalSessions > 0).length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Active Readers</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 shadow-sm text-center">
                    <p className="text-2xl font-bold text-red-600">{atRisk.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Need Attention</p>
                  </div>
                </div>

                {atRisk.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="text-sm font-semibold text-red-700">Students needing attention:</p>
                      <p className="text-sm text-red-600 mt-1">{atRisk.map((s) => s.name).join(", ")}</p>
                    </div>
                  </div>
                )}

                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Reading · Grade {selected.grade}-{selected.section}
                </h2>
                <div className="space-y-2">
                  {selected.students.map((s) => {
                    const needsReview = s.sessions.some((sess) => sess.status === "NEEDS_REVIEW");
                    return (
                      <div key={s.id} className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{s.name}</p>
                            <p className="text-xs text-gray-400">Roll {s.rollNumber}</p>
                          </div>
                          {needsReview && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Review</span>
                          )}
                        </div>
                        <div>
                          {s.progress ? (
                            <div className="text-right">
                              <p className="text-sm font-bold text-indigo-600">Level {s.progress.currentLevel}</p>
                              <p className="text-xs text-gray-400">
                                {Math.round(s.progress.avgWpm)} WPM · {Math.round(s.progress.avgAccuracy)}%
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">No sessions yet</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {tab === "speaking" && (
              <>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                    <p className="text-2xl font-bold text-purple-700">{selected.students.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Students</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {selected.students.filter((s) => s.speakingProgress && s.speakingProgress.totalSessions > 0).length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Active Speakers</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 shadow-sm text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {selected.students.filter((s) => !s.speakingProgress || s.speakingProgress.totalSessions === 0).length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Not Started</p>
                  </div>
                </div>

                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Speaking · Grade {selected.grade}-{selected.section}
                </h2>
                <div className="space-y-2">
                  {selected.students.map((s) => (
                    <div key={s.id} className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{s.name}</p>
                          <p className="text-xs text-gray-400">Roll {s.rollNumber}</p>
                        </div>
                      </div>
                      <div>
                        {s.speakingProgress && s.speakingProgress.totalSessions > 0 ? (
                          <div className="text-right">
                            <p className="text-sm font-bold text-purple-600">Level {s.speakingProgress.currentLevel}</p>
                            <p className="text-xs text-gray-400">
                              {Math.round(s.speakingProgress.avgWpm)} WPM · {Math.round(s.speakingProgress.avgFluency)}% fluency
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No sessions yet</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
