import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT /api/locations/update - Update location coordinates and address
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      locationId, 
      latitude, 
      longitude, 
      address,
      isLegacy = false 
    } = body;

    // Validate required fields
    if (!locationId || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: locationId, latitude, longitude' 
        },
        { status: 400 }
      );
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180' 
        },
        { status: 400 }
      );
    }

    let result;

    if (isLegacy) {
      // Handle legacy location updates
      // Extract original location name from the legacy ID
      const originalLocationName = locationId.replace('legacy-', '');
      
      // Update all consumption sessions with this location
      result = await prisma.consumptionSession.updateMany({
        where: {
          location: originalLocationName,
          location_id: null // Only update sessions not yet linked to Location table
        },
        data: {
          latitude: latitude,
          longitude: longitude,
          ...(address && { location: address }) // Update location name if new address provided
        }
      });

      return NextResponse.json({
        success: true,
        message: `Updated ${result.count} sessions with new coordinates`,
        updatedSessions: result.count
      });

    } else {
      // Handle regular Location table updates
      result = await prisma.location.update({
        where: {
          id: locationId
        },
        data: {
          latitude: latitude,
          longitude: longitude,
          ...(address && { 
            full_address: address
          }),
          updated_at: new Date()
        }
      });

      // Also update any linked consumption sessions
      const updatedSessions = await prisma.consumptionSession.updateMany({
        where: {
          location_id: locationId
        },
        data: {
          latitude: latitude,
          longitude: longitude,
          ...(address && { location: address })
        }
      });

      return NextResponse.json({
        success: true,
        location: result,
        updatedSessions: updatedSessions.count
      });
    }

  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update location',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PATCH /api/locations/update - Bulk update multiple locations
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { updates } = body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Updates must be an array with at least one update' 
        },
        { status: 400 }
      );
    }

    const results: Array<{ locationId: string; success: boolean; updatedSessions?: number; isLegacy?: boolean; message?: string }> = [];

    // Process each update in a transaction
    await prisma.$transaction(async (tx) => {
      for (const update of updates) {
        const { 
          locationId, 
          latitude, 
          longitude, 
          address,
          isLegacy = false 
        } = update;

        // Validate required fields for each update
        if (!locationId || latitude === undefined || longitude === undefined) {
          throw new Error(`Invalid update: missing required fields for location ${locationId}`);
        }

        // Validate coordinates
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
          throw new Error(`Invalid coordinates for location ${locationId}`);
        }

        if (isLegacy) {
          const originalLocationName = locationId.replace('legacy-', '');
          
          const result = await tx.consumptionSession.updateMany({
            where: {
              location: originalLocationName,
              location_id: null
            },
            data: {
              latitude: latitude,
              longitude: longitude,
              ...(address && { location: address })
            }
          });

          results.push({
            locationId,
            success: true,
            updatedSessions: result.count,
            isLegacy: true
          });

        } else {
          const result = await tx.location.update({
            where: {
              id: locationId
            },
            data: {
              latitude: latitude,
              longitude: longitude,
              ...(address && { 
                full_address: address
              }),
              updated_at: new Date()
            }
          });

          const updatedSessions = await tx.consumptionSession.updateMany({
            where: {
              location_id: locationId
            },
            data: {
              latitude: latitude,
              longitude: longitude,
              ...(address && { location: address })
            }
          });

          results.push({
            locationId,
            success: true,
            updatedSessions: updatedSessions.count,
            isLegacy: false,
            message: `Updated location: ${result.name}`
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      results: results,
      totalUpdated: results.length
    });

  } catch (error) {
    console.error('Error bulk updating locations:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to bulk update locations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
