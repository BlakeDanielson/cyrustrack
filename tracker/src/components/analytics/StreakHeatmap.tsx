import React, { useMemo } from 'react';
import { eachDayOfInterval, format, subWeeks, isSameDay } from 'date-fns';
import { ConsumptionSession } from '@/types/consumption';

interface StreakHeatmapProps {
  /**
   * Array of all recorded consumption sessions
   */
  sessions: ConsumptionSession[];
  /**
   * How many weeks back from today to show in the heat-map (default 20)
   */
  weeks?: number;
}

/**
 * Small square cell visualising a single day
 */
const DayCell: React.FC<{ level: number; isToday?: boolean }> = ({ level, isToday }) => {
  // Map an intensity level (0-4) to Tailwind background classes
  const levelClasses = [
    'bg-gray-200',      // 0 – no sessions
    'bg-green-200',     // 1 – low
    'bg-green-400',     // 2 – medium
    'bg-green-500',     // 3 – high
    'bg-green-600'      // 4 – very high
  ];
  const base = 'w-3 h-3 sm:w-4 sm:h-4 rounded';
  const todayRing = isToday ? 'ring-2 ring-blue-500' : '';
  return <div className={`${base} ${levelClasses[level]} ${todayRing}`} />;
};

/**
 * Convert array of sessions into a lookup map keyed by YYYY-MM-DD.
 */
const buildSessionCountMap = (sessions: ConsumptionSession[]): Record<string, number> => {
  return sessions.reduce<Record<string, number>>((acc, session) => {
    const key = session.date; // already in ISO yyyy-mm-dd from form
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
};

const StreakHeatmap: React.FC<StreakHeatmapProps> = ({ sessions, weeks = 20 }) => {
  const { gridData, maxPerDay } = useMemo(() => {
    const endDate = new Date();
    const startDate = subWeeks(endDate, weeks - 1); // inclusive of current week

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const countMap = buildSessionCountMap(sessions);

    const rows: Array<Array<{ date: Date; count: number }>> = [];
    for (let i = 0; i < 7; i++) rows.push([]);

    let max = 0;

    days.forEach(day => {
      const iso = day.toISOString().split('T')[0];
      const count = countMap[iso] ?? 0;
      max = Math.max(max, count);
      const weekday = day.getDay(); // 0 (Sun) – 6 (Sat)
      rows[weekday].push({ date: day, count });
    });

    // Ensure each weekday row has same length (pad beginning with placeholders)
    const maxLen = Math.max(...rows.map(r => r.length));
    rows.forEach(r => {
      while (r.length < maxLen) {
        r.unshift({ date: new Date(0), count: -1 }); // placeholder with negative count
      }
    });

    return { gridData: rows, maxPerDay: max };
  }, [sessions, weeks]);

  // Determine thresholds relative to max count – simple 4-step scale
  const threshold = useMemo(() => {
    if (maxPerDay <= 1) return [1, 1, 1];
    const step = maxPerDay / 4;
    return [step, step * 2, step * 3];
  }, [maxPerDay]);

  const getLevel = (count: number): number => {
    if (count <= 0) return 0;
    if (count <= threshold[0]) return 1;
    if (count <= threshold[1]) return 2;
    if (count <= threshold[2]) return 3;
    return 4;
  };

  return (
    <div className="flex flex-col gap-1">
      {gridData.map((row, rowIdx) => (
        <div key={rowIdx} className="flex gap-1">
          {row.map(({ date, count }, colIdx) => {
            if (count === -1) {
              // Placeholder (date outside selected range)
              return <div key={colIdx} className="w-3 h-3 sm:w-4 sm:h-4" />;
            }
            const level = getLevel(count);
            const isToday = isSameDay(date, new Date());
            return <DayCell key={colIdx} level={level} isToday={isToday} />;
          })}
        </div>
      ))}
      {/* Legend */}
      <div className="flex items-center gap-2 pt-2 text-xs text-gray-500">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map(l => (
          <DayCell key={l} level={l} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
};

export default StreakHeatmap;
