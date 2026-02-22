'use client';

import React, { useState, useEffect } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

/**
 * FirebaseClientProvider ensures that Firebase is only initialized on the client side.
 * This prevents initialization errors (like "invalid-api-key") during server-side 
 * rendering and ensures a consistent state after hydration.
 */
export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [firebase, setFirebase] = useState<{ app: any; db: any; auth: any } | null>(null);

  useEffect(() => {
    // Initialize Firebase only once after the component mounts on the client
    setFirebase(initializeFirebase());
  }, []);

  // Return null or a loading state during the brief moment before client-side initialization
  if (!firebase) {
    return null; 
  }

  return (
    <FirebaseProvider app={firebase.app} db={firebase.db} auth={firebase.auth}>
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
}
