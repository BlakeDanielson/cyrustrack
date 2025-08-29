import { NextRequest, NextResponse } from 'next/server';
import { getLocationSuggestions, getFavoriteLocations, toggleLocationFavorite } from '@/lib/locationMigration';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const favorites = searchParams.get('favorites') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (favorites) {
      const favoriteLocations = await getFavoriteLocations();
      return NextResponse.json({ locations: favoriteLocations });
    }
    
    if (query) {
      const suggestions = await getLocationSuggestions(query, limit);
      return NextResponse.json({ locations: suggestions });
    }
    
    // Get all locations ordered by usage
    const locations = await prisma.location.findMany({
      orderBy: [
        { is_favorite: 'desc' },
        { usage_count: 'desc' },
        { last_used_at: 'desc' }
      ],
      take: limit
    });
    
    return NextResponse.json({ locations });
    
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, locationId, locationData } = body;
    
    switch (action) {
      case 'toggle_favorite':
        if (!locationId) {
          return NextResponse.json(
            { error: 'locationId is required for toggle_favorite' },
            { status: 400 }
          );
        }
        
        const updatedLocation = await toggleLocationFavorite(locationId);
        return NextResponse.json({
          success: true,
          location: updatedLocation,
          message: `Location ${updatedLocation.is_favorite ? 'added to' : 'removed from'} favorites`
        });
        
      case 'create':
        if (!locationData) {
          return NextResponse.json(
            { error: 'locationData is required for create' },
            { status: 400 }
          );
        }
        
        const newLocation = await prisma.location.create({
          data: {
            name: locationData.name,
            full_address: locationData.full_address || locationData.name,
            city: locationData.city,
            state: locationData.state,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            is_favorite: locationData.is_favorite || false,
            usage_count: 1,
            last_used_at: new Date(),
          }
        });
        
        return NextResponse.json({
          success: true,
          location: newLocation,
          message: 'Location created successfully'
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: toggle_favorite, create' },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('Error in location POST:', error);
    return NextResponse.json(
      { error: 'Operation failed: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
