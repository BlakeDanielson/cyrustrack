'use client';

import { useEffect, useState } from 'react';
import { firestoreService } from '@/lib/firestore';

interface FirebaseInitializerProps {
  children: React.ReactNode;
}

const FirebaseInitializer: React.FC<FirebaseInitializerProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        // Check if we're online
        setIsOnline(navigator.onLine);

        // Attempt data migration from localStorage to Firestore
        if (navigator.onLine) {
          console.log('Checking for localStorage data to migrate...');
          await firestoreService.migrateFromLocalStorage();
        }

        setIsInitialized(true);
      } catch (error) {
        console.warn('Firebase initialization failed, falling back to localStorage:', error);
        setIsOnline(false);
        setIsInitialized(true);
      }
    };

    initializeFirebase();

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      console.log('App is online - Firebase features available');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('App is offline - falling back to localStorage');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">Initializing App</h2>
          <p className="text-gray-500">Setting up your cannabis tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
            <span className="text-sm font-medium">Offline - using local storage</span>
          </div>
        </div>
      )}
    </>
  );
};

export default FirebaseInitializer;
