'use client';

import ConsumptionHistory from '@/components/ConsumptionHistory';

export default function AltHistoryPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">History</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <ConsumptionHistory />
      </div>
    </div>
  );
}

