'use client';

import { useConsumptionStore } from '@/store/consumption';
import CoreAnalyticsDashboard from '@/components/analytics/CoreDashboard';

export default function AltAnalyticsPage() {
  const sessions = useConsumptionStore((s) => s.sessions);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
      <div className="bg-white rounded-lg border border-gray-200">
        <CoreAnalyticsDashboard sessions={sessions} />
      </div>
    </div>
  );
}

