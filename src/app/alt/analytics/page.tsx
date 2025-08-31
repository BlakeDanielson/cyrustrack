'use client';

import { useConsumptionStore } from '@/store/consumption';
import CoreAnalyticsDashboard from '@/components/analytics/CoreDashboard';
import FrequencyAnalytics from '@/components/analytics/FrequencyAnalytics';
import StrainAnalytics from '@/components/analytics/StrainAnalytics';
import LocationAnalytics from '@/components/analytics/LocationAnalytics';

export default function AltAnalyticsPage() {
  const sessions = useConsumptionStore((s) => s.sessions);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

      <div className="bg-white rounded-lg border border-gray-200">
        <CoreAnalyticsDashboard sessions={sessions} />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Frequency & Streaks</h2>
        <FrequencyAnalytics sessions={sessions} />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Strain Insights</h2>
        <StrainAnalytics sessions={sessions} />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Location Insights</h2>
        <LocationAnalytics sessions={sessions} />
      </div>
    </div>
  );
}

