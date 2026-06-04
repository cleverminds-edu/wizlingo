'use client';

import { useState, useEffect } from 'react';
import { SchoolLeaderboardCard } from '@/components/schools/SchoolLeaderboardCard';

interface SchoolLeaderboardEntry {
  schoolId: string;
  schoolName: string;
  totalBadgesEarned: number;
  totalStudents: number;
  grandWizardCount: number;
  avgAccuracy: number;
  avgSessionsPerStudent: number;
  rank: number;
}

type SortOption = 'badges' | 'grandwizards' | 'accuracy' | 'growth';

export default function SchoolLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<SchoolLeaderboardEntry[]>([]);
  const [filteredLeaderboard, setFilteredLeaderboard] = useState<SchoolLeaderboardEntry[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('badges');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch leaderboard data
  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/school-metrics?type=all`);

        if (!response.ok) {
          throw new Error('Failed to fetch school leaderboard');
        }

        const data = await response.json();
        const entries = data.schools.map((school: any, index: number) => ({
          ...school,
          rank: index + 1,
        }));

        setLeaderboard(entries);
        setFilteredLeaderboard(entries);
        setError(null);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load school leaderboard');
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  // Update filtered results when sort or search changes
  useEffect(() => {
    let sorted = [...leaderboard];

    // Sort based on criteria
    switch (sortBy) {
      case 'grandwizards':
        sorted.sort((a, b) => {
          if (b.grandWizardCount !== a.grandWizardCount) {
            return b.grandWizardCount - a.grandWizardCount;
          }
          return b.totalBadgesEarned - a.totalBadgesEarned;
        });
        break;
      case 'accuracy':
        sorted.sort((a, b) => b.avgAccuracy - a.avgAccuracy);
        break;
      case 'growth':
        // Placeholder for growth sorting
        break;
      case 'badges':
      default:
        sorted.sort((a, b) => {
          if (b.totalBadgesEarned !== a.totalBadgesEarned) {
            return b.totalBadgesEarned - a.totalBadgesEarned;
          }
          return b.grandWizardCount - a.grandWizardCount;
        });
    }

    // Update ranks
    sorted = sorted.map((school, index) => ({
      ...school,
      rank: index + 1,
    }));

    // Filter by search term
    if (searchTerm) {
      sorted = sorted.filter((school) =>
        school.schoolName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLeaderboard(sorted);
  }, [leaderboard, sortBy, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🏆 School Leaderboards</h1>
          <p className="text-gray-600 text-lg">
            See how schools across India rank in WizLingo adoption and student achievement
          </p>
        </div>

        {/* Motivation Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 mb-8 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-2">🚀 School Competitive Achievement</h2>
          <p className="text-lg opacity-90">
            Watch your school climb the national rankings. More students + more badges = higher prestige.
            Share your school's success with your community!
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Schools
              </label>
              <input
                type="text"
                placeholder="Search by school name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="badges">Total Badges Earned</option>
                <option value="grandwizards">Grand Wizard Count (Rarest)</option>
                <option value="accuracy">Average Accuracy</option>
                <option value="growth">Monthly Growth</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading leaderboard...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-red-700">
            {error}
          </div>
        )}

        {/* Leaderboard Grid */}
        {!loading && !error && (
          <div>
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredLeaderboard.length} of {leaderboard.length} schools
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredLeaderboard.map((school) => (
                <SchoolLeaderboardCard
                  key={school.schoolId}
                  rank={school.rank}
                  schoolName={school.schoolName}
                  schoolId={school.schoolId}
                  totalBadgesEarned={school.totalBadgesEarned}
                  totalStudents={school.totalStudents}
                  grandWizardCount={school.grandWizardCount}
                  avgAccuracy={school.avgAccuracy}
                  avgSessionsPerStudent={school.avgSessionsPerStudent}
                />
              ))}
            </div>

            {filteredLeaderboard.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-600">No schools match your search criteria.</p>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 mb-3">📊 How We Rank Schools</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>✓ Primary: Total badges earned by all students</li>
              <li>✓ Secondary: Grand Wizard count (rarest badge)</li>
              <li>✓ Tertiary: Average student accuracy</li>
              <li>✓ Bonus: Monthly growth (new students joining)</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <h3 className="text-lg font-bold text-green-900 mb-3">🎯 School Benefits</h3>
            <ul className="text-sm text-green-800 space-y-2">
              <li>✨ Get recognized for student achievement</li>
              <li>✨ Attract more schools to the platform</li>
              <li>✨ Share rankings with your board/parents</li>
              <li>✨ Earn custom tiers and special recognition</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
