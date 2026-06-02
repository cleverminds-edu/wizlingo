'use client';

import { useState, useEffect } from 'react';
import type { LeaderboardType } from '@/app/generated/prisma/client';
import Leaderboard from '@/components/Leaderboard';
import { useRouter } from 'next/navigation';

export default function StudentLeaderboardsPage() {
  const router = useRouter();
  const [classId, setClassId] = useState<string | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalBadges: number;
    totalSessions: number;
    avgAccuracy: number;
    avgFluency: number;
  }>({
    totalBadges: 0,
    totalSessions: 0,
    avgAccuracy: 0,
    avgFluency: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get student ID from localStorage
    const storedStudentId = localStorage.getItem('studentId');
    if (!storedStudentId) {
      router.push('/auth/student');
      return;
    }

    setStudentId(storedStudentId);
    fetchStudentInfo();
  }, [router]);

  const fetchStudentInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/student/profile');
      if (response.ok) {
        const data = await response.json();
        setClassId(data.classId);
        setSchoolId(data.schoolId);
        setStats({
          totalBadges: data.badgeCount || 0,
          totalSessions: data.sessionCount || 0,
          avgAccuracy: data.avgAccuracy || 0,
          avgFluency: data.avgFluency || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch student info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your leaderboard stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Your Leaderboard Performance</h1>
          <p className="text-gray-600">Track your rankings across all competition types</p>
        </div>

        {/* Personal Stats Card */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-8 mb-8 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Your Stats</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white bg-opacity-20 backdrop-blur rounded-lg p-4">
              <p className="text-sm opacity-90">Total Badges</p>
              <p className="text-3xl font-bold">{stats.totalBadges}</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur rounded-lg p-4">
              <p className="text-sm opacity-90">Sessions Done</p>
              <p className="text-3xl font-bold">{stats.totalSessions}</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur rounded-lg p-4">
              <p className="text-sm opacity-90">Avg Accuracy</p>
              <p className="text-3xl font-bold">{Math.round(stats.avgAccuracy)}%</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur rounded-lg p-4">
              <p className="text-sm opacity-90">Avg Fluency</p>
              <p className="text-3xl font-bold">{Math.round(stats.avgFluency)}%</p>
            </div>
          </div>
        </div>

        {/* Class Leaderboards */}
        {classId && (
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                👥 Your Class Rankings
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Badge Count */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <Leaderboard
                    type={'BADGE_COUNT' as LeaderboardType}
                    scope="class"
                    classId={classId || undefined}
                    limit={10}
                    title="📚 Badge Collection"
                  />
                </div>

                {/* Consistency */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <Leaderboard
                    type={'CONSISTENCY' as LeaderboardType}
                    scope="class"
                    classId={classId || undefined}
                    limit={10}
                    title="🔥 Consistency King"
                  />
                </div>

                {/* Accuracy */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <Leaderboard
                    type={'ACCURACY' as LeaderboardType}
                    scope="class"
                    classId={classId || undefined}
                    limit={10}
                    title="🎯 Accuracy Master"
                  />
                </div>

                {/* Fluency */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <Leaderboard
                    type={'FLUENCY' as LeaderboardType}
                    scope="class"
                    classId={classId || undefined}
                    limit={10}
                    title="🎤 Fluency Pro"
                  />
                </div>

                {/* Speed */}
                <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
                  <Leaderboard
                    type={'SPEED' as LeaderboardType}
                    scope="class"
                    classId={classId || undefined}
                    limit={10}
                    title="⚡ Speed Champion"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* School Leaderboards */}
        {schoolId && (
          <div className="space-y-8 mt-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                🏫 School-wide Rankings
              </h3>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
                <p className="text-sm text-blue-800">
                  💡 Compete with all students in your school! Can you reach the top?
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Badge Count */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <Leaderboard
                    type={'BADGE_COUNT' as LeaderboardType}
                    scope="school"
                    schoolId={schoolId || undefined}
                    limit={10}
                    title="📚 Badge Collection"
                  />
                </div>

                {/* Consistency */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <Leaderboard
                    type={'CONSISTENCY' as LeaderboardType}
                    scope="school"
                    schoolId={schoolId || undefined}
                    limit={10}
                    title="🔥 Consistency King"
                  />
                </div>

                {/* Accuracy */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <Leaderboard
                    type={'ACCURACY' as LeaderboardType}
                    scope="school"
                    schoolId={schoolId || undefined}
                    limit={10}
                    title="🎯 Accuracy Master"
                  />
                </div>

                {/* Fluency */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <Leaderboard
                    type={'FLUENCY' as LeaderboardType}
                    scope="school"
                    schoolId={schoolId || undefined}
                    limit={10}
                    title="🎤 Fluency Pro"
                  />
                </div>

                {/* Speed */}
                <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
                  <Leaderboard
                    type={'SPEED' as LeaderboardType}
                    scope="school"
                    schoolId={schoolId || undefined}
                    limit={10}
                    title="⚡ Speed Champion"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-12 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-8 border border-purple-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">💪 Tips to Climb the Leaderboard</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="font-semibold mb-2">📚 For Badge Collection</p>
              <p>Complete reading and speaking sessions to earn badges!</p>
            </div>
            <div>
              <p className="font-semibold mb-2">⚡ For Speed Champion</p>
              <p>Focus on earning your SPARK badge early in the semester!</p>
            </div>
            <div>
              <p className="font-semibold mb-2">🔥 For Consistency</p>
              <p>Practice every day! More sessions = higher rank</p>
            </div>
            <div>
              <p className="font-semibold mb-2">🎯 For Accuracy</p>
              <p>Read carefully and ensure correct word pronunciation</p>
            </div>
            <div>
              <p className="font-semibold mb-2">🎤 For Fluency</p>
              <p>Practice speaking with the AI regularly!</p>
            </div>
            <div>
              <p className="font-semibold mb-2">🏆 General Tip</p>
              <p>Help your classmates and celebrate wins together!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
