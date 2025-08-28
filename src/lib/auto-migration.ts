import { storageService } from '@/lib/storage';
import { hybridStorageService } from '@/lib/storage-hybrid';

// Automatic migration utility that runs on app initialization
export const autoMigration = {
  // Check if migration is needed and perform it
  migrate: async (): Promise<{ migrated: number; skipped: boolean; error?: string }> => {
    try {
      // Check if database is available
      const dbAvailable = await hybridStorageService.isDatabaseAvailable();
      if (!dbAvailable) {
        return { migrated: 0, skipped: true, error: 'Database not available' };
      }

      // Check if there's localStorage data to migrate
      const localSessions = storageService.getAll();
      if (localSessions.length === 0) {
        return { migrated: 0, skipped: true };
      }

      // Check if database already has sessions (avoid duplicate migration)
      const dbSessions = await hybridStorageService.getAll();
      if (dbSessions.length > 0) {
        return { migrated: 0, skipped: true, error: 'Database already has sessions' };
      }

      console.log(`🔄 Auto-migrating ${localSessions.length} sessions from localStorage to database...`);

      // Perform migration
      const result = await hybridStorageService.migrateToDatabase();
      
      if (result.success) {
        console.log(`✅ Successfully migrated ${result.migrated} sessions to database`);
        return { migrated: result.migrated || 0, skipped: false };
      } else {
        console.error('❌ Migration failed:', result.error);
        return { migrated: 0, skipped: false, error: result.error };
      }

    } catch (error) {
      console.error('❌ Auto-migration error:', error);
      return { migrated: 0, skipped: false, error: String(error) };
    }
  },

  // Silent migration that doesn't throw errors
  migrateSilently: async (): Promise<void> => {
    try {
      const result = await autoMigration.migrate();
      if (result.error && !result.skipped) {
        console.warn('Migration completed with warnings:', result.error);
      }
    } catch (error) {
      // Silent failure - app continues to work with localStorage
      console.warn('Auto-migration failed silently:', error);
    }
  }
};

export default autoMigration;
