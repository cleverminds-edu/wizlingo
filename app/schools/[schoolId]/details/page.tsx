'use client';

import { useState, useEffect } from 'react';
import { SchoolMetricsDisplay } from '@/components/schools/SchoolMetricsDisplay';
import type { SchoolMetrics } from '@/lib/school-analytics';

interface SchoolDetails {
  metrics: SchoolMetrics;
  schoolName: string;
}

export default function SchoolDetailsPage({ params }: { params: { schoolId: string } }) {
  const { schoolId } = params;
  const [schoolDetails, setSchoolDetails] = useState<SchoolDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSchoolDetails() {
      try {
        setLoading(true);

        // Fetch metrics for this school
        const response = await fetch(`/api/admin/school-metrics?schoolId=${schoolId}&type=metrics`);
        if (!response.ok) {
          throw new Error('Failed to fetch school metrics');
        }

        const metrics = await response.json();

        // TODO: Fetch school name from database or API
        // For now, we'll use a placeholder
        const schoolName = `School ${schoolId.substring(0, 8).toUpperCase()}`;

        setSchoolDetails({
          metrics,
          schoolName,
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching school details:', err);
        setError('Failed to load school details');
      } finally {
        setLoading(false);
      }
    }

    fetchSchoolDetails();
  }, [schoolId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Loading school details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!schoolDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-gray-600">School not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Link */}
        <a
          href="/schools/leaderboard"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6"
        >
          ← Back to Leaderboard
        </a>

        {/* Metrics Display */}
        <SchoolMetricsDisplay
          schoolName={schoolDetails.schoolName}
          totalStudents={schoolDetails.metrics.totalStudents}
          totalBadgesEarned={schoolDetails.metrics.totalBadgesEarned}
          grandWizardCount={schoolDetails.metrics.grandWizardCount}
          avgAccuracy={schoolDetails.metrics.avgAccuracy}
          avgSessionsPerStudent={schoolDetails.metrics.avgSessionsPerStudent}
          leaderboardRank={schoolDetails.metrics.leaderboardRank}
          totalSchools={schoolDetails.metrics.totalLeaderboardRanks}
        />

        {/* Additional Sections */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                👥 View Student Details
              </button>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                📊 Download Report
              </button>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                🔗 Share with Principal
              </button>
            </div>
          </div>

          {/* School Stats Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📈 Key Insights</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-xl">📚</span>
                <span>
                  {schoolDetails.metrics.avgSessionsPerStudent.toFixed(1)} sessions per student on average
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-xl">🎯</span>
                <span>
                  {schoolDetails.metrics.avgAccuracy.toFixed(1)}% reading accuracy across school
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <span>
                  {schoolDetails.metrics.monthlyGrowth} new students joined this month
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <span>
                  Ranked #{schoolDetails.metrics.leaderboardRank} out of{' '}
                  {schoolDetails.metrics.totalLeaderboardRanks} schools
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Next Steps Section */}
        <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">🚀 Next Steps to Climb the Ranks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded p-4">
              <p className="font-semibold text-gray-900 mb-2">Expand to More Classes</p>
              <p className="text-sm text-gray-600">
                Add more classes to increase total student count and badge earning potential
              </p>
            </div>
            <div className="bg-white rounded p-4">
              <p className="font-semibold text-gray-900 mb-2">Encourage Daily Engagement</p>
              <p className="text-sm text-gray-600">
                More sessions per student = higher accuracy and faster badge progression
              </p>
            </div>
            <div className="bg-white rounded p-4">
              <p className="font-semibold text-gray-900 mb-2">Focus on Grand Wizard Badge</p>
              <p className="text-sm text-gray-600">
                This is the rarest badge. Highlight achievements to motivate students
              </p>
            </div>
            <div className="bg-white rounded p-4">
              <p className="font-semibold text-gray-900 mb-2">Share School Success</p>
              <p className="text-sm text-gray-600">
                Use these metrics in school newsletters and board presentations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
