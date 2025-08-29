import React, { useMemo } from 'react';
import { ConsumptionSession } from '@/types/consumption';
import { AnalyticsService } from '@/lib/analytics';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Sun, 
  Cloud, 
  Snowflake,
  Leaf
} from 'lucide-react';

interface SeasonalAnalysisProps {
  sessions: ConsumptionSession[];
}

interface SeasonalData {
  season: string;
  sessions: number;
  totalQuantity: number;
  avgQuantityPerSession: number;
  avgSessionsPerWeek: number;
  mostPopularStrain: string;
  mostPopularVessel: string;
  trend: 'increasing' | 'decreasing' | 'stable';
}

const SeasonalAnalysis: React.FC<SeasonalAnalysisProps> = ({ sessions }) => {
  const seasonalData = useMemo((): SeasonalData[] => {
    if (sessions.length === 0) return [];

    // Define seasons
    const seasons = [
      { name: 'Winter', startMonth: 12, endMonth: 2, icon: Snowflake, color: 'text-blue-600', bgColor: 'bg-blue-50' },
      { name: 'Spring', startMonth: 3, endMonth: 5, icon: Leaf, color: 'text-green-600', bgColor: 'bg-green-50' },
      { name: 'Summer', startMonth: 6, endMonth: 8, icon: Sun, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
      { name: 'Fall', startMonth: 9, endMonth: 11, icon: Leaf, color: 'text-orange-600', bgColor: 'bg-orange-50' }
    ];

    return seasons.map(season => {
      // Filter sessions for this season
      const seasonSessions = sessions.filter(session => {
        const month = new Date(session.date).getMonth() + 1; // getMonth() returns 0-11
        if (season.startMonth <= season.endMonth) {
          return month >= season.startMonth && month <= season.endMonth;
        } else {
          // Handle winter (Dec-Feb)
          return month >= season.startMonth || month <= season.endMonth;
        }
      });

      if (seasonSessions.length === 0) {
        return {
          season: season.name,
          sessions: 0,
          totalQuantity: 0,
          avgQuantityPerSession: 0,
          avgSessionsPerWeek: 0,
          mostPopularStrain: 'N/A',
          mostPopularVessel: 'N/A',
          trend: 'stable' as const
        };
      }

      // Calculate metrics
      const totalQuantity = seasonSessions.reduce((sum, session) => {
        const quantity = AnalyticsService.normalizeQuantity(session);
        return sum + (typeof quantity === 'number' && !isNaN(quantity) ? quantity : 0);
      }, 0);
      
      const avgQuantityPerSession = seasonSessions.length > 0 ? totalQuantity / seasonSessions.length : 0;
      
      // Calculate weeks in season (approximate)
      const weeksInSeason = seasonSessions.length > 0 ? 
        Math.max(1, Math.ceil(seasonSessions.length / 2)) : 1; // Rough estimate
      
      const avgSessionsPerWeek = seasonSessions.length / weeksInSeason;

      // Most popular strain
      const strainCount: Record<string, number> = {};
      seasonSessions.forEach(session => {
        if (session.strain_name) {
          strainCount[session.strain_name] = (strainCount[session.strain_name] || 0) + 1;
        }
      });
      const mostPopularStrain = Object.keys(strainCount).length > 0 ?
        Object.entries(strainCount).sort((a, b) => b[1] - a[1])[0][0] : 'N/A';

      // Most popular vessel
      const vesselCount: Record<string, number> = {};
      seasonSessions.forEach(session => {
        if (session.vessel) {
          vesselCount[session.vessel] = (vesselCount[session.vessel] || 0) + 1;
        }
      });
      const mostPopularVessel = Object.keys(vesselCount).length > 0 ?
        Object.entries(vesselCount).sort((a, b) => b[1] - a[1])[0][0] : 'N/A';

      // Determine trend (simplified - could be enhanced with historical data)
      const trend: 'increasing' | 'decreasing' | 'stable' = 
        avgSessionsPerWeek > 3 ? 'increasing' : 
        avgSessionsPerWeek < 1 ? 'decreasing' : 'stable';

      return {
        season: season.name,
        sessions: seasonSessions.length,
        totalQuantity,
        avgQuantityPerSession,
        avgSessionsPerWeek,
        mostPopularStrain,
        mostPopularVessel,
        trend
      };
    });
  }, [sessions]);

  // Calculate overall seasonal patterns
  const seasonalPatterns = useMemo(() => {
    if (seasonalData.length === 0) return null;

    const totalSessions = seasonalData.reduce((sum, season) => sum + season.sessions, 0);
    const totalQuantity = seasonalData.reduce((sum, season) => {
      const quantity = season.totalQuantity;
      return sum + (typeof quantity === 'number' && !isNaN(quantity) ? quantity : 0);
    }, 0);

    // Find peak season
    const peakSeason = seasonalData.reduce((peak, current) => 
      current.sessions > peak.sessions ? current : peak
    );

    // Find most consistent season (closest to average)
    const avgSessionsPerSeason = totalSessions / 4;
    const mostConsistentSeason = seasonalData.reduce((most, current) => 
      Math.abs(current.sessions - avgSessionsPerSeason) < Math.abs(most.sessions - avgSessionsPerSeason) ? current : most
    );

    // Seasonal variation (standard deviation)
    const variance = seasonalData.reduce((sum, season) => 
      sum + Math.pow(season.sessions - avgSessionsPerSeason, 2), 0
    ) / 4;
    const seasonalVariation = Math.sqrt(variance);

    return {
      totalSessions,
      totalQuantity,
      peakSeason,
      mostConsistentSeason,
      seasonalVariation,
      avgSessionsPerSeason
    };
  }, [seasonalData]);

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Seasonal Data</h3>
        <p className="text-gray-500">Log sessions across different seasons to see seasonal patterns.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Calendar className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Seasonal Consumption Analysis</h2>
      </div>

      {/* Seasonal Overview */}
      {seasonalPatterns && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Seasonal Patterns</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-700">{seasonalPatterns.totalSessions}</p>
              <p className="text-sm text-gray-600">Total Sessions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-700">{seasonalPatterns.peakSeason.season}</p>
              <p className="text-xs text-gray-500">Peak Season</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-700">{seasonalPatterns.mostConsistentSeason.season}</p>
              <p className="text-xs text-gray-500">Most Consistent</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-700">{seasonalPatterns.seasonalVariation.toFixed(1)}</p>
              <p className="text-xs text-gray-500">Variation</p>
            </div>
          </div>
        </div>
      )}

      {/* Season-by-Season Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {seasonalData.map((season) => {
          const SeasonIcon = season.season === 'Winter' ? Snowflake :
                            season.season === 'Spring' ? Leaf :
                            season.season === 'Summer' ? Sun : Leaf;
          
          const iconColor = season.season === 'Winter' ? 'text-blue-600' :
                           season.season === 'Spring' ? 'text-green-600' :
                           season.season === 'Summer' ? 'text-yellow-600' : 'text-orange-600';
          
          const bgColor = season.season === 'Winter' ? 'bg-blue-50' :
                         season.season === 'Spring' ? 'bg-green-50' :
                         season.season === 'Summer' ? 'bg-yellow-50' : 'bg-orange-50';

          const TrendIcon = season.trend === 'increasing' ? TrendingUp : 
                           season.trend === 'decreasing' ? TrendingDown : BarChart3;
          
          const trendColor = season.trend === 'increasing' ? 'text-green-600' : 
                            season.trend === 'decreasing' ? 'text-red-600' : 'text-gray-600';

          return (
            <div key={season.season} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Season Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${bgColor}`}>
                    <SeasonIcon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{season.season}</h3>
                    <p className="text-sm text-gray-500">
                      {season.sessions} session{season.sessions !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className={`p-2 rounded-lg ${trendColor} bg-gray-50`}>
                  <TrendIcon className="h-5 w-5" />
                </div>
              </div>

              {/* Season Metrics */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Quantity:</span>
                  <span className="font-medium">
                    {typeof season.totalQuantity === 'number' && !isNaN(season.totalQuantity) 
                      ? season.totalQuantity.toFixed(2) 
                      : '0.00'}g
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg per Session:</span>
                  <span className="font-medium">
                    {typeof season.avgQuantityPerSession === 'number' && !isNaN(season.avgQuantityPerSession) 
                      ? season.avgQuantityPerSession.toFixed(2) 
                      : '0.00'}g
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Sessions per Week:</span>
                  <span className="font-medium">
                    {typeof season.avgSessionsPerWeek === 'number' && !isNaN(season.avgSessionsPerWeek) 
                      ? season.avgSessionsPerWeek.toFixed(1) 
                      : '0.0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Popular Strain:</span>
                  <span className="font-medium text-sm truncate max-w-24">{season.mostPopularStrain}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Preferred Method:</span>
                  <span className="font-medium text-sm truncate max-w-24">{season.mostPopularVessel}</span>
                </div>
              </div>

              {/* Trend Indicator */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Trend:</span>
                  <span className={`text-xs font-medium ${
                    season.trend === 'increasing' ? 'text-green-600' :
                    season.trend === 'decreasing' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {season.trend === 'increasing' ? 'Increasing' :
                     season.trend === 'decreasing' ? 'Decreasing' : 'Stable'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Seasonal Insights */}
      {seasonalPatterns && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              • <strong>{seasonalPatterns.peakSeason.season}</strong> is your most active season with{' '}
              {seasonalPatterns.peakSeason.sessions} sessions
            </p>
            <p>
              • <strong>{seasonalPatterns.mostConsistentSeason.season}</strong> shows the most consistent pattern, 
              close to the average of {seasonalPatterns.avgSessionsPerSeason.toFixed(1)} sessions per season
            </p>
            <p>
              • Seasonal variation is {seasonalPatterns.seasonalVariation.toFixed(1)} sessions, indicating{' '}
              {seasonalPatterns.seasonalVariation > 5 ? 'significant' : 
               seasonalPatterns.seasonalVariation > 2 ? 'moderate' : 'minimal'} seasonal patterns
            </p>
            {seasonalPatterns.seasonalVariation > 5 && (
              <p className="text-blue-700 font-medium">
                💡 Consider adjusting consumption patterns based on seasonal trends for better consistency
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeasonalAnalysis;
