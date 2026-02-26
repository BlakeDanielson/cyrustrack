'use client';

import React, { useEffect, useState } from 'react';
import { useConsumptionStore } from '@/store/consumption';
import Navigation from './Navigation';
import ConsumptionForm from './ConsumptionForm';
import ConsumptionHistory from './ConsumptionHistory';
import FrequencyAnalytics from './analytics/FrequencyAnalytics';
import LocationAnalytics from './analytics/LocationAnalytics';
import StrainAnalytics from './analytics/StrainAnalytics';
import CoreAnalyticsDashboard from './analytics/CoreDashboard';
import ConsumptionIntensityHeatmap from './analytics/ConsumptionIntensityHeatmap';
import SeasonalAnalysis from './analytics/SeasonalAnalysis';
import HolidayImpactAnalysis from './analytics/HolidayImpactAnalysis';
import CSVImportDialog from './CSVImportDialog';
import LocationManager from './LocationManager';
import FeedbackNotes from './FeedbackNotes';
import { BarChart3, Settings as SettingsIcon, Clock, MapPin, Leaf, Upload, Flame, Calendar } from 'lucide-react';
import { autoMigration } from '@/lib/auto-migration';

// Analytics component with multiple analytics views
const Analytics: React.FC = () => {
  const { sessions } = useConsumptionStore();
  const [activeTab, setActiveTab] = useState<'core' | 'frequency' | 'location' | 'strain' | 'intensity' | 'seasonal' | 'holiday'>('core');

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-6 w-6 text-green-600" />
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <span className="text-sm text-gray-500 ml-auto">
          Based on {sessions.length} session{sessions.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      {/* Analytics Tabs */}
      <div className="mb-6">
        {/* Desktop tabs */}
        <div className="hidden sm:flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('core')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'core'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('frequency')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'frequency'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock className="h-4 w-4" />
            Frequency
          </button>
          <button
            onClick={() => setActiveTab('location')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'location'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MapPin className="h-4 w-4" />
            Locations
          </button>
          <button
            onClick={() => setActiveTab('strain')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'strain'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Leaf className="h-4 w-4" />
            Strains
          </button>
          <button
            onClick={() => setActiveTab('intensity')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'intensity'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Flame className="h-4 w-4" />
            Intensity
          </button>
          <button
            onClick={() => setActiveTab('seasonal')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'seasonal'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Leaf className="h-4 w-4" />
            Seasonal
          </button>
          <button
            onClick={() => setActiveTab('holiday')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'holiday'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calendar className="h-4 w-4" />
            Holiday
          </button>
        </div>

        {/* Mobile tabs - 3x3 grid for more analytics */}
        <div className="grid grid-cols-3 gap-2 sm:hidden">
          <button
            onClick={() => setActiveTab('core')}
            className={`flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'core'
                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
            }`}
          >
            <BarChart3 className="h-3 w-3" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('frequency')}
            className={`flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'frequency'
                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
            }`}
          >
            <Clock className="h-3 w-3" />
            Frequency
          </button>
          <button
            onClick={() => setActiveTab('location')}
            className={`flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'location'
                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
            }`}
          >
            <MapPin className="h-3 w-3" />
            Locations
          </button>
          <button
            onClick={() => setActiveTab('strain')}
            className={`flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'strain'
                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
            }`}
          >
            <Leaf className="h-3 w-3" />
            Strains
          </button>
          <button
            onClick={() => setActiveTab('intensity')}
            className={`flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'intensity'
                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
            }`}
          >
            <Flame className="h-3 w-3" />
            Intensity
          </button>
          <button
            onClick={() => setActiveTab('seasonal')}
            className={`flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'seasonal'
                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
            }`}
          >
            <Leaf className="h-3 w-3" />
            Seasonal
          </button>
        </div>
      </div>
      
      {/* Analytics Content */}
      {activeTab === 'core' && <CoreAnalyticsDashboard sessions={sessions} />}
      {activeTab === 'frequency' && <FrequencyAnalytics sessions={sessions} />}
      {activeTab === 'location' && <LocationAnalytics sessions={sessions} />}
      {activeTab === 'strain' && <StrainAnalytics sessions={sessions} />}
      {activeTab === 'intensity' && <ConsumptionIntensityHeatmap sessions={sessions} />}
      {activeTab === 'seasonal' && <SeasonalAnalysis sessions={sessions} />}
      {activeTab === 'holiday' && <HolidayImpactAnalysis sessions={sessions} />}
    </div>
  );
};

const Settings: React.FC = () => {
  const { preferences, updatePreferences, loadSessions } = useConsumptionStore();
  const [showImportDialog, setShowImportDialog] = useState(false);

  const handlePreferenceChange = (key: keyof typeof preferences, value: string | boolean) => {
    updatePreferences({ [key]: value });
  };

  const handleExportData = async () => {
    try {
      // Dynamic import to avoid ESLint error
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
        loadSessions(); // Refresh the store
        alert('All data cleared successfully!');
      } catch (error) {
        console.error('Failed to clear data:', error);
        alert('Failed to clear data.');
      }
    }
  };

  const handleImportComplete = (count: number) => {
    alert(`Successfully imported ${count} sessions!`);
    loadSessions(); // Refresh the store to show imported data
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="h-6 w-6 text-green-600" />
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>
      
      {/* Location Management Section */}
      <div className="mb-8">
        <LocationManager className="bg-white rounded-lg border border-gray-200 p-6" />
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Preferences</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Location
              </label>
              <input
                type="text"
                value={preferences.defaultLocation}
                onChange={(e) => handlePreferenceChange('defaultLocation', e.target.value)}
                placeholder="e.g., Home, Apartment, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Enable Notifications
                </label>
                <p className="text-sm text-gray-500">
                  Get reminders and updates about your sessions
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.enableNotifications}
                onChange={(e) => handlePreferenceChange('enableNotifications', e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <div className="text-center">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Data Management</h4>
            <p className="text-sm text-gray-500 mb-4">
              Your data is stored in a local database with automatic backup to localStorage for privacy and security.
            </p>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  onClick={() => setShowImportDialog(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Import CSV Data
                </button>
                <button 
                  onClick={handleExportData}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                >
                  Export All Data
                </button>
              </div>
              <button 
                onClick={handleClearData}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <CSVImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
};

const CannabisTracker: React.FC = () => {
  const { activeView, loadSessions, loadFeedbackEntries } = useConsumptionStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Run automatic migration before loading sessions
        await autoMigration.migrateSilently();
        // Load sessions from database (or localStorage if migration failed)
        await loadSessions();
        await loadFeedbackEntries();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, [loadSessions, loadFeedbackEntries]);

  const renderActiveView = () => {
    switch (activeView) {
      case 'log':
        return <ConsumptionForm />;
      case 'history':
        return <ConsumptionHistory />;
      case 'analytics':
        return <Analytics />;
      case 'feedback':
        return <FeedbackNotes />;
      case 'settings':
        return <Settings />;
      default:
        return <ConsumptionForm />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="pb-20 md:pb-6">
        {renderActiveView()}
      </main>
    </div>
  );
};

export default CannabisTracker;
