/**
 * CSV to Neon Migration Script
 * 
 * Transforms CSV data and prepares it for database insertion.
 * Run with: npx ts-node scripts/migrate-csv-to-neon.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============== VESSEL MAPPING ==============
function mapVessel(csvVessel: string): string {
  const v = csvVessel.toLowerCase();
  
  // Bongs
  if (v.includes('simba') || v.includes('bong') || v.includes('bubbler')) {
    return 'Bong';
  }
  
  // Pipes
  if (v.includes('pipe') || v.includes('one-hitter') || v === 'lotus' || v === 'first pipe') {
    return 'Pipe';
  }
  
  // Vape Pens
  if (v.startsWith('pen_') || v.includes('stizzy') || v === 'terp pen' || v.includes("'s pen")) {
    return 'Vape Pen';
  }
  
  // Tinctures
  if (v.startsWith('tincture:') || v.includes('tincture')) {
    return 'Tincture';
  }
  
  // Edibles
  if (v.startsWith('edible:') || v.includes('gummie') || v.includes('cake pop')) {
    return 'Edibles';
  }
  
  // Blunts (King Palm, wraps, cigarillos)
  if (v.startsWith('king palm:') || v.includes('wrap') || v.includes('white owl') || v.includes('cigarillo')) {
    return 'Blunt';
  }
  
  // Joints (pre-rolls, papers, cones, spliffs)
  if (v.startsWith('pre-roll:') || v.includes('papers') || v.includes('cone') || 
      v.includes('spliff') || v === 'rose petal joint' || v === 'cig joint' ||
      v.startsWith('infused pre-roll:') || v.startsWith('good chemistry pre-roll:') ||
      v.startsWith('noot pre-roll:')) {
    return 'Joint';
  }
  
  // Dab Rig
  if (v.includes('dab rig')) {
    return 'Dab Rig';
  }
  
  // Default
  return 'Other';
}

// ============== ACCESSORY MAPPING ==============
const STRANGE_ACCESSORIES = [
  'sausage pasta', 'pasta with meatballs', 'green chili chicken nachos',
  'green chili bacon cheeseburger', 'heb crossoint', 'carnitas tacos',
  'cake pop', 'coil into wax', 'american light blue tobacco'
];

function mapAccessory(csvAccessory: string): { accessory: string; moveToComments: string | null } {
  const a = csvAccessory.toLowerCase().trim();
  
  // Check for strange entries that should go to comments
  if (STRANGE_ACCESSORIES.some(s => a.includes(s))) {
    return { accessory: 'None', moveToComments: csvAccessory };
  }
  
  // Filter tips
  if (a.startsWith('filter_')) {
    return { accessory: 'Filter Tips', moveToComments: null };
  }
  
  // Bowl types -> Other (these are bowl pieces, not standard accessories)
  if (a.startsWith('bowl_')) {
    return { accessory: 'Other', moveToComments: null };
  }
  
  // None equivalents
  if (a === 'n/a' || a === '' || a === 'accessory used') {
    return { accessory: 'None', moveToComments: null };
  }
  
  // Edible-related accessories -> None
  if (['gummie', 'mint', 'drink', 'dropper', 'pulled taffy'].includes(a)) {
    return { accessory: 'None', moveToComments: null };
  }
  
  // Unknown
  if (a === 'unknown') {
    return { accessory: 'Other', moveToComments: null };
  }
  
  // Battery
  if (a.startsWith('battery_')) {
    return { accessory: 'Other', moveToComments: null };
  }
  
  // Sarah's Pen in accessory column is weird
  if (a === "sarah's pen") {
    return { accessory: 'Other', moveToComments: null };
  }
  
  return { accessory: 'Other', moveToComments: null };
}

// ============== QUANTITY MAPPING ==============
function mapQuantity(csvQuantity: string, vessel: string): { amount: number; unit: string; type: string } {
  const q = csvQuantity.toLowerCase().trim();
  
  // Size categories (for bowls - Bong, Pipe)
  if (['tiny', 'small', 'medium', 'large'].includes(q)) {
    const sizeMap: Record<string, number> = { tiny: 0, small: 1, medium: 2, large: 3 };
    return { amount: sizeMap[q], unit: 'bowl size', type: 'size_category' };
  }
  
  // Milligrams (for Edibles, Tinctures)
  if (q.endsWith('mg')) {
    const mg = parseFloat(q.replace('mg', ''));
    return { amount: isNaN(mg) ? 0 : mg, unit: 'mg THC', type: 'milligrams' };
  }
  
  // Hits (for Vape Pen)
  if (q.startsWith('hits_')) {
    const hits = parseInt(q.replace('hits_', ''));
    return { amount: isNaN(hits) ? 0 : hits, unit: 'puffs', type: 'decimal' };
  }
  
  // Dabs
  if (q.startsWith('dab_')) {
    const dabPart = q.replace('dab_', '');
    if (dabPart === 'tiny') {
      return { amount: 0.5, unit: 'dabs', type: 'decimal' };
    }
    const dabs = parseInt(dabPart);
    return { amount: isNaN(dabs) ? 1 : dabs, unit: 'dabs', type: 'decimal' };
  }
  
  // Decimal values (for Joints, Blunts)
  const decimal = parseFloat(q);
  if (!isNaN(decimal)) {
    if (vessel === 'Blunt') {
      return { amount: decimal, unit: 'blunt portion', type: 'decimal' };
    }
    return { amount: decimal, unit: 'joint portion', type: 'decimal' };
  }
  
  // Default based on vessel type
  if (vessel === 'Bong' || vessel === 'Pipe') {
    return { amount: 1, unit: 'bowl size', type: 'size_category' }; // small
  }
  if (vessel === 'Vape Pen') {
    return { amount: 3, unit: 'puffs', type: 'decimal' };
  }
  if (vessel === 'Edibles' || vessel === 'Tincture') {
    return { amount: 10, unit: 'mg THC', type: 'milligrams' };
  }
  if (vessel === 'Dab Rig') {
    return { amount: 1, unit: 'dabs', type: 'decimal' };
  }
  
  return { amount: 0.25, unit: 'joint portion', type: 'decimal' };
}

// ============== BOOLEAN CONVERSION ==============
function toBool(value: string, defaultVal: boolean = false): boolean {
  const v = value.toLowerCase().trim();
  if (v === 'y' || v === 'yes' || v === 'true' || v === '1') return true;
  if (v === 'n' || v === 'no' || v === 'false' || v === '0') return false;
  return defaultVal;
}

// ============== DATE/TIME PARSING ==============
function parseDateTime(whenStr: string): { date: string; time: string } {
  // Format: "10/17/22 11:39 AM"
  try {
    const [datePart, timePart, ampm] = whenStr.split(' ');
    const [month, day, year] = datePart.split('/');
    const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`;
    const date = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    
    let [hours, minutes] = timePart.split(':').map(n => parseInt(n));
    if (ampm?.toUpperCase() === 'PM' && hours !== 12) hours += 12;
    if (ampm?.toUpperCase() === 'AM' && hours === 12) hours = 0;
    
    const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    return { date, time };
  } catch {
    return { date: '2022-01-01', time: '12:00' };
  }
}

// ============== FIX TYPOS ==============
function fixTypos(vessel: string): string {
  const fixes: Record<string, string> = {
    'V4 Enging Bong': 'V4 Engine Bong',
    'Rasberry Gummie': 'Raspberry Gummie',
  };
  return fixes[vessel] || vessel;
}

// ============== ESCAPE SQL STRING ==============
function escapeSql(str: string): string {
  if (!str) return '';
  return str.replace(/'/g, "''").replace(/\\/g, '\\\\');
}

// ============== MAIN PROCESSING ==============
interface TransformedRow {
  date: string;
  time: string;
  location: string;
  city: string | null;
  state: string | null;
  who_with: string;
  vessel: string;
  accessory_used: string;
  my_vessel: boolean;
  my_substance: boolean;
  strain_name: string;
  strain_type: string | null;
  thc_percentage: number | null;
  purchased_legally: boolean;
  state_purchased: string | null;
  tobacco: boolean;
  kief: boolean;
  concentrate: boolean;
  lavender: boolean;
  quantity: string; // JSON string
  comments: string | null;
}

function processCSV(csvPath: string): TransformedRow[] {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n');
  const rows: TransformedRow[] = [];
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV (handle commas in quoted fields)
    const fields = parseCSVLine(line);
    if (fields.length < 21) continue;
    
    const [
      , // dayOfWeek (skip)
      when,
      location,
      city,
      state,
      , // alone (skip - derived from who_with)
      people,
      vesselRaw,
      accessoryRaw,
      yourVessel,
      yourSubstance,
      strain,
      strainType,
      thcPct,
      legalPurchased,
      statePurchased,
      tobacco,
      kief,
      concentrate,
      lavender,
      quantity,
      ...commentsParts
    ] = fields;
    
    const comments = commentsParts.join(',').trim();
    
    // Fix typos in vessel name
    const vesselFixed = fixTypos(vesselRaw);
    
    // Map vessel
    const mappedVessel = mapVessel(vesselFixed);
    
    // Map accessory
    const { accessory, moveToComments } = mapAccessory(accessoryRaw);
    
    // Build comments field
    const commentParts: string[] = [];
    if (vesselFixed && vesselFixed !== mappedVessel) {
      commentParts.push(`Original vessel: ${vesselFixed}`);
    }
    if (moveToComments) {
      commentParts.push(`Original accessory: ${moveToComments}`);
    }
    if (comments) {
      commentParts.push(comments);
    }
    
    // Parse date/time
    const { date, time } = parseDateTime(when);
    
    // Map quantity
    const quantityObj = mapQuantity(quantity, mappedVessel);
    
    // Parse THC percentage
    let thcPercentage: number | null = null;
    if (thcPct) {
      const parsed = parseFloat(thcPct.replace('%', ''));
      if (!isNaN(parsed)) thcPercentage = parsed;
    }
    
    rows.push({
      date,
      time,
      location: location || 'Unknown',
      city: city || null,
      state: state || null,
      who_with: (people || '').replace(/;$/g, '').trim(), // Remove trailing semicolon
      vessel: mappedVessel,
      accessory_used: accessory,
      my_vessel: toBool(yourVessel, true),
      my_substance: toBool(yourSubstance, true),
      strain_name: strain || 'Unknown',
      strain_type: strainType || null,
      thc_percentage: thcPercentage,
      purchased_legally: toBool(legalPurchased, false),
      state_purchased: statePurchased || null,
      tobacco: toBool(tobacco, false),
      kief: toBool(kief, false),
      concentrate: toBool(concentrate, false),
      lavender: toBool(lavender, false),
      quantity: JSON.stringify(quantityObj),
      comments: commentParts.length > 0 ? commentParts.join(' | ') : null,
    });
  }
  
  return rows;
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  
  return fields;
}

function generateInsertSQL(rows: TransformedRow[]): string[] {
  const statements: string[] = [];
  
  for (const row of rows) {
    const sql = `INSERT INTO consumption_sessions (
      id, date, time, location, who_with, vessel, accessory_used,
      my_vessel, my_substance, strain_name, strain_type, thc_percentage,
      purchased_legally, state_purchased, tobacco, kief, concentrate, lavender,
      quantity, comments, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      '${escapeSql(row.date)}',
      '${escapeSql(row.time)}',
      '${escapeSql(row.location)}',
      '${escapeSql(row.who_with)}',
      '${escapeSql(row.vessel)}',
      '${escapeSql(row.accessory_used)}',
      ${row.my_vessel},
      ${row.my_substance},
      '${escapeSql(row.strain_name)}',
      ${row.strain_type ? `'${escapeSql(row.strain_type)}'` : 'NULL'},
      ${row.thc_percentage !== null ? row.thc_percentage : 'NULL'},
      ${row.purchased_legally},
      ${row.state_purchased ? `'${escapeSql(row.state_purchased)}'` : 'NULL'},
      ${row.tobacco},
      ${row.kief},
      ${row.concentrate},
      ${row.lavender},
      '${escapeSql(row.quantity)}',
      ${row.comments ? `'${escapeSql(row.comments)}'` : 'NULL'},
      NOW(),
      NOW()
    );`;
    
    statements.push(sql);
  }
  
  return statements;
}

// ============== RUN ==============
const csvPath = path.join(__dirname, '..', 'Spreadsheet.csv');
console.log(`Processing CSV: ${csvPath}`);

const rows = processCSV(csvPath);
console.log(`Processed ${rows.length} rows`);

// Generate SQL
const sqlStatements = generateInsertSQL(rows);

// Write SQL to file for review
const sqlOutputPath = path.join(__dirname, 'migration-inserts.sql');
fs.writeFileSync(sqlOutputPath, sqlStatements.join('\n\n'), 'utf-8');
console.log(`SQL written to: ${sqlOutputPath}`);

// Also output a summary
console.log('\n=== Summary ===');
const vesselCounts: Record<string, number> = {};
const accessoryCounts: Record<string, number> = {};
rows.forEach(r => {
  vesselCounts[r.vessel] = (vesselCounts[r.vessel] || 0) + 1;
  accessoryCounts[r.accessory_used] = (accessoryCounts[r.accessory_used] || 0) + 1;
});

console.log('\nVessel distribution:');
Object.entries(vesselCounts).sort((a, b) => b[1] - a[1]).forEach(([v, c]) => {
  console.log(`  ${v}: ${c}`);
});

console.log('\nAccessory distribution:');
Object.entries(accessoryCounts).sort((a, b) => b[1] - a[1]).forEach(([a, c]) => {
  console.log(`  ${a}: ${c}`);
});

// Export for use with Neon MCP
export { rows, sqlStatements };
