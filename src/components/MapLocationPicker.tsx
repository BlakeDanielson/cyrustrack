'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ReactMap, { Marker, NavigationControl, GeolocateControl, ViewStateChangeEvent } from 'react-map-gl/mapbox-legacy';
import { MapPin, Loader2, Navigation, AlertCircle } from 'lucide-react';
import { reverseGeocodeCached, GeocodeResult } from '@/lib/geocoding';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapLocationPickerProps {
  onLocationSelect: (location: string, coordinates: { lat: number; lng: number }) => void;
  className?: string;
  height?: string;
}

interface ViewState {
  latitude: number;
  longitude: number;
  zoom: number;
}

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  onLocationSelect,
  className = "",
  height = "350px"
}) => {
  // Default center (US center) - will be updated by geolocation
  const DEFAULT_CENTER = { lat: 39.8283, lng: -98.5795 };
  const DEFAULT_ZOOM = 4;
  const LOCATED_ZOOM = 15;

  const [viewState, setViewState] = useState<ViewState>({
    latitude: DEFAULT_CENTER.lat,
    longitude: DEFAULT_CENTER.lng,
    zoom: DEFAULT_ZOOM
  });

  const [pinLocation, setPinLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [geocodedAddress, setGeocodedAddress] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  // Request user's geolocation on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setViewState({
          latitude,
          longitude,
          zoom: LOCATED_ZOOM
        });
        setIsLocating(false);
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        setLocationError('Could not get your location. Tap on the map to select a location.');
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, []);

  // Perform reverse geocoding when pin location changes
  const performReverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    setGeocodedAddress(null);

    try {
      const result: GeocodeResult = await reverseGeocodeCached({ latitude: lat, longitude: lng });
      
      if (result.formatted_address) {
        setGeocodedAddress(result.formatted_address);
        // Notify parent with address and coordinates
        onLocationSelect(result.formatted_address, { lat, lng });
      } else {
        // Fallback to coordinates if no address found
        const coordString = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setGeocodedAddress(coordString);
        onLocationSelect(coordString, { lat, lng });
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      // Fallback to coordinates
      const coordString = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setGeocodedAddress(coordString);
      onLocationSelect(coordString, { lat, lng });
    } finally {
      setIsReverseGeocoding(false);
    }
  }, [onLocationSelect]);

  // Handle map click to drop/move pin
  const handleMapClick = useCallback((event: { lngLat: { lat: number; lng: number } }) => {
    const { lat, lng } = event.lngLat;
    setPinLocation({ lat, lng });
    performReverseGeocode(lat, lng);
  }, [performReverseGeocode]);

  // Handle marker drag end
  const handleMarkerDragEnd = useCallback((event: { lngLat: { lat: number; lng: number } }) => {
    const { lat, lng } = event.lngLat;
    setPinLocation({ lat, lng });
    performReverseGeocode(lat, lng);
  }, [performReverseGeocode]);

  // Handle "Use My Location" button
  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setViewState({
          latitude,
          longitude,
          zoom: LOCATED_ZOOM
        });
        setPinLocation({ lat: latitude, lng: longitude });
        performReverseGeocode(latitude, longitude);
        setIsLocating(false);
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        setLocationError('Could not get your location');
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, [performReverseGeocode]);

  // Show error if no access token
  if (!accessToken) {
    return (
      <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-amber-800">
              Map Configuration Required
            </h3>
            <p className="text-sm text-amber-700 mt-1">
              Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your environment variables to enable the interactive map.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Instructions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {pinLocation ? 'Tap the map or drag the pin to adjust' : 'Tap on the map to drop a pin'}
        </p>
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
          Use My Location
        </button>
      </div>

      {/* Location Error */}
      {locationError && !pinLocation && (
        <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          <p className="text-sm text-amber-800">{locationError}</p>
        </div>
      )}

      {/* Map Container */}
      <div 
        className="relative border border-gray-300 rounded-lg overflow-hidden shadow-sm"
        style={{ height }}
      >
        {/* Loading overlay */}
        {isLocating && (
          <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Getting your location...</span>
            </div>
          </div>
        )}

        <ReactMap
          {...viewState}
          onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
          onLoad={() => setMapLoaded(true)}
          onClick={handleMapClick}
          mapboxAccessToken={accessToken}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          attributionControl={false}
          cursor={pinLocation ? 'default' : 'crosshair'}
        >
          {/* Navigation Controls */}
          <NavigationControl position="top-right" />
          
          {/* Geolocate Control */}
          <GeolocateControl
            position="top-right"
            trackUserLocation={false}
            showUserLocation={true}
            onGeolocate={(e) => {
              const { latitude, longitude } = e.coords;
              setPinLocation({ lat: latitude, lng: longitude });
              performReverseGeocode(latitude, longitude);
            }}
          />

          {/* Pin Marker */}
          {mapLoaded && pinLocation && (
            <Marker
              latitude={pinLocation.lat}
              longitude={pinLocation.lng}
              draggable={true}
              onDragEnd={handleMarkerDragEnd}
              anchor="bottom"
            >
              <div className="cursor-move transform transition-transform hover:scale-110">
                <MapPin 
                  className="h-10 w-10 text-green-600 drop-shadow-lg" 
                  fill="currentColor"
                  strokeWidth={1.5}
                  stroke="white"
                />
              </div>
            </Marker>
          )}
        </ReactMap>

        {/* Crosshair overlay when no pin */}
        {!pinLocation && mapLoaded && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-green-500 rounded-full opacity-50" />
          </div>
        )}
      </div>

      {/* Selected Location Display */}
      {pinLocation && (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              {isReverseGeocoding ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Looking up address...</span>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-900 break-words">
                    {geocodedAddress || 'Selected Location'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {pinLocation.lat.toFixed(6)}, {pinLocation.lng.toFixed(6)}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Helper text */}
      {!pinLocation && (
        <p className="text-xs text-gray-500 text-center">
          Click anywhere on the map to select a location for your session
        </p>
      )}
    </div>
  );
};

export default MapLocationPicker;

