import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  ConsumptionSession, 
  CreateConsumptionSession, 
  ConsumptionFilters, 
  AppState,
  ConsumptionFormData
} from '@/types/consumption';
import { storageService } from '@/lib/storage';

interface ConsumptionStore extends AppState {
  // Actions for consumption sessions
  addSession: (session: CreateConsumptionSession) => Promise<ConsumptionSession>;
  updateSession: (id: string, updates: Partial<CreateConsumptionSession>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  loadSessions: () => Promise<void>;
  loadFilteredSessions: (filters?: ConsumptionFilters) => Promise<void>;

  // Actions for current session (form state)
  setCurrentSession: (session: Partial<ConsumptionFormData>) => void;
  updateCurrentSession: (updates: Partial<ConsumptionFormData>) => void;
  clearCurrentSession: () => void;

  // UI actions
  setActiveView: (view: 'log' | 'history' | 'analytics' | 'settings') => void;
  setMobileMenu: (show: boolean) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;

  // Success feedback actions
  setNewlyCreatedSessionId: (id: string | null) => void;
  clearNewlyCreatedSessionId: () => void;

  // Filter and search actions
  setFilters: (filters: Partial<ConsumptionFilters>) => void;
  setSearchTerm: (term: string) => void;
  clearFilters: () => void;

  // Preference actions
  updatePreferences: (updates: Partial<AppState['preferences']>) => void;

  // Utility actions
  getSessionById: (id: string) => ConsumptionSession | undefined;
  getRecentSessions: (limit?: number) => ConsumptionSession[];
  getSessionsByStrain: (strainName: string) => ConsumptionSession[];
}

export const useConsumptionStore = create<ConsumptionStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        sessions: [],
        isLoading: false,
        isSaving: false,
        filters: {},
        searchTerm: '',
        activeView: 'log',
        showMobileMenu: false,
        newlyCreatedSessionId: null,
        preferences: {
          defaultLocation: '',
          enableNotifications: false,
        },

        // Session management actions
        addSession: async (session: CreateConsumptionSession): Promise<ConsumptionSession> => {
          set({ isSaving: true });
          try {
            const newSession = await storageService.create(session);
            set((state) => ({
              sessions: [newSession, ...state.sessions],
              isSaving: false,
              newlyCreatedSessionId: newSession.id,
            }));
            return newSession;
          } catch (error) {
            console.error('Failed to add session:', error);
            set({ isSaving: false });
            throw error;
          }
        },

        updateSession: async (id: string, updates: Partial<CreateConsumptionSession>) => {
          set({ isSaving: true });
          try {
            const updatedSession = await storageService.update(id, updates);
            if (updatedSession) {
              set((state) => ({
                sessions: state.sessions.map((session) =>
                  session.id === id ? updatedSession : session
                ),
                isSaving: false,
              }));
            }
          } catch (error) {
            console.error('Failed to update session:', error);
            set({ isSaving: false });
            throw error;
          }
        },

        deleteSession: async (id: string) => {
          set({ isLoading: true });
          try {
            const success = await storageService.delete(id);
            if (success) {
              set((state) => ({
                sessions: state.sessions.filter((session) => session.id !== id),
                isLoading: false,
              }));
            }
          } catch (error) {
            console.error('Failed to delete session:', error);
            set({ isLoading: false });
            throw error;
          }
        },

        loadSessions: async () => {
          set({ isLoading: true });
          try {
            const sessions = await storageService.getAll();
            set({ sessions, isLoading: false });
          } catch (error) {
            console.error('Failed to load sessions:', error);
            set({ isLoading: false });
            throw error;
          }
        },

        loadFilteredSessions: async (filters?: ConsumptionFilters) => {
          set({ isLoading: true });
          try {
            const currentFilters = filters || get().filters;
            const sessions = await storageService.getFiltered(currentFilters);
            set({ sessions, isLoading: false });
          } catch (error) {
            console.error('Failed to load filtered sessions:', error);
            set({ isLoading: false });
            throw error;
          }
        },

        // Current session (form) actions
        setCurrentSession: (session: Partial<ConsumptionFormData>) => {
          set({ currentSession: session });
        },

        updateCurrentSession: (updates: Partial<ConsumptionFormData>) => {
          set((state) => ({
            currentSession: { ...state.currentSession, ...updates },
          }));
        },

        clearCurrentSession: () => {
          set({ currentSession: undefined });
        },

        // UI actions
        setActiveView: (view) => {
          set({ activeView: view, showMobileMenu: false });
        },

        setMobileMenu: (show) => {
          set({ showMobileMenu: show });
        },

        setLoading: (loading) => {
          set({ isLoading: loading });
        },

        setSaving: (saving) => {
          set({ isSaving: saving });
        },

        // Success feedback actions
        setNewlyCreatedSessionId: (id: string | null) => {
          set({ newlyCreatedSessionId: id });
        },

        clearNewlyCreatedSessionId: () => {
          set({ newlyCreatedSessionId: null });
        },

        // Filter and search actions
        setFilters: (filters) => {
          set((state) => ({
            filters: { ...state.filters, ...filters },
          }));
        },

        setSearchTerm: (term) => {
          set({ searchTerm: term });
        },

        clearFilters: () => {
          set({ filters: {}, searchTerm: '' });
        },

        // Preference actions
        updatePreferences: (updates) => {
          set((state) => ({
            preferences: { ...state.preferences, ...updates },
          }));
        },

        // Utility actions
        getSessionById: (id: string) => {
          return get().sessions.find((session) => session.id === id);
        },

        getRecentSessions: (limit = 10) => {
          return get().sessions.slice(0, limit);
        },

        getSessionsByStrain: (strainName: string) => {
          return get().sessions.filter((session) =>
            session.strain_name.toLowerCase().includes(strainName.toLowerCase())
          );
        },
      }),
      {
        name: 'consumption-storage',
        // Only persist certain parts of the state
        partialize: (state) => ({
          preferences: state.preferences,
          filters: state.filters,
          activeView: state.activeView,
        }),
      }
    ),
    {
      name: 'consumption-store',
    }
  )
);

// Helper hooks for common operations
export const useCurrentSession = () => useConsumptionStore((state) => state.currentSession);
export const useSessions = () => useConsumptionStore((state) => state.sessions);
export const useIsLoading = () => useConsumptionStore((state) => state.isLoading);
export const useIsSaving = () => useConsumptionStore((state) => state.isSaving);
export const useActiveView = () => useConsumptionStore((state) => state.activeView);
export const usePreferences = () => useConsumptionStore((state) => state.preferences);
export const useFilters = () => useConsumptionStore((state) => state.filters);
