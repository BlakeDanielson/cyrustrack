'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Users, Search, X, ChevronDown, Check } from 'lucide-react';

interface WhoWithEntry {
  name: string;
  count: number;
}

interface WhoWithSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const WhoWithSelector: React.FC<WhoWithSelectorProps> = ({
  value,
  onChange,
  placeholder = "Select people...",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [existingNames, setExistingNames] = useState<WhoWithEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse selected names from semicolon-delimited string
  const selectedNames = useMemo(() => {
    if (!value || value.trim() === '') return [];
    return value.split(';').map(n => n.trim()).filter(n => n !== '');
  }, [value]);

  // Filter out already selected names from the dropdown
  const filteredNames = useMemo(() => {
    let filtered = existingNames.filter(
      entry => !selectedNames.some(
        selected => selected.toLowerCase() === entry.name.toLowerCase()
      )
    );
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(entry =>
        entry.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [existingNames, selectedNames, searchTerm]);

  // Check if search term matches an existing name (case-insensitive)
  const searchMatchesExisting = useMemo(() => {
    if (!searchTerm.trim()) return false;
    return existingNames.some(
      entry => entry.name.toLowerCase() === searchTerm.toLowerCase()
    );
  }, [searchTerm, existingNames]);

  // Check if search term is already selected
  const searchAlreadySelected = useMemo(() => {
    if (!searchTerm.trim()) return false;
    return selectedNames.some(
      name => name.toLowerCase() === searchTerm.toLowerCase()
    );
  }, [searchTerm, selectedNames]);

  // Fetch existing names on component mount
  useEffect(() => {
    const fetchNames = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/sessions/who-with');
        if (!response.ok) {
          throw new Error('Failed to fetch names');
        }
        const data = await response.json();
        const names = data.names || [];
        setExistingNames(names);
      } catch (err) {
        console.error('Error fetching who-with names:', err);
        setError('Failed to load previous names');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNames();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add a name to selected list
  const addName = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    
    // Check if already selected (case-insensitive)
    if (selectedNames.some(n => n.toLowerCase() === trimmedName.toLowerCase())) {
      return;
    }
    
    const newSelectedNames = [...selectedNames, trimmedName];
    onChange(newSelectedNames.join('; '));
    setSearchTerm('');
    inputRef.current?.focus();
  };

  // Remove a name from selected list
  const removeName = (nameToRemove: string) => {
    const newSelectedNames = selectedNames.filter(
      n => n.toLowerCase() !== nameToRemove.toLowerCase()
    );
    onChange(newSelectedNames.join('; '));
  };

  // Clear all selected names
  const handleClearAll = () => {
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
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // If there's a search term and it's not already selected
      if (searchTerm.trim() && !searchAlreadySelected) {
        // If it matches a filtered name, add that
        if (filteredNames.length > 0) {
          addName(filteredNames[0].name);
        } else {
          // Otherwise add as new name
          addName(searchTerm);
        }
      }
    } else if (e.key === 'Backspace' && !searchTerm && selectedNames.length > 0) {
      // Remove last selected name when backspace is pressed with empty input
      removeName(selectedNames[selectedNames.length - 1]);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Field with Tags */}
      <div 
        className="min-h-[42px] px-2 py-1.5 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent bg-white cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex flex-wrap gap-1.5 items-center">
          {/* Selected name tags */}
          {selectedNames.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-sm"
            >
              <Users className="h-3 w-3" />
              {name}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeName(name);
                }}
                className="ml-0.5 hover:bg-green-200 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          
          {/* Input for searching/adding */}
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={selectedNames.length === 0 ? placeholder : "Add another..."}
            className="flex-1 min-w-[120px] py-1 px-1 outline-none text-sm bg-transparent"
          />
          
          {/* Action buttons */}
          <div className="flex items-center gap-0.5 ml-auto">
            {/* Clear all button */}
            {selectedNames.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearAll();
                }}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            
            {/* Dropdown toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-hidden">
          {/* Search within dropdown if many names */}
          {existingNames.length > 5 && (
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search names..."
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
              Loading previous names...
            </div>
          ) : (
            <div className="overflow-y-auto max-h-48">
              {/* Empty state - no names at all */}
              {existingNames.length === 0 && !searchTerm && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No previous names found. Type to add a new one.
                </div>
              )}

              {/* Show "Add new" option if typed value is new */}
              {searchTerm.trim() && !searchMatchesExisting && !searchAlreadySelected && (
                <div
                  onClick={() => addName(searchTerm)}
                  className="p-3 border-b border-gray-100 cursor-pointer hover:bg-green-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      Add &quot;<span className="font-medium text-green-700">{searchTerm}</span>&quot; as new
                    </span>
                  </div>
                </div>
              )}

              {/* Already selected indicator */}
              {searchTerm.trim() && searchAlreadySelected && (
                <div className="p-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      &quot;{searchTerm}&quot; is already selected
                    </span>
                  </div>
                </div>
              )}

              {/* Available names list (excludes already selected) */}
              {filteredNames.map((entry) => (
                <div
                  key={entry.name}
                  onClick={() => addName(entry.name)}
                  className="p-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{entry.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {entry.count} {entry.count === 1 ? 'session' : 'sessions'}
                    </span>
                  </div>
                </div>
              ))}

              {/* All names selected */}
              {filteredNames.length === 0 && existingNames.length > 0 && !searchTerm && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  All known names are selected. Type to add a new one.
                </div>
              )}

              {/* No matches for search */}
              {filteredNames.length === 0 && searchTerm && searchMatchesExisting && !searchAlreadySelected && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No additional names match &quot;{searchTerm}&quot;
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WhoWithSelector;
