'use client';

interface SchoolMetricsDisplayProps {
  schoolName: string;
  totalStudents: number;
  totalBadgesEarned: number;
  grandWizardCount: number;
  avgAccuracy: number;
  avgSessionsPerStudent: number;
  leaderboardRank: number;
  totalSchools: number;
}

export function SchoolMetricsDisplay({
  schoolName,
  totalStudents,
  totalBadgesEarned,
  grandWizardCount,
  avgAccuracy,
  avgSessionsPerStudent,
  leaderboardRank,
  totalSchools,
}: SchoolMetricsDisplayProps) {
  const percentile = Math.round(((totalSchools - leaderboardRank + 1) / totalSchools) * 100);

  return (
    <div className="space-y-6">
      {/* Header with School Name and Ranking */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-4xl font-bold mb-2">{schoolName}</h1>
        <p className="text-blue-100 mb-4">School-Level Achievement Dashboard</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-blue-100 text-sm">LEADERBOARD RANK</p>
            <p className="text-3xl font-bold">#{leaderboardRank}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">OUT OF</p>
            <p className="text-3xl font-bold">{totalSchools}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">PERCENTILE</p>
            <p className="text-3xl font-bold">{percentile}%</p>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Students */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Students Using WizLingo</h3>
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-4xl font-bold text-gray-900">{totalStudents}</p>
          <p className="text-sm text-gray-600 mt-2">Active learners</p>
        </div>

        {/* Total Badges Earned */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Total Badges Earned</h3>
            <span className="text-2xl">🏆</span>
          </div>
          <p className="text-4xl font-bold text-blue-600">{totalBadgesEarned}</p>
          <p className="text-sm text-gray-600 mt-2">School achievement milestone</p>
        </div>

        {/* Grand Wizards */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Grand Wizards</h3>
            <span className="text-2xl">✨</span>
          </div>
          <p className="text-4xl font-bold text-purple-600">{grandWizardCount}</p>
          <p className="text-sm text-gray-600 mt-2">Rarest achievement</p>
        </div>

        {/* Average Accuracy */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Average Accuracy</h3>
            <span className="text-2xl">🎯</span>
          </div>
          <p className="text-4xl font-bold text-orange-600">{avgAccuracy.toFixed(1)}%</p>
          <p className="text-sm text-gray-600 mt-2">Reading precision</p>
        </div>

        {/* Average Sessions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Avg Sessions/Student</h3>
            <span className="text-2xl">📚</span>
          </div>
          <p className="text-4xl font-bold text-green-600">{avgSessionsPerStudent.toFixed(1)}</p>
          <p className="text-sm text-gray-600 mt-2">Engagement metric</p>
        </div>

        {/* Achievement Rate */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Badge Rate</h3>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-4xl font-bold text-indigo-600">
            {totalStudents > 0 ? (totalBadgesEarned / totalStudents).toFixed(1) : 0}
          </p>
          <p className="text-sm text-gray-600 mt-2">Badges per student</p>
        </div>
      </div>

      {/* Achievement Highlights */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 School Achievement Highlights</h3>
        <ul className="space-y-3">
          <li className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span className="text-gray-700">
              <strong>{totalBadgesEarned}</strong> total badges earned by your students
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span className="text-gray-700">
              <strong>{grandWizardCount}</strong> students have achieved Grand Wizard status (rarest badge)
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span className="text-gray-700">
              School ranks <strong>#{leaderboardRank}</strong> nationally with <strong>{percentile}%</strong> percentile
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span className="text-gray-700">
              Average student accuracy of <strong>{avgAccuracy.toFixed(1)}%</strong> shows strong reading comprehension
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
