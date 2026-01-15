'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Wrench, Search, X, ChevronDown, Check, Plus } from 'lucide-react';
import { VesselCategory, getAccessoryConfig } from '@/types/consumption';

interface AccessoryEntry {
  name: string;
  count: number;
}

interface AccessorySelectorProps {
  value: string;
  onChange: (value: string) => void;
  vessel?: string;  // The specific vessel name (e.g., "Simba", "Classic Bubbler")
  vesselCategory?: VesselCategory | string;  // Used for config (allowNA, allowCustom, etc.)
  placeholder?: string;
  className?: string;
}

const AccessorySelector: React.FC<AccessorySelectorProps> = ({
  value,
  onChange,
  vessel,
  vesselCategory,
  placeholder,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [vesselAccessories, setVesselAccessories] = useState<AccessoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get accessory config for current vessel category (for allowNA, allowCustom, placeholder)
  const accessoryConfig = useMemo(() => {
    return getAccessoryConfig(vesselCategory || '');
  }, [vesselCategory]);

  // Derive placeholder from config if not explicitly provided
  const displayPlaceholder = placeholder || accessoryConfig.placeholder || 'Select accessory...';

  // Fetch accessories for the specific vessel when it changes
  useEffect(() => {
    const fetchAccessories = async () => {
      if (!vessel) {
        setVesselAccessories([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        // Fetch accessories filtered by the specific vessel
        const response = await fetch(`/api/sessions/accessories?vessel=${encodeURIComponent(vessel)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch accessories');
        }
        const data = await response.json();
        const accessories = data.accessories || [];
        setVesselAccessories(accessories);
      } catch (err) {
        console.error('Error fetching accessories:', err);
        setError('Failed to load accessories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccessories();
  }, [vessel]);

  // Filter accessories by search term
  const filteredAccessories = useMemo(() => {
    if (!searchTerm.trim()) {
      return vesselAccessories;
    }
    return vesselAccessories.filter(entry =>
      entry.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vesselAccessories, searchTerm]);

  // Check if search term matches an existing accessory (case-insensitive)
  const searchMatchesExisting = useMemo(() => {
    if (!searchTerm.trim()) return false;
    return vesselAccessories.some(
      entry => entry.name.toLowerCase() === searchTerm.toLowerCase()
    );
  }, [searchTerm, vesselAccessories]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Select an accessory
  const selectAccessory = (name: string) => {
    onChange(name);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Clear selection
  const handleClear = () => {
    if (accessoryConfig.allowNA) {
      onChange('N/A');
    }
    setSearchTerm('');
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchTerm.trim()) {
        // If it matches a filtered accessory, select that
        if (filteredAccessories.length > 0) {
          selectAccessory(filteredAccessories[0].name);
        } else if (accessoryConfig.allowCustom) {
          // Otherwise add as new accessory (if allowed)
          selectAccessory(searchTerm.trim());
        }
      }
    }
  };

  // Check if no vessel is selected
  const noVesselSelected = !vessel;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Field */}
      <div 
        className={`min-h-[42px] px-3 py-2 border rounded-md focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent bg-white cursor-pointer ${
          noVesselSelected ? 'border-gray-200 bg-gray-50' : 'border-gray-300'
        }`}
        onClick={() => {
          if (!noVesselSelected) {
            setIsOpen(!isOpen);
            if (!isOpen) inputRef.current?.focus();
          }
        }}
      >
        <div className="flex items-center gap-2">
          <Wrench className={`h-4 w-4 flex-shrink-0 ${noVesselSelected ? 'text-gray-300' : 'text-gray-400'}`} />
          
          {noVesselSelected ? (
            <span className="flex-1 text-sm text-gray-400 italic">
              Select a vessel first
            </span>
          ) : isOpen ? (
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              placeholder={displayPlaceholder}
              className="flex-1 outline-none text-sm bg-transparent"
              autoFocus
            />
          ) : (
            <span className={`flex-1 text-sm ${value && value !== 'None' && value !== 'N/A' ? 'text-gray-900' : 'text-gray-500'}`}>
              {value && value !== 'None' && value !== 'N/A' ? value : displayPlaceholder}
            </span>
          )}
          
          {/* Action buttons */}
          {!noVesselSelected && (
            <div className="flex items-center gap-1">
              {value && value !== 'None' && value !== 'N/A' && accessoryConfig.allowNA && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !noVesselSelected && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-hidden">
          {/* Search within dropdown */}
          {vesselAccessories.length > 5 && (
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search accessories..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 text-sm text-yellow-700 bg-yellow-50">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              Loading accessories...
            </div>
          ) : (
            <div className="overflow-y-auto max-h-48">
              {/* Show "Add new" option if typed value is new and custom is allowed */}
              {searchTerm.trim() && !searchMatchesExisting && accessoryConfig.allowCustom && (
                <div
                  onClick={() => selectAccessory(searchTerm.trim())}
                  className="p-3 border-b border-gray-100 cursor-pointer hover:bg-green-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      Add &quot;<span className="font-medium text-green-700">{searchTerm}</span>&quot; as new accessory
                    </span>
                  </div>
                </div>
              )}

              {/* "N/A" option (only if allowed) */}
              {accessoryConfig.allowNA && (
                <div
                  onClick={() => selectAccessory('N/A')}
                  className={`p-3 cursor-pointer transition-colors border-b border-gray-50 ${
                    value === 'N/A' || value === 'None' ? 'bg-green-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <X className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">N/A</span>
                    </div>
                    {(value === 'N/A' || value === 'None') && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>
              )}

              {/* Available accessories list */}
              {filteredAccessories
                .filter(entry => entry.name !== 'None' && entry.name !== 'N/A')
                .map((entry) => (
                  <div
                    key={entry.name}
                    onClick={() => selectAccessory(entry.name)}
                    className={`p-3 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0 ${
                      value === entry.name ? 'bg-green-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{entry.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {entry.count} {entry.count === 1 ? 'use' : 'uses'}
                        </span>
                        {value === entry.name && (
                          <Check className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}

              {/* Empty state - no accessories found for this vessel */}
              {vesselAccessories.length === 0 && !searchTerm && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  {accessoryConfig.allowCustom 
                    ? `No accessories used with ${vessel} yet. Type to add one.`
                    : `No accessories available for ${vessel}.`
                  }
                </div>
              )}

              {/* No matches for search */}
              {filteredAccessories.length === 0 && searchTerm && !searchMatchesExisting && !accessoryConfig.allowCustom && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No accessories match &quot;{searchTerm}&quot;
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccessorySelector;
