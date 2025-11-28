<script lang="ts">
  import { onMount } from 'svelte';
  import { Modal } from '$lib/components/ui';
  import { Command, Keyboard } from 'lucide-svelte';

  interface Props {
    open?: boolean;
    onclose?: () => void;
  }

  let { open = $bindable(false), onclose }: Props = $props();

  const shortcuts = [
    { category: 'Global', items: [
      { keys: ['⌘', 'K'], description: 'Open command palette' },
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: ['Esc'], description: 'Close modal / Cancel' },
    ]},
    { category: 'Navigation (press G then...)', items: [
      { keys: ['G', 'H'], description: 'Go to dashboard (home)' },
      { keys: ['G', 'A'], description: 'Go to advisors' },
      { keys: ['G', 'D'], description: 'Go to deadlines' },
      { keys: ['G', 'W'], description: 'Go to wealth tracker' },
      { keys: ['G', 'M'], description: 'Go to meetings' },
      { keys: ['G', 'S'], description: 'Go to settings' },
    ]},
    { category: 'Lists & Tables', items: [
      { keys: ['↑'], description: 'Move selection up' },
      { keys: ['↓'], description: 'Move selection down' },
      { keys: ['J'], description: 'Move selection down (vim)' },
      { keys: ['K'], description: 'Move selection up (vim)' },
      { keys: ['Enter'], description: 'Open selected item' },
      { keys: ['Home'], description: 'Jump to first item' },
      { keys: ['End'], description: 'Jump to last item' },
    ]},
  ];

  // Listen for ? key to open this modal
  onMount(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        // Don't trigger if typing in an input
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
          return;
        }
        e.preventDefault();
        open = true;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });
</script>

<Modal bind:open title="Keyboard Shortcuts" size="lg" {onclose}>
  <div class="space-y-6">
    {#each shortcuts as section}
      <div>
        <h4 class="text-sm font-semibold text-navy-800 mb-3 flex items-center gap-2">
          <Keyboard class="w-4 h-4" />
          {section.category}
        </h4>
        <div class="space-y-2">
          {#each section.items as shortcut}
            <div class="flex items-center justify-between py-1.5">
              <span class="text-sm text-cream-700">{shortcut.description}</span>
              <div class="flex items-center gap-1">
                {#each shortcut.keys as key}
                  <kbd class="px-2 py-1 bg-cream-100 border border-cream-300 rounded text-xs font-mono text-navy-800">
                    {key}
                  </kbd>
                  {#if shortcut.keys.indexOf(key) < shortcut.keys.length - 1}
                    <span class="text-cream-500">+</span>
                  {/if}
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <div class="mt-6 pt-4 border-t border-cream-200">
    <p class="text-xs text-cream-500 text-center">
      Press <kbd class="px-1.5 py-0.5 bg-cream-100 border border-cream-300 rounded text-xs font-mono">?</kbd> anytime to show this help
    </p>
  </div>
</Modal>
