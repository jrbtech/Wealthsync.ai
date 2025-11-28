import { writable, derived, type Readable } from 'svelte/store';
import type { User, Family } from '$lib/types';
import { browser } from '$app/environment';

interface AuthState {
  user: User | null;
  family: Family | null;
  loading: boolean;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  family: null,
  loading: true,
  initialized: false
};

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(initialState);

  return {
    subscribe,
    setUser: (user: User | null) => update((state) => ({ ...state, user, loading: false })),
    setFamily: (family: Family | null) => update((state) => ({ ...state, family })),
    updateFamily: (updates: Partial<Family>) => update((state) => ({
      ...state,
      family: state.family ? { ...state.family, ...updates } : null
    })),
    setLoading: (loading: boolean) => update((state) => ({ ...state, loading })),
    setInitialized: () => update((state) => ({ ...state, initialized: true, loading: false })),
    reset: () => set({ ...initialState, loading: false, initialized: true })
  };
}

export const authStore = createAuthStore();

// Derived stores for convenience
export const currentUser: Readable<User | null> = derived(authStore, ($auth) => $auth.user);
export const currentFamily: Readable<Family | null> = derived(authStore, ($auth) => $auth.family);
export const isAuthenticated: Readable<boolean> = derived(authStore, ($auth) => $auth.user !== null);
export const isLoading: Readable<boolean> = derived(authStore, ($auth) => $auth.loading);
export const isInitialized: Readable<boolean> = derived(authStore, ($auth) => $auth.initialized);

// Role checks
export const isPrimaryUser: Readable<boolean> = derived(
  authStore,
  ($auth) => $auth.user?.role === 'primary'
);

export const canManageBilling: Readable<boolean> = derived(
  authStore,
  ($auth) => $auth.user?.role === 'primary'
);

export const canInviteMembers: Readable<boolean> = derived(
  authStore,
  ($auth) => $auth.user?.role === 'primary'
);
