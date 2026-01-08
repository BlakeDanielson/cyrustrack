/**
 * Migration script to re-import data from Spreadsheet.csv with vessel categories
 * 
 * This script:
 * 1. Clears existing data
 * 2. Re-imports from Spreadsheet.csv with proper vessel categorization
 * 3. Keeps original vessel names as sub-vessels
 * 4. Uses original accessories from CSV
 */

import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database URLs for different environments
const DB_URLS = {
  production: 'postgresql://neondb_owner:npg_Fdag8lUcbIf0@ep-lingering-paper-adg6dn4k-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
  dev: 'postgresql://neondb_owner:npg_Fdag8lUcbIf0@ep-small-meadow-adi79vmz-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
};

// Determine environment from command line argument
const env = process.argv[2] || 'dev';
if (!DB_URLS[env]) {
  console.error(`Unknown environment: ${env}. Use 'dev' or 'production'`);
  process.exit(1);
}

console.log(`\n🔧 Running migration on ${env.toUpperCase()} environment\n`);
const sql = neon(DB_URLS[env]);

/**
 * Categorize vessel into main category
 */
function categorizeVessel(vessel) {
  const v = vessel.toLowerCase();
  
  // Bong/Bubbler category (including Simba which is a bong)
  if (v.includes('bong') || v.includes('bubbler') || v.includes('simba') || v === 'lotus' || v.includes('zenco')) {
    return 'Bong';
  }
  
  // Pipe category
  if (v.includes('pipe') || v.includes('one-hitter') || v.includes('one hitter')) {
    return 'Pipe';
  }
  
  // Pen/Vape category
  if (v.startsWith('pen_') || v.includes('stizzy') || v.includes('terp pen') || v.includes("'s pen")) {
    return 'Pen';
  }
  
  // Edible category
  if (v.startsWith('edible:') || v.includes('gummie') || v.includes('cake pop')) {
    return 'Edible';
  }
  
  // Tincture category
  if (v.startsWith('tincture:')) {
    return 'Tincture';
  }
  
  // Pre-roll category (bought pre-rolled)
  if (v.includes('pre-roll')) {
    return 'Pre-roll';
  }
  
  // Blunt/Wrap category
  if (v.includes('wrap') || v.includes('cigarillo') || v.includes('white owl') || v.startsWith('spliff')) {
    return 'Blunt';
  }
  
  // Dab Rig category
  if (v.includes('dab rig')) {
    return 'Dab Rig';
  }
  
  // Joint/Papers category (self-rolled with papers)
  if (v.includes('paper') || v.includes('cone') || v.includes('vibes') || v.includes('ocb') || 
      v.includes('raw:') || v.includes('bob marley') || v.includes('zig-zag') || v.includes('zzz') ||
      v.includes('blazy susan') || v.includes('king palm') || v.includes('element:') || 
      v.includes('mike tyson') || v.includes('jlg') || v.includes('winooski') || v.includes('purlife') ||
      v.includes('luxe:') || v === 'cig joint' || v.includes('rose petal')) {
    return 'Joint';
  }
  
  // Default to Other
  return 'Other';
}

/**
 * Parse quantity from CSV format
 */
function parseQuantity(quantityStr, vessel) {
  const q = (quantityStr || '').trim().toLowerCase();
  const category = categorizeVessel(vessel);
  
  // Size-based (bowl sizes for bongs/pipes)
  if (q === 'tiny') return JSON.stringify({ amount: 0, unit: 'bowl size', type: 'size_category' });
  if (q === 'small') return JSON.stringify({ amount: 1, unit: 'bowl size', type: 'size_category' });
  if (q === 'medium') return JSON.stringify({ amount: 2, unit: 'bowl size', type: 'size_category' });
  if (q === 'large') return JSON.stringify({ amount: 3, unit: 'bowl size', type: 'size_category' });
  
  // Hits-based (for pens)
  if (q.startsWith('hits_')) {
    const hits = parseFloat(q.replace('hits_', '')) || 1;
    return JSON.stringify({ amount: hits, unit: 'puffs', type: 'decimal' });
  }
  
  // Numeric values
  const num = parseFloat(q);
  if (!isNaN(num)) {
    // Determine unit based on category
    if (category === 'Joint' || category === 'Blunt') {
      return JSON.stringify({ amount: num, unit: 'joint portion', type: 'decimal' });
    }
    if (category === 'Edible') {
      return JSON.stringify({ amount: num, unit: 'mg THC', type: 'milligrams' });
    }
    if (category === 'Tincture') {
      return JSON.stringify({ amount: num, unit: 'mg THC', type: 'milligrams' });
    }
    return JSON.stringify({ amount: num, unit: 'units', type: 'decimal' });
  }
  
  // Default
  return JSON.stringify({ amount: 1, unit: 'units', type: 'decimal' });
}

/**
 * Convert Y/N to boolean
 */
function toBool(val) {
  if (val === undefined || val === null) return false;
  const v = String(val).trim().toUpperCase();
  return v === 'Y' || v === 'YES' || v === 'TRUE' || v === '1';
}

/**
 * Parse date and time from CSV format
 */
function parseDateTime(whenStr) {
  if (!whenStr || whenStr.trim() === '') {
    return { date: new Date().toISOString().split('T')[0], time: '12:00' };
  }
  
  try {
    // Format: "10/17/22 11:39 AM" or "8/7/25 6:05 pm"
    const parts = whenStr.trim().split(' ');
    if (parts.length < 2) {
      return { date: new Date().toISOString().split('T')[0], time: '12:00' };
    }
    
    // Parse date part (handle both / and . as delimiters due to typos)
    const datePart = parts[0].replace(/\./g, '/');
    const dateComponents = datePart.split('/');
    if (dateComponents.length !== 3) {
      return { date: new Date().toISOString().split('T')[0], time: '12:00' };
    }
    
    let [month, day, year] = dateComponents.map(n => parseInt(n, 10));
    
    // Handle 2-digit year
    if (year < 100) {
      year = year >= 50 ? 1900 + year : 2000 + year;
    }
    
    // Validate date components
    if (isNaN(month) || isNaN(day) || isNaN(year) || month < 1 || month > 12 || day < 1 || day > 31) {
      return { date: new Date().toISOString().split('T')[0], time: '12:00' };
    }
    
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Parse time part
    const timePart = parts[1];
    const ampm = parts[2] ? parts[2].toLowerCase() : '';
    const timeComponents = timePart.split(':');
    
    let hour = parseInt(timeComponents[0], 10);
    const minute = parseInt(timeComponents[1], 10) || 0;
    
    // Convert to 24-hour format
    if (ampm === 'pm' && hour !== 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;
    
    if (isNaN(hour)) hour = 12;
    
    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    
    return { date: dateStr, time: timeStr };
  } catch (e) {
    console.error('Date parse error:', whenStr, e.message);
    return { date: new Date().toISOString().split('T')[0], time: '12:00' };
  }
}

/**
 * Parse a CSV line handling quoted fields
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  
  return result;
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('📖 Reading Spreadsheet.csv...');
  const csvPath = path.join(__dirname, '..', 'Spreadsheet.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  // Parse header
  const header = parseCSVLine(lines[0]);
  console.log('📋 Header columns:', header.join(', '));
  
  // Find column indices
  const colIndex = {
    dayOfWeek: header.indexOf('Day of Week'),
    when: header.indexOf('When'),
    location: header.indexOf('Location'),
    city: header.indexOf('City'),
    state: header.indexOf('State'),
    alone: header.indexOf('Alone?'),
    people: header.indexOf('People'),
    vessel: header.indexOf('Vessel'),
    accessory: header.indexOf('Accessory Used'),
    myVessel: header.indexOf('Your Vessel'),
    mySubstance: header.indexOf('Your Substance'),
    strain: header.indexOf('Strain'),
    strainType: header.indexOf('Type'),
    thc: header.indexOf('THC %'),
    legal: header.indexOf('Legal Product_Purchased?'),
    statePurchased: header.indexOf('State Purchased?'),
    tobacco: header.indexOf('Tobacco'),
    kief: header.indexOf('Kief'),
    concentrate: header.indexOf('Concentrate'),
    lavender: header.indexOf('Lavendar'),
    quantity: header.indexOf('Quantity'),
    comments: header.indexOf('Comments')
  };
  
  console.log('\n🗑️  Clearing existing data...');
  
  // First, check if vessel_category column exists, if not add it
  try {
    await sql`SELECT vessel_category FROM consumption_sessions LIMIT 1`;
    console.log('✅ vessel_category column exists');
  } catch (e) {
    console.log('➕ Adding vessel_category column...');
    await sql`ALTER TABLE consumption_sessions ADD COLUMN IF NOT EXISTS vessel_category VARCHAR(50)`;
  }
  
  // Clear existing data
  await sql`DELETE FROM consumption_sessions`;
  await sql`DELETE FROM locations`;
  
  console.log('✅ Cleared existing data');
  
  // Step 1: Extract unique locations
  console.log('\n📍 Extracting unique locations...');
  const locationMap = new Map();
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const locationName = (values[colIndex.location] || '').trim();
    const city = (values[colIndex.city] || '').trim();
    const state = (values[colIndex.state] || '').trim();
    
    if (!locationName) continue;
    
    const key = `${locationName}|${city}|${state}`;
    if (!locationMap.has(key)) {
      const parts = [locationName];
      if (city) parts.push(city);
      if (state) parts.push(state);
      
      locationMap.set(key, {
        id: randomUUID(),
        name: locationName,
        city: city || null,
        state: state || null,
        full_address: parts.join(', ')
      });
    }
  }
  
  console.log(`📍 Found ${locationMap.size} unique locations`);
  
  // Step 2: Insert locations
  console.log('\n📍 Inserting locations...');
  let locCount = 0;
  for (const loc of locationMap.values()) {
    await sql`
      INSERT INTO locations (id, name, full_address, city, state, country, is_favorite, is_private, usage_count, created_at, updated_at)
      VALUES (${loc.id}, ${loc.name}, ${loc.full_address}, ${loc.city}, ${loc.state}, 'USA', false, true, 0, NOW(), NOW())
    `;
    locCount++;
  }
  console.log(`✅ Inserted ${locCount} locations`);
  
  // Step 3: Insert consumption sessions with vessel categories
  console.log('\n📊 Inserting consumption sessions with vessel categories...');
  let sessionCount = 0;
  let errorCount = 0;
  
  // Track vessel categories for summary
  const categoryCounts = {};
  
  for (let i = 1; i < lines.length; i++) {
    try {
      const values = parseCSVLine(lines[i]);
      
      // Parse fields
      const locationName = (values[colIndex.location] || '').trim();
      const city = (values[colIndex.city] || '').trim();
      const state = (values[colIndex.state] || '').trim();
      const locationKey = `${locationName}|${city}|${state}`;
      const locationData = locationMap.get(locationKey);
      
      const { date, time } = parseDateTime(values[colIndex.when]);
      const vessel = (values[colIndex.vessel] || 'Unknown').trim();
      const vesselCategory = categorizeVessel(vessel);
      const accessory = (values[colIndex.accessory] || 'N/A').trim();
      const whoWith = (values[colIndex.people] || '').trim().replace(/;$/, '');
      const strain = (values[colIndex.strain] || 'Unknown').trim();
      const strainType = (values[colIndex.strainType] || '').trim() || null;
      const thcStr = (values[colIndex.thc] || '').trim();
      const thcParsed = thcStr ? parseFloat(thcStr) : null;
      const thc = (thcParsed !== null && !isNaN(thcParsed)) ? thcParsed : null;
      
      const myVessel = toBool(values[colIndex.myVessel]);
      const mySubstance = toBool(values[colIndex.mySubstance]);
      const legal = toBool(values[colIndex.legal]);
      const tobacco = toBool(values[colIndex.tobacco]);
      const kief = toBool(values[colIndex.kief]);
      const concentrate = toBool(values[colIndex.concentrate]);
      const lavender = toBool(values[colIndex.lavender]);
      
      const statePurchased = (values[colIndex.statePurchased] || '').trim() || null;
      const quantity = parseQuantity(values[colIndex.quantity], vessel);
      const comments = (values[colIndex.comments] || '').trim() || null;
      
      // Track category counts
      categoryCounts[vesselCategory] = (categoryCounts[vesselCategory] || 0) + 1;
      
      await sql`
        INSERT INTO consumption_sessions (
          id, date, time, location, location_id,
          who_with, vessel_category, vessel, accessory_used,
          my_vessel, my_substance, strain_name, strain_type, thc_percentage,
          purchased_legally, state_purchased, tobacco, kief, concentrate, lavender,
          quantity, comments, created_at, updated_at
        ) VALUES (
          ${randomUUID()}, ${date}, ${time}, ${locationName}, ${locationData?.id || null},
          ${whoWith}, ${vesselCategory}, ${vessel}, ${accessory},
          ${myVessel}, ${mySubstance}, ${strain}, ${strainType}, ${thc},
          ${legal}, ${statePurchased}, ${tobacco}, ${kief}, ${concentrate}, ${lavender},
          ${quantity}, ${comments}, NOW(), NOW()
        )
      `;
      
      sessionCount++;
      if (sessionCount % 200 === 0) {
        console.log(`  ... inserted ${sessionCount} sessions`);
      }
    } catch (e) {
      errorCount++;
      console.error(`  ❌ Error on row ${i + 1}:`, e.message);
    }
  }
  
  console.log(`\n✅ Inserted ${sessionCount} sessions (${errorCount} errors)`);
  
  // Print category summary
  console.log('\n📊 Vessel Category Summary:');
  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  for (const [cat, count] of sortedCategories) {
    console.log(`   ${cat}: ${count}`);
  }
  
  // Step 4: Update location usage counts
  console.log('\n📍 Updating location usage counts...');
  await sql`
    UPDATE locations SET 
      usage_count = (SELECT COUNT(*) FROM consumption_sessions WHERE consumption_sessions.location_id = locations.id),
      last_used_at = (SELECT MAX(created_at) FROM consumption_sessions WHERE consumption_sessions.location_id = locations.id)
  `;
  console.log('✅ Location usage counts updated');
  
  // Final verification
  console.log('\n🔍 Verification:');
  const sessionCountResult = await sql`SELECT COUNT(*) as count FROM consumption_sessions`;
  const locationCountResult = await sql`SELECT COUNT(*) as count FROM locations`;
  const categoryResult = await sql`SELECT vessel_category, COUNT(*) as count FROM consumption_sessions GROUP BY vessel_category ORDER BY count DESC`;
  
  console.log(`   Sessions: ${sessionCountResult[0].count}`);
  console.log(`   Locations: ${locationCountResult[0].count}`);
  console.log('\n   Categories in DB:');
  for (const row of categoryResult) {
    console.log(`     ${row.vessel_category}: ${row.count}`);
  }
  
  // Show unique vessels per category
  console.log('\n📋 Unique vessels per category:');
  for (const [cat] of sortedCategories) {
    const vessels = await sql`SELECT DISTINCT vessel FROM consumption_sessions WHERE vessel_category = ${cat} ORDER BY vessel LIMIT 10`;
    console.log(`\n   ${cat}:`);
    for (const v of vessels) {
      console.log(`     - ${v.vessel}`);
    }
    if (vessels.length === 10) console.log(`     ... and more`);
  }
  
  console.log('\n✅ Migration complete!');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
