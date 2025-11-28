<script lang="ts">
  import type { Snippet } from 'svelte';
  import { X } from 'lucide-svelte';
  import { fade, scale } from 'svelte/transition';

  interface Props {
    open?: boolean;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    closeable?: boolean;
    children: Snippet;
    footer?: Snippet;
    onclose?: () => void;
  }

  let {
    open = $bindable(false),
    title,
    size = 'md',
    closeable = true,
    children,
    footer,
    onclose
  }: Props = $props();

  const sizeClasses: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  function handleClose() {
    if (closeable) {
      open = false;
      onclose?.();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && closeable) {
      handleClose();
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/50 backdrop-blur-sm"
    transition:fade={{ duration: 150 }}
    onclick={handleBackdropClick}
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClose(); }}
    role="dialog"
    aria-modal="true"
    aria-labelledby={title ? 'modal-title' : undefined}
    tabindex="-1"
  >
    <!-- Modal -->
    <div
      class="bg-white rounded-xl shadow-soft-lg w-full {sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col"
      transition:scale={{ duration: 150, start: 0.95 }}
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="document"
    >
      <!-- Header -->
      {#if title || closeable}
        <div class="flex items-center justify-between px-6 py-4 border-b border-cream-300">
          {#if title}
            <h2 id="modal-title" class="text-lg font-semibold text-navy-800 font-serif">{title}</h2>
          {:else}
            <div></div>
          {/if}

          {#if closeable}
            <button
              type="button"
              class="p-1.5 rounded-lg text-cream-600 hover:text-navy-800 hover:bg-cream-200 transition-colors"
              onclick={handleClose}
              aria-label="Close"
            >
              <X class="w-5 h-5" />
            </button>
          {/if}
        </div>
      {/if}

      <!-- Content -->
      <div class="p-6 overflow-y-auto">
        {@render children()}
      </div>

      <!-- Footer -->
      {#if footer}
        <div class="px-6 py-4 border-t border-cream-300 bg-cream-100/50 flex items-center justify-end gap-3">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}
