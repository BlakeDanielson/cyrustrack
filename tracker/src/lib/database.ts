import { ConsumptionSession, CreateConsumptionSession, QuantityValue } from '@/types/consumption';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma';

// Convert Prisma model to our app type
function convertPrismaToSession(prismaSession: any): ConsumptionSession {
  return {
    id: prismaSession.id,
    date: prismaSession.date,
    time: prismaSession.time,
    location: prismaSession.location,
    latitude: prismaSession.latitude,
    longitude: prismaSession.longitude,
    who_with: prismaSession.who_with,
    vessel: prismaSession.vessel,
    accessory_used: prismaSession.accessory_used,
    my_vessel: prismaSession.my_vessel,
    my_substance: prismaSession.my_substance,
    strain_name: prismaSession.strain_name,
    thc_percentage: prismaSession.thc_percentage,
    purchased_legally: prismaSession.purchased_legally,
    state_purchased: prismaSession.state_purchased,
    tobacco: prismaSession.tobacco,
    kief: prismaSession.kief,
    concentrate: prismaSession.concentrate,
    quantity: JSON.parse(prismaSession.quantity) as QuantityValue,
    quantity_legacy: prismaSession.quantity_legacy,
    created_at: prismaSession.created_at.toISOString(),
    updated_at: prismaSession.updated_at.toISOString(),
  };
}

// Convert our app type to Prisma input
function convertSessionToPrismaInput(session: CreateConsumptionSession): Prisma.ConsumptionSessionCreateInput {
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
    thc_percentage: session.thc_percentage,
    purchased_legally: session.purchased_legally,
    state_purchased: session.state_purchased,
    tobacco: session.tobacco,
    kief: session.kief,
    concentrate: session.concentrate,
    quantity: JSON.stringify(session.quantity),
    quantity_legacy: session.quantity_legacy,
  };
}

// Database service using Prisma
export const databaseService = {
  // Get all sessions from database
  getAll: async (): Promise<ConsumptionSession[]> => {
    try {
      const sessions = await prisma.consumptionSession.findMany({
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
      const prismaInput = convertSessionToPrismaInput(session);
      const createdSession = await prisma.consumptionSession.create({
        data: prismaInput
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
        where: { id }
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
      if (updates.thc_percentage !== undefined) updateData.thc_percentage = updates.thc_percentage;
      if (updates.purchased_legally !== undefined) updateData.purchased_legally = updates.purchased_legally;
      if (updates.state_purchased !== undefined) updateData.state_purchased = updates.state_purchased;
      if (updates.tobacco !== undefined) updateData.tobacco = updates.tobacco;
      if (updates.kief !== undefined) updateData.kief = updates.kief;
      if (updates.concentrate !== undefined) updateData.concentrate = updates.concentrate;
      if (updates.quantity !== undefined) updateData.quantity = JSON.stringify(updates.quantity);
      if (updates.quantity_legacy !== undefined) updateData.quantity_legacy = updates.quantity_legacy;

      const updatedSession = await prisma.consumptionSession.update({
        where: { id },
        data: updateData
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
      const prismaInputs = sessions.map(convertSessionToPrismaInput);
      const result = await prisma.consumptionSession.createMany({
        data: prismaInputs
      });
      return result.count;
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
