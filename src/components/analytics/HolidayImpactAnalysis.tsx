import React, { useMemo } from 'react';
import { ConsumptionSession } from '@/types/consumption';
import { AnalyticsService } from '@/lib/analytics';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Star,
  Gift,
  PartyPopper,
  Heart,
  Flag,
  Sparkles,
  Zap
} from 'lucide-react';

interface HolidayImpactAnalysisProps {
  sessions: ConsumptionSession[];
}

interface HolidayData {
  name: string;
  date: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  sessions: number;
  totalQuantity: number;
  avgQuantityPerSession: number;
  impact: 'high' | 'medium' | 'low' | 'none';
  comparison: {
    vsNormal: number;
    percentage: number;
    trend: 'increase' | 'decrease' | 'stable';
  };
}

interface HolidayPeriod {
  name: string;
  startDate: string;
  endDate: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

const HolidayImpactAnalysis: React.FC<HolidayImpactAnalysisProps> = ({ sessions }) => {
  // Define major holidays and their periods
  const holidays = useMemo((): HolidayPeriod[] => [
    {
      name: 'New Year\'s',
      startDate: '12-31',
      endDate: '01-02',
      icon: Sparkles,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      name: 'Valentine\'s Day',
      startDate: '02-14',
      endDate: '02-14',
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      name: 'St. Patrick\'s Day',
      startDate: '03-17',
      endDate: '03-17',
      icon: Flag,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: '4th of July',
      startDate: '07-04',
      endDate: '07-04',
      icon: Zap,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      name: 'Halloween',
      startDate: '10-31',
      endDate: '10-31',
      icon: PartyPopper,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      name: 'Thanksgiving',
      startDate: '11-25',
      endDate: '11-28',
      icon: Gift,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      name: 'Christmas',
      startDate: '12-24',
      endDate: '12-26',
      icon: Gift,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      name: 'New Year\'s Eve',
      startDate: '12-31',
      endDate: '12-31',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ], []);

  const holidayData = useMemo((): HolidayData[] => {
    if (sessions.length === 0) return [];

    // Calculate baseline metrics (average daily consumption)
    const totalDays = Math.max(1, Math.ceil(
      (new Date().getTime() - new Date(sessions[0]?.date || Date.now()).getTime()) / (1000 * 60 * 60 * 24)
    ));
    const baselineSessionsPerDay = sessions.length / totalDays;

    return holidays.map(holiday => {
      // Filter sessions for this holiday period
      const holidaySessions = sessions.filter(session => {
        const sessionDate = new Date(session.date);
        const sessionMonth = sessionDate.getMonth() + 1;
        const sessionDay = sessionDate.getDate();
        
        const [startMonth, startDay] = holiday.startDate.split('-').map(Number);
        const [endMonth, endDay] = holiday.endDate.split('-').map(Number);
        
        // Handle year boundary (e.g., New Year's)
        if (startMonth > endMonth) {
          // Holiday spans year boundary
          return (sessionMonth === startMonth && sessionDay >= startDay) ||
                 (sessionMonth === endMonth && sessionDay <= endDay) ||
                 (sessionMonth > startMonth || sessionMonth < endMonth);
        } else {
          // Normal case
          if (sessionMonth === startMonth && sessionMonth === endMonth) {
            return sessionDay >= startDay && sessionDay <= endDay;
          } else if (sessionMonth === startMonth) {
            return sessionDay >= startDay;
          } else if (sessionMonth === endMonth) {
            return sessionDay <= endDay;
          } else if (sessionMonth > startMonth && sessionMonth < endMonth) {
            return true;
          }
        }
        return false;
      });

      if (holidaySessions.length === 0) {
        return {
          name: holiday.name,
          date: holiday.startDate,
          icon: holiday.icon,
          color: holiday.color,
          bgColor: holiday.bgColor,
          sessions: 0,
          totalQuantity: 0,
          avgQuantityPerSession: 0,
          impact: 'none' as const,
          comparison: {
            vsNormal: 0,
            percentage: 0,
            trend: 'stable' as const
          }
        };
      }

      // Calculate holiday metrics
             const totalQuantity = holidaySessions.reduce((sum, session) => {
         const quantity = AnalyticsService.normalizeQuantity(session);
         return sum + (typeof quantity === 'number' && !isNaN(quantity) ? quantity : 0);
       }, 0);
      const avgQuantityPerSession = totalQuantity / holidaySessions.length;
      
      // Calculate holiday period length in days
      const holidayDays = holiday.startDate === holiday.endDate ? 1 : 
        Math.ceil((new Date(`2024-${holiday.endDate}`).getTime() - new Date(`2024-${holiday.startDate}`).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      // Compare with baseline
      const expectedSessions = baselineSessionsPerDay * holidayDays;
      
      const sessionComparison = holidaySessions.length - expectedSessions;
      const sessionPercentage = expectedSessions > 0 ? 
        ((holidaySessions.length - expectedSessions) / expectedSessions) * 100 : 0;

      // Determine impact level
      let impact: 'high' | 'medium' | 'low' | 'none' = 'none';
      if (Math.abs(sessionPercentage) > 50) impact = 'high';
      else if (Math.abs(sessionPercentage) > 25) impact = 'medium';
      else if (Math.abs(sessionPercentage) > 10) impact = 'low';

      // Determine trend
      let trend: 'increase' | 'decrease' | 'stable' = 'stable';
      if (sessionComparison > 0) trend = 'increase';
      else if (sessionComparison < 0) trend = 'decrease';

      return {
        name: holiday.name,
        date: holiday.startDate,
        icon: holiday.icon,
        color: holiday.color,
        bgColor: holiday.bgColor,
        sessions: holidaySessions.length,
        totalQuantity,
        avgQuantityPerSession,
        impact,
        comparison: {
          vsNormal: sessionComparison,
          percentage: sessionPercentage,
          trend
        }
      };
    });
  }, [sessions, holidays]);

  // Calculate overall holiday impact statistics
  const holidayStats = useMemo(() => {
    if (holidayData.length === 0) return null;

    const holidaysWithData = holidayData.filter(h => h.sessions > 0);
    const totalHolidaySessions = holidaysWithData.reduce((sum, h) => sum + h.sessions, 0);
    const totalHolidayQuantity = holidaysWithData.reduce((sum, h) => sum + h.totalQuantity, 0);
    
    const highImpactHolidays = holidayData.filter(h => h.impact === 'high');
    const increasingHolidays = holidayData.filter(h => h.comparison.trend === 'increase');
    const decreasingHolidays = holidayData.filter(h => h.comparison.trend === 'decrease');

    return {
      totalHolidaySessions,
      totalHolidayQuantity,
      highImpactHolidays,
      increasingHolidays,
      decreasingHolidays,
      averageImpact: holidayData.reduce((sum, h) => sum + Math.abs(h.comparison.percentage), 0) / holidayData.length
    };
  }, [holidayData]);

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Holiday Data</h3>
        <p className="text-gray-500">Log sessions around holidays to see their impact on consumption patterns.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Calendar className="h-6 w-6 text-purple-600" />
        <h2 className="text-xl font-semibold text-gray-900">Holiday Impact Analysis</h2>
      </div>

      {/* Holiday Overview */}
      {holidayStats && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Holiday Consumption Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-700">{holidayStats.totalHolidaySessions}</p>
              <p className="text-sm text-gray-600">Holiday Sessions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-pink-700">{holidayStats.highImpactHolidays.length}</p>
              <p className="text-xs text-gray-500">High Impact Holidays</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-700">{holidayStats.increasingHolidays.length}</p>
              <p className="text-xs text-gray-500">Increasing Trends</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-700">{holidayStats.decreasingHolidays.length}</p>
              <p className="text-xs text-gray-500">Decreasing Trends</p>
            </div>
          </div>
        </div>
      )}

      {/* Holiday-by-Holiday Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {holidayData.map((holiday) => {
          const HolidayIcon = holiday.icon;
          
          const impactColor = holiday.impact === 'high' ? 'text-red-600' :
                             holiday.impact === 'medium' ? 'text-yellow-600' :
                             holiday.impact === 'low' ? 'text-blue-600' : 'text-gray-600';
          
          const impactBgColor = holiday.impact === 'high' ? 'bg-red-50' :
                               holiday.impact === 'medium' ? 'bg-yellow-50' :
                               holiday.impact === 'low' ? 'bg-blue-50' : 'bg-gray-50';

          const TrendIcon = holiday.comparison.trend === 'increase' ? TrendingUp : 
                           holiday.comparison.trend === 'decrease' ? TrendingDown : BarChart3;
          
          const trendColor = holiday.comparison.trend === 'increase' ? 'text-green-600' : 
                            holiday.comparison.trend === 'decrease' ? 'text-red-600' : 'text-gray-600';

          return (
            <div key={holiday.name} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Holiday Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${holiday.bgColor}`}>
                    <HolidayIcon className={`h-5 w-5 ${holiday.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{holiday.name}</h3>
                    <p className="text-sm text-gray-500">
                      {holiday.sessions} session{holiday.sessions !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className={`p-2 rounded-lg ${impactColor} ${impactBgColor}`}>
                  <span className="text-xs font-medium uppercase">{holiday.impact}</span>
                </div>
              </div>

              {/* Holiday Metrics */}
              <div className="space-y-3">
                                 <div className="flex justify-between items-center">
                   <span className="text-sm text-gray-600">Total Quantity:</span>
                   <span className="font-medium">
                     {typeof holiday.totalQuantity === 'number' && !isNaN(holiday.totalQuantity) 
                       ? holiday.totalQuantity.toFixed(2) 
                       : '0.00'}g
                   </span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-sm text-gray-600">Avg per Session:</span>
                   <span className="font-medium">
                     {typeof holiday.avgQuantityPerSession === 'number' && !isNaN(holiday.avgQuantityPerSession) 
                       ? holiday.avgQuantityPerSession.toFixed(2) 
                       : '0.00'}g
                   </span>
                 </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">vs. Normal:</span>
                  <span className={`font-medium ${
                    holiday.comparison.vsNormal > 0 ? 'text-green-600' :
                    holiday.comparison.vsNormal < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {holiday.comparison.vsNormal > 0 ? '+' : ''}{holiday.comparison.vsNormal.toFixed(1)} sessions
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Percentage Change:</span>
                  <span className={`font-medium ${
                    holiday.comparison.percentage > 0 ? 'text-green-600' :
                    holiday.comparison.percentage < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {holiday.comparison.percentage > 0 ? '+' : ''}{holiday.comparison.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Trend Indicator */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Trend:</span>
                    <span className={`text-xs font-medium ${trendColor}`}>
                      {holiday.comparison.trend === 'increase' ? 'Above Normal' :
                       holiday.comparison.trend === 'decrease' ? 'Below Normal' : 'Normal'}
                    </span>
                  </div>
                  <div className={`p-1 rounded ${trendColor} bg-gray-50`}>
                    <TrendIcon className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Holiday Insights */}
      {holidayStats && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
          <div className="space-y-3 text-sm text-gray-700">
            {holidayStats.highImpactHolidays.length > 0 && (
              <p>
                • <strong>{holidayStats.highImpactHolidays.length} holiday{holidayStats.highImpactHolidays.length !== 1 ? 's' : ''}</strong> show{' '}
                <strong>high impact</strong> on consumption patterns
              </p>
            )}
            {holidayStats.increasingHolidays.length > 0 && (
              <p>
                • <strong>{holidayStats.increasingHolidays.length} holiday{holidayStats.increasingHolidays.length !== 1 ? 's' : ''}</strong> lead to{' '}
                <strong>increased consumption</strong> compared to normal days
              </p>
            )}
            {holidayStats.decreasingHolidays.length > 0 && (
              <p>
                • <strong>{holidayStats.decreasingHolidays.length} holiday{holidayStats.decreasingHolidays.length !== 1 ? 's' : ''}</strong> show{' '}
                <strong>decreased consumption</strong> compared to normal days
              </p>
            )}
            <p>
              • Average holiday impact: <strong>{holidayStats.averageImpact.toFixed(1)}%</strong> change from normal patterns
            </p>
            {holidayStats.averageImpact > 30 && (
              <p className="text-blue-700 font-medium">
                💡 Holidays significantly affect your consumption patterns. Consider planning ahead for high-impact dates.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HolidayImpactAnalysis;
