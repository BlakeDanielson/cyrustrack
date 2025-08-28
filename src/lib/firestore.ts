import { 
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './firebase';
import { ConsumptionSession, CreateConsumptionSession, ConsumptionFilters } from '@/types/consumption';

const COLLECTION_NAME = 'consumption_sessions';

// Convert Firestore document to ConsumptionSession
const convertFirestoreDoc = (doc: DocumentData): ConsumptionSession => {
  const data = doc.data();
  return {
    id: doc.id,
    date: data.date,
    time: data.time,
    location: data.location,
    latitude: data.latitude,
    longitude: data.longitude,
    who_with: data.who_with,
    vessel: data.vessel,
    accessory_used: data.accessory_used,
    my_vessel: data.my_vessel,
    my_substance: data.my_substance,
    strain_name: data.strain_name,
    thc_percentage: data.thc_percentage,
    purchased_legally: data.purchased_legally,
    state_purchased: data.state_purchased,
    tobacco: data.tobacco,
    kief: data.kief,
    concentrate: data.concentrate,
    quantity: data.quantity,
    created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at || new Date().toISOString(),
    updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at || new Date().toISOString()
  };
};

// Convert ConsumptionSession to Firestore document
const convertToFirestoreDoc = (session: CreateConsumptionSession) => {
  const now = Timestamp.now();
  return {
    ...session,
    created_at: now,
    updated_at: now
  };
};

export const firestoreService = {
  // Get all sessions
  getAll: async (): Promise<ConsumptionSession[]> => {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(convertFirestoreDoc);
    } catch (error) {
      console.error('Failed to load sessions from Firestore:', error);
      throw error;
    }
  },

  // Create a new session
  create: async (session: CreateConsumptionSession): Promise<ConsumptionSession> => {
    try {
      const docRef = await addDoc(
        collection(db, COLLECTION_NAME),
        convertToFirestoreDoc(session)
      );
      
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return convertFirestoreDoc(docSnap);
      }
      
      throw new Error('Failed to retrieve created session');
    } catch (error) {
      console.error('Failed to create session in Firestore:', error);
      throw error;
    }
  },

  // Get session by ID
  getById: async (id: string): Promise<ConsumptionSession | null> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return convertFirestoreDoc(docSnap);
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get session by ID:', error);
      throw error;
    }
  },

  // Update a session
  update: async (id: string, updates: Partial<CreateConsumptionSession>): Promise<ConsumptionSession | null> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      
      // Update the document
      await updateDoc(docRef, {
        ...updates,
        updated_at: Timestamp.now()
      });
      
      // Return the updated document
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return convertFirestoreDoc(docSnap);
      }
      
      return null;
    } catch (error) {
      console.error('Failed to update session:', error);
      throw error;
    }
  },

  // Delete a session
  delete: async (id: string): Promise<boolean> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Failed to delete session:', error);
      return false;
    }
  },

  // Get filtered sessions
  getFiltered: async (filters: ConsumptionFilters): Promise<ConsumptionSession[]> => {
    try {
      const constraints: QueryConstraint[] = [];
      
      // Add date range filters
      if (filters.startDate) {
        constraints.push(where('date', '>=', filters.startDate));
      }
      
      if (filters.endDate) {
        constraints.push(where('date', '<=', filters.endDate));
      }
      
      // Add strain name filter
      if (filters.strainName) {
        constraints.push(where('strain_name', '>=', filters.strainName));
        constraints.push(where('strain_name', '<=', filters.strainName + '\uf8ff'));
      }
      
      // Add location filter
      if (filters.location) {
        constraints.push(where('location', '>=', filters.location));
        constraints.push(where('location', '<=', filters.location + '\uf8ff'));
      }
      
      // Add vessel filter
      if (filters.vessel) {
        constraints.push(where('vessel', '>=', filters.vessel));
        constraints.push(where('vessel', '<=', filters.vessel + '\uf8ff'));
      }
      
      // Add ordering
      constraints.push(orderBy('created_at', 'desc'));
      
      // Add limit
      if (filters.limit) {
        constraints.push(limit(filters.limit));
      }
      
      const q = query(collection(db, COLLECTION_NAME), ...constraints);
      const querySnapshot = await getDocs(q);
      
      let sessions = querySnapshot.docs.map(convertFirestoreDoc);
      
      // Apply client-side filters for partial matches (Firestore limitations)
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
      
      return sessions;
    } catch (error) {
      console.error('Failed to get filtered sessions:', error);
      throw error;
    }
  },

  // Clear all data (for development/testing)
  clear: async (): Promise<void> => {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Failed to clear all sessions:', error);
      throw error;
    }
  },

  // Export data as JSON
  exportData: async (): Promise<string> => {
    try {
      const sessions = await firestoreService.getAll();
      return JSON.stringify(sessions, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  },

  // Import data from JSON
  importData: async (jsonData: string): Promise<boolean> => {
    try {
      const sessions = JSON.parse(jsonData) as ConsumptionSession[];
      
      // Convert to CreateConsumptionSession format and add to Firestore
      const createPromises = sessions.map(session => {
        const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...sessionData } = session;
        void _id; void _createdAt; void _updatedAt; // Explicitly ignore these properties
        return firestoreService.create(sessionData as CreateConsumptionSession);
      });
      
      await Promise.all(createPromises);
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  },

  // Migration from localStorage
  migrateFromLocalStorage: async (): Promise<boolean> => {
    try {
      if (typeof window === 'undefined') return false;
      
      const localData = localStorage.getItem('cannabis-tracker-sessions');
      if (!localData) return false;
      
      const sessions = JSON.parse(localData) as ConsumptionSession[];
      if (sessions.length === 0) return false;
      
      // Check if we already have data in Firestore
      const existingSessions = await firestoreService.getAll();
      if (existingSessions.length > 0) {
        console.log('Firestore already has data, skipping migration');
        return false;
      }
      
      console.log(`Migrating ${sessions.length} sessions from localStorage to Firestore...`);
      
      // Import the data
      const success = await firestoreService.importData(localData);
      
      if (success) {
        console.log('Migration completed successfully');
        // Optionally backup localStorage data before clearing
        localStorage.setItem('cannabis-tracker-sessions-backup', localData);
      }
      
      return success;
    } catch (error) {
      console.error('Failed to migrate from localStorage:', error);
      return false;
    }
  }
};

// Fallback to localStorage if Firestore is unavailable
export const hybridStorageService = {
  async getAll(): Promise<ConsumptionSession[]> {
    try {
      return await firestoreService.getAll();
    } catch {
      console.warn('Firestore unavailable, falling back to localStorage');
      // Fallback to localStorage implementation
      if (typeof window === 'undefined') return [];
      
      try {
        const data = localStorage.getItem('cannabis-tracker-sessions');
        return data ? JSON.parse(data) : [];
      } catch (localError) {
        console.error('Failed to load from localStorage:', localError);
        return [];
      }
    }
  },

  async create(session: CreateConsumptionSession): Promise<ConsumptionSession> {
    try {
      return await firestoreService.create(session);
    } catch {
      console.warn('Firestore unavailable, falling back to localStorage');
      // Fallback to localStorage implementation
      const id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      const newSession: ConsumptionSession = {
        id,
        ...session,
        created_at: now,
        updated_at: now
      };

      if (typeof window !== 'undefined') {
        const sessions = await this.getAll();
        sessions.unshift(newSession);
        localStorage.setItem('cannabis-tracker-sessions', JSON.stringify(sessions));
      }
      
      return newSession;
    }
  },

  async update(id: string, updates: Partial<CreateConsumptionSession>): Promise<ConsumptionSession | null> {
    try {
      return await firestoreService.update(id, updates);
    } catch {
      console.warn('Firestore unavailable, falling back to localStorage');
      // Fallback to localStorage implementation
      if (typeof window === 'undefined') return null;
      
      const sessions = await this.getAll();
      const sessionIndex = sessions.findIndex(session => session.id === id);
      
      if (sessionIndex === -1) return null;
      
      const updatedSession = {
        ...sessions[sessionIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      sessions[sessionIndex] = updatedSession;
      localStorage.setItem('cannabis-tracker-sessions', JSON.stringify(sessions));
      
      return updatedSession;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      return await firestoreService.delete(id);
    } catch {
      console.warn('Firestore unavailable, falling back to localStorage');
      // Fallback to localStorage implementation
      if (typeof window === 'undefined') return false;
      
      const sessions = await this.getAll();
      const filteredSessions = sessions.filter(session => session.id !== id);
      
      if (filteredSessions.length === sessions.length) return false;
      
      localStorage.setItem('cannabis-tracker-sessions', JSON.stringify(filteredSessions));
      return true;
    }
  },

  async getFiltered(filters: ConsumptionFilters): Promise<ConsumptionSession[]> {
    try {
      return await firestoreService.getFiltered(filters);
    } catch {
      console.warn('Firestore unavailable, using localStorage for filtering');
      // Fallback to client-side filtering
      let sessions = await this.getAll();

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
    }
  },

  async clear(): Promise<void> {
    try {
      await firestoreService.clear();
    } catch {
      console.warn('Firestore unavailable, clearing localStorage');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cannabis-tracker-sessions');
      }
    }
  },

  async exportData(): Promise<string> {
    try {
      return await firestoreService.exportData();
    } catch {
      console.warn('Firestore unavailable, exporting from localStorage');
      const sessions = await this.getAll();
      return JSON.stringify(sessions, null, 2);
    }
  }
};
