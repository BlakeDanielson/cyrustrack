'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Cigarette, X, ChevronDown, Check, Plus } from 'lucide-react';

// Default tobacco types that are always available
const DEFAULT_TOBACCO_TYPES = [
  'Lucky Strike Red 100s Tobacco',
  'American Sport Cigs Blue',
  'American Spirit Menthol',
  'Unknown'
];

interface TobaccoSelectorProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  className?: string;
}

const TobaccoSelector: React.FC<TobaccoSelectorProps> = ({
  value,
  onChange,
  placeholder = 'Select or type tobacco type...',
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customTypes, setCustomTypes] = useState<string[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch any custom tobacco types from database on mount
  useEffect(() => {
    const fetchCustomTypes = async () => {
      try {
        const response = await fetch('/api/sessions/tobacco');
        if (response.ok) {
          const data = await response.json();
          // Get names that aren't in the default list
          const dbNames = (data.tobaccoTypes || []).map((t: { name: string }) => t.name);
          const custom = dbNames.filter((name: string) => !DEFAULT_TOBACCO_TYPES.includes(name));
          setCustomTypes(custom);
        }
      } catch (err) {
        console.error('Error fetching tobacco types:', err);
      }
    };
    fetchCustomTypes();
  }, []);

  // All available types: defaults + any custom from database
  const allTypes = useMemo(() => {
    return [...DEFAULT_TOBACCO_TYPES, ...customTypes];
  }, [customTypes]);

  // Filter types by search term
  const filteredTypes = useMemo(() => {
    if (!searchTerm.trim()) {
      return allTypes;
    }
    return allTypes.filter(name =>
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allTypes, searchTerm]);

  // Check if search term matches an existing type (case-insensitive)
  const searchMatchesExisting = useMemo(() => {
    if (!searchTerm.trim()) return false;
    return allTypes.some(
      name => name.toLowerCase() === searchTerm.toLowerCase()
    );
  }, [searchTerm, allTypes]);

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

  // Select a tobacco type
  const selectTobacco = (name: string | undefined) => {
    onChange(name);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Clear selection
  const handleClear = () => {
    onChange(undefined);
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
        // If it matches a filtered type, select that
        if (filteredTypes.length > 0) {
          selectTobacco(filteredTypes[0]);
        } else {
          // Otherwise add as new tobacco type
          selectTobacco(searchTerm.trim());
        }
      }
    }
  };

  const displayValue = value && value !== 'None' ? value : '';

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
          <Cigarette className="h-4 w-4 flex-shrink-0 text-gray-400" />
          
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
            <span className={`flex-1 text-sm ${displayValue ? 'text-gray-900' : 'text-gray-500'}`}>
              {displayValue || placeholder}
            </span>
          )}
          
          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {displayValue && (
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
          <div className="overflow-y-auto max-h-48">
            {/* Show "Add new" option if typed value is new */}
            {searchTerm.trim() && !searchMatchesExisting && (
              <div
                onClick={() => selectTobacco(searchTerm.trim())}
                className="p-3 border-b border-gray-100 cursor-pointer hover:bg-green-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-green-600" />
                  <span className="text-sm">
                    Add &quot;<span className="font-medium text-green-700">{searchTerm}</span>&quot; as new tobacco type
                  </span>
                </div>
              </div>
            )}

            {/* "None" option */}
            <div
              onClick={() => selectTobacco(undefined)}
              className={`p-3 cursor-pointer transition-colors border-b border-gray-50 ${
                !value || value === 'None' ? 'bg-green-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">None</span>
                </div>
                {(!value || value === 'None') && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </div>
            </div>

            {/* Available tobacco types list */}
            {filteredTypes
              .filter(name => name !== 'None')
              .map((name) => (
                <div
                  key={name}
                  onClick={() => selectTobacco(name)}
                  className={`p-3 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0 ${
                    value === name ? 'bg-green-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cigarette className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{name}</span>
                    </div>
                    {value === name && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TobaccoSelector;
