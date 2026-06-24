'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface DashboardStats {
  success: boolean;
  summary: {
    totalStudents: number;
    totalSchools: number;
    studentsLast30Days: number;
    studentsLast7Days: number;
    studentsLast24h: number;
    activeStudentsLast7Days: number;
    engagementRate: string;
  };
  sessions: {
    totalReadingSessions: number;
    totalSpeakingSessions: number;
  };
  studentsByType: Array<{ type: string; count: number }>;
  topPerformers: Array<{
    id: string;
    userId: string;
    name: string;
    phone: string;
    type: string;
    level: number;
    sessions: number;
    accuracy: number;
  }>;
}

const StatCard = ({ label, value, unit = '', icon, color = 'blue' }: any) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-100 p-5 hover:shadow-lg transition">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">{label}</p>
          <p className="text-4xl font-bold text-gray-900 mb-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {unit && <p className="text-sm text-gray-500">{unit}</p>}
        </div>
        {icon && <div className={`text-4xl p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>{icon}</div>}
      </div>
    </div>
  );
};

export default function ManagerDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetUserId, setResetUserId] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/manager/dashboard', { credentials: 'include' });
      if (res.status === 401) {
        router.push('/manager/login');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUserId || !resetPassword) {
      setResetMessage('Please fill all fields');
      return;
    }

    setResetting(true);
    setResetMessage('');

    try {
      const res = await fetch('/api/manager/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: resetUserId, newPassword: resetPassword }),
        credentials: 'include'
      });

      const data = await res.json();
      if (res.ok) {
        setResetMessage(`✅ ${data.message}`);
        setResetUserId('');
        setResetPassword('');
      } else {
        setResetMessage(`❌ ${data.error || 'Failed to reset password'}`);
      }
    } catch (err) {
      setResetMessage('❌ Error resetting password');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Image src="/wiziingo-logo.svg" alt="Loading" width={80} height={80} />
          </div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const totalSessions = (stats?.sessions.totalReadingSessions || 0) + (stats?.sessions.totalSpeakingSessions || 0);
  const b2cUsers = stats?.studentsByType.find(s => s.type === 'PUBLIC')?.count || 0;
  const b2bUsers = stats?.studentsByType.find(s => s.type === 'SCHOOL')?.count || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16">
                <Image
                  src="/wiziingo-logo.svg"
                  alt="WizLingo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">WizLingo Manager</h1>
                <p className="text-sm text-gray-500">Platform Analytics & Management</p>
              </div>
            </div>
            <button
              onClick={() => {
                fetch('/api/manager/logout', { method: 'POST', credentials: 'include' });
                router.push('/manager/login');
              }}
              className="px-5 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Key Metrics Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Platform Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Students" value={stats?.summary.totalStudents || 0} icon="👥" color="blue" />
            <StatCard label="Total Schools" value={stats?.summary.totalSchools || 0} icon="🏫" color="purple" />
            <StatCard label="Active (7 Days)" value={stats?.summary.activeStudentsLast7Days || 0} icon="⚡" color="green" />
            <StatCard label="Engagement" value={stats?.summary.engagementRate || '0'} unit="%" icon="📈" color="orange" />
          </div>
        </div>

        {/* Growth & New Users */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 Growth Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="New Last 24h" value={stats?.summary.studentsLast24h || 0} icon="🌟" color="green" />
            <StatCard label="New Last 7 Days" value={stats?.summary.studentsLast7Days || 0} icon="📅" color="blue" />
            <StatCard label="New Last 30 Days" value={stats?.summary.studentsLast30Days || 0} icon="📊" color="purple" />
          </div>
        </div>

        {/* User Distribution & Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* User Types */}
          <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">👥 User Distribution</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">🌐 B2C Users (Public)</p>
                  <p className="text-sm text-gray-500">Individual sign-ups</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">{b2cUsers}</p>
                  <p className="text-xs text-gray-500">{((b2cUsers / (stats?.summary.totalStudents || 1)) * 100).toFixed(1)}%</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">🏢 B2B Users (Schools)</p>
                  <p className="text-sm text-gray-500">School-based students</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-600">{b2bUsers}</p>
                  <p className="text-xs text-gray-500">{((b2bUsers / (stats?.summary.totalStudents || 1)) * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Session Analytics */}
          <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📚 Session Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">📖 Reading Sessions</p>
                  <p className="text-sm text-gray-500">Total completed</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-orange-600">{stats?.sessions.totalReadingSessions || 0}</p>
                  <p className="text-xs text-gray-500">
                    {((stats?.sessions.totalReadingSessions || 0) / (totalSessions || 1) * 100).toFixed(1)}% of total
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">🎤 Speaking Sessions</p>
                  <p className="text-sm text-gray-500">Total completed</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-purple-600">{stats?.sessions.totalSpeakingSessions || 0}</p>
                  <p className="text-xs text-gray-500">
                    {((stats?.sessions.totalSpeakingSessions || 0) / (totalSessions || 1) * 100).toFixed(1)}% of total
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        {stats?.topPerformers && stats.topPerformers.length > 0 && (
          <div className="bg-white rounded-lg shadow border border-gray-100 p-6 mb-10">
            <h3 className="text-lg font-bold text-gray-900 mb-4">⭐ Top Performers (Last 7 Days)</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Rank</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">User ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Type</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Level</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Sessions</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topPerformers.map((performer, idx) => (
                    <tr key={performer.id} className="border-b border-gray-100 hover:bg-blue-50 transition">
                      <td className="py-3 px-4 font-bold text-gray-900">#{idx + 1}</td>
                      <td className="py-3 px-4 font-mono text-blue-600 font-medium">{performer.userId}</td>
                      <td className="py-3 px-4 text-gray-900">{performer.name || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          performer.type === 'PUBLIC'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {performer.type === 'PUBLIC' ? '🌐 B2C' : '🏢 B2B'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-gray-900">Level {performer.level}</td>
                      <td className="py-3 px-4 text-center text-gray-600 font-medium">{performer.sessions}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-bold ${
                          performer.accuracy >= 85 ? 'text-green-600' :
                          performer.accuracy >= 70 ? 'text-yellow-600' : 'text-gray-600'
                        }`}>
                          {performer.accuracy.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Management Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Password Reset */}
          <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🔐 Reset User Password</h3>
            <p className="text-sm text-gray-600 mb-4">
              Quick access users: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">WL214837</span> (Akshit), <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">WL194299</span> (Mamta Rao)
            </p>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">User ID (e.g., WL214837)</label>
                <input
                  type="text"
                  value={resetUserId}
                  onChange={(e) => setResetUserId(e.target.value.toUpperCase())}
                  placeholder="WL214837"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password (min 8 chars)</label>
                <input
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={resetting}
                className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {resetting ? 'Resetting...' : 'Reset Password'}
              </button>
              {resetMessage && (
                <p className={`text-sm p-3 rounded-lg ${
                  resetMessage.includes('✅')
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {resetMessage}
                </p>
              )}
            </form>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Quick Insights</h3>
            <div className="space-y-3">
              <div className="flex items-start p-3 bg-blue-50 rounded-lg">
                <span className="text-2xl mr-3">📱</span>
                <div>
                  <p className="font-semibold text-gray-900">Avg Sessions per User</p>
                  <p className="text-lg font-bold text-blue-600">
                    {((totalSessions || 0) / (stats?.summary.totalStudents || 1)).toFixed(1)}
                  </p>
                </div>
              </div>
              <div className="flex items-start p-3 bg-green-50 rounded-lg">
                <span className="text-2xl mr-3">🎯</span>
                <div>
                  <p className="font-semibold text-gray-900">Conversion Rate (7 days)</p>
                  <p className="text-lg font-bold text-green-600">
                    {((stats?.summary.activeStudentsLast7Days || 0) / (stats?.summary.totalStudents || 1) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="flex items-start p-3 bg-purple-50 rounded-lg">
                <span className="text-2xl mr-3">🚀</span>
                <div>
                  <p className="font-semibold text-gray-900">Growth (Last 30 Days)</p>
                  <p className="text-lg font-bold text-purple-600">
                    {stats?.summary.studentsLast30Days || 0} new users
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
