import { ConsumptionSession, CreateConsumptionSession } from '@/types/consumption';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'cannabis-tracker-sessions';

// Client-side storage service using localStorage
export const storageService = {
  // Get all sessions from localStorage
  getAll: (): ConsumptionSession[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(STORAGE_KEY);
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save sessions to localStorage:', error);
    }
  },

  // Create a new session
  create: (session: CreateConsumptionSession): ConsumptionSession => {
    const id = uuidv4();
    const now = new Date().toISOString();
    const newSession: ConsumptionSession = {
      id,
      ...session,
      created_at: now,
      updated_at: now
    };

    const sessions = storageService.getAll();
    sessions.unshift(newSession); // Add to beginning for chronological order
    storageService.saveAll(sessions);
    
    return newSession;
  },

  // Get session by ID
  getById: (id: string): ConsumptionSession | null => {
    const sessions = storageService.getAll();
    return sessions.find(session => session.id === id) || null;
  },

  // Update a session
  update: (id: string, updates: Partial<CreateConsumptionSession>): ConsumptionSession | null => {
    const sessions = storageService.getAll();
    const sessionIndex = sessions.findIndex(session => session.id === id);
    
    if (sessionIndex === -1) return null;
    
    const updatedSession = {
      ...sessions[sessionIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    sessions[sessionIndex] = updatedSession;
    storageService.saveAll(sessions);
    
    return updatedSession;
  },

  // Delete a session
  delete: (id: string): boolean => {
    const sessions = storageService.getAll();
    const filteredSessions = sessions.filter(session => session.id !== id);
    
    if (filteredSessions.length === sessions.length) return false;
    
    storageService.saveAll(filteredSessions);
    return true;
  },

  // Get filtered sessions
  getFiltered: (filters: {
    startDate?: string;
    endDate?: string;
    strainName?: string;
    location?: string;
    vessel?: string;
    limit?: number;
  }): ConsumptionSession[] => {
    let sessions = storageService.getAll();

    if (filters.startDate) {
      sessions = sessions.filter(session => session.date >= filters.startDate!);
    }

    if (filters.endDate) {
      sessions = sessions.filter(session => session.date <= filters.endDate!);
    }

    if (filters.strainName) {
      sessions = sessions.filter(session =>
        session.strain_name.toLowerCase().includes(filters.strainName!.toLowerCase())
      );
    }

    if (filters.location) {
      sessions = sessions.filter(session =>
        session.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters.vessel) {
      sessions = sessions.filter(session =>
        session.vessel.toLowerCase().includes(filters.vessel!.toLowerCase())
      );
    }

    if (filters.limit) {
      sessions = sessions.slice(0, filters.limit);
    }

    return sessions;
  },

  // Clear all data
  clear: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  },

  // Export data as JSON
  exportData: (): string => {
    const sessions = storageService.getAll();
    return JSON.stringify(sessions, null, 2);
  },

  // Import data from JSON
  importData: (jsonData: string): boolean => {
    try {
      const sessions = JSON.parse(jsonData) as ConsumptionSession[];
      storageService.saveAll(sessions);
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
};
