/**
 * CSV Data Migration Script
 * Imports historical consumption data from CSV format into the Neon database
 */

import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { geocodeLocationCached } from './geocoding';
import { createQuantityValue, type VesselType, type QuantityValue } from '../types/consumption';
import { prisma } from './prisma';

export interface CSVRow {
  'Instance (Blake Tracking)': string;
  'Day of Week': string;
  'When': string;
  'Location': string;
  'City': string;
  'State': string;
  'Alone?': string;
  'People': string;
  'Vessel': string;
  'Accessory Used': string;
  'Your Vessel': string;
  'Your Substance': string;
  'Strain': string;
  'Type': string;
  'THC %': string;
  'Legal Product_Purchased?': string;
  'State Purchased?': string;
  'Tobacco': string;
  'Kief': string;
  'Concentrate': string;
  'Lavendar': string;
  'Quantity': string;
  'Comments': string;
}

export interface MigrationStats {
  totalRows: number;
  successfulInserts: number;
  errors: Array<{ row: number; error: string; data?: unknown }>;
  geocodingResults: {
    successful: number;
    failed: number;
  };
  newVessels: string[];
}

/**
 * Parse date from "10/17/22 11:39 AM" format
 */
function parseDateTime(whenString: string): { date: string; time: string } {
  try {
    const [datePart, timePart] = whenString.split(' ');
    const [month, day, year] = datePart.split('/');
    
    // Convert 2-digit year to 4-digit (assuming 2000s)
    const fullYear = year.length === 2 ? `20${year}` : year;
    
    // Format date as YYYY-MM-DD
    const formattedDate = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    
    return {
      date: formattedDate,
      time: timePart || '12:00 PM'
    };
  } catch (error) {
    console.error('Error parsing date:', whenString, error);
    return {
      date: new Date().toISOString().split('T')[0],
      time: '12:00 PM'
    };
  }
}

/**
 * Normalize vessel names to match existing types or create new ones
 */
function normalizeVessel(vesselString: string): string {
  if (!vesselString) return 'Other';
  
  const vessel = vesselString.trim();
  
  // Common mappings
  const vesselMappings: Record<string, string> = {
    'joint': 'Joint',
    'joints': 'Joint',
    'pipe': 'Pipe',
    'bowl': 'Pipe',
    'bong': 'Bong',
    'vape': 'Vape Pen',
    'vape pen': 'Vape Pen',
    'vaporizer': 'Vape Pen',
    'dab rig': 'Dab Rig',
    'rig': 'Dab Rig',
    'edible': 'Edibles',
    'edibles': 'Edibles',
    'tincture': 'Tincture',
    'oil': 'Tincture'
  };
  
  const lowerVessel = vessel.toLowerCase();
  return vesselMappings[lowerVessel] || vessel;
}

/**
 * Parse quantity based on vessel type
 */
function parseQuantity(quantityString: string, vessel: string): QuantityValue {
  if (!quantityString || quantityString.trim() === '') {
    return createQuantityValue(vessel as VesselType, 1);
  }
  
  // Extract numeric value from quantity string
  const numericMatch = quantityString.match(/[\d.]+/);
  const amount = numericMatch ? parseFloat(numericMatch[0]) : 1;
  
  try {
    return createQuantityValue(vessel as VesselType, amount);
  } catch {
    // Fallback to default quantity if vessel type is not recognized
    return {
      amount,
      unit: 'units',
      type: 'decimal'
    };
  }
}

/**
 * Convert boolean-like strings to boolean
 */
function parseBoolean(value: string): boolean {
  if (!value) return false;
  const lower = value.toLowerCase().trim();
  return lower === 'yes' || lower === 'true' || lower === '1';
}

/**
 * Parse THC percentage
 */
function parseThcPercentage(thcString: string): number | undefined {
  if (!thcString || thcString.trim() === '') return undefined;
  
  const numericMatch = thcString.match(/[\d.]+/);
  if (numericMatch) {
    const value = parseFloat(numericMatch[0]);
    // If value is greater than 1, assume it's already a percentage
    // If less than 1, assume it's a decimal (e.g., 0.18 = 18%)
    return value > 1 ? value : value * 100;
  }
  
  return undefined;
}

/**
 * Combine location fields
 */
function combineLocation(location: string, city: string, state: string): string {
  if (location && location.trim()) {
    return location.trim();
  }
  
  if (city && state) {
    return `${city.trim()}, ${state.trim()}`;
  }
  
  return city || state || 'Unknown';
}

/**
 * Determine who_with field from Alone and People fields
 */
function determineWhoWith(alone: string, people: string): string {
  const isAlone = parseBoolean(alone);
  
  if (isAlone) {
    return 'Alone';
  }
  
  if (people && people.trim()) {
    return people.trim();
  }
  
  return 'Unknown';
}

/**
 * Transform CSV row to database record
 */
async function transformCSVRow(row: CSVRow, rowIndex: number): Promise<Record<string, unknown>> {
  const { date, time } = parseDateTime(row.When);
  const location = combineLocation(row.Location, row.City, row.State);
  const vessel = normalizeVessel(row.Vessel);
  
  // Geocode location
  let latitude: number | undefined;
  let longitude: number | undefined;
  
  try {
    const geocodeResult = await geocodeLocationCached(location);
    if (geocodeResult.coordinates) {
      latitude = geocodeResult.coordinates.latitude;
      longitude = geocodeResult.coordinates.longitude;
    }
  } catch (error) {
    console.warn(`Geocoding failed for row ${rowIndex + 1}, location: ${location}`, error);
  }
  
  // Generate ID
  let id = row['Instance (Blake Tracking)'];
  
  // Validate UUID format or generate new one
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!id || !uuidRegex.test(id)) {
    id = uuidv4();
  }
  
  // Parse quantity
  const quantity = parseQuantity(row.Quantity, vessel);
  
  return {
    id,
    date,
    time,
    location,
    latitude,
    longitude,
    who_with: determineWhoWith(row['Alone?'], row.People),
    vessel,
    accessory_used: row['Accessory Used'] || 'None',
    my_vessel: parseBoolean(row['Your Vessel']),
    my_substance: parseBoolean(row['Your Substance']),
    strain_name: row.Strain || 'Unknown',
    strain_type: row.Type || null,
    thc_percentage: parseThcPercentage(row['THC %']),
    purchased_legally: parseBoolean(row['Legal Product_Purchased?']),
    state_purchased: row['State Purchased?'] || null,
    tobacco: parseBoolean(row.Tobacco),
    kief: parseBoolean(row.Kief),
    concentrate: parseBoolean(row.Concentrate),
    lavender: parseBoolean(row.Lavendar),
    quantity: JSON.stringify(quantity),
    comments: row.Comments || null
  };
}

/**
 * Main migration function
 */
export async function migrateCsvData(csvFilePath: string): Promise<MigrationStats> {
  const stats: MigrationStats = {
    totalRows: 0,
    successfulInserts: 0,
    errors: [],
    geocodingResults: {
      successful: 0,
      failed: 0
    },
    newVessels: []
  };
  
  try {
    // Read and parse CSV file
    console.log('Reading CSV file:', csvFilePath);
    const csvContent = readFileSync(csvFilePath, 'utf-8');
    
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as CSVRow[];
    
    stats.totalRows = records.length;
    console.log(`Found ${stats.totalRows} rows to process`);
    
    // Track new vessels
    const vesselsFound = new Set<string>();
    
    // Process each row
    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      console.log(`Processing row ${i + 1}/${records.length}`);
      
      try {
        const transformedData = await transformCSVRow(row, i);
        
        // Track vessels
        const vessel = normalizeVessel(row.Vessel);
        vesselsFound.add(vessel);
        
        // Track geocoding success
        if (transformedData.latitude && transformedData.longitude) {
          stats.geocodingResults.successful++;
        } else {
          stats.geocodingResults.failed++;
        }
        
        // Insert into database
        await prisma.consumptionSession.create({
          data: transformedData
        });
        
        stats.successfulInserts++;
        console.log(`✓ Successfully inserted row ${i + 1}`);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        stats.errors.push({
          row: i + 1,
          error: errorMessage,
          data: row
        });
        console.error(`✗ Error processing row ${i + 1}:`, errorMessage);
      }
    }
    
    stats.newVessels = Array.from(vesselsFound);
    
    console.log('\n=== Migration Complete ===');
    console.log(`Total rows: ${stats.totalRows}`);
    console.log(`Successful inserts: ${stats.successfulInserts}`);
    console.log(`Errors: ${stats.errors.length}`);
    console.log(`Geocoding successful: ${stats.geocodingResults.successful}`);
    console.log(`Geocoding failed: ${stats.geocodingResults.failed}`);
    console.log(`New vessels found: ${stats.newVessels.join(', ')}`);
    
    if (stats.errors.length > 0) {
      console.log('\n=== Errors ===');
      stats.errors.forEach(error => {
        console.log(`Row ${error.row}: ${error.error}`);
      });
    }
    
  } catch (error) {
    console.error('Fatal error during migration:', error);
    stats.errors.push({
      row: 0,
      error: error instanceof Error ? error.message : 'Unknown fatal error'
    });
  }
  
  return stats;
}

/**
 * Dry run function to validate CSV data without inserting
 */
export async function validateCsvData(csvFilePath: string): Promise<{
  isValid: boolean;
  sampleTransformations: Record<string, unknown>[];
  vesselsFound: string[];
  issues: string[];
}> {
  const result = {
    isValid: true,
    sampleTransformations: [] as Record<string, unknown>[],
    vesselsFound: [] as string[],
    issues: [] as string[]
  };
  
  try {
    const csvContent = readFileSync(csvFilePath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as CSVRow[];
    
    const vesselsFound = new Set<string>();
    
    // Process first 5 rows for validation
    const sampleSize = Math.min(5, records.length);
    
    for (let i = 0; i < sampleSize; i++) {
      try {
        const transformed = await transformCSVRow(records[i], i);
        result.sampleTransformations.push({
          original: records[i],
          transformed
        });
        
        vesselsFound.add(normalizeVessel(records[i].Vessel));
        
      } catch (error) {
        result.isValid = false;
        result.issues.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    result.vesselsFound = Array.from(vesselsFound);
    
  } catch (error) {
    result.isValid = false;
    result.issues.push(`Failed to read CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return result;
}

