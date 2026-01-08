'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Wrench, Search, X, ChevronDown, Check, Plus } from 'lucide-react';

interface AccessoryEntry {
  name: string;
  count: number;
}

interface AccessorySelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const AccessorySelector: React.FC<AccessorySelectorProps> = ({
  value,
  onChange,
  placeholder = "Select accessory...",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [existingAccessories, setExistingAccessories] = useState<AccessoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter accessories based on search
  const filteredAccessories = useMemo(() => {
    if (!searchTerm.trim()) {
      return existingAccessories;
    }
    return existingAccessories.filter(entry =>
      entry.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [existingAccessories, searchTerm]);

  // Check if search term matches an existing accessory (case-insensitive)
  const searchMatchesExisting = useMemo(() => {
    if (!searchTerm.trim()) return false;
    return existingAccessories.some(
      entry => entry.name.toLowerCase() === searchTerm.toLowerCase()
    );
  }, [searchTerm, existingAccessories]);

  // Check if current value matches search
  const isCurrentValue = useMemo(() => {
    if (!searchTerm.trim()) return false;
    return value.toLowerCase() === searchTerm.toLowerCase();
  }, [searchTerm, value]);

  // Fetch existing accessories on component mount
  useEffect(() => {
    const fetchAccessories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/sessions/accessories');
        if (!response.ok) {
          throw new Error('Failed to fetch accessories');
        }
        const data = await response.json();
        const accessories = data.accessories || [];
        setExistingAccessories(accessories);
      } catch (err) {
        console.error('Error fetching accessories:', err);
        setError('Failed to load accessories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccessories();
  }, []);

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
    onChange('None');
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
        } else {
          // Otherwise add as new accessory
          selectAccessory(searchTerm.trim());
        }
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Field */}
      <div 
        className="min-h-[42px] px-3 py-2 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent bg-white cursor-pointer"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) inputRef.current?.focus();
        }}
      >
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-gray-400 flex-shrink-0" />
          
          {isOpen ? (
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 outline-none text-sm bg-transparent"
              autoFocus
            />
          ) : (
            <span className={`flex-1 text-sm ${value && value !== 'None' ? 'text-gray-900' : 'text-gray-500'}`}>
              {value || placeholder}
            </span>
          )}
          
          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {value && value !== 'None' && (
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
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-hidden">
          {/* Search within dropdown */}
          {existingAccessories.length > 5 && (
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
              {/* Show "Add new" option if typed value is new */}
              {searchTerm.trim() && !searchMatchesExisting && (
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

              {/* "None" option always first */}
              <div
                onClick={() => selectAccessory('None')}
                className={`p-3 cursor-pointer transition-colors border-b border-gray-50 ${
                  value === 'None' ? 'bg-green-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <X className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">None</span>
                  </div>
                  {value === 'None' && (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                </div>
              </div>

              {/* Available accessories list */}
              {filteredAccessories
                .filter(entry => entry.name !== 'None')
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

              {/* Empty state */}
              {existingAccessories.length === 0 && !searchTerm && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No accessories found. Type to add a new one.
                </div>
              )}

              {/* No matches for search */}
              {filteredAccessories.length === 0 && searchTerm && searchMatchesExisting && !isCurrentValue && (
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
