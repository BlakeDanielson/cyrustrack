'use client';

import { useEffect } from 'react';
import { useConsumptionStore } from '@/store/consumption';
import { autoMigration } from '@/lib/auto-migration';

/**
 * Ensures automatic data migration runs and sessions are loaded once
 * when mounted in client-side layouts/pages.
 */
export default function ClientInitializer(): null {
  const loadSessions = useConsumptionStore((state) => state.loadSessions);

  useEffect(() => {
    const initialize = async () => {
      try {
        await autoMigration.migrateSilently();
      } catch (error) {
        console.error('Auto-migration error (non-fatal):', error);
      }

      try {
        await loadSessions();
      } catch (error) {
        console.error('Failed to load sessions:', error);
      }
    };

    void initialize();
  }, [loadSessions]);

  return null;
}

