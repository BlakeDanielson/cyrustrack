'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Cannabis, X, ChevronDown, Check, Plus, Clock } from 'lucide-react';

interface StrainEntry {
  name: string;
  count: number;
  lastUsed: string;
}

interface StrainSelectorProps {
  value: string;
  onChange: (value: string) => void;
  vessel?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

const normalizeForSearch = (value: string) => value.toLowerCase().replace(/\s+/g, '');

const StrainSelector: React.FC<StrainSelectorProps> = ({
  value,
  onChange,
  vessel = '',
  placeholder = 'Select or type strain name...',
  className = "",
  required = false
}) => {
  const MIN_SEARCH_LENGTH = 3;
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [recentStrains, setRecentStrains] = useState<StrainEntry[]>([]);
  const [searchResults, setSearchResults] = useState<StrainEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const vesselQuery = vessel.trim();
  const hasVesselFilter = vesselQuery.length > 0;

  // Fetch recent strain names on component mount
  useEffect(() => {
    const fetchStrains = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ limit: '10' });
        if (hasVesselFilter) {
          params.set('vessel', vesselQuery);
        }
        const response = await fetch(`/api/sessions/strains?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setRecentStrains(data.strains || []);
        }
      } catch (err) {
        console.error('Error fetching strain names:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStrains();
  }, [hasVesselFilter, vesselQuery]);

  // Query strains from dataset when the search term reaches minimum length
  useEffect(() => {
    const query = searchTerm.trim();

    if (!query || query.length < MIN_SEARCH_LENGTH) {
      setSearchResults(null);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          q: query,
          limit: '100',
        });
        if (hasVesselFilter) {
          params.set('vessel', vesselQuery);
        }
        const response = await fetch(`/api/sessions/strains?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error('Failed to fetch strain search results');
        }
        const data = await response.json();
        setSearchResults(data.strains || []);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.error('Error searching strain names:', err);
        setSearchResults([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchTerm, MIN_SEARCH_LENGTH, hasVesselFilter, vesselQuery]);

  // Show recent strains when not searching, otherwise show API search results
  const filteredStrains = useMemo(() => {
    const query = searchTerm.trim();
    if (!query || query.length < MIN_SEARCH_LENGTH) {
      return recentStrains;
    }
    return searchResults || [];
  }, [recentStrains, searchResults, searchTerm, MIN_SEARCH_LENGTH]);

  // Check if search term matches an existing strain (case-insensitive)
  const searchMatchesExisting = useMemo(() => {
    if (!searchTerm.trim()) return false;
    return filteredStrains.some(
      entry => normalizeForSearch(entry.name) === normalizeForSearch(searchTerm)
    );
  }, [searchTerm, filteredStrains]);

  // Check if current value matches an existing strain
  const valueMatchesExisting = useMemo(() => {
    if (!value.trim()) return false;
    return recentStrains.some(
      entry => normalizeForSearch(entry.name) === normalizeForSearch(value)
    );
  }, [value, recentStrains]);

  const queryLength = searchTerm.trim().length;
  const isSearchMode = queryLength >= MIN_SEARCH_LENGTH;

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

  // Select a strain
  const selectStrain = (name: string) => {
    onChange(name);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Clear selection
  const handleClear = () => {
    onChange('');
    setSearchTerm('');
    inputRef.current?.focus();
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
        // If it matches a filtered strain, select that
        if (filteredStrains.length > 0) {
          selectStrain(filteredStrains[0].name);
        } else {
          // Otherwise use the typed value as new strain
          selectStrain(searchTerm.trim());
        }
      }
    }
  };

  // Format relative time for display
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
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
          <Cannabis className="h-4 w-4 flex-shrink-0 text-green-600" />
          
          {isOpen ? (
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              placeholder={value || placeholder}
              className="flex-1 outline-none text-sm bg-transparent"
              autoFocus
              required={required && !value}
            />
          ) : (
            <span className={`flex-1 text-sm ${value ? 'text-gray-900' : 'text-gray-500'}`}>
              {value || placeholder}
            </span>
          )}
          
          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {value && (
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

      {/* Hidden input for form validation */}
      {required && (
        <input
          type="text"
          value={value}
          onChange={() => {}}
          required
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-72 overflow-hidden">
          {/* Header */}
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{isSearchMode ? 'Search results' : 'Recent strains'}</span>
            </div>
            {hasVesselFilter && (
              <div className="mt-1 text-xs text-gray-500 truncate">
                Filtered by vessel: {vesselQuery}
              </div>
            )}
          </div>

          <div className="overflow-y-auto max-h-56">
            {/* Loading state */}
            {isLoading && (
              <div className="p-4 text-center text-gray-500 text-sm">
                Loading strains...
              </div>
            )}

            {/* Show "Add new" option if typed value is new */}
            {searchTerm.trim() && !searchMatchesExisting && (
              <div
                onClick={() => selectStrain(searchTerm.trim())}
                className="p-3 border-b border-gray-100 cursor-pointer hover:bg-green-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-green-600" />
                  <span className="text-sm">
                    Use &quot;<span className="font-medium text-green-700">{searchTerm}</span>&quot;
                  </span>
                </div>
              </div>
            )}

            {/* Minimum character hint */}
            {searchTerm.trim() && queryLength < MIN_SEARCH_LENGTH && (
              <div className="p-3 text-xs text-gray-500 border-b border-gray-100">
                Type at least {MIN_SEARCH_LENGTH} characters to search all strains.
              </div>
            )}

            {/* Empty state */}
            {!isLoading && recentStrains.length === 0 && !searchTerm && (
              <div className="p-4 text-center text-gray-500 text-sm">
                No previous strains found. Type to add one.
              </div>
            )}

            {/* Strain list */}
            {filteredStrains.map((entry) => (
              <div
                key={entry.name}
                onClick={() => selectStrain(entry.name)}
                className={`p-3 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0 ${
                  value.toLowerCase() === entry.name.toLowerCase() ? 'bg-green-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cannabis className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-900">{entry.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {formatRelativeTime(entry.lastUsed)}
                    </span>
                    {value.toLowerCase() === entry.name.toLowerCase() && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>
                <div className="ml-6 mt-0.5">
                  <span className="text-xs text-gray-400">
                    Used {entry.count} {entry.count === 1 ? 'time' : 'times'}
                  </span>
                </div>
              </div>
            ))}

            {/* No matches for search */}
            {!isLoading && isSearchMode && filteredStrains.length === 0 && (
              <div className="p-4 text-center text-gray-500 text-sm">
                No strains match &quot;{searchTerm}&quot;
              </div>
            )}

            {/* Show current value if it's custom (not in recent strains) */}
            {value && !valueMatchesExisting && !searchTerm && (
              <div className="p-3 bg-green-50 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cannabis className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">{value}</span>
                    <span className="text-xs text-green-600 bg-green-100 px-1.5 py-0.5 rounded">Current</span>
                  </div>
                  <Check className="h-4 w-4 text-green-600" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StrainSelector;
