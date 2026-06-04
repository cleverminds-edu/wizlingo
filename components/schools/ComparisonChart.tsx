'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ComparisonSchool {
  schoolName: string;
  totalBadgesEarned: number;
  grandWizardCount: number;
  avgAccuracy: number;
}

interface ComparisonChartProps {
  mainSchool: ComparisonSchool;
  rivals: ComparisonSchool[];
}

export function ComparisonChart({ mainSchool, rivals }: ComparisonChartProps) {
  const data = [mainSchool, ...rivals].map((school) => ({
    name: school.schoolName.split(' ').slice(0, 2).join(' '), // Shorten names for chart
    badges: school.totalBadgesEarned,
    wizards: school.grandWizardCount,
    accuracy: Math.round(school.avgAccuracy),
  }));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">School Comparison</h3>

      {/* Badges Comparison */}
      <div className="mb-8">
        <h4 className="font-semibold text-gray-700 mb-4">Total Badges Earned</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="badges" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Grand Wizards Comparison */}
      <div className="mb-8">
        <h4 className="font-semibold text-gray-700 mb-4">Grand Wizard Count</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="wizards" fill="#a855f7" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Accuracy Comparison */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-4">Average Reading Accuracy (%)</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="accuracy" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
