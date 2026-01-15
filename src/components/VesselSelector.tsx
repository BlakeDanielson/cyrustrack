'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Package, Search, ChevronDown, Check, Plus, ChevronRight, X } from 'lucide-react';
import { VESSEL_CATEGORIES, VesselCategory } from '@/types/consumption';

interface VesselEntry {
  name: string;
  count: number;
}

interface CategoryData {
  category: string;
  count: number;
  vessels: VesselEntry[];
}

interface VesselSelectorProps {
  category: string;
  vessel: string;
  onCategoryChange: (category: string) => void;
  onVesselChange: (vessel: string) => void;
  className?: string;
}

const VesselSelector: React.FC<VesselSelectorProps> = ({
  category,
  vessel,
  onCategoryChange,
  onVesselChange,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriesData, setCategoriesData] = useState<CategoryData[]>([]);
  const [selectedCategoryVessels, setSelectedCategoryVessels] = useState<VesselEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'categories' | 'vessels'>('categories');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch all categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/sessions/vessels');
        if (!response.ok) throw new Error('Failed to fetch vessels');
        const data = await response.json();
        setCategoriesData(data.categories || []);
      } catch (err) {
        console.error('Error fetching vessels:', err);
        setError('Failed to load vessels');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Update vessels list when category changes (but don't auto-switch view)
  useEffect(() => {
    if (category) {
      const catData = categoriesData.find(c => c.category === category);
      setSelectedCategoryVessels(catData?.vessels || []);
    } else {
      setSelectedCategoryVessels([]);
    }
  }, [category, categoriesData]);

  // Filter vessels based on search
  const filteredVessels = useMemo(() => {
    if (!searchTerm.trim()) return selectedCategoryVessels;
    return selectedCategoryVessels.filter(v => 
      v.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [selectedCategoryVessels, searchTerm]);

  // Check if search term matches existing vessel
  const searchMatchesExisting = useMemo(() => {
    if (!searchTerm.trim()) return false;
    return selectedCategoryVessels.some(
      v => v.name.toLowerCase() === searchTerm.toLowerCase()
    );
  }, [searchTerm, selectedCategoryVessels]);

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

  const handleCategorySelect = (cat: string) => {
    onCategoryChange(cat);
    const catData = categoriesData.find(c => c.category === cat);
    setSelectedCategoryVessels(catData?.vessels || []);
    setViewMode('vessels');
    setSearchTerm('');
    // Auto-select first vessel if available
    if (catData?.vessels && catData.vessels.length > 0) {
      onVesselChange(catData.vessels[0].name);
    }
  };

  const handleVesselSelect = (vesselName: string) => {
    onVesselChange(vesselName);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onCategoryChange('');
    onVesselChange('');
    setSelectedCategoryVessels([]);
    setViewMode('categories');
    setSearchTerm('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    } else if (e.key === 'Enter' && viewMode === 'vessels') {
      e.preventDefault();
      if (searchTerm.trim() && !searchMatchesExisting) {
        handleVesselSelect(searchTerm.trim());
      } else if (filteredVessels.length > 0) {
        handleVesselSelect(filteredVessels[0].name);
      }
    }
  };


  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Display Field */}
      <div 
        className="min-h-[42px] px-3 py-2 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent bg-white cursor-pointer"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            // Always start in categories view
            setViewMode('categories');
          }
        }}
      >
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-gray-400 flex-shrink-0" />
          
          <div className="flex-1 flex items-center gap-2">
            {category && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                {category}
              </span>
            )}
            {vessel && (
              <span className="text-sm text-gray-900 truncate">{vessel}</span>
            )}
            {!category && !vessel && (
              <span className="text-sm text-gray-500">Select category & vessel...</span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {(category || vessel) && (
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
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-hidden">
          {/* Navigation Header */}
          {viewMode === 'vessels' && category && (
            <div className="p-2 border-b border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={() => setViewMode('categories')}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              >
                ← Back to categories
              </button>
              <div className="mt-1 text-sm font-medium text-gray-700">
                {category}
              </div>
            </div>
          )}

          {/* Search (only in vessels view) */}
          {viewMode === 'vessels' && selectedCategoryVessels.length > 5 && (
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search or add new..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 text-sm text-yellow-700 bg-yellow-50">{error}</div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
          ) : viewMode === 'categories' ? (
            /* Categories View */
            <div className="overflow-y-auto max-h-64">
              {VESSEL_CATEGORIES.map((cat) => {
                const catData = categoriesData.find(c => c.category === cat);
                const count = catData?.count || 0;
                
                return (
                  <div
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className={`p-3 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0 hover:bg-gray-50 ${
                      category === cat ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{cat}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {count} {count === 1 ? 'session' : 'sessions'}
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Vessels View */
            <div className="overflow-y-auto max-h-64">
              {/* Add new option */}
              {searchTerm.trim() && !searchMatchesExisting && (
                <div
                  onClick={() => handleVesselSelect(searchTerm.trim())}
                  className="p-3 border-b border-gray-100 cursor-pointer hover:bg-green-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      Add &quot;<span className="font-medium text-green-700">{searchTerm}</span>&quot; as new
                    </span>
                  </div>
                </div>
              )}

              {/* Vessel list */}
              {filteredVessels.map((v) => (
                <div
                  key={v.name}
                  onClick={() => handleVesselSelect(v.name)}
                  className={`p-3 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0 ${
                    vessel === v.name ? 'bg-green-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{v.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {v.count} {v.count === 1 ? 'use' : 'uses'}
                      </span>
                      {vessel === v.name && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty state */}
              {filteredVessels.length === 0 && !searchTerm && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No vessels found. Type to add a new one.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VesselSelector;
