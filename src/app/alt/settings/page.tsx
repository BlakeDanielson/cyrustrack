'use client';

import { useState } from 'react';
import { useConsumptionStore } from '@/store/consumption';
import LocationManager from '@/components/LocationManager';
import CSVImportDialog from '@/components/CSVImportDialog';

export default function AltSettingsPage() {
  const { preferences, updatePreferences, loadSessions } = useConsumptionStore();
  const [showImportDialog, setShowImportDialog] = useState(false);

  const handleExportData = async () => {
    try {
      const { storageService } = await import('@/lib/storage');
      const data = await storageService.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cannabis-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('Data exported successfully!');
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data.');
    }
  };

  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      try {
        const { storageService } = await import('@/lib/storage');
        await storageService.clear();
        loadSessions();
        alert('All data cleared successfully!');
      } catch (error) {
        console.error('Failed to clear data:', error);
        alert('Failed to clear data.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <LocationManager />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Preferences</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Location</label>
              <input
                type="text"
                value={preferences.defaultLocation}
                onChange={(e) => updatePreferences({ defaultLocation: e.target.value })}
                placeholder="e.g., Home, Apartment, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Enable Notifications</label>
                <p className="text-sm text-gray-500">Get reminders and updates about your sessions</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.enableNotifications}
                onChange={(e) => updatePreferences({ enableNotifications: e.target.checked })}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowImportDialog(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Import CSV Data
            </button>
            <button
              onClick={handleExportData}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
            >
              Export All Data
            </button>
            <button
              onClick={handleClearData}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
            >
              Clear All Data
            </button>
          </div>
        </div>
      </div>

      <CSVImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImportComplete={(count) => {
          alert(`Successfully imported ${count} sessions!`);
          void loadSessions();
        }}
      />
    </div>
  );
}

