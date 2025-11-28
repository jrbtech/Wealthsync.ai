import { onMount } from 'svelte';

interface KeyboardNavigationOptions<T> {
  items: () => T[];
  onSelect: (item: T, index: number) => void;
  onEscape?: () => void;
  enabled?: () => boolean;
}

/**
 * Creates keyboard navigation state for lists
 * Supports j/k or arrow keys for navigation, Enter for selection
 */
export function createKeyboardNavigation<T>(options: KeyboardNavigationOptions<T>) {
  let selectedIndex = $state(0);

  function handleKeyDown(e: KeyboardEvent) {
    // Don't handle if typing in an input
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
      return;
    }

    // Check if enabled
    if (options.enabled && !options.enabled()) {
      return;
    }

    const items = options.items();
    if (items.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
      case 'j':
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        break;
      case 'ArrowUp':
      case 'k':
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (items[selectedIndex]) {
          options.onSelect(items[selectedIndex], selectedIndex);
        }
        break;
      case 'Escape':
        if (options.onEscape) {
          e.preventDefault();
          options.onEscape();
        }
        break;
      case 'Home':
        e.preventDefault();
        selectedIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        selectedIndex = items.length - 1;
        break;
    }
  }

  // Reset selection when items change
  $effect(() => {
    const items = options.items();
    if (selectedIndex >= items.length) {
      selectedIndex = Math.max(0, items.length - 1);
    }
  });

  return {
    get selectedIndex() { return selectedIndex; },
    set selectedIndex(value: number) { selectedIndex = value; },
    handleKeyDown,
    selectNext: () => {
      const items = options.items();
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
    },
    selectPrev: () => {
      selectedIndex = Math.max(selectedIndex - 1, 0);
    },
    selectFirst: () => {
      selectedIndex = 0;
    },
    selectLast: () => {
      selectedIndex = options.items().length - 1;
    }
  };
}

/**
 * Simple hook to add keyboard event listener
 */
export function useKeyboardListener(handler: (e: KeyboardEvent) => void) {
  onMount(() => {
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  });
}

/**
 * Hook for global navigation shortcuts (g + key)
 */
export function useNavigationShortcuts(goto: (path: string) => void) {
  let waitingForSecondKey = $state(false);
  let timeout: ReturnType<typeof setTimeout>;

  function handleKeyDown(e: KeyboardEvent) {
    // Don't handle if typing in an input
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
      return;
    }

    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (waitingForSecondKey) {
      clearTimeout(timeout);
      waitingForSecondKey = false;

      switch (e.key.toLowerCase()) {
        case 'h':
          e.preventDefault();
          goto('/dashboard');
          break;
        case 'a':
          e.preventDefault();
          goto('/advisors');
          break;
        case 'd':
          e.preventDefault();
          goto('/deadlines');
          break;
        case 'w':
          e.preventDefault();
          goto('/wealth');
          break;
        case 'm':
          e.preventDefault();
          goto('/meetings');
          break;
        case 's':
          e.preventDefault();
          goto('/settings');
          break;
      }
    } else if (e.key === 'g') {
      waitingForSecondKey = true;
      timeout = setTimeout(() => {
        waitingForSecondKey = false;
      }, 500);
    }
  }

  onMount(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  });

  return {
    get waitingForSecondKey() { return waitingForSecondKey; }
  };
}
