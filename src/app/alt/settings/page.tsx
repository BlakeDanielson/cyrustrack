'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Database, RefreshCw, FileDown, FileUp, LifeBuoy, ExternalLink, GitBranch } from 'lucide-react';
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

  const handleMigrateToDatabase = async () => {
    try {
      const { hybridStorageService } = await import('@/lib/storage-hybrid');
      const result = await hybridStorageService.migrateToDatabase();
      if (result.success) {
        alert(`Migration completed. Migrated ${result.migrated || 0} sessions.`);
        await loadSessions();
      } else {
        alert(`Migration failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Migration error:', error);
      alert('Migration request failed. See console for details.');
    }
  };

  const handleSyncWithDatabase = async () => {
    try {
      const { hybridStorageService } = await import('@/lib/storage-hybrid');
      const result = await hybridStorageService.syncWithDatabase();
      const message = `Synced ${result.synced} sessions${result.errors.length ? ` with ${result.errors.length} errors` : ''}.`;
      console.log('Sync result:', result);
      alert(message);
      await loadSessions();
    } catch (error) {
      console.error('Sync error:', error);
      alert('Sync request failed. See console for details.');
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

        <div className="pt-4 border-t grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setShowImportDialog(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                <FileUp className="h-4 w-4" />
                Import CSV Data
              </button>
              <button
                onClick={handleExportData}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
              >
                <FileDown className="h-4 w-4" />
                Export All Data
              </button>
              <button
                onClick={handleMigrateToDatabase}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 transition-colors"
              >
                <Database className="h-4 w-4" />
                Migrate Local → Database
              </button>
              <button
                onClick={handleSyncWithDatabase}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Sync With Database
              </button>
              <button
                onClick={handleClearData}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
              >
                <GitBranch className="h-4 w-4" />
                Clear All Data
              </button>
            </div>
          </div>

          {/* Helpful Links */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">Helpful Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/docs/prd" className="text-green-700 hover:underline inline-flex items-center gap-1">
                  Product Requirements Doc
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link href="/ENHANCED_ANALYTICS_README" className="text-green-700 hover:underline inline-flex items-center gap-1">
                  Enhanced Analytics Guide
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link href="/VERCEL_BLOB_SETUP" className="text-green-700 hover:underline inline-flex items-center gap-1">
                  Image Storage Setup
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
              <li className="text-gray-600 flex items-center gap-2">
                <LifeBuoy className="h-4 w-4 text-gray-500" />
                Need help? Check repository README and deployment docs.
              </li>
            </ul>
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

