import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { geocodeLocation } from '@/lib/geocoding';

export async function POST(request: Request) {
  try {
    const { limit = 10, force = false } = await request.json();
    
    // Get locations that are missing address components
    const locationsToBackfill = await prisma.location.findMany({
      where: force ? {} : {
        OR: [
          { city: null },
          { state: null },
          { country: null },
          { latitude: null },
          { longitude: null }
        ]
      },
      orderBy: { usage_count: 'desc' }, // Prioritize most-used locations
      take: limit
    });
    
    console.log(`🌍 Starting address backfill for ${locationsToBackfill.length} locations...`);
    
    let updated = 0;
    let failed = 0;
    const errors: string[] = [];
    
    for (const location of locationsToBackfill) {
      try {
        console.log(`Geocoding: ${location.name} (${location.full_address})`);
        
        const geocodeResult = await geocodeLocation(location.full_address);
        
        if (geocodeResult.coordinates || geocodeResult.address_components) {
          const updateData: Record<string, number | string | Date | { increment: number }> = {};
          
          // Update coordinates if we got them and don't have them
          if (geocodeResult.coordinates && !location.latitude && !location.longitude) {
            updateData.latitude = geocodeResult.coordinates.latitude;
            updateData.longitude = geocodeResult.coordinates.longitude;
          }
          
          // Update address components if we got them
          if (geocodeResult.address_components) {
            const { city, state, country } = geocodeResult.address_components;
            if (city && (!location.city || force)) updateData.city = city;
            if (state && (!location.state || force)) updateData.state = state;
            if (country && (!location.country || force)) updateData.country = country;
          }
          
          if (Object.keys(updateData).length > 0) {
            await prisma.location.update({
              where: { id: location.id },
              data: updateData
            });
            
            console.log(`✅ Updated ${location.name}:`, updateData);
            updated++;
          } else {
            console.log(`⚠️  No new data for ${location.name}`);
          }
        } else {
          console.log(`❌ No geocoding results for ${location.name}`);
          errors.push(`No results for: ${location.name}`);
          failed++;
        }
        
        // Rate limiting - wait 100ms between requests to be nice to APIs
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error geocoding ${location.name}:`, error);
        errors.push(`Error for ${location.name}: ${error instanceof Error ? error.message : String(error)}`);
        failed++;
      }
    }
    
    console.log(`🌍 Address backfill complete: ${updated} updated, ${failed} failed`);
    
    return NextResponse.json({
      success: true,
      message: `Address backfill complete: ${updated} locations updated, ${failed} failed`,
      updated,
      failed,
      total: locationsToBackfill.length,
      errors: errors.slice(0, 10) // Limit error list for response size
    });
    
  } catch (error) {
    console.error('Address backfill error:', error);
    return NextResponse.json(
      { error: 'Backfill failed: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Location Address Backfill API',
    description: 'Backfill missing city, state, country data for locations using geocoding',
    usage: {
      'POST /api/locations/backfill': {
        body: {
          limit: 'number (default: 10) - max locations to process',
          force: 'boolean (default: false) - update even if data exists'
        },
        description: 'Backfill address components for locations missing them'
      }
    },
    example: {
      method: 'POST',
      body: { limit: 20, force: false }
    }
  });
}
