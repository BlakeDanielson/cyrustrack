'use client';

import { useMemo } from 'react';
import { useSessions } from '@/store/consumption';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Clock, Leaf, MapPin } from 'lucide-react';

export default function AltOverviewPage() {
  const sessions = useSessions();

  const stats = useMemo(() => {
    const total = sessions.length;
    const strains = new Set<string>();
    const locations = new Set<string>();
    for (const s of sessions) {
      if (s.strain_name) strains.add(s.strain_name.trim().toLowerCase());
      if (s.location) locations.add(s.location.trim().toLowerCase());
    }
    return {
      totalSessions: total,
      uniqueStrains: strains.size,
      uniqueLocations: locations.size,
    };
  }, [sessions]);

  const recent = sessions.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500">Quick glance at your activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">All-time logged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Strains</CardTitle>
            <Leaf className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueStrains}</div>
            <p className="text-xs text-muted-foreground">Variety in your logs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
            <MapPin className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueLocations}</div>
            <p className="text-xs text-muted-foreground">Where you consume</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insights</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">Explore deeper analytics in the Analytics tab.</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {recent.length === 0 && (
              <p className="text-sm text-gray-500">No sessions yet. Log your first session to see it here.</p>
            )}
            <ul className="divide-y">
              {recent.map((s) => (
                <li key={s.id} className="py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{s.strain_name || 'Unknown strain'}</p>
                    <p className="text-xs text-gray-500 truncate">{s.location || 'No location'} • {s.vessel} • {s.date} {s.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Use the Log page to capture details quickly.</li>
              <li>Filter your history to find patterns.</li>
              <li>Visit Analytics for trends and insights.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

