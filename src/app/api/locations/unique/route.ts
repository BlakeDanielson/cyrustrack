import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/locations/unique - Get all unique locations with their usage stats
export async function GET() {
  try {
    // Get all locations with session counts
    const locations = await prisma.location.findMany({
      include: {
        sessions: {
          select: {
            id: true,
            date: true,
          }
        }
      },
      orderBy: {
        usage_count: 'desc'
      }
    });

    // Also get legacy locations from consumption sessions that haven't been migrated
    const legacyLocations = await prisma.consumptionSession.groupBy({
      by: ['location', 'latitude', 'longitude'],
      where: {
        location_id: null, // Only sessions not yet linked to Location table
        location: {
          not: ''
        }
      },
      _count: {
        id: true
      }
    });

    // Transform legacy locations to match Location format
    const transformedLegacyLocations = legacyLocations.map((legacy) => ({
      id: `legacy-${legacy.location}`, // Temporary ID for legacy locations
      name: legacy.location,
      full_address: legacy.location,
      city: null,
      state: null,
      country: null,
      latitude: legacy.latitude,
      longitude: legacy.longitude,
      is_favorite: false,
      is_private: true,
      nickname: null,
      usage_count: typeof legacy._count === 'object' ? legacy._count.id || 0 : 0,
      last_used_at: null,
      created_at: new Date(),
      updated_at: new Date(),
      sessions: [], // We'll populate session count separately
      isLegacy: true // Flag to identify legacy locations
    }));

    // Combine both location types
    const allLocations = [
      ...locations.map(loc => ({
        ...loc,
        sessionCount: loc.sessions.length,
        isLegacy: false
      })),
      ...transformedLegacyLocations.map(loc => ({
        ...loc,
        sessionCount: loc.usage_count,
        isLegacy: true
      }))
    ];

    // Sort by usage count
    allLocations.sort((a, b) => b.sessionCount - a.sessionCount);

    return NextResponse.json({
      success: true,
      locations: allLocations
    });

  } catch (error) {
    console.error('Error fetching unique locations:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch locations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
