import { writable } from 'svelte/store';

interface UIState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  modalOpen: string | null;
  toast: Toast | null;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

const initialState: UIState = {
  sidebarOpen: true,
  mobileMenuOpen: false,
  modalOpen: null,
  toast: null
};

function createUIStore() {
  const { subscribe, set, update } = writable<UIState>(initialState);

  let toastTimeout: ReturnType<typeof setTimeout> | null = null;

  return {
    subscribe,

    toggleSidebar: () =>
      update((state) => ({ ...state, sidebarOpen: !state.sidebarOpen })),

    setSidebarOpen: (open: boolean) =>
      update((state) => ({ ...state, sidebarOpen: open })),

    toggleMobileMenu: () =>
      update((state) => ({ ...state, mobileMenuOpen: !state.mobileMenuOpen })),

    closeMobileMenu: () =>
      update((state) => ({ ...state, mobileMenuOpen: false })),

    openModal: (modalId: string) =>
      update((state) => ({ ...state, modalOpen: modalId })),

    closeModal: () =>
      update((state) => ({ ...state, modalOpen: null })),

    showToast: (toast: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substr(2, 9);

      if (toastTimeout) {
        clearTimeout(toastTimeout);
      }

      update((state) => ({ ...state, toast: { ...toast, id } }));

      const duration = toast.duration ?? 4000;
      toastTimeout = setTimeout(() => {
        update((state) => (state.toast?.id === id ? { ...state, toast: null } : state));
      }, duration);
    },

    hideToast: () => {
      if (toastTimeout) {
        clearTimeout(toastTimeout);
      }
      update((state) => ({ ...state, toast: null }));
    }
  };
}

export const uiStore = createUIStore();

// Convenience functions
export function toast(message: string, type: Toast['type'] = 'info', duration?: number) {
  uiStore.showToast({ message, type, duration });
}

export function success(message: string) {
  toast(message, 'success');
}

export function error(message: string) {
  toast(message, 'error', 6000);
}

export function info(message: string) {
  toast(message, 'info');
}

export function warning(message: string) {
  toast(message, 'warning');
}
