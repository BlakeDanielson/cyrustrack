'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Search, Clock, Star, Users } from 'lucide-react';
import LocationAutocomplete from './LocationAutocomplete';
import InteractiveLocationMap from './InteractiveLocationMap';

interface Location {
  id: string;
  name: string;
  full_address: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  is_favorite: boolean;
  nickname?: string;
  usage_count: number;
  last_used_at?: string;
}

interface LocationSelectorProps {
  value: string;
  latitude?: number;
  longitude?: number;
  onLocationSelect: (location: string, coordinates?: { lat: number; lng: number }, locationId?: string) => void;
  required?: boolean;
  className?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  value,
  latitude,
  longitude,
  onLocationSelect,
  required = false,
  className = ""
}) => {
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [existingLocations, setExistingLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing locations on component mount
  useEffect(() => {
    const fetchExistingLocations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/locations');
        if (!response.ok) {
          throw new Error('Failed to fetch locations');
        }
        const data = await response.json();
        const locations = data.locations || [];
        setExistingLocations(locations);
        setFilteredLocations(locations);
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError('Failed to load existing locations');
        // If we can't load existing locations, default to new mode
        setMode('new');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingLocations();
  }, []);

  // Search locations when search term changes
  useEffect(() => {
    const searchLocations = async () => {
      // Ensure existingLocations is an array
      if (!Array.isArray(existingLocations)) {
        console.warn('existingLocations is not an array:', existingLocations);
        setFilteredLocations([]);
        return;
      }

      if (!searchTerm.trim()) {
        // No search term - show sorted existing locations
        const sorted = [...existingLocations].sort((a, b) => {
          if (a.is_favorite && !b.is_favorite) return -1;
          if (!a.is_favorite && b.is_favorite) return 1;
          if (a.usage_count !== b.usage_count) return b.usage_count - a.usage_count;
          if (a.last_used_at && b.last_used_at) {
            return new Date(b.last_used_at).getTime() - new Date(a.last_used_at).getTime();
          }
          return 0;
        });
        setFilteredLocations(sorted);
      } else {
        // Search term provided - query the API for all matching locations
        try {
          setIsLoading(true);
          const response = await fetch(`/api/locations?q=${encodeURIComponent(searchTerm)}`);
          if (response.ok) {
            const data = await response.json();
            const searchResults = data.locations || [];
            setFilteredLocations(searchResults);
          } else {
            // Fallback to client-side filtering if API fails
            const filtered = existingLocations.filter(location =>
              location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              location.full_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (location.nickname && location.nickname.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredLocations(filtered);
          }
        } catch (error) {
          console.error('Error searching locations:', error);
          // Fallback to client-side filtering
          const filtered = existingLocations.filter(location =>
            location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            location.full_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (location.nickname && location.nickname.toLowerCase().includes(searchTerm.toLowerCase()))
          );
          setFilteredLocations(filtered);
        } finally {
          setIsLoading(false);
        }
      }
    };

    // Debounce the search to avoid too many API calls
    const timeoutId = setTimeout(searchLocations, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, existingLocations]);

  // Check if we should default to existing mode
  useEffect(() => {
    if (existingLocations.length === 0 && !isLoading) {
      setMode('new');
    }
  }, [existingLocations, isLoading]);

  const handleExistingLocationSelect = (location: Location) => {
    setSelectedLocationId(location.id);
    const displayName = location.nickname || location.name;
    const coordinates = location.latitude && location.longitude 
      ? { lat: location.latitude, lng: location.longitude }
      : undefined;
    
    onLocationSelect(displayName, coordinates, location.id);
  };

  const handleNewLocationSelect = (location: string, coordinates?: { lat: number; lng: number }) => {
    setSelectedLocationId(null);
    onLocationSelect(location, coordinates);
  };

  const formatLastUsed = (dateString?: string) => {
    if (!dateString) return 'Never used';
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Mode Selection */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
        <button
          type="button"
          onClick={() => setMode('existing')}
          disabled={existingLocations.length === 0}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            mode === 'existing'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          } ${existingLocations.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center justify-center gap-2">
            <Search className="h-4 w-4" />
            Choose Existing {existingLocations.length > 0 && `(${existingLocations.length})`}
          </div>
        </button>
        <button
          type="button"
          onClick={() => setMode('new')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            mode === 'new'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Location
          </div>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <p className="text-sm text-yellow-800">{error}</p>
        </div>
      )}

      {/* Existing Location Selection */}
      {mode === 'existing' && (
        <div className="space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search your locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {isLoading && searchTerm && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
              </div>
            )}
          </div>

          {/* Locations List */}
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Loading locations...
              </div>
            ) : filteredLocations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'No locations match your search' : 'No saved locations yet'}
              </div>
            ) : (
              filteredLocations.map((location) => (
                <div
                  key={location.id}
                  onClick={() => handleExistingLocationSelect(location)}
                  className={`p-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedLocationId === location.id ? 'bg-green-50 border-green-200' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {location.nickname || location.name}
                        </h4>
                        {location.is_favorite && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      
                      {location.nickname && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {location.name}
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {location.full_address}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {location.usage_count} {location.usage_count === 1 ? 'session' : 'sessions'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {formatLastUsed(location.last_used_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {selectedLocationId === location.id && (
                      <div className="ml-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* New Location Selection */}
      {mode === 'new' && (
        <div className="space-y-4">
          <LocationAutocomplete
            value={value}
            onLocationSelect={handleNewLocationSelect}
            placeholder="Start typing an address or place name..."
            required={required}
          />

          {/* Interactive Map for New Location */}
          {latitude && longitude && (
            <InteractiveLocationMap
              latitude={latitude}
              longitude={longitude}
              onLocationChange={(lat, lng) => {
                handleNewLocationSelect(value, { lat, lng });
              }}
              height="250px"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
