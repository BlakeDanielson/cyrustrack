import { CreateConsumptionSession, createQuantityValue, VesselType, FlowerSize, FLOWER_SIZES, QuantityValue } from '@/types/consumption';

// Interface for raw CSV data
interface CSVRow {
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
  'Lavendar': string; // Note: keeping original spelling from your data
  'Quantity': string;
  'Comments': string;
}

// Vessel mapping from CSV format to app format
const VESSEL_MAPPING: Record<string, VesselType> = {
  'Classic Bubbler': 'Bong',
  'Pen_Cyrus Mortazavi': 'Vape Pen',
  'Joint': 'Joint',
  'Pipe': 'Pipe',
  'Bong': 'Bong',
  'Vape Pen': 'Vape Pen',
  'Dab Rig': 'Dab Rig',
  'Edibles': 'Edibles',
  'Tincture': 'Tincture'
};

// Accessory mapping from CSV format to app format
const ACCESSORY_MAPPING: Record<string, string> = {
  'Bowl_Rounded': 'Glass Screen',
  'N/A': 'None',
  'None': 'None',
  'Grinder': 'Grinder',
  'Rolling Papers': 'Rolling Papers',
  'Lighter': 'Lighter',
  'Torch': 'Torch',
  'Dab Tool': 'Dab Tool',
  'Carb Cap': 'Carb Cap',
  'Glass Screen': 'Glass Screen',
  'Filter Tips': 'Filter Tips'
};

// Parse quantity from CSV format
function parseQuantity(quantityStr: string, vessel: VesselType): QuantityValue {
  const qty = quantityStr.trim();
  
  // Handle hits format (e.g., "Hits_2", "Hits_3")
  if (qty.startsWith('Hits_')) {
    const numHits = parseInt(qty.replace('Hits_', ''));
    return createQuantityValue(vessel, numHits);
  }
  
  // Handle flower size categories
  const lowerQty = qty.toLowerCase();
  if (FLOWER_SIZES.includes(lowerQty as FlowerSize)) {
    return createQuantityValue(vessel, lowerQty as FlowerSize);
  }
  
  // Handle numeric values
  const numericValue = parseFloat(qty);
  if (!isNaN(numericValue)) {
    return createQuantityValue(vessel, numericValue);
  }
  
  // Default fallback
  return createQuantityValue(vessel, 1);
}

// Parse date and time from CSV format
function parseDatetime(whenStr: string): { date: string; time: string } {
  try {
    // Format: "10/17/22 11:39 AM"
    const parts = whenStr.split(' ');
    const datePart = parts[0]; // "10/17/22"
    const timePart = parts.slice(1).join(' '); // "11:39 AM"
    
    // Parse date (MM/DD/YY)
    const [month, day, year] = datePart.split('/');
    const fullYear = `20${year}`; // Convert "22" to "2022"
    const isoDate = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    
    // Parse time (convert to 24-hour format)
    const [timeOnly, ampm] = timePart.split(' ');
    const [hours, minutes] = timeOnly.split(':');
    let hour24 = parseInt(hours);
    
    if (ampm.toUpperCase() === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (ampm.toUpperCase() === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    
    const time24 = `${hour24.toString().padStart(2, '0')}:${minutes}`;
    
    return { date: isoDate, time: time24 };
  } catch (error) {
    console.error('Error parsing datetime:', whenStr, error);
    return { date: '2022-01-01', time: '12:00' };
  }
}

// Convert CSV row to ConsumptionSession
export function convertCSVRowToSession(row: CSVRow): CreateConsumptionSession {
  const vessel = VESSEL_MAPPING[row.Vessel] || 'Other';
  const { date, time } = parseDatetime(row.When);
  
  // Build location string
  const location = row.Location === row.City ? 
    `${row.Location}, ${row.State}` : 
    `${row.Location}, ${row.City}, ${row.State}`;
  
  // Parse people - if alone, use "Solo", otherwise clean up the people string
  let whoWith = 'Solo';
  if (row['Alone?'] === 'N' && row.People) {
    whoWith = row.People.replace(/;$/, '').trim(); // Remove trailing semicolon
  }
  
  // Parse boolean values
  const parseBoolean = (value: string) => value === 'Y' || value === 'Yes' || value === 'true';
  
  // Parse THC percentage
  const thcPercentage = row['THC %'] ? parseFloat(row['THC %']) : undefined;
  
  return {
    date,
    time,
    location,
    who_with: whoWith,
    vessel,
    accessory_used: ACCESSORY_MAPPING[row['Accessory Used']] || 'Other',
    my_vessel: parseBoolean(row['Your Vessel']),
    my_substance: parseBoolean(row['Your Substance']),
    strain_name: row.Strain || 'Unknown',
    strain_type: row.Type || undefined,
    thc_percentage: thcPercentage,
    purchased_legally: parseBoolean(row['Legal Product_Purchased?']),
    state_purchased: row['State Purchased?'] || undefined,
    tobacco: parseBoolean(row.Tobacco),
    kief: parseBoolean(row.Kief),
    concentrate: parseBoolean(row.Concentrate),
    lavender: parseBoolean(row.Lavendar), // Note: keeping original spelling
    quantity: parseQuantity(row.Quantity, vessel),
    comments: row.Comments || undefined
  };
}

// Parse CSV content into sessions
export function parseCSVContent(csvContent: string): CreateConsumptionSession[] {
  const lines = csvContent.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }
  
  // Detect separator and parse headers
  const separator = detectSeparator(lines[0]);
  const headers = lines[0].split(separator).map(h => h.trim());
  const sessions: CreateConsumptionSession[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(separator).map(v => v.trim());
    
    if (values.length !== headers.length) {
      console.warn(`Row ${i + 1} has ${values.length} columns, expected ${headers.length}. Skipping.`);
      continue;
    }
    
    // Create row object
    const row = {} as CSVRow;
    headers.forEach((header, index) => {
      (row as any)[header] = values[index] || ''; // eslint-disable-line @typescript-eslint/no-explicit-any
    });
    
    try {
      const session = convertCSVRowToSession(row);
      sessions.push(session);
    } catch (error) {
      console.error(`Error converting row ${i + 1}:`, error);
    }
  }
  
  return sessions;
}

// Import sessions from CSV file content
export async function importCSVSessions(csvContent: string): Promise<{
  success: boolean;
  imported: number;
  errors: string[];
}> {
  const errors: string[] = [];
  
  try {
    const sessions = parseCSVContent(csvContent);
    
    if (sessions.length === 0) {
      return {
        success: false,
        imported: 0,
        errors: ['No valid sessions found in CSV']
      };
    }
    
    // Import sessions using the database service
    const { databaseService } = await import('@/lib/database');
    const imported = await databaseService.createMany(sessions);
    
    return {
      success: true,
      imported,
      errors: []
    };
    
  } catch (error) {
    errors.push(`Import failed: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      imported: 0,
      errors
    };
  }
}

// Detect CSV separator (tab or comma)
function detectSeparator(line: string): string {
  const tabCount = (line.match(/\t/g) || []).length;
  const commaCount = (line.match(/,/g) || []).length;
  
  // If we have more tabs than commas, use tabs
  if (tabCount > commaCount) {
    return '\t';
  }
  // If we have more commas than tabs, use commas
  if (commaCount > tabCount) {
    return ',';
  }
  // Default to tab for your format
  return '\t';
}

// Validate CSV format
export function validateCSVFormat(csvContent: string): {
  valid: boolean;
  errors: string[];
  preview?: CreateConsumptionSession[];
} {
  const errors: string[] = [];
  
  try {
    const lines = csvContent.trim().split('\n');
    
    if (lines.length < 2) {
      errors.push('CSV must have at least a header row and one data row');
      return { valid: false, errors };
    }
    
    // Detect separator and split headers
    const separator = detectSeparator(lines[0]);
    const headers = lines[0].split(separator).map(h => h.trim());
    const requiredHeaders = [
      'Instance (Blake Tracking)',
      'When', 
      'Location',
      'Vessel',
      'Strain',
      'Quantity'
    ];
    
    // More flexible header matching - trim whitespace and check case-insensitive
    const missingHeaders: string[] = [];
    for (const required of requiredHeaders) {
      const normalizedRequired = required.toLowerCase().replace(/\s+/g, ' ').trim();
      const found = headers.some(header => {
        const normalizedHeader = header.toLowerCase().replace(/\s+/g, ' ').trim();
        return normalizedHeader === normalizedRequired;
      });
      if (!found) {
        missingHeaders.push(required);
      }
    }
    
    if (missingHeaders.length > 0) {
      errors.push(`Missing required headers: ${missingHeaders.join(', ')}`);
      errors.push(`Found headers: [${headers.map(h => `"${h}"`).join(', ')}]`);
      errors.push(`CSV appears to have ${headers.length} columns using separator "${separator === '\t' ? 'TAB' : separator}"`);
      errors.push(`First line: "${lines[0].substring(0, 200)}${lines[0].length > 200 ? '...' : ''}"`);
    }
    
    if (errors.length > 0) {
      return { valid: false, errors };
    }
    
    // Try to parse first few rows as preview
    const previewSessions = parseCSVContent(lines.slice(0, 4).join('\n'));
    
    return {
      valid: true,
      errors: [],
      preview: previewSessions
    };
    
  } catch (error) {
    errors.push(`Validation failed: ${error instanceof Error ? error.message : String(error)}`);
    return { valid: false, errors };
  }
}
