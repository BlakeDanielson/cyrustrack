'use client';

import React, { useMemo, useState, useCallback } from 'react';
// react-map-gl v8 uses export subpaths; use the Mapbox-specific entry
import ReactMap, { Marker, Popup } from 'react-map-gl/mapbox-legacy';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ConsumptionSession } from '@/types/consumption';
import { format } from 'date-fns';
import { MapPin, Cannabis, Calendar, Users, Beaker } from 'lucide-react';
import { formatQuantity } from '@/types/consumption';

interface SessionMapProps {
  sessions: ConsumptionSession[];
  height?: string | number;
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
}

interface PopupInfo {
  session: ConsumptionSession;
  latitude: number;
  longitude: number;
}

const SessionMap: React.FC<SessionMapProps> = ({
  sessions,
  height = 400,
  initialViewState = {
    longitude: -95.7129,
    latitude: 37.0902,
    zoom: 4
  }
}) => {
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  
  // Get Mapbox access token
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  // Filter sessions that have coordinates
  const sessionsWithCoordinates = useMemo(() => {
    return sessions.filter(session => 
      session.latitude !== undefined && 
      session.longitude !== undefined &&
      !isNaN(session.latitude) &&
      !isNaN(session.longitude)
    );
  }, [sessions]);

  // Group sessions by location for clustering
  const sessionGroups = useMemo(() => {
    const groups = new Map<string, ConsumptionSession[]>();
    
    sessionsWithCoordinates.forEach(session => {
      // Round coordinates to create location groupings
      const lat = Math.round(session.latitude! * 1000) / 1000;
      const lng = Math.round(session.longitude! * 1000) / 1000;
      const key = `${lat},${lng}`;
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(session);
    });
    
    return Array.from(groups.entries()).map(([key, sessions]) => {
      const [lat, lng] = key.split(',').map(Number);
      return {
        latitude: lat,
        longitude: lng,
        sessions,
        count: sessions.length
      };
    });
  }, [sessionsWithCoordinates]);

  // Calculate bounds for all sessions
  const bounds = useMemo(() => {
    if (sessionsWithCoordinates.length === 0) return null;
    
    const latitudes = sessionsWithCoordinates.map(s => s.latitude!);
    const longitudes = sessionsWithCoordinates.map(s => s.longitude!);
    
    return {
      minLat: Math.min(...latitudes),
      maxLat: Math.max(...latitudes),
      minLng: Math.min(...longitudes),
      maxLng: Math.max(...longitudes)
    };
  }, [sessionsWithCoordinates]);

  // Determine initial view state based on session data
  const viewState = useMemo(() => {
    if (!bounds) return initialViewState;
    
    const centerLat = (bounds.minLat + bounds.maxLat) / 2;
    const centerLng = (bounds.minLng + bounds.maxLng) / 2;
    
    // Calculate zoom level based on bounds
    const latDiff = bounds.maxLat - bounds.minLat;
    const lngDiff = bounds.maxLng - bounds.minLng;
    const maxDiff = Math.max(latDiff, lngDiff);
    
    let zoom = 10;
    if (maxDiff > 10) zoom = 3;
    else if (maxDiff > 5) zoom = 5;
    else if (maxDiff > 1) zoom = 7;
    else if (maxDiff > 0.1) zoom = 10;
    else zoom = 12;
    
    return {
      longitude: centerLng,
      latitude: centerLat,
      zoom
    };
  }, [bounds, initialViewState]);

  const onMarkerClick = useCallback((group: typeof sessionGroups[0]) => {
    // Show popup for the most recent session in the group
    const mostRecentSession = group.sessions.sort(
      (a, b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime()
    )[0];
    
    setPopupInfo({
      session: mostRecentSession,
      latitude: group.latitude,
      longitude: group.longitude
    });
  }, []);

  const getMarkerSize = (count: number) => {
    if (count === 1) return 20;
    if (count <= 5) return 25;
    if (count <= 10) return 30;
    return 35;
  };

  const getMarkerColor = (count: number) => {
    if (count === 1) return '#10b981'; // green-500
    if (count <= 5) return '#059669'; // green-600
    if (count <= 10) return '#047857'; // green-700
    return '#065f46'; // green-800
  };

  // Check if Mapbox token is provided
  if (!mapboxToken || mapboxToken === 'your_mapbox_public_token_here') {
    return (
      <div 
        className="flex items-center justify-center bg-yellow-50 border border-yellow-200 rounded-lg"
        style={{ height }}
      >
        <div className="text-center p-6">
          <MapPin className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Mapbox Token Required</h3>
          <p className="text-gray-600 max-w-sm mb-4">
            To display the interactive map, please add your Mapbox access token to the <code className="bg-gray-100 px-1 rounded">.env.local</code> file.
          </p>
          <p className="text-sm text-gray-500">
            See <code className="bg-gray-100 px-1 rounded">MAPBOX_SETUP.md</code> for setup instructions.
          </p>
        </div>
      </div>
    );
  }

  if (sessionsWithCoordinates.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Location Data</h3>
          <p className="text-gray-500 max-w-sm">
            Sessions need latitude and longitude coordinates to be displayed on the map. 
            Add location coordinates to your sessions to see them here.
          </p>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <MapPin className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Map Error</h3>
          <p className="text-gray-500 max-w-sm">{mapError}</p>
        </div>
      </div>
    );
  }

  // Determine which map style to use
  const getMapStyle = () => {
    // Always use a Mapbox style since we're using react-map-gl
    return 'mapbox://styles/mapbox/streets-v12';
  };

  return (
    <div style={{ height }} className="relative rounded-lg overflow-hidden border border-gray-200">
      <ReactMap
        initialViewState={viewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle={getMapStyle()}
        mapboxAccessToken={mapboxToken}
        attributionControl={false}
        onError={(e) => setMapError('Failed to load map. Please check your internet connection and Mapbox token.')}
      >
        {sessionGroups.map((group, index) => (
          <Marker
            key={index}
            longitude={group.longitude}
            latitude={group.latitude}
            anchor="center"
            onClick={() => onMarkerClick(group)}
          >
            <div 
              className="cursor-pointer transition-transform hover:scale-110 flex items-center justify-center text-white font-bold rounded-full border-2 border-white shadow-lg"
              style={{
                width: getMarkerSize(group.count),
                height: getMarkerSize(group.count),
                backgroundColor: getMarkerColor(group.count),
                fontSize: group.count > 99 ? '8px' : group.count > 9 ? '10px' : '12px'
              }}
            >
              {group.count}
            </div>
          </Marker>
        ))}

        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            anchor="bottom"
            onClose={() => setPopupInfo(null)}
            closeButton={true}
            closeOnClick={false}
            className="session-popup"
          >
            <div className="p-3 min-w-[250px]">
              <div className="flex items-start gap-3 mb-3">
                <Cannabis className="h-5 w-5 text-green-600 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {popupInfo.session.strain_name}
                  </h3>
                  <p className="text-xs text-gray-600 capitalize">
                    {popupInfo.session.vessel} • {formatQuantity(popupInfo.session.quantity)}
                    {popupInfo.session.thc_percentage && ` • THC: ${popupInfo.session.thc_percentage}%`}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {format(new Date(popupInfo.session.date + 'T' + popupInfo.session.time), 'MMM d, yyyy • h:mm a')}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-3 w-3" />
                  <span>{popupInfo.session.location}</span>
                </div>

                {popupInfo.session.who_with && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-3 w-3" />
                    <span>{popupInfo.session.who_with}</span>
                  </div>
                )}

                {(popupInfo.session.tobacco || popupInfo.session.kief || popupInfo.session.concentrate) && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Beaker className="h-3 w-3" />
                    <div className="flex flex-wrap gap-1">
                      {popupInfo.session.tobacco && (
                        <span className="px-1.5 py-0.5 bg-orange-100 text-orange-800 text-xs rounded">
                          Tobacco
                        </span>
                      )}
                      {popupInfo.session.kief && (
                        <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                          Kief
                        </span>
                      )}
                      {popupInfo.session.concentrate && (
                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">
                          Concentrate
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Show multiple sessions count if applicable */}
              {(() => {
                const group = sessionGroups.find(g => g.latitude === popupInfo.latitude && g.longitude === popupInfo.longitude);
                return group && group.count > 1 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                      +{group.count - 1} more session(s) at this location
                    </p>
                  </div>
                );
              })()}
            </div>
          </Popup>
        )}
      </ReactMap>

      {/* Map Attribution */}
      <div className="absolute bottom-0 right-0 bg-white bg-opacity-80 px-2 py-1 text-xs text-gray-600">
        <a 
          href="https://www.maptiler.com/copyright/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:underline"
        >
          © MapTiler
        </a>
        {' • '}
        <a 
          href="https://www.openstreetmap.org/copyright" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:underline"
        >
          © OpenStreetMap
        </a>
      </div>

      {/* Sessions count indicator */}
      <div className="absolute top-3 left-3 bg-white bg-opacity-90 px-3 py-2 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <Cannabis className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-gray-900">
            {sessionsWithCoordinates.length} session{sessionsWithCoordinates.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SessionMap;