'use client';

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MapPin, TrendingUp, Map as MapIcon, Home } from 'lucide-react';
import { ConsumptionSession } from '@/types/consumption';
import SimpleMap from './SimpleMap';

interface LocationAnalyticsProps {
  sessions: ConsumptionSession[];
}

const LocationAnalytics: React.FC<LocationAnalyticsProps> = ({ sessions }) => {
  const locationData = useMemo(() => {
    const locationCounts = new Map<string, number>();
    const locationCoordinates = new Map<string, { lat: number; lng: number; sessions: ConsumptionSession[] }>();

    sessions.forEach(session => {
      const location = session.location.trim();
      locationCounts.set(location, (locationCounts.get(location) || 0) + 1);

      // Store coordinates for locations that have them
      if (session.latitude && session.longitude) {
        if (!locationCoordinates.has(location)) {
          locationCoordinates.set(location, {
            lat: session.latitude,
            lng: session.longitude,
            sessions: []
          });
        }
        locationCoordinates.get(location)!.sessions.push(session);
      }
    });

    const sortedLocations = Array.from(locationCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([location, count]) => ({
        location,
        sessions: count,
        hasCoordinates: locationCoordinates.has(location)
      }));

    return {
      sortedLocations,
      locationCoordinates,
      totalLocations: locationCounts.size
    };
  }, [sessions]);

  const sessionsWithCoordinates = useMemo(() => 
    sessions.filter(s => s.latitude && s.longitude), 
    [sessions]
  );

  const pieData = useMemo(() => {
    return locationData.sortedLocations.slice(0, 6).map((item, index) => ({
      ...item,
      color: `hsl(${120 + index * 30}, 65%, ${45 + index * 5}%)`
    }));
  }, [locationData]);

  const geographicSpread = useMemo(() => {
    const coordinates = sessionsWithCoordinates.map(s => ({ lat: s.latitude!, lng: s.longitude! }));
    
    if (coordinates.length === 0) return { diversity: 0, range: 0 };

    const latitudes = coordinates.map(c => c.lat);
    const longitudes = coordinates.map(c => c.lng);

    const latRange = Math.max(...latitudes) - Math.min(...latitudes);
    const lngRange = Math.max(...longitudes) - Math.min(...longitudes);
    const range = Math.sqrt(latRange * latRange + lngRange * lngRange);

    // Simple diversity score based on unique coordinate clusters
    const uniqueCoordinates = new Set(coordinates.map(c => `${Math.round(c.lat * 100)},${Math.round(c.lng * 100)}`));
    const diversity = uniqueCoordinates.size;

    return { diversity, range: Math.round(range * 100) / 100 };
  }, [sessionsWithCoordinates]);

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Location Data</h3>
          <p className="text-gray-500">Log some sessions with locations to see analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Locations</p>
              <p className="text-2xl font-bold text-gray-900">
                {locationData.totalLocations}
              </p>
              <p className="text-xs text-gray-500">unique places</p>
            </div>
            <div className="p-2 rounded-full bg-blue-50 text-blue-600">
              <MapPin className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Most Frequent</p>
              <p className="text-lg font-bold text-gray-900 truncate">
                {locationData.sortedLocations[0]?.location || 'N/A'}
              </p>
              <p className="text-xs text-gray-500">
                {locationData.sortedLocations[0]?.sessions || 0} sessions
              </p>
            </div>
            <div className="p-2 rounded-full bg-green-50 text-green-600">
              <Home className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Geographic Diversity</p>
              <p className="text-2xl font-bold text-gray-900">
                {geographicSpread.diversity}
              </p>
              <p className="text-xs text-gray-500">distinct areas</p>
            </div>
            <div className="p-2 rounded-full bg-purple-50 text-purple-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mapped Sessions</p>
              <p className="text-2xl font-bold text-gray-900">
                {sessionsWithCoordinates.length}
              </p>
              <p className="text-xs text-gray-500">
                of {sessions.length} total
              </p>
            </div>
            <div className="p-2 rounded-full bg-orange-50 text-orange-600">
              <MapIcon className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapIcon className="h-5 w-5 text-green-600" />
          Session Locations Map
        </h3>
        <SimpleMap 
          sessions={sessions} 
          height={400}
        />
      </div>

      {/* Location Frequency Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Top Locations */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Consumption Locations</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationData.sortedLocations.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="location" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value) => [`${value} sessions`, 'Sessions']}
                  labelStyle={{ fontSize: '12px' }}
                />
                <Bar 
                  dataKey="sessions" 
                  fill="#10b981" 
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Location Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="sessions"
                  label={({ location, sessions, percent }) => 
                    `${location}: ${sessions} (${percent ? (percent * 100).toFixed(0) : '0'}%)`
                  }
                  labelLine={false}
                  fontSize={10}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} sessions`, 'Sessions']}
                  labelStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Location Details Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sessions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mapped
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {locationData.sortedLocations.slice(0, 10).map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.sessions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {((item.sessions / sessions.length) * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.hasCoordinates 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.hasCoordinates ? 'Yes' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LocationAnalytics;
