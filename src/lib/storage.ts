import { ConsumptionSession, CreateConsumptionSession, ConsumptionFilters } from '@/types/consumption';
import hybridStorageService from './storage-hybrid';

// Storage service that uses database API with localStorage fallback
export const storageService = {
  // Get all sessions from database API with localStorage fallback
  getAll: async (): Promise<ConsumptionSession[]> => {
    return await hybridStorageService.getAll();
  },

  // Create a new session
  create: async (session: CreateConsumptionSession): Promise<ConsumptionSession> => {
    return await hybridStorageService.create(session);
  },

  // Get session by ID
  getById: async (id: string): Promise<ConsumptionSession | null> => {
    try {
      const sessions = await hybridStorageService.getAll();
      return sessions.find(session => session.id === id) || null;
    } catch (error) {
      console.error('Failed to get session by ID:', error);
      return null;
    }
  },

  // Update a session
  update: async (id: string, updates: Partial<CreateConsumptionSession>): Promise<ConsumptionSession | null> => {
    return await hybridStorageService.update(id, updates);
  },

  // Delete a session
  delete: async (id: string): Promise<boolean> => {
    return await hybridStorageService.delete(id);
  },

  // Get filtered sessions
  getFiltered: async (filters: ConsumptionFilters): Promise<ConsumptionSession[]> => {
    return await hybridStorageService.getFiltered(filters);
  },

  // Clear all data
  clear: async (): Promise<void> => {
    return await hybridStorageService.clear();
  },

  // Export data as JSON
  exportData: async (): Promise<string> => {
    return await hybridStorageService.exportData();
  },

  // Import data from JSON
  importData: async (jsonData: string): Promise<boolean> => {
    try {
      const sessions = JSON.parse(jsonData) as ConsumptionSession[];
      
      // Use hybrid storage service for import
      const createPromises = sessions.map(session => {
        const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...sessionData } = session;
      void _id; void _createdAt; void _updatedAt; // Explicitly ignore these properties
        return hybridStorageService.create(sessionData as CreateConsumptionSession);
      });
      
      await Promise.all(createPromises);
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  },

  // Migration to database (now handled by hybridStorageService)
  migrateFromLocalStorage: async (): Promise<boolean> => {
    console.log('Migration is now handled by the database migration API');
    return await hybridStorageService.migrateToDatabase().then(result => result.success);
  }
};

// Legacy synchronous methods for backward compatibility (will be deprecated)
export const legacyStorageService = {
  // Get all sessions from localStorage (synchronous fallback)
  getAll: (): ConsumptionSession[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem('cannabis-tracker-sessions');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load sessions from localStorage:', error);
      return [];
    }
  },

  // Save all sessions to localStorage
  saveAll: (sessions: ConsumptionSession[]): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('cannabis-tracker-sessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save sessions to localStorage:', error);
    }
  }
};