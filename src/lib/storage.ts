import { ConsumptionSession, CreateConsumptionSession, ConsumptionFilters } from '@/types/consumption';
import { databaseService } from './database';

// Storage service that uses Firebase Firestore with localStorage fallback
export const storageService = {
  // Get all sessions from Firestore with localStorage fallback
  getAll: async (): Promise<ConsumptionSession[]> => {
    return await databaseService.getAll();
  },

  // Create a new session
  create: async (session: CreateConsumptionSession): Promise<ConsumptionSession> => {
    return await databaseService.create(session);
  },

  // Get session by ID
  getById: async (id: string): Promise<ConsumptionSession | null> => {
    try {
      const sessions = await databaseService.getAll();
      return sessions.find(session => session.id === id) || null;
    } catch (error) {
      console.error('Failed to get session by ID:', error);
      return null;
    }
  },

  // Update a session
  update: async (id: string, updates: Partial<CreateConsumptionSession>): Promise<ConsumptionSession | null> => {
    return await databaseService.update(id, updates);
  },

  // Delete a session
  delete: async (id: string): Promise<boolean> => {
    return await databaseService.delete(id);
  },

  // Get filtered sessions
  getFiltered: async (filters: ConsumptionFilters): Promise<ConsumptionSession[]> => {
    return await databaseService.getFiltered(filters);
  },

  // Clear all data
  clear: async (): Promise<void> => {
    return await databaseService.clear();
  },

  // Export data as JSON
  exportData: async (): Promise<string> => {
    return await databaseService.exportData();
  },

  // Import data from JSON
  importData: async (jsonData: string): Promise<boolean> => {
    try {
      const sessions = JSON.parse(jsonData) as ConsumptionSession[];
      
      // Use Firestore service directly for import
      const createPromises = sessions.map(session => {
        const { id, created_at, updated_at, ...sessionData } = session;
        return databaseService.create(sessionData as CreateConsumptionSession);
      });
      
      await Promise.all(createPromises);
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  },

  // Legacy migration remains no-op now that Firestore removed
  migrateFromLocalStorage: async (): Promise<boolean> => {
    console.warn('Firestore is no longer used – migrateFromLocalStorage is deprecated');
    return false;
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