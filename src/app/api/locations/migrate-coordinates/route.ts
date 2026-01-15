import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readFileSync } from 'fs';
import { join } from 'path';

interface CSVRow {
  name: string;
  locationName: string; // Parsed name without city/state
  city: string | null;
  state: string | null;
  count: number;
  latitude: number | null;
  longitude: number | null;
}

function parseCSV(csvContent: string): CSVRow[] {
  const lines = csvContent.trim().split('\n');
  const rows: CSVRow[] = [];
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    // Parse CSV with quoted fields
    const matches = line.match(/("([^"]*)")|([^,]+)/g);
    if (!matches || matches.length < 4) continue;
    
    const fullName = matches[0].replace(/^"|"$/g, ''); // Remove quotes
    const count = parseInt(matches[1]) || 0;
    const latStr = matches[2];
    const longStr = matches[3];
    
    // Parse location name - find the LAST ": City, State" pattern
    // Format examples:
    //   "Brentwood Buddies: College Station, TX" → "Brentwood Buddies"
    //   "Brotherhood: John McDougall's Place: Kemp, TX" → "Brotherhood: John McDougall's Place"
    //   "Ski Lift: Centennial Express: Beaver Creek, CO" → "Ski Lift: Centennial Express"
    
    // Match pattern: ": City, STATE" at the end (STATE is 2 letters)
    const cityStatePattern = /:\s+([^:,]+),\s+([A-Z]{2})$/;
    const match = fullName.match(cityStatePattern);
    
    const locationName = match 
      ? fullName.substring(0, fullName.lastIndexOf(':')).trim()
      : fullName.trim();
    
    // Extract city and state from the match
    const city = match ? match[1].trim() : null;
    const state = match ? match[2].trim() : null;
    
    // Parse coordinates (handle #N/A)
    const latitude = latStr && latStr !== '#N/A' ? parseFloat(latStr) : null;
    const longitude = longStr && longStr !== '#N/A' ? parseFloat(longStr) : null;
    
    rows.push({
      name: fullName,
      locationName,
      city,
      state,
      count,
      latitude,
      longitude
    });
  }
  
  return rows;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { 
      dryRun = false,
      propagateToSessions = false 
    } = body;
    
    // Read the CSV file from the project root
    const csvPath = join(process.cwd(), 'location.csv');
    let csvContent: string;
    
    try {
      csvContent = readFileSync(csvPath, 'utf-8');
    } catch {
      return NextResponse.json(
        { error: 'Could not read location.csv from project root' },
        { status: 404 }
      );
    }
    
    const csvRows = parseCSV(csvContent);
    console.log(`📍 Parsed ${csvRows.length} locations from CSV`);
    
    // Get all locations from database
    const dbLocations = await prisma.location.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        latitude: true,
        longitude: true
      }
    });
    
    console.log(`📍 Found ${dbLocations.length} locations in database`);
    
    // Create a map for fast lookup - use name+city as key to handle duplicates
    const dbLocationMap = new Map<string, typeof dbLocations[0]>();
    const dbLocationByNameOnly = new Map<string, typeof dbLocations[0]>();
    
    for (const loc of dbLocations) {
      // Primary key: name + city (for handling duplicates like "Airbnb" in different cities)
      const keyWithCity = `${loc.name.toLowerCase()}|${(loc.city || '').toLowerCase()}`;
      dbLocationMap.set(keyWithCity, loc);
      
      // Fallback key: name only (for locations without duplicates)
      if (!dbLocationByNameOnly.has(loc.name.toLowerCase())) {
        dbLocationByNameOnly.set(loc.name.toLowerCase(), loc);
      }
    }
    
    const results = {
      matched: 0,
      updated: 0,
      skippedNoCoords: 0,
      skippedAlreadyHasCoords: 0,
      notFound: [] as string[],
      updates: [] as { name: string; city: string | null; latitude: number; longitude: number }[],
      sessionsUpdated: 0
    };
    
    for (const row of csvRows) {
      // Try to find matching location in database - first by name+city, then by name only
      const keyWithCity = `${row.locationName.toLowerCase()}|${(row.city || '').toLowerCase()}`;
      let dbLocation = dbLocationMap.get(keyWithCity);
      
      // Fallback to name-only match if city match fails
      if (!dbLocation) {
        dbLocation = dbLocationByNameOnly.get(row.locationName.toLowerCase());
      }
      
      if (!dbLocation) {
        results.notFound.push(row.locationName);
        continue;
      }
      
      results.matched++;
      
      // Skip if no coordinates in CSV
      if (row.latitude === null || row.longitude === null) {
        results.skippedNoCoords++;
        continue;
      }
      
      // Skip if already has coordinates (unless we want to overwrite)
      if (dbLocation.latitude !== null && dbLocation.longitude !== null) {
        results.skippedAlreadyHasCoords++;
        continue;
      }
      
      results.updates.push({
        name: row.locationName,
        city: row.city,
        latitude: row.latitude,
        longitude: row.longitude
      });
      
      if (!dryRun) {
        // Update the location
        await prisma.location.update({
          where: { id: dbLocation.id },
          data: {
            latitude: row.latitude,
            longitude: row.longitude
          }
        });
        
        results.updated++;
        console.log(`✅ Updated ${row.locationName}: (${row.latitude}, ${row.longitude})`);
        
        // Optionally propagate to consumption_sessions
        if (propagateToSessions) {
          const sessionsUpdated = await prisma.consumptionSession.updateMany({
            where: { 
              location_id: dbLocation.id,
              OR: [
                { latitude: null },
                { longitude: null }
              ]
            },
            data: {
              latitude: row.latitude,
              longitude: row.longitude
            }
          });
          results.sessionsUpdated += sessionsUpdated.count;
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      dryRun,
      message: dryRun 
        ? `Dry run complete. Would update ${results.updates.length} locations.`
        : `Migration complete. Updated ${results.updated} locations.`,
      summary: {
        totalInCSV: csvRows.length,
        totalInDB: dbLocations.length,
        matched: results.matched,
        updated: dryRun ? results.updates.length : results.updated,
        skippedNoCoords: results.skippedNoCoords,
        skippedAlreadyHasCoords: results.skippedAlreadyHasCoords,
        notFound: results.notFound.length,
        sessionsUpdated: results.sessionsUpdated
      },
      notFoundLocations: results.notFound.slice(0, 20),
      pendingUpdates: dryRun ? results.updates.slice(0, 20) : undefined
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Location Coordinates Migration API',
    description: 'Migrate lat/long data from location.csv to the locations table',
    usage: {
      'POST /api/locations/migrate-coordinates': {
        body: {
          dryRun: 'boolean (default: false) - Preview changes without applying',
          propagateToSessions: 'boolean (default: false) - Also update consumption_sessions with new coords'
        },
        description: 'Migrate coordinates from location.csv to database'
      }
    },
    examples: [
      {
        description: 'Dry run to preview changes',
        method: 'POST',
        body: { dryRun: true }
      },
      {
        description: 'Apply changes to locations only',
        method: 'POST',
        body: { dryRun: false }
      },
      {
        description: 'Apply changes and propagate to sessions',
        method: 'POST',
        body: { dryRun: false, propagateToSessions: true }
      }
    ]
  });
}
