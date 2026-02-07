'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Leaf, X, ChevronDown, Check, Plus } from 'lucide-react';

// Predefined strain types
const STRAIN_TYPES = [
  'Sativa',
  'Indica',
  'Hybrid',
  'Sativa-dominant',
  'Indica-dominant',
  'CBD',
] as const;

interface StrainTypeSelectorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  className?: string;
}

const StrainTypeSelector: React.FC<StrainTypeSelectorProps> = ({
  value,
  onChange,
  placeholder = 'Select or type strain type...',
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter types by search term
  const filteredTypes = useMemo(() => {
    if (!searchTerm.trim()) {
      return [...STRAIN_TYPES];
    }
    return STRAIN_TYPES.filter(type =>
      type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Check if search term matches an existing type (case-insensitive)
  const searchMatchesExisting = useMemo(() => {
    if (!searchTerm.trim()) return false;
    return STRAIN_TYPES.some(
      type => type.toLowerCase() === searchTerm.toLowerCase()
    );
  }, [searchTerm]);

  // Check if current value matches an existing type
  const valueMatchesExisting = useMemo(() => {
    if (!value?.trim()) return false;
    return STRAIN_TYPES.some(
      type => type.toLowerCase() === value.toLowerCase()
    );
  }, [value]);

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

  // Select a type
  const selectType = (type: string) => {
    onChange(type);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Clear selection
  const handleClear = () => {
    onChange(undefined);
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
        // If it matches a filtered type, select that
        if (filteredTypes.length > 0) {
          selectType(filteredTypes[0]);
        } else {
          // Otherwise use the typed value as new type
          selectType(searchTerm.trim());
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
          <Leaf className="h-4 w-4 flex-shrink-0 text-green-600" />
          
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

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-72 overflow-hidden">
          {/* Header */}
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Leaf className="h-3 w-3" />
              <span>Strain types</span>
            </div>
          </div>

          <div className="overflow-y-auto max-h-56">
            {/* Show "Add new" option if typed value is new */}
            {searchTerm.trim() && !searchMatchesExisting && (
              <div
                onClick={() => selectType(searchTerm.trim())}
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

            {/* Type list */}
            {filteredTypes.map((type) => (
              <div
                key={type}
                onClick={() => selectType(type)}
                className={`p-3 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0 ${
                  value?.toLowerCase() === type.toLowerCase() ? 'bg-green-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-900">{type}</span>
                  </div>
                  {value?.toLowerCase() === type.toLowerCase() && (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                </div>
              </div>
            ))}

            {/* No matches for search */}
            {filteredTypes.length === 0 && searchTerm && !searchMatchesExisting && (
              <div className="p-4 text-center text-gray-500 text-sm">
                Press Enter to use &quot;{searchTerm}&quot;
              </div>
            )}

            {/* Show current value if it's custom (not in predefined types) */}
            {value && !valueMatchesExisting && !searchTerm && (
              <div className="p-3 bg-green-50 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">{value}</span>
                    <span className="text-xs text-green-600 bg-green-100 px-1.5 py-0.5 rounded">Custom</span>
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

export default StrainTypeSelector;
