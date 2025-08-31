import React, { useMemo } from 'react';
import { eachDayOfInterval, subWeeks, isSameDay, format } from 'date-fns';
import { ConsumptionSession } from '@/types/consumption';
import { AnalyticsService } from '@/lib/analytics';

interface ConsumptionIntensityHeatmapProps {
  sessions: ConsumptionSession[];
  weeks?: number;
  showQuantity?: boolean; // Toggle between session count and quantity
}

/**
 * Enhanced day cell with tooltip and intensity-based coloring
 */
const DayCell: React.FC<{ 
  level: number; 
  isToday?: boolean; 
  date: Date; 
  value: number; 
  showQuantity: boolean;
}> = ({ level, isToday, date, value, showQuantity }) => {
  // Enhanced color scheme with more granular levels
  const levelClasses = [
    'bg-gray-100',      // 0 – no consumption
    'bg-blue-200',      // 1 – very low
    'bg-blue-300',      // 2 – low
    'bg-green-300',     // 3 – medium-low
    'bg-green-400',     // 4 – medium
    'bg-green-500',     // 5 – medium-high
    'bg-orange-400',    // 6 – high
    'bg-orange-500',    // 7 – very high
    'bg-red-500',       // 8 – extremely high
    'bg-red-600'        // 9 – maximum
  ];

  const base = 'w-4 h-4 sm:w-5 sm:h-5 rounded cursor-pointer transition-all duration-200 hover:scale-110';
  const todayRing = isToday ? 'ring-2 ring-blue-600 ring-offset-2' : '';
  
         const tooltipText = showQuantity 
         ? `${format(date, 'MMM dd, yyyy')}: ${typeof value === 'number' && !isNaN(value) ? value.toFixed(2) : '0.00'}g consumed`
         : `${format(date, 'MMM dd, yyyy')}: ${value} session${value !== 1 ? 's' : ''}`;

  return (
    <div className="relative group">
      <div 
        className={`${base} ${levelClasses[level]} ${todayRing}`}
        title={tooltipText}
      />
      {/* Enhanced tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        {tooltipText}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};

const ConsumptionIntensityHeatmap: React.FC<ConsumptionIntensityHeatmapProps> = ({ 
  sessions, 
  weeks = 20,
  showQuantity = false 
}) => {
  const { gridData, maxValue, totalConsumption, totalSessions } = useMemo(() => {
    const endDate = new Date();
    const startDate = subWeeks(endDate, weeks - 1);

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Build consumption map - either by session count or quantity
    const consumptionMap: Record<string, number> = {};
    
    if (showQuantity) {
      // Map by total quantity consumed per day
      sessions.forEach(session => {
        const key = session.date;
        const quantity = AnalyticsService.normalizeQuantity(session);
        consumptionMap[key] = (consumptionMap[key] || 0) + quantity;
      });
    } else {
      // Map by session count per day
      sessions.forEach(session => {
        const key = session.date;
        consumptionMap[key] = (consumptionMap[key] || 0) + 1;
      });
    }

    const rows: Array<Array<{ date: Date; value: number }>> = [];
    for (let i = 0; i < 7; i++) rows.push([]);

    let max = 0;
    let total = 0;
    let sessionCount = 0;

    days.forEach(day => {
      const iso = day.toISOString().split('T')[0];
      const value = consumptionMap[iso] || 0;
      max = Math.max(max, value);
      total += value;
      if (value > 0) sessionCount++;
      
      const weekday = day.getDay();
      rows[weekday].push({ date: day, value });
    });

    // Pad rows to equal length
    const maxLen = Math.max(...rows.map(r => r.length));
    rows.forEach(r => {
      while (r.length < maxLen) {
        r.unshift({ date: new Date(0), value: -1 });
      }
    });

    return { 
      gridData: rows, 
      maxValue: max,
      totalConsumption: total,
      totalSessions: sessionCount
    };
  }, [sessions, weeks, showQuantity]);

  // Enhanced threshold calculation with more granular levels
  const getLevel = (value: number): number => {
    if (value <= 0) return 0;
    if (maxValue <= 1) return value > 0 ? 1 : 0;
    
    const step = maxValue / 9;
    for (let i = 1; i <= 9; i++) {
      if (value <= step * i) return i;
    }
    return 9;
  };

  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Consumption Intensity Heatmap
          </h3>
          <p className="text-sm text-gray-600">
            {showQuantity ? 'Quantity consumed per day' : 'Sessions per day'} over the last {weeks} weeks
          </p>
        </div>
        
        {/* Toggle between quantity and session count */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">View:</span>
          <button
            onClick={() => window.location.reload()} // Simple toggle - in real app use state
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              !showQuantity 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Sessions
          </button>
          <button
            onClick={() => window.location.reload()} // Simple toggle - in real app use state
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              showQuantity 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Quantity
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {totalSessions}
          </p>
          <p className="text-sm text-gray-600">Active Days</p>
        </div>
                 <div className="text-center">
           <p className="text-2xl font-bold text-gray-900">
             {showQuantity 
               ? `${typeof totalConsumption === 'number' && !isNaN(totalConsumption) ? totalConsumption.toFixed(2) : '0.00'}g` 
               : totalConsumption}
           </p>
           <p className="text-sm text-gray-600">
             {showQuantity ? 'Total Consumed' : 'Total Sessions'}
           </p>
         </div>
         <div className="text-center">
           <p className="text-2xl font-bold text-gray-900">
             {typeof maxValue === 'number' && !isNaN(maxValue) 
               ? maxValue.toFixed(showQuantity ? 2 : 0) 
               : '0'}
           </p>
           <p className="text-sm text-gray-600">
             {showQuantity ? 'Max Daily (g)' : 'Max Daily Sessions'}
           </p>
         </div>
      </div>

      {/* Heatmap Grid */}
      <div className="flex flex-col gap-1">
        {/* Weekday labels */}
        <div className="flex gap-1 ml-6">
          {weekdayLabels.map(label => (
            <div key={label} className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs text-gray-500 font-medium">
              {label}
            </div>
          ))}
        </div>

        {/* Heatmap rows */}
        {gridData.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-1 items-center">
            {/* Weekday label */}
            <div className="w-6 text-xs text-gray-500 font-medium text-right pr-2">
              {weekdayLabels[rowIdx]}
            </div>
            
            {/* Day cells */}
            {row.map(({ date, value }, colIdx) => {
              if (value === -1) {
                return <div key={colIdx} className="w-4 h-4 sm:w-5 sm:h-5" />;
              }
              const level = getLevel(value);
              const isToday = isSameDay(date, new Date());
              return (
                <DayCell 
                  key={colIdx} 
                  level={level} 
                  isToday={isToday}
                  date={date}
                  value={value}
                  showQuantity={showQuantity}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Enhanced Legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Intensity:</span>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(l => (
            <DayCell 
              key={l} 
              level={l} 
              date={new Date()}
              value={0}
              showQuantity={showQuantity}
            />
          ))}
        </div>
        
                 <div className="text-xs text-gray-500">
           {showQuantity ? (
             <span>Scale: 0g → {typeof maxValue === 'number' && !isNaN(maxValue) ? maxValue.toFixed(2) : '0.00'}g</span>
           ) : (
             <span>Scale: 0 → {typeof maxValue === 'number' && !isNaN(maxValue) ? maxValue : '0'} sessions</span>
           )}
         </div>
      </div>
    </div>
  );
};

export default ConsumptionIntensityHeatmap;
