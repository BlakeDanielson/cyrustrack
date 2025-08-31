import { prisma } from '@/lib/prisma';

interface LocationData {
  name: string;
  full_address: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
}

// Parse location string into components
function parseLocationString(locationStr: string): LocationData {
  // Handle formats like:
  // "Brentwood Buddies, College Station, TX"
  // "Home, Austin, TX"  
  // "Downtown Coffee Shop, Houston, TX"
  
  const parts = locationStr.split(',').map(p => p.trim());
  
  if (parts.length >= 3) {
    return {
      name: parts[0],
      full_address: locationStr,
      city: parts[1],
      state: parts[2],
    };
  } else if (parts.length === 2) {
    return {
      name: parts[0],
      full_address: locationStr,
      city: parts[1],
    };
  } else {
    return {
      name: locationStr,
      full_address: locationStr,
    };
  }
}

// Geocoding function (you'll need to implement with your preferred service)
async function geocodeLocation(address: string): Promise<{ lat: number; lng: number } | null> {
  // This is a placeholder - you can implement with:
  // - Google Maps Geocoding API
  // - Mapbox Geocoding API  
  // - OpenStreetMap Nominatim
  // - Or your existing geocoding service
  
  console.log(`TODO: Geocode "${address}"`);
  
  // For now, return known coordinates for your main location
  if (address.includes('Brentwood Buddies') && address.includes('College Station')) {
    return { lat: 30.6280, lng: -96.3344 }; // College Station, TX coordinates
  }
  
  return null;
}

// Create or find location
async function findOrCreateLocation(locationStr: string, existingLat?: number, existingLng?: number): Promise<string> {
  const parsed = parseLocationString(locationStr);
  
  // First, try to find existing location by name or full address
  let location = await prisma.location.findFirst({
    where: {
      OR: [
        { name: parsed.name },
        { full_address: parsed.full_address },
      ]
    }
  });
  
  if (location) {
    // Update usage count
    await prisma.location.update({
      where: { id: location.id },
      data: { 
        usage_count: { increment: 1 },
        last_used_at: new Date(),
        // Update coordinates if we have them and the location doesn't
        ...(existingLat && existingLng && !location.latitude && !location.longitude ? {
          latitude: existingLat,
          longitude: existingLng,
        } : {})
      }
    });
    return location.id;
  }
  
  // Create new location
  let coordinates = null;
  if (existingLat && existingLng) {
    coordinates = { lat: existingLat, lng: existingLng };
  } else {
    coordinates = await geocodeLocation(parsed.full_address);
  }
  
  location = await prisma.location.create({
    data: {
      name: parsed.name,
      full_address: parsed.full_address,
      city: parsed.city,
      state: parsed.state,
      latitude: coordinates?.lat,
      longitude: coordinates?.lng,
      usage_count: 1,
      last_used_at: new Date(),
    }
  });
  
  return location.id;
}

// Migrate existing sessions to use locations table
export async function migrateSessionLocations() {
  console.log('🚀 Starting location migration...');
  
  // Get all sessions that don't have a location_id yet but have location data
  const sessions = await prisma.consumptionSession.findMany({
    where: {
      location_id: null,
      location: { not: "" }
    },
    select: {
      id: true,
      location: true,
      latitude: true,
      longitude: true,
    }
  });
  
  console.log(`📍 Found ${sessions.length} sessions to migrate`);
  
  let migrated = 0;
  let errors = 0;
  
  for (const session of sessions) {
    try {
      if (!session.location) continue;
      
      const locationId = await findOrCreateLocation(
        session.location,
        session.latitude || undefined,
        session.longitude || undefined
      );
      
      await prisma.consumptionSession.update({
        where: { id: session.id },
        data: { location_id: locationId }
      });
      
      migrated++;
      
      if (migrated % 10 === 0) {
        console.log(`   Migrated ${migrated}/${sessions.length} sessions...`);
      }
      
    } catch (error) {
      console.error(`❌ Error migrating session ${session.id}:`, error);
      errors++;
    }
  }
  
  console.log(`✅ Migration complete: ${migrated} migrated, ${errors} errors`);
  
  // Show location summary
  const locations = await prisma.location.findMany({
    orderBy: { usage_count: 'desc' }
  });
  
  console.log('\n📊 Location Summary:');
  locations.forEach(loc => {
    const coords = loc.latitude && loc.longitude ? ` (${loc.latitude}, ${loc.longitude})` : ' (no coordinates)';
    console.log(`   ${loc.name}: ${loc.usage_count} uses${coords}`);
  });
  
  return { migrated, errors, locationsCreated: locations.length };
}

// Backfill missing coordinates for existing locations
export async function backfillLocationCoordinates() {
  console.log('🌍 Backfilling missing coordinates...');
  
  const locationsWithoutCoords = await prisma.location.findMany({
    where: {
      OR: [
        { latitude: null },
        { longitude: null }
      ]
    }
  });
  
  console.log(`📍 Found ${locationsWithoutCoords.length} locations missing coordinates`);
  
  let updated = 0;
  let failed = 0;
  
  for (const location of locationsWithoutCoords) {
    try {
      const coords = await geocodeLocation(location.full_address);
      
      if (coords) {
        await prisma.location.update({
          where: { id: location.id },
          data: {
            latitude: coords.lat,
            longitude: coords.lng,
          }
        });
        
        console.log(`   ✅ ${location.name}: ${coords.lat}, ${coords.lng}`);
        updated++;
      } else {
        console.log(`   ⚠️  ${location.name}: No coordinates found`);
        failed++;
      }
      
    } catch (error) {
      console.error(`   ❌ ${location.name}: Error geocoding`, error);
      failed++;
    }
  }
  
  console.log(`🌍 Coordinate backfill complete: ${updated} updated, ${failed} failed`);
  return { updated, failed };
}

// Get location suggestions for autocomplete
export async function getLocationSuggestions(query: string, limit: number = 10) {
  const locations = await prisma.location.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { full_address: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
      ]
    },
    orderBy: [
      { is_favorite: 'desc' },
      { usage_count: 'desc' },
      { last_used_at: 'desc' }
    ],
    take: limit
  });
  
  return locations;
}

// Get favorite locations
export async function getFavoriteLocations() {
  return await prisma.location.findMany({
    where: { is_favorite: true },
    orderBy: { usage_count: 'desc' }
  });
}

// Toggle location favorite status
export async function toggleLocationFavorite(locationId: string) {
  const location = await prisma.location.findUnique({
    where: { id: locationId }
  });
  
  if (!location) throw new Error('Location not found');
  
  return await prisma.location.update({
    where: { id: locationId },
    data: { is_favorite: !location.is_favorite }
  });
}
