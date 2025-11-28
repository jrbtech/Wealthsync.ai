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
    { category: 'Navigation', items: [
      { keys: ['⌘', 'K'], description: 'Open command palette' },
      { keys: ['G', 'H'], description: 'Go to dashboard' },
      { keys: ['G', 'A'], description: 'Go to advisors' },
      { keys: ['G', 'D'], description: 'Go to deadlines' },
      { keys: ['G', 'W'], description: 'Go to wealth tracker' },
    ]},
    { category: 'Actions', items: [
      { keys: ['N'], description: 'Create new item (context-aware)' },
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: ['Esc'], description: 'Close modal / Cancel' },
    ]},
    { category: 'Lists', items: [
      { keys: ['↑', '↓'], description: 'Navigate list items' },
      { keys: ['Enter'], description: 'Select / Open item' },
      { keys: ['J', 'K'], description: 'Move down / up' },
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
