import { readable, type Readable } from 'svelte/store';
import { browser } from '$app/environment';
import type { User as FirebaseUser } from 'firebase/auth';

// Re-export from auth store for convenience
export { currentUser, isAuthenticated, isLoading } from './auth';

// Firebase user store (raw Firebase auth state)
export const user: Readable<FirebaseUser | null> = readable<FirebaseUser | null>(null, (set) => {
  if (!browser) {
    set(null);
    return () => {};
  }

  // Dynamically import to avoid SSR issues
  import('$lib/firebase/client').then(({ auth }) => {
    if (!auth) {
      set(null);
      return;
    }

    const { onIdTokenChanged } = require('firebase/auth');
    const unsubscribe = onIdTokenChanged(auth, (firebaseUser: FirebaseUser | null) => {
      set(firebaseUser);
    });

    return unsubscribe;
  }).catch(() => {
    set(null);
  });

  return () => {};
});

// Helper to get current user synchronously (for use in load functions)
export async function getCurrentUser(): Promise<FirebaseUser | null> {
  if (!browser) return null;

  const { auth } = await import('$lib/firebase/client');
  return auth?.currentUser || null;
}

// Helper to get ID token for API calls
export async function getIdToken(): Promise<string | null> {
  if (!browser) return null;

  const { auth } = await import('$lib/firebase/client');
  const currentUser = auth?.currentUser;

  if (!currentUser) return null;

  return currentUser.getIdToken();
}
