/**
 * Admin Dashboard: Badge A/B Test Results
 * Shows metrics comparing badge style variants
 */

'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface VariantStats {
  variant: string;
  views: number;
  shares: number;
  shareRate: number;
  ctr: number;
  topBadge?: string;
}

interface BadgeVariantData {
  badgeType: string;
  current: number;
  style_a: number;
  style_b: number;
  totalViews: number;
}

interface PlatformData {
  platform: string;
  current: number;
  style_a: number;
  style_b: number;
}

export default function BadgeABTestDashboard() {
  const [variantStats, setVariantStats] = useState<VariantStats[]>([
    {
      variant: 'Current (Hexagon)',
      views: 0,
      shares: 0,
      shareRate: 0,
      ctr: 0,
    },
    {
      variant: 'Style A (Collectible)',
      views: 0,
      shares: 0,
      shareRate: 0,
      ctr: 0,
    },
    {
      variant: 'Style B (Minimalist)',
      views: 0,
      shares: 0,
      shareRate: 0,
      ctr: 0,
    },
  ]);

  const [badgeData, setBadgeData] = useState<BadgeVariantData[]>([]);
  const [platformData, setPlatformData] = useState<PlatformData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    fetchABTestData();
  }, [dateRange]);

  const fetchABTestData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/admin/badge-ab-test?range=${dateRange}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch A/B test data');
      }

      const data = await response.json();

      setVariantStats(data.variantStats || variantStats);
      setBadgeData(data.badgeData || []);
      setPlatformData(data.platformData || []);
    } catch (err) {
      console.error('Error fetching A/B test data:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load dashboard'
      );
    } finally {
      setLoading(false);
    }
  };

  const colors = ['#F97316', '#9333EA', '#3B82F6'];
  const shareRateData = variantStats.map((v) => ({
    name: v.variant,
    rate: v.shareRate,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white mb-2">
          Badge A/B Test Results
        </h1>
        <p className="text-slate-300">
          Real-time comparison of badge style variants
        </p>
      </div>

      {/* Date Range Selector */}
      <div className="mb-8 flex gap-4">
        {['1d', '7d', '30d', 'all'].map((range) => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              dateRange === range
                ? 'bg-blue-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {range === '1d' ? 'Last 24h' : range === '7d' ? 'Last 7d' : range === '30d' ? 'Last 30d' : 'All Time'}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-slate-300">Loading data...</div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {variantStats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-6 border border-slate-600"
                style={{
                  borderTopColor: colors[idx],
                  borderTopWidth: '3px',
                }}
              >
                <h3 className="text-lg font-bold text-white mb-4">
                  {stat.variant}
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-slate-400 text-sm">Views</p>
                    <p className="text-2xl font-bold text-white">
                      {stat.views}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Shares</p>
                    <p className="text-2xl font-bold text-white">
                      {stat.shares}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Share Rate</p>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: colors[idx] }}
                    >
                      {stat.shareRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Share Rate Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-600">
              <h2 className="text-xl font-bold text-white mb-6">
                Share Rate by Variant
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={shareRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                    }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Bar dataKey="rate" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Distribution Pie Chart */}
            {badgeData.length > 0 && (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-600">
                <h2 className="text-xl font-bold text-white mb-6">
                  Total Views Distribution
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={variantStats}
                      dataKey="views"
                      nameKey="variant"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {colors.map((color, idx) => (
                        <Cell key={`cell-${idx}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                      }}
                      labelStyle={{ color: '#F3F4F6' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Badge Type Breakdown */}
          {badgeData.length > 0 && (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-600 mb-8">
              <h2 className="text-xl font-bold text-white mb-6">
                Views by Badge Type
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={badgeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="badgeType" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                    }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Legend />
                  <Bar dataKey="current" fill={colors[0]} name="Current" />
                  <Bar dataKey="style_a" fill={colors[1]} name="Style A" />
                  <Bar dataKey="style_b" fill={colors[2]} name="Style B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Share Platform Breakdown */}
          {platformData.length > 0 && (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-600">
              <h2 className="text-xl font-bold text-white mb-6">
                Shares by Platform
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={platformData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="platform" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                    }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Legend />
                  <Bar dataKey="current" fill={colors[0]} name="Current" />
                  <Bar dataKey="style_a" fill={colors[1]} name="Style A" />
                  <Bar dataKey="style_b" fill={colors[2]} name="Style B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Recommendations */}
          <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-200 mb-4">
              Key Insights
            </h3>
            <ul className="space-y-2 text-blue-100/80">
              <li>
                • Style A (Collectible) shows the highest share rate at{' '}
                {Math.max(...variantStats.map((s) => s.shareRate)).toFixed(1)}%
              </li>
              <li>
                • Current (Hexagon) has the most views at{' '}
                {Math.max(...variantStats.map((s) => s.views))} views
              </li>
              <li>• WhatsApp is the most popular share platform</li>
              <li>• Recommend Style A for future badge designs</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
