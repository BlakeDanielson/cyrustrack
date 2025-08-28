import { ConsumptionSession, CreateConsumptionSession } from '@/types/consumption';
import { storageService } from '@/lib/storage';

// Enhanced storage service that works with database API
export const hybridStorageService = {
  // Get all sessions (prioritize API, fallback to localStorage)
  getAll: async (): Promise<ConsumptionSession[]> => {
    try {
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const data = await response.json();
        return data.sessions || [];
      }
      throw new Error('API request failed');
    } catch (error) {
      console.warn('Failed to fetch from API, falling back to localStorage:', error);
      return storageService.getAll();
    }
  },

  // Create a new session (try API first, fallback to localStorage)
  create: async (session: CreateConsumptionSession): Promise<ConsumptionSession> => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(session),
      });

      if (response.ok) {
        const data = await response.json();
        return data.session;
      }
      throw new Error('API request failed');
    } catch (error) {
      console.warn('Failed to create via API, falling back to localStorage:', error);
      return storageService.create(session);
    }
  },

  // Get session by ID
  getById: async (id: string): Promise<ConsumptionSession | null> => {
    try {
      const response = await fetch(`/api/sessions/${id}`);
      if (response.ok) {
        const data = await response.json();
        return data.session;
      } else if (response.status === 404) {
        return null;
      }
      throw new Error('API request failed');
    } catch (error) {
      console.warn('Failed to fetch by ID from API, falling back to localStorage:', error);
      return storageService.getById(id);
    }
  },

  // Update a session
  update: async (id: string, updates: Partial<CreateConsumptionSession>): Promise<ConsumptionSession | null> => {
    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        return data.session;
      } else if (response.status === 404) {
        return null;
      }
      throw new Error('API request failed');
    } catch (error) {
      console.warn('Failed to update via API, falling back to localStorage:', error);
      return storageService.update(id, updates);
    }
  },

  // Delete a session
  delete: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        return true;
      } else if (response.status === 404) {
        return false;
      }
      throw new Error('API request failed');
    } catch (error) {
      console.warn('Failed to delete via API, falling back to localStorage:', error);
      return storageService.delete(id);
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
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/sessions?${params}`);
      if (response.ok) {
        const data = await response.json();
        return data.sessions || [];
      }
      throw new Error('API request failed');
    } catch (error) {
      console.warn('Failed to fetch filtered from API, falling back to localStorage:', error);
      return storageService.getFiltered(filters);
    }
  },

  // Clear all data
  clear: async (): Promise<void> => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.warn('Failed to clear via API, clearing localStorage:', error);
      storageService.clear();
    }
  },

  // Export data
  exportData: async (): Promise<string> => {
    try {
      const sessions = await hybridStorageService.getAll();
      return JSON.stringify(sessions, null, 2);
    } catch (error) {
      console.warn('Failed to export from API, falling back to localStorage:', error);
      return storageService.exportData();
    }
  },

  // Import data (localStorage only - for migration)
  importData: (jsonData: string): boolean => {
    return storageService.importData(jsonData);
  },

  // Migrate localStorage data to database
  migrateToDatabase: async (): Promise<{ success: boolean; migrated?: number; error?: string }> => {
    try {
      const localSessions = await storageService.getAll();
      
      if (localSessions.length === 0) {
        return { success: true, migrated: 0 };
      }

      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessions: localSessions }),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, migrated: data.migrated };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error('Migration failed:', error);
      return { success: false, error: 'Migration request failed' };
    }
  },

  // Check if database is available
  isDatabaseAvailable: async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        const data = await response.json();
        return data.database === 'connected';
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  // Sync localStorage with database (for offline/online scenarios)
  syncWithDatabase: async (): Promise<{ synced: number; errors: string[] }> => {
    const errors: string[] = [];
    let synced = 0;

    try {
      const localSessions = await storageService.getAll();
      const dbSessions = await hybridStorageService.getAll();
      
      // Find sessions that exist locally but not in database
      const dbSessionIds = new Set(dbSessions.map(s => s.id));
      const localOnlySessions = localSessions.filter(s => !dbSessionIds.has(s.id));

      // Sync each local-only session to database
      for (const session of localOnlySessions) {
        try {
          const { id, created_at, updated_at, ...sessionData } = session;
          await hybridStorageService.create(sessionData as CreateConsumptionSession);
          synced++;
        } catch (error) {
          errors.push(`Failed to sync session ${session.id}: ${error}`);
        }
      }

      return { synced, errors };
    } catch (error) {
      errors.push(`Sync failed: ${error}`);
      return { synced, errors };
    }
  }
};

export default hybridStorageService;
