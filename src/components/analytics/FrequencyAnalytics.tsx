'use client';

import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line 
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Calendar, Clock } from 'lucide-react';
import { AnalyticsService, FrequencyAnalytics } from '@/lib/analytics';
import { ConsumptionSession } from '@/types/consumption';
import StreakHeatmap from './StreakHeatmap';

interface FrequencyAnalyticsProps {
  sessions: ConsumptionSession[];
}

const FrequencyAnalyticsComponent: React.FC<FrequencyAnalyticsProps> = ({ sessions }) => {
  const analytics = useMemo(() => 
    AnalyticsService.calculateFrequencyAnalytics(sessions), 
    [sessions]
  );

  const weeklyTrendData = useMemo(() => 
    AnalyticsService.getRecentWeeklyTrend(sessions, 12), 
    [sessions]
  );

  const monthlyTrendData = useMemo(() => 
    AnalyticsService.getRecentMonthlyTrend(sessions, 12), 
    [sessions]
  );

  const streaksData = useMemo(() => 
    AnalyticsService.calculateStreaksAndGaps(sessions), 
    [sessions]
  );

  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return 'text-green-600 bg-green-50';
      case 'decreasing':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-500">Log some consumption sessions to see frequency analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Weekly Average</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.weekly.overallWeeklyAverage}
              </p>
              <p className="text-xs text-gray-500">sessions per week</p>
            </div>
            <div className={`p-2 rounded-full ${getTrendColor(analytics.weekly.weeklyTrend)}`}>
              {getTrendIcon(analytics.weekly.weeklyTrend)}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Average</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.monthly.overallMonthlyAverage}
              </p>
              <p className="text-xs text-gray-500">sessions per month</p>
            </div>
            <div className={`p-2 rounded-full ${getTrendColor(analytics.monthly.monthlyTrend)}`}>
              {getTrendIcon(analytics.monthly.monthlyTrend)}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Streak</p>
              <p className="text-2xl font-bold text-gray-900">
                {streaksData.currentStreak}
              </p>
              <p className="text-xs text-gray-500">consecutive days</p>
            </div>
            <div className="p-2 rounded-full bg-blue-50 text-blue-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.totalSessions}
              </p>
              <p className="text-xs text-gray-500">
                over {analytics.weekly.totalWeeks} weeks
              </p>
            </div>
            <div className="p-2 rounded-full bg-purple-50 text-purple-600">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Current vs Last Period Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Comparison</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">This Week</span>
              <span className="text-lg font-semibold text-gray-900">
                {analytics.weekly.currentWeekSessions} sessions
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Last Week</span>
              <span className="text-lg font-semibold text-gray-900">
                {analytics.weekly.lastWeekSessions} sessions
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2">
                {getTrendIcon(analytics.weekly.weeklyTrend)}
                <span className={`text-sm font-medium ${
                  analytics.weekly.weeklyTrend === 'increasing' ? 'text-green-600' :
                  analytics.weekly.weeklyTrend === 'decreasing' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {analytics.weekly.weeklyTrend === 'increasing' ? 'Increasing' :
                   analytics.weekly.weeklyTrend === 'decreasing' ? 'Decreasing' : 'Stable'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Comparison</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">This Month</span>
              <span className="text-lg font-semibold text-gray-900">
                {analytics.monthly.currentMonthSessions} sessions
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Last Month</span>
              <span className="text-lg font-semibold text-gray-900">
                {analytics.monthly.lastMonthSessions} sessions
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2">
                {getTrendIcon(analytics.monthly.monthlyTrend)}
                <span className={`text-sm font-medium ${
                  analytics.monthly.monthlyTrend === 'increasing' ? 'text-green-600' :
                  analytics.monthly.monthlyTrend === 'decreasing' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {analytics.monthly.monthlyTrend === 'increasing' ? 'Increasing' :
                   analytics.monthly.monthlyTrend === 'decreasing' ? 'Decreasing' : 'Stable'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Trend Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sessions Per Week (Last 12 Weeks)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value) => [`${value} sessions`, 'Sessions']}
                labelStyle={{ fontSize: '12px' }}
              />
              <Bar 
                dataKey="sessions" 
                fill="#10b981" 
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sessions Per Month (Last 12 Months)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value) => [`${value} sessions`, 'Sessions']}
                labelStyle={{ fontSize: '12px' }}
              />
              <Line 
                type="monotone" 
                dataKey="sessions" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Streaks and Gaps Analysis */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Streaks & Patterns</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{streaksData.currentStreak}</p>
            <p className="text-sm text-gray-600">Current Streak (days)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{streaksData.longestStreak}</p>
            <p className="text-sm text-gray-600">Longest Streak (days)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{streaksData.longestGap}</p>
            <p className="text-sm text-gray-600">Longest Gap (days)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{streaksData.averageGap}</p>
            <p className="text-sm text-gray-600">Average Gap (days)</p>
          </div>
        </div>
      </div>

      {/* Visual Streak Heatmap */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Consumption Heatmap</h3>
        <StreakHeatmap sessions={sessions} weeks={20} />
      </div>
    </div>
  );
};

export default FrequencyAnalyticsComponent;
