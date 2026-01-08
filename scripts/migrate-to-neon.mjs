/**
 * Clean CSV to Neon Migration Script
 * 
 * Migrates data from Spreadsheet.csv to Neon database:
 * 1. Creates Location records from unique locations
 * 2. Creates ConsumptionSession records linked to locations
 */

import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connection strings
const DB_URLS = {
  production: 'postgresql://neondb_owner:npg_Fdag8lUcbIf0@ep-lingering-paper-adg6dn4k-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
  dev: 'postgresql://neondb_owner:npg_Fdag8lUcbIf0@ep-small-meadow-adi79vmz-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
};

// Get target from command line (default: dev)
const target = process.argv[2] || 'dev';
if (!DB_URLS[target]) {
  console.error(`Invalid target: ${target}. Use 'dev' or 'production'`);
  process.exit(1);
}

console.log(`\n🎯 Target: ${target.toUpperCase()}\n`);
const sql = neon(DB_URLS[target]);

// ============== VESSEL MAPPING ==============
function mapVessel(csvVessel) {
  const v = csvVessel.toLowerCase();
  
  if (v.includes('simba') || v.includes('bong') || v.includes('bubbler')) return 'Bong';
  if (v.includes('pipe') || v.includes('one-hitter') || v === 'lotus' || v === 'first pipe') return 'Pipe';
  if (v.startsWith('pen_') || v.includes('stizzy') || v === 'terp pen' || v.includes("'s pen")) return 'Vape Pen';
  if (v.startsWith('tincture:') || v.includes('tincture')) return 'Tincture';
  if (v.startsWith('edible:') || v.includes('gummie') || v.includes('cake pop')) return 'Edibles';
  if (v.startsWith('king palm:') || v.includes('wrap') || v.includes('white owl') || v.includes('cigarillo')) return 'Blunt';
  if (v.startsWith('pre-roll:') || v.includes('papers') || v.includes('cone') || v.includes('spliff') || 
      v === 'rose petal joint' || v === 'cig joint' || v.startsWith('infused pre-roll:') || 
      v.startsWith('good chemistry pre-roll:') || v.startsWith('noot pre-roll:') || v.startsWith('zzz:') ||
      v.startsWith('blazy susan:') || v.startsWith('raw:')) return 'Joint';
  if (v.includes('dab rig')) return 'Dab Rig';
  
  return 'Other';
}

// ============== ACCESSORY MAPPING ==============
function mapAccessory(csvAccessory) {
  const a = csvAccessory.toLowerCase().trim();
  
  if (a.startsWith('filter_')) return 'Filter Tips';
  if (a.startsWith('bowl_')) return 'Other';
  if (a === 'n/a' || a === '' || a === 'accessory used') return 'None';
  if (['gummie', 'mint', 'drink', 'dropper', 'pulled taffy', 'cake pop'].includes(a)) return 'None';
  if (a === 'unknown' || a.startsWith('battery_')) return 'Other';
  
  return 'Other';
}

// ============== QUANTITY MAPPING ==============
function mapQuantity(csvQuantity, vessel) {
  const q = csvQuantity.toLowerCase().trim();
  
  // Size categories (for bowls)
  if (['tiny', 'small', 'medium', 'large'].includes(q)) {
    const sizeMap = { tiny: 0, small: 1, medium: 2, large: 3 };
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
    if (dabPart === 'tiny') return { amount: 0.5, unit: 'dabs', type: 'decimal' };
    const dabs = parseInt(dabPart);
    return { amount: isNaN(dabs) ? 1 : dabs, unit: 'dabs', type: 'decimal' };
  }
  
  // Decimal values (for Joints, Blunts)
  const decimal = parseFloat(q);
  if (!isNaN(decimal)) {
    if (vessel === 'Blunt') return { amount: decimal, unit: 'blunt portion', type: 'decimal' };
    return { amount: decimal, unit: 'joint portion', type: 'decimal' };
  }
  
  // Defaults based on vessel type
  if (vessel === 'Bong' || vessel === 'Pipe') return { amount: 1, unit: 'bowl size', type: 'size_category' };
  if (vessel === 'Vape Pen') return { amount: 3, unit: 'puffs', type: 'decimal' };
  if (vessel === 'Edibles' || vessel === 'Tincture') return { amount: 10, unit: 'mg THC', type: 'milligrams' };
  if (vessel === 'Dab Rig') return { amount: 1, unit: 'dabs', type: 'decimal' };
  
  return { amount: 0.25, unit: 'joint portion', type: 'decimal' };
}

// ============== HELPERS ==============
function toBool(value, defaultVal = false) {
  const v = (value || '').toLowerCase().trim();
  if (v === 'y' || v === 'yes' || v === 'true' || v === '1') return true;
  if (v === 'n' || v === 'no' || v === 'false' || v === '0') return false;
  return defaultVal;
}

function parseDateTime(whenStr) {
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

function parseCSVLine(line) {
  const fields = [];
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

function escapeSql(str) {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

// ============== MAIN PROCESSING ==============
async function migrate() {
  const csvPath = path.join(__dirname, '..', 'Spreadsheet.csv');
  console.log(`📂 Reading CSV: ${csvPath}`);
  
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n');
  
  console.log(`📊 Total lines: ${lines.length} (including header)\n`);
  
  // Step 1: Extract unique locations
  console.log('🗺️  Step 1: Extracting unique locations...');
  const locationMap = new Map(); // key: "name|city|state" -> location data
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const fields = parseCSVLine(line);
    if (fields.length < 5) continue;
    
    const [, , locationName, city, state] = fields;
    if (!locationName) continue;
    
    const key = `${locationName}|${city || ''}|${state || ''}`;
    if (!locationMap.has(key)) {
      locationMap.set(key, {
        id: randomUUID(),
        name: locationName,
        city: city || null,
        state: state || null,
        full_address: [locationName, city, state].filter(Boolean).join(', ')
      });
    }
  }
  
  console.log(`   Found ${locationMap.size} unique locations\n`);
  
  // Step 2: Insert locations
  console.log('📍 Step 2: Inserting locations...');
  const locations = Array.from(locationMap.values());
  
  for (const loc of locations) {
    await sql`
      INSERT INTO locations (id, name, full_address, city, state, country, is_favorite, is_private, usage_count, created_at, updated_at)
      VALUES (${loc.id}, ${loc.name}, ${loc.full_address}, ${loc.city}, ${loc.state}, 'USA', false, true, 0, NOW(), NOW())
    `;
  }
  console.log(`   ✓ Inserted ${locations.length} locations\n`);
  
  // Step 3: Process and insert sessions
  console.log('📝 Step 3: Inserting consumption sessions...');
  let sessionCount = 0;
  let errorCount = 0;
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const fields = parseCSVLine(line);
    if (fields.length < 21) continue;
    
    const [
      , // dayOfWeek (skip)
      when,
      locationName,
      city,
      state,
      , // alone (skip)
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
    
    try {
      // Get location ID
      const locationKey = `${locationName}|${city || ''}|${state || ''}`;
      const locationData = locationMap.get(locationKey);
      const locationId = locationData?.id || null;
      
      // Parse data
      const { date, time } = parseDateTime(when);
      const vessel = mapVessel(vesselRaw);
      const accessory = mapAccessory(accessoryRaw);
      const quantityObj = mapQuantity(quantity, vessel);
      
      // Build comments
      const commentParts = [];
      if (vesselRaw && vesselRaw !== vessel) {
        commentParts.push(`Original vessel: ${vesselRaw}`);
      }
      const extraComments = commentsParts.join(',').trim();
      if (extraComments) commentParts.push(extraComments);
      
      // Parse THC percentage
      let thcPercentage = null;
      if (thcPct) {
        const parsed = parseFloat(thcPct.replace('%', ''));
        if (!isNaN(parsed)) thcPercentage = parsed;
      }
      
      // Insert session
      await sql`
        INSERT INTO consumption_sessions (
          id, date, time, location, location_id, who_with, vessel, accessory_used,
          my_vessel, my_substance, strain_name, strain_type, thc_percentage,
          purchased_legally, state_purchased, tobacco, kief, concentrate, lavender,
          quantity, comments, created_at, updated_at
        ) VALUES (
          ${randomUUID()},
          ${date},
          ${time},
          ${locationName || 'Unknown'},
          ${locationId},
          ${(people || '').replace(/;$/g, '').trim()},
          ${vessel},
          ${accessory},
          ${toBool(yourVessel, true)},
          ${toBool(yourSubstance, true)},
          ${strain || 'Unknown'},
          ${strainType || null},
          ${thcPercentage},
          ${toBool(legalPurchased, false)},
          ${statePurchased || null},
          ${toBool(tobacco, false)},
          ${toBool(kief, false)},
          ${toBool(concentrate, false)},
          ${toBool(lavender, false)},
          ${JSON.stringify(quantityObj)},
          ${commentParts.length > 0 ? commentParts.join(' | ') : null},
          NOW(),
          NOW()
        )
      `;
      
      sessionCount++;
      if (sessionCount % 200 === 0) {
        console.log(`   Progress: ${sessionCount} sessions...`);
      }
    } catch (err) {
      errorCount++;
      if (errorCount <= 5) {
        console.error(`   ✗ Error on row ${i}: ${err.message}`);
      }
    }
  }
  
  console.log(`   ✓ Inserted ${sessionCount} sessions (${errorCount} errors)\n`);
  
  // Step 4: Update location usage counts
  console.log('📊 Step 4: Updating location usage counts...');
  await sql`
    UPDATE locations SET 
      usage_count = (SELECT COUNT(*) FROM consumption_sessions WHERE location_id = locations.id),
      last_used_at = (SELECT MAX(created_at) FROM consumption_sessions WHERE location_id = locations.id)
  `;
  console.log('   ✓ Updated usage counts\n');
  
  // Step 5: Verify
  console.log('✅ Step 5: Verification...');
  const locCount = await sql`SELECT COUNT(*) as count FROM locations`;
  const sessCount = await sql`SELECT COUNT(*) as count FROM consumption_sessions`;
  
  console.log(`   Locations: ${locCount[0].count}`);
  console.log(`   Sessions: ${sessCount[0].count}`);
  
  console.log('\n🎉 Migration complete!\n');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
