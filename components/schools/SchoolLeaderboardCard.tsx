'use client';

interface SchoolLeaderboardCardProps {
  rank: number;
  schoolName: string;
  schoolId: string;
  totalBadgesEarned: number;
  totalStudents: number;
  grandWizardCount: number;
  avgAccuracy: number;
  avgSessionsPerStudent: number;
}

export function SchoolLeaderboardCard({
  rank,
  schoolName,
  schoolId,
  totalBadgesEarned,
  totalStudents,
  grandWizardCount,
  avgAccuracy,
  avgSessionsPerStudent,
}: SchoolLeaderboardCardProps) {
  // Determine medal emoji based on rank
  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '🎖️';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{getMedalEmoji(rank)}</span>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{schoolName}</h3>
            <p className="text-sm text-gray-500">Rank #{rank}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Total Badges */}
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs font-semibold text-blue-600 mb-1">TOTAL BADGES</p>
          <p className="text-2xl font-bold text-blue-900">{totalBadgesEarned}</p>
        </div>

        {/* Grand Wizards */}
        <div className="bg-purple-50 rounded-lg p-3">
          <p className="text-xs font-semibold text-purple-600 mb-1">GRAND WIZARDS</p>
          <p className="text-2xl font-bold text-purple-900">{grandWizardCount}</p>
        </div>

        {/* Students */}
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs font-semibold text-green-600 mb-1">STUDENTS</p>
          <p className="text-2xl font-bold text-green-900">{totalStudents}</p>
        </div>

        {/* Accuracy */}
        <div className="bg-orange-50 rounded-lg p-3">
          <p className="text-xs font-semibold text-orange-600 mb-1">AVG ACCURACY</p>
          <p className="text-2xl font-bold text-orange-900">{avgAccuracy.toFixed(1)}%</p>
        </div>

        {/* Sessions per Student */}
        <div className="bg-pink-50 rounded-lg p-3">
          <p className="text-xs font-semibold text-pink-600 mb-1">AVG SESSIONS</p>
          <p className="text-2xl font-bold text-pink-900">{avgSessionsPerStudent.toFixed(1)}</p>
        </div>
      </div>

      {/* View Details Link */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <a
          href={`/schools/${schoolId}/details`}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-2"
        >
          View Details →
        </a>
      </div>
    </div>
  );
}
