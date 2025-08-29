import { ConsumptionSession, CreateConsumptionSession, QuantityValue } from '@/types/consumption';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Convert Prisma model to our app type
function convertPrismaToSession(prismaSession: Prisma.ConsumptionSessionGetPayload<{include: {location_ref: true}}>): ConsumptionSession {
  // Convert location_ref if available
  const location_ref = prismaSession.location_ref ? {
    id: prismaSession.location_ref.id,
    name: prismaSession.location_ref.name,
    full_address: prismaSession.location_ref.full_address,
    city: prismaSession.location_ref.city ?? undefined,
    state: prismaSession.location_ref.state ?? undefined,
    country: prismaSession.location_ref.country ?? undefined,
    latitude: prismaSession.location_ref.latitude ?? undefined,
    longitude: prismaSession.location_ref.longitude ?? undefined,
    is_favorite: prismaSession.location_ref.is_favorite,
    is_private: prismaSession.location_ref.is_private,
    nickname: prismaSession.location_ref.nickname ?? undefined,
    usage_count: prismaSession.location_ref.usage_count,
    last_used_at: prismaSession.location_ref.last_used_at?.toISOString() ?? undefined,
    created_at: prismaSession.location_ref.created_at.toISOString(),
    updated_at: prismaSession.location_ref.updated_at.toISOString(),
  } : undefined;

  return {
    id: prismaSession.id,
    date: prismaSession.date,
    time: prismaSession.time,
    location: prismaSession.location_ref?.name || prismaSession.location || '',
    latitude: prismaSession.location_ref?.latitude ?? prismaSession.latitude ?? undefined,
    longitude: prismaSession.location_ref?.longitude ?? prismaSession.longitude ?? undefined,
    location_ref,
    who_with: prismaSession.who_with,
    vessel: prismaSession.vessel,
    accessory_used: prismaSession.accessory_used,
    my_vessel: prismaSession.my_vessel,
    my_substance: prismaSession.my_substance,
    strain_name: prismaSession.strain_name,
    strain_type: prismaSession.strain_type ?? undefined,
    thc_percentage: prismaSession.thc_percentage ?? undefined,
    purchased_legally: prismaSession.purchased_legally,
    state_purchased: prismaSession.state_purchased ?? undefined,
    tobacco: prismaSession.tobacco,
    kief: prismaSession.kief,
    lavender: prismaSession.lavender,
    concentrate: prismaSession.concentrate,
    quantity: JSON.parse(prismaSession.quantity) as QuantityValue,
    quantity_legacy: prismaSession.quantity_legacy ?? undefined,
    comments: prismaSession.comments ?? undefined,
    created_at: prismaSession.created_at.toISOString(),
    updated_at: prismaSession.updated_at.toISOString(),
  };
}

// Helper function to find or create location
async function findOrCreateLocationEntry(locationStr: string, lat?: number, lng?: number): Promise<string | null> {
  if (!locationStr || locationStr.trim() === '') return null;
  
  try {
    // First, try to find existing location by exact match
    let location = await prisma.location.findFirst({
      where: {
        OR: [
          { full_address: locationStr },
          { name: locationStr }
        ]
      }
    });
    
    if (location) {
      // Update usage count and last used
      const updateData: Record<string, number | string | Date | { increment: number }> = { 
        usage_count: { increment: 1 },
        last_used_at: new Date(),
      };
      
      // Update coordinates if we have them and location doesn't
      if (lat && lng && !location.latitude && !location.longitude) {
        updateData.latitude = lat;
        updateData.longitude = lng;
      }
      
      // If location is missing address components, try to geocode and fill them
      if (!location.city || !location.state || !location.country) {
        try {
          const { geocodeLocation } = await import('@/lib/geocoding');
          const geocodeResult = await geocodeLocation(locationStr);
          
          if (geocodeResult.address_components) {
            const { city, state, country } = geocodeResult.address_components;
            if (city && !location.city) updateData.city = city;
            if (state && !location.state) updateData.state = state;
            if (country && !location.country) updateData.country = country;
            
            // Also update coordinates if we got them from geocoding
            if (geocodeResult.coordinates && !location.latitude && !location.longitude) {
              updateData.latitude = geocodeResult.coordinates.latitude;
              updateData.longitude = geocodeResult.coordinates.longitude;
            }
          }
        } catch (geocodeError) {
          console.log('Geocoding failed for existing location:', geocodeError);
        }
      }
      
      await prisma.location.update({
        where: { id: location.id },
        data: updateData
      });
      
      return location.id;
    }
    
    // For new locations, try to geocode for enhanced data
    let geocodedData: Record<string, unknown> = {};
    try {
      const { geocodeLocation } = await import('@/lib/geocoding');
      const geocodeResult = await geocodeLocation(locationStr);
      
      if (geocodeResult.coordinates && !lat && !lng) {
        lat = geocodeResult.coordinates.latitude;
        lng = geocodeResult.coordinates.longitude;
      }
      
      if (geocodeResult.address_components) {
        const { city, state, country } = geocodeResult.address_components;
        geocodedData = { city, state, country };
      }
    } catch (geocodeError) {
      console.log('Geocoding failed for new location:', geocodeError);
    }
    
    // Parse location string for fallback data
    const parts = locationStr.split(',').map(p => p.trim());
    const name = parts[0];
    const fallbackCity = parts.length > 1 ? parts[1] : undefined;
    const fallbackState = parts.length > 2 ? parts[2] : undefined;
    
    // Create new location with geocoded data or fallback parsing
    location = await prisma.location.create({
      data: {
        name,
        full_address: locationStr,
        city: (geocodedData.city as string) || fallbackCity,
        state: (geocodedData.state as string) || fallbackState,
        country: geocodedData.country as string | null,
        latitude: lat,
        longitude: lng,
        usage_count: 1,
        last_used_at: new Date(),
      }
    });
    
    return location.id;
    
  } catch (error) {
    console.error('Error finding/creating location:', error);
    return null;
  }
}

// Convert our app type to Prisma input
async function convertSessionToPrismaInput(session: CreateConsumptionSession): Promise<Prisma.ConsumptionSessionCreateInput> {
  // Find or create location entry
  const locationId = await findOrCreateLocationEntry(
    session.location,
    session.latitude,
    session.longitude
  );
  
  return {
    date: session.date,
    time: session.time,
    location: session.location,
    latitude: session.latitude,
    longitude: session.longitude,
    who_with: session.who_with,
    vessel: session.vessel,
    accessory_used: session.accessory_used,
    my_vessel: session.my_vessel,
    my_substance: session.my_substance,
    strain_name: session.strain_name,
    strain_type: session.strain_type,
    thc_percentage: session.thc_percentage,
    purchased_legally: session.purchased_legally,
    state_purchased: session.state_purchased,
    tobacco: session.tobacco,
    kief: session.kief,
    lavender: session.lavender,
    concentrate: session.concentrate,
    quantity: JSON.stringify(session.quantity),
    quantity_legacy: session.quantity_legacy,
    comments: session.comments,
    ...(locationId && {
      location_ref: {
        connect: { id: locationId }
      }
    })
  } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

// Database service using Prisma
export const databaseService = {
  // Get all sessions from database
  getAll: async (): Promise<ConsumptionSession[]> => {
    try {
      const sessions = await prisma.consumptionSession.findMany({
        include: {
          location_ref: true
        },
        orderBy: {
          created_at: 'desc'
        }
      });
      return sessions.map(convertPrismaToSession);
    } catch (error) {
      console.error('Failed to load sessions from database:', error);
      throw error;
    }
  },

  // Create a new session
  create: async (session: CreateConsumptionSession): Promise<ConsumptionSession> => {
    try {
      const prismaInput = await convertSessionToPrismaInput(session);
      const createdSession = await prisma.consumptionSession.create({
        data: prismaInput,
        include: {
          location_ref: true
        }
      });
      return convertPrismaToSession(createdSession);
    } catch (error) {
      console.error('Failed to create session in database:', error);
      throw error;
    }
  },

  // Get session by ID
  getById: async (id: string): Promise<ConsumptionSession | null> => {
    try {
      const session = await prisma.consumptionSession.findUnique({
        where: { id },
        include: {
          location_ref: true
        }
      });
      return session ? convertPrismaToSession(session) : null;
    } catch (error) {
      console.error('Failed to get session by ID:', error);
      throw error;
    }
  },

  // Update a session
  update: async (id: string, updates: Partial<CreateConsumptionSession>): Promise<ConsumptionSession | null> => {
    try {
      // Prepare update data
      const updateData: Prisma.ConsumptionSessionUpdateInput = {};
      
      if (updates.date !== undefined) updateData.date = updates.date;
      if (updates.time !== undefined) updateData.time = updates.time;
      if (updates.location !== undefined) updateData.location = updates.location;
      if (updates.latitude !== undefined) updateData.latitude = updates.latitude;
      if (updates.longitude !== undefined) updateData.longitude = updates.longitude;
      if (updates.who_with !== undefined) updateData.who_with = updates.who_with;
      if (updates.vessel !== undefined) updateData.vessel = updates.vessel;
      if (updates.accessory_used !== undefined) updateData.accessory_used = updates.accessory_used;
      if (updates.my_vessel !== undefined) updateData.my_vessel = updates.my_vessel;
      if (updates.my_substance !== undefined) updateData.my_substance = updates.my_substance;
      if (updates.strain_name !== undefined) updateData.strain_name = updates.strain_name;
      if (updates.strain_type !== undefined) updateData.strain_type = updates.strain_type;
      if (updates.thc_percentage !== undefined) updateData.thc_percentage = updates.thc_percentage;
      if (updates.purchased_legally !== undefined) updateData.purchased_legally = updates.purchased_legally;
      if (updates.state_purchased !== undefined) updateData.state_purchased = updates.state_purchased;
      if (updates.tobacco !== undefined) updateData.tobacco = updates.tobacco;
      if (updates.kief !== undefined) updateData.kief = updates.kief;
      if (updates.lavender !== undefined) updateData.lavender = updates.lavender;
      if (updates.concentrate !== undefined) updateData.concentrate = updates.concentrate;
      if (updates.quantity !== undefined) updateData.quantity = JSON.stringify(updates.quantity);
      if (updates.quantity_legacy !== undefined) updateData.quantity_legacy = updates.quantity_legacy;
      if (updates.comments !== undefined) updateData.comments = updates.comments;

      const updatedSession = await prisma.consumptionSession.update({
        where: { id },
        data: updateData,
        include: {
          location_ref: true
        }
      });

      return convertPrismaToSession(updatedSession);
    } catch (error) {
      console.error('Failed to update session:', error);
      throw error;
    }
  },

  // Delete a session
  delete: async (id: string): Promise<boolean> => {
    try {
      await prisma.consumptionSession.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Failed to delete session:', error);
      return false;
    }
  },

  // Get filtered sessions
  getFiltered: async (filters: {
    startDate?: string;
    endDate?: string;
    strainName?: string;
    location?: string;
    vessel?: string;
    limit?: number;
    offset?: number;
  }): Promise<ConsumptionSession[]> => {
    try {
      const where: Prisma.ConsumptionSessionWhereInput = {};

      // Date filters
      if (filters.startDate || filters.endDate) {
        where.date = {};
        if (filters.startDate) where.date.gte = filters.startDate;
        if (filters.endDate) where.date.lte = filters.endDate;
      }

      // Text filters (case-insensitive partial matches)
      if (filters.strainName) {
        where.strain_name = {
          contains: filters.strainName
        };
      }

      if (filters.location) {
        where.location = {
          contains: filters.location
        };
      }

      if (filters.vessel) {
        where.vessel = {
          contains: filters.vessel
        };
      }

      const sessions = await prisma.consumptionSession.findMany({
        where,
        include: {
          location_ref: true
        },
        orderBy: {
          created_at: 'desc'
        },
        take: filters.limit,
        skip: filters.offset,
      });

      return sessions.map(convertPrismaToSession);
    } catch (error) {
      console.error('Failed to get filtered sessions:', error);
      throw error;
    }
  },

  // Clear all data
  clear: async (): Promise<void> => {
    try {
      await prisma.consumptionSession.deleteMany({});
    } catch (error) {
      console.error('Failed to clear all sessions:', error);
      throw error;
    }
  },

  // Get total count
  count: async (): Promise<number> => {
    try {
      return await prisma.consumptionSession.count();
    } catch (error) {
      console.error('Failed to count sessions:', error);
      throw error;
    }
  },

  // Batch create sessions (useful for data migration)
  createMany: async (sessions: CreateConsumptionSession[]): Promise<number> => {
    try {
      // For bulk creation, we need to use individual creates since createMany doesn't support relations
      const results = await Promise.all(
        sessions.map(async session => prisma.consumptionSession.create({
          data: await convertSessionToPrismaInput(session)
        }))
      );
      return results.length;
    } catch (error) {
      console.error('Failed to create multiple sessions:', error);
      throw error;
    }
  },

  // Export all data as JSON
  exportData: async (): Promise<string> => {
    try {
      const sessions = await databaseService.getAll();
      return JSON.stringify(sessions, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  },

  // Health check
  healthCheck: async (): Promise<boolean> => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
};

export default databaseService;
