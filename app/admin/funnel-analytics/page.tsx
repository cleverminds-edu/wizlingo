'use client';

import React, { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Users, Share2, Target } from 'lucide-react';

interface FunnelStats {
  share: number;
  landingClick: number;
  landingView: number;
  signupStart: number;
  signupComplete: number;
  shareToClickRate: string | number;
  clickToSignupRate: string | number;
  signupStartToCompleteRate: string | number;
  overallConversionRate: string | number;
}

interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  completionRate: string | number;
}

interface AnalyticsData {
  funnel: FunnelStats;
  referrals: ReferralStats;
  dropoff: {
    shareDropoff: number;
    clickDropoff: number;
    signupStartDropoff: number;
    signupCompleteDropoff: number;
    overallConversion: number;
  };
}

export default function FunnelAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7days');

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const now = new Date();
        let startDate = new Date();

        // Set date range based on selection
        if (dateRange === '7days') {
          startDate.setDate(startDate.getDate() - 7);
        } else if (dateRange === '30days') {
          startDate.setDate(startDate.getDate() - 30);
        } else if (dateRange === '90days') {
          startDate.setDate(startDate.getDate() - 90);
        }

        const response = await fetch(
          `/api/analytics/funnel?startDate=${startDate.toISOString()}&endDate=${now.toISOString()}`
        );

        if (!response.ok) throw new Error('Failed to fetch analytics');

        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [dateRange]);

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const funnelData = [
    { stage: 'Share', count: analytics.funnel.share },
    { stage: 'Landing Click', count: analytics.funnel.landingClick },
    { stage: 'Signup Start', count: analytics.funnel.signupStart },
    { stage: 'Signup Complete', count: analytics.funnel.signupComplete },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Conversion Funnel Analytics
          </h1>
          <p className="text-gray-600">
            Track badge shares, landing page views, and signup conversions
          </p>
        </div>

        {/* Date range selector */}
        <div className="mb-8 flex gap-4">
          {['7days', '30days', '90days'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                dateRange === range
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {range === '7days' ? 'Last 7 Days' : range === '30days' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Shares */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">Total Shares</h3>
              <Share2 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {analytics.funnel.share}
            </div>
            <p className="text-xs text-gray-500">Badge shares initiated</p>
          </div>

          {/* Overall Conversion Rate */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">Conversion Rate</h3>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {Number(analytics.funnel.overallConversionRate).toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500">Share to signup completion</p>
          </div>

          {/* Referral Success */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">Referral Completions</h3>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {analytics.referrals.completedReferrals}
            </div>
            <p className="text-xs text-gray-500">{analytics.referrals.completionRate}% completion rate</p>
          </div>

          {/* Avg Click Rate */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">Click Rate</h3>
              <Target className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {Number(analytics.funnel.shareToClickRate).toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500">Share to landing click</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Funnel Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Conversion Funnel</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Conversion Rates */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Conversion Rates by Stage</h2>
            <div className="space-y-6">
              {[
                {
                  label: 'Share → Landing Click',
                  value: analytics.funnel.shareToClickRate,
                  color: 'bg-blue-500',
                },
                {
                  label: 'Landing Click → Signup Start',
                  value: analytics.funnel.clickToSignupRate,
                  color: 'bg-purple-500',
                },
                {
                  label: 'Signup Start → Completion',
                  value: analytics.funnel.signupStartToCompleteRate,
                  color: 'bg-green-500',
                },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      {item.label}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {Number(item.value).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all`}
                      style={{
                        width: `${Number(item.value)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Funnel Details */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Funnel Details</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Total Shares</span>
                <span className="font-bold text-gray-900">{analytics.funnel.share}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <span className="text-gray-700">Landing Views</span>
                <span className="font-bold text-gray-900">{analytics.funnel.landingView}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <span className="text-gray-700">Signup Starts</span>
                <span className="font-bold text-gray-900">{analytics.funnel.signupStart}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span className="text-gray-700">Signup Completions</span>
                <span className="font-bold text-gray-900">{analytics.funnel.signupComplete}</span>
              </div>
            </div>
          </div>

          {/* Referral Stats */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Referral Program</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Total Referrals</span>
                <span className="font-bold text-gray-900">{analytics.referrals.totalReferrals}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span className="text-gray-700">Completed Referrals</span>
                <span className="font-bold text-gray-900">{analytics.referrals.completedReferrals}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                <span className="text-gray-700">Pending Referrals</span>
                <span className="font-bold text-gray-900">{analytics.referrals.pendingReferrals}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <span className="text-gray-700">Completion Rate</span>
                <span className="font-bold text-gray-900">{Number(analytics.referrals.completionRate).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
