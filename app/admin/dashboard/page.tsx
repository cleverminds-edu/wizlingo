'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface DashboardStats {
  summary: {
    totalStudents: number;
    newStudentsToday: number;
    newStudentsThisWeek: number;
    activeStudentsLast24h: number;
    activeStudentsThisWeek: number;
    engagementRate: number;
  };
  participation: {
    studentsWithReadingSessions: number;
    studentsWithSpeakingSessions: number;
    totalReadingSessions: number;
    totalSpeakingSessions: number;
  };
  performance: {
    avgReadingLevel: number;
    avgReadingAccuracy: number;
    avgSpeakingLevel: number;
  };
  badges: Array<{ type: string; count: number }>;
  recentSignups: Array<{
    id: string;
    name: string;
    phone: string;
    createdAt: string;
    class: { name: string } | null;
  }>;
  topPerformers: Array<{
    name: string;
    phone: string;
    level: number;
    accuracy: number;
    sessions: number;
  }>;
  timestamp: string;
}

export default function ManagerDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const AnimatedCounter = ({ value }: { value: number }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
      if (!value) return;
      const duration = 1000;
      const increment = value / (duration / 16);
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, 16);

      return () => clearInterval(timer);
    }, [value]);

    return <span>{displayValue}</span>;
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/admin/dashboard-stats', { credentials: 'include' });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError('Failed to load dashboard stats');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .animate-spin-custom {
            animation: spin 1s linear infinite;
          }
        `}</style>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin-custom mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold">Loading dashboard...</p>
          <p className="text-slate-400 text-sm mt-2">Fetching real-time stats</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(249, 115, 22, 0.1);
          }
          50% {
            box-shadow: 0 0 40px rgba(249, 115, 22, 0.3);
          }
        }
        .fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .slide-in-left {
          animation: slideInLeft 0.6s ease-out forwards;
        }
        .slide-in-right {
          animation: slideInRight 0.6s ease-out forwards;
        }
        .scale-in {
          animation: scaleIn 0.6s ease-out forwards;
        }
        .glow-on-hover {
          transition: all 0.3s ease;
        }
        .glow-on-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(249, 115, 22, 0.2);
        }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
      `}</style>

      {/* Header */}
      <div className="mb-8 fade-in-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/wiziingo-logo.svg"
              alt="WizLingo"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <div>
              <h1 className="text-3xl font-bold text-white">WizLingo Manager</h1>
              <p className="text-slate-400 text-sm">Beta Launch Dashboard</p>
            </div>
          </div>
          <div className="text-right">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : '🔄 Refresh'}
            </button>
            {lastRefresh && (
              <p className="text-slate-400 text-xs mt-2">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {stats && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Students */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white fade-in-up delay-1 glow-on-hover">
              <p className="text-slate-200 text-sm font-semibold mb-2">Total Students</p>
              <p className="text-4xl font-bold"><AnimatedCounter value={stats.summary.totalStudents} /></p>
              <p className="text-blue-100 text-xs mt-2">
                +{stats.summary.newStudentsThisWeek} this week
              </p>
            </div>

            {/* Active Last 24h */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white fade-in-up delay-2 glow-on-hover">
              <p className="text-slate-200 text-sm font-semibold mb-2">Active (24h)</p>
              <p className="text-4xl font-bold"><AnimatedCounter value={stats.summary.activeStudentsLast24h} /></p>
              <p className="text-green-100 text-xs mt-2">
                {stats.summary.totalStudents > 0
                  ? Math.round((stats.summary.activeStudentsLast24h / stats.summary.totalStudents) * 100)
                  : 0}
                % engagement
              </p>
            </div>

            {/* Active This Week */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 text-white fade-in-up delay-3 glow-on-hover">
              <p className="text-slate-200 text-sm font-semibold mb-2">Active (Week)</p>
              <p className="text-4xl font-bold"><AnimatedCounter value={stats.summary.activeStudentsThisWeek} /></p>
              <p className="text-purple-100 text-xs mt-2">
                {stats.summary.totalStudents > 0
                  ? Math.round((stats.summary.activeStudentsThisWeek / stats.summary.totalStudents) * 100)
                  : 0}
                % engagement
              </p>
            </div>

            {/* Engagement Rate */}
            <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg p-6 text-white fade-in-up delay-4 glow-on-hover">
              <p className="text-slate-200 text-sm font-semibold mb-2">Overall Engagement</p>
              <p className="text-4xl font-bold"><AnimatedCounter value={stats.summary.engagementRate} />%</p>
              <p className="text-orange-100 text-xs mt-2">
                {stats.participation.studentsWithReadingSessions} with sessions
              </p>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Reading Performance */}
            <div className="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600 slide-in-left delay-1 glow-on-hover">
              <h2 className="text-xl font-bold text-white mb-4">📖 Reading Performance</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-300">Avg. Level</span>
                    <span className="text-orange-400 font-semibold">{stats.performance.avgReadingLevel.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${(stats.performance.avgReadingLevel / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-300">Avg. Accuracy</span>
                    <span className="text-green-400 font-semibold">
                      {(stats.performance.avgReadingAccuracy * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${stats.performance.avgReadingAccuracy * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-600">
                  <p className="text-slate-400 text-sm">
                    {stats.participation.totalReadingSessions} sessions completed
                  </p>
                </div>
              </div>
            </div>

            {/* Speaking Performance */}
            <div className="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600 slide-in-right delay-2 glow-on-hover">
              <h2 className="text-xl font-bold text-white mb-4">🎤 Speaking Performance</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-300">Avg. Level</span>
                    <span className="text-pink-400 font-semibold">{stats.performance.avgSpeakingLevel.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div
                      className="bg-pink-500 h-2 rounded-full"
                      style={{ width: `${(stats.performance.avgSpeakingLevel / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-300">Students Practicing</span>
                    <span className="text-blue-400 font-semibold">
                      {stats.participation.studentsWithSpeakingSessions}
                    </span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(stats.participation.studentsWithSpeakingSessions / stats.summary.totalStudents) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-600">
                  <p className="text-slate-400 text-sm">
                    {stats.participation.totalSpeakingSessions} sessions completed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Badges & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Badges Earned */}
            <div className="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600 scale-in delay-3 glow-on-hover">
              <h2 className="text-xl font-bold text-white mb-4">🏆 Badges Earned</h2>
              <div className="space-y-2">
                {stats.badges.length > 0 ? (
                  stats.badges.map((badge) => (
                    <div key={badge.type} className="flex justify-between items-center p-3 bg-slate-600/30 rounded">
                      <span className="text-slate-300 capitalize">
                        {badge.type.replace(/_/g, ' ').toLowerCase()}
                      </span>
                      <span className="text-orange-400 font-bold text-lg">{badge.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400">No badges earned yet</p>
                )}
              </div>
            </div>

            {/* Recent Signups */}
            <div className="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600 scale-in delay-4 glow-on-hover">
              <h2 className="text-xl font-bold text-white mb-4">👤 Recent Signups</h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {stats.recentSignups.length > 0 ? (
                  stats.recentSignups.map((signup) => (
                    <div key={signup.id} className="p-3 bg-slate-600/30 rounded text-sm">
                      <div className="flex justify-between">
                        <span className="text-white font-semibold">{signup.name}</span>
                        <span className="text-slate-400 text-xs">
                          {new Date(signup.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-slate-400 text-xs mt-1">
                        📱 +91{signup.phone.slice(-4)} {signup.class && `• ${signup.class.name}`}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400">No signups yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600 fade-in-up delay-1 glow-on-hover">
            <h2 className="text-xl font-bold text-white mb-4">⭐ Top Performers</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-3 px-4 text-slate-300">Name</th>
                    <th className="text-left py-3 px-4 text-slate-300">Phone</th>
                    <th className="text-center py-3 px-4 text-slate-300">Level</th>
                    <th className="text-center py-3 px-4 text-slate-300">Accuracy</th>
                    <th className="text-center py-3 px-4 text-slate-300">Sessions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topPerformers.length > 0 ? (
                    stats.topPerformers.map((performer, idx) => (
                      <tr key={idx} className="border-b border-slate-600/50 hover:bg-slate-600/20">
                        <td className="py-3 px-4 text-white">{performer.name}</td>
                        <td className="py-3 px-4 text-slate-400">+91{performer.phone.slice(-4)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                            {performer.level}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded">
                            {(performer.accuracy * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-slate-300">{performer.sessions}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-3 px-4 text-center text-slate-400">
                        No performers yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center fade-in-up delay-2">
            <p className="text-slate-400 text-xs">
              Powered by <span className="font-semibold">Edvanta Intelligence System</span>
            </p>
            <p className="text-slate-500 text-xs mt-1">
              Last updated: {new Date(stats.timestamp).toLocaleString()}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
