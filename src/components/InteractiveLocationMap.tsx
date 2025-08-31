'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ReactMap, { Marker, NavigationControl, ViewStateChangeEvent } from 'react-map-gl/mapbox-legacy';
import { MapPin, Eye, EyeOff } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

interface InteractiveLocationMapProps {
  latitude?: number;
  longitude?: number;
  onLocationChange?: (lat: number, lng: number) => void;
  className?: string;
  height?: string;
  showControls?: boolean;
  initialZoom?: number;
}

interface ViewState {
  latitude: number;
  longitude: number;
  zoom: number;
}

const InteractiveLocationMap: React.FC<InteractiveLocationMapProps> = ({
  latitude,
  longitude,
  onLocationChange,
  className = "",
  height = "300px",
  showControls = true,
  initialZoom = 13
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [viewState, setViewState] = useState<ViewState>({
    latitude: latitude || 40.7128, // Default to NYC if no coordinates
    longitude: longitude || -74.0060,
    zoom: initialZoom
  });

  // Get Mapbox access token from environment variables
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  // Update view state when props change
  useEffect(() => {
    if (latitude && longitude) {
      setViewState(prev => ({
        ...prev,
        latitude,
        longitude
      }));
    }
  }, [latitude, longitude]);

  // Handle marker drag end
  const handleMarkerDragEnd = useCallback((event: { lngLat: { lat: number; lng: number } }) => {
    const newLat = event.lngLat.lat;
    const newLng = event.lngLat.lng;
    
    // Update local state
    setViewState(prev => ({
      ...prev,
      latitude: newLat,
      longitude: newLng
    }));

    // Notify parent component
    onLocationChange?.(newLat, newLng);
  }, [onLocationChange]);

  // Handle map click to move marker
  const handleMapClick = useCallback((event: { lngLat: { lat: number; lng: number } }) => {
    const newLat = event.lngLat.lat;
    const newLng = event.lngLat.lng;
    
    // Update local state
    setViewState(prev => ({
      ...prev,
      latitude: newLat,
      longitude: newLng
    }));

    // Notify parent component
    onLocationChange?.(newLat, newLng);
  }, [onLocationChange]);

  // Show error if no access token
  if (!accessToken) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-md p-4 ${className}`}>
        <div className="flex items-center">
          <MapPin className="h-5 w-5 text-yellow-600 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Map Configuration Required
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your environment variables to enable the interactive map.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Toggle Visibility Button */}
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Interactive Location Map
        </h3>
        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
        >
          {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          {isVisible ? 'Hide' : 'Show'} Map
        </button>
      </div>

      {isVisible && (
        <div 
          className="relative border border-gray-300 rounded-md overflow-hidden shadow-sm"
          style={{ height }}
        >
          <ReactMap
            {...viewState}
            onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
            onLoad={() => setMapLoaded(true)}
            onClick={handleMapClick}
            mapboxAccessToken={accessToken}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            attributionControl={false}
          >
            {/* Draggable Marker */}
            {mapLoaded && (
              <Marker
                latitude={viewState.latitude}
                longitude={viewState.longitude}
                draggable={true}
                onDragEnd={handleMarkerDragEnd}
              >
                <div className="cursor-move">
                  <MapPin 
                    className="h-8 w-8 text-red-500 drop-shadow-lg" 
                    fill="currentColor"
                  />
                </div>
              </Marker>
            )}

            {/* Navigation Controls */}
            {showControls && <NavigationControl />}
          </ReactMap>

          {/* Instructions Overlay */}
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-600 shadow-sm">
            Click or drag the pin to adjust location
          </div>


        </div>
      )}

      {/* Accessibility Note */}
      <p className="text-xs text-gray-500 mt-1">
        {isVisible 
          ? "Drag the red pin or click anywhere on the map to set your exact location. The coordinates will be automatically updated."
          : "Click 'Show Map' to interactively set your location with a draggable pin."
        }
      </p>
    </div>
  );
};

export default InteractiveLocationMap;
