import React, { useMemo } from 'react';
import { ConsumptionSession } from '@/types/consumption';
import { AnalyticsService } from '@/lib/analytics';
import {
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Flame,
  BarChart3,
  Leaf,
  Package,
  Minus
} from 'lucide-react';

interface CoreDashboardProps {
  sessions: ConsumptionSession[];
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const CoreAnalyticsDashboard: React.FC<CoreDashboardProps> = ({ sessions }) => {
  const metrics = useMemo(() => {
    const totalSessions = sessions.length;

    // Total quantity consumed (sum of normalized quantities)
    const quantityAnalytics = AnalyticsService.calculateQuantityAnalytics(sessions);
    const totalQuantityConsumed = (Object.values(quantityAnalytics.totalQuantityByVessel) as number[]).reduce(
      (sum, v) => sum + v,
      0
    );

    // Most frequent day/time
    const dayCount: Record<string, number> = {};
    sessions.forEach((s) => {
      const d = new Date(`${s.date}T${s.time}`);
      const key = `${dayNames[d.getDay()]}_${d.getHours()}`; // day_hour bucket
      dayCount[key] = (dayCount[key] || 0) + 1;
    });
    let mostFreqDayTime = 'N/A';
    if (Object.keys(dayCount).length) {
      const [key] = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0];
      const [day, hour] = key.split('_');
      const period = Number(hour) >= 12 ? 'PM' : 'AM';
      const hr12 = ((Number(hour) + 11) % 12) + 1;
      mostFreqDayTime = `${day}s around ${hr12}:00 ${period}`;
    }

    // Favorite strain
    const strainCount: Record<string, number> = {};
    sessions.forEach((s) => {
      if (s.strain_name) {
        strainCount[s.strain_name] = (strainCount[s.strain_name] || 0) + 1;
      }
    });
    const favoriteStrain = Object.keys(strainCount).length
      ? Object.entries(strainCount).sort((a, b) => b[1] - a[1])[0][0]
      : 'N/A';

    // Preferred consumption method (vessel)
    const vesselCount: Record<string, number> = {};
    sessions.forEach((s) => {
      if (s.vessel) {
        vesselCount[s.vessel] = (vesselCount[s.vessel] || 0) + 1;
      }
    });
    const preferredMethod = Object.keys(vesselCount).length
      ? Object.entries(vesselCount).sort((a, b) => b[1] - a[1])[0][0]
      : 'N/A';

    // Average session frequency (per active period)
    const freqAnalytics = AnalyticsService.calculateFrequencyAnalytics(sessions);
    const activeDays = Math.max(freqAnalytics.activePeriod, 1);
    const avgSessionFrequency = (totalSessions / activeDays).toFixed(2);

    // Current streak and recent trends
    const streakData = AnalyticsService.calculateStreaksAndGaps(sessions);
    const currentStreak = streakData.currentStreak;

    // Recent activity (last 7 days)
    const last7DaysSessions = sessions.filter(session => {
      const sessionDate = new Date(session.date);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return sessionDate >= sevenDaysAgo;
    }).length;

    // Weekly trend
    const weeklyTrend = freqAnalytics.weekly.currentWeekSessions - freqAnalytics.weekly.lastWeekSessions;
    const weeklyTrendDirection = weeklyTrend > 0 ? 'up' : weeklyTrend < 0 ? 'down' : 'stable';

    // Efficiency metrics
    const avgQuantityPerSession = quantityAnalytics.quantityEfficiency.averagePerSession;
    const quantityPerWeek = quantityAnalytics.quantityEfficiency.quantityPerWeek;

    // Recent trend data for sparkline (last 4 weeks)
    const recentTrendData = AnalyticsService.getRecentWeeklyTrend(sessions, 4);

    return {
      totalSessions,
      totalQuantityConsumed: totalQuantityConsumed.toFixed(2),
      mostFreqDayTime,
      favoriteStrain,
      preferredMethod,
      avgSessionFrequency,
      currentStreak,
      last7DaysSessions,
      weeklyTrend,
      weeklyTrendDirection,
      avgQuantityPerSession: avgQuantityPerSession.toFixed(2),
      quantityPerWeek: quantityPerWeek.toFixed(2),
      recentTrendData,
    };
  }, [sessions]);

  // Enhanced card configurations with icons and trend indicators
  const enhancedCards = [
    {
      label: 'Total Sessions',
      value: metrics.totalSessions,
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: null,
      subtitle: `${metrics.last7DaysSessions} in last 7 days`
    },
    {
      label: 'Current Streak',
      value: `${metrics.currentStreak} days`,
      icon: Flame,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: metrics.currentStreak > 0 ? 'up' : null,
      subtitle: 'Consecutive days'
    },
    {
      label: 'Weekly Trend',
      value: `${Math.abs(metrics.weeklyTrend)}`,
      icon: metrics.weeklyTrendDirection === 'up' ? TrendingUp : metrics.weeklyTrendDirection === 'down' ? TrendingDown : Minus,
      color: metrics.weeklyTrendDirection === 'up' ? 'text-green-600' : metrics.weeklyTrendDirection === 'down' ? 'text-red-600' : 'text-gray-600',
      bgColor: metrics.weeklyTrendDirection === 'up' ? 'bg-green-50' : metrics.weeklyTrendDirection === 'down' ? 'bg-red-50' : 'bg-gray-50',
      trend: metrics.weeklyTrendDirection,
      subtitle: metrics.weeklyTrendDirection === 'up' ? 'more than last week' : metrics.weeklyTrendDirection === 'down' ? 'less than last week' : 'same as last week'
    },
    {
      label: 'Avg Quantity/Session',
      value: metrics.avgQuantityPerSession,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: null,
      subtitle: 'Efficiency metric'
    },
    {
      label: 'Total Quantity',
      value: `${metrics.totalQuantityConsumed}g`,
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: null,
      subtitle: `${metrics.quantityPerWeek}g per week`
    },
    {
      label: 'Favorite Strain',
      value: metrics.favoriteStrain,
      icon: Leaf,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      trend: null,
      subtitle: 'Most consumed'
    },
    {
      label: 'Preferred Method',
      value: metrics.preferredMethod,
      icon: Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      trend: null,
      subtitle: 'Consumption method'
    },
    {
      label: 'Avg Frequency',
      value: `${metrics.avgSessionFrequency}/day`,
      icon: Clock,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      trend: null,
      subtitle: 'Sessions per day'
    }
  ];

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Yet</h3>
        <p className="text-gray-500">Log some sessions to see your analytics overview.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {enhancedCards.slice(0, 4).map((card) => {
          const Icon = card.icon;
          const TrendIcon = card.trend === 'up' ? TrendingUp : card.trend === 'down' ? TrendingDown : null;

          return (
            <div
              key={card.label}
              className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`p-2 rounded-lg ${card.bgColor}`}>
                      <Icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{card.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">{card.value}</span>
                    {TrendIcon && (
                      <TrendIcon className={`h-4 w-4 ${card.color}`} />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {enhancedCards.slice(4).map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`p-2 rounded-lg ${card.bgColor}`}>
                      <Icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{card.label}</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900 block">{card.value}</span>
                  <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Last 7 Days</p>
            <p className="text-2xl font-bold text-blue-700">{metrics.last7DaysSessions}</p>
            <p className="text-xs text-gray-500">sessions</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Most Frequent Time</p>
            <p className="text-lg font-semibold text-gray-900">{metrics.mostFreqDayTime}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Weekly Average</p>
            <p className="text-2xl font-bold text-green-700">{metrics.recentTrendData.length > 0 ? (metrics.recentTrendData.reduce((sum, d) => sum + d.sessions, 0) / metrics.recentTrendData.length).toFixed(1) : '0'}</p>
            <p className="text-xs text-gray-500">sessions/week</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoreAnalyticsDashboard;
