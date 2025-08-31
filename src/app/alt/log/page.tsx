'use client';

import ConsumptionForm from '@/components/ConsumptionForm';

export default function AltLogPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Log Session</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <ConsumptionForm />
      </div>
    </div>
  );
}

