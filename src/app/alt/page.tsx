'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { useSessions } from '@/store/consumption';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Clock, Leaf, MapPin, Star, Zap } from 'lucide-react';

export default function AltOverviewPage() {
  const sessions = useSessions();

  const stats = useMemo(() => {
    const total = sessions.length;
    const strains = new Map<string, number>();
    const locations = new Map<string, number>();
    const vessels = new Map<string, number>();
    for (const s of sessions) {
      if (s.strain_name) {
        const key = s.strain_name.trim();
        strains.set(key, (strains.get(key) || 0) + 1);
      }
      if (s.location) {
        const key = s.location.trim();
        locations.set(key, (locations.get(key) || 0) + 1);
      }
      if (s.vessel) {
        const key = s.vessel.trim();
        vessels.set(key, (vessels.get(key) || 0) + 1);
      }
    }
    const top = (map: Map<string, number>) => {
      const arr = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
      return {
        count: map.size,
        favorite: arr[0]?.[0] || 'N/A',
        favoriteCount: arr[0]?.[1] || 0,
      };
    };
    const strainsTop = top(strains);
    const locationsTop = top(locations);
    const vesselsTop = top(vessels);
    return {
      totalSessions: total,
      uniqueStrains: strainsTop.count,
      uniqueLocations: locationsTop.count,
      favoriteStrain: strainsTop.favorite,
      favoriteLocation: locationsTop.favorite,
      preferredVessel: vesselsTop.favorite,
    };
  }, [sessions]);

  const recent = sessions.slice(0, 8);
  const recentImages = useMemo(() => {
    const images: { id: string; url: string; alt: string }[] = [];
    for (const s of sessions) {
      if (s.images && s.images.length > 0) {
        for (const img of s.images) {
          images.push({ id: img.id, url: img.blob_url, alt: img.alt_text || img.filename });
        }
      }
      if (images.length >= 8) break;
    }
    return images.slice(0, 8);
  }, [sessions]);

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
            <CardTitle>Favorites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-600" />
                  <span className="text-gray-600">Favorite strain</span>
                </div>
                <span className="font-medium text-gray-900">{stats.favoriteStrain}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="text-gray-600">Favorite location</span>
                </div>
                <span className="font-medium text-gray-900">{stats.favoriteLocation}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <span className="text-gray-600">Preferred method</span>
                </div>
                <span className="font-medium text-gray-900">{stats.preferredVessel}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Images */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Recent Images</CardTitle>
          </CardHeader>
          <CardContent>
            {recentImages.length === 0 ? (
              <p className="text-sm text-gray-500">Add images when logging to see them here.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {recentImages.map((img) => (
                  <div key={img.id} className="relative aspect-square overflow-hidden rounded-lg border border-gray-200">
                    <Image
                      src={img.url}
                      alt={img.alt}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 12vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

