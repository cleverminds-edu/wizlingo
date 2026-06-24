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

const StatCard = ({ label, value, unit = '', icon }: any) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900">
          {typeof value === 'number' ? value.toLocaleString() : value}
          <span className="text-lg text-gray-500 ml-2">{unit}</span>
        </p>
      </div>
      {icon && <div className="text-3xl">{icon}</div>}
    </div>
  </div>
);

export default function ManagerDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resetUserId, setResetUserId] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/manager/dashboard', {
        credentials: 'include'
      });

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
        body: JSON.stringify({
          userId: resetUserId,
          newPassword: resetPassword
        }),
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Image
              src="/wiziingo-logo.svg"
              alt="Loading"
              width={60}
              height={60}
            />
          </div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/wiziingo-logo.svg"
              alt="WizLingo"
              width={32}
              height={32}
            />
            <h1 className="text-2xl font-bold text-gray-900">Manager Portal</h1>
          </div>
          <button
            onClick={() => {
              fetch('/api/manager/logout', { method: 'POST', credentials: 'include' });
              router.push('/manager/login');
            }}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Summary Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Students"
              value={stats?.summary.totalStudents || 0}
              icon="👥"
            />
            <StatCard
              label="Total Schools"
              value={stats?.summary.totalSchools || 0}
              icon="🏫"
            />
            <StatCard
              label="New This Month"
              value={stats?.summary.studentsLast30Days || 0}
              icon="📈"
            />
            <StatCard
              label="Active (Last 7 Days)"
              value={stats?.summary.activeStudentsLast7Days || 0}
              unit="%"
              icon="⚡"
            />
          </div>
        </div>

        {/* Session Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Activity</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Total Reading Sessions"
              value={stats?.sessions.totalReadingSessions || 0}
              icon="📖"
            />
            <StatCard
              label="Total Speaking Sessions"
              value={stats?.sessions.totalSpeakingSessions || 0}
              icon="🎤"
            />
            <StatCard
              label="Engagement Rate"
              value={stats?.summary.engagementRate || '0'}
              unit="%"
              icon="📊"
            />
          </div>
        </div>

        {/* User Distribution */}
        {stats?.studentsByType && stats.studentsByType.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">User Distribution</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="grid grid-cols-2 gap-4">
                {stats.studentsByType.map(item => (
                  <div key={item.type} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">
                      {item.type === 'PUBLIC' ? '🌐 B2C (Public)' : '🏢 B2B (School)'}
                    </span>
                    <span className="text-2xl font-bold text-blue-600">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Password Reset Section */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🔐 Reset User Password</h3>
            <p className="text-sm text-gray-600 mb-4">
              Available users: <span className="font-mono bg-gray-100 px-2 py-1 rounded">WL214837</span> (Akshit), <span className="font-mono bg-gray-100 px-2 py-1 rounded">WL194299</span> (Mamta Rao)
            </p>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User ID (e.g., WL214837 or WL194299)
                </label>
                <input
                  type="text"
                  value={resetUserId}
                  onChange={(e) => setResetUserId(e.target.value)}
                  placeholder="WL214837"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password (min 8 chars)
                </label>
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
                className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {resetting ? 'Resetting...' : 'Reset Password'}
              </button>
              {resetMessage && (
                <p className={`text-sm p-3 rounded-lg ${
                  resetMessage.includes('✅')
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}>
                  {resetMessage}
                </p>
              )}
            </form>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">⚙️ Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition font-medium text-blue-700">
                📊 View All Users
              </button>
              <button className="w-full p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition font-medium text-purple-700">
                🏫 Manage Schools
              </button>
              <button className="w-full p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition font-medium text-green-700">
                📈 Export Reports
              </button>
              <button className="w-full p-4 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition font-medium text-orange-700">
                ⚙️ System Settings
              </button>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        {stats?.topPerformers && stats.topPerformers.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">⭐ Top Performers</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">User ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Level</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Sessions</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topPerformers.map((performer, idx) => (
                    <tr key={performer.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-blue-600">{performer.userId || performer.id}</td>
                      <td className="py-3 px-4 text-gray-900">{performer.name || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          performer.type === 'PUBLIC'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {performer.type === 'PUBLIC' ? 'B2C' : 'B2B'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-gray-900">{performer.level}</td>
                      <td className="py-3 px-4 text-center text-gray-600">{performer.sessions}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-medium ${
                          performer.accuracy >= 85 ? 'text-green-600' :
                          performer.accuracy >= 70 ? 'text-yellow-600' : 'text-gray-600'
                        }`}>
                          {performer.accuracy.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
