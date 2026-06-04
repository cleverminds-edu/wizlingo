'use client';

import { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, AlertCircle, Users, BookOpen, Mic } from 'lucide-react';

interface Stats {
  totalStudents: number;
  activeTodayStudents: number;
  totalReadingSessions: number;
  totalSpeakingSessions: number;
  avgReadingAccuracy: number;
  avgReadingWpm: number;
  avgSpeakingFluency: number;
  avgSpeakingWpm: number;
  topPerformer: {
    name: string;
    level: number;
    accuracy: number;
  } | null;
}

interface FeedbackData {
  totalFeedback: number;
  avgRating: number;
  issueCounts: Record<string, number>;
  topComplaints: Array<{
    studentName: string;
    comment: string;
    rating: number;
    sessionType: string;
  }>;
  trend: Array<{ date: string; count: number; avgRating: number }>;
  issuesByType: Record<string, Record<string, number>>;
}

interface DailyActive {
  dailyStats: Array<{
    date: string;
    activeStudents: number;
    readingSessions: number;
    speakingSessions: number;
    totalSessions: number;
  }>;
  avg7DayActive: number;
  growth: number;
}

export default function BetaDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [dailyActive, setDailyActive] = useState<DailyActive | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [statsRes, feedbackRes, dailyRes] = await Promise.all([
          fetch('/api/admin/beta/stats'),
          fetch('/api/admin/beta/feedback?days=7'),
          fetch('/api/admin/beta/daily-active?days=30'),
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (feedbackRes.ok) setFeedback(await feedbackRes.json());
        if (dailyRes.ok) setDailyActive(await dailyRes.json());
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="text-center">
          <div className="text-6xl animate-pulse mb-4">📊</div>
          <p className="text-purple-200 text-xl font-semibold">Loading beta dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-black text-white">
              📊 WizLingo Beta Dashboard
            </h1>
            <div className="text-sm text-purple-300 bg-white/10 px-4 py-2 rounded-full border border-white/20">
              ⚡ Powered by <span className="font-bold text-orange-400">Edvanta Intelligence System (AI)</span>
            </div>
          </div>
          <p className="text-purple-200 text-lg">Real-time monitoring for 100-150 students</p>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Today', value: stats?.activeTodayStudents, icon: '👥', total: stats?.totalStudents },
            { label: 'Reading Sessions', value: stats?.totalReadingSessions, icon: '📖' },
            { label: 'Speaking Sessions', value: stats?.totalSpeakingSessions, icon: '🎤' },
            { label: 'Avg Rating', value: feedback?.avgRating, icon: '⭐', suffix: '/5' },
          ].map((stat, i) => (
            <div key={i} className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 backdrop-blur">
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{stat.icon}</span>
                {stat.total && <span className="text-xs text-purple-300">of {stat.total}</span>}
              </div>
              <p className="text-4xl font-black text-white mb-1">
                {stat.value ?? '...'}
                {stat.suffix && <span className="text-xl text-purple-300 ml-1">{stat.suffix}</span>}
              </p>
              <p className="text-sm text-purple-300">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Reading Metrics */}
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-3xl p-8 backdrop-blur">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">📖</span>
              <h2 className="text-xl font-bold text-white">Reading Performance</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-green-200 mb-2">Average Accuracy</p>
                <div className="flex items-center gap-3">
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full"
                      style={{ width: `${stats?.avgReadingAccuracy || 0}%` }}
                    />
                  </div>
                  <span className="text-2xl font-black text-white min-w-[60px]">
                    {Math.round((stats?.avgReadingAccuracy || 0) * 10) / 10}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-green-200 mb-2">Average WPM</p>
                <p className="text-3xl font-black text-white">{Math.round(stats?.avgReadingWpm || 0)} WPM</p>
              </div>
            </div>
          </div>

          {/* Speaking Metrics */}
          <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-3xl p-8 backdrop-blur">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🎤</span>
              <h2 className="text-xl font-bold text-white">Speaking Performance</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-blue-200 mb-2">Average Fluency</p>
                <div className="flex items-center gap-3">
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-indigo-500 h-3 rounded-full"
                      style={{ width: `${stats?.avgSpeakingFluency || 0}%` }}
                    />
                  </div>
                  <span className="text-2xl font-black text-white min-w-[60px]">
                    {Math.round((stats?.avgSpeakingFluency || 0) * 10) / 10}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-blue-200 mb-2">Average WPM</p>
                <p className="text-3xl font-black text-white">{Math.round(stats?.avgSpeakingWpm || 0)} WPM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performer */}
        {stats?.topPerformer && (
          <div className="mb-8 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-3xl p-8 backdrop-blur">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🏆</span>
              <h2 className="text-xl font-bold text-white">Top Performer</h2>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-black text-white mb-2">{stats.topPerformer.name}</p>
                <p className="text-purple-200">Level {stats.topPerformer.level} · {Math.round(stats.topPerformer.accuracy * 10) / 10}% Accuracy</p>
              </div>
              <div className="text-5xl">⭐</div>
            </div>
          </div>
        )}

        {/* Feedback Issues */}
        {feedback && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-3xl p-8 backdrop-blur">
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="w-6 h-6 text-red-400" />
                <h2 className="text-xl font-bold text-white">Issues Reported (7 days)</h2>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {Object.entries(feedback.issueCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([issue, count]) => (
                    <div key={issue} className="flex items-center justify-between">
                      <span className="text-white capitalize">{issue.replace(/_/g, ' ')}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-40 bg-white/10 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{
                              width: `${(count / Math.max(...Object.values(feedback.issueCounts))) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-lg font-bold text-white min-w-[40px]">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Top Complaints */}
            <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-3xl p-8 backdrop-blur">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">💬</span>
                <h2 className="text-xl font-bold text-white">Recent Feedback</h2>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {feedback.topComplaints.length > 0 ? (
                  feedback.topComplaints.map((complaint, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-semibold text-white">{complaint.studentName}</span>
                        <span className="text-lg">{'⭐'.repeat(complaint.rating)}</span>
                      </div>
                      <p className="text-sm text-purple-200 italic">"{complaint.comment}"</p>
                      <span className="text-xs text-purple-400 mt-2 inline-block">
                        {complaint.sessionType === 'reading' ? '📖' : '🎤'} {complaint.sessionType}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-purple-300">No feedback with comments yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Engagement Trend */}
        {dailyActive && (
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-3xl p-8 backdrop-blur">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📈</span>
                <h2 className="text-xl font-bold text-white">Engagement Trend (30 days)</h2>
              </div>
              <div className={`text-lg font-bold ${dailyActive.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {dailyActive.growth >= 0 ? '+' : ''}{dailyActive.growth}% Growth
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-sm text-purple-300 mb-2">7-Day Avg Active</p>
                <p className="text-3xl font-black text-white">{dailyActive.avg7DayActive.toFixed(1)}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-sm text-purple-300 mb-2">Last Day Active</p>
                <p className="text-3xl font-black text-white">
                  {dailyActive.dailyStats[dailyActive.dailyStats.length - 1]?.activeStudents || 0}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {dailyActive.dailyStats.slice(-14).map((day, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-sm text-purple-300 min-w-[70px]">{day.date}</span>
                  <div className="flex-1 bg-white/10 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-blue-500 h-3 rounded-full"
                      style={{
                        width: `${(day.activeStudents / (stats?.totalStudents || 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-white min-w-[50px]">{day.activeStudents} students</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-purple-300 text-sm border-t border-white/10 pt-8">
          <p>Powered by <span className="font-bold text-orange-400">Edvanta Intelligence System (AI)</span></p>
          <p className="text-xs mt-2">Last updated: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
