// Quantity types for different consumption methods
export type QuantityType = 'decimal' | 'milligrams' | 'size_category';

export interface QuantityValue {
  amount: number;
  unit: string;
  type: QuantityType;
}

// Size categories for flower-based consumption
export const FLOWER_SIZES = ['tiny', 'small', 'medium', 'large'] as const;
export type FlowerSize = typeof FLOWER_SIZES[number];

// Location reference type
export interface LocationReference {
  id: string;
  name: string;
  full_address: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  is_favorite: boolean;
  is_private: boolean;
  nickname?: string;
  usage_count: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

// Image type for session images
export interface SessionImage {
  id: string;
  session_id: string;
  blob_url: string;
  filename: string;
  file_size: number;
  mime_type: string;
  width?: number;
  height?: number;
  alt_text?: string;
  created_at: string;
}

export interface FeedbackEntry {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// Consumption session data types
export interface ConsumptionSession {
  id: string;

  // Core Fields
  date: string;
  time: string;
  
  // Location data (prioritizes normalized location over legacy fields)
  location: string;           // Display name (from location_ref.name or legacy field)
  latitude?: number;          // Coordinates (from location_ref or legacy fields)
  longitude?: number;         // Coordinates (from location_ref or legacy fields)
  location_ref?: LocationReference; // Full location relationship (when available)
  
  who_with: string;
  vessel_category: string;  // Main category: Bong, Pipe, Joint, Pen, etc.
  vessel: string;           // Specific item: Simba, Classic Bubbler, etc.
  accessory_used: string;
  my_vessel: boolean;
  my_substance: boolean;
  strain_name: string;
  strain_type?: string;
  thc_percentage?: number;
  purchased_legally: boolean;
  state_purchased?: string;
  tobacco?: string; // Tobacco type: None, Lucky Strike Red 100s Tobacco, American Sport Cigs Blue, American Spirit Menthol, or custom
  kief: boolean;
  concentrate: boolean;
  lavender: boolean;

  // User notes and comments
  comments?: string;

  // Enhanced quantity system
  quantity: QuantityValue;

  // Legacy support - remove after migration
  quantity_legacy?: number;

  // Images
  images?: SessionImage[];

  // Metadata
  created_at: string;
  updated_at: string;
}

// Type for creating/updating consumption sessions from the client.
// selectedLocationId lets the form link directly to an existing normalized location.
export type CreateConsumptionSession = Omit<ConsumptionSession, 'id' | 'created_at' | 'updated_at'> & {
  selectedLocationId?: string;
};

// Vessel categories (main types of consumption devices)
export const VESSEL_CATEGORIES = [
  'Bong',
  'Joint',
  'Pipe',
  'Pen',
  'Edible',
  'Tincture',
  'Pre-roll',
  'Blunt',
  'Dab Rig',
  'Other'
] as const;

export type VesselCategory = typeof VESSEL_CATEGORIES[number];

// Legacy type alias for backward compatibility
export const VESSEL_TYPES = VESSEL_CATEGORIES;
export type VesselType = VesselCategory;

// Quantity configuration for each vessel category
export const VESSEL_QUANTITY_CONFIG: Record<VesselCategory, { type: QuantityType; unit: string; placeholder?: string; step?: number; options?: readonly string[] }> = {
  'Bong': { type: 'size_category' as QuantityType, unit: 'bowl size', options: FLOWER_SIZES },
  'Joint': { type: 'decimal' as QuantityType, unit: 'joint portion', placeholder: '0.25', step: 0.01 },
  'Pipe': { type: 'size_category' as QuantityType, unit: 'bowl size', options: FLOWER_SIZES },
  'Pen': { type: 'decimal' as QuantityType, unit: 'puffs', placeholder: '5', step: 1 },
  'Edible': { type: 'milligrams' as QuantityType, unit: 'mg THC', placeholder: '10', step: 1 },
  'Tincture': { type: 'milligrams' as QuantityType, unit: 'mg THC', placeholder: '5', step: 1 },
  'Pre-roll': { type: 'decimal' as QuantityType, unit: 'joint portion', placeholder: '0.5', step: 0.1 },
  'Blunt': { type: 'decimal' as QuantityType, unit: 'blunt portion', placeholder: '0.25', step: 0.01 },
  'Dab Rig': { type: 'decimal' as QuantityType, unit: 'dabs', placeholder: '1', step: 0.5 },
  'Other': { type: 'decimal' as QuantityType, unit: 'units', placeholder: '1', step: 0.1 }
};

// Accessory configuration for each vessel category
// Maps vessel types to their compatible accessory patterns
export interface VesselAccessoryConfig {
  patterns: string[];      // Prefix patterns to match (e.g., "Bowl_", "Filter_")
  allowNA: boolean;        // Whether N/A is a valid option
  allowCustom: boolean;    // Whether new accessories can be added
  placeholder: string;     // Placeholder text for the selector
}

export const VESSEL_ACCESSORY_CONFIG: Record<VesselCategory, VesselAccessoryConfig> = {
  'Bong': { patterns: ['Bowl_'], allowNA: true, allowCustom: true, placeholder: 'Select bowl...' },
  'Pipe': { patterns: ['Bowl_'], allowNA: true, allowCustom: true, placeholder: 'Select bowl...' },
  'Joint': { patterns: ['Filter_'], allowNA: false, allowCustom: true, placeholder: 'Select filter...' },
  'Pen': { patterns: [], allowNA: true, allowCustom: false, placeholder: 'N/A' },
  'Edible': { patterns: ['Gummie', 'Mint', 'Pulled Taffy', 'Drink', 'Chocolate', 'Cookie', 'Brownie'], allowNA: true, allowCustom: true, placeholder: 'Select type...' },
  'Tincture': { patterns: ['Dropper'], allowNA: true, allowCustom: false, placeholder: 'Dropper' },
  'Pre-roll': { patterns: ['Filter_'], allowNA: true, allowCustom: true, placeholder: 'Select filter...' },
  'Blunt': { patterns: ['Filter_'], allowNA: true, allowCustom: true, placeholder: 'Select filter...' },
  'Dab Rig': { patterns: [], allowNA: true, allowCustom: true, placeholder: 'Select accessory...' },
  'Other': { patterns: [], allowNA: true, allowCustom: true, placeholder: 'Select accessory...' }
};

// Utility function to get accessory config for a vessel category
export const getAccessoryConfig = (vesselCategory: VesselCategory | string): VesselAccessoryConfig => {
  return VESSEL_ACCESSORY_CONFIG[vesselCategory as VesselCategory] || VESSEL_ACCESSORY_CONFIG['Other'];
};

// Utility function to check if an accessory is compatible with a vessel category
export const isAccessoryCompatible = (accessory: string, vesselCategory: VesselCategory | string): boolean => {
  const config = getAccessoryConfig(vesselCategory);
  
  // N/A is compatible if allowed
  if (accessory === 'N/A' || accessory === 'None') {
    return config.allowNA;
  }
  
  // If no patterns defined, allow all (for Other, Dab Rig, etc.)
  if (config.patterns.length === 0) {
    return true;
  }
  
  // Check if accessory matches any of the allowed patterns
  return config.patterns.some(pattern => accessory.startsWith(pattern));
};

// Utility functions for quantity handling
export const getQuantityConfig = (vesselCategory: VesselCategory) => {
  return VESSEL_QUANTITY_CONFIG[vesselCategory] || VESSEL_QUANTITY_CONFIG['Other'];
};

export const createQuantityValue = (
  vesselCategory: VesselCategory,
  amount: number | FlowerSize
): QuantityValue => {
  const config = getQuantityConfig(vesselCategory);

  if (config.type === 'size_category') {
    const sizeIndex = FLOWER_SIZES.indexOf(amount as FlowerSize);
    return {
      amount: sizeIndex,
      unit: config.unit,
      type: config.type
    };
  }

  return {
    amount: amount as number,
    unit: config.unit,
    type: config.type
  };
};

export const formatQuantity = (quantity: QuantityValue): string => {
  if (quantity.type === 'size_category') {
    return `${FLOWER_SIZES[quantity.amount]} ${quantity.unit}`;
  }
  return `${quantity.amount} ${quantity.unit}`;
};

export const formatThcPercentage = (thcPercentage?: number): string => {
  if (typeof thcPercentage !== 'number' || Number.isNaN(thcPercentage)) {
    return '0.00';
  }
  return thcPercentage.toFixed(2);
};

// Migration helper
export const migrateLegacyQuantity = (vesselCategory: VesselCategory, legacyQuantity: number): QuantityValue => {
  return createQuantityValue(vesselCategory, legacyQuantity);
};

// Note: Accessories are now loaded dynamically from the database via /api/sessions/accessories

// Form state for consumption logging (with simplified quantity input)
export interface ConsumptionFormData extends Omit<CreateConsumptionSession, 'quantity'> {
  // Simplified quantity input - will be converted to QuantityValue on submit
  quantity: number | FlowerSize | '';
  // Optional id for edit mode (set when editing an existing session)
  id?: string;
}

// Filter options for consumption history
export interface ConsumptionFilters {
  startDate?: string;
  endDate?: string;
  strainName?: string;
  location?: string;
  vessel?: string;
  uniqueLocationsOnly?: boolean;
  limit?: number;
  offset?: number;
}

// Analytics data types
export interface ConsumptionStats {
  totalSessions: number;
  mostUsedStrain: string;
  mostUsedVessel: string;
  totalQuantityConsumed: number;
  favoriteLocation: string;
  averageSessionsPerWeek: number;
}

// Enhanced Quantity Analytics Types
export interface QuantityAnalytics {
  totalQuantityByVessel: Record<string, number>;
  averageQuantityByVessel: Record<string, number>;
  quantityTrendOverTime: Array<{
    period: string;
    totalQuantity: number;
    averageQuantity: number;
    sessions: number;
  }>;
  mostConsumedStrains: Array<{ strain: string; totalQuantity: number }>;
  quantityEfficiency: {
    averagePerSession: number;
    mostEfficientVessel: string;
    quantityPerWeek: number;
  };
}

// App state interface
export interface AppState {
  // Current consumption session being logged
  currentSession?: Partial<ConsumptionFormData>;
  
  // All consumption sessions
  sessions: ConsumptionSession[];
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  
  // Filters and search
  filters: ConsumptionFilters;
  searchTerm: string;
  
  // UI state
  activeView: 'log' | 'history' | 'analytics' | 'feedback' | 'settings';
  showMobileMenu: boolean;
  newlyCreatedSessionId: string | null;
  feedbackEntries: FeedbackEntry[];

  // User preferences
  preferences: {
    defaultLocation: string;
    enableNotifications: boolean;
    dataRetentionDays?: number;
  };
}
