'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Edit, Save, X, Search, Navigation, RotateCcw, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { reverseGeocodeCached } from '@/lib/geocoding';
import 'mapbox-gl/dist/mapbox-gl.css';

// Map imports with error handling
let ReactMap: any = null;
let Marker: any = null;
let NavigationControl: any = null;

try {
  // Use the same import pattern as SessionMap
  const mapModule = require('react-map-gl/mapbox-legacy');
  ReactMap = mapModule.default;
  Marker = mapModule.Marker;
  NavigationControl = mapModule.NavigationControl;
} catch (error) {
  console.warn('Map components not available:', error);
}

interface LocationData {
  id: string;
  name: string;
  full_address: string;
  latitude?: number;
  longitude?: number;
  sessionCount: number;
  isLegacy: boolean;
  city?: string;
  state?: string;
  country?: string;
}

interface LocationManagerProps {
  className?: string;
}

const LocationManager: React.FC<LocationManagerProps> = ({ className = '' }) => {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingLocation, setEditingLocation] = useState<LocationData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewState, setViewState] = useState({
    longitude: -98.5795,
    latitude: 39.8283,
    zoom: 4
  });
  const [expandedLocation, setExpandedLocation] = useState<string | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');

  // Get Mapbox token from environment
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
    setMapboxToken(token);
  }, []);

  // Fetch all unique locations
  const fetchLocations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/locations/unique');
      const data = await response.json();

      if (data.success) {
        setLocations(data.locations);
        
        // Auto-center map on first location with coordinates
        const firstLocationWithCoords = data.locations.find((loc: LocationData) => 
          loc.latitude && loc.longitude
        );
        
        if (firstLocationWithCoords) {
          setViewState(prev => ({
            ...prev,
            longitude: firstLocationWithCoords.longitude!,
            latitude: firstLocationWithCoords.latitude!,
            zoom: 10
          }));
        }
      } else {
        setError(data.error || 'Failed to fetch locations');
      }
    } catch (err) {
      setError('Failed to load locations');
      console.error('Location fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Filter locations based on search term
  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.full_address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle coordinate updates with optional reverse geocoding
  const handleCoordinateUpdate = async (locationId: string, latitude: number, longitude: number, address?: string, withReverseGeocode = false) => {
    try {
      const location = locations.find(loc => loc.id === locationId);
      if (!location) return;

      let finalAddress = address;

      // Perform reverse geocoding if requested and no address provided
      if (withReverseGeocode && !address) {
        try {
          const geocodeResult = await reverseGeocodeCached({ latitude, longitude });
          if (geocodeResult.formatted_address) {
            finalAddress = geocodeResult.formatted_address;
          }
        } catch (geocodeError) {
          console.warn('Reverse geocoding failed:', geocodeError);
          // Continue with update even if reverse geocoding fails
        }
      }

      const response = await fetch('/api/locations/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationId,
          latitude,
          longitude,
          address: finalAddress,
          isLegacy: location.isLegacy
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the location in state
        setLocations(prev => prev.map(loc => 
          loc.id === locationId 
            ? { 
                ...loc, 
                latitude, 
                longitude,
                ...(finalAddress && { name: finalAddress, full_address: finalAddress })
              }
            : loc
        ));
        
        setEditingLocation(null);
        
        // Show success feedback (you could add a toast notification here)
        console.log(`Updated location coordinates for ${location.name}`);
      } else {
        throw new Error(data.error || 'Failed to update location');
      }
    } catch (err) {
      console.error('Error updating location:', err);
      setError(err instanceof Error ? err.message : 'Failed to update location');
    }
  };

  // Handle map marker drag with reverse geocoding
  const onMarkerDragEnd = useCallback((locationId: string, event: any) => {
    const { lng, lat } = event.lngLat;
    handleCoordinateUpdate(locationId, lat, lng, undefined, true); // Enable reverse geocoding
  }, []);

  // Get locations with coordinates for map display
  const locationsWithCoords = filteredLocations.filter(loc => 
    loc.latitude !== null && loc.longitude !== null && 
    loc.latitude !== undefined && loc.longitude !== undefined
  );

  if (loading) {
    return (
      <div className={`${className} space-y-4`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} space-y-6`}>
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Location Management</h2>
        <p className="text-sm text-gray-600">
          View and edit the coordinates for all your consumption locations. Drag pins on the map to update coordinates.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {/* Map Section */}
      {ReactMap && mapboxToken && locationsWithCoords.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-green-600" />
            Interactive Location Map
            <span className="text-sm text-gray-500 font-normal">
              (Drag pins to update coordinates)
            </span>
          </h3>
          
          <div style={{ height: '400px' }} className="rounded-lg overflow-hidden border border-gray-200">
            <ReactMap
              initialViewState={viewState}
              style={{ width: '100%', height: '100%' }}
              mapStyle="mapbox://styles/mapbox/streets-v12"
              mapboxAccessToken={mapboxToken}
              attributionControl={false}
              onMove={(evt) => setViewState(evt.viewState)}
            >
              <NavigationControl position="top-right" />
              
              {locationsWithCoords.map((location) => (
                <Marker
                  key={location.id}
                  longitude={location.longitude!}
                  latitude={location.latitude!}
                  anchor="center"
                  draggable={true}
                  onDragEnd={(event) => onMarkerDragEnd(location.id, event)}
                >
                  <div 
                    className="cursor-move bg-green-600 text-white rounded-full border-2 border-white shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                    style={{ width: '24px', height: '24px' }}
                    title={`${location.name} (${location.sessionCount} sessions)`}
                  >
                    <MapPin className="h-3 w-3" />
                  </div>
                </Marker>
              ))}
            </ReactMap>
          </div>
        </div>
      )}

      {/* Locations List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-md font-medium text-gray-900">
            All Locations ({filteredLocations.length})
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Click to expand details and edit coordinates manually
          </p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredLocations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No locations found</p>
              <p className="text-sm">Start logging sessions to see locations here.</p>
            </div>
          ) : (
            filteredLocations.map((location) => (
              <div key={location.id} className="p-4">
                <div 
                  className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded"
                  onClick={() => setExpandedLocation(
                    expandedLocation === location.id ? null : location.id
                  )}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-shrink-0">
                      <MapPin className={`h-5 w-5 ${location.latitude && location.longitude ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {location.name}
                        {location.isLegacy && (
                          <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                            Legacy
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-500 truncate">
                        {location.full_address}
                      </p>
                      <p className="text-xs text-gray-400">
                        {location.sessionCount} session{location.sessionCount !== 1 ? 's' : ''}
                        {location.latitude && location.longitude && (
                          <span className="ml-2">
                            • {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!location.latitude || !location.longitude ? (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                        No coordinates
                      </span>
                    ) : null}
                    {expandedLocation === location.id ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {expandedLocation === location.id && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="block text-gray-600 mb-1">Latitude</label>
                        <input
                          type="number"
                          step="0.000001"
                          value={location.latitude || ''}
                          onChange={(e) => {
                            const newLat = parseFloat(e.target.value);
                            if (!isNaN(newLat)) {
                              setLocations(prev => prev.map(loc => 
                                loc.id === location.id 
                                  ? { ...loc, latitude: newLat }
                                  : loc
                              ));
                            }
                          }}
                          className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                          placeholder="e.g., 40.7128"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 mb-1">Longitude</label>
                        <input
                          type="number"
                          step="0.000001"
                          value={location.longitude || ''}
                          onChange={(e) => {
                            const newLng = parseFloat(e.target.value);
                            if (!isNaN(newLng)) {
                              setLocations(prev => prev.map(loc => 
                                loc.id === location.id 
                                  ? { ...loc, longitude: newLng }
                                  : loc
                              ));
                            }
                          }}
                          className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                          placeholder="e.g., -74.0060"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (location.latitude && location.longitude) {
                              setViewState(prev => ({
                                ...prev,
                                longitude: location.longitude!,
                                latitude: location.latitude!,
                                zoom: 15
                              }));
                            }
                          }}
                          disabled={!location.latitude || !location.longitude}
                          className="flex items-center gap-2 px-3 py-1 text-sm text-green-600 hover:text-green-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          <Navigation className="h-3 w-3" />
                          Center on Map
                        </button>
                        
                        <button
                          onClick={() => {
                            if (location.latitude && location.longitude) {
                              handleCoordinateUpdate(
                                location.id, 
                                location.latitude, 
                                location.longitude,
                                undefined,
                                true // Enable reverse geocoding
                              );
                            }
                          }}
                          disabled={!location.latitude || !location.longitude}
                          className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Get Address
                        </button>
                      </div>
                      
                      <button
                        onClick={() => {
                          if (location.latitude && location.longitude) {
                            handleCoordinateUpdate(
                              location.id, 
                              location.latitude, 
                              location.longitude
                            );
                          }
                        }}
                        disabled={!location.latitude || !location.longitude}
                        className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        <Save className="h-3 w-3" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationManager;
